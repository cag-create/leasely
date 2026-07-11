/**
 * Email helper using Brevo (https://developers.brevo.com/reference/sendtransacemail).
 * Falls back to console.log in development when BREVO_API_KEY is not set.
 */

const FROM = process.env.FROM_EMAIL ?? "Keycove <noreply@keycove.net>";

/** Parse "Name <email@host>" or plain "email@host" into Brevo's sender shape. */
function parseSender(value: string): { name?: string; email: string } {
  const match = value.match(/^\s*(.*?)\s*<\s*([^>\s]+)\s*>\s*$/);
  if (match) {
    const name = match[1].replace(/^"|"$/g, "").trim();
    return name ? { name, email: match[2] } : { email: match[2] };
  }
  return { email: value.trim() };
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send a transactional email via Brevo.
 * Silently skips (logs) when BREVO_API_KEY is not configured.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.log(`[Email] Would send to ${payload.to}: ${payload.subject}`);
    return false;
  }

  const recipients = (Array.isArray(payload.to) ? payload.to : [payload.to])
    .map((email) => ({ email }));

  const body: Record<string, unknown> = {
    sender: parseSender(FROM),
    to: recipients,
    subject: payload.subject,
    htmlContent: payload.html,
  };

  if (payload.replyTo) body.replyTo = { email: payload.replyTo };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[Email] Brevo error ${res.status}: ${text}`);
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
    <h1 style="color:white;margin:0;font-size:20px">Work Order — Keycove</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.vendorName},</p>
    <p style="margin:0 0 16px">A new work order has been assigned to you through <strong>Keycove</strong>.</p>

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
    <p style="margin:0;color:#9ca3af;font-size:12px">Sent via <a href="https://keycove.net" style="color:#1B2B5E">Keycove</a></p>
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
    <h1 style="color:white;margin:0;font-size:20px">Maintenance Request Received — Keycove</h1>
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

    <p style="margin:0;color:#9ca3af;font-size:12px">Powered by <a href="https://keycove.net" style="color:#1B2B5E">Keycove</a></p>
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
    <h1 style="color:white;margin:0;font-size:20px">New Maintenance Request — Keycove</h1>
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

    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">Powered by <a href="https://keycove.net" style="color:#1B2B5E">Keycove</a></p>
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
    <h1 style="color:white;margin:0;font-size:20px">Your Lease Agreement is Ready — Keycove</h1>
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
      <strong>How signing works:</strong> You sign first. Then you'll be sent payment links for your security deposit and first month's rent.
      Your landlord countersigns once payment clears, at which point the lease is fully executed and you'll receive move-in instructions.
    </p>
    <p style="margin:0;color:#9ca3af;font-size:12px">Powered by <a href="https://keycove.net" style="color:#1B2B5E">Keycove</a></p>
  </div>
</div>`;
}

// ── Lease Signed — Payment Links Email ───────────────────────────────────────
// Auto-fires from server/routers.ts after the tenant signs. The email is the
// tenant's primary handoff between signing and payment — it must:
//   1. Make the two required payments unmissable (two amber CTAs).
//   2. Set expectations: lease is conditional, keys arrive after payment +
//      countersignature.
//   3. NEVER leak the raw lockbox code or any access secret in the email —
//      tenants reveal those in their dashboard ONLY after payment clears.
const ACCESS_METHOD_LABEL: Record<string, string> = {
  key_pickup: "Pick up keys from landlord",
  lockbox: "Lockbox at property",
  smart_lock: "Smart lock code",
  in_person: "Landlord will meet you at the property",
};

