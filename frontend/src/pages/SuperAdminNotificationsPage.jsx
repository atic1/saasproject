import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Clock, MessageSquare, AlertCircle, CheckCircle,
  Building2, Mail, Phone, RefreshCw, XCircle, CalendarDays,
  ShieldAlert, Inbox
} from 'lucide-react';

const TABS = [
  { id: 'signups',       label: 'New Registrations', icon: Building2 },
  { id: 'support',       label: 'Support Requests',  icon: MessageSquare },
  { id: 'subscriptions', label: 'Expiring Soon',     icon: AlertCircle },
];

const SuperAdminNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('signups');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/superadmin/notifications', {
      headers: { 'x-user-role': 'super_admin' }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolveTicket = async (ticketId) => {
    setResolvingId(ticketId);
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/support-tickets/${ticketId}/resolve`, {
        method: 'PUT',
        headers: { 'x-user-role': 'super_admin' }
      });
      const result = await res.json();
      if (result.success) {
        setData(prev => ({ ...prev, supportTickets: result.tickets }));
      }
    } catch {}
    setResolvingId(null);
  };

  const getBadgeCount = (tabId) => {
    if (!data) return 0;
    if (tabId === 'signups') return data.pendingSignups?.length || 0;
    if (tabId === 'support') return data.supportTickets?.filter(t => t.status === 'unread').length || 0;
    if (tabId === 'subscriptions') return data.subscriptionWarnings?.length || 0;
    return 0;
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Notifications</h1>
          <p className="text-gray-400 text-sm">Monitor platform activity, support requests, and subscription warnings.</p>
        </div>
        <button onClick={fetchData} className="p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-0">
        {TABS.map(tab => {
          const badgeCount = getBadgeCount(tab.id);
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                isActive
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              {badgeCount > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  isActive ? 'bg-purple-500/30 text-purple-300' : 'bg-red-500 text-white'
                }`}>
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* New Registrations */}
          {activeTab === 'signups' && (
            <div className="space-y-3">
              {!data?.pendingSignups?.length ? (
                <EmptyState icon={Inbox} title="No pending signups" subtitle="All registrations have been reviewed." />
              ) : data.pendingSignups.map(biz => (
                <div key={biz.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex items-center gap-4 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0">
                    {biz.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{biz.name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                      {biz.email !== 'N/A' && (
                        <span className="flex items-center gap-1"><Mail size={10} className="text-gray-600" />{biz.email}</span>
                      )}
                      <span className="flex items-center gap-1"><Phone size={10} className="text-gray-600" />{biz.phone}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={10} className="text-gray-600" />{formatTimeAgo(biz.createdAt)}</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Clock size={10} /> Pending
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Support Tickets */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              {!data?.supportTickets?.length ? (
                <EmptyState icon={MessageSquare} title="No support requests" subtitle="Your inbox is clear." />
              ) : data.supportTickets.map(ticket => (
                <div key={ticket.id} className={`bg-gray-900 border rounded-2xl p-5 transition-all ${
                  ticket.status === 'unread' ? 'border-purple-500/30' : 'border-gray-800 opacity-60'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        ticket.status === 'unread' ? 'bg-purple-500/20' : 'bg-gray-800'
                      }`}>
                        <MessageSquare size={16} className={ticket.status === 'unread' ? 'text-purple-400' : 'text-gray-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-white text-sm">{ticket.businessName}</p>
                          {ticket.status === 'unread' && (
                            <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{ticket.ownerName} · {ticket.email}</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{ticket.message}</p>
                        <p className="text-xs text-gray-600 mt-2">{formatTimeAgo(ticket.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {ticket.status === 'unread' ? (
                        <button
                          disabled={resolvingId === ticket.id}
                          onClick={() => handleResolveTicket(ticket.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          <CheckCircle size={12} />
                          {resolvingId === ticket.id ? 'Resolving…' : 'Resolve'}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-500 rounded-lg text-xs font-semibold">
                          <CheckCircle size={12} /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expiring Subscriptions */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-3">
              {!data?.subscriptionWarnings?.length ? (
                <EmptyState icon={CheckCircle} title="No expiring subscriptions" subtitle="All businesses have active subscriptions within the next 7 days." />
              ) : data.subscriptionWarnings.map(biz => (
                <div key={biz.id} className={`bg-gray-900 border rounded-2xl p-5 flex items-center gap-4 ${
                  biz.daysRemaining <= 2 ? 'border-red-500/30' : 'border-amber-500/20'
                }`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    biz.daysRemaining <= 2 ? 'bg-red-500/20' : 'bg-amber-500/20'
                  }`}>
                    <ShieldAlert size={20} className={biz.daysRemaining <= 2 ? 'text-red-400' : 'text-amber-400'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{biz.businessName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">Plan: {biz.plan}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-black ${biz.daysRemaining <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
                      {biz.daysRemaining}d
                    </p>
                    <p className="text-xs text-gray-500">remaining</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl py-20 text-center">
    <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon size={24} className="text-gray-600" />
    </div>
    <p className="font-bold text-gray-400">{title}</p>
    <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
  </div>
);

export default SuperAdminNotificationsPage;
