/**
 * Leasely Product & Price Definitions
 * Centralized so price IDs are never scattered across files.
 * In production, create products in Stripe Dashboard and paste Price IDs here.
 */

/** $25.00/month recurring subscription */
export const LEASELY_PRO_MONTHLY = {
  name: "Leasely Pro — Monthly",
  description: "Unlimited listings, branded portal, AI fraud detection, instant payouts, rent collection, and more.",
  monthlyPrice: 2500, // $25.00 in cents
  // Set this to your Stripe recurring Price ID once created in the Stripe Dashboard.
  // Example: price_1ABC123DEF456GHI
  priceId: process.env.STRIPE_PRO_PRICE_ID ?? undefined,
};

/** $50.00 one-time portal setup fee */
export const LEASELY_PRO_SETUP = {
  name: "Leasely Pro — Portal Setup Fee",
  description: "One-time fee to build and configure your branded Leasely Pro portal (subdomain, branding, onboarding).",
  setupPrice: 5000, // $50.00 in cents
  // Set this to your Stripe one-time Price ID once created in the Stripe Dashboard.
  // Example: price_1XYZ789DEF456JKL
  priceId: process.env.STRIPE_SETUP_FEE_PRICE_ID ?? undefined,
};

// Backwards-compatible alias
export const LEASELY_PRO = LEASELY_PRO_MONTHLY;
