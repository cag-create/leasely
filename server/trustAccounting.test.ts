/** Pure trust-accounting math: banking days, fees, reconciliation, CSV, matching, statements, 1099. */
import { describe, expect, it } from "vitest";
import {
  addBankingDays, assertCompanyCap, assertNoOverdraw, assertSplitsBalance, autoMatch, bankHolidays, buildPropertyStatement,
  capToBalance, computeReconciliation, depositTimeliness, isBankingDay, managementFeeForReceipt, maxSecurityDepositCents,
  oneTimeFee, owner1099Totals, ownerAvailableCents, parseBankRows, parseMoneyToCents, rents1099ThresholdCents,
  securityDepositDeadlines, splitReceiptLines, trustAccountTitleOk, TrustRuleError,
} from "./trust/logic";
import { NC_RULES, rulesFor } from "./trust/stateRules";
import { SimplePdf, textWidth } from "./trust/pdf";

describe("NC rules data", () => {
  it("encodes the NCREC numbers", () => {
    expect(NC_RULES.depositDeadlineBankingDays).toBe(3);
    expect(NC_RULES.companyFundsCapCents).toBe(10_000);
    expect(NC_RULES.hoa.statementMaxDays).toBe(90);
    expect(NC_RULES.securityDeposit.bankNoticeDays).toBe(30);
    expect(NC_RULES.securityDeposit.returnDays).toBe(30);
    expect(NC_RULES.recordRetentionYears).toBe(3);
  });
  it("falls back to NC defaults, flagged unverified, for other states", () => {
    const tx = rulesFor("tx");
    expect(tx.stateCode).toBe("TX");
    expect(tx.verified).toBe(false);
    expect(tx.depositDeadlineBankingDays).toBe(3);
  });
  it("checks the account title", () => {
    expect(trustAccountTitleOk("Smith Realty Trust Account", NC_RULES)).toBe(true);
    expect(trustAccountTitleOk("Smith Realty ESCROW ACCOUNT", NC_RULES)).toBe(true);
    expect(trustAccountTitleOk("Smith Realty Operating", NC_RULES)).toBe(false);
  });
});

describe("banking days (3-banking-day rule)", () => {
  it("knows Federal Reserve holidays", () => {
    const h = bankHolidays(2026);
    expect(h.has("2026-11-26")).toBe(true); // Thanksgiving
    expect(h.has("2026-01-19")).toBe(true); // MLK
    expect(h.has("2026-05-25")).toBe(true); // Memorial Day
    expect(h.has("2026-07-03")).toBe(false); // July 4 on Saturday: Fed does not observe Friday
    expect(bankHolidays(2027).has("2027-07-05")).toBe(true); // 2027-07-04 is Sunday → observed Monday
    expect(bankHolidays(2027).has("2027-07-04")).toBe(false);
    expect(bankHolidays(2022).has("2022-12-26")).toBe(true); // Christmas on Sunday → Monday
  });
  it("skips weekends and holidays", () => {
    expect(isBankingDay("2026-11-07")).toBe(false); // Saturday
    expect(isBankingDay("2026-11-11")).toBe(false); // Veterans Day
    expect(isBankingDay("2026-11-27")).toBe(true);  // day after Thanksgiving
    expect(addBankingDays("2026-11-25", 3)).toBe("2026-12-01"); // Wed before Thanksgiving
    expect(addBankingDays("2026-11-06", 3)).toBe("2026-11-12"); // Fri → Mon, Tue, (Wed holiday) Thu
    expect(addBankingDays("2026-11-07", 3)).toBe("2026-11-12"); // received Saturday
  });
  it("grades deposits against the deadline", () => {
    expect(depositTimeliness("2026-11-25", "2026-12-01", NC_RULES)).toMatchObject({ deadline: "2026-12-01", status: "on_time" });
    expect(depositTimeliness("2026-11-25", "2026-12-02", NC_RULES)).toMatchObject({ status: "late", daysLate: 1 });
    expect(depositTimeliness("2026-11-25", null, NC_RULES, "2026-11-30").status).toBe("pending");
    expect(depositTimeliness("2026-11-25", null, NC_RULES, "2026-12-03").status).toBe("overdue");
  });
});

