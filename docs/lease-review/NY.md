# New York (NY): lease review packet

- **Status:** Not approved (not offered to landlords)
- **Template hash:** `ca1b8163d6b4fa50`
- **Framework:** New York Real Property Law Article 7 (Landlord and Tenant), General Obligations Law §§ 7-101 et seq. (security deposits), and Real Property Actions and Proceedings Law Article 7 (summary proceedings)
- **Researcher confidence:** high (statutes read 2026-11-08)
- **Sample leases:** [residential](samples/NY-residential.html) · [co-living](samples/NY-coliving.html)

To approve after review: `pnpm lease:approve NY --by "Reviewer name, Esq."` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | 1 month(s) rent: The security deposit or any advance payment may not exceed one month's rent. The only payments Landlord may require before or at the start of the tenancy are the security deposit, rent, and a background and credit check fee of no more than the lesser of the actual cost or $20.00 (waived if Tenant provides a check done within the past 30 days). | N.Y. Gen. Oblig. Law § 7-108(1-a)(a); N.Y. Real Prop. Law § 238-a(1) |
| Deposit return | 14 days: Within 14 days after Tenant vacates, Landlord shall give Tenant an itemized statement of the basis for any amount retained and return the rest of the deposit. Landlord may retain only reasonable, itemized amounts for unpaid rent, damage caused by Tenant beyond normal wear and tear, unpaid utility charges payable to Landlord under this Lease, and moving and storage of Tenant's belongings, and may not retain anything for ordinary wear and tear or damage caused by a prior tenant. If Landlord misses the 14-day deadline, Landlord forfeits any right to retain any part of the deposit. After either party gives notice of intent to end the tenancy (unless Tenant gives less than two weeks' notice), Landlord will tell Tenant in writing of the right to request a pre-move-out inspection; if Tenant requests one, it will be held one to two weeks before the tenancy ends on at least 48 hours' written notice, and Tenant may cure any listed condition before moving out. | N.Y. Gen. Oblig. Law § 7-108(1-a)(b), (d)–(g) |
| Deposit holding | The deposit remains Tenant's money, is held in trust by Landlord, and may not be commingled with Landlord's own money. If Landlord deposits it in a bank, the bank must have a place of business in New York, and Landlord shall notify Tenant in writing of the name and address of the bank and the amount deposited. If the building has six or more apartments, Landlord shall keep the deposit in an interest-bearing account at a New York bank; Landlord may keep 1% per year of the deposit as an administrative fee, and the rest of the interest belongs to Tenant and will be held in trust or paid to Tenant annually. | N.Y. Gen. Oblig. Law § 7-103(1), (2), (2-a) |
| Deposit interest required | No | |
| Move-in inspection | After signing this Lease and before Tenant moves in, Landlord shall offer Tenant the opportunity to inspect the Property with Landlord or Landlord's agent. If Tenant requests the inspection, Landlord and Tenant will sign a written agreement before move-in describing the condition of the Property and noting any existing defects or damage, and Landlord may not keep any part of the deposit for any condition, defect, or damage noted in that agreement. | |
| Late fee grace period | 5 days | N.Y. Real Prop. Law § 238-a(2), (3) |
| Late fee cap | lesser_of (= $50.00 on $1,500 rent): A late fee may be charged only if rent has not been paid within five days after its due date, and it may not exceed $50.00 or 5% of the monthly rent, whichever is less. Any lease term that waives or limits this rule is void. | N.Y. Real Prop. Law § 238-a(2), (3) |
| Month-to-month notice | 30 days: Tenant may end a month-to-month tenancy by written notice at least one month before the end of a monthly rental period. To end a month-to-month tenancy, not renew this Lease, or renew it with a rent increase of 5% or more, Landlord must give Tenant written notice of at least 30 days if Tenant has lived in the Property less than one year and has a lease term of less than one year, at least 60 days if Tenant has lived there one to two years or has a lease term of one to two years, and at least 90 days if Tenant has lived there more than two years or has a lease term of at least two years. If Landlord's notice is late, Tenant's tenancy continues on the existing terms until the notice period expires. Where the New York State Good Cause Eviction Law applies, Landlord may decline to renew only for a good cause listed in that law. | N.Y. Real Prop. Law §§ 226-c, 232-a, 232-b, 232-c |
| Nonpayment notice | 14 days: If Landlord does not receive rent within five days after it is due, Landlord shall send Tenant written notice of the nonpayment by certified mail. Before starting a nonpayment proceeding, Landlord must serve a written demand giving Tenant at least 14 days to pay the rent or surrender possession, with the Good Cause Eviction Law notice attached, and may then begin a summary proceeding in court. | N.Y. Real Prop. Law § 235-e(d); N.Y. Real Prop. Actions & Proc. Law § 711(2) |
| Entry notice | No statutory hours: New York has no statute setting an entry-notice period for most rentals. Except in an emergency, Landlord will give Tenant at least 24 hours' notice before entering to inspect, make repairs, or show the Property, and will enter only at reasonable times. | — |
| Early termination fee cap | None in statute (default fee: 2 months' rent, landlord-editable) | — |
| Duty to mitigate | statute: If Tenant vacates in violation of this Lease, Landlord shall, in good faith and according to Landlord's resources and abilities, take reasonable and customary actions to re-rent the Property at fair market value or at the rent in this Lease, whichever is lower. Once a new tenant's lease takes effect, this Lease ends and rent received from the new tenant reduces what Tenant owes. Landlord bears the burden of proving damages. | N.Y. Real Prop. Law § 227-e |
| State fair housing classes (beyond federal) | creed, citizenship or immigration status, sexual orientation, gender identity or expression, military status, age, marital status, status as a victim of domestic violence, lawful source of income | N.Y. Exec. Law § 296(5)(a) |
| Eviction | Landlord may remove Tenant or any lawful occupant only through a special summary proceeding in court under Article 7 of the Real Property Actions and Proceedings Law and a warrant of eviction executed by a marshal, sheriff, or constable. Landlord will not use or threaten force, interrupt essential services, remove Tenant's belongings, remove the door, change or disable the locks, or otherwise try to force Tenant out; doing so is a crime and exposes Landlord to civil penalties and treble damages. | N.Y. Real Prop. Actions & Proc. Law §§ 711, 768, 853 |
| Habitability | Landlord warrants that the Property and all areas used in common with other tenants are fit for human habitation and for the uses reasonably intended by the parties, and that occupants will not be subjected to any conditions dangerous, hazardous, or detrimental to their life, health, or safety, except conditions caused by the misconduct of Tenant or persons under Tenant's direction or control. This warranty cannot be waived. | N.Y. Real Prop. Law § 235-b |

## Early termination rights that override the lease-break fee

### Military service (federal Servicemembers Civil Relief Act)
*50 U.S.C. § 3955*

- **Who:** Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.
- **Notice:** Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.
- **Documentation:** The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).
- **Owes:** Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.

