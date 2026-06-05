import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Clock, Bell, Settings, LogOut,
  ChevronRight, Shield, Menu, X, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSuperAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({ pending: 0, notifications: 0 });

  useEffect(() => {
    if (!user || !isSuperAdmin) {
      navigate('/login', { replace: true });
    }
  }, [user, isSuperAdmin, navigate]);

  // Fetch badge counts
  useEffect(() => {
    if (!isSuperAdmin) return;
    const token = localStorage.getItem('saas_token');
    fetch('http://localhost:5000/api/superadmin/notifications', {
      headers: {
        'x-user-role': 'super_admin',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(r => r.json())
      .then(data => {
        const pending = data.pendingSignups?.length || 0;
        const unreadTickets = data.supportTickets?.filter(t => t.status === 'unread').length || 0;
        setBadges({ pending, notifications: pending + unreadTickets });
      })
      .catch(() => {});
  }, [isSuperAdmin, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Pending Approvals', to: '/superadmin/pending', icon: Clock, badge: badges.pending },
    { label: 'All Businesses', to: '/superadmin/businesses', icon: Building2 },
    { label: 'Notifications', to: '/superadmin/notifications', icon: Bell, badge: badges.notifications },
    { label: 'Settings', to: '/superadmin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-white font-semibold">Access Denied</p>
          <p className="text-gray-400 text-sm mt-1">You don't have permission to view this page.</p>
          <Link to="/login" className="mt-4 inline-block text-purple-400 hover:underline text-sm">Go to Login</Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-white text-sm leading-none">BizNepal</p>
                <p className="text-[10px] font-semibold text-purple-400 tracking-widest uppercase mt-0.5">Super Admin</p>
              </div>
            </div>
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, to, icon: Icon, badge }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive(to)
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} className={isActive(to) ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'} />
                {label}
              </span>
              <span className="flex items-center gap-1">
                {badge > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {isActive(to) && <ChevronRight size={14} className="text-purple-400" />}
              </span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="px-4 py-3 mb-3 rounded-xl bg-gray-800/50">
            <p className="text-xs text-gray-500 font-medium">Logged in as</p>
            <p className="text-sm text-white font-semibold">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 font-medium text-sm transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-black text-white text-sm">Super Admin</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
