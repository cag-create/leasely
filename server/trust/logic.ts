/**
 * Pure trust-accounting math — no DB, no Stripe. Unit-tested in
 * server/trustAccounting.test.ts. All money is integer cents.
 */
import type { TrustStateRules } from "./stateRules";

// ─── Dates & banking days ────────────────────────────────────────────────────

export function ymdToUtc(ymd: string): Date {
  return new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)));
}
export function utcToYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(ymd: string, n: number): string {
  const d = ymdToUtc(ymd);
  d.setUTCDate(d.getUTCDate() + n);
  return utcToYmd(d);
}
export function daysBetween(fromYmd: string, toYmd: string): number {
  return Math.round((ymdToUtc(toYmd).getTime() - ymdToUtc(fromYmd).getTime()) / 86_400_000);
}
export function monthBounds(periodMonth: string): { start: string; end: string } {
  const [y, m] = periodMonth.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { start: `${periodMonth}-01`, end: `${periodMonth}-${String(last).padStart(2, "0")}` };
}

function nthWeekday(year: number, month0: number, weekday: number, n: number): string {
  const first = new Date(Date.UTC(year, month0, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return utcToYmd(new Date(Date.UTC(year, month0, 1 + offset + (n - 1) * 7)));
}
function lastWeekday(year: number, month0: number, weekday: number): string {
  const last = new Date(Date.UTC(year, month0 + 1, 0));
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return utcToYmd(new Date(Date.UTC(year, month0 + 1, -offset)));
}

/**
 * Federal Reserve bank holidays for a year. Fixed-date holidays falling on a
 * Sunday are observed Monday; on a Saturday the Fed does not observe them
 * (banks are open the Friday before), which matches how ACH settles.
 */
export function bankHolidays(year: number): Set<string> {
  const fixed = [
    [0, 1],   // New Year's Day
    [5, 19],  // Juneteenth
    [6, 4],   // Independence Day
    [10, 11], // Veterans Day
    [11, 25], // Christmas
  ].map(([m, d]) => {
    const dt = new Date(Date.UTC(year, m, d));
    if (dt.getUTCDay() === 0) dt.setUTCDate(dt.getUTCDate() + 1);
    return utcToYmd(dt);
  });
  return new Set([
    ...fixed,
    nthWeekday(year, 0, 1, 3),  // MLK Day
    nthWeekday(year, 1, 1, 3),  // Presidents Day
    lastWeekday(year, 4, 1),    // Memorial Day
    nthWeekday(year, 8, 1, 1),  // Labor Day
    nthWeekday(year, 9, 1, 2),  // Columbus Day
    nthWeekday(year, 10, 4, 4), // Thanksgiving
  ]);
}

export function isBankingDay(ymd: string): boolean {
  const d = ymdToUtc(ymd);
  const dow = d.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  return !bankHolidays(d.getUTCFullYear()).has(ymd);
}

/** The Nth banking day after `ymd` (the day itself does not count). */
export function addBankingDays(ymd: string, n: number): string {
  let cur = ymd;
  let left = n;
  while (left > 0) {
    cur = addDays(cur, 1);
    if (isBankingDay(cur)) left--;
  }
  return cur;
}

/** 3-banking-day rule (.0116(a)): deadline and whether a deposit date meets it. */
export function depositTimeliness(receivedDate: string, depositedDate: string | null, rules: Pick<TrustStateRules, "depositDeadlineBankingDays">, today?: string) {
  const deadline = addBankingDays(receivedDate, rules.depositDeadlineBankingDays);
  if (depositedDate) {
    return { deadline, status: depositedDate <= deadline ? ("on_time" as const) : ("late" as const), daysLate: Math.max(0, daysBetween(deadline, depositedDate)) };
  }
  const now = today ?? utcToYmd(new Date());
  return { deadline, status: now > deadline ? ("overdue" as const) : ("pending" as const), daysLate: Math.max(0, daysBetween(deadline, now)) };
}

/** G.S. 42-50 / 42-52 security-deposit deadlines. */
export function securityDepositDeadlines(opts: { leaseStartDate?: string | null; receivedDate: string; tenancyEndDate?: string | null }, rules: Pick<TrustStateRules, "securityDeposit">) {
  const start = opts.leaseStartDate || opts.receivedDate;
  return {
    bankNoticeDue: addDays(start, rules.securityDeposit.bankNoticeDays),
    itemizationDue: opts.tenancyEndDate ? addDays(opts.tenancyEndDate, rules.securityDeposit.returnDays) : null,
    finalAccountingDue: opts.tenancyEndDate ? addDays(opts.tenancyEndDate, rules.securityDeposit.finalAccountingDays) : null,
  };
}

/** Max deposit allowed (G.S. 42-51(b)). */
export function maxSecurityDepositCents(monthlyRentCents: number, tenancy: "week_to_week" | "month_to_month" | "longer", rules: Pick<TrustStateRules, "securityDeposit">): number {
  const m = rules.securityDeposit.maxMonthsRent;
  const months = tenancy === "week_to_week" ? m.weekToWeek : tenancy === "month_to_month" ? m.monthToMonth : m.longer;
  return Math.floor(monthlyRentCents * months);
}

// ─── Fees ────────────────────────────────────────────────────────────────────

export type FeeTerms = {
  mgmtFeeType: "percent" | "flat" | "none";
  mgmtFeeBps: number;
  mgmtFeeFlatCents: number;
  mgmtFeeMinCents: number;
};

export function bpsOf(amountCents: number, bps: number): number {
  return Math.round((amountCents * bps) / 10_000);
}

/**
 * Management fee owed on one rent receipt. `alreadyChargedForPeriodCents` is the
 * management fee already taken for the same rent period, so a flat fee or a
 * monthly minimum is charged once per month even when rent arrives in pieces.
 */
export function managementFeeForReceipt(receiptCents: number, alreadyChargedForPeriodCents: number, terms: FeeTerms): number {
  if (receiptCents <= 0) return 0;
  if (terms.mgmtFeeType === "none") return 0;
  if (terms.mgmtFeeType === "flat") return Math.max(0, terms.mgmtFeeFlatCents - alreadyChargedForPeriodCents);
  const pct = bpsOf(receiptCents, terms.mgmtFeeBps);
  if (terms.mgmtFeeMinCents > 0) return Math.max(pct, terms.mgmtFeeMinCents - alreadyChargedForPeriodCents, 0);
  return pct;
}

export function oneTimeFee(type: "percent_of_first_month" | "flat" | "none", value: number, firstMonthRentCents: number): number {
  if (type === "none") return 0;
  if (type === "flat") return value;
  return bpsOf(firstMonthRentCents, value);
}

/**
 * Fees are taken only out of money the owner actually has (.0116(f)): the
 * charge is capped at the owner's balance and the rest is reported as unpaid.
 */
export function capToBalance(chargeCents: number, balanceCents: number): { charged: number; shortfall: number } {
  const charged = Math.max(0, Math.min(chargeCents, balanceCents));
  return { charged, shortfall: chargeCents - charged };
}

// ─── Ledgers ─────────────────────────────────────────────────────────────────

export class TrustRuleError extends Error {
  constructor(message: string, public code: "OVERDRAW" | "COMPANY_CAP" | "UNBALANCED" | "INVALID") {
    super(message);
  }
}

/** Throws if posting `deltaCents` would take a client ledger below zero. */
export function assertNoOverdraw(balanceCents: number, deltaCents: number, label: string) {
  if (balanceCents + deltaCents < 0) {
    throw new TrustRuleError(
      `${label} has ${fmtCents(balanceCents)} in trust; this would take it to ${fmtCents(balanceCents + deltaCents)}. NC 21 NCAC 58A .0116(f) bars disbursing more than a client's balance.`,
      "OVERDRAW",
    );
  }
}

export function assertCompanyCap(balanceCents: number, deltaCents: number, capCents: number) {
  if (deltaCents > 0 && balanceCents + deltaCents > capCents) {
    throw new TrustRuleError(`Broker funds in a trust account are capped at ${fmtCents(capCents)} (21 NCAC 58A .0117(c)(4)(C)). This would bring them to ${fmtCents(balanceCents + deltaCents)}.`, "COMPANY_CAP");
  }
}

/** What can be paid to the owner now: balance less reserve and pending items. */
export function ownerAvailableCents(balanceCents: number, reserveCents: number, pendingCents = 0): number {
  return Math.max(0, balanceCents - reserveCents - pendingCents);
}

export function runningBalances(startCents: number, amounts: number[]): number[] {
  let bal = startCents;
  return amounts.map((a) => (bal += a));
}

/** Splits of one journal entry must add up to it (.0117(c)(2)/(3) itemization). */
export function assertSplitsBalance(journalAmountCents: number, splitAmounts: number[]) {
  const sum = splitAmounts.reduce((s, a) => s + a, 0);
  if (sum !== journalAmountCents) {
    throw new TrustRuleError(`Ledger splits total ${fmtCents(sum)} but the bank entry is ${fmtCents(journalAmountCents)}.`, "UNBALANCED");
  }
}

// ─── Three-way reconciliation (.0117(e)) ─────────────────────────────────────

export type ReconJournalItem = {
  id: number;
  entryDate: string;
  amountCents: number; // signed
  clearedDate: string | null;
  counterparty?: string;
  reference?: string | null;
  purpose?: string;
};

export type ReconLedgerBalance = { key: string; label: string; ledgerType: string; balanceCents: number };

export function computeReconciliation(opts: {
  cutoffDate: string;
  bankEndingBalanceCents: number;
  journal: ReconJournalItem[];
  ledgerBalances: ReconLedgerBalance[];
  openingBalanceCents?: number;
}) {
  const { cutoffDate } = opts;
  const upToCutoff = opts.journal.filter((j) => j.entryDate <= cutoffDate);
  const journalBalanceCents = (opts.openingBalanceCents ?? 0) + upToCutoff.reduce((s, j) => s + j.amountCents, 0);
  const uncleared = upToCutoff.filter((j) => !j.clearedDate || j.clearedDate > cutoffDate);
  const outstandingChecks = uncleared.filter((j) => j.amountCents < 0);
  const depositsInTransit = uncleared.filter((j) => j.amountCents > 0);
  const outstandingChecksCents = -outstandingChecks.reduce((s, j) => s + j.amountCents, 0);
  const depositsInTransitCents = depositsInTransit.reduce((s, j) => s + j.amountCents, 0);
  const adjustedBankBalanceCents = opts.bankEndingBalanceCents - outstandingChecksCents + depositsInTransitCents;
  const trialBalanceCents = opts.ledgerBalances.reduce((s, l) => s + l.balanceCents, 0);
  const negativeLedgers = opts.ledgerBalances.filter((l) => l.balanceCents < 0 && (l.ledgerType === "owner" || l.ledgerType === "security_deposit"));
  const balanced = journalBalanceCents === trialBalanceCents && trialBalanceCents === adjustedBankBalanceCents;
  return {
    cutoffDate,
    bankEndingBalanceCents: opts.bankEndingBalanceCents,
    outstandingChecks,
    depositsInTransit,
    outstandingChecksCents,
    depositsInTransitCents,
    adjustedBankBalanceCents,
    journalBalanceCents,
    trialBalanceCents,
    ledgerBalances: opts.ledgerBalances,
    negativeLedgers,
    differences: {
      journalVsTrial: journalBalanceCents - trialBalanceCents,
      bankVsJournal: adjustedBankBalanceCents - journalBalanceCents,
    },
    balanced,
  };
}

// ─── Bank statement CSV ──────────────────────────────────────────────────────

export type BankLine = { postedDate: string; description: string; reference: string | null; amountCents: number };

export function parseMoneyToCents(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (s.endsWith("-")) { neg = true; s = s.slice(0, -1); }
  if (/\bCR\b/i.test(s)) s = s.replace(/\bCR\b/i, "");
  if (/\bDR\b/i.test(s)) { neg = true; s = s.replace(/\bDR\b/i, ""); }
  s = s.replace(/[$,\s]/g, "");
  if (s.startsWith("-")) { neg = !neg; s = s.slice(1); }
  if (s.startsWith("+")) s = s.slice(1);
  if (!/^\d*(\.\d+)?$/.test(s) || s === "" || s === ".") return null;
  const [whole, frac = ""] = s.split(".");
  const cents = Number(whole || "0") * 100 + Number((frac + "00").slice(0, 2));
  return neg ? -cents : cents;
}

export function parseBankDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  return null;
}

const DATE_HEADERS = ["posting date", "posted date", "transaction date", "date", "post date", "effective date"];
const DESC_HEADERS = ["description", "memo", "payee", "details", "transaction description", "name"];
const REF_HEADERS = ["check number", "check #", "check no", "check", "reference", "ref", "ref #", "serial number", "transaction id"];
const AMOUNT_HEADERS = ["amount", "transaction amount", "net amount"];
const DEBIT_HEADERS = ["debit", "debits", "withdrawal", "withdrawals", "debit amount", "amount debit"];
const CREDIT_HEADERS = ["credit", "credits", "deposit", "deposits", "credit amount", "amount credit"];

function pick(headers: string[], wanted: string[]): number {
  const norm = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, " "));
  for (const w of wanted) {
    const i = norm.indexOf(w);
    if (i >= 0) return i;
  }
  for (const w of wanted) {
    const i = norm.findIndex((h) => h.includes(w));
    if (i >= 0) return i;
  }
  return -1;
}

