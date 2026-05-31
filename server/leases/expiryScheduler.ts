/**
 * Daily lease-expiry sweeper.
 *
 * Finds active leases whose `leaseEndDate` is in the past and:
 *   1. Flips status → "expired"
 *   2. Cancels the recurring rent Stripe Subscription so the tenant
 *      stops being billed after move-out. Without this, autopay keeps
 *      charging indefinitely — a real revenue/refund risk that was
 *      flagged in the 2026-05-31 pipeline audit.
 *
 * Idempotent: only touches leases with a `leaseEndDate` strictly before
 * today AND status in the "still-billing" set. Re-running on the same
 * day is a no-op for already-expired rows.
 *
 * Follows the same scheduler pattern as rentBenchmarks.ts — module-local
 * setInterval handle, repeated calls clear the prior interval so dev HMR
 * doesn't leak handles.
 */
import Stripe from "stripe";
import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";
import { getDb } from "../db";
import { leaseAgreements } from "../../drizzle/schema";

const DAY_MS = 24 * 60 * 60 * 1000;
// Wake daily. The check itself is cheap — a single indexed scan — so
// running once per day is plenty for end-date precision.
const SCHEDULER_INTERVAL_MS = DAY_MS;

// Statuses that still bill rent / hold the lease "live". Anything outside
// this list is already terminal (draft / sent / expired / terminated) and
// safe to skip.
const ACTIVE_LIKE_STATUSES = ["active", "signed", "paid", "awaiting_payment"] as const;

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" as any });
}

function todayIso(): string {
  // YYYY-MM-DD — leaseEndDate is stored as a varchar in the same format
  // (see drizzle/schema.ts:1134), so a string `<` comparison is correct.
  return new Date().toISOString().slice(0, 10);
}

/**
 * Single sweep. Public so an admin endpoint can trigger it manually
 * (useful for backfilling after a long downtime or for ops verification).
 */
export async function runLeaseExpirySweep(): Promise<{ expired: number; subsCanceled: number; errors: number }> {
  const db = await getDb();
  if (!db) return { expired: 0, subsCanceled: 0, errors: 0 };

  const cutoff = todayIso();
  const stale = await db
    .select()
    .from(leaseAgreements)
    .where(
      and(
        isNotNull(leaseAgreements.leaseEndDate),
        lt(leaseAgreements.leaseEndDate, cutoff),
        inArray(leaseAgreements.status, [...ACTIVE_LIKE_STATUSES]),
      ),
    );

  if (stale.length === 0) return { expired: 0, subsCanceled: 0, errors: 0 };

  const stripe = getStripe();
  let expired = 0;
  let subsCanceled = 0;
  let errors = 0;

  for (const lease of stale) {
    try {
      // Cancel the recurring rent subscription first so a transient DB
      // failure on the status update doesn't leave us with both
      // "expired" UI state AND active billing.
      if (stripe && lease.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(lease.stripeSubscriptionId);
          subsCanceled++;
        } catch (subErr: any) {
          // "No such subscription" or "already canceled" — both benign.
          const msg = subErr?.message ?? String(subErr);
          if (!/No such|canceled/i.test(msg)) {
            console.warn(`[leaseExpiry] sub cancel failed for lease ${lease.id}:`, msg);
            errors++;
            continue;
          }
        }
      }

      await db
        .update(leaseAgreements)
        .set({ status: "expired", autopayEnabled: 0 })
        .where(eq(leaseAgreements.id, lease.id));
      expired++;
      console.log(`[leaseExpiry] lease ${lease.id} expired (endDate=${lease.leaseEndDate})`);
    } catch (err) {
      console.error(`[leaseExpiry] failed to expire lease ${lease.id}:`, err);
      errors++;
    }
  }

  return { expired, subsCanceled, errors };
}

let schedulerHandle: ReturnType<typeof setInterval> | null = null;

/**
 * Install the recurring expiry sweeper. Idempotent — repeated calls
 * clear the prior interval so HMR doesn't leak handles in dev.
 */
export function startLeaseExpiryScheduler(): void {
  if (schedulerHandle) clearInterval(schedulerHandle);
  // First sweep 60s after boot so DB / Stripe clients are warm.
  setTimeout(() => {
    void runLeaseExpirySweep().then((r) => {
      if (r.expired || r.subsCanceled || r.errors) {
        console.log(`[leaseExpiry] boot sweep: expired=${r.expired} subsCanceled=${r.subsCanceled} errors=${r.errors}`);
      }
    });
  }, 60_000);
  schedulerHandle = setInterval(() => {
    void runLeaseExpirySweep().then((r) => {
      if (r.expired || r.subsCanceled || r.errors) {
        console.log(`[leaseExpiry] daily sweep: expired=${r.expired} subsCanceled=${r.subsCanceled} errors=${r.errors}`);
      }
    });
  }, SCHEDULER_INTERVAL_MS);
}
