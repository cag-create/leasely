/**
 * Sample + import agents from the T7 CSV: up to 1,000 per state, spread across
 * as many different cities as possible (round-robin by city), then batch-insert
 * shell user accounts + APPROVED creme_agent profiles into prod.
 *
 * Usage (runs locally, reads the local CSV, writes to prod DB):
 *   railway run --service=Keycove bash -c 'DB_URL="$MYSQL_PUBLIC_URL" npx tsx scripts/import-agents-sample.ts'
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { randomBytes } from "crypto";

const CSV = "/Volumes/T7/aim/exports/agents_converted.csv";
const PER_STATE = 1000;
const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL required"); process.exit(1); }

// ── robust CSV parse (handles quoted fields with commas) ──────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c === "\r") { /* skip */ }
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
const toJson = (s?: string) => { const a = (s ?? "").split(/[,;]/).map(x => x.trim()).filter(Boolean); return a.length ? JSON.stringify(a) : null; };

(async () => {
  console.log("Reading CSV…");
  const rows = parseCSV(readFileSync(CSV, "utf8"));
  const header = rows[0].map(h => h.trim().toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  const cName = idx("name"), cEmail = idx("email"), cPhone = idx("phone"), cLic = idx("license"),
        cBio = idx("bio"), cSpec = idx("specialties"), cCity = idx("city"), cState = idx("state"), cAreas = idx("service_areas");

  // Group by state → city
  type A = { name: string; email: string; phone: string; license: string; bio: string; specialties: string; serviceAreas: string };
  const byState = new Map<string, Map<string, A[]>>();
  let seenEmails = new Set<string>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (!r || r.length < cState + 1) continue;
    const email = (r[cEmail] || "").trim().toLowerCase();
    const state = (r[cState] || "").trim().toUpperCase().slice(0, 2);
    if (!email || !/.+@.+\..+/.test(email) || state.length !== 2) continue;
    if (seenEmails.has(email)) continue; seenEmails.add(email);
    const city = (r[cCity] || "").trim() || "—";
    if (!byState.has(state)) byState.set(state, new Map());
    const cm = byState.get(state)!; if (!cm.has(city)) cm.set(city, []);
    cm.get(city)!.push({
      name: (r[cName] || "").trim(), email, phone: (r[cPhone] || "").trim(),
      license: (r[cLic] || "").trim(), bio: (r[cBio] || "").trim(),
      specialties: (r[cSpec] || "").trim(), serviceAreas: (r[cAreas] || "").trim(),
    });
  }

  // Round-robin across cities per state, up to PER_STATE
  const picked: A[] = [];
  for (const [state, cities] of byState) {
    const lists = [...cities.values()]; let count = 0, added = true;
    while (count < PER_STATE && added) {
      added = false;
      for (const list of lists) {
        if (list.length) { picked.push(list.shift()!); count++; added = true; if (count >= PER_STATE) break; }
      }
    }
  }
  console.log(`Sampled ${picked.length} agents across ${byState.size} states (≤${PER_STATE}/state, city-diversified).`);

  const conn = await mysql.createConnection(DB_URL!);
  try {
    // existing users email→id
    const [eu]: any = await conn.query("SELECT id, email FROM users WHERE email IS NOT NULL");
    const emailToId = new Map<string, number>(); for (const u of eu) emailToId.set(String(u.email).toLowerCase(), u.id);

    // insert new users in batches
    const newUsers = picked.filter(a => !emailToId.has(a.email));
    console.log(`New accounts to create: ${newUsers.length} (${picked.length - newUsers.length} already exist)`);
    for (let i = 0; i < newUsers.length; i += 1000) {
      const chunk = newUsers.slice(i, i + 1000);
      const vals = chunk.map(a => [randomBytes(16).toString("hex"), a.name || "Agent", a.email, "user", 1, "admin_import"]);
      await conn.query("INSERT IGNORE INTO users (openId, name, email, role, emailVerified, loginMethod) VALUES ?", [vals]);
      process.stdout.write(`\r  users inserted: ${Math.min(i + 1000, newUsers.length)}/${newUsers.length}`);
    }
    console.log("");

    // refresh email→id for all picked
    const emails = picked.map(a => a.email);
    for (let i = 0; i < emails.length; i += 2000) {
      const [rowsU]: any = await conn.query("SELECT id, email FROM users WHERE email IN (?)", [emails.slice(i, i + 2000)]);
      for (const u of rowsU) emailToId.set(String(u.email).toLowerCase(), u.id);
    }

    // existing creme_agents userIds
    const [ea]: any = await conn.query("SELECT userId FROM creme_agents");
    const haveAgent = new Set<number>(ea.map((x: any) => x.userId));

    // insert creme_agents in batches
    let agentVals: any[] = []; let inserted = 0;
    const flush = async () => {
      if (!agentVals.length) return;
      await conn.query(
        "INSERT IGNORE INTO creme_agents (userId, status, phone, licenseNumber, bio, specialties, serviceAreas) VALUES ?",
        [agentVals]
      );
      inserted += agentVals.length; agentVals = [];
      process.stdout.write(`\r  agents inserted: ${inserted}`);
    };
    for (const a of picked) {
      const uid = emailToId.get(a.email); if (!uid || haveAgent.has(uid)) continue;
      haveAgent.add(uid);
      agentVals.push([uid, "approved", a.phone || null, a.license || null, a.bio || null, toJson(a.specialties), toJson(a.serviceAreas)]);
      if (agentVals.length >= 1000) await flush();
    }
    await flush();
    console.log(`\n✅ Done. Approved agents now in directory: +${inserted} new.`);
    const [[{ n }]]: any = await conn.query("SELECT COUNT(*) n FROM creme_agents WHERE status='approved'");
    console.log(`Total approved creme_agents: ${n}`);
  } finally { await conn.end(); }
})().catch(e => { console.error(e); process.exit(1); });
