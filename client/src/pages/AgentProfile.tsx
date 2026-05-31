import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  Star, MapPin, Phone, Award, ChevronLeft, Send, CheckCircle2,
  Building2, Users, MessageSquare, Loader2
} from "lucide-react";

export default function AgentProfile() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: agent, isLoading } = trpc.cremeAgent.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );
  const { data: reviews } = trpc.cremeAgent.getReviews.useQuery(
    { agentId: Number(id) },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-center px-4">
          <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
          <h2 className="text-xl font-bold text-foreground mb-2">Agent not found</h2>
          <Button variant="ghost" onClick={() => navigate("/agents")} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to agents
          </Button>
        </div>
      </div>
    );
  }

  const areas = (agent.serviceAreas as string[]) ?? [];
  const specialties = (agent.specialties as string[]) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/agents")} className="gap-2 -ml-2">
          <ChevronLeft className="h-4 w-4" /> All Agents
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Profile */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-5">
                {agent.photoUrl ? (
                  <img
                    src={agent.photoUrl}
                    alt={agent.name ?? undefined}
                    className="h-24 w-24 rounded-2xl object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-[#1B2B5E]/10 flex items-center justify-center text-[#1B2B5E] text-3xl font-black shrink-0">
                    {(agent.name || "A")[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-black text-foreground">{agent.name}</h1>
                  {agent.licenseNumber && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Award className="h-3.5 w-3.5" />
                      License #{agent.licenseNumber}
                    </div>
                  )}
                  {agent.averageRating != null && Number(agent.averageRating) > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${n <= Math.round(Number(agent.averageRating)) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                        />
                      ))}
                      <span className="text-sm font-semibold text-foreground">
                        {Number(agent.averageRating).toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({agent.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-[#1B2B5E]/10 text-[#1B2B5E] border-[#1B2B5E]/20 gap-1">
                      <Building2 className="h-3 w-3" />
                      {agent.dealCount ?? 0} deals
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-[#4F46E5]" />
                      Verified Agent
                    </Badge>
                  </div>
                </div>
              </div>

              {agent.bio && (
                <div className="mt-5 pt-5 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-2">About</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{agent.bio}</p>
                </div>
              )}

              {areas.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
                    <MapPin className="h-4 w-4" /> Service Areas
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {areas.map(area => (
                      <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {specialties.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-foreground mb-2">Specialties</div>
                  <div className="flex flex-wrap gap-1.5">
                    {specialties.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            <ReviewsSection agentId={Number(id)} reviews={reviews ?? []} />
          </div>

          {/* Right: Contact Form */}
          <div>
            <ContactForm agentId={Number(id)} agentName={agent.name || "this agent"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ agentId, reviews }: { agentId: number; reviews: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reviewerName: "", reviewerEmail: "", rating: 5, body: "" });
  const utils = trpc.useUtils();

  const submit = trpc.cremeAgent.submitReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted! It will appear after moderation.");
      setShowForm(false);
      setForm({ reviewerName: "", reviewerEmail: "", rating: 5, body: "" });
      utils.cremeAgent.getReviews.invalidate({ agentId });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Reviews</h3>
          {reviews.length > 0 && (
            <Badge variant="secondary" className="text-xs">{reviews.length}</Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)} className="text-xs">
          {showForm ? "Cancel" : "Write Review"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/30 rounded-xl p-4 mb-5 space-y-3 border border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Your Name</Label>
              <Input
                value={form.reviewerName}
                onChange={e => setForm(f => ({ ...f, reviewerName: e.target.value }))}
                placeholder="Jane Smith"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Your Email</Label>
              <Input
                value={form.reviewerEmail}
                onChange={e => setForm(f => ({ ...f, reviewerEmail: e.target.value }))}
                placeholder="jane@example.com"
                type="email"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setForm(f => ({ ...f, rating: n }))}
                  className="p-0.5 hover:scale-110 transition-transform"
                >
                  <Star className={`h-6 w-6 ${n <= form.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Review</Label>
            <Textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Share your experience working with this agent..."
              className="text-sm resize-none"
              rows={3}
            />
          </div>
          <Button
            size="sm"
            onClick={() => submit.mutate({ agentId, ...form })}
            disabled={submit.isPending || !form.reviewerName || !form.reviewerEmail || !form.body}
            className="gap-2 w-full bg-[#1B2B5E] hover:bg-[#1B2B5E]/90"
          >
            {submit.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit Review
          </Button>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
          No reviews yet. Be the first!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-foreground">{r.reviewerName}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactForm({ agentId, agentName }: { agentId: number; agentName: string }) {
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "",
    propertyAddress: "", message: "", leadType: "general" as const,
  });
  const [sent, setSent] = useState(false);

  const submit = trpc.cremeAgent.requestAgent.useMutation({
    onSuccess: () => setSent(true),
    onError: (e) => toast.error(e.message),
  });

  if (sent) {
    return (
      <div className="rounded-2xl border border-[#4F46E5]/30 bg-[#4F46E5]/5 p-6 text-center space-y-3 sticky top-8">
        <CheckCircle2 className="h-10 w-10 text-[#4F46E5] mx-auto" />
        <h3 className="font-bold text-foreground">Request Sent!</h3>
        <p className="text-sm text-muted-foreground">
          {agentName} will be in touch with you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4 sticky top-8">
      <h3 className="font-bold text-foreground">Contact {agentName}</h3>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Your Name *</Label>
          <Input
            value={form.clientName}
            onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
            placeholder="John Smith"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email *</Label>
          <Input
            type="email"
            value={form.clientEmail}
            onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
            placeholder="john@example.com"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Phone</Label>
          <Input
            value={form.clientPhone}
            onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
            placeholder="(555) 000-0000"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Property Address</Label>
          <Input
            value={form.propertyAddress}
            onChange={e => setForm(f => ({ ...f, propertyAddress: e.target.value }))}
            placeholder="123 Main St, City, State"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">I'm looking to</Label>
          <select
            value={form.leadType}
            onChange={e => setForm(f => ({ ...f, leadType: e.target.value as any }))}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="general">General inquiry</option>
            <option value="investor">Investment property</option>
            <option value="fsbo">Selling my property</option>
            <option value="novation">Novation deal</option>
            <option value="fix_flip">Fix &amp; flip</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Message *</Label>
          <Textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Tell the agent what you're looking for..."
            className="text-sm resize-none"
            rows={4}
          />
        </div>
      </div>

      <Button
        onClick={() => submit.mutate({ agentId, ...form })}
        disabled={submit.isPending || !form.clientName || !form.clientEmail || !form.message}
        className="w-full gap-2 bg-[#1B2B5E] hover:bg-[#1B2B5E]/90"
      >
        {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send Request
      </Button>
    </div>
  );
}
