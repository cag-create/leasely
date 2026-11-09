import type { StateLawProfile } from "../types";

const NDCC = (chapterPdf: string) => `https://www.ndlegis.gov/cencode/${chapterPdf}.pdf`;

export const ND: StateLawProfile = {
  code: "ND",
  name: "North Dakota",
  framework:
    "N.D. Cent. Code ch. 47-16 (Leasing of Real Property), including the residential maintenance provisions (§§ 47-16-13.1 to 47-16-13.7), and ch. 47-32 (Eviction)",

  deposit: {
    maxMonths: 1,
    capRule:
      "A security deposit, however labeled, may not exceed one month's rent. Landlord may accept up to two months' rent as security from a tenant who has been convicted of a felony (as an incentive to rent to that tenant) or demand up to two months' rent from a tenant who has had a judgment entered against them for violating a previous rental agreement. Separately, Landlord may charge a pet security deposit for an animal that is not a service or companion animal required by a tenant with a disability as a reasonable accommodation; the pet deposit may not exceed the greater of $2,500 or two months' rent.",
    capCite: "N.D. Cent. Code § 47-16-07.1(1)–(2)",
    returnDays: 30,
    returnRule:
      "Within 30 days after this Lease terminates and Tenant delivers possession, Landlord will deliver or mail to Tenant, at the last address Tenant furnished to Landlord, the deposit and accrued interest that are not applied, together with a written notice itemizing any amounts applied and stating any amount still due to Landlord or the refund due to Tenant. Landlord may apply the deposit and interest only to damage to the Property caused by Tenant's pet or by the negligence of Tenant or Tenant's guests, unpaid rent, and the cost of cleaning or other repairs that were Tenant's responsibility and are necessary to return the Property to its condition when Tenant took possession, reasonable wear and tear excepted. Interest is not owed if Tenant's occupancy lasted less than nine months. Landlord is liable for treble damages for any deposit withheld without reasonable justification.",
    returnCite: "N.D. Cent. Code § 47-16-07.1(1), (3)–(4)",
    holdingRule:
      "Landlord will deposit the security deposit in a federally insured, interest-bearing savings or checking account for the benefit of Tenant. If Landlord transfers its ownership interest in the Property, Landlord will transfer the deposit and accrued interest to the new owner, and Landlord is not relieved of liability until it does so.",
    holdingCite: "N.D. Cent. Code § 47-16-07.1(1), (5)",
    interestRequired: true,
    moveInInspection:
      "When this Lease is entered into, Landlord will provide Tenant a written statement describing the condition of the facilities in and about the Property. Landlord and Tenant will both sign the statement, and it is prima facie proof of the condition of the facilities and the Property at the beginning of this Lease.",
  },

  lateFee: {
    graceDays: null,
    capType: "none",
    capRule: "",
    cite: null,
  },

  notice: {
    monthToMonthDays: 31,
    monthToMonthRule:
      "Unless the parties have agreed in writing to a longer notice period or different notice time, either Landlord or Tenant may end a month-to-month tenancy by giving the other at least one calendar month's written notice at any time; rent is due up to and including the termination date. If a fixed-term lease has converted to a month-to-month tenancy after expiring, either party may end it on the last day of a month with at least one calendar month's notice. If Landlord changes the terms of a month-to-month tenancy on 30 days' written notice, Tenant may terminate at the end of the month by giving at least 25 days' notice.",
    monthToMonthCite: "N.D. Cent. Code §§ 47-16-07, 47-16-15(2)–(5)",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If Tenant fails to pay rent for three days after it is due, Landlord may begin an eviction action only after giving Tenant three days' written notice of intention to evict, served as a summons is served or, if Tenant cannot be found, posted conspicuously on the Property by the sheriff or a process server.",
    nonpaymentCite: "N.D. Cent. Code §§ 47-32-01(4), 47-32-02",
    entryHours: null,
    entryRule:
      "Landlord may enter the Property at any time in an emergency, if Landlord reasonably believes Tenant has abandoned the Property, or if Landlord reasonably believes Tenant is in substantial violation of this Lease. Otherwise, Landlord may enter only during reasonable hours and in a reasonable manner to inspect the Property; make necessary or agreed repairs, decorations, alterations, or improvements; supply necessary or agreed services; or show the Property to actual or potential purchasers, insurers, mortgagees, real estate agents, tenants, workers, or contractors. Unless it is impractical to do so, Landlord will first notify Tenant and obtain Tenant's consent, which Tenant will not unreasonably withhold and which will identify a time certain. Tenant's consent is presumed if Tenant does not object after Landlord gives notice of intent to enter at a time certain. Notice may be given in person, by posting it conspicuously in or about the Property for a reasonable period, or by any other method that gives Tenant actual notice. Landlord will not abuse the right of access or use it to harass or intimidate Tenant.",
    entryCite: "N.D. Cent. Code § 47-16-07.3",
  },

  earlyTermination: {
    military: {
      label: "State active service (North Dakota military civil relief act)",
      cite: "N.D. Cent. Code §§ 37-01-43, 37-01-01(2); 50 U.S.C. § 3955",
      eligible:
        "An individual called or ordered to active service for the state of North Dakota (state active duty as defined in N.D. Cent. Code § 37-01-01, such as North Dakota National Guard service in aid of civil authorities) for 30 or more consecutive days has the same lease-termination protections that the federal Servicemembers Civil Relief Act gives members of the U.S. armed forces. A Tenant who enters such service after signing this Lease, or who while in such service receives orders for a permanent change of station or to deploy for 90 days or more, may terminate this Lease on the terms below. Termination by such a Tenant also ends the obligations of the Tenant's dependents under this Lease.",
      notice:
        "Tenant delivers written notice of termination to Landlord by hand delivery, private business carrier, U.S. mail with return receipt requested, or electronic means. Because rent is payable monthly, termination takes effect 30 days after the first date on which the next rental payment is due after Landlord receives the notice.",
      documentation:
        "The notice must include a copy of Tenant's military orders calling Tenant to state active service (or the change-of-station or deployment orders).",
      liability:
        "Tenant owes rent prorated to the effective termination date and any other amounts due under this Lease at termination, such as reasonable charges for excess wear, but Landlord will not charge any early termination fee. Landlord will refund any rent paid in advance for the period after the effective date within 30 days after that date.",
    },
    domesticViolence: {
      label: "Domestic violence",
      cite: "N.D. Cent. Code §§ 47-16-17.1, 14-07.1-01",
      eligible:
        "A Tenant who is a victim of domestic violence (as defined in N.D. Cent. Code § 14-07.1-01), or who fears imminent domestic violence against Tenant or Tenant's minor children if they remain in the Property, may terminate this Lease without penalty or liability except as stated below.",
      notice:
        "Tenant gives Landlord advance written notice, delivered by mail, fax, or in person before the tenancy ends, stating that (1) Tenant fears imminent domestic violence from a person named in a court order, an order prohibiting contact, a civil protection order under N.D. Cent. Code ch. 14-07.7, or another record filed with a court; (2) Tenant needs to terminate the tenancy; and (3) the specific date the tenancy will terminate. The tenancy, including Tenant's right to possession, ends on the date stated in the notice.",
      documentation:
        "The notice must identify the person named in the court order, order prohibiting contact, civil protection order, or other court record. Landlord will not disclose information Tenant provides documenting domestic violence, will not enter it into any shared database or give it to any person, and may use it only as evidence in an eviction proceeding, in a claim for unpaid rent or damages arising out of the tenancy, or as otherwise required by law.",
      liability:
        "Tenant owes rent for the full month in which the tenancy terminates plus an additional amount equal to one month's rent, subject to Landlord's duty to mitigate. The additional month's rent must be paid on or before the termination date for Tenant to be released from the rest of the Lease; Tenant is then relieved of any other rent or charges for the remaining term but remains liable for rent or other amounts that were delinquent before termination. The Lease continues for any remaining tenants. If Tenant (with Tenant's minor children) is the only tenant, the 30-day deposit-return period begins on the first day of the month after Tenant vacates; if other tenants remain bound by the Lease, it begins when the Lease expires. Landlord will not refuse to rent to, or retaliate against, anyone because they exercised this right.",
    },
    other: [
      {
        label: "Landlord's failure to repair or secure quiet possession",
        cite: "N.D. Cent. Code §§ 47-16-13, 47-16-17(1), 47-16-21",
        eligible:
          "If Landlord does not, within a reasonable time after Tenant's notice or request, repair dilapidations that Landlord ought to repair, put the Property into good condition, or secure Tenant's quiet possession of the Property, Tenant may terminate this Lease and vacate.",
        notice:
          "Tenant must first notify Landlord of the condition or make the request and allow Landlord a reasonable time to fulfill its obligation before vacating.",
        documentation: "",
        liability:
          "If Tenant vacates under this right, Tenant is discharged from further payment of rent and performance of other Lease conditions, and owes only the proportionate rent for the use Tenant actually made of the Property.",
      },
      {
        label: "Destruction of the Property",
        cite: "N.D. Cent. Code §§ 47-16-14(4), 47-16-17(2)",
        eligible:
          "If the greater part of the Property, or the part that was the material inducement for Tenant to enter into this Lease, perishes from any cause other than Tenant's ordinary negligence, Tenant may terminate this Lease. Destruction of the Property also terminates this Lease.",
        notice: "Tenant gives Landlord written notice of termination.",
        documentation: "",
        liability:
          "Tenant owes only the proportionate rent for the period Tenant actually used the Property and no early termination fee.",
      },
      {
        label: "Death of a tenant",
        cite: "N.D. Cent. Code § 47-16-18",
        eligible:
          "If a Tenant dies, any surviving tenant or the estate of the deceased Tenant may elect to terminate this Lease.",
        notice:
          "The Lease terminates on the last day of the month following the month of the Tenant's death, unless the Lease term ends sooner.",
        documentation: "",
        liability:
          "Rent is owed through the termination date; no early termination fee applies.",
      },
      {
        label: "Fraudulent inducement",
        cite: "N.D. Cent. Code § 47-16-07.4",
        eligible:
          "If this Lease was entered into in partial or total reliance on fraudulent misrepresentations, the party who was fraudulently induced may terminate it.",
        notice: "The defrauded party gives the other party written notice of termination.",
        documentation: "",
        liability:
          "If Tenant was the party fraudulently induced, Tenant is entitled to the return of the security deposit with any accrued interest.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "N.D. Cent. Code §§ 47-16-13.5, 47-16-13.7, 47-16-17.1(5)",
      rule:
        "If Tenant leaves before the end of the term or is evicted, Landlord has a duty to mitigate its damages, including by making reasonable efforts to re-rent the Property, and will credit rent received from a replacement tenant against amounts Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "payment_method_fee",
      title: "No Fee for Cash, Check, or Money Order",
      text: "Landlord will not charge Tenant a fee to accept cash, a check, or a money order for rent or any other payment required under this Lease.",
      cite: "N.D. Cent. Code § 47-16-20.1",
    },
    {
      id: "automatic_renewal",
      title: "Automatic Renewal Notice",
      text: "Landlord may enforce an automatic renewal clause in this Lease only if Landlord notifies Tenant in writing of the automatic renewal provision, delivered personally or by first-class mail, at least 30 days before the current term expires. If Landlord does not give that notice, this Lease expires at the end of its term and converts to a month-to-month tenancy on the same terms.",
      cite: "N.D. Cent. Code § 47-16-06.1",
      condition: "Only if this Lease has a term of two months or more and contains an automatic renewal clause",
    },
    {
      id: "extended_notice_initials",
      title: "Notice Period Longer Than One Month",
      text: "This Lease requires Tenant to give notice of more than one month from the end of a month to terminate. Tenant must initial here to agree to that longer notice period: ________. If Tenant does not initial this provision when signing this Lease, Tenant may terminate on the last day of a month by giving at least one calendar month's notice.",
      cite: "N.D. Cent. Code § 47-16-15(4)",
      condition: "Only if this Lease requires Tenant to give more than one month's notice from the end of a month to terminate",
    },
  ],

  fairHousing: {
    stateClasses: ["age", "status with respect to marriage (marital status)", "status with respect to public assistance"],
    cite: "N.D. Cent. Code §§ 14-02.5-02 to 14-02.5-08",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through an eviction action in district court under N.D. Cent. Code ch. 47-32, after any required three-day written notice of intention to evict. Landlord will not use self-help, such as changing the locks, removing Tenant's belongings, or shutting off utilities, to remove Tenant.",
    cite: "N.D. Cent. Code §§ 47-32-01, 47-32-02, 47-32-04",
  },

  habitability: {
    rule:
      "Landlord will comply with applicable building and housing codes materially affecting health and safety; make all repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition; keep common areas clean and safe; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies or is required to supply; provide receptacles for and arrange removal of garbage and other waste; and supply running water, reasonable amounts of hot water at all times, and reasonable heat, except where heat or hot water is generated by an installation in Tenant's exclusive control and supplied by a direct utility connection. Landlord has a reasonable time to remedy noncompliance.",
    cite: "N.D. Cent. Code § 47-16-13.1",
  },

  sources: [
    { cite: "N.D. Cent. Code ch. 47-16 (§§ 47-16-01 to 47-16-30.1, read in full)", url: NDCC("t47c16") },
    { cite: "N.D. Cent. Code ch. 47-32 (§§ 47-32-01 to 47-32-05)", url: NDCC("t47c32") },
    { cite: "N.D. Cent. Code ch. 14-02.5 (§§ 14-02.5-01 to 14-02.5-11)", url: NDCC("t14c02-5") },
    { cite: "N.D. Cent. Code § 14-07.1-01", url: NDCC("t14c07-1") },
    { cite: "N.D. Cent. Code §§ 37-01-01, 37-01-43", url: NDCC("t37c01") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "Military: § 37-01-43 does not create its own termination procedure; it extends 'all of the protections' of the SCRA (as in effect Dec. 31, 2024) to anyone called to North Dakota 'active service' for 30+ consecutive days. Applying SCRA § 3955's triggers (entry into service after signing, PCS or 90-day deployment orders) to state active service is our interpretation; the notice/effective-date/no-fee terms are copied from § 3955. Attorney should confirm this is how ND would apply it.",
    "Domestic violence (§ 47-16-17.1): no third-party verification or copy of the order is expressly required — the notice must state that Tenant fears imminent violence from a person 'named in' a court order, order prohibiting contact, protection order, or other court record. The tenant still owes the termination month plus one additional month's rent (subject to mitigation), which must be paid by the termination date to obtain the release. Statutory damages of $1,000 for violations.",
    "Deposit: interest is owed only if occupancy is nine months or longer, but the deposit must always be held in a federally insured interest-bearing account. The two-month tiers (felony conviction; prior rental-agreement judgment) are landlord-elective exceptions. The pet deposit cap is the GREATER of $2,500 or two months' rent and is in addition to the general deposit. Treble damages for unjustified withholding.",
    "Late fees: no North Dakota statute caps or regulates residential late fees; any fee should be reasonable (unconscionability review under § 47-16-13.3). § 47-16-20.1 separately bars fees for accepting cash, checks, or money orders.",
    "Month-to-month: the statute says 'one calendar month' rather than a day count; monthToMonthDays is set to 31 as the conservative numeric equivalent. § 47-16-15(4) requires a separate tenant initial for any lease clause requiring more than one month's notice from the end of a month — the builder should either avoid such clauses or render the initial line.",
    "Entry: no hour count; statute requires notice and consent identifying a time certain unless impractical, with consent presumed if the tenant does not object.",
    "Self-help: ch. 47-32 provides the judicial eviction remedy and § 47-32-01(1)–(3) treats forcible entry/detention as actionable, but North Dakota has no single express self-help prohibition comparable to URLTA; the lease sentence is a contractual commitment.",
    "Fair housing: § 14-02.5-02(5) says nothing in the chapter prevents refusing to rent to two unrelated individuals of opposite gender who are not married to each other. Do NOT build on this for co-living screening; federal sex-discrimination law and local ordinances still apply. Owner-occupied buildings of up to four units are exempt from most of the chapter (§ 14-02.5-09(2)), but the federal FHA advertising rules still apply.",
    "Rent control is preempted statewide (§ 47-16-02.1). Check local human-rights ordinances (e.g., Fargo, Grand Forks) for additional protected classes such as sexual orientation or gender identity — not verified here.",
    "Abandoned property worth $2,500 or less may be disposed of 28 days after the tenant vacates (§ 47-16-30.1) — useful for the builder's move-out clause.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
