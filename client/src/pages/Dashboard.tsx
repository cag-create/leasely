import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  LayoutDashboard, PlusCircle, Eye, Bookmark, MessageSquare,
  TrendingUp, Building2, Lock, Sparkles, ArrowRight, Edit,
  Trash2, ToggleLeft, ToggleRight, CheckCircle2, Crown,
  BarChart3, MapPin, DollarSign, Calendar, ExternalLink,
  Globe, Shield, FileText, Users, Palette, Heart, Search,
  QrCode, CreditCard, Banknote, Zap, Download, Copy, Wrench
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { formatRent, getListingImage, PROPERTY_TYPE_LABELS } from "@/lib/marketplace";
import { prepareImageForUpload } from "@/lib/imageUpload";
import TenantInviteDialog from "@/components/TenantInviteDialog";

const BRAND = "#1B2B5E";
const ACCENT = "#F5A623";

// Logo upload — file picker + preview. Replaces the old "paste a URL" input
// since nobody hosts their logo at a public URL.
function BrandLogoUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputId = "brand-logo-upload";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await prepareImageForUpload(file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        onChange(data.url);
        toast.success("Logo uploaded");
      } else {
        toast.error(data.error || `Upload failed (${res.status})`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting same file
    }
  }

  return (
    <div>
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Logo</Label>
      <div className="mt-1.5 flex items-center gap-3">
        <label
          htmlFor={inputId}
          className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-gray-300 transition-colors overflow-hidden"
        >
          {value ? (
            <img src={value} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Palette className="w-5 h-5 text-gray-300" />
          )}
        </label>
        <div className="flex-1">
          <input id={inputId} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <label
            htmlFor={inputId}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            {uploading ? "Uploading…" : value ? "Replace logo" : "Upload logo"}
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="block text-xs text-gray-400 hover:text-red-500 mt-0.5"
            >
              Remove
            </button>
          )}
          <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, SVG. Auto-resized for the web.</p>
        </div>
      </div>
    </div>
  );
}

// Rent Rate Intelligence Widget (Pro only)
function RentRateWidget() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("CA");
  const [queried, setQueried] = useState(false);
  const { data: rates, isLoading, refetch } = trpc.rentRates.getByArea.useQuery(
    { city, state },
    { enabled: queried && city.length > 1 }
  );

  const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
  const typeLabels: Record<string, string> = { studio: "Studio", "1br": "1 Bed", "2br": "2 Bed", "3br": "3 Bed", "4br_plus": "4+ Bed", room: "Room", co_living: "Co-living" };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5" style={{ color: ACCENT }} />
        <h3 className="font-black text-gray-900">Market Rent Intelligence</h3>
        <Badge className="text-xs ml-auto" style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>Pro</Badge>
      </div>
      <p className="text-xs text-gray-400 mb-4">See median rent rates for any city to price your listings competitively.</p>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30"
          placeholder="City (e.g. Austin)"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && city.length > 1) { setQueried(true); refetch(); } }}
        />
        <select
          className="h-9 rounded-lg border border-gray-200 px-2 text-sm bg-white focus:outline-none"
          value={state}
          onChange={e => setState(e.target.value)}
        >
          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button
          size="sm"
          className="font-bold gap-1"
          style={{ background: ACCENT, color: "#3A2410" }}
          onClick={() => { if (city.length > 1) { setQueried(true); refetch(); } }}
        >
          <Search className="h-3.5 w-3.5" />
        </Button>
      </div>
      {isLoading && <div className="flex justify-center py-4"><div className="h-6 w-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" /></div>}
      {rates && rates.length > 0 && (
        <div className="space-y-2">
          {rates.slice(0, 5).map((r: any) => (
            <div key={r.propertyType} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">{typeLabels[r.propertyType] ?? r.propertyType}</span>
              <div className="text-right">
                <span className="text-sm font-black text-gray-900">${r.medianRent?.toLocaleString()}/mo</span>
                <div className="text-xs text-gray-400">${r.minRent?.toLocaleString()} – ${r.maxRent?.toLocaleString()}</div>
              </div>
            </div>
          ))}
          {rates[0]?.dataSource === "national_estimate" && (
            <p className="text-xs text-gray-400 text-center pt-1">Based on national averages — local data coming soon</p>
          )}
        </div>
      )}
      {!queried && (
        <div className="text-center py-4 text-gray-400 text-sm">Enter a city above to see local rent rates</div>
      )}
    </div>
  );
}

