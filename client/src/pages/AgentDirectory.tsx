import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Star, Search, MapPin, Phone, Mail, Award, ChevronRight, Users } from "lucide-react";

export default function AgentDirectory() {
  const [search, setSearch] = useState("");

  const { data: agents, isLoading } = trpc.cremeAgent.getApproved.useQuery();

  const filtered = (agents ?? []).filter(a =>
    !search ||
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    (a.serviceAreas as string[])?.some(area =>
      area.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1B2B5E] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30 text-xs">
            Creme Agent Network
          </Badge>
          <h1 className="text-4xl font-black">Close Deals Faster.</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            The Creme Agent Network connects landlords, investors, and FSBO sellers with specialized agents. Buy, sell, invest, or novate — with agents who know your market.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {["Background-checked agents", "Available nationwide", "Investor & FSBO specialists", "No upfront cost"].map(item => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-[#F5A623] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623] inline-block" />
                {item}
              </span>
            ))}
          </div>
          <div className="relative max-w-lg mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or area..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-12 bg-white text-gray-900 border-0 rounded-xl text-base"
            />
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            {search ? (
              <>
                <p className="text-lg font-medium">No agents match your search.</p>
                <Button variant="ghost" className="mt-2" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-foreground">Background-checked agents · Available nationwide</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Our agent network is actively growing. Check back soon or{" "}
                  <a href="mailto:support@leasely.net" className="text-[#F5A623] underline">contact us</a>{" "}
                  to connect with a specialist in your area.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: any }) {
  const areas = (agent.serviceAreas as string[]) ?? [];
  const specialties = (agent.specialties as string[]) ?? [];

  return (
    <Link href={`/agents/${agent.id}`}>
      <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-[#F5A623]/40 transition-all cursor-pointer group">
        <div className="flex items-center gap-4 mb-4">
          {agent.photoUrl ? (
            <img
              src={agent.photoUrl}
              alt={agent.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#1B2B5E]/10 flex items-center justify-center text-[#1B2B5E] text-xl font-black border-2 border-border">
              {(agent.name || "A")[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate group-hover:text-[#F5A623] transition-colors">
              {agent.name}
            </h3>
            {agent.licenseNumber && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Award className="h-3 w-3" />
                License #{agent.licenseNumber}
              </div>
            )}
            {agent.averageRating != null && Number(agent.averageRating) > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-foreground">
                  {Number(agent.averageRating).toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({agent.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>
        </div>

        {agent.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{agent.bio}</p>
        )}

        {areas.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{areas.slice(0, 3).join(", ")}</span>
          </div>
        )}

        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {specialties.slice(0, 3).map((s: string) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end text-xs pt-3 border-t border-border">
          <span className="flex items-center gap-1 text-[#F5A623] font-semibold group-hover:gap-2 transition-all">
            View Profile <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
