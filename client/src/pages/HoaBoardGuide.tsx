import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, ArrowRight, BadgeCheck, Banknote, BarChart3, BookOpen,
  Building2, CalendarClock, ChevronRight, ClipboardList, FileSpreadsheet,
  Gavel, HelpCircle, Landmark, Mail, Receipt, Rocket, Scale, Search, TrendingUp,
} from "lucide-react";
import { HOA_TIERS, HOA_TRIAL_DAYS, HOA_CARD_FEE_TEXT, HOA_ROUTES, formatUsd } from "@/lib/hoaPricing";

const ACCENT = "#4F46E5";

/**
 * Keycove HOA board guide (public, /hoa-board-guide). The same content lives
 * in docs/HOA_BOARD_SOP.md — keep the two in sync.
 */

type Section = {
  id: string;
  title: string;
  icon: any;
  intro?: string;
  /** extra words for the search box */
  keywords?: string;
  body: React.ReactNode;
};

function Steps({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <ol className="space-y-2">
      {items.map(([t, d], i) => (
        <li key={t} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-white">
          <div className="h-6 w-6 rounded-md flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ background: ACCENT }}>
            {i + 1}
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            <b className="text-gray-900">{t}</b> — {d}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-gray-600 leading-relaxed">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2"><span style={{ color: ACCENT }}>•</span><span>{it}</span></li>
      ))}
    </ul>
  );
}

