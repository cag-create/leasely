# Virginia (VA): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `341a4860753bc137`
- **Framework:** Virginia Residential Landlord and Tenant Act, Va. Code Ann. §§ 55.1-1200 et seq.
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/VA-residential.html) · [co-living](samples/VA-coliving.html)

To approve after review: `pnpm lease:approve VA --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | 2 month(s) rent: The security deposit, however it is labeled, may not exceed two months' rent. If Landlord requires damage insurance or renter's insurance premiums to be paid before the tenancy begins, the security deposit and those premiums together may not exceed two months' rent. | Va. Code Ann. §§ 55.1-1226(A), 55.1-1208(A)(7), 55.1-1206(C) |
| Deposit return | 45 days: Within 45 days after the later of the end of the tenancy or the date Tenant vacates, Landlord shall give Tenant a written notice itemizing the deposit and any deductions, together with any amount due to Tenant. Landlord may apply the deposit only to accrued rent (including reasonable late charges stated in this Lease), damage caused by Tenant's failure to meet Tenant's duties under Va. Code § 55.1-1227 less reasonable wear and tear, other charges provided in this Lease, and actual damages for breach under § 55.1-1251. If there is more than one Tenant, Landlord will issue one check payable to all Tenants and send it to a forwarding address provided by any Tenant, unless all Tenants agree otherwise in writing. Within five days after Landlord receives notice that Tenant intends to vacate (or when Landlord asks Tenant to vacate), Landlord will notify Tenant in writing of Tenant's right to be present at the move-out inspection; if Tenant asks in writing to attend, the inspection will be held within 72 hours after Tenant delivers possession. If damages exceed the deposit and require a third-party contractor, Landlord will say so in writing within the 45 days and then has 15 more days to itemize them. | Va. Code Ann. § 55.1-1226 |
| Deposit holding | No statutory holding rule | — |
| Deposit interest required | No | |
| Move-in inspection | Within five days after Tenant moves in, Landlord shall give Tenant a written report itemizing any damage to the Property existing at move-in, including whether there is any visible evidence of mold in readily accessible interior areas. The report is deemed correct unless Tenant objects to it in writing within five days after receiving it. | |
| Late fee grace period | None in statute | Va. Code Ann. § 55.1-1204(E) |
| Late fee cap | percent (= $150.00 on $1,500 rent): A late charge may be charged only because this written Lease provides for it, and it may not exceed the lesser of 10% of the monthly rent or 10% of the remaining balance due and owed by Tenant. | Va. Code Ann. § 55.1-1204(E) |
| Month-to-month notice | 30 days: Either Landlord or Tenant may end a month-to-month tenancy by serving written notice on the other at least 30 days before the next rent due date (seven days before the next rent due date for a week-to-week tenancy). If Tenant stays on month-to-month with Landlord's agreement, the terms of this Lease continue, except that Landlord may change the rent by written notice that takes effect on the next rent due date at least 30 days after the notice. | Va. Code Ann. § 55.1-1253(A), (D) |
| Nonpayment notice | 14 days: If rent is not paid when due, Landlord may serve Tenant with a written notice stating that the rent is unpaid and that Landlord will terminate this Lease if the rent is not paid within 14 days. If Tenant does not pay within 14 days after the notice is served, Landlord may terminate this Lease and seek possession through the court. The same 14-day notice applies if a rent check is returned for insufficient funds or an electronic payment is rejected, in which case payment must be made by cash, cashier's check, certified check, or a completed electronic funds transfer. | Va. Code Ann. § 55.1-1245(F) |
| Entry notice | 72 hours: Tenant shall not unreasonably withhold consent for Landlord to enter to inspect, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show the Property to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or where it is impractical, Landlord will give Tenant notice before entering and will enter only at reasonable times. For routine maintenance that Tenant has not requested, Landlord will give at least 72 hours' notice, the maintenance will be performed within 14 days after the notice, and the notice will state the last date on which it may be performed. For any other non-emergency entry, Landlord will give at least 24 hours' notice. No advance notice is required for maintenance Tenant has requested. Landlord will not abuse the right of access or use it to harass Tenant. | Va. Code Ann. § 55.1-1229(A) |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | statute: If Tenant leaves early, Landlord shall mitigate its damages by making reasonable efforts to re-rent the Property. Landlord's claim for rent ends when a new tenancy begins, and Landlord will not seek a judgment for accelerated rent for the rest of the term after recovering possession. | Va. Code Ann. §§ 55.1-1251, 55.1-1249 |
| State fair housing classes (beyond federal) | elderliness (age 55 or older), source of funds, sexual orientation, gender identity, military status | Va. Code Ann. §§ 36-96.1:1, 36-96.3 (Virginia Fair Housing Law) |
| Eviction | Landlord may recover possession only through an unlawful detainer action in general district court and a writ of eviction. Landlord will not remove or exclude Tenant, interrupt an essential service, refuse Tenant access, or take action to make the Property unsafe in order to regain possession. | Va. Code Ann. §§ 8.01-126, 55.1-1252, 55.1-1243.1 |
| Habitability | Landlord shall comply with applicable building and housing codes materially affecting health and safety, make all repairs and do whatever is necessary to put and keep the Property in a fit and habitable condition, keep shared common areas clean and structurally safe, maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies, prevent moisture accumulation and mold growth, provide receptacles for and arrange removal of garbage and waste, and supply running water, reasonable amounts of hot water at all times, and reasonable air conditioning (if provided) and heat in season. | Va. Code Ann. § 55.1-1220 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Military service (Virginia law)
*Va. Code Ann. § 55.1-1235*

- **Who:** A member of the Armed Forces of the United States, or a member of the National Guard serving on full-time duty or as a civil service technician with the National Guard, may terminate this Lease if the member (1) receives permanent change of station orders; (2) receives temporary duty orders of more than three months; (3) is discharged or released from active duty with the Armed Forces, or from full-time duty or technician status with the National Guard; (4) is ordered to report to government-supplied quarters, resulting in the forfeiture of basic allowance for quarters; or (5) receives a stop movement order in response to a local, national, or global emergency, effective for an indefinite period or for at least 30 days, that prevents the member from living in the Property.
- **Notice:** Tenant serves on Landlord a written notice of termination stating an effective date that is at least 30 days after the first date on which the next rent payment is due after the notice is given.
- **Documentation:** Before the termination date, Tenant gives Landlord a copy of the official notification of the orders or a signed letter from Tenant's commanding officer confirming the orders.
- **Owes:** Tenant owes rent through the termination date. Landlord may not charge any liquidated damages, including the early termination fee. Tenant remains responsible for Tenant's duties under Va. Code § 55.1-1227, including damage to the Property beyond reasonable wear and tear.

### Family abuse, sexual abuse or assault, stalking, or trafficking
*Va. Code Ann. § 55.1-1236*

- **Who:** A Tenant who is a victim of family abuse (as defined in Va. Code § 16.1-228), sexual abuse (as defined in § 18.2-67.10) or other criminal sexual assault, stalking, or human trafficking may terminate Tenant's obligations under this Lease if, during the term of this Lease, (1) the victim obtained a protective order under Va. Code § 16.1-253.1, 16.1-279.1, 19.2-152.9, or 19.2-152.10 and gives notice while the order or any extension is in effect, or (2) a court entered an order convicting the perpetrator of, or a magistrate, law-enforcement agency, grand jury, or court issued a warrant, summons, information, or indictment charging a person with, one of those crimes against the victim. A conviction supports termination of the lease in effect when the conviction order is entered and of one later lease.
- **Notice:** Termination is effective 28 days after Tenant serves a written notice of termination on Landlord.
- **Documentation:** Tenant gives Landlord a copy of the protective order, or of the conviction order, warrant, summons, information, or indictment.
- **Owes:** Tenant pays rent when due through the effective date of termination and keeps Tenant's duties under Va. Code § 55.1-1227 until then. Landlord may not charge any liquidated damages, including the early termination fee. Any co-tenants remain responsible for rent for the rest of the term. If the perpetrator is the only remaining tenant, Landlord may terminate this Lease and recover actual damages from the perpetrator.

### Virginia National Guard on state active duty (state extension of the SCRA)
*Va. Code Ann. § 44-102.1(A)*

- **Who:** A member of the Virginia National Guard called to active duty under Title 32 of the United States Code, or to state active duty by the Governor, under orders for 30 consecutive days or more has the same lease termination rights under the federal Servicemembers Civil Relief Act, 50 U.S.C. § 3955 (described above), as a member called to federal active duty.
- **Notice:** Tenant delivers written notice of termination. For a lease with monthly rent, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered.
- **Documentation:** The notice must include a copy of the military orders.
- **Owes:** Tenant owes rent prorated to the termination date and no early termination fee. Rent paid in advance for any period after termination is refunded within 30 days.

### Fire or casualty damage
*Va. Code Ann. § 55.1-1240*

- **Who:** If fire or casualty damages the Property so that Tenant's enjoyment of it is substantially impaired, or required repairs can only be made if Tenant vacates, Tenant may terminate this Lease.
- **Notice:** Tenant vacates and, within 14 days after vacating, serves Landlord with written notice of the intent to terminate; this Lease ends on the date Tenant vacated. Beginning January 1, 2027, the notice period is 21 days.
- **Owes:** Rent is prorated as of the date of the casualty. Landlord returns the security deposit under Va. Code § 55.1-1226 and any prepaid rent, unless Landlord reasonably believes Tenant, an authorized occupant, or a guest or invitee caused the damage, in which case Landlord provides a written statement and may recover actual damages.

### Serious hazard at the start of the tenancy
*Va. Code Ann. § 55.1-1234.1*

- **Who:** If, at the beginning of the tenancy, a condition exists that is a fire hazard or a serious threat to the life, health, or safety of occupants, including a rodent infestation or a lack of heat, hot or cold running water, electricity, or adequate sewage disposal, Tenant may terminate this Lease.
- **Notice:** Tenant gives Landlord written notice of the intent to terminate within seven days after the date possession was to transfer to Tenant.
- **Owes:** Landlord refunds all deposits and rent paid within 15 business days after the later of delivery of the notice or Tenant vacating, unless Landlord gives Tenant written notice within 15 business days that it refuses the termination, with its reasons. No early termination fee is owed.

### Visible mold at move-in
*Va. Code Ann. § 55.1-1215*

- **Who:** If Landlord's move-in inspection report states that there is visible evidence of mold in the Property, Tenant may choose to terminate the tenancy and not take possession, or not remain in possession.
- **Notice:** Tenant tells Landlord of the choice after receiving the move-in report. If Tenant instead chooses to stay, Landlord will remediate the mold within five business days and give Tenant a new report.
- **Owes:** No early termination fee is owed.

### Landlord's material noncompliance
*Va. Code Ann. § 55.1-1234*

- **Who:** If Landlord materially fails to comply with this Lease, or fails to comply with the Virginia Residential Landlord and Tenant Act in a way that materially affects health and safety, Tenant may terminate this Lease, unless Tenant, an authorized occupant, or a guest caused the condition.
- **Notice:** Tenant serves written notice describing the breach and stating that this Lease will terminate on a date at least 30 days after Landlord receives the notice if the breach is not remedied within 21 days. For a breach that cannot be remedied, or an intentional repeat of a breach of a like nature that Landlord previously remedied, the notice states that this Lease will terminate on a date at least 30 days after Landlord receives it.
- **Owes:** No early termination fee is owed, and Landlord returns the security deposit under Va. Code § 55.1-1226.

### Unlawful entry or harassment by Landlord
*Va. Code Ann. § 55.1-1210*

- **Who:** If Landlord makes an unlawful entry, a lawful entry in an unreasonable manner, or repeated demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease.
- **Notice:** 
- **Owes:** No early termination fee is owed, and Tenant may recover actual damages and reasonable attorney fees.

### Unlawful exclusion or interruption of essential services
*Va. Code Ann. § 55.1-1243.1*

- **Who:** If Landlord willfully and without court authority removes or excludes Tenant, interrupts an essential service, or makes the Property unsafe, Tenant may petition the general district court, which at the full hearing may terminate this Lease at Tenant's request.
- **Notice:** 
- **Owes:** No early termination fee is owed. Landlord returns the full security deposit and is liable for actual damages, statutory damages of the greater of $5,000 or four months' rent, and reasonable attorney fees.

### Missing required disclosures (military air zone, defective drywall, methamphetamine)
*Va. Code Ann. §§ 55.1-1217, 55.1-1218, 55.1-1219*

- **Who:** If Landlord was required to disclose before signing that the Property is in a military air installation noise zone or accident potential zone, has unremediated defective drywall known to Landlord, or was used to manufacture methamphetamine and not cleaned up as required, and did not, Tenant may terminate this Lease.
- **Notice:** For a missing noise zone or accident potential zone disclosure, Tenant mails written notice by certified or registered mail, return receipt requested, during the first 30 days of the lease term. For drywall or methamphetamine, Tenant gives written notice within 60 days after discovering the condition. Termination is effective on the later of 15 days after the notice is mailed or the date through which rent has been paid, but no more than one month after mailing.
- **Owes:** No early termination fee is owed.

### Death of the sole tenant
*Va. Code Ann. § 55.1-1256*

- **Who:** If Tenant is the only tenant under this Lease, still lives in the Property, and dies, this Lease is deemed terminated as of the date of death.
- **Notice:** Landlord gives at least 10 days' written notice to the person named in the rental application or this Lease as the authorized contact in the event of Tenant's death (or to Tenant at the Property if no one is named) that personal property not claimed within 10 days will be treated as abandoned. Authorized occupants must vacate before the end of that 10-day period.
- **Owes:** Tenant's estate remains liable for Landlord's actual damages under Va. Code § 55.1-1251, which Landlord must mitigate, instead of the early termination fee.


## State disclosures in the lease

- **Statement of Tenant Rights and Responsibilities** (Va. Code Ann. § 55.1-1204(B), (H)): Landlord has provided Tenant, with this Lease, the Statement of Tenant Rights and Responsibilities developed by the Virginia Department of Housing and Community Development, and the parties sign the Department's form acknowledging that Tenant received it. Landlord will give Tenant a copy of this signed Lease and the Statement within 10 business days after this Lease takes effect.
- **Fee Disclosure Statement** (Va. Code Ann. § 55.1-1204.1): No additional security deposits or rent shall be charged unless they are listed below or incorporated into this agreement by way of a separate addendum after execution of this rental agreement. Security deposit: {{security_deposit}}. Rent per payment period: {{monthly_rent}} per month. Any one-time charges due before the start date or included in the first rent payment are itemized by Landlord on the first page of this Lease.
- **Owner and Manager** (Va. Code Ann. § 55.1-1216(A), (B), (D)): The person authorized to manage the Property, and the owner or person authorized to act for the owner for service of process and for receiving notices and demands, is {{landlord_name}}, {{landlord_address}}, unless Landlord identifies a different owner or manager in writing at or before the start of the tenancy. Landlord will keep this information current. If the Property is sold, Landlord will notify Tenant of the sale and give Tenant the purchaser's name, address, and telephone number.
- **Mold** (Va. Code Ann. §§ 55.1-1215, 55.1-1220(A)(5)): Landlord's written move-in inspection report states whether there is any visible evidence of mold in readily accessible interior areas of the Property. Landlord will maintain the Property to prevent the accumulation of moisture and the growth of mold, and Tenant shall promptly notify Landlord in writing of any visible mold or moisture accumulation. Where there is visible evidence of mold, Landlord will promptly remediate it and reinspect.
- **Military Air Installation Noise or Accident Potential Zone** (Va. Code Ann. § 55.1-1217) *Only if the Property is in a locality where a military air installation is located*: Before Tenant signed this Lease, Landlord gave Tenant a written disclosure stating whether the Property is in a noise zone or accident potential zone, or both, as designated on the locality's official zoning map, and naming the zone.
- **Defective Drywall** (Va. Code Ann. § 55.1-1218) *Only if Landlord knows the Property has defective drywall that has not been remediated*: Landlord discloses that the Property contains defective drywall, as defined in Va. Code § 36-156.1, that has not been remediated.
- **Prior Methamphetamine Manufacture** (Va. Code Ann. § 55.1-1219) *Only if Landlord knows the Property was used to manufacture methamphetamine and has not been cleaned up as required*: Landlord discloses that the Property was previously used to manufacture methamphetamine and has not been cleaned up in accordance with the guidelines established under Va. Code § 32.1-11.7.
- **Planned Conversion or Displacement** (Va. Code Ann. § 55.1-1216(C)) *Only for a multifamily property where an application to register it as a condominium or cooperative has been filed, or where there is, within six months, a plan for tenant displacement through demolition, substantial rehabilitation, or conversion*: Landlord discloses in writing any pending condominium or cooperative registration and any plan, within six months, to displace tenants through demolition or substantial rehabilitation of the property or its conversion to office, hotel, motel, or planned unit development use.
- **Renter's Insurance and Flood Risk** (Va. Code Ann. § 55.1-1206(D)) *Only if this Lease does not require Tenant to carry renter's insurance*: Landlord is not responsible for Tenant's personal property, and Landlord's insurance does not cover Tenant's personal property. If Tenant wishes to protect Tenant's personal property, Tenant should obtain renter's insurance. Renter's insurance does not cover flood damage. Tenant may contact the Federal Emergency Management Agency (FEMA), or visit the websites for FEMA's National Flood Insurance Program or the Virginia Department of Conservation and Recreation's Flood Risk Information System, to learn whether the Property is in a special flood hazard area.
- **Submetering and Utility Allocation** (Va. Code Ann. § 55.1-1212) *Only if the Property uses energy submetering, energy allocation equipment, water and sewer submetering equipment, or a ratio utility billing system*: The Property uses submetering, energy allocation equipment, or a ratio utility billing system, and Tenant's share of those utility charges is determined by the method stated in the Utilities section of this Lease. Any monthly billing, account set-up, or move-out fees are limited to those stated in this Lease. A late charge on such a utility bill may not exceed $5.00 and may not be charged until at least 15 days after the bill is mailed or delivered.
- **Pesticide Application** (Va. Code Ann. § 55.1-1223): Landlord will give Tenant written notice at least 48 hours before applying an insecticide or pesticide in the Property, unless Tenant requested the application or agrees to a shorter period. A Tenant with concerns about a specific product shall notify Landlord in writing at least 24 hours before the scheduled application.
- **Carbon Monoxide Alarm** (Va. Code Ann. § 55.1-1229(E)): On Tenant's written request, Landlord will install a carbon monoxide alarm in the Property within 90 days and may charge Tenant a reasonable fee for the equipment and installation.

## Open questions for the reviewing attorney

- BUILDER GAP: § 55.1-1204.1 requires the fee disclosure statement (itemized security deposit, rent per period, and one-time charges due before commencement or with the first payment, preceded by the exact statutory sentence) to BEGIN ON THE FIRST PAGE of the written lease. The builder renders disclosures near the end, so the 'fee_disclosure' entry alone does not satisfy the statute. The builder needs a first-page block for VA, and the one-time charges need a data field.
- BUILDER GAP: § 55.1-1204(B), (H) require the DHCD Statement of Tenant Rights and Responsibilities to be given with the lease plus a signed DHCD acknowledgment form, and a copy of both within 10 business days. A landlord may not file or maintain any action (including unlawful detainer) for a lease violation until the Statement has been provided. Keycove should attach the current DHCD form to every VA lease packet.
- PAYMENTS (relevant to Keycove's Stripe rent collection): § 55.1-1204(J) requires landlords to accept rent and deposits by check and money order (with a receipt for cash or money order), bars any payment-processing fee unless the landlord offers a fee-free alternative method, and caps card/electronic convenience fees at the third-party processor's actual charge. Landlords with four or fewer units (or a 10% or smaller interest in four or fewer) need not accept cards. If Keycove passes card or ACH fees to Virginia tenants, a fee-free option must exist.
- § 55.1-1204(K): a landlord owning more than four units (or more than a 10% interest in more than four) must give at least 60 days' written notice of a rent increase on renewal and of nonrenewal. From July 1, 2027 (2026 amendment, cc. 722/723/1066), the rent-increase notice becomes 90 days and must set a renewal deadline at least 30 days out. § 55.1-1253(B) separately requires 60 days' notice for mass nonrenewal of month-to-month tenancies in multifamily properties.
- Several sections have future versions: § 55.1-1240 (casualty, 21 days from 1/1/2027), §§ 55.1-1244 and 55.1-1258 (1/1/2027), and §§ 55.1-1202, -1203, -1204, -1209, -1212, -1245 (7/1/2027). The profile uses the text in effect on 2026-11-08 and mentions the 2027 casualty change in the lease text. The nonpayment notice is 14 days in all three versions of § 55.1-1245.
- Entry: the statute fixes 72 hours only for routine maintenance the tenant has not requested. Other non-emergency entries need 'notice' at reasonable times with no fixed period. The 24-hour period for other entries is contractual, chosen as a conservative default.
- Military: § 55.1-1235 (VRLTA) covers Armed Forces members and National Guard members on full-time duty or civil service technicians. Separately, § 44-102.1(A) extends federal SCRA rights to Virginia National Guard members on Title 32 or Governor-ordered state active duty for 30 or more consecutive days; it is listed under 'other'. The SCRA's own coverage conditions (for example, orders of 90 days or more for a lease signed during service) presumably still apply to the § 44-102.1 extension; attorney to confirm.
- Death of the sole tenant (§ 55.1-1256(C)): the statute deems the lease terminated by the landlord and leaves the estate liable for actual damages with a duty to mitigate. The profile treats this as replacing the liquidated early termination fee. Attorney to confirm the estate cannot be charged the fee.
- Early termination fee: Virginia has no statutory cap. § 55.1-1251 limits post-termination recovery to actual damages and bars a judgment for accelerated rent after possession. Attorney to confirm the builder's two-month liquidated-damages option is enforceable under Virginia liquidated damages and penalty case law. §§ 55.1-1235(C) and 55.1-1236(D) expressly bar liquidated damages for military and victim terminations.
- § 55.1-1208 prohibits clauses requiring the tenant to pay the landlord's attorney fees except as the chapter provides, and § 55.1-1208(C) bars maintenance or repair fees unless caused by a tenant violation. § 55.1-1208(A)(8) bars pre-dispute SCRA waivers. The builder's general provisions comply, but any Keycove fee add-ons must be checked.
- No statutory late-fee grace period applies to a written lease. The 'late after the 5th' rule in § 55.1-1204(C)(4) applies only when the landlord does not offer a written lease.
- Holdover: § 55.1-1253(C) lets the lease set holdover liquidated damages of up to 150% of the per diem rent (per diem only for HUD-regulated units). The builder does not use this.
- Roomers are 'tenants' under § 55.1-1200, so the VRLTA applies in full to co-living room rentals. Hotels, motels, and boardinghouses are exempt only for stays of 90 consecutive days or less (§ 55.1-1201(D)).
- Local law: the VRLTA applies statewide and supersedes local landlord-tenant ordinances (§ 55.1-1201(A), (E)), except local property-maintenance codes, rental inspection programs, and lock/peephole ordinances (§ 55.1-1221). Virginia localities have no rent control.
- Fair housing: elderliness means age 55 or older. Military status covers uniformed service members, reserve components, veterans, and dependents. Source of funds is defined to include any assistance, benefit, or subsidy program, so housing vouchers are covered. The exemptions in § 36-96.2 (small private owners and the like) were NOT read; attorney to confirm which landlords are exempt.

## Statutes read (full text)

- Va. Code Ann. §§ 55.1-1200 to 55.1-1262 (full chapter as of 2026-11-08): https://law.lis.virginia.gov/vacodefull/title55.1/chapter12/
- Va. Code Ann. § 55.1-1200: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1200/
- Va. Code Ann. § 55.1-1201: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1201/
- Va. Code Ann. § 55.1-1202: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1202/
- Va. Code Ann. § 55.1-1204 (both the current and July 1, 2027 versions): https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1204/
- Va. Code Ann. § 55.1-1204.1: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1204.1/
- Va. Code Ann. § 55.1-1206: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1206/
- Va. Code Ann. § 55.1-1208: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1208/
- Va. Code Ann. § 55.1-1210: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1210/
- Va. Code Ann. § 55.1-1212: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1212/
- Va. Code Ann. § 55.1-1214: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1214/
- Va. Code Ann. § 55.1-1215: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1215/
- Va. Code Ann. § 55.1-1216: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1216/
- Va. Code Ann. § 55.1-1217: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1217/
- Va. Code Ann. § 55.1-1218: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1218/
- Va. Code Ann. § 55.1-1219: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1219/
- Va. Code Ann. § 55.1-1220: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1220/
- Va. Code Ann. § 55.1-1223: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1223/
- Va. Code Ann. § 55.1-1226: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1226/
- Va. Code Ann. § 55.1-1229: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1229/
- Va. Code Ann. § 55.1-1234: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1234/
- Va. Code Ann. § 55.1-1234.1: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1234.1/
- Va. Code Ann. § 55.1-1235: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1235/
- Va. Code Ann. § 55.1-1236: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1236/
- Va. Code Ann. § 55.1-1240 (both the current and January 1, 2027 versions): https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1240/
- Va. Code Ann. § 55.1-1243.1: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1243.1/
- Va. Code Ann. § 55.1-1243.2: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1243.2/
- Va. Code Ann. § 55.1-1245 (all three versions): https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1245/
- Va. Code Ann. § 55.1-1249: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1249/
- Va. Code Ann. § 55.1-1251: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1251/
- Va. Code Ann. § 55.1-1252: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1252/
- Va. Code Ann. § 55.1-1253: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1253/
- Va. Code Ann. § 55.1-1256: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1256/
- Va. Code Ann. § 44-102.1: https://law.lis.virginia.gov/vacode/title44/chapter1/section44-102.1/
- Va. Code Ann. § 36-96.1:1: https://law.lis.virginia.gov/vacode/title36/chapter5.1/section36-96.1:1/
- Va. Code Ann. § 36-96.3: https://law.lis.virginia.gov/vacode/title36/chapter5.1/section36-96.3/
- Va. Code Ann. § 8.01-126: https://law.lis.virginia.gov/vacode/title8.01/chapter3/section8.01-126/
- 50 U.S.C. § 3955: https://www.law.cornell.edu/uscode/text/50/3955
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
