// North Carolina Co-Living Membership Agreement.
//
// Co-living arrangements use MEMBERSHIP / OCCUPANCY LICENSE language for
// operational reasons — house rules enforcement, room reassignment within the
// residence, and shared-common-area governance — NOT to avoid eviction law.
//
// IMPORTANT: If the occupant has actual possession of any space within the
// residence, removal must follow North Carolina's statutory eviction
// procedure (NC GS § 42-25.6 et seq., summary ejectment). Calling the
// arrangement a "membership" does not waive the occupant's right to those
// procedural protections, and we do not represent otherwise to the Member.
//
// LEGAL_REVIEW: This framing has not been blessed by NC courts in a published
// opinion. A NC real-estate attorney must review before relying on the
// "membership" status to short-circuit eviction procedures.

import type { LeaseRenderInput, RenderedLease } from "../types";
import { escapeHtml, money, formatDate, fullAddress, LEAD_PAINT_DISCLOSURE_HTML } from "../utils";

const CITATIONS = [
  "N.C. Gen. Stat. § 42-14 (referenced — applies if relationship is recharacterized)",
  "N.C. Gen. Stat. § 42-26 (referenced — applies if relationship is recharacterized)",
  "N.C. Gen. Stat. § 42-46 (late fee cap — applied as conservative ceiling)",
  "N.C. Gen. Stat. § 42-50 (deposit cap — applied as conservative ceiling)",
  "42 U.S.C. § 4852d",
];

export function renderNCCoLiving(input: LeaseRenderInput): RenderedLease {
  const lateFeeCap = Math.max(15, Math.round(input.monthlyRent * 0.05 * 100) / 100);
  const depositCap = Math.min(input.securityDeposit, input.monthlyRent * 1.5);
  const wasCapped = input.securityDeposit > input.monthlyRent * 1.5;
  const roomLabel = input.unitOrRoomLabel || "the assigned Member Room";

  const html = `
<article class="lease-document" data-state="NC" data-tenancy="coliving_membership">
  <header>
    <h1>North Carolina Co-Living Membership Agreement</h1>
    <p class="lease-subtitle">A license to occupy designated space within a shared residence — not a residential tenancy</p>
  </header>

  <section>
    <h2>1. Parties</h2>
    <p><strong>Operator:</strong> ${escapeHtml(input.landlordName)}${input.landlordAddress ? `, ${escapeHtml(input.landlordAddress)}` : ""}</p>
    <p><strong>Member:</strong> ${escapeHtml(input.tenantName)}${input.tenantEmail ? ` (${escapeHtml(input.tenantEmail)})` : ""}</p>
  </section>

  <section>
    <h2>2. Nature of This Agreement</h2>
    <p>This is a <strong>membership and occupancy license</strong>, not a lease or rental agreement. Member acknowledges and agrees that:</p>
    <ul>
      <li>Member receives a <strong>non-exclusive right to occupy</strong> ${escapeHtml(roomLabel)} and to use the shared common areas of the residence located at <strong>${escapeHtml(fullAddress(input))}</strong> (the "Residence").</li>
      <li>Operator retains the right to enter ${escapeHtml(roomLabel)} for inspection, maintenance, and the safety of other Members with <strong>twenty-four (24) hours' advance notice</strong>, except in cases of emergency.</li>
      <li>Operator may, upon <strong>thirty (30) days' written notice</strong>, reassign Member to a different room of comparable size and rent within the Residence.</li>
      <li>This Agreement does not convey any interest in real property to Member.</li>
    </ul>
    <p><strong>Eviction procedure notice.</strong> If Operator seeks to remove Member from possession of the Residence, Operator will follow the applicable North Carolina eviction procedure (summary ejectment under N.C. Gen. Stat. § 42-25.6 et seq.), regardless of the membership framing of this Agreement. Nothing in this Agreement waives any procedural protection, notice, or cure right that Member would otherwise have under North Carolina law. If a court determines that this Agreement creates a residential tenancy, the rights afforded by N.C. Gen. Stat. Chapter 42 apply in full.</p>
  </section>

  <section>
    <h2>3. Membership Fee</h2>
    <p>Member shall pay a monthly membership fee of <strong>${money(input.monthlyRent)}</strong>, due on the ${input.rentDueDay ?? 1}${ordinal(input.rentDueDay ?? 1)} of each month. The fee covers the right to occupy ${escapeHtml(roomLabel)}, use of common areas, and shared utilities${input.utilitiesIncluded ? ` (${escapeHtml(input.utilitiesIncluded)})` : ""}.</p>
    <p><strong>Late charge.</strong> If the fee is five (5) or more days past due, a late charge of <strong>${money(lateFeeCap)}</strong> shall apply. This amount is conservatively set within the cap under <em>N.C. Gen. Stat. § 42-46(a)</em>.</p>
  </section>

  <section>
    <h2>4. Refundable Member Deposit</h2>
    <p>Member shall provide a refundable deposit of <strong>${money(depositCap)}</strong> upon execution of this Agreement. ${wasCapped ? `<em>(Adjusted to remain within the conservative ceiling of one and one-half month's fee under N.C. Gen. Stat. § 42-50.)</em>` : ""}</p>
    <p>Operator shall hold the deposit in a trust account with a North Carolina-licensed federally insured bank or under a bond, and shall furnish Member with the name and address of the holding institution within <strong>thirty (30) days</strong> of receipt. Within <strong>thirty (30) days</strong> after termination of membership and surrender of the room (or <strong>sixty (60) days</strong> if final accounting requires additional time), Operator shall return the deposit less any itemized lawful deductions.</p>
  </section>

  <section>
    <h2>5. Term and Termination</h2>
    <p>This Agreement begins on <strong>${formatDate(input.startDate)}</strong>${input.endDate ? ` and continues through <strong>${formatDate(input.endDate)}</strong>` : ` and continues on a month-to-month basis`}.</p>
    <p>Either party may terminate this Agreement upon <strong>thirty (30) days' written notice</strong> to the other.</p>
    <p>Operator may terminate this Agreement immediately upon material breach of house rules, threat to the safety of other Members, illegal activity at the Residence, or non-payment of the membership fee for more than fifteen (15) days, subject to any cure rights required by applicable law.</p>
  </section>

  <section>
    <h2>6. House Rules</h2>
    <p>Member agrees to abide by the Residence's written House Rules, which are incorporated by reference. Operator may amend the House Rules upon <strong>thirty (30) days' notice</strong>; amendments shall not unreasonably alter the core benefits Member receives under this Agreement.</p>
  </section>

  <section>
    <h2>7. No Subletting or Assignment</h2>
    <p>This membership is personal to Member. Member may not assign this Agreement or sublet ${escapeHtml(roomLabel)} or any portion of the Residence to any other person. Guests may stay no longer than seven (7) consecutive nights without Operator's written consent.</p>
  </section>

  <section>
    <h2>8. Acknowledgment Regarding Status</h2>
    <p>Member has read and understood Section 2 above and acknowledges that this Agreement is intended as a license, not a lease. Member further acknowledges that nothing in this Agreement waives any non-waivable right Member may have under North Carolina law.</p>
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
    <p><em>Generated by Leasely. The "membership" framing is for house-rules and room-assignment purposes only — it does not change the eviction procedure Operator must follow to remove a Member from possession. A licensed North Carolina attorney should review before reliance in litigation.</em></p>
  </footer>
</article>`;

  return {
    html,
    state: "NC",
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
