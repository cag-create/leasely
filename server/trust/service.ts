/**
 * Trust-account posting engine. Every money movement goes through `post()`,
 * which (inside one DB transaction, with the trust account row locked):
 *  - writes one journal entry (bank deposit/disbursement) or none (internal
 *    ledger transfer that nets to zero),
 *  - writes one ledger line per owner/property/deposit/company ledger touched,
 *  - refuses anything that would take a client ledger below zero (.0116(f))
 *    or push broker funds over the state cap (.0117(c)(4)(C)).
 * Entries are never edited or deleted; corrections are reversing entries.
 */
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNull, lte, sql } from "drizzle-orm";
import crypto from "crypto";
import { getDb } from "../db";
import {
  trustAccounts, trustFeeAccruals, trustJournalEntries, trustLedgerEntries, trustManagementAgreements,
  trustOwners, trustSecurityDeposits, crmProperties,
  type TrustAccount, type TrustManagementAgreement,
} from "../../drizzle/schema";
import {
  TrustRuleError, assertCompanyCap, assertNoOverdraw, capToBalance, managementFeeForReceipt, oneTimeFee, fmtCents,
} from "./logic";
import { rulesFor } from "./stateRules";

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/**
 * Every trust posting runs at READ COMMITTED. Under MySQL's default REPEATABLE
 * READ, the snapshot is fixed by the first read in the transaction, which often
 * happens before lockAccount() takes the row lock; balance reads after the lock
 * would then miss postings another request committed while we waited, and two
 * concurrent payouts could both pass the overdraw check. With READ COMMITTED,
 * reads after the lock always see the latest committed ledger.
 */
export function trustTx<T>(d: Db, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return d.transaction(fn, { isolationLevel: "read committed" });
}

export async function db(): Promise<Db> {
  const d = await getDb();
  if (!d) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return d;
}

export type LedgerType = "owner" | "security_deposit" | "company" | "broker_fees";
export type EntryType = typeof trustLedgerEntries.$inferInsert["type"];

export type Split = {
  ledgerType: LedgerType;
  trustOwnerId?: number | null;
  crmPropertyId?: number | null;
  agreementId?: number | null;
  crmTenantId?: number | null;
  securityDepositId?: number | null;
  type: EntryType;
  amountCents: number;
  description: string;
  counterparty?: string | null;
  reference?: string | null;
  periodMonth?: string | null;
};

export type JournalInput = {
  entryDate: string;
  method: typeof trustJournalEntries.$inferInsert["method"];
  counterparty: string;
  purpose: string;
  reference?: string | null;
  receivedDate?: string | null;
  stripePaymentIntentId?: string | null;
  sourceKey?: string | null;
  clearedDate?: string | null;
  voidOfEntryId?: number | null;
};

export type PostInput = {
  pmUserId: number;
  trustAccountId: number;
  actorUserId: number | null;
  journal?: JournalInput;
  splits: Split[];
  entryDate?: string; // for internal transfers (no journal)
};

function ledgerKey(s: Split): string {
  if (s.ledgerType === "company" || s.ledgerType === "broker_fees") return s.ledgerType;
  return `${s.ledgerType}:${s.trustOwnerId ?? 0}:${s.crmPropertyId ?? 0}`;
}

function ledgerWhere(trustAccountId: number, s: Pick<Split, "ledgerType" | "trustOwnerId" | "crmPropertyId">) {
  const conds = [eq(trustLedgerEntries.trustAccountId, trustAccountId), eq(trustLedgerEntries.ledgerType, s.ledgerType)];
  if (s.ledgerType === "owner" || s.ledgerType === "security_deposit") {
    conds.push(s.trustOwnerId ? eq(trustLedgerEntries.trustOwnerId, s.trustOwnerId) : isNull(trustLedgerEntries.trustOwnerId));
    conds.push(s.crmPropertyId ? eq(trustLedgerEntries.crmPropertyId, s.crmPropertyId) : isNull(trustLedgerEntries.crmPropertyId));
  }
  return and(...conds);
}

export async function ledgerBalance(d: Db | Tx, trustAccountId: number, s: Pick<Split, "ledgerType" | "trustOwnerId" | "crmPropertyId">): Promise<number> {
  const [row] = await d.select({ bal: trustLedgerEntries.runningBalanceCents }).from(trustLedgerEntries)
    .where(ledgerWhere(trustAccountId, s)).orderBy(desc(trustLedgerEntries.id)).limit(1);
  return row?.bal ?? 0;
}

