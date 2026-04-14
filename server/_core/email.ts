/**
 * Email helper using Resend.
 * Falls back to console.log in development when RESEND_API_KEY is not set.
 */
import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.FROM_EMAIL ?? "Leasely <noreply@leasely.net>";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send a transactional email via Resend.
 * Silently skips (logs) when RESEND_API_KEY is not configured.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    console.log(`[Email] Would send to ${payload.to}: ${payload.subject}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
    });

    if (error) {
      console.warn("[Email] Resend error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Email] Failed to send email:", err);
    return false;
  }
}

// ─── Template helpers ────────────────────────────────────────────────────────

export function workOrderDispatchEmail(opts: {
  vendorName: string;
  propertyAddress: string;
  issueTitle: string;
  description: string;
  priority: string;
  landlordName?: string;
  landlordEmail?: string;
  landlordPhone?: string;
}): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Work Order — Leasely</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.vendorName},</p>
    <p style="margin:0 0 16px">A new work order has been assigned to you through <strong>Leasely</strong>.</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;width:140px">Property</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.propertyAddress}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Issue</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.issueTitle}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Priority</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">
            <span style="background:${opts.priority === "emergency" ? "#fee2e2" : opts.priority === "high" ? "#ffedd5" : "#dbeafe"};
                         color:${opts.priority === "emergency" ? "#991b1b" : opts.priority === "high" ? "#9a3412" : "#1e40af"};
                         padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase">
              ${opts.priority}
            </span>
          </td></tr>
      ${opts.description ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Details</td>
          <td style="padding:8px 0">${opts.description}</td></tr>` : ""}
    </table>

    ${opts.landlordEmail || opts.landlordPhone ? `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-weight:600;color:#1e40af">Landlord Contact</p>
      ${opts.landlordName ? `<p style="margin:0 0 4px">${opts.landlordName}</p>` : ""}
      ${opts.landlordEmail ? `<p style="margin:0 0 4px"><a href="mailto:${opts.landlordEmail}" style="color:#1e40af">${opts.landlordEmail}</a></p>` : ""}
      ${opts.landlordPhone ? `<p style="margin:0">${opts.landlordPhone}</p>` : ""}
    </div>` : ""}

    <p style="margin:0 0 8px;color:#6b7280;font-size:14px">Please confirm receipt and contact the property manager to schedule the work.</p>
    <p style="margin:0;color:#9ca3af;font-size:12px">Sent via <a href="https://leasely.net" style="color:#1B2B5E">Leasely</a></p>
  </div>
</div>`;
}

export function tenantMaintenanceConfirmEmail(opts: {
  tenantName: string;
  issueTitle: string;
  propertyAddress: string;
  priority: string;
}): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Maintenance Request Received — Leasely</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.tenantName},</p>
    <p style="margin:0 0 16px">
      We've received your maintenance request and your property manager has been notified.
      You'll be updated as it's assigned and resolved.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;width:120px">Issue</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.issueTitle}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Property</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${opts.propertyAddress}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Priority</td>
          <td style="padding:8px 0;font-weight:600;text-transform:capitalize">${opts.priority}</td></tr>
    </table>

    <p style="margin:0;color:#9ca3af;font-size:12px">Powered by <a href="https://leasely.net" style="color:#1B2B5E">Leasely</a></p>
  </div>
</div>`;
}

export function landlordMaintenanceAlertEmail(opts: {
  landlordName: string;
  tenantName: string;
  tenantEmail?: string;
  propertyAddress: string;
  issueTitle: string;
  description: string;
  priority: string;
  dashboardUrl: string;
}): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">New Maintenance Request — Leasely</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi${opts.landlordName ? ` ${opts.landlordName}` : ""},</p>
    <p style="margin:0 0 16px">
      Your tenant <strong>${opts.tenantName}</strong>${opts.tenantEmail ? ` (${opts.tenantEmail})` : ""} has submitted a maintenance request.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;width:120px">Property</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.propertyAddress}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Issue</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.issueTitle}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Priority</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">
            <span style="background:${opts.priority === "emergency" ? "#fee2e2" : opts.priority === "high" ? "#ffedd5" : "#dbeafe"};
                         color:${opts.priority === "emergency" ? "#991b1b" : opts.priority === "high" ? "#9a3412" : "#1e40af"};
                         padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase">
              ${opts.priority}
            </span>
          </td></tr>
      ${opts.description ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Details</td>
          <td style="padding:8px 0">${opts.description}</td></tr>` : ""}
    </table>

    <a href="${opts.dashboardUrl}"
       style="display:inline-block;background:#1B2B5E;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:16px">
      View &amp; Assign in Dashboard →
    </a>

    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">Powered by <a href="https://leasely.net" style="color:#1B2B5E">Leasely</a></p>
  </div>
</div>`;
}

