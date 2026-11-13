/**
 * Webhook side of managed-property rent: record Stripe payments that landed
 * in a brokerage's Connect account into its trust journal and owner ledgers.
 *
 * Recording is keyed to where the money ACTUALLY went: a payment is posted to
 * trust only when its Stripe transfer destination is the managing brokerage's
 * Connect account. Each Stripe object is posted once (journal sourceKey).
 */
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb, getUserSubscription, updatePaymentStatus, createNotification } from "../db";
import { paymentRecords, crmTenants, trustManagementAgreements, type LeaseAgreement } from "../../drizzle/schema";
import { recordReceipt } from "./service";
import { activeAgreementForProperty, crmPropertyIdForListing } from "./routing";
import { invoicePaymentIntentId, trustStripe } from "./stripeOps";
import { recoverProcessingFee } from "../payments/processingFee";
import { splitReceiptLines, type InvoiceLineLite, fmtCents } from "./logic";

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const idOf = (x: unknown): string | null => (typeof x === "string" ? x : (x as { id?: string } | null)?.id ?? null);

async function pmConnectAccount(pmUserId: number): Promise<string | null> {
  const sub = await getUserSubscription(pmUserId);
  return sub?.stripeConnectAccountId ?? null;
}

/**
 * One-off Checkout rent payments (listing pay page and private CRM pay link).
 * Marks the payment record paid and, for managed properties, posts the
 * receipt to trust. ACH payments are still "processing" at
 * checkout.session.completed; they post on async_payment_succeeded.
 */
export async function handleRentCheckoutSession(stripe: Stripe, session: Stripe.Checkout.Session, eventType: string) {
  const paymentId = Number(session.metadata?.leaselyPaymentId);
  if (!paymentId) return;
  const db = await getDb();
  if (!db) return;
  const [record] = await db.select().from(paymentRecords).where(eq(paymentRecords.id, paymentId));
  if (!record) {
    console.warn(`[trust webhook] payment record ${paymentId} not found`);
    return;
  }
  const piId = idOf(session.payment_intent);

  if (eventType === "checkout.session.async_payment_failed") {
    await updatePaymentStatus(record.id, "failed", session.id, piId ?? undefined);
    return;
  }
  if (session.payment_status !== "paid") {
    console.log(`[trust webhook] payment ${paymentId} is ${session.payment_status}; waiting for settlement`);
    return;
  }
  if (record.status !== "paid") await updatePaymentStatus(record.id, "paid", session.id, piId ?? undefined);

  const paidYmd = ymd(new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000));
  const posted = await postCheckoutToTrust(stripe, session, record, piId);
  // Stripe's processing fee comes out of the receiver's payout (landlord, or PM for managed).
  await recoverProcessingFee(stripe, {
    paymentIntentId: piId, landlordUserId: record.landlordUserId, crmPropertyId: record.crmPropertyId, listingId: record.listingId,
    tenantName: record.tenantName, date: paidYmd, trust: posted ? { agreement: posted } : null,
  });
}

/** Managed property: post the checkout payment to the PM's trust books. Returns the agreement if posted. */
async function postCheckoutToTrust(stripe: Stripe, session: Stripe.Checkout.Session, record: typeof paymentRecords.$inferSelect, piId: string | null) {
  const agreementId = Number(session.metadata?.trustAgreementId);
  if (!agreementId) return null;
  const db2 = await getDb();
  if (!db2) return null;
  const [agreement] = await db2.select().from(trustManagementAgreements).where(eq(trustManagementAgreements.id, agreementId));
  if (!agreement) return null;

  // Verify the funds went to the brokerage's Connect account.
  let destination: string | null = null;
  if (piId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId);
      destination = idOf(pi.transfer_data?.destination);
    } catch (err) {
      console.warn("[trust webhook] could not retrieve PaymentIntent:", err);
    }
  }
  const pmAccount = await pmConnectAccount(agreement.pmUserId);
  if (!destination || destination !== pmAccount) {
    console.warn(`[trust webhook] payment ${record.id} destination ${destination} is not PM ${agreement.pmUserId}'s account; not posting to trust`);
    return null;
  }

  const paidAt = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000);
  const split = splitReceiptLines([{ amountCents: record.amountCents, description: record.description ?? "Rent", recurring: false }]);
  // A free-form one-off payment with no "deposit" wording is rent.
  const rentCents = split.rentCents + (split.depositCents === 0 ? split.otherCents : 0);
  const otherCents = split.depositCents === 0 ? 0 : split.otherCents;
  let tenantEmail = record.tenantEmail || null;
  if (record.crmTenantId) {
    const [t] = await db2.select().from(crmTenants).where(eq(crmTenants.id, record.crmTenantId));
    tenantEmail = tenantEmail || t?.email || null;
  }
  const res = await recordReceipt({
    pmUserId: agreement.pmUserId,
    agreementId: agreement.id,
    actorUserId: null,
    rentCents,
    depositCents: split.depositCents,
    otherCents,
    otherDescription: record.description ?? undefined,
    entryDate: ymd(paidAt),
    receivedDate: ymd(paidAt),
    method: "stripe",
    reference: piId,
    remitter: record.tenantName,
    crmTenantId: record.crmTenantId,
    tenantName: record.tenantName,
    tenantEmail,
    periodMonth: ymd(paidAt).slice(0, 7),
    sourceKey: `payment_record:${record.id}`,
    stripePaymentIntentId: piId,
  });
  if (res && !res.duplicate) {
    await createNotification({
      userId: agreement.pmUserId,
      type: "trust_receipt",
      title: `Trust receipt · ${fmtCents(record.amountCents)}`,
      body: `${record.tenantName} paid ${fmtCents(record.amountCents)} by Stripe. It is in your trust journal; Stripe pays it out to your trust bank.`,
      link: "/trust",
    }).catch(() => {});
  }
  return res ? agreement : null;
}

