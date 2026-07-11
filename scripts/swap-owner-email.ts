/**
 * Swap the owner login email to support@keycove.net:
 *   1. Verify the accidentally-created account (#44 support@keycove.net) is empty.
 *   2. Delete #44 (frees the email).
 *   3. Rename #2 (getleasely@gmail.com) → support@keycove.net (keeps id, password,
 *      role=admin, accountType, and all data — everything is keyed by userId, not email).
 *   4. Mark the email verified so login isn't gated.
 *
 * Usage:
 *   railway run --service=MySQL bash -c 'DB_URL="$MYSQL_PUBLIC_URL" npx tsx scripts/swap-owner-email.ts'
 */
import mysql from "mysql2/promise";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL required"); process.exit(1); }

const NEW_EMAIL = "support@keycove.net";
const OWNER_ID = 2;      // getleasely@gmail.com — the real data-rich account
const EMPTY_ID = 44;     // support@keycove.net — the accidental empty account

(async () => {
  const conn = await mysql.createConnection(DB_URL);
  try {
    // Which "verified" column exists on users?
    const [cols] = await conn.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND TABLE_SCHEMA=DATABASE()"
    );
    const colNames = (cols as any[]).map(c => c.COLUMN_NAME);
    const verifiedCol = colNames.find(c => /verified/i.test(c) && /email/i.test(c)) || colNames.find(c => /^emailVerified$/i.test(c)) || colNames.find(c => /verified/i.test(c));
    console.log("verified column:", verifiedCol ?? "(none found)");

    // 1) Footprint check on #44 across the tables that key by userId.
    const checks: [string, string][] = [
      ["crm_properties", "userId"], ["marketplace_listings", "userId"], ["lease_agreements", "landlordUserId"],
      ["crm_tenants", "userId"], ["crm_leases", "userId"], ["accounting_entries", "userId"],
      ["user_subscriptions", "userId"], ["vendors", "userId"], ["work_orders", "userId"],
    ];
    let footprint = 0;
    console.log(`\nFootprint of #${EMPTY_ID} (${NEW_EMAIL}):`);
    for (const [tbl, col] of checks) {
      try {
        const [[{ n }]] = await conn.query(`SELECT COUNT(*) n FROM ${tbl} WHERE ${col}=?`, [EMPTY_ID]) as any;
        if (n > 0) { console.log(`  ${tbl}.${col}: ${n}`); footprint += Number(n); }
      } catch { /* table may not exist */ }
    }
    if (footprint === 0) console.log("  (empty — safe to delete)");

    if (footprint > 0) {
      console.log(`\n⛔ ABORTED: #${EMPTY_ID} has ${footprint} row(s) of data — not deleting. Review before swapping.`);
      return;
    }

    // 2) Delete the empty account, freeing the email.
    await conn.query("DELETE FROM users WHERE id=?", [EMPTY_ID]);
    console.log(`\nDeleted empty account #${EMPTY_ID}.`);

    // 3) Rename the real account + 4) mark verified.
    if (verifiedCol) {
      await conn.query(`UPDATE users SET email=?, \`${verifiedCol}\`=1 WHERE id=?`, [NEW_EMAIL, OWNER_ID]);
    } else {
      await conn.query("UPDATE users SET email=? WHERE id=?", [NEW_EMAIL, OWNER_ID]);
    }

    const [after] = await conn.query("SELECT id, email, role, accountType FROM users WHERE id=?", [OWNER_ID]);
    const u = (after as any[])[0];
    console.log(`\n✅ Swapped. Login is now:`);
    console.log(`   #${u.id} ${u.email} | role=${u.role} | type=${u.accountType} (password unchanged)`);
    console.log(`   Sign in with ${NEW_EMAIL} + your existing password → /admin.`);
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
