/**
 * Push notification fan-out for the Keycove iOS/Android apps.
 *
 * Two hooks feed this module, so existing features get phone notifications
 * without touching each call site:
 *   1. mirrorNotificationToPush — every in-app notification (createNotification)
 *      is also pushed to that user's devices (rent paid / failed, lease signed…).
 *   2. mirrorEmailToPush — transactional emails whose subject matches an
 *      allowlist (rent due/paid, applications, work orders, leases, HOA dues)
 *      are pushed to devices registered with the recipient's email.
 * New code can call notifyUser / notifyEmails directly.
 */
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { pushDevices, type PushDevice } from "../../drizzle/schema";
import { apnsConfigured, fcmConfigured, sendApns, sendFcm, type PushMessage, type SendResult } from "./sender";

export type { PushMessage } from "./sender";

export type PushCategory = "rent" | "applications" | "work_orders" | "leases" | "hoa" | "leads" | "general";

const CATEGORY_TITLE: Record<PushCategory, string> = {
  rent: "Rent",
  applications: "Applications",
  work_orders: "Work order",
  leases: "Lease",
  hoa: "HOA dues",
  leads: "New lead",
  general: "Keycove",
};

const CATEGORY_PATH: Record<PushCategory, string> = {
  rent: "/app",
  applications: "/applications",
  work_orders: "/work-orders",
  leases: "/leases",
  hoa: "/hoa",
  leads: "/dashboard",
  general: "/app",
};

// Ordered: first match wins. Only these emails ever reach a phone, so password
// resets, marketing drips, admin alerts etc. stay email-only.
const EMAIL_RULES: Array<{ re: RegExp; category: PushCategory }> = [
  { re: /^HOA (dues|special assessment)/i, category: "hoa" },
  { re: /rent (reminder|payment failed|\d+ days past due)|overdue rent notice|pay your rent online/i, category: "rent" },
  { re: /payment (received|confirmed)|autopay live/i, category: "rent" },
  { re: /rental application|lease auto-sent|attach a lease for/i, category: "applications" },
  { re: /^new inquiry for/i, category: "leads" },
  { re: /work order:|work request:|maintenance request|vendor (responded|declined|paid)|inspection complete|work complete/i, category: "work_orders" },
  { re: /lease (agreement|signed|countersigned|fully executed)|sign your lease|finish and send the lease|tenant signed|countersign|tenant portal is ready|pay to (activate|move in)/i, category: "leases" },
];

export function classifyEmailSubject(subject: string): PushCategory | null {
  for (const rule of EMAIL_RULES) if (rule.re.test(subject)) return rule.category;
  return null;
}

const NOTIFICATION_TYPE_CATEGORY: Array<{ re: RegExp; category: PushCategory }> = [
  { re: /^rent|autopay|payment/i, category: "rent" },
  { re: /application/i, category: "applications" },
  { re: /work_?order|maintenance|vendor/i, category: "work_orders" },
  { re: /lease|sign/i, category: "leases" },
  { re: /hoa/i, category: "hoa" },
];

export function categoryForNotificationType(type: string): PushCategory {
  for (const r of NOTIFICATION_TYPE_CATEGORY) if (r.re.test(type)) return r.category;
  return "general";
}

/** First in-app keycove.net link in an email body, as a path ("/tenant/sign-lease/12"). */
export function extractAppPath(html: string): string | null {
  const re = /href=["'](?:https?:\/\/(?:www\.)?keycove\.net)?(\/[^"'#\s]*)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const path = m[1];
    if (path === "/" || /^\/(legal|privacy|terms|unsubscribe|uploads)\b/.test(path)) continue;
    return path.slice(0, 500);
  }
  return null;
}

/** Strip a leading emoji/marker so the lock-screen text reads cleanly. */
function cleanSubject(subject: string): string {
  return subject.replace(/^[^A-Za-z0-9[]+/, "").replace(/^\[Keycove\]\s*/i, "").trim().slice(0, 180);
}

// ─── Dedup ───────────────────────────────────────────────────────────────────
// One event often produces an email AND an in-app notification for the same
// person. Collapse same-category pushes to a device within 90 seconds.
const recent = new Map<string, number>();
const DEDUP_MS = 90_000;
function seenRecently(key: string): boolean {
  const now = Date.now();
  if (recent.size > 5000) {
    recent.forEach((t, k) => { if (now - t > DEDUP_MS) recent.delete(k); });
  }
  const last = recent.get(key);
  recent.set(key, now);
  return last !== undefined && now - last < DEDUP_MS;
}

export function pushConfigured() {
  return { apns: apnsConfigured(), fcm: fcmConfigured() };
}

async function deliver(devices: PushDevice[], msg: PushMessage): Promise<number> {
  const db = await getDb();
  let delivered = 0;
  for (const d of devices) {
    if (seenRecently(`${d.id}:${msg.category ?? "general"}`)) continue;
    let r: SendResult;
    try {
      r = d.platform === "ios" ? await sendApns(d.token, msg) : await sendFcm(d.token, msg);
    } catch (err) {
      r = { ok: false, error: String(err) };
    }
    if (r.ok) {
      delivered++;
    } else if (r.invalidToken && db) {
      await db.update(pushDevices).set({ enabled: 0 }).where(eq(pushDevices.id, d.id)).catch(() => {});
    } else if (r.error && !r.error.endsWith("not-configured")) {
      console.warn(`[Push] ${d.platform} send failed for device ${d.id}: ${r.error}`);
    }
  }
  return delivered;
}

export async function notifyUser(userId: number, msg: PushMessage): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const devices = await db.select().from(pushDevices)
    .where(and(eq(pushDevices.userId, userId), eq(pushDevices.enabled, 1)));
  return devices.length ? deliver(devices, msg) : 0;
}

export async function notifyEmails(emails: string[], msg: PushMessage): Promise<number> {
  const list = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)));
  if (!list.length) return 0;
  const db = await getDb();
  if (!db) return 0;
  const devices = await db.select().from(pushDevices)
    .where(and(inArray(pushDevices.email, list), eq(pushDevices.enabled, 1)));
  return devices.length ? deliver(devices, msg) : 0;
}

/** Hook called from sendEmail. Never throws; never blocks the email. */
export function mirrorEmailToPush(payload: { to: string | string[]; subject: string; html: string }): void {
  const category = classifyEmailSubject(payload.subject);
  if (!category) return;
  const to = Array.isArray(payload.to) ? payload.to : [payload.to];
  const msg: PushMessage = {
    title: CATEGORY_TITLE[category],
    body: cleanSubject(payload.subject),
    url: extractAppPath(payload.html) ?? CATEGORY_PATH[category],
    category,
  };
  void notifyEmails(to, msg).catch((err) => console.warn("[Push] email mirror failed:", err));
}

/** Hook called from createNotification. Never throws. */
export function mirrorNotificationToPush(n: { userId: number; type: string; title: string; body?: string | null; link?: string | null }): void {
  const category = categoryForNotificationType(n.type);
  const msg: PushMessage = {
    title: n.title.slice(0, 120),
    body: (n.body ?? CATEGORY_TITLE[category]).slice(0, 180),
    url: n.link && n.link.startsWith("/") ? n.link : CATEGORY_PATH[category],
    category,
  };
  void notifyUser(n.userId, msg).catch((err) => console.warn("[Push] notification mirror failed:", err));
}
