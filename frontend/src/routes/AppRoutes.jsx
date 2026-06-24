import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import Features from '../pages/public/Features';
import Pricing from '../pages/public/Pricing';
import Contact from '../pages/public/Contact';
import GymWebsite from '../pages/public/GymWebsite';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboard pages
import DashboardHome from '../pages/dashboard/DashboardHome';
import Customers from '../pages/dashboard/Customers';
import Bookings from '../pages/dashboard/Bookings';
import Payments from '../pages/dashboard/Payments';
import Reports from '../pages/dashboard/Reports';
import SettingsPage from '../pages/dashboard/Settings';
import GymWebsiteManager from '../pages/dashboard/GymWebsiteManager';
import AppCenter from '../pages/dashboard/AppCenter';

// Portal pages
import CustomerPortal from '../pages/portal/CustomerPortal';
import CustomerSpecificPortal from '../pages/portal/CustomerSpecificPortal';
import PaymentSuccess from '../pages/portal/PaymentSuccess';
import PaymentFailed from '../pages/portal/PaymentFailed';
import PaymentPending from '../pages/portal/PaymentPending';
import BusinessAuth from '../pages/portal/BusinessAuth';

// Super Admin pages
import SuperAdminLayout from '../components/SuperAdminLayout';
import SuperAdminDashboardPage from '../pages/SuperAdminDashboardPage';
import SuperAdminPendingPage from '../pages/SuperAdminPendingPage';
import SuperAdminBusinessesPage from '../pages/SuperAdminBusinessesPage';
import SuperAdminNotificationsPage from '../pages/SuperAdminNotificationsPage';
import SuperAdminSettingsPage from '../pages/SuperAdminSettingsPage';

// Protected Route Guard for general authenticated App pages
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Protected Route Guard for SaaS Super Admin pages specifically
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isSuperAdmin ? children : <Navigate to="/app/dashboard" replace />;
};

// Guest Guard to prevent logged-in users from viewing login/register screens
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  if (isAuthenticated) {
    return isSuperAdmin ? <Navigate to="/superadmin" replace /> : <Navigate to="/app/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. MARKETING / PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* 2. AUTHENTICATION ROUTES (GUEST PROTECTED) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      </Route>

      {/* 3. BUSINESS TENANTS APP ROUTES (PROTECTED) */}
      <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="customers" element={<Customers />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="gym-website" element={<GymWebsiteManager />} />
        <Route path="features" element={<AppCenter />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 4. SUPERADMIN PLATFORM ROUTES (ADMIN PROTECTED) */}
      <Route path="/superadmin" element={<AdminProtectedRoute><SuperAdminLayout /></AdminProtectedRoute>}>
        <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="dashboard"     element={<SuperAdminDashboardPage />} />
        <Route path="pending"       element={<SuperAdminPendingPage />} />
        <Route path="businesses"    element={<SuperAdminBusinessesPage />} />
        <Route path="notifications" element={<SuperAdminNotificationsPage />} />
        <Route path="settings"      element={<SuperAdminSettingsPage />} />
      </Route>
      <Route path="/super-admin" element={<Navigate to="/superadmin/dashboard" replace />} />

      {/* 5. CUSTOMER PORTAL & PAYMENTS CALLBACKS */}
      <Route path="/customer/:customerId/portal" element={<CustomerSpecificPortal />} />
      <Route path="/:slug/portal" element={<CustomerPortal />} />
      <Route path="/:slug/login" element={<BusinessAuth mode="login" />} />
      <Route path="/:slug/signup" element={<BusinessAuth mode="signup" />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/payment-pending" element={<PaymentPending />} />

      {/* 5.5. PUBLIC GYM WEBSITE */}
      <Route path="/:slug" element={<GymWebsite />} />

      {/* 6. WILDCARD CATCH-ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
