/**
 * Trust-accounting rules per state, kept as data so a new state is a new entry,
 * not new code. Only NC is filled in today; other states fall back to NC's
 * (strict) defaults with `verified: false` so the UI can say so.
 *
 * NC sources (read in full 2026-11-08):
 *  - 21 NCAC 58A .0116 Handling of trust money
 *  - 21 NCAC 58A .0117 Accounting for trust money
 *  - 21 NCAC 58A .0118 Trust money belonging to property owners' associations
 *  - 21 NCAC 58A .0108 Retention of records
 *  - G.S. 93A-6(a)(12), (g) trust account requirements
 *  - G.S. 42-50 – 42-56 Tenant Security Deposit Act
 */
export type TrustStateRules = {
  stateCode: string;
  verified: boolean;
  regulator: string;
  /** Deposit trust money within N banking days of receipt. */
  depositDeadlineBankingDays: number;
  /** Max broker (company) funds allowed in a trust account, cents. */
  companyFundsCapCents: number;
  /** Words the account title, statements, deposit tickets and checks must carry. */
  requiredAccountTitleWords: string[];
  /** Account must be a demand deposit account at a federally insured bank doing business in-state. */
  bankRequirement: string;
  interestRequiresWrittenAuthorization: boolean;
  /** Owner (client) balances may never go negative. */
  noNegativeOwnerBalances: boolean;
  reconciliation: { frequency: "monthly"; threeWay: boolean; keepWorksheet: boolean };
  /** One dedicated trust account per owners' association; statements at least every N days. */
  hoa: { dedicatedAccountPerAssociation: boolean; statementMaxDays: number };
  /** Records kept N years after funds disbursed / transaction concluded. */
  recordRetentionYears: number;
  /** Furnish copies of records within N days of a client's written request. */
  clientRecordRequestDays: number;
  securityDeposit: {
    heldInTrustOrBonded: boolean;
    /** Tell the tenant where the deposit is held within N days of lease start. */
    bankNoticeDays: number;
    /** Refund or itemize within N days of move-out. */
    returnDays: number;
    /** Final accounting within N days if damages can't be determined at returnDays. */
    finalAccountingDays: number;
    /** Max deposit as months of rent by tenancy type. */
    maxMonthsRent: { weekToWeek: number; monthToMonth: number; longer: number };
    /** Hold unclaimed balance (tenant address unknown) at least N months. */
    unknownAddressHoldMonths: number;
  };
  citations: { rule: string; url: string; summary: string }[];
};

const OAH = "http://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20a/21%20ncac%2058a%20";

export const NC_RULES: TrustStateRules = {
  stateCode: "NC",
  verified: true,
  regulator: "North Carolina Real Estate Commission (NCREC)",
  depositDeadlineBankingDays: 3,
  companyFundsCapCents: 10_000,
  requiredAccountTitleWords: ["Trust Account", "Escrow Account"],
  bankRequirement: "Demand deposit account at a federally insured depository institution lawfully doing business in North Carolina that lets NCREC inspect its records (G.S. 93A-6(g)).",
  interestRequiresWrittenAuthorization: true,
  noNegativeOwnerBalances: true,
  reconciliation: { frequency: "monthly", threeWay: true, keepWorksheet: true },
  hoa: { dedicatedAccountPerAssociation: true, statementMaxDays: 90 },
  recordRetentionYears: 3,
  clientRecordRequestDays: 10,
  securityDeposit: {
    heldInTrustOrBonded: true,
    bankNoticeDays: 30,
    returnDays: 30,
    finalAccountingDays: 60,
    maxMonthsRent: { weekToWeek: 0.5, monthToMonth: 1.5, longer: 2 },
    unknownAddressHoldMonths: 6,
  },
  citations: [
    { rule: "21 NCAC 58A .0116(a)", url: `${OAH}.0116.pdf`, summary: "Deposit trust money in a trust or escrow account within 3 banking days of receipt." },
    { rule: "21 NCAC 58A .0116(c)", url: `${OAH}.0116.pdf`, summary: "Written authorization from all parties before using an interest-bearing trust account, saying who gets the interest." },
    { rule: "21 NCAC 58A .0116(f)", url: `${OAH}.0116.pdf`, summary: "Never disburse more than the client's balance held in the trust account." },
    { rule: "21 NCAC 58A .0117(b)", url: `${OAH}.0117.pdf`, summary: "Account designated \"Trust Account\" or \"Escrow Account\"; withdrawals on demand without penalty." },
    { rule: "21 NCAC 58A .0117(c)(2)–(3)", url: `${OAH}.0117.pdf`, summary: "Every deposit and payment identifies purpose, remitter/payee and the owner/property ledger; split items itemized per owner/property." },
    { rule: "21 NCAC 58A .0117(c)(4)", url: `${OAH}.0117.pdf`, summary: "Separate running-balance ledger per property or owner; optional security-deposit ledgers; company-funds ledger capped at $100." },
    { rule: "21 NCAC 58A .0117(c)(5)", url: `${OAH}.0117.pdf`, summary: "Chronological journal of every deposit and disbursement with a running balance." },
    { rule: "21 NCAC 58A .0117(d)", url: `${OAH}.0117.pdf`, summary: "Audit trail from deposit tickets and checks to the journal and the ledgers." },
    { rule: "21 NCAC 58A .0117(e)", url: `${OAH}.0117.pdf`, summary: "Monthly reconciliation: trial balance = adjusted bank balance = journal balance at a cutoff date; keep the worksheet." },
    { rule: "21 NCAC 58A .0117(g)", url: `${OAH}.0117.pdf`, summary: "Give a client copies of their records within 10 days of a written request." },
    { rule: "21 NCAC 58A .0118(a)", url: `${OAH}.0118.pdf`, summary: "Owners' association money in a trust account dedicated to that one association; statements at least every 90 days." },
    { rule: "21 NCAC 58A .0108(a)", url: `${OAH}.0108.pdf`, summary: "Keep transaction and trust records 3 years after all funds are disbursed or the transaction concludes, whichever is later." },
    { rule: "G.S. 93A-6(g)", url: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_93A/GS_93A-6.html", summary: "Trust account must be a demand deposit account at a federally insured bank doing business in NC." },
    { rule: "G.S. 42-50", url: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-50.html", summary: "Hold tenant deposits in an NC trust account or bond them; tell the tenant the bank (or bonding company) within 30 days of lease start." },
    { rule: "G.S. 42-51", url: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-51.html", summary: "Permitted uses of a deposit; caps of 2 weeks' (week-to-week), 1.5 months' (month-to-month) or 2 months' rent." },
    { rule: "G.S. 42-52", url: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-52.html", summary: "Itemize damages and return the balance within 30 days of move-out; interim accounting at 30 and final at 60 days if needed." },
  ],
};

const RULES: Record<string, TrustStateRules> = { NC: NC_RULES };

export function rulesFor(stateCode: string | null | undefined): TrustStateRules {
  const code = (stateCode ?? "NC").toUpperCase();
  return RULES[code] ?? { ...NC_RULES, stateCode: code, verified: false, regulator: `${code} real estate commission (rules not yet loaded — NC defaults applied)` };
}

export function supportedStates(): string[] {
  return Object.keys(RULES);
}
