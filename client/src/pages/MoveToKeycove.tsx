import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import Papa from "papaparse";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Download, FileSpreadsheet, Link2, Loader2, Sparkles, Upload, AlertTriangle, Rocket,
} from "lucide-react";
import {
  TARGET_FIELDS, autoMap, buildRow, inferColumnType, validateRow, type ImportRow, type TargetField,
} from "@shared/moveIn";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";
const BATCH = 500;

// Export steps per source (kept from the old importers, plus vacant-unit tips).
const SOURCES = [
  { id: "appfolio", name: "AppFolio", logo: "AF", color: "#2563EB", steps: ["Sign in to AppFolio", "Reports → Rent Roll (or Unit Directory for vacant units too)", "Run the report, then Export → CSV or Excel", "Upload the file here — we map AppFolio's column names automatically"] },
  { id: "buildium", name: "Buildium", logo: "Bu", color: "#7C3AED", steps: ["Sign in to Buildium", "Reports → Rent Roll (includes vacant units)", "Export → Excel or CSV", "Upload it here"] },
  { id: "rentredi", name: "RentRedi", logo: "RR", color: "#16A34A", steps: ["Sign in to RentRedi", "Open Tenants, click the export (down-arrow) icon", "Choose CSV", "Upload it here"] },
  { id: "avail", name: "Avail", logo: "Av", color: "#0EA5E9", steps: ["Sign in to Avail", "Open Tenants (left sidebar)", "Click ⋯ → Export tenants list", "Upload the CSV here"] },
  { id: "rentec", name: "Rentec Direct", logo: "RD", color: "#D97706", steps: ["Sign in to Rentec Direct", "Tenants tab → Export → CSV", "For vacant units, also export Properties → Export → CSV", "Upload each file here (re-running is safe — no duplicates)"] },
  { id: "zillow", name: "Zillow Rental Manager", logo: "Z", color: "#006AFF", steps: ["Go to zillow.com/rental-manager and sign in", "My Properties → select properties → Actions → Export CSV", "Upload it here"] },
  { id: "spreadsheet", name: "Spreadsheet / Google Sheets", logo: "XLS", color: "#475569", steps: ["Download our template (or use your own columns)", "One row per unit — leave tenant columns blank for vacant units", "Upload the CSV/Excel file, or paste a Google Sheets link"] },
] as const;

const TEMPLATE_HEADERS = ["building", "address", "unit", "city", "state", "zip", "type", "tenant_first_name", "tenant_last_name", "tenant_email", "tenant_phone", "monthly_rent", "security_deposit", "lease_start", "lease_end", "late_fee", "grace_days", "hoa_name", "hoa_dues", "hoa_frequency", "hoa_due_date"];
const TEMPLATE_ROWS = [
  ["Maple Court", "812 Maple Ave", "4B", "Charlotte", "NC", "28203", "apartment", "Jasmine", "Reed", "jasmine.reed@example.com", "704-555-0142", "1450", "1450", "2025-06-01", "2026-05-31", "50", "5", "", "", "", ""],
  ["Maple Court", "812 Maple Ave", "4C", "Charlotte", "NC", "28203", "apartment", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "19 Lakeview Ct", "", "Memphis", "TN", "38115", "townhouse", "Omar", "Diaz", "omar@example.com", "901-555-0199", "1650", "1650", "2026-01-01", "", "", "", "Lakeview HOA", "180", "monthly", "2026-12-01"],
];

type Step = 1 | 2 | 3 | 4 | 5;
type Built = { row: ImportRow; errors: string[] };
type Result = { propertiesCreated: number; propertiesUpdated: number; tenantsCreated: number; tenantsUpdated: number; leasesCreated: number; leasesExisting: number; rentCollectionSetUp: number; hoasSaved: number; errors: { row: number; message: string }[] };

