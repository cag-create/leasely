import { useRef, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2, FileText, Home, DollarSign, Calendar, Shield, Loader2, ExternalLink, AlertTriangle
} from "lucide-react";
import { LOGO_URL } from "@/lib/brand";
import { openLeasePrintView } from "@/lib/leasePrint";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function JourneyFooter({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const steps = [
    { n: 1, label: "Sign" },
    { n: 2, label: "Landlord countersigns" },
    { n: 3, label: "Pay" },
    { n: 4, label: "Move in" },
  ];
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-lg mx-auto px-4 py-2.5">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mb-1.5">What happens next</p>
        <div className="flex items-center gap-1 overflow-x-auto">
          {steps.map((s, i) => {
            const done = s.n < currentStep;
            const active = s.n === currentStep;
            return (
              <div key={s.n} className="flex items-center gap-1 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                    done ? "bg-emerald-100 text-emerald-800"
                    : active ? "text-white"
                    : "bg-gray-100 text-gray-500"
                  }`}
                  style={active ? { background: ACCENT, color: "#3A2410" } : undefined}
                >
                  {done ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 inline-flex items-center justify-center rounded-full bg-black/10 text-[9px]">{s.n}</span>}
                  {s.label}
                </div>
                {i < steps.length - 1 && <span className="text-gray-300 text-xs">›</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TenantSignLease() {
  const { id } = useParams<{ id: string }>();
  const leaseId = id ? parseInt(id) : null;
  const [email, setEmail] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signed, setSigned] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const docFrameRef = useRef<HTMLIFrameElement>(null);

  const leaseQuery = trpc.leases.getForSigning.useMutation({
    onError: (e) => toast.error(e.message),
  });
  const lease = leaseQuery.data;

  const signMutation = trpc.leases.sign.useMutation({
    onSuccess: () => {
      setSigned(true);
      toast.success("Signed! Your landlord will countersign next, then we'll email you next steps.");
    },
    onError: (e) => {
      toast.error(e.message);
      // The lease changed under us — reload the latest version to review.
      if (e.data?.code === "CONFLICT" && leaseId) leaseQuery.mutate({ leaseId, tenantEmail: email.trim() });
    },
  });

  // Size the (script-free, sandboxed) lease frame to its content so the
  // whole lease scrolls inside one box instead of a frame-within-a-frame.
  const fitDocFrame = () => {
    const f = docFrameRef.current;
    const body = f?.contentDocument?.body;
    if (f && body) f.style.height = `${body.scrollHeight + 32}px`;
  };

  if (!leaseId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Invalid lease link</h2>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Signature Received</h2>
          <p className="text-gray-600 mb-4">
            Your signature is on file. Your landlord will <strong>countersign</strong> next — once they do, we'll email you payment and move-in instructions automatically.
          </p>
          <ol className="text-left text-sm text-gray-600 space-y-2 mb-6 bg-gray-50 rounded-xl p-4">
            <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">1.</span> Your landlord <strong>countersigns</strong> the lease</li>
            <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">2.</span> You receive an email with a secure link to pay your <strong>security deposit + first month's rent</strong> (if not already paid)</li>
            <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">3.</span> Lease is fully executed and goes <strong>active</strong></li>
            <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">4.</span> You receive <strong>move-in access instructions</strong> (lockbox code, key pickup, or in-person handoff)</li>
          </ol>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 mb-4">
            <strong>Note:</strong> Your signature is conditional until your landlord countersigns and any required move-in payment clears.
          </div>
          <div className="flex gap-2 mb-4">
            <Button
              className="flex-1 font-bold gap-2 py-2.5"
              style={{ background: BRAND, color: "white" }}
              onClick={() => {
                // Send the tenant straight to their portal. If they don't yet
                // have a session token (first time on this device), the signin
                // page handles bootstrapping from the magic-link.
                const hasToken = typeof window !== "undefined" && !!localStorage.getItem("leasely_tenant_token");
                window.location.href = hasToken ? "/tenant/dashboard" : "/tenant-portal/signin";
              }}
            >
              <Home className="w-4 h-4" /> Go to My Tenant Portal
            </Button>
          </div>
          <p className="text-sm text-gray-400">Powered by <strong style={{ color: BRAND }}>Keycove</strong></p>
        </div>
        <JourneyFooter currentStep={2} />
      </div>
    );
  }

  const leaseTermLabel = (t: string | null) => (t ? t.replace(/_/g, " ") : "—");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <img src={LOGO_URL} alt="Keycove" className="h-7 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-black text-lg" style={{ color: BRAND }}>Keycove</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">Lease Agreement</span>
        </div>
      </header>

      <div className={`${lease?.document ? "max-w-3xl" : "max-w-lg"} mx-auto px-4 py-8`}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${BRAND}, #0d3a2a)` }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-white">{lease ? "Review & Sign Your Lease" : "Sign Your Lease"}</h1>
            </div>
            <p className="text-white/70 text-sm">
              {lease ? lease.propertyAddress : "Enter the email address on your lease to open it."}
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Step 1 — verify email and load the lease */}
            {!lease && (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-emerald-900 mb-1.5">How signing works</p>
                  <ol className="text-xs text-emerald-800 leading-relaxed space-y-1">
                    <li><strong>1.</strong> Open and read your full lease.</li>
                    <li><strong>2.</strong> Sign it with your typed name.</li>
                    <li><strong>3.</strong> Your landlord countersigns, then we email you a secure link for your security deposit + first month's rent (if not already paid).</li>
                    <li><strong>4.</strong> Lease goes active and you receive move-in access instructions.</li>
                  </ol>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5">Your Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="Enter the email on your lease"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && email.trim() && leaseId) leaseQuery.mutate({ leaseId, tenantEmail: email.trim() }); }}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-400 mt-1">Must match the email your landlord has on file.</p>
                </div>
                <Button
                  className="w-full font-bold gap-2 py-3 text-white"
                  style={{ background: ACCENT }}
                  disabled={!email.trim() || leaseQuery.isPending}
                  onClick={() => leaseQuery.mutate({ leaseId, tenantEmail: email.trim() })}
                >
                  {leaseQuery.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening...</> : <><FileText className="w-4 h-4" /> Open My Lease</>}
                </Button>
              </>
            )}

            {/* Not signable right now */}
            {lease && lease.status !== "sent" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                {lease.status === "draft"
                  ? "Your landlord hasn't sent this lease for signing yet. We'll email you as soon as it's ready."
                  : "This lease has already been signed. Check your email or your tenant portal for next steps."}
              </div>
            )}
            {lease && lease.status === "sent" && !lease.document && (
              <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <span>Your landlord hasn't attached the lease document yet, so there's nothing to sign. We've kept your place — you'll get an email when it's ready.</span>
              </div>
            )}

            {/* Step 2 — read the lease, then sign */}
            {lease && lease.status === "sent" && lease.document && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3"><div className="flex items-center gap-1 text-xs text-gray-500"><DollarSign className="w-3 h-3" />Monthly rent</div><div className="font-bold text-gray-900">{formatCents(lease.monthlyRent)}</div></div>
                  <div className="rounded-xl bg-gray-50 p-3"><div className="flex items-center gap-1 text-xs text-gray-500"><Shield className="w-3 h-3" />Deposit</div><div className="font-bold text-gray-900">{formatCents(lease.securityDeposit)}</div></div>
                  <div className="rounded-xl bg-gray-50 p-3"><div className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />Starts</div><div className="font-bold text-gray-900">{lease.leaseStartDate || "—"}</div></div>
                  <div className="rounded-xl bg-gray-50 p-3"><div className="flex items-center gap-1 text-xs text-gray-500"><Home className="w-3 h-3" />Term</div><div className="font-bold text-gray-900 capitalize">{leaseTermLabel(lease.leaseTerm)}</div></div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Your lease — please read it in full</p>
                  {lease.document.html ? (
                    <div className="space-y-2">
                    <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-gray-200 bg-white">
                      {/* sandbox without allow-scripts: lease HTML can never run code */}
                      <iframe
                        ref={docFrameRef}
                        title="Lease agreement"
                        sandbox="allow-same-origin"
                        srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,serif;font-size:14px;line-height:1.6;color:#111;padding:16px 20px;margin:0}h1,h2,h3{font-family:system-ui,sans-serif}</style></head><body>${lease.document.html}</body></html>`}
                        onLoad={fitDocFrame}
                        className="w-full block"
                        style={{ height: 600, border: 0 }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const ok = openLeasePrintView(
                          lease.document!.html!,
                          "Lease agreement",
                          `Document fingerprint: ${lease.document!.fingerprint}`,
                        );
                        if (!ok) toast.error("Pop-up blocked. Allow pop-ups for this site to print or save the lease.");
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: ACCENT }}
                    >
                      <FileText className="w-3.5 h-3.5" /> Print or save as PDF
                    </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <iframe
                        title="Lease agreement"
                        src={lease.document.fileUrl ?? undefined}
                        className="w-full rounded-xl border border-gray-200"
                        style={{ height: "60vh" }}
                      />
                      <a href={lease.document.fileUrl ?? "#"} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
                        Open {lease.document.filename ?? "the lease"} in a new tab <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Electronic Signature Notice:</strong> By signing below, you agree that your electronic signature is legally binding and has the same force and effect as a handwritten signature. This lease becomes effective only after your landlord countersigns and any required security deposit / first month's rent has cleared.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5">Type Your Full Legal Name as Your Signature *</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Jane Q. Doe"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    className="rounded-xl font-serif italic text-lg"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-400 mt-1">This typed name is your legally binding electronic signature and will appear on the executed lease.</p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    I have read the lease above and agree to its terms. I understand this is a legally binding electronic signature.
                  </span>
                </label>

                <Button
                  className="w-full font-bold gap-2 py-3 text-white"
                  style={{ background: ACCENT }}
                  disabled={signatureName.trim().length < 2 || !confirmed || signMutation.isPending}
                  onClick={() => {
                    if (!leaseId || !lease.document) return;
                    signMutation.mutate({
                      leaseId,
                      tenantEmail: email.trim(),
                      signatureName: signatureName.trim(),
                      leaseDocumentId: lease.document.id,
                      documentFingerprint: lease.document.fingerprint,
                    });
                  }}
                >
                  {signMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing...</>
                    : <><CheckCircle2 className="w-4 h-4" /> Sign Lease Agreement</>
                  }
                </Button>
              </>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Secured and encrypted by Keycove. Your information is never shared.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 pb-24">Powered by <strong style={{ color: BRAND }}>Keycove</strong> — The AI-Powered Landlord OS</p>
      </div>
      <JourneyFooter currentStep={1} />
    </div>
  );
}
