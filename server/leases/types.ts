// Shared types for the state-specific lease engine.
//
// LEGAL_REVIEW: All templates under server/leases/templates/ are starting
// drafts grounded in cited statutes. Each Pro customer should have a
// licensed attorney in the applicable state review before relying on them
// in litigation. Statute citations are embedded in template comments and
// (where appropriate) in the rendered lease itself.

export type LeaseTenancyType =
  | "residential"          // standard residential lease (NC GS Ch. 42, TN Title 66 Ch. 28)
  | "coliving_membership"; // membership/occupancy agreement (intentionally non-tenancy framing)

export type SupportedState = "NC" | "TN";

export interface LeaseRenderInput {
  // Parties
  landlordName: string;
  landlordAddress?: string;
  tenantName: string;
  tenantEmail?: string;

  // Property
  propertyAddress: string;
  propertyCity: string;
  propertyState: SupportedState | string; // string allows fall-through to generic template
  propertyZip: string;

  // Terms
  monthlyRent: number;          // dollars
  securityDeposit: number;      // dollars
  startDate: string;            // ISO date (yyyy-mm-dd)
  endDate?: string;             // ISO date — undefined = month-to-month
  rentDueDay?: number;          // day of month rent due (default 1)

  // Optional flags
  petFriendly?: boolean;
  petDeposit?: number;
  utilitiesIncluded?: string;   // e.g. "water, trash"
  parkingIncluded?: boolean;

  // Co-living only
  isCoLiving?: boolean;
  unitOrRoomLabel?: string;     // e.g. "Bedroom B" in a shared unit

  // Move-in / access
  accessMethod?: "lockbox" | "smart_lock" | "in_person" | "mail";
  lockboxCode?: string;
}

export interface RenderedLease {
  html: string;
  state: SupportedState | "GENERIC";
  tenancyType: LeaseTenancyType;
  citations: string[]; // statute references used (for landlord's records)
  needsAttorneyReview: boolean;
}
