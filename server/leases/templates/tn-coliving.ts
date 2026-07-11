// Tennessee Co-Living Membership Agreement.
//
// Membership / occupancy license language is used for operational purposes —
// house rules enforcement, room reassignment, common-area governance — NOT to
// avoid Tennessee eviction procedure. If the Member has possession of any
// space in the Residence, removal must follow the applicable Tennessee
// detainer / eviction statute (Tenn. Code Ann. § 29-18-101 et seq., or
// URLTA where the county is covered). Membership framing does not waive
// these protections.
//
// LEGAL_REVIEW: TN attorney sign-off required.

import type { LeaseRenderInput, RenderedLease } from "../types";
import { escapeHtml, money, formatDate, fullAddress, LEAD_PAINT_DISCLOSURE_HTML } from "../utils";

const CITATIONS = [
  "Tenn. Code Ann. § 66-28-201 (late fee — ceiling applied conservatively)",
  "Tenn. Code Ann. § 66-28-301 (deposit handling — applied conservatively)",
  "Tenn. Code Ann. § 66-28-505 (cure framework — preserved)",
  "Tenn. Code Ann. § 66-28-512 (periodic termination — preserved)",
  "42 U.S.C. § 4852d",
];

export function renderTNCoLiving(input: LeaseRenderInput): RenderedLease {
  const lateFeeCap = Math.round(input.monthlyRent * 0.10 * 100) / 100;
  const roomLabel = input.unitOrRoomLabel || "the assigned Member Room";

  const html = `
<article class="lease-document" data-state="TN" data-tenancy="coliving_membership">
  <header>
    <h1>Tennessee Co-Living Membership Agreement</h1>
    <p class="lease-subtitle">A license to occupy designated space within a shared residence — not a residential tenancy</p>
  </header>

  <section>
    <h2>1. Parties</h2>
    <p><strong>Operator:</strong> ${escapeHtml(input.landlordName)}${input.landlordAddress ? `, ${escapeHtml(input.landlordAddress)}` : ""}</p>
    <p><strong>Member:</strong> ${escapeHtml(input.tenantName)}${input.tenantEmail ? ` (${escapeHtml(input.tenantEmail)})` : ""}</p>
  </section>

  <section>
    <h2>2. Nature of This Agreement</h2>
    <p>This Agreement is a <strong>membership and occupancy license</strong>, not a residential lease. Member acknowledges that:</p>
    <ul>
      <li>Member receives a <strong>non-exclusive right to occupy</strong> ${escapeHtml(roomLabel)} and to use the common areas of the residence located at <strong>${escapeHtml(fullAddress(input))}</strong> (the "Residence").</li>
      <li>Operator retains the right to enter ${escapeHtml(roomLabel)} with at least <strong>24 hours' notice</strong>, except in emergencies, to inspect, maintain, and assure the safety of all Members.</li>
      <li>Operator may, upon <strong>thirty (30) days' written notice</strong>, reassign Member to a different room of comparable size and fee within the Residence.</li>
      <li>This Agreement does not convey any interest in real property.</li>
    </ul>
    <p><strong>Eviction procedure notice.</strong> If Operator seeks to remove Member from possession of the Residence, Operator will follow Tennessee's applicable eviction procedure (the Forcible Entry and Detainer statute, Tenn. Code Ann. § 29-18-101 et seq., or URLTA, Tenn. Code Ann. § 66-28-101 et seq., where applicable) regardless of the membership framing of this Agreement. Nothing here waives any procedural protection, notice, or cure right Member would otherwise have. If a court determines this Agreement creates a residential tenancy, the rights afforded by Tenn. Code Ann. § 66-28-101 et seq. apply in full.</p>
  </section>

  <section>
    <h2>3. Membership Fee</h2>
    <p>Member shall pay a monthly membership fee of <strong>${money(input.monthlyRent)}</strong>, due on the ${input.rentDueDay ?? 1}${ordinal(input.rentDueDay ?? 1)} of each month. The fee covers the right to occupy ${escapeHtml(roomLabel)}, use of common areas, and shared utilities${input.utilitiesIncluded ? ` (${escapeHtml(input.utilitiesIncluded)})` : ""}.</p>
    <p><strong>Late charge.</strong> No late charge accrues unless the fee is at least five (5) days past due, with a maximum of <strong>${money(lateFeeCap)}</strong> (10% of the past-due fee). This conservatively tracks the URLTA late-fee cap at <em>Tenn. Code Ann. § 66-28-201(d)</em>.</p>
  </section>

  <section>
    <h2>4. Refundable Member Deposit</h2>
    <p>Member shall provide a refundable deposit of <strong>${money(input.securityDeposit)}</strong> upon execution of this Agreement. Operator shall hold the deposit in a separate account at a federally insured bank or financial institution located in Tennessee and shall inform Member of the bank's name and address. Within <strong>thirty (30) days</strong> after termination of membership and surrender of the room, Operator shall provide a written itemization of any deductions and return the balance. If Member does not claim the remaining balance within <strong>sixty (60) days</strong> after notice, Operator may remove the funds from the separate account, consistent with <em>Tenn. Code Ann. § 66-28-301</em>.</p>
  </section>

  <section>
    <h2>5. Term and Termination</h2>
    <p>This Agreement begins on <strong>${formatDate(input.startDate)}</strong>${input.endDate ? ` and continues through <strong>${formatDate(input.endDate)}</strong>` : ` on a month-to-month basis`}. Either party may terminate upon <strong>thirty (30) days' written notice</strong>.</p>
    <p>For material breach of house rules, threat to safety, illegal activity at the Residence, or failure to pay the membership fee, Operator may give Member written notice that this Agreement will terminate if the breach is not cured within fourteen (14) days, consistent with <em>Tenn. Code Ann. § 66-28-505</em> to the extent applicable.</p>
  </section>

  <section>
    <h2>6. House Rules</h2>
    <p>Member agrees to abide by the Residence's written House Rules, incorporated by reference. Operator may amend the House Rules upon thirty (30) days' notice; amendments shall not unreasonably alter the core benefits of this membership.</p>
  </section>

  <section>
    <h2>7. No Subletting or Assignment</h2>
    <p>This membership is personal to Member. Member may not assign this Agreement or sublet ${escapeHtml(roomLabel)} or any portion of the Residence. Guests may stay no longer than seven (7) consecutive nights without Operator's written consent.</p>
  </section>

  ${LEAD_PAINT_DISCLOSURE_HTML}

  <section>
    <h2>Signatures</h2>
    <div class="signature-block">
      <p><strong>Operator:</strong> ____________________________ &nbsp; Date: ${formatDate(new Date().toISOString())}</p>
      <p><strong>Member:</strong> ____________________________ &nbsp; Date: ____________</p>
    </div>
  </section>

  <footer class="lease-footer">
    <p><em>Generated by Keycove. The membership framing is for house-rules and room-assignment purposes only — it does not change the eviction procedure Operator must follow to remove a Member from possession. A licensed Tennessee attorney should review before reliance in litigation.</em></p>
  </footer>
</article>`;

  return {
    html,
    state: "TN",
    tenancyType: "coliving_membership",
    citations: CITATIONS,
    needsAttorneyReview: true,
  };
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
