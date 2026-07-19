import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
  BookOpen, Rocket, Calendar, DollarSign, Building2, FileDown,
  AlertTriangle, ShieldOff, CheckCircle2, ChevronRight, Sparkles,
  ArrowRight, Search, DoorOpen, Upload, FileSignature, Link2,
} from "lucide-react";

const ACCENT = "#4F46E5";

type Section = {
  id: string;
  title: string;
  icon: any;
  intro?: string;
  body: React.ReactNode;
};

/**
 * In-app Pro user guide. Source of truth for the same content lives in
 * docs/sops/pro-member.md — keep the two in rough sync. The in-app version
 * is what landlords actually read; the markdown file is the canonical SOP.
 */
export default function ProGuide() {
  const [active, setActive] = useState("setup");
  const [search, setSearch] = useState("");
  // Only the "setup" section is open by default — keeps the page calm.
  const [openId, setOpenId] = useState<string | null>("setup");

  const sections = useMemo<Section[]>(() => [
    {
      id: "welcome",
      title: "What Pro gets you",
      icon: Sparkles,
      intro: "Your $25 setup + $25/month unlocks everything below.",
      body: (
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {[
            ["Branded portal", "yourname.keycove.net"],
            ["Unlimited listings", "First one is free even without Pro"],
            ["Stripe instant payouts", "Next business day, automatic"],
            ["AI applicant screening", "Risk score + flagged anomalies"],
            ["State-specific leases", "E-sign + first-month + deposit collection"],
            ["Bulk migration import", "Move a whole portfolio + leases in one upload"],
            ["Apartments & co-living", "Rent by the unit (4B) or by the room (Room 1)"],
            ["Work-order dispatch", "Vendor SMS + AI scope summary"],
            ["Accounting + P&L", "CSV export for your bookkeeper"],
            ["Tenant CRM", "Profiles, lease history, notes"],
            ["Keycove Market Intelligence", "Rent comps for any U.S. zip"],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-2.5 p-3 rounded-xl border border-border/50 bg-card/40">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <div>
                <div className="font-semibold text-sm">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "setup",
      title: "Day-1 setup (do these in order)",
      icon: Rocket,
      intro: "About 15 minutes end-to-end. Stripe takes the longest.",
      body: (
        <ol className="space-y-3">
          {[
            { path: "/onboarding", label: "Complete onboarding", desc: "Stripe Connect onboarding takes ~5 min and unlocks payouts." },
            { path: "/pro-setup", label: "Pay the $25 setup fee", desc: "Your portal subdomain is provisioned automatically within ~30 seconds." },
            { path: "/portal-setup", label: "Brand your portal", desc: "Upload your logo + brand color. Defaults to Keycove teal if you skip." },
            { path: "/list-property", label: "Add your first property", desc: "Market Intelligence widget suggests a rent range on step 3 from zip + bedroom count." },
            { path: "/my-listings", label: "Confirm it's live", desc: "Share the public URL with prospects. Edit / unlist anytime." },
          ].map((s, i) => (
            <li key={s.path} className="flex gap-3 p-3 rounded-xl border border-border/50 bg-card/40">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: ACCENT, color: "#062018" }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={s.path} className="text-sm font-semibold hover:underline">{s.label}</Link>
                  <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.path}</code>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
              <Link href={s.path}>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: "cadence",
      title: "Weekly cadence (the actual job)",
      icon: Calendar,
      intro: "What an efficient Keycove Pro week looks like. Adjust to your own workflow.",
      body: (
        <div className="space-y-3">
          {[
            { day: "Mon", title: "Applications & screening", path: "/applications",
              points: ["Review every new applicant", "Click Run AI Screening on each — runs ~30 sec in background", "Decision within 48 hrs (Fair Housing best-practice)", "Never silently ghost — adverse action requires written notice in most states"] },
            { day: "Tue", title: "Leases & e-sign", path: "/leases",
              points: ["Send leases for anyone approved Mon", "Wizard at /leases/send/wizard for state-specific clauses", "First month + deposit through /lease-pay"] },
            { day: "Wed", title: "Work orders", path: "/work-orders",
              points: ["Triage tenant requests", "Dispatch from /contractors or your own vendor", "AI summary tells you scope + urgency before you read the wall of text"] },
            { day: "Thu", title: "Financial close", path: "/accounting",
              points: ["Categorize the week's transactions", "Stripe payouts auto-import", "Export CSV monthly for your bookkeeper"] },
            { day: "Fri", title: "Pipeline + marketing", path: "/dashboard",
              points: ["Review occupancy + lease expirations (90/60/30-day warnings)", "Refresh photos / pricing on anything vacant >14 days", "Use the Market Intelligence widget to validate pricing"] },
          ].map(d => (
            <div key={d.day} className="p-4 rounded-xl border border-border/50 bg-card/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-xs font-black">
                    {d.day}
                  </div>
                  <div className="text-sm font-semibold">{d.title}</div>
                </div>
                <Link href={d.path} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  Open <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <ul className="space-y-1 mt-2 text-xs text-muted-foreground">
                {d.points.map(p => (
                  <li key={p} className="flex gap-2"><span style={{ color: ACCENT }}>•</span><span>{p}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "rent",
      title: "Rent collection",
      icon: DollarSign,
      body: (
        <ul className="space-y-2 text-sm">
          <li className="p-3 rounded-xl border border-border/50 bg-card/40">
            <span className="font-semibold">Tenant pays at <code className="text-xs px-1 rounded bg-muted">/pay/&lt;id&gt;</code></span> — link is on their tenant dashboard.
          </li>
          <li className="p-3 rounded-xl border border-border/50 bg-card/40">
            <span className="font-semibold">Stripe Connect instant-payouts</span> the next business day by default. Flip to manual in Stripe for batch deposits.
          </li>
          <li className="p-3 rounded-xl border border-border/50 bg-card/40">
            <span className="font-semibold">Late fees</span> are per-lease and auto-applied. You don't chase manually.
          </li>
          <li className="p-3 rounded-xl border border-border/50 bg-card/40">
            <span className="font-semibold">Failed ACH</span> → tenant gets a retry link automatically. You only get pinged if retry fails too.
          </li>
        </ul>
      ),
    },
    {
      id: "complexes",
      title: "Apartment complexes (multi-unit)",
      icon: Building2,
      body: (
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Open <Link href="/complexes" className="underline">/complexes</Link>, create the building, then add units. Each unit is its own listing with its own price, photos, and applicants.
          </p>
          <div className="p-3 rounded-xl border border-border/50 bg-card/40 flex gap-2.5">
            <DoorOpen className="h-4 w-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
            <div className="text-xs text-muted-foreground">
              <b className="text-foreground">Co-living?</b> One property rented by the room — set the type to <b>Co-living</b> and renters come in as Room 1, Room 2… Fastest way to load an occupied building is the <Link href="/import-portfolio" className="underline">bulk import</Link> (see the Migrate section).
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border/50 bg-card/40">
              <div className="text-xs font-semibold mb-1">Lives on the complex</div>
              <div className="text-xs text-muted-foreground">Pool, gym, parking garage, lobby concierge — anything shared.</div>
            </div>
            <div className="p-3 rounded-xl border border-border/50 bg-card/40">
              <div className="text-xs font-semibold mb-1">Lives on the unit</div>
              <div className="text-xs text-muted-foreground">Square footage, balcony, in-unit laundry, view — anything per-unit.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "migrate",
      title: "Migrate off your old software (bulk import)",
      icon: Upload,
      intro: "Bring a whole portfolio — buildings, renters, and their existing leases — live in one upload. No AI, no re-keying.",
      body: (
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Open <Link href="/import-portfolio" className="underline">/import-portfolio</Link> (also the <b>Import</b> button next to <i>Add Property</i> in your CRM). Export a resident / rent-roll CSV from your current software and drop it in — one row per occupied unit. Columns auto-map to AppFolio, Buildium, RentRedi, Yardi, Rent Manager and plain spreadsheets. Every renter and their in-place lease goes live instantly, each with its own rent schedule, auto late fees, accounting ledger, and tenant portal login.
          </p>

          <div className="p-3 rounded-xl border border-border/50 bg-card/40">
            <div className="text-xs font-semibold mb-2">SOP — the 4 steps</div>
            <ol className="space-y-1.5 text-xs text-muted-foreground">
              {[
                ["Pick the property type", "Apartment, co-living, single-family, condo, townhouse or multi-family. This drives whether renters come in as units or rooms."],
                ["Drop the CSV (or paste rows)", "Hit “Download template” first if you're building the file by hand."],
                ["Review", "Rows group by building. Check the rent roll total, unit/room labels, and fix any row flagged red (missing rent, name, or lease start). Bad rows are skipped, never block the good ones."],
                ["Import", "“Your portal is live.” Invite every renter to pay online from the CRM."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-2">
                  <span className="font-black shrink-0" style={{ color: ACCENT }}>{i + 1}.</span>
                  <span><b className="text-foreground">{t}</b> — {d}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="text-xs font-semibold mb-2">CSV columns (map by header, order doesn't matter)</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["building", "unit / room", "type", "address", "city / state / zip", "tenant_first_name", "tenant_last_name", "tenant_email", "monthly_rent", "security_deposit", "lease_start", "lease_end", "late_fee", "grace_days"].map(n => (
                <code key={n} className="px-2 py-1.5 rounded-lg border border-border/50 bg-muted text-[11px]">{n}</code>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Leave <code className="text-[11px] px-1 rounded bg-muted">lease_end</code> blank for month-to-month. Omit <code className="text-[11px] px-1 rounded bg-muted">late_fee</code> and it defaults to $50 after a 5-day grace — editable per lease afterward.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border/50 bg-card/40">
            <div className="flex items-center gap-2 text-xs font-semibold mb-1"><DoorOpen className="h-3.5 w-3.5" style={{ color: ACCENT }} /> Co-living / rooms</div>
            <p className="text-xs text-muted-foreground">
              Pick <b>Co-living</b> and each renter comes in as <b>Room 1, Room 2…</b> under one property — every room bills, tracks, and late-fees on its own. Apartments stay unit-labeled (<b>4B, 12A</b> — numbers or letters). Mixing types in one file? Add a <code className="text-[11px] px-1 rounded bg-muted">type</code> column to override the picker per row.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Just moving marketplace <i>listings</i> (not occupied units)? Use <Link href="/import-listings" className="underline">/import-listings</Link> instead — same header-mapping, aimed at vacant units you want to advertise.
          </p>
        </div>
      ),
    },
    {
      id: "leasing",
      title: "Get a tenant → signed → paying",
      icon: FileSignature,
      intro: "How a prospect becomes a paying tenant with a live portal — on-site or off.",
      body: (
        <div className="space-y-4 text-sm">
          <div className="p-3 rounded-xl border border-border/50 bg-card/40">
            <div className="text-xs font-semibold mb-2">Where prospects come from</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span style={{ color: ACCENT }}>•</span>
                <span><b className="text-foreground">On the marketplace</b> — a renter opens your listing and hits <b>Contact Landlord</b> (you get emailed) or <b>Apply</b> at <code className="text-[11px] px-1 rounded bg-muted">/apply/&lt;listing&gt;</code>.</span></li>
              <li className="flex gap-2"><Link2 className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                <span><b className="text-foreground">Off-site</b> — on <Link href="/my-listings" className="underline">My Listings</Link>, click the link icon to <b>copy the apply link</b> and text or email it yourself. They apply with no account.</span></li>
            </ul>
          </div>

          <div className="p-3 rounded-xl border border-border/50 bg-card/40">
            <div className="text-xs font-semibold mb-2">Approve → lease fires automatically</div>
            <p className="text-xs text-muted-foreground">
              Approve an applicant on <Link href="/applications" className="underline">/applications</Link> and the lease is <b>sent to sign automatically</b> — no manual step. When they sign, their <b>tenant portal and your CRM portfolio both go live</b> (rent schedule, auto late fees, accounting) and you're prompted to countersign.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border/50 bg-card/40">
            <div className="flex items-center gap-2 text-xs font-semibold mb-1"><FileSignature className="h-3.5 w-3.5" style={{ color: ACCENT }} /> Send a lease by hand (any tenant)</div>
            <p className="text-xs text-muted-foreground">
              For someone who didn't come through an application, use <b>Send lease to sign</b> in your <Link href="/crm" className="underline">CRM</Link>. Enter the terms and either <b>attach your own lease PDF</b> or let Keycove use a standard agreement. The tenant gets a private link, signs, and their unit + portal go live instantly. Works for apartments (units) and co-living (rooms).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: AlertTriangle,
      body: (
        <div className="space-y-3">
          {[
            { q: '"AI screening is stuck on screening…"', a: 'Wait 90 seconds. If still stuck, the panel shows a red error banner with the underlying message — click Retry AI Screening. If it errors twice in a row, contact support.' },
            { q: '"My portal subdomain is showing 404"', a: 'Cloudflare DNS can take up to 15 min on first provision. Still down after 30 min? Open a support ticket.' },
            { q: '"My listing isn\'t showing on the marketplace"', a: 'Confirm status = active on /my-listings. Inactive listings stay in your dashboard but don\'t surface publicly.' },
            { q: '"Market Intelligence says \'not enough data\'"', a: 'Your zip is in the long tail. We use HUD FMR + Census ACS, refreshed monthly. Your listing adds to the dataset.' },
          ].map(t => (
            <details key={t.q} className="group p-3 rounded-xl border border-border/50 bg-card/40">
              <summary className="text-sm font-semibold cursor-pointer flex items-center justify-between">
                {t.q}
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90 text-muted-foreground" />
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{t.a}</p>
            </details>
          ))}
        </div>
      ),
    },
    {
      id: "cannot",
      title: "Things you cannot do (and why)",
      icon: ShieldOff,
      intro: "Limits aren't arbitrary — they protect you legally and operationally.",
      body: (
        <div className="space-y-2 text-sm">
          {[
            ["Run a background check yourself in-app", "We integrate with ApplyConnect. You're the requester; you don't get raw consumer-report PII."],
            ["Edit a signed lease", "Generate an addendum and resend for signature."],
            ["Refund rent already paid out to your bank", "Refund has to go from your bank back to the tenant. Stripe will not claw back a settled payout."],
            ["Take payment by check / cash through Keycove", "You can record it manually in /accounting, but the platform only handles ACH + card."],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3 p-3 rounded-xl border border-border/50 bg-card/40">
              <ShieldOff className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
              <div>
                <div className="font-semibold">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "not-covered",
      title: "What Pro doesn't cover",
      icon: AlertTriangle,
      body: (
        <ul className="space-y-2 text-sm">
          <li className="p-3 rounded-xl border border-border/50 bg-card/40">
            <span className="font-semibold">Tax filing</span> — we export, you (or your CPA) file.
          </li>
          <li className="p-3 rounded-xl border border-border/50 bg-card/40">
            <span className="font-semibold">Eviction filings</span> — we generate lease history + payment record; you (or your attorney) file with the court.
          </li>
          <li className="p-3 rounded-xl border border-border/50 bg-card/40">
            <span className="font-semibold">Insurance</span> — partner with Steadily (landlord) + Lemonade (renters). Quote in your dashboard, bind on their side.
          </li>
        </ul>
      ),
    },
  ], []);

  const filtered = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.intro || "").toLowerCase().includes(q) ||
      s.id.includes(q)
    );
  }, [search, sections]);

  // Track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-[260px_1fr] gap-8 max-w-6xl">
        {/* Sticky sidebar TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
                <BookOpen className="h-4 w-4" style={{ color: "#062018" }} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Pro Guide</div>
                <div className="text-sm font-bold">Everything you need</div>
              </div>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search the guide…"
                className="w-full text-xs bg-card/40 border border-border/50 rounded-lg pl-7 pr-2 py-2 outline-none focus:border-[#4F46E5]"
              />
            </div>
            <nav className="space-y-0.5">
              {filtered.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    active === s.id
                      ? "bg-[#4F46E5]/10 text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0" style={active === s.id ? { color: ACCENT } : undefined} />
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </nav>
            <div className="mt-6 p-3 rounded-xl border border-border/50 bg-card/40">
              <div className="text-xs font-semibold mb-1">Need a human?</div>
              <p className="text-[11px] text-muted-foreground mb-2">Support replies within 4 business hours.</p>
              <Link
                href="/support"
                className="block text-center text-xs font-semibold py-1.5 rounded-lg border border-border hover:bg-muted/40 transition-colors"
              >
                Contact support
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {/* Hero — minimal */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ background: `${ACCENT}20`, color: ACCENT }}>
              <Sparkles className="h-3 w-3" /> Pro Guide
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
              Run your rental business from one screen.
            </h1>
            <p className="text-sm md:text-base text-white/70 mt-2 max-w-xl">
              Click any section to expand. Setup first, then everything else.
            </p>
          </div>

          {/* Sections — accordion */}
          <div className="space-y-3">
            {filtered.map(s => {
              const isOpen = openId === s.id || search.trim().length > 0;
              return (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-6 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/15"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen && search.trim().length === 0 ? null : s.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: isOpen ? ACCENT : `${ACCENT}20`, color: isOpen ? "#062018" : ACCENT }}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base md:text-lg font-bold tracking-tight text-white truncate" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {s.title}
                      </h2>
                      {s.intro && !isOpen && (
                        <p className="text-xs text-white/55 mt-0.5 truncate">{s.intro}</p>
                      )}
                    </div>
                    <ChevronRight
                      className="h-4 w-4 text-white/40 shrink-0 transition-transform"
                      style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/5">
                      {s.intro && <p className="text-sm text-white/70 mb-4 mt-3">{s.intro}</p>}
                      {s.body}
                    </div>
                  )}
                </section>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center rounded-xl border border-dashed border-white/10">
                <p className="text-sm text-white/50">No sections match "{search}".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
