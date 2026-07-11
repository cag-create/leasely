/**
 * Overdue-rent reminder scheduler.
 *
 * Wakes once a day, finds rent_payments past their due date, and emails the
 * tenant a polite escalation series. Three milestones:
 *
 *   T+1 day  — gentle reminder ("rent shows as unpaid")
 *   T+3 days — firm reminder ("now 3 days past due, late fees may apply")
 *   T+7 days — overdue notice (cc landlord, explicit late-fee + statutory
 *              cure-period language)
 *
 * After T+7 we stop sending to avoid harassing the tenant; arrears at that
 * point is a human conversation for the landlord, not a bot. The schedule
 * is intentionally conservative — late fees and habitability remedies are
 * state-specific (e.g. NC requires written demand for possession before
 * eviction), so this is a payment-prompt, not a legal notice.
 *
 * Idempotent: a row is only emailed once per milestone, tracked via
 * `remindersSentCount` on rent_payments. Re-running the same day is a
 * no-op for rows that already received the next milestone.
 *
 * Scheduler pattern matches expiryScheduler.ts and rentBenchmarks.ts —
 * module-local setInterval handle, idempotent start.
 */
import { and, eq, inArray, lt } from "drizzle-orm";
import { getDb } from "../db";
import { rentPayments, leaseAgreements, users } from "../../drizzle/schema";
import { sendEmail } from "./email";

const DAY_MS = 24 * 60 * 60 * 1000;
const SCHEDULER_INTERVAL_MS = DAY_MS;

// Status values where the row is still considered "owed". Once status flips
// to "paid" or "skipped" we leave it alone.
const OPEN_STATUSES = ["pending", "late", "partial"] as const;

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromYmd: string, toYmd: string): number {
  // Both are YYYY-MM-DD; Date construction at UTC midnight keeps DST out
  // of the math. We only need integer-day precision.
  const a = Date.UTC(
    Number(fromYmd.slice(0, 4)),
    Number(fromYmd.slice(5, 7)) - 1,
    Number(fromYmd.slice(8, 10)),
  );
  const b = Date.UTC(
    Number(toYmd.slice(0, 4)),
    Number(toYmd.slice(5, 7)) - 1,
    Number(toYmd.slice(8, 10)),
  );
  return Math.floor((b - a) / DAY_MS);
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Milestone {
  daysOverdueThreshold: number;
  subject: (ctx: ReminderCtx) => string;
  html: (ctx: ReminderCtx) => string;
  ccLandlord: boolean;
}

interface ReminderCtx {
  tenantName: string;
  tenantEmail: string;
  propertyAddress: string;
  amountCents: number;
  dueDate: string;
  periodMonth: string;
  daysOverdue: number;
  landlordEmail?: string;
  landlordName?: string;
}

function gentleReminder(ctx: ReminderCtx): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:${BRAND};padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Friendly Rent Reminder</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 12px">Hi ${ctx.tenantName},</p>
    <p style="margin:0 0 16px">This is a friendly reminder that your rent for <strong>${ctx.propertyAddress}</strong> shows as unpaid.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:white;border:1px solid #e5e7eb;border-radius:8px">
      <tr><td style="padding:10px 14px;color:#6b7280">Amount due</td><td style="padding:10px 14px;text-align:right;font-weight:bold">${formatCents(ctx.amountCents)}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b7280;border-top:1px solid #e5e7eb">Due date</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #e5e7eb">${ctx.dueDate}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b7280;border-top:1px solid #e5e7eb">Period</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #e5e7eb">${ctx.periodMonth}</td></tr>
    </table>
    <p style="margin:0 0 16px">If you've already paid (Zelle, check, etc.), please reply so your landlord can mark it received. If not, sign in to your tenant portal to pay online.</p>
    <p style="text-align:center;margin:24px 0">
      <a href="${process.env.APP_URL ?? "https://keycove.net"}/tenant-portal/signin"
         style="background:${ACCENT};color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block">
        Open Tenant Portal
      </a>
    </p>
    <p style="color:#9ca3af;font-size:12px;margin-top:16px">If you have questions, reply directly to this email to reach your landlord.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">Powered by <strong style="color:${BRAND}">Keycove</strong></p>
</div>`;
}

function firmReminder(ctx: ReminderCtx): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#b45309;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Rent Past Due — ${ctx.daysOverdue} Days</h1>
  </div>
  <div style="background:#fef3c7;padding:24px;border:1px solid #fcd34d;border-radius:0 0 10px 10px">
    <p style="margin:0 0 12px">Hi ${ctx.tenantName},</p>
    <p style="margin:0 0 16px">Your rent for <strong>${ctx.propertyAddress}</strong> is now <strong>${ctx.daysOverdue} days past due</strong>. Late fees may apply per your lease.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:white;border:1px solid #e5e7eb;border-radius:8px">
      <tr><td style="padding:10px 14px;color:#6b7280">Amount due</td><td style="padding:10px 14px;text-align:right;font-weight:bold;color:#b45309">${formatCents(ctx.amountCents)}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b7280;border-top:1px solid #e5e7eb">Was due</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #e5e7eb">${ctx.dueDate}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b7280;border-top:1px solid #e5e7eb">Days overdue</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #e5e7eb;color:#b45309;font-weight:bold">${ctx.daysOverdue}</td></tr>
    </table>
    <p style="margin:0 0 16px">Please pay as soon as possible to avoid further late fees. If you've already paid off-platform, reply to this email so your landlord can mark it received.</p>
    <p style="text-align:center;margin:24px 0">
      <a href="${process.env.APP_URL ?? "https://keycove.net"}/tenant-portal/signin"
         style="background:${ACCENT};color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block">
        Pay Rent Now
      </a>
    </p>
    <p style="color:#9ca3af;font-size:12px;margin-top:16px">Reply to this email to discuss a payment plan with your landlord.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">Powered by <strong style="color:${BRAND}">Keycove</strong></p>
</div>`;
}

