/**
 * Keycove HOA (board-side dues collection) — plans, per-state statute rules
 * and fee math. Pure functions only, shared by client + server and
 * unit-tested in server/hoaBoards.test.ts.
 */

// ─── Plans ──────────────────────────────────────────────────────────────────
export type HoaPlanTier = "t50" | "t150" | "t500" | "unlimited";
export type HoaBillingInterval = "month" | "year";

export const HOA_PLANS: {
  tier: HoaPlanTier;
  name: string;
  label: string;
  maxHomes: number; // Infinity for the top tier
  monthlyCents: number;
  yearlyCents: number; // 15% off 12 × monthly
}[] = [
  { tier: "t50", name: "Keycove HOA — up to 50 homes", label: "Up to 50 homes", maxHomes: 50, monthlyCents: 3900, yearlyCents: 39780 },
  { tier: "t150", name: "Keycove HOA — 51 to 150 homes", label: "51–150 homes", maxHomes: 150, monthlyCents: 7900, yearlyCents: 80580 },
  { tier: "t500", name: "Keycove HOA — 151 to 500 homes", label: "151–500 homes", maxHomes: 500, monthlyCents: 14900, yearlyCents: 151980 },
  { tier: "unlimited", name: "Keycove HOA — 500+ homes", label: "500+ homes", maxHomes: Number.POSITIVE_INFINITY, monthlyCents: 24900, yearlyCents: 253980 },
];
export const HOA_TRIAL_DAYS = 30;
export const HOA_YEARLY_DISCOUNT = 0.15;

/** Stripe price lookup key, identical in test and live mode. */
export const hoaPriceLookupKey = (tier: HoaPlanTier, interval: HoaBillingInterval) => `keycove_hoa_${tier}_${interval}`;

export function hoaPlan(tier: HoaPlanTier) {
  return HOA_PLANS.find(p => p.tier === tier)!;
}

/** Smallest plan that fits this many homes. */
export function planForHomeCount(homes: number): (typeof HOA_PLANS)[number] {
  return HOA_PLANS.find(p => homes <= p.maxHomes) ?? HOA_PLANS[HOA_PLANS.length - 1];
}

export const HOA_TIER_RANK: Record<HoaPlanTier, number> = { t50: 0, t150: 1, t500: 2, unlimited: 3 };

// ─── Per-state statute rules ────────────────────────────────────────────────
export type HoaStateRules = {
  state: string;
  name: string;
  /** null = Keycove has no statute data; the board sets its own late fee. */
  lateFee: null | {
    /** Cap = max(flatCentsPerMonth, percentOfInstallment% of the unpaid installment), once per month. */
    flatCentsPerMonth: number;
    percentOfInstallment: number;
    citation: string;
    text: string;
  };
  payoffStatement: null | {
    maxFeeCents: number;
    expediteFeeCents: number;
    expediteWindowHours: number; // expedite fee allowed when requested within this many hours of closing
    dueBusinessDays: number;
    citation: string;
  };
  interest: null | { maxAprPct: number; citation: string; note: string };
  lien: null | {
    minDaysUnpaid: number;
    noticeDaysBeforeFiling: number;
    noticeMethod: string;
    filedWith: string;
    foreclosureMinDaysUnpaid: number;
    extinguishedAfterYears: number;
    citation: string;
  };
  fines: null | { maxPerDayCents: number; citation: string; note: string };
  notes: string[];
};

