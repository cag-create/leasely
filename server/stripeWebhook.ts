/**
 * Stripe Webhook Handler
 * Wires checkout.session.completed → auto-provision Pro tier
 * Must be registered BEFORE express.json() to preserve raw body for signature verification
 */
import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { upsertUserSubscription, getUserByOpenId, getDb } from "./db";
import { affiliates, affiliateReferrals } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

export function registerStripeWebhook(app: Express) {
  // MUST use express.raw before express.json for signature verification
  app.post(
    "/api/stripe/webhook",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req: any, res: Response, next: any) => {
      // Only apply raw body parsing to this route
      const contentType = req.headers["content-type"] ?? "";
      if (contentType.includes("application/json")) {
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk: string) => { data += chunk; });
        req.on("end", () => {
          req.rawBody = data;
          next();
        });
      } else {
        next();
      }
    },
    async (req: Request & { rawBody?: string }, res: Response) => {
      const stripe = getStripe();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!stripe || !webhookSecret) {
        console.error("[Webhook] Stripe not configured");
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const sig = req.headers["stripe-signature"];
      if (!sig) {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      let event: Stripe.Event;
      try {
        const rawBody = req.rawBody ?? JSON.stringify(req.body);
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("[Webhook] Signature verification failed:", msg);
        return res.status(400).json({ error: `Webhook Error: ${msg}` });
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Event: ${event.type} | ID: ${event.id}`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
          }
          case "customer.subscription.deleted":
          case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            await handleSubscriptionChange(sub);
            break;
          }
          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Webhook] Handler error:", err);
        return res.status(500).json({ error: "Handler failed" });
      }

      return res.json({ received: true });
    }
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
    ? parseInt(session.metadata.user_id)
    : session.client_reference_id
      ? parseInt(session.client_reference_id)
      : null;

  if (!userId) {
    console.error("[Webhook] checkout.session.completed: no user_id in metadata");
    return;
  }

  const stripeCustomerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id ?? undefined;

  const stripeSubscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id ?? undefined;

  // Auto-provision Pro tier immediately
  await upsertUserSubscription({
    userId,
    tier: "paid",
    status: "active",
    stripeCustomerId,
    stripeSubscriptionId,
  });

  console.log(`[Webhook] ✅ Pro provisioned for user ${userId} | Customer: ${stripeCustomerId}`);

  // Credit affiliate referral if this user was referred
  const referralCode = session.metadata?.referral_code;
  await creditAffiliateReferral(userId, session.id, referralCode || undefined);
}

async function creditAffiliateReferral(userId: number, stripeSessionId: string, referralCode?: string) {
  try {
    const db = await getDb();
    if (!db) return;

    // Find a referral record for this user that is in signed_up status
    const [referral] = await db
      .select()
      .from(affiliateReferrals)
      .where(
        and(
          eq(affiliateReferrals.referredUserId, userId),
          eq(affiliateReferrals.status, "signed_up")
        )
      );

    if (!referral) {
      // No referral found via userId — try to find via referral code in metadata
      if (referralCode) {
        const [aff] = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.referralCode, referralCode));
        if (aff && aff.status === "active") {
          // Create a new referral record and immediately mark as paid
          await db.insert(affiliateReferrals).values({
            affiliateId: aff.id,
            referralCode,
            referredUserId: userId,
            stripeSessionId,
            status: "paid",
            earningAmountCents: 5000,
            convertedAt: new Date(),
            paidAt: new Date(),
          });
          await db
            .update(affiliates)
            .set({ totalEarned: (aff.totalEarned ?? 0) + 5000 })
            .where(eq(affiliates.id, aff.id));
          console.log(`[Webhook] 💰 Affiliate ${referralCode} earned $50 for referring user ${userId} (via checkout metadata)`);
        }
      }
      return;
    }

    // Mark referral as paid
    await db
      .update(affiliateReferrals)
      .set({
        status: "paid",
        stripeSessionId,
        convertedAt: new Date(),
        paidAt: new Date(),
      })
      .where(eq(affiliateReferrals.id, referral.id));

    // Add earnings to affiliate's total
    const earningCents = referral.earningAmountCents ?? 5000;
    const [aff] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, referral.affiliateId));

    if (aff) {
      await db
        .update(affiliates)
        .set({ totalEarned: (aff.totalEarned ?? 0) + earningCents })
        .where(eq(affiliates.id, aff.id));
      console.log(`[Webhook] 💰 Affiliate ${aff.referralCode} earned $${earningCents / 100} for referring user ${userId}`);
    }
  } catch (err) {
    console.error("[Webhook] Affiliate credit error:", err);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
    ? parseInt(subscription.metadata.user_id)
    : null;

  if (!userId) {
    console.warn("[Webhook] subscription change: no user_id in metadata, skipping");
    return;
  }

  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const tier = isActive ? "paid" : "free";
  const status = isActive ? "active" : "cancelled";

  await upsertUserSubscription({
    userId,
    tier,
    status,
    stripeSubscriptionId: subscription.id,
  });

  console.log(`[Webhook] Subscription ${subscription.status} → tier=${tier} for user ${userId}`);
}
