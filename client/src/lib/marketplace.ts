// Shared constants and helpers for the marketplace

export const BRAND = "#1B2B5E";
export const ACCENT = "#F5A623";

export const PROPERTY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "co_living", label: "Co-Living" },
  { value: "studio", label: "Studio" },
  { value: "room", label: "Room Rental" },
  { value: "for_sale", label: "For Sale (FSBO)" },
  { value: "other", label: "Other" },
];

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  condo: "Condo",
  townhouse: "Townhouse",
  co_living: "Co-Living",
  studio: "Studio",
  room: "Room Rental",
  for_sale: "For Sale (FSBO)",
  other: "Other",
};

export const BEDROOM_OPTIONS = [
  { value: "any", label: "Any Beds" },
  { value: "studio", label: "Studio" },
  { value: "1", label: "1 Bed" },
  { value: "2", label: "2 Beds" },
  { value: "3", label: "3 Beds" },
  { value: "4", label: "4 Beds" },
  { value: "5+", label: "5+ Beds" },
];

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

export function formatRent(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPropertyTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    apartment: "🏢",
    house: "🏠",
    condo: "🏙️",
    townhouse: "🏘️",
    co_living: "👥",
    studio: "🛋️",
    room: "🛏️",
    for_sale: "🏡",
    other: "🏗️",
  };
  return icons[type] ?? "🏠";
}

export function parsePhotos(photosJson: string | null | undefined): string[] {
  if (!photosJson) return [];
  try {
    const parsed = JSON.parse(photosJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getFirstPhoto(photosJson: string | null | undefined): string | null {
  const photos = parsePhotos(photosJson);
  return photos[0] ?? null;
}

// Placeholder images for listings without photos
export const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
];

export function getListingImage(photosJson: string | null | undefined, id: number): string {
  const first = getFirstPhoto(photosJson);
  if (first) return first;
  return PLACEHOLDER_IMAGES[id % PLACEHOLDER_IMAGES.length];
}
