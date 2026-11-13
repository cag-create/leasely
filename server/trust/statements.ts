/** Monthly owner statements (data, PDF, email) and 1099-MISC totals. */
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { getUserById, getUserSubscription } from "../db";
import { crmProperties, trustLedgerEntries, trustManagementAgreements, trustOwners, trustAccounts } from "../../drizzle/schema";
import { db, accruedFeesCents } from "./service";
import { buildPropertyStatement, fmtCents, monthBounds, owner1099Totals } from "./logic";
import { SimplePdf } from "./pdf";

export type OwnerStatement = Awaited<ReturnType<typeof buildOwnerStatementData>>;

const label = (p?: { address: string; city: string | null; state: string | null } | null) => (p ? [p.address, p.city, p.state].filter(Boolean).join(", ") : "Property");

export async function buildOwnerStatementData(pmUserId: number, trustOwnerId: number, periodMonth: string) {
  const d = await db();
  const [owner] = await d.select().from(trustOwners).where(and(eq(trustOwners.id, trustOwnerId), eq(trustOwners.pmUserId, pmUserId)));
  if (!owner) throw new TRPCError({ code: "NOT_FOUND", message: "Owner not found" });
  const pm = await getUserById(pmUserId);
  const sub = await getUserSubscription(pmUserId);
  const agreements = await d.select().from(trustManagementAgreements).where(and(eq(trustManagementAgreements.trustOwnerId, owner.id), eq(trustManagementAgreements.pmUserId, pmUserId)));
  const entries = await d.select().from(trustLedgerEntries).where(and(eq(trustLedgerEntries.trustOwnerId, owner.id), eq(trustLedgerEntries.pmUserId, pmUserId)));
  const { end } = monthBounds(periodMonth);
  const properties = [] as Array<ReturnType<typeof buildPropertyStatement> & { agreementId: number; crmPropertyId: number; propertyLabel: string; feesAccruedCents: number; trustAccountName: string; status: string }>;
  for (const a of agreements) {
    if (a.startDate > end) continue;
    const [p] = await d.select().from(crmProperties).where(eq(crmProperties.id, a.crmPropertyId));
    const [acct] = await d.select().from(trustAccounts).where(eq(trustAccounts.id, a.trustAccountId));
    const mine = entries.filter((e) => e.crmPropertyId === a.crmPropertyId && e.trustAccountId === a.trustAccountId);
    const st = buildPropertyStatement(mine.map((e) => ({ ...e })), periodMonth, a.reserveCents);
    properties.push({ ...st, agreementId: a.id, crmPropertyId: a.crmPropertyId, propertyLabel: label(p), feesAccruedCents: await accruedFeesCents(d, a.id), trustAccountName: acct?.name ?? "Trust Account", status: a.status });
  }
  const sum = (f: (p: (typeof properties)[number]) => number) => properties.reduce((s, p) => s + f(p), 0);
  return {
    periodMonth,
    generatedAt: new Date().toISOString(),
    brokerage: { name: sub?.brandName || pm?.name || "Your property manager", email: pm?.email ?? null },
    owner: { id: owner.id, name: owner.name, email: owner.email, mailingAddress: owner.mailingAddress },
    properties,
    totals: {
      beginningBalanceCents: sum((p) => p.beginningBalanceCents),
      incomeCents: sum((p) => p.totals.income),
      feesCents: sum((p) => p.totals.fees),
      expensesCents: sum((p) => p.totals.expenses),
      disbursementsCents: sum((p) => p.totals.disbursements),
      adjustmentsCents: sum((p) => p.totals.adjustments),
      endingBalanceCents: sum((p) => p.endingBalanceCents),
      reserveCents: sum((p) => p.reserveCents),
      feesAccruedCents: sum((p) => p.feesAccruedCents),
      availableCents: sum((p) => Math.max(0, p.endingBalanceCents - p.reserveCents - p.feesAccruedCents)),
      securityDepositsHeldCents: sum((p) => p.securityDepositsHeldCents),
    },
  };
}

/** "1 Owner Way, Raleigh, NC 27601" → ["1 Owner Way", "Raleigh, NC 27601"]; explicit newlines win. */
export function addressLines(addr: string): string[] {
  const lines = addr.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines.slice(0, 3);
  const i = addr.indexOf(",");
  return i > 0 ? [addr.slice(0, i).trim(), addr.slice(i + 1).trim()] : [addr.trim()];
}

