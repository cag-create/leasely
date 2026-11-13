import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight } from "lucide-react";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

/** In-app guide for brokers managing rentals for other owners. Source: docs/sops/property-manager.md. */
const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "flow",
    title: "How the money moves",
    body: (
      <ol className="list-decimal pl-5 space-y-1.5">
        <li>The tenant pays rent through Keycove. Paying by bank transfer (ACH) is free for the tenant.</li>
        <li>For a property under a management agreement, the money goes to <strong>your</strong> Stripe account, not the owner's.</li>
        <li>Stripe pays out to <strong>your trust bank account</strong>. Stripe's processing fee (ACH 0.8%, max $5; card 2.9% + 30¢) comes out of that payout and is booked on the owner's ledger.</li>
        <li>Keycove posts the receipt to the trust journal and the owner's ledger for that property. Security deposits go to their own ledger.</li>
        <li>Your management fee (and leasing fee on a new lease) accrues, capped at what the owner actually holds.</li>
        <li>You pay bills and the owner out of trust, reconcile monthly, and email the owner a statement.</li>
      </ol>
    ),
  },
  {
    id: "setup",
    title: "One-time setup",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Bank:</strong> a demand deposit account at a federally insured bank doing business in NC, titled "… Trust Account" or "… Escrow Account" (G.S. 93A-6(g), 21 NCAC 58A .0117(b)).</li>
        <li><strong>Stripe:</strong> connect on <Link href="/payouts"><span className="underline cursor-pointer">Payouts</span></Link>, then in the Stripe dashboard set the payout bank to the trust account and choose <strong>daily</strong> payouts, so online rent reaches the bank within 3 banking days (.0116(a)).</li>
        <li><strong>Trust account in Keycove:</strong> Trust Accounting → Setup. Include the bank's branch address (tenants must be told it) and mark it as the account your Stripe payouts go to. Interest-bearing accounts need written authorization saying who gets the interest. Each owners' association needs its own account.</li>
        <li><strong>Owners and properties:</strong> add each owner (W-9 on file; keep only the last 4 of the TIN in Keycove). Add one management agreement per property: fee (% or flat, optional monthly minimum), leasing and renewal fees, a repair reserve, owner-approval rules and who holds security deposits.</li>
        <li><strong>Moving from another system?</strong> Use "Opening balance" on each agreement for what's already in the bank.</li>
        <li><strong>Owner portal:</strong> invite each owner (envelope icon). They sign in free and see balances, statements, documents and approval requests.</li>
        <li><strong>Staff:</strong> Setup → Staff access. Add agents or assistants by email and choose what each can do.</li>
      </ul>
    ),
  },
  {
    id: "daily",
    title: "Day to day",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Online rent</strong> posts automatically.</li>
        <li><strong>Checks and cash:</strong> Receipts & payouts → Record a receipt, with both the date received and the date deposited. Keycove flags anything deposited later than 3 banking days after receipt (weekends and bank holidays are skipped).</li>
        <li><strong>Bills:</strong> Pay a bill from owner funds. Anything over the owner's limit goes to the owner for approval first. Anything larger than the owner's balance is blocked (.0116(f)), so ask the owner to send funds.</li>
        <li><strong>New security deposit:</strong> email the tenant where it's held within 30 days of the lease start (G.S. 42-50).</li>
      </ul>
    ),
  },
  {
    id: "monthly",
    title: "Monthly close",
    body: (
      <ol className="list-decimal pl-5 space-y-1.5">
        <li><strong>Transfer earned fees</strong> to your operating account in one itemized transfer. Don't leave earned money in trust.</li>
        <li><strong>Pay owners.</strong> Available = balance − fees not yet transferred − reserve. Send the ACH or trust check, then record it with its reference number.</li>
        <li><strong>Reconcile:</strong> open the month, enter the statement's ending balance and import the bank CSV. Keycove matches checks, Stripe payouts and other items. Record bank service charges from company funds (max $100). When the trial balance, journal and adjusted bank balance agree, <strong>Finalize</strong>. The worksheet is kept (.0117(e)).</li>
        <li><strong>Email statements.</strong> Each owner gets a PDF, also in their portal. Associations must get one at least every 90 days (.0118).</li>
      </ol>
    ),
  },
  {
    id: "moveout",
    title: "Move-out and deposits",
    body: <p>Set the move-out date on the deposit. Within 30 days, close it out: list deductions allowed by G.S. 42-51 (never normal wear and tear) and refund the rest. Keycove emails the tenant the itemized accounting and moves the deductions to the owner's ledger. If damages aren't known by day 30, send an interim accounting then and the final one by day 60 (G.S. 42-52).</p>,
  },
  {
    id: "yearend",
    title: "Year end and records",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>1099-MISC:</strong> Statements & 1099 → choose the year → CSV of gross rents per owner (box 1). For payments made in 2026 the IRS threshold is $2,000 per owner. File using each owner's full TIN from their W-9.</li>
        <li><strong>Corrections:</strong> entries are never edited or deleted. Reverse them with a reason.</li>
        <li><strong>Retention:</strong> keep records at least 3 years after the funds are disbursed or the transaction ends (.0108). If an owner asks in writing, give them copies of their records within 10 days.</li>
        <li><strong>Ending an agreement:</strong> first pay out the owner, transfer tenant deposits to the owner or the next agent (G.S. 42-54), then end the agreement. Rent goes back to the owner's own account.</li>
      </ul>
    ),
  },
];

export default function PropertyManagerGuide() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: BRAND }}><ShieldCheck className="h-6 w-6" /> Property-Manager Guide</h1>
          <p className="text-sm text-gray-500 mt-1">For brokers who manage rentals for other owners. Keycove applies the NC Real Estate Commission trust rules (21 NCAC 58A .0116–.0118, .0108) and the Tenant Security Deposit Act. It keeps the records; your broker-in-charge stays responsible for the trust account. This isn't legal advice.</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`} className="rounded-full border px-3 py-1 text-xs text-gray-600 hover:border-indigo-400">{s.title}</a>)}
        </nav>
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="rounded-2xl border bg-white p-5 text-sm text-gray-700 space-y-2">
            <h2 className="text-base font-bold text-gray-900">{s.title}</h2>
            {s.body}
          </section>
        ))}
        <div className="flex gap-3">
          <Link href="/trust"><Button className="gap-2 text-white" style={{ background: ACCENT }}>Open Trust Accounting <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link href="/pricing"><Button variant="outline">Plans</Button></Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
