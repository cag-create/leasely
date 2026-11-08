import type { StateLawProfile } from "../types";

// Statute text read 2026-11-08 from law.justia.com (2025 Tennessee Code, which
// includes 2025 session acts) plus the enrolled amendment for 2026 Pub. Ch. 606
// from capitol.tn.gov. The official Tennessee Code host (LexisNexis) is not
// curl-accessible; Justia was read in a browser because curl is blocked by a
// bot challenge. Saved text: scratchpad/statutes/TN_*.txt.
//
// IMPORTANT: Tennessee's URLTA (Title 66, Chapter 28) applies ONLY in counties
// with a population over 75,000 under the 2010 federal census
// (§ 66-28-102(a)). Chapter 7 of Title 66 and Title 29, Chapter 18 apply
// statewide. Lease text below is written so that it is accurate in both kinds
// of county: URLTA rules are stated as binding lease terms everywhere (they are
// lawful contract terms in non-URLTA counties), and rights that exist only by
// statute in URLTA counties are labelled as such.

const JUSTIA = (title: string, chapter: string, part: string | null, section: string) =>
  `https://law.justia.com/codes/tennessee/title-${title}/chapter-${chapter}/${part ? `part-${part}/` : ""}section-${section}/`;
const URLTA = (part: string, section: string) => JUSTIA("66", "28", part, section);

