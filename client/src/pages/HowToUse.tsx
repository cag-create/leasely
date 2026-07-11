import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Rocket, Landmark, Home, Palette, FileText, DollarSign,
  Wrench, UserCircle, Headphones, ArrowRight, CheckCircle2, Sparkles,
  Search, Award,
} from "lucide-react";

const ACCENT = "#4F46E5";

type Step = {
  n: number;
  icon: any;
  title: string;
  body: string;
  points: string[];
  cta?: { label: string; href: string };
};

/**
 * "How to use Leasely" — the plain-language setup walkthrough for new users.
 * Ordered the way a landlord actually onboards: go Pro → get paid → add
 * properties → brand → screen → lease → collect → maintain. Each step links
 * straight to the page that does the thing.
 */
const STEPS: Step[] = [
  {
    n: 1,
    icon: Rocket,
    title: "Get set up on Pro",
    body: "A one-time $75 setup + $25/month turns Leasely into your full landlord operating system — and includes a free professional website, custom logo, and Year 1 domain built by Certify Business Pro.",
    points: [
      "Unlimited listings on the marketplace",
      "Branded tenant portal at yourname.leasely.net",
      "AI applicant screening, e-sign leases, accounting & more",
    ],
    cta: { label: "See everything in Pro", href: "/pro" },
  },
  {
    n: 2,
    icon: Landmark,
    title: "Connect your bank (get paid)",
    body: "Add your bank once and rent from every tenant deposits straight to you. Your bank details are stored securely at Stripe — never on Leasely. This is per-account: you only ever connect your own bank.",
    points: [
      "Tenants pay free by ACH",
      "Instant payout to a debit card for a $1 flat fee, or free in 1–2 business days",
      "See your masked bank + balance any time on the Payouts tab",
    ],
    cta: { label: "Go to Payouts", href: "/payouts" },
  },
  {
    n: 3,
    icon: Home,
    title: "Add your properties",
    body: "List a single rental, or set up a whole apartment complex with per-unit pricing. Listings appear on the public marketplace so renters can find and apply.",
    points: [
      "One listing is free even before you upgrade",
      "Import existing listings in bulk",
      "Group units under a complex for multi-unit buildings",
    ],
    cta: { label: "List a property", href: "/list-property" },
  },
  {
    n: 4,
    icon: Palette,
    title: "Brand your portal & website",
    body: "Your Pro setup includes a professional website, custom logo, and domain. Customize your tenant portal's name, colors, and logo so everything your renters see is yours.",
    points: [
      "Website delivered in 24–48 hours by Certify Business Pro",
      "Year 1 domain & hosting included ($37/yr renewal after)",
      "Bring your own domain instead if you prefer",
    ],
    cta: { label: "Set up your portal", href: "/portal-setup" },
  },
  {
    n: 5,
    icon: FileText,
    title: "Take applications & screen",
    body: "Share your listing's public application link. Applicants apply online and Leasely's AI screening gives you a risk score with any flagged anomalies so you can decide with confidence.",
    points: [
      "Custom application templates per state",
      "AI risk score + flagged items",
      "Approve, decline, or request more info in one click",
    ],
    cta: { label: "View applications", href: "/applications" },
  },
  {
    n: 6,
    icon: FileText,
    title: "Send a lease & e-sign",
    body: "Generate a state-specific lease, send it for e-signature, and collect the first month's rent plus deposit at signing — all in one flow.",
    points: [
      "State-aware lease templates",
      "Tenant e-signs online",
      "First month + deposit collected automatically",
    ],
    cta: { label: "Lease agreements", href: "/leases" },
  },
  {
    n: 7,
    icon: DollarSign,
    title: "Collect rent automatically",
    body: "Once a tenant is on autopay, rent is charged every month and deposited to your bank. Behind on a tenant? Record an offline payment or adjust a single month's charge.",
    points: [
      "Recurring monthly autopay",
      "Record cash/Zelle/check payments manually",
      "Track arrears and outstanding balances",
    ],
    cta: { label: "Open your dashboard", href: "/dashboard" },
  },
  {
    n: 8,
    icon: Wrench,
    title: "Handle maintenance",
    body: "Tenants submit work orders; you dispatch to your favorite contractors and escalate automatically if one declines. Browse the contractor directory to build your bench.",
    points: [
      "Tenant-submitted work orders",
      "Auto-escalation on decline",
      "Find vetted contractors near you",
    ],
    cta: { label: "Work orders", href: "/work-orders" },
  },
];

export default function HowToUse() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/30 px-3 py-1 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Getting started</span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">How to use Leasely</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Everything you need to go from signing up to collecting rent — in order. Each step links straight to where you do it.
          </p>
        </div>

        {/* What Leasely is */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-bold text-foreground mb-2">What Leasely is</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Leasely is an all‑in‑one operating system for rentals — list properties, screen applicants with AI,
            e‑sign state‑specific leases, collect rent, and run maintenance in one place — plus a public marketplace
            where renters find and apply to your listings. It serves three roles:
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1"><Home className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /><span className="font-semibold text-sm text-foreground">Landlords</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">List, screen, lease, collect rent, and dispatch maintenance. Go Pro for the full toolkit plus a free branded website.</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1"><Search className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /><span className="font-semibold text-sm text-foreground">Renters</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">Browse the marketplace, apply online in minutes, e‑sign the lease, and pay rent from a tenant portal.</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1"><Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /><span className="font-semibold text-sm text-foreground">Creme Agents</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">Licensed agents join the network to receive leads and earn referral fees on closed deals.</p>
              <Link href="/agent-guide"><span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Agent guide →</span></Link>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black"
                    style={{ background: ACCENT }}
                  >
                    {s.n}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h2 className="font-bold text-foreground">{s.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  <ul className="mt-3 space-y-1.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  {s.cta && (
                    <Link href={s.cta.href}>
                      <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2.5 transition-all">
                        {s.cta.label} <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Creme Agents */}
        <div className="mt-8 rounded-2xl border border-indigo-200/70 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: ACCENT }}>
              <Award className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground">Are you a real estate agent? Join the Creme Agent Network</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                Leasely brings the lead — you bring the license and close the deal. Build a profile that shows up in the
                agent directory, receive buyer/seller/FSBO leads with notifications, and earn a referral fee on every
                closed transaction. It's a separate track from the landlord tools above.
              </p>
              <ul className="mt-3 space-y-1.5">
                {[
                  "Register your license + specialties, then get approved",
                  "Leads land on your Agent Dashboard with an email + notification",
                  "Work the lead; Leasely invoices the referral fee on close",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link href="/broker-dashboard">
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors" style={{ background: ACCENT }}>
                    <Award className="h-4 w-4" /> Become a Creme Agent
                  </button>
                </Link>
                <Link href="/agent-guide">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                    <FileText className="h-4 w-4" /> Read the Creme Agent Guide
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer help */}
        <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-6 text-center">
          <UserCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-bold text-foreground">Still have questions?</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            The Pro Guide goes deeper on every feature, or reach our team directly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/pro-guide">
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                <FileText className="h-4 w-4" /> Read the Pro Guide
              </button>
            </Link>
            <Link href="/support">
              <button className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors" style={{ background: ACCENT }}>
                <Headphones className="h-4 w-4" /> Contact Support
              </button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
