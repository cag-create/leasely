/**
 * Pro Portal Setup Wizard
 * Shown immediately after Stripe payment confirmation.
 * Collects: business name, logo, brand color, subdomain, state, property focus.
 * Calls updatePortalBranding to provision the portal instantly.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2, Palette, Globe, MapPin, Home, CheckCircle2,
  ChevronRight, ChevronLeft, Sparkles, Star
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Business Name", icon: Building2 },
  { id: 2, label: "Brand Color", icon: Palette },
  { id: 3, label: "Your Subdomain", icon: Globe },
  { id: 4, label: "Your Market", icon: MapPin },
  { id: 5, label: "Go Live!", icon: Star },
];

const PRESET_COLORS = [
  "#F5A623", "#1B2B5E", "#6366F1", "#F5A623",
  "#EC4899", "#10B981", "#3B82F6", "#EF4444",
  "#8B5CF6", "#F59E0B", "#06B6D4", "#84CC16",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const PROPERTY_TYPES = [
  { id: "apartment", label: "Apartments", icon: "🏢" },
  { id: "house", label: "Single Family Homes", icon: "🏠" },
  { id: "condo", label: "Condos & Townhomes", icon: "🏙️" },
  { id: "co_living", label: "Co-Living / Shared Housing", icon: "🤝" },
  { id: "commercial", label: "Commercial Properties", icon: "🏪" },
  { id: "mixed", label: "Mixed Portfolio", icon: "📋" },
];

export default function ProSetup() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    businessName: user?.name ? `${user.name.split(" ")[0]}'s Properties` : "",
    brandColor: "#F5A623",
    subdomain: "",
    tagline: "",
    state: "",
    propertyFocus: "",
  });

  const updateMutation = trpc.marketplace.updatePortalBranding.useMutation({
    onSuccess: () => {
      setDone(true);
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Setup failed. Please try again.");
    },
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleFinish = () => {
    if (!form.businessName.trim()) {
      toast.error("Please enter your business name.");
      return;
    }
    if (!form.subdomain.trim()) {
      toast.error("Please choose a subdomain.");
      return;
    }
    updateMutation.mutate({
      brandName: form.businessName,
      brandColor: form.brandColor,
      portalSubdomain: form.subdomain,
    });
  };

  // Auto-generate subdomain from business name
  const autoSubdomain = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ background: `${form.brandColor}20`, border: `2px solid ${form.brandColor}` }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: form.brandColor }} />
          </div>
          <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Portal is Live! 🎉
          </h2>
          <p className="text-white/60 mb-2">
            <span className="text-white font-semibold">{form.businessName}</span> is now live at:
          </p>
          <div className="rounded-2xl px-6 py-3 mb-6 inline-block" style={{ background: `${form.brandColor}15`, border: `1px solid ${form.brandColor}40` }}>
            <p className="font-mono font-bold" style={{ color: form.brandColor }}>
              leasely.net/portal/{form.subdomain}
            </p>
          </div>
          <p className="text-white/40 text-sm mb-6">
            All Pro features are now unlocked. Start by adding your first listing.
          </p>

          {/* CBP delivery callout — bridges the 1–2 day window between
              "portal live" and "branded logo replaces the monogram". */}
          <div
            className="rounded-2xl p-4 mb-6 text-left"
            style={{
              background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.25)",
            }}
          >
            <p className="text-[#FFD166] text-xs font-bold uppercase tracking-widest mb-1.5">
              Brand kit in production
            </p>
            <p className="text-white/75 text-sm leading-relaxed">
              Your custom logo from <a href="https://certifybusinesspro.com" target="_blank" rel="noopener" className="underline hover:text-white">Certify Business Pro</a> is in production — <strong className="text-white">7 unique concepts arriving within 1–2 business days</strong>. We'll email you the redemption code shortly. In the meantime your portal uses a clean monogram.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/list-property")}
              className="font-bold py-3"
              style={{ background: form.brandColor, color: "#3A2410" }}
            >
              <Home className="w-4 h-4 mr-2" /> Add Your First Listing
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
      {/* Header */}
      <div className="border-b border-white/10" style={{ background: "rgba(10,22,40,0.9)" }}>
        <div className="max-w-xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Pro Portal Setup</span>
              </div>
              <p className="text-white/50 text-sm">Step {step} of {STEPS.length} — {STEPS[step - 1]?.label}</p>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs">Takes ~2 minutes</p>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / STEPS.length) * 100}%`, background: form.brandColor }} />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Step 1: Business Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(245,166,35,0.15)" }}>
                <Building2 className="w-8 h-8 text-teal-400" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>What's your business called?</h1>
              <p className="text-white/50">This is the name tenants will see on your portal.</p>
            </div>
            <div className="space-y-3">
              <Label className="text-white/60 text-xs uppercase tracking-widest">Business / Brand Name</Label>
              <Input
                value={form.businessName}
                onChange={e => {
                  update("businessName", e.target.value);
                  if (!form.subdomain || form.subdomain === autoSubdomain(form.businessName)) {
                    update("subdomain", autoSubdomain(e.target.value));
                  }
                }}
                placeholder="e.g. Chad's Properties, Sunrise Rentals..."
                className="text-lg py-4"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "white" }}
                autoFocus
              />
              <Label className="text-white/60 text-xs uppercase tracking-widest mt-4 block">Tagline (optional)</Label>
              <Input
                value={form.tagline}
                onChange={e => update("tagline", e.target.value)}
                placeholder="e.g. Quality homes in the heart of the city"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "white" }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Brand Color */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${form.brandColor}20` }}>
                <Palette className="w-8 h-8" style={{ color: form.brandColor }} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Pick your brand color</h1>
              <p className="text-white/50">This color will appear throughout your portal.</p>
            </div>
            <div className="grid grid-cols-6 gap-3 mb-6">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => update("brandColor", color)}
                  className="w-full aspect-square rounded-2xl transition-all duration-200 hover:scale-110"
                  style={{
                    background: color,
                    border: form.brandColor === color ? "3px solid white" : "3px solid transparent",
                    boxShadow: form.brandColor === color ? `0 0 0 2px ${color}` : "none",
                  }}
                />
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-widest">Custom Hex Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.brandColor}
                  onChange={e => update("brandColor", e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <Input
                  value={form.brandColor}
                  onChange={e => update("brandColor", e.target.value)}
                  placeholder="#F5A623"
                  className="font-mono"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "white" }}
                />
              </div>
            </div>
            {/* Preview */}
            <div className="rounded-2xl p-5 mt-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-white/40 text-xs mb-3">Portal Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: form.brandColor }}>
                  {form.businessName.charAt(0) || "L"}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{form.businessName || "Your Business"}</p>
                  <p className="text-white/40 text-xs">leasely.net/portal/{form.subdomain || "yourname"}</p>
                </div>
              </div>
              <p className="text-white/35 text-[11px] mt-3 italic">
                Preview only — your CBP-designed logo replaces this within 1–2 business days.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Subdomain */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(99,102,241,0.15)" }}>
                <Globe className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Choose your portal link</h1>
              <p className="text-white/50">This is the URL you'll share with tenants.</p>
            </div>
            <div className="space-y-3">
              <Label className="text-white/60 text-xs uppercase tracking-widest">Your Subdomain</Label>
              <div className="flex items-center rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <span className="text-white/40 text-sm px-4 py-3 border-r border-white/10 whitespace-nowrap">leasely.net/portal/</span>
                <input
                  value={form.subdomain}
                  onChange={e => update("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="yourname"
                  className="flex-1 bg-transparent text-white px-4 py-3 outline-none text-sm font-mono"
                  maxLength={40}
                />
              </div>
              <p className="text-white/30 text-xs">Only lowercase letters, numbers, and hyphens. Min 2 characters.</p>
            </div>
            {form.subdomain.length >= 2 && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)" }}>
                <p className="text-teal-400 text-sm font-semibold">Your portal will be live at:</p>
                <p className="text-white font-mono text-sm mt-1">leasely.net/portal/<strong>{form.subdomain}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Market */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(245,166,35,0.15)" }}>
                <MapPin className="w-8 h-8 text-yellow-400" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Where do you operate?</h1>
              <p className="text-white/50">We'll customize state-specific forms and disclosures for you.</p>
            </div>
            <div className="space-y-3">
              <Label className="text-white/60 text-xs uppercase tracking-widest">Primary State</Label>
              <select
                value={form.state}
                onChange={e => update("state", e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <option value="">Select your state...</option>
                {US_STATES.map(s => <option key={s} value={s} style={{ background: "#0d1f3c" }}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <Label className="text-white/60 text-xs uppercase tracking-widest">Property Focus</Label>
              <div className="grid grid-cols-2 gap-3">
                {PROPERTY_TYPES.map(pt => (
                  <button
                    key={pt.id}
                    onClick={() => update("propertyFocus", pt.id)}
                    className="rounded-2xl p-4 text-left transition-all duration-200"
                    style={{
                      background: form.propertyFocus === pt.id ? `${form.brandColor}20` : "rgba(255,255,255,0.04)",
                      border: form.propertyFocus === pt.id ? `1px solid ${form.brandColor}60` : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="text-2xl mb-2">{pt.icon}</div>
                    <p className="text-white text-sm font-semibold">{pt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${form.brandColor}20` }}>
                <Star className="w-8 h-8" style={{ color: form.brandColor }} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Ready to launch!</h1>
              <p className="text-white/50">Review your portal setup and go live.</p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                ["Business Name", form.businessName || "—"],
                ["Brand Color", form.brandColor],
                ["Portal URL", `leasely.net/portal/${form.subdomain}`],
                ["Tagline", form.tagline || "—"],
                ["Primary State", form.state || "—"],
                ["Property Focus", PROPERTY_TYPES.find(p => p.id === form.propertyFocus)?.label || "—"],
              ].map(([label, value], i) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <span className="text-white/50 text-sm">{label}</span>
                  {label === "Brand Color" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full" style={{ background: value }} />
                      <span className="text-white text-sm font-mono">{value}</span>
                    </div>
                  ) : (
                    <span className="text-white text-sm font-semibold">{value}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)" }}>
              <p className="text-teal-400 text-sm">
                🎉 All Pro features unlock instantly — no waiting, no manual setup.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : <div />}

          {step < STEPS.length ? (
            <Button
              onClick={() => {
                if (step === 1 && !form.businessName.trim()) { toast.error("Please enter your business name."); return; }
                if (step === 3 && form.subdomain.length < 2) { toast.error("Subdomain must be at least 2 characters."); return; }
                setStep(s => s + 1);
              }}
              className="gap-2 font-bold px-8"
              style={{ background: form.brandColor, color: "#3A2410" }}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={updateMutation.isPending}
              className="gap-2 font-bold px-8"
              style={{ background: form.brandColor, color: "#3A2410" }}
            >
              {updateMutation.isPending ? "Launching..." : "Launch My Portal 🚀"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
