import type { StateLawProfile } from "../types";

const CGA = (ch: string) => `https://www.cga.ct.gov/current/pub/chap_${ch}.htm`;
const CGA26 = (ch: string) => `https://www.cga.ct.gov/2026/sup/chap_${ch}.htm`;

export const CT: StateLawProfile = {
  code: "CT",
  name: "Connecticut",
  framework:
    "Connecticut General Statutes Title 47a (Landlord and Tenant), chapters 830 (Rights and Responsibilities of Landlord and Tenant), 831 (Security Deposits) and 832 (Summary Process), Conn. Gen. Stat. §§ 47a-1 et seq.",

  deposit: {
    maxMonths: 2,
    capRule:
      "The security deposit may not exceed two months' rent, or one month's rent if Tenant is 62 years of age or older. If Tenant turns 62 after paying a larger deposit, Landlord shall return the amount above one month's rent when Tenant asks. Advance payment of the first month's rent and a deposit for a key or special equipment are not part of the security deposit.",
    capCite: "Conn. Gen. Stat. § 47a-21(a)(11), (b)",
    returnDays: 21,
    returnRule:
      "Tenant may give Landlord a forwarding address in writing when the tenancy ends. Within 21 days after the tenancy ends, or within 15 days after Landlord receives Tenant's written forwarding address, whichever is later, Landlord shall deliver to Tenant at that address the full deposit plus accrued interest, or the balance after deducting damages caused by Tenant's failure to meet Tenant's obligations, together with a written statement itemizing the nature and amount of each deduction. A landlord who violates this rule is liable for twice the amount of the deposit.",
    returnCite: "Conn. Gen. Stat. § 47a-21(d)",
    holdingRule:
      "Landlord shall immediately deposit the entire security deposit in an escrow account for Tenant's benefit at a bank or savings institution located in Connecticut, and shall not withdraw it except as the law permits. Within 30 days after receiving the deposit (or after moving it to another institution or account), Landlord shall give Tenant written notice of the amount held for Tenant and the name and address of the financial institution where it is held. Landlord shall pay interest on the deposit at no less than the deposit index rate set each year by the Banking Commissioner, paid to Tenant or credited toward rent on each anniversary of the tenancy, and any accrued interest when the deposit is returned. The deposit remains Tenant's property and is exempt from Landlord's creditors.",
    holdingCite: "Conn. Gen. Stat. § 47a-21(c), (h), (i)",
    interestRequired: true,
    moveInInspection:
      "After signing this Lease and before Tenant moves in, Landlord shall offer Tenant a joint walk-through inspection of the Property. If Tenant requests it, Landlord and Tenant (or their designees) will complete the Connecticut Department of Housing preoccupancy walk-through checklist, note every existing condition, defect, or damage, and each sign and keep a copy. Landlord may not keep any part of the security deposit, or seek payment from Tenant, for any condition, defect, or damage noted on that checklist.",
  },

  lateFee: {
    graceDays: 9,
    capType: "lesser_of",
    capPercent: 5,
    capFlat: 50,
    capRule:
      "Landlord may charge a late fee only on a rent payment made after the grace period, which is nine days after the due date (four days for a week-to-week tenancy), extended by five more days for any month in which Landlord's online rent payment system prevents timely payment. The late fee may not exceed the lesser of (1) $5.00 per day, up to a maximum of $50.00, or (2) 5% of the delinquent rent payment (or 5% of Tenant's share if a governmental or charitable entity pays part of the rent). Only one late fee may be charged on any delinquent payment, no matter how long it remains unpaid, and Tenant will never be charged a reduced rent for paying early or a late fee during the grace period.",
    cite: "Conn. Gen. Stat. §§ 47a-15a, 47a-4(a)(8)–(9)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either party may end a month-to-month tenancy at the end of a monthly rental period by written notice given at least 30 days before that date. Landlord may not raise the rent unless Landlord gives Tenant written notice of the increase at least 45 days before it takes effect. If Tenant does not move out when the tenancy ends, Landlord must serve a statutory notice to quit possession at least three days before the quit date and obtain a summary process judgment; certain tenants who are 62 or older or who have a disability, in buildings or complexes of five or more units, may be evicted only for the reasons listed in Conn. Gen. Stat. § 47a-23c.",
    monthToMonthCite: "Conn. Gen. Stat. §§ 47a-3b, 47a-3d, 47a-4e, 47a-23, 47a-23c",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If rent remains unpaid nine days after it is due (four days for a week-to-week tenancy, plus five more days in any month when Landlord's online payment system prevented timely payment), Landlord may terminate the tenancy by having a state marshal serve a written notice to quit possession that gives Tenant at least three days to move out, and may then begin a summary process action in Superior Court.",
    nonpaymentCite: "Conn. Gen. Stat. §§ 47a-15a(a), 47a-23, 47a-23a",
    entryHours: null,
    entryRule:
      "Tenant shall not unreasonably withhold consent for Landlord to enter to inspect, make necessary or agreed repairs, alterations, or improvements, supply necessary or agreed services, or show the Property to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency, Landlord will give Tenant reasonable written or oral notice (at least 24 hours' notice under this Lease) and will enter only at reasonable times. Landlord will not abuse the right of entry or use it to harass Tenant. Without Tenant's consent, Landlord may enter only in an emergency, during an extended absence Tenant has reported, under a court order, or after Tenant has abandoned or surrendered the Property.",
    entryCite: "Conn. Gen. Stat. §§ 47a-16, 47a-16a",
  },

  earlyTermination: {
    military: {
      label: "Connecticut National Guard on active state service",
      cite: "Conn. Gen. Stat. § 27-34a",
      eligible:
        "A member of the Connecticut National Guard whom the Governor orders into active state service has the same lease termination rights as a servicemember on federal active duty under the Servicemembers Civil Relief Act (50 U.S.C. § 3955). This covers a member who signed this Lease before being ordered into active state service, and a member who signed this Lease while in service and then receives orders for a permanent change of station or to deploy for 90 days or more.",
      notice:
        "Tenant ends this Lease by delivering written notice of termination to Landlord. Because rent is paid monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is delivered.",
      documentation: "The notice must include a copy of the member's military orders.",
      liability:
        "Tenant owes rent only through the effective termination date, prorated. Landlord shall refund any rent paid in advance for a period after that date within 30 days and may not charge an early termination fee. Tenant remains responsible for unpaid amounts and damage beyond normal wear and tear that are due under this Lease at termination.",
    },
    domesticViolence: {
      label: "Victims of family violence or sexual assault",
      cite: "Conn. Gen. Stat. § 47a-11e",
      eligible:
        "Tenant may terminate this Lease without penalty or liability for the remaining term if Tenant is a victim of family violence (as defined in Conn. Gen. Stat. § 46b-38a), or Tenant or a dependent of Tenant is a victim of sexual assault under the statutes listed in § 47a-11e, and Tenant reasonably believes it is necessary to vacate the Property because of fear of imminent harm to Tenant or Tenant's dependent.",
      notice:
        "Tenant must give Landlord written notice at least 30 days before the date Tenant intends to terminate this Lease.",
      documentation:
        "The notice must include a statement made under oath or affirmation that Tenant or Tenant's dependent is a victim of family violence or sexual assault, stating the intended termination date, and stating that Tenant has vacated or will vacate and remove all possessions by that date (and that anything left behind is abandoned). It must also include either a copy of a police or court record detailing an act of family violence or sexual assault against Tenant or Tenant's dependent, dated no more than 90 days before the notice, or a signed written statement from an employee of the Office of Victim Services of the Judicial Department or the Office of the Victim Advocate detailing such an act, dated no more than 30 days before the notice.",
      liability:
        "Tenant owes no rent or penalty for the period after the termination date. Tenant remains liable for any rent unpaid before termination and for property damage Tenant caused. Any other tenant on this Lease remains liable under it, and any occupant without a right to occupy must leave by the termination date.",
    },
    other: [
      {
        label: "Fire or casualty damage",
        cite: "Conn. Gen. Stat. § 47a-14",
        eligible:
          "If fire or other casualty damages or destroys the Property so that Tenant's enjoyment of it is substantially impaired, and the damage was not caused by Tenant's negligence or willful act, Tenant may move out immediately and terminate this Lease.",
        notice:
          "Tenant must notify Landlord in writing within 14 days after moving out of Tenant's intent to terminate. This Lease then ends as of the date Tenant moved out.",
        documentation: "",
        liability:
          "Tenant owes no rent while the impairment continues. Rent is accounted for as of the date of the fire or casualty, and Landlord shall return the security deposit and any prepaid rent as required by Conn. Gen. Stat. § 47a-21.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "Conn. Gen. Stat. §§ 47a-11a, 47a-11c",
      rule:
        "If Tenant abandons the Property or breaches this Lease, Landlord shall make reasonable efforts to re-rent the Property at a fair rental to reduce Tenant's liability, and rent received from a replacement tenant will be credited against what Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "standardized_rental_terms_summary",
      title: "Standardized rental terms summary (first page)",
      text:
        "The first page of this Lease is a completed copy of the standardized rental terms summary form published by the Connecticut Department of Housing, showing the term, Landlord's name, the property management point of contact, the name of each Tenant, and the total periodic rent including every fee that Tenant must pay on a periodic basis. All payments Tenant makes under this Lease are applied first to rent and then to any other fees or charges.",
      cite: "Conn. Gen. Stat. § 47a-7d(c)–(e)",
    },
    {
      id: "owner_agent_identity",
      title: "Landlord and agent identification",
      text:
        "Landlord's name and address appear in the Parties section. Landlord shall notify Tenant in writing, on or before the start of the tenancy, of the name and address of the person authorized to manage the Property and of the person authorized to receive notices, demands, and service of process, and shall keep that information current. Unless Landlord names someone else, Landlord ({{landlord_name}}, {{landlord_address}}) is both.",
      cite: "Conn. Gen. Stat. § 47a-6",
    },
    {
      id: "bed_bugs",
      title: "Bed bug disclosure",
      text:
        "Landlord has disclosed to Tenant, before renting, whether the Property or any contiguous unit Landlord owns or leases is currently infested with bed bugs, and Landlord does not offer for rent a unit Landlord knows or reasonably suspects is infested. On request, Landlord will tell Tenant the last date the Property was inspected and found free of bed bugs. Tenant shall promptly notify Landlord if Tenant knows or suspects an infestation; Landlord will inspect within five business days and treat as the law requires.",
      cite: "Conn. Gen. Stat. § 47a-7a(b)–(c)",
      condition: "For a unit other than a single-family unattached home",
    },
    {
      id: "fire_sprinkler",
      title: "Fire sprinkler system notice",
      text:
        "Landlord states in the attached sprinkler notice, printed in at least 12-point boldface type, whether the building has an operative fire sprinkler system and, if it does, the date of its last maintenance and inspection.",
      cite: "Conn. Gen. Stat. § 47a-3f",
      condition: "Only for a building required by law to be equipped with a fire sprinkler system",
    },
    {
      id: "protected_tenant_notice",
      title: "Notice of rights of protected tenants",
      text:
        "Landlord has given Tenant the Department of Housing one-page notice describing the rights of tenants who are 62 or older or who have a qualifying disability (or who live with such a family member), including that they may be evicted only for the reasons listed in Conn. Gen. Stat. § 47a-23c and that their rent may be increased only to the extent it is fair and equitable.",
      cite: "Conn. Gen. Stat. § 47a-23c(e)",
      condition: "Only for a unit in a building or complex of five or more dwelling units",
    },
    {
      id: "common_interest_community",
      title: "Common interest community",
      text:
        "The Property is located in a common interest community (such as a condominium).",
      cite: "Conn. Gen. Stat. § 47a-3e",
      condition: "Only when the unit is rented from the community's declarant or successor declarant, or someone acting for them",
    },
    {
      id: "fees_and_payments",
      title: "Fees and payment methods",
      text:
        "Landlord will not charge Tenant a move-in or move-out fee, or any fee before or at the start of the tenancy other than the security deposit, the first month's rent, a deposit for a key or special equipment, and a tenant screening fee allowed by law. Landlord will not require electronic funds transfer as the only way to pay rent or the security deposit. Landlord will give a receipt for any cash payment and, on Tenant's request, a copy of the ledger for the Property showing charges, payments, and any balance.",
      cite: "Conn. Gen. Stat. §§ 47a-3a(c)–(d), 47a-4c, 47a-4d(b)",
    },
  ],

  fairHousing: {
    stateClasses: [
      "creed",
      "ancestry",
      "gender identity or expression",
      "sexual orientation",
      "civil union status",
      "marital status",
      "age",
      "lawful source of income",
      "status as a veteran",
      "status as a victim of domestic violence",
      "status as a victim of sexual assault",
      "status as a victim of trafficking in persons",
      "learning disability",
    ],
    cite: "Conn. Gen. Stat. §§ 46a-64c(a), 46a-81e",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a summary process action in the Connecticut Superior Court, after serving the notice to quit required by law, and only a state marshal acting under a court execution may remove Tenant or Tenant's belongings. Landlord will not lock Tenant out, remove Tenant's belongings, or interrupt utilities or essential services to force Tenant to leave.",
    cite: "Conn. Gen. Stat. §§ 47a-23 to 47a-26h, 47a-42, 47a-43, 47a-46",
  },

  habitability: {
    rule:
      "Landlord shall comply with all applicable building and housing codes materially affecting health and safety; make all repairs and do whatever is necessary to keep the premises fit and habitable; keep common areas clean and safe; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, and other facilities and appliances, and elevators, that Landlord supplies or is required to supply; provide and maintain trash receptacles and arrange for removal; and supply running water, reasonable amounts of hot water at all times, and reasonable heat, except where heat or hot water is generated by equipment under Tenant's exclusive control or supplied by a direct utility connection.",
    cite: "Conn. Gen. Stat. § 47a-7",
  },

  sources: [
    { cite: "Conn. Gen. Stat. §§ 47a-1 to 47a-20f (chapter 830, rev. Jan. 1, 2025)", url: CGA("830") },
    { cite: "Conn. Gen. Stat. §§ 47a-1, 47a-3a, 47a-4f, 47a-7d, 47a-14h, 47a-15a (2026 Supplement)", url: CGA26("830") },
    { cite: "Conn. Gen. Stat. §§ 47a-21, 47a-22, 47a-22a (chapter 831)", url: CGA("831") },
    { cite: "Conn. Gen. Stat. § 47a-21 (2026 Supplement)", url: CGA26("831") },
    { cite: "Conn. Gen. Stat. §§ 47a-23, 47a-23a, 47a-23c (chapter 832)", url: CGA("832") },
    { cite: "Conn. Gen. Stat. §§ 47a-23, 47a-26e, 47a-35a, 47a-42 (2026 Supplement)", url: CGA26("832") },
    { cite: "Conn. Gen. Stat. §§ 47a-43, 47a-46 (chapter 833)", url: CGA("833") },
    { cite: "Conn. Gen. Stat. § 27-34a (chapter 504)", url: CGA("504") },
    { cite: "Conn. Gen. Stat. §§ 46a-64c, 46a-81e (chapter 814c)", url: CGA("814c") },
    { cite: "Conn. Gen. Stat. § 46a-64c (2026 Supplement)", url: CGA26("814c") },
    { cite: "50 U.S.C. § 3955 (incorporated by Conn. Gen. Stat. § 27-34a)", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "STANDARDIZED SUMMARY FORM (engineering + attorney): Conn. Gen. Stat. § 47a-7d(d) (P.A. 25-44) bars any landlord, on and after April 1, 2026, from providing a written rental agreement unless its FIRST PAGE is a completed copy of the Department of Housing standardized rental terms summary form (English and Spanish versions exist). Violation = civil penalty of one month's rent plus attorney's fees (§ 47a-7d(f)). The disclosure text above only recites compliance; the generator must actually render the DOH form as page one of every Connecticut lease and co-living agreement. § 47a-7d(a) also requires advertised rent to include all mandatory periodic fees.",
    "Month-to-month notice is a judgment call. Connecticut has no statute fixing a notice period to end a month-to-month tenancy: under §§ 47a-3b/47a-3d the tenancy lapses at the end of each month and the landlord then serves a 3-day notice to quit under § 47a-23. We used a contractual 30-day notice for both parties (more protective of the tenant than the statute). Confirm the 30-day tenant-side requirement is acceptable and that it is not read as limiting the landlord's statutory notice-to-quit remedy.",
    "Military: Connecticut has no landlord-tenant-code military termination statute. § 27-34a(a) gives Connecticut National Guard members ordered into active state service 'all of the protections' of the SCRA, which we read to include 50 U.S.C. § 3955 lease termination; § 27-34a(b) adds telecom/gym contract termination only. How § 3955's 'military orders for a permanent change of station or to deploy ... 90 days' prong maps onto state active service orders is not addressed by the statute; please confirm the eligibility sentence.",
    "Family violence termination (§ 47a-11e) covers family violence and listed sexual assault offenses only; it does not expressly cover stalking or trafficking (although § 46a-64c lists trafficking victims as a fair housing class). It applies to agreements entered into or renewed on or after Jan. 1, 2011 (sexual assault: Jan. 1, 2014). § 47a-7b separately requires lock changes within 48 hours for tenants protected by a stay-away order.",
    "Late fee: § 47a-15a(b) allows a late charge only if the agreement contains a valid written late-charge agreement; capped at lesser of $5/day (max $50) or 5% of the delinquent payment, one charge per payment. compute.ts clamps to min($50, 5% of rent), which is the maximum ever allowed; a per-day accrual below $50 must be stated by the landlord.",
    "Entry: § 47a-16 requires only 'reasonable written or oral notice'; the 24-hour figure in entryRule is a lease term, not a statutory number.",
    "Habitability/disclosure formatting: § 47a-3f requires the sprinkler notice in at least 12-point boldface uniform font; the builder currently renders disclosures as plain list items. Bed bug duties apply only to units other than single-family unattached units (§ 47a-7a(a)(7)).",
    "Fees: § 47a-4d bars any application fee and any move-in/move-out fee; only a tenant screening report fee of up to $50 (CPI-adjusted by the Commissioner of Housing) is allowed, with a copy of the report and receipt to the applicant. Rent increases need 45 days' written notice (§ 47a-4e). Revenue-management software is an unfair trade practice from Jan. 1, 2026 (§ 47a-4f).",
    "Protected tenants: § 47a-23c (age 62+ or disability, buildings/complexes of 5+ units) limits eviction to listed good causes and limits rent increases to 'fair and equitable' amounts reviewable by a fair rent commission or the court; the DOH notice must be given at lease signing or renewal (§ 47a-23c(e)).",
    "Local law: many Connecticut municipalities have fair rent commissions (Conn. Gen. Stat. § 7-148b et seq., not encoded); several cities (e.g., New Haven, Hartford, Stamford) have rental licensing/registration and housing code requirements. Fair housing exemptions in § 46a-64c(b) (owner-occupied room rentals and owner-occupied two-family homes) may matter for co-living, but the agreement should not rely on them.",
    "Co-living: a room rental is a 'dwelling unit' under § 47a-1, so the full chapter (including summary process) applies; a 'roomer' paying weekly rent is week-to-week (§ 47a-3b). Hotel-style occupancy is transient only if under 30 days or not a primary residence (§ 47a-2(c)).",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
