import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, CheckCircle, XCircle, Trash2, Building2, Mail,
  Phone, MapPin, CalendarDays, RefreshCw, AlertTriangle, User
} from 'lucide-react';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border font-semibold text-sm animate-in slide-in-from-bottom-4 duration-300 ${
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

const SuperAdminPendingPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPending = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/superadmin/businesses?status=pending', {
      headers: { 'x-user-role': 'super_admin' }
    })
      .then(r => r.json())
      .then(data => { setBusinesses(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { showToast('Failed to load pending businesses', 'error'); setLoading(false); });
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleStatusChange = async (id, status, businessName) => {
    setActionLoading(id + status);
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/businesses/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'super_admin' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        const msg = status === 'active'
          ? `✅ "${businessName}" has been approved and notified.`
          : `❌ "${businessName}" has been rejected.`;
        showToast(msg, status === 'active' ? 'success' : 'warning');
        fetchPending();
      } else {
        showToast(data.message || 'Action failed', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, businessName) => {
    setConfirmModal(null);
    setActionLoading(id + 'delete');
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/businesses/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'super_admin' }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🗑️ "${businessName}" permanently deleted.`, 'warning');
        fetchPending();
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Pending Approvals</h1>
            {businesses.length > 0 && (
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold">
                {businesses.length} waiting
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">Review and approve or reject new business registrations.</p>
        </div>
        <button onClick={fetchPending} className="p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl py-24 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">All caught up!</h3>
          <p className="text-gray-400 text-sm">No businesses are currently awaiting approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map(biz => (
            <div key={biz.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Business Info */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/20 flex-shrink-0">
                        {biz.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-tight">{biz.name}</h3>
                        <span className="text-xs text-gray-400 capitalize bg-gray-800 px-2 py-0.5 rounded-full">{biz.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-gray-500 flex-shrink-0" />
                      <span>{biz.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-gray-500 flex-shrink-0" />
                      <span className="truncate">{biz.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-gray-500 flex-shrink-0" />
                      <span>{biz.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-gray-500 flex-shrink-0" />
                      <span className="capitalize">{biz.city}{biz.address ? `, ${biz.address}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={13} className="text-gray-500 flex-shrink-0" />
                      <span>Registered {new Date(biz.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex flex-col items-start lg:items-center gap-2">
                  <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Clock size={11} /> Pending Review
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    disabled={actionLoading === biz.id + 'active'}
                    onClick={() => handleStatusChange(biz.id, 'active', biz.name)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-wait"
                  >
                    <CheckCircle size={15} />
                    {actionLoading === biz.id + 'active' ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    disabled={actionLoading === biz.id + 'rejected'}
                    onClick={() => setConfirmModal({
                      title: 'Reject Business?',
                      description: `Are you sure you want to reject "${biz.name}"? They will be notified of this decision.`,
                      confirmLabel: 'Reject',
                      confirmClass: 'bg-red-600 hover:bg-red-500',
                      onConfirm: () => handleStatusChange(biz.id, 'rejected', biz.name)
                    })}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                  <button
                    disabled={actionLoading === biz.id + 'delete'}
                    onClick={() => setConfirmModal({
                      title: 'Permanently Delete?',
                      description: `This will permanently delete "${biz.name}" and ALL associated data (bookings, plans, customers). This cannot be undone.`,
                      confirmLabel: 'Delete Permanently',
                      confirmClass: 'bg-red-700 hover:bg-red-600',
                      onConfirm: () => handleDelete(biz.id, biz.name)
                    })}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminPendingPage;
