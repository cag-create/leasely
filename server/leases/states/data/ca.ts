import type { StateLawProfile } from "../types";

export const CA: StateLawProfile = {
  code: "CA",
  name: "California",
  framework:
    "California Civil Code, Division 3, Part 4, Title 5, Chapter 2 (Hiring of Real Property, Cal. Civ. Code §§ 1940 et seq.), with unlawful detainer under Cal. Code Civ. Proc. §§ 1159 et seq.",

  deposit: {
    maxMonths: 1,
    capRule:
      "For security collected on or after July 1, 2024, Landlord may not demand or receive security, however denominated, of more than one month's rent in addition to the first month's rent. A landlord who is a natural person (including a family-trust settlor or beneficiary) or an LLC whose members are all natural persons, and who owns no more than two residential rental properties with no more than four dwelling units offered for rent in total, may take up to two months' rent, except that this small-landlord exception does not apply if the prospective tenant is a service member (Military and Veterans Code § 400), and Landlord may not refuse to rent to a service member because of it. The cap does not prohibit an advance payment of at least six months' rent on a lease of six months or longer. 'Security' includes any fee or charge imposed at the start of the tenancy to reimburse the landlord for processing a new tenant (other than an application screening fee under § 1950.6), and no security may be labeled nonrefundable. If Landlord charges a service member a higher-than-standard security because of credit or housing history, Landlord must explain why in writing at signing and return the extra amount after no more than six months if Tenant is not in arrears, with the return date stated in this Lease.",
    capCite: "Cal. Civ. Code § 1950.5(b), (c), (n)",
    returnDays: 21,
    returnRule:
      "No later than 21 calendar days after Tenant vacates, Landlord will furnish Tenant an itemized statement of the basis for, and amount of, any security received and its disposition, and will return any remaining balance. Landlord may deduct only amounts reasonably necessary for unpaid rent, repair of damage beyond ordinary wear and tear caused by Tenant or Tenant's guests or licensees, cleaning needed to return the unit to its move-in level of cleanliness, and, if this Lease authorizes it, restoring or replacing personal property or appurtenances, and may not deduct for conditions that preexisted the tenancy or for ordinary wear and tear. With the statement Landlord will include copies of bills, invoices, or receipts (or, for work by Landlord or Landlord's employees, a description of the work, the time spent, and the reasonable hourly rate) and the photographs required by law, unless repair and cleaning deductions together are $125 or less; Tenant may request the documentation within 14 days after receiving the statement. If repairs cannot be completed or documents obtained within 21 days, Landlord may deduct a good-faith estimate and must provide the final documentation within 14 days after completion or receipt. If Tenant paid the security or rent electronically, Landlord will return the balance electronically to an account Tenant designates in writing (or by another method agreed in writing). If multiple adult tenants reside in the unit and there is no other written agreement, the balance will be returned by a check payable to all adult tenants. A bad-faith retention may subject Landlord to statutory damages of up to twice the security in addition to actual damages.",
    returnCite: "Cal. Civ. Code § 1950.5(e), (g), (h), (m)",
    holdingRule:
      "Landlord holds the security for Tenant, and Tenant's claim to it is prior to the claim of any creditor of Landlord. If Landlord's interest in the Property ends, Landlord will within a reasonable time either transfer the remaining security to Landlord's successor and notify Tenant in writing of the transfer, any claims against the security, the amount transferred, and the successor's name, address, and telephone number, or return the remaining security to Tenant with an itemized accounting.",
    holdingCite: "Cal. Civ. Code § 1950.5(d), (i)",
    interestRequired: false,
    moveInInspection:
      "For tenancies beginning on or after July 1, 2025, Landlord will photograph the unit immediately before, or at the start of, the tenancy. Landlord will also photograph the unit within a reasonable time after possession is returned (before any repairs or cleaning to be deducted from the security) and again after those repairs or cleaning are completed. Within a reasonable time after either party gives notice of termination, or before the end of the Lease term, Landlord will notify Tenant in writing of Tenant's option to request an initial inspection, no earlier than two weeks before the tenancy ends, and of Tenant's right to be present. If Tenant requests one, Landlord will give at least 48 hours' written notice of the inspection and leave an itemized statement of proposed deductions, and Tenant may cure the listed items before moving out.",
  },

  lateFee: {
    graceDays: null,
    capType: "reasonable",
    capRule:
      "Any late fee must be a reasonable estimate of the damages Landlord actually suffers from late payment, because a liquidated-damages provision in a residential lease is void unless it would be impracticable or extremely difficult to fix Landlord's actual damages.",
    cite: "Cal. Civ. Code § 1671(c)(2), (d)",
  },

  notice: {
    monthToMonthDays: 60,
    monthToMonthRule:
      "Tenant may end a month-to-month tenancy by giving Landlord written notice at least 30 days before the termination date. Landlord must give at least 60 days' written notice if any tenant or resident has resided in the dwelling for one year or more, and at least 30 days' written notice if all have resided there for less than one year (or in the limited sale-to-owner-occupant case in Civil Code section 1946.1(d)). After all tenants have continuously and lawfully occupied the Property for 12 months, or any tenant for 24 months, Landlord may terminate only for a just cause stated in the notice under Civil Code section 1946.2 (or a stricter local ordinance), unless the Property is exempt; a no-fault termination requires one month's rent as relocation assistance or a waiver of the final month's rent. Notices must be served as Code of Civil Procedure section 1162 provides or by certified or registered mail, and Landlord may not charge a fee for serving any notice. Rent is due through the termination date.",
    monthToMonthCite: "Cal. Civ. Code §§ 1946, 1946.1, 1946.2",
    nonpaymentDays: 3,
    nonpaymentRule:
      "If rent is not paid when due, Landlord may serve a written notice requiring payment of the rent or surrender of possession within three days, excluding Saturdays, Sundays, and other judicial holidays. The notice must state the amount due and the name, telephone number, and address of the person to whom rent is to be paid (and, if payment may be made in person, the usual days and hours that person is available), or the name and street address of a financial institution within five miles where rent may be deposited, or that payment may be made by a previously established electronic funds transfer procedure. Landlord may not charge Tenant a fee for serving the notice.",
    nonpaymentCite: "Cal. Code Civ. Proc. §§ 1161(2), 1161(6), 1162",
    entryHours: 24,
    entryRule:
      "Landlord may enter only in an emergency; to make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show the unit to prospective or actual purchasers, mortgagees, tenants, workers, or contractors; to conduct a pre-move-out inspection under Civil Code section 1950.5(f); when Tenant has abandoned or surrendered the unit; under a court order; or for other purposes the Civil Code or Health and Safety Code allow. Except in an emergency, with Tenant's consent at the time of entry, or after abandonment or surrender, Landlord will give reasonable written notice stating the date, approximate time, and purpose of entry, and will enter only during normal business hours. Twenty-four hours' notice is presumed reasonable (six days if the notice is mailed). Landlord will not abuse the right of access or use it to harass Tenant.",
    entryCite: "Cal. Civ. Code § 1954",
  },

  earlyTermination: {
    military: {
      label: "Military service (California Military and Veterans Code)",
      cite: "Cal. Mil. & Vet. Code §§ 400, 409",
      eligible:
        "Tenant may terminate this Lease if Tenant is a service member, meaning a member of the California militia (the National Guard, State Guard, or Naval Militia) called or ordered into active state or federal service, or a member of an active or reserve component of the Armed Forces ordered into active duty under federal law, and either (a) Tenant enters a period of military service during the term of this Lease, or (b) while in military service, Tenant signs this Lease and then receives military orders for a permanent change of station or to deploy with a military unit, or as an individual in support of a military operation, for not less than 90 days. For a militia member, military service means full-time active state or federal service; for others, full-time active duty for more than seven days in any 14-day period.",
      notice:
        "Tenant delivers written notice of termination to Landlord or Landlord's agent by hand delivery, private business carrier, or mail with return receipt requested. For a lease with monthly rent, termination takes effect 30 days after the first date on which the next rental payment is due after the notice is delivered; for any other lease, on the last day of the month following the month in which the notice is delivered.",
      documentation:
        "The notice must include a copy of the service member's military orders, which may be official orders or any notification, certification, or verification from the commanding officer about current or future military duty status.",
      liability:
        "Unpaid rent for the period before the termination date is prorated. Landlord may not impose any early termination charge, but Tenant remains responsible for taxes, summonses, and other obligations due under this Lease at termination, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days. Termination also ends any obligation of Tenant's dependents under this Lease. Landlord may not withhold Tenant's property or security deposit to satisfy rent accruing after the termination date.",
    },
    domesticViolence: {
      label: "Domestic violence, sexual assault, stalking, human trafficking, elder abuse, or violent crime",
      cite: "Cal. Civ. Code § 1946.7",
      eligible:
        "Tenant may terminate this Lease if Tenant, a household member, or an immediate family member was the victim of domestic violence, sexual assault, stalking, human trafficking, abuse of an elder or dependent adult, a crime that caused bodily injury or death, a crime that included the exhibition, drawing, brandishing, or use of a firearm or other deadly weapon or instrument, or a crime that included the use or threat of force against the victim. Immediate family member means a parent, stepparent, spouse, child, child-in-law, stepchild, or sibling of Tenant, or anyone living in Tenant's household at the time of the act with a relationship substantially similar to a family member.",
      notice:
        "Tenant gives Landlord written notice within 180 days after the protective order was issued, the police report was made, or the act or crime occurred, or within the notice period that would otherwise apply under Civil Code section 1946.",
      documentation:
        "The notice must attach one of the following: a copy of a temporary restraining order, emergency protective order, or protective order protecting the victim; a copy of a written report by a peace officer stating that the victim filed a report; documentation from a qualified third party (a licensed health practitioner, domestic violence counselor, sexual assault counselor, human trafficking caseworker, or victim of violent crime advocate) in substantially the form set out in Civil Code section 1946.7(b)(3); or any other documentation that reasonably verifies the act or crime occurred. If the victim is an immediate family member who did not live with Tenant and no part of the act occurred within the unit or within 1,000 feet of it, Tenant must also attach a written statement that the family member was a victim, that Tenant intends to relocate as a result, and that Tenant is relocating to increase the safety, well-being, or financial security of Tenant or the family member.",
      liability:
        "Tenant owes rent for no more than 14 calendar days after giving the notice (or any shorter period under Civil Code section 1946 or this Lease), prorated if the unit is re-rented sooner, and is then released without penalty from any further rent or other payment obligation under this Lease. Landlord may not require Tenant to forfeit any security deposit or advance rent because of the termination, and the termination is not a breach of this Lease. Other tenants who are not the victim tenant or members of the victim tenant's household remain bound by this Lease. Landlord will keep the information Tenant provides confidential except with Tenant's written consent or as required by law or court order.",
    },
    other: [
      {
        label: "Untenantable conditions Landlord fails to repair",
        cite: "Cal. Civ. Code §§ 1941, 1941.1, 1942",
        eligible:
          "If, within a reasonable time after written or oral notice to Landlord or Landlord's agent, Landlord neglects to repair dilapidations that make the Property untenantable and that Landlord is required to repair, Tenant may vacate the Property instead of repairing and deducting. Action after 30 days following notice is presumed to be after a reasonable time. This remedy is not available more than twice in any 12-month period, or if the condition was caused by Tenant's violation of Civil Code section 1929 or 1941.2.",
        notice: "Tenant gives the repair notice to Landlord and then vacates the Property.",
        documentation: "",
        liability:
          "Tenant is discharged from further payment of rent and performance of other conditions of this Lease as of the date Tenant vacates.",
      },
      {
        label: "Destruction of the Property",
        cite: "Cal. Civ. Code §§ 1932(2), 1933(4), 1941.9",
        eligible:
          "Tenant may terminate this Lease if the greater part of the Property, or the part that was the material inducement to Tenant to enter into this Lease, is destroyed from any cause other than Tenant's lack of ordinary care. This Lease ends automatically if the Property is destroyed.",
        notice:
          "Termination is effective on the date Tenant informs Landlord of Tenant's intent to terminate, or on the date the Property was destroyed.",
        documentation: "",
        liability:
          "Landlord will return any advance rent covering any period after the termination date within 21 days, sent to the address Tenant provides (or to the unit if none). Separately, Tenant owes no rent for any period during which Tenant cannot occupy the unit because of a mandatory evacuation order due to a disaster, and Landlord will refund rent already paid for that period within 10 calendar days after the order is lifted, or Tenant may deduct it from the next month's rent.",
      },
      {
        label: "Landlord's failure to place Tenant in quiet possession or repair",
        cite: "Cal. Civ. Code § 1932(1)",
        eligible:
          "Tenant may terminate this Lease if Landlord does not, within a reasonable time after Tenant's request, fulfill Landlord's obligations to place and secure Tenant in quiet possession of the Property, put it into good condition, or repair it.",
        notice: "Tenant may terminate after making the request and allowing a reasonable time for Landlord to perform.",
        documentation: "",
        liability: "Tenant owes rent only through the termination date.",
      },
    ],
    feeCap: {
      maxMonthsRent: null,
      rule:
        "A fixed early termination fee or other liquidated-damages provision in a residential lease is void unless, from the nature of the case, it would be impracticable or extremely difficult to fix Landlord's actual damages. If Tenant breaches and abandons the Property, Landlord's recovery is limited to the damages allowed by Civil Code section 1951.2, reduced by any rental loss Tenant proves could reasonably have been avoided.",
      cite: "Cal. Civ. Code §§ 1671(c)(2), (d); 1951.2",
    },
    mitigation: {
      basis: "statute",
      cite: "Cal. Civ. Code § 1951.2",
      rule:
        "If Tenant breaches this Lease and abandons the Property, or Landlord terminates Tenant's right to possession because of Tenant's breach, this Lease ends and Landlord may recover unpaid rent earned to the termination date, plus rent that would have been earned afterward only to the extent it exceeds the rental loss Tenant proves could have been reasonably avoided, plus other damages proximately caused by Tenant's breach. Landlord will make reasonable, good-faith efforts to re-rent the Property and will credit rent received from a replacement tenant.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner, Manager, and Rent Payment Information",
      text:
        "The person authorized to manage the Property, and the owner or person authorized to act for the owner for service of process and for receiving and receipting for notices and demands, is {{landlord_name}}, telephone {{landlord_phone}}, whose usual street address for personal service is {{landlord_address}}. Rent is payable to {{landlord_name}}, telephone {{landlord_phone}}, at {{landlord_address}}, in the following form(s): {{payment_methods}}. If rent may be paid in person, Landlord will state in writing the usual days and hours someone is available to receive it. Landlord will provide Tenant a copy of this Lease within 15 days after Tenant signs it and, once each calendar year on request, another copy within 15 days. Landlord will keep this information current.",
      cite: "Cal. Civ. Code § 1962",
    },
    {
      id: "rent_payment_methods",
      title: "Rent Payment Methods",
      text:
        "Landlord will allow Tenant to pay rent and the security deposit by at least one form of payment that is neither cash nor electronic funds transfer, and will not charge a fee for payment by check. Landlord may require cash only for up to three months after a check from Tenant is dishonored or payment is stopped, and only after giving written notice with a copy of the dishonored instrument. Landlord will accept rent paid on Tenant's behalf by a third party who signs a written acknowledgment that the third party is not a tenant and that acceptance does not create a new tenancy.",
      cite: "Cal. Civ. Code § 1947.3",
    },
    {
      id: "rent_cap_just_cause_notice",
      title: "Rent Cap and Just Cause Notice",
      condition: "Required (in at least 12-point type) for any Property subject to Civil Code sections 1946.2 and 1947.12",
      text:
        "California law limits the amount your rent can be increased. See Section 1947.12 of the Civil Code for more information. California law also provides that after all of the tenants have continuously and lawfully occupied the property for 12 months or more or at least one of the tenants has continuously and lawfully occupied the property for 24 months or more, a landlord must provide a statement of cause in any notice to terminate a tenancy. See Section 1946.2 of the Civil Code for more information.",
      cite: "Cal. Civ. Code §§ 1946.2(f), 1947.12",
    },
    {
      id: "rent_cap_just_cause_exemption",
      title: "Exemption from Rent Cap and Just Cause",
      condition:
        "Only if the Property is a separately alienable unit (such as a single-family home or condominium) and the owner is not a real estate investment trust, a corporation, or a limited liability company in which at least one member is a corporation; the exemption is available only if this statement is in the Lease",
      text:
        "This property is not subject to the rent limits imposed by Section 1947.12 of the Civil Code and is not subject to the just cause requirements of Section 1946.2 of the Civil Code. This property meets the requirements of Sections 1947.12 (d)(5) and 1946.2 (e)(8) of the Civil Code and the owner is not any of the following: (1) a real estate investment trust, as defined by Section 856 of the Internal Revenue Code; (2) a corporation; or (3) a limited liability company in which at least one member is a corporation.",
      cite: "Cal. Civ. Code §§ 1946.2(e)(8), 1947.12(d)(5)",
    },
    {
      id: "gross_rent_and_concessions",
      title: "Gross Rent and Concessions",
      condition: "For any Property subject to Civil Code section 1947.12",
      text:
        "The gross monthly rental rate and any discounts, incentives, concessions, or credits offered by Landlord and accepted by Tenant are separately listed and identified in this Lease.",
      cite: "Cal. Civ. Code § 1947.12(a)(1)",
    },
    {
      id: "megans_law",
      title: "Megan's Law Notice",
      text:
        "Notice: Pursuant to Section 290.46 of the Penal Code, information about specified registered sex offenders is made available to the public via an Internet Web site maintained by the Department of Justice at www.meganslaw.ca.gov. Depending on an offender's criminal history, this information will include either the address at which the offender resides or the community of residence and ZIP Code in which the offender resides.",
      cite: "Cal. Civ. Code § 2079.10a(a)(3)",
    },
    {
      id: "flood_zone_known",
      title: "Flood Hazard Area",
      condition:
        "Only if Landlord has actual knowledge (including written notice from a public agency, a mortgage holder requiring flood insurance, or currently carrying flood insurance) that the Property is in a special flood hazard area or an area of potential flooding",
      text: "The Property is located in a special flood hazard area or an area of potential flooding.",
      cite: "Cal. Gov. Code § 8589.45(a)(1)",
    },
    {
      id: "flood_hazard_information",
      title: "Flood and Hazard Information",
      text:
        "Tenant may obtain information about hazards, including flood hazards, that may affect the Property from the Office of Emergency Services MyHazards tool at https://myhazards.caloes.ca.gov/. Landlord's insurance does not cover the loss of Tenant's personal possessions, and it is recommended that Tenant consider purchasing renter's insurance and flood insurance to insure Tenant's possessions from loss due to fire, flood, or other risk of loss. Landlord is not required to provide additional information concerning the flood hazards to the Property, and the information provided in this Lease is deemed adequate to inform Tenant.",
      cite: "Cal. Gov. Code § 8589.45(a)(2)-(4)",
    },
    {
      id: "bed_bugs",
      title: "Information about Bed Bugs",
      text:
        "Bed bug appearance: Bed bugs have six legs. Adult bed bugs have flat bodies about 1/4 of an inch in length. Their color can vary from red and brown to copper colored. Young bed bugs are very small. Their bodies are about 1/16 of an inch in length. They have almost no color. When a bed bug feeds, its body swells, may lengthen, and becomes bright red, sometimes making it appear to be a different insect. Bed bugs do not fly. They can either crawl or be carried from place to place on objects, people, or animals. Bed bugs can be hard to find and identify because they are tiny and try to stay hidden. Life cycle and reproduction: An average bed bug lives for about 10 months. Female bed bugs lay one to five eggs per day. Bed bugs grow to full adulthood in about 21 days. Bed bugs can survive for months without feeding. Bed bug bites: Because bed bugs usually feed at night, most people are bitten in their sleep and do not realize they were bitten. A person's reaction to insect bites is an immune response and so varies from person to person. Sometimes the red welts caused by the bites will not be noticed until many days after a person was bitten, if at all. Common signs and symptoms of a possible bed bug infestation: small red to reddish brown fecal spots on mattresses, box springs, bed frames, linens, upholstery, or walls; molted bed bug skins, white, sticky eggs, or empty eggshells; very heavily infested areas may have a characteristically sweet odor; and red, itchy bite marks, especially on the legs, arms, and other body parts exposed while sleeping, although some people do not show bed bug lesions on their bodies even though bed bugs may have fed on them. For more information, see the Internet Web sites of the United States Environmental Protection Agency and the National Pest Management Association. Cooperation between Landlord and Tenant is important for prevention and treatment. Reporting: Tenant should promptly report any suspected bed bug infestation to Landlord in writing at the address for notices in this Lease.",
      cite: "Cal. Civ. Code § 1954.603",
    },
    {
      id: "smoking_policy",
      title: "Smoking Policy",
      condition: "Only if Landlord prohibits smoking of cigarettes or other tobacco products on any portion of the property",
      text:
        "Smoking of cigarettes and other tobacco products is prohibited in the areas of the property specified in this Lease's smoking policy.",
      cite: "Cal. Civ. Code § 1947.5(b)(1)",
    },
    {
      id: "shared_utility_meter",
      title: "Shared Gas or Electric Meter",
      condition:
        "Only if Landlord knows that gas or electric service through Tenant's meter serves an area outside Tenant's dwelling unit",
      text:
        "Gas or electric service provided through Tenant's meter serves an area outside Tenant's dwelling unit. Landlord and Tenant have made a separate mutual written agreement for payment of the cost of that service, which may include Landlord becoming the customer of record for Tenant's meter or separately metering the outside area.",
      cite: "Cal. Civ. Code § 1940.9",
    },
    {
      id: "demolition_permit",
      title: "Notice of Demolition Permit Application",
      condition: "Only if the owner or owner's agent has applied for a permit to demolish the dwelling unit",
      text:
        "The owner has applied to a public agency for a permit to demolish the dwelling unit. Landlord's separate written notice, delivered before this Lease was signed and before any fees were accepted, states the earliest possible approximate date on which the demolition is expected to occur and the approximate date on which Landlord will terminate the tenancy. The demolition will not occur before that noticed date.",
      cite: "Cal. Civ. Code § 1940.6",
    },
    {
      id: "military_ordnance",
      title: "Former Military Ordnance Location",
      condition:
        "Only if Landlord has actual knowledge of a former federal or state ordnance location within one mile of the Property",
      text:
        "Landlord has actual knowledge that a former federal or state ordnance location, meaning an area identified by a federal or state agency as once used for military training purposes that may contain potentially explosive munitions, is located within one mile of the Property.",
      cite: "Cal. Civ. Code § 1940.7",
    },
    {
      id: "pest_control_notice",
      title: "Periodic Pest Control Notice",
      condition: "Only if a contract for periodic pest control service has been executed for the Property",
      text:
        "Landlord has provided Tenant a copy of the notice given by the registered structural pest control company under Business and Professions Code section 8538.",
      cite: "Cal. Civ. Code § 1940.8",
    },
    {
      id: "mold",
      title: "Mold Disclosure",
      condition:
        "Only if Landlord knows or has reasonable cause to believe that mold affecting the unit or building exceeds permissible exposure limits or poses a health threat and has not been remediated under state guidelines",
      text:
        "Landlord discloses that mold is present that affects the unit or the building. Landlord has provided Tenant written information about the potential health risks and health impacts of mold exposure.",
      cite: "Cal. Health & Safety Code §§ 26147, 26148",
    },
    {
      id: "tenant_refrigerator",
      title: "Tenant-Provided Refrigerator",
      condition: "Only if Tenant asks to provide and maintain Tenant's own refrigerator (not available as a condition of tenancy)",
      text:
        "Under state law, the landlord is required to provide a refrigerator in good working order in your unit. By checking this box, you acknowledge that you have asked to bring your own refrigerator and that you are responsible for keeping that refrigerator in working order. Tenant may, with 30 days' written notice, inform Landlord that Tenant no longer wishes to keep Tenant's own refrigerator in the unit, and at the end of the 30-day notice period Landlord will install a refrigerator in good working order in the unit.",
      cite: "Cal. Civ. Code § 1941.1(a)(11)(B)",
    },
    {
      id: "positive_rent_reporting",
      title: "Offer of Positive Rent Reporting",
      condition:
        "Only for a landlord of a building with 16 or more units, or of a building with 15 or fewer units if the landlord owns more than one residential rental building and is a REIT, a corporation, or an LLC with at least one corporate member (assisted housing developments follow Civil Code section 1954.06 instead)",
      text:
        "Landlord offers Tenant the option of having Tenant's positive rental payment information (complete, timely rent payments) reported to at least one nationwide consumer reporting agency. Reporting is optional, and Tenant may opt in at any time by returning the separate written election form Landlord provides, and may opt out at any time, but may not resume reporting for at least six months after opting out. If Tenant elects reporting, Landlord may charge a fee of no more than the lesser of Landlord's actual cost or $10 per month (nothing if Landlord has no actual cost). Nonpayment of that fee is not a ground for terminating the tenancy and will not be deducted from the security deposit. Landlord will repeat this offer at least once a year.",
      cite: "Cal. Civ. Code § 1954.07",
    },
    {
      id: "service_member_security",
      title: "Additional Security for a Service Member",
      condition:
        "Only if Landlord charges a service member tenant a higher than standard or advertised security because of credit history, credit score, housing history, or another tenant-related factor",
      text:
        "Landlord has given Tenant a separate written statement, on or before the date this Lease is signed, of the amount of the higher security and the reason it is charged. The additional amount of security above the standard amount will be returned to Tenant on the date stated in this Lease, which is no later than six months after the start of Tenant's residency, if Tenant is not in arrears for any rent due during that period.",
      cite: "Cal. Civ. Code § 1950.5(c)(4)",
    },
    {
      id: "automatic_renewal",
      title: "Automatic Renewal Provision",
      condition:
        "Only if this Lease renews or extends automatically when Tenant stays in possession or does not give notice of non-renewal; the provision must appear in at least 8-point boldface type in the body of the Lease, with a recital in at least 8-point boldface type immediately before Tenant's signature",
      text:
        "This Lease contains an automatic renewal or extension provision in the body of the agreement.",
      cite: "Cal. Civ. Code § 1945.5",
    },
  ],

  fairHousing: {
    stateClasses: [
      "gender",
      "gender identity",
      "gender expression",
      "sexual orientation",
      "marital status",
      "ancestry",
      "source of income (including federal, state, or local housing assistance such as Section 8 and VASH vouchers)",
      "veteran or military status",
      "genetic information",
      "medical condition",
      "citizenship",
      "primary language",
      "immigration status",
    ],
    cite: "Cal. Gov. Code § 12955; Cal. Civ. Code § 51 (Unruh Civil Rights Act); Cal. Civ. Code §§ 1940.05, 1940.3",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through an unlawful detainer action under Code of Civil Procedure sections 1159 et seq., after the notice required by law and, where Civil Code section 1946.2 or a local ordinance applies, only for just cause. Landlord will not, with intent to terminate Tenant's occupancy, willfully interrupt any utility service, change the locks or otherwise block Tenant's access, remove outside doors or windows, or remove Tenant's property or furnishings without Tenant's prior written consent.",
    cite: "Cal. Code Civ. Proc. § 1161; Cal. Civ. Code §§ 789.3, 1946.2",
  },

  habitability: {
    rule:
      "Landlord will put the Property into a condition fit for occupation and repair all later dilapidations that make it untenantable (except those caused by Tenant), including providing effective waterproofing and weather protection; plumbing, gas, heating, and electrical facilities that conformed to law when installed and are maintained in good working order; hot and cold running water connected to an approved sewage system; clean and sanitary building and grounds free of debris, rodents, and vermin at the start of the tenancy and in areas under Landlord's control; adequate garbage receptacles; floors, stairways, and railings in good repair; and, for leases entered into, amended, or extended on or after January 1, 2026 (except in certain shared-kitchen, single-room-occupancy, and supportive housing), a stove and a refrigerator maintained in good working order, with any recalled stove or refrigerator repaired or replaced within 30 days after Landlord receives notice of the recall.",
    cite: "Cal. Civ. Code §§ 1941, 1941.1",
  },

  sources: [
    { cite: "Cal. Civ. Code § 1940", url: "https://california.public.law/codes/civil_code_section_1940" },
    { cite: "Cal. Civ. Code § 1940.05", url: "https://california.public.law/codes/civil_code_section_1940.05" },
    { cite: "Cal. Civ. Code § 1940.2", url: "https://california.public.law/codes/civil_code_section_1940.2" },
    { cite: "Cal. Civ. Code § 1940.3", url: "https://california.public.law/codes/civil_code_section_1940.3" },
    { cite: "Cal. Civ. Code § 1940.35", url: "https://california.public.law/codes/civil_code_section_1940.35" },
    { cite: "Cal. Civ. Code § 1940.6", url: "https://california.public.law/codes/civil_code_section_1940.6" },
    { cite: "Cal. Civ. Code § 1940.7", url: "https://california.public.law/codes/civil_code_section_1940.7" },
    { cite: "Cal. Civ. Code § 1940.8", url: "https://california.public.law/codes/civil_code_section_1940.8" },
    { cite: "Cal. Civ. Code § 1940.9", url: "https://california.public.law/codes/civil_code_section_1940.9" },
    { cite: "Cal. Civ. Code § 1941", url: "https://california.public.law/codes/civil_code_section_1941" },
    { cite: "Cal. Civ. Code § 1941.1 (updated Jan. 1, 2026)", url: "https://california.public.law/codes/civil_code_section_1941.1" },
    { cite: "Cal. Civ. Code § 1941.5", url: "https://california.public.law/codes/civil_code_section_1941.5" },
    { cite: "Cal. Civ. Code § 1941.9 (updated Jan. 1, 2026)", url: "https://california.public.law/codes/civil_code_section_1941.9" },
    { cite: "Cal. Civ. Code § 1942", url: "https://california.public.law/codes/civil_code_section_1942" },
    { cite: "Cal. Civ. Code § 1932", url: "https://california.public.law/codes/civil_code_section_1932" },
    { cite: "Cal. Civ. Code § 1933", url: "https://california.public.law/codes/civil_code_section_1933" },
    { cite: "Cal. Civ. Code § 1945.5", url: "https://california.public.law/codes/civil_code_section_1945.5" },
    { cite: "Cal. Civ. Code § 1946", url: "https://california.public.law/codes/civil_code_section_1946" },
    { cite: "Cal. Civ. Code § 1946.1", url: "https://california.public.law/codes/civil_code_section_1946.1" },
    { cite: "Cal. Civ. Code § 1946.2 (updated Jan. 1, 2026)", url: "https://california.public.law/codes/civil_code_section_1946.2" },
    { cite: "Cal. Civ. Code § 1946.5", url: "https://california.public.law/codes/civil_code_section_1946.5" },
    { cite: "Cal. Civ. Code § 1946.7", url: "https://california.public.law/codes/civil_code_section_1946.7" },
    { cite: "Cal. Civ. Code § 1946.8", url: "https://california.public.law/codes/civil_code_section_1946.8" },
    { cite: "Cal. Civ. Code § 1946.9", url: "https://california.public.law/codes/civil_code_section_1946.9" },
    { cite: "Cal. Civ. Code § 1947.3", url: "https://california.public.law/codes/civil_code_section_1947.3" },
    { cite: "Cal. Civ. Code § 1947.5", url: "https://california.public.law/codes/civil_code_section_1947.5" },
    { cite: "Cal. Civ. Code § 1947.12", url: "https://california.public.law/codes/civil_code_section_1947.12" },
    { cite: "Cal. Civ. Code § 1950.5 (updated Jan. 1, 2026)", url: "https://california.public.law/codes/civil_code_section_1950.5" },
    { cite: "Cal. Civ. Code § 1951.2", url: "https://california.public.law/codes/civil_code_section_1951.2" },
    { cite: "Cal. Civ. Code § 1953", url: "https://california.public.law/codes/civil_code_section_1953" },
    { cite: "Cal. Civ. Code § 1954", url: "https://california.public.law/codes/civil_code_section_1954" },
    { cite: "Cal. Civ. Code § 1954.06", url: "https://california.public.law/codes/civil_code_section_1954.06" },
    { cite: "Cal. Civ. Code § 1954.07", url: "https://california.public.law/codes/civil_code_section_1954.07" },
    { cite: "Cal. Civ. Code § 1954.603", url: "https://california.public.law/codes/civil_code_section_1954.603" },
    { cite: "Cal. Civ. Code § 1962", url: "https://california.public.law/codes/civil_code_section_1962" },
    { cite: "Cal. Civ. Code § 2079.10a", url: "https://california.public.law/codes/civil_code_section_2079.10a" },
    { cite: "Cal. Civ. Code § 1632 (subdivisions (b) and (h) reviewed)", url: "https://california.public.law/codes/civil_code_section_1632" },
    { cite: "Cal. Civ. Code § 1671", url: "https://california.public.law/codes/civil_code_section_1671" },
    { cite: "Cal. Civ. Code § 789.3", url: "https://california.public.law/codes/civil_code_section_789.3" },
    { cite: "Cal. Civ. Code § 827", url: "https://california.public.law/codes/civil_code_section_827" },
    { cite: "Cal. Civ. Code § 51", url: "https://california.public.law/codes/civil_code_section_51" },
    { cite: "Cal. Code Civ. Proc. § 1161", url: "https://california.public.law/codes/code_of_civil_procedure_section_1161" },
    { cite: "Cal. Code Civ. Proc. § 1162", url: "https://california.public.law/codes/code_of_civil_procedure_section_1162" },
    { cite: "Cal. Gov. Code § 8589.45", url: "https://california.public.law/codes/government_code_section_8589.45" },
    { cite: "Cal. Gov. Code § 12955", url: "https://california.public.law/codes/government_code_section_12955" },
    { cite: "Cal. Health & Safety Code § 26147", url: "https://california.public.law/codes/health_and_safety_code_section_26147" },
    { cite: "Cal. Health & Safety Code § 26148", url: "https://california.public.law/codes/health_and_safety_code_section_26148" },
    { cite: "Cal. Mil. & Vet. Code § 120", url: "https://california.public.law/codes/military_and_veterans_code_section_120" },
    { cite: "Cal. Mil. & Vet. Code § 400", url: "https://california.public.law/codes/military_and_veterans_code_section_400" },
    { cite: "Cal. Mil. & Vet. Code § 406", url: "https://california.public.law/codes/military_and_veterans_code_section_406" },
    { cite: "Cal. Mil. & Vet. Code § 409", url: "https://california.public.law/codes/military_and_veterans_code_section_409" },
    { cite: "Cal. Mil. & Vet. Code § 409.5", url: "https://california.public.law/codes/military_and_veterans_code_section_409.5" },
  ],

  reviewNotes: [
    "Source note: leginfo.legislature.ca.gov returned a Cloudflare bot challenge to curl, so every section was read on california.public.law, which reproduces the official text and shows each section's leginfo update date (e.g., § 1950.5, § 1946.2, § 1941.1, and § 1941.9 updated Jan. 1, 2026). Please spot-check § 1950.5 and § 1946.2 against leginfo before launch.",
    "Deposit cap (AB 12, § 1950.5(c)): one month for most landlords; two months only for natural-person/natural-person-LLC owners of no more than two properties and four units, and never for service members. The builder needs an owner-eligibility question; maxMonths is set to 1. § 1950.5(b) also counts move-in 'processing' fees and advance rent as security, so pet deposits, move-in fees, and similar charges all count toward the cap and cannot be called nonrefundable (§ 1950.5(n)).",
    "Month-to-month notice: monthToMonthDays is set to 60 because a landlord must give 60 days once anyone has lived there a year (30 days before that). Tenants need give only 30 days. If the builder uses one number for both parties, the tenant side would be overstated; render monthToMonthRule instead.",
    "AB 1482: the 12-point notice in § 1946.2(f)(3) is required in the lease or a signed addendum for every non-exempt tenancy, and the exemption statement in § 1946.2(e)(8)/§ 1947.12(d)(5) must be IN the lease for the single-family/condo exemption to work. The builder must ask whether the property is exempt (15-year certificate of occupancy, owner-occupied duplex, shared kitchen/bath with owner, single-family/condo not owned by a REIT/corporation/corporate LLC, deed-restricted affordable). § 1946.2 and § 1947.12 sunset January 1, 2030. § 1947.12(a)(1) requires gross rent and any concessions to be separately listed in the lease. Rent-increase notice is 30 days (10% or less over 12 months) or 90 days (over 10%) under § 827(b).",
    "Payment-method conflict for Keycove: § 1947.3 requires landlords to accept at least one form of payment that is neither cash nor electronic funds transfer (for example, check or money order) and voids any waiver. A Stripe-only rent requirement cannot be imposed in California.",
    "Late fees: no statute sets a grace period or cap. Under § 1671(d), a residential-lease liquidated-damages clause is void unless actual damages would be impracticable or extremely difficult to fix; courts (e.g., Orozco v. Casimiro (2004) 121 Cal.App.4th Supp. 7, not read here) have applied this to flat late fees. The common 5-6% fee is a business judgment call, not a statutory safe harbor. The same § 1671(d) rule makes a fixed lease-break fee risky; recorded as feeCap with maxMonthsRent null.",
    "State military statute: Mil. & Vet. Code § 409 mirrors the SCRA lease-termination right and extends it to California National Guard, State Guard, and Naval Militia members on full-time active STATE service (which the federal SCRA does not cover). Mil. & Vet. Code § 406 separately bars eviction of a service member's dependents during military service and for 120 days after, except with leave of court.",
    "§ 1946.7 is broad: it covers immediate family members who do not live with the tenant (with an extra written statement), violent crimes generally, and 'any other form of documentation that reasonably verifies' the act. Rent is capped at 14 days after notice. § 1941.5/1941.6 also require the landlord to change locks within 24 hours on request with documentation. § 1946.8 voids any lease term limiting a tenant's right to call police or emergency help; do not include nuisance or crime-free clauses that penalize calls for help.",
    "Translation: under § 1632, if the lease is negotiated primarily in Spanish, Chinese, Tagalog, Vietnamese, or Korean, the landlord must give a translated copy before signing (the § 1946.2 notice and § 8589.45 flood disclosure are expressly subject to § 1632). Keycove should either detect this or warn landlords.",
    "Mold (H&S §§ 26147-26148): by their terms these apply only after the Department of Public Health adopts exposure standards and a consumer booklet; I could not confirm from statute text whether those triggers have occurred. Encoded as a conditional known-mold disclosure; attorney should confirm whether a booklet must be handed out.",
    "Megan's Law notice (§ 2079.10a) is literally required for single-family leases and buildings with more than four units; it is included for all CA leases as standard practice. The 'smoking_policy' disclosure needs a landlord-entered list of non-smoking areas; the builder has no field for it yet.",
    "Placeholders used in the § 1962 disclosure ({{landlord_name}}, {{landlord_phone}}, {{landlord_address}}, {{payment_methods}}) must be confirmed against KNOWN_PLACEHOLDERS once builder.ts exists. § 1962 requires an address where personal service can be made; a P.O. box does not satisfy it.",
    "Lodgers: a single lodger in an owner-occupied home can be removed after notice under § 1946.5 and Penal Code § 602.3; this matters for the co-living template (more than one lodger is not covered). Owner-occupied homes renting one or two rooms are also exempt from § 1946.2 and § 1947.12.",
    "Local law warnings (not encoded): about 30 California cities and counties have rent control and/or just-cause ordinances that override or add to AB 1482, including Los Angeles (RSO and Just Cause Ordinance, relocation fees), unincorporated Los Angeles County, San Francisco, Oakland, Berkeley, Santa Monica, West Hollywood, San Jose, East Palo Alto, Richmond, Mountain View, Alameda, Hayward, Pasadena, Culver City, Inglewood, Sacramento, San Diego (tenant protection ordinance), Long Beach, and others. Several (e.g., SF, LA, Santa Monica, Berkeley) require interest on deposits, specific lease addenda, or registry disclosures. Prop. 65 warnings may also apply to landlords with 10 or more employees.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
