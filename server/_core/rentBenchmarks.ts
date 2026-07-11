/**
 * Rent Benchmarks — automated nationwide rent intelligence.
 *
 * Pulls from free public data sources on a monthly cadence and stores
 * per-zip snapshots so the marketplace can show "Below FMR" / "Above
 * market" / "Typical for the area" signals without any manual CSV upload.
 *
 * Sources:
 *  • Census ACS B25064 (median gross rent) — nationwide ZCTA coverage.
 *    No API key required for < 500 calls/day; free key supported via
 *    CENSUS_API_KEY for higher volume. We make 1 call per state (51 calls).
 *  • HUD Fair Market Rents — published annually for the upcoming fiscal
 *    year. Requires a free token (HUD_API_TOKEN). Optional; if absent
 *    the ACS data still works on its own.
 *
 * Idempotent: each refresh upserts by zip, then appends a row to the
 * history table for trend analysis. Failures are logged to
 * rent_benchmark_runs so the admin dashboard can surface them.
 *
 * Cadence:
 *  • On server boot: if the last successful run is older than 27 days,
 *    fire a refresh in the background.
 *  • Every 30 days thereafter: setInterval re-checks.
 *  • Manual: `POST /api/admin/rent-benchmarks/refresh` (admin-only tRPC).
 *
 * This file is intentionally self-contained — no UI imports, safe to
 * call from server boot, cron, or a tRPC mutation.
 */

import { sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  rentBenchmarks,
  rentBenchmarkHistory,
  rentBenchmarkRuns,
  marketplaceListings,
  type InsertRentBenchmark,
  type InsertRentBenchmarkHistory,
} from "../../drizzle/schema";

// US state FIPS codes (DC + Puerto Rico included). ACS uses these as the
// "in=state:XX" filter. The Census API is faster + more reliable when
// you query per-state instead of asking for all 33k ZCTAs at once.
const STATE_FIPS = [
  "01","02","04","05","06","08","09","10","11","12","13","15","16","17","18",
  "19","20","21","22","23","24","25","26","27","28","29","30","31","32","33",
  "34","35","36","37","38","39","40","41","42","44","45","46","47","48","49",
  "50","51","53","54","55","56","72",
];

const STATE_FIPS_TO_ABBR: Record<string, string> = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT",
  "10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL",
  "18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD",
  "25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE",
  "32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND",
  "39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD",
  "47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV",
  "55":"WI","56":"WY","72":"PR",
};

// Census publishes ACS 5-year in early December each year for the prior
// calendar year. We default to (currentYear - 2) so the request always
// resolves; bump explicitly when the December release lands.
function defaultAcsYear(): number {
  const now = new Date();
  // Through November, last published is `year - 2`. After December 1, jump
  // to `year - 1`. Safe even if Census slips — we just retry next month.
  return now.getMonth() >= 11 ? now.getFullYear() - 1 : now.getFullYear() - 2;
}

// Bounded fetch with timeout + retries — Census and HUD are usually fast
// but occasionally drop requests. 3 attempts with exponential backoff.
async function safeFetch(url: string, init?: RequestInit, attempts = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function startRun(source: "acs" | "hud" | "leasely"): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(rentBenchmarkRuns).values({
    source,
    status: "running",
    rowsUpserted: 0,
  });
  // mysql2 returns { insertId } at result[0].insertId
  return result?.[0]?.insertId ?? result?.insertId ?? null;
}

async function finishRun(
  runId: number | null,
  status: "success" | "failed",
  rowsUpserted: number,
  errorMessage?: string,
) {
  if (!runId) return;
  const db = await getDb();
  if (!db) return;
  try {
    await db.execute(sql`
      UPDATE rent_benchmark_runs
      SET status = ${status},
          rowsUpserted = ${rowsUpserted},
          errorMessage = ${errorMessage ?? null},
          finishedAt = CURRENT_TIMESTAMP
      WHERE id = ${runId}
    `);
  } catch (e) {
    console.warn("[rentBenchmarks] failed to finalize run row:", e);
  }
}

