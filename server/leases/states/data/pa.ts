import type { StateLawProfile } from "../types";

// Official Pennsylvania General Assembly site (palegis.us). The Landlord and Tenant
// Act of 1951 is unconsolidated (Act 20 of 1951, 68 P.S. §§ 250.101 et seq.); the full
// act text was read (current through Acts 64 and 67 of Oct. 22, 2026).
const LTA =
  "https://www.palegis.us/statutes/unconsolidated/law-information/view-statute?txtType=HTM&SessYr=1951&ActNum=0020.&SessInd=0";
const PHRA =
  "https://www.palegis.us/statutes/unconsolidated/law-information/view-statute?txtType=HTM&SessYr=1955&ActNum=0222.&SessInd=0";
const PACS51 = (sec: string, sub: string) =>
  `https://www.palegis.us/statutes/consolidated/view-statute?txtType=HTM&ttl=51&div=0&chapter=73&section=${sec}&subsctn=${sub}`;

export const PA: StateLawProfile = {
  code: "PA",
  name: "Pennsylvania",
  framework: "Pennsylvania Landlord and Tenant Act of 1951, Act of April 6, 1951, P.L. 69, No. 20, 68 P.S. §§ 250.101 et seq.",

  deposit: {
    maxMonths: 2,
    capRule:
      "During the first year of the lease, the security deposit may not exceed two months' rent. During the second and later years of the lease, or any renewal, the deposit Landlord may require may not exceed one month's rent. Once Tenant has been in possession for five years or more, a rent increase may not be used to require a larger deposit.",
    capCite: "68 P.S. § 250.511a (Landlord and Tenant Act § 511.1)",
    returnDays: 30,
    returnRule:
      "Within 30 days after this Lease ends or Landlord accepts Tenant's surrender of the Property, whichever occurs first, Landlord shall give Tenant a written list of any damages Landlord claims Tenant is liable for, together with payment of the deposit and any unpaid interest minus the actual cost of those damages. Landlord may also keep amounts for unpaid rent or other breach of this Lease. If Landlord does not provide the written list within 30 days, Landlord forfeits the right to keep any part of the deposit or to sue for damage to the Property; if Landlord fails to pay the balance within 30 days, Landlord is liable for double the amount wrongfully withheld. Tenant must give Landlord a new address in writing when the tenancy ends.",
    returnCite: "68 P.S. § 250.512 (Landlord and Tenant Act § 512)",
    holdingRule:
      "If the deposit is more than $100, Landlord shall place it in an escrow account at a federally or Pennsylvania regulated bank or savings institution, or instead secure its return with a guarantee bond from a bonding company authorized in Pennsylvania, and shall notify Tenant in writing of the name and address of the bank and the amount deposited. Beginning with the second anniversary of the deposit, the deposit must earn interest; Landlord may keep 1% per year as an administrative fee and shall pay Tenant the rest of the interest each year on the anniversary of the lease.",
    holdingCite: "68 P.S. §§ 250.511b, 250.511c (Landlord and Tenant Act §§ 511.2, 511.3)",
    interestRequired: true,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: null,
    capType: "none",
    capRule: "",
    cite: null,
  },

  notice: {
    monthToMonthDays: 15,
    monthToMonthRule:
      "To end a month-to-month tenancy, or any lease of one year or less, at the end of its term, Landlord must give Tenant written notice to quit that allows at least 15 days from the date of service to move out (30 days if the lease term is longer than one year). Tenant may end a month-to-month tenancy by written notice to Landlord at least 15 days before the end of a monthly rental period. Landlord's notice may be served personally, left at the principal building on the premises, or posted conspicuously on the Property.",
    monthToMonthCite: "68 P.S. § 250.501(b), (f) (Landlord and Tenant Act § 501)",
    nonpaymentDays: 10,
    nonpaymentRule:
      "If Tenant fails, upon demand, to pay rent that is due, Landlord may give Tenant written notice to quit allowing at least 10 days from the date of service to move out, and may then file a landlord-tenant complaint with the magisterial district judge (in Philadelphia, the Municipal Court).",
    nonpaymentCite: "68 P.S. § 250.501(a)–(b) (Landlord and Tenant Act § 501)",
    entryHours: null,
    entryRule:
      "Pennsylvania has no statute setting an entry-notice period. Except in an emergency, Landlord will give Tenant at least 24 hours' notice before entering to inspect, make repairs, or show the Property, and will enter only at reasonable times.",
    entryCite: null,
  },

  earlyTermination: {
    military: {
      label: "Military orders, discharge, or government quarters (Pennsylvania law)",
      cite: "51 Pa.C.S. § 7315.1",
      eligible:
        "Tenant may terminate this Lease if Tenant is a member of the United States armed forces, or a member of the Pennsylvania National Guard serving on full-time duty or as a civil service technician with a National Guard unit, and Tenant (1) receives permanent change of station orders, (2) receives temporary duty orders for more than three months, (3) is honorably discharged or released from active duty (or from full-time duty or technician status with the Pennsylvania National Guard), or (4) receives orders for a mandatory housing assignment to government quarters that results in forfeiture of the basic allowance for housing.",
      notice:
        "Tenant serves Landlord with written notice of termination effective at least 30 days after Landlord receives it.",
      documentation:
        "Before the termination date, Tenant must give Landlord a copy of the official orders or a signed letter from Tenant's commanding officer confirming the orders.",
      liability:
        "Final rent is prorated to the termination date and is payable when it would otherwise be due. Landlord shall refund rent paid in advance for any period after the termination date within 30 days. Tenant remains responsible for damage Tenant caused to the Property. Landlord may ask a court, before the termination date, to modify this relief as justice and equity require, and may not hold Tenant's belongings or security deposit to secure rent for any period after termination.",
    },
    domesticViolence: null,
    other: [
      {
        label: "Pennsylvania National Guard and reserves called to active or State active duty",
        cite: "51 Pa.C.S. § 7315",
        eligible:
          "A member of the Pennsylvania National Guard called or ordered to active duty with the United States armed forces (other than active duty for training) or to State active duty, or a member of another reserve component called or ordered to active duty (other than for training), for 30 or more consecutive days, may terminate this Lease if it was signed by or for the member before the active duty or State active duty began. The member's agent or attorney-in-fact may also act.",
        notice:
          "Tenant may deliver or mail written notice to Landlord or Landlord's agent at any time after the duty begins. Because rent is paid monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is mailed or delivered.",
        documentation: "",
        liability:
          "Tenant may terminate without cost, payment, or penalty. Landlord may keep part of the security deposit only as the law allows and only to the extent necessary to pay for actual damage to the Property that arose before termination. Landlord may ask the court of common pleas, before the termination date, to modify this relief as justice and equity require.",
      },
      {
        label: "Death of the sole tenant",
        cite: "68 P.S. § 250.514 (Landlord and Tenant Act § 514)",
        eligible:
          "If Tenant is the only tenant of the Property and dies during the term of this Lease, the executor or administrator of Tenant's estate may terminate this Lease.",
        notice:
          "The executor or administrator gives Landlord at least 14 days' written notice. Termination takes effect on the later of the last day of the second calendar month after the month in which Tenant died, or the date the Property is surrendered with all of Tenant's personal property removed.",
        documentation: "",
        liability:
          "The estate remains liable for rent and other debts incurred before termination, damage to the Property, and expenses Landlord incurs as a direct result of Tenant's death, but owes no damages or penalty for breaking this Lease or for inadequate notice.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "unclear",
      cite: null,
      rule:
        "Pennsylvania courts have not clearly decided whether a residential landlord must re-rent after a tenant leaves early. Even so, Landlord will make reasonable efforts to re-rent the Property, and rent received from a replacement tenant will be credited against what Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "parking",
      title: "Parking",
      text:
        "Parking provided to Tenant under this Lease: {{parking}}. If Landlord provides parking, this Lease states whether Tenant must pay a parking fee and the amount. Landlord will not change or add a parking fee during this Lease unless parking availability changes or a third-party parking provider changes a pass-through fee. If this Lease does not state that parking is provided, Landlord does not provide parking.",
      cite: "68 P.S. § 250.207 (Landlord and Tenant Act § 207)",
    },
    {
      id: "deposit_escrow_notice",
      title: "Security deposit bank notice",
      text:
        "If the security deposit is more than $100 and is placed in escrow, Landlord will notify Tenant in writing of the name and address of the bank where it is held and the amount deposited.",
      cite: "68 P.S. § 250.511b(a) (Landlord and Tenant Act § 511.2)",
    },
    {
      id: "guests_and_services",
      title: "Guests and services",
      text:
        "Tenant may invite to the Property employees, business visitors, tradespeople, delivery people, and suppliers of goods and services of Tenant's choosing, and social guests, family, or visitors for a reasonable period of time, as long as Tenant meets Tenant's obligations. Landlord will not charge any fee or additional rent for this.",
      cite: "68 P.S. § 250.504-A (Landlord and Tenant Act § 504-A)",
    },
  ],

  fairHousing: {
    stateClasses: [
      "religious creed",
      "ancestry",
      "age (40 and over)",
      "use of a guide or support animal, or being a handler or trainer of one",
      "pregnancy, including eviction because of pregnancy or the birth of a child",
      "sexual orientation (as sex discrimination under Commission regulations)",
      "gender identity or expression (as sex discrimination under Commission regulations)",
    ],
    cite: "43 P.S. §§ 954(h), 955(h) (Pennsylvania Human Relations Act); 16 Pa. Code §§ 41.204, 41.206",
  },

  eviction: {
    rule:
      "Landlord may recover possession only by serving the notice to quit required by law (unless Tenant has waived it in writing, which this Lease does not do), filing a landlord-tenant complaint with the magisterial district judge (or the Philadelphia Municipal Court), obtaining a judgment, and having an order for possession executed by a constable or sheriff. Landlord will not change the locks, remove Tenant's belongings, shut off utilities, or use any other self-help to remove Tenant.",
    cite: "68 P.S. §§ 250.501–250.513 (Landlord and Tenant Act Article V)",
  },

  habitability: {
    rule:
      "Landlord shall keep the Property fit for habitation and in compliance with applicable building, housing, and health codes, make repairs needed to keep it that way (except damage caused by Tenant, Tenant's household, or guests), and use reasonable care to keep stairways, passages, roadways, and other common facilities under Landlord's control safe.",
    cite: "68 P.S. § 250.502-A (common areas); implied warranty of habitability (Pennsylvania case law)",
  },

  sources: [
    { cite: "Landlord and Tenant Act of 1951 (68 P.S. § 250.101 et seq.): table of contents and full text of §§ 205-208, 501, 511.1-511.3, 512, 513, 514, 501-A to 505-A", url: LTA },
    { cite: "Pennsylvania Human Relations Act §§ 4, 5(h) (43 P.S. §§ 954, 955)", url: PHRA },
    { cite: "51 Pa.C.S. § 7301 (chapter 73 contents and definitions)", url: PACS51("1", "0") },
    { cite: "51 Pa.C.S. § 7315", url: PACS51("15", "0") },
    { cite: "51 Pa.C.S. § 7315.1", url: PACS51("15", "1") },
    { cite: "16 Pa. Code § 41.204", url: "https://www.law.cornell.edu/regulations/pennsylvania/16-Pa-Code-SS-41-204" },
    { cite: "16 Pa. Code § 41.206", url: "https://www.law.cornell.edu/regulations/pennsylvania/16-Pa-Code-SS-41-206" },
  ],

  reviewNotes: [
    "No statewide domestic violence lease-termination statute: the full current Landlord and Tenant Act (official text, including Oct. 22, 2026 amendments) has none, and I found only pending bills (e.g., 2025-26 HB 72). § 513 gives DV victims a longer appeal period in eviction cases only. Philadelphia (Phila. Code § 9-804) and Pittsburgh have local DV termination rights - not encoded; flag for leases in those cities.",
    "Military is unusually broad. 51 Pa.C.S. § 7315.1 covers ALL U.S. armed forces members (plus PA Guard full-time members and civil service technicians) and adds triggers the SCRA lacks: honorable discharge/release from active duty and mandatory assignment to government quarters with BAH forfeiture, plus TDY orders over three months; notice is a flat 30 days after receipt. 51 Pa.C.S. § 7315 separately covers PA Guard and reserve members called to federal active duty or State active duty for 30+ consecutive days on leases signed before duty, 'without cost, payment or penalty'. Because the schema has one military slot, § 7315.1 is in `military` and § 7315 is in `other`.",
    "Month-to-month: § 501(b) sets the landlord's notice to quit (15 days for leases of one year or less or indeterminate term; 30 days for leases over one year; 10 days for nonpayment). There is no statute on tenant notice; the 15-day tenant notice is a lease term chosen to mirror the landlord's. § 501(e) lets a lease shorten or waive the notice to quit - Keycove's lease deliberately does not waive it; please keep it that way.",
    "Late fees: no statewide statute caps late fees or sets a grace period. Fees must be reasonable (liquidated damages, not penalty). Some municipalities regulate them.",
    "Mitigation: unsettled. The Pennsylvania Supreme Court in Stonehedge Square Ltd. P'ship v. Movie Merchants, Inc., 715 A.2d 1082 (Pa. 1998), held a commercial landlord had no duty to mitigate; I found no controlling residential decision and did not read the opinion from a primary source. basis is 'unclear'; the lease voluntarily promises reasonable re-letting efforts.",
    "Habitability: Pennsylvania's implied warranty of habitability is case law (Pugh v. Holmes, 405 A.2d 897 (Pa. 1979), not read). The only statutory landlord duty in the Landlord and Tenant Act is § 502-A (reasonable care for common areas). The Rent Withholding Act (35 P.S. § 1700-1) was not read.",
    "New in 2026: Act 64 of 2026 (added § 207, parking disclosure and no mid-lease parking fee changes) and Act 67 of 2026 (added § 208, application fees limited to actual administrative expenses), both approved Oct. 22, 2026. I could not confirm effective dates from the act text available; a secondary source says Act 67 takes effect 60 days after enactment (about Dec. 21, 2026). The parking disclosure is included now because leases signed today will run past that date.",
    "Deposit citations: the official act numbers the deposit sections 511.1, 511.2, 511.3 (cited in Purdon's as 68 P.S. §§ 250.511a, 250.511b, 250.511c). The 30-day return rule (§ 512) is triggered by lease termination or surrender and acceptance, whichever first, and the landlord's liability is excused if the tenant fails to give a forwarding address in writing (§ 512(e)).",
    "Fair housing: PHRA 'age' is defined as 40 or older (§ 4(h)). PHRA 'housing accommodations' excludes 'any personal residence offered for rent by the owner or lessee' - relevant to owner-occupied co-living, but the agreement should not rely on the exemption. PHRC regulations effective Aug. 16, 2023 (16 Pa. Code § 41.206) define 'sex' to include pregnancy, gender identity or expression, and affectional or sexual orientation.",
    "Plain Language Consumer Contract Act (73 P.S. § 2201 et seq.) applies to residential leases in Pennsylvania and may affect formatting/readability; not read. Utility Service Tenants Rights Act (68 P.S. § 399.1 et seq.) not read.",
    "Local law (from general knowledge, not read for this profile): Philadelphia (Fair Housing Ordinance, Phila. Code ch. 9-800: rental license, Certificate of Rental Suitability and Partners for Good Housing handbook at lease start, lead-safe certification for pre-1978 units with children 6 and under, 'good cause' protections for leases under one year and non-renewals, DV termination, source-of-income and other added protected classes); Pittsburgh (rental registration, source-of-income protections); State College and other college towns have rental permitting. Not encoded.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
