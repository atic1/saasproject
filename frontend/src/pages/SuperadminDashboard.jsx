import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, Activity, AlertCircle, RefreshCw } from 'lucide-react';

const SuperadminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:5000/api/dashboard/superadmin')
      .then(res => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to connect to server');
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16 px-4">
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Unavailable</h2>
          <p className="text-gray-400 text-sm mb-6">
            {error || 'Could not load dashboard data.'}<br />
            <span className="text-gray-500 text-xs mt-1 block">Make sure the backend server is running on port 5000.</span>
          </p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Dashboard ---
  const stats = [
    {
      label: 'Total Businesses',
      value: data.stats.totalBusinesses,
      icon: Building2,
      color: 'from-purple-600 to-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Total Users',
      value: data.stats.totalUsers,
      icon: Users,
      color: 'from-blue-600 to-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Monthly Revenue',
      value: `NPR ${data.stats.monthlyRecurringRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-600 to-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const statusColors = {
    active:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    inactive: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
    pending:  'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Superadmin Overview</h1>
          <p className="text-gray-400 mt-1">Monitor your SaaS platform's real-time performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-6 ${bg} backdrop-blur-sm`}>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-4`}>
                <Icon size={22} className="text-white" />
              </div>
              <p className="text-gray-400 text-sm font-medium">{label}</p>
              <p className="text-2xl font-black text-white mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white">Registered Businesses</h2>
            <Activity size={18} className="text-gray-500" />
          </div>

          {data.businesses.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p>No businesses registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 text-left font-semibold">Business Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Type</th>
                    <th className="px-6 py-3 text-left font-semibold">Plan</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data.businesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{business.name}</td>
                      <td className="px-6 py-4 text-gray-300 capitalize">{business.type}</td>
                      <td className="px-6 py-4 text-gray-300 capitalize">{business.plan}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[business.status] || statusColors.inactive}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {business.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">NPR {business.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SuperadminDashboard;
