// Generate attorney/owner review packets for every state lease template.
//
//   pnpm lease:packets
//
// Writes docs/lease-review/README.md (index), docs/lease-review/<CODE>.md
// (statutes read, key values, termination rights, disclosures, open
// questions, approval command) and docs/lease-review/samples/<CODE>-*.html
// (the lease rendered with sample values). Re-run after any data change.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { allStateProfiles, isStateApproved, stateTemplateBody, stateTemplateHash } from "../server/leases/states";
import { protectedRights } from "../server/leases/states/builder";
import { lateFeeCap, earlyTerminationFeeCap } from "../server/leases/states/compute";
import { renderTemplate } from "../server/leases/render";
import { LEASE_STATE_APPROVALS } from "../shared/leaseStateApprovals";
import type { StateLawProfile } from "../server/leases/states/types";

const ROOT = resolve(import.meta.dirname ?? __dirname, "..");
const OUT = resolve(ROOT, "docs/lease-review");
const SAMPLES = resolve(OUT, "samples");
mkdirSync(SAMPLES, { recursive: true });

export const SAMPLE_VARS = {
  landlord_name: "Sample Landlord LLC",
  landlord_address: "100 Main Street, Suite 2",
  tenant_name: "Jordan Sample",
  tenant_email: "jordan@example.com",
  property_address: "123 Sample Ave, Apt 4",
  unit_or_room_label: "Bedroom B",
  occupants: "Tenant only",
  lease_start_date: "2027-01-01",
  lease_term: "12_months",
  monthly_rent: 1500,
  rent_due_day: 1,
  payment_methods: "Keycove online payment (ACH or card)",
  late_fee: 75,
  security_deposit: 1500,
  utilities: "Water and trash",
  pets_allowed: "No",
  parking: "One assigned space",
  co_living_rules: "Quiet hours 10pm-7am. Clean shared kitchen after use.",
};

const yesNo = (b: boolean) => (b ? "Yes" : "No");
const mdEsc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

function packet(p: StateLawProfile): string {
  const rights = protectedRights(p);
  const rent = 1500;
  const lfCap = lateFeeCap(p, rent);
  const etCap = earlyTerminationFeeCap(p, rent);
  const approval = LEASE_STATE_APPROVALS[p.code];
  const status = isStateApproved(p.code) ? `APPROVED (${approval!.approvedOn}, ${approval!.approvedBy})` : approval ? "STALE: text changed since approval, re-approve" : "Not approved (not offered to landlords)";
  return `# ${p.name} (${p.code}): lease review packet

- **Status:** ${status}
- **Template hash:** \`${stateTemplateHash(p.code)}\`
- **Framework:** ${p.framework}
- **Researcher confidence:** ${p.confidence} (statutes read ${p.researchedOn})
- **Sample leases:** [residential](samples/${p.code}-residential.html) · [co-living](samples/${p.code}-coliving.html)

To approve after review: \`pnpm lease:approve ${p.code} --by "Reviewer name, Esq."\` then commit and push.

## Key values used in the lease

| Item | Value | Statute |
|---|---|---|
| Deposit cap | ${p.deposit.maxMonths === null ? "No statutory cap" : `${p.deposit.maxMonths} month(s) rent`}: ${mdEsc(p.deposit.capRule)} | ${p.deposit.capCite ?? "—"} |
| Deposit return | ${p.deposit.returnDays} days: ${mdEsc(p.deposit.returnRule)} | ${p.deposit.returnCite} |
| Deposit holding | ${mdEsc(p.deposit.holdingRule || "No statutory holding rule")} | ${p.deposit.holdingCite ?? "—"} |
| Deposit interest required | ${yesNo(p.deposit.interestRequired)} | |
| Move-in inspection | ${mdEsc(p.deposit.moveInInspection || "No statutory requirement (lease adds a contractual condition report)")} | |
| Late fee grace period | ${p.lateFee.graceDays === null ? "None in statute" : `${p.lateFee.graceDays} days`} | ${p.lateFee.cite ?? "—"} |
| Late fee cap | ${p.lateFee.capType}${lfCap !== null ? ` (= $${lfCap.toFixed(2)} on $1,500 rent)` : ""}: ${mdEsc(p.lateFee.capRule || "No numeric cap; must be reasonable")} | ${p.lateFee.cite ?? "—"} |
| Month-to-month notice | ${p.notice.monthToMonthDays} days: ${mdEsc(p.notice.monthToMonthRule)} | ${p.notice.monthToMonthCite} |
| Nonpayment notice | ${p.notice.nonpaymentDays === null ? "No statutory period" : `${p.notice.nonpaymentDays} days`}: ${mdEsc(p.notice.nonpaymentRule)} | ${p.notice.nonpaymentCite ?? "—"} |
| Entry notice | ${p.notice.entryHours === null ? "No statutory hours" : `${p.notice.entryHours} hours`}: ${mdEsc(p.notice.entryRule)} | ${p.notice.entryCite ?? "—"} |
| Early termination fee cap | ${p.earlyTermination.feeCap ? `${mdEsc(p.earlyTermination.feeCap.rule)}${etCap !== null ? ` (= $${etCap.toFixed(2)} on $1,500 rent)` : ""}` : "None in statute (default fee: 2 months' rent, landlord-editable)"} | ${p.earlyTermination.feeCap?.cite ?? "—"} |
| Duty to mitigate | ${p.earlyTermination.mitigation.basis}: ${mdEsc(p.earlyTermination.mitigation.rule)} | ${p.earlyTermination.mitigation.cite ?? "—"} |
| State fair housing classes (beyond federal) | ${p.fairHousing.stateClasses.length ? p.fairHousing.stateClasses.join(", ") : "None beyond federal"} | ${p.fairHousing.cite} |
| Eviction | ${mdEsc(p.eviction.rule)} | ${p.eviction.cite} |
| Habitability | ${mdEsc(p.habitability.rule)} | ${p.habitability.cite} |

## Early termination rights that override the lease-break fee

${rights.map(r => `### ${r.label}\n*${r.cite}*\n\n- **Who:** ${r.eligible}\n- **Notice:** ${r.notice}\n${r.documentation ? `- **Documentation:** ${r.documentation}\n` : ""}- **Owes:** ${r.liability}\n`).join("\n")}

## State disclosures in the lease

${p.disclosures.length ? p.disclosures.map(d => `- **${d.title}** (${d.cite})${d.condition ? ` *${d.condition}*` : ""}: ${d.text}`).join("\n") : "- None beyond the federal lead-paint disclosure."}
${p.additionalClauses?.length ? `\n## Additional state clauses\n\n${p.additionalClauses.map(c => `- **${c.title}**${c.cite ? ` (${c.cite})` : ""}: ${c.text}`).join("\n")}\n` : ""}
## Open questions for the reviewing attorney

${p.reviewNotes.length ? p.reviewNotes.map(n => `- ${n}`).join("\n") : "- None recorded."}

## Statutes read (full text)

${p.sources.map(s => `- ${s.cite}: ${s.url}`).join("\n")}
- 50 U.S.C. § 3955 (SCRA, applies in every state): https://www.law.cornell.edu/uscode/text/50/3955
`;
}

function sampleHtml(p: StateLawProfile, kind: "residential" | "coliving"): string {
  const r = renderTemplate(stateTemplateBody(p, kind), { ...SAMPLE_VARS, state: p.code }, []);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.code} ${kind} sample lease</title>
<style>body{font-family:Georgia,serif;max-width:820px;margin:24px auto;padding:0 16px;line-height:1.5;color:#111}h1{font-size:1.6em}h2{font-size:1.15em;margin-top:1.6em}.lease-filled{background:#eef6ff}.lease-unresolved{background:#fee;color:#b00020}.legal-disclaimer{font-size:.9em;color:#444;border-top:1px solid #ddd;margin-top:2em}.sample-banner{background:#fff7ed;border:1px solid #f59e0b;padding:8px 12px;font-family:sans-serif;font-size:.9em}</style></head>
<body><p class="sample-banner">SAMPLE for review: rendered with made-up values. Template hash ${stateTemplateHash(p.code)}.${r.warnings.length ? " Warnings: " + r.warnings.join(" ") : ""}</p>${r.html}</body></html>`;
}

