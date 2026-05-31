import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { LOGO_URL } from "@/lib/brand";

interface LegalLayoutProps {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "CCPA / Your Data Rights", href: "/legal/ccpa" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "Fair Housing Statement", href: "/legal/fair-housing" },
];

export default function LegalLayout({ title, effectiveDate, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Header */}
      <header className="border-b border-white/8">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={LOGO_URL} alt="Leasely" className="h-8 object-contain" />
            </div>
          </Link>
          <Link href="/">
            <button className="text-white/60 hover:text-white text-sm flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </button>
          </Link>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-[220px_1fr] gap-10">
        {/* Sidebar nav */}
        <aside className="hidden md:block">
          <p className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-3">Legal</p>
          <nav className="space-y-1.5">
            {LEGAL_LINKS.map(l => (
              <Link key={l.href} href={l.href}>
                <span className="block text-sm text-white/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">{l.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t border-white/8 text-xs text-white/40 space-y-1">
            <p>Leasely, Inc.</p>
            <p>support@leasely.net</p>
          </div>
        </aside>

        {/* Content */}
        <main>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/40 text-sm mb-8">Effective date: {effectiveDate}</p>
          <div className="prose prose-invert max-w-none text-white/80 space-y-5 leading-relaxed">
            {children}
          </div>
          <div className="mt-12 pt-6 border-t border-white/8 text-xs text-white/40">
            <p>This document is provided for informational purposes and does not constitute legal advice. Consult a qualified attorney for guidance specific to your situation.</p>
            <p className="mt-2">Questions: <a href="mailto:support@leasely.net" className="text-[#F5A623] hover:underline">support@leasely.net</a></p>
          </div>
        </main>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white mt-8 mb-3">{title}</h2>
      <div className="space-y-3 text-white/75 text-[15px]">{children}</div>
    </section>
  );
}