describe("security deposits (G.S. 42-50 to 42-52)", () => {
  it("computes notice and return deadlines", () => {
    const dl = securityDepositDeadlines({ leaseStartDate: "2026-11-01", receivedDate: "2026-10-28", tenancyEndDate: "2027-10-31" }, NC_RULES);
    expect(dl.bankNoticeDue).toBe("2026-12-01");
    expect(dl.itemizationDue).toBe("2027-11-30");
    expect(dl.finalAccountingDue).toBe("2027-12-30");
  });
  it("caps the deposit by tenancy type", () => {
    expect(maxSecurityDepositCents(150_000, "longer", NC_RULES)).toBe(300_000);
    expect(maxSecurityDepositCents(150_000, "month_to_month", NC_RULES)).toBe(225_000);
    expect(maxSecurityDepositCents(150_000, "week_to_week", NC_RULES)).toBe(75_000);
  });
});

describe("fees", () => {
  const pct = { mgmtFeeType: "percent" as const, mgmtFeeBps: 800, mgmtFeeFlatCents: 0, mgmtFeeMinCents: 0 };
  it("percentage of rent collected, rounded to the cent", () => {
    expect(managementFeeForReceipt(150_000, 0, pct)).toBe(12_000);
    expect(managementFeeForReceipt(123_457, 0, pct)).toBe(9_877);
    expect(managementFeeForReceipt(0, 0, pct)).toBe(0);
  });
  it("monthly minimum is charged once across partial payments", () => {
    const withMin = { ...pct, mgmtFeeMinCents: 10_000 };
    expect(managementFeeForReceipt(50_000, 0, withMin)).toBe(10_000);      // 8% = 4,000 < min
    expect(managementFeeForReceipt(50_000, 10_000, withMin)).toBe(4_000);  // min met; plain 8%
  });
  it("flat fee once per period", () => {
    const flat = { mgmtFeeType: "flat" as const, mgmtFeeBps: 0, mgmtFeeFlatCents: 9_900, mgmtFeeMinCents: 0 };
    expect(managementFeeForReceipt(150_000, 0, flat)).toBe(9_900);
    expect(managementFeeForReceipt(150_000, 9_900, flat)).toBe(0);
  });
  it("leasing / renewal fees", () => {
    expect(oneTimeFee("percent_of_first_month", 5_000, 150_000)).toBe(75_000);
    expect(oneTimeFee("flat", 25_000, 150_000)).toBe(25_000);
    expect(oneTimeFee("none", 25_000, 150_000)).toBe(0);
  });
  it("never takes more than the owner holds", () => {
    expect(capToBalance(12_000, 50_000)).toEqual({ charged: 12_000, shortfall: 0 });
    expect(capToBalance(12_000, 5_000)).toEqual({ charged: 5_000, shortfall: 7_000 });
    expect(capToBalance(12_000, -100)).toEqual({ charged: 0, shortfall: 12_000 });
  });
});

describe("ledger guards", () => {
  it("blocks a client ledger from going negative (.0116(f))", () => {
    expect(() => assertNoOverdraw(10_000, -10_000, "Owner")).not.toThrow();
    expect(() => assertNoOverdraw(10_000, -10_001, "Owner")).toThrow(TrustRuleError);
  });
  it("caps company funds at $100 (.0117(c)(4)(C))", () => {
    expect(() => assertCompanyCap(5_000, 5_000, 10_000)).not.toThrow();
    expect(() => assertCompanyCap(5_000, 5_001, 10_000)).toThrow(/capped/);
    expect(() => assertCompanyCap(20_000, -500, 10_000)).not.toThrow(); // paying a charge always allowed
  });
  it("owner available = balance − reserve − pending", () => {
    expect(ownerAvailableCents(150_000, 20_000, 12_000)).toBe(118_000);
    expect(ownerAvailableCents(10_000, 20_000)).toBe(0);
  });
  it("splits must equal the bank entry", () => {
    expect(() => assertSplitsBalance(-150_000, [-100_000, -50_000])).not.toThrow();
    expect(() => assertSplitsBalance(-150_000, [-100_000, -49_999])).toThrow(/splits total/);
  });
});

