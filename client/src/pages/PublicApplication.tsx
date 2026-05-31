import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Home, MapPin, DollarSign, Users, Briefcase, Phone, Mail,
  AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft,
  FileText, Shield, Heart, Car, PawPrint, UserCheck
} from "lucide-react";

// State-specific disclosure text
const STATE_DISCLOSURES: Record<string, string> = {
  CA: "California: Pursuant to California Civil Code §1950.6, the application fee may not exceed the actual cost of gathering information. You have the right to receive a copy of your consumer report if adverse action is taken.",
  NY: "New York: Under NYC Admin Code §8-107.1, it is unlawful to discriminate based on lawful source of income. You may not be denied housing solely because you receive government assistance.",
  TX: "Texas: Under the Texas Property Code, a landlord must return a security deposit within 30 days of move-out. Applicants have the right to request a copy of the lease before signing.",
  FL: "Florida: Florida Statute §83.49 requires landlords to hold security deposits in a separate account. You have the right to receive written notice of the account location.",
  IL: "Illinois: Chicago RLTO requires landlords to provide a copy of the ordinance summary. Security deposits must be held in a federally insured interest-bearing account.",
  WA: "Washington: RCW 59.18 requires landlords to provide written notice of tenant rights. Screening criteria must be disclosed in writing before accepting any application fee.",
  CO: "Colorado: HB21-1121 limits application fees to actual screening costs. Landlords must provide a written receipt and itemized accounting of screening fees.",
  GA: "Georgia: O.C.G.A. §44-7-35 requires landlords to return security deposits within 30 days. You have the right to a written explanation for any deductions.",
  AZ: "Arizona: A.R.S. §33-1321 limits security deposits to 1.5 months rent for unfurnished units. Landlords must provide a written inventory of the unit's condition at move-in.",
  NC: "North Carolina: G.S. §42-52 requires landlords to return security deposits within 30 days. Applicants have the right to receive a copy of the tenant security deposit act.",
  OH: "Ohio: O.R.C. §5321.16 requires security deposits over $50 to earn interest. Landlords must return deposits within 30 days of move-out.",
  MI: "Michigan: MCL §554.602 requires landlords to provide a written receipt for security deposits. You have the right to a move-in inspection checklist.",
  PA: "Pennsylvania: The Landlord and Tenant Act requires landlords to return security deposits within 30 days. Applicants have the right to a written explanation for any deductions.",
  VA: "Virginia: The Virginia Residential Landlord and Tenant Act requires landlords to provide a written rental agreement. Security deposits may not exceed 2 months rent.",
  NJ: "New Jersey: The Truth in Renting Act requires landlords to provide a statement of tenant rights. Security deposits are limited to 1.5 months rent.",
  MA: "Massachusetts: G.L. c.186 §15B limits security deposits to 1 month rent. Landlords must provide a written receipt and hold deposits in a separate account.",
  MD: "Maryland: The Maryland Landlord-Tenant Act limits security deposits to 2 months rent. Landlords must return deposits within 45 days of move-out.",
  MN: "Minnesota: Minn. Stat. §504B.178 requires landlords to return security deposits within 21 days. You have the right to a written explanation for any deductions.",
  WI: "Wisconsin: Wis. Stat. §704.28 requires landlords to return security deposits within 21 days. Landlords must provide a written move-in checklist.",
  OR: "Oregon: ORS §90.300 limits security deposits and requires written receipts. Landlords must return deposits within 31 days of move-out.",
  DEFAULT: "By submitting this application, you authorize the landlord to verify the information provided, including employment, rental history, and credit/background checks as permitted by applicable law.",
};

const STEPS = [
  { id: 1, label: "Personal Info", icon: UserCheck },
  { id: 2, label: "Rental History", icon: Home },
  { id: 3, label: "Employment", icon: Briefcase },
  { id: 4, label: "Additional Info", icon: Users },
  { id: 5, label: "Review & Sign", icon: Shield },
];

