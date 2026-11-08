# Keycove HOA — Board SOP

How a self-managed HOA board sets up Keycove HOA and runs dues collection.
The in-app version of this guide is at `/hoa-board-guide`
(`client/src/pages/HoaBoardGuide.tsx`). Keep the two in sync.

- Board dashboard: `/hoa-board` (signed-out users are sent to sign in)
- Homeowner portal: `/hoa-portal`
- Product page: `/hoa-boards`
- Pricing: `/pricing#hoa`

Follow steps 1–5 once to get set up. Steps 6–11 cover running billing,
statements, delinquencies and month-end close.

---

## Before you start

Gather these first:

- Authority from your board to set up online dues collection for the HOA.
- The HOA's legal name, mailing address and EIN (the HOA's federal tax ID).
- An officer's details for Stripe's identity check (the person who will be
  the account representative).
- The HOA's bank account (the account dues should land in).
- Your homeowner roster as a spreadsheet (CSV, Excel or Google Sheets).
- Your declaration and bylaws, for the dues amount, due dates, late-fee
  rules and grace period.

## 1. Create your account and start the trial

Every feature is on for 30 days. No card is required to start.

1. **Open the board dashboard.** Go to keycove.net/hoa-board. If you're
   signed out, you'll be sent to sign in or create an account first.
2. **Create your board account.** Use an email address the board will keep,
   ideally a shared HOA address (for example treasurer@yourhoa.org) rather
   than a personal one.
3. **Start the free trial.** The 30-day trial starts when you create the HOA.

Tip: use the trial to finish setup (profile, bank, roster and invites) so
you're ready to bill on day one of your paid plan.

## 2. Set up the HOA profile

These details appear on homeowner bills, receipts and statements, and drive
the default billing schedule.

1. **Legal name:** exactly as it appears on the articles of incorporation.
2. **State:** the state the community is in. The state decides which
   late-fee and statement-fee limits apply (North Carolina rules are built in).
3. **Address:** the HOA's mailing address.
4. **Dues amount:** the regular assessment per home. Homes with a different
   amount can be set individually when you import the roster.
5. **Frequency:** monthly, quarterly or annual.
6. **Due day:** the day of the period dues are due (for example, the 1st).
7. **Grace days:** how many days after the due date before a late fee
   applies. Use the grace period in your governing documents.

## 3. Connect the HOA bank account

Homeowner payments go straight to the HOA's own bank account through Stripe
Connect. Keycove never holds HOA funds in its own account.

1. **Start bank setup.** From the board dashboard, choose to connect your
   bank. You'll go to Stripe's secure, Stripe-hosted onboarding (a Stripe
   Express account).
2. **Business details.** Enter the HOA's legal name, address and EIN.
3. **Officer details.** Stripe asks for an officer's personal details to
   verify identity. This goes to Stripe, not to Keycove.
4. **Bank account.** Add the HOA's bank account. Use the association's
   account, never a board member's personal account.
5. **Return to Keycove.** When Stripe finishes, you're sent back to the board
   dashboard. If Stripe needs more information, the dashboard will tell you.

Timing:

- A homeowner's bank (ACH) payment takes about **4 business days** to settle.
- Payouts from Stripe to the HOA's bank account arrive in about
  **2 business days**.

## 4. Import homeowners

1. **Download the template** on the import screen, or use your own
   spreadsheet with similar columns.
2. **Fill in one row per home** with these columns:
   `lot`, `unit`, `address`, `owner name`, `email`, `phone`,
   `assessment amount`.
3. **Upload** the CSV or Excel file, or paste a Google Sheets link.
4. **Check the preview** and fix any rows the import flags (for example a
   missing address or a badly formatted email) before you finish.

Note: a homeowner without an email address won't get a portal invite or
email reminders. Add the email later and send the invite then.

## 5. Send portal invites

1. **Send invites.** From the board dashboard, send portal invites to your
   imported homeowners. Each one gets an email with a link to sign in.
