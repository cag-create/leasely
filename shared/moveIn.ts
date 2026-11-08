/**
 * "Move to Keycove" import — shared between the wizard (client) and the
 * importer (server). Pure functions only; unit-tested in server/moveIn.test.ts.
 */

export type TargetField =
  | "building" | "address" | "unit" | "city" | "state" | "zip" | "propertyType"
  | "tenantFirstName" | "tenantLastName" | "tenantFullName" | "tenantEmail" | "tenantPhone"
  | "monthlyRent" | "securityDeposit" | "leaseStart" | "leaseEnd" | "rentDueDay" | "lateFee" | "graceDays"
  | "hoaName" | "hoaDues" | "hoaFrequency" | "hoaNextDue" | "hoaPortalUrl";

export const TARGET_FIELDS: { key: TargetField; label: string; group: "Property" | "Tenant" | "Lease" | "HOA"; aliases: string[] }[] = [
  { key: "building", label: "Building / property name", group: "Property", aliases: ["building", "property", "property_name", "community", "complex", "building_name"] },
  { key: "address", label: "Street address", group: "Property", aliases: ["address", "street", "property_address", "address_line_1", "address1", "street_address", "unit_address"] },
  { key: "unit", label: "Unit / room", group: "Property", aliases: ["unit", "unit_number", "unit_id", "apt", "apartment", "unit_label", "room", "room_number", "unit_name", "suite"] },
  { key: "city", label: "City", group: "Property", aliases: ["city", "town"] },
  { key: "state", label: "State", group: "Property", aliases: ["state", "st", "province", "state_code"] },
  { key: "zip", label: "ZIP", group: "Property", aliases: ["zip", "zipcode", "postal_code", "zip_code", "postcode"] },
  { key: "propertyType", label: "Property type", group: "Property", aliases: ["type", "property_type", "propertytype", "unit_type"] },
  { key: "tenantFirstName", label: "Tenant first name", group: "Tenant", aliases: ["tenant_first_name", "first_name", "firstname", "resident_first_name"] },
  { key: "tenantLastName", label: "Tenant last name", group: "Tenant", aliases: ["tenant_last_name", "last_name", "lastname", "resident_last_name"] },
  { key: "tenantFullName", label: "Tenant full name", group: "Tenant", aliases: ["tenant_name", "resident", "resident_name", "tenant", "renter", "name", "tenants", "occupant"] },
  { key: "tenantEmail", label: "Tenant email", group: "Tenant", aliases: ["tenant_email", "email", "resident_email", "email_address", "renter_email"] },
  { key: "tenantPhone", label: "Tenant phone", group: "Tenant", aliases: ["tenant_phone", "phone", "phone_number", "cell", "mobile", "resident_phone"] },
  { key: "monthlyRent", label: "Monthly rent", group: "Lease", aliases: ["monthly_rent", "rent", "lease_rent", "market_rent", "rent_amount", "current_rent", "amount"] },
  { key: "securityDeposit", label: "Security deposit", group: "Lease", aliases: ["security_deposit", "deposit", "deposit_amount", "deposits_held"] },
  { key: "leaseStart", label: "Lease start", group: "Lease", aliases: ["lease_start", "move_in", "start_date", "lease_start_date", "move_in_date", "lease_from"] },
  { key: "leaseEnd", label: "Lease end", group: "Lease", aliases: ["lease_end", "end_date", "lease_end_date", "expiration", "lease_expiration", "lease_to", "move_out"] },
  { key: "rentDueDay", label: "Rent due day", group: "Lease", aliases: ["rent_due_day", "due_day", "due_date_day"] },
  { key: "lateFee", label: "Late fee", group: "Lease", aliases: ["late_fee", "late_fee_amount"] },
  { key: "graceDays", label: "Grace days", group: "Lease", aliases: ["grace_days", "grace", "late_fee_grace", "grace_period"] },
  { key: "hoaName", label: "HOA name", group: "HOA", aliases: ["hoa", "hoa_name", "association", "homeowners_association"] },
  { key: "hoaDues", label: "HOA dues", group: "HOA", aliases: ["hoa_dues", "hoa_fee", "hoa_amount", "association_dues", "hoa_payment"] },
  { key: "hoaFrequency", label: "HOA frequency", group: "HOA", aliases: ["hoa_frequency", "hoa_period", "dues_frequency"] },
  { key: "hoaNextDue", label: "HOA next due date", group: "HOA", aliases: ["hoa_due_date", "hoa_next_due", "dues_due_date"] },
  { key: "hoaPortalUrl", label: "HOA portal URL", group: "HOA", aliases: ["hoa_portal", "hoa_url", "hoa_website"] },
];

