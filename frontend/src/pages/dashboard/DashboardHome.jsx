import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Users, Calendar, CreditCard, BarChart3, Dumbbell, Scissors, 
  Stethoscope, ShieldAlert, Sparkles, Plus, PlusCircle, ArrowUpRight, 
  DollarSign, CheckCircle2, TrendingUp, Shield, Activity, UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardHome = () => {
  const [searchParams] = useSearchParams();
  const { user, isSuperAdmin, businessType } = useAuth();
  
  const activeTab = searchParams.get('tab') || 'overview';
  
  // Custom theme colors for each business type
  const themeColors = {
    gym: 'var(--accent-gym)',
    salon: 'var(--accent-salon)',
    clinic: 'var(--accent-clinic)',
    superadmin: 'var(--primary)'
  };
  
  const currentAccent = isSuperAdmin ? themeColors.superadmin : themeColors[businessType];

  // ==========================================
  // DATA MOCKS & SUB-PANELS
  // ==========================================

  // --- 1. SUPERADMIN SUB-PANELS ---
  const renderSuperadminOverview = () => {
    const tenants = [
      { id: 'b1', name: 'FitZone Gym', type: 'gym', plan: 'Pro', status: 'Active', mrr: 14900, owner: 'Alex Rivera' },
      { id: 'b2', name: 'Smile Dental Clinic', type: 'clinic', plan: 'Growth', status: 'Active', mrr: 6900, owner: 'Dr. Marcus Vance' },
      { id: 'b3', name: 'Glow Beauty Salon', type: 'salon', plan: 'Starter', status: 'Active', mrr: 2900, owner: 'Chloe Vane' },
    ];
    
    return (
      <div className="sub-panel animate-fade">
        {/* Metric Grid */}
        <div className="stats-grid">
          <div className="stat-card glass border-glow">
            <div className="stat-header">
              <h3>Monthly Recurring Revenue</h3>
              <DollarSign className="stat-icon text-primary" />
            </div>
            <p className="stat-value">NPR 24,700</p>
            <span className="stat-trend text-success">↑ 14.2% this month</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Active Businesses</h3>
              <Sparkles className="stat-icon text-primary" />
            </div>
            <p className="stat-value">3 Tenants</p>
            <span className="stat-trend text-success">100% renewal rate</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Operator Accounts</h3>
              <Users className="stat-icon text-primary" />
            </div>
            <p className="stat-value">154 Users</p>
            <span className="stat-trend text-muted">Across all directories</span>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="card-table-wrapper glass">
          <div className="table-header">
            <h3>Registered Business Tenants</h3>
            <span className="table-badge">Master Overview</span>
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Vertical Niche</th>
                  <th>Subscription Tier</th>
                  <th>Owner Operator</th>
                  <th>Monthly MRR</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/app/dashboard`} onClick={() => {
                        // Dynamically update user state to simulate switching to that tenant (very premium feel!)
                        const presetEmails = {
                          b1: 'gym-owner@fitzone.com',
                          b2: 'clinic-owner@smile.com',
                          b3: 'salon-owner@glow.com'
                        };
                        const db = {
                          'gym-owner@fitzone.com': {
                            id: 'owner_gym',
                            email: 'gym-owner@fitzone.com',
                            name: 'Alex Rivera',
                            role: 'owner',
                            businessType: 'gym',
                            businessName: 'FitZone Gym',
                            subscriptionPlan: 'pro',
                            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                            memberships: [
                              {
                                businessId: 'b1',
                                businessName: 'FitZone Gym',
                                businessType: 'gym',
                                role: 'owner'
                              },
                              {
                                businessId: 'b4-gym-sec',
                                businessName: 'FitZone Gym (Secondary Branch)',
                                businessType: 'gym',
                                role: 'manager'
                              }
                            ]
                          },
                          'salon-owner@glow.com': {
                            id: 'owner_salon',
                            email: 'salon-owner@glow.com',
                            name: 'Chloe Vane',
                            role: 'owner',
                            businessType: 'salon',
                            businessName: 'Glow Beauty Salon',
                            subscriptionPlan: 'starter',
                            avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
                            memberships: [
                              {
                                businessId: 'b3',
                                businessName: 'Glow Beauty Salon',
                                businessType: 'salon',
                                role: 'owner'
                              }
                            ]
                          },
                          'clinic-owner@smile.com': {
                            id: 'owner_clinic',
                            email: 'clinic-owner@smile.com',
                            name: 'Dr. Marcus Vance',
                            role: 'owner',
                            businessType: 'clinic',
                            businessName: 'Smile Dental Clinic',
                            subscriptionPlan: 'growth',
                            avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
                            memberships: [
                              {
                                businessId: 'b2',
                                businessName: 'Smile Dental Clinic',
                                businessType: 'clinic',
                                role: 'owner'
                              }
                            ]
                          }
                        };
                        const targetUser = db[presetEmails[t.id]];
                        localStorage.setItem('saas_user', JSON.stringify(targetUser));
                        localStorage.setItem('saas_active_business', JSON.stringify(targetUser.memberships[0]));
                        window.location.reload();
                      }} className="tenant-link">
                        <strong>{t.name}</strong> <ArrowUpRight size={12} className="inline-icon" />
                      </Link>
                    </td>
                    <td><span className={`pill-type type-${t.type}`}>{t.type.toUpperCase()}</span></td>
                    <td>{t.plan}</td>
                    <td>{t.owner}</td>
                    <td>NPR {t.mrr.toLocaleString()}</td>
                    <td><span className="badge active">{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- 2. GYM SUB-PANELS ---
  const renderGymOverview = () => {
    const workouts = [
      { time: '06:00 AM', name: 'Power Crossfit', capacity: '18/20 Enrolled', trainer: 'John Carter' },
      { time: '09:00 AM', name: 'Zumba Cardio', capacity: '12/15 Enrolled', trainer: 'Sarah Miller' },
      { time: '05:30 PM', name: 'Strength Hypertrophy', capacity: '24/25 Enrolled', trainer: 'Dave Batista' },
    ];

    return (
      <div className="sub-panel animate-fade">
        <div className="stats-grid">
          <div className="stat-card glass border-glow">
            <div className="stat-header">
              <h3>Active Gym Members</h3>
              <Users className="stat-icon text-gym" />
            </div>
            <p className="stat-value">120 Athletes</p>
            <span className="stat-trend text-success">↑ 8% package renewals</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Gate Check-ins Today</h3>
              <Activity className="stat-icon text-gym" />
            </div>
            <p className="stat-value">74 Attended</p>
            <span className="stat-trend text-success">Peak: 6:00 - 8:00 AM</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Monthly Collections</h3>
              <DollarSign className="stat-icon text-gym" />
            </div>
            <p className="stat-value">NPR 50,000</p>
            <span className="stat-trend text-success">100% paid invoices</span>
          </div>
        </div>

        {/* Classes Table */}
        <div className="card-table-wrapper glass">
          <div className="table-header">
            <h3>Today's Workout Classes</h3>
            <span className="table-badge badge-gym">Gym Module</span>
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Class Time</th>
                  <th>Workout Session</th>
                  <th>Attendance / Capacity</th>
                  <th>Assigned Trainer</th>
                </tr>
              </thead>
              <tbody>
                {workouts.map((w, idx) => (
                  <tr key={idx}>
                    <td><strong>{w.time}</strong></td>
                    <td>{w.name}</td>
                    <td>{w.capacity}</td>
                    <td>{w.trainer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- 3. SALON SUB-PANELS ---
  const renderSalonOverview = () => {
    const appointments = [
      { customer: 'Jane Smith', stylist: 'Chloe Vane', service: 'Balayage Hair Coloring', time: '02:00 PM', status: 'Pending' },
      { customer: 'Lisa Cuddy', stylist: 'Mark Sloane', service: 'Gel Nail Polish Manicure', time: '03:30 PM', status: 'Confirmed' },
      { customer: 'Monica Geller', stylist: 'Rachel Green', service: 'Facial & Skin Hydration', time: '05:00 PM', status: 'Confirmed' },
    ];

    return (
      <div className="sub-panel animate-fade">
        <div className="stats-grid">
          <div className="stat-card glass border-glow">
            <div className="stat-header">
              <h3>Today's Bookings</h3>
              <Calendar className="stat-icon text-salon" />
            </div>
            <p className="stat-value">8 Bookings</p>
            <span className="stat-trend text-success">4 stylists fully occupied</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Stylist Occupancy</h3>
              <TrendingUp className="stat-icon text-salon" />
            </div>
            <p className="stat-value">84% Utilized</p>
            <span className="stat-trend text-success">↑ 12% over last week</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Daily Drawer Cash</h3>
              <DollarSign className="stat-icon text-salon" />
            </div>
            <p className="stat-value">NPR 30,000</p>
            <span className="stat-trend text-success">Product sales included</span>
          </div>
        </div>

        {/* Salon Bookings Table */}
        <div className="card-table-wrapper glass">
          <div className="table-header">
            <h3>Today's Salon Appointment Sheets</h3>
            <span className="table-badge badge-salon">Salon Module</span>
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Booking Time</th>
                  <th>Client Customer</th>
                  <th>Beauty Stylist</th>
                  <th>Service Menu</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, idx) => (
                  <tr key={idx}>
                    <td><strong>{a.time}</strong></td>
                    <td>{a.customer}</td>
                    <td>{a.stylist}</td>
                    <td>{a.service}</td>
                    <td><span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- 4. CLINIC SUB-PANELS ---
  const renderClinicOverview = () => {
    const queue = [
      { time: '10:00 AM', patient: 'John Doe', doctor: 'Dr. Marcus Vance', type: 'Dental Consultation', status: 'Confirmed' },
      { time: '11:15 AM', patient: 'Arthur Pendragon', doctor: 'Dr. Gaius', type: 'Physiotherapy Session', status: 'In Progress' },
      { time: '01:00 PM', patient: 'Ginevra Weasley', doctor: 'Dr. Pomfrey', type: 'Annual General Checkup', status: 'Pending' },
    ];

    return (
      <div className="sub-panel animate-fade">
        <div className="stats-grid">
          <div className="stat-card glass border-glow">
            <div className="stat-header">
              <h3>Active Patient Logs</h3>
              <Users className="stat-icon text-clinic" />
            </div>
            <p className="stat-value">450 Patients</p>
            <span className="stat-trend text-success">100% secure record vaults</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Doctors on Rota</h3>
              <Stethoscope className="stat-icon text-clinic" />
            </div>
            <p className="stat-value">8 Practitioners</p>
            <span className="stat-trend text-muted">2 shifts covered today</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Billing collections</h3>
              <DollarSign className="stat-icon text-clinic" />
            </div>
            <p className="stat-value">NPR 120,000</p>
            <span className="stat-trend text-success">NPR 45k insurance pending</span>
          </div>
        </div>

        {/* Clinic Queue Table */}
        <div className="card-table-wrapper glass">
          <div className="table-header">
            <h3>Doctor Consultation Schedules</h3>
            <span className="table-badge badge-clinic">Clinic Module</span>
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Rota Time</th>
                  <th>Patient Name</th>
                  <th>Attending Doctor</th>
                  <th>Consultation Niche</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q, idx) => (
                  <tr key={idx}>
                    <td><strong>{q.time}</strong></td>
                    <td>{q.patient}</td>
                    <td>{q.doctor}</td>
                    <td>{q.type}</td>
                    <td><span className={`badge ${q.status.replace(/\s+/g, '').toLowerCase()}`}>{q.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- DYNAMIC MODULE TAB SWITCHERS ---
  const renderDynamicSubpanel = () => {
    if (activeTab === 'overview') {
      if (isSuperAdmin) return renderSuperadminOverview();
      if (businessType === 'gym') return renderGymOverview();
      if (businessType === 'salon') return renderSalonOverview();
      if (businessType === 'clinic') return renderClinicOverview();
    }
    
    // Otherwise show sub-directory lists (Gym: Trainers, Salon: Stylists, Clinic: Doctors, Superadmin: Tenants)
    const listData = {
      trainers: [
        { name: 'John Carter', bio: 'Personal trainer focusing on bodybuilding and hypertrophy.', contact: '9811111111' },
        { name: 'Sarah Miller', bio: 'Certified yoga therapist & aerobic dance zumba trainer.', contact: '9822222222' }
      ],
      plans: [
        { name: 'Starter Plan', fee: 'NPR 2,000/mo', specs: 'Full gym floor access during off-peak hours.' },
        { name: 'Power Pro', fee: 'NPR 4,000/mo', specs: '24/7 club check-in, group workouts, sauna access.' }
      ],
      staff: [
        { name: 'Chloe Vane', specialty: 'Senior Barber & Hair Stylist Pro', booked: '4 times today' },
        { name: 'Rachel Green', specialty: 'Esthetician & Nail Therapist Specialist', booked: '2 times today' }
      ],
      services: [
        { name: 'Balayage Hair Styling', cost: 'NPR 3,500', time: '120 minutes' },
        { name: 'Premium Pedicure Gel', cost: 'NPR 1,200', time: '45 minutes' }
      ],
      doctors: [
        { name: 'Dr. Marcus Vance', degree: 'MD Dentist Orthodontist', cabin: 'Cabin A-1' },
        { name: 'Dr. Gaius Julius', degree: 'MD Physiotherapist Sports Specialist', cabin: 'Cabin B-4' }
      ]
    };

    const currentList = listData[activeTab];

    if (currentList) {
      return (
        <div className="sub-panel animate-fade">
          <div className="card-table-wrapper glass">
            <div className="table-header">
              <h3 style={{ textTransform: 'capitalize' }}>{activeTab} Directory Register</h3>
              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add {activeTab}
              </button>
            </div>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Record Name</th>
                    <th>Niche / Role Details</th>
                    <th>Associated Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.bio || item.specs || item.specialty || item.degree}</td>
                      <td>{item.contact || item.fee || item.booked || item.cost || item.cabin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="sub-panel text-center" style={{ padding: '60px' }}>
        <ShieldAlert size={48} style={{ color: currentAccent, margin: '0 auto 16px' }} />
        <h2>Dynamic Module View</h2>
        <p>This layout (tab: **{activeTab}**) is configured. Complete operational widgets are dynamically mapped to your tenant db schema.</p>
      </div>
    );
  };

  return (
    <div className="dashboard-home">
      {/* Dynamic Main Header */}
      <div className="dashboard-header animate-slide-down">
        <div>
          <h1>Welcome, {user?.name || 'Operator'}</h1>
          <p>
            {isSuperAdmin 
              ? 'Multi-tenant cloud master control desk.' 
              : `Operational dashboard for ${user?.businessName} (${businessType} hub).`
            }
          </p>
        </div>
        
        {/* Dynamic Multi-tenant Onboarding CTA */}
        {!isSuperAdmin && (
          <div className="quick-actions-row">
            <Link to="/app/bookings" className="btn btn-primary" style={{ backgroundColor: currentAccent, boxShadow: `0 4px 10px 0 rgba(from ${currentAccent} r g b / 0.2)` }}>
              <PlusCircle size={16} />
              <span>Create Reservation</span>
            </Link>
          </div>
        )}
      </div>

      {/* Render matching panel contents */}
      {renderDynamicSubpanel()}

      {/* Embedded CSS */}
      <style>{`
        .dashboard-home {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 24px;
        }
        
        .dashboard-header h1 {
          font-size: 2rem;
          color: hsla(var(--text-main));
        }
        .dashboard-header p {
          color: hsla(var(--text-body));
          font-size: 1rem;
        }
        
        .quick-actions-row {
          display: flex;
          gap: 12px;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        .stat-card {
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .border-glow {
          border-color: ${currentAccent};
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
        .stat-icon.text-primary { background-color: hsla(var(--primary), 0.1); color: hsla(var(--primary)); }
        .stat-icon.text-gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .stat-icon.text-salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .stat-icon.text-clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        
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
        
        /* Table Wrapper Card */
        .card-table-wrapper {
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }
        .table-header {
          padding: 20px 24px;
          border-bottom: 1px solid hsla(var(--border-frosted));
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .table-header h3 {
          font-size: 1.15rem;
          color: hsla(var(--text-main));
        }
        
        .table-badge {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: 99px;
        }
        .table-badge.badge-gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .table-badge.badge-salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .table-badge.badge-clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        
        .responsive-table {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th, td {
          padding: 16px 24px;
          border-bottom: 1px solid hsla(var(--border-frosted));
          font-size: 0.92rem;
        }
        th {
          background-color: hsla(var(--border), 0.2);
          color: hsla(var(--text-muted));
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        tbody tr {
          transition: background var(--transition-fast);
        }
        tbody tr:hover {
          background-color: hsla(var(--text-muted), 0.03);
        }
        td strong {
          color: hsla(var(--text-main));
        }
        
        .badge {
          display: inline-flex;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: capitalize;
        }
        .badge.active, .badge.confirmed { background-color: rgba(16,185,129,0.1); color: #10b981; }
        .badge.pending { background-color: rgba(245,158,11,0.1); color: #f59e0b; }
        .badge.inprogress { background-color: rgba(99,102,241,0.1); color: #6366f1; }
        
        .pill-type {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .pill-type.type-gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .pill-type.type-salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .pill-type.type-clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        
        .tenant-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: hsla(var(--primary));
        }
        .inline-icon { flex-shrink: 0; }
        
        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