const monthName = (pm: string) => new Date(`${pm}-01T12:00:00Z`).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const NAVY: [number, number, number] = [0.106, 0.169, 0.369];

export function renderStatementPdf(s: OwnerStatement): Buffer {
  const pdf = new SimplePdf();
  const L = pdf.margin;
  const R = pdf.width - pdf.margin;
  pdf.rect(0, 0, pdf.width, 70, NAVY);
  pdf.text(L, 20, s.brokerage.name, { size: 16, bold: true, color: [1, 1, 1] });
  pdf.text(L, 42, "Owner Statement", { size: 10, color: [0.85, 0.88, 0.95] });
  pdf.text(R, 22, monthName(s.periodMonth), { size: 12, bold: true, align: "right", color: [1, 1, 1] });
  pdf.text(R, 42, `Generated ${s.generatedAt.slice(0, 10)}`, { size: 9, align: "right", color: [0.85, 0.88, 0.95] });
  pdf.y = 88;
  pdf.text(L, pdf.y, s.owner.name, { size: 11, bold: true });
  if (s.owner.mailingAddress) addressLines(s.owner.mailingAddress).forEach((ln, i) => pdf.text(L, pdf.y + 14 + i * 12, ln, { size: 9, color: [0.35, 0.38, 0.45] }));

  // Summary box
  const t = s.totals;
  const rows: [string, number][] = [
    ["Beginning balance", t.beginningBalanceCents],
    ["Rent & other income", t.incomeCents],
    ["Management & leasing fees", t.feesCents],
    ["Repairs & expenses", t.expensesCents],
    ["Paid to you", t.disbursementsCents],
    ...(t.adjustmentsCents ? [["Adjustments", t.adjustmentsCents] as [string, number]] : []),
    ["Ending balance", t.endingBalanceCents],
  ];
  const bx = 330;
  let by = 88;
  rows.forEach(([k, v], i) => {
    const last = i === rows.length - 1;
    if (last) pdf.line(bx, by - 2, R, by - 2, 0.8, 0.4);
    pdf.text(bx, by, k, { size: 9.5, bold: last });
    pdf.text(R, by, fmtCents(v), { size: 9.5, bold: last, align: "right" });
    by += 14;
  });
  pdf.text(bx, by + 2, `Reserve held ${fmtCents(t.reserveCents)} · Fees accrued ${fmtCents(t.feesAccruedCents)}`, { size: 8, color: [0.4, 0.42, 0.5] });
  pdf.text(bx, by + 13, `Security deposits held for tenants: ${fmtCents(t.securityDepositsHeldCents)}`, { size: 8, color: [0.4, 0.42, 0.5] });
  pdf.y = Math.max(by + 34, 170);

  for (const p of s.properties) {
    pdf.ensure(80);
    pdf.rect(L, pdf.y, R - L, 20, [0.94, 0.95, 0.98]);
    pdf.fitText(L + 6, pdf.y + 5, p.propertyLabel, 330, { size: 10, bold: true });
    pdf.text(R - 6, pdf.y + 5, `Ending ${fmtCents(p.endingBalanceCents)}`, { size: 9.5, bold: true, align: "right" });
    pdf.y += 26;
    const cols = { date: L, desc: L + 62, party: L + 300, amt: R - 80, bal: R };
    pdf.text(cols.date, pdf.y, "Date", { size: 8, bold: true, color: [0.4, 0.42, 0.5] });
    pdf.text(cols.desc, pdf.y, "Description", { size: 8, bold: true, color: [0.4, 0.42, 0.5] });
    pdf.text(cols.party, pdf.y, "From / to", { size: 8, bold: true, color: [0.4, 0.42, 0.5] });
    pdf.text(cols.amt, pdf.y, "Amount", { size: 8, bold: true, align: "right", color: [0.4, 0.42, 0.5] });
    pdf.text(cols.bal, pdf.y, "Balance", { size: 8, bold: true, align: "right", color: [0.4, 0.42, 0.5] });
    pdf.y += 12;
    pdf.line(L, pdf.y - 2, R, pdf.y - 2);
    pdf.text(cols.desc, pdf.y, "Beginning balance", { size: 9, color: [0.35, 0.38, 0.45] });
    pdf.text(cols.bal, pdf.y, fmtCents(p.beginningBalanceCents), { size: 9, align: "right" });
    pdf.y += 13;
    if (p.lines.length === 0) {
      pdf.text(cols.desc, pdf.y, "No activity this month.", { size: 9, color: [0.45, 0.47, 0.55] });
      pdf.y += 13;
    }
    for (const l of p.lines) {
      pdf.ensure(14);
      pdf.text(cols.date, pdf.y, l.entryDate, { size: 9 });
      pdf.fitText(cols.desc, pdf.y, l.description, 230, { size: 9 });
      pdf.fitText(cols.party, pdf.y, l.counterparty ?? "", 110, { size: 9, color: [0.35, 0.38, 0.45] });
      pdf.text(cols.amt, pdf.y, fmtCents(l.amountCents), { size: 9, align: "right", color: l.amountCents < 0 ? [0.6, 0.12, 0.12] : [0.07, 0.4, 0.22] });
      pdf.text(cols.bal, pdf.y, fmtCents(l.runningBalanceCents), { size: 9, align: "right" });
      pdf.y += 13;
    }
    pdf.line(L, pdf.y, R, pdf.y);
    pdf.y += 5;
    pdf.text(L, pdf.y, `Reserve ${fmtCents(p.reserveCents)}  ·  Fees accrued, not yet paid ${fmtCents(p.feesAccruedCents)}  ·  Deposits held ${fmtCents(p.securityDepositsHeldCents)}  ·  Held in: ${p.trustAccountName}`, { size: 8, color: [0.4, 0.42, 0.5] });
    pdf.y += 24;
  }
  pdf.ensure(40);
  pdf.text(L, pdf.y, "Funds are held in the broker's trust account as required by 21 NCAC 58A .0116-.0117. You may request copies of the records for", { size: 7.5, color: [0.45, 0.47, 0.55] });
  pdf.text(L, pdf.y + 10, "your properties in writing; the broker must provide them within 10 days (.0117(g)).", { size: 7.5, color: [0.45, 0.47, 0.55] });
  return pdf.toBuffer((page, total) => `${s.brokerage.name} · Owner statement ${s.periodMonth} · ${s.owner.name} · Page ${page} of ${total}`);
}

