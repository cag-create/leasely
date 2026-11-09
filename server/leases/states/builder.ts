// Lease builder: StateLawProfile → template body HTML (with {{placeholders}}).
//
// All lease WORDING lives here, once, for every state. State-specific VALUES
// come from server/leases/states/data/<code>.ts. Placeholders are filled at
// render time by server/leases/render.ts (which HTML-escapes user input).

import type { StateLawProfile, StatutoryTerminationRight } from "./types";
import { SCRA_RIGHT } from "./federal";
import { escapeHtml } from "../utils";

export type LeaseKind = "residential" | "coliving";

/** Placeholders the builder emits. Disclosure/extra-clause text may only use these. */
export const KNOWN_PLACEHOLDERS = [
  "landlord_name", "landlord_address", "landlord_email", "landlord_phone", "tenant_name", "tenant_email",
  "property_address", "unit_or_room_label", "occupants", "state",
  "lease_start_date", "lease_end_date", "monthly_rent", "rent_due_day", "payment_methods",
  "late_fee", "security_deposit", "utilities", "pets_allowed", "parking",
  "early_termination_fee", "early_termination_notice_days", "co_living_rules",
  "deposit_institution",
] as const;

const FEDERAL_CLASSES = ["race", "color", "religion", "sex", "national origin", "familial status", "disability"];

const e = (s: string) => escapeHtml(s);
const cite = (c: string | null | undefined) => (c ? ` (<em>${e(c)}</em>)` : "");
const p = (...parts: Array<string | false | null | undefined>) => {
  const body = parts.filter(Boolean).join(" ").trim();
  return body ? `<p>${body}</p>` : "";
};

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function rightItem(r: StatutoryTerminationRight): string {
  const parts = [r.eligible, r.notice, r.documentation, r.liability].filter(s => s && s.trim()).map(e);
  return `<li><strong>${e(r.label)}</strong>${cite(r.cite)}. ${parts.join(" ")}</li>`;
}

/** All rights that override the early termination fee, in display order. */
export function protectedRights(profile: StateLawProfile): StatutoryTerminationRight[] {
  const et = profile.earlyTermination;
  return [SCRA_RIGHT, et.military, et.domesticViolence, ...et.other].filter(Boolean) as StatutoryTerminationRight[];
}

