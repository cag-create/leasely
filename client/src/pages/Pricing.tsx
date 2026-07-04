import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Sparkles, Building2, Shield, FileText,
  Users, Globe, Banknote, Wrench, BarChart3, Headphones, QrCode,
  ChevronDown, ChevronUp, ArrowRight, Zap, Loader2
} from "lucide-react";

const BRAND = "#1F1A12";
const ACCENT = "#4F46E5";

const FREE_FEATURES = [
  { label: "1 property listing on marketplace", included: true },
  { label: "Map pin placement (US-wide)", included: true },
  { label: "Views & saves analytics", included: true },
  { label: "Contact form inquiries", included: true },
  { label: "Unlimited listings", included: false },
  { label: "Branded portal (yourname.leasely.net)", included: false },
  { label: "AI fraud applicant detection", included: false },
  { label: "Digital rental applications", included: false },
  { label: "Background checks (ApplyConnect, TransUnion-backed)", included: false },
  { label: "Tenant payment portal", included: false },
  { label: "Waived ACH fees for tenants", included: false },
  { label: "Work order management + AI dispatch", included: false },
  { label: "Accounting & tax export", included: false },
  { label: "Property CRM", included: false },
  { label: "QR code per listing", included: false },
  { label: "Priority customer support (24hr SLA)", included: false },
];

const PRO_FEATURES = [
  { label: "Everything in Free", included: true },
  { label: "Unlimited property listings", included: true },
  { label: "Branded portal (yourname.leasely.net)", included: true },
  { label: "AI fraud applicant detection", included: true },
  { label: "Digital rental applications", included: true },
  { label: "Background checks (ApplyConnect, TransUnion-backed)", included: true },
  { label: "Tenant payment portal", included: true },
  { label: "Waived ACH fees — tenants pay rent free", included: true },
  { label: "Instant payouts to your bank (Stripe Connect)", included: true },
  { label: "Work order management + AI vendor dispatch", included: true },
  { label: "Accounting ledger & tax-ready CSV export", included: true },
  { label: "Property CRM (units, tenants, leases, notes)", included: true },
  { label: "QR code per listing (printable flyer)", included: true },
  { label: "Priority customer support — 24hr SLA", included: true },
  { label: "Custom brand logo, colors & subdomain", included: true },
  { label: "Public portal page (shareable on Google)", included: true },
  { label: "Property manager delegated access", included: true },
  { label: "Granular PM permissions (view/manage/approve)", included: true },
];


const COMPARISON_ROWS = [
  { category: "Marketplace", label: "Property listings", free: "1 listing", pro: "Unlimited" },
  { category: "Marketplace", label: "Map pin placement", free: true, pro: true },
  { category: "Marketplace", label: "Views & saves stats", free: true, pro: true },
  { category: "Marketplace", label: "Contact form inquiries", free: true, pro: true },
  { category: "Portal", label: "Branded portal (yourname.leasely.net)", free: false, pro: true },
  { category: "Portal", label: "Custom logo, colors & subdomain", free: false, pro: true },
  { category: "Portal", label: "Public portal page (Google-indexable)", free: false, pro: true },
  { category: "Portal", label: "QR code per listing", free: false, pro: true },
  { category: "Screening", label: "AI fraud applicant detection", free: false, pro: true },
  { category: "Screening", label: "Digital rental applications", free: false, pro: true },
  { category: "Screening", label: "Background checks (ApplyConnect, TransUnion-backed)", free: false, pro: true },
  { category: "Payments", label: "Tenant payment portal", free: false, pro: true },
  { category: "Payments", label: "ACH rent payments", free: false, pro: "Waived fees" },
  { category: "Payments", label: "Instant bank payouts (Stripe Connect)", free: false, pro: true },
  { category: "Management", label: "Work order management + AI dispatch", free: false, pro: true },
  { category: "Management", label: "Accounting ledger & CSV export", free: false, pro: true },
  { category: "Management", label: "Property CRM", free: false, pro: true },
  { category: "Management", label: "Lease agreements + e-signature", free: false, pro: true },
  { category: "Management", label: "Property manager delegated access", free: false, pro: true },
  { category: "Management", label: "PM granular permissions (view / manage / approve)", free: false, pro: true },
  { category: "Support", label: "Customer support", free: "Standard (3–5 days)", pro: "Priority (24hr SLA)" },
];

