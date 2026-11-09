import type { StateLawProfile } from "../types";

const ILCS = (ch: number, act: number, sec: string) => {
  const c = String(ch).padStart(4, "0");
  const a = String(act).padStart(4, "0");
  return `https://ilga.gov/ftp/ILCS/Ch%20${c}/Act%20${a}/${c}${a}0K${sec}.html`;
};

export const IL: StateLawProfile = {
  code: "IL",
  name: "Illinois",
  framework:
    "Illinois landlord-tenant statutes: Landlord and Tenant Act (765 ILCS 705), Security Deposit Return Act (765 ILCS 710), Security Deposit Interest Act (765 ILCS 715), Safe Homes Act (765 ILCS 750), Summary of Rights for Safer Homes Act (765 ILCS 752), Landlord Retaliation Act (765 ILCS 721), and the Eviction Act (735 ILCS 5/Art. IX)",

  deposit: {
    maxMonths: null,
    capRule: "Illinois state law sets no maximum amount for a security deposit.",
    capCite: null,
    returnDays: 30,
    returnRule:
      "Landlord may withhold any part of the deposit for property damage only if, within 30 days after Tenant vacates or Tenant's right of possession ends (whichever is later), Landlord delivers to Tenant in person, by postmarked mail to Tenant's last known address, or by email to a verified email address Tenant provided, an itemized statement of the damage and the estimated or actual cost to repair or replace each item, with paid receipts or copies attached. If estimated costs are given, Landlord shall furnish the paid receipts within 30 days after the statement. If Landlord does not furnish the statement and receipts as required, Landlord shall return the full deposit within 45 days after Tenant vacates. Landlord may use the reasonable cost of Landlord's own labor. A charge for a specific component may be withheld at the dollar amount stated in this Lease only if it is for damage beyond normal wear and tear and the statement references that amount and includes a copy of the applicable Lease provision.",
    returnCite: "765 ILCS 710/1",
    holdingRule:
      "If the property has 25 or more units in one building or a complex of buildings on contiguous parcels, Landlord shall pay Tenant interest on any deposit held more than 6 months, at the rate the largest commercial bank headquartered in Illinois paid on minimum-deposit passbook savings accounts on December 31 of the year before the Lease began, paid within 30 days after the end of each 12-month rental period (in cash or as a credit against rent) once it reaches $5, and in full at the end of the tenancy. If Landlord transfers the property, the new owner becomes liable for the deposit and any interest.",
    holdingCite: "765 ILCS 715/1–715/3; 765 ILCS 710/1.1",
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
      "A month-to-month tenancy may be ended by at least 30 days' written notice (7 days' written notice for a week-to-week tenancy).",
    monthToMonthCite: "735 ILCS 5/9-207",
    nonpaymentDays: 5,
    nonpaymentRule:
      "Any time after rent is due, Landlord may demand payment in writing and notify Tenant that the Lease will end unless payment is made within a stated time of not less than 5 days after service. To avoid invalidation by partial payment, the notice must state: \"Only FULL PAYMENT of the rent demanded in this notice will waive the landlord's right to terminate the lease under this notice, unless the landlord agrees in writing to continue the lease in exchange for receiving partial payment.\" For other lease defaults, Landlord may give a 10-day notice to quit.",
    nonpaymentCite: "735 ILCS 5/9-209, 9-210, 9-211",
    entryHours: null,
    entryRule:
      "Except in an emergency, Landlord will give Tenant reasonable advance notice and will enter the Premises only at reasonable times to inspect, make repairs, or show the Premises.",
    entryCite: null,
  },

  earlyTermination: {
    military: {
      label: "Military service (Illinois law)",
      cite: "765 ILCS 705/16; 330 ILCS 63/50",
      eligible:
        "A Tenant who is an Illinois resident and a member of any component of the U.S. Armed Forces or the National Guard of any state, D.C., commonwealth, or territory (or a member of that Tenant's family who lives with Tenant at the Premises) may terminate this Lease if, after signing it, Tenant enters full-time military training or duty ordered by the President, a governor, or other military authority for more than 29 consecutive days, or if Tenant, while in military service, receives orders for a permanent change of station or to deploy for at least 90 days, whether the Lease was signed before or during military service.",
      notice:
        "Termination takes effect 30 days after Tenant delivers notice to Landlord, except that when rent is paid monthly, termination takes effect 30 days after the next rent due date following the notice.",
      documentation:
        "Tenant must give Landlord a copy of the orders calling Tenant to military service for more than 29 consecutive days and any orders extending that service.",
      liability:
        "Landlord shall return any unearned rent paid in advance and the security deposit, except amounts for actual damages or repairs as provided in this Lease. Refusing a valid termination is a civil rights violation under the Illinois Human Rights Act.",
    },
    domesticViolence: {
      label: "Domestic or sexual violence (Safe Homes Act)",
      cite: "765 ILCS 750/15, 750/20, 750/30",
      eligible:
        "Tenant may vacate without liability for later rent if, when Tenant vacates, Tenant or a member of Tenant's household is under a credible imminent threat of domestic or sexual violence at the Premises, or if Tenant or a household member was a victim of sexual violence on premises owned or controlled by Landlord and Tenant vacates as a result.",
      notice:
        "Tenant must give Landlord written notice, before or within 3 days after vacating, that Tenant is vacating because of the threat or the sexual violence. For sexual violence on the premises, the notice must state the date of the violence, and the violence must have occurred no more than 60 days before the notice (or as soon as practicable if hospitalization, shelter, or counseling prevented timely notice).",
      documentation:
        "For sexual violence on the premises, Tenant must give Landlord at least one form of evidence: medical, court, or police evidence, or a statement from an employee of a victim services or rape crisis organization from which Tenant or a household member sought services.",
      liability:
        "Tenant is not liable for rent for the period after Tenant vacates, but remains responsible for rent for the period before Tenant vacated and gave the required notice. Landlord will not disclose to a prospective landlord that Tenant exercised these rights. These rights may not be waived or modified in this Lease or any separate agreement.",
    },
    other: [
      {
        label: "Undisclosed flood zone or flooding",
        cite: "765 ILCS 705/25(e)",
        eligible:
          "If Landlord did not disclose that the Premises are in a FEMA Special Flood Hazard Area, Tenant may terminate this Lease after learning of the omission. If Landlord failed to make a required flood disclosure and flooding then damages Tenant's personal property, affects habitability, or affects Tenant's access to the Premises, Tenant may terminate this Lease.",
        notice:
          "Tenant must give written notice of termination no later than 30 days after learning of Landlord's failure to disclose, or no later than 30 days after the flood, as applicable.",
        documentation: "",
        liability:
          "Landlord shall return all rent and fees paid in advance within 15 days after Tenant's notice. Tenant may also sue to recover damages for personal property lost or damaged by flooding.",
      },
      {
        label: "Radon hazard",
        cite: "420 ILCS 46/26(b), (e)",
        eligible:
          "If, within 90 days after the Lease begins, a radon test arranged by Tenant shows radon above the Illinois Emergency Management Agency's recommended action level and Landlord elects not to mitigate, Tenant may terminate this Lease. If Landlord did not provide the required radon pamphlet, records, and disclosure form, Tenant may test at any time during the Lease, and if a radon hazard is shown and Landlord does not dispute the result with its own licensed radon contractor's test or does not mitigate, Tenant may terminate within 60 days.",
        notice:
          "Tenant must give Landlord copies of the radon test results within 10 days after receiving them. Landlord may obtain a confirming test by a licensed radon contractor within 30 days after Tenant's notice.",
        documentation: "Tenant's radon test results, including any records or reports of radon concentrations.",
        liability:
          "Landlord may not withhold any part of the security deposit for radon testing or mitigation when Tenant terminates for an undisclosed radon hazard.",
      },
      {
        label: "Landlord's failure to pay utilities",
        cite: "765 ILCS 735/1",
        eligible:
          "If Landlord is required by this Lease to pay for water, gas, or electric service and fails to pay for it, Tenant may terminate this Lease, or may pay the utility to keep service on and deduct that amount from rent.",
        notice: "",
        documentation: "",
        liability:
          "Termination does not release either party from obligations that arose under this Lease before termination.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "735 ILCS 5/9-213.1",
      rule:
        "Landlord shall take reasonable measures to mitigate the damages recoverable against Tenant, and any rent Landlord receives from a replacement tenant will be credited against what Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "safer_homes_summary",
      title: "Summary of Rights for Survivors of Domestic and Sexual Violence",
      text:
        "The Illinois Department of Human Rights summary of housing protections for survivors of domestic violence and sexual violence is attached as the first page of this Lease. Each Tenant signs the acknowledgment of receipt at the bottom of each page of the summary.",
      cite: "765 ILCS 752/15–752/25",
    },
    {
      id: "flood_zone",
      title: "Flood Disclosure",
      text:
        "Landlord [ ] is or [ ] is not aware that the rental property is located in a FEMA Special Flood Hazard Area (\"100-year floodplain\"). The property has experienced flooding [ ] times in the last 10 years. Even if the rental property is not in a Special Flood Hazard Area (\"100-year floodplain\"), the dwelling may still be susceptible to flooding. The Federal Emergency Management Agency (FEMA) maintains a flood map on its Internet website that is searchable by address, at no cost, to determine if a dwelling is located in a flood hazard area. Landlord [ ] is or [ ] is not aware that the rental property you are renting has flooded at least once in the last 10 years. The rental property has flooded [ ] times in the last 10 years. Even if the dwelling has not flooded in the last 10 years, the dwelling may still be susceptible to flooding. Most tenant insurance policies do not cover damage or loss incurred in a flood. You are encouraged to examine your policy to determine whether you are covered. If you are not, flood insurance may be available through FEMA's National Flood Insurance Program to cover your personal property in the event of a flood. Information regarding flood risks can be found at the dnr.illinois.gov (Illinois Department of Natural Resources), fema.gov (FEMA), and ready.gov/flood (U.S. National public service). Landlords are required to disclose the above information pursuant to Section 25 of the Landlord and Tenant Act. A landlord's failure to comply with Section 25 of the Landlord and Tenant Act shall entitle the tenant to remedies as defined in that Section. Both Landlord and Tenant sign this disclosure.",
      cite: "765 ILCS 705/25(b)–(d)",
    },
    {
      id: "radon",
      title: "Disclosure of Information on Radon Hazards to Tenants",
      text:
        "Radon Warning Statement: Each tenant in this residence or dwelling unit is notified that the property may present exposure to levels of indoor radon gas that may place the occupants at risk of developing radon-induced lung cancer. Radon, a Class-A human carcinogen, is the leading cause of death in private homes and the leading cause of lung cancer in nonsmokers. The lessor of any residence is required to provide each tenant with any information on radon test results of the dwelling unit that present a radon hazard to the tenant. The Illinois Emergency Management Agency (IEMA) strongly recommends that ALL rental properties have a radon test performed and radon hazards mitigated if elevated levels are found in a dwelling unit or a routinely occupied area of a multiple family residence. Elevated radon concentrations can easily be reduced by a radon contractor. Lessor's Disclosure (Landlord initials each that applies): Lessor has no knowledge of elevated radon concentrations (or records or reports pertaining to elevated radon concentrations) in the dwelling unit. Radon concentrations (at or above the IEMA recommended Radon Action Level 4.0 pCi/L) are known to be present within the dwelling unit. Lessor has provided the tenant with copies of all available records and reports, if any, pertaining to radon concentrations within the dwelling unit. Tenant's Acknowledgment (Tenant initials each that applies): Tenant has received copies of all information listed above. Tenant has received the pamphlet \"Radon Guide for Tenants\". Certification of Accuracy: The parties have reviewed the information above and each party certifies, to the best of his or her knowledge, that the information he or she provided is true and accurate.",
      cite: "420 ILCS 46/26(a), (f)",
      condition: "Not required for dwelling units on the third story or higher above ground level",
    },
    {
      id: "shared_utilities",
      title: "Shared Utility Allocation Formula",
      text:
        "Tenant's proportionate share of master-metered utility service is calculated using the allocation formula attached to this Lease. The total charged to all tenants for a billing period will not exceed the amount the utility bills for the building, and Landlord will provide a copy of the utility bill for any billing period on request.",
      cite: "765 ILCS 740/5(a)",
      condition: "Only if Tenant pays a proportionate share of master-metered utility service",
    },
    {
      id: "rent_payment_methods",
      title: "Rent Payment Methods",
      text:
        "Landlord will not require Tenant to pay rent or other amounts by electronic funds transfer. If Landlord uses a third-party payment portal that charges a fee, Tenant may instead pay by paper check or cash delivered to Landlord or Landlord's business office, or by another means that carries no fee.",
      cite: "765 ILCS 705/3.5, 705/4",
    },
  ],

  fairHousing: {
    stateClasses: [
      "ancestry",
      "age (40 and over)",
      "marital status",
      "sexual orientation (including gender-related identity)",
      "military status",
      "unfavorable discharge from military service",
      "order of protection status",
      "pregnancy",
      "reproductive health decisions",
      "immigration status",
      "source of income",
      "arrest record",
    ],
    cite: "775 ILCS 5/1-103, 5/3-102, 5/3-106",
  },

  eviction: {
    rule:
      "Landlord may recover possession only by filing an eviction action in the circuit court under the Illinois Eviction Act and obtaining a court order enforced by the sheriff. Landlord will not use self-help, such as changing locks, removing Tenant's belongings, or shutting off utilities, to remove Tenant.",
    cite: "735 ILCS 5/9-102, 9-106",
  },

  habitability: {
    rule:
      "Landlord will keep the Premises fit for habitation and in compliance with applicable building and housing codes throughout the Lease. If a repair required by this Lease or by law costs no more than the lesser of $500 or one-half of the monthly rent and Landlord does not make it within 14 days after Tenant's written notice by certified or registered mail (or sooner in an emergency), Tenant may have it made by a licensed, insured tradesperson and deduct the paid bill from rent, unless Tenant caused the condition.",
    cite: "765 ILCS 742/5 (Residential Tenants' Right to Repair Act); Illinois implied warranty of habitability (case law)",
  },

  sources: [
    { cite: "765 ILCS 705/1, 3, 3.5, 4, 5, 10, 15, 16, 20, 25, 30, 35 (Landlord and Tenant Act)", url: ILCS(765, 705, "16") },
    { cite: "765 ILCS 705/25 (flood disclosure)", url: ILCS(765, 705, "25") },
    { cite: "765 ILCS 705/35 (fee transparency, eff. 1-1-27)", url: ILCS(765, 705, "35") },
    { cite: "765 ILCS 710/1, 1.1, 1.2, 2 (Security Deposit Return Act)", url: ILCS(765, 710, "1") },
    { cite: "765 ILCS 715/1–3 (Security Deposit Interest Act)", url: ILCS(765, 715, "1") },
    { cite: "765 ILCS 721/1–95 (Landlord Retaliation Act)", url: ILCS(765, 721, "5") },
    { cite: "765 ILCS 735 (Rental Property Utility Service Act)", url: ILCS(765, 735, "1") },
    { cite: "765 ILCS 740/5 (Tenant Utility Payment Disclosure Act)", url: ILCS(765, 740, "5") },
    { cite: "765 ILCS 742/1–30 (Residential Tenants' Right to Repair Act)", url: ILCS(765, 742, "5") },
    { cite: "765 ILCS 750/1–35 (Safe Homes Act)", url: ILCS(765, 750, "15") },
    { cite: "765 ILCS 752/1–99 (Summary of Rights for Safer Homes Act)", url: ILCS(765, 752, "20") },
    { cite: "735 ILCS 5/9-102, 9-106, 9-106.2, 9-106.3, 9-207, 9-209, 9-210, 9-211, 9-213.1, 9-218", url: ILCS(735, 5, "9-213.1") },
    { cite: "775 ILCS 5/1-103, 3-102, 3-102.1, 3-106 (Human Rights Act)", url: ILCS(775, 5, "3-102") },
    { cite: "420 ILCS 46/5, 15, 20, 26, 30, 35 (Radon Awareness Act)", url: ILCS(420, 46, "26") },
    { cite: "330 ILCS 63/10, 50 (Service Member Civil Relief Act)", url: ILCS(330, 63, "50") },
  ],

  reviewNotes: [
    "ACTION REQUIRED (product): The Summary of Rights for Safer Homes Act (765 ILCS 752, effective Jan. 1, 2026) requires the Illinois Department of Human Rights' published summary to be attached as the FIRST PAGE of every written residential lease (new and renewal), with each tenant's signature in the acknowledgment space at the bottom of each page. Missing proof creates a presumption of noncompliance; liability is the greater of actual damages (up to $2,000) or $100, plus attorney fees. The data file can only describe this; the builder/e-sign flow must actually insert the IDHR form as page 1 and collect per-page tenant signatures.",
    "Fee transparency (765 ILCS 705/35, effective Jan. 1, 2027 for leases entered after that date; owner-occupied buildings of 6 or fewer units exempt): all non-optional fees must appear on the first page of the lease or the tenant does not owe them; the lease must say whether utilities are included; application fees are capped at $50 (with a receipts exception), and fees for lease renewal, eviction notices, after-hours maintenance requests, routine maintenance, pest control not caused by the tenant, and move-in/move-out walk-throughs are banned. Not encoded because the effective date is after research date, but Keycove leases signed for 2027 starts are covered.",
    "Military (765 ILCS 705/16) is broader than the SCRA: any lease (signed on or after Jan. 1, 2013), including leases signed during service, and family members living with the servicemember may terminate. It covers only service members who are Illinois residents. Refusing a valid termination is a civil rights violation.",
    "Safe Homes Act is drafted as an affirmative defense to a suit for rent, not a notice-and-terminate procedure, and it is silent on co-tenants and on documentation for the 'credible imminent threat' route (the court decides by preponderance). The lease text states the statutory conditions; the attorney should confirm co-tenant treatment.",
    "Security Deposit Return Act 710/1 (as amended by P.A. 103-224, eff. 1-1-24) now reads 'a lessor of residential real property' with no unit-count threshold; older versions applied only to 5+ unit buildings. Bad-faith noncompliance = 2x the deposit plus fees. Deposit interest (765 ILCS 715) applies only to properties with 25+ units, so interestRequired is false statewide.",
    "Radon (420 ILCS 46/26): § 15 says the Act applies to leased properties 'to the extent specified in Section 25', but § 25 was repealed by P.A. 103-298; § 26 itself says the disclosure 'shall be provided to each tenant'. The definition of 'residential real property' (1–4 units) is used for sales; § 26 uses 'dwelling unit'. Encoded as applying to every dwelling unit below the third story (per the § 20(9) exclusion). The landlord must also hand over the IEMA 'Radon Guide for Tenants' pamphlet. Confirm scope.",
    "Flood disclosure (765 ILCS 705/25) must be signed by both parties and included in the written lease or renewal; the statutory form uses checkboxes and counts, which need input fields in the builder. Lower-level (garden/basement/first-floor) units must disclose flooding in the last 10 years.",
    "Self-help eviction: no single statewide statute expressly bans lockouts outside the Eviction Act's exclusive-remedy structure; Chicago RLTO § 5-12-160 and Cook County RTLO ban lockouts expressly. Statewide prohibition rests on case law (not verified from a primary source).",
    "Habitability: Illinois has no general statewide habitability statute; the implied warranty of habitability is case law (leading case not verified from a primary source). 765 ILCS 742 repair-and-deduct does not apply to owner-occupied buildings with 6 or fewer units, condos, co-ops, or public housing; the lease text states the rule generally, so the attorney should decide whether to condition it.",
    "Landlord Retaliation Act (765 ILCS 721, eff. 1-1-25) lets a tenant subjected to retaliation terminate the lease and recover deposit, interest, and prepaid rent plus the greater of 2 months' rent or 2x damages; it is a court remedy and not encoded as a termination right.",
    "No statewide late-fee cap, grace period, entry-notice period, deposit cap, or move-in checklist requirement verified. 735 ILCS 5/9-218 requires 100+ unit properties with an on-site office to accept rent there without a fee.",
    "Local law (significant, not researched from primary text here): the Chicago Residential Landlord and Tenant Ordinance and the Cook County Residential Tenant and Landlord Ordinance impose their own deposit-handling and interest rules, entry-notice periods, late-fee limits, required summary attachments, and lockout bans that are stricter than state law. Evanston, Oak Park, Mount Prospect, Urbana, and Champaign also have landlord-tenant ordinances. A Chicago or Cook County property needs a local addendum.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
