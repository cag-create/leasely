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
  AK: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "181fd68c6a56de0e",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  AL: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "dc804befebd5ab33",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  AR: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "6f14a6f899effe66",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  AZ: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "3e3f6a3a9515f064",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  CA: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "0b854a82414cfe5d",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  CO: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "ba78478355c18223",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  CT: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "7329ebe554eea52f",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  DC: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "0f88941fc3c2beee",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  DE: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "3b90539223b68415",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  FL: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "ac5a582414540785",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  GA: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "57898bb0d200aa37",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  HI: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "1c5ce3d792ff98ca",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  IA: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "aab7eae4d4bd67fc",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  ID: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "246043527a7a7a0c",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  IL: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "2e5a60e39e2af8a2",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  IN: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "cda641ab4421aa27",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  KS: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "fe82ada6365061a0",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  KY: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "e650d1d0886a4db3",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  LA: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "0e958c2c08ec7362",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  MA: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "7d647be51b461e04",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  MD: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "10dca4c65f8c427d",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  ME: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "24bd5eadde713e92",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  MI: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "eba84eefb67b63a6",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  MN: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "ef7da2f67aa427f0",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  MO: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "acc07337bfbb3d5e",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  MS: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "1dfd02b9318ffaad",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  MT: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "61b9553d46c4e403",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  NC: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "72e793077e97a6cb",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  ND: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "fce667777ea6113c",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  NE: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "1d2c06951a273099",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  NH: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "4def877e153aa5bf",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  NJ: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "4c7818427a8b4d8d",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  NM: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "c62de470e6581d13",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  NV: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "4c55c51cac4df523",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  NY: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "ca1b8163d6b4fa50",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  OH: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "d3172d6677d27d77",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  OK: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "d788af5a348c6264",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  OR: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "fe5518f6c493a426",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  PA: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "c81ebdf7062d9059",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  RI: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "7c3786c6b79b3c06",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  SC: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "e11999921160eab9",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  SD: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "a5cbb1c68e173d91",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  TN: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "b65228ed2bc889dd",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  TX: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "6afd2b89cf87fc15",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  UT: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "cdfdc3301f336a2a",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  VA: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "341a4860753bc137",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  VT: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "3f8c382e3122bac1",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  WA: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "d2bf90bf7ed69987",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  WI: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "3aff7189d9c5eab7",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  WV: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "eb38324878ecdf2e",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
  },
  WY: {
    approvedOn: "2026-11-13",
    approvedBy: "Chad Glover, owner (Keycove / Leasely LLC)",
    templateHash: "6adfa12295a7fec6",
    note: "Owner-approved for launch from the per-state review packets (values read from primary statute text). Every template carries the not-a-law-firm notice; landlords may upload their own lease. Attorney review recommended before scaling; re-approve if any template text changes.",
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
