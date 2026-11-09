import type { StateLawProfile } from "../types";

const OSCN = (citeId: number) =>
  `https://www.oscn.net/applications/oscn/DeliverDocument.asp?CiteID=${citeId}`;

export const OK: StateLawProfile = {
  code: "OK",
  name: "Oklahoma",
  framework: "Oklahoma Residential Landlord and Tenant Act, 41 O.S. §§ 101 et seq.",

  deposit: {
    maxMonths: null,
    capRule: "Oklahoma law sets no maximum amount for a residential security deposit.",
    capCite: null,
    returnDays: 45,
    returnRule:
      "When the tenancy ends, Landlord may apply the security deposit to accrued rent and to damages Landlord has suffered because of Tenant's noncompliance with this Lease or the Oklahoma Residential Landlord and Tenant Act, all as itemized in a written statement delivered to Tenant in person or by mail with return receipt requested. Landlord will return the balance of the deposit, without interest, within 45 days after the tenancy ends, Tenant delivers possession, and Tenant makes a written demand for the deposit. If Tenant does not make a written demand within six months after the tenancy ends, the deposit reverts to Landlord. Tenant may not apply any part of the security deposit to the last month's rent or use it at any time in place of paying rent.",
    returnCite: "41 O.S. § 115(B), (F)",
    holdingRule:
      "Landlord will keep the security deposit in an escrow account for Tenant maintained in the State of Oklahoma with a federally insured financial institution.",
    holdingCite: "41 O.S. § 115(A)",
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
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either Landlord or Tenant may terminate a month-to-month tenancy by giving the other written notice at least 30 days before the termination date, counted from the date the notice is served. Notice to Tenant is served personally; if Tenant cannot be located, by delivery to a family member over 12 years of age living with Tenant; and otherwise by posting it in a conspicuous place on the Property and mailing a copy by certified mail. Notice to Landlord that cannot be served personally is mailed by certified mail to the person designated in this Lease to receive notices.",
    monthToMonthCite: "41 O.S. § 111(A), (E)",
    nonpaymentDays: 5,
    nonpaymentRule:
      "If rent is unpaid when due, Landlord may terminate this Lease if Tenant fails to pay the rent within five days after Landlord gives written notice demanding payment. The demand for past-due rent is also a demand for possession, and no further notice to quit is required.",
    nonpaymentCite: "41 O.S. § 131",
    entryHours: 24,
    entryRule:
      "Tenant will not unreasonably withhold consent for Landlord to enter the Property to inspect it, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show it to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or where it is impracticable, Landlord will give Tenant at least one day's notice of Landlord's intent to enter and will enter only at reasonable times. Landlord may enter without Tenant's consent in an emergency, and will not abuse the right of access or use it to harass Tenant.",
    entryCite: "41 O.S. § 128",
  },

  earlyTermination: {
    military: {
      label: "Oklahoma military forces on state active duty",
      cite: "44 O.S. § 208.1; 50 U.S.C. § 3955",
      eligible:
        "A member of the Oklahoma state military forces who is ordered to state active duty, or to Title 32 active duty under 32 U.S.C. §§ 501 through 507, has the same lease termination protections that the federal Servicemembers Civil Relief Act gives to servicemembers in federal military service.",
      notice:
        "Tenant gives Landlord written notice of termination. If rent is payable monthly, termination is effective 30 days after the first date on which the next rental payment is due after the notice is delivered; otherwise, termination is effective on the last day of the month following the month in which the notice is delivered.",
      documentation: "The notice must include a copy of the military orders.",
      liability:
        "Tenant owes rent only through the effective date of termination. Landlord will refund rent paid in advance for any period after that date within 30 days after the effective date, and Landlord will not charge an early termination fee.",
    },

    domesticViolence: {
      label: "Domestic violence, sexual violence, or stalking",
      cite: "41 O.S. §§ 111(F), 112",
      eligible:
        "Tenant may terminate this Lease if Tenant is a victim of domestic violence, sexual violence, or stalking.",
      notice:
        "Tenant must give Landlord written notice of termination within 30 days after the incident of violence, unless Landlord waives that time period. The notice states the date the termination takes effect.",
      documentation:
        "Tenant must provide, with the notice, a copy of a protective order relating to the incident of violence.",
      liability:
        "Tenant may terminate without penalty, so no early termination fee or liquidated damages apply. Each party's duties under this Lease end on the effective date of termination, and Tenant remains responsible for rent and other obligations that accrued before that date.",
    },

    other: [
      {
        label: "Property damaged or destroyed by fire or casualty",
        cite: "41 O.S. § 122",
        eligible:
          "If the Property is damaged or destroyed by fire or other casualty so that Tenant's enjoyment of it is substantially impaired, and the impairment was not caused by the deliberate or negligent act or omission of Tenant, a member of Tenant's family, Tenant's animal or pet, or another person or animal on the Property with Tenant's consent, Tenant may terminate this Lease.",
        notice:
          "Tenant may immediately vacate the Property and notify Landlord in writing within one week afterward of Tenant's intention to terminate, in which case this Lease terminates as of the date Tenant vacated.",
        documentation: "",
        liability:
          "Landlord will return all recoverable deposits and all prepaid and unearned rent. Rent is accounted for as of the date of the fire or other casualty.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "41 O.S. § 121(A), (E)",
        eligible:
          "Tenant may terminate this Lease if Landlord materially fails to comply with this Lease, or fails to comply with 41 O.S. § 118 in a way that materially affects health or safety, unless the condition was caused by the deliberate or negligent act or omission of Tenant, a member of Tenant's family, Tenant's animal or pet, or another person or animal on the Property with Tenant's consent.",
        notice:
          "Tenant must deliver a written notice to Landlord specifying the acts and omissions constituting the breach and stating that this Lease will terminate on a date not less than 30 days after Landlord receives the notice if the breach is not remedied within 14 days. This Lease terminates as stated in the notice unless Landlord adequately remedies the breach within that time.",
        documentation: "",
        liability:
          "Each party's duties under this Lease end on the termination date, and no early termination fee applies.",
      },
      {
        label: "Failure to supply heat, water, or other essential services",
        cite: "41 O.S. § 121(C)",
        eligible:
          "If, contrary to this Lease or 41 O.S. § 118, Landlord willfully or negligently fails to supply heat, running water, hot water, electricity, gas, or another essential service, Tenant may terminate this Lease.",
        notice:
          "After giving Landlord written notice specifying the breach, Tenant may terminate this Lease immediately upon written notice.",
        documentation: "",
        liability:
          "Each party's duties under this Lease end on the termination date, and no early termination fee applies.",
      },
      {
        label: "Uninhabitable conditions or imminent threat to health and safety",
        cite: "41 O.S. § 121(D)",
        eligible:
          "If Landlord's noncompliance with this Lease or 41 O.S. § 118 makes the Property uninhabitable or poses an imminent threat to the health and safety of any occupant, and Landlord does not remedy it as promptly as conditions require, Tenant may terminate this Lease.",
        notice:
          "Tenant may terminate immediately by written notice to Landlord that specifies the noncompliance.",
        documentation: "",
        liability:
          "Each party's duties under this Lease end on the termination date, and no early termination fee applies.",
      },
      {
        label: "Wrongful removal or exclusion of Tenant",
        cite: "41 O.S. § 123",
        eligible:
          "If Landlord wrongfully removes or excludes Tenant from possession of the Property, Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord notice of Tenant's intention to terminate.",
        documentation: "",
        liability:
          "Landlord will return all recoverable deposits and all prepaid and unearned rent, and Tenant may recover up to twice the average monthly rent or twice Tenant's actual damages, whichever is greater.",
      },
      {
        label: "Unlawful entry or harassment by Landlord",
        cite: "41 O.S. § 124",
        eligible:
          "If Landlord makes an unlawful entry, makes a lawful entry in an unreasonable manner, or harasses Tenant by making repeated unreasonable demands for entry, Tenant may terminate this Lease.",
        notice: "Tenant terminates by written notice to Landlord.",
        documentation: "",
        liability: "Tenant may also recover actual damages.",
      },
    ],

    feeCap: null,

    mitigation: {
      basis: "statute",
      cite: "41 O.S. §§ 105(A), 129(B)",
      rule:
        "If Tenant wrongfully abandons the Property during the term, Landlord will make reasonable efforts to rent it. If Landlord rents the Property for a term beginning before this Lease ends, this Lease terminates when the new tenancy begins. If, after reasonable efforts, Landlord cannot re-rent the Property for a fair rental, Tenant is liable for the rent, or the difference in rent, for the remainder of the term.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner, manager, and agent for service of notices",
      text:
        "This Lease identifies the person authorized to manage the Property, the owner of the Property or a person authorized to act on the owner's behalf, and the person and address entitled to accept service of process and notices under the Oklahoma Residential Landlord and Tenant Act. Landlord will keep this information current.",
      cite: "41 O.S. § 116",
    },
    {
      id: "flooding_history",
      title: "Flooding within the past five years",
      text: "Landlord discloses that the Property has been flooded within the past five years.",
      cite: "41 O.S. § 113a",
      condition:
        "Only if the Property has flooded within the past five years and Landlord knows it; the disclosure must appear prominently in the written rental agreement",
    },
    {
      id: "methamphetamine",
      title: "Prior methamphetamine manufacturing",
      text:
        "Landlord discloses that the Property, or part of the premises, was used in the manufacture of methamphetamine.",
      cite: "41 O.S. § 118(C)",
      condition:
        "Only if Landlord knows or has reason to know of the use, unless an assessment found contamination no greater than 0.1 microgram per 100 square centimeters of surface materials; disclose before the rental agreement begins",
    },
  ],

  fairHousing: {
    stateClasses: [
      "age (18 or older)",
      "status as a victim or alleged victim of domestic violence, sexual violence, or stalking (41 O.S. § 113.3)",
    ],
    cite: "25 O.S. §§ 1451-1453; 41 O.S. § 113.3",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through a forcible entry and detainer action in the district court (including the small claims division) under 12 O.S. §§ 1148.1 et seq. Landlord will not remove or exclude Tenant from the Property except through that court process.",
    cite: "12 O.S. §§ 1148.1, 1148.3; 41 O.S. §§ 105(B), 123",
  },

  habitability: {
    rule:
      "Landlord will make all repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies or is required to supply; and, except for a single-family residence, keep common areas clean, safe, and sanitary, provide waste receptacles and removal (except for one- or two-family residences or where a government provides it), and supply running water, reasonable hot water, and reasonable heat unless supplied through utility connections metered directly to the unit.",
    cite: "41 O.S. § 118(A)",
  },

  sources: [
    { cite: "41 O.S. § 4", url: OSCN(71699) },
    { cite: "41 O.S. § 102", url: OSCN(71749) },
    { cite: "41 O.S. § 103", url: OSCN(71750) },
    { cite: "41 O.S. § 104", url: OSCN(71751) },
    { cite: "41 O.S. § 105", url: OSCN(71752) },
    { cite: "41 O.S. § 108", url: OSCN(71755) },
    { cite: "41 O.S. § 109", url: OSCN(71756) },
    { cite: "41 O.S. § 111", url: OSCN(71758) },
    { cite: "41 O.S. § 112", url: OSCN(71759) },
    { cite: "41 O.S. § 113", url: OSCN(71760) },
    { cite: "41 O.S. § 113.3", url: OSCN(489296) },
    { cite: "41 O.S. § 113a", url: OSCN(71762) },
    { cite: "41 O.S. § 115", url: OSCN(71764) },
    { cite: "41 O.S. § 116", url: OSCN(71765) },
    { cite: "41 O.S. § 118", url: OSCN(71767) },
    { cite: "41 O.S. § 121", url: OSCN(71770) },
    { cite: "41 O.S. § 122", url: OSCN(71771) },
    { cite: "41 O.S. § 123", url: OSCN(71772) },
    { cite: "41 O.S. § 124", url: OSCN(71773) },
    { cite: "41 O.S. § 126", url: OSCN(71775) },
    { cite: "41 O.S. § 128", url: OSCN(71777) },
    { cite: "41 O.S. § 129", url: OSCN(71778) },
    { cite: "41 O.S. § 130.1", url: OSCN(446704) },
    { cite: "41 O.S. § 131", url: OSCN(71780) },
    { cite: "41 O.S. § 132", url: OSCN(71781) },
    { cite: "41 O.S. § 201", url: OSCN(483683) },
    { cite: "44 O.S. § 208.1", url: OSCN(79374) },
    { cite: "25 O.S. § 1451", url: OSCN(73455) },
    { cite: "25 O.S. § 1452", url: OSCN(73456) },
    { cite: "25 O.S. § 1453", url: OSCN(73457) },
    { cite: "15 O.S. § 213", url: OSCN(66048) },
    { cite: "15 O.S. § 214", url: OSCN(66049) },
    { cite: "15 O.S. § 215", url: OSCN(66050) },
    { cite: "12 O.S. § 1148.1", url: OSCN(94425) },
    { cite: "12 O.S. § 1148.3", url: OSCN(94427) },
  ],

  reviewNotes: [
    "ATTORNEY FEE CLAUSES PROHIBITED: 41 O.S. § 113(A)(3) bars any rental agreement provision under which a party 'agrees to pay the other party's attorneys fees' (prevailing-party fees are instead awarded by statute under § 105(B)). Also barred: waiver of Act rights, confession of judgment, exculpation/indemnification for either party's negligence in operation or maintenance, non-statutory liens, and limits on the right to summon police or emergency help (§ 113(A)(1)-(6)). The generator must strip any fee-shifting or indemnity clause from Oklahoma leases.",
    "DEPOSIT ESCROW: § 115(A) requires the deposit to be kept in an escrow account in Oklahoma at a federally insured institution; misappropriation is a misdemeanor (up to 6 months jail, fine up to 2x). If Keycove or Stripe Connect collects/holds deposits for Oklahoma landlords, confirm the funds flow complies (e.g., deposit routed to the landlord's Oklahoma escrow account, not commingled in a platform or out-of-state balance).",
    "DEPOSIT RETURN TRIGGER: The 45-day clock starts only after termination, delivery of possession, AND the tenant's written demand; if the tenant makes no written demand within 6 months the deposit reverts to the landlord (§ 115(B)). The builder's move-out flow should prompt tenants to submit a written demand.",
    "DOMESTIC VIOLENCE: § 111(F) is one sentence. It requires written notice plus a protective order 'within thirty (30) days of such incident' (landlord may waive the time limit). It does not say when termination takes effect, how rent is prorated, whether police reports or third-party certifications suffice (only a protective order is mentioned), or whether co-tenants are released. The lease text lets the tenant's notice set the date and relies on § 112 (duties end on the termination date); attorney should decide whether to require a minimum notice period. § 113.3 bars denying, non-renewing, terminating, or retaliating based on victim status.",
    "MILITARY: 44 O.S. § 208.1 adopts SCRA civil protections as state law for state military forces on state active duty or Title 32 §§ 501-507 duty. Applying § 3955 mechanics (orders, effective date) to state orders is an interpretation. No other Oklahoma landlord-tenant military statute was found.",
    "LATE FEES: No Oklahoma statute sets a grace period or cap. Late fees are stipulated damages under 15 O.S. §§ 213-215 (penalties void; stipulated damages valid only where actual damage is impracticable or extremely difficult to fix). Oklahoma case law on residential late fees was not read; recommend a modest flat or percentage fee.",
    "MONTH-TO-MONTH SERVICE: § 111(E) prescribes personal service (then family member over 12, then posting plus certified mail). E-mail notice is not listed; electronic delivery of termination notices is risky in Oklahoma.",
    "TENANT REPAIRS: § 118(B) requires any agreement that the tenant perform repairs, maintenance, alterations, or remodeling to be a conspicuous writing independent of the rental agreement.",
    "LANDLORD REMEDIES worth encoding: 10-day cure notice for repairable tenant breaches and 15-day/10-day material noncompliance notice (§ 132(A)-(B)); immediate termination for criminal or drug activity (§ 132(D)); willful holdover up to 2x average monthly rent (§ 111(D)); rules enforceable only if § 126 conditions are met.",
    "OPTIONAL: § 130.1 lets landlords request a death-contact designation and authorization; the lease could include it.",
    "LOCAL LAW: Oklahoma City and Tulsa ordinances were not reviewed. Oklahoma has no statewide rent control.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
