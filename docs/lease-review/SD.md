# South Dakota (SD): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `a5cbb1c68e173d91`
- **Framework:** South Dakota Codified Laws ch. 43-32 (Lease of Real Property), with eviction under SDCL ch. 21-16 (Forcible Entry and Detainer)
- **Researcher confidence:** medium (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/SD-residential.html) · [co-living](samples/SD-coliving.html)

To approve after review: `pnpm lease:approve SD --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | 1 month(s) rent: The security deposit may not exceed one month's rent, except that Landlord and Tenant may agree to a larger deposit where special conditions pose a danger to maintenance of the Property. | SDCL 43-32-6.1 |
| Deposit return | 21 days: Within 21 days after the tenancy ends and Landlord receives Tenant's mailing address or delivery instructions, Landlord will return the security deposit or give Tenant a written statement showing the specific reason for withholding all or part of it. Landlord may withhold only the amounts reasonably necessary to remedy Tenant's defaults in paying rent and other funds due to Landlord under an agreement, and to restore the Property to its condition at the start of the tenancy, ordinary wear and tear excepted. On Tenant's request, Landlord will provide an itemized accounting of any amount withheld within 45 days after the tenancy ends. | SDCL 43-32-24 |
| Deposit holding | No statutory holding rule | — |
| Deposit interest required | No | |
| Move-in inspection | No statutory requirement (lease adds a contractual condition report) | |
| Late fee grace period | None in statute | — |
| Late fee cap | none: No numeric cap; must be reasonable | — |
| Month-to-month notice | 30 days: Either Landlord or Tenant may end a month-to-month tenancy by giving the other notice at least one month before the end of a monthly rental period. Landlord may change the terms of a month-to-month tenancy by written notice served at least 30 days before the end of the month, effective at the end of that month; Tenant may then terminate effective the first day of the next month by giving Landlord notice of termination within 15 days after receiving the change notice. | SDCL 43-32-13, 43-32-15 |
| Nonpayment notice | No statutory period: If Tenant fails to pay rent for three days after it is due, Landlord may bring a forcible entry and detainer action. South Dakota law no longer requires a separate written notice to quit before that action is filed. | SDCL 21-16-1(4); SL 2024, ch 75 (repealing SDCL 21-16-2) |
| Entry notice | 24 hours: Except in an emergency or when it is impracticable, Landlord will give Tenant at least 24 hours' written notice of Landlord's intent to enter and will enter only at reasonable times. The notice will state the date or dates of entry, a period of time during normal business hours for entry, the purpose of the entry, and a way for Tenant to request to reschedule. | SDCL 43-32-32 |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | unclear: If Tenant leaves before the end of the term, Landlord will credit against Tenant's liability any rent Landlord receives from a replacement tenant for the remainder of the term. | — |
| State fair housing classes (beyond federal) | creed, ancestry | SDCL 20-13-20, 20-13-20.1 (South Dakota Human Relations Act) |
| Eviction | Landlord may recover possession of the Property only through a forcible entry and detainer action in circuit court or magistrate court under SDCL chapter 21-16. Landlord will not remove or exclude Tenant from the Property or willfully interrupt electric, gas, water, or other essential services to Tenant. | SDCL 21-16-1, 21-16-3, 21-16-6, 21-16-7; SDCL 43-32-6 |
| Habitability | Landlord will keep the Property and all common areas in reasonable repair and fit for human habitation and in good and safe working order during the term, and will maintain in good and safe working order all electrical, plumbing, and heating systems, except when the disrepair has been caused by the negligent, willful, or malicious conduct of Tenant or a person under Tenant's direction or control. These duties cannot be waived or modified, although Landlord and Tenant may agree that Tenant will perform specified repairs or maintenance in lieu of rent. | SDCL 43-32-8 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### National Guard active duty (South Dakota law)
*SDCL 33A-2-9; 50 U.S.C. § 3955*

- **Who:** A South Dakota resident who is a member of any state's National Guard and is ordered to active duty service by the Governor of that state or by the President of the United States has the same protections, including lease termination rights, that the federal Servicemembers Civil Relief Act gives to persons serving on federal active duty.
- **Notice:** Tenant gives Landlord written notice of termination. If rent is payable monthly, termination is effective 30 days after the first date on which the next rental payment is due after the notice is delivered; otherwise, termination is effective on the last day of the month following the month in which the notice is delivered.
- **Documentation:** The notice must include a copy of the military orders.
- **Owes:** Tenant owes rent only through the effective date of termination. Landlord will refund rent paid in advance for any period after that date within 30 days after the effective date, and Landlord will not charge an early termination fee.

### Domestic abuse, unlawful sexual behavior, or stalking
*SDCL 43-32-19(3), 43-32-19.1, 43-32-19.2*

- **Who:** Tenant may terminate this Lease if Tenant or a member of Tenant's household is the victim of alleged domestic abuse, unlawful sexual behavior, or stalking.
- **Notice:** Tenant must notify Landlord in writing that the termination is due to Tenant's fear of imminent danger or injury to Tenant or a member of Tenant's household. Tenant may then terminate this Lease and vacate the Property on or before the date specified in the notice.
- **Documentation:** Tenant must attach to the notice one of the following: a police report regarding an alleged incident of domestic abuse, unlawful sexual behavior, or stalking, signed during the 30 days immediately before the date of the notice; a protection order issued during the 30 days immediately before the date of the notice in response to such an incident; or documentation signed by a licensed health care provider stating that, during the 30 days immediately before the date of the notice, the provider examined Tenant or the household member within the provider's scope of practice and, as a result, has reasonable cause to believe that person was a victim of alleged domestic abuse, unlawful sexual behavior, or stalking. If Tenant gives Landlord a forwarding address or other contact information, Landlord will not disclose it to anyone except with Tenant's consent or as required by law.
- **Owes:** Tenant may terminate without penalty and is not liable for any otherwise applicable early termination fee or for the rent for the month following the month in which Tenant vacates the Property.

### Landlord's failure to repair or to secure quiet possession
*SDCL 43-32-19(1)*

- **Who:** Tenant may terminate this Lease before the end of the term if Landlord does not, within a reasonable time after Tenant's written request, fulfill Landlord's obligations to place and secure Tenant in quiet possession of the Property, to put the Property into good condition, or to repair it.
- **Notice:** Tenant may terminate after Landlord fails to act within a reasonable time after Tenant's written request.
- **Owes:** Tenant is not liable for rent for any period after this Lease terminates.

### Failure to make the Property fit for habitation
*SDCL 43-32-9*

- **Who:** If, within a reasonable time after notice to Landlord of conditions requiring repair to make the Property fit for human habitation and in good and safe working order, Landlord neglects to make repairs Landlord ought to make, Tenant may vacate the Property.
- **Notice:** Tenant may vacate after Landlord fails to repair within a reasonable time after notice.
- **Owes:** If Tenant vacates, Tenant is discharged from further rent and from performance of other conditions of this Lease.

### Destruction of the Property
*SDCL 43-32-19(2)*

- **Who:** Tenant may terminate this Lease before the end of the term if the greater part of the Property, or the part that Landlord had reason to believe was the material inducement for Tenant to enter into this Lease, is destroyed from any cause other than Tenant's ordinary negligence.
- **Notice:** Tenant may terminate upon the destruction.
- **Owes:** Tenant is not liable for rent for any period after this Lease terminates.

### Unlawful exclusion or utility interruption
*SDCL 43-32-6*

- **Who:** If Landlord unlawfully removes or excludes Tenant from the Property, or willfully diminishes services by interrupting or causing the interruption of electric, gas, water, or other essential service, Tenant may terminate this Lease.
- **Notice:** Tenant may elect to terminate this Lease upon Landlord's violation.
- **Owes:** Tenant may recover from Landlord damages equal to two months' rent and the return of any advance rent and deposit paid to Landlord.


## State disclosures in the lease

- **Prior methamphetamine manufacturing** (SDCL 43-32-30) *Only if Landlord has actual knowledge of prior methamphetamine manufacturing on the premises; for a building with two or more units, only for the unit where the manufacturing occurred*: Landlord discloses that Landlord has actual knowledge that methamphetamine was previously manufactured on the Property.

## Open questions for the reviewing attorney

- NOTICE TO QUIT REPEALED: SL 2024, ch 75 (SB 90) repealed SDCL 21-16-2, which required three days' written notice to quit before a forcible entry and detainer action for nonpayment or holdover. Under SDCL 21-16-1(4) the action is maintainable once rent is unpaid three days after it is due. nonpaymentDays is null. The builder may still want a contractual pre-filing notice as a best practice; attorney to decide. Service of summons now requires two attempts at least one week apart (21-16-6), and the answer period is five days (21-16-7).
- DEPOSIT DEADLINE CHANGED IN 2026: The current codified SDCL 43-32-24 (as amended by SL 2026, ch 179) gives 21 days after termination and receipt of the tenant's mailing address or delivery instructions; the itemized accounting on request remains within 45 days. The effective date of the 2026 amendment was not separately verified (presumably July 1, 2026). Non-compliance forfeits all right to withhold; bad faith adds punitive damages up to $200.
- DOMESTIC VIOLENCE: SDCL 43-32-19.1 relieves the tenant of the early termination fee and of 'the rent applicable to the month following that in which the tenant vacates.' The statute does not expressly address rent for later months or the month of vacating; read literally, the tenant may owe rent through the end of the month of vacating. The lease liability text tracks the statute literally. Co-tenant release is not addressed. Documentation must be dated within 30 days before the notice. SDCL 43-32-18.1 bars any lease term authorizing eviction of a tenant who calls police or emergency responders about domestic abuse, unlawful sexual behavior, or stalking, and bars eviction solely because a tenant or household member is a victim; the generator must not include a 'calls to police' nuisance clause.
- MILITARY: SDCL 33A-2-9 extends SCRA protections to South Dakota residents in any state's National Guard ordered to active duty by a Governor or the President. It incorporates SCRA 'as amended to January 1, 2007' (former 50 App. U.S.C. § 535), so later SCRA amendments may not be incorporated for state-ordered duty; the lease text uses current § 3955 mechanics, which are substantially similar for residential leases. No other South Dakota military lease statute was found.
- MITIGATION: No South Dakota statute imposing a duty to mitigate on residential landlords was found in SDCL 43-32. Basis set to 'unclear'; South Dakota case law was not read. The lease commits Landlord to credit replacement rent.
- MONTH-TO-MONTH: SDCL 43-32-15 (notice at least as long as the term of hiring, not exceeding one month) is a renewal-presumption statute for hirings of unspecified term; applying it to month-to-month terminations is the common reading but is an interpretation. 43-32-13 gives the tenant a 15-day window to terminate after a landlord's change-of-terms notice.
- LATE FEES: No South Dakota statute caps late fees or sets a grace period. Case law not read.
- DEPOSIT EXCEPTION: The 'special conditions' exception allowing a deposit above one month's rent (43-32-6.1) is undefined; pet deposits are not separately addressed. Builder should cap at one month unless the landlord documents a special condition.
- SERVICE/ASSISTANCE ANIMALS: SDCL 43-32-33 to 43-32-36 allow landlords to request reliable documentation from a licensed health care provider (not one operating in South Dakota solely to certify animals) when the disability-related need is not apparent, and allow eviction plus a fee up to $1,000 for knowingly fraudulent documentation; must be applied consistently with the federal FHA.
- CO-LIVING: SDCL 20-13-20(1), (2), (4) do not apply to rooms or units in dwellings with living quarters for no more than two families where the owner occupies one (federal FHA exemptions are different).
- ATTORNEY FEES: Unlike OK/KS/NE, SDCL 43-32 contains no ban on lease attorney-fee clauses; SDCL 21-16-11 (attorney fees taxed as costs in FED actions) was not read.
- LOCAL LAW: Sioux Falls and Rapid City ordinances were not reviewed. Abandoned property: 43-32-25 (under $500, 10 days) and 43-32-26 (over $500, store 30 days).

## Statutes read (full text)

- SDCL 43-32-1 through 43-32-37 (chapter text): https://sdlegislature.gov/api/Statutes/43-32.html?all=true
- SDCL 43-32-6: https://sdlegislature.gov/Statutes/43-32-6
- SDCL 43-32-6.1: https://sdlegislature.gov/Statutes/43-32-6.1
- SDCL 43-32-8: https://sdlegislature.gov/Statutes/43-32-8
- SDCL 43-32-9: https://sdlegislature.gov/Statutes/43-32-9
- SDCL 43-32-13: https://sdlegislature.gov/Statutes/43-32-13
- SDCL 43-32-15: https://sdlegislature.gov/Statutes/43-32-15
- SDCL 43-32-18.1: https://sdlegislature.gov/Statutes/43-32-18.1
- SDCL 43-32-19: https://sdlegislature.gov/Statutes/43-32-19
- SDCL 43-32-19.1: https://sdlegislature.gov/Statutes/43-32-19.1
- SDCL 43-32-19.2: https://sdlegislature.gov/Statutes/43-32-19.2
- SDCL 43-32-23: https://sdlegislature.gov/Statutes/43-32-23
- SDCL 43-32-24: https://sdlegislature.gov/Statutes/43-32-24
- SDCL 43-32-25, 43-32-26: https://sdlegislature.gov/Statutes/43-32-25
- SDCL 43-32-27, 43-32-28: https://sdlegislature.gov/Statutes/43-32-27
- SDCL 43-32-30: https://sdlegislature.gov/Statutes/43-32-30
- SDCL 43-32-32: https://sdlegislature.gov/Statutes/43-32-32
- SDCL 43-32-33 through 43-32-36: https://sdlegislature.gov/Statutes/43-32-34
- SDCL ch. 21-16 (21-16-1, 21-16-2 repealed, 21-16-3, 21-16-6, 21-16-7): https://sdlegislature.gov/api/Statutes/21-16.html?all=true
- SL 2024, ch 75 (SB 90): https://mylrc.sdlegislature.gov/api/Documents/SessionLaw/266745.html?Year=2024
- SDCL 33A-2-9: https://sdlegislature.gov/Statutes/33A-2-9
- SDCL 20-13-1, 20-13-20, 20-13-20.1, 20-13-21: https://sdlegislature.gov/api/Statutes/20-13.html?all=true
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
