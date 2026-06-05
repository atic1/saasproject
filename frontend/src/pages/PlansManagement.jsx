import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, Globe, Bell, Menu, X, Plus, Package, Tag, Users, CalendarDays
} from 'lucide-react';

const PlansManagement = () => {
  const { businessId } = useParams();
  const [plans, setPlans] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    pricing: { basePrice: 0 },
    duration: { value: 1, unit: 'month' }
  });

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saas_token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-Business-Id'] = businessId;
      }

      const [plansRes, offersRes] = await Promise.all([
        fetch(`http://localhost:5000/api/plans/${businessId}`, { headers }),
        fetch(`http://localhost:5000/api/offers/${businessId}`, { headers })
      ]);
      const plansData = await plansRes.json();
      const offersData = await offersRes.json();
      setPlans(Array.isArray(plansData) ? plansData : []);
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('saas_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-Business-Id'] = businessId;
      }

      const res = await fetch(`http://localhost:5000/api/plans/${businessId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newPlan)
      });
      if (res.ok) {
        setShowPlanModal(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 dark:text-white capitalize truncate">Business Admin</h2>
            <button className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <Link to={`/admin/${businessId}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">
              <LayoutDashboard size={20} />
              Overview
            </Link>
            <Link to={`/admin/${businessId}/plans`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold transition-colors">
              <Package size={20} />
              Plans & Offers
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">
              <CalendarDays size={20} />
              Bookings
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">
              <Users size={20} />
              Customers
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">
              <Globe size={20} />
              Website Editor
            </a>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">
              <Settings size={20} />
              Settings
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto relative">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Plans & Offers</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setShowPlanModal(true)} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-purple-500/20">
               <Plus size={18} />
               Create Plan
             </button>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
          {loading ? (
             <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              {/* Plans Grid */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="text-purple-500" /> Active Pricing Plans
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.length === 0 ? (
                    <div className="col-span-full py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl text-center">
                      <Package size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white">No plans created yet.</p>
                      <p className="text-gray-500 mt-1 mb-4">Create your first subscription package!</p>
                      <button onClick={() => setShowPlanModal(true)} className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-purple-500/20">
                         <Plus size={18} /> Add Plan
                       </button>
                    </div>
                  ) : (
                    plans.map(plan => (
                      <div key={plan._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                          <span className="px-2.5 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg uppercase">Active</span>
                        </div>
                        <div className="mb-6">
                          <span className="text-3xl font-black text-gray-900 dark:text-white">NPR {plan.pricing.basePrice}</span>
                          <span className="text-gray-500 dark:text-gray-400 font-medium"> / {plan.duration.value} {plan.duration.unit}</span>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-sm text-gray-500">{plan.limits?.currentMembers || 0} active subscribers</span>
                          <button className="text-purple-600 dark:text-purple-400 font-semibold text-sm hover:underline">Edit</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Offers Grid */}
              <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Tag className="text-blue-500" /> Promotional Offers
                  </h2>
                  <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Create Offer</button>
                </div>
                {offers.length === 0 ? (
                  <div className="py-12 bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl text-center">
                    <Tag size={32} className="mx-auto text-gray-400 mb-3 opacity-50" />
                    <p className="text-gray-500 dark:text-gray-400">No active promotional offers.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Render offers here */}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* Create Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Plan</h2>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Plan Name</label>
                <input required type="text" placeholder="e.g., Monthly VIP" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price (NPR)</label>
                  <input required type="number" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" value={newPlan.pricing.basePrice} onChange={e => setNewPlan({...newPlan, pricing: { basePrice: Number(e.target.value) }})} />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Duration</label>
                   <select className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" value={newPlan.duration.unit} onChange={e => setNewPlan({...newPlan, duration: { ...newPlan.duration, unit: e.target.value }})}>
                     <option value="day">Daily</option>
                     <option value="week">Weekly</option>
                     <option value="month">Monthly</option>
                     <option value="year">Yearly</option>
                   </select>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowPlanModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/30 transition-colors">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlansManagement;
