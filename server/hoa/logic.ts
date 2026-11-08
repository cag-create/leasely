/** Pure helpers for HOA dues — no DB, unit-tested in server/hoa.test.ts. */

export type HoaFrequency = "monthly" | "quarterly" | "semiannual" | "annual";

const MONTHS: Record<HoaFrequency, number> = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 };

/**
 * Next due date after `ymd` for the given frequency. Keeps the original day of
 * month, clamped to the month's length (Jan 31 → Feb 28/29 → Mar 31 is NOT
 * restored; we clamp from the previous due date, which is what HOAs bill).
 */
export function advanceDueDate(ymd: string, frequency: HoaFrequency): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const total = (m - 1) + MONTHS[frequency];
  const ny = y + Math.floor(total / 12);
  const nm = total % 12; // 0-based
  const lastDay = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  const nd = Math.min(d, lastDay);
  return `${ny}-${String(nm + 1).padStart(2, "0")}-${String(nd).padStart(2, "0")}`;
}

export function daysUntil(fromYmd: string, toYmd: string): number {
  const a = Date.UTC(+fromYmd.slice(0, 4), +fromYmd.slice(5, 7) - 1, +fromYmd.slice(8, 10));
  const b = Date.UTC(+toYmd.slice(0, 4), +toYmd.slice(5, 7) - 1, +toYmd.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/** Should a reminder go out today for this due date? Once per due date. */
export function reminderDue(opts: {
  today: string;
  nextDueDate: string | null;
  reminderDaysBefore: number;
  lastReminderForDueDate: string | null;
}): boolean {
  if (!opts.nextDueDate) return false;
  if (opts.lastReminderForDueDate === opts.nextDueDate) return false;
  const d = daysUntil(opts.today, opts.nextDueDate);
  return d <= opts.reminderDaysBefore && d >= -3; // stop nagging 3 days after
}

/** Yearly cost of the regular dues, for the dashboard summary. */
export function annualDuesCents(amountCents: number, frequency: HoaFrequency): number {
  return amountCents * (12 / MONTHS[frequency]);
}

/** Keep only the last 4 digits of anything that looks like an account number. */
export function toLast4(input: string | null | undefined): string | null {
  const digits = String(input ?? "").replace(/\D/g, "");
  return digits ? digits.slice(-4) : null;
}
