import LegalLayout, { LegalSection } from "@/components/LegalLayout";

export default function Cookies() {
  return (
    <LegalLayout title="Cookie Policy" effectiveDate="April 25, 2026">
      <p>
        This Cookie Policy explains how Leasely LLC (dba Keycove) uses cookies and similar tracking technologies on our website and platform. It supplements our <a href="/legal/privacy" className="text-[#4F46E5] hover:underline">Privacy Policy</a>.
      </p>

      <LegalSection title="What Are Cookies?">
        <p>Cookies are small text files placed on your device when you visit a website. Similar technologies include local storage, session storage, pixels, and SDKs. They allow websites to remember your actions and preferences (such as login state) over time.</p>
      </LegalSection>

      <LegalSection title="Categories of Cookies We Use">
        <p><strong className="text-white">Strictly necessary cookies</strong> — required for the Services to function (authentication session cookie, CSRF protection, load balancing). These cannot be disabled and do not require consent.</p>
        <p><strong className="text-white">Functional cookies</strong> — remember preferences such as theme (dark/light mode), saved listings, and onboarding state.</p>
        <p><strong className="text-white">Analytics cookies</strong> — help us understand how the Services are used so we can improve performance and reliability. Aggregated and pseudonymous.</p>
        <p><strong className="text-white">Marketing / advertising cookies</strong> — Keycove does not currently use third-party advertising cookies for cross-context behavioral advertising. If this changes, we will update this Policy and obtain consent where required.</p>
      </LegalSection>

      <LegalSection title="Specific Cookies & Storage">
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li><strong className="text-white">leasely_session</strong> — Strictly necessary. Stores your signed authentication token. HttpOnly, Secure, SameSite=None. Expires after the configured session lifetime.</li>
          <li><strong className="text-white">tenant_session</strong> — Strictly necessary. Used by tenant portal magic-link access.</li>
          <li><strong className="text-white">theme</strong> — Functional. Stored in localStorage. Remembers your light/dark theme preference.</li>
          <li><strong className="text-white">leasely_cookie_consent</strong> — Functional. Records your cookie banner choice so we don't show it again.</li>
          <li><strong className="text-white">stripe.*</strong> — Strictly necessary, set by Stripe to enable secure checkout and fraud prevention.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Managing Cookies">
        <p>You can control cookies through your browser settings (block, delete, or be alerted before cookies are stored). Note that disabling strictly necessary cookies may break authentication and other core features.</p>
        <p>You may also use a <strong className="text-white">Global Privacy Control (GPC)</strong> signal; we honor a valid GPC signal as a request to opt out of any sale or sharing of personal information (we currently do neither, but will respect the signal regardless).</p>
        <p>You can change your consent at any time by clearing the <code className="text-white/90 bg-white/8 px-1.5 py-0.5 rounded">leasely_cookie_consent</code> entry from your browser storage; the consent banner will reappear on your next visit.</p>
      </LegalSection>

      <LegalSection title="Do Not Track">
        <p>Because there is no industry-standard interpretation of Do Not Track signals, Keycove does not currently respond to DNT signals. We do honor the Global Privacy Control signal as described above.</p>
      </LegalSection>

      <LegalSection title="Updates">
        <p>We may update this Cookie Policy periodically. The effective date at the top reflects the most recent revision.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p><a href="mailto:support@keycove.net" className="text-[#4F46E5] hover:underline">support@keycove.net</a></p>
      </LegalSection>
    </LegalLayout>
  );
}
