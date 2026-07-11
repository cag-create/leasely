/**
 * Stripe Webhook Handler
 * Wires checkout.session.completed → auto-provision Pro tier
 * Must be registered BEFORE express.json() to preserve raw body for signature verification
 */
import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import {
  upsertUserSubscription, getUserByOpenId, getDb, getUserByEmail,
  getLeaseById, updateLeaseAgreement, getUserById, getOrCreateProCode,
  createRentPayment, updateRentPayment, getRentPaymentByLeasePeriod,
  createNotification,
} from "./db";
import { sendEmail } from "./_core/email";
import { affiliates, affiliateReferrals, leaseAgreements } from "../drizzle/schema";
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
            const leaseId = session.metadata?.leaselyLeaseId;
            const autopaySetup = session.metadata?.leaselyAutopaySetup === "true";
            const leaseKind = session.metadata?.leaselyLeasePaymentKind;
            if (leaseId && autopaySetup) {
              // Phase 2: tenant just authorised the rent autopay subscription.
              await handleLeaseAutopayActivated(parseInt(leaseId), session);
            } else if (leaseId && (leaseKind === "rent" || leaseKind === "deposit")) {
              // Legacy one-time deposit/rent flow (pre-subscription model).
              await handleLeasePaymentCompleted(parseInt(leaseId), leaseKind);
            } else {
              await handleCheckoutCompleted(session);
            }
            break;
          }
          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice;
            await handleInvoicePaid(invoice);
            break;
          }
          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            await handleInvoicePaymentFailed(invoice);
            break;
          }
          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await handleSubscriptionCancelled(sub);
            await handleSubscriptionChange(sub);
            break;
          }
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
  let userId = session.metadata?.user_id
    ? parseInt(session.metadata.user_id)
    : session.client_reference_id
      ? parseInt(session.client_reference_id)
      : null;

  // Fallback: match by the email used at checkout. Covers raw Stripe Payment
  // Links that don't carry a Keycove user id — anyone who pays with the same
  // email as their Keycove account is upgraded automatically, no manual step.
  if (!userId) {
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    if (email) {
      const user = await getUserByEmail(email);
      if (user) {
        userId = user.id;
        console.log(`[Webhook] Resolved user ${user.id} by email ${email} (no id on session)`);
      }
    }
  }

  if (!userId) {
    console.error("[Webhook] checkout.session.completed: could not resolve a Keycove user (no user_id, client_reference_id, or matching account email)");
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
    const APP_URL = process.env.APP_URL ?? process.env.VITE_APP_URL ?? "https://keycove.net";
    if (user?.email) {
      const CBP_URL = `https://certifybusinesspro.com`;
      const codeHtml = proCode
        ? `
          <div style="background:#fffaf0;border:2px solid #F5A623;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Your Brand Kit Code (One-Time Use)</p>
            <p style="margin:0;font-size:28px;font-weight:900;font-family:monospace;letter-spacing:.1em;color:#3A2410">${proCode}</p>
          </div>
          <p style="color:#374151">Redeem this code at <a href="${CBP_URL}" style="color:#E8951A;font-weight:600">certifybusinesspro.com</a> to claim your free brand kit. <strong>Delivery: 24–48 hours.</strong> You'll receive:</p>
          <ul style="color:#374151;line-height:1.9;margin:8px 0 16px">
            <li>1 custom logo + 3 rounds of revisions + final logo files</li>
            <li>Professional website — delivered in 24 hours</li>
            <li>Year 1 domain &amp; hosting included</li>
            <li>DNS + SSL + uptime monitoring</li>
          </ul>
          <p style="color:#6b7280;font-size:13px">A <strong>$299 value</strong> ($37/yr domain renewal after year 1), yours at no extra charge as a Keycove Pro member.</p>`
        : "";

      // Primary welcome email — includes the brand kit code and the explicit
      // 24–48 hour delivery promise so the member knows exactly what's
      // arriving and when.
      await sendEmail({
        to: user.email,
        subject: "Your Certify Business Pro brand kit code 🎨",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
              <img src="${process.env.VITE_APP_URL ?? "https://keycove.net"}/keycove-logo.png" alt="Keycove" height="44" style="margin-bottom:12px" />
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#0F1F4B">Welcome to Keycove Pro!</h1>
              <p style="margin:8px 0 0;color:#6b7280;font-size:15px">Your landlord operating system is ready.</p>
            </div>

            <p>Hi ${user.name ?? "there"},</p>
            <p>You're now a <strong>Keycove Pro</strong> member. Here's everything that's unlocked and ready to go:</p>

            <ul style="color:#374151;line-height:2">
              <li>✅ <strong>Branded tenant portal</strong> — set your subdomain at /portal-setup</li>
              <li>✅ <strong>Unlimited listings</strong> with AI fraud screening on every applicant</li>
              <li>✅ <strong>Stripe Connect</strong> — collect rent directly, 0% ACH fees</li>
              <li>✅ <strong>Work orders, accounting, lease management</strong></li>
              <li>✅ <strong>Rent rate intelligence</strong> — know what to charge in any market</li>
            </ul>

            ${codeHtml}

            <div style="text-align:center;margin:32px 0">
              <a href="${APP_URL}/portal-setup" style="background:#F5A623;color:#3A2410;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:900;font-size:16px;display:inline-block">
                Set Up Your Portal →
              </a>
            </div>

            <p style="color:#6b7280;font-size:13px;text-align:center">Questions? Reply to this email or visit <a href="${APP_URL}/support" style="color:#E8951A">keycove.net/support</a></p>

            <div style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:16px;text-align:center">
              <p style="margin:0;font-size:12px;color:#9ca3af">Keycove · Your Landlord OS · <a href="${APP_URL}" style="color:#E8951A">keycove.net</a></p>
            </div>
          </div>`,
      });
      console.log(`[Webhook] ✉️ Welcome email sent to ${user.email} | Code: ${proCode}`);
    }
  } catch (err) {
    // Never let an email-send failure block the success response — the user
    // is already provisioned, this just means we couldn't deliver the code
    // via Brevo. The code is still retrievable from the dashboard.
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
    const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
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

/**
 * Tenant just completed the Checkout Session that creates the rent autopay
 * Subscription. The first invoice (paid as part of the session) included the
 * security deposit + first month's rent as invoice items, so we mark both as
 * paid, store the Stripe Customer + Subscription, flip autopay on, transition
 * the lease to `paid`, and email the landlord to countersign.
 */
async function handleLeaseAutopayActivated(leaseId: number, session: Stripe.Checkout.Session) {
  const lease = await getLeaseById(leaseId);
  if (!lease) {
    console.warn(`[Webhook] Lease ${leaseId} not found for autopay activation`);
    return;
  }

  const stripeCustomerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id ?? undefined;
  const stripeSubscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id ?? undefined;

  const needsDeposit = (lease.securityDeposit ?? 0) > 0;
  const patch: Record<string, unknown> = {
    firstMonthPaid: 1,
    depositPaid: needsDeposit ? 1 : (lease.depositPaid ?? 0),
    autopayEnabled: 1,
    autopayActivatedAt: new Date(),
    status: "paid",
    paidAt: new Date(),
  };
  if (stripeCustomerId) patch.stripeCustomerId = stripeCustomerId;
  if (stripeSubscriptionId) patch.stripeSubscriptionId = stripeSubscriptionId;

  await updateLeaseAgreement(lease.id, lease.landlordUserId, patch as any);
  console.log(`[Webhook] 🔁 Autopay activated for lease ${leaseId} | sub=${stripeSubscriptionId}`);

  // Record the first month's rent in the ledger (deposit is non-recurring, not tracked)
  const now = new Date();
  const periodMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  try {
    const existing = await getRentPaymentByLeasePeriod(lease.id, periodMonth);
    if (!existing) {
      await createRentPayment({
        leaseAgreementId: lease.id,
        landlordUserId: lease.landlordUserId,
        tenantEmail: lease.tenantEmail,
        periodMonth,
        dueDate: periodMonth,
        amountCents: lease.monthlyRent,
        status: "paid",
        paidAt: new Date(),
        paidAmountCents: lease.monthlyRent,
        paymentMethod: "Keycove",
      });
    }
  } catch (err) {
    console.warn("[Webhook] ledger insert (autopay activation) failed:", err);
  }

  // Notify landlord to countersign
  const APP_URL = process.env.VITE_APP_URL ?? process.env.APP_URL ?? "https://keycove.net";
  try {
    const landlord = await getUserById(lease.landlordUserId);
    if (landlord?.email) {
      await sendEmail({
        to: landlord.email,
        subject: `Autopay Live — Countersign to Execute Lease (${lease.propertyAddress})`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2B5E">Tenant is on autopay — countersign to finish</h2>
          <p><strong>${lease.tenantName}</strong> set up rent autopay${needsDeposit ? " and paid the security deposit" : ""}. The first month's rent has cleared.</p>
          <p>The lease is ready for your countersignature to be fully executed.</p>
          <p style="margin-top:16px"><a href="${APP_URL}/leases" style="background:#00C896;color:#0a2a1f;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700">Countersign Lease</a></p>
        </div>`,
      });
    }
  } catch (err) {
    console.warn("[Webhook] autopay landlord countersign email failed:", err);
  }

  // In-app notification for landlord
  try {
    await createNotification({
      userId: lease.landlordUserId,
      type: "lease_autopay_activated",
      title: "Tenant set up autopay — countersign to execute",
      body: `${lease.tenantName} paid first month's rent${needsDeposit ? " + deposit" : ""} for ${lease.propertyAddress}.`,
      link: "/leases",
    });
  } catch (err) {
    console.warn("[Webhook] autopay notification insert failed:", err);
  }
}

