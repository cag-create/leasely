# Iowa (IA): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `aab7eae4d4bd67fc`
- **Framework:** Iowa Uniform Residential Landlord and Tenant Law, Iowa Code ch. 562A
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/IA-residential.html) · [co-living](samples/IA-coliving.html)

To approve after review: `pnpm lease:approve IA --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | 2 month(s) rent: The security deposit may not exceed two months' rent. | Iowa Code § 562A.12(1) |
| Deposit return | 30 days: Within 30 days after the tenancy ends and Landlord receives Tenant's mailing address or delivery instructions, Landlord shall return the deposit or furnish Tenant a written statement giving the specific reason for withholding all or part of it (for damage, the nature of the damage). Landlord may withhold only amounts reasonably necessary to remedy unpaid rent or other sums due, to restore the unit to its condition at the start of the tenancy (ordinary wear and tear excepted), or to recover expenses of regaining possession from a tenant who does not act in good faith. A landlord who fails to provide the written statement within that 30 days forfeits the right to withhold any part of the deposit. If Tenant provides no mailing address within one year after the tenancy ends, the deposit becomes Landlord's property. | Iowa Code § 562A.12(3)–(4) |
| Deposit holding | Landlord shall hold the deposit for Tenant in a bank, savings and loan association, or credit union insured by an agency of the federal government, and shall not commingle it with Landlord's personal funds. The deposit may be held in a trust account, which may be interest-bearing; any interest earned during the first five years of the tenancy is Landlord's property. | Iowa Code § 562A.12(2) |
| Deposit interest required | No | |
| Move-in inspection | No statutory requirement (lease adds a contractual condition report) | |
| Late fee grace period | None in statute | Iowa Code § 562A.9(4) |
| Late fee cap | tiered: If the monthly rent is $700 or less, a late fee may not exceed $12.00 per day or $60.00 per month in total. If the monthly rent is greater than $700, a late fee may not exceed $20.00 per day or $100.00 per month in total. | Iowa Code § 562A.9(4) |
| Month-to-month notice | 30 days: Either party may terminate a month-to-month tenancy by written notice given to the other at least 30 days before the periodic rental date specified in the notice (at least 10 days for a week-to-week tenancy). | Iowa Code § 562A.34 |
| Nonpayment notice | 3 days: If rent is unpaid when due, Landlord may deliver a written notice stating that the rental agreement will terminate if the rent is not paid within three days; if Tenant does not pay within those three days, Landlord may terminate the rental agreement and bring a forcible entry and detainer action. | Iowa Code § 562A.27(2) |
| Entry notice | 24 hours: Landlord may enter the dwelling unit to inspect, make necessary or agreed repairs or improvements, supply necessary or agreed services, or show the unit to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency or when it is impracticable to do so, Landlord shall give Tenant at least 24 hours' notice and enter only at reasonable times. Tenant shall not unreasonably withhold consent, and Landlord shall not abuse the right of access or use it to harass Tenant. | Iowa Code § 562A.19 |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | case_law: If Tenant vacates early, Landlord shall make reasonable efforts to re-rent the Property at a fair rental, and rent received from a replacement tenant is credited against what Tenant owes. | — |
| State fair housing classes (beyond federal) | creed, sexual orientation | Iowa Code § 216.8 (Iowa Civil Rights Act) |
| Eviction | Landlord may recover possession only through the court process (forcible entry and detainer) under Iowa Code chapter 648. Landlord will not remove Tenant, exclude Tenant, or shut off essential services by self-help; an unlawful ouster or willful interruption of services is actionable by Tenant under § 562A.26. | Iowa Code ch. 648; § 562A.26 |
| Habitability | Landlord shall comply with applicable building and housing codes materially affecting health and safety, make all repairs and do whatever is necessary to put and keep the premises in a fit and habitable condition, keep common areas clean and safe, maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies, and supply running water, reasonable hot water, and reasonable heat (except where the unit is so constructed that heat or hot water is generated by an installation within Tenant's exclusive control and supplied by a direct public utility connection). | Iowa Code § 562A.15 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Military service (Iowa law)
*Iowa Code § 29A.101A*

- **Who:** A service member who signed this Lease and thereafter enters military service, or who while in military service receives orders for a permanent change of station or to deploy with a military unit (or as an individual in support of a military operation) for 90 days or more, may terminate this Lease for premises occupied or intended to be occupied by the service member or the service member's dependents. Terminating this Lease also ends any obligation a dependent has under it.
- **Notice:** Tenant delivers to Landlord written notice of termination together with a copy of the service member's military orders, by hand delivery, private business carrier, or U.S. mail with return receipt requested. Because rent is payable monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered.
- **Documentation:** The written notice must include a copy of the service member's military orders.
- **Owes:** Rent for the period before the effective termination date is prorated and paid, and Landlord will not charge any early termination fee. Landlord will refund any rent paid in advance for the period after the effective termination date within 30 days after that date. Knowingly seizing or detaining the service member's or a dependent's property to subject it to a claim for rent accruing after termination is a simple misdemeanor.

### Fire or casualty damage
*Iowa Code § 562A.25*

- **Who:** If the dwelling unit or premises are damaged or destroyed by fire or casualty, without Tenant's fault, to an extent that enjoyment of the dwelling unit is substantially impaired, Tenant may terminate this Lease.
- **Notice:** Tenant may immediately vacate the premises and give Landlord written notice within 14 days of the intention to terminate, in which case this Lease terminates as of the date of vacating.
- **Owes:** Landlord shall return all prepaid rent and the security deposit recoverable under § 562A.12, with rent accounted for as of the date of the casualty. No early termination fee applies.

### Unlawful ouster or shutoff of services by Landlord
*Iowa Code § 562A.26*

- **Who:** If Landlord unlawfully removes or excludes Tenant from the premises, or willfully diminishes services by interrupting or causing the interruption of electric, gas, water, heat, or another essential service, Tenant may terminate this Lease.
- **Notice:** No advance notice period is required for this right.
- **Owes:** Tenant may recover possession or terminate this Lease and, in either case, recover actual damages and reasonable attorney's fees as the law allows, and owes no early termination fee.


## State disclosures in the lease

- None beyond the federal lead-paint disclosure.

## Open questions for the reviewing attorney

- Military termination is Iowa Code § 29A.101A (not in ch. 562A). It covers a lease signed before the person entered military service, or signed during service followed by PCS orders or a deployment of 90 days or more; it also releases dependents. § 29A.101 separately bars a landlord from evicting a service member or dependents for nonpayment during service except by court order. Active-duty federal servicemembers are also covered by the federal SCRA (50 U.S.C. § 3955), handled by the generator.
- Iowa has NO enacted domestic-violence lease-termination statute. A bill to add one (proposed § 562A.9A, e.g. HF 547 / HSB 141 / HF 2134) has been introduced in recent sessions but was not enacted as of the 2026 Iowa Code. domesticViolence is set to null. § 562A.27A (clear-and-present-danger) and § 562A.36 (retaliation protection for tenants who summon emergency aid for abuse victims) exist but are not tenant termination rights.
- FAIR HOUSING CHANGE: As of the 2026 Iowa Code, § 216.8 lists race, color, creed, sex, sexual orientation, religion, national origin, disability, and familial status for housing. 'Gender identity' is NOT listed — Iowa removed gender identity from the Iowa Civil Rights Act in 2025 (SF 418, eff. July 1, 2025). Beyond the federal seven, the extra state classes are creed and sexual orientation. 'Age' appears in § 216.8(1)(d) only as to persons lawfully present at the tenant's invitation, not as a general housing class.
- Late fee cap is tiered by rent amount and is both a per-day and per-month cap (§ 562A.9(4)); there is no statutory grace period. capType is 'tiered' (not auto-clamped); the full tiered rule is in capRule and the lease.
- Deposit interest during the first five years of a tenancy belongs to the landlord (§ 562A.12(2)); after five years interest would accrue to the tenant. interestRequired is set to false as the ordinary case; attorney to confirm treatment of tenancies exceeding five years.
- Duty to mitigate on early abandonment is treated as a contract/common-law duty (Iowa recognizes a duty to mitigate); § 562A.34(4) addresses only willful holdover damages. Attorney to confirm the controlling Iowa authority.
- § 562A.26 remedy language (possession/termination plus a statutory damages amount) was summarized conservatively; the exact multiplier was not transcribed. Attorney to confirm against the full text of § 562A.26.

## Statutes read (full text)

- Iowa Code § 562A.9: https://www.legis.iowa.gov/docs/code/562A.9.pdf
- Iowa Code § 562A.11: https://www.legis.iowa.gov/docs/code/562A.11.pdf
- Iowa Code § 562A.12: https://www.legis.iowa.gov/docs/code/562A.12.pdf
- Iowa Code § 562A.15: https://www.legis.iowa.gov/docs/code/562A.15.pdf
- Iowa Code § 562A.19: https://www.legis.iowa.gov/docs/code/562A.19.pdf
- Iowa Code § 562A.25: https://www.legis.iowa.gov/docs/code/562A.25.pdf
- Iowa Code § 562A.26: https://www.legis.iowa.gov/docs/code/562A.26.pdf
- Iowa Code § 562A.27: https://www.legis.iowa.gov/docs/code/562A.27.pdf
- Iowa Code § 562A.34: https://www.legis.iowa.gov/docs/code/562A.34.pdf
- Iowa Code § 29A.101A: https://www.legis.iowa.gov/docs/code/29A.101A.pdf
- Iowa Code § 216.8: https://www.legis.iowa.gov/docs/code/216.8.pdf
- Iowa Code § 216.2: https://www.legis.iowa.gov/docs/code/216.2.pdf
- 50 U.S.C. § 3955: https://www.law.cornell.edu/uscode/text/50/3955
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
