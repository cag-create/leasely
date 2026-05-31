import { useState, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Upload, FileText, Download, CheckCircle2, ArrowRight, ArrowLeft,
  Building2, X, AlertTriangle, Loader2, Plus, Trash2, Home, BarChart3,
  Layers
} from "lucide-react";

const ACCENT = "#4F46E5";
const BRAND = "#1B2B5E";

// ── CSV Template ──────────────────────────────────────────────────────────────
const CSV_HEADERS = [
  "title", "address", "city", "state", "zip", "monthly_rent",
  "bedrooms", "bathrooms", "property_type", "description",
  "security_deposit", "square_feet", "available_date",
  "pet_friendly", "parking", "washer_dryer", "air_conditioning",
  "dishwasher", "utilities", "contact_name", "contact_phone",
];

const CSV_EXAMPLE_ROW = [
  "2BR Near Downtown", "123 Main St", "Austin", "TX", "78701", "1500",
  "2", "1", "apartment", "Spacious apartment with great natural light",
  "1500", "800", "2025-06-01",
  "yes", "yes", "yes", "no", "no", "not_included", "Jane Smith", "555-123-4567",
];

function downloadTemplate() {
  const rows = [CSV_HEADERS.join(","), CSV_EXAMPLE_ROW.map(v => `"${v}"`).join(",")];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leasely-import-template.csv";
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

function csvRowToListing(row: Record<string, string>) {
  const bool = (v: string) => ["yes", "true", "1", "y"].includes((v ?? "").toLowerCase());
  const num = (v: string) => { const n = parseInt(v?.replace(/\D/g, ""), 10); return isNaN(n) ? undefined : n; };

  const propertyTypes = ["apartment", "house", "condo", "townhouse", "co_living", "studio", "room", "other"] as const;
  const utilities = ["included", "not_included", "partial"] as const;

  return {
    title: row.title ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    zip: row.zip ?? "",
    monthlyRent: num(row.monthly_rent) ?? 0,
    bedrooms: row.bedrooms ?? "1",
    bathrooms: row.bathrooms ?? "1",
    propertyType: (propertyTypes.includes(row.property_type as any) ? row.property_type : "apartment") as typeof propertyTypes[number],
    description: row.description ?? undefined,
    securityDeposit: num(row.security_deposit),
    squareFeet: num(row.square_feet),
    availableDate: row.available_date ?? undefined,
    petFriendly: bool(row.pet_friendly),
    parkingAvailable: bool(row.parking),
    washerDryer: bool(row.washer_dryer),
    airConditioning: bool(row.air_conditioning),
    dishwasher: bool(row.dishwasher),
    utilities: (utilities.includes(row.utilities as any) ? row.utilities : "not_included") as typeof utilities[number],
    contactName: row.contact_name ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
  };
}

function validateListing(l: ReturnType<typeof csvRowToListing>): string[] {
  const errs: string[] = [];
  if (!l.title || l.title.length < 3) errs.push("Title too short");
  if (!l.address) errs.push("Address required");
  if (!l.city) errs.push("City required");
  if (!l.state || l.state.length < 2) errs.push("State required");
  if (!l.zip || l.zip.length < 5) errs.push("ZIP required");
  if (!l.monthlyRent || l.monthlyRent < 1) errs.push("Monthly rent required");
  return errs;
}

// ── Platform Cards ─────────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: "zillow",
    name: "Zillow Rental Manager",
    logo: "Z",
    color: "#006AFF",
    instructions: [
      "Go to zillow.com/rental-manager and sign in",
      "Click My Properties in the left sidebar",
      "Select the properties you want to export",
      "Click Actions → Export CSV",
      "Open the CSV in Excel or Google Sheets",
      "Copy your data into the Leasely template below",
    ],
  },
  {
    id: "appfolio",
    name: "AppFolio",
    logo: "AF",
    color: "#2563EB",
    instructions: [
      "Sign in to your AppFolio account",
      "Go to Reports → Property Reports → Unit List",
      "Set the date range and click Run Report",
      "Click Export → Download CSV",
      "Map the columns into the Leasely template below",
    ],
  },
  {
    id: "buildium",
    name: "Buildium",
    logo: "Bu",
    color: "#7C3AED",
    instructions: [
      "Sign in to Buildium",
      "Navigate to Properties → Rentals",
      "Click the Export button (top right)",
      "Select CSV format and download",
      "Copy your property data into the Leasely template below",
    ],
  },
  {
    id: "rentec",
    name: "Rentec Direct",
    logo: "RD",
    color: "#D97706",
    instructions: [
      "Log into your Rentec Direct account",
      "Go to Properties in the top navigation",
      "Click Export → CSV at the top of the property list",
      "Download the file",
      "Copy your property data into the Leasely template below",
    ],
  },
  {
    id: "apartments",
    name: "Apartments.com / Cozy",
    logo: "A",
    color: "#16A34A",
    instructions: [
      "Log into your Apartments.com account",
      "Go to My Properties / Listings",
      "Use your browser to view listing details for each property",
      "Manually enter the data into our CSV template",
      "Alternatively, use Manual Entry below",
    ],
  },
  {
    id: "csv",
    name: "Generic CSV / Spreadsheet",
    logo: "CSV",
    color: "#475569",
    instructions: [
      "Download our import template using the button below",
      "Fill in your property data — one row per property",
      "Save as CSV and upload it here",
      "We'll parse and import all rows automatically",
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

// ── Manual Entry Row ──────────────────────────────────────────────────────────
type ManualRow = ReturnType<typeof csvRowToListing>;

const EMPTY_ROW = (): ManualRow => ({
  title: "", address: "", city: "", state: "", zip: "",
  monthlyRent: 0, bedrooms: "1", bathrooms: "1", propertyType: "apartment",
  description: "", securityDeposit: undefined, squareFeet: undefined,
  availableDate: "", petFriendly: false, parkingAvailable: false,
  washerDryer: false, airConditioning: false, dishwasher: false,
  utilities: "not_included", contactName: "", contactPhone: "",
});

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ImportListings() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0); // 0=platform, 1=instructions+upload, 2=preview, 3=done
  const [platform, setPlatform] = useState<typeof PLATFORMS[0] | null>(null);
  const [rows, setRows] = useState<ManualRow[]>([EMPTY_ROW()]);
  const [parsedListings, setParsedListings] = useState<ManualRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, string[]>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.marketplace.importListings.useMutation();

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rawRows = parseCSV(text);
      if (rawRows.length === 0) {
        toast.error("No data found in CSV. Check the file format.");
        return;
      }
      const listings = rawRows.map(csvRowToListing);
      const errs: Record<number, string[]> = {};
      listings.forEach((l, i) => {
        const e = validateListing(l);
        if (e.length) errs[i] = e;
      });
      setParsedListings(listings);
      setRowErrors(errs);
      setStep(2);
    };
    reader.readAsText(file);
  }, []);

  const handleManualNext = () => {
    const errs: Record<number, string[]> = {};
    rows.forEach((l, i) => {
      const e = validateListing(l);
      if (e.length) errs[i] = e;
    });
    setRowErrors(errs);
    setParsedListings(rows);
    setStep(2);
  };

  const handleImport = async () => {
    const valid = parsedListings.filter((_, i) => !rowErrors[i]);
    if (!valid.length) {
      toast.error("No valid listings to import.");
      return;
    }
    setImporting(true);
    try {
      const result = await importMutation.mutateAsync({ listings: valid });
      setImportResult(result);
      setStep(3);
    } catch (err: any) {
      if (err?.message === "UPGRADE_REQUIRED") {
        toast.error("You've reached your free plan limit. Upgrade to Pro to import unlimited listings.");
      } else {
        toast.error("Import failed. Please try again.");
      }
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedListings.filter((_, i) => !rowErrors[i]).length;
  const errorCount = parsedListings.length - validCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Upload className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Import Properties</h1>
              <p className="text-gray-500 text-sm">Port your listings from any platform in minutes</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-6">
            {["Choose Platform", "Get Data", "Preview", "Done"].map((label, i) => (
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

        {/* ── Step 0: Choose Platform ─────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Where are your listings currently?</h2>
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
          </div>
        )}

        {/* ── Step 1: Instructions + Upload ──────────────────────────────── */}
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
                    {platform.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600">
                        <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: `${ACCENT}20`, color: ACCENT }}>
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>

                  <div className="border-t border-gray-100 pt-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">Step 1 — Download our template</h3>
                      <p className="text-xs text-gray-500 mb-2">Copy your export data into this template (one property per row).</p>
                      <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
                        <Download className="h-3.5 w-3.5" /> Download CSV Template
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">Step 2 — Upload filled template</h3>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                      />
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50/30 transition-all group"
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-300 group-hover:text-green-500 transition-colors" />
                        <p className="text-sm font-medium text-gray-500 group-hover:text-green-600">Click to upload CSV</p>
                        <p className="text-xs text-gray-400 mt-1">Filled Leasely import template only</p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Manual Entry */
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Enter your properties one at a time. Click "Add Another" to add more rows.</p>
                  <div className="space-y-4">
                    {rows.map((row, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative">
                        {rows.length > 1 && (
                          <button onClick={() => setRows(r => r.filter((_, j) => j !== i))}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Property {i + 1}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { label: "Title", key: "title", type: "text", placeholder: "2BR Near Downtown" },
                            { label: "Address", key: "address", type: "text", placeholder: "123 Main St" },
                            { label: "City", key: "city", type: "text", placeholder: "Austin" },
                            { label: "State", key: "state", type: "text", placeholder: "TX" },
                            { label: "ZIP", key: "zip", type: "text", placeholder: "78701" },
                            { label: "Monthly Rent ($)", key: "monthlyRent", type: "number", placeholder: "1500" },
                            { label: "Bedrooms", key: "bedrooms", type: "text", placeholder: "2" },
                            { label: "Bathrooms", key: "bathrooms", type: "text", placeholder: "1" },
                            { label: "Contact Name", key: "contactName", type: "text", placeholder: "Jane Smith" },
                            { label: "Contact Phone", key: "contactPhone", type: "text", placeholder: "555-123-4567" },
                          ].map(field => (
                            <div key={field.key}>
                              <label className="text-xs font-medium text-gray-500 mb-1 block">{field.label}</label>
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={(row as any)[field.key] ?? ""}
                                onChange={e => setRows(r => r.map((row2, j) =>
                                  j === i ? { ...row2, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value } : row2
                                ))}
                                className="w-full h-8 rounded-lg border border-gray-200 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-4 mt-3">
                          {(["petFriendly", "parkingAvailable", "washerDryer", "airConditioning", "dishwasher"] as const).map(field => (
                            <label key={field} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                              <input type="checkbox" checked={!!row[field]}
                                onChange={e => setRows(r => r.map((row2, j) => j === i ? { ...row2, [field]: e.target.checked } : row2))}
                                className="rounded" />
                              {field === "petFriendly" ? "Pet OK" : field === "parkingAvailable" ? "Parking" : field === "washerDryer" ? "W/D" : field === "airConditioning" ? "A/C" : "Dishwasher"}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-2 w-full" onClick={() => setRows(r => [...r, EMPTY_ROW()])}>
                      <Plus className="h-3.5 w-3.5" /> Add Another Property
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

        {/* ── Step 2: Preview ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Review Your Listings</h2>
                <p className="text-sm text-gray-500">{parsedListings.length} found · <span className="text-green-600 font-medium">{validCount} ready to import</span>{errorCount > 0 && <> · <span className="text-red-500 font-medium">{errorCount} have errors</span></>}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5" /> Template
              </Button>
            </div>

            <div className="space-y-3">
              {parsedListings.map((l, i) => {
                const errs = rowErrors[i] ?? [];
                const hasError = errs.length > 0;
                return (
                  <div key={i} className={`bg-white rounded-xl border p-4 ${hasError ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${hasError ? "bg-red-100" : "bg-green-100"}`}>
                          {hasError ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Building2 className="h-4 w-4 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{l.title || <span className="text-gray-400 italic">No title</span>}</p>
                          <p className="text-xs text-gray-500">{[l.address, l.city, l.state, l.zip].filter(Boolean).join(", ")}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{l.bedrooms}bd · {l.bathrooms}ba · ${l.monthlyRent?.toLocaleString()}/mo</p>
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
                          setParsedListings(p => p.filter((_, j) => j !== i));
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

            {parsedListings.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>All listings removed. Go back to re-upload.</p>
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
                {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing…</> : <><Upload className="h-4 w-4" /> Import {validCount} Listing{validCount !== 1 ? "s" : ""}</>}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Done ──────────────────────────────────────────────── */}
        {step === 3 && importResult && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}20` }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: ACCENT }} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Import Complete!</h2>
            <p className="text-gray-500 mb-6">
              {importResult.imported} listing{importResult.imported !== 1 ? "s" : ""} successfully imported to your dashboard.
            </p>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 text-left mb-6">
                <p className="text-sm font-semibold text-red-600 mb-2">{importResult.errors.length} listing{importResult.errors.length !== 1 ? "s" : ""} failed:</p>
                <ul className="space-y-1">
                  {importResult.errors.map((e, i) => <li key={i} className="text-xs text-red-500">{e}</li>)}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button style={{ background: ACCENT, color: "#3A2410" }} className="font-bold gap-2 w-full sm:w-auto">
                  <BarChart3 className="h-4 w-4" /> View Dashboard
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 w-full sm:w-auto"
                onClick={() => { setParsedListings([]); setRows([EMPTY_ROW()]); setPlatform(null); setImportResult(null); setStep(0); }}>
                <Upload className="h-4 w-4" /> Import More
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
