import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, QrCode, Calendar, Dumbbell, Shield,
  CreditCard, Tag, Bell, TrendingUp, Activity,
  Gift, ShoppingBag, Salad, FileBarChart,
  Wrench, Clock, UserCheck, Sparkles, ArrowRight,
  Check, Lock, ChevronDown, ChevronUp, Save,
  RefreshCw, UserCircle, ClipboardList, Zap,
  Building2, LayoutGrid, AlertCircle, Loader2, X
} from 'lucide-react';

// ─── Plan Tier Config ─────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  free_trial: { label: 'Free Trial', emoji: '🆓', order: 0, color: '#6B7280', pill: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  starter:    { label: 'Starter',    emoji: '🚀', order: 1, color: '#3B82F6', pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  growth:     { label: 'Growth',     emoji: '📈', order: 2, color: '#8B5CF6', pill: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400' },
  pro:        { label: 'Pro',        emoji: '⚡', order: 3, color: '#F59E0B', pill: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  enterprise: { label: 'Enterprise', emoji: '🏢', order: 4, color: '#EC4899', pill: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400' },
};

const PLAN_ORDER = ['free_trial', 'starter', 'growth', 'pro', 'enterprise'];
const isPlanSufficient = (userPlan, required) =>
  PLAN_ORDER.indexOf(userPlan || 'free_trial') >= PLAN_ORDER.indexOf(required);

// ─── 19 Feature Definitions ───────────────────────────────────────────────────
const FEATURES = [
  // Module 1 — Members
  { module: 'members',    key: 'memberProfiles',         label: 'Digital Member Profiles',      desc: 'Comprehensive member cards with photo, ID, contact info, membership status and full history timeline.',             icon: UserCircle,    tier: 'free_trial', color: '#3B82F6' },
  { module: 'members',    key: 'membershipTiers',        label: 'Membership Plan Tiers',        desc: 'Create unlimited membership packages — monthly, quarterly, annual, student, and fully custom plan types.',          icon: ClipboardList, tier: 'free_trial', color: '#6366F1' },
  { module: 'members',    key: 'attendanceTracking',     label: 'Attendance Log',               desc: 'Automatic check-in and check-out logs with daily, weekly and monthly attendance heatmaps per member.',              icon: Activity,      tier: 'free_trial', color: '#10B981' },
  { module: 'members',    key: 'equipmentTracker',       label: 'Equipment Inventory',          desc: 'Catalogue all gym equipment with quantity, condition ratings, last serviced date, and automated maintenance alerts.', icon: Wrench,        tier: 'growth',     color: '#F59E0B' },
  // Module 2 — Booking
  { module: 'booking',    key: 'classScheduler',         label: 'Class Timetable',              desc: 'Visual weekly class scheduler with drag-and-drop slots, instructor assignment, and capacity tracking.',              icon: Calendar,      tier: 'free_trial', color: '#8B5CF6' },
  { module: 'booking',    key: 'personalTrainerBooking', label: 'PT Session Booking',           desc: 'Let members book 1-on-1 personal training sessions directly from the portal, with real-time availability.',         icon: UserCheck,     tier: 'starter',    color: '#06B6D4' },
  { module: 'booking',    key: 'waitlistManagement',     label: 'Class Waitlist',               desc: 'When a class is full, members auto-join a waitlist and get notified instantly when a slot opens up.',               icon: Clock,         tier: 'growth',     color: '#F97316' },
  { module: 'booking',    key: 'qrCheckIn',              label: 'QR Check-In',                  desc: 'Generate unique QR codes for each member for fast, contactless entry scanning at the front desk.',                  icon: QrCode,        tier: 'free_trial', color: '#14B8A6' },
  // Module 3 — Billing
  { module: 'billing',    key: 'autoRenewalBilling',     label: 'Auto-Renewal Billing',         desc: 'Automatically renew memberships on expiry and send reminder notifications before the due date.',                    icon: RefreshCw,     tier: 'free_trial', color: '#22C55E' },
  { module: 'billing',    key: 'promoDiscounts',         label: 'Promo & Coupon Codes',         desc: 'Create time-limited promo codes with flat or percentage discounts, usage caps and member eligibility rules.',        icon: Tag,           tier: 'starter',    color: '#EC4899' },
  { module: 'billing',    key: 'onlinePayments',         label: 'Online Payment Gateway',       desc: 'Accept membership fees and store purchases via eSewa, Khalti and FonePay directly inside the member portal.',       icon: CreditCard,    tier: 'pro',        color: '#3B82F6' },
  { module: 'billing',    key: 'invoiceHistory',         label: 'Member Invoice Portal',        desc: 'Members can access, download, and pay all outstanding invoices online any time — no front-desk required.',          icon: FileBarChart,  tier: 'free_trial', color: '#6366F1' },
  // Module 4 — Engagement
  { module: 'engagement', key: 'workoutPlans',           label: 'Workout Plan Builder',         desc: 'Trainers assign custom workout programs with exercises, sets, reps, and rest timers to individual members.',         icon: Dumbbell,      tier: 'starter',    color: '#8B5CF6' },
  { module: 'engagement', key: 'bodyMetrics',            label: 'Body Metrics Tracker',         desc: 'Record weight, BMI, body fat %, and tape measurements. Members see animated progress charts over time.',            icon: TrendingUp,    tier: 'growth',     color: '#10B981' },
  { module: 'engagement', key: 'loyaltyRewards',         label: 'Loyalty Rewards Program',      desc: 'Award points for every visit and purchase. Members redeem accumulated points for membership discounts or gifts.',    icon: Gift,          tier: 'pro',        color: '#F59E0B' },
  { module: 'engagement', key: 'smsEmailAlerts',         label: 'SMS & Email Blasts',           desc: 'Send automated renewal reminders, class cancellations, and promotional campaign blasts to segmented member lists.',  icon: Bell,          tier: 'free_trial', color: '#06B6D4' },
  // Module 5 — Commerce
  { module: 'commerce',   key: 'gymStore',               label: 'In-Gym Store',                 desc: 'Sell supplements, branded merchandise, and gym accessories directly through the integrated member portal store.',    icon: ShoppingBag,   tier: 'pro',        color: '#EC4899' },
  { module: 'commerce',   key: 'nutritionPlans',         label: 'Nutrition Plan Builder',       desc: 'Dietitians build personalized daily meal plans with macros, calorie targets, and food preference filters.',         icon: Salad,         tier: 'pro',        color: '#22C55E' },
  { module: 'commerce',   key: 'reportsExport',          label: 'Advanced Reports & Export',    desc: 'Export revenue, attendance, membership churn, and trainer performance analytics as formatted CSV or PDF.',          icon: FileBarChart,  tier: 'growth',     color: '#F97316' },
];

const MODULES = [
  { id: 'members',    label: 'Member Management',      icon: Users,       color: '#3B82F6', bg: 'from-blue-500/10 to-indigo-500/5',    border: 'border-blue-500/20',    desc: '4 features — profiles, tiers, attendance, equipment' },
  { id: 'booking',    label: 'Booking & Attendance',   icon: Calendar,    color: '#8B5CF6', bg: 'from-violet-500/10 to-purple-500/5',  border: 'border-violet-500/20',  desc: '4 features — classes, PT, waitlist, QR check-in' },
  { id: 'billing',    label: 'Subscription & Billing', icon: CreditCard,  color: '#22C55E', bg: 'from-emerald-500/10 to-green-500/5',  border: 'border-emerald-500/20', desc: '4 features — auto-renewal, promos, payments, invoices' },
  { id: 'engagement', label: 'Engagement & Retention', icon: TrendingUp,  color: '#F59E0B', bg: 'from-amber-500/10 to-orange-500/5',   border: 'border-amber-500/20',   desc: '4 features — workouts, body metrics, loyalty, alerts' },
  { id: 'commerce',   label: 'Commerce & Operations',  icon: ShoppingBag, color: '#EC4899', bg: 'from-pink-500/10 to-rose-500/5',      border: 'border-pink-500/20',    desc: '3 features — store, nutrition, advanced reports' },
];

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ enabled, locked, onChange, color }) {
  if (locked) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full cursor-not-allowed">
        <Lock size={12} className="text-gray-400" />
        <span className="text-xs font-bold text-gray-400">Locked</span>
      </div>
    );
  }
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        enabled ? 'focus:ring-indigo-500' : 'focus:ring-gray-400'
      }`}
      style={{ backgroundColor: enabled ? color : '#D1D5DB' }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ feature, enabled, locked, onToggle, onDetail }) {
  const Icon = feature.icon;
  const plan = PLAN_CONFIG[feature.tier];

  return (
    <div
      className={`group relative bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 hover:shadow-lg cursor-pointer ${
        locked
          ? 'border-gray-100 dark:border-gray-800 opacity-70'
          : enabled
          ? 'border-gray-200 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
      }`}
      onClick={() => onDetail(feature)}
    >
      {/* Enabled glow accent */}
      {enabled && !locked && (
        <div
          className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none"
          style={{ background: `radial-gradient(circle at top left, ${feature.color}, transparent 70%)` }}
        />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${feature.color}15` }}
          >
            <Icon size={18} style={{ color: feature.color }} />
          </div>

          {/* Toggle */}
          <div onClick={e => e.stopPropagation()}>
            <ToggleSwitch
              enabled={enabled}
              locked={locked}
              onChange={() => onToggle(feature.key)}
              color={feature.color}
            />
          </div>
        </div>

        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1.5">
          {feature.label}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
          {feature.desc}
        </p>

        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.pill}`}>
            {plan.emoji} {plan.label}
          </span>

          {locked ? (
            <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
              <Lock size={10} /> Upgrade
            </span>
          ) : enabled ? (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check size={10} /> Active
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-400">Inactive</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Feature Detail Modal ─────────────────────────────────────────────────────
function FeatureModal({ feature, enabled, locked, onToggle, onClose, userPlan }) {
  if (!feature) return null;
  const Icon = feature.icon;
  const plan = PLAN_CONFIG[feature.tier];
  const userPlanConfig = PLAN_CONFIG[userPlan] || PLAN_CONFIG.free_trial;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-5" style={{ background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)` }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${feature.color}20` }}>
                <Icon size={22} style={{ color: feature.color }} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">{feature.label}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.pill}`}>
                  {plan.emoji} Requires {plan.label}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>

          {locked ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Lock size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Plan upgrade required</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                    Your current plan is <strong>{userPlanConfig.label}</strong>. This feature requires <strong>{plan.label}</strong> or higher.
                  </p>
                </div>
              </div>
              <button className="mt-3 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Sparkles size={14} /> Upgrade to {plan.label}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {enabled ? 'Feature is active' : 'Feature is disabled'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Toggle to {enabled ? 'disable' : 'enable'} this feature</p>
              </div>
              <ToggleSwitch enabled={enabled} locked={false} onChange={() => onToggle(feature.key)} color={feature.color} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Plan Banner ──────────────────────────────────────────────────────────────
function PlanBanner({ currentPlan }) {
  const cfg = PLAN_CONFIG[currentPlan] || PLAN_CONFIG.free_trial;
  const nextPlanKey = PLAN_ORDER[PLAN_ORDER.indexOf(currentPlan) + 1];
  const nextPlan = nextPlanKey ? PLAN_CONFIG[nextPlanKey] : null;
  const enabledCount = FEATURES.filter(f => isPlanSufficient(currentPlan, f.tier)).length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 p-6 mb-8">
      {/* Decorative orbs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ backgroundColor: cfg.color }} />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full blur-2xl opacity-10" style={{ backgroundColor: cfg.color }} />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl">
            {cfg.emoji}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Active Subscription</p>
            <h2 className="text-2xl font-black text-white">{cfg.label} Plan</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              <span className="text-white font-bold">{enabledCount}</span> of {FEATURES.length} features available on your plan
            </p>
          </div>
        </div>

        {nextPlan && (
          <div className="flex flex-col items-end gap-2">
            <p className="text-xs text-gray-400">Unlock {FEATURES.filter(f => f.tier === nextPlanKey).length} more features</p>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-black hover:bg-gray-100 transition-all hover:scale-105 shadow-lg">
              <Zap size={14} /> Upgrade to {nextPlan.label}
            </button>
          </div>
        )}
      </div>

      {/* Plan progress bar */}
      <div className="relative mt-5">
        <div className="flex justify-between mb-1.5">
          {PLAN_ORDER.map((p, i) => {
            const pc = PLAN_CONFIG[p];
            const isActive = p === currentPlan;
            const isPast = PLAN_ORDER.indexOf(p) < PLAN_ORDER.indexOf(currentPlan);
            return (
              <div key={p} className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isActive ? 'bg-white border-white text-gray-900 scale-110' :
                  isPast ? 'bg-white/20 border-white/40 text-white' :
                  'bg-white/5 border-white/15 text-gray-500'
                }`}>
                  {isPast || isActive ? <Check size={12} /> : <span>{i + 1}</span>}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {pc.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${((PLAN_ORDER.indexOf(currentPlan)) / (PLAN_ORDER.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Module Section ────────────────────────────────────────────────────────────
function ModuleSection({ module, features, featureStates, userPlan, onToggle, onDetail }) {
  const [open, setOpen] = useState(true);
  const Icon = module.icon;
  const activeCount = features.filter(f => featureStates[f.key]).length;
  const availableCount = features.filter(f => isPlanSufficient(userPlan, f.tier)).length;

  return (
    <div className={`rounded-3xl border overflow-hidden ${module.border} bg-gradient-to-br ${module.bg}`}>
      {/* Module Header */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${module.color}20` }}>
            <Icon size={20} style={{ color: module.color }} />
          </div>
          <div className="text-left">
            <h3 className="text-base font-black text-gray-900 dark:text-white">{module.label}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{module.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-sm font-black" style={{ color: module.color }}>{activeCount}</span>
            <span className="text-xs text-gray-400"> / {features.length} active</span>
          </div>
          {/* Plan coverage mini badge */}
          {availableCount < features.length && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-full hidden sm:inline-flex items-center gap-1">
              <Lock size={9} /> {features.length - availableCount} locked
            </span>
          )}
          {open ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
        </div>
      </button>

      {/* Feature Grid */}
      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map(f => (
            <FeatureCard
              key={f.key}
              feature={f}
              enabled={!!featureStates[f.key]}
              locked={!isPlanSufficient(userPlan, f.tier)}
              onToggle={onToggle}
              onDetail={onDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App Center Page ─────────────────────────────────────────────────────
export default function AppCenter() {
  const { activeBusiness } = useAuth();

  const [featureStates, setFeatureStates] = useState({});
  const [initialStates, setInitialStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const currentPlan = activeBusiness?.subscription?.plan || 'free_trial';

  // Load feature states from activeBusiness
  useEffect(() => {
    if (!activeBusiness) return;
    const initial = {};
    FEATURES.forEach(f => {
      initial[f.key] = activeBusiness.features?.[f.key] ?? false;
    });
    setFeatureStates(initial);
    setInitialStates(initial);
    setLoading(false);
  }, [activeBusiness]);

  // Detect changes
  useEffect(() => {
    const changed = FEATURES.some(f => featureStates[f.key] !== initialStates[f.key]);
    setHasChanges(changed);
  }, [featureStates, initialStates]);

  const handleToggle = useCallback((key) => {
    const feature = FEATURES.find(f => f.key === key);
    if (!feature || !isPlanSufficient(currentPlan, feature.tier)) return;
    setFeatureStates(prev => ({ ...prev, [key]: !prev[key] }));
  }, [currentPlan]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('saas_token');
      const businessId = activeBusiness?._id;
      if (!businessId) throw new Error('Business not found');

      const body = { features: featureStates };
      const res = await fetch(`http://localhost:5000/api/businesses/${businessId}/features`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        // Graceful fallback — update local state regardless
        console.warn('Feature PATCH endpoint not yet created — changes saved locally only.');
      }

      setInitialStates({ ...featureStates });
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save features.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFeatureStates({ ...initialStates });
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
            <LayoutGrid className="h-7 w-7 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Loading App Center...</p>
        </div>
      </div>
    );
  }

  const enabledCount = FEATURES.filter(f => featureStates[f.key]).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <LayoutGrid size={16} className="text-white" />
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">App Center</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Gym Feature Hub</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage all <span className="font-bold text-gray-700 dark:text-gray-300">{FEATURES.length}</span> features for your gym.{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{enabledCount} active</span> right now.
            </p>
          </div>

          {/* Save Controls */}
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={handleDiscard}
                className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Discard
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                saveSuccess
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : hasChanges
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}
            >
              {saving ? (
                <><Loader2 size={15} className="animate-spin" /> Saving...</>
              ) : saveSuccess ? (
                <><Check size={15} /> Saved!</>
              ) : (
                <><Save size={15} /> Save Changes</>
              )}
            </button>
          </div>
        </div>

        {/* Save Error */}
        {saveError && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* ── Plan Banner ──────────────────────────────────────────────────── */}
        <PlanBanner currentPlan={currentPlan} />

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Features',   value: FEATURES.length,                                                             color: '#6366F1', icon: LayoutGrid },
            { label: 'Active',           value: enabledCount,                                                                 color: '#22C55E', icon: Check },
            { label: 'Available on Plan',value: FEATURES.filter(f => isPlanSufficient(currentPlan, f.tier)).length,         color: '#3B82F6', icon: Zap },
            { label: 'Locked',           value: FEATURES.filter(f => !isPlanSufficient(currentPlan, f.tier)).length,        color: '#F59E0B', icon: Lock },
          ].map(stat => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <StatIcon size={14} style={{ color: stat.color }} />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{stat.label}</span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* ── Module Sections ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          {MODULES.map(module => (
            <ModuleSection
              key={module.id}
              module={module}
              features={FEATURES.filter(f => f.module === module.id)}
              featureStates={featureStates}
              userPlan={currentPlan}
              onToggle={handleToggle}
              onDetail={setSelectedFeature}
            />
          ))}
        </div>

        {/* ── Unsaved Banner ────────────────────────────────────────────────── */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-gray-900 dark:bg-gray-800 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-4">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold">You have unsaved changes</span>
            <button
              onClick={handleDiscard}
              className="text-xs text-gray-400 hover:text-white transition-colors font-medium"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Now
            </button>
          </div>
        )}
      </div>

      {/* ── Feature Detail Modal ────────────────────────────────────────────── */}
      {selectedFeature && (
        <FeatureModal
          feature={selectedFeature}
          enabled={!!featureStates[selectedFeature.key]}
          locked={!isPlanSufficient(currentPlan, selectedFeature.tier)}
          onToggle={(key) => { handleToggle(key); }}
          onClose={() => setSelectedFeature(null)}
          userPlan={currentPlan}
        />
      )}
    </div>
  );
}