export function buildEarlyTerminationSection(profile: StateLawProfile, n: number, kind: LeaseKind): string {
  const et = profile.earlyTermination;
  const lease = kind === "coliving" ? "this Agreement" : "this Lease";
  const Lease = kind === "coliving" ? "This Agreement" : "This Lease";
  const unit = kind === "coliving" ? "the Room" : "the Property";
  const items = protectedRights(profile).map(rightItem).join("\n      ");
  const capPara = et.feeCap
    ? `<p><strong>(e) ${e(profile.name)} limit.</strong> ${e(et.feeCap.rule)}${cite(et.feeCap.cite)} The early termination fee in paragraph (a) will never exceed that limit.</p>`
    : "";
  const depLetter = et.feeCap ? "f" : "e";
  return `
  <section class="early-termination"><h2>${n}. Early Termination by Tenant (Lease Break)</h2>
    <p><strong>(a) Tenant's early termination option.</strong> Tenant may end ${lease} before the end date by doing all of the following: (1) giving Landlord written notice of the date Tenant will move out (the "Early Move-Out Date") at least <strong>{{early_termination_notice_days}} days</strong> before that date; (2) paying all rent and other charges due through the Early Move-Out Date; (3) paying an early termination fee of <strong>{{early_termination_fee}}</strong> on or before the Early Move-Out Date; and (4) moving out and returning all keys and access devices by the Early Move-Out Date. If the total rent that would have come due under ${lease} after the Early Move-Out Date is less than the early termination fee, Tenant pays that smaller amount instead.</p>
    <p><strong>(b) Liquidated damages, not a penalty.</strong> Landlord and Tenant agree that if Tenant leaves early, Landlord's damages (rent lost while ${unit} is vacant and the cost of advertising, showing, screening, and turnover) are difficult to determine at the time of signing, and that the early termination fee is a reasonable estimate of those damages and not a penalty. When Tenant completes every step in paragraph (a), Tenant owes no rent for any period after the Early Move-Out Date, and the fee is Landlord's only remedy for the early termination itself. The fee does not cover unpaid rent through the Early Move-Out Date, damage beyond normal wear and tear, or other charges allowed by ${lease} and ${e(profile.name)} law.</p>
    <p><strong>(c) If Tenant leaves early without using this option.</strong> Using paragraph (a) is Tenant's choice. If Tenant moves out before the end date without completing paragraph (a), Landlord will not charge the early termination fee. Instead, Tenant remains responsible for rent as it comes due until the earlier of the end date or the date a replacement tenant's rent begins, plus Landlord's reasonable costs of re-renting. ${e(et.mitigation.rule)}${cite(et.mitigation.basis === "statute" ? et.mitigation.cite : null)}</p>
    <p><strong>(d) Rights protected by law: no early termination fee.</strong> Paragraphs (a) through (c) do not apply, and Landlord will not charge the early termination fee, when Tenant ends ${lease} under any of the following laws. ${Lease} cannot waive or reduce these rights, and if any part of ${lease} conflicts with them, the law controls. Each right has its own notice and documentation requirements:</p>
    <ul>
      ${items}
    </ul>
    ${capPara}
    <p><strong>(${depLetter}) Security deposit.</strong> After Tenant moves out, Landlord may apply the security deposit to an unpaid early termination fee or to rent owed under paragraph (c) to the extent the law allows, and will account for the deposit as described in the Security Deposit section and as the law requires. Landlord will not apply the deposit to early termination damages where the law prohibits it, including after a termination under a law listed in paragraph (d).</p>
  </section>`;
}

function fairHousingSentence(profile: StateLawProfile): string {
  const classes = [...FEDERAL_CLASSES];
  for (const c of profile.fairHousing.stateClasses) {
    const lc = c.toLowerCase();
    if (!classes.includes(lc)) classes.push(lc);
  }
  return `Landlord does not discriminate on the basis of ${e(joinList(classes))}, or any other characteristic protected by federal, ${e(profile.name)}, or local law, in renting, in the terms of this tenancy, or in providing services or facilities (<em>42 U.S.C. § 3604; ${e(profile.fairHousing.cite)}</em>).`;
}

const FEDERAL_LEAD_PAINT = `
  <section><h2>Federal Lead-Based Paint Disclosure</h2>
    <p>Housing built before 1978 may contain lead-based paint. If the Property was built before 1978, Landlord shall provide Tenant with the EPA pamphlet <em>"Protect Your Family From Lead in Your Home"</em>, disclose any known lead-based paint or lead-based paint hazards and any available records or reports, and attach the signed federal Lead-Based Paint Disclosure form to this Lease, as required by 42 U.S.C. § 4852d and 24 CFR Part 35, Subpart A / 40 CFR Part 745, Subpart F.</p>
  </section>`;

const SIGNATURE_BLOCK = `
  <section><h2>Signatures</h2>
    <div class="signature-block">
      <p><strong>Landlord:</strong> ____________________________ &nbsp; Date: ____________</p>
      <p><strong>Tenant:</strong> ____________________________ &nbsp; Date: ____________</p>
    </div>
  </section>`;

