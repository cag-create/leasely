import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileSignature, Upload, Loader2, CheckCircle2, Copy, FileText, X } from "lucide-react";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment (unit)" },
  { value: "co_living", label: "Co-living (room)" },
  { value: "single_family", label: "Single-family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-family" },
];

const toCents = (s: string) => {
  const n = parseFloat(String(s).replace(/[$,\s]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
};

type Props = { trigger?: React.ReactNode };

/**
 * Pro-side "send a tenant the lease to sign" flow. Fills terms (or attaches
 * the landlord's own uploaded PDF), fires crm.sendLeaseToSign which emails the
 * tenant a private /sign/:token link. On sign the crm property/tenant/lease go
 * active and the portal is live. No AI.
 */
export default function SendLeaseToSignDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [doc, setDoc] = useState<{ url: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState({
    tenantName: "", tenantEmail: "", propertyType: "apartment",
    address: "", unit: "", city: "", state: "", zip: "",
    rent: "", deposit: "", start: "", end: "", lateFee: "50", grace: "5",
  });
  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const send = trpc.crm.sendLeaseToSign.useMutation();

  function reset() {
    setF({ tenantName: "", tenantEmail: "", propertyType: "apartment", address: "", unit: "", city: "", state: "", zip: "", rent: "", deposit: "", start: "", end: "", lateFee: "50", grace: "5" });
    setDoc(null); setSentUrl(null);
  }

  async function onFile(file: File) {
    setUploading(true);
    try {
      const dataUrl: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const resp = await fetch("/api/upload-lease", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Upload failed");
      setDoc({ url: data.url, name: data.filename || file.name });
      toast.success("Lease attached — the tenant will review it before signing.");
    } catch (e: any) {
      toast.error(e?.message || "Couldn't upload that file (PDF, DOC, DOCX up to 25 MB).");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!f.tenantName.trim() || !f.tenantEmail.trim()) { toast.error("Tenant name and email are required."); return; }
    if (!f.address.trim()) { toast.error("Property address is required."); return; }
    if (toCents(f.rent) <= 0) { toast.error("Enter the monthly rent."); return; }
    if (!f.start) { toast.error("Enter the lease start date."); return; }
    try {
      const res = await send.mutateAsync({
        tenantName: f.tenantName.trim(),
        tenantEmail: f.tenantEmail.trim(),
        propertyType: f.propertyType,
        address: f.address.trim(),
        unit: f.unit.trim() || undefined,
        city: f.city.trim() || undefined,
        state: f.state.trim() || undefined,
        zip: f.zip.trim() || undefined,
        monthlyRentCents: toCents(f.rent),
        securityDepositCents: f.deposit ? toCents(f.deposit) : undefined,
        leaseStartDate: f.start,
        leaseEndDate: f.end || undefined,
        lateFeeCents: f.lateFee ? toCents(f.lateFee) : undefined,
        lateFeeGraceDays: f.grace ? parseInt(f.grace) : undefined,
        documentUrl: doc?.url,
      });
      setSentUrl(res.signUrl);
      toast.success(`Lease sent to ${res.email}`);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't send the lease.");
    }
  }

  const isRoom = f.propertyType === "co_living";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5" style={{ background: "#4F46E5", color: "#fff" }}>
            <FileSignature className="w-4 h-4" /> Send lease to sign
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Send a lease to sign</DialogTitle></DialogHeader>

        {sentUrl ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-semibold text-gray-900">Lease emailed to {f.tenantEmail}</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">When they sign, their unit + portal go live automatically. You can also send this link yourself by text or email:</p>
            <div className="flex items-center gap-2 p-2 rounded-lg border bg-gray-50">
              <input readOnly value={sentUrl} className="flex-1 bg-transparent text-xs text-gray-600 outline-none" />
              <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => { navigator.clipboard.writeText(sentUrl); toast.success("Link copied"); }}>
                <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Done</Button>
              <Button className="flex-1" style={{ background: "#4F46E5", color: "#fff" }} onClick={reset}>Send another</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tenant name"><Input value={f.tenantName} onChange={e => set("tenantName")(e.target.value)} placeholder="Jasmine Reed" /></Field>
              <Field label="Tenant email"><Input type="email" value={f.tenantEmail} onChange={e => set("tenantEmail")(e.target.value)} placeholder="jasmine@example.com" /></Field>
            </div>

            <Field label="Property type">
              <Select value={f.propertyType} onValueChange={set("propertyType")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><Field label="Address"><Input value={f.address} onChange={e => set("address")(e.target.value)} placeholder="812 Maple Ave" /></Field></div>
              <Field label={isRoom ? "Room #" : "Unit #"}><Input value={f.unit} onChange={e => set("unit")(e.target.value)} placeholder={isRoom ? "3" : "4B"} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City"><Input value={f.city} onChange={e => set("city")(e.target.value)} placeholder="Charlotte" /></Field>
              <Field label="State"><Input value={f.state} onChange={e => set("state")(e.target.value)} placeholder="NC" /></Field>
              <Field label="ZIP"><Input value={f.zip} onChange={e => set("zip")(e.target.value)} placeholder="28203" /></Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Monthly rent ($)"><Input value={f.rent} onChange={e => set("rent")(e.target.value)} placeholder="1450" /></Field>
              <Field label="Security deposit ($)"><Input value={f.deposit} onChange={e => set("deposit")(e.target.value)} placeholder="1450" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lease start"><Input type="date" value={f.start} onChange={e => set("start")(e.target.value)} /></Field>
              <Field label="Lease end (blank = month-to-month)"><Input type="date" value={f.end} onChange={e => set("end")(e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Late fee ($)"><Input value={f.lateFee} onChange={e => set("lateFee")(e.target.value)} placeholder="50" /></Field>
              <Field label="Grace (days)"><Input value={f.grace} onChange={e => set("grace")(e.target.value)} placeholder="5" /></Field>
            </div>

            {/* Optional uploaded lease */}
            <div>
              <Label className="text-xs text-gray-500">Your lease document (optional)</Label>
              {doc ? (
                <div className="flex items-center gap-2 mt-1 p-2 rounded-lg border bg-gray-50 text-sm">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="flex-1 truncate text-gray-700">{doc.name}</span>
                  <button onClick={() => setDoc(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="mt-1 w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed text-sm text-gray-500 hover:bg-gray-50">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Attach your own lease (PDF/DOC) — else a standard agreement is used</>}
                </button>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" hidden onChange={e => { const file = e.target.files?.[0]; if (file) onFile(file); }} />
            </div>

            <DialogFooter className="pt-2">
              <Button onClick={submit} disabled={send.isPending} className="w-full gap-2" style={{ background: "#4F46E5", color: "#fff" }}>
                {send.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><FileSignature className="w-4 h-4" /> Email the lease to sign</>}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
