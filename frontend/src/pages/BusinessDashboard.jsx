import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, DollarSign, CalendarDays, ClipboardList, 
  LayoutDashboard, Settings, Globe, Bell, Menu, X, CheckCircle2, Clock, Package,
  Shield, AlertTriangle, XCircle
} from 'lucide-react';

const BusinessDashboard = () => {
  const { businessId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/dashboard/business/${businessId}`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!data || data.message || !data.business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workspace Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{data?.message || 'Could not load business details.'}</p>
          <Link to="/" className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 transition-opacity">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Status gate — block non-active businesses
  const businessStatus = data.business?.status;
  if (businessStatus && businessStatus !== 'active') {
    const statusConfig = {
      pending: {
        icon: Shield,
        iconBg: 'bg-amber-100 dark:bg-amber-500/10',
        iconColor: 'text-amber-500',
        title: 'Awaiting Approval',
        description: 'Your business registration is currently under review by our platform team. You will receive a notification once your account is approved.',
        badge: 'Pending Review',
        badgeBg: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
      },
      pending_verification: {
        icon: Shield,
        iconBg: 'bg-amber-100 dark:bg-amber-500/10',
        iconColor: 'text-amber-500',
        title: 'Awaiting Approval',
        description: 'Your business registration is currently under review by our platform team. You will receive a notification once your account is approved.',
        badge: 'Pending Review',
        badgeBg: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
      },
      suspended: {
        icon: AlertTriangle,
        iconBg: 'bg-orange-100 dark:bg-orange-500/10',
        iconColor: 'text-orange-500',
        title: 'Account Suspended',
        description: 'Your business account has been temporarily suspended. Please contact our support team to resolve this issue and reinstate access.',
        badge: 'Suspended',
        badgeBg: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
      },
      rejected: {
        icon: XCircle,
        iconBg: 'bg-red-100 dark:bg-red-500/10',
        iconColor: 'text-red-500',
        title: 'Registration Rejected',
        description: 'Unfortunately, your registration has been rejected by our platform team. Please ensure all business details are accurate and re-apply.',
        badge: 'Rejected',
        badgeBg: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
      },
    };
    const cfg = statusConfig[businessStatus] || statusConfig.pending;
    const IconComp = cfg.icon;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl relative z-10">
          <div className={`w-20 h-20 ${cfg.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <IconComp className={cfg.iconColor} size={38} />
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-4 ${cfg.badgeBg}`}>{cfg.badge}</span>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{cfg.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">{cfg.description}</p>
          <div className="space-y-3">
            <a href="mailto:support@biznepal.com" className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:from-purple-500 hover:to-blue-400 transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/25">
              Contact Support
            </a>
            <Link to="/" className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { business, recentBookings } = data;

  const stats = [
    { label: 'Total Customers', value: business.members, icon: Users, color: 'from-blue-600 to-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' },
    { label: 'Monthly Revenue', value: `NPR ${business.revenue.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-600 to-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
    { label: 'Upcoming Bookings', value: recentBookings ? recentBookings.length : 0, icon: CalendarDays, color: 'from-purple-600 to-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20' }
  ];

  const statusColors = {
    confirmed: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    pending: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    cancelled: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30'
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
            <h2 className="text-xl font-black text-gray-900 dark:text-white capitalize truncate">{business.name}</h2>
            <button className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <Link to={`/admin/${businessId}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold transition-colors">
              <LayoutDashboard size={20} />
              Overview
            </Link>
            <Link to={`/admin/${businessId}/plans`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">
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
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Manage your {business.type} operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
              {business.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`group rounded-3xl border p-6 ${bg} backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${color} mb-5 shadow-lg opacity-90 group-hover:opacity-100 transition-opacity`}>
                  <Icon size={24} className="text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">{label}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Bookings Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <ClipboardList size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Appointments</h2>
              </div>
              <button className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                View All
              </button>
            </div>

            {(!recentBookings || recentBookings.length === 0) ? (
              <div className="py-20 text-center text-gray-500 dark:text-gray-400">
                <CalendarDays size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-300">No appointments found</p>
                <p className="text-sm mt-1">When customers book services, they will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                      <th className="px-6 py-4 text-left font-semibold">Customer</th>
                      <th className="px-6 py-4 text-left font-semibold">Service</th>
                      <th className="px-6 py-4 text-left font-semibold">Date & Time</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs">
                              {booking.customer.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{booking.customer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 capitalize font-medium">{booking.type}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <CalendarDays size={14} className="text-gray-400" />
                            <span>{booking.date}</span>
                            <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                            <Clock size={14} className="text-gray-400" />
                            <span>{booking.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${statusColors[booking.status] || statusColors.pending}`}>
                            {booking.status === 'confirmed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessDashboard;
