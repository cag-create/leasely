import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, tinyint, float, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * role: "admin" = Leasely superadmin, "user" = regular user / property owner
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /**
   * accountType: "renter" = free account to save listings/searches
   *              "landlord" = can list properties (free 1st listing, paid for portal)
   * Null means not yet chosen (set during onboarding).
   */
  accountType: mysqlEnum("accountType", ["renter", "landlord"]),
  // Email verification
  emailVerified: tinyint("emailVerified").default(0).notNull(),
  emailVerifyToken: varchar("emailVerifyToken", { length: 128 }),
  emailVerifyExpires: timestamp("emailVerifyExpires"),
  // Password reset
  passwordResetToken: varchar("passwordResetToken", { length: 128 }),
  passwordResetExpires: timestamp("passwordResetExpires"),
  // Session revocation: bumped on logout, invalidates all prior JWTs
  tokenVersion: int("tokenVersion").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User subscription tiers
 * free: 1 listing, marketplace only
 * paid: unlimited listings, full portal + AI screening
 */
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  tier: mysqlEnum("tier", ["free", "paid"]).default("free").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "cancelled"]).default("active").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  // Portal branding (paid landlords only)
  brandName: varchar("brandName", { length: 255 }),
  brandLogoUrl: text("brandLogoUrl"),
  brandColor: varchar("brandColor", { length: 20 }),
  portalSubdomain: varchar("portalSubdomain", { length: 100 }),
  customDomain: varchar("customDomain", { length: 255 }),
  portalTagline: varchar("portalTagline", { length: 255 }),
  portalSocialLinks: text("portalSocialLinks"), // JSON: { facebook, instagram, website }
  // CBP brand brief (Pro deliverable spec the CBP team uses to build the website + logo)
  brandBrief: text("brandBrief"), // JSON: { tagline, industry, logoStyle, palette[3], domainPrimary, domainBackup1, domainBackup2, notes, submittedAt }
  // Stripe Connect (for tenant rent payments)
  stripeConnectAccountId: varchar("stripeConnectAccountId", { length: 255 }),
  stripeConnectStatus: mysqlEnum("stripeConnectStatus", ["not_connected", "pending", "active"]).default("not_connected"),
  // Vendor dispatch preferences
  roundRobinEnabled: tinyint("roundRobinEnabled").default(0), // 1 = rotate vendors, 0 = send to all
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Marketplace property listings
 */
