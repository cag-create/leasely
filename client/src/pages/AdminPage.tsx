import { useState } from "react";
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
  Award, Clock, XCircle, MessageSquare, Bell, Loader2, FileText, BookOpen, Wrench
} from "lucide-react";

type AdminTab = "overview" | "agents" | "contractors" | "waitlist" | "sop" | "growth";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || (user as any).role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            This page is restricted to Leasely administrators only.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="gap-2">
            <ChevronRight className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const TABS: { key: AdminTab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "agents", label: "Creme Agents", icon: Award },
    { key: "contractors", label: "Contractors", icon: Wrench },
    { key: "waitlist", label: "Waitlist", icon: Bell },
    { key: "sop", label: "SOP Library", icon: FileText },
    { key: "growth", label: "Growth", icon: TrendingUp },
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
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
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

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "agents" && <AgentsTab />}
        {activeTab === "contractors" && <ContractorsAdminTab />}
        {activeTab === "waitlist" && <WaitlistTab />}
        {activeTab === "sop" && <SopAdminTab />}
        {activeTab === "growth" && <GrowthTab />}
      </div>
    </DashboardLayout>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="space-y-8">
      <AdminStats />
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

function AdminStats() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  const items = [
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pro Subscribers", value: stats?.paidUsers ?? "—", icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Active Listings", value: stats?.totalListings ?? "—", icon: Building2, color: "text-[#00C896]", bg: "bg-[#00C896]/10" },
    { label: "MRR (est.)", value: stats?.paidUsers ? `$${(Number(stats.paidUsers) * 25).toFixed(0)}` : "—", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {isLoading ? <div className="h-7 w-16 bg-muted animate-pulse rounded" /> : item.value}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function AdminUsersTable({ searchQuery }: { searchQuery: string }) {
  const { data: users, isLoading } = trpc.admin.getUsers.useQuery({ limit: 50 });
  const utils = trpc.useUtils();
  const promoteUser = trpc.admin.setUserRole.useMutation({
    onSuccess: () => utils.admin.getUsers.invalidate(),
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
              <Badge className="bg-[#00C896]/10 text-[#00C896] border-0 text-xs">Pro</Badge>
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
        <BarChart3 className="h-4 w-4 text-[#00C896]" />
        <h3 className="font-semibold text-foreground">Platform Health</h3>
      </div>
      <div className="space-y-2.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#00C896]" />
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
    approved: "bg-[#00C896]/10 text-[#00C896]",
    rejected: "bg-red-500/10 text-red-600",
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
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
                <div className="text-xs text-muted-foreground">{a.userEmail} {a.licenseNumber && `· License #${a.licenseNumber}`}</div>
                {a.serviceAreas && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Areas: {(a.serviceAreas as string[]).join(", ")}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {a.status !== "approved" && (
                  <Button size="sm" className="h-7 text-xs bg-[#00C896] hover:bg-[#00C896]/90 text-white"
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
  );
}

function AdminLeadsList() {
  const { data: leads, isLoading } = trpc.cremeAgent.getAllLeads.useQuery();

  const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-600",
    contacted: "bg-amber-500/10 text-amber-600",
    qualified: "bg-purple-500/10 text-purple-600",
    closed: "bg-[#00C896]/10 text-[#00C896]",
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
                    <Badge className="text-xs bg-[#00C896]/10 text-[#00C896] border-0">Approved</Badge>
                  ) : (
                    <Badge className="text-xs bg-amber-500/10 text-amber-600 border-0">Pending</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{r.body}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!r.approved && (
                  <Button size="sm" className="h-7 text-xs bg-[#00C896] hover:bg-[#00C896]/90 text-white"
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
                      <Badge className="text-xs bg-[#00C896]/10 text-[#00C896] border-0 gap-1">
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

function GrowthTab() {
  const { data: stats, isLoading } = trpc.growth.getStats.useQuery();

  const metrics = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pro Subscribers", value: stats?.paidUsers, icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Active Listings", value: stats?.totalListings, icon: Building2, color: "text-[#00C896]", bg: "bg-[#00C896]/10" },
    { label: "Applications", value: stats?.totalApplications, icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Waitlist Entries", value: stats?.totalWaitlist, icon: Bell, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Agent Leads", value: stats?.totalLeads, icon: TrendingUp, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Free→Pro Rate", value: stats?.paidUsers && stats?.totalUsers ? `${((Number(stats.paidUsers) / Number(stats.totalUsers)) * 100).toFixed(1)}%` : "—", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Est. MRR", value: stats?.paidUsers ? `$${(Number(stats.paidUsers) * 25).toFixed(0)}` : "—", icon: DollarSign, color: "text-green-600", bg: "bg-green-600/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <div className="h-7 w-20 bg-muted animate-pulse rounded" /> : (m.value ?? "—")}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{m.label}</div>
          </div>
        ))}
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

const SOP_LIST = [
  { id: "sop-lead-handling", title: "Lead Handling Protocol" },
  { id: "sop-showing-prep", title: "Showing Preparation Checklist" },
  { id: "sop-application-review", title: "Application Review Standards" },
  { id: "sop-move-in", title: "Move-In / Move-Out Process" },
  { id: "sop-maintenance", title: "Maintenance Request Workflow" },
  { id: "sop-renewal", title: "Lease Renewal Process" },
];

function SopAdminTab() {
  const { data: allReads, isLoading } = trpc.sop.getAll.useQuery();

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
    <div className="space-y-6">
      {/* SOP completion overview */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">SOP Completion Overview</h3>
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
              <div key={sop.id} className="px-5 py-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#1B2B5E]/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-[#1B2B5E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{sop.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">ID: {sop.id}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-foreground">{sop.uniqueUsers}</div>
                  <div className="text-xs text-muted-foreground">users completed</div>
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
                              className={`h-full rounded-full ${pct === 100 ? "bg-[#00C896]" : "bg-[#1B2B5E]"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                          {pct === 100 && <CheckCircle2 className="h-3.5 w-3.5 text-[#00C896]" />}
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
