/**
 * Live compliance checklist for a brokerage's trust books, driven by the
 * state rules data. Used by the dashboard and the daily alert sweep.
 */
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  trustAccounts, trustApprovals, trustFeeAccruals, trustJournalEntries, trustLedgerEntries, trustManagementAgreements,
  trustOwnerStatements, trustReconciliations, trustSecurityDeposits, trustOwners,
} from "../../drizzle/schema";
import { db } from "./service";
import { rulesFor } from "./stateRules";
import { addBankingDays, daysBetween, depositTimeliness, fmtCents, securityDepositDeadlines, trustAccountTitleOk } from "./logic";

export type ComplianceItem = { severity: "error" | "warning" | "info"; code: string; message: string; rule?: string; link?: string };

const today = () => new Date().toISOString().slice(0, 10);
const prevMonth = (ymd: string) => {
  const d = new Date(`${ymd.slice(0, 7)}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
};

export async function complianceFor(pmUserId: number, now = today()): Promise<ComplianceItem[]> {
  const d = await db();
  const items: ComplianceItem[] = [];
  const accounts = await d.select().from(trustAccounts).where(and(eq(trustAccounts.pmUserId, pmUserId), eq(trustAccounts.status, "active")));
  const agreements = await d.select().from(trustManagementAgreements).where(eq(trustManagementAgreements.pmUserId, pmUserId));
  const active = agreements.filter((a) => a.status === "active");
  if (accounts.length === 0) {
    items.push({ severity: "info", code: "no_account", message: "Add your trust account to start recording owner funds.", link: "/trust?tab=setup" });
    return items;
  }

  for (const acct of accounts) {
    const rules = rulesFor(acct.stateCode);
    if (!rules.verified) items.push({ severity: "warning", code: "rules_unverified", message: `${acct.name}: ${acct.stateCode} trust rules aren't loaded yet; NC rules are applied. Confirm your state's requirements.` });
    if (!trustAccountTitleOk(acct.name, rules)) {
      items.push({ severity: "error", code: "account_title", message: `"${acct.name}" must be designated a "Trust Account" or "Escrow Account" — on the bank account, statements, deposit tickets and checks.`, rule: "21 NCAC 58A .0117(b)" });
    }
    if (acct.interestBearing && (!acct.interestAuthorizationNote || !acct.interestAuthorizedAt)) {
      items.push({ severity: "error", code: "interest_auth", message: `${acct.name} bears interest but no written authorization is recorded (who gets the interest).`, rule: "21 NCAC 58A .0116(c)" });
    }
    if (acct.kind === "hoa") {
      const owners = new Set(active.filter((a) => a.trustAccountId === acct.id).map((a) => a.trustOwnerId));
      if (owners.size > 1) items.push({ severity: "error", code: "hoa_commingled", message: `${acct.name} holds money for more than one owner. An association's trust account must hold only that association's money.`, rule: "21 NCAC 58A .0118(a)" });
      for (const ownerId of Array.from(owners)) {
        const [last] = await d.select({ at: trustOwnerStatements.emailedAt }).from(trustOwnerStatements).where(eq(trustOwnerStatements.trustOwnerId, ownerId)).orderBy(sql`${trustOwnerStatements.emailedAt} DESC`).limit(1);
        const started = active.find((a) => a.trustOwnerId === ownerId)?.startDate ?? now;
        const lastYmd = last?.at ? new Date(last.at).toISOString().slice(0, 10) : started;
        if (daysBetween(lastYmd, now) > rules.hoa.statementMaxDays) {
          items.push({ severity: "error", code: "hoa_statement", message: `${acct.hoaName ?? acct.name}: send the association a statement — it's been more than ${rules.hoa.statementMaxDays} days.`, rule: "21 NCAC 58A .0118(a)", link: "/trust?tab=statements" });
        }
      }
    }

    // Ledger health
    const balances = await d.select({ ledgerType: trustLedgerEntries.ledgerType, owner: trustLedgerEntries.trustOwnerId, prop: trustLedgerEntries.crmPropertyId, bal: sql<number>`SUM(${trustLedgerEntries.amountCents})` })
      .from(trustLedgerEntries).where(eq(trustLedgerEntries.trustAccountId, acct.id))
      .groupBy(trustLedgerEntries.ledgerType, trustLedgerEntries.trustOwnerId, trustLedgerEntries.crmPropertyId);
    for (const b of balances) {
      const bal = Number(b.bal);
      if ((b.ledgerType === "owner" || b.ledgerType === "security_deposit") && bal < 0) {
        items.push({ severity: "error", code: "negative_ledger", message: `A ${b.ledgerType === "owner" ? "owner" : "security-deposit"} ledger in ${acct.name} is negative (${fmtCents(bal)}). Fund it from the owner immediately.`, rule: "21 NCAC 58A .0116(f)" });
      }
      if (b.ledgerType === "company" && bal > rules.companyFundsCapCents) {
        items.push({ severity: "error", code: "company_cap", message: `Broker funds in ${acct.name} are ${fmtCents(bal)}, over the ${fmtCents(rules.companyFundsCapCents)} limit.`, rule: "21 NCAC 58A .0117(c)(4)(C)" });
      }
    }

    // 3-banking-day rule
    const deposits = await d.select().from(trustJournalEntries).where(and(eq(trustJournalEntries.trustAccountId, acct.id), eq(trustJournalEntries.kind, "deposit")));
    for (const j of deposits) {
      if (!j.receivedDate || j.voidOfEntryId) continue;
      if (j.method === "stripe") {
        // Stripe holds the money until it pays out to the trust bank.
        const bankDate = j.clearedDate ?? j.expectedBankDate;
        const t = depositTimeliness(j.receivedDate, bankDate, rules, now);
        if (t.status === "late" && !j.clearedDate) items.push({ severity: "warning", code: "stripe_payout_slow", message: `Stripe receipt #${j.id} (${fmtCents(j.amountCents)}) is scheduled to reach the bank ${bankDate}, after the ${t.deadline} deadline. Set Stripe payouts to daily.`, rule: "21 NCAC 58A .0116(a)", link: "/payouts" });
        else if (t.status === "overdue" && daysBetween(t.deadline, now) <= 45) items.push({ severity: "warning", code: "stripe_not_in_bank", message: `Stripe receipt #${j.id} (${fmtCents(j.amountCents)}, received ${j.receivedDate}) hasn't been matched to a bank deposit; it was due in the trust bank by ${t.deadline}. Reconcile or sync Stripe payouts.`, rule: "21 NCAC 58A .0116(a)", link: "/trust?tab=reconcile" });
      } else if (j.entryDate > addBankingDays(j.receivedDate, rules.depositDeadlineBankingDays) && daysBetween(j.entryDate, now) <= 60) {
        items.push({ severity: "error", code: "late_deposit", message: `Receipt #${j.id} from ${j.counterparty} was received ${j.receivedDate} but deposited ${j.entryDate}, past the ${rules.depositDeadlineBankingDays}-banking-day limit.`, rule: "21 NCAC 58A .0116(a)" });
      }
    }

    // Monthly reconciliation
    const lastMonth = prevMonth(now);
    const firstActivity = deposits.reduce<string | null>((m, j) => (!m || j.entryDate < m ? j.entryDate : m), null);
    if (firstActivity && firstActivity.slice(0, 7) <= lastMonth) {
      const [rec] = await d.select().from(trustReconciliations).where(and(eq(trustReconciliations.trustAccountId, acct.id), eq(trustReconciliations.periodMonth, lastMonth)));
      if (!rec || rec.status !== "finalized") {
        items.push({ severity: Number(now.slice(8, 10)) > 15 ? "error" : "warning", code: "recon_due", message: `${acct.name}: the ${lastMonth} three-way reconciliation isn't finalized yet.`, rule: "21 NCAC 58A .0117(e)", link: "/trust?tab=reconcile" });
      }
    }
  }

  // Security deposits (G.S. 42-50 / 42-52)
  const sds = await d.select().from(trustSecurityDeposits).where(and(eq(trustSecurityDeposits.pmUserId, pmUserId), eq(trustSecurityDeposits.status, "held")));
  const nc = rulesFor("NC");
  for (const sd of sds) {
    const dl = securityDepositDeadlines(sd, nc);
    if (!sd.bankNoticeSentAt) {
      const left = daysBetween(now, dl.bankNoticeDue);
      if (left <= 7) items.push({ severity: left < 0 ? "error" : "warning", code: "sd_notice", message: `Tell ${sd.tenantName} where their deposit is held — due ${dl.bankNoticeDue}.`, rule: "G.S. 42-50", link: "/trust?tab=deposits" });
    }
    if (dl.itemizationDue) {
      const left = daysBetween(now, dl.itemizationDue);
      if (left <= 10) items.push({ severity: left < 0 ? "error" : "warning", code: "sd_itemize", message: `${sd.tenantName} moved out ${sd.tenancyEndDate}: refund or itemize the deposit by ${dl.itemizationDue}.`, rule: "G.S. 42-52", link: "/trust?tab=deposits" });
    }
  }

  // Fees waiting to leave trust, approvals waiting on owners
  const [fees] = await d.select({ n: sql<number>`COUNT(*)`, s: sql<number>`COALESCE(SUM(${trustFeeAccruals.amountCents}),0)` }).from(trustFeeAccruals).where(and(eq(trustFeeAccruals.pmUserId, pmUserId), eq(trustFeeAccruals.status, "accrued")));
  if (Number(fees?.s ?? 0) > 0) items.push({ severity: "info", code: "fees_accrued", message: `${fmtCents(Number(fees.s))} in earned fees (${Number(fees.n)} items) is ready to transfer to your operating account.`, link: "/trust?tab=disburse" });
  const [appr] = await d.select({ n: sql<number>`COUNT(*)` }).from(trustApprovals).where(and(eq(trustApprovals.pmUserId, pmUserId), inArray(trustApprovals.status, ["pending", "approved"])));
  if (Number(appr?.n ?? 0) > 0) items.push({ severity: "info", code: "approvals", message: `${Number(appr.n)} expense/disbursement request(s) are waiting on an owner or ready to pay.`, link: "/trust?tab=disburse" });

  // Owners missing W-9 / TIN (1099 readiness)
  const owners = await d.select().from(trustOwners).where(and(eq(trustOwners.pmUserId, pmUserId), eq(trustOwners.status, "active")));
  const noW9 = owners.filter((o) => !o.w9OnFile).length;
  if (noW9) items.push({ severity: "info", code: "w9", message: `${noW9} owner(s) have no W-9 on file; you'll need their TIN for 1099-MISC.`, link: "/trust?tab=owners" });
  if (active.length && !accounts.some((a) => a.receivesStripePayouts)) items.push({ severity: "warning", code: "payout_bank", message: "Mark which trust account receives your Stripe payouts, and make sure Stripe pays out to that trust bank account — online rent must land in trust.", rule: "G.S. 93A-6(g)", link: "/trust?tab=setup" });
  return items;
}
