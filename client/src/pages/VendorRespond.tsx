import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, DollarSign, Calendar, MessageSquare, Wrench
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png";
const BRAND = "#1B2B5E";
const ACCENT = "#F5A623";

const TIME_SLOTS = [
  "7am – 9am", "9am – 12pm", "12pm – 3pm", "3pm – 5pm", "5pm – 7pm",
];

export default function VendorRespond() {
  const { id } = useParams<{ id: string }>();
  const dispatchId = id ? parseInt(id) : null;
  const [submitted, setSubmitted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [form, setForm] = useState({
    proposedDate: "",
    proposedTimeSlot: "",
    quoteDollars: "",
    notes: "",
  });

  const respondMutation = trpc.workOrders.vendorRespond.useMutation({
    onSuccess: (_, vars) => {
      if (vars.action === "accept") setSubmitted(true);
      else setDeclined(true);
    },
    onError: (e) => toast.error(e.message),
  });

  if (!dispatchId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Invalid request link</h2>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Response Sent!</h2>
          <p className="text-gray-500">
            The landlord has been notified of your availability and quote. They'll approve or select another vendor and you'll be contacted.
          </p>
          <p className="text-sm text-gray-400 mt-6">Powered by <strong style={{ color: BRAND }}>Leasely</strong></p>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Declined</h2>
          <p className="text-gray-500">You've declined this job request. No further action needed.</p>
          <p className="text-sm text-gray-400 mt-6">Powered by <strong style={{ color: BRAND }}>Leasely</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <img src={LOGO_URL} alt="Leasely" className="h-7 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-black text-lg" style={{ color: BRAND }}>Leasely</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${BRAND}, #0d3a2a)` }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-white">Job Request</h1>
            </div>
            <p className="text-white/70 text-sm">A landlord on Leasely is requesting your services. Submit your availability and quote below.</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Available Date *
              </Label>
              <Input
                type="date"
                value={form.proposedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setForm(f => ({ ...f, proposedDate: e.target.value }))}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Time Slot *
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, proposedTimeSlot: slot }))}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      form.proposedTimeSlot === slot
                        ? "border-transparent text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                    style={form.proposedTimeSlot === slot ? { background: ACCENT, color: "#3A2410" } : undefined}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Your Quote *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.quoteDollars}
                  onChange={e => setForm(f => ({ ...f, quoteDollars: e.target.value }))}
                  className="pl-8 rounded-xl"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Enter your estimated cost for materials and labor.</p>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-4 h-4" /> Notes (optional)
              </Label>
              <Textarea
                placeholder="Any additional info — materials needed, access requirements, etc."
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 font-bold gap-2"
                style={{ background: ACCENT, color: "#3A2410" }}
                disabled={!form.proposedDate || !form.proposedTimeSlot || !form.quoteDollars || respondMutation.isPending}
                onClick={() => {
                  const quoteCents = Math.round(parseFloat(form.quoteDollars) * 100);
                  respondMutation.mutate({
                    dispatchId: dispatchId!,
                    action: "accept",
                    proposedDate: form.proposedDate,
                    proposedTimeSlot: form.proposedTimeSlot,
                    quoteCents: isNaN(quoteCents) ? 0 : quoteCents,
                    notes: form.notes || undefined,
                  });
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                {respondMutation.isPending ? "Submitting..." : "Submit Availability & Quote"}
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => respondMutation.mutate({ dispatchId: dispatchId!, action: "decline" })}
                disabled={respondMutation.isPending}
              >
                <XCircle className="w-4 h-4" /> Decline
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Powered by <strong style={{ color: BRAND }}>Leasely</strong> — The AI-Powered Landlord OS</p>
      </div>
    </div>
  );
}