// Heuristic: an instructions string is "sensitive" if it likely contains a
// code, key combination, or password. Those get gated behind payment.
// Generic pickup notes ("Stop by the office between 9-5") pass through.
function looksSensitive(s: string): boolean {
  return /\b(code|pin|password|combination|combo)\b/i.test(s) || /\d{4,}/.test(s);
}

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
  leaseStartDateFormatted?: string; // e.g. "June 1, 2026"
}): string {
  const methodLabel = ACCESS_METHOD_LABEL[opts.accessMethod] ?? "Coordinated with your landlord";

  // The lockbox code is NEVER rendered in the email. If access instructions
  // contain a code/pin/combination, gate them with the same "see dashboard"
  // copy. Generic non-sensitive instructions pass through so the tenant has
  // something concrete to plan around.
  const hasLockboxCode = !!opts.lockboxCode;
  const safeInstructions =
    opts.accessInstructions && !looksSensitive(opts.accessInstructions)
      ? opts.accessInstructions
      : undefined;
  const gatedInstructions =
    opts.accessInstructions && looksSensitive(opts.accessInstructions);

  const depositLine = opts.securityDepositDollars > 0
    ? `<a href="${opts.depositPaymentUrl}"
           style="display:block;background:#F5A623;color:#3A2410;padding:16px 24px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;text-align:center;margin-bottom:10px;border:1px solid #E8951A">
          Pay Security Deposit — $${opts.securityDepositDollars.toLocaleString()}
        </a>`
    : "";

  const moveInLine = opts.leaseStartDateFormatted
    ? `<li style="margin-bottom:8px">Move in on <strong>${opts.leaseStartDateFormatted}</strong></li>`
    : `<li style="margin-bottom:8px">Move in on the lease start date</li>`;

  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:10px 10px 0 0">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:800">Action Required — Pay to Activate Your Lease</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">

    <p style="margin:0 0 12px;font-size:16px;color:#111827">
      Congrats ${opts.tenantName} — your lease for <strong>${opts.propertyAddress}</strong> is signed.
    </p>

    <!-- Status banner — amber -->
    <div style="background:#fffaf0;border:1px solid #F5A623;border-radius:8px;padding:14px 16px;margin:16px 0">
      <p style="margin:0;color:#7a4706;font-size:14px;line-height:1.55">
        Your lease is <strong>conditional</strong> until first month's rent and security deposit are paid. Once payment clears, the landlord will countersign and you'll receive keys.
      </p>
    </div>

    <!-- Payment CTAs — two amber buttons -->
    <div style="margin:20px 0 8px">
      <a href="${opts.rentPaymentUrl}"
         style="display:block;background:#F5A623;color:#3A2410;padding:16px 24px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;text-align:center;margin-bottom:10px;border:1px solid #E8951A">
        Pay First Month's Rent — $${opts.monthlyRentDollars.toLocaleString()}
      </a>
      ${depositLine}
    </div>

    <!-- How you'll get your keys — emerald card -->
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:24px 0">
      <p style="margin:0 0 6px;font-weight:800;color:#166534;font-size:14px">🔑 How you'll get your keys</p>
      <p style="margin:0 0 10px;color:#166534;font-size:14px"><strong>${methodLabel}</strong></p>
      ${hasLockboxCode
        ? `<p style="margin:0 0 8px;color:#15803d;font-size:13px;line-height:1.5">Your lockbox code will be revealed in your <a href="https://keycove.net/tenant" style="color:#15803d;font-weight:700;text-decoration:underline">tenant dashboard</a> once payment clears.</p>`
        : ""}
      ${gatedInstructions
        ? `<p style="margin:0;color:#15803d;font-size:13px;line-height:1.5">Detailed access instructions will be revealed in your <a href="https://keycove.net/tenant" style="color:#15803d;font-weight:700;text-decoration:underline">tenant dashboard</a> once payment clears.</p>`
        : ""}
      ${safeInstructions
        ? `<pre style="margin:8px 0 0;padding:10px 12px;background:#ffffff;border:1px solid #bbf7d0;border-radius:6px;font-family:'Courier New',monospace;font-size:13px;color:#166534;white-space:pre-wrap;word-break:break-word">${safeInstructions}</pre>`
        : ""}
    </div>

    <!-- What happens next -->
    <p style="margin:20px 0 8px;font-weight:700;color:#111827;font-size:14px">What happens next:</p>
    <ol style="margin:0 0 16px;padding-left:22px;color:#374151;font-size:14px;line-height:1.5">
      <li style="margin-bottom:8px">Pay first month's rent and security deposit using the buttons above</li>
      <li style="margin-bottom:8px">Landlord countersigns within 24 hours</li>
      <li style="margin-bottom:8px">You'll receive a final email with the executed lease attached + full access details</li>
      ${moveInLine}
    </ol>

    <!-- Help line -->
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.5">
      Questions? Reply to this email or submit a repair request from your <a href="https://keycove.net/tenant" style="color:#E8951A;font-weight:600">tenant dashboard</a>.
    </p>

    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">Powered by <a href="https://keycove.net" style="color:#E8951A">Keycove</a></p>
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
    <h1 style="color:white;margin:0;font-size:20px">New Job Request — Keycove</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    ${emergencyBanner}
    <p style="margin:0 0 16px">Hi ${opts.vendorName},</p>
    <p style="margin:0 0 16px">A landlord on <strong>Keycove</strong> is requesting your services. Review the details and submit your available time slot and quote.</p>
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
    <p style="margin:0;color:#9ca3af;font-size:12px">Sent via <a href="https://keycove.net" style="color:#1B2B5E">Keycove</a></p>
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
    <h1 style="color:white;margin:0;font-size:20px">Vendor Quote Received — Keycove</h1>
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
    <p style="margin:0;color:#9ca3af;font-size:12px">Powered by <a href="https://keycove.net" style="color:#1B2B5E">Keycove</a></p>
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
    <p style="margin:0;color:#9ca3af;font-size:12px">Powered by <a href="https://keycove.net" style="color:#1B2B5E">Keycove</a></p>
  </div>
</div>`;
}

export function emailVerifyEmail(opts: { name: string; verifyUrl: string }) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1B2B5E,#00C896);padding:28px;border-radius:10px 10px 0 0;color:white;text-align:center">
    <h1 style="margin:0;font-size:22px;font-weight:800">Verify your email</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.name || "there"},</p>
    <p style="margin:0 0 16px">Welcome to Keycove. Please verify your email address to activate full account access. This link expires in 24 hours.</p>
    <a href="${opts.verifyUrl}"
       style="display:block;background:#00C896;color:#062018;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;text-align:center;margin-bottom:16px">
      Verify Email →
    </a>
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px">If the button doesn't work, paste this URL into your browser:</p>
    <p style="margin:0 0 16px;color:#1B2B5E;font-size:12px;word-break:break-all">${opts.verifyUrl}</p>
    <p style="margin:0;color:#9ca3af;font-size:12px">If you didn't sign up for Keycove, you can safely ignore this email.</p>
  </div>
</div>`;
}

