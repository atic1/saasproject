import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { toggleTheme, theme } = useAuth();

  return (
    <div className="auth-layout-container">
      {/* Background glow layers */}
      <div className="radial-bg"></div>

      {/* Auth Navbar (Simple) */}
      <header className="auth-header container">
        <Link to="/" className="auth-logo flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-black text-sm">BN</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-gray-900 dark:text-white text-[15px] tracking-tight">BizNepal</span>
            <span className="text-[9px] font-medium text-purple-500 tracking-widest uppercase text-left">SaaS Platform</span>
          </div>
        </Link>
        <div className="auth-header-actions">
          <button onClick={toggleTheme} className="theme-btn" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/" className="btn-back-link">
            <ArrowLeft size={16} />
            <span>Back to site</span>
          </Link>
        </div>
      </header>

      {/* Main card wrapper */}
      <main className="auth-main container">
        <div className="auth-card glass animate-slide-up">
          <Outlet />
        </div>
      </main>

      <footer className="auth-footer">
        <p>&copy; {new Date().getFullYear()} BizNepal. Empowering Nepalese local businesses.</p>
      </footer>

      {/* Embedded CSS for Auth Layout */}
      <style>{`
        .auth-layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          justify-content: space-between;
        }
        .auth-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }
        .auth-logo {
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
        }
        .auth-header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .btn-back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          color: hsla(var(--text-body));
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }
        .btn-back-link:hover {
          background-color: hsla(var(--text-muted), 0.1);
          color: hsla(var(--primary));
        }
        
        /* Auth Card styling */
        .auth-main {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding-top: 20px;
          padding-bottom: 40px;
        }
        .auth-card {
          width: 100%;
          max-width: 480px;
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: var(--shadow-premium);
        }
        
        .auth-footer {
          text-align: center;
          padding: 24px 0;
          font-size: 0.85rem;
          color: hsla(var(--text-muted));
          border-top: 1px solid hsla(var(--border-frosted));
        }
        
        @media (max-width: 500px) {
          .auth-card {
            padding: 24px 16px;
            border-radius: var(--radius-md);
            box-shadow: none;
            border: none;
            background: transparent;
            backdrop-filter: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
