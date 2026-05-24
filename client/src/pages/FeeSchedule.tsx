import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Sparkles, DollarSign, Zap, CreditCard, Building2, Users } from "lucide-react";
import { getLoginUrl } from "@/const";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <div className="px-6 py-4 bg-secondary/40 border-b border-border">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h3>
    </div>
    <div className="divide-y divide-border">{children}</div>
  </div>
);

const Row = ({
  label, desc, free, pro, proHighlight = false,
}: {
  label: string; desc?: string; free: React.ReactNode; pro: React.ReactNode; proHighlight?: boolean;
}) => (
  <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_180px_180px] gap-4 px-6 py-4 items-start">
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {desc && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>}
    </div>
    <div className="text-sm text-muted-foreground text-right md:text-center">{free}</div>
    <div className={`text-sm text-right md:text-center font-semibold ${proHighlight ? "text-[#F5A623]" : "text-foreground"}`}>{pro}</div>
  </div>
);

const Yes = () => <CheckCircle2 className="h-4 w-4 text-[#F5A623] inline" />;
const No = () => <XCircle className="h-4 w-4 text-muted-foreground/40 inline" />;

export default function FeeSchedule() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="container py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs font-semibold px-3 py-1">
            <DollarSign className="h-3 w-3 mr-1.5 text-[#F5A623]" /> Fee Schedule & Terms
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Simple. Transparent. <span className="text-[#F5A623]">No surprises.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every fee Leasely charges — for landlords, tenants, and agents — in plain English.
            No hidden fees. No per-unit charges. No annual contracts.
          </p>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_180px_180px] gap-4 px-6 py-3 mb-2">
          <div />
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-right md:text-center">Free Tier</div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#F5A623] text-right md:text-center flex items-center justify-end md:justify-center gap-1">
            <Sparkles className="h-3 w-3" /> Pro — $25/mo
          </div>
        </div>

        <div className="space-y-4">

          {/* ── Subscription ── */}
          <Section title="Subscription">
            <Row
              label="Monthly platform fee"
              desc="Access to the Leasely platform for landlords."
              free={<span className="font-semibold text-foreground">$0/mo</span>}
              pro={<span className="text-[#F5A623]">$25.00/mo</span>}
              proHighlight
            />
            <Row
              label="One-time setup fee"
              desc="Includes your branded website, custom logo placement, and personalized leasely.net subdomain URL."
              free={<No />}
              pro={<span className="text-[#F5A623]">$75 one-time</span>}
              proHighlight
            />
            <Row
              label="Contract / minimum term"
              free="None"
              pro="None — cancel anytime"
            />
          </Section>

          {/* ── Listings ── */}
          <Section title="Listings & Marketplace">
            <Row
              label="Active listings"
              desc="Properties published on the Leasely marketplace."
              free="1 listing"
              pro="Unlimited"
              proHighlight
            />
            <Row label="Marketplace visibility" free={<Yes />} pro={<Yes />} />
            <Row label="Map view & search placement" free={<Yes />} pro={<Yes />} />
            <Row label="Branded tenant portal" free={<No />} pro={<Yes />} proHighlight />
            <Row label="Custom subdomain (yourname.leasely.net)" free={<No />} pro={<Yes />} proHighlight />
          </Section>

          {/* ── Rent Collection ── */}
          <Section title="Rent Collection & Payments">
            <Row
              label="Leasely platform fee on rent payments"
              desc="Fee taken from each rent payment processed through Stripe."
              free={
                <span className="font-semibold text-amber-600">1% per transaction</span>
              }
              pro={
                <span className="text-[#F5A623] font-bold">$0 — keep it all</span>
              }
              proHighlight
            />
            <Row
              label="ACH / bank transfer fee"
              desc="Standard ACH processing for rent payments."
              free="0% (Stripe ACH)"
              pro="0% — included"
              proHighlight
            />
            <Row
              label="Card payment processing"
              desc="Stripe's standard card fee, charged by Stripe — not Leasely."
              free="2.9% + 30¢ (Stripe)"
              pro="2.9% + 30¢ (Stripe)"
            />
            <Row
              label="Instant payout (same-day bank transfer)"
              desc="Request immediate transfer of your available balance to your bank."
              free={<No />}
              pro={<span className="text-[#F5A623] font-bold">$1.00 flat fee</span>}
              proHighlight
            />
            <Row
              label="Standard ACH payout (1-2 business days)"
              desc="Free standard payout to your connected bank account."
              free={<No />}
              pro={<span className="text-[#F5A623]">$0 — free</span>}
              proHighlight
            />
            <Row
              label="Stripe Connect bank account setup"
              desc="Required to receive rent payments directly to your bank."
              free={<No />}
              pro={<Yes />}
              proHighlight
            />
          </Section>

          {/* ── Applications & Screening ── */}
          <Section title="Rental Applications & Screening">
            <Row label="State-specific rental applications" free={<No />} pro={<Yes />} proHighlight />
            <Row
              label="AI fraud detection & risk scoring"
              desc="Automated applicant screening with risk flags and identity verification signals."
              free={<No />}
              pro={<Yes />}
              proHighlight
            />
            <Row label="Application fee (charged to tenant)" free={<No />} pro="You set the amount" proHighlight />
            <Row label="Co-living / room rental applications" free={<No />} pro={<Yes />} proHighlight />
          </Section>

          {/* ── Pro Tools ── */}
          <Section title="Pro Management Tools">
            <Row label="Work order management & vendor dispatch" free={<No />} pro={<Yes />} proHighlight />
            <Row label="Accounting & P&L ledger" free={<No />} pro={<Yes />} proHighlight />
            <Row label="Tenant CRM" free={<No />} pro={<Yes />} proHighlight />
            <Row label="Apartment complex management" free={<No />} pro={<Yes />} proHighlight />
            <Row label="Rent rate intelligence (market data)" free={<No />} pro={<Yes />} proHighlight />
          </Section>

          {/* ── Creme Agent Network ── */}
          <Section title="Creme Agent Network">
            <Row
              label="Access to verified agents"
              desc="Connect with background-checked real estate agents for buying, selling, or investing."
              free={<Yes />}
              pro={<Yes />}
            />
            <Row
              label="Agent referral fee (paid by agent on closed deal)"
              desc="When a Creme Agent closes a buy/sell/investment deal sourced through Leasely, a 0.75% fee on the deal value is invoiced to the agent — not the landlord."
              free="0.75% of deal (billed to agent)"
              pro="0.75% of deal (billed to agent)"
            />
            <Row
              label="Rental placement agent fee"
              desc="For rental-only agent placements (no purchase involved). Flat fee billed to agent upon signed lease."
              free="$350 flat (billed to agent)"
              pro="$350 flat (billed to agent)"
            />
          </Section>

          {/* ── Tenant Fees ── */}
          <Section title="Tenant / Renter Fees">
            <Row
              label="Browsing & saving listings"
              desc="All renters can browse, filter, and save listings for free."
              free={<Yes />}
              pro="N/A"
            />
            <Row
              label="Rental application fee"
              desc="Set by the landlord. Leasely does not add any fee on top."
              free="Set by landlord"
              pro="Set by landlord"
            />
            <Row
              label="Rent payment processing"
              desc="Tenants pay rent via Stripe secure checkout. Standard Stripe card fee applies."
              free="2.9% + 30¢ (Stripe)"
              pro="2.9% + 30¢ (Stripe)"
            />
            <Row
              label="Tenant portal access"
              desc="Tenants access their portal via secure magic-link email — no password needed."
              free="Free"
              pro="Free"
            />
          </Section>

          {/* ── Affiliate ── */}
          <Section title="Affiliate Program">
            <Row
              label="Referral commission"
              desc="Earn a $50 one-time bonus for every landlord who signs up using your affiliate code and pays their first full month plus setup fee."
              free="Open to all"
              pro="Open to all"
            />
            <Row
              label="Payout method"
              desc="Commissions paid via Stripe or ACH once thresholds are met."
              free="Stripe / ACH"
              pro="Stripe / ACH"
            />
          </Section>

        </div>

        {/* Summary callout */}
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-[#0A1628] to-[#1A3060] border border-[#F5A623]/15 p-8 text-center space-y-4">
          <Sparkles className="h-8 w-8 text-[#F5A623] mx-auto" />
          <h2 className="text-2xl font-black text-white">Pro in plain English</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-left mt-4">
            {[
              {
                icon: DollarSign,
                title: "$25/mo flat",
                body: "One price covers everything. No per-unit fees, no per-application fees, no surprises.",
              },
              {
                icon: Zap,
                title: "$1.00 instant payouts",
                body: "Request same-day bank transfers for just $1.00 flat. No percentage taken.",
              },
              {
                icon: CreditCard,
                title: "0% on rent (Pro)",
                body: "Every dollar your tenants pay goes to you. Leasely takes nothing on rent for Pro landlords.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl bg-white/5 border border-white/8 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-[#F5A623]" />
                  <span className="text-white font-bold text-sm">{title}</span>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <a href={getLoginUrl()}>
              <Button className="bg-[#F5A623] hover:bg-[#E8951A] text-[#062018] font-bold gap-2 px-8">
                <Sparkles className="h-4 w-4" /> Start Pro — $75 setup + $25/mo
              </Button>
            </a>
            <Link href="/pricing">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/8 bg-transparent gap-2">
                View Full Pricing
              </Button>
            </Link>
          </div>
          <p className="text-white/30 text-xs">$75 one-time setup (website, logo & URL) · $25/mo thereafter · Cancel anytime · No contracts</p>
        </div>

      </div>
    </div>
  );
}
