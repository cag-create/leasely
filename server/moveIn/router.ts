/**
 * "Move to Keycove" — one importer for properties, units, tenants (optional),
 * leases and HOA details. Re-runs upsert on normalized address + unit, so
 * importing the same file twice doesn't create duplicates.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getDb, getUserSubscription, createCrmProperty, createCrmTenant, createCrmLease, updateCrmProperty, updateCrmTenant,
  createLeaseAgreement, getTenantByEmail, createTenantAccount,
} from "../db";
import { crmLeases, crmProperties, crmTenants, leaseAgreements, propertyHoas } from "../../drizzle/schema";
import { TARGET_FIELDS, googleSheetCsvUrl, propertyKey, splitStoredAddress, validateRow, type ImportRow, type TargetField } from "@shared/moveIn";

const VALID_TYPES = ["single_family", "multi_family", "apartment", "condo", "townhouse", "co_living", "commercial", "other"] as const;
const MAX_SHEET_BYTES = 5 * 1024 * 1024;

const rowSchema = z.object({
  building: z.string().max(200).optional(),
  address: z.string().trim().min(1).max(300),
  unit: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip: z.string().max(20).optional(),
  propertyType: z.string().max(40).optional(),
  tenantFirstName: z.string().max(100).optional(),
  tenantLastName: z.string().max(100).optional(),
  tenantEmail: z.string().max(320).optional(),
  tenantPhone: z.string().max(30).optional(),
  monthlyRentCents: z.number().int().nonnegative().optional(),
  securityDepositCents: z.number().int().nonnegative().optional(),
  leaseStart: z.string().max(10).optional(),
  leaseEnd: z.string().max(10).optional(),
  rentDueDay: z.number().int().min(1).max(28).optional(),
  lateFeeCents: z.number().int().nonnegative().optional(),
  graceDays: z.number().int().min(0).max(31).optional(),
  hoaName: z.string().max(200).optional(),
  hoaDuesCents: z.number().int().nonnegative().optional(),
  hoaFrequency: z.enum(["monthly", "quarterly", "semiannual", "annual"]).optional(),
  hoaNextDue: z.string().max(10).optional(),
  hoaPortalUrl: z.string().max(2000).optional(),
});

function propertyTypeOf(raw?: string) {
  const t = (raw || "").toLowerCase().replace(/[-\s]/g, "_");
  if (["co_living", "coliving", "room", "room_rental"].includes(t)) return "co_living";
  return (VALID_TYPES as readonly string[]).includes(t) ? t : "apartment";
}

async function requirePro(userId: number) {
  const sub = await getUserSubscription(userId);
  if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Importing requires a Pro subscription." });
}

export const moveInRouter = router({
  /** Fetch a Google Sheet shared as "anyone with the link" as CSV text. */
  fetchGoogleSheet: protectedProcedure.input(z.object({ url: z.string().max(2000) })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const csvUrl = googleSheetCsvUrl(input.url);
    if (!csvUrl) throw new TRPCError({ code: "BAD_REQUEST", message: "Paste a docs.google.com/spreadsheets link." });
    const res = await fetch(csvUrl, { redirect: "follow" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || type.includes("text/html")) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Couldn't open that sheet. In Google Sheets, click Share → General access → \"Anyone with the link\", then try again." });
    }
    const text = await res.text();
    if (text.length > MAX_SHEET_BYTES) throw new TRPCError({ code: "BAD_REQUEST", message: "That sheet is too large (5 MB max)." });
    return { csv: text };
  }),

  /**
   * Suggest fields for headers the alias table didn't recognise. Only header
   * names and a coarse type per column are sent — never tenant data.
   */
  suggestMapping: protectedProcedure.input(z.object({
    source: z.string().max(40),
    columns: z.array(z.object({ header: z.string().max(120), type: z.string().max(10) })).max(80),
    taken: z.array(z.string()).max(40),
  })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const key = process.env.OPENAI_API_KEY;
    if (!key || !input.columns.length) return { suggestions: {} as Record<string, TargetField | ""> };
    const fields = TARGET_FIELDS.filter(f => !input.taken.includes(f.key));
    const schema = z.object({
      matches: z.array(z.object({ header: z.string(), field: z.string().describe("A field key from the list, or empty string if none fits") })),
    });
    try {
      const { object } = await generateObject({
        model: createOpenAI({ apiKey: key })("gpt-4o-mini"),
        schema,
        maxRetries: 1,
        prompt: `A landlord is importing a ${input.source} export into property-management software. Match each spreadsheet column to at most one field. Use "" when unsure. Each field can be used once.

Fields (key — meaning):
${fields.map(f => `${f.key} — ${f.label}`).join("\n")}

Columns (header — detected value type):
${input.columns.map(c => `${c.header} — ${c.type}`).join("\n")}`,
      });
      const allowed = new Set(fields.map(f => f.key as string));
      const used = new Set<string>();
      const suggestions: Record<string, TargetField | ""> = {};
      for (const m of object.matches) {
        if (!input.columns.some(c => c.header === m.header)) continue;
        if (m.field && allowed.has(m.field) && !used.has(m.field)) { suggestions[m.header] = m.field as TargetField; used.add(m.field); }
      }
      return { suggestions };
    } catch (e: any) {
      console.warn("[moveIn.suggestMapping] AI failed:", e?.message);
      return { suggestions: {} };
    }
  }),

  /** Import up to 500 rows (the wizard batches larger files). */
  importRows: protectedProcedure.input(z.object({
    source: z.string().max(40),
    setUpRentCollection: z.boolean().default(true),
    rows: z.array(rowSchema).min(1).max(500),
  })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const d = await getDb();
    if (!d) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const uid = ctx.user.id;

    // Existing state for upserts.
    const props = await d.select().from(crmProperties).where(eq(crmProperties.userId, uid));
    const propByKey = new Map<string, number>();
    for (const p of props) { const s = splitStoredAddress(p.address); propByKey.set(propertyKey(s.address, s.unit), p.id); }
    const tenants = await d.select().from(crmTenants).where(eq(crmTenants.userId, uid));
    const leases = await d.select().from(crmLeases).where(eq(crmLeases.userId, uid));
    const agreements = await d.select({ id: leaseAgreements.id, tenantEmail: leaseAgreements.tenantEmail, propertyAddress: leaseAgreements.propertyAddress, leaseStartDate: leaseAgreements.leaseStartDate })
      .from(leaseAgreements).where(eq(leaseAgreements.landlordUserId, uid));
    const hoas = await d.select().from(propertyHoas).where(eq(propertyHoas.userId, uid));

    const out = {
      propertiesCreated: 0, propertiesUpdated: 0, tenantsCreated: 0, tenantsUpdated: 0,
      leasesCreated: 0, leasesExisting: 0, rentCollectionSetUp: 0, hoasSaved: 0,
      errors: [] as { row: number; message: string }[],
    };

    for (let i = 0; i < input.rows.length; i++) {
      const r = input.rows[i] as ImportRow;
      const problems = validateRow(r);
      if (problems.length) { out.errors.push({ row: i + 1, message: problems.join("; ") }); continue; }
      try {
        const type = propertyTypeOf(r.propertyType);
        const isRoom = type === "co_living";
        const unit = r.unit?.trim() ?? "";
        const base = r.address.trim();
        const fullAddress = unit ? (isRoom ? `${base} · Rm ${unit}` : `${base} #${unit}`) : base;
        const key = propertyKey(base, unit);

        // 1. Property (one CRM property per unit, matching the existing model).
        let propertyId = propByKey.get(key);
        const propFields = {
          city: r.city || undefined, state: r.state || undefined, zip: r.zip || undefined,
          ...(r.building ? { notes: `${isRoom ? "Co-living" : "Building"}: ${r.building}` } : {}),
        };
        if (propertyId) {
          await updateCrmProperty(propertyId, uid, { ...propFields, ...(r.tenantFirstName ? { status: "active" as const } : {}) });
          out.propertiesUpdated++;
        } else {
          propertyId = await createCrmProperty({
            userId: uid, address: fullAddress, propertyType: type as any, totalUnits: 1,
            status: r.tenantFirstName ? "active" : "vacant", ...propFields,
          } as any);
          propByKey.set(key, propertyId);
          out.propertiesCreated++;
        }

        // 2. Tenant (optional — vacant units stop here).
        let tenantId: number | undefined;
        if (r.tenantFirstName) {
          const first = r.tenantFirstName.trim(), last = (r.tenantLastName ?? "").trim();
          const match = tenants.find(t => t.crmPropertyId === propertyId && (
            (r.tenantEmail && t.email?.toLowerCase() === r.tenantEmail) ||
            (t.firstName.toLowerCase() === first.toLowerCase() && t.lastName.toLowerCase() === last.toLowerCase())
          ));
          const tenantFields = {
            email: r.tenantEmail || undefined, phone: r.tenantPhone || undefined,
            moveInDate: r.leaseStart, monthlyRent: r.monthlyRentCents, securityDeposit: r.securityDepositCents,
          };
          if (match) {
            await updateCrmTenant(match.id, uid, tenantFields as any);
            tenantId = match.id;
            out.tenantsUpdated++;
          } else {
            tenantId = await createCrmTenant({ userId: uid, crmPropertyId: propertyId, firstName: first, lastName: last, status: "active", ...tenantFields } as any);
            tenants.push({ id: tenantId, crmPropertyId: propertyId, firstName: first, lastName: last, email: r.tenantEmail ?? null } as any);
            out.tenantsCreated++;
          }

          // 3. Lease (skip if this tenant already has one starting that day).
          const existingLease = leases.find(l => l.crmTenantId === tenantId && l.startDate === r.leaseStart);
          if (existingLease) {
            out.leasesExisting++;
          } else {
            const hasEnd = !!r.leaseEnd;
            const leaseId = await createCrmLease({
              userId: uid, crmPropertyId: propertyId, crmTenantId: tenantId, startDate: r.leaseStart!,
              endDate: hasEnd ? r.leaseEnd! : r.leaseStart!, monthlyRent: r.monthlyRentCents!, securityDeposit: r.securityDepositCents,
              lateFeeCents: r.lateFeeCents ?? 0, lateFeeGraceDays: r.graceDays ?? 5,
              leaseType: hasEnd ? "fixed_term" : "month_to_month", status: "active",
            } as any);
            leases.push({ id: leaseId, crmTenantId: tenantId, startDate: r.leaseStart } as any);
            out.leasesCreated++;
          }

          // 4. Rent collection: an active lease agreement + tenant portal
          //    (needs email + state), same as the old Leases importer.
          if (input.setUpRentCollection && r.tenantEmail && r.state && r.monthlyRentCents && r.leaseStart) {
            const already = agreements.some(a => a.tenantEmail.toLowerCase() === r.tenantEmail && a.leaseStartDate === r.leaseStart
              && propertyKey(splitStoredAddress(a.propertyAddress).address, splitStoredAddress(a.propertyAddress).unit) === key);
            if (!already) {
              const now = new Date();
              const agreementId = await createLeaseAgreement({
                landlordUserId: uid,
                tenantName: `${first} ${last}`.trim(),
                tenantEmail: r.tenantEmail,
                tenantPhone: r.tenantPhone,
                state: r.state,
                propertyAddress: fullAddress,
                monthlyRent: r.monthlyRentCents,
                securityDeposit: r.securityDepositCents ?? 0,
                leaseStartDate: r.leaseStart,
                leaseEndDate: r.leaseEnd,
                rentDueDay: r.rentDueDay ?? 1,
                status: "active",
                tenantSignedAt: now, landlordSignedAt: now, signedAt: now,
                tenantSignatureName: `Imported from ${input.source}`,
                landlordSignatureName: `Imported from ${input.source}`,
                firstMonthPaid: 1,
                depositPaid: r.securityDepositCents ? 1 : 0,
                notes: `Imported on ${now.toISOString().slice(0, 10)} from ${input.source} via Move to Keycove.`,
              } as any);
              agreements.push({ id: agreementId, tenantEmail: r.tenantEmail, propertyAddress: fullAddress, leaseStartDate: r.leaseStart });
              try {
                if (!(await getTenantByEmail(r.tenantEmail))) {
                  await createTenantAccount({
                    landlordUserId: uid, leaseId: agreementId, name: `${first} ${last}`.trim(), email: r.tenantEmail,
                    phone: r.tenantPhone, monthlyRentCents: r.monthlyRentCents,
                    leaseStart: new Date(`${r.leaseStart}T12:00:00Z`),
                    leaseEnd: r.leaseEnd ? new Date(`${r.leaseEnd}T12:00:00Z`) : undefined,
                  } as any);
                }
              } catch (err) {
                console.warn("[moveIn] tenant portal provision failed:", err);
              }
              out.rentCollectionSetUp++;
            }
          }
        }

        // 5. HOA (upsert per property).
        if (r.hoaName) {
          const existing = hoas.find(h => h.crmPropertyId === propertyId);
          const values = {
            hoaName: r.hoaName,
            ...(r.hoaDuesCents != null ? { duesAmount: r.hoaDuesCents } : {}),
            ...(r.hoaFrequency ? { frequency: r.hoaFrequency } : {}),
            ...(r.hoaNextDue ? { nextDueDate: r.hoaNextDue } : {}),
            ...(r.hoaPortalUrl ? { portalUrl: r.hoaPortalUrl } : {}),
          };
          if (existing) {
            await d.update(propertyHoas).set(values).where(and(eq(propertyHoas.id, existing.id), eq(propertyHoas.userId, uid)));
          } else {
            const res: any = await d.insert(propertyHoas).values({ userId: uid, crmPropertyId: propertyId, ...values });
            hoas.push({ id: Number(res?.[0]?.insertId ?? res?.insertId), crmPropertyId: propertyId } as any);
          }
          out.hoasSaved++;
        }
      } catch (e: any) {
        out.errors.push({ row: i + 1, message: e?.message ?? "Import failed" });
      }
    }
    return out;
  }),
});
