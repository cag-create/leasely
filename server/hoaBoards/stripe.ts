/** Stripe + platform-setting helpers for Keycove HOA. */
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { platformSettings } from "../../drizzle/schema";
import {
  DEFAULT_ACH_FEE_BEARER, hoaPriceLookupKey, HOA_PLANS,
  type AchFeeBearer, type HoaBillingInterval, type HoaPlanTier,
} from "../../shared/hoaBoards";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" as any });
}

export const APP_URL = () => process.env.VITE_APP_URL ?? process.env.APP_URL ?? "https://keycove.net";

/** Metadata flag on every Stripe object Keycove HOA creates, so the webhook can route it. */
export const HOA_META = "keycoveHoa";

// ─── Plan prices (looked up by lookup_key, so test and live mode need no IDs in code) ──
const priceCache = new Map<string, { id: string; at: number }>();
export async function getPlanPriceId(tier: HoaPlanTier, interval: HoaBillingInterval): Promise<string> {
  const lookup = hoaPriceLookupKey(tier, interval);
  const envKey = `STRIPE_HOA_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`;
  if (process.env[envKey]) return process.env[envKey]!;
  const cached = priceCache.get(lookup);
  if (cached && Date.now() - cached.at < 3_600_000) return cached.id;
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");
  const res = await stripe.prices.list({ lookup_keys: [lookup], active: true, limit: 1 });
  const price = res.data[0];
  if (!price) throw new Error(`Stripe price ${lookup} not found — run scripts/create-hoa-stripe-prices.ts`);
  priceCache.set(lookup, { id: price.id, at: Date.now() });
  return price.id;
}

/** Reverse lookup: price → tier + interval (from its lookup_key). */
export function planFromPrice(price: Stripe.Price | null | undefined): { tier: HoaPlanTier; interval: HoaBillingInterval } | null {
  const m = price?.lookup_key?.match(/^keycove_hoa_(t50|t150|t500|unlimited)_(month|year)$/);
  if (m) return { tier: m[1] as HoaPlanTier, interval: m[2] as HoaBillingInterval };
  // Fallback when an env override price has no lookup key: match by amount.
  if (price?.unit_amount != null && price.recurring) {
    const interval = price.recurring.interval === "year" ? "year" : "month";
    const plan = HOA_PLANS.find(p => (interval === "year" ? p.yearlyCents : p.monthlyCents) === price.unit_amount);
    if (plan) return { tier: plan.tier, interval };
  }
  return null;
}

// ─── Platform settings ──────────────────────────────────────────────────────
export const ACH_FEE_BEARER_KEY = "hoa_ach_fee_bearer";

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(platformSettings).where(eq(platformSettings.settingKey, key));
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(platformSettings).values({ settingKey: key, value }).onDuplicateKeyUpdate({ set: { value } });
}

/** Who pays Stripe's ACH cost (0.8%, max $5). Default: deducted from the HOA's payout. */
export async function getAchFeeBearer(): Promise<AchFeeBearer> {
  const v = await getSetting(ACH_FEE_BEARER_KEY);
  return v === "keycove" || v === "hoa" ? v : DEFAULT_ACH_FEE_BEARER;
}
