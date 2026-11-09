// State landlord-tenant law profiles.
//
// One StateLawProfile per jurisdiction (50 states + DC) lives in
// server/leases/states/data/<code>.ts. The lease builder
// (server/leases/states/builder.ts) turns a profile into the residential and
// co-living template bodies, so state-specific VALUES live in data and the
// lease WORDING lives in one place.
//
// Writing rules for every text field below:
//   - Every value must come from the primary statute text (legislature site,
//     or a free statute host such as law.justia.com / law.cornell.edu that
//     reproduces the official code). Never from a commercial lease template
//     product, and never from a summary blog alone.
//   - Text fields that end up in the lease are written in lease voice:
//     complete sentences, "Tenant" / "Landlord" capitalised, present tense,
//     no markdown, no HTML. Keep them short and plain-English.
//   - Where the law is unclear or only case law applies, say so in
//     reviewNotes rather than guessing in the lease text.

/** A statutory right that lets the tenant end the lease early without the early termination fee. */
export interface StatutoryTerminationRight {
  /** Short heading, e.g. "Military service (state law)". */
  label: string;
  /** Controlling citation(s), e.g. "N.C. Gen. Stat. § 42-45". */
  cite: string;
  /** Who qualifies — full sentence(s) in lease voice. */
  eligible: string;
  /** Notice the tenant must give and when termination takes effect. */
  notice: string;
  /** Documentation the tenant must provide (empty string if none). */
  documentation: string;
  /** What the tenant still owes (rent proration, damages caps, "no early termination fee"). */
  liability: string;
}

export interface StateDisclosure {
  /** Stable id, e.g. "radon", "mold", "flood_zone", "bed_bugs", "owner_agent_identity". */
  id: string;
  title: string;
  /** Lease-voice text inserted into the lease. Use {{placeholders}} only from KNOWN_PLACEHOLDERS in builder.ts. */
  text: string;
  cite: string;
  /** When it applies, e.g. "Only for properties in a FEMA special flood hazard area" (rendered as a lead-in). */
  condition?: string;
  /**
   * "top_large": statute requires the notice at the top of the first page in a
   * larger font (e.g. Nev. Rev. Stat. § 118A.200(4): at least twice as large as
   * any other font). Rendered above the title at 32px with every other heading
   * in that lease capped at 16px.
   * "top": statute requires it on the first page (e.g. an Illinois or
   * Minnesota page-1 summary). Rendered above the title at normal size.
   */
  placement?: "top_large" | "top";
  /** Statute requires bold and/or underlined type (e.g. Tex. Prop. Code § 92.056(g)). Rendered bold + underlined. */
  emphasis?: "bold_underline";
}

export interface StateLawProfile {
  /** Two-letter postal code ("DC" for the District). */
  code: string;
  name: string;
  /** e.g. "Virginia Residential Landlord and Tenant Act, Va. Code Ann. §§ 55.1-1200 et seq." */
  framework: string;

  deposit: {
    /** Statutory cap in months of rent for a standard unfurnished residential lease; null = no cap. */
    maxMonths: number | null;
    /** Plain-English cap rule including any tiers/exceptions (furnished, age 62+, pets, month-to-month). */
    capRule: string;
    capCite: string | null;
    /** Days the landlord has to return the deposit / itemized deductions after the tenancy ends. */
    returnDays: number;
    /** Lease-voice sentence(s) for the return rule, including itemisation and any trigger (e.g. forwarding address). */
    returnRule: string;
    returnCite: string;
    /** Lease-voice sentence(s) on how the deposit must be held (escrow, separate account, bank disclosure, receipt). Empty string if no statutory rule. */
    holdingRule: string;
    holdingCite: string | null;
    /** True if the statute requires the landlord to pay interest on deposits (statewide). */
    interestRequired: boolean;
    /** Lease-voice sentence on required move-in condition statement/inspection, or empty string if none. */
    moveInInspection: string;
  };

  lateFee: {
    /** Statutory grace period in days before any late fee may be charged; null if the statute sets none. */
    graceDays: number | null;
    /** How the cap is computed. "none" = statute sets no numeric cap (fee must still be reasonable). */
    capType: "none" | "percent" | "flat" | "greater_of" | "lesser_of" | "reasonable";
    /** Percent of monthly rent (e.g. 5 for 5%) when capType uses a percent. */
    capPercent?: number;
    /** Flat dollar amount when capType uses a flat amount. */
    capFlat?: number;
    /** Plain-English cap rule as it should read in the lease, e.g. "may not exceed the greater of $15.00 or 5% of the monthly rent". Empty if none. */
    capRule: string;
    cite: string | null;
  };

  notice: {
    /** Days of written notice to end a month-to-month tenancy (the period the landlord must give, if it differs by party note it in monthToMonthRule). */
    monthToMonthDays: number;
    monthToMonthRule: string;
    monthToMonthCite: string;
    /** Days in the pay-rent-or-quit / demand notice before an eviction filing for nonpayment; null if no statutory period. */
    nonpaymentDays: number | null;
    nonpaymentRule: string;
    nonpaymentCite: string | null;
    /** Hours of advance notice for non-emergency entry; null if statute says only "reasonable" or is silent. */
    entryHours: number | null;
    entryRule: string;
    entryCite: string | null;
  };

  earlyTermination: {
    /** State statute that gives servicemembers lease-termination rights beyond (or restating) the SCRA; null if none. */
    military: StatutoryTerminationRight | null;
    /** Domestic violence / sexual assault / stalking / human trafficking early termination statute; null if none. */
    domesticViolence: StatutoryTerminationRight | null;
    /** Other statutory early termination rights (senior/disability move to care facility, death of tenant, uninhabitable after casualty, etc.). */
    other: StatutoryTerminationRight[];
    /** Statutory cap on an early termination / lease-break fee or liquidated damages, if any. */
    feeCap: { maxMonthsRent: number | null; rule: string; cite: string } | null;
    /** Landlord's duty to mitigate (re-let) when tenant leaves early. */
    mitigation: {
      basis: "statute" | "case_law" | "none" | "unclear";
      cite: string | null;
      /** Lease-voice sentence restating the duty (or, where none, that Landlord will nevertheless credit rent received from a replacement tenant). */
      rule: string;
    };
  };

  /** State-required lease disclosures / clauses (beyond federal lead paint, which the builder always adds). */
  disclosures: StateDisclosure[];

  fairHousing: {
    /** Protected classes under STATE law that go beyond the federal seven (race, color, religion, sex, national origin, familial status, disability). */
    stateClasses: string[];
    cite: string;
  };

  eviction: {
    /** Lease-voice sentence: judicial eviction process name + cite; no self-help. */
    rule: string;
    cite: string;
  };

  /** Landlord's statutory maintenance / habitability duty — lease-voice sentence. */
  habitability: { rule: string; cite: string };

  /**
   * Optional extra lease sections specific to this state (e.g. a statute that
   * requires particular lease language). Lease-voice text, rendered after the
   * standard sections. Most states leave this out.
   */
  additionalClauses?: Array<{ title: string; text: string; cite?: string }>;

  /** Every primary source actually read (full section text), with the URL used. */
  sources: Array<{ cite: string; url: string }>;

  /** Open questions, judgment calls, local-ordinance warnings (e.g. city rent-control or just-cause rules) for the reviewing attorney. */
  reviewNotes: string[];

  /** Researcher's confidence that every value above matches current statute text. */
  confidence: "high" | "medium" | "low";

  /** ISO date the statutes were read. */
  researchedOn: string;
}
