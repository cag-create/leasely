// LeasePreview — renders a draft lease document, surfaces warnings + unresolved variables,
// requires the landlord to acknowledge the legal disclaimer before sending to the tenant.
//
// Route: /leases/draft/:id

import { useState, useMemo, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertTriangle, FileText, Send, ShieldAlert, Pencil, ChevronDown, ChevronUp } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  landlord_name: "Landlord Name on Lease",
  landlord_company: "Company / DBA",
  landlord_address: "Landlord / Company Address",
  monthly_rent: "Monthly Rent ($)",
  security_deposit: "Security Deposit ($)",
  occupants: "Authorized Occupants",
  rent_due_day: "Rent Due Day",
  late_fee: "Late Fee Amount",
  utilities: "Utilities",
  pets_allowed: "Pets Allowed",
  parking: "Parking",
  payment_methods: "Accepted Payment Methods",
};

const FIELD_HINTS: Record<string, string> = {
  landlord_name: "e.g. Jane Smith",
  landlord_company: "e.g. Redrock Property Group LLC (optional)",
  landlord_address: "e.g. 123 Main St, Memphis, TN 38115",
  monthly_rent: "e.g. 1600",
  security_deposit: "e.g. 1600",
  occupants: "e.g. 2 adults",
  rent_due_day: "e.g. 1st",
  late_fee: "e.g. $150.00",
  utilities: "e.g. Tenant pays all utilities",
  pets_allowed: "e.g. No pets allowed",
  parking: "e.g. 1 assigned parking space",
  payment_methods: "e.g. Leasely tenant portal, ACH / direct deposit, Check, Money order",
};

// Fields that always appear in the edit panel with their current value
// pre-filled, even when they already have a value. Landlords need to be able
// to revise monetary amounts and names per-lease.
const ALWAYS_EDITABLE = ["landlord_name", "monthly_rent", "security_deposit"];

