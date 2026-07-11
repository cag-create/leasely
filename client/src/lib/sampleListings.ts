// Sample marketplace listings — displayed client-side so a brand-new install
// doesn't look like a ghost town. Clearly labeled with a "Sample listing"
// badge on the PropertyCard so visitors aren't deceived. Click is intercepted
// in PropertyCard to show a toast rather than 404 on a missing DB row.
//
// IDs are large negatives to guarantee no collision with real listings
// (auto-increment in MySQL starts at 1 and the column is signed INT).
//
// Photo URLs are public Unsplash CDN images (royalty-free, hot-linkable).

export type SampleListing = {
  id: number;
  userId: number;
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  monthlyRent: number;
  securityDeposit: number | null;
  bedrooms: string;
  bathrooms: string;
  squareFeet: number | null;
  availableDate: string | null;
  petFriendly: number | null;
  isCoLiving: number | null;
  parkingAvailable: number | null;
  washerDryer: number | null;
  airConditioning: number | null;
  dishwasher: number | null;
  utilities: string | null;
  photos: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string;
  portalPropertyId: number | null;
  viewCount: number;
  saveCount: number;
  createdAt: Date;
  updatedAt: Date;
  isSample: true;
};

const photo = (url: string, ...rest: string[]) => JSON.stringify([url, ...rest]);

const NOW = new Date();
const DAYS_AGO = (d: number) => new Date(NOW.getTime() - d * 24 * 3600 * 1000);

