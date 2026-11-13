import type { CapacitorConfig } from "@capacitor/cli";
import { existsSync } from "node:fs";

/**
 * Keycove native shell (iOS + Android).
 *
 * The app loads the live web app from https://keycove.net so there is ONE
 * codebase and every web deploy ships to the phones instantly. Native value
 * (push, camera, biometric unlock, deep links, offline screen) comes from the
 * Capacitor plugins wired in client/src/native/*.
 *
 * For local testing point the shell at a dev server instead:
 *   CAP_SERVER_URL=http://10.0.2.2:3000 npx cap sync android   (Android emulator)
 *   CAP_SERVER_URL=http://localhost:3000 npx cap sync ios       (iOS simulator)
 * Never ship a build made with CAP_SERVER_URL set.
 */
const serverUrl = process.env.CAP_SERVER_URL || "https://keycove.net";
const isDevServer = serverUrl.startsWith("http://");

// Android push needs Firebase config. Without it, FirebaseMessaging throws a
// native exception, so the web layer must not call register(). The flag rides
// in the user agent ("KCPush/1" = ready). Run `cap sync` from mobile/.
const androidPushReady = existsSync("android/app/google-services.json");

const config: CapacitorConfig = {
  appId: "net.keycove.app",
  appName: "Keycove",
  // Local fallback assets only (offline screen). The real UI comes from server.url.
  webDir: "www",
  appendUserAgent: "KeycoveApp/1.0",
  backgroundColor: "#0F1F4B",
  server: {
    url: serverUrl,
    cleartext: isDevServer,
    // Shown when keycove.net can't be reached (offline, DNS, 5xx on first load).
    errorPath: "offline.html",
    // Pages that stay inside the app. Anything else opens in the system browser.
    allowNavigation: [
      "keycove.net",
      "*.keycove.net",
      // Rent / deposit / HOA payments (real-world services) run on Stripe Checkout.
      "checkout.stripe.com",
      "*.stripe.com",
      "connect.stripe.com",
    ],
  },
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: "mobile",
  },
  android: {
    appendUserAgent: `KeycoveApp/1.0 KCPush/${androidPushReady ? 1 : 0}`,
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: isDevServer,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0F1F4B",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: false,
      splashImmersive: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SystemBars: {
      insetsHandling: "css",
    },
  },
};

export default config;