// ── Census ACS B25064 (median gross rent by ZCTA) ─────────────────────────────

/**
 * Fetches median gross rent for every ZCTA in the country, one state at
 * a time. ACS returns: [ ["NAME","B25064_001E","B25064_001M","state","zip code tabulation area"], … ]
 *
 * Returns the number of zip rows upserted.
 */
export async function refreshAcsRentBenchmarks(): Promise<{ rowsUpserted: number; errors: string[] }> {
  const runId = await startRun("acs");
  const db = await getDb();
  if (!db) {
    await finishRun(runId, "failed", 0, "database not available");
    return { rowsUpserted: 0, errors: ["database not available"] };
  }

  const year = defaultAcsYear();
  const apiKey = process.env.CENSUS_API_KEY;
  const errors: string[] = [];
  let totalUpserts = 0;

  try {
    for (const statefp of STATE_FIPS) {
      const url = new URL(`https://api.census.gov/data/${year}/acs/acs5`);
      url.searchParams.set("get", "NAME,B25064_001E,B25064_001M");
      url.searchParams.set("for", "zip code tabulation area:*");
      url.searchParams.set("in", `state:${statefp}`);
      if (apiKey) url.searchParams.set("key", apiKey);

      let rows: string[][];
      try {
        const res = await safeFetch(url.toString());
        rows = (await res.json()) as string[][];
      } catch (e: any) {
        errors.push(`state ${statefp}: ${e?.message ?? "fetch failed"}`);
        continue;
      }
      if (!Array.isArray(rows) || rows.length < 2) continue;

      // First row is the header; drop it.
      const data = rows.slice(1);
      const stateAbbr = STATE_FIPS_TO_ABBR[statefp] ?? "??";
      const now = new Date();

      // Batch upserts in chunks of 500 so MySQL doesn't choke on packet size.
      const CHUNK = 500;
      for (let i = 0; i < data.length; i += CHUNK) {
        const slice = data.slice(i, i + CHUNK);
        const values: InsertRentBenchmark[] = [];
        const historyValues: InsertRentBenchmarkHistory[] = [];

        for (const row of slice) {
          // row = [NAME, B25064_001E, B25064_001M, state, zcta]
          const rent = parseInt(row[1] ?? "", 10);
          const moe = parseInt(row[2] ?? "", 10);
          const zip = row[4]?.padStart(5, "0");
          if (!zip || zip.length !== 5 || isNaN(rent) || rent <= 0) continue;

          values.push({
            zip,
            state: stateAbbr,
            acsMedianRent: rent,
            acsMarginOfError: isNaN(moe) ? null : moe,
            acsDataYear: year,
            acsRefreshedAt: now,
          });
          historyValues.push({
            zip,
            source: "acs",
            bedrooms: "all",
            rent,
            dataYear: year,
          });
        }

        if (values.length === 0) continue;

        // Upsert: insert or update the ACS-derived columns. We deliberately
        // do NOT touch the HUD columns here so the two pipelines stay
        // independent — one source going dark shouldn't clobber the other.
        try {
          await db
            .insert(rentBenchmarks)
            .values(values)
            .onDuplicateKeyUpdate({
              set: {
                state: sql`VALUES(state)`,
                acsMedianRent: sql`VALUES(acsMedianRent)`,
                acsMarginOfError: sql`VALUES(acsMarginOfError)`,
                acsDataYear: sql`VALUES(acsDataYear)`,
                acsRefreshedAt: sql`VALUES(acsRefreshedAt)`,
              },
            });
          await db.insert(rentBenchmarkHistory).values(historyValues);
          totalUpserts += values.length;
        } catch (e: any) {
          errors.push(`state ${statefp} chunk ${i}: ${e?.message ?? "upsert failed"}`);
        }
      }
    }

    await finishRun(runId, "success", totalUpserts, errors.length ? errors.slice(0, 5).join("; ") : undefined);
    return { rowsUpserted: totalUpserts, errors };
  } catch (e: any) {
    await finishRun(runId, "failed", totalUpserts, e?.message ?? "unknown error");
    return { rowsUpserted: totalUpserts, errors: [...errors, e?.message ?? "unknown error"] };
  }
}

