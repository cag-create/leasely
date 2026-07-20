/**
 * Keycove Product & Price Definitions
 * Centralized so price IDs are never scattered across files.
 * In production, create products in Stripe Dashboard and paste Price IDs here.
 */

/** $25.00/month recurring subscription */
export const LEASELY_PRO_MONTHLY = {
  name: "Keycove Pro — Monthly",
  description: "Unlimited listings, branded portal, AI fraud detection, instant payouts, rent collection, and more.",
  monthlyPrice: 2500, // $25.00 in cents
  // Set this to your Stripe recurring Price ID once created in the Stripe Dashboard.
  // Example: price_1ABC123DEF456GHI
  priceId: process.env.STRIPE_PRO_PRICE_ID ?? undefined,
};

// Backwards-compatible alias
export const LEASELY_PRO = LEASELY_PRO_MONTHLY;
