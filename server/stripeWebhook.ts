/**
 * Stripe Webhook Handler
 * Wires checkout.session.completed → auto-provision Pro tier
 * Must be registered BEFORE express.json() to preserve raw body for signature verification
 */
import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import {
  upsertUserSubscription, getUserByOpenId, getDb,
  getLeaseById, updateLeaseAgreement, getUserById, getOrCreateProCode,
} from "./db";
import { sendEmail } from "./_core/email";
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
            // Lease move-in payments (rent / deposit) — handled separately from Pro subscription
            const leaseId = session.metadata?.leaselyLeaseId;
            const leaseKind = session.metadata?.leaselyLeasePaymentKind;
            if (leaseId && (leaseKind === "rent" || leaseKind === "deposit")) {
              await handleLeasePaymentCompleted(parseInt(leaseId), leaseKind);
            } else {
              await handleCheckoutCompleted(session);
            }
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

  // Generate or retrieve the user's CBP redemption code
  let proCode: string | null = null;
  try {
    const codeRow = await getOrCreateProCode(userId);
    proCode = codeRow.code;
  } catch (err) {
    console.warn("[Webhook] Could not generate pro code:", err);
  }

  // Send welcome email with code
  try {
    const user = await getUserById(userId);
    const APP_URL = process.env.APP_URL ?? process.env.VITE_APP_URL ?? "https://leasely.net";
    if (user?.email) {
      const CBP_URL = `https://certifybusinesspro.com`;
      const codeHtml = proCode
        ? `
          <div style="background:#f0fdf4;border:2px solid #00C896;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Your Free Package Code (One-Time Use)</p>
            <p style="margin:0;font-size:28px;font-weight:900;font-family:monospace;letter-spacing:.1em;color:#0F1F4B">${proCode}</p>
          </div>
          <p style="color:#374151">Redeem this code at <a href="${CBP_URL}" style="color:#00C896;font-weight:600">certifybusinesspro.com</a> to claim your free website, professional logo, and 1-year domain registration — a <strong>$299 value</strong>, yours at no extra charge as a Leasely Pro member.</p>`
        : "";

      await sendEmail({
        to: user.email,
        subject: "Welcome to Leasely Pro 🎉 — Your free $299 package is ready",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
            <div style="background:#0F1F4B;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png" alt="Leasely" height="40" style="margin-bottom:16px" />
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff">Welcome to Leasely Pro!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:15px">Your landlord operating system is ready.</p>
            </div>

            <p>Hi ${user.name ?? "there"},</p>
            <p>You're now a <strong>Leasely Pro</strong> member. Here's everything that's unlocked and ready to go:</p>

            <ul style="color:#374151;line-height:2">
              <li>✅ <strong>Branded tenant portal</strong> — set your subdomain at /portal-setup</li>
              <li>✅ <strong>Unlimited listings</strong> with AI fraud screening on every applicant</li>
              <li>✅ <strong>Stripe Connect</strong> — collect rent directly, 0% ACH fees</li>
              <li>✅ <strong>Work orders, accounting, lease management</strong></li>
              <li>✅ <strong>Rent rate intelligence</strong> — know what to charge in any market</li>
            </ul>

            ${codeHtml}

            <div style="text-align:center;margin:32px 0">
              <a href="${APP_URL}/portal-setup" style="background:#00C896;color:#0a2a1f;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:900;font-size:16px;display:inline-block">
                Set Up Your Portal →
              </a>
            </div>

            <p style="color:#6b7280;font-size:13px;text-align:center">Questions? Reply to this email or visit <a href="${APP_URL}/support" style="color:#00C896">leasely.net/support</a></p>

            <div style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:16px;text-align:center">
              <p style="margin:0;font-size:12px;color:#9ca3af">Leasely · Your Landlord OS · <a href="${APP_URL}" style="color:#00C896">leasely.net</a></p>
            </div>
          </div>`,
      });
      console.log(`[Webhook] ✉️ Welcome email sent to ${user.email} | Code: ${proCode}`);
    }
  } catch (err) {
    console.warn("[Webhook] Welcome email failed:", err);
  }

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

/**
 * Tenant just paid a lease move-in charge (security deposit or first month's rent).
 * Mark the corresponding flag, and if both have cleared, transition the lease to
 * `paid` status and email the landlord prompting them to countersign.
 */
async function handleLeasePaymentCompleted(leaseId: number, kind: "rent" | "deposit") {
  const lease = await getLeaseById(leaseId);
  if (!lease) {
    console.warn(`[Webhook] Lease ${leaseId} not found for ${kind} payment`);
    return;
  }

  const patch: Record<string, unknown> = {};
  if (kind === "rent") patch.firstMonthPaid = 1;
  if (kind === "deposit") patch.depositPaid = 1;

  const willHaveRent = kind === "rent" || lease.firstMonthPaid === 1;
  const needsDeposit = (lease.securityDeposit ?? 0) > 0;
  const willHaveDeposit = !needsDeposit || kind === "deposit" || lease.depositPaid === 1;

  if (willHaveRent && willHaveDeposit) {
    patch.status = "paid";
    patch.paidAt = new Date();
  }

  await updateLeaseAgreement(lease.id, lease.landlordUserId, patch as any);
  console.log(`[Webhook] 🏠 Lease ${leaseId} ${kind} paid (status=${patch.status ?? lease.status})`);

  // Notify landlord when fully paid so they can countersign
  if (willHaveRent && willHaveDeposit) {
    const APP_URL = process.env.VITE_APP_URL ?? "https://leasely.net";
    try {
      const landlord = await getUserById(lease.landlordUserId);
      if (landlord?.email) {
        await sendEmail({
          to: landlord.email,
          subject: `Payment Received — Countersign to Execute Lease (${lease.propertyAddress})`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Payment Received — Action Required</h2>
            <p><strong>${lease.tenantName}</strong> has paid first month's rent${needsDeposit ? " and the security deposit" : ""}.</p>
            <p>The lease is ready for your countersignature to be fully executed.</p>
            <p style="margin-top:16px"><a href="${APP_URL}/leases" style="background:#00C896;color:#0a2a1f;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700">Countersign Lease</a></p>
          </div>`,
        });
      }
    } catch (err) {
      console.warn("[Webhook] landlord countersign email failed:", err);
    }
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