const mappingKey = (source: string) => `keycove.moveIn.mapping.${source}`;
function loadSavedMapping(source: string): Record<string, TargetField | ""> {
  try { return JSON.parse(localStorage.getItem(mappingKey(source)) ?? "{}"); } catch { return {}; }
}
function saveMapping(source: string, m: Record<string, TargetField | "">) {
  try { localStorage.setItem(mappingKey(source), JSON.stringify(m)); } catch { /* private mode */ }
}

function downloadTemplate() {
  const csv = Papa.unparse({ fields: TEMPLATE_HEADERS, data: TEMPLATE_ROWS });
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = "keycove-import-template.csv"; a.click();
  URL.revokeObjectURL(url);
}

const money = (c?: number) => (c == null ? "" : (c / 100).toFixed(2));

export default function MoveToKeycove() {
  const [step, setStep] = useState<Step>(1);
  const [source, setSource] = useState<string>("spreadsheet");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, TargetField | "">>({});
  const [aiMapped, setAiMapped] = useState<Set<string>>(new Set());
  const [built, setBuilt] = useState<Built[]>([]);
  const [rentCollection, setRentCollection] = useState(true);
  const [sheetUrl, setSheetUrl] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchSheet = trpc.moveIn.fetchGoogleSheet.useMutation();
  const suggest = trpc.moveIn.suggestMapping.useMutation();
  const importRows = trpc.moveIn.importRows.useMutation();
  const sourceInfo = SOURCES.find(s => s.id === source)!;

  /** Load a parsed sheet, then auto-map: saved mapping → aliases → AI for the rest. */
  const loadTable = async (hdrs: string[], rows: Record<string, string>[]) => {
    const cleanHeaders = hdrs.map(h => String(h ?? "").trim()).filter(Boolean);
    const cleanRows = rows.filter(r => Object.values(r).some(v => String(v ?? "").trim()));
    if (!cleanHeaders.length || !cleanRows.length) { toast.error("No rows found — the first row should be column headers."); return; }
    const saved = loadSavedMapping(source);
    const auto = autoMap(cleanHeaders);
    const m: Record<string, TargetField | ""> = {};
    for (const h of cleanHeaders) m[h] = (saved[h] !== undefined ? saved[h] : auto[h]) ?? "";
    setHeaders(cleanHeaders);
    setRawRows(cleanRows);
    setMapping(m);
    setAiMapped(new Set());
    setStep(3);
    const unknown = cleanHeaders.filter(h => !m[h]);
    if (unknown.length) {
      try {
        const columns = unknown.map(h => ({ header: h, type: inferColumnType(cleanRows.slice(0, 20).map(r => r[h])) }));
        const { suggestions } = await suggest.mutateAsync({ source: sourceInfo.name, columns, taken: Object.values(m).filter(Boolean) as string[] });
        const picked = Object.entries(suggestions).filter(([, f]) => f);
        if (picked.length) {
          setMapping(prev => {
            const next = { ...prev };
            const used = new Set(Object.values(next).filter(Boolean));
            for (const [h, f] of picked) if (!next[h] && !used.has(f)) { next[h] = f; used.add(f); }
            return next;
          });
          setAiMapped(new Set(picked.map(([h]) => h)));
          toast.success(`AI suggested ${picked.length} column match${picked.length === 1 ? "" : "es"} — check them below.`);
        }
      } catch { /* AI is optional */ }
    }
  };

  const parseCsvText = (text: string) => {
    const res = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: "greedy", transformHeader: h => h.trim() });
    if (res.errors.length && !res.data.length) { toast.error(`Couldn't read that CSV: ${res.errors[0].message}`); return; }
    void loadTable(res.meta.fields ?? [], res.data);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".xlsx")) {
        const { default: readXlsxFile } = await import("read-excel-file");
        const rows = await readXlsxFile(file);
        const hdrs = (rows[0] ?? []).map(c => String(c ?? "").trim());
        const data = rows.slice(1).map(r => Object.fromEntries(hdrs.map((h, i) => {
          const v = r[i];
          return [h, v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? "")];
        })));
        await loadTable(hdrs, data);
      } else if (name.endsWith(".xls")) {
        toast.error("Old .xls files aren't supported — save as .xlsx or CSV and try again.");
      } else {
        parseCsvText(await file.text());
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't read that file");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSheet = async () => {
    try {
      const { csv } = await fetchSheet.mutateAsync({ url: sheetUrl });
      parseCsvText(csv);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't open that sheet");
    }
  };

  const toReview = () => {
    if (!Object.values(mapping).includes("address")) { toast.error("Map a column to “Street address” — it's the only required field."); return; }
    saveMapping(source, mapping);
    setBuilt(rawRows.map(r => buildRow(r, mapping)));
    setOnlyErrors(false);
    setStep(4);
  };

  const editRow = (index: number, patch: Partial<ImportRow>) => {
    setBuilt(prev => prev.map((b, i) => {
      if (i !== index) return b;
      const row = { ...b.row, ...patch };
      return { row, errors: validateRow(row) };
    }));
  };

  const valid = built.filter(b => !b.errors.length);
  const invalid = built.length - valid.length;
  const counts = useMemo(() => ({
    units: valid.length,
    tenants: valid.filter(b => b.row.tenantFirstName).length,
    vacant: valid.filter(b => !b.row.tenantFirstName).length,
    hoas: valid.filter(b => b.row.hoaName).length,
  }), [valid]);

  const runImport = async () => {
    const rows = valid.map(b => b.row);
    if (!rows.length) return;
    setStep(5);
    setProgress({ done: 0, total: rows.length });
    const total: Result = { propertiesCreated: 0, propertiesUpdated: 0, tenantsCreated: 0, tenantsUpdated: 0, leasesCreated: 0, leasesExisting: 0, rentCollectionSetUp: 0, hoasSaved: 0, errors: [] };
    try {
      for (let i = 0; i < rows.length; i += BATCH) {
        const r = await importRows.mutateAsync({ source: sourceInfo.name, setUpRentCollection: rentCollection, rows: rows.slice(i, i + BATCH) });
        (Object.keys(total) as (keyof Result)[]).forEach(k => {
          if (k === "errors") total.errors.push(...r.errors.map(e => ({ ...e, row: e.row + i })));
          else (total as any)[k] += (r as any)[k];
        });
        setProgress({ done: Math.min(rows.length, i + BATCH), total: rows.length });
      }
      setResult(total);
    } catch (e: any) {
      toast.error(e?.message ?? "Import failed");
      setResult(total);
    }
  };

  const fieldOptions = TARGET_FIELDS;
  const usedFields = new Set(Object.values(mapping).filter(Boolean));
  const shown = built.map((b, i) => ({ ...b, i })).filter(b => !onlyErrors || b.errors.length);

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: BRAND }}>Move to Keycove</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bring your properties, units, tenants, leases and HOA details over in one pass. Vacant units are fine, and re-running the same file won't create duplicates.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {["Source", "Upload", "Match columns", "Review", "Import"].map((label, i) => (
            <span key={label} className={`rounded-full px-3 py-1 ${step === i + 1 ? "text-white" : step > i + 1 ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`} style={step === i + 1 ? { background: ACCENT } : undefined}>
              {i + 1}. {label}
            </span>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">Where are you moving from?</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SOURCES.map(s => (
                <button key={s.id} onClick={() => setSource(s.id)}
                  className={`text-left rounded-xl border p-4 transition-colors ${source === s.id ? "border-[#4F46E5] bg-indigo-50/50" : "bg-white hover:border-gray-300"}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: s.color }}>{s.logo}</span>
                    <span className="font-semibold text-gray-900 text-sm">{s.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm font-semibold text-gray-800 mb-2">How to export from {sourceInfo.name}</p>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600">{sourceInfo.steps.map(s => <li key={s}>{s}</li>)}</ol>
            </div>
            <div className="flex justify-end"><Button onClick={() => setStep(2)} className="gap-2 text-white" style={{ background: ACCENT }}>Next <ArrowRight className="h-4 w-4" /></Button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border-2 border-dashed bg-white p-8 text-center cursor-pointer hover:border-[#4F46E5]"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); void onFile(e.dataTransfer.files?.[0]); }}>
                <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="font-semibold text-gray-800">Drop a CSV or Excel (.xlsx) file</p>
                <p className="text-xs text-gray-500 mt-1">or click to choose one</p>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={e => void onFile(e.target.files?.[0])} />
              </div>
              <div className="rounded-2xl border bg-white p-6 space-y-3">
                <p className="font-semibold text-gray-800 flex items-center gap-2"><Link2 className="h-4 w-4" /> Google Sheets link</p>
                <p className="text-xs text-gray-500">Set sharing to “Anyone with the link can view”, then paste the link.</p>
                <Input placeholder="https://docs.google.com/spreadsheets/d/…" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} />
                <Button variant="outline" disabled={!sheetUrl.trim() || fetchSheet.isPending} onClick={onSheet} className="gap-2">
                  {fetchSheet.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Load sheet
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
              <Button variant="outline" onClick={downloadTemplate} className="gap-2"><Download className="h-4 w-4" /> Download template</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-white overflow-hidden">
              <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">Match your columns ({rawRows.length} rows)</p>
                {suggest.isPending && <span className="text-xs text-indigo-700 flex items-center gap-1"><Loader2 className="h-3.5 w-3.5 animate-spin" /> AI is matching unknown columns…</span>}
              </div>
              <div className="divide-y">
                {headers.map(h => (
                  <div key={h} className="grid sm:grid-cols-3 gap-2 items-center px-4 py-2">
                    <div className="text-sm font-medium text-gray-800 truncate">{h}</div>
                    <div className="text-xs text-gray-400 truncate">e.g. {rawRows.find(r => String(r[h] ?? "").trim())?.[h] ?? "—"}</div>
                    <div className="flex items-center gap-2">
                      <select className="w-full h-9 rounded-md border px-2 text-sm bg-white" value={mapping[h] ?? ""}
                        onChange={e => { setMapping({ ...mapping, [h]: e.target.value as TargetField | "" }); setAiMapped(prev => { const n = new Set(prev); n.delete(h); return n; }); }}>
                        <option value="">— Don't import —</option>
                        {(["Property", "Tenant", "Lease", "HOA"] as const).map(g => (
                          <optgroup key={g} label={g}>
                            {fieldOptions.filter(f => f.group === g).map(f => (
                              <option key={f.key} value={f.key} disabled={usedFields.has(f.key) && mapping[h] !== f.key}>{f.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {aiMapped.has(h) && <span title="Suggested by AI"><Sparkles className="h-4 w-4 text-indigo-500 shrink-0" /></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">Only the column names and a value type (date, money, email…) are sent to the AI — never your tenants' data. Your choices are saved for the next {sourceInfo.name} import.</p>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
              <Button onClick={toReview} className="gap-2 text-white" style={{ background: ACCENT }}>Review rows <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[["Ready", valid.length], ["Need fixing", invalid], ["With tenants", counts.tenants], ["Vacant", counts.vacant], ["With HOA", counts.hoas]].map(([l, v]) => (
                <div key={l as string} className="rounded-xl border bg-white p-3">
                  <div className="text-xs text-gray-500">{l}</div>
                  <div className="text-lg font-bold" style={{ color: l === "Need fixing" && v ? "#b45309" : BRAND }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm"><Switch checked={onlyErrors} onCheckedChange={setOnlyErrors} /> Show only rows that need fixing</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={rentCollection} onCheckedChange={setRentCollection} /> Set up online rent collection for tenants with an email + state</label>
            </div>
            <div className="rounded-xl border bg-white overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>{["#", "Address", "Unit", "State", "Tenant", "Email", "Rent $", "Lease start", "HOA", "Status"].map(h => <th key={h} className="px-2 py-2 text-left font-semibold whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {shown.slice(0, 300).map(({ row, errors, i }) => (
                    <tr key={i} className={`border-t ${errors.length ? "bg-amber-50/60" : ""}`}>
                      <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                      <td className="px-2 py-1"><Input className="h-8 min-w-[180px]" value={row.address} onChange={e => editRow(i, { address: e.target.value })} /></td>
                      <td className="px-2 py-1"><Input className="h-8 w-20" value={row.unit ?? ""} onChange={e => editRow(i, { unit: e.target.value || undefined })} /></td>
                      <td className="px-2 py-1"><Input className="h-8 w-16" value={row.state ?? ""} onChange={e => editRow(i, { state: e.target.value.toUpperCase() || undefined })} /></td>
                      <td className="px-2 py-1"><Input className="h-8 min-w-[130px]" value={[row.tenantFirstName, row.tenantLastName].filter(Boolean).join(" ")} placeholder="Vacant"
                        onChange={e => { const [f, ...rest] = e.target.value.split(" "); editRow(i, { tenantFirstName: f || undefined, tenantLastName: rest.join(" ") || undefined }); }} /></td>
                      <td className="px-2 py-1"><Input className="h-8 min-w-[170px]" value={row.tenantEmail ?? ""} onChange={e => editRow(i, { tenantEmail: e.target.value.trim().toLowerCase() || undefined })} /></td>
                      <td className="px-2 py-1"><Input className="h-8 w-24" inputMode="decimal" value={money(row.monthlyRentCents)}
                        onChange={e => { const n = parseFloat(e.target.value); editRow(i, { monthlyRentCents: Number.isFinite(n) ? Math.round(n * 100) : undefined }); }} /></td>
                      <td className="px-2 py-1"><Input className="h-8 w-36" type="date" value={row.leaseStart ?? ""} onChange={e => editRow(i, { leaseStart: e.target.value || undefined })} /></td>
                      <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">{row.hoaName ?? ""}</td>
                      <td className="px-2 py-1.5 text-xs">
                        {errors.length ? <span className="text-amber-700 flex items-start gap-1"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{errors.join("; ")}</span>
                          : <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{row.tenantFirstName ? "Ready" : "Vacant unit"}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shown.length > 300 && <p className="px-3 py-2 text-xs text-gray-500">Showing the first 300 rows. All {shown.length} will be imported.</p>}
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep(3)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to columns</Button>
              <Button onClick={runImport} disabled={!valid.length} className="gap-2 text-white" style={{ background: ACCENT }}>
                <Rocket className="h-4 w-4" /> Import {valid.length} row{valid.length === 1 ? "" : "s"}{invalid ? ` (skip ${invalid})` : ""}
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="rounded-2xl border bg-white p-8 space-y-5">
            {!result ? (
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: ACCENT }} />
                <p className="font-semibold text-gray-800">Importing… {progress ? `${progress.done} / ${progress.total}` : ""}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">Import finished</p>
                    <p className="text-sm text-gray-500">Running the same file again only updates what changed.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {[
                    ["Units added", result.propertiesCreated], ["Units updated", result.propertiesUpdated],
                    ["Tenants added", result.tenantsCreated], ["Tenants updated", result.tenantsUpdated],
                    ["Leases added", result.leasesCreated], ["Leases already there", result.leasesExisting],
                    ["Rent collection set up", result.rentCollectionSetUp], ["HOAs saved", result.hoasSaved],
                  ].map(([l, v]) => <div key={l as string} className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">{l}</div><div className="text-lg font-bold" style={{ color: BRAND }}>{v}</div></div>)}
                </div>
                {result.errors.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 space-y-1">
                    <p className="font-semibold">{result.errors.length} row{result.errors.length === 1 ? "" : "s"} couldn't be imported</p>
                    {result.errors.slice(0, 20).map(e => <p key={e.row}>Row {e.row}: {e.message}</p>)}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link href="/crm"><Button className="text-white" style={{ background: ACCENT }}>Open Tenants / CRM</Button></Link>
                  {result.hoasSaved > 0 && <Link href="/hoa"><Button variant="outline">Review HOA dues</Button></Link>}
                  <Button variant="outline" onClick={() => { setStep(2); setResult(null); setProgress(null); }}>Import another file</Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
