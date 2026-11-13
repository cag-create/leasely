/**
 * Native-app detection that does NOT import @capacitor/core, so the web bundle
 * stays untouched. The Capacitor native bridge injects `window.Capacitor`
 * before any page script runs inside the iOS/Android app.
 */
type CapGlobal = { isNativePlatform?: () => boolean; getPlatform?: () => string };

function cap(): CapGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapGlobal }).Capacitor;
}

export function isNativeApp(): boolean {
  return Boolean(cap()?.isNativePlatform?.());
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (!isNativeApp()) return "web";
  const p = cap()?.getPlatform?.();
  return p === "ios" || p === "android" ? p : "web";
}

export function isIosApp(): boolean {
  return nativePlatform() === "ios";
}

/**
 * Store rules: the iOS and Android apps are free companions to the web
 * subscription (App Store 3.1.3(f)). No prices, purchase buttons, or calls to
 * action to buy Pro may appear inside the apps. Use this to hide them.
 * Rent / deposit / HOA payments are real-world services and stay available.
 */
export function canSellProHere(): boolean {
  return !isNativeApp();
}

/** Routes that sell Pro. The native shell redirects away from them. */
export const PURCHASE_ROUTES = ["/pricing", "/pro", "/pro-setup"];

export const TENANT_TOKEN_KEY = "leasely_tenant_token";

export function hasTenantSession(): boolean {
  try {
    return Boolean(localStorage.getItem(TENANT_TOKEN_KEY));
  } catch {
    return false;
  }
}
