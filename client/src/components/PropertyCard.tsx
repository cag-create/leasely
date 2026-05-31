import { useState } from "react";
import { Link } from "wouter";
import { Heart, MapPin, Bed, Bath, Square, Users, PawPrint, Eye, Bookmark, Zap, Camera, Sparkles as SparkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { formatRent, getListingImage, parsePhotos, PROPERTY_TYPE_LABELS } from "@/lib/marketplace";

type MarketplaceListing = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  monthlyRent: number;
  securityDeposit: number | null;
  bedrooms: string;
  bathrooms: string;
  squareFeet: number | null;
  availableDate: string | null;
  petFriendly: number | null;
  isCoLiving: number | null;
  parkingAvailable: number | null;
  washerDryer: number | null;
  airConditioning: number | null;
  dishwasher: number | null;
  utilities: string | null;
  photos: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string;
  portalPropertyId: number | null;
  viewCount: number;
  saveCount: number;
  createdAt: Date;
  updatedAt: Date;
  isSample?: boolean;
};

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

interface PropertyCardProps {
  listing: MarketplaceListing;
  view?: "grid" | "list";
  isSaved?: boolean;
  onSaveToggle?: (id: number, saved: boolean) => void;
}

export default function PropertyCard({ listing, view = "grid", isSaved = false, onSaveToggle }: PropertyCardProps) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(isSaved);

  const saveMutation = trpc.marketplace.saveListing.useMutation({
    onSuccess: () => {
      setSaved(true);
      onSaveToggle?.(listing.id, true);
      toast.success("Saved to favorites ❤️");
    },
  });

  const unsaveMutation = trpc.marketplace.unsaveListing.useMutation({
    onSuccess: () => {
      setSaved(false);
      onSaveToggle?.(listing.id, false);
      toast.success("Removed from favorites");
    },
  });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Sign in to save listings", { action: { label: "Sign In", onClick: () => { window.location.href = getLoginUrl(); } } });
      return;
    }
    if (saved) {
      unsaveMutation.mutate({ listingId: listing.id });
    } else {
      saveMutation.mutate({ listingId: listing.id });
    }
  };

  const photo = getListingImage(listing.photos, listing.id);
  const typeLabel = PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType;
  const photoCount = parsePhotos(listing.photos).length;
  const isNew = listing.createdAt
    ? Date.now() - new Date(listing.createdAt).getTime() < 7 * 24 * 3600 * 1000
    : false;
  const isSample = listing.isSample === true || listing.id < 0;

  // Sample listings don't navigate to a detail page (there's no row in the
  // DB). Instead, show a toast so the visitor understands the badge.
  const handleSampleClick = (e: React.MouseEvent) => {
    if (!isSample) return;
    e.preventDefault();
    e.stopPropagation();
    toast.info("This is a sample listing — preview of how your property will appear.", {
      description: "List your own property free to claim a real card here.",
    });
  };

  // Alt text — for sample listings, explicitly disclose that the image is a
  // stock photo. Sighted users see the SAMPLE LISTING badge + click-through
  // toast; this gives screen readers and Unsplash's license requirements the
  // same disclosure.
  const imgAlt = isSample
    ? `${listing.title} (Stock photo — sample listing for demonstration purposes)`
    : listing.title;

  const SampleBadge = () => (
    <span
      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md"
      style={{ background: "rgba(255,255,255,0.95)", color: "#3A2410", border: "1px solid rgba(79,70,229,0.4)" }}
      title="Sample listing — illustrative content, not a real rental"
    >
      <SparkIcon className="h-3 w-3" style={{ color: "#4F46E5" }} />Sample listing
    </span>
  );

  // Determine badge color by type
  const typeBadgeStyle = listing.isCoLiving === 1
    ? { background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }
    : listing.propertyType === "apartment"
    ? { background: "#6366f120", color: "#6366f1", border: "1px solid #6366f140" }
    : listing.propertyType === "house"
    ? { background: "#f59e0b20", color: "#d97706", border: "1px solid #f59e0b40" }
    : { background: `${BRAND}15`, color: BRAND, border: `1px solid ${BRAND}30` };

  if (view === "list") {
    return (
      <Link href={isSample ? "#" : `/listing/${listing.id}`} onClick={handleSampleClick as any}>
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex cursor-pointer"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
          {/* Image */}
          <div className="relative w-56 sm:w-72 shrink-0 overflow-hidden">
            <img
              src={photo}
              alt={imgAlt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 group-hover:opacity-0 transition-opacity" />
            <button
              onClick={handleSave}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200 border border-white/50"
            >
              <Heart className={`h-4 w-4 transition-colors ${saved ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-gray-600"}`} />
            </button>
            {listing.isCoLiving === 1 && (
              <div className="absolute bottom-3 left-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: ACCENT, color: "#3A2410" }}>
                  Co-Living
                </span>
              </div>
            )}
            {photoCount > 1 && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
                <Camera className="h-3 w-3" />{photoCount}
              </div>
            )}
            {isNew && !isSample && (
              <div className="absolute top-3 left-3">
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-md" style={{ background: ACCENT, color: "#3A2410" }}>
                  <SparkIcon className="h-3 w-3" />New
                </span>
              </div>
            )}
            {isSample && (
              <div className="absolute top-3 left-3"><SampleBadge /></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2" style={typeBadgeStyle}>
                    {typeLabel}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight transition-colors line-clamp-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {listing.title}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black" style={{ color: ACCENT, fontFamily: "'Outfit', sans-serif" }}>{formatRent(listing.monthlyRent)}</div>
                  <div className="text-xs text-gray-400">/month</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="truncate">{listing.city}, {listing.state}</span>
              </div>

              <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{listing.description}</p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5 font-medium"><Bed className="h-4 w-4 text-gray-400" />{listing.bedrooms} bd</span>
                <span className="flex items-center gap-1.5 font-medium"><Bath className="h-4 w-4 text-gray-400" />{listing.bathrooms} ba</span>
                {listing.squareFeet && <span className="flex items-center gap-1.5 font-medium"><Square className="h-4 w-4 text-gray-400" />{listing.squareFeet.toLocaleString()} sqft</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {listing.petFriendly === 1 && <span className="flex items-center gap-1"><PawPrint className="h-3.5 w-3.5" />Pets OK</span>}
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view — premium card
  return (
    <Link href={isSample ? "#" : `/listing/${listing.id}`} onClick={handleSampleClick as any}>
      <div
        className="group bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)"; }}
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={photo}
            alt={imgAlt}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
            style={{ transform: "scale(1)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.06)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md" style={{ background: "rgba(255,255,255,0.92)", color: BRAND }}>
              {typeLabel}
            </span>
            {listing.isCoLiving === 1 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: ACCENT, color: "#3A2410" }}>
                Co-Living
              </span>
            )}
            {isNew && !isSample && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-md" style={{ background: ACCENT, color: "#3A2410" }}>
                <SparkIcon className="h-3 w-3" />New
              </span>
            )}
            {isSample && <SampleBadge />}
          </div>

          {/* Photo count badge */}
          {photoCount > 1 && (
            <div className="absolute bottom-16 right-3 flex items-center gap-1 text-white text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
              <Camera className="h-3 w-3" />{photoCount}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-lg hover:scale-110 transition-all duration-200"
            style={{ background: saved ? "#fff" : "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.5)" }}
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${saved ? "fill-red-500 text-red-500 scale-110" : "text-gray-500"}`} />
          </button>

          {/* Bottom stats */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <div className="text-2xl font-black text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                {formatRent(listing.monthlyRent)}
              </div>
              <div className="text-white/80 text-xs font-medium">/month</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-white/90 text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
                <Eye className="h-3 w-3" />{listing.viewCount}
              </div>
              <div className="flex items-center gap-1 text-white/90 text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
                <Bookmark className="h-3 w-3" />{listing.saveCount}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 leading-tight line-clamp-1 mb-1.5 group-hover:text-emerald-600 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {listing.title}
          </h3>

          <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-xs">{listing.neighborhood ? `${listing.neighborhood}, ` : ""}{listing.city}, {listing.state}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1 font-medium"><Bed className="h-3.5 w-3.5 text-gray-400" />{listing.bedrooms}</span>
              <span className="flex items-center gap-1 font-medium"><Bath className="h-3.5 w-3.5 text-gray-400" />{listing.bathrooms}</span>
              {listing.squareFeet && <span className="flex items-center gap-1 font-medium text-xs text-gray-400"><Square className="h-3.5 w-3.5" />{listing.squareFeet.toLocaleString()}</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {listing.petFriendly === 1 && <PawPrint className="h-3.5 w-3.5" />}
              {listing.isCoLiving === 1 && <Users className="h-3.5 w-3.5" style={{ color: ACCENT }} />}
            </div>
          </div>

          {listing.availableDate && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Zap className="h-3 w-3" style={{ color: ACCENT }} />
                Available {new Date(listing.availableDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
