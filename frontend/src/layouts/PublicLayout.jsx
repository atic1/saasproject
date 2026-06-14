import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import PublicNavbar from '../components/navbar/PublicNavbar';

const PublicLayout = () => {
  return (
    <div className="public-layout-container">
      {/* Background glow layers */}
      <div className="radial-bg"></div>

      {/* Sticky header */}
      <PublicNavbar />

      {/* Dynamic page content */}
      <div className="public-content">
        <Outlet />
      </div>

      {/* Detailed Premium Footer */}
      <footer className="public-footer glass">
        <div className="container footer-grid">
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-black text-sm">BN</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-gray-900 dark:text-white text-[15px] tracking-tight">BizNepal</span>
                <span className="text-[9px] font-medium text-purple-500 tracking-widest uppercase text-left">SaaS Platform</span>
              </div>
            </Link>
            <p className="footer-desc">
              The unified multi-tenant SaaS hub helping modern gyms, salons, and medical clinics run operations, schedules, clients, and automated billing with state of the art software tools.
            </p>
            <div className="social-links">
                

            </div>
          </div>

          <div className="footer-links-col">
            <h4>Products</h4>
            <ul>
              <li><Link to="/features">Gym Modules <ArrowUpRight size={12} /></Link></li>
              <li><Link to="/features">Salon Schedulers <ArrowUpRight size={12} /></Link></li>
              <li><Link to="/features">Medical Billing <ArrowUpRight size={12} /></Link></li>
              <li><Link to="/pricing">Pricing & Plans</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">SaaS Guides</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4>Contact Info</h4>
            <ul className="contact-list">
              <li>
                <MapPin size={16} />
                <span>100 Innovation Blvd, Kathmandu, Nepal</span>
              </li>
              <li>
                <Mail size={16} />
                <span>support@biznepal.com</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+977 1 44556677</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container footer-bottom-flex">
            <p>&copy; {new Date().getFullYear()} BizNepal Inc. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Security</a>
              <a href="#">Status</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Embedded CSS for Public Layout */}
      <style>{`
        .public-layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .public-content {
          flex: 1;
        }
        
        /* Footer styling */
        .public-footer {
          margin-top: 80px;
          border-left: none;
          border-right: none;
          border-bottom: none;
          padding-top: 60px;
          background: hsla(var(--bg-surface-frosted));
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(2, 1fr) 1.5fr;
          gap: 40px;
          padding-bottom: 40px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: hsla(var(--text-main));
          margin-bottom: 16px;
        }
        .logo-icon {
          color: hsla(var(--primary));
        }
        .footer-desc {
          color: hsla(var(--text-body));
          font-size: 0.95rem;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .social-links {
          display: flex;
          gap: 12px;
        }
        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background-color: hsla(var(--text-muted), 0.1);
          color: hsla(var(--text-body));
          transition: all var(--transition-fast);
        }
        .social-icon:hover {
          background-color: hsla(var(--primary));
          color: #fff;
          transform: translateY(-2px);
        }
        
        .footer-links-col h4, .footer-contact-col h4 {
          font-size: 1rem;
          color: hsla(var(--text-main));
          margin-bottom: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .footer-links-col ul, .footer-contact-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links-col a {
          color: hsla(var(--text-body));
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .footer-links-col a:hover {
          color: hsla(var(--primary));
          transform: translateX(4px);
        }
        
        .contact-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: hsla(var(--text-body));
          font-size: 0.95rem;
        }
        .contact-list svg {
          color: hsla(var(--primary));
          flex-shrink: 0;
          margin-top: 3px;
        }
        
        /* Footer Bottom */
        .footer-bottom {
          padding: 24px 0;
          border-top: 1px solid hsla(var(--border-frosted));
        }
        .footer-bottom-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          color: hsla(var(--text-muted));
        }
        .footer-bottom-links {
          display: flex;
          gap: 20px;
        }
        .footer-bottom-links a:hover {
          color: hsla(var(--primary));
        }
        
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand-col {
            grid-column: span 2;
          }
        }
        
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-brand-col {
            grid-column: span 1;
          }
          .footer-bottom-flex {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;
