/**
 * Daily trust-compliance sweep: for every brokerage with a trust account,
 * compute the compliance checklist and, when something needs action
 * (errors/warnings), leave one in-app notification + email per day.
 */
import { and, eq, gte } from "drizzle-orm";
import { getDb, getUserById, createNotification } from "../db";
import { notifications, trustAccounts } from "../../drizzle/schema";
import { sendEmail } from "../_core/email";
import { complianceFor } from "./compliance";

const DAY_MS = 86_400_000;
let handle: ReturnType<typeof setInterval> | null = null;
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export async function runTrustComplianceSweep() {
  const db = await getDb();
  if (!db) return { notified: 0 };
  const APP_URL = process.env.APP_URL ?? process.env.VITE_APP_URL ?? "https://keycove.net";
  const pms = Array.from(new Set((await db.select({ pm: trustAccounts.pmUserId }).from(trustAccounts).where(eq(trustAccounts.status, "active"))).map((r) => r.pm)));
  let notified = 0;
  for (const pm of pms) {
    try {
      const items = (await complianceFor(pm)).filter((i) => i.severity !== "info");
      if (!items.length) continue;
      const [recent] = await db.select({ id: notifications.id }).from(notifications)
        .where(and(eq(notifications.userId, pm), eq(notifications.type, "trust_compliance"), gte(notifications.createdAt, new Date(Date.now() - 20 * 3_600_000)))).limit(1);
      if (recent) continue;
      const errors = items.filter((i) => i.severity === "error").length;
      await createNotification({
        userId: pm,
        type: "trust_compliance",
        title: `Trust accounting: ${items.length} item(s) need attention${errors ? ` (${errors} urgent)` : ""}`,
        body: items.slice(0, 3).map((i) => i.message).join(" · ").slice(0, 900),
        link: "/trust",
      });
      const user = await getUserById(pm);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: `Trust account check: ${items.length} item(s) need attention`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">Your trust account needs attention</h2>
            <ul>${items.map((i) => `<li style="margin-bottom:8px"><strong>${i.severity === "error" ? "Urgent" : "Soon"}:</strong> ${esc(i.message)}${i.rule ? ` <span style="color:#6b7280">(${esc(i.rule)})</span>` : ""}</li>`).join("")}</ul>
            <p><a href="${APP_URL}/trust" style="background:#1B2B5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Open trust accounting</a></p>
          </div>`,
        });
      }
      notified++;
    } catch (err) {
      console.warn("[trustCompliance] sweep failed for", pm, err);
    }
  }
  return { notified };
}

export function startTrustComplianceScheduler(): void {
  if (handle) clearInterval(handle);
  const run = (label: string) => void runTrustComplianceSweep()
    .then((r) => { if (r.notified) console.log(`[trustCompliance] ${label}: notified=${r.notified}`); })
    .catch((err) => console.warn("[trustCompliance] sweep failed:", err));
  setTimeout(() => run("boot sweep"), 180_000);
  handle = setInterval(() => run("daily sweep"), DAY_MS);
}