export default function PublicApplication() {
  const { listingId } = useParams<{ listingId: string }>();
  const id = parseInt(listingId ?? "0");

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [form, setForm] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    applicantDob: "",
    currentAddress: "",
    currentLandlordName: "",
    currentLandlordPhone: "",
    currentRent: "",
    reasonForLeaving: "",
    employerName: "",
    employerPhone: "",
    occupation: "",
    monthlyIncome: "",
    moveInDate: "",
    roomPreference: "",
    lifestyleNotes: "",
    hasPets: false,
    petDescription: "",
    vehicleInfo: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    backgroundCheckConsent: false,
    creditCheckConsent: false,
    stateDisclosureAgreed: false,
    signatureDataUrl: "",
  });

  const { data: listing, isLoading: listingLoading, error: listingError } = trpc.marketplace.getListingById.useQuery(
    { id },
    { enabled: id > 0 }
  );

  const submitMutation = trpc.applications.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error("Submission failed: " + err.message);
    },
  });

  const isCoLiving = listing?.propertyType === "co_living";
  const state = listing?.state ?? "";
  const disclosure = STATE_DISCLOSURES[state] ?? STATE_DISCLOSURES.DEFAULT;

  const update = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.applicantName || !form.applicantEmail) {
      toast.error("Please fill in your name and email.");
      return;
    }
    if (!form.backgroundCheckConsent || !form.creditCheckConsent) {
      toast.error("You must consent to background and credit checks to proceed.");
      return;
    }
    if (!form.stateDisclosureAgreed) {
      toast.error("Please agree to the state disclosure to continue.");
      return;
    }
    submitMutation.mutate({
      listingId: id,
      landlordUserId: listing?.userId ?? 0,
      applicationFormType: isCoLiving ? "coliving_member" : "standard",
      state: state || undefined,
      ...form,
    });
  };

  if (listingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading application...</p>
        </div>
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Listing Not Found</h2>
          <p className="text-white/60 text-sm">This listing may no longer be available or the link may be incorrect.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(79,70,229,0.15)", border: "2px solid #4F46E5" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: "#4F46E5" }} />
          </div>
          <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Application Submitted!</h2>
          <p className="text-white/60 mb-2">Your application for <span className="text-white font-semibold">{listing.title}</span> has been received.</p>
          <p className="text-white/40 text-sm">The landlord will review your application and contact you at <span className="text-white/60">{form.applicantEmail}</span>.</p>
          <div className="mt-8 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-white/40 text-xs">Powered by</p>
            <p className="text-white font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>Leasely™</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-md" style={{ background: "rgba(10,22,40,0.9)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Rental Application</p>
              <h1 className="text-white font-black text-lg leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>{listing.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-white/50 text-xs"><MapPin className="w-3 h-3" />{listing.city}, {listing.state}</span>
                <span className="flex items-center gap-1 text-white/50 text-xs"><DollarSign className="w-3 h-3" />{listing.monthlyRent ? (listing.monthlyRent / 100).toLocaleString() : "—"}/mo</span>
                {isCoLiving && <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">Co-Living</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs">Step {step} of {STEPS.length}</p>
              <p className="text-white/60 text-sm font-semibold">{STEPS[step - 1]?.label}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / STEPS.length) * 100}%`, background: "#4F46E5" }} />
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5">
            <SectionHeader icon={UserCheck} title={isCoLiving ? "Member Information" : "Personal Information"} color="#4F46E5" />
            <FormCard>
              <FormRow>
                <FormField label="Full Legal Name *" required>
                  <Input value={form.applicantName} onChange={e => update("applicantName", e.target.value)} placeholder="John Smith" className="form-input-dark" />
                </FormField>
                <FormField label="Date of Birth">
                  <Input type="date" value={form.applicantDob} onChange={e => update("applicantDob", e.target.value)} className="form-input-dark" />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Email Address *" required>
                  <Input type="email" value={form.applicantEmail} onChange={e => update("applicantEmail", e.target.value)} placeholder="john@example.com" className="form-input-dark" />
                </FormField>
                <FormField label="Phone Number">
                  <Input type="tel" value={form.applicantPhone} onChange={e => update("applicantPhone", e.target.value)} placeholder="(555) 000-0000" className="form-input-dark" />
                </FormField>
              </FormRow>
              <FormField label="Desired Move-In Date">
                <Input type="date" value={form.moveInDate} onChange={e => update("moveInDate", e.target.value)} className="form-input-dark" />
              </FormField>
              {isCoLiving && (
                <>
                  <FormField label="Room Preference">
                    <Input value={form.roomPreference} onChange={e => update("roomPreference", e.target.value)} placeholder="e.g. Private room, shared bath" className="form-input-dark" />
                  </FormField>
                  <FormField label="About You / Lifestyle Notes">
                    <Textarea value={form.lifestyleNotes} onChange={e => update("lifestyleNotes", e.target.value)} placeholder="Tell us about your lifestyle, work schedule, hobbies, and what makes you a great housemate..." className="form-input-dark" rows={4} />
                  </FormField>
                </>
              )}
            </FormCard>
          </div>
        )}

        {/* Step 2: Rental History */}
        {step === 2 && (
          <div className="space-y-5">
            <SectionHeader icon={Home} title="Rental History" color="#6366F1" />
            <FormCard>
              <FormField label="Current / Most Recent Address">
                <Input value={form.currentAddress} onChange={e => update("currentAddress", e.target.value)} placeholder="123 Main St, City, State ZIP" className="form-input-dark" />
              </FormField>
              <FormRow>
                <FormField label="Current Landlord Name">
                  <Input value={form.currentLandlordName} onChange={e => update("currentLandlordName", e.target.value)} placeholder="Landlord name" className="form-input-dark" />
                </FormField>
                <FormField label="Landlord Phone">
                  <Input type="tel" value={form.currentLandlordPhone} onChange={e => update("currentLandlordPhone", e.target.value)} placeholder="(555) 000-0000" className="form-input-dark" />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Current Monthly Rent">
                  <Input value={form.currentRent} onChange={e => update("currentRent", e.target.value.replace(/[^0-9.]/g, ""))} placeholder="1200" inputMode="numeric" className="form-input-dark" />
                </FormField>
              </FormRow>
              <FormField label="Reason for Leaving">
                <Textarea value={form.reasonForLeaving} onChange={e => update("reasonForLeaving", e.target.value)} placeholder="e.g. Relocating for work, lease ending, looking for more space..." className="form-input-dark" rows={3} />
              </FormField>
            </FormCard>
          </div>
        )}

        {/* Step 3: Employment */}
        {step === 3 && (
          <div className="space-y-5">
            <SectionHeader icon={Briefcase} title="Employment & Income" color="#4F46E5" />
            <FormCard>
              <FormRow>
                <FormField label="Employer Name">
                  <Input value={form.employerName} onChange={e => update("employerName", e.target.value)} placeholder="Company name" className="form-input-dark" />
                </FormField>
                <FormField label="Employer Phone">
                  <Input type="tel" value={form.employerPhone} onChange={e => update("employerPhone", e.target.value)} placeholder="(555) 000-0000" className="form-input-dark" />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Occupation / Job Title">
                  <Input value={form.occupation} onChange={e => update("occupation", e.target.value)} placeholder="Software Engineer" className="form-input-dark" />
                </FormField>
                <FormField label="Gross Monthly Income">
                  <Input
                    value={form.monthlyIncome}
                    onChange={e => update("monthlyIncome", e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="5000"
                    inputMode="numeric"
                    className="form-input-dark"
                  />
                </FormField>
              </FormRow>
            </FormCard>
          </div>
        )}

        {/* Step 4: Additional Info */}
        {step === 4 && (
          <div className="space-y-5">
            <SectionHeader icon={Users} title="Additional Information" color="#10B981" />
            <FormCard>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox id="hasPets" checked={form.hasPets} onCheckedChange={v => update("hasPets", !!v)} />
                  <Label htmlFor="hasPets" className="text-white/80 flex items-center gap-2 cursor-pointer"><PawPrint className="w-4 h-4 text-orange-400" /> I have pets</Label>
                </div>
                {form.hasPets && (
                  <FormField label="Pet Description">
                    <Input value={form.petDescription} onChange={e => update("petDescription", e.target.value)} placeholder="e.g. 1 cat, 10 lbs, neutered" className="form-input-dark" />
                  </FormField>
                )}
                <FormField label="Vehicle Information (optional)">
                  <Input value={form.vehicleInfo} onChange={e => update("vehicleInfo", e.target.value)} placeholder="e.g. 2019 Toyota Camry, Silver, Plate: ABC123" className="form-input-dark" />
                </FormField>
              </div>
            </FormCard>
            <SectionHeader icon={Phone} title="Emergency Contact" color="#EC4899" />
            <FormCard>
              <FormRow>
                <FormField label="Contact Name">
                  <Input value={form.emergencyContactName} onChange={e => update("emergencyContactName", e.target.value)} placeholder="Jane Smith" className="form-input-dark" />
                </FormField>
                <FormField label="Relationship">
                  <Input value={form.emergencyContactRelation} onChange={e => update("emergencyContactRelation", e.target.value)} placeholder="Sister, Parent, Friend..." className="form-input-dark" />
                </FormField>
              </FormRow>
              <FormField label="Contact Phone">
                <Input type="tel" value={form.emergencyContactPhone} onChange={e => update("emergencyContactPhone", e.target.value)} placeholder="(555) 000-0000" className="form-input-dark" />
              </FormField>
            </FormCard>
          </div>
        )}

        {/* Step 5: Review & Sign */}
        {step === 5 && (
          <div className="space-y-5">
            <SectionHeader icon={Shield} title="Review & Authorization" color="#4F46E5" />

            {/* State disclosure */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <div className="flex items-start gap-3 mb-3">
                <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">State Disclosure — {state || "General"}</p>
                  <p className="text-white/60 text-xs leading-relaxed">{disclosure}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Checkbox id="stateDisclosure" checked={form.stateDisclosureAgreed} onCheckedChange={v => update("stateDisclosureAgreed", !!v)} />
                <Label htmlFor="stateDisclosure" className="text-white/80 text-sm cursor-pointer">I have read and understand the state disclosure above</Label>
              </div>
            </div>

            {/* Consents */}
            <FormCard>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox id="bgCheck" checked={form.backgroundCheckConsent} onCheckedChange={v => update("backgroundCheckConsent", !!v)} />
                  <Label htmlFor="bgCheck" className="text-white/80 text-sm cursor-pointer leading-relaxed">
                    I authorize the landlord to conduct a <strong className="text-white">background check</strong> using the information provided in this application.
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="creditCheck" checked={form.creditCheckConsent} onCheckedChange={v => update("creditCheckConsent", !!v)} />
                  <Label htmlFor="creditCheck" className="text-white/80 text-sm cursor-pointer leading-relaxed">
                    I authorize the landlord to conduct a <strong className="text-white">credit check</strong> and verify my employment and rental history.
                  </Label>
                </div>
              </div>
            </FormCard>

            {/* Signature */}
            <FormCard>
              <p className="text-white/60 text-sm mb-3">Electronic Signature — type your full legal name to sign</p>
              <Input
                value={form.signatureDataUrl}
                onChange={e => update("signatureDataUrl", e.target.value)}
                placeholder="Type your full legal name"
                className="form-input-dark font-semibold text-lg"
                style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
              />
              {form.signatureDataUrl && (
                <p className="text-white/40 text-xs mt-2">Signed electronically on {new Date().toLocaleDateString()}</p>
              )}
            </FormCard>

            {/* Summary */}
            <div className="rounded-2xl p-5 space-y-2" style={{ background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.2)" }}>
              <p className="text-teal-400 font-semibold text-sm mb-3">Application Summary</p>
              {[
                ["Applicant", form.applicantName || "—"],
                ["Email", form.applicantEmail || "—"],
                ["Phone", form.applicantPhone || "—"],
                ["Employer", form.employerName || "—"],
                ["Monthly Income", form.monthlyIncome || "—"],
                ["Move-In Date", form.moveInDate || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white/80 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : <div />}

          {step < STEPS.length ? (
            <Button onClick={() => {
              if (step === 1 && !form.applicantName) { toast.error("Please enter your full name."); return; }
              if (step === 1 && !form.applicantEmail) { toast.error("Please enter your email."); return; }
              setStep(s => s + 1);
            }} className="gap-2 font-bold" style={{ background: "#4F46E5", color: "#3A2410" }}>
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="gap-2 font-bold px-8"
              style={{ background: "#4F46E5", color: "#3A2410" }}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Application"}
              {!submitMutation.isPending && <CheckCircle2 className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Powered by */}
        <div className="text-center mt-8">
          <p className="text-white/20 text-xs">Powered by <span className="text-white/40 font-bold">Leasely™</span></p>
        </div>
      </div>

      <style>{`
        .form-input-dark {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: white !important;
        }
        .form-input-dark::placeholder { color: rgba(255,255,255,0.3) !important; }
        .form-input-dark:focus { border-color: rgba(79,70,229,0.5) !important; box-shadow: 0 0 0 2px rgba(79,70,229,0.1) !important; }
      `}</style>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <h2 className="text-white font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h2>
    </div>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {children}
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}
