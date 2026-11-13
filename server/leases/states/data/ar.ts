import type { StateLawProfile } from "../types";

const JUST = (path: string) => `https://law.justia.com/codes/arkansas/${path}`;

export const AR: StateLawProfile = {
  code: "AR",
  name: "Arkansas",
  framework:
    "Arkansas Residential Landlord-Tenant Act of 2007, Ark. Code Ann. §§ 18-17-101 et seq., and the security-deposit statute, Ark. Code Ann. §§ 18-16-301 et seq.",

  deposit: {
    maxMonths: 2,
    capRule:
      "A landlord may not demand or receive a security deposit greater than two months' rent. This limit and the deposit-refund rules below do not apply to a landlord who, together with the landlord's spouse and minor children and any entities they own for renting dwelling units, owns five or fewer dwelling units — unless a third party manages the units or collects rent for a fee.",
    capCite: "Ark. Code Ann. §§ 18-16-303, 18-16-304",
    returnDays: 60,
    returnRule:
      "Within 60 days after the tenancy ends, Landlord shall return the deposit, less any amounts applied to accrued unpaid rent and to damages from Tenant's noncompliance with this Lease, all itemized in a written notice delivered to Tenant together with the remaining balance; the balance is due 60 days after the tenancy ends and Tenant delivers possession. Landlord complies by mailing the notice and any payment by first-class mail to Tenant's last known address. If the payment is returned and Landlord cannot locate Tenant after reasonable effort, it becomes Landlord's property 180 days after it was mailed. A landlord who fails to comply is liable to Tenant for twice the amount wrongfully withheld, plus costs and reasonable attorney's fees.",
    returnCite: "Ark. Code Ann. §§ 18-16-305, 18-16-306",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection:
      "At the start of the tenancy Landlord may give Tenant a written form on which to list any defects in the items required by § 18-17-502(a) (hot and cold running water, electricity, potable drinking water, a sanitary sewer system and conforming plumbing, a functioning roof and building envelope, and a functioning heating and air-conditioning system to the extent one served the premises). If Tenant signs the form without noting a defect and takes possession, or fails to return it within two business days, Landlord is deemed to have met those standards at move-in.",
  },

  lateFee: {
    graceDays: null,
    capType: "none",
    capRule: "",
    cite: null,
  },

  notice: {
    monthToMonthDays: 30,
    monthToMonthRule:
      "Either party may terminate a month-to-month tenancy by written notice given to the other at least 30 days before the termination date (at least 7 days for a week-to-week tenancy).",
    monthToMonthCite: "Ark. Code Ann. § 18-17-704",
    nonpaymentDays: 5,
    nonpaymentRule:
      "If rent is unpaid when due and Tenant fails to pay within five days after the due date, Landlord may terminate this Lease; under Arkansas law, nonpayment of rent within five days of the due date is legal notice that Landlord may begin eviction proceedings.",
    nonpaymentCite: "Ark. Code Ann. §§ 18-17-701(b), 18-17-901(b)",
    entryHours: null,
    entryRule:
      "Arkansas sets no statutory entry-notice period. Tenant shall not unreasonably withhold consent to Landlord's entry to inspect the premises, make necessary or agreed repairs or improvements, supply services, investigate possible lease violations or criminal activity, or show the unit to prospective purchasers, lenders, tenants, or contractors. Landlord will give Tenant at least 24 hours' notice before entering, except in an emergency or when Tenant consents at the time of entry.",
    entryCite: "Ark. Code Ann. § 18-17-602",
  },

  earlyTermination: {
    military: {
      label: "Military service (Arkansas Soldiers' and Airmen's Civil Relief Act)",
      cite: "Ark. Code Ann. § 12-62-705",
      eligible:
        "A soldier or airman of the Arkansas National Guard, or the spouse of such a soldier or airman, may terminate and cancel this Lease for the member's or spouse's primary residence if the member is: (1) ordered to active military service of the State of Arkansas for more than 180 continuous days; (2) assigned to a permanent change of duty station more than 50 miles from the primary residence; or (3) discharged or released from active military service after at least 180 continuous days of active duty and under honorable conditions.",
      notice:
        "Tenant delivers Landlord written notice — by mail, courier, or personal delivery accompanied by a written receipt — that states the beginning date (and ending date, if known) of the member's ordered service, the name, address, and telephone number of the member's commanding officer or military superior who can verify the orders, and that Tenant claims the benefits of the Arkansas Soldiers' and Airmen's Civil Relief Act and will terminate this Lease.",
      documentation:
        "The written notice must identify a commanding officer or military superior who may verify the authenticity of the orders.",
      liability:
        "The written notice must be accompanied by payment of the current month's rent and the next month's rent, together with any monthly charges regularly assessed, running through the last day of the month following the month in which the notice is delivered; any prepaid rent, security deposit, or other sums Landlord holds may be deducted from that payment. No other early termination fee applies.",
    },
    domesticViolence: null,
    other: [
      {
        label: "Uninhabitable conditions (implied residential quality standards)",
        cite: "Ark. Code Ann. § 18-17-502(d)",
        eligible:
          "For a lease entered into or renewed after November 1, 2021, if the Property fails to meet the implied residential quality standards — an available source of hot and cold running water, electricity, potable drinking water, a sanitary sewer system and conforming plumbing, a functioning roof and building envelope, or a functioning heating and air-conditioning system to the extent one served the premises when the Lease began — and the failure is not excused (for example, it was not caused by Tenant and Tenant did not refuse Landlord entry to correct it), Tenant may terminate this Lease.",
        notice:
          "Tenant delivers Landlord written notice of the noncompliance by certified mail (or another method allowed by this Lease), specifying the acts and omissions. If Tenant is current on rent and Landlord does not remedy the noncompliance within 30 calendar days after receiving the notice, Tenant may terminate this Lease.",
        documentation: "",
        liability:
          "Tenant's sole remedy is to terminate this Lease without penalty and receive a refund of any security deposit recoverable under § 18-16-301 et seq. Tenant must continue to pay rent during the 30-day cure period and may not withhold or offset rent for the condition. No early termination fee applies.",
      },
    ],
    feeCap: null,
    mitigation: {
      basis: "none",
      cite: null,
      rule:
        "Arkansas does not impose a statutory duty on Landlord to re-rent in order to reduce a departed tenant's liability; nevertheless, if Tenant leaves early, Landlord will credit against what Tenant owes any rent Landlord actually receives from a replacement tenant for the remaining term.",
    },
  },

  disclosures: [],

  fairHousing: {
    stateClasses: [],
    cite: "Ark. Code Ann. § 16-123-310 (Arkansas Fair Housing Act)",
  },

  eviction: {
    rule:
      "Landlord may recover possession only through a court eviction proceeding in the district court under the Arkansas Residential Landlord-Tenant Act (§§ 18-17-901 to 18-17-913) or a civil unlawful-detainer action (§§ 18-60-301 et seq.). Landlord will not remove Tenant, exclude Tenant, or shut off utilities by self-help.",
    cite: "Ark. Code Ann. §§ 18-17-901, 18-17-902",
  },

  habitability: {
    rule:
      "For a lease entered into or renewed after November 1, 2021, Arkansas law implies in every residential lease a requirement that the dwelling have, at delivery of possession and throughout the term, an available source of hot and cold running water, an available source of electricity, a source of potable drinking water, a sanitary sewer system and plumbing conforming to applicable codes, a functioning roof and building envelope, and a functioning heating and air-conditioning system to the extent one served the premises when the Lease began (except when temporarily prevented by an act of God, a public utility failure, or other force majeure). Landlord shall maintain these standards.",
    cite: "Ark. Code Ann. § 18-17-502",
  },

  sources: [
    { cite: "Ark. Code Ann. § 18-16-303", url: JUST("title-18/subtitle-2/chapter-16/subchapter-3/section-18-16-303/") },
    { cite: "Ark. Code Ann. § 18-16-304", url: JUST("title-18/subtitle-2/chapter-16/subchapter-3/section-18-16-304/") },
    { cite: "Ark. Code Ann. § 18-16-305", url: JUST("title-18/subtitle-2/chapter-16/subchapter-3/section-18-16-305/") },
    { cite: "Ark. Code Ann. § 18-16-306", url: JUST("title-18/subtitle-2/chapter-16/subchapter-3/section-18-16-306/") },
    { cite: "Ark. Code Ann. § 18-17-401", url: JUST("title-18/subtitle-2/chapter-17/subchapter-4/section-18-17-401/") },
    { cite: "Ark. Code Ann. § 18-17-502", url: JUST("title-18/subtitle-2/chapter-17/subchapter-5/section-18-17-502/") },
    { cite: "Ark. Code Ann. § 18-17-602", url: JUST("title-18/subtitle-2/chapter-17/subchapter-6/section-18-17-602/") },
    { cite: "Ark. Code Ann. § 18-17-701", url: JUST("title-18/subtitle-2/chapter-17/subchapter-7/section-18-17-701/") },
    { cite: "Ark. Code Ann. § 18-17-704", url: JUST("title-18/subtitle-2/chapter-17/subchapter-7/section-18-17-704/") },
    { cite: "Ark. Code Ann. § 18-17-901", url: JUST("title-18/subtitle-2/chapter-17/subchapter-9/section-18-17-901/") },
    { cite: "Ark. Code Ann. § 12-62-705", url: JUST("title-12/subtitle-4/chapter-62/subchapter-7/section-12-62-705/") },
    { cite: "Ark. Code Ann. § 16-123-310", url: JUST("title-16/subtitle-7/chapter-123/subchapter-3/section-16-123-310/") },
    { cite: "50 U.S.C. § 3955", url: "https://www.law.cornell.edu/uscode/text/50/3955" },
  ],

  reviewNotes: [
    "DEPOSIT EXEMPTION (§ 18-16-303): the two-month cap AND the 60-day refund/itemization rules do not apply to a landlord who (with spouse, minor children, and their renting entities) owns five or fewer dwelling units, unless a third party manages or collects rent for a fee. Many small Keycove landlords will be exempt — the deposit cap and refund timeline then do not bind by statute. The capRule states this; attorney should confirm the lease handles exempt landlords appropriately.",
    "Habitability is new: § 18-17-502 (Act 1052 of 2021) created the first statutory implied residential quality standards in Arkansas, effective for leases entered or renewed after Nov. 1, 2021. Historically Arkansas had no implied warranty of habitability. The tenant's SOLE remedy for an uncorrected violation (if rent is current) is to terminate after 30 days' certified-mail notice; the tenant may not repair-and-deduct or withhold rent (§ 18-17-502(d)(2)–(3)). This is captured as an 'other' early-termination right.",
    "Arkansas has NO domestic-violence lease-termination statute; domesticViolence is null. No state statute giving victims of domestic violence, sexual assault, or stalking a right to terminate a private residential lease was found.",
    "Military termination is the Arkansas Soldiers' and Airmen's Civil Relief Act (§ 12-62-705), which is keyed to Arkansas National Guard STATE active service of more than 180 continuous days (and PCS over 50 miles, or honorable discharge after 180+ days). Federal active-duty servicemembers are covered by the federal SCRA (50 U.S.C. § 3955), handled by the generator. The member pays through the end of the month following notice (current plus next month's rent).",
    "No statutory duty to mitigate: Arkansas follows the traditional rule and does not require a residential landlord to re-let to reduce a departed tenant's liability. mitigation.basis is 'none'; the lease nonetheless commits Landlord to credit any rent actually received from a replacement tenant (a tenant-favorable contractual term). Attorney to confirm.",
    "Arkansas also retains a criminal 'failure to vacate' statute (§ 18-16-101) under which a holdover tenant can face criminal prosecution after a 10-day notice — a notorious and contested Arkansas feature. The lease relies only on the civil eviction/unlawful-detainer process and does not invoke the criminal statute; flag for attorney awareness.",
    "No statutory landlord entry-notice period (§ 18-17-602 only bars the tenant from unreasonably refusing access); the 24-hour courtesy notice is contractual. No statutory late-fee cap. No statutory deposit escrow/separate-account or bank-disclosure requirement.",
    "Fair housing: the Arkansas Fair Housing Act (§ 16-123-310) tracks the federal seven (race, color, religion, sex, familial status, national origin, and disability via §§ 16-123-314/315); no classes beyond federal law. Some Arkansas municipalities add sexual orientation/gender identity locally.",
  ],

  confidence: "high",
  researchedOn: "2026-11-08",
};
