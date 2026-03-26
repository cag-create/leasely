import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CreditCard, MapPin, Bed, Bath, Shield, Lock,
  CheckCircle2, ArrowLeft, DollarSign, Loader2, Building2
} from "lucide-react";
import { formatRent, getListingImage } from "@/lib/marketplace";

const BRAND = "#1B2B5E";
const ACCENT = "#00C896";

export default function RentPayment() {
  const { id } = useParams<{ id: string }>();
  const listingId = parseInt(id ?? "0");

  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: listing, isLoading } = trpc.marketplace.getListingById.useQuery(
    { id: listingId },
    { enabled: !!listingId }
  );

  const createSession = trpc.marketplace.createRentPaymentSession.useMutation({
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
        ? "This landlord hasn't set up payments yet. Please contact them directly."
        : err.message;
      toast.error(msg);
      setSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantEmail.trim() || !amount) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error("Please enter a valid payment amount.");
      return;
    }
    setSubmitting(true);
    createSession.mutate({
      listingId,
      tenantName: tenantName.trim(),
      tenantEmail: tenantEmail.trim(),
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

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Listing Not Found</h2>
          <Link href="/marketplace">
            <Button variant="outline">Browse Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const image = getListingImage(listing.photos, listing.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl py-4 flex items-center justify-between">
          <Link href={`/listing/${listingId}`}>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
              <ArrowLeft className="h-4 w-4" /> Back to Listing
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-gray-700">Secure Payment</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Payment Form — left */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${ACCENT}20` }}>
                  <CreditCard className="h-5 w-5" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900">Pay Rent</h1>
                  <p className="text-sm text-gray-500">Secure payment powered by Stripe</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Your Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Jane Smith"
                      value={tenantName}
                      onChange={e => setTenantName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={tenantEmail}
                      onChange={e => setTenantEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                    Payment Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder={String(listing.monthlyRent)}
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="1"
                      max="50000"
                      step="0.01"
                      required
                      className="h-11 pl-9"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Monthly rent is {formatRent(listing.monthlyRent)}. Enter a different amount if paying partial or multiple months.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="desc" className="text-sm font-semibold text-gray-700">
                    Payment Description <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="desc"
                    placeholder="e.g. March 2026 Rent"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Trust badges */}
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

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 font-bold text-base gap-2"
                  style={{ background: ACCENT, color: "#0a2a1f" }}
                >
                  {submitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Redirecting to Stripe...</>
                  ) : (
                    <><CreditCard className="h-5 w-5" /> Pay {amount ? `$${parseFloat(amount).toFixed(2)}` : "Rent"} Securely</>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  You'll be redirected to Stripe's secure checkout. Funds go directly to your landlord.
                </p>
              </form>
            </div>
          </div>

          {/* Listing Summary — right */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <img src={image} alt={listing.title} className="w-full h-44 object-cover" />
              <div className="p-5">
                <h3 className="font-black text-gray-900 text-base leading-tight mb-1">{listing.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {listing.address}, {listing.city}, {listing.state}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{listing.bedrooms} bd</span>
                  <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{listing.bathrooms} ba</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monthly Rent</span>
                    <span className="font-bold text-gray-900">{formatRent(listing.monthlyRent)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h4 className="font-bold text-gray-800 mb-3 text-sm">How it works</h4>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Enter your info and payment amount" },
                  { step: "2", text: "Complete secure checkout via Stripe" },
                  { step: "3", text: "Funds go directly to your landlord" },
                  { step: "4", text: "You receive an email receipt instantly" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: ACCENT }}>
                      {step}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
