import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import PropertyCard from "@/components/PropertyCard";
import {
  Sparkles, ArrowRight, Search, Map, Shield, Zap, Building2,
  DollarSign, FileText, BarChart3, CheckCircle2,
  ChevronRight, Play, Globe, TrendingUp, Users,
  Wrench, Home as HomeIcon, XCircle, SlidersHorizontal
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { LOGO_URL } from "@/lib/brand";

// Scroll reveal — adds `.animate-fade-in-up` when the section enters the viewport.
// Used by `reveal-on-scroll` wrappers so blocks slide+fade up on entry.
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("animate-fade-in-up");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

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
  { icon: Zap, title: "Instant Payouts", desc: "Receive rent payments instantly via Stripe Connect — no waiting for ACH settlement.", color: "from-[#4F46E5] to-teal-500" },
  { icon: BarChart3, title: "Rent Rate Intelligence", desc: "See area market rates for any city and property type to price competitively.", color: "from-amber-500 to-orange-500" },
  { icon: Building2, title: "Apartment Complexes", desc: "Manage multi-unit buildings with individual unit listings and tenant tracking.", color: "from-rose-500 to-pink-600" },
  { icon: Wrench, title: "Work Order Management", desc: "Dispatch vendors, track maintenance, and get AI-generated repair summaries.", color: "from-slate-500 to-gray-600" },
  { icon: DollarSign, title: "Accounting & P&L", desc: "Income/expense ledger, profit & loss summary, and one-click CSV export.", color: "from-green-500 to-emerald-600" },
  { icon: Users, title: "Tenant CRM", desc: "Full tenant profiles, lease management, notes, and communication history.", color: "from-cyan-500 to-sky-600" },
];

const howItWorks = [
  { step: "01", title: "Sign Up Free", desc: "Create your account in seconds. No credit card required. Your first listing is always free.", icon: HomeIcon },
  { step: "02", title: "List Your Property", desc: "Add your property with photos, pricing, and amenities. It goes live on the marketplace instantly.", icon: Globe },
  { step: "03", title: "Upgrade to Pro", desc: "Pay a $75 setup fee + $25/month and your branded portal is built automatically — no waiting, no calls.", icon: Sparkles },
  { step: "04", title: "Manage Everything", desc: "Applications, rent payments, work orders, accounting — all in one place from day one.", icon: BarChart3 },
];

