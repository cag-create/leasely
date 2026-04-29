import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Globe, CheckCircle2, ArrowRight, Copy,
  ExternalLink, Sparkles, Home, Crown, Loader2, Link2,
} from "lucide-react";

const CBP_URL = "https://certifybusinesspro.com";
const STEPS = ["Brand Setup", "Claim Free Package", "Go Live"];

export default function PortalSetup() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  // Step 1 state
  const [brandName, setBrandName] = useState((user as any)?.brandName ?? "");
  const [subdomain, setSubdomain] = useState((user as any)?.portalSubdomain ?? "");
  const [brandColor, setBrandColor] = useState((user as any)?.brandColor ?? "#1B2B5E");
  const [domainMode, setDomainMode] = useState<"leasely" | "custom">("leasely");
  const [customDomain, setCustomDomain] = useState((user as any)?.customDomain ?? "");
  const [saving, setSaving] = useState(false);

  const utils = trpc.useUtils();
  const updateBranding = trpc.marketplace.updatePortalBranding.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Portal branding saved!");
      setStep(1);
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: proCode } = trpc.proCode.getMine.useQuery();

  const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

  async function handleSaveBranding() {
    if (!brandName.trim()) { toast.error("Enter a brand name"); return; }
    if (domainMode === "leasely" && !cleanSubdomain) { toast.error("Enter a subdomain"); return; }
    if (domainMode === "custom" && !customDomain.trim()) { toast.error("Enter your custom domain"); return; }
    setSaving(true);
    updateBranding.mutate({
      brandName: brandName.trim(),
      portalSubdomain: domainMode === "leasely" ? cleanSubdomain : undefined,
      customDomain: domainMode === "custom" ? customDomain.trim().replace(/^https?:\/\//, "") : undefined,
      brandColor,
    });
    setSaving(false);
  }

  function handleCopyCode() {
    if (proCode?.code) {
      navigator.clipboard.writeText(proCode.code);
      toast.success("Code copied!");
    }
  }

  function handleOpenCBP() {
    const params = new URLSearchParams({
      code: proCode?.code ?? "",
      email: (user as any)?.email ?? "",
      ref: "leasely_pro",
      plan: "website_logo_domain",
    });
    window.open(`${CBP_URL}?${params.toString()}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-4">
            <Crown className="h-4 w-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-semibold">Leasely Pro Activated</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Let's set up your portal</h1>
          <p className="text-white/50">3 quick steps · takes about 2 minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step ? "bg-[#00C896] text-[#0a2a1f]"
                  : i === step ? "bg-white text-[#0a0a0a]"
                  : "bg-white/10 text-white/40"
                }`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${i === step ? "text-white" : "text-white/40"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-px mx-2 mb-4 ${i < step ? "bg-[#00C896]" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Brand Setup */}
        {step === 0 && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00C896]/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-[#00C896]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Set up your brand</h2>
                <p className="text-sm text-white/50">Your portal goes live the moment you save</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white/70 text-sm">Brand / Company Name</Label>
                <Input
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. Sunrise Realty LLC"
                  className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <Label className="text-white/70 text-sm">Domain</Label>
                {/* Domain mode toggle */}
                <div className="flex gap-2 mt-1.5 mb-3">
                  <button
                    type="button"
                    onClick={() => setDomainMode("leasely")}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      domainMode === "leasely"
                        ? "border-[#00C896] bg-[#00C896]/10 text-[#00C896]"
                        : "border-white/10 bg-white/5 text-white/50 hover:text-white/70"
                    }`}
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    <div className="text-left">
                      <div>Leasely subdomain</div>
                      <div className={`text-xs ${domainMode === "leasely" ? "text-[#00C896]/70" : "text-white/30"}`}>yourname.leasely.net · free</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDomainMode("custom")}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      domainMode === "custom"
                        ? "border-amber-400 bg-amber-400/10 text-amber-300"
                        : "border-white/10 bg-white/5 text-white/50 hover:text-white/70"
                    }`}
                  >
                    <Link2 className="h-4 w-4 shrink-0" />
                    <div className="text-left">
                      <div>Custom domain</div>
                      <div className={`text-xs ${domainMode === "custom" ? "text-amber-400/70" : "text-white/30"}`}>yourbrand.com · BYOD or via CBP</div>
                    </div>
                  </button>
                </div>

                {domainMode === "leasely" ? (
                  <>
                    <div className="flex items-center rounded-xl overflow-hidden border border-white/10">
                      <Input
                        value={subdomain}
                        onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="sunrise"
                        className="bg-white/5 border-0 text-white placeholder:text-white/30 rounded-none flex-1"
                      />
                      <span className="px-3 py-2 bg-white/5 text-white/40 text-sm font-mono border-l border-white/10">.leasely.net</span>
                    </div>
                    {cleanSubdomain && (
                      <p className="text-xs text-[#00C896] mt-1.5">
                        Your portal: <span className="font-mono">{cleanSubdomain}.leasely.net</span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Input
                      value={customDomain}
                      onChange={e => setCustomDomain(e.target.value)}
                      placeholder="yourbrand.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <div className="mt-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-300/80 space-y-1">
                      <p className="font-semibold text-amber-300">DNS setup instructions</p>
                      <p>Point a <strong>CNAME</strong> record for your domain to <span className="font-mono">portal.leasely.net</span></p>
                      <p className="text-amber-300/60">Domain included free in your CBP package · $30/yr renewal · or use your own registrar</p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <Label className="text-white/70 text-sm">Brand Color</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                    className="h-10 w-16 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                    placeholder="#1B2B5E"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono w-32"
                  />
                  <span className="text-white/40 text-sm">Used on your portal & listings</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveBranding}
              disabled={updateBranding.isPending || saving}
              className="w-full bg-[#00C896] hover:bg-[#00C896]/90 text-[#0a2a1f] font-bold h-12 text-base"
            >
              {updateBranding.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save & Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 1: Claim Free Package */}
        {step === 1 && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Claim your free $399 package</h2>
                <p className="text-sm text-white/50">Website · Logo · 1-Year Domain — included with Pro</p>
              </div>
            </div>

            {/* What's included */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">What's included in your free package</p>
              {[
                "Custom professional website design (5-7 business days)",
                "7 unique logo concepts to choose from",
                "1-year domain registration (URL of your choice)",
                "1-year managed website hosting",
                "AI-powered color palette recommendations",
                "Mobile-responsive, SEO-optimized design",
                "Contact form integration + social media links",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/80">{f}</span>
                </div>
              ))}
              <p className="text-xs text-amber-400/70 mt-3">Valued at $399 + $30/yr domain renewal · yours free as a Pro member</p>
            </div>

            {/* Code */}
            {proCode ? (
              <div className="rounded-xl border-2 border-[#00C896]/40 bg-[#00C896]/5 p-5 text-center">
                <p className="text-xs font-semibold text-[#00C896] uppercase tracking-wider mb-2">Your One-Time Redemption Code</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-black text-white tracking-widest">{proCode.code}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-white/60 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {proCode.status === "redeemed" && (
                  <p className="text-xs text-white/40 mt-2">This code has already been redeemed.</p>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-white/5 p-5 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-white/40 mx-auto" />
              </div>
            )}

            <Button
              onClick={handleOpenCBP}
              disabled={proCode?.status === "redeemed"}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-12 text-base"
            >
              Redeem at Certify Business Pro
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-white/30 text-center">Opens certifybusinesspro.com · your code is pre-filled</p>

            <Button
              variant="ghost"
              className="w-full text-white/50 hover:text-white"
              onClick={() => setStep(2)}
            >
              Skip for now — I'll claim it later
            </Button>
          </div>
        )}

        {/* Step 2: Go Live */}
        {step === 2 && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00C896]/15 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-[#00C896]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">You're live!</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Your branded portal is active. Add listings, connect Stripe for rent collection, and start managing like a pro.
              </p>
            </div>

            {/* Checklist */}
            <div className="text-left rounded-xl bg-white/5 border border-white/10 p-5 space-y-3">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Your Pro checklist</p>
              {[
                { label: "Set up portal branding", done: true },
                { label: "Add your first listing", done: false, href: "/list-property" },
                { label: "Connect Stripe for rent payouts", done: false, href: "/dashboard" },
                { label: "Invite your first tenant", done: false, href: "/dashboard" },
                { label: "Claim free website + logo (CBP)", done: proCode?.status === "redeemed", href: undefined },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-[#00C896]/20" : "bg-white/10"}`}>
                    {item.done
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-[#00C896]" />
                      : <span className="w-1.5 h-1.5 rounded-full bg-white/30 block" />
                    }
                  </div>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-white/70 hover:text-white transition-colors underline underline-offset-2">{item.label}</a>
                  ) : (
                    <span className="text-sm text-white/70">{item.label}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-[#00C896] hover:bg-[#00C896]/90 text-[#0a2a1f] font-bold h-12 text-base"
              >
                <Home className="mr-2 h-4 w-4" /> Go to My Dashboard
              </Button>
              {(user as any)?.portalSubdomain && (
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                  onClick={() => window.open(`https://${(user as any).portalSubdomain}.leasely.net`, "_blank")}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  View My Portal
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
