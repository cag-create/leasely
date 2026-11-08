# North Carolina (NC): lease review packet

- **Status:** APPROVED (2026-11-08, Grandfathered: live before the 2026-11-08 50-state rebuild. Rebuilt text (lease-break clause, statute corrections) pending owner/attorney review.)
- **Template hash:** `72e793077e97a6cb`
- **Framework:** N.C. Gen. Stat. Chapter 42 (Landlord and Tenant), including the Residential Rental Agreements Act (Art. 5) and the Tenant Security Deposit Act (Art. 6)
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/NC-residential.html) · [co-living](samples/NC-coliving.html)

To approve after review: `pnpm lease:approve NC --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | 2 month(s) rent: The security deposit may not exceed two weeks' rent for a week-to-week tenancy, one and one-half months' rent for a month-to-month tenancy, or two months' rent for a term longer than month-to-month. | N.C. Gen. Stat. § 42-51(b) |
| Deposit return | 30 days: Within 30 days after the tenancy ends and Tenant delivers possession, Landlord shall mail or deliver to Tenant a written itemization of any damage together with the balance of the deposit. If Landlord's claim cannot be determined within 30 days, Landlord shall provide an interim accounting within 30 days and a final accounting within 60 days. Landlord may not withhold any amount for normal wear and tear or any amount exceeding Landlord's actual damages. | N.C. Gen. Stat. § 42-52 |
| Deposit holding | Landlord shall keep the deposit in a trust account with a licensed and federally insured depository institution or trust institution authorized to do business in North Carolina, or furnish a bond from an insurance company licensed in North Carolina (a trust account outside North Carolina is allowed only with such a bond). Within 30 days after the lease term begins, Landlord shall notify Tenant of the name and address of the bank or institution holding the deposit, or the name of the insurance company providing the bond. | N.C. Gen. Stat. § 42-50 |
| Deposit interest required | No | |
| Move-in inspection | No statutory requirement (lease adds a contractual condition report) | |
| Late fee grace period | 5 days | N.C. Gen. Stat. § 42-46(a)–(b) |
| Late fee cap | greater_of (= $75.00 on $1,500 rent): A late fee may be charged only if the rent is five calendar days or more late (the first day being the day after rent was due), only once per late payment, and may not exceed the greater of $15.00 or 5% of the monthly rent. A late fee may not be deducted from a later rent payment so as to put that payment in default. | N.C. Gen. Stat. § 42-46(a)–(b) |
| Month-to-month notice | 7 days: Either party may end a month-to-month tenancy by written notice given at least seven days before the end of the current rental period (two days for a week-to-week tenancy; one month before the end of the year for a year-to-year tenancy). | N.C. Gen. Stat. § 42-14 |
| Nonpayment notice | 10 days: If Tenant fails to pay rent within 10 days after Landlord demands all past-due rent, the term is forfeited and Landlord may bring a summary ejectment action. | N.C. Gen. Stat. § 42-3 |
| Entry notice | No statutory hours: North Carolina has no statute setting an entry-notice period. Landlord will give Tenant at least 24 hours' notice before entering for inspections, repairs, or showings, except in an emergency or when Tenant consents at the time of entry. | — |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | case_law: If Tenant vacates early, Landlord shall use reasonable efforts to re-rent the Property, and rent received from a replacement tenant is credited against what Tenant owes. | Isbey v. Crews, 55 N.C. App. 47 (1981) |
| State fair housing classes (beyond federal) | None beyond federal | N.C. Gen. Stat. § 41A-4 (State Fair Housing Act: race, color, religion, sex, national origin, handicapping condition, familial status) |
| Eviction | Landlord may recover possession only through the court process of summary ejectment under Article 3 of Chapter 42 (or Article 7, where it applies). Landlord will not lock Tenant out, shut off utilities, or remove Tenant's belongings without a court order. | N.C. Gen. Stat. §§ 42-25.6, 42-26 |
| Habitability | Landlord shall comply with applicable building and housing codes, make all repairs needed to keep the Property fit and habitable, keep common areas safe, and maintain in good and safe working order and promptly repair all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies, after written notice from Tenant (except in emergencies). | N.C. Gen. Stat. § 42-42 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Military technicians (North Carolina law)
*N.C. Gen. Stat. § 42-45*

- **Who:** A military technician under 10 U.S.C. § 10216 who is required by permanent change of station orders to move 50 miles or more from the Property, is prematurely or involuntarily discharged or released from active duty, or is deployed with a military unit for 90 days or more may terminate this Lease. If such a technician dies on active duty, an immediate family member or the lawful representative of the estate may terminate it.
- **Notice:** For a change of station or discharge, Tenant gives written notice of a termination date at least 30 days after Landlord receives it. For a deployment or death, termination is effective 30 days after the next rent due date or 45 days after Landlord receives the notice, whichever is shorter.
- **Documentation:** The notice must include a copy of the official military orders or a written verification signed by the commanding officer (for a death, the death certificate, official casualty report, or commanding officer's letter).
- **Owes:** Tenant owes rent prorated to the termination date. If Tenant has completed less than nine months of the tenancy and Landlord has suffered actual damages from the loss of the tenancy, Tenant owes liquidated damages of no more than one month's rent (less than six months completed) or one-half month's rent (six to nine months completed); after nine months nothing more is owed. No damages or penalties of any kind are owed if Tenant terminates 14 or more days before occupancy. The security deposit may not be applied to damages for the unfulfilled rental period (§ 42-51(a)(3)).

### Domestic violence, sexual assault, or stalking
*N.C. Gen. Stat. § 42-45.1*

- **Who:** A protected tenant (a victim of domestic violence, sexual assault, or stalking, as defined by statute) may terminate this Lease.
- **Notice:** Tenant gives Landlord written notice of a termination date at least 30 days after Landlord receives the notice.
- **Documentation:** The notice must include a copy of a valid protective order under Chapter 50B or 50C (not an ex parte order), a criminal order restraining a person from contact with the tenant, or a valid Address Confidentiality Program card issued to the victim or a minor member of the household. A victim of domestic violence or sexual assault must also include a safety plan, dated during this tenancy, from a qualifying domestic violence or sexual assault program, that recommends relocation.
- **Owes:** Tenant owes only rent prorated to the termination date, payable when it would otherwise be due, and is not liable for any other rent or fees due only to the early termination, including the early termination fee. No damages or penalties are owed if Tenant terminates 14 or more days before occupancy. The tenancy continues for any remaining tenants, and a perpetrator excluded by court order remains liable under this Lease. The security deposit may not be applied to damages for the unfulfilled rental period (§ 42-51(a)(3)).

### National Guard on State active duty (North Carolina Servicemembers Civil Relief Act)
*N.C. Gen. Stat. §§ 127B-27 to 127B-29, 127B-33*

- **Who:** A member of the North Carolina National Guard serving on State active duty under an order of the Governor for more than 30 consecutive days, or a member of another state's National Guard who resides in North Carolina and serves under a similar order of that state's governor, has the same lease termination rights as a servicemember under the federal Servicemembers Civil Relief Act (described above), to the extent the service materially affects the member's ability to meet Lease obligations. A dependent of such a member has the same rights.
- **Notice:** Tenant gives written or electronic notice of termination as described for the federal Servicemembers Civil Relief Act above.
- **Documentation:** Tenant provides a written or electronic copy of the military order (including an order of the Governor) no later than 30 days after the State active duty ends.
- **Owes:** Tenant owes rent prorated to the termination date and no early termination charge. These rights cannot be reduced or eliminated by this Lease.

### Foreclosure of a small rental property
*N.C. Gen. Stat. § 42-45.2*

- **Who:** If the Property has fewer than 15 rental units and is being sold in a foreclosure proceeding under Article 2A of Chapter 45, Tenant may terminate this Lease after receiving the notice of sale, provided the default has not been cured when Tenant gives notice.
- **Notice:** Tenant gives written notice of a termination date at least 10 days, but no more than 90 days, after the sale date in the notice of sale.
- **Owes:** Tenant owes rent prorated to the termination date and no other rent or damages due only to the early termination.

### Unlawful removal by Landlord
*N.C. Gen. Stat. § 42-25.9(a)*

- **Who:** If Landlord removes or attempts to remove Tenant from the Property other than through the court process required by Article 2A of Chapter 42, Tenant may recover possession or terminate this Lease.
- **Notice:** No advance notice period is required.
- **Owes:** Tenant owes no early termination fee, and Landlord is liable to Tenant for actual damages caused by the removal or attempted removal.


## State disclosures in the lease

- **Smoke and Carbon Monoxide Alarms** (N.C. Gen. Stat. § 42-42(a)(5)–(8)): Landlord has provided operable smoke alarms and, where required, carbon monoxide alarms, and will repair or replace them within 15 days after Tenant gives written notice that repair or replacement is needed. Landlord places new batteries in battery-operated alarms at the start of the tenancy, and Tenant replaces batteries as needed during the tenancy (except tamper-resistant 10-year lithium alarms).
- **Eviction-Related Fees** (N.C. Gen. Stat. § 42-46(e)–(k)): The only administrative fees Landlord may charge in connection with a complaint for summary ejectment or money owed are those allowed by N.C. Gen. Stat. § 42-46(e) through (g) (a complaint-filing fee up to the greater of $15.00 or 5% of monthly rent if Tenant cures before judgment; a court-appearance fee of 10% of monthly rent if Landlord prevails in small claims court; or a second-trial fee up to 12% of monthly rent if Landlord prevails on appeal), and only one of them per complaint. Landlord may also recover court filing fees, service costs, and reasonable attorneys' fees actually paid or owed, not to exceed 15% of the amount owed (or 15% of monthly rent for a non-rent default), as allowed by § 42-46(i).

## Open questions for the reviewing attorney

- § 42-45 (state military termination) covers ONLY dual-status military technicians under 10 U.S.C. § 10216 since the 2019 amendment (S.L. 2019-161). Active-duty servicemembers (e.g. Fort Bragg) are covered by the federal SCRA, 50 U.S.C. § 3955, and North Carolina National Guard members on State active duty for more than 30 consecutive days (and other states' Guard members residing in NC) get SCRA protections through N.C. Gen. Stat. §§ 127B-27, 127B-28; dependents through § 127B-29. The lease states all three.
- The live NC template before 2026-11-08 stated the deposit cap as 1.5 months for terms longer than month-to-month and cited § 42-50 for it. Current § 42-51(b) allows 2 months for terms longer than month-to-month and 1.5 months for month-to-month; the holding rule is § 42-50. Corrected.
- § 42-51(a)(3) allows the deposit to cover 'damages as the result of the nonfulfillment of the rental period' and § 42-51(a)(5) re-renting costs, which supports applying the deposit to an unpaid early termination fee — except where the tenant terminated under § 42-45 or § 42-45.1.
- Duty to mitigate is case law (Isbey v. Crews, 55 N.C. App. 47 (1981)), not statute. Citation not verified against the reporter — attorney to confirm.
- North Carolina has no statute on landlord entry notice; the 24-hour courtesy notice is contractual.
- § 42-46 was amended in 2025 (S.L. 2025-45, 2025-52, 2025-54); text read from ncleg.gov on 2026-11-08.
- Liquidated-damages early termination fee: NC courts enforce liquidated damages that are a reasonable estimate of damages difficult to ascertain and not a penalty; the 2-month default should be reviewed against that standard.

## Statutes read (full text)

- N.C. Gen. Stat. § 42-3: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-3.html
- N.C. Gen. Stat. § 42-14: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-14.html
- N.C. Gen. Stat. § 42-25.6: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-25.6.html
- N.C. Gen. Stat. § 42-25.9: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-25.9.html
- N.C. Gen. Stat. § 42-26: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-26.html
- N.C. Gen. Stat. § 42-42: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-42.html
- N.C. Gen. Stat. § 42-45: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-45.html
- N.C. Gen. Stat. § 42-45.1: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-45.1.html
- N.C. Gen. Stat. § 42-45.2: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-45.2.html
- N.C. Gen. Stat. § 42-46: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-46.html
- N.C. Gen. Stat. § 42-50: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-50.html
- N.C. Gen. Stat. § 42-51: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-51.html
- N.C. Gen. Stat. § 42-52: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-52.html
- N.C. Gen. Stat. § 42-53: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-53.html
- N.C. Gen. Stat. § 41A-4: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_41A/GS_41A-4.html
- N.C. Gen. Stat. §§ 127B-25 to 127B-37 (N.C. Servicemembers Civil Relief Act): https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_127B/Article_4.html
- 50 U.S.C. § 3955: https://www.law.cornell.edu/uscode/text/50/3955
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
