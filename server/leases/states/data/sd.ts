import type { StateLawProfile } from "../types";

const SDCL = (s: string) => `https://sdlegislature.gov/Statutes/${s}`;

export const SD: StateLawProfile = {
  code: "SD",
  name: "South Dakota",
  framework:
    "South Dakota Codified Laws ch. 43-32 (Lease of Real Property), with eviction under SDCL ch. 21-16 (Forcible Entry and Detainer)",

  deposit: {
    maxMonths: 1,
    capRule:
      "The security deposit may not exceed one month's rent, except that Landlord and Tenant may agree to a larger deposit where special conditions pose a danger to maintenance of the Property.",
    capCite: "SDCL 43-32-6.1",
    returnDays: 21,
    returnRule:
      "Within 21 days after the tenancy ends and Landlord receives Tenant's mailing address or delivery instructions, Landlord will return the security deposit or give Tenant a written statement showing the specific reason for withholding all or part of it. Landlord may withhold only the amounts reasonably necessary to remedy Tenant's defaults in paying rent and other funds due to Landlord under an agreement, and to restore the Property to its condition at the start of the tenancy, ordinary wear and tear excepted. On Tenant's request, Landlord will provide an itemized accounting of any amount withheld within 45 days after the tenancy ends.",
    returnCite: "SDCL 43-32-24",
    holdingRule: "",
    holdingCite: null,
    interestRequired: false,
    moveInInspection: "",
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
      "Either Landlord or Tenant may end a month-to-month tenancy by giving the other notice at least one month before the end of a monthly rental period. Landlord may change the terms of a month-to-month tenancy by written notice served at least 30 days before the end of the month, effective at the end of that month; Tenant may then terminate effective the first day of the next month by giving Landlord notice of termination within 15 days after receiving the change notice.",
    monthToMonthCite: "SDCL 43-32-13, 43-32-15",
    nonpaymentDays: null,
    nonpaymentRule:
      "If Tenant fails to pay rent for three days after it is due, Landlord may bring a forcible entry and detainer action. South Dakota law no longer requires a separate written notice to quit before that action is filed.",
    nonpaymentCite: "SDCL 21-16-1(4); SL 2024, ch 75 (repealing SDCL 21-16-2)",
    entryHours: 24,
    entryRule:
      "Except in an emergency or when it is impracticable, Landlord will give Tenant at least 24 hours' written notice of Landlord's intent to enter and will enter only at reasonable times. The notice will state the date or dates of entry, a period of time during normal business hours for entry, the purpose of the entry, and a way for Tenant to request to reschedule.",
    entryCite: "SDCL 43-32-32",
  },

  earlyTermination: {
    military: {
      label: "National Guard active duty (South Dakota law)",
      cite: "SDCL 33A-2-9; 50 U.S.C. § 3955",
      eligible:
        "A South Dakota resident who is a member of any state's National Guard and is ordered to active duty service by the Governor of that state or by the President of the United States has the same protections, including lease termination rights, that the federal Servicemembers Civil Relief Act gives to persons serving on federal active duty.",
      notice:
        "Tenant gives Landlord written notice of termination. If rent is payable monthly, termination is effective 30 days after the first date on which the next rental payment is due after the notice is delivered; otherwise, termination is effective on the last day of the month following the month in which the notice is delivered.",
      documentation: "The notice must include a copy of the military orders.",
      liability:
        "Tenant owes rent only through the effective date of termination. Landlord will refund rent paid in advance for any period after that date within 30 days after the effective date, and Landlord will not charge an early termination fee.",
    },

    domesticViolence: {
      label: "Domestic abuse, unlawful sexual behavior, or stalking",
      cite: "SDCL 43-32-19(3), 43-32-19.1, 43-32-19.2",
      eligible:
        "Tenant may terminate this Lease if Tenant or a member of Tenant's household is the victim of alleged domestic abuse, unlawful sexual behavior, or stalking.",
      notice:
        "Tenant must notify Landlord in writing that the termination is due to Tenant's fear of imminent danger or injury to Tenant or a member of Tenant's household. Tenant may then terminate this Lease and vacate the Property on or before the date specified in the notice.",
      documentation:
        "Tenant must attach to the notice one of the following: a police report regarding an alleged incident of domestic abuse, unlawful sexual behavior, or stalking, signed during the 30 days immediately before the date of the notice; a protection order issued during the 30 days immediately before the date of the notice in response to such an incident; or documentation signed by a licensed health care provider stating that, during the 30 days immediately before the date of the notice, the provider examined Tenant or the household member within the provider's scope of practice and, as a result, has reasonable cause to believe that person was a victim of alleged domestic abuse, unlawful sexual behavior, or stalking. If Tenant gives Landlord a forwarding address or other contact information, Landlord will not disclose it to anyone except with Tenant's consent or as required by law.",
      liability:
        "Tenant may terminate without penalty and is not liable for any otherwise applicable early termination fee or for the rent for the month following the month in which Tenant vacates the Property.",
    },

    other: [
      {
        label: "Landlord's failure to repair or to secure quiet possession",
        cite: "SDCL 43-32-19(1)",
        eligible:
          "Tenant may terminate this Lease before the end of the term if Landlord does not, within a reasonable time after Tenant's written request, fulfill Landlord's obligations to place and secure Tenant in quiet possession of the Property, to put the Property into good condition, or to repair it.",
        notice: "Tenant may terminate after Landlord fails to act within a reasonable time after Tenant's written request.",
        documentation: "",
        liability: "Tenant is not liable for rent for any period after this Lease terminates.",
      },
      {
        label: "Failure to make the Property fit for habitation",
        cite: "SDCL 43-32-9",
        eligible:
          "If, within a reasonable time after notice to Landlord of conditions requiring repair to make the Property fit for human habitation and in good and safe working order, Landlord neglects to make repairs Landlord ought to make, Tenant may vacate the Property.",
        notice: "Tenant may vacate after Landlord fails to repair within a reasonable time after notice.",
        documentation: "",
        liability: "If Tenant vacates, Tenant is discharged from further rent and from performance of other conditions of this Lease.",
      },
      {
        label: "Destruction of the Property",
        cite: "SDCL 43-32-19(2)",
        eligible:
          "Tenant may terminate this Lease before the end of the term if the greater part of the Property, or the part that Landlord had reason to believe was the material inducement for Tenant to enter into this Lease, is destroyed from any cause other than Tenant's ordinary negligence.",
        notice: "Tenant may terminate upon the destruction.",
        documentation: "",
        liability: "Tenant is not liable for rent for any period after this Lease terminates.",
      },
      {
        label: "Unlawful exclusion or utility interruption",
        cite: "SDCL 43-32-6",
        eligible:
          "If Landlord unlawfully removes or excludes Tenant from the Property, or willfully diminishes services by interrupting or causing the interruption of electric, gas, water, or other essential service, Tenant may terminate this Lease.",
        notice: "Tenant may elect to terminate this Lease upon Landlord's violation.",
        documentation: "",
        liability:
          "Tenant may recover from Landlord damages equal to two months' rent and the return of any advance rent and deposit paid to Landlord.",
      },
    ],

    feeCap: null,

    mitigation: {
      basis: "unclear",
      cite: null,
      rule:
        "If Tenant leaves before the end of the term, Landlord will credit against Tenant's liability any rent Landlord receives from a replacement tenant for the remainder of the term.",
    },
  },

  disclosures: [
    {
      id: "methamphetamine",
      title: "Prior methamphetamine manufacturing",
      text:
        "Landlord discloses that Landlord has actual knowledge that methamphetamine was previously manufactured on the Property.",
      cite: "SDCL 43-32-30",
      condition:
        "Only if Landlord has actual knowledge of prior methamphetamine manufacturing on the premises; for a building with two or more units, only for the unit where the manufacturing occurred",
    },
  ],

  fairHousing: {
    stateClasses: ["creed", "ancestry"],
    cite: "SDCL 20-13-20, 20-13-20.1 (South Dakota Human Relations Act)",
  },

  eviction: {
    rule:
      "Landlord may recover possession of the Property only through a forcible entry and detainer action in circuit court or magistrate court under SDCL chapter 21-16. Landlord will not remove or exclude Tenant from the Property or willfully interrupt electric, gas, water, or other essential services to Tenant.",
    cite: "SDCL 21-16-1, 21-16-3, 21-16-6, 21-16-7; SDCL 43-32-6",
  },

  habitability: {
    rule:
      "Landlord will keep the Property and all common areas in reasonable repair and fit for human habitation and in good and safe working order during the term, and will maintain in good and safe working order all electrical, plumbing, and heating systems, except when the disrepair has been caused by the negligent, willful, or malicious conduct of Tenant or a person under Tenant's direction or control. These duties cannot be waived or modified, although Landlord and Tenant may agree that Tenant will perform specified repairs or maintenance in lieu of rent.",
    cite: "SDCL 43-32-8",
  },

  sources: [
    { cite: "SDCL 43-32-1 through 43-32-37 (chapter text)", url: "https://sdlegislature.gov/api/Statutes/43-32.html?all=true" },
    { cite: "SDCL 43-32-6", url: SDCL("43-32-6") },
    { cite: "SDCL 43-32-6.1", url: SDCL("43-32-6.1") },
    { cite: "SDCL 43-32-8", url: SDCL("43-32-8") },
    { cite: "SDCL 43-32-9", url: SDCL("43-32-9") },
    { cite: "SDCL 43-32-13", url: SDCL("43-32-13") },
    { cite: "SDCL 43-32-15", url: SDCL("43-32-15") },
    { cite: "SDCL 43-32-18.1", url: SDCL("43-32-18.1") },
    { cite: "SDCL 43-32-19", url: SDCL("43-32-19") },
    { cite: "SDCL 43-32-19.1", url: SDCL("43-32-19.1") },
    { cite: "SDCL 43-32-19.2", url: SDCL("43-32-19.2") },
    { cite: "SDCL 43-32-23", url: SDCL("43-32-23") },
    { cite: "SDCL 43-32-24", url: SDCL("43-32-24") },
    { cite: "SDCL 43-32-25, 43-32-26", url: SDCL("43-32-25") },
    { cite: "SDCL 43-32-27, 43-32-28", url: SDCL("43-32-27") },
    { cite: "SDCL 43-32-30", url: SDCL("43-32-30") },
    { cite: "SDCL 43-32-32", url: SDCL("43-32-32") },
    { cite: "SDCL 43-32-33 through 43-32-36", url: SDCL("43-32-34") },
    { cite: "SDCL ch. 21-16 (21-16-1, 21-16-2 repealed, 21-16-3, 21-16-6, 21-16-7)", url: "https://sdlegislature.gov/api/Statutes/21-16.html?all=true" },
    { cite: "SL 2024, ch 75 (SB 90)", url: "https://mylrc.sdlegislature.gov/api/Documents/SessionLaw/266745.html?Year=2024" },
    { cite: "SDCL 33A-2-9", url: SDCL("33A-2-9") },
    { cite: "SDCL 20-13-1, 20-13-20, 20-13-20.1, 20-13-21", url: "https://sdlegislature.gov/api/Statutes/20-13.html?all=true" },
  ],

  reviewNotes: [
    "NOTICE TO QUIT REPEALED: SL 2024, ch 75 (SB 90) repealed SDCL 21-16-2, which required three days' written notice to quit before a forcible entry and detainer action for nonpayment or holdover. Under SDCL 21-16-1(4) the action is maintainable once rent is unpaid three days after it is due. nonpaymentDays is null. The builder may still want a contractual pre-filing notice as a best practice; attorney to decide. Service of summons now requires two attempts at least one week apart (21-16-6), and the answer period is five days (21-16-7).",
    "DEPOSIT DEADLINE CHANGED IN 2026: The current codified SDCL 43-32-24 (as amended by SL 2026, ch 179) gives 21 days after termination and receipt of the tenant's mailing address or delivery instructions; the itemized accounting on request remains within 45 days. The effective date of the 2026 amendment was not separately verified (presumably July 1, 2026). Non-compliance forfeits all right to withhold; bad faith adds punitive damages up to $200.",
    "DOMESTIC VIOLENCE: SDCL 43-32-19.1 relieves the tenant of the early termination fee and of 'the rent applicable to the month following that in which the tenant vacates.' The statute does not expressly address rent for later months or the month of vacating; read literally, the tenant may owe rent through the end of the month of vacating. The lease liability text tracks the statute literally. Co-tenant release is not addressed. Documentation must be dated within 30 days before the notice. SDCL 43-32-18.1 bars any lease term authorizing eviction of a tenant who calls police or emergency responders about domestic abuse, unlawful sexual behavior, or stalking, and bars eviction solely because a tenant or household member is a victim; the generator must not include a 'calls to police' nuisance clause.",
    "MILITARY: SDCL 33A-2-9 extends SCRA protections to South Dakota residents in any state's National Guard ordered to active duty by a Governor or the President. It incorporates SCRA 'as amended to January 1, 2007' (former 50 App. U.S.C. § 535), so later SCRA amendments may not be incorporated for state-ordered duty; the lease text uses current § 3955 mechanics, which are substantially similar for residential leases. No other South Dakota military lease statute was found.",
    "MITIGATION: No South Dakota statute imposing a duty to mitigate on residential landlords was found in SDCL 43-32. Basis set to 'unclear'; South Dakota case law was not read. The lease commits Landlord to credit replacement rent.",
    "MONTH-TO-MONTH: SDCL 43-32-15 (notice at least as long as the term of hiring, not exceeding one month) is a renewal-presumption statute for hirings of unspecified term; applying it to month-to-month terminations is the common reading but is an interpretation. 43-32-13 gives the tenant a 15-day window to terminate after a landlord's change-of-terms notice.",
    "LATE FEES: No South Dakota statute caps late fees or sets a grace period. Case law not read.",
    "DEPOSIT EXCEPTION: The 'special conditions' exception allowing a deposit above one month's rent (43-32-6.1) is undefined; pet deposits are not separately addressed. Builder should cap at one month unless the landlord documents a special condition.",
    "SERVICE/ASSISTANCE ANIMALS: SDCL 43-32-33 to 43-32-36 allow landlords to request reliable documentation from a licensed health care provider (not one operating in South Dakota solely to certify animals) when the disability-related need is not apparent, and allow eviction plus a fee up to $1,000 for knowingly fraudulent documentation; must be applied consistently with the federal FHA.",
    "CO-LIVING: SDCL 20-13-20(1), (2), (4) do not apply to rooms or units in dwellings with living quarters for no more than two families where the owner occupies one (federal FHA exemptions are different).",
    "ATTORNEY FEES: Unlike OK/KS/NE, SDCL 43-32 contains no ban on lease attorney-fee clauses; SDCL 21-16-11 (attorney fees taxed as costs in FED actions) was not read.",
    "LOCAL LAW: Sioux Falls and Rapid City ordinances were not reviewed. Abandoned property: 43-32-25 (under $500, 10 days) and 43-32-26 (over $500, store 30 days).",
  ],

  confidence: "medium",
  researchedOn: "2026-11-08",
};