describe("three-way reconciliation", () => {
  const journal = [
    { id: 1, entryDate: "2026-10-01", amountCents: 500_000, clearedDate: "2026-10-01" }, // opening balance
    { id: 2, entryDate: "2026-10-03", amountCents: 150_000, clearedDate: "2026-10-06" }, // rent via Stripe payout
    { id: 3, entryDate: "2026-10-10", amountCents: -120_000, clearedDate: "2026-10-12" }, // owner ACH
    { id: 4, entryDate: "2026-10-28", amountCents: -30_000, clearedDate: null },         // check not yet cashed
    { id: 5, entryDate: "2026-10-31", amountCents: 140_000, clearedDate: "2026-11-03" }, // deposit in transit
    { id: 6, entryDate: "2026-11-02", amountCents: -99_000, clearedDate: null },         // after cutoff: ignored
  ];
  const ledgers = [
    { key: "owner:1:1", label: "Owner A", ledgerType: "owner", balanceCents: 400_000 },
    { key: "owner:2:2", label: "Owner B", ledgerType: "owner", balanceCents: 190_000 },
    { key: "sd:1:1", label: "Deposits", ledgerType: "security_deposit", balanceCents: 50_000 },
  ];
  it("balances when trial = journal = adjusted bank", () => {
    // bank: 500,000 + 150,000 − 120,000 = 530,000 at statement end
    const r = computeReconciliation({ cutoffDate: "2026-10-31", bankEndingBalanceCents: 530_000, journal, ledgerBalances: ledgers });
    expect(r.journalBalanceCents).toBe(640_000);
    expect(r.outstandingChecksCents).toBe(30_000);
    expect(r.depositsInTransitCents).toBe(140_000);
    expect(r.adjustedBankBalanceCents).toBe(640_000);
    expect(r.trialBalanceCents).toBe(640_000);
    expect(r.balanced).toBe(true);
  });
  it("reports the variance when it doesn't", () => {
    const r = computeReconciliation({ cutoffDate: "2026-10-31", bankEndingBalanceCents: 529_000, journal, ledgerBalances: ledgers });
    expect(r.balanced).toBe(false);
    expect(r.differences.bankVsJournal).toBe(-1_000);
  });
  it("flags a negative owner ledger even if totals agree", () => {
    const bad = [...ledgers, { key: "owner:3:3", label: "C", ledgerType: "owner", balanceCents: -5_000 }, { key: "owner:4:4", label: "D", ledgerType: "owner", balanceCents: 5_000 }];
    const r = computeReconciliation({ cutoffDate: "2026-10-31", bankEndingBalanceCents: 530_000, journal, ledgerBalances: bad });
    expect(r.balanced).toBe(true);
    expect(r.negativeLedgers).toHaveLength(1);
  });
});