function ruleToTrpc(err: unknown): never {
  if (err instanceof TrustRuleError) throw new TRPCError({ code: "PRECONDITION_FAILED", message: err.message });
  throw err;
}

/** Post inside an existing transaction (account row must already be locked). */
export async function postInTx(tx: Tx, account: TrustAccount, input: PostInput) {
  const splits = input.splits.filter((s) => s.amountCents !== 0);
  if (splits.length === 0) throw new TrustRuleError("Nothing to post.", "INVALID");
  const total = splits.reduce((s, x) => s + x.amountCents, 0);
  if (!input.journal && total !== 0) throw new TrustRuleError("Internal ledger transfers must net to zero.", "UNBALANCED");
  if (input.journal && total === 0) throw new TrustRuleError("A bank entry can't be zero.", "INVALID");
  const rules = rulesFor(account.stateCode);

  if (input.journal?.sourceKey) {
    const [dup] = await tx.select({ id: trustJournalEntries.id }).from(trustJournalEntries).where(eq(trustJournalEntries.sourceKey, input.journal.sourceKey)).limit(1);
    if (dup) return { journalEntryId: dup.id, ledgerEntryIds: [] as number[], duplicate: true };
  }

  // Balances per ledger, including earlier splits of this same posting.
  const balances = new Map<string, number>();
  const running: number[] = [];
  for (const s of splits) {
    const key = ledgerKey(s);
    if (!balances.has(key)) balances.set(key, await ledgerBalance(tx, account.id, s));
    const bal = balances.get(key)!;
    if ((s.ledgerType === "owner" || s.ledgerType === "security_deposit" || s.ledgerType === "broker_fees") && s.amountCents < 0) {
      assertNoOverdraw(bal, s.amountCents, s.ledgerType === "security_deposit" ? "This security-deposit ledger" : s.ledgerType === "broker_fees" ? "The earned-fees ledger" : "This owner's ledger");
    }
    if (s.ledgerType === "company") {
      if (s.amountCents < 0) assertNoOverdraw(bal, s.amountCents, "The company-funds ledger");
      assertCompanyCap(bal, s.amountCents, rules.companyFundsCapCents);
    }
    balances.set(key, bal + s.amountCents);
    running.push(bal + s.amountCents);
  }

  let journalEntryId: number | null = null;
  const entryDate = input.journal?.entryDate ?? input.entryDate ?? new Date().toISOString().slice(0, 10);
  if (input.journal) {
    const j = input.journal;
    const res = await tx.insert(trustJournalEntries).values({
      pmUserId: input.pmUserId,
      trustAccountId: account.id,
      entryDate: j.entryDate,
      kind: total > 0 ? "deposit" : "disbursement",
      amountCents: total,
      method: j.method,
      reference: j.reference ?? null,
      counterparty: j.counterparty.slice(0, 200),
      purpose: j.purpose.slice(0, 300),
      receivedDate: j.receivedDate ?? (total > 0 ? j.entryDate : null),
      stripePaymentIntentId: j.stripePaymentIntentId ?? null,
      sourceKey: j.sourceKey ?? null,
      clearedDate: j.clearedDate ?? null,
      createdByUserId: input.actorUserId,
      voidOfEntryId: j.voidOfEntryId ?? null,
    });
    journalEntryId = Number((res as any)[0].insertId);
  }
  const transferGroup = input.journal ? null : crypto.randomBytes(8).toString("hex");
  const ledgerEntryIds: number[] = [];
  for (let i = 0; i < splits.length; i++) {
    const s = splits[i];
    const res = await tx.insert(trustLedgerEntries).values({
      pmUserId: input.pmUserId,
      trustAccountId: account.id,
      journalEntryId,
      transferGroup,
      ledgerType: s.ledgerType,
      trustOwnerId: s.trustOwnerId ?? null,
      crmPropertyId: s.crmPropertyId ?? null,
      agreementId: s.agreementId ?? null,
      crmTenantId: s.crmTenantId ?? null,
      securityDepositId: s.securityDepositId ?? null,
      entryDate,
      type: s.type,
      amountCents: s.amountCents,
      runningBalanceCents: running[i],
      counterparty: s.counterparty ?? input.journal?.counterparty ?? null,
      description: s.description.slice(0, 300),
      reference: s.reference ?? input.journal?.reference ?? null,
      periodMonth: s.periodMonth ?? null,
      createdByUserId: input.actorUserId,
    });
    ledgerEntryIds.push(Number((res as any)[0].insertId));
  }
  return { journalEntryId, ledgerEntryIds, duplicate: false };
}

