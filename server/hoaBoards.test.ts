import { describe, expect, it } from "vitest";
import {
  achStripeFeeCents, addBusinessDays, applicationFeeCents, autoMapRoster, buildRosterRow, cardFeeCents, dueDatesBetween,
  homeKey, HOA_PLANS, lateFeeCents, lateMonths, maxLateFeeCents, nthDueDate, planForHomeCount, validateRosterRow,
} from "../shared/hoaBoards";
import { reminderStageFor } from "./hoaBoards/ledger";

describe("Keycove HOA plans", () => {
  it("matches the approved pricing exactly", () => {
    expect(HOA_PLANS.map(p => [p.monthlyCents, p.yearlyCents])).toEqual([[3900, 39780], [7900, 80580], [14900, 151980], [24900, 253980]]);
    for (const p of HOA_PLANS) expect(p.yearlyCents).toBe(Math.round(p.monthlyCents * 12 * 0.85));
  });
  it("picks the smallest plan that fits the home count", () => {
    expect(planForHomeCount(1).tier).toBe("t50");
    expect(planForHomeCount(50).tier).toBe("t50");
    expect(planForHomeCount(51).tier).toBe("t150");
    expect(planForHomeCount(150).tier).toBe("t150");
    expect(planForHomeCount(151).tier).toBe("t500");
    expect(planForHomeCount(500).tier).toBe("t500");
    expect(planForHomeCount(501).tier).toBe("unlimited");
    expect(planForHomeCount(5000).tier).toBe("unlimited");
  });
});

describe("NC late charge cap (47F-3-102(11))", () => {
  it("is the greater of $20/month or 10% of the unpaid installment", () => {
    expect(maxLateFeeCents("NC", 15000)).toBe(2000); // 10% of $150 = $15 → $20
    expect(maxLateFeeCents("NC", 20000)).toBe(2000);
    expect(maxLateFeeCents("NC", 60000)).toBe(6000); // 10% of $600 = $60
    expect(maxLateFeeCents("nc", 60000)).toBe(6000);
  });
  it("caps the board's setting at the statute", () => {
    expect(lateFeeCents({ state: "NC", mode: "flat", flatCents: 5000, percent: 0, unpaidInstallmentCents: 15000 })).toBe(2000);
    expect(lateFeeCents({ state: "NC", mode: "flat", flatCents: 1500, percent: 0, unpaidInstallmentCents: 15000 })).toBe(1500);
    expect(lateFeeCents({ state: "NC", mode: "percent", flatCents: 0, percent: 25, unpaidInstallmentCents: 60000 })).toBe(6000);
    expect(lateFeeCents({ state: "NC", mode: "state_max", flatCents: 0, percent: 0, unpaidInstallmentCents: 30000 })).toBe(3000);
    expect(lateFeeCents({ state: "NC", mode: "state_max", flatCents: 0, percent: 0, unpaidInstallmentCents: 0 })).toBe(0);
  });
  it("has no automatic cap in states without statute data", () => {
    expect(maxLateFeeCents("TX", 10000)).toBeNull();
    expect(lateFeeCents({ state: "TX", mode: "state_max", flatCents: 0, percent: 0, unpaidInstallmentCents: 10000 })).toBe(0);
    expect(lateFeeCents({ state: "TX", mode: "flat", flatCents: 3500, percent: 0, unpaidInstallmentCents: 10000 })).toBe(3500);
  });
});

