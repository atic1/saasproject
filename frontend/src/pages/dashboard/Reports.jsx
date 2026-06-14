import React from 'react';
import { 
  BarChart3, Plus, ArrowUpRight, DollarSign, 
  TrendingUp, Download, Calendar, Activity 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const { businessType, isSuperAdmin } = useAuth();
  
  const accentClass = isSuperAdmin ? 'admin' : businessType;

  // Custom colors
  const colors = {
    gym: '25 95% 53%',
    salon: '326 95% 60%',
    clinic: '162 90% 40%',
    admin: '250 95% 63%'
  };

  const activeColor = colors[accentClass];

  const getHeaders = () => {
    if (isSuperAdmin) return { title: 'Global Platform Growth Insights', desc: 'Aggregate platform indicators: Tenant acquisition, active MRR projections, and server loads.' };
    switch (businessType) {
      case 'gym': return { title: 'Gym Package Growth & Analytics', desc: 'Track member attendance statistics, package distributions, and trainer payouts.' };
      case 'salon': return { title: 'Salon Stylist Performance & Sales', desc: 'Track stylist commission splits, sales conversions, and peak checkout hours.' };
      case 'clinic': return { title: 'Clinical Diagnostics & Patient Volume', desc: 'Track daily medical consultations, doctor cabins workload, and insurer payouts.' };
      default: return { title: 'Business Performance Reports', desc: 'Review operational analytical statistics.' };
    }
  };

  const headers = getHeaders();

  return (
    <div className="reports-page animate-fade">
      {/* Page Header */}
      <div className="page-title-row">
        <div>
          <h1>{headers.title}</h1>
          <p>{headers.desc}</p>
        </div>
        <button className={`btn btn-primary btn-${accentClass}`} onClick={() => alert('Operational analytics CSV exported.')}>
          <Download size={16} />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="stats-grid">
        <div className="stat-card glass border-glow">
          <div className="stat-header">
            <h3>Year-to-Date Growth</h3>
            <TrendingUp className="stat-icon" style={{ backgroundColor: `hsla(${activeColor}, 0.1)`, color: `hsla(${activeColor})` }} />
          </div>
          <p className="stat-value">+24.8%</p>
          <span className="stat-trend text-success">↑ Outperformed last year</span>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <h3>Peak Hours Rota</h3>
            <Calendar className="stat-icon" style={{ backgroundColor: `hsla(${activeColor}, 0.1)`, color: `hsla(${activeColor})` }} />
          </div>
          <p className="stat-value">04:00 - 06:00</p>
          <span className="stat-trend text-muted">Daily local time slots</span>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <h3>Diagnostic Ratios</h3>
            <Activity className="stat-icon" style={{ backgroundColor: `hsla(${activeColor}, 0.1)`, color: `hsla(${activeColor})` }} />
          </div>
          <p className="stat-value">98.4%</p>
          <span className="stat-trend text-success">Optimal server checks</span>
        </div>
      </div>

      {/* Main Chart Graphic Panel */}
      <div className="chart-large-card glass animate-slide-up">
        <div className="chart-large-header">
          <div className="header-info">
            <BarChart3 size={20} style={{ color: `hsla(${activeColor})` }} />
            <div>
              <h3>Monthly Performance Projection</h3>
              <p>Operational statistics calculated over the last 6 months</p>
            </div>
          </div>
          <span className="live-pulse-badge">Live projection</span>
        </div>

        <div className="chart-large-body">
          {/* visual graph projection */}
          <div className="vector-chart-panel">
            <svg viewBox="0 0 500 150" className="vector-chart-svg">
              <defs>
                <linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`hsla(${activeColor}, 0.3)`} />
                  <stop offset="100%" stopColor={`hsla(${activeColor}, 0.0)`} />
                </linearGradient>
              </defs>
              {/* Fill path */}
              <path d="M 0 130 C 50 100, 100 60, 150 110 C 200 130, 250 50, 300 70 C 350 90, 400 30, 450 40 L 450 150 L 0 150 Z" fill="url(#gradient-fill)" />
              {/* Line path */}
              <path d="M 0 130 C 50 100, 100 60, 150 110 C 200 130, 250 50, 300 70 C 350 90, 400 30, 450 40" fill="none" stroke={`hsla(${activeColor})`} strokeWidth="3.5" />
            </svg>
            <div className="chart-grid-bars">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS */}
      <style>{`
        .reports-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 24px;
        }
        .page-title-row h1 { font-size: 2rem; color: hsla(var(--text-main)); }
        .page-title-row p { color: hsla(var(--text-body)); }
        
        .btn-gym { background-color: hsla(var(--accent-gym)); color: white; }
        .btn-gym:hover { background-color: hsla(var(--accent-gym), 0.9); }
        .btn-salon { background-color: hsla(var(--accent-salon)); color: white; }
        .btn-salon:hover { background-color: hsla(var(--accent-salon), 0.9); }
        .btn-clinic { background-color: hsla(var(--accent-clinic)); color: white; }
        .btn-clinic:hover { background-color: hsla(var(--accent-clinic), 0.9); }
        
        .badge-gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .badge-salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .badge-clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        .badge-admin { background-color: hsla(var(--primary), 0.1); color: hsla(var(--primary)); }
        
        .border-glow {
          border-color: hsla(${activeColor});
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .stat-card {
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .stat-header h3 {
          font-size: 0.95rem;
          color: hsla(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-icon {
          width: 32px;
          height: 32px;
          padding: 6px;
          border-radius: var(--radius-sm);
        }
        .stat-value {
          font-size: 2.25rem;
          font-family: var(--font-heading);
          font-weight: 800;
          color: hsla(var(--text-main));
          line-height: 1;
          margin-bottom: 8px;
        }
        .stat-trend {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .text-success { color: #10b981; }
        .text-muted { color: hsla(var(--text-muted)); }
        
        /* Large Chart */
        .chart-large-card {
          border-radius: var(--radius-lg);
          padding: 30px;
          box-shadow: var(--shadow-md);
        }
        .chart-large-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .header-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .header-info h3 { font-size: 1.15rem; color: hsla(var(--text-main)); margin-bottom: 4px; }
        .header-info p { font-size: 0.85rem; color: hsla(var(--text-body)); }
        
        .live-pulse-badge {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #10b981;
          background-color: rgba(16,185,129,0.1);
          padding: 4px 12px;
          border-radius: 99px;
        }
        
        .chart-large-body {
          height: 220px;
        }
        .vector-chart-panel {
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .vector-chart-svg {
          width: 100%;
          height: 170px;
          overflow: visible;
        }
        .chart-grid-bars {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 0.8rem;
          font-weight: 700;
          color: hsla(var(--text-muted));
          border-top: 1px solid hsla(var(--border-frosted));
        }
        
        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .page-title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .page-title-row button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
