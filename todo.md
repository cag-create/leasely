# Leasely Marketplace — Project TODO

## Schema & Database
- [x] Add marketplace_listings table (address, type, rent, beds, baths, photos, lat/lng, tier, status)
- [x] Add listing_views table (listing_id, viewer_ip, viewed_at, region)
- [x] Add listing_saves table (listing_id, user_id, saved_at)
- [x] Add listing_inquiries table (listing_id, name, email, message, sent_at)
- [x] Add user_subscriptions table (user_id, tier, stripe_subscription_id, status, portal branding fields)
- [x] Add accountType to users table (renter | landlord)
- [x] Add saved_searches table (user_id, label, filters JSON)
- [x] Add vendors table (user_id, name, trade, email, phone, service_areas)
- [x] Add work_orders table (property_id, title, description, priority, status, vendor_id, ai_summary)
- [x] Add accounting_entries table (user_id, property_id, type, category, amount, date, description)
- [x] Add crm_properties table (user_id, address, units, type, notes)
- [x] Add crm_tenants table (property_id, name, email, phone, move_in, move_out, rent, status)
- [x] Add crm_leases table (tenant_id, property_id, start/end dates, monthly_rent, deposit, status)
- [x] Add crm_notes table (user_id, entity_type, entity_id, content)
- [x] Add payment_records table (listing_id, tenant_name, amount_cents, stripe_payment_intent_id, status)
- [x] Push all DB migrations (15 tables confirmed)

## Server API
- [x] marketplace.getListings (public, with filters)
- [x] marketplace.getFeaturedListings (public, top 6)
- [x] marketplace.getListingById (public, increments view count)
- [x] marketplace.createListing (protected, checks tier for listing count)
- [x] marketplace.updateListing / deleteListing (protected, owner only)
- [x] marketplace.saveListing / unsaveListing / getSavedListings (protected)
- [x] marketplace.getMyListings / getListingAnalytics (protected)
- [x] marketplace.submitInquiry (public)
- [x] marketplace.getUserTier / upgradeToPaid (protected)
- [x] marketplace.getMapListings (public)
- [x] marketplace.uploadPhoto (protected, S3)
- [x] marketplace.setAccountType / updatePortalBranding (protected)
- [x] marketplace.getSavedSearches / saveSearch / deleteSavedSearch (protected)
- [x] marketplace.getPortalBySubdomain (public)
- [x] marketplace.generateQRCode (protected, Pro only)
- [x] marketplace.createStripeConnectAccount / getStripeConnectStatus (protected, Pro only)
- [x] marketplace.createPaymentSession / getPaymentHistory (protected)
- [x] vendors.list / create / update / delete (protected, Pro only)
- [x] workOrders.list / create / update / dispatch / aiSummarize (protected, Pro only)
- [x] accounting.list / create / delete / summary / exportCSV (protected, Pro only)
- [x] crm.listProperties / createProperty / updateProperty / deleteProperty (protected, Pro only)
- [x] crm.listTenants / createTenant / updateTenant / deleteTenant (protected, Pro only)
- [x] crm.listLeases / createLease / updateLease (protected, Pro only)
- [x] crm.listNotes / createNote / deleteNote (protected, Pro only)
- [x] auth.me returns accountType + tier + portal branding fields

## Frontend Pages
- [x] Landing page (Home.tsx) — dual-audience: renters + landlords/PMs, portal branding showcase
- [x] Marketplace browse page (/marketplace) — grid/list view, all filters, sorting
- [x] Map view (/marketplace/map) — full-screen Google Maps with pins, clustering, search
- [x] Property detail page (/listing/:id) — photos, info, map, contact form, save/share
- [x] Create listing page (/list-property) — 5-step wizard with geocoding and photo upload
- [x] Owner dashboard (/dashboard) — listings, stats, portal branding, Pro tools hub, upgrade prompt
- [x] Saved listings page (/saved) — bookmarked properties grid
- [x] Onboarding page (/onboarding) — renter vs landlord account type selection
- [x] Public branded portal page (/portal/:subdomain) — Pro landlord's public-facing page
- [x] Tenant rent payment page (/pay/:id) — Stripe Checkout for tenant rent payments
- [x] Payment success page (/pay/:id/success) — receipt and confirmation
- [x] Work Orders page (/work-orders) — AI dispatch, vendor management, status tracking
- [x] Accounting page (/accounting) — income/expense ledger, P&L summary, CSV export
- [x] Property CRM page (/crm) — units, tenants, leases, notes

