// Computed lease values + state-cap guardrails.
//
// Called by renderTemplate() before placeholder substitution so every
// template (including leases auto-drafted on application approval, which
// don't pass every field) gets:
//   - early_termination_fee        default 2 × monthly rent, clamped to any state cap
//   - early_termination_notice_days default 30
//   - rent_due_day                 default 1, rendered as an ordinal ("1st")
//   - lease_end_date               derived from lease_term ("12_months") when missing
// and soft warnings when the landlord's numbers exceed a state limit.

import type { StateLawProfile } from "./types";

export const DEFAULT_EARLY_TERMINATION_MONTHS = 2;
export const DEFAULT_EARLY_TERMINATION_NOTICE_DAYS = 30;
export const MAX_EARLY_TERMINATION_NOTICE_DAYS = 90;

const round2 = (n: number) => Math.round(n * 100) / 100;

function num(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** Maximum late fee in dollars allowed by the state's numeric cap, or null when the statute sets no number. */
export function lateFeeCap(profile: StateLawProfile, monthlyRent: number): number | null {
  const lf = profile.lateFee;
  const pct = lf.capPercent !== undefined ? round2((monthlyRent * lf.capPercent) / 100) : undefined;
  switch (lf.capType) {
    case "percent": return pct ?? null;
    case "flat": return lf.capFlat ?? null;
    case "greater_of": return pct !== undefined && lf.capFlat !== undefined ? Math.max(pct, lf.capFlat) : (pct ?? lf.capFlat ?? null);
    case "lesser_of": return pct !== undefined && lf.capFlat !== undefined ? Math.min(pct, lf.capFlat) : (pct ?? lf.capFlat ?? null);
    default: return null;
  }
}

/** Maximum early termination fee in dollars allowed by statute, or null when there is no statutory cap. */
export function earlyTerminationFeeCap(profile: StateLawProfile, monthlyRent: number): number | null {
  const cap = profile.earlyTermination.feeCap;
  if (!cap || cap.maxMonthsRent === null || cap.maxMonthsRent === undefined) return null;
  return round2(cap.maxMonthsRent * monthlyRent);
}

export function depositCap(profile: StateLawProfile, monthlyRent: number): number | null {
  return profile.deposit.maxMonths === null ? null : round2(profile.deposit.maxMonths * monthlyRent);
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** "12_months" | "6 months" | "1_year" → months; month-to-month → 0; unknown → undefined. */
export function termMonths(term: unknown): number | undefined {
  if (typeof term !== "string") return undefined;
  const t = term.toLowerCase();
  if (/month[\s_-]*to[\s_-]*month|mtm/.test(t)) return 0;
  const m = t.match(/(\d+)\s*[_\s-]*(month|year)/);
  if (!m) return undefined;
  return m[2] === "year" ? Number(m[1]) * 12 : Number(m[1]);
}

/** Lease end = start + N months − 1 day (a 12-month lease from 2026-01-01 ends 2026-12-31). */
export function deriveEndDate(startIso: string, months: number): string | undefined {
  const m = startIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return undefined;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1 + months, Number(m[3])));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export interface ComputedLeaseValues {
  vars: Record<string, unknown>;
  warnings: string[];
}

/**
 * Fill computed defaults and clamp values to state caps. Never overrides a
 * value the landlord entered except to clamp it to a statutory maximum (with
 * a warning saying so).
 */
export function computeLeaseValues(input: Record<string, unknown>, profile?: StateLawProfile): ComputedLeaseValues {
  const vars: Record<string, unknown> = { ...input };
  const warnings: string[] = [];
  const rent = num(vars.monthly_rent);

  // Rent due day → ordinal text.
  const due = num(vars.rent_due_day) ?? 1;
  vars.rent_due_day = ordinal(Math.min(Math.max(Math.round(due), 1), 31));

  // Lease end date from the term when only the term is known.
  if (!vars.lease_end_date && typeof vars.lease_start_date === "string") {
    const months = termMonths(vars.lease_term);
    if (months !== undefined && months > 0) {
      const end = deriveEndDate(vars.lease_start_date, months);
      if (end) vars.lease_end_date = end;
    } else if (months === 0) {
      vars.lease_end_date = "month-to-month (no fixed end date)";
    }
  }

  // Early termination notice period.
  let notice = num(vars.early_termination_notice_days) ?? DEFAULT_EARLY_TERMINATION_NOTICE_DAYS;
  notice = Math.round(notice);
  if (notice < 0) notice = 0;
  if (notice > MAX_EARLY_TERMINATION_NOTICE_DAYS) {
    warnings.push(`The early termination notice period was reduced from ${notice} to ${MAX_EARLY_TERMINATION_NOTICE_DAYS} days. A longer notice requirement is likely to be treated as an unreasonable restraint on the tenant's option.`);
    notice = MAX_EARLY_TERMINATION_NOTICE_DAYS;
  }
  vars.early_termination_notice_days = String(notice);

  // Early termination fee.
  if (rent !== undefined && rent > 0) {
    let fee = num(vars.early_termination_fee);
    if (fee === undefined) fee = round2(rent * DEFAULT_EARLY_TERMINATION_MONTHS);
    if (fee < 0) fee = 0;
    if (profile) {
      const cap = earlyTerminationFeeCap(profile, rent);
      if (cap !== null && fee > cap) {
        warnings.push(`${profile.name} limits early termination fees (${profile.earlyTermination.feeCap!.cite}). The fee was reduced from $${fee.toFixed(2)} to the statutory maximum of $${cap.toFixed(2)}.`);
        fee = cap;
      }
    }
    if (fee > rent * 3) {
      warnings.push(`An early termination fee of more than three months' rent ($${fee.toFixed(2)}) is at higher risk of being struck down as a penalty. The default is two months' rent.`);
    }
    vars.early_termination_fee = fee;
  } else if (num(vars.early_termination_fee) !== undefined) {
    vars.early_termination_fee = num(vars.early_termination_fee);
  }

  if (profile && rent !== undefined && rent > 0) {
    const dep = num(vars.security_deposit);
    const dCap = depositCap(profile, rent);
    if (dep !== undefined && dCap !== null && dep > dCap) {
      warnings.push(`${profile.name} caps the security deposit for this kind of lease: ${profile.deposit.capRule} (${profile.deposit.capCite}). The amount entered ($${dep.toFixed(2)}) is above the ${profile.deposit.maxMonths}-month maximum of $${dCap.toFixed(2)}.`);
    }
    const lf = num(vars.late_fee);
    const lCap = lateFeeCap(profile, rent);
    if (lf !== undefined && lCap !== null && lf > lCap) {
      warnings.push(`${profile.name} caps late fees: ${profile.lateFee.capRule} (${profile.lateFee.cite}). The late fee was reduced from $${lf.toFixed(2)} to the maximum of $${lCap.toFixed(2)} for this rent.`);
      vars.late_fee = lCap;
    }
  }

  return { vars, warnings };
}
