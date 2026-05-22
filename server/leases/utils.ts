// Small formatting helpers shared by every lease template.
import type { LeaseRenderInput } from "./types";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function money(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function fullAddress(input: LeaseRenderInput): string {
  const parts = [input.propertyAddress, input.propertyCity, `${input.propertyState} ${input.propertyZip}`.trim()];
  return parts.filter(Boolean).join(", ");
}

export function termDescription(input: LeaseRenderInput): string {
  if (!input.endDate) return "month-to-month, beginning " + formatDate(input.startDate);
  return `fixed term from ${formatDate(input.startDate)} through ${formatDate(input.endDate)}`;
}

/**
 * Required federal lead-paint disclosure trigger: pre-1978 housing.
 * We always include the lead-paint reference in the lease because (a) we don't
 * know the property's build year here, and (b) including it for post-1978
 * housing is harmless. Landlord still must provide the EPA pamphlet separately
 * for pre-1978 units (24 CFR §35.92).
 */
export const LEAD_PAINT_DISCLOSURE_HTML = `
<section>
  <h2>Federal Lead-Based Paint Disclosure</h2>
  <p>
    Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips
    and dust can pose health hazards if not managed properly. Lead exposure is especially
    harmful to young children and pregnant women. If the Property was built before 1978,
    Landlord shall provide Tenant with the EPA pamphlet
    <em>"Protect Your Family From Lead in Your Home"</em> and any known information
    concerning lead-based paint or lead-based paint hazards, in compliance with
    42 U.S.C. § 4852d and 24 CFR § 35.92.
  </p>
</section>`;
