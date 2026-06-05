import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Search, CheckCircle, XCircle, Trash2, PauseCircle,
  PlayCircle, RefreshCw, AlertTriangle, Filter, MapPin, Phone,
  Mail, CalendarDays
} from 'lucide-react';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border font-semibold text-sm ${
    type === 'success' ? 'bg-emerald-900 border-emerald-500/40 text-emerald-300'
    : type === 'error' ? 'bg-red-900 border-red-500/40 text-red-300'
    : 'bg-amber-900 border-amber-500/40 text-amber-300'
  }`}>
    {type === 'success' ? <CheckCircle size={18} /> : type === 'error' ? <XCircle size={18} /> : <AlertTriangle size={18} />}
    {message}
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><XCircle size={14} /></button>
  </div>
);

const ConfirmModal = ({ title, description, confirmLabel, confirmClass, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
      <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="text-red-400" size={28} />
      </div>
      <h3 className="text-lg font-bold text-white text-center mb-2">{title}</h3>
      <p className="text-gray-400 text-sm text-center mb-6">{description}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 font-semibold transition-all">Cancel</button>
        <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold transition-all hover:-translate-y-0.5 ${confirmClass}`}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

const STATUS_CONFIG = {
  active:              { label: 'Active',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  pending:             { label: 'Pending',   cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30'  },
  pending_verification:{ label: 'Pending',   cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30'  },
  suspended:           { label: 'Suspended', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  rejected:            { label: 'Rejected',  cls: 'bg-red-500/10    text-red-400    border-red-500/30'    },
};

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' },
];

const SuperAdminBusinessesPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBusinesses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (search.trim()) params.set('search', search.trim());

    fetch(`http://localhost:5000/api/superadmin/businesses?${params}`, {
      headers: { 'x-user-role': 'super_admin' }
    })
      .then(r => r.json())
      .then(data => { setBusinesses(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { showToast('Failed to load businesses', 'error'); setLoading(false); });
  }, [filter, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBusinesses(), 300);
    return () => clearTimeout(timer);
  }, [fetchBusinesses]);

  const handleStatusChange = async (id, status, businessName) => {
    setConfirmModal(null);
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/businesses/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'super_admin' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        const msgs = {
          active: `✅ "${businessName}" has been reactivated.`,
          suspended: `⏸️ "${businessName}" has been suspended.`,
          rejected: `❌ "${businessName}" has been rejected.`,
        };
        showToast(msgs[status] || 'Status updated.', status === 'active' ? 'success' : 'warning');
        fetchBusinesses();
      } else {
        showToast(data.message || 'Action failed', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, businessName) => {
    setConfirmModal(null);
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/businesses/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'super_admin' }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🗑️ "${businessName}" permanently deleted.`, 'warning');
        fetchBusinesses();
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          description={confirmModal.description}
          confirmLabel={confirmModal.confirmLabel}
          confirmClass={confirmModal.confirmClass}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">All Businesses</h1>
        <p className="text-gray-400 text-sm">Search, filter, and manage all registered tenants on the platform.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} className="text-gray-500 flex-shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === f.value
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button onClick={fetchBusinesses} className="p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-gray-500 text-sm mb-4">{businesses.length} business{businesses.length !== 1 ? 'es' : ''} found</p>
      )}

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="py-24 text-center">
            <Building2 size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 font-medium">No businesses found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="px-6 py-4 text-left font-semibold">Business</th>
                  <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Contact</th>
                  <th className="px-6 py-4 text-left font-semibold hidden lg:table-cell">Registered</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {businesses.map(biz => {
                  const sc = STATUS_CONFIG[biz.status] || STATUS_CONFIG.pending;
                  const isLoading = actionLoading === biz.id;
                  const isActive = biz.status === 'active';
                  const isSuspended = biz.status === 'suspended';

                  return (
                    <tr key={biz.id} className="hover:bg-gray-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/20 flex-shrink-0">
                            {biz.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">{biz.name}</p>
                            <p className="text-xs text-gray-500 capitalize mt-0.5">{biz.type} · {biz.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="space-y-1">
                          {biz.email !== 'N/A' && (
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                              <Mail size={11} className="text-gray-600" />{biz.email}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                            <Phone size={11} className="text-gray-600" />{biz.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <CalendarDays size={11} />
                          {new Date(biz.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isActive && (
                            <button
                              disabled={isLoading}
                              onClick={() => setConfirmModal({
                                title: 'Suspend Business?',
                                description: `Suspending "${biz.name}" will lock them out of their dashboard immediately.`,
                                confirmLabel: 'Suspend',
                                confirmClass: 'bg-orange-600 hover:bg-orange-500',
                                onConfirm: () => handleStatusChange(biz.id, 'suspended', biz.name)
                              })}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 text-xs font-semibold transition-all disabled:opacity-50"
                            >
                              <PauseCircle size={13} /> Suspend
                            </button>
                          )}
                          {isSuspended && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(biz.id, 'active', biz.name)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold transition-all disabled:opacity-50"
                            >
                              <PlayCircle size={13} /> Reactivate
                            </button>
                          )}
                          {biz.status === 'pending' || biz.status === 'pending_verification' ? (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(biz.id, 'active', biz.name)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold transition-all disabled:opacity-50"
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                          ) : null}
                          <button
                            disabled={isLoading}
                            onClick={() => setConfirmModal({
                              title: 'Delete Permanently?',
                              description: `This will delete "${biz.name}" and ALL its data. This action cannot be undone.`,
                              confirmLabel: 'Delete',
                              confirmClass: 'bg-red-700 hover:bg-red-600',
                              onConfirm: () => handleDelete(biz.id, biz.name)
                            })}
                            className="p-2 rounded-lg bg-gray-800 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                            title="Delete permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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

export default SuperAdminBusinessesPage;
