import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import {
  sendEmail,
  workOrderDispatchEmail, tenantMaintenanceConfirmEmail, landlordMaintenanceAlertEmail,
  leaseAgreementEmail, leaseSignedPaymentEmail,
  vendorDispatchRequestEmail, vendorQuoteReceivedEmail, vendorJobCompleteEmail,
  newInquiryEmail,
} from "./_core/email";
import Stripe from "stripe";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { LEASELY_PRO, LEASELY_PRO_SETUP } from "./products";
import QRCode from "qrcode";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { ENV } from "./_core/env";
import { createPatchedFetch } from "./_core/patchedFetch";

// Signed tenant session token: base64url(payload).hmac
const TENANT_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
function tenantTokenSecret() {
  return process.env.JWT_SECRET || "";
}
function signTenantToken(tenantId: number): string {
  const payload = Buffer.from(JSON.stringify({ id: tenantId, ts: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", tenantTokenSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}
function verifyTenantToken(token: string): { id: number; ts: number } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", tenantTokenSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as { id: number; ts: number };
    if (typeof decoded.id !== "number" || typeof decoded.ts !== "number") return null;
    if (Date.now() - decoded.ts > TENANT_TOKEN_TTL_MS) return null;
    return decoded;
  } catch {
    return null;
  }
}

// Signed CRM rent-collection token: identifies a CRM tenant for a private
// (never-publicly-listed) rent payment. Long-lived so a landlord can reuse the
// same link every month. Not a session — it only authorizes paying rent.
function signCrmRentToken(crmTenantId: number): string {
  const payload = Buffer.from(JSON.stringify({ ct: crmTenantId })).toString("base64url");
  const sig = createHmac("sha256", tenantTokenSecret()).update(`rent:${payload}`).digest("base64url");
  return `${payload}.${sig}`;
}
function verifyCrmRentToken(token: string): { ct: number } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", tenantTokenSecret()).update(`rent:${payload}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as { ct: number };
    if (typeof decoded.ct !== "number") return null;
    return decoded;
  } catch {
    return null;
  }
}

// Signed fillable-lease invite. The landlord defines the terms; the token
// carries them (plus the landlord's userId) so no invite table is needed. The
// tenant opens /lease/:token, fills the structured blanks (their legal name,
// phone, emergency contact) and confirms — on submit we create the crm
// property/tenant/lease and the portal goes live. No AI, no tokens.
type LeaseInvitePayload = {
  lid: number;               // landlord userId
  lname?: string;            // landlord/brand display name (for the tenant page)
  name?: string;             // tenant name (landlord-prefilled)
  address: string; unit?: string; ptype?: string; city?: string; state?: string; zip?: string;
  email: string;             // tenant email the invite was sent to
  rent: number;              // cents
  deposit?: number;          // cents
  start: string; end?: string;
  lateFee?: number; grace?: number;
  docUrl?: string;           // landlord's stored/uploaded lease PDF to sign (optional)
};
function signLeaseInvite(p: LeaseInvitePayload): string {
  const payload = Buffer.from(JSON.stringify(p)).toString("base64url");
  const sig = createHmac("sha256", tenantTokenSecret()).update(`lease:${payload}`).digest("base64url");
  return `${payload}.${sig}`;
}
function verifyLeaseInvite(token: string): LeaseInvitePayload | null {
  const [payload, sig] = (token || "").split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", tenantTokenSecret()).update(`lease:${payload}`).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString()) as LeaseInvitePayload;
    if (typeof d.lid !== "number" || !d.address || !d.rent) return null;
    return d;
  } catch { return null; }
}
import { storagePut } from "./storage";
import { affiliates, w9Submissions, affiliateReferrals, affiliatePayouts, marketplaceListings, rentalApplications, leaseAgreements, users } from "../drizzle/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  upsertUser, getUserByOpenId,
  getMarketplaceListings, getFeaturedListings, getMapListings,
  getListingById, getListingsByUserId, createListing, updateListing, deleteListing,
  incrementViewCount, countUserListings,
  saveListing, unsaveListing, getSavedListings, isListingSaved,
  createInquiry, getListingAnalytics,
  getUserSubscription, upsertUserSubscription, setStripeConnectAccount,
  setAccountType, updatePortalBranding,
  getSavedSearches, createSavedSearch, deleteSavedSearch,
  getPortalBySubdomain, getPaymentsByLandlord, createPaymentRecord, updatePaymentStatus,
  getVendors, getVendorById, createVendor, updateVendor, deleteVendor,
  getTenantFavoriteVendors, getTenantFavoriteVendorForCategory,
  setTenantFavoriteVendor, clearTenantFavoriteVendor,
  getWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder,
  getAccountingEntries, createAccountingEntry, updateAccountingEntry, deleteAccountingEntry,
  getCrmProperties, getCrmPropertyById, createCrmProperty, updateCrmProperty, deleteCrmProperty,
  getCrmTenants, getCrmTenantById, createCrmTenant, updateCrmTenant, deleteCrmTenant,
  getCrmLeases, createCrmLease, updateCrmLease,
  getCrmNotes, createCrmNote,
  getWorkOrdersForProperty, getRentPaymentsForListing,
  // Tenant portal
  getTenantByEmail, getTenantByToken, createTenantAccount, updateTenantToken,
  getTenantsByLandlord, getTenantById, getUserById,
  // Support tickets
  createSupportTicket, getSupportTickets, getSupportTicketById,
  createSupportReply, getSupportReplies,
  // Rental applications
  createRentalApplication, getRentalApplicationsByLandlord, getRentalApplicationsByListing,
  getRentalApplicationById, updateRentalApplicationStatus, updateApplicationAiScreening, setApplicationDraftLeaseId,
  deleteRentalApplication,
  // Custom templates
  getCustomTemplatesByUser, createCustomTemplate, deleteCustomTemplate,
  // Rent rates
  getAreaRentRates, getAreaRentRatesByState,
  // Admin
  getAllUsers, getUserCount, getPaidUserCount, getListingCount, getApplicationCount,
  setUserRole, getAllSubscriptions, getAllListingsAdmin, deleteUserById, getUserByEmail, getBusinessMetrics,
  getOrCreateProCode, getProCodeByUserId, getAllProCodes, redeemProCode,
  // Creme Agents
  getCremeAgentByUserId, getCremeAgentById, getApprovedCremeAgents, getAllCremeAgents,
  upsertCremeAgent, updateCremeAgentStatus,
  createCremeAgentLead, getLeadsByAgent, getAllLeads, updateLeadStatus, assignLead,
  createAgentReview, getApprovedReviewsByAgent, getAllReviews, updateReviewApproval, deleteReview,
  // Renter Waitlist
  joinWaitlist, getWaitlistEntries, markWaitlistContacted, deleteWaitlistEntry,
  // FSBO
  createFsboProfile, getFsboByUserId, updateFsboProfile, getAllFsboProfiles,
  // SOP
  markSopRead, getSopReadsByUser, getAllSopReads,
  // Training
  markTrainingComplete, getTrainingProgressByUser,
  // Syndication
  getSyndicationShares, createSyndicationShare, deleteSyndicationShare,
  // Contractors
  getApprovedContractors, getContractorById, getContractorBySlug, getContractorByUserId,
  getAllContractors, upsertContractorProfile, createContractorProfile, updateContractorStatus,
  incrementContractorViews, getApprovedContractorReviews, getAllContractorReviews,
  createContractorReview, updateContractorReviewApproval,
  createContractorLead, getContractorLeads, getAllContractorLeads,
  // Lease Agreements
  createLeaseAgreement, getLeasesByLandlord, getLeasesByTenantEmail, getLeaseById, updateLeaseAgreement,
  // Property Manager Access
  createPropertyManagerAccess, getPropertyManagersByOwner, getPropertiesManagedBy, updatePropertyManagerAccess, revokePropertyManagerAccess,
  // Vendor Dispatch
  createVendorDispatchRequest, getDispatchsByWorkOrder, getDispatchsByVendor, updateVendorDispatchRequest, getDispatchById,
  createRentPayment, updateRentPayment, listRentPaymentsByLease, listRentPaymentsByLandlord, getRentPaymentByLeasePeriod, getRentPaymentById,
  // In-app notifications
  createNotification, listNotificationsForUser, countUnreadNotifications, markNotificationRead, markAllNotificationsRead,
  // Auth: session revocation
  bumpTokenVersion,
} from "./db";
import {
  getComplexesByUser, getComplexById, createComplex, updateComplex, deleteComplex,
  getUnitsByComplex, getUnitById, createUnit, updateUnit, deleteUnit, publishUnitToMarketplace,
  getIstayListings, getIstayListingById, getIstayListingsByUser,
  createIstayListing, updateIstayListing, deleteIstayListing,
  saveIstayListing, unsaveIstayListing, getSavedIstayListings,
  getIstayReviews, createIstayReview,
  createIstayBooking, getIstayBookingsByGuest, getIstayBookingsByHost, updateIstayBooking,
} from "./db-extensions";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" as any });
}

// CBP's Stripe account (separate from Keycove's). Used to mint the per-user
// 100%-off promotion code that redeems CBP's website-bundle Payment Link as
// the bundled perk paid for by Keycove's $75 setup fee.
function getCbpStripe() {
  const key = process.env.CBP_STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" as any });
}

/**
 * True when a Stripe error means the stored Connect account can no longer be
 * reached by the current platform key — it was deleted, belongs to a former
 * platform account, or the app's access was revoked. In every case the stored
 * account id is dead and should be cleared so the user can reconnect fresh.
 * Covers both the 404 "No such account" and the 403 "does not have access to
 * account … Application access may have been revoked" responses.
 */
function isStripeAccountInaccessible(err: any): boolean {
  const msg = String(err?.raw?.message ?? err?.message ?? "");
  const code = err?.raw?.code ?? err?.code;
  const status = err?.raw?.statusCode ?? err?.statusCode;
  return (
    code === "account_invalid" ||
    status === 404 ||
    status === 403 ||
    /does not have access to account/i.test(msg) ||
    /application access may have been revoked/i.test(msg) ||
    /no such account/i.test(msg)
  );
}

const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";

// The active CBP website-bundle Payment Link slug — used to find the live $299
// price so we can PROVE a coupon actually zeroes it before handing out a code.
// Keep in sync with CBP_WEBSITE_BUILDER_URL in client/src/pages/PortalSetup.tsx
// and CBP_BUNDLE_SLUG in server/_core/automationSweep.ts.
export const CBP_WEBSITE_BUNDLE_SLUG = "00w9AM5Zrb7FfKM0Cn9ws0g";

// Cached after first lookup — Stripe IDs don't change, no need to re-query.
let _cbpWebsiteBundleCouponId: string | null = null;
let _cbpBundlePriceId: string | null = null;

async function getCbpBundlePriceId(cbp: Stripe): Promise<string | null> {
  if (_cbpBundlePriceId) return _cbpBundlePriceId;
  for await (const link of cbp.paymentLinks.list({ active: true, limit: 100 })) {
    if (!link.url?.includes(CBP_WEBSITE_BUNDLE_SLUG)) continue;
    const items = await cbp.paymentLinks.listLineItems(link.id, { limit: 1 });
    const price = items.data[0]?.price;
    const priceId = typeof price === "string" ? price : price?.id;
    if (priceId) { _cbpBundlePriceId = priceId; return priceId; }
  }
  return null;
}

// Definitive coupon validity test: does this coupon actually take the bundle to
// $0 at checkout? A "poisoned" coupon (Stripe keeps a hidden stale product
// restriction after the bundle product is replaced) reports itself valid but
// silently applies to nothing — the ONLY reliable way to catch that is to open
// a throwaway Checkout Session and read amount_total. The session is expired
// immediately and never charges.
export async function cbpCouponZeroesBundle(cbp: Stripe, couponId: string): Promise<boolean> {
  try {
    const priceId = await getCbpBundlePriceId(cbp);
    if (!priceId) return false;
    const cs = await cbp.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: [{ coupon: couponId }],
      success_url: `${APP_URL}/portal-setup?ok=1`,
    });
    const zero = cs.amount_total === 0;
    try { await cbp.checkout.sessions.expire(cs.id); } catch { /* best-effort cleanup */ }
    return zero;
  } catch {
    return false;
  }
}

async function getOrCreateCbpWebsiteBundleCoupon(cbp: Stripe): Promise<string | null> {
  if (_cbpWebsiteBundleCouponId) return _cbpWebsiteBundleCouponId;
  // Reuse a tagged 100%-off coupon ONLY if it still zeroes the bundle. This is
  // the self-healing guard: if a coupon is ever "poisoned" (Stripe keeps a
  // hidden stale product restriction after the bundle product is replaced, so
  // it silently applies to nothing), we detect it, untag it, and mint a fresh
  // working one — a Pro user always gets a usable code.
  //
  // We intentionally do NOT product-scope the coupon: Stripe didn't reliably
  // persist applies_to here, and product-scoping is exactly what caused the
  // poisoning. An unrestricted coupon + per-user single-use 30-day promo code
  // (issueCbpWebsiteCoupon) is safe and actually works.
  for await (const c of cbp.coupons.list({ limit: 100 })) {
    if (c.metadata?.leaselyCbpWebsiteBundle !== "true" || !c.valid) continue;
    if (await cbpCouponZeroesBundle(cbp, c.id)) {
      _cbpWebsiteBundleCouponId = c.id;
      return c.id;
    }
    // Poisoned/broken — untag so we never rescan or reuse it.
    try {
      await cbp.coupons.update(c.id, { metadata: { leaselyCbpWebsiteBundle: "", poisoned: "auto-detected" } });
    } catch { /* best-effort */ }
  }
  // None usable — mint a fresh unrestricted 100%-off coupon and verify it works
  // before adopting it. If even a fresh coupon can't zero the bundle, something
  // deeper is wrong (dead link / missing price); untag it and fail loudly.
  const coupon = await cbp.coupons.create({
    percent_off: 100,
    duration: "once",
    name: "Keycove Pro — bundled website",
    metadata: { leaselyCbpWebsiteBundle: "true" },
  });
  if (!(await cbpCouponZeroesBundle(cbp, coupon.id))) {
    try { await cbp.coupons.update(coupon.id, { metadata: { leaselyCbpWebsiteBundle: "" } }); } catch { /* best-effort */ }
    return null;
  }
  _cbpWebsiteBundleCouponId = coupon.id;
  return coupon.id;
}

const complexesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const complexes = await getComplexesByUser(ctx.user.id);
    return Promise.all(complexes.map(async (c) => {
      const units = await getUnitsByComplex(c.id);
      return {
        ...c,
        units,
        availableUnits: units.filter(u => u.status === "available").length,
        occupiedUnits: units.filter(u => u.status === "occupied").length,
      };
    }));
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const complex = await getComplexById(input.id);
    if (!complex || complex.status !== "active") throw new TRPCError({ code: "NOT_FOUND" });
    const units = await getUnitsByComplex(input.id);
    return { ...complex, units };
  }),

  create: protectedProcedure.input(z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    neighborhood: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    totalUnits: z.number().min(1).default(1),
    yearBuilt: z.number().optional(),
    stories: z.number().optional(),
    hasPool: z.boolean().default(false),
    hasGym: z.boolean().default(false),
    hasElevator: z.boolean().default(false),
    hasDoorman: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasLaundry: z.boolean().default(false),
    petPolicy: z.enum(["allowed", "not_allowed", "case_by_case"]).default("case_by_case"),
    photos: z.array(z.string()).optional(),
    coverPhotoUrl: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    website: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const id = await createComplex({
      userId: ctx.user.id,
      name: input.name,
      description: input.description,
      address: input.address,
      city: input.city,
      state: input.state,
      zip: input.zip,
      neighborhood: input.neighborhood,
      latitude: input.latitude,
      longitude: input.longitude,
      totalUnits: input.totalUnits,
      yearBuilt: input.yearBuilt,
      stories: input.stories,
      hasPool: input.hasPool ? 1 : 0,
      hasGym: input.hasGym ? 1 : 0,
      hasElevator: input.hasElevator ? 1 : 0,
      hasDoorman: input.hasDoorman ? 1 : 0,
      hasParking: input.hasParking ? 1 : 0,
      hasLaundry: input.hasLaundry ? 1 : 0,
      petPolicy: input.petPolicy,
      photos: input.photos ? JSON.stringify(input.photos) : undefined,
      coverPhotoUrl: input.coverPhotoUrl,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      website: input.website,
      status: "active",
    });
    return { id };
  }),

  update: protectedProcedure.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    neighborhood: z.string().optional(),
    totalUnits: z.number().optional(),
    yearBuilt: z.number().optional(),
    stories: z.number().optional(),
    hasPool: z.boolean().optional(),
    hasGym: z.boolean().optional(),
    hasElevator: z.boolean().optional(),
    hasDoorman: z.boolean().optional(),
    hasParking: z.boolean().optional(),
    hasLaundry: z.boolean().optional(),
    petPolicy: z.enum(["allowed", "not_allowed", "case_by_case"]).optional(),
    photos: z.array(z.string()).optional(),
    coverPhotoUrl: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    website: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const updateData: Record<string, unknown> = { ...rest };
    if (rest.hasPool !== undefined) updateData.hasPool = rest.hasPool ? 1 : 0;
    if (rest.hasGym !== undefined) updateData.hasGym = rest.hasGym ? 1 : 0;
    if (rest.hasElevator !== undefined) updateData.hasElevator = rest.hasElevator ? 1 : 0;
    if (rest.hasDoorman !== undefined) updateData.hasDoorman = rest.hasDoorman ? 1 : 0;
    if (rest.hasParking !== undefined) updateData.hasParking = rest.hasParking ? 1 : 0;
    if (rest.hasLaundry !== undefined) updateData.hasLaundry = rest.hasLaundry ? 1 : 0;
    if (rest.photos !== undefined) updateData.photos = JSON.stringify(rest.photos);
    await updateComplex(id, ctx.user.id, updateData as any);
    return { success: true };
  }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await deleteComplex(input.id, ctx.user.id);
    return { success: true };
  }),

  listUnits: protectedProcedure.input(z.object({ complexId: z.number() })).query(async ({ ctx, input }) => {
    const complex = await getComplexById(input.complexId);
    if (!complex || complex.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
    return getUnitsByComplex(input.complexId);
  }),

  createUnit: protectedProcedure.input(z.object({
    complexId: z.number(),
    unitNumber: z.string().min(1).max(20),
    floor: z.number().optional(),
    monthlyRent: z.number().min(1),
    securityDeposit: z.number().optional(),
    bedrooms: z.string(),
    bathrooms: z.string(),
    squareFeet: z.number().optional(),
    availableDate: z.string().optional(),
    petFriendly: z.boolean().default(false),
    washerDryer: z.boolean().default(false),
    airConditioning: z.boolean().default(false),
    dishwasher: z.boolean().default(false),
    balcony: z.boolean().default(false),
    utilities: z.enum(["included", "not_included", "partial"]).default("not_included"),
    photos: z.array(z.string()).optional(),
    description: z.string().optional(),
    status: z.enum(["available", "occupied", "reserved", "maintenance"]).default("available"),
  })).mutation(async ({ ctx, input }) => {
    const complex = await getComplexById(input.complexId);
    if (!complex || complex.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
    const id = await createUnit({
      complexId: input.complexId,
      userId: ctx.user.id,
      unitNumber: input.unitNumber,
      floor: input.floor,
      monthlyRent: input.monthlyRent,
      securityDeposit: input.securityDeposit,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      squareFeet: input.squareFeet,
      availableDate: input.availableDate,
      petFriendly: input.petFriendly ? 1 : 0,
      washerDryer: input.washerDryer ? 1 : 0,
      airConditioning: input.airConditioning ? 1 : 0,
      dishwasher: input.dishwasher ? 1 : 0,
      balcony: input.balcony ? 1 : 0,
      utilities: input.utilities,
      photos: input.photos ? JSON.stringify(input.photos) : undefined,
      description: input.description,
      status: input.status,
    });
    return { id };
  }),

  updateUnit: protectedProcedure.input(z.object({
    id: z.number(),
    unitNumber: z.string().optional(),
    floor: z.number().optional(),
    monthlyRent: z.number().optional(),
    securityDeposit: z.number().optional(),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    squareFeet: z.number().optional(),
    availableDate: z.string().optional(),
    petFriendly: z.boolean().optional(),
    washerDryer: z.boolean().optional(),
    airConditioning: z.boolean().optional(),
    dishwasher: z.boolean().optional(),
    balcony: z.boolean().optional(),
    utilities: z.enum(["included", "not_included", "partial"]).optional(),
    photos: z.array(z.string()).optional(),
    description: z.string().optional(),
    status: z.enum(["available", "occupied", "reserved", "maintenance"]).optional(),
  })).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const updateData: Record<string, unknown> = { ...rest };
    if (rest.petFriendly !== undefined) updateData.petFriendly = rest.petFriendly ? 1 : 0;
    if (rest.washerDryer !== undefined) updateData.washerDryer = rest.washerDryer ? 1 : 0;
    if (rest.airConditioning !== undefined) updateData.airConditioning = rest.airConditioning ? 1 : 0;
    if (rest.dishwasher !== undefined) updateData.dishwasher = rest.dishwasher ? 1 : 0;
    if (rest.balcony !== undefined) updateData.balcony = rest.balcony ? 1 : 0;
    if (rest.photos !== undefined) updateData.photos = JSON.stringify(rest.photos);
    await updateUnit(id, ctx.user.id, updateData as any);
    return { success: true };
  }),

  deleteUnit: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await deleteUnit(input.id, ctx.user.id);
    return { success: true };
  }),

  publishUnit: protectedProcedure.input(z.object({ unitId: z.number() })).mutation(async ({ ctx, input }) => {
    const listingId = await publishUnitToMarketplace(input.unitId, ctx.user.id);
    return { listingId };
  }),
});

// ─── iStay™ Router ────────────────────────────────────────────────────────────

const istayRouter = router({
  getListings: publicProcedure.input(z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    guests: z.number().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    propertyType: z.string().optional(),
    petsAllowed: z.boolean().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  })).query(async ({ input }) => getIstayListings(input)),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const listing = await getIstayListingById(input.id);
    if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
    const reviews = await getIstayReviews(input.id);
    return { ...listing, reviews };
  }),

  getMyListings: protectedProcedure.query(async ({ ctx }) => getIstayListingsByUser(ctx.user.id)),

  create: protectedProcedure.input(z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    propertyType: z.enum(["entire_home","private_room","shared_room","hotel_room","apartment","condo","villa","cabin","cottage","loft","studio","penthouse","townhouse","other"]).default("entire_home"),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().default("United States"),
    neighborhood: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    pricePerNight: z.number().min(1),
    cleaningFee: z.number().default(0),
    weeklyDiscount: z.number().default(0),
    monthlyDiscount: z.number().default(0),
    maxGuests: z.number().min(1).default(1),
    bedrooms: z.number().min(0).default(1),
    beds: z.number().min(1).default(1),
    bathrooms: z.string().default("1"),
    minNights: z.number().min(1).default(1),
    maxNights: z.number().optional(),
    checkInTime: z.string().default("15:00"),
    checkOutTime: z.string().default("11:00"),
    amenities: z.array(z.string()).optional(),
    smokingAllowed: z.boolean().default(false),
    petsAllowed: z.boolean().default(false),
    partiesAllowed: z.boolean().default(false),
    childrenAllowed: z.boolean().default(true),
    houseRules: z.string().optional(),
    photos: z.array(z.string()).optional(),
    coverPhotoUrl: z.string().optional(),
    hostName: z.string().optional(),
    hostPhotoUrl: z.string().optional(),
    hostBio: z.string().optional(),
    cancellationPolicy: z.enum(["flexible","moderate","strict","super_strict"]).default("moderate"),
    instantBook: z.boolean().default(true),
  })).mutation(async ({ ctx, input }) => {
    const id = await createIstayListing({
      userId: ctx.user.id,
      title: input.title,
      description: input.description,
      propertyType: input.propertyType,
      address: input.address,
      city: input.city,
      state: input.state,
      zip: input.zip,
      country: input.country,
      neighborhood: input.neighborhood,
      latitude: input.latitude,
      longitude: input.longitude,
      pricePerNight: input.pricePerNight,
      cleaningFee: input.cleaningFee,
      weeklyDiscount: input.weeklyDiscount,
      monthlyDiscount: input.monthlyDiscount,
      maxGuests: input.maxGuests,
      bedrooms: input.bedrooms,
      beds: input.beds,
      bathrooms: input.bathrooms,
      minNights: input.minNights,
      maxNights: input.maxNights,
      checkInTime: input.checkInTime,
      checkOutTime: input.checkOutTime,
      amenities: input.amenities ? JSON.stringify(input.amenities) : undefined,
      smokingAllowed: input.smokingAllowed ? 1 : 0,
      petsAllowed: input.petsAllowed ? 1 : 0,
      partiesAllowed: input.partiesAllowed ? 1 : 0,
      childrenAllowed: input.childrenAllowed ? 1 : 0,
      houseRules: input.houseRules,
      photos: input.photos ? JSON.stringify(input.photos) : undefined,
      coverPhotoUrl: input.coverPhotoUrl,
      hostName: input.hostName ?? ctx.user.name ?? undefined,
      hostPhotoUrl: input.hostPhotoUrl,
      hostBio: input.hostBio,
      cancellationPolicy: input.cancellationPolicy,
      instantBook: input.instantBook ? 1 : 0,
      status: "active",
    });
    return { id };
  }),

  update: protectedProcedure.input(z.object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    pricePerNight: z.number().optional(),
    cleaningFee: z.number().optional(),
    maxGuests: z.number().optional(),
    minNights: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    photos: z.array(z.string()).optional(),
    coverPhotoUrl: z.string().optional(),
    status: z.enum(["active","inactive"]).optional(),
    petsAllowed: z.boolean().optional(),
    smokingAllowed: z.boolean().optional(),
    houseRules: z.string().optional(),
    cancellationPolicy: z.enum(["flexible","moderate","strict","super_strict"]).optional(),
  })).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const updateData: Record<string, unknown> = { ...rest };
    if (rest.petsAllowed !== undefined) updateData.petsAllowed = rest.petsAllowed ? 1 : 0;
    if (rest.smokingAllowed !== undefined) updateData.smokingAllowed = rest.smokingAllowed ? 1 : 0;
    if (rest.amenities !== undefined) updateData.amenities = JSON.stringify(rest.amenities);
    if (rest.photos !== undefined) updateData.photos = JSON.stringify(rest.photos);
    await updateIstayListing(id, ctx.user.id, updateData as any);
    return { success: true };
  }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await deleteIstayListing(input.id, ctx.user.id);
    return { success: true };
  }),

  save: protectedProcedure.input(z.object({ listingId: z.number() })).mutation(async ({ ctx, input }) => {
    await saveIstayListing(input.listingId, ctx.user.id);
    return { saved: true };
  }),

  unsave: protectedProcedure.input(z.object({ listingId: z.number() })).mutation(async ({ ctx, input }) => {
    await unsaveIstayListing(input.listingId, ctx.user.id);
    return { saved: false };
  }),

  getSaved: protectedProcedure.query(async ({ ctx }) => getSavedIstayListings(ctx.user.id)),

  getReviews: publicProcedure.input(z.object({ listingId: z.number() })).query(async ({ input }) => getIstayReviews(input.listingId)),

  createReview: protectedProcedure.input(z.object({
    listingId: z.number(),
    bookingId: z.number(),
    overallRating: z.number().min(1).max(5),
    cleanlinessRating: z.number().min(1).max(5).optional(),
    accuracyRating: z.number().min(1).max(5).optional(),
    communicationRating: z.number().min(1).max(5).optional(),
    locationRating: z.number().min(1).max(5).optional(),
    valueRating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const id = await createIstayReview({
      ...input,
      reviewerUserId: ctx.user.id,
      reviewerName: ctx.user.name ?? "Guest",
    });
    return { id };
  }),

  getMyBookings: protectedProcedure.query(async ({ ctx }) => getIstayBookingsByGuest(ctx.user.id)),
  getHostBookings: protectedProcedure.query(async ({ ctx }) => getIstayBookingsByHost(ctx.user.id)),

  book: protectedProcedure.input(z.object({
    listingId: z.number(),
    checkIn: z.string(),
    checkOut: z.string(),
    nights: z.number().min(1),
    guestCount: z.number().min(1),
    specialRequests: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const listing = await getIstayListingById(input.listingId);
    if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
    const subtotal = listing.pricePerNight * input.nights;
    const cleaningFee = listing.cleaningFee ?? 0;
    const serviceFee = Math.round(subtotal * 0.12); // 12% platform fee
    const totalAmount = subtotal + cleaningFee + serviceFee;
    const id = await createIstayBooking({
      listingId: input.listingId,
      hostUserId: listing.userId,
      guestUserId: ctx.user.id,
      guestName: ctx.user.name ?? "Guest",
      guestEmail: ctx.user.email ?? "",
      guestCount: input.guestCount,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights: input.nights,
      pricePerNight: listing.pricePerNight,
      subtotal,
      cleaningFee,
      serviceFee,
      totalAmount,
      specialRequests: input.specialRequests,
      status: "confirmed",
    });
    return { id, totalAmount };
  }),
});


import { leasesRouter, adminLeaseTemplatesRouter } from "./leases/router";
import { createLeaseDocument, getLatestTemplateVersionForState, logLeaseAudit, getTemplateVersionById, listLeaseDocumentsByAgreement, updateLeaseDocument } from "./leases/db-helpers";
import { renderTemplate } from "./leases/render";

