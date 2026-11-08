/**
 * Create (or verify) the Keycove HOA products and prices in Stripe.
 * Idempotent: prices are found by lookup_key and only created when missing;
 * an existing price with the wrong amount is reported, never changed.
 *
 *   STRIPE_SECRET_KEY=sk_test_… npx tsx scripts/create-hoa-stripe-prices.ts           # dry run
 *   STRIPE_SECRET_KEY=sk_test_… npx tsx scripts/create-hoa-stripe-prices.ts --create  # create missing
 */
import Stripe from "stripe";
import { HOA_PLANS, hoaPriceLookupKey } from "../shared/hoaBoards";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Set STRIPE_SECRET_KEY");
const create = process.argv.includes("--create");
const stripe = new Stripe(key, { apiVersion: "2025-01-27.acacia" as any });
const mode = key.startsWith("sk_live") || key.startsWith("rk_live") ? "LIVE" : "TEST";

async function main() {
  console.log(`Stripe ${mode} mode${create ? "" : " (dry run — pass --create to create missing prices)"}`);
  const out: Record<string, string> = {};
  let problems = 0;
  for (const plan of HOA_PLANS) {
    // One product per tier, monthly + yearly prices on it.
    const found = await stripe.products.search({ query: `metadata['keycove_hoa_tier']:'${plan.tier}'` });
    let product = found.data.find(p => p.active);
    if (!product && create) {
      product = await stripe.products.create({
        name: plan.name,
        description: "Keycove HOA: online dues collection for HOA boards. Free bank payments for homeowners.",
        metadata: { keycove_hoa_tier: plan.tier, max_homes: Number.isFinite(plan.maxHomes) ? String(plan.maxHomes) : "unlimited" },
      });
      console.log(`  created product ${product.id} ${plan.name}`);
    }
    for (const interval of ["month", "year"] as const) {
      const lookup = hoaPriceLookupKey(plan.tier, interval);
      const amount = interval === "month" ? plan.monthlyCents : plan.yearlyCents;
      const existing = (await stripe.prices.list({ lookup_keys: [lookup], limit: 1, expand: ["data.product"] })).data[0];
      if (existing) {
        const ok = existing.unit_amount === amount && existing.recurring?.interval === interval && existing.currency === "usd" && existing.active;
        if (!ok) problems++;
        console.log(`  ${ok ? "ok " : "BAD"} ${lookup} ${existing.id} $${(existing.unit_amount! / 100).toFixed(2)}/${existing.recurring?.interval}${ok ? "" : ` (expected $${(amount / 100).toFixed(2)}/${interval})`}`);
        out[lookup] = existing.id;
        continue;
      }
      if (!create || !product) { console.log(`  missing ${lookup} ($${(amount / 100).toFixed(2)}/${interval})`); continue; }
      const price = await stripe.prices.create({
        product: product.id, currency: "usd", unit_amount: amount, recurring: { interval },
        lookup_key: lookup, nickname: `${plan.label} — ${interval === "month" ? "monthly" : "yearly (15% off)"}`,
        metadata: { keycove_hoa_tier: plan.tier, interval },
      });
      console.log(`  created ${lookup} ${price.id} $${(amount / 100).toFixed(2)}/${interval}`);
      out[lookup] = price.id;
    }
  }
  console.log(JSON.stringify(out, null, 2));
  if (problems) { console.error(`${problems} price(s) don't match the approved pricing`); process.exit(1); }
}

main().catch(e => { console.error(e); process.exit(1); });