export async function lockAccount(tx: Tx, pmUserId: number, trustAccountId: number): Promise<TrustAccount> {
  const [account] = await tx.select().from(trustAccounts)
    .where(and(eq(trustAccounts.id, trustAccountId), eq(trustAccounts.pmUserId, pmUserId))).for("update");
  if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Trust account not found" });
  if (account.status !== "active") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This trust account is closed." });
  return account;
}

/** Public entry point: one locked transaction per posting. */
export async function post(input: PostInput) {
  const d = await db();
  try {
    return await trustTx(d, async (tx) => {
      const account = await lockAccount(tx, input.pmUserId, input.trustAccountId);
      return postInTx(tx, account, input);
    });
  } catch (err) {
    ruleToTrpc(err);
  }
}

// ─── Lookups ─────────────────────────────────────────────────────────────────

export async function getAgreement(pmUserId: number, agreementId: number): Promise<TrustManagementAgreement> {
  const d = await db();
  const [a] = await d.select().from(trustManagementAgreements)
    .where(and(eq(trustManagementAgreements.id, agreementId), eq(trustManagementAgreements.pmUserId, pmUserId)));
  if (!a) throw new TRPCError({ code: "NOT_FOUND", message: "Management agreement not found" });
  return a;
}

export async function agreementContext(pmUserId: number, agreementId: number) {
  const d = await db();
  const a = await getAgreement(pmUserId, agreementId);
  const [owner] = await d.select().from(trustOwners).where(eq(trustOwners.id, a.trustOwnerId));
  const [property] = await d.select().from(crmProperties).where(eq(crmProperties.id, a.crmPropertyId));
  const label = property ? [property.address, property.city, property.state].filter(Boolean).join(", ") : `Property #${a.crmPropertyId}`;
  return { agreement: a, owner, property, propertyLabel: label };
}

export async function accruedFeesCents(d: Db | Tx, agreementId: number): Promise<number> {
  const [row] = await d.select({ s: sql<number>`COALESCE(SUM(${trustFeeAccruals.amountCents}),0)` }).from(trustFeeAccruals)
    .where(and(eq(trustFeeAccruals.agreementId, agreementId), eq(trustFeeAccruals.status, "accrued")));
  return Number(row?.s ?? 0);
}

async function feesChargedForPeriod(tx: Tx, agreementId: number, periodMonth: string): Promise<number> {
  const [row] = await tx.select({ s: sql<number>`COALESCE(SUM(${trustFeeAccruals.amountCents}),0)` }).from(trustFeeAccruals)
    .where(and(eq(trustFeeAccruals.agreementId, agreementId), eq(trustFeeAccruals.type, "mgmt_fee"), eq(trustFeeAccruals.periodMonth, periodMonth), inArray(trustFeeAccruals.status, ["accrued", "paid"])));
  return Number(row?.s ?? 0);
}

// ─── Receipts ────────────────────────────────────────────────────────────────

export type ReceiptInput = {
  pmUserId: number;
  agreementId: number;
  actorUserId: number | null;
  rentCents: number;
  depositCents: number;
  otherCents: number;
  otherDescription?: string;
  entryDate: string;      // date on the bank register (deposit date, or Stripe payment date)
  receivedDate: string;   // date the broker received the funds
  method: JournalInput["method"];
  reference?: string | null;
  remitter: string;
  crmTenantId?: number | null;
  tenantName?: string | null;
  tenantEmail?: string | null;
  leaseStartDate?: string | null;
  periodMonth: string;    // YYYY-MM the rent covers
  sourceKey?: string | null;
  stripePaymentIntentId?: string | null;
  firstMonthOfNewLease?: boolean;
};

/**
 * Rent (and any deposit) arrives for a managed property: deposit it to the
 * owner's ledger (and the tenant's security-deposit ledger), then accrue the
 * management fee — and leasing fee on a new lease's first month — capped at
 * what the owner actually has.
 */
