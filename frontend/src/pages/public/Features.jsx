import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Dumbbell, Scissors, Stethoscope, 
  Check, ArrowRight, ShieldCheck, Zap, 
  Users, BarChart3, Database 
} from 'lucide-react';

const Features = () => {
  const [activeTab, setActiveTab] = useState('gym');

  const tabs = [
    { id: 'gym', label: 'Gym Features', icon: <Dumbbell size={18} />, colorClass: 'gym' },
    { id: 'salon', label: 'Salon & Spa', icon: <Scissors size={18} />, colorClass: 'salon' },
    { id: 'clinic', label: 'Clinic Hub', icon: <Stethoscope size={18} />, colorClass: 'clinic' }
  ];

  // Specific features dictionary
  const verticalFeatures = {
    gym: {
      title: "Gym & Studio Management",
      badge: "Built for Gyms, Crossfit, and Yoga Studios",
      color: "var(--accent-gym)",
      btnClass: "btn-gym",
      desc: "Our Gym module is engineered for high member throughput and recurring packages. Automate membership gates and coordinate fitness trainers seamlessly.",
      list: [
        "**Gate Check-in Controls** – Connect barcodes or card check-ins to track real-time attendance.",
        "**Package Builder** – Construct flexible Pro monthly memberships, class credits, or personal trainer bundles.",
        "**Trainer Rota Sheets** – Track gym trainer hours, schedule custom sessions, and log salary payouts.",
        "**Member Mobile Portals** – Allow gym members to reserve workouts, view routines, and pay renewals on phone."
      ]
    },
    salon: {
      title: "Salon & Spa Operations",
      badge: "Engineered for Hair Salons, Spas, and Nail Bars",
      color: "var(--accent-salon)",
      btnClass: "btn-salon",
      desc: "Our Salon module centers around booking books and stylist utilization. Prevent double bookings and manage your product inventories in one premium screen.",
      list: [
        "**Frosted Booking Book** – A drag-and-drop calendar showcasing beauty stylist timetables clearly.",
        "**Stylist Roster Commission** – Assign direct service commissions and tip calculators for beauty professionals.",
        "**SMS/Email Reminders** – Auto-dispatch booking confirmations to slash salon no-shows.",
        "**Beauty Catalog & CRM** – Record custom client hair formulas, preference logs, and favorite cosmetic lines."
      ]
    },
    clinic: {
      title: "Medical & Health Clinic Hub",
      badge: "Built for Dental, Physio, and Wellness Clinics",
      color: "var(--accent-clinic)",
      btnClass: "btn-clinic",
      desc: "Our Clinic module handles medical records, schedules, and billing with ultimate security and compliance. Run a multi-doctor facility smoothly.",
      list: [
        "**Encrypted Health Records** – Securely save clinic consult notes, patient dental charts, and attachments.",
        "**Doctor Shifts Coordinator** – Manage rotas, emergency calls, and regular patient clinic hours.",
        "**Billing & Insurance Receipts** – Auto-populate invoice items with medical codes and track insurer paybacks.",
        "**Appointment Waitlists** – Manage overflow patient queues and auto-fill cancelled slots."
      ]
    }
  };

  const currentModule = verticalFeatures[activeTab];

  return (
    <div className="features-page container animate-fade">
      {/* Page Header */}
      <section className="features-header text-center">
        <span className="section-label">Enterprise-Level Capability</span>
        <h2>Complete Core Features Built for Scale</h2>
        <p>BizNepal delivers specialized tools in one unified login. No generic compromises. Select your vertical below to view specific custom features.</p>
      </section>

      {/* Dynamic Tab Switcher */}
      <div className="features-tabs-wrapper glass">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            className={`feature-tab-btn tab-${tab.colorClass} ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Feature Block */}
      <section className="vertical-feature-section glass animate-slide-up" key={activeTab}>
        <div className="feature-text-col">
          <span className="feature-badge" style={{ color: currentModule.color, backgroundColor: `rgba(from ${currentModule.color} r g b / 0.1)` }}>
            {currentModule.badge}
          </span>
          <h2>{currentModule.title}</h2>
          <p className="feature-desc">{currentModule.desc}</p>
          
          <ul className="vertical-feature-list">
            {currentModule.list.map((item, idx) => {
              const parts = item.split(' – ');
              const title = parts[0].replace(/\*\*/g, '');
              const desc = parts[1];
              return (
                <li key={idx}>
                  <div className="bullet-circle" style={{ color: currentModule.color }}>
                    <Check size={16} />
                  </div>
                  <div>
                    <strong>{title}</strong> – {desc}
                  </div>
                </li>
              );
            })}
          </ul>

          <Link to="/register" className={`btn ${currentModule.btnClass}`} style={{ marginTop: '24px' }}>
            <span>Build custom tenant now</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Shared Global Infrastructure */}
      <section className="shared-infrastructure">
        <div className="section-header text-center">
          <span className="section-label">Core Infrastructure</span>
          <h2>Platform Shared Foundations</h2>
          <p>Behind our specialized vertical modules lies a rock-solid, enterprise-grade core designed for fast, seamless multi-branch management.</p>
        </div>

        <div className="infra-grid">
          <div className="infra-card glass">
            <ShieldCheck size={36} className="infra-icon" />
            <h3>Shared Authentication</h3>
            <p>One global login gateway. Roles, access tokens, and tenant states resolve automatically inside a single secure browser session.</p>
          </div>
          <div className="infra-card glass">
            <Zap size={36} className="infra-icon" />
            <h3>State of the Art Speed</h3>
            <p>Built on Vite React frameworks to ensure immediate screen loads, instantaneous search query filters, and lightning fast data operations.</p>
          </div>
          <div className="infra-card glass">
            <BarChart3 size={36} className="infra-icon" />
            <h3>Global Analytics</h3>
            <p>Tenant stats flow into automated ledgers. Superadmins can overview entire multi-tenant networks and MRR inside clean global grids.</p>
          </div>
        </div>
      </section>

      {/* Embedded CSS */}
      <style>{`
        .features-page {
          padding-top: 60px;
          padding-bottom: 100px;
        }
        
        .features-header {
          margin-bottom: 40px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        .features-header h2 {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }
        
        /* Tab Wrapper */
        .features-tabs-wrapper {
          display: flex;
          justify-content: center;
          padding: 8px;
          border-radius: var(--radius-lg);
          max-width: 600px;
          margin: 0 auto 60px;
          gap: 10px;
        }
        .feature-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.95rem;
          color: hsla(var(--text-body));
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .feature-tab-btn:hover {
          background-color: hsla(var(--text-muted), 0.08);
        }
        
        /* Tab specific active states */
        .feature-tab-btn.tab-gym.active { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .feature-tab-btn.tab-salon.active { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .feature-tab-btn.tab-clinic.active { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        
        /* Feature block */
        .vertical-feature-section {
          border-radius: var(--radius-xl);
          padding: 60px 80px;
          max-width: 860px;
          margin: 0 auto 80px;
        }
        .feature-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 6px 16px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
        }
        .vertical-feature-section h2 {
          font-size: 2.25rem;
          margin-bottom: 16px;
        }
        .feature-desc {
          color: hsla(var(--text-body));
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        
        .vertical-feature-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .vertical-feature-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.98rem;
          color: hsla(var(--text-body));
        }
        .bullet-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: currentColor;
          color: white;
          flex-shrink: 0;
        }
        .bullet-circle svg {
          stroke: white;
        }
        

        /* Shared infra */
        .shared-infrastructure {
          padding-top: 40px;
        }
        .infra-grid {
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) {
          .infra-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .infra-grid { grid-template-columns: 1fr; }
        }
        .infra-card {
          border-radius: var(--radius-lg);
          padding: 36px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .infra-icon {
          color: hsla(var(--primary));
          background-color: hsla(var(--primary), 0.1);
          padding: 10px;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
        }
        .infra-card h3 {
          font-size: 1.25rem;
        }
        .infra-card p {
          color: hsla(var(--text-body));
          font-size: 0.95rem;
        }
        
        @media (max-width: 1024px) {
          .vertical-feature-section {
            padding: 40px 24px;
          }
        }
        
        @media (max-width: 600px) {
          .features-tabs-wrapper {
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default Features;
