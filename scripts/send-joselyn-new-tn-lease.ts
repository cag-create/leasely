/**
 * One-shot: create a fresh comprehensive TN lease for Joselyn Deleon against
 * the newly-expanded TN_RESIDENTIAL template (v#18) and email her the signing
 * link. Inserts a new lease_agreements row + a new lease_documents row so the
 * existing executed lease #1 stays as historical record.
 *
 * Usage:
 *   railway run --service=MySQL bash -c '
 *     DB_URL="$MYSQL_PUBLIC_URL" \
 *     BREVO_API_KEY="$BREVO_API_KEY" \
 *     VITE_APP_URL="https://leasely.net" \
 *     FROM_EMAIL="Leasely <noreply@leasely.net>" \
 *     npx tsx scripts/send-joselyn-new-tn-lease.ts'
 */
import mysql from "mysql2/promise";
import { renderTemplate } from "../server/leases/render";
import { sendEmail } from "../server/_core/email";

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  console.error("DB_URL required");
  process.exit(1);
}
const APP_URL = process.env.VITE_APP_URL ?? "https://leasely.net";

const JOSELYN = {
  landlordUserId: 2,
  listingId: 4,
  tenantName: "Joselyn Deleon",
  tenantEmail: "deleonjoselyn688@gmail.com",
  tenantPhone: "8658950367",
  state: "TN",
  propertyAddress: "3800 Innsbrook Dr, Memphis, TN, 38115",
  monthlyRent: 160000,       // cents
  securityDeposit: 160000,   // cents
  leaseStartDate: "2026-06-01",
  leaseEndDate: "2027-06-01",
  leaseTerm: "12_months",
  rentDueDay: 1,
};

