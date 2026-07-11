# Keycove — Admin SOP

> Internal operating procedures for the platform admin team. Last updated 2026-05-27.

This SOP covers the everyday and rare-but-critical tasks that flow through `/admin`.
It is the authoritative reference — if a flow disagrees with this doc, the doc is right
and the flow needs fixing.

---

## 1. Daily — Admin opening checklist (≈10 min)

1. Open `/admin` and confirm the **System Health** tile is green.
2. Check **Rent Benchmark Runs** — last successful `acs` and `hud` run should be within
   30 days. If not, run `rentIntelligence.refreshNow({ source: "both" })` from the admin
   panel. See §6 if it fails.
3. Skim **Pending Creme Agent applications** — approve / reject within 24 hrs. See §3.
4. Skim **Pending Contractor applications** — same SLA.
5. Skim **Affiliate signups** — verify payout details before approving.
6. Open `/admin/sop-library` to confirm SOPs are still loadable (the UI lazy-loads
   markdown from `/docs/sops/`).

## 2. Weekly tasks

- **Lease-template audit.** Pick one state at random, open
  `client/src/lib/leaseTemplates/<state>.ts`, confirm clauses still match latest statute
  cite. Memory: never use third-party login services for legal content.
- **Refund queue.** Process refund requests filed via Support within 7 business days.
- **Trademark watch.** Re-check `Keycove.ai` (Libertella, ON) and `Leasey.AI` (Silver
  Homes, BC) for status changes. See memory: `project_leasely_trademark.md`.
- **Affiliate payout reconciliation.** Match `affiliate_clicks` → conversions →
  Stripe payouts. Anything > 30 days unreconciled gets manually paid out and a ticket
  filed against the attribution gap.

## 3. Approving a Creme Agent

1. Open the application in `/admin` → **Creme Agents → Pending**.
2. Verify the agent license number via the issuing state's DRE / RECO portal.
   Do **not** rely on the photo or self-attestation.
3. Confirm at least one `serviceArea` and one `specialty` is set.
4. If approved: click **Approve** — this flips `status` to `approved` and surfaces the
   agent in the public directory at `/agents`.
5. If rejected: click **Reject** with a reason. The user receives the reason verbatim
   in their dashboard.

## 4. Handling a fraud / chargeback ticket

1. Pull the application from `/admin` → **Rental Applications** by ID.
2. Re-run the AI screening (uses `gpt-4o-mini` via Forge — see memory).
3. If the screening report differs materially from what the landlord saw, ship the
   delta to the landlord with an apology and refund.
4. Open a Linear ticket against the screening model with the applicant ID redacted.
5. Refund chargebacks **only after** Stripe's evidence window closes — never refund
   a disputed charge while it's still in dispute, you lose the dispute case file.

## 5a. Pro signup flow — what to check when activation looks broken

The Stripe payment link redirects to **`leasely.net/welcome`** after the $75
setup payment. That page reads the `?session_id=...` query param, calls
`pro.activateFromStripeSession`, and provisions the subdomain. If a member
reports "I paid but nothing happened":

1. Confirm the Stripe payment succeeded in the Stripe dashboard.
2. In `/admin` → Pro Members, search by email. `pro_setup_paid_at` should be
   populated. If not, run `pro.activateFromStripeSession({ sessionId })`
   manually from the admin console with the session ID from Stripe.
3. Subdomain provision is async — Cloudflare DNS can lag 5–15 min.
4. Confirm `business_legal_name` is set on the user — the lease render
   depends on it. Members entering personal name only is the most common
   "lease has wrong landlord" report.

## 5b. Brevo email lookups (lease emails, password resets, screening reports)

All transactional email goes through Brevo via `BREVO_API_KEY`. To verify
delivery for a member ticket:

1. Log in to Brevo → **Transactional → Email activity**.
2. Search by recipient email + 24h window.
3. Look for `delivered`, `soft_bounce`, `hard_bounce`, `spam`, or `blocked`.
4. `hard_bounce` → mark the email invalid in the user record and ask the
   member for a corrected address. Brevo will suppress further sends to
   bounced addresses for 30 days.

## 5. Manual Pro-member overrides

- **Comp ticket** (free Pro for partners / press): set `is_pro = 1`,
  `pro_setup_paid_at = NOW()`, and `pro_complimentary_reason` to the partner name.
  Comp tickets are visible to billing — never use this to dodge a refund.
- **Pause** (member on medical leave): set `pro_paused_until` to the return date.
  Their portal stays live; billing pauses; dashboard banner explains.

## 6. Rent benchmark refresh failures

If `rentIntelligence.runStatus` shows a recent failure:

1. Read the `error_message` column on the failed `rent_benchmark_runs` row.
2. **`fetch failed` / timeout** → almost always a HUD or Census API rate limit. Wait
   one hour and retry; the service already does 3 retries internally.
3. **`401 Unauthorized` on HUD** → `HUD_API_TOKEN` env var rotated. Generate a new
   token at huduser.gov and update Railway env. HUD layer is optional — ACS-only
   still gives a usable benchmark.
4. **`500` on Census** → the state-level call sometimes fails on one state. The
   service continues with the others, so partial success is OK. Re-run with
   `source: "acs"` once Census is up.
5. **Schema drift** → if the response shape changed (Census sometimes renames
   variables across years), update `B25064` reference and the column index in
   `server/_core/rentBenchmarks.ts` — do not silently swallow.

## 7. Things admins MUST NOT do

- Never expose "HUD" / "ACS" / "Census" as a data source name in tenant- or
  landlord-facing UI. The product brand is "Keycove Market Intelligence". The
  internal `dataSource` field can keep the provenance.
- Never edit a tenant's signed lease after signature. Generate an addendum and
  send a new signature request.
- Never log in as a tenant or landlord "to help". Use an impersonation token
  with a 30-min TTL and a written reason; every impersonation is audit-logged.
- Never paste API keys, Stripe secrets, or Census tokens into chat tickets.

## 8. Quarterly reviews

- Re-test the highest-traffic state lease templates against the current statute.
- Pull the top 50 zip codes by listing count and spot-check that the benchmark
  range is within ±15% of public median rent listings (Zillow / Apartments.com
  for sanity-check **only** — never ingest).
- Review `MEMORY.md` decisions list with the team and retire anything stale.
