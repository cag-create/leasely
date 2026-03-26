import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getMarketplaceListings: vi.fn().mockResolvedValue([]),
  getFeaturedListings: vi.fn().mockResolvedValue([]),
  getMapListings: vi.fn().mockResolvedValue([]),
  getListingById: vi.fn().mockResolvedValue(null),
  getListingsByUserId: vi.fn().mockResolvedValue([]),
  createListing: vi.fn().mockResolvedValue(1),
  updateListing: vi.fn().mockResolvedValue(undefined),
  deleteListing: vi.fn().mockResolvedValue(undefined),
  incrementViewCount: vi.fn().mockResolvedValue(undefined),
  countUserListings: vi.fn().mockResolvedValue(0),
  saveListing: vi.fn().mockResolvedValue(undefined),
  unsaveListing: vi.fn().mockResolvedValue(undefined),
  getSavedListings: vi.fn().mockResolvedValue([]),
  isListingSaved: vi.fn().mockResolvedValue(false),
  createInquiry: vi.fn().mockResolvedValue(undefined),
  getListingAnalytics: vi.fn().mockResolvedValue(null),
  getUserSubscription: vi.fn().mockResolvedValue(null),
  upsertUserSubscription: vi.fn().mockResolvedValue(undefined),
  setAccountType: vi.fn().mockResolvedValue(undefined),
  updatePortalBranding: vi.fn().mockResolvedValue(undefined),
  getSavedSearches: vi.fn().mockResolvedValue([]),
  createSavedSearch: vi.fn().mockResolvedValue(1),
  deleteSavedSearch: vi.fn().mockResolvedValue(undefined),
  getPortalBySubdomain: vi.fn().mockResolvedValue(null),
  getPaymentsByLandlord: vi.fn().mockResolvedValue([]),
  createPaymentRecord: vi.fn().mockResolvedValue(1),
  updatePaymentStatus: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://example.com/photo.jpg" }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

const mockUser = {
  id: 1,
  openId: "test-user-123",
  email: "test@leasely.net",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createCtx(user?: typeof mockUser): TrpcContext {
  return {
    user: user ?? null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("marketplace.getListings", () => {
  it("returns empty array when no listings exist", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.marketplace.getListings({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts filter parameters", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.marketplace.getListings({
      city: "Charlotte",
      state: "NC",
      propertyType: "apartment",
      minRent: 1000,
      maxRent: 3000,
      bedrooms: "2",
      petFriendly: true,
      isCoLiving: false,
      sort: "newest",
      limit: 10,
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("marketplace.getFeaturedListings", () => {
  it("returns an array", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.marketplace.getFeaturedListings();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("marketplace.getMapListings", () => {
  it("returns an array for map pins", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.marketplace.getMapListings();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("marketplace.getUserTier", () => {
  it("returns free tier for new user", async () => {
    const caller = appRouter.createCaller(createCtx(mockUser));
    const result = await caller.marketplace.getUserTier();
    expect(result.tier).toBe("free");
    expect(result.status).toBe("active");
  });
});

describe("marketplace.getMyListings", () => {
  it("returns listings for authenticated user", async () => {
    const caller = appRouter.createCaller(createCtx(mockUser));
    const result = await caller.marketplace.getMyListings();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.marketplace.getMyListings()).rejects.toThrow();
  });
});

describe("marketplace.createListing", () => {
  it("creates a listing for free tier user with no existing listings", async () => {
    const caller = appRouter.createCaller(createCtx(mockUser));
    const result = await caller.marketplace.createListing({
      title: "Beautiful 2BR Apartment in Charlotte",
      propertyType: "apartment",
      address: "123 Main St",
      city: "Charlotte",
      state: "NC",
      zip: "28202",
      monthlyRent: 1500,
      bedrooms: "2",
      bathrooms: "1",
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe(1);
  });

  it("throws FORBIDDEN when free tier user already has a listing", async () => {
    const { countUserListings } = await import("./db");
    vi.mocked(countUserListings).mockResolvedValueOnce(1);

    const caller = appRouter.createCaller(createCtx(mockUser));
    await expect(
      caller.marketplace.createListing({
        title: "Second Apartment",
        propertyType: "apartment",
        address: "456 Oak Ave",
        city: "Charlotte",
        state: "NC",
        zip: "28202",
        monthlyRent: 1200,
        bedrooms: "1",
        bathrooms: "1",
      })
    ).rejects.toThrow("UPGRADE_REQUIRED");
  });

  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.marketplace.createListing({
        title: "Test",
        propertyType: "apartment",
        address: "123 Main",
        city: "Charlotte",
        state: "NC",
        zip: "28202",
        monthlyRent: 1000,
        bedrooms: "1",
        bathrooms: "1",
      })
    ).rejects.toThrow();
  });
});

describe("marketplace.saveListing", () => {
  it("saves a listing for authenticated user", async () => {
    const caller = appRouter.createCaller(createCtx(mockUser));
    const result = await caller.marketplace.saveListing({ listingId: 1 });
    expect(result).toBeUndefined();
  });

  it("throws for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.marketplace.saveListing({ listingId: 1 })).rejects.toThrow();
  });
});

describe("marketplace.upgradeToPaid", () => {
  it("upgrades user to paid tier", async () => {
    const caller = appRouter.createCaller(createCtx(mockUser));
    const result = await caller.marketplace.upgradeToPaid();
    expect(result.success).toBe(true);
  });
});

describe("marketplace.submitInquiry", () => {
  it("throws NOT_FOUND for non-existent listing", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.marketplace.submitInquiry({
        listingId: 9999,
        senderName: "John Doe",
        senderEmail: "john@example.com",
        message: "I am interested in this property",
      })
    ).rejects.toThrow();
  });
});
