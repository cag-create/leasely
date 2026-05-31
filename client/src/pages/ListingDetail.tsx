import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { MapView } from "@/components/Map";
import { toast } from "sonner";
import {
  MapPin, Bed, Bath, Square, Heart, Share2, ChevronLeft,
  ChevronRight, Phone, Mail, User, PawPrint, Users, Car,
  Zap, Wind, Utensils, Calendar, DollarSign, Eye, Bookmark,
  Building2, ExternalLink, CheckCircle2, X, Image as ImageIcon, Camera,
} from "lucide-react";
import { formatRent, getListingImage, parsePhotos, PROPERTY_TYPE_LABELS, PLACEHOLDER_IMAGES } from "@/lib/marketplace";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const listingId = parseInt(params.id ?? "0");
  const { isAuthenticated } = useAuth();
  const [photoIdx, setPhotoIdx] = useState(0);
  // Lightbox: open + which photo to start on. -1 means closed.
  const [lightboxIdx, setLightboxIdx] = useState<number>(-1);
  const [saved, setSaved] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  const { data: listing, isLoading } = trpc.marketplace.getListingById.useQuery({ id: listingId });

  const saveMutation = trpc.marketplace.saveListing.useMutation({
    onSuccess: () => { setSaved(true); toast.success("Saved to favorites!"); },
  });
  const unsaveMutation = trpc.marketplace.unsaveListing.useMutation({
    onSuccess: () => { setSaved(false); toast.success("Removed from favorites"); },
  });
  const sendInquiryMutation = trpc.marketplace.submitInquiry.useMutation({
    onSuccess: () => { setMsgSent(true); toast.success("Message sent!"); },
    onError: () => toast.error("Failed to send. Please try again."),
  });

  const handleMapReady = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    setMapReady(true);
  }, []);

  // Place marker when map and listing are both ready
  if (mapReady && mapInstance && listing?.latitude && listing?.longitude) {
    const pos = { lat: listing.latitude, lng: listing.longitude };
    mapInstance.setCenter(pos);
    mapInstance.setZoom(15);
    new google.maps.Marker({
      position: pos,
      map: mapInstance,
      title: listing.title,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="30">
            <rect rx="15" ry="15" width="80" height="30" fill="${BRAND}" stroke="white" stroke-width="2"/>
            <text x="40" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial">${formatRent(listing.monthlyRent).replace(".00","")}</text>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(80, 30),
        anchor: new google.maps.Point(40, 15),
      },
    });
  }

  const handleSave = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (saved) unsaveMutation.mutate({ listingId });
    else saveMutation.mutate({ listingId });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactMsg.trim().length < 10) {
      toast.error("Message must be at least 10 characters.");
      return;
    }
    sendInquiryMutation.mutate({
      listingId,
      senderName: contactName,
      senderEmail: contactEmail,
      message: contactMsg,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 max-w-6xl py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-200 rounded-3xl" />
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 max-w-lg py-24 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-500 mb-6">This listing may have been removed or deactivated.</p>
          <Link href="/marketplace">
            <Button style={{ background: ACCENT, color: "#3A2410" }}>Browse All Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const photos = parsePhotos(listing.photos);
  const allPhotos = photos.length > 0 ? photos : [getListingImage(listing.photos, listing.id)];
  const typeLabel = PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType;

  const amenities = [
    { key: "petFriendly", label: "Pet Friendly", icon: PawPrint, val: listing.petFriendly },
    { key: "isCoLiving", label: "Co-Living", icon: Users, val: listing.isCoLiving },
    { key: "parkingAvailable", label: "Parking", icon: Car, val: listing.parkingAvailable },
    { key: "washerDryer", label: "Washer/Dryer", icon: Zap, val: listing.washerDryer },
    { key: "airConditioning", label: "Air Conditioning", icon: Wind, val: listing.airConditioning },
    { key: "dishwasher", label: "Dishwasher", icon: Utensils, val: listing.dishwasher },
  ].filter(a => a.val === 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/marketplace" className="hover:text-gray-600">Marketplace</Link>
          <span>/</span>
          <Link href={`/marketplace?city=${listing.city}`} className="hover:text-gray-600">{listing.city}</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-48">{listing.title}</span>
        </div>

        {/* Photo Gallery — Zillow/Redfin-style 1+4 grid.
            Click any tile to open the fullscreen lightbox; mobile shows a swipeable hero. */}
        <PhotoGrid
          photos={allPhotos}
          title={listing.title}
          saved={saved}
          onSave={handleSave}
          onShare={handleShare}
          onOpenLightbox={(i) => setLightboxIdx(i)}
          viewCount={listing.viewCount ?? 0}
          saveCount={listing.saveCount ?? 0}
        />

        {lightboxIdx >= 0 && (
          <Lightbox
            photos={allPhotos}
            startIdx={lightboxIdx}
            title={listing.title}
            onClose={() => setLightboxIdx(-1)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="text-sm" style={{ background: `${BRAND}15`, color: BRAND }}>{typeLabel}</Badge>
                {listing.isCoLiving === 1 && <Badge className="text-sm bg-purple-100 text-purple-700">Co-Living</Badge>}
                {listing.petFriendly === 1 && <Badge className="text-sm bg-green-100 text-green-700">🐾 Pet Friendly</Badge>}
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <MapPin className="h-4 w-4" />
                <span>{listing.address}, {listing.city}, {listing.state} {listing.zip}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-600">{formatRent(listing.monthlyRent)}</span>
                <span className="text-gray-400 text-lg">/month</span>
                {listing.securityDeposit && (
                  <span className="text-gray-400 text-sm ml-2">· {formatRent(listing.securityDeposit)} deposit</span>
                )}
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                <Bed className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <div className="font-black text-xl text-gray-900">{listing.bedrooms}</div>
                <div className="text-gray-400 text-sm">Bedrooms</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                <Bath className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <div className="font-black text-xl text-gray-900">{listing.bathrooms}</div>
                <div className="text-gray-400 text-sm">Bathrooms</div>
              </div>
              {listing.squareFeet ? (
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                  <Square className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <div className="font-black text-xl text-gray-900">{listing.squareFeet.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Sq Ft</div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <div className="font-black text-sm text-gray-900">{listing.availableDate ?? "Now"}</div>
                  <div className="text-gray-400 text-sm">Available</div>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-3">About This Property</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map(({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                        <Icon className="h-4 w-4" style={{ color: ACCENT }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                  ))}
                  {listing.utilities && listing.utilities !== "not_included" && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                        <Zap className="h-4 w-4" style={{ color: ACCENT }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Utilities {listing.utilities === "included" ? "Included" : "Partial"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-black text-gray-900">Location</h2>
                <p className="text-gray-500 text-sm">{listing.city}, {listing.state}</p>
              </div>
              <div className="h-64">
                {listing.latitude && listing.longitude ? (
                  <MapView onMapReady={handleMapReady} className="w-full h-full" />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-400">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Exact location not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 mb-4">Contact Landlord</h2>

              {listing.contactName && (
                <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: BRAND }}>
                    {listing.contactName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{listing.contactName}</div>
                    <div className="text-xs text-gray-400">Property Owner</div>
                  </div>
                </div>
              )}

              {msgSent ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Message Sent!</p>
                  <p className="text-gray-400 text-sm mt-1">The landlord will be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    required
                  />
                  <Textarea
                    placeholder="Hi, I'm interested in this property..."
                    value={contactMsg}
                    onChange={e => setContactMsg(e.target.value)}
                    className="min-h-24"
                    minLength={10}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full font-bold"
                    style={{ background: ACCENT, color: "#3A2410" }}
                    disabled={sendInquiryMutation.isPending}
                  >
                    {sendInquiryMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}

              {listing.contactPhone && (
                <a href={`tel:${listing.contactPhone}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-4 justify-center">
                  <Phone className="h-4 w-4" /> {listing.contactPhone}
                </a>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3">Listing Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Views</span>
                  <span className="font-semibold">{listing.viewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Saves</span>
                  <span className="font-semibold">{listing.saveCount}</span>
                </div>
                {listing.availableDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Available</span>
                    <span className="font-semibold">{listing.availableDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Listed</span>
                  <span className="font-semibold">{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Save & Share */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleSave}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Photo grid (Zillow/Redfin-style hero) ──────────────────────────────────
// Layout rules:
//  - 1 photo → single full-width hero
//  - 2 photos → 50/50 split
//  - 3 photos → 1 large left + 2 stacked right
//  - 4+ photos → 1 large left + 4 tiles right (2x2). On the bottom-right tile,
//    if there are more photos, show a "+N photos" overlay.
//  Mobile collapses to a single hero with a "View all" button overlay.
function PhotoGrid({
  photos, title, saved, onSave, onShare, onOpenLightbox, viewCount, saveCount,
}: {
  photos: string[];
  title: string;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onOpenLightbox: (i: number) => void;
  viewCount: number;
  saveCount: number;
}) {
  const visible = photos.slice(0, 5);
  const remaining = Math.max(0, photos.length - 5);

  return (
    <div className="relative mb-8">
      {/* Mobile / 1 photo fallback */}
      <div className={`relative rounded-3xl overflow-hidden bg-gray-900 h-80 ${visible.length > 1 ? "md:hidden" : ""}`}>
        <img
          src={visible[0]}
          alt={title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onOpenLightbox(0)}
        />
        {photos.length > 1 && (
          <button
            onClick={() => onOpenLightbox(0)}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-full shadow-lg"
          >
            <Camera className="h-3.5 w-3.5" /> View all {photos.length} photos
          </button>
        )}
      </div>

      {/* Desktop grid (≥ md) */}
      {visible.length > 1 && (
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-3xl overflow-hidden">
          {/* Hero tile — spans 2 cols × 2 rows on the left */}
          <button
            type="button"
            onClick={() => onOpenLightbox(0)}
            className="col-span-2 row-span-2 relative group bg-gray-900"
          >
            <img src={visible[0]} alt={title} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform" />
          </button>
          {/* Right-side 4 tiles */}
          {[1, 2, 3, 4].map(i => {
            const src = visible[i];
            if (!src) {
              return <div key={i} className="bg-gray-100" />;
            }
            const isLastVisible = i === 4 && remaining > 0;
            return (
              <button
                type="button"
                key={i}
                onClick={() => onOpenLightbox(i)}
                className="relative group bg-gray-900"
              >
                <img src={src} alt={`${title} photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform" />
                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <ImageIcon className="h-4 w-4" /> +{remaining} more
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* "View all photos" button — bottom-right of the grid */}
      {photos.length > 1 && (
        <button
          onClick={() => onOpenLightbox(0)}
          className="hidden md:flex absolute bottom-4 right-4 items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition"
        >
          <Camera className="h-3.5 w-3.5" /> View all {photos.length} photos
        </button>
      )}

      {/* Save & share — always present, top-right */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={onSave}
          className="p-2.5 bg-white/95 rounded-full shadow-md hover:bg-white transition-all"
          aria-label="Save listing"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
        <button
          onClick={onShare}
          className="p-2.5 bg-white/95 rounded-full shadow-md hover:bg-white transition-all"
          aria-label="Share listing"
        >
          <Share2 className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Stats — top-left */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="flex items-center gap-1.5 bg-black/55 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
          <Eye className="h-3 w-3" /> {viewCount}
        </div>
        <div className="flex items-center gap-1.5 bg-black/55 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
          <Bookmark className="h-3 w-3" /> {saveCount}
        </div>
      </div>
    </div>
  );
}

// ─── Lightbox — fullscreen photo viewer with keyboard + click navigation ────
function Lightbox({
  photos, startIdx, title, onClose,
}: {
  photos: string[];
  startIdx: number;
  title: string;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);

  // Keyboard nav: ← → to flip, Esc to close. Body scroll is locked while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIdx(i => (i + 1) % photos.length);
      else if (e.key === "ArrowLeft") setIdx(i => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [photos.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-3 text-white text-sm">
        <span className="font-semibold truncate">{title}</span>
        <div className="flex items-center gap-4">
          <span className="text-white/70">{idx + 1} / {photos.length}</span>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center px-4 pb-4" onClick={e => e.stopPropagation()}>
        <img src={photos[idx]} alt={`${title} ${idx + 1}`} className="max-h-full max-w-full object-contain" />
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-white"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIdx(i => (i + 1) % photos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-white"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="px-5 py-3 flex gap-2 overflow-x-auto bg-black/60" onClick={e => e.stopPropagation()}>
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`shrink-0 h-16 w-24 rounded overflow-hidden border-2 transition ${i === idx ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
