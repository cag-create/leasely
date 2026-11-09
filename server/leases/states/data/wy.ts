import type { StateLawProfile } from "../types";

const WYO = (title: string) => `https://wyoleg.gov/statutes/compress/title${title}.pdf`;

export const WY: StateLawProfile = {
  code: "WY",
  name: "Wyoming",
  framework:
    "Wyoming Residential Rental Property Act, Wyo. Stat. Ann. §§ 1-21-1201 to 1-21-1211; forcible entry and detainer, §§ 1-21-1001 et seq.; Wyoming Safe Homes Act, §§ 1-21-1301 to 1-21-1304",

  deposit: {
    maxMonths: null,
    capRule:
      "Wyoming sets no maximum amount for a security deposit. This Lease must state whether any portion of the deposit is nonrefundable, and Landlord must also give Tenant written notice of any nonrefundable portion when the deposit is taken.",
    capCite: "Wyo. Stat. Ann. § 1-21-1207",
    returnDays: 30,
    returnRule:
      "When this Lease terminates, Landlord may apply the deposit to accrued rent, damage to the Property beyond reasonable wear and tear, the cost of cleaning the Property to its condition at the beginning of this Lease, and other costs provided by this Lease. Landlord will deliver or mail to Tenant, without interest, the balance of the deposit and any prepaid rent, with a written itemization of any deductions and the reasons for them, within 30 days after this Lease terminates or within 15 days after Landlord receives Tenant's new mailing address, whichever is later. If there is damage to the Property, this period is extended by 30 days. Within 30 days after termination, Tenant will notify Landlord of the address where payment and notice may be sent. Any separately identified utilities deposit will be refunded within 10 days after Tenant satisfactorily shows that all utility charges Tenant incurred are paid; if Tenant does not make that showing within 45 days after termination, Landlord will apply the utilities deposit to Tenant's outstanding utility debt within 15 days afterward and refund any remainder within 7 days after applying it (or within 15 days after receiving Tenant's new mailing address, if later).",
    returnCite: "Wyo. Stat. Ann. § 1-21-1208",
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
      "Wyoming statutes set no notice period for ending a month-to-month tenancy. When this Lease expires, it is not renewed by implication: if Tenant holds over and Landlord accepts rent, only a tenancy at sufferance results, unless the parties sign a written renewal. For any month-to-month tenancy the parties create in a signed writing, either party may end it by giving the other at least 30 days' written notice.",
    monthToMonthCite: "Wyo. Stat. Ann. §§ 34-2-128, 34-2-129",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If Tenant fails to pay rent for three days after it is due, Landlord may serve a written notice to quit at least three days before filing a forcible entry and detainer action, by leaving a written copy with Tenant or at Tenant's usual place of abode or business if Tenant cannot be found.",
    nonpaymentCite: "Wyo. Stat. Ann. §§ 1-21-1002(a)(i), 1-21-1003",
    entryHours: null,
    entryRule:
      "Wyoming law sets no advance-notice period for entry. Tenant will not unreasonably deny access to, refuse entry to, or withhold consent for Landlord, Landlord's agent, or manager to enter the Property to make repairs, inspect it, or show it for rent or sale. Except in an emergency, Landlord will give Tenant reasonable advance notice and will enter at reasonable times.",
    entryCite: "Wyo. Stat. Ann. § 1-21-1205(a)(iii)",
  },

  earlyTermination: {
    military: {
      label: "Wyoming National Guard on active state service (state law)",
      cite: "Wyo. Stat. Ann. §§ 19-11-122, 19-7-101(a)(v); 50 U.S.C. § 3955",
      eligible:
        "A Tenant who is a member of the Wyoming National Guard ordered by the state or federal government to active state service (as defined in Wyo. Stat. Ann. § 19-7-101(a)(v), including state active duty and duty under Title 32, U.S. Code) for more than 30 consecutive days has all of the protections the federal Servicemembers Civil Relief Act gives members of the U.S. armed forces. A Tenant who enters such service after signing this Lease, or who while in such service receives orders for a permanent change of station or to deploy for 90 days or more, may terminate this Lease on the terms below. Termination by such a Tenant also ends the obligations of the Tenant's dependents under this Lease.",
      notice:
        "Tenant delivers written notice of termination to Landlord by hand delivery, private business carrier, U.S. mail with return receipt requested, or electronic means. Because rent is payable monthly, termination takes effect 30 days after the first date on which the next rental payment is due after Landlord receives the notice.",
      documentation: "The notice must include a copy of Tenant's military orders.",
      liability:
        "Tenant owes rent prorated to the effective termination date and any other amounts due under this Lease at termination, such as reasonable charges for excess wear, but Landlord will not charge any early termination fee. Landlord will refund any rent paid in advance for the period after the effective date within 30 days after that date. Knowingly violating these protections is a misdemeanor under Wyoming law.",
    },
    domesticViolence: {
      label: "Domestic abuse or sexual violence (Wyoming Safe Homes Act)",
      cite: "Wyo. Stat. Ann. §§ 1-21-1301 to 1-21-1304",
      eligible:
        "Tenant is not liable for rent for the period after Tenant vacates the Property if either (a) when Tenant vacated, Tenant or a member of Tenant's household was under a credible imminent threat of domestic abuse or sexual violence (including sexual assault, sexual abuse, or stalking) at the Property; or (b) Tenant or a member of Tenant's household was a victim of domestic abuse or sexual violence on premises owned or controlled by Landlord, Tenant vacated as a result, and the abuse or violence occurred no more than 60 days before Tenant's notice (or as soon as practicable afterward if hospitalization, seeking shelter or counseling, or similar reasons related to the abuse prevented earlier notice).",
      notice:
        "Tenant gives Landlord at least 7 days' written notice before vacating, stating that Tenant is vacating because of the credible imminent threat of, or the occurrence of, domestic abuse or sexual violence against Tenant or a member of Tenant's household. For abuse or violence that has already occurred on the premises, the notice must also state the date it occurred.",
      documentation:
        "The threat or abuse must be shown by medical, court, or police evidence. For abuse or violence that has already occurred on the premises, the notice must state that Tenant has provided that medical, court, or police evidence to Landlord.",
      liability:
        "Tenant remains liable for rent for the period before Tenant gave the required notice and vacated, but owes no rent for the period after vacating. Landlord will not terminate the tenancy based solely on Tenant's or a household member's status as a victim of domestic abuse or sexual violence. These protections cannot be waived or modified in this Lease or any separate agreement.",
    },
    other: [
      {
        label: "Court termination for uncorrected health or safety conditions",
        cite: "Wyo. Stat. Ann. §§ 1-21-1203(b), 1-21-1206",
        eligible:
          "If Tenant is current on all payments, is complying with Tenant's duties under this Lease and Wyo. Stat. Ann. §§ 1-21-1204 and 1-21-1205, and the Property does not meet the health and safety standards of Wyoming law, Tenant may ask the circuit court to terminate this Lease if Landlord unreasonably refuses or fails to use due diligence to correct the condition.",
        notice:
          "Tenant must first give Landlord written notice of the condition and the remedial action requested, by certified mail or by leaving a copy with Landlord or at Landlord's usual place of abode or business. If Landlord does not respond or correct the condition within a reasonable time, Tenant must serve a 'notice to repair or correct condition' in the same manner, stating that Tenant will seek redress in court if Landlord does not begin reasonable corrective action within 3 days. Tenant may then file a civil action in circuit court.",
        documentation:
          "The written notices must recite the previous notice, the number of days elapsed, and the conditions that remain uncorrected.",
        liability:
          "If the court terminates this Lease, Tenant is entitled to a refund of the balance of the rent and the deposit within 30 days after the termination order, and must vacate no sooner than 10 days and no later than 20 days after the court terminates the Lease.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "unclear",
      cite: null,
      rule:
        "If Tenant leaves before the end of the term, Landlord will credit against Tenant's remaining obligations any rent Landlord receives from a replacement tenant for the remainder of the term.",
    },
  },

  disclosures: [
    {
      id: "nonrefundable_deposit",
      title: "Nonrefundable Portion of Deposit",
      text: "Any portion of the deposit that is nonrefundable is identified as nonrefundable in the Security Deposit section of this Lease. If no portion is identified as nonrefundable, the entire deposit is refundable, subject to lawful deductions. Landlord will also give Tenant written notice of any nonrefundable portion at the time the deposit is taken.",
      cite: "Wyo. Stat. Ann. § 1-21-1207",
    },
  ],

  fairHousing: {
    stateClasses: [],
    cite: "Wyo. Stat. Ann. §§ 40-26-103 to 40-26-107",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through a forcible entry and detainer action in circuit court under Wyo. Stat. Ann. §§ 1-21-1001 et seq., after serving the required notice to quit. Only after a court order may the sheriff remove Tenant's possessions and prevent reentry; Landlord will not use self-help to remove Tenant.",
    cite: "Wyo. Stat. Ann. §§ 1-21-1002, 1-21-1003, 1-21-1211(a)",
  },

  habitability: {
    rule:
      "Landlord will maintain the Property in a safe and sanitary condition fit for human habitation, with operational electrical, heating, and plumbing systems and hot and cold running water unless otherwise agreed in writing by both parties. Landlord will not rent the Property unless it is reasonably safe, sanitary, and fit for human occupancy; will maintain common areas in a sanitary and reasonably safe condition; will maintain the electrical, plumbing, heating, and hot and cold water systems; and will maintain other appliances and facilities as specifically contracted in this Lease. Landlord is not required to correct conditions caused by Tenant's, Tenant's family's, or Tenant's guests' misuse.",
    cite: "Wyo. Stat. Ann. §§ 1-21-1202(a), 1-21-1203(a), (c)",
  },

  sources: [
    { cite: "Wyo. Stat. Ann. §§ 1-21-1001 to 1-21-1009 (forcible entry and detainer)", url: WYO("01") },
    { cite: "Wyo. Stat. Ann. §§ 1-21-1201 to 1-21-1211 (Residential Rental Property Act, read in full)", url: WYO("01") },
    { cite: "Wyo. Stat. Ann. §§ 1-21-1301 to 1-21-1304 (Wyoming Safe Homes Act)", url: WYO("01") },
    { cite: "Wyo. Stat. Ann. §§ 34-2-128, 34-2-129", url: WYO("34") },
    { cite: "Wyo. Stat. Ann. §§ 19-11-122 to 19-11-125, 19-7-101", url: WYO("19") },
    { cite: "Wyo. Stat. Ann. §§ 40-26-101 to 40-26-107 (Wyoming Fair Housing Act)", url: WYO("40") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "Military: § 19-11-122(a) extends 'all protections' of the SCRA to Wyoming National Guard members ordered to active state service for more than 30 consecutive days (active state service includes Title 32 duty, per § 19-7-101(a)(v)); knowing violation is a misdemeanor (fine up to $1,000) and attorney fees are mandatory (§ 19-11-123). Applying SCRA § 3955's triggers to state service is our interpretation. § 19-11-125 (service contracts — telecom, gym, 'other services provided pursuant to a contract that requires periodic and ongoing payments') is NOT treated as covering residential leases; flag if counsel reads clause (b)(vi) more broadly.",
    "Domestic violence: the Safe Homes Act is framed as an affirmative defense to a landlord's suit for post-vacancy rent, not as an affirmative termination procedure. It requires 7 days' written notice and medical, court, or police evidence. It is silent on co-tenants (whether others on the lease are released) and on deposits; the generator should not imply a co-tenant release. Non-waivable (§ 1-21-1304).",
    "Month-to-month: no statute sets a notice period. §§ 34-2-128 and 34-2-129 bar implied renewals — a holdover with accepted rent is only a tenancy at sufferance, and any renewal or new periodic tenancy requires a signed writing. The 30-day period is a contractual choice (conservative), not statutory. The builder's holdover clause should say holdover creates a tenancy at sufferance unless renewed in writing.",
    "Entry: no statutory notice period; only the tenant's duty not to unreasonably deny access (§ 1-21-1205(a)(iii)). The 'reasonable notice' sentence is contractual.",
    "Deposit: no cap, no interest ('without interest'), no holding rules. Return deadline is the LATER of 30 days after termination or 15 days after receipt of the new address, plus 30 more days if there is damage — returnDays is the 30-day base. Penalty for unreasonable noncompliance is forfeiture of the full deposit plus court costs (§ 1-21-1208(c)).",
    "Late fees: no Wyoming statute caps or regulates residential late fees.",
    "Mitigation: no Wyoming statute. Wyoming case law on a residential landlord's duty to mitigate was not located in a primary source during this research — attorney should confirm and, if a duty exists, upgrade basis to 'case_law'. The lease commits to crediting re-letting rent regardless.",
    "Self-help: no express statutory prohibition; § 1-21-1211(a) contemplates the sheriff removing possessions after a court order. The no-self-help sentence is contractual.",
    "Fair housing: the Wyoming Fair Housing Act (§ 40-26-103) protects only the federal seven classes. Laramie has a local ordinance adding sexual orientation and gender identity — not verified here.",
    "Owner repair-or-terminate option: § 1-21-1203(d) lets the landlord refuse an unreasonably expensive repair and terminate the lease on 10–20 days' written notice with prorated rent refund — the builder may want to mention this in the maintenance clause.",
    "Interest on unpaid damages beyond the deposit is 10% per annum (§ 1-21-1211(b)).",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
