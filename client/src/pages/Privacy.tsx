import LegalLayout, { LegalSection } from "@/components/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="April 25, 2026">
      <p>
        This Privacy Policy explains how Leasely LLC (dba Keycove) ("Keycove," "we," "us," or "our") collects, uses, shares, and protects information when you use our property management platform, marketing website, mobile experiences, and related services (collectively, the "Services").
      </p>
      <p>
        By using the Services, you agree to the practices described here. If you do not agree, please do not use the Services.
      </p>

      <LegalSection title="1. Information We Collect">
        <p><strong className="text-white">Information you provide:</strong> account details (name, email, password), property and listing data, lease details, rental application information (name, contact info, employment, income, prior addresses, references, date of birth), payment and payout details, support communications, and identity verification documents (such as W-9 for affiliates).</p>
        <p><strong className="text-white">Information collected automatically:</strong> log data (IP address, browser/device type, referring URLs, pages viewed, timestamps), cookies and similar technologies, performance and error data, and usage analytics.</p>
        <p><strong className="text-white">Information from third parties:</strong> payment processors (Stripe), email delivery providers, file storage providers, and integrations you authorize.</p>
        <p><strong className="text-white">Sensitive financial information:</strong> Keycove does not store full credit card or bank account numbers. All payment credentials are tokenized and held by our payment processor (Stripe).</p>
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Provide, operate, secure, and improve the Services</li>
          <li>Authenticate users and manage accounts</li>
          <li>Process payments, payouts, and affiliate commissions</li>
          <li>Send transactional emails (lease delivery, payment receipts, work-order updates, security alerts)</li>
          <li>Detect, prevent, and respond to fraud, abuse, and security incidents</li>
          <li>Comply with legal obligations, including tax reporting (e.g., 1099-NEC for affiliates earning $2,000+/year)</li>
          <li>Respond to support requests</li>
          <li>With your consent, send product updates and marketing communications (you can opt out at any time)</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Legal Bases for Processing (EEA / UK)">
        <p>Where applicable, we process personal data under the legal bases of contract performance, legitimate interests (such as security and product improvement), legal obligation, and consent.</p>
      </LegalSection>

      <LegalSection title="4. How We Share Information">
        <p>We do not sell personal information. We share information only as described:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li><strong className="text-white">Service providers:</strong> hosting (Railway), database, email (Brevo), payments (Stripe), file storage (Cloudinary), analytics, and AI providers — under contractual confidentiality and data-protection obligations.</li>
          <li><strong className="text-white">Other users you interact with:</strong> when a tenant submits an application, signs a lease, or pays rent, the relevant landlord receives that information; vendors and contractors receive information needed to complete a work order.</li>
          <li><strong className="text-white">Legal and safety:</strong> when required by subpoena, court order, or to protect rights, safety, or property.</li>
          <li><strong className="text-white">Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, with notice to affected users.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p>We retain personal information for as long as your account is active or as needed to provide the Services, comply with legal obligations (such as tax and accounting requirements, generally up to 7 years), resolve disputes, and enforce our agreements. You may request deletion of your account at any time, subject to retention required by law.</p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>We protect your information using industry-standard measures, including PBKDF2 password hashing with high iteration counts, HTTPS-only transport, HTTP-only secure cookies, signed Stripe webhook verification, helmet-based HTTP security headers, IP-based rate limiting on authentication endpoints, and least-privilege access controls. No system is perfectly secure; you are responsible for safeguarding your password.</p>
      </LegalSection>

      <LegalSection title="7. Your Rights">
        <p>Depending on your location, you may have the right to access, correct, port, or delete your personal information, restrict or object to certain processing, and withdraw consent. California residents have additional rights described in our <a href="/legal/ccpa" className="text-[#4F46E5] hover:underline">CCPA Notice</a>. EEA / UK residents have rights under GDPR and UK GDPR. To exercise rights, email <a href="mailto:support@keycove.net" className="text-[#4F46E5] hover:underline">support@keycove.net</a>.</p>
      </LegalSection>

      <LegalSection title="8. Children's Privacy">
        <p>The Services are not directed to children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us information, contact us and we will delete it.</p>
      </LegalSection>

      <LegalSection title="9. International Transfers">
        <p>We may process data in the United States and other countries. Where required, we use appropriate safeguards (such as Standard Contractual Clauses) for cross-border transfers.</p>
      </LegalSection>

      <LegalSection title="10. Cookies">
        <p>See our <a href="/legal/cookies" className="text-[#4F46E5] hover:underline">Cookie Policy</a> for details on the cookies and similar technologies we use, and how to control them.</p>
      </LegalSection>

      <LegalSection title="11. Changes to This Policy">
        <p>We may update this Policy from time to time. Material changes will be communicated by posting the updated Policy with a new effective date and, where appropriate, by email.</p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>Leasely LLC (dba Keycove) — Privacy contact: <a href="mailto:support@keycove.net" className="text-[#4F46E5] hover:underline">support@keycove.net</a></p>
      </LegalSection>
    </LegalLayout>
  );
}
