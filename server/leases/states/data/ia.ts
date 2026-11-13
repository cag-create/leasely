import type { StateLawProfile } from "../types";

const IACODE = (s: string) => `https://www.legis.iowa.gov/docs/code/${s}.pdf`;

export const IA: StateLawProfile = {
  code: "IA",
  name: "Iowa",
  framework:
    "Iowa Uniform Residential Landlord and Tenant Law, Iowa Code ch. 562A",

  deposit: {
    maxMonths: 2,
    capRule:
      "The security deposit may not exceed two months' rent.",
    capCite: "Iowa Code § 562A.12(1)",
    returnDays: 30,
    returnRule:
      "Within 30 days after the tenancy ends and Landlord receives Tenant's mailing address or delivery instructions, Landlord shall return the deposit or furnish Tenant a written statement giving the specific reason for withholding all or part of it (for damage, the nature of the damage). Landlord may withhold only amounts reasonably necessary to remedy unpaid rent or other sums due, to restore the unit to its condition at the start of the tenancy (ordinary wear and tear excepted), or to recover expenses of regaining possession from a tenant who does not act in good faith. A landlord who fails to provide the written statement within that 30 days forfeits the right to withhold any part of the deposit. If Tenant provides no mailing address within one year after the tenancy ends, the deposit becomes Landlord's property.",
    returnCite: "Iowa Code § 562A.12(3)–(4)",
    holdingRule:
      "Landlord shall hold the deposit for Tenant in a bank, savings and loan association, or credit union insured by an agency of the federal government, and shall not commingle it with Landlord's personal funds. The deposit may be held in a trust account, which may be interest-bearing; any interest earned during the first five years of the tenancy is Landlord's property.",
    holdingCite: "Iowa Code § 562A.12(2)",
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: null,
    capType: "tiered",
    capRule:
      "If the monthly rent is $700 or less, a late fee may not exceed $12.00 per day or $60.00 per month in total. If the monthly rent is greater than $700, a late fee may not exceed $20.00 per day or $100.00 per month in total.",
    cite: "Iowa Code § 562A.9(4)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either party may terminate a month-to-month tenancy by written notice given to the other at least 30 days before the periodic rental date specified in the notice (at least 10 days for a week-to-week tenancy).",
    monthToMonthCite: "Iowa Code § 562A.34",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If rent is unpaid when due, Landlord may deliver a written notice stating that the rental agreement will terminate if the rent is not paid within three days; if Tenant does not pay within those three days, Landlord may terminate the rental agreement and bring a forcible entry and detainer action.",
    nonpaymentCite: "Iowa Code § 562A.27(2)",
    entryHours: 24,
    entryRule:
      "Landlord may enter the dwelling unit to inspect, make necessary or agreed repairs or improvements, supply necessary or agreed services, or show the unit to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or when it is impracticable to do so, Landlord shall give Tenant at least 24 hours' notice and enter only at reasonable times. Tenant shall not unreasonably withhold consent, and Landlord shall not abuse the right of access or use it to harass Tenant.",
    entryCite: "Iowa Code § 562A.19",
  },

  earlyTermination: {
    military: {
      label: "Military service (Iowa law)",
      cite: "Iowa Code § 29A.101A",
      eligible:
        "A service member who signed this Lease and thereafter enters military service, or who while in military service receives orders for a permanent change of station or to deploy with a military unit (or as an individual in support of a military operation) for 90 days or more, may terminate this Lease for premises occupied or intended to be occupied by the service member or the service member's dependents. Terminating this Lease also ends any obligation a dependent has under it.",
      notice:
        "Tenant delivers to Landlord written notice of termination together with a copy of the service member's military orders, by hand delivery, private business carrier, or U.S. mail with return receipt requested. Because rent is payable monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered.",
      documentation:
        "The written notice must include a copy of the service member's military orders.",
      liability:
        "Rent for the period before the effective termination date is prorated and paid, and Landlord will not charge any early termination fee. Landlord will refund any rent paid in advance for the period after the effective termination date within 30 days after that date. Knowingly seizing or detaining the service member's or a dependent's property to subject it to a claim for rent accruing after termination is a simple misdemeanor.",
    },
    domesticViolence: null,
    other: [
      {
        label: "Fire or casualty damage",
        cite: "Iowa Code § 562A.25",
        eligible:
          "If the dwelling unit or premises are damaged or destroyed by fire or casualty, without Tenant's fault, to an extent that enjoyment of the dwelling unit is substantially impaired, Tenant may terminate this Lease.",
        notice:
          "Tenant may immediately vacate the premises and give Landlord written notice within 14 days of the intention to terminate, in which case this Lease terminates as of the date of vacating.",
        documentation: "",
        liability:
          "Landlord shall return all prepaid rent and the security deposit recoverable under § 562A.12, with rent accounted for as of the date of the casualty. No early termination fee applies.",
      },
      {
        label: "Unlawful ouster or shutoff of services by Landlord",
        cite: "Iowa Code § 562A.26",
        eligible:
          "If Landlord unlawfully removes or excludes Tenant from the premises, or willfully diminishes services by interrupting or causing the interruption of electric, gas, water, heat, or another essential service, Tenant may terminate this Lease.",
        notice: "No advance notice period is required for this right.",
        documentation: "",
        liability:
          "Tenant may recover possession or terminate this Lease and, in either case, recover actual damages and reasonable attorney's fees as the law allows, and owes no early termination fee.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "case_law",
      cite: null,
      rule:
        "If Tenant vacates early, Landlord shall make reasonable efforts to re-rent the Property at a fair rental, and rent received from a replacement tenant is credited against what Tenant owes.",
    },
  },

  disclosures: [],

  fairHousing: {
    stateClasses: ["creed", "sexual orientation"],
    cite: "Iowa Code § 216.8 (Iowa Civil Rights Act)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through the court process (forcible entry and detainer) under Iowa Code chapter 648. Landlord will not remove Tenant, exclude Tenant, or shut off essential services by self-help; an unlawful ouster or willful interruption of services is actionable by Tenant under § 562A.26.",
    cite: "Iowa Code ch. 648; § 562A.26",
  },

  habitability: {
    rule:
      "Landlord shall comply with applicable building and housing codes materially affecting health and safety, make all repairs and do whatever is necessary to put and keep the premises in a fit and habitable condition, keep common areas clean and safe, maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies, and supply running water, reasonable hot water, and reasonable heat (except where the unit is so constructed that heat or hot water is generated by an installation within Tenant's exclusive control and supplied by a direct public utility connection).",
    cite: "Iowa Code § 562A.15",
  },

  sources: [
    { cite: "Iowa Code § 562A.9", url: IACODE("562A.9") },
    { cite: "Iowa Code § 562A.11", url: IACODE("562A.11") },
    { cite: "Iowa Code § 562A.12", url: IACODE("562A.12") },
    { cite: "Iowa Code § 562A.15", url: IACODE("562A.15") },
    { cite: "Iowa Code § 562A.19", url: IACODE("562A.19") },
    { cite: "Iowa Code § 562A.25", url: IACODE("562A.25") },
    { cite: "Iowa Code § 562A.26", url: IACODE("562A.26") },
    { cite: "Iowa Code § 562A.27", url: IACODE("562A.27") },
    { cite: "Iowa Code § 562A.34", url: IACODE("562A.34") },
    { cite: "Iowa Code § 29A.101A", url: IACODE("29A.101A") },
    { cite: "Iowa Code § 216.8", url: IACODE("216.8") },
    { cite: "Iowa Code § 216.2", url: IACODE("216.2") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "Military termination is Iowa Code § 29A.101A (not in ch. 562A). It covers a lease signed before the person entered military service, or signed during service followed by PCS orders or a deployment of 90 days or more; it also releases dependents. § 29A.101 separately bars a landlord from evicting a service member or dependents for nonpayment during service except by court order. Active-duty federal servicemembers are also covered by the federal SCRA (50 U.S.C. § 3955), handled by the generator.",
    "Iowa has NO enacted domestic-violence lease-termination statute. A bill to add one (proposed § 562A.9A, e.g. HF 547 / HSB 141 / HF 2134) has been introduced in recent sessions but was not enacted as of the 2026 Iowa Code. domesticViolence is set to null. § 562A.27A (clear-and-present-danger) and § 562A.36 (retaliation protection for tenants who summon emergency aid for abuse victims) exist but are not tenant termination rights.",
    "FAIR HOUSING CHANGE: As of the 2026 Iowa Code, § 216.8 lists race, color, creed, sex, sexual orientation, religion, national origin, disability, and familial status for housing. 'Gender identity' is NOT listed — Iowa removed gender identity from the Iowa Civil Rights Act in 2025 (SF 418, eff. July 1, 2025). Beyond the federal seven, the extra state classes are creed and sexual orientation. 'Age' appears in § 216.8(1)(d) only as to persons lawfully present at the tenant's invitation, not as a general housing class.",
    "Late fee cap is tiered by rent amount and is both a per-day and per-month cap (§ 562A.9(4)); there is no statutory grace period. capType is 'tiered' (not auto-clamped); the full tiered rule is in capRule and the lease.",
    "Deposit interest during the first five years of a tenancy belongs to the landlord (§ 562A.12(2)); after five years interest would accrue to the tenant. interestRequired is set to false as the ordinary case; attorney to confirm treatment of tenancies exceeding five years.",
    "Duty to mitigate on early abandonment is treated as a contract/common-law duty (Iowa recognizes a duty to mitigate); § 562A.34(4) addresses only willful holdover damages. Attorney to confirm the controlling Iowa authority.",
    "§ 562A.26 remedy language (possession/termination plus a statutory damages amount) was summarized conservatively; the exact multiplier was not transcribed. Attorney to confirm against the full text of § 562A.26.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
