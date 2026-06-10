import { and, desc, eq, gte, lte, like, or, sql, asc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  marketplaceListings, InsertMarketplaceListing, MarketplaceListing,
  listingViews, listingSaves, listingInquiries, ListingInquiry,
  userSubscriptions, InsertUserSubscription, UserSubscription,
  savedSearches, paymentRecords,
  vendors, InsertVendor, Vendor,
  workOrders, InsertWorkOrder, WorkOrder,
  accountingEntries, InsertAccountingEntry, AccountingEntry,
  crmProperties, InsertCrmProperty, CrmProperty,
  crmTenants, InsertCrmTenant, CrmTenant,
  crmLeases, InsertCrmLease, CrmLease,
  crmNotes, InsertCrmNote,
  leaseAgreements, rentPayments, RentPayment,
  tenantPortalAccounts, InsertTenantPortalAccount, TenantPortalAccount,
  supportTickets, InsertSupportTicket, SupportTicket,
  supportReplies, InsertSupportReply,
  cremeAgents, InsertCremeAgent, CremeAgent,
  cremeAgentLeads, InsertCremeAgentLead, CremeAgentLead,
  agentReviews, InsertAgentReview, AgentReview,
  renterWaitlist, InsertRenterWaitlistEntry, RenterWaitlistEntry,
  fsboProfiles, InsertFsboProfile, FsboProfile,
  sopReads, SopRead,
  trainingProgress, TrainingProgress,
  syndicationShares, InsertSyndicationShare, SyndicationShare,
  contractorProfiles, contractorReviews, contractorLeads,
  type ContractorProfile, type InsertContractorProfile,
  type ContractorReview, type InsertContractorReview,
  type ContractorLead, type InsertContractorLead,
  proRedemptionCodes, type ProRedemptionCode,
  tenantFavoriteVendors, type TenantFavoriteVendor,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function deleteUserById(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Soft-delete all their listings first (hard delete can cause FK issues)
  await db.update(marketplaceListings).set({ status: "inactive" }).where(eq(marketplaceListings.userId, id));
  // Hard-delete the user row — cascade-deletes handled by app layer above
  await db.delete(users).where(eq(users.id, id));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function setAccountType(userId: number, accountType: "renter" | "landlord") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ accountType }).where(eq(users.id, userId));
}

// ─── Email verification, password reset, session revocation ───────────────────

export async function setEmailVerifyToken(userId: number, token: string, expires: Date) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ emailVerifyToken: token, emailVerifyExpires: expires }).where(eq(users.id, userId));
}

export async function getUserByEmailVerifyToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.emailVerifyToken, token)).limit(1);
  return result[0];
}

export async function markEmailVerified(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ emailVerified: 1, emailVerifyToken: null, emailVerifyExpires: null }).where(eq(users.id, userId));
}

export async function setPasswordResetToken(userId: number, token: string, expires: Date) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordResetToken: token, passwordResetExpires: expires }).where(eq(users.id, userId));
}

export async function getUserByPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
  return result[0];
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;
  // Updating password also bumps tokenVersion to revoke any existing sessions
  await db.update(users).set({
    passwordHash,
    passwordResetToken: null,
    passwordResetExpires: null,
    tokenVersion: sql`${users.tokenVersion} + 1`,
  }).where(eq(users.id, userId));
}

export async function bumpTokenVersion(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ tokenVersion: sql`${users.tokenVersion} + 1` }).where(eq(users.id, userId));
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getUserSubscription(userId: number): Promise<UserSubscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId)).limit(1);
  return result[0];
}

export async function upsertUserSubscription(data: InsertUserSubscription): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(userSubscriptions).values(data).onDuplicateKeyUpdate({
    set: { tier: data.tier, status: data.status, stripeSubscriptionId: data.stripeSubscriptionId, stripeCustomerId: data.stripeCustomerId }
  });
}

export async function updatePortalBranding(
  userId: number,
  data: { brandName?: string; brandLogoUrl?: string; brandColor?: string; portalSubdomain?: string; customDomain?: string; brandBrief?: string }
) {
  const db = await getDb();
  if (!db) return;
  const updateSet: Record<string, unknown> = {};
  if (data.brandName !== undefined) updateSet.brandName = data.brandName;
  if (data.brandLogoUrl !== undefined) updateSet.brandLogoUrl = data.brandLogoUrl;
  if (data.brandColor !== undefined) updateSet.brandColor = data.brandColor;
  if (data.portalSubdomain !== undefined) updateSet.portalSubdomain = data.portalSubdomain;
  if (data.customDomain !== undefined) updateSet.customDomain = data.customDomain;
  if (data.brandBrief !== undefined) updateSet.brandBrief = data.brandBrief;
  if (Object.keys(updateSet).length === 0) return;
  await db.update(userSubscriptions).set(updateSet).where(eq(userSubscriptions.userId, userId));
}

// ─── Marketplace Listings ─────────────────────────────────────────────────────

export interface ListingFilters {
  propertyType?: string;
  city?: string;
  state?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: string;
  petFriendly?: boolean;
  isCoLiving?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
  limit?: number;
  offset?: number;
}

export async function getMarketplaceListings(filters: ListingFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(marketplaceListings.status, "active")];

  if (filters.propertyType && filters.propertyType !== "all") {
    conditions.push(eq(marketplaceListings.propertyType, filters.propertyType as MarketplaceListing["propertyType"]));
  }
  if (filters.city) {
    conditions.push(like(marketplaceListings.city, `%${filters.city}%`));
  }
  if (filters.state && filters.state !== "all") {
    conditions.push(eq(marketplaceListings.state, filters.state));
  }
  if (filters.minRent) {
    conditions.push(gte(marketplaceListings.monthlyRent, filters.minRent));
  }
  if (filters.maxRent) {
    conditions.push(lte(marketplaceListings.monthlyRent, filters.maxRent));
  }
  if (filters.bedrooms && filters.bedrooms !== "any") {
    conditions.push(eq(marketplaceListings.bedrooms, filters.bedrooms));
  }
  if (filters.petFriendly) {
    conditions.push(eq(marketplaceListings.petFriendly, 1));
  }
  if (filters.isCoLiving) {
    conditions.push(eq(marketplaceListings.isCoLiving, 1));
  }

  const orderBy = filters.sort === "price_asc"
    ? asc(marketplaceListings.monthlyRent)
    : filters.sort === "price_desc"
    ? desc(marketplaceListings.monthlyRent)
    : desc(marketplaceListings.createdAt);

  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;

  return db.select().from(marketplaceListings)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);
}

export async function getFeaturedListings(limit = 6) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketplaceListings)
    .where(eq(marketplaceListings.status, "active"))
    .orderBy(desc(marketplaceListings.viewCount))
    .limit(limit);
}

export async function getMapListings() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: marketplaceListings.id,
    title: marketplaceListings.title,
    propertyType: marketplaceListings.propertyType,
    city: marketplaceListings.city,
    state: marketplaceListings.state,
    monthlyRent: marketplaceListings.monthlyRent,
    bedrooms: marketplaceListings.bedrooms,
    bathrooms: marketplaceListings.bathrooms,
    latitude: marketplaceListings.latitude,
    longitude: marketplaceListings.longitude,
    photos: marketplaceListings.photos,
    isCoLiving: marketplaceListings.isCoLiving,
    petFriendly: marketplaceListings.petFriendly,
  }).from(marketplaceListings)
    .where(and(
      eq(marketplaceListings.status, "active"),
      sql`${marketplaceListings.latitude} IS NOT NULL`,
      sql`${marketplaceListings.longitude} IS NOT NULL`,
    ))
    .limit(500);
}

export async function getListingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id)).limit(1);
  return result[0];
}

export async function getListingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketplaceListings)
    .where(eq(marketplaceListings.userId, userId))
    .orderBy(desc(marketplaceListings.createdAt));
}

