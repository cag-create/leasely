import { useState, useCallback, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Upload, FileText, Download, CheckCircle2, ArrowRight, ArrowLeft,
  Building2, X, AlertTriangle, Loader2, Home, Sparkles,
} from "lucide-react";

const ACCENT = "#4F46E5";

// ── CSV template ────────────────────────────────────────────────────────────
// One row per occupied unit. This is a migration file — the PM already has
// these renters and leases in place; we just carry them over verbatim.
const CSV_HEADERS = [
  "building", "unit", "address", "city", "state", "zip",
  "tenant_first_name", "tenant_last_name", "tenant_email", "tenant_phone",
  "monthly_rent", "security_deposit", "lease_start", "lease_end",
  "late_fee", "grace_days",
];
const CSV_EXAMPLE = [
  "Maple Court", "4B", "812 Maple Ave", "Charlotte", "NC", "28203",
  "Jasmine", "Reed", "jasmine.reed@example.com", "704-555-0142",
  "1450", "1450", "2025-06-01", "2026-05-31", "50", "5",
];

function downloadTemplate() {
  const rows = [CSV_HEADERS.join(","), CSV_EXAMPLE.map(v => `"${v}"`).join(",")];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "leasely-portfolio-import-template.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ── CSV parsing ───────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const parseRow = (line: string): string[] => {
    const out: string[] = [];
    let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { q = !q; continue; }
      if (ch === "," && !q) { out.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map(line => {
    const vals = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
}

// Best-effort aliasing — competitor exports name columns differently
// (AppFolio, Buildium, RentRedi, Yardi, Rent Manager …).
function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) { const v = row[k]; if (v && v.trim()) return v.trim(); }
  return "";
}
function toCents(s: string): number {
  const n = parseFloat(String(s).replace(/[$,\s]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}
// Accepts 2025-06-01, 06/01/2025, 6/1/25 → YYYY-MM-DD
function normDate(s: string): string {
  const t = (s || "").trim();
  if (!t) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, mo, d, y] = m;
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return t;
}

type Parsed = {
  building?: string; unit?: string; address: string; city?: string; state?: string; zip?: string;
  firstName: string; lastName?: string; email?: string; phone?: string;
  monthlyRentCents: number; securityDepositCents?: number;
  leaseStartDate: string; leaseEndDate?: string;
  lateFeeCents?: number; lateFeeGraceDays?: number;
  _errors: string[];
};

function normalize(row: Record<string, string>): Parsed {
  // tenant name can arrive as one "Last, First" / "First Last" field
  let first = pick(row, ["tenant_first_name", "first_name", "firstname"]);
  let last = pick(row, ["tenant_last_name", "last_name", "lastname"]);
  if (!first) {
    const full = pick(row, ["tenant_name", "resident", "resident_name", "tenant", "renter", "name"]);
    if (full.includes(",")) { const [l, f] = full.split(","); last = last || l.trim(); first = f?.trim() || ""; }
    else { const parts = full.split(/\s+/); first = parts[0] || ""; last = last || parts.slice(1).join(" "); }
  }
  const address = pick(row, ["address", "street", "property_address", "address_line_1", "address1"]);
  const p: Parsed = {
    building: pick(row, ["building", "property", "property_name", "community", "complex"]) || undefined,
    unit: pick(row, ["unit", "unit_number", "unit_id", "apt", "apartment", "unit_label"]) || undefined,
    address,
    city: pick(row, ["city"]) || undefined,
    state: pick(row, ["state", "st"]) || undefined,
    zip: pick(row, ["zip", "zipcode", "postal_code", "zip_code"]) || undefined,
    firstName: first,
    lastName: last || undefined,
    email: pick(row, ["tenant_email", "email", "resident_email"]) || undefined,
    phone: pick(row, ["tenant_phone", "phone", "phone_number", "cell"]) || undefined,
    monthlyRentCents: toCents(pick(row, ["monthly_rent", "rent", "lease_rent", "market_rent", "amount"])),
    securityDepositCents: (() => { const v = pick(row, ["security_deposit", "deposit"]); return v ? toCents(v) : undefined; })(),
    leaseStartDate: normDate(pick(row, ["lease_start", "move_in", "start_date", "lease_start_date", "move_in_date"])),
    leaseEndDate: normDate(pick(row, ["lease_end", "end_date", "lease_end_date", "expiration", "lease_expiration"])) || undefined,
    lateFeeCents: (() => { const v = pick(row, ["late_fee", "late_fee_amount"]); return v ? toCents(v) : undefined; })(),
    lateFeeGraceDays: (() => { const v = pick(row, ["grace_days", "grace", "late_fee_grace"]); return v ? parseInt(v) : undefined; })(),
    _errors: [],
  };
  if (!p.address) p._errors.push("Missing address");
  if (!p.firstName) p._errors.push("Missing tenant name");
  if (!p.monthlyRentCents) p._errors.push("Missing/zero rent");
  if (!p.leaseStartDate) p._errors.push("Missing lease start");
  return p;
}

const money = (c?: number) => c == null ? "—" : `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function ImportPortfolio() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<Parsed[]>([]);
  const [result, setResult] = useState<{ imported: number; buildings: number; total: number; errors: { row: number; unit: string; message: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importMutation = trpc.crm.bulkImport.useMutation();

  const doParse = useCallback((text: string) => {
    const parsed = parseCSV(text).map(normalize);
    if (!parsed.length) { toast.error("No rows found — check your file has a header row + at least one unit."); return; }
    setRows(parsed);
    setStep(2);
  }, []);

  const onFile = useCallback((f: File) => {
    const reader = new FileReader();
    reader.onload = () => doParse(String(reader.result || ""));
    reader.readAsText(f);
  }, [doParse]);

  const valid = useMemo(() => rows.filter(r => r._errors.length === 0), [rows]);
  const invalid = useMemo(() => rows.filter(r => r._errors.length > 0), [rows]);
  const buildings = useMemo(() => {
    const m = new Map<string, Parsed[]>();
    for (const r of rows) { const k = (r.building || r.address).trim(); if (!m.has(k)) m.set(k, []); m.get(k)!.push(r); }
    return Array.from(m.entries());
  }, [rows]);

  async function runImport() {
    if (!valid.length) { toast.error("Nothing valid to import."); return; }
    try {
      const res = await importMutation.mutateAsync({
        rows: valid.map(r => ({
          building: r.building, unit: r.unit, address: r.address, city: r.city, state: r.state, zip: r.zip,
          firstName: r.firstName, lastName: r.lastName, email: r.email, phone: r.phone,
          monthlyRentCents: r.monthlyRentCents, securityDepositCents: r.securityDepositCents,
          leaseStartDate: r.leaseStartDate, leaseEndDate: r.leaseEndDate,
          lateFeeCents: r.lateFeeCents, lateFeeGraceDays: r.lateFeeGraceDays,
        })),
      });
      setResult(res);
      setStep(3);
      if (res.imported > 0) toast.success(`Imported ${res.imported} units — your portal is live.`);
    } catch (e: any) {
      toast.error(e?.message || "Import failed");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 16px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/crm" style={{ color: "#64748b", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
            <ArrowLeft size={14} /> Back to portfolio
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 4px", color: "#0f172a", letterSpacing: "-0.02em" }}>
            Import your portfolio
          </h1>
          <p style={{ color: "#64748b", fontSize: 15, margin: 0, maxWidth: 620 }}>
            Moving from AppFolio, Buildium, RentRedi, Yardi or a spreadsheet? Drop in one row per occupied unit —
            your buildings, renters, and existing leases go live in the portal instantly. No AI, no re-keying.
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["Upload", "Review", "Done"].map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = step === n, done = step > n;
            return (
              <div key={label} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: active ? ACCENT : done ? "#eef2ff" : "#fff", color: active ? "#fff" : done ? ACCENT : "#94a3b8",
                border: `1px solid ${active ? ACCENT : "#e2e8f0"}`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, background: active ? "rgba(255,255,255,.25)" : done ? ACCENT : "#e2e8f0",
                  color: active || done ? "#fff" : "#94a3b8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {done ? <CheckCircle2 size={13} /> : n}
                </span>
                {label}
              </div>
            );
          })}
        </div>

        {/* Step 1 — upload/paste */}
        {step === 1 && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28 }}>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
              onClick={() => fileRef.current?.click()}
              style={{ border: "2px dashed #cbd5e1", borderRadius: 14, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: "#f8fafc" }}>
              <Upload size={32} color={ACCENT} style={{ margin: "0 auto 12px" }} />
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Drop your CSV here, or click to browse</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Export a resident/rent-roll CSV from your current software — we auto-map the columns.</div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "#94a3b8", fontSize: 13 }}>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} /> or paste rows <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            <textarea
              value={raw} onChange={e => setRaw(e.target.value)}
              placeholder={CSV_HEADERS.join(",") + "\n" + CSV_EXAMPLE.join(",")}
              style={{ width: "100%", minHeight: 120, fontFamily: "ui-monospace,monospace", fontSize: 12, padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", resize: "vertical" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 12 }}>
              <button onClick={downloadTemplate} style={{ background: "none", border: "none", color: ACCENT, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Download size={15} /> Download template
              </button>
              <Button onClick={() => doParse(raw)} disabled={!raw.trim()} style={{ background: ACCENT }}>
                Review units <ArrowRight size={15} style={{ marginLeft: 6 }} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — review */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <Stat icon={<Building2 size={16} />} label="Buildings" value={buildings.length} />
              <Stat icon={<Home size={16} />} label="Units ready" value={valid.length} good />
              {invalid.length > 0 && <Stat icon={<AlertTriangle size={16} />} label="Need fixing" value={invalid.length} warn />}
              <Stat icon={<FileText size={16} />} label="Monthly rent roll" value={money(valid.reduce((s, r) => s + r.monthlyRentCents, 0))} />
            </div>

            {invalid.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
                <strong>{invalid.length} row(s)</strong> are missing required fields and will be skipped. Fix them in your file and re-upload, or import the {valid.length} valid units now.
              </div>
            )}

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
              {buildings.map(([name, units]) => (
                <div key={name}>
                  <div style={{ padding: "12px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                    <Building2 size={15} color={ACCENT} /> {name}
                    <span style={{ color: "#94a3b8", fontWeight: 500 }}>· {units.length} unit{units.length !== 1 ? "s" : ""}</span>
                  </div>
                  {units.map((r, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 110px 130px", gap: 10, padding: "11px 18px", borderBottom: "1px solid #f1f5f9", fontSize: 13, alignItems: "center",
                      opacity: r._errors.length ? 0.6 : 1 }}>
                      <span style={{ fontWeight: 700, color: "#334155" }}>{r.unit ? `#${r.unit}` : "—"}</span>
                      <span style={{ color: "#0f172a" }}>{r.firstName} {r.lastName}{r.email && <span style={{ display: "block", color: "#94a3b8", fontSize: 11 }}>{r.email}</span>}</span>
                      <span style={{ color: "#64748b", fontSize: 12 }}>{r.address}</span>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{money(r.monthlyRentCents)}<span style={{ color: "#94a3b8", fontWeight: 500 }}>/mo</span></span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {r._errors.length
                          ? <span style={{ color: "#b45309", fontWeight: 600 }}>{r._errors.join(", ")}</span>
                          : <>{r.leaseStartDate} → {r.leaseEndDate || "M2M"}</>}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <Button variant="outline" onClick={() => { setStep(1); setRows([]); }}><ArrowLeft size={15} style={{ marginRight: 6 }} /> Back</Button>
              <Button onClick={runImport} disabled={!valid.length || importMutation.isPending} style={{ background: ACCENT }}>
                {importMutation.isPending ? <><Loader2 size={15} className="animate-spin" style={{ marginRight: 6 }} /> Importing…</> : <>Import {valid.length} unit{valid.length !== 1 ? "s" : ""} <ArrowRight size={15} style={{ marginLeft: 6 }} /></>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — done */}
        {step === 3 && result && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 36, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Sparkles size={30} color="#059669" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Your portal is live</h2>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 20px" }}>
              {result.imported} unit{result.imported !== 1 ? "s" : ""} across {result.buildings} building{result.buildings !== 1 ? "s" : ""} imported.
              Rent schedules, auto late fees, and tenant portals are already running — every renter can be invited to pay online today.
            </p>
            {result.errors.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#92400e", textAlign: "left" }}>
                <strong>{result.errors.length} row(s) skipped:</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                  {result.errors.slice(0, 8).map((e, i) => <li key={i}>Row {e.row} ({e.unit}): {e.message}</li>)}
                </ul>
              </div>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Button onClick={() => navigate("/crm")} style={{ background: ACCENT }}>Open my portfolio <ArrowRight size={15} style={{ marginLeft: 6 }} /></Button>
              <Button variant="outline" onClick={() => { setStep(1); setRaw(""); setRows([]); setResult(null); }}>Import another file</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, good, warn }: { icon: React.ReactNode; label: string; value: React.ReactNode; good?: boolean; warn?: boolean }) {
  const color = good ? "#059669" : warn ? "#b45309" : "#0f172a";
  return (
    <div style={{ flex: "1 1 140px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{icon} {label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}
