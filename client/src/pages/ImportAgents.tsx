import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Download, Award, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const ACCENT = "#4F46E5";
const CSV_HEADERS = ["name", "email", "phone", "license", "bio", "specialties", "service_areas"];
const CSV_EXAMPLE = ["Jane Broker", "jane@realty.com", "704-555-0142", "NC-123456", "15 years, investor-focused", "novation;fix_flip;investor", "Charlotte NC;Raleigh NC"];

function downloadTemplate() {
  const rows = [CSV_HEADERS.join(","), CSV_EXAMPLE.map(v => `"${v}"`).join(",")];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "keycove-agents-template.csv"; a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const parseRow = (line: string) => {
    const out: string[] = []; let cur = "", q = false;
    for (const ch of line) {
      if (ch === '"') { q = !q; continue; }
      if (ch === "," && !q) { out.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur.trim()); return out;
  };
  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map(line => {
    const vals = parseRow(line); const o: Record<string, string> = {};
    headers.forEach((h, i) => { o[h] = vals[i] ?? ""; }); return o;
  });
}
const pick = (r: Record<string, string>, keys: string[]) => { for (const k of keys) if (r[k]?.trim()) return r[k].trim(); return ""; };

type Row = { name: string; email: string; phone?: string; licenseNumber?: string; bio?: string; specialties?: string; serviceAreas?: string; _err?: string };

function normalize(r: Record<string, string>): Row {
  const name = pick(r, ["name", "agent_name", "full_name"]);
  const email = pick(r, ["email", "agent_email"]);
  const row: Row = {
    name, email,
    phone: pick(r, ["phone", "phone_number", "cell"]) || undefined,
    licenseNumber: pick(r, ["license", "license_number", "licensenumber"]) || undefined,
    bio: pick(r, ["bio", "about", "description"]) || undefined,
    specialties: pick(r, ["specialties", "specialty", "focus"]) || undefined,
    serviceAreas: pick(r, ["service_areas", "serviceareas", "areas", "markets"]) || undefined,
  };
  if (!name) row._err = "Missing name";
  else if (!/.+@.+\..+/.test(email)) row._err = "Missing/invalid email";
  return row;
}

export default function ImportAgents() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [result, setResult] = useState<{ created: number; updated: number; total: number; errors: any[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importMutation = trpc.admin.importAgents.useMutation();

  const doParse = useCallback((text: string) => {
    const parsed = parseCSV(text).map(normalize);
    if (!parsed.length) { toast.error("No rows found — need a header row + at least one agent."); return; }
    setRows(parsed); setStep(2);
  }, []);
  const onFile = (f: File) => { const r = new FileReader(); r.onload = () => doParse(String(r.result || "")); r.readAsText(f); };

  const valid = rows.filter(r => !r._err);
  const invalid = rows.filter(r => r._err);

  async function run() {
    if (!valid.length) { toast.error("Nothing valid to import."); return; }
    try {
      const res = await importMutation.mutateAsync({ rows: valid.map(({ _err, ...r }) => r) as any });
      setResult(res); setStep(3);
      toast.success(`${res.created + res.updated} agent(s) added to the directory.`);
    } catch (e: any) { toast.error(e?.message || "Import failed"); }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate("/agents")} className="text-sm text-gray-500 inline-flex items-center gap-1 mb-3 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Creme Agents
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Award className="w-6 h-6" style={{ color: ACCENT }} /> Import Agents</h1>
        <p className="text-gray-500 mt-1 mb-6">Bulk-add your agent list to the Creme Agents directory. Each becomes an <b>approved</b> agent with a claimable account. No AI.</p>

        {step === 1 && (
          <div className="bg-white border rounded-2xl p-6">
            <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer bg-gray-50 hover:border-indigo-300">
              <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: ACCENT }} />
              <div className="font-semibold text-gray-900">Drop a CSV or click to browse</div>
              <div className="text-sm text-gray-500">Export your agent list as CSV — columns auto-map.</div>
              <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
            </div>
            <div className="flex items-center gap-3 my-4 text-sm text-gray-400"><div className="flex-1 h-px bg-gray-200" /> or paste <div className="flex-1 h-px bg-gray-200" /></div>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} placeholder={CSV_HEADERS.join(",") + "\n" + CSV_EXAMPLE.join(",")}
              className="w-full min-h-[110px] font-mono text-xs p-3 rounded-lg border resize-y" />
            <div className="flex justify-between items-center mt-4">
              <button onClick={downloadTemplate} className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: ACCENT }}><Download className="w-4 h-4" /> Template</button>
              <Button onClick={() => doParse(raw)} disabled={!raw.trim()} style={{ background: ACCENT }}>Review <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-white border rounded-xl px-4 py-3"><div className="text-xs text-gray-500">Ready</div><div className="text-2xl font-bold text-emerald-600">{valid.length}</div></div>
              {invalid.length > 0 && <div className="flex-1 bg-white border rounded-xl px-4 py-3"><div className="text-xs text-gray-500">Skipped</div><div className="text-2xl font-bold text-amber-600">{invalid.length}</div></div>}
            </div>
            <div className="bg-white border rounded-xl divide-y max-h-[420px] overflow-y-auto">
              {rows.map((r, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${r._err ? "opacity-60" : ""}`}>
                  <div><span className="font-medium text-gray-900">{r.name || "—"}</span> <span className="text-gray-400">· {r.email}</span>
                    {r.licenseNumber && <span className="text-xs text-gray-400 block">Lic {r.licenseNumber}{r.specialties ? ` · ${r.specialties}` : ""}</span>}
                  </div>
                  {r._err ? <span className="text-xs text-amber-700 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{r._err}</span>
                    : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => { setStep(1); setRows([]); }}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button onClick={run} disabled={!valid.length || importMutation.isPending} style={{ background: ACCENT }}>
                {importMutation.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Importing…</> : <>Import {valid.length} agent{valid.length !== 1 ? "s" : ""} <ArrowRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="bg-white border rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3"><CheckCircle2 className="w-7 h-7 text-emerald-600" /></div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Agents imported</h2>
            <p className="text-gray-500 mb-5">{result.created} new · {result.updated} updated — all live in the Creme Agents directory.</p>
            {result.errors.length > 0 && (
              <div className="text-left text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <b>{result.errors.length} skipped:</b>
                <ul className="list-disc pl-5 mt-1">{result.errors.slice(0, 8).map((e, i) => <li key={i}>Row {e.row} ({e.email}): {e.message}</li>)}</ul>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate("/agents")} style={{ background: ACCENT }}>View directory <ArrowRight className="w-4 h-4 ml-1" /></Button>
              <Button variant="outline" onClick={() => { setStep(1); setRaw(""); setRows([]); setResult(null); }}>Import more</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