export async function createListing(data: InsertMarketplaceListing): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(marketplaceListings).values(data);
  return Number((result as any)[0].insertId);
}

// Listing edit/delete: ownership-locked by default. Admins can pass {isAdmin:true}
// to bypass the userId filter — used by the admin dashboard listings table.
export async function updateListing(
  id: number,
  userId: number,
  data: Partial<InsertMarketplaceListing>,
  opts?: { isAdmin?: boolean },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const where = opts?.isAdmin
    ? eq(marketplaceListings.id, id)
    : and(eq(marketplaceListings.id, id), eq(marketplaceListings.userId, userId));
  await db.update(marketplaceListings)
    .set({ ...data, updatedAt: new Date() })
    .where(where);
}

export async function deleteListing(
  id: number,
  userId: number,
  opts?: { isAdmin?: boolean },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const where = opts?.isAdmin
    ? eq(marketplaceListings.id, id)
    : and(eq(marketplaceListings.id, id), eq(marketplaceListings.userId, userId));
  await db.update(marketplaceListings)
    .set({ status: "inactive" })
    .where(where);
}

export async function incrementViewCount(listingId: number, viewerIp?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(marketplaceListings)
    .set({ viewCount: sql`${marketplaceListings.viewCount} + 1` })
    .where(eq(marketplaceListings.id, listingId));
  await db.insert(listingViews).values({ listingId, viewerIp: viewerIp ?? null, viewedAt: new Date() });
}

export async function countUserListings(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(marketplaceListings)
    .where(and(eq(marketplaceListings.userId, userId), eq(marketplaceListings.status, "active")));
  return Number(result[0]?.count ?? 0);
}

// ─── Saves / Favorites ────────────────────────────────────────────────────────

export async function saveListing(listingId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if already saved
  const existing = await db.select().from(listingSaves)
    .where(and(eq(listingSaves.listingId, listingId), eq(listingSaves.userId, userId))).limit(1);
  if (existing.length > 0) return { saved: true };
  await db.insert(listingSaves).values({ listingId, userId });
  await db.update(marketplaceListings)
    .set({ saveCount: sql`${marketplaceListings.saveCount} + 1` })
    .where(eq(marketplaceListings.id, listingId));
  return { saved: true };
}

export async function unsaveListing(listingId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(listingSaves)
    .where(and(eq(listingSaves.listingId, listingId), eq(listingSaves.userId, userId)));
  await db.update(marketplaceListings)
    .set({ saveCount: sql`GREATEST(${marketplaceListings.saveCount} - 1, 0)` })
    .where(eq(marketplaceListings.id, listingId));
  return { saved: false };
}

export async function getSavedListingIds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ listingId: listingSaves.listingId })
    .from(listingSaves).where(eq(listingSaves.userId, userId));
  return result.map(r => r.listingId);
}

export async function getSavedListings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const savedIds = await getSavedListingIds(userId);
  if (savedIds.length === 0) return [];
  return db.select().from(marketplaceListings)
    .where(and(
      sql`${marketplaceListings.id} IN (${savedIds.join(",")})`,
      eq(marketplaceListings.status, "active")
    ));
}

export async function isListingSaved(listingId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(listingSaves)
    .where(and(eq(listingSaves.listingId, listingId), eq(listingSaves.userId, userId))).limit(1);
  return result.length > 0;
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

export async function createInquiry(data: Omit<ListingInquiry, "id" | "sentAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(listingInquiries).values({ ...data, sentAt: new Date() });
}

export async function getInquiriesByListingId(listingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listingInquiries)
    .where(eq(listingInquiries.listingId, listingId))
    .orderBy(desc(listingInquiries.sentAt));
}

// ─── Saved Searches ───────────────────────────────────────────────────────────

export async function getSavedSearches(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedSearches)
    .where(eq(savedSearches.userId, userId))
    .orderBy(desc(savedSearches.createdAt));
}

export async function createSavedSearch(userId: number, label: string | null, filters: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(savedSearches).values({ userId, label, filters, createdAt: new Date() });
  return Number((result as any)[0].insertId);
}

export async function deleteSavedSearch(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(savedSearches).where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getListingAnalytics(listingId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Verify ownership
  const listing = await getListingById(listingId);
  if (!listing || listing.userId !== userId) return null;

  // Views in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentViews = await db.select({ count: sql<number>`count(*)` })
    .from(listingViews)
    .where(and(eq(listingViews.listingId, listingId), gte(listingViews.viewedAt, sevenDaysAgo)));

  // Views in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthlyViews = await db.select({ count: sql<number>`count(*)` })
    .from(listingViews)
    .where(and(eq(listingViews.listingId, listingId), gte(listingViews.viewedAt, thirtyDaysAgo)));

  // Daily views for chart (last 7 days)
  const dailyViews = await db.select({
    date: sql<string>`DATE(${listingViews.viewedAt})`,
    count: sql<number>`count(*)`
  })
    .from(listingViews)
    .where(and(eq(listingViews.listingId, listingId), gte(listingViews.viewedAt, sevenDaysAgo)))
    .groupBy(sql`DATE(${listingViews.viewedAt})`);

  const inquiryCount = await db.select({ count: sql<number>`count(*)` })
    .from(listingInquiries)
    .where(eq(listingInquiries.listingId, listingId));

  return {
    totalViews: listing.viewCount,
    weeklyViews: Number(recentViews[0]?.count ?? 0),
    monthlyViews: Number(monthlyViews[0]?.count ?? 0),
    saveCount: listing.saveCount,
    inquiryCount: Number(inquiryCount[0]?.count ?? 0),
    dailyViews: dailyViews.map(d => ({ date: d.date, count: Number(d.count) })),
  };
}

// ─── Portal Page ──────────────────────────────────────────────────────────────

/**
 * Get a Pro landlord's portal data by their chosen subdomain.
 * Returns the subscription branding + all their active listings.
 */
export async function getPortalBySubdomain(subdomain: string) {
  const db = await getDb();
  if (!db) return null;

  const subs = await db.select().from(userSubscriptions)
    .where(and(eq(userSubscriptions.portalSubdomain, subdomain), eq(userSubscriptions.tier, "paid")))
    .limit(1);

  if (subs.length === 0) return null;
  const sub = subs[0];

  const owner = await db.select().from(users).where(eq(users.id, sub.userId)).limit(1);
  if (owner.length === 0) return null;

  const listings = await db.select().from(marketplaceListings)
    .where(and(eq(marketplaceListings.userId, sub.userId), eq(marketplaceListings.status, "active")))
    .orderBy(desc(marketplaceListings.createdAt));

  return {
    subdomain: sub.portalSubdomain,
    userId: sub.userId,
    brandName: sub.brandName ?? owner[0].name ?? "My Properties",
    brandLogoUrl: sub.brandLogoUrl ?? null,
    brandColor: sub.brandColor ?? "#1B2B5E",
    portalTagline: sub.portalTagline ?? null,
    portalSocialLinks: sub.portalSocialLinks ? JSON.parse(sub.portalSocialLinks) : {},
    ownerName: owner[0].name ?? null,
    ownerEmail: owner[0].email ?? null,
    listings,
  };
}

/**
 * Look up a paid portal by its custom domain (e.g. atlanta-rentals.com).
 * Used by /api/portal-leads so external CBP-built landing pages can submit
 * contact-form leads back into the Leasely inquiry inbox.
 */
export async function getPortalByCustomDomain(customDomain: string) {
  const db = await getDb();
  if (!db) return null;
  const subs = await db.select().from(userSubscriptions)
    .where(and(eq(userSubscriptions.customDomain, customDomain), eq(userSubscriptions.tier, "paid")))
    .limit(1);
  if (subs.length === 0) return null;
  // Re-use the subdomain query path to keep return shape identical
  return sub_to_portal_shape(subs[0]);
}

async function sub_to_portal_shape(sub: any) {
  const db = await getDb();
  if (!db) return null;
  const owner = await db.select().from(users).where(eq(users.id, sub.userId)).limit(1);
  if (owner.length === 0) return null;
  const listings = await db.select().from(marketplaceListings)
    .where(and(eq(marketplaceListings.userId, sub.userId), eq(marketplaceListings.status, "active")))
    .orderBy(desc(marketplaceListings.createdAt));
  return {
    subdomain: sub.portalSubdomain,
    userId: sub.userId,
    brandName: sub.brandName ?? owner[0].name ?? "My Properties",
    brandLogoUrl: sub.brandLogoUrl ?? null,
    brandColor: sub.brandColor ?? "#1B2B5E",
    portalTagline: sub.portalTagline ?? null,
    portalSocialLinks: sub.portalSocialLinks ? JSON.parse(sub.portalSocialLinks) : {},
    ownerName: owner[0].name ?? null,
    ownerEmail: owner[0].email ?? null,
    listings,
  };
}

// ─── Payment Records ──────────────────────────────────────────────────────────

export async function createPaymentRecord(data: {
  listingId: number;
  landlordUserId: number;
  tenantName: string;
  tenantEmail: string;
  amountCents: number;
  description?: string | null;
  status: "pending" | "paid" | "failed" | "refunded";
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentRecords).values({
    listingId: data.listingId,
    landlordUserId: data.landlordUserId,
    tenantName: data.tenantName,
    tenantEmail: data.tenantEmail,
    amountCents: data.amountCents,
    description: data.description ?? null,
    status: data.status,
    createdAt: new Date(),
  });
  return Number((result as any)[0].insertId);
}

export async function updatePaymentStatus(
  id: number,
  status: "pending" | "paid" | "failed" | "refunded",
  checkoutSessionId?: string,
  paymentIntentId?: string,
) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { status };
  if (checkoutSessionId) updateData.stripeCheckoutSessionId = checkoutSessionId;
  if (paymentIntentId) updateData.stripePaymentIntentId = paymentIntentId;
  if (status === "paid") updateData.paidAt = new Date();
  await db.update(paymentRecords).set(updateData as any).where(eq(paymentRecords.id, id));
}

