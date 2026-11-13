import type { StateLawProfile } from "../types";

const LALAW = (d: string) => `https://legis.la.gov/Legis/Law.aspx?d=${d}`;

export const LA: StateLawProfile = {
  code: "LA",
  name: "Louisiana",
  framework:
    "Louisiana Civil Code lease articles, La. Civ. Code arts. 2668–2729, and the residential deposit statute, La. R.S. 9:3251 et seq.",

  deposit: {
    maxMonths: null,
    capRule: "Louisiana law sets no limit on the amount of the security deposit.",
    capCite: null,
    returnDays: 30,
    returnRule:
      "Within one month after this Lease terminates, Landlord shall return the deposit to Tenant, who shall furnish Landlord a forwarding address at the end of the Lease. Landlord may retain only the portion reasonably necessary to remedy a default by Tenant or to remedy unreasonable wear to the Property. If Landlord retains any portion, Landlord shall deliver Tenant an itemized statement accounting for the amounts retained and the reasons, either within one month after the tenancy terminates or within fifteen days after the date that is one month after the tenancy terminates. This return requirement does not apply if Tenant abandons the Property. Landlord's willful failure to comply (including failure to remit within thirty days after Tenant's written demand) entitles Tenant to the amount wrongfully retained plus $300 or twice the amount wrongfully retained, whichever is greater.",
    returnCite: "La. R.S. 9:3251, 9:3252",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: null,
    capType: "none",
    capRule: "",
    cite: null,
  },

  notice: {
    monthToMonthDays: 10,
    monthToMonthRule:
      "A lease with a fixed term ends at the end of the term without notice; if the parties remain without notice, the lease is reconducted (continued) as a month-to-month lease. Either party may terminate a month-to-month lease (including a reconducted one) by giving the other written notice at least 10 calendar days before the end of the month; for a lease whose term is longer than a month, the notice must be given at least 30 calendar days before the end of the period.",
    monthToMonthCite: "La. Civ. Code arts. 2723, 2727, 2728, 2729",
    nonpaymentDays: 5,
    nonpaymentRule:
      "If Tenant fails to pay rent when due, Landlord may dissolve this Lease and seek possession. Before filing an eviction, Landlord must deliver Tenant a written notice to vacate that allows Tenant not less than five days from its delivery to vacate, unless Tenant has waived notice to vacate in this Lease.",
    nonpaymentCite: "La. Civ. Code art. 2704; La. Code Civ. Proc. art. 4701",
    entryHours: null,
    entryRule:
      "Louisiana has no statute setting a landlord entry-notice period, and Landlord must protect Tenant's peaceful possession. Landlord will give Tenant at least 24 hours' notice before entering for inspections, repairs, or showings, except in an emergency or when Tenant consents at the time of entry.",
    entryCite: null,
  },

  earlyTermination: {
    military: {
      label: "Military service (Louisiana law)",
      cite: "La. R.S. 9:3261",
      eligible:
        "An active or reserve member of the U.S. Armed Forces (including the National Guard and the U.S. Coast Guard), or the member's spouse, may terminate this residential Lease if the member: (1) receives initial or permanent change of station orders to depart 35 miles or more from the Property; (2) receives initial or temporary duty orders in excess of three months to depart 35 miles or more from the Property; (3) is discharged, released, or retires; (4) is ordered to reside in government-supplied quarters; (5) is notified that government-supplied quarters not available when the Lease was signed have become available, provided the member noted in writing at signing a pending request or application for such quarters; (6) is injured in service and requires hospitalization for more than 15 days; or (7) is killed in service.",
      notice:
        "For grounds (1) through (5), Tenant serves Landlord written notice of termination effective on a stated date that is not less than 30 days after the notice is served and no more than 60 days before the departure date required by the orders. For an injury or death under grounds (6) and (7), Tenant (or the member's representative) gives written notice with the documentation described below.",
      documentation:
        "The notice must be accompanied by appropriate proof: for a change of station, duty, discharge, retirement, or quarters, a copy of the official military orders; for an injury, the hospitalization records; and for a death, the death certificate, a statement from a casualty assistance office or the member's commanding officer, or an official military media release.",
      liability:
        "Tenant owes no more than one month's rent if, as of the effective termination date, Tenant has completed less than six months of this Lease, or no more than one-half of one month's rent if Tenant has completed at least six months, and Tenant is entitled to the full return of any security deposit if Tenant has otherwise complied with this Lease. No other early termination fee applies. This right cannot be waived or modified under any circumstances, and a violation entitles Tenant to $200 in damages plus any other damages, remedies, and costs.",
    },
    domesticViolence: {
      label: "Domestic abuse, stalking, or cyberstalking (larger buildings only)",
      cite: "La. R.S. 9:3261.1",
      eligible:
        "This right applies only when the Property is a residential dwelling in a building or structure of six or more separate residential dwellings, and not when the structure has ten or fewer units and the owner or a lessor occupies one of them. A Tenant or household member who is a domestic abuse victim — a person named as a petitioner in a Uniform Abuse Prevention Order, or who has completed a Certification of Domestic Abuse — may request early termination of this Lease. 'Domestic abuse' means domestic abuse battery committed on the Property, or stalking or cyberstalking as defined by Louisiana law.",
      notice:
        "Tenant makes a written request to Landlord for an accommodation of early termination. This Lease then terminates as a matter of law on a date mutually agreed within 30 days of the written request, and Tenant must vacate by that date to avoid liability for future rent.",
      documentation:
        "On or before the termination date, Tenant must provide Landlord reasonable documentation of the abuse — a completed Certification of Domestic Abuse signed under oath by a qualified third party, or a Uniform Abuse Prevention Order.",
      liability:
        "Tenant is liable only for rent through the early termination date and any obligations outstanding on that date, paid on or before the date Tenant vacates. Landlord may withhold the deposit only for a reason permitted by R.S. 9:3251 and will not charge an early termination fee. Where there is more than one tenant, the entire Lease terminates on the agreed date. A perpetrator named in the documentation may be immediately evicted and remains liable under this Lease.",
    },
    other: [
      {
        label: "Loss, destruction, or substantial impairment of the Property",
        cite: "La. Civ. Code arts. 2714, 2715",
        eligible:
          "If the Property is lost or totally destroyed without the fault of either party, or is expropriated, this Lease terminates and neither party owes the other damages. If, without Tenant's fault, the Property is partially destroyed or lost, is expropriated, or its use is otherwise substantially impaired, Tenant may obtain a reduction of the rent or dissolution of this Lease, whichever is more appropriate; if the impairment was caused by circumstances external to the Property, Tenant is entitled to dissolution but not a reduction of rent.",
        notice:
          "Tenant notifies Landlord of the loss, destruction, expropriation, or impairment; for a total loss, destruction, or expropriation this Lease ends as of that event.",
        documentation: "",
        liability:
          "Tenant owes rent only through the date this Lease terminates and no early termination fee.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "La. Civ. Code art. 2002; La. R.S. 9:3260",
      rule:
        "Louisiana law requires an obligee to make reasonable efforts to mitigate the damage caused by the other party's failure to perform, so if Tenant leaves early Landlord will make reasonable efforts to re-rent the Property, and rent received from a replacement tenant is credited against what Tenant owes.",
    },
  },

  disclosures: [],

  fairHousing: {
    stateClasses: ["military status", "natural, protective, or cultural hairstyle"],
    cite: "La. R.S. 51:2606 (Louisiana Equal Housing Opportunity Act)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through the court eviction process: a written notice to vacate under La. Code Civ. Proc. art. 4701, followed by a rule to show cause for possession under arts. 4731 through 4735. Landlord will not use self-help to remove Tenant or Tenant's belongings.",
    cite: "La. Code Civ. Proc. arts. 4701, 4731–4735",
  },

  habitability: {
    rule:
      "Landlord is bound to deliver the Property at the agreed time in good condition suitable for the purpose for which it was leased, to maintain it in that condition and make all repairs that become necessary (other than those for which Tenant is responsible), and to warrant that the Property is free of vices or defects that prevent its use, including vices or defects that arise during the Lease and are not Tenant's fault. In a residential lease this warranty applies to all persons who reside in the Property under the Lease, and a waiver of the warranty is ineffective to the extent it purports to waive vices or defects that seriously affect health or safety.",
    cite: "La. Civ. Code arts. 2682, 2684, 2691, 2696–2699",
  },

  sources: [
    { cite: "La. Civ. Code art. 2002", url: LALAW("109258") },
    { cite: "La. Civ. Code art. 2668", url: LALAW("109729") },
    { cite: "La. Civ. Code art. 2671", url: LALAW("109732") },
    { cite: "La. Civ. Code art. 2682", url: LALAW("109743") },
    { cite: "La. Civ. Code art. 2683", url: LALAW("109744") },
    { cite: "La. Civ. Code art. 2684", url: LALAW("109746") },
    { cite: "La. Civ. Code art. 2691", url: LALAW("109753") },
    { cite: "La. Civ. Code art. 2696", url: LALAW("109758") },
    { cite: "La. Civ. Code art. 2698", url: LALAW("109760") },
    { cite: "La. Civ. Code art. 2699", url: LALAW("109761") },
    { cite: "La. Civ. Code art. 2703", url: LALAW("109767") },
    { cite: "La. Civ. Code art. 2704", url: LALAW("109768") },
    { cite: "La. Civ. Code art. 2714", url: LALAW("109778") },
    { cite: "La. Civ. Code art. 2715", url: LALAW("109779") },
    { cite: "La. Civ. Code art. 2723", url: LALAW("109787") },
    { cite: "La. Civ. Code arts. 2727–2729", url: LALAW("109792") },
    { cite: "La. R.S. 9:3251", url: LALAW("107468") },
    { cite: "La. R.S. 9:3252", url: LALAW("107469") },
    { cite: "La. R.S. 9:3254", url: LALAW("107471") },
    { cite: "La. R.S. 9:3260", url: LALAW("107476") },
    { cite: "La. R.S. 9:3261", url: LALAW("107477") },
    { cite: "La. R.S. 9:3261.1", url: LALAW("963049") },
    { cite: "La. R.S. 51:2606", url: LALAW("104419") },
    { cite: "La. Code Civ. Proc. art. 4701", url: LALAW("112073") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "Louisiana is a civil-law jurisdiction; the lease is governed by the Civil Code (arts. 2668–2729), not a URLTA-style act. There is no statutory implied warranty of habitability as such; the equivalent is the lessor's maintenance obligation (arts. 2682, 2691) and the warranty against vices or defects (arts. 2696–2699), which in a residential or consumer lease cannot be waived for defects that seriously affect health or safety (art. 2699(3)).",
    "Deposit (R.S. 9:3251) was amended by 2026 La. Act 63: the landlord must return the deposit within one month, and if retaining any part must send the itemized statement within one month OR within fifteen days after the one-month mark (an effective outside limit of about 45 days for the statement). The return duty does not apply if the tenant abandons. R.S. 9:3254 makes any waiver of the tenant's deposit rights null and void. Penalty under R.S. 9:3252 is the greater of $300 or twice the amount wrongfully retained.",
    "DV early termination (R.S. 9:3261.1) is narrow: it applies ONLY to buildings of six or more units (and not to a structure of ten or fewer units where the owner/lessor occupies one). Most small-landlord Keycove users will fall outside it, and Louisiana has no general DV lease-termination statute for single-family or small multi-unit rentals — so for those properties domesticViolence protection does not apply by statute. 2026 La. Act 64 added stalking and cyberstalking to the section. The eligibility text states the unit-count limit; attorney should confirm the lease flags this to small landlords.",
    "Military termination (R.S. 9:3261) is unusually generous and caps the member's liability at one month's rent (under six months completed) or one-half month's rent (six months or more completed); that cap lives in the right's liability text, not in feeCap, because it applies only to this right. The section may not be waived or modified under any circumstances, and a violation carries $200 statutory damages.",
    "Month-to-month termination notice is 10 calendar days before the end of the month (art. 2728(2)); 30 calendar days for a term longer than a month. Louisiana does not require a specific pay-or-quit period before eviction for nonpayment — only the 5-day notice to vacate under C.C.P. art. 4701, which the lease may waive.",
    "No Louisiana statute governs landlord entry; the 24-hour courtesy notice is contractual, consistent with the lessor's duty to protect peaceful possession.",
    "Fair housing: La. R.S. 51:2606 adds 'military status' and 'natural, protective, or cultural hairstyle' beyond the federal seven. Disability is listed in subsections (3)–(5) of 2606 and in R.S. 51:2607 rather than in 2606(1)–(2); it is covered. Sexual orientation and gender identity are NOT state-protected (amendment bills failed).",
    "Mitigation: La. Civ. Code art. 2002 imposes a general duty on an obligee to mitigate, and R.S. 9:3260 requires the landlord to mitigate when premises are rendered uninhabitable or the tenant is constructively evicted. Application to an ordinary voluntary early move-out is supported by art. 2002 but not squarely addressed by a lease-specific statute; attorney to confirm.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
