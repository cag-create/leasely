import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Banknote, BarChart3, Bell, BookOpen, Building2, CalendarClock,
  CheckCircle2, ChevronDown, ChevronUp, FileSpreadsheet, FileText, Gavel,
  Home, Landmark, Receipt, Shield, Sparkles, Upload, UserPlus, Zap,
} from "lucide-react";
import { HOA_TIERS, HOA_TRIAL_DAYS, HOA_CARD_FEE_TEXT, HOA_ROUTES, formatUsd } from "@/lib/hoaPricing";

const BRAND = "#1F1A12";
const ACCENT = "#4F46E5";

const STEPS = [
  { icon: UserPlus, title: "Sign up", desc: `Create your board account and HOA profile. The ${HOA_TRIAL_DAYS}-day trial starts right away — no card required.` },
  { icon: Landmark, title: "Connect your bank", desc: "Link the HOA's own bank account through Stripe's secure, Stripe-hosted onboarding." },
  { icon: Upload, title: "Import homeowners", desc: "Upload your roster from CSV, Excel or Google Sheets — lot/unit, owner, email, phone and assessment." },
  { icon: CalendarClock, title: "Bill dues", desc: "Set recurring assessments (monthly, quarterly or annual) and add special assessments when you need them." },
  { icon: Banknote, title: "Get paid", desc: "Homeowners pay in their portal. Money goes straight to the HOA's bank account." },
];

const FEATURES = [
  { icon: Building2, color: "#DBEAFE", iconColor: "#2563EB", title: "Board signup & HOA profile", desc: "Your HOA's legal name, address, state and dues defaults in one place." },
  { icon: Landmark, color: "#DCFCE7", iconColor: "#16A34A", title: "Your HOA's own bank account", desc: "Stripe Connect sends every payment to the HOA's account. Keycove never holds HOA funds." },
  { icon: FileSpreadsheet, color: "#FEF3C7", iconColor: "#D97706", title: "Roster import", desc: "CSV, Excel or Google Sheets: lot/unit, owner, email, phone and assessment amount." },
  { icon: CalendarClock, color: `${ACCENT}15`, iconColor: ACCENT, title: "Recurring & special assessments", desc: "Monthly, quarterly or annual dues, plus one-off special assessments." },
  { icon: Gavel, color: "#FCE7F3", iconColor: "#DB2777", title: "Automatic late fees", desc: "Late fees apply after your grace period and are capped at the state limit. North Carolina rules are built in." },
  { icon: Bell, color: "#E0F2FE", iconColor: "#0284C7", title: "Email reminders", desc: "Homeowners get reminders before and after the due date, so the board doesn't have to chase." },
  { icon: Home, color: "#DCFCE7", iconColor: "#16A34A", title: "Homeowner portal", desc: "Pay by bank or card, autopay, payment history and receipts, documents and rules, announcements." },
  { icon: BarChart3, color: "#DBEAFE", iconColor: "#2563EB", title: "Board dashboard", desc: "Paid vs. delinquent at a glance, collections report, payouts and CSV export." },
  { icon: Receipt, color: "#FEF3C7", iconColor: "#D97706", title: "Payoff & resale statements", desc: "Prepare statements of unpaid assessments for closings, with the NC statutory fee caps built in." },
];

