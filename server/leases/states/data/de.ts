import type { StateLawProfile } from "../types";

const DELCODE = (ch: string) => `https://delcode.delaware.gov/title25/${ch}/index.html`;

export const DE: StateLawProfile = {
  code: "DE",
  name: "Delaware",
  framework: "Delaware Residential Landlord-Tenant Code, 25 Del. C. §§ 5101 et seq. (Part III of Title 25)",

  deposit: {
    maxMonths: 1,
    capRule:
      "For a rental agreement of one year or more, the security deposit may not exceed one month's rent. For a month-to-month or undefined-term tenancy, the deposit may not exceed one month's rent once the tenancy has lasted one year, and Landlord must then immediately credit to Tenant any amount above one month's rent (counting any surety bond). These limits do not apply to furnished units. A separate pet deposit of no more than one month's rent may be charged, but no pet deposit may be charged for a certified and trained support animal for a disabled resident.",
    capCite: "25 Del. C. § 5514(a), (i)",
    returnDays: 20,
    returnRule:
      "Within 20 days after this Lease ends or is terminated, Landlord shall return the security deposit, or give Tenant an itemized list of damages to the Property with the estimated cost of repairing each item together with payment of the difference between the deposit and those costs. If Landlord does not provide the itemized list within 20 days, Landlord is treated as acknowledging that no payment for damages is due. Tenant's acceptance of a payment sent with an itemized list is agreement to the listed damages unless Tenant objects in writing within 10 days after receiving it. Landlord sends the deposit and notices to the address Tenant gives in this Lease or to a forwarding address Tenant provides in writing at or before the end of the tenancy. The deposit may be applied only to damage beyond normal wear and tear that cannot be corrected by painting and ordinary cleaning, unpaid rent and late charges, and the limited re-renting expenses allowed by law.",
    returnCite: "25 Del. C. § 5514(c), (e)–(h)",
    holdingRule:
      "Landlord shall place the security deposit in an escrow bank account, designated as a security deposits account and not used in the operation of any business, at a federally insured banking institution with an office in Delaware that accepts deposits. Landlord shall disclose the location of the security deposit account to Tenant.",
    holdingCite: "25 Del. C. § 5514(b)",
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: 5,
    capType: "percent",
    capPercent: 5,
    capRule:
      "A late charge may not exceed 5% of the monthly rent and may not be imposed within 5 days after the rent due date. If Landlord does not maintain an office or other permanent place in the county where the Property is located at which rent may be timely paid, the due date is extended by 3 days.",
    cite: "25 Del. C. § 5501(d)",
  },

  notice: {
    monthToMonthDays: 60,
    monthToMonthRule:
      "Either Landlord or Tenant may end a month-to-month tenancy by giving the other at least 60 days' written notice, and the 60-day period begins on the first day of the month after the notice is actually received. To end a fixed-term lease at its expiration, Landlord must give at least 60 days' written notice before the end of the term, and Tenant may do so by giving at least 60 days' written notice before the end of the term. For a lease of one year or more, if Landlord does not give 60 days' notice and Tenant does not give at least 45 days' notice, the tenancy continues month-to-month on the same terms.",
    monthToMonthCite: "25 Del. C. §§ 5106(c)–(d), 5108(a)",
    nonpaymentDays: 7,
    nonpaymentRule:
      "If rent is not paid, after the 5-day late-fee grace period has passed Landlord may give Tenant a written demand stating that Landlord may file a court action to terminate this Lease unless the past-due rent is paid within the time stated in the notice, which must be at least 7 days after the notice is given or sent. If Tenant, or someone on Tenant's behalf, pays all rent due before Landlord files, Landlord may not file a summary possession action based on that nonpayment, and Landlord may not refuse a rent payment made by or on behalf of Tenant.",
    nonpaymentCite: "25 Del. C. § 5502",
    entryHours: 48,
    entryRule:
      "Tenant will not unreasonably refuse Landlord entry to inspect, make necessary repairs, decorations, alterations or improvements, supply agreed services, or show the Property to prospective purchasers, mortgagees, or tenants. Landlord shall give Tenant at least 48 hours' notice before entering, except for repairs Tenant has requested, and shall enter only between 8:00 a.m. and 9:00 p.m. Landlord may enter at any time in an emergency. Landlord will not abuse the right of entry or use it to harass Tenant. Tenant may waive the 48-hour notice only for showings to prospective tenants or purchasers, and only in a separate signed addendum or document.",
    entryCite: "25 Del. C. § 5509",
  },

  earlyTermination: {
    military: {
      label: "Entry into active military service (Delaware law)",
      cite: "25 Del. C. § 5314(b)(5)",
      eligible:
        "Tenant may terminate this Lease if, after signing it, Tenant enters the military service of the United States on active duty.",
      notice:
        "Tenant gives Landlord at least 30 days' written notice, and the 30-day period begins on the first day of the month after Landlord actually receives the notice.",
      documentation: "",
      liability:
        "Tenant owes rent through the termination date, after which the parties' duties under this Lease end. Tenant does not owe the early termination fee. Delaware law limits any reimbursement for Landlord's reasonable expenses of renovating and re-renting the Property caused by this termination to no more than one month's rent.",
    },
    domesticViolence: {
      label: "Domestic abuse, sexual offenses, or stalking",
      cite: "25 Del. C. §§ 5314(b)(6), 5141",
      eligible:
        "Tenant may terminate this Lease if Tenant is a victim of domestic abuse, a sexual offense, or stalking, or has obtained or is seeking relief from domestic violence or abuse from any court, police agency, or domestic violence program or service.",
      notice:
        "Tenant gives Landlord at least 30 days' written notice, and the 30-day period begins on the first day of the month after Landlord actually receives the notice.",
      documentation:
        "The abuse, sexual offense, or stalking may be verified by an official document such as a court order, or by a statement from a reliable third-party professional such as a law enforcement agency or officer, a domestic violence or sexual assault service provider, or a health care provider. It is Tenant's responsibility to provide the statement from the third party.",
      liability:
        "Tenant owes rent through the termination date, after which the parties' duties under this Lease end. Tenant does not owe the early termination fee. Delaware law limits any reimbursement for Landlord's reasonable expenses of renovating and re-renting the Property caused by this termination to no more than one month's rent. Landlord may not evict, raise rent, reduce services, or otherwise force out a tenant because the tenant is a victim who has sought help for domestic abuse, sexual offenses, or stalking.",
    },
    other: [
      {
        label: "Job relocation, serious illness, or death in the family",
        cite: "25 Del. C. § 5314(b)(1)–(2)",
        eligible:
          "Tenant may terminate this Lease if a change in the location of Tenant's employment with Tenant's present employer requires Tenant to move more than 30 miles, or if the serious illness of Tenant, or the death or serious illness of a member of Tenant's immediate family living in the Property, requires Tenant to move permanently.",
        notice:
          "Tenant gives Landlord at least 30 days' written notice, and the 30-day period begins on the first day of the month after Landlord actually receives the notice.",
        documentation: "",
        liability:
          "Tenant owes rent through the termination date and no early termination fee. Any reimbursement for Landlord's reasonable renovation and re-renting expenses caused by the termination may not exceed one month's rent.",
      },
      {
        label: "Admission to senior, retirement, or subsidized housing",
        cite: "25 Del. C. § 5314(b)(3)–(4)",
        eligible:
          "Tenant may terminate this Lease if Tenant is accepted for admission to a senior citizens' housing facility (including subsidized public or private housing), a group or cooperative living facility, or a retirement home, or is accepted for admission into a rental unit subsidized by a government entity or a private nonprofit corporation.",
        notice:
          "Tenant gives Landlord at least 30 days' written notice, and the 30-day period begins on the first day of the month after Landlord actually receives the notice.",
        documentation: "",
        liability:
          "Tenant owes rent through the termination date and no early termination fee. Any reimbursement for Landlord's reasonable renovation and re-renting expenses caused by the termination may not exceed one month's rent.",
      },
      {
        label: "Death of Tenant",
        cite: "25 Del. C. § 5314(b)(7)",
        eligible:
          "If Tenant dies, Tenant's surviving spouse or the personal representative of Tenant's estate may terminate this Lease.",
        notice:
          "The surviving spouse or personal representative gives Landlord at least 30 days' written notice, and the 30-day period begins on the first day of the month after Landlord actually receives the notice.",
        documentation: "",
        liability:
          "Rent is owed through the termination date and no early termination fee is owed. Any reimbursement for Landlord's reasonable renovation and re-renting expenses caused by the termination may not exceed one month's rent.",
      },
      {
        label: "Uninhabitable conditions or loss of essential services",
        cite: "25 Del. C. §§ 5306, 5308",
        eligible:
          "Tenant may terminate this Lease if a condition deprives Tenant of a substantial part of the benefit of the bargain and Landlord does not remedy it within 15 days after receiving written notice, or immediately after notice if the condition makes the Property uninhabitable or poses an imminent threat to health or safety. Tenant may also terminate if Landlord substantially fails to provide hot water, heat, water, or electricity for 48 hours or more after Tenant gives actual or written notice. These rights do not apply to a condition caused by the lack of due care of Tenant, a family member, or a guest.",
        notice:
          "Tenant gives Landlord written notice of the condition and, where required, written notice of termination.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee. If Landlord caused the condition willfully or negligently, Tenant may recover the greater of the extra cost of equivalent substitute housing for the rest of the term or one month's rent plus the security deposit.",
      },
      {
        label: "Fire or casualty",
        cite: "25 Del. C. § 5309",
        eligible:
          "If the Property is damaged or destroyed by fire or casualty, without fault of Tenant, a member of Tenant's family, or a guest, so that enjoyment of the Property is substantially impaired, Tenant may immediately move out.",
        notice:
          "Tenant notifies Landlord in writing of the election to quit within one week after vacating, and this Lease ends on the date Tenant vacates. If Tenant does not give that notice, Tenant owes rent until Landlord actually learns that Tenant has vacated or that occupancy is impossible.",
        documentation: "",
        liability:
          "Tenant owes rent only up to the date of the fire or casualty and no early termination fee. Landlord shall promptly return the security deposit, pet deposit, and prepaid rent except amounts Landlord may lawfully keep.",
      },
      {
        label: "Unlawful ouster by Landlord",
        cite: "25 Del. C. § 5313",
        eligible:
          "If Landlord or Landlord's agent removes or excludes Tenant from the Property without a valid court order, Tenant may recover possession or terminate this Lease.",
        notice: "No advance notice period is required.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee, and Tenant may recover the greater of three times the damages sustained or three times the daily rent for the period Tenant was excluded, plus court costs.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "25 Del. C. § 5507(d)",
      rule:
        "If Tenant wrongfully moves out early, Landlord has a duty to mitigate damages, and Tenant is liable for no more than the lesser of (1) the rent for the rest of the term plus actual damage caused by Tenant beyond normal wear and tear, or (2) rent for the period reasonably needed to re-rent at a fair rental, plus any difference between the fair rental and the rent in this Lease, plus re-renting expenses, repair of damage beyond normal wear and tear, and a reasonable commission if Landlord incurs one.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner and Agent Identity",
      text:
        "The names and usual business addresses of all owners of the Property (or their appointed resident agents), and of any person acting as Landlord, are stated in this Lease. Landlord will give Tenant a copy of this signed Lease free of charge.",
      cite: "25 Del. C. § 5105",
    },
    {
      id: "landlord_tenant_code_summary",
      title: "Summary of the Landlord-Tenant Code",
      text:
        "At the beginning of the rental term Landlord will give Tenant the summary of the Delaware Residential Landlord-Tenant Code prepared by the Consumer Protection Unit of the Attorney General's Office. If Landlord fails to provide it, Tenant may plead ignorance of the law as a defense.",
      cite: "25 Del. C. § 5118",
    },
    {
      id: "right_to_counsel_notice",
      title: "Information on Legal Representation for Tenants",
      text:
        "When this Lease is signed, Landlord will give Tenant the informational materials approved by the Right to Representation Coordinator explaining the legal representation available to tenants, including the right to representation in eviction proceedings, and available resources. Landlord will provide the same materials again with any past-due rent notice, breach notice, or termination notice covered by law.",
      cite: "25 Del. C. §§ 5602(b)(1), 5606",
    },
    {
      id: "deposit_account_location",
      title: "Security Deposit Account",
      text:
        "Landlord will disclose to Tenant the location of the security deposit escrow account. If Landlord fails to disclose the location within 20 days after Tenant's written request, or fails to keep the deposit in a federally insured institution with an office in Delaware that accepts deposits, Landlord forfeits the security deposit to Tenant.",
      cite: "25 Del. C. § 5514(b), (g)(2)",
    },
    {
      id: "bed_bugs",
      title: "Bed Bugs",
      text:
        "Before renting, Landlord has visually inspected the Property for evidence of bed bugs and will disclose to Tenant whether any adjacent unit is currently infested with or being treated for bed bugs. Landlord will not rent a unit Landlord knows or reasonably suspects has a current bed bug infestation. If Tenant reports a suspected infestation within 60 days after move-in, or within 30 days after an infestation is discovered in an adjoining unit, Landlord pays the costs of investigation and remediation; after that, Landlord remains responsible for investigation and remediation but Tenant shares in the reasonable cost of remediating Tenant's unit.",
      cite: "25 Del. C. § 5317",
    },
    {
      id: "no_nonrefundable_fees",
      title: "No Nonrefundable Fees",
      text:
        "Except for optional fees for services actually rendered (such as a pool or tennis court fee), Landlord does not charge any nonrefundable fee as a condition of occupancy. Any application fee may not exceed the greater of 10% of the monthly rent or $50.",
      cite: "25 Del. C. §§ 5311, 5514(d)",
    },
  ],

  fairHousing: {
    stateClasses: [
      "creed",
      "marital status",
      "sexual orientation",
      "gender identity",
      "age",
      "source of income",
      "military status",
      "housing status",
      "occupation",
    ],
    cite: "6 Del. C. § 4603(b); 25 Del. C. § 5116",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a summary possession action in the Justice of the Peace Court under Chapter 57 of Title 25 and a writ of possession issued by that court. Landlord will not remove or exclude Tenant from the Property, change the locks, or remove Tenant's belongings without a valid court order.",
    cite: "25 Del. C. §§ 5702, 5715, 5313",
  },

  habitability: {
    rule:
      "Landlord shall at all times during the tenancy comply with all applicable state and local codes governing the maintenance, construction, use, and appearance of the Property; provide a unit that does not endanger the health, welfare, or safety of the occupants and is fit for the purpose for which it is rented; keep common areas clean and sanitary; make all repairs needed to keep the Property in as good a condition as it was, or should have been, at the start of the tenancy; and keep all electrical, plumbing, and other facilities Landlord supplies in good working order. Any agreement for Tenant to perform repairs must be in a conspicuous writing separate from this Lease and supported by separate consideration or a rent reduction.",
    cite: "25 Del. C. § 5305",
  },

  sources: [
    { cite: "25 Del. C. §§ 5101–5125 (Ch. 51, Subch. I, incl. §§ 5105, 5106, 5108, 5116, 5118, 5124, 5125)", url: "https://delcode.delaware.gov/title25/c051/sc01/index.html" },
    { cite: "25 Del. C. § 5141 (Definitions)", url: "https://delcode.delaware.gov/title25/c051/sc02/index.html" },
    { cite: "25 Del. C. §§ 5301–5317 (Ch. 53, incl. §§ 5301, 5302, 5305, 5306, 5308, 5309, 5310, 5311, 5313, 5314, 5316, 5317)", url: DELCODE("c053") },
    { cite: "25 Del. C. §§ 5401–5413 (Ch. 54, lead-safe certification; incl. §§ 5402, 5406)", url: DELCODE("c054") },
    { cite: "25 Del. C. §§ 5501–5518 (Ch. 55, incl. §§ 5501, 5502, 5507, 5509, 5513, 5514, 5514A, 5515, 5516)", url: DELCODE("c055") },
    { cite: "25 Del. C. §§ 5601–5607 (Ch. 56, right to representation)", url: DELCODE("c056") },
    { cite: "25 Del. C. §§ 5701–5720 (Ch. 57, summary possession; incl. §§ 5702, 5719)", url: DELCODE("c057") },
    { cite: "6 Del. C. §§ 4601–4619 (Delaware Fair Housing Act; §§ 4602, 4603)", url: "https://delcode.delaware.gov/title6/c046/index.html" },
    { cite: "85 Del. Laws c. 277 (2026; guide requirement, § 5124 implementation)", url: "https://legis.delaware.gov/legacy/SessionLaws/ga153/chp277.shtml" },
    { cite: "85 Del. Laws c. 98 (2025; lead-safe certification implementation dates)", url: "https://legis.delaware.gov/legacy/SessionLaws/ga153/chp098.shtml" },
    { cite: "Title 20, Del. C. (Military and Civil Defense), searched for lease provisions; none found", url: "https://delcode.delaware.gov/title20/title20.pdf" },
  ],

  reviewNotes: [
    "25 Del. C. § 5101(a) makes any rental agreement provision unenforceable insofar as it conflicts with the Code and 'is not expressly authorized herein.' The generator's optional liquidated early termination fee (default 2 months' rent) is not expressly authorized and may conflict with the § 5507(d) abandonment damages formula. Attorney should confirm the fee option is enforceable in Delaware, or whether DE leases should drop it or cap it. feeCap is null because the only statutory cap found (§ 5514(c)(3): renovation/re-renting reimbursement may not exceed 1 month's rent) applies only to § 5314 terminations, not to an ordinary lease break.",
    "Inconsistency to resolve in builder: § 5514(c)(3) expressly lets the landlord apply the deposit to reasonable renovation and re-renting expenses caused by a § 5314 termination (capped at 1 month's rent), but the builder's deposit paragraph promises not to apply the deposit to early termination damages after a paragraph (d) termination. The liability text in each § 5314 right states the statutory cap; the builder's promise is more tenant-protective, so it is not unlawful, but the two read inconsistently.",
    "§ 5314 does not itself require documentation for any ground (military, illness, job relocation, senior/subsidized housing). For DV, § 5141 says abuse 'can be verified' by a court order or a reliable third-party statement and puts the burden on the victim to supply it; I described that as the verification method rather than a strict condition. No co-tenant release rule and no explicit waiver-ban language in § 5314 itself, but § 5301(a)(1) bars any lease clause waiving Code rights.",
    "§ 5314 notice: 30 days, but the period starts on the first day of the month following actual notice, so effective notice is 30 to 61 days. Same structure for 60-day month-to-month notice under § 5106(d).",
    "End-of-term notice tension: § 5106(c) says a tenant 'may terminate' a fixed term by 60 days' written notice before expiration, while § 5108(a) converts a 1-year-plus lease to month-to-month only if the tenant fails to give 45 days' notice. Both are stated in monthToMonthRule; attorney should confirm which controls for tenants who give 45–59 days' notice.",
    "Deposit cap applies only to leases of 1 year or more and to month-to-month tenancies after 1 year; furnished units are uncapped; a separate pet deposit up to 1 month is allowed. maxMonths is set to 1 for the standard 12-month unfurnished lease. A short-term (<1 year) unfurnished lease has no statutory cap.",
    "Disclosures not yet in force, so not encoded: (1) § 5124 guide (85 Del. Laws c. 277, approved June 10, 2026) must be given to a prospective tenant before signing, with signed acknowledgment, once implemented — implementation is the earlier of June 10, 2027 or a Division of Professional Regulation notice; violation is a consumer-fraud unlawful practice. Add it to DE disclosures on implementation. (2) § 5406 lead-safe/lead-free certification disclosure in every lease for pre-1978 units, implemented no later than March 1, 2028 (85 Del. Laws c. 98 § 5).",
    "§ 5102 exclusions change on March 8, 2027 (new list; still excludes transient lodging and certified recovery houses). Co-living/room rentals are covered by the Code (rental unit = 'portion' of a structure occupied as a residence).",
    "§ 5502(c)–(d) (amended by 85 Del. Laws c. 436): landlord may not refuse rent paid by or on behalf of tenant and cannot maintain a nonpayment action once all rent due is paid, even after filing; after judgment landlord may require certified check or money order.",
    "No Delaware state statute giving National Guard members on state active duty lease-termination rights was found (searched Title 20 PDF for lease/rental/dwelling terms). Only § 5314(b)(5) (entering federal active duty after signing) applies.",
    "§ 5125 (key surrender): if the lease conditions deposit return on key surrender, it must contain a clear key-surrender procedure and may not require surrender before the end of the term. Builder's general text requires returning keys on early move-out; attorney should confirm a key-return procedure is stated somewhere if deposit return depends on it.",
    "§ 5123 tenant-employee disclosure form required if housing is part of employee compensation (not encoded). § 5301(a)(4): lease may not require declawing a cat. § 5111: attorney-fee clauses unenforceable. § 5121: confession of judgment void.",
    "Local: Wilmington and other municipalities have rental licensing/registration and inspection ordinances; no rent control in Delaware. Sussex County beach-area Hundreds exclude nonrenewable seasonal rentals of 120 days or less (§ 5102(4)).",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
