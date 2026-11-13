import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Landmark, ShieldCheck, Lock } from "lucide-react";
import { BRAND, ACCENT, BookContext, type Book } from "./trust/shared";
import OverviewTab from "./trust/OverviewTab";
import OwnersTab from "./trust/OwnersTab";
import MoneyTab from "./trust/MoneyTab";
import DepositsTab from "./trust/DepositsTab";
import ReconcileTab from "./trust/ReconcileTab";
import StatementsTab from "./trust/StatementsTab";
import JournalTab from "./trust/JournalTab";
import SetupTab from "./trust/SetupTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "owners", label: "Owners & properties" },
  { key: "money", label: "Receipts & payouts" },
  { key: "deposits", label: "Security deposits" },
  { key: "reconcile", label: "Reconcile" },
  { key: "statements", label: "Statements & 1099" },
  { key: "journal", label: "Journal" },
  { key: "setup", label: "Setup" },
] as const;
type TabKey = (typeof TABS)[number]["key"];
const ALIASES: Record<string, TabKey> = { disburse: "money" };

export default function TrustAccounting() {
  const { isAuthenticated, loading } = useAuth();
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const rawTab = params.get("tab") ?? "overview";
  const tab: TabKey = (ALIASES[rawTab] ?? (TABS.some((t) => t.key === rawTab) ? rawTab : "overview")) as TabKey;
  const access = trpc.trust.access.useQuery(undefined, { enabled: isAuthenticated });
  const [bookId, setBookId] = useState<number | null>(null);

  const books = (access.data?.books ?? []) as Book[];
  useEffect(() => {
    if (books.length && (bookId == null || !books.some((b) => b.pmUserId === bookId))) setBookId(books[0].pmUserId);
  }, [books, bookId]);
  const book = useMemo(() => books.find((b) => b.pmUserId === bookId) ?? null, [books, bookId]);
  const ctx = useMemo(() => ({ book, bookUserId: book && !book.own ? book.pmUserId : undefined }), [book]);

  const setTab = (k: TabKey) => navigate(`/trust?tab=${k}`);

  if (loading || (isAuthenticated && access.isLoading)) {
    return <DashboardLayout><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div></DashboardLayout>;
  }
  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-20 space-y-4">
          <Lock className="h-10 w-10 mx-auto text-gray-300" />
          <h1 className="text-xl font-bold" style={{ color: BRAND }}>Sign in to open trust accounting</h1>
          <Button asChild><a href={`/login?next=${encodeURIComponent("/trust")}`}>Sign in</a></Button>
        </div>
      </DashboardLayout>
    );
  }
  if (!books.length) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 space-y-6">
          <div className="rounded-2xl border bg-white p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}14` }}><Landmark className="h-6 w-6" style={{ color: ACCENT }} /></div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: BRAND }}>Trust accounting for property managers</h1>
                <p className="text-sm text-gray-500">Hold other owners' money in trust with the books a real-estate commission audit expects. Built to North Carolina's rules; other states get NC's strict rules as a default.</p>
              </div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
              <li>Online rent lands in your Stripe account and pays out to your trust bank; every receipt is posted to the owner's ledger.</li>
              <li>Management, leasing and renewal fees applied automatically; owners can never be overdrawn.</li>
              <li>Security deposits on their own ledgers with G.S. 42-50 / 42-52 deadlines.</li>
              <li>Monthly three-way reconciliation from your bank's CSV, with the worksheet saved.</li>
              <li>Owner statements (PDF + email), owner portal, owner approvals and 1099-MISC totals.</li>
            </ul>
            <p className="text-sm text-gray-600">{access.data?.reason ?? "Trust accounting needs a Keycove Pro subscription."}</p>
            <div className="flex gap-3">
              <Link href="/pricing"><Button className="text-white" style={{ background: ACCENT }}>See plans</Button></Link>
              <Link href="/property-manager-guide"><Button variant="outline">Read the property-manager guide</Button></Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BookContext.Provider value={ctx}>
        <div className="max-w-6xl space-y-5 [&_th]:px-2 [&_td]:px-2 [&_th:first-child]:pl-0 [&_td:first-child]:pl-0 [&_th]:align-bottom">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: BRAND }}><ShieldCheck className="h-6 w-6" /> Trust Accounting</h1>
              <p className="text-sm text-gray-500 mt-1">Owner funds held in trust: receipts, owner ledgers, deposits, disbursements and monthly reconciliation.</p>
            </div>
            {books.length > 1 && (
              <select className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm" value={bookId ?? ""} onChange={(e) => setBookId(Number(e.target.value))}>
                {books.map((b) => <option key={b.pmUserId} value={b.pmUserId}>{b.own ? `My books (${b.name})` : `${b.name} (staff)`}</option>)}
              </select>
            )}
          </div>
          <div className="flex gap-1 overflow-x-auto border-b">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === "overview" && <OverviewTab onGo={setTab} />}
          {tab === "owners" && <OwnersTab />}
          {tab === "money" && <MoneyTab />}
          {tab === "deposits" && <DepositsTab />}
          {tab === "reconcile" && <ReconcileTab />}
          {tab === "statements" && <StatementsTab />}
          {tab === "journal" && <JournalTab />}
          {tab === "setup" && <SetupTab />}
        </div>
      </BookContext.Provider>
    </DashboardLayout>
  );
}
