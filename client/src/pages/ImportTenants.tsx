import { useState, useCallback, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Upload, FileText, Download, CheckCircle2, ArrowRight, ArrowLeft,
  Users, X, AlertTriangle, Loader2, Plus, Trash2, BarChart3,
} from "lucide-react";

const ACCENT = "#F5A623";

// ── CSV Template ──────────────────────────────────────────────────────────────
const CSV_HEADERS = [
  "tenant_name", "tenant_email", "tenant_phone",
  "property_address", "state",
  "monthly_rent", "security_deposit",
  "lease_start_date", "lease_end_date", "rent_due_day",
];

const CSV_EXAMPLE_ROW = [
  "Jane Smith", "jane.smith@example.com", "555-123-4567",
  "123 Main St, Austin, TX 78701", "TX",
  "1500", "1500",
  "2025-01-01", "2025-12-31", "1",
];

function downloadTemplate() {
  const rows = [CSV_HEADERS.join(","), CSV_EXAMPLE_ROW.map(v => `"${v}"`).join(",")];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leasely-tenants-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── CSV Parser ────────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map(line => {
    const vals = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
}

// Best-effort column aliasing — competitor CSVs use slightly different names
// (e.g. AppFolio = "Resident Name", Buildium = "Tenant", RentRedi = "Renter").
function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v && v.trim()) return v.trim();
  }
  return "";
}

type ImportRow = {
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string;
  propertyAddress: string;
  state: string;
  monthlyRentCents: number;
  securityDepositCents?: number;
  leaseStartDate: string;
  leaseEndDate?: string;
  rentDueDay?: number;
};

function toCents(v: string): number {
  if (!v) return 0;
  const cleaned = v.replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : Math.round(n * 100);
}

