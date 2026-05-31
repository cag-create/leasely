import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, DollarSign, Calendar, MessageSquare,
  Wrench, Camera, Receipt, Loader2,
} from "lucide-react";
import { LOGO_URL } from "@/lib/brand";

const BRAND = "#1B2B5E";
const ACCENT = "#F5A623";

const TIME_SLOTS = [
  "7am – 9am", "9am – 12pm", "12pm – 3pm", "3pm – 5pm", "5pm – 7pm",
];

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ShellCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <img src={LOGO_URL} alt="Leasely" className="h-7 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-black text-lg" style={{ color: BRAND }}>Leasely</span>
        </div>
      </header>
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${BRAND}, #0d3a2a)` }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-white">{title}</h1>
            </div>
            {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
          </div>
          <div className="p-6 space-y-5">{children}</div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Powered by <strong style={{ color: BRAND }}>Leasely</strong> — The AI-Powered Landlord OS</p>
      </div>
    </div>
  );
}

function StatusScreen({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm px-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">{icon}</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">{body}</p>
        <p className="text-sm text-gray-400 mt-6">Powered by <strong style={{ color: BRAND }}>Leasely</strong></p>
      </div>
    </div>
  );
}

export default function VendorRespond() {
  const { id } = useParams<{ id: string }>();
  const dispatchId = id ? parseInt(id) : null;

  const utils = trpc.useUtils();
  const stateQuery = (trpc as any).workOrders.getDispatchPublic.useQuery(
    { dispatchId: dispatchId ?? 0 },
    { enabled: !!dispatchId && Number.isFinite(dispatchId) },
  );

  if (!dispatchId) {
    return <StatusScreen icon={<XCircle className="w-8 h-8 text-red-500" />} title="Invalid request link" body="This URL is malformed." />;
  }

  if (stateQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (stateQuery.error || !stateQuery.data) {
    return <StatusScreen icon={<XCircle className="w-8 h-8 text-red-500" />} title="Job not found" body="The link may be outdated. Contact the landlord." />;
  }

  const { stage, dispatch, workOrder } = stateQuery.data as {
    stage: "respond" | "inspect" | "complete" | "awaiting_approval" | "paid" | "declined";
    dispatch: {
      id: number;
      vendorQuoteCents: number | null;
      proposedDate: string | null;
      proposedTimeSlot: string | null;
    };
    workOrder: { title: string; description: string | null; propertyAddress: string | null } | null;
  };

  const refetch = () => utils.workOrders.getDispatchPublic.invalidate({ dispatchId });

  if (stage === "declined") {
    return <StatusScreen icon={<XCircle className="w-8 h-8 text-gray-500" />} title="Declined" body="You've declined this job request. No further action needed." />;
  }
  if (stage === "paid") {
    return <StatusScreen icon={<CheckCircle2 className="w-8 h-8 text-green-600" />} title="Paid!" body="Payment has been released to your account. Thanks for the work." />;
  }
  if (stage === "awaiting_approval") {
    return <StatusScreen icon={<Clock className="w-8 h-8 text-amber-600" />} title="Awaiting landlord approval" body="Your completion report is in. The landlord will approve and release payment shortly." />;
  }

  if (stage === "respond") {
    return <RespondPanel dispatchId={dispatchId} workOrder={workOrder} onDone={refetch} />;
  }
  if (stage === "inspect") {
    return <InspectPanel dispatchId={dispatchId} workOrder={workOrder} initialQuoteCents={dispatch.vendorQuoteCents ?? null} onDone={refetch} />;
  }
  if (stage === "complete") {
    return <CompletePanel dispatchId={dispatchId} workOrder={workOrder} initialQuoteCents={dispatch.vendorQuoteCents ?? null} onDone={refetch} />;
  }

  return null;
}

// ─── Stage 1: respond with availability + quote ─────────────────────────────
function RespondPanel({ dispatchId, workOrder, onDone }: {
  dispatchId: number;
  workOrder: { title: string; description: string | null; propertyAddress: string | null } | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState({ proposedDate: "", proposedTimeSlot: "", quoteDollars: "", notes: "" });
  const respondMutation = trpc.workOrders.vendorRespond.useMutation({
    onSuccess: () => { toast.success("Sent — the landlord will review your quote."); onDone(); },
    onError: e => toast.error(e.message),
  });

  return (
    <ShellCard
      title={workOrder?.title ?? "Job Request"}
      subtitle={workOrder?.propertyAddress ? `Address: ${workOrder.propertyAddress}` : "Submit your availability and quote."}
    >
      {workOrder?.description && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-900">
          <p className="font-semibold mb-1">Job details</p>
          <p>{workOrder.description}</p>
        </div>
      )}

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <Calendar className="w-4 h-4" /> Available Date *
        </Label>
        <Input
          type="date"
          value={form.proposedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => setForm(f => ({ ...f, proposedDate: e.target.value }))}
          className="rounded-xl"
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <Clock className="w-4 h-4" /> Time Slot *
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map(slot => (
            <button
              key={slot}
              type="button"
              onClick={() => setForm(f => ({ ...f, proposedTimeSlot: slot }))}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                form.proposedTimeSlot === slot ? "border-transparent text-white" : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
              style={form.proposedTimeSlot === slot ? { background: ACCENT, color: "#3A2410" } : undefined}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <DollarSign className="w-4 h-4" /> Your Quote *
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
          <Input
            type="number" min="0" step="0.01" placeholder="0.00"
            value={form.quoteDollars}
            onChange={e => setForm(f => ({ ...f, quoteDollars: e.target.value }))}
            className="pl-8 rounded-xl"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Materials and labor combined.</p>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <MessageSquare className="w-4 h-4" /> Notes (optional)
        </Label>
        <Textarea
          placeholder="Any additional info — materials needed, access requirements, etc."
          rows={3}
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          className="rounded-xl resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          className="flex-1 font-bold gap-2"
          style={{ background: ACCENT, color: "#3A2410" }}
          disabled={!form.proposedDate || !form.proposedTimeSlot || !form.quoteDollars || respondMutation.isPending}
          onClick={() => {
            const cents = Math.round(parseFloat(form.quoteDollars) * 100);
            respondMutation.mutate({
              dispatchId,
              action: "accept",
              proposedDate: form.proposedDate,
              proposedTimeSlot: form.proposedTimeSlot,
              quoteCents: isNaN(cents) ? 0 : cents,
              notes: form.notes || undefined,
            });
          }}
        >
          <CheckCircle2 className="w-4 h-4" />
          {respondMutation.isPending ? "Submitting..." : "Submit Availability & Quote"}
        </Button>
        <Button
          variant="outline"
          className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => respondMutation.mutate({ dispatchId, action: "decline" })}
          disabled={respondMutation.isPending}
        >
          <XCircle className="w-4 h-4" /> Decline
        </Button>
      </div>
    </ShellCard>
  );
}

// ─── Stage 2: inspection — photos + observations ────────────────────────────
function InspectPanel({ dispatchId, workOrder, initialQuoteCents, onDone }: {
  dispatchId: number;
  workOrder: { title: string; description: string | null; propertyAddress: string | null } | null;
  initialQuoteCents: number | null;
  onDone: () => void;
}) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [revisedQuoteDollars, setRevisedQuoteDollars] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadMut = (trpc as any).workOrders.vendorUpload.useMutation();
  const submitMut = (trpc as any).workOrders.submitInspection.useMutation({
    onSuccess: () => { toast.success("Inspection submitted. The landlord has been notified."); onDone(); },
    onError: (e: any) => toast.error(e.message),
  });

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const fileData = await readFileAsBase64(f);
        const { url } = await uploadMut.mutateAsync({ dispatchId, fileName: f.name, fileType: f.type, fileData, kind: "inspection" });
        urls.push(url);
      }
      setPhotos(p => [...p, ...urls]);
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <ShellCard
      title="Inspection Report"
      subtitle={workOrder?.title ? `Job: ${workOrder.title}` : "Take photos, leave observations."}
    >
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
        Landlord approved your quote. Visit the site, document the problem with photos, and submit your observations. Adjust your quote here if needed.
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <Camera className="w-4 h-4" /> On-site photos *
        </Label>
        <Input type="file" accept="image/*" multiple onChange={onPick} disabled={uploading} className="rounded-xl" />
        {uploading && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</p>}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {photos.map(u => <img key={u} src={u} alt="" className="rounded-lg w-full aspect-square object-cover" />)}
          </div>
        )}
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <MessageSquare className="w-4 h-4" /> Observations
        </Label>
        <Textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What did you find on-site? Parts needed, complications, recommended scope." className="rounded-xl resize-none" />
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <DollarSign className="w-4 h-4" /> Revised Quote (optional)
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
          <Input
            type="number" min="0" step="0.01"
            placeholder={initialQuoteCents != null ? (initialQuoteCents / 100).toFixed(2) : "0.00"}
            value={revisedQuoteDollars}
            onChange={e => setRevisedQuoteDollars(e.target.value)}
            className="pl-8 rounded-xl"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Only fill this in if the on-site reality differs from your original quote.</p>
      </div>

      <Button
        className="w-full font-bold gap-2"
        style={{ background: ACCENT, color: "#3A2410" }}
        disabled={photos.length === 0 || submitMut.isPending || uploading}
        onClick={() => {
          const cents = revisedQuoteDollars ? Math.round(parseFloat(revisedQuoteDollars) * 100) : undefined;
          submitMut.mutate({
            dispatchId,
            photos,
            notes: notes || undefined,
            revisedQuoteCents: cents && !isNaN(cents) ? cents : undefined,
          });
        }}
      >
        <CheckCircle2 className="w-4 h-4" />
        {submitMut.isPending ? "Submitting…" : "Submit Inspection"}
      </Button>
    </ShellCard>
  );
}