export async function recordReceipt(input: ReceiptInput) {
  const d = await db();
  try {
    return await trustTx(d, async (tx) => {
      const [a] = await tx.select().from(trustManagementAgreements)
        .where(and(eq(trustManagementAgreements.id, input.agreementId), eq(trustManagementAgreements.pmUserId, input.pmUserId)));
      if (!a) throw new TRPCError({ code: "NOT_FOUND", message: "Management agreement not found" });
      const account = await lockAccount(tx, input.pmUserId, a.trustAccountId);

      if (input.sourceKey) {
        const [dup] = await tx.select({ id: trustJournalEntries.id }).from(trustJournalEntries).where(eq(trustJournalEntries.sourceKey, input.sourceKey)).limit(1);
        if (dup) return { journalEntryId: dup.id, duplicate: true, fees: [] as { type: string; amountCents: number; shortfallCents: number }[] };
      }

      const remitter = input.remitter || input.tenantName || "Tenant";
      const splits: Split[] = [];
      const base = { trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, agreementId: a.id, crmTenantId: input.crmTenantId ?? null, counterparty: remitter, periodMonth: input.periodMonth };
      if (input.rentCents > 0) splits.push({ ...base, ledgerType: "owner", type: "rent_receipt", amountCents: input.rentCents, description: `Rent ${input.periodMonth} from ${remitter}` });
      if (input.otherCents > 0) splits.push({ ...base, ledgerType: "owner", type: "other_receipt", amountCents: input.otherCents, description: input.otherDescription ?? `Other receipt from ${remitter}` });
      let securityDepositId: number | null = null;
      if (input.depositCents > 0) {
        if (a.securityDepositHolder === "broker_trust") {
          const res = await tx.insert(trustSecurityDeposits).values({
            pmUserId: input.pmUserId,
            agreementId: a.id,
            trustAccountId: account.id,
            crmTenantId: input.crmTenantId ?? null,
            tenantName: input.tenantName || remitter,
            tenantEmail: input.tenantEmail ?? null,
            leaseStartDate: input.leaseStartDate ?? null,
            receivedDate: input.receivedDate,
          });
          securityDepositId = Number((res as any)[0].insertId);
          splits.push({ ...base, ledgerType: "security_deposit", type: "deposit_receipt", securityDepositId, amountCents: input.depositCents, description: `Security deposit held for ${input.tenantName || remitter}` });
        } else {
          // Owner holds the deposit under the agreement: it is owner money to forward.
          splits.push({ ...base, ledgerType: "owner", type: "other_receipt", amountCents: input.depositCents, description: `Security deposit from ${input.tenantName || remitter} (owner holds; forward to owner)` });
        }
      }
      const posted = await postInTx(tx, account, {
        pmUserId: input.pmUserId,
        trustAccountId: account.id,
        actorUserId: input.actorUserId,
        journal: {
          entryDate: input.entryDate,
          receivedDate: input.receivedDate,
          method: input.method,
          reference: input.reference,
          counterparty: remitter,
          purpose: [input.rentCents > 0 && `Rent ${input.periodMonth}`, input.depositCents > 0 && "security deposit", input.otherCents > 0 && (input.otherDescription ?? "other")].filter(Boolean).join(" + ") || "Receipt",
          sourceKey: input.sourceKey,
          stripePaymentIntentId: input.stripePaymentIntentId,
        },
        splits,
      });

      // Accrue fees against what the owner now holds.
      const fees: { type: "mgmt_fee" | "leasing_fee"; amountCents: number; shortfallCents: number }[] = [];
      const ownerBal = await ledgerBalance(tx, account.id, { ledgerType: "owner", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId });
      let room = ownerBal - (await accruedFeesCents(tx, a.id));
      const already = await feesChargedForPeriod(tx, a.id, input.periodMonth);
      const mgmt = managementFeeForReceipt(input.rentCents, already, a);
      const wanted: { type: "mgmt_fee" | "leasing_fee"; cents: number }[] = [];
      if (mgmt > 0) wanted.push({ type: "mgmt_fee", cents: mgmt });
      if (input.firstMonthOfNewLease) {
        const lf = oneTimeFee(a.leasingFeeType, a.leasingFeeValue, input.rentCents);
        if (lf > 0) wanted.push({ type: "leasing_fee", cents: lf });
      }
      for (const w of wanted) {
        const { charged, shortfall } = capToBalance(w.cents, room);
        room -= charged;
        if (charged === 0 && shortfall === 0) continue;
        await tx.insert(trustFeeAccruals).values({
          pmUserId: input.pmUserId, trustAccountId: account.id, agreementId: a.id, trustOwnerId: a.trustOwnerId,
          crmPropertyId: a.crmPropertyId, type: w.type, periodMonth: input.periodMonth, amountCents: charged,
          shortfallCents: shortfall, sourceJournalEntryId: posted.journalEntryId,
        });
        fees.push({ type: w.type, amountCents: charged, shortfallCents: shortfall });
      }
      return { journalEntryId: posted.journalEntryId, securityDepositId, duplicate: posted.duplicate, fees };
    });
  } catch (err) {
    ruleToTrpc(err);
  }
}