const profiles = allStateProfiles();
for (const p of profiles) {
  writeFileSync(resolve(OUT, `${p.code}.md`), packet(p));
  writeFileSync(resolve(SAMPLES, `${p.code}-residential.html`), sampleHtml(p, "residential"));
  writeFileSync(resolve(SAMPLES, `${p.code}-coliving.html`), sampleHtml(p, "coliving"));
}

const rows = profiles.map(p => {
  const et = p.earlyTermination;
  const rightsList = [et.military ? "state military" : null, et.domesticViolence ? "DV" : null, et.other.length ? `${et.other.length} other` : null].filter(Boolean).join(", ") || "SCRA only";
  return `| [${p.code}](${p.code}.md) | ${isStateApproved(p.code) ? "✅ approved" : "⏳ pending"} | ${p.confidence} | ${p.deposit.maxMonths ?? "none"} | ${p.deposit.returnDays} | ${p.lateFee.capType}${p.lateFee.graceDays ? ` / ${p.lateFee.graceDays}d grace` : ""} | ${p.notice.monthToMonthDays} | ${rightsList} | ${et.feeCap ? "yes" : "no"} | ${p.reviewNotes.length} |`;
});

writeFileSync(resolve(OUT, "README.md"), `# Keycove state lease review packets

Every state lease is generated from a data file (\`server/leases/states/data/<code>.ts\`) by one shared builder (\`server/leases/states/builder.ts\`). A state is offered to landlords only after it is approved here **and** its text hash still matches.

## How to approve a batch

1. Read the state's packet (below) and its sample leases (\`samples/\`), ideally with a licensed attorney in that state. The "Open questions" section lists the judgment calls to check first.
2. If anything is wrong, note the change and ask Claude (or a developer) to update that state's data file; the hash changes, so re-review the new sample.
3. When satisfied, approve: \`pnpm lease:approve SC VA GA --by "Jane Doe, Esq. (SC Bar #12345)"\`, then commit and push. Railway redeploys and the states appear in the lease wizard, in auto-drafted leases, and in marketing copy.
4. To withdraw a state: \`pnpm lease:approve --revoke SC\`, commit, push.
5. \`pnpm lease:approve --status\` shows every state's status.

Approval is tied to the exact text. Any later change to a state's data or the shared wording takes it out of the app until it's re-approved, and the test suite fails until then so it can't ship unnoticed.

Every lease includes: the lease-break option (default fee 2 months' rent, default notice 30 days, both editable by the landlord, worded as liquidated damages the tenant may elect); otherwise liability for rent until re-rented, offset by mitigation; and the non-waivable carve-outs (federal SCRA plus that state's military, domestic-violence and other statutory termination rights, and any state cap on termination fees). Keycove's "not legal advice" notice is in every lease.

## Status

| State | Status | Confidence | Deposit cap (months) | Return (days) | Late fee cap | M-to-M notice (days) | Termination rights beyond SCRA | ET fee cap | Open questions |
|---|---|---|---|---|---|---|---|---|---|
${rows.join("\n")}
`);

console.log(`Wrote ${profiles.length} packets to docs/lease-review/`);
