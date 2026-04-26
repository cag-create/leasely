import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const utils = trpc.useUtils();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "register" && !agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy to create an account.");
      return;
    }
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = { email, password };
      if (mode === "register") body.name = name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Refresh auth state then redirect
      await utils.auth.me.invalidate();
      navigate("/onboarding");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Leasely" className="h-10 object-contain" />
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-white/50 text-sm mb-6">
            {mode === "login"
              ? "Welcome back — enter your details to continue."
              : "Set up your Leasely account in seconds."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-white/70">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === "register" ? "Minimum 8 characters" : "••••••••"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={mode === "register" ? 8 : undefined}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "register" && (
              <label className="flex items-start gap-2.5 text-xs text-white/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#00C896]"
                />
                <span>
                  I agree to the <a href="/legal/terms" target="_blank" rel="noopener" className="text-white/80 underline hover:text-white">Terms of Service</a> and <a href="/legal/privacy" target="_blank" rel="noopener" className="text-white/80 underline hover:text-white">Privacy Policy</a>, and acknowledge Leasely's <a href="/legal/fair-housing" target="_blank" rel="noopener" className="text-white/80 underline hover:text-white">Fair Housing</a> and <a href="/legal/cookies" target="_blank" rel="noopener" className="text-white/80 underline hover:text-white">Cookie</a> policies.
                </span>
              </label>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold"
            >
              {loading
                ? mode === "login" ? "Signing in…" : "Creating account…"
                : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-white/40">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-white/80 hover:text-white underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-white/80 hover:text-white underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