(async () => {
  const conn = await mysql.createConnection(DB_URL);
  try {
    console.log("Connected to Railway DB.");

    // 1. Look up active TN template version
    const [tplRows] = await conn.execute(
      "SELECT t.id AS templateId, t.activeVersionId, v.bodyHtml, v.citations, v.variables FROM lease_templates t JOIN lease_template_versions v ON v.id = t.activeVersionId WHERE t.state = ? AND t.category = ? LIMIT 1",
      ["TN", "standard_residential"],
    );
    const tpl = (tplRows as any[])[0];
    if (!tpl) throw new Error("No active TN/standard_residential template found");
    console.log(`Using TN template v#${tpl.activeVersionId}`);

    // 2. Fetch landlord info for variable substitution
    const [lordRows] = await conn.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [JOSELYN.landlordUserId],
    );
    const landlord = (lordRows as any[])[0];
    if (!landlord) throw new Error(`Landlord user ${JOSELYN.landlordUserId} not found`);

    // 3. Insert a fresh lease_agreements row in `draft` status
    const [insLease] = await conn.execute(
      `INSERT INTO lease_agreements
        (landlordUserId, listingId, tenantName, tenantEmail, tenantPhone, state,
         propertyAddress, monthlyRent, securityDeposit, leaseStartDate, leaseEndDate,
         leaseTerm, accessMethod, status, rentDueDay, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        JOSELYN.landlordUserId,
        JOSELYN.listingId,
        JOSELYN.tenantName,
        JOSELYN.tenantEmail,
        JOSELYN.tenantPhone,
        JOSELYN.state,
        JOSELYN.propertyAddress,
        JOSELYN.monthlyRent,
        JOSELYN.securityDeposit,
        JOSELYN.leaseStartDate,
        JOSELYN.leaseEndDate,
        JOSELYN.leaseTerm,
        "key_pickup",
        "draft",
        JOSELYN.rentDueDay,
        "Reissued 2026-05-30 with comprehensive TN template (URLTA + LawDepot-style structure).",
      ],
    );
    const newLeaseId = (insLease as any).insertId;
    console.log(`Inserted lease_agreements.id=${newLeaseId}`);

    // 4. Render template
    const citations = tpl.citations ? JSON.parse(tpl.citations) : [];
    const cityM = JOSELYN.propertyAddress.match(/,\s*([^,]+),\s*[A-Z]{2}/);
    const zipM = JOSELYN.propertyAddress.match(/\b(\d{5})\b/);
    const variables: Record<string, unknown> = {
      tenant_name: JOSELYN.tenantName,
      tenant_email: JOSELYN.tenantEmail,
      tenant_phone: JOSELYN.tenantPhone,
      landlord_name: landlord.name ?? "Landlord",
      landlord_email: landlord.email ?? "",
      landlord_phone: landlord.phone ?? "",
      landlord_address: "",
      property_address: JOSELYN.propertyAddress,
      property_city: cityM?.[1]?.trim() ?? "Memphis",
      property_zip: zipM?.[1] ?? "38115",
      state: "TN",
      monthly_rent: JOSELYN.monthlyRent / 100,
      security_deposit: JOSELYN.securityDeposit / 100,
      lease_start_date: JOSELYN.leaseStartDate,
      lease_end_date: JOSELYN.leaseEndDate,
      lease_term: JOSELYN.leaseTerm,
      rent_due_day: JOSELYN.rentDueDay,
      late_fee: "10% of monthly rent after a 5-day grace period",
      utilities: "Tenant pays electric, gas, water/sewer, internet; Landlord pays trash",
      pets_allowed: "No pets without prior written consent",
      parking: "One off-street space included",
      occupants: JOSELYN.tenantName,
      payment_methods: "Zelle, ACH, or check",
    };
    const rendered = renderTemplate(tpl.bodyHtml, variables as any, citations);
    console.log(`Rendered (${rendered.unresolved.length} unresolved): ${rendered.unresolved.join(", ") || "(none)"}`);

    // 5. Insert lease_documents row pointing at new lease
    const [insDoc] = await conn.execute(
      `INSERT INTO lease_documents
        (landlordUserId, leaseAgreementId, source, templateId, templateVersionId,
         renderedHtml, variableValues, status, createdAt, updatedAt)
       VALUES (?, ?, 'template', ?, ?, ?, ?, 'draft', NOW(), NOW())`,
      [
        JOSELYN.landlordUserId,
        newLeaseId,
        tpl.templateId,
        tpl.activeVersionId,
        rendered.html,
        JSON.stringify(variables),
      ],
    );
    const newDocId = (insDoc as any).insertId;
    console.log(`Inserted lease_documents.id=${newDocId}`);

    // 6. Flip lease to `sent`
    await conn.execute(
      "UPDATE lease_agreements SET status = 'sent', sentAt = NOW() WHERE id = ?",
      [newLeaseId],
    );
    console.log(`lease_agreements.id=${newLeaseId} → status=sent`);

    // 7. Email Joselyn the signing link
    const signUrl = `${APP_URL}/tenant/sign-lease/${newLeaseId}`;
    const monthlyRentDollars = (JOSELYN.monthlyRent / 100).toLocaleString("en-US");
    const depositDollars = (JOSELYN.securityDeposit / 100).toLocaleString("en-US");

    const sent = await sendEmail({
      to: JOSELYN.tenantEmail,
      subject: `Your Updated Tennessee Lease Agreement — ${JOSELYN.propertyAddress}`,
      html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
  <div style="background:#1B2B5E;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <h1 style="color:white;margin:0;font-size:22px">Your Updated Lease is Ready</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
    <p>Hi Joselyn,</p>
    <p>I'm sending you an updated version of your Tennessee residential lease for <strong>${JOSELYN.propertyAddress}</strong>. This is the same lease terms we agreed to, but the document itself has been expanded with full Tennessee URLTA disclosures, an early-termination (lease break) section, and standard residential terms in a more comprehensive format.</p>
    <ul style="line-height:1.7">
      <li>Monthly Rent: <strong>$${monthlyRentDollars}</strong></li>
      <li>Security Deposit: <strong>$${depositDollars}</strong></li>
      <li>Lease Start: <strong>${JOSELYN.leaseStartDate}</strong></li>
      <li>Lease End: <strong>${JOSELYN.leaseEndDate}</strong></li>
    </ul>
    <p>Please review and sign at the link below. Your previously executed lease remains on file as the active agreement until this one is fully countersigned.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${signUrl}" style="background:#F5A623;color:#3A2410;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;display:inline-block">Review &amp; Sign Lease</a>
    </p>
    <p style="font-size:12px;color:#6b7280">Or copy this link into your browser:<br/>${signUrl}</p>
    <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0"/>
    <p style="font-size:12px;color:#6b7280">Sent via <strong style="color:#1B2B5E">Leasely</strong> — The AI-Powered Landlord OS</p>
  </div>
</div>`,
    });
    console.log(`Email send result: ${sent}`);
    console.log(`\nDone. Signing URL: ${signUrl}`);
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
