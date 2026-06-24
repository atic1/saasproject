import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, LayoutDashboard, Users, Calendar, CreditCard, 
  BarChart3, Settings, ShieldAlert, LogOut, Briefcase, 
  Stethoscope, Dumbbell, Scissors, UserCheck, Shield, Globe, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isSuperAdmin, businessType } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Select matching icon for tenant types
  const getTenantLogo = () => {
    switch (businessType) {
      case 'gym':
        return <Dumbbell size={24} className="sidebar-vertical-icon accent-gym" />;
      case 'salon':
        return <Scissors size={24} className="sidebar-vertical-icon accent-salon" />;
      case 'clinic':
        return <Stethoscope size={24} className="sidebar-vertical-icon accent-clinic" />;
      default:
        return <Shield size={24} className="sidebar-vertical-icon admin-color" />;
    }
  };

  // Define sidebar items based on Role and Business Type
  const getSidebarLinks = () => {
    if (isSuperAdmin) {
      return [
        { label: 'SaaS Overview', path: '/super-admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Tenants Directory', path: '/super-admin?tab=tenants', icon: <Briefcase size={20} /> },
        { label: 'Operator Users', path: '/super-admin?tab=users', icon: <Users size={20} /> },
        { label: 'Global Revenue', path: '/super-admin?tab=revenue', icon: <CreditCard size={20} /> },
        { label: 'SaaS Analytics', path: '/super-admin?tab=analytics', icon: <BarChart3 size={20} /> },
        { label: 'System Settings', path: '/app/settings', icon: <Settings size={20} /> },
      ];
    }

    // Tenant-Specific layouts (Gym, Salon, Clinic)
    switch (businessType) {
      case 'gym':
        return [
          { label: 'Gym Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'Club Members', path: '/app/customers', icon: <Users size={20} /> },
          { label: 'Class Attendance', path: '/app/bookings', icon: <Calendar size={20} /> },
          { label: 'Gym Trainers', path: '/app/dashboard?tab=trainers', icon: <UserCheck size={20} /> },
          { label: 'Membership Plans', path: '/app/dashboard?tab=plans', icon: <Briefcase size={20} /> },
          { label: 'Offers & Promos', path: '/app/dashboard?tab=offers', icon: <Sparkles size={20} /> },
          { label: 'Fee Payments', path: '/app/payments', icon: <CreditCard size={20} /> },
          { label: 'Growth Reports', path: '/app/reports', icon: <BarChart3 size={20} /> },
          { label: 'Gym Website', path: '/app/gym-website', icon: <Globe size={20} /> },
          { label: 'App Center', path: '/app/features', icon: <LayoutGrid size={20} />, badge: 'NEW' },
          { label: 'Club Settings', path: '/app/settings', icon: <Settings size={20} /> },
        ];
      case 'salon':
        return [
          { label: 'Salon Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'Appointments Book', path: '/app/bookings', icon: <Calendar size={20} /> },
          { label: 'Salon Customers', path: '/app/customers', icon: <Users size={20} /> },
          { label: 'Stylists & Staff', path: '/app/dashboard?tab=staff', icon: <UserCheck size={20} /> },
          { label: 'Beauty Services', path: '/app/dashboard?tab=services', icon: <Scissors size={20} /> },
          { label: 'Bills & Checkout', path: '/app/payments', icon: <CreditCard size={20} /> },
          { label: 'Sales Reports', path: '/app/reports', icon: <BarChart3 size={20} /> },
          { label: 'Salon Settings', path: '/app/settings', icon: <Settings size={20} /> },
        ];
      case 'clinic':
        return [
          { label: 'Clinic Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'Patients Records', path: '/app/customers', icon: <Users size={20} /> },
          { label: 'Doctor Rota', path: '/app/dashboard?tab=doctors', icon: <UserCheck size={20} /> },
          { label: 'Clinic Appointments', path: '/app/bookings', icon: <Calendar size={20} /> },
          { label: 'Insurance & Billing', path: '/app/payments', icon: <CreditCard size={20} /> },
          { label: 'Medical Reports', path: '/app/reports', icon: <BarChart3 size={20} /> },
          { label: 'Clinic Settings', path: '/app/settings', icon: <Settings size={20} /> },
        ];
      default:
        return [
          { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'Customers', path: '/app/customers', icon: <Users size={20} /> },
          { label: 'Bookings', path: '/app/bookings', icon: <Calendar size={20} /> },
          { label: 'Payments', path: '/app/payments', icon: <CreditCard size={20} /> },
          { label: 'Reports', path: '/app/reports', icon: <BarChart3 size={20} /> },
          { label: 'Settings', path: '/app/settings', icon: <Settings size={20} /> },
        ];
    }
  };

  const links = getSidebarLinks();
  const themeClass = isSuperAdmin ? 'admin-theme' : `tenant-${businessType}`;

  return (
    <aside className={`dashboard-sidebar glass ${isOpen ? 'open' : ''} ${themeClass}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          {getTenantLogo()}
          <div className="sidebar-logo-text">
            <h2>{user?.businessName || 'SaaS App'}</h2>
            <span className="tenant-tag">{isSuperAdmin ? 'SaaS Master' : `${businessType} tenant`}</span>
          </div>
        </Link>
      </div>

      <nav className="sidebar-menu">
        <ul>
          {links.map((link, idx) => (
            <li key={idx}>
              <NavLink 
                to={link.path} 
                end={link.path === '/app/dashboard' || link.path === '/super-admin'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="link-icon">{link.icon}</span>
                <span className="link-text">{link.label}</span>
                {link.badge && (
                  <span className="link-badge">{link.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <img src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} alt="User avatar" className="user-avatar" />
          <div className="user-details">
            <h4>{user?.name || 'Operator'}</h4>
            <p>{user?.email || 'operator@sync.com'}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Sign Out">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Embedded Sidebar CSS */}
      <style>{`
        .dashboard-sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 90;
          display: flex;
          flex-direction: column;
          border-top: none;
          border-left: none;
          border-bottom: none;
          background: hsla(var(--bg-surface-frosted));
          transition: transform var(--transition-normal);
        }
        
        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid hsla(var(--border-frosted));
        }
        
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sidebar-vertical-icon {
          flex-shrink: 0;
        }
        .sidebar-vertical-icon.accent-gym { color: hsla(var(--accent-gym)); }
        .sidebar-vertical-icon.accent-salon { color: hsla(var(--accent-salon)); }
        .sidebar-vertical-icon.accent-clinic { color: hsla(var(--accent-clinic)); }
        .sidebar-vertical-icon.admin-color { color: hsla(var(--primary)); }
        
        .sidebar-logo-text h2 {
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.1;
          color: hsla(var(--text-main));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }
        .tenant-tag {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: hsla(var(--text-muted));
        }
        
        .sidebar-menu {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
        }
        .sidebar-menu ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.95rem;
          color: hsla(var(--text-body));
          transition: all var(--transition-fast);
        }
        
        .sidebar-link:hover {
          background-color: hsla(var(--text-muted), 0.08);
          color: hsla(var(--text-main));
        }
        
        /* Active Link States based on Tenant Custom Colors */
        .tenant-gym .sidebar-link.active {
          background-color: hsla(var(--accent-gym), 0.12);
          color: hsla(var(--accent-gym));
        }
        .tenant-salon .sidebar-link.active {
          background-color: hsla(var(--accent-salon), 0.12);
          color: hsla(var(--accent-salon));
        }
        .tenant-clinic .sidebar-link.active {
          background-color: hsla(var(--accent-clinic), 0.12);
          color: hsla(var(--accent-clinic));
        }
        .admin-theme .sidebar-link.active {
          background-color: hsla(var(--primary), 0.12);
          color: hsla(var(--primary));
        }
        
        .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .link-badge {
          margin-left: auto;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 2px 7px;
          border-radius: 999px;
          background: hsla(var(--accent-gym), 0.15);
          color: hsla(var(--accent-gym));
          text-transform: uppercase;
        }
        
        /* Sidebar Footer */
        .sidebar-footer {
          padding: 20px 16px;
          border-top: 1px solid hsla(var(--border-frosted));
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .sidebar-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          border: 1.5px solid hsla(var(--border));
        }
        .user-details h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: hsla(var(--text-main));
        }
        .user-details p {
          font-size: 0.75rem;
          color: hsla(var(--text-muted));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        
        .btn-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          border: 1px solid hsla(var(--border));
          background: transparent;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: hsla(var(--text-body));
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .btn-logout:hover {
          background-color: hsla(var(--primary), 0.08);
          color: hsla(var(--primary));
          border-color: hsla(var(--primary), 0.2);
        }
        
        @media (max-width: 1024px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
