# Property-manager SOP: trust accounting on Keycove

For brokers who manage rentals for other owners. In-app version: `/property-manager-guide`. The work happens in `/trust`.

Keycove applies the North Carolina Real Estate Commission trust rules (21 NCAC 58A .0116–.0118, .0108), G.S. 93A-6 and the Tenant Security Deposit Act (G.S. 42-50 to 42-56). Other states fall back to the NC rules and are flagged as unverified. Keycove is a record-keeping tool, not legal advice. Your broker-in-charge stays responsible for the trust account.

## How the money moves

1. The tenant pays rent through Keycove (ACH is free for the tenant).
2. For any property under a management agreement, the money goes to **your** Stripe account, not the owner's.
3. Stripe pays out to **your trust bank account**. Stripe's processing fee (ACH 0.8%, max $5; card 2.9% + 30¢) comes out of that payout. Keycove books it on the owner's ledger as "Stripe processing fee".
4. Keycove posts the receipt to the trust journal and to that owner's ledger for the property. Any security deposit goes to its own deposit ledger.
5. Your management fee (and the leasing fee on a new lease's first month) accrues. It is capped at what the owner actually holds.
6. You pay bills and the owner out of trust. Once a month you reconcile and send the owner a statement.

Self-managing landlords aren't affected: their tenants keep paying them directly.

## One-time setup

- **Bank:** open (or use) a demand deposit account at a federally insured bank doing business in NC. Title it "… Trust Account" or "… Escrow Account". Statements, deposit tickets and checks must carry those words.
- **Stripe:** on `/payouts`, connect Stripe. In the Stripe Express dashboard, set the payout bank to the trust account and the schedule to **daily**, so online rent reaches the bank within 3 banking days.
- **`/trust` → Setup:** add the trust account, including the bank's branch address (tenants must be told it). Tick "My Stripe payouts go to this account".
  - Interest-bearing accounts need written authorization from everyone with an interest in the money, saying who gets the interest.
  - Each owners' association you manage needs its own account (kind: HOA).
- **Owners & properties:** add each owner (W-9 on file, TIN last 4 only). Add one management agreement per property, setting:
  - management fee: % of rent collected (optional monthly minimum) or a flat fee
  - leasing and renewal fees
  - the reserve to keep for repairs
  - owner approval rules (expenses over a limit, and/or distributions)
  - who holds security deposits
- **Opening balances:** moving from another system? Use "Opening balance" on each agreement for owner funds and deposits already in the bank on your start date.
- **Owner portal:** click the envelope next to an owner to invite them. They sign in free and see balances, statements, documents and approvals.
- **Staff:** under Setup → Staff access, add agents or assistants by email, then toggle view, record receipts, disburse, reconcile, and owners/setup.

## Daily / as it happens

- **Online rent:** nothing to do. It posts automatically, with a notification.
- **Checks and cash:** Receipts & payouts → "Record a receipt". Enter the date received **and** the date deposited. Keycove flags anything deposited later than 3 banking days after receipt (weekends and Federal Reserve holidays are skipped).
- **Bills:** "Pay a bill from owner funds". Bills over the owner's limit go to the owner for approval in their portal; you pay once they're approved. Bills larger than the owner's spendable balance are blocked: ask the owner to send funds ("Record owner funds").
- **New deposit:** within 30 days of the lease start, use Security deposits → "Email notice" to tell the tenant which bank holds it (G.S. 42-50).

## Monthly close (by the disbursement day in each agreement)

1. **Transfer earned fees:** Receipts & payouts → "Transfer … to operating". This is one itemized disbursement per owner and property. Don't leave earned money in trust.
2. **Pay owners:** "Pay owners" shows what's available for each owner (balance − fees not yet transferred − reserve). Send the ACH or trust check from your bank, then record it with the reference number. Keycove blocks overpayment.
3. **Reconcile:** Reconcile tab → pick the trust account and month → "Open".
   - Enter the statement's ending balance and import the bank CSV.
   - Keycove matches checks by number, Stripe payouts as one deposit ("Sync Stripe payouts" links them), and everything else by amount and date.
   - Bank service charges: "Bank charge" (paid from company funds, which are capped at $100).
   - When trial balance = journal = adjusted bank balance, click **Finalize**. The worksheet is saved and locked.
4. **Statements:** Statements & 1099 → "Email all for {month}". Each owner gets a PDF and it appears in their portal. Associations must get one at least every 90 days.

## Move-out

Security deposits → set the move-out date. Within 30 days, use "Move-out":
- list deductions allowed by G.S. 42-51 (no normal wear and tear)
- refund the rest
- Keycove emails the itemized accounting

Deductions go to the owner's ledger. If damages aren't known yet, send an interim accounting by day 30 and the final one by day 60.

## Year end

Statements & 1099 → choose the year → CSV. Box 1 is the gross rents you collected for each owner, before fees. The IRS threshold for 2026 payments is $2,000 per owner. File using each owner's full TIN from their W-9.

## Corrections and records

- Entries are never edited or deleted. Use Journal → "Reverse" with a reason; the original stays on record.
- Keep records at least 3 years after the funds are disbursed or the transaction ends (.0108).
- Give an owner copies of their records within 10 days of a written request (.0117(g)). Journal and statements export to CSV and PDF.

## Ending a management agreement

Pay out the owner's balance and any accrued fees first. Then transfer tenant deposits to the owner or the next agent, and notify the tenant (G.S. 42-54). Only then "End" the agreement. Rent then goes back to the owner's own account.

## Plan

Trust accounting is on Pro today. It sits behind the `TRUST_ACCOUNTING_PLAN` flag (`pro` | `premium` | `off`). If a Premium tier is added, the flag moves it without code changes.
