import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Minus, ArrowRight, Zap } from "lucide-react";

const COMPETITORS = ["Leasely", "Zillow Rental", "Apartments.com", "Avail", "TurboTenant"];

const FEATURES = [
  {
    category: "Listings & Marketing",
    items: [
      { label: "Property Listings", values: [true, true, true, true, true] },
      { label: "Map View", values: [true, true, true, false, false] },
      { label: "QR Code per Listing", values: [true, false, false, false, false] },
      { label: "Branded Portal (yourname.domain)", values: [true, false, false, false, false] },
      { label: "FSBO Listings", values: [true, true, true, false, false] },
    ],
  },
  {
    category: "Tenant Management",
    items: [
      { label: "Online Rental Applications", values: [true, false, true, true, true] },
      { label: "AI Fraud Detection on Applications", values: [true, false, false, false, false] },
      { label: "Background & Credit Checks", values: [true, false, true, true, true] },
      { label: "Tenant Payment Portal", values: [true, false, false, true, true] },
      { label: "Waived ACH Fees for Tenants", values: [true, false, false, false, false] },
    ],
  },
  {
    category: "Property Operations",
    items: [
      { label: "Work Order Management", values: [true, false, false, true, true] },
      { label: "AI Vendor Dispatch", values: [true, false, false, false, false] },
      { label: "Accounting & Ledger", values: [true, false, false, true, true] },
      { label: "Tax-Ready Export", values: [true, false, false, true, false] },
      { label: "Property CRM", values: [true, false, false, true, true] },
    ],
  },
  {
    category: "Platform & Extras",
    items: [
      { label: "Creme Agent Network", values: [true, false, false, false, false] },
      { label: "Renter Waitlist System", values: [true, false, false, false, false] },
      { label: "Affiliate Program", values: [true, false, false, false, false] },
      { label: "SOP / Training Library", values: [true, false, false, false, false] },
      { label: "Listing Syndication Tools", values: [true, false, false, false, false] },
      { label: "Growth Dashboard (Admin)", values: [true, false, false, false, false] },
      { label: "Instant Payouts (Stripe Connect)", values: [true, false, false, true, false] },
    ],
  },
  {
    category: "Pricing",
    items: [
      { label: "Free Tier", values: [true, true, true, true, true] },
      { label: "Pro Price / month", values: ["$25.00", "$0*", "$0*", "$9", "$0*"] },
      { label: "Per-unit fees", values: ["None", "Varies", "Varies", "Per unit", "Per unit"] },
    ],
  },
];

type CellValue = boolean | string;

function Cell({ value, isLeasely }: { value: CellValue; isLeasely: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className={`h-5 w-5 mx-auto ${isLeasely ? "text-[#00C896]" : "text-muted-foreground"}`} />
    ) : (
      <XCircle className="h-5 w-5 mx-auto text-muted/40" />
    );
  }
  return (
    <span className={`text-sm font-medium ${isLeasely ? "text-[#00C896]" : "text-muted-foreground"}`}>
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
          <Badge className="bg-[#00C896]/20 text-[#00C896] border-[#00C896]/30 text-xs">
            Platform Comparison
          </Badge>
          <h1 className="text-3xl font-black">Why Leasely?</h1>
          <p className="text-blue-100 text-lg">
            See how Leasely stacks up against the competition — feature by feature.
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
                          <Badge className="ml-1.5 bg-[#00C896]/20 text-[#00C896] border-0 text-xs align-middle">
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
                            <Cell value={val} isLeasely={i === 0} />
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
              * Competitor pricing may charge per-unit fees, transaction fees, or require premium add-ons not reflected here.
              Leasely Pro includes all features for a flat $25/mo with no per-unit fees.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl bg-[#1B2B5E] text-white p-8 text-center space-y-4">
          <h2 className="text-2xl font-black">Ready to switch to Leasely?</h2>
          <p className="text-blue-100">
            Everything your rental business needs in one platform, at one price.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pricing">
              <Button className="bg-[#00C896] hover:bg-[#00C896]/90 text-white gap-2 h-11 px-6">
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
