import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Star, MapPin, Phone, Mail, Globe, Shield, CheckCircle2, Clock,
  Wrench, ChevronLeft, Award, Facebook, Instagram, Linkedin,
  Calendar, DollarSign, Zap, Droplets, Wind, Hammer, Paintbrush,
  TreePine, Bug, Sparkles, MessageSquare, ExternalLink, Eye
} from "lucide-react";

const BRAND = "#1B2B5E";
const ACCENT = "#00C896";

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

const TRADE_LABELS: Record<string, string> = {
  plumbing:"Plumbing", electrical:"Electrical", hvac:"HVAC", general:"General Handyman",
  roofing:"Roofing", flooring:"Flooring", painting:"Painting", landscaping:"Landscaping",
  pest_control:"Pest Control", appliance:"Appliance Repair", carpentry:"Carpentry",
  masonry:"Masonry", drywall:"Drywall", tile:"Tile", windows:"Windows & Doors",
  fencing:"Fencing", decking:"Decking", concrete:"Concrete", cleaning:"Cleaning", other:"Other"
};

export default function ContractorProfile() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Try numeric ID first, then slug
  const isNumeric = /^\d+$/.test(params.slug ?? "");

  const { data: contractor, isLoading, error } = isNumeric
    ? trpc.contractors.getById.useQuery({ id: parseInt(params.slug!) }, { retry: false })
    : trpc.contractors.getBySlug.useQuery({ slug: params.slug! }, { retry: false });

  const { data: reviews = [] } = trpc.contractors.getReviews.useQuery(
    { contractorId: contractor?.id ?? 0 },
    { enabled: !!contractor?.id }
  );

  const submitLead = trpc.contractors.submitLead.useMutation({
    onSuccess: () => {
      toast.success("Request sent!", { description: "The contractor will be in touch shortly." });
      setContactOpen(false);
      setLeadForm({ clientName: "", clientEmail: "", clientPhone: "", jobType: "", propertyAddress: "", message: "", urgency: "flexible" });
    },
    onError: (e) => toast.error("Failed to send request", { description: e.message }),
  });

  const submitReview = trpc.contractors.submitReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted!", { description: "Your review will appear after moderation." });
      setReviewOpen(false);
      setReviewForm({ reviewerName: "", reviewerEmail: "", rating: 5, title: "", body: "", jobType: "" });
    },
    onError: (e) => toast.error("Failed to submit review", { description: e.message }),
  });

  const [leadForm, setLeadForm] = useState({
    clientName: user?.name ?? "",
    clientEmail: user?.email ?? "",
    clientPhone: "",
    jobType: "",
    propertyAddress: "",
    message: "",
    urgency: "flexible" as "flexible" | "within_week" | "within_month" | "emergency",
  });

  const [reviewForm, setReviewForm] = useState({
    reviewerName: user?.name ?? "",
    reviewerEmail: user?.email ?? "",
    rating: 5,
    title: "",
    body: "",
    jobType: "",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
          <div className="h-48 bg-muted rounded-2xl" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-bold text-foreground mb-2">Contractor not found</h2>
          <p className="text-muted-foreground mb-6">This profile may have been removed or is pending approval.</p>
          <Button onClick={() => navigate("/contractors")} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  const trades: string[] = contractor.trades ? JSON.parse(contractor.trades as string) : [];
  const specialties: string[] = contractor.specialties ? JSON.parse(contractor.specialties as string) : [];
  const serviceAreas: string[] = contractor.serviceAreas ? JSON.parse(contractor.serviceAreas as string) : [];
  const portfolioPhotos: string[] = contractor.portfolioPhotos ? JSON.parse(contractor.portfolioPhotos as string) : [];

  const avgRating = Number(contractor.averageRating ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      <div
        className="h-48 md:h-64 relative"
        style={{
          background: contractor.bannerUrl
            ? `url(${contractor.bannerUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${BRAND} 0%, #0f1f4a 60%, #062018 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/contractors")}
            className="text-white hover:bg-white/20 gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> All Contractors
          </Button>
        </div>
        {contractor.featured === 1 && (
          <div className="absolute top-4 right-4">
            <Badge className="gap-1" style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>
              <Award className="h-3 w-3" /> Featured
            </Badge>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Profile header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-5">
            {/* Avatar */}
            {contractor.photoUrl ? (
              <img
                src={contractor.photoUrl}
                alt={contractor.businessName ?? ""}
                className="h-28 w-28 rounded-2xl object-cover border-4 border-background shadow-lg shrink-0"
              />
            ) : (
              <div
                className="h-28 w-28 rounded-2xl border-4 border-background shadow-lg flex items-center justify-center text-white text-4xl font-black shrink-0"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #2a4090)` }}
              >
                {(contractor.businessName || "C")[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-foreground">{contractor.businessName}</h1>
              </div>
              {contractor.ownerName && (
                <p className="text-muted-foreground text-sm mb-1">Owner: {contractor.ownerName}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[contractor.city, STATE_NAMES[contractor.state ?? ""] ?? contractor.state].filter(Boolean).join(", ")}
                </span>
                {contractor.yearsInBusiness && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {contractor.yearsInBusiness} yrs in business
                  </span>
                )}
                {contractor.profileViews != null && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {contractor.profileViews} profile views
                  </span>
                )}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 pb-2 shrink-0">
              <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogTrigger asChild>
                  <Button className="font-bold gap-2" style={{ background: ACCENT, color: "#062018" }}>
                    <MessageSquare className="h-4 w-4" />
                    Request a Quote
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Request a Quote from {contractor.businessName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Your Name *</Label>
                        <Input value={leadForm.clientName} onChange={e => setLeadForm(f => ({ ...f, clientName: e.target.value }))} placeholder="John Smith" />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={leadForm.clientPhone} onChange={e => setLeadForm(f => ({ ...f, clientPhone: e.target.value }))} placeholder="(555) 000-0000" />
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={leadForm.clientEmail} onChange={e => setLeadForm(f => ({ ...f, clientEmail: e.target.value }))} placeholder="you@example.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Job Type</Label>
                        <Input value={leadForm.jobType} onChange={e => setLeadForm(f => ({ ...f, jobType: e.target.value }))} placeholder="e.g. Plumbing repair" />
                      </div>
                      <div>
                        <Label>Urgency</Label>
                        <Select value={leadForm.urgency} onValueChange={v => setLeadForm(f => ({ ...f, urgency: v as any }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flexible">Flexible</SelectItem>
                            <SelectItem value="within_week">Within a week</SelectItem>
                            <SelectItem value="within_month">Within a month</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Property Address</Label>
                      <Input value={leadForm.propertyAddress} onChange={e => setLeadForm(f => ({ ...f, propertyAddress: e.target.value }))} placeholder="123 Main St, City, State" />
                    </div>
                    <div>
                      <Label>Describe the Job</Label>
                      <Textarea value={leadForm.message} onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe what needs to be done..." rows={3} />
                    </div>
                    <Button
                      className="w-full font-bold"
                      style={{ background: ACCENT, color: "#062018" }}
                      disabled={!leadForm.clientName || submitLead.isPending}
                      onClick={() => submitLead.mutate({ contractorId: contractor.id, ...leadForm })}
                    >
                      {submitLead.isPending ? "Sending..." : "Send Request"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {contractor.phone && (
                <Button variant="outline" className="gap-2 font-semibold" asChild>
                  <a href={`tel:${contractor.phone}`}>
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-16">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {contractor.bio && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">{contractor.bio}</p>
              </div>
            )}

            {/* Trades & Specialties */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Services & Trades</h2>
              {trades.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trades</p>
                  <div className="flex flex-wrap gap-2">
                    {trades.map(t => (
                      <Badge key={t} variant="secondary" className="text-sm px-3 py-1">
                        {TRADE_LABELS[t] ?? t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {specialties.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map(s => (
                      <Badge key={s} variant="outline" className="text-sm">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio photos */}
            {portfolioPhotos.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {portfolioPhotos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Portfolio ${i + 1}`}
                      className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Reviews {reviews.length > 0 && <span className="text-muted-foreground font-normal text-base">({reviews.length})</span>}
                </h2>
                <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Star className="h-3.5 w-3.5" />
                      Write a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Review {contractor.businessName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label>Your Rating *</Label>
                        <div className="flex gap-1 mt-1">
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                              <Star className={`h-7 w-7 transition-colors ${n <= reviewForm.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Your Name *</Label>
                          <Input value={reviewForm.reviewerName} onChange={e => setReviewForm(f => ({ ...f, reviewerName: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Job Type</Label>
                          <Input value={reviewForm.jobType} onChange={e => setReviewForm(f => ({ ...f, jobType: e.target.value }))} placeholder="e.g. Plumbing" />
                        </div>
                      </div>
                      <div>
                        <Label>Email (optional)</Label>
                        <Input type="email" value={reviewForm.reviewerEmail} onChange={e => setReviewForm(f => ({ ...f, reviewerEmail: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Review Title</Label>
                        <Input value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} placeholder="Great work!" />
                      </div>
                      <div>
                        <Label>Your Review</Label>
                        <Textarea value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} rows={3} placeholder="Share your experience..." />
                      </div>
                      <Button
                        className="w-full font-bold"
                        style={{ background: ACCENT, color: "#062018" }}
                        disabled={!reviewForm.reviewerName || submitReview.isPending}
                        onClick={() => submitReview.mutate({ contractorId: contractor.id, ...reviewForm })}
                      >
                        {submitReview.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Rating summary */}
                  {avgRating > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 mb-4">
                      <div className="text-center">
                        <div className="text-4xl font-black text-foreground">{avgRating.toFixed(1)}</div>
                        <div className="flex gap-0.5 justify-center mt-1">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={`h-4 w-4 ${n <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</div>
                      </div>
                    </div>
                  )}
                  {reviews.map((r: any) => (
                    <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-semibold text-sm text-foreground">{r.reviewerName}</span>
                          {r.jobType && <span className="text-xs text-muted-foreground ml-2">· {r.jobType}</span>}
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </div>
                      {r.title && <p className="text-sm font-semibold text-foreground mb-1">{r.title}</p>}
                      {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-5">
            {/* Contact card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-foreground mb-4">Contact</h3>
              <div className="space-y-3">
                {contractor.phone && (
                  <a href={`tel:${contractor.phone}`} className="flex items-center gap-3 text-sm text-foreground hover:text-[#00C896] transition-colors">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    {contractor.phone}
                  </a>
                )}
                {contractor.email && (
                  <a href={`mailto:${contractor.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-[#00C896] transition-colors">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    {contractor.email}
                  </a>
                )}
                {contractor.website && (
                  <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-[#00C896] transition-colors">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    Website
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
              </div>

              {/* Social links */}
              {(contractor.socialFacebook || contractor.socialInstagram || contractor.socialLinkedin) && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                  {contractor.socialFacebook && (
                    <a href={contractor.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1877F2] transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {contractor.socialInstagram && (
                    <a href={contractor.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#E1306C] transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {contractor.socialLinkedin && (
                    <a href={contractor.socialLinkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}

              <Button
                className="w-full mt-4 font-bold gap-2"
                style={{ background: ACCENT, color: "#062018" }}
                onClick={() => setContactOpen(true)}
              >
                <MessageSquare className="h-4 w-4" />
                Request a Quote
              </Button>
            </div>

            {/* Details card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-foreground mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                {contractor.licenseNumber && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4 shrink-0" />
                    <span>License #{contractor.licenseNumber}</span>
                  </div>
                )}
                {contractor.serviceRadius && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>Serves within {contractor.serviceRadius} miles</span>
                  </div>
                )}
                {(contractor.hourlyRateMin || contractor.hourlyRateMax) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <span>
                      {contractor.hourlyRateMin && contractor.hourlyRateMax
                        ? `$${Math.round(contractor.hourlyRateMin / 100)}–$${Math.round(contractor.hourlyRateMax / 100)}/hr`
                        : contractor.hourlyRateMin
                        ? `From $${Math.round(contractor.hourlyRateMin / 100)}/hr`
                        : `Up to $${Math.round(contractor.hourlyRateMax! / 100)}/hr`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>
                    {contractor.availableWeekdays === 1 && contractor.availableWeekends === 1
                      ? "Available 7 days/week"
                      : contractor.availableWeekdays === 1
                      ? "Available weekdays"
                      : "Weekends only"}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {contractor.insuranceVerified === 1 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Shield className="h-4 w-4" /> Insured & Verified
                  </div>
                )}
                {contractor.backgroundChecked === 1 && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Background Checked
                  </div>
                )}
                {contractor.emergencyService === 1 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <Clock className="h-4 w-4" /> Emergency Service Available
                  </div>
                )}
                {contractor.freeEstimates === 1 && (
                  <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Free Estimates
                  </div>
                )}
              </div>
            </div>

            {/* Service areas */}
            {serviceAreas.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-bold text-foreground mb-3">Service Areas</h3>
                <div className="flex flex-wrap gap-1.5">
                  {serviceAreas.map(area => (
                    <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-foreground mb-3">Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl font-black text-foreground">{contractor.jobsCompleted ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Jobs Done</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl font-black text-foreground">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