## Tiered Access Logic
- [x] Free tier: 1 listing, marketplace-only (views, saves, contact inquiries only)
- [x] Free tier: NO rental applications, NO AI fraud detection, NO background checks, NO portal
- [x] Paid tier ($39.99/mo): unlimited listings, full portal, AI screening, branding, all Pro tools
- [x] Upgrade prompt banner in dashboard for free-tier users
- [x] Block second listing creation for free-tier users with UPGRADE_REQUIRED error
- [x] Locked feature cards in dashboard sidebar for free-tier landlords

## UI Components
- [x] Navbar — three-tier aware (guest / renter / free landlord / pro landlord)
- [x] PropertyCard component (grid and list variants)
- [x] MapView with pins, clustering, and preview cards
- [x] FilterBar with type, location, price range slider, beds, co-living, pet-friendly
- [x] ListingForm multi-step wizard (5 steps)
- [x] UpgradeBanner in dashboard
- [x] SaveButton (heart icon with optimistic toggle)
- [x] PhotoUploader (base64 upload to S3)
- [x] LockedFeatureCard component for Pro-only features
- [x] Portal branding editor in dashboard sidebar (Pro only)
- [x] Pro Portal Tools Hub in dashboard (Work Orders, Accounting, CRM quick links)
- [x] QR code modal per listing in dashboard (Pro only)
- [x] Stripe Connect card in dashboard (Pro only)

## Public Access
- [x] Marketplace browse — fully public, no auth wall
- [x] Map view — fully public, no auth wall
- [x] Listing detail — fully public, no auth wall
- [x] Contact/inquiry form — public (no login needed)
- [x] Save/favorite — gentle "Sign in to save" prompt, not a hard block

## Tests
- [x] All 15 tests passing (marketplace + auth)

## Future Enhancements
- [ ] Stripe payment integration for Pro upgrade ($39.99/mo — real Stripe keys needed)
- [ ] Email notifications for new inquiries (built-in notification API)
- [ ] AI fraud screening integration
- [ ] Background check (TransUnion SmartMove) integration
- [ ] Branded portal subdomain DNS routing (yourname.leasely.net)
- [ ] Advanced analytics charts (daily/weekly views over time)
- [ ] Rental application PDF integration (fillable form)
- [ ] Photo drag-and-drop reordering
- [ ] Listing expiry / renewal reminders
- [ ] Saved search notifications for renters
- [ ] SMS notifications for work order dispatch (Twilio)
- [ ] Tax-ready PDF export (Schedule E format)

## Tenant Portal & Waived ACH Fees
- [ ] Schema: tenant_portal_accounts table (email, password_hash, landlord_user_id, lease_id, name, phone)
- [ ] Schema: support_tickets table (user_id, subject, message, priority, status, tier, created_at)
- [ ] Schema: support_replies table (ticket_id, author_type, message, created_at)
- [ ] Tenant portal login page (/tenant/login) — separate from landlord login
- [ ] Tenant portal dashboard (/tenant/dashboard) — pay rent, view history, see lease info
- [ ] Tenant portal payment page — ACH/card with waived ACH fee for Pro landlords
- [ ] Landlord can invite tenants to their portal (sends email with login link)
- [ ] Waived ACH fees shown on pricing page and Pro upgrade modal
- [ ] Pro value prop: "0% ACH processing fee" vs standard 0.8% ($5 cap)
- [ ] Update all pricing sections to show waived ACH as a Pro benefit

## Premium Customer Service
- [ ] Help center page (/support) — FAQ, guides, contact options
- [ ] Priority ticket submission for Pro users (marked as high priority)
- [ ] Free users get standard support (email only, 3-5 business days)
- [ ] Pro users get priority support badge (24-hour response SLA)
- [ ] Pro users see a live chat widget (Crisp/Intercom style) in their dashboard
- [ ] Support ticket status tracking (open / in_progress / resolved)
- [ ] Owner notification when new support ticket is submitted
- [ ] Pro support badge in Navbar for paid users

## Sprint: Tenant Invite, Pricing Page & Stripe
- [ ] Tenant invite UI in landlord dashboard (name, email, lease dates, monthly rent)
- [ ] Server-side invite procedure that creates tenant account and sends magic-link email
- [ ] /pricing dedicated page with full feature comparison table, FAQ, and Start Free CTA
- [ ] Update Pro description copy with "AI fraud applicant detection" language
- [ ] Wire real Stripe publishable + secret keys

## Visual Redesign & Pro Enhancements
- [ ] Redesign global CSS with premium dark/light tokens, gradients, and Inter/Outfit typography
- [ ] Redesign Home.tsx — hero with animated gradient, feature showcases, rich visuals
- [ ] Build /pro dedicated Pro landing page with premium design
- [ ] Wire instant payout for Pro landlords via Stripe Connect
- [ ] Redesign Navbar with premium glass-morphism styling
- [ ] Redesign PropertyCard with richer visuals and hover effects
- [ ] Redesign Marketplace browse page

