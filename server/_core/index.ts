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
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getProCodeByCode, redeemProCode } from "../db";

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

  // CBP (Certify Business Pro) code validation API — secured by CBP_API_SECRET header
  app.get("/api/pro-codes/validate", async (req, res) => {
    const secret = process.env.CBP_API_SECRET;
    if (secret && req.headers["x-cbp-secret"] !== secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const code = (req.query.code as string)?.toUpperCase();
    if (!code) return res.status(400).json({ error: "Missing code" });
    const row = await getProCodeByCode(code);
    if (!row) return res.status(404).json({ valid: false, error: "Code not found" });
    return res.json({
      valid: row.status === "unused",
      status: row.status,
      redeemedAt: row.redeemedAt ?? null,
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

  // Health check for Railway (basic — used by Railway's healthcheck)
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
  });
}

startServer().catch(console.error);
