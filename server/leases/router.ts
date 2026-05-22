// tRPC router for the lease template + document system.
//
// Endpoints (all under appRouter.leases):
//   - listTemplates                    (Pro) → templates available for the landlord
//   - getTemplate(state, category)     (Pro) → resolved template + active version
//   - draftFromTemplate(input)         (Pro) → render preview + create lease_documents row
//   - updateDraft(input)               (Pro) → save edits / custom clauses
//   - markDisclaimerAcknowledged(id)   (Pro) → required before send
//   - send(id)                         (Pro) → email tenant signing link
//   - get(id)                          (Pro|tenant token) → fetch document for review/signing
//   - addSignature(input)              (public w/ token | Pro) → record signature
//   - listMine                         (Pro) → all the landlord's lease documents
//   - audit(id)                        (Pro|admin) → audit log
//   - listForAgreement(id)             (Pro) → docs attached to a lease_agreement
//   - listForListing(id)               (Pro) → docs attached to a listing
//   - uploadOwnDraft(input)            (Pro) → create draft from uploaded file metadata
//
// Admin (under appRouter.adminLeaseTemplates):
//   - list / get / preview / saveVersion / activate

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { renderTemplate } from "./render";
import {
  listLeaseTemplates, getLeaseTemplate, getTemplateVersion, listTemplateVersions,
  createTemplateVersion, createLeaseDocument, getLeaseDocument, updateLeaseDocument,
  listLeaseDocumentsByLandlord, listLeaseDocumentsByAgreement, createLeaseSignature,
  listSignaturesForDocument, logLeaseAudit, listLeaseAudit,
} from "./db-helpers";

const STATE_CODE = z.string().regex(/^[A-Z]{2}$|^ALL$/);
const CATEGORY = z.enum(["standard_residential", "coliving_room_rental", "generic"]);

const VARS_SCHEMA = z.object({
  landlord_name: z.string().optional(),
  landlord_address: z.string().optional(),
  tenant_name: z.string().optional(),
  tenant_email: z.string().email().optional(),
  property_address: z.string().optional(),
  property_city: z.string().optional(),
  state: z.string().optional(),
  property_zip: z.string().optional(),
  monthly_rent: z.union([z.number(), z.string()]).optional(),
  security_deposit: z.union([z.number(), z.string()]).optional(),
  lease_start_date: z.string().optional(),
  lease_end_date: z.string().optional(),
  rent_due_day: z.union([z.number(), z.string()]).optional(),
  late_fee: z.union([z.number(), z.string()]).optional(),
  utilities: z.string().optional(),
  pets_allowed: z.union([z.boolean(), z.string()]).optional(),
  parking: z.string().optional(),
  occupants: z.string().optional(),
  co_living_rules: z.string().optional(),
  unit_or_room_label: z.string().optional(),
}).catchall(z.unknown());