/**
 * Parse rows (first row = headers) from any common bank CSV export: a signed
 * Amount column, or separate Debit/Credit columns. Skips rows without a date
 * or amount (balance banners, totals).
 */
export function parseBankRows(rows: string[][]): { lines: BankLine[]; skipped: number; columns: Record<string, string | null> } {
  if (rows.length === 0) return { lines: [], skipped: 0, columns: {} };
  // Some banks put a few banner rows first; find the first row with a date-like header.
  let headerIdx = rows.findIndex((r) => pick(r, DATE_HEADERS) >= 0 && (pick(r, AMOUNT_HEADERS) >= 0 || pick(r, DEBIT_HEADERS) >= 0 || pick(r, CREDIT_HEADERS) >= 0));
  if (headerIdx < 0 && rows[0] && parseBankDate(rows[0][0]) && parseMoneyToCents(rows[0][1]) != null) {
    // Headerless export (Wells Fargo style): date, amount, *, check number, description.
    const lines: BankLine[] = [];
    let skipped = 0;
    for (const r of rows) {
      const postedDate = parseBankDate(r[0]);
      const amountCents = parseMoneyToCents(r[1]);
      if (!postedDate || amountCents == null || amountCents === 0) { skipped++; continue; }
      lines.push({ postedDate, amountCents, reference: (r[3] ?? "").trim() || null, description: (r[4] ?? r[2] ?? "").trim().slice(0, 300) });
    }
    return { lines, skipped, columns: { date: "column 1", amount: "column 2", reference: "column 4", description: "column 5", debit: null, credit: null } };
  }
  if (headerIdx < 0) headerIdx = 0;
  const headers = rows[headerIdx];
  const iDate = pick(headers, DATE_HEADERS);
  const iDesc = pick(headers, DESC_HEADERS);
  const iRef = pick(headers, REF_HEADERS);
  const iAmt = pick(headers, AMOUNT_HEADERS);
  const iDebit = pick(headers, DEBIT_HEADERS);
  const iCredit = pick(headers, CREDIT_HEADERS);
  const lines: BankLine[] = [];
  let skipped = 0;
  for (const r of rows.slice(headerIdx + 1)) {
    const postedDate = parseBankDate(r[iDate]);
    let amountCents: number | null = null;
    if (iAmt >= 0 && r[iAmt]?.trim()) amountCents = parseMoneyToCents(r[iAmt]);
    else {
      const debit = iDebit >= 0 ? parseMoneyToCents(r[iDebit]) : null;
      const credit = iCredit >= 0 ? parseMoneyToCents(r[iCredit]) : null;
      if (debit != null || credit != null) amountCents = (credit ? Math.abs(credit) : 0) - (debit ? Math.abs(debit) : 0);
    }
    if (!postedDate || amountCents == null || amountCents === 0) { skipped++; continue; }
    const ref = iRef >= 0 ? (r[iRef] ?? "").trim() : "";
    lines.push({ postedDate, description: iDesc >= 0 ? (r[iDesc] ?? "").trim().slice(0, 300) : "", reference: ref || null, amountCents });
  }
  return {
    lines,
    skipped,
    columns: {
      date: headers[iDate] ?? null, description: headers[iDesc] ?? null, reference: headers[iRef] ?? null,
      amount: headers[iAmt] ?? null, debit: headers[iDebit] ?? null, credit: headers[iCredit] ?? null,
    },
  };
}

