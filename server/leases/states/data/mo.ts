import type { StateLawProfile } from "../types";

const MOREV = (s: string) =>
  `https://revisor.mo.gov/main/OneSection.aspx?section=${s}`;

export const MO: StateLawProfile = {
  code: "MO",
  name: "Missouri",
  framework:
    "Missouri landlord-tenant law, Mo. Rev. Stat. ch. 441 (Landlord and Tenant) and ch. 535 (Landlord-Tenant Actions)",

  deposit: {
    maxMonths: 2,
    capRule: "The security deposit may not exceed two months' rent.",
    capCite: "Mo. Rev. Stat. § 535.300.1",
    returnDays: 30,
    returnRule:
      "Within 30 days after the tenancy ends, Landlord shall either return the full deposit or furnish Tenant a written itemized list of the damages for which the deposit or any part is withheld, together with the balance. Landlord complies by mailing the statement and any payment to Tenant's last known address. Landlord may withhold only amounts reasonably necessary to remedy unpaid rent, to restore the unit to its condition at the start of the tenancy (ordinary wear and tear excepted), or to compensate Landlord for actual damages from Tenant's failure to give adequate notice to terminate, provided Landlord makes reasonable efforts to mitigate. If Landlord wrongfully withholds the deposit, Tenant may recover up to twice the amount wrongfully withheld, together with court costs.",
    returnCite: "Mo. Rev. Stat. § 535.300.3–.5",
    holdingRule:
      "Landlord shall hold the deposit for Tenant in a bank, credit union, or depository institution insured by an agency of the federal government. Any interest earned on the deposit is Landlord's property.",
    holdingCite: "Mo. Rev. Stat. § 535.300.2",
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
      "Either party may terminate a month-to-month tenancy by written notice stating that the tenancy will end on a periodic rent-paying date not less than one month after the other party receives the notice.",
    monthToMonthCite: "Mo. Rev. Stat. § 441.060",
    nonpaymentDays: null,
    nonpaymentRule:
      "Missouri sets no fixed pay-or-quit period for nonpayment. If rent is due and unpaid after Landlord demands payment, Landlord may bring a rent and possession action under chapter 535 (the one-month notice under § 441.060 is not required before filing) or an unlawful detainer action under chapter 534.",
    nonpaymentCite: "Mo. Rev. Stat. §§ 535.010, 535.020",
    entryHours: null,
    entryRule:
      "Missouri has no statute setting an entry-notice period. Landlord will give Tenant at least 24 hours' notice before entering for inspections, repairs, or showings, except in an emergency or when Tenant consents at the time of entry.",
    entryCite: null,
  },

  earlyTermination: {
    military: {
      label: "Military service (Missouri law)",
      cite: "Mo. Rev. Stat. § 41.944",
      eligible:
        "A member of the U.S. Armed Forces on active duty, or a member of the Missouri Army or Air National Guard serving on full-time duty or as a civil service technician with a Missouri National Guard unit, who is a tenant of this residential dwelling may terminate this Lease if the member: (1) receives permanent change of station orders; (2) receives temporary duty orders in excess of 90 days assigning the member to a location at least 25 miles from the Property; (3) is discharged or released from active duty or from full-time or technician status; or (4) is ordered to reside in government-supplied quarters.",
      notice:
        "Tenant serves Landlord written notice of termination effective on a date stated in the notice that is not less than 15 days after the notice is served.",
      documentation:
        "Before the termination date, Tenant furnishes Landlord a copy of the official orders or a signed letter from Tenant's commanding officer confirming the orders.",
      liability:
        "The final lease payment is due by the effective termination date and is payable when it would otherwise have been due under this Lease. Landlord will not charge any early termination fee, and Tenant is entitled to the full return of any security deposit and pet deposit if Tenant has otherwise complied with this Lease and § 535.300.",
    },
    domesticViolence: {
      label: "Victims of domestic violence, sexual assault, or stalking",
      cite: "Mo. Rev. Stat. § 441.920",
      eligible:
        "A Tenant who is, has been, or is in imminent danger of becoming a victim of domestic violence, sexual assault, or stalking (as defined in § 455.010) may not be denied tenancy, evicted, or found in violation of this Lease on that basis, and has an affirmative defense to liability for rent for the period after Tenant vacates the Property if a court finds Tenant was such a victim and Tenant notified Landlord and provided the required documentation. This protection does not apply if Tenant allowed the named perpetrator into the premises, or if Landlord reasonably believes the perpetrator poses a threat to the safety of other occupants or the property. This right applies only to residential property.",
      notice:
        "Tenant provides Landlord a written statement that Tenant is, was, or is in imminent danger of becoming a victim of domestic violence, sexual assault, or stalking, and vacates the Property.",
      documentation:
        "If Landlord requests, Tenant provides documentation: either a document signed under penalty of perjury by an employee of a victim service provider or a health or mental health professional from whom Tenant sought assistance (and signed by Tenant), or a record of a law enforcement agency, court, or administrative agency about the incident. Submitting false information is a basis for denial of tenancy, eviction, or a lease violation.",
      liability:
        "Tenant is liable for rent through the date Tenant vacates and owes no rent for the period after vacating. Missouri law permits Landlord to impose a reasonable termination fee, stated in this Lease, on a Tenant who terminates under this right (§ 441.920.6). These protections cannot be waived.",
    },
    other: [],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "Mo. Rev. Stat. § 535.300.4(3)",
      rule:
        "If Tenant leaves early, Landlord shall make reasonable efforts to mitigate damages by re-renting the Property, and rent received from a replacement tenant is credited against what Tenant owes.",
    },
  },

  disclosures: [],

  fairHousing: {
    stateClasses: ["ancestry"],
    cite: "Mo. Rev. Stat. § 213.040 (Missouri Human Rights Act)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a court action — a rent and possession action under chapter 535 or an unlawful detainer action under chapter 534. Landlord will not remove or exclude Tenant, remove doors or locks, or interrupt essential services (electric, gas, water, or sewer) without judicial process and a court order; doing so is forcible entry and detainer under § 441.233.",
    cite: "Mo. Rev. Stat. ch. 534; ch. 535; § 441.233",
  },

  habitability: {
    rule:
      "Landlord shall maintain the Property in compliance with applicable local building and housing codes and in a condition fit for residential use; Missouri courts imply a warranty of habitability in residential leases. If Landlord fails to maintain the Property, Tenant has statutory remedies, including repair-and-deduct for certain local code violations (§ 441.234) and rent abatement or escrow where a housing-code authority finds the Property unfit (§§ 441.500 to 441.643).",
    cite: "Mo. Rev. Stat. § 441.234; §§ 441.500–441.643; Detling v. Edelbrock, 671 S.W.2d 265 (Mo. banc 1984)",
  },

  sources: [
    { cite: "Mo. Rev. Stat. § 41.944", url: MOREV("41.944") },
    { cite: "Mo. Rev. Stat. § 213.040", url: MOREV("213.040") },
    { cite: "Mo. Rev. Stat. § 441.060", url: MOREV("441.060") },
    { cite: "Mo. Rev. Stat. § 441.233", url: MOREV("441.233") },
    { cite: "Mo. Rev. Stat. § 441.234", url: MOREV("441.234") },
    { cite: "Mo. Rev. Stat. § 441.500", url: MOREV("441.500") },
    { cite: "Mo. Rev. Stat. § 441.920", url: MOREV("441.920") },
    { cite: "Mo. Rev. Stat. § 535.010", url: MOREV("535.010") },
    { cite: "Mo. Rev. Stat. § 535.020", url: MOREV("535.020") },
    { cite: "Mo. Rev. Stat. § 535.300", url: MOREV("535.300") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "DOMESTIC-VIOLENCE FEE EXCEPTION: § 441.920.6 expressly lets a landlord impose a reasonable early-termination fee on a victim who terminates under that section — unlike most states' DV statutes, which bar any charge. The right is therefore in domesticViolence (so the perpetrator and co-tenant rules and no-waiver rule apply), and the permitted fee is stated in its liability text. This conflicts with the builder's general statement in the early-termination section that protected terminations carry no fee; attorney to confirm the lease language reconciles the two (the {{early_termination_fee}} in paragraph (a) is waived, but the § 441.920.6 reasonable fee may apply). § 441.920 operates largely as an affirmative defense and anti-discrimination rule rather than a clean notice-and-terminate procedure; it has no fixed notice period. SB 1741 would repeal and replace § 441.920 — not confirmed enacted.",
    "Military termination is § 41.944 (Title V, Military Affairs), not in ch. 441. It covers active-duty U.S. Armed Forces and full-time/technician Missouri National Guard on PCS, 90-day+ TDY at 25+ miles, discharge/release, or orders to government quarters. Federal SCRA (50 U.S.C. § 3955) also applies and is handled by the generator.",
    "Missouri has no general statutory warranty of habitability; the warranty is from case law (Detling v. Edelbrock, 671 S.W.2d 265 (Mo. banc 1984)). Statutory tenant remedies are repair-and-deduct (§ 441.234, which has strict eligibility — six months' residency, rent current, cost under $300 and other limits) and the rent-escrow/code-enforcement scheme (§§ 441.500–441.643). The Detling citation was not verified against the reporter.",
    "Nonpayment: Missouri has no fixed pay-or-quit period. Chapter 535 (rent and possession) requires a demand for rent, then filing; § 535.020 states the § 441.060 one-month notice is not required before filing. Chapter 534 (unlawful detainer) is the alternative. nonpaymentDays is null.",
    "Duty to mitigate: § 535.300.4(3) imposes a mitigation duty in the context of withholding a deposit for a tenant's failure to give adequate termination notice — the lease-break scenario. A broader residential duty to mitigate is not clearly settled by statute; attorney to confirm.",
    "Missouri has no statute on landlord entry notice; the 24-hour courtesy notice in the lease is contractual.",
    "Fair housing: Missouri Human Rights Act (§ 213.040) covers race, color, religion, national origin, ancestry, sex, disability, and familial status. Only 'ancestry' is beyond the federal seven.",
    "Local ordinances: St. Louis and Kansas City have additional protections (e.g., source-of-income and broader protected classes in some ordinances); confirm any applicable municipal code.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
