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

/** $75.00 one-time portal setup fee (includes branded website, logo, and custom URL) */
export const LEASELY_PRO_SETUP = {
  name: "Leasely Pro — Portal Setup Fee",
  description: "One-time setup fee includes your branded website, custom logo placement, and your personalized leasely.net subdomain URL.",
  setupPrice: 7500, // $75.00 in cents
  // Set this to your Stripe one-time Price ID once created in the Stripe Dashboard.
  // Example: price_1XYZ789DEF456JKL
  priceId: process.env.STRIPE_SETUP_FEE_PRICE_ID ?? undefined,
};

/**
 * $30.00/year branded portal renewal — applies to ALL Pro users (subdomain or custom domain).
 * Covers: SSL/TLS certificate renewal, branded portal hosting allocation, subdomain reservation,
 * brand asset storage, year-2+ priority support tier, and (for custom-domain users) domain registrar fees.
 * This is honest recurring revenue regardless of whether the customer is on yourname.leasely.net or
 * a custom domain — the underlying portal infrastructure is the product they're paying to maintain.
 */
export const PRO_ANNUAL_PORTAL_RENEWAL = {
  name: "Leasely Pro — Annual Portal Renewal",
  description: "Annual renewal of your branded portal — covers SSL, hosting, brand assets, and (for custom-domain users) domain registration.",
  annualPrice: 3000, // $30.00 in cents
  // Set this to your Stripe one-time Price ID once created in the Stripe Dashboard.
  priceId: process.env.STRIPE_PORTAL_RENEWAL_PRICE_ID ?? process.env.STRIPE_DOMAIN_RENEWAL_PRICE_ID ?? undefined,
};

// Backwards-compatible alias — old name still works while callers migrate.
export const DOMAIN_RENEWAL_ANNUAL = PRO_ANNUAL_PORTAL_RENEWAL;

// Backwards-compatible alias
export const LEASELY_PRO = LEASELY_PRO_MONTHLY;