const FAQ_ITEMS = [
  {
    q: "Is the free listing really free — no credit card?",
    a: "Yes. Your first property listing on the Leasely marketplace is completely free. No credit card required, no time limit. You get map placement, views & saves stats, and contact form inquiries."
  },
  {
    q: "What does 'waived ACH fees' mean for my tenants?",
    a: "Normally, ACH bank transfers carry a processing fee (typically 0.8%, capped at $5). With a Pro subscription, Leasely covers that fee on your behalf — so your tenants pay rent through the portal at absolutely no charge. You receive the full rent amount."
  },
  {
    q: "What is AI fraud applicant detection?",
    a: "Our AI fraud applicant detection engine analyzes rental applications for red flags: fake employer names, inflated income figures, inconsistent employment history, and suspicious document patterns. It flags high-risk applicants before you spend time on a background check."
  },
  {
    q: "How does the branded portal work?",
    a: "When you upgrade to Pro, you choose a subdomain (e.g., 'smithproperties') and your portal becomes live at leasely.net/portal/smithproperties. You can share this URL on Google Business, Zillow, social media, or print it on business cards. It shows your logo, brand colors, and all your active listings."
  },
  {
    q: "Can I cancel my Pro subscription anytime?",
    a: "Yes — cancel anytime from your dashboard. Your Pro features remain active until the end of your current billing period. After cancellation, your account reverts to the free tier (1 listing, marketplace-only access)."
  },
  {
    q: "How do tenant payments work?",
    a: "Once you connect your bank account via Stripe Connect, you can invite tenants to their own portal. Tenants log in with a magic-link and pay rent via ACH (free for them) or card. Funds are deposited directly to your bank account, typically within 1–2 business days."
  },
  {
    q: "What's included in the Property CRM?",
    a: "The CRM lets you organize all your properties, units, tenants, leases, and notes in one place. Track lease start/end dates, monthly rent, security deposits, tenant contact info, and add notes to any record. It's designed to replace spreadsheets and give you a clean, searchable database of your entire portfolio."
  },
  {
    q: "Can I use Leasely if I have a property manager handling my units?",
    a: "Yes — and it's included in Pro at no extra charge. You can invite your property manager to your account and give them granular permissions: they can view work orders, manage maintenance, approve applications, or handle leases — whatever you authorize. You stay in control, they get the access they need. No separate tier, no extra fee."
  },
  {
    q: "I manage many properties. Is there a per-unit charge?",
    a: "No. Pro is $75 one-time setup + $25/month flat — no per-property or per-unit fees, ever. List 1 property or 100. Add a property manager. Hand off entire portfolios. It's all the same $25/month."
  },
  {
    q: "Do you take a cut of vendor invoices or charge per work order?",
    a: "No. Unlike Buildium and Yardi — which charge per-transaction fees or mark up vendor invoices — Leasely takes zero from your work orders. Your contractor invoices you $1,000, your contractor gets paid $1,000, we don't touch it. We don't nickel-and-dime. The $25/mo covers unlimited work orders, unlimited vendor dispatch, and unlimited Stripe Connect payouts."
  },
  {
    q: "What's actually recurring vs. one-time?",
    a: "Leasely: $75 one-time setup + $25/mo recurring (cancel anytime). The CBP brand kit ($299 value — free with Pro) is one-time; only the domain + hosting renewal at $37/yr is recurring after year 1, and you can transfer your domain to your own registrar to avoid it. Optional CBP add-ons like EIN filing (~$79 one-time — or apply free yourself at irs.gov), LLC formation, and trademark filing are billed directly by CBP at their listed prices — Leasely takes no markup and no kickback on any of it."
  },
];



