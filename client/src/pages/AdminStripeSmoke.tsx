import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Loader2, Shield, Zap } from "lucide-react";

/**
 * Admin-only Stripe Connect smoke test.
 *
 * Fires a small ($1) test PaymentIntent against a chosen Connect account via
 * the same Destination Charges pattern Keycove uses for real rent payments.
 * Use this to validate live-mode plumbing without waiting on a real tenant
 * payment.
 */
export default function AdminStripeSmoke() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [connectAccountId, setConnectAccountId] = useState("");
  const [amount, setAmount] = useState("1.00");
  const [platformFee, setPlatformFee] = useState("0.00");
  const [lastResult, setLastResult] = useState<null | {
    id: string;
    status: string;
    amount: number;
    destination: string;
    dashboardUrl: string;
  }>(null);

  const fireMutation = trpc.admin.fireTestRentCharge.useMutation({
    onSuccess: (result) => {
      setLastResult(result);
      toast.success(`PaymentIntent ${result.status} — $${(result.amount / 100).toFixed(2)} → ${result.destination}`);
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || (user as any).role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground">Admin-only.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  function handleFire() {
    const amountCents = Math.round(parseFloat(amount || "0") * 100);
    const feeCents = Math.round(parseFloat(platformFee || "0") * 100);
    if (!connectAccountId.startsWith("acct_")) {
      toast.error("Connect account ID must start with acct_");
      return;
    }
    if (!amountCents || amountCents < 50) {
      toast.error("Amount must be at least $0.50");
      return;
    }
    fireMutation.mutate({ connectAccountId, amountCents, platformFeeCents: feeCents });
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-foreground">Stripe Connect Smoke Test</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Fire a small PaymentIntent against any Connect account using Destination Charges.
            Validates the same wiring used for real rent payments. Use sparingly — these are
            live transactions.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Connect Account ID
            </Label>
            <Input
              value={connectAccountId}
              onChange={(e) => setConnectAccountId(e.target.value.trim())}
              placeholder="acct_1Td1KmQ4ZVWB1dNa"
              className="mt-1.5 font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Must start with <span className="font-mono">acct_</span>. Find this in the destination
              landlord's Connect Onboarding completion email or the marketplace router output.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Amount (USD)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.50"
                max="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Platform Fee (USD)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="5.00"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Set 0 for pure passthrough; non-zero validates application_fee_amount.
              </p>
            </div>
          </div>

          <Button
            onClick={handleFire}
            disabled={fireMutation.isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-11"
          >
            {fireMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Firing…</>
            ) : (
              <><Zap className="mr-2 h-4 w-4" /> Fire Test PaymentIntent</>
            )}
          </Button>
        </div>

        {lastResult && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-foreground">PaymentIntent created</span>
              <Badge variant="outline" className="ml-auto font-mono">{lastResult.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="font-mono text-xs break-all">{lastResult.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-semibold">${(lastResult.amount / 100).toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-mono text-xs break-all">{lastResult.destination}</p>
              </div>
            </div>
            <a
              href={lastResult.dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              View in Stripe Dashboard <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold mb-1">⚠️ Live mode note</p>
          <p>
            This uses Stripe's <span className="font-mono">pm_card_visa</span> test payment method,
            which only works in <span className="font-semibold">test mode</span>. In live mode the
            call will fail — that's expected. To smoke-test live, switch the platform Stripe key to
            test mode temporarily, or use a saved payment method on the destination account.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
