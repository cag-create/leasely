import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, MapPin, Star, Shield, CheckCircle2, Wrench, Zap,
  Droplets, Wind, Hammer, Paintbrush, TreePine, Bug, Sparkles,
  ChevronRight, PlusCircle, Phone, Clock, Award, Upload
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",
  IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
  MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",
  NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",
  NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",
  PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",
  TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",
  WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"
};

const TRADES = [
  { value: "plumbing", label: "Plumbing", icon: Droplets },
  { value: "electrical", label: "Electrical", icon: Zap },
  { value: "hvac", label: "HVAC", icon: Wind },
  { value: "general", label: "General Handyman", icon: Wrench },
  { value: "roofing", label: "Roofing", icon: Hammer },
  { value: "flooring", label: "Flooring", icon: Hammer },
  { value: "painting", label: "Painting", icon: Paintbrush },
  { value: "landscaping", label: "Landscaping", icon: TreePine },
  { value: "pest_control", label: "Pest Control", icon: Bug },
  { value: "appliance", label: "Appliance Repair", icon: Wrench },
  { value: "carpentry", label: "Carpentry", icon: Hammer },
  { value: "cleaning", label: "Cleaning", icon: Sparkles },
  { value: "other", label: "Other", icon: Wrench },
];

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

export default function ContractorDirectory() {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedTrade, setSelectedTrade] = useState<string>("all");
  const { data: me } = trpc.auth.me.useQuery(undefined, { retry: false });
  const isAdmin = (me as any)?.role === "admin";

  const { data: contractors = [], isLoading } = trpc.contractors.list.useQuery({
    state: selectedState !== "all" ? selectedState : undefined,
    trade: selectedTrade !== "all" ? selectedTrade : undefined,
    search: search.length > 1 ? search : undefined,
  });

  const featured = contractors.filter((c: any) => c.featured === 1);
  const regular = contractors.filter((c: any) => c.featured !== 1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div
        className="relative py-20 px-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #0f1f4a 60%, #062018 100%)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #4F46E5 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4f8ef7 0%, transparent 40%)" }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>
            <Wrench className="h-3.5 w-3.5" />
            Nationwide Contractor Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Find Trusted Handymen &<br />
            <span style={{ color: ACCENT }}>Contractors Near You</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Browse verified, background-checked contractors and handymen across all 50 states.
            From plumbing to painting — find the right pro for any job.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, city, or specialty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-12 bg-white text-gray-900 border-0 rounded-xl text-base"
              />
            </div>
            <Link href="/contractors/register">
              <Button
                className="h-12 px-6 font-bold rounded-xl whitespace-nowrap"
                style={{ background: ACCENT, color: "#062018" }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                List Your Business
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/import-contractors">
                <Button variant="outline" className="h-12 px-5 font-bold rounded-xl whitespace-nowrap bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Upload className="h-4 w-4 mr-2" /> Import list
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-44 h-9">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map(s => (
                <SelectItem key={s} value={s}>{STATE_NAMES[s] ?? s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTrade} onValueChange={setSelectedTrade}>
            <SelectTrigger className="w-48 h-9">
              <Wrench className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Trades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              {TRADES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedState !== "all" || selectedTrade !== "all" || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedState("all"); setSelectedTrade("all"); setSearch(""); }}
              className="h-9 text-muted-foreground"
            >
              Clear filters
            </Button>
          )}

          <div className="ml-auto text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${contractors.length} contractor${contractors.length !== 1 ? "s" : ""} found`}
          </div>
        </div>
      </div>

      {/* Trade quick-filter pills */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-wrap gap-2">
          {TRADES.slice(0, 8).map(t => {
            const Icon = t.icon;
            const active = selectedTrade === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setSelectedTrade(active ? "all" : t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  active
                    ? "border-[#4F46E5] bg-[#4F46E5]/10 text-[#4F46E5]"
                    : "border-border bg-card text-muted-foreground hover:border-[#4F46E5]/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : contractors.length === 0 ? (
          <div className="text-center py-20">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No contractors found</h3>
            <p className="text-muted-foreground mb-6">
              {search || selectedState !== "all" || selectedTrade !== "all"
                ? "Try adjusting your filters."
                : "Be the first to list your business in this area!"}
            </p>
            <Link href="/contractors/register">
              <Button style={{ background: ACCENT, color: "#062018" }} className="font-bold">
                <PlusCircle className="h-4 w-4 mr-2" />
                Register Your Business
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {featured.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-4 w-4" style={{ color: ACCENT }} />
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Featured Contractors</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((c: any) => <ContractorCard key={c.id} contractor={c} featured />)}
                </div>
              </div>
            )}

            {/* All contractors */}
            {regular.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">All Contractors</h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regular.map((c: any) => <ContractorCard key={c.id} contractor={c} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA for contractors */}
      <div className="border-t border-border bg-card mt-8">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-foreground mb-3">Are you a contractor or handyman?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Get discovered by thousands of property managers and landlords nationwide.
            Create your free profile today — no subscription required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contractors/register">
              <Button size="lg" className="font-bold px-8" style={{ background: ACCENT, color: "#062018" }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Free Profile
              </Button>
            </Link>
            <Link href="/pro">
              <Button size="lg" variant="outline" className="font-bold px-8">
                <Sparkles className="h-4 w-4 mr-2" />
                Learn About Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractorCard({ contractor, featured = false }: { contractor: any; featured?: boolean }) {
  const trades: string[] = contractor.trades ? JSON.parse(contractor.trades) : [];
  const tradeLabels = trades.slice(0, 3).map(t => TRADES.find(tr => tr.value === t)?.label ?? t);

  return (
    <Link href={`/contractors/${contractor.slug ?? contractor.id}`}>
      <div className={`rounded-2xl border bg-card p-6 hover:shadow-lg transition-all cursor-pointer group ${
        featured ? "border-[#4F46E5]/40 shadow-[0_0_0_1px_rgba(79,70,229,0.15)]" : "border-border hover:border-[#4F46E5]/40"
      }`}>
        {featured && (
          <div className="flex items-center gap-1 mb-3">
            <Award className="h-3.5 w-3.5" style={{ color: ACCENT }} />
            <span className="text-xs font-bold" style={{ color: ACCENT }}>Featured</span>
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          {contractor.photoUrl ? (
            <img
              src={contractor.photoUrl}
              alt={contractor.businessName}
              className="h-16 w-16 rounded-2xl object-cover border border-border shrink-0"
            />
          ) : (
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #2a4090)` }}
            >
              {(contractor.businessName || "C")[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate group-hover:text-[#4F46E5] transition-colors">
              {contractor.businessName}
            </h3>
            {contractor.ownerName && (
              <p className="text-xs text-muted-foreground mt-0.5">{contractor.ownerName}</p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {[contractor.city, STATE_NAMES[contractor.state] ?? contractor.state].filter(Boolean).join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Rating */}
        {contractor.averageRating != null && Number(contractor.averageRating) > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {[1,2,3,4,5].map(n => (
              <Star
                key={n}
                className={`h-3.5 w-3.5 ${n <= Math.round(Number(contractor.averageRating)) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
              />
            ))}
            <span className="text-xs font-semibold text-foreground">
              {Number(contractor.averageRating).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">({contractor.reviewCount} reviews)</span>
          </div>
        )}

        {/* Bio */}
        {contractor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{contractor.bio}</p>
        )}

        {/* Trades */}
        {tradeLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tradeLabels.map(t => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {contractor.insuranceVerified === 1 && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Shield className="h-3 w-3" /> Insured
            </span>
          )}
          {contractor.backgroundChecked === 1 && (
            <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              <CheckCircle2 className="h-3 w-3" /> Background Checked
            </span>
          )}
          {contractor.emergencyService === 1 && (
            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <Clock className="h-3 w-3" /> Emergency Available
            </span>
          )}
          {contractor.freeEstimates === 1 && (
            <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
              <CheckCircle2 className="h-3 w-3" /> Free Estimates
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
          <span>{contractor.jobsCompleted ?? 0} jobs completed</span>
          <span className="flex items-center gap-1 font-semibold group-hover:gap-2 transition-all" style={{ color: ACCENT }}>
            View Profile <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
