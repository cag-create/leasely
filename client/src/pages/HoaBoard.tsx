/**
 * Keycove HOA — board dashboard (/hoa-board). Separate product from Pro:
 * any signed-in Keycove account can start a 30-day HOA trial.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HoaRosterImport from "@/components/hoa/HoaRosterImport";
import {
  AlertTriangle, Banknote, BookOpen, Building2, CheckCircle2, Circle, Copy, Download, ExternalLink, FileText,
  Home as HomeIcon, Landmark, Loader2, Mail, Megaphone, Plus, Printer, Receipt, Settings, Trash2, Upload, Users,
} from "lucide-react";
import { fmtUsd, FREQUENCY_LABEL, HOA_PLANS, type HoaAssessmentFrequency } from "@shared/hoaBoards";

const BRAND = "#1B2B5E";
const today = () => new Date().toISOString().slice(0, 10);
const dollars = (c: number | null | undefined) => (c == null ? "" : (c / 100).toFixed(2));
const toCents = (s: string) => Math.round((parseFloat(String(s).replace(/[$,]/g, "")) || 0) * 100);
const errMsg = (e: any) => e?.message ?? "Something went wrong";

function downloadCsv(name: string, rows: (string | number | null | undefined)[][]) {
  const csv = rows.map(r => r.map(v => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(new Error("Couldn't read file")); r.readAsDataURL(file); });
}

type Tab = "overview" | "homes" | "billing" | "payments" | "payouts" | "comms" | "settings";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "homes", label: "Homes", icon: HomeIcon },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "payments", label: "Payments", icon: Banknote },
  { id: "payouts", label: "Bank & payouts", icon: Landmark },
  { id: "comms", label: "Announcements & docs", icon: Megaphone },
  { id: "settings", label: "Plan & settings", icon: Settings },
];

function Card({ title, children, action }: { title?: string; children: any; action?: any }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {(title || action) && <div className="flex items-center justify-between mb-3">{title && <h3 className="font-bold text-slate-900">{title}</h3>}{action}</div>}
      {children}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" | "warn" }) {
  const color = tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-slate-900";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

// ─── Profile form (used for setup and settings) ─────────────────────────────
type Profile = { name: string; legalName: string; communityType: "planned" | "condo"; state: string; address: string; city: string; zip: string; contactEmail: string; contactPhone: string };
const emptyProfile: Profile = { name: "", legalName: "", communityType: "planned", state: "NC", address: "", city: "", zip: "", contactEmail: "", contactPhone: "" };

function ProfileFields({ p, set }: { p: Profile; set: (p: Profile) => void }) {
  const f = (k: keyof Profile) => ({ value: p[k], onChange: (e: any) => set({ ...p, [k]: e.target.value }) });
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2"><Label>HOA name</Label><Input placeholder="Heron Point Homeowners Association" {...f("name")} /></div>
      <div className="sm:col-span-2"><Label>Legal name (if different)</Label><Input placeholder="Heron Point HOA, Inc." {...f("legalName")} /></div>
      <div>
        <Label>Type</Label>
        <select className="w-full border rounded-md h-9 px-2 bg-white" value={p.communityType} onChange={e => set({ ...p, communityType: e.target.value as any })}>
          <option value="planned">Planned community (HOA)</option><option value="condo">Condominium association</option>
        </select>
      </div>
      <div><Label>State</Label><Input maxLength={2} {...f("state")} onChange={e => set({ ...p, state: e.target.value.toUpperCase() })} /></div>
      <div className="sm:col-span-2"><Label>Mailing address</Label><Input {...f("address")} /></div>
      <div><Label>City</Label><Input {...f("city")} /></div>
      <div><Label>ZIP</Label><Input {...f("zip")} /></div>
      <div><Label>Board contact email (homeowner replies go here)</Label><Input type="email" {...f("contactEmail")} /></div>
      <div><Label>Phone</Label><Input {...f("contactPhone")} /></div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function HoaBoard() {
  const { user, loading } = useAuth();
  const mine = trpc.hoaBoards.board.mine.useQuery(undefined, { enabled: !!user });
  const [selected, setSelected] = useState<number | null>(() => { try { return Number(localStorage.getItem("keycove.hoaBoard.assoc")) || null; } catch { return null; } });
  const assocId = useMemo(() => {
    const list = mine.data ?? [];
    return list.find(a => a.id === selected)?.id ?? list[0]?.id ?? null;
  }, [mine.data, selected]);
  useEffect(() => { if (assocId) try { localStorage.setItem("keycove.hoaBoard.assoc", String(assocId)); } catch { /* */ } }, [assocId]);

  if (loading || (user && mine.isLoading)) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  if (!user) return (
    <Shell>
      <div className="max-w-lg mx-auto text-center py-16">
        <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: BRAND }} />
        <h1 className="text-3xl font-extrabold text-slate-900">Keycove HOA</h1>
        <p className="text-slate-600 mt-3">Collect HOA dues online. Bank payments are free for homeowners. 30-day free trial, no card needed.</p>
        <div className="flex justify-center gap-3 mt-6">
          <Link href="/signup?next=/hoa-board"><Button style={{ background: BRAND }}>Create an account</Button></Link>
          <Link href="/login?next=/hoa-board"><Button variant="outline">Sign in</Button></Link>
        </div>
        <p className="text-sm text-slate-500 mt-6"><Link href="/hoa-boards" className="underline">How it works</Link> · <Link href="/hoa-portal" className="underline">I'm a homeowner</Link></p>
      </div>
    </Shell>
  );

  if (!assocId) return <Shell><Setup onCreated={id => { setSelected(id); void mine.refetch(); }} /></Shell>;

  return (
    <Shell>
      {(mine.data?.length ?? 0) > 1 && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-slate-500">HOA:</span>
          <select className="border rounded-md px-2 py-1 bg-white" value={assocId} onChange={e => setSelected(Number(e.target.value))}>
            {mine.data!.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      )}
      <Dashboard associationId={assocId} onAddHoa={() => setSelected(-1)} />
    </Shell>
  );
}

