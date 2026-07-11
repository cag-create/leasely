/**
 * Late-fee accrual scheduler.
 *
 * Wakes once a day and applies each lease's own late fee to any rent period
 * that is still unpaid past that lease's grace window. Per-lease policy lives
 * on lease_agreements (lateFeeCents + lateFeeGraceDays) — the landlord sets it
 * at onboarding, within the state's legal cap. A period is charged at most
 * once (guarded by rent_payments.lateFeeCents = 0), and the landlord can later
 * void it (set back to 0) or mark the period paid offline.
 *
 * Idempotent + safe to re-run. Scheduler pattern matches rentReminders.ts.
 */
import { and, eq, gt, inArray, like } from "drizzle-orm";
import { getDb } from "../db";
import { rentPayments, leaseAgreements, crmLeases, accountingEntries } from "../../drizzle/schema";

const DAY_MS = 24 * 60 * 60 * 1000;
const SCHEDULER_INTERVAL_MS = DAY_MS;

export async function runLateFeeSweep(): Promise<{ charged: number; errors: number }> {
  const db = await getDb();
  if (!db) return { charged: 0, errors: 0 };

  // Unpaid periods with no late fee yet, on leases that actually have a policy.
  const rows = await db.select({
    id: rentPayments.id,
    dueDate: rentPayments.dueDate,
    feeCents: leaseAgreements.lateFeeCents,
    graceDays: leaseAgreements.lateFeeGraceDays,
  })
    .from(rentPayments)
    .innerJoin(leaseAgreements, eq(rentPayments.leaseAgreementId, leaseAgreements.id))
    .where(and(
      inArray(rentPayments.status, ["pending", "late", "partial"]),
      eq(rentPayments.lateFeeCents, 0),
      gt(leaseAgreements.lateFeeCents, 0),
    ));

  const now = Date.now();
  let charged = 0, errors = 0;

  for (const r of rows) {
    try {
      const due = new Date(r.dueDate).getTime();
      if (isNaN(due)) continue;
      const graceMs = (r.graceDays ?? 5) * DAY_MS;
      if (now <= due + graceMs) continue; // still inside the grace window
      await db.update(rentPayments)
        .set({ lateFeeCents: r.feeCents ?? 0, status: "late" })
        .where(eq(rentPayments.id, r.id));
      charged++;
    } catch {
      errors++;
    }
  }
  return { charged, errors };
}

/**
 * CRM-managed leases (occupied units tracked in crm_leases + accounting_entries,
 * not the signed-lease rent_payments ledger). For each active lease with a late
 * fee, walk every month from lease start to now: if no rent income is recorded
 * for that month AND we're past that month's due-day + grace, post a one-time
 * `late_fee` income entry. Idempotent (skips months that already have a rent or
 * late_fee entry) — the landlord can delete the entry to void it.
 */
export async function runCrmLateFeeSweep(): Promise<{ charged: number; errors: number }> {
  const db = await getDb();
  if (!db) return { charged: 0, errors: 0 };
  const leases = await db.select().from(crmLeases)
    .where(and(eq(crmLeases.status, "active"), gt(crmLeases.lateFeeCents, 0)));
  const now = new Date();
  let charged = 0, errors = 0;

  for (const lease of leases as any[]) {
    try {
      const start = new Date(lease.startDate);
      if (isNaN(start.getTime())) continue;
      const dueDay = start.getDate();          // rent due this day each month
      const grace = lease.lateFeeGraceDays ?? 5;
      let cur = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      while (cur <= endMonth) {
        const y = cur.getFullYear(), m = cur.getMonth();
        const ym = `${y}-${String(m + 1).padStart(2, "0")}`;
        const applyDate = new Date(y, m, dueDay + grace);
        if (now > applyDate) {
          const [rent] = await db.select({ id: accountingEntries.id }).from(accountingEntries)
            .where(and(eq(accountingEntries.crmPropertyId, lease.crmPropertyId), eq(accountingEntries.category, "rent"), like(accountingEntries.date, `${ym}-%`))).limit(1);
          if (!rent) {
            const [fee] = await db.select({ id: accountingEntries.id }).from(accountingEntries)
              .where(and(eq(accountingEntries.crmPropertyId, lease.crmPropertyId), eq(accountingEntries.category, "late_fee"), like(accountingEntries.date, `${ym}-%`))).limit(1);
            if (!fee) {
              await db.insert(accountingEntries).values({
                userId: lease.userId,
                crmPropertyId: lease.crmPropertyId,
                type: "income",
                category: "late_fee",
                amount: lease.lateFeeCents,
                date: `${ym}-${String(Math.min(28, dueDay + grace)).padStart(2, "0")}`,
                description: `Late fee — ${ym} rent past ${grace}-day grace`,
              } as any);
              charged++;
            }
          }
        }
        cur = new Date(y, m + 1, 1);
      }
    } catch {
      errors++;
    }
  }
  return { charged, errors };
}

let schedulerHandle: ReturnType<typeof setInterval> | null = null;

async function runBoth(label: string): Promise<void> {
  const [ledger, crm] = await Promise.all([runLateFeeSweep(), runCrmLateFeeSweep()]);
  const charged = ledger.charged + crm.charged, errors = ledger.errors + crm.errors;
  if (charged || errors) console.log(`[lateFees] ${label}: charged=${charged} (ledger=${ledger.charged} crm=${crm.charged}) errors=${errors}`);
}

/** Install the recurring late-fee sweep (signed-lease ledger + CRM leases). Idempotent. */
export function startLateFeeScheduler(): void {
  if (schedulerHandle) clearInterval(schedulerHandle);
  setTimeout(() => { void runBoth("boot sweep"); }, 100_000);
  schedulerHandle = setInterval(() => { void runBoth("daily sweep"); }, SCHEDULER_INTERVAL_MS);
}