/** Renewal (or any one-off) fee accrued by the PM against an agreement. */
export async function accrueOneTimeFee(pmUserId: number, agreementId: number, type: "leasing_fee" | "renewal_fee", amountCents: number) {
  const d = await db();
  return trustTx(d, async (tx) => {
    const [a] = await tx.select().from(trustManagementAgreements).where(and(eq(trustManagementAgreements.id, agreementId), eq(trustManagementAgreements.pmUserId, pmUserId)));
    if (!a) throw new TRPCError({ code: "NOT_FOUND", message: "Management agreement not found" });
    await lockAccount(tx, pmUserId, a.trustAccountId);
    const bal = await ledgerBalance(tx, a.trustAccountId, { ledgerType: "owner", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId });
    const room = bal - (await accruedFeesCents(tx, a.id));
    const { charged, shortfall } = capToBalance(amountCents, room);
    const period = new Date().toISOString().slice(0, 7);
    await tx.insert(trustFeeAccruals).values({ pmUserId, trustAccountId: a.trustAccountId, agreementId, trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, type, periodMonth: period, amountCents: charged, shortfallCents: shortfall });
    return { charged, shortfall };
  });
}

/**
 * Move accrued fees out of trust to the brokerage's operating account as ONE
 * bank disbursement itemized per owner/property (.0117(c)(2)).
 */
export async function payAccruedFees(opts: { pmUserId: number; trustAccountId: number; actorUserId: number; entryDate: string; method: JournalInput["method"]; reference?: string | null; operatingAccountLabel: string; accrualIds?: number[] }) {
  const d = await db();
  try {
    return await trustTx(d, async (tx) => {
      const account = await lockAccount(tx, opts.pmUserId, opts.trustAccountId);
      const conds = [eq(trustFeeAccruals.trustAccountId, account.id), eq(trustFeeAccruals.pmUserId, opts.pmUserId), eq(trustFeeAccruals.status, "accrued")];
      if (opts.accrualIds?.length) conds.push(inArray(trustFeeAccruals.id, opts.accrualIds));
      const accruals = (await tx.select().from(trustFeeAccruals).where(and(...conds))).filter((x) => x.amountCents > 0);
      if (accruals.length === 0) throw new TrustRuleError("No accrued fees to pay.", "INVALID");
      const label: Record<string, string> = { mgmt_fee: "Management fee", leasing_fee: "Leasing fee", renewal_fee: "Renewal fee" };
      const posted = await postInTx(tx, account, {
        pmUserId: opts.pmUserId,
        trustAccountId: account.id,
        actorUserId: opts.actorUserId,
        journal: {
          entryDate: opts.entryDate, method: opts.method, reference: opts.reference,
          counterparty: opts.operatingAccountLabel, purpose: `Earned fees (${accruals.length} items)`,
        },
        splits: accruals.map((x) => ({
          ledgerType: "owner" as const, trustOwnerId: x.trustOwnerId, crmPropertyId: x.crmPropertyId, agreementId: x.agreementId,
          type: x.type as EntryType, amountCents: -x.amountCents, periodMonth: x.periodMonth,
          description: `${label[x.type]}${x.periodMonth ? ` ${x.periodMonth}` : ""}`,
        })),
      });
      await tx.update(trustFeeAccruals).set({ status: "paid", paidJournalEntryId: posted.journalEntryId }).where(inArray(trustFeeAccruals.id, accruals.map((x) => x.id)));
      return { journalEntryId: posted.journalEntryId, count: accruals.length, totalCents: accruals.reduce((s, x) => s + x.amountCents, 0) };
    });
  } catch (err) {
    ruleToTrpc(err);
  }
}

