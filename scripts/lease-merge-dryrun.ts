/**
 * READ-ONLY dry-run for the two-lease-system merge. Writes NOTHING.
 *
 * Leasely stores leases in two places:
 *   A) lease_agreements + rent_payments   (marketplace: apply→approve→sign)
 *   B) crm_leases + crm_tenants + accounting_entries (CRM portfolio)
 *
 * This reports the real prod data so we can pick a safe merge strategy:
 *   - row counts per table/status
 *   - overlap: which signed/active lease_agreements already have a CRM
 *     tenant (landlordUserId + tenantEmail) vs which would be backfilled
 *   - DOUBLE-LEDGER RISK: tenants that could receive late fees in BOTH
 *     rent_payments AND accounting_entries (the risk the sync introduced)
 *
 * Usage:
 *   railway run --service=MySQL bash -c 'DB_URL="$MYSQL_PUBLIC_URL" npx tsx scripts/lease-merge-dryrun.ts'
 */
import mysql from "mysql2/promise";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL required"); process.exit(1); }

const q = async (conn: mysql.Connection, sql: string, p: any[] = []) => {
  const [rows] = await conn.query(sql, p);
  return rows as any[];
};

(async () => {
  const conn = await mysql.createConnection(DB_URL);
  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log(" LEASE-MERGE DRY RUN (read-only — no writes)");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1) Row counts
    const laByStatus = await q(conn, `SELECT status, COUNT(*) n FROM lease_agreements GROUP BY status ORDER BY n DESC`);
    const [{ n: crmLeaseN }] = await q(conn, `SELECT COUNT(*) n FROM crm_leases`);
    const [{ n: crmTenantN }] = await q(conn, `SELECT COUNT(*) n FROM crm_tenants`);
    const [{ n: crmPropN }] = await q(conn, `SELECT COUNT(*) n FROM crm_properties`);
    const [{ n: rentPayN }] = await q(conn, `SELECT COUNT(*) n FROM rent_payments`);
    const [{ n: acctRentN }] = await q(conn, `SELECT COUNT(*) n FROM accounting_entries WHERE category='rent'`);
    const [{ n: acctLateN }] = await q(conn, `SELECT COUNT(*) n FROM accounting_entries WHERE category='late_fee'`);

    console.log("── Table row counts ──────────────────────────────────");
    console.log("lease_agreements by status:");
    laByStatus.forEach(r => console.log(`   ${String(r.status).padEnd(16)} ${r.n}`));
    console.log(`crm_leases:            ${crmLeaseN}`);
    console.log(`crm_tenants:           ${crmTenantN}`);
    console.log(`crm_properties:        ${crmPropN}`);
    console.log(`rent_payments:         ${rentPayN}`);
    console.log(`accounting (rent):     ${acctRentN}`);
    console.log(`accounting (late_fee): ${acctLateN}\n`);

    // 2) Overlap: signed/active lease_agreements vs existing crm_tenants
    const signedLA = await q(conn, `
      SELECT la.id, la.landlordUserId, la.tenantEmail, la.tenantName, la.propertyAddress,
             la.monthlyRent, la.status,
             (SELECT COUNT(*) FROM crm_tenants ct
                WHERE ct.userId = la.landlordUserId AND ct.email = la.tenantEmail) AS crmMatch
      FROM lease_agreements la
      WHERE la.status IN ('signed','active','paid','tenant_signed')
      ORDER BY la.landlordUserId, la.id`);
    const alreadySynced = signedLA.filter(r => Number(r.crmMatch) > 0);
    const needBackfill = signedLA.filter(r => Number(r.crmMatch) === 0);

    console.log("── Overlap (signed/active/paid lease_agreements) ─────");
    console.log(`Total signed/active/paid lease_agreements: ${signedLA.length}`);
    console.log(`  already in CRM (by landlord+email):      ${alreadySynced.length}`);
    console.log(`  NOT in CRM → would be backfilled:        ${needBackfill.length}`);
    if (needBackfill.length) {
      console.log("  backfill candidates:");
      needBackfill.forEach(r => console.log(`     LA#${r.id} landlord=${r.landlordUserId} ${r.tenantName} <${r.tenantEmail}> $${(r.monthlyRent/100)} — ${r.propertyAddress?.slice(0,40)}`));
    }
    console.log("");

    // 3) DOUBLE-LEDGER RISK — tenants that could get late fees in both places.
    //    A lease_agreement that HAS rent_payments AND now also has a crm_lease
    //    (synced) → both late-fee sweeps can hit the same real tenant.
    const doubleRisk = await q(conn, `
      SELECT la.id AS laId, la.landlordUserId, la.tenantEmail, la.tenantName,
             (SELECT COUNT(*) FROM rent_payments rp WHERE rp.leaseAgreementId = la.id) AS rentPayRows,
             (SELECT cl.id FROM crm_leases cl
                JOIN crm_tenants ct ON ct.id = cl.crmTenantId
                WHERE cl.userId = la.landlordUserId AND ct.email = la.tenantEmail LIMIT 1) AS crmLeaseId
      FROM lease_agreements la
      WHERE la.status IN ('signed','active','paid')
      HAVING rentPayRows > 0 AND crmLeaseId IS NOT NULL`);
    console.log("── DOUBLE-LEDGER RISK ────────────────────────────────");
    console.log(`Tenants with BOTH rent_payments AND a synced crm_lease: ${doubleRisk.length}`);
    doubleRisk.forEach(r => console.log(`   LA#${r.laId} ↔ crm_lease#${r.crmLeaseId}  ${r.tenantName} <${r.tenantEmail}>  (${r.rentPayRows} rent_payments)`));
    console.log("");

    console.log("═══════════════════════════════════════════════════════");
    console.log(" Summary");
    console.log("───────────────────────────────────────────────────────");
    console.log(` Backfill needed:      ${needBackfill.length} lease(s)`);
    console.log(` Double-ledger risk:   ${doubleRisk.length} tenant(s)`);
    console.log(" No data was modified. Review before running the migration.");
    console.log("═══════════════════════════════════════════════════════");
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
