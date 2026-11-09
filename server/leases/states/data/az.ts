import type { StateLawProfile } from "../types";

export const AZ: StateLawProfile = {
  code: "AZ",
  name: "Arizona",
  framework: "Arizona Residential Landlord and Tenant Act, Ariz. Rev. Stat. §§ 33-1301 et seq.",

  deposit: {
    maxMonths: 1.5,
    capRule:
      "Landlord may not demand or receive security, however denominated, including prepaid rent, of more than one and one-half months' rent. Tenant may voluntarily pay more than one and one-half months' rent in advance. The purpose of every nonrefundable fee or deposit must be stated in writing, and any fee or deposit not designated as nonrefundable is refundable.",
    capCite: "Ariz. Rev. Stat. § 33-1321(A), (B)",
    returnDays: 14,
    returnRule:
      "Within 14 days, excluding Saturdays, Sundays and legal holidays, after the tenancy ends, Tenant delivers possession and Tenant demands the deposit, Landlord will give Tenant an itemized list of all deductions together with any amount due to Tenant. Unless Tenant arranges otherwise in writing, Landlord will mail the itemized list and any refund by first class mail to Tenant's last known place of residence. Landlord may apply the deposit and prepaid rent to unpaid rent and, subject to Landlord's duty to mitigate, to charges specified in this Lease or allowed by law, including damages caused by Tenant's failure to maintain the dwelling unit as required by law. If Tenant does not dispute the deductions within 60 days after the itemized list is mailed, the itemized list is deemed final.",
    returnCite: "Ariz. Rev. Stat. § 33-1321(D)–(E)",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection:
      "At move-in, Landlord will give Tenant a signed copy of this Lease, a move-in form on which Tenant may note any existing damage to the dwelling unit, and written notice that Tenant may be present at the move-out inspection. On Tenant's request, Landlord will tell Tenant when the move-out inspection will occur.",
  },

  lateFee: {
    graceDays: null,
    capType: "reasonable",
    capRule: "must be reasonable and must be set forth in this written Lease",
    cite: "Ariz. Rev. Stat. § 33-1368(B)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either Landlord or Tenant may end a month-to-month tenancy by written notice given at least 30 days before the periodic rental date specified in the notice. A week-to-week tenancy may be ended by either party with at least 10 days' written notice.",
    monthToMonthCite: "Ariz. Rev. Stat. § 33-1375(A)–(B)",
    nonpaymentDays: 5,
    nonpaymentRule:
      "If rent is unpaid when due and Tenant does not pay within 5 calendar days after Landlord's written notice of nonpayment and of Landlord's intention to terminate this Lease, Landlord may terminate this Lease by filing a special detainer action. Before the action is filed, this Lease is reinstated if Tenant pays all past-due rent and a reasonable late fee stated in this Lease. After the action is filed, this Lease is reinstated only if Tenant also pays attorney fees and court costs.",
    nonpaymentCite: "Ariz. Rev. Stat. § 33-1368(B), (G)",
    entryHours: 48,
    entryRule:
      "Landlord may enter the dwelling unit to inspect it, make necessary or agreed repairs, decorations, alterations or improvements, supply necessary or agreed services, or show it to prospective or actual purchasers, mortgagees, tenants, workers or contractors. Except in an emergency or where it is impracticable, Landlord will give Tenant at least two days' notice of its intent to enter and will enter only at reasonable times. A service or maintenance request from Tenant is permission for Landlord to enter to perform that request without further notice. Landlord may enter without consent in an emergency, and will not abuse the right of access or use it to harass Tenant.",
    entryCite: "Ariz. Rev. Stat. § 33-1343",
  },

  earlyTermination: {
    military: null,
    domesticViolence: {
      label: "Domestic violence or sexual assault",
      cite: "Ariz. Rev. Stat. § 33-1318",
      eligible:
        "A Tenant who is a victim of domestic violence as defined in Ariz. Rev. Stat. § 13-3601, or who was the victim of sexual assault under Ariz. Rev. Stat. § 13-1406 in the dwelling unit, may terminate this Lease, provided the events that made Tenant a victim occurred within the 30 days before Tenant's written notice (unless Landlord waives that time limit).",
      notice:
        "Tenant gives Landlord written notice requesting release from this Lease with a mutually agreed release date within the next 30 days. Tenant's rights and obligations under this Lease end on the release date and Tenant vacates the dwelling unit.",
      documentation:
        "The notice must be accompanied by either a copy of a protective order issued under Ariz. Rev. Stat. § 13-3602 (Landlord may also request a receipt or signed statement showing that the order was submitted for service), or a copy of a written law enforcement departmental report stating that Tenant reported being a victim of domestic violence or sexual assault. Landlord may request in writing the name and address of the person named in the order or report, if known to Tenant.",
      liability:
        "Tenant owes only rent through the termination date plus obligations outstanding on that date, payable on or before the day Tenant vacates; Landlord may keep prepaid rent for the month in which this Lease ends. Tenant owes no early termination penalty or fee, and Landlord will not withhold the security deposit for the early termination, though it may be applied to damage Tenant caused. If there are other tenants on this Lease, their tenancy also ends; tenants who are not victims (other than the person named in the order or report) may be released from financial obligations and may apply for a new lease.",
    },
    other: [
      {
        label: "Law enforcement officer protected by an injunction against harassment",
        cite: "Ariz. Rev. Stat. § 33-1318.01",
        eligible:
          "A Tenant who is a law enforcement officer as defined in Ariz. Rev. Stat. § 38-1101 and who is protected by an injunction against harassment issued under Ariz. Rev. Stat. § 12-1809 within the 30 days before Tenant's notice (unless Landlord waives that time limit) may terminate this Lease.",
        notice:
          "Tenant gives Landlord written notice in the same manner required for domestic violence terminations, requesting release on a mutually agreed date within the next 30 days.",
        documentation: "The written notice must state that Tenant is protected by an injunction against harassment issued under Ariz. Rev. Stat. § 12-1809 within the 30 days before the notice.",
        liability:
          "Tenant owes rent through the termination date and outstanding obligations, but no early termination penalty or fee. Before vacating, Tenant must repay any lease concession or benefit Tenant actually received or used.",
      },
      {
        label: "Fire or casualty damage",
        cite: "Ariz. Rev. Stat. § 33-1366",
        eligible:
          "If the dwelling unit or premises are damaged or destroyed by fire or casualty so that enjoyment of the dwelling unit is substantially impaired, Tenant may terminate this Lease.",
        notice:
          "Tenant immediately vacates and notifies Landlord in writing within 14 days afterward of Tenant's intention to terminate; this Lease ends as of the date Tenant vacated.",
        documentation: "",
        liability:
          "Rent is accounted for as of the date Tenant vacates, and Landlord will return all security recoverable under Ariz. Rev. Stat. § 33-1321. No early termination fee applies.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "Ariz. Rev. Stat. § 33-1361",
        eligible:
          "If Landlord materially fails to comply with this Lease, or fails to comply with Ariz. Rev. Stat. § 33-1324 in a way that materially affects health and safety, Tenant may terminate this Lease unless Landlord remedies the breach in time. Tenant may not terminate for a condition caused by Tenant, Tenant's family or Tenant's guests.",
        notice:
          "Tenant delivers written notice specifying the breach and stating that this Lease will terminate on a date not less than 10 days after Landlord receives it if the breach is not remedied in 10 days, or not less than 5 days after receipt if the breach materially affects health and safety and is not remedied in 5 days.",
        documentation: "",
        liability: "If this Lease terminates, Landlord will return all security recoverable under Ariz. Rev. Stat. § 33-1321, and no early termination fee applies.",
      },
      {
        label: "Unlawful ouster or interruption of essential services",
        cite: "Ariz. Rev. Stat. § 33-1367",
        eligible:
          "If Landlord unlawfully removes or excludes Tenant from the premises or willfully interrupts electric, gas, water or other essential service, Tenant may terminate this Lease.",
        notice: "Tenant may terminate by notice to Landlord.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee and may recover up to two months' periodic rent or twice Tenant's actual damages, whichever is greater. Landlord will return all recoverable security.",
      },
      {
        label: "Unlawful or harassing entry",
        cite: "Ariz. Rev. Stat. § 33-1376(B)",
        eligible:
          "If Landlord makes an unlawful entry, a lawful entry in an unreasonable manner, or repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "Tenant may terminate by notice to Landlord.",
        documentation: "",
        liability: "Tenant owes no early termination fee and may recover actual damages of not less than one month's rent.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "Ariz. Rev. Stat. §§ 33-1370(C), 33-1321(D)",
      rule:
        "If Tenant abandons the dwelling unit, Landlord will make reasonable efforts to re-rent it at a fair rental. If Landlord re-rents for a term beginning before this Lease ends, this Lease terminates on the date the new tenancy begins. If Landlord fails to use reasonable efforts to re-rent, or accepts the abandonment as a surrender, this Lease is deemed terminated by Landlord as of the date Landlord had notice of the abandonment.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner and manager identification",
      text:
        "Landlord discloses below the name and address of the person authorized to manage the premises and of an owner of the premises or a person authorized to act for the owner for service of process and for receiving and receipting for notices and demands. Landlord will keep this information current and will provide it again on Tenant's request.",
      cite: "Ariz. Rev. Stat. § 33-1322(A), (C)",
    },
    {
      id: "arlta_availability",
      title: "Arizona Residential Landlord and Tenant Act",
      text: "The Arizona Residential Landlord and Tenant Act is available on the Arizona Department of Housing's website.",
      cite: "Ariz. Rev. Stat. § 33-1322(B)",
    },
    {
      id: "nonrefundable_fees",
      title: "Nonrefundable fees and deposits",
      text:
        "The purpose of each nonrefundable fee or deposit is stated in this Lease. Any fee or deposit that this Lease does not designate as nonrefundable is refundable.",
      cite: "Ariz. Rev. Stat. § 33-1321(B)",
    },
    {
      id: "move_in_move_out",
      title: "Move-in form and move-out inspection",
      text:
        "Landlord has given Tenant a move-in form for noting existing damage to the dwelling unit. Tenant may be present at the move-out inspection, and on Tenant's request Landlord will tell Tenant when the move-out inspection will occur.",
      cite: "Ariz. Rev. Stat. § 33-1321(C)",
    },
    {
      id: "bed_bugs",
      title: "Bed bug information",
      text:
        "Landlord has provided Tenant with educational materials about bed bugs. Landlord does not know of a current bed bug infestation in the dwelling unit. Tenant will not knowingly move infested materials into the dwelling unit and will notify Landlord in writing or electronically if Tenant knows bed bugs are present.",
      cite: "Ariz. Rev. Stat. § 33-1319",
      condition: "Does not apply to the rental of a single family residence",
    },
    {
      id: "pool_safety",
      title: "Swimming pool safety notice",
      text:
        "Landlord has given Tenant the notice approved by the Arizona Department of Health Services explaining pool safety education and the responsibilities of pool ownership.",
      cite: "Ariz. Rev. Stat. § 36-1681(E)",
      condition: "Only if the dwelling has a swimming pool or other contained body of water",
    },
    {
      id: "foreclosure",
      title: "Notice of foreclosure",
      text:
        "This property is undergoing foreclosure. For more information on this action, Tenant should contact the court, trustee, attorney or other responsible party identified by Landlord in this notice. A sale at auction may or may not occur as a result of this foreclosure. Landlord will state the time, date and place set for the sale, or that no sale date has been established.",
      cite: "Ariz. Rev. Stat. § 33-1331",
      condition:
        "Only if a foreclosure action was initiated before this Lease was signed; does not apply to multifamily properties of four or more connected units",
    },
    {
      id: "utility_submetering",
      title: "Separately charged utilities",
      text:
        "Landlord charges separately, through a submetering or ratio utility billing system, for the utility services listed in this Lease. Landlord may recover only the charges imposed by the utility provider plus the administrative fee stated in this Lease, which covers actual administrative costs only.",
      cite: "Ariz. Rev. Stat. § 33-1314.01(B)",
      condition: "Only if Landlord charges separately for gas, water, wastewater, solid waste removal or electricity by submetering or ratio utility billing",
    },
  ],

  fairHousing: {
    stateClasses: [],
    cite: "Ariz. Rev. Stat. §§ 41-1491.14, 41-1491.19",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a court special detainer action under Ariz. Rev. Stat. § 33-1377 or other action permitted by the Arizona Residential Landlord and Tenant Act. Landlord will not remove Tenant or Tenant's belongings by force, change the locks to exclude Tenant, or interrupt electric, gas, water or other essential services, except in case of abandonment or surrender.",
    cite: "Ariz. Rev. Stat. §§ 33-1368, 33-1377, 33-1367, 33-1374",
  },

  habitability: {
    rule:
      "Landlord will comply with applicable building codes materially affecting health and safety, make all repairs and do whatever is necessary to keep the premises fit and habitable, keep common areas clean and safe, maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning and other facilities and appliances Landlord supplies, provide receptacles for garbage removal, and supply running water, reasonable amounts of hot water, and reasonable heat and air-conditioning or cooling where such units are installed and offered.",
    cite: "Ariz. Rev. Stat. § 33-1324",
  },

  sources: [
    { cite: "Ariz. Rev. Stat. § 33-1308", url: "https://www.azleg.gov/ars/33/01308.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1310", url: "https://www.azleg.gov/ars/33/01310.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1314", url: "https://www.azleg.gov/ars/33/01314.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1314.01", url: "https://www.azleg.gov/ars/33/01314-01.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1315", url: "https://www.azleg.gov/ars/33/01315.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1317", url: "https://www.azleg.gov/ars/33/01317.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1318", url: "https://www.azleg.gov/ars/33/01318.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1318.01", url: "https://www.azleg.gov/ars/33/01318-01.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1319", url: "https://www.azleg.gov/ars/33/01319.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1321", url: "https://www.azleg.gov/ars/33/01321.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1322", url: "https://www.azleg.gov/ars/33/01322.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1324", url: "https://www.azleg.gov/ars/33/01324.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1329", url: "https://www.azleg.gov/ars/33/01329.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1331", url: "https://www.azleg.gov/ars/33/01331.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1343", url: "https://www.azleg.gov/ars/33/01343.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1361", url: "https://www.azleg.gov/ars/33/01361.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1364", url: "https://www.azleg.gov/ars/33/01364.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1366", url: "https://www.azleg.gov/ars/33/01366.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1367", url: "https://www.azleg.gov/ars/33/01367.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1368", url: "https://www.azleg.gov/ars/33/01368.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1370", url: "https://www.azleg.gov/ars/33/01370.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1374", url: "https://www.azleg.gov/ars/33/01374.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1375", url: "https://www.azleg.gov/ars/33/01375.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1376", url: "https://www.azleg.gov/ars/33/01376.htm" },
    { cite: "Ariz. Rev. Stat. § 33-1377", url: "https://www.azleg.gov/ars/33/01377.htm" },
    { cite: "Ariz. Rev. Stat. § 36-1681", url: "https://www.azleg.gov/ars/36/01681.htm" },
    { cite: "Ariz. Rev. Stat. § 41-1491.14", url: "https://www.azleg.gov/ars/41/01491-14.htm" },
    { cite: "Ariz. Rev. Stat. § 41-1491.19", url: "https://www.azleg.gov/ars/41/01491-19.htm" },
    { cite: "Ariz. Rev. Stat. § 26-166 (checked for state military lease rights; none)", url: "https://www.azleg.gov/ars/26/00166.htm" },
  ],

  reviewNotes: [
    "No Arizona state military lease-termination statute found. Title 33, ch. 10 has no such section (33-1318.02 proposed in 2023 HB 2673 was not enacted per the current azleg.gov index), and the Title 26 National Guard article (26-151 to 26-183, incl. 26-166) has no lease or SCRA-extension provision. National Guard members on governor-ordered state active duty appear to have no state lease-termination right.",
    "Deposit return clock is 14 business days (excluding weekends and legal holidays) and is triggered only by termination, delivery of possession AND the tenant's demand. returnDays is set to 14; the generator should say 'business days' rather than calendar days.",
    "Deposit cap of 1.5 months covers 'security, however denominated, including prepaid rent.' The statute does not say whether separately designated nonrefundable fees (cleaning, redecorating) count toward the cap; conservative practice is to keep deposit plus nonrefundable fees within 1.5 months. Attorney to confirm.",
    "Entry notice is 'two days' notice' (not hours); encoded as 48 hours. § 33-1343(B) makes a tenant maintenance request automatic permission to enter for that request.",
    "DV termination (§ 33-1318) requires the incident within 30 days before notice and a release date within 30 days, and it terminates the tenancy for ALL co-tenants (non-victim co-tenants 'may be released' and re-apply). No third-party certification option; only a protective order or a police departmental report. The waiver ban in § 33-1315(A)(1) applies.",
    "§ 33-1318.01 (law enforcement officers) says termination is 'in the same manner established in section 33-1318' but only requires a written notice that the officer is protected by a harassment injunction; it is unclear whether a copy of the injunction must accompany the notice. Lease text states only the statutory requirement.",
    "No statutory cap on early termination fees or liquidated damages; any lease-break fee is subject to § 33-1321(D) (deductions 'subject to a landlord's duty to mitigate') and general contract/penalty law.",
    "§ 33-1315(A)(4)–(5) bars lease terms that limit or penalize calling police or emergency assistance; generator crime/nuisance clauses must not do so.",
    "§ 33-1329 preempts city rent control. Several Arizona cities (for example Phoenix, Tucson, Tempe and Flagstaff) have local fair housing ordinances that may add protected classes such as sexual orientation, gender identity or source of income; verify for the property's city. State law adds no classes beyond the federal seven (§ 41-1491.14 covers race, color, religion, sex, familial status, national origin; § 41-1491.19 disability).",
    "§ 33-1322(E): a written lease must have all blank spaces completed; noncompliance is a material noncompliance. Generator should not leave blanks.",
    "Bed bug educational materials (§ 33-1319) are required for existing and new tenants except in single family residences; the text above assumes Landlord actually provides the materials with the lease.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