// Locked feature card for free tier
function LockedFeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-gray-200 p-5 bg-gray-50">
      <div className="absolute top-3 right-3"><Lock className="h-4 w-4 text-gray-300" /></div>
      <div className="h-10 w-10 rounded-xl bg-gray-200 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="font-bold text-gray-400 mb-1">{title}</div>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      <div className="mt-3"><span className="text-xs text-gray-400 border border-gray-300 rounded-full px-2 py-0.5">Pro Only</span></div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [upgradePending, setUpgradePending] = useState(false);
  const utils = trpc.useUtils();

  const { data: me } = trpc.auth.me.useQuery(undefined, { enabled: isAuthenticated });
  const accountType = (me as any)?.accountType as "renter" | "landlord" | null | undefined;
  const brandName = (me as any)?.brandName as string | null;
  const brandColor = (me as any)?.brandColor as string | null;
  const brandLogoUrl = (me as any)?.brandLogoUrl as string | null;
  const portalSubdomain = (me as any)?.portalSubdomain as string | null;

  const [brandForm, setBrandForm] = useState({
    brandName: "", brandColor: BRAND, brandLogoUrl: "", portalSubdomain: ""
  });

  useEffect(() => {
    setBrandForm({
      brandName: brandName ?? "",
      brandColor: brandColor ?? BRAND,
      brandLogoUrl: brandLogoUrl ?? "",
      portalSubdomain: portalSubdomain ?? "",
    });
  }, [brandName, brandColor, brandLogoUrl, portalSubdomain]);

  const { data: tierData, isLoading: tierLoading } = trpc.marketplace.getUserTier.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myListings = [], isLoading: listingsLoading } = trpc.marketplace.getMyListings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: savedListings = [] } = trpc.marketplace.getSavedListings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.marketplace.deleteListing.useMutation({
    onSuccess: () => {
      toast.success("Listing removed");
      utils.marketplace.getMyListings.invalidate();
    },
    onError: () => toast.error("Failed to remove listing"),
  });

  const updateMutation = trpc.marketplace.updateListing.useMutation({
    onSuccess: () => {
      toast.success("Listing updated");
      utils.marketplace.getMyListings.invalidate();
    },
  });

  const updateBrandingMutation = trpc.marketplace.updatePortalBranding.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Portal branding updated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const upgradeMutation = trpc.marketplace.upgradeToPaid.useMutation({
    onSuccess: () => {
      toast.success("🎉 Welcome to Pro! Your account has been upgraded.");
      utils.marketplace.getUserTier.invalidate();
      setUpgradePending(false);
    },
    onError: () => toast.error("Upgrade failed. Please try again."),
  });

  // Tenant invite dialog
  const [tenantInviteOpen, setTenantInviteOpen] = useState(false);

  // QR code state
  const [qrListingId, setQrListingId] = useState<number | null>(null);
  const [qrData, setQrData] = useState<{ qrDataUrl: string; url: string } | null>(null);

  const generateQRMutation = trpc.marketplace.generateQRCode.useMutation({
    onSuccess: (data) => {
      setQrData(data);
    },
    onError: () => toast.error("Failed to generate QR code"),
  });

  // Stripe Connect — always refetch on mount so a return from Stripe onboarding
  // (?stripe=success) reflects the freshly-active status without a hard reload.
  const { data: stripeStatus, isLoading: stripeStatusLoading, refetch: refetchStripeStatus } = trpc.marketplace.getStripeConnectStatus.useQuery(undefined, {
    enabled: isAuthenticated && (tierData?.tier === "paid"),
    refetchOnMount: "always",
  });

  // If we landed here from Stripe's return_url, force one extra refetch + strip the query param.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "success" || params.get("stripe") === "refresh") {
      refetchStripeStatus();
      params.delete("stripe");
      const newSearch = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (newSearch ? `?${newSearch}` : ""));
    }
  }, [refetchStripeStatus]);

  const stripeConnectMutation = trpc.marketplace.createStripeConnectLink.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => toast.error(err.message),
  });

  // Payment history
  const { data: paymentHistory = [] } = trpc.marketplace.getPaymentHistory.useQuery(undefined, {
    enabled: isAuthenticated && (tierData?.tier === "paid"),
  });
  // Lease count drives the first-success checklist below
  const { data: leasesForChecklist = [], isLoading: leasesForChecklistLoading } = trpc.leases.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  // Available balance for instant payout
  const { data: balanceData, refetch: refetchBalance } = trpc.marketplace.getAvailableBalance.useQuery(undefined, {
    enabled: isAuthenticated && (tierData?.tier === "paid") && stripeStatus?.status === "active",
  });
  const instantPayoutMutation = trpc.marketplace.requestInstantPayout.useMutation({
    onSuccess: (data: any) => {
      const note = data.note;
      toast.success(note ?? `Payout of $${((data.amountCents ?? 0) / 100).toFixed(2)} initiated! Funds arrive instantly.`);
      refetchBalance();
    },
    onError: (err) => toast.error(err.message),
  });

  // Redirect renters to saved listings
  if (isAuthenticated && accountType === "renter") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 max-w-lg py-24 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-sm border">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-3">Renter Account</h2>
            <p className="text-gray-500 mb-6">Your dashboard is your saved listings. Browse properties and save the ones you love.</p>
            <div className="flex flex-col gap-3">
              <Link href="/saved">
                <Button size="lg" className="w-full font-bold gap-2" style={{ background: ACCENT, color: "#3A2410" }}>
                  <Heart className="h-4 w-4" /> View Saved Listings
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="w-full font-bold gap-2">
                  <Search className="h-4 w-4" /> Browse Rentals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 max-w-lg py-24 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-sm border">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-3">Sign In to Access Dashboard</h2>
            <p className="text-gray-500 mb-6">Manage your listings and track performance.</p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="w-full font-bold" style={{ background: ACCENT, color: "#3A2410" }}>
                Sign In / Create Account
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const tier = tierData?.tier ?? "free";
  const isPaid = tier === "paid";
  const activeListings = myListings.filter(l => l.status === "active");
  const totalViews = myListings.reduce((sum, l) => sum + (l.viewCount ?? 0), 0);
  const totalSaves = myListings.reduce((sum, l) => sum + (l.saveCount ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            {(() => {
              const hr = new Date().getHours();
              const greeting = hr < 5 ? "Burning the midnight oil" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : hr < 22 ? "Good evening" : "Working late";
              const firstName = user?.name?.split(" ")[0] ?? "there";
              return (
                <>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">{greeting}</p>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {firstName}.
                  </h1>
                  <p className="text-gray-500 mt-1 text-sm">
                    {activeListings.length > 0
                      ? `${activeListings.length} active listing${activeListings.length === 1 ? "" : "s"} · ${totalViews} views this period`
                      : "Ready to list your first property?"
                    }
                  </p>
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className="px-3 py-1.5 text-sm font-semibold"
              style={isPaid
                ? { background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }
                : { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }
              }
            >
              {isPaid ? <><Crown className="h-3.5 w-3.5 mr-1.5" />Pro Plan</> : "Free Plan"}
            </Badge>
            <Link href="/import-listings">
              <Button variant="outline" className="font-semibold gap-2 text-gray-600">
                <Download className="h-4 w-4" /> Import
              </Button>
            </Link>
            <Link href="/list-property">
              <Button style={{ background: ACCENT, color: "#3A2410" }} className="font-bold gap-2">
                <PlusCircle className="h-4 w-4" /> Add Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Upgrade Banner (free tier only) */}
        {!isPaid && (
          <div className="rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: `linear-gradient(135deg, ${BRAND}, #0d3a2a)` }}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}30` }}>
                <Sparkles className="h-6 w-6" style={{ color: ACCENT }} />
              </div>
              <div>
                <h3 className="text-white font-black text-lg">Unlock the Full Leasely Platform</h3>
                <p className="text-white/70 text-sm mt-1">
                  Upgrade to Pro for unlimited listings, AI fraud applicant detection, background checks, and your branded portal.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setUpgradePending(true);
                upgradeMutation.mutate();
              }}
              disabled={upgradeMutation.isPending}
              className="shrink-0 font-bold px-6"
              style={{ background: ACCENT, color: "#3A2410" }}
            >
              {upgradeMutation.isPending ? "Upgrading..." : "Upgrade to Pro — $25/mo"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* First-success checklist — collapses once all steps are complete.
            Only shown to Pro users (free tier sees the upgrade banner above).
            Gated on all 3 underlying queries having settled so the checklist
            doesn't flash a stale "0/3 complete" state on first paint. */}
        {isPaid && !listingsLoading && !stripeStatusLoading && !leasesForChecklistLoading && (() => {
          const hasListing = myListings.length > 0;
          const hasStripe = stripeStatus?.status === "active";
          const hasLease = (leasesForChecklist as any[]).length > 0;
          const completed = [hasListing, hasStripe, hasLease].filter(Boolean).length;
          if (completed === 3) return null;
          const pct = Math.round((completed / 3) * 100);
          const steps = [
            { done: hasListing, label: "Add your first property", desc: "List a unit you own — takes 2 minutes.", href: "/list-property", cta: "Add listing" },
            { done: hasStripe, label: "Connect Stripe", desc: "Get paid directly. 0% ACH for tenants.", href: "#stripe-connect", cta: "Connect Stripe" },
            { done: hasLease, label: "Send your first lease", desc: "Create and send a lease — your tenant signs + autopays.", href: "/leases", cta: "Create lease" },
          ];
          return (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" style={{ color: ACCENT }} /> Get to your first paid tenant
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{completed} of 3 complete · finish setup to start collecting rent.</p>
                </div>
                <span className="text-2xl font-black" style={{ color: ACCENT }}>{pct}%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: ACCENT }} />
              </div>
              <div className="space-y-2">
                {steps.map((s) => (
                  <div key={s.label} className={`flex items-center gap-3 rounded-xl p-3 ${s.done ? "bg-white/60 opacity-60" : "bg-white"}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-emerald-500" : "border-2 border-gray-200"}`}>
                      {s.done && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${s.done ? "line-through text-gray-400" : "text-gray-900"}`}>{s.label}</p>
                      {!s.done && <p className="text-xs text-gray-500">{s.desc}</p>}
                    </div>
                    {!s.done && (
                      s.href.startsWith("#")
                        ? (
                          <Button
                            size="sm"
                            className="font-bold text-xs h-8"
                            style={{ background: ACCENT, color: "#3A2410" }}
                            onClick={() => stripeConnectMutation.mutate()}
                            disabled={stripeConnectMutation.isPending}
                          >
                            {s.cta}
                          </Button>
                        )
                        : (
                          <Link href={s.href}>
                            <Button size="sm" className="font-bold text-xs h-8" style={{ background: ACCENT, color: "#3A2410" }}>
                              {s.cta}
                            </Button>
                          </Link>
                        )
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Listings", value: activeListings.length, icon: Building2, color: BRAND },
            { label: "Total Views", value: totalViews, icon: Eye, color: "#3B82F6" },
            { label: "Total Saves", value: totalSaves, icon: Bookmark, color: "#EF4444" },
            { label: "Saved Properties", value: savedListings.length, icon: TrendingUp, color: ACCENT },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{value}</div>
              <div className="text-sm text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900">My Listings</h2>
              {!isPaid && myListings.length >= 1 && (
                <Badge variant="secondary" className="text-xs">
                  Free tier: 1 listing max
                </Badge>
              )}
            </div>

            {listingsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-24 h-20 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700 mb-2">No listings yet</h3>
                <p className="text-gray-400 text-sm mb-5">Create your first listing — it's free!</p>
                <Link href="/list-property">
                  <Button style={{ background: ACCENT, color: "#3A2410" }} className="font-bold gap-2">
                    <PlusCircle className="h-4 w-4" /> Create Listing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map(listing => (
                  <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={getListingImage(listing.photos, listing.id)}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className="text-xs"
                                style={listing.status === "active"
                                  ? { background: "#dcfce7", color: "#166534" }
                                  : { background: "#f3f4f6", color: "#6b7280" }
                                }
                              >
                                {listing.status === "active" ? "● Active" : "○ Inactive"}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-gray-900 truncate">{listing.title}</h3>
                            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {listing.city}, {listing.state}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-emerald-600">{formatRent(listing.monthlyRent)}</div>
                            <div className="text-xs text-gray-400">/mo</div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{listing.viewCount} views</span>
                          <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" />{listing.saveCount} saves</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(listing.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t px-4 py-2.5 flex items-center gap-2 bg-gray-50">
                      <Link href={`/listing/${listing.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                      <Link href={`/edit-listing/${listing.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </Link>
                      {isPaid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => {
                            setQrListingId(listing.id);
                            setQrData(null);
                            generateQRMutation.mutate({ listingId: listing.id });
                          }}
                        >
                          <QrCode className="h-3.5 w-3.5" /> QR Code
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => updateMutation.mutate({
                          id: listing.id,
                          status: listing.status === "active" ? "inactive" : "active",
                        })}
                      >
                        {listing.status === "active"
                          ? <><ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> Deactivate</>
                          : <><ToggleLeft className="h-3.5 w-3.5" /> Activate</>
                        }
                      </Button>
                      <div className="flex-1" />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove this listing?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove "{listing.title}" from the marketplace. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate({ id: listing.id })}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Remove Listing
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}

                {/* Add more CTA for free tier */}
                {!isPaid && myListings.length >= 1 && (
                  <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
                    <Lock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium mb-3">
                      Upgrade to Pro to add unlimited listings
                    </p>
                    <Button
                      size="sm"
                      onClick={() => upgradeMutation.mutate()}
                      style={{ background: ACCENT, color: "#3A2410" }}
                      className="font-bold"
                    >
                      Upgrade — $25/mo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Pro: Onboarding checklist */}
            {isPaid && <ProOnboardingChecklist />}

            {/* Pro: Portal Branding */}
            {isPaid && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5" style={{ color: ACCENT }} />
                  <h3 className="font-black text-gray-900">Portal Branding</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand Name</Label>
                    <Input value={brandForm.brandName} onChange={e => setBrandForm(f => ({ ...f, brandName: e.target.value }))} placeholder="Sunrise Realty" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subdomain</Label>
                    <div className="flex items-center mt-1.5">
                      <Input value={brandForm.portalSubdomain} onChange={e => setBrandForm(f => ({ ...f, portalSubdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} placeholder="sunrise" className="rounded-r-none" />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-xs text-gray-500 whitespace-nowrap">.leasely.net</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand Color</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input type="color" value={brandForm.brandColor} onChange={e => setBrandForm(f => ({ ...f, brandColor: e.target.value }))} className="h-9 w-12 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                      <Input value={brandForm.brandColor} onChange={e => setBrandForm(f => ({ ...f, brandColor: e.target.value }))} placeholder="#1B2B5E" className="font-mono text-sm" />
                    </div>
                  </div>
                  <BrandLogoUploader
                    value={brandForm.brandLogoUrl}
                    onChange={(url) => setBrandForm(f => ({ ...f, brandLogoUrl: url }))}
                  />
                  <Button onClick={() => updateBrandingMutation.mutate(brandForm)} disabled={updateBrandingMutation.isPending} className="w-full font-bold" style={{ background: BRAND, color: "white" }}>
                    {updateBrandingMutation.isPending ? "Saving..." : "Save Branding"}
                  </Button>
                </div>
              </div>
            )}

            {/* Plan Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-4">Your Plan</h3>
              {isPaid ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="h-5 w-5" style={{ color: ACCENT }} />
                    <span className="font-bold text-gray-900">Pro Plan</span>
                    <Badge style={{ background: `${ACCENT}20`, color: ACCENT, border: "none" }}>Active</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {["Unlimited listings", "AI fraud applicant detection", "Branded portal", "Background checks", "Advanced analytics"].map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <a href="https://www.leasely.net" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" /> Open Full Portal
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-gray-500 mb-4">You're on the <strong>Free Plan</strong> — 1 listing included.</div>
                  <ul className="space-y-2 text-sm mb-4">
                    {[
                      { label: "1 listing on marketplace", ok: true },
                      { label: "Map pin placement", ok: true },
                      { label: "Views & saves stats", ok: true },
                      { label: "Unlimited listings", ok: false },
                      { label: "Rental applications", ok: false },
                      { label: "AI fraud applicant detection", ok: false },
                      { label: "Branded portal", ok: false },
                      { label: "Background checks", ok: false },
                    ].map(({ label, ok }) => (
                      <li key={label} className={`flex items-center gap-2 ${ok ? "text-gray-700" : "text-gray-300"}`}>
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${ok ? "text-emerald-500" : "text-gray-200"}`} />
                        <span className={ok ? "" : "line-through"}>{label}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full font-bold" style={{ background: ACCENT, color: "#3A2410" }} onClick={() => upgradeMutation.mutate()} disabled={upgradeMutation.isPending}>
                    {upgradeMutation.isPending ? "Upgrading..." : "Upgrade to Pro"}
                  </Button>
                  <p className="text-xs text-gray-400 text-center mt-2">$25/month · Cancel anytime</p>
                </div>
              )}
            </div>

            {/* Locked Pro features (free tier) */}
            {!isPaid && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Locked Pro Features</p>
                <LockedFeatureCard icon={Globe} title="Branded Portal" desc="yourname.leasely.net with your logo and colors." />
                <LockedFeatureCard icon={Shield} title="AI Fraud Detection" desc="Screen every applicant for fake employers and inflated income." />
                <LockedFeatureCard icon={FileText} title="Rental Applications" desc="Receive and manage full rental applications." />
                <LockedFeatureCard icon={Users} title="Background Checks" desc="One-click ApplyConnect (TransUnion-backed) integration." />
              </div>
            )}

            {/* Pro: Stripe Connect Payouts */}
            {isPaid && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Banknote className="h-5 w-5" style={{ color: ACCENT }} />
                  <h3 className="font-black text-gray-900">Tenant Payments</h3>
                </div>
                {stripeStatus?.status === "active" ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3 p-3 bg-green-50 rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Payouts Active</span>
                    </div>
                    {/* Balance & Instant Payout */}
                    <div className="rounded-xl p-4 mb-4" style={{ background: `linear-gradient(135deg, ${BRAND}10, ${ACCENT}10)` }}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Available Balance</p>
                          <p className="text-2xl font-black text-gray-900">${((balanceData?.availableCents ?? 0) / 100).toFixed(2)}</p>
                          {(balanceData?.pendingCents ?? 0) > 0 && (
                            <p className="text-xs text-gray-400">${((balanceData?.pendingCents ?? 0) / 100).toFixed(2)} pending</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => instantPayoutMutation.mutate({})}
                          disabled={instantPayoutMutation.isPending || (balanceData?.availableCents ?? 0) < 100}
                          className="font-bold gap-1.5"
                          style={{ background: ACCENT, color: "#3A2410" }}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          {instantPayoutMutation.isPending ? "Processing..." : "Instant Payout"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Funds arrive in your bank account instantly (debit card) or within 1-2 business days (standard).</p>
                    </div>
                    {paymentHistory.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Recent Payments</p>
                        {paymentHistory.slice(0, 3).map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                            <div>
                              <div className="font-medium text-gray-800">{p.tenantName}</div>
                              <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">${(p.amountCents / 100).toFixed(2)}</div>
                              <div className={`text-xs font-medium ${p.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{p.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : stripeStatus?.status === "pending" ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3 p-3 bg-yellow-50 rounded-xl">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-700">Setup In Progress</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Complete your Stripe account setup to start receiving tenant payments.</p>
                    <Button size="sm" className="w-full font-bold gap-2" onClick={() => stripeConnectMutation.mutate()} disabled={stripeConnectMutation.isPending} style={{ background: BRAND, color: "white" }}>
                      <CreditCard className="h-3.5 w-3.5" /> Continue Setup
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">Enable tenants to pay rent directly through Leasely. Funds go straight to your bank account with instant payouts.</p>
                    <div className="space-y-2 mb-4">
                      {["Instant ACH & card payments", "Automatic receipts to tenants", "Direct deposits to your bank", "Full payment history & records"].map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{f}
                        </div>
                      ))}
                    </div>
                    <Button size="sm" className="w-full font-bold gap-2" onClick={() => stripeConnectMutation.mutate()} disabled={stripeConnectMutation.isPending} style={{ background: ACCENT, color: "#3A2410" }}>
                      <CreditCard className="h-3.5 w-3.5" /> {stripeConnectMutation.isPending ? "Connecting..." : "Connect Bank Account"}
                    </Button>
                    <p className="text-xs text-gray-400 text-center mt-2">Powered by Stripe Connect · Bank-level security</p>
                  </div>
                )}
              </div>
            )}

            {/* Pro: Portal Link */}
            {isPaid && portalSubdomain && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5" style={{ color: BRAND }} />
                  <h3 className="font-black text-gray-900">Your Public Portal</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Your portal URL</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-800 flex-1 truncate">
                      leasely.net/portal/{portalSubdomain}
                    </code>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                      navigator.clipboard.writeText(`https://leasely.net/portal/${portalSubdomain}`);
                      toast.success("URL copied!");
                    }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">Share this URL on Google, social media, or business cards. It shows your brand, logo, and all active listings.</p>
                <Link href={`/portal/${portalSubdomain}`}>
                  <Button variant="outline" size="sm" className="w-full gap-2 font-bold">
                    <ExternalLink className="h-3.5 w-3.5" /> Preview Your Portal
                  </Button>
                </Link>
              </div>
            )}

            {/* Pro: Tenant Invite */}
            {isPaid && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" style={{ color: BRAND }} />
                    <h3 className="font-black text-gray-900">Tenant Portal</h3>
                  </div>
                  <Button
                    size="sm"
                    className="font-bold gap-1.5 text-xs"
                    style={{ background: ACCENT, color: "#3A2410" }}
                    onClick={() => setTenantInviteOpen(true)}
                  >
                    <Users className="h-3.5 w-3.5" /> Invite Tenant
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Give tenants their own portal to pay rent via <strong>ACH at no fee</strong> (waived by your Pro plan), view their lease, and submit maintenance requests.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full font-semibold gap-2 text-xs"
                  onClick={() => setTenantInviteOpen(true)}
                >
                  <Users className="h-3.5 w-3.5" /> Manage Tenants
                </Button>
              </div>
            )}

            {/* Pro: Portal Tools Hub */}
            {isPaid && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5" style={{ color: ACCENT }} />
                  <h3 className="font-black text-gray-900">Pro Portal Tools</h3>
                </div>
                <div className="space-y-2">
                  <Link href="/work-orders">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
                        <Wrench className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">Work Orders</div>
                        <div className="text-xs text-gray-400">AI dispatch & multi-bid vendor management</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </Link>
                  <Link href="/leases">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">Lease Agreements</div>
                        <div className="text-xs text-gray-400">Tenant signs first → pays deposit + 1st month → you countersign</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </Link>
                  <Link href="/accounting">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#DCFCE7" }}>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">Accounting</div>
                        <div className="text-xs text-gray-400">Income, expenses & tax export</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </Link>
                  <Link href="/crm">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                        <Building2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">Property CRM</div>
                        <div className="text-xs text-gray-400">Units, tenants, leases & notes</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* Market Rent Intelligence - Pro only */}
            {isPaid && <RentRateWidget />}

            {/* Contractor Directory Widget */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-5 w-5 text-orange-500" />
                <h3 className="font-black text-gray-900">Find a Contractor</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">Browse verified handymen & contractors nationwide for your properties.</p>
              <div className="space-y-2">
                <Link href="/contractors">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF7ED" }}>
                      <Wrench className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">Contractor Directory</div>
                      <div className="text-xs text-gray-400">Search all 50 states</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
                <Link href="/contractors/register">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#F0FDF4" }}>
                      <PlusCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">List Your Business</div>
                      <div className="text-xs text-gray-400">Free contractor profile</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Saved Listings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900">Saved Listings</h3>
                <Link href="/saved"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
              </div>
              {savedListings.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No saved listings yet.</p>
              ) : (
                <div className="space-y-3">
                  {savedListings.slice(0, 3).map(listing => (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <img src={getListingImage(listing.photos, listing.id)} alt={listing.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{listing.title}</div>
                          <div className="text-xs text-gray-400">{formatRent(listing.monthlyRent)}/mo</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Invite Dialog */}
      <TenantInviteDialog
        open={tenantInviteOpen}
        onOpenChange={setTenantInviteOpen}
        listings={(myListings as any[]).map((l: any) => ({ id: l.id, address: l.address }))}
      />

      {/* QR Code Modal */}
      {qrListingId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setQrListingId(null); setQrData(null); }}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${BRAND}15` }}>
                <QrCode className="h-6 w-6" style={{ color: BRAND }} />
              </div>
              <h3 className="text-xl font-black text-gray-900">Property QR Code</h3>
              <p className="text-sm text-gray-500 mt-1">Print or share this code to direct people to your listing</p>
            </div>

            {generateQRMutation.isPending ? (
              <div className="flex items-center justify-center h-48">
                <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : qrData ? (
              <div>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                    <img src={qrData.qrDataUrl} alt="QR Code" className="h-48 w-48" />
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400 mb-4 font-mono break-all">{qrData.url}</p>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 font-bold gap-2"
                    style={{ background: BRAND, color: "white" }}
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = qrData.qrDataUrl;
                      link.download = `leasely-qr-listing-${qrListingId}.png`;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4" /> Download PNG
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 font-bold gap-2"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    Print Flyer
                  </Button>
                </div>
              </div>
            ) : null}

            <Button variant="ghost" className="w-full mt-3 text-gray-400" onClick={() => { setQrListingId(null); setQrData(null); }}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pro Onboarding Checklist ────────────────────────────────────────────────

function ProOnboardingChecklist() {
  const { user } = useAuth();
  const { data: myListings = [], isLoading: listingsLoading } = trpc.marketplace.getMyListings.useQuery();
  const { data: proCode } = trpc.proCode.getMine.useQuery();
  const { data: sub, isLoading: subLoading } = trpc.marketplace.getMySubscription.useQuery();

  const portalSubdomain = (user as any)?.portalSubdomain;
  const customDomain = (user as any)?.customDomain;
  const hasListings = myListings.length > 0;
  const hasConnect = (sub as any)?.stripeConnectStatus === "active";
  // Branded portal counts as done if user has EITHER a leasely.net subdomain
  // OR a custom domain (the "I have my own URL" path), since both flows
  // satisfy "set up your branded portal".
  const hasBrandedPortal = !!(portalSubdomain || customDomain);
  void proCode; // CBP claim now lives inside the PortalSetup flow; no separate checklist row.

  const steps = [
    { label: "Activate Pro", done: true, href: undefined },
    { label: "Set up your branded portal", done: hasBrandedPortal, href: "/portal-setup" },
    { label: "Add your first listing", done: hasListings, href: "/list-property" },
    { label: "Connect Stripe for rent payouts", done: hasConnect, href: "/dashboard" },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length;

  // Don't render until queries settle — prevents a flash of "Connect Stripe"
  // when the user actually has Stripe connected but `sub` is still undefined.
  if (listingsLoading || subLoading) return null;
  if (allDone) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="font-bold text-gray-900 text-sm">Pro Setup Checklist</span>
        </div>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full px-2.5 py-0.5">
          {completedCount}/{steps.length}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-indigo-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-[#F5A623]/20" : "bg-white border border-gray-200"}`}>
              {s.done
                ? <CheckCircle2 className="h-3.5 w-3.5 text-[#F5A623]" />
                : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block" />
              }
            </div>
            {s.href && !s.done ? (
              <a href={s.href} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline underline-offset-2 transition-colors">
                {s.label}
              </a>
            ) : (
              <span className={`text-sm ${s.done ? "text-gray-400 line-through" : "text-gray-700 font-medium"}`}>{s.label}</span>
            )}
          </div>
        ))}
      </div>
      {/* CBP partnership attribution */}
      <div className="mt-4 pt-3 border-t border-indigo-100/60 flex items-center gap-1.5 text-xs text-gray-400">
        <Sparkles className="h-3 w-3 text-amber-500" />
        <span>Brand kit by <a href="https://certifybusinesspro.com" target="_blank" rel="noopener" className="font-semibold text-amber-600 hover:underline">Certify Business Pro</a> — Leasely partner</span>
      </div>
    </div>
  );
}
