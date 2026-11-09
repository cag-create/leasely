import type { StateLawProfile } from "../types";

const KSR = (ch: string, file: string) =>
  `https://www.ksrevisor.gov/statutes/chapters/ch${ch}/${file}.html`;

export const KS: StateLawProfile = {
  code: "KS",
  name: "Kansas",
  framework: "Kansas Residential Landlord and Tenant Act, K.S.A. 58-2540 et seq.",

  deposit: {
    maxMonths: 1,
    capRule:
      "The security deposit may not exceed one month's rent for an unfurnished unit, or one and one-half months' rent if this Lease provides for Tenant's use of furniture owned by Landlord. If this Lease permits Tenant to keep pets, Landlord may also collect an additional pet deposit of no more than one-half of one month's rent.",
    capCite: "K.S.A. 58-2550(a)",
    returnDays: 30,
    returnRule:
      "When the tenancy ends, Landlord may apply the security deposit to accrued rent and to damages Landlord has suffered because of Tenant's noncompliance with K.S.A. 58-2555 and this Lease, all as itemized in a written notice delivered to Tenant. If Landlord keeps any part of the deposit for charges other than rent, Landlord will return the balance within 14 days after determining the amount of those charges, and in no event later than 30 days after the tenancy ends, Tenant delivers possession, and Tenant demands the deposit. If Tenant does not demand the deposit within 30 days after the tenancy ends, Landlord will mail the amount due to Tenant's last known address. Tenant may not apply any part of the security deposit to the last month's rent or use it in place of rent; if Tenant does so, the security deposit is forfeited and Landlord may recover the rent due as if the deposit had not been applied.",
    returnCite: "K.S.A. 58-2550(b), (d)",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection:
      "Within five days after the initial date of occupancy or upon delivery of possession, Landlord (or Landlord's designated representative) and Tenant will jointly inventory the Property and complete a written record of the condition of the Property and any furnishings or appliances provided. Landlord and Tenant will sign duplicate copies of the record, and Tenant will receive a copy.",
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
      "Either Landlord or Tenant may terminate a month-to-month tenancy by written notice to the other stating that the tenancy will terminate on a periodic rent-paying date not less than 30 days after the other party receives the notice. A Tenant who is in the military service of the United States and whose termination is necessitated by military orders need give no more than 15 days' written notice.",
    monthToMonthCite: "K.S.A. 58-2570(b)",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If rent is unpaid when due, Landlord may terminate this Lease if Tenant fails to pay within three days after Landlord gives written notice of the nonpayment and of Landlord's intention to terminate this Lease if the rent is not paid within that period. The three days are three consecutive 24-hour periods beginning when the notice is delivered to Tenant or to a person over 12 years of age residing on the Property, or posted in a conspicuous place on the Property; if the notice is mailed, Tenant has two additional days to pay.",
    nonpaymentCite: "K.S.A. 58-2564(b); K.S.A. 61-3803",
    entryHours: null,
    entryRule:
      "Landlord may enter the Property at reasonable hours, after reasonable notice to Tenant, to inspect it, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show it to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Landlord may enter without Tenant's consent in case of an extreme hazard involving the potential loss of life or severe property damage. Landlord will not abuse the right of access or use it to harass Tenant.",
    entryCite: "K.S.A. 58-2557",
  },

  earlyTermination: {
    military: {
      label: "Military orders (month-to-month tenancy)",
      cite: "K.S.A. 58-2570(b)",
      eligible:
        "If this Lease is or becomes a month-to-month tenancy, a Tenant who is in the military service of the United States and whose termination of the tenancy is necessitated by military orders may terminate it on shortened notice.",
      notice: "Tenant gives Landlord written notice of termination; no more than 15 days' written notice is required.",
      documentation: "",
      liability: "Tenant owes rent through the termination date stated in the notice.",
    },

    domesticViolence: {
      label: "Domestic violence, sexual assault, human trafficking, or stalking",
      cite: "K.S.A. 58-25,137; K.S.A. 75-452",
      eligible:
        "Tenant may end Tenant's obligation to pay rent for the period after Tenant vacates the Property if Tenant is a protected person, meaning a person who, during the preceding 12 months, has been, is, or is in imminent danger of becoming a victim of domestic violence, sexual assault, human trafficking, or stalking, as those terms are defined in K.S.A. 75-452.",
      notice:
        "Tenant must give Landlord a statement regarding the domestic violence, sexual assault, human trafficking, or stalking. Tenant is not liable for rent for the period after Tenant vacates the Property.",
      documentation:
        "If Landlord requests it, Tenant must provide documentation in one of these forms: (1) a document signed by Tenant and by a person licensed by the Kansas state board of healing arts to practice medicine and surgery, a licensed physician assistant, a person licensed by the Kansas board of nursing, or a person licensed by the Kansas behavioral sciences regulatory board, from whom Tenant sought assistance, declaring under penalty of perjury that, in that person's professional judgment within the scope of practice, the incident occurred; or (2) a court order granting relief to the protected person relating to the incident.",
      liability:
        "Tenant remains liable for late or unpaid rent and other amounts owed to Landlord for the period before Tenant vacates. If this Lease provides for an early termination fee, Landlord may charge a reasonable termination fee of no more than one month's rent for a termination under this right. This Lease continues in effect for any remaining tenants.",
    },

    other: [
      {
        label: "Property damaged or destroyed by fire or casualty",
        cite: "K.S.A. 58-2562",
        eligible:
          "If the Property is damaged or destroyed by fire or casualty so that its use and habitability are substantially impaired, Tenant may terminate this Lease.",
        notice:
          "Tenant may vacate the Property immediately and must notify Landlord in writing within five days afterward of Tenant's intention to terminate, in which case this Lease terminates as of the date Tenant vacated.",
        documentation: "",
        liability:
          "Landlord will return the recoverable portion of the security deposit, and rent is accounted for as of the date Tenant vacated.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "K.S.A. 58-2559",
        eligible:
          "Tenant may terminate this Lease if Landlord materially fails to comply with this Lease, or fails to comply with K.S.A. 58-2553 in a way that materially affects health and safety, unless the condition was caused by an act or omission of Tenant or a person or animal on the Property with Tenant's permission.",
        notice:
          "Tenant must deliver a written notice to Landlord specifying the acts and omissions constituting the breach and stating that this Lease will terminate on a periodic rent-paying date not less than 30 days after Landlord receives the notice. If the breach can be remedied and Landlord adequately begins a good faith effort to remedy it within 14 days after receiving the notice, this Lease does not terminate; if the same or a similar breach recurs after that 14-day period, Tenant may give a new written notice terminating this Lease on a periodic rent-paying date not less than 30 days after Landlord receives it.",
        documentation: "",
        liability: "Landlord will return the recoverable portion of the security deposit.",
      },
      {
        label: "Unlawful exclusion, utility interruption, or retaliation",
        cite: "K.S.A. 58-2563, 58-2572(b)",
        eligible:
          "Tenant may terminate this Lease if Landlord unlawfully removes or excludes Tenant from the Property, willfully diminishes services by interrupting or causing the interruption of electric, gas, water, or other essential service, or retaliates against Tenant in violation of K.S.A. 58-2572.",
        notice: "Tenant may elect to terminate this Lease upon Landlord's violation.",
        documentation: "",
        liability:
          "Landlord will return the recoverable portion of the security deposit, and Tenant may recover up to one and one-half months' rent or Tenant's actual damages, whichever is greater.",
      },
      {
        label: "Unlawful entry or harassment by Landlord",
        cite: "K.S.A. 58-2571(b)",
        eligible:
          "If Landlord makes an unlawful entry, makes a lawful entry in an unreasonable manner, or makes repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "Tenant may elect to terminate this Lease upon Landlord's violation.",
        documentation: "",
        liability: "Tenant may also recover actual damages.",
      },
    ],

    // Integration note (2026-11-08): K.S.A. 58-25,137(e) caps only a fee for a
    // protected-person termination, and only if the lease states one. This lease
    // states none (paragraph (d) waives the fee for statutory terminations), so
    // no general cap applies; a 1-month general cap here would wrongly clamp every
    // Kansas lease-break fee.
    feeCap: null,

    mitigation: {
      basis: "statute",
      cite: "K.S.A. 58-2565(c)",
      rule:
        "If Tenant abandons the Property, Landlord will make reasonable efforts to rent it at a fair rental. If Landlord rents the Property for a term beginning before this Lease ends, this Lease terminates on the date the new tenancy begins. If Landlord fails to use reasonable efforts to re-rent or accepts the abandonment as a surrender, this Lease is deemed terminated by Landlord as of the date Landlord has notice of the abandonment.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Manager, owner, and agent for notices",
      text:
        "This Lease states the name and address of the person authorized to manage the Property and of an owner of the Property or a person authorized to act for the owner for service of process and for receiving and receipting for notices and demands. Landlord will keep this information current.",
      cite: "K.S.A. 58-2551",
    },
  ],

  fairHousing: {
    stateClasses: [
      "ancestry",
      "status as a protected person (victim of domestic violence, sexual assault, human trafficking, or stalking within the preceding 12 months) under K.S.A. 58-25,137",
    ],
    cite: "K.S.A. 44-1015, 44-1016 (Kansas Act Against Discrimination); K.S.A. 58-25,137",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through an eviction action in district court under K.S.A. 61-3801 through 61-3808, after delivering any required notice. Landlord will not take possession by willfully interrupting electric, gas, water, or other essential services, or by any other self-help, except in case of abandonment or surrender.",
    cite: "K.S.A. 58-2542, 58-2569, 61-3801, 61-3803",
  },

  habitability: {
    rule:
      "Except when prevented by an act of God, the failure of public utility services, or other conditions beyond Landlord's control, Landlord will comply with applicable building and housing codes materially affecting health and safety; exercise reasonable care in maintaining common areas; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, and air-conditioning appliances, including elevators, that Landlord supplies or is required to supply; provide and arrange removal of waste receptacles unless a government entity provides them; and supply running water, reasonable amounts of hot water at all times, and reasonable heat unless heat or hot water is generated by an installation within Tenant's exclusive control and supplied by a direct public utility connection.",
    cite: "K.S.A. 58-2553(a)",
  },

  sources: [
    { cite: "K.S.A. 58-2541", url: KSR("58", "058_025_0041") },
    { cite: "K.S.A. 58-2542", url: KSR("58", "058_025_0042") },
    { cite: "K.S.A. 58-2543", url: KSR("58", "058_025_0043") },
    { cite: "K.S.A. 58-2544", url: KSR("58", "058_025_0044") },
    { cite: "K.S.A. 58-2545", url: KSR("58", "058_025_0045") },
    { cite: "K.S.A. 58-2547", url: KSR("58", "058_025_0047") },
    { cite: "K.S.A. 58-2548", url: KSR("58", "058_025_0048") },
    { cite: "K.S.A. 58-2550", url: KSR("58", "058_025_0050") },
    { cite: "K.S.A. 58-2551", url: KSR("58", "058_025_0051") },
    { cite: "K.S.A. 58-2553", url: KSR("58", "058_025_0053") },
    { cite: "K.S.A. 58-2557", url: KSR("58", "058_025_0057") },
    { cite: "K.S.A. 58-2558", url: KSR("58", "058_025_0058") },
    { cite: "K.S.A. 58-2559", url: KSR("58", "058_025_0059") },
    { cite: "K.S.A. 58-2561", url: KSR("58", "058_025_0061") },
    { cite: "K.S.A. 58-2562", url: KSR("58", "058_025_0062") },
    { cite: "K.S.A. 58-2563", url: KSR("58", "058_025_0063") },
    { cite: "K.S.A. 58-2564", url: KSR("58", "058_025_0064") },
    { cite: "K.S.A. 58-2565", url: KSR("58", "058_025_0065") },
    { cite: "K.S.A. 58-2566", url: KSR("58", "058_025_0066") },
    { cite: "K.S.A. 58-2568", url: KSR("58", "058_025_0068") },
    { cite: "K.S.A. 58-2569", url: KSR("58", "058_025_0069") },
    { cite: "K.S.A. 58-2570", url: KSR("58", "058_025_0070") },
    { cite: "K.S.A. 58-2571", url: KSR("58", "058_025_0071") },
    { cite: "K.S.A. 58-2572", url: KSR("58", "058_025_0072") },
    { cite: "K.S.A. 58-2573", url: KSR("58", "058_025_0073") },
    { cite: "K.S.A. 58-25,137", url: KSR("58", "058_025_0137") },
    { cite: "K.S.A. 75-452", url: KSR("75", "075_004_0052") },
    { cite: "K.S.A. 44-1015", url: KSR("44", "044_010_0015") },
    { cite: "K.S.A. 44-1016", url: KSR("44", "044_010_0016") },
    { cite: "K.S.A. 61-3801", url: KSR("61", "061_038_0001") },
    { cite: "K.S.A. 61-3803", url: KSR("61", "061_038_0003") },
  ],

  reviewNotes: [
    "PROHIBITED CLAUSES: K.S.A. 58-2547 bars any rental agreement term under which either party agrees to pay either party's attorneys' fees, waives Act rights, confesses judgment, or exculpates/limits/indemnifies liability (except that the tenant may agree to limit the landlord's liability for fire, theft, or breakage in common areas). Knowing use of a prohibited term exposes the landlord to actual damages. The generator must omit fee-shifting and indemnity clauses for Kansas.",
    "DOMESTIC VIOLENCE (K.S.A. 58-25,137, enacted 2019): The statute is framed as no liability for rent after the tenant vacates, triggered by a statement to the landlord; documentation is required only on landlord request. It sets no advance-notice period or effective date. Subsection (e) allows a reasonable termination fee of up to one month's rent only if the lease contains it; feeCap records this but its rule text limits it to DV terminations. If the builder uses feeCap.maxMonthsRent to clamp the general early termination fee, that is stricter than Kansas law (lawful, but a landlord business choice). Subsection (h): the lease continues for remaining tenants. Statutory damages of $1,000 plus fees for violations.",
    "MILITARY: The only Kansas statute found is K.S.A. 58-2570(b) (15-day notice for federal servicemembers ending a month-to-month tenancy because of military orders). No Kansas statute extending SCRA lease protections to Kansas National Guard members on state active duty was found (searched the K.S.A. chapter 48 index and the web; a 2018 bill, HB 2464, proposed such rights but its enactment was not confirmed). Attorney should confirm.",
    "LATE FEES: No Kansas statute sets a grace period or cap. Unconscionability review applies (K.S.A. 58-2544). Kansas case law on late fees was not read.",
    "DEPOSIT: Return deadline is the earlier of 14 days after the landlord determines the deductions or 30 days after termination, delivery of possession, and the tenant's demand; returnDays is 30. Failure to comply means the tenant recovers the amount due plus 1.5x the amount wrongfully withheld (58-2550(c)). The revisor's case annotations (Clark v. Walker, 225 Kan. 359) indicate the 58-2550(d) forfeiture rule must be in the rental agreement to be enforceable against the tenant; the returnRule includes it.",
    "MOVE-IN INVENTORY: K.S.A. 58-2548 makes a joint written inventory within 5 days mandatory (not optional); the Keycove move-in checklist flow should be required for Kansas and capture both signatures.",
    "MOVE-OUT NOTICE FORMS: K.S.A. 58-2570(e) requires specific bold-type language on any landlord-provided notice-to-vacate form that contains terms not in the lease.",
    "TENANT REPAIR AGREEMENTS: K.S.A. 58-2553(b)-(d) allow tenant-performed duties only in limited cases, and for non-single-family units only by a separate signed writing.",
    "CO-LIVING: Transient occupancy in a hotel, motel, or rooming house is excluded from the Act (58-2541(d)); a roomer paying weekly is week-to-week by default (58-2545(d)). Whether a particular co-living arrangement is a 'rooming house' needs case-by-case review.",
    "LOCAL LAW: Some Kansas cities (e.g., Lawrence, Wichita, Kansas City KS) have local fair housing or rental licensing ordinances that may add protected classes such as sexual orientation, gender identity, or source of income; not reviewed.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
