/**
 * OAuth routes replaced by email/password auth.
 * See server/_core/auth.ts for the current implementation.
 */
import type { Express } from "express";

export function registerOAuthRoutes(_app: Express) {
  // No-op: replaced by registerAuthRoutes in auth.ts
}
