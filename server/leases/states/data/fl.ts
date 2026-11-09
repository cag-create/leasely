import type { StateLawProfile } from "../types";

const FLSEC = (s: string) => {
  const [ch] = s.split(".");
  const chPad = ch.padStart(4, "0");
  const range = `${String(Math.floor(Number(ch) / 100) * 100).padStart(4, "0")}-${String(Math.floor(Number(ch) / 100) * 100 + 99).padStart(4, "0")}`;
  return `http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=${range}/${chPad}/Sections/${chPad}.${s.split(".")[1]}.html`;
};
const CH83 = "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0083/0083.html";

export const FL: StateLawProfile = {
  code: "FL",
  name: "Florida",
  framework: "Florida Residential Landlord and Tenant Act, Fla. Stat. Part II of Chapter 83 (§§ 83.40-83.684)",

  deposit: {
    maxMonths: null,
    capRule: "Florida law sets no maximum security deposit.",
    capCite: null,
    returnDays: 30,
    returnRule:
      "If Landlord does not intend to make a claim on the security deposit, Landlord shall return it, with any interest due, within 15 days after this Lease ends and Tenant vacates. If Landlord intends to make a claim, Landlord shall, within 30 days after this Lease ends, send Tenant written notice of the claim and the reason for it by certified mail to Tenant's last known mailing address, or by e-mail if the parties have signed an electronic-notice addendum under Fla. Stat. § 83.505. Tenant then has 15 days after receiving the notice to object in writing. If Tenant does not object, Landlord may deduct the claim and shall send Tenant the balance within 30 days after the date of the notice. If Landlord does not send the notice within 30 days, Landlord forfeits the right to make a claim against the deposit but may still sue for damages after returning it. Before vacating, Tenant shall give Landlord at least 7 days' written notice by certified mail or personal delivery that includes an address where Tenant can be reached; if Tenant does not, Landlord is relieved of the notice requirement above, but Tenant does not lose any right to the deposit.",
    returnCite: "Fla. Stat. § 83.49(3), (5)",
    holdingRule:
      "Landlord shall either (a) hold the security deposit and any advance rent in a separate non-interest-bearing account in a Florida financial institution; (b) hold it in a separate interest-bearing account in a Florida financial institution, in which case Tenant receives interest of at least 75% of the annualized average interest rate paid on the account or 5% simple interest per year, whichever Landlord elects; or (c) post a surety bond with the clerk of the circuit court and pay Tenant 5% simple interest per year. Landlord will not commingle, pledge, or use the money until it is actually due to Landlord. When interest is owed, Landlord will pay it to Tenant or credit it against rent at least once a year (but not to a Tenant who wrongfully ends the tenancy early). If Landlord rents five or more dwelling units, Landlord will give Tenant written notice, in this Lease or within 30 days after receiving the deposit, of the name and address of the depository holding it (or that Landlord has posted a surety bond) and whether Tenant is entitled to interest, and will give notice within 30 days of any change in how or where it is held.",
    holdingCite: "Fla. Stat. § 83.49(1), (2), (9)",
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
      "Either party may end a month-to-month tenancy by written notice given at least 30 days before the end of any monthly period (7 days before the end of a weekly period, 30 days before the end of a quarterly period, or 60 days before the end of an annual period). Notice is delivered by mail, by hand, by e-mail under a signed electronic-notice addendum, or, if Tenant is absent, by leaving a copy at the residence.",
    monthToMonthCite: "Fla. Stat. §§ 83.57, 83.56(4)",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If rent is not paid when due and remains unpaid for 3 days, excluding Saturdays, Sundays, and court-observed legal holidays, after Landlord delivers a written demand for payment of the rent or possession of the Property, Landlord may terminate this Lease. This notice requirement cannot be waived. If Landlord accepts partial rent after posting the notice, Landlord will give Tenant a receipt stating the amount received and the agreed date and balance due, deposit the partial rent into the court registry when filing, or post a new 3-day notice for the new amount due.",
    nonpaymentCite: "Fla. Stat. § 83.56(3)-(5)",
    entryHours: 24,
    entryRule:
      "Tenant shall not unreasonably withhold consent for Landlord to enter from time to time to inspect the Property, make necessary or agreed repairs, decorations, alterations, or improvements, supply agreed services, or show the Property to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Landlord may enter at any time to protect or preserve the Property. To make repairs, Landlord will give Tenant at least 24 hours' notice and will enter only between 7:30 a.m. and 8:00 p.m. For the other purposes listed above, Landlord may enter with Tenant's consent, in an emergency, when Tenant unreasonably withholds consent, or when Tenant has been absent for one-half of a rental payment period. If rent is current and Tenant has told Landlord of an intended absence, Landlord will enter during that absence only with Tenant's consent or to protect or preserve the Property. Landlord will not abuse the right of access or use it to harass Tenant.",
    entryCite: "Fla. Stat. § 83.53",
  },

  earlyTermination: {
    military: {
      label: "Military service (Florida law)",
      cite: "Fla. Stat. §§ 83.682, 83.43(15)-(16), 250.01(19), (21)",
      eligible:
        "A servicemember (any member of the United States Armed Forces on active duty or state active duty, and any member of the Florida National Guard or the United States Reserve Forces) may terminate this Lease if: (1) permanent change of station orders require a move of 35 miles or more from the Property; (2) the servicemember is prematurely or involuntarily discharged or released from active duty or state active duty; (3) the servicemember is released from active duty or state active duty after leasing the Property while on that duty, and the Property is 35 miles or more from the servicemember's home of record before entering that duty; (4) after signing this Lease, the servicemember receives orders to move into government quarters (including privatized military housing) or becomes eligible for and chooses to move into government quarters; (5) the servicemember receives temporary duty orders, temporary change of station orders, or state active duty orders for more than 60 days to an area 35 miles or more from the Property; or (6) before taking possession, the servicemember receives a change of orders to an area 35 miles or more from the Property. If a servicemember dies during active duty, an adult member of the servicemember's immediate family may terminate this Lease.",
      notice:
        "Tenant gives Landlord written notice of termination, effective on a date stated in the notice that is at least 30 days after Landlord receives it.",
      documentation:
        "The notice must include a copy of the official military orders or a written verification signed by the servicemember's commanding officer. For a death during active duty, the notice must include a copy of the orders showing active duty or the commanding officer's written verification, and a copy of the death certificate.",
      liability:
        "Tenant owes rent prorated to the effective date of termination, payable when it would otherwise be due, and no other rent or damages because of the early termination, including the early termination fee. No damages or penalties of any kind are owed if Tenant terminates 14 or more days before occupancy. This right cannot be waived or modified by agreement.",
    },
    domesticViolence: null,
    other: [
      {
        label: "Casualty damage",
        cite: "Fla. Stat. § 83.63",
        eligible:
          "If the Property is damaged or destroyed, other than by the wrongful or negligent acts of Tenant, so that Tenant's enjoyment of it is substantially impaired, Tenant may terminate this Lease.",
        notice:
          "Tenant may terminate and vacate immediately. Tenant may instead vacate only the part of the Property made unusable, in which case rent is reduced by the fair rental value of that part.",
        documentation: "",
        liability:
          "No early termination fee is owed. Landlord handles the security deposit as required by Fla. Stat. § 83.49(3). Tenant will be given the opportunity to collect belongings when it is safe to do so, or notice of a date within a reasonable time by which Tenant may collect them.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "Fla. Stat. § 83.56(1)",
        eligible:
          "If Landlord materially fails to comply with Fla. Stat. § 83.51(1) (building, housing, and health codes, or structural and plumbing maintenance where no code applies) or with material provisions of this Lease, Tenant may terminate this Lease.",
        notice:
          "Tenant delivers written notice specifying the noncompliance and stating Tenant's intent to terminate for that reason. Tenant may terminate if Landlord does not comply within 7 days after the notice is delivered.",
        documentation: "",
        liability:
          "No early termination fee is owed. If the failure is beyond Landlord's control and Landlord is making every reasonable effort to correct it, and the Property is untenantable and Tenant vacates, Tenant owes no rent while the Property remains uninhabitable.",
      },
      {
        label: "Flooding after a missing flood disclosure",
        cite: "Fla. Stat. § 83.512(2)-(4)",
        eligible:
          "If Landlord did not provide the flood disclosure required by Fla. Stat. § 83.512 and Tenant suffers substantial loss or damage to Tenant's personal property from flooding (repair or replacement costing 50% or more of the property's market value on the date of the flood), Tenant may terminate this Lease.",
        notice:
          "Tenant gives written notice of termination and surrenders possession no later than 30 days after the loss or damage. Termination is effective when Tenant surrenders possession.",
        documentation: "",
        liability:
          "Landlord refunds all rent and other amounts paid in advance for any period after termination. Tenant still owes any delinquent rent or other sums owed before termination. No early termination fee is owed.",
      },
    ],
    feeCap: {
      maxMonthsRent: 2,
      rule:
        "Under Florida law, liquidated damages or an early termination fee may not exceed two months' rent, the advance notice of early termination required from Tenant may not exceed 60 days, and the fee may be charged only if Tenant accepted it when this Lease was signed by checking the \"I agree\" box on a separate signed addendum in the statutory form. If Tenant did not accept the addendum, no early termination fee applies and Landlord may seek damages only as provided by law.",
      cite: "Fla. Stat. §§ 83.595(4), 83.43(6)",
    },
    mitigation: {
      basis: "statute",
      cite: "Fla. Stat. § 83.595",
      rule:
        "If Landlord retakes possession of the Property for Tenant's account, Landlord shall exercise good faith in attempting to re-rent it, using at least the same efforts Landlord used in the initial rental or uses to rent its other similar units, and rent received from re-renting will be deducted from the rent Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "radon",
      title: "Radon Gas",
      text:
        "RADON GAS: Radon is a naturally occurring radioactive gas that, when it has accumulated in a building in sufficient quantities, may present health risks to persons who are exposed to it over time. Levels of radon that exceed federal and state guidelines have been found in buildings in Florida. Additional information regarding radon and radon testing may be obtained from your county health department.",
      cite: "Fla. Stat. § 404.056(5)",
    },
    {
      id: "landlord_address",
      title: "Landlord's Name and Address",
      text:
        "The landlord, or the person authorized to receive notices and demands on the landlord's behalf, is {{landlord_name}}, {{landlord_address}}. That person keeps this authority until Tenant is notified otherwise.",
      cite: "Fla. Stat. § 83.50",
    },
    {
      id: "deposit_disclosure",
      title: "Security Deposit Disclosure",
      condition:
        "Required where Landlord rents five or more dwelling units; Landlord also states in writing the name and address of the depository (or that a surety bond has been posted) and whether Tenant is entitled to interest",
      text:
        "YOUR RENTAL AGREEMENT REQUIRES PAYMENT OF CERTAIN DEPOSITS. THE LANDLORD MAY TRANSFER ADVANCE RENTS TO THE LANDLORD'S ACCOUNT AS THEY ARE DUE AND WITHOUT NOTICE. WHEN YOU MOVE OUT, YOU MUST GIVE THE LANDLORD YOUR NEW ADDRESS SO THAT THE LANDLORD CAN SEND YOU NOTICES REGARDING YOUR DEPOSIT. THE LANDLORD MUST PROVIDE YOU WRITTEN NOTICE IN PERSON, BY MAIL, OR BY E-MAIL IN ACCORDANCE WITH SECTION 83.505, FLORIDA STATUTES, WITHIN 30 DAYS AFTER YOU MOVE OUT, OF THE LANDLORD'S INTENT TO IMPOSE A CLAIM AGAINST THE DEPOSIT. IF YOU DO NOT REPLY TO THE LANDLORD STATING YOUR OBJECTION TO THE CLAIM WITHIN 15 DAYS AFTER RECEIPT OF THE LANDLORD'S WRITTEN NOTICE, THE LANDLORD WILL COLLECT THE CLAIM AND MUST MAIL YOU THE REMAINING DEPOSIT, IF ANY. IF THE LANDLORD FAILS TO TIMELY PROVIDE YOU NOTICE, THE LANDLORD MUST RETURN THE DEPOSIT BUT MAY LATER FILE A LAWSUIT AGAINST YOU FOR DAMAGES. IF YOU FAIL TO TIMELY OBJECT TO A CLAIM, THE LANDLORD MAY COLLECT FROM THE DEPOSIT, BUT YOU MAY LATER FILE A LAWSUIT CLAIMING A REFUND. YOU SHOULD ATTEMPT TO INFORMALLY RESOLVE ANY DISPUTE BEFORE FILING A LAWSUIT. GENERALLY, THE PARTY IN WHOSE FAVOR A JUDGMENT IS RENDERED WILL BE AWARDED COSTS AND ATTORNEY FEES PAYABLE BY THE LOSING PARTY. THIS DISCLOSURE IS BASIC. PLEASE REFER TO PART II OF CHAPTER 83, FLORIDA STATUTES, TO DETERMINE YOUR LEGAL RIGHTS AND OBLIGATIONS.",
      cite: "Fla. Stat. § 83.49(2)",
    },
    {
      id: "flood_disclosure",
      title: "Flood Disclosure",
      condition: "For a rental agreement with a term of 1 year or longer",
      text:
        "Before this Lease was signed, Landlord gave Tenant, as a separate document, the Florida flood disclosure stating whether Landlord has knowledge of any flooding that damaged the dwelling unit during Landlord's ownership, has filed a flood-damage insurance claim (including with the National Flood Insurance Program), or has received flood-damage assistance (including from the Federal Emergency Management Agency). Renters' insurance policies do not include coverage for damage resulting from floods. Tenant is encouraged to discuss the need to purchase separate flood insurance coverage with Tenant's insurance agent.",
      cite: "Fla. Stat. § 83.512(1)",
    },
    {
      id: "smoke_detectors",
      title: "Smoke Detection Devices",
      condition: "For a single-family home or duplex",
      text:
        "Unless otherwise agreed in writing, Landlord has installed working smoke detection devices at the start of the tenancy.",
      cite: "Fla. Stat. § 83.51(2)(b)",
    },
  ],

  additionalClauses: [
    {
      title: "Florida Early Termination Fee Addendum Required",
      text:
        "The early termination fee option in this Lease applies only if Tenant signed, when this Lease was made, a separate addendum in substantially the following form and checked the first box: \"[ ] I agree, as provided in the rental agreement, to pay $____ (an amount that does not exceed 2 months' rent) as liquidated damages or an early termination fee if I elect to terminate the rental agreement, and the landlord waives the right to seek additional rent beyond the month in which the landlord retakes possession. [ ] I do not agree to liquidated damages or an early termination fee, and I acknowledge that the landlord may seek damages as provided by law.\" When the fee applies, Landlord may also collect rent and other charges accrued through the end of the month in which Landlord retakes possession and charges for damage to the Property, and the advance notice required of Tenant may not exceed 60 days.",
      cite: "Fla. Stat. § 83.595(4)",
    },
    {
      title: "Electronic Delivery of Notices",
      text:
        "Notices required by this Lease or by Part II of Chapter 83, Florida Statutes, may be delivered by e-mail only if Landlord and Tenant have signed a separate addendum in the form required by Fla. Stat. § 83.505, each designating an e-mail address. That election is voluntary and either party may revoke it or update the designated e-mail address at any time by written notice. Otherwise, notices are delivered by mail or by hand, or, if Tenant is absent from the Property, by leaving a copy at the residence.",
      cite: "Fla. Stat. §§ 83.505, 83.56(4)",
    },
  ],

  fairHousing: {
    stateClasses: ["servicemember status"],
    cite: "Fla. Stat. §§ 760.23 (Florida Fair Housing Act: race, color, national origin, sex, disability, familial status, religion), 83.67(3) (servicemembers)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only by filing an action for possession in the county court where the Property is located, using the summary procedure of Fla. Stat. § 51.011, or when Tenant has surrendered or abandoned the Property. Landlord will not cut off or interrupt any utility service, change the locks or use a bootlock or similar device, remove outside doors, locks, roof, walls, or windows (except for maintenance, repair, or replacement), or remove Tenant's belongings to regain possession.",
    cite: "Fla. Stat. §§ 83.59, 83.67",
  },

  habitability: {
    rule:
      "Landlord shall comply with applicable building, housing, and health codes, or, where none apply, keep the roof, windows, doors, floors, steps, porches, exterior walls, foundations, and other structural components in good repair and the plumbing in reasonable working condition. Landlord shall install screens in reasonable condition at the start of the tenancy and repair screen damage once a year when needed. For a unit other than a single-family home or duplex, unless otherwise agreed in writing, Landlord shall also make reasonable provision for extermination of rats, mice, roaches, ants, wood-destroying organisms, and bedbugs (with rent abated and at least 7 days' written notice if Tenant must vacate, for no more than 4 days), locks and keys, clean and safe common areas, garbage removal and outside receptacles, and functioning heat during winter, running water, and hot water.",
    cite: "Fla. Stat. § 83.51",
  },

  sources: [
    { cite: "Fla. Stat. Chapter 83, Part II (2026), full chapter as read", url: CH83 },
    { cite: "Fla. Stat. § 83.425", url: FLSEC("83.425") },
    { cite: "Fla. Stat. § 83.43", url: FLSEC("83.43") },
    { cite: "Fla. Stat. § 83.44", url: FLSEC("83.44") },
    { cite: "Fla. Stat. § 83.45", url: FLSEC("83.45") },
    { cite: "Fla. Stat. § 83.46", url: FLSEC("83.46") },
    { cite: "Fla. Stat. § 83.47", url: FLSEC("83.47") },
    { cite: "Fla. Stat. § 83.49", url: FLSEC("83.49") },
    { cite: "Fla. Stat. § 83.50", url: FLSEC("83.50") },
    { cite: "Fla. Stat. § 83.505", url: FLSEC("83.505") },
    { cite: "Fla. Stat. § 83.51", url: FLSEC("83.51") },
    { cite: "Fla. Stat. § 83.512", url: FLSEC("83.512") },
    { cite: "Fla. Stat. § 83.53", url: FLSEC("83.53") },
    { cite: "Fla. Stat. § 83.56", url: FLSEC("83.56") },
    { cite: "Fla. Stat. § 83.57", url: FLSEC("83.57") },
    { cite: "Fla. Stat. § 83.575", url: FLSEC("83.575") },
    { cite: "Fla. Stat. § 83.59", url: FLSEC("83.59") },
    { cite: "Fla. Stat. § 83.595", url: FLSEC("83.595") },
    { cite: "Fla. Stat. § 83.63", url: FLSEC("83.63") },
    { cite: "Fla. Stat. § 83.67", url: FLSEC("83.67") },
    { cite: "Fla. Stat. § 83.682", url: FLSEC("83.682") },
    { cite: "Fla. Stat. § 250.01", url: FLSEC("250.01") },
    { cite: "Fla. Stat. § 404.056", url: FLSEC("404.056") },
    { cite: "Fla. Stat. § 760.22", url: FLSEC("760.22") },
    { cite: "Fla. Stat. § 760.23", url: FLSEC("760.23") },
  ],

  reviewNotes: [
    "No domestic violence lease-termination statute. The 2026 text of Part II of Chapter 83 has no such section; bills filed in 2005, 2007, 2009, and 2022 were never enacted. domesticViolence is null, and VAWA protections in federally assisted housing are outside this profile.",
    "EARLY TERMINATION FEE (important): § 83.595(4) caps liquidated damages or an early termination fee at two months' rent, limits the required notice to 60 days, and makes the fee available ONLY if the tenant checked 'I agree' on a SEPARATE ADDENDUM in the statutory form at signing. compute.ts clamps the notice period at 90 days (MAX_EARLY_TERMINATION_NOTICE_DAYS); Florida needs a 60-day clamp. Keycove also needs to generate and collect the separate addendum. The additionalClauses entry quotes the form but is not itself a separate signed addendum. If the tenant declines, the builder's paragraph (a) fee must not be charged.",
    "E-MAIL NOTICES: § 83.505 (2025, ch. 2025-16) allows e-mail delivery of Chapter 83 notices only after both parties sign a voluntary addendum in the statutory form. The builder's General Provisions say notices may go 'by email ... unless the law requires a particular method,' which arguably conflicts in Florida. The FL additional clause states the addendum condition, and Keycove should offer the § 83.505 addendum as a separate signed document.",
    "FLOOD DISCLOSURE: § 83.512 (ch. 2025-166, effective 2025) requires a separate-document flood disclosure in the statutory form, delivered at or before execution of any lease of 1 year or longer. The lease disclosure only recites that it was given. Keycove must generate the separate form, with the three has/has not checkboxes and the definition of 'flooding'.",
    "Military: § 83.682 is broad. It covers active duty AND state active duty, all Florida National Guard and Reserve members (via § 250.01(19)), government-quarters moves, and orders of more than 60 days at 35 miles or more, and it bars any damages or penalties. It cannot be waived. § 83.67(3) also bars discrimination against servicemembers in renting or lease terms.",
    "Deposit interest is required only if the landlord elects an interest-bearing account or a surety bond (5%), so interestRequired is false. The 30-day depository notice and the § 83.49(2)(d) disclosure are mandatory only for landlords renting five or more units, but including them is harmless. The returnDays value (30) is the deadline for the notice of claim. With no claim, the deposit is due in 15 days.",
    "§ 83.49(5): the 7-day move-out notice from tenant applies 'except when otherwise provided by the terms of a written rental agreement.' The lease restates the statutory default.",
    "§ 83.575: a fixed-term lease may require 30 to 60 days' notice of non-renewal from the tenant only if it imposes the same notice duty on the landlord. Liquidated damages for missing that notice require a landlord reminder 15 days before the notice period. The builder does not use this; § 83.575(3) adds one month's rent if a holdover tenant fails to give month-to-month notice.",
    "No late-fee statute. Courts apply general liquidated-damages and unconscionability rules (§ 83.45). Late fees may be designated as 'rent' in a written lease (§ 83.43(12)), which brings them into the 3-day notice. Attorney to decide whether the builder should designate late fees as rent.",
    "Mitigation: § 83.595 lets the landlord choose to (1) terminate and release the tenant, (2) retake possession for the tenant's account with a good-faith duty to relet, (3) stand by and collect rent as it comes due, or (4) charge the addendum fee. The builder's paragraph (c) (rent until a replacement's rent begins, plus reletting costs) corresponds to option (2).",
    "PREEMPTION: § 83.425 (ch. 2023-314) preempts all local regulation of residential tenancies, including screening, deposits, application fees, lease terms, disclosures, fees, and notices. Local 'tenant bill of rights' ordinances adopted before 2023 are preempted as to Part II matters. Specific local ordinances were not reviewed. Local rent control is separately restricted by § 125.0103 (not read).",
    "2026 amendment: § 83.56 was amended by ch. 2026-143. The 2026 text read includes fraudulent-entry noncompliance (§ 817.537(2)) as non-curable. The 3-day nonpayment notice is unchanged.",
    "§ 83.491 (fee in lieu of security deposit, 2023) was not researched in detail. If Keycove offers deposit-alternative products in Florida, that section's disclosure and opt-in rules apply.",
    "§ 83.67(5): to avoid § 715.104 abandoned-property procedures, the lease may include a specific capitalized legend. The builder does not include it.",
    "Habitability: § 83.51(1) duties may be altered in writing for a single-family home or duplex. The § 83.51(2) duties apply 'unless otherwise agreed in writing.'",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
