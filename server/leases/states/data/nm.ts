import type { StateLawProfile } from "../types";

const NMSA = (item: string) => `https://nmonesource.com/nmos/nmsa/en/${item}/1/document.do`;

export const NM: StateLawProfile = {
  code: "NM",
  name: "New Mexico",
  framework: "New Mexico Uniform Owner-Resident Relations Act, NMSA 1978, §§ 47-8-1 through 47-8-52",

  deposit: {
    maxMonths: 1,
    capRule:
      "For a rental agreement with a term of less than one year, the deposit may not exceed one month's rent. For an annual rental agreement, Landlord may take a larger deposit, but if it exceeds one month's rent, Landlord must pay Tenant interest on the deposit each year equal to the passbook interest rate described in NMSA 1978, § 47-8-18(A)(1). Last month's prepaid rent that this Lease requires is not part of the deposit, and the deposit is not prepaid rent.",
    capCite: "NMSA 1978, § 47-8-18(A)–(B)",
    returnDays: 30,
    returnRule:
      "Landlord will not retain any part of the deposit to cover normal wear and tear. Landlord may apply the deposit to unpaid rent or utilities, repair work, and other legitimate damages caused by Tenant's noncompliance with this Lease or with NMSA 1978, § 47-8-22. If Landlord retains any part of the deposit, Landlord will give Tenant an itemized written list of the deductions and the balance of the deposit, if any, within 30 days after the date this Lease terminates or Tenant departs, whichever is later; mailing the statement and any payment to Tenant's last known address satisfies this requirement. If Landlord fails to provide the statement and balance within 30 days after the tenancy terminates, Landlord forfeits the right to withhold any part of the deposit, to counterclaim in an action to recover it, and to bring a separate action for damage to the Property, and is liable for Tenant's court costs and reasonable attorney's fees. A Landlord who retains a deposit in bad faith also owes Tenant a $250 civil penalty.",
    returnCite: "NMSA 1978, § 47-8-18(C)–(E)",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: null,
    capType: "percent",
    capPercent: 5,
    capRule:
      "may be charged only if this Lease provides for it, may not exceed 5% of the rent for each rental period in which Tenant is in default, and is calculated only on rent, not on deposits, other fees, or utilities. To assess a late fee, Landlord must notify Tenant of the late fee charged no later than the last day of the rental period immediately following the period in which the default occurred.",
    cite: "NMSA 1978, § 47-8-15(D)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either Landlord or Tenant may terminate a month-to-month residency by written notice given to the other at least 30 days before the periodic rental date specified in the notice. A week-to-week residency requires at least 7 days' written notice. Landlord may increase rent in a month-to-month residency only by written notice at least 30 days before the periodic rental date, and may increase a fee provided for in this Lease only by written notice at least 60 days before the periodic rental date (or, for a fixed term, before the end of the term).",
    monthToMonthCite: "NMSA 1978, §§ 47-8-37(A)–(B), 47-8-15(F), 47-8-19.4",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If rent is unpaid when due and Tenant fails to pay it within three days after Landlord's written notice of nonpayment and of Landlord's intention to terminate this Lease, Landlord may terminate this Lease and Tenant must deliver possession. If Tenant tenders the full amount due, in the manner stated in the notice, before the three days expire, Landlord may not bring an action for nonpayment. A nonpayment notice is effective only when hand delivered, mailed, or posted on an exterior door of the dwelling unit, and must state the date of posting. If the last day of the period falls on a weekend or federal holiday, the period extends to the next day that is not a weekend or federal holiday.",
    nonpaymentCite: "NMSA 1978, §§ 47-8-33(D), (H), 47-8-13(D)",
    entryHours: 24,
    entryRule:
      "Unless Landlord and Tenant agree otherwise, Landlord will give Tenant 24 hours' written notice of Landlord's intent to enter, stating the purpose of the entry and the date and a reasonable estimate of the time frame, before entering to inspect the Property; make necessary or agreed repairs, decorations, alterations, or improvements; supply necessary or agreed services; or show the Property to prospective or actual purchasers, mortgagees, prospective residents, workers, or contractors. Advance notice is not required when Landlord enters to perform repairs or services within seven days after Tenant's request, or when Landlord is accompanied by a public official conducting an inspection or by a cable television, electric, gas, or telephone company representative. If Tenant gives reasonable prior notice of alternate times or dates and it is practicable and causes Landlord no economic detriment, Landlord will try to reasonably accommodate them. Landlord may enter without consent in an emergency, and otherwise has no right of access except by court order, after abandonment or surrender, or during Tenant's absence of more than seven days. Landlord will not abuse the right of access.",
    entryCite: "NMSA 1978, §§ 47-8-24, 47-8-34(B)",
  },

  earlyTermination: {
    military: {
      label: "National Guard on state active duty (state law)",
      cite: "NMSA 1978, § 20-4-7.1(A); 50 U.S.C. § 3955",
      eligible:
        "A Tenant who is a member of the National Guard of New Mexico or of any other state or territory and is ordered to state active duty for 30 or more consecutive state duty days, or to federally funded duty in an operational homeland-security role under 32 U.S.C. § 502, has the rights, benefits, and protections of the federal Servicemembers Civil Relief Act. A Tenant who enters such duty after signing this Lease, or who while on such duty receives orders for a permanent change of station or to deploy for 90 days or more, may terminate this Lease on the terms below. Termination by such a Tenant also ends the obligations of the Tenant's dependents under this Lease.",
      notice:
        "Tenant delivers written notice of termination to Landlord by hand delivery, private business carrier, U.S. mail with return receipt requested, or electronic means. Because rent is payable monthly, termination takes effect 30 days after the first date on which the next rental payment is due after Landlord receives the notice.",
      documentation: "The notice must include a copy of Tenant's military orders.",
      liability:
        "Tenant owes rent prorated to the effective termination date and any other amounts due under this Lease at termination, such as reasonable charges for excess wear, but Landlord will not charge any early termination fee. Landlord will refund any rent paid in advance for the period after the effective date within 30 days after that date.",
    },
    domesticViolence: null,
    other: [
      {
        label: "Landlord's failure to deliver possession",
        cite: "NMSA 1978, § 47-8-26(B)–(C)",
        eligible:
          "If Landlord fails to deliver possession of the Property at the time this Lease says occupancy begins, 100% of the rent abates until possession is delivered and Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord written notice of termination, effective immediately.",
        documentation: "",
        liability: "Landlord will return all prepaid rent and deposits. Tenant owes no early termination fee.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "NMSA 1978, § 47-8-27.1(A)(1), (B), (E)",
        eligible:
          "If Landlord materially fails to comply with this Lease, or fails to comply with the Act in a way that materially affects health and safety, Tenant may terminate this Lease, unless the condition was caused by the deliberate or negligent act or omission of Tenant, a member of Tenant's family, or another person on the Property with Tenant's consent.",
        notice:
          "Tenant delivers written notice to Landlord specifying the acts and omissions constituting the breach and stating that this Lease will terminate on a date at least seven days after Landlord receives the notice if Landlord does not make a reasonable attempt to remedy the breach within seven days. If Landlord makes a reasonable attempt to adequately remedy the breach before that date, the Lease does not terminate. If the last day to remedy falls on a weekend or federal holiday, the period extends to the next business day.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee. Once possession is restored to Landlord, Landlord will return the balance of any prepaid rent and the deposit to which Tenant is entitled.",
      },
      {
        label: "Fire or casualty damage",
        cite: "NMSA 1978, § 47-8-31",
        eligible:
          "If the Property is damaged or destroyed by fire or casualty to an extent that substantially impairs Tenant's enjoyment of the dwelling unit, Tenant may vacate and terminate this Lease.",
        notice:
          "Tenant notifies Landlord in writing within seven days after vacating of Tenant's intention to terminate; the Lease terminates as of the date Tenant vacated.",
        documentation: "",
        liability:
          "Rent is accounted for as of the date Tenant vacated, and Landlord will return the balance of prepaid rent and recoverable deposits. Tenant remains responsible for damage caused by Tenant's negligence.",
      },
      {
        label: "Unlawful or harassing entry by Landlord",
        cite: "NMSA 1978, §§ 47-8-24(F), 47-8-38(B)",
        eligible:
          "If Landlord makes an unlawful entry, makes a lawful entry in an unreasonable manner, or makes repeated lawful demands for entry that unreasonably interfere with Tenant's quiet enjoyment or unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord written notice of termination.",
        documentation: "",
        liability: "Tenant owes no early termination fee and may recover damages and reasonable attorney's fees.",
      },
      {
        label: "Unlawful exclusion or interruption of services",
        cite: "NMSA 1978, §§ 47-8-36, 47-8-48(C)",
        eligible:
          "If Landlord, without a court order, knowingly excludes or removes Tenant or attempts to do so by changing locks, blocking entrances, interrupting utilities or services, removing Tenant's property, removing appliances or fixtures, or any willful act making the Property inaccessible or uninhabitable, Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord written notice of termination.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee, may abate 100% of the rent for each affected day, and may recover damages and a civil penalty of two times the monthly rent.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "NMSA 1978, §§ 47-8-6(A), 47-8-34(C)",
      rule:
        "If Tenant leaves before the end of the term, Landlord has a duty to mitigate its damages, including by making reasonable efforts to re-rent the Property at a fair rental. If Landlord re-rents the Property for a term beginning before this Lease expires, this Lease terminates on the date the new tenancy begins.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Manager and Owner Identification",
      text: "The person authorized to manage the Property, and an owner of the Property or the person authorized to act for the owner for service of process and for receiving and receipting for notices and demands, is Landlord at the name, address, and telephone number stated in this Lease unless Landlord designates another person in writing. Landlord will keep this information current. If Landlord does not provide this information, Tenant is relieved of the obligation to give Landlord notices required by the Uniform Owner-Resident Relations Act.",
      cite: "NMSA 1978, § 47-8-19",
    },
    {
      id: "written_agreement_and_rules",
      title: "Copy of Lease and Rules",
      text: "Landlord has provided Tenant a written copy of this Lease before occupancy begins and copies of all existing rules and regulations. A rule adopted after Tenant signs this Lease is enforceable against Tenant only if Tenant receives reasonable notice of its adoption and it does not substantially modify Tenant's bargain.",
      cite: "NMSA 1978, §§ 47-8-20(G), 47-8-23(F)",
    },
    {
      id: "payment_allocation",
      title: "Application of Rent Payments and Guests",
      text: "Unless Landlord and Tenant agree otherwise in writing, Tenant's rent payments will not be applied to deposits or damages. Landlord will not charge a fee for occupancy of the dwelling unit by a reasonable number of guests for a reasonable length of time.",
      cite: "NMSA 1978, § 47-8-15(E), (G)",
    },
    {
      id: "utility_bill_copies",
      title: "Utility Bills in Multi-Unit Housing",
      text: "If the dwelling unit is separately metered, Tenant may obtain a copy of the utility bill for the unit on request. If the unit is submetered, or if common-area utility costs are apportioned among units and passed on to residents, Tenant may obtain on request copies of the bills being apportioned and the calculations used to apportion them. The share of common-area costs that would be allocated to an empty unit will not be allocated to the remaining residents. Landlord may charge an administrative fee of no more than $5.00 for each monthly request.",
      cite: "NMSA 1978, § 47-8-20(F)",
      condition: "Only for multi-unit housing",
    },
    {
      id: "deposit_interest",
      title: "Interest on Deposit",
      text: "Because this is an annual rental agreement and the deposit exceeds one month's rent, Landlord will pay Tenant interest on the deposit each year equal to the passbook interest permitted to savings and loan associations in New Mexico by the federal home loan bank board.",
      cite: "NMSA 1978, § 47-8-18(A)(1)",
      condition: "Only if this Lease has a term of one year and the deposit is greater than one month's rent",
    },
  ],

  fairHousing: {
    stateClasses: [
      "ancestry",
      "sexual orientation",
      "gender",
      "gender identity",
      "pregnancy, childbirth, or a condition related to pregnancy or childbirth",
      "spousal affiliation",
      "military status (including the spouse or child of an active member or veteran)",
    ],
    cite: "NMSA 1978, §§ 28-1-2, 28-1-7(G)",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only by filing a petition for restitution in district or magistrate court under NMSA 1978, §§ 47-8-41 through 47-8-46, after giving any written notice the Act requires, and obtaining a writ of restitution executed by the sheriff. Landlord will not exclude, remove, or dispossess Tenant without a court order, including by changing or removing locks, blocking entrances, interrupting utilities or services, removing Tenant's property, or removing appliances or fixtures.",
    cite: "NMSA 1978, §§ 47-8-36, 47-8-41, 47-8-42, 47-8-46",
  },

  habitability: {
    rule:
      "Landlord will substantially comply with applicable minimum housing codes materially affecting health and safety; make repairs and do whatever is necessary to put and keep the Property in a safe condition; keep common areas in a safe condition; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances, including elevators, that Landlord supplies or is required to supply; provide and maintain receptacles for garbage and other waste and arrange for its removal; and supply running water, a reasonable amount of hot water at all times, and reasonable heat, except where heat or hot water is generated by an installation in Tenant's exclusive control and supplied by a direct utility connection.",
    cite: "NMSA 1978, § 47-8-20(A)",
  },

  sources: [
    { cite: "NMSA 1978, §§ 47-8-1 to 47-8-52 and 47-8A-1 (Uniform Owner-Resident Relations Act, read in full; current through Laws 2025, ch. 122)", url: NMSA("4408") },
    { cite: "NMSA 1978, §§ 28-1-2, 28-1-7, 28-1-9 (Human Rights Act)", url: NMSA("4365") },
    { cite: "NMSA 1978, § 20-4-7.1", url: NMSA("4356") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "Deposit cap is term-dependent: § 47-8-18(A)(2) caps deposits at one month's rent only for agreements shorter than one year; for an annual agreement there is no cap, but a deposit above one month's rent triggers annual passbook interest (§ 47-8-18(A)(1)). maxMonths is set to 1 as the conservative value; if the builder allows more than one month on a 12-month lease it must include the deposit_interest disclosure. The 'passbook interest permitted ... by the federal home loan bank board' benchmark is obsolete (the FHLBB was abolished in 1989) — attorney should advise what rate to use.",
    "Deposit return timing is internally inconsistent: § 47-8-18(C) says 30 days from termination or resident departure, 'whichever is later', while the forfeiture rule in § 47-8-18(D) runs 30 days from 'termination of the tenancy'. The lease text tracks both; safest practice is to send within 30 days of the earlier event.",
    "Late fees (2025 amendment, Laws 2025, ch. 122): 5% of rent per rental period in default; rent-only base; notice of the fee by the end of the next rental period. No statutory grace period, so graceDays is null.",
    "Domestic violence: New Mexico has NO statutory DV/sexual assault lease-termination right. The UORRA text (current through Laws 2025, ch. 122) contains only an eviction defense for substantial-violation evictions (§ 47-8-33(J)). Bills to add a termination right (e.g., SB 423 (2019), SB 338 (2021), SB 400 (2025)) do not appear in the compiled code. The NMOneSource PDF was generated July 2026; attorney should confirm no 2026 enactment.",
    "Military: § 20-4-7.1(A) extends SCRA 'rights, benefits and protections' to National Guard members (any state) ordered to state active duty for 30+ consecutive state duty days, or federally funded 32 U.S.C. § 502 homeland-security operational duty. The SCRA-trigger mapping to state duty is our interpretation. § 20-1-8.1 separately lets deployed residents suspend municipal/county utilities but does not address leases.",
    "Fair housing: the NM Human Rights Act housing provision (§ 28-1-7(G)) does not list familial status or source of income (federal FHA still covers familial status). Owner-occupied buildings with up to four units are exempt (§ 28-1-9(D)) — relevant to co-living — and an owner of no more than three single-family dwellings who rents one without any discriminatory notice or advertisement is exempt as to that dwelling (§ 28-1-9(A)). 'Spousal affiliation' is listed but not defined in § 28-1-2.",
    "2025 amendments to note in the builder: listings must disclose base rent and all fees (§ 47-8-19.1); screening fee capped at $50 with notice, receipt, and refund rules (§ 47-8-19.2); one screening fee per applicant per 90 days across the same ownership, and copies of screening reports must be provided (§ 47-8-19.3); 60 days' notice before increasing any lease fee (§ 47-8-19.4); $250 penalty for unauthorized screening fees (§ 47-8-48(B)).",
    "Waivers: no lease may waive rights or remedies 'under the law' (§ 47-8-16). Prevailing-party attorney fees apply in suits to enforce the lease or the Act (§ 47-8-48(A)). There is no landlord's lien (§ 47-8-36.1).",
    "Substantial violations (drug distribution, deadly weapons, serious harm, sexual assault, etc. — § 47-8-3(V)) allow a 3-day termination notice (§ 47-8-33(I)); other material noncompliance requires a 7-day cure notice given within 30 days of the breach (§ 47-8-33(A)–(C)).",
    "Abandonment is defined as absence of more than 7 days without notice AFTER rent is delinquent (§ 47-8-3(A)); property must be stored 30 days after abandonment, 14 days after voluntary surrender, or 3 days after a writ (§ 47-8-34.1). The landlord may request a contact person for a deceased sole occupant (§ 47-8-34.2) — the builder could add this optional clause.",
    "Local law: rent control is preempted (§ 47-8A-1). Albuquerque, Santa Fe, and Las Cruces may have additional local housing ordinances (e.g., source-of-income or rental registration rules) — not verified here.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
