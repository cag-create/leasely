import LegalLayout, { LegalSection } from "@/components/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" effectiveDate="April 25, 2026">
      <p>
        These Terms of Service ("Terms") govern your access to and use of the Keycove platform, marketing site, and related services (the "Services") provided by Keycove, Inc. ("Keycove," "we," "us"). By creating an account, listing a property, submitting an application, signing a lease, or otherwise using the Services, you agree to these Terms.
      </p>
      <p>If you are using the Services on behalf of a business or other entity, you represent that you have authority to bind that entity to these Terms.</p>

      <LegalSection title="1. Eligibility">
        <p>You must be at least 18 years old and legally capable of entering into a binding contract. If you are listing or managing rental property, you represent that you have the legal right to do so.</p>
      </LegalSection>

      <LegalSection title="2. Accounts">
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized access at <a href="mailto:support@leasely.net" className="text-[#4F46E5] hover:underline">support@leasely.net</a>. Sharing accounts is prohibited.</p>
      </LegalSection>

      <LegalSection title="3. Subscription, Setup Fee, and Payments">
        <p><strong className="text-white">Pro plan:</strong> $29.00 per month, recurring, plus a one-time $75.00 setup fee charged at signup. Subscriptions renew automatically each month until cancelled. You may cancel anytime; cancellations take effect at the end of the current billing cycle. Setup fees are non-refundable.</p>
        <p><strong className="text-white">Free plan:</strong> Limited features available without subscription.</p>
        <p><strong className="text-white">Payments:</strong> All payments are processed by Stripe. By providing payment information, you authorize us and Stripe to charge the applicable fees and taxes.</p>
        <p><strong className="text-white">Refunds:</strong> We do not provide refunds for partial months or unused features unless required by law.</p>
      </LegalSection>

      <LegalSection title="4. Affiliate Program">
        <p>Approved affiliates earn a one-time $50.00 bonus per landlord who signs up using their unique affiliate code and pays their first full month plus the setup fee. Bonuses are not recurring. Payouts require a valid W-9 on file. Earnings of $600 or more per calendar year may be reported on IRS Form 1099-NEC. Keycove may suspend or terminate affiliate accounts for fraud, self-referral, spam, or violation of these Terms.</p>
      </LegalSection>

      <LegalSection title="5. Listings, Applications, and Leases">
        <p><strong className="text-white">Landlord obligations:</strong> You are responsible for the accuracy of listings, application screening criteria, and lease terms. You must comply with all applicable federal, state, and local landlord-tenant laws, including the Fair Housing Act and equivalent state laws. See our <a href="/legal/fair-housing" className="text-[#4F46E5] hover:underline">Fair Housing Statement</a>.</p>
        <p><strong className="text-white">Tenant obligations:</strong> You are responsible for the accuracy of application information you submit and the lease commitments you sign through the Services. Electronic signatures captured through the Services have the same legal effect as a handwritten signature under the U.S. ESIGN Act and UETA.</p>
        <p><strong className="text-white">Keycove's role:</strong> Keycove provides software tools. Keycove is not a party to any lease, application, or transaction between landlords, tenants, vendors, or other users; is not a real estate broker, property manager, lender, or attorney; and does not provide legal, tax, or financial advice.</p>
      </LegalSection>

      <LegalSection title="6. Acceptable Use">
        <p>You agree not to: (a) violate any law or third-party right; (b) post discriminatory, harassing, fraudulent, or misleading content; (c) attempt to access accounts or data not belonging to you; (d) probe, scan, or test the vulnerability of any system without authorization; (e) interfere with the integrity or performance of the Services; (f) use the Services to send spam or unsolicited communications; (g) reverse engineer, decompile, or scrape the Services except as expressly permitted; (h) misuse AI features or attempt to extract proprietary prompts or model behavior.</p>
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <p>Keycove and its licensors own all right, title, and interest in the Services, including all software, design, branding, and content (excluding User Content). We grant you a limited, non-exclusive, non-transferable, revocable license to use the Services solely as permitted by these Terms.</p>
        <p><strong className="text-white">Your Content:</strong> You retain ownership of content you submit (listings, photos, lease text, etc.). You grant Keycove a worldwide, non-exclusive, royalty-free license to host, display, and distribute your content as necessary to operate the Services.</p>
      </LegalSection>

      <LegalSection title="8. Third-Party Services">
        <p>The Services integrate with third-party services (Stripe, Brevo, Cloudinary, Twilio, OpenAI/Anthropic, mapping providers, etc.). Your use of those services is governed by the applicable third-party terms. Keycove is not responsible for third-party services.</p>
      </LegalSection>

      <LegalSection title="9. Disclaimers">
        <p className="uppercase text-xs text-white/50 tracking-wide">The Services are provided "as is" and "as available" without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, non-infringement, or quiet enjoyment. Keycove does not guarantee that listings will be filled, applications will be approved, payments will succeed, or that the Services will be uninterrupted or error-free.</p>
      </LegalSection>

      <LegalSection title="10. Limitation of Liability">
        <p className="uppercase text-xs text-white/50 tracking-wide">To the maximum extent permitted by law, Keycove's total liability for any claim arising out of or related to the Services shall not exceed the greater of (a) the amount you paid Keycove in the twelve months preceding the claim or (b) one hundred U.S. dollars ($100). In no event shall Keycove be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, including lost profits, lost data, or business interruption.</p>
      </LegalSection>

      <LegalSection title="11. Indemnification">
        <p>You agree to defend, indemnify, and hold harmless Keycove and its officers, directors, employees, and agents from and against any claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from (a) your use of the Services, (b) your violation of these Terms or applicable law, (c) your User Content, or (d) any dispute between you and another user.</p>
      </LegalSection>

      <LegalSection title="12. Termination">
        <p>We may suspend or terminate your access to the Services at any time for violation of these Terms, suspected fraud, non-payment, or any other reason at our sole discretion. You may close your account at any time by contacting support. Provisions that by their nature should survive termination shall survive.</p>
      </LegalSection>

      <LegalSection title="13. Dispute Resolution; Arbitration; Class Waiver">
        <p>Most concerns can be resolved by emailing <a href="mailto:support@leasely.net" className="text-[#4F46E5] hover:underline">support@leasely.net</a>. Any dispute arising out of or relating to these Terms or the Services shall be resolved by binding individual arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules, in the state where Keycove maintains its principal place of business, except that either party may bring claims in small-claims court. <strong className="text-white uppercase tracking-wide">You and Keycove waive the right to participate in a class action or class arbitration.</strong> You may opt out of arbitration within 30 days of accepting these Terms by emailing the support address with the subject "Arbitration Opt-Out."</p>
      </LegalSection>

      <LegalSection title="14. Governing Law">
        <p>These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law principles. The U.N. Convention on Contracts for the International Sale of Goods does not apply.</p>
      </LegalSection>

      <LegalSection title="15. Changes to These Terms">
        <p>We may modify these Terms from time to time. Material changes will be communicated by posting the updated Terms with a new effective date and, where appropriate, by email or in-product notice. Continued use of the Services after the effective date constitutes acceptance.</p>
      </LegalSection>

      <LegalSection title="16. Contact">
        <p>Keycove, Inc. — <a href="mailto:support@leasely.net" className="text-[#4F46E5] hover:underline">support@leasely.net</a></p>
      </LegalSection>
    </LegalLayout>
  );
}