export function newInquiryEmail(opts: {
  ownerName: string;
  listingTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  moveInDate?: string;
  dashboardUrl: string;
}) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1B2B5E,#00C896);padding:28px;border-radius:10px 10px 0 0;color:white;text-align:center">
    <h1 style="margin:0;font-size:22px;font-weight:800">New Inquiry Received</h1>
    <p style="margin:8px 0 0;opacity:0.85;font-size:14px">Someone is interested in your property</p>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:28px">
    <p style="margin:0 0 16px;color:#374151;font-size:15px">Hi ${opts.ownerName},</p>
    <p style="margin:0 0 20px;color:#374151;font-size:15px">You have a new inquiry for <strong>${opts.listingTitle}</strong>.</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 20px">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">From</p>
      <p style="margin:0 0 4px;color:#111827;font-size:15px;font-weight:600">${opts.senderName}</p>
      <p style="margin:0 0 4px;color:#374151;font-size:14px">${opts.senderEmail}</p>
      ${opts.senderPhone ? `<p style="margin:0;color:#374151;font-size:14px">${opts.senderPhone}</p>` : ""}
      ${opts.moveInDate ? `<p style="margin:8px 0 0;color:#374151;font-size:13px">Desired move-in: <strong>${opts.moveInDate}</strong></p>` : ""}
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 24px">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.05em">Message</p>
      <p style="margin:0;color:#15803d;font-size:15px;white-space:pre-line">${opts.message}</p>
    </div>
    <p style="margin:0 0 8px;color:#374151;font-size:14px">Reply directly to this email to reach ${opts.senderName}, or manage all inquiries from your dashboard.</p>
    <div style="text-align:center;margin:24px 0 0">
      <a href="${opts.dashboardUrl}" style="background:linear-gradient(135deg,#1B2B5E,#00C896);color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">View Dashboard</a>
    </div>
    <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;text-align:center">Keycove · Property Management Made Simple</p>
  </div>
</div>`;
}

export function passwordResetEmail(opts: { name: string; resetUrl: string }) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1B2B5E,#00C896);padding:28px;border-radius:10px 10px 0 0;color:white;text-align:center">
    <h1 style="margin:0;font-size:22px;font-weight:800">Reset your password</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 16px">Hi ${opts.name || "there"},</p>
    <p style="margin:0 0 16px">We received a request to reset the password for your Keycove account. Click below to set a new password. This link expires in 1 hour.</p>
    <a href="${opts.resetUrl}"
       style="display:block;background:#00C896;color:#062018;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;text-align:center;margin-bottom:16px">
      Reset Password →
    </a>
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px">If the button doesn't work, paste this URL into your browser:</p>
    <p style="margin:0 0 16px;color:#1B2B5E;font-size:12px;word-break:break-all">${opts.resetUrl}</p>
    <p style="margin:0;color:#9ca3af;font-size:12px">If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
  </div>
</div>`;
}
