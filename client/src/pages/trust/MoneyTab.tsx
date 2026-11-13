import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ACCENT, Empty, Field, MoneyInput, Section, Select, fmt, thisMonth, toCents, today, useBook } from "./shared";

type Method = "ach" | "check" | "wire" | "transfer" | "cash" | "other";

export default function MoneyTab() {
  const { bookUserId, book } = useBook();
  const utils = trpc.useUtils();
  const agreements = trpc.trust.agreements.list.useQuery({ bookUserId });
  const accounts = trpc.trust.accounts.list.useQuery({ bookUserId });
  const preview = trpc.trust.disbursements.preview.useQuery({ bookUserId });
  const fees = trpc.trust.fees.list.useQuery({ bookUserId });
  const approvals = trpc.trust.approvals.list.useQuery({ bookUserId });
  const refresh = () => utils.trust.invalidate();

  const recordReceipt = trpc.trust.receipts.record.useMutation();
  const payFees = trpc.trust.fees.pay.useMutation();
  const waive = trpc.trust.fees.waive.useMutation();
  const payOwner = trpc.trust.disbursements.payOwner.useMutation();
  const submitExpense = trpc.trust.expenses.submit.useMutation();
  const payApproved = trpc.trust.approvals.payApproved.useMutation();
  const recordDecision = trpc.trust.approvals.recordOwnerDecision.useMutation();
  const cancelApproval = trpc.trust.approvals.cancel.useMutation();
  const contribution = trpc.trust.receipts.ownerContribution.useMutation();
  const companyFunds = trpc.trust.receipts.companyFunds.useMutation();

  const active = useMemo(() => (agreements.data ?? []).filter((a) => a.status === "active"), [agreements.data]);
  const firstAg = active[0]?.id ? String(active[0].id) : "";

  const [rc, setRc] = useState({ agreementId: "", tenantId: "", remitter: "", rent: "", deposit: "", other: "", otherDesc: "", receivedDate: today(), depositedDate: today(), method: "check" as "check" | "cash" | "ach" | "wire" | "other", reference: "", periodMonth: thisMonth(), firstMonth: false });
  const [ex, setEx] = useState({ agreementId: "", amount: "", payee: "", description: "", entryDate: today(), method: "check" as Method, reference: "" });
  const [pay, setPay] = useState<{ ownerName: string; items: { agreementId: number; label: string; max: number; amount: string }[]; method: Method; reference: string; date: string; memo: string } | null>(null);
  const [feeDlg, setFeeDlg] = useState<{ trustAccountId: string; method: "transfer" | "ach" | "check" | "wire"; reference: string; date: string } | null>(null);
  const [payAp, setPayAp] = useState<{ id: number; method: Method; reference: string; date: string } | null>(null);
  const [contrib, setContrib] = useState<{ agreementId: string; amount: string; date: string; received: string; method: Method; reference: string } | null>(null);
  const [company, setCompany] = useState<{ trustAccountId: string; amount: string; date: string; reference: string } | null>(null);

  const rcAg = active.find((a) => String(a.id) === (rc.agreementId || firstAg));
  const canReceive = !!book?.perms.receipts;
  const canDisburse = !!book?.perms.disburse;

  const submitReceipt = async () => {
    const agreementId = Number(rc.agreementId || firstAg);
    if (!agreementId) return toast.error("Add a managed property first.");
    try {
      const r = await recordReceipt.mutateAsync({
        bookUserId, agreementId, rentCents: toCents(rc.rent), depositCents: toCents(rc.deposit), otherCents: toCents(rc.other), otherDescription: rc.otherDesc || undefined,
        receivedDate: rc.receivedDate, depositedDate: rc.depositedDate, method: rc.method, reference: rc.reference || undefined,
        remitter: rc.remitter || (rcAg?.tenants.find((t) => String(t.id) === rc.tenantId) ? `${rcAg?.tenants.find((t) => String(t.id) === rc.tenantId)!.firstName} ${rcAg?.tenants.find((t) => String(t.id) === rc.tenantId)!.lastName}` : "Tenant"),
        crmTenantId: rc.tenantId ? Number(rc.tenantId) : undefined, periodMonth: rc.periodMonth, firstMonthOfNewLease: rc.firstMonth,
      });
      if (r?.late) toast.warning(`Recorded — but the deposit date is after the ${r.deadline} deadline (3 banking days). Deposit trust money promptly.`);
      else toast.success(`Receipt recorded${r?.fees?.length ? ` · fees accrued ${r.fees.map((f: any) => fmt(f.amountCents)).join(" + ")}` : ""}`);
      setRc({ ...rc, rent: "", deposit: "", other: "", otherDesc: "", reference: "", remitter: "" });
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const submitEx = async () => {
    const agreementId = Number(ex.agreementId || firstAg);
    try {
      const r = await submitExpense.mutateAsync({ bookUserId, agreementId, amountCents: toCents(ex.amount), payee: ex.payee, description: ex.description, entryDate: ex.entryDate, method: ex.method, reference: ex.reference || undefined });
      toast.success(r.status === "pending_approval" ? "Over the owner's approval limit — sent to the owner for approval." : "Bill paid from the owner's funds.");
      setEx({ ...ex, amount: "", payee: "", description: "", reference: "" });
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  if (agreements.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  if (!active.length) return <Empty>Add an owner and a property management agreement first (Owners & properties tab).</Empty>;

  const feeTotal = (fees.data ?? []).reduce((s, f) => s + f.amountCents, 0);

  return (
    <div className="space-y-5">
      {canReceive && (
        <Section title="Record a receipt" desc="Checks, cash or ACH received outside Keycove. Online rent through Keycove is recorded automatically.">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2"><Field label="Property"><Select value={rc.agreementId || firstAg} onChange={(v) => setRc({ ...rc, agreementId: v, tenantId: "" })}>{active.map((a) => <option key={a.id} value={a.id}>{a.propertyLabel} — {a.ownerName}</option>)}</Select></Field></div>
            <Field label="Tenant"><Select value={rc.tenantId} onChange={(v) => setRc({ ...rc, tenantId: v })}><option value="">Other / not listed</option>{rcAg?.tenants.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</Select></Field>
            <Field label="Received from"><Input placeholder="Remitter" value={rc.remitter} onChange={(e) => setRc({ ...rc, remitter: e.target.value })} /></Field>
            <Field label="Rent"><MoneyInput value={rc.rent} onChange={(v) => setRc({ ...rc, rent: v })} /></Field>
            <Field label="Security deposit"><MoneyInput value={rc.deposit} onChange={(v) => setRc({ ...rc, deposit: v })} /></Field>
            <Field label="Other (late fee, pet fee…)"><MoneyInput value={rc.other} onChange={(v) => setRc({ ...rc, other: v })} /></Field>
            <Field label="Other — what for"><Input value={rc.otherDesc} onChange={(e) => setRc({ ...rc, otherDesc: e.target.value })} /></Field>
            <Field label="Rent for month"><Input type="month" value={rc.periodMonth} onChange={(e) => setRc({ ...rc, periodMonth: e.target.value })} /></Field>
            <Field label="Date received"><Input type="date" value={rc.receivedDate} onChange={(e) => setRc({ ...rc, receivedDate: e.target.value })} /></Field>
            <Field label="Date deposited to trust" hint="Within 3 banking days of receipt."><Input type="date" value={rc.depositedDate} onChange={(e) => setRc({ ...rc, depositedDate: e.target.value })} /></Field>
            <Field label="Method"><Select value={rc.method} onChange={(v) => setRc({ ...rc, method: v as any })}><option value="check">Check</option><option value="cash">Cash</option><option value="ach">ACH</option><option value="wire">Wire</option><option value="other">Other</option></Select></Field>
            <Field label="Deposit ticket / ref #"><Input value={rc.reference} onChange={(e) => setRc({ ...rc, reference: e.target.value })} /></Field>
            <div className="flex items-end gap-2 pb-1"><Switch checked={rc.firstMonth} onCheckedChange={(v) => setRc({ ...rc, firstMonth: v })} /><span className="text-xs text-gray-600">First month of a new lease (charge leasing fee)</span></div>
          </div>
          <div className="flex justify-end"><Button onClick={submitReceipt} disabled={recordReceipt.isPending} className="text-white" style={{ background: ACCENT }}>Record receipt</Button></div>
        </Section>
      )}

      <Section title="Earned fees" desc="Fees accrue against the owner's balance when rent arrives. Move them to your operating account in one itemized transfer — don't leave earned money in trust." action={canDisburse && feeTotal > 0 && <Button onClick={() => setFeeDlg({ trustAccountId: String(accounts.data?.find((a) => a.receivesStripePayouts)?.id ?? accounts.data?.[0]?.id ?? ""), method: "transfer", reference: "", date: today() })} className="text-white" style={{ background: ACCENT }}>Transfer {fmt(feeTotal)} to operating</Button>}>
        {!fees.data?.length ? <Empty>No fees waiting.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Owner</th><th>Property</th><th>Fee</th><th>Month</th><th className="text-right">Amount</th><th></th></tr></thead>
            <tbody>{fees.data.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="py-2">{f.ownerName}</td><td>{f.propertyLabel}</td><td>{f.type.replace("_", " ")}</td><td>{f.periodMonth}</td>
                <td className="text-right">{fmt(f.amountCents)}{f.shortfallCents > 0 && <div className="text-[11px] text-amber-700">{fmt(f.shortfallCents)} unpaid (owner short)</div>}</td>
                <td className="text-right">{canDisburse && <Button size="sm" variant="ghost" onClick={async () => { await waive.mutateAsync({ bookUserId, accrualId: f.id }); refresh(); }}>Waive</Button>}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Section>

      <Section title="Pay owners" desc="Available = owner balance − fees not yet transferred − reserve. Payments above that are blocked (21 NCAC 58A .0116(f)).">
        {!preview.data?.length ? <Empty>No owners with properties yet.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Owner</th><th>Properties</th><th className="text-right">Balance</th><th className="text-right">Reserve</th><th className="text-right">Available</th><th></th></tr></thead>
            <tbody>{preview.data.map((o) => (
              <tr key={o.owner.id} className="border-b last:border-0">
                <td className="py-2 font-medium">{o.owner.name}<div className="text-xs text-gray-400">{o.owner.payoutMethod === "ach" ? `ACH${o.owner.payoutBankName ? ` · ${o.owner.payoutBankName}` : ""}${o.owner.payoutAccountLast4 ? ` ••${o.owner.payoutAccountLast4}` : ""}` : o.owner.payoutMethod}</div></td>
                <td>{o.items.length}</td>
                <td className="text-right">{fmt(o.items.reduce((s, i) => s + i.balanceCents, 0))}</td>
                <td className="text-right">{fmt(o.items.reduce((s, i) => s + i.reserveCents, 0))}</td>
                <td className="text-right font-semibold">{fmt(o.availableCents)}</td>
                <td className="text-right">{canDisburse && <Button size="sm" disabled={o.availableCents <= 0} onClick={() => setPay({ ownerName: o.owner.name, items: o.items.filter((i) => i.availableCents > 0).map((i) => ({ agreementId: i.agreementId, label: i.propertyLabel, max: i.availableCents, amount: (i.availableCents / 100).toFixed(2) })), method: o.owner.payoutMethod === "check" ? "check" : "ach", reference: "", date: today(), memo: "" })}>Pay owner</Button>}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Section>

      {canDisburse && (
        <Section title="Pay a bill from owner funds" desc="Repairs and vendor bills. Over the agreement's approval limit, the owner approves first in their portal." action={<div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setContrib({ agreementId: firstAg, amount: "", date: today(), received: today(), method: "ach", reference: "" })}>Record owner funds</Button><Button variant="outline" size="sm" onClick={() => setCompany({ trustAccountId: String(accounts.data?.[0]?.id ?? ""), amount: "", date: today(), reference: "" })}>Company funds ($100 max)</Button></div>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2"><Field label="Property"><Select value={ex.agreementId || firstAg} onChange={(v) => setEx({ ...ex, agreementId: v })}>{active.map((a) => <option key={a.id} value={a.id}>{a.propertyLabel} — {a.ownerName} ({fmt(a.balanceCents - a.feesAccruedCents)} spendable)</option>)}</Select></Field></div>
            <Field label="Payee"><Input value={ex.payee} onChange={(e) => setEx({ ...ex, payee: e.target.value })} /></Field>
            <Field label="Amount"><MoneyInput value={ex.amount} onChange={(v) => setEx({ ...ex, amount: v })} /></Field>
            <div className="col-span-2"><Field label="What for"><Input value={ex.description} onChange={(e) => setEx({ ...ex, description: e.target.value })} /></Field></div>
            <Field label="Method"><Select value={ex.method} onChange={(v) => setEx({ ...ex, method: v as Method })}><option value="check">Check</option><option value="ach">ACH</option><option value="wire">Wire</option><option value="other">Other</option></Select></Field>
            <Field label="Check / ref #"><Input value={ex.reference} onChange={(e) => setEx({ ...ex, reference: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end"><Button onClick={submitEx} disabled={submitExpense.isPending || !ex.payee || !ex.description || !toCents(ex.amount)} className="text-white" style={{ background: ACCENT }}>Pay or request approval</Button></div>
        </Section>
      )}

      <Section title="Owner approvals">
        {!approvals.data?.length ? <Empty>No requests.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Owner</th><th>Request</th><th className="text-right">Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>{approvals.data.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="py-2">{a.ownerName}</td>
                <td>{a.kind === "expense" ? `${a.payee}: ${a.description}` : `Distribution: ${a.description}`}{a.decisionNote && <div className="text-xs text-gray-400">{a.decisionNote}</div>}</td>
                <td className="text-right">{fmt(a.amountCents)}</td>
                <td><span className={`text-xs ${a.status === "approved" ? "text-emerald-700" : a.status === "declined" ? "text-red-700" : "text-amber-700"}`}>{a.status}</span></td>
                <td className="text-right whitespace-nowrap">
                  {canDisburse && a.status === "approved" && <Button size="sm" onClick={() => setPayAp({ id: a.id, method: "check", reference: "", date: today() })}>Pay</Button>}
                  {canDisburse && a.status === "pending" && <Button size="sm" variant="ghost" onClick={async () => { const note = prompt("How did the owner approve? (e.g. 'Email 11/14 from owner')"); if (!note) return; try { await recordDecision.mutateAsync({ bookUserId, approvalId: a.id, approve: true, note }); refresh(); } catch (e: any) { toast.error(e.message); } }}>Record approval</Button>}
                  {canDisburse && a.status !== "approved" && <Button size="sm" variant="ghost" onClick={async () => { await cancelApproval.mutateAsync({ bookUserId, approvalId: a.id }); refresh(); }}>Cancel</Button>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Section>

      {/* Pay owner dialog */}
      <Dialog open={!!pay} onOpenChange={(o) => !o && setPay(null)}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader><DialogTitle>Pay {pay?.ownerName}</DialogTitle></DialogHeader>
          {pay && <div className="space-y-3">
            {pay.items.map((it, i) => (
              <div key={it.agreementId} className="flex items-center gap-3"><div className="flex-1 text-sm">{it.label}<div className="text-xs text-gray-400">up to {fmt(it.max)}</div></div><div className="w-36"><MoneyInput value={it.amount} onChange={(v) => setPay({ ...pay, items: pay.items.map((x, j) => (j === i ? { ...x, amount: v } : x)) })} /></div></div>
            ))}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Method"><Select value={pay.method} onChange={(v) => setPay({ ...pay, method: v as Method })}><option value="ach">ACH</option><option value="check">Check</option><option value="wire">Wire</option><option value="other">Other</option></Select></Field>
              <Field label="Check / ACH ref"><Input value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} /></Field>
              <Field label="Date"><Input type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} /></Field>
            </div>
            <Field label="Memo"><Input value={pay.memo} placeholder="e.g. November distribution" onChange={(e) => setPay({ ...pay, memo: e.target.value })} /></Field>
            <p className="text-xs text-gray-500">Send the money from your trust bank (ACH or trust check), then record it here. One payment is itemized per property on the ledger.</p>
          </div>}
          <DialogFooter><Button disabled={payOwner.isPending} className="text-white" style={{ background: ACCENT }} onClick={async () => {
            if (!pay) return;
            try {
              const r = await payOwner.mutateAsync({ bookUserId, items: pay.items.map((i) => ({ agreementId: i.agreementId, amountCents: toCents(i.amount) })).filter((i) => i.amountCents > 0), entryDate: pay.date, method: pay.method, reference: pay.reference || undefined, memo: pay.memo || undefined });
              toast.success(r.status === "pending_approval" ? "Sent to the owner for approval first." : "Owner payment recorded.");
              setPay(null); refresh();
            } catch (e: any) { toast.error(e.message); }
          }}>Record payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee transfer */}
      <Dialog open={!!feeDlg} onOpenChange={(o) => !o && setFeeDlg(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Transfer earned fees to operating</DialogTitle></DialogHeader>
          {feeDlg && <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="From trust account"><Select value={feeDlg.trustAccountId} onChange={(v) => setFeeDlg({ ...feeDlg, trustAccountId: v })}>{accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></Field></div>
            <Field label="Method"><Select value={feeDlg.method} onChange={(v) => setFeeDlg({ ...feeDlg, method: v as any })}><option value="transfer">Bank transfer</option><option value="ach">ACH</option><option value="check">Check</option><option value="wire">Wire</option></Select></Field>
            <Field label="Reference"><Input value={feeDlg.reference} onChange={(e) => setFeeDlg({ ...feeDlg, reference: e.target.value })} /></Field>
            <Field label="Date"><Input type="date" value={feeDlg.date} onChange={(e) => setFeeDlg({ ...feeDlg, date: e.target.value })} /></Field>
          </div>}
          <DialogFooter><Button disabled={payFees.isPending} className="text-white" style={{ background: ACCENT }} onClick={async () => {
            if (!feeDlg) return;
            try { const r = await payFees.mutateAsync({ bookUserId, trustAccountId: Number(feeDlg.trustAccountId), entryDate: feeDlg.date, method: feeDlg.method, reference: feeDlg.reference || undefined }); toast.success(`Transferred ${fmt(r?.totalCents ?? 0)} (${r?.count} items)`); setFeeDlg(null); refresh(); } catch (e: any) { toast.error(e.message); }
          }}>Record transfer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay approved */}
      <Dialog open={!!payAp} onOpenChange={(o) => !o && setPayAp(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Pay approved request</DialogTitle></DialogHeader>
          {payAp && <div className="grid grid-cols-3 gap-3">
            <Field label="Method"><Select value={payAp.method} onChange={(v) => setPayAp({ ...payAp, method: v as Method })}><option value="check">Check</option><option value="ach">ACH</option><option value="wire">Wire</option><option value="other">Other</option></Select></Field>
            <Field label="Check / ref"><Input value={payAp.reference} onChange={(e) => setPayAp({ ...payAp, reference: e.target.value })} /></Field>
            <Field label="Date"><Input type="date" value={payAp.date} onChange={(e) => setPayAp({ ...payAp, date: e.target.value })} /></Field>
          </div>}
          <DialogFooter><Button disabled={payApproved.isPending} className="text-white" style={{ background: ACCENT }} onClick={async () => {
            if (!payAp) return;
            try { await payApproved.mutateAsync({ bookUserId, approvalId: payAp.id, entryDate: payAp.date, method: payAp.method, reference: payAp.reference || undefined }); toast.success("Paid"); setPayAp(null); refresh(); } catch (e: any) { toast.error(e.message); }
          }}>Record payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Owner contribution */}
      <Dialog open={!!contrib} onOpenChange={(o) => !o && setContrib(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Record funds from an owner</DialogTitle></DialogHeader>
          {contrib && <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Property"><Select value={contrib.agreementId} onChange={(v) => setContrib({ ...contrib, agreementId: v })}>{active.map((a) => <option key={a.id} value={a.id}>{a.propertyLabel} — {a.ownerName}</option>)}</Select></Field></div>
            <Field label="Amount"><MoneyInput value={contrib.amount} onChange={(v) => setContrib({ ...contrib, amount: v })} /></Field>
            <Field label="Method"><Select value={contrib.method} onChange={(v) => setContrib({ ...contrib, method: v as Method })}><option value="ach">ACH</option><option value="check">Check</option><option value="wire">Wire</option></Select></Field>
            <Field label="Received"><Input type="date" value={contrib.received} onChange={(e) => setContrib({ ...contrib, received: e.target.value })} /></Field>
            <Field label="Deposited"><Input type="date" value={contrib.date} onChange={(e) => setContrib({ ...contrib, date: e.target.value })} /></Field>
            <Field label="Reference"><Input value={contrib.reference} onChange={(e) => setContrib({ ...contrib, reference: e.target.value })} /></Field>
          </div>}
          <DialogFooter><Button disabled={contribution.isPending} className="text-white" style={{ background: ACCENT }} onClick={async () => {
            if (!contrib) return;
            try { await contribution.mutateAsync({ bookUserId, agreementId: Number(contrib.agreementId), amountCents: toCents(contrib.amount), entryDate: contrib.date, receivedDate: contrib.received, method: contrib.method as any, reference: contrib.reference || undefined }); toast.success("Owner funds recorded"); setContrib(null); refresh(); } catch (e: any) { toast.error(e.message); }
          }}>Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company funds */}
      <Dialog open={!!company} onOpenChange={(o) => !o && setCompany(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Company funds for bank charges</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">NC allows up to $100 of your own money in a trust account to cover bank service charges (21 NCAC 58A .0117(c)(4)(C)).</p>
          {company && <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Trust account"><Select value={company.trustAccountId} onChange={(v) => setCompany({ ...company, trustAccountId: v })}>{accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></Field></div>
            <Field label="Amount"><MoneyInput value={company.amount} onChange={(v) => setCompany({ ...company, amount: v })} /></Field>
            <Field label="Date"><Input type="date" value={company.date} onChange={(e) => setCompany({ ...company, date: e.target.value })} /></Field>
          </div>}
          <DialogFooter><Button disabled={companyFunds.isPending} className="text-white" style={{ background: ACCENT }} onClick={async () => {
            if (!company) return;
            try { await companyFunds.mutateAsync({ bookUserId, trustAccountId: Number(company.trustAccountId), amountCents: toCents(company.amount), entryDate: company.date, reference: company.reference || undefined }); toast.success("Company funds recorded"); setCompany(null); refresh(); } catch (e: any) { toast.error(e.message); }
          }}>Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
