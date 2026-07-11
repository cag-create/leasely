/**
 * Migration: add W-9 / 1099 columns to `vendors` and a `vendorId` link to
 * `accounting_entries`, so Pro users can issue year-end 1099-NEC forms to
 * contractors they paid $600+. Idempotent — checks INFORMATION_SCHEMA and only
 * adds missing columns. Additive only; existing rows untouched.
 *
 * Usage:
 *   railway run --service=MySQL bash -c 'DB_URL="$MYSQL_PUBLIC_URL" npx tsx scripts/add-vendor-w9-columns.ts'
 */
import mysql from "mysql2/promise";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL required"); process.exit(1); }

const COLS: { table: string; column: string; ddl: string }[] = [
  { table: "vendors", column: "legalName", ddl: "ADD COLUMN legalName VARCHAR(255) NULL" },
  { table: "vendors", column: "businessName", ddl: "ADD COLUMN businessName VARCHAR(255) NULL" },
  { table: "vendors", column: "taxClassification", ddl: "ADD COLUMN taxClassification ENUM('individual','sole_proprietor','c_corp','s_corp','partnership','trust','llc','other') NULL" },
  { table: "vendors", column: "tinType", ddl: "ADD COLUMN tinType ENUM('ssn','ein') NULL" },
  { table: "vendors", column: "tinLast4", ddl: "ADD COLUMN tinLast4 VARCHAR(4) NULL" },
  { table: "vendors", column: "tinEncrypted", ddl: "ADD COLUMN tinEncrypted TEXT NULL" },
  { table: "vendors", column: "w9Address", ddl: "ADD COLUMN w9Address TEXT NULL" },
  { table: "vendors", column: "w9City", ddl: "ADD COLUMN w9City VARCHAR(100) NULL" },
  { table: "vendors", column: "w9State", ddl: "ADD COLUMN w9State VARCHAR(2) NULL" },
  { table: "vendors", column: "w9Zip", ddl: "ADD COLUMN w9Zip VARCHAR(10) NULL" },
  { table: "vendors", column: "w9CertifiedAt", ddl: "ADD COLUMN w9CertifiedAt TIMESTAMP NULL" },
  { table: "accounting_entries", column: "vendorId", ddl: "ADD COLUMN vendorId INT NULL" },
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
    console.log("✅ vendor W-9 / 1099 columns ready");
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
