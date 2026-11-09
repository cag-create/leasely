import type { StateLawProfile } from "../types";

// Official text is at nysenate.gov (Cloudflare-blocked for curl); NewYork.Public.Law
// reproduces it verbatim with the nysenate.gov source date, so both are listed.
const PL = (slug: string) => `https://newyork.public.law/laws/n.y._${slug}`;

export const NY: StateLawProfile = {
  code: "NY",
  name: "New York",
  framework:
    "New York Real Property Law Article 7 (Landlord and Tenant), General Obligations Law §§ 7-101 et seq. (security deposits), and Real Property Actions and Proceedings Law Article 7 (summary proceedings)",

  deposit: {
    maxMonths: 1,
    capRule:
      "The security deposit or any advance payment may not exceed one month's rent. The only payments Landlord may require before or at the start of the tenancy are the security deposit, rent, and a background and credit check fee of no more than the lesser of the actual cost or $20.00 (waived if Tenant provides a check done within the past 30 days).",
    capCite: "N.Y. Gen. Oblig. Law § 7-108(1-a)(a); N.Y. Real Prop. Law § 238-a(1)",
    returnDays: 14,
    returnRule:
      "Within 14 days after Tenant vacates, Landlord shall give Tenant an itemized statement of the basis for any amount retained and return the rest of the deposit. Landlord may retain only reasonable, itemized amounts for unpaid rent, damage caused by Tenant beyond normal wear and tear, unpaid utility charges payable to Landlord under this Lease, and moving and storage of Tenant's belongings, and may not retain anything for ordinary wear and tear or damage caused by a prior tenant. If Landlord misses the 14-day deadline, Landlord forfeits any right to retain any part of the deposit. After either party gives notice of intent to end the tenancy (unless Tenant gives less than two weeks' notice), Landlord will tell Tenant in writing of the right to request a pre-move-out inspection; if Tenant requests one, it will be held one to two weeks before the tenancy ends on at least 48 hours' written notice, and Tenant may cure any listed condition before moving out.",
    returnCite: "N.Y. Gen. Oblig. Law § 7-108(1-a)(b), (d)–(g)",
    holdingRule:
      "The deposit remains Tenant's money, is held in trust by Landlord, and may not be commingled with Landlord's own money. If Landlord deposits it in a bank, the bank must have a place of business in New York, and Landlord shall notify Tenant in writing of the name and address of the bank and the amount deposited. If the building has six or more apartments, Landlord shall keep the deposit in an interest-bearing account at a New York bank; Landlord may keep 1% per year of the deposit as an administrative fee, and the rest of the interest belongs to Tenant and will be held in trust or paid to Tenant annually.",
    holdingCite: "N.Y. Gen. Oblig. Law § 7-103(1), (2), (2-a)",
    interestRequired: false,
    moveInInspection:
      "After signing this Lease and before Tenant moves in, Landlord shall offer Tenant the opportunity to inspect the Property with Landlord or Landlord's agent. If Tenant requests the inspection, Landlord and Tenant will sign a written agreement before move-in describing the condition of the Property and noting any existing defects or damage, and Landlord may not keep any part of the deposit for any condition, defect, or damage noted in that agreement.",
  },

  lateFee: {
    graceDays: 5,
    capType: "lesser_of",
    capPercent: 5,
    capFlat: 50,
    capRule:
      "A late fee may be charged only if rent has not been paid within five days after its due date, and it may not exceed $50.00 or 5% of the monthly rent, whichever is less. Any lease term that waives or limits this rule is void.",
    cite: "N.Y. Real Prop. Law § 238-a(2), (3)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Tenant may end a month-to-month tenancy by written notice at least one month before the end of a monthly rental period. To end a month-to-month tenancy, not renew this Lease, or renew it with a rent increase of 5% or more, Landlord must give Tenant written notice of at least 30 days if Tenant has lived in the Property less than one year and has a lease term of less than one year, at least 60 days if Tenant has lived there one to two years or has a lease term of one to two years, and at least 90 days if Tenant has lived there more than two years or has a lease term of at least two years. If Landlord's notice is late, Tenant's tenancy continues on the existing terms until the notice period expires. Where the New York State Good Cause Eviction Law applies, Landlord may decline to renew only for a good cause listed in that law.",
    monthToMonthCite: "N.Y. Real Prop. Law §§ 226-c, 232-a, 232-b, 232-c",
    nonpaymentDays: 14,
    nonpaymentRule:
      "If Landlord does not receive rent within five days after it is due, Landlord shall send Tenant written notice of the nonpayment by certified mail. Before starting a nonpayment proceeding, Landlord must serve a written demand giving Tenant at least 14 days to pay the rent or surrender possession, with the Good Cause Eviction Law notice attached, and may then begin a summary proceeding in court.",
    nonpaymentCite: "N.Y. Real Prop. Law § 235-e(d); N.Y. Real Prop. Actions & Proc. Law § 711(2)",
    entryHours: null,
    entryRule:
      "New York has no statute setting an entry-notice period for most rentals. Except in an emergency, Landlord will give Tenant at least 24 hours' notice before entering to inspect, make repairs, or show the Property, and will enter only at reasonable times.",
    entryCite: null,
  },

  earlyTermination: {
    military: {
      label: "Military service (New York Military Law)",
      cite: "N.Y. Mil. Law §§ 301(1), 310",
      eligible:
        "Tenant may terminate this Lease if Tenant (or the person on whose behalf it was signed) entered military service after signing it and the Property has been occupied by Tenant or Tenant's dependents. 'Military service' includes active federal military service, active duty in the military service of New York under an order of the Governor, and state active duty by members of the National Guard called by the governor of New York or another state. The right also applies when the Lease was signed jointly with the servicemember's spouse.",
      notice:
        "Tenant may deliver or mail written notice to Landlord or Landlord's agent at any time after military service begins. Because rent is paid monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is delivered or mailed.",
      documentation: "",
      liability:
        "Tenant owes rent prorated through the termination date, and Landlord shall refund any rent paid in advance for a later period. Landlord may ask a court, before the termination date, to modify this relief as justice and equity require. Landlord may not hold Tenant's belongings to secure rent for any period after termination.",
    },
    domesticViolence: {
      label: "Victims of domestic violence",
      cite: "N.Y. Real Prop. Law § 227-c",
      eligible:
        "Tenant may terminate this Lease if Tenant or a member of Tenant's household is a victim of domestic violence as defined in N.Y. Social Services Law § 459-a and reasonably fears remaining in the Property because of potential further domestic violence.",
      notice:
        "Tenant delivers written notice to Landlord or Landlord's agent, and to any co-tenant other than the person who committed the domestic violence, stating that Tenant or a household member has experienced domestic violence and reasonably believes they cannot safely remain in the Property, and naming a termination date at least 30 days after delivery. A mailed notice is deemed delivered five days after mailing. If Landlord is the alleged perpetrator, a person Tenant authorizes may deliver the notice.",
      documentation:
        "Within 25 days after the notice, Tenant shall provide documentation, which may be any one or more of: a temporary or final order of protection; a record, complaint, or report from a law enforcement agency; a record from a health care provider of treatment related to the domestic violence; or a sworn or notarized written verification from a qualified third party (such as a law enforcement officer, court employee, licensed attorney, physician, psychologist, social worker, nurse, therapist, or counselor, a domestic violence agency employee, or a member of the clergy) to whom the violence was reported. Landlord shall keep this information confidential and shall not describe the termination as an early termination to any prospective landlord or third party.",
      liability:
        "Tenant pays rent prorated to the termination date and owes no rent after it. Landlord shall refund prepaid rent for any period after termination within 10 days after the notice is delivered, as long as Tenant has vacated, and may not withhold any part of the security deposit because Tenant used this right. Landlord may not terminate or sever a remaining co-tenant's tenancy without that co-tenant's consent and must give them at least 30 days after the termination date to decide.",
    },
    other: [
      {
        label: "Tenant age 62 or older, or with a disability, moving to care, subsidized or senior housing, or a family member's home",
        cite: "N.Y. Real Prop. Law § 227-a",
        eligible:
          "A Tenant who is 62 or older (or will turn 62 during this Lease), or who has a disability as defined in N.Y. Executive Law § 292(21), or the spouse or dependent of such a person residing with them, may terminate this Lease if Tenant (i) is certified by a physician as no longer able, for medical reasons, to live independently and needing help with activities of daily living, and will move into a family member's residence, or (ii) is notified of the opportunity to move into an adult care facility (other than a shelter), a residential health care facility, subsidized low- or moderate-income housing, or less expensive housing in a project built for seniors or persons with disabilities.",
        notice:
          "Tenant delivers written notice to Landlord or Landlord's agent. Termination takes effect no earlier than 30 days after the date the next rent payment is due after the notice is delivered. A mailed notice is deemed delivered five days after mailing.",
        documentation:
          "The notice must include the physician's certification and, for a move to a family member's home, a notarized statement from the family member that Tenant is related and will live with them for at least six months; or, for a facility or housing project, a copy of Tenant's executed lease or contract with the facility.",
        liability:
          "Tenant owes no rent for any period after the termination date, and rent paid in advance is adjusted to the date Tenant surrenders the Property.",
      },
      {
        label: "Building destroyed or made untenantable",
        cite: "N.Y. Real Prop. Law § 227",
        eligible:
          "If the building is destroyed or so damaged by the elements or any other cause that it is untenantable and unfit for occupancy, and the destruction or damage did not result from Tenant's fault or neglect, Tenant may quit and surrender possession.",
        notice: "Tenant ends this Lease by surrendering possession of the Property.",
        documentation: "",
        liability:
          "Tenant owes no rent for the period after surrender, and any rent paid in advance is adjusted to the date of surrender.",
      },
      {
        label: "Death of a tenant (assignment request)",
        cite: "N.Y. Real Prop. Law § 236",
        eligible:
          "If a Tenant dies, the executor, administrator, or legal representative of the estate may ask Landlord to consent to an assignment or sublease of this Lease.",
        notice:
          "The request must be sent by registered or certified mail, return receipt requested, with the written consent of any co-tenant or guarantor and the name and business and home addresses of the proposed assignee or subtenant. Landlord may ask for more information within 10 days and must respond within 30 days; silence is consent.",
        documentation: "",
        liability:
          "If Landlord terminates this Lease or unreasonably refuses consent, this Lease ends and the estate and any other tenant are released from further liability as of the last day of the calendar month in which Landlord was required to respond.",
      },
      {
        label: "Assignment refused unreasonably",
        cite: "N.Y. Real Prop. Law § 226-b(1)",
        eligible:
          "Tenant may ask Landlord's written consent to assign this Lease. If Landlord unreasonably withholds consent, Tenant may require Landlord to release Tenant from this Lease.",
        notice: "On Tenant's request after an unreasonable refusal, Landlord shall release Tenant on 30 days' notice.",
        documentation: "",
        liability: "Tenant owes rent only through the release date. If Landlord reasonably withholds consent, Tenant is not released.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "N.Y. Real Prop. Law § 227-e",
      rule:
        "If Tenant vacates in violation of this Lease, Landlord shall, in good faith and according to Landlord's resources and abilities, take reasonable and customary actions to re-rent the Property at fair market value or at the rent in this Lease, whichever is lower. Once a new tenant's lease takes effect, this Lease ends and rent received from the new tenant reduces what Tenant owes. Landlord bears the burden of proving damages.",
    },
  },

  disclosures: [
    {
      id: "good_cause_eviction_notice",
      title: "Good Cause Eviction Law notice",
      text:
        "Landlord has attached to this Lease and made part of it the completed statutory Notice to Tenant of Applicability or Inapplicability of the New York State Good Cause Eviction Law, stating whether the Property is subject to Article 6-A of the Real Property Law and, if it is exempt, why.",
      cite: "N.Y. Real Prop. Law § 231-c",
    },
    {
      id: "sprinkler",
      title: "Sprinkler system notice",
      text:
        "NOTICE: Landlord states in the attached sprinkler rider, in bold type, whether there is a maintained and operative sprinkler system in the leased premises and, if there is, the date of its last maintenance and inspection.",
      cite: "N.Y. Real Prop. Law § 231-a",
    },
    {
      id: "flood_zone",
      title: "Flood history and risk notice",
      text:
        "Landlord states in the attached flood rider whether any or all of the Property is located wholly or partially in a FEMA-designated floodplain, in the Special Flood Hazard Area (100-year floodplain), or in a Moderate Risk Flood Hazard Area (500-year floodplain) according to FEMA's current Flood Insurance Rate Maps, and any prior flood damage to the Property from a natural flood event that Landlord knows or reasonably should know about and the nature of that damage. Flood insurance is available to renters through the Federal Emergency Management Agency's (FEMA's) National Flood Insurance Program (NFIP) to cover your personal property and contents in the event of a flood. A standard renter's insurance policy does not typically cover flood damage. You are encouraged to examine your policy to determine whether you are covered.",
      cite: "N.Y. Real Prop. Law § 231-b",
    },
    {
      id: "additional_occupants",
      title: "Roommates and additional occupants",
      text:
        "If one Tenant signs this Lease, Tenant may share the Property with Tenant's immediate family, one additional occupant, and that occupant's dependent children, as long as Tenant or Tenant's spouse occupies the Property as a primary residence. If two or more Tenants sign, the total number of tenants and occupants (not counting occupants' dependent children) may not exceed the number of Tenants named in this Lease. Tenant shall tell Landlord the name of any occupant within 30 days after the occupant moves in or within 30 days after Landlord asks. An occupant gains no right to stay if Tenant leaves unless Landlord agrees in writing. Occupancy remains subject to legal occupancy limits.",
      cite: "N.Y. Real Prop. Law § 235-f",
    },
    {
      id: "rent_payment_and_receipts",
      title: "Rent payments, receipts, and fees",
      text:
        "Landlord will not require electronic payment as the only way to pay rent and will not charge a fee for choosing not to pay electronically. Landlord will give a written receipt for rent paid in cash or by any instrument other than Tenant's personal check (and for personal checks if Tenant asks in writing). Any returned-check fee must be stated in this Lease and may not exceed the amount allowed by N.Y. Real Prop. Law § 238-a(2-a). A fee to copy keys may not exceed 110% of the actual cost, except after three copies in a calendar year.",
      cite: "N.Y. Real Prop. Law §§ 235-e, 235-g, 235-i, 238-a",
    },
    {
      id: "sublease_right",
      title: "Right to sublease",
      text:
        "If the building has four or more residential units, Tenant may sublease the Property with Landlord's advance written consent, which Landlord will not unreasonably withhold, by following the certified-mail request procedure in N.Y. Real Prop. Law § 226-b(2). Tenant remains liable under this Lease during any sublease.",
      cite: "N.Y. Real Prop. Law § 226-b(2)",
      condition: "Only for a building with four or more residential units",
    },
  ],

  fairHousing: {
    stateClasses: [
      "creed",
      "citizenship or immigration status",
      "sexual orientation",
      "gender identity or expression",
      "military status",
      "age",
      "marital status",
      "status as a victim of domestic violence",
      "lawful source of income",
    ],
    cite: "N.Y. Exec. Law § 296(5)(a)",
  },

  eviction: {
    rule:
      "Landlord may remove Tenant or any lawful occupant only through a special summary proceeding in court under Article 7 of the Real Property Actions and Proceedings Law and a warrant of eviction executed by a marshal, sheriff, or constable. Landlord will not use or threaten force, interrupt essential services, remove Tenant's belongings, remove the door, change or disable the locks, or otherwise try to force Tenant out; doing so is a crime and exposes Landlord to civil penalties and treble damages.",
    cite: "N.Y. Real Prop. Actions & Proc. Law §§ 711, 768, 853",
  },

  habitability: {
    rule:
      "Landlord warrants that the Property and all areas used in common with other tenants are fit for human habitation and for the uses reasonably intended by the parties, and that occupants will not be subjected to any conditions dangerous, hazardous, or detrimental to their life, health, or safety, except conditions caused by the misconduct of Tenant or persons under Tenant's direction or control. This warranty cannot be waived.",
    cite: "N.Y. Real Prop. Law § 235-b",
  },

  sources: [
    { cite: "N.Y. Gen. Oblig. Law § 7-103", url: PL("general_obligations_law_section_7-103") },
    { cite: "N.Y. Gen. Oblig. Law § 7-108", url: PL("general_obligations_law_section_7-108") },
    { cite: "N.Y. Real Prop. Law § 211", url: PL("real_property_law_section_211") },
    { cite: "N.Y. Real Prop. Law § 223-b", url: PL("real_property_law_section_223-b") },
    { cite: "N.Y. Real Prop. Law § 226-b", url: PL("real_property_law_section_226-b") },
    { cite: "N.Y. Real Prop. Law § 226-c", url: PL("real_property_law_section_226-c") },
    { cite: "N.Y. Real Prop. Law § 227", url: PL("real_property_law_section_227") },
    { cite: "N.Y. Real Prop. Law § 227-a", url: PL("real_property_law_section_227-a") },
    { cite: "N.Y. Real Prop. Law § 227-c", url: PL("real_property_law_section_227-c") },
    { cite: "N.Y. Real Prop. Law § 227-e", url: PL("real_property_law_section_227-e") },
    { cite: "N.Y. Real Prop. Law § 227-f", url: PL("real_property_law_section_227-f") },
    { cite: "N.Y. Real Prop. Law § 231-a", url: PL("real_property_law_section_231-a") },
    { cite: "N.Y. Real Prop. Law § 231-b", url: PL("real_property_law_section_231-b") },
    { cite: "N.Y. Real Prop. Law § 231-c", url: PL("real_property_law_section_231-c") },
    { cite: "N.Y. Real Prop. Law § 232-a", url: PL("real_property_law_section_232-a") },
    { cite: "N.Y. Real Prop. Law § 232-b", url: PL("real_property_law_section_232-b") },
    { cite: "N.Y. Real Prop. Law § 232-c", url: PL("real_property_law_section_232-c") },
    { cite: "N.Y. Real Prop. Law § 235-b", url: PL("real_property_law_section_235-b") },
    { cite: "N.Y. Real Prop. Law § 235-e", url: PL("real_property_law_section_235-e") },
    { cite: "N.Y. Real Prop. Law § 235-f", url: PL("real_property_law_section_235-f") },
    { cite: "N.Y. Real Prop. Law § 235-g", url: PL("real_property_law_section_235-g") },
    { cite: "N.Y. Real Prop. Law § 235-i", url: PL("real_property_law_section_235-i") },
    { cite: "N.Y. Real Prop. Law § 236", url: PL("real_property_law_section_236") },
    { cite: "N.Y. Real Prop. Law § 238-a", url: PL("real_property_law_section_238-a") },
    { cite: "N.Y. Real Prop. Actions & Proc. Law § 711", url: PL("real_property_actions_and_proceedings_law_section_711") },
    { cite: "N.Y. Real Prop. Actions & Proc. Law § 768", url: PL("real_property_actions_and_proceedings_law_section_768") },
    { cite: "N.Y. Real Prop. Actions & Proc. Law § 853", url: PL("real_property_actions_and_proceedings_law_section_853") },
    { cite: "N.Y. Exec. Law § 296", url: PL("executive_law_section_296") },
    { cite: "N.Y. Mil. Law § 301", url: PL("military_law_section_301") },
    { cite: "N.Y. Mil. Law § 303", url: PL("military_law_section_303") },
    { cite: "N.Y. Mil. Law § 310", url: PL("military_law_section_310") },
    { cite: "N.Y. Mil. Law § 311-b", url: PL("military_law_section_311-b") },
  ],

  reviewNotes: [
    "Source access: nysenate.gov returns a Cloudflare JavaScript challenge (HTTP 403) to curl and the OpenLegislation API needs a key. All NY text was read in full from NewYork.Public.Law, which reproduces the nysenate.gov text and states the official 'updated' date for each section (e.g., RPL § 238-a updated Oct. 17, 2025; § 226-c and § 231-c updated Aug. 22, 2025; RPAPL § 711 updated Dec. 13, 2024). Please spot-check against nysenate.gov.",
    "ATTACHMENTS REQUIRED (engineering): (1) RPL § 231-c requires every landlord (defined broadly in RPL § 211(2), so statewide, not just NYC) to append or incorporate the statutory Good Cause Eviction notice into any initial or renewal lease, including landlords who are exempt (the form states the exemption reason). (2) RPL § 231-b requires every residential lease to state the four flood answers; (3) RPL § 231-a requires conspicuous bold-face sprinkler notice. The disclosure text recites these, but Keycove must collect the answers and render them (sprinkler in bold).",
    "Military: N.Y. Military Law § 310 is broader than the SCRA in one way: 'military service' (§ 301(1)) includes New York state active duty on the Governor's order and National Guard state active duty, with no minimum duration and no orders requirement. It covers only leases signed BEFORE the tenant entered military service (or signed jointly with the spouse). The statute does not require any documentation; we left documentation empty rather than invent a requirement.",
    "Month-to-month: outside NYC, § 232-b lets the tenant end a monthly tenancy on one month's notice before the end of the term; inside NYC, § 232-a addresses only landlord notice. Landlord notice follows § 226-c's 30/60/90-day scale. monthToMonthDays is 30 as the minimum.",
    "Nonpayment: RPL § 235-e(d) requires the landlord to send a certified-mail notice if rent is not received within five days of the due date; failure is an affirmative defense to a nonpayment eviction. RPAPL § 711(2) requires a 14-day written rent demand that also attaches the Good Cause notice (until June 15, 2034).",
    "Early termination fee: no statute caps it, but RPL § 227-e (mitigation, non-waivable) and § 238-a (no fees beyond those listed) are in tension with any fee charged as a 'fee'. We treat the lease-break fee as an optional liquidated-damages buyout the tenant elects; please confirm that characterization is acceptable under § 238-a(1)(a), which bars 'any other payment, fee or charge before or at the beginning of the tenancy' (the buyout is charged at the end, so we believe it is outside that clause).",
    "RPL § 227 lets the tenant surrender after destruction only where 'no express agreement to the contrary has been made in writing'. The builder must not include any casualty clause that contradicts it.",
    "Deposit interest: GOL § 7-103(2-a) requires an interest-bearing account only for buildings with six or more units, so interestRequired is false; holdingRule explains the six-unit rule. Rent-stabilized units are governed by GOL § 7-107 (not read).",
    "Co-living: RPAPL § 711 treats an occupant of a room in a rooming house, or a non-transient hotel resident in possession 30+ days, as a tenant who can be removed only by a court proceeding. RPL § 235-f (roommate law) applies to every residential lease; a co-living agreement cannot restrict occupancy to the named tenant(s).",
    "Good Cause Eviction Law (RPL Article 6-A, §§ 211-218): applies in New York City and in localities that opt in (e.g., several upstate cities), with exemptions including 'small landlords' (10 or fewer units statewide, or a local threshold). It limits non-renewal to listed good causes and makes rent increases above the lower of CPI+5% or 10% presumptively unreasonable. Not encoded beyond the notice requirement.",
    "Local law warnings: NYC rent stabilization and rent control (Rent Stabilization Law, ETPA in Nassau/Westchester/Rockland and opt-in localities) require riders and override many terms here; NYC Administrative Code requires a bed bug infestation history disclosure, window guard notice, lead-paint annual notice (Local Law 1), stove knob cover notice, and a smoking policy disclosure (Local Law 147); the FARE Act limits broker fees charged to NYC tenants. Many upstate municipalities require rental registration/certificates of occupancy.",
    "DV: RPL § 227-c covers domestic violence as defined in Social Services Law § 459-a (not read; includes family offenses). Stalking or sexual assault by a non-household member may fall outside it. RPL § 227-d (only its definitions subdivision was read) bars discrimination based on domestic violence victim status.",
    "Application screening: RPL § 227-f bars refusing to rent because an applicant was in a prior landlord-tenant case; Exec. Law § 296(5) adds citizenship/immigration status. Not encoded in the lease.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