### Military service (New York Military Law)
*N.Y. Mil. Law §§ 301(1), 310*

- **Who:** Tenant may terminate this Lease if Tenant (or the person on whose behalf it was signed) entered military service after signing it and the Property has been occupied by Tenant or Tenant's dependents. 'Military service' includes active federal military service, active duty in the military service of New York under an order of the Governor, and state active duty by members of the National Guard called by the governor of New York or another state. The right also applies when the Lease was signed jointly with the servicemember's spouse.
- **Notice:** Tenant may deliver or mail written notice to Landlord or Landlord's agent at any time after military service begins. Because rent is paid monthly, termination takes effect 30 days after the first date on which the next rent payment is due after the notice is delivered or mailed.
- **Owes:** Tenant owes rent prorated through the termination date, and Landlord shall refund any rent paid in advance for a later period. Landlord may ask a court, before the termination date, to modify this relief as justice and equity require. Landlord may not hold Tenant's belongings to secure rent for any period after termination.

### Victims of domestic violence
*N.Y. Real Prop. Law § 227-c*

- **Who:** Tenant may terminate this Lease if Tenant or a member of Tenant's household is a victim of domestic violence as defined in N.Y. Social Services Law § 459-a and reasonably fears remaining in the Property because of potential further domestic violence.
- **Notice:** Tenant delivers written notice to Landlord or Landlord's agent, and to any co-tenant other than the person who committed the domestic violence, stating that Tenant or a household member has experienced domestic violence and reasonably believes they cannot safely remain in the Property, and naming a termination date at least 30 days after delivery. A mailed notice is deemed delivered five days after mailing. If Landlord is the alleged perpetrator, a person Tenant authorizes may deliver the notice.
- **Documentation:** Within 25 days after the notice, Tenant shall provide documentation, which may be any one or more of: a temporary or final order of protection; a record, complaint, or report from a law enforcement agency; a record from a health care provider of treatment related to the domestic violence; or a sworn or notarized written verification from a qualified third party (such as a law enforcement officer, court employee, licensed attorney, physician, psychologist, social worker, nurse, therapist, or counselor, a domestic violence agency employee, or a member of the clergy) to whom the violence was reported. Landlord shall keep this information confidential and shall not describe the termination as an early termination to any prospective landlord or third party.
- **Owes:** Tenant pays rent prorated to the termination date and owes no rent after it. Landlord shall refund prepaid rent for any period after termination within 10 days after the notice is delivered, as long as Tenant has vacated, and may not withhold any part of the security deposit because Tenant used this right. Landlord may not terminate or sever a remaining co-tenant's tenancy without that co-tenant's consent and must give them at least 30 days after the termination date to decide.