// ─── Disbursements ───────────────────────────────────────────────────────────

/** Owner's balance, reserve, accrued fees and what can be paid now, per agreement. */
export async function agreementBalances(d: Db | Tx, a: TrustManagementAgreement) {
  const balanceCents = await ledgerBalance(d, a.trustAccountId, { ledgerType: "owner", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId });
  const feesAccruedCents = await accruedFeesCents(d, a.id);
  const depositsHeldCents = await ledgerBalance(d, a.trustAccountId, { ledgerType: "security_deposit", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId });
  const availableCents = Math.max(0, balanceCents - feesAccruedCents - a.reserveCents);
  return { balanceCents, feesAccruedCents, reserveCents: a.reserveCents, depositsHeldCents, availableCents };
}

/**
 * Pay one owner across one or more of their properties in a single payment,
 * itemized per property. Blocks anything above the property's available
 * balance (balance − accrued fees − reserve).
 */
export async function disburseToOwner(opts: { pmUserId: number; actorUserId: number; items: { agreementId: number; amountCents: number }[]; entryDate: string; method: JournalInput["method"]; reference?: string | null; memo?: string; allowReserve?: boolean }) {
  const d = await db();
  try {
    return await trustTx(d, async (tx) => {
      const agreements = await tx.select().from(trustManagementAgreements).where(and(eq(trustManagementAgreements.pmUserId, opts.pmUserId), inArray(trustManagementAgreements.id, opts.items.map((i) => i.agreementId))));
      if (agreements.length !== opts.items.length) throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });
      const ownerIds = new Set(agreements.map((a) => a.trustOwnerId));
      const accountIds = new Set(agreements.map((a) => a.trustAccountId));
      if (ownerIds.size !== 1) throw new TrustRuleError("A single payment can only go to one owner.", "INVALID");
      if (accountIds.size !== 1) throw new TrustRuleError("These properties are held in different trust accounts; pay them separately.", "INVALID");
      const account = await lockAccount(tx, opts.pmUserId, agreements[0].trustAccountId);
      const [owner] = await tx.select().from(trustOwners).where(eq(trustOwners.id, agreements[0].trustOwnerId));
      const splits: Split[] = [];
      for (const item of opts.items) {
        const a = agreements.find((x) => x.id === item.agreementId)!;
        if (item.amountCents <= 0) continue;
        const b = await agreementBalances(tx, a);
        const limit = opts.allowReserve ? Math.max(0, b.balanceCents - b.feesAccruedCents) : b.availableCents;
        if (item.amountCents > limit) {
          throw new TrustRuleError(`Only ${fmtCents(limit)} is available to pay for this property (balance ${fmtCents(b.balanceCents)}, accrued fees ${fmtCents(b.feesAccruedCents)}${opts.allowReserve ? "" : `, reserve ${fmtCents(b.reserveCents)}`}).`, "OVERDRAW");
        }
        splits.push({ ledgerType: "owner", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, agreementId: a.id, type: "owner_disbursement", amountCents: -item.amountCents, description: opts.memo || `Owner distribution to ${owner?.name ?? "owner"}` });
      }
      return postInTx(tx, account, {
        pmUserId: opts.pmUserId, trustAccountId: account.id, actorUserId: opts.actorUserId,
        journal: { entryDate: opts.entryDate, method: opts.method, reference: opts.reference, counterparty: owner?.name ?? "Owner", purpose: opts.memo || "Owner distribution" },
        splits,
      });
    });
  } catch (err) {
    ruleToTrpc(err);
  }
}

