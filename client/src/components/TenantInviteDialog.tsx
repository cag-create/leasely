import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  UserPlus, Mail, Phone, DollarSign, Calendar, Home,
  Users, Trash2, Copy, CheckCircle2, Sparkles
} from "lucide-react";

const BRAND = "#0d3d2e";
const ACCENT = "#b8f04a";

interface TenantInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listings?: Array<{ id: number; address: string }>;
}

export default function TenantInviteDialog({ open, onOpenChange, listings = [] }: TenantInviteDialogProps) {
  const utils = trpc.useUtils();
  const [view, setView] = useState<"list" | "invite">("list");
  const [copied, setCopied] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    listingId: "",
    monthlyRent: "",
    leaseStart: "",
    leaseEnd: "",
  });

  const { data: tenants = [], isLoading } = trpc.tenant.listTenants.useQuery();

  const inviteMutation = trpc.tenant.inviteTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant invited! They'll receive a magic-link to their portal.");
      utils.tenant.listTenants.invalidate();
      setForm({ name: "", email: "", phone: "", listingId: "", monthlyRent: "", leaseStart: "", leaseEnd: "" });
      setView("list");
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMutation = trpc.tenant.removeTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant access removed.");
      utils.tenant.listTenants.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error("Name and email are required.");
    inviteMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      listingId: form.listingId ? parseInt(form.listingId) : undefined,
      monthlyRentCents: form.monthlyRent ? Math.round(parseFloat(form.monthlyRent) * 100) : undefined,
      leaseStart: form.leaseStart || undefined,
      leaseEnd: form.leaseEnd || undefined,
    });
  };

  const copyPortalLink = (email: string, id: number) => {
    const link = `${window.location.origin}/tenant/login?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Portal link copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black" style={{ color: BRAND }}>
            <Users className="h-5 w-5" /> Tenant Portal Management
          </DialogTitle>
          <DialogDescription>
            Invite tenants to their own portal where they can pay rent, view their lease, and submit maintenance requests.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b pb-3">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              view === "list" ? "text-white" : "text-gray-500 hover:text-gray-700"
            }`}
            style={view === "list" ? { background: BRAND } : {}}
          >
            My Tenants ({tenants.length})
          </button>
          <button
            onClick={() => setView("invite")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              view === "invite" ? "text-white" : "text-gray-500 hover:text-gray-700"
            }`}
            style={view === "invite" ? { background: BRAND } : {}}
          >
            <span className="flex items-center gap-1.5"><UserPlus className="h-3.5 w-3.5" /> Invite New Tenant</span>
          </button>
        </div>

        {/* Tenant list view */}
        {view === "list" && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading tenants...</div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-10">
                <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No tenants invited yet</p>
                <p className="text-gray-400 text-sm mt-1">Invite your first tenant to give them portal access.</p>
                <Button
                  className="mt-4 font-bold gap-2"
                  style={{ background: ACCENT, color: "#0a2a1f" }}
                  onClick={() => setView("invite")}
                >
                  <UserPlus className="h-4 w-4" /> Invite First Tenant
                </Button>
              </div>
            ) : (
              <>
                {(tenants as any[]).map((tenant) => (
                  <div key={tenant.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ background: BRAND }}>
                      {tenant.name?.charAt(0)?.toUpperCase() ?? "T"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{tenant.name}</p>
                        <Badge
                          variant="secondary"
                          className="text-xs shrink-0"
                          style={tenant.loginToken ? { background: `${ACCENT}20`, color: BRAND } : {}}
                        >
                          {tenant.loginToken ? "Active" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{tenant.email}</p>
                      {tenant.monthlyRentCents && (
                        <p className="text-xs text-gray-400">
                          ${(tenant.monthlyRentCents / 100).toLocaleString()}/mo
                          {tenant.leaseStart && ` · Lease from ${new Date(tenant.leaseStart).toLocaleDateString()}`}
                          {tenant.leaseEnd && ` to ${new Date(tenant.leaseEnd).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-8"
                        onClick={() => copyPortalLink(tenant.email, tenant.id)}
                      >
                        {copied === tenant.id ? (
                          <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" /> Copy Link</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => {
                          if (confirm(`Remove portal access for ${tenant.name}?`)) {
                            removeMutation.mutate({ id: tenant.id });
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  className="w-full font-bold gap-2 mt-2"
                  style={{ background: ACCENT, color: "#0a2a1f" }}
                  onClick={() => setView("invite")}
                >
                  <UserPlus className="h-4 w-4" /> Invite Another Tenant
                </Button>
              </>
            )}
          </div>
        )}

        {/* Invite form view */}
        {view === "invite" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl p-4 border" style={{ background: `${ACCENT}10`, borderColor: `${ACCENT}40` }}>
              <p className="text-sm font-semibold flex items-center gap-2" style={{ color: BRAND }}>
                <Sparkles className="h-4 w-4" /> How it works
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Enter your tenant's details below. They'll receive a magic-link to their own portal where they can pay rent via ACH (free for them — waived by your Pro subscription), view their lease, and submit maintenance requests.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Tenant Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="jane@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Monthly Rent</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="1500"
                    value={form.monthlyRent}
                    onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))}
                    className="pl-9"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />Lease Start
                </Label>
                <Input
                  type="date"
                  value={form.leaseStart}
                  onChange={e => setForm(f => ({ ...f, leaseStart: e.target.value }))}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />Lease End
                </Label>
                <Input
                  type="date"
                  value={form.leaseEnd}
                  onChange={e => setForm(f => ({ ...f, leaseEnd: e.target.value }))}
                />
              </div>

              {listings.length > 0 && (
                <div className="col-span-2">
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    <Home className="inline h-3.5 w-3.5 mr-1" />Link to Listing (optional)
                  </Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={form.listingId}
                    onChange={e => setForm(f => ({ ...f, listingId: e.target.value }))}
                  >
                    <option value="">Select a property...</option>
                    {listings.map(l => (
                      <option key={l.id} value={l.id}>{l.address}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setView("list")}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 font-bold gap-2"
                style={{ background: BRAND, color: "white" }}
                disabled={inviteMutation.isPending}
              >
                <Mail className="h-4 w-4" />
                {inviteMutation.isPending ? "Sending Invite..." : "Send Magic-Link Invite"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
