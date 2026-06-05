import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, CreditCard, User, LogOut, CheckCircle, AlertCircle, Phone, MapPin, Plus, Loader2 } from "lucide-react";

export default function CustomerPortal() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, login, logout, isAuthenticated } = useAuth();

  // Business State
  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [businessError, setBusinessError] = useState("");

  // Customer Data State
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "invoices"

  // Auth Forms State
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
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
    paymentMethod: "pay_later" // "pay_later" | "esewa" | "mock"
  });
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Fetch Business Context
  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoadingBusiness(true);
        const res = await fetch(`http://localhost:5000/api/portal/business/${slug}`);
        if (!res.ok) {
          throw new Error("Business not found");
        }
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

  // Fetch Bookings & Services when Authenticated
  useEffect(() => {
    if (isAuthenticated && business) {
      fetchCustomerData();
      fetchServicesAndStaff();
    }
  }, [isAuthenticated, business]);

  // Fetch available slots when booking form changes
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
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter bookings belonging to this business only
        const filtered = data.filter(b => b.businessId?._id === business._id || b.businessId === business._id);
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
      // Services
      const resServices = await fetch(`http://localhost:5000/api/portal/business/${slug}/services`);
      if (resServices.ok) {
        const data = await resServices.json();
        setServices(data);
      }
      // Staff
      const resStaff = await fetch(`http://localhost:5000/api/portal/business/${slug}/staff`);
      if (resStaff.ok) {
        const data = await resStaff.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error("Error loading services/staff:", err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const { serviceId, staffId, date } = bookingForm;
      let url = `http://localhost:5000/api/portal/business/${slug}/availability?date=${date}&serviceId=${serviceId}`;
      if (staffId) {
        url += `&staffId=${staffId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Auth Handlers
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
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      // Save credentials and reload page to authorize
      localStorage.setItem("saas_token", data.token);
      localStorage.setItem("saas_user", JSON.stringify(data.user));
      window.location.reload();
    } catch (err) {
      setAuthError(err.message || "Failed to register.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Create Booking & Settle payment
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingSubmitLoading(true);
    setBookingError("");

    const { serviceId, staffId, date, startTime, customerNotes, paymentMethod } = bookingForm;

    if (!serviceId || !date || !startTime) {
      setBookingError("Please select a service, date, and time slot.");
      setBookingSubmitLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("saas_token");
      const res = await fetch("http://localhost:5000/api/portal/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId: business._id,
          serviceId,
          staffId: staffId || undefined,
          date,
          startTime,
          customerNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to book slot.");
      }

      const invoice = data.invoice;

      // Handle Redirection checkout
      if (paymentMethod !== "pay_later" && invoice) {
        await initiateGatewayPayment(invoice._id, paymentMethod);
      } else {
        // Success without payment redirection
        setIsBookModalOpen(false);
        setBookingForm({
          serviceId: "",
          staffId: "",
          date: "",
          startTime: "",
          customerNotes: "",
          paymentMethod: "pay_later"
        });
        fetchCustomerData();
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ invoiceId, method })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Payment initiation failed.");
      }

      const checkout = data.checkout;
      if (checkout.type === "redirect") {
        window.location.href = checkout.url;
      } else if (checkout.type === "form") {
        // Form post flow for eSewa
        const form = document.createElement("form");
        form.method = checkout.method || "POST";
        form.action = checkout.url;
        Object.keys(checkout.fields).forEach((key) => {
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

  if (loadingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-gray-500 font-medium">Resolving Booking Portal...</p>
        </div>
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-center px-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Portal Error</h1>
        <p className="text-gray-500 max-w-md">{businessError || "The requested booking portal does not exist."}</p>
        <button onClick={() => navigate("/")} className="mt-6 btn btn-primary">Go to Homepage</button>
      </div>
    );
  }

  // Accent Colors depending on business vertical
  const verticalAccentClass = 
    business.type === "gym" ? "indigo" : 
    business.type === "salon" ? "pink" : "emerald";

  const accentStyles = {
    gym: {
      btn: "bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500",
      text: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      border: "border-indigo-200 dark:border-indigo-900",
      gradient: "from-indigo-600 to-blue-500"
    },
    salon: {
      btn: "bg-pink-600 hover:bg-pink-500 focus:ring-pink-500",
      text: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-950/30",
      border: "border-pink-200 dark:border-pink-900",
      gradient: "from-pink-600 to-rose-400"
    },
    clinic: {
      btn: "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-900",
      gradient: "from-emerald-600 to-teal-500"
    }
  };

  const style = accentStyles[business.type] || accentStyles.gym;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      {/* Brand Header Banner */}
      <div className={`relative bg-gradient-to-r ${style.gradient} text-white py-12 px-6 shadow-lg`}>
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
        <div className="container relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">{business.type} Portal</span>
            <h1 className="text-4xl md:text-5xl font-black mt-2 tracking-tight">{business.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm mt-3 opacity-90">
              {business.contact?.phone && (
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {business.contact.phone}</span>
              )}
              {business.contact?.city && (
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {business.contact.city}</span>
              )}
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl">
              <div className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center font-bold text-lg">
                {user?.name?.[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs opacity-75">Logged in as</p>
                <p className="font-semibold text-sm truncate max-w-[150px]">{user?.name}</p>
              </div>
              <button 
                onClick={logout} 
                className="p-2 bg-white/15 rounded-xl hover:bg-white/25 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="container max-w-5xl mx-auto px-4 mt-8">
        {!isAuthenticated ? (
          /* Guest Access - Sign In / Sign Up Selector */
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-slide-up">
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`flex-1 py-4 text-center font-bold text-sm transition-all ${
                  authMode === "login" 
                    ? `text-${verticalAccentClass}-600 border-b-2 border-${verticalAccentClass}-600 dark:text-${verticalAccentClass}-400` 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`flex-1 py-4 text-center font-bold text-sm transition-all ${
                  authMode === "register" 
                    ? `text-${verticalAccentClass}-600 border-b-2 border-${verticalAccentClass}-600 dark:text-${verticalAccentClass}-400` 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold tracking-tight text-center mb-6">
                {authMode === "login" ? "Welcome back" : "Book your first session"}
              </h2>

              {authError && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === "login" ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Phone or Email</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9812345678 or customer@example.com"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className={`w-full py-4 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${style.btn}`}
                  >
                    {authLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="98********"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Create Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className={`w-full py-4 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${style.btn}`}
                  >
                    {authLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Logged In Dashboard View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Timing Slots info */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-gray-400" /> Business Timings</h3>
                <div className="space-y-2.5 text-sm">
                  {business.timings?.schedule?.map((item) => (
                    <div key={item.day} className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800/40 last:border-0">
                      <span className="font-semibold capitalize text-gray-600 dark:text-gray-400">{item.day}</span>
                      {item.isOpen ? (
                        <span className="text-gray-900 dark:text-gray-200">{item.open} - {item.close}</span>
                      ) : (
                        <span className="text-red-500 font-medium">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button to Launch Booking */}
              <button 
                onClick={() => setIsBookModalOpen(true)}
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${style.btn}`}
              >
                <Plus className="h-5 w-5" /> Book Appointment
              </button>
            </div>

            {/* Main Listings Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tab Selector */}
              <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`flex-1 py-3 text-center rounded-xl font-bold text-sm transition-all ${
                    activeTab === "bookings" 
                      ? `${style.bg} ${style.text}` 
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  My Appointments
                </button>
                <button
                  onClick={() => setActiveTab("invoices")}
                  className={`flex-1 py-3 text-center rounded-xl font-bold text-sm transition-all ${
                    activeTab === "invoices" 
                      ? `${style.bg} ${style.text}` 
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Invoices & Settle
                </button>
              </div>

              {/* Booking History Tab */}
              {activeTab === "bookings" && (
                <div className="space-y-4">
                  {loadingData ? (
                    <div className="text-center py-12 text-gray-400"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-500" /> Loading bookings...</div>
                  ) : bookings.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
                      <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h4 className="text-lg font-bold">No Bookings Yet</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-6">You have not scheduled any appointments with us yet.</p>
                      <button onClick={() => setIsBookModalOpen(true)} className={`btn ${style.btn}`}>Book Now</button>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking._id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold">{booking.serviceName}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              booking.status === "confirmed" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                              booking.status === "pending" ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400" :
                              booking.status === "completed" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400" :
                              "bg-gray-150 text-gray-600 dark:bg-gray-850 dark:text-gray-400"
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs mt-2 text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(booking.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {booking.startTime} - {booking.endTime}</span>
                            {booking.staffName && (
                              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {booking.staffName}</span>
                            )}
                          </div>
                        </div>

                        {booking.invoice && (
                          <div className="shrink-0 flex flex-col items-end gap-1.5 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">NPR {booking.invoice.total}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              booking.invoice.status === "paid" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                              "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                            }`}>
                              {booking.invoice.status}
                            </span>
                            {booking.invoice.status === "pending" && (
                              <button 
                                onClick={() => { setActiveTab("invoices"); }} 
                                className={`text-xs font-bold underline ${style.text} hover:opacity-85`}
                              >
                                Pay Invoice
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === "invoices" && (
                <div className="space-y-4">
                  {loadingData ? (
                    <div className="text-center py-12 text-gray-400"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-500" /> Loading invoices...</div>
                  ) : bookings.filter(b => b.invoice).length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
                      <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h4 className="text-lg font-bold">No Invoices Found</h4>
                      <p className="text-sm text-gray-500 mt-1">There are no billing records associated with your profile.</p>
                    </div>
                  ) : (
                    bookings
                      .filter(b => b.invoice)
                      .map((booking) => {
                        const invoice = booking.invoice;
                        return (
                          <div key={invoice._id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-200 dark:hover:border-gray-700 transition-all animate-fade">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">Invoice #{invoice.invoiceNumber}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  invoice.status === "paid" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                                  "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                                }`}>
                                  {invoice.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Service: {booking.serviceName}</p>
                              <p className="text-xs text-gray-400">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>

                            <div className="shrink-0 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                              <div className="text-right md:text-right text-left">
                                <p className="text-xs text-gray-400">Total Amount</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">NPR {invoice.total}</p>
                              </div>
                              
                              {invoice.status === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => initiateGatewayPayment(invoice._id, "mock")}
                                    className="btn btn-secondary text-xs px-3.5 py-2"
                                  >
                                    Sandbox Mock
                                  </button>
                                  <button
                                    onClick={() => initiateGatewayPayment(invoice._id, "esewa")}
                                    className="btn btn-primary text-xs px-3.5 py-2 bg-green-600 hover:bg-green-500 border-none shadow-none"
                                  >
                                    eSewa
                                  </button>
                                </div>
                              )}
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

      {/* Booking Form Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className={`p-6 bg-gradient-to-r ${style.gradient} text-white flex justify-between items-center`}>
              <h3 className="text-xl font-bold">New Booking</h3>
              <button 
                onClick={() => setIsBookModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBookingSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {bookingError && (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Service Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Select Service</label>
                <select
                  required
                  value={bookingForm.serviceId}
                  onChange={(e) => setBookingForm({ ...bookingForm, serviceId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-sm"
                >
                  <option value="">-- Choose Service --</option>
                  {services.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.duration} mins) - NPR {s.price}</option>
                  ))}
                </select>
              </div>

              {/* Staff Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Assigned Staff (Optional)</label>
                <select
                  value={bookingForm.staffId}
                  onChange={(e) => setBookingForm({ ...bookingForm, staffId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-sm"
                >
                  <option value="">Any Available Staff</option>
                  {staffList.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-sm"
                />
              </div>

              {/* Time Slots */}
              {bookingForm.serviceId && bookingForm.date && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Available Time Slot</label>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-2"><Loader2 className="h-4 w-4 animate-spin" /> Querying open slots...</div>
                  ) : slots.length === 0 ? (
                    <div className="text-xs text-red-500 py-2 font-semibold">✕ No availability slots found on this date.</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-[140px] overflow-y-auto p-1.5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                      {slots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setBookingForm({ ...bookingForm, startTime: slot.startTime })}
                          className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                            bookingForm.startTime === slot.startTime 
                              ? `bg-${verticalAccentClass}-600 border-${verticalAccentClass}-600 text-white shadow-sm` 
                              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                <textarea
                  placeholder="Any special requests or instructions..."
                  rows={2}
                  value={bookingForm.customerNotes}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerNotes: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-sm"
                />
              </div>

              {/* Payment Checkout selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingForm({ ...bookingForm, paymentMethod: "pay_later" })}
                    className={`py-3 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      bookingForm.paymentMethod === "pay_later" 
                        ? `bg-${verticalAccentClass}-50 dark:bg-${verticalAccentClass}-950/20 border-${verticalAccentClass}-500 text-${verticalAccentClass}-700 dark:text-${verticalAccentClass}-400` 
                        : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500"
                    }`}
                  >
                    <Clock className="h-4 w-4" /> Pay Later
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingForm({ ...bookingForm, paymentMethod: "mock" })}
                    className={`py-3 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      bookingForm.paymentMethod === "mock" 
                        ? `bg-${verticalAccentClass}-50 dark:bg-${verticalAccentClass}-950/20 border-${verticalAccentClass}-500 text-${verticalAccentClass}-700 dark:text-${verticalAccentClass}-400` 
                        : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" /> Mock Sandbox
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingForm({ ...bookingForm, paymentMethod: "esewa" })}
                    className={`py-3 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      bookingForm.paymentMethod === "esewa" 
                        ? `bg-${verticalAccentClass}-50 dark:bg-${verticalAccentClass}-950/20 border-${verticalAccentClass}-500 text-${verticalAccentClass}-700 dark:text-${verticalAccentClass}-400` 
                        : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500"
                    }`}
                  >
                    <CreditCard className="h-4 w-4 text-green-600" /> eSewa Pay
                  </button>
                </div>
              </div>

              {/* Confirm Actions */}
              <div className="flex gap-4 pt-3 border-t border-gray-50 dark:border-gray-850">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="flex-1 py-3.5 btn btn-secondary text-sm font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitLoading}
                  className={`flex-1 py-3.5 text-white font-bold rounded-2xl flex items-center justify-center gap-2 ${style.btn}`}
                >
                  {bookingSubmitLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
