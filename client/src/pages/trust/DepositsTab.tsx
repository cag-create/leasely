import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ACCENT, Empty, Field, MoneyInput, Section, Select, fmt, toCents, today, useBook } from "./shared";

const daysLeft = (ymd: string | null) => (ymd ? Math.round((Date.parse(`${ymd}T00:00:00Z`) - Date.parse(`${today()}T00:00:00Z`)) / 86_400_000) : null);

export default function DepositsTab() {
  const { bookUserId, book } = useBook();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.trust.deposits.list.useQuery({ bookUserId });
  const sendNotice = trpc.trust.deposits.sendBankNotice.useMutation();
  const markNotice = trpc.trust.deposits.markNoticeSent.useMutation();
  const setMoveOut = trpc.trust.deposits.setMoveOut.useMutation();
  const close = trpc.trust.deposits.close.useMutation();
  const refresh = () => utils.trust.invalidate();
  const [dlg, setDlg] = useState<{ id: number; tenant: string; held: number; end: string; lines: { description: string; amount: string }[]; method: "check" | "ach" | "other"; reference: string; date: string; email: boolean } | null>(null);
  const canEdit = !!book?.perms.receipts;

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  const held = (data ?? []).filter((d) => d.status === "held");
  const closed = (data ?? []).filter((d) => d.status === "closed");
  const deducted = dlg ? dlg.lines.reduce((s, l) => s + toCents(l.amount), 0) : 0;

  return (
    <div className="space-y-5">
      <Section title="Deposits held in trust" desc="G.S. 42-50: tell each tenant where their deposit is held within 30 days of the lease start. G.S. 42-52: refund or itemize within 30 days after move-out.">
        {!held.length ? <Empty>No deposits held. Deposits are created when a security deposit is received (online or recorded).</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Tenant</th><th>Property</th><th className="text-right">Held</th><th>Bank notice</th><th>Move-out</th><th></th></tr></thead>
              <tbody>{held.map((d) => {
                const nl = daysLeft(d.deadlines.bankNoticeDue);
                const il = daysLeft(d.deadlines.itemizationDue);
                return (
                  <tr key={d.id} className="border-b last:border-0 align-top">
                    <td className="py-2 font-medium">{d.tenantName}<div className="text-xs text-gray-400">{d.tenantEmail ?? "no email"}</div></td>
                    <td>{d.propertyLabel}</td>
                    <td className="text-right font-semibold">{fmt(d.heldCents)}</td>
                    <td>{d.bankNoticeSentAt ? <span className="text-xs text-emerald-700">Sent {d.bankNoticeSentAt}</span> : <span className={`text-xs ${nl != null && nl < 0 ? "text-red-700" : "text-amber-700"}`}>Due {d.deadlines.bankNoticeDue}{nl != null ? ` (${nl < 0 ? `${-nl} days late` : `${nl} days`})` : ""}</span>}</td>
                    <td>{d.tenancyEndDate ? <span className={`text-xs ${il != null && il < 0 ? "text-red-700" : "text-amber-700"}`}>Ended {d.tenancyEndDate} · itemize by {d.deadlines.itemizationDue}</span> : canEdit ? <Input type="date" className="h-8 w-36 text-xs" onChange={async (e) => { if (!e.target.value) return; await setMoveOut.mutateAsync({ bookUserId, securityDepositId: d.id, tenancyEndDate: e.target.value }); refresh(); }} /> : "—"}</td>
                    <td className="text-right whitespace-nowrap space-x-1">
                      {canEdit && !d.bankNoticeSentAt && <Button size="sm" variant="outline" onClick={async () => {
                        try { const r = await sendNotice.mutateAsync({ bookUserId, securityDepositId: d.id, tenantEmail: d.tenantEmail ?? (prompt("Tenant's email") || undefined) }); if (r.ok) toast.success("Notice emailed"); else toast.error("Email isn't configured — send it yourself and mark it sent."); refresh(); } catch (e: any) { toast.error(e.message); }
                      }}>Email notice</Button>}
                      {canEdit && !d.bankNoticeSentAt && <Button size="sm" variant="ghost" onClick={async () => { await markNotice.mutateAsync({ bookUserId, securityDepositId: d.id, sentOn: today() }); refresh(); }}>Mark sent</Button>}
                      {book?.perms.disburse && <Button size="sm" onClick={() => setDlg({ id: d.id, tenant: d.tenantName, held: d.heldCents, end: d.tenancyEndDate ?? today(), lines: [], method: "check", reference: "", date: today(), email: true })}>Move-out</Button>}
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </Section>

      {closed.length > 0 && (
        <Section title="Closed out">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Tenant</th><th>Property</th><th>Moved out</th><th>Accounting sent</th><th>Deductions</th></tr></thead>
            <tbody>{closed.map((d) => {
              const items: { description: string; amountCents: number }[] = d.itemizationJson ? JSON.parse(d.itemizationJson) : [];
              return <tr key={d.id} className="border-b last:border-0"><td className="py-2">{d.tenantName}</td><td>{d.propertyLabel}</td><td>{d.tenancyEndDate}</td><td>{d.itemizationSentAt}</td><td className="text-xs">{items.length ? items.map((i) => `${i.description} ${fmt(i.amountCents)}`).join("; ") : "None"}</td></tr>;
            })}</tbody>
          </table>
        </Section>
      )}

      <Dialog open={!!dlg} onOpenChange={(o) => !o && setDlg(null)}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader><DialogTitle>Move-out: {dlg?.tenant}</DialogTitle></DialogHeader>
          {dlg && <div className="space-y-3">
            <p className="text-sm text-gray-600">Deposit held: <strong>{fmt(dlg.held)}</strong>. List deductions allowed by G.S. 42-51 (unpaid rent, damage beyond normal wear and tear, etc.). The rest is refunded and the tenant gets the itemized accounting.</p>
            <Field label="Tenancy ended / possession returned"><Input type="date" value={dlg.end} onChange={(e) => setDlg({ ...dlg, end: e.target.value })} /></Field>
            {dlg.lines.map((l, i) => (
              <div key={i} className="flex gap-2"><Input placeholder="Deduction" value={l.description} onChange={(e) => setDlg({ ...dlg, lines: dlg.lines.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} /><div className="w-32"><MoneyInput value={l.amount} onChange={(v) => setDlg({ ...dlg, lines: dlg.lines.map((x, j) => (j === i ? { ...x, amount: v } : x)) })} /></div><Button variant="ghost" size="sm" onClick={() => setDlg({ ...dlg, lines: dlg.lines.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button></div>
            ))}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setDlg({ ...dlg, lines: [...dlg.lines, { description: "", amount: "" }] })}><Plus className="h-3 w-3" /> Add deduction</Button>
            <div className="rounded-lg bg-gray-50 p-3 text-sm flex justify-between"><span>Deductions {fmt(deducted)} (to the owner)</span><strong>Refund {fmt(dlg.held - deducted)}</strong></div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Refund by"><Select value={dlg.method} onChange={(v) => setDlg({ ...dlg, method: v as any })}><option value="check">Check</option><option value="ach">ACH</option><option value="other">Other</option></Select></Field>
              <Field label="Check / ref"><Input value={dlg.reference} onChange={(e) => setDlg({ ...dlg, reference: e.target.value })} /></Field>
              <Field label="Date"><Input type="date" value={dlg.date} onChange={(e) => setDlg({ ...dlg, date: e.target.value })} /></Field>
            </div>
            <div className="flex items-center gap-2"><Switch checked={dlg.email} onCheckedChange={(v) => setDlg({ ...dlg, email: v })} /><span className="text-sm">Email the itemized accounting to the tenant</span></div>
          </div>}
          <DialogFooter><Button disabled={close.isPending || (dlg ? deducted > dlg.held : false)} className="text-white" style={{ background: ACCENT }} onClick={async () => {
            if (!dlg) return;
            try {
              const r = await close.mutateAsync({ bookUserId, securityDepositId: dlg.id, tenancyEndDate: dlg.end, deductions: dlg.lines.filter((l) => l.description && toCents(l.amount) > 0).map((l) => ({ description: l.description, amountCents: toCents(l.amount) })), refundMethod: dlg.method, refundReference: dlg.reference || undefined, entryDate: dlg.date, emailTenant: dlg.email });
              toast.success(`Closed: refund ${fmt(r?.refundCents ?? 0)}${r?.emailed ? " · accounting emailed" : ""}`);
              setDlg(null); refresh();
            } catch (e: any) { toast.error(e.message); }
          }}>Close out deposit</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