/**
 * Stripe successfully charged a recurring rent invoice. Upsert the
 * corresponding row in rent_payments so the arrears view reflects payment.
 * The first invoice on a fresh subscription is handled by
 * handleLeaseAutopayActivated (which runs from checkout.session.completed
 * with mode=subscription) — invoice.paid for that same period will simply
 * find the existing row and update it idempotently.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = typeof (invoice as any).subscription === "string"
    ? (invoice as any).subscription
    : (invoice as any).subscription?.id ?? null;
  if (!subscriptionId) return; // not a subscription invoice

  const lease = await findLeaseBySubscriptionId(subscriptionId);
  if (!lease) {
    console.log(`[Webhook] invoice.paid: no lease for sub ${subscriptionId}`);
    return;
  }

  const periodMonth = invoicePeriodMonth(invoice);
  const amountPaid = invoice.amount_paid ?? lease.monthlyRent;
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000)
    : new Date();
  const paymentIntentId = typeof (invoice as any).payment_intent === "string"
    ? (invoice as any).payment_intent
    : (invoice as any).payment_intent?.id ?? null;

  try {
    const existing = await getRentPaymentByLeasePeriod(lease.id, periodMonth);
    if (existing) {
      await updateRentPayment(existing.id, {
        status: "paid",
        paidAt,
        paidAmountCents: amountPaid,
        paymentMethod: "Keycove",
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: paymentIntentId ?? undefined,
      });
    } else {
      await createRentPayment({
        leaseAgreementId: lease.id,
        landlordUserId: lease.landlordUserId,
        tenantEmail: lease.tenantEmail,
        periodMonth,
        dueDate: periodMonth,
        amountCents: lease.monthlyRent,
        status: "paid",
        paidAt,
        paidAmountCents: amountPaid,
        paymentMethod: "Keycove",
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: paymentIntentId ?? undefined,
      });
    }
    console.log(`[Webhook] 💵 Rent paid: lease ${lease.id} period ${periodMonth} ($${amountPaid / 100})`);

    // In-app notification for landlord
    try {
      await createNotification({
        userId: lease.landlordUserId,
        type: "rent_paid",
        title: `Rent paid · ${lease.propertyAddress}`,
        body: `${lease.tenantName} paid $${(amountPaid / 100).toFixed(0)} for ${periodMonth}.`,
        link: "/rent",
      });
    } catch (err) {
      console.warn("[Webhook] rent_paid notification insert failed:", err);
    }
  } catch (err) {
    console.warn("[Webhook] invoice.paid ledger upsert failed:", err);
  }
}

/**
 * Stripe failed to charge a recurring rent invoice. Mark the matching ledger
 * row as `late` (or create one if missing) so the arrears view surfaces it.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = typeof (invoice as any).subscription === "string"
    ? (invoice as any).subscription
    : (invoice as any).subscription?.id ?? null;
  if (!subscriptionId) return;

  const lease = await findLeaseBySubscriptionId(subscriptionId);
  if (!lease) return;

  const periodMonth = invoicePeriodMonth(invoice);
  try {
    const existing = await getRentPaymentByLeasePeriod(lease.id, periodMonth);
    if (existing) {
      await updateRentPayment(existing.id, {
        status: "late",
        stripeInvoiceId: invoice.id,
      });
    } else {
      await createRentPayment({
        leaseAgreementId: lease.id,
        landlordUserId: lease.landlordUserId,
        tenantEmail: lease.tenantEmail,
        periodMonth,
        dueDate: periodMonth,
        amountCents: lease.monthlyRent,
        status: "late",
        stripeInvoiceId: invoice.id,
      });
    }
    console.log(`[Webhook] ⚠️ Rent late: lease ${lease.id} period ${periodMonth}`);

    // Email landlord so they can follow up out-of-band
    const landlord = await getUserById(lease.landlordUserId);
    if (landlord?.email) {
      const APP_URL = process.env.VITE_APP_URL ?? process.env.APP_URL ?? "https://keycove.net";
      await sendEmail({
        to: landlord.email,
        subject: `Rent payment failed — ${lease.propertyAddress}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#b91c1c">Rent autopay failed</h2>
          <p><strong>${lease.tenantName}</strong>'s rent autopay for ${periodMonth} did not go through. Stripe will retry automatically, but you may want to reach out.</p>
          <p style="margin-top:16px"><a href="${APP_URL}/rent" style="background:#1B2B5E;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700">View Rent Ledger</a></p>
        </div>`,
      });
    }

    // In-app notification for landlord
    try {
      await createNotification({
        userId: lease.landlordUserId,
        type: "rent_failed",
        title: `Rent payment failed · ${lease.propertyAddress}`,
        body: `${lease.tenantName}'s autopay for ${periodMonth} did not go through. Stripe will retry.`,
        link: "/rent",
      });
    } catch (err) {
      console.warn("[Webhook] rent_failed notification insert failed:", err);
    }
  } catch (err) {
    console.warn("[Webhook] invoice.payment_failed ledger update failed:", err);
  }
}

/**
 * Subscription cancelled (tenant or landlord cancelled autopay). Flip
 * autopayEnabled off on the lease so the dashboard reflects manual-rent mode.
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const lease = await findLeaseBySubscriptionId(subscription.id);
  if (!lease) return;
  await updateLeaseAgreement(lease.id, lease.landlordUserId, {
    autopayEnabled: 0,
  } as any);
  console.log(`[Webhook] 🛑 Autopay disabled for lease ${lease.id} (sub ${subscription.id} cancelled)`);
}

/** Look up a lease by its Stripe subscription ID. */
async function findLeaseBySubscriptionId(subscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(leaseAgreements)
    .where(eq(leaseAgreements.stripeSubscriptionId, subscriptionId))
    .limit(1);
  return rows[0];
}

/** Extract a YYYY-MM-01 period key from a Stripe invoice's billing period. */
function invoicePeriodMonth(invoice: Stripe.Invoice): string {
  const periodStart = invoice.lines?.data?.[0]?.period?.start ?? invoice.period_start;
  const d = new Date((periodStart ?? Math.floor(Date.now() / 1000)) * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