## Pro Demo Video & Visual Redesign
- [ ] Redesign Home.tsx with premium hero, animated stats, dual-audience sections
- [ ] Build /pro page with interactive feature walkthrough tabs and demo video embed
- [ ] Add feature spotlight animations (portal, payments, AI screening, work orders)
- [ ] Add social proof section with metrics (properties managed, rent collected, etc.)
- [ ] Wire instant payout for Pro landlords (Stripe Connect instant payout API)
- [ ] Add Instant Payout card to Pro dashboard
- [ ] Redesign Navbar with glassmorphism and premium styling
- [ ] Redesign PropertyCard with richer visuals
- [ ] Redesign Marketplace browse page

## Fixes & Improvements (Feb 28)
- [x] Remove fake stats from Home.tsx (replaced with honest value props: $0, 0%, 50 States, $39.99/mo)
- [x] Remove fake stats from ProPage.tsx (replaced with $0, 0%, ∞, $39.99/mo)
- [x] Remove "Join 3,200+ Pro landlords" fake stat from ProPage.tsx CTA
- [x] Remove "Join thousands" fake stat from Home.tsx CTA
- [x] Remove $99 setup fee from all pricing sections (confirmed already removed)
- [x] Fix ProPage feature tabs to show descriptions when clicked (confirmed working)
- [x] Generate AI demo screenshots for VideoModal (Dashboard, AI Screening, Accounting)
- [x] Build VideoModal with animated slideshow of AI-generated screenshots (3 slides, auto-advance, Prev/Next)
- [x] Generate AI voiceover script for demo video

## Testimonials & Feature Availability (Feb 28 Sprint 2)
- [ ] Soften placeholder testimonials on Home.tsx (add "Illustrative example" label or rewrite as generic)
- [ ] Soften placeholder testimonials on ProPage.tsx
- [ ] Remove "coming soon" / locked labels from AI Fraud Detection feature on ProPage
- [ ] Remove "coming soon" / locked labels from Instant Payout feature on ProPage
- [ ] Verify AI screening page (/work-orders or /crm) is accessible to Pro users
- [ ] Verify instant payout flow is accessible in dashboard for Pro users

## Apartment Complex & iStay™ Expansion (Feb 28 Sprint 3)

- [x] Remove placeholder testimonials from Home.tsx and ProPage.tsx
- [x] Add apartment_complexes, complex_units, istay_listings, istay_bookings, istay_reviews, istay_saves tables to schema
- [x] Run db:push migration for all new tables (24 total tables)
- [x] Add complexesRouter (CRUD for complexes and units, publish unit to marketplace)
- [x] Add istayRouter (listings, bookings, reviews, saves, search with filters)
- [x] Build ApartmentComplexes.tsx dashboard page with unit management and publish-to-marketplace
- [x] Build IStay.tsx marketplace page with search, filters, listing cards, booking modal, and wishlist
- [x] Add /istay and /complexes routes to App.tsx
- [x] Update DashboardLayout sidebar with all nav items (Dashboard, Listings, Complexes, iStay, Work Orders, Accounting, CRM, Saved, Support)
- [x] Add iStay™ link to Navbar (rose/red color to match iStay brand)
- [x] Add iStay™ section to Home page (between map section and Pro section)
- [x] Add Apartment Complexes and iStay links to footer
- [x] Write vitest tests for complex and iStay business logic (26 tests passing)

## Sprint: iStay Removal, Admin, Pro Gating, Applications (Feb 28)

- [ ] Remove iStay from Navbar, DashboardLayout sidebar, App.tsx routes, Home.tsx section, footer
- [ ] Verify /admin route exists and owner (OWNER_OPEN_ID) has admin access
- [ ] Gate Complexes page behind Pro tier — show upgrade prompt for free users
- [ ] Audit rental applications flow — ensure it exists and works
- [ ] Co-living listings should show "Members" application form instead of standard rental application

## Pro Gate & Access Control (Feb 28 Sprint 4)
- [ ] ProGate component — blocks all Pro features, redirects to /pricing with upgrade CTA
- [ ] Wrap Dashboard, CRM, WorkOrders, Accounting, Complexes, Applications with ProGate
- [ ] Admin page at /admin — role=admin only, shows stats, users, subscriptions
- [ ] Rental Applications page — state-specific, standard + co-living Members form, upload own, shareable link
- [ ] Rent rate intelligence widget in Dashboard
- [ ] Fix all TypeScript compilation errors

