import type { StateLawProfile } from "../types";

const MN504B = "https://www.revisor.mn.gov/statutes/cite/504B/full";
const REV = (s: string) => `https://www.revisor.mn.gov/statutes/cite/${s}`;

export const MN: StateLawProfile = {
  code: "MN",
  name: "Minnesota",
  framework: "Minnesota Landlord and Tenant law, Minn. Stat. ch. 504B",

  deposit: {
    maxMonths: null,
    capRule: "Minnesota law sets no maximum amount for a security deposit.",
    capCite: null,
    returnDays: 21,
    returnRule:
      "Within three weeks after the tenancy ends (or within five days after Tenant leaves because the building is legally condemned for reasons not caused by Tenant), and after receiving Tenant's mailing address or delivery instructions, Landlord shall return the deposit with interest or give Tenant a written statement of the specific reasons for withholding any part of it. Mailing first class to the address Tenant provides within that time is sufficient. Landlord may withhold only amounts reasonably necessary to remedy Tenant's defaults in paying rent or other funds due under this Lease, or to restore the Premises to their condition at the start of the tenancy, ordinary wear and tear excepted. Tenant may not withhold the last month's rent on the ground that the deposit should cover it (except in a month-to-month tenancy where no notice to quit has been served).",
    returnCite: "Minn. Stat. § 504B.178, subds. 3, 8",
    holdingRule:
      "Landlord holds the deposit for Tenant, and it earns simple, noncompounded interest at 1% per year from the first day of the month after the deposit is fully paid until the last day of the month in which Landlord returns it or accounts for it (interest under $1 is excluded). If Landlord's interest in the Premises ends, Landlord shall transfer the deposit and interest to the successor and notify Tenant, or return it to Tenant, within 60 days.",
    holdingCite: "Minn. Stat. § 504B.178, subds. 2, 5",
    interestRequired: true,
    moveInInspection:
      "At the start of the tenancy, or within 14 days after Tenant moves in, Landlord will notify Tenant of Tenant's option to request an initial inspection to identify existing deficiencies, and if Tenant requests one, the parties will schedule it at a mutually acceptable time. If Tenant agrees, Landlord may instead give Tenant a written acknowledgment of photos or videos of the Premises showing their condition. Within a reasonable time after either party gives notice of intent to end the tenancy, or before the end of the term, Landlord will notify Tenant in writing of Tenant's option to request a move-out inspection and to be present; if requested, Landlord will inspect no earlier than five days before the end date so Tenant can fix identified deficiencies.",
  },

  lateFee: {
    graceDays: null,
    capType: "percent",
    capPercent: 8,
    capRule:
      "A late fee may be charged only because the parties have agreed to it in writing in this Lease, which states when it will be imposed, and it may not exceed 8% of the overdue rent payment. For subsidized tenancies, the late fee is calculated only on the portion of rent payable by Tenant.",
    cite: "Minn. Stat. § 504B.177",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either party may end a month-to-month tenancy by written notice at least as long as the interval between rent due dates (one month when rent is paid monthly), or three months if that is shorter. If this Lease gives Landlord and Tenant different notice periods, Tenant may use either one, and Landlord may not give a notice to quit or notice of rent increase shorter than the period Tenant must give.",
    monthToMonthCite: "Minn. Stat. §§ 504B.135, 504B.147",
    nonpaymentDays: 14,
    nonpaymentRule:
      "Before filing an eviction for nonpayment of rent or other unpaid amounts, Landlord must deliver to Tenant personally or by first-class mail a written notice stating the total amount due, an itemized accounting of unpaid rent, late fees, and other charges, the name and address of the person authorized to receive rent, and the legal-help, financial-help, and 14-day statements required by statute. Landlord may file only if Tenant does not pay the total due or move out within 14 days after the notice (or a longer period required by local law).",
    nonpaymentCite: "Minn. Stat. § 504B.321, subd. 1a",
    entryHours: 24,
    entryRule:
      "Landlord may enter the Premises only for a reasonable business purpose (such as showing the unit, maintenance, government inspections, or a reasonable belief of a lease violation or unauthorized occupant) and only after a good-faith effort to give Tenant reasonable notice of at least 24 hours that states a time or window of entry. Landlord may enter only between 8:00 a.m. and 8:00 p.m. unless Tenant agrees otherwise. Landlord may enter without notice if immediate entry is reasonably necessary to prevent injury to persons or property, to check on Tenant's safety, or to comply with local ordinances on unlawful activity, and will leave a written notice of any unannounced entry made while Tenant is absent. Tenant may allow entry on shorter notice but cannot be required to waive notice.",
    entryCite: "Minn. Stat. § 504B.211",
  },

  earlyTermination: {
    military: {
      label: "Military orders (Minnesota consumer law)",
      cite: "Minn. Stat. § 325G.55",
      eligible:
        "A service member who signed this Lease and afterward is issued orders into active duty, for deployment, or for a permanent change of duty station may cancel this Lease if the activation, deployment, or change of station makes it impractical to abide by its terms.",
      notice:
        "Tenant must send Landlord written notice of cancellation by certified mail. The cancellation takes effect the day after Landlord receives proper notice.",
      documentation: "The notice must include a copy of the orders.",
      liability:
        "The statute provides for cancellation at no penalty and a full refund of any money placed on deposit.",
    },
    domesticViolence: {
      label: "Domestic abuse, criminal sexual conduct, sexual extortion, or harassment",
      cite: "Minn. Stat. § 504B.206",
      eligible:
        "Tenant may terminate this Lease without penalty or liability, except as stated below, if Tenant or another authorized occupant fears imminent violence after being subjected to domestic abuse, criminal sexual conduct, sexual extortion, or harassment.",
      notice:
        "Before the tenancy ends, Tenant must deliver to Landlord by mail, in person, or by a form of written communication Tenant regularly uses with Landlord, a signed and dated written notice stating that Tenant fears imminent violence from a person named in the qualifying document if Tenant or the occupant remains, that Tenant needs to terminate the tenancy, the termination date, and written instructions for disposing of any personal property left behind. The tenancy ends on the date in the notice.",
      documentation:
        "The notice must be accompanied by a qualifying document: a valid order for protection; a no-contact order currently in effect; a writing signed by a court official or a law enforcement official documenting that Tenant or the occupant is a victim and naming the perpetrator if known; or a statement by a licensed health care professional, domestic abuse advocate, or sexual assault counselor in the statutory form. Landlord may ask for the perpetrator's name but disclosure is not a condition of termination.",
      liability:
        "A sole Tenant owes rent for the full month in which the tenancy ends, gives up any claim to return of the security deposit, and is released from rent and other charges for the rest of the term. If there are multiple tenants, the Lease ends for all tenants at the later of the end of the month or the end of the rent interval in which one tenant terminates; all tenants owe rent for that full month, give up the security deposit, and are released from the rest of the term, and the remaining tenants may reapply for a new lease. Rent and other amounts owed before termination remain due. Landlord must keep the notice, the qualifying document, Tenant's new address, and Tenant's victim status confidential. These rights cannot be waived.",
    },
    other: [
      {
        label: "Death of Tenant",
        cite: "Minn. Stat. § 504B.265",
        eligible:
          "If Tenant dies (or, if there is more than one tenant, all tenants die), either Landlord or the personal representative of Tenant's estate may terminate this Lease.",
        notice:
          "The terminating party must give at least two months' written notice, effective on the last day of a calendar month, hand delivered or mailed first class to the other party.",
        documentation: "",
        liability:
          "Tenant's estate remains liable for rent and other sums owed before or during the notice period and for restoring the Premises to their starting condition, ordinary wear and tear excepted. Any lease term requiring longer notice is void.",
      },
      {
        label: "Move to a medical care facility",
        cite: "Minn. Stat. § 504B.266",
        eligible:
          "Tenant or Tenant's authorized representative may terminate this Lease if a physician, advanced practice registered nurse, or mental health professional finds that Tenant (or one of the tenants) needs to move into a medical care facility (such as a nursing home, hospice, assisted living, boarding care home, or accessible unit) and Tenant requires help with activities of daily living due to medical reasons or a disability, meets nursing facility level of care criteria, or has a qualifying mental-illness-related impairment. This does not apply if Tenant needs an accessible unit and Landlord can provide one in the same complex within two months of the request.",
        notice:
          "Tenant must give at least two months' written notice, effective on the last day of a calendar month, hand delivered or mailed first class.",
        documentation:
          "The notice must include a copy of the medical professional's written documentation and proof that Tenant has been accepted, or has a pending application, at the facility where Tenant needs to move.",
        liability:
          "Tenant remains liable for rent and other sums owed before or during the notice period and for restoring the Premises to their starting condition, ordinary wear and tear excepted. Any lease term requiring longer notice is void.",
      },
      {
        label: "Destroyed or uninhabitable building",
        cite: "Minn. Stat. § 504B.131",
        eligible:
          "If the building is destroyed or becomes uninhabitable or unfit for occupancy through no fault or neglect of Tenant, Tenant may vacate and surrender the Premises.",
        notice: "",
        documentation: "",
        liability: "Tenant owes no further rent after vacating and surrendering the Premises under this right.",
      },
      {
        label: "New construction not ready",
        cite: "Minn. Stat. § 504B.153",
        eligible:
          "If the Premises are new construction that will not be ready by the move-in date, Landlord must notify Tenant within seven days of learning this and before the move-in date, and Tenant may choose reasonably equivalent alternative housing, payment equal to the rent toward alternative housing, or termination of this Lease. A Tenant who chose alternative housing or payment may still terminate if the unit is not available within 90 days after the move-in date.",
        notice: "",
        documentation: "",
        liability:
          "On termination, Landlord shall return all amounts Tenant paid, including rent, deposit, and other payments made to enter this Lease.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "Minn. Stat. § 504B.154",
      rule:
        "If Tenant abandons the Premises during the term, Landlord shall make reasonable efforts to re-rent at a fair rental value. If Landlord re-rents for a term starting before this Lease ends, this Lease ends when the new tenancy begins, and Tenant owes no rent after that date. If Landlord fails to make reasonable efforts to re-rent or accepts the abandonment as a surrender, this Lease ends on the date Landlord has notice of the abandonment.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Manager and Agent for Service",
      text:
        "The person authorized to manage the Premises, and the landlord or agent authorized to accept service of process and to receive and give receipt for notices and demands, is {{landlord_name}}, {{landlord_address}}.",
      cite: "Minn. Stat. § 504B.181, subd. 1",
    },
    {
      id: "first_page_terms",
      title: "First-Page Terms",
      text:
        "The first page of this Lease states the lease start date and end date, any prorated rent for a move-in or move-out date other than the first or last day of a month, all nonoptional fees, the sum of rent and all nonoptional fees labeled as the Total Monthly Payment, and whether utilities are included in the rent. Rent for a final month that ends before the last day of the month is prorated at the actual daily rate.",
      cite: "Minn. Stat. §§ 504B.116, 504B.120, 504B.146",
    },
    {
      id: "inspection_orders",
      title: "Outstanding Inspection and Condemnation Orders",
      text:
        "Before this Lease was signed or any rent or deposit paid, Landlord provided Tenant a copy of every outstanding inspection order with a citation for code violations that the inspector identified as threatening tenant health or safety, and every outstanding condemnation order or declaration that the Premises are unfit for human habitation. Landlord will provide copies of any such new order to Tenant within 72 hours after the citation is issued.",
      cite: "Minn. Stat. § 504B.195",
    },
    {
      id: "foreclosure_notice",
      title: "Pending Foreclosure or Contract for Deed Cancellation",
      text:
        "Landlord has received notice of a mortgage foreclosure sale or contract for deed cancellation affecting the Premises. The redemption or cancellation period ends on the date Landlord has stated in writing to Tenant, and the term of this Lease does not extend beyond that period unless the statutory exception applies.",
      cite: "Minn. Stat. § 504B.151",
      condition: "Only if Landlord has received notice of a contract for deed cancellation or mortgage foreclosure sale",
    },
    {
      id: "service_animals",
      title: "Service and Support Animals",
      text:
        "Landlord will not charge any additional fee, charge, or deposit under a pet policy for a service animal or support animal that is a reasonable accommodation for a person with a disability.",
      cite: "Minn. Stat. § 504B.113",
      condition: "Only if Landlord charges pet fees, charges, or deposits",
    },
    {
      id: "shared_utilities",
      title: "Apportioned Utility Bills",
      text:
        "UTILITY BILLS How Will My Bill be Calculated? 1. Your utility bill is for your portion of the building's natural gas or water and sewer usage, plus your portion of nonusage fees we get charged by the utility (for example, taxes and surcharges). For natural gas, your portion is based on the square footage of your unit as a percentage of the square footage of all the units. For water and sewer, your portion is based on the number of people in your unit (as listed on your lease) as a percentage of all the occupants of all units. 2. You are not charged for utilities used in the common areas or used in our spaces. In the case of water, your bill does not include usage for shared amenities such as laundry rooms or pools. 3. Your bill may include a late payment charge, which is capped at $5, and an administrative billing charge, which is capped at $8. What If I Fall Behind on Utility Payments or Have a Question About My Bill? 1. If you fall behind on your payments, you have the right to a reasonable payment plan that you and we mutually agree on to pay off the amount you owe. The plan must take into account any financial and extenuating circumstances of your household that you tell us about. 2. You may request, and we will timely provide, the utility bill we received from the utility company and your percentage of the amount of the bill apportioned to tenants. 3. We must first try to resolve any disputes about your natural gas or electricity utility charges, including those about payment agreements. If we cannot agree on a payment plan or resolve any other dispute, you have the right to seek assistance from the Public Utilities Commission's Consumer Affairs Office at 651-296-0406 or consumer.puc@state.mn.us. Tenant may also request a copy of the current utility bill being apportioned and copies of past apportioned bills for the preceding two years (or since the current landlord acquired the building, if more recent).",
      cite: "Minn. Stat. § 504B.216, subds. 5(c)–(d), 10",
      condition: "Only if Landlord apportions natural gas or water and sewer charges in a shared-metered building",
    },
  ],

  fairHousing: {
    stateClasses: ["creed", "sexual orientation", "gender identity", "marital status", "status with regard to public assistance"],
    cite: "Minn. Stat. § 363A.09, subd. 1",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through an eviction action in district court under Minn. Stat. §§ 504B.281 to 504B.371. Landlord will not remove or exclude Tenant, or interrupt electrical, heat, gas, or water service, to force Tenant out; unlawful ouster is a misdemeanor and entitles Tenant to treble damages or $500, whichever is greater, plus attorney fees.",
    cite: "Minn. Stat. §§ 504B.281, 504B.285, 504B.225, 504B.231, 504B.375",
  },

  habitability: {
    rule:
      "Landlord covenants that the Premises and all common areas are fit for the use intended; will keep them in reasonable repair during the term, including extermination of insects, rodents, vermin, and other pests; will make them reasonably energy efficient where cost-effective; will maintain them in compliance with applicable health and safety laws, including rental licensing ordinances; and will supply heat of at least 68 degrees Fahrenheit in all habitable areas, including kitchens and bathrooms, from October 1 through April 30 (unless a utility requires reduction), except where Tenant's willful, malicious, or irresponsible conduct caused the problem. These covenants cannot be waived or modified.",
    cite: "Minn. Stat. § 504B.161",
  },

  sources: [
    { cite: "Minn. Stat. ch. 504B (full chapter, incl. §§ 504B.001, .111, .113, .115, .116, .118, .120, .131, .135, .145, .146, .147, .151, .153, .154, .161, .172, .175, .177, .178, .181, .182, .185, .195, .206, .211, .216, .225, .231, .265, .266, .275, .281, .285, .291, .321, .375)", url: MN504B },
    { cite: "Minn. Stat. § 325G.55 (cancellation of rental contracts by military personnel)", url: REV("325G.55") },
    { cite: "Minn. Stat. § 363A.09 (real property discrimination)", url: REV("363A.09") },
    { cite: "Minn. Stat. § 363A.03 (definitions)", url: REV("363A.03") },
    { cite: "Minn. Stat. ch. 192 and ch. 190 (searched; no residential lease termination provision)", url: REV("192/full") },
  ],

  reviewNotes: [
    "MILITARY — judgment call: Minn. Stat. § 325G.55 (consumer protection chapter) lets a service member who receives orders into active duty, for deployment, or for a permanent change of duty station after signing a 'rental contract' cancel it the day after the landlord receives certified-mail notice with orders, 'at no penalty and with a full refund of any money which may have been placed on deposit,' where the orders make it impractical to abide by the contract. 'Rental contract' is undefined and appears alongside club, service, and membership-travel contracts, so it is unclear whether it reaches residential real-property leases. I encoded it because it is the only Minnesota statute on point and including it errs toward compliance, but it is MORE tenant-favorable than the SCRA (next-day termination; literal reading would bar deposit deductions). Attorney should decide whether to keep it. Chapters 190 and 192 (military) were searched and contain no residential lease termination provision.",
    "ACTION REQUIRED (product): Minn. Stat. §§ 504B.120 and 504B.146 require specific items ON THE FIRST PAGE of the lease: lease start and end dates, prorated rent amounts for partial months, all nonoptional fees, the 'Total Monthly Payment' (rent + all nonoptional fees), and whether utilities are included. Violating § 504B.120 exposes the landlord to treble damages and attorney fees. The builder must lay out page 1 accordingly; the disclosure text only describes it.",
    "DV termination in a multi-tenant lease ends the lease for ALL tenants (§ 504B.206, subd. 3(b)), and every tenant forfeits the security deposit; remaining tenants must reapply. This is unusual and should be explained in co-living agreements, where each room may be a separate lease.",
    "Nonpayment notice (§ 504B.321, subd. 1a) has mandatory verbatim statements; the eviction complaint must attach it or the case is dismissed and expunged. Keycove's notice templates (not the lease) must use the exact language.",
    "Late fees: 8% cap of the overdue rent payment, fee must be agreed in writing and state when it is imposed (§ 504B.177). There is no statutory grace period. A late fee is neither interest nor liquidated damages.",
    "Deposit penalties: failure to return or account within three weeks, or failure to give the initial/move-out inspection notices required by § 504B.182, makes the landlord liable for the withheld amount plus an equal penalty plus interest; bad-faith retention adds up to $500 punitive damages.",
    "Entry violations (§ 504B.211, subd. 6) can result in rent reduction up to full rescission of the lease plus up to $500 per violation; this is a court remedy, not encoded as a termination right.",
    "Attorney fees: if the lease lets the landlord recover attorney fees, the tenant gets reciprocal fees (§ 504B.172).",
    "Digital payment platforms (§ 504B.118, amended 2026 c 81): if rent is paid through an online platform, the landlord must offer a no-fee alternative when the platform is not working, and may not charge late fees or evict when both methods are down. Cash payments require receipts.",
    "§ 504B.111 requires a written lease for buildings of 12 or more units; § 504B.115 requires giving the tenant a copy; § 504B.145 restricts automatic renewals (15–30 day advance notice).",
    "Fair housing: Minnesota's housing classes beyond federal are creed, sexual orientation, gender identity, marital status, and status with regard to public assistance (§ 363A.09). Age is not a housing class under § 363A.09, subd. 1.",
    "Local law: St. Paul rent stabilization ordinance and St. Paul tenant protections; Minneapolis tenant-protection, advance-notice, and rental licensing ordinances; § 504B.321 notice period can be longer under local law. Not researched from primary text here.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
