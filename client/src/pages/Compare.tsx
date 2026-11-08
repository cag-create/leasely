import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Minus, ArrowRight, Zap, Landmark } from "lucide-react";
import { HOA_ROUTES, HOA_CARD_FEE_TEXT } from "@/lib/hoaPricing";

// PayHOA figures: approximate, from PayHOA's public pricing as of Nov 2026.
const PAYHOA_ACH_FEE = 2.45;
const EXAMPLE_HOMES = 50;

const HOA_ROWS: { label: string; keycove: string; payhoa: string }[] = [
  { label: "Board price — up to 50 homes", keycove: "$39/mo ($33.15/mo billed yearly)", payhoa: "About $54–65/mo" },
  { label: "Board price — 51–100 homes", keycove: "$79/mo — covers up to 150 homes ($67.15/mo billed yearly)", payhoa: "About $109/mo (51–100 homes)" },
  { label: "Homeowner fee per ACH (bank) payment", keycove: "$0", payhoa: `About $${PAYHOA_ACH_FEE.toFixed(2)}` },
  { label: "Homeowner card fee", keycove: `${HOA_CARD_FEE_TEXT} at cost (Stripe's rate, no markup); board can turn cards off`, payhoa: "—" },
  { label: "Free trial", keycove: "30 days, no card required", payhoa: "—" },
];

const COMPETITORS = ["Keycove", "Buildium", "Avail", "TurboTenant", "Zillow Rental", "Apartments.com"];

const FEATURES = [
  {
    category: "Listings & Marketing",
    items: [
      { label: "Property Listings", values: [true, true, true, true, true, true] },
      { label: "Unlimited Listings — Flat Rate", values: [true, false, false, false, true, true] },
      { label: "Map View", values: [true, false, false, false, true, true] },
      { label: "QR Code per Listing", values: [true, false, false, false, false, false] },
      { label: "Branded Portal (yourname.domain)", values: [true, false, false, false, false, false] },
      { label: "FSBO Listings", values: [true, false, false, false, true, true] },
    ],
  },
  {
    category: "Tenant Screening & Applications",
    items: [
      { label: "Online Rental Applications", values: [true, true, true, true, false, true] },
      { label: "AI Fraud Screening Included in Plan", values: [true, "—", "—", "—", "—", "—"] },
      { label: "Background & Credit Checks", values: ["Coming soon", true, true, true, false, false] },
      { label: "Built-in State Lease Templates (NC & TN today)", values: [true, "—", "—", "—", false, false] },
      { label: "Digital Signature Capture", values: [true, true, true, true, false, false] },
    ],
  },
  {
    category: "Rent Collection & Payments",
    items: [
      { label: "Tenant Payment Portal", values: [true, true, true, true, false, false] },
      { label: "Waived ACH Fees for Tenants", values: [true, false, false, false, false, false] },
      { label: "Instant Bank Payouts (Stripe Connect)", values: [true, false, true, false, false, false] },
      { label: "Automated Rent Reminders", values: [true, true, true, true, false, false] },
    ],
  },
  {
    category: "Property Operations",
    items: [
      { label: "Work Order Management", values: [true, true, true, true, false, false] },
      { label: "AI Vendor Dispatch", values: [true, false, false, false, false, false] },
      { label: "Accounting & Ledger", values: [true, true, true, true, false, false] },
      { label: "IRS Schedule E / Tax-Ready Export", values: [true, true, true, false, false, false] },
      { label: "Property CRM (Units, Tenants, Leases)", values: [true, true, true, true, false, false] },
      { label: "HOA Dues Tracking for Landlords", values: [true, "—", "—", "—", false, false] },
      { label: "Guided Import (CSV, Excel, Google Sheets)", values: [true, "—", "—", "—", false, false] },
    ],
  },
  {
    category: "Platform & Extras",
    items: [
      { label: "Creme Agent Network (Lead Matching)", values: [true, false, false, false, false, false] },
      { label: "Renter Waitlist System", values: [true, false, false, false, false, false] },
      { label: "Short-Term Rental (iStay™)", values: [true, false, false, false, false, false] },
      { label: "Affiliate / Referral Program", values: [true, false, false, false, false, false] },
      { label: "Branded Tenant Portal Subdomain", values: [true, false, false, false, false, false] },
    ],
  },
  {
    category: "Pricing & Value",
    items: [
      { label: "Free Tier Available", values: [true, false, true, true, true, true] },
      { label: "Paid Plan Price / month", values: ["$25/mo flat", "$65–$420/mo", "$9/unit/mo", "$12.42–$16.48/mo", "Listing fees", "Listing fees"] },
      { label: "Per-Unit Pricing", values: ["None ✓", "Tiered by units", "Yes", "No", "Varies", "Varies"] },
      { label: "Keycove fee on your work orders", values: ["None ✓", "—", "—", "—", "N/A", "N/A"] },
    ],
  },
];