function Note({ tone = "info", children }: { tone?: "info" | "warn"; children: React.ReactNode }) {
  const warn = tone === "warn";
  return (
    <div className={`flex gap-2.5 p-3 rounded-xl border text-sm leading-relaxed ${warn ? "border-amber-200 bg-amber-50 text-amber-900" : "border-indigo-100 bg-indigo-50/60 text-gray-700"}`}>
      {warn ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" /> : <BadgeCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />}
      <div>{children}</div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="text-[12px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{children}</code>;
}

const SUB = "text-xs font-bold uppercase tracking-wider text-gray-400 mb-2";

export default function HoaBoardGuide() {
  const [active, setActive] = useState("before");
  const [search, setSearch] = useState("");

  const sections = useMemo<Section[]>(() => [
    {
      id: "before",
      title: "Before you start",
      icon: ClipboardList,
      intro: "Gather these first. Setup then takes well under an hour.",
      keywords: "checklist ein officer bank roster spreadsheet governing documents",
      body: (
        <Bullets items={[
          <>Authority from your board to set up online dues collection for the HOA.</>,
          <>The HOA&apos;s <b>legal name</b>, mailing address and <b>EIN</b> (the HOA&apos;s federal tax ID).</>,
          <>An <b>officer&apos;s details</b> for Stripe&apos;s identity check (the person who will be the account representative).</>,
          <>The HOA&apos;s <b>bank account</b> — the account dues should land in.</>,
          <>Your <b>homeowner roster</b> as a spreadsheet (CSV, Excel or Google Sheets).</>,
          <>Your <b>declaration and bylaws</b> — for the dues amount, due dates, late-fee rules and grace period.</>,
        ]} />
      ),
    },
    {
      id: "account",
      title: "1. Create your account and start the trial",
      icon: Rocket,
      intro: `Every feature is on for ${HOA_TRIAL_DAYS} days. No card required to start.`,
      keywords: "sign up signup trial login",
      body: (
        <div className="space-y-3">
          <Steps items={[
            ["Open the board dashboard", <>Go to <Link href={HOA_ROUTES.board} className="underline">keycove.net{HOA_ROUTES.board}</Link>. If you&apos;re signed out, you&apos;ll be sent to sign in or create an account first.</>],
            ["Create your board account", <>Use an email address the board will keep — ideally a shared HOA address (for example treasurer@yourhoa.org) rather than a personal one.</>],
            ["Start the free trial", <>Your {HOA_TRIAL_DAYS}-day trial starts when you create the HOA. No card is needed to start.</>],
          ]} />
          <Note>Use the trial to finish setup — profile, bank, roster and invites — so you&apos;re ready to bill on day one of your paid plan.</Note>
        </div>
      ),
    },
    {
      id: "profile",
      title: "2. Set up the HOA profile",
      icon: Building2,
      intro: "These details appear on homeowner bills, receipts and statements, and drive the default billing schedule.",
      keywords: "legal name state address dues amount frequency due day grace days defaults",
      body: (
        <div className="space-y-3">
          <Steps items={[
            ["Legal name", <>Enter the HOA&apos;s legal name exactly as it appears on its articles of incorporation.</>],
            ["State", <>Pick the state the community is in. The state decides which late-fee and statement-fee limits apply (North Carolina rules are built in).</>],
            ["Address", <>The HOA&apos;s mailing address.</>],
            ["Dues amount", <>The regular assessment per home. Homes with a different amount can be set individually when you import the roster.</>],
            ["Frequency", <>Monthly, quarterly or annual.</>],
            ["Due day", <>The day of the period dues are due (for example, the 1st).</>],
            ["Grace days", <>How many days after the due date before a late fee applies. Use the grace period in your governing documents.</>],
          ]} />
        </div>
      ),
    },
    {
      id: "bank",
      title: "3. Connect the HOA bank account",
      icon: Landmark,
      intro: "Homeowner payments go straight to the HOA's own bank account through Stripe Connect. Keycove never holds HOA funds.",
      keywords: "stripe express connect ein officer payouts ach settle business days",
      body: (
        <div className="space-y-3">
          <Steps items={[
            ["Start bank setup", <>From the board dashboard, choose to connect your bank. You&apos;ll be taken to Stripe&apos;s secure, Stripe-hosted onboarding (a Stripe Express account).</>],
            ["Business details", <>Enter the HOA&apos;s legal name, address and <b>EIN</b>.</>],
            ["Officer details", <>Stripe asks for an officer&apos;s personal details to verify identity. This goes to Stripe, not to Keycove.</>],
            ["Bank account", <>Add the HOA&apos;s bank account. Use the association&apos;s account — never a board member&apos;s personal account.</>],
            ["Return to Keycove", <>When Stripe finishes, you&apos;re sent back to the board dashboard. If Stripe needs more information, the dashboard will tell you.</>],
          ]} />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-gray-100 bg-white">
              <div className="text-sm font-bold text-gray-900">ACH settles in about 4 business days</div>
              <div className="text-xs text-gray-500 mt-1">A homeowner&apos;s bank payment takes about 4 business days to settle.</div>
            </div>
            <div className="p-3 rounded-xl border border-gray-100 bg-white">
              <div className="text-sm font-bold text-gray-900">Payouts arrive in about 2 business days</div>
              <div className="text-xs text-gray-500 mt-1">Payouts from Stripe to the HOA&apos;s bank account arrive in about 2 business days.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "import",
      title: "4. Import homeowners",
      icon: FileSpreadsheet,
      intro: "Upload your roster from CSV, Excel or Google Sheets.",
      keywords: "roster csv excel google sheets template columns lot unit address owner email phone assessment",
      body: (
        <div className="space-y-3">
          <Steps items={[
            ["Download the template", <>Start from the template on the import screen, or use your own spreadsheet with similar columns.</>],
            ["Fill in one row per home", <>Use these columns: <Code>lot</Code> <Code>unit</Code> <Code>address</Code> <Code>owner name</Code> <Code>email</Code> <Code>phone</Code> <Code>assessment amount</Code>.</>],
            ["Upload", <>Upload the CSV or Excel file, or paste a Google Sheets link.</>],
            ["Check the preview", <>Fix any rows the import flags (for example a missing address or a badly formatted email) before you finish.</>],
          ]} />
          <Note>A homeowner without an email address won&apos;t get a portal invite or email reminders. Add the email later and send the invite then.</Note>
        </div>
      ),
    },
    {
      id: "invites",
      title: "5. Send portal invites",
      icon: Mail,
      intro: "Homeowners pay, set up autopay and download receipts in their own portal.",
      keywords: "invite homeowner portal sign in autopay",
      body: (
        <div className="space-y-3">
          <Steps items={[
            ["Send invites", <>From the board dashboard, send portal invites to your imported homeowners. Each one gets an email with a link to sign in.</>],
            ["Tell homeowners what to expect", <>A short board announcement helps: dues can now be paid online at <b>keycove.net{HOA_ROUTES.portal}</b>, bank (ACH) payments are free, and autopay is available.</>],
            ["Follow up", <>Re-send invites to anyone who hasn&apos;t signed in, and fix bounced email addresses.</>],
          ]} />
          <div>
            <div className={SUB}>What homeowners see in the portal</div>
            <Bullets items={[
              "Pay by bank (ACH, free) or card (if the board allows it)",
              "Autopay",
              "Payment history and receipts",
              "HOA documents and rules",
              "Board announcements",
            ]} />
          </div>
        </div>
      ),
    },
    {
      id: "billing",
      title: "6. Billing: assessments, late fees and reminders",
      icon: CalendarClock,
      intro: "Once the schedule is set, Keycove bills, reminds and applies late fees automatically.",
      keywords: "recurring special assessment late fee grace period reminders due date overdue 47F-3-102 cap",
      body: (
        <div className="space-y-4">
          <div>
            <div className={SUB}>Recurring assessments</div>
            <Bullets items={[
              "Charges follow the frequency, due day and amount in your HOA profile (or the home's own amount from the roster).",
              <>Each charge is created <b>about 15 days before its due date</b>, so homeowners can pay early.</>,
            ]} />
          </div>
          <div>
            <div className={SUB}>Special assessments</div>
            <Bullets items={[
              "Add a one-off special assessment (for example a roof or road project) with its own amount and due date.",
              "Make sure the special assessment was properly approved under your governing documents before you bill it.",
            ]} />
          </div>
          <div>
            <div className={SUB}>Late fees</div>
            <Bullets items={[
              "A late fee is applied automatically when a charge is still unpaid after the grace period.",
              <>The fee is <b>capped at the state limit</b>. In North Carolina that&apos;s the greater of <b>$20 per month or 10% of the unpaid installment</b> (N.C.G.S. 47F-3-102(11)).</>,
              <>Example: on a $150 quarterly installment, 10% is $15, so the most you can charge is $20 a month. On a $600 annual installment, the cap is $60.</>,
              "Your declaration or bylaws can set a lower late fee or limit it — use the lower amount if they do.",
              "Outside North Carolina, set your own late-fee amount and confirm it with your governing documents and an attorney.",
            ]} />
          </div>
          <div>
            <div className={SUB}>Email reminders (sent automatically)</div>
            <Bullets items={[
              <><b>7 days before</b> the due date</>,
              <><b>On</b> the due date</>,
              <><b>When overdue</b></>,
            ]} />
          </div>
          <Note>Card payments are optional. If they&apos;re on, the homeowner pays the card cost ({HOA_CARD_FEE_TEXT}, Stripe&apos;s rate) at cost with no markup. The board can turn card payments off so homeowners pay by bank only.</Note>
        </div>
      ),
    },
    {
      id: "offline",
      title: "7. Record check and cash payments",
      icon: Banknote,
      intro: "Keep every homeowner's balance accurate, even when they pay offline.",
      keywords: "check cash manual payment offline record",
      body: (
        <div className="space-y-3">
          <Steps items={[
            ["Deposit the payment", <>Deposit the check or cash into the HOA&apos;s bank account as usual.</>],
            ["Record it in Keycove", <>Record the payment against the homeowner&apos;s charge (date, amount, method and check number) so the balance, reminders and late fees stay correct.</>],
            ["Record promptly", <>Record offline payments before the grace period ends so the homeowner isn&apos;t charged a late fee by mistake.</>],
          ]} />
        </div>
      ),
    },
    {
      id: "payoff",
      title: "8. Payoff and resale statements",
      icon: Receipt,
      intro: "When a home is sold, the closing attorney asks the HOA for a statement of unpaid assessments.",
      keywords: "payoff resale statement closing fee cap 200 100 expedite 48 hours 10 business days 13a",
      body: (
        <div className="space-y-3">
          <Steps items={[
            ["Open the homeowner's account", <>Find the lot or unit being sold.</>],
            ["Create the statement", <>Keycove prepares a statement of the homeowner&apos;s unpaid assessments and charges.</>],
            ["Review and send", <>Check the balance, then send the statement to the requester.</>],
          ]} />
          <div>
            <div className={SUB}>North Carolina statutory caps (N.C.G.S. 47F-3-102(13a))</div>
            <Bullets items={[
              <>Fee of up to <b>$200</b> per statement or request.</>,
              <>Plus an expedite fee of up to <b>$100</b>, only when the request is made within 48 hours of closing.</>,
              <>The statement must be furnished within <b>10 business days</b> after the request is received.</>,
            ]} />
          </div>
        </div>
      ),
    },
    {
      id: "liens",
      title: "9. Delinquencies, liens and fines (North Carolina)",
      icon: Gavel,
      intro: "Keycove does NOT file liens. Here's a plain-English summary of the NC rules so you know when to bring in your attorney.",
      keywords: "lien delinquent collections attorney 47F-3-116 fines hearing 47F-3-107.1 suspension foreclosure",
      body: (
        <div className="space-y-4">
          <Note tone="warn">
            <b>Keycove does not file liens.</b> Use an attorney for liens, collections and foreclosure. Keycove&apos;s collections report and CSV export give your attorney the homeowner&apos;s charges and payment history.
          </Note>
          <div>
            <div className={SUB}>Liens for unpaid assessments (N.C.G.S. 47F-3-116)</div>
            <Bullets items={[
              <>An assessment must be unpaid for <b>30 days or more</b> before a lien can be filed.</>,
              <>At least <b>15 days before filing</b>, the HOA must mail the owner a statement of the amount due by <b>first-class mail</b> — to the lot&apos;s address, the owner&apos;s address on file with the HOA, and the address on the county tax records if different. If the owner is a corporation or LLC, it also goes to the registered agent.</>,
              <>The claim of lien is filed with the <b>clerk of superior court</b> in the county where the lot is. The statute sets what it must contain and how the owner must be served.</>,
              <>The HOA can&apos;t charge the owner attorneys&apos; fees until it has mailed a written notice giving the owner 15 days to pay the balance without them.</>,
              <>A lien ends unless enforcement starts within 3 years of filing. Foreclosure has further requirements (for example, 90+ days unpaid and a board vote for nonjudicial foreclosure).</>,
              <><b>Use an attorney</b> for every step of this process.</>,
            ]} />
          </div>
          <div>
            <div className={SUB}>Fines and suspensions for violations (N.C.G.S. 47F-3-107.1)</div>
            <Bullets items={[
              <>Before fining an owner or suspending privileges or services, the owner must get <b>notice of the charge, a hearing</b> (a chance to be heard and present evidence) and <b>notice of the decision</b> — unless your declaration sets its own procedure.</>,
              "The hearing is before the board or a panel the board appoints (panel members can't be officers or board members).",
              "A fine can be up to $100 per violation, and up to $100 a day, without another hearing, for each day the violation continues more than 5 days after the decision.",
              "The owner can appeal a panel's decision to the full board within 15 days.",
              "Suspending privileges for unpaid amounts (30+ days) also needs notice and an opportunity to be heard, and access to the owner's lot can never be suspended (47F-3-102(11)).",
              "Late charges on unpaid assessments (step 6) are separate from violation fines.",
            ]} />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            These summaries follow the North Carolina Planned Community Act (Chapter 47F). Condominium associations are governed by the North Carolina Condominium Act (Chapter 47C), and your declaration may change some of these rules. <b>This is not legal advice.</b> Confirm with your governing documents and an attorney licensed in your state.
          </p>
        </div>
      ),
    },
    {
      id: "close",
      title: "10. Month-end close",
      icon: BarChart3,
      intro: "A 15-minute routine for the treasurer.",
      keywords: "month end close collections report csv export payouts reconcile treasurer",
      body: (
        <Steps items={[
          ["Record offline payments", <>Make sure every check and cash payment for the month is recorded (step 7).</>],
          ["Review the collections report", <>On the board dashboard, check paid vs. delinquent homes and follow up on overdue accounts.</>],
          ["Export to CSV", <>Export the month&apos;s payments to CSV for your treasurer&apos;s report, bookkeeper or accountant.</>],
          ["Match payouts to the bank", <>Compare the payouts list in the dashboard with deposits on the HOA&apos;s bank statement.</>],
        ]} />
      ),
    },
    {
      id: "plan",
      title: "11. Plan limits and upgrades",
      icon: TrendingUp,
      intro: "Your plan follows your number of homes. Every plan includes every feature.",
      keywords: "plan limit upgrade homes price yearly monthly",
      body: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {HOA_TIERS.map(t => (
              <div key={t.id} className="p-3 rounded-xl border border-gray-100 bg-white">
                <div className="text-sm font-bold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-700">{formatUsd(t.monthly)}/mo</div>
                <div className="text-xs text-gray-500">or {formatUsd(t.yearly)}/yr</div>
              </div>
            ))}
          </div>
          <Bullets items={[
            "Yearly billing is 15% off.",
            "If you add homes past your plan's limit, Keycove prompts you to upgrade to the next plan.",
            <>See <Link href="/pricing#hoa" className="underline">full pricing</Link>.</>,
          ]} />
        </div>
      ),
    },
    {
      id: "homeowner-faq",
      title: "FAQ for homeowners",
      icon: HelpCircle,
      intro: "Share these answers with your community.",
      keywords: "homeowner faq fee autopay receipt sign in card ach",
      body: (
        <div className="space-y-2">
          {[
            ["How do I sign in?", `Use the link in your invite email, or go to keycove.net${HOA_ROUTES.portal}.`],
            ["Is there a fee to pay my dues?", `Paying by bank (ACH) is free — no per-payment fee. If your board allows card payments, the card processing cost (${HOA_CARD_FEE_TEXT}) is added at cost, with no markup.`],
            ["Can I set up autopay?", "Yes. Turn on autopay in the portal and your dues are paid automatically each period."],
            ["Where are my receipts?", "Your payment history and receipts are in the portal."],
            ["How long does a bank payment take?", "Bank (ACH) payments take about 4 business days to settle. Pay a few days before the due date to be safe."],
            ["Who gets my money?", "Your payment goes straight to your HOA's bank account through Stripe. Keycove never holds HOA funds."],
            ["Who sets the dues and late fees?", "Your HOA board. Questions about your balance, dues or rules go to your board."],
            ["Where are the HOA documents and rules?", "In the portal, along with board announcements."],
          ].map(([q, a]) => (
            <details key={q} className="group p-3 rounded-xl border border-gray-100 bg-white">
              <summary className="text-sm font-semibold text-gray-900 cursor-pointer flex items-center justify-between list-none">
                {q}
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90 text-gray-400" />
              </summary>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      ),
    },
  ], []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.intro || "").toLowerCase().includes(q) ||
      (s.keywords || "").toLowerCase().includes(q)
    );
  }, [search, sections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    filtered.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [filtered]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-[250px_1fr] gap-8">
        {/* Sticky TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-400">Keycove HOA</div>
                <div className="text-sm font-bold text-gray-900">Board guide</div>
              </div>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search the guide…"
                aria-label="Search the guide"
                className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-7 pr-2 py-2 outline-none focus:border-[#4F46E5]"
              />
            </div>
            <nav className="space-y-0.5">
              {filtered.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    active === s.id ? "bg-[#4F46E5]/10 text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0" style={active === s.id ? { color: ACCENT } : undefined} />
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </nav>
            <div className="mt-6 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-xs font-semibold text-gray-900 mb-1">Need a hand?</div>
              <p className="text-[11px] text-gray-500 mb-2">Email support@keycove.net or visit the Support Center.</p>
              <Link href="/support" className="block text-center text-xs font-semibold py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-colors text-gray-700">
                Contact support
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3" style={{ background: `${ACCENT}15`, color: ACCENT }}>
              <Scale className="h-3 w-3" /> Keycove HOA · Board guide
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
              Collect HOA dues online, step by step.
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl">
              Follow steps 1–5 once to get set up. Steps 6–11 cover running billing, statements, delinquencies and month-end close.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href={HOA_ROUTES.board}>
                <Button className="font-bold gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                  Open board dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={HOA_ROUTES.landing}>
                <Button variant="outline" className="font-bold">About Keycove HOA</Button>
              </Link>
            </div>
            {/* Mobile search */}
            <div className="relative mt-5 lg:hidden">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search the guide…"
                aria-label="Search the guide"
                className="w-full text-sm bg-white border border-gray-200 rounded-lg pl-7 pr-2 py-2 outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div className="space-y-5">
            {filtered.map(s => (
              <section key={s.id} id={s.id} className="scroll-mt-24 rounded-2xl border border-gray-100 bg-gray-50/60 p-5 md:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-gray-900">{s.title}</h2>
                    {s.intro && <p className="text-sm text-gray-500 mt-0.5">{s.intro}</p>}
                  </div>
                </div>
                {s.body}
              </section>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">No sections match &ldquo;{search}&rdquo;.</p>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 rounded-xl border border-gray-200 bg-white text-xs text-gray-500 leading-relaxed">
            <b className="text-gray-700">Not legal advice.</b> This guide explains how to use Keycove HOA and summarizes some North Carolina statutes in plain English. It is not legal advice and doesn&apos;t cover every rule or exception. Your declaration, bylaws and other governing documents may set different requirements. Talk to an attorney licensed in your state before filing a lien, fining an owner or changing your late-fee policy.
          </div>
        </div>
      </div>
    </div>
  );
}