export const TN: StateLawProfile = {
  code: "TN",
  name: "Tennessee",
  framework:
    "the Tennessee Uniform Residential Landlord and Tenant Act, Tenn. Code Ann. §§ 66-28-101 et seq. (in counties where it applies under § 66-28-102), Tenn. Code Ann. Title 66, Chapter 7 (Leases), and Tenn. Code Ann. Title 29, Chapter 18 (Forcible Entry and Detainer)",

  deposit: {
    maxMonths: null,
    capRule: "Tennessee law sets no maximum amount for a security deposit.",
    capCite: null,
    returnDays: 30,
    returnRule:
      "Tennessee law sets no fixed deadline for refunding the deposit; Landlord agrees to the following. Within 30 days after Tenant vacates and returns possession, Landlord will send to Tenant's last known or reasonably determinable address a written notice of the amount of any refund due, together with an itemized list of any damage charged against the deposit and the estimated cost of repairing it, and will pay any refund due. Landlord may apply the deposit to unpaid rent and other amounts Tenant owes under this Lease. Landlord may charge the deposit for physical damage only if Landlord discovers the damage before the earlier of 30 days after Tenant vacates or seven days after a new tenant takes possession. Tenant has the right to inspect the Property with Landlord to determine any damage charged against the deposit: within five days after Landlord receives Tenant's written notice of intent to vacate, Landlord may notify Tenant of the right to be present at the move-out inspection, which will take place on the day Tenant vacates or within four calendar days afterward, during normal working hours. If Tenant requests a joint inspection, Landlord and Tenant will together list any damage and the estimated cost of repair and sign the list, and Tenant may state in writing any item Tenant disputes. Tenant does not have this inspection right if Tenant vacates without written notice, abandons the Property, is judicially removed, does not respond to Landlord's notice of the right to inspect, fails to appear at the scheduled inspection, or does not request an inspection; in that case Landlord will send Tenant a copy of the damage list and estimated repair costs on Tenant's written request. Landlord will not keep any part of the deposit unless it was held as described above and the damage list was provided as the law requires.",
    returnCite: "Tenn. Code Ann. § 66-28-301(b)–(g)",
    holdingRule:
      "Landlord will keep the deposit in an account used only for security deposits, at a bank or other lending institution regulated by the State of Tennessee or an agency of the United States government. When Tenant signs this Lease and pays the deposit, Landlord will tell Tenant in writing where that account is located (Landlord does not have to disclose the account number).",
    holdingCite: "Tenn. Code Ann. § 66-28-301(a), (h)",
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: 5,
    capType: "percent",
    capPercent: 10,
    capRule:
      "Rent has a five-day grace period, and the day rent is due counts as the first day, so a late fee may first be charged on the sixth day. If the fifth day of the grace period falls on a Sunday or legal holiday, no late fee may be charged if rent is paid on the next business day. A late fee, however described, may not exceed 10% of the amount of rent past due.",
    cite: "Tenn. Code Ann. § 66-28-201(d)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either party may end a month-to-month tenancy by written notice given to the other at least 30 days before the periodic rent due date specified in the notice as the termination date. A week-to-week tenancy may be ended by written notice given at least 10 days before the termination date specified in the notice.",
    monthToMonthCite: "Tenn. Code Ann. § 66-28-512(a)–(b)",
    nonpaymentDays: 14,
    nonpaymentRule:
      "If rent remains unpaid after the grace period, Landlord may give Tenant written notice stating the amount due and that this Lease will terminate if the rent is not paid within 14 days after Tenant receives the notice. If Tenant pays all rent due within that time, this Lease does not terminate. If Tenant again fails to pay rent within six months after such a notice, Landlord may terminate this Lease on written notice of at least seven days where the Uniform Residential Landlord and Tenant Act applies, or at least 14 days in other Tennessee counties, stating the breach and the termination date. For other material breaches, Landlord gives written notice stating the breach and the termination date as Tennessee law requires before filing an eviction action.",
    nonpaymentCite: "Tenn. Code Ann. § 66-28-505(a) (URLTA counties); Tenn. Code Ann. § 66-7-109(a)–(b) (other counties)",
    entryHours: null,
    entryRule:
      "Tenant will not unreasonably withhold consent for Landlord to enter the Property to inspect it, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show it to prospective or actual purchasers, mortgagees, workers, or contractors. Tennessee law sets no general advance-notice period, but Landlord will give Tenant at least 24 hours' notice before any such entry and will enter only at reasonable times, except in an emergency (a sudden, generally unexpected situation demanding immediate action), when Landlord may enter without consent. During the final 30 days of this Lease, Landlord may enter to show the Property to prospective tenants after giving Tenant at least 24 hours' notice. If utilities have been turned off through no fault of Landlord, Landlord may enter to inspect for and repair damage caused by the lack of utilities. Landlord may also enter at reasonably necessary times during any absence of Tenant of more than seven days, or if Tenant has abandoned or surrendered the Property. Landlord will not abuse the right of entry or use it to harass Tenant.",
    entryCite: "Tenn. Code Ann. §§ 66-28-403, 66-28-507(b)",
  },

  earlyTermination: {
    military: null,
    domesticViolence: {
      label: "Domestic abuse, sexual assault, or stalking",
      cite: "Tenn. Code Ann. § 66-7-112; § 66-28-205",
      eligible:
        "Tenant may terminate this Lease if Tenant, or a member of Tenant's family who lives in Tenant's household, is a domestic abuse victim, sexual assault victim, or stalking victim as defined in Tenn. Code Ann. § 36-3-601, whether the victim is an adult or a child.",
      notice:
        "Tenant gives Landlord written notice stating that Tenant or the household member is such a victim and requesting release from this Lease, with a release date agreed by Landlord and Tenant that falls within 30 days after the date of the notice. Tenant must move out within 30 days after giving the notice, or at another time Landlord and Tenant agree.",
      documentation:
        "With the notice, Tenant provides either (1) a copy of a valid order of protection issued or extended under Tenn. Code Ann. § 36-3-605 after a hearing at which the court found by a preponderance of the evidence that Tenant or the household member is a domestic abuse, sexual assault, or stalking victim, or (2) documentation of a criminal charge of domestic abuse, sexual assault, or stalking, based on a police report showing that Tenant or the household member was subjected to that conduct. The documentation must be dated no more than 60 days before Tenant's notice.",
      liability:
        "Tenant owes rent for the full month in which the tenancy terminates and any obligations outstanding on the termination date, but no rent for later periods and no early termination fee or penalty. Other tenants who signed this Lease are not released from it. Unless required by law or court order, Landlord will not reveal any information that could reasonably be used to locate Tenant or the household member, such as a home or work address, telephone number, or Social Security number, without Tenant's written consent.",
    },
    other: [
      {
        label: "Physical disability: acceptance into public housing",
        cite: "Tenn. Code Ann. § 66-7-110",
        eligible:
          "A Tenant with a physical disability who is permanently and totally disabled (as defined in Tenn. Code Ann. § 71-4-1102) and who is accepted as a resident of a public housing facility may terminate this Lease for Tenant's primary residence, unless Landlord has made significant modifications to the Property to address accessibility for persons with a physical disability.",
        notice:
          "The statute sets no advance-notice period. Tenant gives Landlord written notice of the termination, and Landlord will acknowledge the termination to Tenant in writing.",
        documentation:
          "Tenant presents Landlord with written evidence that the public housing facility has accepted Tenant as a resident.",
        liability:
          "Tenant owes no penalty and no rent for any period after Tenant stops occupying the Property.",
      },
      {
        label: "Fire or casualty damage",
        cite: "Tenn. Code Ann. § 66-28-503; § 66-7-102",
        eligible:
          "Tenant may terminate this Lease if the Property is damaged or destroyed by fire, the elements, or another casualty so that it is deemed unfit for human habitation by a governmental authority, or so that it is untenantable and unfit for occupancy and the damage occurred without fault or neglect of Tenant.",
        notice:
          "Tenant may move out immediately and must notify Landlord in writing, within 14 days after moving out, of Tenant's intention to terminate. This Lease then terminates as of the date Tenant moved out.",
        documentation: "",
        liability:
          "Tenant owes no rent for any period after the earlier of the date Tenant returns the keys or the date Tenant actually moved out, and no early termination fee. Landlord will return all prepaid rent and the refundable portion of the security deposit.",
      },
      {
        label: "Unlawful removal or shut-off of essential services by Landlord (URLTA counties)",
        cite: "Tenn. Code Ann. § 66-28-504",
        eligible:
          "Where the Uniform Residential Landlord and Tenant Act applies (counties with a population over 75,000 under the 2010 federal census), if Landlord unlawfully removes or excludes Tenant from the Property, or willfully diminishes services by interrupting essential services Landlord provides under this Lease, Tenant may recover possession or terminate this Lease.",
        notice: "The statute sets no advance-notice period.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee. Landlord will return all prepaid rent and security deposits, and Tenant may recover actual damages, punitive damages when appropriate, and a reasonable attorney's fee.",
      },
      {
        label: "Unlawful or harassing entry by Landlord (URLTA counties)",
        cite: "Tenn. Code Ann. § 66-28-513(b)",
        eligible:
          "Where the Uniform Residential Landlord and Tenant Act applies, if Landlord makes an unlawful entry, makes a lawful entry in an unreasonable manner, or makes repeated demands for entry that unreasonably harass Tenant, Tenant may obtain a court order to stop the conduct or terminate this Lease.",
        notice: "The statute sets no advance-notice period.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee and may recover actual damages and reasonable attorney's fees.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "Tenn. Code Ann. § 66-28-507(c)",
      rule:
        "If Tenant abandons the Property, Landlord will use reasonable efforts to re-rent it at a fair rental. If Landlord re-rents it for a term beginning before this Lease ends, this Lease terminates on the date the new tenancy begins, and Tenant owes no rent for any period after that date.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner, Manager, and Maintenance Contact",
      text:
        "The person authorized to manage the Property, and the owner or person authorized to act for the owner in accepting service of process and receiving notices and demands, is {{landlord_name}}, {{landlord_address}}. Tenant may submit maintenance requests through the Keycove online portal used for this Lease. Landlord will keep this information current and will notify Tenant in writing of any change, including a change of owner or manager.",
      cite: "Tenn. Code Ann. § 66-28-302",
    },
    {
      id: "renters_insurance",
      title: "No Insurance for Tenant's Belongings",
      text:
        "Landlord is not responsible for, and will not provide, fire or casualty insurance for Tenant's personal property.",
      cite: "Tenn. Code Ann. § 66-28-201(a)",
    },
    {
      id: "firearms",
      title: "Lawful Firearm Possession",
      condition: "For leases entered into, amended, extended, or renewed on or after January 1, 2027",
      text:
        "Landlord will not prohibit Tenant's lawful possession, carrying, transportation, or storage of a firearm, any part of a firearm, or firearm ammunition within the Property, in a vehicle in a parking area Landlord provides for tenants, or in other areas Landlord controls to the extent necessary to directly enter or exit those places. If Landlord requires it, Tenant will keep a firearm concealed, holstered, or in a carrying container while moving it between a vehicle and the Property and while in common areas such as elevators and shared hallways. Any house rule or other term of this Lease that conflicts with this paragraph does not apply.",
      cite: "Tenn. Code Ann. §§ 66-7-113, 66-28-206 (2026 Tenn. Pub. Acts ch. 606)",
    },
  ],

  fairHousing: {
    stateClasses: ["creed"],
    cite: "Tenn. Code Ann. § 4-21-601 (Tennessee Human Rights Act: race, color, creed, religion, sex, disability, familial status, national origin)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a court action for forcible entry and detainer or unlawful detainer under Tenn. Code Ann. Title 29, Chapter 18, and a writ of possession may not issue until 10 days after a judgment for possession. Landlord will not lock Tenant out, shut off utilities or other essential services, or remove Tenant's belongings without a court order, except as Tennessee law allows for an abandoned or surrendered unit.",
    cite: "Tenn. Code Ann. §§ 29-18-101 et seq., 29-18-126; § 66-28-511",
  },

  habitability: {
    rule:
      "Landlord will comply with the building and housing codes that materially affect health and safety, make all repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition, keep all common areas clean and safe, and, in a complex of four or more units, provide and maintain receptacles for removing garbage and other waste from common collection points.",
    cite: "Tenn. Code Ann. § 66-28-304",
  },

  // Carried over from the TN template that was live before 2026-11-08 (business
  // terms, not statutory requirements) so the rebuild doesn't silently drop them.
  additionalClauses: [
    {
      title: "Rent Increases (Landlord's Voluntary Limit)",
      text:
        "No rent increase takes effect during the first 24 months of continuous tenancy, including any renewal or month-to-month continuation. After that, Landlord may increase the rent by no more than three percent (3%) in any 12-month period, and only on at least 60 days' written notice. Tennessee has no statewide rent control; this limit is Landlord's voluntary commitment and is enforceable as a term of this Lease.",
    },
    {
      title: "Attorney Fees and Court Costs",
      text:
        "If either party files a lawsuit arising out of this Lease, the prevailing party may recover reasonable attorney fees actually incurred and court costs from the other party, subject to any limit imposed by Tennessee law.",
    },
  ],

  sources: [
    { cite: "Tenn. Code Ann. § 66-28-102", url: URLTA("1", "66-28-102") },
    { cite: "Tenn. Code Ann. § 66-28-103", url: URLTA("1", "66-28-103") },
    { cite: "Tenn. Code Ann. § 66-28-104", url: URLTA("1", "66-28-104") },
    { cite: "Tenn. Code Ann. § 66-28-106", url: URLTA("1", "66-28-106") },
    { cite: "Tenn. Code Ann. § 66-28-107", url: URLTA("1", "66-28-107") },
    { cite: "Tenn. Code Ann. § 66-28-108", url: URLTA("1", "66-28-108") },
    { cite: "Tenn. Code Ann. § 66-28-201", url: URLTA("2", "66-28-201") },
    { cite: "Tenn. Code Ann. § 66-28-203", url: URLTA("2", "66-28-203") },
    { cite: "Tenn. Code Ann. § 66-28-205", url: URLTA("2", "66-28-205") },
    { cite: "Tenn. Code Ann. § 66-28-301", url: URLTA("3", "66-28-301") },
    { cite: "Tenn. Code Ann. § 66-28-302", url: URLTA("3", "66-28-302") },
    { cite: "Tenn. Code Ann. § 66-28-303", url: URLTA("3", "66-28-303") },
    { cite: "Tenn. Code Ann. § 66-28-304", url: URLTA("3", "66-28-304") },
    { cite: "Tenn. Code Ann. § 66-28-305", url: URLTA("3", "66-28-305") },
    { cite: "Tenn. Code Ann. § 66-28-401", url: URLTA("4", "66-28-401") },
    { cite: "Tenn. Code Ann. § 66-28-403", url: URLTA("4", "66-28-403") },
    { cite: "Tenn. Code Ann. § 66-28-404", url: URLTA("4", "66-28-404") },
    { cite: "Tenn. Code Ann. § 66-28-405", url: URLTA("4", "66-28-405") },
    { cite: "Tenn. Code Ann. § 66-28-501", url: URLTA("5", "66-28-501") },
    { cite: "Tenn. Code Ann. § 66-28-502", url: URLTA("5", "66-28-502") },
    { cite: "Tenn. Code Ann. § 66-28-503", url: URLTA("5", "66-28-503") },
    { cite: "Tenn. Code Ann. § 66-28-504", url: URLTA("5", "66-28-504") },
    { cite: "Tenn. Code Ann. § 66-28-505", url: URLTA("5", "66-28-505") },
    { cite: "Tenn. Code Ann. § 66-28-507", url: URLTA("5", "66-28-507") },
    { cite: "Tenn. Code Ann. § 66-28-510", url: URLTA("5", "66-28-510") },
    { cite: "Tenn. Code Ann. § 66-28-511", url: URLTA("5", "66-28-511") },
    { cite: "Tenn. Code Ann. § 66-28-512", url: URLTA("5", "66-28-512") },
    { cite: "Tenn. Code Ann. § 66-28-513", url: URLTA("5", "66-28-513") },
    { cite: "Tenn. Code Ann. § 66-28-514", url: URLTA("5", "66-28-514") },
    { cite: "Tenn. Code Ann. § 66-28-517", url: URLTA("5", "66-28-517") },
    { cite: "Tenn. Code Ann. § 66-7-102", url: JUSTIA("66", "7", null, "66-7-102") },
    { cite: "Tenn. Code Ann. § 66-7-104", url: JUSTIA("66", "7", null, "66-7-104") },
    { cite: "Tenn. Code Ann. § 66-7-107", url: JUSTIA("66", "7", null, "66-7-107") },
    { cite: "Tenn. Code Ann. § 66-7-109", url: JUSTIA("66", "7", null, "66-7-109") },
    { cite: "Tenn. Code Ann. § 66-7-110", url: JUSTIA("66", "7", null, "66-7-110") },
    { cite: "Tenn. Code Ann. § 66-7-112", url: JUSTIA("66", "7", null, "66-7-112") },
    { cite: "Tenn. Code Ann. § 66-35-102", url: JUSTIA("66", "35", null, "66-35-102") },
    { cite: "Tenn. Code Ann. § 4-21-601", url: JUSTIA("4", "21", "6", "4-21-601") },
    { cite: "Tenn. Code Ann. § 4-21-602", url: JUSTIA("4", "21", "6", "4-21-602") },
    { cite: "Tenn. Code Ann. § 29-18-101", url: "https://law.justia.com/codes/tennessee/title-29/chapter-18/section-29-18-101/" },
    { cite: "Tenn. Code Ann. § 29-18-102", url: "https://law.justia.com/codes/tennessee/title-29/chapter-18/section-29-18-102/" },
    { cite: "Tenn. Code Ann. § 29-18-104", url: "https://law.justia.com/codes/tennessee/title-29/chapter-18/section-29-18-104/" },
    { cite: "Tenn. Code Ann. § 29-18-113", url: "https://law.justia.com/codes/tennessee/title-29/chapter-18/section-29-18-113/" },
    { cite: "Tenn. Code Ann. § 29-18-115", url: "https://law.justia.com/codes/tennessee/title-29/chapter-18/section-29-18-115/" },
    { cite: "Tenn. Code Ann. § 29-18-126", url: "https://law.justia.com/codes/tennessee/title-29/chapter-18/section-29-18-126/" },
    { cite: "Tenn. Code Ann. § 36-3-601", url: JUSTIA("36", "3", "6", "36-3-601") },
    { cite: "Tenn. Code Ann. § 71-4-1102", url: JUSTIA("71", "4", "11", "71-4-1102") },
    { cite: "Tenn. Code Ann. §§ 58-1-226, 58-1-604 and Title 58 Chapters 1 and 3 section listings (no servicemember lease statute found)", url: "https://law.justia.com/codes/tennessee/title-58/" },
    { cite: "Tenn. Code Ann. § 68-212-503", url: JUSTIA("68", "212", "5", "68-212-503") },
    { cite: "2026 Tenn. Pub. Acts ch. 606 (SB 350 / HB 469), enrolled text = House Amendment 1 (HA0604), creating §§ 66-7-113 and 66-28-206", url: "https://www.capitol.tn.gov/Bills/114/Amend/HA0604.pdf" },
    { cite: "2026 Tenn. Pub. Acts ch. 606 bill history (effective date, concurrence)", url: "https://wapp.capitol.tn.gov/apps/BillInfo/default.aspx?BillNumber=SB0350&GA=114" },
    { cite: "114th General Assembly Landlord and Tenant subject index (enacted bills check)", url: "https://wapp.capitol.tn.gov/apps/Indexes/BillsBySubject?PrimarySubject=2695&ga=114" },
  ],

  reviewNotes: [
    "URLTA SCOPE (most important): Title 66, Chapter 28 applies only in counties with a population over 75,000 under the 2010 federal census (§ 66-28-102(a) as amended by 2021 Pub. Ch. 182). The generator does not know the county. This profile therefore states URLTA rules (deposit account and damage-listing procedure, 5-day grace / 10% late-fee cap, 30-day month-to-month notice, 14-day cure, entry rules, re-letting duty, habitability duty, owner/agent and insurance disclosures) as binding lease terms everywhere; that is lawful in non-URLTA counties because it only gives tenants the URLTA protections by contract. Rights that exist only by statute in URLTA counties and that we did NOT promise contractually statewide (unlawful ouster § 66-28-504; harassing entry § 66-28-513(b)) are labelled 'URLTA counties'. Attorney should decide whether to extend those two statewide by contract. Believed URLTA counties from 2010 census figures (NOT verified against census tables in this research): Shelby, Davidson, Knox, Hamilton, Rutherford, Williamson, Montgomery, Sumner, Sullivan, Blount, Washington, Wilson, Bradley, Madison, Sevier, Maury, Anderson. Consider adding a county field so the lease can state which regime applies.",
    "Statewide (non-URLTA) rules that DO apply everywhere: DV/sexual assault/stalking termination (§ 66-7-112, a statewide duplicate of § 66-28-205), physical-disability public-housing termination (§ 66-7-110), casualty surrender (§ 66-7-102, waivable by express written agreement), eviction notice periods in non-URLTA counties (§ 66-7-109: 14 days for nonpayment upon demand or damage beyond wear and tear, with cure; 30 days for all other defaults; 3 days for violence/drug activity; § 66-7-109(g) excludes URLTA counties), FED procedure (Title 29, Ch. 18), fair housing (§ 4-21-601), firearms (§ 66-7-113 from 1/1/2027).",
    "DEPOSIT RETURN DEADLINE: Tennessee has NO statutory deadline to refund a deposit. § 66-28-301(f) only requires the landlord to send notice of the refund amount to the last known address; if the tenant does not respond within 60 days, the landlord may keep the deposit. § 66-28-301(g) limits charges for physical damage to damage discovered before the earlier of 30 days after move-out or 7 days after a new tenant takes possession. returnDays = 30 is a Keycove contractual commitment, not a statutory number; the lease says so. We intentionally did NOT write the 60-day forfeiture into the lease (it is tenant-adverse and moot if Landlord pays the refund with the notice). § 66-28-301(c): a landlord who fails to use a segregated account AND fails to provide the damage listing may retain nothing.",
    "OMITTED STATUTORY WAIVERS (tenant-adverse; brief forbids waiver language): (1) § 66-28-301(b)(1)(A): a tenant who schedules but misses the move-out inspection waives the right to contest damages ONLY if notice of that waiver is in the lease; (2) § 66-28-505(b) and § 66-28-201(c): a tenant may waive the 14-day nonpayment notice if the waiver is in the lease in 12-point bold or larger (grace period still applies). Neither is included. Attorney/business decision whether to add either as an optional landlord-selected clause.",
    "§ 66-28-505(a)(2)(A): a landlord's 14-day cure notice for a breach remediable by repairs must tell the tenant that repairs need the landlord's prior written authorization. This is a notice-content requirement for Keycove's notice templates (not the lease). Recurrence rule: 7 days (URLTA § 66-28-505(a)(2)(B)) vs 14 days (non-URLTA § 66-7-109(a)(2)). Non-URLTA: § 29-18-113 says no notice to quit is needed beyond the detainer warrant, which sits uneasily with § 66-7-109's 14/30-day 'sufficient notice' language; the conservative reading (give the § 66-7-109 notice) is used.",
    "DV TERMINATION (§§ 66-7-112 / 66-28-205): requires a 'mutually agreed upon release date within the next thirty (30) days' — the statute does not say what happens if the landlord will not agree; the tenant must vacate within 30 days of notice regardless. Liability is rent for the FULL month in which the tenancy terminates (not prorated). Only order-of-protection (after hearing, preponderance finding) or criminal-charge documentation based on a police report qualifies; ex parte orders and third-party certifications do not. Documentation must be dated within 60 days before the notice. Co-tenants are not released. Human trafficking victims are not covered. Applies to leases entered into or renewed on or after July 1, 2021. Non-waivable except the move-out timing in (b)(4).",
    "MILITARY: No Tennessee statute gives servicemembers or National Guard members on state active duty a lease-termination right. Searched Title 58 (Ch. 1 Parts 1, 2, 6; Ch. 3 section listings; read §§ 58-1-226, 58-1-604) and Title 66 Ch. 7 and Ch. 28 section listings. Only the federal SCRA applies (handled by generator). Fort Campbell (Montgomery County) and Arnold AFB (Coffee/Franklin) tenants rely on SCRA alone.",
    "LANDLORD NONCOMPLIANCE: Tennessee's § 66-28-501 is narrower than the uniform act — it gives damages, injunctive relief and attorney fees after 14 days' written notice, and (b) refers to termination 'for noncompliance after sufficient notice' without expressly granting a tenant termination right. Not listed as a protected termination right; attorney to advise. Essential-services remedies (§ 66-28-502: repair-and-deduct, diminution, substitute housing) are not termination rights and are not stated in the lease.",
    "MITIGATION: statute in URLTA counties (§ 66-28-507(c), triggered by abandonment). In non-URLTA counties the duty rests on case law that was not located in a primary source in this research; the lease commits to the same duty everywhere. Early termination fee: Tennessee has no statutory cap; the generator's 2-month liquidated-damages default should be reviewed under Tennessee's general penalty/liquidated-damages case law.",
    "ENTRY: § 66-28-403 sets no notice period for ordinary entry; the only statutory notice is 24 hours for showings to prospective tenants in the final 30 days, and that access right exists only if 'set forth in the rental agreement' (§ 66-28-403(e)(5)) — the entryRule sets it forth. The general 24-hour notice is contractual. § 66-28-403(e) otherwise limits access to court order, the listed purposes, §§ 66-28-506 and 66-28-507(b), abandonment/surrender, and tenant death, incapacity or incarceration.",
    "LATE FEE: 10% cap is of 'the amount of rent past due', not of monthly rent; compute.ts's lateFeeCap() uses monthly rent, which over-allows on a partial late payment. The cap and grace period are URLTA-only by statute; the lease applies them everywhere.",
    "FIREARMS (2026 Pub. Ch. 606): new §§ 66-7-113 and 66-28-206, effective January 1, 2027, applying to agreements entered into, amended, extended, or renewed on or after that date. Landlord may not prohibit lawful firearm possession in the unit, tenant parking, or necessary access routes; may require concealment/holstering/container in transit and in common areas. Tenants may sue for injunctive relief, actual and punitive damages, and attorney fees. Codified text is not yet on Justia; read from the enrolled House Amendment 1 (HA0604), which the Senate concurred in on 3/13/2026. Co-living house rules ({{co_living_rules}}) written by landlords must not ban firearms for 2027+ leases and renewals — consider a validation warning.",
    "OWNER/AGENT DISCLOSURE (§ 66-28-302, amended 2024 Pub. Ch. 907): requires the name and address of the managing agent (may be a management company) AND of an owner or agent for service of process, plus a maintenance phone/email OR an online landlord-tenant portal. The disclosure relies on {{landlord_name}}/{{landlord_address}} and on the Keycove portal as the online portal. If a third-party manager differs from the owner, or if Keycove's portal does not actually accept maintenance requests for this tenant, the text must change. {{landlord_email}} is excluded from the residential variable list in builder.ts, so it was not used.",
    "FAIR HOUSING: the THRA housing provision (§ 4-21-601) adds only 'creed' to the federal classes. No state source-of-income, sexual orientation, gender identity, marital status, age, or military-status protection in housing. Exemptions (§ 4-21-602) include owner-occupied buildings of two units or fewer and renting a single room in the owner's own residence (relevant to co-living). 2025 Pub. Ch. 471 amended §§ 4-21-601/602; the 2025 Justia text reflects it.",
    "LOCAL LAW: Rent control and mandatory affordable set-asides by local governments are prohibited statewide (§ 66-35-102). In URLTA counties, § 66-28-102(e) preempts county landlord-tenant regulation that conflicts with or adds to URLTA. Nashville-Davidson County requires residential landlord registration with Metro Codes (§ 66-28-107: $10/yr; $50/week fine) — a landlord compliance item, not a lease term. Memphis/Shelby, Knoxville, Chattanooga have no known rent-control/just-cause rules (state preemption).",
    "OTHER: § 66-28-404 lets the lease require notice of an absence over 7 days (not included; optional landlord clause). § 66-28-517 / § 66-7-109(d): 3-day termination for violent acts or real and present danger (URLTA: also hazardous/unsanitary conditions and unauthorized occupants), with domestic-abuse-victim protections in § 66-28-517(g) / § 66-7-109(e) — relevant to Keycove's eviction-notice tooling. § 68-212-503: offering a methamphetamine-quarantined property for habitation is a crime (no lease disclosure requirement). § 66-28-108: notices may be emailed only if the tenant provided an email address in the lease and the landlord may not require one as a condition of renting; the builder's general notice clause should be checked against this.",
    "Primary-source caveat: Justia's 2025 Tennessee Code was used (reflects acts through the 2025 session). 2026-session landlord-tenant enactments were checked via the General Assembly's subject index for the 114th GA: only Pub. Ch. 606 (firearms) and Pub. Ch. 657 (eviction-service video) were enacted; neither changes the values above other than the firearms clause. Acts under other subject headings could have been missed.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
