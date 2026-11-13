/**
 * Push notifications (APNs on iOS, FCM on Android) via @capacitor/push-notifications.
 * The server side lives in server/push/*; this file only obtains the device
 * token, hands it to the caller, and routes taps to the right screen.
 */
import { PushNotifications, type PushNotificationSchema, type ActionPerformed } from "@capacitor/push-notifications";
import { Preferences } from "@capacitor/preferences";

const TOKEN_KEY = "kc_push_token";

export type PushPermission = "granted" | "denied" | "prompt";

export async function pushPermission(): Promise<PushPermission> {
  const { receive } = await PushNotifications.checkPermissions();
  return receive === "granted" ? "granted" : receive === "denied" ? "denied" : "prompt";
}

export async function storedPushToken(): Promise<string | null> {
  return (await Preferences.get({ key: TOKEN_KEY })).value;
}

type Handlers = {
  onToken: (token: string) => void;
  onForeground: (n: PushNotificationSchema) => void;
  onOpen: (path: string) => void;
};

let listening = false;

/** Attach listeners once per app launch. Safe to call repeatedly. */
export async function listenForPush(h: Handlers): Promise<void> {
  if (listening) return;
  listening = true;
  await PushNotifications.addListener("registration", async ({ value }) => {
    await Preferences.set({ key: TOKEN_KEY, value });
    h.onToken(value);
  });
  await PushNotifications.addListener("registrationError", (err) => {
    console.warn("[Push] registration failed", err);
  });
  await PushNotifications.addListener("pushNotificationReceived", (n) => h.onForeground(n));
  await PushNotifications.addListener("pushNotificationActionPerformed", (a: ActionPerformed) => {
    const path = pathFromNotification(a.notification);
    if (path) h.onOpen(path);
  });
}

export function pathFromNotification(n: PushNotificationSchema): string | null {
  const data = (n.data ?? {}) as Record<string, unknown>;
  const raw = typeof data.url === "string" ? data.url : null;
  if (!raw) return null;
  return toAppPath(raw);
}

/** Only allow in-app paths (or keycove.net URLs) so a payload can't send the app elsewhere. */
export function toAppPath(raw: string): string | null {
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const u = new URL(raw);
    if (u.protocol === "keycove:") {
      return `/${u.host}${u.pathname === "/" ? "" : u.pathname}${u.search}${u.hash}`.replace(/\/{2,}/g, "/");
    }
    if (/(^|\.)keycove\.net$/i.test(u.hostname)) return `${u.pathname}${u.search}${u.hash}` || "/app";
  } catch { /* not a URL */ }
  return null;
}

/** Android builds without google-services.json can't use FCM (see capacitor.config.ts). */
export function pushSupported(platform: "ios" | "android"): boolean {
  if (platform === "ios") return true;
  return !/KCPush\/0/.test(navigator.userAgent);
}

/**
 * Ask for permission (shows the OS prompt the first time) and register.
 * Returns the resulting permission.
 */
export async function enablePush(platform: "ios" | "android"): Promise<PushPermission> {
  let perm = await pushPermission();
  if (perm === "prompt") {
    const r = await PushNotifications.requestPermissions();
    perm = r.receive === "granted" ? "granted" : "denied";
  }
  if (perm !== "granted" || !pushSupported(platform)) return perm;
  if (platform === "android") {
    await PushNotifications.createChannel({
      id: "keycove_default",
      name: "Keycove alerts",
      description: "Rent, applications, work orders, leases and HOA dues",
      importance: 4,
      visibility: 1,
      sound: "default",
    }).catch(() => {});
  }
  await PushNotifications.register();
  return perm;
}

export async function forgetPushToken(): Promise<void> {
  await Preferences.remove({ key: TOKEN_KEY });
  await PushNotifications.removeAllDeliveredNotifications().catch(() => {});
}
