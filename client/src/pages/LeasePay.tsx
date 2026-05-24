import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Lock, Loader2, Home, Wallet, Receipt } from "lucide-react";

const BRAND = "#1B2B5E";
const ACCENT = "#F5A623";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png";

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function LeasePay() {
  const { id } = useParams<{ id: string }>();
  const leaseId = id ? parseInt(id) : 0;

  const params = new URLSearchParams(window.location.search);
  const queryEmail = params.get("email") ?? "";
  const queryKind = (params.get("kind") as "rent" | "deposit" | null) ?? null;

  const [email, setEmail] = useState(queryEmail);
  const [confirmed, setConfirmed] = useState(!!queryEmail);
  const [submitting, setSubmitting] = useState<"rent" | "deposit" | null>(null);

  const { data: lease, isLoading, error } = trpc.leases.getForPayment.useQuery(
    { leaseId, tenantEmail: email },
    { enabled: !!leaseId && confirmed && !!email }
  );

  const createSession = trpc.leases.createPaymentSession.useMutation({
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        toast.error("Could not start checkout. Try again.");
        setSubmitting(null);
      }
    },
    onError: (err) => {
      toast.error(err.message);
      setSubmitting(null);
    },
  });

  // Auto-launch a kind once lease loads, if kind is in the URL
  useEffect(() => {
    if (!queryKind || !lease || submitting) return;
    if (queryKind === "rent" && lease.firstMonthPaid) return;
    if (queryKind === "deposit" && lease.depositPaid) return;
  }, [queryKind, lease, submitting]);

  if (!leaseId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Invalid payment link.</p>
      </div>
    );
  }

  if (!confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 w-full max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <img src={LOGO_URL} alt="Leasely" className="h-7" />
            <span className="font-black" style={{ color: BRAND }}>Leasely</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Confirm your email</h1>
          <p className="text-sm text-gray-500 mb-4">Enter the email on your lease to load your payment summary.</p>
          <Label className="text-sm">Email address</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1.5 mb-4"
          />
          <Button
            disabled={!email.trim()}
            onClick={() => setConfirmed(true)}
            className="w-full font-bold"
            style={{ background: ACCENT, color: "#3A2410" }}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-md">
          <p className="text-gray-700 font-semibold mb-1">We couldn't find that lease.</p>
          <p className="text-sm text-gray-500">Please double-check the email matches the one your landlord has on file.</p>
        </div>
      </div>
    );
  }

  const needsDeposit = lease.securityDeposit > 0;
  const allPaid = lease.firstMonthPaid && (!needsDeposit || lease.depositPaid);

  function pay(kind: "rent" | "deposit") {
    setSubmitting(kind);
    createSession.mutate({ leaseId, tenantEmail: email, kind });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <img src={LOGO_URL} alt="Leasely" className="h-7" />
          <span className="font-black" style={{ color: BRAND }}>Leasely</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">Move-in payments</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${BRAND}, #0d3a2a)` }}>
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-5 h-5 text-white" />
              <h1 className="text-lg font-black text-white">{lease.propertyAddress}</h1>
            </div>
            <p className="text-white/70 text-sm">Hi {lease.tenantName}, finish your move-in below.</p>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
              <strong>How this works:</strong> Pay your security deposit and first month's rent. Once both clear, your landlord will countersign and your lease becomes fully effective.
            </div>

            {/* Deposit */}
            {needsDeposit && (
              <div className={`rounded-xl border p-4 flex items-center gap-3 ${lease.depositPaid ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: lease.depositPaid ? "#10b98120" : "#1B2B5E10" }}>
                  {lease.depositPaid ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Wallet className="w-5 h-5" style={{ color: BRAND }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">Security deposit</p>
                  <p className="text-xs text-gray-500">{fmt(lease.securityDeposit)}{lease.depositPaid ? " · paid" : ""}</p>
                </div>
                {!lease.depositPaid && (
                  <Button
                    size="sm"
                    onClick={() => pay("deposit")}
                    disabled={!!submitting}
                    style={{ background: ACCENT, color: "#3A2410" }}
                    className="font-bold"
                  >
                    {submitting === "deposit" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pay"}
                  </Button>
                )}
              </div>
            )}

            {/* Rent */}
            <div className={`rounded-xl border p-4 flex items-center gap-3 ${lease.firstMonthPaid ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: lease.firstMonthPaid ? "#10b98120" : "#1B2B5E10" }}>
                {lease.firstMonthPaid ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Receipt className="w-5 h-5" style={{ color: BRAND }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">First month's rent</p>
                <p className="text-xs text-gray-500">{fmt(lease.monthlyRent)}{lease.firstMonthPaid ? " · paid" : ""}</p>
              </div>
              {!lease.firstMonthPaid && (
                <Button
                  size="sm"
                  onClick={() => pay("rent")}
                  disabled={!!submitting}
                  style={{ background: ACCENT, color: "#3A2410" }}
                  className="font-bold"
                >
                  {submitting === "rent" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pay"}
                </Button>
              )}
            </div>

            {allPaid && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
                <strong>All set.</strong> Your landlord has been notified to countersign. You'll get an email with move-in instructions once they do.
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Payments secured by Stripe. Leasely never sees your card details.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <strong style={{ color: BRAND }}>Leasely</strong> — The AI-Powered Landlord OS ·{" "}
          <Link href="/legal/terms"><a className="underline">Terms</a></Link> ·{" "}
          <Link href="/legal/privacy"><a className="underline">Privacy</a></Link>
        </p>
      </div>
    </div>
  );
}
