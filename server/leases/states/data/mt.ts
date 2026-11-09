import type { StateLawProfile } from "../types";

const MCA = (title: string, chapter: string, part: string, section: string) =>
  `https://mca.legmt.gov/bills/mca/title_${title}/chapter_${chapter}/part_${part}/section_${section}/${title}-${chapter}-${part}-${section}.html`;

export const MT: StateLawProfile = {
  code: "MT",
  name: "Montana",
  framework:
    "Montana Residential Landlord and Tenant Act of 1977, Mont. Code Ann. §§ 70-24-101 et seq., read together with Residential Tenants' Security Deposits, §§ 70-25-101 et seq.",

  deposit: {
    maxMonths: null,
    capRule:
      "Montana sets no maximum amount for a security deposit. Any fee or charge for cleaning and damages, however labeled, and any deposit Tenant must provide or maintain, is presumed to be a security deposit.",
    capCite: null,
    returnDays: 30,
    returnRule:
      "Within 30 days after the tenancy terminates or Landlord accepts Tenant's surrender of the Property, whichever occurs first, Landlord will give Tenant a written list of any rent due and any damage and cleaning charges Landlord claims, together with payment of the balance of the deposit. If, after inspection, there is no damage, no cleaning is required, no rent is unpaid, and Tenant shows that no utilities are unpaid, Landlord will return the full deposit within 10 days. Landlord may deduct only damage caused by Tenant; unpaid rent, late charges, utilities, penalties due under this Lease, and other money owed; and actual cleaning expenses, including a reasonable charge for Landlord's labor. Before deducting cleaning charges, Landlord will give Tenant written notice of the cleaning not done and the cleaning needed, and Tenant will have 24 hours after delivery of that notice to complete it, unless Tenant vacated without notice. At either party's request, the Property may be inspected within one week before the tenancy ends. Landlord will deliver the refund by electronic funds transfer, cash, check, or other form, or by mail to the new address Tenant provides (or Tenant's last-known address). If Landlord fails to provide the written list, Landlord forfeits the right to withhold any part of the deposit for damage or cleaning.",
    returnCite: "Mont. Code Ann. §§ 70-25-201, 70-25-202, 70-25-203",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection:
      "Because Landlord requires a security deposit, Landlord will give Tenant, when this Lease is signed, a separate written statement of the present condition of the Property, signed by Landlord or Landlord's agent, describing the condition known to Landlord or that reasonable inspection would reveal, and stating if the Property has never been rented before. At Tenant's written request, Landlord will also give Tenant a copy of the list of damage and cleaning charges provided to the immediately preceding tenant. If Landlord does not provide the statement, Landlord may not recover for damage or cleaning unless it proves by clear and convincing evidence that the damage occurred during this tenancy and was caused by Tenant or Tenant's family, licensees, or invitees.",
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
      "Either Landlord or Tenant may terminate a month-to-month tenancy at any time by giving the other at least 30 days' written notice before the termination date designated in the notice; the termination date need not fall on a rent due date, and rent is apportioned day to day. A week-to-week tenancy requires at least 7 days' written notice. If this Lease sets no default extension period and neither party gives the other 30 days' written notice to terminate before the original termination date, the tenancy continues month to month.",
    monthToMonthCite: "Mont. Code Ann. §§ 70-24-441, 70-24-205",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If rent is unpaid when due, Landlord may give Tenant written notice of nonpayment stating that Landlord will terminate this Lease if the rent is not paid within 3 days after the notice. If Tenant does not pay within that period, Landlord may terminate this Lease and Tenant must vacate. A notice sent by certified mail or with a certificate of mailing is treated as served 3 days after the date of mailing.",
    nonpaymentCite: "Mont. Code Ann. §§ 70-24-422(2), 70-24-108",
    entryHours: 24,
    entryRule:
      "Tenant will not unreasonably withhold consent for Landlord or Landlord's agent to enter the Property to inspect it; make necessary or agreed repairs, decorations, alterations, or improvements; supply necessary or agreed services; or show it to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or where it is impracticable, Landlord will give Tenant at least 24 hours' notice of the intent to enter and will enter only at reasonable times; conspicuously posting the notice on the main entry door is sufficient notice. Landlord may enter without consent in an emergency. Otherwise Landlord has no right of access except under a court order, to make repairs Tenant failed to make within 14 days after written notice, during Tenant's absence of more than 7 days, or after Tenant has abandoned or surrendered the Property. Landlord will not abuse the right of access or use it to harass Tenant. Tenant will not remove, replace, or add a lock without Landlord's written permission and will give Landlord a key to any lock Tenant installs.",
    entryCite: "Mont. Code Ann. §§ 70-24-312, 70-24-425, 70-24-426(2)",
  },

  earlyTermination: {
    military: {
      label: "Montana National Guard permanent change of duty station (state law)",
      cite: "Mont. Code Ann. §§ 10-1-905, 10-1-902",
      eligible:
        "A Tenant who is a member of the Montana Army or Air National Guard serving on active duty (at least 14 consecutive days of full-time state military duty as defined in Mont. Code Ann. § 10-1-1003, or full-time National Guard duty as defined in 32 U.S.C. § 101) may terminate this Lease when ordered to a permanent duty station that is more than 60 miles from Tenant's current residence.",
      notice:
        "Tenant delivers written notice of termination to Landlord by hand delivery, U.S. mail, or electronic means. Termination takes effect 45 days after the notice is delivered.",
      documentation: "The notice must be accompanied by a copy of Tenant's military orders.",
      liability:
        "Tenant remains responsible for rent until the termination takes effect, but is not liable for any early termination fee or other damages arising from the early termination.",
    },
    domesticViolence: null,
    other: [
      {
        label: "Landlord's failure to maintain the Property",
        cite: "Mont. Code Ann. § 70-24-406(1)(a)",
        eligible:
          "If Landlord fails to comply with its maintenance duties under Mont. Code Ann. § 70-24-303 in a way that affects health and safety, Tenant may terminate this Lease, unless the condition was caused by Tenant, a member of Tenant's family, or another person on the Property with Tenant's consent.",
        notice:
          "Tenant delivers written notice specifying the breach and stating that this Lease will terminate on a date at least 30 days after Landlord receives the notice if the breach is not remedied within 14 days; if Landlord adequately remedies the breach before that date, the Lease does not terminate. In an emergency, Tenant may terminate if Landlord fails to remedy the situation within 3 working days after written notice of the situation and of Tenant's intent to terminate. If substantially the same breach recurs within 6 months after a prior notice, Tenant may terminate on at least 14 days' written notice specifying the breach and the termination date.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee, and Landlord will return all security recoverable under Mont. Code Ann. Title 70, chapter 25. Tenant may also recover actual damages.",
      },
      {
        label: "Fire or casualty damage",
        cite: "Mont. Code Ann. § 70-24-409",
        eligible:
          "If the Property is damaged or destroyed by fire or casualty to an extent that substantially impairs enjoyment of the dwelling unit, and the damage was not caused by the purposeful or negligent act of Tenant or Tenant's family or guests, Tenant may immediately vacate and terminate this Lease.",
        notice:
          "Tenant notifies Landlord in writing within 14 days after vacating of Tenant's intent to terminate; the Lease terminates as of the date Tenant vacated.",
        documentation: "",
        liability:
          "Rent is accounted for as of the date of the fire or casualty. Landlord will return all recoverable security and all prepaid rent.",
      },
      {
        label: "Unlawful or harassing entry by Landlord",
        cite: "Mont. Code Ann. § 70-24-410",
        eligible:
          "If Landlord makes an unlawful entry, makes a lawful entry in an unreasonable manner, or makes repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord written notice of termination.",
        documentation: "",
        liability: "Tenant owes no early termination fee and may recover actual damages.",
      },
      {
        label: "Unlawful ouster or interruption of essential services",
        cite: "Mont. Code Ann. § 70-24-411",
        eligible:
          "If Landlord unlawfully removes or excludes Tenant from the Property, or purposefully interrupts heat, running water, hot water, electricity, gas, or other essential services, Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord written notice of termination.",
        documentation: "",
        liability:
          "Landlord will return all recoverable security and all prepaid rent, and Tenant may recover the greater of three months' periodic rent or treble damages.",
      },
      {
        label: "Failure to deliver possession",
        cite: "Mont. Code Ann. § 70-24-405",
        eligible:
          "If Landlord fails to deliver possession of the dwelling unit at the start of this Lease, rent abates until possession is delivered and Tenant may terminate this Lease.",
        notice: "Tenant gives Landlord at least 5 days' written notice of termination.",
        documentation: "",
        liability: "Landlord will return all prepaid rent and security.",
      },
    ],
    feeCap: {
      maxMonthsRent: 1,
      rule:
        "If either party terminates this Lease without cause before the end of its term, the other party's monetary damages for the early termination may not exceed one month's rent or any lower amount stated in this Lease. In addition, Landlord must make reasonable efforts to re-rent the Property at a fair rental and is entitled to rent from Tenant only up to the date a new tenancy begins or the date this Lease term expires, whichever comes first. Treble damages may not be recovered for a tenant's early termination.",
      cite: "Mont. Code Ann. §§ 70-24-201(2)(f), 70-24-426(3), 70-24-422(6)",
    },
    mitigation: {
      basis: "statute",
      cite: "Mont. Code Ann. §§ 70-24-426(3), 70-24-201(2)(f)",
      rule:
        "If Tenant abandons the Property, Landlord will make reasonable efforts to re-rent it at a fair rental. If Landlord re-rents it for a term beginning before this Lease would have expired, this Lease terminates on the date the new tenancy begins, and Tenant owes rent only up to that date.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Manager and Owner Identification",
      text: "The person authorized to manage the Property, and the owner of the Property or the person authorized to act for the owner for service of process and for receiving notices and demands, is Landlord at the name and address stated in this Lease unless Landlord designates another person in writing. Landlord will keep this information current and in writing.",
      cite: "Mont. Code Ann. § 70-24-301",
    },
    {
      id: "smoke_co_detectors",
      title: "Smoke and Carbon Monoxide Detectors",
      text: "Landlord has installed an approved carbon monoxide detector and an approved smoke detector in the dwelling unit and has verified at the start of this Lease that both are in good working order. Tenant will maintain both detectors in good working order during the tenancy. Landlord is not liable for damages caused by the failure of either detector.",
      cite: "Mont. Code Ann. § 70-24-303(1)(g), (5)",
    },
    {
      id: "mold",
      title: "Mold Disclosure",
      text: "MOLD DISCLOSURE: There are many types of mold. Inhabitable properties are not, and cannot be, constructed to exclude mold. Moisture is one of the most significant factors contributing to mold growth. Information about controlling mold growth may be available from your county extension agent or health department. Certain strains of mold may cause damage to property and may adversely affect the health of susceptible persons, including allergic reactions that may include skin, eye, nose, and throat irritation. Certain strains of mold may cause infections, particularly in individuals with suppressed immune systems. Some experts contend that certain strains of mold may cause serious and even life-threatening diseases. However, experts do not agree about the nature and extent of the health problems caused by mold or about the level of mold exposure that may cause health problems. The Centers for Disease Control and Prevention is studying the link between mold and serious health conditions. The seller, landlord, seller's agent, buyer's agent, or property manager cannot and does not represent or warrant the absence of mold. It is the buyer's or tenant's obligation to determine whether a mold problem is present. To do so, the buyer or tenant should hire a qualified inspector and make any contract to purchase, rent, or lease contingent upon the results of that inspection. A seller, landlord, seller's agent, buyer's agent, or property manager who provides this mold disclosure statement, provides for the disclosure of any prior testing and any subsequent mitigation or treatment for mold, and discloses any knowledge of mold is not liable in any action based on the presence of or propensity for mold in a building that is subject to any contract to purchase, rent, or lease. Landlord further discloses that, if Landlord knows mold is present in the building or knows the building has been tested for mold, Landlord has disclosed that fact and provided any available test results and evidence of mitigation or treatment to Tenant before or upon signing this Lease. Tenant acknowledges receipt of this disclosure by signing this Lease.",
      cite: "Mont. Code Ann. § 70-16-703",
    },
    {
      id: "email_notice",
      title: "Notice by Email",
      text: "Tenant is not required to provide an email address as a condition of this Lease. Either party may voluntarily elect to receive notices by email at an address that party provides in this Lease. Notice by email is complete when the sender receives a read receipt or a reply that is not automatically generated.",
      cite: "Mont. Code Ann. §§ 70-24-202(4), 70-24-108(1)(c)",
    },
  ],

  fairHousing: {
    stateClasses: ["marital status", "creed", "age"],
    cite: "Mont. Code Ann. § 49-2-305",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only by terminating this Lease as Montana law allows and obtaining a judgment and writ of possession in an action for possession under Mont. Code Ann. § 70-24-427, except after abandonment or surrender. Landlord will not recover possession by self-help, including by purposefully interrupting heat, running water, hot water, electricity, gas, or other essential services.",
    cite: "Mont. Code Ann. §§ 70-24-427, 70-24-428, 70-24-411",
  },

  habitability: {
    rule:
      "Landlord will comply with applicable building and housing codes materially affecting health and safety in effect at the time of original construction (for units completed after July 1, 1977); make repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition, except where Tenant is responsible under Mont. Code Ann. § 70-24-321; keep common areas clean and safe; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies or is required to supply; unless this Lease provides otherwise, provide waste receptacles and arrange for removal; supply running water, reasonable hot water at all times, and reasonable heat between October 1 and May 1, except where heat or hot water is generated by an installation in Tenant's exclusive control; and install approved smoke and carbon monoxide detectors.",
    cite: "Mont. Code Ann. § 70-24-303",
  },

  sources: [
    { cite: "Mont. Code Ann. §§ 70-24-101 to 70-24-442 (entire chapter 24, 2025 MCA, read in full)", url: "https://mca.legmt.gov/bills/mca/title_0700/chapter_0240/parts_index.html" },
    { cite: "Mont. Code Ann. § 70-24-201", url: MCA("0700", "0240", "0020", "0010") },
    { cite: "Mont. Code Ann. § 70-24-312", url: MCA("0700", "0240", "0030", "0120") },
    { cite: "Mont. Code Ann. § 70-24-422", url: MCA("0700", "0240", "0040", "0220") },
    { cite: "Mont. Code Ann. § 70-24-426", url: MCA("0700", "0240", "0040", "0260") },
    { cite: "Mont. Code Ann. § 70-24-441", url: MCA("0700", "0240", "0040", "0410") },
    { cite: "Mont. Code Ann. §§ 70-25-101 to 70-25-206 (entire chapter 25)", url: "https://mca.legmt.gov/bills/mca/title_0700/chapter_0250/parts_index.html" },
    { cite: "Mont. Code Ann. §§ 70-16-701 to 70-16-703 (Montana Mold Disclosure Act)", url: MCA("0700", "0160", "0070", "0030") },
    { cite: "Mont. Code Ann. § 49-2-305", url: MCA("0490", "0020", "0030", "0050") },
    { cite: "Mont. Code Ann. §§ 10-1-901 to 10-1-905 (Montana National Guard Civil Relief Act)", url: MCA("0100", "0010", "0090", "0050") },
  ],

  reviewNotes: [
    "SURPRISING — early termination fee cap: § 70-24-201(2)(f) (2025 MCA) limits the aggrieved party's monetary damages for a no-cause early termination to one month's rent or a lower agreed amount, while ALSO entitling the landlord to rent until re-letting or term expiration (with § 70-24-426(3) mitigation). Subsection (2) is prefaced 'Unless the rental agreement provides otherwise,' but (f) itself says the agreed amount 'may not exceed 1 month's rent.' We read this as a hard one-month cap on any early-termination fee/liquidated damages, layered on top of mitigated rent. Attorney should confirm the interplay and that our lease early-termination fee never exceeds one month's rent in Montana.",
    "Military: § 10-1-905 (enacted 2023) covers only Montana Army/Air National Guard members on 'active duty' as defined in § 10-1-902 (14+ consecutive days of full-time state military duty or full-time Title 32 Guard duty) who receive orders to a permanent duty station more than 60 miles away. Effective 45 days after notice; no early termination fees or other damages. Federal-status servicemembers rely on SCRA (handled by the generator).",
    "Domestic violence: Montana has NO statutory DV/sexual assault/stalking lease-termination right — confirmed by reading every section of the 2025 MCA chapter 24 (there is no § 70-24-210 despite citations on some websites). § 70-24-111 only addresses notices of no contact. Consider whether Keycove wants a voluntary DV release clause.",
    "Late fees: no statutory cap or grace period. 'Rent' is defined to include late fees and other agreed charges (§ 70-24-103(14)), so late fees can be part of the 3-day nonpayment notice and deposit deductions (§ 70-25-201(1)). § 70-24-201(4) bars fees based on rent payment type except to recoup an electronic bank fee.",
    "Deposit: 70-25-202(2) suspends the 30-day/10-day return rule if the lease was terminated under § 70-24-427 and the landlord has a pending court claim. Cleaning deductions require a prior written notice and a 24-hour cure window (§ 70-25-201(3)). Waivers of chapter 25 are void (§ 70-25-103).",
    "Prohibited provisions: a landlord who knowingly uses a lease with provisions barred by § 70-24-202 (waivers, confession of judgment, exculpation, mandatory email) owes up to 3 months' rent plus actual damages (§ 70-24-403). The builder must not require an email address.",
    "Fair housing: owner-occupied single-family homes renting no more than three sleeping rooms are exempt from § 49-2-305(1) — relevant to co-living — but the federal FHA advertising ban and local ordinances still apply. Missoula, Bozeman, Helena, Butte-Silver Bow, and Whitefish have local nondiscrimination ordinances that may add sexual orientation and gender identity — not verified here.",
    "Mold disclosure: the § 70-16-703 statement is optional but gives the landlord liability protection only if provided verbatim, acknowledged by the tenant's signature, and paired with disclosure of known mold and prior testing; disclosure of known mold/testing is itself mandatory under § 70-16-703(2).",
    "Short notice periods for other breaches (§ 70-24-422): 3 days for unauthorized pets, unauthorized occupants, damage, dangerous activity, or verbal abuse of the landlord; 14 days for other curable breaches; 5 days for a repeat within 6 months.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
