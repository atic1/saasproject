import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import DashboardNavbar from '../components/navbar/DashboardNavbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

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
