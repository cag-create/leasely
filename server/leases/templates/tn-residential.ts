// Tennessee residential lease — built from the Uniform Residential Landlord
// and Tenant Act (URLTA), Title 66 Chapter 28.
//
// Statutes referenced:
//   § 66-28-102  Applicability — URLTA applies only in counties with population > 75,000
//   § 66-28-201  Late fee cap: 10% of past-due rent, after 5-day grace
//   § 66-28-301  Security deposits — separate federally insured TN bank account, written
//                notice of bank name/address at signing, 30-day itemized accounting, 60-day
//                claim window
//   § 66-28-302  Landlord identification disclosure
//   § 66-28-305  Required disclosure of landlord/agent identity
//   § 66-28-505  14-day cure notice for material breach; 14-day terminate notice if not curable
//   § 66-28-512  30-day notice to terminate month-to-month periodic tenancy
//
// URLTA-COUNTY-LIST as of 2024: Anderson, Blount, Bradley, Davidson, Hamilton,
// Knox, Madison, Maury, Montgomery, Rutherford, Sevier, Shelby, Sullivan,
// Sumner, Washington, Williamson, Wilson. The template includes a notice that
// non-URLTA counties have somewhat different rules (esp. for late fees / cure).
//
// LEGAL_REVIEW: TN attorney sign-off required before reliance in litigation.

import type { LeaseRenderInput, RenderedLease } from "../types";
import { escapeHtml, money, formatDate, fullAddress, termDescription, LEAD_PAINT_DISCLOSURE_HTML } from "../utils";

const URLTA_COUNTIES = [
  "Anderson", "Blount", "Bradley", "Davidson", "Hamilton", "Knox", "Madison",
  "Maury", "Montgomery", "Rutherford", "Sevier", "Shelby", "Sullivan",
  "Sumner", "Washington", "Williamson", "Wilson",
];

const CITATIONS = [
  "Tenn. Code Ann. § 66-28-102",
  "Tenn. Code Ann. § 66-28-201",
  "Tenn. Code Ann. § 66-28-301",
  "Tenn. Code Ann. § 66-28-302",
  "Tenn. Code Ann. § 66-28-305",
  "Tenn. Code Ann. § 66-28-505",
  "Tenn. Code Ann. § 66-28-512",
  "42 U.S.C. § 4852d",
];