// ── HUD Fair Market Rents (optional, requires HUD_API_TOKEN) ──────────────────

/**
 * HUD publishes FMRs per HUD Metro FMR Area, not per zip. Their public
 * API exposes data per state. We rely on the HUD ZIP→Metro crosswalk for
 * mapping, which is also exposed via the API.
 *
 * No-op (returns 0) if HUD_API_TOKEN isn't configured — ACS still gives
 * us nationwide coverage on its own.
 */
export async function refreshHudFmrs(): Promise<{ rowsUpserted: number; errors: string[] }> {
  const token = process.env.HUD_API_TOKEN;
  if (!token) {
    return { rowsUpserted: 0, errors: ["HUD_API_TOKEN not set — skipping HUD refresh"] };
  }
  const runId = await startRun("hud");
  const db = await getDb();
  if (!db) {
    await finishRun(runId, "failed", 0, "database not available");
    return { rowsUpserted: 0, errors: ["database not available"] };
  }

  const errors: string[] = [];
  let totalUpserts = 0;
  const year = new Date().getFullYear(); // HUD publishes for the upcoming FY

  try {
    // For now, pull FMRs at the *state* granularity using HUD's listing
    // endpoint. Zip-level mapping via the zip-crosswalk endpoint can be
    // layered on in a follow-up; ACS already gives us per-zip coverage,
    // and the state-level HUD data is useful as a metro-area sanity check.
    for (const statefp of STATE_FIPS) {
      const stateAbbr = STATE_FIPS_TO_ABBR[statefp];
      if (!stateAbbr) continue;
      const url = `https://www.huduser.gov/hudapi/public/fmr/data/${stateAbbr}?year=${year}`;
      let body: any;
      try {
        const res = await safeFetch(url, { headers: { Authorization: `Bearer ${token}` } });
        body = await res.json();
      } catch (e: any) {
        errors.push(`HUD ${stateAbbr}: ${e?.message ?? "fetch failed"}`);
        continue;
      }

      const counties: any[] = body?.data?.counties ?? body?.data ?? [];
      if (!Array.isArray(counties) || counties.length === 0) continue;

      // We store HUD FMRs against a synthetic "ZIP" = first 5 of countyFips
      // padded to 5 chars; this isn't a real zip but lets us co-locate
      // county-level HUD data without a second table. Once we wire the
      // zip↔county crosswalk, this becomes per-zip.
      const now = new Date();
      const values: InsertRentBenchmark[] = [];
      for (const c of counties) {
        const fips = String(c?.fips_code ?? "").padStart(10, "0").slice(0, 5);
        if (!fips || fips === "00000") continue;
        values.push({
          zip: fips, // temporary — will be replaced when zip crosswalk lands
          state: stateAbbr,
          countyFips: fips,
          hudFmrStudio: parseIntOrNull(c?.["Efficiency"]),
          hudFmr1br: parseIntOrNull(c?.["One-Bedroom"]),
          hudFmr2br: parseIntOrNull(c?.["Two-Bedroom"]),
          hudFmr3br: parseIntOrNull(c?.["Three-Bedroom"]),
          hudFmr4br: parseIntOrNull(c?.["Four-Bedroom"]),
          hudDataYear: year,
          hudRefreshedAt: now,
        });
      }

      if (values.length === 0) continue;

      try {
        await db
          .insert(rentBenchmarks)
          .values(values)
          .onDuplicateKeyUpdate({
            set: {
              countyFips: sql`VALUES(countyFips)`,
              hudFmrStudio: sql`VALUES(hudFmrStudio)`,
              hudFmr1br: sql`VALUES(hudFmr1br)`,
              hudFmr2br: sql`VALUES(hudFmr2br)`,
              hudFmr3br: sql`VALUES(hudFmr3br)`,
              hudFmr4br: sql`VALUES(hudFmr4br)`,
              hudDataYear: sql`VALUES(hudDataYear)`,
              hudRefreshedAt: sql`VALUES(hudRefreshedAt)`,
            },
          });
        totalUpserts += values.length;
      } catch (e: any) {
        errors.push(`HUD upsert ${stateAbbr}: ${e?.message ?? "failed"}`);
      }
    }

    await finishRun(runId, "success", totalUpserts, errors.length ? errors.slice(0, 5).join("; ") : undefined);
    return { rowsUpserted: totalUpserts, errors };
  } catch (e: any) {
    await finishRun(runId, "failed", totalUpserts, e?.message ?? "unknown error");
    return { rowsUpserted: totalUpserts, errors: [...errors, e?.message ?? "unknown error"] };
  }
}

