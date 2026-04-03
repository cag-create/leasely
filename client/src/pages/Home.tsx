import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Sparkles, ArrowRight, Search, Map, Shield, Zap, Building2,
  DollarSign, FileText, BarChart3, CheckCircle2,
  ChevronRight, Play, Globe, TrendingUp, Users,
  Wrench, Home as HomeIcon, CreditCard
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png";

// Animated counter hook
function useCounter(end: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

function AnimatedStat({ value, suffix = "", prefix = "", label, sublabel }: {
  value: number; suffix?: string; prefix?: string; label: string; sublabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCounter(value, 1600, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
        {prefix}{visible ? count.toLocaleString() : 0}{suffix}
      </div>
      <div className="text-sm font-semibold text-white/80">{label}</div>
      {sublabel && <div className="text-xs text-white/40 mt-0.5">{sublabel}</div>}
    </div>
  );
}

const proFeatures = [
  { icon: FileText, title: "Rental Applications", desc: "State-specific forms, co-living member applications, and custom upload support.", color: "from-blue-500 to-indigo-600" },
  { icon: Shield, title: "AI Fraud Detection", desc: "Automated applicant screening with risk scoring and background check integration.", color: "from-purple-500 to-violet-600" },
  { icon: Zap, title: "Instant Payouts", desc: "Receive rent payments instantly via Stripe Connect — no waiting for ACH settlement.", color: "from-[#00C896] to-teal-500" },
  { icon: BarChart3, title: "Rent Rate Intelligence", desc: "See area market rates for any city and property type to price competitively.", color: "from-amber-500 to-orange-500" },
  { icon: Building2, title: "Apartment Complexes", desc: "Manage multi-unit buildings with individual unit listings and tenant tracking.", color: "from-rose-500 to-pink-600" },
  { icon: Wrench, title: "Work Order Management", desc: "Dispatch vendors, track maintenance, and get AI-generated repair summaries.", color: "from-slate-500 to-gray-600" },
  { icon: DollarSign, title: "Accounting & P&L", desc: "Income/expense ledger, profit & loss summary, and one-click CSV export.", color: "from-green-500 to-emerald-600" },
  { icon: Users, title: "Tenant CRM", desc: "Full tenant profiles, lease management, notes, and communication history.", color: "from-cyan-500 to-sky-600" },
];

const howItWorks = [
  { step: "01", title: "Sign Up Free", desc: "Create your account in seconds. No credit card required. Your first listing is always free.", icon: HomeIcon },
  { step: "02", title: "List Your Property", desc: "Add your property with photos, pricing, and amenities. It goes live on the marketplace instantly.", icon: Globe },
  { step: "03", title: "Upgrade to Pro", desc: "Pay a $50 setup fee + $25/month and your branded portal is built automatically — no waiting, no calls.", icon: Sparkles },
  { step: "04", title: "Manage Everything", desc: "Applications, rent payments, work orders, accounting — all in one place from day one.", icon: BarChart3 },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-bg min-h-[92vh] flex items-center relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#00C896]/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[#4F46E5]/10 blur-[100px] pointer-events-none" />

        <div className="container relative z-10 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00C896]/25 bg-[#00C896]/8 text-[#00C896] text-xs font-semibold mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  The Complete Property Management Platform
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                  Manage rentals
                  <br />
                  <span className="text-gradient">like a pro.</span>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-white/65 leading-relaxed max-w-lg">
                List properties, screen applicants, collect rent, manage work orders, and grow your portfolio — all from one beautifully designed platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="btn-teal text-base px-8 h-12 w-full sm:w-auto gap-2">
                    Start Free Today
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto gap-2 border-white/20 text-white hover:bg-white/8 bg-transparent">
                    <Search className="h-4 w-4" />
                    Browse Rentals
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/50">
                {["$50 one-time setup", "First listing free", "Cancel anytime", "Portal built automatically"].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00C896]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — dashboard preview card */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="glass rounded-2xl p-6 border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Pro Portal</p>
                      <p className="text-white font-bold text-lg mt-0.5">Property Dashboard</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#00C896]/10 text-[#00A87C] border border-[#00C896]/20">
                      <Sparkles className="h-3 w-3" /> Pro
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: "Active Listings", value: "12", change: "+2" },
                      { label: "Monthly Revenue", value: "$8,400", change: "+$600" },
                      { label: "Occupancy Rate", value: "94%", change: "+3%" },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/8">
                        <p className="text-white/50 text-[10px] font-medium">{stat.label}</p>
                        <p className="text-white font-bold text-lg mt-1">{stat.value}</p>
                        <p className="text-[#00C896] text-[10px] font-semibold mt-0.5">{stat.change} this month</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Recent Activity</p>
                    {[
                      { icon: FileText, text: "New application received", time: "2m ago", color: "text-blue-400" },
                      { icon: DollarSign, text: "Rent payment — Unit 4B", time: "1h ago", color: "text-[#00C896]" },
                      { icon: Wrench, text: "Work order completed", time: "3h ago", color: "text-amber-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className="h-7 w-7 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                          <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                        </div>
                        <span className="text-white/70 text-xs flex-1">{item.text}</span>
                        <span className="text-white/30 text-[10px]">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating accent cards */}
                <div className="absolute -bottom-4 -left-6 glass rounded-xl p-3 border border-white/10 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#00C896]/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-[#00C896]" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">Instant Payout</p>
                      <p className="text-[#00C896] text-[10px]">$2,100 available</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 glass rounded-xl p-3 border border-white/10 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">AI Screening</p>
                      <p className="text-purple-300 text-[10px]">3 new applicants</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#0A1628] border-y border-white/8 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedStat value={0} prefix="$" label="First Listing" sublabel="Always free" />
            <AnimatedStat value={0} suffix="%" label="ACH Fees for Pro" sublabel="vs. industry 0.8%" />
            <AnimatedStat value={50} label="States Covered" sublabel="All US markets" />
            <AnimatedStat value={25} prefix="$" suffix="/mo" label="Pro Portal" sublabel="$50 one-time setup" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold px-3 py-1">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              From sign-up to fully operational<br />
              <span className="text-gradient">in under 5 minutes.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No onboarding calls. No manual setup. Pay and your portal is ready immediately — even at 2am.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative group">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%+0.75rem)] w-6 h-px bg-border z-10">
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground absolute -right-2 -top-1.5" />
                  </div>
                )}
                <div className="rounded-2xl border border-border bg-card p-6 h-full hover:border-[#00C896]/30 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/8 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-4xl font-black text-border/80" style={{ fontFamily: "Outfit, sans-serif" }}>{step.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DUAL AUDIENCE
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Renters */}
            <div className="rounded-2xl border border-border bg-card p-8 md:p-10 hover:shadow-lg transition-all duration-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 border border-blue-200/50 dark:border-blue-800/50">
                <Search className="h-3.5 w-3.5" /> For Renters
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Find your next home,<br />faster.</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Browse verified listings across all 50 states. Filter by type, price, pets, and more. Save favorites and contact landlords directly.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Apartments, houses, rooms & co-living",
                  "Interactive map with neighborhood insights",
                  "Direct contact with landlords",
                  "Save and compare listings",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-[#00C896] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/marketplace">
                  <Button size="lg" className="gap-2 bg-[#00C896] hover:bg-[#00A87C] text-[#062018] font-semibold">
                    <Search className="h-4 w-4" /> Browse Listings
                  </Button>
                </Link>
                <Link href="/marketplace/map">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Map className="h-4 w-4" /> Map View
                  </Button>
                </Link>
              </div>
            </div>

            {/* Landlords */}
            <div className="rounded-2xl border border-[#00C896]/15 p-8 md:p-10 bg-gradient-to-br from-[#0A1628] to-[#1A3060] hover:shadow-lg transition-all duration-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C896]/12 text-[#00C896] text-xs font-semibold mb-6 border border-[#00C896]/20">
                <Building2 className="h-3.5 w-3.5" /> For Landlords & Property Managers
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Your entire portfolio,<br />one platform.</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                From a single rental to a 200-unit complex — Leasely Pro gives you every tool you need to run a professional operation.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Branded tenant portal — built automatically",
                  "State-specific rental applications",
                  "AI fraud detection & screening",
                  "Instant payouts via Stripe Connect",
                  "Apartment complex management",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 className="h-4 w-4 text-[#00C896] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/pro">
                  <Button size="lg" className="gap-2 bg-[#00C896] hover:bg-[#00A87C] text-[#062018] font-semibold">
                    <Sparkles className="h-4 w-4" /> See Pro Features
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/8 bg-transparent">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRO FEATURES GRID
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1.5 text-[#00C896]" /> Pro Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Everything you need to run<br />
              <span className="text-gradient">a professional portfolio.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All Pro features are live and available the moment your payment clears. No manual activation. No waiting.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proFeatures.map((feature, i) => (
              <div
                key={i}
                className={`rounded-2xl border bg-card p-6 cursor-pointer hover:border-[#00C896]/30 hover:shadow-lg transition-all duration-200 ${activeFeature === i ? "border-[#00C896]/30 shadow-lg" : "border-border"}`}
                onClick={() => setActiveFeature(i)}
              >
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/pro">
              <Button size="lg" className="gap-2 bg-[#00C896] hover:bg-[#00A87C] text-[#062018] font-semibold px-8">
                <Sparkles className="h-4 w-4" /> Explore All Pro Features
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MAP SECTION
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 text-xs font-semibold px-3 py-1">
                <Globe className="h-3 w-3 mr-1.5" /> Live Marketplace
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                Browse rentals across<br /><span className="text-gradient">all 50 states.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Our interactive map shows verified listings in real time. Filter by neighborhood, price, and property type.
              </p>
              <div className="flex gap-3">
                <Link href="/marketplace/map">
                  <Button size="lg" className="gap-2 bg-[#00C896] hover:bg-[#00A87C] text-[#062018] font-semibold">
                    <Map className="h-4 w-4" /> Open Map View
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Search className="h-4 w-4" /> Browse All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden aspect-[4/3] bg-gradient-to-br from-[#0A1628] to-[#1A3060] flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-[#00C896]/15 flex items-center justify-center mx-auto">
                  <Map className="h-8 w-8 text-[#00C896]" />
                </div>
                <p className="text-white font-semibold">Interactive Map</p>
                <p className="text-white/50 text-sm">Listings across all 50 states</p>
                <Link href="/marketplace/map">
                  <Button size="sm" className="mt-2 bg-[#00C896] hover:bg-[#00A87C] text-[#062018] font-semibold gap-2">
                    <Map className="h-3.5 w-3.5" /> Open Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRICING TEASER
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">Simple, transparent pricing.</h2>
              <p className="text-muted-foreground text-lg">No hidden fees. No contracts. No surprises.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">

              {/* Free */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Free</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-foreground">$0</span>
                    <span className="text-muted-foreground mb-1">/forever</span>
                  </div>
                </div>
                <div className="space-y-2.5 mb-8">
                  {["1 active listing", "Marketplace visibility", "Renter inquiries", "Basic analytics"].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-[#00C896] shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <a href={getLoginUrl()}>
                  <Button variant="outline" size="lg" className="w-full font-semibold">Get Started Free</Button>
                </a>
              </div>

              {/* Pro */}
              <div className="rounded-2xl border border-[#00C896]/20 p-8 bg-gradient-to-br from-[#0A1628] to-[#1A3060] relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/25">Most Popular</span>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">Pro</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">$25.00</span>
                    <span className="text-white/50 mb-1">/month</span>
                  </div>
                  <p className="text-white/40 text-xs mt-1">$50 one-time setup · No contracts · Cancel anytime.</p>
                </div>
                <div className="space-y-2.5 mb-8">
                  {[
                    "Unlimited listings",
                    "Branded tenant portal",
                    "State-specific applications",
                    "AI fraud detection",
                    "Instant payouts (0% ACH)",
                    "Work orders, accounting, CRM",
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-[#00C896] shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/pricing">
                  <Button size="lg" className="w-full font-semibold bg-[#00C896] hover:bg-[#00A87C] text-[#062018] gap-2">
                    <Sparkles className="h-4 w-4" /> Get Pro — $25/mo
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Questions?{" "}
              <Link href="/support" className="text-[#00C896] hover:underline font-medium">Contact our team</Link>
              {" "}or{" "}
              <Link href="/pricing" className="text-[#00C896] hover:underline font-medium">view full pricing details</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="pro-bg py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Ready to run your portfolio<br />
                <span className="text-gradient">like a business?</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Your portal is ready the moment you sign up. No waiting. No setup calls. Just pay and go.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={getLoginUrl()}>
                <Button size="lg" className="btn-teal text-base px-10 h-12 gap-2 w-full sm:w-auto">
                  <Sparkles className="h-4 w-4" />
                  Start Free — No Card Required
                </Button>
              </a>
              <Link href="/pro">
                <Button size="lg" variant="outline" className="text-base px-10 h-12 gap-2 w-full sm:w-auto border-white/20 text-white hover:bg-white/8 bg-transparent">
                  <Play className="h-4 w-4" />
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[#0A1628] border-t border-white/8">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={LOGO_URL} alt="Leasely" className="h-6 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="font-black text-white text-base">Leasely</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                The complete property management platform for modern landlords.
              </p>
            </div>

            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Renters</p>
              <div className="space-y-2">
                {[
                  { label: "Browse Listings", href: "/marketplace" },
                  { label: "Map View", href: "/marketplace/map" },
                  { label: "Saved Homes", href: "/saved" },
                ].map(l => (
                  <Link key={l.href} href={l.href}>
                    <span className="block text-white/40 hover:text-white/80 text-sm transition-colors cursor-pointer">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Landlords</p>
              <div className="space-y-2">
                {[
                  { label: "List a Property", href: "/list-property" },
                  { label: "Pro Portal", href: "/pro" },
                  { label: "Apartment Complexes", href: "/complexes" },
                  { label: "Pricing", href: "/pricing" },
                ].map(l => (
                  <Link key={l.href} href={l.href}>
                    <span className="block text-white/40 hover:text-white/80 text-sm transition-colors cursor-pointer">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Contractors</p>
              <div className="space-y-2">
                {[
                  { label: "Find a Contractor", href: "/contractors" },
                  { label: "List Your Business", href: "/contractors/register" },
                ].map(l => (
                  <Link key={l.href} href={l.href}>
                    <span className="block text-white/40 hover:text-white/80 text-sm transition-colors cursor-pointer">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Company</p>
              <div className="space-y-2">
                {[
                  { label: "Support", href: "/support" },
                  { label: "Pro Features", href: "/pro" },
                  { label: "Pricing", href: "/pricing" },
                ].map(l => (
                  <Link key={l.href} href={l.href}>
                    <span className="block text-white/40 hover:text-white/80 text-sm transition-colors cursor-pointer">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Get Started</p>
              <div className="space-y-3">
                <a href={getLoginUrl()}>
                  <Button size="sm" className="w-full bg-[#00C896] hover:bg-[#00A87C] text-[#062018] font-semibold gap-1.5 text-xs">
                    <Sparkles className="h-3.5 w-3.5" /> Start Free
                  </Button>
                </a>
                <Link href="/pricing">
                  <Button size="sm" variant="outline" className="w-full border-white/15 text-white/60 hover:bg-white/8 text-xs">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} Leasely. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
                <span key={item} className="text-white/30 hover:text-white/60 text-xs cursor-pointer transition-colors">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
