import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search, MapPin, Star, Heart, Users, Bed, Bath, Wifi, Car, Waves,
  Dumbbell, UtensilsCrossed, Wind, Tv, Flame, TreePine, Coffee,
  ChevronLeft, ChevronRight, Calendar, Shield, Zap, Globe,
  Home, Building2, Hotel, Tent, Sailboat, Castle,
} from "lucide-react";

const US_STATES = [
  "All States","AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const PROPERTY_TYPES = [
  { value: "all", label: "All Types", icon: Globe },
  { value: "entire_home", label: "Entire Home", icon: Home },
  { value: "apartment", label: "Apartment", icon: Building2 },
  { value: "private_room", label: "Private Room", icon: Bed },
  { value: "hotel_room", label: "Hotel Room", icon: Hotel },
  { value: "villa", label: "Villa", icon: Castle },
  { value: "cabin", label: "Cabin", icon: TreePine },
  { value: "studio", label: "Studio", icon: Tv },
];

const AMENITY_ICONS: Record<string, React.ComponentType<any>> = {
  wifi: Wifi, pool: Waves, gym: Dumbbell, kitchen: UtensilsCrossed,
  parking: Car, ac: Wind, tv: Tv, fireplace: Flame, coffee: Coffee,
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      {count > 0 && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}

function ListingCard({ listing, onSave, isSaved }: { listing: any; onSave?: (id: number) => void; isSaved?: boolean }) {
  const [imgIdx, setImgIdx] = useState(0);
  const photos = useMemo(() => {
    try { return listing.photos ? JSON.parse(listing.photos) : []; } catch { return []; }
  }, [listing.photos]);
  const amenities = useMemo(() => {
    try { return listing.amenities ? JSON.parse(listing.amenities) : []; } catch { return []; }
  }, [listing.amenities]);

  const displayPhoto = listing.coverPhotoUrl || photos[imgIdx] || null;

  return (
    <div className="group relative">
      {/* Photo */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted mb-3">
        {displayPhoto ? (
          <img src={displayPhoto} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Home className="h-12 w-12 text-primary/30" />
          </div>
        )}
        {photos.length > 1 && (
          <>
            <button onClick={e => { e.preventDefault(); setImgIdx(i => Math.max(0, i - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={e => { e.preventDefault(); setImgIdx(i => Math.min(photos.length - 1, i + 1)); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        {/* Save button */}
        {onSave && (
          <button onClick={e => { e.preventDefault(); onSave(listing.id); }}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform">
            <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
        )}
        {listing.instantBook ? (
          <div className="absolute top-3 left-3">
            <span className="text-xs bg-white/90 text-gray-800 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Instant Book
            </span>
          </div>
        ) : null}
      </div>
      {/* Info */}
      <Link href={`/istay/${listing.id}`}>
        <div className="cursor-pointer">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">{listing.title}</h3>
            {listing.reviewCount > 0 && <StarRating rating={listing.averageRating ?? 0} count={listing.reviewCount} />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {listing.city}, {listing.state}
          </p>
          <p className="text-sm text-muted-foreground">
            {listing.maxGuests} guests · {listing.bedrooms} bed · {listing.bathrooms} bath
          </p>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="font-bold">${listing.pricePerNight}</span>
            <span className="text-sm text-muted-foreground">/ night</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function IStayListingDetail({ listingId, onClose }: { listingId: number; onClose: () => void }) {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const { data, isLoading } = trpc.istay.getById.useQuery({ id: listingId });

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const bookMutation = trpc.istay.book.useMutation({
    onSuccess: (result) => {
      toast.success(`Booking confirmed! Total: $${result.totalAmount}`);
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const saveMutation = trpc.istay.save.useMutation({
    onSuccess: () => toast.success("Saved to wishlist"),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (!data) return null;

  const photos = (() => { try { return data.photos ? JSON.parse(data.photos) : []; } catch { return []; } })();
  const amenities = (() => { try { return data.amenities ? JSON.parse(data.amenities) : []; } catch { return []; } })();
  const subtotal = data.pricePerNight * nights;
  const cleaningFee = data.cleaningFee ?? 0;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + cleaningFee + serviceFee;

  return (
    <div className="max-h-[85vh] overflow-y-auto">
      {/* Photos */}
      {(data.coverPhotoUrl || photos.length > 0) && (
        <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-muted">
          <img src={data.coverPhotoUrl || photos[0]} alt={data.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h2 className="text-xl font-bold">{data.title}</h2>
            <p className="text-muted-foreground">{data.city}, {data.state}</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {data.maxGuests} guests</span>
            <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {data.bedrooms} bedrooms</span>
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {data.bathrooms} baths</span>
          </div>
          {data.hostName && (
            <div className="flex items-center gap-3 py-4 border-y">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">{data.hostName[0]}</span>
              </div>
              <div>
                <p className="font-medium">Hosted by {data.hostName}</p>
                {data.hostBio && <p className="text-sm text-muted-foreground line-clamp-2">{data.hostBio}</p>}
              </div>
            </div>
          )}
          {data.description && (
            <div>
              <h3 className="font-semibold mb-2">About this place</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
            </div>
          )}
          {amenities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {amenities.map((a: string) => {
                  const Icon = AMENITY_ICONS[a.toLowerCase()] ?? Shield;
                  return (
                    <div key={a} className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {data.houseRules && (
            <div>
              <h3 className="font-semibold mb-2">House Rules</h3>
              <p className="text-sm text-muted-foreground">{data.houseRules}</p>
            </div>
          )}
          <div className="flex gap-3 text-sm">
            <span className={`flex items-center gap-1 ${data.smokingAllowed ? "text-green-500" : "text-muted-foreground line-through"}`}>
              🚬 Smoking {data.smokingAllowed ? "allowed" : "not allowed"}
            </span>
            <span className={`flex items-center gap-1 ${data.petsAllowed ? "text-green-500" : "text-muted-foreground line-through"}`}>
              🐾 Pets {data.petsAllowed ? "allowed" : "not allowed"}
            </span>
          </div>
          {/* Reviews */}
          {data.reviews && data.reviews.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {data.averageRating?.toFixed(1)} · {data.reviewCount} reviews
              </h3>
              <div className="space-y-3">
                {data.reviews.slice(0, 3).map((r: any) => (
                  <div key={r.id} className="border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{r.reviewerName}</span>
                      <StarRating rating={r.overallRating} count={0} />
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking */}
        <div className="md:col-span-1">
          <div className="sticky top-4 border rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">${data.pricePerNight}</span>
              <span className="text-muted-foreground">/ night</span>
            </div>
            {(data.reviewCount ?? 0) > 0 && <StarRating rating={data.averageRating ?? 0} count={data.reviewCount ?? 0} />}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">CHECK-IN</label>
                <Input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">CHECK-OUT</label>
                <Input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">GUESTS</label>
              <Select value={guests.toString()} onValueChange={v => setGuests(parseInt(v))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: data.maxGuests }, (_, i) => i + 1).map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} guest{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {nights > 0 && (
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span>${data.pricePerNight} × {nights} nights</span>
                  <span>${subtotal}</span>
                </div>
                {cleaningFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cleaning fee</span>
                    <span>${cleaningFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>iStay™ service fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            )}
            {user ? (
              <Button className="w-full" disabled={nights === 0 || bookMutation.isPending}
                onClick={() => bookMutation.mutate({
                  listingId: data.id, checkIn, checkOut, nights, guestCount: guests,
                })}>
                {bookMutation.isPending ? "Booking..." : nights > 0 ? `Reserve · $${total}` : "Select dates"}
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <a href="/login">Sign in to book</a>
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">You won't be charged yet</p>
            {user && (
              <Button variant="ghost" className="w-full gap-2 text-sm" onClick={() => saveMutation.mutate({ listingId: data.id })}>
                <Heart className="h-4 w-4" /> Save to wishlist
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IStay() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [guests, setGuests] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const queryInput = useMemo(() => ({
    city: search || undefined,
    state: state !== "all" ? state : undefined,
    guests: guests ? parseInt(guests) : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    propertyType: propertyType !== "all" ? propertyType : undefined,
    petsAllowed: petsAllowed || undefined,
    limit: 24,
  }), [search, state, propertyType, guests, minPrice, maxPrice, petsAllowed]);

  const { data: listings = [], isLoading } = trpc.istay.getListings.useQuery(queryInput);

  const saveMutation = trpc.istay.save.useMutation({
    onSuccess: (_, vars) => {
      setSavedIds(prev => { const next = new Set(prev); next.add(vars.listingId); return next; });
      toast.success("Saved to wishlist");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#FF5A5F] via-[#FF385C] to-[#E31C5F] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl font-black tracking-tight">iStay™</span>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">by Leasely</Badge>
          </div>
          <p className="text-xl text-white/90 mb-8">Find your perfect short-term stay — homes, apartments, and unique spaces</p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-gray-900 text-sm rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30"
              />
            </div>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-36 text-gray-700 border-0 bg-gray-50 rounded-xl">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => <SelectItem key={s} value={s === "All States" ? "all" : s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button className="bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-xl px-6">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Property type filter */}
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-4 overflow-x-auto scrollbar-hide">
          {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setPropertyType(value)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl whitespace-nowrap text-xs font-medium transition-all shrink-0 ${
                propertyType === value
                  ? "bg-[#FF385C] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Input type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-20 h-8 text-xs" />
            <Input type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-20 h-8 text-xs" />
            <Input type="number" placeholder="Guests" value={guests} onChange={e => setGuests(e.target.value)} className="w-20 h-8 text-xs" />
            <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={petsAllowed} onChange={e => setPetsAllowed(e.target.checked)} />
              Pets OK
            </label>
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-xl font-semibold mb-2">No stays found</h3>
            <p className="text-muted-foreground mb-6">
              {search || state !== "all"
                ? "Try adjusting your search filters"
                : "Be the first to list your property on iStay™"}
            </p>
            {user && (
              <Button asChild className="bg-[#FF385C] hover:bg-[#E31C5F]">
                <Link href="/istay/host">List your space</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground text-sm">{listings.length} stays available</p>
              {user && (
                <Button asChild size="sm" className="bg-[#FF385C] hover:bg-[#E31C5F]">
                  <Link href="/istay/host">+ List your space</Link>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing: any) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSave={user ? (id) => saveMutation.mutate({ listingId: id }) : undefined}
                  isSaved={savedIds.has(listing.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Listing detail modal */}
      {selectedListingId && (
        <Dialog open={!!selectedListingId} onOpenChange={() => setSelectedListingId(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Listing Details</DialogTitle>
            </DialogHeader>
            <IStayListingDetail listingId={selectedListingId} onClose={() => setSelectedListingId(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