describe("bank CSV import", () => {
  it("parses money in every bank format", () => {
    expect(parseMoneyToCents("$1,234.56")).toBe(123_456);
    expect(parseMoneyToCents("(45.10)")).toBe(-4_510);
    expect(parseMoneyToCents("-0.5")).toBe(-50);
    expect(parseMoneyToCents("12.3")).toBe(1_230);
    expect(parseMoneyToCents("100.00-")).toBe(-10_000);
    expect(parseMoneyToCents("")).toBeNull();
    expect(parseMoneyToCents("abc")).toBeNull();
  });
  it("Chase layout (signed Amount, check column)", () => {
    const rows = [
      ["Details", "Posting Date", "Description", "Amount", "Type", "Balance", "Check or Slip #"],
      ["CREDIT", "10/06/2026", "STRIPE TRANSFER ST-ABC", "1500.00", "ACH_CREDIT", "6500.00", ""],
      ["CHECK", "10/29/2026", "CHECK 1043", "-300.00", "CHECK_PAID", "6200.00", "1043"],
    ];
    const r = parseBankRows(rows);
    expect(r.lines).toEqual([
      { postedDate: "2026-10-06", description: "STRIPE TRANSFER ST-ABC", reference: null, amountCents: 150_000 },
      { postedDate: "2026-10-29", description: "CHECK 1043", reference: "1043", amountCents: -30_000 },
    ]);
  });
  it("debit/credit columns with banner rows (BofA style)", () => {
    const rows = [
      ["Description", "", "Summary Amt."],
      ["Beginning balance as of 10/01/2026", "", "5,000.00"],
      [],
      ["Date", "Description", "Debit", "Credit", "Running Bal."],
      ["10/12/2026", "ACH OWNER DIST", "1,200.00", "", "3,800.00"],
      ["10/15/2026", "DEPOSIT", "", "250.00", "4,050.00"],
    ];
    const r = parseBankRows(rows);
    expect(r.lines.map((l) => l.amountCents)).toEqual([-120_000, 25_000]);
  });
  it("headerless Wells Fargo layout", () => {
    const rows = [["10/06/2026", "1500.00", "*", "", "STRIPE PAYOUT"], ["10/29/2026", "-300.00", "*", "1043", "CHECK"]];
    const r = parseBankRows(rows);
    expect(r.lines[1]).toMatchObject({ amountCents: -30_000, reference: "1043" });
  });
});

describe("matching bank lines to the journal", () => {
  const cands = [
    { id: 10, entryDate: "2026-10-03", amountCents: 100_000, reference: "pi_1", stripePayoutId: "po_A", expectedBankDate: "2026-10-06" },
    { id: 11, entryDate: "2026-10-03", amountCents: 50_000, reference: "pi_2", stripePayoutId: "po_A", expectedBankDate: "2026-10-06" },
    { id: 12, entryDate: "2026-10-28", amountCents: -30_000, reference: "1043", stripePayoutId: null, expectedBankDate: null },
    { id: 13, entryDate: "2026-10-10", amountCents: -120_000, reference: null, stripePayoutId: null, expectedBankDate: null },
    { id: 14, entryDate: "2026-10-20", amountCents: -120_000, reference: null, stripePayoutId: null, expectedBankDate: null },
  ];
  it("pairs checks by number, Stripe payouts as a group, others by amount and nearest date", () => {
    const lines = [
      { postedDate: "2026-10-06", description: "STRIPE TRANSFER", reference: null, amountCents: 150_000 },
      { postedDate: "2026-10-30", description: "CHECK 1043", reference: "1043", amountCents: -30_000 },
      { postedDate: "2026-10-21", description: "ACH", reference: null, amountCents: -120_000 },
      { postedDate: "2026-10-11", description: "ACH", reference: null, amountCents: -120_000 },
      { postedDate: "2026-10-15", description: "SERVICE FEE", reference: null, amountCents: -1_500 },
    ];
    const m = autoMatch(lines, cands);
    expect(m.get(0)).toEqual([10, 11]);
    expect(m.get(1)).toEqual([12]);
    expect(m.get(2)).toEqual([14]);
    expect(m.get(3)).toEqual([13]);
    expect(m.has(4)).toBe(false);
  });
});

