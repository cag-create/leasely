// Send Lease entry point — Pro members pick "Upload my own" vs "Use Keycove template".
// Phase 2 of the lease send flow. Routes to /leases/send/wizard or /leases/send/upload.

import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, ShieldCheck, ChevronRight } from "lucide-react";

export default function SendLease() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Send a Lease</h1>
          <p className="text-muted-foreground mt-2">
            Choose how you want to send your lease to the tenant. Both options support e-signature, automatic move-in
            payments, and an audit trail.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="hover:border-primary cursor-pointer transition-colors"
            onClick={() => navigate("/leases/send/upload")}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mb-5">
                <Upload className="h-7 w-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Upload my own lease</h2>
              <p className="text-sm text-muted-foreground mb-6">
                You already have a lease in PDF, DOC, or DOCX format. We&apos;ll add it to the tenant&apos;s portal and
                collect e-signatures.
              </p>
              <ul className="text-sm space-y-1.5 text-muted-foreground mb-6">
                <li>• Supports .pdf, .doc, .docx</li>
                <li>• Up to 25 MB</li>
                <li>• Same e-signature + audit trail</li>
              </ul>
              <Button variant="outline" className="w-full">
                Upload a file <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary cursor-pointer transition-colors border-primary/40"
            onClick={() => navigate("/leases/send/wizard")}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-5">
                <FileText className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Use a Keycove template</h2>
              <p className="text-sm text-muted-foreground mb-6">
                State-specific lease with the required disclosures, deposit caps, and notice periods built in. Choose
                Standard Residential or Co-Living.
              </p>
              <ul className="text-sm space-y-1.5 text-muted-foreground mb-6">
                <li>• North Carolina &amp; Tennessee available</li>
                <li>• Other states fall back to a generic multi-state template</li>
                <li>• Edit clauses and add custom terms</li>
              </ul>
              <div className="flex items-center text-xs text-muted-foreground mb-3">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Keycove is not a law firm and does not provide legal advice.
              </div>
              <Button className="w-full">
                Build a lease <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-xs text-muted-foreground">
          Need to find a previously sent lease?{" "}
          <button className="underline" onClick={() => navigate("/leases")}>
            Go to Lease Agreements
          </button>
          .
        </div>
      </div>
    </div>
  );
}
