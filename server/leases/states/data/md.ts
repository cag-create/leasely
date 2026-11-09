import type { StateLawProfile } from "../types";

const MGA = (article: string, s: string) =>
  `https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=${article}&section=${s}&enactments=false`;

export const MD: StateLawProfile = {
  code: "MD",
  name: "Maryland",
  framework: "Maryland Code, Real Property Article, Title 8 (Landlord and Tenant), §§ 8-101 et seq.",

  deposit: {
    maxMonths: 1,
    capRule:
      "The security deposit may not exceed one month's rent per dwelling unit, regardless of the number of tenants. The only exception is a deposit of up to two months' rent where Tenant qualifies for utility assistance through the Department of Human Services, this Lease requires Tenant to pay for utility service directly to Landlord, and both parties agree in writing to the amount. Payment of last month's rent in advance counts as part of the security deposit. Landlord may not require more than the security deposit plus the first month's rent for Tenant to begin this Lease and move in.",
    capCite: "Md. Code, Real Prop. §§ 8-203(a)–(b), 8-208(d)(11)",
    returnDays: 45,
    returnRule:
      "Within 45 days after the tenancy ends, Landlord shall return the security deposit by first-class mail to Tenant's last known address, together with simple interest at the greater of 1.5% per year or the daily U.S. Treasury yield curve rate for one year as of the first business day of each year, less any damages rightfully withheld. Interest accrues monthly from the date the deposit was paid, is not compounded, is owed only on deposits of $50 or more held at least six months, and is not owed for any partial month. If any part of the deposit is withheld, Landlord shall send Tenant by first-class mail, within the same 45 days, a written list of the damages claimed with an itemized statement of the costs incurred and supporting documentation (or an estimate, followed by notice and the final invoice when repairs are completed and a refund within 30 days of any amount by which the estimate exceeded actual cost). The deposit may be withheld only for unpaid rent, damage due to breach of this Lease, or damage beyond ordinary wear and tear by Tenant, Tenant's family, agents, employees, guests, or invitees. The deposit is not liquidated damages.",
    returnCite: "Md. Code, Real Prop. § 8-203(e)–(k)",
    holdingRule:
      "Landlord shall give Tenant a written receipt for the security deposit, which is included in this Lease. Within 30 days after receiving it, Landlord shall deposit the security deposit in an interest-bearing account used only for security deposits at a Maryland branch of a federally insured financial institution doing business in Maryland, or hold it in insured certificates of deposit at such a branch or in securities issued by the federal government or the State of Maryland.",
    holdingCite: "Md. Code, Real Prop. §§ 8-203(c)–(d), 8-203.1",
    interestRequired: true,
    moveInInspection:
      "Tenant has the right to have the Property inspected by Landlord in Tenant's presence, and a written list made of damage existing at the start of the tenancy, if Tenant requests it by certified mail within 15 days after Tenant moves in. Tenant also has the right to be present at the move-out inspection if Tenant notifies Landlord by certified mail at least 15 days before moving of Tenant's intent to move, the moving date, and Tenant's new address; Landlord shall then notify Tenant by certified mail of the inspection date and time, which must be within five days before or after the moving date. If Landlord fails to follow this move-out inspection procedure, Landlord forfeits the right to withhold any part of the deposit for damages.",
  },

  lateFee: {
    graceDays: null,
    capType: "percent",
    capPercent: 5,
    capRule:
      "A late fee may not exceed 5% of the amount of rent due for the rental period for which payment was late. If rent is paid weekly, the late fee may not exceed $3 per week or a total of $12 per month.",
    cite: "Md. Code, Real Prop. § 8-208(d)(3)",
  },

  notice: {
    monthToMonthDays: 60,
    monthToMonthRule:
      "Landlord must give Tenant written notice at least 60 days before the end of a month-to-month tenancy, or at least 60 days before the end of a written lease term longer than one week, to end the tenancy (90 days for a year-to-year tenancy). Tenant may end a month-to-month tenancy by giving Landlord at least 30 days' written notice before the end of a rental period. Any rent increase requires written notice at least 90 days in advance for a tenancy longer than one month, or 60 days in advance for a month-to-month tenancy.",
    monthToMonthCite: "Md. Code, Real Prop. §§ 8-402(c), 8-209",
    nonpaymentDays: 10,
    nonpaymentRule:
      "Before filing a failure-to-pay-rent complaint in the District Court, Landlord must give Tenant written notice, on the form created by the Maryland Judiciary, of Landlord's intent to file if Tenant does not pay within 10 days after the notice is provided. The notice is sent by first-class mail with a certificate of mailing, affixed to the door, or, if Tenant elects, sent by email, text message, or tenant portal.",
    nonpaymentCite: "Md. Code, Real Prop. § 8-401(c)",
    entryHours: 24,
    entryRule:
      "Landlord may enter the Property to make repairs, maintenance, modifications, renovations, or improvements; to inspect; to show the Property to prospective or actual purchasers, mortgagees, tenants, or contractors; to protect the property and the safety of occupants; to complete work ordered by a government agency; or to respond to Tenant's written request. Except in an emergency, Landlord shall give Tenant written notice at least 24 hours before entering, stating the date, approximate time, and specific purpose of entry, and shall enter only between 7:00 a.m. and 7:00 p.m., Monday through Saturday, unless Tenant agrees in writing to another time. Notice may be delivered by first-class mail with a certificate of mailing (if mailed at least 24 hours before entry), by paper notice affixed to the door, or, if Tenant elects, by email, text message, or tenant portal. Tenant may agree in writing to allow entry on less than 24 hours' notice.",
    entryCite: "Md. Code, Real Prop. § 8-221",
  },

  earlyTermination: {
    military: {
      label: "Military change of assignment (Maryland law)",
      cite: "Md. Code, Real Prop. § 8-212.1; Md. Code, State Gov't § 9-901",
      eligible:
        "If Tenant (or Tenant's spouse) signed this Lease while Tenant was a member of the uniformed services or a reserve component, and Tenant then receives a change of assignment, before or after moving in, Tenant may end liability under this Lease. A change of assignment includes permanent change of station orders, temporary duty orders for more than 90 days, orders to move into quarters on a military installation, and release from active duty (including retirement, separation or discharge under honorable conditions, and demobilization of a reserve component member who served on active duty orders for at least 180 consecutive days).",
      notice: "Tenant gives Landlord written notice of the change of assignment.",
      documentation: "The notice must include proof of the change of assignment, such as a copy of the orders.",
      liability:
        "Tenant's liability for rent is limited to rent and lawful charges already due plus 30 days' rent after Landlord receives the written notice and proof, and the cost of repairing damage to the Property caused by Tenant. Tenant does not owe the early termination fee.",
    },
    domesticViolence: {
      label: "Victims of abuse (domestic violence, sexual offenses, stalking)",
      cite: "Md. Code, Real Prop. §§ 8-5A-01 to 8-5A-03, 8-5A-06; Md. Code, Fam. Law § 4-501(b)",
      eligible:
        "Tenant may terminate future liability under this Lease if Tenant or a legal occupant (an occupant living in the Property with Landlord's knowledge and permission) is a victim of abuse, which includes acts causing or threatening serious bodily harm, assault, rape or sexual offense, false imprisonment, stalking, and revenge porn.",
      notice:
        "Tenant gives Landlord written notice of intent to vacate, by first-class mail or hand delivery, stating the victim status of Tenant or the legal occupant. Tenant then has 30 days from the notice to vacate. If Tenant moves out sooner, Tenant must send Landlord a signed, notarized written notice by first-class mail or hand delivery stating that Tenant has vacated. If Tenant does not vacate within 30 days, Landlord may treat Tenant as holding over or treat the notice as withdrawn.",
      documentation:
        "The notice must include a copy of a final protective order, a copy of a final peace order based on an act of abuse, or a report by a qualified third party (a physician, psychologist, social worker or caseworker, or a domestic violence or sexual assault program advocate) that meets the statutory requirements, was signed within the preceding 60 days, is notarized, is signed by Tenant or the legal occupant under penalty of perjury, and has the alleged offender's name and physical description redacted.",
      liability:
        "Tenant owes rent only for the time between giving notice and moving out, up to a maximum of 30 days, and does not owe the early termination fee. After an early move-out with the notarized notice, Landlord shall inspect and give Tenant a written statement confirming the move-out and showing the rent owed or the overpayment to be refunded. A co-tenant who is the respondent in the protective or peace order remains liable under this Lease. Landlord will not disclose information Tenant provides under this right to anyone without Tenant's written consent unless required by law or court order.",
    },
    other: [
      {
        label: "Medical condition requiring a move",
        cite: "Md. Code, Real Prop. § 8-212.2",
        eligible:
          "Tenant may limit liability under this Lease if a named party or authorized occupant has a medical condition that substantially restricts mobility within or into and out of the Property, requires a move to a home, facility, or institution for a higher level of care, or is a mental disorder that makes continued living at the Property unfeasible or requires a higher level of care, and the condition is expected to last beyond the end of this Lease.",
        notice:
          "Before moving out, Tenant gives Landlord written notice of termination stating the date by which Tenant will vacate.",
        documentation:
          "Before moving out, Tenant also gives Landlord a written certification, in the form required by statute, signed by a Maryland-licensed physician or psychologist on letterhead or a printed prescription form.",
        liability:
          "Tenant's liability for rent may not exceed two months' rent after the date Tenant vacates, and Tenant does not owe the early termination fee. (This limit does not apply if this Lease's own early termination terms require one month's notice or less and impose no more than two months' rent after move-out.)",
      },
      {
        label: "Property made untenantable by fire or unavoidable accident",
        cite: "Md. Code, Real Prop. § 8-112",
        eligible:
          "If, for a lease term of seven years or less, the improvements on the Property become untenantable because of fire or unavoidable accident, the tenancy ends.",
        notice: "No advance notice period is required.",
        documentation: "",
        liability:
          "All liability for rent ends upon payment of rent prorated to the day of the fire or accident. Tenant does not owe the early termination fee.",
      },
      {
        label: "Lead paint risk reduction violation",
        cite: "Md. Code, Real Prop. § 8-215",
        eligible:
          "If the Property is an affected property under Maryland's lead poisoning prevention law and the owner fails to comply with the applicable lead risk reduction standard, the owner shall, on Tenant's written request, immediately release Tenant from this Lease.",
        notice:
          "Tenant makes a written request to the owner, including any risk reduction certification information provided by the Department of the Environment. The owner has three business days to provide a valid risk reduction or lead-free certificate or other statutory proof of compliance.",
        documentation: "",
        liability:
          "Tenant owes no early termination fee, and the owner shall pay Tenant's reasonable relocation expenses, up to $2,500, for a permanent move to a lead-free or risk-reduced dwelling.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "Md. Code, Real Prop. § 8-207",
      rule:
        "If Tenant moves out before the end of the term, Landlord has a duty to mitigate damages, although Landlord need not show or rent the Property in preference to other available units, and any rent Landlord receives for the Property during the rest of Tenant's term reduces what Tenant owes. This duty cannot be waived.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Landlord and Agent for Notices",
      text:
        "The name, address, and telephone number of Landlord, or of the person authorized to accept notice and service of process on Landlord's behalf, are stated in this Lease.",
      cite: "Md. Code, Real Prop. § 8-210(a)",
    },
    {
      id: "condition_of_premises",
      title: "Condition of the Property",
      text:
        "Landlord will make the Property available in a condition permitting habitation, with reasonable safety.",
      cite: "Md. Code, Real Prop. § 8-208(c)(1)",
    },
    {
      id: "utilities_and_repairs",
      title: "Heat, Gas, Electricity, Water, and Repairs",
      text:
        "The specific obligations of Landlord and Tenant as to heat, gas, electricity, and water are stated in the Utilities section of this Lease, and the obligations for repair of the Property are stated in the Maintenance and Repairs section. Any utility not listed as included in the rent is Tenant's responsibility.",
      cite: "Md. Code, Real Prop. § 8-208(c)(2)",
    },
    {
      id: "security_deposit_receipt",
      title: "Security Deposit Receipt and Tenant Rights",
      text:
        "Landlord acknowledges receipt of the security deposit stated in this Lease. Tenant has the right: (1) to have the Property inspected by Landlord in Tenant's presence for a written list of damage existing at move-in, if Tenant requests it by certified mail within 15 days after moving in; (2) to be present at the move-out inspection if Tenant notifies Landlord by certified mail at least 15 days before the intended move of the intent to move, the moving date, and Tenant's new address; (3) to have Landlord conduct that inspection within five days before or after the stated moving date; (4) to receive written notice from Landlord of the inspection date; (5) to receive, by first-class mail to Tenant's last known address within 45 days after the tenancy ends, a written list of charges against the deposit and the actual costs; and (6) to the return of any unused portion of the deposit, by first-class mail to Tenant's last known address, within 45 days after the tenancy ends. If Landlord fails to comply with the security deposit law, Landlord may be liable to Tenant for up to three times the amount withheld, plus reasonable attorney's fees. Landlord keeps a copy of this receipt for two years after the tenancy ends.",
      cite: "Md. Code, Real Prop. §§ 8-203(c), 8-203.1",
    },
    {
      id: "tenants_bill_of_rights",
      title: "Maryland Tenants' Bill of Rights",
      text:
        "A copy of the most current version of the Maryland Tenants' Bill of Rights published by the Office of Tenant and Landlord Affairs in the Department of Housing and Community Development is attached to and part of this Lease.",
      cite: "Md. Code, Real Prop. § 8-208(c)(4)",
    },
    {
      id: "mold",
      title: "Mold Information",
      text:
        "Landlord will give Tenant the mold pamphlet developed or used by the State under § 6-1702 of the Environment Article when this Lease is signed and on request, and asks Tenant to sign an acknowledgment of receipt. Landlord will perform a mold assessment within 15 days after receiving written notice of mold from Tenant or the local code agency and, if mold is found, remediate within 45 days after the assessment or, if that is not feasible, within a reasonable time.",
      cite: "Md. Code, Real Prop. § 8-220",
    },
    {
      id: "move_in_payment_limit",
      title: "Move-In Payment Limit",
      text:
        "Landlord will not require Tenant to pay more than the security deposit and the first month's rent in order to begin this Lease and move in.",
      cite: "Md. Code, Real Prop. § 8-208(d)(11)",
    },
    {
      id: "emergency_assistance",
      title: "Calling for Emergency Help",
      text:
        "Nothing in this Lease limits Tenant's ability to call law enforcement or emergency services, and Landlord will not penalize Tenant, or anyone else, solely for summoning law enforcement or emergency services.",
      cite: "Md. Code, Real Prop. §§ 8-208(d)(10), 8-208.1(a)(2)(iv)",
    },
  ],

  fairHousing: {
    stateClasses: ["marital status", "sexual orientation", "gender identity", "source of income", "military status"],
    cite: "Md. Code, State Gov't § 20-705",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through an action in the District Court for failure to pay rent, tenant holding over, or breach of lease, and a warrant of restitution executed by a sheriff or constable. Landlord will not lock Tenant out, interrupt heat, water, hot water, electricity, or gas, or otherwise take or threaten to take possession without that court process, unless Tenant has abandoned or surrendered the Property.",
    cite: "Md. Code, Real Prop. §§ 8-401, 8-402, 8-402.1, 8-216",
  },

  habitability: {
    rule:
      "Landlord warrants that the Property is fit for human habitation, meaning free from serious defects or conditions that are, or if not promptly corrected will be, a fire hazard or a serious and substantial threat to the life, health, or safety of occupants, both at the start of and throughout the tenancy. Landlord shall repair dangerous conditions such as lack of heat, light, electricity, or hot or cold running water (unless caused by Tenant's failure to pay a utility Tenant is responsible for), lack of adequate sewage disposal, rodent infestation in two or more units, serious structural defects, and health or fire hazards within a reasonable time after notice; a period over 30 days is presumed unreasonable. If Landlord fails to do so, Tenant may use the remedies of rent escrow and the warranty of habitability provided by law.",
    cite: "Md. Code, Real Prop. §§ 8-211, 8-212",
  },

  sources: [
    { cite: "Md. Code, Real Prop. § 8-203", url: MGA("grp", "8-203") },
    { cite: "Md. Code, Real Prop. § 8-203.1", url: MGA("grp", "8-203.1") },
    { cite: "Md. Code, Real Prop. § 8-202", url: MGA("grp", "8-202") },
    { cite: "Md. Code, Real Prop. § 8-204", url: MGA("grp", "8-204") },
    { cite: "Md. Code, Real Prop. § 8-207", url: MGA("grp", "8-207") },
    { cite: "Md. Code, Real Prop. § 8-208", url: MGA("grp", "8-208") },
    { cite: "Md. Code, Real Prop. § 8-208.1", url: MGA("grp", "8-208.1") },
    { cite: "Md. Code, Real Prop. § 8-208.3", url: MGA("grp", "8-208.3") },
    { cite: "Md. Code, Real Prop. § 8-209", url: MGA("grp", "8-209") },
    { cite: "Md. Code, Real Prop. § 8-210", url: MGA("grp", "8-210") },
    { cite: "Md. Code, Real Prop. § 8-211", url: MGA("grp", "8-211") },
    { cite: "Md. Code, Real Prop. § 8-212", url: MGA("grp", "8-212") },
    { cite: "Md. Code, Real Prop. § 8-212.1", url: MGA("grp", "8-212.1") },
    { cite: "Md. Code, Real Prop. § 8-212.2", url: MGA("grp", "8-212.2") },
    { cite: "Md. Code, Real Prop. § 8-212.3", url: MGA("grp", "8-212.3") },
    { cite: "Md. Code, Real Prop. § 8-215", url: MGA("grp", "8-215") },
    { cite: "Md. Code, Real Prop. § 8-216", url: MGA("grp", "8-216") },
    { cite: "Md. Code, Real Prop. § 8-218", url: MGA("grp", "8-218") },
    { cite: "Md. Code, Real Prop. § 8-219", url: MGA("grp", "8-219") },
    { cite: "Md. Code, Real Prop. § 8-220", url: MGA("grp", "8-220") },
    { cite: "Md. Code, Real Prop. § 8-221", url: MGA("grp", "8-221") },
    { cite: "Md. Code, Real Prop. § 8-112", url: MGA("grp", "8-112") },
    { cite: "Md. Code, Real Prop. § 8-119", url: MGA("grp", "8-119") },
    { cite: "Md. Code, Real Prop. § 8-401", url: MGA("grp", "8-401") },
    { cite: "Md. Code, Real Prop. § 8-402", url: MGA("grp", "8-402") },
    { cite: "Md. Code, Real Prop. §§ 8-5A-01 to 8-5A-06", url: MGA("grp", "8-5A-02") },
    { cite: "Md. Code, State Gov't § 9-901", url: MGA("gsg", "9-901") },
    { cite: "Md. Code, State Gov't § 20-705", url: MGA("gsg", "20-705") },
    { cite: "Md. Code, Fam. Law § 4-501", url: MGA("gfl", "4-501") },
  ],

  reviewNotes: [
    "Security deposit cap is now ONE month's rent (§ 8-203(b)(1), as amended by the 2024 Renters' Rights and Stabilization Act), not the former two months. The 2-month exception applies only to DHS utility-assistance tenants who pay utilities through the landlord, with written agreement. Surety bonds may still total up to 2 months combined with any deposit (§ 8-203(i)).",
    "Deposit interest: greater of 1.5% simple or the 1-year Treasury yield-curve rate as of the first business day of each year (§ 8-203(e)); DHCD publishes the rates/calculator and landlords may rely on it (§ 8-203(m)–(n)). interestRequired = true.",
    "Required lease contents (§ 8-208(c)): habitability statement, utility/repair obligations, deposit receipt with the § 8-203.1 rights, and a copy of the current Maryland Tenants' Bill of Rights. The generator must attach the current Bill of Rights PDF from DHCD/OTLA — the disclosure text only says it is attached. Please confirm the builder's Utilities section is specific enough to satisfy 'specific obligations as to heat, gas, electricity, water' (it says included utilities = {{utilities}}, tenant pays the rest).",
    "§ 8-208(e): any automatic renewal provision (other than a renewal period of 1 month or less) must be set apart and separately initialed by the tenant or it is unenforceable. The builder's Term clause converts to month-to-month on holdover WITH consent, which should fall within the 1-month exception, but attorney should confirm.",
    "Tenant's month-to-month notice: § 8-402(c)(3) is framed as proof-of-tenant-notice (30 days) relieving the landlord of written notice, and does not apply in Baltimore City; § 8-208(a)(2) references 1 month's written notice. I wrote 30 days for tenant notice as a contract term. Landlord notice is 60 days for month-to-month AND for any written lease longer than 1 week expiring (§ 8-402(c)(2)(i)).",
    "Military: § 8-212.1 incorporates State Gov't § 9-901's 'service member' (any member of the uniformed services or a reserve component) and 'active duty' per 37 U.S.C. § 101. It does not appear to cover Maryland National Guard on purely state active duty (state duty is not 'active duty' under 37 U.S.C. § 101) — no separate Maryland state-active-duty lease statute was found. Note the liability cap (rent due + 30 days' rent after notice + damage) is triggered by 'change of assignment', which includes retirement/separation — broader than SCRA. Statute does not specify documentation beyond 'proof of the change of assignment'.",
    "DV (§ 8-5A): the third-party report has strict content requirements (§ 8-5A-01(h)) including notarized signature of the qualified third party and tenant signature under penalty of perjury; peace/protective orders must be FINAL orders (interim/temporary orders do not qualify). Statute has no explicit co-tenant release rule beyond keeping the respondent-tenant liable (§ 8-5A-02(e)). Non-disclosure duty § 8-5A-06. Lock-change right on request with a protective/peace order (§ 8-5A-05) is not encoded as a lease term.",
    "§ 8-212.2 medical-condition cap does not apply if the lease's own early termination clause requires ≤1 month notice AND imposes ≤2 months' rent after move-out. With the generator's default (30-day notice, 2-month fee) the exception may be met, meaning the statute technically would not apply — but the builder exempts statutory-right users from the fee anyway. Attorney may want the builder to treat MD default terms as satisfying § 8-212.2.",
    "No statutory late-fee grace period statewide; some counties (e.g., Montgomery County) have local rules — not verified here.",
    "Lead: Maryland's Reduction of Lead Risk in Housing law (Environment Art. Title 6, Subtitle 8) requires pre-1950 (and certain pre-1978) 'affected property' registration, risk-reduction certificates before each change of occupancy, and delivery of a state Notice of Tenant's Rights. I did NOT read Environment Art. §§ 6-801 et seq.; the federal lead disclosure the builder adds does not satisfy these. Recommend a conditional MD lead disclosure after verifying Environment §§ 6-815, 6-820, 6-823.",
    "§ 8-119 (tenant right of first refusal): before selling a 1–3 unit residential rental property, the owner must give tenants of 6+ months notice and a 30-day offer window; a lease may not waive or condition this (§ 8-208(d)(12)). Not encoded as a lease clause.",
    "§ 8-210(c) requires the pet policy (breed/weight limits, fees, deposits, monthly fees, limits, vaccination, insurance) in rental applications and on the property website — an application-stage requirement for Keycove listings, not a lease clause.",
    "§ 8-218: landlord must tell applicants whether it accepts reusable tenant screening reports; if accepted, no application fee may be charged. Application-flow item.",
    "Local law warnings: Montgomery County (rent stabilization, county lease requirements, licensing), Prince George's County (rent stabilization), City of Takoma Park (rent stabilization), Baltimore City (licensing/registration; § 8-402(c)(3) parol notice rule excluded), and other counties with licensing or extra notice rules. Numbers not verified here; local addenda likely needed.",
    "Entry statute: § 8-221 entry rule (24 hours, 7am–7pm Mon–Sat) took effect Oct. 1, 2025; a 2026 bill (SB 635) proposed amending § 8-221(b) — the statute text read on 2026-11-08 is what is encoded.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