function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-gray-900 text-sm leading-relaxed">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </button>
      {open && (
        <p className="text-sm text-gray-600 leading-relaxed pb-4">{a}</p>
      )}
    </div>
  );
}

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCheckout = () => {
    if (!termsAccepted) {
      toast.error("Please review and accept the terms before continuing.");
      return;
    }
    checkoutMutation.mutate();
  };

  const checkoutMutation = trpc.marketplace.createProCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Could not start checkout. Please try again.");
    },
  });

  const categories = Array.from(new Set(COMPARISON_ROWS.map(r => r.category)));
  const filteredRows = activeCategory
    ? COMPARISON_ROWS.filter(r => r.category === activeCategory)
    : COMPARISON_ROWS;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 text-center" style={{ background: `linear-gradient(160deg, ${BRAND} 0%, #3A2410 100%)` }}>
        <Badge className="mb-4 font-bold text-xs px-3 py-1 border-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>
          Simple, Transparent Pricing
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Start Free. Grow with Pro.
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
          List your first property at no cost. Upgrade to Pro when you're ready for the full platform — branded portal, AI fraud applicant detection, tenant payments, and more.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-white/60">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" /> No credit card for free tier</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" /> Cancel Pro anytime</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" /> Waived ACH fees included</span>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

          {/* Free card */}
          <div className="rounded-3xl border-2 border-gray-100 p-8 bg-white">
            <div className="mb-6">
              <div className="font-black text-gray-900 text-xl mb-1">Free</div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-gray-900">$0</span>
                <span className="text-gray-400 text-sm">/ forever</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Get your first listing live on the marketplace with no commitment.</p>
            </div>
            {!isAuthenticated ? (
              <a href={getLoginUrl()}>
                <Button className="w-full font-bold mb-6" variant="outline">
                  Get Started Free
                </Button>
              </a>
            ) : (
              <Link href="/list-property">
                <Button className="w-full font-bold mb-6" variant="outline">
                  <Building2 className="h-4 w-4 mr-2" /> List Your Property
                </Button>
              </Link>
            )}
            <div className="space-y-3">
              {FREE_FEATURES.map(f => (
                <div key={f.label} className={`flex items-start gap-2.5 text-sm ${f.included ? "text-gray-700" : "text-gray-300"}`}>
                  {f.included ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-200 shrink-0 mt-0.5" />
                  )}
                  <span className={f.included ? "" : "line-through"}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro card */}
          <div className="rounded-3xl border-2 p-8 relative overflow-hidden" style={{ borderColor: ACCENT, background: `linear-gradient(160deg, ${BRAND} 0%, #3A2410 100%)` }}>
            <div className="absolute top-4 right-4">
              <Badge className="font-bold text-xs border-0" style={{ background: ACCENT, color: "#3A2410" }}>
                <Sparkles className="h-3 w-3 mr-1" /> Most Popular
              </Badge>
            </div>
            <div className="mb-6">
              <div className="font-black text-white text-xl mb-1">Pro</div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">$25.00</span>
                <span className="text-white/50 text-sm">/ month</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-white/70 text-sm font-semibold">+ $75 one-time setup fee</span>
              </div>
              <p className="text-white/60 text-sm mt-2">Everything you need to run a professional rental business.</p>
            </div>
            {!isAuthenticated ? (
              <a href={getLoginUrl()}>
                <Button className="w-full font-bold mb-6 gap-2" style={{ background: ACCENT, color: "#3A2410" }}>
                  <Sparkles className="h-4 w-4" /> Get Started — Sign In First
                </Button>
              </a>
            ) : (
              <>
                <label className="flex items-start gap-2.5 mb-4 bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded cursor-pointer flex-shrink-0"
                    style={{ accentColor: ACCENT }}
                  />
                  <span className="text-xs text-white/65 leading-relaxed">
                    I agree: <strong className="text-white">$75 setup is non-refundable once design begins</strong> (work starts immediately, delivered in 24–48 hours). $25/mo cancellable anytime, no pro-rated refunds. I keep my website &amp; logo regardless. <Link href="/terms" className="underline hover:text-white" target="_blank">Terms</Link> ·{" "}
                    <Link href="/privacy" className="underline hover:text-white" target="_blank">Privacy</Link>.
                  </span>
                </label>
                <Button
                  className="w-full font-bold mb-6 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: ACCENT, color: "#3A2410" }}
                  onClick={handleCheckout}
                  disabled={checkoutMutation.isPending || !termsAccepted}
                >
                  {checkoutMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Opening checkout...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Get Pro — $75 setup + $25/mo</>
                  )}
                </Button>
              </>
            )}
            <div className="space-y-3">
              {PRO_FEATURES.map(f => (
                <div key={f.label} className="flex items-start gap-2.5 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs text-center mt-6">$75 one-time setup (website, logo & URL) · $25/mo thereafter · Cancel anytime</p>
          </div>

        </div>
      </section>

      {/* Pro value callouts */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Why Pro Pays for Itself</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                color: "#DBEAFE",
                iconColor: "#2563EB",
                title: "AI Fraud Detection",
                desc: "Catch fake pay stubs and inflated income before you waste time on a bad applicant. One avoided eviction saves thousands.",
              },
              {
                icon: Banknote,
                color: "#DCFCE7",
                iconColor: "#16A34A",
                title: "Waived ACH Fees",
                desc: "Tenants pay rent for free via ACH. No $5 transfer fees means higher on-time payment rates and happier tenants.",
              },
              {
                icon: Globe,
                color: `${ACCENT}20`,
                iconColor: BRAND,
                title: "Branded Portal",
                desc: "Your own yourname.leasely.net portal looks professional and builds trust with prospective tenants on Google.",
              },
              {
                icon: Wrench,
                color: "#FEF3C7",
                iconColor: "#D97706",
                title: "AI Work Order Dispatch",
                desc: "Automatically find and email vendors when a repair is needed. No more playing phone tag with contractors.",
              },
            ].map(({ icon: Icon, color, iconColor, title, desc }) => (
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

      {/* Full comparison table */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Full Feature Comparison</h2>
          <p className="text-gray-500 text-center text-sm mb-8">Every feature, side by side.</p>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${!activeCategory ? "text-white" : "text-gray-500 hover:text-gray-700 bg-gray-100"}`}
              style={!activeCategory ? { background: BRAND } : {}}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeCategory === cat ? "text-white" : "text-gray-500 hover:text-gray-700 bg-gray-100"}`}
                style={activeCategory === cat ? { background: BRAND } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="p-4 text-sm font-bold text-gray-500">Feature</div>
              <div className="p-4 text-sm font-bold text-gray-700 text-center">Free</div>
              <div className="p-4 text-sm font-bold text-center" style={{ color: ACCENT, background: `${BRAND}08` }}>
                <Sparkles className="inline h-3.5 w-3.5 mr-1" />Pro
              </div>
            </div>
            {filteredRows.map((row, i) => (
              <div key={row.label} className={`grid grid-cols-3 border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <div className="p-4 text-sm text-gray-700">
                  <span className="text-xs text-gray-400 block mb-0.5">{row.category}</span>
                  {row.label}
                </div>
                <div className="p-4 flex items-center justify-center">
                  {typeof row.free === "boolean" ? (
                    row.free ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-200" />
                    )
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">{row.free}</span>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center" style={{ background: `${BRAND}04` }}>
                  {typeof row.pro === "boolean" ? (
                    row.pro ? (
                      <CheckCircle2 className="h-5 w-5" style={{ color: ACCENT }} />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-200" />
                    )
                  ) : (
                    <span className="text-sm font-bold" style={{ color: ACCENT }}>{row.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-center text-sm mb-10">Everything you need to know about Leasely pricing.</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {FAQ_ITEMS.map(item => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center" style={{ background: `linear-gradient(135deg, ${BRAND}, #3A2410)` }}>
        <div className="max-w-2xl mx-auto">
          <Badge className="mb-4 font-bold text-xs px-3 py-1 border-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>
            <Zap className="h-3 w-3 mr-1" /> Start in 2 minutes
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Start free — no credit card required. Upgrade to Pro when you're ready to unlock the full platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <a href={getLoginUrl()}>
                  <Button size="lg" className="font-bold px-8 gap-2" style={{ background: ACCENT, color: "#3A2410" }}>
                    <Building2 className="h-5 w-5" /> Start Free — List a Property
                  </Button>
                </a>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="font-bold px-8 gap-2 border-white/20 text-white hover:bg-white/10">
                    Browse Rentals
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/list-property">
                  <Button size="lg" className="font-bold px-8 gap-2" style={{ background: ACCENT, color: "#3A2410" }}>
                    <Building2 className="h-5 w-5" /> List a Property
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-bold px-8 gap-2 border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCheckout}
                  disabled={checkoutMutation.isPending || !termsAccepted}
                  title={!termsAccepted ? "Please accept the terms in the Pro pricing card above to continue" : ""}
                >
                  {checkoutMutation.isPending ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Opening checkout...</>
                  ) : (
                    <><Sparkles className="h-5 w-5" /> Upgrade to Pro</>
                  )}
                </Button>
              </>
            )}
          </div>
          <p className="text-white/40 text-sm mt-6">
            Free tier · No credit card required · Pro: $75 setup + $25/mo · Cancel anytime
          </p>
          <p className="text-white/30 text-xs mt-2">
            <Link href="/fees" className="underline hover:text-white/60 transition-colors">View full fee schedule & terms →</Link>
          </p>
        </div>
      </section>

      {/* Affiliate CTA */}
      <div className="py-10 px-4 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-[#4F46E5]/8 to-[#4F46E5]/8 border border-[#4F46E5]/15 px-8 py-6">
          <div className="text-center md:text-left">
            <p className="text-foreground font-bold text-base">Refer landlords. Earn $50 one-time per signup.</p>
            <p className="text-muted-foreground text-sm mt-1">No cap, no expiry. Earn a $50 one-time bonus for every landlord who signs up using your affiliate code and pays their first full month plus setup fee.</p>
          </div>
          <Link href="/affiliate/signup">
            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold gap-2 whitespace-nowrap shrink-0">
              <Sparkles className="h-4 w-4" /> Join Affiliate Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <div className="py-8 px-4 text-center bg-background border-t border-border">
        <p className="text-muted-foreground text-sm">
          Questions? Email us at <a href="mailto:support@leasely.net" className="text-muted-foreground hover:underline font-medium">support@leasely.net</a>
          {" · "}
          <Link href="/support" className="text-muted-foreground hover:underline font-medium">Support Center</Link>
          {" · "}
          <Link href="/fees" className="text-[#4F46E5] hover:underline font-medium">Fee Schedule</Link>
        </p>
      </div>
    </div>
  );
}
