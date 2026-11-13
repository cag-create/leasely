import { trpc } from "@/lib/trpc";
import { Loader2, AlertTriangle, AlertCircle, Info, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { fmt, Stat, Section, useBook, ACCENT } from "./shared";

export default function OverviewTab({ onGo }: { onGo: (tab: any) => void }) {
  const { bookUserId } = useBook();
  const { data, isLoading } = trpc.trust.overview.useQuery({ bookUserId });
  if (isLoading || !data) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;

  const ownerFunds = data.accounts.reduce((s, a) => s + a.ownerFundsCents, 0);
  const deposits = data.accounts.reduce((s, a) => s + a.depositsHeldCents, 0);
  const total = data.accounts.reduce((s, a) => s + a.journalBalanceCents, 0);
  const errors = data.compliance.filter((c) => c.severity === "error").length;
  const steps = [
    { done: data.stripeConnected, label: "Connect Stripe payouts to your trust bank account", href: "/payouts" },
    { done: data.accounts.length > 0, label: "Add your trust account", tab: "setup" },
    { done: data.ownerCount > 0, label: "Add owners", tab: "owners" },
    { done: data.agreementCount > 0, label: "Add each property's management agreement (fees, reserve, approvals)", tab: "owners" },
  ];
  const setupDone = steps.every((s) => s.done);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Held in trust (journal)" value={fmt(total)} />
        <Stat label="Owner funds" value={fmt(ownerFunds)} hint={`${data.ownerCount} owners · ${data.agreementCount} properties`} />
        <Stat label="Tenant security deposits" value={fmt(deposits)} />
        <Stat label="Earned fees to transfer" value={fmt(data.feesAccruedCents)} tone={data.feesAccruedCents > 0 ? "warn" : undefined} />
      </div>

      {!setupDone && (
        <Section title="Get set up" desc="Four steps, then rent for managed properties flows into your trust books automatically.">
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                {s.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <span className="h-5 w-5 rounded-full border-2 border-gray-300 inline-block" />}
                <span className={s.done ? "text-gray-400 line-through" : "text-gray-800"}>{s.label}</span>
                {!s.done && (s.href ? <Link href={s.href}><Button size="sm" variant="outline" className="h-7">Open</Button></Link> : <Button size="sm" variant="outline" className="h-7" onClick={() => onGo(s.tab)}>Open</Button>)}
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section title={`Compliance check${data.rules.verified ? ` · ${data.rules.stateCode}` : ""}`} desc={errors ? `${errors} item(s) need action now.` : "Checked against NC Real Estate Commission trust rules and the Tenant Security Deposit Act."}>
        {data.compliance.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-5 w-5" /> Everything is in order.</div>
        ) : (
          <ul className="space-y-2">
            {data.compliance.map((c, i) => {
              const Icon = c.severity === "error" ? AlertCircle : c.severity === "warning" ? AlertTriangle : Info;
              const tone = c.severity === "error" ? "text-red-700 bg-red-50 border-red-100" : c.severity === "warning" ? "text-amber-800 bg-amber-50 border-amber-100" : "text-slate-700 bg-slate-50 border-slate-100";
              return (
                <li key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${tone}`}>
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    {c.message}
                    {c.rule && <span className="ml-1 text-xs opacity-70">({c.rule})</span>}
                  </div>
                  {c.link && <Link href={c.link}><span className="text-xs font-semibold underline whitespace-nowrap cursor-pointer">Fix</span></Link>}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Trust accounts">
        {data.accounts.length === 0 ? <p className="text-sm text-gray-500">No trust account yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Account</th><th>Bank</th><th className="text-right">Journal</th><th className="text-right">Owners</th><th className="text-right">Deposits</th><th className="text-right">Company</th><th>Last reconciliation</th></tr></thead>
              <tbody>
                {data.accounts.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{a.name}{a.receivesStripePayouts ? <span className="ml-2 text-[10px] rounded-full bg-indigo-50 text-indigo-700 px-1.5 py-0.5">Stripe payouts</span> : null}{a.kind === "hoa" && <span className="ml-2 text-[10px] rounded-full bg-amber-50 text-amber-700 px-1.5 py-0.5">HOA · {a.hoaName}</span>}</td>
                    <td className="text-gray-500">{a.bankName}{a.accountLast4 ? ` ••${a.accountLast4}` : ""}</td>
                    <td className="text-right font-semibold">{fmt(a.journalBalanceCents)}</td>
                    <td className="text-right">{fmt(a.ownerFundsCents)}</td>
                    <td className="text-right">{fmt(a.depositsHeldCents)}</td>
                    <td className="text-right">{fmt(a.companyFundsCents)}</td>
                    <td>{a.lastRecon ? `${a.lastRecon.periodMonth} · ${a.lastRecon.status}` : <span className="text-amber-700">None yet</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="How money moves for a managed property">
        <ol className="grid md:grid-cols-5 gap-2 text-xs">
          {[
            ["Tenant pays", "Card or bank (ACH) through Keycove. Tenants pay $0 in Keycove fees."],
            ["Your Stripe account", "Rent for managed properties goes to YOUR Stripe Connect account, not the owner's."],
            ["Your trust bank", "Stripe pays out to your trust account. Set daily payouts to meet the 3-banking-day rule."],
            ["Owner ledger", "Receipt posted, fees accrued, bills paid only up to the owner's balance."],
            ["Owner paid", "Disburse by ACH/check from trust, statement emailed, reconcile monthly."],
          ].map(([t, d], i) => (
            <li key={i} className="rounded-lg border p-3 bg-gray-50">
              <div className="font-semibold text-gray-800 flex items-center gap-1">{i + 1}. {t} {i < 4 && <ArrowRight className="h-3 w-3 text-gray-400 hidden md:inline" />}</div>
              <div className="text-gray-500 mt-1">{d}</div>
            </li>
          ))}
        </ol>
        <p className="text-xs text-gray-500">Self-managing landlords are unaffected: their tenants keep paying them directly. <Link href="/property-manager-guide"><span className="underline cursor-pointer" style={{ color: ACCENT }}>Property-manager guide</span></Link></p>
      </Section>
    </div>
  );
}
