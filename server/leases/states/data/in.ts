import type { StateLawProfile } from "../types";

const IC32 = "https://iga.in.gov/ic/2026/Title_32.html";
const IC10 = "https://iga.in.gov/ic/2026/Title_10.html";
const IC22 = "https://iga.in.gov/ic/2026/Title_22.html";

export const IN: StateLawProfile = {
  code: "IN",
  name: "Indiana",
  framework:
    "Indiana residential landlord-tenant statutes, Ind. Code art. 32-31 (including ch. 3 security deposits, ch. 5 rental agreements and access, ch. 7 tenant obligations, ch. 8 landlord obligations, ch. 9 rights of crime victims)",

  deposit: {
    maxMonths: null,
    capRule:
      "Indiana law sets no maximum amount for a security deposit.",
    capCite: null,
    returnDays: 45,
    returnRule:
      "Within 45 days after the Lease ends and Tenant delivers possession, Landlord shall deliver to Tenant the deposit, less any amounts applied to accrued rent, damages beyond ordinary wear and tear caused by Tenant's noncompliance, unpaid rent due for Tenant's early termination, and unpaid utility or sewer charges Tenant owes under this Lease, together with a written itemized list of damages showing the estimated cost of repair for each item. Landlord is not required to do so until Tenant gives Landlord a mailing address in writing. If Landlord fails to send the itemized notice, Landlord must return the full deposit. Unless otherwise agreed in writing, Tenant may not apply the deposit to rent.",
    returnCite: "Ind. Code §§ 32-31-3-12 to 32-31-3-16",
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
      "A month-to-month tenancy may be ended by one month's written notice. For a tenancy of three months or less that runs from period to period, notice equal to the interval between rent periods is sufficient.",
    monthToMonthCite: "Ind. Code §§ 32-31-1-1, 32-31-1-4",
    nonpaymentDays: 10,
    nonpaymentRule:
      "If Tenant fails to pay rent when due, Landlord may terminate the Lease by giving Tenant at least 10 days' notice, unless Tenant pays the rent in full before the notice period expires.",
    nonpaymentCite: "Ind. Code §§ 32-31-1-6, 32-31-1-7",
    entryHours: null,
    entryRule:
      "Landlord will give Tenant reasonable written or oral notice before entering, will enter only at reasonable times, and will not abuse the right of entry or use it to harass Tenant. Landlord may enter without notice in an emergency that threatens the safety of the occupants or the property, and without consent under a court order or if Tenant has abandoned or surrendered the Premises. Tenant will not unreasonably withhold consent for Landlord to inspect, make necessary or agreed repairs, decorations, alterations, or improvements, supply services, or show the Premises to prospective or actual purchasers, mortgagees, tenants, workers, or contractors.",
    entryCite: "Ind. Code § 32-31-5-6(e)–(g)",
  },

  earlyTermination: {
    military: {
      label: "National Guard on state active duty (Indiana law)",
      cite: "Ind. Code § 10-16-7-23; Ind. Code ch. 10-16-20",
      eligible:
        "Indiana extends the rights and protections of the federal Servicemembers Civil Relief Act, including the residential lease-termination right in 50 U.S.C. § 3955, to a member of the Indiana National Guard or the National Guard of another state who is ordered to state active duty (or other active duty under the Indiana statute) for at least 30 consecutive days.",
      notice:
        "Tenant may terminate by delivering written notice to Landlord. When rent is paid monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is delivered.",
      documentation:
        "The notice must include a copy of the orders or other documentation showing that Tenant is a member of the National Guard ordered to state active duty for at least 30 consecutive days.",
      liability:
        "Tenant owes rent only through the effective termination date, prorated, and owes no early termination fee or penalty. Landlord shall refund rent paid in advance for any period after termination and return the security deposit as required by law.",
    },
    domesticViolence: {
      label: "Domestic or family violence, sex offense, or stalking",
      cite: "Ind. Code ch. 32-31-9",
      eligible:
        "A tenant who is a victim or alleged victim of a crime involving domestic or family violence, a sex offense, or stalking, and who has obtained a civil order for protection or a criminal no-contact order restraining the perpetrator from contact with the tenant, may terminate the tenant's rights and obligations under this Lease.",
      notice:
        "Tenant must give Landlord written notice of termination at least 30 days before the termination date stated in the notice.",
      documentation:
        "The notice must include a copy of the civil order for protection or criminal no-contact order. If Tenant is a victim of domestic violence or sexual assault, the notice must also include a safety plan from an accredited domestic violence or sexual assault program that recommends relocation and is dated no more than 30 days before the notice is given.",
      liability:
        "Tenant owes rent and other expenses prorated to the termination date, payable when rent would otherwise be due, and owes no other rent or fees because of the early termination. If Tenant terminates at least 14 days before Tenant would first have the right to occupy the Premises, Tenant owes no damages or penalties. Tenant is entitled to deposits and refunds as if the Lease had expired by its terms. The rights and obligations of other adult tenants under this Lease continue unaffected. Landlord will change the locks within 48 hours (24 hours if the restrained person is a co-tenant) after Tenant's written request and copy of the order, at Tenant's expense.",
    },
    other: [],
    feeCap: null,
    mitigation: {
      basis: "case_law",
      cite: null,
      rule:
        "If Tenant leaves before the end of the term, Landlord will make reasonable efforts to re-rent the Premises, and any rent Landlord receives from a replacement tenant will be credited against what Tenant owes.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Manager and Agent for Notices",
      text:
        "At or before the start of this Lease, Landlord will give Tenant in writing the names and addresses of a person residing in Indiana who is authorized to manage the Premises, and of a person residing in Indiana and reasonably accessible to Tenant who is authorized to act as Landlord's agent for service of process and for receiving and receipting for notices and demands. Unless Landlord designates otherwise in writing, that person is {{landlord_name}}, {{landlord_address}}.",
      cite: "Ind. Code § 32-31-3-18",
    },
    {
      id: "smoke_detector",
      title: "Smoke Detector Acknowledgment",
      text:
        "By signing this Lease, Tenant acknowledges that the Premises are equipped with a functional smoke detector at the time of delivery. Tenant will keep each smoke detector functional, will not disable or tamper with it, will test it at least once every six months, will replace batteries in battery-operated detectors as needed, and will give Landlord written notice if a hard-wired detector is not functional. Landlord will repair or replace a required smoke detector within seven working days after written notice.",
      cite: "Ind. Code §§ 32-31-5-7, 32-31-7-5(6), 22-11-18-3.5",
    },
    {
      id: "flood_zone",
      title: "Flood Plain Disclosure",
      text: "The structure on the Premises is located in a flood plain.",
      cite: "Ind. Code § 32-31-1-21",
      condition:
        "Only if the lowest floor of the structure, including any basement, is at or below the 100-year flood elevation as determined by the Indiana Department of Natural Resources, FEMA Flood Insurance Rate Maps, or FEMA-approved local flood plain maps",
    },
    {
      id: "military_installation",
      title: "Military Installation Disclosure",
      text:
        "The Premises are located near a military installation, within a state area of interest (as defined in Ind. Code § 36-7-30.2-6), and may be impacted to some degree by the effects of the installation's military operations. Local laws may restrict use and development of the Premises to promote compatibility with military installation operations.",
      cite: "Ind. Code § 32-31-1-21.1",
      condition: "Only if the Premises are within a state area of interest near a military installation",
    },
  ],

  fairHousing: {
    stateClasses: ["ancestry"],
    cite: "Ind. Code §§ 22-9-1-2, 22-9-1-3(l); Ind. Code § 22-9.5-5-1",
  },

  eviction: {
    rule:
      "Landlord may recover possession only by court action, such as an action for possession or ejectment under Ind. Code ch. 32-30-3 or an emergency possessory order under Ind. Code ch. 32-31-6. Except as authorized by court order, Landlord will not change the locks, remove doors, windows, fixtures, or appliances, interrupt utilities or other essential services, or take or dispose of Tenant's property to exclude Tenant or enforce Tenant's obligations.",
    cite: "Ind. Code §§ 32-30-3-1 et seq., 32-31-5-5, 32-31-5-6(c)",
  },

  habitability: {
    rule:
      "Landlord shall deliver the Premises in a safe, clean, and habitable condition; comply with all applicable health and housing codes; make all reasonable efforts to keep common areas clean and proper; and keep in good and safe working condition the electrical, plumbing (with a reasonable supply of hot and cold running water at all times), sanitary, heating (sufficient to adequately supply heat at all times), ventilating, and air conditioning systems, elevators, and appliances supplied as an inducement to this Lease, if provided when this Lease was entered into.",
    cite: "Ind. Code § 32-31-8-5",
  },

  sources: [
    { cite: "Ind. Code ch. 32-31-1 (general provisions, incl. §§ 1, 4, 6, 7, 8, 20, 21, 21.1, 23)", url: IC32 },
    { cite: "Ind. Code ch. 32-31-2.9 (application)", url: IC32 },
    { cite: "Ind. Code ch. 32-31-3 (security deposits, §§ 1.1–19)", url: IC32 },
    { cite: "Ind. Code ch. 32-31-5 (rental agreements; access; smoke detector acknowledgment)", url: IC32 },
    { cite: "Ind. Code ch. 32-31-7 (tenant obligations)", url: IC32 },
    { cite: "Ind. Code ch. 32-31-8 (landlord obligations)", url: IC32 },
    { cite: "Ind. Code ch. 32-31-8.5 (retaliation)", url: IC32 },
    { cite: "Ind. Code ch. 32-31-9 (crime victims)", url: IC32 },
    { cite: "Ind. Code ch. 32-31-10 (eviction actions)", url: IC32 },
    { cite: "Ind. Code §§ 32-30-3-1 to 32-30-3-3 (ejectment / possession)", url: IC32 },
    { cite: "Ind. Code § 10-16-7-23 (SCRA extended to National Guard on state active duty)", url: IC10 },
    { cite: "Ind. Code ch. 10-16-20 (Indiana Servicemembers Civil Relief Act)", url: IC10 },
    { cite: "Ind. Code §§ 22-9-1-2, 22-9-1-3 (Civil Rights Law)", url: IC22 },
    { cite: "Ind. Code § 22-9.5-5-1 and ch. 22-9.5-3 (Fair Housing Act; exemptions)", url: IC22 },
    { cite: "Ind. Code § 22-11-18-3.5 (smoke detectors)", url: IC22 },
  ],

  reviewNotes: [
    "Military: Ind. Code § 10-16-7-23(b) applies the federal SCRA's 'rights, benefits, and protections' to Indiana (and other states') National Guard members ordered to state active duty for at least 30 consecutive days; IC 10-16-20 makes SCRA violations state-law violations. The lease text assumes this carries the 50 U.S.C. § 3955 lease-termination mechanics (notice + orders, termination 30 days after the next rent due date for monthly leases, no penalty). The statute incorporates the SCRA wholesale rather than restating § 3955, so the attorney should confirm the incorporation reading. § 10-16-7-23(c) shields a landlord from state penalties until the member provides documentation of the 30-day state active duty order.",
    "Nonpayment notice: Ind. Code § 32-31-1-6 allows 10 days' notice 'unless the parties otherwise agreed', and § 32-31-1-8(5) says no notice is required if the contract requires rent in advance and the tenant fails to pay it. Keycove's lease keeps the 10-day notice; do not add language waiving notice.",
    "No statutory move-in inspection, late-fee cap or grace period, entry-notice hour count, deposit holding/escrow rule, or deposit interest in Indiana. Late fees are judged as liquidated damages vs. penalty under case law (not verified).",
    "Mitigation: no statute; Indiana courts impose the duty by case law. The leading case was not verified from a primary source.",
    "Fair housing: the Indiana Fair Housing Act (IC 22-9.5-5-1) tracks the federal seven classes. The Indiana Civil Rights Law (IC 22-9-1-2) adds 'ancestry' for housing. IC 22-9-1-3(l) defines 'discriminatory practice' to include 'status as a veteran', but the housing policy statement in § 22-9-1-2(a)–(b) does not list it; whether veteran status is protected in housing is unclear and is not listed.",
    "Death/incapacity of a sole tenant (IC 32-31-1-23) is not a lease-termination right; it requires the landlord to notify the tenant's representative, allow removal of property, and pay the representative the deposit and unearned rent. Keycove could let tenants name a 'tenant's representative' in the lease (§ 32-31-1-23(c)(2)).",
    "Indiana preempts local regulation of screening, deposits, lease terms, disclosures, and fees (IC 32-31-1-20), so city ordinances (e.g., Indianapolis tenant-rights notice ordinances) are largely void except for subsidized housing. Local rental registration/inspection programs may still exist.",
    "Retaliation (IC 32-31-8.5) and the 30-day notice to modify a rental agreement absent a written provision (IC 32-31-5-4) were read but are not separate lease fields.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
