/**
 * Owner / trust accounting for property-management brokerages (`trust.*`),
 * plus the owner portal (`trust.ownerPortal.*`).
 *
 * Money flow for a managed property: tenant pays → Stripe destination charge
 * to the BROKERAGE's Connect account → Stripe pays out to the brokerage's
 * trust bank account → receipt posted to the trust journal and the owner's
 * ledger → fees accrue → owner paid from trust (ACH/check) → monthly
 * three-way reconciliation and owner statement.
 *
 * Every procedure accepts an optional `bookUserId` so brokerage staff can act
 * on the brokerage's books with the trust permissions it granted them.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import crypto from "crypto";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { sendEmail } from "../_core/email";
import { createPropertyManagerAccess, getUserById, getUserSubscription } from "../db";
import {
  crmProperties, crmTenants, propertyManagerAccess, trustAccounts, trustApprovals, trustFeeAccruals, trustJournalEntries,
  trustLedgerEntries, trustManagementAgreements, trustOwnerDocuments, trustOwnerStatements, trustOwners, trustReconciliations,
  trustSecurityDeposits, trustStaffPermissions, users,
} from "../../drizzle/schema";
import { booksFor, planAllows, requireBook, trustPlan } from "./access";
import {
  accrueOneTimeFee, agreementBalances, closeSecurityDeposit, db, depositBalance, disburseToOwner, getAgreement,
  agreementContext, payAccruedFees, payExpense, post, recordReceipt, reverseJournalEntry,
} from "./service";
import { rulesFor, supportedStates } from "./stateRules";
import { complianceFor } from "./compliance";
import { addBankingDays, fmtCents, oneTimeFee, securityDepositDeadlines, trustAccountTitleOk } from "./logic";
import {
  computeAndSave, finalizeReconciliation, importBankStatement, matchLine, reconDetail, recordBankCharge,
  setBankEndingBalance, startReconciliation, unmatchLine,
} from "./recon";
import { buildOwnerStatementData, owner1099ForYear, renderStatementPdf, statementEmailHtml } from "./statements";
import { retargetSubscriptions, syncPayouts } from "./stripeOps";

const APP_URL = () => process.env.APP_URL ?? process.env.VITE_APP_URL ?? "https://keycove.net";
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const ym = z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM");
const cents = z.number().int();
const book = { bookUserId: z.number().int().optional() };
const method = z.enum(["stripe", "ach", "check", "wire", "cash", "transfer", "bank", "other"]);
const last4 = z.string().regex(/^\d{4}$/).optional().nullable();
const todayYmd = () => new Date().toISOString().slice(0, 10);
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const propLabel = (p?: { address: string; city: string | null; state: string | null } | null) => (p ? [p.address, p.city, p.state].filter(Boolean).join(", ") : "Property");

async function ownedOwner(pmUserId: number, id: number) {
  const d = await db();
  const [o] = await d.select().from(trustOwners).where(and(eq(trustOwners.id, id), eq(trustOwners.pmUserId, pmUserId)));
  if (!o) throw new TRPCError({ code: "NOT_FOUND", message: "Owner not found" });
  return o;
}

async function ownedAccount(pmUserId: number, id: number) {
  const d = await db();
  const [a] = await d.select().from(trustAccounts).where(and(eq(trustAccounts.id, id), eq(trustAccounts.pmUserId, pmUserId)));
  if (!a) throw new TRPCError({ code: "NOT_FOUND", message: "Trust account not found" });
  return a;
}

/** Expense needs owner sign-off under this agreement's settings? */
function expenseNeedsApproval(a: { ownerApprovalMode: string; expenseApprovalThresholdCents: number }, amountCents: number) {
  return (a.ownerApprovalMode === "expenses_over_threshold" || a.ownerApprovalMode === "both") && amountCents > a.expenseApprovalThresholdCents;
}
function disbursementNeedsApproval(a: { ownerApprovalMode: string }) {
  return a.ownerApprovalMode === "disbursements" || a.ownerApprovalMode === "both";
}

async function notifyOwnerOfApproval(ownerId: number, pmUserId: number, kind: string, amountCents: number, payee: string, description: string) {
  const d = await db();
  const [o] = await d.select().from(trustOwners).where(eq(trustOwners.id, ownerId));
  if (!o?.email) return;
  const pm = await getUserById(pmUserId);
  await sendEmail({
    to: o.email,
    subject: `Approval needed: ${kind} of ${fmtCents(amountCents)}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1B2B5E">Your property manager needs your approval</h2>
      <p><strong>${esc(pm?.name ?? "Your property manager")}</strong> asks to ${kind === "expense" ? `pay <strong>${esc(payee)}</strong>` : "send you a distribution of"} <strong>${fmtCents(amountCents)}</strong> from your trust funds.</p>
      <p style="color:#374151">${esc(description)}</p>
      <p><a href="${APP_URL()}/owner-portal" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Review in your owner portal</a></p>
    </div>`,
  }).catch(() => {});
}

// ─── Owner portal ────────────────────────────────────────────────────────────

async function portalOwner(userId: number, ownerId: number) {
  const d = await db();
  const [o] = await d.select().from(trustOwners).where(and(eq(trustOwners.id, ownerId), eq(trustOwners.portalUserId, userId)));
  if (!o) throw new TRPCError({ code: "NOT_FOUND", message: "Owner record not found" });
  return o;
}

