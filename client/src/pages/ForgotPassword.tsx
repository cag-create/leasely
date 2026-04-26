import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not process request");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Leasely" className="h-10 object-contain" />
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
          <p className="text-white/50 text-sm mb-6">
            Enter the email address tied to your account and we'll send a reset link.
          </p>

          {submitted ? (
            <div className="space-y-4">
              <p className="text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-3">
                If an account exists for that email, a password reset link has been sent. The link expires in 1 hour.
              </p>
              <Link href="/login" className="block text-center text-sm text-white/60 hover:text-white underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? "Sending…" : "Send reset link"}
              </Button>

              <div className="text-center text-sm text-white/40 pt-2">
                Remembered it?{" "}
                <Link href="/login" className="text-white/80 hover:text-white underline">Sign in</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
