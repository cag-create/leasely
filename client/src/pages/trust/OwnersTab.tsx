import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Mail, Pencil, Loader2, Copy, FolderOpen, Trash2, Upload } from "lucide-react";
import { ACCENT, Empty, Field, MoneyInput, Section, Select, fmt, toCents, today, useBook } from "./shared";

type OwnerForm = { id?: number; name: string; email: string; phone: string; mailingAddress: string; taxIdLast4: string; taxIdType: "" | "ssn" | "ein"; w9OnFile: boolean; payoutMethod: "ach" | "check" | "other"; payoutBankName: string; payoutAccountLast4: string; notes: string };
const emptyOwner: OwnerForm = { name: "", email: "", phone: "", mailingAddress: "", taxIdLast4: "", taxIdType: "", w9OnFile: false, payoutMethod: "ach", payoutBankName: "", payoutAccountLast4: "", notes: "" };

type AgreementForm = {
  id?: number; trustOwnerId: string; crmPropertyId: string; trustAccountId: string; startDate: string;
  mgmtFeeType: "percent" | "flat" | "none"; mgmtFeePct: string; mgmtFeeFlat: string; mgmtFeeMin: string;
  leasingFeeType: "percent_of_first_month" | "flat" | "none"; leasingFee: string;
  renewalFeeType: "percent_of_first_month" | "flat" | "none"; renewalFee: string;
  reserve: string; ownerApprovalMode: "none" | "disbursements" | "expenses_over_threshold" | "both"; threshold: string;
  disbursementDay: string; securityDepositHolder: "broker_trust" | "owner"; notes: string;
  newAddress: string; newCity: string; newState: string; newZip: string;
};

const pctToBps = (s: string) => Math.round(Number(s || 0) * 100);
const bpsToPct = (b: number) => String(b / 100);

