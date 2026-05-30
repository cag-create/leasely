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
  Home, DollarSign, Calendar, Key, ChevronRight, Users, Pencil, Trash2
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
    // template variable fields (not in lease_agreements row — start blank)
    landlordName: "",
    landlordCompany: "",
    landlordAddress: "",
    occupants: "",
    rentDueDay: "",
    lateFee: "",
    utilities: "",
    petsAllowed: "",
    parking: "",
    paymentMethods: "",
  });

  const fillFieldsMut = (trpc as any).leaseDocs.fillFields.useMutation({
    onError: (e: any) => toast.error(e.message ?? "Failed to save lease fields"),
  });

  const updateMutation = trpc.leases.updateDraft.useMutation({
    onSuccess: (data: any) => {
      // After core fields saved, save any template variable fields that were entered.
      const extraVars: Record<string, string> = {};
      if (form.landlordName.trim()) extraVars.landlord_name = form.landlordName.trim();
      if (form.landlordCompany.trim()) extraVars.landlord_company = form.landlordCompany.trim();
      if (form.landlordAddress.trim()) extraVars.landlord_address = form.landlordAddress.trim();
      if (form.occupants.trim()) extraVars.occupants = form.occupants.trim();
      if (form.rentDueDay.trim()) extraVars.rent_due_day = form.rentDueDay.trim();
      if (form.lateFee.trim()) extraVars.late_fee = form.lateFee.trim();
      if (form.utilities.trim()) extraVars.utilities = form.utilities.trim();
      if (form.petsAllowed.trim()) extraVars.pets_allowed = form.petsAllowed.trim();
      if (form.parking.trim()) extraVars.parking = form.parking.trim();
      if (form.paymentMethods.trim()) extraVars.payment_methods = form.paymentMethods.trim();

      const docId = data?.leaseDocumentId ?? lease.leaseDocumentId;
      if (Object.keys(extraVars).length > 0 && docId) {
        fillFieldsMut.mutate({ id: docId, variables: extraVars }, {
          onSuccess: () => { toast.success("Lease updated"); onClose(); },
        });
      } else {
        toast.success("Lease updated");
        onClose();
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const isSaving = updateMutation.isPending || fillFieldsMut.isPending;

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

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Lease Document Fields</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Landlord Name on Lease</Label>
              <Input placeholder="e.g. Jane Smith" value={form.landlordName} onChange={e => setForm(f => ({ ...f, landlordName: e.target.value }))} />
            </div>
            <div>
              <Label>Company / DBA</Label>
              <Input placeholder="e.g. Redrock Property Group LLC" value={form.landlordCompany} onChange={e => setForm(f => ({ ...f, landlordCompany: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Landlord / Company Address</Label>
            <Input placeholder="e.g. 123 Main St, Memphis, TN 38115" value={form.landlordAddress} onChange={e => setForm(f => ({ ...f, landlordAddress: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Rent Due Day</Label>
              <Input placeholder="e.g. 1st" value={form.rentDueDay} onChange={e => setForm(f => ({ ...f, rentDueDay: e.target.value }))} />
            </div>
            <div>
              <Label>Late Fee</Label>
              <Input placeholder="e.g. $150.00" value={form.lateFee} onChange={e => setForm(f => ({ ...f, lateFee: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Authorized Occupants</Label>
            <Input placeholder="e.g. 2 adults" value={form.occupants} onChange={e => setForm(f => ({ ...f, occupants: e.target.value }))} />
          </div>
          <div>
            <Label>Utilities</Label>
            <Input placeholder="e.g. Tenant pays all utilities" value={form.utilities} onChange={e => setForm(f => ({ ...f, utilities: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pets Allowed</Label>
              <Input placeholder="e.g. No pets allowed" value={form.petsAllowed} onChange={e => setForm(f => ({ ...f, petsAllowed: e.target.value }))} />
            </div>
            <div>
              <Label>Parking</Label>
              <Input placeholder="e.g. 1 assigned space" value={form.parking} onChange={e => setForm(f => ({ ...f, parking: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Accepted Payment Methods</Label>
            <Input placeholder="e.g. Leasely tenant portal, ACH / direct deposit, Check, Money order" value={form.paymentMethods} onChange={e => setForm(f => ({ ...f, paymentMethods: e.target.value }))} />
          </div>
        </div>
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
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save & Re-render Lease"}
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
  const [statusFilter, setStatusFilter] = useState<"draft" | "active" | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: leases, refetch } = trpc.leases.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  // Arrears summary — drives the red banner at the top of the page.
  const { data: arrears } = (trpc as any).leases.arrearsByLandlord.useQuery(undefined, {
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

  // Resend the signing/payment reminder email. Server only allows this when
  // the tenant action is still pending (sent / tenant_signed / awaiting_payment).
  const resendMutation = (trpc as any).leases.resend.useMutation({
    onSuccess: () => {
      toast.success("Reminder email re-sent to the tenant");
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Countersign dialog state — captures the landlord's typed legal name as a
  // legally binding electronic signature before flipping status to "signed".
  const [countersignFor, setCountersignFor] = useState<any | null>(null);
  const [countersignName, setCountersignName] = useState("");

  // Edit-tenant-info dialog state — landlords can retarget the tenant email
  // or fix a typo at any stage of the lease lifecycle.
  const [editTenantFor, setEditTenantFor] = useState<any | null>(null);
  const [editTenantName, setEditTenantName] = useState("");
  const [editTenantEmail, setEditTenantEmail] = useState("");

  // Reset-to-draft dialog state — destructive escape hatch when a lease ended
  // up "signed" without an actual signature, or needs to be re-sent to a
  // different person.
  const [resetFor, setResetFor] = useState<any | null>(null);
  const [resetReason, setResetReason] = useState("");

  const resetMutation = (trpc as any).leases.resetToDraft.useMutation({
    onSuccess: () => {
      toast.success("Lease reset to draft — re-send when ready");
      refetch();
      setResetFor(null);
      setSelectedLease(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Hard delete — wipes the lease + dependent rows. Pro members only.
  const [deleteFor, setDeleteFor] = useState<any | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const deleteMutation = (trpc as any).leases.delete.useMutation({
    onSuccess: () => {
      toast.success("Lease permanently deleted");
      refetch();
      setDeleteFor(null);
      setDeleteConfirmText("");
      setSelectedLease(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const editTenantMutation = trpc.leases.update.useMutation({
    onSuccess: () => {
      toast.success("Tenant info updated");
      refetch();
      setEditTenantFor(null);
    },
    onError: (e) => toast.error(e.message),
  });

  // Off-platform payment fallback. Leasely-rails (Stripe) is the default —
  // this is here only so a landlord who took Zelle/Venmo/check/cash can keep
  // the lease moving without manual DB surgery.
  const confirmPaymentMutation = (trpc as any).leases.confirmPaymentReceived.useMutation({
    onSuccess: (data: any) => {
      if (data.status === "paid") {
        toast.success("Payment confirmed — lease is ready for your countersignature");
      } else {
        toast.success("Payment recorded");
      }
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });
  const [payMethod, setPayMethod] = useState<string>("Leasely");

  const duplicateMutation = (trpc as any).leases.duplicate.useMutation({
    onSuccess: (data: any) => {
      toast.success("Lease duplicated — fill in the new tenant + dates");
      refetch();
      setSelectedLease(null);
      if (data?.id) navigate(`/leases?edit=${data.id}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const generateDocMutation = trpc.leases.updateDraft.useMutation({
    onSuccess: (data, variables) => {
      refetch();
      if (data.leaseDocumentId) {
        setSelectedLease(null);
        navigate(`/leases/draft/${data.leaseDocumentId}`);
      } else {
        toast.error("No state template available — draft manually via the wizard");
      }
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

  const displayed = !leases ? [] : statusFilter === "draft"
    ? leases.filter(l => l.status === "draft")
    : statusFilter === "active"
    ? leases.filter(l => l.status === "signed" || l.status === "active")
    : leases;

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

        {/* Stats / Filter Tabs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === null ? "border-[#1B2B5E] bg-[#1B2B5E]/5 ring-2 ring-[#1B2B5E]" : "border-gray-200"}`}
            onClick={() => setStatusFilter(null)}
          >
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-500" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-sm text-gray-500">All Leases</div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "draft" ? "border-blue-500 bg-blue-100 ring-2 ring-blue-500" : "border-blue-200 bg-blue-50"}`}
            onClick={() => setStatusFilter(f => f === "draft" ? null : "draft")}
          >
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-800">{draft}</div>
                <div className="text-sm text-blue-700">Drafts</div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "active" ? "border-green-500 bg-green-100 ring-2 ring-green-500" : "border-green-200 bg-green-50"}`}
            onClick={() => setStatusFilter(f => f === "active" ? null : "active")}
          >
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-800">{active}</div>
                <div className="text-sm text-green-700">Signed / Active</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arrears alert — only renders when there are tenants behind. */}
        {Array.isArray(arrears) && arrears.length > 0 && (
          <Card className="border-red-300 bg-red-50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-900">
                    {arrears.length} tenant{arrears.length === 1 ? "" : "s"} behind on rent —{" "}
                    ${(arrears.reduce((a: number, t: any) => a + t.amountOwedCents, 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })} outstanding
                  </p>
                  <ul className="text-sm text-red-800 mt-2 space-y-1">
                    {arrears.map((t: any) => (
                      <li key={t.leaseId} className="flex flex-wrap justify-between gap-2">
                        <span><strong>{t.tenantName}</strong> · {t.propertyAddress}</span>
                        <span className="font-mono">
                          {t.monthsBehind} mo · ${(t.amountOwedCents / 100).toLocaleString("en-US")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active filter label */}
        {statusFilter && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <span className="font-medium">
              Showing: {statusFilter === "draft" ? "Drafts only" : "Signed / Active only"}
            </span>
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setStatusFilter(null)}
            >
              Show all →
            </button>
          </div>
        )}

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
        ) : displayed.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500">No leases match this filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayed.map(lease => (
              <Card
                key={lease.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (lease.status === "draft") {
                    if ((lease as any).leaseDocumentId) {
                      navigate(`/leases/draft/${(lease as any).leaseDocumentId}`);
                    } else {
                      setEditLease(lease as any);
                    }
                  } else {
                    setSelectedLease(lease);
                  }
                }}
              >
                <CardContent className="py-4 px-5">
                  {/* Stack vertically on mobile, side-by-side on sm+ */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
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
                        <Home className="w-3 h-3 shrink-0" /> <span className="truncate">{lease.propertyAddress}</span>
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {formatCents(lease.monthlyRent)}/mo
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Starts {lease.leaseStartDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:ml-4 sm:shrink-0">
                      {lease.status === "draft" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs flex-1 sm:flex-none"
                            onClick={e => {
                              e.stopPropagation();
                              setEditLease(lease as any);
                            }}
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                          {(lease as any).leaseDocumentId ? (
                            <Button
                              size="sm"
                              className="bg-[#1B2B5E] text-white gap-1 text-xs flex-1 sm:flex-none"
                              onClick={e => {
                                e.stopPropagation();
                                navigate(`/leases/draft/${(lease as any).leaseDocumentId}`);
                              }}
                            >
                              <FileText className="w-3 h-3" /> Review & Send →
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-[#1B2B5E] text-white gap-1 text-xs flex-1 sm:flex-none"
                              onClick={e => {
                                e.stopPropagation();
                                sendMutation.mutate({ leaseId: lease.id });
                              }}
                              disabled={sendMutation.isPending}
                            >
                              <Send className="w-3 h-3" /> Send
                            </Button>
                          )}
                        </>
                      )}
                      {["sent", "tenant_signed", "awaiting_payment"].includes(lease.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs flex-1 sm:flex-none border-amber-400 text-amber-700 hover:bg-amber-50"
                          onClick={e => {
                            e.stopPropagation();
                            resendMutation.mutate({ leaseId: lease.id });
                          }}
                          disabled={resendMutation.isPending}
                          title={lease.status === "sent" ? "Re-send the signing email" : "Re-send the payment reminder"}
                        >
                          <Send className="w-3 h-3" /> Resend
                        </Button>
                      )}
                      {lease.status !== "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs flex-1 sm:flex-none"
                          onClick={e => { e.stopPropagation(); setSelectedLease(lease); }}
                        >
                          <ChevronRight className="w-3 h-3" /> Details
                        </Button>
                      )}
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {new Date(lease.createdAt).toLocaleDateString()}
                      </span>
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

                {/* Signature block — shows both parties' typed-name signatures
                    with date. A red warning surfaces if status is "signed" but
                    a signature artifact is missing (legacy data from before
                    typed-name capture was required). */}
                {(selectedLease.tenantSignedAt || selectedLease.landlordSignedAt || ["signed", "active"].includes(selectedLease.status)) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signatures</p>

                    {/* Tenant */}
                    <div className="border-b border-gray-100 pb-3">
                      <p className="text-xs text-gray-500 mb-0.5">Tenant</p>
                      {selectedLease.tenantSignedAt ? (
                        <>
                          <p className="font-serif italic text-lg text-gray-900">
                            {(selectedLease as any).tenantSignatureName || <span className="text-amber-700 not-italic font-sans text-sm">(typed name not captured — pre-Nov 2026 signature)</span>}
                          </p>
                          <p className="text-xs text-gray-500">Signed {formatDate(selectedLease.tenantSignedAt)}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Not yet signed</p>
                      )}
                    </div>

                    {/* Landlord */}
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Landlord</p>
                      {selectedLease.landlordSignedAt ? (
                        <>
                          <p className="font-serif italic text-lg text-gray-900">
                            {(selectedLease as any).landlordSignatureName || <span className="text-amber-700 not-italic font-sans text-sm">(typed name not captured — pre-Nov 2026 signature)</span>}
                          </p>
                          <p className="text-xs text-gray-500">Countersigned {formatDate(selectedLease.landlordSignedAt)}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Not yet countersigned</p>
                      )}
                    </div>

                    {/* Integrity warning — status says "fully executed" but
                        signatures aren't both on file, OR signatures exist
                        but were captured by the legacy (pre-typed-name)
                        flow so there's no real artifact on the document. */}
                    {["signed", "active"].includes(selectedLease.status) &&
                      (!selectedLease.tenantSignedAt || !selectedLease.landlordSignedAt) && (
                      <div className="mt-2 rounded-md bg-red-50 border border-red-200 p-2.5 text-xs text-red-800">
                        <strong>Signature mismatch:</strong> Status shows fully executed but a signature timestamp is missing.
                      </div>
                    )}
                    {["signed", "active"].includes(selectedLease.status) &&
                      selectedLease.tenantSignedAt && selectedLease.landlordSignedAt &&
                      (!(selectedLease as any).tenantSignatureName || !(selectedLease as any).landlordSignatureName) && (
                      <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900">
                        <strong>Legacy signature:</strong> This lease was signed before typed-name capture was required, so there's no visible signature on the document. Reset to draft and re-sign to get a real artifact.
                      </div>
                    )}
                  </div>
                )}

                {/* Tenant info + admin actions — always available so a landlord
                    can retarget the email or unwind a lease that's in a bad
                    state. */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs flex-1 sm:flex-none"
                    onClick={() => {
                      setEditTenantName(selectedLease.tenantName ?? "");
                      setEditTenantEmail(selectedLease.tenantEmail ?? "");
                      setEditTenantFor(selectedLease);
                    }}
                  >
                    <Pencil className="w-3 h-3" /> Edit tenant name / email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs flex-1 sm:flex-none border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setResetReason("");
                      setResetFor(selectedLease);
                    }}
                  >
                    <Trash2 className="w-3 h-3" /> Reset to draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs flex-1 sm:flex-none border-red-500 bg-red-50 text-red-800 hover:bg-red-100"
                    onClick={() => setDeleteFor(selectedLease)}
                  >
                    <Trash2 className="w-3 h-3" /> Delete lease
                  </Button>
                </div>

                {/* Review the lease document at any stage after draft. The
                    /leases/draft/<id> route renders the document for any
                    status — read-only once sent/signed. */}
                {selectedLease.status !== "draft" && (selectedLease as any).leaseDocumentId && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setSelectedLease(null);
                      navigate(`/leases/draft/${(selectedLease as any).leaseDocumentId}`);
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Review Lease Document
                  </Button>
                )}

                {/* Duplicate — clones the property/terms into a new draft so
                    the landlord can quickly re-rent the unit to a new tenant. */}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => duplicateMutation.mutate({ leaseId: selectedLease.id })}
                  disabled={duplicateMutation.isPending}
                >
                  <FileText className="w-4 h-4" />
                  {duplicateMutation.isPending ? "Duplicating..." : "Duplicate as new draft"}
                </Button>

                {selectedLease.status === "draft" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        if ((selectedLease as any).leaseDocumentId) {
                          setSelectedLease(null);
                          navigate(`/leases/draft/${(selectedLease as any).leaseDocumentId}`);
                        } else {
                          generateDocMutation.mutate({ leaseId: selectedLease.id });
                        }
                      }}
                      disabled={generateDocMutation.isPending}
                    >
                      <FileText className="w-4 h-4" />
                      {generateDocMutation.isPending ? "Generating..." : "Review Lease →"}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setSelectedLease(null);
                        setEditLease(selectedLease);
                      }}
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </Button>
                  </div>
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
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900">Awaiting Payment</p>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Leasely auto-collects via Stripe + emails you when payment clears. If the tenant paid you
                          directly via Zelle, Venmo, Cash App, ACH, check, money order, or cash, confirm receipt below
                          to unlock countersignature.
                        </p>
                        <ul className="text-xs text-amber-800 mt-2 space-y-0.5">
                          <li>• First month's rent: {selectedLease.firstMonthPaid ? "✅ paid" : "⏳ pending"}</li>
                          {(selectedLease.securityDeposit ?? 0) > 0 && (
                            <li>• Security deposit: {selectedLease.depositPaid ? "✅ paid" : "⏳ pending"}</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {(!selectedLease.firstMonthPaid || ((selectedLease.securityDeposit ?? 0) > 0 && !selectedLease.depositPaid)) && (
                      <div className="border-t border-amber-200 pt-3 space-y-2">
                        <Label className="text-xs font-semibold text-amber-900">Confirm off-platform payment</Label>
                        <select
                          className="w-full text-xs border border-amber-300 rounded px-2 py-1.5 bg-white"
                          value={payMethod}
                          onChange={(e) => setPayMethod(e.target.value)}
                        >
                          <option value="Leasely">Leasely platform</option>
                          <option value="ACH / direct deposit">ACH / direct deposit</option>
                          <option value="Zelle">Zelle</option>
                          <option value="Venmo">Venmo</option>
                          <option value="Cash App">Cash App</option>
                          <option value="Check">Check</option>
                          <option value="Money order">Money order</option>
                          <option value="Cash">Cash</option>
                        </select>
                        <div className="grid grid-cols-3 gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                            disabled={selectedLease.firstMonthPaid === 1 || confirmPaymentMutation.isPending}
                            onClick={() => confirmPaymentMutation.mutate({ leaseId: selectedLease.id, kind: "rent", method: payMethod })}
                          >
                            Rent received
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                            disabled={(selectedLease.securityDeposit ?? 0) === 0 || selectedLease.depositPaid === 1 || confirmPaymentMutation.isPending}
                            onClick={() => confirmPaymentMutation.mutate({ leaseId: selectedLease.id, kind: "deposit", method: payMethod })}
                          >
                            Deposit received
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={confirmPaymentMutation.isPending}
                            onClick={() => confirmPaymentMutation.mutate({ leaseId: selectedLease.id, kind: "both", method: payMethod })}
                          >
                            Both received
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedLease.status === "paid" && (
                  <Button
                    className="w-full bg-[#F5A623] hover:bg-[#00b083] text-[#3A2410] gap-2 font-bold"
                    onClick={() => {
                      setCountersignName("");
                      setCountersignFor(selectedLease);
                    }}
                    disabled={landlordSignMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Countersign — Execute Lease
                  </Button>
                )}

                {/* Monthly rent ledger — shows for any lease that's reached
                    paid/signed/active so the landlord can see autopay history
                    and record off-platform payments. */}
                {["paid", "signed", "active"].includes(selectedLease.status) && (
                  <RentLedgerPanel lease={selectedLease} />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit tenant info dialog — retarget email / fix typo. Works on any
            lease status. Server-side `update` validates the email format. */}
        {editTenantFor && (
          <Dialog open={!!editTenantFor} onOpenChange={() => setEditTenantFor(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit tenant name / email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
                  Changing the email here updates where the signing & payment links go.
                  If the lease has already been sent, use <strong>Resend</strong> on the lease
                  card afterward to deliver to the new address.
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5">Tenant Name *</Label>
                  <Input
                    value={editTenantName}
                    onChange={e => setEditTenantName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5">Tenant Email *</Label>
                  <Input
                    type="email"
                    value={editTenantEmail}
                    onChange={e => setEditTenantEmail(e.target.value)}
                    placeholder="tenant@email.com"
                    autoComplete="off"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditTenantFor(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#1B2B5E] text-white"
                    disabled={
                      editTenantMutation.isPending
                      || editTenantName.trim().length < 2
                      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editTenantEmail.trim())
                    }
                    onClick={() => {
                      editTenantMutation.mutate({
                        leaseId: editTenantFor.id,
                        tenantName: editTenantName.trim(),
                        tenantEmail: editTenantEmail.trim(),
                      });
                    }}
                  >
                    {editTenantMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Reset-to-draft dialog — destructive escape hatch. Clears every
            signature timestamp + payment flag and returns status to "draft".
            Stripe customer/subscription IDs are intentionally preserved on
            the row so a tenant who already authorised autopay isn't
            double-charged on resend; if you're sending to a NEW tenant,
            duplicate the lease instead. */}
        {resetFor && (
          <Dialog open={!!resetFor} onOpenChange={() => setResetFor(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-700">Reset lease to draft?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-900">
                  <p className="font-semibold mb-1">This clears:</p>
                  <ul className="list-disc ml-5 text-xs space-y-0.5">
                    <li>Tenant + landlord signatures and timestamps</li>
                    <li>First-month and security-deposit payment flags</li>
                    <li>Status — returns to <strong>Draft</strong></li>
                  </ul>
                  <p className="text-xs mt-2">An audit line is appended to the lease notes. The lease itself is not deleted; you can re-send when ready.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5">Reason (optional, saved to notes)</Label>
                  <Input
                    value={resetReason}
                    onChange={e => setResetReason(e.target.value)}
                    placeholder="e.g. Wrong tenant email — retargeting"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setResetFor(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={resetMutation.isPending}
                    onClick={() => {
                      resetMutation.mutate({
                        leaseId: resetFor.id,
                        reason: resetReason.trim() || undefined,
                      });
                    }}
                  >
                    {resetMutation.isPending ? "Resetting..." : "Yes, reset to draft"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Hard-delete dialog — permanently removes the lease + all dependent
            rows (documents, payments, audit log). Requires typing DELETE to
            confirm. Pro-only on the server. */}
        {deleteFor && (
          <Dialog open={!!deleteFor} onOpenChange={() => { setDeleteFor(null); setDeleteConfirmText(""); }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-700">Permanently delete lease?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="rounded-md bg-red-50 border border-red-300 p-3 text-sm text-red-900">
                  <p className="font-semibold mb-1">This will permanently delete:</p>
                  <ul className="list-disc ml-5 text-xs space-y-0.5">
                    <li>The lease agreement record</li>
                    <li>The rendered lease document</li>
                    <li>All recorded rent payments for this lease</li>
                    <li>All audit log entries</li>
                  </ul>
                  <p className="text-xs mt-2 font-semibold">This action cannot be undone.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5">Type DELETE to confirm</Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setDeleteFor(null); setDeleteConfirmText(""); }}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white"
                    disabled={deleteMutation.isPending || deleteConfirmText.trim() !== "DELETE"}
                    onClick={() => deleteMutation.mutate({ leaseId: deleteFor.id })}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Yes, delete permanently"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Countersign dialog — landlord types their full legal name as a
            legally binding electronic signature before status flips to
            "signed". Stored in landlordSignatureName so the document and
            dashboard can render a real artifact, not just a status flag. */}
        {countersignFor && (
          <Dialog open={!!countersignFor} onOpenChange={() => setCountersignFor(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Countersign — Execute Lease</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                  <p className="font-semibold mb-1">{countersignFor.propertyAddress}</p>
                  <p className="text-xs">Tenant <strong>{countersignFor.tenantName}</strong> has signed and paid. Type your full legal name below to countersign and execute the lease.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5">Your Full Legal Name *</Label>
                  <Input
                    type="text"
                    autoFocus
                    placeholder="e.g. Chad Glover"
                    value={countersignName}
                    onChange={e => setCountersignName(e.target.value)}
                    className="rounded-xl font-serif italic text-lg"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">This typed name is your legally binding electronic signature and will appear on the executed lease.</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCountersignFor(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#F5A623] hover:bg-[#e5961c] text-[#3A2410] font-bold gap-2"
                    disabled={countersignName.trim().length < 2 || landlordSignMutation.isPending}
                    onClick={async () => {
                      try {
                        await landlordSignMutation.mutateAsync({
                          leaseId: countersignFor.id,
                          signatureName: countersignName.trim(),
                        });
                        setCountersignFor(null);
                        setSelectedLease(null);
                      } catch {/* toast handled in onError */}
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {landlordSignMutation.isPending ? "Countersigning..." : "Sign & Execute"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

const STATUS_PILL: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  late: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
  skipped: "bg-gray-100 text-gray-600",
  partial: "bg-orange-100 text-orange-800",
};

function fmtPeriod(period: string) {
  const [y, m] = period.split("-");
  if (!y || !m) return period;
  const d = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, 1));
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function RentLedgerPanel({ lease }: { lease: any }) {
  const utils = trpc.useContext();
  const { data: payments, isLoading } = (trpc as any).leases.listRentPayments.useQuery(
    { leaseId: lease.id },
    { retry: false }
  );

  const [showRecord, setShowRecord] = useState(false);
  const [periodMonth, setPeriodMonth] = useState(currentPeriod());
  const [amount, setAmount] = useState((lease.monthlyRent / 100).toString());
  const [method, setMethod] = useState("Zelle");
  const [note, setNote] = useState("");

  const recordMutation = (trpc as any).leases.recordRentPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment recorded");
      setShowRecord(false);
      setNote("");
      (utils as any).leases.listRentPayments.invalidate({ leaseId: lease.id });
      (utils as any).leases.arrearsByLandlord.invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Compute arrears for THIS lease for the inline banner
  const paidPeriods = new Set(
    (payments ?? []).filter((p: any) => p.status === "paid").map((p: any) => p.periodMonth)
  );
  let monthsBehind = 0;
  if (lease.leaseStartDate) {
    const start = new Date(`${lease.leaseStartDate}T12:00:00Z`);
    if (!Number.isNaN(start.getTime())) {
      const today = new Date();
      const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
      const cutoff = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      while (cur.getTime() <= cutoff.getTime()) {
        const p = `${cur.getUTCFullYear()}-${String(cur.getUTCMonth() + 1).padStart(2, "0")}-01`;
        if (!paidPeriods.has(p)) monthsBehind += 1;
        cur.setUTCMonth(cur.getUTCMonth() + 1);
      }
    }
  }
  const amountOwed = monthsBehind * lease.monthlyRent;

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#1B2B5E]" />
          <h4 className="font-semibold text-gray-900 text-sm">Rent Ledger</h4>
          {lease.autopayEnabled === 1 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">AUTOPAY</span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={() => setShowRecord(s => !s)}
        >
          <Plus className="w-3 h-3 mr-1" /> Record payment
        </Button>
      </div>

      {monthsBehind > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-900">
          <strong>{monthsBehind} month{monthsBehind === 1 ? "" : "s"} behind</strong> · ${(amountOwed / 100).toLocaleString("en-US")} outstanding
        </div>
      )}

      {showRecord && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Period (YYYY-MM-01)</Label>
              <Input
                value={periodMonth}
                onChange={e => setPeriodMonth(e.target.value)}
                placeholder="2026-05-01"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Amount ($)</Label>
              <Input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Method</Label>
            <select
              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white"
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value="Leasely">Leasely platform</option>
              <option value="ACH / direct deposit">ACH / direct deposit</option>
              <option value="Zelle">Zelle</option>
              <option value="Venmo">Venmo</option>
              <option value="Cash App">Cash App</option>
              <option value="Check">Check</option>
              <option value="Money order">Money order</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">Note (optional)</Label>
            <Input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. confirmation #12345"
              className="h-8 text-sm"
            />
          </div>
          <Button
            size="sm"
            className="w-full bg-[#1B2B5E] hover:bg-[#2D3F7C] text-white text-xs h-8"
            disabled={recordMutation.isPending || !/^\d{4}-\d{2}-01$/.test(periodMonth) || !parseFloat(amount)}
            onClick={() => recordMutation.mutate({
              leaseId: lease.id,
              periodMonth,
              amountCents: Math.round(parseFloat(amount) * 100),
              method,
              note: note || undefined,
            })}
          >
            {recordMutation.isPending ? "Saving..." : "Save payment"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-gray-500">Loading ledger…</p>
      ) : !payments || payments.length === 0 ? (
        <p className="text-xs text-gray-500">No payments recorded yet.</p>
      ) : (
        <div className="max-h-48 overflow-y-auto -mx-1 px-1">
          <table className="w-full text-xs">
            <thead className="text-gray-500">
              <tr className="border-b border-gray-100">
                <th className="text-left py-1 font-medium">Period</th>
                <th className="text-left py-1 font-medium">Status</th>
                <th className="text-right py-1 font-medium">Amount</th>
                <th className="text-right py-1 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-1.5 font-mono">{fmtPeriod(p.periodMonth)}</td>
                  <td className="py-1.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_PILL[p.status] ?? "bg-gray-100"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-1.5 text-right font-mono">${((p.paidAmountCents ?? p.amountCents) / 100).toLocaleString("en-US")}</td>
                  <td className="py-1.5 text-right text-gray-500">{p.paymentMethod ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