function overdueNotice(ctx: ReminderCtx): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#991b1b;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Overdue Rent Notice</h1>
  </div>
  <div style="background:#fef2f2;padding:24px;border:1px solid #fecaca;border-radius:0 0 10px 10px">
    <p style="margin:0 0 12px">Hi ${ctx.tenantName},</p>
    <p style="margin:0 0 16px">Your rent for <strong>${ctx.propertyAddress}</strong> is now <strong>${ctx.daysOverdue} days past due</strong>. Per your lease, late fees apply and continued non-payment may lead to further action.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:white;border:1px solid #e5e7eb;border-radius:8px">
      <tr><td style="padding:10px 14px;color:#6b7280">Amount outstanding</td><td style="padding:10px 14px;text-align:right;font-weight:bold;color:#991b1b">${formatCents(ctx.amountCents)}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b7280;border-top:1px solid #e5e7eb">Original due date</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #e5e7eb">${ctx.dueDate}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b7280;border-top:1px solid #e5e7eb">Days overdue</td><td style="padding:10px 14px;text-align:right;border-top:1px solid #e5e7eb;color:#991b1b;font-weight:bold">${ctx.daysOverdue}</td></tr>
    </table>
    <p style="margin:0 0 16px"><strong>To avoid further action</strong>, please pay or contact your landlord directly to arrange payment.</p>
    <p style="text-align:center;margin:24px 0">
      <a href="${process.env.APP_URL ?? "https://keycove.net"}/tenant-portal/signin"
         style="background:${ACCENT};color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block">
        Pay Outstanding Balance
      </a>
    </p>
    <p style="color:#7f1d1d;font-size:12px;margin-top:16px;background:#fee2e2;padding:10px;border-radius:6px">
      Your landlord has been copied on this notice. This is an automated reminder — for a payment plan or hardship discussion, reply directly.
    </p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">Powered by <strong style="color:${BRAND}">Keycove</strong></p>