export const leasesRouter = router({
  listTemplates: protectedProcedure.query(async () => {
    return listLeaseTemplates();
  }),

  getTemplate: protectedProcedure
    .input(z.object({ state: STATE_CODE, category: CATEGORY }))
    .query(async ({ input }) => {
      const tpl = await getLeaseTemplate(input.state, input.category);
      if (!tpl) {
        // Fall back to the multi-state generic.
        const generic = await getLeaseTemplate("ALL", "generic");
        if (!generic) return null;
        const ver = generic.activeVersionId ? await getTemplateVersion(generic.activeVersionId) : undefined;
        return { template: generic, version: ver, fellBackToGeneric: true };
      }
      const ver = tpl.activeVersionId ? await getTemplateVersion(tpl.activeVersionId) : undefined;
      return { template: tpl, version: ver, fellBackToGeneric: false };
    }),

  preview: protectedProcedure
    .input(z.object({
      templateVersionId: z.number().int().positive(),
      variables: VARS_SCHEMA,
    }))
    .query(async ({ input }) => {
      const ver = await getTemplateVersion(input.templateVersionId);
      if (!ver) throw new TRPCError({ code: "NOT_FOUND", message: "Template version not found" });
      const citations: string[] = ver.citations ? JSON.parse(ver.citations) : [];
      const result = renderTemplate(ver.bodyHtml, input.variables as any, citations);
      return result;
    }),

  draftFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number().int().positive(),
      templateVersionId: z.number().int().positive(),
      leaseAgreementId: z.number().int().positive().optional(),
      variables: VARS_SCHEMA,
      customClauses: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ver = await getTemplateVersion(input.templateVersionId);
      if (!ver) throw new TRPCError({ code: "NOT_FOUND" });
      const citations: string[] = ver.citations ? JSON.parse(ver.citations) : [];
      const rendered = renderTemplate(ver.bodyHtml, input.variables as any, citations);
      const id = await createLeaseDocument({
        landlordUserId: ctx.user.id,
        leaseAgreementId: input.leaseAgreementId,
        source: "template",
        templateId: input.templateId,
        templateVersionId: input.templateVersionId,
        renderedHtml: rendered.html,
        variableValues: JSON.stringify(input.variables),
        customClauses: input.customClauses ? JSON.stringify(input.customClauses) : undefined,
        status: "draft",
      });
      if (id) {
        await logLeaseAudit({
          leaseDocumentId: id, actorUserId: ctx.user.id, event: "draft_created",
          details: JSON.stringify({ templateId: input.templateId, versionId: input.templateVersionId }),
        });
      }
      return { id, warnings: rendered.warnings, unresolved: rendered.unresolved };
    }),

  uploadOwnDraft: protectedProcedure
    .input(z.object({
      uploadedFileUrl: z.string().url(),
      uploadedFilename: z.string(),
      uploadedMimeType: z.string(),
      leaseAgreementId: z.number().int().positive().optional(),
      variables: VARS_SCHEMA.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await createLeaseDocument({
        landlordUserId: ctx.user.id,
        leaseAgreementId: input.leaseAgreementId,
        source: "uploaded",
        uploadedFileUrl: input.uploadedFileUrl,
        uploadedFilename: input.uploadedFilename,
        uploadedMimeType: input.uploadedMimeType,
        variableValues: input.variables ? JSON.stringify(input.variables) : undefined,
        status: "draft",
      });
      if (id) {
        await logLeaseAudit({
          leaseDocumentId: id, actorUserId: ctx.user.id, event: "draft_created",
          details: JSON.stringify({ source: "uploaded", filename: input.uploadedFilename }),
        });
      }
      return { id };
    }),

  updateDraft: protectedProcedure
    .input(z.object({
      id: z.number().int().positive(),
      variables: VARS_SCHEMA.optional(),
      customClauses: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
      renderedHtml: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const doc = await getLeaseDocument(input.id);
      if (!doc || doc.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (doc.status !== "draft") throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot edit a non-draft document" });
      await updateLeaseDocument(input.id, {
        variableValues: input.variables ? JSON.stringify(input.variables) : undefined,
        customClauses: input.customClauses ? JSON.stringify(input.customClauses) : undefined,
        renderedHtml: input.renderedHtml ?? doc.renderedHtml ?? undefined,
      });
      await logLeaseAudit({ leaseDocumentId: input.id, actorUserId: ctx.user.id, event: "draft_edited" });
      return { ok: true };
    }),

  markDisclaimerAcknowledged: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await getLeaseDocument(input.id);
      if (!doc || doc.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      await updateLeaseDocument(input.id, { legalDisclaimerAcknowledgedAt: new Date() as any });
      await logLeaseAudit({ leaseDocumentId: input.id, actorUserId: ctx.user.id, event: "disclaimer_acknowledged" });
      return { ok: true };
    }),

  send: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await getLeaseDocument(input.id);
      if (!doc || doc.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (!doc.legalDisclaimerAcknowledgedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Legal disclaimer must be acknowledged before sending" });
      }
      await updateLeaseDocument(input.id, { status: "sent" });
      await logLeaseAudit({ leaseDocumentId: input.id, actorUserId: ctx.user.id, event: "lease_sent" });
      return { ok: true };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const doc = await getLeaseDocument(input.id);
      if (!doc || doc.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      const sigs = await listSignaturesForDocument(input.id);
      return { document: doc, signatures: sigs };
    }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    return listLeaseDocumentsByLandlord(ctx.user.id);
  }),

  listForAgreement: protectedProcedure
    .input(z.object({ leaseAgreementId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return listLeaseDocumentsByAgreement(input.leaseAgreementId);
    }),

  addSignature: publicProcedure
    .input(z.object({
      leaseDocumentId: z.number().int().positive(),
      party: z.enum(["landlord", "tenant", "guarantor"]),
      signerName: z.string().min(1),
      signerEmail: z.string().email(),
      signatureImage: z.string().optional(),
      typedName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const doc = await getLeaseDocument(input.leaseDocumentId);
      if (!doc) throw new TRPCError({ code: "NOT_FOUND" });
      const ip = ctx.req?.ip ?? ctx.req?.socket?.remoteAddress;
      const ua = ctx.req?.headers?.["user-agent"];
      await createLeaseSignature({
        leaseDocumentId: input.leaseDocumentId,
        party: input.party,
        signerName: input.signerName,
        signerEmail: input.signerEmail,
        signatureImage: input.signatureImage,
        typedName: input.typedName,
        ipAddress: ip,
        userAgent: typeof ua === "string" ? ua : undefined,
      });
      const allSigs = await listSignaturesForDocument(input.leaseDocumentId);
      const hasTenant = allSigs.some(s => s.party === "tenant");
      const hasLandlord = allSigs.some(s => s.party === "landlord");
      const newStatus = hasTenant && hasLandlord ? "fully_signed" : "partially_signed";
      await updateLeaseDocument(input.leaseDocumentId, { status: newStatus });
      await logLeaseAudit({
        leaseDocumentId: input.leaseDocumentId,
        actorUserId: ctx.user?.id,
        event: input.party === "tenant" ? "tenant_signed" : input.party === "landlord" ? "landlord_signed" : "guarantor_signed",
        ipAddress: ip,
      });
      return { ok: true, status: newStatus };
    }),

  audit: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const doc = await getLeaseDocument(input.id);
      if (!doc) throw new TRPCError({ code: "NOT_FOUND" });
      const isOwner = doc.landlordUserId === ctx.user.id;
      const isAdmin = ctx.user.role === "admin";
      if (!isOwner && !isAdmin) throw new TRPCError({ code: "FORBIDDEN" });
      return listLeaseAudit(input.id);
    }),
});

