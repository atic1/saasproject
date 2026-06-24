import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, ArrowRight, Loader2, Sparkles, AlertCircle, ChevronLeft, CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Static accent theme maps matching CustomerPortal ──────────
const ACCENT = {
  gym: {
    btn:           "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/30",
    text:          "text-orange-600 dark:text-orange-400",
    border:        "border-orange-500",
    ring:          "focus:ring-orange-500/50",
    gradient:      "from-orange-600 via-orange-500 to-amber-500",
    badge:         "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    icon:          "text-orange-500",
  },
  salon: {
    btn:           "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/30",
    text:          "text-pink-600 dark:text-pink-400",
    border:        "border-pink-500",
    ring:          "focus:ring-pink-500/50",
    gradient:      "from-pink-600 via-pink-500 to-rose-400",
    badge:         "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400",
    icon:          "text-pink-500",
  },
  clinic: {
    btn:           "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30",
    text:          "text-emerald-600 dark:text-emerald-400",
    border:        "border-emerald-500",
    ring:          "focus:ring-emerald-500/50",
    gradient:      "from-emerald-600 via-emerald-500 to-teal-400",
    badge:         "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon:          "text-emerald-500",
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

export default function BusinessAuth({ mode: initialMode = "login" }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, login, isAuthenticated, setAuthenticatedUser } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [businessError, setBusinessError] = useState("");

  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", phone: "", email: "", password: "" });

  // Sync mode state with prop updates
  useEffect(() => {
    setMode(initialMode);
    setAuthError("");
  }, [initialMode]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && business) {
      navigate(`/${slug}/portal`);
    }
  }, [isAuthenticated, business, slug, navigate]);

  // Fetch Business details
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      await login(loginForm.identifier, loginForm.password);
      navigate(`/${slug}/portal`);
    } catch (err) {
      setAuthError(err.message || "Invalid phone, email or password.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Simple Nepalese phone validation
    if (!/^98\d{8}$/.test(registerForm.phone)) {
      setAuthError("Phone number must be a valid Nepalese number starting with 98 (10 digits).");
      return;
    }

    if (registerForm.password.length < 8) {
      setAuthError("Password must be at least 8 characters long.");
      return;
    }

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
      
      setAuthenticatedUser(data.user, data.token);
      navigate(`/${slug}/portal`);
    } catch (err) {
      setAuthError(err.message || "Failed to register account.");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loadingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30 animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-purple-500/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">Loading Portal</p>
            <p className="text-sm text-gray-500 mt-1">Fetching branding settings...</p>
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
        <p className="text-gray-500 max-w-md mb-8">{businessError || "The requested business portal does not exist."}</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold shadow-lg transition-all">Back to Home</button>
      </div>
    );
  }

  const a = getAccent(business.type);
  const typeLabel = BUSINESS_TYPE_LABELS[business.type] || "Business";
  const typeIcon  = BUSINESS_TYPE_ICONS[business.type] || "🏢";

  const inputCls = `w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 ${a.ring} text-sm transition-all`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-between text-gray-900 dark:text-gray-100">
      
      {/* Auth Navbar */}
      <header className="max-w-5xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <Link to={`/${slug}`} className="flex items-center gap-3 group">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
            <span className="text-white text-base">{typeIcon}</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-gray-900 dark:text-white text-[15px] tracking-tight">{business.name}</span>
            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase text-left">{typeLabel}</span>
          </div>
        </Link>
        <Link to={`/${slug}`} className="flex items-center gap-1.5 font-bold text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <ChevronLeft size={16} />
          <span>Back to site</span>
        </Link>
      </header>

      {/* Main card wrapper */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden p-8 sm:p-10 animate-fade-in">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              {mode === "login" ? "Welcome back 👋" : "Join & Start Booking ✨"}
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              {mode === "login"
                ? `Sign in to manage your bookings at ${business.name}`
                : `Create an account to book sessions at ${business.name}`}
            </p>
          </div>

          {/* Error alert */}
          {authError && (
            <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm border border-red-100 dark:border-red-900/40">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="form-group">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Phone or Email
                </label>
                <div className="relative w-full">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="98XXXXXXXX or you@email.com"
                    value={loginForm.identifier}
                    onChange={e => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative w-full">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${a.btn}`}
              >
                {authLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="form-group">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative w-full">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={registerForm.name}
                    onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative w-full">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={registerForm.phone}
                    onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Email Address (Optional)
                </label>
                <div className="relative w-full">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Create Password
                </label>
                <div className="relative w-full">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${a.btn}`}
              >
                {authLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle mode */}
          <div className="auth-switch text-center mt-6 text-sm text-gray-500">
            {mode === "login" ? (
              <>
                <span>New to {business.name}?</span>{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`font-bold transition-all hover:underline ${a.text}`}
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`font-bold transition-all hover:underline ${a.text}`}
                >
                  Sign In
                </button>
              </>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800/80">
        <p className="flex items-center justify-center gap-1">
          <CheckCheck className="h-3.5 w-3.5 text-green-500" />
          <span>Secure checkout & scheduling powered by BizNepal.</span>
        </p>
      </footer>
    </div>
  );
}