### Tenant age 62 or older, or with a disability, moving to care, subsidized or senior housing, or a family member's home
*N.Y. Real Prop. Law § 227-a*

- **Who:** A Tenant who is 62 or older (or will turn 62 during this Lease), or who has a disability as defined in N.Y. Executive Law § 292(21), or the spouse or dependent of such a person residing with them, may terminate this Lease if Tenant (i) is certified by a physician as no longer able, for medical reasons, to live independently and needing help with activities of daily living, and will move into a family member's residence, or (ii) is notified of the opportunity to move into an adult care facility (other than a shelter), a residential health care facility, subsidized low- or moderate-income housing, or less expensive housing in a project built for seniors or persons with disabilities.
- **Notice:** Tenant delivers written notice to Landlord or Landlord's agent. Termination takes effect no earlier than 30 days after the date the next rent payment is due after the notice is delivered. A mailed notice is deemed delivered five days after mailing.
- **Documentation:** The notice must include the physician's certification and, for a move to a family member's home, a notarized statement from the family member that Tenant is related and will live with them for at least six months; or, for a facility or housing project, a copy of Tenant's executed lease or contract with the facility.
- **Owes:** Tenant owes no rent for any period after the termination date, and rent paid in advance is adjusted to the date Tenant surrenders the Property.

### Building destroyed or made untenantable
*N.Y. Real Prop. Law § 227*

- **Who:** If the building is destroyed or so damaged by the elements or any other cause that it is untenantable and unfit for occupancy, and the destruction or damage did not result from Tenant's fault or neglect, Tenant may quit and surrender possession.
- **Notice:** Tenant ends this Lease by surrendering possession of the Property.
- **Owes:** Tenant owes no rent for the period after surrender, and any rent paid in advance is adjusted to the date of surrender.

### Death of a tenant (assignment request)
*N.Y. Real Prop. Law § 236*

- **Who:** If a Tenant dies, the executor, administrator, or legal representative of the estate may ask Landlord to consent to an assignment or sublease of this Lease.
- **Notice:** The request must be sent by registered or certified mail, return receipt requested, with the written consent of any co-tenant or guarantor and the name and business and home addresses of the proposed assignee or subtenant. Landlord may ask for more information within 10 days and must respond within 30 days; silence is consent.
- **Owes:** If Landlord terminates this Lease or unreasonably refuses consent, this Lease ends and the estate and any other tenant are released from further liability as of the last day of the calendar month in which Landlord was required to respond.

