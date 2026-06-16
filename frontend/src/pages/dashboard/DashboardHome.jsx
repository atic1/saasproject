import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Users, Calendar, CreditCard, BarChart3, Dumbbell, Scissors, 
  Stethoscope, ShieldAlert, Sparkles, Plus, PlusCircle, ArrowUpRight, 
  DollarSign, CheckCircle2, TrendingUp, Shield, Activity, UserCheck,
  Edit, Trash2, Globe, Percent, Clock, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardHome = () => {
  const [searchParams] = useSearchParams();
  const { user, isSuperAdmin, businessType, businessId } = useAuth();
  
  const activeTab = searchParams.get('tab') || 'overview';
  
  // Custom theme colors for each business type
  const themeColors = {
    gym: 'var(--accent-gym)',
    salon: 'var(--accent-salon)',
    clinic: 'var(--accent-clinic)',
    superadmin: 'var(--primary)'
  };
  
  const currentAccent = isSuperAdmin ? themeColors.superadmin : themeColors[businessType];

  // API State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('saas_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const endpoint = isSuperAdmin 
          ? 'http://localhost:5000/api/dashboard/superadmin' 
          : 'http://localhost:5000/api/dashboard/business';

        const headers = {
          'Authorization': `Bearer ${token}`
        };
        if (!isSuperAdmin && businessId) {
          headers['X-Business-Id'] = businessId;
        }

        const res = await fetch(endpoint, { headers });
        if (!res.ok) {
          throw new Error('Failed to load dashboard data');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.warn('Dashboard fetch error, using fallbacks:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isSuperAdmin, businessId]);

  // Tab Details API State
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Modals & Forms State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ name: '', price: '', durationValue: '1', durationUnit: 'month', features: '', isHighlighted: false, isActive: true });

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({ name: '', description: '', code: '', discountType: 'percentage', discountValue: '', startDate: '', endDate: '', bannerImage: '', isActive: true });

  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [trainerForm, setTrainerForm] = useState({ name: '', specialization: '', experience: '', photo: '' });

  // Fetch logic for directories
  const fetchPlans = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token || !businessId) return;
    try {
      setTabLoading(true);
      const res = await fetch(`http://localhost:5000/api/plans/${businessId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId }
      });
      if (res.ok) setPlans(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchTrainers = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token || !businessId) return;
    try {
      setTabLoading(true);
      const res = await fetch(`http://localhost:5000/api/trainers/${businessId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId }
      });
      if (res.ok) setTrainers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchOffers = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token || !businessId) return;
    try {
      setTabLoading(true);
      const res = await fetch(`http://localhost:5000/api/offers/${businessId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId }
      });
      if (res.ok) setOffers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) return;
    if (activeTab === 'plans') {
      fetchPlans();
    } else if (activeTab === 'trainers') {
      fetchTrainers();
    } else if (activeTab === 'offers') {
      fetchOffers();
    }
  }, [activeTab, businessId]);

  // CRUD Handlers
  const handlePlanSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('saas_token');
    if (!token || !businessId) return;

    const url = editingPlan 
      ? `http://localhost:5000/api/plans/${businessId}/${editingPlan._id}`
      : `http://localhost:5000/api/plans/${businessId}`;
    const method = editingPlan ? 'PUT' : 'POST';

    const featuresList = planForm.features.split(',')
      .map(f => f.trim())
      .filter(Boolean)
      .map(name => ({ name, included: true }));

    const payload = {
      name: planForm.name,
      pricing: { basePrice: Number(planForm.price), currency: 'NPR' },
      duration: { value: Number(planForm.durationValue), unit: planForm.durationUnit },
      features: featuresList,
      display: { isHighlighted: planForm.isHighlighted },
      isActive: planForm.isActive
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowPlanModal(false);
        fetchPlans();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error saving plan');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlanDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    const token = localStorage.getItem('saas_token');
    try {
      const res = await fetch(`http://localhost:5000/api/plans/${businessId}/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId }
      });
      if (res.ok) fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOfferSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('saas_token');
    if (!token || !businessId) return;

    const url = editingOffer
      ? `http://localhost:5000/api/offers/${businessId}/${editingOffer._id}`
      : `http://localhost:5000/api/offers/${businessId}`;
    const method = editingOffer ? 'PUT' : 'POST';

    const payload = {
      name: offerForm.name,
      description: offerForm.description,
      code: offerForm.code || undefined,
      discount: { type: offerForm.discountType, value: Number(offerForm.discountValue) },
      validity: { startDate: new Date(offerForm.startDate), endDate: new Date(offerForm.endDate) },
      display: { bannerImage: offerForm.bannerImage },
      isActive: offerForm.isActive,
      status: offerForm.isActive ? 'active' : 'paused'
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowOfferModal(false);
        fetchOffers();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error saving offer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOfferDelete = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    const token = localStorage.getItem('saas_token');
    try {
      const res = await fetch(`http://localhost:5000/api/offers/${businessId}/${offerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId }
      });
      if (res.ok) fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrainerSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('saas_token');
    if (!token || !businessId) return;

    const url = editingTrainer
      ? `http://localhost:5000/api/trainers/${businessId}/${editingTrainer._id}`
      : `http://localhost:5000/api/trainers/${businessId}`;
    const method = editingTrainer ? 'PUT' : 'POST';

    const payload = {
      name: trainerForm.name,
      specialization: trainerForm.specialization,
      experience: trainerForm.experience,
      photo: trainerForm.photo
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowTrainerModal(false);
        fetchTrainers();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error saving trainer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrainerDelete = async (trainerId) => {
    if (!confirm('Are you sure you want to delete this trainer?')) return;
    const token = localStorage.getItem('saas_token');
    try {
      const res = await fetch(`http://localhost:5000/api/trainers/${businessId}/${trainerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId }
      });
      if (res.ok) fetchTrainers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrainerPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTrainerForm(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleOfferBannerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setOfferForm(prev => ({ ...prev, bannerImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // DATA MOCKS & SUB-PANELS
  // ==========================================

  // --- 1. SUPERADMIN SUB-PANELS ---
  const renderSuperadminOverview = () => {
    const tenantsFallback = [
      { id: 'b1', name: 'FitZone Gym', type: 'gym', plan: 'Pro', status: 'Active', mrr: 14900, owner: 'Alex Rivera' },
      { id: 'b2', name: 'Smile Dental Clinic', type: 'clinic', plan: 'Growth', status: 'Active', mrr: 6900, owner: 'Dr. Marcus Vance' },
      { id: 'b3', name: 'Glow Beauty Salon', type: 'salon', plan: 'Starter', status: 'Active', mrr: 2900, owner: 'Chloe Vane' },
    ];

    const activeTenants = (data?.businesses || tenantsFallback).map(t => ({
      id: t.id || t._id,
      name: t.name,
      type: t.type,
      plan: t.plan || 'Starter',
      owner: t.owner || 'Main Owner',
      mrr: t.revenue !== undefined ? t.revenue : (t.mrr || 0),
      status: t.status || 'Active'
    }));
    
    return (
      <div className="sub-panel animate-fade">
        {/* Metric Grid */}
        <div className="stats-grid">
          <div className="stat-card glass border-glow">
            <div className="stat-header">
              <h3>Monthly Recurring Revenue</h3>
              <DollarSign className="stat-icon text-primary" />
            </div>
            <p className="stat-value">
              {data?.stats ? `NPR ${data.stats.monthlyRecurringRevenue.toLocaleString()}` : 'NPR 24,700'}
            </p>
            <span className="stat-trend text-success">↑ 14.2% this month</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Active Businesses</h3>
              <Sparkles className="stat-icon text-primary" />
            </div>
            <p className="stat-value">
              {data?.stats ? `${data.stats.totalBusinesses} Tenants` : '3 Tenants'}
            </p>
            <span className="stat-trend text-success">100% renewal rate</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Operator Accounts</h3>
              <Users className="stat-icon text-primary" />
            </div>
            <p className="stat-value">
              {data?.stats ? `${data.stats.totalUsers} Users` : '154 Users'}
            </p>
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
                {activeTenants.map(t => (
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
                        if (targetUser) {
                          localStorage.setItem('saas_user', JSON.stringify(targetUser));
                          localStorage.setItem('saas_active_business', JSON.stringify(targetUser.memberships[0]));
                          window.location.reload();
                        }
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
    const workoutsFallback = [
      { time: '06:00 AM', name: 'Power Crossfit', capacity: '18/20 Enrolled', trainer: 'John Carter' },
      { time: '09:00 AM', name: 'Zumba Cardio', capacity: '12/15 Enrolled', trainer: 'Sarah Miller' },
      { time: '05:30 PM', name: 'Strength Hypertrophy', capacity: '24/25 Enrolled', trainer: 'Dave Batista' },
    ];

    const hasRealData = data && data.business;
    const workoutsList = hasRealData && data.recentBookings ? data.recentBookings.map(b => ({
      time: b.time || 'N/A',
      name: b.type || 'Workout Class',
      capacity: b.customer || 'Athlete',
      trainer: 'Staff Member'
    })) : workoutsFallback;

    return (
      <div className="sub-panel animate-fade">
        <div className="stats-grid">
          <div className="stat-card glass border-glow">
            <div className="stat-header">
              <h3>Active Gym Members</h3>
              <Users className="stat-icon text-gym" />
            </div>
            <p className="stat-value">{hasRealData ? `${data.business.members} Athletes` : '120 Athletes'}</p>
            <span className="stat-trend text-success">↑ 8% package renewals</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Gate Check-ins Today</h3>
              <Activity className="stat-icon text-gym" />
            </div>
            <p className="stat-value">{hasRealData ? `${data.recentBookings?.length || 0} Attended` : '74 Attended'}</p>
            <span className="stat-trend text-success">Peak: 6:00 - 8:00 AM</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Monthly Collections</h3>
              <DollarSign className="stat-icon text-gym" />
            </div>
            <p className="stat-value">{hasRealData ? `NPR ${data.business.revenue.toLocaleString()}` : 'NPR 50,000'}</p>
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
                  <th>Workout Session / Customer</th>
                  <th>Attendance / Capacity</th>
                  <th>Assigned Trainer</th>
                </tr>
              </thead>
              <tbody>
                {workoutsList.map((w, idx) => (
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
    const appointmentsFallback = [
      { customer: 'Jane Smith', stylist: 'Chloe Vane', service: 'Balayage Hair Coloring', time: '02:00 PM', status: 'Pending' },
      { customer: 'Lisa Cuddy', stylist: 'Mark Sloane', service: 'Gel Nail Polish Manicure', time: '03:30 PM', status: 'Confirmed' },
      { customer: 'Monica Geller', stylist: 'Rachel Green', service: 'Facial & Skin Hydration', time: '05:00 PM', status: 'Confirmed' },
    ];

    const hasRealData = data && data.business;
    const appointmentsList = hasRealData && data.recentBookings ? data.recentBookings.map(b => ({
      customer: b.customer || 'Client',
      stylist: 'Stylist Member',
      service: b.type || 'Salon Service',
      time: b.time || 'N/A',
      status: b.status || 'Confirmed'
    })) : appointmentsFallback;

    return (
      <div className="sub-panel animate-fade">
        <div className="stats-grid">
          <div className="stat-card glass border-glow">
            <div className="stat-header">
              <h3>Today's Bookings</h3>
              <Calendar className="stat-icon text-salon" />
            </div>
            <p className="stat-value">{hasRealData ? `${data.recentBookings?.length || 0} Bookings` : '8 Bookings'}</p>
            <span className="stat-trend text-success">4 stylists fully occupied</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Stylist Occupancy</h3>
              <TrendingUp className="stat-icon text-salon" />
            </div>
            <p className="stat-value">{hasRealData ? `${data.recentBookings?.length > 0 ? '84%' : '0% Utilized'}` : '84% Utilized'}</p>
            <span className="stat-trend text-success">↑ 12% over last week</span>
          </div>

          <div className="stat-card glass">
            <div className="stat-header">
              <h3>Daily Drawer Cash</h3>
              <DollarSign className="stat-icon text-salon" />
            </div>
            <p className="stat-value">{hasRealData ? `NPR ${data.business.revenue.toLocaleString()}` : 'NPR 30,000'}</p>
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
                {appointmentsList.map((a, idx) => (
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
    const queueFallback = [
      { time: '10:00 AM', patient: 'John Doe', doctor: 'Dr. Marcus Vance', type: 'Dental Consultation', status: 'Confirmed' },
      { time: '11:15 AM', patient: 'Arthur Pendragon', doctor: 'Dr. Gaius', type: 'Physiotherapy Session', status: 'In Progress' },
      { time: '01:00 PM', patient: 'Ginevra Weasley', doctor: 'Dr. Pomfrey', type: 'Annual General Checkup', status: 'Pending' },
    ];

    const hasRealData = data && data.business;
    const queueList = hasRealData && data.recentBookings ? data.recentBookings.map(b => ({
      time: b.time || 'N/A',
      patient: b.customer || 'Patient',
      doctor: 'Doctor',
      type: b.type || 'Consultation',
      status: b.status || 'Confirmed'
    })) : queueFallback;

    return (
      <div className="sub-panel animate-fade">
        <div className="stats-grid">
          <div className="stat-card glass border-glow">
            <div className="stat-header">
              <h3>Active Patient Logs</h3>
              <Users className="stat-icon text-clinic" />
            </div>
            <p className="stat-value">{hasRealData ? `${data.business.members} Patients` : '450 Patients'}</p>
            <span className="stat-trend text-success">100% secure vault</span>
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
            <p className="stat-value">{hasRealData ? `NPR ${data.business.revenue.toLocaleString()}` : 'NPR 120,000'}</p>
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
                {queueList.map((q, idx) => (
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

  // --- GYM TABS CUSTOM RENDERS & MODALS ---
  const PlanModal = () => {
    if (!showPlanModal) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content glass">
          <div className="modal-header">
            <h3>{editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}</h3>
            <button onClick={() => setShowPlanModal(false)} className="close-btn"><X size={18} /></button>
          </div>
          <form onSubmit={handlePlanSave} className="modal-form">
            <div className="form-group">
              <label>Plan Name</label>
              <input type="text" required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (NPR)</label>
                <input type="number" required value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Duration Value</label>
                <input type="number" required value={planForm.durationValue} onChange={e => setPlanForm({...planForm, durationValue: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Duration Unit</label>
                <select value={planForm.durationUnit} onChange={e => setPlanForm({...planForm, durationUnit: e.target.value})}>
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                  <option value="year">Year(s)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Features (comma separated list)</label>
              <textarea placeholder="e.g. Free Trainer, Locker, Group Classes" value={planForm.features} onChange={e => setPlanForm({...planForm, features: e.target.value})} />
            </div>
            <div className="form-row" style={{ gap: '20px', margin: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={planForm.isHighlighted} onChange={e => setPlanForm({...planForm, isHighlighted: e.target.checked})} />
                Highlight on website (Badge)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={planForm.isActive} onChange={e => setPlanForm({...planForm, isActive: e.target.checked})} />
                Plan is Active
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowPlanModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: currentAccent }}>Save Plan</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      price: plan.pricing?.basePrice?.toString() || '',
      durationValue: plan.duration?.value?.toString() || '1',
      durationUnit: plan.duration?.unit || 'month',
      features: plan.features ? plan.features.map(f => f.name).join(', ') : '',
      isHighlighted: plan.display?.isHighlighted || false,
      isActive: plan.isActive !== undefined ? plan.isActive : true
    });
    setShowPlanModal(true);
  };

  const openAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: '', price: '', durationValue: '1', durationUnit: 'month', features: '', isHighlighted: false, isActive: true });
    setShowPlanModal(true);
  };

  const renderGymPlansTab = () => {
    return (
      <div className="sub-panel animate-fade">
        <div className="card-table-wrapper glass">
          <div className="table-header">
            <h3>Gym Membership Plans</h3>
            <button className="btn btn-primary" onClick={openAddPlan} style={{ backgroundColor: currentAccent }}>
              <PlusCircle size={16} /> Add New Plan
            </button>
          </div>
          {tabLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>Loading plans...</div>
          ) : plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'hsla(var(--text-muted))', marginBottom: '16px' }}>No membership plans configured yet.</p>
              <button className="btn btn-primary" onClick={openAddPlan} style={{ backgroundColor: currentAccent }}>Create Your First Plan</button>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Billing Price</th>
                    <th>Billing Duration</th>
                    <th>Core Features</th>
                    <th>Visibility Status</th>
                    <th>Operator Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan._id}>
                      <td>
                        <strong>{plan.name}</strong>
                        {plan.display?.isHighlighted && <span className="table-badge badge-gym" style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '10px' }}>Highlighted</span>}
                      </td>
                      <td>NPR {plan.pricing?.basePrice}</td>
                      <td>{plan.duration?.value} {plan.duration?.unit}(s)</td>
                      <td>{plan.features?.map(f => f.name).join(', ') || 'N/A'}</td>
                      <td>
                        <button 
                          onClick={async () => {
                            const token = localStorage.getItem('saas_token');
                            await fetch(`http://localhost:5000/api/plans/${businessId}/${plan._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId },
                              body: JSON.stringify({ isActive: !plan.isActive })
                            });
                            fetchPlans();
                          }}
                          className={`badge ${plan.isActive ? 'active' : 'pending'}`}
                          style={{ border: 'none', cursor: 'pointer' }}
                        >
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => openEditPlan(plan)} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentAccent }}><Edit size={16} /></button>
                          <button onClick={() => handlePlanDelete(plan._id)} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <PlanModal />
      </div>
    );
  };

  const OfferModal = () => {
    if (!showOfferModal) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content glass">
          <div className="modal-header">
            <h3>{editingOffer ? 'Edit Special Offer' : 'Create Special Offer'}</h3>
            <button onClick={() => setShowOfferModal(false)} className="close-btn"><X size={18} /></button>
          </div>
          <form onSubmit={handleOfferSave} className="modal-form">
            <div className="form-group">
              <label>Offer Name / Title</label>
              <input type="text" required value={offerForm.name} onChange={e => setOfferForm({...offerForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea required value={offerForm.description} onChange={e => setOfferForm({...offerForm, description: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Promo Code (Optional)</label>
                <input type="text" placeholder="e.g. GETFIT20" value={offerForm.code} onChange={e => setOfferForm({...offerForm, code: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Discount Type</label>
                <select value={offerForm.discountType} onChange={e => setOfferForm({...offerForm, discountType: e.target.value})}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount (NPR)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Discount Value</label>
                <input type="number" required value={offerForm.discountValue} onChange={e => setOfferForm({...offerForm, discountValue: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" required value={offerForm.startDate} onChange={e => setOfferForm({...offerForm, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" required value={offerForm.endDate} onChange={e => setOfferForm({...offerForm, endDate: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Offer Banner Image</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                {offerForm.bannerImage ? (
                  <img src={offerForm.bannerImage} alt="Banner Preview" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid hsla(var(--border))' }} />
                ) : (
                  <div style={{ width: '80px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsla(var(--border), 0.1)', borderRadius: '8px', border: '1px dashed hsla(var(--border))', fontSize: '10px', color: 'hsla(var(--text-muted))' }}>No Banner</div>
                )}
                <input type="file" accept="image/*" onChange={handleOfferBannerUpload} style={{ display: 'none' }} id="offer-banner-file" />
                <label htmlFor="offer-banner-file" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', margin: 0 }}>Upload File</label>
              </div>
              <input type="text" placeholder="Or paste Banner Image URL..." value={offerForm.bannerImage} onChange={e => setOfferForm({...offerForm, bannerImage: e.target.value})} />
            </div>
            <div className="form-row" style={{ gap: '20px', margin: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={offerForm.isActive} onChange={e => setOfferForm({...offerForm, isActive: e.target.checked})} />
                Offer is Active / Published
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowOfferModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: currentAccent }}>Save Offer</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const openEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      name: offer.name,
      description: offer.description || '',
      code: offer.code || '',
      discountType: offer.discount?.type || 'percentage',
      discountValue: offer.discount?.value?.toString() || '',
      startDate: offer.validity?.startDate ? new Date(offer.validity.startDate).toISOString().split('T')[0] : '',
      endDate: offer.validity?.endDate ? new Date(offer.validity.endDate).toISOString().split('T')[0] : '',
      bannerImage: offer.display?.bannerImage || '',
      isActive: offer.isActive !== undefined ? offer.isActive : true
    });
    setShowOfferModal(true);
  };

  const openAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({ name: '', description: '', code: '', discountType: 'percentage', discountValue: '', startDate: '', endDate: '', bannerImage: '', isActive: true });
    setShowOfferModal(true);
  };

  const renderGymOffersTab = () => {
    return (
      <div className="sub-panel animate-fade">
        <div className="card-table-wrapper glass">
          <div className="table-header">
            <h3>Gym Offers & Promotions</h3>
            <button className="btn btn-primary" onClick={openAddOffer} style={{ backgroundColor: currentAccent }}>
              <PlusCircle size={16} /> Create Promo Offer
            </button>
          </div>
          {tabLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>Loading offers...</div>
          ) : offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'hsla(var(--text-muted))', marginBottom: '16px' }}>No active gym promo offers.</p>
              <button className="btn btn-primary" onClick={openAddOffer} style={{ backgroundColor: currentAccent }}>Configure First Promo</button>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Offer Title</th>
                    <th>Description</th>
                    <th>Code / Discount</th>
                    <th>Validity Period</th>
                    <th>Active Status</th>
                    <th>Operator Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(offer => (
                    <tr key={offer._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {offer.display?.bannerImage && <img src={offer.display.bannerImage} alt="" style={{ width: '40px', height: '25px', objectFit: 'cover', borderRadius: '4px' }} />}
                          <strong>{offer.name}</strong>
                        </div>
                      </td>
                      <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offer.description}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{offer.code || 'AUTO'}</span>
                        {offer.discount?.type === 'percentage' ? `${offer.discount.value}% OFF` : `NPR ${offer.discount?.value} OFF`}
                      </td>
                      <td style={{ fontSize: '11px' }}>
                        {new Date(offer.validity?.startDate).toLocaleDateString()} - {new Date(offer.validity?.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          onClick={async () => {
                            const token = localStorage.getItem('saas_token');
                            await fetch(`http://localhost:5000/api/offers/${businessId}/${offer._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Business-Id': businessId },
                              body: JSON.stringify({ isActive: !offer.isActive, status: !offer.isActive ? 'active' : 'paused' })
                            });
                            fetchOffers();
                          }}
                          className={`badge ${offer.isActive ? 'active' : 'pending'}`}
                          style={{ border: 'none', cursor: 'pointer' }}
                        >
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => openEditOffer(offer)} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentAccent }}><Edit size={16} /></button>
                          <button onClick={() => handleOfferDelete(offer._id)} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <OfferModal />
      </div>
    );
  };

  const TrainerModal = () => {
    if (!showTrainerModal) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content glass">
          <div className="modal-header">
            <h3>{editingTrainer ? 'Edit Gym Trainer' : 'Add Gym Trainer'}</h3>
            <button onClick={() => setShowTrainerModal(false)} className="close-btn"><X size={18} /></button>
          </div>
          <form onSubmit={handleTrainerSave} className="modal-form">
            <div className="form-group">
              <label>Trainer Full Name</label>
              <input type="text" required value={trainerForm.name} onChange={e => setTrainerForm({...trainerForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input type="text" placeholder="e.g. Bodybuilding, Yoga, Zumba" required value={trainerForm.specialization} onChange={e => setTrainerForm({...trainerForm, specialization: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Experience (Years / Description)</label>
              <input type="text" placeholder="e.g. 5+ Years Experience" required value={trainerForm.experience} onChange={e => setTrainerForm({...trainerForm, experience: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Trainer Photo</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                {trainerForm.photo ? (
                  <img src={trainerForm.photo} alt="Trainer Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid hsla(var(--border))' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsla(var(--border), 0.1)', borderRadius: '8px', border: '1px dashed hsla(var(--border))', fontSize: '10px', color: 'hsla(var(--text-muted))' }}>No Photo</div>
                )}
                <input type="file" accept="image/*" onChange={handleTrainerPhotoUpload} style={{ display: 'none' }} id="trainer-photo-file" />
                <label htmlFor="trainer-photo-file" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', margin: 0 }}>Upload File</label>
              </div>
              <input type="text" placeholder="Or paste Photo URL..." value={trainerForm.photo} onChange={e => setTrainerForm({...trainerForm, photo: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowTrainerModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: currentAccent }}>Save Trainer</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const openEditTrainer = (trainer) => {
    setEditingTrainer(trainer);
    setTrainerForm({
      name: trainer.name,
      specialization: trainer.specialization,
      experience: trainer.experience,
      photo: trainer.photo || ''
    });
    setShowTrainerModal(true);
  };

  const openAddTrainer = () => {
    setEditingTrainer(null);
    setTrainerForm({ name: '', specialization: '', experience: '', photo: '' });
    setShowTrainerModal(true);
  };

  const renderGymTrainersTab = () => {
    return (
      <div className="sub-panel animate-fade">
        <div className="card-table-wrapper glass">
          <div className="table-header">
            <h3>Club Trainers Registry</h3>
            <button className="btn btn-primary" onClick={openAddTrainer} style={{ backgroundColor: currentAccent }}>
              <PlusCircle size={16} /> Add Gym Trainer
            </button>
          </div>
          {tabLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>Loading trainers...</div>
          ) : trainers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'hsla(var(--text-muted))', marginBottom: '16px' }}>No trainers registered yet.</p>
              <button className="btn btn-primary" onClick={openAddTrainer} style={{ backgroundColor: currentAccent }}>Register First Trainer</button>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Photo / Name</th>
                    <th>Specialization Niche</th>
                    <th>Years Experience</th>
                    <th>Operator Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map(trainer => (
                    <tr key={trainer._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {trainer.photo ? (
                            <img src={trainer.photo} alt={trainer.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '50%' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{trainer.name[0]}</div>
                          )}
                          <strong>{trainer.name}</strong>
                        </div>
                      </td>
                      <td>{trainer.specialization}</td>
                      <td>{trainer.experience}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => openEditTrainer(trainer)} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentAccent }}><Edit size={16} /></button>
                          <button onClick={() => handleTrainerDelete(trainer._id)} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <TrainerModal />
      </div>
    );
  };

  // --- DYNAMIC MODULE TAB SWITCHERS ---
  const renderDynamicSubpanel = () => {
    if (businessType === 'gym') {
      if (activeTab === 'plans') return renderGymPlansTab();
      if (activeTab === 'offers') return renderGymOffersTab();
      if (activeTab === 'trainers') return renderGymTrainersTab();
    }

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
          {!isSuperAdmin && data?.business?.slug && (
            <div style={{ marginTop: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '700', color: 'hsla(var(--text-muted))' }}>Client Booking Portal: </span>
              <a 
                href={`/${data.business.slug}/portal`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: currentAccent, textDecoration: 'underline', fontWeight: '800' }}
              >
                http://localhost:5173/{data.business.slug}/portal
              </a>
            </div>
          )}
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

        /* Modal Popup Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: modalFadeIn 0.2s ease-out;
        }
        .modal-content {
          width: 90%;
          max-width: 550px;
          border-radius: var(--radius-lg);
          border: 1px solid hsla(var(--border-frosted));
          background: hsla(var(--bg-surface-frosted));
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow-xl);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: modalScaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 14px;
        }
        .modal-header h3 {
          font-size: 1.25rem;
          color: hsla(var(--text-main));
          font-weight: 800;
        }
        .close-btn {
          background: none;
          border: none;
          color: hsla(var(--text-muted));
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: hsla(var(--text-main));
        }
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }
        .modal-form .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: hsla(var(--text-main));
        }
        .modal-form .form-group input, 
        .modal-form .form-group select, 
        .modal-form .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background-color: hsla(var(--bg-base), 0.4);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: hsla(var(--text-main));
          outline: none;
          transition: all var(--transition-fast);
        }
        .modal-form .form-group input:focus,
        .modal-form .form-group select:focus,
        .modal-form .form-group textarea:focus {
          border-color: ${currentAccent};
          background-color: hsla(var(--bg-surface));
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          flex: 1;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
          border-top: 1px solid hsla(var(--border-frosted));
          padding-top: 18px;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
