/**
 * Automation health sweep.
 *
 * Runs every 6 hours (and ~2 min after boot). For each stage of the core
 * Keycove flow it verifies the LIVE machinery + dependencies that actually
 * break in production — it does NOT create real applications, leases,
 * deposits, work orders, or checkouts (that would flood prod with junk and
 * fire real Stripe charges). Instead it checks that every dependency each
 * automation relies on is present and healthy:
 *
 *   Application   → DB reachable, rental_applications + listings queryable
 *   Lease/Deposit → Stripe key valid, Pro + setup price IDs active,
 *                   Keycove webhook enabled
 *   Work orders   → work_orders + contractor directory queryable
 *   Pro checkout  → Stripe Connect platform valid (catches stale/wrong-key
 *                   accounts), price IDs (above)
 *   CBP signup    → CBP key valid, bundle link ACTIVE with promo codes ON,
 *                   CBP→Keycove webhook enabled, CBP secrets set
 *   Site          → public pages return 200
 *   Notifications → Brevo email key present
 *
 * On any failure it emails the admin the list of failing checks. This is the
 * exact class of monitor that would have caught the recent incidents (the
 * deactivated CBP link, the missing CBP webhook secret, the stale Connect
 * account). Scheduler pattern matches rentReminders.ts / expiryScheduler.ts.
 */
import Stripe from "stripe";
import { sql, eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  marketplaceListings, rentalApplications, workOrders, contractorProfiles,
} from "../../drizzle/schema";
import { sendEmail } from "./email";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const APP_URL = process.env.VITE_APP_URL ?? "https://leasely.net";

// Keep in sync with CBP_WEBSITE_BUNDLE_SLUG in server/routers.ts — the active
// CBP "Website + Domain Creation" payment link the Build-my-website flow opens.
const CBP_BUNDLE_SLUG = "00w9AM5Zrb7FfKM0Cn9ws0g";

function stripeFor(key: string | undefined): Stripe | null {
  return key ? new Stripe(key, { apiVersion: "2025-01-27.acacia" as any }) : null;
}
const getStripe = () => stripeFor(process.env.STRIPE_SECRET_KEY);
const getCbpStripe = () => stripeFor(process.env.CBP_STRIPE_SECRET_KEY);

export type SweepCheck = { stage: string; name: string; ok: boolean; detail: string };

/** Run one check; any throw (or unmet condition) becomes a failed check. */
async function run(stage: string, name: string, fn: () => Promise<string>): Promise<SweepCheck> {
  try {
    return { stage, name, ok: true, detail: await fn() };
  } catch (e: any) {
    return { stage, name, ok: false, detail: e?.message ?? String(e) };
  }
}

export async function runAutomationSweep(): Promise<{ checks: SweepCheck[]; ok: boolean }> {
  const checks = await Promise.all([
    // ── Application intake ───────────────────────────────────────────────
    run("Application", "DB + applications/listings queryable", async () => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.select().from(rentalApplications).limit(1);
      const [row] = await db.select({ n: sql<number>`count(*)` })
        .from(marketplaceListings).where(eq(marketplaceListings.status, "active"));
      return `active listings=${Number(row?.n ?? 0)}`;
    }),

    // ── Lease signing + deposit link ─────────────────────────────────────
    run("Lease/Deposit", "Stripe key + Pro/setup prices active", async () => {
      const s = getStripe();
      if (!s) throw new Error("STRIPE_SECRET_KEY missing");
      const proId = process.env.STRIPE_PRO_PRICE_ID;
      if (!proId) throw new Error("STRIPE_PRO_PRICE_ID unset");
      const pro = await s.prices.retrieve(proId);
      if (!pro.active) throw new Error("Pro price is archived/inactive");
      let setup = "setup=inline";
      const setupId = process.env.STRIPE_SETUP_FEE_PRICE_ID;
      if (setupId) {
        const su = await s.prices.retrieve(setupId);
        if (!su.active) throw new Error("Setup price is archived/inactive");
        setup = `setup=$${((su.unit_amount ?? 0) / 100).toFixed(0)}`;
      }
      return `pro=$${((pro.unit_amount ?? 0) / 100).toFixed(0)}/mo ${setup}`;
    }),
    run("Lease/Deposit", "Keycove Stripe webhook enabled", async () => {
      const s = getStripe();
      if (!s) throw new Error("no Stripe key");
      const eps = await s.webhookEndpoints.list({ limit: 30 });
      const ep = eps.data.find(e => e.url.includes("/api/stripe/webhook"));
      if (!ep) throw new Error("no leasely.net/api/stripe/webhook endpoint");
      if (ep.status !== "enabled") throw new Error(`webhook status=${ep.status}`);
      return ep.url;
    }),

    // ── Work orders → handyman dispatch/accept ───────────────────────────
    run("Maintenance", "work_orders + contractor directory", async () => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.select().from(workOrders).limit(1);
      const [row] = await db.select({ n: sql<number>`count(*)` })
        .from(contractorProfiles).where(eq(contractorProfiles.status, "approved"));
      return `approved contractors=${Number(row?.n ?? 0)}`;
    }),

    // ── Pro checkout / Connect payouts ───────────────────────────────────
    run("Pro/Payouts", "Stripe Connect platform valid", async () => {
      const s = getStripe();
      if (!s) throw new Error("no Stripe key");
      // Only a live Connect platform can list connected accounts — this catches
      // wrong-key / de-authorized-platform failures like the stale-account bug.
      const list = await s.accounts.list({ limit: 1 });
      return `connect ok (${list.data.length} sample acct)`;
    }),

    // ── CBP website + logo bundle signup ─────────────────────────────────
    run("CBP", "bundle link active + promo enabled", async () => {
      const cbp = getCbpStripe();
      if (!cbp) throw new Error("CBP_STRIPE_SECRET_KEY missing");
      let found: Stripe.PaymentLink | null = null;
      for await (const link of cbp.paymentLinks.list({ active: true, limit: 100 })) {
        if (link.url?.includes(CBP_BUNDLE_SLUG)) { found = link; break; }
      }
      if (!found) throw new Error(`no ACTIVE CBP link matching slug ${CBP_BUNDLE_SLUG}`);
      if (!found.allow_promotion_codes) throw new Error("promo codes DISABLED — Pro members would be charged full price");
      return found.url;
    }),
    run("CBP", "CBP→Keycove webhook + secrets", async () => {
      const cbp = getCbpStripe();
      if (!cbp) throw new Error("no CBP key");
      const eps = await cbp.webhookEndpoints.list({ limit: 30 });
      const ep = eps.data.find(e => e.url.includes("/api/cbp/stripe/webhook"));
      if (!ep) throw new Error("no CBP→Keycove webhook endpoint");
      if (ep.status !== "enabled") throw new Error(`webhook status=${ep.status}`);
      if (!process.env.CBP_STRIPE_WEBHOOK_SECRET) throw new Error("CBP_STRIPE_WEBHOOK_SECRET unset");
      if (!process.env.CBP_API_SECRET) throw new Error("CBP_API_SECRET unset");
      return ep.url;
    }),

    // ── Public site liveness ─────────────────────────────────────────────
    run("Site", "public pages 200", async () => {
      for (const path of ["/", "/marketplace", "/pro"]) {
        const r = await fetch(APP_URL + path, { method: "GET", redirect: "manual" });
        if (r.status >= 400) throw new Error(`${path} → ${r.status}`);
      }
      return "/, /marketplace, /pro ok";
    }),

    // ── Notifications ────────────────────────────────────────────────────
    run("Notifications", "email (Brevo) configured", async () => {
      if (!process.env.BREVO_API_KEY) throw new Error("BREVO_API_KEY unset — all emails no-op");
      return "brevo key present";
    }),
  ]);

  return { checks, ok: checks.every(c => c.ok) };
}

