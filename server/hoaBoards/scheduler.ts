/**
 * Daily Keycove HOA sweep: create due assessment charges, add capped late
 * fees, run autopay, email reminders, and warn boards before their trial
 * ends. Same setInterval pattern as server/hoa/reminders.ts.
 */
import { eq } from "drizzle-orm";
import { hoaAssociations, users } from "../../drizzle/schema";
import { sendEmail } from "../_core/email";
import { assessLateFees, chargeAutopay, emailShell, esc, generateRecurringCharges, hoaDb, refreshPlanState, sendReminders, todayYmd } from "./ledger";
import { APP_URL } from "./stripe";

const DAY_MS = 86_400_000;
let handle: ReturnType<typeof setInterval> | null = null;

export async function runHoaBoardSweep(today = todayYmd()) {
  const d = await hoaDb();
  const out = { associations: 0, charges: 0, lateFees: 0, autopay: 0, autopayFailed: 0, reminders: 0, errors: 0 };
  const rows = await d.select().from(hoaAssociations);
  for (const row of rows) {
    out.associations++;
    try {
      const a = await refreshPlanState(row);
      out.charges += await generateRecurringCharges(a, today);
      out.lateFees += await assessLateFees(a, today);
      const ap = await chargeAutopay(a, today);
      out.autopay += ap.succeeded;
      out.autopayFailed += ap.failed;
      out.reminders += await sendReminders(a, today);
      await trialEndingNotice(a);
    } catch (e) {
      out.errors++;
      console.warn(`[hoaBoards] sweep failed for association ${row.id}:`, e);
    }
  }
  return out;
}

async function trialEndingNotice(a: typeof hoaAssociations.$inferSelect) {
  if (a.planStatus !== "trialing" || a.stripeSubscriptionId || !a.trialEndsAt) return;
  const daysLeft = Math.ceil((a.trialEndsAt.getTime() - Date.now()) / DAY_MS);
  if (daysLeft !== 3) return;
  const d = await hoaDb();
  const [u] = await d.select({ email: users.email }).from(users).where(eq(users.id, a.ownerUserId));
  const to = a.contactEmail ?? u?.email;
  if (!to) return;
  await sendEmail({
    to,
    subject: `Your Keycove HOA trial ends in 3 days — ${a.name}`,
    html: emailShell(a, "Your free trial ends in 3 days", `
      <p>Choose a plan to keep billing homeowners and running autopay after ${esc(a.trialEndsAt.toISOString().slice(0, 10))}. Yearly billing saves 15%.</p>
      <p style="margin-top:20px"><a href="${APP_URL()}/hoa-board?tab=plan" style="background:#1B2B5E;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700">Choose a plan</a></p>`),
  }).catch(() => {});
}

export function startHoaBoardScheduler(): void {
  if (handle) clearInterval(handle);
  const run = (label: string) => void runHoaBoardSweep()
    .then(r => console.log(`[hoaBoards] ${label}: ${JSON.stringify(r)}`))
    .catch(err => console.warn("[hoaBoards] sweep failed:", err));
  setTimeout(() => run("boot sweep"), 150_000);
  handle = setInterval(() => run("daily sweep"), DAY_MS);
}
