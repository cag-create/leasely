/**
 * One-shot migration: add "co_living" to crm_properties.propertyType enum so
 * bulk-imported co-living houses (rented by the room) can be stored. Idempotent
 * — re-running just re-applies the same full enum. Safe: MODIFY only widens the
 * allowed set, existing rows are untouched.
 *
 * Usage:
 *   railway run --service=MySQL bash -c 'DB_URL="$MYSQL_PUBLIC_URL" npx tsx scripts/add-coliving-property-type.ts'
 */
import mysql from "mysql2/promise";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL required"); process.exit(1); }

const ENUM = "'single_family','multi_family','apartment','condo','townhouse','co_living','commercial','other'";

(async () => {
  const conn = await mysql.createConnection(DB_URL);
  try {
    const [before] = await conn.query(
      "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='crm_properties' AND COLUMN_NAME='propertyType'"
    );
    console.log("Before:", (before as any[])[0]?.COLUMN_TYPE);
    await conn.query(
      `ALTER TABLE crm_properties MODIFY COLUMN propertyType ENUM(${ENUM}) DEFAULT 'single_family'`
    );
    const [after] = await conn.query(
      "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='crm_properties' AND COLUMN_NAME='propertyType'"
    );
    console.log("After: ", (after as any[])[0]?.COLUMN_TYPE);
    console.log("✅ co_living is now a valid crm_properties.propertyType");
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
