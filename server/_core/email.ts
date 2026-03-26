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
