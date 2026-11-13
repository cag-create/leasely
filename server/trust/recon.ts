/**
 * Monthly three-way reconciliation workflow (21 NCAC 58A .0117(e)):
 * import the bank statement CSV, match bank lines to journal entries, then
 * compare trial balance (sum of ledgers), journal balance and adjusted bank
 * balance (statement − outstanding checks + deposits in transit) at the cutoff.
 * The worksheet is saved and frozen on finalize.
 */
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { crmProperties, trustAccounts, trustBankLines, trustJournalEntries, trustOwners, trustReconciliations } from "../../drizzle/schema";
import { db, ledgerBalancesAsOf, post } from "./service";
import { autoMatch, computeReconciliation, monthBounds, parseBankRows, type MatchCandidate } from "./logic";

async function loadRecon(pmUserId: number, reconId: number) {
  const d = await db();
  const [r] = await d.select().from(trustReconciliations).where(and(eq(trustReconciliations.id, reconId), eq(trustReconciliations.pmUserId, pmUserId)));
  if (!r) throw new TRPCError({ code: "NOT_FOUND", message: "Reconciliation not found" });
  return r;
}

function assertOpen(r: { status: string }) {
  if (r.status === "finalized") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This reconciliation is finalized and can't be changed." });
}

export async function startReconciliation(pmUserId: number, trustAccountId: number, periodMonth: string, cutoffDate?: string) {
  const d = await db();
  const [acct] = await d.select().from(trustAccounts).where(and(eq(trustAccounts.id, trustAccountId), eq(trustAccounts.pmUserId, pmUserId)));
  if (!acct) throw new TRPCError({ code: "NOT_FOUND", message: "Trust account not found" });
  const [existing] = await d.select().from(trustReconciliations).where(and(eq(trustReconciliations.trustAccountId, trustAccountId), eq(trustReconciliations.periodMonth, periodMonth)));
  if (existing) return existing.id;
  const res = await d.insert(trustReconciliations).values({ pmUserId, trustAccountId, periodMonth, cutoffDate: cutoffDate ?? monthBounds(periodMonth).end });
  return Number((res as any)[0].insertId);
}

async function candidates(trustAccountId: number, cutoffDate: string, reconId: number): Promise<MatchCandidate[]> {
  const d = await db();
  const rows = await d.select().from(trustJournalEntries).where(and(
    eq(trustJournalEntries.trustAccountId, trustAccountId),
    lte(trustJournalEntries.entryDate, cutoffDate),
    or(isNull(trustJournalEntries.clearedDate), eq(trustJournalEntries.clearedReconciliationId, reconId)),
  ));
  return rows.map((r) => ({ id: r.id, entryDate: r.entryDate, amountCents: r.amountCents, reference: r.reference, stripePayoutId: r.stripePayoutId, expectedBankDate: r.expectedBankDate }));
}

async function clearJournal(reconId: number, journalIds: number[], clearedDate: string) {
  if (!journalIds.length) return;
  const d = await db();
  await d.update(trustJournalEntries).set({ clearedDate, clearedReconciliationId: reconId }).where(inArray(trustJournalEntries.id, journalIds));
}

async function unclearForRecon(reconId: number, journalIds?: number[]) {
  const d = await db();
  const conds = [eq(trustJournalEntries.clearedReconciliationId, reconId)];
  if (journalIds) {
    if (!journalIds.length) return;
    conds.push(inArray(trustJournalEntries.id, journalIds));
  }
  await d.update(trustJournalEntries).set({ clearedDate: null, clearedReconciliationId: null }).where(and(...conds));
}

