import { useState, useCallback } from "react";
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
  Building2, ExternalLink, CheckCircle2, X
} from "lucide-react";
import { formatRent, getListingImage, parsePhotos, PROPERTY_TYPE_LABELS, PLACEHOLDER_IMAGES } from "@/lib/marketplace";

const BRAND = "#1B2B5E";
const ACCENT = "#00C896";

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const listingId = parseInt(params.id ?? "0");
  const { isAuthenticated } = useAuth();
  const [photoIdx, setPhotoIdx] = useState(0);
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
            <Button style={{ background: ACCENT, color: "#0a2a1f" }}>Browse All Listings</Button>
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

        {/* Photo Gallery */}
        <div className="relative rounded-3xl overflow-hidden mb-8 bg-gray-900 h-96 lg:h-[500px]">
          <img
            src={allPhotos[photoIdx]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPhotoIdx(i => (i + 1) % allPhotos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allPhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`h-2 rounded-full transition-all ${i === photoIdx ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleSave}
              className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
            >
              <Heart className={`h-5 w-5 ${saved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          {/* Stats */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="flex items-center gap-1.5 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Eye className="h-4 w-4" /> {listing.viewCount} views
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Bookmark className="h-4 w-4" /> {listing.saveCount} saves
            </div>
          </div>
        </div>

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
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full font-bold"
                    style={{ background: ACCENT, color: "#0a2a1f" }}
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
