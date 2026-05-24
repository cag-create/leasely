import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Wrench, CheckCircle2, Shield, Clock, DollarSign, MapPin,
  Building2, Phone, Mail, Globe, Star, ChevronRight, ChevronLeft,
  Sparkles, Award
} from "lucide-react";
import { getLoginUrl } from "@/const";

const BRAND = "#1B2B5E";
const ACCENT = "#F5A623";

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

const ALL_TRADES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "general", label: "General Handyman" },
  { value: "roofing", label: "Roofing" },
  { value: "flooring", label: "Flooring" },
  { value: "painting", label: "Painting" },
  { value: "landscaping", label: "Landscaping" },
  { value: "pest_control", label: "Pest Control" },
  { value: "appliance", label: "Appliance Repair" },
  { value: "carpentry", label: "Carpentry" },
  { value: "masonry", label: "Masonry" },
  { value: "drywall", label: "Drywall" },
  { value: "tile", label: "Tile Work" },
  { value: "windows", label: "Windows & Doors" },
  { value: "fencing", label: "Fencing" },
  { value: "decking", label: "Decking" },
  { value: "concrete", label: "Concrete" },
  { value: "cleaning", label: "Cleaning" },
  { value: "other", label: "Other" },
];

type FormData = {
  businessName: string;
  ownerName: string;
  slug: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  state: string;
  zipCode: string;
  serviceRadius: number;
  bio: string;
  yearsInBusiness: number | "";
  licenseNumber: string;
  trades: string[];
  specialties: string;
  availableWeekdays: boolean;
  availableWeekends: boolean;
  emergencyService: boolean;
  freeEstimates: boolean;
  hourlyRateMin: number | "";
  hourlyRateMax: number | "";
  socialFacebook: string;
  socialInstagram: string;
  socialLinkedin: string;
};

