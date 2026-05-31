// LeaseWizard — state + category selection + fillable form, then drafts via leaseDocs.draftFromTemplate.
// On success, navigates to /leases/draft/:id for the preview + send screen.

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

type Category = "standard_residential" | "coliving_room_rental";

interface FormVars {
  landlord_name: string;
  landlord_address: string;
  tenant_name: string;
  tenant_email: string;
  property_address: string;
  property_city: string;
  state: string;
  property_zip: string;
  monthly_rent: string;
  security_deposit: string;
  lease_start_date: string;
  lease_end_date: string;
  rent_due_day: string;
  late_fee: string;
  utilities: string;
  pets_allowed: string;
  parking: string;
  occupants: string;
  co_living_rules: string;
  unit_or_room_label: string;
}

const emptyVars: FormVars = {
  landlord_name: "",
  landlord_address: "",
  tenant_name: "",
  tenant_email: "",
  property_address: "",
  property_city: "",
  state: "NC",
  property_zip: "",
  monthly_rent: "",
  security_deposit: "",
  lease_start_date: "",
  lease_end_date: "",
  rent_due_day: "1",
  late_fee: "",
  utilities: "Tenant pays electricity, gas, internet; landlord pays water and trash.",
  pets_allowed: "No",
  parking: "",
  occupants: "",
  co_living_rules: "",
  unit_or_room_label: "",
};

const DRAFT_KEY = "leasely:wizardDraft:v1";

