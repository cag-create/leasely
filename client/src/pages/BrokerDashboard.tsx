import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import {
  Users, Briefcase, Star, TrendingUp, MapPin, Plus, CheckCircle2,
  Clock, XCircle, ChevronRight, Loader2, Award, MessageSquare,
  DollarSign, Globe, Share2, BookOpen, Video
} from "lucide-react";

type Tab = "overview" | "leads" | "profile" | "sop" | "training" | "syndication";

export default function BrokerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: myProfile, isLoading: profileLoading } = trpc.cremeAgent.getMyProfile.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center space-y-4">
        <Users className="h-12 w-12 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-bold text-foreground">Sign in required</h2>
        <Button onClick={() => navigate("/login")} className="bg-[#1B2B5E] hover:bg-[#1B2B5E]/90">
          Sign In
        </Button>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "leads", label: "My Leads", icon: Users },
    { key: "profile", label: "Agent Profile", icon: Award },
    { key: "sop", label: "SOP Library", icon: BookOpen },
    { key: "training", label: "Training", icon: Video },
    { key: "syndication", label: "Syndication", icon: Share2 },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-5 w-5 text-[#1B2B5E]" />
            <span className="text-xs font-semibold text-[#1B2B5E] uppercase tracking-wider">Broker Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}!</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your agent profile, leads, and resources.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Content */}
        {activeTab === "overview" && <OverviewTab profile={myProfile} profileLoading={profileLoading} />}
        {activeTab === "leads" && <LeadsTab />}
        {activeTab === "profile" && <ProfileTab profile={myProfile} profileLoading={profileLoading} />}
        {activeTab === "sop" && <SopTab />}
        {activeTab === "training" && <TrainingTab />}
        {activeTab === "syndication" && <SyndicationTab />}
      </div>
    </DashboardLayout>
  );
}

