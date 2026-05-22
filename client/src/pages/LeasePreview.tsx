// LeasePreview — renders a draft lease document, surfaces warnings + unresolved variables,
// requires the landlord to acknowledge the legal disclaimer before sending to the tenant.
//
// Route: /leases/draft/:id

import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertTriangle, FileText, Send, ShieldAlert } from "lucide-react";

export default function LeasePreview() {
  const [, params] = useRoute("/leases/draft/:id");
  const [, navigate] = useLocation();
  const id = Number(params?.id);

  const [acknowledged, setAcknowledged] = useState(false);

  const docQuery = (trpc as any).leaseDocs.get.useQuery({ id }, { enabled: Number.isFinite(id) && id > 0 });
  const ackMut = (trpc as any).leaseDocs.markDisclaimerAcknowledged.useMutation();
  const sendMut = (trpc as any).leaseDocs.send.useMutation({
    onSuccess: () => {
      toast.success("Lease sent — the tenant will receive a signing link by email.");
      navigate("/leases");
    },
    onError: (e: any) => toast.error(e.message ?? "Send failed"),
  });

  const doc = docQuery.data?.document;
  const vars = (() => {
    try { return doc?.variableValues ? JSON.parse(doc.variableValues) : {}; } catch { return {}; }
  })();
  const tenantEmail: string | undefined = vars?.tenant_email;

  const handleSend = async () => {
    if (!acknowledged) {
      toast.error("You must acknowledge the legal disclaimer before sending.");
      return;
    }
    try {
      await ackMut.mutateAsync({ id });
      await sendMut.mutateAsync({ id });
    } catch (e: any) {
      // toast handled by onError
    }
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p>Invalid lease draft id.</p>
        </div>
      </div>
    );
  }

  if (docQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 flex items-center text-muted-foreground">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading draft…
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p>Draft not found.</p>
        </div>
      </div>
    );
  }

  const isUploaded = doc.source === "uploaded";

  // Find any unresolved {{var}} placeholders rendered as lease-unresolved spans.
  const unresolvedCount =
    typeof doc.renderedHtml === "string"
      ? (doc.renderedHtml.match(/class="lease-unresolved"/g) ?? []).length
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Lease draft #{doc.id}</h1>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{doc.status}</span>
              {tenantEmail && <> · Tenant: {tenantEmail}</>}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/leases")}>← Back to Leases</Button>
        </div>

        {unresolvedCount > 0 && (
          <Card className="mb-4 border-red-300 bg-red-50">
            <CardContent className="p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">{unresolvedCount} required field{unresolvedCount === 1 ? "" : "s"} unfilled.</p>
                <p className="text-muted-foreground mt-0.5">
                  The placeholders are highlighted in the preview below. Go back and fill them before sending.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isUploaded ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-10 w-10 mx-auto text-blue-600 mb-3" />
              <p className="font-medium mb-1">{doc.uploadedFilename}</p>
              <p className="text-xs text-muted-foreground mb-4">{doc.uploadedMimeType}</p>
              {doc.uploadedFileUrl && (
                <a
                  className="text-sm text-primary underline"
                  href={doc.uploadedFileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open uploaded lease
                </a>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6">
              <style>{`
                .lease-unresolved { background:#fee; color:#b00020; padding:0 4px; border-radius:3px; font-weight:600; }
                .lease-preview h1 { font-size:1.5rem; font-weight:700; margin: 1rem 0 .75rem; }
                .lease-preview h2 { font-size:1.1rem; font-weight:600; margin: 1.25rem 0 .5rem; }
                .lease-preview section { margin: .75rem 0; }
                .lease-preview p { line-height: 1.6; margin: .5rem 0; }
                .lease-preview ul, .lease-preview ol { padding-left: 1.5rem; margin: .5rem 0; }
                .lease-preview .signature-block { margin-top: 2rem; padding-top: 1rem; border-top:1px solid #eee; }
                .lease-preview .legal-disclaimer { font-size:.85rem; color:#666; margin-top:1.5rem; }
              `}</style>
              <div
                className="lease-preview text-sm"
                dangerouslySetInnerHTML={{ __html: doc.renderedHtml ?? "<p>(empty)</p>" }}
              />
            </CardContent>
          </Card>
        )}

        <Card className="border-amber-300">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Required acknowledgement before sending</p>
                <p className="text-muted-foreground">
                  Leasely is not a law firm and does not provide legal advice. The templates and any warnings are
                  general informational tools, not a substitute for review by a licensed attorney in the state where the
                  property is located. State law (including required disclosures, deposit caps, late fee limits, and
                  eviction procedure) controls — any lease term inconsistent with state law is unenforceable.
                </p>
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox
                checked={acknowledged}
                onCheckedChange={v => setAcknowledged(Boolean(v))}
                className="mt-0.5"
              />
              <span className="text-sm">
                I understand Leasely does not provide legal advice, and I am responsible for ensuring this lease
                complies with the law of the state where the property is located.
              </span>
            </label>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/leases")}>Save for later</Button>
              <Button
                onClick={handleSend}
                disabled={!acknowledged || sendMut.isPending || unresolvedCount > 0}
              >
                {sendMut.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="h-4 w-4 mr-1.5" /> Send to tenant</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
