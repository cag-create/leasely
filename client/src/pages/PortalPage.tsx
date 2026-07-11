import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Bed, Bath, DollarSign, Phone, Mail, Globe,
  Facebook, Instagram, ExternalLink, Home, Building2,
  ChevronRight, Users, Star, Shield, QrCode
} from "lucide-react";
import { formatRent, getListingImage, PROPERTY_TYPE_LABELS } from "@/lib/marketplace";

const DEFAULT_BRAND = "#1B2B5E";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "27, 43, 94";
}

export default function PortalPage({ subdomainOverride }: { subdomainOverride?: string } = {}) {
  const params = useParams<{ subdomain: string }>();
  // When reached via a real subdomain (sunrise.leasely.net) App passes it as a
  // prop; via the /portal/:subdomain path it comes from the route params.
  const subdomain = subdomainOverride ?? params.subdomain;

  const { data: portal, isLoading, error } = trpc.marketplace.getPortalBySubdomain.useQuery(
    { subdomain: subdomain ?? "" },
    { enabled: !!subdomain }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-800 mb-2">Portal Not Found</h1>
          <p className="text-gray-500 mb-6">
            The portal <strong>{subdomain}</strong> doesn't exist or hasn't been set up yet.
          </p>
          <Link href="/">
            <Button>Browse Leasely Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const brandColor = portal.brandColor ?? DEFAULT_BRAND;
  const rgb = hexToRgb(brandColor);
  const socialLinks = portal.portalSocialLinks as Record<string, string> ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta — injected via document title */}
      {typeof document !== "undefined" && (() => {
        document.title = `${portal.brandName} — Rental Properties`;
        return null;
      })()}

      {/* Hero Header */}
      <header
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColor} 0%, rgba(${rgb},0.8) 100%)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative container mx-auto px-4 max-w-6xl py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Logo / Brand */}
            <div className="shrink-0">
              {portal.brandLogoUrl ? (
                <img
                  src={portal.brandLogoUrl}
                  alt={portal.brandName}
                  className="h-24 w-24 rounded-2xl object-cover shadow-xl border-4 border-white/30"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white/30 bg-white/20">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-sm">
                {portal.brandName}
              </h1>
              {portal.portalTagline && (
                <p className="text-white/80 text-lg mb-4">{portal.portalTagline}</p>
              )}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge className="bg-white/20 text-white border-white/30 font-semibold">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  Verified on Leasely
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold">
                  <Home className="h-3.5 w-3.5 mr-1.5" />
                  {portal.listings.length} Active {portal.listings.length === 1 ? "Listing" : "Listings"}
                </Badge>
              </div>

              {/* Social links */}
              {(socialLinks.website || socialLinks.facebook || socialLinks.instagram) && (
                <div className="flex gap-3 mt-4 justify-center md:justify-start">
                  {socialLinks.website && (
                    <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
                      className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Globe className="h-4 w-4 text-white" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Facebook className="h-4 w-4 text-white" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Instagram className="h-4 w-4 text-white" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Contact card */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 min-w-52 text-center">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Contact</p>
              {portal.ownerName && (
                <p className="text-white font-bold mb-1">{portal.ownerName}</p>
              )}
              {portal.ownerEmail && (
                <a href={`mailto:${portal.ownerEmail}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors justify-center mb-1">
                  <Mail className="h-3.5 w-3.5" />
                  {portal.ownerEmail}
                </a>
              )}
              <a href="#listings"
                className="mt-3 block w-full py-2 rounded-xl bg-white font-bold text-sm transition-all hover:bg-white/90"
                style={{ color: brandColor }}>
                View All Listings
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-3 divide-x">
            {[
              { icon: Home, label: "Active Listings", value: portal.listings.length },
              { icon: Users, label: "Co-Living Options", value: portal.listings.filter((l: any) => l.isCoLiving).length },
              { icon: Star, label: "Verified Pro", value: "✓" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="py-4 px-6 text-center">
                <div className="text-2xl font-black text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      <main className="container mx-auto px-4 max-w-6xl py-12" id="listings">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Available Properties</h2>
            <p className="text-gray-500 mt-1">
              {portal.listings.length > 0
                ? `${portal.listings.length} ${portal.listings.length === 1 ? "property" : "properties"} available`
                : "No listings available right now — check back soon."}
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" className="gap-2 text-sm">
              Browse All on Leasely <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {portal.listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Home className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">No listings yet</h3>
            <p className="text-gray-400">Check back soon for available properties.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portal.listings.map((listing: any) => (
              <PortalListingCard key={listing.id} listing={listing} brandColor={brandColor} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-bold text-gray-800">{portal.brandName}</p>
              {portal.portalTagline && <p className="text-sm text-gray-500">{portal.portalTagline}</p>}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Powered by</span>
              <Link href="/" className="font-bold text-gray-700 hover:text-blue-600 transition-colors">
                Leasely
              </Link>
              <span>·</span>
              <Link href="/marketplace" className="hover:text-gray-600 transition-colors">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PortalListingCard({ listing, brandColor }: { listing: any; brandColor: string }) {
  const image = getListingImage(listing.photos, listing.id);
  const typeLabel = PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="text-xs font-bold bg-white text-gray-800 shadow-sm">{typeLabel}</Badge>
          {listing.isCoLiving ? (
            <Badge className="text-xs font-bold bg-purple-100 text-purple-700 border-0">Co-Living</Badge>
          ) : null}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {listing.city}, {listing.state}
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{listing.bedrooms} bd</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{listing.bathrooms} ba</span>
          {listing.petFriendly ? <span className="text-xs text-green-600 font-medium">🐾 Pet OK</span> : null}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black" style={{ color: brandColor }}>
              {formatRent(listing.monthlyRent)}
            </span>
            <span className="text-gray-400 text-sm">/mo</span>
          </div>
          <Link href={`/listing/${listing.id}`}>
            <Button size="sm" className="font-bold gap-1.5 text-xs"
              style={{ background: brandColor, color: "white" }}>
              View Details <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