function Shell({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/hoa-boards" className="flex items-center gap-2 font-extrabold" style={{ color: BRAND }}>
            <img src="/keycove-logo.png" alt="Keycove" className="h-7" /> <span className="text-sm font-bold text-slate-500">HOA</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/hoa-board-guide" className="hover:text-slate-900 flex items-center gap-1"><BookOpen className="w-4 h-4" /> Board guide</Link>
            <Link href="/support" className="hover:text-slate-900">Support</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function Setup({ onCreated }: { onCreated: (id: number) => void }) {
  const [p, setP] = useState<Profile>(emptyProfile);
  const create = trpc.hoaBoards.board.create.useMutation();
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900">Set up your HOA</h1>
      <p className="text-slate-600 mt-1 mb-5">Your 30-day free trial starts now. No card needed until you pick a plan.</p>
      <Card>
        <ProfileFields p={p} set={setP} />
        <Button className="mt-5 w-full" style={{ background: BRAND }} disabled={create.isPending || p.name.trim().length < 2 || p.state.length !== 2}
          onClick={async () => { try { const r = await create.mutateAsync(p); toast.success("HOA created — your trial has started."); onCreated(r.id); } catch (e) { toast.error(errMsg(e)); } }}>
          {create.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Start free trial
        </Button>
      </Card>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ associationId }: { associationId: number; onAddHoa: () => void }) {
  const [tab, setTab] = useState<Tab>(() => (new URLSearchParams(window.location.search).get("tab") as Tab) || "overview");
  const info = trpc.hoaBoards.board.get.useQuery({ associationId });
  const summary = trpc.hoaBoards.board.summary.useQuery({ associationId });
  const connect = trpc.hoaBoards.board.connectStatus.useQuery({ associationId });
  const planConfirm = trpc.hoaBoards.board.planConfirm.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const sessionId = q.get("session_id");
    if (q.get("plan") === "success" && sessionId) {
      planConfirm.mutateAsync({ associationId, sessionId }).then(() => { toast.success("Plan active — thank you!"); utils.hoaBoards.board.invalidate(); }).catch(() => {});
    }
    if (q.get("connect") === "done") toast.success("Bank connection updated.");
    if (q.toString()) window.history.replaceState({}, "", "/hoa-board");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!info.data) return <div className="py-20 grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  const { association: a, homeCount, trialDaysLeft } = info.data;
  const s = summary.data;
  const connected = connect.data?.status === "active";
  const steps = [
    { done: true, label: "Create your HOA profile" },
    { done: connected, label: "Connect the HOA bank account", tab: "payouts" as Tab },
    { done: homeCount > 0, label: "Import homeowners", tab: "homes" as Tab },
    { done: !!a.billingEnabled, label: "Set dues and turn on billing", tab: "billing" as Tab },
    { done: (s?.homes ?? []).some(h => h.email) && false, label: "Invite homeowners to the portal", tab: "homes" as Tab, hide: true },
    { done: !!a.stripeSubscriptionId, label: "Choose a plan", tab: "settings" as Tab },
  ].filter(x => !x.hide);

  const planBadge = a.planStatus === "trialing" && !a.stripeSubscriptionId
    ? { text: `Free trial · ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`, cls: "bg-indigo-50 text-indigo-700" }
    : a.planStatus === "expired" ? { text: "Trial ended — choose a plan", cls: "bg-red-50 text-red-700" }
    : a.planStatus === "past_due" ? { text: "Payment past due", cls: "bg-amber-50 text-amber-700" }
    : a.planStatus === "cancelled" ? { text: "Plan cancelled", cls: "bg-red-50 text-red-700" }
    : { text: `${info.data.plan.label} · ${a.billingInterval === "year" ? "yearly" : "monthly"}`, cls: "bg-emerald-50 text-emerald-700" };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{a.name}</h1>
          <p className="text-sm text-slate-500">{[a.city, a.state].filter(Boolean).join(", ")} · {homeCount} home{homeCount === 1 ? "" : "s"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${planBadge.cls}`}>{planBadge.text}</span>
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/hoa-portal`); toast.success("Homeowner portal link copied"); }}>
            <Copy className="w-4 h-4 mr-1.5" /> Portal link
          </Button>
        </div>
      </div>

      {steps.some(x => !x.done) && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
          <p className="font-bold text-slate-900 mb-2">Get set up</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {steps.map((x, i) => (
              <button key={i} disabled={!x.tab} onClick={() => x.tab && setTab(x.tab)} className="flex items-center gap-2 text-left text-sm rounded-lg bg-white px-3 py-2 border border-indigo-100 hover:border-indigo-300">
                {x.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                <span className={x.done ? "text-slate-400 line-through" : "text-slate-800"}>{x.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px ${tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview associationId={associationId} goTo={setTab} />}
      {tab === "homes" && <Homes associationId={associationId} />}
      {tab === "billing" && <Billing associationId={associationId} />}
      {tab === "payments" && <Payments associationId={associationId} />}
      {tab === "payouts" && <Payouts associationId={associationId} />}
      {tab === "comms" && <Comms associationId={associationId} />}
      {tab === "settings" && <PlanSettings associationId={associationId} />}
    </div>
  );
}

// ─── Overview ───────────────────────────────────────────────────────────────
function Overview({ associationId, goTo }: { associationId: number; goTo: (t: Tab) => void }) {
  const summary = trpc.hoaBoards.board.summary.useQuery({ associationId });
  const info = trpc.hoaBoards.board.get.useQuery({ associationId });
  const s = summary.data;
  if (!s || !info.data) return <Loader2 className="w-6 h-6 animate-spin text-slate-400" />;
  const t = s.totals;
  const rules = info.data.rules;
  const delinquent = s.homes.filter(h => h.active && h.status === "delinquent").sort((x, y) => y.daysPastDue - x.daysPastDue);
  const maxBar = Math.max(1, ...s.collections.map(c => Math.max(c.billedCents, c.collectedCents)));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Collected this month" value={fmtUsd(t.collectedThisMonthCents)} tone="good" />
        <Stat label="Outstanding" value={fmtUsd(t.outstandingCents)} />
        <Stat label="Paid / open / delinquent" value={`${t.paidHomes} / ${t.openHomes} / ${t.delinquentHomes}`} tone={t.delinquentHomes ? "bad" : undefined} />
        <Stat label="On autopay" value={`${t.autopayHomes} of ${t.activeHomes}`} />
      </div>
      {t.processingCents > 0 && <p className="text-sm text-slate-600">{fmtUsd(t.processingCents)} in bank payments is still settling (about 4 business days).</p>}

      <Card title="Collections — last 12 months" action={
        <Button variant="outline" size="sm" onClick={() => downloadCsv(`collections-${today()}.csv`, [["Month", "Billed", "Collected", "Card fees paid by owners"], ...s.collections.map(c => [c.month, dollars(c.billedCents), dollars(c.collectedCents), dollars(c.feesPaidByOwnersCents)])])}>
          <Download className="w-4 h-4 mr-1.5" /> CSV
        </Button>}>
        <div className="flex items-end gap-2 h-40">
          {s.collections.map(c => (
            <div key={c.month} className="flex-1 flex flex-col items-center gap-1" title={`${c.month}: billed ${fmtUsd(c.billedCents)}, collected ${fmtUsd(c.collectedCents)}`}>
              <div className="w-full flex items-end gap-0.5 h-32">
                <div className="flex-1 rounded-t bg-slate-200" style={{ height: `${(c.billedCents / maxBar) * 100}%` }} />
                <div className="flex-1 rounded-t bg-emerald-500" style={{ height: `${(c.collectedCents / maxBar) * 100}%` }} />
              </div>
              <span className="text-[10px] text-slate-500">{c.month.slice(5)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2"><span className="inline-block w-2 h-2 bg-slate-200 mr-1" />Billed <span className="inline-block w-2 h-2 bg-emerald-500 ml-3 mr-1" />Collected</p>
      </Card>

      <Card title={`Delinquent homes (${delinquent.length})`} action={delinquent.length ? (
        <Button variant="outline" size="sm" onClick={() => downloadCsv(`delinquency-${today()}.csv`, [["Home", "Owner", "Email", "Overdue", "Total balance", "Days past due", "Assessment unpaid (days)"], ...delinquent.map(h => [h.label, h.ownerName, h.email, dollars(h.overdueCents), dollars(h.balanceCents), h.daysPastDue, h.assessmentDaysUnpaid])])}>
          <Download className="w-4 h-4 mr-1.5" /> CSV
        </Button>) : null}>
        {!delinquent.length ? <p className="text-sm text-slate-500">No one is past due. 🎉</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 text-xs"><th className="py-1">Home</th><th>Owner</th><th className="text-right">Overdue</th><th className="text-right">Days</th><th></th></tr></thead>
            <tbody>{delinquent.slice(0, 50).map(h => (
              <tr key={h.homeId} className="border-t">
                <td className="py-2">{h.label}</td><td>{h.ownerName}</td>
                <td className="text-right font-semibold text-red-600">{fmtUsd(h.overdueCents)}</td><td className="text-right">{h.daysPastDue}</td>
                <td className="text-right">{h.lienEligible && <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 rounded px-1.5 py-0.5">30+ days</span>}</td>
              </tr>))}</tbody>
          </table>
        )}
        {rules.lien && delinquent.some(h => h.lienEligible) && (
          <p className="text-xs text-slate-500 mt-3">
            <strong>30+ days:</strong> in {rules.name}, an assessment unpaid 30 days or more can become a lien once the association mails a statement of the amount due by first-class mail at least {rules.lien.noticeDaysBeforeFiling} days before filing with {rules.lien.filedWith} ({rules.lien.citation}). Keycove doesn't file liens — talk to your attorney. You can print a statement of amount due from the Homes tab.
          </p>
        )}
      </Card>
      <div className="flex gap-2"><Button variant="outline" onClick={() => goTo("billing")}>Billing settings</Button><Button variant="outline" onClick={() => goTo("payments")}>All payments</Button></div>
    </div>
  );
}

// ─── Homes ──────────────────────────────────────────────────────────────────
type HomeForm = { homeId?: number; lot: string; unit: string; address: string; ownerName: string; email: string; phone: string; mailingAddress: string; assessment: string };
const blankHome: HomeForm = { lot: "", unit: "", address: "", ownerName: "", email: "", phone: "", mailingAddress: "", assessment: "" };

function Homes({ associationId }: { associationId: number }) {
  const homes = trpc.hoaBoards.board.homes.useQuery({ associationId });
  const summary = trpc.hoaBoards.board.summary.useQuery({ associationId });
  const info = trpc.hoaBoards.board.get.useQuery({ associationId });
  const saveHome = trpc.hoaBoards.board.saveHome.useMutation();
  const setActive = trpc.hoaBoards.board.setHomeActive.useMutation();
  const invite = trpc.hoaBoards.board.sendInvites.useMutation();
  const utils = trpc.useUtils();
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState<HomeForm | null>(null);
  const [detail, setDetail] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const byHome = new Map((summary.data?.homes ?? []).map(h => [h.homeId, h]));
  const list = (homes.data ?? []).filter(h => (showInactive || h.active) && (!q || `${h.lot} ${h.unit} ${h.address} ${h.ownerName} ${h.email}`.toLowerCase().includes(q.toLowerCase())));
  const uninvited = (homes.data ?? []).filter(h => h.active && h.email && !h.inviteSentAt).length;
  const refresh = () => utils.hoaBoards.board.invalidate();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <Input placeholder="Search lot, address, owner, email" value={q} onChange={e => setQ(e.target.value)} className="max-w-xs bg-white" />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImporting(true)}><Upload className="w-4 h-4 mr-1.5" /> Import roster</Button>
          <Button variant="outline" onClick={() => setForm({ ...blankHome })}><Plus className="w-4 h-4 mr-1.5" /> Add home</Button>
          <Button style={{ background: BRAND }} disabled={!uninvited || invite.isPending} onClick={async () => {
            try { const r = await invite.mutateAsync({ associationId, onlyNew: true }); toast.success(`Sent ${r.sent} invite${r.sent === 1 ? "" : "s"}${r.skipped ? ` (${r.skipped} skipped)` : ""}.`); refresh(); } catch (e) { toast.error(errMsg(e)); }
          }}><Mail className="w-4 h-4 mr-1.5" /> Invite {uninvited || ""} homeowner{uninvited === 1 ? "" : "s"}</Button>
        </div>
      </div>

      {!homes.data?.length ? (
        <Card><div className="text-center py-8"><Users className="w-10 h-10 mx-auto text-slate-300 mb-2" /><p className="font-semibold text-slate-800">No homes yet</p><p className="text-sm text-slate-500 mb-4">Import your roster from a spreadsheet, or add homes one at a time.</p><Button style={{ background: BRAND }} onClick={() => setImporting(true)}>Import roster</Button></div></Card>
      ) : (
        <div className="rounded-2xl border bg-white overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-3 py-2">Home</th><th>Owner</th><th>Email</th><th className="text-right">Assessment</th><th className="text-right">Balance</th><th className="px-3">Status</th><th></th></tr></thead>
            <tbody>{list.map(h => {
              const s = byHome.get(h.id);
              return (
                <tr key={h.id} className={`border-t ${h.active ? "" : "opacity-50"}`}>
                  <td className="px-3 py-2 font-medium">{[h.lot && `Lot ${h.lot}`, h.unit && `Unit ${h.unit}`].filter(Boolean).join(" · ") || "—"}<div className="text-xs text-slate-500">{h.address}</div></td>
                  <td>{h.ownerName}</td>
                  <td className="text-xs">{h.email ?? <span className="text-amber-600">no email</span>}{h.inviteSentAt && <span className="ml-1 text-slate-400">· invited</span>}</td>
                  <td className="text-right">{fmtUsd(h.assessmentCents ?? info.data?.association.assessmentCents ?? 0)}</td>
                  <td className="text-right font-semibold">{fmtUsd(s?.balanceCents ?? 0)}</td>
                  <td className="px-3">
                    {!h.active ? <span className="text-xs text-slate-400">inactive</span>
                      : s?.status === "delinquent" ? <span className="text-xs font-bold text-red-600">{s.daysPastDue}d late</span>
                      : s?.processing ? <span className="text-xs text-indigo-600">processing</span>
                      : s?.status === "open" ? <span className="text-xs text-slate-600">due</span>
                      : <span className="text-xs text-emerald-600 font-semibold">paid</span>}
                    {h.autopayEnabled ? <span className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">AUTO</span> : null}
                  </td>
                  <td className="px-2 whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDetail(h.id)}>Open</Button>
                    <Button variant="ghost" size="sm" onClick={() => setForm({ homeId: h.id, lot: h.lot ?? "", unit: h.unit ?? "", address: h.address ?? "", ownerName: h.ownerName, email: h.email ?? "", phone: h.phone ?? "", mailingAddress: h.mailingAddress ?? "", assessment: dollars(h.assessmentCents) })}>Edit</Button>
                  </td>
                </tr>);
            })}</tbody>
          </table>
          <label className="flex items-center gap-2 text-xs text-slate-500 px-3 py-2 border-t"><input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} /> Show inactive homes</label>
        </div>
      )}

      <Dialog open={importing} onOpenChange={setImporting}>
        <DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Import homeowner roster</DialogTitle></DialogHeader>
          <HoaRosterImport associationId={associationId} onDone={() => setImporting(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!form} onOpenChange={o => !o && setForm(null)}>
        <DialogContent><DialogHeader><DialogTitle>{form?.homeId ? "Edit home" : "Add home"}</DialogTitle></DialogHeader>
          {form && (
            <div className="grid grid-cols-2 gap-3">
              {([["lot", "Lot"], ["unit", "Unit"]] as const).map(([k, l]) => <div key={k}><Label>{l}</Label><Input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>)}
              <div className="col-span-2"><Label>Property address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="col-span-2"><Label>Owner name</Label><Input value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="col-span-2"><Label>Mailing address (if different — used for required notices)</Label><Input value={form.mailingAddress} onChange={e => setForm({ ...form, mailingAddress: e.target.value })} /></div>
              <div className="col-span-2"><Label>Assessment override ($, blank = HOA default)</Label><Input value={form.assessment} onChange={e => setForm({ ...form, assessment: e.target.value })} /></div>
              <div className="col-span-2 flex justify-between pt-2">
                {form.homeId ? <Button variant="outline" className="text-red-600" onClick={async () => {
                  const h = homes.data?.find(x => x.id === form.homeId);
                  try { await setActive.mutateAsync({ associationId, homeId: form.homeId!, active: !h?.active }); setForm(null); refresh(); } catch (e) { toast.error(errMsg(e)); }
                }}>{homes.data?.find(x => x.id === form.homeId)?.active ? "Mark inactive" : "Reactivate"}</Button> : <span />}
                <Button style={{ background: BRAND }} disabled={saveHome.isPending} onClick={async () => {
                  try {
                    await saveHome.mutateAsync({ associationId, homeId: form.homeId, lot: form.lot, unit: form.unit, address: form.address, ownerName: form.ownerName, email: form.email || null, phone: form.phone, mailingAddress: form.mailingAddress, assessmentCents: form.assessment.trim() ? toCents(form.assessment) : null });
                    setForm(null); refresh(); toast.success("Saved");
                  } catch (e) { toast.error(errMsg(e)); }
                }}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {detail && <HomeDetail associationId={associationId} homeId={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function HomeDetail({ associationId, homeId, onClose }: { associationId: number; homeId: number; onClose: () => void }) {
  const homes = trpc.hoaBoards.board.homes.useQuery({ associationId });
  const info = trpc.hoaBoards.board.get.useQuery({ associationId });
  const charges = trpc.hoaBoards.board.charges.useQuery({ associationId, homeId });
  const addCharge = trpc.hoaBoards.board.addCharge.useMutation();
  const voidCharge = trpc.hoaBoards.board.voidCharge.useMutation();
  const record = trpc.hoaBoards.board.recordPayment.useMutation();
  const payoff = trpc.hoaBoards.board.payoffStatement.useMutation();
  const invite = trpc.hoaBoards.board.sendInvites.useMutation();
  const utils = trpc.useUtils();
  const h = homes.data?.find(x => x.id === homeId);
  const rules = info.data?.rules;
  const [pay, setPay] = useState({ amount: "", method: "check" as "check" | "cash" | "other", reference: "", paidOn: today() });
  const [chg, setChg] = useState({ kind: "other" as "other" | "fine", description: "", amount: "", dueDate: today(), hearingHeld: false });
  const [po, setPo] = useState({ requestedOn: today(), closingDate: "", expedite: false, billFeeToOwner: false });
  const open = (charges.data ?? []).filter(c => c.status === "open");
  const balance = open.reduce((s, c) => s + c.amountCents - c.paidCents, 0);
  const refresh = () => utils.hoaBoards.board.invalidate();

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{h ? [h.lot && `Lot ${h.lot}`, h.unit && `Unit ${h.unit}`, h.address].filter(Boolean).join(" · ") : "Home"}</DialogTitle></DialogHeader>
        {h && <div className="text-sm text-slate-600 -mt-2">{h.ownerName} · {h.email ?? "no email"} {h.phone && `· ${h.phone}`} {h.autopayEnabled ? `· Autopay: ${h.paymentMethodLabel}` : ""}
          {h.email && <button className="ml-2 underline text-indigo-600" onClick={async () => { try { await invite.mutateAsync({ associationId, homeIds: [h.id] }); toast.success("Invite sent"); refresh(); } catch (e) { toast.error(errMsg(e)); } }}>Send portal invite</button>}
        </div>}
        <p className="font-bold text-lg">Balance {fmtUsd(balance)}</p>

        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 text-left"><tr><th className="px-3 py-1.5">Due</th><th>Charge</th><th className="text-right">Amount</th><th className="text-right">Paid</th><th className="px-3">Status</th><th></th></tr></thead>
            <tbody>{(charges.data ?? []).map(c => (
              <tr key={c.id} className={`border-t ${c.status === "void" ? "opacity-40 line-through" : ""}`}>
                <td className="px-3 py-1.5 whitespace-nowrap">{c.dueDate}</td><td>{c.description}</td>
                <td className="text-right">{fmtUsd(c.amountCents)}</td><td className="text-right">{fmtUsd(c.paidCents)}</td>
                <td className="px-3 text-xs">{c.status}</td>
                <td className="pr-2 text-right">{c.status === "open" && c.paidCents === 0 && <button className="text-xs text-red-600" onClick={async () => { if (!confirm("Void this charge?")) return; try { await voidCharge.mutateAsync({ associationId, chargeId: c.id }); refresh(); } catch (e) { toast.error(errMsg(e)); } }}>Void</button>}</td>
              </tr>))}
              {!charges.data?.length && <tr><td colSpan={6} className="px-3 py-4 text-center text-slate-400">No charges yet</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-3 space-y-2">
            <p className="font-semibold text-sm">Record a check or cash payment</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Amount $" value={pay.amount} onChange={e => setPay({ ...pay, amount: e.target.value })} />
              <select className="border rounded-md px-2 bg-white text-sm" value={pay.method} onChange={e => setPay({ ...pay, method: e.target.value as any })}><option value="check">Check</option><option value="cash">Cash</option><option value="other">Other</option></select>
              <Input placeholder="Check #" value={pay.reference} onChange={e => setPay({ ...pay, reference: e.target.value })} />
              <Input type="date" value={pay.paidOn} onChange={e => setPay({ ...pay, paidOn: e.target.value })} />
            </div>
            <Button size="sm" disabled={!pay.amount || record.isPending} onClick={async () => {
              try { await record.mutateAsync({ associationId, homeId, amountCents: toCents(pay.amount), method: pay.method, reference: pay.reference || null, paidOn: pay.paidOn }); toast.success("Payment recorded"); setPay({ ...pay, amount: "", reference: "" }); refresh(); } catch (e) { toast.error(errMsg(e)); }
            }}>Record payment</Button>
          </div>
          <div className="rounded-xl border p-3 space-y-2">
            <p className="font-semibold text-sm">Add a charge</p>
            <div className="grid grid-cols-2 gap-2">
              <select className="border rounded-md px-2 bg-white text-sm" value={chg.kind} onChange={e => setChg({ ...chg, kind: e.target.value as any })}><option value="other">Other charge</option><option value="fine">Fine (after hearing)</option></select>
              <Input placeholder="Amount $" value={chg.amount} onChange={e => setChg({ ...chg, amount: e.target.value })} />
              <Input className="col-span-2" placeholder="Description" value={chg.description} onChange={e => setChg({ ...chg, description: e.target.value })} />
              <Input type="date" value={chg.dueDate} onChange={e => setChg({ ...chg, dueDate: e.target.value })} />
            </div>
            {chg.kind === "fine" && rules?.fines && (
              <label className="flex items-start gap-2 text-xs text-slate-600"><input type="checkbox" className="mt-0.5" checked={chg.hearingHeld} onChange={e => setChg({ ...chg, hearingHeld: e.target.checked })} />
                The owner got notice and a hearing, and was told the decision ({rules.fines.citation}). Max {fmtUsd(rules.fines.maxPerDayCents)}.</label>
            )}
            <Button size="sm" disabled={!chg.amount || !chg.description || addCharge.isPending} onClick={async () => {
              try { await addCharge.mutateAsync({ associationId, homeId, kind: chg.kind, description: chg.description, amountCents: toCents(chg.amount), dueDate: chg.dueDate, hearingHeld: chg.hearingHeld }); toast.success("Charge added"); setChg({ ...chg, amount: "", description: "" }); refresh(); } catch (e) { toast.error(errMsg(e)); }
            }}>Add charge</Button>
          </div>
        </div>

        <div className="rounded-xl border p-3 space-y-2">
          <p className="font-semibold text-sm">Statement of unpaid assessments (payoff / resale)</p>
          {rules?.payoffStatement && <p className="text-xs text-slate-500">{rules.name}: due within {rules.payoffStatement.dueBusinessDays} business days of a written request; fee up to {fmtUsd(rules.payoffStatement.maxFeeCents)}, plus up to {fmtUsd(rules.payoffStatement.expediteFeeCents)} if requested within {rules.payoffStatement.expediteWindowHours} hours of closing ({rules.payoffStatement.citation}). Your fee: {fmtUsd(info.data?.association.payoffFeeCents ?? 0)} (set it under Billing).</p>}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><Label className="text-xs">Request received</Label><Input type="date" value={po.requestedOn} onChange={e => setPo({ ...po, requestedOn: e.target.value })} /></div>
            <div><Label className="text-xs">Closing date (optional)</Label><Input type="date" value={po.closingDate} onChange={e => setPo({ ...po, closingDate: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={po.expedite} onChange={e => setPo({ ...po, expedite: e.target.checked })} /> Expedited</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={po.billFeeToOwner} onChange={e => setPo({ ...po, billFeeToOwner: e.target.checked })} /> Add the fee to the owner's account</label>
          </div>
          <Button size="sm" variant="outline" disabled={payoff.isPending} onClick={async () => {
            try { const st = await payoff.mutateAsync({ associationId, homeId, requestedOn: po.requestedOn, closingDate: po.closingDate || null, expedite: po.expedite, billFeeToOwner: po.billFeeToOwner }); printStatement(st); refresh(); } catch (e) { toast.error(errMsg(e)); }
          }}><Printer className="w-4 h-4 mr-1.5" /> Create & print statement</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function printStatement(st: any) {
  const esc = (v: any) => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
  const w = window.open("", "_blank");
  if (!w) { toast.error("Allow pop-ups to print the statement."); return; }
  w.document.write(`<!doctype html><html><head><title>Statement of unpaid assessments</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#111;line-height:1.5}table{width:100%;border-collapse:collapse}td,th{padding:6px;border-bottom:1px solid #ddd;text-align:left}td.r,th.r{text-align:right}h1{font-size:22px}small{color:#555}</style></head><body>
    <p><strong>${esc(st.association.legalName || st.association.name)}</strong><br>${esc(st.association.address)}<br>${esc(st.association.contactEmail ?? "")} ${esc(st.association.contactPhone ?? "")}</p>
    <h1>Statement of Unpaid Assessments and Other Charges</h1>
    <p>Lot / property: <strong>${esc(st.home.label)}</strong><br>Record owner: <strong>${esc(st.home.ownerName)}</strong><br>
    Request received: ${esc(st.requestedOn)}${st.closingDate ? ` · Closing: ${esc(st.closingDate)}` : ""}<br>Balance as of: <strong>${esc(st.asOf)}</strong></p>
    <table><thead><tr><th>Due date</th><th>Description</th><th class="r">Amount</th></tr></thead><tbody>
    ${st.items.map((i: any) => `<tr><td>${esc(i.dueDate)}</td><td>${esc(i.description)}${i.processing ? " (payment processing)" : ""}</td><td class="r">${fmtUsd(i.amountCents)}</td></tr>`).join("") || `<tr><td colspan="3">No unpaid assessments or charges.</td></tr>`}
    <tr><td></td><td><strong>Total unpaid</strong></td><td class="r"><strong>${fmtUsd(st.totalCents)}</strong></td></tr></tbody></table>
    <p>Regular assessment: ${fmtUsd(st.regularAssessment.amountCents)} (${esc(FREQUENCY_LABEL[st.regularAssessment.frequency as HoaAssessmentFrequency] ?? st.regularAssessment.frequency)}).</p>
    ${st.feeCents || st.expediteFeeCents ? `<p>Statement fee: ${fmtUsd(st.feeCents)}${st.expediteFeeCents ? ` + expedite fee ${fmtUsd(st.expediteFeeCents)}` : ""}${st.feeBilledToOwner ? " (added to the owner's account)" : ""}.</p>` : ""}
    ${st.citation ? `<p><small>Prepared under ${esc(st.citation)}.${st.dueBy ? ` Due to the requester by ${esc(st.dueBy)}.` : ""} Amounts change as new assessments come due and payments post; confirm the payoff amount before closing.</small></p>` : ""}
    <p style="margin-top:48px">______________________________<br>Authorized representative, ${esc(st.association.name)}</p>
    <script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}

// ─── Billing ────────────────────────────────────────────────────────────────
function Billing({ associationId }: { associationId: number }) {
  const info = trpc.hoaBoards.board.get.useQuery({ associationId });
  const update = trpc.hoaBoards.board.updateBilling.useMutation();
  const run = trpc.hoaBoards.board.runBilling.useMutation();
  const specials = trpc.hoaBoards.board.specialAssessments.useQuery({ associationId });
  const createSpecial = trpc.hoaBoards.board.createSpecialAssessment.useMutation();
  const utils = trpc.useUtils();
  const a = info.data?.association;
  const rules = info.data?.rules;
  const [f, setF] = useState<any>(null);
  const [sa, setSa] = useState({ title: "", description: "", amount: "", dueDate: "", notify: true });
  useEffect(() => {
    if (a && !f) setF({
      assessment: dollars(a.assessmentCents), assessmentFrequency: a.assessmentFrequency, firstDueDate: a.firstDueDate ?? "",
      billingEnabled: !!a.billingEnabled, billAheadDays: a.billAheadDays, graceDays: a.graceDays, lateFeeEnabled: !!a.lateFeeEnabled,
      lateFeeMode: rules?.lateFee ? a.lateFeeMode : (a.lateFeeMode === "state_max" ? "flat" : a.lateFeeMode), lateFeeFlat: dollars(a.lateFeeFlatCents), lateFeePercent: a.lateFeePercent,
      reminderDaysBefore: a.reminderDaysBefore, acceptCards: !!a.acceptCards, payoffFee: dollars(a.payoffFeeCents), payoffExpedite: dollars(a.payoffExpediteFeeCents),
    });
  }, [a, f, rules]);
  if (!a || !f || !rules) return <Loader2 className="w-6 h-6 animate-spin text-slate-400" />;
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const exampleInstallment = toCents(f.assessment) || 15000;

  return (
    <div className="space-y-5">
      <Card title="Regular assessments">
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label>Default assessment per home ($)</Label><Input value={f.assessment} onChange={e => set("assessment", e.target.value)} /></div>
          <div><Label>How often</Label>
            <select className="w-full border rounded-md h-9 px-2 bg-white" value={f.assessmentFrequency} onChange={e => set("assessmentFrequency", e.target.value)}>
              <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Yearly</option>
            </select></div>
          <div><Label>First due date</Label><Input type="date" value={f.firstDueDate} onChange={e => set("firstDueDate", e.target.value)} /></div>
          <div><Label>Create charges this many days early</Label><Input type="number" value={f.billAheadDays} onChange={e => set("billAheadDays", Number(e.target.value))} /></div>
          <div><Label>Grace period (days)</Label><Input type="number" value={f.graceDays} onChange={e => set("graceDays", Number(e.target.value))} /></div>
          <div><Label>Reminder this many days before</Label><Input type="number" value={f.reminderDaysBefore} onChange={e => set("reminderDaysBefore", Number(e.target.value))} /></div>
        </div>
        <label className="flex items-center gap-3 mt-4"><Switch checked={f.billingEnabled} onCheckedChange={v => set("billingEnabled", v)} /><span className="text-sm"><strong>Billing on</strong> — Keycove creates each home's charge {f.billAheadDays} days before it's due, emails reminders and runs autopay. Due dates before today are never billed.</span></label>
      </Card>

      <Card title="Late charges">
        <label className="flex items-center gap-3 mb-3"><Switch checked={f.lateFeeEnabled} onCheckedChange={v => set("lateFeeEnabled", v)} /><span className="text-sm">Add a late charge each month an installment stays unpaid after the grace period</span></label>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label>Amount</Label>
            <select className="w-full border rounded-md h-9 px-2 bg-white" value={f.lateFeeMode} onChange={e => set("lateFeeMode", e.target.value)}>
              {rules.lateFee && <option value="state_max">The {rules.state} maximum</option>}
              <option value="flat">Flat amount</option><option value="percent">Percent of the unpaid installment</option>
            </select></div>
          {f.lateFeeMode === "flat" && <div><Label>Flat amount ($)</Label><Input value={f.lateFeeFlat} onChange={e => set("lateFeeFlat", e.target.value)} /></div>}
          {f.lateFeeMode === "percent" && <div><Label>Percent</Label><Input type="number" value={f.lateFeePercent} onChange={e => set("lateFeePercent", Number(e.target.value))} /></div>}
        </div>
        {rules.lateFee ? (
          <p className="text-xs text-slate-500 mt-3"><strong>{rules.name} limit ({rules.lateFee.citation}):</strong> {rules.lateFee.text} Keycove never charges more than this — on a {fmtUsd(exampleInstallment)} installment the most is {fmtUsd(Math.max(rules.lateFee.flatCentsPerMonth, Math.floor(exampleInstallment * rules.lateFee.percentOfInstallment / 100)))} a month. Late charges must also be allowed by your declaration or bylaws.</p>
        ) : <p className="text-xs text-amber-700 mt-3">{rules.notes[0]}</p>}
      </Card>

      <Card title="Payments and statement fees">
        <label className="flex items-center gap-3"><Switch checked={f.acceptCards} onCheckedChange={v => set("acceptCards", v)} /><span className="text-sm">Accept cards. Bank (ACH) payments are always free for homeowners; card payers cover the card processing cost (2.9% + 30¢) at cost, so the HOA receives the full amount.</span></label>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div><Label>Statement of unpaid assessments fee ($)</Label><Input value={f.payoffFee} onChange={e => set("payoffFee", e.target.value)} /></div>
          <div><Label>Expedite fee ($)</Label><Input value={f.payoffExpedite} onChange={e => set("payoffExpedite", e.target.value)} /></div>
        </div>
        {rules.payoffStatement && <p className="text-xs text-slate-500 mt-2">{rules.name} caps: {fmtUsd(rules.payoffStatement.maxFeeCents)} per statement, plus {fmtUsd(rules.payoffStatement.expediteFeeCents)} when requested within {rules.payoffStatement.expediteWindowHours} hours of closing ({rules.payoffStatement.citation}).</p>}
        {info.data?.achFeeBearer === "hoa" && <p className="text-xs text-slate-500 mt-2">Bank payments: Stripe's ACH cost (0.8%, max $5 per payment) is deducted from the payout. On a $150 payment that's $1.20.</p>}
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button style={{ background: BRAND }} disabled={update.isPending} onClick={async () => {
          if (f.billingEnabled && !f.firstDueDate) { toast.error("Set the first due date."); return; }
          try {
            await update.mutateAsync({
              associationId, assessmentCents: toCents(f.assessment), assessmentFrequency: f.assessmentFrequency, firstDueDate: f.firstDueDate || today(),
              billingEnabled: f.billingEnabled, billAheadDays: f.billAheadDays, graceDays: f.graceDays, lateFeeEnabled: f.lateFeeEnabled, lateFeeMode: f.lateFeeMode,
              lateFeeFlatCents: toCents(f.lateFeeFlat), lateFeePercent: f.lateFeePercent, reminderDaysBefore: f.reminderDaysBefore, acceptCards: f.acceptCards,
              payoffFeeCents: toCents(f.payoffFee), payoffExpediteFeeCents: toCents(f.payoffExpedite),
            });
            toast.success("Billing settings saved"); utils.hoaBoards.board.invalidate(); setF(null);
          } catch (e) { toast.error(errMsg(e)); }
        }}>Save billing settings</Button>
        <Button variant="outline" disabled={run.isPending || !a.billingEnabled} onClick={async () => {
          try { const r = await run.mutateAsync({ associationId }); toast.success(`${r.created} charge${r.created === 1 ? "" : "s"} created, ${r.lateFees} late charge${r.lateFees === 1 ? "" : "s"}.`); utils.hoaBoards.board.invalidate(); } catch (e) { toast.error(errMsg(e)); }
        }}>Create due charges now</Button>
      </div>

      <Card title="Special assessments">
        <div className="grid sm:grid-cols-4 gap-2">
          <Input className="sm:col-span-2" placeholder="Title (e.g. Pool resurfacing)" value={sa.title} onChange={e => setSa({ ...sa, title: e.target.value })} />
          <Input placeholder="Per home $" value={sa.amount} onChange={e => setSa({ ...sa, amount: e.target.value })} />
          <Input type="date" value={sa.dueDate} onChange={e => setSa({ ...sa, dueDate: e.target.value })} />
          <Textarea className="sm:col-span-4" placeholder="Details for homeowners (optional)" value={sa.description} onChange={e => setSa({ ...sa, description: e.target.value })} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={sa.notify} onChange={e => setSa({ ...sa, notify: e.target.checked })} /> Email every homeowner</label>
          <Button size="sm" disabled={!sa.title || !sa.amount || !sa.dueDate || createSpecial.isPending} onClick={async () => {
            if (!confirm(`Bill ${fmtUsd(toCents(sa.amount))} to every active home?`)) return;
            try { const r = await createSpecial.mutateAsync({ associationId, title: sa.title, description: sa.description || null, amountCents: toCents(sa.amount), dueDate: sa.dueDate, notify: sa.notify }); toast.success(`Billed ${r.created} homes${sa.notify ? `, emailed ${r.emailed}` : ""}.`); setSa({ title: "", description: "", amount: "", dueDate: "", notify: true }); utils.hoaBoards.board.invalidate(); } catch (e) { toast.error(errMsg(e)); }
          }}>Bill every home</Button>
        </div>
        {!!specials.data?.length && <ul className="mt-4 text-sm divide-y">{specials.data.map(s => <li key={s.id} className="py-2 flex justify-between"><span>{s.title}</span><span className="text-slate-500">{fmtUsd(s.amountCents)} · due {s.dueDate}</span></li>)}</ul>}
      </Card>
    </div>
  );
}

// ─── Payments ───────────────────────────────────────────────────────────────
function Payments({ associationId }: { associationId: number }) {
  const payments = trpc.hoaBoards.board.payments.useQuery({ associationId });
  const homes = trpc.hoaBoards.board.homes.useQuery({ associationId });
  const charges = trpc.hoaBoards.board.charges.useQuery({ associationId });
  const homeLabelById = new Map((homes.data ?? []).map(h => [h.id, [h.lot && `Lot ${h.lot}`, h.unit && `Unit ${h.unit}`, h.address].filter(Boolean).join(" · ")]));
  const ownerById = new Map((homes.data ?? []).map(h => [h.id, h.ownerName]));
  const rows = (payments.data ?? []).filter(p => p.status !== "pending" && p.status !== "canceled");
  const methodLabel: Record<string, string> = { ach: "Bank", card: "Card", check: "Check", cash: "Cash", other: "Other" };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => downloadCsv(`payments-${today()}.csv`, [
          ["Receipt", "Date", "Home", "Owner", "Method", "Source", "Status", "Applied to dues", "Card fee (owner)", "Total charged", "Keycove/Stripe fee from payout", "Reference"],
          ...rows.map(p => [p.receiptNumber, (p.paidAt ?? p.createdAt).toISOString().slice(0, 10), homeLabelById.get(p.homeId), ownerById.get(p.homeId), methodLabel[p.method], p.source, p.status, dollars(p.amountCents), dollars(p.feeCents), dollars(p.totalCents), p.method === "ach" && p.achFeeBearer === "hoa" ? dollars(p.applicationFeeCents) : "0.00", p.reference]),
        ])}><Download className="w-4 h-4 mr-1.5" /> Payments CSV</Button>
        <Button variant="outline" size="sm" onClick={() => downloadCsv(`charges-${today()}.csv`, [
          ["Due date", "Home", "Owner", "Kind", "Description", "Amount", "Paid", "Status"],
          ...(charges.data ?? []).map(c => [c.dueDate, homeLabelById.get(c.homeId), ownerById.get(c.homeId), c.kind, c.description, dollars(c.amountCents), dollars(c.paidCents), c.status]),
        ])}><Download className="w-4 h-4 mr-1.5" /> Charges CSV</Button>
      </div>
      <div className="rounded-2xl border bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-3 py-2">Date</th><th>Home</th><th>Method</th><th className="text-right">Dues</th><th className="text-right">Owner fee</th><th className="px-3">Status</th><th>Receipt</th></tr></thead>
          <tbody>{rows.map(p => (
            <tr key={p.id} className="border-t">
              <td className="px-3 py-2 whitespace-nowrap">{(p.paidAt ?? p.createdAt).toISOString().slice(0, 10)}</td>
              <td>{homeLabelById.get(p.homeId)}<div className="text-xs text-slate-500">{ownerById.get(p.homeId)}</div></td>
              <td>{methodLabel[p.method]}{p.source === "autopay" ? " · auto" : ""}{p.reference ? ` #${p.reference}` : ""}</td>
              <td className="text-right font-semibold">{fmtUsd(p.amountCents)}</td><td className="text-right text-slate-500">{p.feeCents ? fmtUsd(p.feeCents) : "—"}</td>
              <td className="px-3"><span className={`text-xs font-semibold ${p.status === "succeeded" ? "text-emerald-600" : p.status === "failed" ? "text-red-600" : "text-indigo-600"}`}>{p.status === "processing" ? "settling" : p.status}</span>{p.failureReason && <div className="text-[11px] text-red-500">{p.failureReason}</div>}</td>
              <td className="text-xs text-slate-500">{p.receiptNumber}</td>
            </tr>))}
            {!rows.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">No payments yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Bank & payouts ─────────────────────────────────────────────────────────
function Payouts({ associationId }: { associationId: number }) {
  const status = trpc.hoaBoards.board.connectStatus.useQuery({ associationId });
  const payouts = trpc.hoaBoards.board.payouts.useQuery({ associationId }, { enabled: status.data?.status === "active" });
  const link = trpc.hoaBoards.board.connectLink.useMutation();
  const dash = trpc.hoaBoards.board.stripeDashboardLink.useMutation();
  const s = status.data;
  if (!s) return <Loader2 className="w-6 h-6 animate-spin text-slate-400" />;
  const go = async () => { try { window.location.href = (await link.mutateAsync({ associationId })).url; } catch (e) { toast.error(errMsg(e)); } };
  return (
    <div className="space-y-5">
      <Card title="HOA bank account">
        {s.status === "active" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-500" /><div><p className="font-semibold">Connected{"bank" in s && s.bank ? ` · ${s.bank.bankName ?? "Bank"} ••${s.bank.last4}` : ""}</p><p className="text-sm text-slate-500">Homeowner payments go straight to this account{"payoutSchedule" in s && s.payoutSchedule ? ` (${s.payoutSchedule} payouts)` : ""}.</p></div></div>
            <Button variant="outline" onClick={async () => { try { window.open((await dash.mutateAsync({ associationId })).url, "_blank"); } catch (e) { toast.error(errMsg(e)); } }}><ExternalLink className="w-4 h-4 mr-1.5" /> Stripe dashboard</Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 mb-3">{s.status === "pending" ? "Stripe needs a few more details before payouts can start." : "Connect the HOA's bank account so homeowner payments land there directly. Stripe asks for the HOA's EIN, an officer's details and the bank account — about 10 minutes."}</p>
            <Button style={{ background: BRAND }} onClick={go} disabled={link.isPending}>{link.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{s.status === "pending" ? "Finish Stripe setup" : "Connect bank account"}</Button>
          </div>
        )}
      </Card>
      {s.status === "active" && payouts.data && (
        <Card title="Balance & payouts">
          <div className="grid grid-cols-2 gap-3 mb-4"><Stat label="Available" value={fmtUsd(payouts.data.available)} /><Stat label="On the way" value={fmtUsd(payouts.data.pending)} /></div>
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th>Arrives</th><th className="text-right">Amount</th><th className="text-right">Status</th></tr></thead>
            <tbody>{payouts.data.payouts.map(p => <tr key={p.id} className="border-t"><td className="py-1.5">{p.arrivalDate}</td><td className="text-right">{fmtUsd(p.amount)}</td><td className="text-right text-xs">{p.status}</td></tr>)}
              {!payouts.data.payouts.length && <tr><td colSpan={3} className="py-4 text-center text-slate-400">No payouts yet</td></tr>}</tbody></table>
          <p className="text-xs text-slate-500 mt-3">Card payments reach the bank in about 2 business days; bank (ACH) payments take about 4 business days to settle first.</p>
        </Card>
      )}
    </div>
  );
}

// ─── Announcements & documents ──────────────────────────────────────────────
function Comms({ associationId }: { associationId: number }) {
  const anns = trpc.hoaBoards.board.announcements.useQuery({ associationId });
  const docs = trpc.hoaBoards.board.documents.useQuery({ associationId });
  const post = trpc.hoaBoards.board.postAnnouncement.useMutation();
  const upload = trpc.hoaBoards.board.uploadDocument.useMutation();
  const remove = trpc.hoaBoards.board.removeDocument.useMutation();
  const utils = trpc.useUtils();
  const [ann, setAnn] = useState({ title: "", body: "", email: true });
  const [doc, setDoc] = useState({ name: "", category: "rules" as any });
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title="Announcements">
        <Input placeholder="Title" value={ann.title} onChange={e => setAnn({ ...ann, title: e.target.value })} />
        <Textarea className="mt-2" rows={5} placeholder="Message to homeowners" value={ann.body} onChange={e => setAnn({ ...ann, body: e.target.value })} />
        <div className="flex items-center justify-between mt-2">
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={ann.email} onChange={e => setAnn({ ...ann, email: e.target.checked })} /> Also email homeowners</label>
          <Button size="sm" disabled={!ann.title || !ann.body || post.isPending} onClick={async () => {
            try { const r = await post.mutateAsync({ associationId, ...ann }); toast.success(`Posted${ann.email ? `, emailed ${r.emailed}` : ""}.`); setAnn({ title: "", body: "", email: true }); utils.hoaBoards.board.announcements.invalidate(); } catch (e) { toast.error(errMsg(e)); }
          }}>Post</Button>
        </div>
        <ul className="mt-4 divide-y">{(anns.data ?? []).map(x => <li key={x.id} className="py-2"><p className="font-semibold text-sm">{x.title}</p><p className="text-xs text-slate-500">{new Date(x.createdAt).toLocaleDateString()} · emailed {x.emailedCount}</p></li>)}</ul>
      </Card>
      <Card title="Documents & rules">
        <p className="text-xs text-slate-500 mb-2">Homeowners see these in their portal. Paste your rules text under Plan & settings.</p>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Name (e.g. Declaration)" value={doc.name} onChange={e => setDoc({ ...doc, name: e.target.value })} />
          <select className="border rounded-md px-2 bg-white text-sm" value={doc.category} onChange={e => setDoc({ ...doc, category: e.target.value })}>
            {["declaration", "bylaws", "rules", "minutes", "budget", "forms", "other"].map(c => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <label className="mt-2 inline-flex items-center gap-2 text-sm cursor-pointer rounded-md border px-3 py-1.5 hover:bg-slate-50">
          {upload.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload PDF or image
          <input type="file" accept="application/pdf,image/*" className="hidden" onChange={async e => {
            const file = e.target.files?.[0]; e.target.value = "";
            if (!file) return;
            try { await upload.mutateAsync({ associationId, name: doc.name || file.name, category: doc.category, filename: file.name, dataUrl: await readAsDataUrl(file) }); setDoc({ ...doc, name: "" }); utils.hoaBoards.board.documents.invalidate(); toast.success("Uploaded"); } catch (err) { toast.error(errMsg(err)); }
          }} />
        </label>
        <ul className="mt-4 divide-y">{(docs.data ?? []).map(x => (
          <li key={x.id} className="py-2 flex items-center justify-between text-sm">
            <a href={x.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-700 hover:underline"><FileText className="w-4 h-4" /> {x.name} <span className="text-xs text-slate-400">{x.category}</span></a>
            <button onClick={async () => { if (!confirm("Remove this document?")) return; await remove.mutateAsync({ associationId, documentId: x.id }); utils.hoaBoards.board.documents.invalidate(); }}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></button>
          </li>))}</ul>
      </Card>
    </div>
  );
}

// ─── Plan & settings ────────────────────────────────────────────────────────
function PlanSettings({ associationId }: { associationId: number }) {
  const info = trpc.hoaBoards.board.get.useQuery({ associationId });
  const checkout = trpc.hoaBoards.board.planCheckout.useMutation();
  const change = trpc.hoaBoards.board.changePlan.useMutation();
  const portal = trpc.hoaBoards.board.billingPortal.useMutation();
  const update = trpc.hoaBoards.board.updateProfile.useMutation();
  const utils = trpc.useUtils();
  const [interval, setInterval_] = useState<"month" | "year">("month");
  const [p, setP] = useState<Profile | null>(null);
  const [rulesText, setRulesText] = useState<string | null>(null);
  const d = info.data;
  useEffect(() => {
    if (d && !p) {
      const a = d.association;
      setP({ name: a.name, legalName: a.legalName ?? "", communityType: a.communityType, state: a.state, address: a.address ?? "", city: a.city ?? "", zip: a.zip ?? "", contactEmail: a.contactEmail ?? "", contactPhone: a.contactPhone ?? "" });
      setRulesText(a.rulesText ?? "");
      setInterval_(a.billingInterval);
    }
  }, [d, p]);
  if (!d || !p) return <Loader2 className="w-6 h-6 animate-spin text-slate-400" />;
  const a = d.association;
  const hasPlan = !!a.stripeSubscriptionId && a.planStatus !== "cancelled";
  return (
    <div className="space-y-5">
      <Card title="Keycove HOA plan">
        <p className="text-sm text-slate-600 mb-3">Every plan includes every feature. Your plan follows your number of active homes ({d.homeCount}). {a.planStatus === "trialing" && !hasPlan ? `Your free trial ends ${a.trialEndsAt ? new Date(a.trialEndsAt).toLocaleDateString() : ""} — pick a plan any time; you won't be charged until the trial ends.` : ""}</p>
        <div className="inline-flex rounded-lg border p-0.5 mb-4 text-sm">
          {(["month", "year"] as const).map(i => <button key={i} onClick={() => setInterval_(i)} className={`px-3 py-1 rounded-md ${interval === i ? "bg-slate-900 text-white" : "text-slate-600"}`}>{i === "month" ? "Monthly" : "Yearly (save 15%)"}</button>)}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOA_PLANS.map(pl => {
            const current = hasPlan && a.planTier === pl.tier && a.billingInterval === interval;
            const fits = d.homeCount <= pl.maxHomes;
            const suggested = d.suggestedPlan.tier === pl.tier;
            return (
              <div key={pl.tier} className={`rounded-xl border p-4 ${suggested ? "border-indigo-400 ring-1 ring-indigo-200" : ""}`}>
                <p className="font-bold">{pl.label}</p>
                <p className="text-2xl font-extrabold mt-1">{fmtUsd(interval === "month" ? pl.monthlyCents : pl.yearlyCents)}<span className="text-sm font-normal text-slate-500">/{interval === "month" ? "mo" : "yr"}</span></p>
                {interval === "year" && <p className="text-xs text-slate-500">{fmtUsd(Math.round(pl.yearlyCents / 12))}/mo</p>}
                {current ? <p className="mt-3 text-sm font-semibold text-emerald-600">Current plan</p>
                  : hasPlan ? <Button size="sm" variant="outline" className="mt-3 w-full" disabled={!fits || change.isPending} onClick={async () => {
                    if (!confirm(`Switch to ${pl.label}, billed ${interval === "month" ? "monthly" : "yearly"}?`)) return;
                    try { await change.mutateAsync({ associationId, tier: pl.tier, interval }); toast.success("Plan updated"); utils.hoaBoards.board.invalidate(); } catch (e) { toast.error(errMsg(e)); }
                  }}>{fits ? "Switch" : "Too small"}</Button>
                  : suggested ? <Button size="sm" className="mt-3 w-full" style={{ background: BRAND }} disabled={checkout.isPending} onClick={async () => {
                    try { window.location.href = (await checkout.mutateAsync({ associationId, interval })).url!; } catch (e) { toast.error(errMsg(e)); }
                  }}>Choose plan</Button>
                  : <p className="mt-3 text-xs text-slate-400">{fits ? "Fits, but a smaller plan covers you" : "For larger HOAs"}</p>}
              </div>);
          })}
        </div>
        {hasPlan && <Button variant="outline" size="sm" className="mt-4" onClick={async () => { try { window.location.href = (await portal.mutateAsync({ associationId })).url; } catch (e) { toast.error(errMsg(e)); } }}>Update card, invoices or cancel</Button>}
      </Card>

      <Card title="HOA profile">
        <ProfileFields p={p} set={setP} />
        <div className="mt-4"><Label>Rules and regulations (shown in the homeowner portal)</Label><Textarea rows={6} value={rulesText ?? ""} onChange={e => setRulesText(e.target.value)} /></div>
        <Button className="mt-4" style={{ background: BRAND }} disabled={update.isPending} onClick={async () => {
          try { await update.mutateAsync({ associationId, ...p, rulesText }); toast.success("Saved"); utils.hoaBoards.board.invalidate(); } catch (e) { toast.error(errMsg(e)); }
        }}>Save profile</Button>
      </Card>

      <Card title={`${d.rules.name} rules Keycove follows`}>
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          {d.rules.lateFee && <li>Late charges: {d.rules.lateFee.text} ({d.rules.lateFee.citation})</li>}
          {d.rules.payoffStatement && <li>Statements of unpaid assessments: within {d.rules.payoffStatement.dueBusinessDays} business days; fee up to {fmtUsd(d.rules.payoffStatement.maxFeeCents)}, plus {fmtUsd(d.rules.payoffStatement.expediteFeeCents)} if requested within {d.rules.payoffStatement.expediteWindowHours} hours of closing ({d.rules.payoffStatement.citation})</li>}
          {d.rules.interest && <li>{d.rules.interest.note} ({d.rules.interest.citation})</li>}
          {d.rules.lien && <li>Liens: an assessment unpaid {d.rules.lien.minDaysUnpaid}+ days; mail a statement of the amount due {d.rules.lien.noticeDaysBeforeFiling}+ days before filing by {d.rules.lien.noticeMethod}; file with {d.rules.lien.filedWith}; foreclosure only after {d.rules.lien.foreclosureMinDaysUnpaid}+ days unpaid and a board vote ({d.rules.lien.citation}). Keycove does not file liens.</li>}
          {d.rules.fines && <li>{d.rules.fines.note} ({d.rules.fines.citation})</li>}
          {d.rules.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
        <p className="text-xs text-slate-400 mt-3">Not legal advice. Your declaration and bylaws can be stricter; check with your association's attorney.</p>
      </Card>
    </div>
  );
}
