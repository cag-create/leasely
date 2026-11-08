# Keycove — Pro Member SOP

> Standard operating procedure for a landlord, investor, or small-portfolio
> property manager running their business on Keycove Pro.

This is the canonical version. The in-app version at `/pro-guide` is rendered
from this same content.

---

## What a Pro membership gives you

- A branded tenant portal at `keycove.net/portal/yourname` (e.g. `keycove.net/portal/oakstreet`) plus a website built from your brand brief
- Unlimited listings + applications
- Stripe Connect instant payouts
- AI-assisted applicant screening
- State-specific lease templates with e-signature
- Bulk migration import — move a whole portfolio + existing leases in one upload
- Apartment complex / multi-unit management, plus co-living (rent by the room)
- Work-order dispatch with vendor tracking
- Accounting (income/expense ledger + CSV export)
- Tenant CRM
- "Keycove Market Intelligence" — automated rent comps for any U.S. zip

Pro is **$25/month flat**, charged at signup and then monthly — no setup fee, website included. First listing is always free, even without Pro.

---

## Day-1 setup (do these in order)

1. **`/onboarding`** — complete the wizard. Stripe Connect onboarding takes
   ~5 min and unlocks payouts. **Use your business legal name** (e.g. "Redrock
   Property Group LLC"), not your personal name — this is what prints on leases
   as the landlord-of-record.
2. **Get Pro** (`/pricing` → Start Pro) — $25 today, then $25/month. After
   payment Stripe redirects you to **`/portal-setup?pro_welcome=1`**. Your
   portal is live within ~30 seconds.
3. **`/portal-setup`** — pick your portal name, upload your logo + brand color,
   and fill in the 2-minute brand brief; Keycove builds your website from it
   and emails you when it's live. Skip this and your portal
   defaults to "Keycove navy" + a placeholder logo. (The header now shows the
   logo mark only — no "Keycove" wordmark.)
4. **`/list-property`** — add your first property. The Market Intelligence widget
   suggests a rent range on step 3 based on the zip + bedroom count.
5. **`/my-listings`** — confirm it's live. Share the public URL with prospects.

## Weekly cadence (the actual job)

### Mon — applications & screening
- `/applications` — review every new applicant.
- Click **Run AI Screening** on each new one. Screening runs in the background
  (~30 sec) and surfaces a risk score + flags. If it errors, see §Troubleshooting.
- Decision within 48 hours per Fair Housing best-practice. Do **not** silently
  ghost applicants — every state requires written notice if you adverse-action.

### Tue — leases & e-sign
- `/leases` — anyone you approved Mon goes through lease send today.
- Stat filter tabs at the top — **All Leases / Drafts / Signed / Expiring** —
  filter the list inline (active tab shows navy background + ring).
- When you approve an application, Keycove auto-renders a state-specific draft
  using the applicant's data + your business profile. The draft appears under
  the **Drafts** tab with a green **Review →** button.
- Click **Review →** on the lease card to open `/leases/draft/:id`. Fill any
  red **required** fields (landlord_address, property_city, property_zip,
  occupants, rent_due_day, late_fee, utilities, pets_allowed, parking) — these
  come from your business profile when present and only highlight if missing.
- Use **Edit Details** to change start date, end date, monthly rent, deposit,
  or term length (e.g. 24-month lease June 2026 → June 2028) before sending.
  Renewal mode (month-to-month vs fixed-term re-sign) is a checkbox on the
  same panel.
- Click **Send for Signature** when ready — tenant gets a Brevo email with the
  signing link. First month + deposit go through `/lease-pay`.

### Wed — work orders
- `/work-orders` — triage any tenant-submitted requests. Dispatch to a vendor
  from `/contractors` or your own contact.
- The AI summary on each request tells you scope + urgency before you read the
  tenant's wall of text.

### Thu — financial close
- `/accounting` — categorize the week's transactions. Stripe payouts auto-import.
- Export CSV monthly for your bookkeeper.

### Fri — pipeline + marketing
- `/dashboard` — review occupancy, upcoming lease expirations (90/60/30 day
  warnings), and renewal pipeline.
- Refresh listing photos / pricing on anything vacant >14 days. Use the Market
  Intelligence widget to confirm pricing is still in band.

## Rent collection — what to expect

- Tenant pays at `pay/<id>` (link is on their tenant dashboard too).
- Stripe Connect instant-payouts the next business day by default. You can flip
  to "manual payout" in Stripe if you want batch deposits.
- Late fee logic is per-lease and auto-applied; you do **not** chase manually.
- Failed ACH → tenant gets a retry link automatically; you only get pinged if
  the retry fails too.

## Apartment complexes (multi-unit)

- `/complexes` — create the building, then add units. Each unit can be a
  separate listing with its own price + photos + applicants.
- One-and-done amenities (pool, gym) live on the complex; per-unit amenities
  (sq ft, balcony, in-unit laundry) live on the unit.
- **Co-living** — one property rented by the room. Set the property type to
  Co-living and renters come in as Room 1, Room 2… Each room bills, tracks, and
  late-fees on its own. Fastest way to load an occupied building is Move to
  Keycove below.

## Move to Keycove (import from your old software)

One wizard for properties, units, tenants (optional), leases and HOA details.
Vacant units are fine; re-running a file updates instead of duplicating.

**Where:** `/move-to-keycove` (also the **Import** button next to *Add
Property* in the CRM, and on the Leases page). The old `/import-portfolio`
and `/import-tenants` links redirect here.

**SOP — 5 steps:**
1. **Pick your old software** — AppFolio, Buildium, RentRedi, Avail, Rentec
   Direct, Zillow Rental Manager, or a spreadsheet. The wizard shows its
   export steps:
   - AppFolio: Reports → Rent Roll (or Unit Directory for vacant units) → Export.
   - Buildium: Reports → Rent Roll (includes vacant units) → Export.
   - RentRedi: Tenants → export icon → CSV.
   - Avail: Tenants → ⋯ → Export tenants list.
   - Rentec Direct: Tenants → Export → CSV, plus Properties → Export for vacant units.
   - Zillow Rental Manager: My Properties → select → Actions → Export CSV.
2. **Upload** — CSV, Excel `.xlsx`, or a Google Sheets link shared as
   "Anyone with the link can view". "Download template" if building by hand.
3. **Match columns** — known headers map automatically; AI suggests the rest
   from column names and value types only (no tenant data is sent). Confirm
   with the dropdowns. The mapping is saved per source for next time.
4. **Review** — rows needing fixes are highlighted; edit them inline. Bad rows
   are skipped, never block the good ones.
5. **Import** — units, tenants, leases and HOAs are created/updated in one pass.
   "Set up online rent collection" gives tenants with an email + state a portal
   login and rent schedule. Files over 500 rows are sent in batches.

**Columns understood:** `building, address, unit, city, state, zip, type,
tenant name (or first/last), tenant_email, tenant_phone, monthly_rent,
security_deposit, lease_start, lease_end, late_fee, grace_days, hoa_name,
hoa_dues, hoa_frequency, hoa_due_date`

- Only `address` is required. Blank tenant columns → vacant unit.
- Units match on normalized address + unit ("812 Maple Avenue Apt 4B" = "812 Maple Ave #4b").
- Blank `lease_end` → month-to-month.
- Never ask a landlord for their old software's password; they export the file.

**Just importing marketplace listings** (vacant units to advertise)? Use
`/import-listings`.

## HOA dues

**Where:** `/hoa` (sidebar → HOA Dues). Included in Pro. Keycove tracks and
reminds; the landlord pays on the HOA's own portal.

**SOP:**
1. **Add HOA** for a CRM property. Optional: upload an HOA statement (PDF or
   photo) — AI fills in the HOA name, management company, amount, due date,
   frequency, portal link and contact. Check every field before saving.
2. Set dues, frequency (monthly / quarterly / every 6 months / yearly), next
   due date and reminder lead time (default 7 days).
3. Account number: only the last 4 digits are stored.
4. Flag **autopay** and/or **tenant reimburses** if they apply.
5. Add a rules summary and upload CC&Rs / rules PDFs.
6. **Mark paid** → logs an `HOA Dues` expense in Accounting and rolls the due
   date forward. **Special assessments** get their own due date, reminder and
   Accounting entry.

## Get a tenant → signed → paying

How a prospect becomes a paying tenant with a live portal.

**Where prospects come from:**
- **On the marketplace** — a renter opens your listing and hits *Contact
  Landlord* (emails you) or *Apply* at `/apply/<listingId>`.
- **Off-site** — on `/my-listings`, click the link icon to **copy the apply
  link** and text/email it yourself. They apply with no account.

**Approve → lease fires automatically:**
- Approve an applicant on `/applications` and the lease is **sent to sign
  automatically** — no manual step.
- When they sign, their **tenant portal and your CRM portfolio both go live**
  (rent schedule, auto late fees, accounting), and you're prompted to
  countersign.

**Send a lease by hand (any tenant):**
- For someone who didn't apply, use **Send lease to sign** in `/crm`. Enter the
  terms and either **attach your own lease PDF** or use a standard agreement.
- The tenant gets a private `/sign/<token>` link, signs, and their unit +
  portal go live instantly. Works for apartment units and co-living rooms.

## Troubleshooting

**"AI screening is stuck on screening…"** — wait 90 seconds. If still stuck,
the panel will show a red error banner with the underlying message; click
**Retry AI Screening**. If it errors twice in a row, contact support.

**"Tenant says they didn't get the lease email"** — check Brevo (the
transactional email provider). Log in to Brevo → **Transactional → Email
activity**, search by the tenant's email address. You should see a `delivered`
event within ~30 seconds of sending. If it shows `soft_bounce` or `spam`,
re-send from `/leases` after confirming the address. If nothing appears at all,
the lease never sent — check the lease card status in `/leases`.

**"Approved a lease but the draft won't open / 404 on `/leases/draft/...`"** —
older approvals from before the May 2026 fix may have a stale `draft_lease_id`
pointer. Click **Edit Details** on the lease card — this re-renders the draft
from the current state template and links it correctly. If the card has no
Review button at all, click **Send for Signature** to regenerate.

**"Lease shows my personal name, not my LLC"** — fix at `/onboarding` →
business profile → legal name. The lease render pulls `landlord_name` from
your business profile, not your user account. Re-open the draft via
**Edit Details** after saving to pick up the change.

**"My portal subdomain is showing 404"** — Cloudflare DNS propagation can take
up to 15 minutes on first provision. If still down after 30 min,
`/admin` impersonation is the fastest fix — open a support ticket.

**"My listing isn't showing on the marketplace"** — confirm `status = active`
on `/my-listings`. Inactive listings stay in your dashboard but don't surface
publicly.

**"The Market Intelligence widget says 'not enough data'"** — your zip is in
the long tail. We use HUD FMR + Census ACS, refreshed monthly. Your listing
adds to the dataset.

## Things you cannot do (and why)

- **Run a background check yourself in-app.** We integrate with ApplyConnect.
  You're the requester; you don't get raw consumer-report PII.
- **Edit a signed lease.** Generate an addendum and resend for signature.
  (Draft leases — i.e. before tenant signature — can still be edited via the
  **Edit Details** button on the lease card.)
- **Refund a rent payment that's already been paid out to your bank.** Refund
  has to go from your bank account back to the tenant — Stripe will not claw
  back a settled payout.
- **Take payment by check / cash through Keycove.** You can record it manually
  in `/accounting`, but the platform itself only handles ACH + card.

## What "Pro" doesn't cover

- Tax filing — we export, you (or your CPA) file.
- Eviction filings — we generate a lease history + payment record; you (or
  your attorney) file with the court.
- Insurance — we partner with Steadily; quote in your dashboard, bind on their
  side. Same for renters' insurance (Lemonade affiliate).
