import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { registerAuthRoutes } from "./auth";
import { registerChatRoutes } from "./chat";
import { registerStripeWebhook } from "../stripeWebhook";
import { registerCbpStripeWebhook } from "../cbpStripeWebhook";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getProCodeByCode, redeemProCode, getProCodeWithBrief } from "../db";

// Uploads directory — persistent Railway volume in production, local in dev
const UPLOAD_DIR = process.env.NODE_ENV === "production"
  ? "/data/uploads"
  : path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Rate limiter: max 10 login/register attempts per IP per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter: 300 requests per IP per minute (covers tRPC + chat + misc)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for AI chat endpoint: 30 requests per IP per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Chat rate limit reached. Try again shortly." },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  app.set("trust proxy", 1); // Required for Railway reverse proxy (HTTPS detection, real IP)
  // Security headers
  app.use(helmet({ contentSecurityPolicy: false })); // CSP disabled to allow inline scripts from Vite/React
  const server = createServer(app);
  // Stripe webhook MUST be registered before express.json() for raw body signature verification
  registerStripeWebhook(app);
  registerCbpStripeWebhook(app);
  // Configure body parser — 10mb for normal requests, larger handled by specific routes
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  // Email/password auth routes (rate-limited)
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/reset-password", authLimiter);
  app.use("/api/auth/verify-email", authLimiter);
  app.use("/api/auth/resend-verification", authLimiter);
  app.use("/api/auth/claim-admin", authLimiter);
  registerAuthRoutes(app);
  // Chat API with streaming and tool calling (stricter limit)
  app.use("/api/chat", chatLimiter);
  registerChatRoutes(app);
  // Serve uploaded files
  app.use("/uploads", express.static(UPLOAD_DIR));

  // Photo upload endpoint — accepts base64 data URL, writes to disk, returns public URL
  const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
  app.post("/api/upload", uploadLimiter, (req, res) => {
    try {
      const { dataUrl, filename } = req.body as { dataUrl?: string; filename?: string };
      if (!dataUrl || typeof dataUrl !== "string") {
        return res.status(400).json({ error: "Missing dataUrl" });
      }
      const match = dataUrl.match(/^data:([a-zA-Z0-9+/]+\/[a-zA-Z0-9+/]+);base64,(.+)$/);
      if (!match) return res.status(400).json({ error: "Invalid data URL" });
      const mimeType = match[1];
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(mimeType)) return res.status(400).json({ error: "Unsupported image type" });
      const ext = mimeType.split("/")[1].replace("jpeg", "jpg");
      const safeName = (filename ?? "photo").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeName}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, unique);
      fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));
      const APP_URL = process.env.APP_URL ?? process.env.VITE_APP_URL ?? "";
      return res.json({ url: `${APP_URL}/uploads/${unique}` });
    } catch (err) {
      console.error("[Upload]", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  // Lease document upload — accepts PDF / DOC / DOCX up to 25mb. Separate route
  // from /api/upload so we can use a larger body limit without affecting the
  // photo endpoint, and so the MIME allowlist is explicit per use case.
  const leaseUploadJson = express.json({ limit: "30mb" });
  const leaseUploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
  app.post("/api/upload-lease", leaseUploadLimiter, leaseUploadJson, (req, res) => {
    try {
      const { dataUrl, filename } = req.body as { dataUrl?: string; filename?: string };
      if (!dataUrl || typeof dataUrl !== "string") return res.status(400).json({ error: "Missing dataUrl" });
      const match = dataUrl.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
      if (!match) return res.status(400).json({ error: "Invalid data URL" });
      const mimeType = match[1].toLowerCase();
      const allowed: Record<string, string> = {
        "application/pdf": "pdf",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      };
      const ext = allowed[mimeType];
      if (!ext) return res.status(400).json({ error: "Only PDF, DOC, or DOCX files are accepted" });
      // Approximate decoded size: base64 is ~4/3 the binary size.
      const approxBytes = Math.floor((match[2].length * 3) / 4);
      if (approxBytes > 25 * 1024 * 1024) return res.status(413).json({ error: "File exceeds 25 MB limit" });
      const safeName = (filename ?? "lease").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60);
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeName}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, unique);
      fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));
      const APP_URL = process.env.APP_URL ?? process.env.VITE_APP_URL ?? "";
      return res.json({ url: `${APP_URL}/uploads/${unique}`, filename: filename ?? `${safeName}.${ext}`, mimeType });
    } catch (err) {
      console.error("[UploadLease]", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  // CBP (Certify Business Pro) code validation API — secured by CBP_API_SECRET header
  app.get("/api/pro-codes/validate", async (req, res) => {
    const secret = process.env.CBP_API_SECRET;
    if (secret && req.headers["x-cbp-secret"] !== secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const code = (req.query.code as string)?.toUpperCase();
    if (!code) return res.status(400).json({ error: "Missing code" });
    const row = await getProCodeWithBrief(code);
    if (!row) return res.status(404).json({ valid: false, error: "Code not found" });
    return res.json({
      valid: row.status === "unused",
      status: row.status,
      redeemedAt: row.redeemedAt ?? null,
      // Customer info + brand brief — so CBP team can build website/logo without re-asking
      customer: {
        name: row.name,
        email: row.email,
        brandName: row.brandName,
        brandColor: row.brandColor,
        portalSubdomain: row.portalSubdomain,
        customDomain: row.customDomain,
      },
      brief: row.brief,
    });
  });

  app.post("/api/pro-codes/redeem", express.json(), async (req, res) => {
    const secret = process.env.CBP_API_SECRET;
    if (secret && req.headers["x-cbp-secret"] !== secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { code } = req.body as { code?: string };
    if (!code) return res.status(400).json({ error: "Missing code" });
    const result = await redeemProCode(code);
    return res.status(result.success ? 200 : 400).json(result);
  });

  // ── PUBLIC LEAD CAPTURE — CBP-built landing pages POST contact-form leads here ──
  // CORS-enabled so external custom domains (atlanta-rentals.com, etc.) can submit.
  // Looks up the landlord by their portalSubdomain or customDomain, emails them
  // the lead, and creates an inquiry tied to their first active listing so it
  // flows into Leasely's existing inquiry inbox.
  const leadLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
  app.post("/api/portal-leads", leadLimiter, async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    try {
      const { subdomain, customDomain, name, email, phone, message } = req.body as {
        subdomain?: string; customDomain?: string;
        name?: string; email?: string; phone?: string; message?: string;
      };
      if (!name || !email || !message) {
        return res.status(400).json({ error: "name, email, message are required" });
      }
      if (!subdomain && !customDomain) {
        return res.status(400).json({ error: "subdomain or customDomain is required" });
      }
      const { getPortalBySubdomain, getPortalByCustomDomain, createInquiry, getUserById } = await import("../db");
      const portal = subdomain
        ? await getPortalBySubdomain(subdomain)
        : await getPortalByCustomDomain(customDomain!);
      if (!portal) return res.status(404).json({ error: "Portal not found" });

      // Tie lead to their first active listing (so it shows up in inquiry inbox)
      // If they have no listings yet, just email the landlord directly.
      const firstListing = (portal.listings as any[])[0];
      if (firstListing) {
        await createInquiry({
          listingId: firstListing.id,
          senderName: name,
          senderEmail: email,
          senderPhone: phone ?? null,
          message: `[Lead from ${customDomain ?? subdomain}] ${message}`,
          moveInDate: null,
        });
      }

      // Email the landlord
      const owner = await getUserById((portal as any).userId);
      if (owner?.email) {
        const { sendEmail } = await import("./email");
        sendEmail({
          to: owner.email,
          subject: `[Leasely] New lead from your branded site — ${name}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1B2B5E">New Lead from ${customDomain ?? `${subdomain}.leasely.net`}</h2>
            <p><strong>${name}</strong> just submitted a contact form on your branded site:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
              ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ""}
            </ul>
            <p style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px">${message}</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:16px">Reply directly to this email to contact the lead. Lead also saved in your Leasely inquiry inbox.</p>
          </div>`,
          replyTo: email,
        }).catch(() => {});
      }
      return res.json({ success: true });
    } catch (err) {
      console.error("[portal-leads]", err);
      return res.status(500).json({ error: "Failed to submit lead" });
    }
  });
  // CORS preflight
  app.options("/api/portal-leads", (_req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
  });

  // Health check for Railway (basic — used by Railway's healthcheck)
  // Includes commit SHA so deploy.yml can verify the NEW build is live (not stale).
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "unknown",
    });
  });

  // Comprehensive security & integration health check.
  // Use this in monitoring (UptimeRobot, BetterStack, etc.) on a daily cron.
  // Surfaces missing critical env vars, weak secrets, and disabled integrations.
  app.get("/api/health/security", (_req, res) => {
    const required = [
      "JWT_SECRET",
      "DATABASE_URL",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "BREVO_API_KEY",
      "APP_URL",
    ];
    const missing = required.filter((k) => !process.env[k]);
    const jwtSecret = process.env.JWT_SECRET ?? "";
    const cookieSecret = process.env.COOKIE_SECRET ?? jwtSecret;
    const checks = {
      env: { ok: missing.length === 0, missing },
      jwtSecretStrength: {
        ok: jwtSecret.length >= 32,
        length: jwtSecret.length,
      },
      cookieSecretStrength: {
        ok: cookieSecret.length >= 32,
        length: cookieSecret.length,
      },
      rateLimits: {
        ok: true,
        auth: "10 per 15 min per IP",
        api: "300 per min per IP",
        chat: "30 per min per IP",
      },
      helmet: { ok: true },
      stripeWebhook: { ok: !!process.env.STRIPE_WEBHOOK_SECRET },
      ownerEmailConfigured: { ok: !!process.env.OWNER_EMAIL },
      nodeEnv: process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
    };
    const allOk = checks.env.ok &&
      checks.jwtSecretStrength.ok &&
      checks.cookieSecretStrength.ok &&
      checks.stripeWebhook.ok;
    res.status(allOk ? 200 : 503).json({ status: allOk ? "ok" : "degraded", checks });
  });
  // tRPC API (general rate limit)
  app.use(
    "/api/trpc",
    apiLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    // Seed lease templates after the server is accepting traffic so DB
    // hiccups don't block startup. Idempotent: only inserts missing rows.
    import("../leases/db-helpers")
      .then(m => m.seedLeaseTemplatesIfEmpty())
      .catch(err => console.warn("[Leases] template seed failed:", err));
    // Kick off the rent-benchmark scheduler — checks once a day whether
    // the ACS / HUD data is older than 27 days and refreshes nationwide.
    // Fully automatic; no manual CSV upload required.
    import("./rentBenchmarks")
      .then(m => m.startRentBenchmarkScheduler())
      .catch(err => console.warn("[rentBenchmarks] scheduler init failed:", err));
    // Daily sweep that expires leases past their end date and cancels the
    // associated recurring rent Stripe Subscription so we don't keep
    // billing a moved-out tenant.
    import("../leases/expiryScheduler")
      .then(m => m.startLeaseExpiryScheduler())
      .catch(err => console.warn("[leaseExpiry] scheduler init failed:", err));
  });
}

startServer().catch(console.error);
