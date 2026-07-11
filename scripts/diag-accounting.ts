import mysql from "mysql2/promise";
const DB_URL = process.env.DB_URL;
(async () => {
  const conn = await mysql.createConnection(DB_URL!);
  try {
    const [props]: any = await conn.query("SELECT id, address, userId FROM crm_properties ORDER BY id");
    for (const p of props) {
      const [[{ ae }]]: any = await conn.query("SELECT COUNT(*) ae FROM accounting_entries WHERE crmPropertyId=?", [p.id]);
      const [[{ rent }]]: any = await conn.query("SELECT COUNT(*) rent FROM accounting_entries WHERE crmPropertyId=? AND category='rent'", [p.id]);
      const [tenants]: any = await conn.query("SELECT firstName,lastName FROM crm_tenants WHERE crmPropertyId=?", [p.id]);
      const [leases]: any = await conn.query("SELECT id,startDate,endDate,monthlyRent,status FROM crm_leases WHERE crmPropertyId=?", [p.id]);
      const who = tenants.map((t:any)=>`${t.firstName} ${t.lastName}`).join(", ") || "(none)";
      console.log(`prop#${p.id} u=${p.userId} "${p.address.slice(0,28)}" | tenants: ${who} | leases: ${leases.length} | accounting: ${ae} (rent=${rent})`);
      if (ae > 0) {
        const [rows]: any = await conn.query("SELECT date,category,amount FROM accounting_entries WHERE crmPropertyId=? ORDER BY date DESC LIMIT 4", [p.id]);
        rows.forEach((r:any)=>console.log(`      ${r.date} ${r.category} $${(r.amount/100)}`));
      }
    }
  } finally { await conn.end(); }
})().catch(e => { console.error(e); process.exit(1); });
