import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, toggleTheme, theme } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky-nav">
      <div className="container nav-wrapper">
        <Link to="/" className="nav-logo flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-black text-sm">BN</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-gray-900 dark:text-white text-[15px] tracking-tight">BizNepal</span>
            <span className="text-[9px] font-medium text-purple-500 tracking-widest uppercase">SaaS Platform</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links-desktop">
          <Link to="/features" className={`nav-link ${isActive('/features') ? 'active' : ''}`}>Features</Link>
          <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}>Pricing</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
        </div>

        {/* Desktop CTA */}
        <div className="nav-ctas-desktop">
          <button onClick={toggleTheme} className="theme-btn" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {isAuthenticated ? (
            <Link 
              to={user?.role === 'superadmin' ? '/super-admin' : '/app/dashboard'} 
              className="btn btn-primary btn-nav"
            >
              Go to App <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-login-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-nav">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="nav-mobile-buttons">
          <button onClick={toggleTheme} className="theme-btn" style={{ marginRight: '8px' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-menu-drawer glass animate-slide-down">
          <div className="mobile-links">
            <Link to="/features" className="mobile-link" onClick={() => setIsOpen(false)}>Features</Link>
            <Link to="/pricing" className="mobile-link" onClick={() => setIsOpen(false)}>Pricing</Link>
            <Link to="/contact" className="mobile-link" onClick={() => setIsOpen(false)}>Contact</Link>
            <hr className="mobile-divider" />
            {isAuthenticated ? (
              <Link 
                to={user?.role === 'superadmin' ? '/super-admin' : '/app/dashboard'} 
                className="btn btn-primary"
                onClick={() => setIsOpen(false)}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Go to App <ArrowRight size={16} />
              </Link>
            ) : (
              <div className="mobile-ctas">
                <Link to="/login" className="mobile-login-btn" onClick={() => setIsOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded CSS for Public Navbar */}
      <style>{`
        .sticky-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 72px;
          display: flex;
          align-items: center;
          transition: background var(--transition-normal);
        }
        .nav-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: hsla(var(--text-main));
        }
        .logo-icon {
          color: hsla(var(--primary));
          animation: pulseGlow 3s infinite ease-in-out;
        }
        .nav-links-desktop {
          display: flex;
          gap: 32px;
        }
        .nav-link {
          font-weight: 600;
          font-size: 0.95rem;
          color: hsla(var(--text-body));
          position: relative;
          padding: 8px 0;
        }
        .nav-link:hover, .nav-link.active {
          color: hsla(var(--primary));
        }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: hsla(var(--primary));
          transition: width var(--transition-normal);
        }
        .nav-link:hover::after, .nav-link.active::after {
          width: 100%;
        }
        .nav-ctas-desktop {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-login-link {
          font-weight: 600;
          color: hsla(var(--text-body));
        }
        .nav-login-link:hover {
          color: hsla(var(--primary));
        }
        .theme-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.3rem;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--transition-fast);
        }
        .theme-btn:hover {
          background-color: hsla(var(--text-muted), 0.1);
        }
        .btn-nav {
          padding: 8px 16px;
          font-size: 0.9rem;
        }
        .nav-mobile-buttons {
          display: none;
        }
        .mobile-toggle {
          background: transparent;
          border: none;
          color: hsla(var(--text-main));
          cursor: pointer;
        }
        
        /* Mobile Menu Drawer */
        .mobile-menu-drawer {
          position: absolute;
          top: 72px;
          left: 0;
          right: 0;
          border-top: none;
          border-left: none;
          border-right: none;
          padding: 20px 24px;
          box-shadow: var(--shadow-lg);
        }
        .mobile-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mobile-link {
          font-weight: 600;
          font-size: 1.1rem;
          color: hsla(var(--text-main));
          padding: 8px 0;
        }
        .mobile-divider {
          border: 0;
          border-top: 1px solid hsla(var(--border));
        }
        .mobile-ctas {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-login-btn {
          display: flex;
          justify-content: center;
          font-weight: 600;
          padding: 10px 0;
          color: hsla(var(--text-main));
          border: 1px solid hsla(var(--border));
          border-radius: var(--radius-md);
        }
        
        @media (max-width: 768px) {
          .nav-links-desktop, .nav-ctas-desktop {
            display: none;
          }
          .nav-mobile-buttons {
            display: flex;
            align-items: center;
          }
        }
      `}</style>
    </nav>
  );
};

export default PublicNavbar;
