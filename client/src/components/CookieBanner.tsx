import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "leasely_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage unavailable (e.g. private mode) — show banner anyway
      setVisible(true);
    }
  }, []);

  function recordChoice(choice: "all" | "necessary") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, ts: Date.now() }));
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-[#0A1628] border border-white/15 rounded-2xl shadow-2xl p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-white font-semibold text-sm">Cookies & your privacy</h3>
        <button
          onClick={() => recordChoice("necessary")}
          className="text-white/40 hover:text-white p-0.5"
          aria-label="Close — only strictly necessary cookies"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-white/65 text-xs leading-relaxed mb-4">
        We use strictly necessary cookies to keep you signed in and the Services secure, plus optional functional and analytics cookies to improve your experience. We do not use cookies for cross-context behavioral advertising. Read our{" "}
        <Link href="/legal/cookies"><span className="text-[#F5A623] hover:underline cursor-pointer">Cookie Policy</span></Link> and{" "}
        <Link href="/legal/privacy"><span className="text-[#F5A623] hover:underline cursor-pointer">Privacy Policy</span></Link>.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          size="sm"
          onClick={() => recordChoice("all")}
          className="bg-[#F5A623] hover:bg-[#E8951A] text-[#062018] font-semibold flex-1"
        >
          Accept all
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => recordChoice("necessary")}
          className="border-white/15 text-white/80 hover:bg-white/8 flex-1"
        >
          Only necessary
        </Button>
      </div>
    </div>
  );
}
