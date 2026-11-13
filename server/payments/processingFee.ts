/**
 * Stripe processing fees on rent come out of the receiver's payout.
 *
 * Rent is a destination charge: Stripe bills its fee to the platform (Keycove),
 * then transfers the full amount (minus any application fee) to the receiving
 * Connect account. After the charge settles we read Stripe's ACTUAL fee from
 * the charge's balance transaction and reverse exactly that much of the
 * transfer, so the receiver's payout is rent − Stripe fee and Keycove nets $0.
 *
 * Receiver = the landlord (self-managed) or the property manager (managed
 * property, trust account). Tenants pay nothing extra. Free-tier landlords
 * still pay the separate 1% platform fee (application fee) on top.
 *
 * Kill switch: PROCESSING_FEE_PASSTHROUGH=off.
 * The fee is recorded as an expense in the landlord's Accounting, or for a
 * managed property as a trust-journal disbursement charged to the owner's ledger.
 */
import type Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { getDb, createAccountingEntry, createNotification } from "../db";
import { accountingEntries, type TrustManagementAgreement } from "../../drizzle/schema";

export function processingFeePassthroughEnabled(): boolean {
  return (process.env.PROCESSING_FEE_PASSTHROUGH ?? "on").toLowerCase() !== "off";
}

/** Stripe's standard US pricing, for estimates shown in the UI and copy. */
export function estimateProcessingFeeCents(amountCents: number, method: "ach" | "card"): number {
  if (amountCents <= 0) return 0;
  if (method === "ach") return Math.min(500, Math.round(amountCents * 0.008));
  return Math.round(amountCents * 0.029) + 30;
}

const idOf = (x: unknown): string | null => (typeof x === "string" ? x : (x as { id?: string } | null)?.id ?? null);

export type FeeRecoveryInput = {
  paymentIntentId: string | null;
  /** Who the rent was paid to, for Accounting (self-managed). */
  landlordUserId: number;
  crmPropertyId?: number | null;
  listingId?: number | null;
  propertyAddress?: string | null;
  tenantName?: string | null;
  date: string; // YYYY-MM-DD the rent was received
  /** Managed property whose receipt was posted to trust: charge the owner's ledger instead. */
  trust?: { agreement: TrustManagementAgreement } | null;
};

export type FeeRecoveryResult = { status: "recovered" | "skipped" | "failed"; feeCents: number; chargeId?: string | null; reason?: string };

/**
 * Reverse Stripe's fee from the destination transfer (idempotent per charge)
 * and record it. Never throws: rent recording must not fail because of this.
 */
export async function recoverProcessingFee(stripe: Stripe, input: FeeRecoveryInput): Promise<FeeRecoveryResult> {
  if (!processingFeePassthroughEnabled()) return { status: "skipped", feeCents: 0, reason: "disabled" };
  if (!input.paymentIntentId) return { status: "skipped", feeCents: 0, reason: "no payment intent" };
  try {
    const pi: any = await stripe.paymentIntents.retrieve(input.paymentIntentId, { expand: ["latest_charge.balance_transaction"] });
    const charge: any = pi?.latest_charge;
    const chargeId = idOf(charge);
    const transferId = idOf(charge?.transfer);
    const feeCents = Number(charge?.balance_transaction?.fee ?? 0);
    if (!chargeId || !transferId) return { status: "skipped", feeCents: 0, chargeId, reason: "not a destination charge" };
    if (feeCents <= 0) return { status: "skipped", feeCents: 0, chargeId, reason: "no fee" };

    await stripe.transfers.createReversal(
      transferId,
      { amount: feeCents, description: "Payment processing fee", metadata: { kind: "processing_fee", chargeId, paymentIntentId: input.paymentIntentId } },
      { idempotencyKey: `kc-processing-fee-${chargeId}` },
    );

    if (input.trust?.agreement) {
      const a = input.trust.agreement;
      const { post } = await import("../trust/service");
      try {
        await post({
          pmUserId: a.pmUserId, trustAccountId: a.trustAccountId, actorUserId: null,
          journal: {
            entryDate: input.date, method: "stripe", counterparty: "Stripe", purpose: "Payment processing fee (deducted from payout)",
            reference: chargeId, sourceKey: `stripe_fee:${chargeId}`, stripePaymentIntentId: input.paymentIntentId,
          },
          splits: [{ ledgerType: "owner", trustOwnerId: a.trustOwnerId, crmPropertyId: a.crmPropertyId, agreementId: a.id, type: "expense", amountCents: -feeCents, description: "Stripe processing fee", counterparty: "Stripe" }],
        });
      } catch (err: any) {
        console.error("[processing fee] trust posting failed:", err?.message ?? err);
        await createNotification({ userId: a.pmUserId, type: "trust_compliance", title: "Record a Stripe fee in trust", body: `Stripe deducted a $${(feeCents / 100).toFixed(2)} processing fee (charge ${chargeId}) but it couldn't be posted to the owner's ledger: ${err?.message ?? "unknown error"}`, link: "/trust?tab=journal" }).catch(() => {});
      }
    } else {
      const db = await getDb();
      const description = `Stripe processing fee · ${chargeId}`;
      const [existing] = db ? await db.select({ id: accountingEntries.id }).from(accountingEntries).where(and(eq(accountingEntries.userId, input.landlordUserId), eq(accountingEntries.description, description))).limit(1) : [];
      if (!existing) {
        await createAccountingEntry({
          userId: input.landlordUserId, crmPropertyId: input.crmPropertyId ?? null, listingId: input.listingId ?? null,
          propertyAddress: input.propertyAddress ?? null, type: "expense", category: "other_expense",
          amount: feeCents, date: input.date, description,
        });
      }
    }
    console.log(`[processing fee] recovered ${feeCents}¢ on ${chargeId}${input.trust ? " (trust)" : ""}`);
    return { status: "recovered", feeCents, chargeId };
  } catch (err: any) {
    console.error("[processing fee] recovery failed:", err?.message ?? err);
    return { status: "failed", feeCents: 0, reason: err?.message ?? String(err) };
  }
}
