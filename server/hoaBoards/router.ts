/**
 * Keycove HOA — board-side dues collection (separate subscription from Pro).
 *
 *   board.*   HOA board admins (regular Keycove logins, no Pro needed)
 *   portal.*  homeowners (email one-time code → signed session token)
 *   admin.*   Keycove admins (platform settings such as who pays Stripe's ACH cost)
 *
 * Money flow: destination charges on the platform account with
 * transfer_data.destination = the HOA's Connect Express account. Homeowner
 * ACH is free; card fees are passed through at cost (shared/hoaBoards.ts).
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import crypto, { createHmac, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { sendEmail } from "../_core/email";
import {
  hoaAnnouncements, hoaAssociations, hoaBoardSpecialAssessments, hoaCharges, hoaDocuments,
  hoaHomeownerLogins, hoaHomes, hoaPayments, users, type HoaAssociation, type HoaHome,
} from "../../drizzle/schema";
import {
  addBusinessDays, addDays, cardFeeCents, daysBetween, fmtUsd, homeKey, homeLabel, hoaPlan, HOA_PLANS,
  HOA_TIER_RANK, HOA_TRIAL_DAYS, planForHomeCount, stateRules, validateRosterRow,
  type HoaPlanTier,
} from "../../shared/hoaBoards";
import { googleSheetCsvUrl } from "../../shared/moveIn";
import {
  assessLateFees, createPendingPayment, createSpecialAssessmentCharges, emailShell, esc, generateRecurringCharges,
  hoaDb, inflightChargeIds, markPaymentSucceeded, openCharges, parseAllocations, planAllowsBilling, portalButton,
  receiptNumber, recentPayments, refreshPlanState, remaining, todayYmd,
} from "./ledger";
import { ACH_FEE_BEARER_KEY, APP_URL, getAchFeeBearer, getPlanPriceId, getStripe, HOA_META, setSetting } from "./stripe";
import { paymentBySession, syncCheckoutSessionById } from "./webhook";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const cents = z.number().int().min(0).max(100_000_000);

function requireStripe() {
  const s = getStripe();
  if (!s) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Payments aren't configured yet." });
  return s;
}

function isStripeAccountGone(err: any) {
  const status = err?.raw?.statusCode ?? err?.statusCode;
  return err?.raw?.code === "account_invalid" || status === 403 || status === 404 || /no such account|does not have access/i.test(String(err?.message));
}

// ─── Board access ───────────────────────────────────────────────────────────
async function boardAssoc(user: { id: number; role?: string | null }, associationId: number): Promise<HoaAssociation> {
  const d = await hoaDb();
  const [a] = await d.select().from(hoaAssociations).where(eq(hoaAssociations.id, associationId));
  if (!a || (a.ownerUserId !== user.id && user.role !== "admin")) throw new TRPCError({ code: "NOT_FOUND", message: "HOA not found" });
  return refreshPlanState(a);
}

async function boardHome(a: HoaAssociation, homeId: number): Promise<HoaHome> {
  const d = await hoaDb();
  const [h] = await d.select().from(hoaHomes).where(and(eq(hoaHomes.id, homeId), eq(hoaHomes.associationId, a.id)));
  if (!h) throw new TRPCError({ code: "NOT_FOUND", message: "Home not found" });
  return h;
}

async function activeHomeCount(associationId: number) {
  const d = await hoaDb();
  const [r] = await d.select({ n: sql<number>`count(*)` }).from(hoaHomes).where(and(eq(hoaHomes.associationId, associationId), eq(hoaHomes.active, 1)));
  return Number(r?.n ?? 0);
}

/** On a paid plan, block adding homes beyond the tier's limit (trial: no limit). */
async function assertCapacity(a: HoaAssociation, adding: number) {
  if (adding <= 0 || !a.stripeSubscriptionId) return;
  const plan = hoaPlan(a.planTier);
  const count = await activeHomeCount(a.id);
  if (count + adding > plan.maxHomes) {
    const next = planForHomeCount(count + adding);
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: `Your plan covers up to ${plan.maxHomes} homes and this would make ${count + adding}. Upgrade to the ${next.label} plan under Plan & billing, then try again.`,
    });
  }
}

const profileInput = z.object({
  name: z.string().trim().min(2).max(200),
  legalName: z.string().trim().max(200).optional().nullable(),
  communityType: z.enum(["planned", "condo"]).default("planned"),
  state: z.string().trim().length(2).transform(s => s.toUpperCase()),
  address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  zip: z.string().trim().max(10).optional().nullable(),
  contactEmail: z.string().trim().email().max(320).optional().nullable().or(z.literal("")),
  contactPhone: z.string().trim().max(40).optional().nullable(),
});

const homeInput = z.object({
  lot: z.string().trim().max(40).optional().nullable(),
  unit: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  ownerName: z.string().trim().min(1).max(200),
  email: z.string().trim().max(320).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  mailingAddress: z.string().trim().max(400).optional().nullable(),
  assessmentCents: cents.optional().nullable(),
});

// ─── Homeowner session token (HMAC, separate namespace from tenant tokens) ───
const PORTAL_TTL_MS = 30 * 86_400_000;
const secret = () => process.env.JWT_SECRET || "";
function signPortalToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email.toLowerCase(), ts: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(`hoa:${payload}`).digest("base64url");
  return `${payload}.${sig}`;
}
function verifyPortalToken(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(`hoa:${payload}`).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const v = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof v.e !== "string" || typeof v.ts !== "number" || Date.now() - v.ts > PORTAL_TTL_MS) return null;
    return v.e;
  } catch { return null; }
}
const hashCode = (email: string, code: string) => createHmac("sha256", secret()).update(`hoa-code:${email}:${code}`).digest("hex");

async function portalHomes(token: string) {
  const email = verifyPortalToken(token);
  if (!email) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your sign-in expired. Please sign in again." });
  const d = await hoaDb();
  const homes = await d.select().from(hoaHomes).where(and(sql`LOWER(${hoaHomes.email}) = ${email}`, eq(hoaHomes.active, 1)));
  return { email, homes };
}

async function portalHome(token: string, homeId: number) {
  const { email, homes } = await portalHomes(token);
  const h = homes.find(x => x.id === homeId);
  if (!h) throw new TRPCError({ code: "NOT_FOUND", message: "Home not found" });
  const d = await hoaDb();
  const [a] = await d.select().from(hoaAssociations).where(eq(hoaAssociations.id, h.associationId));
  if (!a) throw new TRPCError({ code: "NOT_FOUND" });
  return { email, h, a };
}

async function ensureHomeCustomer(h: HoaHome, a: HoaAssociation) {
  if (h.stripeCustomerId) return h.stripeCustomerId;
  const stripe = requireStripe();
  const c = await stripe.customers.create({
    email: h.email ?? undefined, name: h.ownerName,
    metadata: { [HOA_META]: "1", hoaHomeId: String(h.id), hoaAssociationId: String(a.id) },
  });
  const d = await hoaDb();
  await d.update(hoaHomes).set({ stripeCustomerId: c.id }).where(eq(hoaHomes.id, h.id));
  return c.id;
}

const achOptions = {
  us_bank_account: {
    financial_connections: { permissions: ["payment_method" as const] },
    verification_method: "automatic" as const,
  },
};

