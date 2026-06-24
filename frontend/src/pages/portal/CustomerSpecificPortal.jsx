import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, Clock, CreditCard, User, LogOut, CheckCircle, 
  AlertCircle, Phone, MapPin, Loader2, Sparkles, 
  ChevronRight, X, ArrowRight, CheckCheck, UserCheck, ShieldAlert 
} from 'lucide-react';

const ACCENT = {
  gym: {
    btn: "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/30",
    text: "text-orange-600",
    textDark: "dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-500",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    gradient: "from-orange-600 via-orange-500 to-amber-500"
  },
  salon: {
    btn: "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/30",
    text: "text-pink-600",
    textDark: "dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-500",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400",
    gradient: "from-pink-600 via-pink-500 to-rose-400"
  },
  clinic: {
    btn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30",
    text: "text-emerald-600",
    textDark: "dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    gradient: "from-emerald-600 via-emerald-500 to-teal-400"
  }
};

const STATUS_STYLES = {
  confirmed: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  no_show: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

export default function CustomerSpecificPortal() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { user, login, logout, isAuthenticated, setAuthenticatedUser } = useAuth();

  // Portal Data States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active UI tab
  const [activeTab, setActiveTab] = useState('bookings');

  // Checkout and Gateway Loading State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payGateway, setPayGateway] = useState('mock'); // 'mock' or 'esewa'
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [payError, setPayError] = useState('');

  // Auth Dialog for checkout (if guest clicks Pay)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Fetch all Portal info
  const fetchPortalData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`http://localhost:5000/api/portal/customer/${customerId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Customer profile link is invalid or expired.');
        throw new Error('Failed to connect to portal service.');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [customerId]);

  // Handle Login or Registration before payment checkout
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        const identifier = authForm.phone || authForm.email;
        if (!identifier) throw new Error('Please enter phone number or email');
        await login(identifier, authForm.password);
        setShowAuthModal(false);
        setAuthForm({ name: '', phone: '', email: '', password: '' });
      } else {
        if (!authForm.name || !authForm.phone || !authForm.password) {
          throw new Error('Name, Phone and Password are required');
        }
        const res = await fetch('http://localhost:5000/api/auth/customer/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authForm.name,
            phone: authForm.phone,
            email: authForm.email || undefined,
            password: authForm.password,
            businessId: data.business._id
          })
        });
        const regData = await res.json();
        if (!res.ok) throw new Error(regData.message || 'Registration failed');
        setAuthenticatedUser(regData.user, regData.token);
        setShowAuthModal(false);
        setAuthForm({ name: '', phone: '', email: '', password: '' });
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Payment Redirection Handler
  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    if (!isAuthenticated) {
      setAuthError('');
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!selectedInvoice) return;
    setCheckoutLoading(true);
    setPayError('');

    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice._id,
          method: payGateway
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Payment initiation failed.');

      const checkout = resData.checkout;
      if (checkout.type === 'redirect') {
        window.location.href = checkout.url;
      } else if (checkout.type === 'form') {
        const form = document.createElement('form');
        form.method = checkout.method || 'POST';
        form.action = checkout.url;
        Object.keys(checkout.fields).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = checkout.fields[key];
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setPayError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-purple-500" />
          <p className="text-gray-400 font-medium">Resolving your custom portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4 text-center">
        <div className="w-16 h-16 bg-red-950/30 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Portal Unavailable</h1>
        <p className="text-gray-500 max-w-md mb-8">{error || 'The requested customer portal link is invalid.'}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all">
          Go back to Home
        </button>
      </div>
    );
  }

  const { customer, business, bookings, invoices } = data;
  const a = ACCENT[business.type] || ACCENT.gym;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-between">
      
      {/* ── Outer Content Wrapper ── */}
      <div>
        {/* ── Banner Header ── */}
        <div className={`relative bg-gradient-to-br ${a.gradient} py-12 px-6 overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <span className="bg-white/25 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 inline-block">
                {business.type.toUpperCase()} client portal
              </span>
              <h1 className="text-3xl font-black text-white leading-none capitalize">{business.name}</h1>
              <p className="text-white/80 text-sm mt-1.5 flex items-center gap-1">
                <MapPin size={14} /> {business.contact?.address || 'Nepal'}, {business.contact?.city || ''}
              </p>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center font-black text-white text-lg">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Portal Registered</p>
                <h4 className="text-sm font-black text-white">{customer.name}</h4>
              </div>
              {isAuthenticated && (
                <button onClick={logout} className="p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-colors ml-2" title="Log Out">
                  <LogOut size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Layout Grids ── */}
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Customer Profile Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User size={16} className={a.textDark} /> Customer Account
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-gray-500 block text-xs">Full Name</label>
                  <span className="font-bold text-white block">{customer.name}</span>
                </div>
                <div>
                  <label className="text-gray-500 block text-xs">Phone Number</label>
                  <span className="font-bold text-white block">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div>
                    <label className="text-gray-500 block text-xs">Email Address</label>
                    <span className="font-semibold text-white block break-all">{customer.email}</span>
                  </div>
                )}
                <hr className="border-gray-800 my-2" />
                <div>
                  <label className="text-gray-500 block text-xs">Membership Status</label>
                  <span className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 ${
                    customer.membership?.status === 'active' ? 'bg-green-950/50 text-green-400 border border-green-800' : 'bg-yellow-950/50 text-yellow-500 border border-yellow-800'
                  }`}>
                    <UserCheck size={12} /> {customer.membership?.status || 'Pending'}
                  </span>
                </div>
                {customer.membership?.planId?.name && (
                  <div>
                    <label className="text-gray-500 block text-xs">Subscribed Plan</label>
                    <span className={`font-black block ${a.textDark || a.text}`}>{customer.membership.planId.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            {customer.emergencyContact?.name && (
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Emergency Contact</h3>
                <div className="text-sm space-y-2">
                  <p className="font-bold text-white">{customer.emergencyContact.name}</p>
                  <p className="text-gray-400 flex items-center gap-1.5"><Phone size={12} /> {customer.emergencyContact.phone}</p>
                  <p className="text-xs text-gray-500 italic">Relation: {customer.emergencyContact.relation || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bookings & Payments Column */}
          <div className="md:col-span-2 space-y-5">
            
            {/* Tab selector */}
            <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-gray-850 shadow-inner">
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 py-2.5 text-center rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'bookings' 
                    ? `bg-gray-800 text-white shadow-md` 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Bookings ({bookings.length})
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className={`flex-1 py-2.5 text-center rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'payments' 
                    ? `bg-gray-800 text-white shadow-md` 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Invoices & Bills ({invoices.length})
              </button>
            </div>

            {/* Bookings Display */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center">
                    <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white">No Bookings Placed</h4>
                    <p className="text-sm text-gray-500 mt-1">This customer profile has no active calendar bookings.</p>
                  </div>
                ) : (
                  bookings.map(booking => (
                    <div key={booking._id} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-sm hover:border-gray-700 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-white">{booking.serviceName}</h4>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs mt-2 text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} /> 
                              {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} /> {booking.startTime} - {booking.endTime}
                            </span>
                            {booking.staffName && (
                              <span className="flex items-center gap-1">
                                <User size={13} /> {booking.staffName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-0 border-gray-800 pt-3 sm:pt-0">
                          <span className="text-xs text-gray-500">Service Fee</span>
                          <span className="text-base font-black text-white">NPR {booking.duration ? booking.serviceId?.price || '' : ''}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Invoices Display */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {invoices.length === 0 ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center">
                    <CreditCard size={48} className="text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white">No Bills Generated</h4>
                    <p className="text-sm text-gray-500 mt-1">There are no billing records or transaction slips available.</p>
                  </div>
                ) : (
                  invoices.map(inv => (
                    <div key={inv._id} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-sm hover:border-gray-700 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-white">Invoice #{inv.invoiceNumber}</h4>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              inv.status === 'paid' ? 'bg-green-950/40 text-green-400' : 'bg-red-950/40 text-red-500'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Description: {inv.planId?.name ? `Membership: ${inv.planId.name}` : `Booking appointment billing`}</p>
                          <p className="text-xs text-gray-500">Due Date: {new Date(inv.dueDate).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-4 justify-between sm:justify-start border-t sm:border-0 border-gray-800 pt-3 sm:pt-0">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Amount</p>
                            <p className="text-lg font-black text-white">NPR {inv.total}</p>
                          </div>
                          
                          {inv.status === 'pending' && (
                            <button 
                              onClick={() => handlePayClick(inv)}
                              className={`px-4 py-2 bg-gradient-to-br ${a.gradient} text-white font-bold text-xs rounded-xl shadow-lg transition-transform hover:-translate-y-0.5`}
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="text-center py-6 border-t border-gray-900 text-xs text-gray-600 bg-gray-950">
        <p>&copy; 2026 {business.name}. Powered by BizNepal Multi-Tenant Portal. All rights reserved.</p>
      </footer>

      {/* ── AUTH MODAL FOR CHECKOUT ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl animate-slide-up">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-white text-center mb-1">Secure Sign In</h3>
            <p className="text-xs text-gray-500 text-center mb-4">You need to log in to complete your checkout.</p>

            <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-850 mb-4">
              <button 
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login' ? 'bg-gray-800 text-white' : 'text-gray-400'
                }`}
              >
                Log In
              </button>
              <button 
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register' ? 'bg-gray-800 text-white' : 'text-gray-400'
                }`}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div className="bg-red-950/20 text-red-400 border border-red-900/40 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" required
                    placeholder="John Doe"
                    value={authForm.name}
                    onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    className={`w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-${business.type === 'salon' ? 'pink-500' : business.type === 'clinic' ? 'emerald-500' : 'orange-500'}/40 focus:${a.border}`}
                  />
                </div>
              )}
              
              <div>
                <label className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Phone Number</label>
                <input 
                  type="tel" required
                  placeholder="98XXXXXXXX"
                  value={authForm.phone}
                  onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                  className={`w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-${business.type === 'salon' ? 'pink-500' : business.type === 'clinic' ? 'emerald-500' : 'orange-500'}/40 focus:${a.border}`}
                />
              </div>

              <div>
                <label className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Email (Optional)</label>
                <input 
                  type="email"
                  placeholder="john@example.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  className={`w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-${business.type === 'salon' ? 'pink-500' : business.type === 'clinic' ? 'emerald-500' : 'orange-500'}/40 focus:${a.border}`}
                />
              </div>

              <div>
                <label className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Password</label>
                <input 
                  type="password" required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  className={`w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-${business.type === 'salon' ? 'pink-500' : business.type === 'clinic' ? 'emerald-500' : 'orange-500'}/40 focus:${a.border}`}
                />
              </div>

              <button 
                type="submit" disabled={authLoading}
                className={`w-full py-2.5 mt-2 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 ${a.btn}`}
              >
                {authLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Continue Checkout</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── GATEWAY SELECTION MODAL ── */}
      {selectedInvoice && isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl animate-scale-in">
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-white text-center mb-1">Select Gateway</h3>
            <p className="text-xs text-gray-500 text-center mb-4">Choose your preferred payment method.</p>

            <div className="space-y-2 mb-6">
              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                payGateway === 'mock' 
                  ? 'border-purple-500 bg-purple-950/20 text-purple-400' 
                  : 'border-gray-800 bg-gray-950 hover:bg-gray-800 text-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="gateway" 
                    value="mock" 
                    checked={payGateway === 'mock'}
                    onChange={() => setPayGateway('mock')}
                    className="accent-purple-500"
                  />
                  <div>
                    <p className="text-xs font-bold">Mock Sandbox</p>
                    <p className="text-[10px] text-gray-500">Test checkout safely without actual money.</p>
                  </div>
                </div>
                <Sparkles size={16} />
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                payGateway === 'esewa' 
                  ? 'border-green-500 bg-green-950/20 text-green-400' 
                  : 'border-gray-800 bg-gray-950 hover:bg-gray-800 text-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="gateway" 
                    value="esewa" 
                    checked={payGateway === 'esewa'}
                    onChange={() => setPayGateway('esewa')}
                    className="accent-green-500"
                  />
                  <div>
                    <p className="text-xs font-bold">eSewa epay v2</p>
                    <p className="text-[10px] text-gray-500">Checkout using official eSewa Nepal gateway.</p>
                  </div>
                </div>
                <CreditCard size={16} />
              </label>
            </div>

            {payError && (
              <div className="bg-red-950/20 text-red-400 border border-red-900/40 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{payError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-800 text-gray-400 text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCheckoutSubmit}
                disabled={checkoutLoading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5 ${
                  payGateway === 'esewa' ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/30' : a.btn
                }`}
              >
                {checkoutLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Pay NPR {selectedInvoice.total}</span>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
