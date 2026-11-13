/**
 * Who may touch which trust books.
 *
 * Plan placement is undecided (Pro today; maybe a $79 Premium tier later), so
 * it sits behind one flag: TRUST_ACCOUNTING_PLAN = "pro" (default) | "premium" | "off".
 *  - pro:     any active Pro subscriber
 *  - premium: Pro subscribers listed in TRUST_ACCOUNTING_ALLOWLIST (user ids or
 *             emails, comma-separated) until a Premium tier exists; admins always
 *  - off:     admins only
 *
 * Brokerage staff act on the brokerage's books through the existing
 * property_manager_access grant (owner = brokerage, manager = staff member)
 * plus a trust_staff_permissions row.
 */
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { getDb, getUserById, getUserSubscription } from "../db";
import { propertyManagerAccess, trustStaffPermissions } from "../../drizzle/schema";

export type TrustPlan = "pro" | "premium" | "off";
export type TrustPerm = "view" | "receipts" | "disburse" | "reconcile" | "owners";

export function trustPlan(): TrustPlan {
  const v = (process.env.TRUST_ACCOUNTING_PLAN ?? "pro").toLowerCase();
  return v === "premium" || v === "off" ? v : "pro";
}

export async function planAllows(userId: number): Promise<{ ok: boolean; plan: TrustPlan; reason?: string }> {
  const plan = trustPlan();
  const user = await getUserById(userId);
  if (user?.role === "admin") return { ok: true, plan };
  if (plan === "off") return { ok: false, plan, reason: "Trust accounting is not available yet." };
  const sub = await getUserSubscription(userId);
  const isPro = !!sub && sub.tier === "paid" && sub.status !== "cancelled";
  if (!isPro) return { ok: false, plan, reason: "Trust accounting needs a Keycove Pro subscription." };
  if (plan === "premium") {
    const allow = (process.env.TRUST_ACCOUNTING_ALLOWLIST ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!allow.includes(String(userId)) && !(user?.email && allow.includes(user.email.toLowerCase()))) {
      return { ok: false, plan, reason: "Trust accounting is part of the Premium plan." };
    }
  }
  return { ok: true, plan };
}

const PERM_COLUMN: Record<TrustPerm, keyof typeof trustStaffPermissions.$inferSelect> = {
  view: "canViewTrust",
  receipts: "canRecordReceipts",
  disburse: "canDisburse",
  reconcile: "canReconcile",
  owners: "canManageOwners",
};

/** Books this user can open: their own (if on plan) plus brokerages that granted them trust access. */
export async function booksFor(userId: number) {
  const db = await getDb();
  const books: { pmUserId: number; name: string; own: boolean; perms: Record<TrustPerm, boolean> }[] = [];
  const own = await planAllows(userId);
  const me = await getUserById(userId);
  if (own.ok) books.push({ pmUserId: userId, name: me?.name ?? "My brokerage", own: true, perms: { view: true, receipts: true, disburse: true, reconcile: true, owners: true } });
  if (!db) return books;
  const grants = await db.select({ access: propertyManagerAccess, perms: trustStaffPermissions })
    .from(propertyManagerAccess)
    .innerJoin(trustStaffPermissions, eq(trustStaffPermissions.accessId, propertyManagerAccess.id))
    .where(and(eq(propertyManagerAccess.managerUserId, userId), eq(propertyManagerAccess.status, "active")));
  for (const g of grants) {
    if (!(await planAllows(g.access.ownerUserId)).ok) continue;
    const owner = await getUserById(g.access.ownerUserId);
    books.push({
      pmUserId: g.access.ownerUserId, name: owner?.name ?? owner?.email ?? `Brokerage #${g.access.ownerUserId}`, own: false,
      perms: {
        view: !!g.perms.canViewTrust, receipts: !!g.perms.canRecordReceipts, disburse: !!g.perms.canDisburse,
        reconcile: !!g.perms.canReconcile, owners: !!g.perms.canManageOwners,
      },
    });
  }
  return books;
}

/**
 * Resolve the brokerage whose books this request acts on and check the
 * permission. Returns the brokerage's user id (pmUserId).
 */
export async function requireBook(userId: number, bookUserId: number | undefined | null, perm: TrustPerm): Promise<number> {
  const pmUserId = bookUserId ?? userId;
  if (pmUserId === userId) {
    const p = await planAllows(userId);
    if (!p.ok) throw new TRPCError({ code: "FORBIDDEN", message: p.reason });
    return userId;
  }
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  const [g] = await db.select({ perms: trustStaffPermissions })
    .from(propertyManagerAccess)
    .innerJoin(trustStaffPermissions, eq(trustStaffPermissions.accessId, propertyManagerAccess.id))
    .where(and(eq(propertyManagerAccess.ownerUserId, pmUserId), eq(propertyManagerAccess.managerUserId, userId), eq(propertyManagerAccess.status, "active")))
    .limit(1);
  if (!g || !g.perms[PERM_COLUMN.view] || !g.perms[PERM_COLUMN[perm]]) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You don't have that trust-account permission for this brokerage." });
  }
  const p = await planAllows(pmUserId);
  if (!p.ok) throw new TRPCError({ code: "FORBIDDEN", message: "This brokerage's plan doesn't include trust accounting." });
  return pmUserId;
}
