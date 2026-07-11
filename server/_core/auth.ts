/**
 * Email/password authentication routes.
 * Replaces the Manus OAuth flow for Railway deployment.
 */
import { COOKIE_NAME, SESSION_TTL_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { createHash, pbkdf2Sync, randomBytes } from "crypto";
import { nanoid } from "nanoid";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { sendEmail, emailVerifyEmail, passwordResetEmail } from "./email";

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

function appUrl(): string {
  return process.env.APP_URL || "https://leasely.net";
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

      // Fetch the freshly-created user to get id + tokenVersion
      const user = await db.getUserByEmail(normalizedEmail);
      if (!user) throw new Error("User creation failed");

      // Issue email verification token (24h TTL)
      const verifyToken = randomBytes(32).toString("hex");
      const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.setEmailVerifyToken(user.id, verifyToken, verifyExpires);

      // Send verification email (non-blocking — don't fail registration if email send fails)
      const verifyUrl = `${appUrl()}/verify-email?token=${verifyToken}`;
      sendEmail({
        to: normalizedEmail,
        subject: "Verify your Keycove email",
        html: emailVerifyEmail({ name: user.name || normalizedEmail.split("@")[0], verifyUrl }),
      }).catch(err => console.warn("[Auth] Verification email send failed:", err));

      const sessionToken = await sdk.createSessionToken(openId, {
        name: name || "",
        expiresInMs: SESSION_TTL_MS,
        tokenVersion: user.tokenVersion ?? 0,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_TTL_MS });
      res.json({ success: true, emailVerificationSent: true });
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

      // Self-heal: re-promote the owner email to admin if it isn't already.
      // Covers cases where OWNER_EMAIL was set after this user signed up,
      // or the role was downgraded somewhere along the way.
      const isOwner = process.env.OWNER_EMAIL &&
        normalizedEmail === process.env.OWNER_EMAIL.toLowerCase().trim();
      const shouldPromote = isOwner && user.role !== "admin";
      const willBeAdmin = user.role === "admin" || shouldPromote;

      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
        ...(shouldPromote ? { role: "admin" as const } : {}),
      });

      // Admins automatically get Pro — upsert their subscription row so every
      // server-side `tier === "paid"` check passes without requiring payment.
      if (willBeAdmin) {
        try {
          await db.upsertUserSubscription({
            userId: user.id,
            tier: "paid",
            status: "active",
          });
        } catch (err) {
          console.warn("[Auth] Admin Pro subscription upsert failed:", err);
        }
      }

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: SESSION_TTL_MS,
        tokenVersion: user.tokenVersion ?? 0,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_TTL_MS });
      res.json({
        success: true,
        emailVerified: !!user.emailVerified,
        role: willBeAdmin ? "admin" : (user.role ?? "user"),
        accountType: (user as any).accountType ?? null,
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /** POST /api/auth/forgot-password — request a password reset email */
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    try {
      const user = await db.getUserByEmail(normalizedEmail);
      // Always respond OK — never reveal whether the email exists (prevents enumeration)
      if (user) {
        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await db.setPasswordResetToken(user.id, token, expires);
        const resetUrl = `${appUrl()}/reset-password?token=${token}`;
        sendEmail({
          to: normalizedEmail,
          subject: "Reset your Keycove password",
          html: passwordResetEmail({ name: user.name || normalizedEmail.split("@")[0], resetUrl }),
        }).catch(err => console.warn("[Auth] Reset email send failed:", err));
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Forgot-password error:", error);
      res.status(500).json({ error: "Could not process request" });
    }
  });

  /** POST /api/auth/reset-password — set a new password using a reset token */
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const { token, password } = req.body ?? {};
    if (!token || !password) {
      res.status(400).json({ error: "Token and password are required" });
      return;
    }
    if (typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }
    try {
      const user = await db.getUserByPasswordResetToken(String(token));
      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        res.status(400).json({ error: "Invalid or expired reset link. Request a new one." });
        return;
      }
      const newHash = createPasswordHash(password);
      // Updates password, clears reset token, AND bumps tokenVersion (revokes prior sessions)
      await db.updateUserPassword(user.id, newHash);
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Reset-password error:", error);
      res.status(500).json({ error: "Could not reset password" });
    }
  });

  /** POST /api/auth/verify-email — confirm email ownership via token */
  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    const { token } = req.body ?? {};
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }
    try {
      const user = await db.getUserByEmailVerifyToken(String(token));
      if (!user || !user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
        res.status(400).json({ error: "Invalid or expired verification link." });
        return;
      }
      await db.markEmailVerified(user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Verify-email error:", error);
      res.status(500).json({ error: "Could not verify email" });
    }
  });

  /** POST /api/auth/resend-verification — issue a new verification email */
  app.post("/api/auth/resend-verification", async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    try {
      const user = await db.getUserByEmail(normalizedEmail);
      if (user && !user.emailVerified) {
        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.setEmailVerifyToken(user.id, token, expires);
        const verifyUrl = `${appUrl()}/verify-email?token=${token}`;
        sendEmail({
          to: normalizedEmail,
          subject: "Verify your Keycove email",
          html: emailVerifyEmail({ name: user.name || normalizedEmail.split("@")[0], verifyUrl }),
        }).catch(err => console.warn("[Auth] Resend verification failed:", err));
      }
      // Always respond OK to prevent enumeration
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Resend-verification error:", error);
      res.status(500).json({ error: "Could not resend verification" });
    }
  });

  /**
   * POST /api/auth/claim-admin — bootstrap an admin/Pro account when OWNER_EMAIL
   * isn't sufficient (e.g., user already existed before OWNER_EMAIL was set, or
   * you want to promote a specific email without changing env vars).
   *
   * Gated by ADMIN_CLAIM_SECRET. If that env var isn't set, the endpoint 404s.
   * Once you've used it, remove ADMIN_CLAIM_SECRET on Railway to disable.
   */
  app.post("/api/auth/claim-admin", async (req: Request, res: Response) => {
    const claimSecret = process.env.ADMIN_CLAIM_SECRET;
    if (!claimSecret) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const { email, secret } = req.body ?? {};
    if (!email || !secret) {
      res.status(400).json({ error: "email and secret required" });
      return;
    }
    if (String(secret) !== claimSecret) {
      res.status(401).json({ error: "Invalid secret" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    try {
      const user = await db.getUserByEmail(normalizedEmail);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      await db.upsertUser({
        openId: user.openId,
        role: "admin",
      });

      await db.upsertUserSubscription({
        userId: user.id,
        tier: "paid",
        status: "active",
      });

      // Bump tokenVersion so any existing session refreshes its claims on next request.
      await db.bumpTokenVersion(user.id);

      console.log(`[Auth] Admin claim succeeded for ${normalizedEmail}`);
      res.json({ success: true, email: normalizedEmail, role: "admin", tier: "paid" });
    } catch (error) {
      console.error("[Auth] claim-admin error:", error);
      res.status(500).json({ error: "Could not claim admin" });
    }
  });
}