function parseIntOrNull(v: unknown): number | null {
  const n = parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10);
  return isNaN(n) || n <= 0 ? null : n;
}

// ── Keycove's own active-listing medians (third source) ───────────────────────

/**
 * Aggregate active marketplace_listings by zip, compute median monthly
 * rent, and upsert into rent_benchmarks.{leaselyMedianRent,leaselyListingCount}.
 *
 * Unlike ACS (annual government data) and HUD (annual federal data), this
 * is OUR proprietary signal — what landlords are *actually asking* on the
 * Keycove marketplace right now. Refreshed weekly because listings move
 * faster than government data; daily would be overkill given how many
 * new listings get added.
 *
 * Note on units: marketplace_listings.monthlyRent is whole dollars,
 * matching ACS B25064 ("median gross rent" in dollars). HUD FMRs are also
 * dollars. All three sources are unit-compatible — the UI can compare
 * them directly.
 *
 * Statistical caution: we record `leaselyListingCount` alongside the
 * median so consumers can disregard noisy single-listing zips. Median
 * (not mean) handles outliers gracefully (one $20k penthouse won't skew
 * a typical neighborhood).
 */
export async function refreshKeycoveListingBenchmarks(): Promise<{ rowsUpserted: number; errors: string[] }> {
  const runId = await startRun("leasely");
  const db = await getDb();
  if (!db) {
    await finishRun(runId, "failed", 0, "database not available");
    return { rowsUpserted: 0, errors: ["database not available"] };
  }
  const errors: string[] = [];
  try {
    // Pull every active listing's zip + monthlyRent. The marketplace table
    // is small relative to ACS (tens of thousands at most), so streaming
    // the full set in-memory and bucketing in JS is simpler than a complex
    // SQL median (which MySQL lacks natively).
    const rows = await db
      .select({ zip: marketplaceListings.zip, monthlyRent: marketplaceListings.monthlyRent, state: marketplaceListings.state })
      .from(marketplaceListings)
      .where(sql`${marketplaceListings.status} = 'active' AND ${marketplaceListings.monthlyRent} > 0`);

    if (rows.length === 0) {
      await finishRun(runId, "success", 0);
      return { rowsUpserted: 0, errors };
    }

    // Bucket by 5-digit zip. Listings have varchar(20) zips so they can
    // carry "30303-1234" — clip to first 5 to match rentBenchmarks.zip.
    const buckets = new Map<string, { rents: number[]; state: string }>();
    for (const row of rows) {
      const zip = String(row.zip ?? "").replace(/[^0-9]/g, "").slice(0, 5);
      if (zip.length !== 5) continue;
      const rent = Number(row.monthlyRent);
      if (!Number.isFinite(rent) || rent <= 0) continue;
      const state = mapStateToAbbr(row.state);
      if (!state) continue;
      const bucket = buckets.get(zip) ?? { rents: [], state };
      bucket.rents.push(rent);
      buckets.set(zip, bucket);
    }

    if (buckets.size === 0) {
      await finishRun(runId, "success", 0);
      return { rowsUpserted: 0, errors };
    }

    const now = new Date();
    const dataYear = now.getFullYear();
    const values: InsertRentBenchmark[] = [];
    const historyValues: InsertRentBenchmarkHistory[] = [];

    for (const [zip, bucket] of Array.from(buckets.entries())) {
      const median = computeMedian(bucket.rents);
      if (median == null) continue;
      values.push({
        zip,
        state: bucket.state,
        leaselyMedianRent: median,
        leaselyListingCount: bucket.rents.length,
        leaselyRefreshedAt: now,
      });
      historyValues.push({
        zip,
        source: "leasely",
        bedrooms: "all",
        rent: median,
        sampleSize: bucket.rents.length,
        dataYear,
      });
    }

    // Chunked upserts so MySQL packet limits don't bite us.
    const CHUNK = 500;
    let totalUpserts = 0;
    for (let i = 0; i < values.length; i += CHUNK) {
      const slice = values.slice(i, i + CHUNK);
      try {
        await db
          .insert(rentBenchmarks)
          .values(slice)
          .onDuplicateKeyUpdate({
            set: {
              state: sql`VALUES(state)`,
              leaselyMedianRent: sql`VALUES(leaselyMedianRent)`,
              leaselyListingCount: sql`VALUES(leaselyListingCount)`,
              leaselyRefreshedAt: sql`VALUES(leaselyRefreshedAt)`,
            },
          });
        totalUpserts += slice.length;
      } catch (e: any) {
        errors.push(`leasely chunk ${i}: ${e?.message ?? "upsert failed"}`);
      }
    }

    // History is append-only; if it blows up we still keep the snapshot upserts.
    if (historyValues.length > 0) {
      try {
        for (let i = 0; i < historyValues.length; i += CHUNK) {
          await db.insert(rentBenchmarkHistory).values(historyValues.slice(i, i + CHUNK));
        }
      } catch (e: any) {
        errors.push(`leasely history: ${e?.message ?? "history insert failed"}`);
      }
    }

    await finishRun(runId, "success", totalUpserts, errors.length ? errors.slice(0, 5).join("; ") : undefined);
    return { rowsUpserted: totalUpserts, errors };
  } catch (e: any) {
    await finishRun(runId, "failed", 0, e?.message ?? "unknown error");
    return { rowsUpserted: 0, errors: [...errors, e?.message ?? "unknown error"] };
  }
}

