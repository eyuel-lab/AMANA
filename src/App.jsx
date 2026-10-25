import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import RequireRole from '@/components/common/RequireRole';
import PublicLayout from '@/components/site/PublicLayout';
import AppShell from '@/components/app/AppShell';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import VerifyAccount from '@/pages/VerifyAccount';

import Home from '@/pages/Home';
import Marketplace from '@/pages/Marketplace';
import Category from '@/pages/Category';
import Search from '@/pages/Search';
import ProductDetail from '@/pages/ProductDetail';
import HowItWorks from '@/pages/HowItWorks';
import OwnershipCheck from '@/pages/OwnershipCheck';
import Safety from '@/pages/Safety';
import About from '@/pages/About';
import Help from '@/pages/Help';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';

import BuyerDashboard from '@/pages/buyer/BuyerDashboard';
import BuyerWishlist from '@/pages/buyer/Wishlist';
import Cart from '@/pages/buyer/Cart';
import Checkout from '@/pages/buyer/Checkout';
import BuyerOrders from '@/pages/buyer/Orders';
import BuyerOrderDetail from '@/pages/buyer/OrderDetail';
import BuyerRegistry from '@/pages/buyer/BuyerRegistry';
import BuyerNotifications from '@/pages/buyer/Notifications';
import BuyerSettings from '@/pages/buyer/Settings';

import Registry from '@/pages/registry/Registry';
import RegisterProperty from '@/pages/registry/RegisterProperty';
import RegistryDetail from '@/pages/registry/RegistryDetail';
import Certificate from '@/pages/registry/Certificate';
import Transfer from '@/pages/registry/Transfer';

import ProtectionReport from '@/pages/protection/ProtectionReport';
import ProtectionReports from '@/pages/protection/ProtectionReports';
import ProtectionReportDetail from '@/pages/protection/ProtectionReportDetail';
import Recovery from '@/pages/protection/Recovery';

import SellerDashboard from '@/pages/seller/SellerDashboard';
import SellerListings from '@/pages/seller/Listings';
import ListingEditor from '@/pages/seller/ListingEditor';
import SellerOrders from '@/pages/seller/Orders';
import SellerOrderDetail from '@/pages/seller/OrderDetail';
import SellerVerification from '@/pages/seller/Verification';
import SellerAnalytics from '@/pages/seller/Analytics';
import SellerPayouts from '@/pages/seller/Payouts';
import SellerSettings from '@/pages/seller/Settings';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminVerification from '@/pages/admin/AdminVerification';
import AdminListings from '@/pages/admin/AdminListings';
import AdminRegistry from '@/pages/admin/AdminRegistry';
import AdminReports from '@/pages/admin/AdminReports';
import AdminDisputes from '@/pages/admin/AdminDisputes';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminIntegrations from '@/pages/admin/AdminIntegrations';
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs';

import InvestigatorDashboard from '@/pages/investigator/InvestigatorDashboard';
import InvestigatorCases from '@/pages/investigator/InvestigatorCases';
import CaseDetail from '@/pages/investigator/CaseDetail';
import InvestigatorReports from '@/pages/investigator/InvestigatorReports';

import AuditorDashboard from '@/pages/auditor/AuditorDashboard';
import AuditorLogs from '@/pages/auditor/AuditorLogs';

