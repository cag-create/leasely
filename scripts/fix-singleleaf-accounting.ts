import mysql from "mysql2/promise";
const DB_URL = process.env.DB_URL;
(async () => {
  const conn = await mysql.createConnection(DB_URL!);
  try {
    console.log("=== Singleleaf accounting groups (before) ===");
    const [groups]: any = await conn.query(
      "SELECT propertyAddress, crmPropertyId, COUNT(*) n, SUM(amount) total FROM accounting_entries WHERE propertyAddress LIKE '%Singleleaf%' GROUP BY propertyAddress, crmPropertyId"
    );
    for (const g of groups) console.log(`  "${g.propertyAddress}" (crmPropertyId=${g.crmPropertyId}) -> ${g.n} entries, $${(g.total/100).toLocaleString()}`);

    // Delete ONLY the incorrect group: address label without the city, totaling $15,200.
    const bad = groups.find((g:any) => g.propertyAddress === "13912 Singleleaf LN" && Number(g.total) === 1520000);
    if (!bad) { console.log("\n⚠️ Incorrect $15,200 group not found by exact match — aborting (no changes)."); return; }
    const [res]: any = await conn.query(
      "DELETE FROM accounting_entries WHERE propertyAddress='13912 Singleleaf LN' AND crmPropertyId <=> ?",
      [bad.crmPropertyId]
    );
    console.log(`\n✅ Deleted ${res.affectedRows} incorrect entries ("13912 Singleleaf LN" / $15,200).`);

    console.log("\n=== after ===");
    const [after]: any = await conn.query(
      "SELECT propertyAddress, crmPropertyId, COUNT(*) n, SUM(amount) total FROM accounting_entries WHERE propertyAddress LIKE '%Singleleaf%' GROUP BY propertyAddress, crmPropertyId"
    );
    for (const g of after) console.log(`  "${g.propertyAddress}" -> ${g.n} entries, $${(g.total/100).toLocaleString()}`);
  } finally { await conn.end(); }
})().catch(e => { console.error(e); process.exit(1); });
