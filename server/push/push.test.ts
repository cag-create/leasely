import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { categoryForNotificationType, classifyEmailSubject, extractAppPath } from "./service";
import { buildApnsPayload, buildFcmMessage } from "./sender";
import { appleAppSiteAssociation, assetLinks } from "./wellKnown";
import { verifyTenantSessionToken } from "./router";

describe("push: email → push classifier", () => {
  it.each([
    ["Rent reminder — 12 Oak St", "rent"],
    ["Rent 3 days past due — 12 Oak St", "rent"],
    ["Overdue rent notice — 12 Oak St", "rent"],
    ["Rent payment failed — 12 Oak St", "rent"],
    ["Payment Received — Move-In Details Inside (12 Oak St)", "rent"],
    ["Update on your rental application", "applications"],
    ["New inquiry for \"2BR near downtown\"", "leads"],
    ["🔧 Maintenance Request from Sam — Leaky sink", "work_orders"],
    ["✅ Vendor Responded — Leaky sink", "work_orders"],
    ["Work Order: Leaky sink — 12 Oak St", "work_orders"],
    ["Your Lease Agreement is Ready to Sign — 12 Oak St", "leases"],
    ["Tenant Signed — Countersign to Continue (12 Oak St)", "leases"],
    ["Sign your lease — Oak Rentals", "leases"],
    ["Finish and send the lease for Sam (12 Oak St)", "leases"],
    ["🚨 EMERGENCY — Work Request: Burst pipe — 12 Oak St", "work_orders"],
    ["HOA dues due in 7 days — Pine HOA (12 Oak St)", "hoa"],
    ["HOA special assessment due 2026-12-01 — Pine HOA", "hoa"],
  ])("%s → %s", (subject, category) => {
    expect(classifyEmailSubject(subject)).toBe(category);
  });

  it.each([
    "Verify your Keycove email",
    "Reset your Keycove password",
    "Welcome to Keycove Pro — let's set up your website",
    "⚠️ Keycove automation sweep: 2 check(s) failing",
    "Still no photos on your listing — here's what Pro landlords get",
    "[Keycove] New affiliate W-9 — Jane",
  ])("stays email-only: %s", (subject) => {
    expect(classifyEmailSubject(subject)).toBeNull();
  });

  it("maps in-app notification types", () => {
    expect(categoryForNotificationType("rent_paid")).toBe("rent");
    expect(categoryForNotificationType("application_submitted")).toBe("applications");
    expect(categoryForNotificationType("lease_tenant_signed")).toBe("leases");
    expect(categoryForNotificationType("something_else")).toBe("general");
  });
});

describe("push: deep link from email body", () => {
  it("takes the first in-app keycove.net link, skipping home/legal", () => {
    const html = `<a href="https://keycove.net">Keycove</a> <a href="https://keycove.net/privacy">p</a>
      <a href="https://keycove.net/tenant/sign-lease/42?x=1">Sign</a>`;
    expect(extractAppPath(html)).toBe("/tenant/sign-lease/42?x=1");
  });
  it("accepts relative links and ignores other domains", () => {
    expect(extractAppPath(`<a href="https://evil.com/x">x</a><a href='/work-orders'>w</a>`)).toBe("/work-orders");
    expect(extractAppPath(`<a href="https://evil.com/x">x</a>`)).toBeNull();
  });
});

describe("push: transport payloads", () => {
  const msg = { title: "Rent", body: "Rent paid", url: "/leases", category: "rent" };
  it("APNs payload carries the alert and the in-app url", () => {
    expect(buildApnsPayload(msg)).toEqual({
      aps: { alert: { title: "Rent", body: "Rent paid" }, sound: "default" },
      url: "/leases",
      category: "rent",
    });
  });
  it("FCM payload targets the token and the default channel", () => {
    const m = buildFcmMessage("tok", msg).message;
    expect(m.token).toBe("tok");
    expect(m.data).toEqual({ url: "/leases", category: "rent" });
    expect(m.android.notification.channel_id).toBe("keycove_default");
  });
});

describe("push: deep-link verification files", () => {
  it("AASA lists the app id and excludes API paths", () => {
    const a = appleAppSiteAssociation("ABCDE12345");
    expect(a.applinks.details[0].appIDs).toEqual(["ABCDE12345.net.keycove.app"]);
    expect(a.applinks.details[0].components[0]).toEqual({ "/": "/api/*", exclude: true });
    expect(a.applinks.details[0].components.at(-1)).toEqual({ "/": "/*" });
  });
  it("assetlinks names the package and fingerprints", () => {
    const [entry] = assetLinks(["AA:BB"]);
    expect(entry.target.package_name).toBe("net.keycove.app");
    expect(entry.target.sha256_cert_fingerprints).toEqual(["AA:BB"]);
  });
});

describe("push: tenant session token", () => {
  function sign(payload: object, secret: string) {
    const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${p}.${createHmac("sha256", secret).update(p).digest("base64url")}`;
  }
  it("accepts a valid token and rejects tampered or expired ones", () => {
    process.env.JWT_SECRET = "test-secret";
    expect(verifyTenantSessionToken(sign({ id: 7, ts: Date.now() }, "test-secret"))).toEqual({ id: 7 });
    expect(verifyTenantSessionToken(sign({ id: 7, ts: Date.now() }, "wrong"))).toBeNull();
    expect(verifyTenantSessionToken(sign({ id: 7, ts: Date.now() - 31 * 864e5 }, "test-secret"))).toBeNull();
  });
});
