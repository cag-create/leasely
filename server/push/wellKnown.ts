/**
 * Deep-link verification files so https://keycove.net/... links open the
 * Keycove app when it's installed (iOS Universal Links, Android App Links).
 *
 * Env:
 *   APPLE_TEAM_ID (or APNS_TEAM_ID)      10-char Apple Developer team id
 *   ANDROID_SHA256_CERT_FINGERPRINTS     comma-separated SHA-256 fingerprints
 *       (Play Console → Test and release → App integrity → App signing key,
 *        plus your upload/debug key if you want those builds verified too)
 */
import type { Express } from "express";

export const MOBILE_APP_ID = "net.keycove.app";

// Paths that should stay in the browser even when the app is installed.
const EXCLUDED = ["/api/*", "/uploads/*", "/.well-known/*", "/legal/*"];

export function appleAppSiteAssociation(teamId: string) {
  const appID = `${teamId}.${MOBILE_APP_ID}`;
  return {
    applinks: {
      details: [
        {
          appIDs: [appID],
          components: [
            ...EXCLUDED.map((p) => ({ "/": p, exclude: true })),
            { "/": "/*" },
          ],
        },
      ],
    },
    webcredentials: { apps: [appID] },
  };
}

export function assetLinks(fingerprints: string[]) {
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls", "delegate_permission/common.get_login_creds"],
      target: { namespace: "android_app", package_name: MOBILE_APP_ID, sha256_cert_fingerprints: fingerprints },
    },
  ];
}

export function registerAppLinkRoutes(app: Express) {
  app.get(["/.well-known/apple-app-site-association", "/apple-app-site-association"], (_req, res) => {
    const teamId = (process.env.APPLE_TEAM_ID || process.env.APNS_TEAM_ID || "").trim();
    if (!teamId) return res.status(404).json({ error: "APPLE_TEAM_ID not configured" });
    res.type("application/json").set("Cache-Control", "public, max-age=3600").send(JSON.stringify(appleAppSiteAssociation(teamId)));
  });
  app.get("/.well-known/assetlinks.json", (_req, res) => {
    const fps = (process.env.ANDROID_SHA256_CERT_FINGERPRINTS || "")
      .split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (!fps.length) return res.status(404).json({ error: "ANDROID_SHA256_CERT_FINGERPRINTS not configured" });
    res.type("application/json").set("Cache-Control", "public, max-age=3600").send(JSON.stringify(assetLinks(fps)));
  });
}
