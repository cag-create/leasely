import mysql from "mysql2/promise";
const DB_URL = process.env.DB_URL;
(async () => {
  const conn = await mysql.createConnection(DB_URL!);
  try {
    const [rows]: any = await conn.query(
      "SELECT id, date, category, amount, crmPropertyId, propertyAddress, LEFT(description,40) d FROM accounting_entries WHERE userId=2 ORDER BY date DESC, id DESC"
    );
    console.log(`Total entries (userId=2): ${rows.length}`);
    let sum = 0;
    for (const r of rows) { sum += r.amount; console.log(`  #${r.id} ${r.date} ${r.category} $${(r.amount/100).toLocaleString().padStart(8)} | crmPropId=${r.crmPropertyId ?? 'NULL'} | "${r.propertyAddress}" | ${r.d}`); }
    console.log(`\nGrand total: $${(sum/100).toLocaleString()}`);
    console.log("\n=== grouped by address ===");
    const [g]: any = await conn.query("SELECT propertyAddress, crmPropertyId, COUNT(*) n, SUM(amount) t FROM accounting_entries WHERE userId=2 GROUP BY propertyAddress, crmPropertyId");
    for (const x of g) console.log(`  "${x.propertyAddress}" (prop=${x.crmPropertyId??'NULL'}) -> ${x.n} entries, $${(x.t/100).toLocaleString()}`);
  } finally { await conn.end(); }
})().catch(e => { console.error(e); process.exit(1); });
