import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { CheckCircle2, Users, MapPin, Home, DollarSign, Calendar, Loader2, Bell } from "lucide-react";

export default function JoinWaitlist() {
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredArea: "",
    moveInDate: "",
    budgetMin: "",
    budgetMax: "",
    bedroomsNeeded: "",
    notes: "",
  });

  const join = trpc.waitlist.join.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required.");
      return;
    }
    join.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      preferredArea: form.preferredArea || undefined,
      moveInDate: form.moveInDate || undefined,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      bedroomsNeeded: form.bedroomsNeeded || undefined,
      notes: form.notes || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-5">
          <div className="h-20 w-20 rounded-full bg-[#4F46E5]/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-[#4F46E5]" />
          </div>
          <h1 className="text-3xl font-black text-foreground">You're on the list!</h1>
          <p className="text-muted-foreground max-w-md text-lg">
            A Keycove Pro member will reach out when a matching property becomes available in your area.
          </p>
          <Button onClick={() => navigate("/marketplace")} className="bg-[#1B2B5E] hover:bg-[#1B2B5E]/90">
            Browse Available Listings
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
          <Badge className="bg-[#4F46E5]/20 text-[#4F46E5] border-[#4F46E5]/30 text-xs">
            Renter Waitlist
          </Badge>
          <h1 className="text-3xl font-black">Get Notified First</h1>
          <p className="text-blue-100">
            Tell us what you're looking for and our network of Pro landlords will reach out when something opens up.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-muted/30 border-b border-border py-6 px-4">
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-6">
          {[
            { icon: Bell, label: "First access to new listings" },
            { icon: Users, label: "Direct landlord contact" },
            { icon: Home, label: "Off-market properties" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-[#4F46E5]" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
          <h2 className="font-bold text-foreground text-lg">Your Rental Preferences</h2>

          {/* Contact */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Preferred Area</Label>
              <Input
                value={form.preferredArea}
                onChange={e => setForm(f => ({ ...f, preferredArea: e.target.value }))}
                placeholder="e.g. Austin, TX or 78701"
              />
            </div>
          </div>

          {/* Timing & Budget */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Move-in Date</Label>
              <Input
                type="date"
                value={form.moveInDate}
                onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Min Budget/mo</Label>
              <Input
                type="number"
                value={form.budgetMin}
                onChange={e => setForm(f => ({ ...f, budgetMin: e.target.value }))}
                placeholder="800"
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Max Budget/mo</Label>
              <Input
                type="number"
                value={form.budgetMax}
                onChange={e => setForm(f => ({ ...f, budgetMax: e.target.value }))}
                placeholder="2000"
              />
            </div>
          </div>

          <div className="space-y-1 max-w-xs">
            <Label className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Bedrooms Needed</Label>
            <select
              value={form.bedroomsNeeded}
              onChange={e => setForm(f => ({ ...f, bedroomsNeeded: e.target.value }))}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Any</option>
              <option value="0">Studio</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label>Additional Notes</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Pets? Parking needs? Specific requirements..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={join.isPending || !form.name || !form.email}
            className="w-full gap-2 bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 h-11"
          >
            {join.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Join the Waitlist
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            No spam. You'll only be contacted when a property matches your preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
