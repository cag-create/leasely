# Michigan (MI): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `eba84eefb67b63a6`
- **Framework:** Michigan landlord-tenant law: Landlord-Tenant Relationships Act (security deposits), MCL 554.601 et seq.; Truth in Renting Act, MCL 554.631 et seq.; Revised Statutes of 1846, MCL 554.131 et seq.; and summary proceedings under chapter 57 of the Revised Judicature Act, MCL 600.5701 et seq.
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/MI-residential.html) · [co-living](samples/MI-coliving.html)

To approve after review: `pnpm lease:approve MI --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | 1.5 month(s) rent: The security deposit, including any required prepayment of rent other than the first full rental period, may not exceed one and one-half months' rent. | MCL 554.601(d), 554.602 |
| Deposit return | 30 days: Within 30 days after Tenant's occupancy ends, Landlord shall mail Tenant either the full deposit or an itemized notice of damages listing each claimed item, its estimated repair cost, and the basis for the charge, together with a check, money order, or electronic transfer (made within 10 days after mailing the notice) for the balance. If Landlord does not send the notice of damages within 30 days, Landlord must return the full deposit. Tenant must give Landlord a forwarding address in writing within 4 days after moving out, and must respond to a notice of damages by mail within 7 days. Landlord may keep disputed amounts only by agreement, by Tenant's failure to respond, or by filing suit within 45 days after occupancy ends; the deposit may be applied only to actual damage beyond normal habitation, unpaid rent, rent due for early termination by Tenant, and unpaid utility bills. | MCL 554.607, 554.609–554.613 |
| Deposit holding | Landlord shall deposit the security deposit in a regulated financial institution, unless Landlord has filed a cash or surety bond with the Michigan Secretary of State as allowed by law. No later than 14 days after Tenant takes possession, Landlord shall give Tenant a written notice stating Landlord's name and address for communications, the name and address of the financial institution or surety holding or securing the deposit, and Tenant's obligation to provide a forwarding address within 4 days after moving out. | MCL 554.603, 554.604 |
| Deposit interest required | No | |
| Move-in inspection | At the start of the Lease, Landlord shall give Tenant two blank copies of an inventory checklist identical to the move-out checklist and covering all Landlord-owned items in the Premises. Tenant should note the condition of the Premises and return one completed copy to Landlord within 7 days after receiving possession. Tenant may request and receive a copy of the last move-out checklist showing what was charged to the prior tenant. At move-out, Landlord shall complete a termination inventory checklist listing all damage Landlord claims Tenant caused. | |
| Late fee grace period | None in statute | — |
| Late fee cap | none: No numeric cap; must be reasonable | — |
| Month-to-month notice | 30 days: Either party may end a month-to-month tenancy by written notice at least as long as one rental period (one month when rent is paid monthly). The notice ends the tenancy at the end of a period equal to the interval between rent payments. | MCL 554.134(1) |
| Nonpayment notice | 7 days: If Tenant fails to pay rent when due, Landlord may serve a written demand for possession stating the amount due, and may begin summary proceedings if Tenant does not pay within 7 days after service. Accelerated rent is not rent due for this purpose. | MCL 554.134(2), 600.5714(1)(a), 600.5716 |
| Entry notice | No statutory hours: Except in an emergency, Landlord will give Tenant reasonable advance notice and will enter the Premises only at reasonable times to inspect, make repairs, or show the Premises. | — |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | case_law: Landlord has a duty to minimize damages by making reasonable efforts to re-rent the Premises, and any rent Landlord receives from a replacement tenant will be credited against what Tenant owes. Tenant is not liable for the total of any accelerated rent because of this duty, and either party may have a court determine the actual amount owed, if any. | MCL 554.633(1)(i), (k) |
| State fair housing classes (beyond federal) | age, marital status, sexual orientation, gender identity or expression, source of income (landlords with 5 or more rental units in Michigan, counting related entities) | MCL 37.2502; MCL 554.601c; MCL 37.1502 |
| Eviction | Landlord may recover possession only through summary proceedings in district court under chapter 57 of the Revised Judicature Act. Landlord will not use force, change or add locks without immediately providing keys, remove doors, windows, or Tenant's belongings, or interrupt essential utilities to remove Tenant. | MCL 600.5701 et seq.; MCL 600.5711; MCL 600.2918 |
| Habitability | Landlord covenants that the Premises and all common areas are fit for the use intended by the parties, and Landlord will keep the Premises in reasonable repair during the term and comply with applicable state and local health and safety laws, except for disrepair or violations caused by Tenant's willful or irresponsible conduct or lack of conduct. | MCL 554.139 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Domestic violence, sexual assault, or stalking
*MCL 554.601b*

- **Who:** A tenant who has a reasonable apprehension of present danger to the tenant or the tenant's child from domestic violence, sexual assault, or stalking may have special statutory rights to seek a release of rental obligation under MCL 554.601b.
- **Notice:** Tenant must send Landlord written notice of intent to seek a release by certified mail, with a written statement that Tenant or Tenant's child has a reasonable apprehension of present danger. Tenant is released from rent no later than the first day of the second month that rent is due after the notice is given, but the release does not take effect before Tenant vacates.
- **Documentation:** The notice must include one of the following: a valid personal protection order or foreign protection order, or an order removing an abusive person from the home; a valid probation, conditional release, or parole order with a no-contact condition protecting Tenant or Tenant's child; a police report that resulted in charges filed within 14 days before the notice (or earlier charges plus a showing of a verifiable present threat); or a statement verified by a qualified third party (a domestic violence or sexual assault counselor, licensed health professional, mental health professional, or qualifying clergy member) in the form set out in the statute.
- **Owes:** The release does not apply to prepaid amounts such as prepaid first and last months' rent, and Landlord may still apply the security deposit as the law allows. Other tenants on this Lease remain bound by it. Landlord will not reveal Tenant's forwarding address or documentation to the person Tenant identified as the source of the danger.

### Senior housing or inability to live independently
*MCL 554.601a*

- **Who:** A Tenant who has occupied the Premises for more than 13 months may terminate this Lease if, during the term, Tenant becomes eligible to take possession of a subsidized rental unit in senior citizen housing (housing for persons 62 or older subsidized under a local, state, or federal program), or becomes incapable of living independently.
- **Notice:** Tenant must give Landlord at least 60 days' written notice.
- **Documentation:** Tenant must give Landlord written proof of eligibility for the senior housing unit, or a physician's notarized statement certifying that Tenant is incapable of living independently.
- **Owes:** Tenant owes rent through the end of the 60-day notice period and no early termination fee.


## State disclosures in the lease

- **Truth in Renting Act Notice** (MCL 554.634(2)): NOTICE: Michigan law establishes rights and obligations for parties to rental agreements. This agreement is required to comply with the Truth in Renting Act. If you have a question about the interpretation or legality of a provision of this agreement, you may want to seek assistance from a lawyer or other qualified person.
- **Landlord's Address for Notices** (MCL 554.603, 554.634(1)): Notices required under the Truth in Renting Act and the security deposit law shall be given to Landlord, {{landlord_name}}, at {{landlord_address}}.
- **Forwarding Address Notice** (MCL 554.603): You must notify your landlord in writing within 4 days after you move of a forwarding address where you can be reached and where you will receive mail; otherwise your landlord shall be relieved of sending you an itemized list of damages and the penalties adherent to that failure.
- **Security Deposit Institution** (MCL 554.603, 554.604): Landlord holds Tenant's security deposit at {{deposit_institution}}. No later than 14 days after Tenant takes possession, Landlord will give Tenant written notice stating Landlord's name and address for communications under the security deposit law and the name and address of this regulated financial institution, or of the surety on Landlord's bond.
- **Inventory Checklist** (MCL 554.608(4)): You should complete this checklist, noting the condition of the rental property, and return it to the landlord within 7 days after obtaining possession of the rental unit. You are also entitled to request and receive a copy of the last termination inventory checklist which shows what claims were chargeable to the last prior tenants.
- **Domestic Violence Notice** (MCL 554.601b(1)): A tenant who has a reasonable apprehension of present danger to him or her or his or her child from domestic violence, sexual assault, or stalking may have special statutory rights to seek a release of rental obligation under MCL 554.601b.

## Open questions for the reviewing attorney

- No Michigan statute gives servicemembers a residential lease-termination right beyond the federal SCRA. MCL 32.517 (Michigan Military Act) only bars forfeiture of executory contracts and seizure of chattels against members on state active duty for more than 7 days, plus 90-day utility protections; it is not a termination right, so military is null. A 2005 bill (HB 5477) that would have required a Guard/Reserve termination clause does not appear in current MCL 554.601a.
- MCL 554.601a is a REQUIRED lease term ('A rental agreement shall provide that...'), not just a statutory right. It is encoded in earlyTermination.other so the lease states it; confirm the builder always renders it for MI.
- MCL 554.601b lets the landlord either include the quoted DV sentence in the lease or post/deliver an identical notice. It is included as a disclosure (verbatim) so the lease satisfies the statute on its own.
- Font-size requirements, now reflected with emphasis 'bold_underline' on the three affected disclosures: the MCL 554.603 forwarding-address STATEMENT must be in 12-point boldface at least 4 points larger than the body (set on 'forwarding_address'); the MCL 554.608(4) checklist notice must be in 12-point boldface at the top of the checklist's first page (set on 'inventory_checklist'); the MCL 554.634(2) TRA notice must be in a prominent place in type not smaller than 12-point (set on 'truth_in_renting_notice' — the statute requires prominent 12-point, not strictly bold, so bold+underline over-satisfies it). emphasis renders bold+underline only; POINT SIZE (12-pt, and the 4-pt-larger-than-body rule for 554.603) must be confirmed in the generated PDF, since data flags alone cannot enforce it.
- The deposit notice under MCL 554.603 must name the financial institution or surety. The 'deposit_institution' disclosure now uses the {{deposit_institution}} placeholder (bank name + address) so the holding institution appears in the lease itself; the landlord must fill it before sending. The lease still promises the full written 14-day notice (name/address for communications + institution).
- Truth in Renting Act 554.633(1)(o), added by 2026 PA 103 (effective Sept. 21, 2026): if the lease allows more than one rent payment method, at least one must carry no extra charge or fee. Make sure Keycove's payment terms always include a fee-free option for MI leases (e.g., ACH without a convenience fee).
- Truth in Renting Act also voids clauses that: waive habitability remedies or deposit-act rights, exculpate the landlord, waive jury/notice rights, shift attorney fees beyond statute, accelerate rent without the minimize-damages statement, release the duty to mitigate, or let the landlord change terms mid-lease without consent (except the listed 30-day-notice adjustments). Review the generic lease body for MI conflicts (especially any attorney-fee or acceleration clause).
- Mitigation: no Michigan statute creates the duty; it is case law, but the TRA (554.633(1)(i), (k)) presupposes it ('the landlord's obligation to minimize damages'). Leading case not verified from a primary source.
- Late fees: no statute. Michigan courts review late fees as liquidated damages vs. penalty; no numeric cap verified. Entry: no statute; 'reasonable notice' language is contractual.
- MCL 554.139(2) lets parties modify the repair covenant for leases with a current term of at least 1 year; the lease text does not attempt this.
- MCL 554.609 amended by 2026 PA 102 (effective Sept. 21, 2026) to allow electronic return of the deposit balance within 10 days after mailing the notice of damages; the notice of damages must still be mailed and must carry the 7-day-response statement in large bold type.
- Source of income protection (MCL 554.601c, 37.2502(3)) applies only to landlords with 5 or more rental units in Michigan, counting related entities; effective April 2, 2025.
- Local law: Ann Arbor (early-leasing / showing restrictions, source of income), Detroit (rental registration and certificate of compliance required before collecting rent), Grand Rapids and Lansing (source-of-income and rental certification rules), East Lansing (rental licensing). Not encoded.

## Statutes read (full text)

- MCL 554.601 (definitions): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-601
- MCL 554.601a (senior housing / incapacity termination): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-601a
- MCL 554.601b (domestic violence release): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-601b
- MCL 554.601c (source of income): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-601c
- MCL 554.601d (source of income remedies): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-601d
- MCL 554.602 (deposit cap): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-602
- MCL 554.603 (deposit notice): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-603
- MCL 554.604 (deposit holding / bond): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-604
- MCL 554.605: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-605
- MCL 554.606 (no waiver): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-606
- MCL 554.607 (permitted uses): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-607
- MCL 554.608 (inventory checklists): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-608
- MCL 554.609 (notice of damages): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-609
- MCL 554.610: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-610
- MCL 554.611 (forwarding address): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-611
- MCL 554.612 (tenant response): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-612
- MCL 554.613 (action for damages; double deposit): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-613
- MCL 554.614: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-614
- MCL 554.615: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-615
- MCL 554.616: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-616
- MCL 554.631–554.641 (Truth in Renting Act, each section): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-633
- MCL 554.634 (mandatory statements): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-634
- MCL 554.636 (TRA remedies): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-636
- MCL 554.134 (notice to quit): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-134
- MCL 554.139 (covenants of fitness and repair): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-139
- MCL 600.5714 (summary proceedings grounds): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-600-5714
- MCL 600.5716 (demand for possession): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-600-5716
- MCL 600.5711 (peaceable entry): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-600-5711
- MCL 600.2918 (lockouts / unlawful interference): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-600-2918
- MCL 37.2502 (ELCRA real estate): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-37-2502
- MCL 37.2103 (ELCRA definitions): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-37-2103
- MCL 37.1502 (PWDCRA real estate): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-37-1502
- MCL 32.517 (Michigan Military Act; checked, no lease termination right): https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-32-517
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
