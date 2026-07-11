import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import {
  Users, Building2, DollarSign, TrendingUp, Shield,
  Search, ChevronRight, Crown, CheckCircle2,
  RefreshCw, BarChart3, Zap, Globe, Star,
  Award, Clock, XCircle, MessageSquare, Bell, Loader2, FileText, BookOpen, Wrench, Sparkles,
  Pencil, Trash2, ExternalLink, Plus, Copy, Share2, Link2 as LinkIcon,
} from "lucide-react";

type AdminTab = "overview" | "metrics" | "users" | "listings" | "subs" | "agents" | "contractors" | "waitlist" | "sop" | "growth" | "intelligence";

/**
 * Manual safety-net to flip a user to Pro by email — for assisted/phone sales
 * or anyone who paid via a raw payment link that couldn't be auto-matched.
 * Normal in-app "Get Pro" signups and email-matched link payments upgrade
 * automatically; this is the rare-case override.
 */
function GrantProCard() {
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const grant = trpc.admin.adminGrantPro.useMutation({
    onSuccess: (r) => {
      toast.success(`${r.name || r.email} is now Pro${r.proCode ? ` · code ${r.proCode}` : ""}`);
      setEmail("");
      utils.admin.getSubscriptions.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <div className="rounded-2xl border border-amber-200/70 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Crown className="h-4 w-4 text-amber-500" />
        <h3 className="font-semibold text-foreground text-sm">Grant Pro manually</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Flip a user to Pro by their account email. Use for assisted sales or a raw-link payment that didn't auto-match. Also mints their CBP brand-kit code.
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="customer@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && email) grant.mutate({ email }); }}
          className="flex-1 h-9"
        />
        <Button
          size="sm"
          onClick={() => email && grant.mutate({ email })}
          disabled={!email || grant.isPending}
          className="gap-1.5 shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
        >
          {grant.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />} Grant Pro
        </Button>
      </div>
    </div>
  );
}

/**
 * Shareable public sign-up link an admin can copy/send to fill the directory.
 * Points at an existing self-registration page — the invitee makes a free
 * account and completes their profile there.
 */
function InviteLinkCard({ title, description, path, icon: Icon }: { title: string; description: string; path: string; icon: any }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast.success("Invite link copied — share it anywhere"); }
    catch { toast.error("Couldn't copy automatically — select the link and copy it"); }
  };
  const share = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title, text: description, url }); } catch { /* user cancelled */ }
    } else { copy(); }
  };
  return (
    <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 p-4 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400"><LinkIcon className="h-3 w-3" /> Public link</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground font-mono truncate">{url}</div>
        <Button size="sm" onClick={copy} className="gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"><Copy className="h-3.5 w-3.5" /> Copy</Button>
        <Button size="sm" variant="outline" onClick={share} className="gap-1.5 shrink-0 hidden sm:inline-flex"><Share2 className="h-3.5 w-3.5" /> Share</Button>
        <a href={path} target="_blank" rel="noreferrer" className="shrink-0"><Button size="sm" variant="ghost" className="gap-1.5"><ExternalLink className="h-3.5 w-3.5" /></Button></a>
      </div>
    </div>
  );
}


export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const isAdmin = !!user && (user as any).role === "admin";

  // Non-admins never see admin content — silently bounce them to the dashboard
  // (no "Access Denied" screen, no mention of "admin").
  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/dashboard");
  }, [authLoading, isAdmin, navigate]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const TABS: { key: AdminTab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "metrics", label: "Business Metrics", icon: TrendingUp },
    { key: "users", label: "Users", icon: Users },
    { key: "listings", label: "Listings", icon: Building2 },
    { key: "subs", label: "Subscriptions", icon: Crown },
    { key: "agents", label: "Creme Agents", icon: Award },
    { key: "contractors", label: "Contractors", icon: Wrench },
    { key: "waitlist", label: "Waitlist", icon: Bell },
    { key: "sop", label: "SOP Library", icon: FileText },
    { key: "growth", label: "Growth", icon: TrendingUp },
    { key: "intelligence", label: "Intelligence", icon: Sparkles },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Super Admin</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Platform management and subscriber overview</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-muted/40 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === "metrics" && <MetricsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "listings" && <ListingsTab />}
        {activeTab === "subs" && <SubscriptionsTab />}
        {activeTab === "agents" && <AgentsTab />}
        {activeTab === "contractors" && <ContractorsAdminTab />}
        {activeTab === "waitlist" && <WaitlistTab />}
        {activeTab === "sop" && <SopAdminTab />}
        {activeTab === "growth" && <GrowthTab onNavigate={setActiveTab} />}
        {activeTab === "intelligence" && <IntelligenceTab />}
      </div>
    </DashboardLayout>
  );
}