// ── Lease Agreement Email (sent to tenant for review & signing) ───────────────
export function leaseAgreementEmail(opts: {
  tenantName: string;
  landlordName: string;
  propertyAddress: string;
  state: string;
  monthlyRentDollars: number;
  securityDepositDollars: number;
  leaseStartDate: string;
  leaseTerm: string;
  leaseUrl: string; // link to view/sign lease
}): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Your Lease Agreement is Ready — Leasely</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.tenantName},</p>
    <p style="margin:0 0 16px">
      Your landlord <strong>${opts.landlordName}</strong> has prepared your ${opts.state}-compliant lease agreement for
      <strong>${opts.propertyAddress}</strong>. Please review and sign at your earliest convenience.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;width:160px">Property</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.propertyAddress}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Monthly Rent</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">$${opts.monthlyRentDollars.toLocaleString()}/mo</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Security Deposit</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">$${opts.securityDepositDollars.toLocaleString()}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Lease Starts</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.leaseStartDate}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Term</td>
          <td style="padding:8px 0;font-weight:600">${opts.leaseTerm.replace(/_/g, " ")}</td></tr>
    </table>
    <a href="${opts.leaseUrl}"
       style="display:inline-block;background:#00C896;color:#062018;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:20px">
      Review &amp; Sign Your Lease →
    </a>
    <p style="margin:16px 0 8px;color:#6b7280;font-size:14px">
      Once you sign, you'll automatically receive payment links for your first month's rent and security deposit.
    </p>
    <p style="margin:0;color:#9ca3af;font-size:12px">Powered by <a href="https://leasely.net" style="color:#1B2B5E">Leasely</a></p>
  </div>
</div>`;
}

// ── Lease Signed — Payment Links Email ───────────────────────────────────────
export function leaseSignedPaymentEmail(opts: {
  tenantName: string;
  propertyAddress: string;
  monthlyRentDollars: number;
  securityDepositDollars: number;
  rentPaymentUrl: string;
  depositPaymentUrl: string;
  accessMethod: string;
  lockboxCode?: string;
  accessInstructions?: string;
}): string {
  const accessSection = opts.accessMethod === "lockbox" && opts.lockboxCode
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px;font-weight:700;color:#166534;font-size:15px">🔑 Lockbox Access Code</p>
        <p style="margin:0 0 8px;font-size:28px;font-weight:900;letter-spacing:0.15em;color:#166534">${opts.lockboxCode}</p>
        ${opts.accessInstructions ? `<p style="margin:0;color:#15803d;font-size:14px">${opts.accessInstructions}</p>` : ""}
       </div>`
    : opts.accessInstructions
    ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px;font-weight:700;color:#1e40af">🔑 Key / Access Instructions</p>
        <p style="margin:0;color:#1e40af;font-size:14px">${opts.accessInstructions}</p>
       </div>`
    : "";

  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Lease Signed — Complete Your Move-In Payments</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.tenantName},</p>
    <p style="margin:0 0 16px">
      Your lease for <strong>${opts.propertyAddress}</strong> has been signed.
      Please complete your move-in payments below to finalize your tenancy.
    </p>
    <div style="margin-bottom:12px">
      <a href="${opts.rentPaymentUrl}"
         style="display:block;background:#00C896;color:#062018;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;text-align:center;margin-bottom:10px">
        Pay First Month's Rent — $${opts.monthlyRentDollars.toLocaleString()} →
      </a>
      <a href="${opts.depositPaymentUrl}"
         style="display:block;background:#1B2B5E;color:white;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;text-align:center">
        Pay Security Deposit — $${opts.securityDepositDollars.toLocaleString()} →
      </a>
    </div>
    ${accessSection}
    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">Powered by <a href="https://leasely.net" style="color:#1B2B5E">Leasely</a></p>
  </div>
</div>`;
}

