import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar, Clock, CreditCard, User, LogOut, CheckCircle,
  AlertCircle, Phone, MapPin, Plus, Loader2, Star, Sparkles,
  ChevronRight, X, ArrowRight, CheckCheck, Zap
} from "lucide-react";

// ── Static accent theme maps (required for Tailwind JIT compilation) ──────────
const ACCENT = {
  gym: {
    btn:           "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30",
    btnSolid:      "bg-indigo-600 hover:bg-indigo-500 text-white",
    text:          "text-indigo-600",
    textDark:      "dark:text-indigo-400",
    bg:            "bg-indigo-50",
    bgDark:        "dark:bg-indigo-950/30",
    border:        "border-indigo-500",
    borderLight:   "border-indigo-200",
    ring:          "ring-indigo-500",
    slotActive:    "bg-indigo-600 border-indigo-600 text-white",
    slotInactive:  "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20",
    tabActive:     "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
    payActive:     "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-400",
    gradient:      "from-indigo-600 via-indigo-500 to-blue-500",
    gradientLight: "from-indigo-50 to-blue-50",
    icon:          "text-indigo-500",
    badge:         "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
  },
  salon: {
    btn:           "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/30",
    btnSolid:      "bg-pink-600 hover:bg-pink-500 text-white",
    text:          "text-pink-600",
    textDark:      "dark:text-pink-400",
    bg:            "bg-pink-50",
    bgDark:        "dark:bg-pink-950/30",
    border:        "border-pink-500",
    borderLight:   "border-pink-200",
    ring:          "ring-pink-500",
    slotActive:    "bg-pink-600 border-pink-600 text-white",
    slotInactive:  "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-pink-50 dark:hover:bg-pink-950/20",
    tabActive:     "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
    payActive:     "bg-pink-50 dark:bg-pink-950/20 border-pink-500 text-pink-700 dark:text-pink-400",
    gradient:      "from-pink-600 via-pink-500 to-rose-400",
    gradientLight: "from-pink-50 to-rose-50",
    icon:          "text-pink-500",
    badge:         "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400",
  },
  clinic: {
    btn:           "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30",
    btnSolid:      "bg-emerald-600 hover:bg-emerald-500 text-white",
    text:          "text-emerald-600",
    textDark:      "dark:text-emerald-400",
    bg:            "bg-emerald-50",
    bgDark:        "dark:bg-emerald-950/30",
    border:        "border-emerald-500",
    borderLight:   "border-emerald-200",
    ring:          "ring-emerald-500",
    slotActive:    "bg-emerald-600 border-emerald-600 text-white",
    slotInactive:  "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
    tabActive:     "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    payActive:     "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400",
    gradient:      "from-emerald-600 via-emerald-500 to-teal-400",
    gradientLight: "from-emerald-50 to-teal-50",
    icon:          "text-emerald-500",
    badge:         "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  }
};

const getAccent = (type) => ACCENT[type] || ACCENT.gym;

const BUSINESS_TYPE_LABELS = {
  gym: "Fitness & Gym",
  salon: "Beauty & Salon",
  clinic: "Health Clinic",
  shop: "Shop",
  general: "Business"
};

const BUSINESS_TYPE_ICONS = {
  gym: "🏋️",
  salon: "💆",
  clinic: "🏥",
  shop: "🛍️",
  general: "🏢"
};

const STATUS_STYLES = {
  confirmed:  "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  pending:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  completed:  "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  cancelled:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  no_show:    "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

export default function CustomerPortal() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, login, logout, isAuthenticated, setAuthenticatedUser } = useAuth();

  // Business State
  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [businessError, setBusinessError] = useState("");

  // Customer Data State
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");

  // Auth Forms State
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", phone: "", email: "", password: "" });

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // New Booking Form
  const [bookingForm, setBookingForm] = useState({
    serviceId: "",
    staffId: "",
    date: "",
    startTime: "",
    customerNotes: "",
    paymentMethod: "pay_later"
  });
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ── Fetch Business Context ─────────────────────────────────────────────────
  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoadingBusiness(true);
        const res = await fetch(`http://localhost:5000/api/portal/business/${slug}`);
        if (!res.ok) throw new Error("Business not found");
        const data = await res.json();
        setBusiness(data);
      } catch (err) {
        setBusinessError(err.message);
      } finally {
        setLoadingBusiness(false);
      }
    }
    fetchBusiness();
  }, [slug]);

  // ── Fetch data when authenticated ─────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && business) {
      fetchCustomerData();
      fetchServicesAndStaff();
    }
  }, [isAuthenticated, business]);

  // ── Fetch available slots when booking form changes ────────────────────────
  useEffect(() => {
    if (bookingForm.serviceId && bookingForm.date) {
      fetchAvailableSlots();
    } else {
      setSlots([]);
    }
  }, [bookingForm.serviceId, bookingForm.staffId, bookingForm.date]);

  const fetchCustomerData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("saas_token");
      const res = await fetch("http://localhost:5000/api/portal/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter(b =>
          b.businessId?._id === business._id || b.businessId === business._id
        );
        setBookings(filtered);
      }
    } catch (err) {
      console.error("Error loading customer bookings:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchServicesAndStaff = async () => {
    try {
      const [resServices, resStaff] = await Promise.all([
        fetch(`http://localhost:5000/api/portal/business/${slug}/services`),
        fetch(`http://localhost:5000/api/portal/business/${slug}/staff`)
      ]);
      if (resServices.ok) setServices(await resServices.json());
      if (resStaff.ok) setStaffList(await resStaff.json());
    } catch (err) {
      console.error("Error loading services/staff:", err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const { serviceId, staffId, date } = bookingForm;
      let url = `http://localhost:5000/api/portal/business/${slug}/availability?date=${date}&serviceId=${serviceId}`;
      if (staffId) url += `&staffId=${staffId}`;
      const res = await fetch(url);
      if (res.ok) setSlots(await res.json());
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ── Auth Handlers ──────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      await login(loginForm.identifier, loginForm.password);
    } catch (err) {
      setAuthError(err.message || "Invalid credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name,
          phone: registerForm.phone,
          email: registerForm.email || undefined,
          password: registerForm.password,
          businessId: business._id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      // Authenticate via context (no page reload needed — React state updates)
      setAuthenticatedUser(data.user, data.token);
    } catch (err) {
      setAuthError(err.message || "Failed to register.");
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Booking Handlers ───────────────────────────────────────────────────────
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError("");

    const { serviceId, date, startTime } = bookingForm;
    if (!serviceId) { setBookingError("Please select a service."); return; }
    if (!date)       { setBookingError("Please select a date."); return; }
    if (!startTime)  { setBookingError("Please select a time slot."); return; }

    setBookingSubmitLoading(true);
    try {
      const token = localStorage.getItem("saas_token");
      const res = await fetch("http://localhost:5000/api/portal/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessId: business._id,
          serviceId: bookingForm.serviceId,
          staffId: bookingForm.staffId || undefined,
          date,
          startTime,
          customerNotes: bookingForm.customerNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book slot.");

      const { invoice } = data;
      if (bookingForm.paymentMethod !== "pay_later" && invoice) {
        await initiateGatewayPayment(invoice._id, bookingForm.paymentMethod);
      } else {
        setBookingSuccess(true);
        setTimeout(() => {
          setIsBookModalOpen(false);
          setBookingSuccess(false);
          setBookingForm({ serviceId: "", staffId: "", date: "", startTime: "", customerNotes: "", paymentMethod: "pay_later" });
          fetchCustomerData();
        }, 1800);
      }
    } catch (err) {
      setBookingError(err.message || "Error submitting booking.");
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  const initiateGatewayPayment = async (invoiceId, method) => {
    try {
      const token = localStorage.getItem("saas_token");
      const res = await fetch("http://localhost:5000/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoiceId, method })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment initiation failed.");

      const checkout = data.checkout;
      if (checkout.type === "redirect") {
        window.location.href = checkout.url;
      } else if (checkout.type === "form") {
        const form = document.createElement("form");
        form.method = checkout.method || "POST";
        form.action = checkout.url;
        Object.keys(checkout.fields).forEach(key => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = checkout.fields[key];
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setBookingError(err.message || "Payment redirection failed.");
    }
  };

  const closeModal = () => {
    setIsBookModalOpen(false);
    setBookingError("");
    setBookingSuccess(false);
    setBookingForm({ serviceId: "", staffId: "", date: "", startTime: "", customerNotes: "", paymentMethod: "pay_later" });
  };

  // ── Loading / Error States ─────────────────────────────────────────────────
  if (loadingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">Loading Portal</p>
            <p className="text-sm text-gray-500 mt-1">Resolving booking portal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-center px-4">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Portal Not Found</h1>
        <p className="text-gray-500 max-w-md mb-8">{businessError || "The requested booking portal does not exist."}</p>
        <button onClick={() => navigate("/")} className="btn btn-primary">Back to Home</button>
      </div>
    );
  }

  const a = getAccent(business.type);
  const typeLabel = BUSINESS_TYPE_LABELS[business.type] || "Business";
  const typeIcon  = BUSINESS_TYPE_ICONS[business.type] || "🏢";

  // Shared input class
  const inputCls = "w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-600/50 text-sm transition-all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* ── Hero Header Banner ─────────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${a.gradient} overflow-hidden`}>
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="relative container max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left: Business Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                {typeIcon}
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white/90 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                  <Sparkles className="h-3 w-3" /> {typeLabel} Portal
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {business.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm mt-2 text-white/80">
                  {business.contact?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" /> {business.contact.phone}
                    </span>
                  )}
                  {business.contact?.city && (
                    <span className="flex items-center gap-1.5 capitalize">
                      <MapPin className="h-4 w-4" /> {business.contact.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: User badge */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center font-black text-lg text-white select-none">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[11px] text-white/60 font-medium uppercase tracking-wider">Logged in as</p>
                  <p className="font-bold text-white text-sm truncate max-w-[140px]">{user?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="ml-1 p-2 bg-white/15 rounded-xl hover:bg-white/25 transition-colors text-white/80 hover:text-white"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-50 dark:bg-gray-950 rounded-t-[24px]" />
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 pb-16 -mt-2">

        {!isAuthenticated ? (
          /* ── Guest: Auth Card ──────────────────────────────────────────────── */
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                {["login", "register"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setAuthMode(mode); setAuthError(""); }}
                    className={`flex-1 py-4 text-center font-bold text-sm transition-all ${
                      authMode === mode
                        ? `${a.text} border-b-2 ${a.border}`
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    }`}
                  >
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                    {authMode === "login" ? "Welcome back 👋" : "Join & Start Booking ✨"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {authMode === "login"
                      ? `Sign in to manage your ${business.name} appointments`
                      : `Create an account to book at ${business.name}`}
                  </p>
                </div>

                {authError && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-5 text-sm border border-red-100 dark:border-red-900/40">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authMode === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Phone or Email
                      </label>
                      <input
                        type="text" required
                        placeholder="9812345678 or you@email.com"
                        value={loginForm.identifier}
                        onChange={e => setLoginForm({ ...loginForm, identifier: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <input
                        type="password" required
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <button
                      type="submit" disabled={authLoading}
                      className={`w-full py-3.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${a.btn}`}
                    >
                      {authLoading
                        ? <Loader2 className="h-5 w-5 animate-spin" />
                        : <><span>Sign In</span> <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {[
                      { label: "Full Name", key: "name", type: "text", placeholder: "John Doe", required: true },
                      { label: "Phone Number", key: "phone", type: "tel", placeholder: "98XXXXXXXX", required: true },
                      { label: "Email (Optional)", key: "email", type: "email", placeholder: "john@example.com", required: false },
                      { label: "Create Password", key: "password", type: "password", placeholder: "At least 8 characters", required: true },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          required={field.required}
                          placeholder={field.placeholder}
                          value={registerForm[field.key]}
                          onChange={e => setRegisterForm({ ...registerForm, [field.key]: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    ))}
                    <button
                      type="submit" disabled={authLoading}
                      className={`w-full py-3.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${a.btn}`}
                    >
                      {authLoading
                        ? <Loader2 className="h-5 w-5 animate-spin" />
                        : <><span>Create Account</span> <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Trust note */}
            <p className="text-center text-xs text-gray-400 mt-5 flex items-center justify-center gap-1.5">
              <CheckCheck className="h-3.5 w-3.5 text-green-500" />
              Your data is safe and private. We never share your information.
            </p>
          </div>

        ) : (
          /* ── Authenticated Dashboard ──────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-4">

              {/* Book CTA */}
              <button
                onClick={() => setIsBookModalOpen(true)}
                className={`w-full py-4 px-6 rounded-2xl font-bold shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-2.5 ${a.btn}`}
              >
                <Plus className="h-5 w-5" />
                <span>Book Appointment</span>
                <Zap className="h-4 w-4 opacity-75 ml-auto" />
              </button>

              {/* Services card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" /> Our Services
                </h3>
                {services.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No services listed yet.</p>
                ) : (
                  <div className="space-y-2">
                    {services.map(svc => (
                      <div key={svc._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{svc.name}</p>
                          <p className="text-xs text-gray-400">{svc.duration} min</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-xl ${a.bg} ${a.bgDark} ${a.text} ${a.textDark}`}>
                          NPR {svc.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Business Timings */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" /> Business Hours
                </h3>
                {(!business.timings?.schedule || business.timings.schedule.length === 0) ? (
                  <div className="space-y-1.5">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <div key={d} className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800/40 last:border-0">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{d}</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">9:00 - 17:00</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sun</span>
                      <span className="text-xs text-red-500 font-medium">Closed</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {business.timings.schedule.map(item => (
                      <div key={item.day} className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800/40 last:border-0">
                        <span className="font-semibold capitalize text-gray-500 dark:text-gray-400">{item.day}</span>
                        {item.isOpen
                          ? <span className="text-gray-800 dark:text-gray-200">{item.open} - {item.close}</span>
                          : <span className="text-red-500 font-medium">Closed</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">

              {/* Tabs */}
              <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                {[
                  { id: "bookings", label: "My Appointments" },
                  { id: "invoices", label: "Invoices & Pay" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 text-center rounded-xl font-bold text-sm transition-all ${
                      activeTab === tab.id
                        ? a.tabActive
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div className="space-y-4">
                  {loadingData ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <p className="text-sm text-gray-400">Loading your bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-indigo-400" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">No Appointments Yet</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-6">You haven't scheduled any appointments with us yet.</p>
                      <button
                        onClick={() => setIsBookModalOpen(true)}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all inline-flex items-center gap-2 ${a.btn}`}
                      >
                        <Plus className="h-4 w-4" /> Book Now
                      </button>
                    </div>
                  ) : (
                    bookings.map(booking => (
                      <div
                        key={booking._id}
                        className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                {booking.serviceName}
                              </h4>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${STATUS_STYLES[booking.status] || STATUS_STYLES.cancelled}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs mt-2 text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(booking.date).toLocaleDateString("en-NP", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {booking.startTime} – {booking.endTime}
                              </span>
                              {booking.staffName && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5" /> {booking.staffName}
                                </span>
                              )}
                            </div>
                          </div>

                          {booking.invoice && (
                            <div className="flex flex-col items-end gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                              <span className="text-base font-black text-gray-900 dark:text-white">NPR {booking.invoice.total}</span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                booking.invoice.status === "paid"
                                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                  : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                              }`}>
                                {booking.invoice.status}
                              </span>
                              {booking.invoice.status === "pending" && (
                                <button
                                  onClick={() => setActiveTab("invoices")}
                                  className={`text-xs font-bold flex items-center gap-1 ${a.text} ${a.textDark} hover:underline`}
                                >
                                  Pay Now <ChevronRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === "invoices" && (
                <div className="space-y-4">
                  {loadingData ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <p className="text-sm text-gray-400">Loading invoices...</p>
                    </div>
                  ) : bookings.filter(b => b.invoice).length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-bold">No Invoices Found</h4>
                      <p className="text-sm text-gray-500 mt-1">No billing records yet. Book a session to get started.</p>
                    </div>
                  ) : (
                    bookings.filter(b => b.invoice).map(booking => {
                      const inv = booking.invoice;
                      return (
                        <div key={inv._id} className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white">Invoice #{inv.invoiceNumber}</h4>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  inv.status === "paid"
                                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                                }`}>
                                  {inv.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Service: {booking.serviceName}</p>
                              <p className="text-xs text-gray-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                            </div>

                            <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                              <div className="text-right">
                                <p className="text-xs text-gray-400">Total</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">NPR {inv.total}</p>
                              </div>
                              {inv.status === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => initiateGatewayPayment(inv._id, "mock")}
                                    className="px-4 py-2.5 rounded-xl border text-xs font-bold bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                  >
                                    Sandbox
                                  </button>
                                  <button
                                    onClick={() => initiateGatewayPayment(inv._id, "esewa")}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-500/25"
                                  >
                                    eSewa
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Booking Modal ─────────────────────────────────────────────────────── */}
      {isBookModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh]">

            {/* Modal Header */}
            <div className={`p-5 bg-gradient-to-r ${a.gradient} text-white flex justify-between items-center flex-shrink-0`}>
              <div>
                <h3 className="text-lg font-black">New Appointment</h3>
                <p className="text-xs text-white/70 mt-0.5">{business.name}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 bg-white/15 hover:bg-white/25 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {bookingSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
                <div className={`w-20 h-20 ${a.bg} ${a.bgDark} rounded-full flex items-center justify-center`}>
                  <CheckCircle className={`h-10 w-10 ${a.text} ${a.textDark}`} />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Booking Confirmed!</h3>
                <p className="text-sm text-gray-500 text-center">Your appointment has been booked successfully. See you soon!</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
                {bookingError && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-2xl text-xs border border-red-100 dark:border-red-900/30">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Service */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Select Service *</label>
                  {services.length === 0 ? (
                    <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl p-4 text-sm text-yellow-700 dark:text-yellow-400">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span>This business has no services listed yet. Please contact them directly.</span>
                    </div>
                  ) : (
                    <select
                      required
                      value={bookingForm.serviceId}
                      onChange={e => setBookingForm({ ...bookingForm, serviceId: e.target.value, startTime: "" })}
                      className={inputCls}
                    >
                      <option value="">-- Choose a service --</option>
                      {services.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.duration} min) — NPR {s.price}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Staff (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Staff Preference <span className="normal-case font-normal text-gray-400">(optional)</span>
                  </label>
                  <select
                    value={bookingForm.staffId}
                    onChange={e => setBookingForm({ ...bookingForm, staffId: e.target.value, startTime: "" })}
                    className={inputCls}
                  >
                    <option value="">Any Available Staff</option>
                    {staffList.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Select Date *</label>
                  <input
                    type="date" required
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingForm.date}
                    onChange={e => setBookingForm({ ...bookingForm, date: e.target.value, startTime: "" })}
                    className={inputCls}
                  />
                </div>

                {/* Time Slots */}
                {bookingForm.serviceId && bookingForm.date && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Available Time Slots *
                    </label>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" /> Fetching open slots...
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        No slots available on this date. Try a different date or staff.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                        {slots.map(slot => (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => setBookingForm({ ...bookingForm, startTime: slot.startTime })}
                            className={`py-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                              bookingForm.startTime === slot.startTime
                                ? a.slotActive
                                : a.slotInactive
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Notes <span className="normal-case font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Any special requests or instructions..."
                    rows={2}
                    value={bookingForm.customerNotes}
                    onChange={e => setBookingForm({ ...bookingForm, customerNotes: e.target.value })}
                    className={inputCls + " resize-none"}
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "pay_later", label: "Pay Later", icon: <Clock className="h-4 w-4" /> },
                      { id: "mock",      label: "Sandbox",   icon: <CreditCard className="h-4 w-4" /> },
                      { id: "esewa",     label: "eSewa",     icon: <CreditCard className="h-4 w-4 text-green-600" /> }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, paymentMethod: pm.id })}
                        className={`py-3 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                          bookingForm.paymentMethod === pm.id
                            ? a.payActive
                            : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {pm.icon}
                        <span>{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3.5 btn btn-secondary text-sm font-bold rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitLoading || services.length === 0}
                    className={`flex-1 py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${a.btn}`}
                  >
                    {bookingSubmitLoading
                      ? <Loader2 className="h-5 w-5 animate-spin" />
                      : <><CheckCircle className="h-4 w-4" /> Confirm Booking</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
