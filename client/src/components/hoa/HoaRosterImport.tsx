/**
 * Homeowner roster import for Keycove HOA. Same flow as the "Move to Keycove"
 * wizard (CSV / .xlsx / Google Sheets link → auto-map columns → fix rows →
 * import), with HOA roster fields instead of rent-roll fields.
 */
import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Link2, Loader2, Upload } from "lucide-react";
import {
  ROSTER_FIELDS, autoMapRoster, buildRosterRow, validateRosterRow, type RosterField, type RosterRow,
} from "@shared/hoaBoards";

const TEMPLATE_HEADERS = ["lot", "unit", "address", "owner_name", "email", "phone", "assessment", "mailing_address"];
const TEMPLATE_ROWS = [
  ["1", "", "101 Heron Way", "Jordan Smith", "jordan@example.com", "919-555-0101", "125.00", ""],
  ["2", "", "103 Heron Way", "Avery Johnson", "avery@example.com", "", "125.00", "PO Box 12, Raleigh NC 27601"],
  ["", "B-4", "200 Lakeview Dr", "Sam Patel", "sam@example.com", "", "", ""],
];

function downloadTemplate() {
  const csv = Papa.unparse({ fields: TEMPLATE_HEADERS, data: TEMPLATE_ROWS });
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = "keycove-hoa-roster-template.csv"; a.click();
  URL.revokeObjectURL(url);
}

type Step = "upload" | "map" | "review" | "done";

