import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar, Clock, CreditCard, User, LogOut, CheckCircle,
  AlertCircle, Phone, MapPin, Plus, Loader2, Star, Sparkles,
  ChevronRight, X, ArrowRight, CheckCheck, Zap,
  QrCode, Dumbbell, TrendingUp, Activity, Shield
} from "lucide-react";

// ── Static accent theme maps (required for Tailwind JIT compilation) ──────────
const ACCENT = {
  gym: {
    btn:           "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/30",
    btnSolid:      "bg-orange-600 hover:bg-orange-500 text-white",
    text:          "text-orange-600",
    textDark:      "dark:text-orange-400",
    bg:            "bg-orange-50",
    bgDark:        "dark:bg-orange-950/30",
    border:        "border-orange-500",
    borderLight:   "border-orange-200",
    ring:          "ring-orange-500",
    slotActive:    "bg-orange-600 border-orange-600 text-white",
    slotInactive:  "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-950/20",
    tabActive:     "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
    payActive:     "bg-orange-50 dark:bg-orange-950/20 border-orange-500 text-orange-700 dark:text-orange-400",
    gradient:      "from-orange-600 via-orange-500 to-amber-500",
    gradientLight: "from-orange-50 to-amber-50",
    icon:          "text-orange-500",
    badge:         "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
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
  
  // ── Gym Premium Features State ───────────────────────────────────────────
  const [metricsLogs, setMetricsLogs] = useState([
    { date: "May 01", weight: 80.5, fat: 22.4 },
    { date: "May 15", weight: 79.2, fat: 21.8 },
    { date: "Jun 01", weight: 78.0, fat: 21.0 },
    { date: "Jun 15", weight: 77.1, fat: 20.2 },
    { date: "Jun 22", weight: 76.5, fat: 19.5 },
  ]);
  const [newWeight, setNewWeight] = useState("");
  const [newFat, setNewFat] = useState("");
  const [checkInLogs, setCheckInLogs] = useState([
    { id: 1, timestamp: "2026-06-22T08:30:00Z", type: "check_in", status: "approved" },
    { id: 2, timestamp: "2026-06-21T09:15:00Z", type: "check_in", status: "approved" },
    { id: 3, timestamp: "2026-06-19T07:45:00Z", type: "check_in", status: "approved" },
  ]);
  const [qrRefreshKey, setQrRefreshKey] = useState(1);
  const [timetableDay, setTimetableDay] = useState("mon");
  const [bookedClasses, setBookedClasses] = useState([]);
  const [workoutRoutines, setWorkoutRoutines] = useState([
    {
      id: "routine-1",
      name: "Hypertrophy Push Day",
      trainer: "Trainer Binod",
      completed: false,
      exercises: [
        { name: "Incline Dumbbell Press", sets: 4, reps: "8-12", weight: "24 kg", done: false },
        { name: "Flat Barbell Bench Press", sets: 3, reps: "6-8", weight: "60 kg", done: false },
        { name: "Overhead Barbell Press", sets: 4, reps: "8-10", weight: "40 kg", done: false },
        { name: "Cable Lateral Raise", sets: 3, reps: "12-15", weight: "10 kg", done: false },
        { name: "Tricep Overhead Extension", sets: 3, reps: "10-12", weight: "25 kg", done: false },
      ]
    },
    {
      id: "routine-2",
      name: "Strength Pull Day",
      trainer: "Trainer Binod",
      completed: false,
      exercises: [
        { name: "Deadlifts (Barbell)", sets: 3, reps: "5", weight: "100 kg", done: false },
        { name: "Weighted Pull-Ups", sets: 4, reps: "6-8", weight: "+10 kg", done: false },
        { name: "Seated Cable Row", sets: 3, reps: "10-12", weight: "55 kg", done: false },
        { name: "Face Pulls", sets: 3, reps: "15-20", weight: "20 kg", done: false },
        { name: "Incline Dumbbell Bicep Curl", sets: 3, reps: "10-12", weight: "12 kg", done: false },
      ]
    }
  ]);

  const MOCK_CLASSES = [
    { id: "c1", day: "mon", className: "Power Vinyasa Yoga", instructor: "Sophia KC", startTime: "06:00", endTime: "07:00", capacity: 15, enrolled: 12 },
    { id: "c2", day: "mon", className: "HIIT Cardio Blitz", instructor: "Rohan Shrestha", startTime: "08:00", endTime: "09:00", capacity: 20, enrolled: 18 },
    { id: "c3", day: "mon", className: "Strength Training 101", instructor: "Binod Tamang", startTime: "17:30", endTime: "18:30", capacity: 12, enrolled: 8 },
    { id: "c4", day: "tue", className: "Spin & Cycle Cycle", instructor: "Alisha Giri", startTime: "07:00", endTime: "08:00", capacity: 15, enrolled: 15 },
    { id: "c5", day: "tue", className: "Zumba Dance Fitness", instructor: "Pooja Ray", startTime: "18:00", endTime: "19:00", capacity: 25, enrolled: 22 },
    { id: "c6", day: "wed", className: "HIIT Cardio Blitz", instructor: "Rohan Shrestha", startTime: "08:00", endTime: "09:00", capacity: 20, enrolled: 14 },
    { id: "c7", day: "wed", className: "Strength Training 101", instructor: "Binod Tamang", startTime: "17:30", endTime: "18:30", capacity: 12, enrolled: 11 },
    { id: "c8", day: "thu", className: "Power Vinyasa Yoga", instructor: "Sophia KC", startTime: "06:00", endTime: "07:00", capacity: 15, enrolled: 9 },
    { id: "c9", day: "thu", className: "Spin & Cycle Cycle", instructor: "Alisha Giri", startTime: "07:00", endTime: "08:00", capacity: 15, enrolled: 13 },
    { id: "c10", day: "fri", className: "Full-Body Bootcamp", instructor: "Binod Tamang", startTime: "07:30", endTime: "08:45", capacity: 20, enrolled: 19 },
    { id: "c11", day: "sat", className: "Weekend Warrior Lift", instructor: "Binod Tamang", startTime: "09:00", endTime: "10:30", capacity: 15, enrolled: 14 },
  ];

  const handleAddMetric = (e) => {
    e.preventDefault();
    if (!newWeight) return;
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    setMetricsLogs(prev => [
      ...prev,
      { date: today, weight: parseFloat(newWeight), fat: newFat ? parseFloat(newFat) : null }
    ]);
    setNewWeight("");
    setNewFat("");
  };

  const handleRefreshQr = () => {
    setQrRefreshKey(prev => prev + 1);
  };

  const handleBookClass = (classId) => {
    if (bookedClasses.includes(classId)) return;
    setBookedClasses(prev => [...prev, classId]);
  };

  const handleToggleExerciseDone = (routineId, exerciseIndex) => {
    setWorkoutRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      const updatedExercises = r.exercises.map((ex, idx) => {
        if (idx !== exerciseIndex) return ex;
        return { ...ex, done: !ex.done };
      });
      return { ...r, exercises: updatedExercises };
    }));
  };

  const handleMarkRoutineComplete = (routineId) => {
    setWorkoutRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return { ...r, completed: !r.completed };
    }));
  };

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

  // ── Redirect if not authenticated ──────────────────────────────────────────
  useEffect(() => {
    if (!loadingBusiness && !isAuthenticated) {
      navigate(`/${slug}/login`);
    }
  }, [isAuthenticated, loadingBusiness, slug, navigate]);

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
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30 animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-purple-500/20 animate-ping" />
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
  const inputCls = `w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:${a.ring}/50 text-sm transition-all`;

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

        {/* ── Authenticated Dashboard ──────────────────────────────────────── */}
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

            {/* Dynamic Tabs */}
            {(() => {
              const portalTabs = [
                { id: "bookings", label: "My Appointments", icon: <Calendar className="h-4 w-4" /> },
              ];

              if (business.features?.qrCheckIn) {
                portalTabs.push({ id: "qr_checkin", label: "QR Check-in", icon: <QrCode className="h-4 w-4" /> });
              }
              if (business.features?.classScheduler) {
                portalTabs.push({ id: "timetable", label: "Class Timetable", icon: <Clock className="h-4 w-4" /> });
              }
              if (business.features?.workoutPlans) {
                portalTabs.push({ id: "workouts", label: "Workout Plans", icon: <Dumbbell className="h-4 w-4" /> });
              }
              if (business.features?.bodyMetrics) {
                portalTabs.push({ id: "progress", label: "Progress Log", icon: <TrendingUp className="h-4 w-4" /> });
              }
              if (business.features?.invoiceHistory) {
                portalTabs.push({ id: "invoices", label: "Invoices & Pay", icon: <CreditCard className="h-4 w-4" /> });
              }

              // Auto-fallback activeTab if current activeTab is not available
              if (!portalTabs.some(t => t.id === activeTab)) {
                setActiveTab(portalTabs[0]?.id || "bookings");
              }

              return (
                <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto gap-1">
                  {portalTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? a.tabActive
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                {loadingData ? (
                  <div className="flex flex-col items-center py-16 gap-3">
                    <Loader2 className={`h-8 w-8 animate-spin ${a.text}`} />
                    <p className="text-sm text-gray-400">Loading your bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
                    <div className={`w-16 h-16 ${a.bg} ${a.bgDark} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Calendar className={`h-8 w-8 ${a.textDark || a.icon}`} />
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

            {/* QR Check-in Tab */}
            {activeTab === "qr_checkin" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${a.bg} ${a.bgDark} rounded-2xl flex items-center justify-center mb-4`}>
                  <QrCode className={`h-8 w-8 ${a.text}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contactless QR Check-in</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6">
                  Scan this QR code at the gym front desk to instantly record your attendance.
                </p>

                {/* Simulated QR Code */}
                <div className="relative p-6 bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-inner flex flex-col items-center gap-4">
                  <div className="relative p-3 bg-white rounded-2xl shadow-md">
                    <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0" y="0" width="100" height="100" fill="white" />
                      <path d="M5,5 h25 v25 h-25 z M12,12 h11 v11 h-11 z" fill="black" />
                      <path d="M65,5 h25 v25 h-25 z M72,12 h11 v11 h-11 z" fill="black" />
                      <path d="M5,65 h25 v25 h-25 z M12,72 h11 v11 h-11 z" fill="black" />
                      <path d="M40,10 h10 v5 h-10 z M45,20 h10 v5 h-10 z M35,35 h15 v5 h-15 z M80,40 h10 v10 h-10 z M55,50 h15 v5 h-15 z M40,60 h10 v10 h-10 z M65,65 h10 v10 h-10 z M80,80 h10 v10 h-10 z M45,80 h20 v5 h-20 z" fill="black" />
                      <circle cx="50" cy="50" r="12" className={`fill-current ${a.text} animate-pulse`} />
                      <path d="M48,46 h4 v8 h-4 z" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className={`text-[10px] font-bold bg-white ${a.text} px-1.5 py-0.5 rounded shadow`}>KEY-{qrRefreshKey}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                      Rolling Secure Key
                    </span>
                    <button 
                      onClick={handleRefreshQr}
                      className={`text-xs ${a.text} hover:opacity-85 font-bold`}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="w-full border-t border-gray-100 dark:border-gray-800 mt-8 pt-6 text-left">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Attendance Logs</h4>
                  <div className="space-y-3">
                    {checkInLogs.map(log => (
                      <div key={log.id} className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Contactless Scan Check-in</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Approved
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Timetable Tab */}
            {activeTab === "timetable" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Class Timetable</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Explore scheduled gym classes and reserve your spot.</p>
                  </div>

                  {/* Day Selectors */}
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl gap-0.5 max-w-full overflow-x-auto">
                    {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map(day => (
                      <button
                        key={day}
                        onClick={() => setTimetableDay(day)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg capitalize transition-all ${
                          timetableDay === day
                            ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {MOCK_CLASSES.filter(c => c.day === timetableDay).length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No classes scheduled for this day.</p>
                    </div>
                  ) : (
                    MOCK_CLASSES.filter(c => c.day === timetableDay).map(cls => {
                      const isBooked = bookedClasses.includes(cls.id);
                      const currentEnrolled = isBooked ? cls.enrolled + 1 : cls.enrolled;
                      const isFull = currentEnrolled >= cls.capacity;

                      return (
                        <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                          <div className="flex items-start gap-3.5">
                            <div className={`w-10 h-10 rounded-xl ${a.bg} ${a.bgDark} flex items-center justify-center text-lg flex-shrink-0`}>
                              🏋️
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-850 dark:text-gray-200">{cls.className}</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Instructor: <span className="font-semibold text-gray-600 dark:text-gray-300">{cls.instructor}</span></p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {cls.startTime} – {cls.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" /> {currentEnrolled} / {cls.capacity} spots
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBookClass(cls.id)}
                            disabled={isBooked || isFull}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center sm:self-center ${
                              isBooked
                                ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                                : isFull
                                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                                : `${a.btn}`
                            }`}
                          >
                            {isBooked ? (
                              <><CheckCheck className="h-3.5 w-3.5" /> Reserved</>
                            ) : isFull ? (
                              "Class Full"
                            ) : (
                              "Reserve Spot"
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Workout Plans Tab */}
            {activeTab === "workouts" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Workout Routines</h3>
                  <p className="text-sm text-gray-500 mt-0.5">View your customized workout plan assigned by your personal trainer.</p>
                </div>

                <div className="space-y-6">
                  {workoutRoutines.map(routine => (
                    <div key={routine.id} className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">{routine.name}</h4>
                            {routine.completed && (
                              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Assigned by: <span className="font-semibold">{routine.trainer}</span></p>
                        </div>
                        <button
                          onClick={() => handleMarkRoutineComplete(routine.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            routine.completed
                              ? "bg-green-50 dark:bg-green-950/20 border-green-250 dark:border-green-800 text-green-700"
                              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {routine.completed ? "Mark Incomplete" : "Mark Day Complete"}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {routine.exercises.map((ex, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-orange-100 dark:hover:border-orange-950/20 transition-all">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleExerciseDone(routine.id, idx)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                  ex.done
                                    ? "bg-orange-600 border-orange-600 text-white"
                                    : "border-gray-300 dark:border-gray-600 hover:border-orange-500"
                                }`}
                              >
                                {ex.done && <Check size={12} />}
                              </button>
                              <span className={`text-xs font-semibold ${ex.done ? "line-through text-gray-400" : "text-gray-750 dark:text-gray-200"}`}>
                                {ex.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-gray-400">{ex.sets} sets × {ex.reps}</span>
                              <span className="font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-lg text-[10px]">
                                {ex.weight}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Log Tab */}
            {activeTab === "progress" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Progress Log & Weight Tracker</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Log weight measurements and analyze metrics progression.</p>
                </div>

                {/* SVG Chart */}
                <div className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800/60">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Weight Progression (kg)</h4>
                  
                  {metricsLogs.length < 2 ? (
                    <p className="text-xs text-gray-400 text-center py-12">Log at least 2 metrics to view the progression chart.</p>
                  ) : (
                    <div className="relative w-full h-44 mt-2">
                      <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-gray-800" strokeDasharray="3" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-gray-800" strokeDasharray="3" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-gray-800" strokeDasharray="3" />

                        {(() => {
                          const weights = metricsLogs.map(m => m.weight);
                          const minWeight = Math.min(...weights) - 1;
                          const maxWeight = Math.max(...weights) + 1;
                          const range = maxWeight - minWeight || 1;

                          const points = metricsLogs.map((item, idx) => {
                            const x = (idx / (metricsLogs.length - 1)) * 500;
                            const y = 170 - ((item.weight - minWeight) / range) * 140;
                            return { x, y, ...item };
                          });

                          const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                          const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                          return (
                            <>
                              <path d={areaD} fill="url(#chartGrad)" />
                              <path d={pathD} fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
                              {points.map((p, idx) => (
                                <g key={idx}>
                                  <circle cx={p.x} cy={p.y} r="5" className="fill-indigo-600 stroke-white dark:stroke-gray-900" strokeWidth="2" />
                                  <text x={p.x} y={p.y - 12} fill="currentColor" className="text-[10px] font-black text-gray-700 dark:text-gray-300" textAnchor="middle">
                                    {p.weight} kg
                                  </text>
                                  <text x={p.x} y="195" fill="currentColor" className="text-[9px] font-semibold text-gray-400" textAnchor="middle">
                                    {p.date}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  )}
                </div>

                {/* Log Entry Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <form onSubmit={handleAddMetric} className="md:col-span-1 p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Log New Entry</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Weight (kg) *</label>
                      <input
                        type="number" step="0.1" required
                        placeholder="e.g. 76.5"
                        value={newWeight}
                        onChange={e => setNewWeight(e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Body Fat (%)</label>
                      <input
                        type="number" step="0.1"
                        placeholder="e.g. 19.5"
                        value={newFat}
                        onChange={e => setNewFat(e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <button type="submit" className={`w-full py-2.5 rounded-xl font-bold text-xs ${a.btn}`}>
                      Record Metrics
                    </button>
                  </form>

                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Metrics History</h4>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {metricsLogs.slice().reverse().map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{log.date}</span>
                          <div className="flex gap-4">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Weight: <strong className="text-indigo-600 dark:text-indigo-400">{log.weight} kg</strong></span>
                            {log.fat && (
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Body Fat: <strong className="text-purple-600 dark:text-purple-400">{log.fat}%</strong></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="space-y-4">
                {loadingData ? (
                  <div className="flex flex-col items-center py-16 gap-3">
                    <Loader2 className={`h-8 w-8 animate-spin ${a.text}`} />
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
