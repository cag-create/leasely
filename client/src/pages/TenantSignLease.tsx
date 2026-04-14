import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2, FileText, Home, DollarSign, Calendar, Shield, Loader2
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png";
const BRAND = "#1B2B5E";
const ACCENT = "#00C896";

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function TenantSignLease() {
  const { id } = useParams<{ id: string }>();
  const leaseId = id ? parseInt(id) : null;
  const [email, setEmail] = useState("");
  const [signed, setSigned] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const signMutation = trpc.leases.sign.useMutation({
    onSuccess: () => {
      setSigned(true);
      toast.success("Lease signed! Check your email for payment links and move-in details.");
    },
    onError: (e) => toast.error(e.message),
  });

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
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Lease Signed!</h2>
          <p className="text-gray-600 mb-4">
            Your lease has been executed. We've sent you an email with:
          </p>
          <ul className="text-left text-sm text-gray-600 space-y-2 mb-6 bg-gray-50 rounded-xl p-4">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Payment link for first month's rent</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Payment link for security deposit</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Move-in access instructions</li>
          </ul>
          <p className="text-sm text-gray-400">Powered by <strong style={{ color: BRAND }}>Leasely</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <img src={LOGO_URL} alt="Leasely" className="h-7 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-black text-lg" style={{ color: BRAND }}>Leasely</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">Lease Agreement</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${BRAND}, #0d3a2a)` }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-white">Sign Your Lease</h1>
            </div>
            <p className="text-white/70 text-sm">Please verify your email address to sign this lease agreement.</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Legal disclosure */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Electronic Signature Notice:</strong> By signing below, you agree that your electronic signature is legally binding and has the same force and effect as a handwritten signature. This lease is compliant with your state's landlord-tenant law.
              </p>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5">Your Email Address *</Label>
              <Input
                type="email"
                placeholder="Enter the email on your lease"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">Must match the email your landlord has on file.</p>
            </div>

            {/* Signature acknowledgment */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the terms of this lease agreement. I understand this is a legally binding electronic signature.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 font-bold gap-2 py-3"
                style={{ background: ACCENT, color: "#0a2a1f" }}
                disabled={!email.trim() || !confirmed || signMutation.isPending}
                onClick={() => {
                  if (!leaseId) return;
                  signMutation.mutate({ leaseId, tenantEmail: email.trim() });
                }}
              >
                {signMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing...</>
                  : <><CheckCircle2 className="w-4 h-4" /> Sign Lease Agreement</>
                }
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Secured and encrypted by Leasely. Your information is never shared.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Powered by <strong style={{ color: BRAND }}>Leasely</strong> — The AI-Powered Landlord OS</p>
      </div>
    </div>
  );
}
