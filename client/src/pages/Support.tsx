import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  MessageCircle, Zap, Clock, CheckCircle2, ChevronDown, ChevronRight,
  Search, BookOpen, CreditCard, Home, Settings, Shield,
  ArrowRight, Star, Headphones, Mail, Phone, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

const FAQ_CATEGORIES = [
  {
    icon: Home,
    label: "Listings & Marketplace",
    color: "text-blue-600",
    bg: "bg-blue-50",
    questions: [
      { q: "How do I list my property on Keycove?", a: "Click 'List Property' in the navigation bar. You'll be guided through a 5-step wizard to add your property details, photos, pricing, and contact info. Your first listing is completely free." },
      { q: "What types of properties can I list?", a: "You can list apartments, houses, condos, townhouses, co-living spaces, and more. Co-living listings allow you to rent individual rooms within a shared property." },
      { q: "How do I edit or remove my listing?", a: "Go to your Dashboard and find the listing you want to manage. You can edit details, deactivate (temporarily hide), or permanently delete any listing." },
      { q: "Can renters browse without an account?", a: "Yes! The marketplace, map view, and all property listings are fully public. No account or payment is ever required just to browse." },
    ]
  },
  {
    icon: CreditCard,
    label: "Payments & Billing",
    color: "text-green-600",
    bg: "bg-green-50",
    questions: [
      { q: "What does the Pro plan cost?", a: "The Pro plan is a $75 one-time setup fee plus $29/month. The setup fee includes your branded website, custom logo placement, and your personalized keycove.net subdomain URL. It also includes unlimited listings, your own branded portal, AI tenant screening, fraud detection, rental applications, Stripe Connect payouts, waived ACH fees, and priority customer support." },
      { q: "Are ACH fees really waived for Pro subscribers?", a: "Yes! Standard ACH processing costs 0.8% (capped at $5 per transaction). Pro subscribers have this fee completely waived — your tenants pay rent for free via bank transfer, and you receive 100% of the rent amount." },
      { q: "How do tenant rent payments work?", a: "Pro subscribers connect their bank account via Stripe Connect. Tenants receive a portal login and can pay rent via ACH (free) or card. Funds are deposited directly to your bank account, typically within 1-2 business days." },
      { q: "Can I cancel my Pro subscription?", a: "Yes, you can cancel anytime from your dashboard. Your Pro features remain active until the end of your billing period." },
    ]
  },
  {
    icon: Shield,
    label: "Tenant Screening & Safety",
    color: "text-purple-600",
    bg: "bg-purple-50",
    questions: [
      { q: "What does AI tenant screening include?", a: "Pro subscribers get AI-powered analysis of rental applications, automated fraud detection on submitted documents, and risk scoring to help identify qualified tenants. This is a Pro-only feature." },
      { q: "How does fraud detection work?", a: "Our AI analyzes submitted documents (pay stubs, bank statements, IDs) for signs of tampering or fabrication. It flags suspicious applications so you can investigate before approving a tenant." },
      { q: "Are background checks available?", a: "Background check integration is available for Pro subscribers. This includes credit history, criminal background, and eviction history checks." },
    ]
  },
  {
    icon: Settings,
    label: "Account & Portal",
    color: "text-orange-600",
    bg: "bg-orange-50",
    questions: [
      { q: "What is a branded portal?", a: "Pro subscribers get their own public-facing portal page (e.g., keycove.net/portal/yourname) with their business name, logo, brand colors, and all active listings. This page can be shared on Google, social media, or printed on business cards." },
      { q: "How do I set up my branded portal?", a: "After upgrading to Pro, go to your Dashboard and click 'Edit Portal Branding'. You can set your brand name, upload a logo, choose a color, and set your portal subdomain." },
      { q: "What is the QR code feature?", a: "Each of your Pro listings has a downloadable QR code that links directly to that property's detail page. Print it and place it on a yard sign, door, or flyer so prospective tenants can instantly view the listing on their phone." },
      { q: "How do I invite tenants to the tenant portal?", a: "In your Dashboard, go to the Tenants section and click 'Invite Tenant'. Enter their name, email, and lease details. They'll receive a magic-link login — no password required." },
    ]
  },
];

