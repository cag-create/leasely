/**
 * Stripe events for Keycove HOA. Called first from server/stripeWebhook.ts;
 * returns true when the event belonged to Keycove HOA (so the landlord
 * handlers — which would otherwise treat an HOA checkout as a Pro signup —
 * never see it). Everything here is idempotent: Stripe retries, and the
 * portal's return page calls syncCheckoutSession too.
 */
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { hoaAssociations, hoaHomes, hoaPayments } from "../../drizzle/schema";
import { hoaDb, markPaymentCanceled, markPaymentFailed, markPaymentProcessing, markPaymentSucceeded } from "./ledger";
import { getStripe, HOA_META, planFromPrice } from "./stripe";

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : v?.id ?? null);
const isHoa = (meta: Stripe.Metadata | null | undefined) => meta?.[HOA_META] === "1";

export async function handleHoaBoardEvent(event: Stripe.Event): Promise<boolean> {
  const obj = event.data.object as any;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      if (!isHoa(obj.metadata)) return false;
      await syncCheckoutSession(obj as Stripe.Checkout.Session, event.type);
      return true;
    }
    case "payment_intent.succeeded":
    case "payment_intent.processing":
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      if (!isHoa(obj.metadata)) return false;
      await syncPaymentIntent(obj as Stripe.PaymentIntent);
      return true;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      if (!isHoa(obj.metadata) || !obj.metadata?.keycoveHoaAssociationId) return false;
      await syncPlanSubscription(obj as Stripe.Subscription);
      return true;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      // Plan invoices: refresh the subscription so past_due/active flips quickly.
      const subId = idOf(obj.subscription) ?? idOf(obj.parent?.subscription_details?.subscription);
      const meta = obj.subscription_details?.metadata ?? obj.parent?.subscription_details?.metadata;
      if (!subId || !isHoa(meta)) return false;
      const stripe = getStripe();
      if (stripe) await syncPlanSubscription(await stripe.subscriptions.retrieve(subId));
      return true;
    }
    default:
      return false;
  }
}

async function syncPaymentIntent(pi: Stripe.PaymentIntent) {
  const paymentId = Number(pi.metadata?.hoaPaymentId);
  if (!paymentId) return;
  if (pi.status === "succeeded") await markPaymentSucceeded(paymentId, { stripePaymentIntentId: pi.id });
  else if (pi.status === "processing") await markPaymentProcessing(paymentId, pi.id);
  else if (pi.status === "canceled") await markPaymentCanceled(paymentId);
  else if (pi.status === "requires_payment_method" && pi.last_payment_error)
    await markPaymentFailed(paymentId, pi.last_payment_error.message ?? "Payment failed", pi.id);
}

/** Bring a Keycove HOA Checkout Session's result into the DB. Safe to call repeatedly. */
export async function syncCheckoutSession(session: Stripe.Checkout.Session, eventType?: string) {
  const stripe = getStripe();
  const d = await hoaDb();
  const meta = session.metadata ?? {};

  if (session.mode === "payment") {
    const paymentId = Number(meta.hoaPaymentId);
    if (!paymentId) return;
    const piId = idOf(session.payment_intent as any);
    if (eventType === "checkout.session.expired") { await markPaymentCanceled(paymentId); return; }
    if (eventType === "checkout.session.async_payment_failed") { await markPaymentFailed(paymentId, "Bank payment failed", piId); return; }
    if (session.payment_status === "paid") await markPaymentSucceeded(paymentId, { stripePaymentIntentId: piId });
    else if (session.status === "complete") await markPaymentProcessing(paymentId, piId); // ACH settling
    // "Pay now and turn on autopay": the PaymentIntent saved the method (setup_future_usage).
    if (meta.hoaAutopay === "1" && session.status === "complete" && piId && stripe) {
      const pi = await stripe.paymentIntents.retrieve(piId, { expand: ["payment_method"] });
      await saveAutopayMethod(Number(meta.hoaHomeId), pi.payment_method as Stripe.PaymentMethod | null, idOf(session.customer as any));
    }
    return;
  }

  if (session.mode === "setup") {
    if (session.status !== "complete" || !stripe) return;
    const siId = idOf(session.setup_intent as any);
    if (!siId) return;
    const si = await stripe.setupIntents.retrieve(siId, { expand: ["payment_method"] });
    if (si.status !== "succeeded") {
      console.warn(`[hoaBoards] setup intent ${si.id} is ${si.status}; autopay not enabled yet`);
      return;
    }
    await saveAutopayMethod(Number(meta.hoaHomeId), si.payment_method as Stripe.PaymentMethod | null, idOf(session.customer as any));
    return;
  }

  if (session.mode === "subscription") {
    const assocId = Number(meta.keycoveHoaAssociationId);
    const subId = idOf(session.subscription as any);
    if (!assocId || !subId || !stripe) return;
    await d.update(hoaAssociations).set({ stripeSubscriptionId: subId, stripeCustomerId: idOf(session.customer as any) ?? undefined })
      .where(eq(hoaAssociations.id, assocId));
    await syncPlanSubscription(await stripe.subscriptions.retrieve(subId));
  }
}

