import type { StateLawProfile } from "../types";

const JUST = (s: string) => `https://law.justia.com/codes/mississippi/title-89/chapter-8/section-${s}/`;

export const MS: StateLawProfile = {
  code: "MS",
  name: "Mississippi",
  framework:
    "Mississippi Residential Landlord and Tenant Act, Miss. Code Ann. §§ 89-8-1 et seq.",

  deposit: {
    maxMonths: null,
    capRule: "Mississippi law sets no limit on the amount of the security deposit.",
    capCite: null,
    returnDays: 45,
    returnRule:
      "By written notice delivered to Tenant, Landlord may claim from the deposit only amounts reasonably necessary to remedy Tenant's defaults in the payment of rent, to repair damage to the premises caused by Tenant (ordinary wear and tear excepted), to clean the premises on termination of the tenancy, or for other reasonable and necessary expenses incurred as a result of Tenant's default; the written notice shall itemize the amounts claimed. Landlord shall return any remaining portion of the deposit no later than 45 days after the termination of the tenancy, delivery of possession, and demand by Tenant. Retaining the deposit or any part in violation of this rule and in the absence of good faith may subject Landlord to damages not exceeding $200 in addition to any actual damages.",
    returnCite: "Miss. Code Ann. § 89-8-21(3)–(4)",
    holdingRule:
      "Landlord holds the deposit for Tenant, and Tenant's claim to the deposit is prior to the claim of any creditor of Landlord.",
    holdingCite: "Miss. Code Ann. § 89-8-21(2)",
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
      "Either party may terminate a month-to-month tenancy by written notice given to the other at least 30 days before the termination date (at least 7 days for a week-to-week tenancy). No termination notice is required when a party has committed a substantial violation of this Lease or the Act that materially affects health or safety.",
    monthToMonthCite: "Miss. Code Ann. § 89-8-19",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If Tenant fails to pay rent, Landlord may deliver a written notice (or, if Tenant has agreed in writing, by email or text message) stating that this Lease will terminate if the rent is not paid within three days. For other material noncompliance by Tenant, Landlord's written notice sets a termination date not less than 14 days after receipt if the breach is not remedied within a reasonable time not exceeding 14 days.",
    nonpaymentCite: "Miss. Code Ann. § 89-8-13(3), (5)",
    entryHours: null,
    entryRule:
      "Mississippi has no statute setting a landlord entry-notice period. Landlord will give Tenant at least 24 hours' notice before entering for inspections, repairs, or showings, except in an emergency or when Tenant consents at the time of entry.",
    entryCite: null,
  },

  earlyTermination: {
    military: null,
    domesticViolence: null,
    other: [
      {
        label: "Death of the tenant (Derrick Beard Act)",
        cite: "Miss. Code Ann. § 89-8-29",
        eligible:
          "If a cosigner signed this Lease and the tenant dies before the Lease ends (or, if there is more than one tenant, all tenants die), the cosigner may terminate this Lease and is presumed to have terminated it. This right applies to leases entered into or renewed after July 1, 2011, and cannot be waived.",
        notice:
          "The cosigner must provide Landlord notice within 30 days of the death — whether the cosigner chooses to terminate or chooses not to terminate the Lease.",
        documentation: "",
        liability:
          "Termination does not relieve the deceased tenant's estate or the cosigner from paying rent and other sums owed before the death, rent and other sums for the remainder of the month or 30-day period during which the death occurred, and amounts necessary to restore the Property to its condition at the start of the tenancy (ordinary wear and tear excepted). No early termination fee applies.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "Miss. Code Ann. § 89-8-13(2)–(4)",
        eligible:
          "If Landlord materially fails to comply with this Lease or with Landlord's duties under § 89-8-23 (complying with applicable health-and-safety building and housing codes and maintaining the dwelling unit, its plumbing, and its heating and cooling system), Tenant may terminate this Lease.",
        notice:
          "Tenant delivers Landlord written notice (or, if Landlord has agreed in writing, by email or text message) specifying the acts and omissions and stating that this Lease will terminate on a date not less than 14 days after receipt if the breach is not remedied within a reasonable time not exceeding 14 days.",
        documentation: "",
        liability:
          "If this Lease terminates, Landlord shall return all prepaid and unearned rent and the security deposit recoverable under § 89-8-21. No early termination fee applies.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "unclear",
      cite: null,
      rule:
        "If Tenant leaves early, Landlord will make reasonable efforts to re-rent the Property, and rent received from a replacement tenant is credited against what Tenant owes.",
    },
  },

  disclosures: [],

  fairHousing: {
    stateClasses: [],
    cite: "no state fair housing act; the federal Fair Housing Act, 42 U.S.C. § 3601 et seq., applies",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through the court eviction process. Landlord may commence a residential eviction under §§ 89-8-31 to 89-8-45 for breach of this Lease or the Act (§ 89-8-13) or for failing to vacate after this Lease ends (§§ 89-8-17, 89-8-19), or use the removal-of-tenant procedure under §§ 89-7-1 et seq. Landlord will not remove or exclude Tenant, or shut off utilities, by self-help.",
    cite: "Miss. Code Ann. §§ 89-8-31 to 89-8-45; §§ 89-7-1 et seq.",
  },

  habitability: {
    rule:
      "Landlord shall at all times during the tenancy comply with applicable building and housing codes materially affecting health and safety and maintain the dwelling unit, its plumbing, and its heating and/or cooling system in substantially the same condition as at the start of the Lease (reasonable wear and tear excepted), unless the dwelling unit or a system is damaged or impaired by the deliberate or negligent act of Tenant or of a person on the premises with Tenant's permission.",
    cite: "Miss. Code Ann. § 89-8-23",
  },

  sources: [
    { cite: "Miss. Code Ann. § 89-8-5", url: JUST("89-8-5") },
    { cite: "Miss. Code Ann. § 89-8-13", url: JUST("89-8-13") },
    { cite: "Miss. Code Ann. § 89-8-19", url: JUST("89-8-19") },
    { cite: "Miss. Code Ann. § 89-8-21", url: JUST("89-8-21") },
    { cite: "Miss. Code Ann. § 89-8-23", url: JUST("89-8-23") },
    { cite: "Miss. Code Ann. § 89-8-29", url: JUST("89-8-29") },
    { cite: "Miss. Code Ann. § 89-8-31", url: JUST("89-8-31") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "Mississippi has NO state military lease-termination statute. § 33-1-39 (searched) concerns professional licenses, not leases. Servicemembers rely on the federal SCRA (50 U.S.C. § 3955), which the generator adds. military is null.",
    "Mississippi has NO enacted domestic-violence lease-termination statute. Bills to add one (e.g., HB 126 (2022), HB 65 (2023), amending § 89-8-13) were introduced but not enacted; the § 89-8-17 claim circulating online is incorrect (§ 89-8-17 is 'Rights of landlord after expiration of rental agreement'). A survivor's statutory tool is a protection-from-abuse order (Title 93, ch. 21), which can exclude the abuser but does not by itself release the lease. domesticViolence is null.",
    "Mississippi has NO state fair housing act (one of the few states without one); only the federal Fair Housing Act applies. stateClasses is empty and the cite notes this. HUD enforces the FHA in Mississippi.",
    "Nonpayment of rent uses a 3-day notice (§ 89-8-13(5)); general material breach uses a 14-day cure/terminate notice (§ 89-8-13(3)). § 89-8-13(5)(b) directs the eviction judge to follow the provisions of the signed lease. monthToMonth notice is 30 days (§ 89-8-19), and no notice is required for a substantial violation materially affecting health or safety.",
    "Derrick Beard Act (§ 89-8-29) is a death-of-tenant termination right exercisable by a cosigner within 30 days of the tenant's death; the estate/cosigner remain liable for rent through the 30-day period of death plus restoration costs. Captured as an 'other' right. The tenant's own right to terminate for Landlord's material breach (§ 89-8-13(2)) is also captured as an 'other' right.",
    "Duty to mitigate on early abandonment is not settled by statute in Mississippi; mitigation.basis is 'unclear' and the lease commits Landlord to credit rent actually received from a replacement tenant. Attorney to confirm.",
    "No statutory landlord entry-notice period (no access section in ch. 89-8); the 24-hour courtesy notice is contractual. No statutory late-fee cap and no statutory deposit cap, escrow, or interest requirement. § 89-8-5 bars waiver of chapter rights, confession of judgment, and exculpation of the landlord's willful misconduct.",
    "The residential eviction procedure (§§ 89-8-31 to 89-8-45) was added in 2022 and amended in 2025; the older removal-of-tenant procedure (§§ 89-7-1 et seq., including the 3-day path in § 89-7-27) remains available. Attorney to confirm which track a given court uses.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
