import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Play, Check, ShieldCheck, 
  ChevronDown, Dumbbell, Scissors, Stethoscope, 
  BarChart3, Users, Clock, Zap 
} from 'lucide-react';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Business Category Cards Data
  const categories = [
    {
      title: "Gym Management",
      icon: <Dumbbell className="category-icon gym" />,
      desc: "Track member attendance, automate monthly membership payments, manage professional trainers, and optimize gym class schedules.",
      badge: "Gyms & Studios",
      accent: "gym"
    },
    {
      title: "Salon & Spa Operations",
      icon: <Scissors className="category-icon salon" />,
      desc: "Premium booking book with stylists, automatic SMS/email reminders, custom service menus, and detailed checkout invoicing.",
      badge: "Salons & Spas",
      accent: "salon"
    },
    {
      title: "Medical Clinics Hub",
      icon: <Stethoscope className="category-icon clinic" />,
      desc: "Manage patients medical records securely, coordinate doctor shifts, simplify billing/insurance, and record consult notes.",
      badge: "Health Clinics",
      accent: "clinic"
    }
  ];

  // Mock FAQs
  const faqs = [
    { q: "Is BizNepal multiple separate apps?", a: "No! BizNepal is a single, unified enterprise-level software platform. Depending on your logged-in profile and business configuration, the system automatically shifts its layouts, databases, sidebars, and modules to serve either a Gym, Salon, Clinic, or SaaS Super Admin." },
    { q: "Can I manage multiple business branches?", a: "Absolutely. BizNepal has robust multi-tenant architectures built at its core. You can run one branch or one hundred branches, tracking individual analytics while aggregating global statistics at the master owner level." },
    { q: "Is my tenant database secure?", a: "Security is our highest priority. All patient data, member records, bank invoices, and staff rosters are strongly isolated, encrypted at rest, and served under high-level SSL and JWT authentication standards." },
    { q: "Do you charge extra for scheduling tools?", a: "No, all core modules (scheduler, CRM, staff attendance, invoicing, and basic growth reports) are included in our standard pricing plans, making it easy to grow without hidden fees." }
  ];

  return (
    <div className="landing-page animate-fade">
      {/* 1. HERO SECTION */}
      <section className="hero-section container">
        <div className="hero-content">
          <div className="hero-badge glass">
            <Sparkles size={16} className="text-primary" />
            <span>Introducing BizNepal v2.4.0</span>
          </div>
          <h1>
            One Premium Software. <br />
            <span className="gradient-text">Any Local Business.</span>
          </h1>
          <p className="hero-subtitle">
            A state-of-the-art multi-tenant hub engineered to run operations, calendars, rosters, clients, and automated invoicing for Gyms, Salons, Clinics, and modern SaaS networks.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-hero">
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-hero">
              <Play size={18} />
              <span>Watch Live Demo</span>
            </Link>
          </div>
          <div className="hero-social-proof">
            <span>Trusted by 4,500+ local businesses worldwide</span>
          </div>
        </div>

        {/* Hero Interactive App Preview */}
        <div className="hero-preview-wrapper animate-slide-up">
          <div className="preview-chrome glass">
            <div className="chrome-header">
              <div className="chrome-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="chrome-search">
                <span>app.biznepal.com/dashboard</span>
              </div>
            </div>
            <div className="chrome-body">
              {/* Simulated Dashboard layout to WOW users */}
              <div className="sim-dashboard">
                <div className="sim-sidebar">
                  <div className="sim-logo-block">
                    <Sparkles size={14} color="#6366f1" />
                    <span>FitZone Gym</span>
                  </div>
                  <div className="sim-links">
                    <span className="sim-link active">Dashboard</span>
                    <span className="sim-link">Club Members</span>
                    <span className="sim-link">Class Schedule</span>
                    <span className="sim-link">Trainer Roster</span>
                    <span className="sim-link">Billing & Fees</span>
                  </div>
                </div>
                <div className="sim-main">
                  <div className="sim-header">
                    <h4>Gym Analytics Overview</h4>
                    <span className="sim-badge">Pro Active Plan</span>
                  </div>
                  <div className="sim-grid">
                    <div className="sim-card">
                      <span className="card-lbl">Active Members</span>
                      <h3>120</h3>
                      <span className="card-trend text-success">↑ 8.2%</span>
                    </div>
                    <div className="sim-card">
                      <span className="card-lbl">Monthly Revenue</span>
                      <h3>NPR 50,000</h3>
                      <span className="card-trend text-success">↑ 12.4%</span>
                    </div>
                    <div className="sim-card">
                      <span className="card-lbl">Gate Attendance</span>
                      <h3>94%</h3>
                      <span className="card-trend text-muted">Stable</span>
                    </div>
                  </div>
                  {/* Miniature live chart projection */}
                  <div className="sim-chart-card">
                    <div className="chart-title">Weekly Attendance Rate</div>
                    <div className="chart-bars">
                      <div className="chart-bar-container"><div className="chart-bar" style={{height: '40%'}}></div><span>Mon</span></div>
                      <div className="chart-bar-container"><div className="chart-bar" style={{height: '65%'}}></div><span>Tue</span></div>
                      <div className="chart-bar-container"><div className="chart-bar" style={{height: '85%'}}></div><span>Wed</span></div>
                      <div className="chart-bar-container"><div className="chart-bar" style={{height: '50%'}}></div><span>Thu</span></div>
                      <div className="chart-bar-container"><div className="chart-bar" style={{height: '95%'}}></div><span>Fri</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BUSINESS CATEGORIES SECTION */}
      <section className="categories-section container">
        <div className="section-header text-center">
          <span className="section-label">Target Verticals</span>
          <h2>Tailored Modules for Diverse Niches</h2>
          <p>We do not deliver weak generic forms. BizNepal automatically remaps all database entities, sidebar links, and views depending on your category.</p>
        </div>

        <div className="grid-cols-3 category-grid">
          {categories.map((cat, idx) => (
            <div key={idx} className={`category-card glass card-${cat.accent}`}>
              <div className="cat-header">
                <span className="cat-badge">{cat.badge}</span>
                {cat.icon}
              </div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
              <Link to="/features" className="cat-link">
                <span>Explore vertical features</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PREMIUM ANALYTICS PREVIEW SECTION */}
      <section className="analytics-preview-section container">
        <div className="analytics-wrapper glass">
          <div className="analytics-text-col">
            <span className="section-label">State-of-the-Art Insights</span>
            <h2>Run Your Business on Live Data Analytics</h2>
            <p>
              Forget manually calculating monthly rosters, accounting ledger receipts, or stylist sales margins. BizNepal calculates and visualizes key metrics automatically.
            </p>
            <ul className="insights-list">
              <li>
                <div className="check-bullet"><Check size={16} /></div>
                <span>**Real-time MRR Tracking** – Monitor active collections and subscriptions automatically.</span>
              </li>
              <li>
                <div className="check-bullet"><Check size={16} /></div>
                <span>**Attendance heatmaps** – Spot check-in peak hours and manage rosters accordingly.</span>
              </li>
              <li>
                <div className="check-bullet"><Check size={16} /></div>
                <span>**Automated checkout** – Seamless invoicing with split tax, payment links, and discounts.</span>
              </li>
            </ul>
            <Link to="/pricing" className="btn btn-primary" style={{ marginTop: '24px' }}>
              See Pricing Plans
            </Link>
          </div>

          <div className="analytics-card-col">
            {/* Display premium visual card */}
            <div className="viz-card glass">
              <div className="viz-header">
                <BarChart3 size={20} className="text-primary" />
                <h4>Revenue Projection</h4>
                <span className="viz-pill">Live Feed</span>
              </div>
              <div className="viz-amount">NPR 200,000 <span className="trend">+15%</span></div>
              <p className="viz-subtitle">Aggregated multi-tenant platform collection this month</p>
              <div className="viz-chart-mock">
                <div className="mock-grid-line"></div>
                <div className="mock-grid-line"></div>
                <div className="mock-grid-line"></div>
                <div className="mock-line-path-container">
                  {/* Dynamic aesthetic vector wave */}
                  <svg viewBox="0 0 300 100" className="mock-line-svg">
                    <path d="M 0 80 Q 50 30 100 60 T 200 20 T 300 10" fill="none" stroke="url(#indigo-grad)" strokeWidth="3" />
                    <defs>
                      <linearGradient id="indigo-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="testimonials-section container">
        <div className="section-header text-center">
          <span className="section-label">Success Stories</span>
          <h2>Loved by Modern Owners</h2>
        </div>

        <div className="grid-cols-3 testimonial-grid">
          <div className="testimonial-card glass">
            <p>"Before BizNepal, we were chasing gym fee renewals on paper notebooks. Now attendance, gate control, and fee receipts are fully synced. Outstanding!"</p>
            <div className="testifier-info">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Alex Rivera" />
              <div>
                <h4>Alex Rivera</h4>
                <span>Founder, FitZone Gym</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card glass">
            <p>"Having our patient logs, doctor rotas, and lab billings in one premium dashboard has cut admin overhead by 40%. The medical layout is exceptionally clean."</p>
            <div className="testifier-info">
              <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80" alt="Dr. Marcus" />
              <div>
                <h4>Dr. Marcus Vance</h4>
                <span>Chief Surgeon, Smile Dental</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card glass">
            <p>"Our stylists can immediately check their appointment books on mobile. The glassmorphic design looks premium, making our brand look modern."</p>
            <div className="testifier-info">
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80" alt="Chloe Vane" />
              <div>
                <h4>Chloe Vane</h4>
                <span>Director, Glow Salon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SUMMARY CTA */}
      <section className="pricing-cta-section container">
        <div className="pricing-cta-card glass">
          <div className="pricing-cta-text">
            <h2>Ready to Transform Operations?</h2>
            <p>Start free today. Switch verticals seamlessly, invite staff, configure your subscription plans, and explore the SaaS power.</p>
          </div>
          <div className="pricing-cta-actions">
            <Link to="/register" className="btn btn-primary btn-hero">Start Free Trial</Link>
            <Link to="/pricing" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>View Pricing</Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="faq-section container">
        <div className="section-header text-center">
          <span className="section-label">FAQ</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-wrapper">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`faq-item glass ${activeFaq === idx ? 'active' : ''}`} onClick={() => toggleFaq(idx)}>
              <div className="faq-question">
                <h3>{faq.q}</h3>
                <ChevronDown size={20} className="faq-chevron" />
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Embedded CSS for Landing Page */}
      <style>{`
        .landing-page {
          padding-top: 60px;
        }
        
        .text-center { text-align: center; }
        .text-primary { color: hsla(var(--primary)); }
        
        .section-label {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: hsla(var(--primary));
          margin-bottom: 12px;
        }
        .section-header {
          margin-bottom: 60px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }
        .section-header p {
          color: hsla(var(--text-body));
          font-size: 1.1rem;
        }
        
        /* --- HERO SECTION --- */
        .hero-section {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
          padding-top: 40px;
          padding-bottom: 80px;
        }
        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          color: hsla(var(--text-body));
          margin-bottom: 24px;
        }
        .hero-section h1 {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .gradient-text {
          background: linear-gradient(to right, hsla(var(--primary)), hsla(var(--secondary)));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          color: hsla(var(--text-body));
          line-height: 1.6;
          margin-bottom: 36px;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 30px;
          width: 100%;
        }
        .btn-hero {
          padding: 14px 28px;
          font-size: 1rem;
        }
        .hero-social-proof {
          font-size: 0.85rem;
          color: hsla(var(--text-muted));
          font-weight: 600;
        }
        
        /* Chrome Preview box */
        .hero-preview-wrapper {
          width: 100%;
        }
        .preview-chrome {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-premium);
        }
        .chrome-header {
          height: 38px;
          background-color: hsla(var(--text-muted), 0.05);
          border-bottom: 1px solid hsla(var(--border-frosted));
          display: flex;
          align-items: center;
          padding: 0 16px;
          position: relative;
        }
        .chrome-dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot-red { background-color: #ef4444; }
        .dot-yellow { background-color: #f59e0b; }
        .dot-green { background-color: #10b981; }
        
        .chrome-search {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          background-color: hsla(var(--bg-base));
          padding: 3px 24px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: hsla(var(--text-muted));
          border: 1px solid hsla(var(--border-frosted));
        }
        .chrome-body {
          background-color: hsla(var(--bg-surface));
          height: 320px;
          padding: 16px;
        }
        
        /* Sim dashboard */
        .sim-dashboard {
          display: flex;
          height: 100%;
          gap: 16px;
        }
        .sim-sidebar {
          width: 110px;
          border-right: 1px solid hsla(var(--border));
          padding-right: 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sim-logo-block {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 800;
          color: hsla(var(--text-main));
        }
        .sim-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sim-link {
          font-size: 0.65rem;
          font-weight: 700;
          color: hsla(var(--text-muted));
          padding: 6px;
          border-radius: 4px;
        }
        .sim-link.active {
          background-color: hsla(var(--accent-gym), 0.1);
          color: hsla(var(--accent-gym));
        }
        .sim-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sim-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sim-header h4 { font-size: 0.85rem; }
        .sim-badge {
          font-size: 0.6rem;
          font-weight: 700;
          background-color: hsla(var(--primary), 0.1);
          color: hsla(var(--primary));
          padding: 2px 8px;
          border-radius: 4px;
        }
        .sim-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .sim-card {
          border: 1px solid hsla(var(--border));
          border-radius: 6px;
          padding: 10px;
          background-color: hsla(var(--bg-base), 0.5);
        }
        .card-lbl { font-size: 0.55rem; color: hsla(var(--text-muted)); display: block; margin-bottom: 2px; }
        .sim-card h3 { font-size: 0.9rem; margin-bottom: 2px; }
        .card-trend { font-size: 0.5rem; font-weight: 700; }
        .text-success { color: #10b981; }
        
        .sim-chart-card {
          border: 1px solid hsla(var(--border));
          border-radius: 6px;
          padding: 10px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chart-title { font-size: 0.6rem; font-weight: 700; color: hsla(var(--text-muted)); }
        .chart-bars {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          flex: 1;
          padding-bottom: 4px;
        }
        .chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 30px;
        }
        .chart-bar {
          width: 14px;
          background: linear-gradient(to top, hsla(var(--accent-gym)), hsla(var(--accent-gym), 0.6));
          border-radius: 3px 3px 0 0;
        }
        .chart-bar-container span { font-size: 0.5rem; color: hsla(var(--text-muted)); }
        
        /* --- CATEGORIES SECTION --- */
        .categories-section {
          padding: 80px 0;
        }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 40px;
        }
        .category-card {
          border-radius: var(--radius-lg);
          padding: 32px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform var(--transition-normal);
        }
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-premium);
        }
        
        .cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cat-badge {
          font-size: 0.75rem;
          font-weight: 800;
          color: hsla(var(--text-muted));
          background-color: hsla(var(--text-muted), 0.1);
          padding: 4px 12px;
          border-radius: 999px;
        }
        .category-icon {
          width: 44px;
          height: 44px;
          padding: 10px;
          border-radius: var(--radius-sm);
        }
        .category-icon.gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .category-icon.salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .category-icon.clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        
        .category-card h3 {
          font-size: 1.4rem;
        }
        .category-card p {
          color: hsla(var(--text-body));
          font-size: 0.95rem;
          line-height: 1.5;
          flex: 1;
        }
        
        .cat-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          margin-top: 10px;
        }
        .card-gym .cat-link { color: hsla(var(--accent-gym)); }
        .card-salon .cat-link { color: hsla(var(--accent-salon)); }
        .card-clinic .cat-link { color: hsla(var(--accent-clinic)); }
        
        .cat-link:hover svg {
          transform: translateX(4px);
        }
        
        /* --- ANALYTICS PREVIEW SECTION --- */
        .analytics-preview-section {
          padding: 80px 0;
        }
        .analytics-wrapper {
          border-radius: var(--radius-xl);
          padding: 60px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
        }
        .analytics-text-col h2 {
          font-size: 2.5rem;
          margin-bottom: 20px;
        }
        .insights-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }
        .insights-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.95rem;
        }
        .insights-list li strong {
          color: hsla(var(--text-main));
        }
        .check-bullet {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: hsla(var(--primary), 0.1);
          color: hsla(var(--primary));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        /* Viz mockup */
        .viz-card {
          border-radius: var(--radius-lg);
          padding: 30px;
          box-shadow: var(--shadow-premium);
        }
        .viz-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .viz-header h4 { font-size: 1rem; flex: 1; }
        .viz-pill {
          font-size: 0.7rem;
          font-weight: 800;
          color: #10b981;
          background-color: rgba(16,185,129,0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .viz-amount {
          font-size: 2.25rem;
          font-family: var(--font-heading);
          font-weight: 800;
          color: hsla(var(--text-main));
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .viz-amount .trend {
          font-size: 0.95rem;
          color: #10b981;
          font-weight: 700;
        }
        .viz-subtitle {
          font-size: 0.85rem;
          color: hsla(var(--text-muted));
          margin-bottom: 24px;
        }
        .viz-chart-mock {
          height: 140px;
          position: relative;
          border-left: 1.5px dashed hsla(var(--border));
          border-bottom: 1.5px dashed hsla(var(--border));
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-bottom: 2px;
        }
        .mock-grid-line {
          height: 1px;
          border-top: 1px dashed hsla(var(--border), 0.4);
          width: 100%;
        }
        .mock-line-path-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
        }
        .mock-line-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        
        /* --- TESTIMONIALS --- */
        .testimonials-section {
          padding: 80px 0;
        }
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 40px;
        }
        .testimonial-card {
          border-radius: var(--radius-lg);
          padding: 36px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .testimonial-card p {
          font-size: 1.05rem;
          color: hsla(var(--text-body));
          font-style: italic;
          line-height: 1.6;
          flex: 1;
        }
        .testifier-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .testifier-info img {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid hsla(var(--primary), 0.2);
        }
        .testifier-info h4 {
          font-size: 1rem;
          color: hsla(var(--text-main));
        }
        .testifier-info span {
          font-size: 0.8rem;
          color: hsla(var(--text-muted));
          font-weight: 600;
        }
        
        /* --- PRICING CTA CARD --- */
        .pricing-cta-section {
          padding: 60px 0;
        }
        .pricing-cta-card {
          border-radius: var(--radius-xl);
          padding: 50px 60px;
          background: linear-gradient(135deg, hsla(var(--primary)), hsla(var(--secondary)));
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          box-shadow: var(--shadow-lg);
        }
        .pricing-cta-card h2 {
          color: white;
          font-size: 2.25rem;
          margin-bottom: 8px;
        }
        .pricing-cta-card p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.1rem;
          max-width: 600px;
        }
        .pricing-cta-actions {
          display: flex;
          gap: 16px;
          flex-shrink: 0;
        }
        
        /* --- FAQ SECTION --- */
        .faq-section {
          padding: 80px 0 120px;
        }
        .faq-wrapper {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .faq-item {
          border-radius: var(--radius-md);
          padding: 20px 24px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .faq-item:hover {
          border-color: hsla(var(--primary), 0.3);
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .faq-question h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: hsla(var(--text-main));
        }
        .faq-chevron {
          color: hsla(var(--text-muted));
          transition: transform var(--transition-normal);
        }
        .faq-item.active .faq-chevron {
          transform: rotate(180deg);
          color: hsla(var(--primary));
        }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height var(--transition-slow);
        }
        .faq-item.active .faq-answer {
          max-height: 120px;
          margin-top: 16px;
        }
        .faq-answer p {
          font-size: 0.95rem;
          color: hsla(var(--text-body));
          line-height: 1.6;
        }
        
        /* --- RESPONSIVE ADJUSTMENTS --- */
        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .hero-content {
            align-items: center;
          }
          .hero-actions {
            justify-content: center;
          }
          .analytics-wrapper {
            grid-template-columns: 1fr;
            padding: 40px 24px;
          }
          .pricing-cta-card {
            flex-direction: column;
            text-align: center;
            padding: 40px 24px;
          }
          .category-grid, .testimonial-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        
        @media (max-width: 600px) {
          .hero-section h1 {
            font-size: 2.5rem;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
          }
          .btn-hero {
            width: 100%;
          }
          .pricing-cta-actions {
            flex-direction: column;
            width: 100%;
          }
          .pricing-cta-actions a {
            width: 100%;
          }
          .category-grid, .testimonial-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
