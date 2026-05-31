/**
 * /welcome — Post-Stripe-checkout landing page.
 * Shown immediately after a successful Stripe Payment Link / Checkout redirect.
 * Goal: confirm payment, set expectations for the magic-link email,
 * and route the new Pro user into onboarding.
 */
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Mail, Building2, Globe, CreditCard, ArrowRight, Sparkles,
} from "lucide-react";
import { LOGO_URL } from "@/lib/brand";

export default function Welcome() {
  const [, navigate] = useLocation();

  // Fire conversion event for analytics (umami if available, otherwise no-op).
  useEffect(() => {
    try {
      // @ts-expect-error — umami is loaded via script tag, not typed.
      window.umami?.track?.("pro_signup_complete");
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] via-white to-[#FFF8E7]">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Leasely" className="h-12 w-auto" />
        </div>

        {/* Success hero */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#F5A623]/20 p-8 sm:p-12 text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5A623]/15 text-[#C8860A] text-xs font-bold mb-4">
            <Sparkles className="w-3 h-3" />
            PAYMENT CONFIRMED
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1B2B5E] mb-3">
            Welcome to Leasely Pro
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Your subscription is live. Let's get your portal set up so you can start
            listing properties and collecting rent today.
          </p>
        </div>

        {/* Email reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">
              Check your inbox for your login link
            </p>
            <p className="text-sm text-blue-800">
              We just sent a secure magic link to the email you used at checkout.
              Click it to sign in — no password required. Don't see it?{" "}
              <Link href="/login" className="underline font-semibold">
                Request a new one
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Next steps */}
        <h2 className="text-xl font-bold text-[#1B2B5E] mb-4">
          Your next 3 steps
        </h2>
        <div className="space-y-3 mb-10">
          <NextStep
            number={1}
            icon={Building2}
            title="Set up your branded portal"
            description="Name, logo, color, and subdomain. Live in under 2 minutes."
            cta="Start setup"
            onClick={() => navigate("/pro-setup")}
          />
          <NextStep
            number={2}
            icon={Globe}
            title="Create your first listing"
            description="Always free — list one property at no extra cost. Add photos, set rent, and publish to the marketplace."
            cta="Create listing"
            onClick={() => navigate("/list-property")}
          />
          <NextStep
            number={3}
            icon={CreditCard}
            title="Connect Stripe to collect rent"
            description="0% ACH fees for Pro. Tenants pay you directly — funds land in your bank, not ours."
            cta="Connect Stripe"
            onClick={() => navigate("/dashboard")}
          />
        </div>

        {/* Help footer */}
        <div className="text-center text-sm text-gray-500">
          Questions?{" "}
          <Link href="/contact" className="text-[#1B2B5E] font-semibold underline">
            Email support
          </Link>
          {" "}— we respond within 1 business day.
        </div>
      </div>
    </div>
  );
}

function NextStep({
  number, icon: Icon, title, description, cta, onClick,
}: {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 hover:shadow-md hover:border-[#F5A623]/40 transition-all">
      <div className="shrink-0 w-10 h-10 rounded-full bg-[#1B2B5E] text-white font-bold flex items-center justify-center">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-[#F5A623]" />
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <Button
        onClick={onClick}
        className="shrink-0 bg-[#1B2B5E] hover:bg-[#2D3F7C] text-white gap-1"
      >
        {cta} <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
