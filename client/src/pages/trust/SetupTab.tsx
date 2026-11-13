import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { ACCENT, Empty, Field, Section, Select, useBook } from "./shared";

type AccountForm = { id?: number; name: string; kind: "general" | "security_deposit" | "hoa"; hoaName: string; bankName: string; bankAddress: string; accountLast4: string; routingLast4: string; stateCode: string; interestBearing: boolean; interestAuthorizationNote: string; interestAuthorizedAt: string; receivesStripePayouts: boolean };
const US_STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const emptyAccount: AccountForm = { name: "", kind: "general", hoaName: "", bankName: "", bankAddress: "", accountLast4: "", routingLast4: "", stateCode: "NC", interestBearing: false, interestAuthorizationNote: "", interestAuthorizedAt: "", receivesStripePayouts: true };

export default function SetupTab() {
  const { bookUserId, book } = useBook();
  const utils = trpc.useUtils();
  const accounts = trpc.trust.accounts.list.useQuery({ bookUserId });
  const rules = trpc.trust.rules.useQuery({ stateCode: accounts.data?.[0]?.stateCode ?? "NC" });
  const staff = trpc.trust.staff.list.useQuery(undefined, { enabled: !!book?.own });
  const upsert = trpc.trust.accounts.upsert.useMutation();
  const invite = trpc.trust.staff.invite.useMutation();
  const setPerms = trpc.trust.staff.setPermissions.useMutation();
  const [acct, setAcct] = useState<AccountForm | null>(null);
  const [staffEmail, setStaffEmail] = useState("");
  const canEdit = !!book?.perms.owners;

  const save = async () => {
    if (!acct) return;
    try {
      await upsert.mutateAsync({ bookUserId, id: acct.id, name: acct.name, kind: acct.kind, hoaName: acct.hoaName || null, bankName: acct.bankName, bankAddress: acct.bankAddress || null, accountLast4: acct.accountLast4 || null, routingLast4: acct.routingLast4 || null, stateCode: acct.stateCode, interestBearing: acct.interestBearing, interestAuthorizationNote: acct.interestAuthorizationNote || null, interestAuthorizedAt: acct.interestAuthorizedAt || null, receivesStripePayouts: acct.receivesStripePayouts });
      toast.success("Trust account saved");
      setAcct(null);
      utils.trust.invalidate();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-5">
      <Section title="Trust accounts" desc="Your bank trust (escrow) accounts. In NC the account must be titled “Trust Account” or “Escrow Account” at a federally insured bank doing business in NC." action={canEdit && <Button className="gap-2 text-white" style={{ background: ACCENT }} onClick={() => setAcct({ ...emptyAccount, receivesStripePayouts: !accounts.data?.length })}><Plus className="h-4 w-4" /> Add trust account</Button>}>
        {!accounts.data?.length ? <Empty>No trust accounts yet.</Empty> : (
          <ul className="divide-y">
            {accounts.data.map((a) => (
              <li key={a.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium">{a.name} {a.status === "closed" && <span className="text-xs text-gray-400">(closed)</span>}</div>
                  <div className="text-xs text-gray-500">{a.bankName}{a.accountLast4 ? ` ••${a.accountLast4}` : ""} · {a.kind === "hoa" ? `HOA: ${a.hoaName}` : a.kind === "security_deposit" ? "Security deposits" : "General trust"}{a.receivesStripePayouts ? " · receives Stripe payouts" : ""}{a.interestBearing ? " · interest-bearing" : ""}</div>
                </div>
                {canEdit && <Button size="sm" variant="ghost" onClick={() => setAcct({ id: a.id, name: a.name, kind: a.kind, hoaName: a.hoaName ?? "", bankName: a.bankName, bankAddress: a.bankAddress ?? "", accountLast4: a.accountLast4 ?? "", routingLast4: a.routingLast4 ?? "", stateCode: a.stateCode, interestBearing: !!a.interestBearing, interestAuthorizationNote: a.interestAuthorizationNote ?? "", interestAuthorizedAt: a.interestAuthorizedAt ?? "", receivesStripePayouts: !!a.receivesStripePayouts })}><Pencil className="h-4 w-4" /></Button>}
              </li>
            ))}
          </ul>
        )}
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-sm text-indigo-900 space-y-1">
          <p className="font-semibold">Online rent → your trust bank</p>
          <p>Rent for managed properties goes to your Stripe account. In <Link href="/payouts"><span className="underline cursor-pointer">Payouts</span></Link> → “Manage bank at Stripe”, set the payout bank to this trust account and choose <strong>daily</strong> payouts, so rent reaches the trust bank within 3 banking days.</p>
        </div>
      </Section>

      {book?.own && (
        <Section title="Staff access" desc="Let agents and assistants at your firm work in these books. They sign in with their own free Keycove login.">
          <div className="flex gap-2 max-w-md"><Input placeholder="staff@yourfirm.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} /><Button disabled={!staffEmail || invite.isPending} onClick={async () => { try { await invite.mutateAsync({ email: staffEmail, canRecordReceipts: true, canDisburse: false, canReconcile: false, canManageOwners: false }); toast.success("Access granted"); setStaffEmail(""); staff.refetch(); } catch (e: any) { toast.error(e.message); } }}>Add</Button></div>
          {!staff.data?.length ? <p className="text-sm text-gray-500">No staff yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Person</th><th>View</th><th>Record receipts</th><th>Pay / disburse</th><th>Reconcile</th><th>Owners & setup</th></tr></thead>
              <tbody>{staff.data.map((s) => (
                <tr key={s.accessId} className="border-b last:border-0">
                  <td className="py-2">{s.name ?? s.email}<div className="text-xs text-gray-400">{s.email}</div></td>
                  {(["canViewTrust", "canRecordReceipts", "canDisburse", "canReconcile", "canManageOwners"] as const).map((k) => (
                    <td key={k}><Switch checked={s[k]} onCheckedChange={async (v) => { await setPerms.mutateAsync({ accessId: s.accessId, canViewTrust: s.canViewTrust, canRecordReceipts: s.canRecordReceipts, canDisburse: s.canDisburse, canReconcile: s.canReconcile, canManageOwners: s.canManageOwners, [k]: v }); staff.refetch(); }} /></td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          )}
        </Section>
      )}

      {rules.data && (
        <Section title={`Rules applied · ${rules.data.regulator}`} desc={rules.data.verified ? "Read from the full rule text. Keycove enforces these; it isn't legal advice — check anything unusual with NCREC or your attorney." : "Your state's trust rules aren't loaded yet; NC's rules are applied as a strict default."}>
          <ul className="text-sm space-y-1.5">
            {rules.data.citations.map((c) => (
              <li key={c.rule} className="flex gap-2"><a className="font-medium whitespace-nowrap underline inline-flex items-center gap-0.5" style={{ color: ACCENT }} href={c.url} target="_blank" rel="noreferrer">{c.rule}<ExternalLink className="h-3 w-3" /></a><span className="text-gray-600">{c.summary}</span></li>
            ))}
          </ul>
        </Section>
      )}

      <Dialog open={!!acct} onOpenChange={(o) => !o && setAcct(null)}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{acct?.id ? "Edit trust account" : "Add trust account"}</DialogTitle></DialogHeader>
          {acct && <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Account title (as the bank shows it)" hint="Must include “Trust Account” or “Escrow Account”."><Input placeholder="Smith Realty Trust Account" value={acct.name} onChange={(e) => setAcct({ ...acct, name: e.target.value })} /></Field></div>
            <Field label="Used for"><Select value={acct.kind} onChange={(v) => setAcct({ ...acct, kind: v as any })}><option value="general">Rents & owner funds</option><option value="security_deposit">Security deposits only</option><option value="hoa">One owners' association</option></Select></Field>
            <Field label="State"><Select value={acct.stateCode} onChange={(v) => setAcct({ ...acct, stateCode: v })}>{US_STATES.map((st) => <option key={st} value={st}>{st}{st === "NC" ? " (rules loaded)" : ""}</option>)}</Select></Field>
            {acct.kind === "hoa" && <div className="col-span-2"><Field label="Association name" hint="NC requires a separate trust account for each association (21 NCAC 58A .0118)."><Input value={acct.hoaName} onChange={(e) => setAcct({ ...acct, hoaName: e.target.value })} /></Field></div>}
            <Field label="Bank"><Input value={acct.bankName} onChange={(e) => setAcct({ ...acct, bankName: e.target.value })} /></Field>
            <div className="flex gap-2"><Field label="Acct last 4"><Input maxLength={4} value={acct.accountLast4} onChange={(e) => setAcct({ ...acct, accountLast4: e.target.value.replace(/\D/g, "") })} /></Field><Field label="Routing last 4"><Input maxLength={4} value={acct.routingLast4} onChange={(e) => setAcct({ ...acct, routingLast4: e.target.value.replace(/\D/g, "") })} /></Field></div>
            <div className="col-span-2"><Field label="Bank branch address" hint="Tenants must be told the bank's name and address within 30 days (G.S. 42-50)."><Textarea rows={2} value={acct.bankAddress} onChange={(e) => setAcct({ ...acct, bankAddress: e.target.value })} /></Field></div>
            <div className="col-span-2 flex items-center gap-2"><Switch checked={acct.receivesStripePayouts} onCheckedChange={(v) => setAcct({ ...acct, receivesStripePayouts: v })} /><span className="text-sm">My Stripe payouts go to this account</span></div>
            <div className="col-span-2 flex items-center gap-2"><Switch checked={acct.interestBearing} onCheckedChange={(v) => setAcct({ ...acct, interestBearing: v })} /><span className="text-sm">Interest-bearing</span></div>
            {acct.interestBearing && <>
              <div className="col-span-2"><Field label="Written authorization: who receives the interest" hint="Required from everyone with an interest in the money before depositing (21 NCAC 58A .0116(c))."><Textarea rows={2} value={acct.interestAuthorizationNote} onChange={(e) => setAcct({ ...acct, interestAuthorizationNote: e.target.value })} /></Field></div>
              <Field label="Authorization date"><Input type="date" value={acct.interestAuthorizedAt} onChange={(e) => setAcct({ ...acct, interestAuthorizedAt: e.target.value })} /></Field>
            </>}
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setAcct(null)}>Cancel</Button><Button disabled={upsert.isPending} onClick={save} className="text-white" style={{ background: ACCENT }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