export const HOA_STATE_RULES: Record<string, HoaStateRules> = {
  NC: {
    state: "NC",
    name: "North Carolina",
    lateFee: {
      flatCentsPerMonth: 2000,
      percentOfInstallment: 10,
      citation: "N.C.G.S. 47F-3-102(11); 47C-3-102(a)(11) for condominiums",
      text: "Reasonable charges for late payment of assessments, not to exceed the greater of $20.00 per month or 10% of any assessment installment unpaid.",
    },
    payoffStatement: {
      maxFeeCents: 20000,
      expediteFeeCents: 10000,
      expediteWindowHours: 48,
      dueBusinessDays: 10,
      citation: "N.C.G.S. 47F-3-102(13a) and 47F-3-118(b)",
    },
    interest: {
      maxAprPct: 18,
      citation: "N.C.G.S. 47F-3-115(b)",
      note: "Past-due assessments may bear interest at a rate the association sets, up to 18% a year. Communities created before Jan 1, 1999 may charge interest only if the declaration provides for it. Keycove does not charge interest automatically.",
    },
    lien: {
      minDaysUnpaid: 30,
      noticeDaysBeforeFiling: 15,
      noticeMethod: "first-class mail to the lot's physical address, the owner's address of record and, if different, the county tax-record address (plus the registered agent for a corporation or LLC)",
      filedWith: "the clerk of superior court in the county where the lot is located",
      foreclosureMinDaysUnpaid: 90,
      extinguishedAfterYears: 3,
      citation: "N.C.G.S. 47F-3-116",
    },
    fines: {
      maxPerDayCents: 10000,
      citation: "N.C.G.S. 47F-3-107.1",
      note: "Fines for violations require notice and a hearing first. After a decision, up to $100 per day for each day more than five days after the decision that the violation continues.",
    },
    notes: [
      "Chapter 47F applies to planned communities created on or after Jan 1, 1999. The late-charge, assessment, lien and records sections also apply to older communities unless their declaration says otherwise (47F-1-102(c)).",
      "Communities created after 1999 with 20 or fewer lots are outside Chapter 47F unless the declaration opts in (47F-1-102(b)(1)).",
      "Collection, service, consulting or administration fees may be charged to owners only if the declaration expressly allows them (47F-3-116(h)).",
      "Owners can't be charged attorney's fees until they get written notice and 15 days to pay the balance without them (47F-3-116(e)).",
      "Statements of unpaid assessments must be furnished within 10 business days of a written request and are binding on the association (47F-3-118(b)).",
    ],
  },
};

export const DEFAULT_STATE_RULES: HoaStateRules = {
  state: "",
  name: "Other states",
  lateFee: null,
  payoffStatement: null,
  interest: null,
  lien: null,
  fines: null,
  notes: [
    "Keycove has statute data for North Carolina today. In other states you set the late fee yourself. Confirm it with your declaration, bylaws and an attorney before you turn it on.",
  ],
};

export function stateRules(state: string | null | undefined): HoaStateRules {
  return HOA_STATE_RULES[String(state ?? "").toUpperCase()] ?? DEFAULT_STATE_RULES;
}

/** The statutory maximum late charge for one month on this unpaid installment (null = no state cap known). */
export function maxLateFeeCents(state: string | null | undefined, unpaidInstallmentCents: number): number | null {
  const r = stateRules(state).lateFee;
  if (!r) return null;
  return Math.max(r.flatCentsPerMonth, Math.floor((unpaidInstallmentCents * r.percentOfInstallment) / 100));
}

export type LateFeeMode = "state_max" | "flat" | "percent";

/** Late charge for one month: the board's setting, never above the state cap. 0 = none. */
export function lateFeeCents(opts: {
  state: string | null | undefined;
  mode: LateFeeMode;
  flatCents: number;
  percent: number;
  unpaidInstallmentCents: number;
}): number {
  if (opts.unpaidInstallmentCents <= 0) return 0;
  const cap = maxLateFeeCents(opts.state, opts.unpaidInstallmentCents);
  let fee: number;
  if (opts.mode === "state_max") {
    if (cap == null) return 0; // no statute data → board must pick flat or percent
    fee = cap;
  } else if (opts.mode === "flat") {
    fee = Math.max(0, Math.round(opts.flatCents));
  } else {
    fee = Math.floor((opts.unpaidInstallmentCents * Math.max(0, opts.percent)) / 100);
  }
  return cap == null ? fee : Math.min(fee, cap);
}

// ─── Processing fees ────────────────────────────────────────────────────────
/** Stripe US card pricing (2.9% + 30¢). */
export const CARD_FEE_PERCENT = 2.9;
export const CARD_FEE_FIXED_CENTS = 30;
/** Stripe ACH Direct Debit pricing (0.8%, capped at $5). */
export const ACH_FEE_PERCENT = 0.8;
export const ACH_FEE_CAP_CENTS = 500;

/**
 * Card processing fee passed to the homeowner at cost: grossed up so that
 * after Stripe's 2.9% + 30¢ on the TOTAL, the HOA still receives `amountCents`.
 */