/** Pay a vendor/bill for a property out of the owner's funds. */
export async function payExpense(opts: { pmUserId: number; actorUserId: number; agreementId: number; amountCents: number; payee: string; description: string; entryDate: string; method: JournalInput["method"]; reference?: string | null; useReserve?: boolean }) {
  const d = await db();
  try {
    return await trustTx(d, async (tx) => {
      const [a] = await tx.select().from(trustManagementAgreements).where(and(eq(trustManagementAgreements.id, opts.agreementId), eq(trustManagementAgreements.pmUserId, opts.pmUserId)));
      if (!a) throw new TRPCError({ code: "NOT_FOUND", message: "Management agreement not found" });
      const account = await lockAccount(tx, opts.pmUserId, a.trustAccountId);
      // Repairs may use the reserve (that is what it is for); fees already earned may not be spent.
      const b = await agreementBalances(tx, a);
      const spendable = b.balanceCents - b.feesAccruedCents;
      if (opts.amountCents > spendable) {
        throw new TrustRuleError(`The owner has ${fmtCents(spendable)} available for this property after accrued fees; this bill is ${fmtCents(opts.amountCents)}. Ask the owner to send funds first (NC 21 NCAC 58A .0116(f)).`, "OVERDRAW");
      }
      return postInTx(tx, account, {
        pmUserId: opts.pmUserId, trustAccountId: account.id, actorUserId: opts.actorUserId,
        journal: { entryDate: opts.entryDate, method: opts.method, reference: opts.reference, counterparty: opts.payee, purpose: opts.description },
        splits: [{ ledgerType: "owner", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, agreementId: a.id, type: "expense", amountCents: -opts.amountCents, description: opts.description, counterparty: opts.payee }],
      });
    });
  } catch (err) {
    ruleToTrpc(err);
  }
}

/** Reverse a journal entry by posting its exact opposite (never edit or delete). */
export async function reverseJournalEntry(opts: { pmUserId: number; actorUserId: number; journalEntryId: number; entryDate: string; reason: string }) {
  const d = await db();
  try {
    return await trustTx(d, async (tx) => {
      const [orig] = await tx.select().from(trustJournalEntries).where(and(eq(trustJournalEntries.id, opts.journalEntryId), eq(trustJournalEntries.pmUserId, opts.pmUserId)));
      if (!orig) throw new TRPCError({ code: "NOT_FOUND", message: "Entry not found" });
      const [already] = await tx.select({ id: trustJournalEntries.id }).from(trustJournalEntries).where(eq(trustJournalEntries.voidOfEntryId, orig.id)).limit(1);
      if (already) throw new TrustRuleError("This entry has already been reversed.", "INVALID");
      if (orig.voidOfEntryId) throw new TrustRuleError("This is itself a reversal.", "INVALID");
      const account = await lockAccount(tx, opts.pmUserId, orig.trustAccountId);
      const lines = await tx.select().from(trustLedgerEntries).where(eq(trustLedgerEntries.journalEntryId, orig.id));
      const res = await postInTx(tx, account, {
        pmUserId: opts.pmUserId, trustAccountId: account.id, actorUserId: opts.actorUserId,
        journal: { entryDate: opts.entryDate, method: orig.method, reference: orig.reference, counterparty: orig.counterparty, purpose: `REVERSAL of #${orig.id}: ${opts.reason}`.slice(0, 300), voidOfEntryId: orig.id, receivedDate: null },
        splits: lines.map((l) => ({
          ledgerType: l.ledgerType, trustOwnerId: l.trustOwnerId, crmPropertyId: l.crmPropertyId, agreementId: l.agreementId,
          crmTenantId: l.crmTenantId, securityDepositId: l.securityDepositId, type: l.type === "rent_receipt" || l.type === "deposit_receipt" || l.type === "other_receipt" ? l.type : "adjustment",
          amountCents: -l.amountCents, description: `Reversal: ${l.description}`, periodMonth: l.periodMonth,
        })),
      });
      // Fees accrued on a reversed receipt are waived.
      await tx.update(trustFeeAccruals).set({ status: "waived" }).where(and(eq(trustFeeAccruals.sourceJournalEntryId, orig.id), eq(trustFeeAccruals.status, "accrued")));
      return res;
    });
  } catch (err) {
    ruleToTrpc(err);
  }
}

// ─── Security deposits ───────────────────────────────────────────────────────

export async function depositBalance(d: Db | Tx, securityDepositId: number): Promise<number> {
  const [row] = await d.select({ s: sql<number>`COALESCE(SUM(${trustLedgerEntries.amountCents}),0)` }).from(trustLedgerEntries)
    .where(and(eq(trustLedgerEntries.securityDepositId, securityDepositId), eq(trustLedgerEntries.ledgerType, "security_deposit")));
  return Number(row?.s ?? 0);
}

/**
 * Move-out (G.S. 42-52): apply itemized deductions to the owner and refund the
 * rest to the tenant, in one transaction.
 */
