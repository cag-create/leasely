# Georgia (GA): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `57898bb0d200aa37`
- **Framework:** O.C.G.A. Title 44, Chapter 7 (Landlord and Tenant), including Article 2 (Security Deposits) and Article 3 (Dispossessory Proceedings)
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/GA-residential.html) · [co-living](samples/GA-coliving.html)

To approve after review: `pnpm lease:approve GA --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | 2 month(s) rent: The security deposit may not exceed the equivalent of two months' rent. | O.C.G.A. § 44-7-30.1 |
| Deposit return | 30 days: Within three business days after this Lease ends and Tenant vacates (or Tenant surrenders and Landlord accepts the Property), Landlord shall inspect the Property and prepare a comprehensive list of any damage that is the basis for a charge against the deposit, with its estimated dollar value. Tenant may, on request, inspect the Property and the list within five business days after Landlord's inspection. If Tenant is present for the inspection, Landlord and Tenant sign the list. Tenant has a duty to sign each damage list or to state specifically in writing, and sign, the items with which Tenant disagrees. Within 30 days after obtaining possession, Landlord shall return the full deposit or deliver a written statement of the exact reasons for keeping any part of it, including the damage list if the reason is damage, together with the balance due. Mailing the statement and payment to Tenant's last known address by first-class mail is sufficient. No part of the deposit may be kept for ordinary wear and tear. | O.C.G.A. §§ 44-7-33(b)-(c), 44-7-34 |
| Deposit holding | Landlord shall deposit the security deposit in an escrow account used only for that purpose in a bank or lending institution regulated by Georgia or the United States, and hold it in trust for Tenant, or instead post a surety bond with the clerk of the superior court of the county where the Property is located. Landlord will tell Tenant in writing where the escrow account is located. The escrow, bond, and damage-list requirements do not apply if the Property is owned by a natural person who, together with his or her spouse and minor children, owns ten or fewer rental units and does not pay a third party to manage the Property or collect rent. | O.C.G.A. §§ 44-7-31, 44-7-32, 44-7-36 |
| Deposit interest required | No | |
| Move-in inspection | Before Tenant pays the security deposit, Landlord shall give Tenant a comprehensive list of any existing damage to the Property for Tenant to keep. Tenant may inspect the Property to check the list before moving in. Landlord and Tenant sign the list. If Tenant disagrees with any item, Tenant shall state the specific items in writing and sign that statement. | |
| Late fee grace period | None in statute | — |
| Late fee cap | none: No numeric cap; must be reasonable | — |
| Month-to-month notice | 60 days: A month-to-month tenancy is a tenancy at will under Georgia law. Landlord may end it by giving Tenant at least 60 days' notice, and Tenant may end it by giving Landlord at least 30 days' notice. | O.C.G.A. §§ 44-7-6, 44-7-7 |
| Nonpayment notice | 3 days: If Tenant does not pay rent, late fees, utilities, or other charges owed to Landlord when due, Landlord may give Tenant a written notice to vacate or pay all past-due amounts within three business days. The notice will be posted in a sealed envelope conspicuously on the door of the Property and also sent to Tenant's email address stated in this Lease. If Tenant neither pays nor delivers possession within three business days, Landlord may file a dispossessory affidavit in court. | O.C.G.A. § 44-7-50(c)-(d) |
| Entry notice | No statutory hours: Georgia has no statute setting an entry-notice period. Landlord will give Tenant at least 24 hours' notice before entering for inspections, repairs, or showings and will enter only at reasonable times, except in an emergency or when Tenant consents at the time of entry. | — |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | unclear: If Tenant leaves early, Landlord will make reasonable efforts to re-rent the Property, and rent received from a replacement tenant will be credited against what Tenant owes. | O.C.G.A. §§ 13-6-5, 44-7-34(a) |
| State fair housing classes (beyond federal) | None beyond federal | O.C.G.A. § 8-3-202 (Georgia Fair Housing Act: race, color, religion, sex, disability, familial status, national origin) |
| Eviction | Landlord may recover possession only through a dispossessory proceeding in court and a writ of possession executed by a sheriff, marshal, constable, or other authorized officer. Landlord will not lock Tenant out or remove Tenant's belongings without a writ of possession, and will not knowingly and willfully suspend Tenant's heat, cooling, light, or water service before the final disposition of any dispossessory proceeding. | O.C.G.A. §§ 44-7-50, 44-7-55, 44-7-14.1 |
| Habitability | Landlord shall keep the Property in repair, and the Property is fit for human habitation. These duties cannot be waived. | O.C.G.A. §§ 44-7-13, 44-7-2(b) |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Military service (Georgia law)
*O.C.G.A. § 44-7-22*

- **Who:** A service member (an active duty member of the regular or reserve component of the United States armed forces, the United States Coast Guard, the Georgia National Guard, or the Georgia Air National Guard on ordered federal duty for 90 days or longer) may terminate this Lease if: (1) permanent change of station orders require a move of 35 miles or more from the Property; (2) the service member is released from active duty or state active duty after leasing the Property while on active duty, and the Property is 35 miles or more from the service member's home of record before entering active duty; (3) after signing this Lease, the service member receives orders to move into government quarters; (4) after signing this Lease, the service member becomes eligible to live in government quarters and not moving would forfeit the basic allowance for housing; (5) the service member receives temporary duty, temporary change of station, or state active duty orders for more than 60 days to an area 35 miles or more from the Property; or (6) before taking possession, the service member receives a change of orders to an area 35 miles or more from the Property. If a service member dies during active duty, an adult member of the service member's immediate family may terminate this Lease.
- **Notice:** Tenant gives Landlord written notice of termination, effective on a date stated in the notice that is at least 30 days after Landlord receives it.
- **Documentation:** The notice must include a copy of the official military orders or a written verification signed by the service member's commanding officer. For a death during active duty, the notice must include a copy of the orders showing active duty or the commanding officer's written verification, and a copy of the death certificate.
- **Owes:** Tenant owes rent prorated to the effective date of termination, payable when it would otherwise be due, and no other rent or damages because of the early termination, including the early termination fee. No damages or penalties of any kind are owed if Tenant terminates 14 or more days before occupancy. This right cannot be waived or modified by agreement.

### Family violence or stalking protective order
*O.C.G.A. § 44-7-23*

- **Who:** Tenant may terminate this Lease when a civil family violence order, civil stalking order, criminal family violence order, or criminal stalking order has been issued protecting Tenant or Tenant's minor child, including when Tenant is a joint tenant who had no obligation to pay rent. A civil order qualifies if it is a protective order issued after a hearing of which the respondent had notice or at which the respondent was present, or an ex parte temporary protective order accompanied by a police report showing a basis for the order. A criminal order is an order of pretrial release after an arrest for family violence or stalking, or an order of probation after a conviction or a plea of guilty, nolo contendere, or first offender for family violence or stalking.
- **Notice:** Termination is effective 30 days after Tenant gives Landlord written notice of termination. Tenant may stay in the Property until then.
- **Documentation:** The notice must include a copy of the order and, if the order is an ex parte temporary protective order, a copy of the police report.
- **Owes:** Tenant owes rent prorated to the effective date of termination, payable when it would otherwise be due, and any delinquent rent or other sums owed before termination, but no other fees, rent, or damages because of the early termination, including the early termination fee. No damages or penalties of any kind are owed if Tenant terminates 14 or more days before occupancy. This right cannot be waived or modified by agreement.

### Active-duty change of station or temporary duty (rent liability limit)
*O.C.G.A. § 44-7-37*

- **Who:** If Tenant is on active duty with the United States military, signed this Lease for occupancy by Tenant or Tenant's immediate family, and later receives permanent change of station orders or temporary duty orders for more than three months, Tenant's liability under this Lease is limited.
- **Notice:** Tenant gives Landlord written notice and proof of the assignment.
- **Documentation:** Proof of the assignment, such as a copy of the orders.
- **Owes:** Tenant's liability for rent may not exceed 30 days' rent after the notice and proof are given, plus the cost of repairing damage to the Property caused by an act or omission of Tenant. No early termination fee is owed.


## State disclosures in the lease

- **Owner and Manager** (O.C.G.A. § 44-7-3): The owner of record of the Property, or the person authorized to act for the owner for service of process and for receiving and receipting demands and notices, and the person authorized to manage the Property, is {{landlord_name}}, {{landlord_address}}, unless Landlord identifies a different owner, agent, or manager in writing at or before the start of the tenancy. Landlord will notify Tenant of any change in these names or addresses within 30 days, in writing or by a notice posted in a conspicuous place.
- **Flooding** (O.C.G.A. § 44-7-20) *Only if flooding has damaged any part of the living space covered by this Lease at least three times during the five years before the date of this Lease*: Landlord notifies Tenant in writing that the Property has a propensity to flood. Flooding (inundation of the living space caused by an increased water level in an established water source such as a river, stream, or drainage ditch, or by ponding of water at or near where heavy or excessive rain fell) has damaged a portion of the living space covered by this Lease at least three times during the five years before the date of this Lease.

## Open questions for the reviewing attorney

- SOURCE: the official O.C.G.A. is published only through LexisNexis, and Justia blocks command-line access, so statute text was read from Justia's 2025 Code of Georgia (which already shows some 2026 acts) through a browser and saved verbatim. Annotations and case law were not used. Attorney to spot-check against the official 2026 O.C.G.A., especially for any 2026 session changes Justia may not yet show.
- HB 404 (2024 Safe at Home Act, effective July 1, 2024) added the two-month deposit cap (§ 44-7-30.1), the implied fitness-for-habitation term (§ 44-7-13(b)), and the three-business-day notice to vacate or pay before a dispossessory filing for nonpayment (§ 44-7-50(c)). Notices must be posted in a sealed envelope on the door and delivered by any additional method agreed in the lease (§ 44-7-50(d)). The lease designates email as the agreed additional method; attorney to confirm that choice.
- Month-to-month: Georgia has no separate month-to-month statute. A tenancy with no fixed end is a tenancy at will (§ 44-7-6), terminable on 60 days' notice from the landlord and 30 days' from the tenant (§ 44-7-7). Treating a post-term holdover as a tenancy at will relies on case law; attorney to confirm.
- Military: § 44-7-22's definition of 'service member' ends with 'on ordered federal duty for a period of 90 days or longer,' and it is unclear whether that phrase limits all listed components or only the Guard. Yet subsections (b)(2) and (b)(5) refer to state active duty. The lease quotes the definition verbatim. Attorney to advise. § 44-7-37 (1990) separately caps an active-duty tenant's rent liability at 30 days' rent after notice of PCS or TDY orders over three months. It is listed under 'other' and overlaps with § 44-7-22 and the SCRA.
- Domestic violence (§ 44-7-23): only the listed civil and criminal orders qualify. A police report alone, or a sexual assault without a qualifying order, does not. The right extends to a protected joint tenant even if that tenant had no rent obligation. Co-tenant liability after termination is not addressed.
- Mitigation is UNCLEAR. § 13-6-5 imposes a general duty to lessen contract damages, and § 44-7-34(a) lets a landlord keep the deposit for actual damages from a breach 'provided that the landlord attempts to mitigate.' Georgia appellate decisions have been reported as holding that a residential landlord has no duty to mitigate after abandonment, but no case was read. The lease commits the landlord to reasonable re-renting efforts.
- No statutory late-fee cap or grace period. § 44-7-50(c) treats late fees as amounts a tenant must pay to avoid dispossession. Unreasonable late fees may be challenged as penalties under general contract law (not researched).
- No statute sets landlord entry notice. The 24-hour notice is contractual.
- Casualty: Georgia has no statutory tenant termination right for fire or casualty. § 44-7-15 provides that destruction of the premises by fire or casualty not caused by the landlord does NOT abate the rent contracted to be paid. The builder lease is silent on casualty, which in Georgia leaves the tenant owing rent. Keycove should consider a contractual casualty clause for GA.
- Self-help: apart from the utility-shutoff ban (§ 44-7-14.1, criminal fine up to $500) and the non-waivable dispossessory procedure (§ 44-7-2(b)(4)), the bar on lockouts rests on case law and § 44-7-55(b) wrongful-conduct damages.
- § 44-7-2(c): a clause making the tenant pay the landlord's attorney's fees is void unless it also makes the landlord pay the tenant's fees on the landlord's breach. The builder has no fee-shifting clause.
- Small-landlord exemption (§ 44-7-36): a natural person who, with spouse and minor children, owns 10 or fewer units and does not use paid management is exempt from escrow (§ 44-7-31), bond (§ 44-7-32), the move-in and move-out damage lists (§ 44-7-33), and § 44-7-35 forfeiture. The 30-day return and written statement of reasons (§ 44-7-34) still apply. The lease states the list procedure for all landlords, which is more protective than required.
- § 44-7-20 (flood disclosure) carries a July 1, 2026 amendment (HB 1268, a Code Revision bill); the text read is the 3-floods-in-5-years rule. Failure to disclose creates tort liability for flood damage to tenant property but no termination right.
- § 44-7-50 has a version effective January 1, 2027 (SB 406) that adds sealing of dispossessory records; the notice rules are unchanged.
- Fair housing: the Georgia Fair Housing Act adds no classes beyond the federal seven. It exempts certain private owners of three or fewer single-family homes and owner-occupied buildings of four or fewer units, except from the advertising ban (§ 8-3-202(b)).
- Local law: § 44-7-19 is captioned 'Restrictions on rent regulation by local governments,' but its text was NOT read. City ordinances (for example Atlanta) were not researched.

## Statutes read (full text)

- O.C.G.A. § 44-7-2: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-2/
- O.C.G.A. § 44-7-3: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-3/
- O.C.G.A. § 44-7-6: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-6/
- O.C.G.A. § 44-7-7: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-7/
- O.C.G.A. § 44-7-13: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-13/
- O.C.G.A. § 44-7-14.1: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-14-1/
- O.C.G.A. § 44-7-15: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-15/
- O.C.G.A. § 44-7-20: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-20/
- O.C.G.A. § 44-7-22: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-22/
- O.C.G.A. § 44-7-23: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-23/
- O.C.G.A. § 44-7-24: https://law.justia.com/codes/georgia/title-44/chapter-7/article-1/section-44-7-24/
- O.C.G.A. § 44-7-30: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-30/
- O.C.G.A. § 44-7-30.1: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-30-1/
- O.C.G.A. § 44-7-31: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-31/
- O.C.G.A. § 44-7-32: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-32/
- O.C.G.A. § 44-7-33: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-33/
- O.C.G.A. § 44-7-34: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-34/
- O.C.G.A. § 44-7-35: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-35/
- O.C.G.A. § 44-7-36: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-36/
- O.C.G.A. § 44-7-37: https://law.justia.com/codes/georgia/title-44/chapter-7/article-2/section-44-7-37/
- O.C.G.A. § 44-7-50 (both the current and January 1, 2027 versions): https://law.justia.com/codes/georgia/title-44/chapter-7/article-3/section-44-7-50/
- O.C.G.A. § 44-7-55: https://law.justia.com/codes/georgia/title-44/chapter-7/article-3/section-44-7-55/
- O.C.G.A. § 8-3-201: https://law.justia.com/codes/georgia/title-8/chapter-3/article-4/section-8-3-201/
- O.C.G.A. § 8-3-202: https://law.justia.com/codes/georgia/title-8/chapter-3/article-4/section-8-3-202/
- O.C.G.A. § 13-6-5: https://law.justia.com/codes/georgia/title-13/chapter-6/section-13-6-5/
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