export async function getPaymentsByLandlord(landlordUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentRecords)
    .where(eq(paymentRecords.landlordUserId, landlordUserId))
    .orderBy(desc(paymentRecords.createdAt))
    .limit(100);
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDORS
// ─────────────────────────────────────────────────────────────────────────────

export async function getVendors(userId: number): Promise<Vendor[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vendors)
    .where(and(eq(vendors.userId, userId), eq(vendors.isActive, 1)))
    .orderBy(asc(vendors.name));
}

/** Single-vendor lookup — used by the favorite-vendor pre-check. */
export async function getVendorById(id: number): Promise<Vendor | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(vendors).where(eq(vendors.id, id));
  return rows[0];
}

// ─── Tenant favorite vendors ────────────────────────────────────────────────
// Tenants pick a favorite vendor per work-order category. When they file a
// repair request the dispatcher pings ONLY that vendor instead of fanning
// out to the landlord's full pool. Keyed on tenantPortalAccountId because
// tenants in this app don't have a users-table row — they authenticate
// against tenantPortalAccounts via a session token.

export async function getTenantFavoriteVendors(tenantPortalAccountId: number): Promise<TenantFavoriteVendor[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenantFavoriteVendors)
    .where(eq(tenantFavoriteVendors.tenantPortalAccountId, tenantPortalAccountId));
}

export async function getTenantFavoriteVendorForCategory(
  tenantPortalAccountId: number,
  category: string,
): Promise<TenantFavoriteVendor | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(tenantFavoriteVendors)
    .where(and(
      eq(tenantFavoriteVendors.tenantPortalAccountId, tenantPortalAccountId),
      eq(tenantFavoriteVendors.category, category),
    ))
    .limit(1);
  return rows[0];
}

export async function setTenantFavoriteVendor(opts: {
  tenantPortalAccountId: number;
  landlordUserId: number;
  vendorId: number;
  category: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Upsert pattern: delete any existing favorite for (tenant, category)
  // then insert. The unique index uniq_tenant_category enforces invariants.
  await db.delete(tenantFavoriteVendors).where(and(
    eq(tenantFavoriteVendors.tenantPortalAccountId, opts.tenantPortalAccountId),
    eq(tenantFavoriteVendors.category, opts.category),
  ));
  await db.insert(tenantFavoriteVendors).values({
    tenantPortalAccountId: opts.tenantPortalAccountId,
    landlordUserId: opts.landlordUserId,
    vendorId: opts.vendorId,
    category: opts.category,
  });
}

export async function clearTenantFavoriteVendor(
  tenantPortalAccountId: number,
  category: string,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(tenantFavoriteVendors).where(and(
    eq(tenantFavoriteVendors.tenantPortalAccountId, tenantPortalAccountId),
    eq(tenantFavoriteVendors.category, category),
  ));
}

export async function createVendor(data: InsertVendor): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(vendors).values(data);
  return (result[0] as any).insertId;
}

export async function updateVendor(id: number, userId: number, data: Partial<InsertVendor>) {
  const db = await getDb();
  if (!db) return;
  await db.update(vendors).set(data as any).where(and(eq(vendors.id, id), eq(vendors.userId, userId)));
}

export async function deleteVendor(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(vendors).set({ isActive: 0 }).where(and(eq(vendors.id, id), eq(vendors.userId, userId)));
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getWorkOrders(userId: number): Promise<WorkOrder[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workOrders)
    .where(eq(workOrders.userId, userId))
    .orderBy(desc(workOrders.createdAt));
}

export async function getWorkOrderById(id: number, userId: number): Promise<WorkOrder | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(workOrders)
    .where(and(eq(workOrders.id, id), eq(workOrders.userId, userId)))
    .limit(1);
  return result[0];
}

export async function createWorkOrder(data: InsertWorkOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(workOrders).values(data);
  return (result[0] as any).insertId;
}

export async function updateWorkOrder(id: number, userId: number, data: Partial<InsertWorkOrder>) {
  const db = await getDb();
  if (!db) return;
  await db.update(workOrders).set({ ...data as any, updatedAt: new Date() })
    .where(and(eq(workOrders.id, id), eq(workOrders.userId, userId)));
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTING
// ─────────────────────────────────────────────────────────────────────────────

export async function getAccountingEntries(userId: number, year?: number): Promise<AccountingEntry[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(accountingEntries.userId, userId)];
  if (year) {
    conditions.push(like(accountingEntries.date, `${year}-%`));
  }
  return db.select().from(accountingEntries)
    .where(and(...conditions))
    .orderBy(desc(accountingEntries.date));
}

export async function createAccountingEntry(data: InsertAccountingEntry): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(accountingEntries).values(data);
  return (result[0] as any).insertId;
}

export async function updateAccountingEntry(id: number, userId: number, data: Partial<InsertAccountingEntry>) {
  const db = await getDb();
  if (!db) return;
  await db.update(accountingEntries).set(data as any)
    .where(and(eq(accountingEntries.id, id), eq(accountingEntries.userId, userId)));
}

export async function deleteAccountingEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(accountingEntries)
    .where(and(eq(accountingEntries.id, id), eq(accountingEntries.userId, userId)));
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM — PROPERTIES
// ─────────────────────────────────────────────────────────────────────────────

export async function getCrmProperties(userId: number): Promise<CrmProperty[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(crmProperties)
    .where(eq(crmProperties.userId, userId))
    .orderBy(desc(crmProperties.createdAt));
}

export async function getCrmPropertyById(id: number, userId: number): Promise<CrmProperty | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(crmProperties)
    .where(and(eq(crmProperties.id, id), eq(crmProperties.userId, userId)))
    .limit(1);
  return result[0];
}

