import type { StateLawProfile } from "../types";

const RIGL = (t: string, ch: string, s: string) =>
  `https://webserver.rilegislature.gov/Statutes/TITLE${t}/${ch}/${s}.htm`;
const RLTA = (s: string) => RIGL("34", "34-18", s);

export const RI: StateLawProfile = {
  code: "RI",
  name: "Rhode Island",
  framework: "Rhode Island Residential Landlord and Tenant Act, R.I. Gen. Laws §§ 34-18-1 et seq.",

  deposit: {
    maxMonths: 1,
    capRule:
      "The security deposit, however it is labeled, may not exceed one month's rent. If the Property is furnished and the replacement value of the furniture Landlord supplies is $5,000 or more when this Lease is signed, Landlord may also collect a separate furniture security deposit of up to one month's rent.",
    capCite: "R.I. Gen. Laws § 34-18-19(a), (e)",
    returnDays: 20,
    returnRule:
      "Within 20 days after the latest of the end of the tenancy, Tenant's delivery of possession, or Tenant's providing a forwarding address for the deposit, Landlord shall deliver to Tenant the deposit minus only unpaid accrued rent, reasonable cleaning and trash disposal expenses, and physical damage beyond ordinary wear and tear caused by Tenant's noncompliance with R.I. Gen. Laws § 34-18-24, all itemized in a written notice. The same 20-day rule applies to any furniture deposit. If Landlord does not comply, Tenant may recover the amount due plus damages equal to twice the amount wrongfully withheld and reasonable attorney's fees.",
    returnCite: "R.I. Gen. Laws § 34-18-19(b)–(c), (f)",
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
    monthToMonthDays: 30,
    monthToMonthRule:
      "Landlord or Tenant may end a month-to-month tenancy by written notice delivered to the other at least 30 days before the termination date stated in the notice (10 days for a week-to-week tenancy; three months before the end of the occupation year for a year-to-year tenancy). Landlord must give at least 60 days' written notice before a rent increase takes effect, and at least 120 days' notice before raising the rent of a month-to-month tenant who is over 62.",
    monthToMonthCite: "R.I. Gen. Laws §§ 34-18-37, 34-18-16.1",
    nonpaymentDays: 5,
    nonpaymentRule:
      "If any part of the rent is 15 days in arrears, Landlord shall send Tenant a written demand, in the statutory form, stating the amount 15 days in arrears and that the rental agreement will terminate unless Tenant pays within five days of the date the notice is mailed. Landlord may file a complaint for eviction for nonpayment no earlier than the sixth day after mailing. Tenant may cure by paying the full rent due before suit is filed and, if Tenant has not received such a notice in the preceding six months, by paying all rent in arrears plus court costs at the hearing.",
    nonpaymentCite: "R.I. Gen. Laws § 34-18-35",
    entryHours: 48,
    entryRule:
      "Tenant shall not unreasonably withhold consent for Landlord to enter to inspect, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show the Property to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or where it is impracticable, Landlord will give Tenant at least two days' notice of the intent to enter and will enter only at reasonable times. Landlord may enter without consent in an emergency, or during Tenant's absence of more than seven days if reasonably necessary to protect the property, and will not abuse the right of access or use it to harass Tenant.",
    entryCite: "R.I. Gen. Laws § 34-18-26",
  },

  earlyTermination: {
    military: {
      label: "Military service (Rhode Island law)",
      cite: "R.I. Gen. Laws § 34-18-15(f)",
      eligible:
        "Tenant may terminate this Lease if Tenant (or the person on whose behalf it was signed) enters military service after signing it, or if Tenant, while in military service, signs this Lease and then receives military orders for a permanent change of station or to deploy with a military unit, or as an individual in support of a military operation, for 90 days or more.",
      notice:
        "Tenant delivers written notice of termination to Landlord or Landlord's agent. Because rent is paid monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is delivered.",
      documentation: "The notice must include a copy of the servicemember's military orders.",
      liability:
        "Tenant owes rent prorated through the effective termination date. Landlord may not charge an early termination fee, but Tenant must pay any taxes, summonses, or other obligations due under this Lease at termination, including reasonable charges for excess wear. Landlord shall refund rent paid in advance for any period after the termination date within 30 days. The termination also ends any obligation of Tenant's dependents under this Lease.",
    },
    domesticViolence: {
      label: "Survivors of abuse, domestic violence, sexual assault, or stalking",
      cite: "R.I. Gen. Laws §§ 34-18-63, 34-18-67 (Survivor Early Lease Termination Act, effective July 1, 2026)",
      eligible:
        "Tenant may terminate this Lease without any early termination penalty or fee and without liability for future rent if, within the most recent 150 days, Tenant or a household member (a person residing with Tenant as an authorized occupant) has been a victim of abuse, domestic violence, sexual assault, or stalking, or an event has occurred that, together with past abuse, domestic violence, sexual assault, or stalking, causes the victim to fear for their safety.",
      notice:
        "Tenant gives Landlord notice and must vacate the Property within 30 days after giving notice, or at another time Landlord and Tenant agree on.",
      documentation:
        "Tenant must give Landlord written verification of one of the following: a valid protective order against the perpetrator; that the victim has started legal action to obtain a protective order; that the victim reported the abuse, domestic violence, sexual assault, or stalking to a law enforcement agency; or a written statement from a law enforcement official, attorney, health care provider, social worker, mental health counselor, therapist, domestic violence advocate, sexual assault advocate, child abuse advocate, or other victim's advocate at a nonprofit organization, college, university, or state agency that Tenant or the household member is a victim. Landlord shall keep this verification and Tenant's personal information strictly confidential except with Tenant's written consent or as the law requires.",
      liability:
        "Tenant owes rent only through the termination date or the date Tenant actually vacates, whichever is later. Tenant is entitled to the security deposit and any prepaid rent for the period after that date, with any deductions itemized, within 20 days after the tenancy ends, as long as Tenant turns over full possession without damage. A co-tenant who does not terminate remains bound by this Lease.",
    },
    other: [
      {
        label: "Tenant age 65 or older entering care or elderly housing",
        cite: "R.I. Gen. Laws § 34-18-15(e)",
        eligible:
          "A Tenant who is 65 or older, or who will turn 65 during this Lease, may terminate it in order to enter a residential care and assisted living facility, a nursing facility, or a unit in a private or public housing complex designated by the federal government as housing for the elderly.",
        notice:
          "Tenant gives written notice to the person to whom rent is usually paid. Termination takes effect no earlier than 45 days after the first rent due date following delivery of the notice.",
        documentation:
          "The notice must include documentation of Tenant's admission or pending admission to the facility or housing complex.",
        liability: "Tenant owes rent through the termination date and no early termination fee.",
      },
      {
        label: "Fire or casualty damage",
        cite: "R.I. Gen. Laws § 34-18-33",
        eligible:
          "If fire or other casualty damages or destroys the Property so that Tenant's enjoyment of it is substantially impaired, Tenant may move out immediately and terminate this Lease.",
        notice:
          "Tenant must notify Landlord in writing within 14 days after moving out of Tenant's intent to terminate. This Lease then ends as of the date Tenant moved out.",
        documentation: "",
        liability:
          "Rent is accounted for as of the date of the fire or casualty, and Landlord shall return the recoverable security deposit and all prepaid rent. Landlord may still recover damages in tort if Tenant caused the fire or casualty negligently or deliberately.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "R.I. Gen. Laws § 34-18-40",
      rule:
        "If Tenant abandons the Property, Landlord will send a certified letter to Tenant's last known address stating that Landlord will re-rent unless Tenant replies within seven days, and will then make reasonable efforts to re-rent the Property at a fair rental. If Landlord re-rents for a term beginning before this Lease ends, this Lease ends when the new tenancy begins, and rent received from the replacement tenant is credited against what Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner and manager disclosure",
      text:
        "Landlord discloses in writing, at or before the start of the tenancy, the name, address, and telephone number of the person authorized to manage the Property and of an owner or a person authorized to act for the owner to receive service of process, notices, and demands, and will keep this information current. Unless Landlord names someone else in writing, that person is {{landlord_name}}, {{landlord_address}}.",
      cite: "R.I. Gen. Laws § 34-18-20(a)–(b)",
    },
    {
      id: "fees_utilities_insurance",
      title: "Fees, utilities, and renters insurance",
      text:
        "Every fee Tenant must pay beyond rent is listed with the rent in this Lease, and additional fees may apply only as listed. Utilities included in the rent are: {{utilities}}; all other utility costs are Tenant's responsibility. If Landlord requires Tenant to carry renters insurance, that requirement is stated in this Lease. Landlord will not charge a convenience fee on a rent payment unless Landlord also accepts a form of payment that has no convenience fee. If Landlord fails to disclose a fee as required, Tenant may recover any undisclosed fee paid.",
      cite: "R.I. Gen. Laws §§ 34-18-15(a), 34-18-61",
    },
    {
      id: "liability_insurance",
      title: "Landlord's liability insurance",
      text:
        "Landlord maintains a general liability insurance policy of at least $100,000 for persons injured on the premises due to Landlord's negligence, and provides Tenant with a copy of the carrier's declaration page with this Lease and a new copy with each policy renewal.",
      cite: "R.I. Gen. Laws § 34-18-22(a)(7)",
    },
    {
      id: "housing_code_violations",
      title: "Housing code violations",
      text:
        "Before signing this Lease, Landlord has informed Tenant of any outstanding minimum housing code violations on the building. If a code enforcement agency cites Landlord for a violation, Landlord will give Tenant a copy of the notice within 30 days unless all violations are corrected within that time.",
      cite: "R.I. Gen. Laws § 34-18-22.1",
    },
    {
      id: "foreclosure_notice",
      title: "Mortgage delinquency notice",
      text:
        "If Landlord becomes 120 days delinquent on a mortgage on the Property, Landlord will notify Tenant that the Property may be subject to foreclosure. Tenant must continue to pay rent to Landlord under this Lease until a foreclosure occurs.",
      cite: "R.I. Gen. Laws § 34-18-20(d)",
    },
    {
      id: "lead_hazard_mitigation",
      title: "Rhode Island lead hazard mitigation",
      text:
        "Landlord provides Tenant with basic information about lead hazard control, a copy of the independent clearance inspection, and information on how to notify Landlord of deteriorating conditions. Landlord will correct lead hazards within 30 days after notice from a tenant of a unit with an at-risk occupant, or as required by R.I. Gen. Laws § 34-18-22.",
      cite: "R.I. Gen. Laws § 42-128.1-8(a)(4)–(5)",
      condition: "Only for a dwelling built before 1978 that is not lead-safe, lead-free, temporary housing, or elderly housing",
    },
  ],

  fairHousing: {
    stateClasses: [
      "sexual orientation",
      "gender identity or expression",
      "marital status",
      "lawful source of income",
      "military status as a veteran with an honorable discharge or an honorable or general administrative discharge",
      "servicemember in the armed forces",
      "country of ancestral origin",
      "age",
      "status as a victim of domestic abuse or as a person seeking a protective order",
    ],
    cite: "R.I. Gen. Laws § 34-37-4(a)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through an eviction action filed in the appropriate District Court or housing court using the statutory complaint and summons forms, after any required demand or termination notice, and execution of a court judgment. Landlord will not recover possession by any other means, including by willfully interrupting heat, running water, hot water, electricity, gas, or other essential services, except after abandonment or surrender.",
    cite: "R.I. Gen. Laws §§ 34-18-35, 34-18-36, 34-18-38, 34-18-44",
  },

  habitability: {
    rule:
      "Landlord shall comply with applicable building and housing codes affecting health and safety; make all repairs and do whatever is necessary to keep the premises fit and habitable; keep common areas clean and safe; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air conditioning, and other facilities and appliances, including elevators, that Landlord supplies or is required to supply; provide trash receptacles and arrange for removal; and supply running water and reasonable amounts of hot water at all times and reasonable heat between October 1 and May 1, except where heat or hot water is generated by equipment under Tenant's exclusive control and supplied by a direct utility connection.",
    cite: "R.I. Gen. Laws § 34-18-22",
  },

  sources: [
    { cite: "R.I. Gen. Laws § 34-18-7", url: RLTA("34-18-7") },
    { cite: "R.I. Gen. Laws § 34-18-8", url: RLTA("34-18-8") },
    { cite: "R.I. Gen. Laws § 34-18-11", url: RLTA("34-18-11") },
    { cite: "R.I. Gen. Laws § 34-18-14", url: RLTA("34-18-14") },
    { cite: "R.I. Gen. Laws § 34-18-15", url: RLTA("34-18-15") },
    { cite: "R.I. Gen. Laws § 34-18-16.1", url: RLTA("34-18-16.1") },
    { cite: "R.I. Gen. Laws § 34-18-17", url: RLTA("34-18-17") },
    { cite: "R.I. Gen. Laws § 34-18-19", url: RLTA("34-18-19") },
    { cite: "R.I. Gen. Laws § 34-18-20", url: RLTA("34-18-20") },
    { cite: "R.I. Gen. Laws § 34-18-22", url: RLTA("34-18-22") },
    { cite: "R.I. Gen. Laws § 34-18-22.1", url: RLTA("34-18-22.1") },
    { cite: "R.I. Gen. Laws § 34-18-22.2", url: RLTA("34-18-22.2") },
    { cite: "R.I. Gen. Laws § 34-18-26", url: RLTA("34-18-26") },
    { cite: "R.I. Gen. Laws § 34-18-33", url: RLTA("34-18-33") },
    { cite: "R.I. Gen. Laws § 34-18-35", url: RLTA("34-18-35") },
    { cite: "R.I. Gen. Laws § 34-18-36", url: RLTA("34-18-36") },
    { cite: "R.I. Gen. Laws § 34-18-37", url: RLTA("34-18-37") },
    { cite: "R.I. Gen. Laws § 34-18-38", url: RLTA("34-18-38") },
    { cite: "R.I. Gen. Laws § 34-18-40", url: RLTA("34-18-40") },
    { cite: "R.I. Gen. Laws § 34-18-44", url: RLTA("34-18-44") },
    { cite: "R.I. Gen. Laws § 34-18-46", url: RLTA("34-18-46") },
    { cite: "R.I. Gen. Laws § 34-18-58", url: RLTA("34-18-58") },
    { cite: "R.I. Gen. Laws § 34-18-59", url: RLTA("34-18-59") },
    { cite: "R.I. Gen. Laws § 34-18-61", url: RLTA("34-18-61") },
    { cite: "R.I. Gen. Laws § 34-18-62", url: RLTA("34-18-62") },
    { cite: "R.I. Gen. Laws §§ 34-18-11, 34-18-63 to 34-18-67 (2026-H 7199 Substitute A, enacted bill text; effective July 1, 2026)", url: "https://webserver.rilegislature.gov/BillText26/HouseText26/H7199A.htm" },
    { cite: "2026-S 2291 Substitute A (companion bill text)", url: "https://webserver.rilegislature.gov/BillText26/SenateText26/S2291A.htm" },
    { cite: "R.I. Gen. Laws § 34-37-3", url: RIGL("34", "34-37", "34-37-3") },
    { cite: "R.I. Gen. Laws § 34-37-4", url: RIGL("34", "34-37", "34-37-4") },
    { cite: "R.I. Gen. Laws § 34-37-4.1", url: RIGL("34", "34-37", "34-37-4.1") },
    { cite: "R.I. Gen. Laws § 42-128.1-8", url: RIGL("42", "42-128.1", "42-128.1-8") },
  ],

  reviewNotes: [
    "SURVIVOR TERMINATION (§ 34-18-63, eff. July 1, 2026) is NOT yet on the General Assembly's codified statutes site (the chapter index stops at § 34-18-62, and the 34-18-63 URL returns empty). The text used is 2026-H 7199 Substitute A (identical in substance to S 2291 Sub A); enactment and the July 1, 2026 effective date are corroborated by a June 23, 2026 RI REALTORS legal update (secondary). Please confirm the final public-law chapter text. Notable points: 150-day look-back; documentation options include a professional's letter; tenant must vacate within 30 days of notice; rent owed through the later of termination date or actual vacating; waiver void (§ 34-18-67); landlords also get new lock-change duties within two business days (§ 34-18-65) and may not refuse to rent based on a prior survivor termination (§ 34-18-64). The statute does not say whether the 30-day period is the termination date; the lease text tracks the statute's own words.",
    "Other 2026 session laws may not yet be codified on the official site; I found only introduced 2026 bills on deposit installments/interest (H 7130, H 8113, S 2617) and no evidence they passed. Re-check § 34-18-19 and § 34-18-15 for 2026 amendments before publishing.",
    "Late fees: Rhode Island has no statute setting a late-fee grace period or cap. A late fee must still not be a penalty, and fees beyond rent must be disclosed in the rent section of the lease (§ 34-18-15(a)(1)). The nonpayment eviction process cannot start until rent is 15 days in arrears (§ 34-18-35).",
    "Rent section formatting (engineering): § 34-18-15(a)(1) requires that fees beyond rent be disclosed 'in the same section as the rent disclosure' with a statement that additional fees may apply; the builder's Rent section currently does not list fees. The disclosure text above recites the rule, but the generator should list any non-rent fees in the Rent section itself. Utility allocation and any renters-insurance requirement must also appear in the lease (§ 34-18-15(a)(3)-(4)); co-living leases show utilities only in the Rent section.",
    "Insurance declaration page (§ 34-18-22(a)(7)): the landlord must attach the carrier's declaration page to the written lease at the start of the tenancy and at each renewal. Keycove should prompt for an upload.",
    "Rental registry: § 34-18-58 requires every landlord to register with the Department of Health (and, for pre-1978 units, file a lead certificate of conformance or exemption) within 30 days of acquiring a property or leasing to a new tenant, and re-register by October 1 each year; a landlord who is not registered may not file a nonpayment eviction (§ 34-18-58(g)). Application fees are banned (§ 34-18-59); only the actual cost of a state background or credit check may be charged, and not if the applicant supplies one under 90 days old.",
    "Military: § 34-18-15(f) restates the SCRA standard in state law and adds the dependent-release rule; 'servicemember' and 'military service' are not defined in chapter 34-18, so whether Rhode Island National Guard members on state active duty qualify is unclear.",
    "Death of tenant: § 34-18-38(d) gives a live-in caregiver or adult resident a 'post-death rental grace period' to continue the lease; it is not a termination right and is not encoded. Abandonment is defined as vacating without notice with rent unpaid more than 15 days and possessions removed (§ 34-18-11(1)).",
    "Immigration: § 34-18-62 (eff. July 2, 2025) bars landlords from asking about immigration or citizenship status of applicants or occupants; Keycove's Rhode Island application flow should not collect it.",
    "Fair housing: § 34-37-4.1 exempts owner-occupied two-unit buildings (and some owner-occupied four-unit buildings) from familial-status rules; this may matter for co-living but the agreement should not rely on it. § 34-37.1-3 (Homeless Bill of Rights, housing status) was not read.",
    "Local law: Providence and Warwick have absentee-landlord agent requirements (§ 34-18-57, not read in full); local housing codes may exceed state minimums.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
