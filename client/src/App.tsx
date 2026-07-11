import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProGate } from "./components/ProGate";
import CookieBanner from "./components/CookieBanner";
import { lazy, Suspense } from "react";

// ── Eager loads (tiny, always needed) ─────────────────────────────────────────
import NotFound from "@/pages/NotFound";

/**
 * Lazy import that survives deploys. When a code-split chunk's hashed filename
 * changes after a redeploy, a browser holding the old index.html requests a
 * chunk that no longer exists — the server returns index.html (text/html),
 * the dynamic import throws "'text/html' is not a valid JavaScript MIME type",
 * and Suspense/lazy crashes the page. Here we reload ONCE (guarded by a
 * sessionStorage flag to avoid loops) so the browser fetches the fresh
 * index.html + chunk map instead of showing an error screen.
 */
function lazyWithRetry(factory: () => Promise<{ default: any }>) {
  return lazy(async () => {
    try {
      const mod = await factory();
      try { sessionStorage.removeItem("chunk-reload"); } catch {}
      return mod;
    } catch (err) {
      try {
        if (!sessionStorage.getItem("chunk-reload")) {
          sessionStorage.setItem("chunk-reload", "1");
          window.location.reload();
          return await new Promise<{ default: any }>(() => {}); // suspend; page is reloading
        }
      } catch {}
      throw err;
    }
  });
}

// ── Lazy loads (route-level code splitting) ───────────────────────────────────
const Home                = lazyWithRetry(() => import("./pages/Home"));
const Marketplace         = lazyWithRetry(() => import("./pages/Marketplace"));
const MapViewPage         = lazyWithRetry(() => import("./pages/MapView"));
const ListProperty        = lazyWithRetry(() => import("./pages/ListProperty"));
const ListingDetail       = lazyWithRetry(() => import("./pages/ListingDetail"));
const Dashboard           = lazyWithRetry(() => import("./pages/Dashboard"));
const SavedListings       = lazyWithRetry(() => import("./pages/SavedListings"));
const Onboarding          = lazyWithRetry(() => import("./pages/Onboarding"));
const PortalPage          = lazyWithRetry(() => import("./pages/PortalPage"));
const RentPayment         = lazyWithRetry(() => import("./pages/RentPayment"));
const RentPaymentSuccess  = lazyWithRetry(() => import("./pages/RentPaymentSuccess"));
const RentPaymentPrivate        = lazyWithRetry(() => import("./pages/RentPaymentPrivate"));
const RentPaymentPrivateSuccess = lazyWithRetry(() => import("./pages/RentPaymentPrivateSuccess"));
const WorkOrders          = lazyWithRetry(() => import("./pages/WorkOrders"));
const Accounting          = lazyWithRetry(() => import("./pages/Accounting"));
const CRM                 = lazyWithRetry(() => import("./pages/CRM"));
const TenantLogin         = lazyWithRetry(() => import("./pages/TenantLogin"));
const TenantDashboard     = lazyWithRetry(() => import("./pages/TenantDashboard"));
const Support             = lazyWithRetry(() => import("./pages/Support"));
const Pricing             = lazyWithRetry(() => import("./pages/Pricing"));
const ProPage             = lazyWithRetry(() => import("./pages/ProPage"));
const ApartmentComplexes  = lazyWithRetry(() => import("./pages/ApartmentComplexes"));
const AdminPage           = lazyWithRetry(() => import("./pages/AdminPage"));
const AdminStripeSmoke    = lazyWithRetry(() => import("./pages/AdminStripeSmoke"));
const AdminLeaseTemplates = lazyWithRetry(() => import("./pages/AdminLeaseTemplates"));
const RentalApplications  = lazyWithRetry(() => import("./pages/RentalApplications"));
const PublicApplication   = lazyWithRetry(() => import("./pages/PublicApplication"));
const ProSetup            = lazyWithRetry(() => import("./pages/ProSetup"));
const Welcome             = lazyWithRetry(() => import("./pages/Welcome"));
const PortalSetup         = lazyWithRetry(() => import("./pages/PortalSetup"));
const EditListing         = lazyWithRetry(() => import("./pages/EditListing"));
const ImportListings      = lazyWithRetry(() => import("./pages/ImportListings"));
const ImportTenants       = lazyWithRetry(() => import("./pages/ImportTenants"));
const ImportPortfolio     = lazyWithRetry(() => import("./pages/ImportPortfolio"));
const MyListings          = lazyWithRetry(() => import("./pages/MyListings"));
const AffiliateSignup     = lazyWithRetry(() => import("./pages/AffiliateSignup"));
const AffiliateDashboard  = lazyWithRetry(() => import("./pages/AffiliateDashboard"));
const LoginPage           = lazyWithRetry(() => import("./pages/LoginPage"));
const AgentDirectory      = lazyWithRetry(() => import("./pages/AgentDirectory"));
const AgentProfile        = lazyWithRetry(() => import("./pages/AgentProfile"));
const ContractorDirectory = lazyWithRetry(() => import("./pages/ContractorDirectory"));
const ContractorProfile   = lazyWithRetry(() => import("./pages/ContractorProfile"));
const ContractorRegister  = lazyWithRetry(() => import("./pages/ContractorRegister"));
const FsboSignup          = lazyWithRetry(() => import("./pages/FsboSignup"));
const JoinWaitlist        = lazyWithRetry(() => import("./pages/JoinWaitlist"));
const IStay               = lazyWithRetry(() => import("./pages/IStay"));
const Compare             = lazyWithRetry(() => import("./pages/Compare"));
const BrokerDashboard     = lazyWithRetry(() => import("./pages/BrokerDashboard"));
const FeeSchedule         = lazyWithRetry(() => import("./pages/FeeSchedule"));
const Leases              = lazyWithRetry(() => import("./pages/Leases"));
const Payouts             = lazyWithRetry(() => import("./pages/Payouts"));
const VendorRespond       = lazyWithRetry(() => import("./pages/VendorRespond"));
const TenantSignLease     = lazyWithRetry(() => import("./pages/TenantSignLease"));
const Privacy             = lazyWithRetry(() => import("./pages/Privacy"));
const Terms               = lazyWithRetry(() => import("./pages/Terms"));
const CCPA                = lazyWithRetry(() => import("./pages/CCPA"));
const FairHousing         = lazyWithRetry(() => import("./pages/FairHousing"));
const CookiePolicy        = lazyWithRetry(() => import("./pages/Cookies"));
const ForgotPassword      = lazyWithRetry(() => import("./pages/ForgotPassword"));
const ResetPassword       = lazyWithRetry(() => import("./pages/ResetPassword"));
const VerifyEmail         = lazyWithRetry(() => import("./pages/VerifyEmail"));
const LeasePay            = lazyWithRetry(() => import("./pages/LeasePay"));
const SendLease           = lazyWithRetry(() => import("./pages/SendLease"));
const LeaseWizard         = lazyWithRetry(() => import("./pages/LeaseWizard"));
const LeasePreview        = lazyWithRetry(() => import("./pages/LeasePreview"));
const UploadOwnLease      = lazyWithRetry(() => import("./pages/UploadOwnLease"));
const ProGuide            = lazyWithRetry(() => import("./pages/ProGuide"));
const HowToUse            = lazyWithRetry(() => import("./pages/HowToUse"));
const AgentGuide          = lazyWithRetry(() => import("./pages/AgentGuide"));

