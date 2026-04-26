import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { registerAuthRoutes } from "./auth";
import { registerChatRoutes } from "./chat";
import { registerStripeWebhook } from "../stripeWebhook";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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
