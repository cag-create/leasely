import LegalLayout, { LegalSection } from "@/components/LegalLayout";

export default function CCPA() {
  return (
    <LegalLayout title="Your California Privacy Rights (CCPA / CPRA)" effectiveDate="April 25, 2026">
      <p>
        This notice supplements our <a href="/legal/privacy" className="text-[#4F46E5] hover:underline">Privacy Policy</a> and applies to California residents under the California Consumer Privacy Act of 2018, as amended by the California Privacy Rights Act ("CCPA/CPRA"). It also describes how Keycove responds to similar rights granted by Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Utah (UCPA), and Texas (TDPSA), among other U.S. state privacy laws.
      </p>

      <LegalSection title="1. Categories of Personal Information We Collect">
        <p>In the past 12 months we have collected the following categories of personal information:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li><strong className="text-white">Identifiers</strong> (name, email, phone, IP address, account ID)</li>
          <li><strong className="text-white">Customer records</strong> (billing/contact info, payment-card last 4 digits, mailing address)</li>
          <li><strong className="text-white">Commercial information</strong> (subscription history, transactions)</li>
          <li><strong className="text-white">Internet activity</strong> (log data, device information, page views, referrers)</li>
          <li><strong className="text-white">Geolocation data</strong> (approximate, derived from IP)</li>
          <li><strong className="text-white">Professional/employment information</strong> (when included in a rental application)</li>
          <li><strong className="text-white">Inferences</strong> drawn to operate and improve the Services</li>
          <li><strong className="text-white">Sensitive personal information</strong> may include date of birth and government-issued tax identification (W-9) for affiliate payouts; we use sensitive information only for the purposes for which it was provided</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Sources">
        <p>Information is collected directly from you, automatically as you use the Services, and from service providers (payment processors, email delivery, analytics, file storage, AI providers).</p>
      </LegalSection>

      <LegalSection title="3. Purposes of Use">
        <p>To provide, secure, and improve the Services; process payments; communicate transactional information; comply with legal obligations; detect and prevent fraud; and (with consent) send marketing.</p>
      </LegalSection>

      <LegalSection title='4. "Sale" and "Sharing" of Personal Information'>
        <p><strong className="text-white">Keycove does not sell personal information for monetary consideration.</strong> Keycove does not "share" personal information for cross-context behavioral advertising as defined by the CPRA. We disclose information only to service providers and contractors under written contracts that restrict their use of the data.</p>
      </LegalSection>

      <LegalSection title="5. Your Rights">
        <p>California residents (and residents of other U.S. states with comprehensive privacy laws) have the right to:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li><strong className="text-white">Know / Access:</strong> Request the categories and specific pieces of personal information we have collected, used, disclosed, and (if applicable) sold or shared.</li>
          <li><strong className="text-white">Delete:</strong> Request deletion of personal information we hold, subject to legal exceptions (e.g., tax/accounting retention).</li>
          <li><strong className="text-white">Correct:</strong> Request correction of inaccurate personal information.</li>
          <li><strong className="text-white">Portability:</strong> Receive a copy of your personal information in a portable format.</li>
          <li><strong className="text-white">Opt out of Sale or Sharing:</strong> Although we do not sell or share for cross-context behavioral advertising, you may submit a request to confirm.</li>
          <li><strong className="text-white">Limit use of sensitive personal information:</strong> Direct us to limit use to what is necessary to perform services.</li>
          <li><strong className="text-white">Non-discrimination:</strong> We will not deny services, charge different prices, or provide a different level of service because you exercised a privacy right.</li>
          <li><strong className="text-white">Authorized agent:</strong> You may designate an authorized agent to make a request on your behalf.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. How to Exercise Your Rights">
        <p>Email <a href="mailto:support@keycove.net" className="text-[#4F46E5] hover:underline">support@keycove.net</a> with the subject "Privacy Rights Request" and include the right(s) you wish to exercise, the email associated with your account, and your state of residence. We will verify your identity (typically by confirming control of the registered email and/or matching account details) before responding. We will respond within 45 days, with one 45-day extension where reasonably necessary.</p>
        <p>You may also send a <strong className="text-white">Global Privacy Control (GPC)</strong> signal from your browser; we will treat a valid GPC signal as a request to opt out of any sale or sharing.</p>
      </LegalSection>

      <LegalSection title="7. Retention">
        <p>We retain personal information for as long as needed to provide the Services and to comply with legal, tax, accounting, and audit obligations (generally up to seven years for financial records).</p>
      </LegalSection>

      <LegalSection title="8. Shine the Light">
        <p>California Civil Code § 1798.83 permits California residents to request information regarding the disclosure of personal information to third parties for direct-marketing purposes. We do not disclose personal information to third parties for their own direct-marketing purposes.</p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>For privacy questions or to submit a rights request: <a href="mailto:support@keycove.net" className="text-[#4F46E5] hover:underline">support@keycove.net</a></p>
      </LegalSection>
    </LegalLayout>
  );
}
