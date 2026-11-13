// State lease templates: data integrity, computed values, lease-break clause
// and statutory carve-outs, approval gating.
import { describe, expect, it } from "vitest";
import { allStateProfiles, getStateProfile, isStateApproved, stateTemplateBody, stateTemplateHash, approvedStateCodes, generatedSeedTemplates } from "./leases/states";
import { KNOWN_PLACEHOLDERS, protectedRights } from "./leases/states/builder";
import { computeLeaseValues, lateFeeCap, earlyTerminationFeeCap, deriveEndDate, termMonths, ordinal } from "./leases/states/compute";
import { renderTemplate, hasUnresolvedPlaceholders } from "./leases/render";
import { formatDate, money } from "./leases/utils";
import { LEASE_STATE_APPROVALS, STATE_NAMES, APPROVED_LEASE_STATE_CODES } from "@shared/leaseStateApprovals";
import type { StateLawProfile } from "./leases/states/types";

const FULL_VARS = {
  landlord_name: "L", landlord_address: "1 Main", landlord_phone: "555-0100", deposit_institution: "First Bank, 1 Bank St", tenant_name: "T", tenant_email: "t@example.com",
  property_address: "2 Elm", unit_or_room_label: "Room A", occupants: "Tenant only",
  lease_start_date: "2027-01-01", lease_term: "12_months", monthly_rent: 1000, rent_due_day: 1,
  payment_methods: "ACH", late_fee: 10, security_deposit: 500, utilities: "Water",
  pets_allowed: "No", parking: "Street", co_living_rules: "Be kind",
};

const profiles = allStateProfiles();
const textOf = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");

describe("state lease coverage", () => {
  it("has a profile for all 50 states + DC", () => {
    const missing = Object.keys(STATE_NAMES).filter(c => !getStateProfile(c));
    expect(missing).toEqual([]);
    expect(profiles.length).toBe(51);
  });

  it("generates residential + co-living seeds for every state", () => {
    const seeds = generatedSeedTemplates();
    expect(seeds.length).toBe(profiles.length * 2);
    for (const p of profiles) {
      expect(seeds.some(s => s.state === p.code && s.category === "standard_residential")).toBe(true);
      expect(seeds.some(s => s.state === p.code && s.category === "coliving_room_rental")).toBe(true);
    }
  });
});

