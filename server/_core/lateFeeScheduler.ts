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
import { and, eq, gt, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { rentPayments, leaseAgreements } from "../../drizzle/schema";

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

let schedulerHandle: ReturnType<typeof setInterval> | null = null;

/** Install the recurring late-fee sweep. Idempotent. */
export function startLateFeeScheduler(): void {
  if (schedulerHandle) clearInterval(schedulerHandle);
  setTimeout(() => {
    void runLateFeeSweep().then((r) => {
      if (r.charged || r.errors) console.log(`[lateFees] boot sweep: charged=${r.charged} errors=${r.errors}`);
    });
  }, 100_000);
  schedulerHandle = setInterval(() => {
    void runLateFeeSweep().then((r) => {
      if (r.charged || r.errors) console.log(`[lateFees] daily sweep: charged=${r.charged} errors=${r.errors}`);
    });
  }, SCHEDULER_INTERVAL_MS);
}