export async function createCrmProperty(data: InsertCrmProperty): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(crmProperties).values(data);
  return (result[0] as any).insertId;
}

export async function getWorkOrdersForProperty(userId: number, crmPropertyId?: number, listingId?: number): Promise<WorkOrder[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(workOrders.userId, userId)];
  if (crmPropertyId) conditions.push(eq(workOrders.crmPropertyId, crmPropertyId));
  else if (listingId) conditions.push(eq(workOrders.listingId, listingId));
  return db.select().from(workOrders).where(and(...conditions)).orderBy(desc(workOrders.createdAt));
}

export async function getRentPaymentsForListing(landlordUserId: number, listingId: number): Promise<RentPayment[]> {
  const db = await getDb();
  if (!db) return [];
  const leases = await db.select({ id: leaseAgreements.id })
    .from(leaseAgreements)
    .where(and(eq(leaseAgreements.landlordUserId, landlordUserId), eq(leaseAgreements.listingId, listingId)));
  if (!leases.length) return [];
  const leaseIds = leases.map(l => l.id);
  return db.select().from(rentPayments)
    .where(inArray(rentPayments.leaseAgreementId, leaseIds))
    .orderBy(desc(rentPayments.periodMonth));
}

export async function updateCrmProperty(id: number, userId: number, data: Partial<InsertCrmProperty>) {
  const db = await getDb();
  if (!db) return;
  await db.update(crmProperties).set({ ...data as any, updatedAt: new Date() })
    .where(and(eq(crmProperties.id, id), eq(crmProperties.userId, userId)));
}

export async function deleteCrmProperty(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(crmProperties)
    .where(and(eq(crmProperties.id, id), eq(crmProperties.userId, userId)));
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM — TENANTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getCrmTenants(userId: number, propertyId?: number): Promise<CrmTenant[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(crmTenants.userId, userId)];
  if (propertyId) conditions.push(eq(crmTenants.crmPropertyId, propertyId));
  return db.select().from(crmTenants)
    .where(and(...conditions))
    .orderBy(asc(crmTenants.lastName));
}

export async function createCrmTenant(data: InsertCrmTenant): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(crmTenants).values(data);
  return (result[0] as any).insertId;
}

export async function updateCrmTenant(id: number, userId: number, data: Partial<InsertCrmTenant>) {
  const db = await getDb();
  if (!db) return;
  await db.update(crmTenants).set({ ...data as any, updatedAt: new Date() })
    .where(and(eq(crmTenants.id, id), eq(crmTenants.userId, userId)));
}

export async function deleteCrmTenant(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(crmTenants)
    .where(and(eq(crmTenants.id, id), eq(crmTenants.userId, userId)));
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM — LEASES
// ─────────────────────────────────────────────────────────────────────────────

export async function getCrmLeases(userId: number, propertyId?: number): Promise<CrmLease[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(crmLeases.userId, userId)];
  if (propertyId) conditions.push(eq(crmLeases.crmPropertyId, propertyId));
  return db.select().from(crmLeases)
    .where(and(...conditions))
    .orderBy(desc(crmLeases.startDate));
}

export async function createCrmLease(data: InsertCrmLease): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(crmLeases).values(data);
  return (result[0] as any).insertId;
}

export async function updateCrmLease(id: number, userId: number, data: Partial<InsertCrmLease>) {
  const db = await getDb();
  if (!db) return;
  await db.update(crmLeases).set({ ...data as any, updatedAt: new Date() })
    .where(and(eq(crmLeases.id, id), eq(crmLeases.userId, userId)));
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM — NOTES
// ─────────────────────────────────────────────────────────────────────────────

export async function getCrmNotes(userId: number, entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(crmNotes)
    .where(and(
      eq(crmNotes.userId, userId),
      eq(crmNotes.entityType, entityType as any),
      eq(crmNotes.entityId, entityId)
    ))
    .orderBy(desc(crmNotes.createdAt));
}

export async function createCrmNote(data: InsertCrmNote): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(crmNotes).values(data);
  return (result[0] as any).insertId;
}

// ─── Tenant Portal Helpers ────────────────────────────────────────────────────

export async function getTenantByEmail(email: string): Promise<TenantPortalAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenantPortalAccounts)
    .where(and(eq(tenantPortalAccounts.email, email), eq(tenantPortalAccounts.status, "active")))
    .limit(1);
  return result[0];
}

export async function getTenantByToken(token: string): Promise<TenantPortalAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenantPortalAccounts)
    .where(eq(tenantPortalAccounts.accessToken, token))
    .limit(1);
  return result[0];
}

export async function getTenantById(id: number): Promise<TenantPortalAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenantPortalAccounts)
    .where(eq(tenantPortalAccounts.id, id))
    .limit(1);
  return result[0];
}

export async function getTenantsByLandlord(landlordUserId: number): Promise<TenantPortalAccount[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenantPortalAccounts)
    .where(eq(tenantPortalAccounts.landlordUserId, landlordUserId))
    .orderBy(desc(tenantPortalAccounts.createdAt));
}

export async function createTenantAccount(data: Omit<InsertTenantPortalAccount, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(tenantPortalAccounts).values(data as InsertTenantPortalAccount);
  return (result[0] as any).insertId;
}

export async function updateTenantToken(id: number, token: string | null, expiresAt: Date | null): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(tenantPortalAccounts)
    .set({ accessToken: token ?? undefined, tokenExpiresAt: expiresAt ?? undefined })
    .where(eq(tenantPortalAccounts.id, id));
}

// ─── Support Ticket Helpers ───────────────────────────────────────────────────

export async function createSupportTicket(data: Omit<InsertSupportTicket, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(supportTickets).values(data as InsertSupportTicket);
  return (result[0] as any).insertId;
}

export async function getSupportTickets(userId: number): Promise<SupportTicket[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function getSupportTicketById(id: number): Promise<SupportTicket | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(supportTickets)
    .where(eq(supportTickets.id, id))
    .limit(1);
  return result[0];
}

export async function createSupportReply(data: Omit<InsertSupportReply, "id" | "createdAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(supportReplies).values(data as InsertSupportReply);
  return (result[0] as any).insertId;
}

export async function getSupportReplies(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportReplies)
    .where(eq(supportReplies.ticketId, ticketId))
    .orderBy(asc(supportReplies.createdAt));
}

// ─── Rental Applications ──────────────────────────────────────────────────────
// marketplaceListings is already imported at the top of this file.
import {
  rentalApplications, InsertRentalApplication, RentalApplication,
  customApplicationTemplates, InsertCustomApplicationTemplate,
  areaRentRates,
} from "../drizzle/schema";

export async function createRentalApplication(data: Omit<InsertRentalApplication, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(rentalApplications).values(data as any);
  return (result[0] as any).insertId;
}

// Application list rows are extended with a few listing fields so the
// Lease Details modal can prefill without an extra round-trip.
// IMPORTANT: rent/deposit are explicitly named *Dollars because the
// listings table stores them as whole dollars, NOT cents. The client
// converts to cents when submitting back. Nullable when the listing
// was deleted/inactive.
export type RentalApplicationWithListing = RentalApplication & {
  listingMonthlyRentDollars: number | null;
  listingSecurityDepositDollars: number | null;
  listingAddress: string | null;
  listingCity: string | null;
  listingState: string | null;
  listingZip: string | null;
};