// ─── File uploads (HOA documents) ───────────────────────────────────────────
const UPLOAD_DIR = process.env.NODE_ENV === "production" ? "/data/uploads" : path.join(process.cwd(), "uploads");
const DOC_TYPES: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
function saveDoc(dataUrl: string, filename: string) {
  const m = dataUrl.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
  if (!m) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid file" });
  const ext = DOC_TYPES[m[1].toLowerCase()];
  if (!ext) throw new TRPCError({ code: "BAD_REQUEST", message: "Upload a PDF, JPG, PNG or WEBP file." });
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 7 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "File is too large (7 MB max)." });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const safe = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "hoa-doc";
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}-${safe}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, unique), buf);
  return `/uploads/${unique}`;
}

// ─── Summary for the board dashboard ────────────────────────────────────────
async function boardSummary(a: HoaAssociation) {
  const d = await hoaDb();
  const today = todayYmd();
  const homes = await d.select().from(hoaHomes).where(eq(hoaHomes.associationId, a.id));
  const charges = await d.select().from(hoaCharges).where(eq(hoaCharges.associationId, a.id));
  const payments = await recentPayments({ associationId: a.id }, 5000);
  const inflight = await inflightChargeIds(homes.map(h => h.id));
  const rules = stateRules(a.state);

  const perHome = homes.map(h => {
    const open = charges.filter(c => c.homeId === h.id && c.status === "open" && remaining(c) > 0);
    const balance = open.reduce((s, c) => s + remaining(c), 0);
    const overdue = open.filter(c => !inflight.has(c.id) && addDays(c.dueDate, a.graceDays) < today);
    const oldest = overdue.reduce<string | null>((m, c) => (!m || c.dueDate < m ? c.dueDate : m), null);
    const daysPastDue = oldest ? daysBetween(oldest, today) : 0;
    const unpaidAssessment = overdue.filter(c => c.kind === "assessment" || c.kind === "special");
    const oldestAssessment = unpaidAssessment.reduce<string | null>((m, c) => (!m || c.dueDate < m ? c.dueDate : m), null);
    const assessmentDaysUnpaid = oldestAssessment ? daysBetween(oldestAssessment, today) : 0;
    return {
      homeId: h.id, label: homeLabel(h), ownerName: h.ownerName, email: h.email, active: h.active,
      balanceCents: balance, overdueCents: overdue.reduce((s, c) => s + remaining(c), 0),
      daysPastDue, processing: open.some(c => inflight.has(c.id)), autopay: !!h.autopayEnabled,
      status: overdue.length ? "delinquent" : balance > 0 ? "open" : "paid",
      lienEligible: !!rules.lien && assessmentDaysUnpaid >= rules.lien.minDaysUnpaid,
      assessmentDaysUnpaid,
    };
  });

  // Collections by month (last 12): billed (non-void charges by due month) vs collected (succeeded payments by paid month).
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(); dt.setUTCDate(1); dt.setUTCMonth(dt.getUTCMonth() - i);
    months.push(dt.toISOString().slice(0, 7));
  }
  const ok = payments.filter(p => p.status === "succeeded");
  const collections = months.map(m => ({
    month: m,
    billedCents: charges.filter(c => c.status !== "void" && c.dueDate.startsWith(m)).reduce((s, c) => s + c.amountCents, 0),
    collectedCents: ok.filter(p => (p.paidAt ?? p.createdAt).toISOString().startsWith(m)).reduce((s, p) => s + p.amountCents, 0),
    feesPaidByOwnersCents: ok.filter(p => (p.paidAt ?? p.createdAt).toISOString().startsWith(m)).reduce((s, p) => s + p.feeCents, 0),
  }));
  const active = perHome.filter(h => h.active);
  return {
    homes: perHome,
    totals: {
      activeHomes: active.length,
      paidHomes: active.filter(h => h.status === "paid").length,
      openHomes: active.filter(h => h.status === "open").length,
      delinquentHomes: active.filter(h => h.status === "delinquent").length,
      outstandingCents: active.reduce((s, h) => s + h.balanceCents, 0),
      overdueCents: active.reduce((s, h) => s + h.overdueCents, 0),
      collectedThisMonthCents: collections[collections.length - 1].collectedCents,
      processingCents: payments.filter(p => p.status === "processing").reduce((s, p) => s + p.amountCents, 0),
      autopayHomes: active.filter(h => h.autopay).length,
    },
    collections,
  };
}

