import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Download, ShieldCheck, ShieldAlert, DollarSign, AlertCircle, Plus, Users, CheckCircle2,
} from "lucide-react";

const ACCENT = "#4F46E5";
const money = (c?: number) => `$${((c ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const CLASS_LABELS: Record<string, string> = {
  individual: "Individual", sole_proprietor: "Sole proprietor", c_corp: "C-Corp", s_corp: "S-Corp",
  partnership: "Partnership", trust: "Trust/estate", llc: "LLC", other: "Other",
};

export default function Contractor1099() {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
  const utils = trpc.useUtils();

  const { data: rows = [], isLoading } = trpc.vendors.tax1099Summary.useQuery({ year });

  const [w9For, setW9For] = useState<any | null>(null);
  const [payFor, setPayFor] = useState<any | null>(null);

  const stats = useMemo(() => {
    const required = rows.filter(r => r.requires1099);
    return {
      contractors: rows.length,
      required: required.length,
      missingW9: required.filter(r => !r.hasW9).length,
      totalPaid: rows.reduce((s, r) => s + r.totalPaidCents, 0),
    };
  }, [rows]);

  function exportCsv() {
    const required = rows.filter(r => r.requires1099);
    if (!required.length) { toast.error("No contractors crossed the $600 threshold for " + year + "."); return; }
    const headers = ["Legal name", "Business name", "Tax classification", "TIN type", "TIN last 4", "Address", "City", "State", "ZIP", "Total paid " + year, "W-9 on file"];
    const lines = required.map(r => [
      r.legalName || r.name, r.businessName || "", CLASS_LABELS[r.taxClassification || ""] || "",
      (r.tinType || "").toUpperCase(), r.tinLast4 || "", r.w9Address || "", r.w9City || "", r.w9State || "", r.w9Zip || "",
      (r.totalPaidCents / 100).toFixed(2), r.hasW9 ? "Yes" : "No",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `1099-NEC-contractors-${year}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${required.length} contractor(s) for ${year}`);
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8" style={{ color: ACCENT }} /> Contractor 1099s
            </h1>
            <p className="text-gray-500 mt-1 max-w-2xl">
              Anyone you pay <b>$600+</b> in a year needs a 1099-NEC. Collect their W-9, track what you paid,
              and export a filing-ready summary for your accountant or an e-file service.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={exportCsv} className="gap-1.5" style={{ background: ACCENT, color: "#fff" }}>
              <Download className="w-4 h-4" /> Export 1099s
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat icon={<Users className="w-5 h-5 text-gray-500" />} label="Contractors" value={stats.contractors} />
          <Stat icon={<AlertCircle className="w-5 h-5 text-amber-600" />} label="Need a 1099" value={stats.required} amber />
          <Stat icon={<ShieldAlert className="w-5 h-5 text-red-500" />} label="Missing W-9" value={stats.missingW9} red={stats.missingW9 > 0} />
          <Stat icon={<DollarSign className="w-5 h-5 text-emerald-600" />} label={`Paid in ${year}`} value={money(stats.totalPaid)} />
        </div>

        {/* Table */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_130px_110px] gap-3 px-4 py-2.5 bg-gray-50 border-b text-xs font-semibold text-gray-500">
            <div>Contractor</div><div className="text-right">Paid {year}</div><div>Status</div><div className="text-right">Actions</div>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No contractors yet. Add vendors from Work Orders, then log what you pay them here.</p>
            </div>
          ) : rows.map(r => (
            <div key={r.vendorId} className="grid grid-cols-[1fr_120px_130px_110px] gap-3 px-4 py-3 border-b last:border-0 items-center">
              <div>
                <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                <div className="text-xs text-gray-400">{r.trade || "—"}{r.legalName && r.legalName !== r.name ? ` · ${r.legalName}` : ""}</div>
              </div>
              <div className="text-right font-bold text-gray-900 text-sm tabular-nums">{money(r.totalPaidCents)}</div>
              <div>
                {r.requires1099 ? (
                  r.hasW9 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"><ShieldCheck className="w-3.5 h-3.5" /> Ready to file</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full"><ShieldAlert className="w-3.5 h-3.5" /> W-9 needed</span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Under $600</span>
                )}
              </div>
              <div className="flex justify-end gap-1.5">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setPayFor(r)}><Plus className="w-3 h-3 mr-0.5" />Payment</Button>
                <Button size="sm" variant={r.hasW9 ? "outline" : "default"} className="h-7 px-2 text-xs" style={r.hasW9 ? {} : { background: ACCENT, color: "#fff" }} onClick={() => setW9For(r)}>
                  {r.hasW9 ? "Edit W-9" : "Add W-9"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Leasely computes totals and prepares the data — it doesn't e-file with the IRS. Export the CSV and file
          through your accountant or a service like Tax1099 / Track1099. The $600 threshold is for 1099-NEC
          (nonemployee compensation); corporations are generally exempt but the totals are still shown.
        </p>
      </div>

      {w9For && <W9Dialog vendor={w9For} onClose={() => setW9For(null)} onSaved={() => { setW9For(null); utils.vendors.tax1099Summary.invalidate(); }} />}
      {payFor && <PaymentDialog vendor={payFor} year={year} onClose={() => setPayFor(null)} onSaved={() => { setPayFor(null); utils.vendors.tax1099Summary.invalidate(); }} />}
    </DashboardLayout>
  );
}

function Stat({ icon, label, value, amber, red }: { icon: React.ReactNode; label: string; value: React.ReactNode; amber?: boolean; red?: boolean }) {
  return (
    <div className="bg-white border rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">{icon}{label}</div>
      <div className={`text-2xl font-bold mt-1 ${red ? "text-red-600" : amber ? "text-amber-700" : "text-gray-900"}`}>{value}</div>
    </div>
  );
}

function W9Dialog({ vendor, onClose, onSaved }: { vendor: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    legalName: vendor.legalName || vendor.name || "", businessName: vendor.businessName || "",
    taxClassification: vendor.taxClassification || "individual", tinType: vendor.tinType || "ssn", tin: "",
    w9Address: vendor.w9Address || "", w9City: vendor.w9City || "", w9State: vendor.w9State || "", w9Zip: vendor.w9Zip || "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const save = trpc.vendors.saveW9.useMutation();
  async function submit() {
    if (!f.legalName.trim()) return toast.error("Legal name is required.");
    if (f.tin.replace(/\D/g, "").length < 4) return toast.error("Enter their SSN or EIN.");
    if (!f.w9Address || !f.w9City || f.w9State.length !== 2 || !f.w9Zip) return toast.error("Complete the address (2-letter state).");
    try {
      await save.mutateAsync({ id: vendor.vendorId, ...f, businessName: f.businessName || undefined } as any);
      toast.success("W-9 saved");
      onSaved();
    } catch (e: any) { toast.error(e?.message || "Couldn't save"); }
  }
  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>W-9 — {vendor.name}</DialogTitle></DialogHeader>
        <p className="text-xs text-gray-500 -mt-2 mb-1">From their signed W-9. Only the last 4 of the TIN is shown after saving.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Legal name (as on tax return)"><Input value={f.legalName} onChange={e => set("legalName")(e.target.value)} /></Field>
          <Field label="Business name (if different)"><Input value={f.businessName} onChange={e => set("businessName")(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tax classification">
            <Select value={f.taxClassification} onValueChange={set("taxClassification")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(CLASS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="TIN type">
            <Select value={f.tinType} onValueChange={set("tinType")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ssn">SSN</SelectItem><SelectItem value="ein">EIN</SelectItem></SelectContent>
            </Select>
          </Field>
        </div>
        <Field label={`${f.tinType.toUpperCase()} (stored securely, last 4 shown)`}>
          <Input value={f.tin} onChange={e => set("tin")(e.target.value)} placeholder={vendor.tinLast4 ? `•••••${vendor.tinLast4}` : (f.tinType === "ssn" ? "123-45-6789" : "12-3456789")} />
        </Field>
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <Field label="Address"><Input value={f.w9Address} onChange={e => set("w9Address")(e.target.value)} /></Field>
          <Field label="City"><Input value={f.w9City} onChange={e => set("w9City")(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="State"><Input value={f.w9State} maxLength={2} onChange={e => set("w9State")(e.target.value.toUpperCase())} placeholder="NC" /></Field>
          <Field label="ZIP"><Input value={f.w9Zip} onChange={e => set("w9Zip")(e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={save.isPending} className="w-full gap-2" style={{ background: ACCENT, color: "#fff" }}>
            <CheckCircle2 className="w-4 h-4" /> {save.isPending ? "Saving…" : "Save W-9"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({ vendor, year, onClose, onSaved }: { vendor: any; year: number; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(`${year}-01-01`);
  const [desc, setDesc] = useState("");
  const create = trpc.accounting.create.useMutation();
  async function submit() {
    const cents = Math.round(parseFloat(amount.replace(/[$,\s]/g, "")) * 100);
    if (!cents || cents <= 0) return toast.error("Enter the amount paid.");
    try {
      await create.mutateAsync({ type: "expense", category: "repairs", amount: cents, date, description: desc || `Paid ${vendor.name}`, vendorId: vendor.vendorId } as any);
      toast.success(`Logged ${vendor.name} payment`);
      onSaved();
    } catch (e: any) { toast.error(e?.message || "Couldn't log payment"); }
  }
  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Log payment — {vendor.name}</DialogTitle></DialogHeader>
        <p className="text-xs text-gray-500 -mt-2">Records a repairs expense tagged to this contractor. Counts toward their 1099 total and your Schedule E.</p>
        <Field label="Amount ($)"><Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="850.00" /></Field>
        <Field label="Date paid"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
        <Field label="Note (optional)"><Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Unit 4B water heater" /></Field>
        <DialogFooter>
          <Button onClick={submit} disabled={create.isPending} className="w-full" style={{ background: ACCENT, color: "#fff" }}>
            {create.isPending ? "Saving…" : "Log payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-1"><Label className="text-xs text-gray-500">{label}</Label><div className="mt-1">{children}</div></div>;
}
