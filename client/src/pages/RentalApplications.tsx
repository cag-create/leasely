import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  FileText, Users, CheckCircle2, Clock, XCircle,
  Search, Eye, Download, Share2, Copy, Filter,
  Home, Building2, ChevronDown, AlertCircle, Plus, ShieldCheck,
  Sparkles, ThumbsUp, AlertTriangle, ThumbsDown, Briefcase, DollarSign,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

// Applicants enter money as free-text ("$6,000", "6000", "6,000/mo"). parseFloat
// stops at the first comma, so "6,000" becomes 6 — strip everything that isn't
// a digit or a decimal point before parsing.
function parseMoney(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  const cleaned = String(raw).replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function computeTenantScore(app: any): { score: number; grade: string; color: string; bgColor: string } {
  let score = 0;
  const income = parseMoney(app.monthlyIncome);
  if (income >= 4500) score += 40;
  else if (income >= 3750) score += 25;
  else if (income >= 3000) score += 10;
  if (app.employerName) score += 15;
  if (app.currentLandlordName) score += 15;
  if (app.emergencyContactName) score += 10;
  if (!app.hasPets) score += 5;
  if (app.backgroundCheckConsent) score += 15;

  if (score >= 80) return { score, grade: "Excellent", color: "text-[#F5A623]", bgColor: "bg-[#F5A623]/10 border-[#F5A623]/20" };
  if (score >= 65) return { score, grade: "Good", color: "text-blue-500", bgColor: "bg-blue-500/10 border-blue-500/20" };
  if (score >= 50) return { score, grade: "Fair", color: "text-amber-500", bgColor: "bg-amber-500/10 border-amber-500/20" };
  return { score, grade: "Review", color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/20" };
}

export default function RentalApplications() {
  const [activeTab, setActiveTab] = useState<"received" | "send">("received");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  // Tracks which application IDs have had AI screening run this session.
  // Score + AI summary stay hidden until the landlord clicks "Run AI Screening".
  const [screenedIds, setScreenedIds] = useState<Set<number>>(new Set());
  const [screeningId, setScreeningId] = useState<number | null>(null);
  // Per-app error message so the empty-state banner can show *why* a previous
  // attempt failed (missing API key, timeout, etc.) instead of just toasting.
  const [screeningErrors, setScreeningErrors] = useState<Record<number, string>>({});

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
            className="gap-2 bg-[#F5A623] hover:bg-[#E8951A] text-[#062018] font-semibold"
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
            screenedIds={screenedIds}
            setScreenedIds={setScreenedIds}
            screeningId={screeningId}
            setScreeningId={setScreeningId}
            screeningErrors={screeningErrors}
            setScreeningErrors={setScreeningErrors}
          />
        ) : (
          <SendApplicationTab listings={listings ?? []} />
        )}
      </div>
    </DashboardLayout>
  );
}

// Pull the AI recommendation out of an application row, if a screening
// has been run. Returns null when no LLM result is stored or parsing fails.
function getAiRecommendation(app: any): string | null {
  if (!app?.aiScreeningResult) return null;
  try {
    const parsed = typeof app.aiScreeningResult === "string"
      ? JSON.parse(app.aiScreeningResult)
      : app.aiScreeningResult;
    return parsed?.recommendation ?? null;
  } catch {
    return null;
  }
}

const REC_LABEL: Record<string, string> = {
  approve: "Approve",
  approve_with_conditions: "Approve with Conditions",
  manual_review: "Manual Review",
  request_more_info: "Request More Info",
  decline: "Decline",
};

