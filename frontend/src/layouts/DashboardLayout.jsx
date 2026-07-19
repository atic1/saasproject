import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import DashboardNavbar from '../components/navbar/DashboardNavbar';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeBusiness, user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isPending = activeBusiness?.businessStatus === 'pending' || activeBusiness?.businessStatus === 'pending_verification';

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400 border border-amber-500/20">
            <Clock size={40} className="animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2">Awaiting Verification</h2>
          
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Thank you for registering <strong className="text-white">{activeBusiness?.businessName}</strong>! 
            Your registration is currently under review by our super administrators.
            We will notify you via email (<span className="text-purple-400 font-semibold">{user?.email || 'your registered email'}</span>) as soon as your account is verified.
          </p>

          <div className="bg-gray-950/50 rounded-2xl p-4 border border-gray-800/80 mb-6 text-left space-y-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Registration Summary</div>
            <div className="text-sm text-gray-300 flex justify-between">
              <span>Organization:</span>
              <span className="text-white font-medium">{activeBusiness?.businessName}</span>
            </div>
            <div className="text-sm text-gray-300 flex justify-between">
              <span>Type:</span>
              <span className="text-white font-medium capitalize">{activeBusiness?.businessType}</span>
            </div>
            <div className="text-sm text-gray-300 flex justify-between">
              <span>Status:</span>
              <span className="text-amber-400 font-bold capitalize">Pending Review</span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full py-3 px-6 rounded-xl font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all cursor-pointer border-none"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout-container">
      {/* Background glow layers */}
      <div className="radial-bg"></div>

      {/* Responsive Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar}></div>
      )}

      {/* Main Content Area */}
      <div className="dashboard-main-wrapper">
        <DashboardNavbar onMenuClick={toggleSidebar} />

        <main className="dashboard-content-area">
          <div className="dashboard-page-container animate-fade">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Embedded CSS for Dashboard Layout */}
      <style>{`
        .dashboard-layout-container {
          display: flex;
          min-height: 100vh;
        }
        
        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 85;
          animation: fadeIn var(--transition-fast) forwards;
        }
        
        .dashboard-main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 280px; /* Width of Sidebar */
          min-width: 0; /* Prevents overflow issues */
          transition: margin-left var(--transition-normal);
        }
        
        .dashboard-content-area {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          background-color: hsla(var(--bg-base), 0.2);
        }
        
        .dashboard-page-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @media (max-width: 1024px) {
          .dashboard-main-wrapper {
            margin-left: 0;
          }
          .dashboard-content-area {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