const AuthenticatedApp = () => {
    const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

    // Show loading spinner while checking app public settings or auth
    if (isLoadingPublicSettings || isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Handle authentication errors
    if (authError) {
        if (authError.type === 'user_not_registered') {
            return
            <UserNotRegisteredError />;
        } else if (authError.type === 'auth_required') {
            // Redirect to login automatically
            navigateToLogin();
            return null;
        }
    }

    // Render the main app
    return (
        <Routes>
            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-account" element={<VerifyAccount />} />

            {/* Public site */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/category/:category" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/ownership-check" element={<OwnershipCheck />} />
                <Route path="/safety" element={<Safety />} />
                <Route path="/about" element={<About />} />
                <Route path="/help" element={<Help />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/recovery" element={<Recovery />} />
            </Route>

            {/* Authenticated application */}
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
                <Route element={<AppShell />}>
                    <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                    <Route path="/buyer/wishlist" element={<BuyerWishlist />} />
                    <Route path="/buyer/cart" element={<Cart />} />
                    <Route path="/buyer/checkout" element={<Checkout />} />
                    <Route path="/buyer/orders" element={<BuyerOrders />} />
                    <Route path="/buyer/orders/:id" element={<BuyerOrderDetail />} />
                    <Route path="/buyer/registry" element={<BuyerRegistry />} />
                    <Route path="/buyer/registry/:id" element={<RegistryDetail />} />
                    <Route path="/buyer/notifications" element={<BuyerNotifications />} />
                    <Route path="/buyer/settings" element={<BuyerSettings />} />

                    <Route path="/registry" element={<Registry />} />
                    <Route path="/registry/register-property" element={<RegisterProperty />} />
                    <Route path="/registry/property/:id" element={<RegistryDetail />} />
                    <Route path="/registry/certificate/:id" element={<Certificate />} />
                    <Route path="/registry/transfer/:id" element={<Transfer />} />

                    <Route path="/protection/report" element={<ProtectionReport />} />
                    <Route path="/protection/reports" element={<ProtectionReports />} />
                    <Route path="/protection/report/:id" element={<ProtectionReportDetail />} />

                    <Route path="/seller/dashboard" element={<SellerDashboard />} />
                    <Route path="/seller/listings" element={<SellerListings />} />
                    <Route path="/seller/listings/new" element={<ListingEditor />} />
                    <Route path="/seller/listings/:id/edit" element={<ListingEditor />} />
                    <Route path="/seller/orders" element={<SellerOrders />} />
                    <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
                    <Route path="/seller/verification" element={<SellerVerification />} />
                    <Route path="/seller/analytics" element={<SellerAnalytics />} />
                    <Route path="/seller/payouts" element={<SellerPayouts />} />
                    <Route path="/seller/settings" element={<SellerSettings />} />

                    <Route path="/investigator/dashboard" element={<RequireRole allow={["investigator", "admin"]}>
                        <InvestigatorDashboard />
                    </RequireRole>} />
                    <Route path="/investigator/cases" element={<RequireRole allow={["investigator", "admin"]}>
                        <InvestigatorCases />
                    </RequireRole>} />
                    <Route path="/investigator/cases/:id" element={<RequireRole allow={["investigator", "admin"]}>
                        <CaseDetail />
                    </RequireRole>} />
                    <Route path="/investigator/reports" element={<RequireRole allow={["investigator", "admin"]}>
                        <InvestigatorReports />
                    </RequireRole>} />

                    <Route path="/auditor/dashboard" element={<RequireRole allow={["auditor", "admin"]}>
                        <AuditorDashboard />
                    </RequireRole>} />
                    <Route path="/auditor/logs" element={<RequireRole allow={["auditor", "admin"]}>
                        <AuditorLogs />
                    </RequireRole>} />

                    <Route path="/admin/dashboard" element={<RequireRole allow={["admin"]}>
                        <AdminDashboard />
                    </RequireRole>} />
                    <Route path="/admin/users" element={<RequireRole allow={["admin"]}>
                        <AdminUsers />
                    </RequireRole>} />
                    <Route path="/admin/verification" element={<RequireRole allow={["reviewer", "admin"]}>
                        <AdminVerification />
                    </RequireRole>} />
                    <Route path="/admin/listings" element={<RequireRole allow={["reviewer", "admin"]}>
                        <AdminListings />
                    </RequireRole>} />
                    <Route path="/admin/registry" element={<RequireRole allow={["reviewer", "admin"]}>
                        <AdminRegistry />
                    </RequireRole>} />
                    <Route path="/admin/reports" element={<RequireRole allow={["reviewer", "investigator", "admin"
                    ]}>
                        <AdminReports />
                    </RequireRole>} />
                    <Route path="/admin/disputes" element={<RequireRole allow={["admin"]}>
                        <AdminDisputes />
                    </RequireRole>} />
                    <Route path="/admin/orders" element={<RequireRole allow={["admin"]}>
                        <AdminOrders />
                    </RequireRole>} />
                    <Route path="/admin/audit-logs" element={<RequireRole allow={["admin"]}>
                        <AdminAuditLogs />
                    </RequireRole>} />
                    <Route path="/admin/integrations" element={<RequireRole allow={["admin"]}>
                        <AdminIntegrations />
                    </RequireRole>} />
                    <Route path="/admin/settings" element={<RequireRole allow={["admin"]}>
                        <AdminSettings />
                    </RequireRole>} />
                </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};


function App() {

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
                <Router>
                    <ScrollToTop />
                    <AuthenticatedApp />
                </Router>
                <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}

export default App