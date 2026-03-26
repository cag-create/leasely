import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProGate } from "./components/ProGate";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import MapViewPage from "./pages/MapView";
import ListProperty from "./pages/ListProperty";
import ListingDetail from "./pages/ListingDetail";
import Dashboard from "./pages/Dashboard";
import SavedListings from "./pages/SavedListings";
import Onboarding from "./pages/Onboarding";
import PortalPage from "./pages/PortalPage";
import RentPayment from "./pages/RentPayment";
import RentPaymentSuccess from "./pages/RentPaymentSuccess";
import WorkOrders from "./pages/WorkOrders";
import Accounting from "./pages/Accounting";
import CRM from "./pages/CRM";
import TenantLogin from "./pages/TenantLogin";
import TenantDashboard from "./pages/TenantDashboard";
import Support from "./pages/Support";
import Pricing from "./pages/Pricing";
import ProPage from "./pages/ProPage";
import ApartmentComplexes from "./pages/ApartmentComplexes";
import AdminPage from "./pages/AdminPage";
import RentalApplications from "./pages/RentalApplications";
import PublicApplication from "./pages/PublicApplication";
import ProSetup from "./pages/ProSetup";
import AffiliateSignup from "./pages/AffiliateSignup";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import LoginPage from "./pages/LoginPage";
import AgentDirectory from "./pages/AgentDirectory";
import AgentProfile from "./pages/AgentProfile";
import FsboSignup from "./pages/FsboSignup";
import JoinWaitlist from "./pages/JoinWaitlist";
import Compare from "./pages/Compare";
import BrokerDashboard from "./pages/BrokerDashboard";

function Router() {
  return (
    <Switch>
      {/* Auth */}
      <Route path="/login" component={LoginPage} />

      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/apply/:listingId" component={PublicApplication} />
      <Route path="/pro-setup" component={ProSetup} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/map" component={MapViewPage} />
      <Route path="/listing/:id" component={ListingDetail} />

      {/* Public portal pages */}
      <Route path="/portal/:subdomain" component={PortalPage} />

      {/* Tenant rent payment (public — tenants don't need Leasely accounts) */}
      <Route path="/pay/:id" component={RentPayment} />
      <Route path="/pay/:id/success" component={RentPaymentSuccess} />

      {/* Auth + Pro required — wrapped with ProGate */}
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/list-property" component={ListProperty} />
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

      {/* Admin only */}
      <Route path="/admin" component={AdminPage} />

      {/* Tenant portal (separate login system) */}
      <Route path="/tenant/login" component={TenantLogin} />
      <Route path="/tenant/dashboard" component={TenantDashboard} />

      {/* Affiliate program */}
      <Route path="/affiliate/signup" component={AffiliateSignup} />
      <Route path="/affiliate/dashboard" component={AffiliateDashboard} />

      {/* Creme Agent Network */}
      <Route path="/agents" component={AgentDirectory} />
      <Route path="/agents/:id" component={AgentProfile} />

      {/* FSBO & Renter tools */}
      <Route path="/fsbo-signup" component={FsboSignup} />
      <Route path="/join-waitlist" component={JoinWaitlist} />

      {/* Broker dashboard */}
      <Route path="/broker-dashboard" component={BrokerDashboard} />

      {/* Public marketing */}
      <Route path="/compare" component={Compare} />
      <Route path="/support" component={Support} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/pro" component={ProPage} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
