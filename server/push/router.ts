/**
 * `push` tRPC router — device registration for the Keycove mobile apps, plus
 * the role summary the app uses to pick the landlord / PM / tenant home.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb, getUserSubscription } from "../db";
import { propertyManagerAccess, pushDevices, tenantPortalAccounts } from "../../drizzle/schema";
import { notifyUser, pushConfigured } from "./service";

// Mirrors verifyTenantToken in server/routers.ts (tenant portal session token:
// base64url(payload).hmac, 30-day TTL). Duplicated so this file stays
// self-contained; keep the two in sync.
const TENANT_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export function verifyTenantSessionToken(token: string): { id: number } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", process.env.JWT_SECRET || "").update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as { id: number; ts: number };
    if (typeof decoded.id !== "number" || typeof decoded.ts !== "number") return null;
    if (Date.now() - decoded.ts > TENANT_TOKEN_TTL_MS) return null;
    return { id: decoded.id };
  } catch {
    return null;
  }
}

const tokenInput = z.string().min(20).max(255).regex(/^[A-Za-z0-9:_\-.]+$/, "Invalid device token");

export const pushRouter = router({
  /**
   * Register (or re-claim) this phone for push. Landlords/PMs are identified by
   * their session cookie; tenants pass their tenant-portal session token.
   */
  register: publicProcedure.input(z.object({
    token: tokenInput,
    platform: z.enum(["ios", "android"]),
    appVersion: z.string().max(32).optional(),
    tenantSessionToken: z.string().max(1000).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    let userId: number | null = null;
    let tenantAccountId: number | null = null;
    let email: string | null = null;

    if (ctx.user) {
      userId = ctx.user.id;
      email = ctx.user.email?.toLowerCase() ?? null;
    } else if (input.tenantSessionToken) {
      const decoded = verifyTenantSessionToken(input.tenantSessionToken);
      if (!decoded) throw new TRPCError({ code: "UNAUTHORIZED", message: "Tenant session expired" });
      const [tenant] = await db.select().from(tenantPortalAccounts).where(eq(tenantPortalAccounts.id, decoded.id)).limit(1);
      if (!tenant) throw new TRPCError({ code: "UNAUTHORIZED" });
      tenantAccountId = tenant.id;
      email = tenant.email.toLowerCase();
    } else {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to enable notifications" });
    }

    // A token belongs to one install; whoever signed in last on the phone owns it.
    await db.insert(pushDevices).values({
      token: input.token,
      platform: input.platform,
      userId,
      tenantAccountId,
      email,
      appVersion: input.appVersion ?? null,
      enabled: 1,
      lastSeenAt: new Date(),
    }).onDuplicateKeyUpdate({
      set: { platform: input.platform, userId, tenantAccountId, email, appVersion: input.appVersion ?? null, enabled: 1, lastSeenAt: new Date() },
    });
    return { ok: true as const };
  }),

  /** Called on sign-out or when the user turns notifications off. */
  unregister: publicProcedure.input(z.object({ token: tokenInput })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { ok: true as const };
    await db.update(pushDevices).set({ enabled: 0, userId: null, tenantAccountId: null, email: null })
      .where(eq(pushDevices.token, input.token));
    return { ok: true as const };
  }),

  /** Send a test notification to the signed-in user's phones. */
  sendTest: protectedProcedure.mutation(async ({ ctx }) => {
    const delivered = await notifyUser(ctx.user.id, {
      title: "Keycove notifications are on",
      body: "You'll hear about rent, applications, work orders and HOA dues here.",
      url: "/app/settings",
      category: "general",
    });
    return { delivered, configured: pushConfigured() };
  }),

  /**
   * Which home the app should open: landlord (owns listings/Pro), property
   * manager (has active delegated access), or renter.
   */
  myRoles: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    let managesForOwners = 0;
    if (db) {
      const rows = await db.select({ id: propertyManagerAccess.id }).from(propertyManagerAccess)
        .where(and(eq(propertyManagerAccess.managerUserId, ctx.user.id), eq(propertyManagerAccess.status, "active")));
      managesForOwners = rows.length;
    }
    const accountType = (ctx.user as { accountType?: string | null }).accountType ?? null;
    const sub = await getUserSubscription(ctx.user.id).catch(() => null);
    return {
      accountType,
      isLandlord: accountType === "landlord",
      isPropertyManager: managesForOwners > 0,
      managesForOwners,
      isPro: ctx.user.role === "admin" || sub?.tier === "paid",
    };
  }),
});
