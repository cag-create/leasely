import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { MapView } from "@/components/Map";
import {
  X, MapPin, Bed, Bath, Heart, ExternalLink, Building2,
  ChevronLeft, ChevronRight, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatRent, getListingImage, PROPERTY_TYPE_LABELS } from "@/lib/marketplace";

const BRAND = "#1B2B5E";
const ACCENT = "#00C896";

type MapListing = {
  id: number;
  title: string;
  propertyType: string;
  city: string;
  state: string;
  monthlyRent: number;
  bedrooms: string;
  bathrooms: string;
  latitude: number | null;
  longitude: number | null;
  photos: string | null;
  isCoLiving: number | null;
  petFriendly: number | null;
};

export default function MapViewPage() {
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { data: listings = [] } = trpc.marketplace.getMapListings.useQuery();

  const handleMapReady = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    map.setCenter({ lat: 37.0902, lng: -95.7129 });
    map.setZoom(4);
  }, []);

  useEffect(() => {
    if (!mapInstance || listings.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;

    listings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return;

      hasValidCoords = true;
      const position = { lat: listing.latitude, lng: listing.longitude };
      bounds.extend(position);

      // Custom marker with rent label
      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: listing.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
        },
        label: {
          text: `$${Math.round(listing.monthlyRent / 100) * 100 >= 1000
            ? `${(listing.monthlyRent / 1000).toFixed(1)}k`
            : listing.monthlyRent.toString()}`,
          color: "white",
          fontWeight: "bold",
          fontSize: "11px",
        },
      });

      // Use OverlayView-style custom marker via DOM
      const markerDiv = document.createElement("div");
      markerDiv.className = "map-pin";
      markerDiv.style.cssText = `
        background: ${listing.isCoLiving ? "#7C3AED" : BRAND};
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        transition: transform 0.15s, background 0.15s;
        font-family: Inter, sans-serif;
      `;
      markerDiv.textContent = formatRent(listing.monthlyRent).replace(".00", "");

      // Use AdvancedMarkerElement if available, else fallback to Marker
      const AdvancedMarkerElement = (google.maps as any).marker?.AdvancedMarkerElement;
      if (AdvancedMarkerElement) {
        new AdvancedMarkerElement({
          position,
          map: mapInstance,
          content: markerDiv,
          title: listing.title,
        });
      }

      // Fallback to regular marker with custom icon
      const regularMarker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: listing.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="30">
              <rect rx="15" ry="15" width="80" height="30" fill="${listing.isCoLiving ? "#7C3AED" : BRAND}" stroke="white" stroke-width="2"/>
              <text x="40" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial">${formatRent(listing.monthlyRent).replace(".00", "")}</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(80, 30),
          anchor: new google.maps.Point(40, 15),
        },
      });

      regularMarker.addListener("click", () => {
        setSelectedListing(listing as MapListing);
        mapInstance.panTo(position);
        mapInstance.panBy(0, -80);
      });

      markersRef.current.push(regularMarker);
    });

    if (hasValidCoords && listings.length > 0 && listings.length < 50) {
      mapInstance.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
    }
  }, [mapInstance, listings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapInstance || !searchQuery) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${searchQuery}, USA` }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        mapInstance.setCenter(results[0].geometry.location);
        mapInstance.setZoom(11);
      }
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      {/* Map Controls Bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search any city or zip..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button type="submit" size="sm" style={{ background: ACCENT, color: "#0a2a1f" }}>
            Go
          </Button>
        </form>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full" style={{ background: BRAND }} />
            <span>Rental</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-purple-600" />
            <span>Co-Living</span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-700">{listings.length} listings</span>
        </div>

        <Link href="/marketplace">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> List View
          </Button>
        </Link>
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <MapView
            onMapReady={handleMapReady}
            className="w-full h-full"
          />
        </div>

        {/* Selected Listing Preview Panel */}
        {selectedListing && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-96 max-w-[calc(100vw-2rem)] z-20">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="relative h-48">
                <img
                  src={getListingImage(selectedListing.photos, selectedListing.id)}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedListing(null)}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full shadow hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute top-3 left-3">
                  <Badge className="text-xs font-semibold bg-white/90 text-gray-800">
                    {PROPERTY_TYPE_LABELS[selectedListing.propertyType] ?? selectedListing.propertyType}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 leading-tight line-clamp-1">{selectedListing.title}</h3>
                  <span className="text-lg font-black text-emerald-600 shrink-0">{formatRent(selectedListing.monthlyRent)}<span className="text-xs font-normal text-gray-400">/mo</span></span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedListing.city}, {selectedListing.state}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{selectedListing.bedrooms} bd</span>
                  <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{selectedListing.bathrooms} ba</span>
                  {selectedListing.isCoLiving === 1 && <Badge className="text-xs bg-purple-100 text-purple-700">Co-Living</Badge>}
                </div>
                <Link href={`/listing/${selectedListing.id}`}>
                  <Button className="w-full font-bold gap-2" style={{ background: BRAND, color: "white" }}>
                    View Details <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* No listings message */}
        {listings.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700 mb-2">No listings on map yet</h3>
            <p className="text-gray-400 text-sm mb-4">Be the first to add a property with a location!</p>
            <Link href="/list-property">
              <Button style={{ background: ACCENT, color: "#0a2a1f" }} className="font-bold">
                List Your Property
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