export async function getRentalApplicationsByLandlord(landlordUserId: number): Promise<RentalApplicationWithListing[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      app: rentalApplications,
      listingMonthlyRentDollars: marketplaceListings.monthlyRent,
      listingSecurityDepositDollars: marketplaceListings.securityDeposit,
      listingAddress: marketplaceListings.address,
      listingCity: marketplaceListings.city,
      listingState: marketplaceListings.state,
      listingZip: marketplaceListings.zip,
    })
    .from(rentalApplications)
    .leftJoin(marketplaceListings, eq(rentalApplications.listingId, marketplaceListings.id))
    .where(eq(rentalApplications.landlordUserId, landlordUserId))
    .orderBy(desc(rentalApplications.createdAt));
  return rows.map(r => ({
    ...r.app,
    listingMonthlyRentDollars: r.listingMonthlyRentDollars ?? null,
    listingSecurityDepositDollars: r.listingSecurityDepositDollars ?? null,
    listingAddress: r.listingAddress ?? null,
    listingCity: r.listingCity ?? null,
    listingState: r.listingState ?? null,
    listingZip: r.listingZip ?? null,
  }));
}

export async function getRentalApplicationsByListing(listingId: number): Promise<RentalApplication[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentalApplications).where(eq(rentalApplications.listingId, listingId)).orderBy(desc(rentalApplications.createdAt));
}

export async function getRentalApplicationById(id: number): Promise<RentalApplication | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(rentalApplications).where(eq(rentalApplications.id, id));
  return rows[0];
}

export async function updateRentalApplicationStatus(
  id: number,
  landlordUserId: number,
  status: string,
  notes?: string,
  override?: { reason: string; recommendation: string },
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const updates: Record<string, unknown> = { status: status as any, updatedAt: new Date() };
  if (notes !== undefined) updates.notes = notes;
  if (override) {
    updates.aiOverrideReason = override.reason;
    updates.aiOverrideRecommendation = override.recommendation;
    updates.aiOverrideAt = new Date();
  }
  await db.update(rentalApplications).set(updates as any).where(and(eq(rentalApplications.id, id), eq(rentalApplications.landlordUserId, landlordUserId)));
}

/** Persist the most-recent auto-created draft lease id onto the application row. */
export async function setApplicationDraftLeaseId(id: number, landlordUserId: number, leaseId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(rentalApplications)
    .set({ draftLeaseId: leaseId, updatedAt: new Date() })
    .where(and(eq(rentalApplications.id, id), eq(rentalApplications.landlordUserId, landlordUserId)));
}

/** Hard-delete a rental application. Owner check enforced by composite WHERE. */
export async function deleteRentalApplication(id: number, landlordUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(rentalApplications).where(and(eq(rentalApplications.id, id), eq(rentalApplications.landlordUserId, landlordUserId)));
}

export async function updateApplicationAiScreening(id: number, landlordUserId: number, result: unknown): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(rentalApplications)
    .set({ aiScreeningResult: JSON.stringify(result), aiScreenedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(rentalApplications.id, id), eq(rentalApplications.landlordUserId, landlordUserId)));
}

// ─── Custom Application Templates ────────────────────────────────────────────
export async function getCustomTemplatesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customApplicationTemplates).where(eq(customApplicationTemplates.userId, userId)).orderBy(desc(customApplicationTemplates.createdAt));
}

export async function createCustomTemplate(data: Omit<InsertCustomApplicationTemplate, "id" | "createdAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(customApplicationTemplates).values(data as any);
  return (result[0] as any).insertId;
}

export async function deleteCustomTemplate(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(customApplicationTemplates).where(and(eq(customApplicationTemplates.id, id), eq(customApplicationTemplates.userId, userId)));
}

// ─── Area Rent Rates ──────────────────────────────────────────────────────────
export async function getAreaRentRates(city: string, state: string, propertyType?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(areaRentRates.city, city), eq(areaRentRates.state, state)];
  if (propertyType) conditions.push(eq(areaRentRates.propertyType, propertyType as any));
  return db.select().from(areaRentRates).where(and(...conditions));
}

export async function getAreaRentRatesByState(state: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(areaRentRates).where(eq(areaRentRates.state, state));
}

// ─── Admin helpers ────────────────────────────────────────────────────────────
export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
}

export async function getUserCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ count: sql<number>`count(*)` }).from(users);
  return Number(rows[0]?.count ?? 0);
}

export async function getPaidUserCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ count: sql<number>`count(*)` }).from(userSubscriptions).where(eq(userSubscriptions.tier, "paid"));
  return Number(rows[0]?.count ?? 0);
}

export async function getListingCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ count: sql<number>`count(*)` }).from(marketplaceListings);
  return Number(rows[0]?.count ?? 0);
}

export async function getApplicationCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ count: sql<number>`count(*)` }).from(rentalApplications);
  return Number(rows[0]?.count ?? 0);
}

export async function setUserRole(userId: number, role: "user" | "admin"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function getAllSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: userSubscriptions.id,
    userId: userSubscriptions.userId,
    tier: userSubscriptions.tier,
    stripeSubscriptionId: userSubscriptions.stripeSubscriptionId,
    stripeCustomerId: userSubscriptions.stripeCustomerId,
    status: userSubscriptions.status,
    currentPeriodEnd: userSubscriptions.currentPeriodEnd,
    stripeConnectStatus: userSubscriptions.stripeConnectStatus,
    portalSubdomain: userSubscriptions.portalSubdomain,
    brandName: userSubscriptions.brandName,
    createdAt: userSubscriptions.createdAt,
    name: users.name,
    email: users.email,
  })
    .from(userSubscriptions)
    .leftJoin(users, eq(userSubscriptions.userId, users.id))
    .where(eq(userSubscriptions.tier, "paid"))
    .orderBy(desc(userSubscriptions.createdAt));
}

// ─── Pro Redemption Codes ─────────────────────────────────────────────────────

function generateProCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 for clarity
  const segment = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `LEASELY-${segment(4)}-${segment(4)}`;
}

export async function getOrCreateProCode(userId: number): Promise<ProRedemptionCode> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [existing] = await db.select().from(proRedemptionCodes).where(eq(proRedemptionCodes.userId, userId));
  if (existing) return existing;
  let code = generateProCode();
  // Ensure uniqueness
  for (let i = 0; i < 5; i++) {
    const [dupe] = await db.select().from(proRedemptionCodes).where(eq(proRedemptionCodes.code, code));
    if (!dupe) break;
    code = generateProCode();
  }
  const [row] = await db.insert(proRedemptionCodes).values({ userId, code }).$returningId();
  const [created] = await db.select().from(proRedemptionCodes).where(eq(proRedemptionCodes.id, row.id));
  return created;
}

export async function getProCodeByUserId(userId: number): Promise<ProRedemptionCode | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(proRedemptionCodes).where(eq(proRedemptionCodes.userId, userId));
  return row;
}

export async function getProCodeByCode(code: string): Promise<ProRedemptionCode | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(proRedemptionCodes).where(eq(proRedemptionCodes.code, code.toUpperCase()));
  return row;
}

/** For CBP API — fetches code + user info + brand brief in one shot */
export async function getProCodeWithBrief(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select({
      code: proRedemptionCodes.code,
      status: proRedemptionCodes.status,
      redeemedAt: proRedemptionCodes.redeemedAt,
      userId: proRedemptionCodes.userId,
      name: users.name,
      email: users.email,
      brandName: userSubscriptions.brandName,
      brandColor: userSubscriptions.brandColor,
      portalSubdomain: userSubscriptions.portalSubdomain,
      customDomain: userSubscriptions.customDomain,
      brandBrief: userSubscriptions.brandBrief,
    })
    .from(proRedemptionCodes)
    .leftJoin(users, eq(proRedemptionCodes.userId, users.id))
    .leftJoin(userSubscriptions, eq(proRedemptionCodes.userId, userSubscriptions.userId))
    .where(eq(proRedemptionCodes.code, code.toUpperCase()))
    .limit(1);
  if (!rows[0]) return undefined;
  const row = rows[0];
  let brief: any = null;
  if (row.brandBrief) {
    try { brief = JSON.parse(row.brandBrief); } catch {}
  }
  return { ...row, brief };
}

