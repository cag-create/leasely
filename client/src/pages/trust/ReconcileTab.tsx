import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Loader2, Upload, Printer, RefreshCw } from "lucide-react";
import { ACCENT, BRAND, Empty, Field, MoneyInput, Section, Select, fmt, lastMonth, toCents, useBook } from "./shared";

export default function ReconcileTab() {
  const { bookUserId, book } = useBook();
  const utils = trpc.useUtils();
  const accounts = trpc.trust.accounts.list.useQuery({ bookUserId });
  const [accountId, setAccountId] = useState<number | null>(null);
  useEffect(() => { if (!accountId && accounts.data?.length) setAccountId(accounts.data[0].id); }, [accounts.data, accountId]);
  const list = trpc.trust.recon.list.useQuery({ bookUserId, trustAccountId: accountId ?? 0 }, { enabled: !!accountId });
  const [reconId, setReconId] = useState<number | null>(null);
  const detail = trpc.trust.recon.get.useQuery({ bookUserId, reconId: reconId ?? 0 }, { enabled: !!reconId });
  const start = trpc.trust.recon.start.useMutation();
  const importCsv = trpc.trust.recon.importCsv.useMutation();
  const setBal = trpc.trust.recon.setBankBalance.useMutation();
  const match = trpc.trust.recon.match.useMutation();
  const unmatch = trpc.trust.recon.unmatch.useMutation();
  const bankCharge = trpc.trust.recon.recordBankCharge.useMutation();
  const finalize = trpc.trust.recon.finalize.useMutation();
  const sync = trpc.trust.accounts.syncStripePayouts.useMutation();
  const [period, setPeriod] = useState(lastMonth());
  const [ending, setEnding] = useState("");
  const [matchDlg, setMatchDlg] = useState<{ lineId: number; amount: number; picked: number[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = () => { utils.trust.recon.invalidate(); utils.trust.overview.invalidate(); };
  const canRec = !!book?.perms.reconcile;

  const r = detail.data?.recon;
  const ws = detail.data?.worksheet;
  const finalized = r?.status === "finalized";
  useEffect(() => { if (r) setEnding((r.bankEndingBalanceCents / 100).toFixed(2)); }, [r?.id]);
  // Opening a month recomputes it on the server; keep the month pills in step.
  useEffect(() => { if (r) utils.trust.recon.list.invalidate(); }, [r?.id, r?.status]);

  const onFile = (file?: File) => {
    if (!file || !reconId) return;
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: async (res) => {
        try {
          const out = await importCsv.mutateAsync({ bookUserId, reconId, rows: (res.data as string[][]).map((row) => row.map((c) => String(c ?? "").slice(0, 500))), bankEndingBalanceCents: toCents(ending), fileName: file.name });
          toast.success(`Imported ${out.imported} bank lines · matched ${out.matched} automatically`);
          refresh();
        } catch (e: any) { toast.error(e.message); }
        if (fileRef.current) fileRef.current.value = "";
      },
    });
  };

  if (accounts.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  if (!accounts.data?.length) return <Empty>Add a trust account first (Setup tab).</Empty>;

  const journalById = new Map((detail.data?.journalCandidates ?? []).map((j) => [j.id, j]));
  const unmatchedJournal = (detail.data?.journalCandidates ?? []).filter((j) => !j.clearedDate);

  return (
    <div className="space-y-5">
      <Section title="Monthly three-way reconciliation" desc="21 NCAC 58A .0117(e): at a cutoff date, the total of all owner ledgers, the journal balance, and the bank statement balance adjusted for outstanding checks and deposits in transit must agree. Keep the worksheet." action={
        <div className="flex flex-wrap gap-2 items-end">
          <Select className="w-56" value={String(accountId ?? "")} onChange={(v) => { setAccountId(Number(v)); setReconId(null); }}>{accounts.data.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
          <Input type="month" className="w-40 h-9" value={period} onChange={(e) => setPeriod(e.target.value)} />
          {canRec && <Button className="text-white" style={{ background: ACCENT }} disabled={start.isPending || !accountId} onClick={async () => { try { const res = await start.mutateAsync({ bookUserId, trustAccountId: accountId!, periodMonth: period }); setReconId(res.id); refresh(); } catch (e: any) { toast.error(e.message); } }}>Open {period}</Button>}
        </div>
      }>
        {!!list.data?.length && (
          <div className="flex flex-wrap gap-2">
            {list.data.map((x) => (
              <button key={x.id} onClick={() => setReconId(x.id)} className={`rounded-full border px-3 py-1 text-xs ${reconId === x.id ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600"}`}>
                {x.periodMonth} · {x.status === "finalized" ? "✓ finalized" : x.status.replace("_", " ")}
              </button>
            ))}
          </div>
        )}
      </Section>

      {reconId && detail.isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}
      {r && ws && (
        <div className="space-y-5 print:space-y-3" id="recon-worksheet">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[["Trial balance (all ledgers)", ws.trialBalanceCents], ["Journal balance", ws.journalBalanceCents], ["Adjusted bank balance", ws.adjustedBankBalanceCents]].map(([k, v]) => (
              <div key={k as string} className="rounded-xl border bg-white p-4"><div className="text-xs text-gray-500">{k}</div><div className="text-xl font-bold" style={{ color: BRAND }}>{fmt(v as number)}</div></div>
            ))}
          </div>
          <div className={`rounded-xl border p-4 flex items-start gap-3 ${ws.balanced && ws.hasStatement !== false && !ws.unmatchedBankLines?.length ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            {ws.balanced && !ws.unmatchedBankLines?.length ? <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-amber-700 mt-0.5" />}
            <div className="text-sm flex-1">
              {!ws.hasStatement && !finalized ? <><strong>Import this month's bank statement to reconcile.</strong> Until then, every uncleared item counts as outstanding, so the totals can't be checked.</>
                : finalized ? <strong>Finalized {r.finalizedAt ? new Date(r.finalizedAt).toLocaleDateString() : ""}. This worksheet is locked and retained.</strong>
                : ws.balanced && !ws.unmatchedBankLines?.length ? <strong>In balance as of {r.cutoffDate}. Finalize to lock the worksheet.</strong>
                : <><strong>Not in balance yet.</strong> Journal vs ledgers: {fmt(ws.differences?.journalVsTrial ?? 0)} · Bank vs journal: {fmt(ws.differences?.bankVsJournal ?? 0)}{ws.unmatchedBankLines?.length ? ` · ${ws.unmatchedBankLines.length} bank line(s) not in the journal` : ""}.</>}
              <div className="text-xs text-gray-600 mt-1">Bank statement {fmt(r.bankEndingBalanceCents)} − outstanding checks {fmt(ws.outstandingChecksCents)} + deposits in transit {fmt(ws.depositsInTransitCents)} = {fmt(ws.adjustedBankBalanceCents)}</div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-1"><Printer className="h-4 w-4" /> Print worksheet</Button>
              {canRec && !finalized && <Button size="sm" className="text-white" style={{ background: ACCENT }} disabled={!ws.balanced || !!ws.unmatchedBankLines?.length || finalize.isPending} onClick={async () => { try { await finalize.mutateAsync({ bookUserId, reconId: r.id }); toast.success("Reconciliation finalized"); refresh(); } catch (e: any) { toast.error(e.message); } }}>Finalize</Button>}
            </div>
          </div>

          {canRec && !finalized && (
            <Section title={`Bank statement for ${r.periodMonth}`} desc={`Cutoff ${r.cutoffDate}. Download the month's transactions as CSV from your bank (Chase, Wells Fargo, Bank of America, First Citizens, Truist, PNC and most others work).`}>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-48"><Field label="Statement ending balance"><MoneyInput value={ending} onChange={setEnding} /></Field></div>
                <Button variant="outline" disabled={setBal.isPending} onClick={async () => { await setBal.mutateAsync({ bookUserId, reconId: r.id, bankEndingBalanceCents: toCents(ending) }); refresh(); }}>Update balance</Button>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                <Button className="gap-2 text-white" style={{ background: ACCENT }} disabled={importCsv.isPending} onClick={() => fileRef.current?.click()}>{importCsv.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import bank CSV</Button>
                <Button variant="ghost" className="gap-1" disabled={sync.isPending} onClick={async () => { const s = await sync.mutateAsync({ bookUserId, trustAccountId: r.trustAccountId }); toast[s.ok ? "success" : "error"](s.message); refresh(); }}><RefreshCw className="h-4 w-4" /> Sync Stripe payouts</Button>
              </div>
              {r.statementFileName && <p className="text-xs text-gray-500">Imported: {r.statementFileName}</p>}
            </Section>
          )}

          {!!detail.data?.bankLines.length && (
            <Section title="Bank lines">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Date</th><th>Description</th><th className="text-right">Amount</th><th>Matched to</th><th></th></tr></thead>
                  <tbody>{detail.data.bankLines.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-2">{l.postedDate}</td><td className="max-w-xs truncate">{l.description}{l.reference ? ` #${l.reference}` : ""}</td>
                      <td className="text-right">{fmt(l.amountCents)}</td>
                      <td className="text-xs">{l.matchedJournalIds.length ? l.matchedJournalIds.map((id) => { const j = journalById.get(id); return j ? `#${id} ${j.counterparty}` : `#${id}`; }).join(", ") : <span className="text-amber-700">Not in journal</span>}</td>
                      <td className="text-right whitespace-nowrap print:hidden">
                        {canRec && !finalized && (l.matchedJournalIds.length
                          ? <Button size="sm" variant="ghost" onClick={async () => { await unmatch.mutateAsync({ bookUserId, reconId: r.id, lineId: l.id }); refresh(); }}>Unmatch</Button>
                          : <>
                              <Button size="sm" variant="outline" onClick={() => setMatchDlg({ lineId: l.id, amount: l.amountCents, picked: [] })}>Match</Button>
                              {l.amountCents < 0 && <Button size="sm" variant="ghost" onClick={async () => { try { await bankCharge.mutateAsync({ bookUserId, reconId: r.id, lineId: l.id }); toast.success("Recorded as a bank service charge (company funds)"); refresh(); } catch (e: any) { toast.error(e.message); } }}>Bank charge</Button>}
                            </>)}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Section>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <Section title={`Outstanding checks ${fmt(ws.outstandingChecksCents)}`}>
              {!ws.outstandingChecks?.length ? <p className="text-sm text-gray-500">None.</p> : <ul className="text-sm space-y-1">{ws.outstandingChecks.map((j: any) => <li key={j.id} className="flex justify-between"><span>{j.entryDate} · {j.counterparty}{j.reference ? ` #${j.reference}` : ""}</span><span>{fmt(-j.amountCents)}</span></li>)}</ul>}
            </Section>
            <Section title={`Deposits in transit ${fmt(ws.depositsInTransitCents)}`}>
              {!ws.depositsInTransit?.length ? <p className="text-sm text-gray-500">None.</p> : <ul className="text-sm space-y-1">{ws.depositsInTransit.map((j: any) => <li key={j.id} className="flex justify-between"><span>{j.entryDate} · {j.counterparty}</span><span>{fmt(j.amountCents)}</span></li>)}</ul>}
            </Section>
          </div>

          <Section title={`Trial balance ${fmt(ws.trialBalanceCents)}`} desc={`Every owner, security-deposit and company-funds ledger as of ${r.cutoffDate}.`}>
            <ul className="text-sm divide-y">{ws.ledgerBalances.map((l: any) => <li key={l.key} className="flex justify-between py-1.5"><span className={l.balanceCents < 0 ? "text-red-700" : ""}>{l.label}</span><span className="font-medium">{fmt(l.balanceCents)}</span></li>)}</ul>
          </Section>
        </div>
      )}

      <Dialog open={!!matchDlg} onOpenChange={(o) => !o && setMatchDlg(null)}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader><DialogTitle>Match bank line {matchDlg ? fmt(matchDlg.amount) : ""}</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Pick the journal entries this bank line covers (e.g. several rent receipts in one Stripe payout).</p>
          <div className="max-h-72 overflow-y-auto divide-y">
            {unmatchedJournal.map((j) => (
              <label key={j.id} className="flex items-center gap-2 py-1.5 text-sm">
                <input type="checkbox" checked={!!matchDlg?.picked.includes(j.id)} onChange={(e) => matchDlg && setMatchDlg({ ...matchDlg, picked: e.target.checked ? [...matchDlg.picked, j.id] : matchDlg.picked.filter((x) => x !== j.id) })} />
                <span className="flex-1">{j.entryDate} · {j.counterparty} · {j.purpose}</span><span>{fmt(j.amountCents)}</span>
              </label>
            ))}
          </div>
          {matchDlg && <p className="text-sm">Selected {fmt(matchDlg.picked.reduce((s, id) => s + (journalById.get(id)?.amountCents ?? 0), 0))} of {fmt(matchDlg.amount)}</p>}
          <DialogFooter><Button className="text-white" style={{ background: ACCENT }} disabled={!matchDlg?.picked.length || match.isPending} onClick={async () => { if (!matchDlg || !r) return; try { await match.mutateAsync({ bookUserId, reconId: r.id, lineId: matchDlg.lineId, journalIds: matchDlg.picked }); setMatchDlg(null); refresh(); } catch (e: any) { toast.error(e.message); } }}>Match</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