export default function LeasePreview() {
  const [, params] = useRoute("/leases/draft/:id");
  const [, navigate] = useLocation();
  const id = Number(params?.id);

  const [acknowledged, setAcknowledged] = useState(false);
  const [showFillPanel, setShowFillPanel] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const utils = (trpc as any).useUtils();
  const docQuery = (trpc as any).leaseDocs.get.useQuery({ id }, { enabled: Number.isFinite(id) && id > 0 });
  const ackMut = (trpc as any).leaseDocs.markDisclaimerAcknowledged.useMutation();
  const fillMut = (trpc as any).leaseDocs.fillFields.useMutation({
    onSuccess: () => {
      toast.success("Lease updated — fields filled.");
      utils.leaseDocs.get.invalidate({ id });
      // Do NOT clear fieldValues here — clearing resets state to {} which makes
      // Object.values({}).every(...) return true, disabling the Save button and
      // preventing the landlord from making a second edit without a page reload.
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });
  const sendMut = (trpc as any).leaseDocs.send.useMutation({
    onSuccess: () => {
      toast.success("Lease sent — the tenant will receive a signing link by email.");
      navigate("/leases");
    },
    onError: (e: any) => toast.error(e.message ?? "Send failed"),
  });

  const doc = docQuery.data?.document;
  const vars = (() => {
    try { return doc?.variableValues ? JSON.parse(doc.variableValues) : {}; } catch { return {}; }
  })();
  const tenantEmail: string | undefined = vars?.tenant_email;

  // Computed early so the send handlers can guard against unresolved placeholders.
  const unresolvedCount =
    typeof doc?.renderedHtml === "string"
      ? (doc.renderedHtml.match(/class="lease-unresolved"/g) ?? []).length
      : 0;

  // Fields to show in the fill panel — derived from stored variable values rather
  // than the rendered HTML so that blank-string values are caught even when
  // renderTemplate already substituted them as empty text (no red marker).
  const fieldsToFill = useMemo(() => {
    return Object.keys(FIELD_LABELS).filter(f => {
      if (ALWAYS_EDITABLE.includes(f)) return false; // rendered separately below
      const v = (vars as Record<string, unknown>)[f];
      return v === undefined || v === null || (typeof v === "string" && !v.trim());
    });
  }, [vars]);

  // Auto-open the fill panel as soon as the doc loads with any unfilled fields.
  useEffect(() => {
    if (unresolvedCount > 0 || fieldsToFill.length > 0) setShowFillPanel(true);
  }, [unresolvedCount, fieldsToFill.length]);

  const handleDownload = () => {
    if (!doc) return;
    if (doc.source === "uploaded" && doc.uploadedFileUrl) {
      window.open(doc.uploadedFileUrl, "_blank", "noopener");
      return;
    }
    // Open a print-to-PDF view in a new tab. The user's browser print dialog
    // can then "Save as PDF" — works on all major desktop browsers without a
    // server-side headless Chrome dependency.
    const html = doc.renderedHtml ?? "";
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Pop-up blocked. Allow pop-ups for this site to download.");
      return;
    }
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Lease #${doc.id}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 8.5in; margin: 0.75in auto; line-height: 1.55; color: #111; }
  h1 { font-size: 1.5rem; margin: 1rem 0 0.75rem; }
  h2 { font-size: 1.1rem; margin: 1.25rem 0 0.5rem; }
  section { margin: 0.75rem 0; }
  p { margin: 0.5rem 0; }
  .lease-unresolved { background:#fee; color:#b00020; padding:0 4px; border-radius:3px; font-weight:600; }
  .legal-disclaimer { font-size: 0.85rem; color: #666; margin-top: 1.5rem; border-top: 1px solid #ddd; padding-top: 1rem; }
  @media print { @page { margin: 0.75in; } }
</style>
</head><body>${html}<script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`);
    win.document.close();
  };

  const handleSend = async () => {
    if (!acknowledged) {
      toast.error("You must acknowledge the legal disclaimer before sending.");
      return;
    }
    if (unresolvedCount > 0) {
      toast.error("Fill in the highlighted placeholders before sending.");
      return;
    }
    try {
      await ackMut.mutateAsync({ id });
      await sendMut.mutateAsync({ id });
    } catch (e: any) {
      // toast handled by onError
    }
  };

  // Auto-send the lease the moment the landlord ticks the disclaimer.
  const handleAcknowledge = (checked: boolean) => {
    setAcknowledged(checked);
    if (!checked) return;
    if (unresolvedCount > 0) {
      toast.error("Fill in the highlighted placeholders before sending.");
      return;
    }
    // Defer one tick so the checkbox state visibly toggles before the send fires.
    setTimeout(() => { handleSend(); }, 0);
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p>Invalid lease draft id.</p>
        </div>
      </div>
    );
  }

  if (docQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 flex items-center text-muted-foreground">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading draft…
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p>Draft not found.</p>
        </div>
      </div>
    );
  }

  const isUploaded = doc.source === "uploaded";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Lease draft #{doc.id}</h1>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{doc.status}</span>
              {tenantEmail && <> · Tenant: {tenantEmail}</>}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/leases")}>← Back to Leases</Button>
        </div>

        {/* Fill Required Fields panel */}
        <Card className="mb-4 border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <button
              className="w-full flex items-start gap-3 text-left"
              onClick={() => setShowFillPanel(v => !v)}
            >
              <Pencil className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-amber-900">
                  {(() => {
                    const landlordMissing = !(vars?.landlord_name as string | undefined)?.trim();
                    const total = fieldsToFill.length + (landlordMissing ? 1 : 0);
                    return total > 0
                      ? `${total} required field${total === 1 ? "" : "s"} unfilled — click to fill`
                      : "Edit lease fields (landlord name, utilities, etc.)";
                  })()}
                </p>
                {(unresolvedCount > 0 || fieldsToFill.length > 0) && (
                  <p className="text-amber-700 mt-0.5">Fill them here before sending to the tenant.</p>
                )}
              </div>
              {showFillPanel ? <ChevronUp className="h-4 w-4 text-amber-600 shrink-0" /> : <ChevronDown className="h-4 w-4 text-amber-600 shrink-0" />}
            </button>

            {showFillPanel && (
              <div className="mt-4 border-t border-amber-200 pt-4 space-y-3">
                {/* Always-editable fields — pre-filled with the current stored
                    value so the landlord can override per-lease (e.g. fix a
                    deposit that was copied from the listing). */}
                {ALWAYS_EDITABLE.map(field => {
                  const stored = (vars as Record<string, unknown>)[field];
                  const currentValue = fieldValues[field] ?? (stored != null ? String(stored) : "");
                  return (
                    <div key={field}>
                      <Label className="text-xs font-semibold text-gray-700">
                        {FIELD_LABELS[field]}
                      </Label>
                      <Input
                        className="mt-1 text-sm"
                        placeholder={FIELD_HINTS[field]}
                        value={currentValue}
                        onChange={e => setFieldValues(v => ({ ...v, [field]: e.target.value }))}
                      />
                    </div>
                  );
                })}
                {/* Unfilled fields (derived from stored vars, not rendered HTML) */}
                {fieldsToFill.map(field => (
                  <div key={field}>
                    <Label className="text-xs font-semibold text-gray-700">
                      {FIELD_LABELS[field] ?? field.replace(/_/g, " ")}
                    </Label>
                    <Input
                      className="mt-1 text-sm"
                      placeholder={FIELD_HINTS[field] ?? ""}
                      value={fieldValues[field] ?? ""}
                      onChange={e => setFieldValues(v => ({ ...v, [field]: e.target.value }))}
                    />
                  </div>
                ))}
                <Button
                  className="w-full bg-[#1B2B5E] hover:bg-[#2D3F7C] text-white"
                  onClick={() => fillMut.mutate({ id, variables: Object.fromEntries(Object.entries(fieldValues).filter(([, v]) => v.trim() !== "")) })}
                  disabled={fillMut.isPending || Object.values(fieldValues).every(v => !v.trim())}
                >
                  {fillMut.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving…</> : "Save & Re-render Lease"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isUploaded ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-10 w-10 mx-auto text-blue-600 mb-3" />
              <p className="font-medium mb-1">{doc.uploadedFilename}</p>
              <p className="text-xs text-muted-foreground mb-4">{doc.uploadedMimeType}</p>
              {doc.uploadedFileUrl && (
                <a
                  className="text-sm text-primary underline"
                  href={doc.uploadedFileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open uploaded lease
                </a>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6">
              <style>{`
                .lease-unresolved { background:#fee; color:#b00020; padding:0 4px; border-radius:3px; font-weight:600; }
                .lease-preview h1 { font-size:1.5rem; font-weight:700; margin: 1rem 0 .75rem; }
                .lease-preview h2 { font-size:1.1rem; font-weight:600; margin: 1.25rem 0 .5rem; }
                .lease-preview section { margin: .75rem 0; }
                .lease-preview p { line-height: 1.6; margin: .5rem 0; }
                .lease-preview ul, .lease-preview ol { padding-left: 1.5rem; margin: .5rem 0; }
                .lease-preview .signature-block { margin-top: 2rem; padding-top: 1rem; border-top:1px solid #eee; }
                .lease-preview .legal-disclaimer { font-size:.85rem; color:#666; margin-top:1.5rem; }
              `}</style>
              <div
                className="lease-preview text-sm"
                dangerouslySetInnerHTML={{ __html: doc.renderedHtml ?? "<p>(empty)</p>" }}
              />
            </CardContent>
          </Card>
        )}

        <Card className="border-amber-300">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Required acknowledgement before sending</p>
                <p className="text-muted-foreground">
                  Leasely is not a law firm and does not provide legal advice. The templates and any warnings are
                  general informational tools, not a substitute for review by a licensed attorney in the state where the
                  property is located. State law (including required disclosures, deposit caps, late fee limits, and
                  eviction procedure) controls — any lease term inconsistent with state law is unenforceable.
                </p>
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox
                checked={acknowledged}
                onCheckedChange={v => handleAcknowledge(Boolean(v))}
                disabled={sendMut.isPending || ackMut.isPending}
                className="mt-0.5"
              />
              <span className="text-sm">
                I understand Leasely does not provide legal advice, and I am responsible for ensuring this lease
                complies with the law of the state where the property is located.
              </span>
            </label>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/leases")}>Save for later</Button>
              <Button
                onClick={handleSend}
                disabled={!acknowledged || sendMut.isPending || unresolvedCount > 0}
              >
                {sendMut.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="h-4 w-4 mr-1.5" /> Send to tenant</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
