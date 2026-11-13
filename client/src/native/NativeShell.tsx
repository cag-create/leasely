/**
 * NativeShell — mounted once by App.tsx, ONLY inside the iOS/Android app
 * (lazy-loaded, so the web bundle never pulls Capacitor plugins).
 *
 * Responsibilities:
 *  - push: permission, token registration, foreground toasts, tap → screen
 *  - deep links: keycove.net Universal/App Links and keycove:// → in-app route
 *  - biometric unlock overlay (Face ID / fingerprint), on launch and resume
 *  - offline banner, Android back button, status bar
 *  - role-aware bottom tab bar (landlord / property manager, tenant, renter)
 *  - store rules: no Pro purchase screens or links inside the apps
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { App as CapApp } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import {
  Home, Wrench, ClipboardList, FileSignature, Menu, Search, Heart, Fingerprint, WifiOff,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { LOGO_URL } from "@/lib/brand";
import { PURCHASE_ROUTES, TENANT_TOKEN_KEY, hasTenantSession, nativePlatform } from "./platform";
import { enablePush, forgetPushToken, listenForPush, pathFromNotification, pushPermission, storedPushToken, toAppPath } from "./push";
import { LOCK_AFTER_MS, authenticate, biometricLockEnabled, biometryInfo } from "./appLock";

type Tab = { path: string; label: string; icon: typeof Home; match: string[] };

const LANDLORD_TABS: Tab[] = [
  { path: "/dashboard", label: "Home", icon: Home, match: ["/dashboard", "/crm", "/accounting", "/payouts", "/my-listings", "/hoa"] },
  { path: "/work-orders", label: "Work orders", icon: Wrench, match: ["/work-orders"] },
  { path: "/applications", label: "Applicants", icon: ClipboardList, match: ["/applications"] },
  { path: "/leases", label: "Leases", icon: FileSignature, match: ["/leases"] },
  { path: "/app/settings", label: "More", icon: Menu, match: ["/app/settings"] },
];
const TENANT_TABS: Tab[] = [
  { path: "/tenant/dashboard", label: "Home", icon: Home, match: ["/tenant/dashboard"] },
  { path: "/app/settings", label: "Settings", icon: Menu, match: ["/app/settings"] },
];
const RENTER_TABS: Tab[] = [
  { path: "/marketplace", label: "Search", icon: Search, match: ["/marketplace", "/listing"] },
  { path: "/saved", label: "Saved", icon: Heart, match: ["/saved"] },
  { path: "/app/settings", label: "Settings", icon: Menu, match: ["/app/settings"] },
];

const SHELL_CSS = `
  /* Store rules: no Pro purchase entry points inside the apps. */
  a[href="/pricing"], a[href="/pro"], a[href^="/pro-setup"], a[href^="/pricing?"] { display: none !important; }
  html.kc-native { -webkit-tap-highlight-color: transparent; }
  html.kc-native body { overscroll-behavior-y: none; }
  html.kc-native body.kc-has-tabbar { padding-bottom: calc(64px + max(env(safe-area-inset-bottom), var(--safe-area-inset-bottom, 0px))); }
  .kc-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; display: flex;
    background: rgba(255,255,255,.97); border-top: 1px solid rgba(15,31,75,.10);
    padding-bottom: max(env(safe-area-inset-bottom), var(--safe-area-inset-bottom, 0px));
    backdrop-filter: saturate(180%) blur(12px); -webkit-backdrop-filter: saturate(180%) blur(12px); }
  .kc-tabbar button { flex: 1; height: 56px; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 3px; font-size: 10.5px; font-weight: 600; color: #64748B; background: none; border: 0; }
  .kc-tabbar button[aria-current="page"] { color: #4F46E5; }
  .kc-offline { position: fixed; left: 12px; right: 12px; z-index: 70;
    top: calc(8px + max(env(safe-area-inset-top), var(--safe-area-inset-top, 0px)));
    background: #0F1F4B; color: #fff; border-radius: 12px; padding: 10px 14px; font-size: 13px;
    display: flex; gap: 8px; align-items: center; box-shadow: 0 8px 24px rgba(15,31,75,.25); }
  .kc-lock { position: fixed; inset: 0; z-index: 100; background: #0F1F4B; color: #fff; display: flex;
    flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 24px; text-align: center; }
  .kc-lock button { background: #4F46E5; color: #fff; border: 0; border-radius: 12px; padding: 14px 24px;
    font-size: 16px; font-weight: 600; display: inline-flex; gap: 8px; align-items: center; }
`;

function matches(location: string, tab: Tab) {
  return tab.match.some((m) => location === m || location.startsWith(`${m}/`));
}

export default function NativeShell() {
  const platform = nativePlatform() as "ios" | "android";
  const [location, navigate] = useLocation();
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const registerDevice = trpc.push.register.useMutation();
  const unregisterDevice = trpc.push.unregister.useMutation();

  const [tenant, setTenant] = useState(hasTenantSession());
  const [offline, setOffline] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockLabel, setLockLabel] = useState("Face ID");
  const backgroundedAt = useRef<number | null>(null);
  const wasSignedIn = useRef(false);
  const pushAsked = useRef(false);

  const signedIn = Boolean(user) || tenant;
  const go = useCallback((path: string) => navigate(path), [navigate]);

  // ── one-time setup ────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.add("kc-native", `kc-${platform}`);
    const style = document.createElement("style");
    style.id = "kc-native-shell";
    style.textContent = SHELL_CSS;
    document.head.appendChild(style);

    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

    const subs: Array<Promise<{ remove: () => Promise<void> }>> = [];
    subs.push(CapApp.addListener("appUrlOpen", ({ url }) => {
      const path = toAppPath(url);
      if (path) go(path);
    }));
    subs.push(CapApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else CapApp.minimizeApp().catch(() => {});
    }));
    subs.push(Network.addListener("networkStatusChange", (s) => {
      setOffline(!s.connected);
      if (s.connected) void utils.invalidate();
    }));
    Network.getStatus().then((s) => setOffline(!s.connected)).catch(() => {});

    void listenForPush({
      onToken: (token) => sendToken(token),
      onForeground: (n) => {
        const path = pathFromNotification(n);
        toast(n.title ?? "Keycove", {
          description: n.body,
          action: path ? { label: "Open", onClick: () => go(path) } : undefined,
        });
        void utils.notifications.list.invalidate().catch(() => {});
      },
      onOpen: (path) => go(path),
    });

    return () => {
      style.remove();
      subs.forEach((p) => p.then((s) => s.remove()).catch(() => {}));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── push token → server ───────────────────────────────────────────────────
  const sendToken = useCallback((token: string) => {
    const tenantSessionToken = localStorage.getItem(TENANT_TOKEN_KEY) ?? undefined;
    registerDevice.mutate({ token, platform, appVersion: "1.0.0", tenantSessionToken });
  }, [platform, registerDevice]);

  // Re-check tenant session when the route changes (tenant login stores a token then navigates).
  useEffect(() => { setTenant(hasTenantSession()); }, [location]);

  // Ask for notification permission once someone is signed in.
  useEffect(() => {
    if (loading || !signedIn || pushAsked.current) return;
    pushAsked.current = true;
    (async () => {
      const perm = await pushPermission().catch(() => "denied" as const);
      if (perm === "denied") return;
      await enablePush(platform).catch((e) => console.warn("[Push] enable failed", e));
      // Re-link an existing token to whoever is signed in now.
      const existing = await storedPushToken();
      if (existing) sendToken(existing);
    })();
  }, [loading, signedIn, platform, sendToken]);

  // Sign-out: detach this phone from the account.
  useEffect(() => {
    if (loading) return;
    if (signedIn) { wasSignedIn.current = true; return; }
    if (!wasSignedIn.current) return;
    wasSignedIn.current = false;
    pushAsked.current = false;
    (async () => {
      const token = await storedPushToken();
      if (token) unregisterDevice.mutate({ token });
      await forgetPushToken();
    })();
  }, [loading, signedIn, unregisterDevice]);

  // ── biometric lock ────────────────────────────────────────────────────────
  const tryUnlock = useCallback(async () => {
    if (await authenticate("Unlock Keycove")) setLocked(false);
  }, []);

  const lockIfEnabled = useCallback(async () => {
    if (!signedIn || !(await biometricLockEnabled())) return;
    const info = await biometryInfo();
    if (!info.available) return;
    setLockLabel(info.label);
    setLocked(true);
    void tryUnlock();
  }, [signedIn, tryUnlock]);

  const lockChecked = useRef(false);
  useEffect(() => {
    if (loading || lockChecked.current) return;
    lockChecked.current = true;
    void lockIfEnabled();
  }, [loading, lockIfEnabled]);

  useEffect(() => {
    const sub = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) { backgroundedAt.current = Date.now(); return; }
      const away = backgroundedAt.current ? Date.now() - backgroundedAt.current : 0;
      backgroundedAt.current = null;
      void utils.auth.me.invalidate();
      if (away > LOCK_AFTER_MS) void lockIfEnabled();
    });
    return () => { sub.then((s) => s.remove()).catch(() => {}); };
  }, [lockIfEnabled, utils]);

  // ── store rules + app entry: skip marketing / purchase pages ───────────────
  useEffect(() => {
    const path = location.split("?")[0];
    if (path === "/" || PURCHASE_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))) {
      navigate("/app", { replace: true });
    }
  }, [location, navigate]);

  // ── tab bar ───────────────────────────────────────────────────────────────
  const tabs = useMemo<Tab[] | null>(() => {
    if (user) return (user as { accountType?: string }).accountType === "renter" ? RENTER_TABS : LANDLORD_TABS;
    if (tenant) return TENANT_TABS;
    return null;
  }, [user, tenant]);
  const showTabs = Boolean(tabs && tabs.some((t) => matches(location, t)));

  useEffect(() => {
    document.body.classList.toggle("kc-has-tabbar", showTabs);
  }, [showTabs]);

  return (
    <>
      {offline && (
        <div className="kc-offline" role="status">
          <WifiOff className="h-4 w-4 shrink-0" />
          You're offline. We'll refresh when you reconnect.
        </div>
      )}

      {showTabs && tabs && (
        <nav className="kc-tabbar" aria-label="Main">
          {tabs.map((t) => {
            const active = matches(location, t);
            return (
              <button
                key={t.path}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
                  if (!active || location !== t.path) go(t.path);
                }}
              >
                <t.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
                {t.label}
              </button>
            );
          })}
        </nav>
      )}

      {locked && (
        <div className="kc-lock">
          <img src={LOGO_URL} alt="Keycove" style={{ width: 160, filter: "brightness(0) invert(1)" }} />
          <p style={{ color: "#C7D2FE", margin: 0 }}>Keycove is locked</p>
          <button type="button" onClick={() => void tryUnlock()}>
            <Fingerprint className="h-5 w-5" /> Unlock with {lockLabel}
          </button>
        </div>
      )}
    </>
  );
}
