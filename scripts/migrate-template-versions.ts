/**
 * One-shot: insert new lease_template_versions rows whose bodyHtml differs
 * from the currently active version, then point lease_templates.activeVersionId
 * at the new row. Optionally re-renders a single draft lease_document so an
 * in-flight draft picks up the new clause without the landlord rebuilding it.
 *
 * Usage:
 *   DB_URL=mysql://... npx tsx scripts/migrate-template-versions.ts [--rerender=<leaseDocId>]
 */
import mysql from "mysql2/promise";
import { SEED_TEMPLATES } from "../server/leases/seed-templates";
import { renderTemplate } from "../server/leases/render";

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  console.error("DB_URL required");
  process.exit(1);
}

const rerenderArg = process.argv.find(a => a.startsWith("--rerender="));
const rerenderDocId = rerenderArg ? Number(rerenderArg.split("=")[1]) : null;

(async () => {
  const conn = await mysql.createConnection(DB_URL);
  try {
    console.log("Connected to Railway DB.");
    for (const seed of SEED_TEMPLATES) {
      const [tplRows] = await conn.execute(
        "SELECT id, activeVersionId FROM lease_templates WHERE state = ? AND category = ? LIMIT 1",
        [seed.state, seed.category],
      );
      const tpl = (tplRows as any[])[0];
      if (!tpl) {
        console.log(`SKIP ${seed.state}/${seed.category} — no template row`);
        continue;
      }
      let currentBody: string | null = null;
      if (tpl.activeVersionId) {
        const [verRows] = await conn.execute(
          "SELECT bodyHtml FROM lease_template_versions WHERE id = ? LIMIT 1",
          [tpl.activeVersionId],
        );
        currentBody = (verRows as any[])[0]?.bodyHtml ?? null;
      }
      if (currentBody === seed.bodyHtml) {
        console.log(`OK   ${seed.state}/${seed.category} — already up to date (v#${tpl.activeVersionId})`);
        continue;
      }
      // Compute next version number for this template
      const [maxRows] = await conn.execute(
        "SELECT COALESCE(MAX(version), 0) + 1 AS nextV FROM lease_template_versions WHERE templateId = ?",
        [tpl.id],
      );
      const nextVersion = (maxRows as any[])[0].nextV;

      const [insRes] = await conn.execute(
        `INSERT INTO lease_template_versions
          (templateId, version, bodyHtml, variables, citations, disclosures, changeNote, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          tpl.id,
          nextVersion,
          seed.bodyHtml,
          JSON.stringify(seed.variables ?? []),
          JSON.stringify(seed.citations ?? []),
          JSON.stringify(seed.disclosures ?? []),
          "Auto-migration: payment_methods clause + TN § 66-28-301 fix",
        ],
      );
      const newVersionId = (insRes as any).insertId;
      await conn.execute(
        "UPDATE lease_templates SET activeVersionId = ? WHERE id = ?",
        [newVersionId, tpl.id],
      );
      console.log(`NEW  ${seed.state}/${seed.category} — inserted v#${nextVersion} (id=${newVersionId}), activated.`);
    }

    if (rerenderDocId) {
      console.log(`\nRe-rendering lease_documents.id=${rerenderDocId}...`);
      const [docRows] = await conn.execute(
        "SELECT id, templateId, variableValues FROM lease_documents WHERE id = ? LIMIT 1",
        [rerenderDocId],
      );
      const doc = (docRows as any[])[0];
      if (!doc) {
        console.log(`SKIP rerender — doc ${rerenderDocId} not found`);
      } else {
        const [tplRows] = await conn.execute(
          "SELECT activeVersionId FROM lease_templates WHERE id = ? LIMIT 1",
          [doc.templateId],
        );
        const newVerId = (tplRows as any[])[0]?.activeVersionId;
        const [verRows] = await conn.execute(
          "SELECT bodyHtml, citations FROM lease_template_versions WHERE id = ? LIMIT 1",
          [newVerId],
        );
        const ver = (verRows as any[])[0];
        const vars = doc.variableValues ? JSON.parse(doc.variableValues) : {};
        const citations = ver.citations ? JSON.parse(ver.citations) : [];
        const rendered = renderTemplate(ver.bodyHtml, vars, citations);
        await conn.execute(
          "UPDATE lease_documents SET templateVersionId = ?, renderedHtml = ? WHERE id = ?",
          [newVerId, rendered.html, doc.id],
        );
        console.log(`OK rerender — doc ${doc.id} now points at version ${newVerId}, ${rendered.unresolved.length} unresolved vars: ${rendered.unresolved.join(", ") || "(none)"}`);
      }
    }
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