// ─── Matching bank lines to the journal ──────────────────────────────────────

export type MatchCandidate = { id: number; entryDate: string; amountCents: number; reference: string | null; stripePayoutId: string | null; expectedBankDate: string | null };

/**
 * Pair bank lines with uncleared journal entries. Order of preference:
 * 1. Same check/reference number and amount.
 * 2. A Stripe payout (several rent receipts landing as one bank credit).
 * 3. A single entry with the same amount, closest date within 10 days.
 * Each journal entry is used once. Returns bank line index → journal ids.
 */
export function autoMatch(lines: BankLine[], candidates: MatchCandidate[]): Map<number, number[]> {
  const used = new Set<number>();
  const result = new Map<number, number[]>();
  const normRef = (s: string | null) => (s ?? "").replace(/^0+/, "").replace(/\s/g, "").toLowerCase();

  // 1. reference
  lines.forEach((l, i) => {
    const ref = normRef(l.reference) || normRef((l.description.match(/(?:check|chk|#)\s*#?\s*(\d{3,})/i) ?? [])[1] ?? null);
    if (!ref) return;
    const c = candidates.find((c) => !used.has(c.id) && c.amountCents === l.amountCents && normRef(c.reference) === ref);
    if (c) { used.add(c.id); result.set(i, [c.id]); }
  });

  // 2. Stripe payout groups
  const groups = new Map<string, MatchCandidate[]>();
  for (const c of candidates) if (c.stripePayoutId) groups.set(c.stripePayoutId, [...(groups.get(c.stripePayoutId) ?? []), c]);
  lines.forEach((l, i) => {
    if (result.has(i)) return;
    for (const [payoutId, members] of Array.from(groups.entries())) {
      if (members.some((m) => used.has(m.id))) continue;
      const total = members.reduce((s, m) => s + m.amountCents, 0);
      const refHit = l.description.includes(payoutId) || l.reference === payoutId;
      const arrival = members[0].expectedBankDate;
      const near = arrival ? Math.abs(daysBetween(arrival, l.postedDate)) <= 5 : true;
      if (total === l.amountCents && (refHit || near)) {
        members.forEach((m) => used.add(m.id));
        result.set(i, members.map((m) => m.id));
        break;
      }
    }
  });

  // 3. single amount match, closest date
  lines.forEach((l, i) => {
    if (result.has(i)) return;
    let best: MatchCandidate | null = null;
    let bestGap = Infinity;
    for (const c of candidates) {
      if (used.has(c.id) || c.amountCents !== l.amountCents) continue;
      const gap = Math.abs(daysBetween(c.expectedBankDate ?? c.entryDate, l.postedDate));
      if (gap <= 10 && gap < bestGap) { best = c; bestGap = gap; }
    }
    if (best) { used.add(best.id); result.set(i, [best.id]); }
  });
  return result;
}

// ─── Owner statements & 1099 ─────────────────────────────────────────────────

export type StatementLedgerEntry = {
  entryDate: string;
  type: string;
  amountCents: number;
  description: string;
  counterparty: string | null;
  reference: string | null;
  crmPropertyId: number | null;
  ledgerType: string;
};

const INCOME_TYPES = new Set(["rent_receipt", "other_receipt", "deposit_applied", "owner_contribution"]);
const FEE_TYPES = new Set(["mgmt_fee", "leasing_fee", "renewal_fee"]);

export function categorize(type: string): "income" | "fees" | "expenses" | "disbursements" | "adjustments" {
  if (INCOME_TYPES.has(type)) return "income";
  if (FEE_TYPES.has(type)) return "fees";
  if (type === "expense") return "expenses";
  if (type === "owner_disbursement") return "disbursements";
  return "adjustments";
}

export function buildPropertyStatement(entries: StatementLedgerEntry[], periodMonth: string, reserveCents: number) {
  const { start, end } = monthBounds(periodMonth);
  const owner = entries.filter((e) => e.ledgerType === "owner").sort((a, b) => a.entryDate.localeCompare(b.entryDate));
  const beginningBalanceCents = owner.filter((e) => e.entryDate < start).reduce((s, e) => s + e.amountCents, 0);
  const lines = owner.filter((e) => e.entryDate >= start && e.entryDate <= end);
  const totals = { income: 0, fees: 0, expenses: 0, disbursements: 0, adjustments: 0 };
  let bal = beginningBalanceCents;
  const withBalance = lines.map((l) => {
    totals[categorize(l.type)] += l.amountCents;
    bal += l.amountCents;
    return { ...l, runningBalanceCents: bal };
  });
  const sd = entries.filter((e) => e.ledgerType === "security_deposit" && e.entryDate <= end).reduce((s, e) => s + e.amountCents, 0);
  return {
    beginningBalanceCents,
    lines: withBalance,
    totals,
    endingBalanceCents: bal,
    reserveCents,
    availableCents: Math.max(0, bal - reserveCents),
    securityDepositsHeldCents: sd,
  };
}

/** IRS 1099-MISC Box 1 (rents) reporting threshold by payment year. */
export function rents1099ThresholdCents(year: number): number {
  // OBBBA §70433 raised it from $600 to $2,000 for payments after 2025 (indexed from 2027).
  return year >= 2026 ? 200_000 : 60_000;
}

/**
 * Gross rents collected for the owner in a calendar year (1099-MISC box 1).
 * Uses gross receipts before management fees; deposits still held for the
 * tenant are not the owner's income until applied.
 */
export function owner1099Totals(entries: { entryDate: string; type: string; amountCents: number; ledgerType: string }[], year: number) {
  const y = String(year);
  const inYear = entries.filter((e) => e.ledgerType === "owner" && e.entryDate.startsWith(y));
  const grossRentsCents = inYear.filter((e) => e.type === "rent_receipt" || e.type === "deposit_applied" || e.type === "other_receipt").reduce((s, e) => s + e.amountCents, 0);
  const feesCents = -inYear.filter((e) => FEE_TYPES.has(e.type)).reduce((s, e) => s + e.amountCents, 0);
  const expensesCents = -inYear.filter((e) => e.type === "expense").reduce((s, e) => s + e.amountCents, 0);
  const disbursedCents = -inYear.filter((e) => e.type === "owner_disbursement").reduce((s, e) => s + e.amountCents, 0);
  const thresholdCents = rents1099ThresholdCents(year);
  return { year, grossRentsCents, feesCents, expensesCents, disbursedCents, thresholdCents, reportable: grossRentsCents >= thresholdCents };
}

// ─── Invoice splitting (rent vs deposit on the first invoice) ────────────────

export type InvoiceLineLite = { amountCents: number; description: string; recurring: boolean };

export function splitReceiptLines(lines: InvoiceLineLite[]): { rentCents: number; depositCents: number; otherCents: number } {
  let rentCents = 0, depositCents = 0, otherCents = 0;
  for (const l of lines) {
    if (l.recurring) rentCents += l.amountCents;
    else if (/security deposit/i.test(l.description)) depositCents += l.amountCents;
    else if (/rent/i.test(l.description)) rentCents += l.amountCents;
    else otherCents += l.amountCents;
  }
  return { rentCents, depositCents, otherCents };
}

export function fmtCents(c: number): string {
  const sign = c < 0 ? "-" : "";
  return `${sign}$${(Math.abs(c) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function trustAccountTitleOk(name: string, rules: Pick<TrustStateRules, "requiredAccountTitleWords">): boolean {
  const n = name.toLowerCase();
  return rules.requiredAccountTitleWords.some((w) => n.includes(w.toLowerCase()));
}
