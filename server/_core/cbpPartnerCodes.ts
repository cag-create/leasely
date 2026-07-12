/**
 * CBP partner-code integration.
 *
 * Every Keycove Pro member gets a one-time-use discount code (KEYCOVE-XXXXXXXX)
 * that CBP honors at certifybusinesspro.com/website-logo-intake for a free
 * website + domain. We POST the code to CBP's partner-code endpoint so their
 * side can validate + mark it redeemed (single-use enforcement lives on CBP).
 *
 *   POST https://certifybusinesspro.com/api/partner-codes
 *   Header: x-partner-secret: <CBP_PARTNER_CODES_SECRET>
 *   Body:   { code, email, discountPercent: 100, partnerName: "Keycove" }
 *   201 = created, 200 = already exists (idempotent), non-2xx = error.
 *
 * The code is stored on the member's user_subscriptions row; syncedAt is set
 * only once CBP acks (2xx), so an un-acked code keeps retrying (e.g. before the
 * secret env var is set, or through a transient CBP 5xx). Codes are never
 * revoked on downgrade — CBP's redeemed flag handles single use.
 */
import { randomInt } from "crypto";
import {
  getUserSubscription, setCbpPartnerCode, markCbpPartnerCodeSynced,
  getSubscriptionByCbpPartnerCode, getUserById,
} from "../db";
import { sendEmail } from "./email";

const CBP_PARTNER_CODES_URL = "https://certifybusinesspro.com/api/partner-codes";
export const CBP_INTAKE_URL = "https://certifybusinesspro.com/website-logo-intake";

// No I/O/0/1 — unambiguous when read aloud or hand-typed. KEYCOVE- + 8 chars.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCbpPartnerCode(): string {
  let seg = "";
  for (let i = 0; i < 8; i++) seg += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `KEYCOVE-${seg}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type CbpPostResult = { ok: boolean; status: number; body: string; skipped?: boolean };

/** POST a code to CBP. Retries on 5xx / network errors (idempotent on CBP). */
async function postPartnerCodeToCbp(code: string, email: string): Promise<CbpPostResult> {
  const secret = process.env.CBP_PARTNER_CODES_SECRET;
  if (!secret) return { ok: false, status: 0, body: "CBP_PARTNER_CODES_SECRET unset", skipped: true };
  const payload = JSON.stringify({ code, email, discountPercent: 100, partnerName: "Keycove" });
  let last: CbpPostResult = { ok: false, status: 0, body: "no attempt" };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(CBP_PARTNER_CODES_URL, {
        method: "POST",
        headers: { "content-type": "application/json", "x-partner-secret": secret },
        body: payload,
      });
      const text = await res.text().catch(() => "");
      if (res.status >= 200 && res.status < 300) return { ok: true, status: res.status, body: text };
      last = { ok: false, status: res.status, body: text };
      if (res.status >= 500) { await sleep(500 * (attempt + 1)); continue; } // retry 5xx
      return last; // 4xx = client error, don't retry
    } catch (e: any) {
      last = { ok: false, status: 0, body: e?.message ?? String(e) };
      await sleep(500 * (attempt + 1));
    }
  }
  return last;
}

function adminEmailTarget(): string {
  return process.env.ADMIN_EMAIL
    ?? process.env.FROM_EMAIL?.match(/<([^>]+)>/)?.[1]
    ?? "chadglover10@gmail.com";
}

/** "Ping me if the CBP endpoint returns anything unexpected." */
async function alertAdmin(code: string, email: string, r: CbpPostResult): Promise<void> {
  try {
    await sendEmail({
      to: adminEmailTarget(),
      subject: `⚠️ CBP partner-code POST failed (${r.status || "network"})`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#b91c1c">CBP partner-code sync failed</h2>
        <p>Keycove could not register a Pro member's discount code with Certify Business Pro.</p>
        <table style="font-size:14px;border-collapse:collapse">
          <tr><td style="padding:4px 12px;color:#6b7280">Code</td><td style="padding:4px 12px;font-family:monospace">${code}</td></tr>
          <tr><td style="padding:4px 12px;color:#6b7280">Member</td><td style="padding:4px 12px">${email}</td></tr>
          <tr><td style="padding:4px 12px;color:#6b7280">HTTP status</td><td style="padding:4px 12px">${r.status || "network error"}</td></tr>
          <tr><td style="padding:4px 12px;color:#6b7280">Response</td><td style="padding:4px 12px;color:#b91c1c">${(r.body || "").slice(0, 300)}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px;margin-top:16px">The code is stored and will keep retrying until CBP acks it. Check POST /api/partner-codes on certifybusinesspro.com.</p>
      </div>`,
    });
  } catch (e) {
    console.warn("[cbpPartnerCodes] admin alert email failed:", e);
  }
}

export type EnsureResult = { code: string | null; synced: boolean; intakeUrl: string | null };

/**
 * Idempotently ensure a Pro member has a partner code stored AND delivered to
 * CBP. Safe to call repeatedly (on provisioning and on every portal load) —
 * generates once, then only POSTs again until CBP acks. Returns null code if
 * the user has no subscription row.
 */
export async function ensureCbpPartnerCode(userId: number, emailArg?: string | null): Promise<EnsureResult> {
  const sub = await getUserSubscription(userId);
  if (!sub) return { code: null, synced: false, intakeUrl: null };

  let code = sub.cbpPartnerCode ?? null;
  if (!code) {
    code = generateCbpPartnerCode();
    for (let i = 0; i < 5; i++) {
      if (!(await getSubscriptionByCbpPartnerCode(code))) break;
      code = generateCbpPartnerCode();
    }
    await setCbpPartnerCode(userId, code);
  }

  const intakeUrl = `${CBP_INTAKE_URL}?code=${encodeURIComponent(code)}`;

  // Already delivered to CBP — nothing more to do.
  if (sub.cbpPartnerCodeSyncedAt) return { code, synced: true, intakeUrl };

  const email = emailArg ?? (await getUserById(userId))?.email ?? null;
  if (!email) return { code, synced: false, intakeUrl };

  const r = await postPartnerCodeToCbp(code, email);
  if (r.ok) {
    await markCbpPartnerCodeSynced(userId, new Date());
    return { code, synced: true, intakeUrl };
  }
  // Secret not set yet is expected pre-config (status 0/skipped) — stay quiet.
  // A real HTTP error from CBP is unexpected → ping the admin.
  if (!r.skipped && r.status >= 400) {
    console.warn(`[cbpPartnerCodes] CBP POST failed for user ${userId} (${code}): ${r.status} ${r.body}`);
    await alertAdmin(code, email, r);
  }
  return { code, synced: false, intakeUrl };
}
