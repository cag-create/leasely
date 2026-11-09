import type { StateLawProfile } from "../types";

export const HI: StateLawProfile = {
  code: "HI",
  name: "Hawaii",
  framework: "Hawaii Residential Landlord-Tenant Code, Haw. Rev. Stat. chapter 521 (HRS §§ 521-1 et seq.)",

  deposit: {
    maxMonths: 1,
    capRule:
      "Landlord may require a security deposit of no more than one month's rent. If a pet animal is allowed to reside on the Property, Landlord may also require an additional pet deposit of no more than one month's rent to cover damage caused by the pet; no pet deposit may be required from a tenant without a resident pet or for an assistance animal that is a reasonable accommodation for a tenant with a disability. At the beginning of the tenancy Landlord may not require or receive any money other than the first month's rent and the security deposit (so no separate nonrefundable move-in, cleaning, or administrative fees may be collected). No part of the deposit may be treated as the last month's rent unless Landlord and Tenant agree in writing and Tenant gives 45 days' notice of vacating.",
    capCite: "HRS § 521-44(b)",
    returnDays: 14,
    returnRule:
      "Landlord may use the security deposit only to remedy Tenant's defaults for damage resulting from Tenant's failure to meet Tenant's obligations under HRS § 521-51, unpaid rent, or failure to return keys, key fobs, parking cards, garage door openers, and mailbox keys; to clean the unit to the condition in which Tenant received it; to compensate for damages if Tenant wrongfully quits; to compensate for damage caused by an allowed pet; and to pay amounts Tenant owes for landlord-provided utilities not included in rent. If Landlord proposes to keep any part of the deposit, Landlord will notify Tenant in writing, within 14 days after this Lease ends, of the particulars of and grounds for the retention, with written evidence of the costs such as estimates, invoices, or receipts, and will return the remaining balance within the same 14 days. Mailing to an address Tenant supplies, with proof of mailing postmarked before midnight of the fourteenth day, is presumed to comply. If Landlord does not provide the notice and evidence within 14 days, Landlord may not keep any part of the deposit. If a court finds Landlord wrongfully and wilfully kept any part of the deposit, it may award Tenant up to three times the amount wrongfully kept. If Tenant is absent from the unit for 20 or more consecutive days without written notice to Landlord (and without rent having been paid for that period), Tenant is deemed to have wrongfully quit the unit.",
    returnCite: "HRS § 521-44(a), (c), (d), (h)",
    holdingRule:
      "Landlord holds the security deposit for Tenant, and Tenant's claim to it is prior to the claim of any creditor of Landlord, including a trustee in bankruptcy, even if deposits are commingled. If Landlord transfers Landlord's interest in the unit, Landlord will give the successor an accounting of the deposit, and within 20 days the successor will notify Tenant in writing of the amount credited to Tenant.",
    holdingCite: "HRS § 521-44(b), (f)",
    interestRequired: false,
    moveInInspection:
      "Before Tenant first occupies the unit, Landlord will inventory the premises and make a written record detailing the condition of the premises and any furnishings or appliances provided. Landlord and Tenant will each sign duplicate copies, and each tenant will receive a copy. The signed inventory is presumed correct; if Landlord does not make one, the condition of the premises at the end of the tenancy is presumed to be the same as when Tenant moved in.",
  },

  lateFee: {
    graceDays: null,
    capType: "percent",
    capPercent: 8,
    capRule: "may not exceed 8% of the amount of rent due",
    cite: "HRS § 521-21(f)",
  },

  notice: {
    monthToMonthDays: 45,
    monthToMonthRule:
      "Landlord may end a month-to-month tenancy by written notice at least 45 days before the termination date; after receiving that notice, Tenant may vacate at any time within the last 45 days by telling Landlord the move-out date and paying prorated rent for the time occupied. Tenant may end a month-to-month tenancy by written notice at least 28 days before the termination date and is responsible for rent through the twenty-eighth day. If Landlord plans voluntary demolition, conversion to a condominium, or conversion to transient vacation rentals, Landlord must give at least 120 days' written notice. A tenancy shorter than month-to-month may be ended by either party on at least 10 days' notice. A termination notice given to evade the notice requirements for rent increases is void.",
    monthToMonthCite: "HRS § 521-71(a)-(d), (f)",
    nonpaymentDays: 10,
    nonpaymentRule:
      "If rent is not paid when due, Landlord may give Tenant a written notice that this Lease will terminate unless the rent is paid within the time stated, which must be at least 10 calendar days after Tenant receives the notice. A posted notice is received on the date of posting, and a mailed notice two business days after the postmark. The notice must include the information required by HRS § 521-68(b), and Landlord must also send a copy to a state-funded mediation center. If mediation is scheduled within the 10 days, Landlord may not file for possession until 20 calendar days after Tenant received the notice unless Tenant fails to appear at or cancels the mediation, and Landlord must participate in any mediation Tenant schedules.",
    nonpaymentCite: "HRS § 521-68 (as amended by L 2025, c 278, effective February 5, 2026)",
    entryHours: 48,
    entryRule:
      "Tenant will not unreasonably withhold consent for Landlord to enter to inspect the premises, make necessary or agreed repairs, decorations, alterations, or improvements, supply agreed services, or show the unit to prospective purchasers, mortgagees, or tenants. Except in an emergency or where it is impracticable, Landlord will give Tenant at least two days' notice of the intent to enter and will enter only during reasonable hours. Landlord has no other right of entry except by court order, if Tenant appears to have abandoned the premises, or as reasonably necessary during Tenant's extended absence, and will not abuse the right of access or use it to harass Tenant.",
    entryCite: "HRS §§ 521-53, 521-70(b)",
  },

  earlyTermination: {
    military: {
      label: "Hawaii state military service (state active duty or full-time National Guard duty)",
      cite: "HRS §§ 657D-1, 657D-25, 657D-27",
      eligible:
        "Tenant may terminate this Lease if, after signing it, Tenant enters military service of the State of Hawaii, meaning state active duty in any of the state military forces ordered by the adjutant general or the governor, or full-time National Guard duty, and the Property has been occupied as a dwelling by Tenant or by Tenant and Tenant's dependents.",
      notice:
        "Tenant delivers written notice of termination to Landlord, Landlord's grantee, or their agent at any time after Tenant's military service begins; the notice may be mailed. For a lease with monthly rent, termination takes effect 30 days after the next rent due date following delivery or mailing of the notice. For any other lease, termination takes effect on the last day of the month following the month in which the notice is delivered or mailed.",
      documentation: "HRS § 657D-25 does not require specific documents to accompany the notice.",
      liability:
        "Unpaid rent for the period before termination is computed pro rata, and rent paid in advance for any period after termination is refunded. Landlord may ask a court, before the termination date, to modify or restrict this relief in the interests of justice and equity. Landlord may not seize or hold Tenant's belongings or interfere with their removal to satisfy rent accruing after termination.",
    },
    domesticViolence: {
      label: "Domestic violence",
      cite: "HRS §§ 521-79, 521-80; HRS § 586-1",
      eligible:
        "If this Lease has a term of one year or less, Tenant may terminate it early if Tenant, or an immediate family member of Tenant residing at the unit, has been the victim of domestic violence within the 90 days before Tenant gives notice. Domestic violence means domestic abuse as defined in HRS § 586-1: physical harm, bodily injury, assault, or the threat of imminent physical harm, bodily injury, or assault, extreme psychological abuse, coercive control, or malicious property damage between family or household members (including spouses, former spouses, reciprocal beneficiaries, persons with a child in common, relatives, persons who live or have lived together other than solely as roommates, and persons in a dating relationship), or certain offenses against a minor family or household member.",
      notice:
        "Tenant gives Landlord written notice at least 14 days before the early termination date stated in the notice, and that date may be no more than 104 days after the most recent act of domestic violence.",
      documentation:
        "The notice must be accompanied by one of the following: certified or exemplified restraining orders, injunctions against harassment, or documents from criminal cases; documentation from a victim services organization or domestic violence program, agency, or facility, including a shelter or safe house; or documentation from a medical professional, mental health care provider, attorney, advocate, social worker, or member of the clergy from whom the victim sought assistance. Tenant must also provide a written statement that Tenant reasonably believes the person who committed the domestic violence knows where Tenant or the family member lives, unless that person lives in the same unit.",
      liability:
        "Tenant owes rent through the early termination date plus any obligations outstanding as of that date, payable on or before the early termination date, and Landlord may not charge any fee or penalty for the early termination. Landlord will return Tenant's prorated share of the security deposit and prepaid rent after Tenant surrenders the unit, less a prorated amount for damage caused by Tenant's noncompliance with HRS § 521-51. If other tenants remain on this Lease, it continues as to them if they demonstrate an ability to pay the rent; if they cannot, Landlord may terminate it as to them on at least 14 days' notice without any penalty or fee. Landlord will not disclose information Tenant provides except with Tenant's signed consent, in a judicial action where relevant, or as required by law. A tenant who knowingly submits a false notice or documentation is liable for the greater of three months' rent or three times actual damages, plus costs and attorney's fees.",
    },
    other: [
      {
        label: "Servicemember ordered into on-post government quarters",
        cite: "HRS § 521-83",
        eligible:
          "If this Lease has a term of one year or less or is month-to-month, Tenant may terminate it if Tenant is a servicemember tenant (an active duty member of the regular or reserve component of the U.S. armed forces, the U.S. Coast Guard, or the Hawaii National Guard on ordered federal duty for 90 days or more) who receives military orders to vacate civilian housing and move into on-post government quarters, and failure to move would forfeit Tenant's basic allowance for housing. For a fixed term, Tenant must also have asked the commanding officer for permission to keep the housing allowance and been denied. If a servicemember tenant dies on active duty, an adult family member may terminate on the same terms. This right does not apply if the orders result from disciplinary action or a court order.",
        notice:
          "For a fixed term of one year or less, Tenant gives at least 30 days' written notice. For a month-to-month tenancy, or after a servicemember tenant's death, at least 15 days' written notice.",
        documentation:
          "The notice must include a copy of the official military orders or a written verification signed by the commanding officer and, for a fixed term, written proof from the commanding officer that the request to keep the housing allowance was denied. After a death, the notice must include the death certificate and either orders showing active duty or a commanding officer's verification.",
        liability:
          "Tenant owes rent through the early termination date plus any obligations outstanding as of that date, payable on or before that date, and Landlord may not charge any penalty, early termination fee, or future rent. Landlord will return Tenant's prorated share of the security deposit and prepaid rent after surrender, less a prorated amount for damage caused by Tenant's noncompliance with HRS § 521-51. Remaining co-tenants who demonstrate an ability to pay stay bound; if they cannot, Landlord may terminate as to them on at least 30 days' notice without penalty.",
      },
      {
        label: "Landlord's noncompliance at the start of the tenancy",
        cite: "HRS §§ 521-62, 521-66",
        eligible:
          "If Landlord fails to conform to this Lease or is in material noncompliance with HRS § 521-42(a) at the start of the tenancy, Tenant may terminate this Lease and vacate during the first week of occupancy, or later if Tenant remains in possession in reliance on Landlord's promise to correct the condition.",
        notice: "Tenant gives notice to Landlord and vacates.",
        documentation: "",
        liability:
          "Within 14 days after termination, Landlord will return any advance rent for the remaining days of the term and any part of the security deposit Landlord is not entitled to keep.",
      },
      {
        label: "Condition depriving Tenant of a substantial part of the bargain",
        cite: "HRS §§ 521-63(a), 521-66",
        eligible:
          "If any condition within the premises deprives Tenant of a substantial part of the benefit and enjoyment of this Lease, and the condition was not caused by the lack of due care of Tenant, Tenant's family, or others on the premises with Tenant's consent, Tenant may terminate this Lease.",
        notice:
          "Tenant notifies Landlord in writing and may terminate if Landlord does not remedy the situation within one week. No notice is required if the condition makes the unit uninhabitable or poses an imminent threat to the health or safety of any occupant.",
        documentation: "",
        liability:
          "Within 14 days after termination, Landlord will return any advance rent for the remaining days of the term and any part of the security deposit Landlord is not entitled to keep. If Landlord caused the condition wilfully or negligently, Tenant may also recover damages.",
      },
      {
        label: "Unlawful removal or exclusion by Landlord",
        cite: "HRS § 521-63(c)",
        eligible:
          "If Landlord removes or excludes Tenant from the premises overnight without cause or without a court order, Tenant may recover possession or terminate this Lease.",
        notice: "Tenant may terminate by notice to Landlord.",
        documentation: "",
        liability:
          "In either case Tenant may recover an amount equal to two months' rent or free occupancy for two months, plus costs and reasonable attorney's fees, and if this Lease is terminated Landlord will account for the security deposit under HRS § 521-44(c).",
      },
      {
        label: "Fire or other casualty",
        cite: "HRS §§ 521-65, 521-66",
        eligible:
          "If the unit, or any part of the premises reasonably necessary to its use and enjoyment, is made partially or wholly unusable by fire or other casualty not caused by the wilful fault of Tenant or Tenant's family, Tenant may terminate this Lease.",
        notice:
          "Tenant immediately quits the premises and notifies Landlord of the election to quit within one week after quitting; this Lease terminates as of the date of quitting. If Tenant does not notify Landlord, Tenant is liable for rent until Landlord actually learns that Tenant has quit or that further occupancy is impossible.",
        documentation: "",
        liability:
          "Within 14 days after termination, Landlord will return any advance rent for the remaining days of the term and any part of the security deposit Landlord is not entitled to keep.",
      },
      {
        label: "Death of the tenant",
        cite: "HRS § 521-85",
        eligible:
          "If Tenant (or, where there are several tenants, all tenants) dies during the tenancy, Landlord will send notice by registered mail to the representative Tenant designated in this Lease or a separate writing, or otherwise to Tenant's estate at the Property.",
        notice:
          "The tenancy terminates 15 calendar days after the notice is mailed or personally delivered, or on the date through which rent has been paid, whichever is later.",
        documentation: "",
        liability:
          "Within 14 calendar days after the tenancy terminates, or after the representative removes Tenant's property, Landlord will account for the security deposit under HRS § 521-44 and pay any balance to the representative or Tenant's estate.",
      },
    ],
    feeCap: {
      maxMonthsRent: null,
      rule:
        "If Tenant wrongfully quits after taking occupancy, Tenant's liability is limited to the lesser of the rent for the remainder of the term, or the rent accrued during the period reasonably necessary to re-rent at a fair rental plus any difference between that fair rental and the rent under this Lease and a reasonable re-renting commission. If Tenant repudiates this Lease before occupancy, Tenant's liability is limited to the least of all money deposited with Landlord, one month's rent, or Landlord's actual re-renting losses (accrued rent until re-rented, any rent difference, reasonable costs, and a reasonable commission). Landlord may not collect any up-front early termination fee because only the first month's rent and the security deposit may be collected at the start of the tenancy.",
      cite: "HRS §§ 521-70(d), (e); 521-44(b)",
    },
    mitigation: {
      basis: "statute",
      cite: "HRS § 521-70(d)",
      rule:
        "If Tenant wrongfully quits the unit and unequivocally indicates an intention not to resume the tenancy, Tenant is liable for the lesser of the entire rent due for the remainder of the term, or all rent accrued during the period reasonably necessary to re-rent the unit at a fair rental, plus the difference between that fair rental and the rent under this Lease and a reasonable commission for re-renting, whether or not Landlord actually re-rents the unit. Landlord will credit rent received from a replacement tenant.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner and Manager Disclosure",
      text:
        "Each person authorized to manage the Property, and each owner or person authorized to act for the owner for service of process and for receiving and receipting for rents, notices, and demands, is: {{landlord_name}}, {{landlord_address}}. Landlord will keep this information current. Landlord will give Tenant a copy of this Lease and a written receipt for rent at the time of payment (for payment by check, on Tenant's request; a canceled check also serves as a receipt).",
      cite: "HRS § 521-43(a), (d), (e)",
    },
    {
      id: "off_island_agent",
      title: "On-Island Agent",
      condition: "Only if the owner or Landlord resides outside Hawaii or on a different island from the Property",
      text:
        "Landlord resides outside Hawaii or on a different island from the Property. Landlord designates the agent named in the agent designation that is part of this Lease, who resides on the same island as the Property, to act on Landlord's behalf.",
      cite: "HRS § 521-43(f)",
    },
    {
      id: "general_excise_tax_number",
      title: "General Excise Tax Number",
      text:
        "Landlord will provide Tenant with Landlord's general excise tax number for Tenant's use in filing for a low-income tax credit.",
      cite: "HRS § 521-43(h)",
    },
    {
      id: "no_postdated_checks",
      title: "No Postdated Checks",
      text: "Landlord will not require Tenant to deliver any postdated check or other negotiable instrument for payment of rent.",
      cite: "HRS § 521-44(e)",
    },
    {
      id: "public_assistance_due_date",
      title: "Rent Due Date for Public Assistance Recipients",
      condition:
        "Only if Tenant is a public assistance recipient and this Lease requires rent on or before the third day after the day the public assistance check is usually received",
      text:
        "Tenant may establish a new rent due date, no more than three days (excluding Saturdays, Sundays, and holidays) after the date the public assistance checks are mailed, by making a one-time payment for the days between the original and new due dates, calculated by dividing the monthly rent by 30 and multiplying by the number of days.",
      cite: "HRS § 521-21(b)",
    },
    {
      id: "extended_absence",
      title: "Notice of Extended Absence",
      text:
        "Tenant will notify Landlord of any anticipated extended absence from the unit no later than the first day of the absence. If Tenant does not make reasonable efforts to do so, Tenant will indemnify Landlord for any damage resulting from the absence.",
      cite: "HRS §§ 521-54, 521-70(a)",
    },
    {
      id: "death_representative",
      title: "Representative on Tenant's Death",
      text:
        "Tenant may designate, in this Lease or a separate written instrument, the name and contact information (including mailing address) of a representative authorized to collect or dispose of Tenant's personal property in the unit if Tenant dies during the tenancy.",
      cite: "HRS § 521-85(a)",
    },
  ],

  fairHousing: {
    stateClasses: [
      "sexual orientation",
      "gender identity or expression",
      "marital status",
      "ancestry",
      "age (over the age of majority, or emancipated minors)",
      "human immunodeficiency virus (HIV) infection",
    ],
    cite: "HRS §§ 515-2, 515-3, 515-4",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through a summary possession proceeding in district court under HRS chapter 666 and HRS § 521-68 or § 521-71. Landlord will not remove or exclude Tenant without a court order, and will not try to recover possession by wilfully interrupting or reducing running water, hot water, electric, gas, or other essential service, except in case of abandonment or surrender.",
    cite: "HRS § 666-1; HRS §§ 521-63(c), 521-74.5",
  },

  habitability: {
    rule:
      "Landlord will at all times during the tenancy comply with all applicable building and housing laws materially affecting health and safety; keep common areas of a multi-unit property clean and safe; make all repairs and arrangements necessary to put and keep the premises in a habitable condition; maintain all electrical, plumbing, and other facilities and appliances Landlord supplies in good working order, subject to reasonable wear and tear; and, except for a single-family residence, provide garbage receptacles with frequent removal and running water as reasonably required.",
    cite: "HRS § 521-42(a)",
  },

  sources: [
    { cite: "HRS § 521-7", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0007.htm" },
    { cite: "HRS § 521-21", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0021.htm" },
    { cite: "HRS § 521-31", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0031.htm" },
    { cite: "HRS § 521-35", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0035.htm" },
    { cite: "HRS § 521-39", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0039.htm" },
    { cite: "HRS § 521-42", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0042.htm" },
    { cite: "HRS § 521-43", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0043.htm" },
    { cite: "HRS § 521-44", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0044.htm" },
    { cite: "HRS § 521-53", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0053.htm" },
    { cite: "HRS § 521-54", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0054.htm" },
    { cite: "HRS § 521-62", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0062.htm" },
    { cite: "HRS § 521-63", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0063.htm" },
    { cite: "HRS § 521-65", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0065.htm" },
    { cite: "HRS § 521-66", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0066.htm" },
    { cite: "HRS § 521-68 (both versions)", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0068.htm" },
    { cite: "HRS § 521-70", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0070.htm" },
    { cite: "HRS § 521-71", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0071.htm" },
    { cite: "HRS § 521-74.5", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0074_0005.htm" },
    { cite: "HRS § 521-79", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0079.htm" },
    { cite: "HRS § 521-80", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0080.htm" },
    { cite: "HRS § 521-81", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0081.htm" },
    { cite: "HRS § 521-83", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0083.htm" },
    { cite: "HRS § 521-84", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0084.htm" },
    { cite: "HRS § 521-85", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0085.htm" },
    { cite: "HRS § 586-1", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0586/HRS_0586-0001.htm" },
    { cite: "HRS § 515-2", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0515/HRS_0515-0002.htm" },
    { cite: "HRS § 515-3", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0515/HRS_0515-0003.htm" },
    { cite: "HRS § 515-4", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0515/HRS_0515-0004.htm" },
    { cite: "HRS § 657D-1", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol13_Ch0601-0676/HRS0657D/HRS_0657D-0001.htm" },
    { cite: "HRS § 657D-25", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol13_Ch0601-0676/HRS0657D/HRS_0657D-0025.htm" },
    { cite: "HRS § 657D-27", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol13_Ch0601-0676/HRS0657D/HRS_0657D-0027.htm" },
    { cite: "HRS § 666-1", url: "https://data.capitol.hawaii.gov/hrscurrent/Vol13_Ch0601-0676/HRS0666/HRS_0666-0001.htm" },
  ],

  reviewNotes: [
    "Source note: www.capitol.hawaii.gov returned 403 to curl; all sections were read from the Legislature's own data mirror (data.capitol.hawaii.gov/hrscurrent), which serves the same current HRS pages.",
    "Nonpayment notice changed: for notices on or after February 5, 2026, HRS § 521-68 (L 2025, c 278) requires a 10-calendar-day notice (formerly five business days) with specified contents, a copy to a state-funded mediation center, and a 20-day filing bar if mediation is scheduled. The section is set for repeal and reenactment on February 4, 2028, but the session-law note says the 10-day change in subsection (a) is exempt from that; re-check in 2028. HRS § 521-84 imposes a separate 15-day mediation notice for tenancies covered by wildfire emergency proclamations (Maui).",
    "Move-in money limit: HRS § 521-44(b) bars collecting anything at the start of the tenancy except first month's rent and the security deposit (plus an allowed pet deposit). Keycove's flat setup or admin fees, nonrefundable cleaning fees, or a separate last-month payment cannot be charged to Hawaii tenants at move-in. The pet deposit is a separate one-month allowance; the builder should not fold it into the one-month cap.",
    "DV and on-post military rights (HRS §§ 521-80, 521-83) apply only to rental agreements 'of a term of one year or less' (§ 521-83(b) also expressly covers month-to-month). A lease longer than one year is not covered on the statute's face; attorney should decide whether Keycove extends the right contractually. § 521-80 covers only 'domestic abuse' between family or household members as defined in HRS § 586-1, so stranger sexual assault or stalking is not covered; 'immediate family member' is not defined in part VIII of chapter 521.",
    "Military: HRS § 657D-25 is the state analogue of the SCRA for Hawaii state military forces on state active duty or full-time National Guard duty, but it covers only leases signed BEFORE the tenant entered that service, says nothing about documentation, and (unlike the motor-vehicle subsection) does not expressly bar an early termination charge for residential leases. Subsection (b) literally refers to 'the lessor's ... period of military service', an apparent drafting error for 'lessee'; flag for the attorney. HRS § 521-83 (on-post quarters) is placed in 'other' because it is narrow.",
    "Late fee cap is a flat 8% of the rent due (HRS § 521-21(f)); there is no statutory grace period. Attorney's-fee clauses are limited to 25% of unpaid rent after referral to an outside attorney, or prevailing-party fees in other matters (HRS § 521-35). Rent increases need 45 days' written notice for month-to-month tenancies (HRS § 521-21(d)).",
    "Pre-occupancy repudiation damages are capped by HRS § 521-70(e) at the least of money deposited, one month's rent, or actual re-renting loss; encoded in feeCap with maxMonthsRent null because there is no general numeric cap after move-in.",
    "Fair housing: HRS § 515-4(a) exempts owner-occupied two-unit buildings and an owner renting up to four rooms in the owner's own home from § 515-3 (relevant to co-living); federal law may still apply. No state source-of-income protection was found in chapter 515. HRS § 521-39 voids lease clauses allowing eviction for medical cannabis use by certificate holders unless tobacco smoking is also grounds and the cannabis is smoked.",
    "Local law: Honolulu and Maui have short-term/transient vacation rental ordinances that interact with the 120-day conversion notice in HRS § 521-71(c); no county rent control was identified. Verify any county-specific requirements.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
