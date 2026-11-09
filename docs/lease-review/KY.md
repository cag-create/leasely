# Kentucky (KY): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `e650d1d0886a4db3`
- **Framework:** Kentucky Revised Statutes Chapter 383, including the Uniform Residential Landlord and Tenant Act, KRS 383.505 to 383.715, where adopted by the local government (KRS 383.500)
- **Researcher confidence:** medium (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/KY-residential.html) · [co-living](samples/KY-coliving.html)

To approve after review: `pnpm lease:approve KY --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | No statutory cap: Kentucky law sets no maximum amount for a security deposit. | — |
| Deposit return | 30 days: At the end of the tenancy Landlord shall inspect the Property and prepare a comprehensive written list of any damage that is the basis for a charge against the security deposit, with the estimated cost of repairing each item. Tenant has the right to inspect the Property to check the list's accuracy, and Landlord and Tenant sign the list; if Tenant disagrees with any item, Tenant states the specific items in writing and signs that statement. The deposit may be applied only to damage beyond ordinary wear and tear and to rent owed. Landlord will return the balance of the deposit, with the itemized list of deductions, to Tenant's last known or reasonably determinable address within 30 days after the tenancy ends. If Tenant leaves without paying the last month's rent and does not ask for the deposit, Landlord may apply it to the rent owed after 30 days. If a refund is due and Tenant does not respond within 60 days after Landlord sends notice of the refund amount, Landlord may keep the deposit. | KRS 383.580(3)–(7) |
| Deposit holding | Landlord shall deposit the security deposit in an account used only for security deposits at a bank or other lending institution regulated by Kentucky or a federal agency, and shall tell Tenant the location of the account and the account number before Tenant pays the deposit. Landlord may not keep any part of the deposit if it was not held in that separate account and the move-in and move-out damage lists were not provided. | KRS 383.580(1), (4) |
| Deposit interest required | No | |
| Move-in inspection | Before Tenant pays the security deposit, Landlord shall give Tenant a comprehensive written list of any existing damage to the Property that would be the basis for a charge against the deposit, with the estimated cost of repairing it. Tenant may inspect the Property before moving in to check the list's accuracy. Landlord and Tenant sign the list, and the signatures are conclusive evidence of its accuracy except as to hidden defects. If Tenant disagrees with any item, Tenant states the specific items in writing and signs that statement. | |
| Late fee grace period | None in statute | — |
| Late fee cap | none: No numeric cap; must be reasonable | — |
| Month-to-month notice | 30 days: Either Landlord or Tenant may end a month-to-month tenancy by written notice given to the other at least 30 days before the rental due date specified in the notice (7 days before the termination date for a week-to-week tenancy). | KRS 383.695(1)–(2); KRS 383.195 |
| Nonpayment notice | 7 days: If rent is unpaid when due, Landlord may give Tenant written notice of the nonpayment and of Landlord's intention to terminate this Lease if the rent is not paid within 7 days. If Tenant does not pay within 7 days after that notice, Landlord may terminate this Lease and file a forcible detainer action in District Court. | KRS 383.660(2); KRS 383.210 |
| Entry notice | 48 hours: Tenant will not unreasonably withhold consent for Landlord to enter the Property to inspect, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show the Property to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or where it is impracticable, Landlord will give Tenant at least two days' notice of intent to enter and will enter only at reasonable times. Landlord may enter without consent in an emergency, and will not abuse the right of access or use it to harass Tenant. | KRS 383.615 |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | statute: If Tenant abandons the Property, Landlord shall make reasonable efforts to re-rent it at a fair rental. If Landlord re-rents the Property for a term beginning before this Lease ends, this Lease ends on the date the new tenancy begins. | KRS 383.670(3) |
| State fair housing classes (beyond federal) | None beyond federal | KRS 344.360 (race, color, religion, sex, familial status, disability, national origin) |
| Eviction | Landlord may recover possession only through a forcible detainer action in the District Court of the county where the Property is located and a warrant of restitution issued by the court. Landlord will not lock Tenant out, interrupt heat, electricity, water, gas, or other essential services, or remove Tenant's belongings to force Tenant out, except after abandonment or surrender or as the court orders. | KRS 383.200, 383.210; KRS 383.690 |
| Habitability | Landlord shall comply with applicable building and housing codes materially affecting health and safety; make all repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition; keep common areas clean and safe; maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies or is required to supply; and supply running water, reasonable amounts of hot water at all times, and reasonable heat between October 1 and May 1, except where heat or hot water is generated by an installation within Tenant's exclusive control. | KRS 383.595 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Kentucky National Guard on Title 32 or State active duty
*KRS 38.510*

- **Who:** A member of the Kentucky National Guard called to active duty under Title 32 of the United States Code, or to State active duty by the Governor, under orders for 30 days or more, has the same lease termination rights as a member called to federal active duty under the federal Servicemembers Civil Relief Act (described above).
- **Notice:** Tenant gives written notice of termination as described for the federal Servicemembers Civil Relief Act above.
- **Documentation:** Tenant provides a copy of the Title 32 or State active duty orders, or equivalent documentation, as described for the federal Servicemembers Civil Relief Act above.
- **Owes:** Tenant owes rent only as allowed under the federal Servicemembers Civil Relief Act (rent prorated to the effective termination date and no early termination fee).

### Protective order holders (domestic violence or interpersonal protective order)
*KRS 383.300*

- **Who:** Tenant may terminate this Lease if Tenant, or a minor member of Tenant's household, is protected by a valid domestic violence order under KRS 403.740 or a valid interpersonal protective order under KRS 456.060 that restrains the other party from unauthorized contact. If the order was obtained before this Lease was signed, Tenant must also show Landlord a safety concern that arose after this Lease was signed. A person who is both the protected tenant and the restrained individual cannot use this right.
- **Notice:** Tenant gives Landlord written notice of termination, effective on a date stated in the notice that is at least 30 days after Landlord receives it.
- **Documentation:** The notice must include a copy of the valid protective order.
- **Owes:** Tenant owes rent prorated to the effective termination date, payable when it would otherwise be due, and is not liable for any other rent or fees, including the early termination fee, due solely to the early termination. Landlord will not make a negative credit report or give a negative character reference because of the termination. No damages or penalties are owed if Tenant terminates 14 or more days before occupancy. The tenancy continues for any remaining tenants, and the restrained individual named in the order is liable to Landlord for Landlord's economic losses from the early termination and remains liable for rent if excluded from the Property.

### Fire or casualty
*KRS 383.650; KRS 383.170*

- **Who:** If the Property is damaged or destroyed by fire, casualty, the elements, an act of God, or other cause so that enjoyment of the Property is substantially impaired, Tenant may terminate this Lease. Where the building is destroyed by fire or other casualty without Tenant's fault or neglect, Tenant is not liable for rent for the rest of the term.
- **Notice:** Tenant gives Landlord 14 days' notice of termination, but Tenant may move out immediately.
- **Owes:** Rent is accounted for as of the date of the casualty, Landlord returns all unused prepaid rent, and Tenant owes no early termination fee.

### Landlord's material noncompliance
*KRS 383.625*

- **Who:** If Landlord materially fails to comply with this Lease, or fails to comply with Landlord's maintenance duties in a way that materially affects health and safety, Tenant may terminate this Lease, unless the condition was caused by Tenant, a family member, or a guest.
- **Notice:** Tenant gives Landlord written notice specifying the breach and stating that this Lease will end on a date at least 30 days after Landlord receives the notice if the breach is not remedied within 14 days. If Landlord remedies the breach before the termination date, this Lease continues. If substantially the same breach recurs within six months, Tenant may terminate on at least 14 days' written notice.
- **Owes:** Tenant owes no early termination fee, Landlord returns all prepaid rent, and Tenant may also recover damages.

### Unlawful ouster or shutoff of essential services
*KRS 383.655*

- **Who:** If Landlord unlawfully removes or excludes Tenant from the Property, or willfully interrupts heat, running water, hot water, electricity, gas, or another essential service, Tenant may recover possession or terminate this Lease.
- **Notice:** No advance notice period is required.
- **Owes:** Tenant owes no early termination fee, Landlord returns all prepaid rent, and Tenant may recover up to three months' rent and a reasonable attorney's fee.


## State disclosures in the lease

- **Manager and Owner Identity** (KRS 383.585): At or before the start of the tenancy, Landlord discloses to Tenant in writing the name and address of the person authorized to manage the Property and of an owner, or a person authorized to act for the owner, for service of process and for receiving notices and demands. Landlord will keep this information current.
- **Security Deposit Account** (KRS 383.580(1)): Before Tenant pays the security deposit, Landlord informs Tenant of the location of the separate security deposit account and the account number.
- **Calling for Emergency Help** (KRS 383.302): Landlord will not terminate this Lease or impose any penalty on Tenant because Tenant requests help from peace officers or other emergency assistance.

## Open questions for the reviewing attorney

- URLTA IS LOCAL-OPTION IN KENTUCKY. KRS 383.500 authorizes cities, counties, and urban-county governments to adopt KRS 383.505–383.705 in their entirety and without amendment; the URLTA provisions (deposit account and move-in/move-out damage lists § 383.580, disclosure § 383.585, maintenance § 383.595, 2-day entry notice § 383.615, 7-day nonpayment notice § 383.660, 30-day periodic notice § 383.695, mitigation § 383.670, self-help ban § 383.690, tenant remedies §§ 383.625–.655) have the force of law ONLY in adopting localities. Louisville Metro and Lexington-Fayette are commonly reported as adopters, among others; I did not verify a current list of adopting jurisdictions. Keycove should collect whether the property is in a URLTA jurisdiction or treat the URLTA terms as contract terms statewide (the approach taken here).
- Design choice: this profile writes the URLTA rules into every Kentucky lease as contractual commitments, because they are more protective of the tenant and lawful everywhere. Outside URLTA localities the default statewide rules are much thinner: no deposit statute at all, no entry-notice statute, no pre-filing nonpayment notice (forcible detainer under KRS 383.200–.285 with 3 days' notice of trial per KRS 383.210), month-to-month/at-will termination on one month's written notice by the landlord (KRS 383.195), and holdover rules in KRS 383.160. Attorney should confirm landlords outside URLTA areas are comfortable being bound to these terms, and that citing KRS 383.5xx in a non-URLTA lease does not mislead.
- Deposit return deadline: KRS 383.580 sets NO return deadline. It provides only (6) a 30-day wait before applying the deposit to unpaid last-month rent when the tenant does not demand it, and (7) a 60-day window for the tenant to respond to a refund notice before the landlord may keep the deposit. returnDays = 30 is a Keycove contractual choice, not statutory. Strict compliance matters: under § 383.580(4) the landlord forfeits the right to retain ANY of the deposit if it was not in a separate account AND the move-in and move-out lists were not provided (the statute says 'and'; courts may read it disjunctively — flag).
- KRS 383.198 (2024) prohibits any local ordinance relating to landlord-tenant law that conflicts with state law; KRS 383.500 already bars non-URLTA local landlord-tenant ordinances on URLTA subjects. Local source-of-income or other tenant-protection ordinances may be preempted or limited — attorney should check before relying on any local rule.
- KRS 383.199 (2025): in a county containing a consolidated local government (Louisville/Jefferson County), for new leases after June 27, 2025, an owner may not lease a single-family home, multifamily unit, or ADU on a lot in a 'traditional single-family home zone' that contains a single-family home unless the owner primarily resides on the lot (does not apply to a lot with only one single-family home and no ADU). Relevant to co-living/room rentals and ADUs in Louisville — not encoded.
- Military: KRS 38.510 extends SCRA rights to Kentucky National Guard members on Title 32 active duty or State active duty by the Governor with orders of 30+ days. It cites the old SCRA codification (50 U.S.C. secs. 501 et seq.). No other Kentucky statute giving servicemembers lease-termination rights was found in KRS Chapter 38.
- DV: KRS 383.300 applies statewide (not URLTA-dependent) to leases created or renewed on or after June 29, 2017. Only a DVO (KRS 403.740) or IPO (KRS 456.060) qualifies for TERMINATION; emergency protective orders, temporary IPOs, and pretrial no-contact orders give only anti-retaliation and lock-change protections. If the order predates the lease, the tenant must 'demonstrate a safety concern' arising after execution (standard undefined). No third-party certification route. Statute contains no explicit waiver ban, but § 383.570 (URLTA areas) bars waiver of URLTA rights. Lock-change right (§ 383.300(4)) is not encoded.
- Late fees: no Kentucky statute caps late fees or sets a grace period; KRS 383.010 provides 6% annual interest on unpaid rent. capType = 'none'.
- Fair housing: KRS 344.360 protects only the federal seven classes (no additional state classes). Several cities/counties (e.g., Louisville Metro, Lexington-Fayette, Covington) have local fairness ordinances adding sexual orientation and gender identity, and some have addressed source of income; not verified here and potentially affected by KRS 383.198.
- Habitability: KRS 383.595 applies only in URLTA localities. Outside them, Kentucky has historically not recognized an implied warranty of habitability by statute; the lease imposes the URLTA duties contractually. No statewide statutory early termination right for senior/disabled tenants or death of tenant was found.
- KRS 383.570 (URLTA areas): lease may not include tenant waiver of URLTA rights, confession of judgment, agreement to pay landlord's attorney's fees, or exculpation/indemnity of the landlord.

## Statutes read (full text)

- KRS 383.010: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35671
- KRS 383.160: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35694
- KRS 383.170: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35695
- KRS 383.195: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35698
- KRS 383.198: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=54458
- KRS 383.199: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=56174
- KRS 383.200: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35699
- KRS 383.210: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35701
- KRS 383.300: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=47052
- KRS 383.302: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=47053
- KRS 383.500: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35717
- KRS 383.505: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35718
- KRS 383.535: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35724
- KRS 383.545: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35726
- KRS 383.560: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35729
- KRS 383.565: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35730
- KRS 383.570: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35731
- KRS 383.580: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35733
- KRS 383.585: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35734
- KRS 383.595: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35736
- KRS 383.615: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35740
- KRS 383.625: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35742
- KRS 383.635: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35744
- KRS 383.640: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35745
- KRS 383.645: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35746
- KRS 383.650: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35747
- KRS 383.655: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35748
- KRS 383.660: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35749
- KRS 383.670: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35751
- KRS 383.685: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35754
- KRS 383.690: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35755
- KRS 383.695: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35756
- KRS 383.705: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35758
- KRS 38.510: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=21578
- KRS 344.360: https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=32639
- KRS Chapter 38 (National Guard) section list, searched for lease provisions: https://apps.legislature.ky.gov/law/statutes/chapter.aspx?id=37194
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
