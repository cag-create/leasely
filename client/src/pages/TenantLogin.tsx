import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, Home, ArrowRight, Building2, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { LOGO_URL } from "@/lib/brand";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

export default function TenantLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);

  const sendLoginMutation = trpc.tenant.sendLoginLink.useMutation({
    onSuccess: () => {
      setSent(true);
      toast.success("Check your email for a secure login link!");
    },
    onError: (err) => {
      toast.error(err.message || "No tenant account found with that email.");
    },
  });

  const verifyTokenMutation = trpc.tenant.verifyToken.useMutation({
    onSuccess: (data) => {
      // Store tenant session token in localStorage
      localStorage.setItem("leasely_tenant_token", data.token);
      localStorage.setItem("leasely_tenant_id", String(data.tenantId));
      toast.success("Welcome! Redirecting to your portal...");
      setTimeout(() => { window.location.href = "/tenant/dashboard"; }, 800);
    },
    onError: (err) => {
      toast.error(err.message || "Invalid or expired token. Please try again.");
      setVerifying(false);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendLoginMutation.mutate({ email: email.trim().toLowerCase() });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setVerifying(true);
    verifyTokenMutation.mutate({ token: token.trim() });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white"
        style={{ background: `linear-gradient(145deg, ${BRAND} 0%, #0d3a2a 100%)` }}
      >
        <div>
          <Link href="/" className="flex items-center mb-16">
            <img src={LOGO_URL} alt="Keycove" className="h-10 w-auto brightness-0 invert" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </Link>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: `${ACCENT}30`, color: ACCENT }}>
              <Home className="h-3.5 w-3.5" /> Tenant Portal
            </div>
            <h1 className="text-4xl font-black leading-tight mb-4">
              Your home,<br />your portal.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Pay rent, view your lease, and submit maintenance requests — all in one place, provided by your landlord through Keycove.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, text: "Pay rent online — ACH or card" },
              { icon: CheckCircle2, text: "View payment history & receipts" },
              { icon: CheckCircle2, text: "See your lease details at a glance" },
              { icon: CheckCircle2, text: "Submit maintenance requests" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" style={{ color: ACCENT }} />
                <span className="text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
          <Shield className="h-8 w-8 shrink-0" style={{ color: ACCENT }} />
          <div>
            <div className="font-bold text-sm">Bank-level security</div>
            <div className="text-white/60 text-xs">Payments processed by Stripe. Your data is always encrypted.</div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="inline-flex items-center">
            <img src={LOGO_URL} alt="Keycove" className="h-10 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </Link>
        </div>

        <div className="w-full max-w-md">
          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Tenant Sign In</h2>
                <p className="text-gray-500">Enter your email and we'll send you a secure, one-click login link — no password needed.</p>
              </div>

              <form onSubmit={handleSend} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={sendLoginMutation.isPending || !email.trim()}
                  className="w-full h-12 text-base font-bold gap-2"
                  style={{ background: ACCENT, color: "#3A2410" }}
                >
                  {sendLoginMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <>Send Login Link <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">
                  <strong>First time here?</strong> Your landlord needs to invite you to the tenant portal. Contact them to get set up.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}20` }}>
                  <Mail className="h-8 w-8" style={{ color: ACCENT }} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-500">We sent a 6-digit code to <strong>{email}</strong>. Enter it below to sign in.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Login Code</Label>
                  <Input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="h-14 text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={verifying || token.length < 6}
                  className="w-full h-12 text-base font-bold gap-2"
                  style={{ background: ACCENT, color: "#3A2410" }}
                >
                  {verifying ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                  ) : (
                    <>Sign In <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => { setSent(false); setToken(""); }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Use a different email
                </button>
              </form>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Are you a landlord or property manager?{" "}
              <Link href="/" className="font-semibold hover:underline" style={{ color: BRAND }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