### Assignment refused unreasonably
*N.Y. Real Prop. Law § 226-b(1)*

- **Who:** Tenant may ask Landlord's written consent to assign this Lease. If Landlord unreasonably withholds consent, Tenant may require Landlord to release Tenant from this Lease.
- **Notice:** On Tenant's request after an unreasonable refusal, Landlord shall release Tenant on 30 days' notice.
- **Owes:** Tenant owes rent only through the release date. If Landlord reasonably withholds consent, Tenant is not released.


## State disclosures in the lease

- **Good Cause Eviction Law notice** (N.Y. Real Prop. Law § 231-c): Landlord has attached to this Lease and made part of it the completed statutory Notice to Tenant of Applicability or Inapplicability of the New York State Good Cause Eviction Law, stating whether the Property is subject to Article 6-A of the Real Property Law and, if it is exempt, why.
- **Sprinkler system notice** (N.Y. Real Prop. Law § 231-a): NOTICE: Landlord states in the attached sprinkler rider, in bold type, whether there is a maintained and operative sprinkler system in the leased premises and, if there is, the date of its last maintenance and inspection.
- **Flood history and risk notice** (N.Y. Real Prop. Law § 231-b): Landlord states in the attached flood rider whether any or all of the Property is located wholly or partially in a FEMA-designated floodplain, in the Special Flood Hazard Area (100-year floodplain), or in a Moderate Risk Flood Hazard Area (500-year floodplain) according to FEMA's current Flood Insurance Rate Maps, and any prior flood damage to the Property from a natural flood event that Landlord knows or reasonably should know about and the nature of that damage. Flood insurance is available to renters through the Federal Emergency Management Agency's (FEMA's) National Flood Insurance Program (NFIP) to cover your personal property and contents in the event of a flood. A standard renter's insurance policy does not typically cover flood damage. You are encouraged to examine your policy to determine whether you are covered.
- **Roommates and additional occupants** (N.Y. Real Prop. Law § 235-f): If one Tenant signs this Lease, Tenant may share the Property with Tenant's immediate family, one additional occupant, and that occupant's dependent children, as long as Tenant or Tenant's spouse occupies the Property as a primary residence. If two or more Tenants sign, the total number of tenants and occupants (not counting occupants' dependent children) may not exceed the number of Tenants named in this Lease. Tenant shall tell Landlord the name of any occupant within 30 days after the occupant moves in or within 30 days after Landlord asks. An occupant gains no right to stay if Tenant leaves unless Landlord agrees in writing. Occupancy remains subject to legal occupancy limits.
- **Rent payments, receipts, and fees** (N.Y. Real Prop. Law §§ 235-e, 235-g, 235-i, 238-a): Landlord will not require electronic payment as the only way to pay rent and will not charge a fee for choosing not to pay electronically. Landlord will give a written receipt for rent paid in cash or by any instrument other than Tenant's personal check (and for personal checks if Tenant asks in writing). Any returned-check fee must be stated in this Lease and may not exceed the amount allowed by N.Y. Real Prop. Law § 238-a(2-a). A fee to copy keys may not exceed 110% of the actual cost, except after three copies in a calendar year.
- **Right to sublease** (N.Y. Real Prop. Law § 226-b(2)) *Only for a building with four or more residential units*: If the building has four or more residential units, Tenant may sublease the Property with Landlord's advance written consent, which Landlord will not unreasonably withhold, by following the certified-mail request procedure in N.Y. Real Prop. Law § 226-b(2). Tenant remains liable under this Lease during any sublease.

## Open questions for the reviewing attorney