const ownerPortalRouter = router({
  acceptInvite: protectedProcedure.input(z.object({ token: z.string().min(20) })).mutation(async ({ ctx, input }) => {
    const d = await db();
    const hash = crypto.createHash("sha256").update(input.token).digest("hex");
    const [o] = await d.select().from(trustOwners).where(eq(trustOwners.inviteTokenHash, hash));
    if (!o) throw new TRPCError({ code: "NOT_FOUND", message: "This invite link is invalid or was already used." });
    if (o.inviteSentAt && Date.now() - new Date(o.inviteSentAt).getTime() > 30 * 86_400_000) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This invite expired. Ask your property manager to resend it." });
    await d.update(trustOwners).set({ portalUserId: ctx.user.id, inviteTokenHash: null }).where(eq(trustOwners.id, o.id));
    return { ok: true, ownerName: o.name };
  }),

  overview: protectedProcedure.query(async ({ ctx }) => {
    const d = await db();
    const owners = await d.select().from(trustOwners).where(eq(trustOwners.portalUserId, ctx.user.id));
    const out = [];
    for (const o of owners) {
      const pm = await getUserById(o.pmUserId);
      const sub = await getUserSubscription(o.pmUserId);
      const agreements = await d.select().from(trustManagementAgreements).where(eq(trustManagementAgreements.trustOwnerId, o.id));
      const properties = [];
      for (const a of agreements) {
        const [p] = await d.select().from(crmProperties).where(eq(crmProperties.id, a.crmPropertyId));
        properties.push({ agreementId: a.id, status: a.status, propertyLabel: propLabel(p), ...(await agreementBalances(d, a)) });
      }
      const statements = await d.select({ id: trustOwnerStatements.id, periodMonth: trustOwnerStatements.periodMonth, emailedAt: trustOwnerStatements.emailedAt }).from(trustOwnerStatements).where(eq(trustOwnerStatements.trustOwnerId, o.id)).orderBy(desc(trustOwnerStatements.periodMonth));
      const approvals = await d.select().from(trustApprovals).where(and(eq(trustApprovals.trustOwnerId, o.id), eq(trustApprovals.status, "pending"))).orderBy(desc(trustApprovals.createdAt));
      const recent = await d.select().from(trustLedgerEntries).where(and(eq(trustLedgerEntries.trustOwnerId, o.id), eq(trustLedgerEntries.ledgerType, "owner"))).orderBy(desc(trustLedgerEntries.entryDate), desc(trustLedgerEntries.id)).limit(25);
      const documents = await d.select({ id: trustOwnerDocuments.id, title: trustOwnerDocuments.title, category: trustOwnerDocuments.category, url: trustOwnerDocuments.url, fileName: trustOwnerDocuments.fileName, crmPropertyId: trustOwnerDocuments.crmPropertyId, createdAt: trustOwnerDocuments.createdAt })
        .from(trustOwnerDocuments).where(and(eq(trustOwnerDocuments.trustOwnerId, o.id), eq(trustOwnerDocuments.pmUserId, o.pmUserId))).orderBy(desc(trustOwnerDocuments.createdAt));
      const year = new Date().getUTCFullYear();
      const [t] = (await owner1099ForYear(o.pmUserId, year)).filter((x) => x.owner.id === o.id);
      out.push({
        owner: { id: o.id, name: o.name },
        brokerage: { name: sub?.brandName || pm?.name || "Property manager", email: pm?.email ?? null },
        properties, statements, approvals, recent, documents, ytd: t ?? null,
      });
    }
    return out;
  }),

  statementPdf: protectedProcedure.input(z.object({ ownerId: z.number().int(), periodMonth: ym })).mutation(async ({ ctx, input }) => {
    const o = await portalOwner(ctx.user.id, input.ownerId);
    const d = await db();
    const [saved] = await d.select().from(trustOwnerStatements).where(and(eq(trustOwnerStatements.trustOwnerId, o.id), eq(trustOwnerStatements.periodMonth, input.periodMonth)));
    const data = saved ? JSON.parse(saved.dataJson) : await buildOwnerStatementData(o.pmUserId, o.id, input.periodMonth);
    return { fileName: `owner-statement-${input.periodMonth}.pdf`, base64: renderStatementPdf(data).toString("base64") };
  }),

  decideApproval: protectedProcedure.input(z.object({ approvalId: z.number().int(), approve: z.boolean(), note: z.string().max(300).optional() })).mutation(async ({ ctx, input }) => {
    const d = await db();
    const [ap] = await d.select().from(trustApprovals).where(eq(trustApprovals.id, input.approvalId));
    if (!ap) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
    await portalOwner(ctx.user.id, ap.trustOwnerId);
    if (ap.status !== "pending") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This request was already decided." });
    await d.update(trustApprovals).set({ status: input.approve ? "approved" : "declined", decidedByUserId: ctx.user.id, decidedAt: new Date(), decisionNote: input.note ?? null }).where(eq(trustApprovals.id, ap.id));
    const pm = await getUserById(ap.pmUserId);
    if (pm?.email) {
      await sendEmail({
        to: pm.email,
        subject: `Owner ${input.approve ? "approved" : "declined"}: ${ap.kind} ${fmtCents(ap.amountCents)} (${ap.payee})`,
        html: `<p>The owner ${input.approve ? "approved" : "declined"} the ${ap.kind} of ${fmtCents(ap.amountCents)} to ${esc(ap.payee)}.${input.note ? ` Note: ${esc(input.note)}` : ""}</p><p><a href="${APP_URL()}/trust?tab=disburse">Open trust accounting</a></p>`,
      }).catch(() => {});
    }
    return { ok: true };
  }),
});

// ─── Brokerage side ──────────────────────────────────────────────────────────

