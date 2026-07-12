/**
 * Migration: add CBP partner-code columns to `user_subscriptions` so every Pro
 * member gets a one-time KEYCOVE-XXXXXXXX discount code registered with CBP's
 * /api/partner-codes and redeemable at certifybusinesspro.com/website-logo-intake.
 * Idempotent — checks INFORMATION_SCHEMA and only adds missing columns. Additive.
 *
 * Usage:
 *   railway run --service=MySQL bash -c 'DB_URL="$MYSQL_PUBLIC_URL" npx tsx scripts/add-cbp-partner-code-columns.ts'
 */
import mysql from "mysql2/promise";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL required"); process.exit(1); }

const COLS: { table: string; column: string; ddl: string }[] = [
  { table: "user_subscriptions", column: "cbpPartnerCode", ddl: "ADD COLUMN cbpPartnerCode VARCHAR(24) NULL" },
  { table: "user_subscriptions", column: "cbpPartnerCodeSyncedAt", ddl: "ADD COLUMN cbpPartnerCodeSyncedAt TIMESTAMP NULL" },
];

(async () => {
  const conn = await mysql.createConnection(DB_URL);
  try {
    for (const c of COLS) {
      const [rows] = await conn.query(
        "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?",
        [c.table, c.column]
      );
      if ((rows as any[]).length) { console.log(`✓ ${c.table}.${c.column} already exists`); continue; }
      await conn.query(`ALTER TABLE ${c.table} ${c.ddl}`);
      console.log(`+ added ${c.table}.${c.column}`);
    }
    console.log("✅ CBP partner-code columns ready");
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