/**
 * Pure: median of an integer array. Returns null for empty input.
 * O(n log n) sort is fine — typical zip bucket is <100 listings, even a
 * dense market like 30303 hits maybe 500 at the high end.
 */
function computeMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

/**
 * Listings store state as either a 2-letter abbr ("GA") or a full name
 * ("Georgia"). rent_benchmarks.state is a 2-letter abbr only. Normalize.
 */
const STATE_NAME_TO_ABBR: Record<string, string> = {
  "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
  "colorado":"CO","connecticut":"CT","delaware":"DE","district of columbia":"DC",
  "florida":"FL","georgia":"GA","hawaii":"HI","idaho":"ID","illinois":"IL",
  "indiana":"IN","iowa":"IA","kansas":"KS","kentucky":"KY","louisiana":"LA",
  "maine":"ME","maryland":"MD","massachusetts":"MA","michigan":"MI","minnesota":"MN",
  "mississippi":"MS","missouri":"MO","montana":"MT","nebraska":"NE","nevada":"NV",
  "new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY",
  "north carolina":"NC","north dakota":"ND","ohio":"OH","oklahoma":"OK","oregon":"OR",
  "pennsylvania":"PA","puerto rico":"PR","rhode island":"RI","south carolina":"SC",
  "south dakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT",
  "virginia":"VA","washington":"WA","west virginia":"WV","wisconsin":"WI","wyoming":"WY",
};
function mapStateToAbbr(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  if (s.length === 2) return s.toUpperCase();
  return STATE_NAME_TO_ABBR[s.toLowerCase()] ?? null;
}

