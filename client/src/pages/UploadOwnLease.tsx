// UploadOwnLease — Pro members upload their own PDF/DOC/DOCX, then we create a draft
// document and route them to the preview screen for tenant info + send.

import { useRef, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function UploadOwnLease() {
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");

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
    if (!tenantName.trim() || !tenantEmail.trim()) {
      return toast.error("Tenant name and email are required.");
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
        variables: { tenant_name: tenantName.trim(), tenant_email: tenantEmail.trim() },
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
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Upload your lease</h1>
        <p className="text-muted-foreground mb-6">
          We&apos;ll attach this file to the tenant&apos;s portal and collect e-signatures. Max 25 MB. PDF / DOC / DOCX.
        </p>

        <Card>
          <CardContent className="p-6 space-y-5">
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Tenant full name *</Label>
                <Input value={tenantName} onChange={e => setTenantName(e.target.value)} />
              </div>
              <div>
                <Label>Tenant email *</Label>
                <Input type="email" value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} />
              </div>
            </div>

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
