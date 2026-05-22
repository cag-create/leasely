// DB helpers for lease templates, documents, signatures, and audit logs.
//
// Kept in this dedicated module instead of server/db.ts so adding template
// CRUD doesn't bloat the main DB file. All helpers go through getDb() and
// return undefined / [] when the DB is unreachable, matching the rest of the
// codebase's tolerant-of-missing-DB pattern.

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  leaseTemplates, leaseTemplateVersions, leaseDocuments, leaseSignatures, leaseAuditLogs,
  type LeaseTemplate, type LeaseTemplateVersion, type LeaseDocument, type LeaseSignature,
  type InsertLeaseDocument, type InsertLeaseSignature, type InsertLeaseAuditLog,
} from "../../drizzle/schema";
import { SEED_TEMPLATES } from "./seed-templates";

// ─── Templates ──────────────────────────────────────────────────────────────

export async function listLeaseTemplates(): Promise<LeaseTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaseTemplates).where(eq(leaseTemplates.isActive, 1));
}

export async function getLeaseTemplate(state: string, category: LeaseTemplate["category"]): Promise<LeaseTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(leaseTemplates)
    .where(and(eq(leaseTemplates.state, state), eq(leaseTemplates.category, category), eq(leaseTemplates.isActive, 1)))
    .limit(1);
  return rows[0];
}

export async function getTemplateVersion(versionId: number): Promise<LeaseTemplateVersion | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(leaseTemplateVersions).where(eq(leaseTemplateVersions.id, versionId)).limit(1);
  return rows[0];
}

export async function listTemplateVersions(templateId: number): Promise<LeaseTemplateVersion[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaseTemplateVersions)
    .where(eq(leaseTemplateVersions.templateId, templateId))
    .orderBy(desc(leaseTemplateVersions.version));
}

export async function createTemplateVersion(input: {
  templateId: number;
  bodyHtml: string;
  variables: string[];
  citations: string[];
  disclosures: string[];
  changeNote?: string;
  createdByUserId?: number;
}): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await db.select().from(leaseTemplateVersions).where(eq(leaseTemplateVersions.templateId, input.templateId));
  const nextVersion = existing.length + 1;
  const result: any = await db.insert(leaseTemplateVersions).values({
    templateId: input.templateId,
    version: nextVersion,
    bodyHtml: input.bodyHtml,
    variables: JSON.stringify(input.variables),
    citations: JSON.stringify(input.citations),
    disclosures: JSON.stringify(input.disclosures),
    changeNote: input.changeNote,
    createdByUserId: input.createdByUserId,
  });
  const insertId = (result?.insertId ?? result?.[0]?.insertId) as number | undefined;
  if (insertId) {
    await db.update(leaseTemplates).set({ activeVersionId: insertId }).where(eq(leaseTemplates.id, input.templateId));
  }
  return insertId;
}

/**
 * Seed the lease_templates and lease_template_versions tables from
 * server/leases/seed-templates.ts. Idempotent: only inserts rows that
 * don't already exist. Admin edits made later are NOT overwritten — the
 * seed checks for the presence of an active version and skips if found.
 */
export async function seedLeaseTemplatesIfEmpty(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  for (const seed of SEED_TEMPLATES) {
    const existing = await db.select().from(leaseTemplates)
      .where(and(eq(leaseTemplates.state, seed.state), eq(leaseTemplates.category, seed.category)))
      .limit(1);
    let templateId: number;
    if (existing.length === 0) {
      const ins: any = await db.insert(leaseTemplates).values({
        state: seed.state,
        category: seed.category,
        name: seed.name,
        description: seed.description,
        isActive: 1,
      });
      templateId = (ins?.insertId ?? ins?.[0]?.insertId) as number;
      if (!templateId) continue;
    } else {
      templateId = existing[0].id;
      if (existing[0].activeVersionId) continue; // already has a version — don't clobber admin edits
    }
    await createTemplateVersion({
      templateId,
      bodyHtml: seed.bodyHtml,
      variables: seed.variables,
      citations: seed.citations,
      disclosures: seed.disclosures,
      changeNote: "Initial seed",
    });
  }
}

// ─── Documents ──────────────────────────────────────────────────────────────

export async function createLeaseDocument(input: InsertLeaseDocument): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result: any = await db.insert(leaseDocuments).values(input);
  return (result?.insertId ?? result?.[0]?.insertId) as number | undefined;
}

export async function getLeaseDocument(id: number): Promise<LeaseDocument | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(leaseDocuments).where(eq(leaseDocuments.id, id)).limit(1);
  return rows[0];
}

export async function updateLeaseDocument(id: number, patch: Partial<InsertLeaseDocument>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(leaseDocuments).set(patch).where(eq(leaseDocuments.id, id));
}

export async function listLeaseDocumentsByLandlord(landlordUserId: number): Promise<LeaseDocument[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaseDocuments).where(eq(leaseDocuments.landlordUserId, landlordUserId)).orderBy(desc(leaseDocuments.createdAt));
}

export async function listLeaseDocumentsByAgreement(leaseAgreementId: number): Promise<LeaseDocument[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaseDocuments).where(eq(leaseDocuments.leaseAgreementId, leaseAgreementId)).orderBy(desc(leaseDocuments.createdAt));
}

// ─── Signatures ─────────────────────────────────────────────────────────────

export async function createLeaseSignature(input: InsertLeaseSignature): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result: any = await db.insert(leaseSignatures).values(input);
  return (result?.insertId ?? result?.[0]?.insertId) as number | undefined;
}

export async function listSignaturesForDocument(leaseDocumentId: number): Promise<LeaseSignature[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaseSignatures).where(eq(leaseSignatures.leaseDocumentId, leaseDocumentId));
}

// ─── Audit log ──────────────────────────────────────────────────────────────

export async function logLeaseAudit(input: InsertLeaseAuditLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(leaseAuditLogs).values(input);
}

export async function listLeaseAudit(leaseDocumentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaseAuditLogs)
    .where(eq(leaseAuditLogs.leaseDocumentId, leaseDocumentId))
    .orderBy(desc(leaseAuditLogs.createdAt));
}
