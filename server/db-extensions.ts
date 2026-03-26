/**
 * DB helpers for Apartment Complexes, Complex Units, and iStay™ short-term rentals.
 * Follows the same getDb() pattern as server/db.ts.
 */
import { and, desc, eq, like, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  apartmentComplexes, InsertApartmentComplex, ApartmentComplex,
  complexUnits, InsertComplexUnit, ComplexUnit,
  istayListings, InsertIstayListing, IstayListing,
  istayBookings, InsertIstayBooking, IstayBooking,
  istayReviews, InsertIstayReview, IstayReview,
  istaySaves,
  marketplaceListings,
} from "../drizzle/schema";

// ─── Apartment Complex ────────────────────────────────────────────────────────

export async function getComplexesByUser(userId: number): Promise<ApartmentComplex[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(apartmentComplexes)
    .where(eq(apartmentComplexes.userId, userId))
    .orderBy(desc(apartmentComplexes.createdAt));
}

export async function getComplexById(id: number): Promise<ApartmentComplex | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apartmentComplexes).where(eq(apartmentComplexes.id, id)).limit(1);
  return result[0];
}

export async function createComplex(data: Omit<InsertApartmentComplex, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(apartmentComplexes).values(data as InsertApartmentComplex);
  return (result[0] as any).insertId;
}

export async function updateComplex(id: number, userId: number, data: Partial<InsertApartmentComplex>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(apartmentComplexes).set(data).where(and(eq(apartmentComplexes.id, id), eq(apartmentComplexes.userId, userId)));
}

export async function deleteComplex(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(complexUnits).where(eq(complexUnits.complexId, id));
  await db.delete(apartmentComplexes).where(and(eq(apartmentComplexes.id, id), eq(apartmentComplexes.userId, userId)));
}

// ─── Complex Units ────────────────────────────────────────────────────────────

export async function getUnitsByComplex(complexId: number): Promise<ComplexUnit[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complexUnits).where(eq(complexUnits.complexId, complexId)).orderBy(complexUnits.unitNumber);
}

export async function getUnitById(id: number): Promise<ComplexUnit | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(complexUnits).where(eq(complexUnits.id, id)).limit(1);
  return result[0];
}

export async function createUnit(data: Omit<InsertComplexUnit, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(complexUnits).values(data as InsertComplexUnit);
  return (result[0] as any).insertId;
}

export async function updateUnit(id: number, userId: number, data: Partial<InsertComplexUnit>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(complexUnits).set(data).where(and(eq(complexUnits.id, id), eq(complexUnits.userId, userId)));
}

export async function deleteUnit(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(complexUnits).where(and(eq(complexUnits.id, id), eq(complexUnits.userId, userId)));
}

/**
 * Publish a complex unit to the public marketplace as a standard listing.
 * If a marketplace listing already exists for the unit, it updates it.
 * Returns the marketplace listing ID.
 */
export async function publishUnitToMarketplace(unitId: number, userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const [unit] = await db.select().from(complexUnits).where(and(eq(complexUnits.id, unitId), eq(complexUnits.userId, userId))).limit(1);
  if (!unit) throw new Error("Unit not found");

  const [complex] = await db.select().from(apartmentComplexes).where(eq(apartmentComplexes.id, unit.complexId)).limit(1);
  if (!complex) throw new Error("Complex not found");

  const listingData = {
    userId,
    title: `Unit ${unit.unitNumber} — ${complex.name}`,
    description: unit.description ?? complex.description ?? "",
    propertyType: "apartment" as const,
    address: `${complex.address}, Unit ${unit.unitNumber}`,
    city: complex.city,
    state: complex.state,
    zip: complex.zip,
    neighborhood: complex.neighborhood ?? undefined,
    latitude: complex.latitude ?? undefined,
    longitude: complex.longitude ?? undefined,
    monthlyRent: unit.monthlyRent,
    securityDeposit: unit.securityDeposit ?? undefined,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    squareFeet: unit.squareFeet ?? undefined,
    availableDate: unit.availableDate ?? undefined,
    petFriendly: unit.petFriendly,
    washerDryer: unit.washerDryer,
    airConditioning: unit.airConditioning,
    dishwasher: unit.dishwasher,
    utilities: unit.utilities,
    photos: unit.photos ?? complex.photos,
    contactName: complex.contactName ?? undefined,
    contactEmail: complex.contactEmail ?? undefined,
    contactPhone: complex.contactPhone ?? undefined,
    status: "active" as const,
  };

  if (unit.marketplaceListingId) {
    await db.update(marketplaceListings).set(listingData).where(eq(marketplaceListings.id, unit.marketplaceListingId));
    return unit.marketplaceListingId;
  } else {
    const result = await db.insert(marketplaceListings).values(listingData);
    const listingId = (result[0] as any).insertId;
    await db.update(complexUnits).set({ marketplaceListingId: listingId }).where(eq(complexUnits.id, unitId));
    return listingId;
  }
}