export function cardFeeCents(amountCents: number): number {
  if (amountCents <= 0) return 0;
  const total = Math.ceil((amountCents + CARD_FEE_FIXED_CENTS) / (1 - CARD_FEE_PERCENT / 100));
  return total - amountCents;
}

/** What Stripe charges Keycove for an ACH debit of this size. */
export function achStripeFeeCents(amountCents: number): number {
  if (amountCents <= 0) return 0;
  return Math.min(Math.ceil((amountCents * ACH_FEE_PERCENT) / 100), ACH_FEE_CAP_CENTS);
}

/** Who pays Stripe's ACH cost: deducted from the HOA's payout, or absorbed by Keycove. */
export type AchFeeBearer = "hoa" | "keycove";
export const DEFAULT_ACH_FEE_BEARER: AchFeeBearer = "hoa";

/**
 * Keycove's application fee on a destination charge. Card: the homeowner's
 * card fee (covers Stripe's card cost, so the HOA nets the full dues).
 * ACH: Stripe's ACH cost when the HOA bears it, otherwise 0.
 */
export function applicationFeeCents(opts: { method: "ach" | "card"; amountCents: number; feeCents: number; achBearer: AchFeeBearer }): number {
  if (opts.method === "card") return opts.feeCents;
  return opts.achBearer === "hoa" ? achStripeFeeCents(opts.amountCents) : 0;
}

// ─── Dates and schedules ────────────────────────────────────────────────────
export type HoaAssessmentFrequency = "monthly" | "quarterly" | "annual";
const FREQ_MONTHS: Record<HoaAssessmentFrequency, number> = { monthly: 1, quarterly: 3, annual: 12 };
export const FREQUENCY_LABEL: Record<HoaAssessmentFrequency, string> = { monthly: "Monthly", quarterly: "Quarterly", annual: "Yearly" };

