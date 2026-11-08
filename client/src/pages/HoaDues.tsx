import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Building, Plus, Loader2, CheckCircle2, ExternalLink, Sparkles, FileText, Trash2,
  CalendarClock, Pencil, AlertTriangle, Upload,
} from "lucide-react";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

type Frequency = "monthly" | "quarterly" | "semiannual" | "annual";
const FREQ_LABEL: Record<Frequency, string> = { monthly: "Monthly", quarterly: "Quarterly", semiannual: "Every 6 months", annual: "Yearly" };

const fmt = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const daysUntil = (ymd: string) => Math.round((Date.parse(`${ymd}T00:00:00Z`) - Date.parse(`${today()}T00:00:00Z`)) / 86_400_000);

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Couldn't read file"));
    r.readAsDataURL(file);
  });
}

type FormState = {
  id?: number;
  crmPropertyId: string;
  hoaName: string;
  managementCompany: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  portalUrl: string;
  accountNumber: string;
  accountLast4?: string | null;
  dues: string; // dollars
  frequency: Frequency;
  nextDueDate: string;
  autopay: boolean;
  passThroughToTenant: boolean;
  reminderDaysBefore: string;
  rulesText: string;
  notes: string;
};

const emptyForm = (crmPropertyId = ""): FormState => ({
  crmPropertyId, hoaName: "", managementCompany: "", contactName: "", contactEmail: "", contactPhone: "",
  portalUrl: "", accountNumber: "", dues: "", frequency: "monthly", nextDueDate: "", autopay: false,
  passThroughToTenant: false, reminderDaysBefore: "7", rulesText: "", notes: "",
});

