/**
 * Low-level push transport: Apple APNs (HTTP/2 + ES256 token auth) and
 * Firebase Cloud Messaging HTTP v1 (service-account OAuth). No SDKs — just
 * node:http2, fetch and jose, which are already dependencies.
 *
 * Env (all optional; without them sends are logged and skipped):
 *   APNS_KEY_P8        contents of the AuthKey_XXXX.p8 file (literal "\n" ok)
 *   APNS_KEY_ID        10-char key id
 *   APNS_TEAM_ID       10-char Apple team id
 *   APNS_BUNDLE_ID     default net.keycove.app
 *   APNS_PRODUCTION    "true" for App Store / TestFlight builds (default true)
 *   FCM_SERVICE_ACCOUNT_JSON  the Firebase service-account JSON (one line)
 */
import http2 from "node:http2";
import { SignJWT, importPKCS8 } from "jose";

export type PushMessage = {
  title: string;
  body: string;
  /** In-app path to open on tap, e.g. "/work-orders". */
  url?: string;
  category?: string;
  badge?: number;
};

export type SendResult = { ok: boolean; invalidToken?: boolean; status?: number; error?: string };

function pem(raw: string): string {
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

// ─── APNs ────────────────────────────────────────────────────────────────────

let apnsJwt: { token: string; at: number } | null = null;

export function apnsConfigured(): boolean {
  return Boolean(process.env.APNS_KEY_P8 && process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID);
}

async function apnsAuthToken(): Promise<string> {
  // Apple rejects tokens older than 1h and throttles refreshes faster than 20m.
  if (apnsJwt && Date.now() - apnsJwt.at < 45 * 60 * 1000) return apnsJwt.token;
  const key = await importPKCS8(pem(process.env.APNS_KEY_P8!), "ES256");
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: process.env.APNS_KEY_ID! })
    .setIssuer(process.env.APNS_TEAM_ID!)
    .setIssuedAt()
    .sign(key);
  apnsJwt = { token, at: Date.now() };
  return token;
}

export function buildApnsPayload(msg: PushMessage) {
  return {
    aps: {
      alert: { title: msg.title, body: msg.body },
      sound: "default",
      ...(typeof msg.badge === "number" ? { badge: msg.badge } : {}),
    },
    url: msg.url ?? "/app",
    category: msg.category ?? "general",
  };
}

export async function sendApns(deviceToken: string, msg: PushMessage): Promise<SendResult> {
  if (!apnsConfigured()) return { ok: false, error: "apns-not-configured" };
  const production = (process.env.APNS_PRODUCTION ?? "true") !== "false";
  const host = production ? "https://api.push.apple.com" : "https://api.sandbox.push.apple.com";
  const topic = process.env.APNS_BUNDLE_ID || "net.keycove.app";
  const auth = await apnsAuthToken();
  const body = JSON.stringify(buildApnsPayload(msg));

  return new Promise<SendResult>((resolve) => {
    const client = http2.connect(host);
    client.on("error", (err) => resolve({ ok: false, error: String(err) }));
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${auth}`,
      "apns-topic": topic,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    });
    let status = 0;
    let data = "";
    req.on("response", (headers) => { status = Number(headers[":status"]); });
    req.setEncoding("utf8");
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      client.close();
      if (status === 200) return resolve({ ok: true, status });
      let reason = "";
      try { reason = JSON.parse(data).reason ?? ""; } catch { /* empty body */ }
      const invalidToken = status === 410 || reason === "BadDeviceToken" || reason === "Unregistered";
      resolve({ ok: false, status, invalidToken, error: reason || `apns-${status}` });
    });
    req.on("error", (err) => { client.close(); resolve({ ok: false, error: String(err) }); });
    req.setTimeout(10_000, () => { req.close(); client.close(); resolve({ ok: false, error: "apns-timeout" }); });
    req.end(body);
  });
}

// ─── FCM ─────────────────────────────────────────────────────────────────────

type ServiceAccount = { project_id: string; client_email: string; private_key: string; token_uri?: string };
let fcmAccess: { token: string; exp: number } | null = null;

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.FCM_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    return sa.project_id && sa.client_email && sa.private_key ? sa : null;
  } catch {
    console.warn("[Push] FCM_SERVICE_ACCOUNT_JSON is not valid JSON");
    return null;
  }
}

export function fcmConfigured(): boolean {
  return serviceAccount() !== null;
}

async function fcmAccessToken(sa: ServiceAccount): Promise<string> {
  if (fcmAccess && Date.now() < fcmAccess.exp - 60_000) return fcmAccess.token;
  const tokenUri = sa.token_uri || "https://oauth2.googleapis.com/token";
  const key = await importPKCS8(pem(sa.private_key), "RS256");
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setAudience(tokenUri)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!res.ok) throw new Error(`fcm-oauth-${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  fcmAccess = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

export function buildFcmMessage(deviceToken: string, msg: PushMessage) {
  return {
    message: {
      token: deviceToken,
      notification: { title: msg.title, body: msg.body },
      data: { url: msg.url ?? "/app", category: msg.category ?? "general" },
      android: {
        priority: "HIGH",
        notification: { channel_id: "keycove_default", sound: "default" },
      },
    },
  };
}

export async function sendFcm(deviceToken: string, msg: PushMessage): Promise<SendResult> {
  const sa = serviceAccount();
  if (!sa) return { ok: false, error: "fcm-not-configured" };
  try {
    const access = await fcmAccessToken(sa);
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildFcmMessage(deviceToken, msg)),
    });
    if (res.ok) return { ok: true, status: res.status };
    const text = await res.text().catch(() => "");
    const invalidToken = res.status === 404 || /UNREGISTERED|registration-token-not-registered|not a valid FCM registration token/i.test(text);
    return { ok: false, status: res.status, invalidToken, error: text.slice(0, 300) };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