export async function redeemProCode(code: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "DB unavailable" };
  const [row] = await db.select().from(proRedemptionCodes).where(eq(proRedemptionCodes.code, code.toUpperCase()));
  if (!row) return { success: false, error: "Code not found" };
  if (row.status === "redeemed") return { success: false, error: "Code already redeemed" };
  if (row.status === "cancelled") return { success: false, error: "Code has been cancelled" };
  await db.update(proRedemptionCodes)
    .set({ status: "redeemed", redeemedAt: new Date() })
    .where(eq(proRedemptionCodes.code, code.toUpperCase()));
  return { success: true };
}

export async function getAllProCodes() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: proRedemptionCodes.id,
    userId: proRedemptionCodes.userId,
    code: proRedemptionCodes.code,
    status: proRedemptionCodes.status,
    redeemedAt: proRedemptionCodes.redeemedAt,
    createdAt: proRedemptionCodes.createdAt,
    name: users.name,
    email: users.email,
  }).from(proRedemptionCodes)
    .leftJoin(users, eq(proRedemptionCodes.userId, users.id))
    .orderBy(desc(proRedemptionCodes.createdAt));
}

export async function getAllListingsAdmin(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: marketplaceListings.id,
    userId: marketplaceListings.userId,
    title: marketplaceListings.title,
    propertyType: marketplaceListings.propertyType,
    address: marketplaceListings.address,
    city: marketplaceListings.city,
    state: marketplaceListings.state,
    zip: marketplaceListings.zip,
    latitude: marketplaceListings.latitude,
    longitude: marketplaceListings.longitude,
    monthlyRent: marketplaceListings.monthlyRent,
    bedrooms: marketplaceListings.bedrooms,
    bathrooms: marketplaceListings.bathrooms,
    status: marketplaceListings.status,
    viewCount: marketplaceListings.viewCount,
    saveCount: marketplaceListings.saveCount,
    createdAt: marketplaceListings.createdAt,
    ownerName: users.name,
    ownerEmail: users.email,
  })
    .from(marketplaceListings)
    .leftJoin(users, eq(marketplaceListings.userId, users.id))
    .orderBy(desc(marketplaceListings.createdAt))
    .limit(limit);
}

// ─── Creme Agents ─────────────────────────────────────────────────────────────

export async function getCremeAgentByUserId(userId: number): Promise<CremeAgent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(cremeAgents).where(eq(cremeAgents.userId, userId)).limit(1);
  return rows[0];
}

export async function getCremeAgentById(id: number): Promise<(CremeAgent & { name: string | null; email: string | null }) | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({
    id: cremeAgents.id, userId: cremeAgents.userId, licenseNumber: cremeAgents.licenseNumber,
    bio: cremeAgents.bio, phone: cremeAgents.phone, specialties: cremeAgents.specialties,
    serviceAreas: cremeAgents.serviceAreas, photoUrl: cremeAgents.photoUrl,
    status: cremeAgents.status, dealCount: cremeAgents.dealCount,
    averageRating: cremeAgents.averageRating, reviewCount: cremeAgents.reviewCount,
    createdAt: cremeAgents.createdAt, updatedAt: cremeAgents.updatedAt,
    name: users.name, email: users.email,
  }).from(cremeAgents).leftJoin(users, eq(cremeAgents.userId, users.id)).where(eq(cremeAgents.id, id)).limit(1);
  return rows[0] as any;
}

export async function getApprovedCremeAgents(): Promise<(CremeAgent & { name: string | null; email: string | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: cremeAgents.id, userId: cremeAgents.userId, licenseNumber: cremeAgents.licenseNumber,
    bio: cremeAgents.bio, phone: cremeAgents.phone, specialties: cremeAgents.specialties,
    serviceAreas: cremeAgents.serviceAreas, photoUrl: cremeAgents.photoUrl,
    status: cremeAgents.status, dealCount: cremeAgents.dealCount,
    averageRating: cremeAgents.averageRating, reviewCount: cremeAgents.reviewCount,
    createdAt: cremeAgents.createdAt, updatedAt: cremeAgents.updatedAt,
    name: users.name, email: users.email,
  }).from(cremeAgents).leftJoin(users, eq(cremeAgents.userId, users.id))
    .where(eq(cremeAgents.status, "approved")).orderBy(desc(cremeAgents.dealCount));
  return rows as any;
}

export async function getAllCremeAgents(): Promise<(CremeAgent & { email: string | null; name: string | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: cremeAgents.id, userId: cremeAgents.userId, licenseNumber: cremeAgents.licenseNumber,
    bio: cremeAgents.bio, phone: cremeAgents.phone, specialties: cremeAgents.specialties,
    serviceAreas: cremeAgents.serviceAreas, photoUrl: cremeAgents.photoUrl,
    status: cremeAgents.status, dealCount: cremeAgents.dealCount,
    averageRating: cremeAgents.averageRating, reviewCount: cremeAgents.reviewCount,
    createdAt: cremeAgents.createdAt, updatedAt: cremeAgents.updatedAt,
    email: users.email, name: users.name,
  }).from(cremeAgents).leftJoin(users, eq(cremeAgents.userId, users.id)).orderBy(desc(cremeAgents.createdAt));
  return rows as any;
}

export async function upsertCremeAgent(data: InsertCremeAgent): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(cremeAgents).values(data).onDuplicateKeyUpdate({ set: {
    licenseNumber: data.licenseNumber, bio: data.bio, phone: data.phone,
    specialties: data.specialties, serviceAreas: data.serviceAreas,
    photoUrl: data.photoUrl, status: data.status,
    dealCount: data.dealCount, averageRating: data.averageRating, reviewCount: data.reviewCount,
  }});
}

export async function updateCremeAgentStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(cremeAgents).set({ status }).where(eq(cremeAgents.id, id));
}

// ─── Creme Agent Leads ────────────────────────────────────────────────────────

export async function createCremeAgentLead(data: InsertCremeAgentLead): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(cremeAgentLeads).values(data);
  return (result[0] as any).insertId;
}

export async function getLeadsByAgent(agentId: number): Promise<CremeAgentLead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cremeAgentLeads).where(eq(cremeAgentLeads.agentId, agentId)).orderBy(desc(cremeAgentLeads.createdAt));
}

export async function getAllLeads(): Promise<(CremeAgentLead & { agentName: string | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: cremeAgentLeads.id, agentId: cremeAgentLeads.agentId,
    clientName: cremeAgentLeads.clientName, clientEmail: cremeAgentLeads.clientEmail,
    clientPhone: cremeAgentLeads.clientPhone, leadType: cremeAgentLeads.leadType,
    propertyAddress: cremeAgentLeads.propertyAddress, message: cremeAgentLeads.message,
    status: cremeAgentLeads.status, dealValue: cremeAgentLeads.dealValue,
    feeCents: cremeAgentLeads.feeCents, feePaid: cremeAgentLeads.feePaid,
    stripeInvoiceId: cremeAgentLeads.stripeInvoiceId, source: cremeAgentLeads.source,
    createdAt: cremeAgentLeads.createdAt, updatedAt: cremeAgentLeads.updatedAt,
    agentName: users.name,
  }).from(cremeAgentLeads)
    .leftJoin(cremeAgents, eq(cremeAgentLeads.agentId, cremeAgents.id))
    .leftJoin(users, eq(cremeAgents.userId, users.id))
    .orderBy(desc(cremeAgentLeads.createdAt));
  return rows as any;
}

export async function updateLeadStatus(id: number, status: string, dealValue?: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const update: Record<string, any> = { status };
  if (dealValue !== undefined) {
    update.dealValue = dealValue;
    update.feeCents = Math.round(dealValue * 0.0075);
  }
  await db.update(cremeAgentLeads).set(update).where(eq(cremeAgentLeads.id, id));
}