export default function HoaDues() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.hoa.list.useQuery();
  const refresh = () => utils.hoa.list.invalidate();

  const [form, setForm] = useState<FormState | null>(null);
  const [pendingStatement, setPendingStatement] = useState<{ url: string; name: string } | null>(null);
  const [assessFor, setAssessFor] = useState<number | null>(null);
  const [assess, setAssess] = useState({ description: "", amount: "", dueDate: "" });
  const statementInput = useRef<HTMLInputElement>(null);
  const docInput = useRef<HTMLInputElement>(null);
  const [docTarget, setDocTarget] = useState<number | null>(null);

  const upsert = trpc.hoa.upsert.useMutation();
  const uploadDoc = trpc.hoa.uploadDocument.useMutation();
  const removeDoc = trpc.hoa.removeDocument.useMutation({ onSuccess: refresh });
  const remove = trpc.hoa.remove.useMutation({ onSuccess: () => { toast.success("HOA removed"); refresh(); } });
  const markPaid = trpc.hoa.markPaid.useMutation({
    onSuccess: (r) => { toast.success(`Logged in Accounting${r.nextDueDate ? ` · next due ${r.nextDueDate}` : ""}`); refresh(); },
    onError: (e) => toast.error(e.message),
  });
  const addAssessment = trpc.hoa.addAssessment.useMutation({
    onSuccess: () => { toast.success("Special assessment added"); setAssessFor(null); setAssess({ description: "", amount: "", dueDate: "" }); refresh(); },
    onError: (e) => toast.error(e.message),
  });
  const payAssessment = trpc.hoa.markAssessmentPaid.useMutation({ onSuccess: () => { toast.success("Logged in Accounting"); refresh(); } });
  const delAssessment = trpc.hoa.removeAssessment.useMutation({ onSuccess: refresh });
  const extract = trpc.hoa.extractStatement.useMutation();

  const hoas = data?.hoas ?? [];
  const freeProperties = useMemo(() => (data?.properties ?? []).filter(p => !p.hasHoa), [data]);
  const totals = useMemo(() => ({
    annual: hoas.reduce((s, h) => s + h.annualDues, 0),
    paid: hoas.reduce((s, h) => s + h.paidThisYear, 0),
    dueSoon: hoas.filter(h => h.nextDueDate && daysUntil(h.nextDueDate) <= 14).length,
  }), [hoas]);

  const openNew = () => {
    if (!freeProperties.length) {
      toast.error(data?.properties.length ? "Every property already has an HOA." : "Add a property in Tenants / CRM first.");
      return;
    }
    setPendingStatement(null);
    setForm(emptyForm(String(freeProperties[0].id)));
  };

  const openEdit = (h: (typeof hoas)[number]) => {
    setPendingStatement(null);
    setForm({
      id: h.id, crmPropertyId: String(h.crmPropertyId), hoaName: h.hoaName, managementCompany: h.managementCompany ?? "",
      contactName: h.contactName ?? "", contactEmail: h.contactEmail ?? "", contactPhone: h.contactPhone ?? "",
      portalUrl: h.portalUrl ?? "", accountNumber: "", accountLast4: h.accountLast4, dues: (h.duesAmount / 100).toFixed(2),
      frequency: h.frequency as Frequency, nextDueDate: h.nextDueDate ?? "", autopay: h.autopay, passThroughToTenant: h.passThroughToTenant,
      reminderDaysBefore: String(h.reminderDaysBefore), rulesText: h.rulesText ?? "", notes: h.notes ?? "",
    });
  };

  const onStatement = async (file: File | undefined) => {
    if (!file || !form) return;
    try {
      const dataUrl = await readAsDataUrl(file);
      const r = await extract.mutateAsync({ filename: file.name, dataUrl });
      const f = r.fields;
      setForm(prev => prev && ({
        ...prev,
        hoaName: f.hoaName ?? prev.hoaName,
        managementCompany: f.managementCompany ?? prev.managementCompany,
        dues: f.amountDueCents != null ? (f.amountDueCents / 100).toFixed(2) : prev.dues,
        nextDueDate: f.dueDate ?? prev.nextDueDate,
        frequency: (f.frequency as Frequency | null) ?? prev.frequency,
        portalUrl: f.portalUrl ?? prev.portalUrl,
        contactPhone: f.contactPhone ?? prev.contactPhone,
        contactEmail: f.contactEmail ?? prev.contactEmail,
        accountNumber: f.accountLast4 ?? prev.accountNumber,
      }));
      setPendingStatement({ url: r.url, name: file.name });
      if (f.specialAssessment) toast.info(`Statement also shows a special assessment: ${f.specialAssessment.description}. Add it after saving.`);
      toast.success("Filled in from the statement — check the details before saving.");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't read that statement");
    }
  };

  const save = async () => {
    if (!form) return;
    const dues = Math.round(parseFloat(form.dues || "0") * 100);
    if (!form.hoaName.trim()) return toast.error("Add the HOA's name.");
    if (!Number.isFinite(dues) || dues < 0) return toast.error("Dues amount looks wrong.");
    try {
      const { id } = await upsert.mutateAsync({
        id: form.id,
        crmPropertyId: Number(form.crmPropertyId),
        hoaName: form.hoaName,
        managementCompany: form.managementCompany || null,
        contactName: form.contactName || null,
        contactEmail: form.contactEmail || null,
        contactPhone: form.contactPhone || null,
        portalUrl: form.portalUrl || null,
        ...(form.accountNumber ? { accountNumber: form.accountNumber } : {}),
        duesAmount: dues,
        frequency: form.frequency,
        nextDueDate: form.nextDueDate || null,
        autopay: form.autopay,
        passThroughToTenant: form.passThroughToTenant,
        reminderDaysBefore: Number(form.reminderDaysBefore || 7),
        rulesText: form.rulesText || null,
        notes: form.notes || null,
        // Keep the statement that prefilled the form with the HOA's documents.
        ...(pendingStatement ? { attachStatement: pendingStatement } : {}),
      });
      toast.success(form.id ? "HOA updated" : "HOA added");
      setForm(null);
      refresh();
      return id;
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't save");
    }
  };

  const onDocument = async (file: File | undefined) => {
    if (!file || !docTarget) return;
    try {
      await uploadDoc.mutateAsync({ propertyHoaId: docTarget, filename: file.name, dataUrl: await readAsDataUrl(file) });
      toast.success("Document uploaded");
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setDocTarget(null);
      if (docInput.current) docInput.current.value = "";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND }}>HOA Dues</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track HOA dues for each property, get reminded before they're due, and log payments straight to Accounting.
              Keycove doesn't pay the HOA for you — use the HOA's own portal.
            </p>
          </div>
          <Button onClick={openNew} className="gap-2 text-white" style={{ background: ACCENT }}>
            <Plus className="h-4 w-4" /> Add HOA
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border bg-white p-4"><div className="text-xs text-gray-500">Yearly dues (all properties)</div><div className="text-xl font-bold" style={{ color: BRAND }}>{fmt(totals.annual)}</div></div>
          <div className="rounded-xl border bg-white p-4"><div className="text-xs text-gray-500">Paid in {data?.year ?? new Date().getFullYear()}</div><div className="text-xl font-bold" style={{ color: BRAND }}>{fmt(totals.paid)}</div></div>
          <div className="rounded-xl border bg-white p-4"><div className="text-xs text-gray-500">Due in the next 14 days</div><div className="text-xl font-bold" style={{ color: totals.dueSoon ? "#b45309" : BRAND }}>{totals.dueSoon}</div></div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : hoas.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
            <Building className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-800">No HOAs yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Add the HOA for any property that has one. Got a statement? Upload it and we'll fill in the details.
            </p>
            {data?.properties.length ? (
              <Button onClick={openNew} className="gap-2 text-white" style={{ background: ACCENT }}><Plus className="h-4 w-4" /> Add your first HOA</Button>
            ) : (
              <Link href="/crm"><Button variant="outline">Add a property first</Button></Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {hoas.map(h => {
              const d = h.nextDueDate ? daysUntil(h.nextDueDate) : null;
              const dueTone = d == null ? "text-gray-500" : d < 0 ? "text-red-600" : d <= 7 ? "text-amber-600" : "text-gray-700";
              return (
                <div key={h.id} className="rounded-2xl border bg-white p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-gray-900">{h.hoaName}</div>
                      <div className="text-sm text-gray-500">{h.propertyAddress}</div>
                      {h.managementCompany && <div className="text-xs text-gray-400">Managed by {h.managementCompany}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: BRAND }}>{fmt(h.duesAmount)} <span className="text-xs font-medium text-gray-500">{FREQ_LABEL[h.frequency as Frequency].toLowerCase()}</span></div>
                      <div className={`text-sm font-medium flex items-center gap-1 justify-end ${dueTone}`}>
                        <CalendarClock className="h-3.5 w-3.5" />
                        {h.nextDueDate ? (d! < 0 ? `Overdue since ${h.nextDueDate}` : d === 0 ? "Due today" : `Due ${h.nextDueDate} (${d} days)`) : "No due date set"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {h.autopay && <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">Autopay</span>}
                    {h.passThroughToTenant && <span className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">Tenant reimburses</span>}
                    {h.accountLast4 && <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">Acct ••{h.accountLast4}</span>}
                    <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">Paid this year: {fmt(h.paidThisYear)}</span>
                    <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">Reminder {h.reminderDaysBefore} days before</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="gap-1.5 text-white" style={{ background: ACCENT }} disabled={markPaid.isPending || !h.duesAmount}
                      onClick={() => markPaid.mutate({ id: h.id })}>
                      <CheckCircle2 className="h-4 w-4" /> Mark paid
                    </Button>
                    {h.portalUrl && /^https?:\/\//i.test(h.portalUrl) && (
                      <a href={h.portalUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1.5"><ExternalLink className="h-4 w-4" /> HOA portal</Button>
                      </a>
                    )}
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(h)}><Pencil className="h-4 w-4" /> Edit</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAssessFor(h.id)}><AlertTriangle className="h-4 w-4" /> Special assessment</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setDocTarget(h.id); docInput.current?.click(); }}>
                      <Upload className="h-4 w-4" /> Upload document
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-red-600" onClick={() => { if (confirm(`Remove ${h.hoaName}? Accounting entries stay.`)) remove.mutate({ id: h.id }); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {h.assessments.length > 0 && (
                    <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-3 space-y-1.5">
                      <div className="text-xs font-semibold text-amber-800">Special assessments</div>
                      {h.assessments.map(a => (
                        <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="text-gray-800">{a.description} · {fmt(a.amount)} · due {a.dueDate}</span>
                          {a.paidAt ? (
                            <span className="text-xs text-emerald-700">Paid {a.paidAt}</span>
                          ) : (
                            <span className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-7" onClick={() => payAssessment.mutate({ id: a.id })}>Mark paid</Button>
                              <Button size="sm" variant="ghost" className="h-7 text-red-600" onClick={() => delAssessment.mutate({ id: a.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {(h.documents.length > 0 || h.rulesText) && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {h.documents.length > 0 && (
                        <div className="rounded-xl border p-3">
                          <div className="text-xs font-semibold text-gray-600 mb-1.5">Documents (CC&amp;Rs, rules, statements)</div>
                          {h.documents.map(doc => (
                            <div key={doc.url} className="flex items-center justify-between gap-2 text-sm">
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate" style={{ color: ACCENT }}>
                                <FileText className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{doc.name}</span>
                              </a>
                              <button className="text-gray-400 hover:text-red-600" onClick={() => removeDoc.mutate({ propertyHoaId: h.id, url: doc.url })}><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      {h.rulesText && (
                        <div className="rounded-xl border p-3">
                          <div className="text-xs font-semibold text-gray-600 mb-1.5">HOA rules (summary)</div>
                          <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-6">{h.rulesText}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <input ref={docInput} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={e => onDocument(e.target.files?.[0])} />
      </div>

      {/* Add / edit HOA */}
      <Dialog open={!!form} onOpenChange={o => { if (!o) setForm(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form?.id ? "Edit HOA" : "Add HOA"}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-4">
              {!form.id && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-indigo-900 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Have a statement? Upload it and AI fills in the form.</div>
                  <Button size="sm" variant="outline" disabled={extract.isPending} onClick={() => statementInput.current?.click()} className="gap-1.5">
                    {extract.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload statement
                  </Button>
                  <input ref={statementInput} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={e => onStatement(e.target.files?.[0])} />
                  {pendingStatement && <div className="w-full text-xs text-indigo-800">Read from {pendingStatement.name}. Double-check every field.</div>}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label>Property</Label>
                  <select
                    className="mt-1 w-full h-9 rounded-md border px-2 text-sm bg-white"
                    value={form.crmPropertyId}
                    disabled={!!form.id}
                    onChange={e => setForm({ ...form, crmPropertyId: e.target.value })}
                  >
                    {(form.id ? data?.properties ?? [] : freeProperties).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div><Label>HOA name *</Label><Input className="mt-1" value={form.hoaName} onChange={e => setForm({ ...form, hoaName: e.target.value })} /></div>
                <div><Label>Management company</Label><Input className="mt-1" value={form.managementCompany} onChange={e => setForm({ ...form, managementCompany: e.target.value })} /></div>
                <div><Label>Dues amount ($) *</Label><Input className="mt-1" inputMode="decimal" value={form.dues} onChange={e => setForm({ ...form, dues: e.target.value })} /></div>
                <div>
                  <Label>How often</Label>
                  <select className="mt-1 w-full h-9 rounded-md border px-2 text-sm bg-white" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as Frequency })}>
                    {Object.entries(FREQ_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div><Label>Next due date</Label><Input className="mt-1" type="date" value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} /></div>
                <div><Label>Remind me (days before)</Label><Input className="mt-1" inputMode="numeric" value={form.reminderDaysBefore} onChange={e => setForm({ ...form, reminderDaysBefore: e.target.value.replace(/\D/g, "") })} /></div>
                <div className="sm:col-span-2"><Label>HOA payment portal URL</Label><Input className="mt-1" placeholder="https://" value={form.portalUrl} onChange={e => setForm({ ...form, portalUrl: e.target.value })} /></div>
                <div><Label>Contact name</Label><Input className="mt-1" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} /></div>
                <div><Label>Contact phone</Label><Input className="mt-1" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} /></div>
                <div><Label>Contact email</Label><Input className="mt-1" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} /></div>
                <div>
                  <Label>Account number</Label>
                  <Input className="mt-1" placeholder={form.accountLast4 ? `••${form.accountLast4} (enter to replace)` : "Only the last 4 digits are kept"} value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.autopay} onCheckedChange={v => setForm({ ...form, autopay: v })} /> Autopay is set up with the HOA</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.passThroughToTenant} onCheckedChange={v => setForm({ ...form, passThroughToTenant: v })} /> Tenant reimburses these dues</label>
              </div>

              <div><Label>HOA rules summary</Label><Textarea className="mt-1" rows={3} placeholder="Parking, pets, trash days, quiet hours, rental restrictions…" value={form.rulesText} onChange={e => setForm({ ...form, rulesText: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending} className="text-white" style={{ background: ACCENT }}>
              {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Special assessment */}
      <Dialog open={assessFor != null} onOpenChange={o => { if (!o) setAssessFor(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add special assessment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>What it's for</Label><Input className="mt-1" placeholder="Roof replacement" value={assess.description} onChange={e => setAssess({ ...assess, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount ($)</Label><Input className="mt-1" inputMode="decimal" value={assess.amount} onChange={e => setAssess({ ...assess, amount: e.target.value })} /></div>
              <div><Label>Due date</Label><Input className="mt-1" type="date" value={assess.dueDate} onChange={e => setAssess({ ...assess, dueDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssessFor(null)}>Cancel</Button>
            <Button className="text-white" style={{ background: ACCENT }} disabled={addAssessment.isPending}
              onClick={() => {
                const amount = Math.round(parseFloat(assess.amount || "0") * 100);
                if (!assess.description.trim() || !amount || !assess.dueDate) return toast.error("Fill in all three fields.");
                addAssessment.mutate({ propertyHoaId: assessFor!, description: assess.description, amount, dueDate: assess.dueDate });
              }}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
