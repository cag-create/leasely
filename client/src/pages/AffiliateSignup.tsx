import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { DollarSign, Users, FileText, CheckCircle, ArrowRight, Shield } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

type Step = "intro" | "w9" | "done";

export default function AffiliateSignup() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("intro");

  // W-9 form state
  const [legalName, setLegalName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [taxClass, setTaxClass] = useState<string>("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [tinType, setTinType] = useState<"ssn" | "ein">("ssn");
  const [tin, setTin] = useState("");
  const [certified, setCertified] = useState(false);

  const { data: myAffiliate, refetch } = trpc.affiliate.getMyAffiliate.useQuery(undefined, {
    enabled: !!user,
  });

  const joinMutation = trpc.affiliate.joinProgram.useMutation({
    onSuccess: (data) => {
      if (data.alreadyExists) {
        // Already in program, go to W-9 if not submitted
        if (myAffiliate?.w9) {
          navigate("/affiliate/dashboard");
        } else {
          setStep("w9");
        }
      } else {
        setStep("w9");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const w9Mutation = trpc.affiliate.submitW9.useMutation({
    onSuccess: () => {
      refetch();
      setStep("done");
      toast.success("W-9 Submitted! Your affiliate account is now active.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // If already active affiliate, redirect to dashboard
  if (myAffiliate?.affiliate?.status === "active") {
    navigate("/affiliate/dashboard");
    return null;
  }

  // If pending W-9 and W-9 not submitted, show W-9 step
  if (myAffiliate?.affiliate?.status === "pending_w9" && !myAffiliate.w9 && step === "intro") {
    setStep("w9");
  }

  const handleJoin = () => {
    if (!user) {
      window.location.href = "/api/oauth/login?redirect=/affiliate/signup";
      return;
    }
    joinMutation.mutate();
  };

  const handleW9Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certified) {
      toast.error("You must certify the information is accurate.");
      return;
    }
    w9Mutation.mutate({
      legalName,
      businessName: businessName || undefined,
      taxClassification: taxClass as any,
      address,
      city,
      state,
      zipCode,
      tinType,
      tin,
    });
  };

  const formatTin = (value: string, type: "ssn" | "ein") => {
    const digits = value.replace(/\D/g, "");
    if (type === "ssn") {
      if (digits.length <= 3) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
    } else {
      if (digits.length <= 2) return digits;
      return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-white">Keycove</a>
          {user && (
            <a href="/affiliate/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              My Dashboard →
            </a>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {step === "intro" && (
          <>
            {/* Hero */}
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-teal-500/20 text-teal-300 border-teal-500/30">
                Affiliate Program
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Earn $50 per landlord you refer
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Share Keycove with property managers and landlords. When they subscribe to Pro,
                you earn $50 — paid directly to you after their payment clears.
              </p>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: FileText,
                  step: "1",
                  title: "Submit your W-9",
                  desc: "Required by the IRS before we can pay you. Takes 2 minutes.",
                },
                {
                  icon: Users,
                  step: "2",
                  title: "Share your link",
                  desc: "Get a unique referral link. Share it anywhere — social, email, word of mouth.",
                },
                {
                  icon: DollarSign,
                  step: "3",
                  title: "Get paid $50",
                  desc: "When a referred landlord signs up and pays their first full month plus the setup fee, a $50 one-time bonus goes into your account.",
                },
              ].map(({ icon: Icon, step, title, desc }) => (
                <Card key={step} className="bg-white/5 border-white/10 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">
                        {step}
                      </div>
                      <Icon className="w-5 h-5 text-teal-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-400">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Earnings info */}
            <Card className="bg-teal-500/10 border-teal-500/30 mb-12">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-teal-400 mb-1">$50</div>
                    <div className="text-sm text-slate-400">One-time per signup</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-400 mb-1">No cap</div>
                    <div className="text-sm text-slate-400">Unlimited referrals</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-400 mb-1">1099-NEC</div>
                    <div className="text-sm text-slate-400">Issued if you earn $2,000+/year</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleJoin}
                disabled={joinMutation.isPending}
                className="bg-teal-500 hover:bg-teal-400 text-white px-10 py-6 text-lg font-semibold"
              >
                {joinMutation.isPending ? "Setting up..." : "Join the Affiliate Program"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="mt-4 text-sm text-slate-500">
                You'll need to submit a W-9 before your referral link is activated.
              </p>
            </div>
          </>
        )}

        {step === "w9" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-500/20 mb-4">
                <Shield className="w-7 h-7 text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Complete your W-9</h2>
              <p className="text-slate-400">
                The IRS requires us to collect this information before we can pay you.
                Your data is encrypted and only used for tax reporting.
              </p>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <form onSubmit={handleW9Submit} className="space-y-6">
                  {/* Legal name */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Legal Name (as shown on your tax return) *</Label>
                    <Input
                      value={legalName}
                      onChange={e => setLegalName(e.target.value)}
                      placeholder="John Smith"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Business name */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Business Name / DBA (optional)</Label>
                    <Input
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="Smith Properties LLC"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Tax classification */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Federal Tax Classification *</Label>
                    <Select value={taxClass} onValueChange={setTaxClass} required>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual / Sole Proprietor</SelectItem>
                        <SelectItem value="sole_proprietor">Single-member LLC</SelectItem>
                        <SelectItem value="c_corp">C Corporation</SelectItem>
                        <SelectItem value="s_corp">S Corporation</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="trust">Trust / Estate</SelectItem>
                        <SelectItem value="llc">LLC (multi-member)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Street Address *</Label>
                    <Input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="123 Main St"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 space-y-2">
                      <Label className="text-slate-300">City *</Label>
                      <Input
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="Austin"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">State *</Label>
                      <Select value={state} onValueChange={setState} required>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="TX" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">ZIP *</Label>
                      <Input
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                        placeholder="78701"
                        required
                        maxLength={10}
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* TIN */}
                  <div className="space-y-4">
                    <Label className="text-slate-300">Taxpayer Identification Number (TIN) *</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={tinType === "ssn" ? "default" : "outline"}
                        onClick={() => { setTinType("ssn"); setTin(""); }}
                        className={tinType === "ssn" ? "bg-teal-600 text-white" : "border-white/20 text-slate-300"}
                      >
                        SSN
                      </Button>
                      <Button
                        type="button"
                        variant={tinType === "ein" ? "default" : "outline"}
                        onClick={() => { setTinType("ein"); setTin(""); }}
                        className={tinType === "ein" ? "bg-teal-600 text-white" : "border-white/20 text-slate-300"}
                      >
                        EIN
                      </Button>
                    </div>
                    <Input
                      value={tin}
                      onChange={e => setTin(formatTin(e.target.value, tinType))}
                      placeholder={tinType === "ssn" ? "XXX-XX-XXXX" : "XX-XXXXXXX"}
                      required
                      maxLength={11}
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 font-mono"
                    />
                    <p className="text-xs text-slate-500">
                      Your TIN is encrypted and stored securely. Only the last 4 digits are displayed in our system.
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Certification */}
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong>Certification:</strong> Under penalties of perjury, I certify that: (1) The number shown on this form is my
                      correct taxpayer identification number; (2) I am not subject to backup withholding; (3) I am a U.S. citizen or
                      other U.S. person; (4) The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA
                      reporting is correct.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={certified}
                        onChange={e => setCertified(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10"
                      />
                      <span className="text-sm text-slate-300">
                        I certify that the above information is accurate and I am authorized to sign this form.
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={w9Mutation.isPending || !certified || !taxClass || !state}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white py-6 text-base font-semibold"
                  >
                    {w9Mutation.isPending ? "Submitting..." : "Submit W-9 & Activate Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "done" && (
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/20 mb-6">
              <CheckCircle className="w-10 h-10 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">You're in!</h2>
            <p className="text-slate-400 mb-8">
              Your W-9 has been submitted and your affiliate account is now active.
              Head to your dashboard to grab your referral link.
            </p>
            <Button
              onClick={() => navigate("/affiliate/dashboard")}
              className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-6 text-lg font-semibold"
            >
              Go to My Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
