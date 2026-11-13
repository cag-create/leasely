import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Mail, Loader2 } from "lucide-react";
import { ACCENT, Empty, Section, downloadBase64, downloadCsv, fmt, lastMonth, useBook } from "./shared";

export default function StatementsTab() {
  const { bookUserId, book } = useBook();
  const utils = trpc.useUtils();
  const [period, setPeriod] = useState(lastMonth());
  const [year, setYear] = useState(new Date().getFullYear() - (new Date().getMonth() < 2 ? 1 : 0));
  const owners = trpc.trust.owners.list.useQuery({ bookUserId });
  const sentList = trpc.trust.statements.list.useQuery({ bookUserId, periodMonth: period });
  const pdf = trpc.trust.statements.pdf.useMutation();
  const send = trpc.trust.statements.send.useMutation();
  const t1099 = trpc.trust.owner1099.useQuery({ bookUserId, year });

  const sentFor = (ownerId: number) => sentList.data?.find((s) => s.trustOwnerId === ownerId);

  return (
    <div className="space-y-5">
      <Section title="Monthly owner statements" desc="Beginning balance, rent and income, fees, repairs, payments to the owner and ending balance for each property, as a PDF. Emailed statements show up in the owner's portal too." action={
        <div className="flex gap-2 items-center">
          <Input type="month" className="w-40 h-9" value={period} onChange={(e) => setPeriod(e.target.value)} />
          {book?.perms.owners && <Button className="gap-2 text-white" style={{ background: ACCENT }} disabled={send.isPending} onClick={async () => {
            try {
              const r = await send.mutateAsync({ bookUserId, periodMonth: period });
              const ok = r.results.filter((x) => x.emailed).length;
              toast.success(`${ok} of ${r.results.length} statements emailed`);
              const failed = r.results.filter((x) => !x.emailed);
              if (failed.length) toast.info(failed.map((f) => `${f.name}: ${f.reason}`).join(" · "));
              utils.trust.statements.invalidate();
            } catch (e: any) { toast.error(e.message); }
          }}>{send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Email all for {period}</Button>}
        </div>
      }>
        {!owners.data?.length ? <Empty>No owners yet.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Owner</th><th>Email</th><th className="text-right">Balance now</th><th>{period}</th><th></th></tr></thead>
            <tbody>{owners.data.map((o) => {
              const s = sentFor(o.id);
              return (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{o.name}</td><td className="text-gray-500">{o.email ?? "—"}</td><td className="text-right">{fmt(o.balanceCents)}</td>
                  <td className="text-xs">{s?.emailedAt ? <span className="text-emerald-700">Emailed {new Date(s.emailedAt).toLocaleDateString()}</span> : s ? "Saved, not emailed" : "—"}</td>
                  <td className="text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" className="gap-1" disabled={pdf.isPending} onClick={async () => { try { const r = await pdf.mutateAsync({ bookUserId, ownerId: o.id, periodMonth: period }); downloadBase64(r.base64, r.fileName); } catch (e: any) { toast.error(e.message); } }}><Download className="h-4 w-4" /> PDF</Button>
                    {book?.perms.owners && <Button size="sm" variant="ghost" className="gap-1" disabled={send.isPending || !o.email} onClick={async () => { try { const r = await send.mutateAsync({ bookUserId, periodMonth: period, ownerIds: [o.id] }); toast[r.results[0]?.emailed ? "success" : "info"](r.results[0]?.emailed ? "Statement emailed" : r.results[0]?.reason ?? "Not sent"); utils.trust.statements.invalidate(); } catch (e: any) { toast.error(e.message); } }}><Mail className="h-4 w-4" /> Email</Button>}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </Section>

      <Section title="Owner 1099-MISC totals" desc="Gross rents you collected for each owner in the year (box 1, before your fees). For payments made in 2026 and later the IRS threshold is $2,000 per owner (was $600). File with each owner's full TIN from their W-9." action={
        <div className="flex gap-2 items-center">
          <Input type="number" className="w-24 h-9" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <Button variant="outline" className="gap-1" disabled={!t1099.data?.length} onClick={() => downloadCsv([
            ["Owner", "TIN type", "TIN last 4", "W-9 on file", "Mailing address", "Box 1 rents", "Fees", "Expenses", "Paid to owner", "Must file"],
            ...(t1099.data ?? []).map((r) => [r.owner.name, r.owner.taxIdType ?? "", r.owner.taxIdLast4 ?? "", r.owner.w9OnFile ? "yes" : "no", r.owner.mailingAddress ?? "", (r.grossRentsCents / 100).toFixed(2), (r.feesCents / 100).toFixed(2), (r.expensesCents / 100).toFixed(2), (r.disbursedCents / 100).toFixed(2), r.reportable ? "yes" : "no"]),
          ], `owner-1099-misc-${year}.csv`)}><Download className="h-4 w-4" /> CSV</Button>
        </div>
      }>
        {t1099.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : !t1099.data?.length ? <Empty>No owners yet.</Empty> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Owner</th><th>TIN</th><th className="text-right">Box 1 rents</th><th className="text-right">Fees</th><th className="text-right">Paid to owner</th><th>1099 needed</th></tr></thead>
            <tbody>{t1099.data.map((r) => (
              <tr key={r.owner.id} className="border-b last:border-0">
                <td className="py-2">{r.owner.name}</td>
                <td className="text-xs">{r.owner.taxIdLast4 ? `${r.owner.taxIdType?.toUpperCase() ?? ""} ••${r.owner.taxIdLast4}` : <span className="text-amber-700">missing</span>}{!r.owner.w9OnFile && <span className="ml-1 text-amber-700">(no W-9)</span>}</td>
                <td className="text-right font-semibold">{fmt(r.grossRentsCents)}</td>
                <td className="text-right">{fmt(r.feesCents)}</td>
                <td className="text-right">{fmt(r.disbursedCents)}</td>
                <td>{r.reportable ? <span className="text-xs font-semibold text-indigo-700">Yes</span> : <span className="text-xs text-gray-400">Below {fmt(r.thresholdCents)}</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Section>
    </div>
  );
}