function ReceivedApplications({
  applications, isLoading, statusFilter, setStatusFilter,
  searchQuery, setSearchQuery, statusCounts, selectedApp, setSelectedApp,
  screenedIds, setScreenedIds, screeningId, setScreeningId,
  screeningErrors, setScreeningErrors,
}: any) {
  const utils = trpc.useUtils();
  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: () => utils.applications.list.invalidate(),
  });

  // Override modal state — opened when a landlord clicks "Mark Approved"
  // on an application the AI flagged for decline or manual_review.
  const [override, setOverride] = useState<{
    appId: number;
    recommendation: string;
  } | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const overrideValid = overrideReason.trim().length >= 10;

  const confirmOverride = () => {
    if (!override || !overrideValid) return;
    updateStatus.mutate(
      {
        id: override.appId,
        status: "approved",
        overrideReason: overrideReason.trim(),
        overrideRecommendation: override.recommendation,
      },
      {
        onSuccess: () => {
          toast.success("Application approved. Override reason saved to audit trail.");
          setOverride(null);
          setOverrideReason("");
        },
        onError: (e: any) => {
          toast.error(e?.message ?? "Failed to save override.");
        },
      },
    );
  };

  const handleStatusClick = (app: any, target: "reviewing" | "approved" | "denied") => {
    // Only "approved" gates through the override modal — and only when the AI
    // flagged the applicant for decline/manual_review. All other transitions
    // (denying, marking under review, approving an AI-approved applicant)
    // fire the mutation immediately.
    if (target === "approved") {
      const rec = getAiRecommendation(app);
      if (rec === "decline" || rec === "manual_review") {
        setOverrideReason("");
        setOverride({ appId: app.id, recommendation: rec });
        return;
      }
    }
    updateStatus.mutate({ id: app.id, status: target });
  };
  const screenMut = (trpc as any).applications.runAiScreening.useMutation({
    onSuccess: (_res: any, vars: { id: number }) => {
      setScreenedIds((prev: Set<number>) => {
        const next = new Set(prev);
        next.add(vars.id);
        return next;
      });
      setScreeningId(null);
      setScreeningErrors((prev: Record<number, string>) => {
        const next = { ...prev };
        delete next[vars.id];
        return next;
      });
      utils.applications.list.invalidate();
      toast.success("AI screening complete.");
    },
    onError: (e: any, vars: { id: number }) => {
      setScreeningId(null);
      const msg = e?.message ?? "AI screening failed — try again.";
      setScreeningErrors((prev: Record<number, string>) => ({ ...prev, [vars.id]: msg }));
      toast.error(msg);
    },
  });
  const runScreening = (id: number) => {
    if (screenedIds.has(id) || screeningId !== null) return;
    setScreeningId(id);
    setScreeningErrors((prev: Record<number, string>) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Client-side safety net: if the screening call hangs (network stall,
    // missing OPENAI key on server, etc.), clear the spinner after 120s and
    // surface an actionable error rather than leaving the user stuck. The
    // server enforces an 80s hard cutoff, so 120s leaves room for the round
    // trip and any tRPC overhead.
    const timeoutHandle = window.setTimeout(() => {
      setScreeningId((current: number | null) => {
        if (current === id) {
          const msg = "AI screening took too long. Check that OPENAI_API_KEY is configured on the server, then try again.";
          toast.error(msg);
          setScreeningErrors((prev: Record<number, string>) => ({ ...prev, [id]: msg }));
          return null;
        }
        return current;
      });
    }, 120_000);
    screenMut.mutate(
      { id },
      {
        onSettled: () => window.clearTimeout(timeoutHandle),
      },
    );
  };

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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/40 text-foreground border-border hover:bg-muted hover:border-primary/60"
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
                    {screenedIds.has(app.id) && (() => {
                      const ts = computeTenantScore(app);
                      return (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ts.bgColor} ${ts.color}`}>
                          {ts.score} · {ts.grade}
                        </span>
                      );
                    })()}
                    {!screenedIds.has(app.id) && screeningId !== app.id && (
                      <span className="text-[11px] text-muted-foreground italic">Not yet screened</span>
                    )}
                    {screeningId === app.id && (
                      <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3 animate-pulse" /> Screening…
                      </span>
                    )}
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
                  <div className="mt-4 pt-4 border-t-2 border-primary/30 space-y-4 bg-muted/30 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl">
                    {/* AI screening — gated until landlord triggers it.
                        Already-screened apps (stored aiScreeningResult) auto-show. */}
                    {screenedIds.has(app.id) || app.aiScreeningResult ? (
                      <AIScreeningPanel app={app} />
                    ) : (
                      <div className={`rounded-xl border-2 border-dashed p-5 text-center ${screeningErrors[app.id] ? "border-red-400/50 bg-red-500/5" : "border-primary/40 bg-primary/5"}`}>
                        <Sparkles className={`h-6 w-6 mx-auto mb-2 ${screeningErrors[app.id] ? "text-red-500" : "text-primary"}`} />
                        <h4 className="font-bold text-sm text-foreground mb-1">
                          {screeningErrors[app.id] ? "AI Screening failed" : "AI Screening not yet run"}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          {screeningErrors[app.id]
                            ? "The last attempt didn't complete. See the reason below — fix it on the server, then retry."
                            : "Click below to score this applicant and surface income, employment, and reference signals."}
                        </p>
                        {screeningErrors[app.id] && (
                          <div className="mb-3 text-left max-w-md mx-auto rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-[11px] font-mono text-red-700 dark:text-red-400 break-words">
                            {screeningErrors[app.id]}
                          </div>
                        )}
                        <Button
                          size="sm"
                          disabled={screeningId !== null}
                          onClick={(e) => { e.stopPropagation(); runScreening(app.id); }}
                          className="gap-1.5"
                        >
                          {screeningId === app.id ? (
                            <><Sparkles className="h-3.5 w-3.5 animate-pulse" /> Screening…</>
                          ) : (
                            <><Sparkles className="h-3.5 w-3.5" /> {screeningErrors[app.id] ? "Retry AI Screening" : "Run AI Screening"}</>
                          )}
                        </Button>
                      </div>
                    )}

                    <FullApplicationReview app={app} />
                    {app.state && STATE_DISCLOSURES[app.state] && (
                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
                        <div className="font-semibold mb-1 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          State Disclosure — {app.state}
                        </div>
                        {STATE_DISCLOSURES[app.state]}
                      </div>
                    )}
                    {/* AI-override audit note — shown after a landlord
                        approved an AI-flagged applicant. Read-only. */}
                    {app.aiOverrideReason && (
                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
                        <div className="font-semibold mb-1 flex items-center gap-1.5">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          AI recommendation overridden
                          {app.aiOverrideAt && (
                            <span className="font-normal opacity-70">
                              · {new Date(app.aiOverrideAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="opacity-90"><span className="font-medium">Reason:</span> {app.aiOverrideReason}</div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {(["reviewing", "approved", "denied"] as const).map(s => {
                        const isCurrent = app.status === s;
                        // Color-coded high-contrast styling per action — readable
                        // against the dark dashboard background. The current
                        // state is dimmed to 50% so it's obvious which is active.
                        const style =
                          s === "reviewing"
                            ? "text-xs h-8 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-semibold gap-1.5"
                            : s === "approved"
                            ? "text-xs h-8 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/50 font-semibold gap-1.5"
                            : "text-xs h-8 bg-red-500/15 hover:bg-red-500/25 text-red-700 dark:text-red-300 border border-red-500/40 font-semibold gap-1.5";
                        const Icon =
                          s === "reviewing" ? Eye : s === "approved" ? CheckCircle2 : XCircle;
                        const label =
                          s === "reviewing" ? "Mark Under Review" :
                          s === "approved" ? "Mark Approved" :
                          "Mark Denied";
                        return (
                          <Button
                            key={s}
                            variant="outline"
                            size="sm"
                            className={`${style} ${isCurrent ? "opacity-50" : ""}`}
                            disabled={isCurrent || updateStatus.isPending}
                            onClick={e => {
                              e.stopPropagation();
                              handleStatusClick(app, s);
                            }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </Button>
                        );
                      })}

                      {/* Background check via ApplyConnect (TransUnion-backed, $39.95 paid by applicant) */}
                      {app.backgroundCheckConsent ? (
                        <Button
                          size="sm"
                          className="text-xs h-7 gap-1.5 bg-[#F5A623] hover:bg-[#E8951A] text-[#3A2410]"
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

      {/* AI override confirmation modal — gates "Mark Approved" when the AI
          flagged the applicant for decline or manual_review. The typed
          reason is persisted to rentalApplications.aiOverrideReason for
          fair-housing audit defensibility. */}
      <Dialog open={!!override} onOpenChange={open => { if (!open) { setOverride(null); setOverrideReason(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Override AI Recommendation?
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              The AI screening recommended <span className="font-semibold text-foreground">
                {override ? (REC_LABEL[override.recommendation] ?? override.recommendation) : ""}
              </span> for this applicant based on the risk factors shown above. Approving now will override that recommendation.
              <br /><br />
              For fair-housing compliance, please document why you're approving despite the AI's concerns. This note is saved to the application's audit trail and is not shown to the applicant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="override-reason" className="text-xs font-semibold">
              Reason for override <span className="text-muted-foreground font-normal">(required, 10+ characters)</span>
            </Label>
            <Textarea
              id="override-reason"
              autoFocus
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              placeholder={'e.g. "Co-signer added covering 3x rent" or "Verified employer by phone — generic name was a DBA"'}
              rows={4}
              className="resize-none"
            />
            <div className="text-[11px] text-muted-foreground text-right tabular-nums">
              {overrideReason.trim().length}/10
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => { setOverride(null); setOverrideReason(""); }}
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#F5A623] hover:bg-[#E8951A] text-[#3A2410] font-semibold disabled:opacity-50"
              onClick={confirmOverride}
              disabled={!overrideValid || updateStatus.isPending}
            >
              {updateStatus.isPending ? "Saving…" : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

// ── AI Screening panel ──────────────────────────────────────────────────────
// Renders the LLM-generated screening rubric (income/employment/rental-history/
// identity verdicts + risk factors + verification checklist) when one is stored
// on the application. Falls back to the deterministic score + issue list when
// the LLM call hasn't been made yet or failed.
function AIScreeningPanel({ app }: { app: any }) {
  // Try the stored LLM result first.
  const llm = (() => {
    if (!app?.aiScreeningResult) return null;
    try {
      return typeof app.aiScreeningResult === "string"
        ? JSON.parse(app.aiScreeningResult)
        : app.aiScreeningResult;
    } catch {
      return null;
    }
  })();
  if (llm) return <AiScreeningLlmView llm={llm} screenedAt={app.aiScreenedAt} />;

  const income = parseMoney(app.monthlyIncome);
  const currentRent = parseMoney(app.currentRent);
  const targetRent = parseMoney(app.listingRent ?? app.targetRent ?? app.rentAmount);
  const incomeToRentRatio = targetRent > 0 ? income / targetRent : 0;
  const score = computeTenantScore(app);
  const issues = computeScreeningIssues(app);

  const factors: Array<{ label: string; weight: number; ok: boolean; note: string }> = [
    {
      label: "Income",
      weight: 40,
      ok: income >= 4500,
      note: income >= 4500
        ? `Strong: $${income.toLocaleString()}/mo`
        : income >= 3750
          ? `Moderate: $${income.toLocaleString()}/mo`
          : income >= 3000
            ? `Light: $${income.toLocaleString()}/mo`
            : income > 0
              ? `Below threshold: $${income.toLocaleString()}/mo`
              : "Not provided",
    },
    { label: "Employer on file", weight: 15, ok: !!app.employerName, note: app.employerName || "Missing" },
    { label: "Prior landlord reference", weight: 15, ok: !!app.currentLandlordName, note: app.currentLandlordName || "Missing" },
    { label: "Background-check consent", weight: 15, ok: !!app.backgroundCheckConsent, note: app.backgroundCheckConsent ? "Consented" : "Not consented" },
    { label: "Emergency contact", weight: 10, ok: !!app.emergencyContactName, note: app.emergencyContactName || "Missing" },
    { label: "No pets", weight: 5, ok: !app.hasPets, note: app.hasPets ? (app.petDescription || "Has pets") : "None" },
  ];

  const recommendation: { tone: "approve" | "review" | "decline"; label: string; reason: string } =
    score.score >= 80
      ? { tone: "approve", label: "Recommend: Approve", reason: "Strong income, complete file, screening signals favorable." }
      : score.score >= 65
        ? { tone: "review", label: "Recommend: Review", reason: "Generally solid — verify any missing items below before approving." }
        : score.score >= 50
          ? { tone: "review", label: "Recommend: Manual Review", reason: "Borderline. Confirm income with paystubs and call prior landlord." }
          : { tone: "decline", label: "Recommend: Decline or Request More Info", reason: "Significant gaps in the file. Run background check before any decision." };

  const recColor =
    recommendation.tone === "approve" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400" :
    recommendation.tone === "decline" ? "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400" :
    "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400";
  const RecIcon = recommendation.tone === "approve" ? ThumbsUp : recommendation.tone === "decline" ? ThumbsDown : AlertTriangle;

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-sm text-foreground">AI Screening Summary</h4>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${score.bgColor} ${score.color}`}>
          {score.score}/100 · {score.grade}
        </span>
      </div>

      <div className={`rounded-lg border px-3 py-2 flex items-start gap-2 ${recColor}`}>
        <RecIcon className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="text-xs">
          <div className="font-semibold">{recommendation.label}</div>
          <div className="opacity-90">{recommendation.reason}</div>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Score breakdown</div>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {factors.map(f => (
            <div key={f.label} className="flex items-center justify-between gap-2 bg-card/60 rounded-md px-2.5 py-1.5 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                {f.ok
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  : <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                <span className="font-medium truncate">{f.label}</span>
              </div>
              <span className={`text-[11px] truncate ml-2 ${f.ok ? "text-foreground" : "text-muted-foreground"}`}>
                {f.note} <span className="opacity-50">· +{f.weight}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {issues.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Issues Found ({issues.length})
          </div>
          <ul className="space-y-1.5">
            {issues.map((iss, i) => {
              const color =
                iss.severity === "high" ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400" :
                iss.severity === "medium" ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" :
                "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400";
              return (
                <li key={i} className={`rounded-md border px-2.5 py-1.5 text-xs ${color}`}>
                  <span className="font-semibold">{iss.title}.</span>{" "}
                  <span className="opacity-90">{iss.detail}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground italic">
        Score and issues are informational only. Leasely is not a consumer reporting agency. Run a TransUnion-backed
        background check via ApplyConnect before relying on this for an adverse action decision.
      </p>
    </div>
  );
}

// LLM-generated screening view. Conforms to the ScreeningSchema produced by
// the applications.runAiScreening tRPC mutation in server/routers.ts.
function AiScreeningLlmView({ llm, screenedAt }: { llm: any; screenedAt?: string | Date | null }) {
  const recTone =
    llm.recommendation === "approve" ? "approve" :
    llm.recommendation === "decline" ? "decline" :
    "review";
  const recColor =
    recTone === "approve" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400" :
    recTone === "decline" ? "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400" :
    "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400";
  const RecIcon = recTone === "approve" ? ThumbsUp : recTone === "decline" ? ThumbsDown : AlertTriangle;
  const recLabel = {
    approve: "Recommend: Approve",
    approve_with_conditions: "Recommend: Approve with Conditions",
    manual_review: "Recommend: Manual Review",
    request_more_info: "Recommend: Request More Info",
    decline: "Recommend: Decline",
  }[llm.recommendation as string] ?? "Recommend: Manual Review";

  // overallScore is a RISK score: HIGHER = HIGHER RISK. Bands match the
  // server prompt rubric in server/routers.ts (0–24 low, 25–49 moderate-low,
  // 50–74 moderate-high, 75–100 high). Color is inverted from a typical
  // "credit score" intuition so red always means trouble.
  const score = Math.round(llm.overallScore ?? 0);
  const scoreColor =
    score >= 75 ? "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400" :
    score >= 50 ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400" :
    score >= 25 ? "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-400" :
    "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400";
  const scoreBarFill =
    score >= 75 ? "bg-red-500" :
    score >= 50 ? "bg-amber-500" :
    score >= 25 ? "bg-blue-500" :
    "bg-emerald-500";

  const verdictBadge = (v: string) => {
    const map: Record<string, string> = {
      strong: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      adequate: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      tight: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      insufficient: "bg-red-500/15 text-red-700 dark:text-red-400",
      unverifiable: "bg-muted text-muted-foreground",
      likely_real: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      likely_fake: "bg-red-500/15 text-red-700 dark:text-red-400",
      no_employer: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      none: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      short_tenure: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      very_short_tenure: "bg-red-500/15 text-red-700 dark:text-red-400",
      no_start_date: "bg-muted text-muted-foreground",
      verifiable: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      thin: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      missing: "bg-red-500/15 text-red-700 dark:text-red-400",
      suspicious: "bg-red-500/15 text-red-700 dark:text-red-400",
      complete: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      minor_gaps: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      major_gaps: "bg-red-500/15 text-red-700 dark:text-red-400",
    };
    return map[v] ?? "bg-muted text-muted-foreground";
  };

  const sevColor = (s: string) =>
    s === "high" ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400" :
    s === "medium" ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" :
    "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400";

  const priColor = (p: string) =>
    p === "required" ? "bg-red-500/15 text-red-700 dark:text-red-400" :
    p === "recommended" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
    "bg-muted text-muted-foreground";

  const ratio = llm.income?.rentToIncomeRatio;

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-sm text-foreground">AI Screening Summary</h4>
          {screenedAt && (
            <span className="text-[10px] text-muted-foreground">
              · {new Date(screenedAt).toLocaleString()}
            </span>
          )}
        </div>
        <div className={`rounded-lg border px-3 py-1.5 ${scoreColor}`}>
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Risk Score</span>
            <span className="text-sm font-black tabular-nums">{score}/100</span>
          </div>
          <div className="text-[10px] opacity-70 leading-tight">higher = more risk</div>
          <div className="mt-1 h-1 w-full rounded-full bg-current/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${scoreBarFill}`}
              style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            />
          </div>
        </div>
      </div>

      <div className={`rounded-lg border px-3 py-2 flex items-start gap-2 ${recColor}`}>
        <RecIcon className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="text-xs">
          <div className="font-semibold">{recLabel}</div>
          <div className="opacity-90">{llm.recommendationReason}</div>
        </div>
      </div>

      {/* Four rubric cards */}
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-lg border bg-card/60 px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3 w-3" /> Income
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${verdictBadge(llm.income?.affordabilityVerdict ?? "")}`}>
              {llm.income?.affordabilityVerdict?.replace(/_/g, " ")}
            </span>
          </div>
          {ratio != null && (
            <div className="text-[11px] text-muted-foreground mb-1">
              Rent / income: <span className="font-semibold text-foreground">{(ratio * 100).toFixed(0)}%</span>
            </div>
          )}
          <p className="text-xs">{llm.income?.notes}</p>
        </div>

        <div className="rounded-lg border bg-card/60 px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3 w-3" /> Employment
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${verdictBadge(llm.employment?.employerVerificationStatus ?? "")}`}>
              {llm.employment?.employerVerificationStatus?.replace(/_/g, " ")}
            </span>
          </div>
          {llm.employment?.tenureConcern && llm.employment.tenureConcern !== "none" && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mb-1">
              ⚠ {llm.employment.tenureConcern.replace(/_/g, " ")}
            </div>
          )}
          <p className="text-xs">{llm.employment?.notes}</p>
        </div>

        <div className="rounded-lg border bg-card/60 px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Home className="h-3 w-3" /> Rental History
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${verdictBadge(llm.rentalHistory?.landlordReferenceQuality ?? "")}`}>
              {llm.rentalHistory?.landlordReferenceQuality}
            </span>
          </div>
          {Array.isArray(llm.rentalHistory?.redFlags) && llm.rentalHistory.redFlags.length > 0 && (
            <ul className="text-[11px] text-red-600 dark:text-red-400 mb-1 list-disc list-inside">
              {llm.rentalHistory.redFlags.map((rf: string, i: number) => <li key={i}>{rf}</li>)}
            </ul>
          )}
          <p className="text-xs">{llm.rentalHistory?.notes}</p>
        </div>

        <div className="rounded-lg border bg-card/60 px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Identity
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${verdictBadge(llm.identity?.completeness ?? "")}`}>
              {llm.identity?.completeness?.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs">{llm.identity?.notes}</p>
        </div>
      </div>

      {Array.isArray(llm.riskFactors) && llm.riskFactors.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Risk Factors ({llm.riskFactors.length})
          </div>
          <ul className="space-y-1.5">
            {llm.riskFactors.map((rf: any, i: number) => (
              <li key={i} className={`rounded-md border px-2.5 py-1.5 text-xs ${sevColor(rf.severity)}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold">{rf.title}</span>
                  <span className="text-[10px] opacity-70 uppercase">· {rf.category?.replace(/_/g, " ")}</span>
                </div>
                <div className="opacity-90">{rf.detail}</div>
                {rf.actionRecommended && (
                  <div className="mt-1 text-[11px] opacity-80"><span className="font-semibold">Action:</span> {rf.actionRecommended}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(llm.verificationChecklist) && llm.verificationChecklist.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verification Checklist
          </div>
          <ul className="space-y-1">
            {llm.verificationChecklist.map((v: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs bg-card/60 rounded-md px-2.5 py-1.5">
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${priColor(v.priority)}`}>
                  {v.priority}
                </span>
                <div className="min-w-0">
                  <div className="font-medium">{v.item}</div>
                  {v.rationale && <div className="text-[11px] text-muted-foreground">{v.rationale}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground italic">
        AI screening is informational. Leasely is not a consumer reporting agency. Run a TransUnion-backed background
        check via ApplyConnect before relying on this for any adverse action decision. Fair-housing protected
        categories must never influence the decision.
      </p>
    </div>
  );
}

// Deterministic "issues found" list — fallback for when the LLM screening
// hasn't been run yet or failed.
// Severity: high = decline-worthy, medium = needs verification, low = informational.
function computeScreeningIssues(app: any): Array<{ severity: "high" | "medium" | "low"; title: string; detail: string }> {
  const issues: Array<{ severity: "high" | "medium" | "low"; title: string; detail: string }> = [];
  const income = parseMoney(app.monthlyIncome);
  const currentRent = parseMoney(app.currentRent);
  const targetRent = parseMoney(app.listingRent ?? app.targetRent ?? app.rentAmount);

  // ── Income / affordability ────────────────────────────────────────────────
  if (income === 0) {
    issues.push({ severity: "high", title: "No monthly income reported", detail: "Cannot evaluate ability to pay. Request paystubs or offer letter before proceeding." });
  } else if (targetRent > 0 && income < targetRent * 3) {
    const ratio = (income / targetRent).toFixed(1);
    issues.push({ severity: "medium", title: `Income only ${ratio}× target rent (under 3× standard)`, detail: `Stated income $${income.toLocaleString()}/mo vs rent $${targetRent.toLocaleString()}/mo. Industry rule of thumb is ≥3× rent. Consider co-signer or guarantor.` });
  } else if (targetRent === 0 && income < 3000) {
    issues.push({ severity: "medium", title: "Income below typical 3× rent threshold", detail: `Stated income $${income.toLocaleString()}/mo. Verify with paystubs and consider a co-signer or guarantor.` });
  }

  if (currentRent > 0 && income > 0 && currentRent > income * 0.5) {
    issues.push({ severity: "medium", title: "Current rent is >50% of stated income", detail: `Current rent $${currentRent.toLocaleString()} vs income $${income.toLocaleString()}/mo. Cost-burdened applicant — verify support sources.` });
  }

  // ── Employment ────────────────────────────────────────────────────────────
  if (!app.employerName) {
    issues.push({ severity: "medium", title: "No employer on file", detail: "Self-employment or gap in employment? Ask for tax returns or 3 months of bank statements." });
  } else if (app.employerStartDate) {
    const months = monthsBetween(app.employerStartDate, new Date().toISOString().slice(0, 10));
    if (months >= 0 && months < 3) {
      issues.push({ severity: "medium", title: `Employed only ${months} month${months === 1 ? "" : "s"}`, detail: "Short tenure at current job. Ask for offer letter and prior employer reference." });
    }
  }
  if (app.employerName && !app.employerPhone) {
    issues.push({ severity: "low", title: "Employer phone missing", detail: "Cannot verify employment without a contact number. Request before approving." });
  }

  // ── Rental history ────────────────────────────────────────────────────────
  if (!app.currentLandlordName) {
    issues.push({ severity: "medium", title: "No prior landlord reference", detail: "First-time renter or undisclosed history. Call references from elsewhere or require larger deposit where state law allows." });
  } else if (!app.currentLandlordPhone) {
    issues.push({ severity: "low", title: "Landlord phone missing", detail: "Reference is unverifiable without contact info. Request before approving." });
  }
  if (!app.currentAddress) {
    issues.push({ severity: "low", title: "No current address provided", detail: "Mailing history can't be verified. Request prior 2-year address history." });
  }

  // ── Reason for leaving red flags ──────────────────────────────────────────
  if (typeof app.reasonForLeaving === "string") {
    const t = app.reasonForLeaving.toLowerCase();
    if (/evict|notice to vacate|breach|nonpayment|non-payment|behind on rent|kicked out|asked to leave/.test(t)) {
      issues.push({ severity: "high", title: "Reason for leaving flagged", detail: `Self-disclosed terms like "${t.slice(0, 80)}" — investigate via background check + landlord reference.` });
    }
  }

  // ── Background / credit consent ───────────────────────────────────────────
  if (!app.backgroundCheckConsent) {
    issues.push({ severity: "high", title: "Did not consent to background check", detail: "Cannot run criminal/eviction history through ApplyConnect. Strongly consider requesting consent before approving." });
  }
  if (app.creditCheckConsent === false) {
    issues.push({ severity: "medium", title: "No credit-check consent", detail: "Credit pull is unavailable. Rely on income verification + references, or request consent before approving." });
  }

  // ── Self-disclosed history ────────────────────────────────────────────────
  if (app.hasBankruptcy) {
    issues.push({ severity: "medium", title: "Self-disclosed bankruptcy", detail: "Applicant disclosed a prior bankruptcy. Verify discharge date and confirm post-discharge rental history." });
  }
  if (app.hasEviction) {
    issues.push({ severity: "high", title: "Self-disclosed prior eviction", detail: "Applicant disclosed a prior eviction. Investigate circumstances, judgment, and whether the matter is resolved." });
  }
  if (app.hasCriminalRecord) {
    issues.push({ severity: "high", title: "Self-disclosed criminal record", detail: "Applicant disclosed criminal history. Review HUD guidance — blanket bans are discriminatory; assess nature, severity, and time elapsed individually." });
  }

  // ── Identity / fair-housing safe checks ───────────────────────────────────
  if (!app.applicantPhone) {
    issues.push({ severity: "low", title: "No phone number on file", detail: "Hard to reach for verification. Request before scheduling tour or lease send." });
  }
  if (app.applicantEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(app.applicantEmail)) {
    issues.push({ severity: "low", title: "Email format looks invalid", detail: "Double-check the email — typo could mean signing links bounce." });
  }
  if (!app.applicantDob) {
    issues.push({ severity: "low", title: "Date of birth missing", detail: "Required for background-check matching through ApplyConnect / TransUnion." });
  }

  // ── Pets ──────────────────────────────────────────────────────────────────
  if (app.hasPets && !app.petDescription) {
    issues.push({ severity: "low", title: "Pets disclosed but no description", detail: "Get breed, weight, and vaccination records before approving — required by most insurance carriers." });
  }

  // ── Occupants ────────────────────────────────────────────────────────────
  if (typeof app.additionalOccupants === "string" && app.additionalOccupants.length > 2) {
    try {
      const occ = JSON.parse(app.additionalOccupants);
      if (Array.isArray(occ) && occ.length >= 3) {
        issues.push({ severity: "low", title: `${occ.length + 1} total occupants disclosed`, detail: "Confirm the unit's max-occupancy limit complies with HUD's 2-per-bedroom guidance." });
      }
    } catch { /* ignore */ }
  }

  // ── File completeness ─────────────────────────────────────────────────────
  if (!app.emergencyContactName) {
    issues.push({ severity: "low", title: "No emergency contact provided", detail: "Required for most state move-in checklists. Request before lease signing." });
  }
  if (!app.signedAt && !app.signatureDataUrl) {
    issues.push({ severity: "low", title: "Application not e-signed", detail: "Applicant submitted data but didn't complete signature step. The submitted info is not certified." });
  }

  return issues;
}

// Coarse months-between helper used to flag short employment tenure.
function monthsBetween(startISO: string, endISO: string): number {
  try {
    const s = new Date(startISO);
    const e = new Date(endISO);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return -1;
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  } catch { return -1; }
}

// ── Full application review panel ───────────────────────────────────────────
// Shows every populated field on the application, grouped by category, so the
// Pro member can review the full application in one place.
function FullApplicationReview({ app }: { app: any }) {
  const isColiving = app.applicationFormType === "coliving_member";
  let additionalOccupants: any[] = [];
  try {
    if (app.additionalOccupants) {
      const parsed = JSON.parse(app.additionalOccupants);
      if (Array.isArray(parsed)) additionalOccupants = parsed;
    }
  } catch { /* ignore */ }

  return (
    <div className="space-y-4">
      <ReviewSection title="Personal" icon={<Users className="h-3.5 w-3.5" />}>
        <ReviewField label="Full Name" value={app.applicantName} />
        <ReviewField label="Email" value={app.applicantEmail} />
        <ReviewField label="Phone" value={app.applicantPhone} />
        <ReviewField label="Date of Birth" value={app.applicantDob} />
      </ReviewSection>

      <ReviewSection title="Current Housing" icon={<Home className="h-3.5 w-3.5" />}>
        <ReviewField label="Current Address" value={app.currentAddress} span={2} />
        <ReviewField label="Current Landlord" value={app.currentLandlordName} />
        <ReviewField label="Landlord Phone" value={app.currentLandlordPhone} />
        <ReviewField label="Current Rent" value={app.currentRent ? `$${app.currentRent}/mo` : undefined} />
        <ReviewField label="Reason for Leaving" value={app.reasonForLeaving} span={3} />
      </ReviewSection>

      <ReviewSection title="Employment & Income" icon={<Briefcase className="h-3.5 w-3.5" />}>
        <ReviewField label="Employer" value={app.employerName} />
        <ReviewField label="Employer Phone" value={app.employerPhone} />
        <ReviewField label="Occupation" value={app.occupation} />
        <ReviewField label="Monthly Income" value={app.monthlyIncome ? `$${app.monthlyIncome}` : undefined} />
      </ReviewSection>

      <ReviewSection title={isColiving ? "Co-Living Details" : "Move-In"} icon={<DollarSign className="h-3.5 w-3.5" />}>
        <ReviewField label="Move-in Date" value={app.moveInDate} />
        {isColiving && <ReviewField label="Room Preference" value={app.roomPreference} />}
        {isColiving && <ReviewField label="Lifestyle Notes" value={app.lifestyleNotes} span={3} />}
        <ReviewField label="Property State" value={app.state} />
      </ReviewSection>

      <ReviewSection title="Pets, Vehicles, Occupants" icon={<Building2 className="h-3.5 w-3.5" />}>
        <ReviewField label="Has Pets" value={app.hasPets ? "Yes" : "No"} />
        <ReviewField label="Pet Description" value={app.petDescription} span={2} />
        <ReviewField label="Vehicle Info" value={app.vehicleInfo} span={3} />
        {additionalOccupants.length > 0 && (
          <div className="col-span-3">
            <div className="text-xs text-muted-foreground mb-1">Additional Occupants ({additionalOccupants.length})</div>
            <ul className="text-sm space-y-0.5">
              {additionalOccupants.map((o: any, i: number) => (
                <li key={i} className="text-foreground">
                  {typeof o === "string" ? o : `${o.name ?? "Unnamed"}${o.relation ? ` (${o.relation})` : ""}${o.age ? `, age ${o.age}` : ""}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Emergency Contact" icon={<AlertCircle className="h-3.5 w-3.5" />}>
        <ReviewField label="Name" value={app.emergencyContactName} />
        <ReviewField label="Phone" value={app.emergencyContactPhone} />
        <ReviewField label="Relationship" value={app.emergencyContactRelation} />
      </ReviewSection>

      <ReviewSection title="Consents & Signature" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
        <ReviewField label="Background-check consent" value={app.backgroundCheckConsent ? "Yes" : "No"} />
        <ReviewField label="Credit-check consent" value={app.creditCheckConsent ? "Yes" : "No"} />
        <ReviewField label="Signed at" value={app.signedAt ? new Date(app.signedAt).toLocaleString() : (app.signatureDataUrl ? "Signature on file" : "Unsigned")} />
        {app.notes && <ReviewField label="Applicant Notes" value={app.notes} span={3} />}
      </ReviewSection>
    </div>
  );
}

function ReviewSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
        {icon} {title}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
        {children}
      </div>
    </div>
  );
}

function ReviewField({ label, value, span }: { label: string; value?: string | null; span?: number }) {
  if (value === undefined || value === null || value === "") return null;
  const colSpan = span === 2 ? "col-span-2" : span === 3 ? "col-span-2 md:col-span-3" : "";
  return (
    <div className={colSpan}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground break-words">{value}</div>
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
                className="w-full gap-2 bg-[#F5A623] hover:bg-[#E8951A] text-[#062018] font-semibold"
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
          <Badge className={formType === "coliving_member" ? "bg-purple-500/10 text-purple-600 border-0" : "bg-[#F5A623]/10 text-[#F5A623] border-0"}>
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
            <div className={`w-1 h-1 rounded-full ${highlight ? "bg-purple-500" : "bg-[#F5A623]"}`} />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
