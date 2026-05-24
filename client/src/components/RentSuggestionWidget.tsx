import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

const ACCENT = "#F5A623";

interface RentSuggestionWidgetProps {
  zip: string;
  bedrooms: string;
  proposedRent: number;
  onAccept?: (rent: number) => void;
}

/**
 * "Leasely Market Intelligence" — surfaces a suggested rent range for the
 * given zip + bedroom count using the automated rent benchmarks. Pulls
 * from the rentIntelligence.getBenchmark tRPC query, which is backed by
 * Census ACS + HUD FMR data refreshed monthly in the background.
 *
 * Branding rule (per project memory): never show "HUD" / "ACS" / "Census"
 * as the source name in user-facing copy. Always presents as a single
 * Leasely-branded data product.
 */
export default function RentSuggestionWidget({
  zip,
  bedrooms,
  proposedRent,
  onAccept,
}: RentSuggestionWidgetProps) {
  const cleanZip = (zip || "").replace(/\D/g, "").slice(0, 5);
  const hasZip = cleanZip.length === 5;

  const { data, isLoading } = trpc.rentIntelligence.getBenchmark.useQuery(
    { zip: cleanZip },
    { enabled: hasZip, staleTime: 5 * 60 * 1000 },
  );

  const suggestion = useMemo(() => {
    if (!data) return null;

    // Prefer HUD's by-bedroom number when available — it's the canonical
    // "fair market" reference and varies by bedroom count. Fall back to
    // ACS median (all-unit-sizes) with a ±15% band when HUD is missing.
    const hudByBed: Record<string, number | null | undefined> = {
      "0": data.hudFmrStudio,
      "studio": data.hudFmrStudio,
      "1": data.hudFmr1br,
      "2": data.hudFmr2br,
      "3": data.hudFmr3br,
      "4": data.hudFmr4br,
      "5": data.hudFmr4br, // 5+ uses 4BR baseline
    };
    const hudPick = hudByBed[bedrooms];

    let center: number | null = null;
    let primarySource: "hud" | "acs" | null = null;
    if (typeof hudPick === "number" && hudPick > 0) {
      center = hudPick;
      primarySource = "hud";
    } else if (typeof data.acsMedianRent === "number" && data.acsMedianRent > 0) {
      // Apply a small bedroom multiplier off the median (which is "all unit
      // sizes" in ACS) so a 3BR doesn't get compared to a studio's median.
      const bedMult: Record<string, number> = {
        "0": 0.7, "studio": 0.7, "1": 0.85, "2": 1.0, "3": 1.2, "4": 1.4, "5": 1.55,
      };
      center = Math.round(data.acsMedianRent * (bedMult[bedrooms] ?? 1));
      primarySource = "acs";
    }

    if (!center) return null;

    // ±10% band around the centerpoint.
    const low = Math.round((center * 0.9) / 25) * 25;
    const high = Math.round((center * 1.1) / 25) * 25;
    return { low, center, high, primarySource };
  }, [data, bedrooms]);

  if (!hasZip) return null;
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking market rents for {cleanZip}…
      </div>
    );
  }
  if (!suggestion) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-xs text-gray-500">
        We don't have enough market data for {cleanZip} yet. Your listing will help build it.
      </div>
    );
  }

  // Where does the proposed rent fall vs. the suggestion?
  const proposed = Number(proposedRent) || 0;
  let verdict: { label: string; color: string; bg: string; icon: any } | null = null;
  if (proposed > 0) {
    if (proposed < suggestion.low) {
      verdict = { label: "Below market", color: "#0a6b4f", bg: `${ACCENT}15`, icon: TrendingDown };
    } else if (proposed > suggestion.high) {
      verdict = { label: "Above market", color: "#92400e", bg: "#fef3c7", icon: TrendingUp };
    } else {
      verdict = { label: "Typical for the area", color: "#0a6b4f", bg: `${ACCENT}15`, icon: Sparkles };
    }
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: `${ACCENT}40`, background: `linear-gradient(180deg, ${ACCENT}08 0%, transparent 100%)` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
            <Sparkles className="h-4 w-4 text-[#3A2410]" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900">Leasely Market Intelligence</div>
            <div className="text-[10px] text-gray-500">Suggested rent for {bedrooms || "?"}BR in {cleanZip}</div>
          </div>
        </div>
        {verdict && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: verdict.bg, color: verdict.color }}
          >
            <verdict.icon className="h-3 w-3" />
            {verdict.label}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-0.5">Suggested range</div>
          <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            ${suggestion.low.toLocaleString()} – ${suggestion.high.toLocaleString()}
            <span className="text-xs text-gray-400 font-normal"> /mo</span>
          </div>
        </div>
        {onAccept && proposed !== suggestion.center && (
          <button
            type="button"
            onClick={() => onAccept(suggestion.center!)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-white transition-colors"
          >
            Use ${suggestion.center.toLocaleString()}
          </button>
        )}
      </div>

      {/* Subtle band visualization */}
      {proposed > 0 && (
        <RentBand low={suggestion.low} center={suggestion.center} high={suggestion.high} proposed={proposed} />
      )}
    </div>
  );
}

function RentBand({ low, center, high, proposed }: { low: number; center: number; high: number; proposed: number }) {
  // Map [low*0.7, high*1.3] to [0%, 100%] so the band visually has headroom.
  const min = low * 0.7;
  const max = high * 1.3;
  const clamp = (n: number) => Math.max(0, Math.min(100, ((n - min) / (max - min)) * 100));
  const bandLeft = clamp(low);
  const bandWidth = clamp(high) - bandLeft;
  const proposedLeft = clamp(proposed);

  return (
    <div className="mt-3">
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{ left: `${bandLeft}%`, width: `${bandWidth}%`, background: `${ACCENT}50` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-1 rounded-full"
          style={{ left: `calc(${clamp(center)}% - 2px)`, background: ACCENT }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md"
          style={{ left: `calc(${proposedLeft}% - 8px)`, background: "#1B2B5E" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>Your price: ${proposed.toLocaleString()}</span>
        <span>Median: ${center.toLocaleString()}</span>
      </div>
    </div>
  );
}
