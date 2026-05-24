import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  FileText, Plus, CheckCircle2, Clock, Send, AlertTriangle,
  Home, DollarSign, Calendar, Key, ChevronRight, Users, Pencil
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  tenant_signed: "bg-amber-100 text-amber-800",
  awaiting_payment: "bg-amber-100 text-amber-800",
  paid: "bg-cyan-100 text-cyan-800",
  signed: "bg-green-100 text-green-800",
  active: "bg-emerald-100 text-emerald-800",
  expired: "bg-orange-100 text-orange-800",
  terminated: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent to tenant",
  tenant_signed: "Tenant signed",
  awaiting_payment: "Awaiting payment",
  paid: "Paid — countersign",
  signed: "Fully executed",
  active: "Active",
  expired: "Expired",
  terminated: "Terminated",
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const emptyForm: {
  tenantName: string; tenantEmail: string; tenantPhone: string;
  state: string; propertyAddress: string;
  monthlyRentDollars: string; securityDepositDollars: string;
  leaseStartDate: string; leaseEndDate: string;
  leaseTerm: "month_to_month" | "6_months" | "12_months" | "24_months" | "36_months";
  accessMethod: "lockbox" | "key_pickup" | "in_person" | "other";
  lockboxCode: string; accessInstructions: string; notes: string;
} = {
  tenantName: "", tenantEmail: "", tenantPhone: "",
  state: "", propertyAddress: "",
  monthlyRentDollars: "", securityDepositDollars: "",
  leaseStartDate: "", leaseEndDate: "",
  leaseTerm: "12_months",
  accessMethod: "key_pickup",
  lockboxCode: "", accessInstructions: "", notes: "",
};

