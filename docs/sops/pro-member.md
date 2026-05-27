# Leasely — Pro Member SOP

> Standard operating procedure for a landlord, investor, or small-portfolio
> property manager running their business on Leasely Pro.

This is the canonical version. The in-app version at `/pro-guide` is rendered
from this same content.

---

## What a Pro membership gives you

- A branded tenant portal at `yourname.leasely.net` (e.g. `oakstreet.leasely.net`)
- Unlimited listings + applications
- Stripe Connect instant payouts
- AI-assisted applicant screening
- State-specific lease templates with e-signature
- Apartment complex / multi-unit management
- Work-order dispatch with vendor tracking
- Accounting (income/expense ledger + CSV export)
- Tenant CRM
- "Leasely Market Intelligence" — automated rent comps for any U.S. zip

Setup is **$75 once + $25/month**. First listing is always free, even without Pro.

---

## Day-1 setup (do these in order)

1. **`/onboarding`** — complete the wizard. Stripe Connect onboarding takes
   ~5 min and unlocks payouts. **Use your business legal name** (e.g. "Redrock
   Property Group LLC"), not your personal name — this is what prints on leases
   as the landlord-of-record.
2. **`/pro-setup`** — pay the $75 setup fee via the Stripe payment link. After
   payment Stripe redirects you to **`/welcome`**, which confirms activation,
   provisions your subdomain, and links to the next steps. Subdomain is live
   within ~30 seconds.
3. **`/portal-setup`** — upload your logo + brand color. Skip this and your portal
   defaults to "Leasely navy" + a placeholder logo. (The header now shows the
   logo mark only — no "Leasely" wordmark.)
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
- When you approve an application, Leasely auto-renders a state-specific draft
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

## Importing listings from another platform

`/import-listings` accepts CSV exports from:
- Zillow Rental Manager
- AppFolio
- Buildium
- Rentec Direct
- Apartments.com

Download a template if your platform isn't listed — the columns map by header
name, not position.

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
- **Take payment by check / cash through Leasely.** You can record it manually
  in `/accounting`, but the platform itself only handles ACH + card.

## What "Pro" doesn't cover

- Tax filing — we export, you (or your CPA) file.
- Eviction filings — we generate a lease history + payment record; you (or
  your attorney) file with the court.
- Insurance — we partner with Steadily; quote in your dashboard, bind on their
  side. Same for renters' insurance (Lemonade affiliate).