2. **Tell homeowners what to expect.** A short board announcement helps:
   dues can now be paid online at keycove.net/hoa-portal, bank (ACH)
   payments are free, and autopay is available.
3. **Follow up.** Re-send invites to anyone who hasn't signed in, and fix
   bounced email addresses.

What homeowners see in the portal:

- Pay by bank (ACH, free) or card (if the board allows it)
- Autopay
- Payment history and receipts
- HOA documents and rules
- Board announcements

## 6. Billing: assessments, late fees and reminders

Once the schedule is set, Keycove bills, reminds and applies late fees
automatically.

**Recurring assessments**

- Charges follow the frequency, due day and amount in your HOA profile (or
  the home's own amount from the roster).
- Each charge is created **about 15 days before its due date**, so
  homeowners can pay early.

**Special assessments**

- Add a one-off special assessment (for example a roof or road project) with
  its own amount and due date.
- Make sure the special assessment was properly approved under your
  governing documents before you bill it.

**Late fees**

- A late fee is applied automatically when a charge is still unpaid after
  the grace period.
- The fee is capped at the state limit. In North Carolina that's the
  **greater of $20 per month or 10% of the unpaid installment**
  (N.C.G.S. 47F-3-102(11)).
- Example: on a $150 quarterly installment, 10% is $15, so the most you can
  charge is $20 a month. On a $600 annual installment, the cap is $60.
- Your declaration or bylaws can set a lower late fee or limit it. Use the
  lower amount if they do.
- Outside North Carolina, set your own late-fee amount and confirm it with
  your governing documents and an attorney.

**Email reminders (sent automatically)**

- 7 days before the due date
- On the due date
- When overdue

**Card payments**

Card payments are optional. If they're on, the homeowner pays the card cost
(2.9% + 30¢, Stripe's rate) at cost, with no markup. The board can turn card
payments off so homeowners pay by bank only.

## 7. Record check and cash payments

1. **Deposit the payment** into the HOA's bank account as usual.
2. **Record it in Keycove** against the homeowner's charge (date, amount,
   method and check number) so the balance, reminders and late fees stay
   correct.
3. **Record promptly**, before the grace period ends, so the homeowner isn't
   charged a late fee by mistake.

## 8. Payoff and resale statements

When a home is sold, the closing attorney asks the HOA for a statement of
unpaid assessments.

1. **Open the homeowner's account** for the lot or unit being sold.
2. **Create the statement.** Keycove prepares a statement of the homeowner's
   unpaid assessments and charges.
3. **Review and send** it to the requester.

North Carolina statutory caps (N.C.G.S. 47F-3-102(13a)):

- Fee of up to **$200** per statement or request.
- Plus an expedite fee of up to **$100**, only when the request is made
  within 48 hours of closing.
- The statement must be furnished within **10 business days** after the
  request is received.

## 9. Delinquencies, liens and fines (North Carolina)

**Keycove does NOT file liens.** Use an attorney for liens, collections and
foreclosure. Keycove's collections report and CSV export give your attorney
the homeowner's charges and payment history.

**Liens for unpaid assessments (N.C.G.S. 47F-3-116)**

- An assessment must be unpaid for **30 days or more** before a lien can be
  filed.
- At least **15 days before filing**, the HOA must mail the owner a
  statement of the amount due by **first-class mail**: to the lot's address,
  the owner's address on file with the HOA, and the address on the county
  tax records if different. If the owner is a corporation or LLC, it also
  goes to the registered agent.
- The claim of lien is filed with the **clerk of superior court** in the
  county where the lot is. The statute sets what it must contain and how the
  owner must be served.
- The HOA can't charge the owner attorneys' fees until it has mailed a
  written notice giving the owner 15 days to pay the balance without them.
- A lien ends unless enforcement starts within 3 years of filing.
  Foreclosure has further requirements (for example, 90+ days unpaid and a
  board vote for nonjudicial foreclosure).
- **Use an attorney** for every step of this process.

**Fines and suspensions for violations (N.C.G.S. 47F-3-107.1)**

- Before fining an owner or suspending privileges or services, the owner
  must get notice of the charge, a hearing (a chance to be heard and present
  evidence) and notice of the decision, unless your declaration sets its own
  procedure.
- The hearing is before the board or a panel the board appoints (panel
  members can't be officers or board members).
- A fine can be up to $100 per violation, and up to $100 a day, without
  another hearing, for each day the violation continues more than 5 days
  after the decision.
- The owner can appeal a panel's decision to the full board within 15 days.
- Suspending privileges for unpaid amounts (30+ days) also needs notice and
  an opportunity to be heard, and access to the owner's lot can never be
  suspended (47F-3-102(11)).
- Late charges on unpaid assessments (step 6) are separate from violation
  fines.

These summaries follow the North Carolina Planned Community Act
(Chapter 47F). Condominium associations are governed by the North Carolina
Condominium Act (Chapter 47C), and your declaration may change some of these
rules. **This is not legal advice.** Confirm with your governing documents
and an attorney licensed in your state.

## 10. Month-end close

1. **Record offline payments.** Make sure every check and cash payment for
   the month is recorded (step 7).
2. **Review the collections report.** On the board dashboard, check paid vs.
   delinquent homes and follow up on overdue accounts.
3. **Export to CSV** for your treasurer's report, bookkeeper or accountant.
4. **Match payouts to the bank.** Compare the payouts list in the dashboard
   with deposits on the HOA's bank statement.

## 11. Plan limits and upgrades

Your plan follows your number of homes. Every plan includes every feature.

| Homes      | Monthly | Yearly (15% off)          |
|------------|---------|---------------------------|
| Up to 50   | $39/mo  | $397.80/yr (about $33.15/mo)   |
| 51–150     | $79/mo  | $805.80/yr (about $67.15/mo)   |
| 151–500    | $149/mo | $1,519.80/yr (about $126.65/mo) |
| 500+       | $249/mo | $2,539.80/yr (about $211.65/mo) |

- 30-day free trial, no card required to start.
- If you add homes past your plan's limit, Keycove prompts you to upgrade to
  the next plan.

## FAQ for homeowners

Share these answers with your community.

- **How do I sign in?** Use the link in your invite email, or go to
  keycove.net/hoa-portal.
- **Is there a fee to pay my dues?** Paying by bank (ACH) is free, with no
  per-payment fee. If your board allows card payments, the card processing
  cost (2.9% + 30¢) is added at cost, with no markup.
- **Can I set up autopay?** Yes. Turn on autopay in the portal and your dues
  are paid automatically each period.
- **Where are my receipts?** Your payment history and receipts are in the
  portal.
- **How long does a bank payment take?** Bank (ACH) payments take about 4
  business days to settle. Pay a few days before the due date to be safe.
- **Who gets my money?** Your payment goes straight to your HOA's bank
  account through Stripe. Keycove never holds HOA funds.
- **Who sets the dues and late fees?** Your HOA board. Questions about your
  balance, dues or rules go to your board.
- **Where are the HOA documents and rules?** In the portal, along with board
  announcements.

---

**Not legal advice.** This guide explains how to use Keycove HOA and
summarizes some North Carolina statutes in plain English. It is not legal
advice and doesn't cover every rule or exception. Your declaration, bylaws
and other governing documents may set different requirements. Talk to an
attorney licensed in your state before filing a lien, fining an owner or
changing your late-fee policy.

Statute sources (read 2026-11-08):
- N.C.G.S. 47F-3-102 — https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_47F/GS_47F-3-102.html
- N.C.G.S. 47F-3-107.1 — https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_47F/GS_47F-3-107.1.html
- N.C.G.S. 47F-3-115 — https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_47F/GS_47F-3-115.html
- N.C.G.S. 47F-3-116 — https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_47F/GS_47F-3-116.html