## Premium Design Overhaul (Feb 28 Sprint 5)
- [ ] Global CSS — premium design tokens, Inter/Outfit typography, dark/light palette, generous spacing
- [ ] Navbar — glassmorphism, premium brand feel, spacious layout
- [ ] DashboardLayout — spacious sidebar, soft shadows, premium card system
- [ ] Home.tsx — asymmetric hero, animated gradient, dual-audience sections, no fake stats
- [ ] ProPage.tsx — premium Pro landing with interactive tabs, demo section
- [ ] Dashboard page — spacious card layouts, soft shadows, accent hierarchy
- [ ] CRM, WorkOrders, Accounting — consistent premium card system
- [ ] ProGate component — premium upgrade prompt, feature list, no-setup-fee messaging
- [ ] Admin page at /admin — role=admin only
- [ ] Rental Applications page — state-specific, standard + Members form, shareable link
- [ ] Rent rate intelligence widget in Dashboard

## Session Completion (Feb 28 Final)
- [x] Remove iStay from all frontend surfaces (Navbar, DashboardLayout, App.tsx, Home.tsx, footer) — backend preserved
- [x] AdminPage.tsx built at /admin with role=admin gate, stats, user management, promote-to-admin
- [x] ProGate component built — blocks Pro features with upgrade CTA
- [x] Wrap Complexes, Applications, and all Pro pages with ProGate
- [x] RentalApplications.tsx built — state-specific disclosures (all 50 states), standard + co-living Members form, shareable link with copy/share, status management
- [x] Market Rent Intelligence widget added to Dashboard (Pro only) — city/state lookup, median/min/max by property type
- [x] Rent rate tRPC procedures (rentRates.getByArea, rentRates.getByState) with national estimate fallback
- [x] Premium design overhaul: global CSS tokens, Inter/Outfit fonts, glassmorphism Navbar, spacious DashboardLayout
- [x] Home.tsx redesigned with asymmetric hero, animated stats, dual-audience sections
- [x] All placeholder testimonials removed from Home.tsx and ProPage.tsx

## Admin Access & Founder Testimonial
- [ ] Fix owner admin access at /admin (set role=admin for OWNER_OPEN_ID user)
- [ ] Add real founder testimonial about AI fraud detection (caught fake pay stub, employer address, phone, virtual address)

## Public Application Form & Auto-Provisioning
- [ ] Public /apply/:listingId page — mobile-friendly tenant application form
- [ ] State-specific disclosure text on public application form
- [ ] Co-living listings show Members application form on /apply/:listingId
- [ ] Wire Stripe webhook checkout.session.completed to auto-set tier=paid
- [ ] Post-payment Pro onboarding wizard (business name, logo, brand color, subdomain, state, property focus)
- [ ] Redirect payment success to onboarding wizard
- [ ] Add founder testimonial to ProPage about AI fraud detection
- [ ] Add subdomain testimonial to ProPage (branded portal feature)
- [ ] Add third Pro feature testimonial to ProPage (instant payout or accounting)
- [ ] Upgrade QR code in Pro dashboard to link to /apply/:listingId instead of listing detail page
- [ ] Add print-friendly QR code modal with property address and Leasely branding for for-rent signs
- [ ] Portfolio QR code — links to Pro portal showing all listings (for business cards, yard signs)
- [ ] Listing QR code — links to /apply/:listingId for specific unit door signs
- [ ] Print-friendly QR modal with property address and Leasely branding
- [ ] Add QR code as a feature card in the Pro features deep-dive section on ProPage

## Pricing: $99 Setup Fee (Feb 28)
- [ ] Add $99 one-time setup fee price to products.ts
- [ ] Update Stripe checkout to include both $99 setup fee + $39.99/month recurring
- [ ] Update Pricing page to show $99 setup fee + $39.99/month
- [ ] Update ProPage to show $99 setup fee + $39.99/month
- [ ] Update ProGate to show $99 setup fee + $39.99/month

## Affiliate Program & $99 Setup Fee
- [ ] Show $99 one-time setup fee on Pricing page, ProPage, ProGate
- [ ] Add affiliates, referrals, affiliate_earnings, w9_submissions tables to schema
- [ ] Add affiliate tRPC procedures (signup, W-9 submit, get referral link, earnings, payout history)
- [ ] Build /affiliate page with W-9 gate → referral link → earnings dashboard
- [ ] Wire referral code tracking in Stripe checkout metadata
- [ ] Auto-credit $50 earning when referred landlord's payment clears (webhook)
- [ ] Add Affiliate W-9 management to Admin panel (view, approve, flag for 1099)
- [ ] Add Affiliate link to navbar and footer
