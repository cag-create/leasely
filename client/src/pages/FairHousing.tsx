import LegalLayout, { LegalSection } from "@/components/LegalLayout";

export default function FairHousing() {
  return (
    <LegalLayout title="Fair Housing & Equal Opportunity Statement" effectiveDate="April 25, 2026">
      <p>
        Leasely is committed to the letter and spirit of U.S. policy for the achievement of equal housing opportunity throughout the nation. We support the principles and requirements of the Federal Fair Housing Act of 1968 (as amended), the Equal Credit Opportunity Act, the Americans with Disabilities Act, and applicable state and local fair-housing laws.
      </p>

      <LegalSection title="Protected Classes">
        <p>Federal law prohibits discrimination in the sale, rental, financing, or advertising of housing because of:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Race</li>
          <li>Color</li>
          <li>National origin</li>
          <li>Religion</li>
          <li>Sex (including gender identity and sexual orientation)</li>
          <li>Familial status (including children under 18 living with parents or legal custodians, pregnant women, or persons securing custody)</li>
          <li>Disability</li>
        </ul>
        <p>Many state and local laws extend protection to additional categories such as age, marital status, source of income (including housing vouchers), military or veteran status, ancestry, citizenship or immigration status, and others. Landlords using Leasely must comply with all applicable federal, state, and local laws.</p>
      </LegalSection>

      <LegalSection title="Landlord Responsibilities">
        <p>Landlords, property managers, and listing agents using Leasely:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Must apply consistent, written, lawful screening criteria to every applicant.</li>
          <li>Must not include discriminatory language, preferences, or limitations in listings, advertisements, applications, or communications.</li>
          <li>Must provide reasonable accommodations and modifications for applicants and tenants with disabilities, as required by law.</li>
          <li>Must comply with the Fair Credit Reporting Act (FCRA) when ordering and using consumer reports for tenant screening, including providing required adverse-action notices when an application is denied or terms are changed based on a report.</li>
          <li>Must comply with state-specific limits on application fees, security deposits, late fees, and notice periods.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Tenant Rights">
        <p>If you believe you have experienced housing discrimination, you may file a complaint with the U.S. Department of Housing and Urban Development (HUD) at <a href="https://www.hud.gov" target="_blank" rel="noopener noreferrer" className="text-[#00C896] hover:underline">www.hud.gov</a> or call 1-800-669-9777 (TTY 1-800-927-9275). You may also contact your state or local fair-housing agency. Filing a fair-housing complaint is free.</p>
      </LegalSection>

      <LegalSection title="Reporting Discrimination on Leasely">
        <p>If you believe a Leasely listing, application process, or user violates fair-housing law, please report it to <a href="mailto:support@leasely.net" className="text-[#00C896] hover:underline">support@leasely.net</a>. We review every report and may remove non-compliant content and suspend offending accounts.</p>
      </LegalSection>

      <LegalSection title="Equal Housing Opportunity">
        <p className="text-white/60 text-sm">Leasely is an equal-housing-opportunity platform. We do not endorse, encourage, or condone discrimination. All housing opportunities listed on Leasely are available on an equal-opportunity basis.</p>
      </LegalSection>
    </LegalLayout>
  );
}
