// State lease registry: profiles → generated templates, approval checks.
import { createHash } from "node:crypto";
import type { StateLawProfile } from "./types";
import { buildLeaseBody, collectCitations, TEMPLATE_VARIABLES, type LeaseKind } from "./builder";
import { LEASE_STATE_APPROVALS } from "@shared/leaseStateApprovals";
import { ALL_PROFILES } from "./data";

export type { StateLawProfile } from "./types";

const BY_CODE = new Map<string, StateLawProfile>(ALL_PROFILES.map(p => [p.code, p]));

export function getStateProfile(code: string | undefined | null): StateLawProfile | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code.trim().toUpperCase());
}

export function allStateProfiles(): StateLawProfile[] {
  return [...ALL_PROFILES].sort((a, b) => a.code.localeCompare(b.code));
}

const bodyCache = new Map<string, string>();
export function stateTemplateBody(profile: StateLawProfile, kind: LeaseKind): string {
  const key = `${profile.code}:${kind}`;
  let body = bodyCache.get(key);
  if (!body) {
    body = buildLeaseBody(profile, kind);
    bodyCache.set(key, body);
  }
  return body;
}

/** Hash of the exact generated text (residential + co-living) a reviewer approves. */
export function stateTemplateHash(code: string): string | undefined {
  const profile = getStateProfile(code);
  if (!profile) return undefined;
  return createHash("sha256")
    .update(stateTemplateBody(profile, "residential"))
    .update("\n---coliving---\n")
    .update(stateTemplateBody(profile, "coliving"))
    .digest("hex")
    .slice(0, 16);
}

/** True only when the state is approved AND the approved text is what we generate today. */
export function isStateApproved(code: string | undefined | null): boolean {
  if (!code) return false;
  const c = code.trim().toUpperCase();
  const approval = LEASE_STATE_APPROVALS[c];
  if (!approval) return false;
  return approval.templateHash === stateTemplateHash(c);
}

export function approvedStateCodes(): string[] {
  return allStateProfiles().map(p => p.code).filter(isStateApproved);
}

export interface GeneratedSeed {
  state: string;
  category: "standard_residential" | "coliving_room_rental";
  name: string;
  description: string;
  bodyHtml: string;
  variables: string[];
  citations: string[];
  disclosures: string[];
}

export function generatedSeedTemplates(): GeneratedSeed[] {
  const out: GeneratedSeed[] = [];
  for (const profile of allStateProfiles()) {
    const citations = collectCitations(profile);
    const disclosures = ["federal_lead_paint", ...profile.disclosures.map(d => d.id)];
    out.push({
      state: profile.code,
      category: "standard_residential",
      name: `${profile.name} Residential Lease`,
      description: `Residential lease generated from ${profile.framework}. Includes the early termination (lease-break) option and statutory termination rights.`,
      bodyHtml: stateTemplateBody(profile, "residential"),
      variables: TEMPLATE_VARIABLES.residential,
      citations,
      disclosures,
    });
    out.push({
      state: profile.code,
      category: "coliving_room_rental",
      name: `${profile.name} Co-Living / Room Rental Agreement`,
      description: `Room rental in a shared residence under ${profile.name} law. Does NOT bypass eviction procedure.`,
      bodyHtml: stateTemplateBody(profile, "coliving"),
      variables: TEMPLATE_VARIABLES.coliving,
      citations,
      disclosures,
    });
  }
  return out;
}