</div>`;
}

const MILESTONES: Milestone[] = [
  {
    daysOverdueThreshold: 1,
    subject: (c) => `Rent reminder — ${c.propertyAddress}`,
    html: gentleReminder,
    ccLandlord: false,
  },
  {
    daysOverdueThreshold: 3,
    subject: (c) => `Rent ${c.daysOverdue} days past due — ${c.propertyAddress}`,
    html: firmReminder,
    ccLandlord: false,
  },
  {
    daysOverdueThreshold: 7,
    subject: (c) => `Overdue rent notice — ${c.propertyAddress}`,
    html: overdueNotice,
    ccLandlord: true,
  },
];

/**
 * Single sweep. Public so an admin endpoint can trigger it manually.
 * Returns counts of sent reminders and any errors encountered.
 */
export async function runRentReminderSweep(): Promise<{ sent: number; markedLate: number; errors: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, markedLate: 0, errors: 0 };
  const today = todayYmd();

  // Fetch all open rent payments with a past-due date. The unique index on
  // (leaseAgreementId, periodMonth) keeps this small even at scale.
  const overdue = await db
    .select()
    .from(rentPayments)
    .where(
      and(
        inArray(rentPayments.status, [...OPEN_STATUSES]),
        lt(rentPayments.dueDate, today),
      ),
    );
  if (overdue.length === 0) return { sent: 0, markedLate: 0, errors: 0 };

  let sent = 0, markedLate = 0, errors = 0;

  for (const pmt of overdue) {
    try {
      const daysOverdue = daysBetween(pmt.dueDate, today);
      if (daysOverdue < 1) continue;

      // Flip pending → late once we're past due. Cheap idempotent update.
      if (pmt.status === "pending") {
        await db.update(rentPayments)
          .set({ status: "late" })
          .where(eq(rentPayments.id, pmt.id));
        markedLate++;
      }

      // Which milestone is next? We've sent `remindersSentCount` already.
      const nextIdx = pmt.remindersSentCount ?? 0;
      if (nextIdx >= MILESTONES.length) continue; // all milestones already dispatched
      const milestone = MILESTONES[nextIdx];
      if (daysOverdue < milestone.daysOverdueThreshold) continue;

      // Hydrate landlord + lease address for the email body.
      const leaseRows = await db
        .select()
        .from(leaseAgreements)
        .where(eq(leaseAgreements.id, pmt.leaseAgreementId))
        .limit(1);
      const lease = leaseRows[0];
      if (!lease) continue;

      let landlordEmail: string | undefined;
      let landlordName: string | undefined;
      if (milestone.ccLandlord) {
        const userRows = await db
          .select()
          .from(users)
          .where(eq(users.id, pmt.landlordUserId))
          .limit(1);
        landlordEmail = userRows[0]?.email ?? undefined;
        landlordName = userRows[0]?.name ?? undefined;
      }

      const ctx: ReminderCtx = {
        tenantName: lease.tenantName,
        tenantEmail: pmt.tenantEmail,
        propertyAddress: lease.propertyAddress,
        amountCents: pmt.amountCents,
        dueDate: pmt.dueDate,
        periodMonth: pmt.periodMonth,
        daysOverdue,
        landlordEmail,
        landlordName,
      };

      const recipients: string[] = [pmt.tenantEmail];
      if (milestone.ccLandlord && landlordEmail && landlordEmail !== pmt.tenantEmail) {
        recipients.push(landlordEmail);
      }

      const ok = await sendEmail({
        to: recipients,
        subject: milestone.subject(ctx),
        html: milestone.html(ctx),
        replyTo: landlordEmail,
      });

      if (ok) {
        await db.update(rentPayments)
          .set({
            lastReminderSentAt: new Date(),
            remindersSentCount: nextIdx + 1,
          })
          .where(eq(rentPayments.id, pmt.id));
        sent++;
        console.log(`[rentReminders] payment ${pmt.id} → milestone T+${milestone.daysOverdueThreshold} sent to ${pmt.tenantEmail}`);
      }
    } catch (err) {
      console.warn(`[rentReminders] payment ${pmt.id} failed:`, err);
      errors++;
    }
  }

  return { sent, markedLate, errors };
}

let schedulerHandle: ReturnType<typeof setInterval> | null = null;

/**
 * Install the recurring reminder sweep. Idempotent — repeated calls clear
 * the prior interval so HMR doesn't leak handles in dev.
 */
export function startRentReminderScheduler(): void {
  if (schedulerHandle) clearInterval(schedulerHandle);
  // First sweep ~90s after boot so DB / email clients are warm and the
  // template-migration boot path has had time to settle.
  setTimeout(() => {
    void runRentReminderSweep().then((r) => {
      if (r.sent || r.markedLate || r.errors) {
        console.log(`[rentReminders] boot sweep: sent=${r.sent} markedLate=${r.markedLate} errors=${r.errors}`);
      }
    });
  }, 90_000);
  schedulerHandle = setInterval(() => {
    void runRentReminderSweep().then((r) => {
      if (r.sent || r.markedLate || r.errors) {
        console.log(`[rentReminders] daily sweep: sent=${r.sent} markedLate=${r.markedLate} errors=${r.errors}`);
      }
    });
  }, SCHEDULER_INTERVAL_MS);
}