- Source access: nysenate.gov returns a Cloudflare JavaScript challenge (HTTP 403) to curl and the OpenLegislation API needs a key. All NY text was read in full from NewYork.Public.Law, which reproduces the nysenate.gov text and states the official 'updated' date for each section (e.g., RPL § 238-a updated Oct. 17, 2025; § 226-c and § 231-c updated Aug. 22, 2025; RPAPL § 711 updated Dec. 13, 2024). Please spot-check against nysenate.gov.
- ATTACHMENTS REQUIRED (engineering): (1) RPL § 231-c requires every landlord (defined broadly in RPL § 211(2), so statewide, not just NYC) to append or incorporate the statutory Good Cause Eviction notice into any initial or renewal lease, including landlords who are exempt (the form states the exemption reason). (2) RPL § 231-b requires every residential lease to state the four flood answers; (3) RPL § 231-a requires conspicuous bold-face sprinkler notice. The disclosure text recites these, but Keycove must collect the answers and render them (sprinkler in bold).
- Military: N.Y. Military Law § 310 is broader than the SCRA in one way: 'military service' (§ 301(1)) includes New York state active duty on the Governor's order and National Guard state active duty, with no minimum duration and no orders requirement. It covers only leases signed BEFORE the tenant entered military service (or signed jointly with the spouse). The statute does not require any documentation; we left documentation empty rather than invent a requirement.
- Month-to-month: outside NYC, § 232-b lets the tenant end a monthly tenancy on one month's notice before the end of the term; inside NYC, § 232-a addresses only landlord notice. Landlord notice follows § 226-c's 30/60/90-day scale. monthToMonthDays is 30 as the minimum.
- Nonpayment: RPL § 235-e(d) requires the landlord to send a certified-mail notice if rent is not received within five days of the due date; failure is an affirmative defense to a nonpayment eviction. RPAPL § 711(2) requires a 14-day written rent demand that also attaches the Good Cause notice (until June 15, 2034).
- Early termination fee: no statute caps it, but RPL § 227-e (mitigation, non-waivable) and § 238-a (no fees beyond those listed) are in tension with any fee charged as a 'fee'. We treat the lease-break fee as an optional liquidated-damages buyout the tenant elects; please confirm that characterization is acceptable under § 238-a(1)(a), which bars 'any other payment, fee or charge before or at the beginning of the tenancy' (the buyout is charged at the end, so we believe it is outside that clause).
- RPL § 227 lets the tenant surrender after destruction only where 'no express agreement to the contrary has been made in writing'. The builder must not include any casualty clause that contradicts it.
- Deposit interest: GOL § 7-103(2-a) requires an interest-bearing account only for buildings with six or more units, so interestRequired is false; holdingRule explains the six-unit rule. Rent-stabilized units are governed by GOL § 7-107 (not read).
- Co-living: RPAPL § 711 treats an occupant of a room in a rooming house, or a non-transient hotel resident in possession 30+ days, as a tenant who can be removed only by a court proceeding. RPL § 235-f (roommate law) applies to every residential lease; a co-living agreement cannot restrict occupancy to the named tenant(s).
- Good Cause Eviction Law (RPL Article 6-A, §§ 211-218): applies in New York City and in localities that opt in (e.g., several upstate cities), with exemptions including 'small landlords' (10 or fewer units statewide, or a local threshold). It limits non-renewal to listed good causes and makes rent increases above the lower of CPI+5% or 10% presumptively unreasonable. Not encoded beyond the notice requirement.
- Local law warnings: NYC rent stabilization and rent control (Rent Stabilization Law, ETPA in Nassau/Westchester/Rockland and opt-in localities) require riders and override many terms here; NYC Administrative Code requires a bed bug infestation history disclosure, window guard notice, lead-paint annual notice (Local Law 1), stove knob cover notice, and a smoking policy disclosure (Local Law 147); the FARE Act limits broker fees charged to NYC tenants. Many upstate municipalities require rental registration/certificates of occupancy.
- DV: RPL § 227-c covers domestic violence as defined in Social Services Law § 459-a (not read; includes family offenses). Stalking or sexual assault by a non-household member may fall outside it. RPL § 227-d (only its definitions subdivision was read) bars discrimination based on domestic violence victim status.
- Application screening: RPL § 227-f bars refusing to rent because an applicant was in a prior landlord-tenant case; Exec. Law § 296(5) adds citizenship/immigration status. Not encoded in the lease.

