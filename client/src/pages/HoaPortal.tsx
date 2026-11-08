/**
 * Keycove HOA — homeowner portal (/hoa-portal). Email one-time code sign-in,
 * then: balance, pay by bank (free) or card (fee at cost), autopay, history
 * with receipts, documents, rules and announcements.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Banknote, CheckCircle2, CreditCard, FileText, Loader2, LogOut, Megaphone, Printer, Receipt, RefreshCw, ScrollText } from "lucide-react";
import { fmtUsd, FREQUENCY_LABEL } from "@shared/hoaBoards";

const BRAND = "#1B2B5E";
const TOKEN_KEY = "keycove.hoaPortal.token";
const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
const errMsg = (e: any) => e?.message ?? "Something went wrong";

export default function HoaPortal() {
  const [token, setToken] = useState<string | null>(getToken);
  const save = (t: string | null) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* */ } setToken(t); };
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2"><img src="/keycove-logo.png" alt="Keycove" className="h-7" /><span className="text-sm font-bold text-slate-500">Homeowner portal</span></span>
          {token && <button onClick={() => save(null)} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1"><LogOut className="w-4 h-4" /> Sign out</button>}
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">{token ? <Portal token={token} onSignOut={() => save(null)} /> : <SignIn onToken={save} />}</main>
    </div>
  );
}

function SignIn({ onToken }: { onToken: (t: string) => void }) {
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get("email") ?? "");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const request = trpc.hoaBoards.portal.requestCode.useMutation();
  const verify = trpc.hoaBoards.portal.verifyCode.useMutation();
  return (
    <div className="max-w-md mx-auto mt-10 rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-extrabold text-slate-900">Pay your HOA dues</h1>
      <p className="text-slate-600 mt-1 text-sm">Sign in with the email your HOA has on file. We'll email you a 6-digit code — no password.</p>
      {!sent ? (
        <form className="mt-5 space-y-3" onSubmit={async e => { e.preventDefault(); try { await request.mutateAsync({ email }); setSent(true); } catch (err) { toast.error(errMsg(err)); } }}>
          <Input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Button type="submit" className="w-full" style={{ background: BRAND }} disabled={request.isPending}>{request.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Email me a code</Button>
        </form>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={async e => { e.preventDefault(); try { const r = await verify.mutateAsync({ email, code }); onToken(r.token); } catch (err) { toast.error(errMsg(err)); } }}>
          <p className="text-sm text-slate-600">If <strong>{email}</strong> is on your HOA's roster, a code is on its way. It expires in 15 minutes.</p>
          <Input inputMode="numeric" autoFocus maxLength={6} placeholder="123456" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} className="text-center text-2xl tracking-[0.4em]" />
          <Button type="submit" className="w-full" style={{ background: BRAND }} disabled={code.length !== 6 || verify.isPending}>{verify.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Sign in</Button>
          <button type="button" className="text-sm text-slate-500 underline w-full" onClick={() => { setSent(false); setCode(""); }}>Use a different email or resend</button>
        </form>
      )}
      <p className="text-xs text-slate-400 mt-6">Not getting a code? Your HOA board may not have your email yet — ask them to add it. Board member? <Link href="/hoa-board" className="underline">Go to the board dashboard</Link>.</p>
    </div>
  );
}

