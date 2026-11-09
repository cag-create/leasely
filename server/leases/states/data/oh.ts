import type { StateLawProfile } from "../types";

const ORC = (s: string) => `https://codes.ohio.gov/ohio-revised-code/section-${s}`;

export const OH: StateLawProfile = {
  code: "OH",
  name: "Ohio",
  framework:
    "Ohio Landlords and Tenants Act, Ohio Rev. Code chapter 5321, with eviction by forcible entry and detainer under Ohio Rev. Code chapter 1923",

  deposit: {
    maxMonths: null,
    capRule:
      "Ohio sets no limit on the amount of a security deposit. A security deposit is any deposit of money or property to secure Tenant's performance under this Lease. Interest is owed on any part of the deposit that exceeds $50 or one month's rent, whichever is greater, as described below.",
    capCite: null,
    returnDays: 30,
    returnRule:
      "Within 30 days after this Lease terminates and Tenant delivers possession, Landlord will deliver to Tenant a written notice itemizing and identifying any deductions from the security deposit, together with the amount due. Landlord may deduct only past-due rent and the amount of damages Landlord has suffered because of Tenant's failure to comply with Ohio Rev. Code § 5321.05 or this Lease. Tenant must give Landlord a forwarding or new address in writing; if Tenant does not, Tenant is not entitled to the statutory damages or attorney's fees for late return. If Landlord fails to comply, Tenant may recover the money and property due, damages equal to the amount wrongfully withheld, and reasonable attorney's fees.",
    returnCite: "Ohio Rev. Code § 5321.16(B)-(C)",
    holdingRule:
      "If the security deposit exceeds $50 or one month's rent, whichever is greater, and Tenant remains in possession for six months or more, Landlord will pay Tenant interest on the excess at 5% per year, computed and paid annually. Ohio law does not require the deposit to be kept in a separate account.",
    holdingCite: "Ohio Rev. Code § 5321.16(A)",
    interestRequired: true,
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
      "Either Landlord or Tenant may end or decline to renew a month-to-month tenancy by notice given to the other at least 30 days before the periodic rental date (the rent due date) on which the tenancy is to end, and a week-to-week tenancy by notice given at least 7 days before the termination date stated in the notice. This Lease requires those notices to be in writing.",
    monthToMonthCite: "Ohio Rev. Code § 5321.17(A)-(B)",
    nonpaymentDays: 3,
    nonpaymentRule:
      "Before filing an eviction action, Landlord must give Tenant a written notice to leave the Premises at least 3 days before filing, delivered by certified mail (return receipt requested), by handing it to Tenant in person, or by leaving it at Tenant's usual place of abode or at the Premises. The notice must contain, printed or written conspicuously: \"You are being asked to leave the premises. If you do not leave, an eviction action may be initiated against you. If you are in doubt regarding your legal rights and obligations as a tenant, it is recommended that you seek legal assistance.\"",
    nonpaymentCite: "Ohio Rev. Code § 1923.04(A)",
    entryHours: 24,
    entryRule:
      "Except in an emergency or where it is impracticable, Landlord will give Tenant reasonable notice of Landlord's intent to enter, with 24 hours presumed reasonable, and will enter only at reasonable times. Tenant will not unreasonably withhold consent to entry to inspect the Premises, make ordinary, necessary, or agreed repairs, decorations, alterations, or improvements, deliver parcels too large for Tenant's mail facilities, supply necessary or agreed services, or show the Premises to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Landlord will not abuse this right of access.",
    entryCite: "Ohio Rev. Code §§ 5321.04(A)(7)-(8), 5321.05(B)",
  },

  earlyTermination: {
    military: {
      label: "Military service (Ohio National Guard state duty)",
      cite: "Ohio Rev. Code § 5923.12",
      eligible:
        "A member of the Ohio National Guard who is ordered by the Governor to state active duty or to training or duty under Ohio Rev. Code § 5923.12 or § 5919.29 has the same lease-termination rights as a person on federal active duty under the federal Servicemembers Civil Relief Act. Tenant may terminate this Lease if Tenant entered such duty after signing it, or if while on such duty Tenant receives orders for a permanent change of station or to deploy for 90 days or more.",
      notice:
        "Tenant gives Landlord written notice of termination with a copy of the orders. Because rent under this Lease is payable monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is delivered.",
      documentation:
        "The notice must include a copy of the Governor's order or other military orders, or a written verification from Tenant's commanding officer.",
      liability:
        "Tenant owes rent only through the effective date of termination, prorated, and no early termination fee or penalty. Landlord will refund any rent paid in advance for a period after the effective date within 30 days after that date.",
    },
    domesticViolence: null,
    other: [
      {
        label: "Unlawful or harassing entry by Landlord",
        cite: "Ohio Rev. Code § 5321.04(B)",
        eligible:
          "If Landlord enters the Premises without the reasonable notice required by this Lease and Ohio law, makes a lawful entry in an unreasonable manner, or makes repeated demands for entry that have the effect of harassing Tenant, Tenant may terminate this Lease.",
        notice: "The statute does not set a notice period for this termination.",
        documentation: "",
        liability:
          "Tenant owes rent only through the termination date and no early termination fee, and may instead or also recover actual damages from the entry or demands, obtain an injunction, and recover reasonable attorney's fees.",
      },
      {
        label: "Landlord's failure to make repairs or meet code",
        cite: "Ohio Rev. Code § 5321.07",
        eligible:
          "If Landlord fails to fulfill an obligation under Ohio Rev. Code § 5321.04 or this Lease, or a government agency has found that the Premises violate a building, housing, health, or safety code in a way that could materially affect an occupant's health and safety, Tenant may give Landlord written notice specifying the acts, omissions, or code violations, sent to the person or place where rent is normally paid. If Landlord does not remedy the condition within a reasonable time considering its severity and the time needed to fix it, or within 30 days, whichever is sooner, and Tenant is current in rent, Tenant may terminate this Lease (or instead deposit rent with the court clerk or ask the court to order repairs). This right does not apply if Landlord is a party to rental agreements covering three or fewer dwelling units and this Lease states that fact.",
        notice:
          "Tenant may terminate after the remedy period expires; the statute does not set a further notice period.",
        documentation:
          "The prior written notice to Landlord specifying the acts, omissions, or code violations.",
        liability: "Tenant owes rent only through the termination date and no early termination fee.",
      },
      {
        label: "Retaliation by Landlord",
        cite: "Ohio Rev. Code § 5321.02",
        eligible:
          "If Landlord retaliates against Tenant by increasing rent, decreasing services, or bringing or threatening to bring an eviction action because Tenant complained to a government agency about a code violation that materially affects health and safety, complained to Landlord about a violation of Ohio Rev. Code § 5321.04, or joined with other tenants to negotiate collectively with Landlord, Tenant may terminate this Lease.",
        notice: "The statute does not set a notice period for this termination.",
        documentation: "",
        liability:
          "Tenant owes rent only through the termination date and no early termination fee, and may also recover actual damages and reasonable attorney's fees.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "case_law",
      cite: null,
      rule:
        "If Tenant leaves before the end of the Lease term, Landlord will make reasonable efforts to re-rent the Premises and will credit Tenant with rent actually received from a replacement tenant for the remainder of the term, less Landlord's reasonable costs of re-renting.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner and Agent",
      text:
        "The name and address of the owner of the Property, and of the owner's agent, if any, are: {{landlord_name}}, {{landlord_address}}. If the owner or agent is a corporation, partnership, limited partnership, association, trust, or other entity, the address stated is its principal place of business in the county where the Property is located (or, if it has none there, its principal place of business in Ohio), and the name of the person in charge of that office is stated with it.",
      cite: "Ohio Rev. Code § 5321.18(A)",
    },
  ],

  fairHousing: {
    stateClasses: ["military status", "ancestry"],
    cite: "Ohio Rev. Code §§ 4112.01(A), 4112.02(H)",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Premises only through a forcible entry and detainer action in court under Ohio Rev. Code chapter 1923 after giving the required notice. Landlord will not terminate utilities or services, exclude Tenant from the Premises, threaten any unlawful act, or seize Tenant's furnishings or possessions to recover possession or rent, except under a court order.",
    cite: "Ohio Rev. Code §§ 1923.04, 5321.15",
  },

  habitability: {
    rule:
      "Landlord will comply with all applicable building, housing, health, and safety codes that materially affect health and safety; make all repairs and do whatever is reasonably necessary to put and keep the Premises in a fit and habitable condition; keep all common areas safe and sanitary; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, and air conditioning fixtures and appliances, and elevators, that Landlord supplies or is required to supply; provide and maintain garbage receptacles and arrange for removal if Landlord has rental agreements covering four or more units in the same structure; and supply running water, reasonable amounts of hot water, and reasonable heat at all times, except where the building is not required by law to be so equipped or the heat or hot water is generated by an installation within Tenant's exclusive control and supplied by a direct public utility connection.",
    cite: "Ohio Rev. Code § 5321.04(A)(1)-(6)",
  },

  sources: [
    { cite: "Ohio Rev. Code § 5321.01", url: ORC("5321.01") },
    { cite: "Ohio Rev. Code § 5321.02", url: ORC("5321.02") },
    { cite: "Ohio Rev. Code § 5321.03", url: ORC("5321.03") },
    { cite: "Ohio Rev. Code § 5321.04", url: ORC("5321.04") },
    { cite: "Ohio Rev. Code § 5321.05", url: ORC("5321.05") },
    { cite: "Ohio Rev. Code § 5321.06", url: ORC("5321.06") },
    { cite: "Ohio Rev. Code § 5321.07", url: ORC("5321.07") },
    { cite: "Ohio Rev. Code § 5321.13", url: ORC("5321.13") },
    { cite: "Ohio Rev. Code § 5321.14", url: ORC("5321.14") },
    { cite: "Ohio Rev. Code § 5321.15", url: ORC("5321.15") },
    { cite: "Ohio Rev. Code § 5321.16", url: ORC("5321.16") },
    { cite: "Ohio Rev. Code § 5321.17", url: ORC("5321.17") },
    { cite: "Ohio Rev. Code § 5321.18", url: ORC("5321.18") },
    { cite: "Ohio Rev. Code § 5321.19", url: ORC("5321.19") },
    { cite: "Ohio Rev. Code § 5321.20", url: ORC("5321.20") },
    { cite: "Ohio Rev. Code chapter 5321 (section list, checked for DV or military provisions)", url: "https://codes.ohio.gov/ohio-revised-code/chapter-5321" },
    { cite: "Ohio Rev. Code § 1923.04", url: ORC("1923.04") },
    { cite: "Ohio Rev. Code § 1923.062", url: ORC("1923.062") },
    { cite: "Ohio Rev. Code § 4112.01", url: ORC("4112.01") },
    { cite: "Ohio Rev. Code § 4112.02", url: ORC("4112.02") },
    { cite: "Ohio Rev. Code § 5923.12", url: ORC("5923.12") },
    { cite: "Ohio Rev. Code § 5923.27", url: ORC("5923.27") },
  ],

  reviewNotes: [
    "Lease-term prohibitions (Ohio Rev. Code § 5321.13): no provision of chapter 5321 may be waived; no confession-of-judgment clause; no agreement to pay either party's attorney's fees is recognized (so the builder must omit any attorney's-fee or fee-shifting clause in Ohio leases); and no exculpation or indemnity of Landlord for liability arising under law. Unconscionable clauses may be struck (§ 5321.14).",
    "Small-landlord notice: § 5321.07(C) lets a landlord who is a party to rental agreements covering three or fewer dwelling units opt out of the tenant's rent-deposit/repair/termination remedy by stating that fact in the written lease. The statute permits it, but it removes a tenant remedy, so I did not add it as a disclosure; the attorney should decide whether Keycove offers it as an option for qualifying landlords.",
    "Domestic violence: Ohio has no statute letting a victim terminate a residential lease. Bills to add one (e.g., H.B. 351 of the 133rd General Assembly, H.B. 143 of the 135th, and H.B. 855 of the 136th as introduced) have not been enacted as of 2026-11-08 based on the current chapter 5321 section list. Federal VAWA rules still apply to covered federally assisted housing. domesticViolence is null.",
    "Military: there is no Ohio lease-termination statute, but § 5923.12 gives Ohio National Guard members ordered by the Governor to duty under § 5923.12 or § 5919.29 'the protections afforded to persons on federal active duty' by the SCRA, so I encoded SCRA § 3955 terms for them. How SCRA's triggers (service begun after signing; PCS; 90-day deployment) map to state duty is my reading. § 5321.04(A)(10) also requires landlords to comply with the SCRA, and § 1923.062 lets courts stay evictions of deployed tenants (landlords with four or more premises). A 2009 bill (H.B. 64) would have added a residential military termination right as § 5321.20; it was not enacted (current § 5321.20 is the 2022 rent-control findings).",
    "Late fees: no Ohio statute regulates residential late fees; enforceability turns on case law about reasonableness and penalties, which I did not verify from primary sources. No statutory early termination fee cap.",
    "Mitigation: no Ohio statute. Ohio appellate courts are reported to apply a duty to mitigate to residential leases, so basis is set to 'case_law', but I did not verify a primary case; the attorney should confirm and cite one (or change basis to 'unclear').",
    "Month-to-month: § 5321.17(B) measures 30 days 'prior to the periodic rental date', which I read as requiring the termination to coincide with the end of a rental period. The statute does not itself require written notice; the lease text adds that requirement.",
    "Nonpayment: Ohio has no pay-or-quit cure period; the 3-day notice under § 1923.04 is a notice to vacate. Ohio Rev. Code § 5321.11 (30-day notice to remedy other tenant breaches) was not read for this profile.",
    "Security deposit interest: the 5% interest applies only to the excess over the greater of $50 or one month's rent and only if the tenant stays six months or more; most deposits of one month or less owe no interest. Forwarding address in writing is the tenant's duty under § 5321.16(B).",
    "Fair housing: § 4112.02(H) adds military status (defined by § 4112.01(A) by reference to 'service in the uniformed services' under § 5923.05) and ancestry to the federal classes. Sexual orientation and gender identity are not listed in the statute text; I did not verify whether the Ohio Civil Rights Commission reads 'sex' to include them. Several cities (Columbus, Cleveland, Cincinnati, Toledo, Dayton and others) have local fair housing ordinances adding classes such as sexual orientation, gender identity, and source of income (not verified).",
    "Local law: § 5321.19 (2022 H.B. 430) preempts local rent control and local measures that regulate rental-agreement rights covered by chapter 5321, but preserves local building, housing, health, and safety codes. Local tenant ordinances (for example Columbus's 2022 tenant protection and pay-to-stay provisions, Cleveland's Lead Safe Certification requirement for pre-1978 rentals, and Cincinnati's tenant ordinances) were not verified and may be partly preempted; flag for review before use in those cities.",
    "Scope: chapter 5321 excludes transient occupancy, hotels, and certain institutional housing (§ 5321.01(C)); co-living rooms rented to the exclusion of others are covered. Student-tenant rules in § 5321.031 were not reviewed.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
