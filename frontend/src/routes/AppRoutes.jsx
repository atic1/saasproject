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
    return isSuperAdmin ? <Navigate to="/super-admin" replace /> : <Navigate to="/app/dashboard" replace />;
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
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 4. SUPERADMIN PLATFORM ROUTES (ADMIN PROTECTED) */}
      <Route path="/super-admin" element={<AdminProtectedRoute><DashboardLayout /></AdminProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        {/* Sub-routing handles dynamically inside DashboardHome.jsx via tab search-params */}
      </Route>

      {/* 5. WILDCARD CATCH-ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
