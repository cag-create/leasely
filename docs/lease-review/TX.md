# Texas (TX): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `6afd2b89cf87fc15`
- **Framework:** Texas Property Code, Title 8, Chapter 91 (Provisions Generally Applicable to Landlords and Tenants) and Chapter 92 (Residential Tenancies); eviction under Chapter 24
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/TX-residential.html) · [co-living](samples/TX-coliving.html)

To approve after review: `pnpm lease:approve TX --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | No statutory cap: Texas law sets no maximum amount for a residential security deposit. | — |
| Deposit return | 30 days: Landlord will refund the security deposit, less lawful deductions, on or before the 30th day after Tenant surrenders the Property, together with a written description and itemized list of all deductions. Landlord will not deduct for normal wear and tear. Landlord is not obligated to return the deposit or provide the itemized list until Tenant gives Landlord a written statement of Tenant's forwarding address, but Tenant does not forfeit the deposit by failing to do so. No itemized list is required if Tenant owes rent when Tenant surrenders the Property and there is no controversy about the amount of rent owed. Tenant may not withhold any part of the last month's rent on the ground that the security deposit is security for unpaid rent. | Tex. Prop. Code §§ 92.103, 92.104, 92.107, 92.108 |
| Deposit holding | No statutory holding rule | — |
| Deposit interest required | No | |
| Move-in inspection | No statutory requirement (lease adds a contractual condition report) | |
| Late fee grace period | 2 days | Tex. Prop. Code § 92.019 |
| Late fee cap | percent (= $150.00 on $1,500 rent): A late fee may be charged only if any part of the rent remains unpaid two full days after the date it was originally due. The total late fee, including any initial fee and any daily fees combined, may not exceed 12 percent of the rent for the rental period if the Property is in a structure with no more than four dwelling units, or 10 percent of the rent for the rental period if the Property is in a structure with more than four dwelling units. | Tex. Prop. Code § 92.019 |
| Month-to-month notice | 30 days: Either Landlord or Tenant may end a month-to-month tenancy by giving the other written notice of termination. The tenancy ends on the later of the date stated in the notice or one month after the day the notice is given. If the tenancy ends on a day that is not the beginning or end of a rental period, Tenant owes rent only through the termination date. | Tex. Prop. Code § 91.001 |
| Nonpayment notice | 3 days: Before filing an eviction suit for nonpayment of rent, Landlord will give Tenant at least three days' written notice to vacate. If Tenant was not late or delinquent in paying rent before the month in which the notice is given, the notice will be a notice to pay rent or vacate. The notice may be delivered by mail, by delivery to the inside of the Property in a conspicuous place, by hand delivery to any tenant of the Property who is 16 years of age or older, or by e-mail or other electronic means if Landlord and Tenant have agreed in writing to electronic delivery. | Tex. Prop. Code § 24.005(a), (f-3) |
| Entry notice | No statutory hours: Texas statutes do not set a notice period for Landlord's entry. Landlord may enter the Property at reasonable times, after reasonable advance notice to Tenant except in an emergency, to inspect, make repairs, or show the Property to prospective tenants, buyers, or lenders. | — |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | statute: If Tenant abandons the Property in violation of this Lease, Landlord has a duty to mitigate its damages, including by making reasonable efforts to re-let the Property, and will credit against Tenant's liability any rent received from a replacement tenant. Any provision of this Lease that purports to waive this duty is void. | Tex. Prop. Code § 91.006 |
| State fair housing classes (beyond federal) | None beyond federal | Tex. Prop. Code §§ 301.021, 301.025 (Texas Fair Housing Act) |
| Eviction | Landlord may recover possession of the Property only through an eviction suit in the justice court of the precinct where the Property is located under Chapter 24 of the Texas Property Code, after giving any required notice to vacate. Landlord will not remove doors, windows, locks, or Landlord-furnished furniture, fixtures, or appliances, intentionally prevent Tenant from entering the Property, or interrupt utilities except as Sections 92.008 and 92.0081 of the Texas Property Code allow, and this Lease does not give Landlord the right to change the door locks because Tenant is delinquent in rent. | Tex. Prop. Code §§ 24.002, 24.004, 24.005, 24.0061, 92.008, 92.0081 |
| Habitability | Landlord will make a diligent effort to repair or remedy a condition that materially affects the physical health or safety of an ordinary tenant, or that arises from Landlord's failure to provide and maintain in good operating condition a device to supply hot water of a minimum temperature of 120 degrees Fahrenheit, after Tenant gives notice of the condition to the person or place where rent is normally paid and while Tenant is not delinquent in rent. Unless the condition was caused by normal wear and tear, Landlord is not required to repair a condition caused by Tenant, a lawful occupant, a member of Tenant's family, or Tenant's guest or invitee. | Tex. Prop. Code §§ 92.052, 92.056 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Military service (Texas law)
*Tex. Prop. Code § 92.017*

- **Who:** Tenant may terminate this Lease if Tenant is a servicemember or a dependent of a servicemember (as those terms are defined in the federal Servicemembers Civil Relief Act) and either (a) this Lease was signed by or on behalf of a person who, after signing it or during its term, enters military service, or (b) a servicemember signed this Lease while in military service and afterward receives military orders for a permanent change of station or to deploy with a military unit for a period of 90 days or more.
- **Notice:** Tenant must deliver a written notice of termination to Landlord or Landlord's agent. If this Lease provides for monthly payment of rent, termination is effective on the 30th day after the first date on which the next rental payment is due after the notice is delivered. Otherwise, termination is effective on the last day of the month following the month in which the notice is delivered.
- **Documentation:** With the notice, Tenant must deliver a copy of an appropriate government document showing the person's entrance into military service (for clause (a)) or a copy of the servicemember's military orders (for clause (b)).
- **Owes:** Tenant is released from liability for future rent and all other sums due under this Lease for terminating it early and vacating, including any early termination fee. Tenant remains liable for delinquent, unpaid rent and other sums owed before the termination date. Not later than the 30th day after the termination date, Landlord will refund all rent and other amounts Tenant paid in advance for any period after the termination date.

### Family violence, certain sexual offenses, or stalking
*Tex. Prop. Code §§ 92.016, 92.0161*

- **Who:** Tenant may terminate this Lease early if (a) Tenant or an occupant of the Property is protected from family violence (as defined in Section 71.004 of the Texas Family Code) by a qualifying court order, or Tenant has qualifying documentation of family violence against Tenant or an occupant; (b) within the preceding six months, Tenant was the victim of sexual assault, aggravated sexual assault, indecency with a child, sexual performance by a child, continuous sexual abuse of a young child or disabled individual, or an attempt to commit any of those offenses, or Tenant is the parent or guardian of, and lives with, a victim of one of those offenses; or (c) within the preceding six months, Tenant was the victim of stalking that took place on the premises or at any dwelling on the premises, or Tenant is the parent or guardian of, and lives with, such a victim.
- **Notice:** Tenant must give Landlord written notice of termination at least 30 days before the termination date. Tenant may vacate and avoid liability beginning on the day after all of the following have occurred: any qualifying court order Tenant relies on has been signed by a judge, Tenant has given Landlord a copy of the required documentation, Tenant has given the written notice, 30 days have passed since the notice was given, and Tenant has vacated the Property. If the family violence was committed by a cotenant or occupant of the Property, Tenant is not required to give the 30-day advance written notice when Tenant relies on a temporary injunction, a protective order, an order of emergency protection, or provider or advocate documentation.
- **Documentation:** For family violence, Tenant must provide a copy of a temporary injunction issued under Subchapter F, Chapter 6, Texas Family Code; a temporary ex parte order issued under Chapter 83, Family Code; a protective order issued under Chapter 85, Family Code; or an order of emergency protection under Article 17.292, Code of Criminal Procedure; or documentation of the family violence from a licensed health care services provider who examined the victim, a licensed mental health services provider who examined or evaluated the victim, or an advocate as defined by Section 93.001, Family Code, who assisted the victim. For the listed sexual offenses, Tenant must provide documentation from a licensed health care services provider who examined the victim, a licensed mental health services provider who examined or evaluated the victim, or an individual authorized under Chapter 420, Government Code, who provided services to the victim, or a protective order issued under Subchapter A, Chapter 7B, Code of Criminal Procedure (other than a temporary ex parte order). For stalking, Tenant must provide a protective order issued under Subchapter A or B, Chapter 7B, Code of Criminal Procedure (other than a temporary ex parte order), or documentation from one of those providers together with a law enforcement incident report (or, if none is available, another record kept by a law enforcement agency in the ordinary course of business) and, if the report identifies the victim by a pseudonym, a copy of the completed pseudonym form. Landlord will not disclose information received under this right to any other person except for a legitimate or customary business purpose or as otherwise required by law.
- **Owes:** Tenant is released from liability for future rent and any other sums due under this Lease for terminating it early and vacating, including any early termination fee. Tenant remains liable for delinquent, unpaid rent and other sums owed to Landlord before the termination.

### Death of a sole occupant tenant
*Tex. Prop. Code § 92.0162*

- **Who:** If Tenant dies before this Lease ends and was the sole occupant of the Property at the time of death, a representative of Tenant's estate may terminate this Lease.
- **Notice:** The representative must give Landlord or Landlord's agent written notice of termination, the deceased Tenant's property must be removed from the Property in accordance with Section 92.014(c) or (d), and the representative must sign an inventory of the removed property if Landlord requires one. Termination is effective on the later of the 30th day after the notice is given or the date all of those conditions are met. On written request after the notice, Landlord will give the representative a copy of this Lease.
- **Owes:** Tenant's estate is released from liability for future rent and other sums due for terminating early, but remains liable for delinquent, unpaid rent and for damage to the Property not caused by normal wear and tear that arose before termination.

### Property totally unusable after a casualty
*Tex. Prop. Code § 92.054(b)*

- **Who:** If, after a casualty loss not caused by the negligence or fault of Tenant, a member of Tenant's family, or Tenant's guest or invitee, the Property is as a practical matter totally unusable for residential purposes, either Landlord or Tenant may terminate this Lease.
- **Notice:** The terminating party gives the other written notice of termination at any time before repairs are completed.
- **Owes:** Tenant is entitled only to a pro rata refund of rent from the date Tenant moves out and to a refund of the security deposit as otherwise required by law.

### Landlord's failure to repair a health or safety condition
*Tex. Prop. Code §§ 92.052, 92.056*

- **Who:** Tenant may terminate this Lease if Landlord becomes liable under Section 92.056(b): Tenant gave notice to repair a condition that materially affects the physical health or safety of an ordinary tenant to the person or place where rent is normally paid; Tenant gave a subsequent written notice after a reasonable time, or sent the first notice by certified mail, return receipt requested, registered mail, or another tracked mail or delivery service; Landlord had a reasonable time to repair (presumed to be seven days) and did not make a diligent effort to repair; and Tenant was not delinquent in rent when any notice was given.
- **Notice:** Tenant may elect to terminate this Lease once those conditions are met.
- **Owes:** Tenant is entitled to a pro rata refund of rent from the termination date or the date Tenant moves out, whichever is later, and may deduct the security deposit from rent without a lawsuit or obtain a refund of the deposit as provided by law. A Tenant who terminates is not entitled to the repair-and-deduct remedies of Section 92.0561 or the judicial remedies of Section 92.0563(a)(1) and (2).

### Unlawful lockout, removal of property, or utility interruption
*Tex. Prop. Code §§ 92.008(f), 92.0081(h)*

- **Who:** Tenant may terminate this Lease if Landlord unlawfully removes a door, window, attic hatchway cover, lock, or other door or window hardware, or Landlord-furnished furniture, fixtures, or appliances; unlawfully prevents Tenant from entering the Property; or interrupts utility service in violation of Section 92.008 or 92.0081.
- **Notice:** Tenant may elect to terminate this Lease upon Landlord's violation.
- **Owes:** Tenant may also recover the civil penalty, actual damages, court costs, and reasonable attorney's fees those sections provide, less any delinquent rent or other sums Tenant owes Landlord.

### Flood loss without required floodplain notice
*Tex. Prop. Code § 92.0135(f)-(h)*

- **Who:** If Landlord fails to give the floodplain or flooding notice required by Section 92.0135 and Tenant suffers a substantial loss or damage to Tenant's personal property as a result of flooding (repair or replacement cost of 50 percent or more of the property's market value on the date of the flood), Tenant may terminate this Lease.
- **Notice:** Tenant must give Landlord written notice of termination no later than the 30th day after the loss or damage occurred. Termination is effective when Tenant surrenders possession of the Property.
- **Owes:** Not later than the 30th day after the termination date, Landlord will refund all rent and other amounts paid in advance for any period after that date. Tenant remains liable for delinquent, unpaid rent and other sums owed before the termination.

### Landlord's failure to provide or repair security devices
*Tex. Prop. Code §§ 92.164(a)(2), 92.165(2)*

- **Who:** Tenant may terminate this Lease if Landlord fails to install or rekey the security devices required by Sections 92.153 and 92.156(a), or fails to comply with Tenant's request to rekey, change, add, repair, or replace a security device under Section 92.156(b), 92.157, or 92.158 within the time limits of Subchapter D, Chapter 92.
- **Notice:** For devices required at move-in or rekeying required between tenants, Tenant must first serve a written request for compliance and may terminate if Landlord does not comply on or before the third day after receiving it. For other security-device requests, Tenant may terminate if Landlord does not comply within the time limits of Subchapter D.
- **Owes:** Tenant may terminate this Lease without court proceedings.

### Utility cutoff caused by Landlord's nonpayment
*Tex. Prop. Code § 92.301*

- **Who:** If Landlord has agreed in this Lease to furnish and pay for water, gas, or electric service to the Property and the utility company cuts off service, or gives Tenant written notice that service is about to be cut off, because Landlord did not pay the utility bill, Tenant may terminate this Lease.
- **Notice:** Tenant must give written notice of termination, and move-out must occur within 30 days from the date Tenant has notice from the utility company of a future cutoff or of an actual cutoff, whichever is sooner. This right ends if, before Tenant terminates or files suit, Landlord gives Tenant written evidence from the utility that all delinquent sums due the utility have been paid in full.
- **Owes:** If Tenant terminates, Tenant may deduct the security deposit from rent without a lawsuit or obtain a refund of the deposit as provided by law, recover a pro rata refund of advance rent from the termination date or move-out date, whichever is later, and recover actual damages as provided by Section 92.301.

### Texas military forces on state active duty
*Tex. Gov't Code § 437.213; 50 U.S.C. § 3955*

- **Who:** A member of the Texas military forces who is ordered to state active duty or to state training and other duty by the governor, the adjutant general, or another proper state authority has the same lease termination protections that the federal Servicemembers Civil Relief Act gives to persons in federal military service.
- **Notice:** Tenant gives Landlord written notice of termination. If rent is payable monthly, termination is effective 30 days after the first date on which the next rental payment is due after the notice is delivered; otherwise, termination is effective on the last day of the month following the month in which the notice is delivered.
- **Documentation:** The notice must include a copy of the state military orders.
- **Owes:** Tenant owes rent only through the effective date of termination. Landlord will refund rent paid in advance for any period after that date within 30 days after the effective date, and Landlord will not charge an early termination fee.


## State disclosures in the lease

- **Special statutory rights to terminate early** (Tex. Prop. Code §§ 92.016(f), 92.0161(g), 92.017(g)): Tenants may have special statutory rights to terminate the lease early in certain situations involving family violence or a military deployment or transfer. Tenants may have special statutory rights to terminate the lease early in certain situations involving certain sexual offenses or stalking.
- **Tenant's repair remedies** (Tex. Prop. Code §§ 92.056(g), 92.0561): If Landlord fails to repair a condition that materially affects the physical health or safety of an ordinary tenant as required by this Lease or the Texas Property Code, Tenant may be entitled to exercise remedies under Texas Property Code Sections 92.056 and 92.0561. If Tenant follows the procedures in those sections, Tenant may: (1) terminate this Lease and obtain a pro rata refund of rent and a refund of the security deposit as provided by law; (2) have the condition repaired or remedied and deduct the cost from a subsequent rent payment, with total repairs and deductions in any one month not exceeding one month's rent or $500, whichever is greater; and (3) obtain judicial remedies under Section 92.0563. These remedies are available only if Tenant meets the notice and timing requirements of those sections, including being current on rent when notice is given and allowing Landlord a reasonable time to repair, which is presumed to be seven days.
- **Floodplain and flooding notice** (Tex. Prop. Code § 92.0135) *Required for every lease with a term of 30 days or more. Landlord and Tenant must both sign the document containing this notice at or before signing the Lease*: Landlord ( ) is or ( ) is not aware that the dwelling you are renting is located in a 100-year floodplain. If neither box is checked, you should assume the dwelling is in a 100-year floodplain. Even if the dwelling is not in a 100-year floodplain, the dwelling may still be susceptible to flooding. The Federal Emergency Management Agency (FEMA) maintains a flood map on its Internet website that is searchable by address, at no cost, to determine if a dwelling is located in a flood hazard area. Most tenant insurance policies do not cover damages or loss incurred in a flood. You should seek insurance coverage that would cover losses caused by a flood. Landlord ( ) is or ( ) is not aware that the dwelling you are renting has flooded at least once within the last five years.
- **Ownership and management disclosure** (Tex. Prop. Code § 92.201): On Tenant's request, Landlord will give Tenant in writing, within seven days after receiving the request, the name and a street or post office box address of the holder of record title to the Property and, if an entity located off-site is primarily responsible for managing the Property, the name and street address of that management company.
- **Emergency telephone number** (Tex. Prop. Code § 92.020): Landlord will provide Tenant a telephone number for reporting emergencies related to a condition of the Property that materially affects the physical health or safety of an ordinary tenant. If Landlord has an on-site management or superintendent's office, that number will be answered 24 hours a day and will be posted prominently outside the office.
- **Copy of this Lease** (Tex. Prop. Code § 92.024): Landlord will provide at least one complete copy of this Lease to at least one Tenant no later than the third business day after all parties sign it, and will provide a complete copy to any other Tenant who has not received one no later than the third business day after receiving that Tenant's written request.

## Open questions for the reviewing attorney

- REQUIRED LEASE STATEMENTS: If the lease lacks language substantially equivalent to the two sentences in the statutory_termination_rights_notice disclosure, a tenant who terminates under § 92.016, § 92.0161, or § 92.017 is also released from all delinquent rent owed on the termination date (§§ 92.016(f), 92.0161(g), 92.017(g)). CONFIRMED against the primary text of § 92.016(f) and § 92.0161(g): the disclosure reproduces both statutory sentences VERBATIM ('...involving family violence or a military deployment or transfer.' and '...involving certain sexual offenses or stalking.'). The builder must include it in every Texas lease and co-living agreement; it has no font requirement, so no emphasis is set.
- BOLD/UNDERLINE REQUIREMENT: § 92.056(g) requires the lease to inform the tenant of the §§ 92.056 and 92.0561 remedies in underlined or bold print. Now encoded with emphasis 'bold_underline' on repair_remedies_notice, so the builder renders it bold + underlined (confirmed against primary text: '(g) A lease must contain language in underlined or bold print...'). Other provisions that must be underlined or bold IF used, but are not currently separate disclosures: advance notice of surrender as a condition of deposit refund (§ 92.103(b)); tenant-repair-at-tenant-expense agreements (§ 92.006(e), (f)); the security-device notice that extends landlord's cure period to 7 days (§ 92.164(b)). If any is added later, set emphasis 'bold_underline' on it too.
- LATE FEE: capPercent is set to the conservative 10% (structures with more than four units). Section 92.019(a-1) allows 12% for structures with four or fewer units, and a higher fee only if it does not exceed the landlord's uncertain damages; the builder should select 12% only when the unit count is known to be four or fewer. Fee can be charged only after rent has remained unpaid two full days after the due date; notice of the fee must be in the written lease. Violation: $100 + 3x the fee + attorney's fees.
- LOCKOUTS: § 92.0081(d)(1) allows a nonpayment lock change only if the right is placed in the lease (plus strict notice/24-hour key rules). The eviction text deliberately states this lease does NOT grant that right. If Keycove ever wants to support Texas lockouts, it needs a dedicated clause and workflow; attorney should confirm the omission is the desired policy.
- MONTH-TO-MONTH: § 91.001 uses 'one month after the day on which the notice is given', not 30 days; monthToMonthDays is 30 as an approximation, the rule text states the one-month standard. The parties may agree to a different period in a signed instrument (§ 91.001(e)).
- NOTICE TO VACATE: § 24.005 allows the lease to contract for a shorter or longer period than 3 days. Covered properties under the federal CARES Act may require a 30-day notice; § 24.005(c-1) lets the landlord file after the state notice but bars service of the writ until the federal period runs. SB 38 (2025, eff. Jan. 1, 2026) rewrote much of Chapter 24 and added § 24.0043 (only the legislature may modify eviction procedures), which likely preempts city eviction-notice ordinances.
- FAMILY VIOLENCE / SEX OFFENSES: The statutes release 'the tenant'; they say nothing about co-tenants who are not victims. § 92.016(c-1) excuses the 30-day notice when the abuser is a cotenant/occupant, but (c)(4) still keys off a 30-day period after notice; the effective date in that scenario is ambiguous. § 92.0161 was amended by HB 47 (2025) to add pseudonym-form documentation for stalking.
- MILITARY: § 92.017(j) permits a waiver if the tenant or a dependent moves into base housing or other housing within 30 miles, but only in a signed document separate from the lease. The generator must never put that waiver in the lease body. Gov't Code § 437.213 extends SCRA protections (including 50 U.S.C. § 3955) to Texas military forces on state active duty or state training duty; mapping SCRA's 'orders' requirements onto state orders is an interpretation.
- CO-LIVING: § 92.010 caps occupancy at three adults times the number of bedrooms (with fair-housing and family-violence exceptions); enforce in room-rental listings.
- OTHER TEXAS LEASE RULES the generator should respect: § 92.026 (landlord may not prohibit lawful firearm possession in the unit, vehicles, or paths of entry); § 92.011 (landlord must accept cash unless the written lease requires another traceable method); § 92.021 (guarantor bound only for the original term unless the lease states the renewal cutoff date and conditions); § 92.3515 (tenant selection criteria notice and signed acknowledgment at application); § 92.111 (fee in lieu of deposit must be optional and in a signed writing); § 92.1031 (lease cancellation fee only for pre-occupancy cancellations with a replacement tenant); § 92.008(h) (submetered electricity disconnection only if the lease grants it); § 92.019 statement of late fees on request (§ 92.0191).
- NO FEE CAP: Texas has no statutory cap on early termination fees or liquidated damages for residential leases (outside § 92.1031 pre-occupancy cancellations).
- FAIR HOUSING: Texas Fair Housing Act protects only the federal classes. Local ordinances (e.g., Austin, Dallas) add classes such as source of income or sexual orientation; not reviewed. Texas Local Government Code § 214.902 (rent control preemption) was not read.
- SECURITY DEVICES / SMOKE ALARMS: Subchapters D and F of Chapter 92 impose detailed installation duties (keyed deadbolts, door viewers, pin locks, rekeying within 7 days of turnover, smoke alarms). Not encoded here except as termination remedies; consider a Texas-specific security-device clause.

## Statutes read (full text)

- Tex. Prop. Code § 91.001: https://tcss.legis.texas.gov/resources/PR/htm/PR.91.htm
- Tex. Prop. Code § 91.006: https://tcss.legis.texas.gov/resources/PR/htm/PR.91.htm
- Tex. Prop. Code § 92.006: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.008: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.0081: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.010: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.011: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.0135: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.016: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.0161: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.0162: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.017: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.019: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.0191: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.020: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.021: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.023: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.024: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.026: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.052: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.054: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.056: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.0561: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.062: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code §§ 92.101-92.113: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code §§ 92.164, 92.165: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.201: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.301: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code §§ 92.331, 92.333: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code § 92.3515: https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm
- Tex. Prop. Code §§ 24.001, 24.002, 24.004, 24.0043, 24.005, 24.0061: https://tcss.legis.texas.gov/resources/PR/htm/PR.24.htm
- Tex. Prop. Code §§ 301.003, 301.021: https://tcss.legis.texas.gov/resources/PR/htm/PR.301.htm
- Tex. Gov't Code §§ 437.213, 437.2131: https://tcss.legis.texas.gov/resources/GV/htm/GV.437.htm
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
