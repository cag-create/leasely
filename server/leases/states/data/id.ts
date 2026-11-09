import type { StateLawProfile } from "../types";

export const ID: StateLawProfile = {
  code: "ID",
  name: "Idaho",
  framework:
    "Idaho landlord-tenant statutes, Idaho Code §§ 6-301 et seq. (forcible entry, unlawful detainer, tenant remedies and security deposits) and §§ 55-208, 55-304 to 55-306 (tenancies, notices and fees)",

  deposit: {
    maxMonths: null,
    capRule:
      "Idaho law sets no maximum security deposit. Any amount Tenant deposits with Landlord for a purpose other than paying rent is a security deposit.",
    capCite: "Idaho Code § 6-321(1)",
    returnDays: 21,
    returnRule:
      "After this Lease ends and Tenant surrenders the premises, Landlord will refund the security deposit within 21 days (or within any longer period, not exceeding 30 days, that this Lease fixes), less only amounts needed to cover the contingencies specified in this Lease. Landlord will not keep any part of the deposit for normal wear and tear. Any partial refund will be accompanied by a signed statement itemizing the amounts kept, the purpose for each, and a detailed list of expenditures made from the deposit.",
    returnCite: "Idaho Code § 6-321(1)–(2)",
    holdingRule:
      "If the premises are managed by a third-party manager for Landlord, the security deposit will be kept in a separate account at a federally insured financial institution, apart from the manager's operating account. This requirement does not apply to an owner, a manager sharing members or principals with the owner, a real estate licensee, or a nonprofit organized under chapter 30, title 30, Idaho Code. If the property is sold during the tenancy, the new owner is liable for refunding the deposit.",
    holdingCite: "Idaho Code § 6-321(3)–(4)",
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: null,
    capType: "reasonable",
    capRule: "must be reasonable and may not exceed the amount stated in this Lease",
    cite: "Idaho Code § 55-305",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Landlord may end a month-to-month tenancy by written notice requiring Tenant to vacate within a period of not less than one month, and Tenant may end it by written notice of a vacate date not less than one month after the notice. Landlord will also give Tenant at least 30 days' written notice before a rent increase takes effect or before Landlord declines to renew this Lease.",
    monthToMonthCite: "Idaho Code §§ 55-208, 55-304(2)",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If Tenant defaults in paying rent, Landlord may serve a written notice stating the amount due and requiring payment or surrender of possession within three days. The notice must also tell Tenant that, if the court enters judgment against Tenant, a residential tenant will have 72 hours to remove belongings before Landlord may remove and dispose of them, and, for attorney fees to be awarded, that attorney fees will be awarded to the prevailing party.",
    nonpaymentCite: "Idaho Code §§ 6-303(2), 6-324",
    entryHours: null,
    entryRule:
      "Idaho law does not set a notice period for Landlord's entry. Except in an emergency, Landlord will give Tenant reasonable advance notice and will enter only at reasonable times to inspect, make repairs or show the dwelling unit.",
    entryCite: null,
  },

  earlyTermination: {
    military: {
      label: "Idaho National Guard on governor-ordered state active duty",
      cite: "Idaho Code § 46-409; 50 U.S.C. § 3955",
      eligible:
        "When a Tenant who is a member of the Idaho air or army national guard is called or ordered by the Governor to state active duty, or to duty other than for training under Title 32 of the U.S. Code, in time of war, armed conflict, or an emergency proclaimed by a governor or the President, the federal Servicemembers Civil Relief Act applies, and Tenant may terminate this Lease on entering that duty or on receiving orders for a permanent change of station or a deployment of at least 90 days.",
      notice:
        "Tenant delivers written notice of termination to Landlord. For monthly rent, termination is effective 30 days after the first date on which the next rental payment is due after the notice is delivered.",
      documentation: "The notice must include a copy of Tenant's military orders or a written verification from Tenant's commanding officer.",
      liability:
        "Tenant owes rent prorated to the effective termination date and any other obligations due under this Lease at that time, including reasonable charges for excess wear, but no early termination charge. Landlord will refund rent paid in advance for any period after the termination date within 30 days.",
    },
    domesticViolence: null,
    other: [],
    feeCap: null,
    mitigation: {
      basis: "case_law",
      cite: null,
      rule:
        "If Tenant leaves before this Lease ends, Landlord will make reasonable efforts to re-rent the dwelling unit and will credit against any amount Tenant owes the rent Landlord receives from a replacement tenant for the remainder of the term.",
    },
  },

  disclosures: [
    {
      id: "smoke_detectors",
      title: "Smoke detectors",
      text:
        "At the start of this Lease, Landlord has verified that approved smoke detectors are installed and in good working order in the dwelling unit. Tenant will keep the smoke detectors in good working order during the tenancy.",
      cite: "Idaho Code § 6-320(a)(6)",
    },
    {
      id: "fees_in_lease",
      title: "Fees and charges",
      text:
        "All fees charged to Tenant, including late fees, must be reasonable. Landlord will not charge Tenant any fee, fine, assessment, interest or other cost that is greater than, or not included in, this Lease unless Landlord first gives Tenant 30 days' written notice of the change.",
      cite: "Idaho Code § 55-305",
    },
  ],

  fairHousing: {
    stateClasses: [],
    cite: "Idaho Code § 67-5909(8)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a court unlawful detainer action under Idaho Code §§ 6-303 and 6-310 et seq. Landlord will not use force, threats or menacing conduct to remove Tenant or break into the dwelling unit; doing so is a forcible entry for which treble damages may be awarded.",
    cite: "Idaho Code §§ 6-301, 6-303, 6-310, 6-316, 6-317",
  },

  habitability: {
    rule:
      "Landlord will provide reasonable waterproofing and weather protection, maintain in good working order the electrical, plumbing, heating, ventilating, cooling and sanitary facilities Landlord supplies, not maintain the premises in a manner hazardous to Tenant's health or safety, comply with the terms of this Lease that materially affect Tenant's health and safety, and install approved smoke detectors. Before suing, Tenant must give Landlord three days' written notice listing each failure and demanding a cure.",
    cite: "Idaho Code §§ 6-320, 6-323",
  },

  sources: [
    { cite: "Idaho Code § 6-301", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-301/" },
    { cite: "Idaho Code § 6-302", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-302/" },
    { cite: "Idaho Code § 6-303", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-303/" },
    { cite: "Idaho Code § 6-304", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-304/" },
    { cite: "Idaho Code § 6-310", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-310/" },
    { cite: "Idaho Code § 6-316", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-316/" },
    { cite: "Idaho Code § 6-317", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-317/" },
    { cite: "Idaho Code § 6-320", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-320/" },
    { cite: "Idaho Code § 6-321", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-321/" },
    { cite: "Idaho Code § 6-323", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-323/" },
    { cite: "Idaho Code § 6-324", url: "https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-324/" },
    { cite: "Idaho Code § 55-208", url: "https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH2/SECT55-208/" },
    { cite: "Idaho Code § 55-209", url: "https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH2/SECT55-209/" },
    { cite: "Idaho Code § 55-304", url: "https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH3/SECT55-304/" },
    { cite: "Idaho Code § 55-305", url: "https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH3/SECT55-305/" },
    { cite: "Idaho Code § 55-306", url: "https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH3/SECT55-306/" },
    { cite: "Idaho Code § 46-409", url: "https://legislature.idaho.gov/statutesrules/idstat/Title46/T46CH4/SECT46-409/" },
    { cite: "Idaho Code § 67-5909", url: "https://legislature.idaho.gov/statutesrules/idstat/Title67/T67CH59/SECT67-5909/" },
    { cite: "50 U.S.C. § 3955 (incorporated by Idaho Code § 46-409(2))", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "MILITARY (judgment call): Idaho Code § 46-409(2) (Militia Civil Relief Act) applies the federal SCRA to Idaho Guard members called by the Governor to state active duty or Title 32 non-training duty, but only 'in time of war, armed conflict, or emergency proclaimed by a governor or by the president.' Lease text mirrors SCRA § 3955. Attorney to confirm the incorporation covers § 3955 lease termination and how the emergency-proclamation condition should be stated. The statute still cites the old '50 U.S.C. App.' numbering.",
    "No Idaho domestic violence / sexual assault / stalking lease-termination statute found in Title 6 ch. 3 or Title 55 chs. 2–3 (consumer sites citing §§ 6-320, 55-2508 or 32-2010 for a DV right are wrong as far as I could verify). domesticViolence is null. Federal VAWA applies only to covered federally assisted housing.",
    "No statutory entry-notice rule, no move-in condition report requirement, no senior/care-facility, casualty or death termination rights, and no early-termination fee cap in Idaho statutes.",
    "Mitigation: no statute. Idaho case law is understood to require landlords to mitigate (I believe Consolidated AG of Curry, Inc. v. Rangen, Inc., 128 Idaho 228, 912 P.2d 115 (1996)), but I did not verify the holding from a primary source. Flagged as case_law.",
    "Month-to-month: § 55-208 governs termination of a 'tenancy at will' with not less than one month's written notice by either party; Idaho applies it to month-to-month tenancies, but the statute does not use that term. § 55-304(2) separately requires 30 days' written notice before ANY residential rent increase or nonrenewal, which affects fixed-term leases too (landlord must give 30 days' notice of nonrenewal before the end date). § 55-304(1) allows changing month-to-month terms with 15 days' notice before month end, but subsection (2)'s 30 days controls rent increases.",
    "Deposit return: 21 days if the lease fixes no time; the lease may fix a longer period up to 30 days. returnDays set to 21; if Keycove wants 30 the lease must expressly fix it.",
    "Late fees: § 55-305 (2023, renumbered 2025) requires all fees to be 'reasonable' and stated in the agreement; written-lease fee changes need 30 days' notice. No numeric cap or grace period.",
    "Attorney fees in a nonpayment case are recoverable only if the 3-day notice advises the tenant that attorney fees will be awarded to the prevailing party (§ 6-324); the 3-day notice must also state the 72-hour removal-of-belongings warning (§ 6-303(2)).",
    "Self-help: Idaho has no explicit residential lockout statute; the eviction text relies on the forcible entry definition (§ 6-301(2): turning out the party in possession by force, threats or menacing conduct) and treble damages (§ 6-317). Attorney to confirm.",
    "Fair housing: the Idaho Human Rights Act housing provision (§ 67-5909(8)) covers race, color, religion, sex, national origin and disability, and does NOT list familial status (federal FHA still covers it). No state classes beyond the federal seven. Boise, Pocatello, Coeur d'Alene, Sandpoint and other cities have local ordinances adding sexual orientation and gender identity; verify by city. § 55-306 (2025) bars local governments from requiring landlords to accept vouchers or from regulating rent, fees or deposits.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
