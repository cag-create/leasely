// Which state lease templates are approved for landlords to use.
//
// A state appears in the landlord-facing app (lease wizard, auto-drafted
// leases on application approval, marketing claims) ONLY when it is listed
// here AND its templateHash matches the hash of the lease text the server
// currently generates for that state. Any change to the state's data file or
// to the shared lease wording changes the hash, which takes the state out of
// the app until someone re-approves the new text. A unit test fails if an
// approved hash goes stale, so a stale approval can't ship by accident.
//
// To approve states after review (owner, ideally with an attorney):
//   pnpm lease:approve SC VA GA --by "Jane Doe, Esq. (NC Bar #12345)"
// then commit and push. To withdraw: pnpm lease:approve --revoke SC
// Review packets: docs/lease-review/<code>.md

export interface LeaseStateApproval {
  approvedOn: string;   // ISO date
  approvedBy: string;   // who reviewed the text
  templateHash: string; // hash of the generated residential + co-living text that was approved
  note?: string;
}

// BEGIN APPROVALS (rewritten by scripts/approve-lease-states.ts)
export const LEASE_STATE_APPROVALS: Record<string, LeaseStateApproval> = {
  NC: {
    approvedOn: "2026-11-08",
    approvedBy: "Grandfathered: live before the 2026-11-08 50-state rebuild. Rebuilt text (lease-break clause, statute corrections) pending owner/attorney review.",
    templateHash: "72e793077e97a6cb",
  },
  TN: {
    approvedOn: "2026-11-08",
    approvedBy: "Grandfathered: live before the 2026-11-08 50-state rebuild. Rebuilt text (lease-break clause, statute corrections) pending owner/attorney review.",
    templateHash: "b65228ed2bc889dd",
  },
};
// END APPROVALS

export const APPROVED_LEASE_STATE_CODES: string[] = Object.keys(LEASE_STATE_APPROVALS).sort();

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky",
  LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

/** Short label for tight UI copy: "NC & TN", "NC, SC & TN", or "12 states". */
export function approvedStatesShort(codes: string[] = APPROVED_LEASE_STATE_CODES): string {
  if (codes.length === 0) return "no states yet";
  if (codes.length > 5) return codes.length >= 51 ? "all 50 states + DC" : `${codes.length} states`;
  if (codes.length === 1) return codes[0];
  return `${codes.slice(0, -1).join(", ")} & ${codes[codes.length - 1]}`;
}

/** "North Carolina and Tennessee" / "Alabama, Georgia, and Texas" — for marketing copy. */
export function approvedStatesPhrase(codes: string[] = APPROVED_LEASE_STATE_CODES): string {
  const names = codes.map(c => STATE_NAMES[c] ?? c);
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}
