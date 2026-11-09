import type { StateLawProfile } from "../types";

const MGL = (part: string, title: string, ch: string, s: string) =>
  `https://malegislature.gov/Laws/GeneralLaws/Part${part}/Title${title}/Chapter${ch}/Section${s}`;

export const MA: StateLawProfile = {
  code: "MA",
  name: "Massachusetts",
  framework:
    "Massachusetts landlord-tenant law: Mass. Gen. Laws ch. 186 (Estates for Years and at Will), ch. 239 (Summary Process), the State Sanitary Code (Mass. Gen. Laws ch. 111, § 127A; 105 CMR 410.000), and the Attorney General's landlord-tenant regulations (940 CMR 3.17)",

  deposit: {
    maxMonths: 1,
    capRule:
      "At or before the start of the tenancy, Landlord may require Tenant to pay no more than: (1) rent for the first full month; (2) rent for the last full month, at the same rate as the first month; (3) a security deposit no greater than one month's rent; and (4) the purchase and installation cost of a key and lock. No other up-front charge (such as an application, pet, cleaning, or move-in fee) may be required, and since August 1, 2025 Tenant may not be required to pay any amount beyond these items to Landlord or to Landlord's agent, including a broker working for Landlord. After the tenancy begins, Landlord may not demand rent in advance beyond the current month's rent or a deposit above this cap. There are no higher tiers for furnished units, pets, or age.",
    capCite: "Mass. Gen. Laws ch. 186, § 15B(1)(b), (1)(d); 940 CMR 3.17(4)(a)",
    returnDays: 30,
    returnRule:
      "Within 30 days after the end of the tenancy, Landlord will return the security deposit, with any interest owed, less only these deductions: (1) unpaid rent or water charges that were not validly withheld or deducted under law; (2) unpaid real estate tax increases Tenant owes under a tax escalation clause that complies with Mass. Gen. Laws ch. 186, § 15C; and (3) a reasonable amount to repair damage caused by Tenant or anyone under Tenant's control or on the Premises with Tenant's consent, excluding reasonable wear and tear. For any damage deduction, Landlord will give Tenant within the same 30 days an itemized list of damages, sworn to by Landlord or Landlord's agent under the pains and penalties of perjury, describing in precise detail the damage and the repairs needed, together with written evidence such as estimates, bills, invoices, or receipts showing the actual or estimated cost. Landlord will not deduct for any damage listed on the statement of condition or on Tenant's signed list of existing damage, unless Landlord later repaired it and can prove the new damage is unrelated and was caused by Tenant or persons under Tenant's control. No deduction may be made for any other purpose. A landlord who fails to return the deposit and interest as required, fails to hold it as required, or tries to enforce a lease term that conflicts with the deposit law forfeits the right to keep any portion and may owe Tenant three times the deposit, plus 5% interest, court costs, and reasonable attorney's fees.",
    returnCite: "Mass. Gen. Laws ch. 186, § 15B(4), (6), (7)",
    holdingRule:
      "When Tenant pays a security deposit, Landlord will give Tenant a receipt signed by the person receiving it, stating the amount, the date received, the name of the person receiving it (and, if an agent, the name of Landlord), and a description of the Premises. The deposit remains Tenant's property: Landlord will hold it in a separate, interest-bearing account in a bank located in Massachusetts, under terms that place it beyond the claims of Landlord's creditors (including a foreclosing mortgagee or bankruptcy trustee) and allow its transfer to a later owner, and will not commingle it with Landlord's assets. Within 30 days after receiving the deposit, Landlord will give Tenant a receipt stating the name and location of the bank, the amount, and the account number. If Landlord holds the deposit for one year or longer, Landlord will pay Tenant interest from the first day of the tenancy at 5% per year, or the lesser rate actually paid by the bank, at the end of each year of the tenancy, together with a statement of the bank's name and address, the amount of the deposit, the account number, and the interest due (or a notice that Tenant may deduct the interest from the next rent payment); if neither the interest nor that notice is received within 30 days after the end of a tenancy year, Tenant may deduct the interest from the next rent payment, and if the tenancy ends before an anniversary date, accrued interest is paid within 30 days after it ends. If Landlord collects last month's rent in advance, Landlord will give Tenant a receipt at the time of payment stating the amount, the date, its intended use as last month's rent, the name of the person receiving it (and, if an agent, the name of Landlord), a description of the Premises, that Tenant is entitled to interest at 5% per year or the lesser amount received from the bank, and that Tenant should provide a forwarding address at the end of the tenancy; Landlord will pay that interest annually in the same way (no interest accrues for the last month itself). If Landlord transfers the Property, Landlord will transfer the deposit and any last month's rent with accrued interest to the new owner, who will notify Tenant in writing within 45 days with the owner's (and any agent's) name, business address, and business telephone number.",
    holdingCite: "Mass. Gen. Laws ch. 186, § 15B(1)(e), (2)(a)-(b), (3), (5), (7A); 940 CMR 3.17(4)(b)-(d)",
    interestRequired: true,
    moveInInspection:
      "If Landlord accepts a security deposit, Landlord will give Tenant, upon receipt of the deposit or within 10 days after the tenancy begins, whichever is later, a separate written statement of the present condition of the Premises, signed by Landlord or Landlord's agent, that comprehensively lists any existing damage (including any sanitary or building code violations certified by a local board of health or building official or adjudicated by a court) and carries the statutory notice in 12-point bold type at the top of the first page. Tenant should review the statement and return it, signed, within 15 days after receiving it or 15 days after moving in, whichever is later, attaching a separate signed list of any damage Tenant believes exists; if Tenant does not return it, a court may treat that as Tenant's agreement that the list is complete and correct. If Tenant submits a separate list, Landlord will return a copy within 15 days with Landlord's signed agreement or a clear statement of disagreement attached.",
  },

  lateFee: {
    graceDays: 30,
    capType: "none",
    capRule:
      "No late fee, interest, or other penalty for late rent may be charged until the rent is 30 days overdue.",
    cite: "Mass. Gen. Laws ch. 186, § 15B(1)(c); 940 CMR 3.17(6)(a)",
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either party may end a tenancy at will (month-to-month tenancy) by written notice given at least one full rental period before the termination date and in no case less than 30 days before it; if rent is payable at intervals of three months or longer, three months' written notice is required. Under Massachusetts practice the termination date should fall on the last day of a rental period. Landlord may not bring an eviction action, or remove Tenant, until that notice period has run, and Tenant owes rent at the existing rate for any part of the notice period that Tenant remains in the Premises. A notice may include an offer of a new tenancy on different terms.",
    monthToMonthCite: "Mass. Gen. Laws ch. 186, §§ 12, 13",
    nonpaymentDays: 14,
    nonpaymentRule:
      "If rent is not paid, Landlord may end the tenancy by a written 14-day notice to quit. The notice must be accompanied by the form developed by the Executive Office of Housing and Livable Communities, which documents any repayment agreement and gives information on rental assistance and eviction law; a court will not accept an eviction filing for nonpayment without proof the form was delivered. Under a written lease, the tenancy is not terminated if Tenant pays or tenders all rent then due, with interest and costs of suit, on or before the day the answer is due in the eviction case. For a tenancy at will, if Tenant has not received a nonpayment notice in the previous 12 months, the notice must state Tenant's right to cure, and Tenant may prevent termination by paying the full amount due within 10 days after receiving the notice.",
    nonpaymentCite: "Mass. Gen. Laws ch. 186, §§ 11, 12, 31",
    entryHours: null,
    entryRule:
      "Landlord may enter the Premises only: to inspect them; to make repairs; to show them to a prospective tenant, purchaser, or mortgagee or their agents; in accordance with a court order; if the Premises appear to have been abandoned; or, within the last 30 days of the tenancy or after either party has given notice of intent to terminate, to inspect for damage that could be deducted from the security deposit. Massachusetts law does not set a fixed number of hours of notice; except in an emergency, Landlord will give Tenant reasonable advance notice and enter only at reasonable times.",
    entryCite: "Mass. Gen. Laws ch. 186, § 15B(1)(a); 940 CMR 3.17(6)(e)",
  },

  earlyTermination: {
    military: {
      label: "Military service (Massachusetts state military duty)",
      cite: "Mass. Gen. Laws ch. 33, § 13A",
      eligible:
        "A member of the armed forces of the Commonwealth (including the Massachusetts National Guard, the state defense force, and the state staff), a person residing in Massachusetts pursuant to military service, or a member of another state's or territory's armed forces who resides in Massachusetts, who is ordered to active duty under Mass. Gen. Laws ch. 33, under the authority of another state or territory, or under Title 32 of the United States Code, has the same lease-termination rights as a servicemember under the federal Servicemembers Civil Relief Act. Tenant may terminate this Lease if Tenant entered such service after signing it, or if while in such service Tenant receives orders for a permanent change of station or to deploy for 90 days or more.",
      notice:
        "Tenant gives Landlord written notice of termination with a copy of the orders. Because rent under this Lease is payable monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is delivered.",
      documentation:
        "The notice must include a copy of the military orders, or a written verification of the service from Tenant's commanding officer.",
      liability:
        "Tenant owes rent only through the effective date of termination, prorated, and no early termination fee or penalty. Landlord will refund any rent paid in advance for a period after the effective date within 30 days after that date. Lawful deductions from the security deposit under Mass. Gen. Laws ch. 186, § 15B still apply. A landlord who violates this right is liable for actual damages or $1,000, whichever is greater (the greater of $5,000 or three times damages if the violation is willful or knowing or a demand for relief is refused in bad faith), plus costs and reasonable attorney's fees.",
    },
    domesticViolence: {
      label: "Domestic violence, rape, sexual assault, or stalking",
      cite: "Mass. Gen. Laws ch. 186, §§ 23-29",
      eligible:
        "Tenant (or any co-tenant) may terminate this Lease if a member of Tenant's household is a victim of domestic violence, rape, sexual assault, or stalking and Tenant notifies Landlord in writing within 3 months after the most recent act, or if a member of Tenant's household is reasonably in fear of imminent serious physical harm from domestic violence, rape, sexual assault, or stalking.",
      notice:
        "Tenant gives Landlord written notice of termination. Within 3 months after the notice, Tenant, any co-tenant, and any household member who is not the perpetrator must vacate the Premises; if Tenant does not vacate within 3 months, the notice is void.",
      documentation:
        "Landlord may request proof of victim status, including the perpetrator's name if known. Any one of the following is sufficient: (1) a copy of a valid protective order under Mass. Gen. Laws ch. 209A or 258E obtained by Tenant, a co-tenant, or a household member; (2) a record from a federal, state, or local court or law enforcement agency of the act and the perpetrator's name if known; or (3) a written verification from a qualified third party to whom the act was reported (such as a police officer, district attorney, victim-witness advocate, probation or parole officer, licensed medical care provider, licensed social worker, licensed mental health professional, sexual assault counselor, or domestic violence victims' counselor), stating the name of the organization or provider, the date of the act, and the perpetrator's name if known, accompanied by the adult victim's statement under penalty of perjury that the incident is true and correct. Landlord will keep this documentation and information confidential and will not release it without the victim's written authorization unless required by court order, government regulation, or governmental audit.",
      liability:
        "Tenant remains liable for rent or use and occupancy only for 30 days or one full rental period after the quitting date, whichever is later, and is entitled to a refund of any rent prepaid for any period after that. Landlord will provide a full and specific statement of the basis for retaining any of the security deposit, with any refund due under Mass. Gen. Laws ch. 186, § 15B, within 30 days after the tenancy ends and all occupants deliver full possession. Other tenants or co-tenants who signed this Lease are not released from their obligations. Belongings Tenant leaves behind are treated as abandoned unless Tenant gives written instructions for them. Landlord will not refuse to rent to an applicant because the applicant previously terminated a lease under this law.",
    },
    other: [
      {
        label: "Unlawful lockout or exclusion",
        cite: "Mass. Gen. Laws ch. 186, § 15F",
        eligible:
          "If Landlord or Landlord's agent removes Tenant from the Premises, or excludes Tenant from them, other than under a valid court order, Tenant may either recover possession or terminate this Lease.",
        notice: "The statute does not set a notice period for this termination.",
        documentation: "",
        liability:
          "Tenant owes no rent for any period after the termination and, whether Tenant terminates or recovers possession, may recover three months' rent or three times Tenant's damages, plus the cost of suit and reasonable attorney's fees.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "unclear",
      cite: null,
      rule:
        "If Tenant leaves before the end of the Lease term, Landlord will make reasonable efforts to re-rent the Premises and will credit Tenant with rent actually received from a replacement tenant for the remainder of the term, less Landlord's reasonable costs of re-renting.",
    },
  },

  disclosures: [
    {
      id: "owner_agent_identity",
      title: "Owner, Manager, and Agent for Notices",
      text:
        "The owner of the Property, any other person responsible for its care, maintenance, and repair, and the person authorized to receive notices of violations of law and to accept service of process on the owner's behalf is {{landlord_name}}, {{landlord_address}}, unless an addendum signed by both parties names a different person. Landlord will provide in writing, at or before signing, the telephone number of each person named.",
      cite: "940 CMR 3.17(3)(b)1-2",
    },
    {
      id: "security_deposit_rights",
      title: "Security Deposit Rights",
      text:
        "The security deposit for the Premises is {{security_deposit}}. Landlord must hold any security deposit in a separate, interest-bearing account and give Tenant a receipt and notice of the bank and account number. If the deposit is held for one year or longer from the start of the tenancy, Landlord must pay interest at the end of each year of the tenancy. Landlord must give Tenant a separate written statement of the present condition of the Premises; if Tenant disagrees with it, Tenant must attach a separate list of any damage existing in the Premises and return the statement to Landlord. Within 30 days after the tenancy ends, Landlord must return the security deposit, with interest, less lawful deductions under Mass. Gen. Laws ch. 186, § 15B. If Landlord deducts for damage to the Premises, Landlord must give Tenant an itemized list of the damage and written evidence of the actual or estimated cost of the repairs. No amount may be deducted for damage listed on the statement of condition or on any separate list Tenant submitted and Landlord or Landlord's agent signed. If Landlord transfers the Premises, Landlord must transfer the security deposit, with any accrued interest, to the new owner for Tenant's benefit.",
      cite: "940 CMR 3.17(3)(b)3; Mass. Gen. Laws ch. 186, § 15B",
      condition: "Only if Landlord collects a security deposit",
    },
    {
      id: "lead_paint_state",
      title: "Massachusetts Lead Law Notification",
      text:
        "Before this Lease was signed, Landlord gave Tenant: (1) the Massachusetts Tenant Lead Law Notification and the state childhood lead poisoning prevention program materials, completed with the name, address, and telephone number of the owner or managing agent; (2) a copy of the most recent lead paint inspection report, letter of interim control, letter of compliance, or abatement plan for the unit, common areas, and exterior surfaces, if any; and (3) two copies of a certification that Tenant received these materials, one kept by Tenant and one by Landlord. Landlord has disclosed any information Landlord actually knows about the location of paint, plaster, or other accessible materials containing dangerous levels of lead, including covered or encapsulated surfaces. Tenant should promptly notify Landlord in writing if any painted surface begins to peel or flake.",
      cite: "Mass. Gen. Laws ch. 111, §§ 189A, 197A(d)",
      condition: "For dwelling units built before 1978 (in addition to the federal lead-based paint disclosure)",
    },
    {
      id: "water_submetering",
      title: "Water Submetering",
      text:
        "Tenant will be charged separately for water (and any sewer charge calculated from the same meter) measured by a submeter that measures only water supplied for the exclusive use of the Premises. Landlord has certified the unit's compliance to the local board of health, installed water conservation devices on all faucets, showerheads, and toilets, and will bill Tenant at no more than the calculated cost per unit charged by the water company, with each bill showing the current and prior readings and dates, usage, rate, total, and due date. Payment is due 15 days after a monthly bill is mailed, or 30 days after the bill is mailed if Landlord bills less often than monthly. Landlord will not charge any servicing, administrative, meter-reading, billing, or other submetering fee.",
      cite: "Mass. Gen. Laws ch. 186, § 22(c)-(j)",
      condition: "Only if Tenant will be billed separately for submetered water",
    },
    {
      id: "lease_copy_delivery",
      title: "Delivery of Signed Lease",
      text:
        "Landlord will deliver to Tenant a copy of this Lease signed by Landlord within 30 days after Tenant signs it.",
      cite: "Mass. Gen. Laws ch. 186, § 15D; 940 CMR 3.17(3)(c)",
    },
    {
      id: "insurance_disclosure",
      title: "Insurance Information",
      text:
        "On Tenant's written request, Landlord will disclose in writing within 15 days the name of each company insuring the Property against loss or damage by fire, the amount of insurance each provides, and the name of any person who would receive payment for a covered loss.",
      cite: "Mass. Gen. Laws ch. 186, § 21",
    },
  ],

  fairHousing: {
    stateClasses: [
      "sexual orientation",
      "gender identity",
      "age",
      "marital status",
      "ancestry",
      "genetic information",
      "veteran status or membership in the armed forces",
      "receipt of public assistance or a housing subsidy (including rental vouchers)",
      "having children who will occupy the premises (broader than federal familial status)",
      "blindness, hearing impairment, or use of a guide dog",
    ],
    cite: "Mass. Gen. Laws ch. 151B, § 4(6), (7), (7A), (10), (11)",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Premises only through a summary process action in court under Mass. Gen. Laws ch. 239 after a valid notice to quit, and only a court order can require Tenant to leave. Landlord will not use self-help such as changing the locks, removing Tenant or Tenant's belongings, or shutting off or interfering with utilities or services.",
    cite: "Mass. Gen. Laws ch. 239, § 1; ch. 184, § 18; ch. 186, §§ 14, 15F",
  },

  habitability: {
    rule:
      "Landlord will deliver and maintain the Premises in compliance with the State Sanitary Code (105 CMR 410.000) and applicable building and health codes, will exercise reasonable care to correct an unsafe condition within a reasonable time after Tenant's written notice, and will not willfully fail to furnish water, hot water, heat, light, power, gas, or any other service Landlord is required to provide, transfer utility charges to Tenant without Tenant's knowledge or consent, or interfere with Tenant's quiet enjoyment of the Premises.",
    cite: "Mass. Gen. Laws ch. 111, § 127A; 105 CMR 410.000; Mass. Gen. Laws ch. 186, §§ 14, 19; 940 CMR 3.17(1)",
  },

  sources: [
    { cite: "Mass. Gen. Laws ch. 186, § 8", url: MGL("II", "I", "186", "8") },
    { cite: "Mass. Gen. Laws ch. 186, § 11", url: MGL("II", "I", "186", "11") },
    { cite: "Mass. Gen. Laws ch. 186, § 11A", url: MGL("II", "I", "186", "11A") },
    { cite: "Mass. Gen. Laws ch. 186, § 12", url: MGL("II", "I", "186", "12") },
    { cite: "Mass. Gen. Laws ch. 186, § 13", url: MGL("II", "I", "186", "13") },
    { cite: "Mass. Gen. Laws ch. 186, § 14", url: MGL("II", "I", "186", "14") },
    { cite: "Mass. Gen. Laws ch. 186, § 15", url: MGL("II", "I", "186", "15") },
    { cite: "Mass. Gen. Laws ch. 186, § 15A", url: MGL("II", "I", "186", "15A") },
    { cite: "Mass. Gen. Laws ch. 186, § 15B", url: MGL("II", "I", "186", "15B") },
    { cite: "Mass. Gen. Laws ch. 186, § 15D", url: MGL("II", "I", "186", "15D") },
    { cite: "Mass. Gen. Laws ch. 186, § 15E", url: MGL("II", "I", "186", "15E") },
    { cite: "Mass. Gen. Laws ch. 186, § 15F", url: MGL("II", "I", "186", "15F") },
    { cite: "Mass. Gen. Laws ch. 186, § 16", url: MGL("II", "I", "186", "16") },
    { cite: "Mass. Gen. Laws ch. 186, § 17", url: MGL("II", "I", "186", "17") },
    { cite: "Mass. Gen. Laws ch. 186, § 18", url: MGL("II", "I", "186", "18") },
    { cite: "Mass. Gen. Laws ch. 186, § 19", url: MGL("II", "I", "186", "19") },
    { cite: "Mass. Gen. Laws ch. 186, § 20", url: MGL("II", "I", "186", "20") },
    { cite: "Mass. Gen. Laws ch. 186, § 21", url: MGL("II", "I", "186", "21") },
    { cite: "Mass. Gen. Laws ch. 186, § 22", url: MGL("II", "I", "186", "22") },
    { cite: "Mass. Gen. Laws ch. 186, § 23", url: MGL("II", "I", "186", "23") },
    { cite: "Mass. Gen. Laws ch. 186, § 24", url: MGL("II", "I", "186", "24") },
    { cite: "Mass. Gen. Laws ch. 186, § 25", url: MGL("II", "I", "186", "25") },
    { cite: "Mass. Gen. Laws ch. 186, § 26", url: MGL("II", "I", "186", "26") },
    { cite: "Mass. Gen. Laws ch. 186, § 27", url: MGL("II", "I", "186", "27") },
    { cite: "Mass. Gen. Laws ch. 186, § 28", url: MGL("II", "I", "186", "28") },
    { cite: "Mass. Gen. Laws ch. 186, § 29", url: MGL("II", "I", "186", "29") },
    { cite: "Mass. Gen. Laws ch. 186, § 30", url: MGL("II", "I", "186", "30") },
    { cite: "Mass. Gen. Laws ch. 186, § 31", url: MGL("II", "I", "186", "31") },
    { cite: "Mass. Gen. Laws ch. 184, § 18", url: MGL("II", "I", "184", "18") },
    { cite: "Mass. Gen. Laws ch. 239, § 1", url: MGL("III", "III", "239", "1") },
    { cite: "Mass. Gen. Laws ch. 239, § 2A", url: MGL("III", "III", "239", "2A") },
    { cite: "Mass. Gen. Laws ch. 151B, § 4", url: MGL("I", "XXI", "151B", "4") },
    { cite: "Mass. Gen. Laws ch. 111, § 127A", url: MGL("I", "XVI", "111", "127A") },
    { cite: "Mass. Gen. Laws ch. 111, § 189A", url: MGL("I", "XVI", "111", "189A") },
    { cite: "Mass. Gen. Laws ch. 111, § 197", url: MGL("I", "XVI", "111", "197") },
    { cite: "Mass. Gen. Laws ch. 111, § 197A", url: MGL("I", "XVI", "111", "197A") },
    { cite: "Mass. Gen. Laws ch. 33, § 13", url: MGL("I", "V", "33", "13") },
    { cite: "Mass. Gen. Laws ch. 33, § 13A", url: MGL("I", "V", "33", "13A") },
    { cite: "940 CMR 3.17 (Attorney General landlord-tenant regulations)", url: "https://www.law.cornell.edu/regulations/massachusetts/940-CMR-3-17" },
  ],

  reviewNotes: [
    "Statement of condition: Mass. Gen. Laws ch. 186, § 15B(2)(c) requires this exact notice in 12-point bold type at the top of the first page of the separate statement of condition: \"This is a statement of the condition of the premises you have leased or rented. You should read it carefully in order to see if it is correct. If it is correct you must sign it. This will show that you agree that the list is correct and complete. If it is not correct, you must attach a separate signed list of any damage which you believe exists in the premises. This statement must be returned to the lessor or his agent within fifteen days after you receive this list or within fifteen days after you move in, whichever is later. If you do not return this list, within the specified time period, a court may later view your failure to return the list as your agreement that the list is complete and correct in any suit which you may bring to recover the security deposit.\" The product should generate this as its own document whenever a deposit is collected; it is not a lease clause.",
    "Deposit-law penalties are severe (treble damages, forfeiture of the right to keep any part of the deposit, immediate return for failure to give the bank receipt within 30 days or failure to make deposit records available). Keycove's Stripe flow must (a) place deposits in a separate interest-bearing Massachusetts bank account, not a platform balance, (b) produce both receipts (at payment and within 30 days with bank name/location and account number), (c) pay or credit annual interest, and (d) track the 2-year record-retention duty in § 15B(2)(d). If the platform cannot do this, it should not collect deposits for MA units.",
    "Up-front charges: § 15B(1)(b) allows only first month, last month, a deposit up to one month, and lock/key cost. Pet deposits, application fees, admin fees, and move-in fees are not permitted. 2025 Mass. Acts c. 9, §§ 54-55 (effective Aug. 1, 2025) added 'or agent of the lessor ... to the lessor or to an agent of the lessor', which bars requiring tenants to pay a broker fee to a broker hired by the landlord. The same clause lets EOHLC adopt regulations for an optional fee in lieu of a deposit (capped at one month's rent in total); I did not check whether those regulations exist, so no fee-in-lieu option is encoded.",
    "Last month's rent counts as a separate permitted payment and carries its own receipt and 5% (or bank rate) interest duty under § 15B(2)(a); the lease generator must not treat it as part of the deposit.",
    "Month-to-month notice: § 12 says notice must equal the interval between rent days or 30 days, whichever is longer. The rule that the termination date must fall on a rent day (end of a rental period) comes from Massachusetts case law, not the statute text; I have not verified a primary case citation.",
    "DV termination, § 24(c): the text says the tenant 'shall be discharged from liability for rent ... for 30 days or 1 full rental period after the quitting date, whichever last occurs'. I read this, together with the refund-of-prepaid-rent sentence, as the tenant remaining liable through that period and being discharged after it (the reading commonly given). The attorney should confirm. Co-tenants are expressly not released (§ 24(d)). Waiver is void (§ 28). Lock-change duties (§ 26: within 2 business days) are not a termination right and are not encoded.",
    "Military: no Massachusetts statute grants a separate lease-termination right, but Mass. Gen. Laws ch. 33, § 13A extends all federal SCRA rights (other than life insurance) to Massachusetts Guard and state forces ordered to state active duty, Title 32 duty, or another state's active duty, and to other states' guard members residing in Massachusetts, with its own damages remedy (actual or $1,000; willful $5,000 or treble) and a 30-day written-demand prerequisite. The notice, documentation, and liability text paraphrases 50 U.S.C. § 3955 as incorporated by § 13A (the section still cites the old 50 U.S.C. App. numbering). Applying SCRA's 'entered service after signing / PCS / 90-day deployment' triggers to state duty is my reading.",
    "Early termination fees: no statutory cap. 940 CMR 3.17(6)(c) makes it an unfair practice to retain more than the damages the landlord is entitled to by law or an agreed liquidated amount, and 940 CMR 3.17(3)(a)3 bars penalty clauses that do not conform to § 15B. A liquidated early-termination fee should be reviewed for reasonableness. Duty to mitigate: I found no Massachusetts statute; the case law position on residential mitigation was not verified from a primary source, so basis is 'unclear' and the lease voluntarily commits Landlord to credit re-rental income.",
    "Lease-term prohibitions to enforce in the builder: no waiver of notices to quit (§ 15A); no exculpation or indemnity for Landlord's negligence (§ 15); no jury-trial waiver or no-constructive-eviction clause (§ 15F); no clause terminating because Tenant has children (§ 16); a landlord attorney's-fee clause creates a reciprocal implied covenant for Tenant (§ 20); any deposit term conflicting with § 15B is void (§ 15B(8)). A late-fee clause must not trigger before day 30.",
    "940 CMR 3.17(3)(b) requires the written lease to state the names, addresses, and telephone numbers of the owner and any person responsible for maintenance, and of the person authorized to accept service of process. KNOWN_PLACEHOLDERS has no landlord_phone, so the disclosure text promises the number separately; the builder should add a landlord_phone placeholder (or a property-manager block) so the phone number appears in the lease itself.",
    "Lead: the state lead law (Mass. Gen. Laws ch. 111, §§ 189A-199B) is separate from the federal disclosure. § 197A(d) requires the state Tenant Lead Law Notification form and certification before signing; under ch. 111, § 197(a) the owner must abate or contain dangerous lead levels whenever a child under six resides in the unit (a new owner has 90 days), and ch. 151B, § 4(11) bars refusing to rent to families with children, with lead findings reported to the state program. These are operational duties, not lease clauses, and are not encoded.",
    "Habitability: I did not read 105 CMR 410.000 itself. The Sanitary Code requires a written agreement before the tenant pays for heat, hot water, or electricity/gas (with separate metering); the builder's utilities clause should be checked against 105 CMR 410 for MA. The implied warranty of habitability is case law (commonly cited as Boston Housing Authority v. Hemingway, 363 Mass. 184 (1973)), not verified from a primary source here.",
    "Co-living: a room in a licensed rooming or lodging house becomes a tenancy at will after 3 consecutive months; between 30 days and 3 months, or in a dormitory, only 7 days' written notice is needed (ch. 186, § 17). Rooms in an ordinary dwelling shared with others get the full tenancy-at-will protections. Whether a lodger in an owner-occupied single-family home is a tenant is a case-law question I did not research.",
    "Local law (not verified from primary text): municipal rent control has been barred statewide since the 1994 ballot question (codified at ch. 40P, which I did not read), but statewide rent-stabilization proposals should be monitored. Boston, Cambridge, Somerville and other cities have rental registration/inspection ordinances, and Boston requires a tenant-rights notice with notices to quit; these were not verified and are not encoded.",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