function Portal({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const data = trpc.hoaBoards.portal.data.useQuery({ token }, { retry: false });
  const confirm = trpc.hoaBoards.portal.confirmReturn.useMutation();
  const [homeId, setHomeId] = useState<number | null>(null);
  const [receiptId, setReceiptId] = useState<number | null>(null);

  useEffect(() => { if (data.error?.data?.code === "UNAUTHORIZED") { toast.error("Please sign in again."); onSignOut(); } }, [data.error, onSignOut]);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const sessionId = q.get("session_id");
    if (sessionId) {
      confirm.mutateAsync({ token, sessionId }).then(r => {
        if (r.status === "succeeded") toast.success("Payment received — thank you! A receipt is on its way.");
        else if (r.status === "processing") toast.success("Bank payment submitted. It takes about 4 business days to clear; we'll email your receipt.");
        else if (r.status === "autopay") toast.success("Autopay is set up.");
        void data.refetch();
      }).catch(() => {});
    } else if (q.get("checkout") === "cancelled" || q.get("autopay") === "cancelled") toast("No payment was made.");
    if (q.toString()) window.history.replaceState({}, "", "/hoa-portal");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (data.isLoading) return <div className="py-20 grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  const d = data.data;
  if (!d) return null;
  if (!d.homes.length) return (
    <div className="text-center py-16"><p className="font-semibold">No homes are linked to {d.email}.</p><p className="text-sm text-slate-500 mt-1">Ask your HOA board to add this email to your home, then sign in again.</p></div>
  );
  const home = d.homes.find(h => h.id === homeId) ?? d.homes[0];
  const docs = d.documents.filter(x => x.associationName === home.association.name);
  const anns = d.announcements.filter(x => x.associationName === home.association.name);

  return (
    <div className="space-y-5">
      {d.homes.length > 1 && (
        <select className="border rounded-md px-2 py-1.5 bg-white text-sm" value={home.id} onChange={e => setHomeId(Number(e.target.value))}>
          {d.homes.map(h => <option key={h.id} value={h.id}>{h.association.name} — {h.label}</option>)}
        </select>
      )}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{home.association.name}</p>
        <h1 className="text-2xl font-extrabold text-slate-900">{home.label || home.ownerName}</h1>
        <p className="text-sm text-slate-500">{home.ownerName} · {FREQUENCY_LABEL[home.association.assessmentFrequency]} assessment {fmtUsd(home.association.assessmentCents)}</p>
      </div>

      <PayCard home={home} token={token} />
      <AutopayCard home={home} token={token} onChange={() => data.refetch()} />

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold flex items-center gap-2 mb-3"><Receipt className="w-5 h-5" /> Payment history</h2>
        {!home.payments.length ? <p className="text-sm text-slate-500">No payments yet.</p> : (
          <table className="w-full text-sm"><tbody>{home.payments.map(p => (
            <tr key={p.id} className="border-t first:border-0">
              <td className="py-2">{p.date}</td>
              <td>{p.method === "ach" ? "Bank" : p.method === "card" ? "Card" : p.method[0].toUpperCase() + p.method.slice(1)}{p.source === "autopay" ? " · autopay" : ""}</td>
              <td className="text-right font-semibold">{fmtUsd(p.totalCents)}</td>
              <td className="text-right text-xs">{p.status === "succeeded" ? <button className="text-indigo-700 underline" onClick={() => setReceiptId(p.id)}>Receipt</button>
                : p.status === "processing" ? <span className="text-indigo-600">clearing</span> : <span className="text-red-600" title={p.failureReason ?? ""}>{p.status}</span>}</td>
            </tr>))}</tbody></table>
        )}
      </section>

      {anns.length > 0 && (
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold flex items-center gap-2 mb-3"><Megaphone className="w-5 h-5" /> Announcements</h2>
          <div className="space-y-4">{anns.map(x => <div key={x.id}><p className="font-semibold">{x.title}</p><p className="text-xs text-slate-400">{new Date(x.createdAt).toLocaleDateString()}</p><p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{x.body}</p></div>)}</div>
        </section>
      )}

      {(docs.length > 0 || home.association.rulesText) && (
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold flex items-center gap-2 mb-3"><ScrollText className="w-5 h-5" /> Documents & rules</h2>
          <ul className="space-y-1">{docs.map(x => <li key={x.id}><a href={x.url} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline text-sm flex items-center gap-2"><FileText className="w-4 h-4" />{x.name}<span className="text-xs text-slate-400">{x.category}</span></a></li>)}</ul>
          {home.association.rulesText && <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold">Rules and regulations</summary><p className="text-sm text-slate-700 whitespace-pre-wrap mt-2">{home.association.rulesText}</p></details>}
        </section>
      )}

      <p className="text-xs text-slate-400">Questions about your account? Contact {home.association.name}{home.association.contactEmail ? ` at ${home.association.contactEmail}` : ""}{home.association.contactPhone ? ` or ${home.association.contactPhone}` : ""}.</p>
      {receiptId && <ReceiptDialog token={token} paymentId={receiptId} onClose={() => setReceiptId(null)} />}
    </div>
  );
}

type PortalHome = inferRouterOutputs<AppRouter>["hoaBoards"]["portal"]["data"]["homes"][number];

function PayCard({ home, token }: { home: PortalHome; token: string }) {
  const checkout = trpc.hoaBoards.portal.checkout.useMutation();
  const [method, setMethod] = useState<"ach" | "card">("ach");
  const [autopay, setAutopay] = useState(false);
  const processing = home.charges.filter(c => c.processing);
  const pay = async () => {
    try { window.location.href = (await checkout.mutateAsync({ token, homeId: home.id, method, enableAutopay: autopay && !home.autopay.enabled })).url!; } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <section className="rounded-2xl border bg-white p-5">
      <div className="flex items-end justify-between">
        <div><p className="text-sm text-slate-500">Balance</p><p className="text-4xl font-extrabold text-slate-900">{fmtUsd(home.balanceCents)}</p></div>
        {home.balanceCents === 0 && <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-5 h-5" /> All paid</span>}
      </div>
      {home.charges.length > 0 && (
        <ul className="mt-3 text-sm divide-y">{home.charges.map(c => (
          <li key={c.id} className="py-1.5 flex justify-between gap-3"><span className="text-slate-700">{c.description}<span className="text-xs text-slate-400"> · due {c.dueDate}</span></span><span className="font-semibold whitespace-nowrap">{fmtUsd(c.amountCents)}{c.processing && <span className="ml-1 text-xs text-indigo-600 font-normal">clearing</span>}</span></li>
        ))}</ul>
      )}
      {processing.length > 0 && <p className="text-xs text-indigo-600 mt-2">A bank payment is clearing for the charges marked "clearing" (about 4 business days).</p>}
      {home.payableCents > 0 && (
        !home.association.canPay ? <p className="mt-4 text-sm text-amber-700">Online payments open as soon as {home.association.name} finishes connecting its bank account.</p> : (
          <div className="mt-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
              <button onClick={() => setMethod("ach")} className={`rounded-xl border-2 p-3 text-left ${method === "ach" ? "border-indigo-600 bg-indigo-50" : "border-slate-200"}`}>
                <p className="font-bold flex items-center gap-2"><Banknote className="w-4 h-4" /> Bank account</p>
                <p className="text-sm text-emerald-700 font-semibold">Free — no fee</p>
                <p className="text-xs text-slate-500">Total {fmtUsd(home.payableCents)}</p>
              </button>
              {home.association.acceptCards && (
                <button onClick={() => setMethod("card")} className={`rounded-xl border-2 p-3 text-left ${method === "card" ? "border-indigo-600 bg-indigo-50" : "border-slate-200"}`}>
                  <p className="font-bold flex items-center gap-2"><CreditCard className="w-4 h-4" /> Card</p>
                  <p className="text-sm text-slate-600">+{fmtUsd(home.cardFeeCents)} processing fee</p>
                  <p className="text-xs text-slate-500">Total {fmtUsd(home.payableCents + home.cardFeeCents)} · the card processor's cost, no markup</p>
                </button>
              )}
            </div>
            {!home.autopay.enabled && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autopay} onChange={e => setAutopay(e.target.checked)} /> Save this {method === "ach" ? "bank account" : "card"} and pay future dues automatically</label>}
            <Button className="w-full h-11 text-base" style={{ background: BRAND }} disabled={checkout.isPending} onClick={pay}>
              {checkout.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Pay {fmtUsd(home.payableCents + (method === "card" ? home.cardFeeCents : 0))}
            </Button>
            <p className="text-xs text-slate-400 text-center">Payments are processed securely by Stripe and go to {home.association.name}.</p>
          </div>
        )
      )}
    </section>
  );
}

function AutopayCard({ home, token, onChange }: { home: PortalHome; token: string; onChange: () => void }) {
  const setup = trpc.hoaBoards.portal.setupAutopay.useMutation();
  const disable = trpc.hoaBoards.portal.disableAutopay.useMutation();
  if (!home.association.canPay) return null;
  const start = async (method: "ach" | "card") => { try { window.location.href = (await setup.mutateAsync({ token, homeId: home.id, method })).url!; } catch (e) { toast.error(errMsg(e)); } };
  return (
    <section className="rounded-2xl border bg-white p-5">
      <h2 className="font-bold flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Autopay</h2>
      {home.autopay.enabled ? (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <p className="text-sm text-slate-700">On — <strong>{home.autopay.label}</strong> is charged on each due date{home.autopay.method === "card" ? " (plus the card processing fee)" : " (free)"}. We email you before every charge.</p>
          <Button variant="outline" size="sm" disabled={disable.isPending} onClick={async () => { if (!window.confirm("Turn off autopay?")) return; await disable.mutateAsync({ token, homeId: home.id }); onChange(); toast.success("Autopay is off."); }}>Turn off</Button>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-slate-600 mb-3">Never miss a due date. We charge on the due date and email you a week before.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => start("ach")} disabled={setup.isPending}><Banknote className="w-4 h-4 mr-1.5" /> Use my bank (free)</Button>
            {home.association.acceptCards && <Button variant="outline" onClick={() => start("card")} disabled={setup.isPending}><CreditCard className="w-4 h-4 mr-1.5" /> Use a card</Button>}
          </div>
        </div>
      )}
    </section>
  );
}

function ReceiptDialog({ token, paymentId, onClose }: { token: string; paymentId: number; onClose: () => void }) {
  const r = trpc.hoaBoards.portal.receipt.useQuery({ token, paymentId });
  const d = r.data;
  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Receipt</DialogTitle></DialogHeader>
        {!d ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : (
          <div id="hoa-receipt" className="text-sm space-y-3">
            <div><p className="font-bold">{d.association.name}</p><p className="text-slate-500">{d.association.address}</p></div>
            <p>Receipt <strong>{d.receiptNumber}</strong> · {d.date}<br />{d.home.ownerName} · {d.home.label}</p>
            <table className="w-full"><tbody>
              {d.lines.map((l, i) => <tr key={i} className="border-t"><td className="py-1">{l.description}</td><td className="text-right">{fmtUsd(l.cents)}</td></tr>)}
              {d.feeCents > 0 && <tr className="border-t text-slate-500"><td className="py-1">Card processing fee (at cost)</td><td className="text-right">{fmtUsd(d.feeCents)}</td></tr>}
              <tr className="border-t font-bold"><td className="py-1">Total paid</td><td className="text-right">{fmtUsd(d.totalCents)}</td></tr>
            </tbody></table>
            <p className="text-slate-500">Paid by {d.method === "ach" ? "bank (ACH)" : d.method}{d.reference ? ` #${d.reference}` : ""}.</p>
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1.5" /> Print</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
