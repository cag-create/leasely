import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  FileText, Users, CheckCircle2, Clock, XCircle,
  Search, Eye, Download, Share2, Copy, Filter,
  Home, Building2, ChevronDown, AlertCircle, Plus, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

// ApplyConnect co-branded background check portal — set in Railway as VITE_APPLYCONNECT_PARTNER_URL
// once partnership is approved. Until then the button shows a "Coming Soon" state.
// Earns 25% royalty per completed report (≈$10/check).
const APPLYCONNECT_URL = import.meta.env.VITE_APPLYCONNECT_PARTNER_URL || "";

const STATE_DISCLOSURES: Record<string, string> = {
  CA: "California: Applicants have the right to receive a copy of any consumer report obtained. Landlord must provide written notice before obtaining a credit report.",
  NY: "New York: It is illegal to discriminate against any person because of race, creed, color, national origin, sexual orientation, military status, sex, disability, predisposing genetic characteristics, familial status, marital status, or domestic violence victim status.",
  TX: "Texas: A landlord may not retaliate against a tenant by filing an eviction proceeding, depriving the tenant of the use of the premises, decreasing services to the tenant, or increasing the tenant's rent.",
  FL: "Florida: Florida law requires landlords to disclose the name and address of the person authorized to receive notices and demands. Security deposits must be held in a separate account.",
  IL: "Illinois: The Chicago Residential Landlord and Tenant Ordinance provides specific rights and responsibilities for landlords and tenants in Chicago.",
  WA: "Washington: Landlords must provide a written checklist of the condition of the rental unit at the beginning of the tenancy.",
  CO: "Colorado: Landlords must return security deposits within 30 days of the tenant vacating the property.",
  GA: "Georgia: Landlords must return security deposits within 30 days and provide an itemized list of deductions.",
  AZ: "Arizona: Landlords must return security deposits within 14 business days after the tenant vacates.",
  NC: "North Carolina: Landlords must return security deposits within 30 days, or within 60 days if there are deductions.",
  OH: "Ohio: Landlords must return security deposits within 30 days of the tenant vacating.",
  PA: "Pennsylvania: Landlords must return security deposits within 30 days of the tenant vacating.",
  MI: "Michigan: Landlords must return security deposits within 30 days of the tenant vacating.",
  NJ: "New Jersey: New Jersey law prohibits discrimination based on source of lawful income, including Section 8 vouchers.",
  VA: "Virginia: Landlords must return security deposits within 45 days of the tenant vacating.",
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

type ApplicationStatus = "submitted" | "under_review" | "approved" | "denied" | "all";

function computeTenantScore(app: any): { score: number; grade: string; color: string; bgColor: string } {
  let score = 0;
  const income = parseFloat(app.monthlyIncome ?? "0");
  if (income >= 4500) score += 40;
  else if (income >= 3750) score += 25;
  else if (income >= 3000) score += 10;
  if (app.employerName) score += 15;
  if (app.currentLandlordName) score += 15;
  if (app.emergencyContactName) score += 10;
  if (!app.hasPets) score += 5;
  if (app.backgroundCheckConsent) score += 15;

  if (score >= 80) return { score, grade: "Excellent", color: "text-[#00C896]", bgColor: "bg-[#00C896]/10 border-[#00C896]/20" };
  if (score >= 65) return { score, grade: "Good", color: "text-blue-500", bgColor: "bg-blue-500/10 border-blue-500/20" };
  if (score >= 50) return { score, grade: "Fair", color: "text-amber-500", bgColor: "bg-amber-500/10 border-amber-500/20" };
  return { score, grade: "Review", color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/20" };
}

export default function RentalApplications() {
  const [activeTab, setActiveTab] = useState<"received" | "send">("received");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<number | null>(null);

  const { data: applications, isLoading } = trpc.applications.list.useQuery();
  const { data: listings } = trpc.marketplace.getMyListings.useQuery();

  const filtered = (applications ?? []).filter(app => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.applicantName?.toLowerCase().includes(q) ||
        app.applicantEmail?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusCounts = {
    all: applications?.length ?? 0,
    submitted: applications?.filter(a => a.status === "submitted").length ?? 0,
    under_review: applications?.filter(a => a.status === "reviewing").length ?? 0,
    approved: applications?.filter(a => a.status === "approved").length ?? 0,
    denied: applications?.filter(a => a.status === "denied").length ?? 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rental Applications</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage applications, send shareable forms, and review applicants
            </p>
          </div>
          <Button
            className="gap-2 bg-[#00C896] hover:bg-[#00A87C] text-[#062018] font-semibold"
            onClick={() => setActiveTab("send")}
          >
            <Plus className="h-4 w-4" /> Send Application Link
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {[
            { id: "received", label: "Received Applications" },
            { id: "send", label: "Send Application" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "received" ? (
          <ReceivedApplications
            applications={filtered}
            isLoading={isLoading}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusCounts={statusCounts}
            selectedApp={selectedApp}
            setSelectedApp={setSelectedApp}
          />
        ) : (
          <SendApplicationTab listings={listings ?? []} />
        )}
      </div>
    </DashboardLayout>
  );
}

function ReceivedApplications({
  applications, isLoading, statusFilter, setStatusFilter,
  searchQuery, setSearchQuery, statusCounts, selectedApp, setSelectedApp
}: any) {
  const utils = trpc.useUtils();
  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: () => utils.applications.list.invalidate(),
  });

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-600", icon: Clock },
    reviewing: { label: "Under Review", color: "bg-amber-500/10 text-amber-600", icon: Eye },
    approved: { label: "Approved", color: "bg-green-500/10 text-green-600", icon: CheckCircle2 },
    denied: { label: "Denied", color: "bg-red-500/10 text-red-600", icon: XCircle },
    withdrawn: { label: "Withdrawn", color: "bg-gray-500/10 text-gray-600", icon: XCircle },
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "submitted", "under_review", "approved", "denied"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              <span className="ml-1.5 opacity-60">{statusCounts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : !applications.length ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No applications yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Send a shareable application link to prospective tenants. They can fill it out on any device.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app: any) => {
            const sc = statusConfig[app.status] ?? statusConfig.submitted;
            const StatusIcon = sc.icon;
            const isColiving = app.applicationFormType === "coliving_member";

            return (
              <div
                key={app.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {(app.applicantName || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{app.applicantName}</div>
                      <div className="text-xs text-muted-foreground truncate">{app.applicantEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isColiving && (
                      <Badge className="bg-purple-500/10 text-purple-600 border-0 text-xs">Member App</Badge>
                    )}
                    {(() => {
                      const ts = computeTenantScore(app);
                      return (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ts.bgColor} ${ts.color}`}>
                          {ts.score} · {ts.grade}
                        </span>
                      );
                    })()}
                    {app.state && (
                      <Badge variant="outline" className="text-xs">{app.state}</Badge>
                    )}
                    <Badge className={`${sc.color} border-0 text-xs gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {sc.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {selectedApp === app.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {app.occupation && <InfoRow label="Occupation" value={app.occupation} />}
                      {app.monthlyIncome && <InfoRow label="Monthly Income" value={`$${app.monthlyIncome}`} />}
                      {app.employerName && <InfoRow label="Employer" value={app.employerName} />}
                      {app.currentAddress && <InfoRow label="Current Address" value={app.currentAddress} />}
                      {app.moveInDate && <InfoRow label="Move-in Date" value={app.moveInDate} />}
                      {app.hasPets ? <InfoRow label="Pets" value={app.petDescription || "Yes"} /> : null}
                    </div>
                    {app.state && STATE_DISCLOSURES[app.state] && (
                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
                        <div className="font-semibold mb-1 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          State Disclosure — {app.state}
                        </div>
                        {STATE_DISCLOSURES[app.state]}
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                   {(["reviewing", "approved", "denied"] as const).map(s => (                        <Button
                          key={s}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          disabled={app.status === s || updateStatus.isPending}
                          onClick={e => {
                            e.stopPropagation();
                            updateStatus.mutate({ id: app.id, status: s });
                          }}
                        >
                          Mark {s === "reviewing" ? "Under Review" : s.replace(/\b\w/g, c => c.toUpperCase())}
                        </Button>
                      ))}

                      {/* Background check via ApplyConnect (TransUnion-backed, $39.95 paid by applicant) */}
                      {app.backgroundCheckConsent ? (
                        <Button
                          size="sm"
                          className="text-xs h-7 gap-1.5 bg-[#00C896] hover:bg-[#00b386] text-[#0a2a1f]"
                          disabled={!APPLYCONNECT_URL}
                          onClick={e => {
                            e.stopPropagation();
                            if (!APPLYCONNECT_URL) {
                              toast.info("Background checks launching soon — partnership pending.");
                              return;
                            }
                            // Open co-branded portal with applicant info as URL params (most ApplyConnect
                            // co-branded portals accept these for prefill; harmless if ignored).
                            const params = new URLSearchParams({
                              email: app.applicantEmail ?? "",
                              firstName: (app.applicantName ?? "").split(" ")[0] ?? "",
                              lastName: (app.applicantName ?? "").split(" ").slice(1).join(" "),
                            });
                            window.open(`${APPLYCONNECT_URL}?${params.toString()}`, "_blank", "noopener");
                          }}
                          title={APPLYCONNECT_URL ? "Open ApplyConnect background check (TransUnion-backed)" : "Background check integration launching soon"}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {APPLYCONNECT_URL ? "Run Background Check" : "Background Check (Soon)"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic px-2 py-1 self-center">
                          Applicant did not consent to background check
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground text-sm">{value}</div>
    </div>
  );
}

function SendApplicationTab({ listings }: { listings: any[] }) {
  const [formType, setFormType] = useState<"standard" | "coliving_member">("standard");
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState("CA");
  const [copied, setCopied] = useState(false);

  const selectedListing = listings.find(l => l.id === selectedListingId);
  const isColiving = selectedListing?.listingType === "co_living" || formType === "coliving_member";

  // Generate shareable application URL
  const appUrl = selectedListingId
    ? `${window.location.origin}/apply/${selectedListingId}?type=${formType}&state=${selectedState}`
    : null;

  const copyLink = () => {
    if (!appUrl) return;
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    toast.success("Application link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (!appUrl) return;
    if (navigator.share) {
      navigator.share({ title: "Rental Application", url: appUrl });
    } else {
      copyLink();
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Configuration */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Application Settings</h3>

          {/* Select listing */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Select Property</label>
            <select
              className="w-full h-9 rounded-lg border border-border bg-background text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={selectedListingId ?? ""}
              onChange={e => setSelectedListingId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Choose a listing...</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>{l.title || l.address}</option>
              ))}
            </select>
          </div>

          {/* Application type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Application Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormType("standard")}
                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  formType === "standard"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Home className="h-4 w-4 mb-1.5" />
                <div className="font-semibold">Standard</div>
                <div className="text-xs opacity-70">Long-term rental</div>
              </button>
              <button
                onClick={() => setFormType("coliving_member")}
                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  formType === "coliving_member"
                    ? "border-purple-500 bg-purple-500/5 text-purple-600"
                    : "border-border text-muted-foreground hover:border-purple-400/40"
                }`}
              >
                <Users className="h-4 w-4 mb-1.5" />
                <div className="font-semibold">Members</div>
                <div className="text-xs opacity-70">Co-living application</div>
              </button>
            </div>
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">State</label>
            <select
              className="w-full h-9 rounded-lg border border-border bg-background text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
            >
              {US_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {STATE_DISCLOSURES[selectedState] && (
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  State Disclosure — {selectedState}
                </div>
                {STATE_DISCLOSURES[selectedState]}
              </div>
            )}
          </div>
        </div>

        {/* Shareable link */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Shareable Application Link</h3>
          {appUrl ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={appUrl}
                  readOnly
                  className="text-xs font-mono bg-muted border-0 flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={copyLink}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <Button
                className="w-full gap-2 bg-[#00C896] hover:bg-[#00A87C] text-[#062018] font-semibold"
                onClick={shareLink}
              >
                <Share2 className="h-4 w-4" />
                Share Application Link
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Works on any device — mobile, tablet, or desktop
              </p>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Select a property above to generate a shareable link
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Form Preview</h3>
          <Badge className={formType === "coliving_member" ? "bg-purple-500/10 text-purple-600 border-0" : "bg-[#00C896]/10 text-[#00C896] border-0"}>
            {formType === "coliving_member" ? "Members Application" : "Standard Application"}
          </Badge>
        </div>

        <div className="space-y-3 text-sm">
          <SectionPreview title="Personal Information" fields={["Full Name", "Email Address", "Phone Number", "Date of Birth"]} />
          <SectionPreview title="Current Residence" fields={["Current Address", "Current Landlord", "Monthly Rent", "Reason for Leaving"]} />
          <SectionPreview title="Employment & Income" fields={["Employer Name", "Occupation", "Monthly Income"]} />
          {formType === "coliving_member" ? (
            <SectionPreview title="Co-living Preferences" fields={["Preferred Move-in Date", "Room Preference", "Lifestyle Notes", "House Rules Agreement"]} highlight />
          ) : (
            <SectionPreview title="Additional Details" fields={["Pets", "Vehicles", "Additional Occupants", "Emergency Contact"]} />
          )}
          <SectionPreview title="Consents & Signature" fields={["Background Check Consent", "Credit Check Consent", "State Disclosure Agreement", "Digital Signature"]} />
        </div>
      </div>
    </div>
  );
}

function SectionPreview({ title, fields, highlight }: { title: string; fields: string[]; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 border ${highlight ? "border-purple-500/30 bg-purple-500/5" : "border-border bg-muted/30"}`}>
      <div className={`text-xs font-semibold mb-2 ${highlight ? "text-purple-600" : "text-muted-foreground"}`}>{title}</div>
      <div className="grid grid-cols-2 gap-1">
        {fields.map(f => (
          <div key={f} className="flex items-center gap-1.5 text-xs text-foreground">
            <div className={`w-1 h-1 rounded-full ${highlight ? "bg-purple-500" : "bg-[#00C896]"}`} />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