type CellValue = boolean | string;

function Cell({ value, isKeycove }: { value: CellValue; isKeycove: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className={`h-5 w-5 mx-auto ${isKeycove ? "text-[#4F46E5]" : "text-muted-foreground"}`} />
    ) : (
      <XCircle className="h-5 w-5 mx-auto text-muted/40" />
    );
  }
  return (
    <span className={`text-sm font-medium ${isKeycove ? "text-[#4F46E5]" : "text-muted-foreground"}`}>
      {value}
    </span>
  );
}

export default function Compare() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1B2B5E] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <Badge className="bg-[#4F46E5]/20 text-[#4F46E5] border-[#4F46E5]/30 text-xs">
            Platform Comparison
          </Badge>
          <h1 className="text-3xl font-black">Why Keycove?</h1>
          <p className="text-blue-100 text-lg">
            See how Keycove stacks up against Buildium, Avail, TurboTenant & more — feature by feature, price by price.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground w-64">Feature</th>
                  {COMPETITORS.map((c, i) => (
                    <th key={c} className={`px-4 py-4 text-center ${i === 0 ? "bg-[#1B2B5E]/5" : ""}`}>
                      <div className={`text-sm font-bold ${i === 0 ? "text-[#1B2B5E]" : "text-foreground"}`}>
                        {c}
                        {i === 0 && (
                          <Badge className="ml-1.5 bg-[#4F46E5]/20 text-[#4F46E5] border-0 text-xs align-middle">
                            <Zap className="h-2.5 w-2.5 mr-0.5" />Us
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map(section => (
                  <>
                    <tr key={section.category} className="bg-muted/20">
                      <td
                        colSpan={COMPETITORS.length + 1}
                        className="px-6 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider"
                      >
                        {section.category}
                      </td>
                    </tr>
                    {section.items.map((row, ri) => (
                      <tr
                        key={row.label}
                        className={`border-t border-border hover:bg-muted/10 transition-colors ${ri % 2 === 0 ? "" : "bg-muted/5"}`}
                      >
                        <td className="px-6 py-3 text-sm text-foreground">{row.label}</td>
                        {row.values.map((val, i) => (
                          <td key={i} className={`px-4 py-3 text-center ${i === 0 ? "bg-[#1B2B5E]/5" : ""}`}>
                            <Cell value={val} isKeycove={i === 0} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 bg-muted/20 border-t border-border">
            <p className="text-xs text-muted-foreground">
              * Competitor pricing from their published plans as of Nov 2026: Buildium from $65/mo (Essential), $202/mo (Growth), $420/mo (Premium). Avail has a free plan; Unlimited Plus is $9/unit/mo. TurboTenant has a free plan; paid plans are $12.42–$16.48/mo. AppFolio is quote-only (roughly $1.49/unit with a 50-unit / ~$298/mo minimum). Zillow &amp; Apartments.com charge listing/lead fees. &ldquo;—&rdquo; means we couldn&apos;t confirm it from public information; competitors change features and prices often, so check their sites.
              <strong className="text-foreground"> Keycove Pro is $25/mo flat — unlimited listings, AI fraud screening included, no per-unit pricing, no cut of your work orders.</strong>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl bg-[#1B2B5E] text-white p-8 text-center space-y-4">
          <h2 className="text-2xl font-black">Ready to switch to Keycove?</h2>
          <p className="text-blue-100">
            Unlimited listings + AI screening + instant payouts — all for $25/mo flat. No per-unit pricing and no cut of your work orders.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pricing">
              <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white gap-2 h-11 px-6">
                See Pricing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-11 px-6">
                Explore the Marketplace
              </Button>
            </Link>
          </div>
        </div>
        {/* Keycove HOA vs PayHOA */}
        <div id="hoa" className="mt-16 scroll-mt-20">
          <div className="text-center space-y-2 mb-6">
            <Badge className="bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20 text-xs">
              <Landmark className="h-3 w-3 mr-1" /> For HOA boards
            </Badge>
            <h2 className="text-2xl font-black text-foreground">Keycove HOA vs PayHOA</h2>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Keycove HOA is a separate subscription for self-managed HOA boards that collect dues online. Here&apos;s how its pricing compares with PayHOA&apos;s.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground w-64"></th>
                    <th className="px-4 py-4 text-center bg-[#1B2B5E]/5">
                      <div className="text-sm font-bold text-[#1B2B5E]">
                        Keycove HOA
                        <Badge className="ml-1.5 bg-[#4F46E5]/20 text-[#4F46E5] border-0 text-xs align-middle">
                          <Zap className="h-2.5 w-2.5 mr-0.5" />Us
                        </Badge>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center">
                      <div className="text-sm font-bold text-foreground">PayHOA</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {HOA_ROWS.map((row, ri) => (
                    <tr key={row.label} className={`border-t border-border ${ri % 2 === 0 ? "" : "bg-muted/5"}`}>
                      <td className="px-6 py-3 text-sm text-foreground">{row.label}</td>
                      <td className="px-4 py-3 text-center bg-[#1B2B5E]/5">
                        <span className="text-sm font-medium text-[#4F46E5]">{row.keycove}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-muted-foreground">{row.payhoa}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Worked example */}
            <div className="px-6 py-5 border-t border-border bg-emerald-50/60">
              <div className="text-sm font-bold text-foreground mb-1">Example: a {EXAMPLE_HOMES}-home HOA paying dues monthly by ACH</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                On PayHOA, homeowners pay about {EXAMPLE_HOMES} × ${PAYHOA_ACH_FEE.toFixed(2)} ={" "}
                <strong className="text-foreground">${(EXAMPLE_HOMES * PAYHOA_ACH_FEE).toFixed(2)} a month</strong> in ACH fees
                (about ${(EXAMPLE_HOMES * PAYHOA_ACH_FEE * 12).toLocaleString("en-US", { minimumFractionDigits: 2 })} a year).
                On Keycove HOA, homeowners pay <strong className="text-foreground">$0</strong> in ACH fees.
              </p>
            </div>

            <div className="px-6 py-4 bg-muted/20 border-t border-border">
              <p className="text-xs text-muted-foreground">
                * PayHOA figures are approximate, from its public pricing as of Nov 2026. &ldquo;—&rdquo; means we couldn&apos;t confirm it from public information; prices and features change, so check PayHOA&apos;s site.
                <strong className="text-foreground"> Every Keycove HOA plan includes every feature; plans differ only by number of homes ($39, $79, $149 or $249/mo, or 15% off billed yearly).</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href={HOA_ROUTES.board}>
              <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white gap-2 h-11 px-6">
                Start 30-day free trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={HOA_ROUTES.landing}>
              <Button variant="outline" className="h-11 px-6">
                Learn about Keycove HOA
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
