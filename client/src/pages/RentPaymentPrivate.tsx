import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CreditCard, MapPin, Shield, Lock,
  CheckCircle2, DollarSign, Loader2, Building2, Home,
} from "lucide-react";

const ACCENT = "#4F46E5";

export default function RentPaymentPrivate() {
  const { token } = useParams<{ token: string }>();

  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: info, isLoading, error } = trpc.marketplace.getCrmRentInfo.useQuery(
    { token: token ?? "" },
    { enabled: !!token, retry: false }
  );

  // Prefill from the resolved tenant record once loaded.
  useEffect(() => {
    if (info) {
      setTenantName(prev => prev || info.tenantName);
      setTenantEmail(prev => prev || info.tenantEmail);
      setAmount(prev => prev || (info.monthlyRent ? String(info.monthlyRent / 100) : ""));
    }
  }, [info]);

  const createSession = trpc.marketplace.createCrmRentPaymentSession.useMutation({
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        toast.error("Could not start payment session. Please try again.");
        setSubmitting(false);
      }
    },
    onError: (err) => {
      const msg = err.message.includes("not set up payments")
        ? "Your landlord hasn't finished connecting their bank yet. Please contact them."
        : err.message;
      toast.error(msg);
      setSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error("Please enter a valid payment amount.");
      return;
    }
    setSubmitting(true);
    createSession.mutate({
      token: token ?? "",
      amountDollars: amountNum,
      description: description.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Payment link not valid</h2>
          <p className="text-gray-500 max-w-sm">This rent payment link is invalid or has expired. Please contact your landlord for a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-gray-800">
            <Home className="h-5 w-5" style={{ color: ACCENT }} /> Keycove
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-gray-700">Secure Payment</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-2xl py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <CreditCard className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Pay Rent</h1>
              <p className="text-sm text-gray-500">Secure payment powered by Stripe</p>
            </div>
          </div>

          {info.propertyAddress && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 rounded-xl p-3">
              <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
              {info.propertyAddress}
            </div>
          )}

          {!info.bankReady ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
              Your landlord hasn't finished connecting their bank account yet, so online rent payments aren't available on this link right now. Please contact them.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Your Full Name <span className="text-red-500">*</span></Label>
                  <Input id="name" placeholder="Jane Smith" value={tenantName} onChange={e => setTenantName(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" placeholder="jane@example.com" value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} required className="h-11" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">Payment Amount <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="amount" type="number" placeholder={info.monthlyRent ? String(info.monthlyRent / 100) : "1500"} value={amount} onChange={e => setAmount(e.target.value)} min="1" max="50000" step="0.01" required className="h-11 pl-9" />
                </div>
                {info.monthlyRent != null && (
                  <p className="text-xs text-gray-400">Monthly rent is ${(info.monthlyRent / 100).toLocaleString()}. Enter a different amount for partial or multiple months.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-sm font-semibold text-gray-700">Payment Description <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input id="desc" placeholder="e.g. June 2026 Rent" value={description} onChange={e => setDescription(e.target.value)} className="h-11" />
              </div>

              <div className="flex flex-wrap gap-3 py-3 border-t border-gray-100">
                {[
                  { icon: Shield, text: "256-bit SSL encryption" },
                  { icon: Lock, text: "PCI DSS compliant" },
                  { icon: CheckCircle2, text: "Instant receipt via email" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Icon className="h-3.5 w-3.5 text-green-500" />
                    {text}
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-12 font-bold text-base gap-2" style={{ background: ACCENT, color: "#fff" }}>
                {submitting ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Redirecting to Stripe...</>
                ) : (
                  <><CreditCard className="h-5 w-5" /> Pay {amount ? `$${parseFloat(amount).toFixed(2)}` : "Rent"} Securely</>
                )}
              </Button>

              <p className="text-center text-xs text-gray-400">You'll be redirected to Stripe's secure checkout. Funds go directly to your landlord's bank.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