export function buildLeaseBody(profile: StateLawProfile, kind: LeaseKind): string {
  const d = profile.deposit;
  const isCo = kind === "coliving";
  const L = isCo ? "Agreement" : "Lease";
  const unit = isCo ? "the Room" : "the Property";
  let n = 0;
  const h = (title: string) => `<h2${hs}>${++n}. ${title}</h2>`;

  const emph = (dis: { emphasis?: string }, html: string) =>
    dis.emphasis === "bold_underline" ? `<strong><u>${html}</u></strong>` : html;
  const topNotices = profile.disclosures.filter(dis => dis.placement === "top_large");
  const pageOneNotices = profile.disclosures.filter(dis => dis.placement === "top");
  // Cap heading sizes so a top_large notice is at least twice any other font.
  const hs = topNotices.length ? ' style="font-size:16px"' : "";
  const topNoticeHtml = topNotices.map(dis =>
    `<div class="lease-top-notice" style="font-size:32px;line-height:1.25;font-weight:700;border:2px solid #000;padding:12px;margin-bottom:16px">${dis.condition ? `<span style="font-size:16px;font-weight:400;display:block;margin-bottom:6px">${e(dis.condition)} (${e(dis.cite)})</span>` : ""}${emph(dis, e(dis.text))}</div>`,
  ).join("\n  ") + pageOneNotices.map(dis =>
    `<section class="lease-page-one-notice" style="border:1px solid #333;padding:10px 12px;margin-bottom:14px"><p><strong>${e(dis.title)}</strong>${cite(dis.cite)}</p><p>${dis.condition ? `<em>${e(dis.condition)}:</em> ` : ""}${emph(dis, e(dis.text))}</p></section>`,
  ).join("\n  ");

  const disclosures = profile.disclosures.filter(dis => !dis.placement).map(dis =>
    `<li><strong>${e(dis.title)}.</strong> ${dis.condition ? `<em>${e(dis.condition)}:</em> ` : ""}${emph(dis, e(dis.text))}${cite(dis.cite)}</li>`,
  ).join("\n      ");

  const extra = () => (profile.additionalClauses ?? []).map(c =>
    `<section>${h(e(c.title))}<p>${e(c.text)}${cite(c.cite ?? null)}</p></section>`,
  ).join("\n  ");

  const header = () => isCo
    ? `<header>
    <h1${hs}>${e(profile.name)} Co-Living / Room Rental Agreement</h1>
    <p class="lease-subtitle">Room rental in a shared residence. ${e(profile.name)} landlord-tenant law, including its eviction procedure, applies in full.</p>
  </header>`
    : `<header>
    <h1${hs}>${e(profile.name)} Residential Lease Agreement</h1>
    <p class="lease-subtitle">Governed by ${e(profile.framework)}</p>
  </header>`;

  const nature = () => isCo
    ? `<section>${h("Nature of This Agreement")}
    <p>Tenant rents <strong>{{unit_or_room_label}}</strong> (the "Room") at <strong>{{property_address}}</strong> (the "Residence") and may use the shared common areas. Authorized occupants of the Room: {{occupants}}.</p>
    <p>Landlord may move Tenant to a comparable room in the Residence only with Tenant's written consent or on at least 30 days' written notice with no increase in rent. The "co-living" and "room rental" terms of this Agreement govern house rules and room assignment only. Tenant has the rights of a residential tenant under ${e(profile.name)} law. If Landlord seeks to remove Tenant from possession, Landlord will use the court eviction process described in this Agreement and will never use self-help removal.</p>
  </section>`
    : `<section>${h("Property")}
    <p>Landlord leases to Tenant the residential premises at <strong>{{property_address}}</strong> (the "Property"). Authorized occupants: {{occupants}}.</p>
  </section>`;

  const houseRules = () => isCo
    ? `<section>${h("House Rules and Guests")}
    <p>Tenant agrees to follow these house rules:</p>
    <blockquote>{{co_living_rules}}</blockquote>
    <p>Landlord may change the house rules on at least 30 days' written notice; a change may not reduce Tenant's rights under this Agreement or the law, or substantially change the bargain. Guests may stay no more than seven consecutive nights without Landlord's written consent. Each resident is responsible for their own share of keeping common areas clean.</p>
  </section>`
    : "";

  return `
<article class="lease-document" data-state="${e(profile.code)}" data-tenancy="${isCo ? "coliving_room_rental" : "residential"}">
  ${topNoticeHtml ? `${topNoticeHtml}
  ` : ""}${header()}

  <section>${h("Parties")}
    <p><strong>Landlord:</strong> {{landlord_name}} ({{landlord_address}})</p>
    <p><strong>Tenant:</strong> {{tenant_name}} ({{tenant_email}})</p>
  </section>

  ${nature()}

  <section>${h("Term")}
    <p>This ${L} begins on <strong>{{lease_start_date}}</strong> and ends on <strong>{{lease_end_date}}</strong>. If Tenant stays after the end date with Landlord's consent (including Landlord's acceptance of rent), the tenancy continues month-to-month on the same terms. ${e(profile.notice.monthToMonthRule)}${cite(profile.notice.monthToMonthCite)}</p>
  </section>

  <section>${h("Rent")}
    <p>Tenant shall pay rent of <strong>{{monthly_rent}}</strong> per month, due on the <strong>{{rent_due_day}}</strong> day of each month${isCo ? ". Rent covers the Room, use of the common areas, and these shared utilities: {{utilities}}" : ""}.</p>
    <p><strong>Payment methods.</strong> Tenant shall pay rent by any of these methods accepted by Landlord: <strong>{{payment_methods}}</strong>. Rent is paid on the date Landlord receives the funds.</p>
    <p><strong>Late fee.</strong> If rent is not paid on time, Landlord may charge a late fee of <strong>{{late_fee}}</strong>${profile.lateFee.graceDays ? `, but only after rent is at least ${profile.lateFee.graceDays} days late` : ""}. ${profile.lateFee.capRule ? `${e(profile.lateFee.capRule)}${cite(profile.lateFee.cite)}` : "The late fee must be a reasonable estimate of Landlord's costs from the late payment and not a penalty."}</p>
  </section>

  <section>${h("Security Deposit")}
    <p>Tenant shall pay a security deposit of <strong>{{security_deposit}}</strong>. ${e(d.capRule)}${cite(d.capCite)}</p>
    ${p(d.holdingRule ? `${e(d.holdingRule)}${cite(d.holdingCite)}` : "", d.interestRequired ? "Landlord shall pay interest on the deposit as required by law." : "")}
    <p>${e(d.returnRule)}${cite(d.returnCite)}</p>
    ${p(d.moveInInspection ? e(d.moveInInspection) : "Landlord and Tenant will complete a written move-in condition report, with photographs, and a move-out inspection. Items not noted at move-in are presumed to have been in good condition.")}
  </section>

  ${isCo ? "" : `<section>${h("Utilities")}
    <p>Utilities included in the rent: {{utilities}}. Tenant is responsible for arranging and paying for all other utilities.</p>
  </section>`}

  <section>${h("Pets and Parking")}
    <p>Pets allowed: {{pets_allowed}}. Assistance animals for a person with a disability are not pets, and no pet fee or pet deposit applies to them. Parking: {{parking}}.</p>
  </section>

  ${houseRules()}

  <section>${h("Landlord Entry")}
    <p>${e(profile.notice.entryRule)}${cite(profile.notice.entryCite)}${isCo ? " This applies to the Room; the common areas are shared and Landlord may enter them at reasonable times." : ""}</p>
  </section>

  <section>${h("Maintenance and Repairs")}
    <p>${e(profile.habitability.rule)}${cite(profile.habitability.cite)}</p>
    <p>Tenant shall keep ${unit} clean and safe, use appliances and fixtures only for their intended purposes, not damage or allow damage to the ${isCo ? "Residence" : "Property"} beyond normal wear and tear, comply with building and housing codes that apply to tenants, and promptly notify Landlord in writing of any needed repair, water leak, or visible mold. Tenant shall not make alterations, paint, or change or add locks without Landlord's written consent, except as the law allows.</p>
  </section>

  <section>${h("Use, Assignment, and Subletting")}
    <p>${unit === "the Room" ? "The Room" : "The Property"} may be used only as a private residence by Tenant and the authorized occupants. Tenant may not assign this ${L} or sublet any part of ${unit} without Landlord's prior written consent. No illegal activity is permitted on the premises.</p>
  </section>

  <section>${h("Default and Eviction")}
    <p>${e(profile.notice.nonpaymentRule)}${cite(profile.notice.nonpaymentCite)}</p>
    <p>${e(profile.eviction.rule)}${cite(profile.eviction.cite)}</p>
  </section>

  ${buildEarlyTerminationSection(profile, ++n, kind)}

  ${profile.disclosures.some(dd => !dd.placement) ? `<section>${h(`${e(profile.name)} Disclosures`)}
    <ul>
      ${disclosures}
    </ul>
  </section>` : ""}

  ${extra()}

  <section>${h("Fair Housing")}
    <p>${fairHousingSentence(profile)}</p>
  </section>

  <section>${h("General Provisions")}
    <p>This ${L} is governed by ${e(profile.name)} law. If any provision conflicts with a law that cannot be waived, the law controls and the provision is enforced only to the extent the law allows; the rest of this ${L} remains in effect. Nothing in this ${L} waives any right of Tenant that the law makes non-waivable. Each person who signs as Tenant is jointly and severally responsible for Tenant's obligations. Changes to this ${L} must be in writing and signed by both parties. Notices may be delivered by hand, by mail to the addresses above, or by email to the email addresses above, unless the law requires a particular method. Electronic signatures are valid. This ${L} and any signed addenda are the entire agreement.</p>
  </section>

  ${FEDERAL_LEAD_PAINT}

  <section class="legal-disclaimer">
    <p><strong>Legal Disclaimer.</strong> This ${L.toLowerCase()} was generated by Keycove from a ${e(profile.name)} template. Keycove is not a law firm and does not provide legal advice. Landlord and Tenant should each consult an attorney licensed in ${e(profile.name)} if they have questions about their rights and obligations. Statutory citations are for reference and do not replace the law itself. Local ordinances may add requirements.</p>
  </section>

  ${SIGNATURE_BLOCK}
</article>`;
}