// ── Vendor Dispatch Request (multi-bid with time slots) ───────────────────────
export function vendorDispatchRequestEmail(opts: {
  vendorName: string;
  propertyAddress: string;
  issueTitle: string;
  description: string;
  priority: string;
  photos?: string[];
  responseUrl: string; // URL for vendor to respond with time slot & quote
  isEmergency?: boolean;
}): string {
  const photoSection = opts.photos && opts.photos.length > 0
    ? `<div style="margin:16px 0">
        <p style="margin:0 0 8px;font-weight:600;color:#374151">Photos:</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${opts.photos.slice(0, 4).map(url => `<img src="${url}" style="width:140px;height:100px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb" />`).join("")}
        </div>
       </div>`
    : "";

  const emergencyBanner = opts.isEmergency
    ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px;margin-bottom:16px">
        <p style="margin:0;font-weight:700;color:#991b1b;font-size:15px">🚨 EMERGENCY — Immediate Response Required</p>
        <p style="margin:4px 0 0;color:#b91c1c;font-size:13px">The tenant has flagged this as an emergency. Please contact them directly and respond ASAP.</p>
       </div>`
    : "";

  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">New Job Request — Leasely</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    ${emergencyBanner}
    <p style="margin:0 0 16px">Hi ${opts.vendorName},</p>
    <p style="margin:0 0 16px">A landlord on <strong>Leasely</strong> is requesting your services. Review the details and submit your available time slot and quote.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;width:120px">Property</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.propertyAddress}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Issue</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.issueTitle}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Priority</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">
            <span style="background:${opts.priority === "emergency" ? "#fee2e2" : opts.priority === "high" ? "#ffedd5" : "#dbeafe"};
                         color:${opts.priority === "emergency" ? "#991b1b" : opts.priority === "high" ? "#9a3412" : "#1e40af"};
                         padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase">${opts.priority}</span>
          </td></tr>
      ${opts.description ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Details</td>
          <td style="padding:8px 0">${opts.description}</td></tr>` : ""}
    </table>
    ${photoSection}
    <a href="${opts.responseUrl}"
       style="display:block;background:#00C896;color:#062018;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;text-align:center;margin-bottom:12px">
      Submit Your Availability &amp; Quote →
    </a>
    <p style="margin:0 0 4px;color:#6b7280;font-size:13px">Choose your available date and time slot, provide a quote, and the landlord will approve and confirm.</p>
    <p style="margin:0;color:#9ca3af;font-size:12px">Sent via <a href="https://leasely.net" style="color:#1B2B5E">Leasely</a></p>
  </div>
</div>`;
}

// ── Landlord — Vendor Quote Received ─────────────────────────────────────────
export function vendorQuoteReceivedEmail(opts: {
  landlordName: string;
  vendorName: string;
  issueTitle: string;
  propertyAddress: string;
  proposedDate: string;
  proposedTimeSlot: string;
  quoteDollars: number;
  vendorNotes?: string;
  approveUrl: string;
  dashboardUrl: string;
}): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Vendor Quote Received — Leasely</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.landlordName},</p>
    <p style="margin:0 0 16px"><strong>${opts.vendorName}</strong> has responded to your work order with an available time slot and quote.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;width:140px">Issue</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.issueTitle}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Property</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${opts.propertyAddress}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Available Date</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.proposedDate}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Time Slot</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:600">${opts.proposedTimeSlot}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Quote</td>
          <td style="padding:8px 0;font-size:20px;font-weight:900;color:#166534">$${opts.quoteDollars.toLocaleString()}</td></tr>
    </table>
    ${opts.vendorNotes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:20px"><p style="margin:0;color:#92400e;font-size:14px"><strong>Vendor Note:</strong> ${opts.vendorNotes}</p></div>` : ""}
    <div style="display:flex;gap:12px;margin-bottom:16px">
      <a href="${opts.approveUrl}"
         style="flex:1;display:block;background:#00C896;color:#062018;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center">
        ✓ Approve &amp; Schedule
      </a>
      <a href="${opts.dashboardUrl}"
         style="flex:1;display:block;background:#1B2B5E;color:white;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center">
        View Dashboard
      </a>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:12px">Powered by <a href="https://leasely.net" style="color:#1B2B5E">Leasely</a></p>
  </div>
</div>`;
}

// ── Vendor Job Confirmed — Work Complete / Payment Request ────────────────────
export function vendorJobCompleteEmail(opts: {
  landlordName: string;
  vendorName: string;
  issueTitle: string;
  propertyAddress: string;
  finalAmountDollars: number;
  paymentUrl: string;
}): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">Job Complete — Pay Your Vendor</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.landlordName},</p>
    <p style="margin:0 0 16px"><strong>${opts.vendorName}</strong> has marked the job as complete for <strong>${opts.issueTitle}</strong> at ${opts.propertyAddress}.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;text-align:center">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px">Amount Due</p>
      <p style="margin:0;font-size:32px;font-weight:900;color:#166534">$${opts.finalAmountDollars.toLocaleString()}</p>
    </div>
    <a href="${opts.paymentUrl}"
       style="display:block;background:#00C896;color:#062018;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;text-align:center;margin-bottom:12px">
      Pay ${opts.vendorName} — $${opts.finalAmountDollars.toLocaleString()} →
    </a>
    <p style="margin:0;color:#9ca3af;font-size:12px">Powered by <a href="https://leasely.net" style="color:#1B2B5E">Leasely</a></p>
  </div>
</div>`;
}
