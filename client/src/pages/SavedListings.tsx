import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Heart, Lock, Building2, ArrowRight } from "lucide-react";

const ACCENT = "#00C896";

export default function SavedListings() {
  const { isAuthenticated } = useAuth();

  const { data: savedListings = [], isLoading } = trpc.marketplace.getSavedListings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 max-w-lg py-24 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-sm border">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-3">Sign In to View Saved Listings</h2>
            <p className="text-gray-500 mb-6">Save properties you love and revisit them anytime.</p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="w-full font-bold" style={{ background: ACCENT, color: "#0a2a1f" }}>
                Sign In / Create Account
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Heart className="h-7 w-7 text-red-500 fill-red-500" />
              Saved Listings
            </h1>
            <p className="text-gray-500 mt-1">
              {isLoading ? "Loading..." : `${savedListings.length} saved ${savedListings.length === 1 ? "property" : "properties"}`}
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" className="gap-2">
              Browse More <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
        ) : savedListings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No saved listings yet</h3>
            <p className="text-gray-400 mb-6">Browse the marketplace and tap the heart icon to save properties you love.</p>
            <Link href="/marketplace">
              <Button style={{ background: ACCENT, color: "#0a2a1f" }} className="font-bold gap-2">
                Browse Listings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map(listing => (
              <PropertyCard key={listing.id} listing={listing} isSaved={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
