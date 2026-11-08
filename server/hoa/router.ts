/**
 * HOA dues tracking for landlords (Pro). Keycove records each property's HOA,
 * reminds the landlord before dues are due, logs payments to Accounting as
 * `hoa_dues` expenses, and reads HOA statements with AI to prefill the form.
 * Paying the HOA itself happens on the HOA's own portal (portalUrl).
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq, inArray, like } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { protectedProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";
import { getDb, getUserSubscription, createAccountingEntry } from "../db";
import { accountingEntries, crmProperties, hoaSpecialAssessments, propertyHoas } from "../../drizzle/schema";
import { advanceDueDate, annualDuesCents, toLast4, type HoaFrequency } from "./logic";

const UPLOAD_DIR = process.env.NODE_ENV === "production" ? "/data/uploads" : path.join(process.cwd(), "uploads");
const DOC_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_DOC_BYTES = 7 * 1024 * 1024; // keeps the base64 body under the 10mb JSON limit

const frequency = z.enum(["monthly", "quarterly", "semiannual", "annual"]);
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

async function requirePro(userId: number) {
  const sub = await getUserSubscription(userId);
  if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "HOA dues tracking is a Pro feature." });
}

async function db() {
  const d = await getDb();
  if (!d) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return d;
}

async function ownedHoa(userId: number, id: number) {
  const d = await db();
  const [row] = await d.select().from(propertyHoas).where(and(eq(propertyHoas.id, id), eq(propertyHoas.userId, userId)));
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "HOA not found" });
  return row;
}

async function ownedProperty(userId: number, crmPropertyId: number) {
  const d = await db();
  const [p] = await d.select().from(crmProperties).where(and(eq(crmProperties.id, crmPropertyId), eq(crmProperties.userId, userId)));
  if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
  return p;
}

function propertyLabel(p: { address: string; city: string | null; state: string | null }) {
  return [p.address, p.city, p.state].filter(Boolean).join(", ");
}

/** Decode + store a data URL in the uploads volume; returns its relative URL. */
function saveDataUrl(dataUrl: string, filename: string): { url: string; mimeType: string; buffer: Buffer } {
  const m = dataUrl.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
  if (!m) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid file" });
  const mimeType = m[1].toLowerCase();
  const ext = DOC_TYPES[mimeType];
  if (!ext) throw new TRPCError({ code: "BAD_REQUEST", message: "Upload a PDF, JPG, PNG or WEBP file." });
  const buffer = Buffer.from(m[2], "base64");
  if (buffer.length > MAX_DOC_BYTES) throw new TRPCError({ code: "BAD_REQUEST", message: "File is too large (7 MB max)." });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const safe = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "hoa-doc";
  const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safe}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, unique), buffer);
  return { url: `/uploads/${unique}`, mimeType, buffer };
}