export default function LeaseWizard() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"choose" | "fill">("choose");
  const [state, setState] = useState<string>("NC");
  const [category, setCategory] = useState<Category>("standard_residential");
  const [vars, setVars] = useState<FormVars>(emptyVars);
  const [customClauseTitle, setCustomClauseTitle] = useState("");
  const [customClauseBody, setCustomClauseBody] = useState("");
  const [customClauses, setCustomClauses] = useState<Array<{ title: string; body: string }>>([]);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // ── Autosave to localStorage ──
  // Restore any in-flight draft on mount so a tab refresh / phone call doesn't
  // wipe 5 minutes of typing.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.state) setState(draft.state);
      if (draft.category) setCategory(draft.category);
      if (draft.vars) setVars(prev => ({ ...prev, ...draft.vars }));
      if (Array.isArray(draft.customClauses)) setCustomClauses(draft.customClauses);
      if (draft.savedAt) setSavedAt(new Date(draft.savedAt));
    } catch { /* ignore corrupted draft */ }
  }, []);

  // Save on any change (debounced via setTimeout)
  useEffect(() => {
    const handle = setTimeout(() => {
      try {
        const now = new Date();
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          state, category, vars, customClauses, savedAt: now.toISOString(),
        }));
        setSavedAt(now);
      } catch { /* quota — silently drop */ }
    }, 800);
    return () => clearTimeout(handle);
  }, [state, category, vars, customClauses]);

  const templateQuery = (trpc as any).leaseDocs.getTemplate.useQuery(
    { state, category },
    { enabled: step === "fill" },
  );

  const draftMut = (trpc as any).leaseDocs.draftFromTemplate.useMutation({
    onSuccess: (res: { id?: number; warnings: string[]; unresolved: string[] }) => {
      if (!res.id) {
        toast.error("Could not create draft. Please try again.");
        return;
      }
      if (res.warnings.length > 0) {
        toast.warning(res.warnings[0], { duration: 9000 });
      }
      // Draft is now persisted server-side — drop the local autosave snapshot
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      navigate(`/leases/draft/${res.id}`);
    },
    onError: (e: any) => toast.error(e.message ?? "Draft failed"),
  });

  useEffect(() => {
    setVars(v => ({ ...v, state }));
  }, [state]);

  const fellBackToGeneric = templateQuery.data?.fellBackToGeneric;
  const version = templateQuery.data?.version;
  const templateInfo = templateQuery.data?.template;

  const submit = () => {
    if (!version?.id || !templateInfo?.id) {
      toast.error("Template not loaded yet — please wait a moment.");
      return;
    }
    if (!vars.tenant_email || !vars.tenant_name) {
      toast.error("Tenant name and email are required.");
      return;
    }
    if (!vars.lease_start_date || !vars.lease_end_date) {
      toast.error("Lease start and end dates are required.");
      return;
    }
    draftMut.mutate({
      templateId: templateInfo.id,
      templateVersionId: version.id,
      variables: {
        ...vars,
        monthly_rent: vars.monthly_rent ? Number(vars.monthly_rent) : undefined,
        security_deposit: vars.security_deposit ? Number(vars.security_deposit) : undefined,
        rent_due_day: vars.rent_due_day ? Number(vars.rent_due_day) : undefined,
        late_fee: vars.late_fee ? Number(vars.late_fee) : undefined,
      },
      customClauses: customClauses.length > 0 ? customClauses : undefined,
    });
  };

  const ncDepositCapWarning = useMemo(() => {
    if (state !== "NC") return null;
    const rent = Number(vars.monthly_rent);
    const dep = Number(vars.security_deposit);
    if (!Number.isFinite(rent) || !Number.isFinite(dep) || rent <= 0) return null;
    if (dep > rent * 1.5) {
      return `Heads up: North Carolina caps security deposits at 1.5 months' rent ($${(rent * 1.5).toFixed(2)}) for term leases. N.C. Gen. Stat. § 42-51.`;
    }
    return null;
  }, [state, vars.monthly_rent, vars.security_deposit]);

  if (step === "choose") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-2">New Lease — Step 1 of 2</h1>
          <p className="text-muted-foreground mb-3">
            Pick the state and lease type. We&apos;ll preload the right template with the required state-specific clauses.
          </p>
          <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: "50%", background: "#4F46E5" }} />
          </div>

          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label>State the property is in</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Specialized templates: NC, TN. Other states use a multi-state generic — review with a local attorney.
                </p>
              </div>

              <div>
                <Label>Lease type</Label>
                <Select value={category} onValueChange={v => setCategory(v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard_residential">Standard Residential (whole unit)</SelectItem>
                    <SelectItem value="coliving_room_rental">Co-Living (room rental in shared home)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Co-Living is a per-room rental. The resident still receives full state eviction protections.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={() => setStep("fill")}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-2xl font-bold">Lease details — {state} {category === "coliving_room_rental" ? "Co-Living" : "Standard Residential"}</h1>
          {savedAt && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 shrink-0 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Saved {savedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
        </div>
        <p className="text-muted-foreground mb-3">Step 2 of 2 — fill in the variables; we&apos;ll render the lease for you to review. <span className="text-xs">Your draft is autosaved locally — refresh-safe.</span></p>
        {/* Two-step progress */}
        <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: "100%", background: "#4F46E5" }} />
        </div>

        {templateQuery.isLoading && (
          <div className="flex items-center text-muted-foreground py-6">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading template…
          </div>
        )}

        {fellBackToGeneric && (
          <Card className="mb-4 border-amber-400">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">No state-specific template for {state} yet.</p>
                <p className="text-muted-foreground">We&apos;re using the multi-state generic. State-required disclosures may be missing. A local attorney should review before relying on this document.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6 space-y-5">
            <section>
              <h2 className="font-semibold mb-3">Parties</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Landlord name" value={vars.landlord_name} onChange={v => setVars({ ...vars, landlord_name: v })} />
                <Field label="Landlord mailing address" value={vars.landlord_address} onChange={v => setVars({ ...vars, landlord_address: v })} />
                <Field label="Tenant full name" required value={vars.tenant_name} onChange={v => setVars({ ...vars, tenant_name: v })} />
                <Field label="Tenant email" required type="email" value={vars.tenant_email} onChange={v => setVars({ ...vars, tenant_email: v })} />
              </div>
            </section>

            <section>
              <h2 className="font-semibold mb-3">Property</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Street address" value={vars.property_address} onChange={v => setVars({ ...vars, property_address: v })} />
                <Field label="City" value={vars.property_city} onChange={v => setVars({ ...vars, property_city: v })} />
                <Field label="Zip" value={vars.property_zip} onChange={v => setVars({ ...vars, property_zip: v })} />
                {category === "coliving_room_rental" && (
                  <Field label="Room / unit label" value={vars.unit_or_room_label} onChange={v => setVars({ ...vars, unit_or_room_label: v })} placeholder="Bedroom 2" />
                )}
              </div>
            </section>

            <section>
              <h2 className="font-semibold mb-3">Term &amp; Rent</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Lease start date" required type="date" value={vars.lease_start_date} onChange={v => setVars({ ...vars, lease_start_date: v })} />
                <Field label="Lease end date" required type="date" value={vars.lease_end_date} onChange={v => setVars({ ...vars, lease_end_date: v })} />
                <Field label="Monthly rent ($)" required type="number" value={vars.monthly_rent} onChange={v => setVars({ ...vars, monthly_rent: v })} />
                <Field label="Rent due day of month" type="number" value={vars.rent_due_day} onChange={v => setVars({ ...vars, rent_due_day: v })} />
                <Field label="Security deposit ($)" type="number" value={vars.security_deposit} onChange={v => setVars({ ...vars, security_deposit: v })} />
                <Field label="Late fee ($)" type="number" value={vars.late_fee} onChange={v => setVars({ ...vars, late_fee: v })} />
              </div>
              {ncDepositCapWarning && (
                <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{ncDepositCapWarning}</span>
                </div>
              )}
            </section>

            <section>
              <h2 className="font-semibold mb-3">Living arrangement</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Utilities" value={vars.utilities} onChange={v => setVars({ ...vars, utilities: v })} />
                <Field label="Pets allowed?" value={vars.pets_allowed} onChange={v => setVars({ ...vars, pets_allowed: v })} placeholder="No / 1 cat under 25 lbs" />
                <Field label="Parking" value={vars.parking} onChange={v => setVars({ ...vars, parking: v })} placeholder="One assigned space" />
                <Field label="Authorized occupants" value={vars.occupants} onChange={v => setVars({ ...vars, occupants: v })} placeholder="Tenant only" />
              </div>
              {category === "coliving_room_rental" && (
                <div className="mt-4">
                  <Label>Co-living house rules</Label>
                  <Textarea
                    rows={4}
                    value={vars.co_living_rules}
                    onChange={e => setVars({ ...vars, co_living_rules: e.target.value })}
                    placeholder="Quiet hours after 10pm. Shared kitchen cleaning weekly. Overnight guests limited to 3 nights/month."
                  />
                </div>
              )}
            </section>

            <section>
              <h2 className="font-semibold mb-3">Custom clauses (optional)</h2>
              <p className="text-xs text-muted-foreground mb-3">
                Add anything specific to this lease (yard maintenance, smoking policy, etc.). Avoid clauses that waive
                state-required tenant protections — those are unenforceable.
              </p>
              {customClauses.length > 0 && (
                <ul className="mb-3 space-y-2">
                  {customClauses.map((c, i) => (
                    <li key={i} className="border rounded-md p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <strong>{c.title}</strong>
                        <button
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => setCustomClauses(customClauses.filter((_, j) => j !== i))}
                        >Remove</button>
                      </div>
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid sm:grid-cols-3 gap-3">
                <Input
                  placeholder="Clause title"
                  value={customClauseTitle}
                  onChange={e => setCustomClauseTitle(e.target.value)}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    rows={2}
                    placeholder="Clause body"
                    value={customClauseBody}
                    onChange={e => setCustomClauseBody(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  if (!customClauseTitle.trim() || !customClauseBody.trim()) return;
                  setCustomClauses([...customClauses, { title: customClauseTitle.trim(), body: customClauseBody.trim() }]);
                  setCustomClauseTitle("");
                  setCustomClauseBody("");
                }}
              >
                Add clause
              </Button>
            </section>

            <div className="pt-2 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep("choose")}>← Back</Button>
              <Button onClick={submit} disabled={draftMut.isPending || !version?.id}>
                {draftMut.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Creating draft…</> : <>Preview lease <ChevronRight className="h-4 w-4 ml-1" /></>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field(props: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <Label>{props.label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</Label>
      <Input
        type={props.type ?? "text"}
        value={props.value}
        placeholder={props.placeholder}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
}
