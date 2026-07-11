import mysql from "mysql2/promise";
const DB_URL = process.env.DB_URL;
(async () => {
  const conn = await mysql.createConnection(DB_URL!);
  try {
    const [[t]]: any = await conn.query(
      "SELECT id, userId, crmPropertyId, monthlyRent, moveInDate FROM crm_tenants WHERE crmPropertyId=1 AND firstName LIKE 'Joselyn%' LIMIT 1"
    );
    if (!t) { console.log("Joselyn tenant not found on prop#1"); return; }
    const [[existing]]: any = await conn.query("SELECT id FROM crm_leases WHERE crmTenantId=?", [t.id]);
    if (existing) { console.log("Joselyn already has lease #" + existing.id); return; }
    const rent = t.monthlyRent || 160000;
    await conn.query(
      `INSERT INTO crm_leases (userId, crmPropertyId, crmTenantId, startDate, endDate, monthlyRent, lateFeeCents, lateFeeGraceDays, leaseType, status, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [t.userId, t.crmPropertyId, t.id, "2026-06-01", "2027-06-01", rent, 5000, 5, "fixed_term", "active", "Backfilled lease so rent schedule renders."]
    );
    console.log(`✅ Created Joselyn's lease: prop#${t.crmPropertyId} tenant#${t.id} $${rent/100}/mo, 2026-06-01 → 2027-06-01.`);
    console.log("   Rent schedule now renders (months show OWED until payments are recorded — no fabricated payments).");
  } finally { await conn.end(); }
})().catch(e => { console.error(e); process.exit(1); });