function parseDocs(raw: string | null): { name: string; url: string; uploadedAt: string }[] {
  try { const v = JSON.parse(raw ?? "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
}

const hoaInput = z.object({
  crmPropertyId: z.number().int().positive(),
  hoaName: z.string().trim().min(1).max(200),
  managementCompany: z.string().trim().max(200).optional().nullable(),
  contactName: z.string().trim().max(200).optional().nullable(),
  contactEmail: z.string().trim().max(320).optional().nullable(),
  contactPhone: z.string().trim().max(40).optional().nullable(),
  portalUrl: z.string().trim().max(2000).optional().nullable(),
  accountNumber: z.string().trim().max(64).optional().nullable(), // reduced to last 4 before storage
  duesAmount: z.number().int().min(0), // cents
  frequency,
  nextDueDate: ymd.optional().nullable(),
  autopay: z.boolean().default(false),
  passThroughToTenant: z.boolean().default(false),
  reminderDaysBefore: z.number().int().min(0).max(60).default(7),
  rulesText: z.string().max(20000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const StatementSchema = z.object({
  hoaName: z.string().nullable().describe("Name of the homeowners association"),
  managementCompany: z.string().nullable().describe("Management company, if different from the HOA"),
  amountDue: z.number().nullable().describe("Regular dues amount due on this statement, in dollars (exclude past-due balances and special assessments)"),
  dueDate: z.string().nullable().describe("Due date as YYYY-MM-DD"),
  frequency: frequency.nullable().describe("How often regular dues are billed, if stated or obvious"),
  accountLast4: z.string().nullable().describe("Last 4 digits of the account number only"),
  portalUrl: z.string().nullable().describe("Website where the owner pays or logs in"),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  specialAssessment: z.object({ description: z.string(), amount: z.number(), dueDate: z.string().nullable() }).nullable()
    .describe("A one-time special assessment on the statement, if any (amount in dollars)"),
});

export const hoaRouter = router({
  list: protectedProcedure.input(z.object({ year: z.number().int().optional() }).optional()).query(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const d = await db();
    const hoas = await d.select().from(propertyHoas).where(eq(propertyHoas.userId, ctx.user.id));
    const props = await d.select().from(crmProperties).where(eq(crmProperties.userId, ctx.user.id));
    const ids = hoas.map(h => h.id);
    const assessments = ids.length
      ? await d.select().from(hoaSpecialAssessments).where(and(eq(hoaSpecialAssessments.userId, ctx.user.id), inArray(hoaSpecialAssessments.propertyHoaId, ids)))
      : [];
    const year = input?.year ?? new Date().getFullYear();
    const paid = await d.select().from(accountingEntries).where(and(
      eq(accountingEntries.userId, ctx.user.id),
      eq(accountingEntries.category, "hoa_dues"),
      like(accountingEntries.date, `${year}-%`),
    ));
    const propById = new Map(props.map(p => [p.id, p]));
    return {
      year,
      hoas: hoas.map(h => {
        const p = propById.get(h.crmPropertyId);
        return {
          ...h,
          autopay: !!h.autopay,
          passThroughToTenant: !!h.passThroughToTenant,
          documents: parseDocs(h.documents),
          propertyAddress: p ? propertyLabel(p) : "(deleted property)",
          annualDues: annualDuesCents(h.duesAmount, h.frequency as HoaFrequency),
          paidThisYear: paid.filter(e => e.crmPropertyId === h.crmPropertyId).reduce((s, e) => s + e.amount, 0),
          assessments: assessments.filter(a => a.propertyHoaId === h.id),
        };
      }),
      properties: props.map(p => ({ id: p.id, label: propertyLabel(p), hasHoa: hoas.some(h => h.crmPropertyId === p.id) })),
    };
  }),

  upsert: protectedProcedure.input(hoaInput.extend({
    id: z.number().int().positive().optional(),
    // Statement already stored by extractStatement — attach it as a document.
    attachStatement: z.object({ url: z.string().regex(/^\/uploads\/[\w.-]+$/), name: z.string().max(200) }).optional(),
  })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    await ownedProperty(ctx.user.id, input.crmPropertyId);
    const d = await db();
    const { id, accountNumber, autopay, passThroughToTenant, attachStatement, ...rest } = input;
    const statementDoc = attachStatement ? [{ ...attachStatement, uploadedAt: new Date().toISOString() }] : [];
    const values = {
      ...rest,
      autopay: autopay ? 1 : 0,
      passThroughToTenant: passThroughToTenant ? 1 : 0,
      ...(accountNumber !== undefined ? { accountLast4: toLast4(accountNumber) } : {}),
    };
    if (id) {
      const existing = await ownedHoa(ctx.user.id, id);
      // A new due date restarts the reminder cycle.
      const resetReminder = values.nextDueDate !== existing.nextDueDate ? { lastReminderForDueDate: null } : {};
      const docs = statementDoc.length ? { documents: JSON.stringify([...parseDocs(existing.documents), ...statementDoc]) } : {};
      await d.update(propertyHoas).set({ ...values, ...resetReminder, ...docs }).where(eq(propertyHoas.id, id));
      return { id };
    }
    const [dup] = await d.select().from(propertyHoas).where(eq(propertyHoas.crmPropertyId, input.crmPropertyId));
    if (dup) throw new TRPCError({ code: "CONFLICT", message: "This property already has an HOA. Edit it instead." });
    const res: any = await d.insert(propertyHoas).values({ ...values, userId: ctx.user.id, documents: JSON.stringify(statementDoc) });
    return { id: Number(res?.[0]?.insertId ?? res?.insertId) };
  }),

  remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    await ownedHoa(ctx.user.id, input.id);
    const d = await db();
    await d.delete(hoaSpecialAssessments).where(eq(hoaSpecialAssessments.propertyHoaId, input.id));
    await d.delete(propertyHoas).where(eq(propertyHoas.id, input.id));
    return { success: true };
  }),

  /** Log a dues payment: Accounting expense + roll the due date forward. */
  markPaid: protectedProcedure.input(z.object({
    id: z.number().int().positive(),
    paidDate: ymd.optional(),
    amount: z.number().int().positive().optional(), // cents; defaults to the regular dues
  })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const h = await ownedHoa(ctx.user.id, input.id);
    const p = await ownedProperty(ctx.user.id, h.crmPropertyId);
    const amount = input.amount ?? h.duesAmount;
    if (!amount) throw new TRPCError({ code: "BAD_REQUEST", message: "Set the dues amount first." });
    const paidDate = input.paidDate ?? new Date().toISOString().slice(0, 10);
    const entryId = await createAccountingEntry({
      userId: ctx.user.id,
      crmPropertyId: p.id,
      propertyAddress: propertyLabel(p),
      type: "expense",
      category: "hoa_dues",
      amount,
      date: paidDate,
      description: `HOA dues — ${h.hoaName}${h.nextDueDate ? ` (due ${h.nextDueDate})` : ""}`,
    });
    const next = h.nextDueDate ? advanceDueDate(h.nextDueDate, h.frequency as HoaFrequency) : null;
    const d = await db();
    await d.update(propertyHoas).set({ nextDueDate: next, lastReminderForDueDate: null }).where(eq(propertyHoas.id, h.id));
    return { accountingEntryId: entryId, nextDueDate: next };
  }),

  addAssessment: protectedProcedure.input(z.object({
    propertyHoaId: z.number().int().positive(),
    description: z.string().trim().min(1).max(300),
    amount: z.number().int().positive(),
    dueDate: ymd,
  })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    await ownedHoa(ctx.user.id, input.propertyHoaId);
    const d = await db();
    const res: any = await d.insert(hoaSpecialAssessments).values({ ...input, userId: ctx.user.id });
    return { id: Number(res?.[0]?.insertId ?? res?.insertId) };
  }),

  markAssessmentPaid: protectedProcedure.input(z.object({ id: z.number().int().positive(), paidDate: ymd.optional() })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const d = await db();
    const [a] = await d.select().from(hoaSpecialAssessments).where(and(eq(hoaSpecialAssessments.id, input.id), eq(hoaSpecialAssessments.userId, ctx.user.id)));
    if (!a) throw new TRPCError({ code: "NOT_FOUND" });
    if (a.paidAt) return { accountingEntryId: a.accountingEntryId };
    const h = await ownedHoa(ctx.user.id, a.propertyHoaId);
    const p = await ownedProperty(ctx.user.id, h.crmPropertyId);
    const paidDate = input.paidDate ?? new Date().toISOString().slice(0, 10);
    const entryId = await createAccountingEntry({
      userId: ctx.user.id,
      crmPropertyId: p.id,
      propertyAddress: propertyLabel(p),
      type: "expense",
      category: "hoa_dues",
      amount: a.amount,
      date: paidDate,
      description: `HOA special assessment — ${h.hoaName}: ${a.description}`,
    });
    await d.update(hoaSpecialAssessments).set({ paidAt: paidDate, accountingEntryId: entryId }).where(eq(hoaSpecialAssessments.id, a.id));
    return { accountingEntryId: entryId };
  }),

  removeAssessment: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const d = await db();
    await d.delete(hoaSpecialAssessments).where(and(eq(hoaSpecialAssessments.id, input.id), eq(hoaSpecialAssessments.userId, ctx.user.id)));
    return { success: true };
  }),

  uploadDocument: protectedProcedure.input(z.object({
    propertyHoaId: z.number().int().positive(),
    filename: z.string().max(200),
    dataUrl: z.string(),
  })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const h = await ownedHoa(ctx.user.id, input.propertyHoaId);
    const { url } = saveDataUrl(input.dataUrl, input.filename);
    const docs = [...parseDocs(h.documents), { name: input.filename.slice(0, 200), url, uploadedAt: new Date().toISOString() }];
    const d = await db();
    await d.update(propertyHoas).set({ documents: JSON.stringify(docs) }).where(eq(propertyHoas.id, h.id));
    return { url };
  }),

  removeDocument: protectedProcedure.input(z.object({ propertyHoaId: z.number().int().positive(), url: z.string() })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const h = await ownedHoa(ctx.user.id, input.propertyHoaId);
    const docs = parseDocs(h.documents).filter(x => x.url !== input.url);
    const d = await db();
    await d.update(propertyHoas).set({ documents: JSON.stringify(docs) }).where(eq(propertyHoas.id, h.id));
    return { success: true };
  }),

  /** Read an HOA statement (PDF or photo) and return fields to prefill. */
  extractStatement: protectedProcedure.input(z.object({ filename: z.string().max(200), dataUrl: z.string() })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx.user.id);
    const { url, mimeType, buffer } = saveDataUrl(input.dataUrl, input.filename);
    const openaiKey = process.env.OPENAI_API_KEY ?? "";
    if (!openaiKey && !ENV.anthropicApiKey) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "AI is not configured on this server." });
    }
    const model = openaiKey
      ? createOpenAI({ apiKey: openaiKey })("gpt-4o")
      : createAnthropic({ apiKey: ENV.anthropicApiKey })("claude-sonnet-4-6");
    const filePart = mimeType === "application/pdf"
      ? { type: "file" as const, data: buffer, mediaType: mimeType, filename: input.filename }
      : { type: "image" as const, image: buffer, mediaType: mimeType };
    try {
      const { object } = await generateObject({
        model,
        schema: StatementSchema,
        maxRetries: 1,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: `Extract the HOA billing details from this statement. Today is ${new Date().toISOString().slice(0, 10)}. Use null for anything not shown. Never return more than the last 4 digits of any account number.` },
            filePart,
          ],
        }],
      });
      return {
        url,
        fields: {
          ...object,
          accountLast4: toLast4(object.accountLast4),
          amountDueCents: object.amountDue != null ? Math.round(object.amountDue * 100) : null,
          dueDate: object.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(object.dueDate) ? object.dueDate : null,
        },
      };
    } catch (e: any) {
      console.error("[hoa.extractStatement] failed:", e?.message);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't read that statement. Try a clearer photo or a PDF, or enter the details by hand." });
    }
  }),
});