export async function assignLead(leadId: number, agentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(cremeAgentLeads).set({ agentId }).where(eq(cremeAgentLeads.id, leadId));
}

// ─── Agent Reviews ────────────────────────────────────────────────────────────

export async function createAgentReview(data: InsertAgentReview): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(agentReviews).values(data);
}

export async function getApprovedReviewsByAgent(agentId: number): Promise<AgentReview[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agentReviews).where(and(eq(agentReviews.agentId, agentId), eq(agentReviews.approved, 1))).orderBy(desc(agentReviews.createdAt));
}

export async function getAllReviews(): Promise<AgentReview[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agentReviews).orderBy(desc(agentReviews.createdAt));
}

export async function updateReviewApproval(id: number, approved: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(agentReviews).set({ approved }).where(eq(agentReviews.id, id));
}

export async function deleteReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(agentReviews).where(eq(agentReviews.id, id));
}

// ─── Renter Waitlist ──────────────────────────────────────────────────────────

export async function joinWaitlist(data: InsertRenterWaitlistEntry): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(renterWaitlist).values(data);
}

export async function getWaitlistEntries(): Promise<RenterWaitlistEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(renterWaitlist).orderBy(desc(renterWaitlist.createdAt));
}

export async function markWaitlistContacted(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(renterWaitlist).set({ contactedBy: userId, contactedAt: new Date() }).where(eq(renterWaitlist.id, id));
}

export async function deleteWaitlistEntry(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(renterWaitlist).where(eq(renterWaitlist.id, id));
}

// ─── FSBO ─────────────────────────────────────────────────────────────────────

export async function createFsboProfile(data: InsertFsboProfile): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(fsboProfiles).values(data);
  return (result[0] as any).insertId;
}

export async function getFsboByUserId(userId: number): Promise<FsboProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(fsboProfiles).where(eq(fsboProfiles.userId, userId)).limit(1);
  return rows[0];
}

export async function updateFsboProfile(userId: number, data: Partial<InsertFsboProfile>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(fsboProfiles).set(data).where(eq(fsboProfiles.userId, userId));
}

export async function getAllFsboProfiles(): Promise<FsboProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fsboProfiles).orderBy(desc(fsboProfiles.createdAt));
}

// ─── SOP Reads ────────────────────────────────────────────────────────────────

export async function markSopRead(userId: number, sopId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(sopReads).where(and(eq(sopReads.userId, userId), eq(sopReads.sopId, sopId))).limit(1);
  if (existing.length === 0) await db.insert(sopReads).values({ userId, sopId });
}

export async function getSopReadsByUser(userId: number): Promise<SopRead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sopReads).where(eq(sopReads.userId, userId));
}

export async function getAllSopReads(): Promise<(SopRead & { userName: string | null; userEmail: string | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: sopReads.id, userId: sopReads.userId, sopId: sopReads.sopId, readAt: sopReads.readAt,
    userName: users.name, userEmail: users.email,
  }).from(sopReads).leftJoin(users, eq(sopReads.userId, users.id)).orderBy(desc(sopReads.readAt));
  return rows as any;
}

// ─── Training Progress ────────────────────────────────────────────────────────

export async function markTrainingComplete(userId: number, videoId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(trainingProgress).where(and(eq(trainingProgress.userId, userId), eq(trainingProgress.videoId, videoId))).limit(1);
  if (existing.length === 0) await db.insert(trainingProgress).values({ userId, videoId });
}

export async function getTrainingProgressByUser(userId: number): Promise<TrainingProgress[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingProgress).where(eq(trainingProgress.userId, userId));
}

// ─── Syndication ──────────────────────────────────────────────────────────────

export async function getSyndicationShares(userId: number): Promise<SyndicationShare[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(syndicationShares).where(eq(syndicationShares.userId, userId)).orderBy(desc(syndicationShares.createdAt));
}

export async function createSyndicationShare(data: InsertSyndicationShare): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(syndicationShares).values(data);
  return (result[0] as any).insertId;
}

export async function deleteSyndicationShare(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(syndicationShares).where(and(eq(syndicationShares.id, id), eq(syndicationShares.userId, userId)));
}

// ─── Contractor / Handyman Directory ─────────────────────────────────────────
export async function getApprovedContractors(filters?: {
  state?: string; trade?: string; search?: string; featured?: boolean;
}): Promise<ContractorProfile[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(contractorProfiles)
    .where(eq(contractorProfiles.status, "approved"))
    .orderBy(desc(contractorProfiles.featured), desc(contractorProfiles.averageRating));
  let result = rows;
  if (filters?.state) result = result.filter(c => c.state === filters.state);
  if (filters?.featured) result = result.filter(c => c.featured === 1);
  if (filters?.trade) {
    result = result.filter(c => {
      const trades = c.trades ? JSON.parse(c.trades) : [];
      return trades.includes(filters.trade);
    });
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(c =>
      c.businessName.toLowerCase().includes(q) ||
      (c.city ?? "").toLowerCase().includes(q) ||
      (c.ownerName ?? "").toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getContractorById(id: number): Promise<ContractorProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(contractorProfiles).where(eq(contractorProfiles.id, id)).limit(1);
  return rows[0];
}

export async function getContractorBySlug(slug: string): Promise<ContractorProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(contractorProfiles).where(eq(contractorProfiles.slug, slug)).limit(1);
  return rows[0];
}

export async function getContractorByUserId(userId: number): Promise<ContractorProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(contractorProfiles).where(eq(contractorProfiles.userId, userId)).limit(1);
  return rows[0];
}

export async function getAllContractors(): Promise<ContractorProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractorProfiles).orderBy(desc(contractorProfiles.createdAt));
}

export async function upsertContractorProfile(userId: number, data: Partial<InsertContractorProfile>): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getContractorByUserId(userId);
  if (existing) {
    await db.update(contractorProfiles).set({ ...data, updatedAt: new Date() }).where(eq(contractorProfiles.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(contractorProfiles).values({ ...data, userId } as InsertContractorProfile);
  return (result[0] as any).insertId;
}

export async function createContractorProfile(data: InsertContractorProfile): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(contractorProfiles).values(data);
  return (result[0] as any).insertId;
}

export async function updateContractorStatus(id: number, status: "pending" | "approved" | "rejected" | "suspended"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(contractorProfiles).set({ status, updatedAt: new Date() }).where(eq(contractorProfiles.id, id));
}

export async function incrementContractorViews(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const row = await db.select({ v: contractorProfiles.profileViews }).from(contractorProfiles).where(eq(contractorProfiles.id, id)).limit(1);
  const current = row[0]?.v ?? 0;
  await db.update(contractorProfiles).set({ profileViews: current + 1 }).where(eq(contractorProfiles.id, id));
}

export async function getApprovedContractorReviews(contractorId: number): Promise<ContractorReview[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractorReviews)
    .where(and(eq(contractorReviews.contractorId, contractorId), eq(contractorReviews.approved, 1)))
    .orderBy(desc(contractorReviews.createdAt));
}

export async function getAllContractorReviews(): Promise<ContractorReview[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractorReviews).orderBy(desc(contractorReviews.createdAt));
}

export async function createContractorReview(data: InsertContractorReview): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(contractorReviews).values(data);
  const id = (result[0] as any).insertId;
  // Recalculate average rating
  const allApproved = await db.select().from(contractorReviews)
    .where(and(eq(contractorReviews.contractorId, data.contractorId), eq(contractorReviews.approved, 1)));
  if (allApproved.length > 0) {
    const avg = allApproved.reduce((s, r) => s + r.rating, 0) / allApproved.length;
    await db.update(contractorProfiles).set({ averageRating: avg, reviewCount: allApproved.length }).where(eq(contractorProfiles.id, data.contractorId));
  }
  return id;
}