export const SAMPLE_LISTINGS: SampleListing[] = [
  {
    id: -1001,
    userId: -1,
    title: "Modern 2BR Loft in Wynwood",
    description: "Industrial-style loft with floor-to-ceiling windows, exposed brick, and a private balcony overlooking the arts district. Walk to galleries, restaurants, and the Wynwood Walls.",
    propertyType: "apartment",
    address: "234 NW 26th St",
    city: "Miami", state: "FL", zip: "33127",
    neighborhood: "Wynwood",
    latitude: 25.8010, longitude: -80.1990,
    monthlyRent: 2850, securityDeposit: 2850,
    bedrooms: "2", bathrooms: "2", squareFeet: 1150,
    availableDate: "2026-06-15",
    petFriendly: 1, isCoLiving: 0, parkingAvailable: 1,
    washerDryer: 1, airConditioning: 1, dishwasher: 1,
    utilities: "not_included",
    photos: photo("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(3), updatedAt: DAYS_AGO(3),
    isSample: true,
  },
  {
    id: -1002,
    userId: -1,
    title: "Sunlit Craftsman Bungalow",
    description: "Restored 1920s craftsman with original hardwood floors, a chef's kitchen, and a fenced backyard. Quiet tree-lined street, 10 minutes from downtown.",
    propertyType: "house",
    address: "1418 Oak Grove Ave",
    city: "Portland", state: "OR", zip: "97214",
    neighborhood: "Hawthorne",
    latitude: 45.5122, longitude: -122.6587,
    monthlyRent: 3200, securityDeposit: 3200,
    bedrooms: "3", bathrooms: "2", squareFeet: 1680,
    availableDate: "2026-07-01",
    petFriendly: 1, isCoLiving: 0, parkingAvailable: 1,
    washerDryer: 1, airConditioning: 0, dishwasher: 1,
    utilities: "not_included",
    photos: photo("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80", "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(5), updatedAt: DAYS_AGO(5),
    isSample: true,
  },
  {
    id: -1003,
    userId: -1,
    title: "Co-Living Room — Brooklyn Brownstone",
    description: "Furnished private bedroom in a 5-person co-living brownstone. Shared chef's kitchen, two living rooms, weekly cleaning included. Utilities and Wi-Fi covered.",
    propertyType: "room",
    address: "412 Decatur St",
    city: "Brooklyn", state: "NY", zip: "11233",
    neighborhood: "Bedford-Stuyvesant",
    latitude: 40.6815, longitude: -73.9252,
    monthlyRent: 1450, securityDeposit: 1450,
    bedrooms: "1", bathrooms: "1", squareFeet: 220,
    availableDate: "2026-06-01",
    petFriendly: 0, isCoLiving: 1, parkingAvailable: 0,
    washerDryer: 1, airConditioning: 1, dishwasher: 1,
    utilities: "included",
    photos: photo("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80", "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(1), updatedAt: DAYS_AGO(1),
    isSample: true,
  },
  {
    id: -1004,
    userId: -1,
    title: "Downtown Studio with City Views",
    description: "Sleek high-rise studio on the 22nd floor. Concierge, rooftop pool, gym, and co-working lounge. Walking distance to light rail.",
    propertyType: "studio",
    address: "707 W 7th St, Unit 2203",
    city: "Los Angeles", state: "CA", zip: "90017",
    neighborhood: "Downtown",
    latitude: 34.0481, longitude: -118.2569,
    monthlyRent: 2150, securityDeposit: 1500,
    bedrooms: "studio", bathrooms: "1", squareFeet: 540,
    availableDate: "2026-06-08",
    petFriendly: 1, isCoLiving: 0, parkingAvailable: 1,
    washerDryer: 1, airConditioning: 1, dishwasher: 1,
    utilities: "partial",
    photos: photo("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80", "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(2), updatedAt: DAYS_AGO(2),
    isSample: true,
  },
  {
    id: -1005,
    userId: -1,
    title: "South Loop 1BR with Lake View",
    description: "Bright corner unit with east-facing windows and a partial Lake Michigan view. Hardwood floors, in-unit laundry, gym in building. Steps from Grant Park.",
    propertyType: "apartment",
    address: "1530 S State St, Unit 8F",
    city: "Chicago", state: "IL", zip: "60605",
    neighborhood: "South Loop",
    latitude: 41.8597, longitude: -87.6276,
    monthlyRent: 1875, securityDeposit: 1875,
    bedrooms: "1", bathrooms: "1", squareFeet: 720,
    availableDate: "2026-07-15",
    petFriendly: 1, isCoLiving: 0, parkingAvailable: 1,
    washerDryer: 1, airConditioning: 1, dishwasher: 1,
    utilities: "not_included",
    photos: photo("https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(7), updatedAt: DAYS_AGO(7),
    isSample: true,
  },
  {
    id: -1006,
    userId: -1,
    title: "Townhouse Near Vanderbilt Campus",
    description: "Three-story townhouse with garage, private patio, and modern kitchen. Two minute walk to campus, five minutes to Hillsboro Village restaurants.",
    propertyType: "townhouse",
    address: "2218 Belcourt Ave",
    city: "Nashville", state: "TN", zip: "37212",
    neighborhood: "West End",
    latitude: 36.1361, longitude: -86.8067,
    monthlyRent: 2650, securityDeposit: 2650,
    bedrooms: "3", bathrooms: "2.5", squareFeet: 1820,
    availableDate: "2026-08-01",
    petFriendly: 0, isCoLiving: 0, parkingAvailable: 1,
    washerDryer: 1, airConditioning: 1, dishwasher: 1,
    utilities: "not_included",
    photos: photo("https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(4), updatedAt: DAYS_AGO(4),
    isSample: true,
  },
  {
    id: -1007,
    userId: -1,
    title: "Capitol Hill Condo with Roof Deck",
    description: "Two-bedroom condo in a boutique building, building amenities include rooftop deck with grills and a coffee bar in the lobby.",
    propertyType: "condo",
    address: "1525 11th Ave, Unit 410",
    city: "Seattle", state: "WA", zip: "98122",
    neighborhood: "Capitol Hill",
    latitude: 47.6149, longitude: -122.3170,
    monthlyRent: 2950, securityDeposit: 2950,
    bedrooms: "2", bathrooms: "2", squareFeet: 1080,
    availableDate: "2026-06-30",
    petFriendly: 1, isCoLiving: 0, parkingAvailable: 1,
    washerDryer: 1, airConditioning: 1, dishwasher: 1,
    utilities: "not_included",
    photos: photo("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80", "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(6), updatedAt: DAYS_AGO(6),
    isSample: true,
  },
  {
    id: -1008,
    userId: -1,
    title: "Quiet Suburban 4BR with Pool",
    description: "Single-family home in a top-rated school district. Updated kitchen, screened back porch, in-ground pool, two-car garage. Pet-friendly with deposit.",
    propertyType: "house",
    address: "8842 Magnolia Ridge Ln",
    city: "Charlotte", state: "NC", zip: "28210",
    neighborhood: "SouthPark",
    latitude: 35.1495, longitude: -80.8312,
    monthlyRent: 3450, securityDeposit: 3450,
    bedrooms: "4", bathrooms: "3", squareFeet: 2640,
    availableDate: "2026-07-20",
    petFriendly: 1, isCoLiving: 0, parkingAvailable: 1,
    washerDryer: 1, airConditioning: 1, dishwasher: 1,
    utilities: "not_included",
    photos: photo("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(8), updatedAt: DAYS_AGO(8),
    isSample: true,
  },
  {
    id: -1009,
    userId: -1,
    title: "East Austin 1BR Casita",
    description: "Detached backyard casita with a private entrance, kitchenette, and a small deck. Quiet street, 12 minutes to downtown by bike.",
    propertyType: "other",
    address: "2107 E 12th St",
    city: "Austin", state: "TX", zip: "78702",
    neighborhood: "East Austin",
    latitude: 30.2734, longitude: -97.7165,
    monthlyRent: 1650, securityDeposit: 1650,
    bedrooms: "1", bathrooms: "1", squareFeet: 480,
    availableDate: "2026-06-12",
    petFriendly: 1, isCoLiving: 0, parkingAvailable: 0,
    washerDryer: 0, airConditioning: 1, dishwasher: 0,
    utilities: "included",
    photos: photo("https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&q=80", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(2), updatedAt: DAYS_AGO(2),
    isSample: true,
  },
  {
    id: -1010,
    userId: -1,
    title: "Highland 2BR Walk-Up",
    description: "Charming pre-war walk-up with original detail, a renovated bathroom, and good light. Great corner spot with a coffee shop downstairs.",
    propertyType: "apartment",
    address: "318 Centre St, Unit 3",
    city: "Boston", state: "MA", zip: "02130",
    neighborhood: "Jamaica Plain",
    latitude: 42.3145, longitude: -71.1145,
    monthlyRent: 2475, securityDeposit: 2475,
    bedrooms: "2", bathrooms: "1", squareFeet: 880,
    availableDate: "2026-09-01",
    petFriendly: 1, isCoLiving: 0, parkingAvailable: 0,
    washerDryer: 0, airConditioning: 0, dishwasher: 1,
    utilities: "not_included",
    photos: photo("https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80", "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80"),
    contactName: "Keycove Sample", contactEmail: "samples@keycove.net", contactPhone: null,
    status: "active", portalPropertyId: null,
    viewCount: 0, saveCount: 0,
    createdAt: DAYS_AGO(10), updatedAt: DAYS_AGO(10),
    isSample: true,
  },
];

/** True if the listing is one of the static client-side samples. */
export function isSampleListing(listing: { id: number }): boolean {
  return listing.id < 0;
}

/** Merge samples with real API results. Real listings appear first. */
export function withSampleListings<T extends { id: number }>(real: T[], limit?: number): (T | SampleListing)[] {
  const merged: (T | SampleListing)[] = [...real, ...(SAMPLE_LISTINGS as unknown as T[])];
  return typeof limit === "number" ? merged.slice(0, limit) : merged;
}