export const appRouter = router({
  system: systemRouter,
  // Lease document + template system (Phase 2). Distinct from the existing
  // `leases` router below, which handles the lease_agreements status row.
  leaseDocs: leasesRouter,
  adminLeaseTemplates: adminLeaseTemplatesRouter,

  auth: router({
    me: publicProcedure.query(async opts => {
      if (!opts.ctx.user) return null;
      // Attach subscription info to me response
      const sub = await getUserSubscription(opts.ctx.user.id);
      // Admins are always treated as Pro — independent of payment status.
      const isAdmin = opts.ctx.user.role === "admin";
      return {
        ...opts.ctx.user,
        tier: isAdmin ? "paid" : (sub?.tier ?? "free"),
        subStatus: isAdmin ? "active" : (sub?.status ?? null),
        brandName: sub?.brandName ?? null,
        brandLogoUrl: sub?.brandLogoUrl ?? null,
        brandColor: sub?.brandColor ?? null,
        portalSubdomain: sub?.portalSubdomain ?? null,
        customDomain: (sub as any)?.customDomain ?? null,
      };
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      // Server-side session revocation: bump tokenVersion so the JWT's tv claim
      // no longer matches and authenticateRequest will reject it.
      if (ctx.user) {
        try {
          await bumpTokenVersion(ctx.user.id);
        } catch (err) {
          console.warn("[Auth] bumpTokenVersion failed on logout:", err);
        }
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      await deleteUserById(ctx.user.id);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Pro Redemption Codes (user-facing) ──────────────────────────────────

  proCode: router({
    getMine: protectedProcedure.query(async ({ ctx }) => {
      // Auto-provision on first access so PortalSetup never stalls on an empty row.
      return getOrCreateProCode(ctx.user.id);
    }),

    /**
     * The member's CBP partner discount code for their free website + domain.
     * Idempotently generates + stores the code and (re)delivers it to CBP's
     * /api/partner-codes until acked — so existing Pro members are backfilled
     * the first time they open the portal, and new ones are covered by the
     * provisioning webhook. Paid-only.
     */
    getCbpPartnerCode: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const { ensureCbpPartnerCode } = await import("./_core/cbpPartnerCodes");
      return ensureCbpPartnerCode(ctx.user.id, (ctx.user as any).email ?? null);
    }),

    /**
     * Mark the current user's Pro code as redeemed. Called when the user
     * returns from CBP's Stripe checkout with ?cbpRedeemed=1 so the portal
     * setup wizard can auto-advance to "Go Live" without manual click.
     */
    markMineRedeemed: protectedProcedure.mutation(async ({ ctx }) => {
      const existing = await getOrCreateProCode(ctx.user.id);
      if (existing.status === "redeemed") return existing;
      await redeemProCode(existing.code);
      return getOrCreateProCode(ctx.user.id);
    }),

    /**
     * Mint (or return existing) per-user 100%-off promotion code that
     * redeems CBP's website-bundle Payment Link as the bundled perk paid
     * for by Keycove's $75 setup fee. Idempotent: re-clicking Redeem
     * returns the same code so we don't pile up unused promo codes.
     */
    issueCbpWebsiteCoupon: protectedProcedure.mutation(async ({ ctx }) => {
      const cbp = getCbpStripe();
      if (!cbp) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "CBP Stripe not configured" });
      }
      const couponId = await getOrCreateCbpWebsiteBundleCoupon(cbp);
      if (!couponId) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't create a working website coupon — the CBP bundle link/price may be unavailable." });
      }
      // Idempotency via deterministic code: the userId-derived code lets us
      // look it up directly without a search index, so re-clicking Redeem
      // never mints a duplicate. BUT only reuse a code that's still USABLE —
      // reusing an expired / fully-redeemed / archived code would prefill it
      // into CBP checkout where Stripe rejects it as "code is invalid",
      // permanently trapping any user whose 30-day code lapsed unredeemed.
      const baseCode = `LEASELY-USER${ctx.user.id}`;
      const nowSec = Math.floor(Date.now() / 1000);
      const isLive = (p: any) =>
        p.active &&
        (p.max_redemptions == null || p.times_redeemed < p.max_redemptions) &&
        (!p.expires_at || p.expires_at > nowSec);
      const existing = await cbp.promotionCodes.list({ code: baseCode, limit: 100 });
      const live = existing.data.find(isLive);
      if (live) {
        return { code: live.code };
      }
      // The free website is one per Pro onboarding. If a prior code was already
      // redeemed, don't silently mint another (that would hand out unlimited
      // free $299 sites); tell them it's claimed. Only an expired/unredeemed
      // code gets re-issued below.
      const alreadyRedeemed = existing.data.some(p => (p.times_redeemed ?? 0) > 0);
      if (alreadyRedeemed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You've already claimed your free website. If you need another, contact support.",
        });
      }
      // Mint a fresh one. Stripe only requires the human code to be unique
      // among ACTIVE codes, so reusing baseCode after the old one is archived
      // is fine; if a same-string active code somehow lingers, fall back to a
      // unique suffix so we never hard-fail here.
      const mint = async (code: string) => cbp.promotionCodes.create({
        coupon: couponId,
        code,
        max_redemptions: 1,
        expires_at: nowSec + 60 * 60 * 24 * 30, // 30 days
        metadata: {
          leaselyUserId: String(ctx.user.id),
          leaselyEmail: (ctx.user as any).email ?? "",
        },
      } as any);
      let promo;
      try {
        promo = await mint(baseCode);
      } catch {
        promo = await mint(`${baseCode}-${randomBytes(2).toString("hex").toUpperCase()}`);
      }
      return { code: promo.code };
    }),
  }),

  // ─── Marketplace: Public ──────────────────────────────────────────────────

  marketplace: router({

    /** Browse listings with filters */
    getListings: publicProcedure
      .input(z.object({
        propertyType: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        minRent: z.number().optional(),
        maxRent: z.number().optional(),
        bedrooms: z.string().optional(),
        petFriendly: z.boolean().optional(),
        isCoLiving: z.boolean().optional(),
        sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        return getMarketplaceListings(input ?? {});
      }),

    /** Featured listings for homepage */
    getFeaturedListings: publicProcedure.query(async () => {
      return getFeaturedListings(6);
    }),

    /** Map pins — lightweight, lat/lng only */
    getMapListings: publicProcedure.query(async () => {
      return getMapListings();
    }),

    /** Get a single listing by ID (also increments view count) */
    getListingById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const listing = await getListingById(input.id);
        if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
        // Owners and admins can fetch any status (so they can edit inactive listings).
        // The public must only see active listings.
        const isOwner = ctx.user && (ctx.user as any).id === listing.userId;
        const isAdmin = ctx.user && (ctx.user as any).role === "admin";
        if (listing.status !== "active" && !isOwner && !isAdmin) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
        }
        // Increment view count async (fire and forget) — only for public viewers.
        if (!isOwner && !isAdmin) {
          const ip = (ctx.req as any).ip ?? (ctx.req as any).headers?.["x-forwarded-for"] ?? undefined;
          incrementViewCount(input.id, ip).catch(() => {});
        }
        return listing;
      }),

    /** Submit a contact inquiry */
    submitInquiry: publicProcedure
      .input(z.object({
        listingId: z.number(),
        senderName: z.string().min(1),
        senderEmail: z.string().email(),
        senderPhone: z.string().optional(),
        message: z.string().min(10),
        moveInDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const listing = await getListingById(input.listingId);
        if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
        await createInquiry({
          listingId: input.listingId,
          senderName: input.senderName,
          senderEmail: input.senderEmail,
          senderPhone: input.senderPhone ?? null,
          message: input.message,
          moveInDate: input.moveInDate ?? null,
        });
        // Email the listing owner
        const owner = await getUserById(listing.userId);
        if (owner?.email) {
          const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
          sendEmail({
            to: owner.email,
            subject: `New inquiry for "${listing.title}"`,
            html: newInquiryEmail({
              ownerName: owner.name ?? "there",
              listingTitle: listing.title ?? "your listing",
              senderName: input.senderName,
              senderEmail: input.senderEmail,
              senderPhone: input.senderPhone,
              message: input.message,
              moveInDate: input.moveInDate,
              dashboardUrl: `${APP_URL}/dashboard`,
            }),
            replyTo: input.senderEmail,
          }).catch(() => {});
        }
        // Internal notification (best-effort)
        notifyOwner({
          title: `New inquiry for "${listing.title}"`,
          content: `From: ${input.senderName} (${input.senderEmail})\n\n${input.message}`,
        }).catch(() => {});
        return { success: true };
      }),

    // ─── Marketplace: Protected ─────────────────────────────────────────────

    /** Get current user's subscription tier */
    getUserTier: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      return {
        tier: sub?.tier ?? "free",
        status: sub?.status ?? "active",
        currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      };
    }),

    /** Get all listings owned by the current user */
    getMyListings: protectedProcedure.query(async ({ ctx }) => {
      return getListingsByUserId(ctx.user.id);
    }),

    getMySubscription: protectedProcedure.query(async ({ ctx }) => {
      return getUserSubscription(ctx.user.id);
    }),

    /** Create a new listing (enforces tier limits) */
    createListing: protectedProcedure
      .input(z.object({
        title: z.string().min(5),
        description: z.string().optional(),
        propertyType: z.enum(["apartment", "house", "condo", "townhouse", "co_living", "studio", "room", "other"]),
        address: z.string().min(5),
        city: z.string().min(1),
        state: z.string().min(2),
        zip: z.string().optional().default(""),
        neighborhood: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        monthlyRent: z.number().min(1),
        securityDeposit: z.number().optional(),
        bedrooms: z.string(),
        bathrooms: z.string(),
        squareFeet: z.number().optional(),
        availableDate: z.string().optional(),
        petFriendly: z.boolean().optional(),
        isCoLiving: z.boolean().optional(),
        parkingAvailable: z.boolean().optional(),
        washerDryer: z.boolean().optional(),
        airConditioning: z.boolean().optional(),
        dishwasher: z.boolean().optional(),
        utilities: z.enum(["included", "not_included", "partial"]).optional(),
        photos: z.array(z.string()).max(10, "Maximum 10 photos per listing").optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        // When false, the property is added for management only (CRM, rent
        // collection, leases) and is NEVER shown on the public marketplace,
        // map, or search. Used for already-occupied units the owner isn't
        // advertising as available.
        listPublicly: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check tier limits — the free-tier "1 listing" cap only applies to
        // PUBLIC marketplace listings. Private management-only properties do
        // not consume a public slot.
        const sub = await getUserSubscription(ctx.user.id);
        const tier = sub?.tier ?? "free";
        const existingCount = await countUserListings(ctx.user.id);

        // Approved Creme Agents get UNLIMITED free public listings — they fill
        // the marketplace with inventory (Zillow-style growth), so we don't cap
        // them behind Pro. Everyone else on the free tier: 1 public listing.
        const agentProfile = await getCremeAgentByUserId(ctx.user.id);
        const isApprovedAgent = agentProfile?.status === "approved";

        if (input.listPublicly && tier === "free" && existingCount >= 1 && !isApprovedAgent) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "UPGRADE_REQUIRED",
          });
        }

        const id = await createListing({
          userId: ctx.user.id,
          title: input.title,
          description: input.description ?? null,
          propertyType: input.propertyType,
          address: input.address,
          city: input.city,
          state: input.state,
          zip: input.zip || "",
          neighborhood: input.neighborhood ?? null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          monthlyRent: input.monthlyRent,
          securityDeposit: input.securityDeposit ?? null,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          squareFeet: input.squareFeet ?? null,
          availableDate: input.availableDate ?? null,
          petFriendly: input.petFriendly ? 1 : 0,
          isCoLiving: input.isCoLiving ? 1 : 0,
          parkingAvailable: input.parkingAvailable ? 1 : 0,
          washerDryer: input.washerDryer ? 1 : 0,
          airConditioning: input.airConditioning ? 1 : 0,
          dishwasher: input.dishwasher ? 1 : 0,
          utilities: input.utilities ?? "not_included",
          photos: input.photos ? JSON.stringify(input.photos) : null,
          contactName: input.contactName ?? ctx.user.name ?? null,
          contactEmail: input.contactEmail ?? ctx.user.email ?? null,
          contactPhone: input.contactPhone ?? null,
          status: input.listPublicly ? "active" : "private",
          viewCount: 0,
          saveCount: 0,
        });

        // Auto-populate CRM when a new listing is created
        try {
          const crmTypeMap: Record<string, string> = {
            apartment: "apartment", house: "single_family", condo: "condo",
            townhouse: "townhouse", co_living: "other", studio: "apartment",
            room: "other", other: "other",
          };
          await createCrmProperty({
            userId: ctx.user.id,
            address: input.address,
            city: input.city,
            state: input.state,
            zip: input.zip,
            propertyType: (crmTypeMap[input.propertyType] ?? "other") as any,
            totalUnits: 1,
            listingId: id,
            status: "active",
          });
        } catch (e) {
          console.warn("[CRM] Auto-sync on createListing failed:", e);
        }

        return { id, success: true };
      }),

    /** Update a listing (owner only) */
    updateListing: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(5).optional(),
        description: z.string().optional(),
        monthlyRent: z.number().min(1).optional(),
        securityDeposit: z.number().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        photos: z.array(z.string()).max(10, "Maximum 10 photos per listing").optional(),
        petFriendly: z.boolean().optional(),
        isCoLiving: z.boolean().optional(),
        parkingAvailable: z.boolean().optional(),
        washerDryer: z.boolean().optional(),
        airConditioning: z.boolean().optional(),
        dishwasher: z.boolean().optional(),
        utilities: z.enum(["included", "not_included", "partial"]).optional(),
        availableDate: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        neighborhood: z.string().optional(),
        bedrooms: z.string().optional(),
        bathrooms: z.string().optional(),
        squareFeet: z.number().optional(),
        propertyType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = {};
        const boolField = (v: boolean | undefined) => v !== undefined ? (v ? 1 : 0) : undefined;
        const set = (k: string, v: unknown) => { if (v !== undefined) updateData[k] = v; };
        set("title", data.title);
        set("description", data.description);
        set("monthlyRent", data.monthlyRent);
        set("securityDeposit", data.securityDeposit);
        set("status", data.status);
        if (data.photos !== undefined) updateData.photos = JSON.stringify(data.photos);
        set("petFriendly", boolField(data.petFriendly));
        set("isCoLiving", boolField(data.isCoLiving));
        set("parkingAvailable", boolField(data.parkingAvailable));
        set("washerDryer", boolField(data.washerDryer));
        set("airConditioning", boolField(data.airConditioning));
        set("dishwasher", boolField(data.dishwasher));
        set("utilities", data.utilities);
        set("availableDate", data.availableDate);
        set("contactName", data.contactName);
        set("contactEmail", data.contactEmail);
        set("contactPhone", data.contactPhone);
        set("address", data.address);
        set("city", data.city);
        set("state", data.state);
        set("zip", data.zip);
        set("neighborhood", data.neighborhood);
        set("bedrooms", data.bedrooms);
        set("bathrooms", data.bathrooms);
        set("squareFeet", data.squareFeet);
        // propertyType is a strict enum in MySQL — an empty/invalid string (e.g.
        // the edit form submitted a blank select) fails the whole UPDATE. Only
        // write it when it's a valid value; otherwise leave the existing type.
        const VALID_LISTING_TYPES = ["apartment", "house", "condo", "townhouse", "co_living", "studio", "room", "other"];
        if (typeof data.propertyType === "string" && VALID_LISTING_TYPES.includes(data.propertyType)) {
          updateData.propertyType = data.propertyType;
        }
        // Admins can edit any listing; owners can only edit their own.
        const isAdmin = ctx.user.role === "admin";
        await updateListing(id, ctx.user.id, updateData as any, { isAdmin });
        return { success: true };
      }),

    /** Deactivate / delete a listing (owner or admin). Soft-delete via status=inactive. */
    deleteListing: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const isAdmin = ctx.user.role === "admin";
        await deleteListing(input.id, ctx.user.id, { isAdmin });
        return { success: true };
      }),

    /** Bulk import listings from CSV or other platforms */
    importListings: protectedProcedure
      .input(z.object({
        listings: z.array(z.object({
          title: z.string().min(3),
          address: z.string().min(1),
          city: z.string().min(1),
          state: z.string().min(2),
          zip: z.string().min(5),
          monthlyRent: z.number().min(1),
          bedrooms: z.string(),
          bathrooms: z.string(),
          propertyType: z.enum(["apartment", "house", "condo", "townhouse", "co_living", "studio", "room", "other"]).optional(),
          description: z.string().optional(),
          securityDeposit: z.number().optional(),
          squareFeet: z.number().optional(),
          availableDate: z.string().optional(),
          petFriendly: z.boolean().optional(),
          parkingAvailable: z.boolean().optional(),
          washerDryer: z.boolean().optional(),
          airConditioning: z.boolean().optional(),
          dishwasher: z.boolean().optional(),
          utilities: z.enum(["included", "not_included", "partial"]).optional(),
          contactName: z.string().optional(),
          contactPhone: z.string().optional(),
        })).min(1).max(200),
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getUserSubscription(ctx.user.id);
        const tier = sub?.tier ?? "free";
        const existingCount = await countUserListings(ctx.user.id);

        if (tier === "free" && existingCount >= 1) {
          throw new TRPCError({ code: "FORBIDDEN", message: "UPGRADE_REQUIRED" });
        }

        let imported = 0;
        const errors: string[] = [];

        for (const listing of input.listings) {
          try {
            await createListing({
              userId: ctx.user.id,
              title: listing.title,
              description: listing.description ?? null,
              propertyType: listing.propertyType ?? "apartment",
              address: listing.address,
              city: listing.city,
              state: listing.state,
              zip: listing.zip,
              monthlyRent: listing.monthlyRent,
              securityDeposit: listing.securityDeposit ?? null,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              squareFeet: listing.squareFeet ?? null,
              availableDate: listing.availableDate ?? null,
              petFriendly: listing.petFriendly ? 1 : 0,
              isCoLiving: 0,
              parkingAvailable: listing.parkingAvailable ? 1 : 0,
              washerDryer: listing.washerDryer ? 1 : 0,
              airConditioning: listing.airConditioning ? 1 : 0,
              dishwasher: listing.dishwasher ? 1 : 0,
              utilities: listing.utilities ?? "not_included",
              photos: null,
              contactName: listing.contactName ?? ctx.user.name ?? null,
              contactEmail: ctx.user.email ?? null,
              contactPhone: listing.contactPhone ?? null,
              neighborhood: null,
              latitude: null,
              longitude: null,
              status: "active",
              viewCount: 0,
              saveCount: 0,
            });
            imported++;
          } catch (err: any) {
            errors.push(`${listing.address}: ${err?.message ?? "Unknown error"}`);
          }
        }

        return { imported, errors };
      }),

    /** Save / favorite a listing */
    saveListing: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return saveListing(input.listingId, ctx.user.id);
      }),

    /** Unsave / unfavorite a listing */
    unsaveListing: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return unsaveListing(input.listingId, ctx.user.id);
      }),

    /** Check if a listing is saved by current user */
    isListingSaved: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .query(async ({ input, ctx }) => {
        return { saved: await isListingSaved(input.listingId, ctx.user.id) };
      }),

    /** Get all saved listings for current user */
    getSavedListings: protectedProcedure.query(async ({ ctx }) => {
      return getSavedListings(ctx.user.id);
    }),

    /** Get analytics for a listing (owner only) */
    getListingAnalytics: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .query(async ({ input, ctx }) => {
        const analytics = await getListingAnalytics(input.listingId, ctx.user.id);
        if (!analytics) throw new TRPCError({ code: "NOT_FOUND" });
        return analytics;
      }),

    /** Upload a photo to S3 and return URL */
    uploadPhoto: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileData: z.string(), // base64
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const ext = input.fileName.split(".").pop() ?? "jpg";
        const key = `listings/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.fileType);
        return { url };
      }),

    /** Create Stripe Checkout session for Pro subscription — redirects to /pro-setup on success */
    createProCheckout: protectedProcedure.input(z.object({
      referralCode: z.string().optional(),
    }).optional()).mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured. Please add STRIPE_SECRET_KEY in Settings → Payment." });
      const origin = (ctx.req as any).headers?.origin ?? APP_URL;
      // $75 one-time setup fee line item
      const setupLineItem = LEASELY_PRO_SETUP.priceId
        ? { price: LEASELY_PRO_SETUP.priceId, quantity: 1 }
        : { price_data: { currency: "usd", product_data: { name: LEASELY_PRO_SETUP.name, description: LEASELY_PRO_SETUP.description }, unit_amount: LEASELY_PRO_SETUP.setupPrice }, quantity: 1 };
      // $29/month recurring subscription line item
      const subscriptionLineItem = LEASELY_PRO.priceId
        ? { price: LEASELY_PRO.priceId, quantity: 1 }
        : { price_data: { currency: "usd", product_data: { name: LEASELY_PRO.name, description: LEASELY_PRO.description }, unit_amount: LEASELY_PRO.monthlyPrice, recurring: { interval: "month" as const } }, quantity: 1 };
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [setupLineItem, subscriptionLineItem],
        customer_email: ctx.user.email ?? undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: { user_id: ctx.user.id.toString(), customer_email: ctx.user.email ?? "", customer_name: ctx.user.name ?? "", referral_code: input?.referralCode ?? "" },
        allow_promotion_codes: true,
        // Day one the member pays only the $75 setup (which covers their first
        // month). The $29/mo recurring is deferred 30 days via a trial, so the
        // first $29 charge lands next month, then monthly after that.
        subscription_data: { trial_period_days: 30 },
        success_url: `${origin}/portal-setup?session_id={CHECKOUT_SESSION_ID}&pro_welcome=1`,
        cancel_url: `${origin}/pro`,
      });
      return { url: session.url };
    }),

    /** Simulate upgrade to paid tier (in production, wire to Stripe) */
    upgradeToPaid: protectedProcedure.mutation(async ({ ctx }) => {
      await upsertUserSubscription({
        userId: ctx.user.id,
        tier: "paid",
        status: "active",
      });
      // Also set accountType to landlord if not already
      await setAccountType(ctx.user.id, "landlord");
      return { success: true };
    }),

    /** Set account type during onboarding (renter vs landlord) */
    setAccountType: protectedProcedure
      .input(z.object({ accountType: z.enum(["renter", "landlord"]) }))
      .mutation(async ({ input, ctx }) => {
        await setAccountType(ctx.user.id, input.accountType);
        return { success: true };
      }),

    /** Update portal branding (paid landlords only) */
    updatePortalBranding: protectedProcedure
      .input(z.object({
        // The Dashboard "Save Branding" form sends every field even when blank,
        // so each schema must accept "" as a no-op (treated the same as undefined
        // by `updatePortalBranding`). `.optional()` alone accepts only `undefined`.
        brandName: z.union([z.literal(""), z.string().min(1)]).optional(),
        brandLogoUrl: z.union([z.literal(""), z.string().url()]).optional(),
        brandColor: z.string().optional(),
        portalSubdomain: z.union([
          z.literal(""),
          z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase letters, numbers, and hyphens only"),
        ]).optional(),
        customDomain: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getUserSubscription(ctx.user.id);
        if (!sub || sub.tier !== "paid") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Portal branding requires a Pro subscription" });
        }
        await updatePortalBranding(ctx.user.id, input);
        return { success: true };
      }),

    /** Save CBP brand brief — the spec the CBP team uses to build the website + logo */
    saveBrandBrief: protectedProcedure
      .input(z.object({
        tagline: z.string().max(200).optional(),
        industry: z.string().max(100).optional(),
        logoStyle: z.enum(["modern", "classic", "bold", "minimal", "playful", "professional"]).optional(),
        palette: z.array(z.string()).max(5).optional(),
        domainPrimary: z.string().max(100).optional(),
        domainBackup1: z.string().max(100).optional(),
        domainBackup2: z.string().max(100).optional(),
        notes: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getUserSubscription(ctx.user.id);
        if (!sub || sub.tier !== "paid") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Brand brief requires a Pro subscription" });
        }
        const briefJSON = JSON.stringify({ ...input, submittedAt: new Date().toISOString() });
        await updatePortalBranding(ctx.user.id, { brandBrief: briefJSON } as any);
        return { success: true };
      }),

    /** Get current user's brand brief (for prefilling form) */
    getBrandBrief: protectedProcedure
      .query(async ({ ctx }) => {
        const sub = await getUserSubscription(ctx.user.id);
        if (!sub?.brandBrief) return null;
        try { return JSON.parse(sub.brandBrief); } catch { return null; }
      }),

    /** Toggle round robin vendor dispatch */
    setRoundRobin: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getUserSubscription(ctx.user.id);
        if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
        await upsertUserSubscription({
          userId: ctx.user.id,
          roundRobinEnabled: input.enabled ? 1 : 0,
        } as any);
        return { success: true };
      }),

    /** Get saved searches for current renter */
    getSavedSearches: protectedProcedure.query(async ({ ctx }) => {
      return getSavedSearches(ctx.user.id);
    }),

    /** Save a search filter set */
    saveSearch: protectedProcedure
      .input(z.object({
        label: z.string().optional(),
        filters: z.object({
          city: z.string().optional(),
          state: z.string().optional(),
          propertyType: z.string().optional(),
          minRent: z.number().optional(),
          maxRent: z.number().optional(),
          bedrooms: z.string().optional(),
          petFriendly: z.boolean().optional(),
          isCoLiving: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createSavedSearch(ctx.user.id, input.label ?? null, JSON.stringify(input.filters));
        return { id, success: true };
      }),

    /** Delete a saved search */
    deleteSavedSearch: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteSavedSearch(input.id, ctx.user.id);
        return { success: true };
      }),

    // ─── Public Portal Page ───────────────────────────────────────────────────

    getPortalBySubdomain: publicProcedure
      .input(z.object({ subdomain: z.string() }))
      .query(async ({ input }) => {
        const portal = await getPortalBySubdomain(input.subdomain);
        if (!portal) throw new TRPCError({ code: "NOT_FOUND", message: "Portal not found" });
        return portal;
      }),

    // ─── QR Code ─────────────────────────────────────────────────────────────

    generateQRCode: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const listing = await getListingById(input.listingId);
        if (!listing || listing.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const url = `${APP_URL}/listing/${input.listingId}`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: { dark: "#1B2B5E", light: "#FFFFFF" },
        });
        return { qrDataUrl, url };
      }),

    // ─── Stripe Connect ───────────────────────────────────────────────────────

    createStripeConnectLink: protectedProcedure.mutation(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Stripe Connect requires a Pro subscription" });
      }
      const stripe = getStripe();
      if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured. Please add STRIPE_SECRET_KEY." });

      let accountId = sub.stripeConnectAccountId;

      // Verify any stored account ID still exists in the current Stripe mode (test vs live).
      // If it doesn't (common when switching test → live), null it out and recreate.
      if (accountId) {
        try {
          await stripe.accounts.retrieve(accountId);
        } catch (err: any) {
          if (isStripeAccountInaccessible(err)) {
            console.warn(`[Stripe Connect] Stale/inaccessible account ${accountId} for user ${ctx.user.id} — clearing and recreating.`);
            accountId = null;
            await setStripeConnectAccount(ctx.user.id, null, "not_connected");
          } else {
            throw err;
          }
        }
      }

      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          email: ctx.user.email ?? undefined,
          capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
          business_type: "individual",
          metadata: { leaselyUserId: String(ctx.user.id) },
        });
        accountId = account.id;
        await setStripeConnectAccount(ctx.user.id, accountId, "pending");
      }

      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${APP_URL}/dashboard?stripe=refresh`,
        return_url: `${APP_URL}/dashboard?stripe=success`,
        type: "account_onboarding",
      });
      return { url: link.url };
    }),

    getStripeConnectStatus: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") return { status: "not_connected" as const, accountId: null };
      if (!sub.stripeConnectAccountId) return { status: "not_connected" as const, accountId: null };

      const stripe = getStripe();
      if (!stripe) return { status: (sub.stripeConnectStatus ?? "not_connected") as "not_connected" | "pending" | "active", accountId: sub.stripeConnectAccountId };

      try {
        const account = await stripe.accounts.retrieve(sub.stripeConnectAccountId);
        const isActive = account.charges_enabled && account.payouts_enabled;
        const nextStatus = isActive ? "active" as const : "pending" as const;
        if (sub.stripeConnectStatus !== nextStatus) {
          await setStripeConnectAccount(ctx.user.id, sub.stripeConnectAccountId, nextStatus);
        }
        return {
          status: nextStatus,
          accountId: sub.stripeConnectAccountId,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        };
      } catch (err: any) {
        // Dead account (deleted, wrong platform key, or revoked access): clear it
        // so the UI shows "not connected" and the user can reconnect cleanly.
        if (isStripeAccountInaccessible(err)) {
          console.warn(`[Stripe Connect] Clearing inaccessible account ${sub.stripeConnectAccountId} for user ${ctx.user.id}.`);
          await setStripeConnectAccount(ctx.user.id, null, "not_connected");
          return { status: "not_connected" as const, accountId: null };
        }
        // Transient error: keep the stored status.
        return { status: (sub.stripeConnectStatus ?? "not_connected") as "not_connected" | "pending" | "active", accountId: sub.stripeConnectAccountId };
      }
    }),

    // ─── Tenant Rent Payments ─────────────────────────────────────────────────

    createRentPaymentSession: publicProcedure
      .input(z.object({
        listingId: z.number(),
        tenantName: z.string().min(1),
        tenantEmail: z.string().email(),
        amountDollars: z.number().min(1).max(50000),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const listing = await getListingById(input.listingId);
        if (!listing || listing.status !== "active") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
        }
        const sub = await getUserSubscription(listing.userId);
        if (!sub || !sub.stripeConnectAccountId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Landlord has not set up payments" });
        }
        const stripe = getStripe();
        if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });

        const amountCents = Math.round(input.amountDollars * 100);
        const desc = input.description ?? `Rent payment — ${listing.title}`;
        // Pro landlords: 0% platform fee. Free tier: 1% Keycove platform fee.
        const isProLandlord = sub.tier === "paid";
        const platformFeeCents = isProLandlord ? 0 : Math.round(amountCents * 0.01);

        const paymentId = await createPaymentRecord({
          listingId: input.listingId,
          landlordUserId: listing.userId,
          tenantName: input.tenantName,
          tenantEmail: input.tenantEmail,
          amountCents,
          description: desc,
          status: "pending",
        });

        const paymentIntentData: any = {
          transfer_data: { destination: sub.stripeConnectAccountId },
          metadata: { leaselyPaymentId: String(paymentId), listingId: String(input.listingId) },
        };
        if (platformFeeCents > 0) {
          paymentIntentData.application_fee_amount = platformFeeCents;
        }

        // Only enable ACH on amounts >= $100 — Stripe ACH is best for
        // larger payments (deposits, first month) where the $5 cap beats
        // 2.9% on card. For small holding fees / app fees, card-only is
        // simpler and the absolute fee delta is trivial.
        const enableAch = amountCents >= 10000;
        const session = await stripe.checkout.sessions.create({
          payment_method_types: enableAch ? ["us_bank_account", "card"] : ["card"],
          ...(enableAch && {
            payment_method_options: {
              us_bank_account: {
                financial_connections: {
                  permissions: ["payment_method", "balances"],
                },
                verification_method: "automatic" as const,
              },
            },
          }),
          mode: "payment",
          customer_email: input.tenantEmail,
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: desc,
                description: `${listing.address}, ${listing.city}, ${listing.state}`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          }],
          payment_intent_data: paymentIntentData,
          success_url: `${APP_URL}/pay/${input.listingId}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL}/pay/${input.listingId}`,
          metadata: { leaselyPaymentId: String(paymentId) },
        });

        await updatePaymentStatus(paymentId, "pending", session.id, undefined);
        return { sessionUrl: session.url, paymentId };
      }),

    // ─── Private CRM Rent Collection (no public listing required) ─────────────
    // Display info for the private rent pay page, resolved from a signed token.
    getCrmRentInfo: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const decoded = verifyCrmRentToken(input.token);
        if (!decoded) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid payment link" });
        const tenant = await getCrmTenantById(decoded.ct);
        if (!tenant) throw new TRPCError({ code: "NOT_FOUND", message: "This payment link is no longer valid." });
        const property = await getCrmPropertyById(tenant.crmPropertyId, tenant.userId);
        const sub = await getUserSubscription(tenant.userId);
        const bankReady = !!sub?.stripeConnectAccountId && sub.stripeConnectStatus === "active";
        return {
          tenantName: `${tenant.firstName} ${tenant.lastName}`.trim(),
          tenantEmail: tenant.email ?? "",
          monthlyRent: tenant.monthlyRent ?? null,
          bankReady,
          propertyAddress: property
            ? [property.address, property.city, property.state].filter(Boolean).join(", ")
            : "",
        };
      }),

    // Create a Stripe Checkout session for rent on a CRM property. Funds route
    // via destination charge to the landlord's connected bank. No listing.
    createCrmRentPaymentSession: publicProcedure
      .input(z.object({
        token: z.string(),
        amountDollars: z.number().min(1).max(50000),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const decoded = verifyCrmRentToken(input.token);
        if (!decoded) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid payment link" });
        const tenant = await getCrmTenantById(decoded.ct);
        if (!tenant) throw new TRPCError({ code: "NOT_FOUND", message: "This payment link is no longer valid." });
        const sub = await getUserSubscription(tenant.userId);
        if (!sub || !sub.stripeConnectAccountId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Landlord has not set up payments" });
        }
        const stripe = getStripe();
        if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });

        const property = await getCrmPropertyById(tenant.crmPropertyId, tenant.userId);
        const amountCents = Math.round(input.amountDollars * 100);
        const desc = input.description ?? `Rent payment — ${property?.address ?? "your rental"}`;
        // Pro landlords: 0% platform fee. Free tier: 1% Keycove platform fee.
        const isProLandlord = sub.tier === "paid";
        const platformFeeCents = isProLandlord ? 0 : Math.round(amountCents * 0.01);

        const paymentId = await createPaymentRecord({
          crmPropertyId: tenant.crmPropertyId,
          crmTenantId: tenant.id,
          landlordUserId: tenant.userId,
          tenantName: `${tenant.firstName} ${tenant.lastName}`.trim(),
          tenantEmail: tenant.email ?? "",
          amountCents,
          description: desc,
          status: "pending",
        });

        const paymentIntentData: any = {
          transfer_data: { destination: sub.stripeConnectAccountId },
          metadata: { leaselyPaymentId: String(paymentId), crmTenantId: String(tenant.id) },
        };
        if (platformFeeCents > 0) {
          paymentIntentData.application_fee_amount = platformFeeCents;
        }

        const enableAch = amountCents >= 10000;
        const session = await stripe.checkout.sessions.create({
          payment_method_types: enableAch ? ["us_bank_account", "card"] : ["card"],
          ...(enableAch && {
            payment_method_options: {
              us_bank_account: {
                financial_connections: { permissions: ["payment_method", "balances"] },
                verification_method: "automatic" as const,
              },
            },
          }),
          mode: "payment",
          ...(tenant.email ? { customer_email: tenant.email } : {}),
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: desc,
                ...(property ? { description: [property.address, property.city, property.state].filter(Boolean).join(", ") } : {}),
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          }],
          payment_intent_data: paymentIntentData,
          success_url: `${APP_URL}/pay/rent/${input.token}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL}/pay/rent/${input.token}`,
          metadata: { leaselyPaymentId: String(paymentId) },
        });

        await updatePaymentStatus(paymentId, "pending", session.id, undefined);
        return { sessionUrl: session.url, paymentId };
      }),

     getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      return getPaymentsByLandlord(ctx.user.id);
    }),
    // ─── Instant Payout ───────────────────────────────────────────────────────
    requestInstantPayout: protectedProcedure
      .input(z.object({ amountCents: z.number().min(100).optional() }))
      .mutation(async ({ ctx, input }) => {
        const sub = await getUserSubscription(ctx.user.id);
        if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Pro subscription required" });
        if (!sub.stripeConnectAccountId) throw new TRPCError({ code: "BAD_REQUEST", message: "Stripe Connect not set up. Please connect your bank account first." });
        const stripe = getStripe();
        if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
        // Pro instant payout fee: $1.00 flat (Keycove fee — Pro subscriber benefit)
        const INSTANT_PAYOUT_FLAT_FEE = 100; // $1.00 in cents
        try {
          const balance = await stripe.balance.retrieve({ stripeAccount: sub.stripeConnectAccountId });
          const available = balance.available.find(b => b.currency === "usd");
          if (!available || available.amount < 200) throw new TRPCError({ code: "BAD_REQUEST", message: "No available balance to pay out" });
          const grossAmount = input.amountCents ?? available.amount;
          if (grossAmount > available.amount) throw new TRPCError({ code: "BAD_REQUEST", message: "Requested amount exceeds available balance" });
          // Deduct $1.00 flat Keycove instant payout fee (Pro subscriber benefit)
          const leaselyFee = INSTANT_PAYOUT_FLAT_FEE;
          const netPayoutAmount = grossAmount - leaselyFee;
          if (netPayoutAmount < 100) throw new TRPCError({ code: "BAD_REQUEST", message: "Amount too small after $1.00 instant payout fee" });

          // Collect the $1 fee as real Keycove revenue: transfer it from the
          // landlord's connected account to the Keycove platform account BEFORE
          // paying out the rest. Non-blocking — if the transfer fails we still
          // pay the landlord (the $1 just stays in their balance that time) and
          // log it, so a fee hiccup never holds up someone's money.
          let feeCollected = false;
          const platformAccountId = process.env.STRIPE_PLATFORM_ACCOUNT_ID;
          if (platformAccountId) {
            try {
              await stripe.transfers.create({
                amount: leaselyFee,
                currency: "usd",
                destination: platformAccountId,
                description: `Keycove instant payout fee — user ${ctx.user.id}`,
              }, { stripeAccount: sub.stripeConnectAccountId });
              feeCollected = true;
            } catch (feeErr: any) {
              console.warn("[instantPayout] $1 Keycove fee transfer failed (paying out anyway):", feeErr?.message ?? feeErr);
            }
          } else {
            console.warn("[instantPayout] STRIPE_PLATFORM_ACCOUNT_ID unset — $1 fee not collected");
          }

          const payout = await stripe.payouts.create({
            amount: netPayoutAmount, currency: "usd", method: "instant",
            statement_descriptor: "KEYCOVE PAYOUT",
          }, { stripeAccount: sub.stripeConnectAccountId });
          return { success: true, payoutId: payout.id, amountCents: payout.amount, grossAmountCents: grossAmount, leaselyFee, feeCollected, feeRate: "$1.00 flat", arrivalDate: payout.arrival_date, status: payout.status };
        } catch (err: any) {
          if (err.code === "TRPC_ERROR" || err instanceof TRPCError) throw err;
          // Dead account: clear it and tell the user to reconnect (never leak the raw Stripe key/acct error).
          if (isStripeAccountInaccessible(err)) {
            await setStripeConnectAccount(ctx.user.id, null, "not_connected");
            throw new TRPCError({ code: "BAD_REQUEST", message: "Your bank connection is no longer valid. Please reconnect your bank account to receive payouts." });
          }
          if (err.raw?.code === "instant_payouts_unsupported") {
            const balance = await stripe.balance.retrieve({ stripeAccount: sub.stripeConnectAccountId });
            const available = balance.available.find(b => b.currency === "usd");
            const payoutAmount = input.amountCents ?? available?.amount ?? 0;
            const payout = await stripe.payouts.create({ amount: payoutAmount, currency: "usd", method: "standard" }, { stripeAccount: sub.stripeConnectAccountId });
            return { success: true, payoutId: payout.id, amountCents: payout.amount, arrivalDate: payout.arrival_date, status: payout.status, note: "Standard payout initiated (1-2 business days)" };
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err.message ?? "Payout failed" });
        }
      }),
    getAvailableBalance: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      if (!sub.stripeConnectAccountId) return { availableCents: 0, pendingCents: 0 };
      const stripe = getStripe();
      if (!stripe) return { availableCents: 0, pendingCents: 0 };
      try {
        const balance = await stripe.balance.retrieve({ stripeAccount: sub.stripeConnectAccountId });
        const available = balance.available.find(b => b.currency === "usd");
        const pending = balance.pending.find(b => b.currency === "usd");
        return { availableCents: available?.amount ?? 0, pendingCents: pending?.amount ?? 0 };
      } catch { return { availableCents: 0, pendingCents: 0 }; }
    }),

    /**
     * Masked details of the bank account the landlord connected via Stripe
     * Express onboarding. Bank numbers live at Stripe (never in Keycove's DB);
     * this returns only display-safe fields (bank name + last4) so the landlord
     * can confirm which account their rent is deposited into.
     */
    getBankAccount: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid" || !sub.stripeConnectAccountId) return { connected: false as const };
      const stripe = getStripe();
      if (!stripe) return { connected: false as const };
      try {
        const account = await stripe.accounts.retrieve(sub.stripeConnectAccountId);
        const ext = (account.external_accounts?.data ?? []).find((e: any) => e.object === "bank_account") as any;
        const schedule = (account.settings as any)?.payouts?.schedule;
        return {
          connected: true as const,
          accountId: sub.stripeConnectAccountId,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          bank: ext ? {
            bankName: ext.bank_name ?? null,
            last4: ext.last4 ?? null,
            routingLast4: (ext.routing_number ?? "").slice(-4) || null,
            currency: (ext.currency ?? "usd").toUpperCase(),
          } : null,
          payoutInterval: schedule?.interval ?? "standard",
        };
      } catch (err: any) {
        if (isStripeAccountInaccessible(err)) {
          await setStripeConnectAccount(ctx.user.id, null, "not_connected");
        }
        return { connected: false as const };
      }
    }),

    /**
     * One-time login link to the landlord's Stripe Express dashboard, where
     * they can view/update the bank account, see the full payout history, and
     * manage tax details. This is the canonical place bank info is edited.
     */
    createExpressLoginLink: protectedProcedure.mutation(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || !sub.stripeConnectAccountId) throw new TRPCError({ code: "BAD_REQUEST", message: "Connect your bank account first." });
      const stripe = getStripe();
      if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
      const link = await stripe.accounts.createLoginLink(sub.stripeConnectAccountId);
      return { url: link.url };
    }),
  }),

  // ── VENDORS ──────────────────────────────────────────────────────────────
  vendors: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      return getVendors(ctx.user.id);
    }),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      trade: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      serviceAreas: z.string().optional(), // JSON
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const id = await createVendor({ ...input, userId: ctx.user.id, isActive: 1 });
      return { id };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      trade: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      serviceAreas: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateVendor(id, ctx.user.id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteVendor(input.id, ctx.user.id);
        return { success: true };
      }),

    /** Store a contractor's W-9 so the landlord can issue them a 1099-NEC. */
    saveW9: protectedProcedure.input(z.object({
      id: z.number(),
      legalName: z.string().min(1),
      businessName: z.string().optional(),
      taxClassification: z.enum(["individual","sole_proprietor","c_corp","s_corp","partnership","trust","llc","other"]),
      tinType: z.enum(["ssn","ein"]),
      tin: z.string().min(4),          // full SSN/EIN (digits) — stored encoded, only last 4 displayed
      w9Address: z.string().min(1),
      w9City: z.string().min(1),
      w9State: z.string().length(2),
      w9Zip: z.string().min(3),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const tinClean = input.tin.replace(/\D/g, "");
      await updateVendor(input.id, ctx.user.id, {
        legalName: input.legalName,
        businessName: input.businessName || null,
        taxClassification: input.taxClassification,
        tinType: input.tinType,
        tinLast4: tinClean.slice(-4),
        tinEncrypted: Buffer.from(tinClean).toString("base64"),
        w9Address: input.w9Address, w9City: input.w9City, w9State: input.w9State, w9Zip: input.w9Zip,
        w9CertifiedAt: new Date(),
      } as any);
      return { success: true };
    }),

    /**
     * Year-end 1099-NEC summary. For each vendor, sums expense entries tagged
     * to them for the tax year, flags those over the IRS threshold (1099
     * required), and reports whether a W-9 is on file. Drives the Contractor
     * 1099 Center. The One Big Beautiful Bill Act raised the 1099-NEC/MISC
     * threshold from $600 to $2,000 for payments made in 2026 and later.
     */
    tax1099Summary: protectedProcedure.input(z.object({
      year: z.number().int().min(2020).max(2100),
    })).query(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const thresholdCents = input.year >= 2026 ? 200000 : 60000; // OBBBA: $600→$2,000 for 2026+
      const db = await getDb();
      if (!db) return [];
      const { and, eq, like, sql } = await import("drizzle-orm");
      const { accountingEntries } = await import("../drizzle/schema");
      const vendorList = await getVendors(ctx.user.id);
      const out = [];
      for (const v of vendorList as any[]) {
        const [row] = await db.select({ total: sql<number>`coalesce(sum(${accountingEntries.amount}),0)` })
          .from(accountingEntries)
          .where(and(
            eq(accountingEntries.userId, ctx.user.id),
            eq(accountingEntries.type, "expense"),
            eq(accountingEntries.vendorId, v.id),
            like(accountingEntries.date, `${input.year}-%`),
          ));
        const totalPaidCents = Number((row as any)?.total ?? 0);
        out.push({
          vendorId: v.id, name: v.name, email: v.email, trade: v.trade,
          legalName: v.legalName, businessName: v.businessName,
          taxClassification: v.taxClassification, tinType: v.tinType, tinLast4: v.tinLast4,
          w9Address: v.w9Address, w9City: v.w9City, w9State: v.w9State, w9Zip: v.w9Zip,
          hasW9: !!v.w9CertifiedAt,
          totalPaidCents,
          requires1099: totalPaidCents >= thresholdCents,
          thresholdCents,
        });
      }
      out.sort((a, b) => (Number(b.requires1099) - Number(a.requires1099)) || (b.totalPaidCents - a.totalPaidCents));
      return out;
    }),
  }),

  // ── WORK ORDERS ──────────────────────────────────────────────────────────
  workOrders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      return getWorkOrders(ctx.user.id);
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "emergency"]).default("medium"),
      propertyAddress: z.string().optional(),
      crmPropertyId: z.number().optional(),
      listingId: z.number().optional(),
      tenantName: z.string().optional(),
      tenantEmail: z.string().optional(),
      tenantPhone: z.string().optional(),
      vendorId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      // Use AI to summarize and categorize the work order
      let aiSummary = input.description ?? "";
      try {
        const { createOpenAI } = await import("@ai-sdk/openai");
        const { generateText } = await import("ai");
        const openai = createOpenAI({ baseURL: (process.env.BUILT_IN_FORGE_API_URL ?? "https://api.openai.com") + "/v1", apiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.OPENAI_API_KEY ?? "" });
        const result = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: `You are a property maintenance assistant. Summarize this work order in 1-2 sentences and confirm receipt. Work order: "${input.title} - ${input.description ?? ""}". Reply with a brief professional confirmation.`,
          maxOutputTokens: 100,
        });
        aiSummary = result.text;
      } catch { /* AI optional */ }

      // Find vendor for this work order if vendorId provided
      let vendorName: string | undefined;
      let vendorEmail: string | undefined;
      let vendorPhone: string | undefined;
      if (input.vendorId) {
        const allVendors = await getVendors(ctx.user.id);
        const vendor = allVendors.find(v => v.id === input.vendorId);
        if (vendor) {
          vendorName = vendor.name;
          vendorEmail = vendor.email ?? undefined;
          vendorPhone = vendor.phone ?? undefined;
        }
      }

      const id = await createWorkOrder({
        ...input,
        userId: ctx.user.id,
        aiSummary,
        vendorName,
        vendorEmail,
        vendorPhone,
        category: (input.category as any) ?? "other",
        status: input.vendorId ? "dispatched" : "open",
        dispatchedAt: input.vendorId ? new Date() : undefined,
      });

      // Notify vendor by email if assigned
      if (vendorEmail) {
        const landlord = await getUserByOpenId(ctx.user.openId);
        sendEmail({
          to: vendorEmail,
          subject: `Work Order: ${input.title} — ${input.propertyAddress ?? "Property"}`,
          html: workOrderDispatchEmail({
            vendorName: vendorName ?? "Vendor",
            propertyAddress: input.propertyAddress ?? "N/A",
            issueTitle: input.title,
            description: input.description ?? "",
            priority: input.priority,
            landlordName: landlord?.name ?? undefined,
            landlordEmail: landlord?.email ?? undefined,
          }),
        }).catch(() => {});
      }

      return { id, aiSummary };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.string().optional(),
      estimatedCost: z.number().optional(),
      actualCost: z.number().optional(),
      notes: z.string().optional(),
      vendorId: z.number().optional(),
      vendorName: z.string().optional(),
      vendorEmail: z.string().optional(),
      vendorPhone: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, any> = { ...data };
      if (data.status === "dispatched") updateData.dispatchedAt = new Date();
      if (data.status === "vendor_confirmed") updateData.vendorConfirmedAt = new Date();
      if (data.status === "resolved") updateData.resolvedAt = new Date();
      await updateWorkOrder(id, ctx.user.id, updateData);
      return { success: true };
    }),
    // Research local handymen/contractors via Google Places when no vendor is on file
    findVendor: protectedProcedure.input(z.object({
      workOrderId: z.number(),
      trade: z.string(),
      city: z.string(),
      state: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      // ── Step 1: Google Places search for local contractors ──────────────────
      type FoundVendor = { name: string; phone: string; address: string; rating?: number; website?: string };
      const foundVendors: FoundVendor[] = [];
      const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (googleApiKey) {
        try {
          const query = encodeURIComponent(`${input.trade} contractor ${input.city} ${input.state}`);
          const placesRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${googleApiKey}`
          );
          const placesData = await placesRes.json() as { results?: Array<{ place_id: string; name: string; formatted_address?: string; rating?: number }> };
          const topPlaces = (placesData.results ?? []).slice(0, 4);
          for (const place of topPlaces) {
            try {
              const detailRes = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,formatted_address,rating,website&key=${googleApiKey}`
              );
              const detailData = await detailRes.json() as { result?: { name?: string; formatted_phone_number?: string; formatted_address?: string; rating?: number; website?: string } };
              const d = detailData.result ?? {};
              foundVendors.push({
                name: d.name ?? place.name,
                phone: d.formatted_phone_number ?? "",
                address: d.formatted_address ?? place.formatted_address ?? "",
                rating: d.rating ?? place.rating,
                website: d.website ?? "",
              });
            } catch { /* skip individual place detail failure */ }
          }
        } catch { /* Google Places unavailable — fall through */ }
      }

      // ── Step 2: AI drafts outreach email ────────────────────────────────────
      let outreachEmail = "";
      try {
        const { createOpenAI } = await import("@ai-sdk/openai");
        const { generateText } = await import("ai");
        const openai = createOpenAI({ baseURL: (process.env.BUILT_IN_FORGE_API_URL ?? "https://api.openai.com") + "/v1", apiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.OPENAI_API_KEY ?? "" });
        const vendorContext = foundVendors.length > 0
          ? `We found these local ${input.trade}s: ${foundVendors.map(v => v.name).join(", ")}. `
          : "";
        const result = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: `${vendorContext}Write a short, professional outreach email (under 120 words) from a property manager needing a ${input.trade} in ${input.city}, ${input.state}. Ask about availability and pricing. Subject line first, then body.`,
          maxOutputTokens: 250,
        });
        outreachEmail = result.text;
      } catch { outreachEmail = "AI unavailable — please compose email manually."; }

      // ── Step 3: Mark work order dispatched + notify landlord ────────────────
      const foundCount = foundVendors.length;
      await updateWorkOrder(input.workOrderId, ctx.user.id, {
        status: "dispatched",
        dispatchedAt: new Date(),
        notes: foundCount > 0
          ? `Found ${foundCount} local ${input.trade}(s) via Google: ${foundVendors.map(v => v.name).join(", ")}`
          : `AI outreach drafted for ${input.trade} in ${input.city}, ${input.state}`,
      });

      const landlordForOutreach = await getUserByOpenId(ctx.user.openId);
      if (landlordForOutreach?.email) {
        const vendorRows = foundVendors.length > 0
          ? `<h3 style="color:#1B2B5E;margin-top:20px">Local ${input.trade}s Found Near ${input.city}, ${input.state}</h3>
             <table style="width:100%;border-collapse:collapse;font-size:14px">
               <thead><tr style="background:#f3f4f6">
                 <th style="text-align:left;padding:8px;border:1px solid #e5e7eb">Business</th>
                 <th style="text-align:left;padding:8px;border:1px solid #e5e7eb">Phone</th>
                 <th style="text-align:left;padding:8px;border:1px solid #e5e7eb">Rating</th>
                 <th style="text-align:left;padding:8px;border:1px solid #e5e7eb">Address</th>
               </tr></thead>
               <tbody>${foundVendors.map(v => `
                 <tr>
                   <td style="padding:8px;border:1px solid #e5e7eb">${v.name}${v.website ? ` (<a href="${v.website}">website</a>)` : ""}</td>
                   <td style="padding:8px;border:1px solid #e5e7eb">${v.phone || "—"}</td>
                   <td style="padding:8px;border:1px solid #e5e7eb">${v.rating ? `⭐ ${v.rating}` : "—"}</td>
                   <td style="padding:8px;border:1px solid #e5e7eb;font-size:12px;color:#6b7280">${v.address}</td>
                 </tr>`).join("")}
               </tbody>
             </table>`
          : `<p style="color:#6b7280">No Google Places results — add your own vendors or use the outreach email below.</p>`;

        sendEmail({
          to: landlordForOutreach.email,
          subject: `[Keycove] ${foundCount > 0 ? `${foundCount} Local ${input.trade}s Found` : "Vendor Outreach Drafted"} — ${input.city}, ${input.state}`,
          html: `<div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Vendor Research Complete</h2>
            <p>Keycove searched for a <strong>${input.trade}</strong> near <strong>${input.city}, ${input.state}</strong>.</p>
            ${vendorRows}
            <h3 style="color:#1B2B5E;margin-top:24px">AI-Drafted Outreach Email</h3>
            <p style="color:#6b7280;font-size:13px">Copy and send this to any of the vendors above:</p>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:14px">${outreachEmail}</div>
            <p style="color:#9ca3af;font-size:11px;margin-top:16px">Powered by Keycove · Google Places</p>
          </div>`,
        }).catch(() => {});
      }

      return { outreachEmail, vendors: foundVendors };
    }),

    // ── Tenant submits a maintenance request (no Keycove login needed) ────────
    submitTenant: publicProcedure.input(z.object({
      tenantToken: z.string().min(1),
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(["plumbing","electrical","hvac","appliance","structural","pest_control","cleaning","landscaping","other"]).default("other"),
      priority: z.enum(["low","medium","high","emergency"]).default("medium"),
      photos: z.array(z.string().url()).optional(), // photo URLs from tenant
    })).mutation(async ({ input }) => {
      // Authenticate via tenant portal token
      const tenant = await getTenantByToken(input.tenantToken);
      if (!tenant || tenant.status !== "active") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired tenant session." });
      }

      // Get the landlord
      const landlord = await getUserById(tenant.landlordUserId);
      if (!landlord) throw new TRPCError({ code: "NOT_FOUND", message: "Landlord not found." });

      // Check landlord is Pro — work orders require Pro
      const sub = await getUserSubscription(tenant.landlordUserId);
      if (!sub || sub.tier !== "paid") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Landlord does not have an active Pro subscription." });
      }

      // Get property address from listing or lease
      let propertyAddress = "Your property";
      if (tenant.listingId) {
        const listing = await getListingById(tenant.listingId);
        if (listing) propertyAddress = `${listing.address ?? ""} ${listing.city ?? ""}, ${listing.state ?? ""}`.trim();
      }

      // AI summary (optional, fire-and-forget)
      let aiSummary = input.description ?? "";
      try {
        const { createOpenAI } = await import("@ai-sdk/openai");
        const { generateText } = await import("ai");
        const openai = createOpenAI({ baseURL: (process.env.BUILT_IN_FORGE_API_URL ?? "https://api.openai.com") + "/v1", apiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.OPENAI_API_KEY ?? "" });
        const result = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: `Summarize this maintenance request in 1-2 sentences: "${input.title} - ${input.description ?? ""}". Be brief and professional.`,
          maxOutputTokens: 80,
        });
        aiSummary = result.text;
      } catch { /* AI optional */ }

      // Create the work order under the landlord's account
      const workOrderId = await createWorkOrder({
        userId: tenant.landlordUserId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        propertyAddress,
        tenantName: tenant.name,
        tenantEmail: tenant.email,
        tenantPhone: tenant.phone ?? undefined,
        aiSummary,
        status: "open",
        photos: input.photos?.length ? JSON.stringify(input.photos) : undefined,
      });

      // Auto-dispatch: send to ALL vendors immediately for every priority level.
      // Emergency = fire immediately with 🚨 banner. All others = standard dispatch.
      // Priority order:
      //   1. Tenant favorite for this category → only that vendor (dispatchReason=favorite)
      //   2. Landlord has round-robin enabled → least-dispatched vendor (round_robin)
      //   3. Default → every active vendor with an email (all_vendors)
      const allVendorsList = await getVendors(tenant.landlordUserId);
      const vendorsWithEmail = allVendorsList.filter(v => v.email && v.isActive);

      if (vendorsWithEmail.length > 0) {
        const APP_URL_AUTO = process.env.VITE_APP_URL ?? "https://keycove.net";
        const isEmergency = input.priority === "emergency";
        const sub2 = await getUserSubscription(tenant.landlordUserId);

        let vendorsToNotify = vendorsWithEmail;
        let dispatchReason: "favorite" | "round_robin" | "all_vendors" = "all_vendors";

        // Step 1: Does the tenant have a favorite for this category?
        const tenantFav = await getTenantFavoriteVendorForCategory(tenant.id, input.category);
        if (tenantFav) {
          const favVendor = vendorsWithEmail.find(v => v.id === tenantFav.vendorId);
          if (favVendor) {
            vendorsToNotify = [favVendor];
            dispatchReason = "favorite";
          }
        }

        // Step 2: No favorite (or favorite no longer in pool) → check round-robin.
        if (dispatchReason === "all_vendors") {
          const useRoundRobin = (sub2 as any)?.roundRobinEnabled === 1;
          if (useRoundRobin) {
            const allDispatches = await Promise.all(vendorsWithEmail.map(v => getDispatchsByVendor(v.id)));
            const countMap = vendorsWithEmail.map((v, i) => ({ vendor: v, count: allDispatches[i].length }));
            countMap.sort((a, b) => a.count - b.count);
            vendorsToNotify = [countMap[0].vendor]; // least-used vendor
            dispatchReason = "round_robin";
          }
        }

        await updateWorkOrder(workOrderId, tenant.landlordUserId, {
          status: "dispatched",
          dispatchedAt: new Date(),
          dispatchReason,
        });

        for (const v of vendorsToNotify) {
          const dispatchId = await createVendorDispatchRequest({
            workOrderId,
            vendorId: v.id,
            landlordUserId: tenant.landlordUserId,
            status: "sent",
            sentAt: new Date(),
          });
          sendEmail({
            to: v.email!,
            subject: `${isEmergency ? "🚨 EMERGENCY — " : ""}Work Request: ${input.title} — ${propertyAddress}`,
            html: vendorDispatchRequestEmail({
              vendorName: v.name,
              propertyAddress,
              issueTitle: input.title,
              description: input.description ?? "",
              priority: input.priority,
              photos: input.photos ?? [],
              responseUrl: `${APP_URL_AUTO}/vendor/respond/${dispatchId}`,
              isEmergency,
            }),
          }).catch(() => {});
        }
      }

      // (legacy single-vendor path removed — all dispatch now goes through the multi-bid system above)
      const matchingVendor: any = null; // kept for email block below to compile
      if (matchingVendor?.email) {
        // (dead code — round-robin/all-dispatch handles this now)
        sendEmail({
          to: matchingVendor.email,
          subject: `Work Order: ${input.title} — ${propertyAddress}`,
          html: workOrderDispatchEmail({
            vendorName: matchingVendor.name,
            propertyAddress,
            issueTitle: input.title,
            description: input.description ?? "",
            priority: input.priority,
            landlordName: landlord.name ?? undefined,
            landlordEmail: landlord.email ?? undefined,
          }),
        }).catch(() => {});
      }

      // Email landlord that a tenant submitted a request
      if (landlord.email) {
        const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
        sendEmail({
          to: landlord.email,
          subject: `🔧 Maintenance Request from ${tenant.name} — ${input.priority === "emergency" ? "EMERGENCY" : input.title}`,
          html: landlordMaintenanceAlertEmail({
            landlordName: landlord.name ?? "",
            tenantName: tenant.name,
            tenantEmail: tenant.email,
            propertyAddress,
            issueTitle: input.title,
            description: input.description ?? "",
            priority: input.priority,
            dashboardUrl: `${APP_URL}/work-orders`,
          }),
        }).catch(() => {});
      }

      // Email tenant confirmation
      sendEmail({
        to: tenant.email,
        subject: `Maintenance Request Received — ${input.title}`,
        html: tenantMaintenanceConfirmEmail({
          tenantName: tenant.name,
          issueTitle: input.title,
          propertyAddress,
          priority: input.priority,
        }),
      }).catch(() => {});

      return {
        success: true,
        workOrderId,
        autoDispatched: vendorsWithEmail.length > 0,
        vendorsNotified: vendorsWithEmail.length,
      };
    }),

    // ── Get vendor bids/dispatch status for a work order ─────────────────────
    listBids: protectedProcedure.input(z.object({ workOrderId: z.number() })).query(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const wo = await getWorkOrderById(input.workOrderId, ctx.user.id);
      if (!wo || wo.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      const bids = await getDispatchsByWorkOrder(input.workOrderId);
      const allVendors = await getVendors(ctx.user.id);
      return bids.map(b => ({
        ...b,
        vendorName: allVendors.find(v => v.id === b.vendorId)?.name ?? "Unknown Vendor",
        vendorEmail: allVendors.find(v => v.id === b.vendorId)?.email ?? null,
        vendorPhone: allVendors.find(v => v.id === b.vendorId)?.phone ?? null,
      }));
    }),

    // ── Dispatch to ALL vendors in the landlord's list for a property state ────
    dispatchToAll: protectedProcedure.input(z.object({
      workOrderId: z.number(),
      photos: z.array(z.string()).optional(), // photo URLs
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      const wo = await getWorkOrderById(input.workOrderId, ctx.user.id);
      if (!wo || wo.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const allVendors = await getVendors(ctx.user.id);
      const vendorsWithEmail = allVendors.filter(v => v.email && v.isActive);

      if (vendorsWithEmail.length === 0) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No vendors with email addresses found." });

      const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
      const landlord = await getUserByOpenId(ctx.user.openId);
      let dispatched = 0;

      // If photos provided, persist them on the work order
      if (input.photos?.length) {
        await updateWorkOrder(input.workOrderId, ctx.user.id, { photos: JSON.stringify(input.photos) });
      }

      for (const vendor of vendorsWithEmail) {
        // Create a dispatch request record
        const dispatchId = await createVendorDispatchRequest({
          workOrderId: wo.id,
          vendorId: vendor.id,
          landlordUserId: ctx.user.id,
          status: "sent",
          sentAt: new Date(),
        });

        const respondUrl = `${APP_URL}/vendor/respond/${dispatchId}`;

        sendEmail({
          to: vendor.email!,
          subject: `${wo.priority === "emergency" ? "🚨 EMERGENCY — " : ""}Work Request: ${wo.title} — ${wo.propertyAddress ?? "Property"}`,
          html: vendorDispatchRequestEmail({
            vendorName: vendor.name,
            propertyAddress: wo.propertyAddress ?? "N/A",
            issueTitle: wo.title,
            description: wo.description ?? "",
            priority: wo.priority ?? "medium",
            photos: input.photos ?? (wo.photos ? JSON.parse(wo.photos) : []),
            responseUrl: respondUrl,
            isEmergency: wo.priority === "emergency",
          }),
        }).catch(() => {});

        dispatched++;
      }

      // Update work order status
      await updateWorkOrder(input.workOrderId, ctx.user.id, { status: "dispatched", dispatchedAt: new Date() });

      return { success: true, dispatched };
    }),

    // ── Vendor: upload a photo or invoice file (public, gated by dispatchId) ─
    // The dispatch URL is the only auth surface for the contractor — they
    // don't have a Keycove account. We require a valid dispatchId so random
    // strangers can't burn through Cloudinary storage.
    vendorUpload: publicProcedure
      .input(z.object({
        dispatchId: z.number().int().positive(),
        fileName: z.string().max(200),
        fileType: z.string().max(100),
        fileData: z.string(), // base64
        kind: z.enum(["inspection", "completion", "invoice"]),
      }))
      .mutation(async ({ input }) => {
        const dr = await getDispatchById(input.dispatchId);
        if (!dr) throw new TRPCError({ code: "NOT_FOUND" });
        const buffer = Buffer.from(input.fileData, "base64");
        if (buffer.length > 10 * 1024 * 1024) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Files must be under 10 MB." });
        }
        const ext = input.fileName.split(".").pop()?.toLowerCase() ?? "jpg";
        const key = `vendor-dispatch/${input.dispatchId}/${input.kind}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.fileType);
        return { url };
      }),

    // ── Vendor: read dispatch state (drives multi-stage VendorRespond UI) ────
    // Public — vendor URL is the auth surface. Returns the dispatch + the
    // associated work order title/address so the vendor knows the job.
    getDispatchPublic: publicProcedure
      .input(z.object({ dispatchId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const dr = await getDispatchById(input.dispatchId);
        if (!dr) throw new TRPCError({ code: "NOT_FOUND" });
        const wo = await getWorkOrderById(dr.workOrderId, dr.landlordUserId);
        // Derive stage from the dispatch row so the client can pick a panel.
        let stage: "respond" | "inspect" | "complete" | "awaiting_approval" | "paid" | "declined";
        if (dr.status === "declined") stage = "declined";
        else if (dr.paymentStatus === "paid") stage = "paid";
        else if (dr.landlordApprovedCompletion) stage = "awaiting_approval";
        else if (dr.completedAt) stage = "awaiting_approval";
        else if (dr.inspectedAt) stage = "complete";
        else if (dr.landlordApproved) stage = "inspect";
        else stage = "respond";
        return {
          stage,
          dispatch: {
            id: dr.id,
            status: dr.status,
            proposedDate: dr.proposedDate,
            proposedTimeSlot: dr.proposedTimeSlot,
            vendorQuoteCents: dr.vendorQuoteCents,
            landlordApproved: dr.landlordApproved,
            inspectedAt: dr.inspectedAt,
            inspectionPhotos: dr.inspectionPhotos,
            completedAt: dr.completedAt,
            completionPhotos: dr.completionPhotos,
            invoiceAmountCents: dr.invoiceAmountCents,
            invoiceUrl: dr.invoiceUrl,
            paymentStatus: dr.paymentStatus,
          },
          workOrder: wo ? {
            title: wo.title,
            description: wo.description,
            propertyAddress: wo.propertyAddress,
          } : null,
        };
      }),

    // ── Vendor responds with availability + quote ─────────────────────────────
    // Public — vendor doesn't need a Keycove account
    vendorRespond: publicProcedure.input(z.object({
      dispatchId: z.number(),
      action: z.enum(["accept", "decline"]),
      proposedDate: z.string().optional(),
      proposedTimeSlot: z.string().optional(),
      quoteCents: z.number().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      await updateVendorDispatchRequest(input.dispatchId, {
        status: input.action === "accept" ? "accepted" : "declined",
        proposedDate: input.proposedDate,
        proposedTimeSlot: input.proposedTimeSlot,
        vendorQuoteCents: input.quoteCents,
        vendorNotes: input.notes,
        respondedAt: new Date(),
      });

      // Notify landlord if accepted
      if (input.action === "accept") {
        // Fetch dispatch record directly
        const { getDb } = await import("./db");
        const db = await getDb();
        if (db) {
          const { vendorDispatchRequests } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const rows = await db.select().from(vendorDispatchRequests).where(eq(vendorDispatchRequests.id, input.dispatchId)).limit(1);
          const dr = rows[0];
          if (dr) {
            const landlord = await getUserById(dr.landlordUserId);
            const wo = await getWorkOrderById(dr.workOrderId, dr.landlordUserId);
            const allVendors = await getVendors(dr.landlordUserId);
            const vendor = allVendors.find(v => v.id === dr.vendorId);
            if (landlord?.email && wo) {
              const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
              sendEmail({
                to: landlord.email,
                subject: `✅ Vendor Responded — ${wo.title}`,
                html: vendorQuoteReceivedEmail({
                  landlordName: landlord.name ?? "",
                  vendorName: vendor?.name ?? "Vendor",
                  issueTitle: wo.title,
                  propertyAddress: wo.propertyAddress ?? "",
                  proposedDate: input.proposedDate ?? "",
                  proposedTimeSlot: input.proposedTimeSlot ?? "",
                  quoteDollars: input.quoteCents ? input.quoteCents / 100 : 0,
                  vendorNotes: input.notes,
                  approveUrl: `${APP_URL}/work-orders?approveDispatch=${input.dispatchId}`,
                  dashboardUrl: `${APP_URL}/work-orders`,
                }),
              }).catch(() => {});
            }
          }
        }
      }

      // Escalate on decline: if the favorite / round-robin vendor turns the job
      // down and nobody else is still in play, automatically fan the request out
      // to every other active vendor with an email so the job doesn't stall.
      if (input.action === "decline") {
        const dr = await getDispatchById(input.dispatchId);
        if (dr) {
          const wo = await getWorkOrderById(dr.workOrderId, dr.landlordUserId);
          // Only escalate while the work order is still unassigned.
          if (wo && (wo.status === "open" || wo.status === "dispatched")) {
            const allDispatches = await getDispatchsByWorkOrder(dr.workOrderId);
            const stillInPlay = allDispatches.filter(d => d.status === "sent" || d.status === "viewed" || d.status === "accepted");
            if (stillInPlay.length === 0) {
              const alreadyTried = new Set(allDispatches.map(d => d.vendorId));
              const allVendors = await getVendors(dr.landlordUserId);
              const remaining = allVendors.filter(v => v.email && v.isActive && !alreadyTried.has(v.id));
              if (remaining.length > 0) {
                const APP_URL_ESC = process.env.VITE_APP_URL ?? "https://keycove.net";
                let woPhotos: string[] = [];
                try { woPhotos = wo.photos ? JSON.parse(wo.photos) : []; } catch { /* ignore */ }
                const isEmergency = wo.priority === "emergency";

                await updateWorkOrder(dr.workOrderId, dr.landlordUserId, {
                  status: "dispatched",
                  dispatchedAt: new Date(),
                  dispatchReason: "all_vendors",
                });

                for (const v of remaining) {
                  const newDispatchId = await createVendorDispatchRequest({
                    workOrderId: dr.workOrderId,
                    vendorId: v.id,
                    landlordUserId: dr.landlordUserId,
                    status: "sent",
                    sentAt: new Date(),
                  });
                  sendEmail({
                    to: v.email!,
                    subject: `${isEmergency ? "🚨 EMERGENCY — " : ""}Work Request: ${wo.title} — ${wo.propertyAddress ?? ""}`,
                    html: vendorDispatchRequestEmail({
                      vendorName: v.name,
                      propertyAddress: wo.propertyAddress ?? "",
                      issueTitle: wo.title,
                      description: wo.description ?? "",
                      priority: (wo.priority as any) ?? "medium",
                      photos: woPhotos,
                      responseUrl: `${APP_URL_ESC}/vendor/respond/${newDispatchId}`,
                      isEmergency,
                    }),
                  }).catch(() => {});
                }

                // Let the landlord know we escalated on their behalf.
                const landlord = await getUserById(dr.landlordUserId);
                if (landlord?.email) {
                  sendEmail({
                    to: landlord.email,
                    subject: `↪️ Vendor declined — escalated to ${remaining.length} more vendor(s): ${wo.title}`,
                    html: `<p>Hi ${landlord.name ?? ""},</p><p>Your assigned vendor declined the request "<b>${wo.title}</b>" at ${wo.propertyAddress ?? ""}. We've automatically sent it to <b>${remaining.length}</b> more active vendor(s) so it keeps moving.</p><p><a href="${APP_URL_ESC}/work-orders">View in Work Orders →</a></p>`,
                  }).catch(() => {});
                }
              }
            }
          }
        }
      }

      return { success: true };
    }),

    // ── Landlord approves a vendor's bid ──────────────────────────────────────
    approveVendor: protectedProcedure.input(z.object({
      dispatchId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      await updateVendorDispatchRequest(input.dispatchId, {
        landlordApproved: 1,
        approvedAt: new Date(),
      });

      // Decline all other bids on this work order
      const { getDb } = await import("./db");
      const db = await getDb();
      if (db) {
        const { vendorDispatchRequests } = await import("../drizzle/schema");
        const { eq, and, ne } = await import("drizzle-orm");
        const rows = await db.select().from(vendorDispatchRequests).where(eq(vendorDispatchRequests.id, input.dispatchId)).limit(1);
        const dr = rows[0];
        if (dr) {
          await db.update(vendorDispatchRequests)
            .set({ status: "declined" } as any)
            .where(and(eq(vendorDispatchRequests.workOrderId, dr.workOrderId), ne(vendorDispatchRequests.id, input.dispatchId)));
          // Mark work order as vendor_confirmed
          await updateWorkOrder(dr.workOrderId, ctx.user.id, { status: "vendor_confirmed", vendorConfirmedAt: new Date() });
        }
      }

      return { success: true };
    }),

    // ── Mark work order complete + pay vendor via Stripe ─────────────────────
    // ── Vendor submits inspection report (photos + observations + quote) ─────
    // After accepting a dispatch, the vendor visits the site, takes photos,
    // and reports back. This precedes any work or invoice.
    submitInspection: publicProcedure.input(z.object({
      dispatchId: z.number(),
      photos: z.array(z.string().url()).max(20),
      notes: z.string().max(2000).optional(),
      revisedQuoteCents: z.number().int().nonnegative().optional(),
    })).mutation(async ({ input }) => {
      const dr = await getDispatchById(input.dispatchId);
      if (!dr) throw new TRPCError({ code: "NOT_FOUND" });
      await updateVendorDispatchRequest(input.dispatchId, {
        inspectionPhotos: JSON.stringify(input.photos),
        inspectionNotes: input.notes,
        inspectedAt: new Date(),
        vendorQuoteCents: input.revisedQuoteCents ?? dr.vendorQuoteCents,
      });
      // Bump work order status so landlord knows inspection happened
      await updateWorkOrder(dr.workOrderId, dr.landlordUserId, { status: "in_progress" });

      // Email landlord
      const landlord = await getUserById(dr.landlordUserId);
      const wo = await getWorkOrderById(dr.workOrderId, dr.landlordUserId);
      if (landlord?.email && wo) {
        const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
        sendEmail({
          to: landlord.email,
          subject: `🔍 Inspection complete — ${wo.title}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Inspection Report Submitted</h2>
            <p>The contractor has inspected <strong>${wo.title}</strong> at ${wo.propertyAddress ?? ""}.</p>
            ${input.notes ? `<p><strong>Notes:</strong> ${input.notes}</p>` : ""}
            ${input.revisedQuoteCents ? `<p><strong>Revised quote:</strong> $${(input.revisedQuoteCents / 100).toFixed(2)}</p>` : ""}
            <p style="margin-top:16px"><a href="${APP_URL}/work-orders" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Review Inspection</a></p>
          </div>`,
        }).catch(() => {});
      }
      return { success: true };
    }),

    // ── Vendor marks work complete (final photos + invoice) ───────────────
    // Gates the payVendor step — landlord must approveCompletion before payment.
    markComplete: publicProcedure.input(z.object({
      dispatchId: z.number(),
      photos: z.array(z.string().url()).min(1).max(20),
      invoiceUrl: z.string().url(),
      invoiceAmountCents: z.number().int().positive(),
      notes: z.string().max(2000).optional(),
    })).mutation(async ({ input }) => {
      const dr = await getDispatchById(input.dispatchId);
      if (!dr) throw new TRPCError({ code: "NOT_FOUND" });
      await updateVendorDispatchRequest(input.dispatchId, {
        completionPhotos: JSON.stringify(input.photos),
        invoiceUrl: input.invoiceUrl,
        invoiceAmountCents: input.invoiceAmountCents,
        completedAt: new Date(),
      });

      const landlord = await getUserById(dr.landlordUserId);
      const wo = await getWorkOrderById(dr.workOrderId, dr.landlordUserId);
      if (landlord?.email && wo) {
        const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
        sendEmail({
          to: landlord.email,
          subject: `✅ Work complete — review & approve ${wo.title}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Work Complete — Approval Required</h2>
            <p>The contractor has completed <strong>${wo.title}</strong> at ${wo.propertyAddress ?? ""}.</p>
            <p><strong>Invoice amount:</strong> $${(input.invoiceAmountCents / 100).toFixed(2)}</p>
            ${input.notes ? `<p><strong>Notes:</strong> ${input.notes}</p>` : ""}
            <p>Review the completion photos and invoice, then approve to release payment.</p>
            <p style="margin-top:16px"><a href="${APP_URL}/work-orders" style="background:#00C896;color:#0a2a1f;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700">Review & Approve</a></p>
          </div>`,
        }).catch(() => {});
      }
      return { success: true };
    }),

    // ── Landlord approves completion — required before payVendor ───────────
    approveCompletion: protectedProcedure.input(z.object({
      dispatchId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const dr = await getDispatchById(input.dispatchId);
      if (!dr || dr.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (!dr.completedAt) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Contractor has not marked work complete yet." });
      }
      await updateVendorDispatchRequest(input.dispatchId, {
        landlordApprovedCompletion: 1,
        landlordApprovedCompletionAt: new Date(),
      });
      return { success: true };
    }),

    payVendor: protectedProcedure.input(z.object({
      dispatchId: z.number(),
      amountCents: z.number().positive(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      // Gate payment on completion approval — enforces bid → approve → inspect
      // → complete → approve completion → pay audit trail.
      const drGate = await getDispatchById(input.dispatchId);
      if (!drGate || drGate.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (!drGate.landlordApprovedCompletion) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Approve the completion (review photos + invoice) before releasing payment.",
        });
      }

      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { vendorDispatchRequests } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const rows = await db.select().from(vendorDispatchRequests).where(eq(vendorDispatchRequests.id, input.dispatchId)).limit(1);
      const dr = rows[0];
      if (!dr || dr.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      const stripe = getStripe();
      if (!stripe || !sub.stripeConnectAccountId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Stripe not configured." });
      }

      // Find vendor email for notification
      const allVendors = await getVendors(ctx.user.id);
      const vendor = allVendors.find(v => v.id === dr.vendorId);
      const wo = await getWorkOrderById(dr.workOrderId, dr.landlordUserId);

      // Create a Stripe PaymentIntent charged to the landlord's connected account
      const paymentIntent = await stripe.paymentIntents.create({
        amount: input.amountCents,
        currency: "usd",
        description: `Vendor payment: ${wo?.title ?? "Work order"} — ${wo?.propertyAddress ?? ""}`,
        metadata: { dispatchId: String(input.dispatchId), workOrderId: String(dr.workOrderId), vendorId: String(dr.vendorId) },
      }, { stripeAccount: sub.stripeConnectAccountId });

      await updateVendorDispatchRequest(input.dispatchId, {
        paymentStatus: "paid",
        stripePaymentIntentId: paymentIntent.id,
        paidAt: new Date(),
      });

      // Mark work order resolved
      if (wo) await updateWorkOrder(wo.id, ctx.user.id, { status: "resolved", resolvedAt: new Date(), actualCost: input.amountCents });

      // Notify landlord summary + vendor if email on file
      const landlord = await getUserByOpenId(ctx.user.openId);
      if (landlord?.email && wo) {
        sendEmail({
          to: landlord.email,
          subject: `💰 Vendor Paid — ${wo.title}`,
          html: vendorJobCompleteEmail({
            landlordName: landlord.name ?? "",
            vendorName: vendor?.name ?? "Vendor",
            issueTitle: wo.title,
            propertyAddress: wo.propertyAddress ?? "",
            finalAmountDollars: input.amountCents / 100,
            paymentUrl: `${process.env.VITE_APP_URL ?? "https://keycove.net"}/work-orders`,
          }),
        }).catch(() => {});
      }

      return { success: true, paymentIntentId: paymentIntent.id };
    }),
  }),

  // ── ACCOUNTING ───────────────────────────────────────────────────────────
  accounting: router({
    list: protectedProcedure.input(z.object({
      year: z.number().optional(),
    })).query(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      return getAccountingEntries(ctx.user.id, input.year);
    }),
    create: protectedProcedure.input(z.object({
      type: z.enum(["income", "expense"]),
      category: z.string(),
      amount: z.number().positive(), // in cents
      date: z.string(),
      description: z.string().optional(),
      propertyAddress: z.string().optional(),
      crmPropertyId: z.number().optional(),
      listingId: z.number().optional(),
      vendorId: z.number().optional(), // attribute an expense to a contractor for 1099 totals
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const id = await createAccountingEntry({ ...input, userId: ctx.user.id, category: input.category as any });
      return { id };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      type: z.enum(["income", "expense"]).optional(),
      category: z.string().optional(),
      amount: z.number().optional(),
      date: z.string().optional(),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateAccountingEntry(id, ctx.user.id, data as any);
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteAccountingEntry(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ── CRM ──────────────────────────────────────────────────────────────────
  crm: router({
    // Properties
    listProperties: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      return getCrmProperties(ctx.user.id);
    }),
    createProperty: protectedProcedure.input(z.object({
      address: z.string().min(1),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      propertyType: z.string().optional(),
      totalUnits: z.number().optional(),
      purchasePrice: z.number().optional(),
      currentValue: z.number().optional(),
      yearBuilt: z.number().optional(),
      squareFeet: z.number().optional(),
      notes: z.string().optional(),
      listingId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const id = await createCrmProperty({ ...input, userId: ctx.user.id, propertyType: (input.propertyType as any) ?? "other" });
      return { id };
    }),
    updateProperty: protectedProcedure.input(z.object({
      id: z.number(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      notes: z.string().optional(),
      status: z.string().optional(),
      totalUnits: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCrmProperty(id, ctx.user.id, data as any);
      return { success: true };
    }),
    deleteProperty: protectedProcedure.input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteCrmProperty(input.id, ctx.user.id);
        return { success: true };
      }),

    // Tenants
    listTenants: protectedProcedure.input(z.object({
      propertyId: z.number().optional(),
    })).query(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      return getCrmTenants(ctx.user.id, input.propertyId);
    }),
    createTenant: protectedProcedure.input(z.object({
      crmPropertyId: z.number(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      moveInDate: z.string().optional(),
      moveOutDate: z.string().optional(),
      monthlyRent: z.number().optional(),
      securityDeposit: z.number().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await createCrmTenant({ ...input, userId: ctx.user.id });
      return { id };
    }),
    updateTenant: protectedProcedure.input(z.object({
      id: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      status: z.string().optional(),
      notes: z.string().optional(),
      moveOutDate: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCrmTenant(id, ctx.user.id, data as any);
      return { success: true };
    }),
    deleteTenant: protectedProcedure.input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteCrmTenant(input.id, ctx.user.id);
        return { success: true };
      }),

    // Leases
    listLeases: protectedProcedure.input(z.object({
      propertyId: z.number().optional(),
    })).query(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      return getCrmLeases(ctx.user.id, input.propertyId);
    }),
    createLease: protectedProcedure.input(z.object({
      crmPropertyId: z.number(),
      crmTenantId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      monthlyRent: z.number(),
      securityDeposit: z.number().optional(),
      leaseType: z.enum(["month_to_month", "fixed_term", "week_to_week"]).default("fixed_term"),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await createCrmLease({ ...input, userId: ctx.user.id });
      return { id };
    }),

    /**
     * Bulk migration import — the "switch off your old software" path.
     *
     * A property manager pastes/uploads one row per occupied unit (their
     * existing renters + leases already in place). Each row lands as a
     * self-contained crm_property (address incl. unit) + crm_tenant +
     * active crm_lease, so the portal, rent schedule, auto late fees,
     * accounting, and tenant portal all work per-unit with zero further
     * setup. Handles 1–200 units in a single call. Per-row errors are
     * collected (never abort the whole batch) so a bad row can't sink a
     * 200-unit import. No AI, no tokens — pure structured parse.
     */
    bulkImport: protectedProcedure.input(z.object({
      rows: z.array(z.object({
        building: z.string().optional(),      // building/complex name, for grouping
        unit: z.string().optional(),          // unit/room number or letter (4B, 12A, Room 3…)
        propertyType: z.string().optional(),  // apartment | co_living | single_family | …
        address: z.string().min(1),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        firstName: z.string().min(1),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        monthlyRentCents: z.number().int().nonnegative(),
        securityDepositCents: z.number().int().nonnegative().optional(),
        leaseStartDate: z.string(),           // YYYY-MM-DD
        leaseEndDate: z.string().optional(),  // empty => month-to-month
        lateFeeCents: z.number().int().nonnegative().optional(),
        lateFeeGraceDays: z.number().int().min(0).max(31).optional(),
      })).min(1).max(500),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Bulk import requires a Pro subscription." });

      let imported = 0;
      const buildings = new Set<string>();
      const errors: { row: number; unit: string; message: string }[] = [];

      for (let i = 0; i < input.rows.length; i++) {
        const r = input.rows[i];
        const unitLabel = r.unit ? String(r.unit).trim() : "";
        try {
          // Co-living rents one property by the room; everything else by the unit.
          const rawType = (r.propertyType || "apartment").toLowerCase().replace(/[-\s]/g, "_");
          const isRoom = rawType === "co_living" || rawType === "coliving" || rawType === "room" || rawType === "room_rental";
          const VALID_TYPES = ["single_family", "multi_family", "apartment", "condo", "townhouse", "co_living", "commercial", "other"];
          const propertyType = isRoom ? "co_living" : (VALID_TYPES.includes(rawType) ? rawType : "apartment");
          // Full address so each crm_property is a distinct, self-contained line.
          const base = r.address.trim();
          const fullAddress = unitLabel ? (isRoom ? `${base} · Rm ${unitLabel}` : `${base} #${unitLabel}`) : base;
          const buildingName = (r.building || r.address).trim();
          buildings.add(buildingName);

          const propertyId = await createCrmProperty({
            userId: ctx.user.id,
            address: fullAddress,
            city: r.city || undefined,
            state: r.state || undefined,
            zip: r.zip || undefined,
            propertyType: propertyType as any,
            totalUnits: 1,
            notes: r.building ? `${isRoom ? "Co-living" : "Building"}: ${buildingName}` : undefined,
          } as any);

          const tenantId = await createCrmTenant({
            userId: ctx.user.id,
            crmPropertyId: propertyId,
            firstName: r.firstName.trim(),
            lastName: (r.lastName || "").trim(),
            email: r.email?.trim() || undefined,
            phone: r.phone?.trim() || undefined,
            moveInDate: r.leaseStartDate,
            monthlyRent: r.monthlyRentCents,
            securityDeposit: r.securityDepositCents,
            status: "active" as any,
          } as any);

          const hasEnd = !!(r.leaseEndDate && r.leaseEndDate.trim());
          await createCrmLease({
            userId: ctx.user.id,
            crmPropertyId: propertyId,
            crmTenantId: tenantId,
            startDate: r.leaseStartDate,
            endDate: hasEnd ? r.leaseEndDate!.trim() : r.leaseStartDate,
            monthlyRent: r.monthlyRentCents,
            securityDeposit: r.securityDepositCents,
            lateFeeCents: r.lateFeeCents ?? 5000,
            lateFeeGraceDays: r.lateFeeGraceDays ?? 5,
            leaseType: (hasEnd ? "fixed_term" : "month_to_month") as any,
            status: "active" as any,
          } as any);

          imported++;
        } catch (e: any) {
          errors.push({ row: i + 2, unit: unitLabel || r.address, message: e?.message || "Import failed" });
        }
      }

      if (imported > 0) {
        await notifyOwner({ title: "Portfolio Imported", content: `${ctx.user.name} imported ${imported} unit(s) across ${buildings.size} building(s).` });
      }
      return { imported, buildings: buildings.size, total: input.rows.length, errors };
    }),

    /**
     * Send an accepted tenant the lease to sign. The lease is either the
     * landlord's own stored/uploaded PDF (docUrl) or, if none, a free
     * structured agreement the tenant fills + signs (no AI). All terms ride
     * in a signed token — no invite table. Tenant opens /sign/:token, reviews,
     * types their signature, and on submit the crm property/tenant/lease go
     * active and the portal is live.
     */
    sendLeaseToSign: protectedProcedure.input(z.object({
      tenantName: z.string().min(1),
      tenantEmail: z.string().email(),
      propertyType: z.string().optional(),
      address: z.string().min(1),
      unit: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      monthlyRentCents: z.number().int().positive(),
      securityDepositCents: z.number().int().nonnegative().optional(),
      leaseStartDate: z.string(),
      leaseEndDate: z.string().optional(),
      lateFeeCents: z.number().int().nonnegative().optional(),
      lateFeeGraceDays: z.number().int().min(0).max(31).optional(),
      documentUrl: z.string().optional(),   // landlord's stored/uploaded lease
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Sending leases requires a Pro subscription." });
      const brand = (sub as any).brandName || ctx.user.name || "your landlord";
      const token = signLeaseInvite({
        lid: ctx.user.id, lname: brand, name: input.tenantName,
        address: input.address, unit: input.unit, ptype: input.propertyType,
        city: input.city, state: input.state, zip: input.zip,
        email: input.tenantEmail, rent: input.monthlyRentCents, deposit: input.securityDepositCents,
        start: input.leaseStartDate, end: input.leaseEndDate,
        lateFee: input.lateFeeCents, grace: input.lateFeeGraceDays,
        docUrl: input.documentUrl,
      });
      const url = `${APP_URL}/sign/${token}`;
      const first = input.tenantName.split(/\s+/)[0] || "there";
      const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1B2B5E">Your lease is ready to sign</h2>
        <p>Hi ${first}, ${brand} has sent you a lease for <strong>${input.address}${input.unit ? ` #${input.unit}` : ""}</strong> to review and sign.</p>
        <p style="margin:20px 0"><a href="${url}" style="background:#4F46E5;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px;display:inline-block">Review &amp; sign your lease →</a></p>
        <p style="color:#6b7280;font-size:13px">You'll see the full terms, sign with your name, and get instant access to your tenant portal to pay rent online.</p>
        <p style="color:#9ca3af;font-size:12px">This link is private to you. If you didn't expect this, ignore it.</p>
      </div>`;
      const sent = await sendEmail({ to: input.tenantEmail, subject: `Sign your lease — ${brand}`, html });
      if (!sent) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Email couldn't be sent — check email configuration." });
      return { success: true, email: input.tenantEmail, signUrl: url };
    }),

    /** Public: load a lease invite for the tenant's /sign/:token page. */
    getLeaseInvite: publicProcedure.input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const p = verifyLeaseInvite(input.token);
        if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "This signing link is invalid or expired." });
        return {
          landlordName: p.lname || "Your landlord",
          tenantName: p.name || "",
          tenantEmail: p.email,
          propertyType: p.ptype || "apartment",
          address: p.address, unit: p.unit || "", city: p.city || "", state: p.state || "", zip: p.zip || "",
          monthlyRentCents: p.rent, securityDepositCents: p.deposit ?? 0,
          leaseStartDate: p.start, leaseEndDate: p.end || "",
          lateFeeCents: p.lateFee ?? 5000, lateFeeGraceDays: p.grace ?? 5,
          documentUrl: p.docUrl || "",
        };
      }),

    /**
     * Public: tenant signs. Creates the crm property + tenant + active lease
     * under the landlord and records the typed signature, so the portal goes
     * live immediately. Idempotent-ish: re-submitting the same token creates a
     * new lease (the landlord can void a dupe) — acceptable for a one-time link.
     */
    submitSignedLease: publicProcedure.input(z.object({
      token: z.string(),
      signatureName: z.string().min(2),
      phone: z.string().optional(),
      agreed: z.literal(true),
    })).mutation(async ({ input }) => {
      const p = verifyLeaseInvite(input.token);
      if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "This signing link is invalid or expired." });

      const rawType = (p.ptype || "apartment").toLowerCase().replace(/[-\s]/g, "_");
      const isRoom = rawType === "co_living" || rawType === "coliving" || rawType === "room";
      const VALID = ["single_family", "multi_family", "apartment", "condo", "townhouse", "co_living", "commercial", "other"];
      const propertyType = isRoom ? "co_living" : (VALID.includes(rawType) ? rawType : "apartment");
      const unitLabel = p.unit ? String(p.unit).trim() : "";
      const fullAddress = unitLabel ? (isRoom ? `${p.address.trim()} · Rm ${unitLabel}` : `${p.address.trim()} #${unitLabel}`) : p.address.trim();
      const [firstName, ...rest] = (p.name || input.signatureName).trim().split(/\s+/);

      const propertyId = await createCrmProperty({
        userId: p.lid, address: fullAddress, city: p.city || undefined, state: p.state || undefined,
        zip: p.zip || undefined, propertyType: propertyType as any, totalUnits: 1,
      } as any);
      const tenantId = await createCrmTenant({
        userId: p.lid, crmPropertyId: propertyId, firstName: firstName || "Tenant",
        lastName: rest.join(" "), email: p.email, phone: input.phone || undefined,
        moveInDate: p.start, monthlyRent: p.rent, securityDeposit: p.deposit, status: "active" as any,
      } as any);
      const hasEnd = !!(p.end && p.end.trim());
      const signedNote = `Signed by ${input.signatureName} on ${new Date().toISOString().split("T")[0]}.` + (p.docUrl ? ` Lease document: ${p.docUrl}` : " Structured Keycove agreement.");
      await createCrmLease({
        userId: p.lid, crmPropertyId: propertyId, crmTenantId: tenantId,
        startDate: p.start, endDate: hasEnd ? p.end : p.start,
        monthlyRent: p.rent, securityDeposit: p.deposit,
        lateFeeCents: p.lateFee ?? 5000, lateFeeGraceDays: p.grace ?? 5,
        leaseType: (hasEnd ? "fixed_term" : "month_to_month") as any,
        status: "active" as any, documentUrl: p.docUrl || undefined, notes: signedNote,
      } as any);

      await notifyOwner({ title: "Lease Signed", content: `${input.signatureName} signed the lease for ${fullAddress}. Their portal is live.` });
      return { success: true };
    }),

    updateLease: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.string().optional(),
      endDate: z.string().optional(),
      monthlyRent: z.number().optional(),
      notes: z.string().optional(),
      lateFeeCents: z.number().int().min(0).optional(),
      lateFeeGraceDays: z.number().int().min(0).max(31).optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCrmLease(id, ctx.user.id, data as any);
      return { success: true };
    }),

    // Notes
    listNotes: protectedProcedure.input(z.object({
      entityType: z.enum(["property", "tenant", "lease", "work_order"]),
      entityId: z.number(),
    })).query(async ({ ctx, input }) => {
      return getCrmNotes(ctx.user.id, input.entityType, input.entityId);
    }),
    createNote: protectedProcedure.input(z.object({
      entityType: z.enum(["property", "tenant", "lease", "work_order"]),
      entityId: z.number(),
      content: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      const id = await createCrmNote({ ...input, userId: ctx.user.id });
      return { id };
    }),

    // Maintenance (work orders) for a property
    listWorkOrders: protectedProcedure.input(z.object({
      crmPropertyId: z.number().optional(),
      listingId: z.number().optional(),
    })).query(async ({ ctx, input }) => {
      return getWorkOrdersForProperty(ctx.user.id, input.crmPropertyId, input.listingId);
    }),

    // Rent payment history for a property (via linked listing → lease agreements)
    listRentPayments: protectedProcedure.input(z.object({
      listingId: z.number(),
    })).query(async ({ ctx, input }) => {
      return getRentPaymentsForListing(ctx.user.id, input.listingId);
    }),

    // Generate a private rent-payment link for a CRM tenant. Works for occupied
    // units that are never publicly listed — routes to the landlord's bank.
    getRentLink: protectedProcedure.input(z.object({
      crmTenantId: z.number(),
    })).query(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const tenant = await getCrmTenantById(input.crmTenantId);
      if (!tenant || tenant.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      const bankReady = !!sub.stripeConnectAccountId && sub.stripeConnectStatus === "active";
      const token = signCrmRentToken(tenant.id);
      return { token, url: `${APP_URL}/pay/rent/${token}`, bankReady };
    }),

    /**
     * Email the tenant their secure rent link from admin@keycove.net (Keycove-
     * sent, not a mailto draft). They can pay this month and set up autopay on
     * that page so rent auto-drafts monthly.
     */
    emailRentInvite: protectedProcedure.input(z.object({
      crmTenantId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const tenant = await getCrmTenantById(input.crmTenantId);
      if (!tenant || tenant.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (!tenant.email) throw new TRPCError({ code: "BAD_REQUEST", message: "This tenant has no email on file." });
      const bankReady = !!sub.stripeConnectAccountId && sub.stripeConnectStatus === "active";
      if (!bankReady) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Connect your bank account first (Payouts) so rent routes to you." });
      const token = signCrmRentToken(tenant.id);
      const url = `${APP_URL}/pay/rent/${token}`;
      const brand = (sub as any).brandName || ctx.user.name || "your landlord";
      const first = tenant.firstName || "there";
      const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1B2B5E">Pay your rent online</h2>
        <p>Hi ${first}, ${brand} invites you to pay rent securely through Keycove.</p>
        <p style="margin:20px 0"><a href="${url}" style="background:#4F46E5;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px;display:inline-block">Pay rent &amp; set up autopay →</a></p>
        <p style="color:#6b7280;font-size:13px">On that page you can pay this month by bank (free) or card, and turn on <strong>autopay</strong> so rent drafts automatically each month — no more reminders.</p>
        <p style="color:#9ca3af;font-size:12px">Link is private to you. If you didn't expect this, ignore it.</p>
      </div>`;
      const sent = await sendEmail({ to: tenant.email, subject: `Pay your rent online — ${brand}`, html });
      if (!sent) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Email couldn't be sent — check email configuration." });
      return { success: true, email: tenant.email };
    }),

    /**
     * Month-by-month rent schedule for a property's active lease — most recent
     * first. Each month is "paid" if a rent income entry exists for it, else
     * "owed"; carries any accrued late fee. Drives the CRM rent list.
     */
    rentSchedule: protectedProcedure.input(z.object({
      crmPropertyId: z.number(),
    })).query(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return [];
      const { crmLeases, accountingEntries } = await import("../drizzle/schema");
      const { and, eq } = await import("drizzle-orm");
      const [lease] = await db.select().from(crmLeases)
        .where(and(eq(crmLeases.userId, ctx.user.id), eq(crmLeases.crmPropertyId, input.crmPropertyId), eq(crmLeases.status, "active")))
        .limit(1);
      if (!lease) return [];
      const entries = await db.select().from(accountingEntries)
        .where(and(eq(accountingEntries.userId, ctx.user.id), eq(accountingEntries.crmPropertyId, input.crmPropertyId)));
      const rentMonths = new Set<string>();
      const lateByMonth: Record<string, number> = {};
      for (const e of entries as any[]) {
        const ym = String(e.date ?? "").slice(0, 7);
        if (e.category === "rent") rentMonths.add(ym);
        else if (e.category === "late_fee") lateByMonth[ym] = (lateByMonth[ym] ?? 0) + (e.amount ?? 0);
      }
      const start = new Date(lease.startDate);
      const now = new Date();
      const rows: { month: string; amountCents: number; lateFeeCents: number; paid: boolean }[] = [];
      if (!isNaN(start.getTime())) {
        let cur = new Date(start.getFullYear(), start.getMonth(), 1);
        const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        while (cur <= endMonth) {
          const ym = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
          rows.push({ month: ym, amountCents: lease.monthlyRent, lateFeeCents: lateByMonth[ym] ?? 0, paid: rentMonths.has(ym) });
          cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        }
      }
      return rows.reverse();
    }),
  }),
  // ─── Tenant Portal Router ────────────────────────────────────────────────────
  tenant: router({
    /** Send a 6-digit magic-link login code to the tenant's email */
    sendLoginLink: publicProcedure.input(z.object({
      email: z.string().email(),
    })).mutation(async ({ input }) => {
      const tenant = await getTenantByEmail(input.email);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND", message: "No tenant account found with that email. Contact your landlord to get set up." });
      // Generate a 6-digit numeric token
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await updateTenantToken(tenant.id, code, expiresAt);
      // In production, send via email. For now, notify owner and return code in dev.
      await notifyOwner({
        title: `Tenant Login Code: ${tenant.name}`,
        content: `Tenant ${tenant.name} (${input.email}) requested login code: ${code} (expires in 15 min)`,
      });
      return { sent: true };
    }),
    /** Verify the 6-digit code and return a session token */
    verifyToken: publicProcedure.input(z.object({
      token: z.string().length(6),
    })).mutation(async ({ input }) => {
      const tenant = await getTenantByToken(input.token);
      if (!tenant) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired code. Please request a new one." });
      if (!tenant.tokenExpiresAt || new Date() > tenant.tokenExpiresAt) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Code has expired. Please request a new one." });
      }
      // Clear token after use
      await updateTenantToken(tenant.id, null, null);
      // Return a HMAC-signed session token (30-day TTL)
      const sessionToken = signTenantToken(tenant.id);
      return { token: sessionToken, tenantId: tenant.id };
    }),
    /** Get tenant portal data by session token (from localStorage) */
    getPortalData: publicProcedure.input(z.object({
      sessionToken: z.string(),
    })).query(async ({ input }) => {
      const decoded = verifyTenantToken(input.sessionToken);
      if (!decoded) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session. Please sign in again." });
      const tenant = await getTenantById(decoded.id);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND" });
      // Get payment history for this tenant's listing
      const payments = tenant.listingId ? await getPaymentsByLandlord(tenant.landlordUserId) : [];
      const myPayments = payments.filter((p: any) => p.listingId === tenant.listingId);

      // Rent-ledger balance: unpaid rent periods + any accrued late fees for
      // this tenant. Best-effort — the portal must still render if this fails.
      let rentDueCents = 0, lateFeeCents = 0, unpaidPeriods = 0;
      try {
        const db = await getDb();
        if (db && tenant.email) {
          const { rentPayments } = await import("../drizzle/schema");
          const { and, eq, inArray } = await import("drizzle-orm");
          const ledger = await db.select().from(rentPayments)
            .where(and(eq(rentPayments.tenantEmail, tenant.email), inArray(rentPayments.status, ["pending", "late", "partial"])));
          for (const r of ledger as any[]) {
            rentDueCents += r.amountCents ?? 0;
            lateFeeCents += r.lateFeeCents ?? 0;
            unpaidPeriods += 1;
          }
        }
      } catch { /* balance is best-effort */ }

      return { tenant, payments: myPayments, balanceCents: rentDueCents + lateFeeCents, rentDueCents, lateFeeCents, unpaidPeriods };
    }),
    /** Landlord: list all tenants they've invited */
    listTenants: protectedProcedure.query(async ({ ctx }) => {
      return getTenantsByLandlord(ctx.user.id);
    }),
    /** Landlord: invite a tenant to the portal */
    inviteTenant: protectedProcedure.input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      listingId: z.number().optional(),
      leaseId: z.number().optional(),
      monthlyRentCents: z.number().optional(),
      leaseStart: z.string().optional(),
      leaseEnd: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Tenant portal invitations require a Pro subscription." });
      const id = await createTenantAccount({
        ...input,
        landlordUserId: ctx.user.id,
        leaseStart: input.leaseStart ? new Date(input.leaseStart) : undefined,
        leaseEnd: input.leaseEnd ? new Date(input.leaseEnd) : undefined,
      });
      // Notify owner
      await notifyOwner({ title: "New Tenant Invited", content: `${ctx.user.name} invited ${input.name} (${input.email}) to the tenant portal.` });
      return { id };
    }),
    /** Landlord: remove a tenant */
    removeTenant: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const tenant = await getTenantById(input.id);
      if (!tenant || tenant.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      await updateTenantToken(input.id, null, null); // deactivate
      return { success: true };
    }),

    // ─── Tenant favorite vendors ──────────────────────────────────────────────
    // All four procedures are publicProcedure + token-based since tenants
    // authenticate against tenantPortalAccounts, not a users row.

    /** List the active vendors in the tenant's landlord's pool. */
    listAvailableVendors: publicProcedure.input(z.object({
      sessionToken: z.string(),
    })).query(async ({ input }) => {
      const decoded = verifyTenantToken(input.sessionToken);
      if (!decoded) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      const tenant = await getTenantById(decoded.id);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND" });
      const vendors = await getVendors(tenant.landlordUserId);
      return vendors.filter(v => v.isActive === 1);
    }),

    /** List this tenant's favorite vendors, hydrated with vendor details. */
    listMyFavoriteVendors: publicProcedure.input(z.object({
      sessionToken: z.string(),
    })).query(async ({ input }) => {
      const decoded = verifyTenantToken(input.sessionToken);
      if (!decoded) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      const favs = await getTenantFavoriteVendors(decoded.id);
      const hydrated = await Promise.all(favs.map(async f => ({
        ...f,
        vendor: await getVendorById(f.vendorId),
      })));
      // Drop any rows whose vendor was hard-deleted from under us — defensive,
      // shouldn't happen since deleteVendor soft-deletes (isActive=0).
      return hydrated.filter(f => f.vendor);
    }),

    /** Star a vendor as the tenant's favorite for a specific work-order category. */
    setFavoriteVendor: publicProcedure.input(z.object({
      sessionToken: z.string(),
      vendorId: z.number(),
      category: z.enum(["plumbing","electrical","hvac","appliance","structural","pest_control","cleaning","landscaping","other"]),
    })).mutation(async ({ input }) => {
      const decoded = verifyTenantToken(input.sessionToken);
      if (!decoded) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      const tenant = await getTenantById(decoded.id);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND" });
      // Verify the vendor belongs to the tenant's landlord — without this
      // a malicious tenant could favorite any vendor in the system.
      const vendor = await getVendorById(input.vendorId);
      if (!vendor) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found." });
      if (vendor.userId !== tenant.landlordUserId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This vendor is not in your landlord's pool." });
      }
      if (vendor.isActive !== 1) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This vendor is not active." });
      }
      await setTenantFavoriteVendor({
        tenantPortalAccountId: tenant.id,
        landlordUserId: tenant.landlordUserId,
        vendorId: input.vendorId,
        category: input.category,
      });
      return { success: true };
    }),

    /** Remove the tenant's favorite for a category — fall back to round-robin. */
    clearFavoriteVendor: publicProcedure.input(z.object({
      sessionToken: z.string(),
      category: z.enum(["plumbing","electrical","hvac","appliance","structural","pest_control","cleaning","landscaping","other"]),
    })).mutation(async ({ input }) => {
      const decoded = verifyTenantToken(input.sessionToken);
      if (!decoded) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      await clearTenantFavoriteVendor(decoded.id, input.category);
      return { success: true };
    }),
  }),

  // ─── Support Tickets Router ───────────────────────────────────────────────────
  support: router({
    /** Submit a support ticket — available to everyone */
    submit: publicProcedure.input(z.object({
      subject: z.string().min(5).max(255),
      message: z.string().min(20),
      category: z.enum(["billing", "technical", "listing", "payment", "account", "other"]),
      contactEmail: z.string().email().optional(),
      userId: z.number().optional(),
      userTier: z.enum(["free", "paid", "guest"]).default("guest"),
    })).mutation(async ({ input }) => {
      const priority = input.userTier === "paid" ? "high" : "normal";
      const id = await createSupportTicket({ ...input, priority });
      await notifyOwner({
        title: `[${priority.toUpperCase()}] New Support Ticket: ${input.subject}`,
        content: `From: ${input.contactEmail || "authenticated user"} | Category: ${input.category} | Tier: ${input.userTier}\n\n${input.message}`,
      });
      return { id, priority };
    }),
    /** Get user's own tickets */
    myTickets: protectedProcedure.query(async ({ ctx }) => {
      return getSupportTickets(ctx.user.id);
    }),
    /** Get a single ticket with replies */
    getTicket: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const ticket = await getSupportTicketById(input.id);
      if (!ticket || ticket.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      const replies = await getSupportReplies(input.id);
      return { ticket, replies };
    }),
    /** Add a reply to a ticket */
    reply: protectedProcedure.input(z.object({
      ticketId: z.number(),
      message: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      const ticket = await getSupportTicketById(input.ticketId);
      if (!ticket || ticket.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      const id = await createSupportReply({
        ticketId: input.ticketId,
        authorType: "user",
        authorName: ctx.user.name ?? "User",
        message: input.message,
      });
       await notifyOwner({ title: `Support Reply on Ticket #${input.ticketId}`, content: input.message });
      return { id };
    }),
  }),
  complexes: complexesRouter,
  istay: istayRouter,

  // ─── Rental Applications ────────────────────────────────────────────────────
  applications: router({
    /** Public: submit a rental application for a listing */
    submit: publicProcedure.input(z.object({
      listingId: z.number(),
      landlordUserId: z.number(),
      applicantName: z.string().min(1),
      applicantEmail: z.string().email(),
      applicantPhone: z.string().optional(),
      applicantDob: z.string().optional(),
      currentAddress: z.string().optional(),
      currentLandlordName: z.string().optional(),
      currentLandlordPhone: z.string().optional(),
      currentRent: z.string().optional(),
      reasonForLeaving: z.string().optional(),
      employerName: z.string().optional(),
      employerPhone: z.string().optional(),
      occupation: z.string().optional(),
      monthlyIncome: z.string().optional(),
      applicationFormType: z.enum(["standard", "coliving_member"]).default("standard"),
      moveInDate: z.string().optional(),
      roomPreference: z.string().optional(),
      lifestyleNotes: z.string().optional(),
      state: z.string().max(2).optional(),
      stateDisclosureAgreed: z.boolean().default(false),
      hasPets: z.boolean().default(false),
      petDescription: z.string().optional(),
      vehicleInfo: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      emergencyContactRelation: z.string().optional(),
      additionalOccupants: z.array(z.object({ name: z.string(), relation: z.string() })).optional(),
      backgroundCheckConsent: z.boolean().default(false),
      creditCheckConsent: z.boolean().default(false),
      signatureDataUrl: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await createRentalApplication({
        listingId: input.listingId,
        landlordUserId: input.landlordUserId,
        applicantName: input.applicantName,
        applicantEmail: input.applicantEmail,
        applicantPhone: input.applicantPhone,
        applicantDob: input.applicantDob,
        currentAddress: input.currentAddress,
        currentLandlordName: input.currentLandlordName,
        currentLandlordPhone: input.currentLandlordPhone,
        currentRent: input.currentRent,
        reasonForLeaving: input.reasonForLeaving,
        employerName: input.employerName,
        employerPhone: input.employerPhone,
        occupation: input.occupation,
        monthlyIncome: input.monthlyIncome,
        applicationFormType: input.applicationFormType,
        moveInDate: input.moveInDate,
        roomPreference: input.roomPreference,
        lifestyleNotes: input.lifestyleNotes,
        state: input.state,
        stateDisclosureAgreed: input.stateDisclosureAgreed ? 1 : 0,
        hasPets: input.hasPets ? 1 : 0,
        petDescription: input.petDescription,
        vehicleInfo: input.vehicleInfo,
        emergencyContactName: input.emergencyContactName,
        emergencyContactPhone: input.emergencyContactPhone,
        emergencyContactRelation: input.emergencyContactRelation,
        additionalOccupants: input.additionalOccupants ? JSON.stringify(input.additionalOccupants) : undefined,
        backgroundCheckConsent: input.backgroundCheckConsent ? 1 : 0,
        creditCheckConsent: input.creditCheckConsent ? 1 : 0,
        signatureDataUrl: input.signatureDataUrl,
        signedAt: input.signatureDataUrl ? new Date() : undefined,
        status: "submitted",
      });
      return { id, success: true };
    }),

    /** Landlord: list all applications */
    list: protectedProcedure.query(async ({ ctx }) => {
      return getRentalApplicationsByLandlord(ctx.user.id);
    }),

    /** Landlord: list applications for a specific listing */
    byListing: protectedProcedure.input(z.object({ listingId: z.number() })).query(async ({ ctx, input }) => {
      const apps = await getRentalApplicationsByListing(input.listingId);
      // Verify landlord owns the listing
      const listing = await getListingById(input.listingId);
      if (!listing || listing.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      return apps;
    }),

    /** Landlord: get single application */
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const app = await getRentalApplicationById(input.id);
      if (!app || app.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      return app;
    }),

    /**
     * Landlord: manually delete a rental application. Applications are NEVER
     * auto-purged — every submission stays until the landlord explicitly
     * deletes it (audit trail + fair-housing record-keeping). Owner check
     * enforced server-side; no Pro requirement for deleting applications
     * (unlike lease deletion, which is Pro-only).
     */
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const app = await getRentalApplicationById(input.id);
      if (!app || app.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      await deleteRentalApplication(input.id, ctx.user.id);
      return { success: true, deletedId: input.id };
    }),

    /**
     * Landlord: reopen a denied/withdrawn application back to "reviewing".
     *
     * The 2026-05-31 pipeline audit flagged "denied" as a dead-end status
     * with no path back — landlords who made a mistake or whose applicants
     * provided new info had to ask the tenant to resubmit. This endpoint
     * is the explicit undo: only the owning landlord can call it, and it
     * only accepts transitions from terminal-but-undoable statuses
     * ("denied", "withdrawn"). Approval still has to flow through the
     * normal Lease Details modal.
     */
    reopen: protectedProcedure.input(z.object({
      id: z.number(),
      note: z.string().max(500).optional(),
    })).mutation(async ({ ctx, input }) => {
      const app = await getRentalApplicationById(input.id);
      if (!app || app.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (app.status !== "denied" && app.status !== "withdrawn") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot reopen application in status "${app.status}". Use updateStatus instead.`,
        });
      }
      const reopenNote = input.note?.trim()
        ? `[Reopened by landlord]: ${input.note.trim()}`
        : `[Reopened by landlord at ${new Date().toISOString()}]`;
      await updateRentalApplicationStatus(input.id, ctx.user.id, "reviewing", reopenNote);
      return { success: true };
    }),

    /** Landlord: update status — approving auto-creates a draft lease */
    updateStatus: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["reviewing", "approved", "denied", "withdrawn"]),
      notes: z.string().optional(),
      // Required when approving an applicant the AI flagged for decline /
      // manual_review. Captured here so fair-housing audits have a
      // documented justification for every override.
      overrideReason: z.string().optional(),
      overrideRecommendation: z.string().optional(),
      // Landlord-confirmed lease terms. When approving, the client now
      // opens a Lease Details modal so the landlord can verify address,
      // rent, deposit, start date, and term before the draft is created.
      // Falls back to listing-derived defaults if absent.
      leaseDetails: z.object({
        propertyAddress: z.string().min(1),
        monthlyRentCents: z.number().int().positive(),
        securityDepositCents: z.number().int().nonnegative(),
        leaseStartDate: z.string(),
        leaseTerm: z.enum(["6_months", "12_months", "24_months", "36_months", "month_to_month"]),
        // Landlord identity — editable on the Lease Details modal so Pros
        // can use either their personal name or a company/DBA on the lease.
        // Falls back to ctx.user.name and subscription.brandName respectively.
        landlordName: z.string().optional(),
        landlordCompany: z.string().optional(),
        // Accepted rent-payment rails. Surfaced as checkboxes on the modal so
        // the lease document explicitly discloses what the landlord accepts
        // (Keycove portal, ACH, Zelle, Venmo, Cash App, check, money order,
        // cash). paymentMethodsNotes is free-text for portal URLs or carve-outs.
        paymentMethods: z.array(z.string()).optional(),
        paymentMethodsNotes: z.string().optional(),
      }).optional(),
    })).mutation(async ({ ctx, input }) => {
      const override = input.overrideReason && input.overrideRecommendation
        ? { reason: input.overrideReason, recommendation: input.overrideRecommendation }
        : undefined;
      await updateRentalApplicationStatus(input.id, ctx.user.id, input.status, input.notes, override);

      // When denied: email the applicant with a polite notice and a path
      // back via the public application URL. Closes the applicant-side
      // dead-end flagged in the 2026-05-31 pipeline audit. The reopen
      // mutation handles the landlord-side undo separately.
      if (input.status === "denied") {
        const app = await getRentalApplicationById(input.id);
        if (app?.applicantEmail) {
          const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
          const reapplyHref = app.listingId
            ? `${APP_URL}/apply/${app.listingId}`
            : `${APP_URL}/marketplace`;
          sendEmail({
            to: app.applicantEmail,
            subject: "Update on your rental application",
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1B2B5E;margin:0 0 12px">Application update</h2>
              <p>Hi ${app.applicantName ?? "there"},</p>
              <p>Thank you for applying. After review, the landlord has chosen not to move forward with your application at this time.</p>
              <p>Landlords typically consider income, credit, prior rental history, and timing. If your circumstances have changed — or if you'd like to update any information and reapply — you can submit a new application below.</p>
              <p style="margin-top:20px">
                <a href="${reapplyHref}" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
                  Reapply or browse other listings →
                </a>
              </p>
              <p style="color:#6b7280;font-size:13px;margin-top:20px">
                Keycove does not make rental decisions — those are made by the property owner / landlord. If you have questions about the specific reason, please contact them directly.
              </p>
              <p style="color:#9ca3af;font-size:12px;margin-top:16px">Powered by Keycove</p>
            </div>`,
          }).catch(() => {});
        }
      }

      // When approved: auto-create a draft lease pre-filled with the applicant's info
      if (input.status === "approved") {
        const app = await getRentalApplicationById(input.id);
        if (app) {
          // Pull property info from listing — used as defaults if the
          // landlord didn't open the Lease Details modal (e.g. older
          // client, scripted approvals).
          // marketplaceListings stores rent/deposit in WHOLE DOLLARS;
          // leaseAgreements stores them in CENTS. Convert at the boundary.
          let propertyAddress = "Property address TBD";
          let state = app.state ?? "XX";
          let monthlyRentCents = 0;
          let securityDepositCents = 0;
          const listing = await getListingById(app.listingId);
          if (listing) {
            propertyAddress = `${listing.address ?? ""} ${listing.city ?? ""}, ${listing.state ?? ""}`.trim();
            state = listing.state?.slice(0, 2).toUpperCase() ?? state;
            const listingMonthlyDollars = (listing as any).monthlyRent ?? 0;
            const listingDepositDollars = (listing as any).securityDeposit ?? listingMonthlyDollars;
            monthlyRentCents = listingMonthlyDollars * 100;
            securityDepositCents = listingDepositDollars * 100;
          }

          // Landlord-confirmed values from the Lease Details modal take
          // precedence over listing-derived defaults.
          const finalAddress = input.leaseDetails?.propertyAddress ?? propertyAddress;
          const finalRent = input.leaseDetails?.monthlyRentCents ?? monthlyRentCents;
          const finalDeposit = input.leaseDetails?.securityDepositCents ?? securityDepositCents;
          const finalStartDate = input.leaseDetails?.leaseStartDate
            ?? app.moveInDate
            ?? new Date().toISOString().split("T")[0];
          const finalTerm = input.leaseDetails?.leaseTerm ?? "12_months";

          // Landlord display name + company default to the Pro user's account
          // name and their subscription brandName. Modal overrides both so
          // landlords can switch between personal name and DBA per lease.
          const landlordSub = await getUserSubscription(ctx.user.id);
          const finalLandlordName = (input.leaseDetails?.landlordName?.trim())
            || (ctx.user.name ?? "");
          const finalLandlordCompany = (input.leaseDetails?.landlordCompany?.trim())
            || (landlordSub?.brandName ?? "");

          // Combine the checkbox list and any free-text notes into a single
          // human-readable string the template renders directly. Defaults
          // cover what most landlords actually accept; the landlord can edit
          // to drop or add rails per-lease.
          const selectedMethods = input.leaseDetails?.paymentMethods?.filter(Boolean) ?? [
            "Keycove tenant portal",
            "ACH / direct deposit",
            "Check",
            "Money order",
          ];
          const paymentNotes = input.leaseDetails?.paymentMethodsNotes?.trim() ?? "";
          const finalPaymentMethods = paymentNotes
            ? `${selectedMethods.join(", ")} (${paymentNotes})`
            : selectedMethods.join(", ");

          const leaseId = await createLeaseAgreement({
            landlordUserId: ctx.user.id,
            listingId: app.listingId,
            tenantName: app.applicantName,
            tenantEmail: app.applicantEmail,
            tenantPhone: app.applicantPhone ?? undefined,
            state,
            propertyAddress: finalAddress,
            monthlyRent: finalRent,
            securityDeposit: finalDeposit,
            leaseStartDate: finalStartDate,
            leaseTerm: finalTerm,
            accessMethod: "key_pickup",
            status: "draft",
            notes: `Auto-created from application #${app.id}. Review and send when ready.`,
          });

          // Render the state-specific template into a lease_documents row so
          // the Review & Send link (/leases/draft/:id) lands on a populated
          // editor instead of 404. If no template exists for this state and
          // no generic fallback was seeded, we still return the leaseAgreement
          // id and surface a "draft manually" UX path on the client.
          let leaseDocumentId: number | undefined;
          try {
            const templateForState = await getLatestTemplateVersionForState(state);
            if (!templateForState) {
              console.warn("[updateStatus] No lease template seeded for state — skipping auto-draft", {
                state,
                applicationId: app.id,
                leaseAgreementId: leaseId,
              });
            }
            if (templateForState) {
              const citations: string[] = templateForState.citations
                ? JSON.parse(templateForState.citations as string)
                : [];
              // Extract city and zip from the full address so they render
              // inline without requiring the landlord to fill them manually.
              // e.g. "3800 Innsbrook Dr, Memphis, TN, 38115" → Memphis / 38115
              const _cityM = finalAddress.match(/,\s*([^,]+),?\s*[A-Z]{2}[\s,]/);
              const _zipM  = finalAddress.match(/\b(\d{5})\b/);
              const variables: Record<string, unknown> = {
                tenant_name: app.applicantName ?? "",
                tenant_email: app.applicantEmail ?? "",
                tenant_phone: app.applicantPhone ?? "",
                landlord_name: finalLandlordName,
                landlord_company: finalLandlordCompany,
                landlord_email: ctx.user.email ?? "",
                property_address: finalAddress,
                property_city: _cityM?.[1]?.trim() ?? "",
                property_zip: _zipM?.[1] ?? "",
                // renderTemplate formats numeric money fields itself — pass the
                // dollar amount as a number, NOT a pre-formatted string.
                monthly_rent: finalRent / 100,
                security_deposit: finalDeposit / 100,
                lease_start_date: finalStartDate,
                lease_term: finalTerm,
                payment_methods: finalPaymentMethods,
                state,
              };
              const rendered = renderTemplate(templateForState.bodyHtml, variables as any, citations);
              leaseDocumentId = await createLeaseDocument({
                landlordUserId: ctx.user.id,
                leaseAgreementId: leaseId,
                source: "template",
                templateId: templateForState.templateId,
                templateVersionId: templateForState.id,
                renderedHtml: rendered.html,
                variableValues: JSON.stringify(variables),
                status: "draft",
              });
              if (leaseDocumentId) {
                await logLeaseAudit({
                  leaseDocumentId,
                  leaseAgreementId: leaseId,
                  actorUserId: ctx.user.id,
                  event: "draft_created",
                  details: JSON.stringify({
                    source: "approval_auto_create",
                    applicationId: app.id,
                    state,
                  }),
                });
              }
            }
          } catch (e) {
            // Don't block approval — the leaseAgreement row is created and
            // the landlord can manually create a document at /leases/send/wizard.
            console.error("[updateStatus] Template render failed", {
              state,
              applicationId: app.id,
              leaseAgreementId: leaseId,
              error: e instanceof Error ? e.message : String(e),
              stack: e instanceof Error ? e.stack : undefined,
            });
          }

          // Persist the leaseDocument id back on the application ONLY when we
          // actually created a leaseDocuments row. Writing a leaseAgreements.id
          // here would cause /leases/draft/:id (which queries lease_documents)
          // to 404 — so we skip the write entirely when rendering failed.
          if (leaseDocumentId) {
            await setApplicationDraftLeaseId(input.id, ctx.user.id, leaseDocumentId);
          }

          // Auto-send the lease to the tenant immediately on approval — no manual "Send" step.
          const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
          const landlord = await getUserByOpenId(ctx.user.openId);
          await updateLeaseAgreement(leaseId, ctx.user.id, { status: "sent", sentAt: new Date() } as any);
          sendEmail({
            to: app.applicantEmail,
            subject: `Your Lease Agreement is Ready to Sign — ${finalAddress}`,
            html: leaseAgreementEmail({
              tenantName: app.applicantName ?? "Tenant",
              landlordName: landlord?.name ?? finalLandlordName ?? "Your Landlord",
              propertyAddress: finalAddress,
              state,
              monthlyRentDollars: finalRent / 100,
              securityDepositDollars: finalDeposit / 100,
              leaseStartDate: finalStartDate,
              leaseTerm: finalTerm,
              leaseUrl: `${APP_URL}/tenant/sign-lease/${leaseId}`,
            }),
          }).catch(() => {});

          // Notify landlord that the lease was auto-sent
          if (landlord?.email) {
            sendEmail({
              to: landlord.email,
              subject: `✅ Lease Auto-Sent to ${app.applicantName} for Signing`,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
                <h2 style="color:#1B2B5E">Lease Sent — Awaiting Tenant Signature</h2>
                <p>You approved <strong>${app.applicantName}</strong>'s application for <strong>${finalAddress}</strong>.</p>
                <p style="background:#eff6ff;border-left:4px solid #1B2B5E;padding:12px 14px;border-radius:6px">
                  The lease has been automatically sent to <strong>${app.applicantEmail}</strong> for signing. You'll be notified as soon as they sign so you can countersign.
                </p>
                <p style="margin-top:16px">
                  <a href="${APP_URL}/leases" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
                    View Lease →
                  </a>
                </p>
                <p style="color:#9ca3af;font-size:12px;margin-top:16px">Powered by Keycove</p>
              </div>`,
            }).catch(() => {});
          }

          // draftLeaseId is the leaseDocument id (what /leases/draft/:id
          // resolves), not the leaseAgreement id. Returned as null when no
          // template existed for the state so the client can offer a manual
          // draft path instead of routing to a 404.
          return {
            success: true,
            draftLeaseId: leaseDocumentId ?? null,
            leaseAgreementId: leaseId,
          };
        }
      }

      return { success: true };
    }),

    /**
     * Landlord: run an LLM-backed screening review of an application.
     * Produces a structured rubric (income/employment/rental history/identity
     * verdicts + risk factors + a verification checklist) and stores it on
     * the application row so it survives reloads.
     *
     * The model is instructed to flag fair-housing-protected categories as
     * informational only, not as automatic decline triggers — the landlord
     * still owns the decision.
     */
    runAiScreening: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const app = await getRentalApplicationById(input.id);
      if (!app || app.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const listing = await getListingById(app.listingId);
      const targetRentRaw = (listing as any)?.rentAmount ?? (listing as any)?.price ?? "0";
      const targetRent = parseFloat(String(targetRentRaw).replace(/[^0-9.]/g, "")) || 0;
      const propertyAddress = listing
        ? `${listing.address ?? ""} ${listing.city ?? ""}, ${listing.state ?? ""} ${(listing as any).zipCode ?? ""}`.trim()
        : "Unknown property";

      const ScreeningSchema = z.object({
        overallScore: z.number().min(0).max(100).describe("0-100 risk score, higher = higher risk per the prompt scoring bands"),
        recommendation: z.enum(["approve", "approve_with_conditions", "manual_review", "request_more_info", "decline"]),
        recommendationReason: z.string().describe("One-paragraph plain-English summary justifying the recommendation"),
        income: z.object({
          rentToIncomeRatio: z.number().nullable().describe("Monthly rent / monthly gross income. null if unverifiable."),
          affordabilityVerdict: z.enum(["strong", "adequate", "tight", "insufficient", "unverifiable"]),
          notes: z.string(),
        }),
        employment: z.object({
          employerVerificationStatus: z.enum(["likely_real", "likely_fake", "unverifiable", "no_employer"]).describe("Realism check on employer name + occupation. 'likely_fake' if employer name looks fabricated, generic, or contradicts the stated income."),
          tenureConcern: z.enum(["none", "short_tenure", "very_short_tenure", "no_start_date"]),
          notes: z.string(),
        }),
        rentalHistory: z.object({
          landlordReferenceQuality: z.enum(["verifiable", "thin", "missing", "suspicious"]),
          redFlags: z.array(z.string()),
          notes: z.string(),
        }),
        identity: z.object({
          completeness: z.enum(["complete", "minor_gaps", "major_gaps"]),
          notes: z.string(),
        }),
        riskFactors: z.array(z.object({
          severity: z.enum(["high", "medium", "low"]),
          category: z.enum(["affordability", "employment", "rental_history", "identity", "background", "fair_housing_compliance"]),
          title: z.string(),
          detail: z.string(),
          actionRecommended: z.string(),
        })),
        verificationChecklist: z.array(z.object({
          item: z.string(),
          priority: z.enum(["required", "recommended", "optional"]),
          rationale: z.string(),
        })),
      });

      // Compact applicant payload for the model — keep just what's screening-relevant.
      const applicantPayload = {
        applicantName: app.applicantName,
        applicantEmail: app.applicantEmail,
        applicantPhone: app.applicantPhone,
        applicantDob: app.applicantDob,
        currentAddress: app.currentAddress,
        currentLandlordName: app.currentLandlordName,
        currentLandlordPhone: app.currentLandlordPhone,
        currentRent: app.currentRent,
        reasonForLeaving: app.reasonForLeaving,
        employerName: app.employerName,
        employerPhone: app.employerPhone,
        occupation: app.occupation,
        monthlyIncome: app.monthlyIncome,
        moveInDate: app.moveInDate,
        state: app.state,
        hasPets: app.hasPets,
        petDescription: app.petDescription,
        vehicleInfo: app.vehicleInfo,
        emergencyContactName: app.emergencyContactName,
        emergencyContactPhone: app.emergencyContactPhone,
        additionalOccupants: app.additionalOccupants,
        backgroundCheckConsent: app.backgroundCheckConsent,
        creditCheckConsent: app.creditCheckConsent,
        notes: app.notes,
      };

      const systemPrompt = `You are a senior rental application fraud analyst with 20 years of experience working for institutional property management companies across the United States. You have reviewed over 50,000 rental applications and have an encyclopedic knowledge of fraud patterns, synthetic identity schemes, and application manipulation tactics.

Your job is to analyze a rental application and return a structured JSON risk assessment. You MUST always return a complete, valid JSON response — never stop mid-analysis, never return partial output, never say you cannot complete the analysis. If a field has no concerns, return an empty array []. If data is missing, note it as a concern.

FRAUD PATTERNS TO CHECK — be specific, cite exact data from the application:

EMPLOYMENT FRAUD:
- Employer name is too generic (e.g. "ABC Company", "Smith Consulting", "Global Solutions LLC")
- Employer address is a UPS Store, PMB, virtual office, or residential address
- Job title does not match stated income (e.g. "warehouse associate" claiming $12,000/month)
- Employment start date is suspiciously recent (less than 3 months before application)
- Employer phone is a personal cell, Google Voice, or VoIP number
- Self-employment with no supporting documentation offered

INCOME FRAUD:
- Monthly income is less than 3x the monthly rent — flag as insufficient
- Monthly income is more than 10x the monthly rent with no explanation — flag as potentially inflated
- Income source is vague ("misc income", "freelance", "investments") with no detail
- Pay stub upload missing when income is claimed

IDENTITY FRAUD:
- Email address contains random strings, numbers, or does not match the applicant name
- Name and date of birth combination is inconsistent with stated history
- Multiple applications from same IP or same phone number (if detectable)
- Social Security Number format issues (if provided)

ADDRESS FRAUD:
- Current address is a hotel, motel, shelter, or commercial address
- Previous address history has unexplained gaps
- Addresses are in states or cities that conflict with stated employment
- P.O. Box listed as residential address

REFERENCE FRAUD:
- Landlord reference phone number matches applicant phone number
- Reference names are generic or identical across multiple fields
- Reference contact information is incomplete or unverifiable

TIMELINE INCONSISTENCIES:
- Move-out date from previous address conflicts with move-in date at next address
- Employment history has unexplained gaps of more than 6 months
- Application dates, move-in dates, or employment dates are in the future or the distant past

CO-LIVING SPECIFIC (if applicable):
- Applicant does not acknowledge the shared living arrangement
- Number of occupants exceeds what is appropriate for a co-living room
- Applicant lists co-living address as a permanent residence for mail/legal purposes

POSITIVE INDICATORS TO ACKNOWLEDGE:
- Income clearly exceeds 3x rent
- Long stable employment history (2+ years same employer)
- Long rental history with same landlord
- Background check authorized
- Complete application with no missing fields
- Professional email address matching applicant name

SCORING (overallScore is a RISK score from 0–100; HIGHER = HIGHER RISK):
- 0–24: low risk — strong income, verifiable employment, clean rental history, no red flags. Pair with recommendation "approve".
- 25–49: moderate-low risk — minor concerns or missing data. Pair with "approve" or "approve_with_conditions".
- 50–74: moderate-high risk — multiple yellow flags, thin verification, or one significant red flag. Pair with "manual_review" or "approve_with_conditions".
- 75–100: high risk — fraud indicators, insufficient income, fake-looking employer, or pattern of red flags. Pair with "decline".

The score MUST be internally consistent with your recommendation. If you recommend "decline", the score must be >= 60. If you recommend "approve", the score must be <= 40.

Always be specific. Quote the exact data that triggered each concern. Do not make vague statements like "income seems low" — instead say "Stated income of $2,800/month is below the 3x rent threshold of $3,600/month for a $1,200/month unit." Return a complete JSON response every time without exception.`;

      const userPrompt = `PROPERTY
${propertyAddress}
Target monthly rent: $${targetRent.toFixed(2)}

APPLICATION
${JSON.stringify(applicantPayload, null, 2)}`;

      if (!ENV.anthropicApiKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI screening is not configured on this server. Ask your admin to set ANTHROPIC_API_KEY in the environment.",
        });
      }
      const anthropic = createAnthropic({ apiKey: ENV.anthropicApiKey });
      // claude-sonnet-4-6 handles the nested schema reliably and is fast
      // enough that the 80s timeout is rarely needed.
      const MODEL = "claude-sonnet-4-6";
      const startedAt = Date.now();
      console.log("[runAiScreening] starting", {
        appId: input.id,
        model: MODEL,
        promptChars: systemPrompt.length + userPrompt.length,
      });
      try {
        const HARD_TIMEOUT_MS = 80_000;
        const racedTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`HARD_TIMEOUT after ${HARD_TIMEOUT_MS}ms`)), HARD_TIMEOUT_MS);
        });
        const generation = generateObject({
          model: anthropic(MODEL),
          schema: ScreeningSchema,
          system: systemPrompt,
          prompt: userPrompt,
          maxRetries: 1,
        });
        let object: any;
        ({ object } = await Promise.race([generation, racedTimeout]));
        console.log("[runAiScreening] success", {
          appId: input.id,
          elapsedMs: Date.now() - startedAt,
        });
        await updateApplicationAiScreening(input.id, ctx.user.id, object);
        return { success: true, result: object };
      } catch (e: any) {
        console.error("[runAiScreening] failed after", Date.now() - startedAt, "ms");
        // Surface raw error to server logs so we can see what's actually failing
        // (timeouts, schema-validation retries, upstream 4xx/5xx, etc.).
        console.error("[runAiScreening] OpenAI call failed:", {
          name: e?.name,
          message: e?.message,
          cause: e?.cause,
          status: e?.status ?? e?.statusCode,
          responseBody: e?.responseBody ?? e?.response?.data,
          stack: e?.stack,
        });
        // Don't poison the DB with a half-baked result; surface the error to the UI
        // so the user can retry. The deterministic rule-based panel stays as the
        // fallback in the meantime.
        const isAbort = e?.name === "AbortError" || /aborted|timeout|HARD_TIMEOUT/i.test(e?.message ?? "");
        throw new TRPCError({
          code: isAbort ? "TIMEOUT" : "INTERNAL_SERVER_ERROR",
          message: isAbort
            ? "AI screening timed out after 80 seconds. The model may be overloaded — please try again."
            : (e?.message ?? "AI screening failed"),
        });
      }
    }),
  }),

  // ─── Custom Application Templates ──────────────────────────────────────────
  appTemplates: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getCustomTemplatesByUser(ctx.user.id);
    }),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      fileUrl: z.string().optional(),
      fileKey: z.string().optional(),
      templateType: z.enum(["leasely_builtin", "custom_upload"]).default("leasely_builtin"),
      state: z.string().max(2).optional(),
      isDefault: z.boolean().default(false),
    })).mutation(async ({ ctx, input }) => {
      const id = await createCustomTemplate({
        userId: ctx.user.id,
        name: input.name,
        fileUrl: input.fileUrl,
        fileKey: input.fileKey,
        templateType: input.templateType,
        state: input.state,
        isDefault: input.isDefault ? 1 : 0,
      });
      return { id };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await deleteCustomTemplate(input.id, ctx.user.id);
      return { success: true };
    }),
    uploadUrl: protectedProcedure.input(z.object({
      filename: z.string(),
      contentType: z.string(),
    })).mutation(async ({ ctx, input }) => {
      // Client uploads file, gets back a key to store
      const key = `app-templates/${ctx.user.id}/${Date.now()}-${input.filename}`;
      return { key, uploadPath: key };
    }),
  }),

  // ─── Rent Rate Intelligence ─────────────────────────────────────────────────
  rentRates: router({
    /** Get market rent rates for a city/state */
    getByArea: publicProcedure.input(z.object({
      city: z.string(),
      state: z.string().max(2),
      propertyType: z.string().optional(),
    })).query(async ({ input }) => {
      const rates = await getAreaRentRates(input.city, input.state, input.propertyType);
      // If no data in DB, return curated estimates based on national averages
      if (rates.length === 0) {
        const estimates: Record<string, { median: number; min: number; max: number }> = {
          studio: { median: 1200, min: 900, max: 1600 },
          "1br": { median: 1500, min: 1100, max: 2100 },
          "2br": { median: 1900, min: 1400, max: 2800 },
          "3br": { median: 2400, min: 1800, max: 3500 },
          "4br_plus": { median: 3000, min: 2200, max: 4500 },
          room: { median: 800, min: 600, max: 1200 },
          co_living: { median: 900, min: 700, max: 1300 },
        };
        return Object.entries(estimates).map(([type, data]) => ({
          propertyType: type,
          medianRent: data.median,
          minRent: data.min,
          maxRent: data.max,
          sampleSize: 0,
          dataSource: "national_estimate",
          city: input.city,
          state: input.state,
        }));
      }
      return rates;
    }),

    /** Get all rates for a state */
    getByState: publicProcedure.input(z.object({ state: z.string().max(2) })).query(async ({ input }) => {
      return getAreaRentRatesByState(input.state);
    }),
  }),

  // ─── Admin (Keycove superadmin only) ───────────────────────────────────────
  admin: router({
    /**
     * Smoke test: fire a $1 PaymentIntent against a Connect account using
     * the Destination Charges model with Stripe's test token tok_visa.
     * Use to validate live-mode Connect plumbing end-to-end without
     * waiting on a real tenant to pay rent. Admin-only. Returns the
     * PaymentIntent for inspection in the Stripe Dashboard.
     */
    fireTestRentCharge: protectedProcedure
      .input(z.object({
        connectAccountId: z.string().min(1),
        amountCents: z.number().int().min(50).max(1000).default(100),
        platformFeeCents: z.number().int().min(0).max(500).default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const stripe = getStripe();
        if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
        // tok_visa works in test mode; in live mode this will fail with a
        // "raw card data" error — switching to a Stripe test card in live
        // requires a saved PM. Caller can opt to use a real PM by passing
        // confirm:false and confirming client-side, but for smoke testing
        // the most useful signal is whether the transfer_data wiring works.
        const intent = await stripe.paymentIntents.create({
          amount: input.amountCents,
          currency: "usd",
          payment_method_types: ["card"],
          payment_method: "pm_card_visa",
          confirm: true,
          application_fee_amount: input.platformFeeCents > 0 ? input.platformFeeCents : undefined,
          transfer_data: { destination: input.connectAccountId },
          description: `Keycove smoke test — admin ${ctx.user.id}`,
          metadata: {
            leaselySmokeTest: "true",
            firedBy: String(ctx.user.id),
          },
        });
        return {
          id: intent.id,
          status: intent.status,
          amount: intent.amount,
          destination: input.connectAccountId,
          dashboardUrl: `https://dashboard.stripe.com/${process.env.NODE_ENV === "production" ? "" : "test/"}payments/${intent.id}`,
        };
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const [totalUsers, paidUsers, totalListings, totalApplications] = await Promise.all([
        getUserCount(),
        getPaidUserCount(),
        getListingCount(),
        getApplicationCount(),
      ]);
      return { totalUsers, paidUsers, totalListings, totalApplications };
    }),

    // Acquisition-story metrics: recurring MRR/ARR + verifiable on-platform
    // GMV + network size — the numbers a future buyer underwrites.
    businessMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const [totalUsers, paidUsers, totalApplications, m] = await Promise.all([
        getUserCount(), getPaidUserCount(), getApplicationCount(), getBusinessMetrics(),
      ]);
      const mrrCents = paidUsers * 2900; // $29/mo per Pro subscriber
      return {
        totalUsers, paidUsers, totalApplications,
        mrrCents, arrCents: mrrCents * 12,
        ...m,
      };
    }),

    getUsers: protectedProcedure.input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllUsers(input.limit, input.offset);
    }),

    getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllSubscriptions();
    }),

    getAllListings: protectedProcedure.input(z.object({
      limit: z.number().default(200),
    }).optional()).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllListingsAdmin(input?.limit ?? 200);
    }),

    getProCodes: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllProCodes();
    }),

    cancelProCode: protectedProcedure.input(z.object({ code: z.string() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const result = await redeemProCode(input.code); // reuse mark-as-used; we'll add cancel separately
      return { success: true };
    }),

    setUserRole: protectedProcedure.input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await setUserRole(input.userId, input.role);
      return { success: true };
    }),

    // Manual safety-net: flip a user to Pro by email. Use for assisted/phone
    // sales or if someone paid via a raw payment link that couldn't be matched
    // automatically. Mints their CBP brand-kit code too, same as auto-signup.
    adminGrantPro: protectedProcedure.input(z.object({
      email: z.string().email(),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const user = await getUserByEmail(input.email.trim());
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "No Keycove account with that email. Ask them to sign up first, then grant Pro." });
      await upsertUserSubscription({ userId: user.id, tier: "paid", status: "active" });
      let proCode: string | null = null;
      try { proCode = (await getOrCreateProCode(user.id)).code; } catch { /* non-fatal */ }
      return { userId: user.id, name: user.name ?? null, email: user.email ?? null, proCode };
    }),

    /**
     * Bulk-import Creme Agents from the admin's own list. Each row upserts a
     * user account (shell account by email if new — they can claim it later via
     * password reset) and an APPROVED agent profile, so they show in the
     * directory immediately. Idempotent by email; per-row errors never abort
     * the batch. No AI.
     */
    importAgents: protectedProcedure.input(z.object({
      rows: z.array(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        licenseNumber: z.string().optional(),
        bio: z.string().optional(),
        specialties: z.string().optional(),   // comma/semicolon separated
        serviceAreas: z.string().optional(),  // comma/semicolon separated
      })).min(1).max(500),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const { users } = await import("../drizzle/schema");
      const toJson = (s?: string) => {
        const arr = (s ?? "").split(/[,;]/).map(x => x.trim()).filter(Boolean);
        return arr.length ? JSON.stringify(arr) : null;
      };
      let created = 0, updated = 0;
      const errors: { row: number; email: string; message: string }[] = [];
      for (let i = 0; i < input.rows.length; i++) {
        const r = input.rows[i];
        const email = r.email.trim();
        try {
          let user = await getUserByEmail(email);
          const isNew = !user;
          if (!user) {
            await db.insert(users).values({
              openId: randomBytes(16).toString("hex"),
              name: r.name.trim(), email, role: "user",
              emailVerified: 1, loginMethod: "admin_import",
            } as any);
            user = await getUserByEmail(email);
          }
          if (!user) { errors.push({ row: i + 2, email, message: "Could not create account" }); continue; }
          await upsertCremeAgent({
            userId: user.id, status: "approved",
            phone: r.phone?.trim() || undefined,
            licenseNumber: r.licenseNumber?.trim() || undefined,
            bio: r.bio?.trim() || undefined,
            specialties: toJson(r.specialties),
            serviceAreas: toJson(r.serviceAreas),
          } as any);
          if (isNew) created++; else updated++;
        } catch (e: any) {
          errors.push({ row: i + 2, email, message: e?.message || "Import failed" });
        }
      }
      return { created, updated, total: input.rows.length, errors };
    }),

    /**
     * Bulk-import contractors from the admin's list into the public directory.
     * Contractors don't need a user account (userId is optional), so each row
     * just creates an APPROVED contractor profile. Idempotent by email; a
     * unique slug is generated per new profile. No AI.
     */
    importContractors: protectedProcedure.input(z.object({
      rows: z.array(z.object({
        businessName: z.string().min(1),
        ownerName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        licenseNumber: z.string().optional(),
        trades: z.string().optional(),
        serviceAreas: z.string().optional(),
      })).min(1).max(500),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const { contractorProfiles } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const toJson = (s?: string) => { const a = (s ?? "").split(/[,;]/).map(x => x.trim()).filter(Boolean); return a.length ? JSON.stringify(a) : null; };
      const slugify = (s: string) => (s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "contractor");
      let created = 0, updated = 0;
      const errors: { row: number; name: string; message: string }[] = [];
      for (let i = 0; i < input.rows.length; i++) {
        const r = input.rows[i];
        const state = (r.state || "").trim().slice(0, 2).toUpperCase();
        try {
          if (state.length !== 2) { errors.push({ row: i + 2, name: r.businessName, message: "Missing/invalid 2-letter state" }); continue; }
          const data: any = {
            businessName: r.businessName.trim(), ownerName: r.ownerName?.trim() || null,
            email: r.email?.trim() || null, phone: r.phone?.trim() || null,
            city: r.city?.trim() || null, state, zipCode: r.zip?.trim() || null,
            licenseNumber: r.licenseNumber?.trim() || null,
            trades: toJson(r.trades), serviceAreas: toJson(r.serviceAreas),
            status: "approved",
          };
          let existing: any = null;
          if (data.email) {
            const [row] = await db.select({ id: contractorProfiles.id }).from(contractorProfiles).where(eq(contractorProfiles.email, data.email)).limit(1);
            existing = row;
          }
          if (existing) {
            await db.update(contractorProfiles).set(data).where(eq(contractorProfiles.id, existing.id));
            updated++;
          } else {
            data.slug = `${slugify(data.businessName)}-${randomBytes(3).toString("hex")}`;
            await db.insert(contractorProfiles).values(data);
            created++;
          }
        } catch (e: any) {
          errors.push({ row: i + 2, name: r.businessName, message: e?.message || "Import failed" });
        }
      }
      return { created, updated, total: input.rows.length, errors };
    }),

    deleteUser: protectedProcedure.input(z.object({
      userId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete your own account here" });
      await deleteUserById(input.userId);
      return { success: true };
    }),

    getAllApplications: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getRentalApplicationsByLandlord(0);
    }),
    // Affiliate management for admin
    getAllAffiliates: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: affiliates.id, userId: affiliates.userId, referralCode: affiliates.referralCode,
        status: affiliates.status, totalEarned: affiliates.totalEarned, totalPaid: affiliates.totalPaid,
        createdAt: affiliates.createdAt, name: users.name, email: users.email,
      }).from(affiliates).leftJoin(users, eq(affiliates.userId, users.id)).orderBy(desc(affiliates.createdAt));
    }),
    getAllReferrals: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: affiliateReferrals.id, referralCode: affiliateReferrals.referralCode,
        status: affiliateReferrals.status, earningAmountCents: affiliateReferrals.earningAmountCents,
        createdAt: affiliateReferrals.createdAt, convertedAt: affiliateReferrals.convertedAt,
        referredName: users.name, referredEmail: users.email,
      }).from(affiliateReferrals).leftJoin(users, eq(affiliateReferrals.referredUserId, users.id)).orderBy(desc(affiliateReferrals.createdAt));
    }),
    getAllW9s: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return [];
      return db.select().from(w9Submissions).orderBy(w9Submissions.submittedAt);
    }),
    markAffiliatePaid: protectedProcedure.input(z.object({
      affiliateId: z.number(),
      amountCents: z.number(),
      method: z.enum(["stripe", "ach", "check", "other"]),
      referenceId: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(affiliatePayouts).values({
        affiliateId: input.affiliateId,
        amountCents: input.amountCents,
        method: input.method,
        status: "completed",
        referenceId: input.referenceId,
        notes: input.notes,
        paidAt: new Date(),
        taxYear: new Date().getFullYear(),
      });
      await db.update(affiliates).set({ totalPaid: input.amountCents }).where(eq(affiliates.id, input.affiliateId));
      return { success: true };
    }),

    /** Market Rent Intelligence — avg rent by state/zip from real listings */
    getMarketRent: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select({
          state: marketplaceListings.state,
          zip: marketplaceListings.zip,
          avgRent: sql<number>`ROUND(AVG(${marketplaceListings.monthlyRent}), 0)`,
          medianSample: sql<number>`MIN(${marketplaceListings.monthlyRent})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(marketplaceListings)
        .where(and(eq(marketplaceListings.status, "active"), sql`${marketplaceListings.zip} IS NOT NULL`))
        .groupBy(marketplaceListings.state, marketplaceListings.zip)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(50);
      return rows;
    }),

    /** Tenant Score distribution across all applications on the platform */
    getTenantScoreStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return { excellent: 0, good: 0, fair: 0, review: 0, total: 0 };
      const apps = await db.select({
        monthlyIncome: rentalApplications.monthlyIncome,
        employerName: rentalApplications.employerName,
        currentLandlordName: rentalApplications.currentLandlordName,
        emergencyContactName: rentalApplications.emergencyContactName,
        hasPets: rentalApplications.hasPets,
        backgroundCheckConsent: rentalApplications.backgroundCheckConsent,
        status: rentalApplications.status,
        createdAt: rentalApplications.createdAt,
      }).from(rentalApplications).limit(1000);

      let excellent = 0, good = 0, fair = 0, review = 0;
      for (const app of apps) {
        let score = 0;
        const income = parseFloat(app.monthlyIncome ?? "0");
        if (income >= 4500) score += 40;
        else if (income >= 3750) score += 25;
        else if (income >= 3000) score += 10;
        if (app.employerName) score += 15;
        if (app.currentLandlordName) score += 15;
        if (app.emergencyContactName) score += 10;
        if (!app.hasPets) score += 5;
        if (app.backgroundCheckConsent) score += 15;
        if (score >= 80) excellent++;
        else if (score >= 65) good++;
        else if (score >= 50) fair++;
        else review++;
      }
      return { excellent, good, fair, review, total: apps.length };
    }),

    /** Lease outcome stats across the platform */
    getLeaseOutcomes: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select({
          status: leaseAgreements.status,
          count: sql<number>`COUNT(*)`,
          avgRentCents: sql<number>`ROUND(AVG(${leaseAgreements.monthlyRent}), 0)`,
        })
        .from(leaseAgreements)
        .groupBy(leaseAgreements.status);
      return rows;
    }),
  }),

  // ─── Affiliate Program ────────────────────────────────────────────────────
  affiliate: router({
    // Get current user's affiliate status
    getMyAffiliate: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [aff] = await db.select().from(affiliates).where(eq(affiliates.userId, ctx.user.id));
      if (!aff) return null;
      const [w9] = await db.select().from(w9Submissions).where(eq(w9Submissions.affiliateId, aff.id));
      const referrals = await db.select().from(affiliateReferrals).where(eq(affiliateReferrals.affiliateId, aff.id));
      const payouts = await db.select().from(affiliatePayouts).where(eq(affiliatePayouts.affiliateId, aff.id));
      return { affiliate: aff, w9: w9 ?? null, referrals, payouts };
    }),

    // Apply to become an affiliate (creates pending record)
    joinProgram: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [existing] = await db.select().from(affiliates).where(eq(affiliates.userId, ctx.user.id));
      if (existing) return { affiliate: existing, alreadyExists: true };
      // Generate unique referral code
      const baseCode = (ctx.user.name ?? ctx.user.email ?? "ref").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      const referralCode = `${baseCode}${suffix}`;
      const [aff] = await db.insert(affiliates).values({
        userId: ctx.user.id,
        referralCode,
        status: "pending_w9",
        totalEarned: 0,
        totalPaid: 0,
      }).$returningId();
      const [created] = await db.select().from(affiliates).where(eq(affiliates.id, aff.id));
      return { affiliate: created, alreadyExists: false };
    }),

    // Submit W-9 form — activates affiliate account
    submitW9: protectedProcedure.input(z.object({
      legalName: z.string().min(2),
      businessName: z.string().optional(),
      taxClassification: z.enum(["individual", "sole_proprietor", "c_corp", "s_corp", "partnership", "trust", "llc", "other"]),
      address: z.string().min(5),
      city: z.string().min(2),
      state: z.string().length(2),
      zipCode: z.string().min(5),
      tinType: z.enum(["ssn", "ein"]),
      tin: z.string().min(9).max(11), // SSN: XXX-XX-XXXX or EIN: XX-XXXXXXX
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [aff] = await db.select().from(affiliates).where(eq(affiliates.userId, ctx.user.id));
      if (!aff) throw new TRPCError({ code: "NOT_FOUND", message: "Apply to become an affiliate first." });
      const existing = await db.select().from(w9Submissions).where(eq(w9Submissions.affiliateId, aff.id));
      if (existing.length > 0) throw new TRPCError({ code: "CONFLICT", message: "W-9 already submitted." });
      const tinClean = input.tin.replace(/[^0-9]/g, "");
      const tinLast4 = tinClean.slice(-4);
      // Simple XOR obfuscation (in production use proper encryption)
      const tinEncrypted = Buffer.from(tinClean).toString("base64");
      await db.insert(w9Submissions).values({
        affiliateId: aff.id,
        legalName: input.legalName,
        businessName: input.businessName,
        taxClassification: input.taxClassification,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        tinType: input.tinType,
        tinLast4,
        tinEncrypted,
        certifiedAt: new Date(),
      });
      // Activate affiliate
      await db.update(affiliates).set({ status: "active" }).where(eq(affiliates.id, aff.id));

      // ── Notifications ────────────────────────────────────────────────────
      // 1) Admin gets the W-9 on file (summary only — never email full TIN).
      // 2) Affiliate gets their referral code + dashboard link.
      const adminEmail = process.env.ADMIN_EMAIL ?? process.env.FROM_EMAIL?.match(/<([^>]+)>/)?.[1];
      const certifiedAtISO = new Date().toISOString();
      const w9SummaryHtml = `
        <h2 style="font-family:system-ui">New affiliate W-9 — ${input.legalName}</h2>
        <p>Affiliate <strong>${ctx.user.email ?? ctx.user.name ?? `user#${ctx.user.id}`}</strong> just submitted their W-9 and is now <strong>active</strong>.</p>
        <table style="font-family:system-ui;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0"><strong>Legal name</strong></td><td>${input.legalName}</td></tr>
          ${input.businessName ? `<tr><td style="padding:4px 12px 4px 0"><strong>Business / DBA</strong></td><td>${input.businessName}</td></tr>` : ""}
          <tr><td style="padding:4px 12px 4px 0"><strong>Tax classification</strong></td><td>${input.taxClassification}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Address</strong></td><td>${input.address}, ${input.city}, ${input.state} ${input.zipCode}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>TIN type</strong></td><td>${input.tinType.toUpperCase()}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>TIN last 4</strong></td><td>•••-••-${tinLast4}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Certified at</strong></td><td>${certifiedAtISO}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Referral code</strong></td><td><code>${aff.referralCode}</code></td></tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">
          Full TIN is encrypted in DB. Pull it via the admin panel if 1099-NEC issuance requires it.
        </p>
      `;
      if (adminEmail) {
        try {
          await sendEmail({
            to: adminEmail,
            subject: `[Keycove] New affiliate W-9 — ${input.legalName}`,
            html: w9SummaryHtml,
          });
        } catch (err) {
          console.warn("[affiliate.submitW9] admin notification failed:", err);
        }
      }

      // Affiliate confirmation
      if (ctx.user.email) {
        const refLink = `https://keycove.net/?ref=${aff.referralCode}`;
        const affiliateHtml = `
          <h2 style="font-family:system-ui">You're in — your affiliate account is active 🎉</h2>
          <p>Thanks for completing your W-9, ${input.legalName.split(" ")[0]}. Your affiliate account is now active and you can start earning <strong>$50 per landlord</strong> you refer to Keycove Pro.</p>
          <p><strong>Your referral link:</strong><br/>
          <a href="${refLink}" style="color:#00A87C">${refLink}</a></p>
          <p><strong>Your referral code:</strong> <code>${aff.referralCode}</code></p>
          <p style="margin-top:16px">
            <a href="https://keycove.net/affiliate/dashboard" style="display:inline-block;background:#00C896;color:#062018;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700">
              Open my affiliate dashboard
            </a>
          </p>
          <p style="color:#6b7280;font-size:12px;margin-top:24px">
            We'll issue a 1099-NEC at year-end if you earn $2,000 or more (the IRS threshold for 2026+). Your full TIN is encrypted; only the last 4 (${tinLast4}) is shown in our admin panel.
          </p>
        `;
        try {
          await sendEmail({
            to: ctx.user.email,
            subject: "Welcome to the Keycove Affiliate Program — your link is ready",
            html: affiliateHtml,
          });
        } catch (err) {
          console.warn("[affiliate.submitW9] affiliate confirmation failed:", err);
        }
      }

      return { success: true };
    }),

    // Get referral stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [aff] = await db.select().from(affiliates).where(eq(affiliates.userId, ctx.user.id));
      if (!aff) return null;
      const refs = await db.select().from(affiliateReferrals).where(eq(affiliateReferrals.affiliateId, aff.id));
      const paid = refs.filter(r => r.status === "paid");
      const pending = refs.filter(r => r.status === "signed_up");
      return {
        referralCode: aff.referralCode,
        status: aff.status,
        totalReferrals: refs.length,
        paidConversions: paid.length,
        pendingConversions: pending.length,
        totalEarnedCents: aff.totalEarned,
        totalPaidCents: aff.totalPaid,
        pendingPayoutCents: aff.totalEarned - aff.totalPaid,
      };
    }),
  }),

  // ─── Creme Agent ────────────────────────────────────────────────────────────

  cremeAgent: router({
    /** Register as a Creme Agent (creates pending record) */
    register: protectedProcedure.input(z.object({
      // Required — approval unlocks unlimited free listings + leads, so a real
      // estate license number is mandatory to register (admin verifies it).
      licenseNumber: z.string().trim().min(3, "A valid real estate license number is required"),
      bio: z.string().optional(),
      phone: z.string().optional(),
      photoUrl: z.string().url().optional(),
      specialties: z.array(z.string()).optional(),
      serviceAreas: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
      const existing = await getCremeAgentByUserId(ctx.user.id);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already registered" });
      await upsertCremeAgent({
        userId: ctx.user.id,
        licenseNumber: input.licenseNumber,
        bio: input.bio,
        phone: input.phone,
        photoUrl: input.photoUrl,
        specialties: input.specialties ? JSON.stringify(input.specialties) : null,
        serviceAreas: input.serviceAreas ? JSON.stringify(input.serviceAreas) : null,
        status: "pending",
      });
      return { success: true };
    }),

    /** Get all approved agents for public directory */
    getApproved: publicProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
      const agents = await getApprovedCremeAgents({ search: input?.search, limit: 60 });
      return agents.map(a => ({
        ...a,
        specialties: a.specialties ? JSON.parse(a.specialties) : [],
        serviceAreas: a.serviceAreas ? JSON.parse(a.serviceAreas) : [],
      }));
    }),

    /** Get single agent by id for public profile */
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const agent = await getCremeAgentById(input.id);
      if (!agent || agent.status !== "approved") throw new TRPCError({ code: "NOT_FOUND" });
      return {
        ...agent,
        specialties: agent.specialties ? JSON.parse(agent.specialties) : [],
        serviceAreas: agent.serviceAreas ? JSON.parse(agent.serviceAreas) : [],
      };
    }),

    /** Get current user's agent profile */
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      const agent = await getCremeAgentByUserId(ctx.user.id);
      if (!agent) return null;
      return {
        ...agent,
        specialties: agent.specialties ? JSON.parse(agent.specialties) : [],
        serviceAreas: agent.serviceAreas ? JSON.parse(agent.serviceAreas) : [],
      };
    }),

    /** Update agent profile */
    updateProfile: protectedProcedure.input(z.object({
      bio: z.string().optional(),
      phone: z.string().optional(),
      photoUrl: z.string().url().optional(),
      specialties: z.array(z.string()).optional(),
      serviceAreas: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
      const agent = await getCremeAgentByUserId(ctx.user.id);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND" });
      await upsertCremeAgent({
        ...agent,
        bio: input.bio ?? agent.bio,
        phone: input.phone ?? agent.phone,
        photoUrl: input.photoUrl ?? agent.photoUrl,
        specialties: input.specialties ? JSON.stringify(input.specialties) : agent.specialties,
        serviceAreas: input.serviceAreas ? JSON.stringify(input.serviceAreas) : agent.serviceAreas,
      });
      return { success: true };
    }),

    /** Public: request this agent */
    requestAgent: publicProcedure.input(z.object({
      agentId: z.number(),
      clientName: z.string().min(1),
      clientEmail: z.string().email(),
      clientPhone: z.string().optional(),
      leadType: z.enum(["investor","fsbo","novation","fix_flip","general"]).optional(),
      propertyAddress: z.string().optional(),
      message: z.string().optional(),
    })).mutation(async ({ input }) => {
      const agent = await getCremeAgentById(input.agentId);
      if (!agent || agent.status !== "approved") throw new TRPCError({ code: "NOT_FOUND" });
      await createCremeAgentLead({
        agentId: input.agentId,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        leadType: input.leadType ?? "general",
        propertyAddress: input.propertyAddress,
        message: input.message,
        source: "public_request",
      });
      return { success: true };
    }),

    /** Agent: get my leads */
    getMyLeads: protectedProcedure.query(async ({ ctx }) => {
      const agent = await getCremeAgentByUserId(ctx.user.id);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Not an agent" });
      return getLeadsByAgent(agent.id);
    }),

    /** Agent: update lead status */
    updateLeadStatus: protectedProcedure.input(z.object({
      leadId: z.number(),
      status: z.enum(["new","contacted","qualified","closed","lost"]),
      dealValue: z.number().optional(),
      leadType: z.enum(["investor","fsbo","novation","fix_flip","general"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const agent = await getCremeAgentByUserId(ctx.user.id);
      if (!agent) throw new TRPCError({ code: "FORBIDDEN" });
      const leads = await getLeadsByAgent(agent.id);
      const lead = leads.find(l => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "FORBIDDEN" });
      // Rental placements: $350 flat fee. All other deal types: 0.75% of deal value.
      const isRentalPlacement = (input.leadType ?? lead.leadType) === "general";
      let dealValueCents: number | undefined;
      if (input.status === "closed") {
        if (isRentalPlacement) {
          dealValueCents = 35000; // $350 flat fee in cents for rental placements
        } else if (input.dealValue) {
          dealValueCents = input.dealValue * 100;
        }
      }
      await updateLeadStatus(input.leadId, input.status, dealValueCents);
      return { success: true };
    }),

    /** Public: submit review */
    submitReview: publicProcedure.input(z.object({
      agentId: z.number(),
      reviewerName: z.string().min(1),
      reviewerEmail: z.string().email().optional(),
      rating: z.number().min(1).max(5),
      body: z.string().optional(),
    })).mutation(async ({ input }) => {
      const agent = await getCremeAgentById(input.agentId);
      if (!agent || agent.status !== "approved") throw new TRPCError({ code: "NOT_FOUND" });
      await createAgentReview({
        agentId: input.agentId,
        reviewerName: input.reviewerName,
        reviewerEmail: input.reviewerEmail,
        rating: input.rating,
        body: input.body,
        approved: 0,
      });
      return { success: true };
    }),

    /** Public: get approved reviews for an agent */
    getReviews: publicProcedure.input(z.object({ agentId: z.number() })).query(async ({ input }) => {
      return getApprovedReviewsByAgent(input.agentId);
    }),

    // Admin procedures
    getAllAgents: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllCremeAgents();
    }),
    approveAgent: protectedProcedure.input(z.object({ agentId: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updateCremeAgentStatus(input.agentId, "approved");
      return { success: true };
    }),
    rejectAgent: protectedProcedure.input(z.object({ agentId: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updateCremeAgentStatus(input.agentId, "rejected");
      return { success: true };
    }),
    getAllLeads: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllLeads();
    }),
    assignLead: protectedProcedure.input(z.object({ leadId: z.number(), agentId: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await assignLead(input.leadId, input.agentId);
      return { success: true };
    }),
    getAllReviews: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllReviews();
    }),
    moderateReview: protectedProcedure.input(z.object({ reviewId: z.number(), approved: z.boolean() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updateReviewApproval(input.reviewId, input.approved ? 1 : 0);
      return { success: true };
    }),
    deleteReview: protectedProcedure.input(z.object({ reviewId: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await deleteReview(input.reviewId);
      return { success: true };
    }),
  }),

  // ─── Renter Waitlist ─────────────────────────────────────────────────────────

  waitlist: router({
    /** Public: join waitlist */
    join: publicProcedure.input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      preferredArea: z.string().optional(),
      moveInDate: z.string().optional(),
      budgetMin: z.number().optional(),
      budgetMax: z.number().optional(),
      bedroomsNeeded: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      await joinWaitlist(input);
      return { success: true };
    }),

    /** Pro: view waitlist entries */
    getEntries: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (sub?.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Pro subscription required" });
      return getWaitlistEntries();
    }),

    /** Pro: mark contacted */
    markContacted: protectedProcedure.input(z.object({ entryId: z.number() })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (sub?.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      await markWaitlistContacted(input.entryId, ctx.user.id);
      return { success: true };
    }),

    /** Admin: get all entries */
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getWaitlistEntries();
    }),

    /** Admin: delete entry */
    deleteEntry: protectedProcedure.input(z.object({ entryId: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await deleteWaitlistEntry(input.entryId);
      return { success: true };
    }),
  }),

  // ─── FSBO ───────────────────────────────────────────────────────────────────

  fsbo: router({
    /** Public: register as FSBO seller */
    register: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1),
      propertyAddress: z.string().min(5),
      askingPrice: z.number().optional(),
      propertyType: z.enum(["single_family","condo","townhouse","multi_family","land","other"]).optional(),
      bedrooms: z.string().optional(),
      bathrooms: z.string().optional(),
      squareFeet: z.number().optional(),
      description: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      // This delegates to auth register — handled by Express route
      // Here we just create the FSBO profile after account exists
      // The /fsbo-signup page calls /api/auth/register first, then this
      throw new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "Use /api/auth/register then fsbo.createProfile" });
    }),

    createProfile: protectedProcedure.input(z.object({
      propertyAddress: z.string().min(5),
      askingPrice: z.number().optional(),
      propertyType: z.enum(["single_family","condo","townhouse","multi_family","land","other"]).optional(),
      bedrooms: z.string().optional(),
      bathrooms: z.string().optional(),
      squareFeet: z.number().optional(),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const existing = await getFsboByUserId(ctx.user.id);
      if (existing) return { fsboId: existing.id };
      const id = await createFsboProfile({
        userId: ctx.user.id,
        propertyAddress: input.propertyAddress,
        askingPrice: input.askingPrice ? input.askingPrice * 100 : undefined,
        propertyType: input.propertyType,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        squareFeet: input.squareFeet,
        description: input.description,
      });
      return { fsboId: id };
    }),

    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return getFsboByUserId(ctx.user.id);
    }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getFsboByUserId(ctx.user.id);
      if (!profile) return null;
      return { viewCount: profile.viewCount, upgradedToPro: profile.upgradedToPro === 1 };
    }),

    // Admin
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllFsboProfiles();
    }),
  }),

  // ─── SOP Library ────────────────────────────────────────────────────────────

  sop: router({
    markRead: protectedProcedure.input(z.object({ sopId: z.string() })).mutation(async ({ ctx, input }) => {
      await markSopRead(ctx.user.id, input.sopId);
      return { success: true };
    }),
    getMyReads: protectedProcedure.query(async ({ ctx }) => {
      const reads = await getSopReadsByUser(ctx.user.id);
      return reads.map(r => r.sopId);
    }),
    // Admin: see all SOP reads across all users
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllSopReads();
    }),
  }),

  // ─── Staff Training ──────────────────────────────────────────────────────────

  training: router({
    markComplete: protectedProcedure.input(z.object({ videoId: z.string() })).mutation(async ({ ctx, input }) => {
      await markTrainingComplete(ctx.user.id, input.videoId);
      return { success: true };
    }),
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      const progress = await getTrainingProgressByUser(ctx.user.id);
      return progress.map(p => p.videoId);
    }),
  }),

  // ─── Syndication ─────────────────────────────────────────────────────────────

  syndication: router({
    getShares: protectedProcedure.query(async ({ ctx }) => {
      return getSyndicationShares(ctx.user.id);
    }),
    addShare: protectedProcedure.input(z.object({
      listingId: z.string().min(1),
      platform: z.string().min(1),
      shareUrl: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await createSyndicationShare({ ...input, userId: ctx.user.id });
      return { id };
    }),
    deleteShare: protectedProcedure.input(z.object({ shareId: z.number() })).mutation(async ({ ctx, input }) => {
      await deleteSyndicationShare(input.shareId, ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── Growth Dashboard (Admin) ────────────────────────────────────────────────

  growth: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const [userCount, paidCount, listingCount, appCount] = await Promise.all([
        getUserCount(), getPaidUserCount(), getListingCount(), getApplicationCount(),
      ]);
      const allSubs = await getAllSubscriptions();
      const recentUsers = await getAllUsers();
      const waitlist = await getWaitlistEntries();
      const allLeads = await getAllLeads();
      return {
        totalUsers: userCount,
        paidUsers: paidCount,
        totalListings: listingCount,
        totalApplications: appCount,
        totalWaitlist: waitlist.length,
        totalLeads: allLeads.length,
        closedLeads: allLeads.filter(l => l.status === "closed").length,
        monthlyRevenueCents: paidCount * 2900,
        recentSignups: recentUsers.slice(0, 10),
      };
    }),
  }),

  // ─── Handyman / Contractor Directory ─────────────────────────────────────────
  contractors: router({
    // Public: browse approved contractors
    list: publicProcedure.input(z.object({
      state: z.string().optional(),
      trade: z.string().optional(),
      search: z.string().optional(),
      featured: z.boolean().optional(),
    }).optional()).query(async ({ input }) => {
      return getApprovedContractors(input ?? {});
    }),

    // Public: get single contractor by ID
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const contractor = await getContractorById(input.id);
      if (!contractor || contractor.status !== "approved") throw new TRPCError({ code: "NOT_FOUND" });
      await incrementContractorViews(input.id);
      return contractor;
    }),

    // Public: get single contractor by slug
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const contractor = await getContractorBySlug(input.slug);
      if (!contractor || contractor.status !== "approved") throw new TRPCError({ code: "NOT_FOUND" });
      await incrementContractorViews(contractor.id);
      return contractor;
    }),

    // Public: get approved reviews for a contractor
    getReviews: publicProcedure.input(z.object({ contractorId: z.number() })).query(async ({ input }) => {
      return getApprovedContractorReviews(input.contractorId);
    }),

    // Public: submit a review
    submitReview: publicProcedure.input(z.object({
      contractorId: z.number(),
      reviewerName: z.string().min(2),
      reviewerEmail: z.string().email().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().optional(),
      body: z.string().optional(),
      jobType: z.string().optional(),
      jobDate: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await createContractorReview({
        ...input,
        reviewerUserId: ctx.user?.id ?? null,
        approved: 0,
      });
      return { id };
    }),

    // Public: submit a lead / contact request
    submitLead: publicProcedure.input(z.object({
      contractorId: z.number(),
      clientName: z.string().min(2),
      clientEmail: z.string().email().optional(),
      clientPhone: z.string().optional(),
      jobType: z.string().optional(),
      propertyAddress: z.string().optional(),
      message: z.string().optional(),
      urgency: z.enum(["flexible", "within_week", "within_month", "emergency"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await createContractorLead({
        ...input,
        clientUserId: ctx.user?.id ?? null,
        status: "new",
      });
      return { id };
    }),

    // Protected: contractor registers / updates their own profile
    upsertMyProfile: protectedProcedure.input(z.object({
      businessName: z.string().min(2),
      ownerName: z.string().optional(),
      slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/).optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      city: z.string().optional(),
      state: z.string().length(2),
      zipCode: z.string().optional(),
      serviceRadius: z.number().optional(),
      serviceAreas: z.array(z.string()).optional(),
      bio: z.string().optional(),
      photoUrl: z.string().optional(),
      bannerUrl: z.string().optional(),
      yearsInBusiness: z.number().optional(),
      licenseNumber: z.string().optional(),
      trades: z.array(z.string()).optional(),
      specialties: z.array(z.string()).optional(),
      availableWeekdays: z.boolean().optional(),
      availableWeekends: z.boolean().optional(),
      emergencyService: z.boolean().optional(),
      hourlyRateMin: z.number().optional(),
      hourlyRateMax: z.number().optional(),
      freeEstimates: z.boolean().optional(),
      portfolioPhotos: z.array(z.string()).optional(),
      socialFacebook: z.string().optional(),
      socialInstagram: z.string().optional(),
      socialLinkedin: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const data: any = {
        ...input,
        serviceAreas: input.serviceAreas ? JSON.stringify(input.serviceAreas) : undefined,
        trades: input.trades ? JSON.stringify(input.trades) : undefined,
        specialties: input.specialties ? JSON.stringify(input.specialties) : undefined,
        portfolioPhotos: input.portfolioPhotos ? JSON.stringify(input.portfolioPhotos) : undefined,
        availableWeekdays: input.availableWeekdays !== undefined ? (input.availableWeekdays ? 1 : 0) : undefined,
        availableWeekends: input.availableWeekends !== undefined ? (input.availableWeekends ? 1 : 0) : undefined,
        emergencyService: input.emergencyService !== undefined ? (input.emergencyService ? 1 : 0) : undefined,
        freeEstimates: input.freeEstimates !== undefined ? (input.freeEstimates ? 1 : 0) : undefined,
      };
      const id = await upsertContractorProfile(ctx.user.id, data);
      return { id };
    }),

    // Protected: get my contractor profile
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return getContractorByUserId(ctx.user.id);
    }),

    // Protected: get my leads
    getMyLeads: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getContractorByUserId(ctx.user.id);
      if (!profile) return [];
      return getContractorLeads(profile.id);
    }),

    // Admin: list all contractors
    adminList: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllContractors();
    }),

    // Admin: update status
    adminUpdateStatus: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "rejected", "suspended"]),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updateContractorStatus(input.id, input.status);
      return { success: true };
    }),

    // Admin: approve/reject review
    adminUpdateReview: protectedProcedure.input(z.object({
      id: z.number(),
      approved: z.number().min(0).max(1),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updateContractorReviewApproval(input.id, input.approved);
      return { success: true };
    }),

    // Admin: get all reviews
    adminGetReviews: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllContractorReviews();
    }),

    // Admin: get all leads
    adminGetLeads: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllContractorLeads();
    }),
  }),

  // ─── LEASE AGREEMENTS ────────────────────────────────────────────────────────
  leases: router({
    /** Landlord: list all leases */
    list: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      return getLeasesByLandlord(ctx.user.id);
    }),

    /** Landlord: create a draft lease */
    create: protectedProcedure.input(z.object({
      listingId: z.number().optional(),
      tenantName: z.string().min(1),
      tenantEmail: z.string().email(),
      tenantPhone: z.string().optional(),
      state: z.string().length(2),
      propertyAddress: z.string().min(1),
      monthlyRent: z.number().positive(),           // in cents
      securityDeposit: z.number().min(0).default(0),
      leaseStartDate: z.string(),
      leaseEndDate: z.string().optional(),
      leaseTerm: z.enum(["month_to_month","6_months","12_months","24_months","36_months"]).default("12_months"),
      accessMethod: z.enum(["lockbox","key_pickup","in_person","other"]).default("key_pickup"),
      lockboxCode: z.string().optional(),
      accessInstructions: z.string().optional(),
      notes: z.string().optional(),
      // Off-platform-paid flags: landlord already collected deposit/first
      // month via Zelle/check/cash. Setting these makes the lease skip the
      // Stripe payment email after countersign and go straight to ACTIVE +
      // move-in instructions.
      firstMonthPaid: z.boolean().optional(),
      depositPaid: z.boolean().optional(),
      offPlatformPaymentMethod: z.string().max(40).optional(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      const { firstMonthPaid, depositPaid, offPlatformPaymentMethod, ...rest } = input;

      const noteTrail = (firstMonthPaid || depositPaid)
        ? `[${new Date().toISOString().slice(0, 10)}] Pre-marked as collected off-platform${offPlatformPaymentMethod ? ` via ${offPlatformPaymentMethod}` : ""}: ${[firstMonthPaid && "first month", depositPaid && "deposit"].filter(Boolean).join(" + ")}`
        : "";

      const id = await createLeaseAgreement({
        ...rest,
        landlordUserId: ctx.user.id,
        status: "draft",
        firstMonthPaid: firstMonthPaid ? 1 : 0,
        depositPaid: depositPaid ? 1 : 0,
        notes: noteTrail ? (rest.notes ? `${rest.notes}\n${noteTrail}` : noteTrail) : rest.notes,
      } as any);

      // Mirror pre-marked payments into accounting ledger so the books stay
      // in sync without the landlord double-entering.
      if (id && (firstMonthPaid || depositPaid)) {
        const today = new Date().toISOString().slice(0, 10);
        try {
          if (firstMonthPaid) {
            await createAccountingEntry({
              userId: ctx.user.id,
              type: "income",
              category: "rent" as any,
              amount: input.monthlyRent,
              date: today,
              description: `First month's rent — ${input.tenantName}${offPlatformPaymentMethod ? ` (${offPlatformPaymentMethod})` : ""}`,
              propertyAddress: input.propertyAddress,
              listingId: input.listingId ?? undefined,
            } as any);
          }
          if (depositPaid && input.securityDeposit > 0) {
            await createAccountingEntry({
              userId: ctx.user.id,
              type: "income",
              category: "deposit" as any,
              amount: input.securityDeposit,
              date: today,
              description: `Security deposit — ${input.tenantName}${offPlatformPaymentMethod ? ` (${offPlatformPaymentMethod})` : ""}`,
              propertyAddress: input.propertyAddress,
              listingId: input.listingId ?? undefined,
            } as any);
          }
        } catch { /* ledger best-effort */ }
      }

      return { id };
    }),

    /**
     * Duplicate an existing lease into a fresh draft. Copies the property +
     * terms but clears tenant identity, dates, signatures, and payment state
     * so the landlord can quickly clone a unit for the next tenant.
     */
    duplicate: protectedProcedure.input(z.object({
      leaseId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      const src = await getLeaseById(input.leaseId);
      if (!src || src.landlordUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const id = await createLeaseAgreement({
        landlordUserId: ctx.user.id,
        listingId: src.listingId ?? undefined,
        // Tenant identity reset so it doesn't accidentally double-send
        tenantName: "",
        tenantEmail: "",
        tenantPhone: undefined,
        // Property + terms cloned
        state: src.state,
        propertyAddress: src.propertyAddress,
        monthlyRent: src.monthlyRent,
        securityDeposit: src.securityDeposit ?? 0,
        leaseTerm: src.leaseTerm ?? "12_months",
        accessMethod: src.accessMethod ?? "key_pickup",
        lockboxCode: src.lockboxCode ?? undefined,
        accessInstructions: src.accessInstructions ?? undefined,
        notes: src.notes ?? undefined,
        // Dates intentionally blank — landlord must set new lease window
        leaseStartDate: "",
        leaseEndDate: undefined,
        status: "draft",
      });
      return { id };
    }),

    /** Landlord: send lease to tenant (status → sent) */
    send: protectedProcedure.input(z.object({ leaseId: z.number() })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      await updateLeaseAgreement(input.leaseId, ctx.user.id, { status: "sent", sentAt: new Date() });

      const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
      const landlord = await getUserByOpenId(ctx.user.openId);
      const signUrl = `${APP_URL}/tenant/sign-lease/${input.leaseId}`;

      sendEmail({
        to: lease.tenantEmail,
        subject: `Your Lease Agreement is Ready — ${lease.propertyAddress}`,
        html: leaseAgreementEmail({
          tenantName: lease.tenantName,
          landlordName: landlord?.name ?? "Your Landlord",
          propertyAddress: lease.propertyAddress,
          state: lease.state,
          monthlyRentDollars: lease.monthlyRent / 100,
          securityDepositDollars: (lease.securityDeposit ?? 0) / 100,
          leaseStartDate: lease.leaseStartDate,
          leaseTerm: lease.leaseTerm ?? "12_months",
          leaseUrl: signUrl,
        }),
      }).catch(() => {});

      return { success: true };
    }),

    /**
     * Re-fire the tenant-facing signing email for a lease that's already been
     * sent but not yet acted on. Does NOT modify status — only refreshes
     * `sentAt` and re-sends the email. Useful when the tenant lost the
     * original, the email landed in spam, or the address needs nudging.
     * Allowed for statuses where the tenant action is still pending:
     * `sent`, `tenant_signed`, `awaiting_payment`.
     */
    resend: protectedProcedure.input(z.object({ leaseId: z.number() })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      if (!["sent", "tenant_signed", "awaiting_payment"].includes(lease.status)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Resend is only available while the tenant has not yet completed signing + payment.",
        });
      }

      const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
      const landlord = await getUserByOpenId(ctx.user.openId);

      // Always bump sentAt so the landlord can see when the last reminder went out.
      await updateLeaseAgreement(input.leaseId, ctx.user.id, { sentAt: new Date() } as any);

      // Choose the email payload based on what the tenant still owes us.
      if (lease.status === "sent") {
        const signUrl = `${APP_URL}/tenant/sign-lease/${input.leaseId}`;
        sendEmail({
          to: lease.tenantEmail,
          subject: `Reminder: Your Lease Agreement is Ready — ${lease.propertyAddress}`,
          html: leaseAgreementEmail({
            tenantName: lease.tenantName,
            landlordName: landlord?.name ?? "Your Landlord",
            propertyAddress: lease.propertyAddress,
            state: lease.state,
            monthlyRentDollars: lease.monthlyRent / 100,
            securityDepositDollars: (lease.securityDeposit ?? 0) / 100,
            leaseStartDate: lease.leaseStartDate,
            leaseTerm: lease.leaseTerm ?? "12_months",
            leaseUrl: signUrl,
          }),
        }).catch(() => {});
      } else {
        // Tenant signed but hasn't paid yet — re-send the payment link.
        const emailParam = encodeURIComponent(lease.tenantEmail);
        const rentPayUrl = `${APP_URL}/lease-pay/${lease.id}?email=${emailParam}&kind=rent`;
        sendEmail({
          to: lease.tenantEmail,
          subject: `Reminder: Pay to Activate Your Lease — ${lease.propertyAddress}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Friendly Reminder — Payment Pending</h2>
            <p>Hi ${lease.tenantName}, this is a quick nudge — your signed lease for <strong>${lease.propertyAddress}</strong> is waiting on first month's rent${lease.securityDeposit ? " and the security deposit" : ""} before your landlord countersigns.</p>
            <p style="margin-top:16px"><a href="${rentPayUrl}" style="background:#F5A623;color:#3A2410;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700">Complete Payment</a></p>
          </div>`,
        }).catch(() => {});
      }

      return { success: true, status: lease.status, resentAt: new Date().toISOString() };
    }),

    /**
     * Tenant signs lease (public — tenant uses sign link).
     * NEW FLOW: Tenant signs FIRST, but the lease is NOT yet fully executed.
     * Status moves to `tenant_signed` → `awaiting_payment`. Tenant must pay
     * first month's rent + security deposit before the landlord countersigns.
     */
    sign: publicProcedure.input(z.object({
      leaseId: z.number(),
      tenantEmail: z.string().email(),
      signatureName: z.string().trim().min(2, "Type your full legal name to sign.").max(120),
    })).mutation(async ({ ctx, input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.tenantEmail.toLowerCase() !== input.tenantEmail.toLowerCase()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid lease or email mismatch." });
      }
      if (lease.status !== "sent") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Lease is not in a signable state." });
      }

      const now = new Date();
      // NEW FLOW: tenant signs first → landlord countersigns next → payment link
      // (or key pickup if Pro logged payment manually). Status moves to
      // `tenant_signed` and the LANDLORD is prompted to countersign — the
      // tenant does not receive a payment link until after the countersign.
      const signerIp = (ctx as any)?.req?.headers?.["x-forwarded-for"]?.toString().split(",")[0].trim()
        ?? (ctx as any)?.req?.ip
        ?? null;
      await updateLeaseAgreement(lease.id, lease.landlordUserId, {
        status: "tenant_signed",
        tenantSignedAt: now,
        tenantSignatureName: input.signatureName.trim(),
        tenantSignatureIp: signerIp ?? undefined,
      } as any);

      const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";

      // Notify landlord — your turn to countersign. NO payment link sent yet.
      const landlord = await getUserById(lease.landlordUserId);
      if (landlord?.email) {
        sendEmail({
          to: landlord.email,
          subject: `Tenant Signed — Countersign to Continue (${lease.propertyAddress})`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Tenant Has Signed — Your Countersignature Is Needed</h2>
            <p><strong>${lease.tenantName}</strong> just signed the lease for <strong>${lease.propertyAddress}</strong>.</p>
            <p style="background:#eff6ff;border-left:4px solid #1B2B5E;padding:12px 14px;border-radius:6px">
              <strong>Next step — your countersignature:</strong> Once you countersign, Keycove will automatically email the tenant a payment link for first month&apos;s rent${lease.securityDeposit ? " + security deposit" : ""}.
              If you&apos;ve already collected payment off-platform, log it first and the tenant will instead receive their move-in / key-pickup instructions.
            </p>
            <p style="margin-top:16px"><a href="${APP_URL}/leases" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700">Open Leases &amp; Countersign</a></p>
          </div>`,
        }).catch(() => {});
      }

      // Light confirmation to the tenant — no payment link yet.
      sendEmail({
        to: lease.tenantEmail,
        subject: `Lease Signed — Awaiting Landlord Countersignature (${lease.propertyAddress})`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2B5E">Thanks for Signing!</h2>
          <p>Hi ${lease.tenantName}, your signature for <strong>${lease.propertyAddress}</strong> is locked in.</p>
          <p>Your landlord will countersign next. As soon as they do, we&apos;ll email you next steps — either a secure payment link for first month&apos;s rent${lease.securityDeposit ? " and the security deposit" : ""}, or — if your landlord already has your payment on file — your move-in instructions.</p>
          <p style="margin-top:16px;font-size:13px;color:#666">You can sign in to your tenant portal any time to check status.</p>
        </div>`,
      }).catch(() => {});

      // In-app notification for landlord
      try {
        await createNotification({
          userId: lease.landlordUserId,
          type: "lease_signed",
          title: `Tenant signed · ${lease.propertyAddress}`,
          body: `${lease.tenantName} signed. Your countersignature is needed next.`,
          link: "/leases",
        });
      } catch (err) {
        console.warn("[leases.sign] notification insert failed:", err);
      }

      // Auto-provision the tenant portal account so the tenant can pay rent,
      // file repair requests, and view documents without a second manual
      // invite step. Idempotent: if a portal account already exists for this
      // email, we reuse it and just refresh the magic-link token.
      try {
        let portalAccountId: number;
        const existing = await getTenantByEmail(lease.tenantEmail);
        if (existing) {
          portalAccountId = existing.id;
        } else {
          const parseDateString = (s?: string | null) =>
            s ? new Date(`${s}T12:00:00Z`) : undefined;
          portalAccountId = await createTenantAccount({
            landlordUserId: lease.landlordUserId,
            leaseId: lease.id,
            listingId: lease.listingId ?? undefined,
            name: lease.tenantName,
            email: lease.tenantEmail,
            phone: lease.tenantPhone ?? undefined,
            monthlyRentCents: lease.monthlyRent,
            leaseStart: parseDateString(lease.leaseStartDate),
            leaseEnd: parseDateString(lease.leaseEndDate),
          });
        }
        // Magic-link token (30-day TTL). Refreshed on every sign so the
        // welcome email always carries a working link, even for legacy
        // accounts whose token expired.
        const portalToken = randomBytes(32).toString("hex");
        const portalTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await updateTenantToken(portalAccountId, portalToken, portalTokenExpiresAt);

        const portalSignInUrl = `${APP_URL}/tenant-portal/signin?token=${portalToken}`;
        sendEmail({
          to: lease.tenantEmail,
          subject: `Your Tenant Portal is Ready — ${lease.propertyAddress}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Welcome to Your Tenant Portal</h2>
            <p>Hi ${lease.tenantName}, your tenant portal for <strong>${lease.propertyAddress}</strong> is now active.</p>
            <p>From the portal you can:</p>
            <ul>
              <li>Pay rent (one-time or autopay)</li>
              <li>Submit repair / maintenance requests</li>
              <li>View your lease documents and payment history</li>
              <li>Message your landlord</li>
            </ul>
            <p style="margin-top:20px"><a href="${portalSignInUrl}" style="background:#1B2B5E;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700">Sign in to Your Portal</a></p>
            <p style="font-size:12px;color:#666;margin-top:16px">This sign-in link is valid for 30 days. If it expires, request a new one from the portal sign-in page using the email on your lease.</p>
          </div>`,
        }).catch(() => {});
      } catch (err) {
        console.warn("[leases.sign] tenant portal auto-provision failed:", err);
      }

      // Sync the signed lease into the landlord's CRM portfolio (crm_property +
      // crm_tenant + active crm_lease) so it shows up in /crm with a rent
      // schedule, auto late fees, and accounting — unifying the marketplace
      // sign path with the CRM/portal path. Idempotent: skips if this landlord
      // already has a CRM tenant with this email. Never blocks signing.
      try {
        const db = await getDb();
        if (db) {
          const { and, eq } = await import("drizzle-orm");
          const { crmTenants } = await import("../drizzle/schema");
          const [existing] = lease.tenantEmail
            ? await db.select({ id: crmTenants.id }).from(crmTenants)
                .where(and(eq(crmTenants.userId, lease.landlordUserId), eq(crmTenants.email, lease.tenantEmail))).limit(1)
            : [undefined as any];
          if (!existing) {
            const [firstName, ...rest] = (lease.tenantName || "Tenant").trim().split(/\s+/);
            const propertyId = await createCrmProperty({
              userId: lease.landlordUserId,
              address: lease.propertyAddress || "Address TBD",
              state: lease.state || undefined,
              propertyType: "apartment" as any,
              totalUnits: 1,
            } as any);
            const crmTenantId = await createCrmTenant({
              userId: lease.landlordUserId, crmPropertyId: propertyId,
              firstName: firstName || "Tenant", lastName: rest.join(" "),
              email: lease.tenantEmail || undefined, phone: lease.tenantPhone ?? undefined,
              moveInDate: lease.leaseStartDate ?? undefined,
              monthlyRent: lease.monthlyRent, securityDeposit: lease.securityDeposit ?? undefined,
              status: "active" as any,
            } as any);
            const hasEnd = !!(lease.leaseEndDate && String(lease.leaseEndDate).trim());
            await createCrmLease({
              userId: lease.landlordUserId, crmPropertyId: propertyId, crmTenantId,
              startDate: lease.leaseStartDate ?? new Date().toISOString().slice(0, 10),
              endDate: hasEnd ? lease.leaseEndDate! : (lease.leaseStartDate ?? new Date().toISOString().slice(0, 10)),
              monthlyRent: lease.monthlyRent, securityDeposit: lease.securityDeposit ?? undefined,
              lateFeeCents: (lease as any).lateFeeCents ?? 5000, lateFeeGraceDays: (lease as any).lateFeeGraceDays ?? 5,
              leaseType: (hasEnd ? "fixed_term" : "month_to_month") as any,
              status: "active" as any,
              notes: `Signed via marketplace application. Lease #${lease.id}.`,
            } as any);
          }
        }
      } catch (err) {
        console.warn("[leases.sign] CRM portfolio sync failed:", err);
      }

      return { success: true };
    }),

    /**
     * Mark a lease as paid (called by Stripe webhook or admin tooling once
     * first month + deposit clear). Triggers email to landlord prompting
     * them to countersign.
     */
    markPaid: publicProcedure.input(z.object({
      leaseId: z.number(),
      kind: z.enum(["rent", "deposit", "both"]),
    })).mutation(async ({ input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease) throw new TRPCError({ code: "NOT_FOUND" });

      const patch: Record<string, unknown> = {};
      if (input.kind === "rent" || input.kind === "both") patch.firstMonthPaid = 1;
      if (input.kind === "deposit" || input.kind === "both") patch.depositPaid = 1;

      // Compute resulting paid state
      const willHaveRent = patch.firstMonthPaid === 1 || lease.firstMonthPaid === 1;
      const needsDeposit = (lease.securityDeposit ?? 0) > 0;
      const willHaveDeposit = !needsDeposit || patch.depositPaid === 1 || lease.depositPaid === 1;

      // Status branching:
      //  - If landlord ALREADY countersigned (status === "awaiting_payment"
      //    or "signed") and payment now clears → status = "active" and tenant
      //    gets their key-pickup / move-in email.
      //  - If landlord hasn't countersigned yet (legacy flow) → status = "paid"
      //    and landlord gets the "ready to countersign" prompt.
      const alreadyCountersigned = !!lease.landlordSignedAt;
      if (willHaveRent && willHaveDeposit) {
        patch.status = alreadyCountersigned ? "active" : "paid";
        patch.paidAt = new Date();
      }
      await updateLeaseAgreement(lease.id, lease.landlordUserId, patch as any);

      if (willHaveRent && willHaveDeposit) {
        const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";

        if (alreadyCountersigned) {
          // Landlord already countersigned. Payment clearing means the lease
          // is now fully active → send tenant their move-in / key-pickup email.
          const accessMethod = lease.accessMethod ?? "key_pickup";
          const accessBlock = (() => {
            if (accessMethod === "lockbox" && lease.lockboxCode) {
              return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px">
                <strong>Lockbox code:</strong> <span style="font-family:monospace;font-size:18px;letter-spacing:2px">${lease.lockboxCode}</span>
                ${lease.accessInstructions ? `<br/><span style="font-size:13px;color:#374151">${lease.accessInstructions}</span>` : ""}
              </p>`;
            }
            if (accessMethod === "key_pickup") {
              return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px"><strong>Key pickup:</strong> ${lease.accessInstructions ?? "Your landlord will contact you to arrange key pickup."}</p>`;
            }
            if (accessMethod === "in_person") {
              return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px"><strong>In-person handoff:</strong> ${lease.accessInstructions ?? "Your landlord will meet you at the property to hand off keys."}</p>`;
            }
            return lease.accessInstructions
              ? `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px"><strong>Move-in instructions:</strong> ${lease.accessInstructions}</p>`
              : "";
          })();

          sendEmail({
            to: lease.tenantEmail,
            subject: `Payment Received — Move-In Details Inside (${lease.propertyAddress})`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1B2B5E">Welcome Home — Your Lease Is Active</h2>
              <p>Hi ${lease.tenantName}, your payment has cleared and your lease for <strong>${lease.propertyAddress}</strong> is now fully active.</p>
              ${accessBlock}
              <p style="margin-top:16px"><a href="${APP_URL}/tenant/dashboard" style="background:#00C896;color:#0a2a1f;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700">Open Tenant Portal</a></p>
            </div>`,
          }).catch(() => {});
        } else {
          // Legacy: landlord hasn't countersigned yet → prompt them.
          const landlord = await getUserById(lease.landlordUserId);
          if (landlord?.email) {
            sendEmail({
              to: landlord.email,
              subject: `Payment Received — Countersign to Execute Lease (${lease.propertyAddress})`,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
                <h2 style="color:#1B2B5E">Payment Received — Action Required</h2>
                <p><strong>${lease.tenantName}</strong> has paid first month&apos;s rent${needsDeposit ? " and the security deposit" : ""}.</p>
                <p>The lease is ready for your countersignature to be fully executed.</p>
                <p style="margin-top:16px"><a href="${APP_URL}/leases" style="background:#00C896;color:#0a2a1f;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700">Countersign Lease</a></p>
              </div>`,
            }).catch(() => {});
          }
        }
      }

      return { success: true, status: patch.status ?? lease.status };
    }),

    /**
     * Landlord-confirmed payment receipt — for off-platform payments (Zelle,
     * Venmo, Cash App, ACH, check, money order, cash). This is the manual
     * counterpart to the Stripe webhook-driven `markPaid` above. Same state
     * machine, same countersign-prompt email, just authenticated as the
     * landlord and audit-tagged so we know it wasn't from Stripe.
     */
    confirmPaymentReceived: protectedProcedure.input(z.object({
      leaseId: z.number(),
      kind: z.enum(["rent", "deposit", "both"]),
      method: z.string().min(1).max(40).optional(),
      note: z.string().max(500).optional(),
    })).mutation(async ({ ctx, input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const patch: Record<string, unknown> = {};
      if (input.kind === "rent" || input.kind === "both") patch.firstMonthPaid = 1;
      if (input.kind === "deposit" || input.kind === "both") patch.depositPaid = 1;

      const willHaveRent = patch.firstMonthPaid === 1 || lease.firstMonthPaid === 1;
      const needsDeposit = (lease.securityDeposit ?? 0) > 0;
      const willHaveDeposit = !needsDeposit || patch.depositPaid === 1 || lease.depositPaid === 1;
      const alreadyCountersigned = !!lease.landlordSignedAt;

      if (willHaveRent && willHaveDeposit) {
        patch.status = alreadyCountersigned ? "active" : "paid";
        patch.paidAt = new Date();
      }

      // Append the confirmation to the lease notes so there's a paper trail
      // for non-Stripe payments (method + landlord-supplied reference).
      const stamp = new Date().toISOString().slice(0, 10);
      const trail = `[${stamp}] Manual payment confirmation — ${input.kind}${input.method ? ` via ${input.method}` : ""}${input.note ? ` (${input.note})` : ""}`;
      patch.notes = lease.notes ? `${lease.notes}\n${trail}` : trail;

      await updateLeaseAgreement(lease.id, lease.landlordUserId, patch as any);

      // Mirror manual payment into accounting ledger as income entries so the
      // Accounting page stays in sync without the landlord double-entering.
      try {
        const today = new Date().toISOString().slice(0, 10);
        if (input.kind === "rent" || input.kind === "both") {
          await createAccountingEntry({
            userId: lease.landlordUserId,
            type: "income",
            category: "rent" as any,
            amount: lease.monthlyRent,
            date: today,
            description: `First month's rent — ${lease.tenantName}${input.method ? ` (${input.method})` : ""}${input.note ? ` — ${input.note}` : ""}`,
            propertyAddress: lease.propertyAddress,
            listingId: lease.listingId ?? undefined,
          } as any);
        }
        if ((input.kind === "deposit" || input.kind === "both") && (lease.securityDeposit ?? 0) > 0) {
          await createAccountingEntry({
            userId: lease.landlordUserId,
            type: "income",
            category: "deposit" as any,
            amount: lease.securityDeposit ?? 0,
            date: today,
            description: `Security deposit — ${lease.tenantName}${input.method ? ` (${input.method})` : ""}${input.note ? ` — ${input.note}` : ""}`,
            propertyAddress: lease.propertyAddress,
            listingId: lease.listingId ?? undefined,
          } as any);
        }
      } catch (e) {
        console.warn("[confirmPaymentReceived] auto-accounting entry failed:", e);
      }

      // Notification branching mirrors the Stripe-webhook markPaid path:
      //  - Landlord already countersigned → tenant gets the key-pickup email.
      //  - Not yet countersigned → landlord gets the "ready to countersign" email.
      if (willHaveRent && willHaveDeposit) {
        const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";

        if (alreadyCountersigned) {
          const accessMethod = lease.accessMethod ?? "key_pickup";
          const accessBlock = (() => {
            if (accessMethod === "lockbox" && lease.lockboxCode) {
              return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px">
                <strong>Lockbox code:</strong> <span style="font-family:monospace;font-size:18px;letter-spacing:2px">${lease.lockboxCode}</span>
                ${lease.accessInstructions ? `<br/><span style="font-size:13px;color:#374151">${lease.accessInstructions}</span>` : ""}
              </p>`;
            }
            if (accessMethod === "key_pickup") {
              return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px"><strong>Key pickup:</strong> ${lease.accessInstructions ?? "Your landlord will contact you to arrange key pickup."}</p>`;
            }
            if (accessMethod === "in_person") {
              return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px"><strong>In-person handoff:</strong> ${lease.accessInstructions ?? "Your landlord will meet you at the property to hand off keys."}</p>`;
            }
            return lease.accessInstructions
              ? `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px"><strong>Move-in instructions:</strong> ${lease.accessInstructions}</p>`
              : "";
          })();

          sendEmail({
            to: lease.tenantEmail,
            subject: `Payment Received — Move-In Details Inside (${lease.propertyAddress})`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1B2B5E">Welcome Home — Your Lease Is Active</h2>
              <p>Hi ${lease.tenantName}, your landlord confirmed your payment${input.method ? ` (via ${input.method})` : ""} and your lease for <strong>${lease.propertyAddress}</strong> is now fully active.</p>
              ${accessBlock}
              <p style="margin-top:16px"><a href="${APP_URL}/tenant/dashboard" style="background:#00C896;color:#0a2a1f;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700">Open Tenant Portal</a></p>
            </div>`,
          }).catch(() => {});
        } else {
          const landlord = await getUserById(lease.landlordUserId);
          if (landlord?.email) {
            sendEmail({
              to: landlord.email,
              subject: `Payment Confirmed — Countersign to Execute Lease (${lease.propertyAddress})`,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
                <h2 style="color:#1B2B5E">Payment Confirmed — Action Required</h2>
                <p>You confirmed receipt of first month&apos;s rent${needsDeposit ? " and security deposit" : ""} from <strong>${lease.tenantName}</strong>${input.method ? ` (via ${input.method})` : ""}.</p>
                <p>The lease is ready for your countersignature to be fully executed.</p>
                <p style="margin-top:16px"><a href="${APP_URL}/leases" style="background:#00C896;color:#0a2a1f;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700">Countersign Lease</a></p>
              </div>`,
            }).catch(() => {});
          }
        }
      }

      return {
        success: true,
        status: patch.status ?? lease.status,
        firstMonthPaid: willHaveRent,
        depositPaid: willHaveDeposit,
      };
    }),

    // ─────────────────────────────────────────────────────────────────────────
    // RECURRING RENT + ARREARS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Enable Stripe autopay on a lease. Creates a SetupIntent client_secret
     * the tenant uses to authorise a payment method. Once confirmed, the
     * webhook stores the PaymentMethodId on the lease + creates the
     * Subscription billing on rentDueDay each month.
     *
     * The tenant goes through this once at signing. Pro accounts collect
     * Keycove's platform fee on each charge.
     */
    createAutopaySetup: publicProcedure.input(z.object({
      leaseId: z.number(),
      tenantEmail: z.string().email(),
    })).mutation(async ({ input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.tenantEmail.toLowerCase() !== input.tenantEmail.toLowerCase()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Lease + email mismatch." });
      }
      const stripe = getStripe();
      if (!stripe) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Stripe not configured." });

      // Reuse or create the Stripe customer
      let customerId = lease.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: lease.tenantEmail,
          name: lease.tenantName,
          metadata: { leaseAgreementId: String(lease.id) },
        });
        customerId = customer.id;
        await updateLeaseAgreement(lease.id, lease.landlordUserId, { stripeCustomerId: customerId } as any);
      }

      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        // ACH first so the tenant defaults to bank → ~$5 cap on recurring
        // rent vs ~$45 on card for a $1500/mo lease.
        payment_method_types: ["us_bank_account", "card"],
        payment_method_options: {
          us_bank_account: {
            financial_connections: {
              permissions: ["payment_method"],
            },
            verification_method: "automatic" as const,
          },
        },
        usage: "off_session",
        metadata: { leaseAgreementId: String(lease.id) },
      });

      return {
        clientSecret: setupIntent.client_secret,
        customerId,
      };
    }),

    /**
     * Called by client after Stripe SetupIntent succeeds. Stores the payment
     * method on the lease, starts the Subscription, and back-fills the first
     * rent_payments row for the current month.
     */
    activateAutopay: publicProcedure.input(z.object({
      leaseId: z.number(),
      tenantEmail: z.string().email(),
      paymentMethodId: z.string().min(1),
    })).mutation(async ({ input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.tenantEmail.toLowerCase() !== input.tenantEmail.toLowerCase()) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const stripe = getStripe();
      if (!stripe || !lease.stripeCustomerId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Setup must run first." });
      }

      // Attach + set as default
      await stripe.paymentMethods.attach(input.paymentMethodId, { customer: lease.stripeCustomerId });
      await stripe.customers.update(lease.stripeCustomerId, {
        invoice_settings: { default_payment_method: input.paymentMethodId },
      });

      await updateLeaseAgreement(lease.id, lease.landlordUserId, {
        stripePaymentMethodId: input.paymentMethodId,
        autopayEnabled: 1,
        autopayActivatedAt: new Date(),
      } as any);

      return { success: true };
    }),

    /** List rent payment ledger for a lease (landlord-facing). */
    listRentPayments: protectedProcedure.input(z.object({
      leaseId: z.number(),
    })).query(async ({ ctx, input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      return listRentPaymentsByLease(input.leaseId);
    }),

    /**
     * Landlord records an off-platform rent payment (Zelle/Venmo/Cash App/check/cash).
     * Auto-creates the rent_payments row for that period if it doesn't exist yet,
     * else marks it paid.
     */
    recordRentPayment: protectedProcedure.input(z.object({
      leaseId: z.number(),
      periodMonth: z.string().regex(/^\d{4}-\d{2}-01$/), // first of month
      amountCents: z.number().int().positive(),
      method: z.string().min(1).max(60),
      note: z.string().max(500).optional(),
    })).mutation(async ({ ctx, input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const existing = await getRentPaymentByLeasePeriod(input.leaseId, input.periodMonth);
      const dueDate = `${input.periodMonth.slice(0, 7)}-${String(lease.rentDueDay ?? 1).padStart(2, "0")}`;

      if (existing) {
        await updateRentPayment(existing.id, {
          status: "paid",
          paidAt: new Date(),
          paidAmountCents: input.amountCents,
          paymentMethod: input.method,
          notes: input.note ? `${existing.notes ?? ""}\n${input.note}`.trim() : existing.notes,
        });
        return { success: true, id: existing.id };
      }

      const id = await createRentPayment({
        leaseAgreementId: lease.id,
        landlordUserId: lease.landlordUserId,
        tenantEmail: lease.tenantEmail,
        periodMonth: input.periodMonth,
        dueDate,
        amountCents: lease.monthlyRent,
        status: "paid",
        paidAt: new Date() as any,
        paidAmountCents: input.amountCents,
        paymentMethod: input.method,
        notes: input.note,
      });

      // Auto-mirror the rent payment into the accounting ledger as an income
      // entry so the Accounting page (and tax PDFs) stay in sync without the
      // landlord having to log the same payment twice. Best-effort — failure
      // here must not roll back the rent_payments insert.
      try {
        await createAccountingEntry({
          userId: lease.landlordUserId,
          type: "income",
          category: "rent" as any,
          amount: input.amountCents,
          date: new Date().toISOString().slice(0, 10),
          description: `Rent received — ${lease.tenantName} — ${input.periodMonth.slice(0, 7)} (${input.method})${input.note ? ` — ${input.note}` : ""}`,
          propertyAddress: lease.propertyAddress,
          listingId: lease.listingId ?? undefined,
        } as any);
      } catch (e) {
        console.warn("[recordRentPayment] auto-accounting entry failed:", e);
      }

      return { success: true, id };
    }),

    /** Edit an existing rent payment record (change status, amount, method, notes). */
    editRentPayment: protectedProcedure.input(z.object({
      paymentId: z.number().int(),
      status: z.enum(["pending", "paid", "late", "skipped", "partial"]).optional(),
      paidAmountCents: z.number().int().positive().optional(),
      paymentMethod: z.string().max(60).optional(),
      notes: z.string().max(500).optional(),
    })).mutation(async ({ ctx, input }) => {
      const payment = await getRentPaymentById(input.paymentId);
      if (!payment || payment.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      const update: Record<string, unknown> = {};
      if (input.status !== undefined) {
        update.status = input.status;
        if (input.status === "paid" && !payment.paidAt) update.paidAt = new Date();
      }
      if (input.paidAmountCents !== undefined) update.paidAmountCents = input.paidAmountCents;
      if (input.paymentMethod !== undefined) update.paymentMethod = input.paymentMethod;
      if (input.notes !== undefined) update.notes = input.notes;
      await updateRentPayment(input.paymentId, update as any);
      return { success: true };
    }),

    /**
     * Arrears dashboard query — every lease the landlord owns plus how many
     * months overdue + total dollars outstanding. Computed from the
     * rent_payments table; assumes one bill per month from leaseStartDate.
     */
    arrearsByLandlord: protectedProcedure.query(async ({ ctx }) => {
      const leases = await getLeasesByLandlord(ctx.user.id);
      const today = new Date();
      const out: Array<{
        leaseId: number; tenantName: string; tenantEmail: string; propertyAddress: string;
        monthlyRent: number; monthsBehind: number; amountOwedCents: number; lastPaidPeriod: string | null;
        rentDueDay: number; unpaidPeriods: string[];
      }> = [];

      for (const lease of leases) {
        if (!["signed", "active", "awaiting_payment", "paid"].includes(lease.status)) continue;
        const payments = await listRentPaymentsByLease(lease.id);
        const paidPeriods = new Set(payments.filter(p => p.status === "paid").map(p => p.periodMonth));
        // Compute every month from leaseStartDate to today
        const start = new Date(`${lease.leaseStartDate}T12:00:00Z`);
        if (Number.isNaN(start.getTime())) continue;
        let monthsBehind = 0;
        let lastPaid: string | null = null;
        const unpaidPeriods: string[] = [];
        const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        const cutoff = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        while (cur.getTime() <= cutoff.getTime()) {
          const period = `${cur.getUTCFullYear()}-${String(cur.getUTCMonth() + 1).padStart(2, "0")}-01`;
          if (paidPeriods.has(period)) lastPaid = period;
          else { monthsBehind += 1; unpaidPeriods.push(period); }
          cur.setUTCMonth(cur.getUTCMonth() + 1);
        }
        if (monthsBehind > 0) {
          out.push({
            leaseId: lease.id,
            tenantName: lease.tenantName,
            tenantEmail: lease.tenantEmail,
            propertyAddress: lease.propertyAddress,
            monthlyRent: lease.monthlyRent,
            monthsBehind,
            amountOwedCents: monthsBehind * lease.monthlyRent,
            lastPaidPeriod: lastPaid,
            rentDueDay: lease.rentDueDay ?? 1,
            unpaidPeriods,
          });
        }
      }
      return out;
    }),

    /**
     * Landlord countersigns the lease. NEW FLOW (2026-05):
     * - Required precondition: tenant has signed (status === "tenant_signed").
     * - After countersign we branch:
     *     a) If first month + deposit are already marked paid (Pro logged
     *        them off-platform) → status="active", email tenant their
     *        move-in / key-pickup instructions.
     *     b) Otherwise → status="awaiting_payment", email tenant the secure
     *        payment link for first month's rent + deposit.
     * - We also still accept legacy "paid" status for any lease that went
     *   through the old workflow (tenant paid before countersign).
     */
    landlordSign: protectedProcedure.input(z.object({
      leaseId: z.number(),
      signatureName: z.string().trim().min(2, "Type your full legal name to countersign.").max(120),
    })).mutation(async ({ ctx, input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!["tenant_signed", "awaiting_payment", "paid"].includes(lease.status)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Lease cannot be countersigned until the tenant has signed.",
        });
      }

      const now = new Date();
      const signerIp = (ctx as any)?.req?.headers?.["x-forwarded-for"]?.toString().split(",")[0].trim()
        ?? (ctx as any)?.req?.ip
        ?? null;

      // Branch on whether payment was already logged off-platform.
      const needsDeposit = (lease.securityDeposit ?? 0) > 0;
      const paymentSatisfied = (lease.firstMonthPaid ?? 0) === 1 && (!needsDeposit || (lease.depositPaid ?? 0) === 1);

      await updateLeaseAgreement(lease.id, ctx.user.id, {
        status: paymentSatisfied ? "active" : "awaiting_payment",
        landlordSignedAt: now,
        landlordSignatureName: input.signatureName.trim(),
        landlordSignatureIp: signerIp ?? undefined,
        signedAt: now,
        // Mark the payment-request emails as sent when we send them below
        ...(paymentSatisfied ? {} : {
          firstMonthPaymentSent: 1,
          depositPaymentSent: needsDeposit ? 1 : 0,
        }),
      } as any);

      const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
      const leaseStartDateFormatted = lease.leaseStartDate
        ? new Date(`${lease.leaseStartDate}T12:00:00Z`).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
          })
        : undefined;

      if (paymentSatisfied) {
        // ── PATH A: payment already collected → send key-pickup / move-in email
        const accessMethod = lease.accessMethod ?? "key_pickup";
        const accessBlock = (() => {
          if (accessMethod === "lockbox" && lease.lockboxCode) {
            return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px">
              <strong>Lockbox code:</strong> <span style="font-family:monospace;font-size:18px;letter-spacing:2px">${lease.lockboxCode}</span>
              ${lease.accessInstructions ? `<br/><span style="font-size:13px;color:#374151">${lease.accessInstructions}</span>` : ""}
            </p>`;
          }
          if (accessMethod === "key_pickup") {
            return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px">
              <strong>Key pickup:</strong> ${lease.accessInstructions ?? "Your landlord will contact you to arrange key pickup."}
            </p>`;
          }
          if (accessMethod === "in_person") {
            return `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px">
              <strong>In-person handoff:</strong> ${lease.accessInstructions ?? "Your landlord will meet you at the property to hand off keys."}
            </p>`;
          }
          return lease.accessInstructions
            ? `<p style="background:#ecfdf5;border-left:4px solid #10B981;padding:12px 14px;border-radius:6px"><strong>Move-in instructions:</strong> ${lease.accessInstructions}</p>`
            : "";
        })();

        sendEmail({
          to: lease.tenantEmail,
          subject: `Lease Fully Executed — Move-In Details Inside (${lease.propertyAddress})`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Welcome Home — Lease Is Fully Executed</h2>
            <p>Hi ${lease.tenantName},</p>
            <p>Your landlord has countersigned the lease for <strong>${lease.propertyAddress}</strong>.${leaseStartDateFormatted ? ` Your move-in date is <strong>${leaseStartDateFormatted}</strong>.` : ""} Because your payment is already on file, you can go straight to move-in.</p>
            ${accessBlock}
            <p style="margin-top:16px"><a href="${APP_URL}/tenant/dashboard" style="background:#00C896;color:#0a2a1f;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700">Open Tenant Portal</a></p>
          </div>`,
        }).catch(() => {});
      } else {
        // ── PATH B: payment not yet collected → send payment link
        const emailParam = encodeURIComponent(lease.tenantEmail);
        const rentPayUrl = `${APP_URL}/lease-pay/${lease.id}?email=${emailParam}&kind=rent`;
        const depositPayUrl = needsDeposit ? `${APP_URL}/lease-pay/${lease.id}?email=${emailParam}&kind=deposit` : undefined;

        sendEmail({
          to: lease.tenantEmail,
          subject: `Lease Countersigned — Final Step: Pay to Move In (${lease.propertyAddress})`,
          html: leaseSignedPaymentEmail({
            tenantName: lease.tenantName,
            propertyAddress: lease.propertyAddress,
            monthlyRentDollars: lease.monthlyRent / 100,
            securityDepositDollars: (lease.securityDeposit ?? 0) / 100,
            rentPaymentUrl: rentPayUrl,
            depositPaymentUrl: depositPayUrl ?? rentPayUrl,
            accessMethod: lease.accessMethod ?? "key_pickup",
            lockboxCode: lease.lockboxCode ?? undefined,
            accessInstructions: lease.accessInstructions ?? undefined,
            leaseStartDateFormatted,
          }),
        }).catch(() => {});
      }

      return { success: true, branch: paymentSatisfied ? "key_pickup" : "payment_link" };
    }),

    /** Landlord: update a draft lease */
    update: protectedProcedure.input(z.object({
      leaseId: z.number(),
      tenantName: z.string().trim().min(2).max(255).optional(),
      tenantEmail: z.string().email().optional(),
      tenantPhone: z.string().optional(),
      monthlyRent: z.number().optional(),
      securityDeposit: z.number().optional(),
      leaseStartDate: z.string().optional(),
      leaseEndDate: z.string().optional(),
      accessMethod: z.enum(["lockbox","key_pickup","in_person","other"]).optional(),
      lockboxCode: z.string().optional(),
      accessInstructions: z.string().optional(),
      notes: z.string().optional(),
      // Intentionally restricted: "signed" and "active" can ONLY be reached via
      // landlordSign / dedicated workflow endpoints so a "Fully executed" badge
      // is never set without an actual signature timestamp. Use `terminate` or
      // `expire` flows for late-stage transitions, not this catch-all update.
      status: z.enum(["draft","sent","expired","terminated"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const { leaseId, ...data } = input;
      // Inline Stripe-subscription cancel on terminal status flips.
      // The daily expiry cron is the safety net; this is the
      // immediate-action path so a tenant whose lease is terminated
      // mid-month isn't billed again at 12:01 AM on the 1st while we
      // wait for the next sweep. Only fires when status is actually
      // transitioning to a terminal state AND the lease has an
      // outstanding subscription — both checks make this safe to
      // re-run, since cancelling an already-canceled sub is a no-op
      // we tolerate (see expiryScheduler.ts).
      if (input.status === "terminated" || input.status === "expired") {
        const existing = await getLeaseById(leaseId);
        if (existing && existing.landlordUserId === ctx.user.id && existing.stripeSubscriptionId) {
          const stripe = getStripe();
          if (stripe) {
            try {
              await stripe.subscriptions.cancel(existing.stripeSubscriptionId);
            } catch (err: any) {
              const msg = err?.message ?? String(err);
              if (!/No such|canceled/i.test(msg)) {
                console.warn(`[leases.update] inline sub cancel failed for lease ${leaseId}:`, msg);
              }
            }
          }
          // Mirror the cron's behaviour: drop autopay so the dashboard
          // stops showing "Active" billing indicators for a lease that
          // is no longer live.
          (data as any).autopayEnabled = 0;
        }
      }
      await updateLeaseAgreement(leaseId, ctx.user.id, data as any);
      return { success: true };
    }),

    /**
     * One-off adjustment to the tenant's NEXT autopay rent invoice — e.g. a
     * partial-rent concession for a single month. The recurring rent amount
     * is left untouched; we add a one-off Stripe invoice item that Stripe
     * rolls into the tenant's upcoming subscription invoice: a credit
     * (negative) when the adjusted amount is below normal rent, or an extra
     * charge (positive) when above. The credit/charge flows through the same
     * destination charge to the landlord's bank. Pro-only.
     */
    adjustNextRent: protectedProcedure.input(z.object({
      leaseId: z.number(),
      adjustedAmountCents: z.number().int().min(0),
      reason: z.string().trim().max(200).optional(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Rent adjustments are a Pro feature." });
      }
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (!lease.autopayEnabled || !lease.stripeSubscriptionId || !lease.stripeCustomerId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This lease has no active autopay subscription to adjust. Adjust manually in the ledger instead." });
      }

      const delta = input.adjustedAmountCents - lease.monthlyRent;
      if (delta === 0) {
        return { applied: false, deltaCents: 0, message: "Adjusted amount matches the normal rent — nothing to change." };
      }

      const stripe = getStripe();
      if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });

      const label = delta < 0
        ? `Rent credit — ${lease.propertyAddress}${input.reason ? ` (${input.reason})` : ""}`
        : `Rent adjustment — ${lease.propertyAddress}${input.reason ? ` (${input.reason})` : ""}`;

      // Negative amount = credit applied to the subscription's next invoice.
      await stripe.invoiceItems.create({
        customer: lease.stripeCustomerId,
        subscription: lease.stripeSubscriptionId,
        amount: delta,
        currency: "usd",
        description: label,
      });

      // Audit trail on the lease notes.
      const stamp = new Date().toISOString().slice(0, 10);
      const deltaDollars = (Math.abs(delta) / 100).toFixed(2);
      const targetDollars = (input.adjustedAmountCents / 100).toFixed(2);
      const trail = `[${stamp}] Next rent charge ${delta < 0 ? "reduced" : "increased"} by $${deltaDollars} (one cycle → $${targetDollars})${input.reason ? ` — ${input.reason}` : ""}.`;
      const notes = lease.notes ? `${lease.notes}\n${trail}` : trail;
      await updateLeaseAgreement(lease.id, ctx.user.id, { notes });

      return {
        applied: true,
        deltaCents: delta,
        adjustedAmountCents: input.adjustedAmountCents,
        message: delta < 0
          ? `Credited $${deltaDollars} off the next invoice — tenant will be charged $${targetDollars}.`
          : `Added $${deltaDollars} to the next invoice — tenant will be charged $${targetDollars}.`,
      };
    }),

    /**
     * Unwind a lease back to a fresh draft state. Clears every signature
     * artifact, payment flag, and payment-link record, then resets status
     * to "draft". Audit-trailed in notes. Use when a lease ended up in a
     * bad state (e.g. someone clicked the legacy countersign button without
     * actually signing, or the tenant email needs to be retargeted before
     * re-sending). Stripe state (customer/subscription IDs) is intentionally
     * preserved so a previously-charged tenant isn't double-billed if you
     * later resend; clear those separately via the lease detail dialog if
     * the lease is going to a different tenant.
     */
    resetToDraft: protectedProcedure.input(z.object({
      leaseId: z.number(),
      reason: z.string().trim().max(500).optional(),
    })).mutation(async ({ ctx, input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const stamp = new Date().toISOString().slice(0, 10);
      const trail = `[${stamp}] Lease reset to draft by landlord${input.reason ? ` — ${input.reason}` : ""}. Prior status: ${lease.status}.`;
      const notes = lease.notes ? `${lease.notes}\n${trail}` : trail;

      await updateLeaseAgreement(lease.id, ctx.user.id, {
        status: "draft",
        sentAt: null,
        signedAt: null,
        tenantSignedAt: null,
        landlordSignedAt: null,
        tenantSignatureName: null,
        landlordSignatureName: null,
        tenantSignatureIp: null,
        landlordSignatureIp: null,
        paidAt: null,
        firstMonthPaymentSent: 0,
        depositPaymentSent: 0,
        firstMonthPaid: 0,
        depositPaid: 0,
        notes,
      } as any);

      return { success: true };
    }),

    /**
     * Hard-delete a lease — only the owning landlord may delete, and only
     * paid Pro members. Cleans up dependent rows (lease_documents, rent_payments,
     * lease_audit_log) first to avoid FK violations. Use this when a lease was
     * created in error or needs to be permanently removed; if you only want to
     * re-send to a different tenant, prefer `resetToDraft` instead.
     */
    delete: protectedProcedure.input(z.object({
      leaseId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Pro subscription required to delete leases." });

      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Cascade cleanup. Order matters because rent_payments + lease_audit_logs
      // + lease_documents all FK to lease_agreements.id.
      try {
        const { rentPayments, leaseDocuments, leaseAuditLogs, leaseAgreements } = await import("../drizzle/schema");
        await db.delete(rentPayments).where(eq(rentPayments.leaseAgreementId, lease.id));
        await db.delete(leaseAuditLogs).where(eq(leaseAuditLogs.leaseAgreementId, lease.id));
        await db.delete(leaseDocuments).where(eq(leaseDocuments.leaseAgreementId, lease.id));
        await db.delete(leaseAgreements).where(and(eq(leaseAgreements.id, lease.id), eq(leaseAgreements.landlordUserId, ctx.user.id)));
      } catch (e) {
        console.error("[leases.delete] cascade delete failed", e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Delete failed — please contact support." });
      }

      return { success: true, deletedLeaseId: lease.id };
    }),

    /** Tenant: get leases by email (portal auth) */
    getByTenantEmail: publicProcedure.input(z.object({
      tenantToken: z.string(),
    })).query(async ({ input }) => {
      const tenant = await getTenantByToken(input.tenantToken);
      if (!tenant) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getLeasesByTenantEmail(tenant.email);
    }),

    /**
     * Tenant: fetch lease summary by id + email match (no auth needed —
     * tenant arrives via emailed link). Used by the Lease Pay page.
     */
    getForPayment: publicProcedure.input(z.object({
      leaseId: z.number(),
      tenantEmail: z.string().email(),
    })).query(async ({ input }) => {
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.tenantEmail.toLowerCase() !== input.tenantEmail.toLowerCase()) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return {
        id: lease.id,
        propertyAddress: lease.propertyAddress,
        tenantName: lease.tenantName,
        monthlyRent: lease.monthlyRent,
        securityDeposit: lease.securityDeposit ?? 0,
        status: lease.status,
        firstMonthPaid: lease.firstMonthPaid ?? 0,
        depositPaid: lease.depositPaid ?? 0,
      };
    }),

    /**
     * Tenant: create a Stripe Subscription Checkout session that sets up
     * recurring rent autopay AND collects the security deposit + first
     * month's rent on the first invoice.
     *
     * Keycove is recurring-only — there are no one-time tenant payments.
     * The Subscription bills monthly rent on the rent_due_day each cycle.
     * The webhook records each `invoice.paid` event into rent_payments.
     *
     * `kind` is kept for backwards compatibility with the UI but is now a
     * no-op — every checkout creates the full subscription. Once it's been
     * set up once for a given lease, this endpoint short-circuits to the
     * Stripe Customer Portal so the tenant can edit their card.
     */
    createPaymentSession: publicProcedure
      .input(z.object({
        leaseId: z.number(),
        tenantEmail: z.string().email(),
        kind: z.enum(["rent", "deposit"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const lease = await getLeaseById(input.leaseId);
        if (!lease || lease.tenantEmail.toLowerCase() !== input.tenantEmail.toLowerCase()) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Lease not found" });
        }
        if (lease.status !== "awaiting_payment" && lease.status !== "tenant_signed") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This lease is not awaiting payment." });
        }
        const sub = await getUserSubscription(lease.landlordUserId);
        if (!sub || !sub.stripeConnectAccountId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Landlord has not set up payments yet — please contact them." });
        }
        const stripe = getStripe();
        if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });

        const monthlyRentCents = lease.monthlyRent;
        const depositCents = lease.securityDeposit ?? 0;
        if (monthlyRentCents <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Monthly rent must be set on the lease." });

        // Pro landlords: 0% platform fee. Free tier: 1% Keycove platform fee.
        const isProLandlord = sub.tier === "paid";
        const applicationFeePercent = isProLandlord ? 0 : 1;

        // Subscription = recurring rent. First invoice will include the
        // recurring rent line PLUS any non-recurring line_items below
        // (which Stripe converts to invoice items on the first invoice).
        const lineItems: any[] = [];
        if (!lease.firstMonthPaid) {
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: { name: `Monthly rent — ${lease.propertyAddress}` },
              unit_amount: monthlyRentCents,
              recurring: { interval: "month" as const },
            },
            quantity: 1,
          });
        }
        if (depositCents > 0 && !lease.depositPaid) {
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: { name: `Security deposit — ${lease.propertyAddress}` },
              unit_amount: depositCents,
            },
            quantity: 1,
          });
        }

        if (lineItems.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nothing to collect — deposit and first month are already paid." });
        }

        // Order matters — Stripe Checkout displays methods in this order.
        // Bank account FIRST so tenants default to ACH (~$5 cap) instead of
        // card (2.9% + $0.30). On a $1500 rent that's $5 vs ~$45.
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["us_bank_account", "card"],
          payment_method_options: {
            // Instant Plaid verification via Financial Connections — no
            // 2-day micro-deposit wait. Falls back to micro-deposits if
            // the tenant's bank isn't Plaid-supported.
            us_bank_account: {
              financial_connections: {
                permissions: ["payment_method", "balances"],
              },
              verification_method: "automatic" as const,
            },
          },
          mode: "subscription",
          customer_email: lease.tenantEmail,
          line_items: lineItems,
          subscription_data: {
            application_fee_percent: applicationFeePercent,
            transfer_data: { destination: sub.stripeConnectAccountId },
            metadata: {
              leaselyLeaseId: String(lease.id),
              landlordUserId: String(lease.landlordUserId),
            },
          },
          success_url: `${APP_URL}/lease-pay/${lease.id}/success?email=${encodeURIComponent(lease.tenantEmail)}`,
          cancel_url: `${APP_URL}/lease-pay/${lease.id}?email=${encodeURIComponent(lease.tenantEmail)}`,
          metadata: {
            leaselyLeaseId: String(lease.id),
            leaselyAutopaySetup: "true",
          },
        });

        return { sessionUrl: session.url };
      }),

    /** Landlord: update a draft lease's key fields and re-render the lease document */
    updateDraft: protectedProcedure.input(z.object({
      leaseId: z.number(),
      leaseStartDate: z.string().optional(),
      leaseEndDate: z.string().optional(),
      monthlyRent: z.number().positive().optional(),
      securityDeposit: z.number().min(0).optional(),
      leaseTerm: z.enum(["month_to_month", "6_months", "12_months", "24_months", "36_months"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const lease = await getLeaseById(input.leaseId);
      if (!lease || lease.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (lease.status !== "draft") throw new TRPCError({ code: "BAD_REQUEST", message: "Can only edit draft leases" });

      await updateLeaseAgreement(input.leaseId, ctx.user.id, {
        ...(input.leaseStartDate && { leaseStartDate: input.leaseStartDate }),
        ...(input.leaseEndDate && { leaseEndDate: input.leaseEndDate }),
        ...(input.monthlyRent !== undefined && { monthlyRent: input.monthlyRent }),
        ...(input.securityDeposit !== undefined && { securityDeposit: input.securityDeposit }),
        ...(input.leaseTerm && { leaseTerm: input.leaseTerm }),
      });

      // Re-render the leaseDocument so the preview reflects the updated values.
      // If no document exists yet (e.g. lease created before auto-render was deployed),
      // create one from the state template now.
      let leaseDocumentId: number | undefined;
      try {
        const freshLease = await getLeaseById(input.leaseId);
        const docs = await listLeaseDocumentsByAgreement(input.leaseId);
        const doc = docs[0]; // most-recent first (ordered by createdAt desc)
        if (doc && doc.templateVersionId) {
          // Update existing document
          const tv = await getTemplateVersionById(doc.templateVersionId);
          if (tv) {
            const variables: Record<string, unknown> = JSON.parse(doc.variableValues ?? "{}");
            if (input.leaseStartDate) variables.lease_start_date = input.leaseStartDate;
            if (input.leaseEndDate) variables.lease_end_date = input.leaseEndDate;
            if (input.monthlyRent !== undefined) variables.monthly_rent = input.monthlyRent / 100;
            if (input.securityDeposit !== undefined) variables.security_deposit = input.securityDeposit / 100;
            if (input.leaseTerm) variables.lease_term = input.leaseTerm;
            const citations: string[] = tv.citations ? JSON.parse(tv.citations as string) : [];
            const rendered = renderTemplate(tv.bodyHtml, variables as any, citations);
            await updateLeaseDocument(doc.id, {
              renderedHtml: rendered.html,
              variableValues: JSON.stringify(variables),
              updatedAt: new Date(),
            });
            leaseDocumentId = doc.id;
          }
        } else if (freshLease) {
          // No document yet — create one from the state template
          const tpl = await getLatestTemplateVersionForState(freshLease.state);
          if (tpl) {
            const _addr = freshLease.propertyAddress;
            const _cm2 = _addr.match(/,\s*([^,]+),?\s*[A-Z]{2}[\s,]/);
            const _zm2 = _addr.match(/\b(\d{5})\b/);
            const variables: Record<string, unknown> = {
              tenant_name: freshLease.tenantName,
              tenant_email: freshLease.tenantEmail,
              tenant_phone: freshLease.tenantPhone ?? "",
              landlord_name: ctx.user.name ?? "",
              landlord_email: ctx.user.email ?? "",
              property_address: _addr,
              property_city: _cm2?.[1]?.trim() ?? "",
              property_zip: _zm2?.[1] ?? "",
              monthly_rent: (input.monthlyRent !== undefined ? input.monthlyRent : freshLease.monthlyRent) / 100,
              security_deposit: (input.securityDeposit !== undefined ? input.securityDeposit : (freshLease.securityDeposit ?? 0)) / 100,
              lease_start_date: input.leaseStartDate ?? freshLease.leaseStartDate,
              lease_end_date: input.leaseEndDate ?? freshLease.leaseEndDate ?? undefined,
              lease_term: input.leaseTerm ?? freshLease.leaseTerm ?? "12_months",
              state: freshLease.state,
            };
            const citations: string[] = tpl.citations ? JSON.parse(tpl.citations as string) : [];
            const rendered = renderTemplate(tpl.bodyHtml, variables as any, citations);
            leaseDocumentId = await createLeaseDocument({
              landlordUserId: ctx.user.id,
              leaseAgreementId: input.leaseId,
              source: "template",
              templateId: tpl.templateId,
              templateVersionId: tpl.id,
              renderedHtml: rendered.html,
              variableValues: JSON.stringify(variables),
              status: "draft",
            });
          }
        }
      } catch (e) {
        console.error("[updateDraft] Re-render failed", {
          leaseId: input.leaseId,
          error: e instanceof Error ? e.message : String(e),
        });
      }

      return { success: true, leaseDocumentId: leaseDocumentId ?? null };
    }),
  }),

  // ─── PROPERTY MANAGER ACCESS ─────────────────────────────────────────────────
  propertyManager: router({
    /** Landlord: invite a property manager by email */
    invite: protectedProcedure.input(z.object({
      inviteEmail: z.string().email(),
      allProperties: z.boolean().default(false),
      listingIds: z.array(z.number()).optional(),
      canViewWorkOrders: z.boolean().default(true),
      canManageWorkOrders: z.boolean().default(true),
      canViewPayments: z.boolean().default(true),
      canViewLeases: z.boolean().default(true),
      canManageLeases: z.boolean().default(false),
      canApproveApplications: z.boolean().default(false),
      canPayVendors: z.boolean().default(false),
    })).mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });

      // Check if manager has a Keycove account
      const managerUser = await (async () => {
        const db = await getDb();
        if (!db) return undefined;
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const rows = await db.select().from(users).where(eq(users.email, input.inviteEmail)).limit(1);
        return rows[0];
      })();

      if (!managerUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No Keycove account found for that email. The property manager must sign up first." });
      }

      const id = await createPropertyManagerAccess({
        ownerUserId: ctx.user.id,
        managerUserId: managerUser.id,
        allProperties: input.allProperties ? 1 : 0,
        listingIds: input.listingIds ? JSON.stringify(input.listingIds) : null,
        canViewWorkOrders: input.canViewWorkOrders ? 1 : 0,
        canManageWorkOrders: input.canManageWorkOrders ? 1 : 0,
        canViewPayments: input.canViewPayments ? 1 : 0,
        canViewLeases: input.canViewLeases ? 1 : 0,
        canManageLeases: input.canManageLeases ? 1 : 0,
        canApproveApplications: input.canApproveApplications ? 1 : 0,
        canPayVendors: input.canPayVendors ? 1 : 0,
        status: "active",
        inviteEmail: input.inviteEmail,
      });

      // Email the property manager
      const landlord = await getUserByOpenId(ctx.user.openId);
      const APP_URL = process.env.VITE_APP_URL ?? "https://keycove.net";
      sendEmail({
        to: input.inviteEmail,
        subject: `You've been added as a Property Manager on Keycove`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2B5E">Property Manager Access Granted</h2>
          <p><strong>${landlord?.name ?? "A landlord"}</strong> has given you property manager access on Keycove.</p>
          <p>You can now view and manage their properties based on the permissions assigned.</p>
          <p style="margin-top:16px"><a href="${APP_URL}/manage" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">View Portal</a></p>
        </div>`,
      }).catch(() => {});

      return { id };
    }),

    /** Landlord: list their property managers */
    list: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub || sub.tier !== "paid") throw new TRPCError({ code: "FORBIDDEN" });
      const accesses = await getPropertyManagersByOwner(ctx.user.id);
      // Enrich with manager name
      const enriched = await Promise.all(accesses.map(async (a) => {
        const manager = await getUserById(a.managerUserId);
        return { ...a, managerName: manager?.name, managerEmail: manager?.email };
      }));
      return enriched;
    }),

    /** Landlord: update permissions */
    updatePermissions: protectedProcedure.input(z.object({
      accessId: z.number(),
      canViewWorkOrders: z.boolean().optional(),
      canManageWorkOrders: z.boolean().optional(),
      canViewPayments: z.boolean().optional(),
      canViewLeases: z.boolean().optional(),
      canManageLeases: z.boolean().optional(),
      canApproveApplications: z.boolean().optional(),
      canPayVendors: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { accessId, ...perms } = input;
      const mapped: Record<string, number> = {};
      for (const [k, v] of Object.entries(perms)) {
        if (v !== undefined) mapped[k] = v ? 1 : 0;
      }
      await updatePropertyManagerAccess(accessId, ctx.user.id, mapped as any);
      return { success: true };
    }),

    /** Landlord: revoke access */
    revoke: protectedProcedure.input(z.object({ accessId: z.number() })).mutation(async ({ ctx, input }) => {
      await revokePropertyManagerAccess(input.accessId, ctx.user.id);
      return { success: true };
    }),

    /** Property manager: view the portals they manage */
    getManagedPortals: protectedProcedure.query(async ({ ctx }) => {
      const accesses = await getPropertiesManagedBy(ctx.user.id);
      const enriched = await Promise.all(accesses.map(async (a) => {
        const owner = await getUserById(a.ownerUserId);
        const sub = await getUserSubscription(a.ownerUserId);
        return {
          ...a,
          ownerName: owner?.name,
          ownerEmail: owner?.email,
          brandName: sub?.brandName,
          brandColor: sub?.brandColor,
        };
      }));
      return enriched;
    }),

    /** Property manager: get work orders for a managed owner */
    getManagedWorkOrders: protectedProcedure.input(z.object({ ownerUserId: z.number() })).query(async ({ ctx, input }) => {
      const accesses = await getPropertiesManagedBy(ctx.user.id);
      const access = accesses.find(a => a.ownerUserId === input.ownerUserId);
      if (!access || !access.canViewWorkOrders) throw new TRPCError({ code: "FORBIDDEN" });
      return getWorkOrders(input.ownerUserId);
    }),

    /** Property manager: get leases for a managed owner */
    getManagedLeases: protectedProcedure.input(z.object({ ownerUserId: z.number() })).query(async ({ ctx, input }) => {
      const accesses = await getPropertiesManagedBy(ctx.user.id);
      const access = accesses.find(a => a.ownerUserId === input.ownerUserId);
      if (!access || !access.canViewLeases) throw new TRPCError({ code: "FORBIDDEN" });
      return getLeasesByLandlord(input.ownerUserId);
    }),
  }),

  /**
   * Rent intelligence — automated, nationwide rent benchmarks.
   *
   * Data is refreshed in the background by server/_core/rentBenchmarks.ts:
   * Census ACS + HUD FMR are pulled monthly from their public APIs (no
   * manual CSV upload). This router only reads the cached snapshot and
   * exposes an admin-only manual refresh trigger.
   */
  rentIntelligence: router({
    /** Public: get the rent benchmark for a single zip code. */
    getBenchmark: publicProcedure.input(z.object({ zip: z.string() })).query(async ({ input }) => {
      const { lookupBenchmarkByZip } = await import("./_core/rentBenchmarks");
      return await lookupBenchmarkByZip(input.zip);
    }),

    /** Admin: surface the last successful run for each source. */
    runStatus: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return [];
      const { rentBenchmarkRuns } = await import("../drizzle/schema");
      return await db
        .select()
        .from(rentBenchmarkRuns)
        .orderBy(sql`${rentBenchmarkRuns.startedAt} DESC`)
        .limit(20);
    }),

    /** Admin: force a refresh now (don't wait for the scheduler). */
    refreshNow: protectedProcedure
      .input(z.object({ source: z.enum(["acs", "hud", "both"]).default("both") }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { refreshAcsRentBenchmarks, refreshHudFmrs } = await import("./_core/rentBenchmarks");
        const results: Record<string, { rowsUpserted: number; errors: string[] }> = {};
        if (input.source === "acs" || input.source === "both") {
          results.acs = await refreshAcsRentBenchmarks();
        }
        if (input.source === "hud" || input.source === "both") {
          results.hud = await refreshHudFmrs();
        }
        return results;
      }),
  }),

  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const rows = await listNotificationsForUser(ctx.user.id, 30);
      const unread = await countUnreadNotifications(ctx.user.id);
      return { items: rows, unread };
    }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(ctx.user.id, input.id);
        return { ok: true } as const;
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { ok: true } as const;
    }),
  }),

  // ────────────────────────────────────────────────────────────────────────────
  // IMPORT — bulk-migrate existing tenants + active leases from a competitor
  // (AppFolio, Buildium, RentRedi, Avail, etc). The landlord exports CSV from
  // the old tool, our /import-tenants UI parses + previews, then submits here.
  //
  // Imported leases are inserted as status="active" with synthetic signature
  // markers ("Imported from prior system") so they immediately appear on the
  // Leases page and Accounting can credit ongoing rent. A tenant portal
  // account is auto-provisioned per row so the tenant can sign in and start
  // paying through Keycove on the next cycle.
  // ────────────────────────────────────────────────────────────────────────────
  import: router({
    bulkLeases: protectedProcedure
      .input(z.object({
        rows: z.array(z.object({
          tenantName: z.string().trim().min(2).max(255),
          tenantEmail: z.string().email(),
          tenantPhone: z.string().trim().max(30).optional(),
          propertyAddress: z.string().trim().min(3),
          state: z.string().trim().length(2),
          monthlyRentCents: z.number().int().positive(),
          securityDepositCents: z.number().int().nonnegative().optional(),
          leaseStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          leaseEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          rentDueDay: z.number().int().min(1).max(28).optional(),
          sourcePlatform: z.string().max(40).optional(),
        })).min(1).max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        const out = { imported: 0, skipped: 0, errors: [] as string[], leaseIds: [] as number[] };
        const now = new Date();

        for (const r of input.rows) {
          try {
            const leaseId = await createLeaseAgreement({
              landlordUserId: ctx.user.id,
              tenantName: r.tenantName,
              tenantEmail: r.tenantEmail.toLowerCase(),
              tenantPhone: r.tenantPhone,
              state: r.state.toUpperCase(),
              propertyAddress: r.propertyAddress,
              monthlyRent: r.monthlyRentCents,
              securityDeposit: r.securityDepositCents ?? 0,
              leaseStartDate: r.leaseStartDate,
              leaseEndDate: r.leaseEndDate,
              rentDueDay: r.rentDueDay ?? 1,
              status: "active",
              tenantSignedAt: now,
              landlordSignedAt: now,
              signedAt: now,
              tenantSignatureName: `Imported from ${r.sourcePlatform ?? "prior system"}`,
              landlordSignatureName: `Imported from ${r.sourcePlatform ?? "prior system"}`,
              firstMonthPaid: 1,
              depositPaid: r.securityDepositCents && r.securityDepositCents > 0 ? 1 : 0,
              notes: `Imported on ${now.toISOString().slice(0, 10)} from ${r.sourcePlatform ?? "external source"}.`,
            } as any);
            out.leaseIds.push(leaseId);

            // Auto-provision (or reuse) tenant portal account so they can
            // pay rent through Keycove going forward.
            try {
              const existing = await getTenantByEmail(r.tenantEmail.toLowerCase());
              if (!existing) {
                const parseDateString = (s?: string) => (s ? new Date(`${s}T12:00:00Z`) : undefined);
                await createTenantAccount({
                  landlordUserId: ctx.user.id,
                  leaseId,
                  name: r.tenantName,
                  email: r.tenantEmail.toLowerCase(),
                  phone: r.tenantPhone,
                  monthlyRentCents: r.monthlyRentCents,
                  leaseStart: parseDateString(r.leaseStartDate),
                  leaseEnd: parseDateString(r.leaseEndDate),
                } as any);
              }
            } catch (err) {
              console.warn("[import.bulkLeases] tenant portal provision failed:", err);
            }

            out.imported += 1;
          } catch (err: any) {
            out.skipped += 1;
            out.errors.push(`${r.tenantEmail}: ${err?.message ?? "insert failed"}`);
          }
        }

        return out;
      }),
  }),
});

export type AppRouter = typeof appRouter;
