import mysql from "mysql2/promise";
const DB_URL = process.env.DB_URL;
(async () => {
  const conn = await mysql.createConnection(DB_URL!);
  try {
    const [rows] = await conn.query("SELECT id, title, LEFT(photos,200) AS photos FROM marketplace_listings ORDER BY id DESC LIMIT 6");
    for (const r of rows as any[]) {
      const p = r.photos || "";
      const host = /leasely\.net/.test(p) ? "leasely.net (DEAD)" : /keycove\.net/.test(p) ? "keycove.net" : /cloudinary/.test(p) ? "cloudinary" : p.trim() ? "other" : "EMPTY/none";
      console.log(`#${r.id} "${(r.title||'').slice(0,24)}" -> photos: ${host}`);
      if (p.trim()) console.log(`     ${p.slice(0,120)}`);
    }
    // count listings by photo host
    const [[{ dead }]] = await conn.query("SELECT COUNT(*) dead FROM marketplace_listings WHERE photos LIKE '%leasely.net%'") as any;
    const [[{ empty }]] = await conn.query("SELECT COUNT(*) empty FROM marketplace_listings WHERE photos IS NULL OR photos='' OR photos='[]'") as any;
    const [[{ total }]] = await conn.query("SELECT COUNT(*) total FROM marketplace_listings") as any;
    console.log(`\nTotals: ${total} listings | ${dead} with leasely.net URLs (broken) | ${empty} with no photos`);
  } finally { await conn.end(); }
})().catch(e => { console.error(e); process.exit(1); });
