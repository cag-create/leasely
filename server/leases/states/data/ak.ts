import type { StateLawProfile } from "../types";

export const AK: StateLawProfile = {
  code: "AK",
  name: "Alaska",
  framework: "Alaska Uniform Residential Landlord and Tenant Act, AS 34.03.010 - 34.03.380",

  deposit: {
    maxMonths: 2,
    capRule:
      "Landlord may not demand or receive prepaid rent or a security deposit, however denominated, totaling more than two months' periodic rent. This cap does not apply if the rent exceeds $2,000 a month. If Tenant keeps a pet on the Property that is not a service animal, Landlord may also require an additional pet deposit of no more than one month's rent, which must be accounted for separately and may be applied only to damages directly related to the pet. 'Prepaid rent' does not include the first month's rent.",
    capCite: "AS 34.03.070(a), (h); AS 34.03.360(16)",
    returnDays: 14,
    returnRule:
      "When the tenancy ends, Landlord may apply the deposit and prepaid rent only to accrued rent and to damages Landlord has suffered from Tenant's failure to meet Tenant's obligations under AS 34.03.120, not including normal wear and tear or deterioration caused by Landlord's failure to prepare for expected conditions or to meet Landlord's own obligations. Landlord will itemize the accrued rent and damages in a written notice mailed to Tenant's last known address, together with any amount due to Tenant. If Landlord or Tenant gave proper termination notice under AS 34.03.290, Landlord will mail the notice and refund within 14 days after the tenancy ends and Tenant delivers possession, or within 30 days if Landlord deducts for damage caused by Tenant's noncompliance. If Tenant did not give proper notice, Landlord will mail them within 30 days after the tenancy ends, Tenant delivers possession, or Landlord learns the unit is abandoned. If Landlord does not know Tenant's mailing address but knows how to contact Tenant, Landlord will make a reasonable effort to deliver the notice and refund. If Landlord wilfully fails to comply, Tenant may recover up to twice the amount wrongfully withheld.",
    returnCite: "AS 34.03.070(b), (d), (g)",
    holdingRule:
      "Landlord will promptly deposit all prepaid rent and security deposits, wherever practicable, in a trust account in a bank, savings and loan association, or licensed escrow agent. Landlord may keep prepaid rent and security deposits in a single account but will separately account for each tenant's prepaid rent and security deposit, will not commingle them with other funds, and will not use one tenant's money for another tenant's refund, rent, or damages. The terms and conditions under which the prepaid rent or deposit may be withheld are stated in this Lease.",
    holdingCite: "AS 34.03.070(c)",
    interestRequired: false,
    moveInInspection:
      "If Landlord requires one, Landlord and Tenant will complete a premises condition statement describing the condition of the premises, including fixtures, at the start of the tenancy, and, if the Property is furnished, a contents inventory describing each item and its condition. When signed by both parties, they become part of this Lease, Tenant will acknowledge their accuracy by signature, and they are presumptive evidence of the condition of the Property and its contents at the start of the tenancy.",
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
      "While rent is current, Landlord or Tenant may end a month-to-month tenancy by written notice given to the other at least 30 days before the rental due date specified in the notice. A week-to-week tenancy may be ended by written notice at least 14 days before the termination date.",
    monthToMonthCite: "AS 34.03.290(a), (b)",
    nonpaymentDays: 7,
    nonpaymentRule:
      "If rent is unpaid when due and Tenant does not pay it in full within seven days after Landlord's written notice of nonpayment and of Landlord's intention to terminate this Lease if rent is not paid within that time, the tenancy terminates unless Landlord agrees to let Tenant remain. If Landlord serves the notice by mail, three days are added to that period. Only one written notice is needed for any one default, and Landlord may accept a partial payment and extend the eviction date accordingly.",
    nonpaymentCite: "AS 34.03.220(b); AS 09.45.090(a)(1), (c); AS 09.45.100",
    entryHours: 24,
    entryRule:
      "Tenant will not unreasonably withhold consent for Landlord to enter to inspect the Property, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, remove Landlord's personal property not covered by this Lease, or show the unit to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or where it is impracticable, Landlord will give at least 24 hours' notice of the intent to enter and will enter only at reasonable times. Landlord may enter without consent in an emergency, during an absence of Tenant of more than seven days as reasonably necessary, or after abandonment or surrender, and will not abuse the right of access or use it to harass Tenant.",
    entryCite: "AS 34.03.140; AS 34.03.230(b)",
  },

  earlyTermination: {
    military: {
      label: "Alaska organized militia on state active duty",
      cite: "AS 26.05.135(a); AS 26.05.010(b); 50 U.S.C. § 3955",
      eligible:
        "Alaska law applies the consumer-transaction and lease protections of the federal Servicemembers Civil Relief Act to members of the organized militia (the Alaska National Guard, the Alaska Naval Militia, and the Alaska State Defense Force) while on active duty for the state by order of the governor. Such a Tenant may terminate this Lease on the same terms the Servicemembers Civil Relief Act provides for federal military service, including after entering that duty during the term of this Lease or, if Tenant signed this Lease while on that duty, after receiving orders for a permanent change of station or a deployment of at least 90 days.",
      notice:
        "Tenant delivers written notice of termination to Landlord or Landlord's agent by hand delivery, private business carrier, return-receipt mail, or an agreed electronic method. For a lease with monthly rent, termination takes effect 30 days after the first date on which the next rental payment is due after the notice is delivered.",
      documentation:
        "The notice must include a copy of the governor's order or other military orders placing Tenant on state active duty.",
      liability:
        "Unpaid rent for the period before the termination date is prorated. Landlord may not impose an early termination charge, but Tenant remains responsible for other obligations due under this Lease at termination, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days.",
    },
    domesticViolence: null,
    other: [
      {
        label: "Landlord's material noncompliance",
        cite: "AS 34.03.160(a), (d)",
        eligible:
          "If Landlord materially fails to comply with this Lease, or fails to comply with AS 34.03.100 in a way that materially affects health and safety, Tenant may terminate this Lease. Tenant may not terminate for a condition caused by the deliberate or negligent act or omission of Tenant, Tenant's family, or others on the premises with Tenant's consent.",
        notice:
          "Tenant gives Landlord written notice specifying the breach and stating that this Lease will terminate on a date at least 20 days after Landlord receives the notice if the breach is not remedied within 10 days. If Landlord remedies the breach before the termination date, this Lease does not terminate. If substantially the same breach recurs within six months without due care by Landlord, Tenant may terminate on at least 10 days' written notice specifying the breach and the termination date.",
        documentation: "",
        liability:
          "Tenant owes rent only through the termination date, and Landlord will return all prepaid rent and security deposit recoverable under AS 34.03.070.",
      },
      {
        label: "Failure to deliver possession",
        cite: "AS 34.03.170",
        eligible:
          "If Landlord fails to deliver possession of the dwelling unit at the start of the term, rent abates until possession is delivered and Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord at least 10 days' written notice of termination.",
        documentation: "",
        liability: "Tenant owes no rent, and Landlord will return all prepaid rent and security deposits.",
      },
      {
        label: "Fire or casualty damage",
        cite: "AS 34.03.200",
        eligible:
          "If the dwelling unit or premises are damaged or destroyed by fire or casualty so that Tenant's enjoyment of the unit is substantially impaired, Tenant may terminate this Lease.",
        notice:
          "Tenant immediately vacates the premises and notifies Landlord of the intention to terminate; this Lease terminates as of the date Tenant vacates.",
        documentation: "",
        liability:
          "Rent is accounted for as of the date of the casualty, and Landlord will return all prepaid rent and security deposits recoverable under AS 34.03.070.",
      },
      {
        label: "Unlawful ouster or interruption of essential services",
        cite: "AS 34.03.210",
        eligible:
          "If Landlord unlawfully removes or excludes Tenant from the Property, or wilfully diminishes services by interrupting or causing the interruption of electric, gas, water, sanitary, or other essential service, Tenant may recover possession or terminate this Lease.",
        notice: "Tenant may terminate by notice to Landlord.",
        documentation: "",
        liability:
          "Tenant may recover up to one and one-half times actual damages, and Landlord will return all prepaid rent and security deposits recoverable under AS 34.03.070.",
      },
      {
        label: "Landlord's abuse of access",
        cite: "AS 34.03.300(b)",
        eligible:
          "If Landlord makes an unlawful entry, makes a lawful entry in an unreasonable manner, or makes repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord written notice at least 10 days before the termination date specified in the notice.",
        documentation: "",
        liability:
          "Tenant may recover the greater of actual damages or one month's rent, plus court costs and reasonable attorney fees.",
      },
      {
        label: "Improper refusal of a sublease or assignment",
        cite: "AS 34.03.060(c)-(e)",
        eligible:
          "If Tenant presents a prospective subtenant or assignee with a signed written offer containing the information listed in AS 34.03.060(c), and Landlord's written rejection does not state one of the grounds permitted by AS 34.03.060(d), Tenant may treat Landlord's consent as given or may terminate this Lease.",
        notice:
          "Tenant gives Landlord written notice without unnecessary delay, at least 30 days before the termination date specified in the notice.",
        documentation: "",
        liability: "Tenant owes rent through the termination date.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "AS 34.03.230(c); AS 34.03.320",
      rule:
        "If Tenant abandons the dwelling unit, Landlord will make reasonable efforts to rent it at a fair rental value. If Landlord re-rents it for a term beginning before this Lease would have ended, this Lease ends on the date the new tenancy begins. If Landlord fails to use reasonable efforts to re-rent, or accepts the abandonment as a surrender, this Lease is considered terminated by Landlord on the date Landlord has notice of the abandonment. Each party has a duty to mitigate damages.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner and Manager Disclosure",
      text:
        "The person authorized to manage the Property, and the owner or person authorized to act for the owner for service of process and for receiving and receipting for notices and demands, is {{landlord_name}}, {{landlord_address}}. Landlord will keep this information current.",
      cite: "AS 34.03.080(a), (b)",
    },
    {
      id: "extended_absence",
      title: "Notice of Extended Absence",
      text:
        "Tenant will notify Landlord of any anticipated absence from the Property of more than seven days, as soon as reasonably possible after Tenant knows the absence will exceed seven days. If Tenant wilfully fails to do so, Landlord may recover up to one and one-half times Landlord's actual damages. During an absence of more than seven days, Landlord may enter the unit at times reasonably necessary.",
      cite: "AS 34.03.150; AS 34.03.230(a), (b)",
    },
    {
      id: "deposit_terms",
      title: "Terms for Withholding Prepaid Rent and Deposit",
      text:
        "At the end of the tenancy, Landlord may apply prepaid rent and the security deposit only to accrued rent and to damages to the premises and any contents caused by Tenant's failure to meet Tenant's obligations under AS 34.03.120, excluding normal wear and tear. Any pet deposit may be applied only to damages directly related to Tenant's pet.",
      cite: "AS 34.03.070(b), (c), (h)",
    },
    {
      id: "smoke_co_detectors",
      title: "Smoke and Carbon Monoxide Detectors",
      text:
        "At the start of the tenancy, Landlord will provide working smoke detection devices and, if the unit contains or is served by a carbon-based-fueled appliance, has an attached garage or carport, or is adjacent to a parking space, working carbon monoxide detection devices, and will repair or replace them after Tenant notifies Landlord of a deficiency. Tenant will keep the devices in working condition by keeping charged batteries in battery-operated devices, testing them periodically, and not permanently disabling them.",
      cite: "AS 18.70.095; AS 34.03.100(a)(7); AS 34.03.120(a)(7)",
    },
    {
      id: "water_waiver",
      title: "No Landlord-Supplied Running Water",
      condition:
        "Only if the Property has no well and no water provided by a direct public utility connection, and the parties agree to waive Landlord's duty to supply running water or hot water",
      text:
        "The Property does not have a well or water provided by a direct public utility connection, and Tenant waives Landlord's duty to supply running water or hot water to the Property.",
      cite: "AS 34.03.100(a)(5)(B)",
    },
  ],

  fairHousing: {
    stateClasses: ["marital status", "changes in marital status", "pregnancy", "age (listing and inspection practices)"],
    cite: "AS 18.80.200; AS 18.80.240",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through a forcible entry and detainer action in court under AS 09.45.060 - 09.45.160, after serving the written notice to quit the law requires, or in case of abandonment or surrender. Landlord will not take possession by any other means, including by wilfully interrupting electricity, gas, water, sanitary, or other essential services.",
    cite: "AS 34.03.280; AS 09.45.060 - 09.45.160",
  },

  habitability: {
    rule:
      "Landlord will make all repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition; keep common areas clean and safe; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, kitchen, and other facilities and appliances Landlord supplies or is required to supply; provide and arrange removal of garbage and waste receptacles; supply running water and reasonable amounts of hot water and heat at all times, insofar as energy conditions permit (except where the tenant controls a direct utility installation or the parties validly waive water service for a property without a well or utility connection); provide locks and keys on Tenant's request; and provide smoke and carbon monoxide detection devices as required by AS 18.70.095.",
    cite: "AS 34.03.100",
  },

  sources: [
    { cite: "AS 34.03.010 - 34.03.380 (full chapter)", url: "https://www.akleg.gov/basis/statutes.asp?media=print&secStart=34.03.010&secEnd=34.03.380" },
    { cite: "AS 09.45.060 - 09.45.160", url: "https://www.akleg.gov/basis/statutes.asp?media=print&secStart=09.45.060&secEnd=09.45.160" },
    { cite: "AS 18.80.200 - 18.80.300", url: "https://www.akleg.gov/basis/statutes.asp?media=print&secStart=18.80.200&secEnd=18.80.300" },
    { cite: "AS 18.70.095", url: "https://www.akleg.gov/basis/statutes.asp?media=print&secStart=18.70.095&secEnd=18.70.095" },
    { cite: "AS 26.05.010", url: "https://www.akleg.gov/basis/statutes.asp?media=print&secStart=26.05.010&secEnd=26.05.010" },
    { cite: "AS 26.05.135", url: "https://www.akleg.gov/basis/statutes.asp?media=print&secStart=26.05.135&secEnd=26.05.135" },
    { cite: "50 U.S.C. § 3955 (as incorporated by AS 26.05.135)", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "No domestic violence early-termination statute: the full text of AS 34.03 was read and contains no DV, sexual assault, or stalking termination right, and none was found elsewhere. Several commercial guides cite nonexistent AS 34.03 sections for this; disregard them. Federal VAWA applies only to covered federally assisted housing. domesticViolence is null.",
    "Military: AS 26.05.135(a) makes the SCRA's 'consumer transactions and temporary suspension of enforcement of civil liabilities' provisions apply to Alaska organized militia (National Guard, Naval Militia, State Defense Force) on active duty for the state by order of the governor. I read this as extending 50 U.S.C. § 3955 lease termination to state active duty, which the federal SCRA alone does not cover, but the statute incorporates the SCRA by reference and does not restate lease terms; attorney should confirm. AS 26.05.135(b) (internet, gym, satellite radio, TV contracts) does not cover leases.",
    "Deposit cap of two months does not apply at all when monthly rent exceeds $2,000 (AS 34.03.070(a)); the builder should not show a cap for those units. Separate pet deposit of up to one month is allowed (AS 34.03.070(h)) but not for service animals. The return deadline is 14 days only if proper AS 34.03.290 notice was given and no damage deductions are taken; otherwise 30 days.",
    "No statutory late-fee cap or grace period in AS 34.03. A late fee is governed by general contract law and must not be an unenforceable penalty; AS 34.03.040(a)(4) also voids any lease clause making the tenant pay the landlord's attorney fees, although AS 34.03.350 lets a court award fees to the prevailing party.",
    "Required lease clause: AS 34.03.150 says the rental agreement SHALL require the tenant to notify the landlord of an anticipated absence over seven days; included as a disclosure. AS 34.03.040(a) also prohibits waiver, confession of judgment, exculpation/indemnity, and attorney-fee clauses.",
    "Fair housing: AS 18.80.240 lists sex, marital status, changes in marital status, pregnancy, race, religion, disability, color, and national origin for rental refusals and terms, and adds age only for listing and inspection practices; it contains no explicit familial status protection (federal law applies) and expressly permits 'housing for singles or married couples only,' which conflicts with the federal Fair Housing Act's familial status rule; do not rely on that exception. Anchorage has a local equal-rights ordinance that adds sexual orientation and gender identity (not read here; verify), and other municipalities may as well; the Alaska State Commission for Human Rights' interpretation of 'sex' to include those classes has changed over time.",
    "No statewide rent control, just cause, or required environmental disclosures (radon, mold, flood) were found in AS 34.03.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