describe.each(profiles.map(p => [p.code, p] as [string, StateLawProfile]))("%s profile", (code, p) => {
  it("is internally consistent", () => {
    expect(p.code).toBe(code);
    expect(p.name).toBe(STATE_NAMES[code]);
    expect(p.framework.length).toBeGreaterThan(10);
    expect(p.deposit.returnDays).toBeGreaterThan(0);
    expect(p.deposit.returnDays).toBeLessThanOrEqual(60);
    if (p.deposit.maxMonths !== null) expect(p.deposit.maxMonths).toBeGreaterThan(0);
    expect(p.deposit.returnRule.length).toBeGreaterThan(20);
    expect(p.notice.monthToMonthDays).toBeGreaterThan(0);
    expect(p.notice.monthToMonthRule.length).toBeGreaterThan(10);
    expect(p.notice.entryRule.length).toBeGreaterThan(10);
    expect(p.eviction.rule.length).toBeGreaterThan(10);
    expect(p.habitability.rule.length).toBeGreaterThan(10);
    expect(p.earlyTermination.mitigation.rule.length).toBeGreaterThan(10);
    expect(p.sources.length).toBeGreaterThan(2);
    for (const s of p.sources) expect(s.url).toMatch(/^https?:\/\//);
    expect(["high", "medium", "low"]).toContain(p.confidence);
    if (["percent", "greater_of", "lesser_of"].includes(p.lateFee.capType)) expect(p.lateFee.capPercent).toBeGreaterThan(0);
    if (["flat", "greater_of", "lesser_of"].includes(p.lateFee.capType)) expect(p.lateFee.capFlat).toBeGreaterThan(0);
    if (p.lateFee.capType !== "none" && p.lateFee.capType !== "reasonable") expect(p.lateFee.capRule.length).toBeGreaterThan(5);
  });

  it("uses only known placeholders and no markup in lease text", () => {
    const texts = [
      ...p.disclosures.map(d => d.text),
      ...(p.additionalClauses ?? []).map(c => c.text),
      ...protectedRights(p).flatMap(r => [r.eligible, r.notice, r.documentation, r.liability]),
    ];
    for (const t of texts) {
      for (const m of t.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) expect(KNOWN_PLACEHOLDERS as readonly string[]).toContain(m[1]);
      expect(t).not.toMatch(/<[a-z/][^>]*>/i);
    }
  });

  it("computes the early termination fee: 2 months by default, clamped to any statutory cap", () => {
    const cap = earlyTerminationFeeCap(p, 1000);
    const { vars } = computeLeaseValues({ ...FULL_VARS, state: code }, p);
    expect(vars.early_termination_fee).toBe(cap === null ? 2000 : Math.min(2000, cap));
    expect(vars.early_termination_notice_days).toBe("30");
    const custom = computeLeaseValues({ ...FULL_VARS, early_termination_fee: 750, early_termination_notice_days: 45 }, p).vars;
    expect(custom.early_termination_fee).toBe(cap === null ? 750 : Math.min(750, cap));
    expect(custom.early_termination_notice_days).toBe("45");
  });

  it("clamps a late fee above the statutory cap and warns", () => {
    const cap = lateFeeCap(p, 1000);
    const r = computeLeaseValues({ ...FULL_VARS, late_fee: 5000 }, p);
    if (cap === null) {
      expect(r.vars.late_fee).toBe(5000);
    } else {
      expect(r.vars.late_fee).toBe(cap);
      expect(r.warnings.some(w => w.includes("late fee"))).toBe(true);
    }
  });

  it("warns when the deposit exceeds the statutory cap", () => {
    const r = computeLeaseValues({ ...FULL_VARS, security_deposit: 10000 }, p);
    expect(r.warnings.some(w => w.includes("security deposit"))).toBe(p.deposit.maxMonths !== null && p.deposit.maxMonths * 1000 < 10000);
  });

  for (const kind of ["residential", "coliving"] as const) {
    it(`renders a complete ${kind} lease with the lease-break clause and every carve-out`, () => {
      const r = renderTemplate(stateTemplateBody(p, kind), { ...FULL_VARS, state: code });
      expect(r.unresolved).toEqual([]);
      expect(hasUnresolvedPlaceholders(r.html)).toBe(false);
      const t = textOf(r.html);
      expect(t).toContain("Early Termination by Tenant (Lease Break)");
      expect(t).toContain(money(computeLeaseValues({ ...FULL_VARS }, p).vars.early_termination_fee as number));
      expect(t).toContain("at least 30 days before that date");
      expect(t).toContain("Liquidated damages, not a penalty");
      // The lease-break fee must never be called a penalty. Statutory phrases
      // ("under penalty of perjury", "a civil penalty of") are fine.
      expect(t).not.toMatch(/(?<!civil )\bpenalty of\b(?! perjury)/i);
      expect(t).toContain("If Tenant leaves early without using this option");
      expect(t).toContain(p.earlyTermination.mitigation.rule);
      expect(t).toContain("50 U.S.C. § 3955");
      for (const right of protectedRights(p)) {
        expect(t).toContain(right.cite);
        expect(t).toContain(right.label);
      }
      if (p.earlyTermination.feeCap) expect(t).toContain(p.earlyTermination.feeCap.cite);
      expect(t).toContain(p.deposit.returnCite);
      expect(t).toContain("Keycove is not a law firm");
      expect(t).toContain("42 U.S.C. § 4852d");
      for (const c of p.fairHousing.stateClasses) expect(t.toLowerCase()).toContain(c.toLowerCase());
      if (kind === "coliving") expect(t).toContain("will never use self-help removal");
    });
  }
});

describe("computed values", () => {
  it("derives the end date from the term and formats calendar dates without timezone shift", () => {
    expect(termMonths("12_months")).toBe(12);
    expect(termMonths("1_year")).toBe(12);
    expect(termMonths("month_to_month")).toBe(0);
    expect(deriveEndDate("2027-01-01", 12)).toBe("2027-12-31");
    expect(deriveEndDate("2027-03-15", 6)).toBe("2027-09-14");
    expect(formatDate("2027-01-01")).toBe("January 1, 2027");
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(22)).toBe("22nd");
  });

  it("keeps a landlord-entered end date and caps the notice period at 90 days", () => {
    const r = computeLeaseValues({ ...FULL_VARS, lease_end_date: "2027-06-30", early_termination_notice_days: 365 });
    expect(r.vars.lease_end_date).toBe("2027-06-30");
    expect(r.vars.early_termination_notice_days).toBe("90");
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("leaves a lease with missing landlord terms unresolved so it cannot be auto-sent", () => {
    const nc = getStateProfile("NC")!;
    const r = renderTemplate(stateTemplateBody(nc, "residential"), { tenant_name: "T", monthly_rent: 1000, state: "NC" });
    expect(r.unresolved).toContain("late_fee");
    expect(hasUnresolvedPlaceholders(r.html)).toBe(true);
  });
});

describe("North Carolina specifics (statutes read 2026-11-08)", () => {
  const nc = getStateProfile("NC")!;
  it("deposit cap is 2 months for term leases under § 42-51(b), not 1.5", () => {
    expect(nc.deposit.maxMonths).toBe(2);
    expect(nc.deposit.capCite).toBe("N.C. Gen. Stat. § 42-51(b)");
    expect(nc.deposit.holdingCite).toBe("N.C. Gen. Stat. § 42-50");
    expect(computeLeaseValues({ ...FULL_VARS, security_deposit: 1800 }, nc).warnings).toEqual([]);
    expect(computeLeaseValues({ ...FULL_VARS, security_deposit: 2100 }, nc).warnings.length).toBe(1);
  });
  it("late fee: greater of $15 or 5%, 5-day grace", () => {
    expect(lateFeeCap(nc, 1000)).toBe(50);
    expect(lateFeeCap(nc, 200)).toBe(15);
    expect(nc.lateFee.graceDays).toBe(5);
  });
  it("includes § 42-45 (military technicians, damages cap), § 42-45.1 (DV) and Chapter 127B (State active duty)", () => {
    const t = textOf(renderTemplate(stateTemplateBody(nc, "residential"), { ...FULL_VARS, state: "NC" }).html);
    expect(t).toContain("military technician under 10 U.S.C. § 10216");
    expect(t).toContain("no more than one month's rent (less than six months completed) or one-half month's rent (six to nine months completed)");
    expect(t).toContain("Address Confidentiality Program card");
    expect(t).toContain("safety plan");
    expect(t).toContain("127B");
    expect(t).toContain("including the early termination fee");
  });
});

describe("approval gating", () => {
  it("every approval names a state we have and its hash matches the text we generate", () => {
    for (const [code, a] of Object.entries(LEASE_STATE_APPROVALS)) {
      expect(getStateProfile(code), code).toBeDefined();
      expect(a.templateHash, `${code} approval is stale: re-approve with pnpm lease:approve ${code} --by "..."`).toBe(stateTemplateHash(code));
      expect(isStateApproved(code)).toBe(true);
    }
  });
  it("marketing's approved list matches the server's", () => {
    expect(approvedStateCodes()).toEqual(APPROVED_LEASE_STATE_CODES);
  });
  it("unapproved states are not offered", () => {
    const unapproved = profiles.map(p => p.code).filter(c => !LEASE_STATE_APPROVALS[c]);
    for (const c of unapproved) expect(isStateApproved(c)).toBe(false);
    expect(isStateApproved("ALL")).toBe(false);
    expect(isStateApproved("")).toBe(false);
  });
});