// ─── iStay™ ───────────────────────────────────────────────────────────────────

export interface IstayFilters {
  city?: string;
  state?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  petsAllowed?: boolean;
  limit?: number;
  offset?: number;
}

export async function getIstayListings(filters: IstayFilters = {}): Promise<IstayListing[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions: ReturnType<typeof eq>[] = [eq(istayListings.status, "active") as any];
  if (filters.city) conditions.push(like(istayListings.city, `%${filters.city}%`) as any);
  if (filters.state) conditions.push(eq(istayListings.state, filters.state) as any);
  if (filters.minPrice) conditions.push(sql`${istayListings.pricePerNight} >= ${filters.minPrice}` as any);
  if (filters.maxPrice) conditions.push(sql`${istayListings.pricePerNight} <= ${filters.maxPrice}` as any);
  if (filters.guests) conditions.push(sql`${istayListings.maxGuests} >= ${filters.guests}` as any);
  if (filters.petsAllowed) conditions.push(eq(istayListings.petsAllowed, 1) as any);
  return db.select().from(istayListings)
    .where(and(...conditions))
    .orderBy(desc(istayListings.createdAt))
    .limit(filters.limit ?? 24)
    .offset(filters.offset ?? 0);
}

export async function getIstayListingById(id: number): Promise<IstayListing | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(istayListings).where(eq(istayListings.id, id)).limit(1);
  if (result[0]) {
    await db.update(istayListings).set({ viewCount: sql`${istayListings.viewCount} + 1` }).where(eq(istayListings.id, id));
  }
  return result[0];
}

export async function getIstayListingsByUser(userId: number): Promise<IstayListing[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(istayListings).where(eq(istayListings.userId, userId)).orderBy(desc(istayListings.createdAt));
}

export async function createIstayListing(data: Omit<InsertIstayListing, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(istayListings).values(data as InsertIstayListing);
  return (result[0] as any).insertId;
}

export async function updateIstayListing(id: number, userId: number, data: Partial<InsertIstayListing>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(istayListings).set(data).where(and(eq(istayListings.id, id), eq(istayListings.userId, userId)));
}

export async function deleteIstayListing(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(istayListings).set({ status: "inactive" }).where(and(eq(istayListings.id, id), eq(istayListings.userId, userId)));
}

export async function saveIstayListing(listingId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(istaySaves).where(and(eq(istaySaves.listingId, listingId), eq(istaySaves.userId, userId))).limit(1);
  if (existing.length === 0) {
    await db.insert(istaySaves).values({ listingId, userId });
    await db.update(istayListings).set({ saveCount: sql`${istayListings.saveCount} + 1` }).where(eq(istayListings.id, listingId));
  }
}

export async function unsaveIstayListing(listingId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(istaySaves).where(and(eq(istaySaves.listingId, listingId), eq(istaySaves.userId, userId)));
  await db.update(istayListings).set({ saveCount: sql`${istayListings.saveCount} - 1` }).where(eq(istayListings.id, listingId));
}

export async function getSavedIstayListings(userId: number): Promise<IstayListing[]> {
  const db = await getDb();
  if (!db) return [];
  const saves = await db.select().from(istaySaves).where(eq(istaySaves.userId, userId));
  if (saves.length === 0) return [];
  const ids = saves.map((s) => s.listingId);
  return db.select().from(istayListings).where(sql`${istayListings.id} IN (${ids.join(",")})`);
}

export async function getIstayReviews(listingId: number): Promise<IstayReview[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(istayReviews).where(eq(istayReviews.listingId, listingId)).orderBy(desc(istayReviews.createdAt));
}

export async function createIstayReview(data: Omit<InsertIstayReview, "id" | "createdAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(istayReviews).values(data as InsertIstayReview);
  const reviewId = (result[0] as any).insertId;
  const reviews = await db.select().from(istayReviews).where(eq(istayReviews.listingId, data.listingId));
  const avg = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;
  await db.update(istayListings).set({ averageRating: avg, reviewCount: reviews.length }).where(eq(istayListings.id, data.listingId));
  return reviewId;
}

export async function createIstayBooking(data: Omit<InsertIstayBooking, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(istayBookings).values(data as InsertIstayBooking);
  return (result[0] as any).insertId;
}

export async function getIstayBookingsByGuest(guestUserId: number): Promise<IstayBooking[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(istayBookings).where(eq(istayBookings.guestUserId, guestUserId)).orderBy(desc(istayBookings.createdAt));
}

export async function getIstayBookingsByHost(hostUserId: number): Promise<IstayBooking[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(istayBookings).where(eq(istayBookings.hostUserId, hostUserId)).orderBy(desc(istayBookings.createdAt));
}

export async function updateIstayBooking(id: number, data: Partial<InsertIstayBooking>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(istayBookings).set(data).where(eq(istayBookings.id, id));
}
