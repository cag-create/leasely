import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Home, Building2, Search, Heart, Shield, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const BRAND = "#1B2B5E";
const ACCENT = "#00C896";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [selected, setSelected] = useState<"renter" | "landlord" | null>(null);
  const [saving, setSaving] = useState(false);

  const setAccountTypeMutation = trpc.marketplace.setAccountType.useMutation({
    onSuccess: () => {
      toast.success("Welcome to Leasely!");
      if (selected === "renter") {
        navigate("/marketplace");
      } else {
        navigate("/list-property");
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
      setSaving(false);
    },
  });

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    setAccountTypeMutation.mutate({ accountType: selected });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND }}>
        <div className="h-8 w-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #0d3a2a 100%)` }}
    >
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-white font-black text-3xl mb-2">Leasely</div>
        <p className="text-white/60 text-sm">Let's personalize your experience</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl">
        <h1 className="text-2xl font-black text-gray-900 text-center mb-2">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Tell us how you plan to use Leasely so we can set up the right experience for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Renter option */}
          <button
            onClick={() => setSelected("renter")}
            className={`relative rounded-2xl p-6 text-left border-2 transition-all duration-200 ${
              selected === "renter"
                ? "border-emerald-500 bg-emerald-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            {selected === "renter" && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            )}
            <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: selected === "renter" ? `${ACCENT}20` : "#f3f4f6" }}
            >
              <Search className="h-6 w-6" style={{ color: selected === "renter" ? ACCENT : "#6b7280" }} />
            </div>
            <div className="font-black text-gray-900 mb-1">I'm Looking to Rent</div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Browse apartments, houses, and co-living spaces. Save favorites and get notified about new listings.
            </p>
            <div className="mt-4 space-y-1.5">
              {["Browse all listings free", "Save favorite properties", "Save your searches", "Contact landlords directly"].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                Always Free
              </span>
            </div>
          </button>

          {/* Landlord option */}
          <button
            onClick={() => setSelected("landlord")}
            className={`relative rounded-2xl p-6 text-left border-2 transition-all duration-200 ${
              selected === "landlord"
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            {selected === "landlord" && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              </div>
            )}
            <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: selected === "landlord" ? "#1B2B5E20" : "#f3f4f6" }}
            >
              <Building2 className="h-6 w-6" style={{ color: selected === "landlord" ? BRAND : "#6b7280" }} />
            </div>
            <div className="font-black text-gray-900 mb-1">I'm a Landlord / PM</div>
            <p className="text-sm text-gray-500 leading-relaxed">
              List properties, screen tenants with AI, and manage your rental portfolio from one place.
            </p>
            <div className="mt-4 space-y-1.5">
              {["1 free listing on marketplace", "Views & saves analytics", "Upgrade for branded portal", "AI fraud detection (Pro)"].map((f, i) => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${i < 2 ? "text-emerald-500" : "text-gray-300"}`} />
                  <span className={i >= 2 ? "text-gray-400" : ""}>{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                Free to start
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${BRAND}15`, color: BRAND }}>
                Pro from $25/mo
              </span>
            </div>
          </button>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full h-12 font-bold text-base gap-2"
          style={{ background: selected ? ACCENT : undefined, color: selected ? "#0a2a1f" : undefined }}
        >
          {saving ? "Setting up..." : "Continue"}
          {!saving && <ArrowRight className="h-5 w-5" />}
        </Button>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can always switch later from your account settings.
        </p>
      </div>
    </div>
  );
}