export default function HoaRosterImport({ associationId, onDone }: { associationId: number; onDone?: () => void }) {
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [raw, setRaw] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, RosterField | "">>({});
  const [rows, setRows] = useState<RosterRow[]>([]);
  const [sheetUrl, setSheetUrl] = useState("");
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; errors: { row: number; message: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fetchSheet = trpc.hoaBoards.board.fetchGoogleSheet.useMutation();
  const importRoster = trpc.hoaBoards.board.importRoster.useMutation();
  const utils = trpc.useUtils();

  const load = (hdrs: string[], data: Record<string, string>[]) => {
    const h = hdrs.map(x => String(x ?? "").trim()).filter(Boolean);
    const d = data.filter(r => Object.values(r).some(v => String(v ?? "").trim()));
    if (!h.length || !d.length) { toast.error("No rows found — the first row should be column headers."); return; }
    setHeaders(h); setRaw(d); setMapping(autoMapRoster(h)); setStep("map");
  };
  const parseCsv = (text: string) => {
    const res = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: "greedy", transformHeader: x => x.trim() });
    if (res.errors.length && !res.data.length) { toast.error(`Couldn't read that CSV: ${res.errors[0].message}`); return; }
    load(res.meta.fields ?? [], res.data);
  };
  const onFile = async (file?: File) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".xlsx")) {
        const { default: readXlsxFile } = await import("read-excel-file");
        const sheet = await readXlsxFile(file);
        const hdrs = (sheet[0] ?? []).map(c => String(c ?? "").trim());
        load(hdrs, sheet.slice(1).map(r => Object.fromEntries(hdrs.map((h, i) => [h, r[i] instanceof Date ? (r[i] as Date).toISOString().slice(0, 10) : String(r[i] ?? "")]))));
      } else if (name.endsWith(".xls")) {
        toast.error("Old .xls files aren't supported — save as .xlsx or CSV and try again.");
      } else parseCsv(await file.text());
    } catch (e: any) { toast.error(e?.message ?? "Couldn't read that file"); }
  };

  const toReview = () => {
    if (!Object.values(mapping).some(Boolean)) { toast.error("Match at least one column."); return; }
    setRows(raw.map(r => buildRosterRow(r, mapping)));
    setStep("review");
  };
  const errors = useMemo(() => rows.map(validateRosterRow), [rows]);
  const errorCount = errors.filter(e => e.length).length;
  const visible = rows.map((r, i) => ({ r, i })).filter(x => !onlyErrors || errors[x.i].length);
  const edit = (i: number, k: keyof RosterRow, v: string) => setRows(prev => prev.map((r, j) => j !== i ? r : {
    ...r, [k]: k === "assessmentCents" ? (v.trim() === "" ? null : Math.round(parseFloat(v.replace(/[$,]/g, "")) * 100) || 0) : (k === "email" ? v.trim().toLowerCase() : v),
  }));

  const runImport = async () => {
    const good = rows.filter((_, i) => !errors[i].length);
    if (!good.length) { toast.error("Fix the rows marked in red first."); return; }
    try {
      const res = await importRoster.mutateAsync({ associationId, rows: good });
      setResult(res); setStep("done");
      utils.hoaBoards.board.invalidate();
      toast.success(`Imported ${res.created} new and updated ${res.updated} homes.`);
    } catch (e: any) { toast.error(e?.message ?? "Import failed"); }
  };

  if (step === "upload") return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900 mb-1">One row per home</p>
        <p>Columns we recognize: lot, unit, address, owner name (or first/last), email, phone, assessment amount, mailing address. Leave assessment blank to use the HOA's default. Re-importing is safe — homes match on lot/unit/address, so nothing duplicates.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={downloadTemplate}><Download className="w-4 h-4 mr-1.5" /> Download template</Button>
      </div>
      <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void onFile(e.dataTransfer.files?.[0]); }}
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/40">
        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="font-semibold text-slate-800">Drop a CSV or Excel (.xlsx) file, or click to choose</p>
        <p className="text-xs text-slate-500 mt-1">Exports from PayHOA, AppFolio, Buildium, Excel or Google Sheets all work.</p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={e => void onFile(e.target.files?.[0])} />
      </div>
      <div className="flex gap-2">
        <Input placeholder="…or paste a Google Sheets link (shared as Anyone with the link)" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} />
        <Button variant="outline" disabled={!sheetUrl || fetchSheet.isPending} onClick={async () => {
          try { parseCsv((await fetchSheet.mutateAsync({ url: sheetUrl })).csv); } catch (e: any) { toast.error(e?.message); }
        }}>{fetchSheet.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}</Button>
      </div>
    </div>
  );

  if (step === "map") return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600"><FileSpreadsheet className="inline w-4 h-4 mr-1" />{raw.length} rows. Check how your columns match up:</p>
      <div className="divide-y rounded-xl border">
        {headers.map(h => (
          <div key={h} className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="font-medium text-slate-800 truncate">{h}</p>
              <p className="text-xs text-slate-400 truncate">e.g. {raw.slice(0, 3).map(r => r[h]).filter(Boolean).join(", ") || "—"}</p>
            </div>
            <select className="border rounded-md px-2 py-1.5 text-sm bg-white" value={mapping[h] ?? ""} onChange={e => {
              const f = e.target.value as RosterField | "";
              setMapping(prev => { const n = { ...prev }; if (f) for (const k of Object.keys(n)) if (n[k] === f) n[k] = ""; n[h] = f; return n; });
            }}>
              <option value="">Don't import</option>
              {ROSTER_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
        <Button onClick={toReview} style={{ background: "#1B2B5E" }}>Review rows</Button>
      </div>
    </div>
  );

  if (step === "review") return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-700">
          {rows.length - errorCount} ready{errorCount ? <span className="text-red-600"> · {errorCount} need fixing (they'll be skipped)</span> : null}
        </p>
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={onlyErrors} onChange={e => setOnlyErrors(e.target.checked)} /> Only rows with problems</label>
      </div>
      <div className="overflow-auto max-h-[420px] rounded-xl border">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 sticky top-0"><tr>
            {["#", "Lot", "Unit", "Address", "Owner", "Email", "Phone", "Assessment $", ""].map(h => <th key={h} className="text-left px-2 py-2 font-semibold text-slate-600">{h}</th>)}
          </tr></thead>
          <tbody>
            {visible.slice(0, 500).map(({ r, i }) => (
              <tr key={i} className={errors[i].length ? "bg-red-50" : ""}>
                <td className="px-2 text-slate-400">{i + 1}</td>
                {(["lot", "unit", "address", "ownerName", "email", "phone"] as const).map(k => (
                  <td key={k} className="px-1 py-1"><input className="w-full min-w-[70px] border rounded px-1.5 py-1" value={r[k]} onChange={e => edit(i, k, e.target.value)} /></td>
                ))}
                <td className="px-1 py-1"><input className="w-20 border rounded px-1.5 py-1" value={r.assessmentCents == null ? "" : (r.assessmentCents / 100).toFixed(2)} onChange={e => edit(i, "assessmentCents", e.target.value)} /></td>
                <td className="px-2 text-red-600 whitespace-nowrap">{errors[i].join("; ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep("map")}>Back</Button>
        <Button onClick={runImport} disabled={importRoster.isPending} style={{ background: "#1B2B5E" }}>
          {importRoster.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
          Import {rows.length - errorCount} homes
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 text-center py-4">
      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
      <p className="text-lg font-bold text-slate-900">{result?.created ?? 0} homes added · {result?.updated ?? 0} updated</p>
      {result?.errors.length ? (
        <div className="text-left rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
          <p className="font-semibold text-amber-800 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Skipped rows</p>
          <ul className="mt-1 text-amber-900">{result.errors.slice(0, 20).map(e => <li key={e.row}>Row {e.row}: {e.message}</li>)}</ul>
        </div>
      ) : null}
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={() => { setStep("upload"); setResult(null); }}>Import another file</Button>
        <Button onClick={onDone} style={{ background: "#1B2B5E" }}>Done</Button>
      </div>
    </div>
  );
}