function normDate(v: string): string {
  if (!v) return "";
  // Accept YYYY-MM-DD, MM/DD/YYYY, M/D/YY
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, mm, dd, yy] = m;
    if (yy.length === 2) yy = (parseInt(yy, 10) > 50 ? "19" : "20") + yy;
    return `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return s;
}

function csvRowToImport(row: Record<string, string>): ImportRow {
  return {
    tenantName: pick(row, ["tenant_name", "tenant", "resident_name", "resident", "renter", "name", "full_name"]),
    tenantEmail: pick(row, ["tenant_email", "email", "resident_email", "renter_email", "email_address"]).toLowerCase(),
    tenantPhone: pick(row, ["tenant_phone", "phone", "phone_number", "mobile", "cell"]) || undefined,
    propertyAddress: pick(row, ["property_address", "address", "property", "unit_address", "rental_address"]),
    state: pick(row, ["state", "st"]).toUpperCase().slice(0, 2),
    monthlyRentCents: toCents(pick(row, ["monthly_rent", "rent", "rent_amount", "monthly", "amount"])),
    securityDepositCents: pick(row, ["security_deposit", "deposit", "sec_deposit"])
      ? toCents(pick(row, ["security_deposit", "deposit", "sec_deposit"]))
      : undefined,
    leaseStartDate: normDate(pick(row, ["lease_start_date", "lease_start", "start_date", "move_in", "move_in_date"])),
    leaseEndDate: normDate(pick(row, ["lease_end_date", "lease_end", "end_date", "move_out", "move_out_date"])) || undefined,
    rentDueDay: (() => {
      const n = parseInt(pick(row, ["rent_due_day", "due_day", "due"]), 10);
      return isNaN(n) ? undefined : Math.min(28, Math.max(1, n));
    })(),
  };
}

function validateRow(r: ImportRow): string[] {
  const errs: string[] = [];
  if (!r.tenantName || r.tenantName.length < 2) errs.push("Tenant name required");
  if (!r.tenantEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.tenantEmail)) errs.push("Valid email required");
  if (!r.propertyAddress || r.propertyAddress.length < 3) errs.push("Property address required");
  if (!r.state || r.state.length !== 2) errs.push("2-letter state required");
  if (!r.monthlyRentCents || r.monthlyRentCents < 100) errs.push("Monthly rent required");
  if (!r.leaseStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(r.leaseStartDate)) errs.push("Lease start date required (YYYY-MM-DD)");
  if (r.leaseEndDate && !/^\d{4}-\d{2}-\d{2}$/.test(r.leaseEndDate)) errs.push("Lease end date format invalid");
  return errs;
}

// ── Platform Cards ────────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: "appfolio",
    name: "AppFolio",
    logo: "AF",
    color: "#2563EB",
    instructions: [
      "Sign in to AppFolio",
      "Go to Reports → Resident Reports → Resident List",
      "Click Run Report, then Export → CSV",
      "Open the CSV — copy the columns into our template (or upload as-is, we'll auto-map)",
    ],
  },
  {
    id: "buildium",
    name: "Buildium",
    logo: "Bu",
    color: "#7C3AED",
    instructions: [
      "Sign in to Buildium",
      "Go to Leasing → Tenants",
      "Click Export → CSV (top right of the tenant list)",
      "Upload the file below — we'll map AppFolio/Buildium column names automatically",
    ],
  },
  {
    id: "rentredi",
    name: "RentRedi",
    logo: "RR",
    color: "#16A34A",
    instructions: [
      "Sign in to RentRedi",
      "Go to Tenants in the main nav",
      "Click the export icon (down arrow) — choose CSV",
      "Upload the file below",
    ],
  },
  {
    id: "avail",
    name: "Avail",
    logo: "Av",
    color: "#0EA5E9",
    instructions: [
      "Sign in to Avail",
      "Open Tenants (left sidebar)",
      "Click ⋯ → Export tenants list",
      "Save the CSV and upload it below",
    ],
  },
  {
    id: "rentec",
    name: "Rentec Direct",
    logo: "RD",
    color: "#D97706",
    instructions: [
      "Sign in to Rentec Direct",
      "Go to Tenants tab",
      "Click Export → CSV at the top",
      "Upload the file below",
    ],
  },
  {
    id: "csv",
    name: "Generic CSV / Spreadsheet",
    logo: "CSV",
    color: "#475569",
    instructions: [
      "Download our template using the button below",
      "Fill in one row per tenant",
      "Save as CSV and upload it here",
    ],
  },
  {
    id: "manual",
    name: "Manual Entry",
    logo: "+",
    color: ACCENT,
    instructions: [],
  },
];

const EMPTY_ROW = (): ImportRow => ({
  tenantName: "", tenantEmail: "", tenantPhone: "",
  propertyAddress: "", state: "",
  monthlyRentCents: 0, securityDepositCents: undefined,
  leaseStartDate: "", leaseEndDate: "", rentDueDay: 1,
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function ImportTenants() {
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState<typeof PLATFORMS[0] | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([EMPTY_ROW()]);
  const [parsed, setParsed] = useState<ImportRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, string[]>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.import.bulkLeases.useMutation();

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rawRows = parseCSV(text);
      if (rawRows.length === 0) {
        toast.error("No data found in CSV.");
        return;
      }
      const mapped = rawRows.map(csvRowToImport);
      const errs: Record<number, string[]> = {};
      mapped.forEach((r, i) => {
        const e = validateRow(r);
        if (e.length) errs[i] = e;
      });
      setParsed(mapped);
      setRowErrors(errs);
      setStep(2);
    };
    reader.readAsText(file);
  }, []);

  const handleManualNext = () => {
    const errs: Record<number, string[]> = {};
    rows.forEach((r, i) => {
      const e = validateRow(r);
      if (e.length) errs[i] = e;
    });
    setRowErrors(errs);
    setParsed(rows);
    setStep(2);
  };

  const handleImport = async () => {
    const valid = parsed.filter((_, i) => !rowErrors[i]);
    if (!valid.length) {
      toast.error("No valid rows to import.");
      return;
    }
    setImporting(true);
    try {
      const res = await importMutation.mutateAsync({
        rows: valid.map(r => ({
          tenantName: r.tenantName,
          tenantEmail: r.tenantEmail,
          tenantPhone: r.tenantPhone,
          propertyAddress: r.propertyAddress,
          state: r.state,
          monthlyRentCents: r.monthlyRentCents,
          securityDepositCents: r.securityDepositCents,
          leaseStartDate: r.leaseStartDate,
          leaseEndDate: r.leaseEndDate,
          rentDueDay: r.rentDueDay,
          sourcePlatform: platform?.name ?? "CSV",
        })),
      });
      setResult({ imported: res.imported, skipped: res.skipped, errors: res.errors });
      setStep(3);
    } catch (err: any) {
      toast.error(err?.message ?? "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsed.filter((_, i) => !rowErrors[i]).length;
  const errorCount = parsed.length - validCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/leases">
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Leases
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Users className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Import Tenants &amp; Leases</h1>
              <p className="text-gray-500 text-sm">Migrate from AppFolio, Buildium, RentRedi, Avail, or any CSV</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-6">
            {["Choose Platform", "Upload", "Preview", "Done"].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= i ? "text-white" : "bg-gray-100 text-gray-400"}`}
                  style={step >= i ? { background: ACCENT } : {}}>
                  {step > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === i ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                {i < 3 && <div className="h-px w-6 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 0 */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Where are your tenants today?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPlatform(p); setStep(1); }}
                  className="p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-300 text-left transition-all group hover:shadow-md"
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-black mb-3"
                    style={{ background: p.color }}>
                    {p.logo}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-6">
              We&apos;ll auto-map common column names (Tenant, Resident, Renter, Rent, Monthly Rent, etc.) — no manual mapping needed for most exports.
            </p>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && platform && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-black"
                  style={{ background: platform.color }}>
                  {platform.logo}
                </div>
                <h2 className="text-lg font-bold text-gray-900">Exporting from {platform.name}</h2>
              </div>

              {platform.id !== "manual" ? (
                <>
                  <ol className="space-y-2 mb-6">
                    {platform.instructions.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600">
                        <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: `${ACCENT}20`, color: ACCENT }}>
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>

                  <div className="border-t border-gray-100 pt-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">Optional — download our template</h3>
                      <p className="text-xs text-gray-500 mb-2">Most competitor exports work as-is. Use this only if your export has odd columns.</p>
                      <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
                        <Download className="h-3.5 w-3.5" /> Download CSV Template
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">Upload your CSV</h3>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                      />
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-amber-400 hover:bg-amber-50/30 transition-all group"
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-300 group-hover:text-amber-500 transition-colors" />
                        <p className="text-sm font-medium text-gray-500 group-hover:text-amber-600">Click to upload CSV</p>
                        <p className="text-xs text-gray-400 mt-1">{platform.name} export or filled Leasely template</p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Enter your tenants one at a time. Click &quot;Add Another&quot; for more.</p>
                  <div className="space-y-4">
                    {rows.map((row, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative">
                        {rows.length > 1 && (
                          <button onClick={() => setRows(r => r.filter((_, j) => j !== i))}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tenant {i + 1}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { label: "Tenant Name", key: "tenantName", type: "text", placeholder: "Jane Smith" },
                            { label: "Tenant Email", key: "tenantEmail", type: "email", placeholder: "jane@example.com" },
                            { label: "Tenant Phone", key: "tenantPhone", type: "text", placeholder: "555-123-4567" },
                            { label: "Property Address", key: "propertyAddress", type: "text", placeholder: "123 Main St, Austin, TX" },
                            { label: "State (2-letter)", key: "state", type: "text", placeholder: "TX" },
                            { label: "Monthly Rent ($)", key: "monthlyRentCents", type: "number", placeholder: "1500" },
                            { label: "Security Deposit ($)", key: "securityDepositCents", type: "number", placeholder: "1500" },
                            { label: "Lease Start (YYYY-MM-DD)", key: "leaseStartDate", type: "text", placeholder: "2025-01-01" },
                            { label: "Lease End (YYYY-MM-DD)", key: "leaseEndDate", type: "text", placeholder: "2025-12-31" },
                            { label: "Rent Due Day (1-28)", key: "rentDueDay", type: "number", placeholder: "1" },
                          ].map(field => {
                            const isMoney = field.key === "monthlyRentCents" || field.key === "securityDepositCents";
                            const currentDollars = isMoney
                              ? ((row as any)[field.key] ?? 0) / 100
                              : (row as any)[field.key] ?? "";
                            return (
                              <div key={field.key}>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">{field.label}</label>
                                <input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  value={currentDollars}
                                  onChange={e => setRows(r => r.map((row2, j) => {
                                    if (j !== i) return row2;
                                    if (isMoney) return { ...row2, [field.key]: Math.round(Number(e.target.value) * 100) };
                                    if (field.type === "number") return { ...row2, [field.key]: Number(e.target.value) };
                                    return { ...row2, [field.key]: e.target.value };
                                  }))}
                                  className="w-full h-8 rounded-lg border border-gray-200 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-2 w-full" onClick={() => setRows(r => [...r, EMPTY_ROW()])}>
                      <Plus className="h-3.5 w-3.5" /> Add Another Tenant
                    </Button>
                  </div>
                  <Button style={{ background: ACCENT, color: "#3A2410" }} className="font-bold w-full gap-2"
                    onClick={handleManualNext}>
                    Preview Import <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <button onClick={() => setStep(0)} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Choose a different platform
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Review Your Tenants</h2>
                <p className="text-sm text-gray-500">
                  {parsed.length} found · <span className="text-green-600 font-medium">{validCount} ready to import</span>
                  {errorCount > 0 && <> · <span className="text-red-500 font-medium">{errorCount} have errors</span></>}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5" /> Template
              </Button>
            </div>

            <div className="space-y-3">
              {parsed.map((r, i) => {
                const errs = rowErrors[i] ?? [];
                const hasError = errs.length > 0;
                return (
                  <div key={i} className={`bg-white rounded-xl border p-4 ${hasError ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${hasError ? "bg-red-100" : "bg-green-100"}`}>
                          {hasError ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Users className="h-4 w-4 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {r.tenantName || <span className="text-gray-400 italic">No name</span>}
                            <span className="text-gray-400 font-normal"> · {r.tenantEmail || "no email"}</span>
                          </p>
                          <p className="text-xs text-gray-500">{r.propertyAddress || "(no address)"} · {r.state || "??"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ${(r.monthlyRentCents / 100).toLocaleString()}/mo
                            {r.securityDepositCents ? ` · $${(r.securityDepositCents / 100).toLocaleString()} deposit` : ""}
                            {r.leaseStartDate ? ` · ${r.leaseStartDate}` : ""}
                            {r.leaseEndDate ? ` → ${r.leaseEndDate}` : ""}
                          </p>
                          {hasError && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {errs.map((e, ei) => (
                                <span key={ei} className="text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5">{e}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setParsed(p => p.filter((_, j) => j !== i));
                          setRowErrors(err => {
                            const next: Record<number, string[]> = {};
                            Object.entries(err).forEach(([k, v]) => {
                              const ki = parseInt(k);
                              if (ki < i) next[ki] = v;
                              else if (ki > i) next[ki - 1] = v;
                            });
                            return next;
                          });
                        }}
                        className="text-gray-300 hover:text-red-500 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {parsed.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>All rows removed. Go back to re-upload.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                style={{ background: ACCENT, color: "#3A2410" }}
                className="font-bold flex-1 gap-2"
                disabled={validCount === 0 || importing}
                onClick={handleImport}
              >
                {importing
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing…</>
                  : <><Upload className="h-4 w-4" /> Import {validCount} Tenant{validCount !== 1 ? "s" : ""}</>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && result && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}20` }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: ACCENT }} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Import Complete!</h2>
            <p className="text-gray-500 mb-6">
              {result.imported} tenant{result.imported !== 1 ? "s" : ""} migrated · active leases now show on your Leases page.
            </p>

            {result.errors.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 text-left mb-6">
                <p className="text-sm font-semibold text-red-600 mb-2">{result.errors.length} row{result.errors.length !== 1 ? "s" : ""} failed:</p>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((e, i) => <li key={i} className="text-xs text-red-500">{e}</li>)}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/leases">
                <Button style={{ background: ACCENT, color: "#3A2410" }} className="font-bold gap-2 w-full sm:w-auto">
                  <BarChart3 className="h-4 w-4" /> View Leases
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 w-full sm:w-auto"
                onClick={() => { setParsed([]); setRows([EMPTY_ROW()]); setPlatform(null); setResult(null); setStep(0); }}>
                <Upload className="h-4 w-4" /> Import More
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
