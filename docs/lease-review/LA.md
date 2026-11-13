# Louisiana (LA): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `0e958c2c08ec7362`
- **Framework:** Louisiana Civil Code lease articles, La. Civ. Code arts. 2668–2729, and the residential deposit statute, La. R.S. 9:3251 et seq.
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/LA-residential.html) · [co-living](samples/LA-coliving.html)

To approve after review: `pnpm lease:approve LA --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | No statutory cap: Louisiana law sets no limit on the amount of the security deposit. | — |
| Deposit return | 30 days: Within one month after this Lease terminates, Landlord shall return the deposit to Tenant, who shall furnish Landlord a forwarding address at the end of the Lease. Landlord may retain only the portion reasonably necessary to remedy a default by Tenant or to remedy unreasonable wear to the Property. If Landlord retains any portion, Landlord shall deliver Tenant an itemized statement accounting for the amounts retained and the reasons, either within one month after the tenancy terminates or within fifteen days after the date that is one month after the tenancy terminates. This return requirement does not apply if Tenant abandons the Property. Landlord's willful failure to comply (including failure to remit within thirty days after Tenant's written demand) entitles Tenant to the amount wrongfully retained plus $300 or twice the amount wrongfully retained, whichever is greater. | La. R.S. 9:3251, 9:3252 |
| Deposit holding | No statutory holding rule | — |
| Deposit interest required | No | |
| Move-in inspection | No statutory requirement (lease adds a contractual condition report) | |
| Late fee grace period | None in statute | — |
| Late fee cap | none: No numeric cap; must be reasonable | — |
| Month-to-month notice | 10 days: A lease with a fixed term ends at the end of the term without notice; if the parties remain without notice, the lease is reconducted (continued) as a month-to-month lease. Either party may terminate a month-to-month lease (including a reconducted one) by giving the other written notice at least 10 calendar days before the end of the month; for a lease whose term is longer than a month, the notice must be given at least 30 calendar days before the end of the period. | La. Civ. Code arts. 2723, 2727, 2728, 2729 |
| Nonpayment notice | 5 days: If Tenant fails to pay rent when due, Landlord may dissolve this Lease and seek possession. Before filing an eviction, Landlord must deliver Tenant a written notice to vacate that allows Tenant not less than five days from its delivery to vacate, unless Tenant has waived notice to vacate in this Lease. | La. Civ. Code art. 2704; La. Code Civ. Proc. art. 4701 |
| Entry notice | No statutory hours: Louisiana has no statute setting a landlord entry-notice period, and Landlord must protect Tenant's peaceful possession. Landlord will give Tenant at least 24 hours' notice before entering for inspections, repairs, or showings, except in an emergency or when Tenant consents at the time of entry. | — |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | statute: Louisiana law requires an obligee to make reasonable efforts to mitigate the damage caused by the other party's failure to perform, so if Tenant leaves early Landlord will make reasonable efforts to re-rent the Property, and rent received from a replacement tenant is credited against what Tenant owes. | La. Civ. Code art. 2002; La. R.S. 9:3260 |
| State fair housing classes (beyond federal) | military status, natural, protective, or cultural hairstyle | La. R.S. 51:2606 (Louisiana Equal Housing Opportunity Act) |
| Eviction | Landlord may recover possession only through the court eviction process: a written notice to vacate under La. Code Civ. Proc. art. 4701, followed by a rule to show cause for possession under arts. 4731 through 4735. Landlord will not use self-help to remove Tenant or Tenant's belongings. | La. Code Civ. Proc. arts. 4701, 4731–4735 |
| Habitability | Landlord is bound to deliver the Property at the agreed time in good condition suitable for the purpose for which it was leased, to maintain it in that condition and make all repairs that become necessary (other than those for which Tenant is responsible), and to warrant that the Property is free of vices or defects that prevent its use, including vices or defects that arise during the Lease and are not Tenant's fault. In a residential lease this warranty applies to all persons who reside in the Property under the Lease, and a waiver of the warranty is ineffective to the extent it purports to waive vices or defects that seriously affect health or safety. | La. Civ. Code arts. 2682, 2684, 2691, 2696–2699 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Military service (Louisiana law)
*La. R.S. 9:3261*

- **Who:** An active or reserve member of the U.S. Armed Forces (including the National Guard and the U.S. Coast Guard), or the member's spouse, may terminate this residential Lease if the member: (1) receives initial or permanent change of station orders to depart 35 miles or more from the Property; (2) receives initial or temporary duty orders in excess of three months to depart 35 miles or more from the Property; (3) is discharged, released, or retires; (4) is ordered to reside in government-supplied quarters; (5) is notified that government-supplied quarters not available when the Lease was signed have become available, provided the member noted in writing at signing a pending request or application for such quarters; (6) is injured in service and requires hospitalization for more than 15 days; or (7) is killed in service.
- **Notice:** For grounds (1) through (5), Tenant serves Landlord written notice of termination effective on a stated date that is not less than 30 days after the notice is served and no more than 60 days before the departure date required by the orders. For an injury or death under grounds (6) and (7), Tenant (or the member's representative) gives written notice with the documentation described below.
- **Documentation:** The notice must be accompanied by appropriate proof: for a change of station, duty, discharge, retirement, or quarters, a copy of the official military orders; for an injury, the hospitalization records; and for a death, the death certificate, a statement from a casualty assistance office or the member's commanding officer, or an official military media release.
- **Owes:** Tenant owes no more than one month's rent if, as of the effective termination date, Tenant has completed less than six months of this Lease, or no more than one-half of one month's rent if Tenant has completed at least six months, and Tenant is entitled to the full return of any security deposit if Tenant has otherwise complied with this Lease. No other early termination fee applies. This right cannot be waived or modified under any circumstances, and a violation entitles Tenant to $200 in damages plus any other damages, remedies, and costs.

### Domestic abuse, stalking, or cyberstalking (larger buildings only)
*La. R.S. 9:3261.1*

- **Who:** This right applies only when the Property is a residential dwelling in a building or structure of six or more separate residential dwellings, and not when the structure has ten or fewer units and the owner or a lessor occupies one of them. A Tenant or household member who is a domestic abuse victim — a person named as a petitioner in a Uniform Abuse Prevention Order, or who has completed a Certification of Domestic Abuse — may request early termination of this Lease. 'Domestic abuse' means domestic abuse battery committed on the Property, or stalking or cyberstalking as defined by Louisiana law.
- **Notice:** Tenant makes a written request to Landlord for an accommodation of early termination. This Lease then terminates as a matter of law on a date mutually agreed within 30 days of the written request, and Tenant must vacate by that date to avoid liability for future rent.
- **Documentation:** On or before the termination date, Tenant must provide Landlord reasonable documentation of the abuse — a completed Certification of Domestic Abuse signed under oath by a qualified third party, or a Uniform Abuse Prevention Order.
- **Owes:** Tenant is liable only for rent through the early termination date and any obligations outstanding on that date, paid on or before the date Tenant vacates. Landlord may withhold the deposit only for a reason permitted by R.S. 9:3251 and will not charge an early termination fee. Where there is more than one tenant, the entire Lease terminates on the agreed date. A perpetrator named in the documentation may be immediately evicted and remains liable under this Lease.

### Loss, destruction, or substantial impairment of the Property
*La. Civ. Code arts. 2714, 2715*

- **Who:** If the Property is lost or totally destroyed without the fault of either party, or is expropriated, this Lease terminates and neither party owes the other damages. If, without Tenant's fault, the Property is partially destroyed or lost, is expropriated, or its use is otherwise substantially impaired, Tenant may obtain a reduction of the rent or dissolution of this Lease, whichever is more appropriate; if the impairment was caused by circumstances external to the Property, Tenant is entitled to dissolution but not a reduction of rent.
- **Notice:** Tenant notifies Landlord of the loss, destruction, expropriation, or impairment; for a total loss, destruction, or expropriation this Lease ends as of that event.
- **Owes:** Tenant owes rent only through the date this Lease terminates and no early termination fee.


## State disclosures in the lease

- None beyond the federal lead-paint disclosure.

## Open questions for the reviewing attorney

- Louisiana is a civil-law jurisdiction; the lease is governed by the Civil Code (arts. 2668–2729), not a URLTA-style act. There is no statutory implied warranty of habitability as such; the equivalent is the lessor's maintenance obligation (arts. 2682, 2691) and the warranty against vices or defects (arts. 2696–2699), which in a residential or consumer lease cannot be waived for defects that seriously affect health or safety (art. 2699(3)).
- Deposit (R.S. 9:3251) was amended by 2026 La. Act 63: the landlord must return the deposit within one month, and if retaining any part must send the itemized statement within one month OR within fifteen days after the one-month mark (an effective outside limit of about 45 days for the statement). The return duty does not apply if the tenant abandons. R.S. 9:3254 makes any waiver of the tenant's deposit rights null and void. Penalty under R.S. 9:3252 is the greater of $300 or twice the amount wrongfully retained.
- DV early termination (R.S. 9:3261.1) is narrow: it applies ONLY to buildings of six or more units (and not to a structure of ten or fewer units where the owner/lessor occupies one). Most small-landlord Keycove users will fall outside it, and Louisiana has no general DV lease-termination statute for single-family or small multi-unit rentals — so for those properties domesticViolence protection does not apply by statute. 2026 La. Act 64 added stalking and cyberstalking to the section. The eligibility text states the unit-count limit; attorney should confirm the lease flags this to small landlords.
- Military termination (R.S. 9:3261) is unusually generous and caps the member's liability at one month's rent (under six months completed) or one-half month's rent (six months or more completed); that cap lives in the right's liability text, not in feeCap, because it applies only to this right. The section may not be waived or modified under any circumstances, and a violation carries $200 statutory damages.
- Month-to-month termination notice is 10 calendar days before the end of the month (art. 2728(2)); 30 calendar days for a term longer than a month. Louisiana does not require a specific pay-or-quit period before eviction for nonpayment — only the 5-day notice to vacate under C.C.P. art. 4701, which the lease may waive.
- No Louisiana statute governs landlord entry; the 24-hour courtesy notice is contractual, consistent with the lessor's duty to protect peaceful possession.
- Fair housing: La. R.S. 51:2606 adds 'military status' and 'natural, protective, or cultural hairstyle' beyond the federal seven. Disability is listed in subsections (3)–(5) of 2606 and in R.S. 51:2607 rather than in 2606(1)–(2); it is covered. Sexual orientation and gender identity are NOT state-protected (amendment bills failed).
- Mitigation: La. Civ. Code art. 2002 imposes a general duty on an obligee to mitigate, and R.S. 9:3260 requires the landlord to mitigate when premises are rendered uninhabitable or the tenant is constructively evicted. Application to an ordinary voluntary early move-out is supported by art. 2002 but not squarely addressed by a lease-specific statute; attorney to confirm.

## Statutes read (full text)

- La. Civ. Code art. 2002: https://legis.la.gov/Legis/Law.aspx?d=109258
- La. Civ. Code art. 2668: https://legis.la.gov/Legis/Law.aspx?d=109729
- La. Civ. Code art. 2671: https://legis.la.gov/Legis/Law.aspx?d=109732
- La. Civ. Code art. 2682: https://legis.la.gov/Legis/Law.aspx?d=109743
- La. Civ. Code art. 2683: https://legis.la.gov/Legis/Law.aspx?d=109744
- La. Civ. Code art. 2684: https://legis.la.gov/Legis/Law.aspx?d=109746
- La. Civ. Code art. 2691: https://legis.la.gov/Legis/Law.aspx?d=109753
- La. Civ. Code art. 2696: https://legis.la.gov/Legis/Law.aspx?d=109758
- La. Civ. Code art. 2698: https://legis.la.gov/Legis/Law.aspx?d=109760
- La. Civ. Code art. 2699: https://legis.la.gov/Legis/Law.aspx?d=109761
- La. Civ. Code art. 2703: https://legis.la.gov/Legis/Law.aspx?d=109767
- La. Civ. Code art. 2704: https://legis.la.gov/Legis/Law.aspx?d=109768
- La. Civ. Code art. 2714: https://legis.la.gov/Legis/Law.aspx?d=109778
- La. Civ. Code art. 2715: https://legis.la.gov/Legis/Law.aspx?d=109779
- La. Civ. Code art. 2723: https://legis.la.gov/Legis/Law.aspx?d=109787
- La. Civ. Code arts. 2727–2729: https://legis.la.gov/Legis/Law.aspx?d=109792
- La. R.S. 9:3251: https://legis.la.gov/Legis/Law.aspx?d=107468
- La. R.S. 9:3252: https://legis.la.gov/Legis/Law.aspx?d=107469
- La. R.S. 9:3254: https://legis.la.gov/Legis/Law.aspx?d=107471
- La. R.S. 9:3260: https://legis.la.gov/Legis/Law.aspx?d=107476
- La. R.S. 9:3261: https://legis.la.gov/Legis/Law.aspx?d=107477
- La. R.S. 9:3261.1: https://legis.la.gov/Legis/Law.aspx?d=963049
- La. R.S. 51:2606: https://legis.la.gov/Legis/Law.aspx?d=104419
- La. Code Civ. Proc. art. 4701: https://legis.la.gov/Legis/Law.aspx?d=112073
- 50 U.S.C. § 3955: https://www.law.cornell.edu/uscode/text/50/3955
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