export const normHeader = (h: string) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** Header → field using the alias table. Each field is used at most once. */
export function autoMap(headers: string[]): Record<string, TargetField | ""> {
  const used = new Set<TargetField>();
  const out: Record<string, TargetField | ""> = {};
  for (const h of headers) {
    const n = normHeader(h);
    const f = TARGET_FIELDS.find(t => !used.has(t.key) && (t.aliases.includes(n) || normHeader(t.label) === n));
    out[h] = f ? f.key : "";
    if (f) used.add(f.key);
  }
  return out;
}

/** Coarse column type from sample values — sent to the AI instead of real data. */
export function inferColumnType(values: string[]): "empty" | "email" | "phone" | "money" | "date" | "number" | "url" | "text" {
  const v = values.map(x => String(x ?? "").trim()).filter(Boolean).slice(0, 20);
  if (!v.length) return "empty";
  const all = (re: RegExp) => v.every(x => re.test(x));
  if (all(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) return "email";
  if (all(/^https?:\/\//i)) return "url";
  if (all(/^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) return "date";
  if (all(/^\$\s?[\d,]+(\.\d{1,2})?$|^[\d,]+\.\d{2}$/)) return "money";
  if (all(/^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)) return "phone";
  if (all(/^-?[\d,]+(\.\d+)?$/)) return "number";
  return "text";
}

export function toCents(s: string | undefined): number | undefined {
  if (s == null || String(s).trim() === "") return undefined;
  const n = parseFloat(String(s).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
}

/** 2025-06-01, 06/01/2025, 6/1/25, Excel serial 45809 → YYYY-MM-DD ("" if unknown). */
export function normDate(s: string | undefined): string {
  const t = String(s ?? "").trim();
  if (!t) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, mo, d, y] = m;
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{5}$/.test(t)) { // Excel serial date
    const ms = (Number(t) - 25569) * 86_400_000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  return "";
}

const STREET_ABBR: Record<string, string> = {
  street: "st", avenue: "ave", road: "rd", drive: "dr", boulevard: "blvd", lane: "ln", court: "ct",
  place: "pl", terrace: "ter", circle: "cir", highway: "hwy", parkway: "pkwy", north: "n", south: "s", east: "e", west: "w",
};

/** Normalized street address used to match rows to existing properties. */
export function normalizeAddress(address: string): string {
  return String(address ?? "")
    .toLowerCase()
    .replace(/[.,#]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(w => STREET_ABBR[w] ?? w)
    .join(" ");
}

export const normalizeUnit = (unit: string | undefined) =>
  String(unit ?? "").toLowerCase().replace(/^(apt|apartment|unit|suite|ste|room|rm|#)\s*/i, "").replace(/[^a-z0-9]/g, "");

/** Dedupe key: one CRM property per address + unit. */
export const propertyKey = (address: string, unit?: string) => `${normalizeAddress(address)}|${normalizeUnit(unit)}`;

/**
 * How the existing importer stored a unit's address ("812 Maple Ave #4B",
 * "12 Oak St · Rm 3"). Splitting it back lets re-imports match old rows.
 */
export function splitStoredAddress(stored: string): { address: string; unit: string } {
  const room = stored.match(/^(.*?)\s*·\s*Rm\s+(.+)$/);
  if (room) return { address: room[1], unit: room[2] };
  const hash = stored.match(/^(.*?)\s+#\s*([\w-]+)$/);
  if (hash) return { address: hash[1], unit: hash[2] };
  return { address: stored, unit: "" };
}

export type ImportRow = {
  building?: string; address: string; unit?: string; city?: string; state?: string; zip?: string; propertyType?: string;
  tenantFirstName?: string; tenantLastName?: string; tenantEmail?: string; tenantPhone?: string;
  monthlyRentCents?: number; securityDepositCents?: number; leaseStart?: string; leaseEnd?: string;
  rentDueDay?: number; lateFeeCents?: number; graceDays?: number;
  hoaName?: string; hoaDuesCents?: number; hoaFrequency?: "monthly" | "quarterly" | "semiannual" | "annual"; hoaNextDue?: string; hoaPortalUrl?: string;
};

function freq(s: string | undefined): ImportRow["hoaFrequency"] {
  const t = String(s ?? "").toLowerCase();
  if (!t) return undefined;
  if (t.startsWith("q")) return "quarterly";
  if (t.includes("semi") || t.includes("6") || t.includes("half")) return "semiannual";
  if (t.startsWith("a") || t.startsWith("y")) return "annual";
  return "monthly";
}

/** Apply a column mapping to a raw sheet row and validate it. */
export function buildRow(raw: Record<string, string>, mapping: Record<string, TargetField | "">): { row: ImportRow; errors: string[] } {
  const get = (f: TargetField) => {
    const h = Object.keys(mapping).find(k => mapping[k] === f);
    return h ? String(raw[h] ?? "").trim() : "";
  };
  let first = get("tenantFirstName");
  let last = get("tenantLastName");
  const full = get("tenantFullName");
  if (!first && full) {
    if (full.includes(",")) { const [l, f] = full.split(","); last = last || l.trim(); first = (f ?? "").trim(); }
    else { const parts = full.split(/\s+/); first = parts[0] ?? ""; last = last || parts.slice(1).join(" "); }
  }
  const state = get("state").toUpperCase();
  const row: ImportRow = {
    building: get("building") || undefined,
    address: get("address"),
    unit: get("unit") || undefined,
    city: get("city") || undefined,
    state: state || undefined,
    zip: get("zip") || undefined,
    propertyType: get("propertyType") || undefined,
    tenantFirstName: first || undefined,
    tenantLastName: last || undefined,
    tenantEmail: get("tenantEmail").toLowerCase() || undefined,
    tenantPhone: get("tenantPhone") || undefined,
    monthlyRentCents: toCents(get("monthlyRent")),
    securityDepositCents: toCents(get("securityDeposit")),
    leaseStart: normDate(get("leaseStart")) || undefined,
    leaseEnd: normDate(get("leaseEnd")) || undefined,
    rentDueDay: get("rentDueDay") ? Math.min(28, Math.max(1, parseInt(get("rentDueDay"), 10) || 1)) : undefined,
    lateFeeCents: toCents(get("lateFee")),
    graceDays: get("graceDays") ? Math.min(31, Math.max(0, parseInt(get("graceDays"), 10) || 0)) : undefined,
    hoaName: get("hoaName") || undefined,
    hoaDuesCents: toCents(get("hoaDues")),
    hoaFrequency: freq(get("hoaFrequency")),
    hoaNextDue: normDate(get("hoaNextDue")) || undefined,
    hoaPortalUrl: get("hoaPortalUrl") || undefined,
  };
  return { row, errors: validateRow(row) };
}

export function validateRow(r: ImportRow): string[] {
  const e: string[] = [];
  if (!r.address?.trim()) e.push("Missing address");
  if (r.state && !/^[A-Z]{2}$/.test(r.state)) e.push("State should be 2 letters");
  if (r.tenantEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.tenantEmail)) e.push("Tenant email looks wrong");
  const hasTenant = !!(r.tenantFirstName || r.tenantEmail);
  if (hasTenant) {
    if (!r.tenantFirstName) e.push("Tenant needs a name");
    if (!r.monthlyRentCents) e.push("Tenant row needs monthly rent");
    if (!r.leaseStart) e.push("Tenant row needs a lease start date");
  }
  if (r.leaseEnd && r.leaseStart && r.leaseEnd < r.leaseStart) e.push("Lease ends before it starts");
  if ((r.hoaDuesCents || r.hoaNextDue) && !r.hoaName) e.push("HOA dues need an HOA name");
  return e;
}

/** Google Sheets share link → CSV export URL (null if it isn't one). */
export function googleSheetCsvUrl(link: string): string | null {
  try {
    const u = new URL(link.trim());
    if (u.hostname !== "docs.google.com") return null;
    const m = u.pathname.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!m) return null;
    const gid = u.searchParams.get("gid") ?? u.hash.match(/gid=(\d+)/)?.[1] ?? "0";
    return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${gid}`;
  } catch {
    return null;
  }
}
