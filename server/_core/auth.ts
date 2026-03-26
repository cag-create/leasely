/**
 * Email/password authentication routes.
 * Replaces the Manus OAuth flow for Railway deployment.
 */
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { createHash, pbkdf2Sync, randomBytes } from "crypto";
import { nanoid } from "nanoid";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

// ─── Password hashing (PBKDF2, no extra deps) ──────────────────────────────

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100_000, 64, "sha256").toString("hex");
}

export function createPasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const attempt = hashPassword(password, salt);
  // Constant-time comparison
  return createHash("sha256").update(attempt).digest("hex") ===
    createHash("sha256").update(hash).digest("hex");
}

// ─── Express routes ────────────────────────────────────────────────────────

export function registerAuthRoutes(app: Express) {
  /** POST /api/auth/register */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    try {
      // Check if email already registered
      const existing = await db.getUserByEmail(normalizedEmail);
      if (existing) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }

      const openId = nanoid(21); // stable unique ID
      const passwordHash = createPasswordHash(password);
      // Auto-grant admin role if this is the owner's email
      const isOwner = process.env.OWNER_EMAIL &&
        normalizedEmail === process.env.OWNER_EMAIL.toLowerCase().trim();

      await db.upsertUser({
        openId,
        email: normalizedEmail,
        name: name ? String(name).trim() : normalizedEmail.split("@")[0],
        passwordHash,
        loginMethod: "email",
        role: isOwner ? "admin" : "user",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /** POST /api/auth/login */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    try {
      const user = await db.getUserByEmail(normalizedEmail);

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      if (!verifyPassword(String(password), user.passwordHash)) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