function adminEmailTarget(): string {
  return process.env.ADMIN_EMAIL
    ?? process.env.FROM_EMAIL?.match(/<([^>]+)>/)?.[1]
    ?? "chadglover10@gmail.com";
}

async function emailFailures(failures: SweepCheck[]): Promise<void> {
  const rows = failures.map(f => `
    <tr>
      <td style="padding:8px 12px;border-top:1px solid #eee">${f.stage}</td>
      <td style="padding:8px 12px;border-top:1px solid #eee">${f.name}</td>
      <td style="padding:8px 12px;border-top:1px solid #eee;color:#b91c1c">${f.detail}</td>
    </tr>`).join("");
  await sendEmail({
    to: adminEmailTarget(),
    subject: `⚠️ Keycove automation sweep: ${failures.length} check(s) failing`,
    html: `<div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px">
      <h2 style="color:#b91c1c">${failures.length} automation check(s) failing</h2>
      <p>The 6-hourly Keycove automation sweep found problems that will break part of the tenant→lease→deposit→work-order→Pro→CBP flow. Details:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #eee;border-radius:8px">
        <tr style="background:#f9fafb"><th style="text-align:left;padding:8px 12px">Stage</th><th style="text-align:left;padding:8px 12px">Check</th><th style="text-align:left;padding:8px 12px">Problem</th></tr>
        ${rows}
      </table>
      <p style="color:#6b7280;font-size:13px;margin-top:16px">Sent automatically by automationSweep. Runs every 6 hours.</p>
    </div>`,
  });
}

async function runAndReport(label: string): Promise<void> {
  const { checks } = await runAutomationSweep();
  const failed = checks.filter(c => !c.ok);
  const summary = `${checks.length - failed.length}/${checks.length} ok`;
  if (failed.length) {
    console.warn(`[automationSweep] ${label}: ${summary} — FAILING: ${failed.map(f => `${f.name} (${f.detail})`).join("; ")}`);
    try { await emailFailures(failed); } catch (e) { console.warn("[automationSweep] alert email failed:", e); }
  } else {
    console.log(`[automationSweep] ${label}: ${summary} — all automations healthy`);
  }
}

let schedulerHandle: ReturnType<typeof setInterval> | null = null;

/** Install the recurring sweep. Idempotent — clears any prior interval. */
export function startAutomationSweepScheduler(): void {
  if (schedulerHandle) clearInterval(schedulerHandle);
  // First sweep ~2 min after boot so DB / Stripe / email clients are warm.
  setTimeout(() => { void runAndReport("boot"); }, 120_000);
  schedulerHandle = setInterval(() => { void runAndReport("6h"); }, SIX_HOURS_MS);
}
