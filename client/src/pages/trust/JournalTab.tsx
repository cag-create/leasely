import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronRight, Download } from "lucide-react";
import { Empty, METHOD_LABEL, Section, Select, downloadCsv, fmt, today, useBook } from "./shared";

export default function JournalTab() {
  const { bookUserId, book } = useBook();
  const utils = trpc.useUtils();
  const accounts = trpc.trust.accounts.list.useQuery({ bookUserId });
  const [accountId, setAccountId] = useState<number | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<Set<number>>(new Set());
  useEffect(() => { if (!accountId && accounts.data?.length) setAccountId(accounts.data[0].id); }, [accounts.data, accountId]);
  const journal = trpc.trust.journal.list.useQuery({ bookUserId, trustAccountId: accountId ?? 0, from: from || undefined, to: to || undefined }, { enabled: !!accountId });
  const reverse = trpc.trust.journal.reverse.useMutation();

  if (accounts.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  if (!accounts.data?.length) return <Empty>Add a trust account first (Setup tab).</Empty>;

  return (
    <Section title="Journal" desc="Every deposit to and payment from the trust account, in date order, with a running balance (21 NCAC 58A .0117(c)(5)). Click a row to see which owner/property ledgers it hit. Entries are never edited — mistakes are reversed." action={
      <div className="flex flex-wrap gap-2 items-center">
        <Select className="w-56" value={String(accountId ?? "")} onChange={(v) => setAccountId(Number(v))}>{accounts.data.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
        <Input type="date" className="h-9 w-36" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" className="h-9 w-36" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button variant="outline" size="sm" className="gap-1" disabled={!journal.data?.length} onClick={() => downloadCsv([
          ["Entry #", "Date", "Type", "Method", "Reference", "Remitter / payee", "Purpose", "Amount", "Balance", "Received", "Cleared", "Ledger splits"],
          ...[...(journal.data ?? [])].reverse().map((j) => [j.id, j.entryDate, j.kind, j.method, j.reference ?? "", j.counterparty, j.purpose, (j.amountCents / 100).toFixed(2), (j.runningBalanceCents / 100).toFixed(2), j.receivedDate ?? "", j.clearedDate ?? "", j.splits.map((s) => `${s.description} ${(s.amountCents / 100).toFixed(2)}`).join(" | ")]),
        ], `trust-journal-${today()}.csv`)}><Download className="h-4 w-4" /> CSV</Button>
      </div>
    }>
      {journal.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : !journal.data?.length ? <Empty>No entries yet.</Empty> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2 w-6"></th><th>#</th><th>Date</th><th>From / to</th><th>Purpose</th><th>Method</th><th className="text-right">Amount</th><th className="text-right">Balance</th><th>Bank</th><th></th></tr></thead>
            <tbody>{journal.data.map((j) => (
              <Fragment key={j.id}>
                <tr className="border-b cursor-pointer hover:bg-gray-50" onClick={() => setOpen((s) => { const n = new Set(s); n.has(j.id) ? n.delete(j.id) : n.add(j.id); return n; })}>
                  <td className="py-2">{open.has(j.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</td>
                  <td className="text-gray-400">{j.id}</td><td>{j.entryDate}</td><td>{j.counterparty}</td>
                  <td className="max-w-xs truncate">{j.purpose}{j.reversed && <span className="ml-1 text-[10px] text-red-600">reversed</span>}</td>
                  <td className="text-xs">{METHOD_LABEL[j.method]}{j.reference ? ` #${j.reference.slice(0, 18)}` : ""}</td>
                  <td className={`text-right ${j.amountCents < 0 ? "text-red-700" : "text-emerald-700"}`}>{fmt(j.amountCents)}</td>
                  <td className="text-right font-medium">{fmt(j.runningBalanceCents)}</td>
                  <td className="text-xs">{j.clearedDate ? `Cleared ${j.clearedDate}` : <span className="text-gray-400">Uncleared</span>}</td>
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    {book?.perms.disburse && !j.reversed && !j.voidOfEntryId && <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => {
                      const reason = prompt("Why reverse this entry? (A reversing entry is posted; the original stays on record.)");
                      if (!reason) return;
                      try { await reverse.mutateAsync({ bookUserId, journalEntryId: j.id, reason, entryDate: today() }); toast.success("Reversed"); utils.trust.invalidate(); } catch (e: any) { toast.error(e.message); }
                    }}>Reverse</Button>}
                  </td>
                </tr>
                {open.has(j.id) && (
                  <tr className="bg-gray-50 border-b"><td></td><td colSpan={9} className="py-2">
                    <ul className="text-xs space-y-0.5">{j.splits.map((s) => <li key={s.id} className="flex justify-between gap-4"><span>{s.ledgerType.replace("_", " ")} · {s.description}</span><span>{fmt(s.amountCents)} → ledger balance {fmt(s.runningBalanceCents)}</span></li>)}</ul>
                    {j.receivedDate && j.kind === "deposit" && <p className="text-[11px] text-gray-500 mt-1">Received {j.receivedDate}{j.expectedBankDate ? ` · Stripe payout arrives ${j.expectedBankDate}` : ""}</p>}
                  </td></tr>
                )}
              </Fragment>
            ))}</tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
