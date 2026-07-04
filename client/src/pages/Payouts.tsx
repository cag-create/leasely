import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Landmark, CreditCard, Zap, ExternalLink, CheckCircle2, Clock,
  Loader2, ShieldCheck, DollarSign,
} from "lucide-react";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

const fmt = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Payouts() {
  const utils = trpc.useUtils();

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } =
    trpc.marketplace.getStripeConnectStatus.useQuery(undefined, { retry: false });
  const { data: bank, refetch: refetchBank } =
    trpc.marketplace.getBankAccount.useQuery(undefined, { retry: false });
  const { data: balance, refetch: refetchBalance } =
    trpc.marketplace.getAvailableBalance.useQuery(undefined, { retry: false });

  const isActive = status?.status === "active";
  const isPending = status?.status === "pending";

  // Handle return from Stripe onboarding (?stripe=success / refresh).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe")) {
      refetchStatus();
      refetchBank();
      refetchBalance();
      window.history.replaceState({}, "", "/payouts");
    }
  }, [refetchStatus, refetchBank, refetchBalance]);

  const connectMutation = trpc.marketplace.createStripeConnectLink.useMutation({
    onSuccess: (d) => { if (d.url) window.location.href = d.url; },
    onError: (e) => toast.error(e.message),
  });

  const loginLinkMutation = trpc.marketplace.createExpressLoginLink.useMutation({
    onSuccess: (d) => { if (d.url) window.open(d.url, "_blank"); },
    onError: (e) => toast.error(e.message),
  });

  const payoutMutation = trpc.marketplace.requestInstantPayout.useMutation({
    onSuccess: (d: any) => {
      toast.success(d.note ?? `Payout of ${fmt(d.amountCents ?? 0)} initiated — funds arrive instantly.`);
      utils.marketplace.getAvailableBalance.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const availableCents = balance?.availableCents ?? 0;
  const pendingCents = balance?.pendingCents ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: BRAND }}>Payouts &amp; Banking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect your bank to collect rent directly. Powered by Stripe Connect — your bank
            details are stored securely at Stripe, never on Leasely.
          </p>
        </div>

        {statusLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : !isActive ? (
          /* ── Not connected / pending onboarding ── */
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#4F46E5]/10 flex items-center justify-center mx-auto mb-4">
              <Landmark className="h-7 w-7" style={{ color: ACCENT }} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {isPending ? "Finish connecting your bank" : "Connect your bank account"}
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              {isPending
                ? "Stripe still needs a few details before payouts turn on. Pick up where you left off."
                : "Add your bank once and rent from every tenant deposits straight to you. Tenants pay free by ACH; you get instant payouts."}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-left">
              {["Direct bank deposits", "Instant payouts", "Free ACH for tenants", "Full payout history"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="font-bold gap-2 text-white"
              style={{ background: ACCENT }}
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
            >
              {connectMutation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening Stripe…</>
                : <><CreditCard className="h-4 w-4" /> {isPending ? "Continue setup" : "Connect Bank Account"}</>}
            </Button>
            <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Bank-level security · Stripe Connect
            </p>
          </div>
        ) : (
          /* ── Active ── */
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Bank account card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Deposit account</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
                {bank?.connected && bank.bank ? (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Landmark className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{bank.bank.bankName ?? "Bank account"}</p>
                      <p className="text-sm text-gray-500 font-mono">
                        •••• {bank.bank.last4 ?? "----"}
                        {bank.bank.routingLast4 ? ` · routing ••••${bank.bank.routingLast4}` : ""}
                        {" · "}{bank.bank.currency}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Payouts are enabled but no bank account is on file yet. Add one at Stripe.
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={() => loginLinkMutation.mutate()}
                  disabled={loginLinkMutation.isPending}
                >
                  {loginLinkMutation.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <ExternalLink className="h-3.5 w-3.5" />}
                  Manage bank &amp; view history at Stripe
                </Button>
              </div>

              {/* Balance + instant payout card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Balance</span>
                <div className="flex items-end gap-6 mt-3 mb-4">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: BRAND }}>{fmt(availableCents)}</p>
                    <p className="text-xs text-gray-500">Available now</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-400">{fmt(pendingCents)}</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                </div>
                <Button
                  className="w-full font-bold gap-2 text-white"
                  style={{ background: ACCENT }}
                  onClick={() => payoutMutation.mutate({})}
                  disabled={payoutMutation.isPending || availableCents < 100}
                >
                  {payoutMutation.isPending
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                    : <><Zap className="h-4 w-4" /> Instant Payout</>}
                </Button>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Instant to debit card, or 1–2 business days (standard).
                </p>
              </div>
            </div>

            {/* Fee disclosure */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> Payout costs
              </p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li className="flex justify-between gap-4"><span>Instant payout (Pro)</span><span className="font-semibold text-gray-900">$1.00 flat</span></li>
                <li className="flex justify-between gap-4"><span>Standard payout (1–2 business days)</span><span className="font-semibold text-emerald-700">Free</span></li>
                <li className="flex justify-between gap-4"><span>Tenant ACH rent payment</span><span className="font-semibold text-emerald-700">Free</span></li>
              </ul>
              <p className="text-[11px] text-gray-400 mt-3">
                Stripe's own instant-payout fee (~1.5%) applies at the network level and is set by Stripe.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
