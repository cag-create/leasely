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

// ── Lazy loads (route-level code splitting) ───────────────────────────────────
const Home                = lazy(() => import("./pages/Home"));
const Marketplace         = lazy(() => import("./pages/Marketplace"));
const MapViewPage         = lazy(() => import("./pages/MapView"));
const ListProperty        = lazy(() => import("./pages/ListProperty"));
const ListingDetail       = lazy(() => import("./pages/ListingDetail"));
const Dashboard           = lazy(() => import("./pages/Dashboard"));
const SavedListings       = lazy(() => import("./pages/SavedListings"));
const Onboarding          = lazy(() => import("./pages/Onboarding"));
const PortalPage          = lazy(() => import("./pages/PortalPage"));
const RentPayment         = lazy(() => import("./pages/RentPayment"));
const RentPaymentSuccess  = lazy(() => import("./pages/RentPaymentSuccess"));
const WorkOrders          = lazy(() => import("./pages/WorkOrders"));
const Accounting          = lazy(() => import("./pages/Accounting"));
const CRM                 = lazy(() => import("./pages/CRM"));
const TenantLogin         = lazy(() => import("./pages/TenantLogin"));
const TenantDashboard     = lazy(() => import("./pages/TenantDashboard"));
const Support             = lazy(() => import("./pages/Support"));
const Pricing             = lazy(() => import("./pages/Pricing"));
const ProPage             = lazy(() => import("./pages/ProPage"));
const ApartmentComplexes  = lazy(() => import("./pages/ApartmentComplexes"));
const AdminPage           = lazy(() => import("./pages/AdminPage"));
const AdminStripeSmoke    = lazy(() => import("./pages/AdminStripeSmoke"));
const RentalApplications  = lazy(() => import("./pages/RentalApplications"));
const PublicApplication   = lazy(() => import("./pages/PublicApplication"));
const ProSetup            = lazy(() => import("./pages/ProSetup"));
const Welcome             = lazy(() => import("./pages/Welcome"));
const PortalSetup         = lazy(() => import("./pages/PortalSetup"));
const EditListing         = lazy(() => import("./pages/EditListing"));
const ImportListings      = lazy(() => import("./pages/ImportListings"));
const ImportTenants       = lazy(() => import("./pages/ImportTenants"));
const MyListings          = lazy(() => import("./pages/MyListings"));
const AffiliateSignup     = lazy(() => import("./pages/AffiliateSignup"));
const AffiliateDashboard  = lazy(() => import("./pages/AffiliateDashboard"));
const LoginPage           = lazy(() => import("./pages/LoginPage"));
const AgentDirectory      = lazy(() => import("./pages/AgentDirectory"));
const AgentProfile        = lazy(() => import("./pages/AgentProfile"));
const ContractorDirectory = lazy(() => import("./pages/ContractorDirectory"));
const ContractorProfile   = lazy(() => import("./pages/ContractorProfile"));
const ContractorRegister  = lazy(() => import("./pages/ContractorRegister"));
const FsboSignup          = lazy(() => import("./pages/FsboSignup"));
const JoinWaitlist        = lazy(() => import("./pages/JoinWaitlist"));
const IStay               = lazy(() => import("./pages/IStay"));
const Compare             = lazy(() => import("./pages/Compare"));
const BrokerDashboard     = lazy(() => import("./pages/BrokerDashboard"));
const FeeSchedule         = lazy(() => import("./pages/FeeSchedule"));
const Leases              = lazy(() => import("./pages/Leases"));
const VendorRespond       = lazy(() => import("./pages/VendorRespond"));
const TenantSignLease     = lazy(() => import("./pages/TenantSignLease"));
const Privacy             = lazy(() => import("./pages/Privacy"));
const Terms               = lazy(() => import("./pages/Terms"));
const CCPA                = lazy(() => import("./pages/CCPA"));
const FairHousing         = lazy(() => import("./pages/FairHousing"));
const CookiePolicy        = lazy(() => import("./pages/Cookies"));
const ForgotPassword      = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword       = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail         = lazy(() => import("./pages/VerifyEmail"));
const LeasePay            = lazy(() => import("./pages/LeasePay"));
const SendLease           = lazy(() => import("./pages/SendLease"));
const LeaseWizard         = lazy(() => import("./pages/LeaseWizard"));
const LeasePreview        = lazy(() => import("./pages/LeasePreview"));
const UploadOwnLease      = lazy(() => import("./pages/UploadOwnLease"));
const ProGuide            = lazy(() => import("./pages/ProGuide"));
const AgentGuide          = lazy(() => import("./pages/AgentGuide"));

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
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/marketplace/map" component={MapViewPage} />
        <Route path="/listing/:id" component={ListingDetail} />

        {/* Public portal pages */}
        <Route path="/portal/:subdomain" component={PortalPage} />

        {/* Tenant rent payment (public) */}
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
