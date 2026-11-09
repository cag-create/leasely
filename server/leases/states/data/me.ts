import type { StateLawProfile } from "../types";

const MRS = (title: string, s: string) => `https://legislature.maine.gov/statutes/${title}/title${title}sec${s}.html`;

export const ME: StateLawProfile = {
  code: "ME",
  name: "Maine",
  framework:
    "Maine landlord-tenant law, 14 M.R.S. chapters 709 (Forcible Entry and Detainer), 710 (Rental Property), and 710-A (Security Deposits)",

  deposit: {
    maxMonths: 2,
    capRule:
      "A security deposit may not exceed two months' rent. Separately, when the tenancy begins, Landlord (or Landlord's agent or real estate broker) may not require Tenant to pay more in total than the first full month's rent, the security deposit, and any mandatory recurring fee that has been properly disclosed in a signed total price disclosure; Landlord therefore may not require last month's rent in advance. If Landlord agrees to accept a surety bond in place of all or part of the deposit (Landlord may offer but may not require one), the bond plus any deposit may not exceed two months' rent. The security deposit chapter does not apply to a unit in a building of five or fewer units, one of which Landlord occupies.",
    capCite: "14 M.R.S. §§ 6022-A, 6032, 6037, 6039",
    returnDays: 30,
    returnRule:
      "Within 30 days after this Lease ends (or, if Tenant remains as a tenant at will, within 21 days after the tenancy at will ends or Landlord accepts surrender of the Premises, whichever is later), Landlord will return the full security deposit or, if there is actual cause to keep any portion, give Tenant a written statement itemizing the reasons together with full payment of the balance. Landlord may not keep any part of the deposit for normal wear and tear. Reasons for keeping part of the deposit include unpaid rent, unpaid utility charges Tenant was required to pay directly to Landlord, damage beyond normal wear and tear, and the costs of storing and disposing of unclaimed property. Landlord complies by mailing the statement and payment to Tenant's last known address. If Landlord misses the deadline, Landlord forfeits the right to withhold any portion of the deposit; wrongful retention makes Landlord liable for double the amount wrongfully withheld plus reasonable attorney's fees and court costs, and Landlord bears the burden of proving a retention was not wrongful. Before suing, Tenant must give Landlord 7 days' notice of the intent to sue.",
    returnCite: "14 M.R.S. §§ 6031(1), 6033, 6034",
    holdingRule:
      "Landlord will not commingle the security deposit with Landlord's own assets. Landlord will hold it in an account at a bank or other financial institution under terms that place it beyond the claims of Landlord's creditors (including a foreclosing mortgagee or bankruptcy trustee) and that provide for its transfer to a later owner or to Tenant; a single escrow account may hold all tenants' deposits. On Tenant's request, Landlord will disclose the name of the institution and the account number. If any part of the deposit (or rent) is paid in cash, Landlord will give Tenant a written receipt at the time of payment showing the date, the amount, the party for whom payment is made, the period covered, that the payment is a security deposit (or rent), and the signature and legibly printed name of the person receiving it. If Landlord's interest in the Property ends, the person holding the deposit will, no later than the real estate closing in the case of a sale, transfer it with an accounting to the successor and mail Tenant notice of the transfer, the transferee's name and address, and a copy of the accounting, or else return it to Tenant.",
    holdingCite: "14 M.R.S. §§ 6022, 6035, 6038",
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: 15,
    capType: "percent",
    capPercent: 4,
    capRule:
      "may not exceed 4% of the amount due for one month, may be charged only if the rent is not paid within 15 days after it is due, and may be charged only because Landlord gave Tenant written notice when this Lease was entered into that a late fee of up to 4% of one month's rent may be charged",
    cite: "14 M.R.S. § 6028",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either party may end a tenancy at will (month-to-month tenancy) by written notice given at least 30 days in advance. If Tenant has paid rent through a date later than the date a 30-day notice would expire, the notice must expire on or after the date through which rent has been paid. A notice from Landlord must advise Tenant of the right to contest the termination in court and must have attached the form notice posted on the Maine Judicial Branch website. The 30-day notice may be waived in writing only at the time the notice is given.",
    monthToMonthCite: "14 M.R.S. §§ 6001(7), 6002",
    nonpaymentDays: 7,
    nonpaymentRule:
      "If Tenant is 7 days or more in arrears in rent, Landlord may terminate the tenancy by 7 days' written notice that states this specific ground, the amount of rent 7 or more days in arrears as of the date of the notice, and the following statement: \"If you pay the amount of rent due as of the date of this notice before this notice expires, then this notice as it applies to rent arrearage is void. After this notice expires, if you pay all rental arrears, all rent due as of the date of payment and any filing fees and service of process fees actually paid by the landlord before the writ of possession issues at the completion of the eviction process, then your tenancy will be reinstated.\" The notice must also advise Tenant of the right to contest the termination in court and attach the Judicial Branch form notice. Payment or written assurance of payment through the general assistance program counts as payment.",
    nonpaymentCite: "14 M.R.S. §§ 6001(7), 6002(1)(C), (2)",
    entryHours: 24,
    entryRule:
      "Except in an emergency (including an emergency involving an animal's welfare) or where it is impracticable, Landlord will give Tenant reasonable notice of Landlord's intent to enter, with 24 hours presumed reasonable, and will enter only at reasonable times. Tenant will not unreasonably withhold consent to entry to inspect the Premises, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show the Premises to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Tenant will not change the locks without notifying Landlord and giving Landlord a duplicate key within 48 hours; a tenant who is a victim of domestic violence, sexual assault, or stalking may change the locks at the tenant's expense and will give Landlord a duplicate key within 72 hours.",
    entryCite: "14 M.R.S. § 6025",
  },

  earlyTermination: {
    military: null,
    domesticViolence: {
      label: "Domestic violence, sexual assault, or stalking",
      cite: "14 M.R.S. §§ 6000, 6001(6), 6002(4)",
      eligible:
        "Tenant may terminate this Lease if Tenant is a victim of domestic violence, sexual assault, or stalking and terminates because of an incident or threat of domestic violence, sexual assault, or stalking.",
      notice:
        "Tenant gives Landlord written notice at least 30 days in advance if this Lease has a term of one year or more, or at least 7 days in advance if this Lease has a term of less than one year or the tenancy is at will.",
      documentation:
        "With the notice, Tenant provides documentation of the conduct, including the perpetrator's name. Acceptable documentation includes: a statement signed by a Maine-based sexual assault counselor, domestic violence advocate, or victim witness advocate; a statement signed by a health care provider, mental health care provider, or law enforcement officer, including the license number if licensed; a copy of a protection from abuse or protection from harassment complaint or temporary or final order; a copy of a police report about an incident of domestic violence, sexual assault, or stalking; or a copy of a criminal complaint, indictment, or conviction for such a charge.",
      liability:
        "Tenant is not liable for rent due after the date the notice expires or the date Tenant vacates, whichever is later, and owes no early termination fee; if Tenant prepaid rent for the month in which the tenancy ends, Landlord need not refund it. Tenant is not liable for damage to the Premises related to the domestic violence, sexual assault, or stalking beyond the value of the security deposit if the alleged perpetrator is a tenant and Tenant gives Landlord written notice of the damage and the documentation described above within 30 days after the damage occurs.",
    },
    other: [
      {
        label: "Sexual harassment by Landlord",
        cite: "14 M.R.S. § 6001(6)(D-1), (H)",
        eligible:
          "Tenant may terminate this Lease if Tenant is the victim of sexual harassment by Landlord or Landlord's agent.",
        notice:
          "Tenant gives Landlord written notice at least 30 days in advance if this Lease has a term of one year or more, or at least 7 days in advance if this Lease has a term of less than one year or the tenancy is at will.",
        documentation:
          "Tenant provides documentation of the conduct, including the perpetrator's name, of the same kinds accepted for domestic violence terminations (such as a statement from an advocate, health care provider, or law enforcement officer, a protection from harassment complaint or order, a police report, or a criminal complaint).",
        liability: "Tenant owes no rent for any period after the termination and no early termination fee.",
      },
      {
        label: "Elevated radon level",
        cite: "14 M.R.S. § 6030-D(8)",
        eligible:
          "If a radon test of the building conducted under Maine's rental radon law shows a radon level of 4.0 picocuries per liter of air or higher, either Landlord or Tenant may terminate this Lease.",
        notice: "The terminating party gives the other at least 30 days' notice.",
        documentation: "",
        liability:
          "Tenant owes rent only through the termination date and no early termination fee. Landlord may not keep any part of the security deposit because of the termination, apart from deductions for actual cause permitted by 14 M.R.S. § 6033.",
      },
    ],
    feeCap: {
      maxMonthsRent: null,
      rule:
        "Landlord will not charge any fee, penalty, or other charge for ending the tenancy except: reasonable expenses of securing another tenant when Tenant has breached this Lease's requirements for notice before ending the tenancy; unpaid rent owed to Landlord; and reasonable expenses of repairing damage Tenant caused to the Premises. A lease provision requiring any other charge for ending the tenancy is unenforceable. Keeping part of the security deposit for reasons permitted by 14 M.R.S. § 6033 is not such a charge.",
      cite: "14 M.R.S. § 6030(2)(E)",
    },
    mitigation: {
      basis: "statute",
      cite: "14 M.R.S. § 6010-A",
      rule:
        "If Tenant moves out before the end of the tenancy without justification and defaults in rent, or is removed for nonpayment or another breach, Landlord may recover rent and damages only after reducing them by the net rent obtainable through reasonable efforts to re-rent the Premises, meaning the steps Landlord would have taken to rent the Premises had they been vacated in due course, consistent with local rental practice for similar properties. Tenant is credited with rent actually received from a re-rental, less reasonable expenses, and Landlord may also recover reasonable listing and advertising expenses of re-renting. Landlord must show efforts to comply with this duty.",
    },
  },

  disclosures: [
    {
      id: "late_fee_notice",
      title: "Late Fee Notice",
      text:
        "Landlord may charge a late fee of up to 4% of one month's rent if rent is not paid within 15 days after it is due.",
      cite: "14 M.R.S. § 6028(3)",
      condition: "Only if this Lease provides for a late fee",
    },
    {
      id: "total_price_disclosure",
      title: "Total Price Disclosure",
      text:
        "Before entering into this Lease, Landlord gave Tenant, and both parties signed, a plain-language written disclosure of the total rent, any mandatory recurring fee, any optional recurring fee, any utility service costs (or, if Landlord could not obtain them, a residential rental energy efficiency disclosure statement), and any other cost Tenant will pay under this Lease, and each party received a copy. This Lease is unenforceable unless Landlord has received a signed copy of that disclosure.",
      cite: "14 M.R.S. §§ 6030(4), 6030-J",
      condition: "Required whenever Tenant will pay any mandatory recurring fee or optional recurring fee in addition to rent",
    },
    {
      id: "optional_recurring_fees",
      title: "Optional Recurring Fees",
      text:
        "Tenant may choose whether to use any service or property feature for which an optional recurring fee is charged, and may stop using it and stop paying the fee at any time without penalty. Landlord will not deny or terminate this Lease because Tenant opts out.",
      cite: "14 M.R.S. § 6030-I",
      condition: "Only if any optional recurring fee is charged",
    },
    {
      id: "smoking_policy",
      title: "Smoking Policy Disclosure",
      text:
        "This Lease states whether smoking is prohibited on the Premises, allowed on the entire Premises, or allowed only in limited areas, and, if allowed in limited areas, identifies those areas. Before signing this Lease or paying a deposit, Tenant acknowledged this smoking policy in writing.",
      cite: "14 M.R.S. § 6030-E",
    },
    {
      id: "radon",
      title: "Radon Disclosure",
      text:
        "Before Tenant signed this Lease or paid a deposit, Landlord gave Tenant written notice, on the form prescribed by the Maine Department of Health and Human Services, of the date and results of the most recent radon test of the building, whether mitigation has been performed to reduce radon, Tenant's right to conduct a radon test, and the risk associated with radon, and Tenant acknowledged receiving it. If a test shows radon at 4.0 picocuries per liter or more, either party may terminate this Lease on at least 30 days' notice.",
      cite: "14 M.R.S. § 6030-D(2), (8)",
      condition: "Not required for a building used exclusively for short-term rentals of 100 days or less with no renewal or extension",
    },
    {
      id: "energy_efficiency",
      title: "Residential Energy Efficiency Disclosure",
      text:
        "Before Tenant signed this Lease or paid a deposit, Landlord provided a residential energy efficiency disclosure statement under 35-A M.R.S. § 10117, signed by both parties, which Landlord will keep for at least 3 years. Tenant has the right to obtain from the energy supplier a 12-month history of energy consumption for the unit and the cost of that consumption.",
      cite: "14 M.R.S. § 6030-C",
      condition: "When Tenant will pay for an energy supply for the unit, or on Tenant's request",
    },
    {
      id: "bed_bugs",
      title: "Bedbug Disclosure",
      text:
        "Before renting the Premises, Landlord disclosed whether any adjacent unit is currently infested with or being treated for bedbugs. On request, Landlord will disclose the last date on which the Premises and any adjacent unit were inspected for bedbugs and found free of an infestation.",
      cite: "14 M.R.S. § 6021-A(2)(D)",
    },
    {
      id: "common_area_utilities",
      title: "Common Area Heat and Utilities",
      text:
        "Tenant has agreed in writing to pay for heat, electricity, or another utility serving common areas or areas outside Tenant's unit in return for a stated reduction in rent or other specified fair consideration that approximates the actual cost of providing that service.",
      cite: "14 M.R.S. § 6024",
      condition: "Only for a unit in a multi-unit building where Tenant will pay for a utility serving common areas or other areas outside the unit",
    },
    {
      id: "rent_increase_notice",
      title: "Rent and Fee Increases",
      text:
        "Landlord may increase rent or any mandatory recurring fee only after giving Tenant at least 45 days' written notice. If an increase, alone or combined with other rent increases in a 12-month period, totals 10% or more, Landlord will give at least 75 days' written notice.",
      cite: "14 M.R.S. § 6015",
    },
  ],

  fairHousing: {
    stateClasses: [
      "sexual orientation",
      "gender identity",
      "ancestry",
      "receipt of public assistance (including medical assistance and housing subsidies)",
      "having sought and received a protection from abuse or harassment order",
    ],
    cite: "5 M.R.S. § 4581-A",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Premises only through a forcible entry and detainer action in court under 14 M.R.S. chapter 709 after the tenancy has been properly terminated. Any eviction carried out without that process is illegal: Landlord will not willfully interrupt utility service (except temporarily during repairs or emergencies), deny Tenant access to the Premises, or seize or hold Tenant's property except through proper judicial process.",
    cite: "14 M.R.S. §§ 6001, 6002, 6014",
  },

  habitability: {
    rule:
      "Landlord warrants that the Premises are fit for human habitation and will not maintain or permit any condition on the Premises that endangers or materially impairs Tenant's health or safety. Offering for rent a unit with a leaking event or chronic moisture or humidity conditions outside Tenant's control that cause mold, bacteria, or other biological growth breaches this warranty. If Landlord provides heat, the heating facilities must be capable of maintaining at least 68 degrees Fahrenheit (measured 3 feet from exterior walls and 5 feet above the floor at an outside temperature of minus 20 degrees), unless the parties sign a separate, revocable heat agreement setting a minimum of at least 62 degrees with a fair rent reduction, which is not allowed if a person over 65 or under 5 lives in the unit. Within 5 days after notice of a possible bedbug infestation, Landlord will inspect the unit and, if bedbugs are found, will contact an insured, certified pest control agent within 10 days. Rent may not be increased while the unit violates the warranty of habitability, unless Tenant caused the violation.",
    cite: "14 M.R.S. §§ 6016, 6021, 6021-A, 6026",
  },

  sources: [
    { cite: "14 M.R.S. § 6000", url: MRS("14", "6000") },
    { cite: "14 M.R.S. § 6001", url: MRS("14", "6001") },
    { cite: "14 M.R.S. § 6002", url: MRS("14", "6002") },
    { cite: "14 M.R.S. § 6010", url: MRS("14", "6010") },
    { cite: "14 M.R.S. § 6010-A", url: MRS("14", "6010-A") },
    { cite: "14 M.R.S. § 6014", url: MRS("14", "6014") },
    { cite: "14 M.R.S. § 6015", url: "https://legislature.maine.gov/statutes/14/title14sec6015-2.html" },
    { cite: "14 M.R.S. § 6016", url: MRS("14", "6016") },
    { cite: "14 M.R.S. § 6016-A", url: MRS("14", "6016-A") },
    { cite: "14 M.R.S. § 6021", url: MRS("14", "6021") },
    { cite: "14 M.R.S. § 6021-A", url: MRS("14", "6021-A") },
    { cite: "14 M.R.S. § 6022", url: MRS("14", "6022") },
    { cite: "14 M.R.S. § 6022-A", url: MRS("14", "6022-A") },
    { cite: "14 M.R.S. § 6023", url: MRS("14", "6023") },
    { cite: "14 M.R.S. § 6024", url: MRS("14", "6024") },
    { cite: "14 M.R.S. § 6024-A", url: MRS("14", "6024-A") },
    { cite: "14 M.R.S. § 6025", url: MRS("14", "6025") },
    { cite: "14 M.R.S. § 6025-B", url: MRS("14", "6025-B") },
    { cite: "14 M.R.S. § 6026", url: MRS("14", "6026") },
    { cite: "14 M.R.S. § 6028", url: MRS("14", "6028") },
    { cite: "14 M.R.S. § 6030", url: MRS("14", "6030") },
    { cite: "14 M.R.S. § 6030-A", url: MRS("14", "6030-A") },
    { cite: "14 M.R.S. § 6030-B", url: MRS("14", "6030-B") },
    { cite: "14 M.R.S. § 6030-C", url: MRS("14", "6030-C") },
    { cite: "14 M.R.S. § 6030-D", url: MRS("14", "6030-D") },
    { cite: "14 M.R.S. § 6030-E", url: MRS("14", "6030-E") },
    { cite: "14 M.R.S. § 6030-H", url: MRS("14", "6030-H") },
    { cite: "14 M.R.S. § 6030-I", url: MRS("14", "6030-I") },
    { cite: "14 M.R.S. § 6030-J", url: MRS("14", "6030-J") },
    { cite: "14 M.R.S. § 6030-K", url: MRS("14", "6030-K") },
    { cite: "14 M.R.S. § 6031", url: MRS("14", "6031") },
    { cite: "14 M.R.S. § 6032", url: MRS("14", "6032") },
    { cite: "14 M.R.S. § 6033", url: MRS("14", "6033") },
    { cite: "14 M.R.S. § 6034", url: MRS("14", "6034") },
    { cite: "14 M.R.S. § 6035", url: MRS("14", "6035") },
    { cite: "14 M.R.S. § 6036", url: MRS("14", "6036") },
    { cite: "14 M.R.S. § 6037", url: MRS("14", "6037") },
    { cite: "14 M.R.S. § 6038", url: MRS("14", "6038") },
    { cite: "14 M.R.S. § 6039", url: MRS("14", "6039") },
    { cite: "14 M.R.S. § 6045", url: MRS("14", "6045") },
    { cite: "14 M.R.S. § 6046", url: MRS("14", "6046") },
    { cite: "5 M.R.S. § 4581", url: MRS("5", "4581") },
    { cite: "5 M.R.S. § 4581-A", url: MRS("5", "4581-A") },
    { cite: "37-B M.R.S. § 387", url: MRS("37-B", "387") },
    { cite: "37-B M.R.S. § 389-A", url: MRS("37-B", "389-A") },
  ],

  reviewNotes: [
    "Return deadline: 14 M.R.S. § 6033(2)(A) requires a written lease to state the return period, which may not exceed 30 days; the lease must actually state 30 days (or less). Tenancies at will get 21 days.",
    "Up-front payments: § 6022-A (2023 Me. Laws c. 594, effective 2024) caps move-in payments at first month's rent + deposit (max 2 months) + disclosed mandatory recurring fees, so the builder must not require prepaid last month's rent in Maine. Application fees are banned except the actual cost of one background, credit, or other screening check per 12 months, with a copy of the report to the applicant (§ 6030-H).",
    "Total price disclosure (§ 6030-J): if any mandatory or optional recurring fee is charged, a separate signed disclosure is required before signing, and § 6030(4) makes the lease unenforceable without it. Keycove should generate and collect this signature whenever fees (parking, pet rent, amenity fees, etc.) appear.",
    "Domestic violence rent liability: § 6001(6)(D) says a victim 'is not liable for any unpaid rent under the victim's lease', while § 6002(4) says the victim is not liable for rent 'beyond the date the notice expires or the date the victim vacates ... whichever is later' (no refund of prepaid rent for that month). I encoded the § 6002(4) reading because it is more specific; the attorney should consider whether § 6001(6)(D) also forgives past-due rent. Neither section addresses co-tenants. Waiver is void under § 6030(1).",
    "Early termination fees: § 6030(2)(E) (2023 Me. Laws c. 594) makes any lease charge for discontinuing tenancy unenforceable except reasonable re-letting expenses when the tenant breached notice requirements, unpaid rent, and reasonable repair costs. A flat or liquidated early termination fee should not be used for Maine; the builder's {{early_termination_fee}} option should be disabled or limited to actual re-letting costs.",
    "Military: Maine has no state lease-termination statute for servicemembers. 37-B M.R.S. § 387 bars forcible entry and detainer against the dwelling of a National Guard or Reserve member ordered to federal or state duty (and family) without leave of court, and § 389-A allows stays; neither is a termination right. Federal SCRA only.",
    "Nonpayment: the 7-day notice and cure/reinstatement rules in § 6002 apply by their terms to tenancies at will. For fixed-term leases, termination for breach follows the lease (§ 6001(1)), and if a written lease lacks termination/notice language for material breach, § 6001(1-B) lets the landlord use § 6002 procedures and lets the tenant terminate on 7 days' written notice for the landlord's substantial breach. The builder should include a termination-for-breach clause in Maine leases; I recommend it mirror the § 6002 7-day notice and cure language. All landlord termination notices must attach the Judicial Branch form (§ 6001(7), effective Jan. 1, 2024) and include right-to-contest language (§ 6002).",
    "Casualty: § 6010 bars recovery of rent for any period when a residential unit is unfit for use or habitation due to fire or other unavoidable casualty; this cannot be contracted around for residential leases. It suspends rent rather than granting a termination right, so it is not encoded in earlyTermination.",
    "Energy disclosure: beginning Jan. 1, 2030, a tenant who did not receive a signed energy efficiency disclosure may terminate on 30 days' written notice (§ 6030-C(3), 2025 Me. Laws c. 411); not yet in effect, so not encoded as a termination right.",
    "Owner-occupied small buildings (5 or fewer units, one occupied by the landlord) are exempt from the security deposit chapter (§ 6037), cash-receipt rule (§ 6022), and the § 6026 repair-and-deduct remedy; the builder applies the deposit rules uniformly, which is compliant but stricter than required for those owners.",
    "Heat: any agreement to provide heat below 68 degrees must be a separate written document, revocable, at least 12-point type, with a minimum of 62 degrees and a stated rent reduction, and is barred if someone over 65 or under 5 lives there (§ 6021(6-A)). Common-area utility cost shifting requires a written agreement with fair consideration (§ 6024).",
    "Tenant data: § 6025-B (2025 Me. Laws c. 767) bars disclosing tenant personal information to harass or force a tenant out without a legitimate business purpose ($1,000 minimum damages); relevant to Keycove data sharing.",
    "The Maine Attorney General must publish a model residential lease (§ 6030-K, first by Dec. 1, 2025, updated biennially); the attorney may want to compare Keycove's Maine lease against it.",
    "Late fees: § 6028 defines rent as late only if not paid within 15 days after the due date, so the earliest a fee may be charged is the 16th day after the due date; the 4% cap applies to one month's rent, and the written notice must be given at lease signing.",
    "Fair housing: the Maine Human Rights Act housing section (5 M.R.S. § 4581-A, as amended by 2025 Me. Laws c. 269) does not list age or marital status for housing; source of income is protected as receipt of public assistance including housing subsidies. § 4581(4)(B) exempts renting one unit of an owner-occupied 2-family dwelling and renting not more than 4 rooms of an owner-occupied one-family dwelling, except from the advertising and broker provisions; co-living rooms in an owner-occupied home may therefore be exempt from parts of the state act (federal rules differ). Not encoded.",
    "Local law (not verified): Portland has a rent control ordinance (Rent Stabilization, Portland City Code ch. 6) with registration and annual-increase limits, and Portland and other cities have adopted longer notice periods for rent increases and at-will terminations. Check local ordinances before using the statewide notice periods in Portland, South Portland, or Bangor.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