export const marketplaceListings = mysqlTable("marketplace_listings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),

  // Property details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  propertyType: mysqlEnum("propertyType", [
    "apartment", "house", "condo", "townhouse", "co_living", "studio", "room", "other"
  ]).default("apartment").notNull(),

  // Address
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zip: varchar("zip", { length: 20 }),
  neighborhood: varchar("neighborhood", { length: 100 }),

  // Geocoded coordinates
  latitude: float("latitude"),
  longitude: float("longitude"),

  // Pricing — stored in WHOLE DOLLARS (no cents). Note: leaseAgreements
  // uses cents for the same fields — convert at the boundary when
  // creating a draft lease from a listing.
  monthlyRent: int("monthlyRent").notNull(),       // in dollars (whole, no cents)
  securityDeposit: int("securityDeposit"),         // in dollars (whole, no cents)

  // Details
  bedrooms: varchar("bedrooms", { length: 10 }).notNull(),
  bathrooms: varchar("bathrooms", { length: 10 }).notNull(),
  squareFeet: int("squareFeet"),
  availableDate: varchar("availableDate", { length: 30 }),

  // Amenities flags
  petFriendly: tinyint("petFriendly").default(0),
  isCoLiving: tinyint("isCoLiving").default(0),
  parkingAvailable: tinyint("parkingAvailable").default(0),
  washerDryer: tinyint("washerDryer").default(0),
  airConditioning: tinyint("airConditioning").default(0),
  dishwasher: tinyint("dishwasher").default(0),
  utilities: mysqlEnum("utilities", ["included", "not_included", "partial"]).default("not_included"),

  // Photos — stored as JSON array of S3 URLs
  photos: text("photos"), // JSON array

  // Contact
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 30 }),

  // Status
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("active").notNull(),

  // Linked to a Leasely portal property (for paid subscribers)
  portalPropertyId: int("portalPropertyId"),

  // Aggregate counters (denormalized for performance)
  viewCount: int("viewCount").default(0).notNull(),
  saveCount: int("saveCount").default(0).notNull(),

  // Drip email tracking — photo nudge (Day 1) + upgrade pitch (Day 3)
  photoNudgeSentAt: timestamp("photoNudgeSentAt"),
  upgradeNudgeSentAt: timestamp("upgradeNudgeSentAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = typeof marketplaceListings.$inferInsert;

/**
 * Listing view events for analytics
 */
export const listingViews = mysqlTable("listing_views", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  viewerIp: varchar("viewerIp", { length: 64 }),
  viewerRegion: varchar("viewerRegion", { length: 100 }),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type ListingView = typeof listingViews.$inferSelect;

/**
 * Saved searches for renter accounts
 */
export const savedSearches = mysqlTable("saved_searches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 255 }),
  filters: text("filters").notNull(), // JSON: { city, state, type, minRent, maxRent, beds, petFriendly, isCoLiving }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;

/**
 * Listing saves / favorites
 */
export const listingSaves = mysqlTable("listing_saves", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  userId: int("userId").notNull(),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
});

export type ListingSave = typeof listingSaves.$inferSelect;

/**
 * Listing inquiries (contact form submissions)
 */
export const listingInquiries = mysqlTable("listing_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderEmail: varchar("senderEmail", { length: 320 }).notNull(),
  senderPhone: varchar("senderPhone", { length: 30 }),
  message: text("message").notNull(),
  moveInDate: varchar("moveInDate", { length: 30 }),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type ListingInquiry = typeof listingInquiries.$inferSelect;

/**
 * Rent payment records (Stripe Connect payments from tenants to landlords)
 */
export const paymentRecords = mysqlTable("payment_records", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  landlordUserId: int("landlordUserId").notNull(),
  tenantName: varchar("tenantName", { length: 255 }).notNull(),
  tenantEmail: varchar("tenantEmail", { length: 320 }).notNull(),
  amountCents: int("amountCents").notNull(), // amount in cents
  description: varchar("description", { length: 255 }), // e.g. "March 2026 Rent"
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentRecord = typeof paymentRecords.$inferSelect;
export type InsertPaymentRecord = typeof paymentRecords.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// MAINTENANCE / WORK ORDER SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vendor / handyman directory per landlord
 */
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // landlord who owns this vendor record
  name: varchar("name", { length: 255 }).notNull(),
  trade: varchar("trade", { length: 100 }), // e.g. "plumber", "electrician", "general"
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  serviceAreas: text("serviceAreas"), // JSON array of cities/states
  notes: text("notes"),
  isActive: tinyint("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * Work orders / maintenance requests
 */
export const workOrders = mysqlTable("work_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // landlord
  // Property reference — can be a CRM property or marketplace listing
  crmPropertyId: int("crmPropertyId"),
  listingId: int("listingId"),
  propertyAddress: text("propertyAddress"), // denormalized for display

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "plumbing", "electrical", "hvac", "appliance", "structural",
    "pest_control", "cleaning", "landscaping", "other"
  ]).default("other"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "emergency"]).default("medium"),
  status: mysqlEnum("status", [
    "open", "dispatched", "vendor_confirmed", "in_progress", "resolved", "cancelled"
  ]).default("open"),

  // AI-generated summary of the issue
  aiSummary: text("aiSummary"),

  // Assigned vendor
  vendorId: int("vendorId"),
  vendorName: varchar("vendorName", { length: 255 }), // denormalized
  vendorEmail: varchar("vendorEmail", { length: 320 }),
  vendorPhone: varchar("vendorPhone", { length: 30 }),

  // Dispatch tracking
  dispatchedAt: timestamp("dispatchedAt"),
  vendorConfirmedAt: timestamp("vendorConfirmedAt"),
  resolvedAt: timestamp("resolvedAt"),
  estimatedCost: int("estimatedCost"), // in cents
  actualCost: int("actualCost"), // in cents

  // Tenant who submitted (optional)
  tenantName: varchar("tenantName", { length: 255 }),
  tenantEmail: varchar("tenantEmail", { length: 320 }),
  tenantPhone: varchar("tenantPhone", { length: 30 }),

  photos: text("photos"), // JSON array of S3 URLs
  notes: text("notes"),

  // Why this work order's dispatch picked the vendor(s) it picked.
  // "favorite"     — tenant had a favorite for this category, only that vendor was pinged
  // "round_robin"  — landlord enabled round-robin, least-dispatched vendor was picked
  // "all_vendors"  — default fan-out to every active vendor with an email
  dispatchReason: mysqlEnum("dispatchReason", ["favorite", "round_robin", "all_vendors"]),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = typeof workOrders.$inferInsert;

/**
 * Tenant favorite vendors — one favorite per work-order category per tenant.
 *
 * Tenants authenticate via tenantPortalAccounts (token-based, no users row),
 * so the key is `tenantPortalAccountId` rather than a user id. `category`
 * mirrors workOrders.category — when a tenant submits a work order, the
 * dispatch flow honors the matching favorite before falling back to
 * round-robin / all-vendors dispatch.
 */
export const tenantFavoriteVendors = mysqlTable("tenant_favorite_vendors", {
  id: int("id").autoincrement().primaryKey(),
  tenantPortalAccountId: int("tenantPortalAccountId").notNull(),
  landlordUserId: int("landlordUserId").notNull(),
  vendorId: int("vendorId").notNull(),
  category: varchar("category", { length: 32 }).notNull(),  // matches workOrders.category enum values
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // One favorite per tenant per category
  uniqTenantCategory: uniqueIndex("uniq_tenant_category").on(table.tenantPortalAccountId, table.category),
}));

export type TenantFavoriteVendor = typeof tenantFavoriteVendors.$inferSelect;
export type InsertTenantFavoriteVendor = typeof tenantFavoriteVendors.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTING MODULE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Income and expense entries for tax/accounting purposes
 */
export const accountingEntries = mysqlTable("accounting_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Property reference
  crmPropertyId: int("crmPropertyId"),
  listingId: int("listingId"),
  propertyAddress: text("propertyAddress"), // denormalized

  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  // IRS Schedule E categories
  category: mysqlEnum("category", [
    // Income
    "rent", "late_fee", "parking", "laundry", "pet_fee", "other_income",
    // Expense
    "mortgage_interest", "property_tax", "insurance", "repairs", "management_fee",
    "utilities", "advertising", "professional_fees", "travel", "supplies",
    "depreciation", "other_expense"
  ]).notNull(),

  amount: int("amount").notNull(), // in cents
  date: varchar("date", { length: 20 }).notNull(), // ISO date string YYYY-MM-DD
  description: varchar("description", { length: 500 }),
  receiptUrl: text("receiptUrl"), // S3 URL of receipt photo

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountingEntry = typeof accountingEntries.$inferSelect;
export type InsertAccountingEntry = typeof accountingEntries.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY CRM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CRM property records — the landlord's full portfolio
 */
export const crmProperties = mysqlTable("crm_properties", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  propertyType: mysqlEnum("propertyType", [
    "single_family", "multi_family", "apartment", "condo", "townhouse", "commercial", "other"
  ]).default("single_family"),
  totalUnits: int("totalUnits").default(1),
  purchasePrice: int("purchasePrice"), // in cents
  currentValue: int("currentValue"), // in cents
  yearBuilt: int("yearBuilt"),
  squareFeet: int("squareFeet"),
  notes: text("notes"),
  photos: text("photos"), // JSON array
  // Link to marketplace listing
  listingId: int("listingId"),
  status: mysqlEnum("status", ["active", "vacant", "for_sale", "other"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmProperty = typeof crmProperties.$inferSelect;
export type InsertCrmProperty = typeof crmProperties.$inferInsert;

/**
 * Tenant profiles
 */
export const crmTenants = mysqlTable("crm_tenants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // landlord
  crmPropertyId: int("crmPropertyId").notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  emergencyContactName: varchar("emergencyContactName", { length: 255 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 30 }),
  moveInDate: varchar("moveInDate", { length: 20 }),
  moveOutDate: varchar("moveOutDate", { length: 20 }),
  monthlyRent: int("monthlyRent"), // in cents
  securityDeposit: int("securityDeposit"), // in cents
  status: mysqlEnum("status", ["active", "past", "prospect"]).default("active"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmTenant = typeof crmTenants.$inferSelect;
export type InsertCrmTenant = typeof crmTenants.$inferInsert;

/**
 * Lease records
 */
export const crmLeases = mysqlTable("crm_leases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  crmPropertyId: int("crmPropertyId").notNull(),
  crmTenantId: int("crmTenantId").notNull(),
  startDate: varchar("startDate", { length: 20 }).notNull(),
  endDate: varchar("endDate", { length: 20 }).notNull(),
  monthlyRent: int("monthlyRent").notNull(), // in cents
  securityDeposit: int("securityDeposit"), // in cents
  leaseType: mysqlEnum("leaseType", ["month_to_month", "fixed_term", "week_to_week"]).default("fixed_term"),
  status: mysqlEnum("status", ["active", "expired", "terminated", "renewed"]).default("active"),
  renewalReminderSent: tinyint("renewalReminderSent").default(0),
  documentUrl: text("documentUrl"), // S3 URL of signed lease PDF
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmLease = typeof crmLeases.$inferSelect;
export type InsertCrmLease = typeof crmLeases.$inferInsert;

/**
 * Activity notes — attached to any entity (property, tenant, work order, etc.)
 */
export const crmNotes = mysqlTable("crm_notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entityType: mysqlEnum("entityType", ["property", "tenant", "lease", "work_order"]).notNull(),
  entityId: int("entityId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrmNote = typeof crmNotes.$inferSelect;
export type InsertCrmNote = typeof crmNotes.$inferInsert;

// ─── Tenant Portal ────────────────────────────────────────────────────────────

/**
 * Tenant portal accounts — created by landlords to give tenants a dedicated
 * login for paying rent, viewing lease info, and submitting maintenance requests.
 * These are NOT Manus OAuth users; they use email + token-based magic links.
 */
export const tenantPortalAccounts = mysqlTable("tenant_portal_accounts", {
  id: int("id").autoincrement().primaryKey(),
  /** The Pro landlord who invited this tenant */
  landlordUserId: int("landlordUserId").notNull(),
  /** The CRM lease this tenant is associated with */
  leaseId: int("leaseId"),
  /** The marketplace listing this tenant rents */
  listingId: int("listingId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  /** Secure random token for magic-link login (no password needed) */
  accessToken: varchar("accessToken", { length: 128 }),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  /** Monthly rent amount in cents */
  monthlyRentCents: int("monthlyRentCents"),
  /** Lease start and end dates */
  leaseStart: timestamp("leaseStart"),
  leaseEnd: timestamp("leaseEnd"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TenantPortalAccount = typeof tenantPortalAccounts.$inferSelect;
export type InsertTenantPortalAccount = typeof tenantPortalAccounts.$inferInsert;

// ─── Support Tickets ──────────────────────────────────────────────────────────

/**
 * Customer support tickets.
 * Pro users get priority=high and a 24-hour SLA.
 * Free users get priority=normal and a 3-5 business day SLA.
 */
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  /** Null for guest/unauthenticated submissions */
  userId: int("userId"),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  category: mysqlEnum("category", [
    "billing", "technical", "listing", "payment", "account", "other"
  ]).default("other").notNull(),
  priority: mysqlEnum("priority", ["normal", "high", "urgent"]).default("normal").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  /** Tier at time of submission — determines SLA */
  userTier: mysqlEnum("userTier", ["free", "paid", "guest"]).default("free").notNull(),
  /** Contact email for non-authenticated users */
  contactEmail: varchar("contactEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Replies on support tickets — from either the user or the Leasely support team.
 */
export const supportReplies = mysqlTable("support_replies", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  /** "user" = customer, "support" = Leasely team */
  authorType: mysqlEnum("authorType", ["user", "support"]).notNull(),
  authorName: varchar("authorName", { length: 255 }),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupportReply = typeof supportReplies.$inferSelect;
export type InsertSupportReply = typeof supportReplies.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// APARTMENT COMPLEXES & UNITS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apartment complex / multi-unit building record.
 * A landlord or property manager creates one complex, then adds individual units.
 */
export const apartmentComplexes = mysqlTable("apartment_complexes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // owning landlord/PM

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Address
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zip: varchar("zip", { length: 20 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }),

  // Geocoded coordinates
  latitude: float("latitude"),
  longitude: float("longitude"),

  // Building details
  totalUnits: int("totalUnits").default(1).notNull(),
  yearBuilt: int("yearBuilt"),
  stories: int("stories"),

  // Building-level amenities
  hasPool: tinyint("hasPool").default(0),
  hasGym: tinyint("hasGym").default(0),
  hasElevator: tinyint("hasElevator").default(0),
  hasDoorman: tinyint("hasDoorman").default(0),
  hasParking: tinyint("hasParking").default(0),
  hasLaundry: tinyint("hasLaundry").default(0),
  petPolicy: mysqlEnum("petPolicy", ["allowed", "not_allowed", "case_by_case"]).default("case_by_case"),

  // Photos — JSON array of S3 URLs
  photos: text("photos"),
  coverPhotoUrl: text("coverPhotoUrl"),

  // Contact
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 30 }),
  website: varchar("website", { length: 500 }),

  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApartmentComplex = typeof apartmentComplexes.$inferSelect;
export type InsertApartmentComplex = typeof apartmentComplexes.$inferInsert;

/**
 * Individual unit within an apartment complex.
 * Each unit can be independently listed on the marketplace.
 */
export const complexUnits = mysqlTable("complex_units", {
  id: int("id").autoincrement().primaryKey(),
  complexId: int("complexId").notNull(),
  userId: int("userId").notNull(), // owning landlord/PM

  unitNumber: varchar("unitNumber", { length: 20 }).notNull(), // e.g. "2B", "101", "PH1"
  floor: int("floor"),

  // Pricing
  monthlyRent: int("monthlyRent").notNull(), // in cents
  securityDeposit: int("securityDeposit"), // in cents

  // Unit details
  bedrooms: varchar("bedrooms", { length: 10 }).notNull(),
  bathrooms: varchar("bathrooms", { length: 10 }).notNull(),
  squareFeet: int("squareFeet"),
  availableDate: varchar("availableDate", { length: 30 }),

  // Unit-level amenities
  petFriendly: tinyint("petFriendly").default(0),
  washerDryer: tinyint("washerDryer").default(0),
  airConditioning: tinyint("airConditioning").default(0),
  dishwasher: tinyint("dishwasher").default(0),
  balcony: tinyint("balcony").default(0),
  utilities: mysqlEnum("utilities", ["included", "not_included", "partial"]).default("not_included"),

  // Photos — JSON array of S3 URLs
  photos: text("photos"),

  description: text("description"),

  // Occupancy status
  status: mysqlEnum("status", ["available", "occupied", "reserved", "maintenance"]).default("available").notNull(),

  // Linked marketplace listing (when published to the public marketplace)
  marketplaceListingId: int("marketplaceListingId"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplexUnit = typeof complexUnits.$inferSelect;
export type InsertComplexUnit = typeof complexUnits.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// iSTAY™ — SHORT-TERM RENTAL MARKETPLACE (Airbnb competitor)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * iStay™ short-term rental listings.
 * Hosts list properties for nightly/weekly stays.
 */
export const istayListings = mysqlTable("istay_listings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // host

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  propertyType: mysqlEnum("propertyType", [
    "entire_home", "private_room", "shared_room", "hotel_room",
    "apartment", "condo", "villa", "cabin", "cottage", "loft",
    "studio", "penthouse", "townhouse", "other"
  ]).default("entire_home").notNull(),

  // Address
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zip: varchar("zip", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).default("United States"),
  neighborhood: varchar("neighborhood", { length: 100 }),

  // Geocoded coordinates
  latitude: float("latitude"),
  longitude: float("longitude"),

  // Pricing
  pricePerNight: int("pricePerNight").notNull(), // in cents
  cleaningFee: int("cleaningFee").default(0), // in cents
  serviceFee: int("serviceFee").default(0), // in cents (platform fee)
  weeklyDiscount: int("weeklyDiscount").default(0), // percentage 0-100
  monthlyDiscount: int("monthlyDiscount").default(0), // percentage 0-100

  // Capacity
  maxGuests: int("maxGuests").default(1).notNull(),
  bedrooms: int("bedrooms").default(1).notNull(),
  beds: int("beds").default(1).notNull(),
  bathrooms: varchar("bathrooms", { length: 10 }).default("1"),

  // Stay rules
  minNights: int("minNights").default(1).notNull(),
  maxNights: int("maxNights").default(365),
  checkInTime: varchar("checkInTime", { length: 10 }).default("15:00"), // 24h format
  checkOutTime: varchar("checkOutTime", { length: 10 }).default("11:00"),

  // Amenities (JSON array of strings for flexibility)
  amenities: text("amenities"), // JSON: ["wifi","kitchen","pool","gym","parking",...]

  // House rules
  smokingAllowed: tinyint("smokingAllowed").default(0),
  petsAllowed: tinyint("petsAllowed").default(0),
  partiesAllowed: tinyint("partiesAllowed").default(0),
  childrenAllowed: tinyint("childrenAllowed").default(1),
  houseRules: text("houseRules"),

  // Photos — JSON array of S3 URLs
  photos: text("photos"),
  coverPhotoUrl: text("coverPhotoUrl"),

  // Host info (denormalized for display)
  hostName: varchar("hostName", { length: 255 }),
  hostPhotoUrl: text("hostPhotoUrl"),
  hostBio: text("hostBio"),
  isSuperhost: tinyint("isSuperhost").default(0),

  // Ratings (aggregated)
  averageRating: float("averageRating"),
  reviewCount: int("reviewCount").default(0),

  // Cancellation policy
  cancellationPolicy: mysqlEnum("cancellationPolicy", [
    "flexible", "moderate", "strict", "super_strict"
  ]).default("moderate"),

  // Status
  status: mysqlEnum("status", ["active", "inactive", "pending_review"]).default("active").notNull(),
  instantBook: tinyint("instantBook").default(1), // allow instant booking without host approval

  // Analytics
  viewCount: int("viewCount").default(0).notNull(),
  saveCount: int("saveCount").default(0).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IstayListing = typeof istayListings.$inferSelect;
export type InsertIstayListing = typeof istayListings.$inferInsert;

/**
 * iStay™ booking records
 */
export const istayBookings = mysqlTable("istay_bookings", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  hostUserId: int("hostUserId").notNull(),

  // Guest info (may or may not be a registered user)
  guestUserId: int("guestUserId"),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 320 }).notNull(),
  guestPhone: varchar("guestPhone", { length: 30 }),
  guestCount: int("guestCount").default(1).notNull(),

  // Stay dates
  checkIn: varchar("checkIn", { length: 20 }).notNull(), // YYYY-MM-DD
  checkOut: varchar("checkOut", { length: 20 }).notNull(), // YYYY-MM-DD
  nights: int("nights").notNull(),

  // Pricing breakdown (in cents)
  pricePerNight: int("pricePerNight").notNull(),
  subtotal: int("subtotal").notNull(), // nights × pricePerNight
  cleaningFee: int("cleaningFee").default(0),
  serviceFee: int("serviceFee").default(0),
  totalAmount: int("totalAmount").notNull(),

  // Payment
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending"),
  paidAt: timestamp("paidAt"),

  // Booking status
  status: mysqlEnum("status", [
    "pending", "confirmed", "cancelled_by_guest", "cancelled_by_host", "completed", "no_show"
  ]).default("pending").notNull(),

  // Special requests
  specialRequests: text("specialRequests"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IstayBooking = typeof istayBookings.$inferSelect;
export type InsertIstayBooking = typeof istayBookings.$inferInsert;

/**
 * iStay™ guest reviews
 */
export const istayReviews = mysqlTable("istay_reviews", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  bookingId: int("bookingId").notNull(),
  reviewerUserId: int("reviewerUserId"),
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),

  // Ratings (1-5)
  overallRating: int("overallRating").notNull(),
  cleanlinessRating: int("cleanlinessRating"),
  accuracyRating: int("accuracyRating"),
  communicationRating: int("communicationRating"),
  locationRating: int("locationRating"),
  valueRating: int("valueRating"),

  comment: text("comment"),
  hostResponse: text("hostResponse"),
  hostRespondedAt: timestamp("hostRespondedAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IstayReview = typeof istayReviews.$inferSelect;
export type InsertIstayReview = typeof istayReviews.$inferInsert;

/**
 * iStay™ saved/wishlisted listings
 */
export const istaySaves = mysqlTable("istay_saves", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  userId: int("userId").notNull(),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
});

export type IstaySave = typeof istaySaves.$inferSelect;

/**
 * Rental Applications — state-specific, supports standard and co-living (members) types
 */
export const rentalApplications = mysqlTable("rental_applications", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  landlordUserId: int("landlordUserId").notNull(),
  // Applicant info
  applicantName: varchar("applicantName", { length: 255 }).notNull(),
  applicantEmail: varchar("applicantEmail", { length: 320 }).notNull(),
  applicantPhone: varchar("applicantPhone", { length: 30 }),
  applicantDob: varchar("applicantDob", { length: 20 }),
  // Current address
  currentAddress: text("currentAddress"),
  currentLandlordName: varchar("currentLandlordName", { length: 255 }),
  currentLandlordPhone: varchar("currentLandlordPhone", { length: 30 }),
  currentRent: varchar("currentRent", { length: 20 }),
  reasonForLeaving: text("reasonForLeaving"),
  // Employment / income
  employerName: varchar("employerName", { length: 255 }),
  employerPhone: varchar("employerPhone", { length: 30 }),
  occupation: varchar("occupation", { length: 255 }),
  monthlyIncome: varchar("monthlyIncome", { length: 30 }),
  // Application type
  applicationFormType: mysqlEnum("applicationFormType", ["standard", "coliving_member"]).default("standard").notNull(),
  moveInDate: varchar("moveInDate", { length: 20 }),
  roomPreference: varchar("roomPreference", { length: 100 }),
  lifestyleNotes: text("lifestyleNotes"),
  // State-specific
  state: varchar("state", { length: 2 }),
  stateDisclosureAgreed: tinyint("stateDisclosureAgreed").default(0),
  // Pets / vehicles
  hasPets: tinyint("hasPets").default(0),
  petDescription: text("petDescription"),
  vehicleInfo: text("vehicleInfo"),
  // Emergency contact
  emergencyContactName: varchar("emergencyContactName", { length: 255 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 30 }),
  emergencyContactRelation: varchar("emergencyContactRelation", { length: 100 }),
  // Additional occupants
  additionalOccupants: text("additionalOccupants"), // JSON array
  // Consent & signature
  backgroundCheckConsent: tinyint("backgroundCheckConsent").default(0),
  creditCheckConsent: tinyint("creditCheckConsent").default(0),
  signatureDataUrl: text("signatureDataUrl"),
  signedAt: timestamp("signedAt"),
  // Status
  status: mysqlEnum("status", ["submitted", "reviewing", "approved", "denied", "withdrawn"]).default("submitted").notNull(),
  notes: text("notes"),
  // AI screening output (JSON string conforming to ScreeningSchema in routers.ts)
  aiScreeningResult: text("aiScreeningResult"),
  aiScreenedAt: timestamp("aiScreenedAt"),
  // AI override audit trail — populated when a landlord approves an application
  // that the AI flagged as "decline" or "manual_review". Required documentation
  // for fair-housing defensibility.
  aiOverrideReason: text("ai_override_reason"),
  aiOverrideRecommendation: varchar("ai_override_recommendation", { length: 32 }),
  aiOverrideAt: timestamp("ai_override_at"),
  // Most recent auto-created draft lease for this application. Written by
  // applications.updateStatus when the landlord approves. Letting the column
  // live here (instead of joining on each list query) keeps the listing
  // endpoint fast — the lease lifecycle still owns its own row.
  draftLeaseId: int("draft_lease_id"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RentalApplication = typeof rentalApplications.$inferSelect;
export type InsertRentalApplication = typeof rentalApplications.$inferInsert;

/**
 * Custom application templates — landlords can upload their own PDF or use Leasely's built-in
 */
export const customApplicationTemplates = mysqlTable("custom_application_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 500 }),
  isDefault: tinyint("isDefault").default(0),
  templateType: mysqlEnum("templateType", ["leasely_builtin", "custom_upload"]).default("leasely_builtin").notNull(),
  state: varchar("state", { length: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CustomApplicationTemplate = typeof customApplicationTemplates.$inferSelect;
export type InsertCustomApplicationTemplate = typeof customApplicationTemplates.$inferInsert;

/**
 * Area rent rates — curated local rent database for market comps
 */
export const areaRentRates = mysqlTable("area_rent_rates", {
  id: int("id").autoincrement().primaryKey(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }),
  propertyType: mysqlEnum("propertyType", ["studio", "1br", "2br", "3br", "4br_plus", "room", "co_living"]).notNull(),
  medianRent: int("medianRent").notNull(),
  minRent: int("minRent"),
  maxRent: int("maxRent"),
  sampleSize: int("sampleSize").default(0),
  dataSource: varchar("dataSource", { length: 100 }).default("leasely_platform"),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
});
export type AreaRentRate = typeof areaRentRates.$inferSelect;

// ─── Affiliate Program ────────────────────────────────────────────────────────

/**
 * affiliates: One row per approved affiliate.
 * W-9 must be submitted before referral link is activated.
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  status: mysqlEnum("status", ["pending_w9", "active", "suspended", "paid_out"]).default("pending_w9").notNull(),
  totalEarned: int("totalEarned").default(0).notNull(), // cents
  totalPaid: int("totalPaid").default(0).notNull(),     // cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Affiliate = typeof affiliates.$inferSelect;

/**
 * w9_submissions: Tax form data collected before affiliate activation.
 * Stored encrypted-at-rest; SSN/EIN masked in UI.
 */
export const w9Submissions = mysqlTable("w9_submissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull().unique(),
  legalName: varchar("legalName", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  taxClassification: mysqlEnum("taxClassification", [
    "individual", "sole_proprietor", "c_corp", "s_corp", "partnership", "trust", "llc", "other"
  ]).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  tinType: mysqlEnum("tinType", ["ssn", "ein"]).notNull(),
  tinLast4: varchar("tinLast4", { length: 4 }).notNull(), // Store only last 4 for display
  tinEncrypted: text("tinEncrypted").notNull(),            // Full TIN encrypted
  certifiedAt: timestamp("certifiedAt").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});
export type W9Submission = typeof w9Submissions.$inferSelect;

/**
 * affiliate_referrals: Tracks each referral click and conversion.
 */
export const affiliateReferrals = mysqlTable("affiliate_referrals", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  referralCode: varchar("referralCode", { length: 20 }).notNull(),
  referredUserId: int("referredUserId"),          // Set when referred user signs up
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  status: mysqlEnum("status", ["clicked", "signed_up", "paid", "refunded"]).default("clicked").notNull(),
  earningAmountCents: int("earningAmountCents").default(5000), // $50.00
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  convertedAt: timestamp("convertedAt"),
});
export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;

/**
 * affiliate_payouts: Payout records for W-9 / 1099 tracking.
 */
export const affiliatePayouts = mysqlTable("affiliate_payouts", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amountCents: int("amountCents").notNull(),
  method: mysqlEnum("method", ["stripe", "ach", "check", "other"]).default("stripe").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  referenceId: varchar("referenceId", { length: 255 }), // Stripe transfer ID or check number
  notes: text("notes"),
  paidAt: timestamp("paidAt"),
  taxYear: int("taxYear").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;

// ─── Creme Agent Network ──────────────────────────────────────────────────────

export const cremeAgents = mysqlTable("creme_agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  bio: text("bio"),
  phone: varchar("phone", { length: 30 }),
  specialties: text("specialties"), // JSON array: ["novation","fix_flip","investor"]
  serviceAreas: text("serviceAreas"), // JSON array of cities/states
  photoUrl: text("photoUrl"),
  // status: pending = awaiting admin review, approved = active, rejected = denied
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  dealCount: int("dealCount").default(0).notNull(),
  averageRating: float("averageRating").default(0),
  reviewCount: int("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CremeAgent = typeof cremeAgents.$inferSelect;
export type InsertCremeAgent = typeof cremeAgents.$inferInsert;

export const cremeAgentLeads = mysqlTable("creme_agent_leads", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  // Contact info
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 30 }),
  // Lead details
  leadType: mysqlEnum("leadType", ["investor", "fsbo", "novation", "fix_flip", "general"]).default("general"),
  propertyAddress: text("propertyAddress"),
  message: text("message"),
  // Pipeline status
  status: mysqlEnum("status", ["new", "contacted", "qualified", "closed", "lost"]).default("new").notNull(),
  dealValue: int("dealValue"), // in cents — set when closed
  feeCents: int("feeCents"), // 0.75% of dealValue
  feePaid: tinyint("feePaid").default(0),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  // Source
  source: mysqlEnum("source", ["public_request", "admin_assign", "platform"]).default("public_request"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CremeAgentLead = typeof cremeAgentLeads.$inferSelect;
export type InsertCremeAgentLead = typeof cremeAgentLeads.$inferInsert;

export const agentReviews = mysqlTable("agent_reviews", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }),
  rating: int("rating").notNull(), // 1–5
  body: text("body"),
  approved: tinyint("approved").default(0), // 0 = pending, 1 = approved
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentReview = typeof agentReviews.$inferSelect;
export type InsertAgentReview = typeof agentReviews.$inferInsert;

// ─── Renter Waitlist ──────────────────────────────────────────────────────────

export const renterWaitlist = mysqlTable("renter_waitlist", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  preferredArea: varchar("preferredArea", { length: 255 }),
  moveInDate: varchar("moveInDate", { length: 30 }),
  budgetMin: int("budgetMin"),
  budgetMax: int("budgetMax"),
  bedroomsNeeded: varchar("bedroomsNeeded", { length: 20 }),
  notes: text("notes"),
  contactedBy: int("contactedBy"), // Pro subscriber userId who marked contacted
  contactedAt: timestamp("contactedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RenterWaitlistEntry = typeof renterWaitlist.$inferSelect;
export type InsertRenterWaitlistEntry = typeof renterWaitlist.$inferInsert;

// ─── FSBO Profiles ────────────────────────────────────────────────────────────

export const fsboProfiles = mysqlTable("fsbo_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  propertyAddress: text("propertyAddress").notNull(),
  askingPrice: int("askingPrice"), // in cents
  propertyType: mysqlEnum("propertyType", ["single_family","condo","townhouse","multi_family","land","other"]).default("single_family"),
  bedrooms: varchar("bedrooms", { length: 10 }),
  bathrooms: varchar("bathrooms", { length: 10 }),
  squareFeet: int("squareFeet"),
  description: text("description"),
  photos: text("photos"), // JSON array
  listingId: int("listingId"), // linked marketplace listing
  viewCount: int("viewCount").default(0),
  // Drip email tracking
  day1EmailSent: tinyint("day1EmailSent").default(0),
  day3EmailSent: tinyint("day3EmailSent").default(0),
  upgradedToPro: tinyint("upgradedToPro").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FsboProfile = typeof fsboProfiles.$inferSelect;
export type InsertFsboProfile = typeof fsboProfiles.$inferInsert;

// ─── Lease Agreements (state-specific) ───────────────────────────────────────

export const leaseAgreements = mysqlTable("lease_agreements", {
  id: int("id").autoincrement().primaryKey(),
  landlordUserId: int("landlordUserId").notNull(),
  listingId: int("listingId"),
  tenantName: varchar("tenantName", { length: 255 }).notNull(),
  tenantEmail: varchar("tenantEmail", { length: 320 }).notNull(),
  tenantPhone: varchar("tenantPhone", { length: 30 }),
  state: varchar("state", { length: 2 }).notNull(), // 2-letter US state code
  propertyAddress: text("propertyAddress").notNull(),
  monthlyRent: int("monthlyRent").notNull(), // in cents
  securityDeposit: int("securityDeposit").default(0), // in cents
  leaseStartDate: varchar("leaseStartDate", { length: 20 }).notNull(),
  leaseEndDate: varchar("leaseEndDate", { length: 20 }),
  leaseTerm: mysqlEnum("leaseTerm", ["month_to_month", "6_months", "12_months", "24_months", "36_months"]).default("12_months"),
  // Lockbox / key access
  accessMethod: mysqlEnum("accessMethod", ["lockbox", "key_pickup", "in_person", "other"]).default("key_pickup"),
  lockboxCode: varchar("lockboxCode", { length: 50 }),
  accessInstructions: text("accessInstructions"),
  // Status tracking
  // Flow: draft → sent → tenant_signed → awaiting_payment → paid → signed (landlord countersigned) → active
  status: mysqlEnum("status", ["draft", "sent", "tenant_signed", "awaiting_payment", "paid", "signed", "active", "expired", "terminated"]).default("draft").notNull(),
  sentAt: timestamp("sentAt"),
  signedAt: timestamp("signedAt"),
  tenantSignedAt: timestamp("tenantSignedAt"),
  landlordSignedAt: timestamp("landlordSignedAt"),
  // Typed-name signatures captured at sign / countersign time. Stored alongside
  // the timestamps so a rendered lease can show "Signed by [Name] on [date]"
  // and a "Fully executed" badge cannot appear without an actual artifact.
  tenantSignatureName: varchar("tenantSignatureName", { length: 255 }),
  landlordSignatureName: varchar("landlordSignatureName", { length: 255 }),
  tenantSignatureIp: varchar("tenantSignatureIp", { length: 45 }),
  landlordSignatureIp: varchar("landlordSignatureIp", { length: 45 }),
  paidAt: timestamp("paidAt"),
  // Payment link sent after signing
  firstMonthPaymentSent: tinyint("firstMonthPaymentSent").default(0),
  depositPaymentSent: tinyint("depositPaymentSent").default(0),
  firstMonthPaid: tinyint("firstMonthPaid").default(0),
  depositPaid: tinyint("depositPaid").default(0),
  // Signed document URL (uploaded PDF or DocuSign)
  signedDocumentUrl: text("signedDocumentUrl"),
  notes: text("notes"),
  // ── Stripe autopay (recurring rent) ──
  // Set when the tenant authorises a SetupIntent at signing. The Subscription
  // then bills on the rent_due_day each month; webhook records into
  // rent_payments. Until autopay is enabled, rent is treated as manual.
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePaymentMethodId: varchar("stripePaymentMethodId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  autopayEnabled: tinyint("autopayEnabled").default(0),
  autopayActivatedAt: timestamp("autopayActivatedAt"),
  rentDueDay: int("rentDueDay").default(1), // day-of-month 1-28
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LeaseAgreement = typeof leaseAgreements.$inferSelect;
export type InsertLeaseAgreement = typeof leaseAgreements.$inferInsert;

/**
 * Monthly rent payment ledger. One row per due-month per lease. Populated
 * automatically by the Stripe Subscription webhook when autopay is enabled,
 * or manually by the landlord (off-platform Zelle/Venmo/check). Drives the
 * arrears view ("X months behind, $Y outstanding").
 */
export const rentPayments = mysqlTable("rent_payments", {
  id: int("id").autoincrement().primaryKey(),
  leaseAgreementId: int("leaseAgreementId").notNull(),
  landlordUserId: int("landlordUserId").notNull(),
  tenantEmail: varchar("tenantEmail", { length: 320 }).notNull(),
  // Period this payment covers — YYYY-MM-01 string for the first of the month
  periodMonth: varchar("periodMonth", { length: 10 }).notNull(),
  // Due date — typically the rent_due_day of periodMonth
  dueDate: varchar("dueDate", { length: 20 }).notNull(),
  amountCents: int("amountCents").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "late", "skipped", "partial"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  paidAmountCents: int("paidAmountCents"),
  paymentMethod: varchar("paymentMethod", { length: 60 }), // "Leasely", "Zelle", "Cash App", etc.
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  notes: text("notes"),
  // Overdue-reminder tracking — set by the rentReminderScheduler when an
  // overdue-rent email is dispatched. Lets the scheduler escalate (T+1,
  // T+3, T+7) without re-sending the same milestone reminder twice.
  lastReminderSentAt: timestamp("lastReminderSentAt"),
  remindersSentCount: int("remindersSentCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqLeasePeriod: uniqueIndex("uniq_lease_period").on(table.leaseAgreementId, table.periodMonth),
}));
export type RentPayment = typeof rentPayments.$inferSelect;
export type InsertRentPayment = typeof rentPayments.$inferInsert;

// ─── Lease Templates (Phase 2) ────────────────────────────────────────────────
// Admin-editable, state-specific. New states can be added by inserting rows.
// Core code stays unchanged when states are added — that's the scalability rule.

export const leaseTemplates = mysqlTable("lease_templates", {
  id: int("id").autoincrement().primaryKey(),
  // State code ("NC", "TN") OR "ALL" for the multi-state generic template.
  state: varchar("state", { length: 3 }).notNull(),
  // standard_residential | coliving_room_rental | generic
  category: mysqlEnum("category", ["standard_residential", "coliving_room_rental", "generic"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // The currently-active version (FK to lease_template_versions.id). Null if none yet.
  activeVersionId: int("activeVersionId"),
  isActive: tinyint("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LeaseTemplate = typeof leaseTemplates.$inferSelect;
export type InsertLeaseTemplate = typeof leaseTemplates.$inferInsert;

export const leaseTemplateVersions = mysqlTable("lease_template_versions", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  version: int("version").notNull(),
  // Body is the HTML/Markdown template with {{variable_name}} placeholders.
  bodyHtml: text("bodyHtml").notNull(),
  // JSON array of variable names used in this version (for validation).
  variables: text("variables"),
  // JSON array of statute citations baked into this version.
  citations: text("citations"),
  // JSON array of state-required disclosures embedded in this version.
  disclosures: text("disclosures"),
  changeNote: text("changeNote"),
  createdByUserId: int("createdByUserId"), // admin who saved this version
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LeaseTemplateVersion = typeof leaseTemplateVersions.$inferSelect;
export type InsertLeaseTemplateVersion = typeof leaseTemplateVersions.$inferInsert;

// One rendered/uploaded document per draft. Links to leaseAgreements (the
// status-tracking row) when the document is part of an active lease flow.
export const leaseDocuments = mysqlTable("lease_documents", {
  id: int("id").autoincrement().primaryKey(),
  leaseAgreementId: int("leaseAgreementId"), // FK to lease_agreements.id once sent
  landlordUserId: int("landlordUserId").notNull(),
  source: mysqlEnum("source", ["template", "uploaded"]).notNull(),
  // template source
  templateId: int("templateId"),
  templateVersionId: int("templateVersionId"),
  // For uploaded leases: the file URL on disk/storage and original filename.
  uploadedFileUrl: text("uploadedFileUrl"),
  uploadedFilename: varchar("uploadedFilename", { length: 255 }),
  uploadedMimeType: varchar("uploadedMimeType", { length: 100 }),
  // Final rendered HTML (for template path) or null (for uploaded path).
  renderedHtml: text("renderedHtml"),
  // Snapshot of the variable values used to render this document (JSON).
  variableValues: text("variableValues"),
  // Custom clauses the landlord added before send (JSON array of {title, body}).
  customClauses: text("customClauses"),
  // draft | sent | partially_signed | fully_signed | void
  status: mysqlEnum("status", ["draft", "sent", "partially_signed", "fully_signed", "void"]).default("draft").notNull(),
  // Path to the generated/uploaded PDF for download (filled when ready).
  pdfUrl: text("pdfUrl"),
  // Signed PDF (after both parties sign).
  signedPdfUrl: text("signedPdfUrl"),
  // User explicitly checked "I understand Leasely does not provide legal advice."
  legalDisclaimerAcknowledgedAt: timestamp("legalDisclaimerAcknowledgedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LeaseDocument = typeof leaseDocuments.$inferSelect;
export type InsertLeaseDocument = typeof leaseDocuments.$inferInsert;

export const leaseSignatures = mysqlTable("lease_signatures", {
  id: int("id").autoincrement().primaryKey(),
  leaseDocumentId: int("leaseDocumentId").notNull(),
  // "landlord" | "tenant" | "guarantor"
  party: mysqlEnum("party", ["landlord", "tenant", "guarantor"]).notNull(),
  signerName: varchar("signerName", { length: 255 }).notNull(),
  signerEmail: varchar("signerEmail", { length: 320 }).notNull(),
  // Captured signature image (data URL or path).
  signatureImage: text("signatureImage"),
  // typed-name fallback if signature drawing wasn't used
  typedName: varchar("typedName", { length: 255 }),
  // Audit metadata
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  signedAt: timestamp("signedAt").defaultNow().notNull(),
});
export type LeaseSignature = typeof leaseSignatures.$inferSelect;
export type InsertLeaseSignature = typeof leaseSignatures.$inferInsert;

export const leaseAuditLogs = mysqlTable("lease_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  leaseDocumentId: int("leaseDocumentId"),
  leaseAgreementId: int("leaseAgreementId"),
  actorUserId: int("actorUserId"),
  // template_created, template_edited, draft_created, draft_edited, lease_sent,
  // disclaimer_acknowledged, tenant_signed, landlord_signed, pdf_generated, voided
  event: varchar("event", { length: 64 }).notNull(),
  details: text("details"), // JSON
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LeaseAuditLog = typeof leaseAuditLogs.$inferSelect;
export type InsertLeaseAuditLog = typeof leaseAuditLogs.$inferInsert;

// ─── Property Manager Access ──────────────────────────────────────────────────

export const propertyManagerAccess = mysqlTable("property_manager_access", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull(),       // landlord/owner
  managerUserId: int("managerUserId").notNull(),   // property manager
  // Scope: which properties they manage
  allProperties: tinyint("allProperties").default(0), // 1 = manage all
  listingIds: text("listingIds"), // JSON array of specific listing IDs
  // Permissions
  canViewWorkOrders: tinyint("canViewWorkOrders").default(1),
  canManageWorkOrders: tinyint("canManageWorkOrders").default(1),
  canViewPayments: tinyint("canViewPayments").default(1),
  canViewLeases: tinyint("canViewLeases").default(1),
  canManageLeases: tinyint("canManageLeases").default(0),
  canApproveApplications: tinyint("canApproveApplications").default(0),
  canPayVendors: tinyint("canPayVendors").default(0),
  // Status
  status: mysqlEnum("status", ["active", "revoked"]).default("active").notNull(),
  inviteEmail: varchar("inviteEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PropertyManagerAccess = typeof propertyManagerAccess.$inferSelect;
export type InsertPropertyManagerAccess = typeof propertyManagerAccess.$inferInsert;

// ─── Vendor Dispatch Requests (multi-bid / round robin) ───────────────────────

export const vendorDispatchRequests = mysqlTable("vendor_dispatch_requests", {
  id: int("id").autoincrement().primaryKey(),
  workOrderId: int("workOrderId").notNull(),
  vendorId: int("vendorId").notNull(),
  landlordUserId: int("landlordUserId").notNull(),
  // Vendor response
  status: mysqlEnum("status", ["sent", "viewed", "accepted", "declined", "no_response"]).default("sent").notNull(),
  // Time slot proposed by vendor
  proposedDate: varchar("proposedDate", { length: 20 }),
  proposedTimeSlot: varchar("proposedTimeSlot", { length: 50 }), // e.g. "9am-12pm"
  vendorQuoteCents: int("vendorQuoteCents"), // vendor's quoted price
  vendorNotes: text("vendorNotes"),
  // Landlord decision
  landlordApproved: tinyint("landlordApproved"),
  approvedAt: timestamp("approvedAt"),
  // Inspection (after vendor visits site) — photos + observation notes
  inspectionPhotos: text("inspectionPhotos"), // JSON array of URLs
  inspectionNotes: text("inspectionNotes"),
  inspectedAt: timestamp("inspectedAt"),
  // Completion (after work done) — photos + invoice
  completionPhotos: text("completionPhotos"), // JSON array of URLs
  invoiceUrl: text("invoiceUrl"),             // single PDF/img URL
  invoiceAmountCents: int("invoiceAmountCents"), // final invoiced amount (may differ from quote)
  completedAt: timestamp("completedAt"),
  // Landlord completion approval — gates payment
  landlordApprovedCompletion: tinyint("landlordApprovedCompletion"),
  landlordApprovedCompletionAt: timestamp("landlordApprovedCompletionAt"),
  // Payment
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  paidAt: timestamp("paidAt"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
});
export type VendorDispatchRequest = typeof vendorDispatchRequests.$inferSelect;
export type InsertVendorDispatchRequest = typeof vendorDispatchRequests.$inferInsert;

// ─── SOP Library ─────────────────────────────────────────────────────────────

export const sopReads = mysqlTable("sop_reads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sopId: varchar("sopId", { length: 100 }).notNull(), // e.g. "sop_tenant_screening"
  readAt: timestamp("readAt").defaultNow().notNull(),
});
export type SopRead = typeof sopReads.$inferSelect;

// ─── Staff Training ───────────────────────────────────────────────────────────

export const trainingProgress = mysqlTable("training_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  videoId: varchar("videoId", { length: 100 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});
export type TrainingProgress = typeof trainingProgress.$inferSelect;

// ─── Syndication ──────────────────────────────────────────────────────────────

export const syndicationShares = mysqlTable("syndication_shares", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  listingId: varchar("listingId", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(), // e.g. "Zillow","Craigslist","Facebook"
  shareUrl: text("shareUrl"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SyndicationShare = typeof syndicationShares.$inferSelect;
export type InsertSyndicationShare = typeof syndicationShares.$inferInsert;

// ─── Handyman / Contractor Directory ─────────────────────────────────────────
export const contractorProfiles = mysqlTable("contractor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").unique(), // optional — linked Leasely account
  businessName: varchar("businessName", { length: 255 }).notNull(),
  ownerName: varchar("ownerName", { length: 255 }),
  slug: varchar("slug", { length: 120 }).unique(),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }),
  serviceRadius: int("serviceRadius").default(25),
  serviceAreas: text("serviceAreas"), // JSON array
  bio: text("bio"),
  photoUrl: text("photoUrl"),
  bannerUrl: text("bannerUrl"),
  yearsInBusiness: int("yearsInBusiness"),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  insuranceVerified: tinyint("insuranceVerified").default(0),
  backgroundChecked: tinyint("backgroundChecked").default(0),
  trades: text("trades"), // JSON array
  specialties: text("specialties"), // JSON array
  availableWeekdays: tinyint("availableWeekdays").default(1),
  availableWeekends: tinyint("availableWeekends").default(0),
  emergencyService: tinyint("emergencyService").default(0),
  hourlyRateMin: int("hourlyRateMin"),
  hourlyRateMax: int("hourlyRateMax"),
  freeEstimates: tinyint("freeEstimates").default(1),
  portfolioPhotos: text("portfolioPhotos"), // JSON array
  socialFacebook: text("socialFacebook"),
  socialInstagram: text("socialInstagram"),
  socialLinkedin: text("socialLinkedin"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  featured: tinyint("featured").default(0),
  averageRating: float("averageRating").default(0),
  reviewCount: int("reviewCount").default(0),
  jobsCompleted: int("jobsCompleted").default(0),
  profileViews: int("profileViews").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ContractorProfile = typeof contractorProfiles.$inferSelect;
export type InsertContractorProfile = typeof contractorProfiles.$inferInsert;

export const contractorReviews = mysqlTable("contractor_reviews", {
  id: int("id").autoincrement().primaryKey(),
  contractorId: int("contractorId").notNull(),
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }),
  reviewerUserId: int("reviewerUserId"),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 255 }),
  body: text("body"),
  jobType: varchar("jobType", { length: 100 }),
  jobDate: varchar("jobDate", { length: 30 }),
  approved: tinyint("approved").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ContractorReview = typeof contractorReviews.$inferSelect;
export type InsertContractorReview = typeof contractorReviews.$inferInsert;

export const contractorLeads = mysqlTable("contractor_leads", {
  id: int("id").autoincrement().primaryKey(),
  contractorId: int("contractorId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 30 }),
  clientUserId: int("clientUserId"),
  jobType: varchar("jobType", { length: 100 }),
  propertyAddress: text("propertyAddress"),
  message: text("message"),
  urgency: mysqlEnum("urgency", ["flexible", "within_week", "within_month", "emergency"]).default("flexible"),
  status: mysqlEnum("status", ["new", "contacted", "quoted", "booked", "completed", "cancelled"]).default("new"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ContractorLead = typeof contractorLeads.$inferSelect;
export type InsertContractorLead = typeof contractorLeads.$inferInsert;

/**
 * One-time use Pro redemption codes — each Pro subscriber gets one code
 * redeemable at certifybusinesspro.com for the free $299 website + logo + domain package.
 */
export const proRedemptionCodes = mysqlTable("pro_redemption_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", ["unused", "redeemed", "cancelled"]).default("unused").notNull(),
  redeemedAt: timestamp("redeemedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProRedemptionCode = typeof proRedemptionCodes.$inferSelect;

/**
 * Rent benchmarks — automated nationwide rent intelligence keyed by zip code.
 *
 * Data sources (all free, no manual upload):
 *  • Census ACS B25064 (median gross rent) — pulled by ZCTA, ~33k rows
 *  • HUD Fair Market Rents (FMR) — pulled by county, joined via HUD zip↔county crosswalk
 *  • Leasely's own listings — computed in-app as a rolling median per zip
 *
 * Refresh cadence: monthly check on server boot + a setInterval pass every
 * 30 days. Census/HUD only publish new data once a year, but checking
 * monthly catches mid-year corrections and gives a clean upgrade path
 * when we add more frequent sources (e.g., Apartment List vacancy index).
 *
 * Indexed by zip (PK) + state for region rollups. Use rentBenchmarkHistory
 * for trend lines; current snapshot stays here for fast point lookups.
 */
export const rentBenchmarks = mysqlTable("rent_benchmarks", {
  zip: varchar("zip", { length: 5 }).primaryKey(),
  state: varchar("state", { length: 2 }).notNull(),
  countyFips: varchar("countyFips", { length: 5 }), // 2-digit state + 3-digit county
  cbsaCode: varchar("cbsaCode", { length: 5 }), // Census CBSA / HUD Metro area
  // Census ACS 5-year medians (B25064_001E = median gross rent, all unit sizes)
  acsMedianRent: int("acsMedianRent"),
  acsMarginOfError: int("acsMarginOfError"),
  acsSampleSize: int("acsSampleSize"),
  // HUD FMR by bedroom count (FMR is what HUD pays for Section 8 vouchers
  // and is the canonical "fair market" reference rent published annually).
  hudFmrStudio: int("hudFmrStudio"),
  hudFmr1br: int("hudFmr1br"),
  hudFmr2br: int("hudFmr2br"),
  hudFmr3br: int("hudFmr3br"),
  hudFmr4br: int("hudFmr4br"),
  // Year these snapshots represent (ACS publishes Dec for prior year; HUD
  // publishes Oct for the upcoming fiscal year — track separately).
  acsDataYear: int("acsDataYear"),
  hudDataYear: int("hudDataYear"),
  // Leasely's own marketplace median — derived from active listings in this
  // zip. Updates weekly. listingCount is the n behind the median so the UI
  // can show confidence ("based on 14 active listings"). Below ~3 listings
  // the median is statistically noisy; we still store it but flag it.
  leaselyMedianRent: int("leaselyMedianRent"),
  leaselyListingCount: int("leaselyListingCount"),
  // Source-of-truth timestamps so we can tell why a value is stale.
  acsRefreshedAt: timestamp("acsRefreshedAt"),
  hudRefreshedAt: timestamp("hudRefreshedAt"),
  leaselyRefreshedAt: timestamp("leaselyRefreshedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RentBenchmark = typeof rentBenchmarks.$inferSelect;
export type InsertRentBenchmark = typeof rentBenchmarks.$inferInsert;

/**
 * Append-only history of rent benchmark snapshots — used for trend lines
 * ("rents in 30303 are up 8% YoY") and to detect when a refresh job
 * produced anomalous data (-50% drop = ingest bug, not a real signal).
 *
 * Keyed by (zip, snapshotDate). Old rows can be pruned after ~5 years.
 */
export const rentBenchmarkHistory = mysqlTable("rent_benchmark_history", {
  id: int("id").autoincrement().primaryKey(),
  zip: varchar("zip", { length: 5 }).notNull(),
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
  source: mysqlEnum("source", ["acs", "hud", "leasely"]).notNull(),
  bedrooms: varchar("bedrooms", { length: 8 }), // "studio" | "1" | "2" | "3" | "4" | "all"
  rent: int("rent").notNull(),
  sampleSize: int("sampleSize"),
  dataYear: int("dataYear"),
});
export type RentBenchmarkHistory = typeof rentBenchmarkHistory.$inferSelect;
export type InsertRentBenchmarkHistory = typeof rentBenchmarkHistory.$inferInsert;

/**
 * Ingest job audit log — one row per refresh run, success or failure.
 * Lets the dashboard surface "Last data refresh: 3 days ago" and
 * troubleshoot when a source goes dark.
 */
export const rentBenchmarkRuns = mysqlTable("rent_benchmark_runs", {
  id: int("id").autoincrement().primaryKey(),
  source: mysqlEnum("source", ["acs", "hud", "leasely"]).notNull(),
  status: mysqlEnum("status", ["running", "success", "failed"]).notNull(),
  rowsUpserted: int("rowsUpserted").default(0).notNull(),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  finishedAt: timestamp("finishedAt"),
});
export type RentBenchmarkRun = typeof rentBenchmarkRuns.$inferSelect;
export type InsertRentBenchmarkRun = typeof rentBenchmarkRuns.$inferInsert;

/**
 * In-app notifications — bell-icon feed shown to the user in the Navbar.
 * Keyed by userId. type is a short token (e.g. "lease_signed", "payment_paid",
 * "payment_failed", "vendor_accepted") so the UI can pick an icon. link is
 * an optional in-app path the bell click should navigate to.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  link: varchar("link", { length: 512 }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
