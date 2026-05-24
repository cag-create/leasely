import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  CheckCircle2, Home, DollarSign, Loader2, ArrowRight,
  FileText, Globe, TrendingUp, Shield
} from "lucide-react";

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family Home" },
  { value: "condo", label: "Condo / Townhouse" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "land", label: "Land / Lot" },
  { value: "other", label: "Other" },
];

export default function FsboSignup() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    propertyAddress: "",
    askingPrice: "",
    propertyType: "single_family",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    description: "",
  });

  const create = trpc.fsbo.createProfile.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!form.propertyAddress || !form.askingPrice) {
      toast.error("Property address and asking price are required.");
      return;
    }
    create.mutate({
      propertyAddress: form.propertyAddress,
      askingPrice: form.askingPrice ? parseFloat(form.askingPrice) : undefined,
      propertyType: form.propertyType as any,
      bedrooms: form.bedrooms || undefined,
      bathrooms: form.bathrooms || undefined,
      squareFeet: form.squareFeet ? Number(form.squareFeet) : undefined,
      description: form.description || undefined,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-4">
          <Shield className="h-12 w-12 text-muted-foreground opacity-30" />
          <h2 className="text-xl font-bold text-foreground">Sign in required</h2>
          <p className="text-muted-foreground">Please sign in to list your property for sale by owner.</p>
          <Button onClick={() => navigate("/login")} className="bg-[#1B2B5E] hover:bg-[#1B2B5E]/90">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-5">
          <div className="h-20 w-20 rounded-full bg-[#F5A623]/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-[#F5A623]" />
          </div>
          <h1 className="text-3xl font-black text-foreground">Listing Submitted!</h1>
          <p className="text-muted-foreground max-w-md text-lg">
            Your FSBO profile is live. We'll help you maximize visibility and connect with qualified buyers.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="bg-[#1B2B5E] hover:bg-[#1B2B5E]/90">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1B2B5E] text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <Badge className="bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30 text-xs">
            For Sale By Owner
          </Badge>
          <h1 className="text-3xl font-black">List Your Property — No Agent Needed</h1>
          <p className="text-blue-100">
            Sell your home directly and keep more of your equity. We handle the visibility and marketing.
          </p>
        </div>
      </div>

      {/* Value Props */}
      <div className="bg-muted/30 border-b border-border py-6 px-4">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
          {[
            { icon: Globe, label: "Marketplace Exposure", sub: "Listed on Leasely marketplace" },
            { icon: TrendingUp, label: "Buyer Leads", sub: "Direct inquiries to you" },
            { icon: FileText, label: "Digital Paperwork", sub: "Manage offers online" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
              <div className="h-9 w-9 rounded-lg bg-[#1B2B5E]/10 flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5 text-[#1B2B5E]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
          <h2 className="font-bold text-foreground text-lg">Property Details</h2>

          <div className="space-y-1">
            <Label>Property Address *</Label>
            <Input
              value={form.propertyAddress}
              onChange={e => setForm(f => ({ ...f, propertyAddress: e.target.value }))}
              placeholder="123 Main St, Austin, TX 78701"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Asking Price *</Label>
              <Input
                type="number"
                value={form.askingPrice}
                onChange={e => setForm(f => ({ ...f, askingPrice: e.target.value }))}
                placeholder="350000"
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Property Type</Label>
              <select
                value={form.propertyType}
                onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROPERTY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Bedrooms</Label>
              <Input
                type="number"
                value={form.bedrooms}
                onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
                placeholder="3"
                min={0}
              />
            </div>
            <div className="space-y-1">
              <Label>Bathrooms</Label>
              <Input
                type="number"
                value={form.bathrooms}
                onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))}
                placeholder="2"
                min={0}
                step={0.5}
              />
            </div>
            <div className="space-y-1">
              <Label>Sq Ft</Label>
              <Input
                type="number"
                value={form.squareFeet}
                onChange={e => setForm(f => ({ ...f, squareFeet: e.target.value }))}
                placeholder="1800"
                min={0}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe your property — highlights, recent upgrades, neighborhood, etc."
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={create.isPending || !form.propertyAddress || !form.askingPrice}
            className="w-full gap-2 bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 h-11"
          >
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Submit Listing
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By submitting you agree to our Terms of Service. Listings are reviewed within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
