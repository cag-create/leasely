import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Lock, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { canSellProHere } from "@/native/platform";

interface ProGateProps {
  children: React.ReactNode;
  /** Optional: feature name shown in the upgrade prompt */
  featureName?: string;
}

/**
 * ProGate — wraps any Pro-only page or section.
 * - If user is not authenticated → shows sign-in prompt
 * - If user is authenticated but on free tier → shows upgrade prompt with Stripe checkout
 * - If user is on paid tier → renders children normally
 */
export function ProGate({ children, featureName = "this feature" }: ProGateProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const checkoutMutation = trpc.marketplace.createProCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Could not start checkout. Please try again.");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sign in required</h1>
            <p className="text-muted-foreground mt-2">
              You need to sign in to access {featureName}. Create a free account or sign in to continue.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <a href="/api/oauth/login">Sign In / Create Account</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isPro = (user as any)?.tier === "paid";

  // Inside the iOS/Android app: no price, purchase button or link (App Store
  // 3.1.3(f) companion-app rule). Pro is only sold on the web.
  if (!isPro && !canSellProHere()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-5 rounded-2xl border border-border bg-card p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Pro feature</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {featureName === "this feature" ? "This feature is" : `${featureName} is`} part of Keycove Pro.
              Your account doesn't include Pro.
            </p>
          </div>
          <Button variant="outline" asChild className="w-full">
            <Link href="/app">Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-lg w-full">
          {/* Upgrade card */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-6 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Sparkles className="h-3 w-3" />
                Pro Feature
              </div>
              <h1 className="text-2xl font-bold text-foreground">Upgrade to Keycove Pro</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {featureName === "this feature"
                  ? "This feature is available exclusively to Keycove Pro subscribers."
                  : `${featureName} is available exclusively to Keycove Pro subscribers.`}{" "}
                Unlock your full property management portal for $25/month.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                "Your own website included",
                "Branded tenant portal",
                "Unlimited listings",
                "AI fraud screening",
                "Instant rent payouts",
                "Work order management",
                "Accounting & P&L",
                "Rent rate intelligence",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            {/* Terms acknowledgement — must be checked before checkout fires */}
            <label className="flex items-start gap-3 text-left bg-muted/40 border border-border rounded-xl p-4 cursor-pointer hover:bg-muted/60 transition-colors">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border accent-indigo-600 cursor-pointer flex-shrink-0"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I understand: <strong className="text-foreground">$25 is charged today, then monthly until you cancel</strong>. Cancel anytime — no contracts, no refunds for partial months. I agree to Keycove's{" "}
                <Link href="/terms" className="text-indigo-600 hover:underline" target="_blank">Terms of Service</Link>{" "}and{" "}
                <Link href="/privacy" className="text-indigo-600 hover:underline" target="_blank">Privacy Policy</Link>.
              </span>
            </label>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (!termsAccepted) {
                    toast.error("Please review and accept the terms before continuing.");
                    return;
                  }
                  const ref = localStorage.getItem("leasely_ref") ?? undefined;
                  checkoutMutation.mutate(ref ? { referralCode: ref } : undefined);
                }}
                disabled={checkoutMutation.isPending || !termsAccepted}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening checkout...
                  </>
                ) : (
                  <>
                    Upgrade to Pro — $25/mo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" asChild className="w-full text-muted-foreground">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
$25/mo — website included · Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