const TICKET_CATEGORIES = [
  { value: "billing", label: "Billing & Subscription" },
  { value: "technical", label: "Technical Issue" },
  { value: "listing", label: "Listing Problem" },
  { value: "payment", label: "Payment Issue" },
  { value: "account", label: "Account Help" },
  { value: "other", label: "Other" },
];

export default function Support() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    message: "",
    category: "other" as const,
    contactEmail: "",
  });

  const subQuery = trpc.marketplace.getUserTier.useQuery(undefined, { enabled: isAuthenticated });
  const isPro = subQuery.data?.tier === "paid";
  const userTier = !isAuthenticated ? "guest" : isPro ? "paid" : "free";

  const submitMutation = trpc.support.submit.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.priority === "high"
          ? "Ticket submitted! As a Pro subscriber, your ticket is marked HIGH PRIORITY with a 24-hour response SLA."
          : "Ticket submitted! We'll respond within 3-5 business days."
      );
      setShowTicketForm(false);
      setTicketForm({ subject: "", message: "", category: "other", contactEmail: "" });
    },
    onError: (err: any) => toast.error(err.message || "Failed to submit ticket."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      ...ticketForm,
      userId: user?.id,
      userTier,
      contactEmail: ticketForm.contactEmail || user?.email || undefined,
    });
  };

  // Filter FAQ by search
  const filteredFAQ = searchQuery.trim()
    ? FAQ_CATEGORIES.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.questions.length > 0)
    : FAQ_CATEGORIES;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 text-center px-4" style={{ background: `linear-gradient(160deg, ${BRAND} 0%, #0d3a2a 100%)` }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: `${ACCENT}30`, color: ACCENT }}>
            <Headphones className="h-3.5 w-3.5" /> Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            How can we help?
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Search our help center or submit a support ticket. Pro subscribers get priority 24-hour responses.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className="pl-12 h-14 text-base rounded-2xl border-0 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Support tier banner */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 mb-10">
        <div className={`rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${isPro ? "bg-white border-2" : "bg-white border border-gray-100"}`} style={isPro ? { borderColor: ACCENT } : {}}>
          <div className="flex items-center gap-4">
            {isPro ? (
              <>
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                  <Zap className="h-6 w-6" style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900">Pro Priority Support</span>
                    <Badge className="text-xs font-bold" style={{ background: ACCENT, color: "#3A2410", border: "none" }}>ACTIVE</Badge>
                  </div>
                  <p className="text-sm text-gray-500">24-hour response SLA · Dedicated support queue · Live chat access</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-gray-100">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <span className="font-black text-gray-900">Standard Support</span>
                  <p className="text-sm text-gray-500">3-5 business day response · Email support</p>
                </div>
              </>
            )}
          </div>
          {!isPro && isAuthenticated && (
            <Link href="/dashboard">
              <Button size="sm" className="font-bold gap-1.5 shrink-0" style={{ background: ACCENT, color: "#3A2410" }}>
                <Zap className="h-3.5 w-3.5" /> Upgrade for Priority Support
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Quick links */}
      {!searchQuery && (
        <section className="max-w-5xl mx-auto px-4 mb-12">
          <h2 className="text-xl font-black text-gray-900 mb-5">Browse by Topic</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FAQ_CATEGORIES.map(({ icon: Icon, label, color, bg }) => (
              <button
                key={label}
                onClick={() => setSearchQuery(label.split(" ")[0])}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md transition-all group"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{label}</div>
                <ChevronRight className="h-4 w-4 text-gray-300 mt-1 group-hover:text-blue-400 transition-colors" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <h2 className="text-xl font-black text-gray-900 mb-5">
          {searchQuery ? `Results for "${searchQuery}"` : "Frequently Asked Questions"}
        </h2>
        {filteredFAQ.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Search className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No results found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term or submit a support ticket below.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredFAQ.map(({ icon: Icon, label, color, bg, questions }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`px-6 py-4 border-b border-gray-50 flex items-center gap-3`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <h3 className="font-black text-gray-900">{label}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {questions.map(({ q, a }) => {
                    const key = `${label}-${q}`;
                    const isOpen = openFAQ === key;
                    return (
                      <button
                        key={q}
                        onClick={() => setOpenFAQ(isOpen ? null : key)}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="font-semibold text-gray-900 text-sm">{q}</span>
                          {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />}
                        </div>
                        {isOpen && (
                          <p className="text-sm text-gray-600 mt-3 leading-relaxed text-left">{a}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact / Ticket section */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Contact options */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100" style={{ background: `linear-gradient(145deg, ${BRAND}08, ${ACCENT}05)` }}>
              <h3 className="font-black text-gray-900 text-xl mb-6">Contact Us</h3>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15` }}>
                    <MessageCircle className="h-5 w-5" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">Submit a Ticket</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {isPro ? "24-hour response · High priority" : "3-5 business days"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">Email Support</div>
                    <div className="text-xs text-gray-500 mt-0.5">support@keycove.net</div>
                  </div>
                </div>
                {isPro && (
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-50">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        Priority Queue
                        <Badge className="text-xs" style={{ background: ACCENT, color: "#3A2410", border: "none" }}>PRO</Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Your tickets go to the front of the queue</div>
                    </div>
                  </div>
                )}
              </div>

              {isPro && (
                <div className="mt-6 p-4 rounded-2xl" style={{ background: `${ACCENT}15` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4" style={{ color: ACCENT }} />
                    <span className="font-bold text-sm" style={{ color: BRAND }}>Pro Subscriber Perks</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {["24-hour response SLA", "High priority ticket queue", "Dedicated support team", "Account review on request"].map(perk => (
                      <li key={perk} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Ticket form */}
            <div className="md:col-span-2 p-8">
              <h3 className="font-black text-gray-900 text-xl mb-2">Submit a Support Ticket</h3>
              <p className="text-sm text-gray-500 mb-6">
                {isPro
                  ? "As a Pro subscriber, your ticket is automatically marked high priority with a 24-hour response guarantee."
                  : "Describe your issue and we'll get back to you within 3-5 business days."}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Category</Label>
                    <select
                      value={ticketForm.category}
                      onChange={e => setTicketForm(f => ({ ...f, category: e.target.value as any }))}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ "--tw-ring-color": ACCENT } as any}
                    >
                      {TICKET_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  {!isAuthenticated && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Your Email</Label>
                      <Input
                        type="email"
                        value={ticketForm.contactEmail}
                        onChange={e => setTicketForm(f => ({ ...f, contactEmail: e.target.value }))}
                        placeholder="you@example.com"
                        required={!isAuthenticated}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Subject</Label>
                  <Input
                    value={ticketForm.subject}
                    onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    minLength={5}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Message</Label>
                  <Textarea
                    value={ticketForm.message}
                    onChange={e => setTicketForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your issue in detail. Include any relevant listing IDs, error messages, or steps to reproduce the problem."
                    rows={5}
                    minLength={20}
                    required
                    className="resize-none"
                  />
                </div>
                {isPro && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: `${ACCENT}15` }}>
                    <Zap className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                    <span className="text-sm font-semibold" style={{ color: BRAND }}>
                      Your ticket will be marked HIGH PRIORITY with a 24-hour response SLA.
                    </span>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full h-12 font-bold gap-2"
                  style={{ background: ACCENT, color: "#3A2410" }}
                >
                  {submitMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <>Submit Ticket <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
