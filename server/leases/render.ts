// Lease render engine.
//
// Templates are stored in the DB (lease_templates / lease_template_versions).
// The body is HTML with {{variable_name}} placeholders. This module replaces
// the placeholders with the user's submitted values, escaping HTML in user
// input so they cannot inject markup, and returns the rendered HTML plus a
// list of any unresolved variables (so callers can surface a clear error
// instead of shipping a lease with `{{tenant_name}}` still in the text).

import { escapeHtml, money, formatDate } from "./utils";

export interface RenderVariables {
  landlord_name?: string;
  landlord_address?: string;
  tenant_name?: string;
  tenant_email?: string;
  property_address?: string;
  property_city?: string;
  state?: string;
  property_zip?: string;
  monthly_rent?: number | string;
  security_deposit?: number | string;
  lease_start_date?: string;
  lease_end_date?: string;
  rent_due_day?: number | string;
  late_fee?: number | string;
  utilities?: string;
  pets_allowed?: boolean | string;
  parking?: string;
  occupants?: string;
  co_living_rules?: string;
  // Open extension — callers can pass any extra placeholder.
  [k: string]: unknown;
}

export interface RenderResult {
  html: string;
  unresolved: string[];        // any {{var}} that wasn't filled
  warnings: string[];          // soft warnings (e.g. NC deposit cap exceeded)
  citationsUsed: string[];     // statute citations preserved from template metadata
}

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

/**
 * Formats a variable value for safe insertion into the rendered HTML.
 * - Numeric money fields (monthly_rent, security_deposit, late_fee) are
 *   formatted as $X,XXX.XX.
 * - Date fields (lease_start_date, lease_end_date) are formatted long-form.
 * - Booleans render as "Yes" / "No".
 * - Everything else is HTML-escaped.
 */
function formatValue(key: string, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (key === "monthly_rent" || key === "security_deposit" || key === "late_fee" || key === "pet_fee") {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isNaN(n)) return money(n);
  }
  if (key === "lease_start_date" || key === "lease_end_date") {
    return formatDate(String(value));
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return escapeHtml(String(value));
}

export function renderTemplate(bodyHtml: string, vars: RenderVariables, citations: string[] = []): RenderResult {
  const unresolved = new Set<string>();
  const warnings: string[] = [];

  // Derive a combined landlord display string so legacy templates that only
  // reference {{landlord_name}} still show the company / DBA when both are
  // provided. Keeps the two fields editable independently in the UI while
  // requiring no template body changes.
  const effectiveVars: RenderVariables = { ...vars };
  const llName = typeof effectiveVars.landlord_name === "string" ? effectiveVars.landlord_name.trim() : "";
  const llCompany = typeof effectiveVars.landlord_company === "string" ? effectiveVars.landlord_company.trim() : "";
  if (llName && llCompany) {
    effectiveVars.landlord_name = `${llName}, ${llCompany}`;
  }

  const html = bodyHtml.replace(PLACEHOLDER_RE, (_match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(effectiveVars, name) && effectiveVars[name] !== undefined && effectiveVars[name] !== null && effectiveVars[name] !== "") {
      return formatValue(name, effectiveVars[name]);
    }
    unresolved.add(name);
    return `<span class="lease-unresolved" data-var="${escapeHtml(name)}">[${escapeHtml(name)} — required]</span>`;
  });

  // Soft compliance warnings — state-specific guardrails that don't block
  // rendering but surface to the landlord on the preview screen.
  if (typeof vars.state === "string" && vars.state.toUpperCase() === "NC") {
    const rent = Number(vars.monthly_rent);
    const dep = Number(vars.security_deposit);
    if (!Number.isNaN(rent) && !Number.isNaN(dep) && dep > rent * 1.5 && vars.lease_end_date) {
      warnings.push(
        `North Carolina caps the security deposit at 1.5 months' rent (max $${(rent * 1.5).toFixed(2)}) for terms longer than month-to-month under N.C. Gen. Stat. § 42-50. The amount entered ($${dep.toFixed(2)}) exceeds the statutory cap and is unenforceable to the extent of the excess; the tenant is entitled to recover the excess plus reasonable attorney's fees under § 42-52.`,
      );
    }
  }

  return {
    html,
    unresolved: Array.from(unresolved),
    warnings,
    citationsUsed: citations,
  };
}

/**
 * Convenience: render directly from a known compiled-in template (NC/TN) if
 * the DB seed hasn't been run yet. After seeding, callers should fetch the
 * active template version from the DB and pass `bodyHtml` to `renderTemplate`.
 */
export function defaultGenericTemplateBody(): string {
  // Minimal multi-state generic body. State-specific clauses override this
  // when the lease's state has its own template row in the DB.
  return `
<article class="lease-document" data-template="generic">
  <header>
    <h1>Residential Lease Agreement</h1>
    <p class="lease-subtitle">For premises located in {{state}}</p>
  </header>
  <section><h2>1. Parties</h2><p><strong>Landlord:</strong> {{landlord_name}}<br/><strong>Tenant:</strong> {{tenant_name}} ({{tenant_email}})</p></section>
  <section><h2>2. Property</h2><p>{{property_address}}, {{property_city}}, {{state}} {{property_zip}}</p></section>
  <section><h2>3. Term</h2><p>From {{lease_start_date}} through {{lease_end_date}}.</p></section>
  <section><h2>4. Rent</h2><p>{{monthly_rent}} per month, due on the {{rent_due_day}} of each month. Late fee: {{late_fee}}.</p></section>
  <section><h2>5. Security Deposit</h2><p>{{security_deposit}}, to be held in accordance with applicable state law.</p></section>
  <section><h2>6. Utilities</h2><p>{{utilities}}</p></section>
  <section><h2>7. Occupants &amp; Pets</h2><p>Authorized occupants: {{occupants}}. Pets allowed: {{pets_allowed}}.</p></section>
  <section><h2>8. Parking</h2><p>{{parking}}</p></section>
  <section><h2>9. Eviction Procedure</h2><p>If Landlord seeks to recover possession of the Property, Landlord will follow the eviction procedure required by the law of the state where the Property is located. Nothing in this Lease waives any procedural protection, notice, or cure right the Tenant has under that law.</p></section>
  <section class="legal-disclaimer"><p><em>This document was generated using a multi-state generic template. State-specific protections and required disclosures may not be reflected. A licensed attorney in the applicable state should review before reliance.</em></p></section>
  <section><h2>Signatures</h2><div class="signature-block"><p><strong>Landlord:</strong> __________________________</p><p><strong>Tenant:</strong> __________________________</p></div></section>
</article>`;
}
