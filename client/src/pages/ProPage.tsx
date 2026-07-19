import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import {
  Globe, CreditCard, Shield, Wrench, BarChart3, Users, QrCode, Building2,
  Zap, CheckCircle2, ArrowRight, Play, Star, DollarSign,
  FileText, Bell, TrendingUp, Sparkles, Award, Lock, ChevronRight,
  MapPin, Home as HomeIcon, X, ExternalLink, Package, ArrowLeft,
} from "lucide-react";

const BRAND = "#0F1F4B";
const TEAL = "#4F46E5";

// ─── Animated Counter ───────────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const increment = end / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 35);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Video Modal ─────────────────────────────────────────────────────────────
const DEMO_SLIDES = [
  {
    title: "Your Branded Portal",
    desc: "Your logo, your colors, your listings — at yourname.keycove.net",
    badge: "Branded Portal",
    color: TEAL,
    icon: Globe,
  },
  {
    title: "AI Fraud Detection",
    desc: "Every applicant screened automatically — fake employers and inflated income flagged instantly",
    badge: "AI Screening",
    color: "#6366F1",
    icon: Shield,
  },
  {
    title: "Tax-Ready Accounting",
    desc: "IRS Schedule E categories built in. Export CSV at tax time — no spreadsheet chaos",
    badge: "Accounting",
    color: "#10B981",
    icon: BarChart3,
  },
];

