import { createContext, useContext } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const BRAND = "#1B2B5E";
export const ACCENT = "#4F46E5";

export const fmt = (cents: number | null | undefined) => {
  const c = cents ?? 0;
  const s = `$${(Math.abs(c) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return c < 0 ? `-${s}` : s;
};
export const toCents = (dollars: string) => {
  const n = Number(String(dollars).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
export const today = () => new Date().toISOString().slice(0, 10);
export const thisMonth = () => new Date().toISOString().slice(0, 7);
export const lastMonth = () => {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
};

export type Perms = { view: boolean; receipts: boolean; disburse: boolean; reconcile: boolean; owners: boolean };
export type Book = { pmUserId: number; name: string; own: boolean; perms: Perms };

export const BookContext = createContext<{ book: Book | null; bookUserId: number | undefined }>({ book: null, bookUserId: undefined });
export const useBook = () => useContext(BookContext);

export function Stat({ label, value, tone, hint }: { label: string; value: string; tone?: "warn" | "bad" | "good"; hint?: string }) {
  const color = tone === "bad" ? "#b91c1c" : tone === "warn" ? "#b45309" : tone === "good" ? "#047857" : BRAND;
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      {hint && <div className="text-[11px] text-gray-400 mt-0.5">{hint}</div>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-600">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export function MoneyInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
      <Input inputMode="decimal" className="pl-6" value={value} placeholder={placeholder ?? "0.00"} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Select({ value, onChange, children, className }: { value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <select className={`h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm ${className ?? ""}`} value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  );
}

export const METHOD_LABEL: Record<string, string> = { stripe: "Stripe", ach: "ACH", check: "Check", wire: "Wire", cash: "Cash", transfer: "Transfer", bank: "Bank", other: "Other" };

export function downloadBase64(base64: string, fileName: string, mime = "application/pdf") {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadCsv(rows: (string | number | null | undefined)[][], fileName: string) {
  const csv = rows.map((r) => r.map((v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function Section({ title, desc, action, children }: { title: string; desc?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">{children}</div>;
}