/** Every statute citation the generated lease references (for the template's citations list). */
export function collectCitations(profile: StateLawProfile): string[] {
  const set = new Set<string>();
  const add = (c?: string | null) => { if (c) set.add(c); };
  add(profile.deposit.capCite); add(profile.deposit.returnCite); add(profile.deposit.holdingCite);
  add(profile.lateFee.cite); add(profile.notice.monthToMonthCite); add(profile.notice.nonpaymentCite);
  add(profile.notice.entryCite); add(profile.eviction.cite); add(profile.habitability.cite);
  add(profile.fairHousing.cite);
  protectedRights(profile).forEach(r => add(r.cite));
  if (profile.earlyTermination.feeCap) add(profile.earlyTermination.feeCap.cite);
  if (profile.earlyTermination.mitigation.basis === "statute") add(profile.earlyTermination.mitigation.cite);
  profile.disclosures.forEach(dd => add(dd.cite));
  (profile.additionalClauses ?? []).forEach(c => add(c.cite));
  add("42 U.S.C. § 4852d");
  add("42 U.S.C. § 3604");
  return Array.from(set);
}

export const TEMPLATE_VARIABLES: Record<LeaseKind, string[]> = {
  residential: KNOWN_PLACEHOLDERS.filter(v => v !== "unit_or_room_label" && v !== "co_living_rules" && v !== "landlord_email") as unknown as string[],
  coliving: KNOWN_PLACEHOLDERS.filter(v => v !== "landlord_email") as unknown as string[],
};
