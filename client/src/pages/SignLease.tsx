import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileSignature, CheckCircle2, Loader2, ShieldCheck, Home, DoorOpen,
  Calendar, DollarSign, FileText, ExternalLink,
} from "lucide-react";

const ACCENT = "#4F46E5";
const money = (c?: number) => c == null ? "—" : `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const fmtDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? s : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};
const isRoom = (t?: string) => (t || "").toLowerCase().replace(/[-\s]/g, "_").startsWith("co_living");

export default function SignLease() {
  const { token = "" } = useParams();
  const invite = trpc.crm.getLeaseInvite.useQuery({ token }, { retry: false, enabled: !!token });
  const submit = trpc.crm.submitSignedLease.useMutation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  if (invite.isLoading) {
    return <Center><Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} /></Center>;
  }
  if (invite.isError || !invite.data) {
    return (
      <Center>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔗</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>This signing link isn't valid</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>It may have expired or been mistyped. Ask your landlord to resend it.</p>
        </div>
      </Center>
    );
  }

  const d = invite.data;
  const room = isRoom(d.propertyType);
  const fullAddr = d.unit ? `${d.address} ${room ? `· Room ${d.unit}` : `#${d.unit}`}` : d.address;

  if (done) {
    return (
      <Center>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={32} color="#059669" />
          </div>
          <h1 style={{ fontSize: 23, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Lease signed — you're all set</h1>
          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.5, margin: "0 0 22px" }}>
            Thanks, {name.split(/\s+/)[0]}. {d.landlordName} has your signed lease for <b>{fullAddr}</b>. Your tenant portal is live — you can pay rent online and set up autopay anytime.
          </p>
          <a href="/portal" style={{ background: ACCENT, color: "#fff", textDecoration: "none", fontWeight: 700, padding: "12px 22px", borderRadius: 10, display: "inline-block" }}>
            Go to my tenant portal
          </a>
        </div>
      </Center>
    );
  }

  async function sign() {
    if (name.trim().length < 2) { toast.error("Type your full legal name to sign."); return; }
    if (!agreed) { toast.error("Check the box to agree to the lease terms."); return; }
    try {
      await submit.mutateAsync({ token, signatureName: name.trim(), phone: phone.trim() || undefined, agreed: true });
      setDone(true);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't submit — try again.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 16px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileSignature size={20} color={ACCENT} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: ".05em" }}>Lease to sign</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>{d.landlordName}</h1>
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: 14.5, margin: "10px 0 22px" }}>
          Review the terms below, then sign with your full legal name. Signing gives you instant access to your tenant portal.
        </p>

        {/* Terms card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
            {room ? <DoorOpen size={18} color="#0e7490" /> : <Home size={18} color={ACCENT} />}
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{fullAddr}</div>
              <div style={{ color: "#94a3b8", fontSize: 12.5 }}>{[d.city, d.state, d.zip].filter(Boolean).join(", ")}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            <Term icon={<DollarSign size={15} />} label="Monthly rent" value={`${money(d.monthlyRentCents)}/mo`} />
            <Term icon={<ShieldCheck size={15} />} label="Security deposit" value={money(d.securityDepositCents)} />
            <Term icon={<Calendar size={15} />} label="Lease start" value={fmtDate(d.leaseStartDate)} />
            <Term icon={<Calendar size={15} />} label="Lease end" value={d.leaseEndDate ? fmtDate(d.leaseEndDate) : "Month-to-month"} />
            <Term icon={<DollarSign size={15} />} label="Late fee" value={`${money(d.lateFeeCents)} after ${d.lateFeeGraceDays}-day grace`} span />
          </div>
        </div>

        {/* Lease document */}
        {d.documentUrl ? (
          <a href={d.documentUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, textDecoration: "none", color: "#0f172a", marginBottom: 20 }}>
            <FileText size={20} color={ACCENT} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Read the full lease document</div>
              <div style={{ color: "#94a3b8", fontSize: 12.5 }}>Opens the lease your landlord uploaded — review it before signing.</div>
            </div>
            <ExternalLink size={16} color="#94a3b8" />
          </a>
        ) : (
          <div style={{ padding: "14px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 20, fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
            <b style={{ color: "#0f172a" }}>Keycove standard agreement.</b> By signing, you agree to rent {fullAddr} from {d.landlordName} for {money(d.monthlyRentCents)}/month
            {d.leaseEndDate ? ` from ${fmtDate(d.leaseStartDate)} to ${fmtDate(d.leaseEndDate)}` : ` on a month-to-month basis starting ${fmtDate(d.leaseStartDate)}`},
            with a {money(d.securityDepositCents)} security deposit and a {money(d.lateFeeCents)} late fee if rent is unpaid past the {d.lateFeeGraceDays}-day grace period. Rent is payable through your Keycove tenant portal.
          </div>
        )}

        {/* Sign box */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 22 }}>
          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 14 }}>Sign your lease</div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Type your full legal name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jasmine Reed"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 15, marginBottom: 14 }} />
          {name.trim() && (
            <div style={{ padding: "12px 16px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Your signature</div>
              <div style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive", fontSize: 26, color: "#0f172a" }}>{name.trim()}</div>
            </div>
          )}
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Phone (optional)</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="555-123-4567"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 15, marginBottom: 16 }} />

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginBottom: 18 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: ACCENT }} />
            <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              I have reviewed the lease terms{d.documentUrl ? " and document" : ""} above and agree to them. I understand typing my name is my legal electronic signature.
            </span>
          </label>

          <button onClick={sign} disabled={submit.isPending}
            style={{ width: "100%", background: ACCENT, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submit.isPending ? 0.7 : 1 }}>
            {submit.isPending ? <><Loader2 size={17} className="animate-spin" /> Signing…</> : <><FileSignature size={17} /> Sign lease &amp; activate my portal</>}
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, color: "#94a3b8", fontSize: 12 }}>
            <ShieldCheck size={13} /> Private signing link · secured by Keycove
          </div>
        </div>
      </div>
    </div>
  );
}

function Term({ icon, label, value, span }: { icon: React.ReactNode; label: string; value: string; span?: boolean }) {
  return (
    <div style={{ padding: "13px 20px", borderBottom: "1px solid #f1f5f9", gridColumn: span ? "1 / -1" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{icon} {label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", background: "#f5f6fa", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>{children}</div>;
}
