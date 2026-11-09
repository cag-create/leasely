import type { StateLawProfile } from "../types";

const VSA = (title: string, ch: string, s: string) =>
  `https://legislature.vermont.gov/statutes/section/${title}/${ch}/${s}`;

export const VT: StateLawProfile = {
  code: "VT",
  name: "Vermont",
  framework:
    "Vermont Residential Rental Agreements Act, 9 V.S.A. chapter 137 (§§ 4451-4475), with ejectment procedure in 12 V.S.A. chapter 169, subchapter 3",

  deposit: {
    maxMonths: null,
    capRule:
      "Vermont sets no statewide limit on the amount of a security deposit. A security deposit is any advance, deposit, or prepaid rent, however named, that is refundable to Tenant at the end of the tenancy. A town or municipality may adopt a security deposit ordinance that adds protections (for example, interest), but not one that limits how the deposit is held.",
    capCite: null,
    returnDays: 14,
    returnRule:
      "Landlord will return the security deposit, together with a written statement itemizing any deductions, within 14 days after the date Landlord discovers that Tenant vacated or abandoned the Premises, or within 14 days after the date Tenant vacated if Tenant gave Landlord notice of that date, by hand delivery or by mail to Tenant's last known address. For a seasonal rental not intended as a primary residence, the deadline is 60 days. Landlord may keep all or part of the deposit only for: nonpayment of rent; damage to Landlord's property, other than normal wear and tear or damage resulting from events beyond Tenant's control; nonpayment of utility or other charges Tenant was required to pay directly to Landlord or to a utility; and expenses of removing articles Tenant abandoned. If Landlord fails to return the deposit with the statement within 14 days, Landlord forfeits the right to withhold any portion of it, and if the failure is willful Landlord is liable for double the amount wrongfully withheld plus reasonable attorney's fees and costs.",
    returnCite: "9 V.S.A. § 4461(a)-(e)",
    holdingRule:
      "If Landlord's interest in the Premises ends, Landlord will transfer the security deposit to the new landlord, who will give Tenant actual notice of the new landlord's name and address with a statement that the deposit has been transferred.",
    holdingCite: "9 V.S.A. § 4461(f)",
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
    monthToMonthDays: 60,
    monthToMonthRule:
      "Landlord may end a month-to-month tenancy for no cause by actual notice to Tenant stating a termination date at least 60 days after the notice if Tenant has resided continuously in the Premises for two years or less, or at least 90 days after the notice if Tenant has resided there for more than two years. To end a fixed-term lease for no cause at the end of its term, Landlord must give notice at least 30 days before the term ends (at least 60 days if the tenancy has continued for more than two years). Tenant may end a month-to-month tenancy by actual notice to Landlord given at least one rental payment period before the termination date stated in the notice. Every termination notice must state the termination date specifically. Where Tenant rents one or more rooms in Landlord's own residence and shares common living space such as a kitchen, living room, or bathroom with Landlord, either party may end the arrangement by actual notice at least 15 days in advance if rent is paid monthly, or 7 days if rent is paid weekly.",
    monthToMonthCite: "9 V.S.A. §§ 4456(d), 4467(c), (e), (f), (h)",
    nonpaymentDays: 14,
    nonpaymentRule:
      "If rent is not paid, Landlord may terminate the tenancy by actual notice to Tenant stating a termination date at least 14 days after the date of the notice. The tenancy does not terminate if Tenant pays or tenders the rent due through the end of the rental period in which the payment is made or tendered. Landlord's acceptance of a partial payment does not waive Landlord's remedies for nonpayment.",
    nonpaymentCite: "9 V.S.A. § 4467(a)",
    entryHours: 48,
    entryRule:
      "Landlord may enter the Premises with Tenant's consent, which Tenant will not unreasonably withhold. Landlord may also enter between 9:00 a.m. and 9:00 p.m. on at least 48 hours' notice to inspect the Premises when necessary, to make necessary or agreed repairs, alterations, or improvements, to supply agreed services, or to show the Premises to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Landlord may enter without consent or notice only when Landlord reasonably believes there is imminent danger to any person or to property.",
    entryCite: "9 V.S.A. § 4460",
  },

  earlyTermination: {
    military: null,
    domesticViolence: {
      label: "Abuse, sexual assault, or stalking",
      cite: "9 V.S.A. §§ 4471-4475",
      eligible:
        "Tenant may terminate this Lease if Tenant is a victim of abuse, sexual assault, or stalking, or is a parent, foster parent, legal guardian, or caretaker with at least partial physical custody of such a victim, and Tenant reasonably believes it is necessary to vacate the Premises because of a fear of imminent harm to any such protected tenant from abuse, sexual assault, or stalking, or because a protected tenant was a victim of sexual assault on the Premises within the six months before the notice of termination.",
      notice:
        "At least 30 days before the termination date, Tenant gives Landlord a written notice of termination. Tenant may revoke the notice in writing, or the Lease remains in effect if Tenant has not vacated by the termination date, but in either case only if Landlord has not already entered into a rental agreement with another tenant.",
      documentation:
        "With the notice, Tenant gives Landlord documentation supporting Tenant's reasonable belief that vacating is necessary, from one or more of: a court, law enforcement, or other government agency; an abuse, sexual assault, or stalking assistance program; a legal, clerical, medical, or other professional from whom Tenant (or Tenant's minor or dependent) received counseling or other assistance concerning abuse, sexual assault, or stalking; or a self-certification of victim status signed under penalty of perjury on a standard form adopted for that purpose by a federal or state government entity (such as the U.S. Department of Housing and Urban Development or the Vermont Department for Children and Families) or by a nonprofit organization that provides support services to protected tenants. Landlord will keep this documentation and information confidential.",
      liability:
        "Tenant may terminate without penalty or liability: Tenant owes rent only through the termination date and no early termination fee.",
    },
    other: [
      {
        label: "Landlord's failure to maintain habitability",
        cite: "9 V.S.A. § 4458",
        eligible:
          "Tenant may terminate this Lease if Landlord fails to comply with the warranty of habitability, fails to make repairs within a reasonable time after receiving actual notice of the noncompliance from Tenant, a governmental entity, or a qualified independent inspector, and the noncompliance materially affects health and safety. This right is not available if the noncompliance was caused by the negligent or deliberate act or omission of Tenant or a person on the Premises with Tenant's consent.",
        notice: "Tenant gives Landlord reasonable notice of termination.",
        documentation: "",
        liability:
          "Tenant owes no rent after the termination date and no early termination fee. Tenant may also withhold rent for the period of noncompliance and recover damages, costs, and reasonable attorney's fees.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "unclear",
      cite: "9 V.S.A. § 4462(b)",
      rule:
        "If Tenant abandons the Premises before this Lease ends, Tenant remains liable for rent until the Lease expires, except that if Landlord re-rents the Premises before then, this Lease terminates on the date the new tenancy begins and Tenant owes no rent after that date. Landlord will make reasonable efforts to re-rent the Premises.",
    },
  },

  disclosures: [
    {
      id: "flood_zone",
      title: "Flood Hazard Area Disclosure",
      text:
        "At or before the signing of this Lease, Landlord gave Tenant a separate written notice, substantially in the form prescribed by the Vermont Department of Housing and Community Development, disclosing whether any portion of the Premises offered for rent is located in a Federal Emergency Management Agency mapped special flood hazard area.",
      cite: "9 V.S.A. § 4466",
    },
    {
      id: "rent_increase_notice",
      title: "Rent Increases",
      text:
        "Any increase in rent takes effect only on the first day of a rental period that follows at least 60 days' actual notice to Tenant.",
      cite: "9 V.S.A. § 4455(b)",
    },
    {
      id: "cannabis",
      title: "Cannabis",
      text:
        "This Lease does not prohibit Tenant from possessing cannabis or cannabis products within the Premises or from using cannabis or cannabis products within the dwelling unit, except that any restriction in this Lease on smoking applies to the use of lighted cannabis or cannabis products intended for inhalation on the Premises.",
      cite: "9 V.S.A. § 4468b",
      condition: "Does not apply where federal law requires the rental agreement to prohibit possession or use of cannabis (for example, certain federally assisted housing)",
    },
  ],

  fairHousing: {
    stateClasses: [
      "sexual orientation",
      "gender identity",
      "age",
      "marital status",
      "citizenship",
      "immigration status",
      "receipt of public assistance (including housing assistance)",
      "status as a victim of abuse, sexual assault, or stalking",
      "intent to occupy a dwelling with one or more minor children",
    ],
    cite: "9 V.S.A. §§ 4501, 4503",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Premises only through an ejectment action in the Vermont Superior Court under 12 V.S.A. chapter 169, subchapter 3, after the tenancy has been properly terminated by notice. Landlord will not willfully interrupt or terminate any utility service (except temporarily for emergency repairs) and will not deny Tenant access to the Premises or to Tenant's property except through proper judicial process.",
    cite: "9 V.S.A. §§ 4463, 4468; 12 V.S.A. §§ 4851-4853a",
  },

  habitability: {
    rule:
      "Landlord warrants that Landlord will deliver and maintain, throughout the tenancy, Premises that are safe, clean, and fit for human habitation and that comply with applicable building, housing, and health regulations. Landlord will ensure the dwelling unit has heating facilities capable of safely providing a reasonable amount of heat, will supply a reasonable amount of heat at all times if Landlord provides heat under this Lease, and will provide an adequate amount of water connected to hot and cold water lines with water-heating facilities capable of heating sufficient water. Tenant cannot waive this warranty.",
    cite: "9 V.S.A. § 4457",
  },

  sources: [
    { cite: "9 V.S.A. chapter 137, §§ 4451-4475 (full chapter)", url: "https://legislature.vermont.gov/statutes/fullchapter/09/137" },
    { cite: "9 V.S.A. § 4501", url: VSA("09", "139", "04501") },
    { cite: "9 V.S.A. § 4503", url: VSA("09", "139", "04503") },
    { cite: "12 V.S.A. chapter 169, §§ 4851-4853b", url: "https://legislature.vermont.gov/statutes/fullchapter/12/169" },
    { cite: "20 V.S.A. chapters 21, 23, 29, 31, 33, 35, 37, 39, 61, 63, 65 (searched for military lease provisions; none found)", url: "https://legislature.vermont.gov/statutes/title/20" },
  ],

  reviewNotes: [
    "Month-to-month notice: § 4467(c) gives 60/90 days for no-cause termination 'in the absence of a written rental agreement', while § 4467(e) gives 30/60 days 'before the end or expiration of the stated term' for written agreements and separately sets 7 days for written week-to-week agreements. It is unclear whether a written month-to-month agreement is governed by (c) or (e). I used the longer 60/90-day periods as the conservative choice; the attorney may decide (e)'s 30/60 days applies.",
    "Co-living: § 4467(h) lets either party end a 'shared occupancy' (rooms in the landlord's own personal residence with shared common living spaces) on 15 days' notice (monthly rent) or 7 days (weekly). This only applies when the owner lives in the home; Keycove co-living rooms in non-owner-occupied houses get the full 60/90-day rules. The builder should know whether the landlord lives in the property.",
    "Tenant notice: § 4456(d) requires only one rental payment period's actual notice 'unless inconsistent with a written rental agreement or otherwise provided by law', so a lease may set a different period; I did not encode a longer tenant notice.",
    "§ 4467(k): a termination notice cannot support an eviction judgment unless the ejectment action is filed within 60 days after the termination date in the notice. § 4467(i)-(j) allow multiple notices and acceptance of rent after a non-rent termination without waiver.",
    "Application fees are banned outright (§ 4456a(a)), and landlords must accept government ID, an ITIN, or an SSN for screening and may not require an SSN (§ 4456a(b), amended 2025, effective July 1, 2025). This affects Keycove's screening/application flow in Vermont.",
    "Security deposits: no cap, no separate-account or interest rule statewide. § 4461(g) allows municipal ordinances that can require interest and can route disputes to a housing board of review; Burlington is reported to have such an ordinance (not verified). Deposits must go to the tenant's last known address within 14 days, and the forfeiture penalty applies to any late return, willful or not.",
    "Domestic violence: § 4472 does not say whether co-tenants are released or whether the right can be waived (general anti-circumvention rule in § 4454 applies). Lock changes within 48 hours on request are a separate right (§ 4473). Landlords acting in good faith are immune (§ 4475).",
    "Military: I found no Vermont statute giving servicemembers or state-duty Guard members lease-termination rights or extending SCRA to state active duty; I searched the full text of 20 V.S.A. chapters 21-65 (military) for 'lease', 'rental', 'tenant', and 'civil relief'. Federal SCRA only.",
    "Mitigation: § 4462(b) (abandonment) keeps the tenant liable to the end of the term but ends the lease when the unit is re-rented; it does not by its terms impose a duty to re-rent. Vermont case law may impose a duty to mitigate; I did not verify a primary case, so basis is 'unclear' and the lease voluntarily commits to reasonable re-rental efforts.",
    "Late fees: no Vermont statute regulates residential late fees; any fee is subject to general contract/penalty principles. No early termination fee cap.",
    "Cannabis clause: § 4468b was added by 2025 Vt. Acts No. 176 effective July 1, 2026; a blanket no-cannabis rule is now void (except lighted inhalation, and federally required bans). Co-living house rules must follow this.",
    "Rent increases need 60 days' actual notice (§ 4455(b)); age-restricted housing has an extra DHCD form notice (§ 4468a).",
    "Not researched here: Vermont lead-paint essential maintenance practices law (18 V.S.A. chapter 38), the rental housing health code (20 V.S.A. chapter 172 and Health Department rules), and any municipal just-cause or rental registry ordinances (Burlington and Winooski have pursued just-cause charter changes; status not verified). The flood disclosure must use the DHCD model form.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
