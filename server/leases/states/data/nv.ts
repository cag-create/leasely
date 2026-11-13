import type { StateLawProfile } from "../types";

export const NV: StateLawProfile = {
  code: "NV",
  name: "Nevada",
  framework: "Nevada Residential Landlord and Tenant Act, Nev. Rev. Stat. ch. 118A (NRS 118A.010 et seq.)",

  deposit: {
    maxMonths: 3,
    capRule:
      "Landlord may not demand or receive a security deposit or surety bond, or a combination of them, including any last month's rent, whose total amount or value exceeds three months' periodic rent. Landlord may not require Tenant to buy a surety bond instead of paying a deposit. The deposit may not be characterized as nonrefundable, except that this Lease may provide for a reasonable nonrefundable cleaning charge.",
    capCite: "Nev. Rev. Stat. §§ 118A.240, 118A.242(1)–(3), (8)",
    returnDays: 30,
    returnRule:
      "No later than 30 days after the tenancy ends, Landlord will give Tenant an itemized written accounting of the disposition of the security deposit and return any remaining balance, either by handing it to Tenant at the place where rent is paid or by mailing it to Tenant's present address or, if unknown, Tenant's last known address. Landlord may claim only amounts reasonably necessary to cure unpaid rent, repair damage beyond normal wear caused by Tenant, and pay the reasonable cost of cleaning.",
    returnCite: "Nev. Rev. Stat. § 118A.242(4), (6)",
    holdingRule:
      "On Tenant's request, Landlord will give Tenant a signed written receipt for the security deposit and for any other payment, deposit or fee, including rent. Tenant's claim to the deposit takes precedence over the claims of Landlord's creditors, and a successor landlord must accept the deposit and may not require an additional deposit during this Lease.",
    holdingCite: "Nev. Rev. Stat. §§ 118A.250, 118A.242(9), 118A.244",
    interestRequired: false,
    moveInInspection:
      "Landlord and Tenant will sign a written record of the inventory and condition of the premises under Tenant's exclusive custody and control, which is part of this Lease.",
  },

  lateFee: {
    graceDays: 3,
    capType: "percent",
    capPercent: 5,
    capRule:
      "may not be charged until at least 3 calendar days after the date rent is due, may not exceed 5% of the periodic rent, and may not be increased based on a late fee previously imposed",
    cite: "Nev. Rev. Stat. § 118A.210(4)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either party may end a month-to-month tenancy with at least 30 days' written notice (7 days for a week-to-week tenancy), and this Lease may not require Tenant to give a different notice than Landlord must give. A tenant who is 60 or older or has a physical or mental disability may request in writing, with proof, to stay up to 30 additional days after a landlord's no-cause notice, and Landlord's notice must advise Tenant of that right.",
    monthToMonthCite: "Nev. Rev. Stat. §§ 40.251(1)(b), (2), (5); 118A.220(1)(e)",
    nonpaymentDays: 7,
    nonpaymentRule:
      "If Tenant defaults in paying rent, Landlord may serve a written notice to pay the rent or surrender the premises before the close of business on the seventh judicial day following the day of service. The notice must identify the court with jurisdiction and advise Tenant of the right to contest it by filing an affidavit with the court within that period.",
    nonpaymentCite: "Nev. Rev. Stat. §§ 40.2512(1)(b), 40.253(1), (3)",
    entryHours: 24,
    entryRule:
      "Tenant will not unreasonably withhold consent for Landlord to enter peaceably to inspect, make necessary or agreed repairs, decorations, alterations or improvements, supply necessary or agreed services, or show the dwelling unit to prospective or actual purchasers, mortgagees, tenants, workers or contractors. Except in an emergency, Landlord will give at least 24 hours' notice and will enter only at reasonable times during normal business hours unless Tenant expressly consents to shorter notice or other hours for a particular entry. Landlord may enter without consent in an emergency and will not abuse the right of access or use it to harass Tenant.",
    entryCite: "Nev. Rev. Stat. § 118A.330",
  },

  earlyTermination: {
    military: null,
    domesticViolence: {
      label: "Domestic violence, harassment, sexual assault or stalking",
      cite: "Nev. Rev. Stat. §§ 118A.345, 118A.347",
      eligible:
        "If Tenant, a cotenant or a household member (a person related by blood or marriage who actually lives with Tenant) is the victim of domestic violence, harassment, sexual assault or stalking, Tenant or any cotenant may terminate this Lease, provided the acts that made that person a victim occurred within the 90 days before the written notice.",
      notice:
        "Tenant gives Landlord written notice describing the reason for termination. Termination is effective at the end of the current rental period or 30 days after the notice is provided, whichever is sooner.",
      documentation:
        "For domestic violence, the notice must include a copy of a protective order, a copy of a written law enforcement report showing the victim notified law enforcement, or a copy of an affidavit in the form prescribed by Nev. Rev. Stat. § 118A.347 signed by a qualified third party (such as a licensed physician, psychologist, social worker, counselor, trained domestic violence advocate, or qualifying clergy member). For harassment, sexual assault or stalking, the notice must include a copy of a written law enforcement report or a copy of a temporary or extended order issued under Nev. Rev. Stat. § 200.378 or § 200.591.",
      liability:
        "Tenant owes only rent through the termination date and other outstanding obligations. Landlord may keep prepaid rent for the final rental period, refunding only any excess. Landlord will not withhold the security deposit because of the early termination, and Landlord will not describe this termination to a prospective landlord as an early termination. Landlord will not tell the adverse party where Tenant or Tenant's household members are, and on request and at Tenant's cost Landlord will rekey or replace the locks.",
    },
    other: [
      {
        label: "Tenant age 60+ or with a disability relocating for care; death of spouse or cotenant",
        cite: "Nev. Rev. Stat. § 118A.340",
        eligible:
          "If Tenant is 60 years of age or older or has a physical or mental disability and must relocate because of a need for care or treatment that cannot be provided in the dwelling, Tenant may terminate this Lease; a cotenant may also terminate if the cotenant was already a tenant before the relocating tenant signed and is 60 or older or has a disability, or became a tenant on or after the date the relocating tenant signed. In addition, if Tenant is 60 or older or has a physical or mental disability and Tenant's spouse or cotenant dies, Tenant may terminate this Lease.",
        notice:
          "For relocation, the tenant gives Landlord 30 days' written notice within 60 days after the tenant relocates. After the death of a spouse or cotenant, Tenant gives Landlord 60 days' written notice within 3 months after the death.",
        documentation:
          "The notice must state the facts showing that the tenant is entitled to terminate. For relocation, it must include reasonable verification of the physical or mental condition and that the condition requires relocation because of a need for care or treatment that cannot be provided in the dwelling.",
        liability:
          "This Lease ends at the end of the notice period notwithstanding any contrary provision in this Lease. Tenant owes rent through that date and no rent for any later period.",
      },
      {
        label: "Fire or casualty damage",
        cite: "Nev. Rev. Stat. § 118A.400",
        eligible:
          "If the dwelling unit or premises are damaged or destroyed by fire or casualty so that enjoyment of the dwelling unit is substantially impaired, Tenant may terminate this Lease, unless the fire or casualty was caused by the deliberate or negligent acts of Tenant, a household member or a guest.",
        notice:
          "Tenant immediately vacates and notifies Landlord within 7 days afterward of Tenant's intention to terminate; this Lease ends as of the date Tenant vacated.",
        documentation: "",
        liability:
          "Rent is accounted for as of the date Tenant vacated. Landlord will return all prepaid rent and any security deposit recoverable under Nevada law, and no early termination fee applies.",
      },
      {
        label: "Landlord's failure to maintain a habitable dwelling",
        cite: "Nev. Rev. Stat. § 118A.355",
        eligible:
          "If Landlord fails to maintain the dwelling unit in a habitable condition and does not remedy a material failure, or make a reasonable effort to do so, within 14 days after receiving Tenant's written notice, Tenant may terminate this Lease immediately. This right does not apply to conditions caused by Tenant, a household member or a guest.",
        notice: "Tenant first delivers written notice specifying each failure and requesting a remedy; if it is not remedied within 14 days, Tenant may terminate immediately.",
        documentation: "",
        liability: "Landlord will return all prepaid rent and any recoverable security deposit, and no early termination fee applies.",
      },
      {
        label: "Unlawful lockout or interruption of essential services",
        cite: "Nev. Rev. Stat. § 118A.390",
        eligible:
          "If Landlord unlawfully removes or excludes Tenant, willfully interrupts any essential item or service required by this Lease or Nevada law, or otherwise recovers possession without a court action, Tenant may terminate this Lease.",
        notice: "Tenant may terminate by notice to Landlord.",
        documentation: "",
        liability:
          "Landlord will return all prepaid rent and any recoverable security deposit. Tenant may also recover actual damages and up to $2,500 fixed by the court. No early termination fee applies.",
      },
      {
        label: "Unlawful or harassing entry",
        cite: "Nev. Rev. Stat. § 118A.500(2)",
        eligible:
          "If Landlord makes an unlawful entry, a lawful entry in an unreasonable manner, or repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "Tenant may terminate by notice to Landlord.",
        documentation: "",
        liability: "Tenant may recover actual damages and owes no early termination fee.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "unclear",
      cite: null,
      rule:
        "If Tenant leaves before this Lease ends, Landlord will credit against any amount Tenant owes all rent Landlord receives from a replacement tenant for the remainder of the term.",
    },
  },

  disclosures: [
    {
      id: "single_family_notarization_notice",
      title: "Notice regarding lawful occupancy (single-family residence)",
      text:
        "There are rebuttable presumptions in NRS 205.0813 and 205.0817 that the tenant does not have lawful occupancy of the dwelling unless this agreement (1) is notarized or is signed by an authorized agent of the landlord who at the time of signing holds a permit to engage in property management pursuant to chapter 645 of NRS, and (2) includes the current address and telephone number of the landlord or the landlord's authorized representative. This agreement is valid and enforceable against the landlord and the tenant regardless of whether it is notarized or signed by such a permitted agent, and regardless of whether it includes the current address and telephone number of the landlord or the landlord's authorized representative.",
      cite: "Nev. Rev. Stat. § 118A.200(4), (10)",
      placement: "top_large",
      condition:
        "Required for a single-family residence (a structure of not more than four units, excluding manufactured homes) when this Lease is not signed by a property manager holding a Nevada chapter 645 permit; must appear at the top of the first page in a font at least twice as large as any other font in the Lease",
    },
    {
      id: "rent_single_figure",
      title: "Total periodic rent",
      text:
        "The monthly rent stated in this Lease is a single figure representing the maximum total periodic rent, including all mandatory fees charged in addition to base rent. Landlord will not charge periodic rent above that figure, except for a separately disclosed utility charge permitted by Nev. Rev. Stat. § 118A.200(8).",
      cite: "Nev. Rev. Stat. § 118A.200(6)–(8)",
    },
    {
      id: "owner_agent_identity",
      title: "Owner, manager and emergency contact",
      text:
        "The person authorized to manage the premises, the person within Nevada authorized to act for Landlord for service of process and for receiving notices and demands, and the principal or corporate owner is {{landlord_name}}, {{landlord_address}}. A responsible person who lives in the county where the premises are located or within 60 miles of the premises may be reached in an emergency at {{landlord_phone}}. Landlord will keep this information current, and this disclosure is enforceable against any successor landlord or manager of the premises.",
      cite: "Nev. Rev. Stat. § 118A.260",
    },
    {
      id: "occupancy_by_children",
      title: "Occupancy by children",
      text:
        "The persons authorized to occupy the dwelling are listed in this Lease and may include children. Landlord does not restrict occupancy by children, except for any limit on the total number of occupants that applies equally to all occupants under applicable health, safety and building codes.",
      cite: "Nev. Rev. Stat. § 118A.200(3)(c)",
    },
    {
      id: "late_partial_dishonored_charges",
      title: "Charges for partial payment and dishonored checks",
      text:
        "Other than the late fee stated in the Rent section of this Lease, Landlord charges no fee for a partial payment of rent and no fee for the return of a dishonored check.",
      cite: "Nev. Rev. Stat. § 118A.200(3)(g)",
    },
    {
      id: "nuisance_summary",
      title: "Summary of NRS 202.470 (nuisances)",
      text:
        "Under NRS 202.470, a person who commits or maintains a public nuisance for which no special punishment is prescribed, who willfully omits or refuses to perform a legal duty relating to the removal of such a nuisance, or who lets or permits any building or portion of a building to be used knowing that it is intended to be or is being used to commit or maintain such a nuisance, is guilty of a misdemeanor.",
      cite: "Nev. Rev. Stat. §§ 118A.200(3)(l), 202.470",
    },
    {
      id: "reporting_nuisance_code_violations",
      title: "Reporting nuisances and code violations",
      text:
        "Tenant may report a nuisance to the local law enforcement agency or the city or county code enforcement office for the area where the premises are located, and may report a violation of a building, safety or health code or regulation to the city or county building, code enforcement or health department with jurisdiction over the premises. Landlord may not retaliate against Tenant for a good-faith complaint to a governmental agency.",
      cite: "Nev. Rev. Stat. §§ 118A.200(3)(m), 118A.510",
    },
    {
      id: "flag_display",
      title: "Display of the United States flag",
      text:
        "Landlord will not prohibit Tenant from displaying the flag of the United States, made of cloth, fabric or paper and displayed from a pole or staff or in a window in a manner consistent with 4 U.S.C. Chapter 1, within the portion of the premises Tenant has the right to occupy and use exclusively. Landlord may adopt rules that reasonably restrict the placement and manner of the display. This right does not cover displays for commercial advertising.",
      cite: "Nev. Rev. Stat. §§ 118A.200(3)(n), 118A.325",
    },
    {
      id: "religious_cultural_display",
      title: "Display of religious or cultural items",
      text:
        "Landlord will not prohibit Tenant from displaying religious or cultural items on the entry door or doorframe or otherwise in or on the dwelling, except displays larger than 36 by 12 inches, displays that threaten health or safety, hinder the door, violate law, promote discriminatory behavior, or are obscene. Landlord may adopt policies that reasonably restrict placement and manner. If Landlord must work on the entry door or doorframe, Landlord will give at least 7 days' written notice (except in an emergency) before removing or asking Tenant to remove the display, will store any removed item respectfully, and will allow it to be returned within 72 hours after the work is completed.",
      cite: "Nev. Rev. Stat. §§ 118A.200(3)(o), 118A.327",
    },
    {
      id: "fee_free_payment_method",
      title: "Payment methods and online payment fees",
      text:
        "Landlord provides at least one method of paying rent and other charges that requires no fee and does not require Tenant to provide bank account information (other than on a check). Any fee for paying through an online portal is separately identified in this Lease and does not exceed the fee the portal operator charges.",
      cite: "Nev. Rev. Stat. § 118A.303",
    },
    {
      id: "utility_fee_outside_rent",
      title: "Utility charges billed separately from rent",
      text:
        "The public utility named in this Lease is unable to contract directly with Tenant for the electric, natural gas or water service to the dwelling unit (or the unit is on a master-metered water system), and the monthly cost of that service will be charged to Tenant as a monthly fee equal to the cost of the service, separate from the rent figure.",
      cite: "Nev. Rev. Stat. § 118A.200(8)",
      condition:
        "Only if Landlord charges a utility fee outside the single rent figure; the rent figure must carry an asterisk at least half its font size referring to this statement on the same page, which must also give each utility's name and telephone number",
    },
    {
      id: "foreclosure",
      title: "Foreclosure disclosure",
      text: "The property is the subject of foreclosure proceedings.",
      cite: "Nev. Rev. Stat. § 118A.275",
      condition: "Only if the property is the subject of any foreclosure proceeding; must be disclosed in writing to the prospective tenant",
    },
  ],

  fairHousing: {
    stateClasses: ["sexual orientation", "gender identity or expression", "ancestry"],
    cite: "Nev. Rev. Stat. §§ 118.020, 118.100",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a court proceeding, including summary eviction under Nev. Rev. Stat. §§ 40.253–40.254 or an unlawful detainer action under Nev. Rev. Stat. §§ 40.290–40.420, or when Tenant has surrendered or abandoned the dwelling unit. Landlord will not lock Tenant out, block Tenant's entry, or willfully interrupt any essential item or service to recover possession.",
    cite: "Nev. Rev. Stat. §§ 118A.480, 118A.390, 40.253",
  },

  habitability: {
    rule:
      "Landlord will at all times maintain the dwelling unit in a habitable condition, including effective waterproofing and weather protection, plumbing, hot and cold running water connected to an approved sewage system, heating, electrical lighting and wiring, garbage receptacles and removal, clean and sanitary areas under Landlord's control free of vermin, floors, walls, ceilings, stairways and railings in good repair, and any ventilating, air-conditioning and other facilities and appliances Landlord supplies in good repair. Landlord will not charge Tenant for repairs that are Landlord's duty, including home-warranty deductibles, unless the condition was caused by Tenant, a household member or a guest.",
    cite: "Nev. Rev. Stat. § 118A.290",
  },

  sources: [
    { cite: "Nev. Rev. Stat. §§ 118A.010–118A.530 (full chapter, incl. 118A.180, .190, .200, .210, .220, .235, .240, .242, .244, .250, .260, .270, .275, .280, .290, .300, .303, .306, .310, .320, .325, .327, .330, .340, .345, .347, .349, .355, .360, .390, .400, .420, .430, .450, .470, .480, .500, .510)", url: "https://www.leg.state.nv.us/NRS/NRS-118A.html" },
    { cite: "Nev. Rev. Stat. §§ 40.251, 40.2512, 40.2514, 40.2516, 40.253", url: "https://www.leg.state.nv.us/NRS/NRS-040.html" },
    { cite: "Nev. Rev. Stat. §§ 118.010, 118.020, 118.045, 118.100, 118.105, 118.120", url: "https://www.leg.state.nv.us/NRS/NRS-118.html" },
    { cite: "Nev. Rev. Stat. § 202.470", url: "https://www.leg.state.nv.us/NRS/NRS-202.html" },
    { cite: "Nev. Rev. Stat. §§ 597.8191–597.8198 (service member contract termination; does not cover leases)", url: "https://www.leg.state.nv.us/NRS/NRS-597.html" },
    { cite: "Nev. Rev. Stat. ch. 412 (searched for National Guard lease/civil relief provisions; none found)", url: "https://www.leg.state.nv.us/NRS/NRS-412.html" },
  ],

  reviewNotes: [
    "No Nevada state military lease-termination statute found. NRS 597.8191–597.8198 lets service members (including National Guard) terminate telecom, internet, video and health club contracts on PCS or 30+ day deployment, but not leases. NRS ch. 412 (Military) and ch. 118A contain no lease-termination or SCRA-extension provision for state active duty. Federal SCRA only.",
    "NRS 118A.200(4) single-family residence notice (structures of 4 or fewer units) must appear at the TOP OF THE FIRST PAGE in a font at least TWICE as large as any other font in the agreement whenever the lease is not signed by a chapter 645 permitted property manager. Now encoded with placement 'top_large', so the builder renders it above the title at 32px with every other heading capped at 16px; attorney/PDF must confirm the rendered PDF keeps the 2x ratio across all fonts (not just headings). The text tracks the statute nearly verbatim.",
    "NRS 118A.200(3) requires every written lease to contain provisions on: duration; rent (as a single all-in figure per 118A.200(6), 2025 amendment) and manner/time of payment; occupancy by children or pets; services included; required fees and their purposes; deposits and refund conditions; late, partial-payment and dishonored-check charges; landlord inspection rights; a list of occupants; utility responsibility; a signed inventory/condition record; the NRS 202.470 summary; nuisance/code-violation reporting procedure; and the flag and religious-display rights. Using a nonconforming lease is unlawful and contrary provisions are void (118A.200(9)). Audited against the rendered lease: all subjects are present. Subject (c) occupancy by children was previously covered only as to pets, so an 'occupancy_by_children' disclosure was added; subject (g) partial-payment and dishonored-check charges was previously covered only by the late fee, so a 'late_partial_dishonored_charges' disclosure was added stating Landlord charges none for those (safest conforming position). Attorney may substitute actual charges if Landlord intends to impose them.",
    "The reporting-procedure disclosure (118A.200(3)(m)) is drafted generically; attorney should consider whether naming the specific local agency (e.g., Las Vegas/Clark County code enforcement) is needed for compliance.",
    "Nonpayment notice is 7 JUDICIAL days (excludes weekends and court holidays) and has mandatory content under NRS 40.253(3); a weekly tenancy under 45 days may use a 4-day notice. Shutdown protections for federal, state and tribal workers (NRS 40.2512(2), 118A.310(2)) suspend the pay-or-quit remedy.",
    "Landlord's no-cause notice for a periodic tenancy must advise the tenant of the 60+/disability 30-day extension and shutdown-worker extension (NRS 40.251(5)).",
    "DV termination: it is unclear whether a cotenant's termination under NRS 118A.345 ends the lease for all cotenants or only releases the terminating tenant (the statute says the tenant 'may terminate the rental agreement'). Human trafficking is not a listed ground. NRS 118A.220(1)(a) bars any waiver.",
    "Mitigation: NRS 118A has no duty-to-mitigate provision (118A.450 addresses abandonment only). I did not locate a Nevada Supreme Court decision in a primary source establishing a residential landlord's duty to mitigate; set to 'unclear' with a lease promise to credit replacement rent. Attorney to confirm Nevada case law.",
    "No statutory cap on early termination fees; NRS 118A.345(6) acknowledges 'fees relating to early termination' exist. Any fee is subject to the unconscionability rule (118A.230) and the deposit rules (118A.242).",
    "2025 session changes now in force: rent stated as single all-in figure (118A.200(6)–(8)); copy of lease to prospective tenant on request (118A.235); fee-free payment method and online-portal fee limits (118A.303); application-fee refunds and no fees for minor household members (118A.306); religious/cultural display right (118A.327); key-control policies for large complexes (118A.332). Rent increases need 60 days' written notice (118A.300).",
    "Nevada has no statewide rent control. Check Clark County/Las Vegas/Reno local business-license or registration rules for the property.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
