// UploadOwnLease — Pro members upload their own PDF/DOC/DOCX, fill in the
// commercial terms (rent, deposit, dates, etc.) and route to the preview
// screen for the disclaimer + send step.

import { useRef, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, FileText, ChevronRight } from "lucide-react";

const ACCEPTED = ".pdf,.doc,.docx";
const ACCEPTED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_BYTES = 25 * 1024 * 1024;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

interface UploadVars {
  landlord_name: string;
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
}

const emptyVars: UploadVars = {
  landlord_name: "",
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
};

export default function UploadOwnLease() {
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [vars, setVars] = useState<UploadVars>(emptyVars);

  const uploadOwnDraftMut = (trpc as any).leaseDocs.uploadOwnDraft.useMutation({
    onSuccess: (res: { id?: number }) => {
      if (res.id) navigate(`/leases/draft/${res.id}`);
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to create draft"),
  });

  const pick = () => inputRef.current?.click();

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED_MIME.has(f.type) && !/\.(pdf|docx?|DOC|DOCX|PDF)$/.test(f.name)) {
      toast.error("File must be a PDF, DOC, or DOCX.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error(`File is ${(f.size / 1024 / 1024).toFixed(1)}MB — max is 25MB.`);
      return;
    }
    setFile(f);
  };

  const submit = async () => {
    if (!file) return toast.error("Pick a file first.");
    if (!vars.tenant_name.trim() || !vars.tenant_email.trim()) {
      return toast.error("Tenant name and email are required.");
    }
    if (!vars.property_address.trim()) {
      return toast.error("Property address is required.");
    }
    if (!vars.lease_start_date || !vars.lease_end_date) {
      return toast.error("Lease start and end dates are required.");
    }
    if (!vars.monthly_rent) {
      return toast.error("Monthly rent is required.");
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload-lease", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Upload failed (${res.status})`);
      }
      const json = (await res.json()) as { url?: string; filename?: string; mimeType?: string };
      if (!json.url) throw new Error("Upload returned no URL.");
      uploadOwnDraftMut.mutate({
        uploadedFileUrl: json.url,
        uploadedFilename: json.filename ?? file.name,
        uploadedMimeType: json.mimeType ?? file.type,
        variables: {
          ...vars,
          tenant_name: vars.tenant_name.trim(),
          tenant_email: vars.tenant_email.trim(),
          monthly_rent: vars.monthly_rent ? Number(vars.monthly_rent) : undefined,
          security_deposit: vars.security_deposit ? Number(vars.security_deposit) : undefined,
          rent_due_day: vars.rent_due_day ? Number(vars.rent_due_day) : undefined,
          late_fee: vars.late_fee ? Number(vars.late_fee) : undefined,
        },
      });
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Upload your lease</h1>
        <p className="text-muted-foreground mb-6">
          We&apos;ll attach this file to the tenant&apos;s portal and collect e-signatures. Fill in the commercial
          terms so the lease shows up correctly on the tenant&apos;s and the property&apos;s profile.
        </p>

        <Card>
          <CardContent className="p-6 space-y-5">
            {/* File picker */}
            <div
              onClick={pick}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/40 transition"
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={e => handleFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex flex-col items-center gap-1">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    className="text-xs text-muted-foreground underline mt-1"
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                  >Choose a different file</button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to choose or drag a file here</p>
                  <p className="text-xs text-muted-foreground">.pdf, .doc, .docx · up to 25 MB</p>
                </div>
              )}
            </div>

            {/* Parties */}
            <section>
              <h2 className="font-semibold mb-3">Parties</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <UFLabel label="Landlord name">
                  <Input value={vars.landlord_name} onChange={e => setVars({ ...vars, landlord_name: e.target.value })} />
                </UFLabel>
                <UFLabel label="Tenant full name *">
                  <Input value={vars.tenant_name} onChange={e => setVars({ ...vars, tenant_name: e.target.value })} />
                </UFLabel>
                <UFLabel label="Tenant email *">
                  <Input type="email" value={vars.tenant_email} onChange={e => setVars({ ...vars, tenant_email: e.target.value })} />
                </UFLabel>
              </div>
            </section>

            {/* Property */}
            <section>
              <h2 className="font-semibold mb-3">Property</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <UFLabel label="Street address *">
                  <Input value={vars.property_address} onChange={e => setVars({ ...vars, property_address: e.target.value })} />
                </UFLabel>
                <UFLabel label="City">
                  <Input value={vars.property_city} onChange={e => setVars({ ...vars, property_city: e.target.value })} />
                </UFLabel>
                <UFLabel label="State">
                  <Select value={vars.state} onValueChange={v => setVars({ ...vars, state: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </UFLabel>
                <UFLabel label="Zip">
                  <Input value={vars.property_zip} onChange={e => setVars({ ...vars, property_zip: e.target.value })} />
                </UFLabel>
              </div>
            </section>

            {/* Term & rent */}
            <section>
              <h2 className="font-semibold mb-3">Term &amp; Rent</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <UFLabel label="Lease start date *">
                  <Input type="date" value={vars.lease_start_date} onChange={e => setVars({ ...vars, lease_start_date: e.target.value })} />
                </UFLabel>
                <UFLabel label="Lease end date *">
                  <Input type="date" value={vars.lease_end_date} onChange={e => setVars({ ...vars, lease_end_date: e.target.value })} />
                </UFLabel>
                <UFLabel label="Monthly rent ($) *">
                  <Input type="number" value={vars.monthly_rent} onChange={e => setVars({ ...vars, monthly_rent: e.target.value })} />
                </UFLabel>
                <UFLabel label="Rent due day of month">
                  <Input type="number" value={vars.rent_due_day} onChange={e => setVars({ ...vars, rent_due_day: e.target.value })} />
                </UFLabel>
                <UFLabel label="Security deposit ($)">
                  <Input type="number" value={vars.security_deposit} onChange={e => setVars({ ...vars, security_deposit: e.target.value })} />
                </UFLabel>
                <UFLabel label="Late fee ($)">
                  <Input type="number" value={vars.late_fee} onChange={e => setVars({ ...vars, late_fee: e.target.value })} />
                </UFLabel>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                We don&apos;t modify your uploaded PDF. These fields are stored alongside the file so the lease shows up
                with the right rent, dates, and parties on the tenant and property profile.
              </p>
            </section>

            <div className="pt-2 flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate("/leases/send")}>← Back</Button>
              <Button onClick={submit} disabled={!file || uploading || uploadOwnDraftMut.isPending}>
                {uploading || uploadOwnDraftMut.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Uploading…</>
                ) : (
                  <>Continue to preview <ChevronRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UFLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