## Statutes read (full text)

- N.Y. Gen. Oblig. Law § 7-103: https://newyork.public.law/laws/n.y._general_obligations_law_section_7-103
- N.Y. Gen. Oblig. Law § 7-108: https://newyork.public.law/laws/n.y._general_obligations_law_section_7-108
- N.Y. Real Prop. Law § 211: https://newyork.public.law/laws/n.y._real_property_law_section_211
- N.Y. Real Prop. Law § 223-b: https://newyork.public.law/laws/n.y._real_property_law_section_223-b
- N.Y. Real Prop. Law § 226-b: https://newyork.public.law/laws/n.y._real_property_law_section_226-b
- N.Y. Real Prop. Law § 226-c: https://newyork.public.law/laws/n.y._real_property_law_section_226-c
- N.Y. Real Prop. Law § 227: https://newyork.public.law/laws/n.y._real_property_law_section_227
- N.Y. Real Prop. Law § 227-a: https://newyork.public.law/laws/n.y._real_property_law_section_227-a
- N.Y. Real Prop. Law § 227-c: https://newyork.public.law/laws/n.y._real_property_law_section_227-c
- N.Y. Real Prop. Law § 227-e: https://newyork.public.law/laws/n.y._real_property_law_section_227-e
- N.Y. Real Prop. Law § 227-f: https://newyork.public.law/laws/n.y._real_property_law_section_227-f
- N.Y. Real Prop. Law § 231-a: https://newyork.public.law/laws/n.y._real_property_law_section_231-a
- N.Y. Real Prop. Law § 231-b: https://newyork.public.law/laws/n.y._real_property_law_section_231-b
- N.Y. Real Prop. Law § 231-c: https://newyork.public.law/laws/n.y._real_property_law_section_231-c
- N.Y. Real Prop. Law § 232-a: https://newyork.public.law/laws/n.y._real_property_law_section_232-a
- N.Y. Real Prop. Law § 232-b: https://newyork.public.law/laws/n.y._real_property_law_section_232-b
- N.Y. Real Prop. Law § 232-c: https://newyork.public.law/laws/n.y._real_property_law_section_232-c
- N.Y. Real Prop. Law § 235-b: https://newyork.public.law/laws/n.y._real_property_law_section_235-b
- N.Y. Real Prop. Law § 235-e: https://newyork.public.law/laws/n.y._real_property_law_section_235-e
- N.Y. Real Prop. Law § 235-f: https://newyork.public.law/laws/n.y._real_property_law_section_235-f
- N.Y. Real Prop. Law § 235-g: https://newyork.public.law/laws/n.y._real_property_law_section_235-g
- N.Y. Real Prop. Law § 235-i: https://newyork.public.law/laws/n.y._real_property_law_section_235-i
- N.Y. Real Prop. Law § 236: https://newyork.public.law/laws/n.y._real_property_law_section_236
- N.Y. Real Prop. Law § 238-a: https://newyork.public.law/laws/n.y._real_property_law_section_238-a
- N.Y. Real Prop. Actions & Proc. Law § 711: https://newyork.public.law/laws/n.y._real_property_actions_and_proceedings_law_section_711
- N.Y. Real Prop. Actions & Proc. Law § 768: https://newyork.public.law/laws/n.y._real_property_actions_and_proceedings_law_section_768
- N.Y. Real Prop. Actions & Proc. Law § 853: https://newyork.public.law/laws/n.y._real_property_actions_and_proceedings_law_section_853
- N.Y. Exec. Law § 296: https://newyork.public.law/laws/n.y._executive_law_section_296
- N.Y. Mil. Law § 301: https://newyork.public.law/laws/n.y._military_law_section_301
- N.Y. Mil. Law § 303: https://newyork.public.law/laws/n.y._military_law_section_303
- N.Y. Mil. Law § 310: https://newyork.public.law/laws/n.y._military_law_section_310
- N.Y. Mil. Law § 311-b: https://newyork.public.law/laws/n.y._military_law_section_311-b
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