// ── Public lookup ─────────────────────────────────────────────────────────────

export async function lookupBenchmarkByZip(zip: string) {
  const db = await getDb();
  if (!db) return null;
  const clean = zip.padStart(5, "0").slice(0, 5);
  const result = await db
    .select()
    .from(rentBenchmarks)
    .where(sql`${rentBenchmarks.zip} = ${clean}`)
    .limit(1);
  return result[0] ?? null;
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 27 * 24 * 60 * 60 * 1000; // 27 days (ACS/HUD)
// Keycove listings change daily; refresh weekly to keep our own-data
// signal current without thrashing the DB.
const LEASELY_STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
const SCHEDULER_INTERVAL_MS = 24 * 60 * 60 * 1000; // re-check every 24h

async function lastSuccessfulRun(source: "acs" | "hud" | "leasely"): Promise<Date | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({ finishedAt: rentBenchmarkRuns.finishedAt })
    .from(rentBenchmarkRuns)
    .where(sql`${rentBenchmarkRuns.source} = ${source} AND ${rentBenchmarkRuns.status} = 'success'`)
    .orderBy(sql`${rentBenchmarkRuns.finishedAt} DESC`)
    .limit(1);
  return rows[0]?.finishedAt ?? null;
}

/**
 * Refresh both sources if their last successful run is older than 27 days.
 * Safe to call from server boot — fire-and-forget; failures are logged
 * to the rent_benchmark_runs table, never thrown.
 */
export async function refreshBenchmarksIfStale(): Promise<void> {
  try {
    const [acsLast, hudLast, leaselyLast] = await Promise.all([
      lastSuccessfulRun("acs"),
      lastSuccessfulRun("hud"),
      lastSuccessfulRun("leasely"),
    ]);
    const now = Date.now();

    const acsStale = !acsLast || now - acsLast.getTime() > STALE_THRESHOLD_MS;
    const hudStale = !hudLast || now - hudLast.getTime() > STALE_THRESHOLD_MS;
    const leaselyStale = !leaselyLast || now - leaselyLast.getTime() > LEASELY_STALE_THRESHOLD_MS;

    if (acsStale) {
      console.log("[rentBenchmarks] ACS data is stale, refreshing nationwide…");
      const result = await refreshAcsRentBenchmarks();
      console.log(`[rentBenchmarks] ACS refresh complete: ${result.rowsUpserted} rows`);
    }
    if (hudStale && process.env.HUD_API_TOKEN) {
      console.log("[rentBenchmarks] HUD data is stale, refreshing…");
      const result = await refreshHudFmrs();
      console.log(`[rentBenchmarks] HUD refresh complete: ${result.rowsUpserted} rows`);
    }
    if (leaselyStale) {
      console.log("[rentBenchmarks] Keycove own-listings stale, refreshing…");
      const result = await refreshKeycoveListingBenchmarks();
      console.log(`[rentBenchmarks] Keycove refresh complete: ${result.rowsUpserted} zips`);
    }
  } catch (e) {
    console.warn("[rentBenchmarks] refreshBenchmarksIfStale failed:", e);
  }
}

let schedulerHandle: ReturnType<typeof setInterval> | null = null;

/**
 * Install the recurring scheduler. Idempotent — repeated calls clear the
 * prior interval so HMR doesn't leak handles in dev.
 */
export function startRentBenchmarkScheduler(): void {
  if (schedulerHandle) clearInterval(schedulerHandle);
  // Fire one check on boot (delayed 30s so we don't block startup).
  setTimeout(() => { void refreshBenchmarksIfStale(); }, 30_000);
  // Recurring daily check — the function itself decides whether to refresh.
  schedulerHandle = setInterval(() => { void refreshBenchmarksIfStale(); }, SCHEDULER_INTERVAL_MS);
}
