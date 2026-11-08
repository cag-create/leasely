/**
 * Keycove HOA plan pricing — marketing copy only (Pricing, Compare,
 * HoaBoardsLanding, HoaBoardGuide). Billing itself is configured server-side;
 * keep these numbers in sync with the Stripe prices if they ever change.
 *
 * Yearly = monthly × 12 × 0.85 (15% off).
 */
export type HoaTier = {
  id: string;
  name: string;
  homes: string;
  maxHomes: number | null;
  monthly: number;
  yearly: number;
  yearlyPerMonth: number;
};

export const HOA_TIERS: HoaTier[] = [
  { id: "hoa_50", name: "Up to 50 homes", homes: "1–50 homes", maxHomes: 50, monthly: 39, yearly: 397.8, yearlyPerMonth: 33.15 },
  { id: "hoa_150", name: "51–150 homes", homes: "51–150 homes", maxHomes: 150, monthly: 79, yearly: 805.8, yearlyPerMonth: 67.15 },
  { id: "hoa_500", name: "151–500 homes", homes: "151–500 homes", maxHomes: 500, monthly: 149, yearly: 1519.8, yearlyPerMonth: 126.65 },
  { id: "hoa_500_plus", name: "500+ homes", homes: "500+ homes", maxHomes: null, monthly: 249, yearly: 2539.8, yearlyPerMonth: 211.65 },
];

export const HOA_TRIAL_DAYS = 30;
export const HOA_YEARLY_DISCOUNT_PCT = 15;
export const HOA_CARD_FEE_TEXT = "2.9% + 30¢";

export const HOA_ROUTES = {
  landing: "/hoa-boards",
  board: "/hoa-board",
  portal: "/hoa-portal",
  guide: "/hoa-board-guide",
} as const;

/** $39 → "$39", $397.8 → "$397.80", $1519.8 → "$1,519.80" */
export function formatUsd(n: number): string {
  const whole = Number.isInteger(n);
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
