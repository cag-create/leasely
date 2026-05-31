import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Upload, Pencil, Trash2, ExternalLink, Eye, Bookmark,
  Search, Home as HomeIcon, MapPin, Bed, Bath, Square, Camera,
} from "lucide-react";
import { formatRent, getListingImage, parsePhotos, PROPERTY_TYPE_LABELS } from "@/lib/marketplace";

const ACCENT = "#4F46E5";
const BRAND = "#1B2B5E";

type StatusFilter = "all" | "active" | "inactive";

export default function MyListings() {
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const { data: listings = [], isLoading } = trpc.marketplace.getMyListings.useQuery();

  const deleteMutation = trpc.marketplace.deleteListing.useMutation({
    onSuccess: () => {
      toast.success("Listing removed.");
      utils.marketplace.getMyListings.invalidate();
    },
    onError: (e) => toast.error(e.message ?? "Failed to delete listing"),
  });

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Deactivate "${title}"? It will be hidden from the public marketplace.`)) return;
    deleteMutation.mutate({ id });
  };

  const filtered = listings.filter((l: any) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${l.title} ${l.address} ${l.city}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l: any) => l.status === "active").length,
    views: listings.reduce((s: number, l: any) => s + (l.viewCount ?? 0), 0),
    saves: listings.reduce((s: number, l: any) => s + (l.saveCount ?? 0), 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              My Listings
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage every property you've listed on Leasely.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/import-listings" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
            </Link>
            <Link href="/list-property" className="flex-1 sm:flex-initial">
              <Button className="w-full" style={{ background: ACCENT, color: "#3A2410" }}>
                <Plus className="h-4 w-4 mr-2" /> Add Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total listings" value={stats.total} />
          <StatCard label="Active" value={stats.active} accent />
          <StatCard label="Total views" value={stats.views} />
          <StatCard label="Total saves" value={stats.saves} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, address, city..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === s
                    ? "border-transparent text-white shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
                style={statusFilter === s ? { background: BRAND } : {}}
              >
                {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            hasFilters={statusFilter !== "all" || !!search}
            onClear={() => { setStatusFilter("all"); setSearch(""); }}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((l: any) => (
              <ListingRow
                key={l.id}
                listing={l}
                onEdit={() => navigate(`/edit-listing/${l.id}`)}
                onDelete={() => handleDelete(l.id, l.title)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className="text-2xl font-black"
        style={{ color: accent ? ACCENT : BRAND, fontFamily: "'Outfit', sans-serif" }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function ListingRow({
  listing,
  onEdit,
  onDelete,
}: {
  listing: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photo = getListingImage(listing.photos, listing.id);
  const photoCount = parsePhotos(listing.photos).length;
  const typeLabel = PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType;
  const isActive = listing.status === "active";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0">
        <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
        {photoCount > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white text-xs font-semibold px-2 py-1 rounded-full bg-black/60">
            <Camera className="h-3 w-3" />{photoCount}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge
            className="text-xs"
            style={
              isActive
                ? { background: `${ACCENT}20`, color: "#0a6b4f", border: `1px solid ${ACCENT}40` }
                : { background: "#9ca3af20", color: "#4b5563", border: "1px solid #9ca3af40" }
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${BRAND}15`, color: BRAND }}>
              {typeLabel}
            </span>
            {listing.isCoLiving === 1 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: ACCENT, color: "#3A2410" }}>
                Co-Living
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 leading-tight line-clamp-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {listing.title}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{listing.address}, {listing.city}, {listing.state}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-gray-400" />{listing.bedrooms} bd</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-gray-400" />{listing.bathrooms} ba</span>
            {listing.squareFeet && (
              <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5 text-gray-400" />{listing.squareFeet.toLocaleString()} sqft</span>
            )}
            <span className="flex items-center gap-1 text-gray-400 text-xs"><Eye className="h-3.5 w-3.5" />{listing.viewCount ?? 0} views</span>
            <span className="flex items-center gap-1 text-gray-400 text-xs"><Bookmark className="h-3.5 w-3.5" />{listing.saveCount ?? 0} saves</span>
          </div>
        </div>

        {/* Price + actions */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-between gap-3 sm:gap-2 shrink-0">
          <div className="text-right">
            <div className="text-xl font-black" style={{ color: ACCENT, fontFamily: "'Outfit', sans-serif" }}>
              {formatRent(listing.monthlyRent)}
            </div>
            <div className="text-xs text-gray-400">/month</div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`/listing/${listing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              title="View public listing"
            >
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
            </a>
            <button
              onClick={onEdit}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Edit listing"
            >
              <Pencil className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button
              onClick={onDelete}
              disabled={!isActive}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={isActive ? "Deactivate listing" : "Already inactive"}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
      <div className="h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
        <HomeIcon className="h-7 w-7" style={{ color: ACCENT }} />
      </div>
      {hasFilters ? (
        <>
          <h3 className="font-bold text-gray-900 mb-1">No listings match your filters</h3>
          <p className="text-gray-500 text-sm mb-4">Try clearing the search or status filter.</p>
          <Button variant="outline" onClick={onClear}>Clear filters</Button>
        </>
      ) : (
        <>
          <h3 className="font-bold text-gray-900 mb-1">No listings yet</h3>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            Add your first property in 5 minutes — or import in bulk from a CSV (Zillow, AppFolio, Buildium, and more).
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link href="/list-property">
              <Button style={{ background: ACCENT, color: "#3A2410" }}>
                <Plus className="h-4 w-4 mr-2" /> Add your first listing
              </Button>
            </Link>
            <Link href="/import-listings">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" /> Import from CSV
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
