import type { StateLawProfile } from "../types";

const NCLEG = (ch: string, s: string) =>
  `https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_${ch}/GS_${s}.html`;

export const NC: StateLawProfile = {
  code: "NC",
  name: "North Carolina",
  framework: "N.C. Gen. Stat. Chapter 42 (Landlord and Tenant), including the Residential Rental Agreements Act (Art. 5) and the Tenant Security Deposit Act (Art. 6)",

  deposit: {
    maxMonths: 2,
    capRule:
      "The security deposit may not exceed two weeks' rent for a week-to-week tenancy, one and one-half months' rent for a month-to-month tenancy, or two months' rent for a term longer than month-to-month.",
    capCite: "N.C. Gen. Stat. § 42-51(b)",
    returnDays: 30,
    returnRule:
      "Within 30 days after the tenancy ends and Tenant delivers possession, Landlord shall mail or deliver to Tenant a written itemization of any damage together with the balance of the deposit. If Landlord's claim cannot be determined within 30 days, Landlord shall provide an interim accounting within 30 days and a final accounting within 60 days. Landlord may not withhold any amount for normal wear and tear or any amount exceeding Landlord's actual damages.",
    returnCite: "N.C. Gen. Stat. § 42-52",
    holdingRule:
      "Landlord shall keep the deposit in a trust account with a licensed and federally insured depository institution or trust institution authorized to do business in North Carolina, or furnish a bond from an insurance company licensed in North Carolina (a trust account outside North Carolina is allowed only with such a bond). Within 30 days after the lease term begins, Landlord shall notify Tenant of the name and address of the bank or institution holding the deposit, or the name of the insurance company providing the bond.",
    holdingCite: "N.C. Gen. Stat. § 42-50",
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: 5,
    capType: "greater_of",
    capPercent: 5,
    capFlat: 15,
    capRule:
      "A late fee may be charged only if the rent is five calendar days or more late (the first day being the day after rent was due), only once per late payment, and may not exceed the greater of $15.00 or 5% of the monthly rent. A late fee may not be deducted from a later rent payment so as to put that payment in default.",
    cite: "N.C. Gen. Stat. § 42-46(a)–(b)",
  },

  notice: {
    monthToMonthDays: 7,
    monthToMonthRule:
      "Either party may end a month-to-month tenancy by written notice given at least seven days before the end of the current rental period (two days for a week-to-week tenancy; one month before the end of the year for a year-to-year tenancy).",
    monthToMonthCite: "N.C. Gen. Stat. § 42-14",
    nonpaymentDays: 10,
    nonpaymentRule:
      "If Tenant fails to pay rent within 10 days after Landlord demands all past-due rent, the term is forfeited and Landlord may bring a summary ejectment action.",
    nonpaymentCite: "N.C. Gen. Stat. § 42-3",
    entryHours: null,
    entryRule:
      "North Carolina has no statute setting an entry-notice period. Landlord will give Tenant at least 24 hours' notice before entering for inspections, repairs, or showings, except in an emergency or when Tenant consents at the time of entry.",
    entryCite: null,
  },

  earlyTermination: {
    military: {
      label: "Military technicians (North Carolina law)",
      cite: "N.C. Gen. Stat. § 42-45",
      eligible:
        "A military technician under 10 U.S.C. § 10216 who is required by permanent change of station orders to move 50 miles or more from the Property, is prematurely or involuntarily discharged or released from active duty, or is deployed with a military unit for 90 days or more may terminate this Lease. If such a technician dies on active duty, an immediate family member or the lawful representative of the estate may terminate it.",
      notice:
        "For a change of station or discharge, Tenant gives written notice of a termination date at least 30 days after Landlord receives it. For a deployment or death, termination is effective 30 days after the next rent due date or 45 days after Landlord receives the notice, whichever is shorter.",
      documentation:
        "The notice must include a copy of the official military orders or a written verification signed by the commanding officer (for a death, the death certificate, official casualty report, or commanding officer's letter).",
      liability:
        "Tenant owes rent prorated to the termination date. If Tenant has completed less than nine months of the tenancy and Landlord has suffered actual damages from the loss of the tenancy, Tenant owes liquidated damages of no more than one month's rent (less than six months completed) or one-half month's rent (six to nine months completed); after nine months nothing more is owed. No damages or penalties of any kind are owed if Tenant terminates 14 or more days before occupancy. The security deposit may not be applied to damages for the unfulfilled rental period (§ 42-51(a)(3)).",
    },
    domesticViolence: {
      label: "Domestic violence, sexual assault, or stalking",
      cite: "N.C. Gen. Stat. § 42-45.1",
      eligible:
        "A protected tenant (a victim of domestic violence, sexual assault, or stalking, as defined by statute) may terminate this Lease.",
      notice:
        "Tenant gives Landlord written notice of a termination date at least 30 days after Landlord receives the notice.",
      documentation:
        "The notice must include a copy of a valid protective order under Chapter 50B or 50C (not an ex parte order), a criminal order restraining a person from contact with the tenant, or a valid Address Confidentiality Program card issued to the victim or a minor member of the household. A victim of domestic violence or sexual assault must also include a safety plan, dated during this tenancy, from a qualifying domestic violence or sexual assault program, that recommends relocation.",
      liability:
        "Tenant owes only rent prorated to the termination date, payable when it would otherwise be due, and is not liable for any other rent or fees due only to the early termination, including the early termination fee. No damages or penalties are owed if Tenant terminates 14 or more days before occupancy. The tenancy continues for any remaining tenants, and a perpetrator excluded by court order remains liable under this Lease. The security deposit may not be applied to damages for the unfulfilled rental period (§ 42-51(a)(3)).",
    },
    other: [
      {
        label: "National Guard on State active duty (North Carolina Servicemembers Civil Relief Act)",
        cite: "N.C. Gen. Stat. §§ 127B-27 to 127B-29, 127B-33",
        eligible:
          "A member of the North Carolina National Guard serving on State active duty under an order of the Governor for more than 30 consecutive days, or a member of another state's National Guard who resides in North Carolina and serves under a similar order of that state's governor, has the same lease termination rights as a servicemember under the federal Servicemembers Civil Relief Act (described above), to the extent the service materially affects the member's ability to meet Lease obligations. A dependent of such a member has the same rights.",
        notice:
          "Tenant gives written or electronic notice of termination as described for the federal Servicemembers Civil Relief Act above.",
        documentation:
          "Tenant provides a written or electronic copy of the military order (including an order of the Governor) no later than 30 days after the State active duty ends.",
        liability:
          "Tenant owes rent prorated to the termination date and no early termination charge. These rights cannot be reduced or eliminated by this Lease.",
      },
      {
        label: "Foreclosure of a small rental property",
        cite: "N.C. Gen. Stat. § 42-45.2",
        eligible:
          "If the Property has fewer than 15 rental units and is being sold in a foreclosure proceeding under Article 2A of Chapter 45, Tenant may terminate this Lease after receiving the notice of sale, provided the default has not been cured when Tenant gives notice.",
        notice:
          "Tenant gives written notice of a termination date at least 10 days, but no more than 90 days, after the sale date in the notice of sale.",
        documentation: "",
        liability:
          "Tenant owes rent prorated to the termination date and no other rent or damages due only to the early termination.",
      },
      {
        label: "Unlawful removal by Landlord",
        cite: "N.C. Gen. Stat. § 42-25.9(a)",
        eligible:
          "If Landlord removes or attempts to remove Tenant from the Property other than through the court process required by Article 2A of Chapter 42, Tenant may recover possession or terminate this Lease.",
        notice: "No advance notice period is required.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee, and Landlord is liable to Tenant for actual damages caused by the removal or attempted removal.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "case_law",
      cite: "Isbey v. Crews, 55 N.C. App. 47 (1981)",
      rule:
        "If Tenant vacates early, Landlord shall use reasonable efforts to re-rent the Property, and rent received from a replacement tenant is credited against what Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "smoke_co_alarms",
      title: "Smoke and Carbon Monoxide Alarms",
      text:
        "Landlord has provided operable smoke alarms and, where required, carbon monoxide alarms, and will repair or replace them within 15 days after Tenant gives written notice that repair or replacement is needed. Landlord places new batteries in battery-operated alarms at the start of the tenancy, and Tenant replaces batteries as needed during the tenancy (except tamper-resistant 10-year lithium alarms).",
      cite: "N.C. Gen. Stat. § 42-42(a)(5)–(8)",
    },
    {
      id: "fees_limited",
      title: "Eviction-Related Fees",
      text:
        "The only administrative fees Landlord may charge in connection with a complaint for summary ejectment or money owed are those allowed by N.C. Gen. Stat. § 42-46(e) through (g) (a complaint-filing fee up to the greater of $15.00 or 5% of monthly rent if Tenant cures before judgment; a court-appearance fee of 10% of monthly rent if Landlord prevails in small claims court; or a second-trial fee up to 12% of monthly rent if Landlord prevails on appeal), and only one of them per complaint. Landlord may also recover court filing fees, service costs, and reasonable attorneys' fees actually paid or owed, not to exceed 15% of the amount owed (or 15% of monthly rent for a non-rent default), as allowed by § 42-46(i).",
      cite: "N.C. Gen. Stat. § 42-46(e)–(k)",
    },
  ],

  fairHousing: {
    stateClasses: [],
    cite: "N.C. Gen. Stat. § 41A-4 (State Fair Housing Act: race, color, religion, sex, national origin, handicapping condition, familial status)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through the court process of summary ejectment under Article 3 of Chapter 42 (or Article 7, where it applies). Landlord will not lock Tenant out, shut off utilities, or remove Tenant's belongings without a court order.",
    cite: "N.C. Gen. Stat. §§ 42-25.6, 42-26",
  },

  habitability: {
    rule:
      "Landlord shall comply with applicable building and housing codes, make all repairs needed to keep the Property fit and habitable, keep common areas safe, and maintain in good and safe working order and promptly repair all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies, after written notice from Tenant (except in emergencies).",
    cite: "N.C. Gen. Stat. § 42-42",
  },

  sources: [
    { cite: "N.C. Gen. Stat. § 42-3", url: NCLEG("42", "42-3") },
    { cite: "N.C. Gen. Stat. § 42-14", url: NCLEG("42", "42-14") },
    { cite: "N.C. Gen. Stat. § 42-25.6", url: NCLEG("42", "42-25.6") },
    { cite: "N.C. Gen. Stat. § 42-25.9", url: NCLEG("42", "42-25.9") },
    { cite: "N.C. Gen. Stat. § 42-26", url: NCLEG("42", "42-26") },
    { cite: "N.C. Gen. Stat. § 42-42", url: NCLEG("42", "42-42") },
    { cite: "N.C. Gen. Stat. § 42-45", url: NCLEG("42", "42-45") },
    { cite: "N.C. Gen. Stat. § 42-45.1", url: NCLEG("42", "42-45.1") },
    { cite: "N.C. Gen. Stat. § 42-45.2", url: NCLEG("42", "42-45.2") },
    { cite: "N.C. Gen. Stat. § 42-46", url: NCLEG("42", "42-46") },
    { cite: "N.C. Gen. Stat. § 42-50", url: NCLEG("42", "42-50") },
    { cite: "N.C. Gen. Stat. § 42-51", url: NCLEG("42", "42-51") },
    { cite: "N.C. Gen. Stat. § 42-52", url: NCLEG("42", "42-52") },
    { cite: "N.C. Gen. Stat. § 42-53", url: NCLEG("42", "42-53") },
    { cite: "N.C. Gen. Stat. § 41A-4", url: NCLEG("41A", "41A-4") },
    { cite: "N.C. Gen. Stat. §§ 127B-25 to 127B-37 (N.C. Servicemembers Civil Relief Act)", url: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_127B/Article_4.html" },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "§ 42-45 (state military termination) covers ONLY dual-status military technicians under 10 U.S.C. § 10216 since the 2019 amendment (S.L. 2019-161). Active-duty servicemembers (e.g. Fort Bragg) are covered by the federal SCRA, 50 U.S.C. § 3955, and North Carolina National Guard members on State active duty for more than 30 consecutive days (and other states' Guard members residing in NC) get SCRA protections through N.C. Gen. Stat. §§ 127B-27, 127B-28; dependents through § 127B-29. The lease states all three.",
    "The live NC template before 2026-11-08 stated the deposit cap as 1.5 months for terms longer than month-to-month and cited § 42-50 for it. Current § 42-51(b) allows 2 months for terms longer than month-to-month and 1.5 months for month-to-month; the holding rule is § 42-50. Corrected.",
    "§ 42-51(a)(3) allows the deposit to cover 'damages as the result of the nonfulfillment of the rental period' and § 42-51(a)(5) re-renting costs, which supports applying the deposit to an unpaid early termination fee — except where the tenant terminated under § 42-45 or § 42-45.1.",
    "Duty to mitigate is case law (Isbey v. Crews, 55 N.C. App. 47 (1981)), not statute. Citation not verified against the reporter — attorney to confirm.",
    "North Carolina has no statute on landlord entry notice; the 24-hour courtesy notice is contractual.",
    "§ 42-46 was amended in 2025 (S.L. 2025-45, 2025-52, 2025-54); text read from ncleg.gov on 2026-11-08.",
    "Liquidated-damages early termination fee: NC courts enforce liquidated damages that are a reasonable estimate of damages difficult to ascertain and not a penalty; the 2-month default should be reviewed against that standard.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