// ─── Admin template editor ─────────────────────────────────────────────────

function assertAdmin(ctx: any) {
  if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
}

export const adminLeaseTemplatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    assertAdmin(ctx);
    return listLeaseTemplates();
  }),

  versions: protectedProcedure
    .input(z.object({ templateId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      return listTemplateVersions(input.templateId);
    }),

  saveVersion: protectedProcedure
    .input(z.object({
      templateId: z.number().int().positive(),
      bodyHtml: z.string().min(1),
      variables: z.array(z.string()),
      citations: z.array(z.string()),
      disclosures: z.array(z.string()),
      changeNote: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const versionId = await createTemplateVersion({
        templateId: input.templateId,
        bodyHtml: input.bodyHtml,
        variables: input.variables,
        citations: input.citations,
        disclosures: input.disclosures,
        changeNote: input.changeNote,
        createdByUserId: ctx.user.id,
      });
      await logLeaseAudit({
        actorUserId: ctx.user.id, event: "template_edited",
        details: JSON.stringify({ templateId: input.templateId, versionId }),
      });
      return { versionId };
    }),

  preview: protectedProcedure
    .input(z.object({
      templateVersionId: z.number().int().positive(),
      variables: VARS_SCHEMA,
    }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const ver = await getTemplateVersion(input.templateVersionId);
      if (!ver) throw new TRPCError({ code: "NOT_FOUND" });
      const citations: string[] = ver.citations ? JSON.parse(ver.citations) : [];
      return renderTemplate(ver.bodyHtml, input.variables as any, citations);
    }),
});
