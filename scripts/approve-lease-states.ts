// Approve (or revoke) state lease templates for landlord use.
//
//   pnpm lease:approve SC VA GA --by "Jane Doe, Esq. (SC Bar #12345)"
//   pnpm lease:approve --revoke SC
//   pnpm lease:approve --status
//
// Approving records today's date, the reviewer, and the hash of the exact
// generated lease text, in shared/leaseStateApprovals.ts. Commit + push to
// make it live. Re-run for a state after its text changes (its approval
// lapses automatically when the hash no longer matches).
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { LEASE_STATE_APPROVALS, type LeaseStateApproval } from "../shared/leaseStateApprovals";
import { allStateProfiles, getStateProfile, isStateApproved, stateTemplateHash } from "../server/leases/states";

const FILE = resolve(import.meta.dirname ?? __dirname, "../shared/leaseStateApprovals.ts");

function render(approvals: Record<string, LeaseStateApproval>): string {
  const lines = Object.keys(approvals).sort().map(code => {
    const a = approvals[code];
    const note = a.note ? `\n    note: ${JSON.stringify(a.note)},` : "";
    return `  ${code}: {\n    approvedOn: ${JSON.stringify(a.approvedOn)},\n    approvedBy: ${JSON.stringify(a.approvedBy)},\n    templateHash: ${JSON.stringify(a.templateHash)},${note}\n  },`;
  });
  return `// BEGIN APPROVALS (rewritten by scripts/approve-lease-states.ts)\nexport const LEASE_STATE_APPROVALS: Record<string, LeaseStateApproval> = {\n${lines.join("\n")}\n};\n// END APPROVALS`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--status") || args.length === 0) {
    for (const p of allStateProfiles()) {
      const a = LEASE_STATE_APPROVALS[p.code];
      const status = isStateApproved(p.code) ? "APPROVED" : a ? "STALE (text changed since approval)" : "not approved";
      console.log(`${p.code}  ${status.padEnd(36)} confidence=${p.confidence}  hash=${stateTemplateHash(p.code)}`);
    }
    return;
  }
  const revoke = args.includes("--revoke");
  const byIdx = args.indexOf("--by");
  const by = byIdx >= 0 ? args[byIdx + 1] : undefined;
  const noteIdx = args.indexOf("--note");
  const note = noteIdx >= 0 ? args[noteIdx + 1] : undefined;
  const skip = new Set<number>();
  for (const idx of [byIdx, noteIdx]) if (idx >= 0) { skip.add(idx); skip.add(idx + 1); }
  const codes = args.filter((a, i) => !a.startsWith("--") && !skip.has(i)).map(c => c.toUpperCase());
  if (codes.length === 0) throw new Error("Name at least one state code.");
  for (const c of codes) if (!getStateProfile(c)) throw new Error(`No lease profile for ${c}`);
  if (!revoke && !by) throw new Error('Say who reviewed the text: --by "Name, Esq."');

  const next: Record<string, LeaseStateApproval> = { ...LEASE_STATE_APPROVALS };
  const today = new Date().toISOString().slice(0, 10);
  for (const c of codes) {
    if (revoke) delete next[c];
    else next[c] = { approvedOn: today, approvedBy: by!, templateHash: stateTemplateHash(c)!, ...(note ? { note } : {}) };
  }
  const src = readFileSync(FILE, "utf8");
  const out = src.replace(/\/\/ BEGIN APPROVALS[\s\S]*?\/\/ END APPROVALS/, render(next));
  if (out === src && !revoke) console.warn("No change written.");
  writeFileSync(FILE, out);
  console.log(`${revoke ? "Revoked" : "Approved"}: ${codes.join(", ")}. Commit and push shared/leaseStateApprovals.ts to make it live.`);
}

main();
