import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Minus, ArrowRight, Zap } from "lucide-react";

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
      { label: "AI Fraud Detection — Included Free", values: [true, false, false, false, false, false] },
      { label: "Background & Credit Checks", values: [true, true, true, true, false, false] },
      { label: "State-Specific Application Templates", values: [true, false, false, false, false, false] },
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
      { label: "Pro Price / month", values: ["$29/mo flat", "$55–$375+/mo", "$9/unit/mo", "$8.25+/mo", "Listing fees", "Listing fees"] },
      { label: "Per-Unit Fees", values: ["None ✓", "Yes (scales)", "Yes", "Yes", "Varies", "Varies"] },
      { label: "Per-Transaction Fees on Work Orders", values: ["None ✓", "Yes", "Yes", "Varies", "N/A", "N/A"] },
      { label: "Markup on Vendor Invoices", values: ["None ✓", "Yes", "Yes", "Varies", "N/A", "N/A"] },
      { label: "AI Screening Included (no add-on)", values: [true, false, false, false, false, false] },
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
              * Buildium starts at $55/mo (Essential, up to 20 units) and scales to $375+/mo. Avail charges $9/unit/mo on their paid plan. TurboTenant is $8.25+/mo per property. Zillow &amp; Apartments.com charge listing/lead fees. None include AI fraud screening as a built-in feature.
              <strong className="text-foreground"> Keycove Pro is $29/mo flat — unlimited listings, AI screening included, no per-unit fees, no per-transaction fees, no vendor invoice markups. We don't nickel-and-dime.</strong>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl bg-[#1B2B5E] text-white p-8 text-center space-y-4">
          <h2 className="text-2xl font-black">Ready to switch to Keycove?</h2>
          <p className="text-blue-100">
            Unlimited listings + AI screening + instant payouts — all for $29/mo flat. No per-unit fees. No per-transaction fees. No vendor invoice markups. We don't nickel-and-dime.
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
      </div>
    </div>
  );
}