export async function updateContractorReviewApproval(id: number, approved: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(contractorReviews).set({ approved }).where(eq(contractorReviews.id, id));
  // Recalculate rating for contractor
  const review = await db.select().from(contractorReviews).where(eq(contractorReviews.id, id)).limit(1);
  if (review[0]) {
    const allApproved = await db.select().from(contractorReviews)
      .where(and(eq(contractorReviews.contractorId, review[0].contractorId), eq(contractorReviews.approved, 1)));
    const avg = allApproved.length > 0 ? allApproved.reduce((s, r) => s + r.rating, 0) / allApproved.length : 0;
    await db.update(contractorProfiles).set({ averageRating: avg, reviewCount: allApproved.length }).where(eq(contractorProfiles.id, review[0].contractorId));
  }
}

export async function createContractorLead(data: InsertContractorLead): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(contractorLeads).values(data);
  return (result[0] as any).insertId;
}

export async function getContractorLeads(contractorId: number): Promise<ContractorLead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractorLeads).where(eq(contractorLeads.contractorId, contractorId)).orderBy(desc(contractorLeads.createdAt));
}

export async function getAllContractorLeads(): Promise<ContractorLead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractorLeads).orderBy(desc(contractorLeads.createdAt));
}

// ─── Lease Agreements ─────────────────────────────────────────────────────────
import {
  leaseAgreements, InsertLeaseAgreement, LeaseAgreement,
  leaseDocuments,
  propertyManagerAccess, InsertPropertyManagerAccess, PropertyManagerAccess,
  vendorDispatchRequests, InsertVendorDispatchRequest, VendorDispatchRequest,
  rentPayments, InsertRentPayment, RentPayment,
} from "../drizzle/schema";

export async function createLeaseAgreement(data: Omit<InsertLeaseAgreement, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(leaseAgreements).values(data as any);
  return (result[0] as any).insertId;
}

export async function getLeasesByLandlord(landlordUserId: number): Promise<(LeaseAgreement & { leaseDocumentId: number | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      lease: leaseAgreements,
      leaseDocumentId: sql<number | null>`MAX(${leaseDocuments.id})`,
    })
    .from(leaseAgreements)
    .leftJoin(leaseDocuments, eq(leaseDocuments.leaseAgreementId, leaseAgreements.id))
    .where(eq(leaseAgreements.landlordUserId, landlordUserId))
    .groupBy(leaseAgreements.id)
    .orderBy(desc(leaseAgreements.createdAt));
  return rows.map(r => ({ ...r.lease, leaseDocumentId: r.leaseDocumentId ?? null }));
}

export async function getLeasesByTenantEmail(email: string): Promise<LeaseAgreement[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaseAgreements)
    .where(eq(leaseAgreements.tenantEmail, email))
    .orderBy(desc(leaseAgreements.createdAt));
}

export async function getLeaseById(id: number): Promise<LeaseAgreement | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(leaseAgreements).where(eq(leaseAgreements.id, id)).limit(1);
  return rows[0];
}

export async function updateLeaseAgreement(id: number, landlordUserId: number, data: Partial<InsertLeaseAgreement>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(leaseAgreements)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(and(eq(leaseAgreements.id, id), eq(leaseAgreements.landlordUserId, landlordUserId)));
}

// ─── Property Manager Access ──────────────────────────────────────────────────

export async function createPropertyManagerAccess(data: Omit<InsertPropertyManagerAccess, "id" | "createdAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(propertyManagerAccess).values(data as any);
  return (result[0] as any).insertId;
}

export async function getPropertyManagersByOwner(ownerUserId: number): Promise<PropertyManagerAccess[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(propertyManagerAccess)
    .where(and(eq(propertyManagerAccess.ownerUserId, ownerUserId), eq(propertyManagerAccess.status, "active")));
}

export async function getPropertiesManagedBy(managerUserId: number): Promise<PropertyManagerAccess[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(propertyManagerAccess)
    .where(and(eq(propertyManagerAccess.managerUserId, managerUserId), eq(propertyManagerAccess.status, "active")));
}

export async function updatePropertyManagerAccess(id: number, ownerUserId: number, data: Partial<InsertPropertyManagerAccess>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(propertyManagerAccess)
    .set(data as any)
    .where(and(eq(propertyManagerAccess.id, id), eq(propertyManagerAccess.ownerUserId, ownerUserId)));
}

export async function revokePropertyManagerAccess(id: number, ownerUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(propertyManagerAccess)
    .set({ status: "revoked" })
    .where(and(eq(propertyManagerAccess.id, id), eq(propertyManagerAccess.ownerUserId, ownerUserId)));
}

// ─── Vendor Dispatch Requests ─────────────────────────────────────────────────

export async function createVendorDispatchRequest(data: Omit<InsertVendorDispatchRequest, "id">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(vendorDispatchRequests).values(data as any);
  return (result[0] as any).insertId;
}

export async function getDispatchsByWorkOrder(workOrderId: number): Promise<VendorDispatchRequest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vendorDispatchRequests)
    .where(eq(vendorDispatchRequests.workOrderId, workOrderId))
    .orderBy(asc(vendorDispatchRequests.sentAt));
}

export async function getDispatchsByVendor(vendorId: number): Promise<VendorDispatchRequest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vendorDispatchRequests)
    .where(eq(vendorDispatchRequests.vendorId, vendorId))
    .orderBy(desc(vendorDispatchRequests.sentAt));
}

export async function updateVendorDispatchRequest(id: number, data: Partial<InsertVendorDispatchRequest>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(vendorDispatchRequests).set(data as any).where(eq(vendorDispatchRequests.id, id));
}

export async function getDispatchById(id: number): Promise<VendorDispatchRequest | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(vendorDispatchRequests).where(eq(vendorDispatchRequests.id, id)).limit(1);
  return rows[0];
}

// ─── Rent Payments (monthly ledger / arrears) ────────────────────────────────

export async function createRentPayment(data: Omit<InsertRentPayment, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(rentPayments).values(data as any);
  return (result[0] as any).insertId;
}

export async function updateRentPayment(id: number, data: Partial<InsertRentPayment>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(rentPayments).set(data as any).where(eq(rentPayments.id, id));
}

export async function listRentPaymentsByLease(leaseAgreementId: number): Promise<RentPayment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentPayments)
    .where(eq(rentPayments.leaseAgreementId, leaseAgreementId))
    .orderBy(desc(rentPayments.periodMonth));
}

export async function listRentPaymentsByLandlord(landlordUserId: number): Promise<RentPayment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentPayments)
    .where(eq(rentPayments.landlordUserId, landlordUserId))
    .orderBy(desc(rentPayments.dueDate));
}

export async function getRentPaymentByLeasePeriod(leaseAgreementId: number, periodMonth: string): Promise<RentPayment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(rentPayments)
    .where(and(eq(rentPayments.leaseAgreementId, leaseAgreementId), eq(rentPayments.periodMonth, periodMonth)))
    .limit(1);
  return rows[0];
}

export async function getRentPaymentById(id: number): Promise<RentPayment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(rentPayments).where(eq(rentPayments.id, id)).limit(1);
  return rows[0];
}

// ─── In-app Notifications ─────────────────────────────────────────────────────
import { notifications, InsertNotification, Notification } from "../drizzle/schema";

export async function createNotification(data: Omit<InsertNotification, "id" | "createdAt">): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(notifications).values(data as any);
  return (result[0] as any).insertId;
}

export async function listNotificationsForUser(userId: number, limit = 30): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function countUnreadNotifications(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ id: notifications.id }).from(notifications)
    .where(and(eq(notifications.userId, userId), sql`${notifications.readAt} IS NULL`));
  return rows.length;
}

export async function markNotificationRead(userId: number, id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ readAt: new Date() } as any)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ readAt: new Date() } as any)
    .where(and(eq(notifications.userId, userId), sql`${notifications.readAt} IS NULL`));
}
