import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Building2, Briefcase, KeyRound, Search, Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LOGO_URL } from "@/lib/brand";
import { hasTenantSession } from "@/native/platform";

/**
 * /app — the phone app's start screen. Signed-in people go straight to their
 * home (landlord or property manager → dashboard, tenant → tenant portal,
 * renter → search). Everyone else picks who they are.
 */
export default function MobileHome() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const roles = trpc.push.myRoles.useQuery(undefined, { enabled: Boolean(user), retry: false });

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (roles.isLoading) return;
      const accountType = (user as { accountType?: string | null }).accountType;
      if (user.role === "admin" || accountType === "landlord" || roles.data?.isPropertyManager) navigate("/dashboard", { replace: true });
      else if (accountType === "renter") navigate("/marketplace", { replace: true });
      else navigate("/onboarding", { replace: true });
      return;
    }
    if (hasTenantSession()) navigate("/tenant/dashboard", { replace: true });
  }, [loading, user, roles.isLoading, roles.data, navigate]);

  if (loading || user || hasTenantSession()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1F4B]">
        <Loader2 className="h-8 w-8 animate-spin text-white/80" />
      </div>
    );
  }

  const choices = [
    { href: "/login", icon: Building2, title: "I own rentals", desc: "Rent, leases, applicants, repairs" },
    { href: "/login", icon: Briefcase, title: "I manage properties", desc: "Property managers working for owners" },
    { href: "/tenant/login", icon: KeyRound, title: "I'm a tenant", desc: "Pay rent and request repairs" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="bg-[#0F1F4B] px-6 pt-10 pb-12 text-center rounded-b-[28px]">
        <img src={LOGO_URL} alt="Keycove" className="h-16 mx-auto mb-4" style={{ filter: "brightness(0) invert(1)" }} />
        <h1 className="text-white text-2xl font-bold leading-tight">Your rentals, in your pocket</h1>
        <p className="text-indigo-200 text-sm mt-2">Rent, leases, applicants and repairs, with alerts the moment something happens.</p>
      </div>

      <div className="px-5 -mt-6 space-y-3 flex-1">
        {choices.map((c) => (
          <Link key={c.title} href={c.href} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[.99] transition">
              <span className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <c.icon className="h-5 w-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-slate-900">{c.title}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{c.desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-slate-300" />
          </Link>
        ))}

        <Link href="/marketplace" className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 py-4">
          <Search className="h-4 w-4" /> Browse homes for rent
        </Link>
      </div>

      <div className="text-center text-xs text-slate-400 pb-8 space-x-4">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/support">Help</Link>
      </div>
    </div>
  );
}