// ─── Stage 3: completion — photos + invoice ─────────────────────────────────
function CompletePanel({ dispatchId, workOrder, initialQuoteCents, onDone }: {
  dispatchId: number;
  workOrder: { title: string; description: string | null; propertyAddress: string | null } | null;
  initialQuoteCents: number | null;
  onDone: () => void;
}) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [invoiceDollars, setInvoiceDollars] = useState(initialQuoteCents != null ? (initialQuoteCents / 100).toFixed(2) : "");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);

  const uploadMut = (trpc as any).workOrders.vendorUpload.useMutation();
  const submitMut = (trpc as any).workOrders.markComplete.useMutation({
    onSuccess: () => { toast.success("Marked complete. Landlord will review + release payment."); onDone(); },
    onError: (e: any) => toast.error(e.message),
  });

  async function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const fileData = await readFileAsBase64(f);
        const { url } = await uploadMut.mutateAsync({ dispatchId, fileName: f.name, fileType: f.type, fileData, kind: "completion" });
        urls.push(url);
      }
      setPhotos(p => [...p, ...urls]);
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onPickInvoice(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingInvoice(true);
    try {
      const fileData = await readFileAsBase64(f);
      const { url } = await uploadMut.mutateAsync({ dispatchId, fileName: f.name, fileType: f.type, fileData, kind: "invoice" });
      setInvoiceUrl(url);
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploadingInvoice(false);
      e.target.value = "";
    }
  }

  return (
    <ShellCard
      title="Mark Work Complete"
      subtitle={workOrder?.title ?? "Upload final photos + invoice."}
    >
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
        Upload after-photos and your invoice. The landlord reviews + approves, then payment is released to your account via Leasely.
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <Camera className="w-4 h-4" /> Completion photos *
        </Label>
        <Input type="file" accept="image/*" multiple onChange={onPickPhotos} disabled={uploading} className="rounded-xl" />
        {uploading && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</p>}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {photos.map(u => <img key={u} src={u} alt="" className="rounded-lg w-full aspect-square object-cover" />)}
          </div>
        )}
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <Receipt className="w-4 h-4" /> Invoice file *
        </Label>
        <Input type="file" accept="image/*,application/pdf" onChange={onPickInvoice} disabled={uploadingInvoice} className="rounded-xl" />
        {uploadingInvoice && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</p>}
        {invoiceUrl && (
          <a href={invoiceUrl} target="_blank" rel="noreferrer noopener" className="text-xs text-emerald-700 underline mt-1 inline-block">
            View uploaded invoice →
          </a>
        )}
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <DollarSign className="w-4 h-4" /> Final invoice amount *
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
          <Input
            type="number" min="0.01" step="0.01"
            placeholder="0.00"
            value={invoiceDollars}
            onChange={e => setInvoiceDollars(e.target.value)}
            className="pl-8 rounded-xl"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <MessageSquare className="w-4 h-4" /> Notes (optional)
        </Label>
        <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Summary of work performed, parts used, warranty info, etc." className="rounded-xl resize-none" />
      </div>

      <Button
        className="w-full font-bold gap-2"
        style={{ background: ACCENT, color: "#3A2410" }}
        disabled={photos.length === 0 || !invoiceUrl || !invoiceDollars || submitMut.isPending || uploading || uploadingInvoice}
        onClick={() => {
          const cents = Math.round(parseFloat(invoiceDollars) * 100);
          if (isNaN(cents) || cents <= 0) { toast.error("Enter a valid invoice amount."); return; }
          submitMut.mutate({
            dispatchId,
            photos,
            invoiceUrl,
            invoiceAmountCents: cents,
            notes: notes || undefined,
          });
        }}
      >
        <CheckCircle2 className="w-4 h-4" />
        {submitMut.isPending ? "Submitting…" : "Mark Work Complete"}
      </Button>
    </ShellCard>
  );
}