describe("statements and 1099", () => {
  const entries = [
    { entryDate: "2026-09-05", type: "rent_receipt", amountCents: 150_000, description: "Rent", counterparty: "T", reference: null, crmPropertyId: 1, ledgerType: "owner" },
    { entryDate: "2026-09-10", type: "owner_disbursement", amountCents: -130_000, description: "Dist", counterparty: "O", reference: null, crmPropertyId: 1, ledgerType: "owner" },
    { entryDate: "2026-10-05", type: "rent_receipt", amountCents: 150_000, description: "Rent", counterparty: "T", reference: null, crmPropertyId: 1, ledgerType: "owner" },
    { entryDate: "2026-10-06", type: "mgmt_fee", amountCents: -12_000, description: "Fee", counterparty: null, reference: null, crmPropertyId: 1, ledgerType: "owner" },
    { entryDate: "2026-10-15", type: "expense", amountCents: -8_500, description: "Plumber", counterparty: "ABC", reference: null, crmPropertyId: 1, ledgerType: "owner" },
    { entryDate: "2026-10-05", type: "deposit_receipt", amountCents: 150_000, description: "SD", counterparty: "T", reference: null, crmPropertyId: 1, ledgerType: "security_deposit" },
  ];
  it("builds a month with beginning/ending balances and category totals", () => {
    const s = buildPropertyStatement(entries, "2026-10", 20_000);
    expect(s.beginningBalanceCents).toBe(20_000);
    expect(s.totals).toMatchObject({ income: 150_000, fees: -12_000, expenses: -8_500, disbursements: 0 });
    expect(s.endingBalanceCents).toBe(149_500);
    expect(s.lines.at(-1)?.runningBalanceCents).toBe(149_500);
    expect(s.availableCents).toBe(129_500);
    expect(s.securityDepositsHeldCents).toBe(150_000);
  });
  it("totals gross rents for 1099-MISC box 1 with the year's threshold", () => {
    const t = owner1099Totals(entries, 2026);
    expect(t.grossRentsCents).toBe(300_000);
    expect(t.feesCents).toBe(12_000);
    expect(t.reportable).toBe(true);
    expect(rents1099ThresholdCents(2025)).toBe(60_000);
    expect(rents1099ThresholdCents(2026)).toBe(200_000);
    expect(owner1099Totals(entries.slice(0, 1), 2026).reportable).toBe(false);
  });
  it("splits a first invoice into rent and deposit", () => {
    expect(splitReceiptLines([
      { amountCents: 150_000, description: "Monthly rent — 1 Main St", recurring: true },
      { amountCents: 150_000, description: "Security deposit — 1 Main St", recurring: false },
      { amountCents: 2_500, description: "Pet fee", recurring: false },
    ])).toEqual({ rentCents: 150_000, depositCents: 150_000, otherCents: 2_500 });
  });
});

describe("PDF writer", () => {
  it("produces a valid PDF with an xref table", () => {
    const pdf = new SimplePdf();
    pdf.text(48, 48, "Owner Statement (October) \\ test", { size: 14, bold: true });
    pdf.newPage();
    pdf.text(500, 48, "$1,234.56", { align: "right" });
    const buf = pdf.toBuffer((p, t) => `Page ${p} of ${t}`);
    const s = buf.toString("latin1");
    expect(s.startsWith("%PDF-1.4")).toBe(true);
    expect(s).toContain("/Count 2");
    expect(s).toContain("\\(October\\) \\\\ test");
    const xrefAt = Number(s.match(/startxref\n(\d+)/)![1]);
    expect(s.slice(xrefAt, xrefAt + 4)).toBe("xref");
    expect(textWidth("$1,234.56", 10)).toBeGreaterThan(30);
  });
});

describe("processing fee estimate", () => {
  it("ACH 0.8% capped at $5; card 2.9% + 30¢", async () => {
    const { estimateProcessingFeeCents } = await import("./payments/processingFee");
    expect(estimateProcessingFeeCents(150_000, "ach")).toBe(500);
    expect(estimateProcessingFeeCents(40_000, "ach")).toBe(320);
    expect(estimateProcessingFeeCents(150_000, "card")).toBe(4_380);
    expect(estimateProcessingFeeCents(0, "card")).toBe(0);
  });
});

describe("statement address lines", () => {
  it("keeps city, state and ZIP together", async () => {
    const { addressLines } = await import("./trust/statements");
    expect(addressLines("1 Owner Way, Raleigh, NC 27601")).toEqual(["1 Owner Way", "Raleigh, NC 27601"]);
    expect(addressLines("Acme LLC\n1 Owner Way\nRaleigh, NC 27601")).toEqual(["Acme LLC", "1 Owner Way", "Raleigh, NC 27601"]);
  });
});