export default function ContractorRegister() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormData>({
    businessName: "",
    ownerName: user?.name ?? "",
    slug: "",
    phone: "",
    email: user?.email ?? "",
    website: "",
    city: "",
    state: "",
    zipCode: "",
    serviceRadius: 25,
    bio: "",
    yearsInBusiness: "",
    licenseNumber: "",
    trades: [],
    specialties: "",
    availableWeekdays: true,
    availableWeekends: false,
    emergencyService: false,
    freeEstimates: true,
    hourlyRateMin: "",
    hourlyRateMax: "",
    socialFacebook: "",
    socialInstagram: "",
    socialLinkedin: "",
  });

  const upsert = trpc.contractors.upsertMyProfile.useMutation({
    onSuccess: (data) => {
      toast.success("Profile submitted!", { description: "Your listing is under review and will be live within 24 hours." });
      setSubmitted(true);
    },
    onError: (e) => toast.error("Submission failed", { description: e.message }),
  });

  const toggleTrade = (trade: string) => {
    setForm(f => ({
      ...f,
      trades: f.trades.includes(trade) ? f.trades.filter(t => t !== trade) : [...f.trades, trade],
    }));
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    upsert.mutate({
      ...form,
      yearsInBusiness: form.yearsInBusiness !== "" ? Number(form.yearsInBusiness) : undefined,
      hourlyRateMin: form.hourlyRateMin !== "" ? Number(form.hourlyRateMin) * 100 : undefined,
      hourlyRateMax: form.hourlyRateMax !== "" ? Number(form.hourlyRateMax) * 100 : undefined,
      specialties: form.specialties ? form.specialties.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      slug: form.slug || generateSlug(form.businessName),
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: `${ACCENT}20` }}>
            <CheckCircle2 className="h-10 w-10" style={{ color: ACCENT }} />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-3">Profile Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Your contractor profile is under review. We'll approve it within 24 hours and notify you by email.
            Once approved, your profile will be visible to thousands of property managers nationwide.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/contractors")} variant="outline">
              Browse Directory
            </Button>
            <Button onClick={() => navigate("/dashboard")} style={{ background: ACCENT, color: "#062018" }} className="font-bold">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="py-12 px-4 border-b border-border bg-card">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>
            <Wrench className="h-3.5 w-3.5" />
            Free Contractor Listing
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">
            List Your Business on Leasely
          </h1>
          <p className="text-muted-foreground">
            Get discovered by property managers and landlords across the country.
            Create your profile in minutes — completely free.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-sm">
            {[
              { icon: Star, label: "Collect Reviews" },
              { icon: Shield, label: "Build Trust" },
              { icon: Building2, label: "Get More Jobs" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background border border-border">
                <Icon className="h-5 w-5" style={{ color: ACCENT }} />
                <span className="font-semibold text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  s < step ? "bg-[#F5A623] text-[#062018]" : s === step ? "bg-[#1B2B5E] text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              <span className={`text-sm font-medium ${s === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Business Info" : s === 2 ? "Services & Availability" : "Review & Submit"}
              </span>
              {s < 3 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Step 1: Business Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-foreground">Business Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Business Name *</Label>
                <Input
                  value={form.businessName}
                  onChange={e => {
                    const name = e.target.value;
                    setForm(f => ({ ...f, businessName: name, slug: f.slug || generateSlug(name) }));
                  }}
                  placeholder="Smith's Plumbing & Repair"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Owner / Contact Name</Label>
                <Input value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} placeholder="John Smith" className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" className="mt-1" />
              </div>
              <div>
                <Label>Business Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="info@yourbusiness.com" className="mt-1" />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yourbusiness.com" className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Austin" className="mt-1" />
              </div>
              <div>
                <Label>State *</Label>
                <Select value={form.state} onValueChange={v => setForm(f => ({ ...f, state: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(s => <SelectItem key={s} value={s}>{STATE_NAMES[s] ?? s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ZIP Code</Label>
                <Input value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="78701" className="mt-1" />
              </div>
              <div>
                <Label>Service Radius (miles)</Label>
                <Input type="number" value={form.serviceRadius} onChange={e => setForm(f => ({ ...f, serviceRadius: parseInt(e.target.value) || 25 }))} className="mt-1" />
              </div>
            </div>

            <div>
              <Label>About Your Business</Label>
              <Textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell property managers about your experience, what makes you stand out, and the quality of work you deliver..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Years in Business</Label>
                <Input type="number" value={form.yearsInBusiness} onChange={e => setForm(f => ({ ...f, yearsInBusiness: e.target.value ? parseInt(e.target.value) : "" }))} placeholder="5" className="mt-1" />
              </div>
              <div>
                <Label>License Number (optional)</Label>
                <Input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} placeholder="LIC-12345" className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Profile URL Slug</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground whitespace-nowrap">leasely.net/contractors/</span>
                <Input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                  placeholder="smiths-plumbing"
                />
              </div>
            </div>

            <Button
              className="w-full font-bold gap-2"
              style={{ background: ACCENT, color: "#062018" }}
              disabled={!form.businessName || !form.state}
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Services & Availability</h2>

            <div>
              <Label className="mb-3 block">Trades Offered * (select all that apply)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_TRADES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => toggleTrade(t.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all text-left ${
                      form.trades.includes(t.value)
                        ? "border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]"
                        : "border-border bg-card text-muted-foreground hover:border-[#F5A623]/50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Additional Specialties (comma-separated)</Label>
              <Input
                value={form.specialties}
                onChange={e => setForm(f => ({ ...f, specialties: e.target.value }))}
                placeholder="e.g. Water heater installation, Leak detection, Smart home wiring"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-3 block">Availability</Label>
              <div className="space-y-2">
                {[
                  { key: "availableWeekdays", label: "Available Weekdays (Mon–Fri)" },
                  { key: "availableWeekends", label: "Available Weekends (Sat–Sun)" },
                  { key: "emergencyService", label: "Emergency / After-Hours Service" },
                  { key: "freeEstimates", label: "Free Estimates" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Checkbox
                      id={key}
                      checked={form[key as keyof FormData] as boolean}
                      onCheckedChange={v => setForm(f => ({ ...f, [key]: !!v }))}
                    />
                    <label htmlFor={key} className="text-sm text-foreground cursor-pointer">{label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Hourly Rate Range (optional)</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input type="number" value={form.hourlyRateMin} onChange={e => setForm(f => ({ ...f, hourlyRateMin: e.target.value ? parseInt(e.target.value) : "" }))} placeholder="50" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Min/hr</p>
                </div>
                <span className="text-muted-foreground">–</span>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input type="number" value={form.hourlyRateMax} onChange={e => setForm(f => ({ ...f, hourlyRateMax: e.target.value ? parseInt(e.target.value) : "" }))} placeholder="150" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Max/hr</p>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Social Media (optional)</Label>
              <div className="space-y-2">
                <Input value={form.socialFacebook} onChange={e => setForm(f => ({ ...f, socialFacebook: e.target.value }))} placeholder="Facebook page URL" />
                <Input value={form.socialInstagram} onChange={e => setForm(f => ({ ...f, socialInstagram: e.target.value }))} placeholder="Instagram profile URL" />
                <Input value={form.socialLinkedin} onChange={e => setForm(f => ({ ...f, socialLinkedin: e.target.value }))} placeholder="LinkedIn profile URL" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                className="flex-1 font-bold gap-2"
                style={{ background: ACCENT, color: "#062018" }}
                disabled={form.trades.length === 0}
                onClick={() => setStep(3)}
              >
                Review Profile <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Review Your Profile</h2>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, #2a4090)` }}
                >
                  {(form.businessName || "C")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">{form.businessName || "Your Business"}</h3>
                  {form.ownerName && <p className="text-sm text-muted-foreground">{form.ownerName}</p>}
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {[form.city, STATE_NAMES[form.state] ?? form.state].filter(Boolean).join(", ") || "Location not set"}
                  </div>
                </div>
              </div>

              {form.bio && <p className="text-sm text-muted-foreground">{form.bio}</p>}

              {form.trades.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.trades.map(t => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {ALL_TRADES.find(tr => tr.value === t)?.label ?? t}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                {form.freeEstimates && <span className="flex items-center gap-1 text-purple-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Free Estimates</span>}
                {form.emergencyService && <span className="flex items-center gap-1 text-red-600 font-medium"><Clock className="h-3.5 w-3.5" /> Emergency Service</span>}
                {form.availableWeekends && <span className="flex items-center gap-1 text-blue-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Weekend Availability</span>}
              </div>
            </div>

            {!isAuthenticated && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <strong>Sign in required:</strong> You need a Leasely account to submit your profile. You'll be redirected to sign in.
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                className="flex-1 font-bold gap-2"
                style={{ background: ACCENT, color: "#062018" }}
                disabled={upsert.isPending}
                onClick={handleSubmit}
              >
                {upsert.isPending ? "Submitting..." : (
                  <><Sparkles className="h-4 w-4" /> Submit for Review</>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By submitting, you agree to our terms. Profiles are reviewed within 24 hours.
              Listing is free — no credit card required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
