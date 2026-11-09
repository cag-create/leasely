# Idaho (ID): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `246043527a7a7a0c`
- **Framework:** Idaho landlord-tenant statutes, Idaho Code §§ 6-301 et seq. (forcible entry, unlawful detainer, tenant remedies and security deposits) and §§ 55-208, 55-304 to 55-306 (tenancies, notices and fees)
- **Researcher confidence:** medium (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/ID-residential.html) · [co-living](samples/ID-coliving.html)

To approve after review: `pnpm lease:approve ID --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | No statutory cap: Idaho law sets no maximum security deposit. Any amount Tenant deposits with Landlord for a purpose other than paying rent is a security deposit. | Idaho Code § 6-321(1) |
| Deposit return | 21 days: After this Lease ends and Tenant surrenders the premises, Landlord will refund the security deposit within 21 days (or within any longer period, not exceeding 30 days, that this Lease fixes), less only amounts needed to cover the contingencies specified in this Lease. Landlord will not keep any part of the deposit for normal wear and tear. Any partial refund will be accompanied by a signed statement itemizing the amounts kept, the purpose for each, and a detailed list of expenditures made from the deposit. | Idaho Code § 6-321(1)–(2) |
| Deposit holding | If the premises are managed by a third-party manager for Landlord, the security deposit will be kept in a separate account at a federally insured financial institution, apart from the manager's operating account. This requirement does not apply to an owner, a manager sharing members or principals with the owner, a real estate licensee, or a nonprofit organized under chapter 30, title 30, Idaho Code. If the property is sold during the tenancy, the new owner is liable for refunding the deposit. | Idaho Code § 6-321(3)–(4) |
| Deposit interest required | No | |
| Move-in inspection | No statutory requirement (lease adds a contractual condition report) | |
| Late fee grace period | None in statute | Idaho Code § 55-305 |
| Late fee cap | reasonable: must be reasonable and may not exceed the amount stated in this Lease | Idaho Code § 55-305 |
| Month-to-month notice | 30 days: Landlord may end a month-to-month tenancy by written notice requiring Tenant to vacate within a period of not less than one month, and Tenant may end it by written notice of a vacate date not less than one month after the notice. Landlord will also give Tenant at least 30 days' written notice before a rent increase takes effect or before Landlord declines to renew this Lease. | Idaho Code §§ 55-208, 55-304(2) |
| Nonpayment notice | 3 days: If Tenant defaults in paying rent, Landlord may serve a written notice stating the amount due and requiring payment or surrender of possession within three days. The notice must also tell Tenant that, if the court enters judgment against Tenant, a residential tenant will have 72 hours to remove belongings before Landlord may remove and dispose of them, and, for attorney fees to be awarded, that attorney fees will be awarded to the prevailing party. | Idaho Code §§ 6-303(2), 6-324 |
| Entry notice | No statutory hours: Idaho law does not set a notice period for Landlord's entry. Except in an emergency, Landlord will give Tenant reasonable advance notice and will enter only at reasonable times to inspect, make repairs or show the dwelling unit. | — |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | case_law: If Tenant leaves before this Lease ends, Landlord will make reasonable efforts to re-rent the dwelling unit and will credit against any amount Tenant owes the rent Landlord receives from a replacement tenant for the remainder of the term. | — |
| State fair housing classes (beyond federal) | None beyond federal | Idaho Code § 67-5909(8) |
| Eviction | Landlord may recover possession only through a court unlawful detainer action under Idaho Code §§ 6-303 and 6-310 et seq. Landlord will not use force, threats or menacing conduct to remove Tenant or break into the dwelling unit; doing so is a forcible entry for which treble damages may be awarded. | Idaho Code §§ 6-301, 6-303, 6-310, 6-316, 6-317 |
| Habitability | Landlord will provide reasonable waterproofing and weather protection, maintain in good working order the electrical, plumbing, heating, ventilating, cooling and sanitary facilities Landlord supplies, not maintain the premises in a manner hazardous to Tenant's health or safety, comply with the terms of this Lease that materially affect Tenant's health and safety, and install approved smoke detectors. Before suing, Tenant must give Landlord three days' written notice listing each failure and demanding a cure. | Idaho Code §§ 6-320, 6-323 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Idaho National Guard on governor-ordered state active duty
*Idaho Code § 46-409; 50 U.S.C. § 3955*

- **Who:** When a Tenant who is a member of the Idaho air or army national guard is called or ordered by the Governor to state active duty, or to duty other than for training under Title 32 of the U.S. Code, in time of war, armed conflict, or an emergency proclaimed by a governor or the President, the federal Servicemembers Civil Relief Act applies, and Tenant may terminate this Lease on entering that duty or on receiving orders for a permanent change of station or a deployment of at least 90 days.
- **Notice:** Tenant delivers written notice of termination to Landlord. For monthly rent, termination is effective 30 days after the first date on which the next rental payment is due after the notice is delivered.
- **Documentation:** The notice must include a copy of Tenant's military orders or a written verification from Tenant's commanding officer.
- **Owes:** Tenant owes rent prorated to the effective termination date and any other obligations due under this Lease at that time, including reasonable charges for excess wear, but no early termination charge. Landlord will refund rent paid in advance for any period after the termination date within 30 days.


## State disclosures in the lease

- **Smoke detectors** (Idaho Code § 6-320(a)(6)): At the start of this Lease, Landlord has verified that approved smoke detectors are installed and in good working order in the dwelling unit. Tenant will keep the smoke detectors in good working order during the tenancy.
- **Fees and charges** (Idaho Code § 55-305): All fees charged to Tenant, including late fees, must be reasonable. Landlord will not charge Tenant any fee, fine, assessment, interest or other cost that is greater than, or not included in, this Lease unless Landlord first gives Tenant 30 days' written notice of the change.

## Open questions for the reviewing attorney

- MILITARY (judgment call): Idaho Code § 46-409(2) (Militia Civil Relief Act) applies the federal SCRA to Idaho Guard members called by the Governor to state active duty or Title 32 non-training duty, but only 'in time of war, armed conflict, or emergency proclaimed by a governor or by the president.' Lease text mirrors SCRA § 3955. Attorney to confirm the incorporation covers § 3955 lease termination and how the emergency-proclamation condition should be stated. The statute still cites the old '50 U.S.C. App.' numbering.
- No Idaho domestic violence / sexual assault / stalking lease-termination statute found in Title 6 ch. 3 or Title 55 chs. 2–3 (consumer sites citing §§ 6-320, 55-2508 or 32-2010 for a DV right are wrong as far as I could verify). domesticViolence is null. Federal VAWA applies only to covered federally assisted housing.
- No statutory entry-notice rule, no move-in condition report requirement, no senior/care-facility, casualty or death termination rights, and no early-termination fee cap in Idaho statutes.
- Mitigation: no statute. Idaho case law is understood to require landlords to mitigate (I believe Consolidated AG of Curry, Inc. v. Rangen, Inc., 128 Idaho 228, 912 P.2d 115 (1996)), but I did not verify the holding from a primary source. Flagged as case_law.
- Month-to-month: § 55-208 governs termination of a 'tenancy at will' with not less than one month's written notice by either party; Idaho applies it to month-to-month tenancies, but the statute does not use that term. § 55-304(2) separately requires 30 days' written notice before ANY residential rent increase or nonrenewal, which affects fixed-term leases too (landlord must give 30 days' notice of nonrenewal before the end date). § 55-304(1) allows changing month-to-month terms with 15 days' notice before month end, but subsection (2)'s 30 days controls rent increases.
- Deposit return: 21 days if the lease fixes no time; the lease may fix a longer period up to 30 days. returnDays set to 21; if Keycove wants 30 the lease must expressly fix it.
- Late fees: § 55-305 (2023, renumbered 2025) requires all fees to be 'reasonable' and stated in the agreement; written-lease fee changes need 30 days' notice. No numeric cap or grace period.
- Attorney fees in a nonpayment case are recoverable only if the 3-day notice advises the tenant that attorney fees will be awarded to the prevailing party (§ 6-324); the 3-day notice must also state the 72-hour removal-of-belongings warning (§ 6-303(2)).
- Self-help: Idaho has no explicit residential lockout statute; the eviction text relies on the forcible entry definition (§ 6-301(2): turning out the party in possession by force, threats or menacing conduct) and treble damages (§ 6-317). Attorney to confirm.
- Fair housing: the Idaho Human Rights Act housing provision (§ 67-5909(8)) covers race, color, religion, sex, national origin and disability, and does NOT list familial status (federal FHA still covers it). No state classes beyond the federal seven. Boise, Pocatello, Coeur d'Alene, Sandpoint and other cities have local ordinances adding sexual orientation and gender identity; verify by city. § 55-306 (2025) bars local governments from requiring landlords to accept vouchers or from regulating rent, fees or deposits.

## Statutes read (full text)

- Idaho Code § 6-301: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-301/
- Idaho Code § 6-302: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-302/
- Idaho Code § 6-303: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-303/
- Idaho Code § 6-304: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-304/
- Idaho Code § 6-310: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-310/
- Idaho Code § 6-316: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-316/
- Idaho Code § 6-317: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-317/
- Idaho Code § 6-320: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-320/
- Idaho Code § 6-321: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-321/
- Idaho Code § 6-323: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-323/
- Idaho Code § 6-324: https://legislature.idaho.gov/statutesrules/idstat/Title6/T6CH3/SECT6-324/
- Idaho Code § 55-208: https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH2/SECT55-208/
- Idaho Code § 55-209: https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH2/SECT55-209/
- Idaho Code § 55-304: https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH3/SECT55-304/
- Idaho Code § 55-305: https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH3/SECT55-305/
- Idaho Code § 55-306: https://legislature.idaho.gov/statutesrules/idstat/Title55/T55CH3/SECT55-306/
- Idaho Code § 46-409: https://legislature.idaho.gov/statutesrules/idstat/Title46/T46CH4/SECT46-409/
- Idaho Code § 67-5909: https://legislature.idaho.gov/statutesrules/idstat/Title67/T67CH59/SECT67-5909/
- 50 U.S.C. § 3955 (incorporated by Idaho Code § 46-409(2)): https://www.law.cornell.edu/uscode/text/50/3955
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
