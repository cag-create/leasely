# Alabama (AL): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `dc804befebd5ab33`
- **Framework:** Alabama Uniform Residential Landlord and Tenant Act, Ala. Code §§ 35-9A-101 et seq.
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/AL-residential.html) · [co-living](samples/AL-coliving.html)

To approve after review: `pnpm lease:approve AL --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | 1 month(s) rent: The security deposit may not exceed one month's rent, except that Landlord may require additional deposits for pets, for changes to the Property, or for increased liability risks to Landlord or the Property. | Ala. Code § 35-9A-201(a) |
| Deposit return | 60 days: Within 60 days after the tenancy ends and Tenant delivers possession, Landlord shall mail to Tenant the security deposit, less accrued rent and damages caused by Tenant's failure to meet Tenant's duties under Ala. Code § 35-9A-301, with an itemized list of any amounts withheld. When moving out, Tenant shall give Landlord a valid forwarding address in writing. If Tenant does not, Landlord will mail the refund or accounting by first-class mail to Tenant's last known address or, if none, to Tenant at the Property. A deposit or refund check left unclaimed for 90 days is forfeited. If Landlord fails to mail a timely refund or accounting, Landlord must pay Tenant double the amount of the original deposit. | Ala. Code § 35-9A-201(b)-(f) |
| Deposit holding | No statutory holding rule | — |
| Deposit interest required | No | |
| Move-in inspection | No statutory requirement (lease adds a contractual condition report) | |
| Late fee grace period | None in statute | — |
| Late fee cap | none: No numeric cap; must be reasonable | — |
| Month-to-month notice | 30 days: Either Landlord or Tenant may end a month-to-month tenancy by written notice given to the other at least 30 days before the periodic rental date stated in the notice (seven days before the termination date for a week-to-week tenancy). | Ala. Code § 35-9A-441(a)-(b) |
| Nonpayment notice | 7 days: If rent is not paid when due, Landlord may deliver to Tenant a written notice to terminate this Lease that states the amount of rent and any late fees owed and that this Lease will terminate on a date at least seven business days after Tenant receives the notice. If Tenant does not pay the amount owed within those seven business days, this Lease terminates. A breach of this Lease may not be cured more than two times in any 12-month period without Landlord's express written consent. | Ala. Code § 35-9A-421(b), (d) |
| Entry notice | 48 hours: Tenant shall not unreasonably withhold consent for Landlord to enter to inspect the Property, make necessary or agreed repairs, decorations, alterations, or improvements, supply necessary or agreed services, or show the Property to prospective or actual purchasers, mortgagees, tenants, workers, or contractors. Except in an emergency, under a court order, during an absence by Tenant of more than 14 days, when Landlord reasonably believes Tenant has abandoned or surrendered the Property, or when it is impracticable, Landlord will give Tenant at least two days' notice of the intent to enter and will enter only at reasonable times. Notice may be given by posting a note on the primary entry door stating the intended time and purpose of the entry. If Landlord gives Tenant, separately from this Lease, a general notice or schedule more than two days in advance for repairs, maintenance, pest control, or health or safety services, no further notice is needed for those visits. When Tenant requests repairs, maintenance, or improvements, Tenant consents to Landlord's entry to perform them. Landlord may show the Property to prospective tenants or purchasers without Tenant's consent only within four months before this Lease expires, at reasonable times with two days' notice, in the company of the prospective tenant or purchaser, and only if Tenant has signed a separate general notice allowing it. Landlord will not abuse the right of access or use it to harass Tenant. | Ala. Code § 35-9A-303 |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | statute: If Tenant abandons the Property, Landlord shall make reasonable efforts to re-rent it at a fair rental, although Landlord may first rent its other vacant units. If Landlord re-rents the Property for a term beginning before this Lease would have ended, this Lease ends when the new tenancy begins. | Ala. Code § 35-9A-423(c) |
| State fair housing classes (beyond federal) | None beyond federal | Ala. Code § 24-8-4 (Alabama Fair Housing Law: race, color, religion, sex, familial status, national origin, handicap) |
| Eviction | Landlord may recover possession only through an eviction action in district or circuit court and a writ of possession issued after judgment. Landlord will not remove or exclude Tenant, or interrupt heat, running water, hot water, electricity, gas, or other essential services, to regain possession. | Ala. Code §§ 35-9A-461, 35-9A-427 |
| Habitability | Landlord shall comply with applicable building and housing codes materially affecting health and safety, make all repairs and do whatever is necessary to put and keep the Property in a habitable condition, keep common areas clean and safe, maintain in good and safe working order all electrical, plumbing, sanitary, heating, ventilating, air-conditioning, and other facilities and appliances Landlord supplies, provide and maintain garbage receptacles and arrange for removal of waste, and supply running water, reasonable amounts of hot water at all times, and reasonable heat. | Ala. Code § 35-9A-204 |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Alabama National Guard on state active duty (state extension of the SCRA)
*Ala. Code §§ 31-12-1, 31-12-2(a), 31-12-4*

- **Who:** An active member of the Alabama National Guard, or a member of another state's National Guard who is employed in Alabama, who is called or ordered to state active duty or to federally funded duty other than training (under 32 U.S.C. § 502(f)) in time of war, armed conflict, or an emergency proclaimed by the Governor or the President, has the same lease termination rights as a servicemember under the federal Servicemembers Civil Relief Act, 50 U.S.C. § 3955 (described above), subject to the same minimum periods of service that federal law requires. This does not apply to normal weekend drill, annual training, or required schools.
- **Notice:** Tenant delivers written notice of termination. For a lease with monthly rent, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered.
- **Documentation:** The notice must include a copy of the military orders.
- **Owes:** Tenant owes rent prorated to the termination date and no early termination fee. Rent paid in advance for any period after termination is refunded within 30 days.

### Fire or casualty damage
*Ala. Code § 35-9A-406*

- **Who:** If fire or casualty not caused by Tenant damages or destroys the Property so that Tenant's enjoyment of it is substantially impaired, Tenant may terminate this Lease.
- **Notice:** Tenant vacates immediately and notifies Landlord in writing within 14 days afterward of the intent to terminate; this Lease ends on the date Tenant vacated. If continued occupancy is lawful, Tenant may instead vacate only the unusable part and pay reduced rent.
- **Owes:** Rent is accounted for as of the date of the fire or casualty. Landlord returns the recoverable security deposit and all unearned prepaid rent. No early termination fee is owed.

### Landlord's material noncompliance
*Ala. Code § 35-9A-401*

- **Who:** If Landlord materially fails to comply with this Lease, or fails to comply with Ala. Code § 35-9A-204 in a way that materially affects health and safety, Tenant may terminate this Lease, unless Tenant, a family member, a licensee, or another person on the premises with Tenant's consent caused the condition.
- **Notice:** Tenant delivers written notice describing the breach and stating that this Lease will terminate on a date at least 14 days after Landlord receives the notice if the breach is not remedied within that period. This Lease does not terminate if Landlord adequately remedies the breach before that date.
- **Owes:** No early termination fee is owed. Landlord returns the recoverable security deposit and all unearned prepaid rent.

### Unlawful ouster or interruption of essential services
*Ala. Code § 35-9A-407*

- **Who:** If Landlord unlawfully removes or excludes Tenant, or willfully interrupts heat, running water, hot water, electricity, gas, or another essential service, Tenant may recover possession or terminate this Lease.
- **Notice:** 
- **Owes:** No early termination fee is owed. Tenant may recover up to three months' rent or actual damages, whichever is greater, plus reasonable attorney's fees, and Landlord returns the recoverable security deposit and all unearned prepaid rent.

### Unlawful entry or harassment by Landlord
*Ala. Code § 35-9A-442(b)*

- **Who:** If Landlord makes an unlawful entry, a lawful entry in an unreasonable manner, or excessive demands for entry that unreasonably harass Tenant, Tenant may terminate this Lease under Ala. Code § 35-9A-401.
- **Notice:** Tenant follows the written notice procedure for Landlord's noncompliance described above.
- **Owes:** No early termination fee is owed, and Tenant may recover actual damages.


## State disclosures in the lease

- **Manager and Owner** (Ala. Code § 35-9A-202): The person authorized to manage the Property, and the owner or the person authorized to act for the owner for service of process and for receiving and receipting notices and demands, is {{landlord_name}}, {{landlord_address}}, unless Landlord identifies a different manager or owner in writing at or before the start of the tenancy. Landlord will keep this information current.

## Open questions for the reviewing attorney

- SOURCE: the official ALISON code site is JavaScript-only, so statute text was read from Justia's 2025 Code of Alabama through a browser and saved verbatim. 2026 session acts were not checked against an official compilation. HB80 (2026, amending Title 6 eviction notice and property-removal procedure in §§ 6-6-332, 6-6-338) was pending as of February 2026 and its final status is unverified. Attorney to confirm.
- No domestic violence lease-termination statute. Chapter 9A contains no such section (Article 3 ends at § 35-9A-304, and there is no § 35-9A-305 or -440 despite citations on some landlord blogs). domesticViolence is null.
- Military: Alabama has no state military lease-termination statute in Chapter 9A. Ala. Code § 31-12-2(a) applies the federal SCRA (including § 3955) to Alabama National Guard members, and other states' Guard members employed in Alabama, called to state active duty or 32 U.S.C. § 502(f) duty in time of war, armed conflict, or a proclaimed emergency. Federal minimum service periods apply equally. This extension is placed in 'military' because it is Alabama's only state-law military termination right.
- Deposit cap exceptions (pets, changes to the premises, increased liability risks) have no stated limit. Attorney to advise how far landlords may go. Alabama has no escrow, interest, or move-in checklist requirement. Failure to mail a refund or accounting within 60 days costs DOUBLE the original deposit (§ 35-9A-201(f)).
- § 35-9A-163(a)(3): a lease may not require the tenant to pay the landlord's attorney's fees or cost of collection. Any Keycove collection or admin fee passed to Alabama tenants must be checked. The builder's early termination fee is a liquidated-damages provision, not a collection cost, but attorney to confirm.
- 'Day' means calendar day (§ 35-9A-141(3)), with a last day on a weekend or holiday rolling to the next court business day. The nonpayment and default notices are expressly seven BUSINESS days (§ 35-9A-421(a)-(b)). § 35-9A-421(d) limits cures to two per 12 months and lists non-curable defaults (drugs, illegal firearm discharge, criminal assault, or a repeat of a cured breach within six months) that allow termination on a seven-day notice.
- Entry: two days' notice (§ 35-9A-303(c)). Showings without consent require a separate general notice signed by the tenant, within four months of lease expiration (§ 35-9A-303(b)(4)). Keycove should offer that notice as a separate signature document if landlords want showing rights.
- No statutory late-fee cap or grace period. Late fees are included in 'rent' only as 'payments to be made to or for the benefit of the landlord under the rental agreement' (§ 35-9A-141(12)), and § 35-9A-421(b) lets the nonpayment notice include late fees.
- Early termination fee: no statutory cap or rule. Enforceability of a two-month liquidated-damages fee rests on Alabama contract law (not researched).
- Mitigation is statutory (§ 35-9A-423(c)) but expressly subordinate to the landlord's right to rent its other vacant units first.
- Abandonment: a property is deemed abandoned if electric service is off for seven consecutive days (§ 35-9A-423(e)). Property left more than 14 days after termination may be disposed of (§ 35-9A-423(d)).
- Local law: Alabama has no known local rent control or just-cause ordinances. A state preemption statute was not researched.

## Statutes read (full text)

- Ala. Code Title 35, Chapter 9A (section listing, 2025 Code): https://law.justia.com/codes/alabama/title-35/chapter-9a/
- Ala. Code § 35-9A-122: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-1/division-2/section-35-9a-122/
- Ala. Code § 35-9A-141: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-1/division-3/section-35-9a-141/
- Ala. Code § 35-9A-161: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-1/division-4/section-35-9a-161/
- Ala. Code § 35-9A-163: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-1/division-4/section-35-9a-163/
- Ala. Code § 35-9A-201: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-2/section-35-9a-201/
- Ala. Code § 35-9A-202: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-2/section-35-9a-202/
- Ala. Code § 35-9A-204: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-2/section-35-9a-204/
- Ala. Code § 35-9A-303: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-3/section-35-9a-303/
- Ala. Code § 35-9A-401: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-1/section-35-9a-401/
- Ala. Code § 35-9A-406: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-1/section-35-9a-406/
- Ala. Code § 35-9A-407: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-1/section-35-9a-407/
- Ala. Code § 35-9A-421: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-2/section-35-9a-421/
- Ala. Code § 35-9A-423: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-2/section-35-9a-423/
- Ala. Code § 35-9A-426: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-2/section-35-9a-426/
- Ala. Code § 35-9A-427: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-2/section-35-9a-427/
- Ala. Code § 35-9A-441: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-3/section-35-9a-441/
- Ala. Code § 35-9A-442: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-3/section-35-9a-442/
- Ala. Code § 35-9A-461: https://law.justia.com/codes/alabama/title-35/chapter-9a/article-4/division-4/section-35-9a-461/
- Ala. Code §§ 31-12-1 to 31-12-10: https://law.justia.com/codes/alabama/title-31/chapter-12/
- Ala. Code § 24-8-3: https://law.justia.com/codes/alabama/title-24/chapter-8/section-24-8-3/
- Ala. Code § 24-8-4: https://law.justia.com/codes/alabama/title-24/chapter-8/section-24-8-4/
- 50 U.S.C. § 3955: https://www.law.cornell.edu/uscode/text/50/3955
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