// ── Page-level loading fallback ───────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Auth */}
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/verify-email" component={VerifyEmail} />

        {/* Public */}
        <Route path="/" component={Home} />
        <Route path="/apply/:listingId" component={PublicApplication} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/pro-setup" component={ProSetup} />
        <Route path="/portal-setup" component={PortalSetup} />
        <Route path="/edit-listing/:id" component={EditListing} />
        <Route path="/import-listings" component={ImportListings} />
        <Route path="/import-tenants" component={ImportTenants} />
        <Route path="/import-portfolio" component={ImportPortfolio} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/marketplace/map" component={MapViewPage} />
        <Route path="/listing/:id" component={ListingDetail} />

        {/* Public portal pages */}
        <Route path="/portal/:subdomain" component={PortalPage} />

        {/* Tenant rent payment (public) */}
        <Route path="/pay/rent/:token" component={RentPaymentPrivate} />
        <Route path="/pay/rent/:token/success" component={RentPaymentPrivateSuccess} />
        <Route path="/pay/:id" component={RentPayment} />
        <Route path="/pay/:id/success" component={RentPaymentSuccess} />

        {/* Lease move-in payments (deposit + first month) */}
        <Route path="/lease-pay/:id" component={LeasePay} />
        <Route path="/lease-pay/:id/success" component={LeasePay} />

        {/* Auth + Pro required */}
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/list-property" component={ListProperty} />
        <Route path="/my-listings" component={MyListings} />
        <Route path="/dashboard">
          {() => <ProGate featureName="your dashboard"><Dashboard /></ProGate>}
        </Route>
        <Route path="/saved" component={SavedListings} />
        <Route path="/work-orders">
          {() => <ProGate featureName="Work Orders"><WorkOrders /></ProGate>}
        </Route>
        <Route path="/accounting">
          {() => <ProGate featureName="Accounting"><Accounting /></ProGate>}
        </Route>
        <Route path="/crm">
          {() => <ProGate featureName="Property CRM"><CRM /></ProGate>}
        </Route>
        <Route path="/payouts">
          {() => <ProGate featureName="Payouts &amp; Banking"><Payouts /></ProGate>}
        </Route>
        <Route path="/complexes">
          {() => <ProGate featureName="Apartment Complexes"><ApartmentComplexes /></ProGate>}
        </Route>
        <Route path="/applications">
          {() => <ProGate featureName="Rental Applications"><RentalApplications /></ProGate>}
        </Route>

        {/* Lease Agreements (Pro) */}
        <Route path="/leases">
          {() => <ProGate featureName="Lease Agreements"><Leases /></ProGate>}
        </Route>
        <Route path="/leases/send">
          {() => <ProGate featureName="Send a Lease"><SendLease /></ProGate>}
        </Route>
        <Route path="/leases/send/wizard">
          {() => <ProGate featureName="Send a Lease"><LeaseWizard /></ProGate>}
        </Route>
        <Route path="/leases/send/upload">
          {() => <ProGate featureName="Send a Lease"><UploadOwnLease /></ProGate>}
        </Route>
        <Route path="/leases/draft/:id">
          {() => <ProGate featureName="Lease Agreements"><LeasePreview /></ProGate>}
        </Route>

        {/* Admin only */}
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/stripe-smoke" component={AdminStripeSmoke} />
        <Route path="/admin/lease-templates" component={AdminLeaseTemplates} />

        {/* Tenant portal */}
        <Route path="/tenant/login" component={TenantLogin} />
        <Route path="/tenant/dashboard" component={TenantDashboard} />
        <Route path="/tenant/sign-lease/:id" component={TenantSignLease} />

        {/* Vendor response (public) */}
        <Route path="/vendor/respond/:id" component={VendorRespond} />

        {/* Affiliate program */}
        <Route path="/affiliate/signup" component={AffiliateSignup} />
        <Route path="/affiliate/dashboard" component={AffiliateDashboard} />

        {/* Creme Agent Network */}
        <Route path="/agents" component={AgentDirectory} />
        <Route path="/agent-guide" component={AgentGuide} />
        <Route path="/agents/:id" component={AgentProfile} />

        {/* In-app Pro guide */}
        <Route path="/pro-guide" component={ProGuide} />
        <Route path="/how-to-use" component={HowToUse} />

        {/* Contractor / Handyman Directory */}
        <Route path="/contractors" component={ContractorDirectory} />
        <Route path="/contractors/register" component={ContractorRegister} />
        <Route path="/contractors/:slug" component={ContractorProfile} />

        {/* FSBO & Renter tools */}
        <Route path="/fsbo-signup" component={FsboSignup} />
        <Route path="/join-waitlist" component={JoinWaitlist} />

        {/* iStay — Short-Term Rental */}
        <Route path="/istay" component={IStay} />
        <Route path="/istay/:id" component={IStay} />

        {/* Broker dashboard */}
        <Route path="/broker-dashboard" component={BrokerDashboard} />

        {/* Public marketing */}
        <Route path="/compare" component={Compare} />
        <Route path="/support" component={Support} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/pro" component={ProPage} />
        <Route path="/fees" component={FeeSchedule} />

        {/* Legal */}
        <Route path="/legal/privacy" component={Privacy} />
        <Route path="/legal/terms" component={Terms} />
        <Route path="/legal/ccpa" component={CCPA} />
        <Route path="/legal/fair-housing" component={FairHousing} />
        <Route path="/legal/cookies" component={CookiePolicy} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />

        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// Subdomains under leasely.net that are NOT tenant portals.
const RESERVED_SUBDOMAINS = ["www", "app", "api", "portal", "admin", "mail", "staging", "dev", "leasely"];

/**
 * When the app is loaded from a real portal subdomain (e.g. sunrise.leasely.net),
 * return that subdomain so we render the tenant portal directly — no path needed.
 * Requires wildcard DNS (*.leasely.net) + wildcard SSL to be configured at the
 * host; until then only leasely.net/portal/<name> is reachable.
 */
function getPortalSubdomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (!host.endsWith(".leasely.net")) return null;
  const label = host.slice(0, host.length - ".leasely.net".length);
  if (!label || label.includes(".") || RESERVED_SUBDOMAINS.includes(label)) return null;
  return label;
}

function App() {
  const portalSub = getPortalSubdomain();
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" />
          {portalSub ? (
            <Suspense fallback={<PageLoader />}>
              <PortalPage {...({ subdomainOverride: portalSub } as any)} />
            </Suspense>
          ) : (
            <Router />
          )}
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
