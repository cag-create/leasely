import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle2, XCircle, Building2, Landmark, FileText } from "lucide-react";
import { LOGO_URL } from "@/lib/brand";
import { BRAND, ACCENT, fmt, downloadBase64 } from "./trust/shared";

/**
 * Owner portal: owners whose properties a brokerage manages see the money held
 * for them in trust, statements, year-to-date totals, and approve requests.
 */
export default function OwnerPortal() {
  const { isAuthenticated, loading, user } = useAuth();
  const search = useSearch();
  const [, navigate] = useLocation();
  const invite = new URLSearchParams(search).get("invite");
  const accept = trpc.trust.ownerPortal.acceptInvite.useMutation();
  const overview = trpc.trust.ownerPortal.overview.useQuery(undefined, { enabled: isAuthenticated && !invite });
  const pdf = trpc.trust.ownerPortal.statementPdf.useMutation();
  const decide = trpc.trust.ownerPortal.decideApproval.useMutation();
  const utils = trpc.useUtils();
  const tried = useRef(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !invite || tried.current) return;
    tried.current = true;
    accept.mutateAsync({ token: invite })
      .then((r) => { toast.success(`Connected to ${r.ownerName}'s owner records`); navigate("/owner-portal", { replace: true }); utils.trust.ownerPortal.overview.invalidate(); })
      .catch((e) => setAcceptError(e.message));
  }, [isAuthenticated, invite]);

  const next = encodeURIComponent(`/owner-portal${invite ? `?invite=${invite}` : ""}`);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/"><img src={LOGO_URL} alt="Keycove" className="h-7 cursor-pointer" /></Link>
          <span className="text-sm text-gray-500">{user?.email ? `Owner portal · ${user.email}` : "Owner portal"}</span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 [&_th]:px-2 [&_td]:px-2 [&_th:first-child]:pl-0 [&_td:first-child]:pl-0">
        {loading || (isAuthenticated && (overview.isLoading || accept.isPending)) ? (
          <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : !isAuthenticated ? (
          <div className="max-w-md mx-auto text-center bg-white rounded-2xl border p-8 space-y-4">
            <Landmark className="h-10 w-10 mx-auto" style={{ color: ACCENT }} />
            <h1 className="text-xl font-bold" style={{ color: BRAND }}>Your owner portal</h1>
            <p className="text-sm text-gray-600">See the rent your property manager collected for you, money held in trust, monthly statements and year-end totals. {invite ? "Sign in or create a free login with the email your manager has on file." : ""}</p>
            <div className="flex gap-3 justify-center">
              <Button asChild className="text-white" style={{ background: ACCENT }}><a href={`/login?next=${next}`}>Sign in</a></Button>
              <Button asChild variant="outline"><a href={`/signup?next=${next}`}>Create login</a></Button>
            </div>
          </div>
        ) : acceptError ? (
          <div className="max-w-md mx-auto text-center bg-white rounded-2xl border p-8 space-y-3">
            <XCircle className="h-10 w-10 mx-auto text-red-500" />
            <p className="text-sm text-gray-700">{acceptError}</p>
            <Button variant="outline" onClick={() => { setAcceptError(null); navigate("/owner-portal"); }}>Go to my portal</Button>
          </div>
        ) : !overview.data?.length ? (
          <div className="max-w-md mx-auto text-center bg-white rounded-2xl border p-8 space-y-3">
            <Building2 className="h-10 w-10 mx-auto text-gray-300" />
            <h1 className="font-bold" style={{ color: BRAND }}>No managed properties yet</h1>
            <p className="text-sm text-gray-600">Ask your property manager to send you an owner-portal invite from Keycove, then open the link while signed in.</p>
          </div>
        ) : overview.data.map((o) => {
          const total = o.properties.reduce((s, p) => s + p.balanceCents, 0);
          const available = o.properties.reduce((s, p) => s + p.availableCents, 0);
          const deposits = o.properties.reduce((s, p) => s + p.depositsHeldCents, 0);
          return (
            <section key={o.owner.id} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND }}>{o.owner.name}</h1>
                <p className="text-sm text-gray-500">Managed by {o.brokerage.name}{o.brokerage.email ? ` · ${o.brokerage.email}` : ""}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[["Held for you in trust", total], ["Next payout (est.)", available], ["Tenant deposits held", deposits], [`Rents collected ${o.ytd?.year ?? ""}`, o.ytd?.grossRentsCents ?? 0]].map(([k, v]) => (
                  <div key={k as string} className="rounded-xl border bg-white p-4"><div className="text-xs text-gray-500">{k}</div><div className="text-xl font-bold" style={{ color: BRAND }}>{fmt(v as number)}</div></div>
                ))}
              </div>

              {o.approvals.length > 0 && (
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 space-y-3">
                  <h2 className="text-base font-bold text-amber-900">Waiting for your approval</h2>
                  {o.approvals.map((a) => (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border p-3">
                      <div className="text-sm"><div className="font-semibold">{a.kind === "expense" ? `Pay ${a.payee}` : "Owner distribution"} · {fmt(a.amountCents)}</div><div className="text-gray-500">{a.description}</div></div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={decide.isPending} onClick={async () => { await decide.mutateAsync({ approvalId: a.id, approve: true }); toast.success("Approved"); overview.refetch(); }}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                        <Button size="sm" variant="outline" className="gap-1" disabled={decide.isPending} onClick={async () => { const note = prompt("Optional note for your manager") ?? undefined; await decide.mutateAsync({ approvalId: a.id, approve: false, note }); toast.success("Declined"); overview.refetch(); }}><XCircle className="h-4 w-4" /> Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border bg-white p-5">
                <h2 className="text-base font-bold mb-3">Properties</h2>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Property</th><th className="text-right">Balance</th><th className="text-right">Reserve</th><th className="text-right">Fees pending</th><th className="text-right">Deposits held</th></tr></thead>
                  <tbody>{o.properties.map((p) => (
                    <tr key={p.agreementId} className="border-b last:border-0"><td className="py-2">{p.propertyLabel}{p.status !== "active" && <span className="ml-2 text-xs text-gray-400">(ended)</span>}</td><td className="text-right font-semibold">{fmt(p.balanceCents)}</td><td className="text-right">{fmt(p.reserveCents)}</td><td className="text-right">{fmt(p.feesAccruedCents)}</td><td className="text-right">{fmt(p.depositsHeldCents)}</td></tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-white p-5">
                  <h2 className="text-base font-bold mb-3">Statements</h2>
                  {!o.statements.length ? <p className="text-sm text-gray-500">Your first monthly statement will appear here.</p> : (
                    <ul className="divide-y">{o.statements.map((s) => (
                      <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                        <span>{new Date(`${s.periodMonth}-01T12:00:00Z`).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</span>
                        <Button size="sm" variant="ghost" className="gap-1" disabled={pdf.isPending} onClick={async () => { const r = await pdf.mutateAsync({ ownerId: o.owner.id, periodMonth: s.periodMonth }); downloadBase64(r.base64, r.fileName); }}><Download className="h-4 w-4" /> PDF</Button>
                      </li>
                    ))}</ul>
                  )}
                  {o.ytd && <p className="text-xs text-gray-500 mt-3">Gross rents collected in {o.ytd.year}: {fmt(o.ytd.grossRentsCents)} · fees {fmt(o.ytd.feesCents)} · paid to you {fmt(o.ytd.disbursedCents)}. Your manager reports gross rents on Form 1099-MISC{o.ytd.reportable ? "" : " if they reach the IRS threshold"}.</p>}
                </div>
                <div className="rounded-2xl border bg-white p-5">
                  <h2 className="text-base font-bold mb-3">Recent activity</h2>
                  {!o.recent.length ? <p className="text-sm text-gray-500">No activity yet.</p> : (
                    <ul className="divide-y text-sm">{o.recent.map((e) => (
                      <li key={e.id} className="flex justify-between py-1.5 gap-3"><span className="truncate">{e.entryDate} · {e.description}</span><span className={e.amountCents < 0 ? "text-red-700" : "text-emerald-700"}>{fmt(e.amountCents)}</span></li>
                    ))}</ul>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border bg-white p-5">
                <h2 className="text-base font-bold mb-3">Documents</h2>
                {!o.documents.length ? <p className="text-sm text-gray-500">Your manager hasn't shared any documents yet (management agreement, inspection reports, insurance).</p> : (
                  <ul className="divide-y text-sm">{o.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3 py-2">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline truncate"><FileText className="h-4 w-4 shrink-0 text-gray-400" />{doc.title}</a>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </li>
                  ))}</ul>
                )}
              </div>
              <p className="text-xs text-gray-400">Your funds are held in your manager's trust (escrow) account. You can ask your manager in writing for copies of the records for your properties; in North Carolina they must provide them within 10 days (21 NCAC 58A .0117).</p>
            </section>
          );
        })}
      </main>
    </div>
  );
}