function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!open) return;
    setSlide(0);
    const t = setInterval(() => setSlide(s => (s + 1) % DEMO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;
  const current = DEMO_SLIDES[slide];
  const CurrentIcon = current.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-gray-900" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <X className="w-5 h-5" />
        </button>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10" style={{ background: BRAND }}>
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-teal-300 text-xs font-semibold">Keycove Pro™ — Platform Demo</span>
          </div>
          <div className="ml-auto flex gap-1.5">
            {DEMO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === slide ? 'bg-teal-400 w-6' : 'bg-white/25 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
        {/* Screenshot */}
        <div className="relative">
          {/* On-brand mockup (replaces old product screenshots) — a browser
              frame themed to the current feature, so no external imagery. */}
          <div key={slide} className="w-full flex items-center justify-center px-6 py-10" style={{ minHeight: 380, maxHeight: '60vh', background: 'linear-gradient(135deg,#0F1F4B 0%,#1B2B5E 100%)' }}>
            <div className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl bg-white">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200">
                <div className="flex gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
                <div className="flex-1 mx-2 bg-white rounded px-2 py-1 text-[11px] text-gray-400 font-mono border border-gray-200">app.keycove.net</div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${current.color}1a`, color: current.color }}>
                    <CurrentIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-gray-900 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>{current.title}</div>
                    <div className="text-xs text-gray-400">{current.badge}</div>
                  </div>
                  <div className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${current.color}14`, color: current.color }}>Keycove Pro</div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[0,1,2].map(i => (
                    <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <div className="h-2 w-10 rounded-full bg-gray-200 mb-2" />
                      <div className="h-4 w-14 rounded" style={{ background: `${current.color}33` }} />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5">
                      <div className="w-8 h-8 rounded-full" style={{ background: `${current.color}22` }} />
                      <div className="flex-1"><div className="h-2.5 w-1/3 rounded-full bg-gray-200 mb-1.5" /><div className="h-2 w-1/2 rounded-full bg-gray-100" /></div>
                      <div className="h-6 w-16 rounded-md" style={{ background: `${current.color}18` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Overlay caption */}
          <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(15,31,75,0.95) 0%, transparent 100%)' }}>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-2" style={{ background: `${current.color}25`, color: current.color }}>
              <CurrentIcon className="w-3.5 h-3.5" />{current.badge}
            </div>
            <div className="text-white font-black text-xl mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{current.title}</div>
            <div className="text-white/60 text-sm">{current.desc}</div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: BRAND }}>
          <div className="text-white/40 text-sm">{slide + 1} of {DEMO_SLIDES.length} features</div>
          <div className="flex gap-3">
            <button onClick={() => setSlide(s => (s - 1 + DEMO_SLIDES.length) % DEMO_SLIDES.length)}
              className="px-4 py-2 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-colors">
              ← Prev
            </button>
            <button onClick={() => setSlide(s => (s + 1) % DEMO_SLIDES.length)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-colors" style={{ background: TEAL, color: '#3A2410' }}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Deep-Dive Cards ─────────────────────────────────────────────────
const FEATURES = [
  {
    id: "portal",
    icon: Globe,
    color: TEAL,
    badge: "Branded Portal",
    title: "Your Own Real Estate Website",
    subtitle: "yourname.keycove.net",
    desc: "Get a fully branded portal that looks like a $10,000 custom website — in minutes. Your logo, your colors, your tagline. Share it on Google, Instagram, business cards, or anywhere you market your properties.",
    bullets: [
      "Custom subdomain (yourname.keycove.net)",
      "Upload your logo and set brand colors",
      "All your listings displayed beautifully",
      "Tenants apply directly through your portal",
      "Shareable link for Google Ads & social media",
    ],
    mock: (
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #0F1F4B 0%, #1B2B5E 100%)" }}>
        <div className="flex items-center gap-2 px-4 py-3 bg-black/20 border-b border-white/10">
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400/70"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70"/><div className="w-2.5 h-2.5 rounded-full bg-green-400/70"/></div>
          <div className="flex-1 mx-3 bg-white/10 rounded-full px-3 py-1 text-xs text-white/50 font-mono">sunrise.keycove.net</div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-[#3A2410]" style={{ background: TEAL }}>SR</div>
            <div><div className="text-white font-bold text-sm">Sunrise Realty LLC</div><div className="text-white/40 text-xs">Premium Rentals · Atlanta, GA</div></div>
            <Badge className="ml-auto bg-teal-500/20 text-teal-300 border-0 text-xs">Pro</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {["Modern 2BR · $1,850/mo","Cozy Studio · $1,200/mo","3BR House · $2,400/mo","Co-Living · $850/mo"].map((n,i)=>(
              <div key={i} className="bg-white/8 border border-white/10 rounded-xl p-2.5">
                <div className="w-full h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-blue-500/20 mb-2 flex items-center justify-center"><HomeIcon className="w-3.5 h-3.5 text-teal-400/60"/></div>
                <div className="text-white/70 text-xs">{n}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg py-2 text-center text-xs font-bold text-[#3A2410]" style={{ background: TEAL }}>Apply Now</div>
            <div className="flex-1 bg-white/10 rounded-lg py-2 text-center text-xs text-white/60">Contact</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "payouts",
    icon: CreditCard,
    color: "#4F46E5",
    badge: "Instant Payouts",
    title: "Get Paid the Same Day",
    subtitle: "Waived ACH fees for Pro",
    desc: "Tenants pay rent through your portal via ACH (free) or card. With instant payouts, funds hit your bank account in seconds — not 3 business days. Pro subscribers pay zero ACH fees.",
    bullets: [
      "Instant bank transfer (seconds, not days)",
      "Zero ACH fees for Pro subscribers",
      "Tenants pay via ACH or card",
      "Automatic rent reminders to tenants",
      "Full payment history & receipts",
    ],
    mock: (
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4"><div className="text-white font-bold text-sm">Rent Dashboard</div><Badge className="bg-green-500/20 text-green-400 border-0 text-xs">● Live</Badge></div>
          <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10">
            <div className="text-white/40 text-xs mb-0.5">This Month</div>
            <div className="text-2xl font-black text-white" style={{ fontFamily:'Outfit,sans-serif' }}>$12,450</div>
            <div className="flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3 text-teal-400"/><span className="text-teal-400 text-xs">+8.2%</span></div>
          </div>
          {[{ n:"Marcus T.", a:"$1,850", s:"Paid", c:"text-green-400" },{ n:"Sarah K.", a:"$2,200", s:"Paid", c:"text-green-400" },{ n:"David R.", a:"$1,600", s:"Pending", c:"text-yellow-400" }].map((t,i)=>(
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold">{t.n[0]}</div><div className="text-white/70 text-xs">{t.n}</div></div>
              <div className="text-right"><div className="text-white/80 text-xs font-bold">{t.a}</div><div className={`text-xs ${t.c}`}>{t.s}</div></div>
            </div>
          ))}
          <div className="mt-3 bg-teal-500/15 border border-teal-500/30 rounded-xl p-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-400 shrink-0"/>
            <div className="flex-1"><div className="text-teal-300 text-xs font-bold">Instant Payout Available</div><div className="text-white/40 text-xs">$8,600 · hits bank in seconds</div></div>
            <div className="rounded-lg px-3 py-1 text-xs font-bold text-[#3A2410]" style={{ background: TEAL }}>Pay Out</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "screening",
    icon: Shield,
    color: "#6366F1",
    badge: "AI Fraud Detection",
    title: "Stop Bad Applicants Automatically",
    subtitle: "AI fraud applicant detection",
    desc: "Our AI scans every rental application for fake employers, inflated income, suspicious documents, and known fraud patterns. High-risk applicants are flagged instantly — before you waste time on a showing.",
    bullets: [
      "AI fraud applicant detection on every application",
      "Employer verification against business registries",
      "Income inconsistency analysis",
      "Document authenticity scanning",
      "Risk score with detailed explanation",
    ],
    mock: (
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-indigo-400"/><div className="text-white font-bold text-sm">AI Screening</div></div>
          {[{ n:"Jennifer M.", s:94, r:"Low Risk", c:"text-green-400", bg:"bg-green-500/15", b:"border-green-500/30" },{ n:"Robert K.", s:41, r:"High Risk", c:"text-red-400", bg:"bg-red-500/15", b:"border-red-500/30" },{ n:"Aisha T.", s:78, r:"Medium", c:"text-yellow-400", bg:"bg-yellow-500/15", b:"border-yellow-500/30" }].map((a,i)=>(
            <div key={i} className={`rounded-xl p-3 mb-2 border ${a.bg} ${a.b}`}>
              <div className="flex items-center justify-between mb-1.5"><div className="text-white/80 text-xs font-medium">{a.n}</div><Badge className={`${a.bg} ${a.c} border-0 text-xs`}>{a.r}</Badge></div>
              <div className="flex items-center gap-2"><div className="flex-1 bg-white/10 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width:`${a.s}%`, background:a.s>70?'#10B981':a.s>50?'#F59E0B':'#EF4444' }}/></div><span className={`text-xs font-bold ${a.c}`}>{a.s}</span></div>
            </div>
          ))}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mt-1">
            <div className="text-indigo-300 text-xs font-bold mb-1">⚠ AI Flag: Robert K.</div>
            <div className="text-white/40 text-xs">Employer not found in business registry. Income inconsistency detected.</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "maintenance",
    icon: Wrench,
    color: "#EF4444",
    badge: "Work Orders",
    title: "Maintenance on Autopilot",
    subtitle: "AI bot + vendor dispatch",
    desc: "A tenant submits a work order. Our AI bot confirms receipt and texts your vendor. No vendor for the area? We research and email one automatically. You get notified when they respond — then you call to confirm pricing.",
    bullets: [
      "AI bot confirms work order receipt",
      "Auto-dispatches saved vendors via text/email",
      "Finds new vendors if none on file",
      "Notifies you when vendor responds",
      "Full work order history per property",
    ],
    mock: (
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4"><Wrench className="w-4 h-4 text-red-400"/><div className="text-white font-bold text-sm">Work Orders</div></div>
          {[{ t:"HVAC not cooling", u:"Unit 2B", s:"Dispatched", v:"CoolAir HVAC", c:"text-blue-400", d:"bg-blue-400" },{ t:"Leaking faucet", u:"Unit 4A", s:"In Progress", v:"Mike's Plumbing", c:"text-yellow-400", d:"bg-yellow-400" },{ t:"Broken window", u:"Unit 1C", s:"Completed", v:"Glass Pro", c:"text-green-400", d:"bg-green-400" }].map((w,i)=>(
            <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-white/5 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${w.d}`}/>
              <div className="flex-1 min-w-0"><div className="text-white/80 text-xs font-medium truncate">{w.t}</div><div className="text-white/35 text-xs">{w.u} · {w.v}</div></div>
              <div className={`text-xs font-medium shrink-0 ${w.c}`}>{w.s}</div>
            </div>
          ))}
          <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles className="w-3 h-3 text-teal-400"/><span className="text-teal-300 text-xs font-bold">AI Auto-Dispatched</span></div>
            <div className="text-white/40 text-xs">Found "Atlanta Plumbing Co" (4.8★). Email sent. Awaiting confirmation.</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "accounting",
    icon: BarChart3,
    color: "#10B981",
    badge: "Accounting",
    title: "Tax-Ready Books, Always",
    subtitle: "IRS Schedule E categories",
    desc: "Track every dollar of income and expense across all your properties with IRS Schedule E categories built in. Export a clean CSV at tax time and hand it straight to your accountant. No spreadsheet chaos.",
    bullets: [
      "Income & expense tracking per property",
      "IRS Schedule E categories built in",
      "CSV export for your accountant",
      "Profit & loss summary dashboard",
      "Year-over-year comparison",
    ],
    mock: (
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-emerald-400"/><div className="text-white font-bold text-sm">Accounting</div></div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3"><div className="text-green-400/60 text-xs mb-0.5">Income</div><div className="text-green-400 font-black text-lg" style={{ fontFamily:'Outfit,sans-serif' }}>$48,200</div><div className="text-green-400/40 text-xs">YTD</div></div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><div className="text-red-400/60 text-xs mb-0.5">Expenses</div><div className="text-red-400 font-black text-lg" style={{ fontFamily:'Outfit,sans-serif' }}>$12,840</div><div className="text-red-400/40 text-xs">YTD</div></div>
          </div>
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 mb-3"><div className="text-teal-400/60 text-xs mb-0.5">Net Profit</div><div className="text-teal-400 font-black text-xl" style={{ fontFamily:'Outfit,sans-serif' }}>$35,360</div></div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 text-center text-xs text-white/50 flex items-center justify-center gap-1"><FileText className="w-3 h-3"/>Export CSV</div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 text-center text-xs text-white/50 flex items-center justify-center gap-1"><FileText className="w-3 h-3"/>Schedule E</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "crm",
    icon: Users,
    color: "#8B5CF6",
    badge: "Property CRM",
    title: "Your Portfolio. Organized.",
    subtitle: "Units, tenants, leases, notes",
    desc: "Keep every property, unit, tenant, and lease in one organized database. Get renewal alerts 60 days before leases expire. Add notes per tenant. See your full portfolio at a glance — like a CRM built for landlords.",
    bullets: [
      "Property & unit database",
      "Tenant profiles with contact info",
      "Lease tracking with renewal alerts",
      "Notes per tenant or property",
      "Occupancy rate at a glance",
    ],
    mock: (
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-purple-400"/><div className="text-white font-bold text-sm">Property CRM</div></div>
          {[{ a:"123 Maple St", u:4, o:4, r:"$6,800/mo", alert:false },{ a:"456 Oak Ave", u:2, o:1, r:"$3,200/mo", alert:true },{ a:"789 Pine Rd", u:6, o:5, r:"$9,600/mo", alert:false }].map((p,i)=>(
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 mb-2">
              <div className="flex items-center justify-between mb-1"><div className="text-white/80 text-xs font-medium">{p.a}</div><div className="text-teal-400 text-xs font-bold">{p.r}</div></div>
              <div className="flex items-center gap-2 text-xs text-white/35"><span>{p.o}/{p.u} occupied</span><div className="flex gap-0.5">{Array.from({length:p.u}).map((_,j)=><div key={j} className={`w-1.5 h-1.5 rounded-full ${j<p.o?'bg-teal-400':'bg-white/20'}`}/>)}</div></div>
              {p.alert && <div className="mt-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2 py-1 text-yellow-400 text-xs">⚠ Lease expiring in 45 days</div>}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "qr",
    icon: QrCode,
    color: "#4F46E5",
    badge: "QR Codes",
    title: "Two QR Codes. Zero Friction.",
    subtitle: "Portfolio QR + Listing QR",
    desc: "Every Pro subscriber gets two types of QR codes. Your Portfolio QR links to your branded portal showing all your listings — perfect for business cards, yard signs, and social media. Your Listing QR links directly to the application form for a specific unit — scan it on the door and apply on the spot.",
    bullets: [
      "Portfolio QR → yourname.keycove.net (all listings)",
      "Listing QR → /apply/:id (direct application form)",
      "Printable for for-rent signs, doors, and flyers",
      "Tenants scan and apply from their phone in minutes",
      "Works with any smartphone camera, no app needed",
    ],
    mock: (
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div className="p-5 text-center">
          <div className="flex items-center gap-2 mb-4 justify-center"><QrCode className="w-4 h-4 text-yellow-400"/><div className="text-white font-bold text-sm">Property QR Code</div></div>
          <div className="inline-block bg-white rounded-2xl p-4 mb-4 shadow-xl">
            <div className="w-32 h-32 grid grid-cols-8 gap-0.5">
              {Array.from({length:64}).map((_,i)=>(
                <div key={i} className={`rounded-sm ${[0,1,7,8,14,15,16,23,48,49,55,56,62,63,24,31,32,39,40,47,3,4,5,11,12,13,19,20,21,27,28,29,35,36,37,43,44,45,51,52,53].includes(i)?'bg-gray-900':'bg-white'}`}/>
              ))}
            </div>
          </div>
          <div className="text-white/60 text-sm font-medium mb-1">123 Maple St, Unit 2B</div>
          <div className="text-white/35 text-xs mb-4">Scan to view listing & apply</div>
          <div className="flex gap-2 justify-center">
            <div className="rounded-lg px-4 py-2 text-xs font-bold text-[#3A2410]" style={{ background: TEAL }}>Download PNG</div>
            <div className="bg-white/10 rounded-lg px-4 py-2 text-xs text-white/60">Print Flyer</div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function ProPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Back-nav target: prefer ?from= (deep-linked from a feature gate), then
  // browser history (came from inside the app), then dashboard as the final
  // fallback. We avoid the public home screen — landlords on the Pro page
  // almost always came from inside the product.
  const handleBack = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (from && from.startsWith("/")) {
      navigate(from);
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate(isAuthenticated ? "/dashboard" : "/");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />

      {/* Sticky back button — returns to the screen the user came from (e.g. a
          Pro-gated feature page) instead of dumping them on the marketing home. */}
      <button
        onClick={handleBack}
        className="fixed top-20 left-4 z-40 flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-semibold px-3 py-1.5 hover:bg-white/20 transition"
        aria-label="Go back"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-bg min-h-[92vh] flex items-center relative">
        <div className="absolute top-1/2 right-0 w-[700px] h-[700px] rounded-full opacity-[0.05] border border-teal-400 pointer-events-none" style={{ transform: 'translate(35%, -50%)' }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07] border border-teal-400 pointer-events-none" style={{ transform: 'translate(35%, -50%)' }} />

        <div className="container relative z-10 py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Free package badge — the hook */}
            <div className="inline-flex items-center gap-2.5 bg-amber-500/15 border border-amber-500/30 rounded-full px-5 py-2.5 mb-8">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-300 text-sm font-bold">Setup includes a $299 website + logo + domain — free with Pro</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-white mb-5" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
              Get fully set up on Keycove.<br /><span className="text-gradient">Just $25.</span>
            </h1>

            <p className="text-xl text-white/60 mb-4 max-w-2xl mx-auto leading-relaxed">
              A one-time <strong className="text-white">$25 setup</strong> gets your whole rental operation live — listings, applications, leases, rent collection & accounting.
              It even includes a <strong className="text-white">free professional website, custom logo, and Year 1 domain & hosting</strong> built by Certify Business Pro. Then just $25/month.
            </p>

            {/* ROI proof */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 mb-10">
              <TrendingUp className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-white/70 text-sm">One filled vacancy pays for <strong className="text-white">2 years of Pro</strong> · One avoided eviction saves <strong className="text-white">$3,500+</strong></span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <a href={isAuthenticated ? "/pricing" : `${getLoginUrl()}?next=/pricing`}>
                <Button size="lg" className="btn-teal font-black px-10 py-4 text-base gap-2">
                  <Sparkles className="w-5 h-5" /> Get fully set up — $25 + $25/mo
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-bold px-10 py-4 text-base gap-2"
                onClick={() => setVideoOpen(true)}
              >
                <Play className="w-5 h-5 fill-white" /> Watch Demo
              </Button>
            </div>

            {/* Billing clarity — not a free trial */}
            <p className="text-white/70 text-sm font-medium mb-6">
              Everything unlocks today — your first <strong className="text-white">$25/mo</strong> starts in 30 days.
            </p>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-white/40 text-sm">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400"/><span className="text-white/60 font-medium">24–48 hour delivery</span></div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400"/><span>Cancel anytime</span></div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400"/><span>0% ACH fees</span></div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400"/><span>No contracts</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FREE PACKAGE CALLOUT
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> Included Free · $299 Value
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-700/80 mb-4 pl-1">
                  <span className="font-semibold">Brand Kit by</span>
                  <a href="https://certifybusinesspro.com" target="_blank" rel="noopener" className="font-bold text-amber-700 hover:underline">Certify Business Pro</a>
                  <span className="text-amber-600/60">— Keycove's official design partner</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Your free website, logo & domain
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Every Pro member gets a complete online presence package — designed and delivered by
                  <a href="https://certifybusinesspro.com" target="_blank" rel="noopener" className="text-amber-600 font-semibold hover:underline"> Certify Business Pro</a>.
                  Delivered in 24–48 hours.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    "Professional website — delivered in 24 hours",
                    "1 custom logo + 3 rounds of revisions",
                    "Final logo files (all formats)",
                    "Year 1 domain & hosting included",
                    "DNS + SSL + uptime monitoring",
                    "Mobile-responsive + SEO optimized",
                    "Contact form + social media links",
                    "$37/yr domain renewal after year 1",
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-sm text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="shrink-0 w-full md:w-72 rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-lg text-center">
                <div className="text-4xl font-black text-amber-500 mb-1">$299</div>
                <div className="text-sm text-gray-500 mb-4 line-through">+ $37/yr domain renewal</div>
                <div className="text-2xl font-black text-green-600 mb-1">FREE</div>
                <div className="text-xs text-gray-400 mb-5">with every Keycove Pro subscription</div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                  <p className="text-xs text-amber-700 font-semibold">You receive a unique one-time redemption code after signup — use it on certifybusinesspro.com</p>
                </div>
                <a href={isAuthenticated ? "/pricing" : `${getLoginUrl()}?next=/pricing`}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold">
                    Claim Mine — $25 Setup
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ROI CALCULATOR
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Does Pro pay for itself?</h2>
            <p className="text-gray-500 mb-10">Almost always in the first 30 days.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { scenario: "1 vacancy filled faster", saving: "$1,300", desc: "Avg landlord loses $1,300/mo per vacant unit. Pro listings convert faster.", color: "#4F46E5" },
                { scenario: "1 bad tenant avoided", saving: "$3,500", desc: "Average eviction costs $3,500 in legal fees + lost rent. AI screening prevents this.", color: "#6366F1" },
                { scenario: "Hours saved monthly", saving: "8 hrs", desc: "Automated rent collection, work orders, and accounting saves ~8 hours/month.", color: "#4F46E5" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 p-6 text-center">
                  <div className="text-3xl font-black mb-1" style={{ color: item.color }}>{item.saving}</div>
                  <div className="font-bold text-gray-900 text-sm mb-2">{item.scenario}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-100 p-6 inline-block w-full">
              <p className="text-gray-700 font-semibold">
                Pro costs <strong>$25 setup + $25/mo</strong>.
                One avoided vacancy or bad tenant returns <strong className="text-green-600">52× to 140×</strong> your investment.
              </p>
              <p className="text-gray-400 text-xs mt-1">Plus you get a $299 free website. It's not even close.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GUARANTEE BADGE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-green-50 border-b border-green-100">
        <div className="container">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center shrink-0">
              <Shield className="w-9 h-9 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">No Contracts. Cancel Anytime.</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your $25/mo Pro subscription is cancellable anytime — no questions, no pro-rated refunds.
                Setup fee is non-refundable once design work begins (work starts immediately after payment).
                You keep your website, logo, and domain regardless of subscription status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "$0", label: "First Listing Free", sub: "No credit card needed", icon: Building2, color: "#4F46E5" },
              { value: "0%", label: "ACH Fees for Pro", sub: "Tenants pay at no cost", icon: DollarSign, color: "#4F46E5" },
              { value: "∞", label: "Listings Allowed", sub: "Unlimited on Pro plan", icon: Globe, color: "#6366F1" },
              { value: "$25", label: "Per Month", sub: "Cancel anytime", icon: Star, color: "#10B981" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${s.color}15` }}>
                  <s.icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: BRAND, fontFamily: "'Outfit', sans-serif" }}>
                  {s.value}{i === 3 ? "/mo" : ""}
                </div>
                <div className="text-gray-700 text-sm font-semibold">{s.label}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE FEATURE DEMO
      ═══════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ background: "linear-gradient(180deg, #F8FAFB 0%, #EEF2F7 100%)" }}>
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
              <Play className="w-3.5 h-3.5" /> Interactive Demo
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
              See Every Pro Feature<br />in Action
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Click any feature to see a live preview of your Pro portal</p>
          </div>

          {/* Feature tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {FEATURES.map((f, i) => (
              <button key={f.id} onClick={() => setActiveFeature(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeFeature === i
                    ? "text-white shadow-lg"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={activeFeature === i ? { background: BRAND } : undefined}
              >
                <f.icon className="w-4 h-4" style={{ color: activeFeature === i ? "white" : f.color }} />
                {f.badge}
              </button>
            ))}
          </div>

          {/* Feature detail */}
          <div key={activeFeature} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up">
            <div>
              {(() => { const ActiveIcon = FEATURES[activeFeature].icon; return (
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-5"
                style={{ background: `${FEATURES[activeFeature].color}15`, color: FEATURES[activeFeature].color }}>
                <ActiveIcon className="w-4 h-4" />
                {FEATURES[activeFeature].badge}
              </div>
              ); })()}
              <h3 className="text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {FEATURES[activeFeature].title}
              </h3>
              <p className="text-lg font-semibold mb-4" style={{ color: FEATURES[activeFeature].color }}>
                {FEATURES[activeFeature].subtitle}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg">{FEATURES[activeFeature].desc}</p>
              <div className="space-y-3 mb-8">
                {FEATURES[activeFeature].bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${FEATURES[activeFeature].color}20` }}>
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: FEATURES[activeFeature].color }} />
                    </div>
                    <span className="text-gray-700 font-medium">{b}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <a href={isAuthenticated ? "/pricing" : `${getLoginUrl()}?next=/pricing`}>
                  <Button size="lg" className="font-bold gap-2" style={{ background: BRAND, color: "white" }}>
                    Get This Feature <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
                <Button size="lg" variant="outline" className="font-bold gap-2 border-gray-200" onClick={() => setVideoOpen(true)}>
                  <Play className="w-4 h-4" /> Watch Demo
                </Button>
              </div>
            </div>
            <div className="lg:pl-4">
              {FEATURES[activeFeature].mock}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VIDEO DEMO CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="section-padding pro-bg relative">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-5xl font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
                See the Full Portal<br /><span className="text-gradient">in 3 Minutes</span>
              </h2>
              <p className="text-white/50 text-xl">Watch a complete walkthrough of every Pro feature — from branded portal to instant payouts</p>
            </div>

            {/* Video thumbnail — warm-amber gradient, lighter than before */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group" onClick={() => setVideoOpen(true)}>
              <div className="aspect-video bg-gradient-to-br from-[#2C2418] via-[#3A2A14] to-[#1F1A12] flex items-center justify-center relative">
                {/* Subtle radial highlight to keep the placeholder from feeling muddy */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.18),transparent_65%)] pointer-events-none" />
                {/* Background portal mockup */}
                <div className="absolute inset-0 opacity-30">
                  <div className="grid grid-cols-3 gap-4 p-8 h-full">
                    {FEATURES.slice(0, 6).map((f, i) => (
                      <div key={i} className="bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                        <f.icon className="w-8 h-8" style={{ color: f.color }} />
                        <div className="text-white/60 text-xs font-medium text-center">{f.badge}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Play button */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 duration-300"
                    style={{ background: TEAL }}>
                    <Play className="w-10 h-10 text-[#3A2410] fill-[#3A2410] ml-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-black text-2xl mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Watch Full Demo</div>
                    <div className="text-white/50 text-sm">3 min · All Pro features · No signup required</div>
                  </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/35 text-sm">
              {["Branded Portal","Instant Payouts","AI Fraud Detection","Work Orders","Accounting","Property CRM","QR Codes","Tenant Portal"].map(f => (
                <div key={f} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400"/>{f}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          REAL STORIES
      ═══════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: "rgba(79,70,229,0.15)", color: "#4F46E5", border: "1px solid rgba(79,70,229,0.3)" }}>
              Real Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Built from experience, not guesswork</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Card 1 — AI Fraud Detection */}
            <div className="rounded-2xl p-6 flex flex-col" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#4F46E5" }} />)}
              </div>
              <p className="text-white/80 text-sm leading-relaxed flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                &ldquo;I caught a fraudulent applicant using Keycove&apos;s AI fraud detector. It flagged a fake pay stub, a fabricated employer address, a disconnected phone number, and a virtual office address &mdash; all in seconds. That one catch alone was worth more than a year of the subscription.&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: "linear-gradient(135deg, #1B2B5E, #4F46E5)", color: "white" }}>C</div>
                <div>
                  <div className="font-bold text-white text-sm">Chad</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Property Manager &amp; Keycove Founder</div>
                </div>
                <div className="ml-auto">
                  <Shield className="w-4 h-4" style={{ color: "#6366F1" }} />
                </div>
              </div>
            </div>
            {/* Card 2 — Branded Subdomain */}
            <div className="rounded-2xl p-6 flex flex-col" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#4F46E5" }} />)}
              </div>
              <p className="text-white/80 text-sm leading-relaxed flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                &ldquo;Having my own branded portal at my name dot leasely dot net changed how tenants see me. I went from sharing random links to sending people to a professional website that looks like I spent thousands building it. My inquiry rate doubled the first week.&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: "linear-gradient(135deg, #1B2B5E, #4F46E5)", color: "white" }}>C</div>
                <div>
                  <div className="font-bold text-white text-sm">Chad</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Property Manager &amp; Keycove Founder</div>
                </div>
                <div className="ml-auto">
                  <Globe className="w-4 h-4" style={{ color: TEAL }} />
                </div>
              </div>
            </div>
            {/* Card 3 — Instant Payouts */}
            <div className="rounded-2xl p-6 flex flex-col" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#4F46E5" }} />)}
              </div>
              <p className="text-white/80 text-sm leading-relaxed flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                &ldquo;Instant payouts are a game changer. Rent hits my bank account the same day it&apos;s paid &mdash; no waiting 3 business days, no chasing. And with zero ACH fees on Pro, I&apos;m keeping every dollar my tenants send me. It pays for itself every single month.&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: "linear-gradient(135deg, #1B2B5E, #4F46E5)", color: "white" }}>C</div>
                <div>
                  <div className="font-bold text-white text-sm">Chad</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Property Manager &amp; Keycove Founder</div>
                </div>
                <div className="ml-auto">
                  <Zap className="w-4 h-4" style={{ color: "#4F46E5" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ background: "linear-gradient(180deg, #F8FAFB 0%, #EEF2F7 100%)" }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>$25 Setup + $25.00/Month</h2>
            <p className="text-gray-500 mt-2 text-lg">One-time setup fee (website, logo & URL), then $25/month. No contracts. Cancel anytime.</p>
          </div>
          <div className="max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl" style={{ background: BRAND }}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-white/60 text-sm font-medium mb-1">Keycove Pro™</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white" style={{ fontFamily:'Outfit,sans-serif' }}>$25.00</span>
                    <span className="text-white/40">/month</span>
                  </div>
                  <div className="text-sm font-semibold mt-1" style={{ color: '#4F46E5' }}>+ $25 one-time setup fee</div>
                </div>
                <Badge className="bg-teal-500 text-[#3A2410] font-bold border-0">Most Popular</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {[
                  "Branded portal + subdomain",
                  "AI fraud applicant detection",
                  "Instant bank payouts",
                  "Waived ACH fees",
                  "Unlimited listings",
                  "Work order AI dispatch",
                  "Accounting & tax export",
                  "Property CRM",
                  "QR codes per listing",
                  "Tenant payment portal",
                  "Priority 24hr support",
                  "Everything in Free tier",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/75">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />{f}
                  </div>
                ))}
              </div>
              <a href={isAuthenticated ? "/pricing" : `${getLoginUrl()}?next=/pricing`} className="block">
                <Button size="lg" className="w-full btn-teal font-black text-base py-4 gap-2">
                  <Sparkles className="w-5 h-5" /> Start Pro — $25 setup + $25/mo
                </Button>
              </a>
              <p className="text-center text-white/30 text-sm mt-4">$25 one-time setup (website, logo & URL) · then $25/mo · Cancel anytime</p>
              <p className="text-center text-white/25 text-xs mt-2 leading-relaxed">
                Setup fee non-refundable once design begins (work starts immediately, delivered in 24–48 hours).
                Subscription cancellable anytime. <Link href="/terms" className="underline hover:text-white/50">Terms</Link>.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button variant="ghost" className="text-gray-500 font-medium gap-1">
                Compare all plans <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 hero-bg relative">
        <div className="container relative z-10 text-center">
          <h2 className="text-5xl font-black text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
            Ready to Build Your<br /><span className="text-gradient">Rental Empire?</span>
          </h2>
          <p className="text-white/50 text-xl max-w-xl mx-auto mb-10">
            Be among the first Pro landlords to run their rental business under their own brand with Keycove.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={isAuthenticated ? "/pricing" : `${getLoginUrl()}?next=/pricing`}>
              <Button size="lg" className="btn-teal font-black px-12 py-4 text-base gap-2">
                <Sparkles className="w-5 h-5" /> Start Pro Today
              </Button>
            </a>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold px-12 py-4 text-base gap-2" onClick={() => setVideoOpen(true)}>
              <Play className="w-5 h-5 fill-white" /> Watch Demo First
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
