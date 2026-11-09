import type { StateLawProfile } from "../types";

const NEB = (s: string) => `https://nebraskalegislature.gov/laws/statutes.php?statute=${s}`;

export const NE: StateLawProfile = {
  code: "NE",
  name: "Nebraska",
  framework: "Nebraska Uniform Residential Landlord and Tenant Act, Neb. Rev. Stat. §§ 76-1401 to 76-1449",

  deposit: {
    maxMonths: 1,
    capRule:
      "The security deposit may not exceed one month's periodic rent, except that Landlord may also collect a pet deposit of no more than one-fourth of one month's periodic rent when appropriate. The cap does not apply to housing agencies under the Nebraska Housing Agency Act.",
    capCite: "Neb. Rev. Stat. § 76-1416(1)",
    returnDays: 14,
    returnRule:
      "When the tenancy ends, Landlord may apply prepaid rent and the security deposit to rent owed and to damages Landlord has suffered because of Tenant's noncompliance with this Lease or Neb. Rev. Stat. § 76-1421. Landlord will deliver or mail the balance, if any, with a written itemization, to Tenant within 14 days after the tenancy ends. If Tenant has not given Landlord a mailing address or instructions, Landlord will mail the balance and a written itemization of any amount not returned by first-class mail to Tenant's last-known mailing address.",
    returnCite: "Neb. Rev. Stat. § 76-1416(2)",
    holdingRule: "",
    holdingCite: null,
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
      "Either Landlord or Tenant may terminate a month-to-month tenancy by written notice given to the other at least 30 days before the periodic rental date specified in the notice.",
    monthToMonthCite: "Neb. Rev. Stat. § 76-1437(2)",
    nonpaymentDays: 7,
    nonpaymentRule:
      "If rent is unpaid when due, Landlord may terminate this Lease if Tenant fails to pay within seven calendar days after Landlord gives written notice of the nonpayment and of Landlord's intention to terminate this Lease if the rent is not paid within that period.",
    nonpaymentCite: "Neb. Rev. Stat. § 76-1431(2)",
    entryHours: 24,
    entryRule:
      "Tenant will not unreasonably withhold consent for Landlord to enter the Property to inspect it, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show it to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or when it is impracticable, Landlord will give Tenant at least 24 hours' written notice of Landlord's intent to enter, stating the intended purpose of the entry and a reasonable period during which Landlord expects to enter, and will enter only at reasonable times. Landlord may enter without Tenant's consent in an emergency, and during any absence of Tenant longer than seven days at times reasonably necessary. Landlord will not abuse the right of access or use it to harass Tenant.",
    entryCite: "Neb. Rev. Stat. §§ 76-1423, 76-1432(2)",
  },

  earlyTermination: {
    military: {
      label: "Military relocation to government housing (Nebraska law)",
      cite: "Neb. Rev. Stat. §§ 55-701, 55-702",
      eligible:
        "Tenant may terminate this Lease if Tenant is a servicemember who receives military orders to relocate for a period of service of at least 90 days to a location not covered by this Lease and is required to move into government-owned or government-leased housing. Servicemember includes a member or reserve member of the armed forces on full-time active federal duty, and a member of the Nebraska National Guard called to active service by the President or the Secretary of Defense for more than 30 days in response to a declared national emergency, or by the Governor for more than 30 consecutive days. This right does not apply when the servicemember's spouse is a tenant and government-owned or government-leased housing is not available to the spouse.",
      notice:
        "Tenant delivers a written or electronic notice of termination to Landlord. If rent is payable monthly, termination is effective 30 days after the first date on which the next rental payment is due after the notice is delivered; otherwise, termination is effective on the last day of the month following the month in which the notice is delivered.",
      documentation: "The notice must include a copy of the servicemember's military orders.",
      liability:
        "Landlord will not impose an early termination charge, penalty, fee, or loss of deposit because of the termination. Tenant remains responsible for any obligation under this Lease that is due and unpaid at the time of termination. Within 60 days after the termination date, Landlord will refund all rent paid for any period after that date, and the security deposit will be returned as provided in Neb. Rev. Stat. § 76-1416.",
    },

    domesticViolence: {
      label: "Domestic violence, sexual assault, stalking, or trafficking",
      cite: "Neb. Rev. Stat. §§ 76-1410, 76-1431.01",
      eligible:
        "Tenant may obtain a release from this Lease if Tenant or a household member (a child or adult, other than the perpetrator, who resides with Tenant) is a victim of an act of domestic violence, which under Neb. Rev. Stat. § 76-1410 includes abuse as defined in § 42-903, sexual assault, domestic assault, stalking, labor or sex trafficking, and knowing and intentional abuse, neglect, or exploitation of a vulnerable adult or senior adult. A Tenant who is the perpetrator of the act may not obtain a release.",
      notice:
        "Tenant must give Landlord a written notice stating (1) the date on which Tenant wishes the release to be effective, which must be at least 14 days and no more than 30 days after the date Tenant provides the documentation and notice, and (2) the names of any household members to be released in addition to Tenant.",
      documentation:
        "Tenant must give Landlord a copy of a protective order, restraining order, or other similar relief that applies to the perpetrator, or a certification confirming the domestic violence from a qualified third party (a 501(c)(3) nonprofit organization or a federally recognized Indian tribe within Nebraska that has an affiliation agreement with the Nebraska Department of Health and Human Services to serve victims of domestic violence and sexual assault), as provided in the housing protections of the federal Violence Against Women Reauthorization Act of 2013.",
      liability:
        "Tenant remains liable for rent for the month in which Tenant terminates this Lease. Tenant and any released household member are not liable for rent or for damage to the Property incurred after the release date, and are not subject to any fee solely because of the termination. Other tenants who are parties to this Lease, other than released household members, remain bound by it.",
    },

    other: [
      {
        label: "Property damaged or destroyed by fire or casualty",
        cite: "Neb. Rev. Stat. § 76-1429",
        eligible:
          "If the Property is damaged or destroyed by fire or casualty so that Tenant's enjoyment of it is substantially impaired, Tenant may terminate this Lease.",
        notice:
          "Tenant may vacate the Property immediately and must notify Landlord in writing within 14 days afterward of Tenant's intention to terminate, in which case this Lease terminates as of the date Tenant vacated.",
        documentation: "",
        liability:
          "Landlord will return all prepaid rent and recoverable security. Rent is accounted for as of the date of the casualty. Tenant remains responsible for damage caused by Tenant's negligence.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "Neb. Rev. Stat. § 76-1425(1), (4)",
        eligible:
          "Tenant may terminate this Lease if Landlord materially fails to comply with this Lease, or fails to comply with Neb. Rev. Stat. § 76-1419 in a way that materially affects health and safety, unless the condition was caused by the deliberate or negligent act or omission of Tenant, a member of Tenant's family, or another person on the Property with Tenant's consent.",
        notice:
          "Tenant must deliver a written notice to Landlord specifying the acts and omissions constituting the breach and stating that this Lease will terminate on a date not less than 30 days after Landlord receives the notice if the breach is not remedied within 14 days. If Landlord adequately remedies the breach before the date in the notice, this Lease does not terminate. If substantially the same act or omission recurs within six months, Tenant may terminate on at least 14 days' written notice specifying the breach and the termination date.",
        documentation: "",
        liability: "Landlord will return all prepaid rent and recoverable security.",
      },
      {
        label: "Unlawful ouster, exclusion, or utility interruption",
        cite: "Neb. Rev. Stat. § 76-1430",
        eligible:
          "Tenant may terminate this Lease if Landlord unlawfully removes or excludes Tenant from the Property, or willfully and wrongfully diminishes services by interrupting or causing the interruption of electric, gas, water, or other essential service.",
        notice: "Tenant may elect to terminate this Lease upon Landlord's violation.",
        documentation: "",
        liability:
          "Landlord will return all prepaid rent and recoverable security, and Tenant may recover three months' periodic rent as liquidated damages and a reasonable attorney's fee.",
      },
      {
        label: "Unlawful entry or harassment by Landlord",
        cite: "Neb. Rev. Stat. § 76-1438(2)",
        eligible:
          "If Landlord makes an unlawful entry, makes a lawful entry in an unreasonable manner, or makes repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "Tenant may elect to terminate this Lease upon Landlord's violation.",
        documentation: "",
        liability:
          "Tenant may also recover actual damages of not less than one month's rent and reasonable attorney's fees.",
      },
    ],

    feeCap: null,

    mitigation: {
      basis: "statute",
      cite: "Neb. Rev. Stat. §§ 76-1405(1), 76-1432(3)",
      rule:
        "If Tenant abandons the Property, Landlord will take possession and make reasonable efforts to rent it at a fair rental. If Landlord rents the Property for a term beginning before this Lease ends, this Lease terminates on the date the new tenancy begins.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Manager, owner, and agent for notices",
      text:
        "This Lease states the name and address of the person authorized to manage the Property and of an owner of the Property or a person authorized to act for the owner for service of process and for receiving and receipting for notices and demands. Landlord will keep this information current.",
      cite: "Neb. Rev. Stat. § 76-1417",
    },
  ],

  fairHousing: {
    stateClasses: ["military or veteran status"],
    cite: "Neb. Rev. Stat. §§ 20-318, 20-322 (Nebraska Fair Housing Act)",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through an action for possession (complaint for restitution) in county or district court under Neb. Rev. Stat. §§ 76-1440 to 76-1447. Landlord will not recover or take possession by willfully interrupting electric, gas, water, or other essential services, or by any other self-help, except in case of abandonment or surrender.",
    cite: "Neb. Rev. Stat. §§ 76-1436, 76-1440, 76-1441",
  },

  habitability: {
    rule:
      "After written or actual notice, Landlord will substantially comply with applicable minimum housing codes materially affecting health and safety and make all repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition. Landlord will keep common areas clean and safe; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances, including elevators, that Landlord supplies or is required to supply; provide waste receptacles and arrange for removal; and supply running water, reasonable amounts of hot water at all times, and reasonable heat unless heat or hot water is generated by an installation within Tenant's exclusive control and supplied by a direct public utility connection.",
    cite: "Neb. Rev. Stat. § 76-1419(1)",
  },

  sources: [
    { cite: "Neb. Rev. Stat. § 76-1405", url: NEB("76-1405") },
    { cite: "Neb. Rev. Stat. § 76-1408", url: NEB("76-1408") },
    { cite: "Neb. Rev. Stat. § 76-1410", url: NEB("76-1410") },
    { cite: "Neb. Rev. Stat. § 76-1412", url: NEB("76-1412") },
    { cite: "Neb. Rev. Stat. § 76-1413", url: NEB("76-1413") },
    { cite: "Neb. Rev. Stat. § 76-1414", url: NEB("76-1414") },
    { cite: "Neb. Rev. Stat. § 76-1415", url: NEB("76-1415") },
    { cite: "Neb. Rev. Stat. § 76-1416", url: NEB("76-1416") },
    { cite: "Neb. Rev. Stat. § 76-1417", url: NEB("76-1417") },
    { cite: "Neb. Rev. Stat. § 76-1419", url: NEB("76-1419") },
    { cite: "Neb. Rev. Stat. § 76-1423", url: NEB("76-1423") },
    { cite: "Neb. Rev. Stat. § 76-1425", url: NEB("76-1425") },
    { cite: "Neb. Rev. Stat. § 76-1427", url: NEB("76-1427") },
    { cite: "Neb. Rev. Stat. § 76-1429", url: NEB("76-1429") },
    { cite: "Neb. Rev. Stat. § 76-1430", url: NEB("76-1430") },
    { cite: "Neb. Rev. Stat. § 76-1431", url: NEB("76-1431") },
    { cite: "Neb. Rev. Stat. § 76-1431.01", url: NEB("76-1431.01") },
    { cite: "Neb. Rev. Stat. § 76-1431.02", url: NEB("76-1431.02") },
    { cite: "Neb. Rev. Stat. § 76-1431.03", url: NEB("76-1431.03") },
    { cite: "Neb. Rev. Stat. § 76-1431.04", url: NEB("76-1431.04") },
    { cite: "Neb. Rev. Stat. § 76-1432", url: NEB("76-1432") },
    { cite: "Neb. Rev. Stat. § 76-1436", url: NEB("76-1436") },
    { cite: "Neb. Rev. Stat. § 76-1437", url: NEB("76-1437") },
    { cite: "Neb. Rev. Stat. § 76-1438", url: NEB("76-1438") },
    { cite: "Neb. Rev. Stat. § 76-1440", url: NEB("76-1440") },
    { cite: "Neb. Rev. Stat. § 76-1441", url: NEB("76-1441") },
    { cite: "Neb. Rev. Stat. § 55-701", url: NEB("55-701") },
    { cite: "Neb. Rev. Stat. § 55-702", url: NEB("55-702") },
    { cite: "Neb. Rev. Stat. § 55-703", url: NEB("55-703") },
    { cite: "Neb. Rev. Stat. § 55-704", url: NEB("55-704") },
    { cite: "Neb. Rev. Stat. § 20-318", url: NEB("20-318") },
    { cite: "Neb. Rev. Stat. § 20-322", url: NEB("20-322") },
  ],

  reviewNotes: [
    "PROHIBITED CLAUSES: § 76-1415 bars rental agreement terms under which the tenant agrees to pay the landlord's or tenant's attorney's fees, waives Act rights, confesses judgment, or exculpates/indemnifies the landlord for the landlord's active and actionable negligence. Deliberate use exposes the landlord to actual damages plus attorney's fees. Omit fee-shifting clauses for Nebraska (the Act itself awards fees in several sections).",
    "ELECTRONIC NOTICES (LB185, 2025): § 76-1413 lets notices be delivered electronically only after the tenant affirmatively consents following a clear and conspicuous statement of rights (withdrawal, scope, paper copies, hardware/software requirements), and § 76-1413(9) forbids requiring e-delivery as a condition of entering or renewing a lease. Where receipt verification is required, unverified e-delivery must be followed by mail. Keycove's e-notice/e-sign onboarding for Nebraska tenants needs a separate, optional consent flow.",
    "MILITARY: § 55-702 (2018) is narrow: orders to relocate for 90+ days AND required to move into government-owned or leased housing. It covers Nebraska Guard members on Governor-ordered duty over 30 consecutive days, which SCRA does not. Not applicable where a servicemember's spouse is a tenant and government housing is unavailable to the spouse.",
    "DOMESTIC VIOLENCE: Release under § 76-1431.01 requires a protective/restraining order or a qualified third-party certification (definition in § 76-1410(11)); a police report alone does not qualify. Tenant owes rent for the month in which the tenant terminates. LB80 (2025) added § 76-1431.02 (tenant may have a perpetrator cotenant/occupant removed from the lease via the 5-day § 76-1431(4) process) and §§ 76-1431.03-.04 (landlord must change locks within 24 hours of a documented request; tenant may be charged actual reasonable cost). Consider adding these as lease clauses.",
    "LATE FEES: No Nebraska statute sets a grace period or cap; unconscionability review applies (§ 76-1412). Case law not read.",
    "DEPOSIT: 14-day return clock runs from termination regardless of forwarding address; willful bad-faith failure exposes landlord to liquidated damages of the lesser of one month's rent or 2x the deposit plus fees (§ 76-1416(3)). Unreturned balances outstanding one year go to the State Treasurer as unclaimed property.",
    "CO-LIVING: The Nebraska Fair Housing Act does not apply to renting rooms in the owner's own home unless more than four sleeping rooms are offered (§ 20-322(3)); federal FHA exemptions differ. Roomers paying weekly are week-to-week by default (§ 76-1414(4)).",
    "OTHER: Violent criminal activity or drug sales allow a 5-day no-cure termination (§ 76-1431(4)), but not against a tenant victim who takes protective measures (§ 76-1431(5)). Optional death-contact designation under § 76-1414(5). Tenant-performed repairs require a writing (single-family) or separate signed writing (other units) (§ 76-1419(2)-(3)). §§ 76-1439 (retaliation) and 76-1426 (failure to deliver possession) were not read.",
    "LOCAL LAW: Omaha and Lincoln rental registration/inspection and local fair housing ordinances were not reviewed.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
