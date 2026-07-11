import mysql from "mysql2/promise";
const DB_URL = process.env.DB_URL;
(async () => {
  const conn = await mysql.createConnection(DB_URL!);
  try {
    // Candidate columns that store uploaded /uploads URLs.
    const targets: [string,string][] = [
      ["marketplace_listings","photos"],
      ["user_subscriptions","brandLogoUrl"],
      ["crm_leases","documentUrl"],
      ["lease_agreements","documentUrl"],
      ["users","avatarUrl"],
    ];
    let fixed = 0;
    for (const [tbl,col] of targets) {
      try {
        const [res]: any = await conn.query(
          `UPDATE ${tbl} SET ${col}=REPLACE(${col},'https://leasely.net/uploads','https://keycove.net/uploads') WHERE ${col} LIKE '%leasely.net/uploads%'`
        );
        if (res.affectedRows) { console.log(`  ${tbl}.${col}: fixed ${res.affectedRows} row(s)`); fixed += res.affectedRows; }
      } catch (e:any) { /* column/table may not exist */ }
    }
    console.log(fixed ? `\n✅ Rewrote ${fixed} row(s) of dead leasely.net image URLs → keycove.net` : "\n(no leasely.net image URLs found)");
    // Verify the listing that was broken
    const [[row]]: any = await conn.query("SELECT LEFT(photos,120) p FROM marketplace_listings WHERE id=1");
    console.log("Listing #1 photos now:", row?.p);
  } finally { await conn.end(); }
})().catch(e => { console.error(e); process.exit(1); });