export function renderTNResidential(input: LeaseRenderInput): RenderedLease {
  const lateFeeCap = Math.round(input.monthlyRent * 0.10 * 100) / 100; // 10% URLTA cap
  const rentDueDay = input.rentDueDay ?? 1;

  const html = `
<article class="lease-document" data-state="TN" data-tenancy="residential">
  <header>
    <h1>Tennessee Residential Lease Agreement</h1>
    <p class="lease-subtitle">Governed by the Uniform Residential Landlord and Tenant Act (URLTA), Tenn. Code Ann. § 66-28-101 et seq., where applicable</p>
  </header>

  <section>
    <h2>1. Parties</h2>
    <p><strong>Landlord:</strong> ${escapeHtml(input.landlordName)}${input.landlordAddress ? `, ${escapeHtml(input.landlordAddress)}` : ""}</p>
    <p><strong>Tenant:</strong> ${escapeHtml(input.tenantName)}${input.tenantEmail ? ` (${escapeHtml(input.tenantEmail)})` : ""}</p>
    <p><em>Pursuant to Tenn. Code Ann. § 66-28-302, Landlord identifies themselves above as the person authorized to manage the Property and receive notices.</em></p>
  </section>

  <section>
    <h2>2. Property</h2>
    <p>Landlord leases to Tenant the residential premises located at <strong>${escapeHtml(fullAddress(input))}</strong> (the "Property").</p>
  </section>

  <section>
    <h2>3. Applicability of URLTA</h2>
    <p>The Uniform Residential Landlord and Tenant Act, Tenn. Code Ann. § 66-28-101 et seq., applies only in counties with a population greater than seventy-five thousand (75,000) as set forth in <em>Tenn. Code Ann. § 66-28-102</em>. Those counties include: ${URLTA_COUNTIES.join(", ")}. If the Property is located in a non-URLTA county, certain provisions of this Lease — including the late-fee cap and the 14-day cure procedure — operate as contractual ceilings rather than statutory mandates.</p>
  </section>

  <section>
    <h2>4. Term</h2>
    <p>This Lease is a ${escapeHtml(termDescription(input))}.</p>
    ${!input.endDate ? `<p>Either party may terminate this month-to-month tenancy by giving written notice to the other at least <strong>thirty (30) days</strong> before the next periodic rental date, in accordance with <em>Tenn. Code Ann. § 66-28-512</em>.</p>` : ""}
  </section>

  <section>
    <h2>5. Rent</h2>
    <p>Tenant shall pay rent of <strong>${money(input.monthlyRent)} per month</strong>, due on the <strong>${rentDueDay}${ordinal(rentDueDay)}</strong> day of each month.</p>
    <p><strong>Late fee.</strong> Pursuant to <em>Tenn. Code Ann. § 66-28-201(d)</em>, no late fee may be charged until rent is at least <strong>five (5) days</strong> past due. The late fee is capped at <strong>10% of the past-due rent</strong>; for the rent amount above, that is up to <strong>${money(lateFeeCap)}</strong>.</p>
  </section>

  ${input.endDate ? `<section>
    <h2>6. Holdover and Automatic Month-to-Month Conversion</h2>
    <p>Upon expiration of the initial lease term set forth above, if Tenant remains in possession of the Premises with Landlord's consent (express or implied through continued acceptance of rent), this Lease shall automatically convert to a month-to-month tenancy on the same terms and conditions, except as modified herein. Either party may terminate the resulting month-to-month tenancy by providing the other party with written notice no less than <strong>thirty (30) days</strong> prior to the intended termination date, as required by <em>Tenn. Code Ann. § 66-28-512</em>.</p>
    <p>Rent during any holdover or month-to-month period shall remain at the then-current rate unless adjusted in accordance with the Rent Adjustment clause below.</p>
  </section>` : ""}

  <section>
    <h2>${input.endDate ? 7 : 6}. Rent Adjustment After Twenty-Four (24) Months</h2>
    <p>Beginning <strong>twenty-four (24) months</strong> after the Lease Start Date (${formatDate(input.startDate)}), and on each subsequent twelve-month anniversary thereafter, Landlord reserves the right to increase the monthly Rent by up to <strong>three percent (3%)</strong> of the then-current Rent. Any such increase shall take effect only after Landlord provides Tenant with written notice of the increase no less than <strong>sixty (60) days</strong> prior to the effective date.</p>
    <p>For the avoidance of doubt, no rent increase shall occur during the first twenty-four (24) months of tenancy regardless of lease renewals, holdovers, or conversions to month-to-month. After the 24-month anniversary, increases may compound annually but shall never exceed three percent (3%) per year.</p>
    <p>Tennessee has no statewide rent control; this clause is a contractual cap voluntarily agreed to by Landlord and is enforceable as a term of this Lease.</p>
  </section>

  <section>
    <h2>${input.endDate ? 8 : 7}. Security Deposit</h2>
    <p>Tenant shall deposit <strong>${money(input.securityDeposit)}</strong> as a security deposit. Tennessee URLTA does not statutorily cap the amount; the figure above reflects the parties' agreement.</p>
    <p>Pursuant to <em>Tenn. Code Ann. § 66-28-301</em>: The deposit shall be held in a <strong>separate account in a federally insured bank or financial institution located in Tennessee</strong>, used solely for that purpose. Landlord shall inform Tenant in writing, at the time this Lease is signed, of the <strong>name and address of the bank</strong> holding the deposit.</p>
    <p>Within <strong>thirty (30) days</strong> after the end of the tenancy or after Tenant vacates the Property (whichever is later), Landlord shall provide Tenant with a written, itemized list of any damages and the amount of the deposit being retained. If Tenant does not claim the remaining balance within <strong>sixty (60) days</strong> after Landlord sends notice, Landlord may remove the funds from the separate account.</p>
    <p>The deposit may be applied only to (a) unpaid rent and (b) damage exceeding normal wear and tear.</p>
  </section>

  ${input.petFriendly ? `<section><h2>${input.endDate ? 9 : 8}. Pets</h2><p>Pets are permitted at the Property${typeof input.petDeposit === "number" && input.petDeposit > 0 ? ` upon payment of a non-refundable pet fee of ${money(input.petDeposit)}` : ""}.</p></section>` : ""}

  <section>
    <h2>${(input.endDate ? 9 : 8) + (input.petFriendly ? 1 : 0)}. Default and Cure</h2>
    <p><strong>Material noncompliance.</strong> Pursuant to <em>Tenn. Code Ann. § 66-28-505</em>, if Tenant materially breaches this Lease in a manner that can be cured by payment of rent, repair costs, damages, or other amount due, Landlord may give Tenant written notice that this Lease will terminate if the breach is not cured within <strong>fourteen (14) days</strong> after receipt of the notice. For non-remediable breaches, the Lease shall terminate on a date not less than fourteen (14) days after receipt of the notice.</p>
    <p>This Section does not waive any right Landlord or Tenant has under Tennessee law, including expedited remedies for criminal activity or substantial damage that endangers other persons or property.</p>
  </section>

  <section>
    <h2>${(input.endDate ? 10 : 9) + (input.petFriendly ? 1 : 0)}. Landlord Access</h2>
    <p>Landlord may enter the Property at reasonable times after giving Tenant <strong>at least 24 hours' notice</strong>, except in cases of emergency.</p>
  </section>

  ${LEAD_PAINT_DISCLOSURE_HTML}

  <section>
    <h2>Signatures</h2>
    <div class="signature-block">
      <p><strong>Landlord:</strong> ____________________________ &nbsp; Date: ${formatDate(new Date().toISOString())}</p>
      <p><strong>Tenant:</strong> ____________________________ &nbsp; Date: ____________</p>
    </div>
  </section>

  <footer class="lease-footer">
    <p><em>Generated by Keycove. This document is a starting draft based on the cited Tennessee statutes and federal regulations. A licensed Tennessee attorney should review before reliance in litigation.</em></p>
  </footer>
</article>`;

  return {
    html,
    state: "TN",
    tenancyType: "residential",
    citations: CITATIONS,
    needsAttorneyReview: true,
  };
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