async function saveAutopayMethod(homeId: number, pm: Stripe.PaymentMethod | null, customerId: string | null) {
  if (!homeId || !pm) return;
  const d = await hoaDb();
  const method = pm.type === "us_bank_account" ? "ach" : pm.type === "card" ? "card" : null;
  if (!method) return;
  const label = method === "ach"
    ? `${pm.us_bank_account?.bank_name ?? "Bank"} ••${pm.us_bank_account?.last4 ?? ""}`
    : `${(pm.card?.brand ?? "Card").toUpperCase()} ••${pm.card?.last4 ?? ""}`;
  await d.update(hoaHomes).set({
    autopayEnabled: 1, autopayMethod: method, stripePaymentMethodId: pm.id, paymentMethodLabel: label.slice(0, 80),
    ...(customerId ? { stripeCustomerId: customerId } : {}),
  }).where(eq(hoaHomes.id, homeId));
}

export async function syncPlanSubscription(sub: Stripe.Subscription) {
  const assocId = Number(sub.metadata?.keycoveHoaAssociationId);
  if (!assocId) return;
  const d = await hoaDb();
  const plan = planFromPrice(sub.items?.data?.[0]?.price);
  const status = ({
    trialing: "trialing", active: "active", past_due: "past_due", unpaid: "past_due",
    canceled: "cancelled", incomplete_expired: "cancelled", incomplete: "past_due", paused: "cancelled",
  } as const)[sub.status] ?? "past_due";
  const periodEnd = (sub as any).current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  await d.update(hoaAssociations).set({
    planStatus: status,
    stripeSubscriptionId: status === "cancelled" ? null : sub.id,
    stripeCustomerId: idOf(sub.customer as any) ?? undefined,
    ...(plan ? { planTier: plan.tier, billingInterval: plan.interval } : {}),
    ...(sub.trial_end ? { trialEndsAt: new Date(sub.trial_end * 1000) } : {}),
    ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
  }).where(eq(hoaAssociations.id, assocId));
  console.log(`[hoaBoards] plan for association ${assocId}: ${sub.status} ${plan?.tier ?? "?"}/${plan?.interval ?? "?"}`);
}

/** Used by the portal return page when the webhook hasn't arrived yet. */
export async function syncCheckoutSessionById(sessionId: string) {
  const stripe = getStripe();
  if (!stripe) return;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!isHoa(session.metadata)) return;
  await syncCheckoutSession(session);
}

/** Look up a payment by Checkout Session id (portal return page). */
export async function paymentBySession(sessionId: string) {
  const d = await hoaDb();
  const [p] = await d.select().from(hoaPayments).where(eq(hoaPayments.stripeCheckoutSessionId, sessionId));
  return p ?? null;
}
