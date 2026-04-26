import { useEffect, useState } from "react";
import { Link } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Please use the link from your email.");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          return;
        }
        setStatus("success");
        setMessage("Your email has been verified. You're all set.");
      } catch {
        setStatus("error");
        setMessage("Network error — please try again.");
      }
    })();
  }, []);

  const tone =
    status === "success"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : status === "error"
      ? "text-red-400 bg-red-400/10 border-red-400/20"
      : "text-white/70 bg-white/5 border-white/10";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Leasely" className="h-10 object-contain" />
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Email verification</h1>
          <p className={`text-sm border rounded-lg px-3 py-3 ${tone}`}>{message}</p>

          <div className="mt-6 text-center text-sm text-white/50">
            <Link href={status === "success" ? "/onboarding" : "/login"}>
              <a className="text-white/80 hover:text-white underline">
                {status === "success" ? "Continue" : "Back to sign in"}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
