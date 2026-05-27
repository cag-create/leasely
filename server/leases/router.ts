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
import { updateLeaseAgreement, getLeaseById, getUserById } from "../db";
import { sendEmail, leaseAgreementEmail } from "../_core/email";

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

  // Merge new field values into existing variables and re-render from the
  // stored template version. Used by the inline "Fill Required Fields" panel
  // on the lease preview page.
  fillFields: protectedProcedure
    .input(z.object({
      id: z.number().int().positive(),
      variables: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const doc = await getLeaseDocument(input.id);
      if (!doc || doc.landlordUserId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      // Allow edits through "sent" — the landlord can revise rent/deposit
      // (or any other variable) right up until the tenant signs. Once a
      // signature exists, the document is locked.
      if (doc.status !== "draft" && doc.status !== "sent") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot edit a lease that has been signed" });
      }

      const oldVars: Record<string, unknown> = doc.variableValues ? JSON.parse(doc.variableValues) : {};
      const mergedVars = { ...oldVars, ...input.variables };

      let newHtml = doc.renderedHtml ?? "";
      if (doc.templateVersionId) {
        const tv = await getTemplateVersion(doc.templateVersionId);
        if (tv) {
          const citations: string[] = tv.citations ? JSON.parse(tv.citations) : [];
          const rendered = renderTemplate(tv.bodyHtml, mergedVars as any, citations);
          newHtml = rendered.html;
        }
      }

      await updateLeaseDocument(input.id, {
        variableValues: JSON.stringify(mergedVars),
        renderedHtml: newHtml,
      });

      // Keep the underlying lease_agreements row in sync when the landlord
      // edits monetary fields on the document — otherwise the displayed lease
      // text and the payment links (Stripe, deposit charge) diverge.
      // marketplaceListings/document vars are in DOLLARS; lease_agreements is
      // in CENTS, so multiply by 100 on the way down.
      if (doc.leaseAgreementId) {
        const agreementPatch: { monthlyRent?: number; securityDeposit?: number } = {};
        if (input.variables.monthly_rent !== undefined) {
          const dollars = Number(input.variables.monthly_rent);
          if (Number.isFinite(dollars) && dollars >= 0) agreementPatch.monthlyRent = Math.round(dollars * 100);
        }
        if (input.variables.security_deposit !== undefined) {
          const dollars = Number(input.variables.security_deposit);
          if (Number.isFinite(dollars) && dollars >= 0) agreementPatch.securityDeposit = Math.round(dollars * 100);
        }
        if (Object.keys(agreementPatch).length > 0) {
          await updateLeaseAgreement(doc.leaseAgreementId, ctx.user.id, agreementPatch);
        }
      }

      await logLeaseAudit({
        leaseDocumentId: input.id,
        actorUserId: ctx.user.id,
        event: "draft_edited",
        details: JSON.stringify({ filledFields: Object.keys(input.variables) }),
      });
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

      // Bubble the send up to the parent lease_agreements row so the Leases
      // list (which reads from lease_agreements) stops showing the lease as
      // a "Draft" after it has been sent to the tenant. Also email the
      // tenant the sign-lease link — without this email the tenant has no
      // way to reach the signing page.
      if (doc.leaseAgreementId) {
        await updateLeaseAgreement(doc.leaseAgreementId, ctx.user.id, {
          status: "sent",
          sentAt: new Date() as any,
        });

        const lease = await getLeaseById(doc.leaseAgreementId);
        if (lease) {
          const APP_URL = process.env.VITE_APP_URL ?? "https://leasely.net";
          const landlord = await getUserById(lease.landlordUserId);
          const signUrl = `${APP_URL}/tenant/sign-lease/${lease.id}`;
          sendEmail({
            to: lease.tenantEmail,
            subject: `Your Lease Agreement is Ready — ${lease.propertyAddress}`,
            html: leaseAgreementEmail({
              tenantName: lease.tenantName,
              landlordName: landlord?.name ?? "Your Landlord",
              propertyAddress: lease.propertyAddress,
              state: lease.state,
              monthlyRentDollars: lease.monthlyRent / 100,
              securityDepositDollars: (lease.securityDeposit ?? 0) / 100,
              leaseStartDate: lease.leaseStartDate,
              leaseTerm: lease.leaseTerm ?? "12_months",
              leaseUrl: signUrl,
            }),
          }).catch(() => {});
        }
      }

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
