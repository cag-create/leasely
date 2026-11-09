import type { StateLawProfile } from "../types";

const SCCODE = (title: string, chapter: string) =>
  `https://www.scstatehouse.gov/code/statmast.php?title=${title}&chapter=${chapter}`;
const RLTA = SCCODE("27", "40");

export const SC: StateLawProfile = {
  code: "SC",
  name: "South Carolina",
  framework: "South Carolina Residential Landlord and Tenant Act, S.C. Code Ann. §§ 27-40-10 et seq.",

  deposit: {
    maxMonths: null,
    capRule:
      "South Carolina law sets no maximum security deposit. If Landlord rents more than four adjoining dwelling units on the premises and uses different standards to calculate deposits for different tenants, Landlord must post the standards in a conspicuous place on the premises or where rent is paid, or give each prospective tenant a written statement of them, before this Lease is signed.",
    capCite: "S.C. Code Ann. § 27-40-410(c)",
    returnDays: 30,
    returnRule:
      "When the tenancy ends, Landlord may keep from the security deposit and any prepaid rent only accrued rent and the amount of damages Landlord has suffered because Tenant failed to meet Tenant's maintenance duties under S.C. Code § 27-40-510. Landlord shall send Tenant a written notice itemizing each deduction, together with any amount due, within 30 days after the later of the end of the tenancy and delivery of possession, or Tenant's demand. Tenant shall give Landlord a forwarding address in writing. If Landlord wrongfully withholds any part of the deposit or prepaid rent, Tenant may recover three times the amount wrongfully withheld plus reasonable attorney's fees.",
    returnCite: "S.C. Code Ann. § 27-40-410(a)-(b)",
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
      "Either Landlord or Tenant may end a month-to-month tenancy by written notice given to the other at least 30 days before the termination date stated in the notice (seven days for a week-to-week tenancy).",
    monthToMonthCite: "S.C. Code Ann. § 27-40-770(a)-(b)",
    nonpaymentDays: 5,
    nonpaymentRule:
      "If rent is not paid within five days after the due date, Landlord may terminate this Lease and begin eviction proceedings. The notice titled \"IF YOU DO NOT PAY YOUR RENT ON TIME\" in this Lease is Tenant's written notice of nonpayment, and no other notice will be given before an eviction for nonpayment, including during any month-to-month tenancy after the original term.",
    nonpaymentCite: "S.C. Code Ann. §§ 27-40-710(B), 27-37-10(B)",
    entryHours: 24,
    entryRule:
      "Tenant shall not unreasonably withhold consent for Landlord to enter to inspect the Property, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show the Property to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except as stated below, Landlord will give Tenant at least 24 hours' notice of the intent to enter and will enter only at reasonable times. Landlord may enter at any time in an emergency, including when expected weather conditions pose a likely danger to the Property. LANDLORD MAY ALSO ENTER WITHOUT TENANT'S CONSENT, AFTER ANNOUNCING THE INTENT TO ENTER, BETWEEN 9:00 A.M. AND 6:00 P.M. TO PROVIDE REGULARLY SCHEDULED PERIODIC SERVICES SUCH AS CHANGING FURNACE AND AIR-CONDITIONING FILTERS AND PROVIDING TERMITE, INSECT, OR PEST TREATMENT, AND BETWEEN 8:00 A.M. AND 8:00 P.M. TO PROVIDE SERVICES TENANT HAS REQUESTED. Landlord will not abuse the right of access or use it to harass Tenant. Tenant shall not change the locks without Landlord's permission.",
    entryCite: "S.C. Code Ann. § 27-40-530",
  },

  earlyTermination: {
    military: {
      label: "National Guard on state active duty (South Carolina Servicemembers Civil Relief Act)",
      cite: "S.C. Code Ann. §§ 25-1-4030(2), 25-1-4040",
      eligible:
        "A member of the South Carolina National Guard on state active duty under Article 15, Chapter 1, Title 25 of the South Carolina Code for more than 30 consecutive days, a member of another state's National Guard serving under a similar order of that state's governor for more than 30 consecutive days, or a South Carolina National Guard member called to active service by the President or the Secretary of Defense for more than 30 days in response to a declared national emergency, has the same lease termination rights as a servicemember under the federal Servicemembers Civil Relief Act, 50 U.S.C. § 3955 (described above).",
      notice:
        "Tenant delivers written notice of termination. For a lease with monthly rent, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered.",
      documentation:
        "For state active duty or another state's National Guard duty, Tenant gives Landlord a written or electronic copy of the order to military service.",
      liability:
        "Tenant owes rent prorated to the termination date and no early termination fee. Rent paid in advance for any period after termination is refunded within 30 days.",
    },
    domesticViolence: {
      label: "Domestic abuse or violence by a co-tenant",
      cite: "S.C. Code Ann. §§ 27-40-350, 27-40-210(19)-(20) (2026 Act No. 184)",
      eligible:
        "A Tenant who is the victim of domestic abuse or violence (as defined in Chapter 4, Title 20 or Chapter 25, Title 16 of the South Carolina Code) committed by a person who is also a leaseholder on this Property may terminate Tenant's future obligations under this Lease, if the abuse or violence is documented by a restraining order or an order of protection or the perpetrator has been convicted of it.",
      notice:
        "Within 60 days after the documented incident, Tenant gives Landlord written notice of the intent to terminate. Termination is effective on the date stated in the notice, which must be at least 30 days after Landlord receives it unless Landlord agrees in writing to an earlier date. Landlord will not require Tenant to vacate before 60 days after the incident.",
      documentation:
        "The notice must be accompanied by documentation of the incident, such as a restraining order, an order of protection, or evidence of a conviction for domestic violence or abuse.",
      liability:
        "Tenant owes rent and other amounts due through the effective date of termination and is liable for any damage Tenant caused to the Property, but owes no penalty or fee for the early termination, including the early termination fee. Landlord is not required to return the security deposit, if otherwise due, until the end of the lease term. Any co-tenants remain responsible for the full rent for the rest of the term. If the perpetrator is the only remaining tenant, Landlord may terminate this Lease on five days' written notice and recover actual damages from the perpetrator. Landlord will not retaliate against Tenant for terminating under this right.",
    },
    other: [
      {
        label: "Fire or casualty damage",
        cite: "S.C. Code Ann. § 27-40-650",
        eligible:
          "If fire or casualty damages or destroys the Property so that normal use and occupancy is substantially impaired, Tenant may terminate this Lease.",
        notice:
          "Tenant vacates immediately and notifies Landlord in writing within seven days afterward of the intent to terminate; this Lease ends on the date Tenant vacated. If continued occupancy is lawful, Tenant may instead vacate only the unusable part and pay reduced rent.",
        documentation: "",
        liability:
          "Rent is accounted for as of the date of the fire or casualty. Unless Tenant's negligence or conduct caused the fire or casualty, Landlord returns the recoverable security deposit and all prepaid rent. No early termination fee is owed.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "S.C. Code Ann. § 27-40-610",
        eligible:
          "If Landlord materially fails to comply with this Lease, or fails to comply with S.C. Code § 27-40-440 in a way that materially affects health and safety or the physical condition of the Property, Tenant may terminate this Lease, unless Tenant, a family member, or a person on the premises with Tenant's permission caused the condition.",
        notice:
          "Tenant delivers written notice describing the breach and stating that this Lease will terminate on a date at least 14 days after Landlord receives the notice if the breach is not remedied within 14 days. This Lease does not terminate if Landlord remedies the breach in time, or, for a breach not affecting health and safety that cannot be remedied in 14 days, if Landlord begins the remedy within 14 days and completes it in good faith within a reasonable time.",
        documentation: "",
        liability: "No early termination fee is owed, and Landlord returns the recoverable security deposit.",
      },
      {
        label: "Unlawful ouster or interruption of essential services",
        cite: "S.C. Code Ann. § 27-40-660",
        eligible:
          "If Landlord unlawfully removes or excludes Tenant, or willfully interrupts essential services, Tenant may recover possession or terminate this Lease.",
        notice: "",
        documentation: "",
        liability:
          "No early termination fee is owed. Tenant may recover three months' rent or twice actual damages, whichever is greater, plus reasonable attorney's fees, and Landlord returns the recoverable security deposit.",
      },
      {
        label: "Unlawful entry or harassment by Landlord",
        cite: "S.C. Code Ann. § 27-40-780(b)",
        eligible:
          "If Landlord knowingly makes an unlawful entry, makes repeated lawful entries in an unreasonable manner, or makes repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "",
        documentation: "",
        liability: "No early termination fee is owed, and Tenant may recover actual damages and reasonable attorney's fees.",
      },
      {
        label: "Failure to deliver possession",
        cite: "S.C. Code Ann. § 27-40-620",
        eligible:
          "If Landlord does not deliver possession of the Property at the start of the term, rent abates until possession is delivered and Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord at least five days' written notice of termination.",
        documentation: "",
        liability: "Landlord returns all prepaid rent and the security deposit. No early termination fee is owed.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "S.C. Code Ann. § 27-40-730(c)",
      rule:
        "If Tenant abandons the Property, Landlord shall make reasonable efforts to re-rent it at a fair rental. If Landlord re-rents it for a term beginning before this Lease would have ended, this Lease ends when the new tenancy begins. If Landlord does not use reasonable efforts to re-rent, or accepts the abandonment as a surrender, this Lease is treated as terminated by Landlord as of the date Landlord had notice of the abandonment.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner or Agent for Notices",
      text:
        "The owner of the Property, or the person authorized to act for the owner as agent for service of process and for receiving and receipting notices and demands, is {{landlord_name}}, {{landlord_address}}, unless Landlord identifies a different owner or agent in writing at or before the start of the tenancy. Landlord will keep this information current.",
      cite: "S.C. Code Ann. § 27-40-420",
    },
  ],

  additionalClauses: [
    {
      title: "IF YOU DO NOT PAY YOUR RENT ON TIME",
      text:
        "IF YOU DO NOT PAY YOUR RENT ON TIME: This is your notice. If you do not pay your rent within five days of the due date, the landlord can start to have you evicted. You will get no other notice as long as you live in this rental unit.",
      cite: "S.C. Code Ann. §§ 27-40-710(B), 27-37-10(B)",
    },
  ],

  fairHousing: {
    stateClasses: [],
    cite: "S.C. Code Ann. § 31-21-40 (South Carolina Fair Housing Law: race, color, religion, sex, familial status, national origin, handicap)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through an ejectment action in magistrate's court, in which the magistrate issues a rule requiring Tenant to vacate or show cause within 10 days and, if Landlord prevails, a writ of ejectment carried out by a sheriff or constable. Landlord will not remove or exclude Tenant, or interrupt essential services, to regain possession.",
    cite: "S.C. Code Ann. §§ 27-37-10 to 27-37-40, 27-40-760",
  },

  habitability: {
    rule:
      "Landlord shall comply with applicable building and housing codes materially affecting health and safety, make all repairs and do whatever is reasonably necessary to put and keep the Property in a fit and habitable condition, keep common areas reasonably safe (and, for premises with more than four units, reasonably clean), make running water and reasonable amounts of hot water available at all times and provide reasonable heat, and maintain in reasonably good and safe working order all electrical, gas, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies. Appliances in the Property are presumed supplied by Landlord unless this Lease specifically excludes them, and no appliance or facility needed for essential services may be excluded.",
    cite: "S.C. Code Ann. § 27-40-440",
  },

  sources: [
    { cite: "S.C. Code Ann. §§ 27-40-10 to 27-40-940 (full chapter, incl. §§ 27-40-210, -240, -310, -330, -410, -420, -440, -530, -610 to -660, -710 to -790, -910)", url: RLTA },
    { cite: "2026 S.C. Act No. 184 (H.3569), adding § 27-40-350 and § 27-40-210(19)-(20), ratified text", url: "https://www.scstatehouse.gov/sess126_2025-2026/bills/3569.htm" },
    { cite: "H.3569 bill history (signed May 18, 2026; effective on approval)", url: "https://www.scstatehouse.gov/billsearch.php?billnumbers=3569&session=126&summary=B" },
    { cite: "S.C. Code Ann. §§ 25-1-4010 to 25-1-4080 (South Carolina Servicemembers Civil Relief Act)", url: SCCODE("25", "1") },
    { cite: "S.C. Code Ann. §§ 27-37-10 to 27-37-40", url: SCCODE("27", "37") },
    { cite: "S.C. Code Ann. §§ 31-21-30, 31-21-40", url: SCCODE("31", "21") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "NEW 2026 LAW: § 27-40-350 (domestic violence termination) was enacted by Act No. 184 of 2026 (H.3569), signed May 18, 2026, effective on approval. It does not yet appear in the online Code of Laws (Chapter 40 there ends without it), so the values come from the ratified act text. It is narrow: a 'qualifying incident' requires that BOTH the victim and the perpetrator be leaseholders on the same property, and that the abuse be documented by a restraining order or order of protection or a conviction. It does not cover sexual assault or stalking by a non-tenant. The act lets the landlord hold the deposit 'until the end of the lease' and does not say whether the remaining co-tenants' liability is joint and several. Attorney to review.",
    "Military: there is no state military lease-termination statute in Title 27. The South Carolina SCRA (§§ 25-1-4010 et seq., 2019 Act No. 23) extends federal SCRA rights, including 50 U.S.C. § 3955, to SC National Guard members on state active duty (Article 15) for more than 30 consecutive days and to other states' Guard members on similar orders. For those two groups, remedies attach only after the servicemember gives a copy of the order (§ 25-1-4040). § 25-1-4050 gives dependents only § 25-1-4060 and SCRA Subchapter II rights, so the lease does not claim an independent dependent lease-termination right (§ 3955 is in Subchapter III). The SCRA's own coverage conditions (orders of 90 days or more for leases signed during service) presumably still apply; attorney to confirm. This extension is placed in 'military' because it is South Carolina's only state-law military termination right.",
    "BUILDER FORMATTING: § 27-37-10(B) requires the nonpayment notice to be in 'bold conspicuous type' (and § 27-40-710(B) says 'conspicuous language'). § 27-40-530(b)(2) requires the periodic-services entry right to be 'conspicuously set forth in writing in the rental agreement.' The builder HTML-escapes all text, so the profile puts these in a titled additional clause and in capital letters. The builder should render the SC nonpayment clause in bold.",
    "No late-fee statute. 'Rent' is defined to include late charges (§ 27-40-210(11)), so an unpaid late fee may support the 5-day nonpayment remedy. Courts review late fees for unconscionability (§ 27-40-230). Late fees are not separately capped.",
    "No deposit cap, escrow, or interest requirement. A landlord with more than four adjoining units who uses different deposit standards must post or disclose them, or the excess over the lowest comparable deposit cannot be applied to damages (§ 27-40-410(c)). Wrongful withholding carries treble damages (§ 27-40-410(b)).",
    "Early termination fee: § 27-40-330(c) expressly preserves 'bona fide liquidated damage provisions which shall establish the amount of damages for loss of rent resulting from a premature termination of a lease,' which supports the builder's fee. There is no statutory cap.",
    "§ 27-40-330(a) bars waiver of chapter rights, confessions of judgment, and exculpation clauses. A landlord who knowingly uses a prohibited clause is liable for up to the deposit amount, or up to three months' rent if malicious.",
    "Eviction notices must inform the tenant that personal property placed on the street after eviction may be removed after 48 hours (§ 27-40-710(D)). This applies to the eviction notice, not the lease.",
    "Retaliation (§ 27-40-910) and abuse-of-access remedies are not encoded beyond the termination rights listed.",
    "Local law: no South Carolina city rent control or just-cause ordinances were identified. A statewide preemption statute was not researched.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
