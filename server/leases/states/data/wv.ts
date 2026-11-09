import type { StateLawProfile } from "../types";

const WVCODE = (s: string) => `https://code.wvlegislature.gov/${s}/`;

export const WV: StateLawProfile = {
  code: "WV",
  name: "West Virginia",
  framework:
    "W. Va. Code Chapter 37, Article 6 (Landlord and Tenant) and Article 6A (Security Deposits), and Chapter 55, Article 3A (summary relief for wrongful occupation of residential rental property)",

  deposit: {
    maxMonths: null,
    capRule:
      "West Virginia law sets no maximum amount for a security deposit. A pet fee or application fee is not part of the security deposit, and is nonrefundable only if the parties expressly agree in writing that it is nonrefundable.",
    capCite: null,
    returnDays: 45,
    returnRule:
      "After the tenancy ends, Landlord shall deliver to Tenant the security deposit, minus any lawful deductions, together with a written itemization of the deductions, within 60 days after the tenancy ends or within 45 days after a new tenant occupies the Property, whichever is shorter. If damage exceeds the deposit and requires a third-party contractor, Landlord shall notify Tenant in writing within that period and then has an additional 15 days to provide the itemization and repair costs. Landlord may apply the deposit only to rent due (including reasonable late charges stated in this Lease), damages from Tenant's noncompliance with this Lease less reasonable wear and tear, unpaid utilities that are Tenant's obligation and that Landlord paid, reasonable costs of removing and storing Tenant's property, and other damages or charges provided in this Lease. Landlord may deliver the deposit and notices in person or by mail to Tenant's last known or forwarding address; Tenant is responsible for giving Landlord an accurate address. If mail is returned, Landlord holds the deposit for six months for pickup at Landlord's place of business within 72 hours after Tenant's written request.",
    returnCite: "W. Va. Code §§ 37-6A-1(7), 37-6A-2",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection: "",
  },

  lateFee: {
    graceDays: null,
    capType: "reasonable",
    capRule:
      "West Virginia law sets no numeric limit on late fees. Any late charge must be a reasonable charge for late payment stated in this Lease.",
    cite: "W. Va. Code § 37-6A-2(b)(1)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either Landlord or Tenant may end a month-to-month tenancy by written notice given at least one full rental period (one month) before the end of a rental period. A year-to-year tenancy requires written notice at least three months before the end of the year. No notice is required to end a lease that is set to end on a specific date.",
    monthToMonthCite: "W. Va. Code § 37-6-5",
    nonpaymentDays: null,
    nonpaymentRule:
      "West Virginia does not require a pay-or-quit notice before filing. If Tenant is in arrears in rent, has breached a covenant of this Lease, or has deliberately or negligently damaged the Property, Landlord may file a verified petition for summary relief in the magistrate court or circuit court of the county where the Property is located. The court schedules a hearing 5 to 10 judicial days after filing, and Tenant may file a written defense within five days after receiving notice of the hearing.",
    nonpaymentCite: "W. Va. Code §§ 55-3A-1 to 55-3A-3",
    entryHours: null,
    entryRule:
      "West Virginia has no statute setting an entry-notice period. Landlord will give Tenant at least 24 hours' notice before entering for inspections, repairs, or showings, and will enter only at reasonable times, except in an emergency or when Tenant consents at the time of entry.",
    entryCite: null,
  },

  earlyTermination: {
    military: {
      label: "National Guard on State active duty (West Virginia Servicemembers Civil Relief Act)",
      cite: "W. Va. Code § 15-1F-11",
      eligible:
        "A member of the West Virginia National Guard called to State active duty by the Governor for 30 days or more has the same lease termination rights as a servicemember on federal active duty under the federal Servicemembers Civil Relief Act (described above).",
      notice:
        "Tenant gives written notice of termination as described for the federal Servicemembers Civil Relief Act above.",
      documentation:
        "Tenant provides a copy of the Governor's State active duty orders, or equivalent documentation, as described for the federal Servicemembers Civil Relief Act above.",
      liability:
        "Tenant owes rent only as allowed under the federal Servicemembers Civil Relief Act (rent prorated to the effective termination date and no early termination fee).",
    },
    domesticViolence: null,
    other: [
      {
        label: "Death of Tenant",
        cite: "W. Va. Code § 37-6-11(b)",
        eligible:
          "If Tenant dies, Tenant's heir, personal representative, devisee, or assignee may terminate this Lease before it expires.",
        notice:
          "Written notice is hand-delivered or mailed to Landlord, and termination takes effect on the last day of the calendar month that is two months after the date the notice is hand-delivered or postmarked.",
        documentation: "",
        liability:
          "Tenant's estate remains liable for rent and other sums owed before or during the two-month notice period and for the cost of restoring the Property to its condition at the start of the tenancy, ordinary wear and tear excepted, but owes no early termination fee. This right cannot be waived, and any lease term requiring a longer notice period is void.",
      },
      {
        label: "Buildings destroyed by fire or other cause",
        cite: "W. Va. Code § 37-6-28",
        eligible:
          "If buildings on the Property are destroyed in whole or in part by fire or otherwise, without fault or negligence of Tenant, rent is reasonably reduced until they are replaced, and if Landlord does not rebuild or replace them as soon as reasonably possible, Tenant may surrender possession after that reasonable time.",
        notice: "Tenant surrenders possession of the Property to Landlord.",
        documentation: "",
        liability:
          "Tenant is relieved of all further liability for rent after the date of surrender and owes no early termination fee.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "unclear",
      cite: null,
      rule:
        "If Tenant leaves early without using the early termination option, Landlord will make reasonable efforts to re-rent the Property, and rent received from a replacement tenant is credited against what Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "nonrefundable_fees",
      title: "Nonrefundable Pet and Application Fees",
      text:
        "Any pet fee or application fee charged under this Lease is nonrefundable only if this Lease or another signed writing expressly says it is nonrefundable. Otherwise it is treated as a refundable security deposit.",
      cite: "W. Va. Code § 37-6A-1(14)",
      condition: "Only if Landlord charges a pet fee or application fee",
    },
  ],

  fairHousing: {
    stateClasses: ["ancestry", "blindness"],
    cite: "W. Va. Code § 16B-18-5 (West Virginia Fair Housing Act)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a court proceeding, such as a petition for summary relief in the magistrate or circuit court under W. Va. Code § 55-3A-1 or an action for unlawful detainer, and a court order carried out by the sheriff. Landlord will not lock Tenant out, shut off utilities, or remove Tenant's belongings without a court order, except as the law allows for abandoned property.",
    cite: "W. Va. Code §§ 55-3A-1, 55-3A-3, 37-6-19",
  },

  habitability: {
    rule:
      "Landlord shall deliver the Property in a fit and habitable condition at the start of the tenancy and keep it that way; maintain it in compliance with applicable health, safety, fire, and housing codes (unless a failure is the fault of Tenant, a family member, or a guest); keep common areas of a multiple-unit building clean, safe, and in repair; make all repairs needed to keep the Property fit and habitable unless the repair was needed mainly because of a lack of reasonable care by Tenant, a family member, or a guest; keep electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies in good and safe working order; provide waste receptacles in a multiple-unit building; and supply running water, reasonable hot water at all times, and reasonable heat from October 1 through the last day of April, except where those are generated by an installation within Tenant's exclusive control. Landlord is not required to make repairs while Tenant is behind in rent.",
    cite: "W. Va. Code § 37-6-30",
  },

  sources: [
    { cite: "W. Va. Code § 37-6-5", url: WVCODE("37-6-5") },
    { cite: "W. Va. Code § 37-6-6", url: WVCODE("37-6-6") },
    { cite: "W. Va. Code § 37-6-7", url: WVCODE("37-6-7") },
    { cite: "W. Va. Code § 37-6-9", url: WVCODE("37-6-9") },
    { cite: "W. Va. Code § 37-6-11", url: WVCODE("37-6-11") },
    { cite: "W. Va. Code § 37-6-19", url: WVCODE("37-6-19") },
    { cite: "W. Va. Code § 37-6-28", url: WVCODE("37-6-28") },
    { cite: "W. Va. Code § 37-6-30", url: WVCODE("37-6-30") },
    { cite: "W. Va. Code § 37-6-31", url: WVCODE("37-6-31") },
    { cite: "W. Va. Code § 37-6A-1", url: WVCODE("37-6A-1") },
    { cite: "W. Va. Code § 37-6A-2", url: WVCODE("37-6A-2") },
    { cite: "W. Va. Code § 37-6A-3", url: WVCODE("37-6A-3") },
    { cite: "W. Va. Code § 37-6A-4", url: WVCODE("37-6A-4") },
    { cite: "W. Va. Code § 37-6A-5", url: WVCODE("37-6A-5") },
    { cite: "W. Va. Code § 37-6A-6", url: WVCODE("37-6A-6") },
    { cite: "W. Va. Code § 55-3A-1", url: WVCODE("55-3A-1") },
    { cite: "W. Va. Code § 55-3A-2", url: WVCODE("55-3A-2") },
    { cite: "W. Va. Code § 55-3A-3", url: WVCODE("55-3A-3") },
    { cite: "W. Va. Code § 15-1F-11", url: WVCODE("15-1F-11") },
    { cite: "W. Va. Code § 16B-18-5", url: WVCODE("16B-18-5") },
    { cite: "W. Va. Code § 16B-18-3 (definitions of disability, familial status)", url: WVCODE("16B-18-3") },
    { cite: "W. Va. Code § 5-11A-5 (repealed 2024; checked for current location)", url: WVCODE("5-11A-5") },
    { cite: "2024 W. Va. Acts, Enr. Com. Sub. for S.B. 300 (recodifying Human Rights Act and Fair Housing Act into Chapter 16B)", url: "https://code.wvlegislature.gov/signed_bills/2024/2024-RS-SB300-SUB1%20ENR_signed.pdf" },
  ],

  reviewNotes: [
    "No West Virginia statute gives domestic violence, sexual assault, or stalking victims a right to terminate a residential lease. Checked: no W. Va. Code Article 37-6B exists on the official code site; a proposed Article 6B (2024 HB 5333) was introduced but not enacted, and a 2026 bill (HB 5334) was introduced — its status was not confirmed. domesticViolence = null. Re-check after each session.",
    "Military: W. Va. Code § 15-1F-11 extends federal SCRA protections (including 50 U.S.C. § 3955 lease termination) to West Virginia National Guard members called to State active duty by the Governor for 30 days or more. It cites the old SCRA codification (50 U.S.C. App. § 501 et seq.). Documentation/notice mechanics are not specified in the state statute; I mirrored SCRA. Applies only to WV Guard, not other states' Guard members.",
    "Mitigation: no West Virginia statute imposes a duty to mitigate. § 37-6-7 lets a landlord, at its election, re-let after abandonment with the tenant liable for the difference — permissive, not a duty. I did not locate a controlling West Virginia Supreme Court of Appeals decision in a primary source. basis = 'unclear'; the lease text voluntarily commits Landlord to reasonable re-letting efforts and crediting replacement rent.",
    "Deposit return: 'notice period' = 60 days after termination or 45 days after a subsequent tenant occupies, whichever is SHORTER (§ 37-6A-1(7)). returnDays is set to 45 as the conservative fixed number that always satisfies the rule; the returnRule states the actual statutory test. +15 days for itemization only where damages exceed the deposit and need a third-party contractor, with notice given within the period. Willful/bad-faith noncompliance: deposit plus 1.5x the amount wrongfully withheld (§ 37-6A-5). No deposit cap, no holding/escrow, no interest, no move-in checklist statute.",
    "Late fees: no statute sets a cap or grace period; § 37-6A-2(b)(1) refers only to 'reasonable charges for late payment of rent specified in the rental agreement.' capType = 'reasonable'.",
    "Month-to-month notice: § 37-6-5 requires notice 'for one full period before the end of any period' (or 3 months for year-to-year) and expressly yields to a special agreement fixing a different notice period. I used one month. A 2026 bill (HB 4570) touching § 37-6-5 appears in bill history but not in signed bills; text read on 2026-11-08 is unchanged.",
    "Self-help: I found no West Virginia statute expressly prohibiting self-help eviction in the residential context; the lease commits Landlord to court process only. Distress for rent still exists in statute (§ 37-6-9; §§ 37-6-12 to 37-6-17 by section heading only, not read) — the lease does not authorize it; attorney may want an express waiver of distress by Landlord.",
    "Habitability: § 37-6-30 is statutory; note subsection (c) relieves the landlord of the repair duty while the tenant is in arrears — I included that sentence because it is the statutory rule, but attorney may prefer to omit it from tenant-facing text.",
    "Fair housing: The West Virginia Fair Housing Act (former W. Va. Code § 5-11A-1 et seq.) and Human Rights Act (former § 5-11-1 et seq.) were repealed and recodified in Chapter 16B by 2024 S.B. 300 (in effect from passage, Feb. 8, 2024). Current housing provision: § 16B-18-5 (state classes beyond federal: ancestry and blindness). Local human rights ordinances in some cities (e.g., Charleston, Morgantown, Huntington) add sexual orientation and gender identity — not verified here.",
    "No statewide required lease disclosures were found beyond the federal lead disclosure. § 37-6A-4 bars any clause waiving deposit-article rights. § 37-6-31 (squatters) is excluded from Article 6.",
    "Abandoned property procedures (§ 37-6-6: posted one-month notice when a tenant in arrears abandons; 30-day/60-day (active-duty) personal property notice) and post-judgment property handling (§ 55-3A-3(h)–(i)) are not encoded in the lease.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