export async function closeSecurityDeposit(opts: { pmUserId: number; actorUserId: number; securityDepositId: number; tenancyEndDate: string; deductions: { description: string; amountCents: number }[]; refundMethod: JournalInput["method"]; refundReference?: string | null; entryDate: string }) {
  const d = await db();
  try {
    return await trustTx(d, async (tx) => {
      const [sd] = await tx.select().from(trustSecurityDeposits).where(and(eq(trustSecurityDeposits.id, opts.securityDepositId), eq(trustSecurityDeposits.pmUserId, opts.pmUserId)));
      if (!sd) throw new TRPCError({ code: "NOT_FOUND", message: "Security deposit not found" });
      if (sd.status === "closed") throw new TrustRuleError("This deposit has already been closed out.", "INVALID");
      const [a] = await tx.select().from(trustManagementAgreements).where(eq(trustManagementAgreements.id, sd.agreementId));
      const account = await lockAccount(tx, opts.pmUserId, sd.trustAccountId);
      const held = await depositBalance(tx, sd.id);
      const deductions = opts.deductions.filter((x) => x.amountCents > 0);
      const deducted = deductions.reduce((s, x) => s + x.amountCents, 0);
      if (deducted > held) throw new TrustRuleError(`Deductions (${fmtCents(deducted)}) exceed the ${fmtCents(held)} deposit held.`, "OVERDRAW");
      const base = { trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, agreementId: a.id, crmTenantId: sd.crmTenantId, securityDepositId: sd.id };
      if (deducted > 0) {
        const splits: Split[] = [];
        for (const x of deductions) {
          splits.push({ ...base, ledgerType: "security_deposit", type: "deposit_applied", amountCents: -x.amountCents, description: `Applied: ${x.description}` });
          splits.push({ ...base, ledgerType: "owner", type: "deposit_applied", amountCents: x.amountCents, description: `Deposit applied (${sd.tenantName}): ${x.description}` });
        }
        await postInTx(tx, account, { pmUserId: opts.pmUserId, trustAccountId: account.id, actorUserId: opts.actorUserId, splits, entryDate: opts.entryDate });
      }
      const refund = held - deducted;
      let refundJournalId: number | null = null;
      if (refund > 0) {
        const r = await postInTx(tx, account, {
          pmUserId: opts.pmUserId, trustAccountId: account.id, actorUserId: opts.actorUserId,
          journal: { entryDate: opts.entryDate, method: opts.refundMethod, reference: opts.refundReference, counterparty: sd.tenantName, purpose: "Security deposit refund" },
          splits: [{ ...base, ledgerType: "security_deposit", type: "deposit_refund", amountCents: -refund, description: `Deposit refund to ${sd.tenantName}` }],
        });
        refundJournalId = r.journalEntryId;
      }
      const today = new Date().toISOString().slice(0, 10);
      await tx.update(trustSecurityDeposits).set({ status: "closed", tenancyEndDate: opts.tenancyEndDate, itemizationSentAt: today, itemizationJson: JSON.stringify(deductions) }).where(eq(trustSecurityDeposits.id, sd.id));
      return { heldCents: held, deductedCents: deducted, refundCents: refund, refundJournalId, sd };
    });
  } catch (err) {
    ruleToTrpc(err);
  }
}

// ─── Reporting helpers ───────────────────────────────────────────────────────

/** Ledger balances as of a date (by entryDate), grouped per ledger. */
export async function ledgerBalancesAsOf(pmUserId: number, trustAccountId: number, cutoffDate: string) {
  const d = await db();
  const rows = await d.select({
    ledgerType: trustLedgerEntries.ledgerType,
    trustOwnerId: trustLedgerEntries.trustOwnerId,
    crmPropertyId: trustLedgerEntries.crmPropertyId,
    bal: sql<number>`SUM(${trustLedgerEntries.amountCents})`,
  }).from(trustLedgerEntries)
    .where(and(eq(trustLedgerEntries.pmUserId, pmUserId), eq(trustLedgerEntries.trustAccountId, trustAccountId), lte(trustLedgerEntries.entryDate, cutoffDate)))
    .groupBy(trustLedgerEntries.ledgerType, trustLedgerEntries.trustOwnerId, trustLedgerEntries.crmPropertyId);
  return rows.map((r) => ({ ...r, bal: Number(r.bal) }));
}
