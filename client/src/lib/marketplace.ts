// Shared constants and helpers for the marketplace

export const BRAND = "#1B2B5E";
export const ACCENT = "#4F46E5";

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

// Neutral "no photo" placeholder for real listings that haven't uploaded yet.
// Self-contained SVG data URI — no hot-linking, no rate-limit risk, and clearly
// reads as "empty state" rather than masquerading as a real interior photo.
// Sample listings (negative IDs) bake their own Unsplash URLs into `photos`
// so they never hit this fallback.
const NO_PHOTO_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' preserveAspectRatio='xMidYMid slice'>" +
  "<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>" +
  "<stop offset='0' stop-color='%23f3f4f6'/><stop offset='1' stop-color='%23e5e7eb'/>" +
  "</linearGradient></defs>" +
  "<rect width='800' height='600' fill='url(%23g)'/>" +
  "<g transform='translate(400 270)' fill='none' stroke='%239ca3af' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'>" +
  "<rect x='-80' y='-40' width='160' height='110' rx='12'/>" +
  "<circle cx='0' cy='20' r='32'/>" +
  "<rect x='-28' y='-58' width='56' height='22' rx='5'/>" +
  "</g>" +
  "<text x='400' y='430' font-family='system-ui,-apple-system,Segoe UI,sans-serif' font-size='30' font-weight='600' fill='%239ca3af' text-anchor='middle'>No photos yet</text>" +
  "</svg>";

export const NO_PHOTO_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${NO_PHOTO_SVG}`;

/** Back-compat: a few callsites still import this name. Single-entry array of the SVG placeholder. */
export const PLACEHOLDER_IMAGES = [NO_PHOTO_PLACEHOLDER];

export function hasUploadedPhoto(photosJson: string | null | undefined): boolean {
  return getFirstPhoto(photosJson) !== null;
}

export function getListingImage(photosJson: string | null | undefined, _id?: number): string {
  return getFirstPhoto(photosJson) ?? NO_PHOTO_PLACEHOLDER;
}
