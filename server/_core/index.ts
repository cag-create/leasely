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
  registerAuthRoutes(app);
  // Chat API with streaming and tool calling
  registerChatRoutes(app);
  // Health check for Railway
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  // tRPC API
  app.use(
    "/api/trpc",
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
