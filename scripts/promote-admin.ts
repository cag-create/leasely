/**
 * Show the owner's accounts + promote the login account to admin so it can
 * reach /admin and see all accounts. Read-only listing first, then promotes
 * getleasely@gmail.com (the current login) to role=admin.
 *
 * Usage:
 *   railway run --service=MySQL bash -c 'DB_URL="$MYSQL_PUBLIC_URL" npx tsx scripts/promote-admin.ts'
 */
import mysql from "mysql2/promise";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL required"); process.exit(1); }

const TARGETS = ["getleasely@gmail.com", "support@keycove.net"];

(async () => {
  const conn = await mysql.createConnection(DB_URL);
  try {
    const [before] = await conn.query(
      "SELECT id, email, role, accountType FROM users WHERE email IN (?, ?) ORDER BY id",
      TARGETS
    );
    console.log("Before:");
    (before as any[]).forEach(u => console.log(`  #${u.id} ${u.email} | role=${u.role} | type=${u.accountType}`));

    // Total account count (what admin will see)
    const [[{ n }]] = await conn.query("SELECT COUNT(*) n FROM users") as any;
    console.log(`\nTotal accounts in the system: ${n}`);

    // Promote the login account to admin AND set accountType=landlord so it
    // stops redirecting to onboarding (the "it sent me here" screen).
    await conn.query("UPDATE users SET role='admin', accountType='landlord' WHERE email='getleasely@gmail.com'");

    const [after] = await conn.query(
      "SELECT id, email, role FROM users WHERE email IN (?, ?) ORDER BY id",
      TARGETS
    );
    console.log("\nAfter:");
    (after as any[]).forEach(u => console.log(`  #${u.id} ${u.email} | role=${u.role}`));
    console.log("\n✅ getleasely@gmail.com is admin — sign in with it and open /admin.");
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
