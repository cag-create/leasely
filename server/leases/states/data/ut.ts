import type { StateLawProfile } from "../types";

export const UT: StateLawProfile = {
  code: "UT",
  name: "Utah",
  framework:
    "Utah Fit Premises Act, Utah Code Ann. §§ 57-22-1 et seq.; Residential Renters' Deposits, Utah Code Ann. §§ 57-17-1 et seq.; Forcible Entry and Detainer, Utah Code Ann. §§ 78B-6-801 et seq.",

  deposit: {
    maxMonths: null,
    capRule:
      "Utah law sets no maximum security deposit. If any part of a deposit is non-refundable, that must be stated in writing to Tenant at the time the deposit is taken.",
    capCite: "Utah Code Ann. § 57-17-2",
    returnDays: 30,
    returnRule:
      "No later than 30 days after Tenant vacates and returns possession to Landlord, Landlord will mail or deliver to Tenant's last known address, or send electronically by a means Tenant has provided, the balance of the deposit, the balance of any prepaid rent, and a written notice itemizing and explaining each deduction. Landlord may deduct unpaid rent, damage beyond reasonable wear and tear, other costs and fees provided for in this Lease, and cleaning of the unit. If Landlord does not comply, Tenant may serve the statutory notice to provide deposit disposition, after which Landlord has five business days to comply.",
    returnCite: "Utah Code Ann. §§ 57-17-3, 57-17-5",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection:
      "Before this Lease is signed, Landlord will either give Tenant a written inventory of the condition of the unit (excluding ordinary wear and tear), give Tenant a form to document the condition of the unit and allow a reasonable time after move-in to complete and return it, or give Tenant an opportunity to conduct a walkthrough inspection.",
  },

  lateFee: {
    graceDays: null,
    capType: "greater_of",
    capPercent: 10,
    capFlat: 75,
    capRule: "may not exceed the greater of 10% of the rent stated in this Lease or $75",
    cite: "Utah Code Ann. § 57-22-4(5)(a)",
  },

  notice: {
    monthToMonthDays: 15,
    monthToMonthRule:
      "Landlord may end a month-to-month (or other periodic) tenancy by serving written notice at least 15 calendar days before the end of the rental period, with the tenancy ending at the end of that period. Tenant will give Landlord the same notice.",
    monthToMonthCite: "Utah Code Ann. § 78B-6-802(1)(b)(i)",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If Tenant defaults in paying rent or other amounts due, Landlord may serve a written notice requiring payment or surrender of the premises within three business days after service. The notice may be served at any time after rent becomes due.",
    nonpaymentCite: "Utah Code Ann. § 78B-6-802(1)(c)",
    entryHours: 24,
    entryRule:
      "Landlord will give Tenant at least 24 hours' notice before entering the unit. Tenant will not unreasonably deny Landlord access to make repairs.",
    entryCite: "Utah Code Ann. §§ 57-22-4(2), 57-22-5(2)(c)",
  },

  earlyTermination: {
    military: {
      label: "Utah National Guard or State Defense Force on state military service",
      cite: "Utah Code Ann. §§ 39A-6-101, 39A-6-102; 50 U.S.C. § 3955",
      eligible:
        "A Tenant who is a member of the Utah National Guard or Utah State Defense Force ordered by the Governor to state military service (active, full-time service with a recognized military unit called into service for at least 30 days) has the same lease termination rights that federal law gives for activation to federal military service, and may terminate this Lease on entering that service or on receiving orders for a permanent change of station or a deployment of at least 90 days.",
      notice:
        "Tenant delivers written notice of termination to Landlord. For monthly rent, termination is effective 30 days after the first date on which the next rental payment is due after the notice is delivered.",
      documentation: "The notice must include a copy of Tenant's military orders or a written verification from Tenant's commanding officer.",
      liability:
        "Tenant owes rent prorated to the effective termination date and any other obligations due under this Lease at that time, including reasonable charges for excess wear, but no early termination charge. Landlord will refund rent paid in advance for any period after the termination date within 30 days.",
    },
    domesticViolence: {
      label: "Domestic violence",
      cite: "Utah Code Ann. § 57-22-5.1(4)–(9)",
      eligible:
        "A Tenant who is a victim of domestic violence may terminate all of Tenant's future obligations under this Lease if Tenant is in compliance with this Lease (including being current on payments), except that noncompliance caused by domestic violence that began less than 30 days before the notice does not bar termination. Tenant may not use this right after a notice of eviction has been served.",
      notice:
        "Tenant gives Landlord written notice of termination stating the date Tenant intends to vacate. Tenant must vacate within 15 days after giving the notice.",
      documentation:
        "Tenant must give Landlord either a court order protecting Tenant from the domestic violence perpetrator (a civil or criminal protective order or stalking injunction, but not an ex parte order for which a hearing is requested), or a copy of a police report documenting that Tenant is a victim of domestic violence and is not the predominant aggressor. If relying on recent domestic-violence-related noncompliance, Tenant must include evidence that it occurred less than 30 days before the notice and was due to domestic violence.",
      liability:
        "Tenant must pay Landlord a termination fee equal to one month's rent on the later of the day Tenant gives notice or the day Tenant vacates. Tenant also owes amounts owed before the notice, rent for any occupancy during the 15-day period, and any amount owed for domestic-violence-related noncompliance. Tenant owes no rent or fees for the period after Tenant vacates. The Lease continues for any other tenant entitled to occupy the unit.",
    },
    other: [
      {
        label: "Failure to deliver possession",
        cite: "Utah Code Ann. § 57-22-4.1",
        eligible: "If Landlord fails to deliver possession of the unit on the date provided in this Lease, Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord written notice of termination. If Tenant does not terminate, rent abates until Landlord delivers possession.",
        documentation: "",
        liability: "Landlord will return all prepaid rent and any security deposit as promptly as reasonable.",
      },
      {
        label: "Uncorrected deficient condition (rent abatement remedy)",
        cite: "Utah Code Ann. § 57-22-6",
        eligible:
          "If the unit has a condition that violates a standard of habitability or a requirement of this Lease, not caused by Tenant or Tenant's family or guests, and Tenant is in compliance with Utah Code Ann. § 57-22-5, Tenant may serve a notice of deficient condition choosing the rent abatement remedy. If Landlord does not take substantial action toward correcting the condition within the corrective period (three calendar days for a standard of habitability, 10 calendar days for a lease requirement), this Lease terminates.",
        notice:
          "The notice must describe each deficient condition, state the corrective period, state that Tenant chooses the rent abatement remedy, give Landlord permission to enter to correct the condition, and be served as provided in Utah Code Ann. § 78B-6-805 or this Lease. Tenant must vacate within 10 calendar days after the corrective period expires.",
        documentation: "",
        liability:
          "Rent abates as of the date of the notice. Landlord must immediately refund the entire security deposit and a prorated refund of prepaid rent, including rent for the period after the notice.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "Utah Code Ann. § 78B-6-816(1)",
      rule:
        "If Tenant abandons the premises, Landlord may retake them and will attempt to re-rent them at a fair rental value. Tenant is then liable for the lesser of the rent due for the rest of the term, or the rent accrued during the period reasonably needed to re-rent at fair rental value plus any difference between the fair rental value and the rent in this Lease, a reasonable commission for re-renting, and the cost of restoring the unit to its move-in condition less normal wear and tear.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner and manager identification",
      text:
        "Landlord discloses below the name, address and telephone number of the owner, or of the person authorized to manage the unit and, if that person may not receive notices, of the person authorized to receive notices and perform the owner's duties on the owner's behalf. Landlord will give Tenant an executed copy of this Lease and a copy of any rules and regulations that apply to the unit.",
      cite: "Utah Code Ann. § 57-22-4(7)",
    },
    {
      id: "move_in_condition",
      title: "Condition of the unit at move-in",
      text:
        "Before signing this Lease, Landlord has provided a written inventory of the unit's condition, a condition form for Tenant to complete and return within a reasonable time after move-in, or an opportunity for a walkthrough inspection.",
      cite: "Utah Code Ann. § 57-22-4(6)",
    },
    {
      id: "nonrefundable_deposit",
      title: "Non-refundable portion of deposit",
      text: "Any part of the deposit that is non-refundable is identified in writing in this Lease. All other amounts deposited are refundable as provided by law.",
      cite: "Utah Code Ann. § 57-17-2",
    },
    {
      id: "fees_in_lease",
      title: "Fees and charges",
      text:
        "Landlord will not charge Tenant any fee, fine, assessment, interest or other cost in an amount greater than this Lease states or that this Lease does not include, except that during a month-to-month tenancy Landlord may add a charge with 15 days' notice.",
      cite: "Utah Code Ann. § 57-22-4(5)(b)",
    },
    {
      id: "public_safety_assistance",
      title: "Requests for police or emergency assistance",
      text:
        "Landlord will not restrict Tenant's ability to request assistance from police, fire, ambulance or other public safety agencies, and will not penalize or evict Tenant for making reasonable requests for that assistance.",
      cite: "Utah Code Ann. § 57-22-5.1(10)",
    },
  ],

  fairHousing: {
    stateClasses: ["source of income", "sexual orientation", "gender identity"],
    cite: "Utah Code Ann. §§ 57-21-2, 57-21-3, 57-21-5",
  },

  eviction: {
    rule:
      "Landlord may remove Tenant only by judicial process through an unlawful detainer action under Utah Code Ann. §§ 78B-6-801 et seq. Landlord will not willfully exclude Tenant from the premises in any other manner, except that Landlord may retake and re-rent abandoned premises as Utah law allows.",
    cite: "Utah Code Ann. §§ 78B-6-802, 78B-6-814",
  },

  habitability: {
    rule:
      "Landlord will not rent the unit unless it is safe, sanitary and fit for human occupancy, and will maintain it in a condition fit for human habitation in accordance with local ordinances and health board rules, including common areas in a sanitary and safe condition, electrical systems, plumbing, heating, hot and cold water, any air conditioning system in operable condition, other appliances and facilities specifically contracted in this Lease, and, in buildings with more than two units, garbage receptacles and removal unless otherwise agreed.",
    cite: "Utah Code Ann. §§ 57-22-3(1), 57-22-4(1)",
  },

  sources: [
    { cite: "Utah Code Ann. § 57-17-1", url: "https://le.utah.gov/xcode/Title57/Chapter17/C57-17-S1_1800010118000101.html" },
    { cite: "Utah Code Ann. § 57-17-2", url: "https://le.utah.gov/xcode/Title57/Chapter17/C57-17-S2_1800010118000101.html" },
    { cite: "Utah Code Ann. § 57-17-3 (eff. 5/7/2025)", url: "https://le.utah.gov/xcode/Title57/Chapter17/C57-17-S3_2025050720250507.html" },
    { cite: "Utah Code Ann. § 57-17-4", url: "https://le.utah.gov/xcode/Title57/Chapter17/C57-17-S4_1800010118000101.html" },
    { cite: "Utah Code Ann. § 57-17-5 (eff. 7/1/2024)", url: "https://le.utah.gov/xcode/Title57/Chapter17/C57-17-S5_2023050320240701.html" },
    { cite: "Utah Code Ann. § 57-22-2", url: "https://le.utah.gov/xcode/Title57/Chapter22/C57-22-S2_2017050920170509.html" },
    { cite: "Utah Code Ann. § 57-22-3 (eff. 5/7/2025)", url: "https://le.utah.gov/xcode/Title57/Chapter22/C57-22-S3_2025050720250507.html" },
    { cite: "Utah Code Ann. § 57-22-4", url: "https://le.utah.gov/xcode/Title57/Chapter22/C57-22-S4_2021050520210505.html" },
    { cite: "Utah Code Ann. § 57-22-4.1", url: "https://le.utah.gov/xcode/Title57/Chapter22/C57-22-S4.1_1800010118000101.html" },
    { cite: "Utah Code Ann. § 57-22-5", url: "https://le.utah.gov/xcode/Title57/Chapter22/C57-22-S5_1800010118000101.html" },
    { cite: "Utah Code Ann. § 57-22-5.1 (current, eff. 5/7/2025)", url: "https://le.utah.gov/xcode/Title57/Chapter22/C57-22-S5.1_2025050720250507.html" },
    { cite: "Utah Code Ann. § 57-22-5.1 (eff. 1/1/2027)", url: "https://le.utah.gov/xcode/Title57/Chapter22/C57-22-S5.1_2026050620270101.html" },
    { cite: "Utah Code Ann. § 57-22-6", url: "https://le.utah.gov/xcode/Title57/Chapter22/C57-22-S6_2023050320240701.html" },
    { cite: "Utah Code Ann. § 57-21-2", url: "https://le.utah.gov/xcode/Title57/Chapter21/C57-21-S2_2026050620260506.html" },
    { cite: "Utah Code Ann. § 57-21-3", url: "https://le.utah.gov/xcode/Title57/Chapter21/57-21-S3.html" },
    { cite: "Utah Code Ann. § 57-21-5", url: "https://le.utah.gov/xcode/Title57/Chapter21/C57-21-S5_2026050620260506.html" },
    { cite: "Utah Code Ann. § 78B-6-801", url: "https://le.utah.gov/xcode/Title78B/Chapter6/C78B-6-S801_2026050620260506.html" },
    { cite: "Utah Code Ann. § 78B-6-802", url: "https://le.utah.gov/xcode/Title78B/Chapter6/C78B-6-S802_2026050620260506.html" },
    { cite: "Utah Code Ann. § 78B-6-805", url: "https://le.utah.gov/xcode/Title78B/Chapter6/C78B-6-S805_2026050620260506.html" },
    { cite: "Utah Code Ann. § 78B-6-814", url: "https://le.utah.gov/xcode/Title78B/Chapter6/C78B-6-S814_1800010118000101.html" },
    { cite: "Utah Code Ann. § 78B-6-815", url: "https://le.utah.gov/xcode/Title78B/Chapter6/C78B-6-S815_2018050820180508.html" },
    { cite: "Utah Code Ann. § 78B-6-816", url: "https://le.utah.gov/xcode/Title78B/Chapter6/C78B-6-S816_2017050920170509.html" },
    { cite: "Utah Code Ann. § 39A-6-101", url: "https://le.utah.gov/xcode/Title39A/Chapter6/39A-6-S101.html" },
    { cite: "Utah Code Ann. § 39A-6-102", url: "https://le.utah.gov/xcode/Title39A/Chapter6/39A-6-S102.html" },
    { cite: "Utah Code Ann. § 39A-6-106", url: "https://le.utah.gov/xcode/Title39A/Chapter6/39A-6-S106.html" },
    { cite: "Utah Code Ann. § 39A-6-113", url: "https://le.utah.gov/xcode/Title39A/Chapter6/39A-6-S113.html" },
    { cite: "50 U.S.C. § 3955 (incorporated by Utah Code § 39A-6-102)", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "MILITARY (judgment call): Utah Code § 39A-6-102(1) gives Utah National Guard and State Defense Force members ordered to 'state military service' by the Governor (30+ days, § 39A-6-101(4)) 'the same rights and protections as provided by federal law for activation to federal military service.' I read that as extending SCRA § 3955 lease termination to governor-ordered state duty, which the federal SCRA does not cover. The lease text mirrors § 3955 (PCS, 90+ day deployment, entry into service; 30 days after next rent due date). Attorney to confirm the incorporation reading. Separately, § 39A-6-113 bars eviction of such members or their dependents for nonpayment during state service where rent is under $2,400/month without a court order.",
    "DV termination (§ 57-22-5.1) is unusually landlord-favorable: the tenant must pay a termination fee equal to ONE MONTH'S RENT, must be current on the lease (limited 30-day DV exception), must vacate within 15 days, and loses the right once an eviction notice is served. Only domestic violence victims (as defined in § 77-36-1) qualify for termination; stalking, sexual offense, burglary and dating violence victims get only the lock-change right in § 57-22-5.1(3). Co-tenants remain bound. A version effective 1/1/2027 (2026 ch. 445) only drops the crime-victim exclusions for certain sexual offenses in the lock-change definition; the termination provisions are unchanged.",
    "Month-to-month notice: § 78B-6-802(1)(b) sets only the landlord's 15-day notice; no Utah statute sets the tenant's notice. Lease text asks Tenant to give the same 15 days; attorney to confirm that is acceptable.",
    "Entry notice: § 57-22-4(2) requires 24 hours' notice 'except as otherwise provided in the rental agreement,' so the lease may set a different rule. Encoded as 24 hours. Owner failures under § 57-22-4(2)–(7) cannot be used by the renter to excuse performance or sue (§ 57-22-4(9)).",
    "Mitigation: § 78B-6-816(1) limits an abandoning tenant's liability to the lesser of the remaining rent or a re-letting-based measure, 'notwithstanding that the owner did not rerent.' It is not an express duty to mitigate but functions similarly. Utah case law (I believe Reid v. Mutual of Omaha Ins. Co., 776 P.2d 896 (Utah 1989)) recognizes a landlord's duty to mitigate; not verified from a primary source.",
    "Deposit: no cap and no interest. The renter's remedy ($100 penalty plus full deposit) requires the tenant to first serve the statutory 'Tenant's Notice to Provide Deposit Disposition' (§ 57-17-3(3)) and the landlord then has 5 business days.",
    "Late fee cap (§ 57-22-4(5)(a)) is the greater of 10% of rent or $75; no statutory grace period.",
    "No statutory cap on early termination fees (other than the fixed one-month DV termination fee), no statewide senior/care-facility or casualty termination statute.",
    "Fair housing (§ 57-21-5, 2026 amendments) adds source of income, sexual orientation and gender identity. CO-LIVING: § 57-21-3(3) exempts rental of a room in an owner-occupied single-family dwelling (4 or fewer families) from most of the chapter except the advertising ban, and § 57-21-5(6)(b) (2026) lets landlords designate shared rental properties as single-sex housing limited by biological sex at birth. Federal FHA still applies; attorney should review co-living templates.",
    "Pre-application disclosures (§ 57-22-4(3)) of rent, fixed and use-based fees, availability date and screening criteria are required before taking any application fee; not a lease term but a workflow requirement for Keycove's application flow.",
    "Local law: check Salt Lake City and other municipal rental licensing / good landlord programs. I did not research Utah's statewide rent-control preemption statute.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