function invoiceLines(invoice: Stripe.Invoice): InvoiceLineLite[] {
  return (invoice.lines?.data ?? []).map((l: any) => ({
    amountCents: l.amount ?? 0,
    description: l.description ?? "",
    recurring: !!(l.price?.recurring || l.pricing?.price_details?.price?.recurring || l.parent?.type === "subscription_item_details" || l.type === "subscription"),
  }));
}

/**
 * Recurring rent invoice paid (lease autopay): post to trust if the lease's
 * property is managed (and the money went to the brokerage), then deduct
 * Stripe's processing fee from the receiver's payout.
 */
export async function afterRentInvoicePaid(invoice: Stripe.Invoice, lease: LeaseAgreement, periodMonth: string, stripe: Stripe | null = trustStripe()) {
  const paidAtSec = invoice.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000);
  const paidYmd = ymd(new Date(paidAtSec * 1000));
  const piId = idOf((invoice as any).payment_intent) ?? (invoice.id ? await invoicePaymentIntentId(invoice.id) : null);
  const propertyId = await crmPropertyIdForListing(lease.listingId);
  const posted = await recordInvoiceIntoTrust(invoice, lease, periodMonth, piId, paidYmd);
  if (stripe) {
    await recoverProcessingFee(stripe, {
      paymentIntentId: piId, landlordUserId: lease.landlordUserId, crmPropertyId: propertyId, listingId: lease.listingId,
      propertyAddress: lease.propertyAddress, tenantName: lease.tenantName, date: paidYmd, trust: posted ? { agreement: posted } : null,
    });
  }
}

export async function recordInvoiceIntoTrust(invoice: Stripe.Invoice, lease: LeaseAgreement, periodMonth: string, piId: string | null, paidYmd: string) {
  const propertyId = await crmPropertyIdForListing(lease.listingId);
  const agreement = await activeAgreementForProperty(propertyId);
  if (!agreement) return null;
  const destination = idOf((invoice as any).transfer_data?.destination);
  const pmAccount = await pmConnectAccount(agreement.pmUserId);
  if (!destination || destination !== pmAccount) {
    console.warn(`[trust webhook] invoice ${invoice.id} paid to ${destination}, not PM ${agreement.pmUserId}'s account; not posting to trust`);
    return null;
  }
  const split = splitReceiptLines(invoiceLines(invoice));
  const res = await recordReceipt({
    pmUserId: agreement.pmUserId,
    agreementId: agreement.id,
    actorUserId: null,
    rentCents: split.rentCents,
    depositCents: split.depositCents,
    otherCents: split.otherCents,
    entryDate: paidYmd,
    receivedDate: paidYmd,
    method: "stripe",
    reference: invoice.number ?? invoice.id ?? null,
    remitter: lease.tenantName,
    tenantName: lease.tenantName,
    tenantEmail: lease.tenantEmail,
    leaseStartDate: lease.leaseStartDate,
    periodMonth: periodMonth.slice(0, 7),
    sourceKey: `stripe_invoice:${invoice.id}`,
    stripePaymentIntentId: piId,
    firstMonthOfNewLease: invoice.billing_reason === "subscription_create",
  });
  if (res && !res.duplicate) {
    await createNotification({
      userId: agreement.pmUserId,
      type: "trust_receipt",
      title: `Trust receipt · ${lease.propertyAddress}`,
      body: `${lease.tenantName} paid ${fmtCents(invoice.amount_paid ?? 0)} (autopay). Posted to the owner's ledger${split.depositCents ? " and the security-deposit ledger" : ""}.`,
      link: "/trust",
    }).catch(() => {});
  }
  return res ? agreement : null;
}
