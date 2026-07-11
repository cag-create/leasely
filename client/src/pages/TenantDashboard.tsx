import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Home, DollarSign, Calendar, FileText, LogOut, CreditCard,
  CheckCircle2, Clock, AlertCircle, ArrowRight, Receipt,
  Building2, Phone, Mail, Loader2, Shield, Wrench, Send,
  Star, Users,
} from "lucide-react";

import { LOGO_URL } from "@/lib/brand";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TenantDashboard() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "lease" | "maintenance" | "contractors">("overview");
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: "",
    description: "",
    category: "other" as "plumbing"|"electrical"|"hvac"|"appliance"|"structural"|"pest_control"|"cleaning"|"landscaping"|"other",
    priority: "medium" as "low"|"medium"|"high"|"emergency",
    photos: [] as string[], // photo URLs (tenant pastes Cloudinary/S3 links or uses upload)
  });
  const [maintenanceSubmitted, setMaintenanceSubmitted] = useState(false);
  const [photoInput, setPhotoInput] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("leasely_tenant_token");
    if (!token) {
      window.location.href = "/tenant/login";
    } else {
      setSessionToken(token);
    }
  }, []);

  const stableToken = useMemo(() => ({ sessionToken: sessionToken ?? "" }), [sessionToken]);

  const { data, isLoading, error } = trpc.tenant.getPortalData.useQuery(stableToken, {
    enabled: !!sessionToken,
    retry: false,
  });

  const submitMaintenanceMutation = trpc.workOrders.submitTenant.useMutation({
    onSuccess: () => {
      toast.success("Maintenance request submitted! Your landlord has been notified.");
      setMaintenanceSubmitted(true);
      setMaintenanceForm({ title: "", description: "", category: "other", priority: "medium", photos: [] });
      setPhotoInput("");
    },
    onError: (err) => toast.error(err.message),
  });

  // Favorite-vendor queries + mutations. Tenants pick a preferred vendor per
  // work-order category; the server then routes matching repair requests
  // straight to that vendor instead of round-robin / all-vendors dispatch.
  const tenantUtils = trpc.useUtils();
  const availableVendorsQ = trpc.tenant.listAvailableVendors.useQuery(
    { sessionToken: sessionToken ?? "" },
    { enabled: !!sessionToken, retry: false },
  );
  const myFavoritesQ = trpc.tenant.listMyFavoriteVendors.useQuery(
    { sessionToken: sessionToken ?? "" },
    { enabled: !!sessionToken, retry: false },
  );
  const setFavoriteMut = trpc.tenant.setFavoriteVendor.useMutation({
    onSuccess: () => {
      toast.success("Favorite saved — we'll route matching requests here first.");
      tenantUtils.tenant.listMyFavoriteVendors.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });
  const clearFavoriteMut = trpc.tenant.clearFavoriteVendor.useMutation({
    onSuccess: () => {
      toast.success("Favorite cleared. We'll fall back to your landlord's full vendor pool.");
      tenantUtils.tenant.listMyFavoriteVendors.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken || !maintenanceForm.title.trim()) return;
    submitMaintenanceMutation.mutate({
      tenantToken: sessionToken,
      title: maintenanceForm.title,
      description: maintenanceForm.description || undefined,
      category: maintenanceForm.category,
      priority: maintenanceForm.priority,
      photos: maintenanceForm.photos.length > 0 ? maintenanceForm.photos : undefined,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("leasely_tenant_token");
    localStorage.removeItem("leasely_tenant_id");
    window.location.href = "/tenant/login";
  };

  if (!sessionToken || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3" style={{ color: ACCENT }} />
          <p className="text-gray-500 font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-500 mb-6">Your session has expired. Please sign in again.</p>
          <Link href="/tenant/login">
            <Button style={{ background: ACCENT, color: "#3A2410" }} className="font-bold">Sign In Again</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tenant = data?.tenant;
  const payments = data?.payments ?? [];
  const totalPaid = payments.filter((p: any) => p.status === "paid").reduce((sum: number, p: any) => sum + p.amountCents, 0);
  const lastPayment = payments.find((p: any) => p.status === "paid");

  // Days until lease ends
  const daysUntilLeaseEnd = tenant?.leaseEnd
    ? Math.ceil((new Date(tenant.leaseEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Home },
    { id: "payments" as const, label: "Payments", icon: DollarSign },
    { id: "lease" as const, label: "Lease Info", icon: FileText },
    { id: "maintenance" as const, label: "Maintenance", icon: Wrench },
    { id: "contractors" as const, label: "My Contractors", icon: Users },
  ];

  // Map of category → favorite vendor row (or undefined). Used to:
  //   - render filled vs. outline stars in the My Contractors tab
  //   - show "your favorite plumber will be notified" hint on the
  //     maintenance form
  const favoritesByCategory: Record<string, { vendorId: number; vendorName: string }> = {};
  (myFavoritesQ.data ?? []).forEach((f: any) => {
    if (f.vendor) {
      favoritesByCategory[f.category] = { vendorId: f.vendorId, vendorName: f.vendor.name };
    }
  });

  const CATEGORIES: Array<{ id: "plumbing"|"electrical"|"hvac"|"appliance"|"structural"|"pest_control"|"cleaning"|"landscaping"|"other"; label: string }> = [
    { id: "plumbing",     label: "Plumbing" },
    { id: "electrical",   label: "Electrical" },
    { id: "hvac",         label: "HVAC" },
    { id: "appliance",    label: "Appliance" },
    { id: "structural",   label: "Structural" },
    { id: "pest_control", label: "Pest Control" },
    { id: "cleaning",     label: "Cleaning" },
    { id: "landscaping",  label: "Landscaping" },
    { id: "other",        label: "Other / General" },
  ];

  const availableVendors = (availableVendorsQ.data ?? []) as Array<{
    id: number; name: string; trade?: string | null; email?: string | null; phone?: string | null;
  }>;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Leasely" className="h-7 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="font-black text-lg" style={{ color: BRAND }}>Leasely</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-500">Tenant Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{tenant?.name}</div>
              <div className="text-xs text-gray-400">{tenant?.email}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-gray-500">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome banner */}
        <div className="rounded-3xl p-6 mb-8 text-white" style={{ background: `linear-gradient(135deg, ${BRAND}, #0d3a2a)` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Welcome back</p>
              <h1 className="text-2xl font-black">{tenant?.name}</h1>
              {tenant?.monthlyRentCents && (
                <p className="text-white/70 mt-1">
                  Monthly rent: <span className="text-white font-bold">{formatCents(tenant.monthlyRentCents)}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {daysUntilLeaseEnd !== null && (
                <Badge className="font-semibold" style={{ background: daysUntilLeaseEnd < 60 ? "#FEF3C7" : `${ACCENT}30`, color: daysUntilLeaseEnd < 60 ? "#92400E" : ACCENT, border: "none" }}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {daysUntilLeaseEnd > 0 ? `${daysUntilLeaseEnd} days left on lease` : "Lease expired"}
                </Badge>
              )}
              {tenant?.listingId && (
                <Link href={`/pay/${tenant.listingId}`}>
                  <Button size="sm" className="font-bold gap-1.5" style={{ background: ACCENT, color: "#3A2410" }}>
                    <CreditCard className="h-3.5 w-3.5" /> Pay Rent Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Rent status card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                  <DollarSign className="h-5 w-5" style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="font-black text-gray-900">Monthly Rent</div>
                  <div className="text-xs text-gray-400">Due on the 1st</div>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                {tenant?.monthlyRentCents ? formatCents(tenant.monthlyRentCents) : "—"}
              </div>
              {lastPayment && (
                <p className="text-xs text-gray-400">Last paid: {formatDate(lastPayment.createdAt)}</p>
              )}
              {tenant?.listingId && (
                <Link href={`/pay/${tenant.listingId}`}>
                  <Button className="w-full mt-4 font-bold gap-2" style={{ background: ACCENT, color: "#3A2410" }}>
                    <CreditCard className="h-4 w-4" /> Pay Rent
                  </Button>
                </Link>
              )}
            </div>

            {/* Total paid card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-black text-gray-900">Total Paid</div>
                  <div className="text-xs text-gray-400">All time via Leasely</div>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{formatCents(totalPaid)}</div>
              <p className="text-xs text-gray-400">{payments.filter((p: any) => p.status === "paid").length} payments made</p>
            </div>

            {/* Lease summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-black text-gray-900">Lease Period</div>
                  <div className="text-xs text-gray-400">Your rental term</div>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Start</span>
                  <span className="font-semibold text-gray-900">{formatDate(tenant?.leaseStart)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End</span>
                  <span className="font-semibold text-gray-900">{formatDate(tenant?.leaseEnd)}</span>
                </div>
                {daysUntilLeaseEnd !== null && daysUntilLeaseEnd > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Remaining</span>
                    <span className="font-bold" style={{ color: daysUntilLeaseEnd < 60 ? "#D97706" : ACCENT }}>{daysUntilLeaseEnd} days</span>
                  </div>
                )}
              </div>
            </div>

            {/* Security info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5" style={{ color: ACCENT }} />
                <h3 className="font-black text-gray-900">Secure Payments via Leasely</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: CheckCircle2, title: "ACH Bank Transfer", desc: "Free for you — your landlord's Pro plan covers all ACH processing fees.", color: "text-green-600" },
                  { icon: CreditCard, title: "Card Payments", desc: "Pay with any major credit or debit card. Processed securely by Stripe.", color: "text-blue-600" },
                  { icon: Receipt, title: "Automatic Receipts", desc: "Every payment generates a receipt sent to your email automatically.", color: "text-purple-600" },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="flex gap-3">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${color}`} />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="space-y-4">
          {(data?.balanceCents ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Balance due</p>
                  <p className="text-3xl font-black text-gray-900">{formatCents(data?.balanceCents ?? 0)}</p>
                </div>
                {(data?.lateFeeCents ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1">Late fee applied</span>
                )}
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Rent ({data?.unpaidPeriods ?? 0} period{(data?.unpaidPeriods ?? 0) === 1 ? "" : "s"})</span><span>{formatCents(data?.rentDueCents ?? 0)}</span></div>
                {(data?.lateFeeCents ?? 0) > 0 && (
                  <div className="flex justify-between text-amber-700"><span>Late fees</span><span>+{formatCents(data?.lateFeeCents ?? 0)}</span></div>
                )}
                <div className="flex justify-between font-black border-t border-dashed border-gray-200 pt-1.5"><span>Total due</span><span>{formatCents(data?.balanceCents ?? 0)}</span></div>
              </div>
              {tenant?.listingId && (
                <Link href={`/pay/${tenant.listingId}`}>
                  <Button className="w-full mt-4 font-bold gap-1.5" style={{ background: ACCENT, color: "#fff" }}>
                    <CreditCard className="h-4 w-4" /> Pay {formatCents(data?.balanceCents ?? 0)}
                  </Button>
                </Link>
              )}
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-black text-gray-900 text-xl">Payment History</h2>
              {tenant?.listingId && (
                <Link href={`/pay/${tenant.listingId}`}>
                  <Button size="sm" className="font-bold gap-1.5" style={{ background: ACCENT, color: "#3A2410" }}>
                    <CreditCard className="h-3.5 w-3.5" /> Make a Payment
                  </Button>
                </Link>
              )}
            </div>
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <h3 className="font-bold text-gray-500 mb-1">No payments yet</h3>
                <p className="text-sm text-gray-400">Your payment history will appear here once you make your first payment.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${p.status === "paid" ? "bg-green-50" : "bg-yellow-50"}`}>
                        {p.status === "paid"
                          ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                          : <Clock className="h-5 w-5 text-yellow-600" />
                        }
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Rent Payment</div>
                        <div className="text-xs text-gray-400">{formatDate(p.createdAt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-gray-900">{formatCents(p.amountCents)}</div>
                      <Badge variant={p.status === "paid" ? "default" : "secondary"} className={`text-xs ${p.status === "paid" ? "bg-green-100 text-green-700 border-0" : ""}`}>
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === "maintenance" && (
          <div className="max-w-2xl">
            {maintenanceSubmitted && (
              <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <div className="font-semibold text-green-800">Request submitted!</div>
                  <div className="text-sm text-green-700">Your landlord and any assigned contractor have been notified by email.</div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-black text-gray-900 text-xl mb-1 flex items-center gap-2">
                <Wrench className="h-5 w-5" style={{ color: BRAND }} /> Submit a Maintenance Request
              </h2>
              <p className="text-sm text-gray-500 mb-6">Describe the issue and we'll notify your property manager immediately. If a contractor is available, they'll be automatically assigned.</p>
              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Issue Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leaking faucet in kitchen"
                    value={maintenanceForm.title}
                    onChange={e => setMaintenanceForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                    <select
                      value={maintenanceForm.category}
                      onChange={e => setMaintenanceForm(f => ({ ...f, category: e.target.value as any }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC</option>
                      <option value="appliance">Appliance</option>
                      <option value="structural">Structural</option>
                      <option value="pest_control">Pest Control</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="landscaping">Landscaping</option>
                      <option value="other">Other</option>
                    </select>
                    {/* Dispatch preview — surfaces who's going to get the
                        email so the tenant has confidence in the routing. */}
                    {favoritesByCategory[maintenanceForm.category] ? (
                      <p className="mt-1.5 text-[11px] text-emerald-700 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Your favorite ({favoritesByCategory[maintenanceForm.category].vendorName}) will be notified directly.
                      </p>
                    ) : availableVendors.length > 0 ? (
                      <p className="mt-1.5 text-[11px] text-gray-500">
                        Your landlord's contractor pool will be notified. <button type="button" onClick={() => setActiveTab("contractors")} className="underline font-semibold">Pick a favorite →</button>
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                    <select
                      value={maintenanceForm.priority}
                      onChange={e => setMaintenanceForm(f => ({ ...f, priority: e.target.value as any }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide as much detail as possible about the issue..."
                    value={maintenanceForm.description}
                    onChange={e => setMaintenanceForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                {/* Photo URLs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Photos <span className="text-gray-400 font-normal">(optional — paste image URLs)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      placeholder="https://... (paste a photo link)"
                      value={photoInput}
                      onChange={e => setPhotoInput(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (photoInput.trim() && maintenanceForm.photos.length < 5) {
                          setMaintenanceForm(f => ({ ...f, photos: [...f.photos, photoInput.trim()] }));
                          setPhotoInput("");
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      Add
                    </button>
                  </div>
                  {maintenanceForm.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {maintenanceForm.photos.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`Photo ${i+1}`} className="w-20 h-16 object-cover rounded-lg border border-gray-200" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                          <button
                            type="button"
                            onClick={() => setMaintenanceForm(f => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Photos help vendors understand the issue before arrival. Up to 5 photos.</p>
                </div>

                {maintenanceForm.priority === "emergency" && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium">
                      Emergency requests are sent immediately. If there's a safety risk, also call 911 or your local emergency services.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitMaintenanceMutation.isPending || !maintenanceForm.title.trim()}
                  className="w-full font-bold gap-2 py-3"
                  style={{ background: BRAND, color: "white" }}
                >
                  {submitMaintenanceMutation.isPending
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                    : <><Send className="h-4 w-4" /> Submit Request</>
                  }
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* My Contractors Tab */}
        {activeTab === "contractors" && (
          <div className="max-w-3xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
              <h2 className="font-black text-gray-900 text-xl mb-1 flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: BRAND }} /> My Preferred Contractors
              </h2>
              <p className="text-sm text-gray-500">
                Pick your go-to contractor for each issue type. When you submit a repair request, we'll send it straight to your favorite instead of rotating through the landlord's full vendor list.
              </p>
            </div>

            {availableVendorsQ.isLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">Loading your landlord's contractors…</p>
              </div>
            ) : availableVendors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700 mb-1">No contractors yet</p>
                <p className="text-sm text-gray-500">
                  Your landlord hasn't added any contractors yet. Repair requests will go directly to your landlord until contractors are added.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {CATEGORIES.map(cat => {
                  const fav = favoritesByCategory[cat.id];
                  return (
                    <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-sm">{cat.label}</h3>
                        {fav ? (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Favorite set
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">No favorite</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {availableVendors.map(v => {
                          const isFav = fav?.vendorId === v.id;
                          const isBusy = setFavoriteMut.isPending || clearFavoriteMut.isPending;
                          return (
                            <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                              <button
                                type="button"
                                disabled={isBusy || !sessionToken}
                                onClick={() => {
                                  if (!sessionToken) return;
                                  if (isFav) {
                                    clearFavoriteMut.mutate({ sessionToken, category: cat.id });
                                  } else {
                                    setFavoriteMut.mutate({ sessionToken, vendorId: v.id, category: cat.id });
                                  }
                                }}
                                aria-label={isFav ? `Unfavorite ${v.name} for ${cat.label}` : `Favorite ${v.name} for ${cat.label}`}
                                className="shrink-0 disabled:opacity-50 transition-transform hover:scale-110"
                              >
                                <Star
                                  className="h-5 w-5"
                                  style={{
                                    color: isFav ? "#818CF8" : "#cbd5e1",
                                    fill: isFav ? "#818CF8" : "transparent",
                                  }}
                                />
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-sm">{v.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {[v.email, v.phone].filter(Boolean).join(" · ")}
                                </div>
                                {v.trade && (
                                  <div className="text-[11px] text-gray-400 mt-0.5">Trade: {v.trade}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Lease Tab */}
        {activeTab === "lease" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: BRAND }} /> Lease Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Tenant Name", value: tenant?.name },
                  { label: "Email", value: tenant?.email },
                  { label: "Phone", value: tenant?.phone || "—" },
                  { label: "Monthly Rent", value: tenant?.monthlyRentCents ? formatCents(tenant.monthlyRentCents) : "—" },
                  { label: "Lease Start", value: formatDate(tenant?.leaseStart) },
                  { label: "Lease End", value: formatDate(tenant?.leaseEnd) },
                  { label: "Status", value: tenant?.status === "active" ? "Active" : "Inactive" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500 font-medium">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                <Building2 className="h-5 w-5" style={{ color: BRAND }} /> Contact Your Landlord
              </h3>
              <p className="text-sm text-gray-500 mb-5">Need to reach your property manager? Use the contact info below or submit a maintenance request.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Contact via Leasely portal</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Phone: Contact your landlord directly</span>
                </div>
              </div>
              {tenant?.listingId && (
                <Link href={`/listing/${tenant.listingId}`}>
                  <Button variant="outline" className="w-full mt-4 gap-2 font-semibold">
                    <Home className="h-4 w-4" /> View Your Property Listing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
