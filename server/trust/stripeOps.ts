/**
 * Stripe operations for trust accounting:
 *  - syncPayouts: tag Stripe rent receipts with the payout that carried them to
 *    the trust bank, so reconciliation can match one bank credit to many receipts
 *    and the 3-banking-day check knows when money actually reached the bank.
 *  - retargetSubscriptions: when a management agreement starts or ends, point a
 *    property's existing autopay subscriptions at the right Connect account.
 */
import Stripe from "stripe";
import { and, eq, gte, isNotNull } from "drizzle-orm";
import { getDb, getUserSubscription } from "../db";
import { crmProperties, leaseAgreements, trustJournalEntries } from "../../drizzle/schema";
import { activeAgreementForProperty } from "./routing";

export function trustStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

const idOf = (x: unknown): string | null => (typeof x === "string" ? x : (x as { id?: string } | null)?.id ?? null);

export async function syncPayouts(pmUserId: number, trustAccountId: number, sinceDays = 60) {
  const stripe = trustStripe();
  if (!stripe) return { ok: false, message: "Stripe isn't configured on this server.", payouts: 0, tagged: 0 };
  const sub = await getUserSubscription(pmUserId);
  if (!sub?.stripeConnectAccountId) return { ok: false, message: "Connect your Stripe payouts account first (Payouts page).", payouts: 0, tagged: 0 };
  const db = await getDb();
  if (!db) return { ok: false, message: "Database unavailable", payouts: 0, tagged: 0 };
  const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString().slice(0, 10);
  const receipts = await db.select().from(trustJournalEntries).where(and(
    eq(trustJournalEntries.pmUserId, pmUserId), eq(trustJournalEntries.trustAccountId, trustAccountId),
    eq(trustJournalEntries.method, "stripe"), gte(trustJournalEntries.entryDate, since),
  ));
  // A receipt and its processing-fee line share a PaymentIntent; both ride the same payout.
  const byPi = new Map<string, typeof receipts>();
  for (const r of receipts) if (r.stripePaymentIntentId) byPi.set(r.stripePaymentIntentId, [...(byPi.get(r.stripePaymentIntentId) ?? []), r]);
  let payouts = 0;
  let tagged = 0;
  const opts = { stripeAccount: sub.stripeConnectAccountId };
  const list = await stripe.payouts.list({ limit: 50, created: { gte: Math.floor(Date.parse(since) / 1000) } }, opts);
  for (const p of list.data) {
    payouts++;
    const arrival = new Date(p.arrival_date * 1000).toISOString().slice(0, 10);
    const txns = await stripe.balanceTransactions.list({ payout: p.id, limit: 100, expand: ["data.source.source_transfer.source_transaction"] }, opts);
    for (const t of txns.data) {
      const src: any = t.source;
      const platformCharge: any = src?.source_transfer?.source_transaction;
      const pi = idOf(platformCharge?.payment_intent);
      for (const r of (pi ? byPi.get(pi) : undefined) ?? []) {
        if (r.stripePayoutId === p.id && r.expectedBankDate === arrival) continue;
        await db.update(trustJournalEntries).set({ stripePayoutId: p.id, expectedBankDate: arrival }).where(eq(trustJournalEntries.id, r.id));
        tagged++;
      }
    }
  }
  return { ok: true, message: `Checked ${payouts} payout(s); linked ${tagged} receipt(s).`, payouts, tagged };
}

/**
 * Re-point active autopay subscriptions for a property (found through its
 * linked listing) at the brokerage (agreement active) or back to the landlord.
 */
export async function retargetSubscriptions(crmPropertyId: number) {
  const stripe = trustStripe();
  const db = await getDb();
  if (!stripe || !db) return { updated: 0, skipped: 0, errors: [] as string[] };
  const [prop] = await db.select().from(crmProperties).where(eq(crmProperties.id, crmPropertyId));
  if (!prop?.listingId) return { updated: 0, skipped: 0, errors: [] as string[] };
  const leases = await db.select().from(leaseAgreements).where(and(eq(leaseAgreements.listingId, prop.listingId), isNotNull(leaseAgreements.stripeSubscriptionId), eq(leaseAgreements.autopayEnabled, 1)));
  const agreement = await activeAgreementForProperty(crmPropertyId);
  let updated = 0, skipped = 0;
  const errors: string[] = [];
  for (const lease of leases) {
    const payeeUserId = agreement ? agreement.pmUserId : lease.landlordUserId;
    const payee = await getUserSubscription(payeeUserId);
    if (!payee?.stripeConnectAccountId) { errors.push(`Lease ${lease.id}: payee has no Stripe Connect account; left unchanged.`); continue; }
    try {
      const s = await stripe.subscriptions.retrieve(lease.stripeSubscriptionId!);
      if (s.status === "canceled") { skipped++; continue; }
      if (idOf(s.transfer_data?.destination) === payee.stripeConnectAccountId) { skipped++; continue; }
      await stripe.subscriptions.update(s.id, {
        transfer_data: { destination: payee.stripeConnectAccountId },
        application_fee_percent: payee.tier === "paid" ? 0 : 1,
        metadata: { ...s.metadata, trustAgreementId: agreement ? String(agreement.id) : "", trustPmUserId: agreement ? String(agreement.pmUserId) : "" },
      });
      updated++;
      console.log(`[trust] subscription ${s.id} (lease ${lease.id}) now pays ${agreement ? `PM ${agreement.pmUserId}` : `landlord ${lease.landlordUserId}`}`);
    } catch (err: any) {
      errors.push(`Lease ${lease.id}: ${err?.message ?? String(err)}`);
    }
  }
  return { updated, skipped, errors };
}

/** Best-effort PaymentIntent for an invoice (newer API versions moved it to invoice payments). */
export async function invoicePaymentIntentId(invoiceId: string): Promise<string | null> {
  const stripe = trustStripe();
  if (!stripe) return null;
  try {
    const inv: any = await stripe.invoices.retrieve(invoiceId, { expand: ["payments"] });
    return idOf(inv.payment_intent) ?? idOf(inv.payments?.data?.[0]?.payment?.payment_intent);
  } catch {
    return null;
  }
}