function OverviewTab({ profile, profileLoading }: { profile: any; profileLoading: boolean }) {
  const utils = trpc.useUtils();

  const stats = [
    { label: "Agent Status", value: profile?.status ?? "Not registered", icon: Award, color: profile?.status === "approved" ? "text-[#00C896]" : "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Deals Closed", value: profile?.dealCount ?? 0, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Avg Rating", value: profile?.averageRating ? Number(profile.averageRating).toFixed(1) : "—", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Reviews", value: profile?.reviewCount ?? 0, icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="text-xl font-bold text-foreground capitalize">
              {profileLoading ? <div className="h-6 w-16 bg-muted animate-pulse rounded" /> : s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {!profile && !profileLoading && (
        <div className="rounded-2xl border border-dashed border-[#1B2B5E]/30 bg-[#1B2B5E]/5 p-8 text-center space-y-3">
          <Award className="h-12 w-12 text-[#1B2B5E] mx-auto opacity-50" />
          <h3 className="font-bold text-foreground text-lg">Register as a Creme Agent</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Join the Creme Agent Network to receive leads, build your profile, and earn referral fees from deals you close.
          </p>
          <Button
            className="bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 gap-2 mt-2"
            onClick={() => {}}
          >
            <Plus className="h-4 w-4" /> Get Started
          </Button>
        </div>
      )}

      {profile?.status === "pending" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 p-5 flex items-start gap-4">
          <Clock className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground">Application Pending Review</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your Creme Agent application is being reviewed. You'll be notified once approved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadsTab() {
  const { data: leads, isLoading } = trpc.cremeAgent.getMyLeads.useQuery();
  const utils = trpc.useUtils();
  const updateStatus = trpc.cremeAgent.updateLeadStatus.useMutation({
    onSuccess: () => utils.cremeAgent.getMyLeads.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-600",
    contacted: "bg-amber-500/10 text-amber-600",
    qualified: "bg-purple-500/10 text-purple-600",
    closed: "bg-[#00C896]/10 text-[#00C896]",
    lost: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">My Leads</h3>
        {leads && leads.length > 0 && (
          <Badge variant="secondary" className="text-xs ml-auto">{leads.length}</Badge>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : !leads?.length ? (
        <div className="p-12 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No leads yet. Once you're an approved agent, leads will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {leads.map((lead: any) => (
            <div key={lead.id} className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-[#1B2B5E]/10 flex items-center justify-center text-[#1B2B5E] font-bold shrink-0">
                {(lead.clientName || "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{lead.clientName}</span>
                  <Badge className={`text-xs border-0 ${STATUS_COLORS[lead.status] ?? "bg-muted text-muted-foreground"}`}>
                    {lead.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 space-x-3">
                  {lead.clientEmail && <span>{lead.clientEmail}</span>}
                  {lead.clientPhone && <span>{lead.clientPhone}</span>}
                </div>
                {lead.propertyAddress && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" /> {lead.propertyAddress}
                  </div>
                )}
                {lead.message && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lead.message}</p>
                )}
              </div>
              <div className="shrink-0">
                <select
                  value={lead.status}
                  onChange={e => updateStatus.mutate({ leadId: lead.id, status: e.target.value as any })}
                  className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {["new", "contacted", "qualified", "closed", "lost"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ profile, profileLoading }: { profile: any; profileLoading: boolean }) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    licenseNumber: profile?.licenseNumber ?? "",
    bio: profile?.bio ?? "",
    phone: profile?.phone ?? "",
    photoUrl: profile?.photoUrl ?? "",
    specialties: (profile?.specialties as string[] ?? []).join(", "),
    serviceAreas: (profile?.serviceAreas as string[] ?? []).join(", "),
  });

  const registerMutation = trpc.cremeAgent.register.useMutation({
    onSuccess: () => {
      toast.success("Application submitted!");
      utils.cremeAgent.getMyProfile.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.cremeAgent.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      utils.cremeAgent.getMyProfile.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 max-w-2xl">
      <h3 className="font-semibold text-foreground">Agent Profile</h3>

      {profileLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>License Number</Label>
              <Input
                value={form.licenseNumber}
                onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                placeholder="TX-123456"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Photo URL</Label>
            <Input
              value={form.photoUrl}
              onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1">
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={4}
              className="resize-none"
              placeholder="Tell clients about your experience and approach..."
            />
          </div>

          <div className="space-y-1">
            <Label>Specialties (comma-separated)</Label>
            <Input
              value={form.specialties}
              onChange={e => setForm(f => ({ ...f, specialties: e.target.value }))}
              placeholder="Residential Rentals, Commercial, Multi-family"
            />
          </div>

          <div className="space-y-1">
            <Label>Service Areas (comma-separated)</Label>
            <Input
              value={form.serviceAreas}
              onChange={e => setForm(f => ({ ...f, serviceAreas: e.target.value }))}
              placeholder="Austin, TX; Round Rock, TX"
            />
          </div>

          <Button
            onClick={() => {
              const payload = {
                bio: form.bio || undefined,
                phone: form.phone || undefined,
                photoUrl: form.photoUrl || undefined,
                specialties: form.specialties ? form.specialties.split(",").map(s => s.trim()).filter(Boolean) : undefined,
                serviceAreas: form.serviceAreas ? form.serviceAreas.split(",").map(s => s.trim()).filter(Boolean) : undefined,
              };
              if (profile) {
                updateMutation.mutate(payload);
              } else {
                registerMutation.mutate({
                  licenseNumber: form.licenseNumber || undefined,
                  ...payload,
                });
              }
            }}
            disabled={registerMutation.isPending || updateMutation.isPending}
            className="gap-2 bg-[#1B2B5E] hover:bg-[#1B2B5E]/90"
          >
            {(registerMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {profile ? "Update Profile" : "Submit Application"}
          </Button>
        </div>
      )}
    </div>
  );
}

function SopTab() {
  const { data: myReads } = trpc.sop.getMyReads.useQuery();
  const utils = trpc.useUtils();
  const markRead = trpc.sop.markRead.useMutation({
    onSuccess: () => utils.sop.getMyReads.invalidate(),
  });

  const SOPS = [
    { id: "sop-lead-handling", title: "Lead Handling Protocol", desc: "How to respond to and qualify inbound leads within the first hour." },
    { id: "sop-showing-prep", title: "Showing Preparation Checklist", desc: "Pre-showing steps to maximize first impressions and conversion." },
    { id: "sop-application-review", title: "Application Review Standards", desc: "Screening criteria, fair housing compliance, and documentation." },
    { id: "sop-lease-signing", title: "Lease Signing & Move-In Funds Flow", desc: "Tenant signs first → tenant pays deposit + first month → landlord countersigns. Lease is conditional until paid + countersigned." },
    { id: "sop-move-in", title: "Move-In / Move-Out Process", desc: "Walkthrough documentation, key handling, and inspection forms — released only after lease is fully executed." },
    { id: "sop-maintenance", title: "Maintenance Request Workflow", desc: "How to triage, assign, and close out work orders efficiently." },
    { id: "sop-renewal", title: "Lease Renewal Process", desc: "Timeline, renewal pricing guidance, and tenant communication scripts." },
  ];

  const readIds = new Set(myReads ?? []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Standard Operating Procedures</h3>
        <Badge variant="secondary" className="text-xs">
          {readIds.size} / {SOPS.length} completed
        </Badge>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {SOPS.map(sop => {
          const read = readIds.has(sop.id);
          return (
            <div
              key={sop.id}
              className={`rounded-xl border bg-card p-4 flex gap-3 ${read ? "border-[#00C896]/30 bg-[#00C896]/5" : "border-border"}`}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${read ? "bg-[#00C896]/20" : "bg-muted"}`}>
                <BookOpen className={`h-4 w-4 ${read ? "text-[#00C896]" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{sop.title}</span>
                  {read && <CheckCircle2 className="h-3.5 w-3.5 text-[#00C896] shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{sop.desc}</p>
                {!read && (
                  <button
                    onClick={() => markRead.mutate({ sopId: sop.id })}
                    className="text-xs text-[#1B2B5E] font-semibold mt-2 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrainingTab() {
  const { data: progress } = trpc.training.getProgress.useQuery();
  const utils = trpc.useUtils();
  const markComplete = trpc.training.markComplete.useMutation({
    onSuccess: () => utils.training.getProgress.invalidate(),
  });

  const VIDEOS = [
    { id: "training-platform-intro", title: "Platform Introduction", duration: "12 min", desc: "Overview of the Leasely platform for new agents." },
    { id: "training-listing-best-practices", title: "Listing Best Practices", duration: "18 min", desc: "How to create high-converting property listings." },
    { id: "training-lead-conversion", title: "Lead Conversion Mastery", duration: "22 min", desc: "Scripts and techniques to convert inquiries to signed leases." },
    { id: "training-fair-housing", title: "Fair Housing Compliance", duration: "30 min", desc: "Federal and state fair housing laws every agent must know." },
    { id: "training-digital-applications", title: "Digital Applications Walkthrough", duration: "15 min", desc: "Using Leasely's application portal with tenants." },
    { id: "training-maintenance-dispatch", title: "Maintenance & Vendor Dispatch", duration: "10 min", desc: "How to use AI-powered work order dispatching." },
  ];

  const completedIds = new Set(progress ?? []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Training Videos</h3>
        <Badge variant="secondary" className="text-xs">
          {completedIds.size} / {VIDEOS.length} complete
        </Badge>
      </div>
      <div className="space-y-3">
        {VIDEOS.map((vid, i) => {
          const done = completedIds.has(vid.id);
          return (
            <div
              key={vid.id}
              className={`rounded-xl border bg-card p-4 flex items-center gap-4 ${done ? "border-[#00C896]/30 bg-[#00C896]/5" : "border-border"}`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${done ? "bg-[#00C896]/20 text-[#00C896]" : "bg-muted text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{vid.title}</div>
                <div className="text-xs text-muted-foreground">{vid.desc}</div>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{vid.duration}</span>
                {!done && (
                  <button
                    onClick={() => markComplete.mutate({ videoId: vid.id })}
                    className="text-xs text-[#1B2B5E] font-semibold hover:underline"
                  >
                    Mark complete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SyndicationTab() {
  const { data: shares } = trpc.syndication.getShares.useQuery();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ listingId: "", platform: "", shareUrl: "", notes: "" });

  const add = trpc.syndication.addShare.useMutation({
    onSuccess: () => {
      utils.syndication.getShares.invalidate();
      setForm({ listingId: "", platform: "", shareUrl: "", notes: "" });
      toast.success("Share added.");
    },
    onError: (e) => toast.error(e.message),
  });

  const del = trpc.syndication.deleteShare.useMutation({
    onSuccess: () => utils.syndication.getShares.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Share2 className="h-4 w-4" /> Track a Syndication Share
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Listing ID</Label>
            <Input value={form.listingId} onChange={e => setForm(f => ({ ...f, listingId: e.target.value }))} placeholder="listing-abc123" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Platform</Label>
            <Input value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="Craigslist, Facebook, Zillow…" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Share URL</Label>
            <Input value={form.shareUrl} onChange={e => setForm(f => ({ ...f, shareUrl: e.target.value }))} placeholder="https://..." className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes…" className="h-9 text-sm" />
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => add.mutate({ listingId: form.listingId, platform: form.platform, shareUrl: form.shareUrl || undefined, notes: form.notes || undefined })}
          disabled={add.isPending || !form.listingId || !form.platform}
          className="gap-2 bg-[#1B2B5E] hover:bg-[#1B2B5E]/90"
        >
          {add.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add Share
        </Button>
      </div>

      {/* Shares list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Tracked Shares</h3>
          {shares && shares.length > 0 && <Badge variant="secondary" className="text-xs ml-auto">{shares.length}</Badge>}
        </div>
        {!shares?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No syndication shares tracked yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {shares.map((s: any) => (
              <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{s.platform}</span>
                    <Badge variant="outline" className="text-xs">{s.listingId}</Badge>
                  </div>
                  {s.shareUrl && <a href={s.shareUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B2B5E] hover:underline truncate block">{s.shareUrl}</a>}
                </div>
                <button
                  onClick={() => del.mutate({ shareId: s.id })}
                  className="text-xs text-red-500 hover:underline shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
