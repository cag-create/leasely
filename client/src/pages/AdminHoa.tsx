/** Keycove admin: Keycove HOA platform settings + association list (/admin/hoa). */
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fmtUsd } from "@shared/hoaBoards";

export default function AdminHoa() {
  const q = trpc.hoaBoards.admin.overview.useQuery(undefined, { retry: false });
  const set = trpc.hoaBoards.admin.setAchFeeBearer.useMutation();
  if (q.error) return <div className="p-10 text-center">Admins only. <Link href="/admin" className="underline">Back</Link></div>;
  const d = q.data;
  if (!d) return <div className="p-10 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Keycove HOA — admin</h1><Link href="/admin" className="text-sm underline">Admin home</Link></div>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Who pays Stripe's ACH cost?</h2>
          <p className="text-sm text-slate-600 mt-1">Homeowner bank payments are always free for the homeowner. Stripe charges 0.8% per ACH payment, capped at $5. Choose who covers it. Changes apply to new payments only.</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {([
              ["hoa", "Deduct it from the HOA's payout (default)", "Keycove keeps an application fee equal to Stripe's ACH cost. A $150 payment pays out $148.80 to the HOA."],
              ["keycove", "Keycove absorbs it", "The HOA receives every dollar. Keycove pays Stripe out of its own margin (up to $5 per payment, plus $4 for each failed ACH)."],
            ] as const).map(([v, title, body]) => (
              <button key={v} onClick={async () => { try { await set.mutateAsync({ bearer: v }); toast.success("Saved"); void q.refetch(); } catch (e: any) { toast.error(e?.message); } }}
                className={`rounded-xl border-2 p-4 text-left ${d.achFeeBearer === v ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white"}`}>
                <p className="font-bold">{title}</p><p className="text-sm text-slate-600 mt-1">{body}</p>
                {d.achFeeBearer === v && <p className="text-xs font-bold text-indigo-700 mt-2">CURRENT SETTING</p>}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-2">Payment volume (succeeded)</h2>
          {!d.volume.length ? <p className="text-sm text-slate-500">None yet.</p> : (
            <table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th>Method</th><th className="text-right">Payments</th><th className="text-right">Dues collected</th><th className="text-right">Application fees</th></tr></thead>
              <tbody>{d.volume.map(v => <tr key={v.method} className="border-t"><td className="py-1.5">{v.method}</td><td className="text-right">{v.count}</td><td className="text-right">{fmtUsd(v.amountCents)}</td><td className="text-right">{fmtUsd(v.applicationFeeCents)}</td></tr>)}</tbody></table>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-5 overflow-auto">
          <h2 className="font-bold mb-2">Associations ({d.associations.length})</h2>
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th>HOA</th><th>Board</th><th className="text-right">Homes</th><th>Plan</th><th>Status</th><th>Bank</th><th>Created</th></tr></thead>
            <tbody>{d.associations.map(a => (
              <tr key={a.id} className="border-t"><td className="py-1.5">{a.name} <span className="text-slate-400">{a.state}</span></td><td className="text-xs">{a.ownerEmail}</td><td className="text-right">{a.homes}</td>
                <td>{a.planTier}/{a.billingInterval}</td><td>{a.planStatus}</td><td>{a.connectStatus}</td><td className="text-xs">{new Date(a.createdAt).toLocaleDateString()}</td></tr>))}</tbody></table>
        </section>
        <Button variant="outline" onClick={() => q.refetch()}>Refresh</Button>
      </div>
    </div>
  );
}