const FAQ_ITEMS = [
  {
    q: "What does Keycove HOA cost?",
    a: `It's a flat monthly subscription based on the number of homes: up to 50 homes ${formatUsd(39)}/mo, 51–150 homes ${formatUsd(79)}/mo, 151–500 homes ${formatUsd(149)}/mo, and 500+ homes ${formatUsd(249)}/mo. Yearly billing is 15% off. Every plan includes every feature.`,
  },
  {
    q: "Do homeowners pay a fee?",
    a: `Not for bank (ACH) payments — those are free for homeowners, with no per-payment fee. Card payments are optional: if your board allows them, the card processing cost (${HOA_CARD_FEE_TEXT}, Stripe's rate) is passed to the homeowner at cost, with no markup.`,
  },
  {
    q: "Where does the money go?",
    a: "Straight from the homeowner to your HOA's own bank account through Stripe Connect. Keycove never holds HOA funds in its own account. Bank (ACH) payments take about 4 business days to settle, and payouts to the HOA's bank arrive in about 2 business days.",
  },
  {
    q: "What happens after the 30-day trial?",
    a: "You get every feature for 30 days, and no card is needed to start. To keep collecting dues after the trial, choose the plan that matches your number of homes, monthly or yearly.",
  },
  {
    q: "Can we turn off card payments?",
    a: `Yes. Card payments are optional and the board can turn them off, so homeowners pay by bank only. If cards are on, the homeowner pays the card cost (${HOA_CARD_FEE_TEXT}) at cost — Keycove adds no markup.`,
  },
  {
    q: "How do late fees work?",
    a: "You set a grace period. After it ends, Keycove applies the late fee automatically, capped at the state limit. For North Carolina planned communities the cap is built in: the greater of $20 per month or 10% of the unpaid installment (N.C.G.S. 47F-3-102(11)). Your declaration or bylaws can set a lower amount, so check them.",
  },
  {
    q: "We're not in North Carolina. Can we use it?",
    a: "Yes. Keycove has statute data for North Carolina today. Boards in other states set their own late-fee amount and should confirm it with their governing documents and an attorney.",
  },
  {
    q: "Does Keycove file liens or chase delinquent owners?",
    a: "No. Keycove sends reminders, applies late fees and shows who is delinquent. Keycove does not file liens — the board should work with an attorney for liens and collections.",
  },
  {
    q: "Is this the same as Keycove Pro?",
    a: "No. Keycove Pro ($25/mo) is for landlords. Keycove HOA is a separate subscription for HOA boards that collect dues from homeowners.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-900 text-sm leading-relaxed">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>
      {open && <p className="text-sm text-gray-600 leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

export default function HoaBoardsLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 text-center" style={{ background: `linear-gradient(160deg, ${BRAND} 0%, #3A2410 100%)` }}>
        <Badge className="mb-4 font-bold text-xs px-3 py-1 border-0" style={{ background: `${ACCENT}30`, color: "#C7D2FE" }}>
          <Landmark className="h-3 w-3 mr-1" /> Keycove HOA
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 max-w-3xl mx-auto">
          HOA dues, collected. Free bank payments for every homeowner.
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
          Built for self-managed HOA boards. Bill assessments, send reminders and apply late fees automatically — and every payment goes straight to your HOA&apos;s own bank account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href={HOA_ROUTES.board}>
            <Button size="lg" className="font-bold px-8 gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white">
              Start 30-day free trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={HOA_ROUTES.portal}>
            <Button size="lg" variant="outline" className="font-bold px-8 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              I&apos;m a homeowner — sign in
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" /> No card to start</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" /> $0 ACH fees for homeowners</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" /> From {formatUsd(39)}/mo, every feature</span>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">How it works</h2>
          <p className="text-gray-500 text-center text-sm mb-10">From signup to your first dues payment in five steps.</p>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: ACCENT }}>
                    {i + 1}
                  </div>
                  <s.icon className="h-4 w-4" style={{ color: ACCENT }} />
                </div>
                <div className="font-bold text-gray-900 mb-1">{s.title}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">Everything a self-managed board needs</h2>
          <p className="text-gray-500 text-center text-sm mb-10">Included on every plan.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, iconColor, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: color }}>
                  <Icon className="h-5 w-5" style={{ color: iconColor }} />
                </div>
                <div className="font-bold text-gray-900 mb-2">{title}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Money flow */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-100 p-6 shadow-sm">
            <Shield className="h-6 w-6 mb-3 text-emerald-600" />
            <div className="font-bold text-gray-900 mb-2">Your money stays your HOA&apos;s</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Payments go from the homeowner straight to your HOA&apos;s own bank account through Stripe Connect. Keycove never holds HOA funds in its own account.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6 shadow-sm">
            <Banknote className="h-6 w-6 mb-3" style={{ color: ACCENT }} />
            <div className="font-bold text-gray-900 mb-2">Free for homeowners who pay by bank</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              ACH payments carry no per-payment fee. Card payments are optional; the card cost ({HOA_CARD_FEE_TEXT}, Stripe&apos;s rate) is passed to the homeowner at cost with no markup, and the board can turn cards off.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">Simple pricing by number of homes</h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Every plan includes every feature. {HOA_TRIAL_DAYS}-day free trial, no card required. Save 15% with yearly billing.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOA_TIERS.map(t => (
              <div key={t.id} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm text-center">
                <div className="text-sm font-bold text-gray-900 mb-2">{t.name}</div>
                <div className="text-3xl font-black text-gray-900">{formatUsd(t.monthly)}<span className="text-sm font-normal text-gray-400">/mo</span></div>
                <div className="text-xs text-gray-500 mt-1">or {formatUsd(t.yearly)}/yr (about {formatUsd(t.yearlyPerMonth)}/mo)</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing#hoa">
              <Button variant="outline" className="font-bold gap-2">
                See full pricing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/compare#hoa">
              <Button variant="ghost" className="font-bold">
                Compare with PayHOA
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NC built in */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-3xl border-2 p-8 md:p-10" style={{ borderColor: `${ACCENT}30`, background: `${ACCENT}06` }}>
          <div className="flex items-center gap-2 mb-3">
            <Gavel className="h-5 w-5" style={{ color: ACCENT }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>North Carolina built in</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Built in North Carolina, with NC HOA rules built in</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><b>Late fees capped automatically</b> at the greater of $20 per month or 10% of the unpaid installment (N.C.G.S. 47F-3-102(11)).</span>
            </li>
            <li className="flex gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><b>Payoff and resale statement fees</b> held to the NC statutory caps: $200 per statement, plus up to $100 to expedite when the request comes within 48 hours of closing (N.C.G.S. 47F-3-102(13a)).</span>
            </li>
            <li className="flex gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><b>A plain-English board guide</b> covering NC lien notice rules and the hearing required before fines — so you know when to call your attorney.</span>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-5">
            Keycove has statute data for North Carolina today. Boards in other states set their own late-fee amount and should confirm it with their governing documents and an attorney. This isn&apos;t legal advice.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-center text-sm mb-10">What HOA boards ask us most.</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {FAQ_ITEMS.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            <BookOpen className="inline h-4 w-4 mr-1 -mt-0.5" />
            Want the step-by-step? Read the <Link href={HOA_ROUTES.guide} className="font-semibold underline" style={{ color: ACCENT }}>HOA board guide</Link>.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center" style={{ background: `linear-gradient(135deg, ${BRAND}, #3A2410)` }}>
        <div className="max-w-2xl mx-auto">
          <Badge className="mb-4 font-bold text-xs px-3 py-1 border-0" style={{ background: `${ACCENT}30`, color: "#C7D2FE" }}>
            <Zap className="h-3 w-3 mr-1" /> {HOA_TRIAL_DAYS} days free
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to collect dues the easy way?</h2>
          <p className="text-white/70 mb-8 text-lg">
            Set up your HOA, connect the bank and import your homeowners during the free trial. No card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={HOA_ROUTES.board}>
              <Button size="lg" className="font-bold px-8 gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                <Sparkles className="h-5 w-5" /> Start 30-day free trial
              </Button>
            </Link>
            <Link href={HOA_ROUTES.guide}>
              <Button size="lg" variant="outline" className="font-bold px-8 gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <FileText className="h-5 w-5" /> Read the board guide
              </Button>
            </Link>
          </div>
          <p className="text-white/40 text-sm mt-6">
            From {formatUsd(39)}/mo · Every feature on every plan · $0 ACH fees for homeowners
          </p>
        </div>
      </section>

      {/* Footer note */}
      <div className="py-8 px-4 text-center bg-background border-t border-border">
        <p className="text-muted-foreground text-sm">
          Questions? Email us at <a href="mailto:support@keycove.net" className="text-muted-foreground hover:underline font-medium">support@keycove.net</a>
          {" · "}
          <Link href={HOA_ROUTES.portal} className="text-muted-foreground hover:underline font-medium">Homeowner sign-in</Link>
          {" · "}
          <Link href="/support" className="text-muted-foreground hover:underline font-medium">Support Center</Link>
          {" · "}
          <Link href="/pricing#hoa" className="text-[#4F46E5] hover:underline font-medium">Pricing</Link>
        </p>
        <p className="text-muted-foreground/70 text-xs mt-2">Keycove is a DBA of Leasely LLC, based in North Carolina.</p>
      </div>
    </div>
  );
}
