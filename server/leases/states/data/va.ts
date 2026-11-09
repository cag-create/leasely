import type { StateLawProfile } from "../types";

const LIS = (title: string, chapter: string, section: string) =>
  `https://law.lis.virginia.gov/vacode/title${title}/chapter${chapter}/section${section}/`;
const VRLTA = (s: string) => LIS("55.1", "12", s);

export const VA: StateLawProfile = {
  code: "VA",
  name: "Virginia",
  framework: "Virginia Residential Landlord and Tenant Act, Va. Code Ann. §§ 55.1-1200 et seq.",

  deposit: {
    maxMonths: 2,
    capRule:
      "The security deposit, however it is labeled, may not exceed two months' rent. If Landlord requires damage insurance or renter's insurance premiums to be paid before the tenancy begins, the security deposit and those premiums together may not exceed two months' rent.",
    capCite: "Va. Code Ann. §§ 55.1-1226(A), 55.1-1208(A)(7), 55.1-1206(C)",
    returnDays: 45,
    returnRule:
      "Within 45 days after the later of the end of the tenancy or the date Tenant vacates, Landlord shall give Tenant a written notice itemizing the deposit and any deductions, together with any amount due to Tenant. Landlord may apply the deposit only to accrued rent (including reasonable late charges stated in this Lease), damage caused by Tenant's failure to meet Tenant's duties under Va. Code § 55.1-1227 less reasonable wear and tear, other charges provided in this Lease, and actual damages for breach under § 55.1-1251. If there is more than one Tenant, Landlord will issue one check payable to all Tenants and send it to a forwarding address provided by any Tenant, unless all Tenants agree otherwise in writing. Within five days after Landlord receives notice that Tenant intends to vacate (or when Landlord asks Tenant to vacate), Landlord will notify Tenant in writing of Tenant's right to be present at the move-out inspection; if Tenant asks in writing to attend, the inspection will be held within 72 hours after Tenant delivers possession. If damages exceed the deposit and require a third-party contractor, Landlord will say so in writing within the 45 days and then has 15 more days to itemize them.",
    returnCite: "Va. Code Ann. § 55.1-1226",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection:
      "Within five days after Tenant moves in, Landlord shall give Tenant a written report itemizing any damage to the Property existing at move-in, including whether there is any visible evidence of mold in readily accessible interior areas. The report is deemed correct unless Tenant objects to it in writing within five days after receiving it.",
  },

  lateFee: {
    graceDays: null,
    capType: "percent",
    capPercent: 10,
    capRule:
      "A late charge may be charged only because this written Lease provides for it, and it may not exceed the lesser of 10% of the monthly rent or 10% of the remaining balance due and owed by Tenant.",
    cite: "Va. Code Ann. § 55.1-1204(E)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either Landlord or Tenant may end a month-to-month tenancy by serving written notice on the other at least 30 days before the next rent due date (seven days before the next rent due date for a week-to-week tenancy). If Tenant stays on month-to-month with Landlord's agreement, the terms of this Lease continue, except that Landlord may change the rent by written notice that takes effect on the next rent due date at least 30 days after the notice.",
    monthToMonthCite: "Va. Code Ann. § 55.1-1253(A), (D)",
    nonpaymentDays: 14,
    nonpaymentRule:
      "If rent is not paid when due, Landlord may serve Tenant with a written notice stating that the rent is unpaid and that Landlord will terminate this Lease if the rent is not paid within 14 days. If Tenant does not pay within 14 days after the notice is served, Landlord may terminate this Lease and seek possession through the court. The same 14-day notice applies if a rent check is returned for insufficient funds or an electronic payment is rejected, in which case payment must be made by cash, cashier's check, certified check, or a completed electronic funds transfer.",
    nonpaymentCite: "Va. Code Ann. § 55.1-1245(F)",
    entryHours: 72,
    entryRule:
      "Tenant shall not unreasonably withhold consent for Landlord to enter to inspect, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show the Property to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or where it is impractical, Landlord will give Tenant notice before entering and will enter only at reasonable times. For routine maintenance that Tenant has not requested, Landlord will give at least 72 hours' notice, the maintenance will be performed within 14 days after the notice, and the notice will state the last date on which it may be performed. For any other non-emergency entry, Landlord will give at least 24 hours' notice. No advance notice is required for maintenance Tenant has requested. Landlord will not abuse the right of access or use it to harass Tenant.",
    entryCite: "Va. Code Ann. § 55.1-1229(A)",
  },

  earlyTermination: {
    military: {
      label: "Military service (Virginia law)",
      cite: "Va. Code Ann. § 55.1-1235",
      eligible:
        "A member of the Armed Forces of the United States, or a member of the National Guard serving on full-time duty or as a civil service technician with the National Guard, may terminate this Lease if the member (1) receives permanent change of station orders; (2) receives temporary duty orders of more than three months; (3) is discharged or released from active duty with the Armed Forces, or from full-time duty or technician status with the National Guard; (4) is ordered to report to government-supplied quarters, resulting in the forfeiture of basic allowance for quarters; or (5) receives a stop movement order in response to a local, national, or global emergency, effective for an indefinite period or for at least 30 days, that prevents the member from living in the Property.",
      notice:
        "Tenant serves on Landlord a written notice of termination stating an effective date that is at least 30 days after the first date on which the next rent payment is due after the notice is given.",
      documentation:
        "Before the termination date, Tenant gives Landlord a copy of the official notification of the orders or a signed letter from Tenant's commanding officer confirming the orders.",
      liability:
        "Tenant owes rent through the termination date. Landlord may not charge any liquidated damages, including the early termination fee. Tenant remains responsible for Tenant's duties under Va. Code § 55.1-1227, including damage to the Property beyond reasonable wear and tear.",
    },
    domesticViolence: {
      label: "Family abuse, sexual abuse or assault, stalking, or trafficking",
      cite: "Va. Code Ann. § 55.1-1236",
      eligible:
        "A Tenant who is a victim of family abuse (as defined in Va. Code § 16.1-228), sexual abuse (as defined in § 18.2-67.10) or other criminal sexual assault, stalking, or human trafficking may terminate Tenant's obligations under this Lease if, during the term of this Lease, (1) the victim obtained a protective order under Va. Code § 16.1-253.1, 16.1-279.1, 19.2-152.9, or 19.2-152.10 and gives notice while the order or any extension is in effect, or (2) a court entered an order convicting the perpetrator of, or a magistrate, law-enforcement agency, grand jury, or court issued a warrant, summons, information, or indictment charging a person with, one of those crimes against the victim. A conviction supports termination of the lease in effect when the conviction order is entered and of one later lease.",
      notice:
        "Termination is effective 28 days after Tenant serves a written notice of termination on Landlord.",
      documentation:
        "Tenant gives Landlord a copy of the protective order, or of the conviction order, warrant, summons, information, or indictment.",
      liability:
        "Tenant pays rent when due through the effective date of termination and keeps Tenant's duties under Va. Code § 55.1-1227 until then. Landlord may not charge any liquidated damages, including the early termination fee. Any co-tenants remain responsible for rent for the rest of the term. If the perpetrator is the only remaining tenant, Landlord may terminate this Lease and recover actual damages from the perpetrator.",
    },
    other: [
      {
        label: "Virginia National Guard on state active duty (state extension of the SCRA)",
        cite: "Va. Code Ann. § 44-102.1(A)",
        eligible:
          "A member of the Virginia National Guard called to active duty under Title 32 of the United States Code, or to state active duty by the Governor, under orders for 30 consecutive days or more has the same lease termination rights under the federal Servicemembers Civil Relief Act, 50 U.S.C. § 3955 (described above), as a member called to federal active duty.",
        notice:
          "Tenant delivers written notice of termination. For a lease with monthly rent, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered.",
        documentation: "The notice must include a copy of the military orders.",
        liability:
          "Tenant owes rent prorated to the termination date and no early termination fee. Rent paid in advance for any period after termination is refunded within 30 days.",
      },
      {
        label: "Fire or casualty damage",
        cite: "Va. Code Ann. § 55.1-1240",
        eligible:
          "If fire or casualty damages the Property so that Tenant's enjoyment of it is substantially impaired, or required repairs can only be made if Tenant vacates, Tenant may terminate this Lease.",
        notice:
          "Tenant vacates and, within 14 days after vacating, serves Landlord with written notice of the intent to terminate; this Lease ends on the date Tenant vacated. Beginning January 1, 2027, the notice period is 21 days.",
        documentation: "",
        liability:
          "Rent is prorated as of the date of the casualty. Landlord returns the security deposit under Va. Code § 55.1-1226 and any prepaid rent, unless Landlord reasonably believes Tenant, an authorized occupant, or a guest or invitee caused the damage, in which case Landlord provides a written statement and may recover actual damages.",
      },
      {
        label: "Serious hazard at the start of the tenancy",
        cite: "Va. Code Ann. § 55.1-1234.1",
        eligible:
          "If, at the beginning of the tenancy, a condition exists that is a fire hazard or a serious threat to the life, health, or safety of occupants, including a rodent infestation or a lack of heat, hot or cold running water, electricity, or adequate sewage disposal, Tenant may terminate this Lease.",
        notice:
          "Tenant gives Landlord written notice of the intent to terminate within seven days after the date possession was to transfer to Tenant.",
        documentation: "",
        liability:
          "Landlord refunds all deposits and rent paid within 15 business days after the later of delivery of the notice or Tenant vacating, unless Landlord gives Tenant written notice within 15 business days that it refuses the termination, with its reasons. No early termination fee is owed.",
      },
      {
        label: "Visible mold at move-in",
        cite: "Va. Code Ann. § 55.1-1215",
        eligible:
          "If Landlord's move-in inspection report states that there is visible evidence of mold in the Property, Tenant may choose to terminate the tenancy and not take possession, or not remain in possession.",
        notice:
          "Tenant tells Landlord of the choice after receiving the move-in report. If Tenant instead chooses to stay, Landlord will remediate the mold within five business days and give Tenant a new report.",
        documentation: "",
        liability: "No early termination fee is owed.",
      },
      {
        label: "Landlord's material noncompliance",
        cite: "Va. Code Ann. § 55.1-1234",
        eligible:
          "If Landlord materially fails to comply with this Lease, or fails to comply with the Virginia Residential Landlord and Tenant Act in a way that materially affects health and safety, Tenant may terminate this Lease, unless Tenant, an authorized occupant, or a guest caused the condition.",
        notice:
          "Tenant serves written notice describing the breach and stating that this Lease will terminate on a date at least 30 days after Landlord receives the notice if the breach is not remedied within 21 days. For a breach that cannot be remedied, or an intentional repeat of a breach of a like nature that Landlord previously remedied, the notice states that this Lease will terminate on a date at least 30 days after Landlord receives it.",
        documentation: "",
        liability:
          "No early termination fee is owed, and Landlord returns the security deposit under Va. Code § 55.1-1226.",
      },
      {
        label: "Unlawful entry or harassment by Landlord",
        cite: "Va. Code Ann. § 55.1-1210",
        eligible:
          "If Landlord makes an unlawful entry, a lawful entry in an unreasonable manner, or repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.",
        notice: "",
        documentation: "",
        liability: "No early termination fee is owed, and Tenant may recover actual damages and reasonable attorney fees.",
      },
      {
        label: "Unlawful exclusion or interruption of essential services",
        cite: "Va. Code Ann. § 55.1-1243.1",
        eligible:
          "If Landlord willfully and without court authority removes or excludes Tenant, interrupts an essential service, or makes the Property unsafe, Tenant may petition the general district court, which at the full hearing may terminate this Lease at Tenant's request.",
        notice: "",
        documentation: "",
        liability:
          "No early termination fee is owed. Landlord returns the full security deposit and is liable for actual damages, statutory damages of the greater of $5,000 or four months' rent, and reasonable attorney fees.",
      },
      {
        label: "Missing required disclosures (military air zone, defective drywall, methamphetamine)",
        cite: "Va. Code Ann. §§ 55.1-1217, 55.1-1218, 55.1-1219",
        eligible:
          "If Landlord was required to disclose before signing that the Property is in a military air installation noise zone or accident potential zone, has unremediated defective drywall known to Landlord, or was used to manufacture methamphetamine and not cleaned up as required, and did not, Tenant may terminate this Lease.",
        notice:
          "For a missing noise zone or accident potential zone disclosure, Tenant mails written notice by certified or registered mail, return receipt requested, during the first 30 days of the lease term. For drywall or methamphetamine, Tenant gives written notice within 60 days after discovering the condition. Termination is effective on the later of 15 days after the notice is mailed or the date through which rent has been paid, but no more than one month after mailing.",
        documentation: "",
        liability: "No early termination fee is owed.",
      },
      {
        label: "Death of the sole tenant",
        cite: "Va. Code Ann. § 55.1-1256",
        eligible:
          "If Tenant is the only tenant under this Lease, still lives in the Property, and dies, this Lease is deemed terminated as of the date of death.",
        notice:
          "Landlord gives at least 10 days' written notice to the person named in the rental application or this Lease as the authorized contact in the event of Tenant's death (or to Tenant at the Property if no one is named) that personal property not claimed within 10 days will be treated as abandoned. Authorized occupants must vacate before the end of that 10-day period.",
        documentation: "",
        liability:
          "Tenant's estate remains liable for Landlord's actual damages under Va. Code § 55.1-1251, which Landlord must mitigate, instead of the early termination fee.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "statute",
      cite: "Va. Code Ann. §§ 55.1-1251, 55.1-1249",
      rule:
        "If Tenant leaves early, Landlord shall mitigate its damages by making reasonable efforts to re-rent the Property. Landlord's claim for rent ends when a new tenancy begins, and Landlord will not seek a judgment for accelerated rent for the rest of the term after recovering possession.",
    },
  },

  disclosures: [
    {
      id: "tenant_rights_statement",
      title: "Statement of Tenant Rights and Responsibilities",
      text:
        "Landlord has provided Tenant, with this Lease, the Statement of Tenant Rights and Responsibilities developed by the Virginia Department of Housing and Community Development, and the parties sign the Department's form acknowledging that Tenant received it. Landlord will give Tenant a copy of this signed Lease and the Statement within 10 business days after this Lease takes effect.",
      cite: "Va. Code Ann. § 55.1-1204(B), (H)",
    },
    {
      id: "fee_disclosure",
      title: "Fee Disclosure Statement",
      text:
        "No additional security deposits or rent shall be charged unless they are listed below or incorporated into this agreement by way of a separate addendum after execution of this rental agreement. Security deposit: {{security_deposit}}. Rent per payment period: {{monthly_rent}} per month. Any one-time charges due before the start date or included in the first rent payment are itemized by Landlord on the first page of this Lease.",
      cite: "Va. Code Ann. § 55.1-1204.1",
    },
    {
      id: "owner_agent_identity",
      title: "Owner and Manager",
      text:
        "The person authorized to manage the Property, and the owner or person authorized to act for the owner for service of process and for receiving notices and demands, is {{landlord_name}}, {{landlord_address}}, unless Landlord identifies a different owner or manager in writing at or before the start of the tenancy. Landlord will keep this information current. If the Property is sold, Landlord will notify Tenant of the sale and give Tenant the purchaser's name, address, and telephone number.",
      cite: "Va. Code Ann. § 55.1-1216(A), (B), (D)",
    },
    {
      id: "mold",
      title: "Mold",
      text:
        "Landlord's written move-in inspection report states whether there is any visible evidence of mold in readily accessible interior areas of the Property. Landlord will maintain the Property to prevent the accumulation of moisture and the growth of mold, and Tenant shall promptly notify Landlord in writing of any visible mold or moisture accumulation. Where there is visible evidence of mold, Landlord will promptly remediate it and reinspect.",
      cite: "Va. Code Ann. §§ 55.1-1215, 55.1-1220(A)(5)",
    },
    {
      id: "military_air_installation",
      title: "Military Air Installation Noise or Accident Potential Zone",
      condition: "Only if the Property is in a locality where a military air installation is located",
      text:
        "Before Tenant signed this Lease, Landlord gave Tenant a written disclosure stating whether the Property is in a noise zone or accident potential zone, or both, as designated on the locality's official zoning map, and naming the zone.",
      cite: "Va. Code Ann. § 55.1-1217",
    },
    {
      id: "defective_drywall",
      title: "Defective Drywall",
      condition: "Only if Landlord knows the Property has defective drywall that has not been remediated",
      text: "Landlord discloses that the Property contains defective drywall, as defined in Va. Code § 36-156.1, that has not been remediated.",
      cite: "Va. Code Ann. § 55.1-1218",
    },
    {
      id: "methamphetamine",
      title: "Prior Methamphetamine Manufacture",
      condition: "Only if Landlord knows the Property was used to manufacture methamphetamine and has not been cleaned up as required",
      text:
        "Landlord discloses that the Property was previously used to manufacture methamphetamine and has not been cleaned up in accordance with the guidelines established under Va. Code § 32.1-11.7.",
      cite: "Va. Code Ann. § 55.1-1219",
    },
    {
      id: "conversion_or_displacement",
      title: "Planned Conversion or Displacement",
      condition:
        "Only for a multifamily property where an application to register it as a condominium or cooperative has been filed, or where there is, within six months, a plan for tenant displacement through demolition, substantial rehabilitation, or conversion",
      text:
        "Landlord discloses in writing any pending condominium or cooperative registration and any plan, within six months, to displace tenants through demolition or substantial rehabilitation of the property or its conversion to office, hotel, motel, or planned unit development use.",
      cite: "Va. Code Ann. § 55.1-1216(C)",
    },
    {
      id: "renters_insurance_flood",
      title: "Renter's Insurance and Flood Risk",
      condition: "Only if this Lease does not require Tenant to carry renter's insurance",
      text:
        "Landlord is not responsible for Tenant's personal property, and Landlord's insurance does not cover Tenant's personal property. If Tenant wishes to protect Tenant's personal property, Tenant should obtain renter's insurance. Renter's insurance does not cover flood damage. Tenant may contact the Federal Emergency Management Agency (FEMA), or visit the websites for FEMA's National Flood Insurance Program or the Virginia Department of Conservation and Recreation's Flood Risk Information System, to learn whether the Property is in a special flood hazard area.",
      cite: "Va. Code Ann. § 55.1-1206(D)",
    },
    {
      id: "submetering",
      title: "Submetering and Utility Allocation",
      condition:
        "Only if the Property uses energy submetering, energy allocation equipment, water and sewer submetering equipment, or a ratio utility billing system",
      text:
        "The Property uses submetering, energy allocation equipment, or a ratio utility billing system, and Tenant's share of those utility charges is determined by the method stated in the Utilities section of this Lease. Any monthly billing, account set-up, or move-out fees are limited to those stated in this Lease. A late charge on such a utility bill may not exceed $5.00 and may not be charged until at least 15 days after the bill is mailed or delivered.",
      cite: "Va. Code Ann. § 55.1-1212",
    },
    {
      id: "pesticide_notice",
      title: "Pesticide Application",
      text:
        "Landlord will give Tenant written notice at least 48 hours before applying an insecticide or pesticide in the Property, unless Tenant requested the application or agrees to a shorter period. A Tenant with concerns about a specific product shall notify Landlord in writing at least 24 hours before the scheduled application.",
      cite: "Va. Code Ann. § 55.1-1223",
    },
    {
      id: "carbon_monoxide",
      title: "Carbon Monoxide Alarm",
      text:
        "On Tenant's written request, Landlord will install a carbon monoxide alarm in the Property within 90 days and may charge Tenant a reasonable fee for the equipment and installation.",
      cite: "Va. Code Ann. § 55.1-1229(E)",
    },
  ],

  fairHousing: {
    stateClasses: ["elderliness (age 55 or older)", "source of funds", "sexual orientation", "gender identity", "military status"],
    cite: "Va. Code Ann. §§ 36-96.1:1, 36-96.3 (Virginia Fair Housing Law)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through an unlawful detainer action in general district court and a writ of eviction. Landlord will not remove or exclude Tenant, interrupt an essential service, refuse Tenant access, or take action to make the Property unsafe in order to regain possession.",
    cite: "Va. Code Ann. §§ 8.01-126, 55.1-1252, 55.1-1243.1",
  },

  habitability: {
    rule:
      "Landlord shall comply with applicable building and housing codes materially affecting health and safety, make all repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition, keep shared common areas clean and structurally safe, maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies, prevent moisture accumulation and mold growth, provide receptacles for and arrange removal of garbage and waste, and supply running water, reasonable amounts of hot water at all times, and reasonable air conditioning (if provided) and heat in season.",
    cite: "Va. Code Ann. § 55.1-1220",
  },

  sources: [
    { cite: "Va. Code Ann. §§ 55.1-1200 to 55.1-1262 (full chapter as of 2026-11-08)", url: "https://law.lis.virginia.gov/vacodefull/title55.1/chapter12/" },
    { cite: "Va. Code Ann. § 55.1-1200", url: VRLTA("55.1-1200") },
    { cite: "Va. Code Ann. § 55.1-1201", url: VRLTA("55.1-1201") },
    { cite: "Va. Code Ann. § 55.1-1202", url: VRLTA("55.1-1202") },
    { cite: "Va. Code Ann. § 55.1-1204 (both the current and July 1, 2027 versions)", url: VRLTA("55.1-1204") },
    { cite: "Va. Code Ann. § 55.1-1204.1", url: VRLTA("55.1-1204.1") },
    { cite: "Va. Code Ann. § 55.1-1206", url: VRLTA("55.1-1206") },
    { cite: "Va. Code Ann. § 55.1-1208", url: VRLTA("55.1-1208") },
    { cite: "Va. Code Ann. § 55.1-1210", url: VRLTA("55.1-1210") },
    { cite: "Va. Code Ann. § 55.1-1212", url: VRLTA("55.1-1212") },
    { cite: "Va. Code Ann. § 55.1-1214", url: VRLTA("55.1-1214") },
    { cite: "Va. Code Ann. § 55.1-1215", url: VRLTA("55.1-1215") },
    { cite: "Va. Code Ann. § 55.1-1216", url: VRLTA("55.1-1216") },
    { cite: "Va. Code Ann. § 55.1-1217", url: VRLTA("55.1-1217") },
    { cite: "Va. Code Ann. § 55.1-1218", url: VRLTA("55.1-1218") },
    { cite: "Va. Code Ann. § 55.1-1219", url: VRLTA("55.1-1219") },
    { cite: "Va. Code Ann. § 55.1-1220", url: VRLTA("55.1-1220") },
    { cite: "Va. Code Ann. § 55.1-1223", url: VRLTA("55.1-1223") },
    { cite: "Va. Code Ann. § 55.1-1226", url: VRLTA("55.1-1226") },
    { cite: "Va. Code Ann. § 55.1-1229", url: VRLTA("55.1-1229") },
    { cite: "Va. Code Ann. § 55.1-1234", url: VRLTA("55.1-1234") },
    { cite: "Va. Code Ann. § 55.1-1234.1", url: VRLTA("55.1-1234.1") },
    { cite: "Va. Code Ann. § 55.1-1235", url: VRLTA("55.1-1235") },
    { cite: "Va. Code Ann. § 55.1-1236", url: VRLTA("55.1-1236") },
    { cite: "Va. Code Ann. § 55.1-1240 (both the current and January 1, 2027 versions)", url: VRLTA("55.1-1240") },
    { cite: "Va. Code Ann. § 55.1-1243.1", url: VRLTA("55.1-1243.1") },
    { cite: "Va. Code Ann. § 55.1-1243.2", url: VRLTA("55.1-1243.2") },
    { cite: "Va. Code Ann. § 55.1-1245 (all three versions)", url: VRLTA("55.1-1245") },
    { cite: "Va. Code Ann. § 55.1-1249", url: VRLTA("55.1-1249") },
    { cite: "Va. Code Ann. § 55.1-1251", url: VRLTA("55.1-1251") },
    { cite: "Va. Code Ann. § 55.1-1252", url: VRLTA("55.1-1252") },
    { cite: "Va. Code Ann. § 55.1-1253", url: VRLTA("55.1-1253") },
    { cite: "Va. Code Ann. § 55.1-1256", url: VRLTA("55.1-1256") },
    { cite: "Va. Code Ann. § 44-102.1", url: LIS("44", "1", "44-102.1") },
    { cite: "Va. Code Ann. § 36-96.1:1", url: LIS("36", "5.1", "36-96.1:1") },
    { cite: "Va. Code Ann. § 36-96.3", url: LIS("36", "5.1", "36-96.3") },
    { cite: "Va. Code Ann. § 8.01-126", url: LIS("8.01", "3", "8.01-126") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "BUILDER GAP: § 55.1-1204.1 requires the fee disclosure statement (itemized security deposit, rent per period, and one-time charges due before commencement or with the first payment, preceded by the exact statutory sentence) to BEGIN ON THE FIRST PAGE of the written lease. The builder renders disclosures near the end, so the 'fee_disclosure' entry alone does not satisfy the statute. The builder needs a first-page block for VA, and the one-time charges need a data field.",
    "BUILDER GAP: § 55.1-1204(B), (H) require the DHCD Statement of Tenant Rights and Responsibilities to be given with the lease plus a signed DHCD acknowledgment form, and a copy of both within 10 business days. A landlord may not file or maintain any action (including unlawful detainer) for a lease violation until the Statement has been provided. Keycove should attach the current DHCD form to every VA lease packet.",
    "PAYMENTS (relevant to Keycove's Stripe rent collection): § 55.1-1204(J) requires landlords to accept rent and deposits by check and money order (with a receipt for cash or money order), bars any payment-processing fee unless the landlord offers a fee-free alternative method, and caps card/electronic convenience fees at the third-party processor's actual charge. Landlords with four or fewer units (or a 10% or smaller interest in four or fewer) need not accept cards. If Keycove passes card or ACH fees to Virginia tenants, a fee-free option must exist.",
    "§ 55.1-1204(K): a landlord owning more than four units (or more than a 10% interest in more than four) must give at least 60 days' written notice of a rent increase on renewal and of nonrenewal. From July 1, 2027 (2026 amendment, cc. 722/723/1066), the rent-increase notice becomes 90 days and must set a renewal deadline at least 30 days out. § 55.1-1253(B) separately requires 60 days' notice for mass nonrenewal of month-to-month tenancies in multifamily properties.",
    "Several sections have future versions: § 55.1-1240 (casualty, 21 days from 1/1/2027), §§ 55.1-1244 and 55.1-1258 (1/1/2027), and §§ 55.1-1202, -1203, -1204, -1209, -1212, -1245 (7/1/2027). The profile uses the text in effect on 2026-11-08 and mentions the 2027 casualty change in the lease text. The nonpayment notice is 14 days in all three versions of § 55.1-1245.",
    "Entry: the statute fixes 72 hours only for routine maintenance the tenant has not requested. Other non-emergency entries need 'notice' at reasonable times with no fixed period. The 24-hour period for other entries is contractual, chosen as a conservative default.",
    "Military: § 55.1-1235 (VRLTA) covers Armed Forces members and National Guard members on full-time duty or civil service technicians. Separately, § 44-102.1(A) extends federal SCRA rights to Virginia National Guard members on Title 32 or Governor-ordered state active duty for 30 or more consecutive days; it is listed under 'other'. The SCRA's own coverage conditions (for example, orders of 90 days or more for a lease signed during service) presumably still apply to the § 44-102.1 extension; attorney to confirm.",
    "Death of the sole tenant (§ 55.1-1256(C)): the statute deems the lease terminated by the landlord and leaves the estate liable for actual damages with a duty to mitigate. The profile treats this as replacing the liquidated early termination fee. Attorney to confirm the estate cannot be charged the fee.",
    "Early termination fee: Virginia has no statutory cap. § 55.1-1251 limits post-termination recovery to actual damages and bars a judgment for accelerated rent after possession. Attorney to confirm the builder's two-month liquidated-damages option is enforceable under Virginia liquidated damages and penalty case law. §§ 55.1-1235(C) and 55.1-1236(D) expressly bar liquidated damages for military and victim terminations.",
    "§ 55.1-1208 prohibits clauses requiring the tenant to pay the landlord's attorney fees except as the chapter provides, and § 55.1-1208(C) bars maintenance or repair fees unless caused by a tenant violation. § 55.1-1208(A)(8) bars pre-dispute SCRA waivers. The builder's general provisions comply, but any Keycove fee add-ons must be checked.",
    "No statutory late-fee grace period applies to a written lease. The 'late after the 5th' rule in § 55.1-1204(C)(4) applies only when the landlord does not offer a written lease.",
    "Holdover: § 55.1-1253(C) lets the lease set holdover liquidated damages of up to 150% of the per diem rent (per diem only for HUD-regulated units). The builder does not use this.",
    "Roomers are 'tenants' under § 55.1-1200, so the VRLTA applies in full to co-living room rentals. Hotels, motels, and boardinghouses are exempt only for stays of 90 consecutive days or less (§ 55.1-1201(D)).",
    "Local law: the VRLTA applies statewide and supersedes local landlord-tenant ordinances (§ 55.1-1201(A), (E)), except local property-maintenance codes, rental inspection programs, and lock/peephole ordinances (§ 55.1-1221). Virginia localities have no rent control.",
    "Fair housing: elderliness means age 55 or older. Military status covers uniformed service members, reserve components, veterans, and dependents. Source of funds is defined to include any assistance, benefit, or subsidy program, so housing vouchers are covered. The exemptions in § 36-96.2 (small private owners and the like) were NOT read; attorney to confirm which landlords are exempt.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