describe("processing fees", () => {
  it("grosses up card fees so the HOA nets the full amount after 2.9% + 30¢", () => {
    for (const amount of [1000, 15000, 25000, 123456]) {
      const fee = cardFeeCents(amount);
      const total = amount + fee;
      const stripeFee = Math.round(total * 0.029) + 30;
      expect(total - stripeFee).toBeGreaterThanOrEqual(amount);
      expect(total - stripeFee - amount).toBeLessThanOrEqual(1);
    }
    expect(cardFeeCents(0)).toBe(0);
  });
  it("ACH is 0.8% capped at $5", () => {
    expect(achStripeFeeCents(15000)).toBe(120);
    expect(achStripeFeeCents(62500)).toBe(500);
    expect(achStripeFeeCents(100000)).toBe(500);
  });
  it("application fee follows the ACH-cost setting", () => {
    expect(applicationFeeCents({ method: "ach", amountCents: 15000, feeCents: 0, achBearer: "hoa" })).toBe(120);
    expect(applicationFeeCents({ method: "ach", amountCents: 15000, feeCents: 0, achBearer: "keycove" })).toBe(0);
    expect(applicationFeeCents({ method: "card", amountCents: 15000, feeCents: 482, achBearer: "hoa" })).toBe(482);
  });
});

describe("schedules", () => {
  it("keeps the anchor day and clamps month ends", () => {
    expect(nthDueDate("2026-01-31", "monthly", 1)).toBe("2026-02-28");
    expect(nthDueDate("2026-01-31", "monthly", 2)).toBe("2026-03-31");
    expect(nthDueDate("2026-12-01", "quarterly", 1)).toBe("2027-03-01");
    expect(nthDueDate("2026-12-01", "annual", 1)).toBe("2027-12-01");
  });
  it("lists due dates in a window", () => {
    expect(dueDatesBetween("2026-12-01", "monthly", "2026-11-08", "2026-12-15")).toEqual(["2026-12-01"]);
    expect(dueDatesBetween("2026-12-01", "monthly", "2027-01-02", "2027-03-01")).toEqual(["2027-02-01", "2027-03-01"]);
  });
  it("counts late months after the grace period", () => {
    expect(lateMonths("2026-12-01", 15, "2026-12-16")).toBe(0);
    expect(lateMonths("2026-12-01", 15, "2026-12-17")).toBe(1);
    expect(lateMonths("2026-12-01", 15, "2027-01-16")).toBe(1);
    expect(lateMonths("2026-12-01", 15, "2027-01-17")).toBe(2);
  });
  it("reminder stages", () => {
    expect(reminderStageFor("2026-12-01", "2026-11-20", 7, 15)).toBe(0);
    expect(reminderStageFor("2026-12-01", "2026-11-24", 7, 15)).toBe(1);
    expect(reminderStageFor("2026-12-01", "2026-12-01", 7, 15)).toBe(2);
    expect(reminderStageFor("2026-12-01", "2026-12-16", 7, 15)).toBe(2);
    expect(reminderStageFor("2026-12-01", "2026-12-17", 7, 15)).toBe(3);
  });
  it("payoff statements are due in 10 business days", () => {
    expect(addBusinessDays("2026-11-06", 10)).toBe("2026-11-20"); // Fri → Fri two weeks later
  });
});

describe("roster import", () => {
  it("maps common headers and builds rows", () => {
    const m = autoMapRoster(["Lot #", "Homeowner", "Email Address", "Phone", "Monthly Dues", "Street Address"]);
    expect(m).toEqual({ "Lot #": "lot", Homeowner: "ownerName", "Email Address": "email", Phone: "phone", "Monthly Dues": "assessment", "Street Address": "address" });
    const r = buildRosterRow({ "Lot #": "12", Homeowner: "Pat Lee", "Email Address": "PAT@Example.com", Phone: "", "Monthly Dues": "$125.00", "Street Address": "4 Oak Ln" }, m);
    expect(r).toMatchObject({ lot: "12", ownerName: "Pat Lee", email: "pat@example.com", assessmentCents: 12500, address: "4 Oak Ln" });
    expect(validateRosterRow(r)).toEqual([]);
  });
  it("flags bad rows and keys homes stably", () => {
    expect(validateRosterRow({ lot: "", unit: "", address: "", ownerName: "", email: "x", phone: "", assessmentCents: null, mailingAddress: "" })).toHaveLength(3);
    expect(homeKey({ lot: " 12 ", unit: "" })).toBe(homeKey({ lot: "12" }));
    expect(homeKey({ address: "4 Oak Ln." })).toBe(homeKey({ address: "4 oak ln" }));
  });
});
