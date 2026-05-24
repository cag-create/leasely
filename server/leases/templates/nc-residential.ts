// North Carolina residential lease — built from NC General Statutes Chapter 42.
//
// Statutes referenced (all citations preserved in rendered output):
//   § 42-42   Landlord duty to keep premises fit and habitable
//   § 42-43   Tenant obligations
//   § 42-46   Late fee cap: greater of $15 or 5% of monthly rent; only after 5 days late
//   § 42-50   Security deposit cap: 1 wk (weekly), 1 mo (month-to-month), 1.5 mo (longer)
//   § 42-51   Deposit must be in NC bank trust account or bond; written notice w/in 30 days
//   § 42-52   Itemized accounting within 30 days (60 days if accounting incomplete)
//   § 42-14   7-day notice to terminate month-to-month
//   § 42-3    10-day grace before summary ejectment for nonpayment (after demand)
//   § 42-26   Summary ejectment grounds (lease breach)
//
// LEGAL_REVIEW: NC attorney sign-off required before reliance in litigation.

import type { LeaseRenderInput, RenderedLease } from "../types";
import { escapeHtml, money, formatDate, fullAddress, termDescription, LEAD_PAINT_DISCLOSURE_HTML } from "../utils";

const CITATIONS = [
  "N.C. Gen. Stat. § 42-3",
  "N.C. Gen. Stat. § 42-14",
  "N.C. Gen. Stat. § 42-26",
  "N.C. Gen. Stat. § 42-42",
  "N.C. Gen. Stat. § 42-46",
  "N.C. Gen. Stat. § 42-50",
  "N.C. Gen. Stat. § 42-51",
  "N.C. Gen. Stat. § 42-52",
  "42 U.S.C. § 4852d",
];

/**
 * Caps the requested deposit at the statutory maximum (NC GS § 42-50).
 * Returns the legal max plus a flag indicating whether we trimmed.
 */
function capDeposit(input: LeaseRenderInput): { allowed: number; capped: boolean; rule: string } {
  const isFixedTerm = !!input.endDate;
  // Heuristic: if no endDate, treat as month-to-month → 1 month cap.
  // If endDate within 35 days of start, treat as weekly. Otherwise long-term → 1.5 mo.
  if (!isFixedTerm) {
    const cap = input.monthlyRent;
    return { allowed: Math.min(input.securityDeposit, cap), capped: input.securityDeposit > cap, rule: "one month's rent (month-to-month)" };
  }
  const start = new Date(input.startDate).getTime();
  const end = new Date(input.endDate!).getTime();
  const days = (end - start) / (1000 * 60 * 60 * 24);
  if (days <= 35) {
    // Approximate weekly tenancy at 4 weeks
    const cap = Math.round(input.monthlyRent / 4);
    return { allowed: Math.min(input.securityDeposit, cap), capped: input.securityDeposit > cap, rule: "one week's rent (weekly tenancy)" };
  }
  const cap = input.monthlyRent * 1.5;
  return { allowed: Math.min(input.securityDeposit, cap), capped: input.securityDeposit > cap, rule: "one and one-half month's rent (term longer than month-to-month)" };
}

function lateFee(monthlyRent: number): number {
  return Math.max(15, Math.round(monthlyRent * 0.05 * 100) / 100);
}