export function addDays(ymd: string, days: number): string {
  const t = Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

export function daysBetween(fromYmd: string, toYmd: string): number {
  const a = Date.UTC(+fromYmd.slice(0, 4), +fromYmd.slice(5, 7) - 1, +fromYmd.slice(8, 10));
  const b = Date.UTC(+toYmd.slice(0, 4), +toYmd.slice(5, 7) - 1, +toYmd.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/** anchor + n periods, keeping the anchor's day of month (clamped to month length). */
export function nthDueDate(anchor: string, frequency: HoaAssessmentFrequency, n: number): string {
  const [y, m, d] = anchor.split("-").map(Number);
  const total = (m - 1) + FREQ_MONTHS[frequency] * n;
  const ny = y + Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  return `${ny}-${String(nm + 1).padStart(2, "0")}-${String(Math.min(d, lastDay)).padStart(2, "0")}`;
}

/** Due dates on the schedule that fall in [from, to], inclusive. */
export function dueDatesBetween(anchor: string, frequency: HoaAssessmentFrequency, from: string, to: string): string[] {
  const out: string[] = [];
  for (let n = 0; n < 1200; n++) {
    const d = nthDueDate(anchor, frequency, n);
    if (d > to) break;
    if (d >= from) out.push(d);
  }
  return out;
}

/** Whole months a charge has been late (1 on the first day after grace, 2 a month later, …). 0 = not late yet. */
export function lateMonths(dueDate: string, graceDays: number, today: string): number {
  const start = addDays(dueDate, graceDays + 1); // first late day
  if (today < start) return 0;
  let n = 1;
  while (n < 600 && nthDueDate(start, "monthly", n) <= today) n++;
  return n;
}

/** Add business days (Mon–Fri; ignores holidays). */
export function addBusinessDays(ymd: string, days: number): string {
  let d = ymd;
  let left = days;
  while (left > 0) {
    d = addDays(d, 1);
    const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
    if (dow !== 0 && dow !== 6) left--;
  }
  return d;
}

// ─── Roster import ──────────────────────────────────────────────────────────
export type RosterField = "lot" | "unit" | "address" | "ownerName" | "ownerFirstName" | "ownerLastName" | "email" | "phone" | "assessment" | "mailingAddress";

export const ROSTER_FIELDS: { key: RosterField; label: string; aliases: string[] }[] = [
  { key: "lot", label: "Lot", aliases: ["lot", "lot_number", "lot_no", "lot_num", "lot_id", "parcel", "home_id", "account", "account_number"] },
  { key: "unit", label: "Unit", aliases: ["unit", "unit_number", "unit_no", "apt", "suite", "building_unit"] },
  { key: "address", label: "Property address", aliases: ["address", "property_address", "street", "street_address", "home_address", "lot_address", "address_1", "address1"] },
  { key: "ownerName", label: "Owner name", aliases: ["owner", "owner_name", "homeowner", "homeowner_name", "name", "resident", "member", "member_name", "owners"] },
  { key: "ownerFirstName", label: "Owner first name", aliases: ["first_name", "firstname", "owner_first_name"] },
  { key: "ownerLastName", label: "Owner last name", aliases: ["last_name", "lastname", "owner_last_name"] },
  { key: "email", label: "Email", aliases: ["email", "email_address", "owner_email", "homeowner_email", "e_mail"] },
  { key: "phone", label: "Phone", aliases: ["phone", "phone_number", "owner_phone", "cell", "mobile", "telephone"] },
  { key: "assessment", label: "Assessment amount", aliases: ["assessment", "assessment_amount", "dues", "dues_amount", "hoa_dues", "monthly_dues", "fee", "amount", "regular_assessment"] },
  { key: "mailingAddress", label: "Mailing address (if different)", aliases: ["mailing_address", "owner_address", "billing_address", "mail_address"] },
];

const normHeader = (h: string) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function autoMapRoster(headers: string[]): Record<string, RosterField | ""> {
  const used = new Set<RosterField>();
  const out: Record<string, RosterField | ""> = {};
  for (const h of headers) {
    const n = normHeader(h);
    const f = ROSTER_FIELDS.find(t => !used.has(t.key) && (t.aliases.includes(n) || normHeader(t.label) === n));
    out[h] = f ? f.key : "";
    if (f) used.add(f.key);
  }
  return out;
}

export type RosterRow = {
  lot: string;
  unit: string;
  address: string;
  ownerName: string;
  email: string;
  phone: string;
  assessmentCents: number | null;
  mailingAddress: string;
};

const cents = (s: string | undefined): number | null => {
  if (s == null || String(s).trim() === "") return null;
  const n = parseFloat(String(s).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

export function buildRosterRow(raw: Record<string, string>, mapping: Record<string, RosterField | "">): RosterRow {
  const get = (f: RosterField) => {
    const h = Object.keys(mapping).find(k => mapping[k] === f);
    return h ? String(raw[h] ?? "").trim() : "";
  };
  const name = get("ownerName") || [get("ownerFirstName"), get("ownerLastName")].filter(Boolean).join(" ");
  return {
    lot: get("lot"),
    unit: get("unit"),
    address: get("address"),
    ownerName: name,
    email: get("email").toLowerCase(),
    phone: get("phone"),
    assessmentCents: cents(get("assessment")),
    mailingAddress: get("mailingAddress"),
  };
}

export function validateRosterRow(r: RosterRow): string[] {
  const errs: string[] = [];
  if (!r.lot && !r.unit && !r.address) errs.push("Needs a lot, unit or address");
  if (!r.ownerName) errs.push("Owner name is missing");
  if (r.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) errs.push("Email looks wrong");
  if (r.assessmentCents != null && (r.assessmentCents < 0 || r.assessmentCents > 10_000_000)) errs.push("Assessment amount looks wrong");
  return errs;
}

/** Stable identity for a home inside one association (re-imports update instead of duplicating). */
export function homeKey(r: { lot?: string | null; unit?: string | null; address?: string | null }): string {
  const n = (s?: string | null) => String(s ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (n(r.lot)) return `lot:${n(r.lot)}|${n(r.unit)}`.slice(0, 120);
  return `addr:${n(r.address)}|${n(r.unit)}`.slice(0, 120);
}

export const homeLabel = (h: { lot?: string | null; unit?: string | null; address?: string | null }) =>
  [h.lot ? `Lot ${h.lot}` : "", h.unit ? `Unit ${h.unit}` : "", h.address ?? ""].filter(Boolean).join(" · ");

export const fmtUsd = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
