/**
 * Rent routing for managed properties. When a brokerage manages a property
 * under an active management agreement, tenant rent goes to the BROKERAGE's
 * Stripe Connect account (whose payout bank is its trust account) and is
 * recorded in its trust books. Self-managed properties keep paying the
 * landlord directly — this module returns the landlord in that case.
 */
import { and, eq } from "drizzle-orm";
import { getDb, getUserSubscription } from "../db";
import { crmProperties, trustManagementAgreements, type TrustManagementAgreement } from "../../drizzle/schema";

export type RentPayee = {
  payeeUserId: number;
  connectAccountId: string | null;
  connectStatus: string | null;
  tier: "free" | "paid" | null;
  agreement: TrustManagementAgreement | null;
};

export async function activeAgreementForProperty(crmPropertyId: number | null | undefined): Promise<TrustManagementAgreement | null> {
  if (!crmPropertyId) return null;
  const db = await getDb();
  if (!db) return null;
  const [a] = await db.select().from(trustManagementAgreements)
    .where(and(eq(trustManagementAgreements.crmPropertyId, crmPropertyId), eq(trustManagementAgreements.status, "active")))
    .limit(1);
  return a ?? null;
}

export async function crmPropertyIdForListing(listingId: number | null | undefined): Promise<number | null> {
  if (!listingId) return null;
  const db = await getDb();
  if (!db) return null;
  const [p] = await db.select({ id: crmProperties.id }).from(crmProperties).where(eq(crmProperties.listingId, listingId)).limit(1);
  return p?.id ?? null;
}

/**
 * Who should receive this rent? Looks for an active management agreement on
 * the CRM property (directly, or via the listing it is linked to). Falls back
 * to the landlord. Any DB error falls back to the landlord too, so a trust
 * lookup problem never blocks a tenant from paying.
 */
export async function resolveRentPayee(opts: { landlordUserId: number; crmPropertyId?: number | null; listingId?: number | null }): Promise<RentPayee> {
  let agreement: TrustManagementAgreement | null = null;
  try {
    const propertyId = opts.crmPropertyId ?? (await crmPropertyIdForListing(opts.listingId));
    agreement = await activeAgreementForProperty(propertyId);
  } catch (err) {
    console.warn("[trust routing] agreement lookup failed; paying landlord directly:", err);
  }
  const payeeUserId = agreement ? agreement.pmUserId : opts.landlordUserId;
  const sub = await getUserSubscription(payeeUserId);
  return {
    payeeUserId,
    connectAccountId: sub?.stripeConnectAccountId ?? null,
    connectStatus: sub?.stripeConnectStatus ?? null,
    tier: (sub?.tier as "free" | "paid" | undefined) ?? null,
    agreement,
  };
}

/** Stripe metadata tagging a payment as trust money for a management agreement. */
export function trustMetadata(payee: RentPayee): Record<string, string> {
  return payee.agreement ? { trustAgreementId: String(payee.agreement.id), trustPmUserId: String(payee.agreement.pmUserId) } : {};
}
