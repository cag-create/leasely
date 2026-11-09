import type { StateLawProfile } from "../types";

const RSA = (title: string, ch: string, s: string) => `https://gc.nh.gov/rsa/html/${title}/${ch}/${s}.htm`;

export const NH: StateLawProfile = {
  code: "NH",
  name: "New Hampshire",
  framework:
    "N.H. Rev. Stat. Ann. chapter 540 (Actions Against Tenants), chapter 540-A (Prohibited Practices and Security Deposits), and § 48-A:14 (minimum housing standards)",

  deposit: {
    maxMonths: 1,
    capRule:
      "Landlord may not demand or receive a security deposit greater than one month's rent or $100, whichever is greater. A security deposit is all money, in excess of the monthly rent, that Tenant transfers to Landlord for any purpose, so prepaid rent beyond the first month and other up-front charges count toward this limit. If this Lease requires rent to be paid quarterly or less often, the deposit received in addition to the initial rent payment still may not exceed one month's rent. The security deposit rules do not apply to a person who rents a single-family residence and owns no other rental property, or who rents units in an owner-occupied building of five units or fewer, except for any unit occupied by a person 60 years of age or older.",
    capCite: "N.H. Rev. Stat. Ann. §§ 540-A:5, 540-A:6, I(a)",
    returnDays: 30,
    returnRule:
      "Within 30 days after the tenancy ends, Landlord will return the security deposit to Tenant with any interest due. Landlord may deduct the cost of repairing damage to the Premises beyond reasonable wear and tear, unpaid rent, Tenant's share of any real estate tax increase if this Lease requires Tenant to pay it, and other lawful charges due under this Lease that remain unpaid. Landlord will give Tenant a written, itemized list of any damages claimed, stating with particularity the repairs needed, with satisfactory evidence (such as receipts for materials, labor estimates, bills, or invoices) that the repairs have been or will be completed, and a written, itemized list of any unpaid rent, taxes, or other charges claimed, stating the period covered. Tenant should give Landlord a new address when the tenancy ends: Landlord is not liable for a failure caused by Tenant's not doing so, and a deposit and interest left unclaimed 6 months after the tenancy ends become Landlord's property. A landlord who fails to comply is liable for twice the deposit plus interest due, less lawful deductions.",
    returnCite: "N.H. Rev. Stat. Ann. §§ 540-A:7, 540-A:8",
    holdingRule:
      "When Landlord receives the deposit, Landlord will promptly give Tenant a signed receipt stating the amount and the place where the deposit (or a bond for it) is held, unless Tenant paid by personal check, bank check, or a check from a government or nonprofit agency. The deposit remains Tenant's money, held in trust, and will not be mingled with Landlord's personal funds; Landlord may keep all tenants' deposits together in one trust account at a bank, savings and loan association, or credit union organized under New Hampshire law, or may instead post a bond with the clerk of the city or town where the Premises are located. If Landlord holds the deposit for one year or longer, Landlord will pay Tenant interest, from the date Landlord received it, at the rate paid on regular savings accounts by the institution where it is deposited (or Tenant's proportionate share of the actual interest earned on a pooled account). On request, Landlord will tell Tenant the name of the institution, the account number, the amount on deposit, and the interest rate, and will let Tenant examine the deposit records. Tenant may request the accrued interest every 3 years, 30 days before the end of that year's tenancy, and Landlord will pay it within 15 days after that year's tenancy ends. If Landlord sells or assigns the Property, Landlord will turn the deposit over to the new owner or assignee within 5 days and notify Tenant by registered or certified mail of the name and address of the new holder.",
    holdingCite: "N.H. Rev. Stat. Ann. § 540-A:6, I(b)-(c), II-IV",
    interestRequired: true,
    moveInInspection:
      "Landlord will notify Tenant in writing that any conditions in the Premises needing repair or correction should be noted on the deposit receipt or given to Landlord in writing within 5 days after Tenant moves in.",
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
      "Tenant may end a month-to-month tenancy by written notice given at least 30 days in advance; if the termination date in the notice does not fall on a rent due date, Tenant owes rent for the entire month in which the notice expires, up to the next rent due date. Landlord may end a tenancy only by a written eviction notice that states the specific reason and is served personally or left at Tenant's last and usual place of abode, given at least 30 days in advance (7 days when the reason is nonpayment of rent, substantial damage to the Premises, behavior that adversely affects the health or safety of others, or an accused perpetrator remaining after a domestic violence termination). For most residential rental property, Landlord may terminate only for a reason listed in RSA 540:2, II, which includes nonpayment of rent, substantial damage, failure to comply with a material term of this Lease, behavior adversely affecting health or safety, and other good cause (including any legitimate business or economic reason); a tenant's refusal to agree to a rent increase is good cause if Landlord gave at least 30 days' written notice of the increase.",
    monthToMonthCite: "N.H. Rev. Stat. Ann. §§ 540:1-a, 540:2, 540:3, 540:5, 540:11",
    nonpaymentDays: 7,
    nonpaymentRule:
      "If rent is due and unpaid, Landlord must serve Tenant with a written demand for the rent and a written eviction notice giving at least 7 days' notice, stating the reason, and telling Tenant of the right to avoid eviction by paying the arrearage. Tenant may stop an eviction based solely on nonpayment by paying Landlord, at any time before the hearing on the merits, all rent due through the date of payment plus other lawful charges under this Lease, $15 in liquidated damages, and Landlord's filing fee and service costs. Tenant may use this right no more than 3 times in any 12-month period.",
    nonpaymentCite: "N.H. Rev. Stat. Ann. §§ 540:2, II(a), 540:3, II, IV, 540:5, 540:9",
    entryHours: null,
    entryRule:
      "Landlord will not enter the Premises without Tenant's prior consent except to make emergency repairs (which include evaluating, planning, or carrying out emergency treatment of a rodent or insect infestation, including bed bugs, within 72 hours after Landlord first receives notice of it) or under a court order. Tenant will not willfully refuse Landlord access, at a reasonable time after notice that is adequate under the circumstances, to make necessary repairs or perform other reasonable and lawful functions of owning rental property. Tenant will also allow entry, on 48 hours' written notice, to check for bed bugs after Landlord learns they are present in an adjacent unit or the unit directly above or below.",
    entryCite: "N.H. Rev. Stat. Ann. § 540-A:3, IV, IV-a, V, V-b, V-d",
  },

  earlyTermination: {
    military: {
      label: "Military service (state law)",
      cite: "N.H. Rev. Stat. Ann. § 540:11-a",
      eligible:
        "Tenant may terminate this Lease if Tenant is a member of the armed services reserve who is called to active duty, a member of the National Guard who is called to active duty, or a member of the armed services on active duty who is reassigned to a location outside New Hampshire.",
      notice:
        "Tenant must give notice of termination within 7 days after receiving notice of being called to active duty or reassigned out of state, by written notice that complies with Section 305 of the federal Servicemembers Civil Relief Act (50 U.S.C. § 3955). Under that section, because rent is payable monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is delivered. The 7-day deadline applies to this state-law right only and does not limit any right Tenant has directly under the federal Act.",
      documentation:
        "As the federal Act requires, the notice must be accompanied by a copy of Tenant's military orders or a written verification from Tenant's commanding officer.",
      liability:
        "Tenant owes rent only through the effective date of termination, prorated, and no early termination fee or penalty; Landlord will refund rent paid in advance for any period after that date within 30 days, as the federal Act provides.",
    },
    domesticViolence: {
      label: "Domestic violence, sexual assault, or stalking",
      cite: "N.H. Rev. Stat. Ann. § 540:11-b",
      eligible:
        "Tenant may terminate this Lease if, within the most recent 150 days, Tenant or a household member residing at the Premises has been a victim of domestic violence (as defined in RSA 173-B), sexual assault (RSA 632-A), or stalking (RSA 633:3-a), or if within the most recent 150 days an event has occurred involving a victim of past domestic violence, sexual assault, or stalking that, together with the past abuse, causes the victim to fear for the victim's safety.",
      notice:
        "Tenant gives Landlord notice of termination and must vacate the Premises within 30 days after giving notice, or at another time Landlord and Tenant agree on.",
      documentation:
        "Tenant provides written verification that Tenant or the household member who is the victim: has obtained a valid protective order against the perpetrator; has started legal action to obtain a protective order; has reported the domestic violence, sexual assault, or stalking to a law enforcement agency; has a written verification from a law enforcement official, victim's advocate, attorney, or health care provider of victim status; or has signed the self-certification form provided by the New Hampshire circuit court. Landlord will keep the verification, and the fact that anyone is a victim, in strict confidence and will disclose it only with the victim's written consent, when relevant and reasonably necessary in an eviction or housing-assistance proceeding, or as otherwise required by law.",
      liability:
        "Tenant is liable only for rent owed through the termination date or the date Tenant actually vacates, whichever is later, and owes no early termination fee. Any security deposit remains applied to the rental of the Premises until all tenants have vacated and is then returned under RSA 540-A:7. Landlord may evict a remaining co-tenant or occupant who is the accused perpetrator.",
    },
    other: [],
    feeCap: null,
    mitigation: {
      basis: "unclear",
      cite: null,
      rule:
        "If Tenant leaves before the end of the Lease term, Landlord will make reasonable efforts to re-rent the Premises and will credit Tenant with rent actually received from a replacement tenant for the remainder of the term, less Landlord's reasonable costs of re-renting.",
    },
  },

  disclosures: [
    {
      id: "non_electronic_payment",
      title: "Rent Payment Methods",
      text:
        "Tenant is not required to pay rent or any other amount due under this Lease solely by electronic funds transfer, including automatic recurring transfers. Landlord will accept at least one non-electronic form of payment, such as a check or money order.",
      cite: "N.H. Rev. Stat. Ann. § 540-A:3, X",
    },
  ],

  fairHousing: {
    stateClasses: ["age", "sexual orientation", "gender identity", "marital status", "creed"],
    cite: "N.H. Rev. Stat. Ann. §§ 354-A:8, 354-A:10",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Premises only through a possessory action under RSA 540:12-540:14, by a landlord and tenant writ returnable to the district division of the New Hampshire circuit court, after a valid written eviction notice. Landlord will not willfully interrupt utility service, deny Tenant access to the Premises, or seize or withhold Tenant's property except through proper judicial process, and will not attempt to circumvent the lawful eviction procedure.",
    cite: "N.H. Rev. Stat. Ann. §§ 540:12, 540:13, 540-A:2, 540-A:3, I-III",
  },

  habitability: {
    rule:
      "Landlord will maintain the Premises in compliance with applicable local housing codes or, where the municipality has none, with RSA 48-A:14, which requires that the Premises be free of insect and rodent infestations (including bed bugs) not being addressed by a periodic inspection and treatment program; have working internal plumbing and no sewage back-ups from a faulty septic or sewer system; be free of exposed wiring and other electrical shock or fire hazards; have a roof and walls that do not leak consistently, no falling plaster, and no substantial holes in floors, walls, or ceilings; have structurally sound porches, stairs, and railings; have no garbage accumulation in common areas due to Landlord's failure to remove it or provide receptacles; have an adequate water supply and working water-heating equipment; have no gas leaks or defective pilot lights in Landlord-furnished appliances; and have properly installed and maintained heating facilities capable of heating all habitable rooms, bathrooms, and toilet rooms to an average of at least 65 degrees Fahrenheit. Landlord bears the reasonable cost of bed bug remediation unless Tenant was responsible for the infestation, and will not willfully violate Tenant's right to quiet enjoyment.",
    cite: "N.H. Rev. Stat. Ann. §§ 48-A:14, 540:13-d, 540:13-e, 540-A:2",
  },

  sources: [
    { cite: "N.H. Rev. Stat. Ann. § 540:1", url: RSA("LV", "540", "540-1") },
    { cite: "N.H. Rev. Stat. Ann. § 540:1-a", url: RSA("LV", "540", "540-1-a") },
    { cite: "N.H. Rev. Stat. Ann. § 540:1-b", url: RSA("LV", "540", "540-1-b") },
    { cite: "N.H. Rev. Stat. Ann. § 540:2", url: RSA("LV", "540", "540-2") },
    { cite: "N.H. Rev. Stat. Ann. § 540:3", url: RSA("LV", "540", "540-3") },
    { cite: "N.H. Rev. Stat. Ann. § 540:5", url: RSA("LV", "540", "540-5") },
    { cite: "N.H. Rev. Stat. Ann. § 540:9", url: RSA("LV", "540", "540-9") },
    { cite: "N.H. Rev. Stat. Ann. § 540:11", url: RSA("LV", "540", "540-11") },
    { cite: "N.H. Rev. Stat. Ann. § 540:11-a", url: RSA("LV", "540", "540-11-a") },
    { cite: "N.H. Rev. Stat. Ann. § 540:11-b", url: RSA("LV", "540", "540-11-b") },
    { cite: "N.H. Rev. Stat. Ann. § 540:12", url: RSA("LV", "540", "540-12") },
    { cite: "N.H. Rev. Stat. Ann. § 540:13", url: RSA("LV", "540", "540-13") },
    { cite: "N.H. Rev. Stat. Ann. § 540:13-d", url: RSA("LV", "540", "540-13-d") },
    { cite: "N.H. Rev. Stat. Ann. § 540:13-e", url: RSA("LV", "540", "540-13-e") },
    { cite: "N.H. Rev. Stat. Ann. § 540:28", url: RSA("LV", "540", "540-28") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:1", url: RSA("LV", "540-A", "540-A-1") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:2", url: RSA("LV", "540-A", "540-A-2") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:3", url: RSA("LV", "540-A", "540-A-3") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:3-a", url: RSA("LV", "540-A", "540-A-3-a") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:4", url: RSA("LV", "540-A", "540-A-4") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:5", url: RSA("LV", "540-A", "540-A-5") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:6", url: RSA("LV", "540-A", "540-A-6") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:7", url: RSA("LV", "540-A", "540-A-7") },
    { cite: "N.H. Rev. Stat. Ann. § 540-A:8", url: RSA("LV", "540-A", "540-A-8") },
    { cite: "N.H. Rev. Stat. Ann. § 48-A:14", url: RSA("III", "48-A", "48-A-14") },
    { cite: "N.H. Rev. Stat. Ann. § 354-A:8", url: RSA("XXXI", "354-A", "354-A-8") },
    { cite: "N.H. Rev. Stat. Ann. § 354-A:10", url: RSA("XXXI", "354-A", "354-A-10") },
    { cite: "N.H. Rev. Stat. Ann. § 354-A:15", url: RSA("XXXI", "354-A", "354-A-15") },
    { cite: "N.H. Rev. Stat. Ann. § 110-B:71", url: RSA("VIII", "110-B", "110-B-71") },
  ],

  reviewNotes: [
    "Payment methods (important for Keycove): RSA 540-A:3, X (effective Jan. 1, 2025) bars requiring rent, renewal, or extension payments solely by electronic funds transfer, including autopay; at least one non-electronic method must be allowed. A Stripe-only rent flow would violate this for NH units. Violations of 540-A:3, X are excluded from the 358-A civil penalties (540-A:4, IX(d)) but remain prohibited.",
    "Just cause: for 'restricted property' (everything except single-family houses whose owner owns no more than 3 single-family houses, units in owner-occupied buildings of 4 or fewer units, and bank-owned foreclosed houses) the landlord needs a statutory reason to evict, including at lease end. 2024 N.H. Laws c. 9 (effective Jan. 1, 2025) added RSA 540:2, II(i): expiration of a lease whose original or renewed term totals 12 months or more is a ground if the landlord gave at least 60 days' written notice of nonrenewal and files within 6 months. 'Other good cause' before an eviction notice based on tenant conduct requires a prior written warning (540:2, III). The builder's month-to-month rule should not promise no-cause termination for restricted property.",
    "2025 N.H. Laws c. 263 amended RSA 540:2 effective July 1, 2026, and 2026 N.H. Laws c. 308 amended RSA 540-A:2, 540-A:3, 540-A:4, and 540:13 effective Oct. 8, 2026; the profile reflects the text in force on 2026-11-08.",
    "Security deposit: 'all funds in excess of the monthly rent ... for any purpose' (540-A:5, II) means prepaid last month's rent, pet deposits, and similar charges count toward the one-month/$100 cap; this is my reading of the definition. The deposit subdivision does not apply to the exempt small landlords in 540-A:5, I. Interest is owed only if the deposit is held for one year or longer (540-A:6, IV). The move-in condition notice is required even when no receipt is required (540-A:6, I(c)).",
    "Late fees: no statute regulates residential late fees. The only statutory figure is the $15 liquidated damages a tenant pays to cure a nonpayment eviction (540:9). The court demand/eviction notice forms (540:5, II) set the minimum content of notices.",
    "Military: RSA 540:11-a (2004) covers reservists and National Guard members 'called to active duty' and active-duty members reassigned out of state. The statute does not say whether state active duty counts; I left the eligibility text general. Its 7-day notice deadline is stricter than SCRA, so the lease states that the federal right is unaffected. No NH statute extends SCRA wholesale to state active duty (RSA 110-B:71 covers only arrest and civil-process privileges).",
    "Domestic violence termination (RSA 540:11-b) was added by 2024 N.H. Laws c. 9, effective Jan. 1, 2025. The statute says only 'notice' (not 'written notice') for the termination itself; the verification must be written. RSA 540:2, VII separately bars evicting a victim solely for being a victim and requires lock changes at the tenant's expense on a protective order. Waivers of chapter 540 rights are void (540:28).",
    "Entry: New Hampshire uses a consent standard with no fixed hours (540-A:3, IV-V, V-d); landlords may petition the court for access under 540-A:4. Abandoned personal property must be stored with reasonable care for 7 days (540-A:3, VII).",
    "Application fees: any application/renewal fee and the background/credit check requirement must be disclosed in writing before collection, and unused amounts beyond actual screening cost and reasonable administrative costs refunded within 30 days if the applicant is not accepted (540-A:3, VIII).",
    "Owners of restricted property must file the name of an in-state agent for service of process with the town or city clerk within 30 days of becoming owner (540:1-b); this is an owner obligation, not a lease clause.",
    "Co-living and exemptions: chapter 540 does not apply to rooms in rooming or boarding houses rented to transient guests for fewer than 90 consecutive days, or to a single-family home that is the owner's primary residence where the occupant has no lease (540:1-a, IV(a), (d)). The state fair housing law exempts rooms in an owner-occupied private home and owner-occupied buildings of 4 or fewer units, except for discriminatory advertising (354-A:15, II-III). Federal Fair Housing Act exemptions differ.",
    "Fair housing: RSA 354-A:8 lists age, sex, gender identity, race, creed, color, marital status, familial status, disability, national origin, and sexual orientation. RSA 354-A:10's introductory list omits sexual orientation and creed while paragraph VI includes sexual orientation; I relied on 354-A:8's declaration of rights for the class list.",
    "Mitigation: I found no New Hampshire statute; the case law position was not verified from a primary source, so basis is 'unclear' and the lease voluntarily commits Landlord to credit re-rental income. No statutory early termination fee cap, and no other statutory early termination rights (540:13-d is only a defense to nonpayment eviction).",
    "No municipal rent control exists in New Hampshire; Manchester, Nashua, and other cities enforce local housing codes under RSA 48-A that may exceed RSA 48-A:14 (not researched).",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