export default function OwnersTab() {
  const { bookUserId, book } = useBook();
  const utils = trpc.useUtils();
  const owners = trpc.trust.owners.list.useQuery({ bookUserId });
  const agreements = trpc.trust.agreements.list.useQuery({ bookUserId });
  const properties = trpc.trust.properties.useQuery({ bookUserId });
  const accounts = trpc.trust.accounts.list.useQuery({ bookUserId });
  const refresh = () => { utils.trust.invalidate(); };

  const upsertOwner = trpc.trust.owners.upsert.useMutation();
  const invite = trpc.trust.owners.invite.useMutation();
  const upsertAgreement = trpc.trust.agreements.upsert.useMutation();
  const addProperty = trpc.trust.addProperty.useMutation();
  const terminate = trpc.trust.agreements.terminate.useMutation();
  const opening = trpc.trust.receipts.openingBalance.useMutation();

  const [owner, setOwner] = useState<OwnerForm | null>(null);
  const [ag, setAg] = useState<AgreementForm | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [ob, setOb] = useState<{ agreementId: number; owner: string; deposit: string; tenant: string; date: string } | null>(null);
  const [docsFor, setDocsFor] = useState<{ id: number; name: string } | null>(null);
  const canEdit = !!book?.perms.owners;

  const saveOwner = async () => {
    if (!owner) return;
    try {
      await upsertOwner.mutateAsync({
        bookUserId, id: owner.id, name: owner.name, email: owner.email || null, phone: owner.phone || null, mailingAddress: owner.mailingAddress || null,
        taxIdLast4: owner.taxIdLast4 || null, taxIdType: owner.taxIdType || null, w9OnFile: owner.w9OnFile, payoutMethod: owner.payoutMethod,
        payoutBankName: owner.payoutBankName || null, payoutAccountLast4: owner.payoutAccountLast4 || null, notes: owner.notes || null,
      });
      toast.success("Owner saved");
      setOwner(null);
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const newAgreement = () => {
    if (!accounts.data?.length) return toast.error("Add your trust account first (Setup tab).");
    if (!owners.data?.length) return toast.error("Add an owner first.");
    setAg({
      trustOwnerId: String(owners.data[0].id), crmPropertyId: properties.data?.[0] ? String(properties.data[0].id) : "new", trustAccountId: String((accounts.data.find((a) => a.kind === "general") ?? accounts.data[0]).id),
      startDate: today(), mgmtFeeType: "percent", mgmtFeePct: "10", mgmtFeeFlat: "", mgmtFeeMin: "", leasingFeeType: "percent_of_first_month", leasingFee: "50",
      renewalFeeType: "flat", renewalFee: "150", reserve: "250", ownerApprovalMode: "expenses_over_threshold", threshold: "500", disbursementDay: "10",
      securityDepositHolder: "broker_trust", notes: "", newAddress: "", newCity: "", newState: (accounts.data.find((a) => a.kind === "general") ?? accounts.data[0]).stateCode ?? "NC", newZip: "",
    });
  };

  const editAgreement = (a: NonNullable<typeof agreements.data>[number]) => setAg({
    id: a.id, trustOwnerId: String(a.trustOwnerId), crmPropertyId: String(a.crmPropertyId), trustAccountId: String(a.trustAccountId), startDate: a.startDate,
    mgmtFeeType: a.mgmtFeeType, mgmtFeePct: bpsToPct(a.mgmtFeeBps), mgmtFeeFlat: String(a.mgmtFeeFlatCents / 100), mgmtFeeMin: a.mgmtFeeMinCents ? String(a.mgmtFeeMinCents / 100) : "",
    leasingFeeType: a.leasingFeeType, leasingFee: a.leasingFeeType === "flat" ? String(a.leasingFeeValue / 100) : bpsToPct(a.leasingFeeValue),
    renewalFeeType: a.renewalFeeType, renewalFee: a.renewalFeeType === "flat" ? String(a.renewalFeeValue / 100) : bpsToPct(a.renewalFeeValue),
    reserve: String(a.reserveCents / 100), ownerApprovalMode: a.ownerApprovalMode, threshold: String(a.expenseApprovalThresholdCents / 100), disbursementDay: String(a.disbursementDay),
    securityDepositHolder: a.securityDepositHolder, notes: a.notes ?? "", newAddress: "", newCity: "", newState: "", newZip: "",
  });

  const saveAgreement = async () => {
    if (!ag) return;
    try {
      let crmPropertyId = Number(ag.crmPropertyId);
      if (ag.crmPropertyId === "new") {
        if (!ag.newAddress.trim()) return toast.error("Enter the property address.");
        crmPropertyId = (await addProperty.mutateAsync({ bookUserId, address: ag.newAddress, city: ag.newCity || undefined, zip: ag.newZip || undefined, state: (ag.newState || "NC").toUpperCase().slice(0, 2), totalUnits: 1 })).id;
      }
      const r = await upsertAgreement.mutateAsync({
        bookUserId, id: ag.id, trustOwnerId: Number(ag.trustOwnerId), crmPropertyId, trustAccountId: Number(ag.trustAccountId), startDate: ag.startDate,
        mgmtFeeType: ag.mgmtFeeType, mgmtFeeBps: pctToBps(ag.mgmtFeePct), mgmtFeeFlatCents: toCents(ag.mgmtFeeFlat), mgmtFeeMinCents: toCents(ag.mgmtFeeMin),
        leasingFeeType: ag.leasingFeeType, leasingFeeValue: ag.leasingFeeType === "flat" ? toCents(ag.leasingFee) : pctToBps(ag.leasingFee),
        renewalFeeType: ag.renewalFeeType, renewalFeeValue: ag.renewalFeeType === "flat" ? toCents(ag.renewalFee) : pctToBps(ag.renewalFee),
        reserveCents: toCents(ag.reserve), ownerApprovalMode: ag.ownerApprovalMode, expenseApprovalThresholdCents: toCents(ag.threshold),
        disbursementDay: Number(ag.disbursementDay) || 10, securityDepositHolder: ag.securityDepositHolder, notes: ag.notes || null,
      });
      toast.success("Management agreement saved — rent for this property now routes to your trust account.");
      if (r.retarget?.updated) toast.info(`${r.retarget.updated} existing autopay subscription(s) now pay into your account.`);
      if (r.retarget?.errors?.length) toast.warning(r.retarget.errors.join(" "));
      setAg(null);
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const doInvite = async (id: number) => {
    try {
      const r = await invite.mutateAsync({ bookUserId, ownerId: id });
      if (r.emailed) toast.success("Owner portal invite sent");
      else { setInviteLink(r.link); toast.info("Email isn't configured here — copy the invite link instead."); }
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  if (owners.isLoading || agreements.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-5">
      <Section title="Owners" desc="The people and companies whose properties you manage. Each owner gets a running-balance ledger per property." action={canEdit && <Button onClick={() => setOwner({ ...emptyOwner })} className="gap-2 text-white" style={{ background: ACCENT }}><Plus className="h-4 w-4" /> Add owner</Button>}>
        {!owners.data?.length ? <Empty>No owners yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Owner</th><th>Properties</th><th className="text-right">Balance</th><th className="text-right">Available to pay</th><th className="text-right">Deposits held</th><th>Portal</th><th>W-9</th><th></th></tr></thead>
              <tbody>
                {owners.data.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2"><div className="font-medium">{o.name}</div><div className="text-xs text-gray-400">{o.email ?? "no email"}</div></td>
                    <td>{o.propertyCount}</td>
                    <td className="text-right font-semibold">{fmt(o.balanceCents)}</td>
                    <td className="text-right">{fmt(o.availableCents)}</td>
                    <td className="text-right">{fmt(o.depositsHeldCents)}</td>
                    <td>{o.portalActive ? <span className="text-xs text-emerald-700">Active</span> : o.invitePending ? <span className="text-xs text-amber-700">Invited</span> : <span className="text-xs text-gray-400">—</span>}</td>
                    <td>{o.w9OnFile ? <span className="text-xs text-emerald-700">On file</span> : <span className="text-xs text-amber-700">Missing</span>}</td>
                    <td className="text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => setDocsFor({ id: o.id, name: o.name })} title="Documents shared in the owner portal"><FolderOpen className="h-4 w-4" /></Button>
                      {canEdit && <Button size="sm" variant="ghost" onClick={() => doInvite(o.id)} disabled={invite.isPending} title="Invite to owner portal"><Mail className="h-4 w-4" /></Button>}
                      {canEdit && <Button size="sm" variant="ghost" onClick={() => setOwner({ id: o.id, name: o.name, email: o.email ?? "", phone: o.phone ?? "", mailingAddress: o.mailingAddress ?? "", taxIdLast4: o.taxIdLast4 ?? "", taxIdType: (o.taxIdType ?? "") as any, w9OnFile: !!o.w9OnFile, payoutMethod: o.payoutMethod, payoutBankName: o.payoutBankName ?? "", payoutAccountLast4: o.payoutAccountLast4 ?? "", notes: o.notes ?? "" })}><Pencil className="h-4 w-4" /></Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Managed properties" desc="One management agreement per property: owner, trust account, fees, reserve and approval rules. Rent for these properties is collected into your account." action={canEdit && <Button onClick={newAgreement} className="gap-2 text-white" style={{ background: ACCENT }}><Plus className="h-4 w-4" /> Add property agreement</Button>}>
        {!agreements.data?.length ? <Empty>No management agreements yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Property</th><th>Owner</th><th>Fee</th><th className="text-right">Balance</th><th className="text-right">Reserve</th><th className="text-right">Fees accrued</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {agreements.data.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2"><div className="font-medium">{a.propertyLabel}</div><div className="text-xs text-gray-400">{a.tenants.filter((t) => t.status === "active").map((t) => `${t.firstName} ${t.lastName}`).join(", ") || "No active tenant in CRM"}</div></td>
                    <td>{a.ownerName}</td>
                    <td className="text-xs">{a.mgmtFeeType === "percent" ? `${a.mgmtFeeBps / 100}%` : a.mgmtFeeType === "flat" ? `${fmt(a.mgmtFeeFlatCents)}/mo` : "None"}{a.mgmtFeeMinCents ? ` (min ${fmt(a.mgmtFeeMinCents)})` : ""}</td>
                    <td className="text-right font-semibold">{fmt(a.balanceCents)}</td>
                    <td className="text-right">{fmt(a.reserveCents)}</td>
                    <td className="text-right">{fmt(a.feesAccruedCents)}</td>
                    <td>{a.status === "active" ? <span className="text-xs text-emerald-700">Active</span> : <span className="text-xs text-gray-400">Ended {a.endDate}</span>}</td>
                    <td className="text-right whitespace-nowrap">
                      {canEdit && a.status === "active" && <Button size="sm" variant="ghost" onClick={() => setOb({ agreementId: a.id, owner: "", deposit: "", tenant: "", date: today() })}>Opening balance</Button>}
                      {canEdit && <Button size="sm" variant="ghost" onClick={() => editAgreement(a)}><Pencil className="h-4 w-4" /></Button>}
                      {canEdit && a.status === "active" && <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => {
                        if (!confirm("End this management agreement? Rent will go back to the owner directly.")) return;
                        try { await terminate.mutateAsync({ bookUserId, agreementId: a.id, endDate: today() }); toast.success("Agreement ended"); refresh(); } catch (e: any) { toast.error(e.message); }
                      }}>End</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-gray-500">Tenants are managed in <a className="underline" href="/crm">Tenants / CRM</a> under the same property. Their pay links and autopay leases route to your trust account automatically.</p>
      </Section>

      {/* Owner dialog */}
      <Dialog open={!!owner} onOpenChange={(o) => !o && setOwner(null)}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader><DialogTitle>{owner?.id ? "Edit owner" : "Add owner"}</DialogTitle></DialogHeader>
          {owner && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Field label="Name (person or LLC)"><Input value={owner.name} onChange={(e) => setOwner({ ...owner, name: e.target.value })} /></Field></div>
              <Field label="Email"><Input type="email" value={owner.email} onChange={(e) => setOwner({ ...owner, email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={owner.phone} onChange={(e) => setOwner({ ...owner, phone: e.target.value })} /></Field>
              <div className="col-span-2"><Field label="Mailing address (for statements and 1099)"><Textarea rows={2} value={owner.mailingAddress} onChange={(e) => setOwner({ ...owner, mailingAddress: e.target.value })} /></Field></div>
              <Field label="TIN type"><Select value={owner.taxIdType} onChange={(v) => setOwner({ ...owner, taxIdType: v as any })}><option value="">—</option><option value="ssn">SSN</option><option value="ein">EIN</option></Select></Field>
              <Field label="TIN last 4" hint="Keep the full TIN on the W-9, not here."><Input maxLength={4} value={owner.taxIdLast4} onChange={(e) => setOwner({ ...owner, taxIdLast4: e.target.value.replace(/\D/g, "") })} /></Field>
              <div className="col-span-2 flex items-center gap-2"><Switch checked={owner.w9OnFile} onCheckedChange={(v) => setOwner({ ...owner, w9OnFile: v })} /><span className="text-sm">W-9 on file</span></div>
              <Field label="Pay owner by"><Select value={owner.payoutMethod} onChange={(v) => setOwner({ ...owner, payoutMethod: v as any })}><option value="ach">ACH from trust</option><option value="check">Trust account check</option><option value="other">Other</option></Select></Field>
              <Field label="Owner's bank (last 4)"><div className="flex gap-2"><Input placeholder="Bank" value={owner.payoutBankName} onChange={(e) => setOwner({ ...owner, payoutBankName: e.target.value })} /><Input className="w-20" maxLength={4} placeholder="1234" value={owner.payoutAccountLast4} onChange={(e) => setOwner({ ...owner, payoutAccountLast4: e.target.value.replace(/\D/g, "") })} /></div></Field>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setOwner(null)}>Cancel</Button><Button onClick={saveOwner} disabled={upsertOwner.isPending || !owner?.name} className="text-white" style={{ background: ACCENT }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agreement dialog */}
      <Dialog open={!!ag} onOpenChange={(o) => !o && setAg(null)}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{ag?.id ? "Edit management agreement" : "New management agreement"}</DialogTitle></DialogHeader>
          {ag && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Owner"><Select value={ag.trustOwnerId} onChange={(v) => setAg({ ...ag, trustOwnerId: v })}>{owners.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</Select></Field>
                <Field label="Property"><Select value={ag.crmPropertyId} onChange={(v) => setAg({ ...ag, crmPropertyId: v })}>{properties.data?.map((p) => <option key={p.id} value={p.id}>{[p.address, p.city].filter(Boolean).join(", ")}</option>)}<option value="new">+ New property…</option></Select></Field>
                {ag.crmPropertyId === "new" && <>
                  <div className="col-span-2"><Field label="Property address"><Input value={ag.newAddress} onChange={(e) => setAg({ ...ag, newAddress: e.target.value })} /></Field></div>
                  <Field label="City"><Input value={ag.newCity} onChange={(e) => setAg({ ...ag, newCity: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="State"><Input maxLength={2} value={ag.newState} onChange={(e) => setAg({ ...ag, newState: e.target.value.toUpperCase() })} /></Field>
                    <Field label="ZIP"><Input value={ag.newZip} onChange={(e) => setAg({ ...ag, newZip: e.target.value })} /></Field>
                  </div>
                </>}
                <Field label="Trust account"><Select value={ag.trustAccountId} onChange={(v) => setAg({ ...ag, trustAccountId: v })}>{accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></Field>
                <Field label="Start date"><Input type="date" value={ag.startDate} onChange={(e) => setAg({ ...ag, startDate: e.target.value })} /></Field>
              </div>
              <div className="rounded-xl border p-3 space-y-3">
                <div className="text-sm font-semibold">Fees (applied automatically when rent arrives)</div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Management fee"><Select value={ag.mgmtFeeType} onChange={(v) => setAg({ ...ag, mgmtFeeType: v as any })}><option value="percent">% of rent collected</option><option value="flat">Flat per month</option><option value="none">None</option></Select></Field>
                  {ag.mgmtFeeType === "percent" && <Field label="Percent"><Input inputMode="decimal" value={ag.mgmtFeePct} onChange={(e) => setAg({ ...ag, mgmtFeePct: e.target.value })} /></Field>}
                  {ag.mgmtFeeType === "percent" && <Field label="Monthly minimum"><MoneyInput value={ag.mgmtFeeMin} onChange={(v) => setAg({ ...ag, mgmtFeeMin: v })} /></Field>}
                  {ag.mgmtFeeType === "flat" && <Field label="Flat fee"><MoneyInput value={ag.mgmtFeeFlat} onChange={(v) => setAg({ ...ag, mgmtFeeFlat: v })} /></Field>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Leasing fee (new lease)"><div className="flex gap-2"><Select value={ag.leasingFeeType} onChange={(v) => setAg({ ...ag, leasingFeeType: v as any })}><option value="percent_of_first_month">% of first month</option><option value="flat">Flat</option><option value="none">None</option></Select>{ag.leasingFeeType !== "none" && <Input className="w-24" inputMode="decimal" value={ag.leasingFee} onChange={(e) => setAg({ ...ag, leasingFee: e.target.value })} />}</div></Field>
                  <Field label="Renewal fee"><div className="flex gap-2"><Select value={ag.renewalFeeType} onChange={(v) => setAg({ ...ag, renewalFeeType: v as any })}><option value="percent_of_first_month">% of first month</option><option value="flat">Flat</option><option value="none">None</option></Select>{ag.renewalFeeType !== "none" && <Input className="w-24" inputMode="decimal" value={ag.renewalFee} onChange={(e) => setAg({ ...ag, renewalFee: e.target.value })} />}</div></Field>
                </div>
                <p className="text-[11px] text-gray-400">Percent values are percentages (10 = 10%); flat values are dollars. Fees are never taken beyond what the owner holds.</p>
              </div>
              <div className="rounded-xl border p-3 grid grid-cols-2 gap-3">
                <div className="col-span-2 text-sm font-semibold">Disbursements</div>
                <Field label="Reserve kept for repairs"><MoneyInput value={ag.reserve} onChange={(v) => setAg({ ...ag, reserve: v })} /></Field>
                <Field label="Pay owner on day"><Input inputMode="numeric" value={ag.disbursementDay} onChange={(e) => setAg({ ...ag, disbursementDay: e.target.value })} /></Field>
                <Field label="Owner approval needed for"><Select value={ag.ownerApprovalMode} onChange={(v) => setAg({ ...ag, ownerApprovalMode: v as any })}><option value="none">Nothing</option><option value="expenses_over_threshold">Expenses over a limit</option><option value="disbursements">Owner distributions</option><option value="both">Both</option></Select></Field>
                {(ag.ownerApprovalMode === "expenses_over_threshold" || ag.ownerApprovalMode === "both") && <Field label="Expense limit"><MoneyInput value={ag.threshold} onChange={(v) => setAg({ ...ag, threshold: v })} /></Field>}
                <Field label="Security deposits held by" hint="G.S. 42-50: in an NC trust account or bonded."><Select value={ag.securityDepositHolder} onChange={(v) => setAg({ ...ag, securityDepositHolder: v as any })}><option value="broker_trust">Me, in trust</option><option value="owner">The owner (forward it)</option></Select></Field>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setAg(null)}>Cancel</Button><Button onClick={saveAgreement} disabled={upsertAgreement.isPending || addProperty.isPending} className="text-white" style={{ background: ACCENT }}>Save agreement</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {docsFor && <OwnerDocumentsDialog owner={docsFor} canEdit={canEdit} onClose={() => setDocsFor(null)} properties={(agreements.data ?? []).filter((a) => a.trustOwnerId === docsFor.id).map((a) => ({ id: a.crmPropertyId, label: a.propertyLabel }))} />}

      {/* Invite link fallback */}
      <Dialog open={!!inviteLink} onOpenChange={(o) => !o && setInviteLink(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Owner portal invite link</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Send this link to the owner. It works once and expires in 30 days.</p>
          <div className="flex gap-2"><Input readOnly value={inviteLink ?? ""} /><Button variant="outline" onClick={() => { navigator.clipboard.writeText(inviteLink ?? ""); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button></div>
        </DialogContent>
      </Dialog>

      {/* Opening balance */}
      <Dialog open={!!ob} onOpenChange={(o) => !o && setOb(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Carry over an opening balance</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Moving from another system? Enter what you already hold in the trust bank for this property. It's recorded as cleared on the date you pick.</p>
          {ob && <div className="grid grid-cols-2 gap-3">
            <Field label="Owner funds"><MoneyInput value={ob.owner} onChange={(v) => setOb({ ...ob, owner: v })} /></Field>
            <Field label="Tenant deposit held"><MoneyInput value={ob.deposit} onChange={(v) => setOb({ ...ob, deposit: v })} /></Field>
            <Field label="Tenant name (deposit)"><Input value={ob.tenant} onChange={(e) => setOb({ ...ob, tenant: e.target.value })} /></Field>
            <Field label="As of"><Input type="date" value={ob.date} onChange={(e) => setOb({ ...ob, date: e.target.value })} /></Field>
          </div>}
          <DialogFooter><Button onClick={async () => {
            if (!ob) return;
            try { await opening.mutateAsync({ bookUserId, agreementId: ob.agreementId, ownerCents: toCents(ob.owner), depositCents: toCents(ob.deposit), depositTenantName: ob.tenant || undefined, entryDate: ob.date }); toast.success("Opening balance recorded"); setOb(null); refresh(); } catch (e: any) { toast.error(e.message); }
          }} disabled={opening.isPending} className="text-white" style={{ background: ACCENT }}>Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DOC_CATEGORIES = [
  ["management_agreement", "Management agreement"], ["lease", "Lease"], ["inspection", "Inspection / move-in report"],
  ["insurance", "Insurance"], ["tax", "Tax / year-end"], ["other", "Other"],
] as const;

/** Files the owner can open (read-only) in their owner portal. */
function OwnerDocumentsDialog({ owner, canEdit, onClose, properties }: { owner: { id: number; name: string }; canEdit: boolean; onClose: () => void; properties: { id: number; label: string }[] }) {
  const { bookUserId } = useBook();
  const docs = trpc.trust.documents.list.useQuery({ bookUserId, ownerId: owner.id });
  const add = trpc.trust.documents.add.useMutation();
  const remove = trpc.trust.documents.remove.useMutation();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof DOC_CATEGORIES)[number][0]>("management_agreement");
  const [propertyId, setPropertyId] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (file.size > 25 * 1024 * 1024) return toast.error("Files must be 25 MB or smaller.");
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(r.error); r.readAsDataURL(file); });
      const res = await fetch("/api/upload-lease", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ dataUrl, filename: file.name }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.error || `Upload failed (${res.status})`);
      // Store the path only, so links survive a domain change.
      const url = String(json.url).replace(/^https?:\/\/[^/]+(?=\/uploads\/)/, "");
      await add.mutateAsync({ bookUserId, ownerId: owner.id, crmPropertyId: propertyId ? Number(propertyId) : null, category, title: title.trim() || file.name, url, fileName: file.name });
      toast.success("Shared in the owner portal");
      setTitle("");
      docs.refetch();
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); } finally { setUploading(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader><DialogTitle>Documents for {owner.name}</DialogTitle></DialogHeader>
        <p className="text-sm text-gray-600">The owner sees these read-only in their owner portal, next to their monthly statements.</p>
        {docs.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : !docs.data?.length ? <Empty>No documents shared yet.</Empty> : (
          <ul className="divide-y text-sm">{docs.data.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-2">
              <a href={d.url} target="_blank" rel="noreferrer" className="underline truncate">{d.title}</a>
              <span className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap">{DOC_CATEGORIES.find((c) => c[0] === d.category)?.[1]}
                {canEdit && <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => { if (!confirm(`Stop sharing "${d.title}"?`)) return; await remove.mutateAsync({ bookUserId, documentId: d.id }); docs.refetch(); }}><Trash2 className="h-4 w-4" /></Button>}
              </span>
            </li>
          ))}</ul>
        )}
        {canEdit && (
          <div className="rounded-xl border p-3 grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Title"><Input placeholder="e.g. Management agreement (signed)" value={title} onChange={(e) => setTitle(e.target.value)} /></Field></div>
            <Field label="Type"><Select value={category} onChange={(v) => setCategory(v as any)}>{DOC_CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field>
            <Field label="Property"><Select value={propertyId} onChange={setPropertyId}><option value="">All properties</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</Select></Field>
            <label className="col-span-2">
              <input type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload(f); }} />
              <span className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white cursor-pointer ${uploading ? "opacity-60" : ""}`} style={{ background: ACCENT }}>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload PDF or Word file</span>
            </label>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