function LeaseEditForm({ lease, onClose }: { lease: any; onClose: () => void }) {
  const [form, setForm] = useState({
    leaseStartDate: lease.leaseStartDate ?? "",
    leaseEndDate: lease.leaseEndDate ?? "",
    monthlyRent: lease.monthlyRent ? (lease.monthlyRent / 100).toString() : "",
    securityDeposit: lease.securityDeposit ? (lease.securityDeposit / 100).toString() : "",
    leaseTerm: lease.leaseTerm ?? "24_months",
  });

  const updateMutation = trpc.leases.updateDraft.useMutation({
    onSuccess: () => { toast.success("Lease updated"); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Start Date</Label>
          <Input type="date" value={form.leaseStartDate} onChange={e => setForm(f => ({ ...f, leaseStartDate: e.target.value }))} />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="date" value={form.leaseEndDate} onChange={e => setForm(f => ({ ...f, leaseEndDate: e.target.value }))} />
        </div>
        <div>
          <Label>Monthly Rent ($)</Label>
          <Input type="number" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))} />
        </div>
        <div>
          <Label>Security Deposit ($)</Label>
          <Input type="number" value={form.securityDeposit} onChange={e => setForm(f => ({ ...f, securityDeposit: e.target.value }))} />
        </div>
      </div>
      <div>
        <Label>Lease Term</Label>
        <Select value={form.leaseTerm} onValueChange={v => setForm(f => ({ ...f, leaseTerm: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="12_months">12 Months</SelectItem>
            <SelectItem value="24_months">24 Months</SelectItem>
            <SelectItem value="36_months">36 Months</SelectItem>
            <SelectItem value="month_to_month">Month-to-Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        className="w-full bg-[#1B2B5E] hover:bg-[#2D3F7C] text-white"
        onClick={() => updateMutation.mutate({
          leaseId: lease.id,
          leaseStartDate: form.leaseStartDate || undefined,
          leaseEndDate: form.leaseEndDate || undefined,
          monthlyRent: form.monthlyRent ? Math.round(parseFloat(form.monthlyRent) * 100) : undefined,
          securityDeposit: form.securityDeposit ? Math.round(parseFloat(form.securityDeposit) * 100) : undefined,
          leaseTerm: form.leaseTerm as any,
        })}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? "Saving..." : "Save & Re-render Lease"}
      </Button>
    </div>
  );
}

export default function Leases() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [editLease, setEditLease] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: leases, refetch } = trpc.leases.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const createMutation = trpc.leases.create.useMutation({
    onSuccess: () => {
      toast.success("Lease created as draft");
      setCreateOpen(false);
      setForm(emptyForm);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const sendMutation = trpc.leases.send.useMutation({
    onSuccess: () => {
      toast.success("Lease sent to tenant");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.leases.update.useMutation({
    onSuccess: () => {
      toast.success("Lease updated");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const landlordSignMutation = trpc.leases.landlordSign.useMutation({
    onSuccess: () => {
      toast.success("Lease countersigned — tenant has been notified");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign in required</h2>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const draft = leases?.filter(l => l.status === "draft").length ?? 0;
  const active = leases?.filter(l => l.status === "signed" || l.status === "active").length ?? 0;
  const total = leases?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#1B2B5E]" />
              Lease Agreements
            </h1>
            <p className="text-gray-500 mt-1">State-specific leases — create, send, and track e-signatures</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B2B5E] hover:bg-[#2D3F7C] text-white gap-2">
                <Plus className="w-4 h-4" /> New Lease
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B2B5E]" />
                  Create Lease Agreement
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
                  <strong>How signing works:</strong> Send the lease → <strong>tenant signs first</strong> → tenant pays
                  security deposit + first month's rent → you countersign to fully execute. The lease is conditional
                  until you countersign, so funds are guaranteed before the tenancy is binding.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Tenant Name *</Label>
                    <Input value={form.tenantName} onChange={e => setForm(f => ({ ...f, tenantName: e.target.value }))} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <Label>Tenant Email *</Label>
                    <Input type="email" value={form.tenantEmail} onChange={e => setForm(f => ({ ...f, tenantEmail: e.target.value }))} placeholder="tenant@email.com" />
                  </div>
                  <div>
                    <Label>Tenant Phone</Label>
                    <Input value={form.tenantPhone} onChange={e => setForm(f => ({ ...f, tenantPhone: e.target.value }))} placeholder="(704) 555-0100" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3">
                    <Label>Property Address *</Label>
                    <Input value={form.propertyAddress} onChange={e => setForm(f => ({ ...f, propertyAddress: e.target.value }))} placeholder="123 Main St, Charlotte" />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Select value={form.state} onValueChange={v => setForm(f => ({ ...f, state: v }))}>
                      <SelectTrigger><SelectValue placeholder="NC" /></SelectTrigger>
                      <SelectContent className="max-h-48">
                        {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Monthly Rent (dollars) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input className="pl-7" type="number" min="0" value={form.monthlyRentDollars} onChange={e => setForm(f => ({ ...f, monthlyRentDollars: e.target.value }))} placeholder="1500" />
                    </div>
                  </div>
                  <div>
                    <Label>Security Deposit (dollars)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input className="pl-7" type="number" min="0" value={form.securityDepositDollars} onChange={e => setForm(f => ({ ...f, securityDepositDollars: e.target.value }))} placeholder="1500" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Lease Start *</Label>
                    <Input type="date" value={form.leaseStartDate} onChange={e => setForm(f => ({ ...f, leaseStartDate: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Lease End</Label>
                    <Input type="date" value={form.leaseEndDate} onChange={e => setForm(f => ({ ...f, leaseEndDate: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Lease Term</Label>
                    <Select value={form.leaseTerm} onValueChange={v => setForm(f => ({ ...f, leaseTerm: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12_months">12 Months</SelectItem>
                        <SelectItem value="24_months">24 Months</SelectItem>
                        <SelectItem value="36_months">36 Months</SelectItem>
                        <SelectItem value="6_months">6 Months</SelectItem>
                        <SelectItem value="month_to_month">Month-to-Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" /> Access / Move-in Instructions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Access Method</Label>
                      <Select value={form.accessMethod} onValueChange={v => setForm(f => ({ ...f, accessMethod: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lockbox">Lockbox</SelectItem>
                          <SelectItem value="key_pickup">Key Pickup</SelectItem>
                          <SelectItem value="in_person">In Person</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {form.accessMethod === "lockbox" && (
                      <div>
                        <Label>Lockbox Code</Label>
                        <Input value={form.lockboxCode} onChange={e => setForm(f => ({ ...f, lockboxCode: e.target.value }))} placeholder="1234" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <Label>Access Instructions</Label>
                    <Textarea
                      value={form.accessInstructions}
                      onChange={e => setForm(f => ({ ...f, accessInstructions: e.target.value }))}
                      placeholder={form.accessMethod === "lockbox" ? "Lockbox is on the front door handle" : "Keys available at 123 Office Dr, Suite 4"}
                      rows={2}
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes (internal)</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Pet deposit, parking, utilities included..." rows={2} />
                </div>

                <Button
                  className="w-full bg-[#1B2B5E] hover:bg-[#2D3F7C] text-white"
                  onClick={() => {
                    if (!form.tenantName || !form.tenantEmail || !form.state || !form.propertyAddress || !form.monthlyRentDollars || !form.leaseStartDate) {
                      return toast.error("Please fill in all required fields");
                    }
                    createMutation.mutate({
                      tenantName: form.tenantName,
                      tenantEmail: form.tenantEmail,
                      tenantPhone: form.tenantPhone || undefined,
                      state: form.state,
                      propertyAddress: form.propertyAddress,
                      monthlyRent: Math.round(parseFloat(form.monthlyRentDollars) * 100),
                      securityDeposit: form.securityDepositDollars ? Math.round(parseFloat(form.securityDepositDollars) * 100) : 0,
                      leaseStartDate: form.leaseStartDate,
                      leaseEndDate: form.leaseEndDate || undefined,
                      leaseTerm: form.leaseTerm,
                      accessMethod: form.accessMethod,
                      lockboxCode: form.lockboxCode || undefined,
                      accessInstructions: form.accessInstructions || undefined,
                      notes: form.notes || undefined,
                    });
                  }}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Lease (Draft)"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-gray-200">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-500" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-sm text-gray-500">Total Leases</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-800">{draft}</div>
                <div className="text-sm text-blue-700">Drafts</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-800">{active}</div>
                <div className="text-sm text-green-700">Signed / Active</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leases List */}
        {!leases || leases.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No leases yet</h3>
              <p className="text-gray-500 mb-4">Create your first lease. Once the tenant signs, payment links are sent automatically.</p>
              <Button onClick={() => setCreateOpen(true)} className="bg-[#1B2B5E] hover:bg-[#2D3F7C] text-white">
                <Plus className="w-4 h-4 mr-2" /> Create Lease
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {leases.map(lease => (
              <Card key={lease.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedLease(lease)}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[lease.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {STATUS_LABELS[lease.status] ?? lease.status}
                        </span>
                        <span className="text-xs text-gray-400 uppercase">{lease.state}</span>
                        <span className="text-xs text-gray-400">{lease.leaseTerm?.replace(/_/g, " ")}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400 shrink-0" />
                        {lease.tenantName}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Home className="w-3 h-3" /> {lease.propertyAddress}
                      </p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {formatCents(lease.monthlyRent)}/mo
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Starts {lease.leaseStartDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {lease.status === "draft" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            onClick={e => {
                              e.stopPropagation();
                              setEditLease(lease as any);
                            }}
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#1B2B5E] text-white gap-1 text-xs"
                            onClick={e => {
                              e.stopPropagation();
                              sendMutation.mutate({ leaseId: lease.id });
                            }}
                            disabled={sendMutation.isPending}
                          >
                            <Send className="w-3 h-3" /> Send
                          </Button>
                        </>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(lease.createdAt).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Lease Details Dialog */}
        {editLease && (
          <Dialog open={!!editLease} onOpenChange={() => setEditLease(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Lease Details</DialogTitle>
              </DialogHeader>
              <LeaseEditForm
                lease={editLease}
                onClose={() => { setEditLease(null); utils.leases.list.invalidate(); }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Lease Detail Dialog */}
        {selectedLease && (
          <Dialog open={!!selectedLease} onOpenChange={() => setSelectedLease(null)}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B2B5E]" />
                  Lease — {selectedLease.tenantName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[selectedLease.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABELS[selectedLease.status] ?? selectedLease.status}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {selectedLease.state} — {selectedLease.leaseTerm?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Tenant", value: selectedLease.tenantName },
                    { label: "Email", value: selectedLease.tenantEmail },
                    { label: "Property", value: selectedLease.propertyAddress },
                    { label: "Monthly Rent", value: formatCents(selectedLease.monthlyRent) },
                    { label: "Security Deposit", value: selectedLease.securityDeposit ? formatCents(selectedLease.securityDeposit) : "None" },
                    { label: "Lease Start", value: selectedLease.leaseStartDate },
                    { label: "Lease End", value: selectedLease.leaseEndDate ?? "Open-ended" },
                    { label: "Access", value: selectedLease.accessMethod?.replace(/_/g, " ") },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                {selectedLease.lockboxCode && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700 font-semibold mb-1">Lockbox Code</p>
                    <p className="text-2xl font-black text-green-800 tracking-widest">{selectedLease.lockboxCode}</p>
                  </div>
                )}

                {selectedLease.accessInstructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-semibold mb-1">Access Instructions</p>
                    <p className="text-sm text-blue-800">{selectedLease.accessInstructions}</p>
                  </div>
                )}

                {selectedLease.signedAt && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Signed</p>
                      <p className="text-xs text-green-700">{formatDate(selectedLease.signedAt)}</p>
                    </div>
                  </div>
                )}

                {selectedLease.status === "draft" && (selectedLease as any).leaseDocumentId && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setSelectedLease(null);
                      navigate(`/leases/draft/${(selectedLease as any).leaseDocumentId}`);
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Review Lease Document →
                  </Button>
                )}

                {selectedLease.status === "draft" && (
                  <Button
                    className="w-full bg-[#1B2B5E] hover:bg-[#2D3F7C] text-white gap-2"
                    onClick={() => {
                      sendMutation.mutate({ leaseId: selectedLease.id });
                      setSelectedLease({ ...selectedLease, status: "sent" });
                    }}
                    disabled={sendMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                    {sendMutation.isPending ? "Sending..." : "Send to Tenant for Signature"}
                  </Button>
                )}

                {selectedLease.status === "sent" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-blue-800">Awaiting Tenant Signature</p>
                    <p className="text-xs text-blue-600">Tenant will be prompted to sign at the link sent to their email.</p>
                  </div>
                )}

                {(selectedLease.status === "tenant_signed" || selectedLease.status === "awaiting_payment") && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Tenant Signed — Awaiting Payment</p>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Tenant has e-signed. Lease is conditional and not yet executed. We'll email you to countersign once
                          first month's rent and the security deposit clear.
                        </p>
                        <ul className="text-xs text-amber-800 mt-2 space-y-0.5">
                          <li>• First month's rent: {selectedLease.firstMonthPaid ? "✅ paid" : "⏳ pending"}</li>
                          {(selectedLease.securityDeposit ?? 0) > 0 && (
                            <li>• Security deposit: {selectedLease.depositPaid ? "✅ paid" : "⏳ pending"}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLease.status === "paid" && (
                  <Button
                    className="w-full bg-[#F5A623] hover:bg-[#00b083] text-[#3A2410] gap-2 font-bold"
                    onClick={() => {
                      landlordSignMutation.mutate({ leaseId: selectedLease.id });
                      setSelectedLease({ ...selectedLease, status: "signed" });
                    }}
                    disabled={landlordSignMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {landlordSignMutation.isPending ? "Countersigning..." : "Countersign — Execute Lease"}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