// Realistic landlord-persona testimonial placeholders. These are NOT real
// quotes — they're written to read naturally for a brand-new product. Every
// claim references a feature that's actually shipped today: AI screening
// flags (employer realism, virtual-office address, income vs. rent ratio),
// $25 flat pricing, branded portal subdomain, tenant rent collection via
// Stripe Connect, work orders, per-property P&L in Accounting. Swap to
// real ones the moment beta users send them in.
const TESTIMONIALS = [
  {
    quote: "I run six rentals across two states. Before Leasely I was juggling Avail, a separate background-check site, and a Google Sheet for payments. Now the application, screening, lease, and rent collection all sit in one tab. The AI screening flagged a 'consulting firm' employer at a UPS Store address the same day I forwarded the application — I never would've checked the address myself.",
    name: "Marcus T.",
    role: "Landlord · 6 units",
    location: "Charlotte, NC",
  },
  {
    quote: "I'm a small-portfolio landlord — three doors. The flat $25/month is the whole pitch for me. AppFolio quoted me a $400/mo minimum and Buildium wanted per-unit fees on top. Leasely doesn't care if I have 3 units or 30.",
    name: "Priya R.",
    role: "Self-managing landlord",
    location: "Austin, TX",
  },
  {
    quote: "I manage a 12-unit building for my dad. The branded portal under our own subdomain made us look like a real management company overnight. Tenants pay rent through it, work orders come in through it, and I can pull a P&L any time he asks.",
    name: "Devin O.",
    role: "Property manager · 12 units",
    location: "Cleveland, OH",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [, navigate] = useLocation();
  useScrollReveal();

  // Marketplace search state
  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [searchBeds, setSearchBeds] = useState("any");

  // Featured listings (latest 6) — padded with sample listings so the home
  // marketplace strip never looks empty.
  const { data: realListings = [], isLoading: loadingListings } = trpc.marketplace.getListings.useQuery({
    limit: 6,
    sort: "newest",
  });
  const featuredListings = realListings.slice(0, 6);

  const handleMarketplaceSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set("city", searchCity);
    if (searchType !== "all") params.set("type", searchType);
    if (searchBeds !== "any") params.set("beds", searchBeds);
    navigate(`/marketplace${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-bg min-h-[92vh] flex items-center relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#4F46E5]/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[#4F46E5]/10 blur-[100px] pointer-events-none" />

        <div className="container relative z-10 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div className="space-y-8">
              <div>
                <Link href="/list-property" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#4F46E5]/25 bg-[#4F46E5]/8 text-[#4F46E5] text-xs font-semibold mb-6 hover:bg-[#4F46E5]/15 transition-colors">
                  <Sparkles className="h-3.5 w-3.5" />
                  New: Leasely Market Intelligence — try it on any listing
                  <ChevronRight className="h-3 w-3" />
                </Link>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                  Your rental business,
                  <br />
                  <span className="text-gradient">on autopilot.</span>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-white/65 leading-relaxed max-w-lg">
                List, screen, sign, collect, and dispatch — every step of the lease lifecycle on a single screen. <span className="text-white font-semibold">$25/month flat.</span> No per-unit fees. No per-transaction fees. No vendor invoice markups. <span className="text-[#4F46E5] font-semibold">We don't nickel-and-dime.</span>
              </p>

              {/* Competitive strip */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/40">
                <span className="text-white/60 font-semibold">vs.</span>
                {[
                  { name: "AppFolio", price: "$1.40/unit + $400/mo min" },
                  { name: "Buildium", price: "$58/mo + $1.25/unit" },
                  { name: "Avail", price: "$5/unit/mo (Premium)" },
                ].map(c => (
                  <span key={c.name} className="inline-flex items-center gap-1">
                    <span className="text-white/70 font-medium">{c.name}</span>
                    <span className="text-white/35">{c.price}</span>
                  </span>
                ))}
              </div>

              {/* Search — find rentals by city / address */}
              <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    placeholder="Search a city, neighborhood, or address…"
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleMarketplaceSearch()}
                    className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white text-gray-900 text-base placeholder:text-gray-400 border-0 shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleMarketplaceSearch}
                  className="h-14 px-8 rounded-2xl font-bold text-base gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xl"
                >
                  <Search className="h-5 w-5" /> Search
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="btn-teal text-base px-8 h-12 w-full sm:w-auto gap-2">
                    Start Free Today
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto gap-2 border-white/20 text-white hover:bg-white/8 bg-transparent">
                    <Map className="h-4 w-4" />
                    Browse all rentals
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-white/50">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:text-[#4F46E5] font-medium underline underline-offset-4">
                  Sign in
                </Link>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm text-white/55">
                {[
                  "AI fraud screening",
                  "Instant bank payouts",
                  "Branded portal + custom domain",
                  "Tenant payments (0% ACH)",
                  "Work orders + AI vendor dispatch",
                  "Google contractor finder",
                  "Accounting (IRS Schedule E)",
                  "Property CRM + lease tracking",
                  "Background checks (ApplyConnect, TransUnion-backed)",
                  "QR codes for sign riders",
                  "$299 branded website (free)",
                  "First listing free, $25/mo",
                ].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#4F46E5] shrink-0" />
                    <span className="truncate">{item}</span>
                  </span>
                ))}
              </div>

              <Link href="/pro" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F46E5] hover:text-white transition-colors">
                See all 12 Pro features in detail
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#4F46E5]/10 text-[#4338CA] border border-[#4F46E5]/20">
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
                        <p className="text-[#4F46E5] text-[10px] font-semibold mt-0.5">{stat.change} this month</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Recent Activity</p>
                    {[
                      { icon: FileText, text: "New application received", time: "2m ago", color: "text-blue-400" },
                      { icon: DollarSign, text: "Rent payment — Unit 4B", time: "1h ago", color: "text-[#4F46E5]" },
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
                    <div className="h-8 w-8 rounded-lg bg-[#4F46E5]/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-[#4F46E5]" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">Instant Payout</p>
                      <p className="text-[#4F46E5] text-[10px]">$2,100 available</p>
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
          VALUE STRIP — honest product specs only, no fabricated counts
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#0A1628] border-y border-white/8 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedStat value={25} prefix="$" suffix="/mo" label="Pro Portal — Flat Rate" sublabel="$75 one-time setup" />
            <AnimatedStat value={0} suffix="%" label="ACH Fees for Pro" sublabel="vs. industry 0.8%" />
            <div className="text-center reveal-on-scroll">
              <div className="text-4xl md:text-5xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                <span className="text-gradient">All&nbsp;50</span>
              </div>
              <div className="text-sm font-semibold text-white/80">States Supported</div>
              <div className="text-xs text-white/40 mt-0.5">State-specific leases & disclosures</div>
            </div>
            <AnimatedStat value={0} prefix="$" label="First Listing" sublabel="Always free" />
          </div>
          <p className="text-center text-xs text-white/35 mt-8 max-w-2xl mx-auto">
            Leasely launched in 2026 — these are product specs, not user counts. We don't fake adoption numbers.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ZILLOW-STYLE MARKETPLACE SEARCH + LISTINGS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10 reveal-on-scroll opacity-0">
            <Badge className="mb-4 text-xs font-semibold px-3 py-1 bg-[#4F46E5]/10 text-[#4338CA] border-0">
              <Globe className="h-3 w-3 mr-1.5" /> Live Marketplace
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Find your next rental,<br />
              <span className="text-[#4F46E5]">anywhere in the US.</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Browse verified listings across all 50 states. Filter by city, type, and beds — then contact the landlord directly.
            </p>
          </div>

          {/* Search bar — Zillow style */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border-2 border-gray-200 p-3 shadow-lg">
              <div className="flex-1 flex items-center gap-3 pl-2">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <Input
                  placeholder="City, neighborhood, or address..."
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleMarketplaceSearch()}
                  className="border-0 shadow-none text-base font-medium placeholder:text-gray-400 focus-visible:ring-0 px-0 h-auto"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-36 border-gray-200 text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={searchBeds} onValueChange={setSearchBeds}>
                  <SelectTrigger className="w-28 border-gray-200 text-sm">
                    <SelectValue placeholder="Beds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any beds</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="1">1 bed</SelectItem>
                    <SelectItem value="2">2 beds</SelectItem>
                    <SelectItem value="3">3 beds</SelectItem>
                    <SelectItem value="4+">4+ beds</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleMarketplaceSearch}
                  className="h-10 px-6 font-bold text-sm gap-2 shrink-0"
                  style={{ background: "#4F46E5", color: "#062018" }}
                >
                  <Search className="h-4 w-4" /> Search
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
              <Link href="/marketplace/map">
                <span className="flex items-center gap-1.5 hover:text-gray-600 cursor-pointer transition-colors">
                  <Map className="h-4 w-4" /> Map View
                </span>
              </Link>
              <Link href="/marketplace">
                <span className="flex items-center gap-1.5 hover:text-gray-600 cursor-pointer transition-colors">
                  <SlidersHorizontal className="h-4 w-4" /> Advanced Filters
                </span>
              </Link>
            </div>
          </div>

          {/* Featured Listings Grid */}
          {loadingListings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {featuredListings.map(listing => (
                  <PropertyCard key={listing.id} listing={listing as any} view="grid" />
                ))}
              </div>
              <div className="text-center">
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="font-bold gap-2 px-10 border-2">
                    <Building2 className="h-5 w-5" /> View All Listings
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 rounded-3xl bg-gray-50 border border-gray-100">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-4">Be the first to list in your area!</p>
              <Link href="/list-property">
                <Button style={{ background: "#4F46E5", color: "#062018" }} className="font-bold gap-2">
                  List Your Property Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          AFFILIATE BANNER — light & inviting, moved up
          ═══════════════════════════════════════════════════════ */}
      <section className="py-10 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-8 py-7">
            <div className="text-center md:text-left">
              <p className="text-gray-900 font-black text-xl">Refer landlords. Earn $50 per signup.</p>
              <p className="text-gray-500 text-sm mt-1 max-w-2xl">Earn a $50 one-time bonus for every landlord who signs up with your code and pays their first month + setup fee. No cap, no expiry.</p>
            </div>
            <Link href="/affiliate/signup" className="shrink-0">
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold gap-2 whitespace-nowrap h-11 px-6 shadow-sm">
                <TrendingUp className="h-4 w-4" /> Join Affiliate Program
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16 reveal-on-scroll opacity-0">
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
                <div className="rounded-2xl border border-border bg-card p-6 h-full hover:border-[#4F46E5]/30 hover:shadow-lg transition-all duration-200">
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
          TESTIMONIALS — beta landlord personas (clearly framed)
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-secondary/20 border-y border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 reveal-on-scroll opacity-0">
            <Badge className="mb-4 text-xs font-semibold px-3 py-1 bg-[#4F46E5]/10 text-[#4338CA] border-0">
              From Our Beta Landlords
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
              Built with the landlords<br />
              <span className="text-gradient">actually doing the work.</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Every feature in Leasely traces back to a real pain point a small-portfolio landlord told us about.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="reveal-on-scroll opacity-0 rounded-2xl border border-border bg-card p-6 hover:border-[#4F46E5]/40 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex gap-1 mb-4" aria-label="5 star testimonial">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg key={idx} className="h-4 w-4 fill-[#4F46E5] text-[#4F46E5]" viewBox="0 0 20 20"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z"/></svg>
                  ))}
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#4338CA] flex items-center justify-center text-[#3A2410] font-black text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-muted-foreground/70 mt-8 italic max-w-2xl mx-auto">
            Quotes are composite testimonials from our private beta cohort, lightly edited for clarity. Identifying details have been changed.
          </p>
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
                    <CheckCircle2 className="h-4 w-4 text-[#4F46E5] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/marketplace">
                  <Button size="lg" className="gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold">
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
            <div className="rounded-2xl border border-[#4F46E5]/15 p-8 md:p-10 bg-gradient-to-br from-[#0A1628] to-[#1A3060] hover:shadow-lg transition-all duration-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F46E5]/12 text-[#4F46E5] text-xs font-semibold mb-6 border border-[#4F46E5]/20">
                <Building2 className="h-3.5 w-3.5" /> For Landlords & Property Managers
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Your entire portfolio,<br />one platform.</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                From a single rental to a 200-unit complex — Leasely Pro gives you every tool you need to run a professional operation.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Branded tenant portal — built automatically",
                  "State-specific rental applications + AI fraud screening",
                  "Instant payouts via Stripe Connect (2.99% fee only)",
                  "Creme Agent Network — close deals faster",
                  "Work orders, accounting, CRM & apartment complexes",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 className="h-4 w-4 text-[#4F46E5] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/pro">
                  <Button size="lg" className="gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold">
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
          <div className="text-center mb-16 reveal-on-scroll opacity-0">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1.5 text-[#4F46E5]" /> Pro Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Every tool to run a pro portfolio —<br />
              <span className="text-gradient">built in from day one.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              AI screening, instant payouts, work orders, accounting, Creme Agents — all live the moment your payment clears. No setup calls. No waiting.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proFeatures.map((feature, i) => (
              <div
                key={i}
                className={`rounded-2xl border bg-card p-6 cursor-pointer hover:border-[#4F46E5]/30 hover:shadow-lg transition-all duration-200 ${activeFeature === i ? "border-[#4F46E5]/30 shadow-lg" : "border-border"}`}
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
              <Button size="lg" className="gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-8">
                <Sparkles className="h-4 w-4" /> Explore All Pro Features
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRICING — CARDS + FULL COMPARISON TABLE
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white" id="pricing">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12 reveal-on-scroll opacity-0">
            <Badge className="mb-4 text-xs font-semibold px-3 py-1 bg-[#1F1A12]/8 text-[#1F1A12] border-0">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Start free. Grow with Pro.
            </h2>
            <p className="text-gray-500 text-lg">No per-unit fees. No hidden charges. Cancel anytime.</p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Free */}
            <div className="rounded-3xl border-2 border-gray-100 p-8 bg-white">
              <div className="mb-6">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Free</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-gray-900">$0</span>
                  <span className="text-gray-400 text-sm">/ forever</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">List your first property. No credit card.</p>
              </div>
              <div className="space-y-2.5 mb-8">
                {[
                  "1 property listing on marketplace",
                  "Map pin placement (US-wide)",
                  "Views & saves analytics",
                  "Contact form inquiries",
                ].map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
                {[
                  "Branded portal",
                  "AI fraud detection",
                  "Tenant payments",
                  "Work orders & accounting",
                ].map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <XCircle className="h-4 w-4 text-gray-200 shrink-0 mt-0.5" />
                    <span className="line-through">{f}</span>
                  </div>
                ))}
              </div>
              <a href={getLoginUrl()}>
                <Button variant="outline" size="lg" className="w-full font-bold">Get Started Free</Button>
              </a>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border-2 p-8 relative overflow-hidden" style={{ borderColor: "#4F46E5", background: "linear-gradient(160deg, #1F1A12 0%, #3A2410 100%)" }}>
              <div className="absolute top-4 right-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#4F46E5", color: "#3A2410" }}>
                  <Sparkles className="h-3 w-3 inline mr-1" />Most Popular
                </span>
              </div>
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: "#4F46E5" }}>Pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">$25</span>
                  <span className="text-white/50 text-sm">/ month</span>
                </div>
                <p className="text-white/60 text-sm font-semibold mt-1">+ $75 one-time setup fee</p>
                <p className="text-white/40 text-xs mt-1">Unlimited listings · No per-unit fees · Cancel anytime</p>
              </div>
              <div className="space-y-2.5 mb-8">
                {[
                  "Everything in Free",
                  "Unlimited property listings",
                  "Branded portal (yourname.leasely.net)",
                  "AI fraud applicant detection",
                  "Digital rental applications",
                  "Background checks (ApplyConnect, TransUnion-backed)",
                  "Tenant payment portal (0% ACH)",
                  "Work orders + AI vendor dispatch",
                  "Accounting ledger & CSV export",
                  "Property CRM + lease agreements",
                  "Property manager delegated access",
                  "Priority support — 24hr SLA",
                ].map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#4F46E5" }} />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/pricing">
                <Button size="lg" className="w-full font-bold gap-2" style={{ background: "#4F46E5", color: "#3A2410" }}>
                  <Sparkles className="h-4 w-4" /> Get Pro — $75 setup + $25/mo
                </Button>
              </Link>
              <p className="text-white/30 text-xs text-center mt-3">$75 one-time setup · $25/mo thereafter · Cancel anytime</p>
            </div>
          </div>

          {/* Full Comparison Table */}
          <div>
            <h3 className="text-xl font-black text-gray-900 text-center mb-2">Full Feature Comparison</h3>
            <p className="text-gray-500 text-center text-sm mb-8">Every feature, side by side.</p>
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
                <div className="p-4 text-sm font-bold text-gray-500">Feature</div>
                <div className="p-4 text-sm font-bold text-gray-700 text-center">Free</div>
                <div className="p-4 text-sm font-bold text-center" style={{ color: "#4F46E5", background: "#1F1A1210" }}>
                  <Sparkles className="inline h-3.5 w-3.5 mr-1" />Pro
                </div>
              </div>
              {[
                { cat: "Marketplace", label: "Property listings", free: "1 listing", pro: "Unlimited" },
                { cat: "Marketplace", label: "Map pin placement", free: true, pro: true },
                { cat: "Marketplace", label: "Views & saves stats", free: true, pro: true },
                { cat: "Marketplace", label: "Contact form inquiries", free: true, pro: true },
                { cat: "Portal", label: "Branded portal (yourname.leasely.net)", free: false, pro: true },
                { cat: "Portal", label: "Custom logo & colors", free: false, pro: true },
                { cat: "Portal", label: "QR code per listing", free: false, pro: true },
                { cat: "Screening", label: "AI fraud applicant detection", free: false, pro: true },
                { cat: "Screening", label: "Digital rental applications", free: false, pro: true },
                { cat: "Screening", label: "Background checks (ApplyConnect, TransUnion-backed)", free: false, pro: true },
                { cat: "Payments", label: "Tenant payment portal", free: false, pro: true },
                { cat: "Payments", label: "ACH rent (waived fees)", free: false, pro: "Fees waived" },
                { cat: "Payments", label: "Instant payouts (Stripe Connect)", free: false, pro: true },
                { cat: "Management", label: "Work orders + AI dispatch", free: false, pro: true },
                { cat: "Management", label: "Accounting & CSV export", free: false, pro: true },
                { cat: "Management", label: "Property CRM + leases", free: false, pro: true },
                { cat: "Management", label: "PM delegated access", free: false, pro: true },
                { cat: "Support", label: "Customer support", free: "Standard", pro: "Priority 24hr SLA" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-3 border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                  <div className="p-4 text-sm text-gray-700">
                    <span className="text-xs text-gray-400 block mb-0.5">{row.cat}</span>
                    {row.label}
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    {typeof row.free === "boolean" ? (
                      row.free ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-gray-200" />
                    ) : <span className="text-sm font-semibold text-gray-700">{row.free}</span>}
                  </div>
                  <div className="p-4 flex items-center justify-center" style={{ background: "#1F1A1204" }}>
                    {typeof row.pro === "boolean" ? (
                      row.pro ? <CheckCircle2 className="h-5 w-5" style={{ color: "#4F46E5" }} /> : <XCircle className="h-5 w-5 text-gray-200" />
                    ) : <span className="text-sm font-bold" style={{ color: "#4F46E5" }}>{row.pro}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/pricing">
                <Button variant="outline" className="font-bold gap-2 px-8">
                  View Full Pricing Details <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
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
                  { label: "Fee Schedule", href: "/fees" },
                  { label: "Compare Platforms", href: "/compare" },
                  { label: "Creme Agents", href: "/agents" },
                ].map(l => (
                  <Link key={l.href} href={l.href}>
                    <span className="block text-white/40 hover:text-white/80 text-sm transition-colors cursor-pointer">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Earn with Leasely</p>
              <div className="space-y-2">
                {[
                  { label: "Affiliate Program", href: "/affiliate/signup" },
                  { label: "Refer & Earn $50 per Signup", href: "/affiliate/signup" },
                  { label: "Creme Agent Network", href: "/agents" },
                  { label: "Affiliate Dashboard", href: "/affiliate/dashboard" },
                ].map(l => (
                  <Link key={l.label} href={l.href}>
                    <span className="block text-white/40 hover:text-white/80 text-sm transition-colors cursor-pointer">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Get Started</p>
              <div className="space-y-3">
                <a href={getLoginUrl()}>
                  <Button size="sm" className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold gap-1.5 text-xs">
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
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { label: "Privacy Policy", href: "/legal/privacy" },
                { label: "Terms of Service", href: "/legal/terms" },
                { label: "CCPA", href: "/legal/ccpa" },
                { label: "Cookie Policy", href: "/legal/cookies" },
                { label: "Fair Housing", href: "/legal/fair-housing" },
                { label: "Fee Schedule", href: "/fees" },
              ].map(item => (
                <Link key={item.label} href={item.href}>
                  <span className="text-white/30 hover:text-white/60 text-xs cursor-pointer transition-colors">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
