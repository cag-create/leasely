/**
 * CBP Stripe Webhook Handler
 *
 * CBP runs its own Stripe account (separate from Keycove's). When a Keycove
 * Pro user redeems their bundled website via CBP's Payment Link, CBP's
 * Stripe fires `checkout.session.completed` to /api/cbp/stripe/webhook. We
 * use that as the durable signal to mark the user's Pro code redeemed —
 * the URL-param redirect (?cbpRedeemed=1) handles the optimistic UX, but
 * if the user closes the tab before the redirect completes, this webhook
 * still flips the state correctly.
 *
 * Identification path: the promo code we mint is `LEASELY-USER<id>` and
 * also carries `metadata.leaselyUserId`. The Checkout Session includes the
 * applied discount; we retrieve the promotion_code from CBP's Stripe to
 * read that metadata and resolve back to the Keycove user.
 */
import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { redeemProCode, getProCodeByUserId } from "./db";

function getCbpStripe(): Stripe | null {
  const key = process.env.CBP_STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

export function registerCbpStripeWebhook(app: Express) {
  app.post(
    "/api/cbp/stripe/webhook",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req: any, _res: Response, next: any) => {
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
      const cbp = getCbpStripe();
      const webhookSecret = process.env.CBP_STRIPE_WEBHOOK_SECRET;

      if (!cbp || !webhookSecret) {
        console.error("[CBP Webhook] Not configured (missing CBP_STRIPE_SECRET_KEY or CBP_STRIPE_WEBHOOK_SECRET)");
        return res.status(500).json({ error: "CBP Stripe not configured" });
      }

      const sig = req.headers["stripe-signature"];
      if (!sig) return res.status(400).json({ error: "Missing stripe-signature header" });

      let event: Stripe.Event;
      try {
        const rawBody = req.rawBody ?? JSON.stringify(req.body);
        event = cbp.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("[CBP Webhook] Signature verification failed:", msg);
        return res.status(400).json({ error: `Webhook Error: ${msg}` });
      }

      if (event.id.startsWith("evt_test_")) {
        return res.json({ verified: true });
      }

      console.log(`[CBP Webhook] Event: ${event.type} | ID: ${event.id}`);

      try {
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCbpCheckoutCompleted(cbp, session);
        }
      } catch (err) {
        console.error("[CBP Webhook] Handler error:", err);
        return res.status(500).json({ error: "Handler failed" });
      }

      return res.json({ received: true });
    }
  );
}

async function handleCbpCheckoutCompleted(cbp: Stripe, session: Stripe.Checkout.Session) {
  // Resolve the Keycove user from the applied promotion code's metadata.
  // The Checkout Session puts the applied discount in `total_details.breakdown.discounts`
  // OR `session.discounts` depending on Stripe API version — try both.
  let promotionCodeId: string | null = null;

  const sessionDiscounts = (session as any).discounts as Array<{ promotion_code?: string | { id: string } }> | undefined;
  if (sessionDiscounts && sessionDiscounts.length > 0) {
    const pc = sessionDiscounts[0].promotion_code;
    promotionCodeId = typeof pc === "string" ? pc : pc?.id ?? null;
  }
  if (!promotionCodeId) {
    const breakdown = session.total_details?.breakdown?.discounts as Array<{ discount?: { promotion_code?: string | { id: string } } }> | undefined;
    if (breakdown && breakdown.length > 0) {
      const pc = breakdown[0].discount?.promotion_code;
      promotionCodeId = typeof pc === "string" ? pc : pc?.id ?? null;
    }
  }

  let leaselyUserId: number | null = null;

  if (promotionCodeId) {
    try {
      const promo = await cbp.promotionCodes.retrieve(promotionCodeId);
      const raw = promo.metadata?.leaselyUserId;
      if (raw) leaselyUserId = parseInt(raw);
    } catch (err) {
      console.warn(`[CBP Webhook] Could not retrieve promotion code ${promotionCodeId}:`, err);
    }
  }

  // Fallback: client_reference_id (we pass the user's proCode value through).
  if (!leaselyUserId && session.client_reference_id) {
    // Pro codes are short strings — look them up to find the userId.
    // We don't have a getProCodeByCode export on `db` from this file's perspective,
    // but the proCode mint stores metadata.leaselyUserId on the promotion code,
    // so the primary path above should already have succeeded. If we ever lose
    // the discount object, we'd extend this fallback to query by client_reference_id.
    console.log(`[CBP Webhook] No promotion code on session; client_reference_id=${session.client_reference_id}`);
  }

  if (!leaselyUserId) {
    console.warn(`[CBP Webhook] checkout.session.completed: could not resolve Keycove user (session=${session.id})`);
    return;
  }

  const existing = await getProCodeByUserId(leaselyUserId);
  if (!existing) {
    console.warn(`[CBP Webhook] No pro code row for user ${leaselyUserId} — nothing to mark redeemed`);
    return;
  }
  if (existing.status === "redeemed") {
    console.log(`[CBP Webhook] User ${leaselyUserId} already redeemed; no-op`);
    return;
  }
  await redeemProCode(existing.code);
  console.log(`[CBP Webhook] ✅ Marked Pro code redeemed for user ${leaselyUserId} (session=${session.id})`);
}
