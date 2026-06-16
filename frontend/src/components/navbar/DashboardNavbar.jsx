import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Menu, Sun, Moon, LogOut, Settings, 
  User, CheckCircle2, AlertCircle, HelpCircle, Sparkles, ChevronDown, Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardNavbar = ({ onMenuClick }) => {
  const { user, theme, toggleTheme, logout, isSuperAdmin, businessType, activeBusiness, setActiveBusiness } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBusinessSwitcher, setShowBusinessSwitcher] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock notifications based on businessType
  const getMockNotifications = () => {
    if (isSuperAdmin) {
      return [
        { id: 1, title: 'New Tenant Registered', time: '5m ago', body: 'Smile Dental Clinic successfully subscribed to the Growth Plan.', icon: <CheckCircle2 size={16} color="#10b981" /> },
        { id: 2, title: 'SaaS Revenue Alert', time: '1h ago', body: 'Monthly Recurring Revenue (MRR) hit NPR 200,000!', icon: <Sparkles size={16} color="#8b5cf6" /> }
      ];
    }
    switch (businessType) {
      case 'gym':
        return [
          { id: 1, title: 'Trainer Assigned', time: '2m ago', body: 'Trainer John assigned to 6 AM Morning Power Class.', icon: <CheckCircle2 size={16} color="#f97316" /> },
          { id: 2, title: 'Subscription Expiring', time: '1d ago', body: 'Member Mike Ross fee plan expires in 3 days.', icon: <AlertCircle size={16} color="#ef4444" /> }
        ];
      case 'salon':
        return [
          { id: 1, title: 'New Booking', time: '10m ago', body: 'Jane Smith booked a Hair Coloring for 2:00 PM today.', icon: <CheckCircle2 size={16} color="#ec4899" /> },
          { id: 2, title: 'Stock Alert', time: '3h ago', body: 'Loreal Conditioner stocks running below threshold.', icon: <AlertCircle size={16} color="#f59e0b" /> }
        ];
      case 'clinic':
        return [
          { id: 1, title: 'Appointment Booked', time: '1m ago', body: 'John Doe booked an Appointment with Dr. Marcus.', icon: <CheckCircle2 size={16} color="#10b981" /> },
          { id: 2, title: 'Lab Results Ready', time: '2h ago', body: 'MRI scan results for Patient Sarah uploaded.', icon: <CheckCircle2 size={16} color="#10b981" /> }
        ];
      default:
        return [
          { id: 1, title: 'Update Available', time: '1h ago', body: 'Platform v2.4.0 is now live.', icon: <Sparkles size={16} color="#6366f1" /> }
        ];
    }
  };

  const notifications = getMockNotifications();

  return (
    <header className="dashboard-topnav glass">
      <div className="topnav-left">
        <button className="sidebar-toggle-btn" onClick={onMenuClick} aria-label="Toggle Sidebar">
          <Menu size={22} />
        </button>

        {/* Global Search */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Type / to search members, bookings, and billing..." />
        </div>
      </div>

      <div className="topnav-right">
        {/* Quick Tenant Tag */}
        {/* Business Switcher Dropdown */}
        {!isSuperAdmin && user?.memberships && user.memberships.length > 0 && (
          <div className="topnav-dropdown-container">
            <button className={`business-switcher-btn badge-${businessType}`} onClick={() => { setShowBusinessSwitcher(!showBusinessSwitcher); setShowProfile(false); setShowNotifications(false); }}>
              <Building size={16} className="switcher-icon" />
              <span className="business-name-span">{activeBusiness?.businessName || user.businessName || 'Select Tenant'}</span>
              <ChevronDown size={14} className={`switcher-arrow ${showBusinessSwitcher ? 'open' : ''}`} />
            </button>
            {showBusinessSwitcher && (
              <div className="dropdown-panel business-panel glass animate-slide-down">
                <div className="dropdown-header">
                  <h3>Switch Tenant</h3>
                  <span className="count-tag">{user.memberships.length} Active</span>
                </div>
                <div className="dropdown-content scrollable">
                  {user.memberships.map((membership) => (
                    <button 
                      key={membership.businessId} 
                      className={`business-switcher-item ${activeBusiness?.businessId === membership.businessId ? 'active' : ''}`}
                      onClick={() => {
                        setActiveBusiness(membership);
                        setShowBusinessSwitcher(false);
                      }}
                    >
                      <div className="business-item-details">
                        <strong>{membership.businessName}</strong>
                        <span className={`pill-type type-${membership.businessType}`}>{membership.businessType.toUpperCase()}</span>
                      </div>
                      <span className="business-item-role">{membership.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Tenant Tag fallback for users without memberships */}
        {!isSuperAdmin && (!user?.memberships || user.memberships.length === 0) && (
          <span className={`tenant-banner-badge badge-${businessType}`}>
            {businessType.toUpperCase()} MODE
          </span>
        )}

        {/* Theme Toggle */}
        <button className="topnav-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <div className="topnav-dropdown-container">
          <button className="topnav-btn rel-pos" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} title="Notifications">
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-dot"></span>}
          </button>

          {showNotifications && (
            <div className="dropdown-panel notifications-panel glass animate-slide-down">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <span className="count-tag">{notifications.length} New</span>
              </div>
              <div className="dropdown-content scrollable">
                {notifications.map(notif => (
                  <div key={notif.id} className="notification-item">
                    <div className="notif-icon">{notif.icon}</div>
                    <div className="notif-details">
                      <h4>{notif.title}</h4>
                      <p>{notif.body}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Panel */}
        <div className="topnav-dropdown-container">
          <button className="avatar-btn" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}>
            <img src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} alt="User avatar" className="topnav-avatar" />
          </button>

          {showProfile && (
            <div className="dropdown-panel profile-panel glass animate-slide-down">
              <div className="profile-panel-header">
                <img src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} alt="Avatar" className="panel-avatar" />
                <div>
                  <h4>{user?.name}</h4>
                  <p>{user?.email}</p>
                </div>
              </div>
              <hr className="panel-divider" />
              <div className="profile-links">
                <button className="profile-panel-link" onClick={() => { navigate('/app/settings'); setShowProfile(false); }}>
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button className="profile-panel-link" onClick={() => { navigate('/app/settings'); setShowProfile(false); }}>
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>
                <button className="profile-panel-link" onClick={() => { setShowProfile(false); }}>
                  <HelpCircle size={16} />
                  <span>Help & Support</span>
                </button>
                <hr className="panel-divider" />
                <button className="profile-panel-link logout-link" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded topnav CSS */}
      <style>{`
        .dashboard-topnav {
          position: sticky;
          top: 0;
          height: 72px;
          border-top: none;
          border-left: none;
          border-right: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 80;
        }
        
        .topnav-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        
        .sidebar-toggle-btn {
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          color: hsla(var(--text-main));
        }
        
        .search-box {
          position: relative;
          width: 100%;
          max-width: 420px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: hsla(var(--text-muted));
        }
        .search-box input {
          width: 100%;
          height: 42px;
          padding-left: 44px;
          padding-right: 16px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background-color: hsla(var(--bg-base), 0.5);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: hsla(var(--text-main));
          outline: none;
          transition: all var(--transition-fast);
        }
        .search-box input:focus {
          border-color: hsla(var(--primary));
          background-color: hsla(var(--bg-surface));
          box-shadow: 0 0 0 3px hsla(var(--primary), 0.1);
        }
        
        .topnav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .topnav-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background: transparent;
          color: hsla(var(--text-body));
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .topnav-btn:hover {
          background-color: hsla(var(--text-muted), 0.08);
          color: hsla(var(--text-main));
          border-color: hsla(var(--text-muted), 0.2);
        }
        
        .rel-pos { position: relative; }
        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: hsla(var(--primary));
        }
        
        /* Dropdown panels */
        .topnav-dropdown-container {
          position: relative;
        }
        .dropdown-panel {
          position: absolute;
          top: 50px;
          right: 0;
          width: 320px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          z-index: 100;
        }
        .dropdown-header {
          padding: 16px 20px;
          border-bottom: 1px solid hsla(var(--border-frosted));
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dropdown-header h3 {
          font-size: 0.95rem;
          color: hsla(var(--text-main));
        }
        .count-tag {
          font-size: 0.75rem;
          font-weight: 700;
          background-color: hsla(var(--primary), 0.1);
          color: hsla(var(--primary));
          padding: 2px 8px;
          border-radius: 999px;
        }
        
        .dropdown-content {
          max-height: 280px;
        }
        .scrollable {
          overflow-y: auto;
        }
        
        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid hsla(var(--border-frosted));
          transition: background var(--transition-fast);
        }
        .notification-item:hover {
          background-color: hsla(var(--text-muted), 0.05);
        }
        .notif-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .notif-details h4 {
          font-size: 0.85rem;
          color: hsla(var(--text-main));
          margin-bottom: 4px;
        }
        .notif-details p {
          font-size: 0.78rem;
          color: hsla(var(--text-body));
          line-height: 1.4;
          margin-bottom: 6px;
        }
        .notif-time {
          font-size: 0.7rem;
          color: hsla(var(--text-muted));
        }
        
        /* Avatar & Profile Panel */
        .avatar-btn {
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .topnav-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          object-fit: cover;
          border: 1.5px solid hsla(var(--border));
          transition: border-color var(--transition-fast);
        }
        .avatar-btn:hover .topnav-avatar {
          border-color: hsla(var(--primary));
        }
        
        .profile-panel {
          width: 260px;
          padding: 16px;
        }
        .profile-panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
        }
        .panel-avatar {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          object-fit: cover;
        }
        .profile-panel-header h4 {
          font-size: 0.9rem;
          color: hsla(var(--text-main));
        }
        .profile-panel-header p {
          font-size: 0.75rem;
          color: hsla(var(--text-muted));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        
        .panel-divider {
          border: 0;
          border-top: 1px solid hsla(var(--border-frosted));
          margin: 8px 0;
        }
        
        .profile-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .profile-panel-link {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 0.88rem;
          color: hsla(var(--text-body));
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }
        .profile-panel-link:hover {
          background-color: hsla(var(--text-muted), 0.08);
          color: hsla(var(--text-main));
        }
        .logout-link:hover {
          background-color: hsla(var(--primary), 0.08);
          color: hsla(var(--primary));
        }
        
        /* Tenant tags */
        .tenant-banner-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          letter-spacing: 0.05em;
        }
        .badge-gym {
          background-color: hsla(var(--accent-gym), 0.1);
          color: hsla(var(--accent-gym));
        }
        .badge-salon {
          background-color: hsla(var(--accent-salon), 0.1);
          color: hsla(var(--accent-salon));
        }
        .badge-clinic {
          background-color: hsla(var(--accent-clinic), 0.1);
          color: hsla(var(--accent-clinic));
        }

        /* Switcher premium styling */
        .business-switcher-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 16px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background: transparent;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .business-switcher-btn:hover {
          background-color: hsla(var(--text-muted), 0.08);
          border-color: hsla(var(--text-muted), 0.2);
        }
        .business-switcher-btn.badge-gym {
          border-color: hsla(var(--accent-gym), 0.2);
          background-color: hsla(var(--accent-gym), 0.08);
          color: hsla(var(--accent-gym));
        }
        .business-switcher-btn.badge-salon {
          border-color: hsla(var(--accent-salon), 0.2);
          background-color: hsla(var(--accent-salon), 0.08);
          color: hsla(var(--accent-salon));
        }
        .business-switcher-btn.badge-clinic {
          border-color: hsla(var(--accent-clinic), 0.2);
          background-color: hsla(var(--accent-clinic), 0.08);
          color: hsla(var(--accent-clinic));
        }
        .switcher-arrow {
          transition: transform var(--transition-fast);
          opacity: 0.8;
        }
        .switcher-arrow.open {
          transform: rotate(180deg);
        }
        .business-name-span {
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .business-panel {
          width: 280px;
          top: 50px;
          right: 0;
          padding: 8px;
        }
        .business-switcher-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          gap: 12px;
        }
        .business-switcher-item:hover {
          background-color: hsla(var(--text-muted), 0.08);
        }
        .business-switcher-item.active {
          background-color: hsla(var(--primary), 0.08);
        }
        .business-item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .business-item-details strong {
          font-size: 0.88rem;
          color: hsla(var(--text-main));
        }
        .business-item-role {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: hsla(var(--border));
          color: hsla(var(--text-body));
        }
        .business-switcher-item.active .business-item-role {
          background-color: hsla(var(--primary));
          color: white;
        }
        
        .pill-type {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 3px;
          width: fit-content;
        }
        .pill-type.type-gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .pill-type.type-salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .pill-type.type-clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        
        @media (max-width: 1024px) {
          .sidebar-toggle-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .dashboard-topnav {
            padding: 0 16px;
          }
        }
        
        @media (max-width: 600px) {
          .search-box {
            display: none;
          }
          .tenant-banner-badge {
            display: none;
          }
          .business-switcher-btn {
            padding: 0 8px;
          }
          .business-name-span {
            max-width: 80px;
          }
        }
      `}</style>
    </header>
  );
};

export default DashboardNavbar;
