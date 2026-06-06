import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, CheckCircle, Clock, XCircle, Activity,
  ArrowUpRight, CalendarDays, TrendingUp, RefreshCw
} from 'lucide-react';

const statusConfig = {
  active:              { label: 'Active',   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  pending:             { label: 'Pending',  cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30'  },
  pending_verification:{ label: 'Pending',  cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30'  },
  suspended:           { label: 'Suspended',cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  rejected:            { label: 'Rejected', cls: 'bg-red-500/10    text-red-400    border-red-500/30'    },
  deleted:             { label: 'Deleted',  cls: 'bg-gray-500/10   text-gray-400   border-gray-500/30'   },
};

const SuperAdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:5000/api/superadmin/dashboard', {
      headers: { 'x-user-role': 'super_admin' }
    })
      .then(r => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <XCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Unavailable</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentRegistrations } = data;

  const statCards = [
    { label: 'Total Businesses', value: stats.total,     icon: Building2,    color: 'from-purple-600 to-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Active',           value: stats.active,    icon: CheckCircle,  color: 'from-emerald-600 to-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pending Approval', value: stats.pending,   icon: Clock,        color: 'from-amber-600 to-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Rejected',         value: stats.rejected,  icon: XCircle,      color: 'from-red-600 to-red-400',       bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Suspended',        value: stats.suspended, icon: Activity,     color: 'from-orange-600 to-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Overview</h1>
          <p className="text-gray-400 mt-1 text-sm">Monitor all tenant businesses and platform health.</p>
        </div>
        <button onClick={fetchData} className="p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-5 ${bg} hover:-translate-y-0.5 transition-transform duration-200`}>
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${color} mb-3 shadow-lg`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-gray-400 text-xs font-medium leading-tight">{label}</p>
            <p className="text-3xl font-black text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/superadmin/pending" className="group flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 hover:bg-amber-500/20 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/20">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-white">Pending Approvals</p>
              <p className="text-amber-400 text-sm">{stats.pending} businesses awaiting review</p>
            </div>
          </div>
          <ArrowUpRight size={18} className="text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
        <Link to="/superadmin/businesses" className="group flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 hover:bg-purple-500/20 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/20">
              <Building2 size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="font-bold text-white">All Businesses</p>
              <p className="text-purple-400 text-sm">Manage {stats.total} registered tenants</p>
            </div>
          </div>
          <ArrowUpRight size={18} className="text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <TrendingUp size={16} className="text-purple-400" />
            </div>
            <h2 className="font-bold text-white">Recent Registrations</h2>
          </div>
          <Link to="/superadmin/businesses" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            View All →
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>No businesses registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="px-6 py-3 text-left font-semibold">Business Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Type</th>
                  <th className="px-6 py-3 text-left font-semibold">City</th>
                  <th className="px-6 py-3 text-left font-semibold">Registered</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {recentRegistrations.map(b => {
                  const sc = statusConfig[b.status] || statusConfig.pending;
                  return (
                    <tr key={b.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{b.name}</td>
                      <td className="px-6 py-4 text-gray-300 capitalize">{b.type}</td>
                      <td className="px-6 py-4 text-gray-300 capitalize">{b.city}</td>
                      <td className="px-6 py-4 text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={12} />
                          {new Date(b.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