export const trustRouter = router({
  ownerPortal: ownerPortalRouter,

  /** Plan gate + which books this user can open. Never throws (drives the UI). */
  access: protectedProcedure.query(async ({ ctx }) => {
    const own = await planAllows(ctx.user.id);
    const books = await booksFor(ctx.user.id);
    return { plan: trustPlan(), enabled: books.length > 0, ownAllowed: own.ok, reason: own.reason ?? null, books, supportedStates: supportedStates() };
  }),

  rules: protectedProcedure.input(z.object({ stateCode: z.string().length(2).default("NC") })).query(({ input }) => rulesFor(input.stateCode)),

  overview: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
    const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
    const d = await db();
    const accounts = await d.select().from(trustAccounts).where(eq(trustAccounts.pmUserId, pm));
    const accountStats = [];
    for (const a of accounts) {
      const [j] = await d.select({ bal: sql<number>`COALESCE(SUM(${trustJournalEntries.amountCents}),0)` }).from(trustJournalEntries).where(eq(trustJournalEntries.trustAccountId, a.id));
      const byType = await d.select({ t: trustLedgerEntries.ledgerType, bal: sql<number>`COALESCE(SUM(${trustLedgerEntries.amountCents}),0)` }).from(trustLedgerEntries).where(eq(trustLedgerEntries.trustAccountId, a.id)).groupBy(trustLedgerEntries.ledgerType);
      const g = (t: string) => Number(byType.find((x) => x.t === t)?.bal ?? 0);
      const [lastRecon] = await d.select().from(trustReconciliations).where(eq(trustReconciliations.trustAccountId, a.id)).orderBy(desc(trustReconciliations.periodMonth)).limit(1);
      accountStats.push({ ...a, titleOk: trustAccountTitleOk(a.name, rulesFor(a.stateCode)), journalBalanceCents: Number(j?.bal ?? 0), ownerFundsCents: g("owner"), depositsHeldCents: g("security_deposit"), companyFundsCents: g("company"), lastRecon: lastRecon ? { periodMonth: lastRecon.periodMonth, status: lastRecon.status } : null });
    }
    const [owners] = await d.select({ n: sql<number>`COUNT(*)` }).from(trustOwners).where(and(eq(trustOwners.pmUserId, pm), eq(trustOwners.status, "active")));
    const [agreements] = await d.select({ n: sql<number>`COUNT(*)` }).from(trustManagementAgreements).where(and(eq(trustManagementAgreements.pmUserId, pm), eq(trustManagementAgreements.status, "active")));
    const [fees] = await d.select({ s: sql<number>`COALESCE(SUM(${trustFeeAccruals.amountCents}),0)` }).from(trustFeeAccruals).where(and(eq(trustFeeAccruals.pmUserId, pm), eq(trustFeeAccruals.status, "accrued")));
    const sub = await getUserSubscription(pm);
    return {
      pmUserId: pm,
      accounts: accountStats,
      ownerCount: Number(owners?.n ?? 0),
      agreementCount: Number(agreements?.n ?? 0),
      feesAccruedCents: Number(fees?.s ?? 0),
      stripeConnected: sub?.stripeConnectStatus === "active",
      compliance: await complianceFor(pm),
      rules: rulesFor(accounts[0]?.stateCode ?? "NC"),
    };
  }),

  // ── Trust accounts ──
  accounts: router({
    list: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
      const d = await db();
      return d.select().from(trustAccounts).where(eq(trustAccounts.pmUserId, pm)).orderBy(asc(trustAccounts.id));
    }),
    upsert: protectedProcedure.input(z.object({
      ...book,
      id: z.number().int().optional(),
      name: z.string().min(3).max(200),
      kind: z.enum(["general", "security_deposit", "hoa"]).default("general"),
      hoaName: z.string().max(200).optional().nullable(),
      bankName: z.string().min(2).max(200),
      bankAddress: z.string().max(500).optional().nullable(),
      accountLast4: last4,
      routingLast4: last4,
      stateCode: z.string().length(2).default("NC"),
      interestBearing: z.boolean().default(false),
      interestAuthorizationNote: z.string().max(1000).optional().nullable(),
      interestAuthorizedAt: ymd.optional().nullable(),
      receivesStripePayouts: z.boolean().default(false),
      status: z.enum(["active", "closed"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
      const rules = rulesFor(input.stateCode);
      if (!trustAccountTitleOk(input.name, rules)) throw new TRPCError({ code: "BAD_REQUEST", message: `The account name must include "Trust Account" or "Escrow Account" — that's how the bank must title it (21 NCAC 58A .0117(b)).` });
      if (input.kind === "hoa" && !input.hoaName) throw new TRPCError({ code: "BAD_REQUEST", message: "Name the association this account belongs to (one association per account)." });
      if (input.interestBearing && !input.interestAuthorizationNote) throw new TRPCError({ code: "BAD_REQUEST", message: "Interest-bearing trust accounts need written authorization from everyone with an interest in the money, saying who receives the interest (21 NCAC 58A .0116(c))." });
      const d = await db();
      const values = {
        name: input.name, kind: input.kind, hoaName: input.hoaName ?? null, bankName: input.bankName, bankAddress: input.bankAddress ?? null,
        accountLast4: input.accountLast4 ?? null, routingLast4: input.routingLast4 ?? null, stateCode: input.stateCode.toUpperCase(),
        interestBearing: input.interestBearing ? 1 : 0, interestAuthorizationNote: input.interestAuthorizationNote ?? null,
        interestAuthorizedAt: input.interestAuthorizedAt ?? null, receivesStripePayouts: input.receivesStripePayouts ? 1 : 0,
        ...(input.status ? { status: input.status } : {}),
      };
      if (input.receivesStripePayouts) await d.update(trustAccounts).set({ receivesStripePayouts: 0 }).where(eq(trustAccounts.pmUserId, pm));
      if (input.id) {
        await ownedAccount(pm, input.id);
        await d.update(trustAccounts).set(values).where(eq(trustAccounts.id, input.id));
        return { id: input.id };
      }
      const res = await d.insert(trustAccounts).values({ pmUserId: pm, ...values, openingBalanceDate: todayYmd() });
      return { id: Number((res as any)[0].insertId) };
    }),
    syncStripePayouts: protectedProcedure.input(z.object({ ...book, trustAccountId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "reconcile");
      await ownedAccount(pm, input.trustAccountId);
      return syncPayouts(pm, input.trustAccountId);
    }),
  }),

  // ── Owners ──
  owners: router({
    list: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
      const d = await db();
      const owners = await d.select().from(trustOwners).where(eq(trustOwners.pmUserId, pm)).orderBy(asc(trustOwners.name));
      const agreements = await d.select().from(trustManagementAgreements).where(eq(trustManagementAgreements.pmUserId, pm));
      const out = [];
      for (const o of owners) {
        const mine = agreements.filter((a) => a.trustOwnerId === o.id);
        let balanceCents = 0, availableCents = 0, depositsHeldCents = 0;
        for (const a of mine) {
          const b = await agreementBalances(d, a);
          balanceCents += b.balanceCents; availableCents += b.availableCents; depositsHeldCents += b.depositsHeldCents;
        }
        out.push({ ...o, inviteTokenHash: undefined, portalActive: !!o.portalUserId, invitePending: !!o.inviteTokenHash, propertyCount: mine.filter((a) => a.status === "active").length, balanceCents, availableCents, depositsHeldCents });
      }
      return out;
    }),
    upsert: protectedProcedure.input(z.object({
      ...book,
      id: z.number().int().optional(),
      name: z.string().min(1).max(200),
      email: z.string().email().optional().nullable().or(z.literal("")),
      phone: z.string().max(40).optional().nullable(),
      mailingAddress: z.string().max(500).optional().nullable(),
      taxIdLast4: last4,
      taxIdType: z.enum(["ssn", "ein"]).optional().nullable(),
      w9OnFile: z.boolean().default(false),
      payoutMethod: z.enum(["ach", "check", "other"]).default("ach"),
      payoutBankName: z.string().max(200).optional().nullable(),
      payoutAccountLast4: last4,
      status: z.enum(["active", "inactive"]).optional(),
      notes: z.string().max(2000).optional().nullable(),
    })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
      const d = await db();
      const { bookUserId: _b, id, w9OnFile, email, ...rest } = input;
      const values = { ...rest, email: email || null, w9OnFile: w9OnFile ? 1 : 0 };
      if (id) {
        await ownedOwner(pm, id);
        await d.update(trustOwners).set(values).where(eq(trustOwners.id, id));
        return { id };
      }
      const res = await d.insert(trustOwners).values({ pmUserId: pm, ...values });
      return { id: Number((res as any)[0].insertId) };
    }),
    invite: protectedProcedure.input(z.object({ ...book, ownerId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
      const o = await ownedOwner(pm, input.ownerId);
      if (!o.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Add the owner's email first." });
      const token = crypto.randomBytes(24).toString("base64url");
      const d = await db();
      await d.update(trustOwners).set({ inviteTokenHash: crypto.createHash("sha256").update(token).digest("hex"), inviteSentAt: new Date() }).where(eq(trustOwners.id, o.id));
      const pmUser = await getUserById(pm);
      const sub = await getUserSubscription(pm);
      const link = `${APP_URL()}/owner-portal?invite=${token}`;
      const sent = await sendEmail({
        to: o.email,
        subject: `${sub?.brandName || pmUser?.name || "Your property manager"} invited you to your owner portal`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2B5E">Your owner portal is ready</h2>
          <p>${esc(sub?.brandName || pmUser?.name || "Your property manager")} manages your rental on Keycove. In your owner portal you can see the money held for you in trust, download monthly statements and year-end totals, and approve repairs.</p>
          <p><a href="${link}" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Open my owner portal</a></p>
          <p style="color:#6b7280;font-size:12px">Sign in or create a free Keycove login with this email. The link works once and expires in 30 days.</p>
        </div>`,
      });
      return { ok: true, emailed: sent, link: sent ? null : link };
    }),
  }),

  // ── Documents shared read-only with owners in the owner portal ──
  documents: router({
    list: protectedProcedure.input(z.object({ ...book, ownerId: z.number().int() })).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "view");
      await ownedOwner(pm, input.ownerId);
      const d = await db();
      return d.select().from(trustOwnerDocuments).where(and(eq(trustOwnerDocuments.pmUserId, pm), eq(trustOwnerDocuments.trustOwnerId, input.ownerId))).orderBy(desc(trustOwnerDocuments.createdAt));
    }),
    add: protectedProcedure.input(z.object({
      ...book, ownerId: z.number().int(), crmPropertyId: z.number().int().optional().nullable(),
      category: z.enum(["management_agreement", "lease", "inspection", "insurance", "tax", "other"]).default("other"),
      title: z.string().min(2).max(200),
      // Only files uploaded through Keycove (/uploads/…) or an https link the PM pastes.
      url: z.string().max(1000).regex(/^(https:\/\/|\/uploads\/)/, "Upload a file or paste an https:// link"),
      fileName: z.string().max(255).optional().nullable(),
    })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
      await ownedOwner(pm, input.ownerId);
      const d = await db();
      if (input.crmPropertyId) {
        const [a] = await d.select({ id: trustManagementAgreements.id }).from(trustManagementAgreements)
          .where(and(eq(trustManagementAgreements.pmUserId, pm), eq(trustManagementAgreements.trustOwnerId, input.ownerId), eq(trustManagementAgreements.crmPropertyId, input.crmPropertyId))).limit(1);
        if (!a) throw new TRPCError({ code: "BAD_REQUEST", message: "That property isn't under a management agreement with this owner." });
      }
      const res = await d.insert(trustOwnerDocuments).values({ pmUserId: pm, trustOwnerId: input.ownerId, crmPropertyId: input.crmPropertyId ?? null, category: input.category, title: input.title, url: input.url, fileName: input.fileName ?? null, uploadedByUserId: ctx.user.id });
      return { id: Number((res as any)[0].insertId) };
    }),
    remove: protectedProcedure.input(z.object({ ...book, documentId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
      const d = await db();
      const [doc] = await d.select().from(trustOwnerDocuments).where(and(eq(trustOwnerDocuments.id, input.documentId), eq(trustOwnerDocuments.pmUserId, pm)));
      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      await d.delete(trustOwnerDocuments).where(eq(trustOwnerDocuments.id, doc.id));
      return { ok: true };
    }),
  }),

  // ── Properties & management agreements ──
  properties: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
    const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
    const d = await db();
    return d.select({ id: crmProperties.id, address: crmProperties.address, city: crmProperties.city, state: crmProperties.state, zip: crmProperties.zip, listingId: crmProperties.listingId }).from(crmProperties).where(eq(crmProperties.userId, pm)).orderBy(asc(crmProperties.address));
  }),
  addProperty: protectedProcedure.input(z.object({ ...book, address: z.string().min(3).max(300), city: z.string().max(100).optional(), state: z.string().max(50).default("NC"), zip: z.string().max(20).optional(), totalUnits: z.number().int().min(1).default(1) })).mutation(async ({ ctx, input }) => {
    const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
    const d = await db();
    const res = await d.insert(crmProperties).values({ userId: pm, address: input.address, city: input.city ?? null, state: input.state, zip: input.zip ?? null, totalUnits: input.totalUnits, status: "active" });
    return { id: Number((res as any)[0].insertId) };
  }),

  agreements: router({
    list: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
      const d = await db();
      const rows = await d.select().from(trustManagementAgreements).where(eq(trustManagementAgreements.pmUserId, pm)).orderBy(desc(trustManagementAgreements.status), asc(trustManagementAgreements.id));
      const out = [];
      for (const a of rows) {
        const [o] = await d.select({ name: trustOwners.name }).from(trustOwners).where(eq(trustOwners.id, a.trustOwnerId));
        const [p] = await d.select().from(crmProperties).where(eq(crmProperties.id, a.crmPropertyId));
        const tenants = await d.select({ id: crmTenants.id, firstName: crmTenants.firstName, lastName: crmTenants.lastName, email: crmTenants.email, monthlyRent: crmTenants.monthlyRent, securityDeposit: crmTenants.securityDeposit, moveInDate: crmTenants.moveInDate, status: crmTenants.status }).from(crmTenants).where(eq(crmTenants.crmPropertyId, a.crmPropertyId));
        out.push({ ...a, ownerName: o?.name ?? "?", propertyLabel: propLabel(p), tenants, ...(await agreementBalances(d, a)) });
      }
      return out;
    }),
    upsert: protectedProcedure.input(z.object({
      ...book,
      id: z.number().int().optional(),
      trustOwnerId: z.number().int(),
      crmPropertyId: z.number().int(),
      trustAccountId: z.number().int(),
      startDate: ymd,
      mgmtFeeType: z.enum(["percent", "flat", "none"]),
      mgmtFeeBps: z.number().int().min(0).max(5000).default(0),
      mgmtFeeFlatCents: cents.min(0).default(0),
      mgmtFeeMinCents: cents.min(0).default(0),
      leasingFeeType: z.enum(["percent_of_first_month", "flat", "none"]).default("none"),
      leasingFeeValue: z.number().int().min(0).default(0),
      renewalFeeType: z.enum(["percent_of_first_month", "flat", "none"]).default("none"),
      renewalFeeValue: z.number().int().min(0).default(0),
      reserveCents: cents.min(0).default(0),
      ownerApprovalMode: z.enum(["none", "disbursements", "expenses_over_threshold", "both"]).default("expenses_over_threshold"),
      expenseApprovalThresholdCents: cents.min(0).default(50000),
      disbursementDay: z.number().int().min(1).max(28).default(10),
      securityDepositHolder: z.enum(["broker_trust", "owner"]).default("broker_trust"),
      notes: z.string().max(2000).optional().nullable(),
    })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
      await ownedOwner(pm, input.trustOwnerId);
      const acct = await ownedAccount(pm, input.trustAccountId);
      const d = await db();
      const [prop] = await d.select().from(crmProperties).where(and(eq(crmProperties.id, input.crmPropertyId), eq(crmProperties.userId, pm)));
      if (!prop) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found in your portfolio" });
      if (acct.kind === "hoa") {
        const others = await d.select({ o: trustManagementAgreements.trustOwnerId }).from(trustManagementAgreements).where(and(eq(trustManagementAgreements.trustAccountId, acct.id), eq(trustManagementAgreements.status, "active")));
        if (others.some((x) => x.o !== input.trustOwnerId)) throw new TRPCError({ code: "BAD_REQUEST", message: "An association's trust account can hold only that association's money (21 NCAC 58A .0118(a))." });
      }
      const { bookUserId: _b, id, ...values } = input;
      if (id) {
        const existing = await getAgreement(pm, id);
        if (existing.trustAccountId !== input.trustAccountId || existing.trustOwnerId !== input.trustOwnerId || existing.crmPropertyId !== input.crmPropertyId) {
          const b = await agreementBalances(d, existing);
          if (b.balanceCents !== 0 || b.depositsHeldCents !== 0) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This agreement has money on its ledgers. Pay it out first; owner, property and trust account can only change on an empty ledger." });
        }
        await d.update(trustManagementAgreements).set(values).where(eq(trustManagementAgreements.id, id));
        return { id, retarget: null };
      }
      const [dup] = await d.select({ id: trustManagementAgreements.id }).from(trustManagementAgreements).where(and(eq(trustManagementAgreements.crmPropertyId, input.crmPropertyId), eq(trustManagementAgreements.status, "active")));
      if (dup) throw new TRPCError({ code: "CONFLICT", message: "This property already has an active management agreement." });
      const res = await d.insert(trustManagementAgreements).values({ pmUserId: pm, ...values });
      const newId = Number((res as any)[0].insertId);
      const retarget = await retargetSubscriptions(input.crmPropertyId).catch((e) => ({ updated: 0, skipped: 0, errors: [String(e)] }));
      return { id: newId, retarget };
    }),
    terminate: protectedProcedure.input(z.object({ ...book, agreementId: z.number().int(), endDate: ymd })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
      const a = await getAgreement(pm, input.agreementId);
      const d = await db();
      const b = await agreementBalances(d, a);
      if (b.balanceCents !== 0 || b.feesAccruedCents !== 0) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Pay out the owner's ${fmtCents(b.balanceCents)} (and any accrued fees) before ending the agreement.` });
      if (b.depositsHeldCents !== 0) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `You still hold ${fmtCents(b.depositsHeldCents)} in tenant deposits for this property. Transfer them to the owner or the next agent (G.S. 42-54), then end the agreement.` });
      await d.update(trustManagementAgreements).set({ status: "terminated", endDate: input.endDate }).where(eq(trustManagementAgreements.id, a.id));
      const retarget = await retargetSubscriptions(a.crmPropertyId).catch((e) => ({ updated: 0, skipped: 0, errors: [String(e)] }));
      return { ok: true, retarget };
    }),
  }),

  // ── Receipts, fees, expenses, disbursements ──
  receipts: router({
    record: protectedProcedure.input(z.object({
      ...book,
      agreementId: z.number().int(),
      rentCents: cents.min(0).default(0),
      depositCents: cents.min(0).default(0),
      otherCents: cents.min(0).default(0),
      otherDescription: z.string().max(200).optional(),
      receivedDate: ymd,
      depositedDate: ymd,
      method: z.enum(["check", "cash", "ach", "wire", "other"]),
      reference: z.string().max(120).optional(),
      remitter: z.string().min(1).max(200),
      crmTenantId: z.number().int().optional(),
      periodMonth: ym,
      firstMonthOfNewLease: z.boolean().default(false),
      leaseStartDate: ymd.optional(),
    })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "receipts");
      if (input.rentCents + input.depositCents + input.otherCents <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Enter an amount." });
      if (input.depositedDate < input.receivedDate) throw new TRPCError({ code: "BAD_REQUEST", message: "The deposit date can't be before the date received." });
      const d = await db();
      let tenant: { firstName: string; lastName: string; email: string | null } | undefined;
      if (input.crmTenantId) [tenant] = await d.select().from(crmTenants).where(eq(crmTenants.id, input.crmTenantId));
      const res = await recordReceipt({
        pmUserId: pm, agreementId: input.agreementId, actorUserId: ctx.user.id,
        rentCents: input.rentCents, depositCents: input.depositCents, otherCents: input.otherCents, otherDescription: input.otherDescription,
        entryDate: input.depositedDate, receivedDate: input.receivedDate, method: input.method, reference: input.reference ?? null,
        remitter: input.remitter, crmTenantId: input.crmTenantId ?? null, tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : input.remitter,
        tenantEmail: tenant?.email ?? null, periodMonth: input.periodMonth, firstMonthOfNewLease: input.firstMonthOfNewLease, leaseStartDate: input.leaseStartDate ?? null,
      });
      const a = await getAgreement(pm, input.agreementId);
      const [acct] = await d.select().from(trustAccounts).where(eq(trustAccounts.id, a.trustAccountId));
      const deadline = addBankingDays(input.receivedDate, rulesFor(acct?.stateCode).depositDeadlineBankingDays);
      return { ...res, deadline, late: input.depositedDate > deadline };
    }),
    ownerContribution: protectedProcedure.input(z.object({ ...book, agreementId: z.number().int(), amountCents: cents.positive(), entryDate: ymd, receivedDate: ymd, method, reference: z.string().max(120).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "receipts");
      const { agreement: a, owner } = await agreementContext(pm, input.agreementId);
      return post({
        pmUserId: pm, trustAccountId: a.trustAccountId, actorUserId: ctx.user.id,
        journal: { entryDate: input.entryDate, receivedDate: input.receivedDate, method: input.method, reference: input.reference, counterparty: owner?.name ?? "Owner", purpose: "Owner contribution" },
        splits: [{ ledgerType: "owner", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, agreementId: a.id, type: "owner_contribution", amountCents: input.amountCents, description: "Funds from owner" }],
      });
    }),
    companyFunds: protectedProcedure.input(z.object({ ...book, trustAccountId: z.number().int(), amountCents: cents.positive(), entryDate: ymd, reference: z.string().max(120).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "receipts");
      return post({
        pmUserId: pm, trustAccountId: input.trustAccountId, actorUserId: ctx.user.id,
        journal: { entryDate: input.entryDate, method: "transfer", reference: input.reference, counterparty: "Broker (company funds)", purpose: "Company funds to cover bank service charges" },
        splits: [{ ledgerType: "company", type: "company_deposit", amountCents: input.amountCents, description: "Company funds for bank charges" }],
      });
    }),
    openingBalance: protectedProcedure.input(z.object({ ...book, agreementId: z.number().int(), ownerCents: cents.min(0).default(0), depositCents: cents.min(0).default(0), depositTenantName: z.string().max(200).optional(), entryDate: ymd })).mutation(async ({ ctx, input }) => {
      // Moving an existing book onto Keycove: carry over balances already in the bank.
      const pm = await requireBook(ctx.user.id, input.bookUserId, "receipts");
      const { agreement: a } = await agreementContext(pm, input.agreementId);
      const d = await db();
      let sdId: number | null = null;
      if (input.depositCents > 0) {
        const res = await d.insert(trustSecurityDeposits).values({ pmUserId: pm, agreementId: a.id, trustAccountId: a.trustAccountId, tenantName: input.depositTenantName || "Tenant", receivedDate: input.entryDate, bankNoticeSentAt: input.entryDate });
        sdId = Number((res as any)[0].insertId);
      }
      return post({
        pmUserId: pm, trustAccountId: a.trustAccountId, actorUserId: ctx.user.id,
        journal: { entryDate: input.entryDate, method: "other", counterparty: "Opening balance", purpose: "Opening balance carried over from prior records", clearedDate: input.entryDate, receivedDate: input.entryDate },
        splits: [
          { ledgerType: "owner", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, agreementId: a.id, type: "adjustment", amountCents: input.ownerCents, description: "Opening balance" },
          { ledgerType: "security_deposit", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, agreementId: a.id, securityDepositId: sdId, type: "deposit_receipt", amountCents: input.depositCents, description: `Opening deposit balance${input.depositTenantName ? ` (${input.depositTenantName})` : ""}` },
        ],
      });
    }),
  }),

  fees: router({
    list: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
      const d = await db();
      const rows = await d.select().from(trustFeeAccruals).where(and(eq(trustFeeAccruals.pmUserId, pm), eq(trustFeeAccruals.status, "accrued"))).orderBy(asc(trustFeeAccruals.id));
      const owners = await d.select({ id: trustOwners.id, name: trustOwners.name }).from(trustOwners).where(eq(trustOwners.pmUserId, pm));
      const props = await d.select({ id: crmProperties.id, address: crmProperties.address }).from(crmProperties).where(eq(crmProperties.userId, pm));
      return rows.map((r) => ({ ...r, ownerName: owners.find((o) => o.id === r.trustOwnerId)?.name ?? "?", propertyLabel: props.find((p) => p.id === r.crmPropertyId)?.address ?? "?" }));
    }),
    pay: protectedProcedure.input(z.object({ ...book, trustAccountId: z.number().int(), entryDate: ymd, method: z.enum(["transfer", "ach", "check", "wire"]), reference: z.string().max(120).optional(), accrualIds: z.array(z.number().int()).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const sub = await getUserSubscription(pm);
      const u = await getUserById(pm);
      return payAccruedFees({ pmUserId: pm, trustAccountId: input.trustAccountId, actorUserId: ctx.user.id, entryDate: input.entryDate, method: input.method, reference: input.reference, operatingAccountLabel: `${sub?.brandName || u?.name || "Broker"} operating account`, accrualIds: input.accrualIds });
    }),
    waive: protectedProcedure.input(z.object({ ...book, accrualId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const d = await db();
      await d.update(trustFeeAccruals).set({ status: "waived" }).where(and(eq(trustFeeAccruals.id, input.accrualId), eq(trustFeeAccruals.pmUserId, pm), eq(trustFeeAccruals.status, "accrued")));
      return { ok: true };
    }),
    chargeOneTime: protectedProcedure.input(z.object({ ...book, agreementId: z.number().int(), type: z.enum(["leasing_fee", "renewal_fee"]), firstMonthRentCents: cents.min(0) })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const a = await getAgreement(pm, input.agreementId);
      const amount = input.type === "leasing_fee" ? oneTimeFee(a.leasingFeeType, a.leasingFeeValue, input.firstMonthRentCents) : oneTimeFee(a.renewalFeeType, a.renewalFeeValue, input.firstMonthRentCents);
      if (amount <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "This agreement has no fee of that type." });
      return accrueOneTimeFee(pm, a.id, input.type, amount);
    }),
  }),

  expenses: router({
    /** Pay a bill now, or send it to the owner for approval when the agreement requires it. */
    submit: protectedProcedure.input(z.object({ ...book, agreementId: z.number().int(), amountCents: cents.positive(), payee: z.string().min(1).max(200), description: z.string().min(1).max(300), entryDate: ymd, method, reference: z.string().max(120).optional(), invoiceUrl: z.string().max(1000).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const a = await getAgreement(pm, input.agreementId);
      if (expenseNeedsApproval(a, input.amountCents)) {
        const d = await db();
        const res = await d.insert(trustApprovals).values({ pmUserId: pm, agreementId: a.id, trustOwnerId: a.trustOwnerId, kind: "expense", amountCents: input.amountCents, payee: input.payee, description: input.description, invoiceUrl: input.invoiceUrl ?? null, requestedByUserId: ctx.user.id });
        await notifyOwnerOfApproval(a.trustOwnerId, pm, "expense", input.amountCents, input.payee, input.description);
        return { status: "pending_approval" as const, approvalId: Number((res as any)[0].insertId) };
      }
      const r = await payExpense({ pmUserId: pm, actorUserId: ctx.user.id, agreementId: a.id, amountCents: input.amountCents, payee: input.payee, description: input.description, entryDate: input.entryDate, method: input.method, reference: input.reference });
      return { status: "paid" as const, journalEntryId: r?.journalEntryId ?? null };
    }),
  }),

  approvals: router({
    list: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
      const d = await db();
      const rows = await d.select().from(trustApprovals).where(and(eq(trustApprovals.pmUserId, pm), inArray(trustApprovals.status, ["pending", "approved", "declined"]))).orderBy(desc(trustApprovals.createdAt)).limit(100);
      const owners = await d.select({ id: trustOwners.id, name: trustOwners.name }).from(trustOwners).where(eq(trustOwners.pmUserId, pm));
      return rows.map((r) => ({ ...r, ownerName: owners.find((o) => o.id === r.trustOwnerId)?.name ?? "?" }));
    }),
    /** PM records an owner's approval received offline (email/phone), with a note. */
    recordOwnerDecision: protectedProcedure.input(z.object({ ...book, approvalId: z.number().int(), approve: z.boolean(), note: z.string().min(3).max(300) })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const d = await db();
      await d.update(trustApprovals).set({ status: input.approve ? "approved" : "declined", decidedByUserId: ctx.user.id, decidedAt: new Date(), decisionNote: `Recorded by manager: ${input.note}`.slice(0, 300) }).where(and(eq(trustApprovals.id, input.approvalId), eq(trustApprovals.pmUserId, pm), eq(trustApprovals.status, "pending")));
      return { ok: true };
    }),
    payApproved: protectedProcedure.input(z.object({ ...book, approvalId: z.number().int(), entryDate: ymd, method, reference: z.string().max(120).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const d = await db();
      const [ap] = await d.select().from(trustApprovals).where(and(eq(trustApprovals.id, input.approvalId), eq(trustApprovals.pmUserId, pm)));
      if (!ap || ap.status !== "approved") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only approved requests can be paid." });
      const r = ap.kind === "expense"
        ? await payExpense({ pmUserId: pm, actorUserId: ctx.user.id, agreementId: ap.agreementId, amountCents: ap.amountCents, payee: ap.payee, description: ap.description, entryDate: input.entryDate, method: input.method, reference: input.reference })
        : await disburseToOwner({ pmUserId: pm, actorUserId: ctx.user.id, items: [{ agreementId: ap.agreementId, amountCents: ap.amountCents }], entryDate: input.entryDate, method: input.method, reference: input.reference, memo: ap.description });
      await d.update(trustApprovals).set({ status: "posted", journalEntryId: r?.journalEntryId ?? null }).where(eq(trustApprovals.id, ap.id));
      return { ok: true, journalEntryId: r?.journalEntryId ?? null };
    }),
    cancel: protectedProcedure.input(z.object({ ...book, approvalId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const d = await db();
      await d.update(trustApprovals).set({ status: "cancelled" }).where(and(eq(trustApprovals.id, input.approvalId), eq(trustApprovals.pmUserId, pm), inArray(trustApprovals.status, ["pending", "approved", "declined"])));
      return { ok: true };
    }),
  }),

  disbursements: router({
    /** What each owner can be paid now, per property. */
    preview: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
      const d = await db();
      const agreements = await d.select().from(trustManagementAgreements).where(eq(trustManagementAgreements.pmUserId, pm));
      const owners = await d.select().from(trustOwners).where(eq(trustOwners.pmUserId, pm));
      const out = [];
      for (const o of owners) {
        const items = [];
        for (const a of agreements.filter((x) => x.trustOwnerId === o.id)) {
          const [p] = await d.select().from(crmProperties).where(eq(crmProperties.id, a.crmPropertyId));
          items.push({ agreementId: a.id, trustAccountId: a.trustAccountId, propertyLabel: propLabel(p), needsApproval: disbursementNeedsApproval(a), ...(await agreementBalances(d, a)) });
        }
        if (items.length) out.push({ owner: { id: o.id, name: o.name, payoutMethod: o.payoutMethod, payoutBankName: o.payoutBankName, payoutAccountLast4: o.payoutAccountLast4 }, items, availableCents: items.reduce((s, i) => s + i.availableCents, 0) });
      }
      return out;
    }),
    payOwner: protectedProcedure.input(z.object({ ...book, items: z.array(z.object({ agreementId: z.number().int(), amountCents: cents.positive() })).min(1), entryDate: ymd, method, reference: z.string().max(120).optional(), memo: z.string().max(300).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const d = await db();
      const agreements = await d.select().from(trustManagementAgreements).where(and(eq(trustManagementAgreements.pmUserId, pm), inArray(trustManagementAgreements.id, input.items.map((i) => i.agreementId))));
      const gated = agreements.filter(disbursementNeedsApproval);
      if (gated.length) {
        // Owner approves distributions first: queue one request per property.
        for (const a of gated) {
          const item = input.items.find((i) => i.agreementId === a.id)!;
          await d.insert(trustApprovals).values({ pmUserId: pm, agreementId: a.id, trustOwnerId: a.trustOwnerId, kind: "disbursement", amountCents: item.amountCents, payee: "Owner distribution", description: input.memo || "Owner distribution", requestedByUserId: ctx.user.id });
          await notifyOwnerOfApproval(a.trustOwnerId, pm, "disbursement", item.amountCents, "you", input.memo || "Owner distribution");
        }
        const rest = input.items.filter((i) => !gated.some((g) => g.id === i.agreementId));
        if (!rest.length) return { status: "pending_approval" as const, journalEntryId: null };
        const r = await disburseToOwner({ pmUserId: pm, actorUserId: ctx.user.id, items: rest, entryDate: input.entryDate, method: input.method, reference: input.reference, memo: input.memo });
        return { status: "partial" as const, journalEntryId: r?.journalEntryId ?? null };
      }
      const r = await disburseToOwner({ pmUserId: pm, actorUserId: ctx.user.id, items: input.items, entryDate: input.entryDate, method: input.method, reference: input.reference, memo: input.memo });
      return { status: "paid" as const, journalEntryId: r?.journalEntryId ?? null };
    }),
  }),

  // ── Journal & ledgers ──
  journal: router({
    list: protectedProcedure.input(z.object({ ...book, trustAccountId: z.number().int(), from: ymd.optional(), to: ymd.optional() })).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "view");
      await ownedAccount(pm, input.trustAccountId);
      const d = await db();
      const all = await d.select().from(trustJournalEntries).where(eq(trustJournalEntries.trustAccountId, input.trustAccountId)).orderBy(asc(trustJournalEntries.entryDate), asc(trustJournalEntries.id));
      let bal = 0;
      const withBal = all.map((j) => ({ ...j, runningBalanceCents: (bal += j.amountCents) }));
      const shown = withBal.filter((j) => (!input.from || j.entryDate >= input.from) && (!input.to || j.entryDate <= input.to));
      const ids = shown.map((j) => j.id);
      const splits = ids.length ? await d.select().from(trustLedgerEntries).where(inArray(trustLedgerEntries.journalEntryId, ids)) : [];
      const reversed = new Set(all.filter((j) => j.voidOfEntryId).map((j) => j.voidOfEntryId));
      return shown.reverse().map((j) => ({ ...j, reversed: reversed.has(j.id), splits: splits.filter((s) => s.journalEntryId === j.id) }));
    }),
    reverse: protectedProcedure.input(z.object({ ...book, journalEntryId: z.number().int(), reason: z.string().min(3).max(200), entryDate: ymd })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      return reverseJournalEntry({ pmUserId: pm, actorUserId: ctx.user.id, journalEntryId: input.journalEntryId, entryDate: input.entryDate, reason: input.reason });
    }),
  }),

  ledger: protectedProcedure.input(z.object({ ...book, agreementId: z.number().int().optional(), trustAccountId: z.number().int().optional(), ledgerType: z.enum(["owner", "security_deposit", "company"]).default("owner") })).query(async ({ ctx, input }) => {
    const pm = await requireBook(ctx.user.id, input.bookUserId, "view");
    const d = await db();
    if (input.ledgerType === "company") {
      if (!input.trustAccountId) throw new TRPCError({ code: "BAD_REQUEST", message: "trustAccountId required" });
      await ownedAccount(pm, input.trustAccountId);
      return d.select().from(trustLedgerEntries).where(and(eq(trustLedgerEntries.trustAccountId, input.trustAccountId), eq(trustLedgerEntries.ledgerType, "company"))).orderBy(desc(trustLedgerEntries.id));
    }
    if (!input.agreementId) throw new TRPCError({ code: "BAD_REQUEST", message: "agreementId required" });
    const a = await getAgreement(pm, input.agreementId);
    return d.select().from(trustLedgerEntries).where(and(eq(trustLedgerEntries.trustAccountId, a.trustAccountId), eq(trustLedgerEntries.ledgerType, input.ledgerType), eq(trustLedgerEntries.trustOwnerId, a.trustOwnerId), eq(trustLedgerEntries.crmPropertyId, a.crmPropertyId))).orderBy(desc(trustLedgerEntries.id));
  }),

  // ── Security deposits ──
  deposits: router({
    list: protectedProcedure.input(z.object(book).optional()).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
      const d = await db();
      const rows = await d.select().from(trustSecurityDeposits).where(eq(trustSecurityDeposits.pmUserId, pm)).orderBy(desc(trustSecurityDeposits.id));
      const nc = rulesFor("NC");
      const out = [];
      for (const r of rows) {
        const [a] = await d.select().from(trustManagementAgreements).where(eq(trustManagementAgreements.id, r.agreementId));
        const [p] = a ? await d.select().from(crmProperties).where(eq(crmProperties.id, a.crmPropertyId)) : [];
        out.push({ ...r, propertyLabel: propLabel(p), heldCents: await depositBalance(d, r.id), deadlines: securityDepositDeadlines(r, nc) });
      }
      return out;
    }),
    sendBankNotice: protectedProcedure.input(z.object({ ...book, securityDepositId: z.number().int(), tenantEmail: z.string().email().optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "receipts");
      const d = await db();
      const [sd] = await d.select().from(trustSecurityDeposits).where(and(eq(trustSecurityDeposits.id, input.securityDepositId), eq(trustSecurityDeposits.pmUserId, pm)));
      if (!sd) throw new TRPCError({ code: "NOT_FOUND", message: "Deposit not found" });
      const to = input.tenantEmail ?? sd.tenantEmail;
      if (!to) throw new TRPCError({ code: "BAD_REQUEST", message: "Add the tenant's email." });
      const [acct] = await d.select().from(trustAccounts).where(eq(trustAccounts.id, sd.trustAccountId));
      if (!acct?.bankAddress) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Add the bank's address to the trust account first — G.S. 42-50 requires the name and address of the bank." });
      const held = await depositBalance(d, sd.id);
      const pmUser = await getUserById(pm);
      const sub = await getUserSubscription(pm);
      const sent = await sendEmail({
        to,
        subject: "Where your security deposit is held",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2B5E">Your security deposit</h2>
          <p>Dear ${esc(sd.tenantName)},</p>
          <p>As required by North Carolina General Statute 42-50, this is to tell you that your security deposit of <strong>${fmtCents(held)}</strong> is held in a trust account at:</p>
          <p style="background:#f5f7ff;padding:12px 16px;border-radius:8px"><strong>${esc(acct.bankName)}</strong><br/>${esc(acct.bankAddress).replace(/\n/g, "<br/>")}</p>
          <p>It is held by ${esc(sub?.brandName || pmUser?.name || "your property manager")} as agent for the landlord.</p>
        </div>`,
      });
      if (sent) await d.update(trustSecurityDeposits).set({ bankNoticeSentAt: todayYmd(), tenantEmail: to }).where(eq(trustSecurityDeposits.id, sd.id));
      return { ok: sent };
    }),
    markNoticeSent: protectedProcedure.input(z.object({ ...book, securityDepositId: z.number().int(), sentOn: ymd })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "receipts");
      const d = await db();
      await d.update(trustSecurityDeposits).set({ bankNoticeSentAt: input.sentOn }).where(and(eq(trustSecurityDeposits.id, input.securityDepositId), eq(trustSecurityDeposits.pmUserId, pm)));
      return { ok: true };
    }),
    setMoveOut: protectedProcedure.input(z.object({ ...book, securityDepositId: z.number().int(), tenancyEndDate: ymd })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "receipts");
      const d = await db();
      await d.update(trustSecurityDeposits).set({ tenancyEndDate: input.tenancyEndDate }).where(and(eq(trustSecurityDeposits.id, input.securityDepositId), eq(trustSecurityDeposits.pmUserId, pm)));
      return { ok: true };
    }),
    close: protectedProcedure.input(z.object({ ...book, securityDepositId: z.number().int(), tenancyEndDate: ymd, deductions: z.array(z.object({ description: z.string().min(2).max(200), amountCents: cents.positive() })).max(30), refundMethod: method, refundReference: z.string().max(120).optional(), entryDate: ymd, emailTenant: z.boolean().default(true) })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "disburse");
      const res = await closeSecurityDeposit({ pmUserId: pm, actorUserId: ctx.user.id, securityDepositId: input.securityDepositId, tenancyEndDate: input.tenancyEndDate, deductions: input.deductions, refundMethod: input.refundMethod, refundReference: input.refundReference, entryDate: input.entryDate });
      let emailed = false;
      if (res && input.emailTenant && res.sd.tenantEmail) {
        const rows = input.deductions.map((x) => `<tr><td style="padding:4px 0">${esc(x.description)}</td><td style="text-align:right">${fmtCents(x.amountCents)}</td></tr>`).join("");
        emailed = await sendEmail({
          to: res.sd.tenantEmail,
          subject: "Your security deposit accounting",
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Security deposit accounting</h2>
            <p>Dear ${esc(res.sd.tenantName)}, here is the itemized accounting of your security deposit (N.C.G.S. 42-52). Tenancy ended ${input.tenancyEndDate}.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:4px 0"><strong>Deposit held</strong></td><td style="text-align:right"><strong>${fmtCents(res.heldCents)}</strong></td></tr>
              ${rows || `<tr><td style="padding:4px 0;color:#6b7280">No deductions</td><td></td></tr>`}
              <tr><td style="padding:6px 0;border-top:1px solid #e5e7eb"><strong>Refund to you</strong></td><td style="text-align:right;border-top:1px solid #e5e7eb"><strong>${fmtCents(res.refundCents)}</strong></td></tr>
            </table>
            <p style="color:#6b7280;font-size:13px">Refund sent by ${input.refundMethod}${input.refundReference ? ` (ref ${esc(input.refundReference)})` : ""}.</p>
          </div>`,
        });
      }
      return { ...res, sd: undefined, emailed };
    }),
  }),

  // ── Reconciliation ──
  recon: router({
    list: protectedProcedure.input(z.object({ ...book, trustAccountId: z.number().int() })).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "view");
      const d = await db();
      return d.select({ id: trustReconciliations.id, periodMonth: trustReconciliations.periodMonth, cutoffDate: trustReconciliations.cutoffDate, status: trustReconciliations.status, trialBalanceCents: trustReconciliations.trialBalanceCents, journalBalanceCents: trustReconciliations.journalBalanceCents, adjustedBankBalanceCents: trustReconciliations.adjustedBankBalanceCents, finalizedAt: trustReconciliations.finalizedAt })
        .from(trustReconciliations).where(and(eq(trustReconciliations.pmUserId, pm), eq(trustReconciliations.trustAccountId, input.trustAccountId))).orderBy(desc(trustReconciliations.periodMonth));
    }),
    start: protectedProcedure.input(z.object({ ...book, trustAccountId: z.number().int(), periodMonth: ym, cutoffDate: ymd.optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "reconcile");
      const id = await startReconciliation(pm, input.trustAccountId, input.periodMonth, input.cutoffDate);
      await computeAndSave(pm, id);
      return { id };
    }),
    get: protectedProcedure.input(z.object({ ...book, reconId: z.number().int() })).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "view");
      return reconDetail(pm, input.reconId);
    }),
    importCsv: protectedProcedure.input(z.object({ ...book, reconId: z.number().int(), rows: z.array(z.array(z.string().max(500))).max(5000), bankEndingBalanceCents: cents, fileName: z.string().max(200).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "reconcile");
      return importBankStatement(pm, input.reconId, input.rows, input.bankEndingBalanceCents, input.fileName);
    }),
    setBankBalance: protectedProcedure.input(z.object({ ...book, reconId: z.number().int(), bankEndingBalanceCents: cents, cutoffDate: ymd.optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "reconcile");
      return setBankEndingBalance(pm, input.reconId, input.bankEndingBalanceCents, input.cutoffDate);
    }),
    match: protectedProcedure.input(z.object({ ...book, reconId: z.number().int(), lineId: z.number().int(), journalIds: z.array(z.number().int()).min(1) })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "reconcile");
      return matchLine(pm, input.reconId, input.lineId, input.journalIds);
    }),
    unmatch: protectedProcedure.input(z.object({ ...book, reconId: z.number().int(), lineId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "reconcile");
      return unmatchLine(pm, input.reconId, input.lineId);
    }),
    recordBankCharge: protectedProcedure.input(z.object({ ...book, reconId: z.number().int(), lineId: z.number().int() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "reconcile");
      return recordBankCharge(pm, ctx.user.id, input.reconId, input.lineId);
    }),
    finalize: protectedProcedure.input(z.object({ ...book, reconId: z.number().int(), notes: z.string().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "reconcile");
      return finalizeReconciliation(pm, ctx.user.id, input.reconId, input.notes);
    }),
  }),

  // ── Statements & tax ──
  statements: router({
    preview: protectedProcedure.input(z.object({ ...book, ownerId: z.number().int(), periodMonth: ym })).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "view");
      return buildOwnerStatementData(pm, input.ownerId, input.periodMonth);
    }),
    pdf: protectedProcedure.input(z.object({ ...book, ownerId: z.number().int(), periodMonth: ym })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "view");
      const data = await buildOwnerStatementData(pm, input.ownerId, input.periodMonth);
      return { fileName: `${data.owner.name.replace(/[^a-z0-9]+/gi, "-")}-${input.periodMonth}.pdf`, base64: renderStatementPdf(data).toString("base64") };
    }),
    send: protectedProcedure.input(z.object({ ...book, periodMonth: ym, ownerIds: z.array(z.number().int()).optional() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input.bookUserId, "owners");
      const d = await db();
      const owners = (await d.select().from(trustOwners).where(and(eq(trustOwners.pmUserId, pm), eq(trustOwners.status, "active"))))
        .filter((o) => !input.ownerIds || input.ownerIds.includes(o.id));
      const results: { ownerId: number; name: string; emailed: boolean; reason?: string }[] = [];
      for (const o of owners) {
        const data = await buildOwnerStatementData(pm, o.id, input.periodMonth);
        if (!data.properties.length) { results.push({ ownerId: o.id, name: o.name, emailed: false, reason: "No properties for this month" }); continue; }
        const pdf = renderStatementPdf(data);
        let emailed = false;
        if (o.email) {
          emailed = await sendEmail({ to: o.email, subject: `Owner statement — ${input.periodMonth}`, html: statementEmailHtml(data, `${APP_URL()}/owner-portal`), attachments: [{ name: `owner-statement-${input.periodMonth}.pdf`, contentBase64: pdf.toString("base64") }] });
        }
        await d.insert(trustOwnerStatements).values({ pmUserId: pm, trustOwnerId: o.id, periodMonth: input.periodMonth, dataJson: JSON.stringify(data), emailedAt: emailed ? new Date() : null })
          .onDuplicateKeyUpdate({ set: { dataJson: JSON.stringify(data), ...(emailed ? { emailedAt: new Date() } : {}) } });
        results.push({ ownerId: o.id, name: o.name, emailed, reason: o.email ? (emailed ? undefined : "Email service unavailable") : "No email on file" });
      }
      return { results };
    }),
    list: protectedProcedure.input(z.object({ ...book, periodMonth: ym.optional() }).optional()).query(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, input?.bookUserId, "view");
      const d = await db();
      const rows = await d.select({ id: trustOwnerStatements.id, trustOwnerId: trustOwnerStatements.trustOwnerId, periodMonth: trustOwnerStatements.periodMonth, emailedAt: trustOwnerStatements.emailedAt, createdAt: trustOwnerStatements.createdAt }).from(trustOwnerStatements).where(eq(trustOwnerStatements.pmUserId, pm)).orderBy(desc(trustOwnerStatements.periodMonth));
      return input?.periodMonth ? rows.filter((r) => r.periodMonth === input.periodMonth) : rows;
    }),
  }),

  owner1099: protectedProcedure.input(z.object({ ...book, year: z.number().int().min(2020).max(2100) })).query(async ({ ctx, input }) => {
    const pm = await requireBook(ctx.user.id, input.bookUserId, "view");
    return owner1099ForYear(pm, input.year);
  }),

  // ── Staff permissions (extends property-manager delegated access) ──
  staff: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const pm = await requireBook(ctx.user.id, null, "owners");
      const d = await db();
      const rows = await d.select({ access: propertyManagerAccess, perms: trustStaffPermissions, name: users.name, email: users.email })
        .from(propertyManagerAccess)
        .leftJoin(trustStaffPermissions, eq(trustStaffPermissions.accessId, propertyManagerAccess.id))
        .leftJoin(users, eq(users.id, propertyManagerAccess.managerUserId))
        .where(and(eq(propertyManagerAccess.ownerUserId, pm), eq(propertyManagerAccess.status, "active")));
      return rows.map((r) => ({
        accessId: r.access.id, managerUserId: r.access.managerUserId, name: r.name, email: r.email ?? r.access.inviteEmail,
        canViewTrust: !!r.perms?.canViewTrust, canRecordReceipts: !!r.perms?.canRecordReceipts, canDisburse: !!r.perms?.canDisburse,
        canReconcile: !!r.perms?.canReconcile, canManageOwners: !!r.perms?.canManageOwners,
      }));
    }),
    invite: protectedProcedure.input(z.object({ email: z.string().email(), canRecordReceipts: z.boolean().default(true), canDisburse: z.boolean().default(false), canReconcile: z.boolean().default(false), canManageOwners: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, null, "owners");
      const d = await db();
      const [staff] = await d.select().from(users).where(eq(users.email, input.email.toLowerCase()));
      const [staffAlt] = staff ? [staff] : await d.select().from(users).where(eq(users.email, input.email));
      const member = staff ?? staffAlt;
      if (!member) throw new TRPCError({ code: "NOT_FOUND", message: "No Keycove account uses that email. Ask them to sign up (free), then add them." });
      if (member.id === pm) throw new TRPCError({ code: "BAD_REQUEST", message: "That's your own account." });
      const [existing] = await d.select().from(propertyManagerAccess).where(and(eq(propertyManagerAccess.ownerUserId, pm), eq(propertyManagerAccess.managerUserId, member.id), eq(propertyManagerAccess.status, "active")));
      const accessId = existing?.id ?? await createPropertyManagerAccess({ ownerUserId: pm, managerUserId: member.id, allProperties: 1, status: "active", inviteEmail: input.email, canViewPayments: 1 } as any);
      const perms = { canViewTrust: 1, canRecordReceipts: input.canRecordReceipts ? 1 : 0, canDisburse: input.canDisburse ? 1 : 0, canReconcile: input.canReconcile ? 1 : 0, canManageOwners: input.canManageOwners ? 1 : 0 };
      await d.insert(trustStaffPermissions).values({ accessId, ...perms }).onDuplicateKeyUpdate({ set: perms });
      const pmUser = await getUserById(pm);
      await sendEmail({ to: input.email, subject: `${pmUser?.name ?? "A brokerage"} gave you trust-accounting access on Keycove`, html: `<p>You can now work in ${esc(pmUser?.name ?? "the brokerage")}'s trust books on Keycove.</p><p><a href="${APP_URL()}/trust">Open trust accounting</a></p>` }).catch(() => {});
      return { accessId };
    }),
    setPermissions: protectedProcedure.input(z.object({ accessId: z.number().int(), canViewTrust: z.boolean(), canRecordReceipts: z.boolean(), canDisburse: z.boolean(), canReconcile: z.boolean(), canManageOwners: z.boolean() })).mutation(async ({ ctx, input }) => {
      const pm = await requireBook(ctx.user.id, null, "owners");
      const d = await db();
      const [acc] = await d.select().from(propertyManagerAccess).where(and(eq(propertyManagerAccess.id, input.accessId), eq(propertyManagerAccess.ownerUserId, pm)));
      if (!acc) throw new TRPCError({ code: "NOT_FOUND", message: "Access not found" });
      const perms = { canViewTrust: input.canViewTrust ? 1 : 0, canRecordReceipts: input.canRecordReceipts ? 1 : 0, canDisburse: input.canDisburse ? 1 : 0, canReconcile: input.canReconcile ? 1 : 0, canManageOwners: input.canManageOwners ? 1 : 0 };
      await d.insert(trustStaffPermissions).values({ accessId: acc.id, ...perms }).onDuplicateKeyUpdate({ set: perms });
      return { ok: true };
    }),
  }),
});
