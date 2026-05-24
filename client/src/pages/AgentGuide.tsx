import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, BadgeCheck, UserCheck, Phone, Award, Scale,
  ShieldOff, AlertTriangle, TrendingUp, ChevronRight, Sparkles,
  ArrowRight, Search, Briefcase,
} from "lucide-react";

const ACCENT = "#F5A623";

type Section = {
  id: string;
  title: string;
  icon: any;
  intro?: string;
  body: React.ReactNode;
};

/**
 * In-app guide for Creme Agents. Source content lives in
 * docs/sops/creme-agent.md. This is what agents actually read.
 */
export default function AgentGuide() {
  const [active, setActive] = useState("register");
  const [search, setSearch] = useState("");
  // Only "register" open by default — the most relevant first action for new agents.
  const [openId, setOpenId] = useState<string | null>("register");

  // Pull the agent's status (if registered) so we can show context
  const { data: myProfile } = trpc.cremeAgent.getMyProfile.useQuery();
  const status = (myProfile as any)?.status as "pending" | "approved" | "rejected" | undefined;

  const sections = useMemo<Section[]>(() => [
    {
      id: "welcome",
      title: "What the Creme Agent Network is",
      icon: Sparkles,
      intro: "A curated directory of licensed agents who specialize in landlord-side deals.",
      body: (
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            Leasely brings the lead. You bring the license, the closing, and the local expertise.
            Leasely takes a referral fee on closed transactions per the agreement you signed at onboarding.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              "Investor acquisitions (buy / sell income property)",
              "FSBO-to-listed conversions",
              "Novation deals",
              "Multi-unit + complex sales",
              "Lease-up partnerships with Pro landlords",
            ].map(t => (
              <div key={t} className="p-3 rounded-xl border border-border/50 bg-card/40 flex gap-2.5">
                <Briefcase className="h-4 w-4 mt-0.5" style={{ color: ACCENT }} />
                <span className="text-xs">{t}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "register",
      title: "Becoming a Creme Agent",
      icon: BadgeCheck,
      intro: "Application → verification → approval. Target SLA is 24 business hours.",
      body: (
        <>
          <ol className="space-y-3 mb-4">
            {[
              ["Apply", "Submit your application with license, headshot, bio, and at least one specialty + service area."],
              ["Verification", "Admin verifies your license against the state DRE / RECO portal."],
              ["Approval", "When approved you'll see your public profile at /agents/<your-id>."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3 p-3 rounded-xl border border-border/50 bg-card/40">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: ACCENT, color: "#062018" }}>
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
              </li>
            ))}
          </ol>
          {!myProfile && (
            <Link
              href="/agents"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
              style={{ background: ACCENT, color: "#062018" }}
            >
              Register now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Most rejections are fixable (expired license, blurry headshot) — fix and re-apply.
          </p>
        </>
      ),
    },
    {
      id: "profile",
      title: "Profile that gets leads",
      icon: UserCheck,
      intro: "Patterns we see on the top 10% of profiles.",
      body: (
        <div className="space-y-3">
          {[
            { title: "Bio", body: "2–3 short paragraphs. Lead with what you specialize in, not where you grew up. Investors are scanning for '1031 exchange', 'multi-unit', 'novation', 'section 8 friendly' — use the words they'll search for." },
            { title: "Specialties", body: "Pick 3–5, not 12. The directory filters by specialty; being in 12 buckets means you rank in none." },
            { title: "Service areas", body: "List cities, not whole states. 'Phoenix AZ + Mesa AZ' ranks better than 'Arizona'." },
            { title: "Headshot", body: "Professional, square crop, neutral background. Selfies get passed over." },
          ].map(t => (
            <div key={t.title} className="p-3 rounded-xl border border-border/50 bg-card/40">
              <div className="text-sm font-semibold mb-1">{t.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "lead-flow",
      title: "How a lead reaches you",
      icon: Phone,
      intro: "Speed matters. The 4-hour SLA is enforced.",
      body: (
        <ol className="space-y-3">
          {[
            { t: "Request", d: "A landlord / investor / FSBO seller clicks Request this agent on your profile." },
            { t: "Notification", d: "Leasely sends you a notification + email. Lead also lands on your Agent Dashboard tab." },
            { t: "4-hour window", d: "Leads that go cold for >4 hrs are auto-redistributed to another agent in the same service area." },
            { t: "First response", d: "Phone call > SMS > email. We see a 3× higher close rate on phone-first responses." },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-3 p-3 rounded-xl border border-border/50 bg-card/40">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: `${ACCENT}25`, color: ACCENT }}>
                {i + 1}
              </div>
              <div>
                <div className="font-semibold text-sm">{s.t}</div>
                <div className="text-xs text-muted-foreground">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: "working",
      title: "Working a lead",
      icon: Briefcase,
      body: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border/50 bg-card/40">
            <div className="text-sm font-semibold mb-2">Discovery (first call)</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {[
                "What are they trying to do? (Buy / sell / refi / novate / rent up)",
                "Timeline?",
                "Pre-qualified / pre-approved?",
                "Already working with another agent? If yes, decline politely — poaching is grounds for removal.",
              ].map(p => (
                <li key={p} className="flex gap-2"><span style={{ color: ACCENT }}>•</span><span>{p}</span></li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-card/40">
            <div className="text-sm font-semibold mb-2">Mid-funnel</div>
            <p className="text-xs text-muted-foreground mb-2">Use Leasely's tooling where it helps:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex gap-2"><span style={{ color: ACCENT }}>•</span><Link href="/marketplace" className="underline">Marketplace</Link><span>for active comps</span></li>
              <li className="flex gap-2"><span style={{ color: ACCENT }}>•</span><span>Profile share-link for the lead to bookmark you</span></li>
              <li className="flex gap-2"><span style={{ color: ACCENT }}>•</span><span>Leasely Market Intelligence for income-property pricing</span></li>
            </ul>
            <div className="mt-3 p-2 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-amber-200/90">
              <strong>Do not</strong> disintermediate Leasely. Closing outside the platform is grounds for removal and forfeits pipeline.
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-card/40">
            <div className="text-sm font-semibold mb-2">Closing</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex gap-2"><span style={{ color: ACCENT }}>•</span><span>File the transaction in your dashboard with closing date + sale price.</span></li>
              <li className="flex gap-2"><span style={{ color: ACCENT }}>•</span><span>Leasely invoices the referral fee per your onboarding agreement.</span></li>
              <li className="flex gap-2"><span style={{ color: ACCENT }}>•</span><span>30-day cooling-off: clients keep their Leasely portal access at no extra cost for 6 months.</span></li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "compliance",
      title: "Compliance — what you must do",
      icon: Scale,
      intro: "Your license. Your rules. Leasely doesn't replace your state disclosures.",
      body: (
        <div className="space-y-2 text-sm">
          {[
            ["Agency disclosure", "MLOA / agency disclosure is on you, not Leasely."],
            ["Fair Housing", "No client filters on protected class. If a lead asks you to, document and decline."],
            ["License display", "Your license number is shown on /agents/:id. Don't remove it from co-marketing material."],
            ["Anti-steering", "Don't steer leads to lenders / inspectors / insurance in exchange for kickbacks. Leasely's disclosed partnerships are the only allowed ones."],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3 p-3 rounded-xl border border-border/50 bg-card/40">
              <Scale className="h-4 w-4 mt-0.5" style={{ color: ACCENT }} />
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
      id: "cannot",
      title: "Things you cannot do (and why)",
      icon: ShieldOff,
      body: (
        <div className="space-y-2 text-sm">
          {[
            ["Close outside the platform", "Forfeit referral + removal from network."],
            ["Trade Leasely leads with another network", "Same consequence — removal."],
            ["Edit your license number after approval", "Admin-only. Renewals fine; jurisdiction transfers need re-verification."],
            ["Take client payment through Leasely", "Leasely is not your brokerage's trust account. Commissions flow brokerage → you."],
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
      id: "scoring",
      title: "Performance scoring",
      icon: TrendingUp,
      intro: "Your dashboard shows three numbers — these are the targets.",
      body: (
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "Response time", target: "<1 hr", desc: "Median time to first contact on leads." },
            { label: "Close rate", target: "≥18% / ≥35%", desc: "Buy-sell / FSBO conversion." },
            { label: "NPS", target: "≥9", desc: "Post-closing client survey, 0–10." },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl border border-border/50 bg-card/40">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className="text-xl font-black mt-1" style={{ color: ACCENT, fontFamily: "Outfit, sans-serif" }}>{s.target}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
            </div>
          ))}
          <div className="sm:col-span-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-200/90">
            Under target for 2 consecutive quarters → probation (lower lead priority). 3 consecutive quarters → removal.
          </div>
        </div>
      ),
    },
    {
      id: "escalate",
      title: "When to escalate to Leasely",
      icon: AlertTriangle,
      body: (
        <ul className="space-y-2 text-sm">
          {[
            "Suspected fraud / identity issue on a lead",
            "Earnest-money escrow dispute",
            "Client asks to migrate from another platform (we help with data export)",
            "Anything that looks like a Fair Housing violation",
            "Tenant complaint about a Pro member you closed with",
          ].map(t => (
            <li key={t} className="flex gap-2.5 p-3 rounded-xl border border-border/50 bg-card/40">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
              <span className="text-sm">{t}</span>
            </li>
          ))}
          <li className="p-3 rounded-xl border border-border/50 bg-card/40">
            <Link href="/support" className="text-sm font-semibold underline" style={{ color: ACCENT }}>
              Open a support ticket →
            </Link>
            <span className="text-xs text-muted-foreground"> Median first response is 4 business hours.</span>
          </li>
        </ul>
      ),
    },
  ], [myProfile]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.intro || "").toLowerCase().includes(q) ||
      s.id.includes(q)
    );
  }, [search, sections]);

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
        {/* Sticky TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
                <BookOpen className="h-4 w-4" style={{ color: "#062018" }} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Agent Guide</div>
                <div className="text-sm font-bold">Creme Agent Network</div>
              </div>
            </div>

            {status && (
              <div className="mb-3 p-2.5 rounded-lg border border-border/50 bg-card/40">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Your status</div>
                <div className="text-xs font-bold mt-0.5" style={{
                  color: status === "approved" ? ACCENT : status === "rejected" ? "#ef4444" : "#f59e0b"
                }}>
                  {status === "approved" && "Approved ✓"}
                  {status === "pending" && "Under review"}
                  {status === "rejected" && "Rejected — see your dashboard"}
                </div>
              </div>
            )}

            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search the guide…"
                className="w-full text-xs bg-card/40 border border-border/50 rounded-lg pl-7 pr-2 py-2 outline-none focus:border-[#F5A623]"
              />
            </div>
            <nav className="space-y-0.5">
              {filtered.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    active === s.id
                      ? "bg-[#F5A623]/10 text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0" style={active === s.id ? { color: ACCENT } : undefined} />
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </nav>
            <div className="mt-6 p-3 rounded-xl border border-border/50 bg-card/40">
              <div className="text-xs font-semibold mb-1">Need to escalate?</div>
              <p className="text-[11px] text-muted-foreground mb-2">Admin replies within 4 business hours.</p>
              <Link
                href="/support"
                className="block text-center text-xs font-semibold py-1.5 rounded-lg border border-border hover:bg-muted/40 transition-colors"
              >
                Contact admin
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
              <Award className="h-3 w-3" /> Creme Agent Guide
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
              Close more deals. Skip the cold outreach.
            </h1>
            <p className="text-sm md:text-base text-white/70 mt-2 max-w-xl">
              Leasely brings the lead. You bring the license. Click any section to expand.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {!myProfile && (
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                  style={{ background: ACCENT, color: "#062018" }}
                >
                  Register as a Creme Agent <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {myProfile && (
                <Link
                  href={`/agents/${(myProfile as any).id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                  style={{ background: ACCENT, color: "#062018" }}
                >
                  View my public profile <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
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