export function statementEmailHtml(s: OwnerStatement, portalUrl: string): string {
  const t = s.totals;
  const row = (k: string, v: number, bold = false) => `<tr><td style="padding:4px 0;color:#374151${bold ? ";font-weight:700" : ""}">${k}</td><td style="padding:4px 0;text-align:right${bold ? ";font-weight:700" : ""}">${fmtCents(v)}</td></tr>`;
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
    <h2 style="color:#1B2B5E;margin:0 0 4px">Your ${monthName(s.periodMonth)} owner statement</h2>
    <p style="color:#6b7280;margin:0 0 16px">From ${s.brokerage.name}. The full statement is attached as a PDF.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${row("Beginning balance", t.beginningBalanceCents)}
      ${row("Rent & other income", t.incomeCents)}
      ${row("Fees", t.feesCents)}
      ${row("Repairs & expenses", t.expensesCents)}
      ${row("Paid to you", t.disbursementsCents)}
      ${row("Ending balance", t.endingBalanceCents, true)}
    </table>
    <p style="font-size:13px;color:#6b7280">Reserve held: ${fmtCents(t.reserveCents)} · Security deposits held for tenants: ${fmtCents(t.securityDepositsHeldCents)}</p>
    <p style="margin-top:20px"><a href="${portalUrl}" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Open your owner portal</a></p>
  </div>`;
}

export async function owner1099ForYear(pmUserId: number, year: number) {
  const d = await db();
  const owners = await d.select().from(trustOwners).where(eq(trustOwners.pmUserId, pmUserId));
  const out = [];
  for (const o of owners) {
    const entries = await d.select({ entryDate: trustLedgerEntries.entryDate, type: trustLedgerEntries.type, amountCents: trustLedgerEntries.amountCents, ledgerType: trustLedgerEntries.ledgerType })
      .from(trustLedgerEntries).where(and(eq(trustLedgerEntries.trustOwnerId, o.id), eq(trustLedgerEntries.pmUserId, pmUserId)));
    out.push({ owner: { id: o.id, name: o.name, email: o.email, mailingAddress: o.mailingAddress, taxIdLast4: o.taxIdLast4, taxIdType: o.taxIdType, w9OnFile: !!o.w9OnFile }, ...owner1099Totals(entries, year) });
  }
  return out;
}
