/**
 * Daily HOA dues reminder. Emails the landlord `reminderDaysBefore` days ahead
 * of each property's next due date (once per due date, tracked in
 * lastReminderForDueDate) and 7 days ahead of unpaid special assessments.
 * Same module-local setInterval pattern as server/_core/rentReminders.ts.
 */
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../db";
import { crmProperties, hoaSpecialAssessments, propertyHoas, users } from "../../drizzle/schema";
import { sendEmail } from "../_core/email";
import { daysUntil, reminderDue } from "./logic";

const DAY_MS = 86_400_000;
let handle: ReturnType<typeof setInterval> | null = null;

const money = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export async function runHoaReminderSweep(today = new Date().toISOString().slice(0, 10)) {
  const db = await getDb();
  if (!db) return { sent: 0, errors: 0 };
  const APP_URL = process.env.APP_URL ?? process.env.VITE_APP_URL ?? "https://keycove.net";
  let sent = 0, errors = 0;

  const rows = await db
    .select({ hoa: propertyHoas, address: crmProperties.address, email: users.email })
    .from(propertyHoas)
    .innerJoin(crmProperties, eq(crmProperties.id, propertyHoas.crmPropertyId))
    .innerJoin(users, eq(users.id, propertyHoas.userId));

  for (const r of rows) {
    const h = r.hoa;
    if (!r.email || !reminderDue({ today, nextDueDate: h.nextDueDate, reminderDaysBefore: h.reminderDaysBefore, lastReminderForDueDate: h.lastReminderForDueDate })) continue;
    const days = daysUntil(today, h.nextDueDate!);
    const when = days > 0 ? `in ${days} day${days === 1 ? "" : "s"}` : days === 0 ? "today" : `${-days} day${days === -1 ? "" : "s"} ago`;
    try {
      await sendEmail({
        to: r.email,
        subject: `HOA dues ${days >= 0 ? "due" : "were due"} ${when} — ${h.hoaName} (${r.address})`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2B5E;margin-top:0">HOA dues reminder</h2>
          <p><strong>${esc(h.hoaName)}</strong> dues for <strong>${esc(r.address)}</strong> are ${days >= 0 ? "due" : "past due"} ${when} (${esc(h.nextDueDate)}).</p>
          <p style="font-size:20px;font-weight:800;color:#1B2B5E">${money(h.duesAmount)}</p>
          ${h.autopay ? `<p>You marked this HOA as <strong>autopay</strong>, so no action should be needed — just confirm it posted.</p>` : ""}
          ${h.passThroughToTenant ? `<p>Your tenant reimburses these dues — remember to bill them.</p>` : ""}
          ${h.portalUrl && /^https?:\/\//i.test(h.portalUrl) ? `<p><a href="${esc(h.portalUrl)}" style="color:#4F46E5;font-weight:600">Pay on the HOA's portal →</a></p>` : ""}
          <p style="margin-top:20px"><a href="${APP_URL}/hoa" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">Mark as paid in Keycove</a></p>
          <p style="color:#9ca3af;font-size:12px;margin-top:16px">Marking it paid logs the expense in Accounting (HOA dues) and moves the due date forward.</p>
        </div>`,
      });
      await db.update(propertyHoas).set({ lastReminderForDueDate: h.nextDueDate }).where(eq(propertyHoas.id, h.id));
      sent++;
    } catch (e) {
      errors++;
      console.warn("[hoaReminders] send failed", h.id, e);
    }
  }

  // Special assessments: one reminder 7 days out (or as soon as created inside that window).
  const due = await db
    .select({ a: hoaSpecialAssessments, hoaName: propertyHoas.hoaName, address: crmProperties.address, email: users.email })
    .from(hoaSpecialAssessments)
    .innerJoin(propertyHoas, eq(propertyHoas.id, hoaSpecialAssessments.propertyHoaId))
    .innerJoin(crmProperties, eq(crmProperties.id, propertyHoas.crmPropertyId))
    .innerJoin(users, eq(users.id, hoaSpecialAssessments.userId))
    .where(and(isNull(hoaSpecialAssessments.paidAt), eq(hoaSpecialAssessments.reminderSent, 0)));
  for (const r of due) {
    const days = daysUntil(today, r.a.dueDate);
    if (!r.email || days > 7 || days < -3) continue;
    try {
      await sendEmail({
        to: r.email,
        subject: `HOA special assessment due ${r.a.dueDate} — ${r.hoaName}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2B5E;margin-top:0">Special assessment coming up</h2>
          <p><strong>${esc(r.hoaName)}</strong> (${esc(r.address)}): ${esc(r.a.description)}</p>
          <p style="font-size:20px;font-weight:800;color:#1B2B5E">${money(r.a.amount)} · due ${esc(r.a.dueDate)}</p>
          <p><a href="${APP_URL}/hoa" style="color:#4F46E5;font-weight:600">Open HOA dues in Keycove →</a></p>
        </div>`,
      });
      await db.update(hoaSpecialAssessments).set({ reminderSent: 1 }).where(eq(hoaSpecialAssessments.id, r.a.id));
      sent++;
    } catch (e) {
      errors++;
      console.warn("[hoaReminders] assessment send failed", r.a.id, e);
    }
  }
  return { sent, errors };
}

export function startHoaReminderScheduler(): void {
  if (handle) clearInterval(handle);
  const run = (label: string) => void runHoaReminderSweep()
    .then(r => { if (r.sent || r.errors) console.log(`[hoaReminders] ${label}: sent=${r.sent} errors=${r.errors}`); })
    .catch(err => console.warn("[hoaReminders] sweep failed:", err));
  setTimeout(() => run("boot sweep"), 120_000);
  handle = setInterval(() => run("daily sweep"), DAY_MS);
}