// ════════════════════════════════════════════════════════════════════════════
export const hoaBoardsRouter = router({
  // ─── Board ────────────────────────────────────────────────────────────────
  board: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const d = await hoaDb();
      return d.select({ id: hoaAssociations.id, name: hoaAssociations.name, planStatus: hoaAssociations.planStatus })
        .from(hoaAssociations).where(eq(hoaAssociations.ownerUserId, ctx.user.id)).orderBy(hoaAssociations.id);
    }),

    create: protectedProcedure.input(profileInput).mutation(async ({ ctx, input }) => {
      const d = await hoaDb();
      const existing = await d.select({ id: hoaAssociations.id }).from(hoaAssociations).where(eq(hoaAssociations.ownerUserId, ctx.user.id));
      if (existing.length >= 10) throw new TRPCError({ code: "BAD_REQUEST", message: "Contact support to manage more than 10 HOAs." });
      const res = await d.insert(hoaAssociations).values({
        ...input, contactEmail: input.contactEmail || ctx.user.email || null, ownerUserId: ctx.user.id,
        planStatus: "trialing", trialEndsAt: new Date(Date.now() + HOA_TRIAL_DAYS * 86_400_000),
      });
      const id = Number((res as any)[0]?.insertId);
      if (process.env.OWNER_EMAIL) sendEmail({
        to: process.env.OWNER_EMAIL,
        subject: `New Keycove HOA trial: ${input.name} (${input.state})`,
        html: `<p>${esc(ctx.user.name ?? ctx.user.email)} started a Keycove HOA trial for <strong>${esc(input.name)}</strong>, ${esc(input.city ?? "")} ${esc(input.state)}.</p>`,
      }).catch(() => {});
      return { id };
    }),

    get: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const homeCount = await activeHomeCount(a.id);
      return {
        association: a,
        homeCount,
        rules: stateRules(a.state),
        plan: hoaPlan(a.planTier),
        suggestedPlan: planForHomeCount(Math.max(1, homeCount)),
        plans: HOA_PLANS.map(p => ({ ...p, maxHomes: Number.isFinite(p.maxHomes) ? p.maxHomes : null })),
        canBill: planAllowsBilling(a),
        achFeeBearer: await getAchFeeBearer(),
        trialDaysLeft: a.trialEndsAt ? Math.max(0, Math.ceil((a.trialEndsAt.getTime() - Date.now()) / 86_400_000)) : 0,
      };
    }),

    updateProfile: protectedProcedure.input(profileInput.extend({ associationId: z.number().int(), rulesText: z.string().max(50000).optional().nullable() }))
      .mutation(async ({ ctx, input }) => {
        const a = await boardAssoc(ctx.user, input.associationId);
        const { associationId, ...rest } = input;
        const d = await hoaDb();
        await d.update(hoaAssociations).set({ ...rest, contactEmail: rest.contactEmail || null }).where(eq(hoaAssociations.id, a.id));
        return { ok: true };
      }),

    updateBilling: protectedProcedure.input(z.object({
      associationId: z.number().int(),
      assessmentCents: cents,
      assessmentFrequency: z.enum(["monthly", "quarterly", "annual"]),
      firstDueDate: ymd,
      billingEnabled: z.boolean(),
      billAheadDays: z.number().int().min(0).max(60),
      graceDays: z.number().int().min(0).max(60),
      lateFeeEnabled: z.boolean(),
      lateFeeMode: z.enum(["state_max", "flat", "percent"]),
      lateFeeFlatCents: cents,
      lateFeePercent: z.number().int().min(0).max(100),
      reminderDaysBefore: z.number().int().min(0).max(30),
      acceptCards: z.boolean(),
      payoffFeeCents: cents,
      payoffExpediteFeeCents: cents,
    })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const rules = stateRules(a.state);
      if (input.lateFeeEnabled && input.lateFeeMode === "state_max" && !rules.lateFee) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Keycove doesn't have ${a.state} late-fee rules yet. Choose a flat amount or a percentage instead.` });
      }
      if (rules.payoffStatement && (input.payoffFeeCents > rules.payoffStatement.maxFeeCents || input.payoffExpediteFeeCents > rules.payoffStatement.expediteFeeCents)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `${rules.name} caps statement fees at ${fmtUsd(rules.payoffStatement.maxFeeCents)} plus ${fmtUsd(rules.payoffStatement.expediteFeeCents)} to expedite (${rules.payoffStatement.citation}).` });
      }
      const d = await hoaDb();
      const turningOn = input.billingEnabled && !a.billingEnabled;
      await d.update(hoaAssociations).set({
        assessmentCents: input.assessmentCents, assessmentFrequency: input.assessmentFrequency, firstDueDate: input.firstDueDate,
        billingEnabled: input.billingEnabled ? 1 : 0, billAheadDays: input.billAheadDays, graceDays: input.graceDays,
        lateFeeEnabled: input.lateFeeEnabled ? 1 : 0, lateFeeMode: input.lateFeeMode, lateFeeFlatCents: input.lateFeeFlatCents,
        lateFeePercent: input.lateFeePercent, reminderDaysBefore: input.reminderDaysBefore, acceptCards: input.acceptCards ? 1 : 0,
        payoffFeeCents: input.payoffFeeCents, payoffExpediteFeeCents: input.payoffExpediteFeeCents,
        ...(turningOn ? { billingStartedOn: a.billingStartedOn ?? todayYmd() } : {}),
      }).where(eq(hoaAssociations.id, a.id));
      return { ok: true };
    }),

    summary: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      return boardSummary(a);
    }),

    /** Create due charges and late fees now (the daily scheduler does the same). */
    runBilling: protectedProcedure.input(z.object({ associationId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      if (!planAllowsBilling(a)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Your trial ended. Choose a plan to keep billing." });
      const created = await generateRecurringCharges(a);
      const lateFees = await assessLateFees(a);
      return { created, lateFees };
    }),

    // ─── Homes ──────────────────────────────────────────────────────────────
    homes: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const d = await hoaDb();
      return d.select().from(hoaHomes).where(eq(hoaHomes.associationId, a.id)).orderBy(hoaHomes.lot, hoaHomes.unit, hoaHomes.address);
    }),

    saveHome: protectedProcedure.input(homeInput.extend({ associationId: z.number().int(), homeId: z.number().int().optional() }))
      .mutation(async ({ ctx, input }) => {
        const a = await boardAssoc(ctx.user, input.associationId);
        const { associationId, homeId, ...h } = input;
        const errs = validateRosterRow({
          lot: h.lot ?? "", unit: h.unit ?? "", address: h.address ?? "", ownerName: h.ownerName,
          email: (h.email ?? "").toLowerCase(), phone: h.phone ?? "", assessmentCents: h.assessmentCents ?? null, mailingAddress: h.mailingAddress ?? "",
        });
        if (errs.length) throw new TRPCError({ code: "BAD_REQUEST", message: errs.join("; ") });
        const d = await hoaDb();
        const values = { ...h, email: h.email ? h.email.toLowerCase() : null, homeKey: homeKey(h) };
        if (homeId) {
          await boardHome(a, homeId);
          await d.update(hoaHomes).set(values).where(eq(hoaHomes.id, homeId));
          return { id: homeId };
        }
        await assertCapacity(a, 1);
        try {
          const res = await d.insert(hoaHomes).values({ ...values, associationId: a.id, billingStartsOn: todayYmd() });
          return { id: Number((res as any)[0]?.insertId) };
        } catch (e: any) {
          if (/Duplicate/i.test(String(e?.message ?? e?.cause?.message))) throw new TRPCError({ code: "CONFLICT", message: "A home with that lot/unit/address already exists." });
          throw e;
        }
      }),

    setHomeActive: protectedProcedure.input(z.object({ associationId: z.number().int(), homeId: z.number().int(), active: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const a = await boardAssoc(ctx.user, input.associationId);
        const h = await boardHome(a, input.homeId);
        if (input.active && !h.active) await assertCapacity(a, 1);
        const d = await hoaDb();
        await d.update(hoaHomes).set({ active: input.active ? 1 : 0, ...(input.active ? {} : { autopayEnabled: 0 }) }).where(eq(hoaHomes.id, h.id));
        return { ok: true };
      }),

    /** Roster import (from the import wizard). Upserts on lot/unit/address. */
    importRoster: protectedProcedure.input(z.object({
      associationId: z.number().int(),
      rows: z.array(z.object({
        lot: z.string().max(40), unit: z.string().max(40), address: z.string().max(300), ownerName: z.string().max(200),
        email: z.string().max(320), phone: z.string().max(40), assessmentCents: z.number().int().nullable(), mailingAddress: z.string().max(400),
      })).max(2000),
    })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const d = await hoaDb();
      const existing = await d.select().from(hoaHomes).where(eq(hoaHomes.associationId, a.id));
      const byKey = new Map(existing.map(h => [h.homeKey, h]));
      const errors: { row: number; message: string }[] = [];
      const seen = new Set<string>();
      let created = 0, updated = 0;
      const toCreate: (typeof hoaHomes.$inferInsert)[] = [];
      const toUpdate: { id: number; values: Partial<typeof hoaHomes.$inferInsert> }[] = [];
      input.rows.forEach((r, i) => {
        const errs = validateRosterRow(r);
        if (errs.length) { errors.push({ row: i + 1, message: errs.join("; ") }); return; }
        const key = homeKey(r);
        if (seen.has(key)) { errors.push({ row: i + 1, message: "Duplicate of an earlier row (same lot/unit/address)" }); return; }
        seen.add(key);
        const values = {
          lot: r.lot || null, unit: r.unit || null, address: r.address || null, ownerName: r.ownerName,
          email: r.email ? r.email.toLowerCase() : null, phone: r.phone || null, mailingAddress: r.mailingAddress || null,
          ...(r.assessmentCents != null ? { assessmentCents: r.assessmentCents } : {}),
        };
        const ex = byKey.get(key);
        if (ex) { updated++; toUpdate.push({ id: ex.id, values }); }
        else toCreate.push({ ...values, homeKey: key, associationId: a.id, billingStartsOn: todayYmd() });
      });
      const reactivated = existing.filter(h => !h.active && seen.has(h.homeKey)).length;
      await assertCapacity(a, toCreate.length + reactivated);
      for (const u of toUpdate) await d.update(hoaHomes).set({ ...u.values, active: 1 }).where(eq(hoaHomes.id, u.id));
      for (let i = 0; i < toCreate.length; i += 500) {
        await d.insert(hoaHomes).values(toCreate.slice(i, i + 500));
        created += toCreate.slice(i, i + 500).length;
      }
      return { created, updated, errors };
    }),

    fetchGoogleSheet: protectedProcedure.input(z.object({ url: z.string().max(2000) })).mutation(async ({ input }) => {
      const csvUrl = googleSheetCsvUrl(input.url);
      if (!csvUrl) throw new TRPCError({ code: "BAD_REQUEST", message: "Paste a docs.google.com/spreadsheets link." });
      const res = await fetch(csvUrl, { redirect: "follow" });
      if (!res.ok || (res.headers.get("content-type") ?? "").includes("text/html")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Couldn't open that sheet. In Google Sheets, click Share → General access → \"Anyone with the link\", then try again." });
      }
      const text = await res.text();
      if (text.length > 5 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "That sheet is too large (5 MB max)." });
      return { csv: text };
    }),

    sendInvites: protectedProcedure.input(z.object({ associationId: z.number().int(), homeIds: z.array(z.number().int()).optional(), onlyNew: z.boolean().default(true) }))
      .mutation(async ({ ctx, input }) => {
        const a = await boardAssoc(ctx.user, input.associationId);
        const d = await hoaDb();
        let homes = await d.select().from(hoaHomes).where(and(eq(hoaHomes.associationId, a.id), eq(hoaHomes.active, 1)));
        if (input.homeIds?.length) homes = homes.filter(h => input.homeIds!.includes(h.id));
        else if (input.onlyNew) homes = homes.filter(h => !h.inviteSentAt);
        let sent = 0, skipped = 0;
        for (const h of homes) {
          if (!h.email) { skipped++; continue; }
          const ok = await sendEmail({
            to: h.email, replyTo: a.contactEmail ?? undefined,
            subject: `${a.name} now takes dues online`,
            html: emailShell(a, "Pay your HOA dues online", `
              <p>Hi ${esc(h.ownerName)},</p>
              <p>${esc(a.name)} now collects dues through Keycove. In your homeowner portal you can:</p>
              <ul>
                <li>Pay from your bank account for <strong>free</strong>, or by card (the card processor's fee is passed through at cost)</li>
                <li>Turn on autopay so you never miss a due date</li>
                <li>See your balance, payment history and receipts</li>
                <li>Read HOA documents, rules and announcements</li>
              </ul>
              <p>Sign in with this email address (${esc(h.email)}); we'll send you a one-time code. No password needed.</p>
              ${portalButton(h.email, "Open my homeowner portal")}`),
          });
          if (ok) { sent++; await d.update(hoaHomes).set({ inviteSentAt: new Date() }).where(eq(hoaHomes.id, h.id)); }
          else skipped++;
        }
        return { sent, skipped };
      }),

    // ─── Charges ────────────────────────────────────────────────────────────
    charges: protectedProcedure.input(z.object({ associationId: z.number().int(), homeId: z.number().int().optional(), status: z.enum(["open", "all"]).default("all") }))
      .query(async ({ ctx, input }) => {
        const a = await boardAssoc(ctx.user, input.associationId);
        const d = await hoaDb();
        const conds = [eq(hoaCharges.associationId, a.id)];
        if (input.homeId) conds.push(eq(hoaCharges.homeId, input.homeId));
        if (input.status === "open") conds.push(eq(hoaCharges.status, "open"));
        return d.select().from(hoaCharges).where(and(...conds)).orderBy(desc(hoaCharges.dueDate), desc(hoaCharges.id)).limit(5000);
      }),

    addCharge: protectedProcedure.input(z.object({
      associationId: z.number().int(), homeId: z.number().int(),
      kind: z.enum(["fine", "other", "late_fee"]), description: z.string().trim().min(2).max(300), amountCents: cents.refine(v => v > 0), dueDate: ymd,
      hearingHeld: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      await boardHome(a, input.homeId);
      const rules = stateRules(a.state);
      if (input.kind === "fine" && rules.fines && !input.hearingHeld) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `In ${rules.name}, a fine needs notice and a hearing first (${rules.fines.citation}). Confirm the hearing was held.` });
      }
      if (input.kind === "fine" && rules.fines && input.amountCents > rules.fines.maxPerDayCents) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `${rules.name} caps fines at ${fmtUsd(rules.fines.maxPerDayCents)} per violation/day (${rules.fines.citation}).` });
      }
      const d = await hoaDb();
      await d.insert(hoaCharges).values({
        associationId: a.id, homeId: input.homeId, kind: input.kind, description: input.description,
        periodKey: `manual-${crypto.randomBytes(8).toString("hex")}`, amountCents: input.amountCents, dueDate: input.dueDate,
      });
      return { ok: true };
    }),

    voidCharge: protectedProcedure.input(z.object({ associationId: z.number().int(), chargeId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const d = await hoaDb();
      const [c] = await d.select().from(hoaCharges).where(and(eq(hoaCharges.id, input.chargeId), eq(hoaCharges.associationId, a.id)));
      if (!c) throw new TRPCError({ code: "NOT_FOUND" });
      if (c.paidCents > 0) throw new TRPCError({ code: "BAD_REQUEST", message: "This charge has payments applied. Refund in Stripe first, or add a credit instead." });
      if ((await inflightChargeIds([c.homeId])).has(c.id)) throw new TRPCError({ code: "BAD_REQUEST", message: "A payment for this charge is still processing." });
      await d.update(hoaCharges).set({ status: "void" }).where(eq(hoaCharges.id, c.id));
      return { ok: true };
    }),

    specialAssessments: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const d = await hoaDb();
      return d.select().from(hoaBoardSpecialAssessments).where(eq(hoaBoardSpecialAssessments.associationId, a.id)).orderBy(desc(hoaBoardSpecialAssessments.id));
    }),

    createSpecialAssessment: protectedProcedure.input(z.object({
      associationId: z.number().int(), title: z.string().trim().min(2).max(200), description: z.string().max(5000).optional().nullable(),
      amountCents: cents.refine(v => v > 0), dueDate: ymd, notify: z.boolean().default(true),
    })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      if (!planAllowsBilling(a)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Your trial ended. Choose a plan to keep billing." });
      const d = await hoaDb();
      const res = await d.insert(hoaBoardSpecialAssessments).values({
        associationId: a.id, title: input.title, description: input.description ?? null, amountCents: input.amountCents, dueDate: input.dueDate,
      });
      const id = Number((res as any)[0]?.insertId);
      const created = await createSpecialAssessmentCharges(a, { id, title: input.title, amountCents: input.amountCents, dueDate: input.dueDate });
      let emailed = 0;
      if (input.notify) {
        const homes = await d.select().from(hoaHomes).where(and(eq(hoaHomes.associationId, a.id), eq(hoaHomes.active, 1)));
        for (const h of homes) {
          if (!h.email) continue;
          const ok = await sendEmail({
            to: h.email, replyTo: a.contactEmail ?? undefined,
            subject: `Special assessment: ${input.title} — ${a.name}`,
            html: emailShell(a, `Special assessment: ${input.title}`, `
              <p>Hi ${esc(h.ownerName)},</p>
              <p>The board approved a special assessment of <strong>${fmtUsd(input.amountCents)}</strong> per home, due <strong>${esc(input.dueDate)}</strong>.</p>
              ${input.description ? `<p style="white-space:pre-wrap">${esc(input.description)}</p>` : ""}
              ${portalButton(h.email, "View and pay")}`),
          });
          if (ok) emailed++;
        }
      }
      return { id, created, emailed };
    }),

    // ─── Payments ───────────────────────────────────────────────────────────
    payments: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const rows = await recentPayments({ associationId: a.id }, 5000);
      return rows.map(p => ({ ...p, receiptNumber: receiptNumber(p) }));
    }),

    /** Check / cash / other payment received outside Keycove. Applied oldest charge first. */
    recordPayment: protectedProcedure.input(z.object({
      associationId: z.number().int(), homeId: z.number().int(), amountCents: cents.refine(v => v > 0),
      method: z.enum(["check", "cash", "other"]), reference: z.string().trim().max(120).optional().nullable(), paidOn: ymd,
    })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const h = await boardHome(a, input.homeId);
      const inflight = await inflightChargeIds([h.id]);
      let left = input.amountCents;
      const allocations: { chargeId: number; cents: number }[] = [];
      for (const c of (await openCharges([h.id])).filter(c => !inflight.has(c.id))) {
        if (left <= 0) break;
        const take = Math.min(left, remaining(c));
        allocations.push({ chargeId: c.id, cents: take });
        left -= take;
      }
      if (left > 0) throw new TRPCError({ code: "BAD_REQUEST", message: `That's ${fmtUsd(left)} more than this home owes. Record the exact amount, or add the charge first.` });
      const d = await hoaDb();
      const res = await d.insert(hoaPayments).values({
        associationId: a.id, homeId: h.id, amountCents: input.amountCents, feeCents: 0, totalCents: input.amountCents,
        method: input.method, source: "manual", status: "pending", allocations: JSON.stringify(allocations),
        reference: input.reference ?? null, recordedByUserId: ctx.user.id,
      });
      const id = Number((res as any)[0]?.insertId);
      await markPaymentSucceeded(id);
      await d.update(hoaPayments).set({ paidAt: new Date(`${input.paidOn}T12:00:00Z`) }).where(eq(hoaPayments.id, id));
      return { id };
    }),

    // ─── Payoff / resale statement ─────────────────────────────────────────
    payoffStatement: protectedProcedure.input(z.object({
      associationId: z.number().int(), homeId: z.number().int(), requestedOn: ymd, closingDate: ymd.optional().nullable(),
      expedite: z.boolean().default(false), billFeeToOwner: z.boolean().default(false),
    })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const h = await boardHome(a, input.homeId);
      const rules = stateRules(a.state);
      const ps = rules.payoffStatement;
      if (input.expedite && ps && input.closingDate) {
        const hours = daysBetween(input.requestedOn, input.closingDate) * 24;
        if (hours > ps.expediteWindowHours) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `${rules.name} allows the expedite fee only when the request comes within ${ps.expediteWindowHours} hours of closing (${ps.citation}).` });
        }
      }
      const fee = Math.min(a.payoffFeeCents, ps?.maxFeeCents ?? a.payoffFeeCents);
      const expediteFee = input.expedite ? Math.min(a.payoffExpediteFeeCents, ps?.expediteFeeCents ?? a.payoffExpediteFeeCents) : 0;
      const d = await hoaDb();
      if (input.billFeeToOwner && fee + expediteFee > 0) {
        await d.insert(hoaCharges).values({
          associationId: a.id, homeId: h.id, kind: "payoff_fee",
          description: `Statement of unpaid assessments${input.expedite ? " (expedited)" : ""} — requested ${input.requestedOn}`,
          periodKey: `payoff-${input.requestedOn}-${crypto.randomBytes(4).toString("hex")}`, amountCents: fee + expediteFee, dueDate: input.requestedOn,
        });
      }
      const open = await openCharges([h.id]);
      const inflight = await inflightChargeIds([h.id]);
      return {
        association: { name: a.name, legalName: a.legalName, address: [a.address, a.city, a.state, a.zip].filter(Boolean).join(", "), contactEmail: a.contactEmail, contactPhone: a.contactPhone },
        home: { label: homeLabel(h), ownerName: h.ownerName, address: h.address, mailingAddress: h.mailingAddress },
        asOf: todayYmd(),
        requestedOn: input.requestedOn,
        closingDate: input.closingDate ?? null,
        dueBy: ps ? addBusinessDays(input.requestedOn, ps.dueBusinessDays) : null,
        regularAssessment: { amountCents: h.assessmentCents ?? a.assessmentCents, frequency: a.assessmentFrequency },
        items: open.map(c => ({ description: c.description, dueDate: c.dueDate, amountCents: remaining(c), processing: inflight.has(c.id) })),
        totalCents: open.reduce((s, c) => s + remaining(c), 0),
        feeCents: fee, expediteFeeCents: expediteFee, feeBilledToOwner: input.billFeeToOwner,
        citation: ps?.citation ?? null,
      };
    }),

    // ─── Stripe Connect (the HOA's bank account) ───────────────────────────
    connectLink: protectedProcedure.input(z.object({ associationId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const stripe = requireStripe();
      const d = await hoaDb();
      let accountId = a.stripeConnectAccountId;
      if (accountId) {
        try { await stripe.accounts.retrieve(accountId); } catch (e: any) {
          if (!isStripeAccountGone(e)) throw e;
          accountId = null;
        }
      }
      if (!accountId) {
        const acct = await stripe.accounts.create({
          type: "express",
          country: "US",
          email: a.contactEmail ?? ctx.user.email ?? undefined,
          capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
          business_profile: { name: (a.legalName || a.name).slice(0, 100), product_description: "Homeowners association dues and assessments collected from members." },
          metadata: { [HOA_META]: "1", keycoveHoaAssociationId: String(a.id) },
        });
        accountId = acct.id;
        await d.update(hoaAssociations).set({ stripeConnectAccountId: accountId, connectStatus: "pending" }).where(eq(hoaAssociations.id, a.id));
      }
      const link = await stripe.accountLinks.create({
        account: accountId, type: "account_onboarding",
        refresh_url: `${APP_URL()}/hoa-board?connect=refresh`, return_url: `${APP_URL()}/hoa-board?connect=done`,
      });
      return { url: link.url };
    }),

    connectStatus: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      if (!a.stripeConnectAccountId) return { status: "not_connected" as const };
      const stripe = getStripe();
      if (!stripe) return { status: a.connectStatus };
      const d = await hoaDb();
      try {
        const acct = await stripe.accounts.retrieve(a.stripeConnectAccountId);
        const status = acct.charges_enabled && acct.payouts_enabled ? "active" as const : "pending" as const;
        if (status !== a.connectStatus) await d.update(hoaAssociations).set({ connectStatus: status }).where(eq(hoaAssociations.id, a.id));
        const bank = acct.external_accounts?.data?.find((x: any) => x.object === "bank_account") as any;
        return {
          status, chargesEnabled: acct.charges_enabled, payoutsEnabled: acct.payouts_enabled,
          requirementsDue: acct.requirements?.currently_due?.length ?? 0,
          bank: bank ? { bankName: bank.bank_name, last4: bank.last4 } : null,
          payoutSchedule: acct.settings?.payouts?.schedule?.interval ?? null,
        };
      } catch (e: any) {
        if (isStripeAccountGone(e)) {
          await d.update(hoaAssociations).set({ stripeConnectAccountId: null, connectStatus: "not_connected" }).where(eq(hoaAssociations.id, a.id));
          return { status: "not_connected" as const };
        }
        return { status: a.connectStatus };
      }
    }),

    payouts: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const stripe = getStripe();
      if (!stripe || !a.stripeConnectAccountId || a.connectStatus !== "active") return { available: 0, pending: 0, payouts: [] };
      try {
        const [bal, list] = await Promise.all([
          stripe.balance.retrieve({ stripeAccount: a.stripeConnectAccountId }),
          stripe.payouts.list({ limit: 20 }, { stripeAccount: a.stripeConnectAccountId }),
        ]);
        const usd = (arr: { currency: string; amount: number }[]) => arr.filter(x => x.currency === "usd").reduce((s, x) => s + x.amount, 0);
        return {
          available: usd(bal.available), pending: usd(bal.pending),
          payouts: list.data.map(p => ({ id: p.id, amount: p.amount, status: p.status, arrivalDate: new Date(p.arrival_date * 1000).toISOString().slice(0, 10) })),
        };
      } catch (e: any) {
        console.warn("[hoaBoards] payouts failed", e?.message);
        return { available: 0, pending: 0, payouts: [] };
      }
    }),

    stripeDashboardLink: protectedProcedure.input(z.object({ associationId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      if (!a.stripeConnectAccountId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Connect the HOA's bank first." });
      const link = await requireStripe().accounts.createLoginLink(a.stripeConnectAccountId);
      return { url: link.url };
    }),

    // ─── Keycove HOA plan ───────────────────────────────────────────────────
    planCheckout: protectedProcedure.input(z.object({ associationId: z.number().int(), interval: z.enum(["month", "year"]) }))
      .mutation(async ({ ctx, input }) => {
        const a = await boardAssoc(ctx.user, input.associationId);
        if (a.stripeSubscriptionId && a.planStatus !== "cancelled") throw new TRPCError({ code: "BAD_REQUEST", message: "You already have a plan. Use Change plan instead." });
        const stripe = requireStripe();
        const tier = planForHomeCount(Math.max(1, await activeHomeCount(a.id))).tier;
        const price = await getPlanPriceId(tier, input.interval);
        let customer = a.stripeCustomerId;
        if (!customer) {
          customer = (await stripe.customers.create({
            email: a.contactEmail ?? ctx.user.email ?? undefined, name: a.legalName || a.name,
            metadata: { [HOA_META]: "1", keycoveHoaAssociationId: String(a.id) },
          })).id;
          const d = await hoaDb();
          await d.update(hoaAssociations).set({ stripeCustomerId: customer }).where(eq(hoaAssociations.id, a.id));
        }
        const trialEnd = a.trialEndsAt && a.trialEndsAt.getTime() > Date.now() + 2 * 86_400_000 ? Math.floor(a.trialEndsAt.getTime() / 1000) : undefined;
        const meta = { [HOA_META]: "1", keycoveHoaAssociationId: String(a.id) };
        const session = await stripe.checkout.sessions.create({
          mode: "subscription", customer,
          line_items: [{ price, quantity: 1 }],
          allow_promotion_codes: true,
          payment_method_collection: "always",
          subscription_data: { ...(trialEnd ? { trial_end: trialEnd } : {}), metadata: meta, description: `Keycove HOA — ${a.name}` },
          metadata: meta,
          success_url: `${APP_URL()}/hoa-board?plan=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL()}/hoa-board?plan=cancelled`,
        });
        return { url: session.url };
      }),

    planConfirm: protectedProcedure.input(z.object({ associationId: z.number().int(), sessionId: z.string().max(255) })).mutation(async ({ ctx, input }) => {
      await boardAssoc(ctx.user, input.associationId);
      await syncCheckoutSessionById(input.sessionId);
      return { ok: true };
    }),

    changePlan: protectedProcedure.input(z.object({ associationId: z.number().int(), tier: z.enum(["t50", "t150", "t500", "unlimited"]), interval: z.enum(["month", "year"]) }))
      .mutation(async ({ ctx, input }) => {
        const a = await boardAssoc(ctx.user, input.associationId);
        if (!a.stripeSubscriptionId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Choose a plan first." });
        const count = await activeHomeCount(a.id);
        const target = hoaPlan(input.tier as HoaPlanTier);
        if (count > target.maxHomes) throw new TRPCError({ code: "BAD_REQUEST", message: `You have ${count} active homes; the ${target.label} plan covers ${target.maxHomes}.` });
        const stripe = requireStripe();
        const sub = await stripe.subscriptions.retrieve(a.stripeSubscriptionId);
        const price = await getPlanPriceId(input.tier as HoaPlanTier, input.interval);
        const upgrade = HOA_TIER_RANK[input.tier as HoaPlanTier] > HOA_TIER_RANK[a.planTier] || (input.interval === "year" && a.billingInterval === "month");
        const updated = await stripe.subscriptions.update(sub.id, {
          items: [{ id: sub.items.data[0].id, price }],
          proration_behavior: upgrade ? "always_invoice" : "create_prorations",
        });
        const { syncPlanSubscription } = await import("./webhook");
        await syncPlanSubscription(updated);
        return { ok: true };
      }),

    billingPortal: protectedProcedure.input(z.object({ associationId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      if (!a.stripeCustomerId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Choose a plan first." });
      const stripe = requireStripe();
      const return_url = `${APP_URL()}/hoa-board?tab=plan`;
      try {
        return { url: (await stripe.billingPortal.sessions.create({ customer: a.stripeCustomerId, return_url })).url };
      } catch (e: any) {
        if (!/configuration/i.test(String(e?.message))) throw e;
        // No default portal configuration on this Stripe account yet: create a minimal one.
        const cfg = await stripe.billingPortal.configurations.create({
          business_profile: { headline: "Keycove billing" },
          features: {
            payment_method_update: { enabled: true },
            invoice_history: { enabled: true },
            customer_update: { enabled: true, allowed_updates: ["email", "address"] },
            subscription_cancel: { enabled: true, mode: "at_period_end" },
          },
        });
        return { url: (await stripe.billingPortal.sessions.create({ customer: a.stripeCustomerId, return_url, configuration: cfg.id })).url };
      }
    }),

    // ─── Announcements & documents ─────────────────────────────────────────
    announcements: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const d = await hoaDb();
      return d.select().from(hoaAnnouncements).where(eq(hoaAnnouncements.associationId, a.id)).orderBy(desc(hoaAnnouncements.id)).limit(100);
    }),

    postAnnouncement: protectedProcedure.input(z.object({ associationId: z.number().int(), title: z.string().trim().min(2).max(200), body: z.string().trim().min(2).max(10000), email: z.boolean().default(true) }))
      .mutation(async ({ ctx, input }) => {
        const a = await boardAssoc(ctx.user, input.associationId);
        const d = await hoaDb();
        let emailed = 0;
        if (input.email) {
          const homes = await d.select().from(hoaHomes).where(and(eq(hoaHomes.associationId, a.id), eq(hoaHomes.active, 1)));
          const emails = Array.from(new Set(homes.map(h => h.email).filter(Boolean) as string[]));
          for (const e of emails) {
            const ok = await sendEmail({
              to: e, replyTo: a.contactEmail ?? undefined, subject: `${a.name}: ${input.title}`,
              html: emailShell(a, input.title, `<div style="white-space:pre-wrap;line-height:1.6">${esc(input.body)}</div>${portalButton(e, "Open the homeowner portal")}`),
            });
            if (ok) emailed++;
          }
        }
        await d.insert(hoaAnnouncements).values({ associationId: a.id, title: input.title, body: input.body, emailedCount: emailed });
        return { emailed };
      }),

    documents: protectedProcedure.input(z.object({ associationId: z.number().int() })).query(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const d = await hoaDb();
      return d.select().from(hoaDocuments).where(eq(hoaDocuments.associationId, a.id)).orderBy(desc(hoaDocuments.id));
    }),

    uploadDocument: protectedProcedure.input(z.object({
      associationId: z.number().int(), name: z.string().trim().min(1).max(200), category: z.enum(["declaration", "bylaws", "rules", "minutes", "budget", "forms", "other"]),
      filename: z.string().max(200), dataUrl: z.string().max(10_000_000),
    })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const url = saveDoc(input.dataUrl, input.filename);
      const d = await hoaDb();
      await d.insert(hoaDocuments).values({ associationId: a.id, name: input.name, category: input.category, url });
      return { url };
    }),

    removeDocument: protectedProcedure.input(z.object({ associationId: z.number().int(), documentId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const a = await boardAssoc(ctx.user, input.associationId);
      const d = await hoaDb();
      await d.delete(hoaDocuments).where(and(eq(hoaDocuments.id, input.documentId), eq(hoaDocuments.associationId, a.id)));
      return { ok: true };
    }),
  }),

  // ─── Homeowner portal ─────────────────────────────────────────────────────
  portal: router({
    requestCode: publicProcedure.input(z.object({ email: z.string().trim().email().max(320) })).mutation(async ({ input }) => {
      const email = input.email.toLowerCase();
      const d = await hoaDb();
      const homes = await d.select({ id: hoaHomes.id, associationId: hoaHomes.associationId }).from(hoaHomes)
        .where(and(sql`LOWER(${hoaHomes.email}) = ${email}`, eq(hoaHomes.active, 1)));
      // Same response either way so the form can't be used to test which emails are on a roster.
      if (!homes.length) return { sent: true };
      const [existing] = await d.select().from(hoaHomeownerLogins).where(eq(hoaHomeownerLogins.email, email));
      if (existing?.expiresAt && existing.expiresAt.getTime() - Date.now() > 14 * 60_000) return { sent: true }; // one code per minute
      const code = String(crypto.randomInt(100000, 1000000));
      const values = { codeHash: hashCode(email, code), expiresAt: new Date(Date.now() + 15 * 60_000), attempts: 0 };
      await d.insert(hoaHomeownerLogins).values({ email, ...values }).onDuplicateKeyUpdate({ set: values });
      const [a] = await d.select().from(hoaAssociations).where(eq(hoaAssociations.id, homes[0].associationId));
      await sendEmail({
        to: email,
        subject: `Your sign-in code: ${code}`,
        html: emailShell(a ?? { name: "Keycove HOA" }, "Your homeowner portal code", `
          <p>Enter this code to sign in. It expires in 15 minutes.</p>
          <p style="font-size:32px;font-weight:800;letter-spacing:6px;color:#1B2B5E">${code}</p>
          <p style="color:#6b7280;font-size:13px">If you didn't ask for this, you can ignore this email.</p>`),
      });
      return { sent: true };
    }),

    verifyCode: publicProcedure.input(z.object({ email: z.string().trim().email().max(320), code: z.string().trim().regex(/^\d{6}$/) })).mutation(async ({ input }) => {
      const email = input.email.toLowerCase();
      const d = await hoaDb();
      const [row] = await d.select().from(hoaHomeownerLogins).where(eq(hoaHomeownerLogins.email, email));
      const bad = () => new TRPCError({ code: "UNAUTHORIZED", message: "That code is wrong or expired. Request a new one." });
      if (!row?.codeHash || !row.expiresAt || row.expiresAt.getTime() < Date.now() || row.attempts >= 5) throw bad();
      const a = Buffer.from(row.codeHash), b = Buffer.from(hashCode(email, input.code));
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        await d.update(hoaHomeownerLogins).set({ attempts: row.attempts + 1 }).where(eq(hoaHomeownerLogins.id, row.id));
        throw bad();
      }
      await d.update(hoaHomeownerLogins).set({ codeHash: null, expiresAt: null, attempts: 0 }).where(eq(hoaHomeownerLogins.id, row.id));
      return { token: signPortalToken(email) };
    }),

    data: publicProcedure.input(z.object({ token: z.string().max(1000) })).query(async ({ input }) => {
      const { email, homes } = await portalHomes(input.token);
      const d = await hoaDb();
      const assocIds = Array.from(new Set(homes.map(h => h.associationId)));
      const assocs = assocIds.length ? await d.select().from(hoaAssociations).where(inArray(hoaAssociations.id, assocIds)) : [];
      const open = await openCharges(homes.map(h => h.id));
      const inflight = await inflightChargeIds(homes.map(h => h.id));
      const payments = await recentPayments({ homeIds: homes.map(h => h.id) }, 200);
      const announcements = assocIds.length ? await d.select().from(hoaAnnouncements).where(inArray(hoaAnnouncements.associationId, assocIds)).orderBy(desc(hoaAnnouncements.id)).limit(30) : [];
      const documents = assocIds.length ? await d.select().from(hoaDocuments).where(inArray(hoaDocuments.associationId, assocIds)).orderBy(desc(hoaDocuments.id)) : [];
      return {
        email,
        homes: homes.map(h => {
          const a = assocs.find(x => x.id === h.associationId)!;
          const mine = open.filter(c => c.homeId === h.id);
          const payable = mine.filter(c => !inflight.has(c.id));
          const payableCents = payable.reduce((s, c) => s + remaining(c), 0);
          return {
            id: h.id, label: homeLabel(h), ownerName: h.ownerName,
            association: {
              id: a.id, name: a.name, contactEmail: a.contactEmail, contactPhone: a.contactPhone, rulesText: a.rulesText,
              acceptCards: !!a.acceptCards, canPay: a.connectStatus === "active" && !!a.stripeConnectAccountId,
              assessmentCents: h.assessmentCents ?? a.assessmentCents, assessmentFrequency: a.assessmentFrequency,
            },
            autopay: { enabled: !!h.autopayEnabled, method: h.autopayMethod, label: h.paymentMethodLabel },
            charges: mine.map(c => ({ id: c.id, kind: c.kind, description: c.description, dueDate: c.dueDate, amountCents: remaining(c), processing: inflight.has(c.id) })),
            balanceCents: mine.reduce((s, c) => s + remaining(c), 0),
            payableCents,
            cardFeeCents: cardFeeCents(payableCents),
            payments: payments.filter(p => p.homeId === h.id && p.status !== "pending" && p.status !== "canceled").map(p => ({
              id: p.id, receiptNumber: receiptNumber(p), amountCents: p.amountCents, feeCents: p.feeCents, totalCents: p.totalCents,
              method: p.method, status: p.status, failureReason: p.failureReason, date: (p.paidAt ?? p.createdAt).toISOString().slice(0, 10), source: p.source,
            })),
          };
        }),
        announcements: announcements.map(x => ({ ...x, associationName: assocs.find(a => a.id === x.associationId)?.name ?? "" })),
        documents: documents.map(x => ({ id: x.id, name: x.name, category: x.category, url: x.url, associationName: assocs.find(a => a.id === x.associationId)?.name ?? "", createdAt: x.createdAt })),
      };
    }),

    /** Pay the open balance by bank (free) or card (fee at cost) through Stripe Checkout. */
    checkout: publicProcedure.input(z.object({ token: z.string().max(1000), homeId: z.number().int(), method: z.enum(["ach", "card"]), enableAutopay: z.boolean().default(false) }))
      .mutation(async ({ input }) => {
        const { h, a } = await portalHome(input.token, input.homeId);
        if (a.connectStatus !== "active" || !a.stripeConnectAccountId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `${a.name} hasn't finished connecting its bank yet.` });
        if (input.method === "card" && !a.acceptCards) throw new TRPCError({ code: "BAD_REQUEST", message: "This HOA accepts bank payments only." });
        const stripe = requireStripe();
        const customer = await ensureHomeCustomer(h, a);
        const pending = await createPendingPayment({ a, h, method: input.method, source: "portal" });
        if (!pending) throw new TRPCError({ code: "BAD_REQUEST", message: "Nothing to pay right now." });
        const p = pending.payment;
        const meta = { [HOA_META]: "1", hoaPaymentId: String(p.id), hoaHomeId: String(h.id), hoaAssociationId: String(a.id), ...(input.enableAutopay ? { hoaAutopay: "1" } : {}) };
        const lineItems: any[] = [{ price_data: { currency: "usd", product_data: { name: `${a.name} — dues and charges`, description: homeLabel(h).slice(0, 200) || undefined }, unit_amount: p.amountCents }, quantity: 1 }];
        if (p.feeCents > 0) lineItems.push({ price_data: { currency: "usd", product_data: { name: "Card processing fee (passed through at cost)" }, unit_amount: p.feeCents }, quantity: 1 });
        const session = await stripe.checkout.sessions.create({
          mode: "payment", customer,
          payment_method_types: [input.method === "ach" ? "us_bank_account" : "card"],
          ...(input.method === "ach" ? { payment_method_options: achOptions } : {}),
          line_items: lineItems,
          payment_intent_data: {
            transfer_data: { destination: a.stripeConnectAccountId },
            ...(p.applicationFeeCents > 0 ? { application_fee_amount: p.applicationFeeCents } : {}),
            ...(input.enableAutopay ? { setup_future_usage: "off_session" as const } : {}),
            description: `${a.name} — ${homeLabel(h)}`.slice(0, 200),
            metadata: meta,
          },
          metadata: meta,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          success_url: `${APP_URL()}/hoa-portal?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL()}/hoa-portal?checkout=cancelled`,
        }, { idempotencyKey: `hoa-checkout-${p.id}` });
        const d = await hoaDb();
        await d.update(hoaPayments).set({ stripeCheckoutSessionId: session.id }).where(eq(hoaPayments.id, p.id));
        return { url: session.url };
      }),

    /** Save a bank account or card for autopay (no charge now). */
    setupAutopay: publicProcedure.input(z.object({ token: z.string().max(1000), homeId: z.number().int(), method: z.enum(["ach", "card"]) }))
      .mutation(async ({ input }) => {
        const { h, a } = await portalHome(input.token, input.homeId);
        if (a.connectStatus !== "active") throw new TRPCError({ code: "PRECONDITION_FAILED", message: `${a.name} hasn't finished connecting its bank yet.` });
        if (input.method === "card" && !a.acceptCards) throw new TRPCError({ code: "BAD_REQUEST", message: "This HOA accepts bank payments only." });
        const stripe = requireStripe();
        const customer = await ensureHomeCustomer(h, a);
        const meta = { [HOA_META]: "1", hoaHomeId: String(h.id), hoaAssociationId: String(a.id) };
        const session = await stripe.checkout.sessions.create({
          mode: "setup", customer, currency: "usd",
          payment_method_types: [input.method === "ach" ? "us_bank_account" : "card"],
          ...(input.method === "ach" ? { payment_method_options: achOptions } : {}),
          setup_intent_data: { metadata: meta, description: `Autopay for ${a.name} — ${homeLabel(h)}`.slice(0, 200) },
          metadata: meta,
          success_url: `${APP_URL()}/hoa-portal?autopay=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL()}/hoa-portal?autopay=cancelled`,
        });
        return { url: session.url };
      }),

    disableAutopay: publicProcedure.input(z.object({ token: z.string().max(1000), homeId: z.number().int() })).mutation(async ({ input }) => {
      const { h } = await portalHome(input.token, input.homeId);
      const d = await hoaDb();
      await d.update(hoaHomes).set({ autopayEnabled: 0 }).where(eq(hoaHomes.id, h.id));
      return { ok: true };
    }),

    /** Return page: pull the Checkout result now in case the webhook hasn't landed yet. */
    confirmReturn: publicProcedure.input(z.object({ token: z.string().max(1000), sessionId: z.string().max(255) })).mutation(async ({ input }) => {
      const { homes } = await portalHomes(input.token);
      const stripe = requireStripe();
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      if (session.metadata?.[HOA_META] !== "1" || !homes.some(h => String(h.id) === session.metadata?.hoaHomeId)) throw new TRPCError({ code: "NOT_FOUND" });
      await syncCheckoutSessionById(input.sessionId);
      const p = await paymentBySession(input.sessionId);
      const status: string = session.mode === "setup" ? "autopay" : p?.status ?? "unknown";
      return { status };
    }),

    receipt: publicProcedure.input(z.object({ token: z.string().max(1000), paymentId: z.number().int() })).query(async ({ input }) => {
      const { homes } = await portalHomes(input.token);
      const d = await hoaDb();
      const [p] = await d.select().from(hoaPayments).where(eq(hoaPayments.id, input.paymentId));
      const h = p && homes.find(x => x.id === p.homeId);
      if (!p || !h || p.status === "pending" || p.status === "canceled") throw new TRPCError({ code: "NOT_FOUND" });
      const [a] = await d.select().from(hoaAssociations).where(eq(hoaAssociations.id, p.associationId));
      const allocs = parseAllocations(p);
      const charges = allocs.length ? await d.select().from(hoaCharges).where(inArray(hoaCharges.id, allocs.map(x => x.chargeId))) : [];
      return {
        receiptNumber: receiptNumber(p), status: p.status, method: p.method, reference: p.reference,
        date: (p.paidAt ?? p.createdAt).toISOString().slice(0, 10),
        association: { name: a?.name ?? "", address: [a?.address, a?.city, a?.state, a?.zip].filter(Boolean).join(", "), contactEmail: a?.contactEmail },
        home: { label: homeLabel(h), ownerName: h.ownerName },
        lines: allocs.map(x => ({ description: charges.find(c => c.id === x.chargeId)?.description ?? "Charge", cents: x.cents })),
        amountCents: p.amountCents, feeCents: p.feeCents, totalCents: p.totalCents,
      };
    }),
  }),

  // ─── Keycove admin ────────────────────────────────────────────────────────
  admin: router({
    overview: adminProcedure.query(async () => {
      const d = await hoaDb();
      const assocs = await d.select({
        id: hoaAssociations.id, name: hoaAssociations.name, state: hoaAssociations.state, planTier: hoaAssociations.planTier,
        billingInterval: hoaAssociations.billingInterval, planStatus: hoaAssociations.planStatus, connectStatus: hoaAssociations.connectStatus,
        trialEndsAt: hoaAssociations.trialEndsAt, ownerEmail: users.email, createdAt: hoaAssociations.createdAt,
      }).from(hoaAssociations).leftJoin(users, eq(users.id, hoaAssociations.ownerUserId)).orderBy(desc(hoaAssociations.id));
      const counts = await d.select({ associationId: hoaHomes.associationId, n: sql<number>`count(*)` }).from(hoaHomes).where(eq(hoaHomes.active, 1)).groupBy(hoaHomes.associationId);
      const vol = await d.select({
        method: hoaPayments.method, n: sql<number>`count(*)`, amount: sql<number>`coalesce(sum(${hoaPayments.amountCents}),0)`, appFees: sql<number>`coalesce(sum(${hoaPayments.applicationFeeCents}),0)`,
      }).from(hoaPayments).where(eq(hoaPayments.status, "succeeded")).groupBy(hoaPayments.method);
      return {
        achFeeBearer: await getAchFeeBearer(),
        associations: assocs.map(a => ({ ...a, homes: Number(counts.find(c => c.associationId === a.id)?.n ?? 0) })),
        volume: vol.map(v => ({ method: v.method, count: Number(v.n), amountCents: Number(v.amount), applicationFeeCents: Number(v.appFees) })),
      };
    }),

    setAchFeeBearer: adminProcedure.input(z.object({ bearer: z.enum(["hoa", "keycove"]) })).mutation(async ({ input }) => {
      await setSetting(ACH_FEE_BEARER_KEY, input.bearer);
      return { achFeeBearer: input.bearer };
    }),
  }),
});
