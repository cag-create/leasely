// Federal early termination right that applies in every state.
// Source: 50 U.S.C. § 3955 (SCRA), full text read 2026-11-08 from
// https://www.law.cornell.edu/uscode/text/50/3955 — subsections (a)–(i).
import type { StatutoryTerminationRight } from "./types";

export const SCRA_RIGHT: StatutoryTerminationRight = {
  label: "Military service (federal Servicemembers Civil Relief Act)",
  cite: "50 U.S.C. § 3955",
  eligible:
    "Tenant may terminate this Lease if Tenant enters military service after signing it; or if Tenant, while in military service, signed this Lease and then receives orders for a permanent change of station (which includes separation or retirement) or to deploy with a military unit or in support of a military operation for 90 days or more; or if Tenant signed this Lease upon such orders and then receives a stop movement order of 30 days or more (or indefinite) that prevents occupancy. A spouse or dependent may terminate within one year after Tenant dies in military service or while performing covered National Guard or Reserve duty, and a Tenant who suffers a catastrophic injury or illness in such service (or the spouse or dependent, if Tenant lacks capacity) may terminate within one year after it occurs. Termination also ends the obligations of Tenant's dependents under this Lease.",
  notice:
    "Tenant delivers written notice to Landlord by hand, private business carrier, mail with return receipt requested, or electronic means. Because rent is paid monthly, termination is effective 30 days after the first date on which the next rent payment is due after the notice is delivered; termination after a stop movement order is effective when the notice and orders are delivered.",
  documentation:
    "The notice must include a copy of the military orders (official orders, including orders for separation or retirement, or a notification, certification, or verification from the commanding officer).",
  liability:
    "Rent is owed only on a prorated basis through the effective date of termination. Landlord may not impose an early termination charge, but Tenant still owes unpaid amounts due under this Lease, including reasonable charges for excess wear. Rent paid in advance for any period after termination will be refunded within 30 days after the effective date. Landlord may not hold Tenant's belongings or security deposit to satisfy a claim for rent accruing after termination.",
};