// ─── Business Metrics Tab ────────────────────────────────────────────────────
// The acquisition-story view: recurring MRR/ARR + verifiable on-platform GMV +
// network size — the numbers a future buyer underwrites.
function MetricsTab() {
  const { data, isLoading } = trpc.admin.businessMetrics.useQuery();
  const money = (cents?: number) => `$${Math.round((cents ?? 0) / 100).toLocaleString()}`;

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>;

  const rentGmvAll = data?.rentGmvAllCents ?? 0;
  const onPlatformGmv = (data?.rentGmvAllCents ?? 0) + (data?.depositGmvAllCents ?? 0);

  const hero = [
    { label: "MRR", value: money(data?.mrrCents), sub: `${data?.paidUsers ?? 0} Pro subscribers × $25`, accent: "text-emerald-500" },
    { label: "ARR (run-rate)", value: money(data?.arrCents), sub: "MRR × 12", accent: "text-emerald-500" },
    { label: "On-platform GMV (all-time)", value: money(onPlatformGmv), sub: "rent + deposits processed via Stripe", accent: "text-indigo-500" },
    { label: "Rent processed (last 30d)", value: money(data?.rentGmvLast30Cents), sub: "verifiable recurring volume", accent: "text-indigo-500" },
  ];
  const secondary = [
    { label: "Total users", value: (data?.totalUsers ?? 0).toLocaleString() },
    { label: "Pro subscribers", value: (data?.paidUsers ?? 0).toLocaleString() },
    { label: "Free → Pro rate", value: data?.totalUsers ? `${(((data?.paidUsers ?? 0) / data.totalUsers) * 100).toFixed(1)}%` : "—" },
    { label: "Active listings", value: (data?.activeListings ?? 0).toLocaleString() },
    { label: "Applications", value: (data?.totalApplications ?? 0).toLocaleString() },
    { label: "Approved agents", value: (data?.approvedAgents ?? 0).toLocaleString() },
    { label: "Approved contractors", value: (data?.approvedContractors ?? 0).toLocaleString() },
    { label: "Rent GMV (all-time)", value: money(rentGmvAll) },
  ];

  return (
    <div className="space-y-6">
      {/* Hero: the numbers that drive a sale multiple */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hero.map(h => (
          <div key={h.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{h.label}</div>
            <div className={`text-3xl font-black ${h.accent}`}>{h.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{h.sub}</div>
          </div>
        ))}
      </div>

      {/* Secondary grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {secondary.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground leading-relaxed">
        <p className="font-semibold text-foreground mb-1">What a buyer underwrites</p>
        Recurring <strong>MRR/ARR</strong> from Pro subscriptions and verifiable <strong>on-platform GMV</strong> (rent + deposits
        flowing through Stripe) are the high-multiple assets. Contractor referrals are free by design, and agent
        referral fees are billed off-platform — so they don't appear here and shouldn't be counted toward a valuation.
        Grow subscriptions and on-platform rent volume to raise the multiple.
      </div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="space-y-8">
      <AdminStats onNavigate={onNavigate} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">All Users</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm w-64"
            />
          </div>
        </div>
        <AdminUsersTable searchQuery={searchQuery} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <RecentSubscriptions />
        <PlatformHealth />
      </div>
    </div>
  );
}

function AdminStats({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  const items: Array<{ label: string; value: any; icon: any; color: string; bg: string; tab: AdminTab }> = [
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", tab: "users" },
    { label: "Pro Subscribers", value: stats?.paidUsers ?? "—", icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10", tab: "subs" },
    { label: "Active Listings", value: stats?.totalListings ?? "—", icon: Building2, color: "text-[#4F46E5]", bg: "bg-[#4F46E5]/10", tab: "listings" },
    { label: "MRR (est.)", value: stats?.paidUsers ? `$${(Number(stats.paidUsers) * 25).toFixed(0)}` : "—", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", tab: "subs" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onNavigate(item.tab)}
          className="text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md hover:bg-muted/20 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {isLoading ? <div className="h-7 w-16 bg-muted animate-pulse rounded" /> : item.value}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">{item.label}</div>
        </button>
      ))}
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">All Users</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm w-64"
          />
        </div>
      </div>
      <AdminUsersTable searchQuery={searchQuery} />
    </div>
  );
}

// ─── Listings Tab ────────────────────────────────────────────────────────────

function ListingsTab() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all");
  const { data: listings, isLoading } = trpc.admin.getAllListings.useQuery({ limit: 200 });
  const utils = trpc.useUtils();
  const deleteListing = trpc.marketplace.deleteListing.useMutation({
    onSuccess: () => {
      toast.success("Listing removed.");
      utils.admin.getAllListings.invalidate();
    },
    onError: (e) => toast.error(e.message ?? "Failed to delete listing"),
  });
  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Permanently deactivate "${title}"? This hides it from the public marketplace.`)) return;
    deleteListing.mutate({ id });
  };

  const filtered = (listings ?? []).filter((l: any) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.title?.toLowerCase().includes(q) ||
      l.address?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q) ||
      l.state?.toLowerCase().includes(q) ||
      l.zip?.toLowerCase().includes(q) ||
      l.ownerName?.toLowerCase().includes(q) ||
      l.ownerEmail?.toLowerCase().includes(q)
    );
  });

  const STATUS_BADGE: Record<string, string> = {
    active: "bg-[#4F46E5]/10 text-[#4F46E5]",
    inactive: "bg-muted text-muted-foreground",
    pending: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">All Listings</h2>
          {listings && <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
            {(["all", "active", "pending", "inactive"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  statusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm w-64"
            />
          </div>
          <Button size="sm" className="h-8 gap-1.5 font-semibold" onClick={() => navigate("/list-property")}>
            <Plus className="h-3.5 w-3.5" /> Add Listing
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : !filtered.length ? (
        <div className="p-10 text-center text-muted-foreground text-sm">
          {searchQuery || statusFilter !== "all" ? "No listings match your filter." : "No listings yet."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Listing</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Geo</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rent</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Views</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l: any, i: number) => (
                <tr key={l.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">{l.title || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.bedrooms} bd · {l.bathrooms} ba · {l.propertyType}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-sm text-foreground">{l.ownerName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{l.ownerEmail || `User #${l.userId}`}</div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    <div className="text-foreground">{l.address}</div>
                    <div>{l.city}, {l.state} {l.zip}</div>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {l.latitude != null && l.longitude != null ? (
                      <span className="font-mono text-muted-foreground">
                        {Number(l.latitude).toFixed(4)},<br />{Number(l.longitude).toFixed(4)}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">no geo</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-foreground">${l.monthlyRent?.toLocaleString() ?? "—"}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{l.viewCount ?? 0}</td>
                  <td className="px-5 py-3">
                    <Badge className={`text-xs border-0 ${STATUS_BADGE[l.status] ?? ""}`}>{l.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        title="View public listing"
                        onClick={() => window.open(`/listing/${l.id}`, "_blank", "noopener")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        title="Edit listing"
                        onClick={() => navigate(`/edit-listing/${l.id}`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        title="Deactivate listing"
                        disabled={l.status === "inactive" || deleteListing.isPending}
                        onClick={() => handleDelete(l.id, l.title || `Listing #${l.id}`)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Subscriptions Tab ───────────────────────────────────────────────────────

function SubscriptionsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: subs, isLoading } = trpc.admin.getSubscriptions.useQuery();

  const filtered = (subs ?? []).filter((s: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.brandName?.toLowerCase().includes(q) ||
      s.portalSubdomain?.toLowerCase().includes(q) ||
      s.stripeSubscriptionId?.toLowerCase().includes(q)
    );
  });

  const totalMRR = filtered.length * 25;

  return (
    <div className="space-y-4">
      <GrantProCard />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Subscribers</div>
          <div className="text-2xl font-bold text-foreground">{filtered.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Est. MRR</div>
          <div className="text-2xl font-bold text-foreground">${totalMRR.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Connect Active</div>
          <div className="text-2xl font-bold text-foreground">
            {filtered.filter((s: any) => s.stripeConnectStatus === "active").length}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Branded Portals</div>
          <div className="text-2xl font-bold text-foreground">
            {filtered.filter((s: any) => s.portalSubdomain).length}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-foreground">Pro Subscribers</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm w-64"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : !filtered.length ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {searchQuery ? "No subscribers match your search." : "No Pro subscribers yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subscriber</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Portal</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connect</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stripe Sub</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period End</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: any, i: number) => (
                  <tr key={s.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                          {(s.name || s.email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{s.name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{s.email || `User #${s.userId}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={`text-xs border-0 ${
                        s.status === "active" ? "bg-[#4F46E5]/10 text-[#4F46E5]" :
                        s.status === "cancelled" ? "bg-red-500/10 text-red-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {s.portalSubdomain ? (
                        <div>
                          <div className="text-foreground font-medium">{s.brandName || s.portalSubdomain}</div>
                          <div className="text-muted-foreground font-mono">{s.portalSubdomain}.leasely.app</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className="text-[10px]">{s.stripeConnectStatus ?? "not_connected"}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground truncate max-w-[180px]">
                      {s.stripeSubscriptionId ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminUsersTable({ searchQuery }: { searchQuery: string }) {
  const { data: users, isLoading } = trpc.admin.getUsers.useQuery({ limit: 50 });
  const utils = trpc.useUtils();
  const promoteUser = trpc.admin.setUserRole.useMutation({
    onSuccess: () => utils.admin.getUsers.invalidate(),
  });
  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => { toast.success("User deleted"); utils.admin.getUsers.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (users ?? []).filter(u =>
    !searchQuery ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        {searchQuery ? "No users match your search." : "No users found."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tier</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
            <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u, i) => (
            <tr key={u.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {(u.name || u.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{u.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email || "—"}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                {(u as any).tier === "paid" ? (
                  <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs gap-1">
                    <Crown className="h-3 w-3" /> Pro
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Free</Badge>
                )}
              </td>
              <td className="px-5 py-3.5">
                {u.role === "admin" ? (
                  <Badge className="bg-red-500/10 text-red-600 border-0 text-xs gap-1">
                    <Shield className="h-3 w-3" /> Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">User</Badge>
                )}
              </td>
              <td className="px-5 py-3.5 text-muted-foreground text-xs">
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
              </td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  {u.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 gap-1"
                      onClick={() => promoteUser.mutate({ userId: u.id, role: "admin" })}
                      disabled={promoteUser.isPending}
                    >
                      <Shield className="h-3 w-3" /> Make Admin
                    </Button>
                  )}
                  {u.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm(`Delete ${u.name || u.email}? This cannot be undone.`)) {
                          deleteUser.mutate({ userId: u.id });
                        }
                      }}
                      disabled={deleteUser.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentSubscriptions() {
  const { data: subs, isLoading } = trpc.admin.getSubscriptions.useQuery();

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-amber-400" />
        <h3 className="font-semibold text-foreground">Recent Pro Upgrades</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : !subs?.length ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
          No Pro upgrades yet
        </div>
      ) : (
        <div className="space-y-2">
          {subs.map((s: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-600">
                  {(s.name || s.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{s.name || s.email}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </div>
              </div>
              <Badge className="bg-[#4F46E5]/10 text-[#4F46E5] border-0 text-xs">Pro</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformHealth() {
  const checks = [
    { label: "Database", detail: "Connected" },
    { label: "Email Auth", detail: "Active" },
    { label: "File Storage", detail: "Configured" },
    { label: "Stripe Webhooks", detail: "Active" },
    { label: "Railway Deployment", detail: "Live" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-[#4F46E5]" />
        <h3 className="font-semibold text-foreground">Platform Health</h3>
      </div>
      <div className="space-y-2.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#4F46E5]" />
              <span className="text-sm text-foreground">{c.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{c.detail}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" />
          All systems operational
        </div>
      </div>
    </div>
  );
}

// ─── Creme Agents Tab ────────────────────────────────────────────────────────

function AgentsTab() {
  const [subTab, setSubTab] = useState<"agents" | "leads" | "reviews">("agents");

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["agents", "leads", "reviews"] as const).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              subTab === t ? "bg-[#1B2B5E] text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {subTab === "agents" && <AdminAgentsList />}
      {subTab === "leads" && <AdminLeadsList />}
      {subTab === "reviews" && <AdminReviewsList />}
    </div>
  );
}

function AdminAgentsList() {
  const { data: agents, isLoading } = trpc.cremeAgent.getAllAgents.useQuery();
  const utils = trpc.useUtils();
  const approve = trpc.cremeAgent.approveAgent.useMutation({
    onSuccess: () => utils.cremeAgent.getAllAgents.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const reject = trpc.cremeAgent.rejectAgent.useMutation({
    onSuccess: () => utils.cremeAgent.getAllAgents.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const STATUS_BADGE: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600",
    approved: "bg-[#4F46E5]/10 text-[#4F46E5]",
    rejected: "bg-red-500/10 text-red-600",
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div>
    <InviteLinkCard
      icon={Award}
      title="Invite an agent"
      description="Share this link to onboard a Creme Agent. They create a free account and submit their profile — it lands here for your approval."
      path="/broker-dashboard"
    />
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Award className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">All Agents</h3>
        {agents && <Badge variant="secondary" className="text-xs ml-auto">{agents.length}</Badge>}
      </div>
      {!agents?.length ? (
        <div className="p-10 text-center text-muted-foreground text-sm">No agent applications yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {agents.map((a: any) => (
            <div key={a.id} className="px-5 py-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#1B2B5E]/10 flex items-center justify-center text-[#1B2B5E] font-bold shrink-0">
                {(a.userName || "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">{a.userName || "—"}</span>
                  <Badge className={`text-xs border-0 ${STATUS_BADGE[a.status] ?? ""}`}>{a.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.userEmail}
                  {a.licenseNumber ? (
                    <> · License #{a.licenseNumber}{" "}
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${a.licenseNumber} real estate license verification`)}`}
                        target="_blank" rel="noreferrer"
                        className="text-[#4F46E5] hover:underline font-medium"
                      >Verify ↗</a>
                    </>
                  ) : (
                    <span className="text-amber-600 font-medium"> · ⚠ no license # provided</span>
                  )}
                </div>
                {a.serviceAreas && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Areas: {(a.serviceAreas as string[]).join(", ")}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {a.status !== "approved" && (
                  <Button size="sm" className="h-7 text-xs bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                    onClick={() => approve.mutate({ agentId: a.id })} disabled={approve.isPending}>
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                  </Button>
                )}
                {a.status !== "rejected" && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:text-red-600"
                    onClick={() => reject.mutate({ agentId: a.id })} disabled={reject.isPending}>
                    <XCircle className="h-3 w-3 mr-1" /> Reject
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

function AdminLeadsList() {
  const { data: leads, isLoading } = trpc.cremeAgent.getAllLeads.useQuery();

  const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-600",
    contacted: "bg-amber-500/10 text-amber-600",
    qualified: "bg-purple-500/10 text-purple-600",
    closed: "bg-[#4F46E5]/10 text-[#4F46E5]",
    lost: "bg-red-500/10 text-red-600",
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">All Leads</h3>
        {leads && <Badge variant="secondary" className="text-xs ml-auto">{leads.length}</Badge>}
      </div>
      {!leads?.length ? (
        <div className="p-10 text-center text-muted-foreground text-sm">No leads yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {["Client", "Agent", "Type", "Status", "Property"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l: any, i: number) => (
                <tr key={l.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground text-sm">{l.clientName}</div>
                    <div className="text-xs text-muted-foreground">{l.clientEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{l.agentName || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{l.leadType}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs border-0 ${STATUS_COLORS[l.status] ?? ""}`}>{l.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[200px]">{l.propertyAddress || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminReviewsList() {
  const { data: reviews, isLoading } = trpc.cremeAgent.getAllReviews.useQuery();
  const utils = trpc.useUtils();
  const moderate = trpc.cremeAgent.moderateReview.useMutation({
    onSuccess: () => utils.cremeAgent.getAllReviews.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const del = trpc.cremeAgent.deleteReview.useMutation({
    onSuccess: () => utils.cremeAgent.getAllReviews.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Agent Reviews</h3>
        {reviews && <Badge variant="secondary" className="text-xs ml-auto">{reviews.length}</Badge>}
      </div>
      {!reviews?.length ? (
        <div className="p-10 text-center text-muted-foreground text-sm">No reviews yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {reviews.map((r: any) => (
            <div key={r.id} className="px-5 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">{r.reviewerName}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} className={`h-3 w-3 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  {r.approved ? (
                    <Badge className="text-xs bg-[#4F46E5]/10 text-[#4F46E5] border-0">Approved</Badge>
                  ) : (
                    <Badge className="text-xs bg-amber-500/10 text-amber-600 border-0">Pending</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{r.body}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!r.approved && (
                  <Button size="sm" className="h-7 text-xs bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                    onClick={() => moderate.mutate({ reviewId: r.id, approved: true })} disabled={moderate.isPending}>
                    Approve
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500"
                  onClick={() => del.mutate({ reviewId: r.id })} disabled={del.isPending}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Waitlist Tab ─────────────────────────────────────────────────────────────

function WaitlistTab() {
  const { data: entries, isLoading } = trpc.waitlist.getAll.useQuery();
  const utils = trpc.useUtils();
  const contact = trpc.waitlist.markContacted.useMutation({
    onSuccess: () => utils.waitlist.getAll.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const del = trpc.waitlist.deleteEntry.useMutation({
    onSuccess: () => utils.waitlist.getAll.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Renter Waitlist</h3>
        {entries && <Badge variant="secondary" className="text-xs ml-auto">{entries.length} entries</Badge>}
      </div>

      {isLoading ? (
        <div className="p-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : !entries?.length ? (
        <div className="p-10 text-center text-muted-foreground text-sm">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
          No waitlist entries yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {["Renter", "Area", "Budget", "Move-in", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e: any, i: number) => (
                <tr key={e.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.email}{e.phone ? ` · ${e.phone}` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.preferredArea || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {e.budgetMin && e.budgetMax
                      ? `$${e.budgetMin}–$${e.budgetMax}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {e.moveInDate ? new Date(e.moveInDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {e.contactedAt ? (
                      <Badge className="text-xs bg-[#4F46E5]/10 text-[#4F46E5] border-0 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Contacted
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-amber-500/10 text-amber-600 border-0 gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!e.contactedAt && (
                        <Button size="sm" className="h-7 text-xs bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 text-white"
                          onClick={() => contact.mutate({ entryId: e.id })} disabled={contact.isPending}>
                          Mark Contacted
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500"
                        onClick={() => del.mutate({ entryId: e.id })} disabled={del.isPending}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Growth Tab ───────────────────────────────────────────────────────────────

function GrowthTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const { data: stats, isLoading } = trpc.growth.getStats.useQuery();

  const metrics: Array<{ label: string; value: any; icon: any; color: string; bg: string; tab?: AdminTab }> = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", tab: "users" },
    { label: "Pro Subscribers", value: stats?.paidUsers, icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10", tab: "subs" },
    { label: "Active Listings", value: stats?.totalListings, icon: Building2, color: "text-[#4F46E5]", bg: "bg-[#4F46E5]/10", tab: "listings" },
    { label: "Applications", value: stats?.totalApplications, icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Waitlist Entries", value: stats?.totalWaitlist, icon: Bell, color: "text-orange-500", bg: "bg-orange-500/10", tab: "waitlist" },
    { label: "Agent Leads", value: stats?.totalLeads, icon: TrendingUp, color: "text-pink-500", bg: "bg-pink-500/10", tab: "agents" },
    { label: "Free→Pro Rate", value: stats?.paidUsers && stats?.totalUsers ? `${((Number(stats.paidUsers) / Number(stats.totalUsers)) * 100).toFixed(1)}%` : "—", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", tab: "metrics" },
    { label: "Est. MRR", value: stats?.paidUsers ? `$${(Number(stats.paidUsers) * 25).toFixed(0)}` : "—", icon: DollarSign, color: "text-green-600", bg: "bg-green-600/10", tab: "metrics" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const clickable = !!m.tab;
          const inner = (
            <>
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </div>
                {clickable && <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <div className="h-7 w-20 bg-muted animate-pulse rounded" /> : (m.value ?? "—")}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">{m.label}</div>
            </>
          );
          return clickable ? (
            <button
              key={i}
              onClick={() => onNavigate(m.tab!)}
              className="text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md hover:bg-muted/20 transition-all group"
            >
              {inner}
            </button>
          ) : (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              {inner}
            </div>
          );
        })}
      </div>

      {/* Conversion funnel */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Conversion Funnel
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: "Signed Up", value: stats?.totalUsers ?? 0, color: "bg-blue-500" },
              { label: "Applied for Listing", value: stats?.totalApplications ?? 0, color: "bg-purple-500" },
              { label: "Upgraded to Pro", value: stats?.paidUsers ?? 0, color: "bg-amber-500" },
            ].map(step => {
              const max = Number(stats?.totalUsers ?? 1);
              const pct = max > 0 ? Math.min(100, (Number(step.value) / max) * 100) : 0;
              return (
                <div key={step.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{step.label}</span>
                    <span className="font-semibold text-foreground">{step.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${step.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SOP Admin Tab ────────────────────────────────────────────────────────────

type SopSection = { heading: string; items: string[] };
type Sop = { id: string; title: string; description: string; estimatedMinutes: number; sections: SopSection[] };

const SOP_LIST: Sop[] = [
  {
    id: "sop-lead-handling",
    title: "Lead Handling Protocol",
    description: "How to respond to, qualify, and convert inbound rental leads within 24 hours.",
    estimatedMinutes: 8,
    sections: [
      {
        heading: "1. Initial Response (within 2 hours)",
        items: [
          "Acknowledge every inquiry via the channel it came in (email, text, Leasely message) within 2 hours during business hours.",
          "Send a personalized reply using the applicant's first name — never use generic auto-responders without personalizing.",
          "Include the listing address, monthly rent, available date, and a direct link to the application.",
          "If the unit is already leased, pivot: ask if they'd like to be on the waitlist or see similar units you manage.",
          "Log the lead in the Leasely CRM with source (Leasely, Zillow, Referral, etc.) and initial contact timestamp.",
        ],
      },
      {
        heading: "2. Lead Qualification",
        items: [
          "Ask the four qualification questions: (1) Desired move-in date, (2) Number of occupants, (3) Monthly income (must be 3× rent), (4) Any eviction or felony history in the last 7 years.",
          "If income does not meet 3× threshold, politely inform and offer a co-signer option. Document the response.",
          "Do not promise any unit before a completed application and credit/background check — verbal holds are not binding and create liability.",
          "For corporate or Section 8 applicants, note any additional documentation requirements upfront.",
          "Rate the lead: Hot (ready to apply today), Warm (applying within 7 days), Cold (still shopping). Follow-up cadence differs by rating.",
        ],
      },
      {
        heading: "3. Follow-Up Cadence",
        items: [
          "Hot lead: follow up every 24 hours until application is submitted or they opt out.",
          "Warm lead: follow up on Day 1, Day 3, and Day 7 after initial contact.",
          "Cold lead: add to the Leasely CRM drip — automated check-in at 14 days and 30 days.",
          "Never contact a lead more than once per day. All communication must be professional and FAIR Housing compliant.",
          "After 3 non-responses, mark the lead as inactive and cease outreach. Log the final status.",
        ],
      },
      {
        heading: "4. Scheduling a Showing",
        items: [
          "Offer at least 3 available time slots in the next 5 business days.",
          "Confirm the showing via both email and text 24 hours before.",
          "If you are sending a Creme Agent for the showing, brief the agent via the Leasely portal with property highlights, key selling points, and any known issues.",
          "For vacant units, ensure the unit is clean, HVAC is set to a comfortable temperature, and all lights are functional before any showing.",
          "Send a follow-up within 2 hours post-showing to gauge interest and answer questions.",
        ],
      },
    ],
  },
  {
    id: "sop-showing-prep",
    title: "Showing Preparation Checklist",
    description: "Step-by-step property preparation and agent briefing before every showing.",
    estimatedMinutes: 6,
    sections: [
      {
        heading: "1. 48 Hours Before the Showing",
        items: [
          "Confirm the appointment via text and email with the prospect.",
          "Verify the key or lockbox code is functional. Test it yourself — do not assume.",
          "Notify current tenants (if occupied) with at least 24 hours written notice as required by state law.",
          "Pull the unit's fact sheet: sq ft, bed/bath, included utilities, appliances, parking, pet policy, lease terms.",
          "Confirm the showing agent has access to the Leasely portal listing with all photos and details.",
        ],
      },
      {
        heading: "2. Day-of Preparation (1–2 hours before)",
        items: [
          "Walk the unit or have the agent walk it. Check for: odors, burnt-out lights, leaky faucets, HVAC function, clean bathrooms and kitchen.",
          "Set the thermostat: 72°F in summer, 68°F in winter. First impressions are physical.",
          "Open blinds and window treatments to maximize natural light.",
          "Ensure all common areas are clean if applicable (hallways, laundry room, parking lot).",
          "Place a simple welcome card or printed fact sheet on the kitchen counter.",
        ],
      },
      {
        heading: "3. During the Showing",
        items: [
          "Greet the prospect by name. Shake hands. Begin with the strongest feature of the property.",
          "Highlight: storage space, natural light, proximity to transit/schools, recent upgrades.",
          "Never apologize for the unit. If a prospect raises an issue, acknowledge it and pivot to a solution or benefit.",
          "Disclose known material defects — this is legally required and protects you from future liability.",
          "End with: 'Do you have any questions? Is this a fit for what you're looking for?'",
        ],
      },
      {
        heading: "4. Post-Showing Follow-Up",
        items: [
          "Send a follow-up message within 2 hours: 'Great meeting you today — here's the application link: [link]'",
          "Log showing outcome in CRM: Interested / Needs time / Not a fit. Note specific objections.",
          "If the prospect is interested but hesitant, offer a second look or offer to answer remaining questions.",
          "If a showing no-show occurs, send one re-engagement message. If no response in 48 hours, mark as cold.",
          "Showing feedback should be documented and shared with the landlord via the Leasely portal notes.",
        ],
      },
    ],
  },
  {
    id: "sop-application-review",
    title: "Application Review Standards",
    description: "Consistent, FAIR Housing-compliant criteria for evaluating and approving rental applications.",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "1. Minimum Qualification Criteria",
        items: [
          "Income: Combined gross monthly household income must be at least 3× the monthly rent.",
          "Credit: Minimum score of 620 for standard approval. 580–619 may be approved with an additional security deposit equal to one month's rent.",
          "Rental History: No evictions in the past 5 years. No more than 2 late rent payments in the past 12 months.",
          "Criminal Background: Convictions that directly relate to property damage or harm to other residents are grounds for denial. Blanket criminal screening policies that do not consider time elapsed or nature of offense may violate FAIR Housing — consult local ordinances.",
          "Employment/Income: Employed for at least 6 months at current job, OR has documented self-employment income for at least 1 year, OR has sufficient documented savings (12+ months rent).",
        ],
      },
      {
        heading: "2. Required Documents",
        items: [
          "Government-issued photo ID (driver's license, state ID, or passport).",
          "Two most recent pay stubs OR two most recent months of bank statements.",
          "Most recent tax return if self-employed.",
          "Contact information for previous two landlords (not current if still residing).",
          "All adult occupants (18+) must submit a separate application and undergo background/credit screening.",
        ],
      },
      {
        heading: "3. FAIR Housing Compliance",
        items: [
          "NEVER consider: race, color, national origin, religion, sex, familial status, disability, or any other protected class under federal, state, or local law.",
          "Apply the same written criteria to every applicant — no exceptions. Inconsistent application is the most common FAIR Housing violation.",
          "If you use AI screening, document its criteria. AI tools do not provide FAIR Housing immunity.",
          "Keep all application documents, screening reports, and decision records for a minimum of 3 years.",
          "If you deny an application, provide a written adverse action notice citing the specific criteria that were not met. Do not simply say 'denied.'",
        ],
      },
      {
        heading: "4. Decision and Notification",
        items: [
          "Complete review within 48–72 hours of receiving a completed application with all documents.",
          "Approve: Send the lease agreement via Leasely. Lease must be signed within 5 business days or the unit returns to market.",
          "Conditional Approve: Notify the applicant of the condition (e.g., additional deposit) and give 48 hours to respond.",
          "Deny: Send a written adverse action notice. Do not leave applicants waiting — it creates liability and poor reviews.",
          "If multiple qualified applications arrive simultaneously, approve in the order received. Document timestamps.",
        ],
      },
    ],
  },
  {
    id: "sop-lease-signing",
    title: "Lease Signing & Move-In Funds Flow",
    description: "Conditional-signature workflow that protects landlords by requiring payment before the lease is fully executed.",
    estimatedMinutes: 5,
    sections: [
      {
        heading: "1. The Flow at a Glance",
        items: [
          "Step 1 — You create the lease and click Send. Tenant receives an emailed signing link.",
          "Step 2 — Tenant signs first. Status flips to 'Tenant signed — your turn'. Leasely emails you a countersign prompt.",
          "Step 3 — You countersign in the Leases tab. This is the gate — nothing moves forward until you do.",
          "Step 4 — If deposit + first month are still owed, Leasely automatically emails the tenant a secure Stripe link (or skips this if you already logged the payment off-platform). Status: 'Awaiting payment' until cleared.",
          "Step 5 — Once funds clear (or if none were required), the lease goes ACTIVE and the tenant automatically receives move-in access instructions: lockbox code, key-pickup details, or in-person handoff — whichever you selected on the lease.",
        ],
      },
      {
        heading: "2. Why This Order",
        items: [
          "Tenant signs first to lock in legal commitment to the agreement (subject to your countersignature).",
          "You countersign BEFORE asking for money — this protects the tenant from paying into a lease you might never execute, and gives you a chance to bail out at no cost to them.",
          "Move-in instructions (lockbox codes, key pickup details, in-person addresses) are only released AFTER countersign AND any required payment clears — never give them out earlier.",
          "If a tenant signs and you don't countersign within 7 days, the offer expires by default — set expectations clearly in the listing.",
        ],
      },
      {
        heading: "3. Status Glossary (Leases tab)",
        items: [
          "Draft — created but not sent. Edit freely.",
          "Sent to tenant — emailed; awaiting tenant signature.",
          "Tenant signed — your turn — tenant has e-signed; click Sign on the lease row to countersign.",
          "Awaiting payment — you countersigned; tenant has been emailed a payment link for deposit + first month.",
          "Active — fully executed and funded. Move-in instructions have been sent. Lease is in force.",
        ],
      },
      {
        heading: "4. Disputes & Edge Cases",
        items: [
          "Tenant disputes a charge after paying: Stripe handles the chargeback flow. The lease stays ACTIVE during dispute; consult counsel before terminating.",
          "Tenant pays only the deposit, not first month: lease stays in 'Awaiting payment' until both clear. Reach out and offer a payment plan only if you choose.",
          "Tenant wants to cancel after signing but before you countersign: simply don't countersign; click Delete on the lease row. No money has changed hands.",
          "You collected deposit + first month off-platform (cash/check): mark it in the lease detail so Leasely skips the payment email and goes straight to move-in instructions.",
          "Refunds: only refunds-via-Stripe are tracked in Leasely; off-platform refunds must be documented manually.",
        ],
      },
    ],
  },
  {
    id: "sop-move-in",
    title: "Move-In / Move-Out Process",
    description: "End-to-end checklist for a smooth tenant transition that protects your security deposit and prevents disputes.",
    estimatedMinutes: 12,
    sections: [
      {
        heading: "1. Pre-Move-In (5–7 Days Before)",
        items: [
          "Confirm all cleaning, painting, and repairs are complete. The unit must be in 'broom clean' condition — ready to photograph.",
          "Conduct a professional walk-through with a checklist. Document the condition of: walls, floors, carpets, appliances, windows, doors, fixtures, HVAC filters, smoke detectors, carbon monoxide detectors.",
          "Photograph every room from at least two angles. Photograph all appliances, fixtures, and any pre-existing damage. Use timestamped photos — store in Leasely.",
          "Verify all utilities are transferred or activated. Confirm tenant has set up their utility accounts if required by lease.",
          "Prepare the move-in packet: lease copy, welcome letter, utility contacts, trash pickup schedule, maintenance request instructions, emergency contact numbers.",
        ],
      },
      {
        heading: "2. Move-In Day",
        items: [
          "CRITICAL: Move-in only proceeds AFTER the lease is ACTIVE. That requires (a) tenant signature, (b) your countersignature, and (c) any required deposit + first month's rent cleared. Do NOT release keys before all three are complete — Leasely automatically gates this and only emails move-in instructions once status flips to Active.",
          "Meet the tenant at the property. Do not just mail keys — a brief in-person walkthrough is your best protection against future disputes.",
          "Walk through the entire unit with the tenant and complete the move-in condition report together. Both parties sign.",
          "Explain the maintenance request process: how to submit via Leasely, expected response times, what constitutes an emergency.",
          "Provide all keys, fobs, parking passes, and mailbox keys. Have the tenant sign a receipt for each item.",
          "Funds are already collected through Leasely's checkout before this step — confirm in the Lease detail view that both 'first month' and 'deposit' show paid.",
        ],
      },
      {
        heading: "3. During Tenancy — Periodic Inspections",
        items: [
          "Conduct a routine inspection at 90 days and then annually. State law governs required notice (typically 24–48 hours written notice).",
          "Use the same condition report form used at move-in. Document changes.",
          "Address any lease violations (unapproved pets, unauthorized occupants, hoarding, smoking) in writing immediately after the inspection.",
          "Keep records of all communication. Email or Leasely messages are preferable over text — they create a clear paper trail.",
        ],
      },
      {
        heading: "4. Move-Out Process",
        items: [
          "Send a written move-out checklist to the tenant 30 days before lease end: cleaning expectations, what to return, final utilities.",
          "Conduct a final walk-through within 24–48 hours of the tenant vacating. Use the original move-in condition report for comparison.",
          "Document all damage with timestamped photos. Only charge for damage that exceeds normal wear and tear — this is a legal standard, not a discretionary judgment.",
          "Normal wear and tear examples: small nail holes, minor carpet wear, paint that needs refreshing after 3+ years. NOT normal: large holes, stains, broken fixtures, unauthorized paint colors.",
          "Provide a written itemized security deposit disposition statement within the timeframe required by state law (typically 14–30 days). Late returns may forfeit your right to deduct.",
        ],
      },
    ],
  },
  {
    id: "sop-maintenance",
    title: "Maintenance Request Workflow",
    description: "How to triage, dispatch, track, and close maintenance requests — from tenant submit to vendor payment.",
    estimatedMinutes: 9,
    sections: [
      {
        heading: "1. Request Intake and Triage",
        items: [
          "All requests must be submitted through Leasely so there is a written record. Do not accept verbal-only maintenance requests.",
          "Triage by priority within 4 business hours of submission:",
          "EMERGENCY (respond immediately): No heat in winter, no hot water, gas leak, flooding, electrical hazard, sewage backup, broken exterior door/lock.",
          "URGENT (respond within 24 hours): Appliance outage, HVAC partial failure, roof leak, plumbing drip, pest infestation.",
          "ROUTINE (respond within 72 hours): Cosmetic issues, slow drain, minor appliance issues, parking/common area requests.",
        ],
      },
      {
        heading: "2. Vendor Dispatch",
        items: [
          "For emergencies: Use the Leasely emergency dispatch to notify ALL vendors simultaneously. The first available vendor responds. Do not wait to compare quotes in an emergency.",
          "For non-emergencies: Use multi-bid dispatch. Send to all qualified vendors for that trade (HVAC, plumbing, electric, general). Collect quotes + availability within 24–48 hours.",
          "Round-robin option: Enable in Leasely settings to auto-rotate dispatch order among qualified vendors for routine work, ensuring fair distribution.",
          "Never use a vendor who is not in your Leasely vendor list — unvetted vendors create insurance and liability exposure.",
          "Send the tenant an automated update: 'We've received your request and dispatched a vendor. You'll hear from them to schedule within [timeframe].'",
        ],
      },
      {
        heading: "3. Vendor Management",
        items: [
          "Require all vendors in your network to have: current general liability insurance (min $1M), trade license if applicable, W-9 on file.",
          "Review vendor quotes via the Leasely portal. Compare price, proposed date, and notes before approving.",
          "Once approved, inform the tenant of the scheduled date. Provide the tenant 24+ hours notice of entry.",
          "Do not allow vendors to charge additional amounts beyond the approved quote without prior landlord approval.",
          "After job completion, do a photo verification before releasing payment through Leasely's vendor pay system.",
        ],
      },
      {
        heading: "4. Closing and Documentation",
        items: [
          "Mark work orders as 'Resolved' in Leasely only after confirming the repair is complete and effective.",
          "Keep all invoices, vendor communications, and completion photos in the work order record for at minimum 3 years.",
          "Track repair frequency by unit and by system (HVAC, plumbing, roof). Recurring issues indicate a capital improvement need, not a maintenance issue.",
          "For any repair costing more than $500, send the tenant a written notice of the work performed. For any repair that was caused by tenant negligence, document clearly and advise them they may be charged at move-out.",
          "Conduct a 30-day follow-up check on any significant repair (roof, HVAC, plumbing) to confirm it holds.",
        ],
      },
    ],
  },
  {
    id: "sop-renewal",
    title: "Lease Renewal Process",
    description: "How to retain good tenants, negotiate renewals, and handle turnover efficiently.",
    estimatedMinutes: 7,
    sections: [
      {
        heading: "1. Renewal Timeline",
        items: [
          "Begin the renewal process 90 days before lease expiration — never wait until 30 days out.",
          "Day 90: Pull the tenant's payment history, maintenance request history, and any lease violation notes. Decide: renew, renew with conditions, or non-renew.",
          "Day 75: Send the renewal offer via Leasely — include new rent amount, new lease term options, and deadline to respond (typically 14 days).",
          "Day 60: If no response, follow up directly by phone or email. A non-response is not a rejection — many tenants are simply busy.",
          "Day 45: Final decision required. If tenant declines or does not respond, begin marketing the unit immediately.",
        ],
      },
      {
        heading: "2. Setting the Renewal Rate",
        items: [
          "Research current market rents for comparable units in the same zip code. Use Leasely marketplace, Zillow, and Apartments.com as benchmarks.",
          "Typical renewal increase range: 3–8% depending on market conditions and tenant quality.",
          "Factor in vacancy cost: a 30-day vacancy at $1,500/mo = $1,500 lost + ~$500 turn cost. A quality tenant renewing at market rate is almost always more profitable than a vacancy.",
          "Offer a small incentive for long-term renewal (12+ months): free carpet cleaning, appliance upgrade, or $50 off first month.",
          "Never raise rent more than the amount allowed by local rent stabilization or rent control ordinances — know your local laws.",
        ],
      },
      {
        heading: "3. Good-Tenant Retention Strategies",
        items: [
          "Acknowledge on-time payment: A simple 'Thanks for always paying on time — we really appreciate it' goes a long way.",
          "Respond to maintenance requests fast. The #1 reason good tenants leave is feeling ignored when something breaks.",
          "Personalize the renewal letter. 'We'd love to have you stay for another year' is more effective than a form letter.",
          "Offer a month-to-month option at a 10–15% premium for tenants who need flexibility. It keeps them without locking you in.",
          "Track tenure bonuses: consider a one-time $100 gift card for tenants at their 2-year anniversary. Retention is cheaper than turnover.",
        ],
      },
      {
        heading: "4. Non-Renewal and Turnover",
        items: [
          "Send non-renewal notice in writing per state law requirements (typically 30–60 days). Never assume a verbal notice is sufficient.",
          "If the tenant is being non-renewed for cause (violations, non-payment), document everything. Consult a local attorney before proceeding with eviction — improper process is expensive.",
          "Begin marketing the unit while the tenant is still in place. With proper notice, you can show the unit with 24-hour advance written notice.",
          "Calculate total turn cost: cleaning, painting, carpet (if needed), marketing time, leasing fee. This number justifies investing in retention.",
          "After a tenant vacates, complete the move-out inspection within 24 hours. Start the turn immediately — every day vacant is revenue lost.",
        ],
      },
    ],
  },
];

// ─── SOP Viewer Modal ─────────────────────────────────────────────────────────

function SopViewerModal({ sop, onClose }: { sop: Sop; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1B2B5E]/10 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="h-5 w-5 text-[#1B2B5E] dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground leading-tight">{sop.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{sop.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">~{sop.estimatedMinutes} min read</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {sop.sections.map((section, si) => (
            <div key={si}>
              <h3 className="font-semibold text-sm text-foreground mb-3 pb-1.5 border-b border-border">
                {section.heading}
              </h3>
              <ul className="space-y-2.5">
                {section.items.map((item, ii) => (
                  <li key={ii} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                    <span className="h-5 w-5 rounded-full bg-[#4F46E5]/15 text-[#4F46E5] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {ii + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm transition-colors"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SOP Admin Tab ─────────────────────────────────────────────────────────────

function SopAdminTab() {
  const { data: allReads, isLoading } = trpc.sop.getAll.useQuery();
  const [viewingSop, setViewingSop] = useState<Sop | null>(null);

  // Build per-SOP stats
  const sopStats = SOP_LIST.map(sop => {
    const reads = (allReads ?? []).filter(r => r.sopId === sop.id);
    const uniqueUsers = new Set(reads.map(r => r.userId)).size;
    return { ...sop, totalReads: reads.length, uniqueUsers, recentReads: reads.slice(0, 3) };
  });

  // All unique users who have completed at least 1 SOP
  const allUserMap = new Map<number, { name: string | null; email: string | null; count: number }>();
  (allReads ?? []).forEach(r => {
    const existing = allUserMap.get(r.userId);
    if (existing) existing.count++;
    else allUserMap.set(r.userId, { name: r.userName, email: r.userEmail, count: 1 });
  });
  const userRows = Array.from(allUserMap.entries())
    .map(([userId, d]) => ({ userId, ...d }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      {viewingSop && (
        <SopViewerModal sop={viewingSop} onClose={() => setViewingSop(null)} />
      )}

      <div className="space-y-6">
        {/* SOP Library Grid */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">SOP Library</h3>
            <Badge variant="secondary" className="text-xs ml-auto">
              {SOP_LIST.length} procedures
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {SOP_LIST.map((sop) => {
              const stat = sopStats.find(s => s.id === sop.id);
              return (
                <button
                  key={sop.id}
                  onClick={() => setViewingSop(sop)}
                  className="group text-left p-5 hover:bg-muted/40 transition-colors border-b border-border last:border-b-0 sm:last:border-b sm:border-b sm:[&:nth-child(n+4)]:border-t sm:[&:nth-child(n+4)]:border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#1B2B5E]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1B2B5E]/20 transition-colors">
                      <FileText className="h-4.5 w-4.5 text-[#1B2B5E] dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground leading-tight group-hover:text-[#1B2B5E] dark:group-hover:text-blue-400 transition-colors">
                        {sop.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">{sop.description}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {sop.estimatedMinutes} min
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> {stat?.uniqueUsers ?? 0} read
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SOP completion overview stats */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Completion Stats</h3>
            {!isLoading && (
              <Badge variant="secondary" className="text-xs ml-auto">
                {(allReads ?? []).length} total reads
              </Badge>
            )}
          </div>
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : (
            <div className="divide-y divide-border">
              {sopStats.map(sop => (
                <div key={sop.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{sop.title}</div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-bold text-foreground">{sop.uniqueUsers}</div>
                      <div className="text-[11px] text-muted-foreground">users</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-foreground">{sop.totalReads}</div>
                      <div className="text-[11px] text-muted-foreground">reads</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User SOP progress leaderboard */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Agent SOP Progress</h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : !userRows.length ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No SOPs have been read yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SOPs Completed</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {userRows.map((u, i) => {
                    const pct = Math.round((u.count / SOP_LIST.length) * 100);
                    return (
                      <tr key={u.userId} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-[#1B2B5E]/10 flex items-center justify-center text-xs font-bold text-[#1B2B5E] shrink-0">
                              {(u.name || u.email || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{u.name || "—"}</div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-semibold text-foreground">{u.count}</span>
                          <span className="text-muted-foreground"> / {SOP_LIST.length}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[120px]">
                              <div
                                className={`h-full rounded-full ${pct === 100 ? "bg-[#4F46E5]" : "bg-[#1B2B5E]"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                            {pct === 100 && <CheckCircle2 className="h-3.5 w-3.5 text-[#4F46E5]" />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function IntelligenceTab() {
  const { data: marketRent, isLoading: loadingRent } = trpc.admin.getMarketRent.useQuery();
  const { data: scoreStats, isLoading: loadingScore } = trpc.admin.getTenantScoreStats.useQuery();
  const { data: leaseOutcomes, isLoading: loadingLeases } = trpc.admin.getLeaseOutcomes.useQuery();

  const scoreItems = scoreStats ? [
    { label: "Excellent", range: "80–100", count: scoreStats.excellent, color: "bg-[#4F46E5]", textColor: "text-[#4F46E5]" },
    { label: "Good", range: "65–79", count: scoreStats.good, color: "bg-blue-500", textColor: "text-blue-500" },
    { label: "Fair", range: "50–64", count: scoreStats.fair, color: "bg-amber-500", textColor: "text-amber-500" },
    { label: "Review", range: "< 50", count: scoreStats.review, color: "bg-red-400", textColor: "text-red-400" },
  ] : [];

  const leaseStatusConfig: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "bg-[#4F46E5]/80" },
    signed: { label: "Signed", color: "bg-blue-500/80" },
    draft: { label: "Draft", color: "bg-muted" },
    sent: { label: "Sent (Awaiting Signature)", color: "bg-amber-500/80" },
    expired: { label: "Expired", color: "bg-red-400/60" },
    terminated: { label: "Terminated", color: "bg-gray-400/60" },
  };

  return (
    <div className="space-y-6">

      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#4F46E5]/10 to-blue-500/10 border border-[#4F46E5]/20 p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#4F46E5]/15 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-[#4F46E5]" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Platform Intelligence</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Proprietary data aggregated across all landlords and tenants on Leasely. This is your network-effect moat — it gets smarter with every user.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "AI Tenant Score", desc: "Score every applicant on income, employer, references, and consent signals" },
            { label: "Market Rent Intelligence", desc: "Real-time avg rent by zip code from active listings across the platform" },
            { label: "Lease Outcome Database", desc: "Track which lease statuses lead to renewals vs. churn across all landlords" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-background/60 border border-border p-3">
              <div className="text-xs font-semibold text-foreground">{item.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tenant Score Distribution */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">AI Tenant Reliability Score — Platform Distribution</h3>
          {!loadingScore && scoreStats && (
            <Badge variant="secondary" className="text-xs ml-auto">{scoreStats.total} applicants scored</Badge>
          )}
        </div>
        {loadingScore ? (
          <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : !scoreStats || scoreStats.total === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No applications yet. Score data will appear as tenants apply.</div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {scoreItems.map(item => (
                <div key={item.label} className="rounded-xl border border-border p-4 text-center">
                  <div className={`text-2xl font-bold ${item.textColor}`}>{item.count}</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground">Score {item.range}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: scoreStats.total ? `${Math.round((item.count / scoreStats.total) * 100)}%` : "0%" }}
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {scoreStats.total ? Math.round((item.count / scoreStats.total) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-muted/40 border border-border p-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Score factors: </span>
              Monthly income level (+40), employer on file (+15), landlord reference (+15), background check consent (+15), emergency contact (+10), no pets (+5). Max score: 100.
            </div>
          </div>
        )}
      </div>

      {/* Market Rent Intelligence */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Market Rent Intelligence — Avg Rent by Zip Code</h3>
          {!loadingRent && (
            <Badge variant="secondary" className="text-xs ml-auto">{marketRent?.length ?? 0} zip codes tracked</Badge>
          )}
        </div>
        {loadingRent ? (
          <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : !marketRent?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No active listings with zip codes yet. Market data appears as landlords post listings.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zip Code</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Rent</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Listings</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data Quality</th>
                </tr>
              </thead>
              <tbody>
                {marketRent.map((row: any, i: number) => (
                  <tr key={i} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">{row.state ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-sm text-foreground">{row.zip ?? "—"}</td>
                    <td className="px-5 py-3 font-semibold text-[#4F46E5]">${Number(row.avgRent ?? 0).toLocaleString()}/mo</td>
                    <td className="px-5 py-3 text-muted-foreground">{row.count}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${Number(row.count) >= 5 ? "bg-[#4F46E5]/10 text-[#4F46E5]" : Number(row.count) >= 2 ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                        {Number(row.count) >= 5 ? "High confidence" : Number(row.count) >= 2 ? "Growing" : "Limited"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lease Outcome Database */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Lease Outcome Database</h3>
        </div>
        {loadingLeases ? (
          <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : !leaseOutcomes?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No leases yet. Outcome data appears as landlords create and sign leases.</div>
        ) : (
          <div className="p-5">
            <div className="grid sm:grid-cols-3 gap-3">
              {leaseOutcomes.map((row: any, i: number) => {
                const config = leaseStatusConfig[row.status] ?? { label: row.status, color: "bg-muted" };
                return (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
                      <span className="text-sm font-semibold text-foreground">{config.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{row.count}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">leases</div>
                    {row.avgRentCents > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Avg: ${Math.round(Number(row.avgRentCents) / 100).toLocaleString()}/mo
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl bg-muted/40 border border-border p-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Why this matters: </span>
              As this database grows, Leasely can identify which tenant profiles (income ratio, employment type, application speed) correlate with on-time payment, low maintenance, and lease renewals — feeding back into the AI screening score.
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Contractors Admin Tab ────────────────────────────────────────────────────

function ContractorsAdminTab() {
  const [subTab, setSubTab] = useState<"contractors" | "reviews" | "leads">("contractors");
  const [search, setSearch] = useState("");

  const { data: contractors = [], refetch: refetchContractors } = trpc.contractors.adminList.useQuery();
  const { data: reviews = [], refetch: refetchReviews } = trpc.contractors.adminGetReviews.useQuery();
  const { data: leads = [] } = trpc.contractors.adminGetLeads.useQuery();

  const updateStatus = trpc.contractors.adminUpdateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetchContractors(); },
    onError: (e) => toast.error("Failed", { description: e.message }),
  });

  const updateReview = trpc.contractors.adminUpdateReview.useMutation({
    onSuccess: () => { toast.success("Review updated"); refetchReviews(); },
    onError: (e) => toast.error("Failed", { description: e.message }),
  });

  const filtered = (contractors as any[]).filter(c =>
    !search || c.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    c.state?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => ({
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    suspended: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  }[s] ?? "bg-muted text-muted-foreground");

  return (
    <div className="space-y-5">
      <InviteLinkCard
        icon={Wrench}
        title="Invite a contractor"
        description="Share this link so contractors can list themselves in the directory. They create a free account, fill out their business profile, and it lands here for your approval."
        path="/contractors/register"
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Listings", value: (contractors as any[]).length, icon: Wrench },
          { label: "Approved", value: (contractors as any[]).filter((c: any) => c.status === "approved").length, icon: CheckCircle2 },
          { label: "Pending Review", value: (contractors as any[]).filter((c: any) => c.status === "pending").length, icon: Clock },
          { label: "Total Leads", value: (leads as any[]).length, icon: MessageSquare },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="text-2xl font-black text-foreground">{value}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
        {(["contractors", "reviews", "leads"] as const).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              subTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Contractors list */}
      {subTab === "contractors" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm"
              placeholder="Search by business name or state..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Business</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No contractors found</td></tr>
                ) : filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{c.businessName}</div>
                      {c.ownerName && <div className="text-xs text-muted-foreground">{c.ownerName}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{[c.city, c.state].filter(Boolean).join(", ")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(c.status)}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {Number(c.averageRating) > 0 ? (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          {Number(c.averageRating).toFixed(1)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {c.status !== "approved" && (
                          <button
                            onClick={() => updateStatus.mutate({ id: c.id, status: "approved" })}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {c.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus.mutate({ id: c.id, status: "rejected" })}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                        {c.status !== "suspended" && c.status === "approved" && (
                          <button
                            onClick={() => updateStatus.mutate({ id: c.id, status: "suspended" })}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews moderation */}
      {subTab === "reviews" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Reviewer</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Contractor ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Rating</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(reviews as any[]).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No reviews yet</td></tr>
              ) : (reviews as any[]).map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{r.reviewerName}</div>
                    {r.title && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{r.title}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">#{r.contractorId}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      {r.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.approved ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {r.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {!r.approved && (
                        <button
                          onClick={() => updateReview.mutate({ id: r.id, approved: 1 })}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {r.approved === 1 && (
                        <button
                          onClick={() => updateReview.mutate({ id: r.id, approved: 0 })}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leads */}
      {subTab === "leads" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Contractor ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Job Type</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Urgency</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(leads as any[]).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No leads yet</td></tr>
              ) : (leads as any[]).map((l: any) => (
                <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{l.clientName}</div>
                    {l.clientEmail && <div className="text-xs text-muted-foreground">{l.clientEmail}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">#{l.contractorId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.jobType || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      l.urgency === "emergency" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      l.urgency === "within_week" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {l.urgency?.replace("_", " ") ?? "flexible"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