export async function importBankStatement(pmUserId: number, reconId: number, rows: string[][], bankEndingBalanceCents: number, fileName?: string) {
  const r = await loadRecon(pmUserId, reconId);
  assertOpen(r);
  const parsed = parseBankRows(rows);
  if (parsed.lines.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No transactions found. The CSV needs a date column and an amount (or debit/credit) column." });
  const d = await db();
  await unclearForRecon(reconId);
  await d.delete(trustBankLines).where(eq(trustBankLines.reconciliationId, reconId));
  const inPeriod = parsed.lines.filter((l) => l.postedDate <= r.cutoffDate);
  const matches = autoMatch(inPeriod, await candidates(r.trustAccountId, r.cutoffDate, reconId));
  for (let i = 0; i < inPeriod.length; i++) {
    const l = inPeriod[i];
    const ids = matches.get(i) ?? [];
    await d.insert(trustBankLines).values({ reconciliationId: reconId, trustAccountId: r.trustAccountId, postedDate: l.postedDate, description: l.description, reference: l.reference, amountCents: l.amountCents, matchedJournalIds: ids.length ? JSON.stringify(ids) : null });
    await clearJournal(reconId, ids, l.postedDate);
  }
  await d.update(trustReconciliations).set({ bankEndingBalanceCents, statementFileName: fileName?.slice(0, 200) ?? null }).where(eq(trustReconciliations.id, reconId));
  const result = await computeAndSave(pmUserId, reconId);
  return { imported: inPeriod.length, skipped: parsed.skipped + (parsed.lines.length - inPeriod.length), matched: matches.size, columns: parsed.columns, result };
}

export async function setBankEndingBalance(pmUserId: number, reconId: number, bankEndingBalanceCents: number, cutoffDate?: string) {
  const r = await loadRecon(pmUserId, reconId);
  assertOpen(r);
  const d = await db();
  await d.update(trustReconciliations).set({ bankEndingBalanceCents, ...(cutoffDate ? { cutoffDate } : {}) }).where(eq(trustReconciliations.id, reconId));
  return computeAndSave(pmUserId, reconId);
}

export async function matchLine(pmUserId: number, reconId: number, lineId: number, journalIds: number[]) {
  const r = await loadRecon(pmUserId, reconId);
  assertOpen(r);
  const d = await db();
  const [line] = await d.select().from(trustBankLines).where(and(eq(trustBankLines.id, lineId), eq(trustBankLines.reconciliationId, reconId)));
  if (!line) throw new TRPCError({ code: "NOT_FOUND", message: "Bank line not found" });
  const cands = await candidates(r.trustAccountId, r.cutoffDate, reconId);
  const chosen = cands.filter((c) => journalIds.includes(c.id));
  if (chosen.length !== journalIds.length) throw new TRPCError({ code: "BAD_REQUEST", message: "One of those entries is already cleared or is after the cutoff." });
  const sum = chosen.reduce((s, c) => s + c.amountCents, 0);
  if (sum !== line.amountCents) throw new TRPCError({ code: "BAD_REQUEST", message: `Selected entries total ${(sum / 100).toFixed(2)}; the bank line is ${(line.amountCents / 100).toFixed(2)}.` });
  const prev: number[] = line.matchedJournalIds ? JSON.parse(line.matchedJournalIds) : [];
  await unclearForRecon(reconId, prev);
  await d.update(trustBankLines).set({ matchedJournalIds: JSON.stringify(journalIds) }).where(eq(trustBankLines.id, lineId));
  await clearJournal(reconId, journalIds, line.postedDate);
  return computeAndSave(pmUserId, reconId);
}

export async function unmatchLine(pmUserId: number, reconId: number, lineId: number) {
  const r = await loadRecon(pmUserId, reconId);
  assertOpen(r);
  const d = await db();
  const [line] = await d.select().from(trustBankLines).where(and(eq(trustBankLines.id, lineId), eq(trustBankLines.reconciliationId, reconId)));
  if (!line) throw new TRPCError({ code: "NOT_FOUND", message: "Bank line not found" });
  const prev: number[] = line.matchedJournalIds ? JSON.parse(line.matchedJournalIds) : [];
  await unclearForRecon(reconId, prev);
  await d.update(trustBankLines).set({ matchedJournalIds: null }).where(eq(trustBankLines.id, lineId));
  return computeAndSave(pmUserId, reconId);
}

/** Record an unmatched bank debit as a service charge paid from company funds, then match it. */
export async function recordBankCharge(pmUserId: number, actorUserId: number, reconId: number, lineId: number) {
  const r = await loadRecon(pmUserId, reconId);
  assertOpen(r);
  const d = await db();
  const [line] = await d.select().from(trustBankLines).where(and(eq(trustBankLines.id, lineId), eq(trustBankLines.reconciliationId, reconId)));
  if (!line || line.amountCents >= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Only a bank debit can be recorded as a service charge." });
  const res = await post({
    pmUserId, trustAccountId: r.trustAccountId, actorUserId,
    journal: { entryDate: line.postedDate, method: "bank", counterparty: "Bank", purpose: `Bank service charge${line.description ? `: ${line.description}` : ""}`, reference: line.reference, clearedDate: line.postedDate },
    splits: [{ ledgerType: "company", type: "bank_charge", amountCents: line.amountCents, description: "Bank service charge" }],
  });
  if (res?.journalEntryId) {
    await d.update(trustJournalEntries).set({ clearedReconciliationId: reconId }).where(eq(trustJournalEntries.id, res.journalEntryId));
    await d.update(trustBankLines).set({ matchedJournalIds: JSON.stringify([res.journalEntryId]) }).where(eq(trustBankLines.id, lineId));
  }
  return computeAndSave(pmUserId, reconId);
}

export async function computeAndSave(pmUserId: number, reconId: number) {
  const r = await loadRecon(pmUserId, reconId);
  const d = await db();
  const journal = await d.select().from(trustJournalEntries).where(and(eq(trustJournalEntries.trustAccountId, r.trustAccountId), lte(trustJournalEntries.entryDate, r.cutoffDate)));
  const balances = await ledgerBalancesAsOf(pmUserId, r.trustAccountId, r.cutoffDate);
  const ownerIds = Array.from(new Set(balances.map((b) => b.trustOwnerId).filter((x): x is number => !!x)));
  const propIds = Array.from(new Set(balances.map((b) => b.crmPropertyId).filter((x): x is number => !!x)));
  const owners = ownerIds.length ? await d.select({ id: trustOwners.id, name: trustOwners.name }).from(trustOwners).where(inArray(trustOwners.id, ownerIds)) : [];
  const props = propIds.length ? await d.select({ id: crmProperties.id, address: crmProperties.address }).from(crmProperties).where(inArray(crmProperties.id, propIds)) : [];
  const typeLabel: Record<string, string> = { owner: "Owner", security_deposit: "Security deposits", company: "Company funds", broker_fees: "Earned fees" };
  const ledgerBalances = balances.filter((b) => b.bal !== 0 || b.ledgerType === "owner").map((b) => ({
    key: `${b.ledgerType}:${b.trustOwnerId ?? 0}:${b.crmPropertyId ?? 0}`,
    ledgerType: b.ledgerType,
    label: b.ledgerType === "company" || b.ledgerType === "broker_fees"
      ? typeLabel[b.ledgerType]
      : `${typeLabel[b.ledgerType]} · ${owners.find((o) => o.id === b.trustOwnerId)?.name ?? "?"} · ${props.find((p) => p.id === b.crmPropertyId)?.address ?? "?"}`,
    balanceCents: b.bal,
  }));
  const result = computeReconciliation({
    cutoffDate: r.cutoffDate,
    bankEndingBalanceCents: r.bankEndingBalanceCents,
    journal: journal.map((j) => ({ id: j.id, entryDate: j.entryDate, amountCents: j.amountCents, clearedDate: j.clearedDate, counterparty: j.counterparty, reference: j.reference, purpose: j.purpose })),
    ledgerBalances,
  });
  const lines = await d.select().from(trustBankLines).where(eq(trustBankLines.reconciliationId, reconId));
  const unmatchedBankLines = lines.filter((l) => !l.matchedJournalIds);
  // Without a bank statement every uncleared item is "outstanding", so the three
  // balances agree trivially. A reconciliation needs the statement first.
  const hasStatement = lines.length > 0 || r.bankEndingBalanceCents !== 0;
  const status = r.status === "finalized" ? "finalized" : !hasStatement ? "draft" : result.balanced && unmatchedBankLines.length === 0 ? "balanced" : "out_of_balance";
  const worksheet = { ...result, balanced: result.balanced && hasStatement, hasStatement, unmatchedBankLines: unmatchedBankLines.map((l) => ({ id: l.id, postedDate: l.postedDate, description: l.description, amountCents: l.amountCents })), bankLineCount: lines.length };
  if (r.status !== "finalized") {
    await d.update(trustReconciliations).set({
      outstandingChecksCents: result.outstandingChecksCents,
      depositsInTransitCents: result.depositsInTransitCents,
      adjustedBankBalanceCents: result.adjustedBankBalanceCents,
      journalBalanceCents: result.journalBalanceCents,
      trialBalanceCents: result.trialBalanceCents,
      status,
      worksheetJson: JSON.stringify(worksheet),
    }).where(eq(trustReconciliations.id, reconId));
  }
  return { ...worksheet, status, reconId };
}

export async function finalizeReconciliation(pmUserId: number, actorUserId: number, reconId: number, notes?: string) {
  const r = await loadRecon(pmUserId, reconId);
  assertOpen(r);
  const result = await computeAndSave(pmUserId, reconId);
  if (!result.hasStatement) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Import this month's bank statement (or enter its ending balance) before finalizing." });
  if (!result.balanced) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The trial balance, journal balance and adjusted bank balance must agree before you finalize (21 NCAC 58A .0117(e)(3))." });
  if (result.unmatchedBankLines.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Record or match every bank line first." });
  const d = await db();
  await d.update(trustReconciliations).set({ status: "finalized", finalizedAt: new Date(), finalizedByUserId: actorUserId, notes: notes ?? null }).where(eq(trustReconciliations.id, reconId));
  return { ok: true };
}

export async function reconDetail(pmUserId: number, reconId: number) {
  // Postings can land after a reconciliation is opened: refresh until finalized.
  if ((await loadRecon(pmUserId, reconId)).status !== "finalized") await computeAndSave(pmUserId, reconId);
  const r = await loadRecon(pmUserId, reconId);
  const d = await db();
  const lines = await d.select().from(trustBankLines).where(eq(trustBankLines.reconciliationId, reconId));
  const cands = await d.select().from(trustJournalEntries).where(and(
    eq(trustJournalEntries.trustAccountId, r.trustAccountId), lte(trustJournalEntries.entryDate, r.cutoffDate),
    or(isNull(trustJournalEntries.clearedDate), eq(trustJournalEntries.clearedReconciliationId, reconId)),
  ));
  return { recon: r, worksheet: r.worksheetJson ? JSON.parse(r.worksheetJson) : null, bankLines: lines.map((l) => ({ ...l, matchedJournalIds: l.matchedJournalIds ? (JSON.parse(l.matchedJournalIds) as number[]) : [] })), journalCandidates: cands };
}