export function renderNCResidential(input: LeaseRenderInput): RenderedLease {
  const deposit = capDeposit(input);
  const lateFeeCap = lateFee(input.monthlyRent);
  const rentDueDay = input.rentDueDay ?? 1;

  const html = `
<article class="lease-document" data-state="NC" data-tenancy="residential">
  <header>
    <h1>North Carolina Residential Lease Agreement</h1>
    <p class="lease-subtitle">Governed by N.C. Gen. Stat. Chapter 42</p>
  </header>

  <section>
    <h2>1. Parties</h2>
    <p><strong>Landlord:</strong> ${escapeHtml(input.landlordName)}${input.landlordAddress ? `, ${escapeHtml(input.landlordAddress)}` : ""}</p>
    <p><strong>Tenant:</strong> ${escapeHtml(input.tenantName)}${input.tenantEmail ? ` (${escapeHtml(input.tenantEmail)})` : ""}</p>
  </section>

  <section>
    <h2>2. Property</h2>
    <p>Landlord leases to Tenant the residential premises located at <strong>${escapeHtml(fullAddress(input))}</strong> (the "Property").</p>
  </section>

  <section>
    <h2>3. Term</h2>
    <p>This Lease is a ${escapeHtml(termDescription(input))}.</p>
    ${!input.endDate ? `<p>Either party may terminate this month-to-month tenancy by giving the other party written notice at least <strong>seven (7) days</strong> before the end of the current rental period, in accordance with <em>N.C. Gen. Stat. § 42-14</em>.</p>` : ""}
  </section>

  <section>
    <h2>4. Rent</h2>
    <p>Tenant shall pay rent of <strong>${money(input.monthlyRent)} per month</strong>, due on the <strong>${rentDueDay}${ordinal(rentDueDay)}</strong> day of each month.</p>
    <p><strong>Late fee.</strong> If any rental payment is five (5) or more calendar days late, Landlord may charge a late fee of <strong>${money(lateFeeCap)}</strong>, which equals the greater of $15.00 or 5% of the monthly rent, the maximum permitted under <em>N.C. Gen. Stat. § 42-46(a)</em>.</p>
  </section>

  ${input.endDate ? `<section>
    <h2>5. Holdover and Automatic Month-to-Month Conversion</h2>
    <p>Upon expiration of the initial lease term set forth above, if Tenant remains in possession of the Premises with Landlord's consent (express or implied through continued acceptance of rent), this Lease shall automatically convert to a month-to-month tenancy on the same terms and conditions, except as modified herein. Either party may terminate the resulting month-to-month tenancy by giving the other party written notice at least <strong>seven (7) days</strong> before the end of the current rental period, in accordance with <em>N.C. Gen. Stat. § 42-14</em>.</p>
    <p>Rent during any holdover or month-to-month period shall remain at the then-current rate unless adjusted in accordance with the Rent Adjustment clause below.</p>
  </section>` : ""}

  <section>
    <h2>${input.endDate ? 6 : 5}. Rent Adjustment After Twenty-Four (24) Months</h2>
    <p>Beginning <strong>twenty-four (24) months</strong> after the Lease Start Date (${formatDate(input.startDate)}), and on each subsequent twelve-month anniversary thereafter, Landlord reserves the right to increase the monthly Rent by up to <strong>three percent (3%)</strong> of the then-current Rent. Any such increase shall take effect only after Landlord provides Tenant with written notice of the increase no less than <strong>sixty (60) days</strong> prior to the effective date.</p>
    <p>For the avoidance of doubt, no rent increase shall occur during the first twenty-four (24) months of tenancy regardless of lease renewals, holdovers, or conversions to month-to-month. After the 24-month anniversary, increases may compound annually but shall never exceed three percent (3%) per year.</p>
    <p>North Carolina has no statewide rent control; this clause is a contractual cap voluntarily agreed to by Landlord and is enforceable as a term of this Lease.</p>
  </section>

  <section>
    <h2>${input.endDate ? 7 : 6}. Security Deposit</h2>
    <p>Tenant shall deposit <strong>${money(deposit.allowed)}</strong> as a security deposit. ${deposit.capped ? `<em>Note: the amount requested by Landlord was reduced to the statutory maximum of ${deposit.rule} under N.C. Gen. Stat. § 42-50.</em>` : ""}</p>
    <p>Pursuant to <em>N.C. Gen. Stat. § 42-51</em>, the deposit shall be held in a trust account with a licensed and federally insured depository institution located in North Carolina, or secured by a bond. Landlord shall furnish Tenant with written notice of the name and address of the bank or insurance company holding the deposit within <strong>thirty (30) days</strong> of the beginning of the lease term.</p>
    <p>Within <strong>thirty (30) days</strong> after the termination of the tenancy and delivery of possession (or <strong>sixty (60) days</strong> if a final accounting requires additional time), Landlord shall provide Tenant with an itemized accounting of any deductions and shall return the balance of the deposit, in accordance with <em>N.C. Gen. Stat. § 42-52</em>.</p>
  </section>

  ${input.petFriendly ? `<section><h2>${input.endDate ? 8 : 7}. Pets</h2><p>Pets are permitted at the Property${typeof input.petDeposit === "number" && input.petDeposit > 0 ? ` upon payment of a non-refundable pet fee of ${money(input.petDeposit)}` : ""}.</p></section>` : ""}

  <section>
    <h2>${(input.endDate ? 8 : 7) + (input.petFriendly ? 1 : 0)}. Landlord Duties</h2>
    <p>Landlord shall comply with all duties imposed by <em>N.C. Gen. Stat. § 42-42</em>, including keeping the Property in a fit and habitable condition, complying with applicable building and housing codes, making all repairs necessary to keep the Property fit and habitable, and maintaining in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air conditioning, and other facilities and appliances supplied by Landlord.</p>
  </section>

  <section>
    <h2>${(input.endDate ? 9 : 8) + (input.petFriendly ? 1 : 0)}. Tenant Duties</h2>
    <p>Tenant shall comply with the obligations of <em>N.C. Gen. Stat. § 42-43</em>, including keeping the Property as clean and safe as the condition of the premises permits; disposing of garbage in a clean and safe manner; keeping plumbing fixtures clean; not deliberately or negligently destroying, defacing, damaging, or removing any part of the Property; and conducting themselves in a manner that does not disturb neighbors.</p>
  </section>

  <section>
    <h2>${(input.endDate ? 10 : 9) + (input.petFriendly ? 1 : 0)}. Default and Remedies</h2>
    <p><strong>Nonpayment of rent.</strong> If Tenant fails to pay rent when due and remains in default after lawful demand, Landlord may bring an action for summary ejectment pursuant to <em>N.C. Gen. Stat. § 42-3</em> and <em>§ 42-26(a)(1)</em>.</p>
    <p><strong>Breach of Lease.</strong> If Tenant materially breaches any other term of this Lease, Landlord may pursue summary ejectment as permitted by <em>N.C. Gen. Stat. § 42-26(a)(2)</em>.</p>
    <p>Nothing in this Lease waives any notice, cure, or other right afforded to Tenant by North Carolina law. Any provision purporting to waive such rights shall be unenforceable to the extent so prohibited.</p>
  </section>

  ${LEAD_PAINT_DISCLOSURE_HTML}

  <section>
    <h2>Signatures</h2>
    <p>By signing below, the parties acknowledge they have read and agree to be bound by this Lease.</p>
    <div class="signature-block">
      <p><strong>Landlord:</strong> ____________________________ &nbsp; Date: ${formatDate(new Date().toISOString())}</p>
      <p><strong>Tenant:</strong> ____________________________ &nbsp; Date: ____________</p>
    </div>
  </section>

  <footer class="lease-footer">
    <p><em>Generated by Leasely. This document is a starting draft based on the cited North Carolina statutes and federal regulations. It is not a substitute for advice from a licensed North Carolina attorney.</em></p>
  </footer>
</article>`;

  return {
    html,
    state: "NC",
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
