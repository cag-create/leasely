import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import {
  Search, Map, LayoutGrid, List, SlidersHorizontal, X,
  Building2, ChevronDown, PlusCircle, Filter
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import { Link } from "wouter";
import { PROPERTY_TYPES, BEDROOM_OPTIONS, US_STATES, formatRent } from "@/lib/marketplace";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

export default function Marketplace() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [view, setView] = useState<"grid" | "list">("grid");
  const [citySearch, setCitySearch] = useState(searchParams.get("city") ?? "");
  const [appliedCity, setAppliedCity] = useState(searchParams.get("city") ?? "");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") ?? "all");
  const [propertyType, setPropertyType] = useState(searchParams.get("type") ?? "all");
  const [bedrooms, setBedrooms] = useState("any");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [petFriendly, setPetFriendly] = useState(false);
  const [isCoLiving, setIsCoLiving] = useState(false);
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: listings = [], isLoading } = trpc.marketplace.getListings.useQuery({
    city: appliedCity || undefined,
    state: selectedState !== "all" ? selectedState : undefined,
    propertyType: propertyType !== "all" ? propertyType : undefined,
    bedrooms: bedrooms !== "any" ? bedrooms : undefined,
    minRent: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxRent: priceRange[1] < 10000 ? priceRange[1] : undefined,
    petFriendly: petFriendly || undefined,
    isCoLiving: isCoLiving || undefined,
    sort,
    limit: 24,
  });

  const applySearch = () => {
    setAppliedCity(citySearch);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setCitySearch("");
    setAppliedCity("");
    setSelectedState("all");
    setPropertyType("all");
    setBedrooms("any");
    setPriceRange([0, 10000]);
    setPetFriendly(false);
    setIsCoLiving(false);
    setSort("newest");
  };

  const hasFilters = appliedCity || selectedState !== "all" || propertyType !== "all" ||
    bedrooms !== "any" || priceRange[0] > 0 || priceRange[1] < 10000 || petFriendly || isCoLiving;

  const displayListings = listings;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Location</Label>
        <div className="flex gap-2">
          <Input
            placeholder="City or neighborhood..."
            value={citySearch}
            onChange={e => setCitySearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applySearch()}
            className="flex-1"
          />
        </div>
      </div>

      {/* State */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">State</Label>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger>
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Type */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Property Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setPropertyType(t.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                propertyType === t.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Bedrooms</Label>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map(b => (
            <button
              key={b.value}
              onClick={() => setBedrooms(b.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                bedrooms === b.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Price Range: {formatRent(priceRange[0])} – {priceRange[1] >= 10000 ? "Any" : formatRent(priceRange[1])}
        </Label>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="mt-2"
        />
      </div>

      {/* Amenity Toggles */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700 block">Amenities</Label>
        <div className="flex items-center justify-between">
          <Label htmlFor="pet-friendly" className="text-sm text-gray-600 cursor-pointer">Pet Friendly</Label>
          <Switch id="pet-friendly" checked={petFriendly} onCheckedChange={setPetFriendly} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="co-living" className="text-sm text-gray-600 cursor-pointer">Co-Living</Label>
          <Switch id="co-living" checked={isCoLiving} onCheckedChange={setIsCoLiving} />
        </div>
      </div>

      <Button onClick={applySearch} className="w-full font-bold" style={{ background: ACCENT, color: "#3A2410" }}>
        Apply Filters
      </Button>
      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full text-gray-500">
          <X className="h-4 w-4 mr-2" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {appliedCity ? `Rentals in ${appliedCity}` : "Browse All Rentals"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isLoading ? "Loading..." : `${displayListings.length} listing${displayListings.length === 1 ? "" : "s"}`}
                {hasFilters && " · Filters applied"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/marketplace/map">
                <Button variant="outline" size="sm" className="gap-2">
                  <Map className="h-4 w-4" /> Map View
                </Button>
              </Link>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 ${view === "grid" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 ${view === "list" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {appliedCity && (
                <Badge variant="secondary" className="gap-1">
                  📍 {appliedCity}
                  <button onClick={() => { setCitySearch(""); setAppliedCity(""); }}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {selectedState !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedState}
                  <button onClick={() => setSelectedState("all")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {propertyType !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {PROPERTY_TYPES.find(t => t.value === propertyType)?.label}
                  <button onClick={() => setPropertyType("all")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {petFriendly && (
                <Badge variant="secondary" className="gap-1">
                  🐾 Pet Friendly
                  <button onClick={() => setPetFriendly(false)}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {isCoLiving && (
                <Badge variant="secondary" className="gap-1">
                  👥 Co-Living
                  <button onClick={() => setIsCoLiving(false)}><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </h2>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-emerald-600 font-medium hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort + Mobile Filter */}
            <div className="flex items-center justify-between mb-6">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasFilters && <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs" style={{ background: ACCENT, color: "#3A2410" }}>!</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Listings</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listings Grid/List */}
            {isLoading ? (
              <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-52 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayListings.length > 0 ? (
              <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {displayListings.map(listing => (
                  <PropertyCard key={listing.id} listing={listing as any} view={view} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No listings found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters or be the first to list in this area!</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                  <Link href="/list-property">
                    <Button style={{ background: ACCENT, color: "#3A2410" }} className="font-bold gap-2">
                      <PlusCircle className="h-4 w-4" /> List Your Property
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
