import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE from '../../config/api.js';
import {
  Phone, Mail, MapPin, Clock, Star, ChevronRight,
  Stethoscope, Heart, Award, ArrowRight, ExternalLink,
  Users, Shield, Sparkles, CheckCircle, Calendar,
  Zap, Activity, Info, X, ChevronDown, ChevronUp,
  Smile, ShieldCheck, FileText, Check
} from 'lucide-react';
import SpecialOfferPopup from '../../components/offers/SpecialOfferPopup';

// ── Custom Social Icons ─────────────────────────────────────
const Facebook = ({ size = 20, ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Instagram = ({ size = 20, ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const Youtube = ({ size = 20, ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

// ── Tooth / Dental SVG Icon ─────────────────────────────────
const ToothIcon = ({ size = 24, color = 'currentColor', ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6.5 2 9.5.5 3 2.5 4.5 4 4.5s3.5-1.5 4-4.5c.5-3 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" />
    <path d="M12 2v6" />
    <path d="M9 10c1 1 2 1 3 1s2 0 3-1" />
  </svg>
);

// ── Star Rating ─────────────────────────────────────────────
const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: '3px' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={15} fill={n <= rating ? '#38bdf8' : 'none'} color={n <= rating ? '#38bdf8' : '#475569'} />
    ))}
  </div>
);

// ── Animated Counter ────────────────────────────────────────
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 35);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
};

export default function ClinicWebsite({ data, slug }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFaq, setActiveFaq] = useState(0);

  const [reviewForm, setReviewForm] = useState({ customerName: '', rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewsList, setReviewsList] = useState(data?.reviews || []);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(null);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (data?.offers && data.offers.length > 0) {
      const timer = setTimeout(() => setShowOfferPopup(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const {
    business = {},
    gymWebsite: gw = {},
    plans = [],
    trainers = [],
    services = [],
    gallery = [],
    offers = []
  } = data || {};

  const clinicName   = business?.name || 'Smile Dental & Medical Clinic';
  const coverImg    = gw.coverImage || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&auto=format&fit=crop&q=80';
  const logo        = gw.logo;
  const description = gw.description || business?.branding?.description || 'Your premier destination for gentle, advanced dental treatments, smile aesthetics, digital 3D diagnostics, and compassionate family oral healthcare.';
  const mission     = gw.mission || 'To elevate oral wellness with precision technology, absolute sterilization, and patient-first compassionate dental care.';
  const facilities  = gw.facilities || 'Digital 3D OPG Suite, Painless Laser Dentistry, Sterilization Autoclave Lab, Intraoral Scanner, Pediatric Fun Zone';
  const phone       = gw.phone || business?.contact?.phone || '+977 1-4422000';
  const email       = gw.email || business?.contact?.email || 'care@smiledental.com.np';
  const address     = gw.address || business?.contact?.address || 'Durbar Marg, Kathmandu, Nepal';
  const mapLink     = gw.mapLink || '';
  const social      = gw.socialLinks || {};
  const hours       = gw.businessHours || {};

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/public/gym/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        const result = await res.json();
        setReviewSuccess(true);
        setReviewForm({ customerName: '', rating: 5, comment: '' });
        if (result.review) setReviewsList(prev => [result.review, ...prev]);
      }
    } catch {
      /* silent */
    } finally {
      setReviewSubmitting(false);
    }
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabel = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

  // Generate categories from existing services
  const rawCategories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
  const serviceCategories = ['all', ...(rawCategories.length > 0 ? rawCategories : ['Preventive', 'Cosmetic', 'Orthodontics', 'Restorative'])];
  
  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => (s.category || '').toLowerCase() === activeCategory.toLowerCase());

  const faqs = [
    {
      q: "Are dental treatments and cleanings painful?",
      a: "No! We utilize ultra-gentle ultrasonic scalers, computer-assisted local anesthesia, and minimally invasive dental laser technology to ensure maximum patient comfort and zero pain."
    },
    {
      q: "How often should I visit for a dental checkup and scaling?",
      a: "Dental associations recommend a comprehensive oral exam and professional scaling every 6 months to prevent plaque build-up, gum inflammation, and hidden cavities."
    },
    {
      q: "What is the difference between Braces and Clear Invisible Aligners?",
      a: "Both correct teeth alignment. Clear aligners (like Invisalign) are virtually invisible, custom 3D printed, removable for meals, and require fewer emergency adjustments than traditional ceramic/metal brackets."
    },
    {
      q: "Can I book a same-day emergency dental appointment?",
      a: "Yes! We reserve daily priority slots for acute toothaches, chipped teeth, swelling, and emergency dental trauma. Call our hotline or book online instantly."
    }
  ];

  return (
    <div className="clinic-theme-root">
      {/* ── STYLES & DESIGN TOKENS ───────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap');

        .clinic-theme-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #060b14;
          color: #f1f5f9;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .clinic-heading {
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }

        .clinic-glow-1 {
          position: absolute; top: -10%; left: 10%; width: 550px; height: 550px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, rgba(6, 182, 212, 0.05) 45%, rgba(0,0,0,0) 70%);
          pointer-events: none; filter: blur(90px);
        }
        .clinic-glow-2 {
          position: absolute; top: 40%; right: -5%; width: 650px; height: 650px;
          background: radial-gradient(circle, rgba(20, 184, 166, 0.14) 0%, rgba(14, 165, 233, 0.04) 50%, rgba(0,0,0,0) 70%);
          pointer-events: none; filter: blur(100px);
        }

        .clinic-glass-card {
          background: rgba(13, 23, 42, 0.65);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(56, 189, 248, 0.18);
          border-radius: 24px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .clinic-glass-card:hover {
          border-color: rgba(56, 189, 248, 0.45);
          transform: translateY(-4px);
          box-shadow: 0 20px 45px -12px rgba(14, 165, 233, 0.28);
        }

        .clinic-btn-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
          color: #ffffff;
          font-weight: 700;
          border-radius: 9999px;
          padding: 14px 28px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px -5px rgba(14, 165, 233, 0.45);
          transition: all 0.3s ease;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        .clinic-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px -5px rgba(14, 165, 233, 0.65);
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
        }

        .clinic-btn-outline {
          background: rgba(255, 255, 255, 0.04);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.35);
          font-weight: 700;
          border-radius: 9999px;
          padding: 14px 28px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          text-decoration: none;
          cursor: pointer;
        }
        .clinic-btn-outline:hover {
          background: rgba(14, 165, 233, 0.15);
          border-color: rgba(56, 189, 248, 0.7);
          color: #ffffff;
        }

        .clinic-pill-tag {
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #38bdf8;
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .clinic-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .clinic-nav-link {
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.92rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .clinic-nav-link:hover {
          color: #38bdf8;
        }

        @media (max-width: 900px) {
          .clinic-desktop-nav { display: none !important; }
          .clinic-hero-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .clinic-hero-title { font-size: 2.5rem !important; }
        }
      `}</style>

      {/* ── TOP EMERGENCY & NOTICE BAR ───────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, #0369a1 0%, #0284c7 50%, #0d9488 100%)',
        padding: '8px 24px',
        fontSize: '0.82rem',
        fontWeight: 700,
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.25)', fontSize: '0.72rem', fontWeight: 800 }}>
            EMERGENCY CARE
          </span>
          <span>Immediate Dental Trauma & Pain Relief Available Daily</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {phone && (
            <a href={`tel:${phone}`} style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} /> <span>Emergency Line: {phone}</span>
            </a>
          )}
          <span style={{ opacity: 0.7 }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} /> Mon – Sat: 8:00 AM – 7:00 PM
          </span>
        </div>
      </div>

      {/* ── STICKY NAVBAR ───────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(6, 11, 20, 0.95)' : 'rgba(6, 11, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(56, 189, 248, 0.18)' : '1px solid transparent',
        transition: 'all 0.3s'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Brand */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {logo ? (
              <img
                src={logo}
                alt={clinicName}
                style={{ height: 46, width: 46, borderRadius: 14, objectFit: 'cover', border: '1.5px solid rgba(56, 189, 248, 0.4)' }}
              />
            ) : (
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)'
              }}>
                <ToothIcon size={24} color="#fff" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="clinic-heading" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {clinicName}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Dental & Oral Health Hub
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="clinic-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <button className="clinic-nav-link" onClick={() => scrollTo('services')}>Treatments</button>
            {offers.length > 0 && <button className="clinic-nav-link" onClick={() => scrollTo('offers')}>Special Offers</button>}
            {trainers.length > 0 && <button className="clinic-nav-link" onClick={() => scrollTo('doctors')}>Specialists</button>}
            {plans.length > 0 && <button className="clinic-nav-link" onClick={() => scrollTo('plans')}>Care Plans</button>}
            {gallery.length > 0 && <button className="clinic-nav-link" onClick={() => scrollTo('gallery')}>Clinic Tour</button>}
            <button className="clinic-nav-link" onClick={() => scrollTo('faq')}>FAQs</button>
            <button className="clinic-nav-link" onClick={() => scrollTo('reviews')}>Reviews</button>
            <button className="clinic-nav-link" onClick={() => scrollTo('contact')}>Hours & Location</button>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAuthenticated ? (
              <Link to={`/${slug}/portal`} className="clinic-btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
                Patient Portal <ChevronRight size={16} />
              </Link>
            ) : (
              <>
                <Link to={`/${slug}/login`} className="clinic-nav-link" style={{ textDecoration: 'none', marginRight: 6 }}>
                  Patient Login
                </Link>
                <Link to={`/${slug}/signup`} className="clinic-btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
                  Book Consultation <Calendar size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ────────────────────────────────────── */}
      <section style={{ position: 'relative', paddingTop: 90, paddingBottom: 100, minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
        <div className="clinic-glow-1" />
        <div className="clinic-glow-2" />

        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div className="clinic-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 56, alignItems: 'center' }}>
            
            {/* Left Content */}
            <div>
              <div className="clinic-pill-tag" style={{ marginBottom: 20 }}>
                <Sparkles size={14} /> State-of-the-Art Painless Dental Clinic
              </div>

              <h1 className="clinic-heading clinic-hero-title" style={{ fontSize: '3.6rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.12, marginBottom: 24 }}>
                Precision Dental Care. <br />
                <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #2dd4bf 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Radiant, Confident Smiles.
                </span>
              </h1>

              <p style={{ fontSize: '1.08rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: 36, maxWidth: 580 }}>
                {description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
                <Link to={`/${slug}/signup`} className="clinic-btn-primary">
                  Book Dental Appointment <ArrowRight size={18} />
                </Link>
                <button onClick={() => scrollTo('services')} className="clinic-btn-outline">
                  Explore Treatments <Stethoscope size={18} />
                </button>
              </div>

              {/* Trust Metric Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 28, maxWidth: 540 }}>
                <div>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>
                    <Counter target={services.length || 18} suffix="+" />
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>Dental Procedures</p>
                </div>
                <div>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: '#2dd4bf', margin: 0 }}>
                    <Counter target={trainers.length || 6} suffix="+" />
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>Specialist Doctors</p>
                </div>
                <div>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24', margin: 0 }}>4.9★</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>Patient Rating</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: 32,
                overflow: 'hidden',
                border: '2px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 30px 80px rgba(14, 165, 233, 0.3)',
                aspectRatio: '4/5',
                position: 'relative'
              }}>
                <img
                  src={coverImg}
                  alt={clinicName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(6,11,20,0.92) 100%)' }} />
              </div>

              {/* Floating Badge Top */}
              <div className="clinic-glass-card" style={{ position: 'absolute', top: 24, left: -24, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(45,212,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.85rem', margin: 0, color: '#fff' }}>100% Sterile Environment</p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>ISO 9001 Certified Hygiene</p>
                </div>
              </div>

              {/* Floating Badge Bottom */}
              <div className="clinic-glass-card" style={{ position: 'absolute', bottom: -20, right: -16, padding: '16px 22px', maxWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <ToothIcon size={24} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, color: '#fff' }}>Painless Tech</p>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Digital 3D Intraoral Scans</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT TRUST STRIP ───────────────────────────── */}
      <section style={{ padding: '40px 0', background: 'rgba(13, 23, 42, 0.5)', borderY: '1px solid rgba(56, 189, 248, 0.15)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}>
                <Activity size={22} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, color: '#fff' }}>3D Digital Imaging</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>Ultra-precise panoramic OPG</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(45,212,191,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf', flexShrink: 0 }}>
                <Shield size={22} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, color: '#fff' }}>Medical Autoclave</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>Class-B hospital sterilization</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
                <Smile size={22} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, color: '#fff' }}>Gentle & Anxiety-Free</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>Comfortable sedation options</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(129,140,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                <Award size={22} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, color: '#fff' }}>Certified Dentists</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>BDS / MDS board accredited</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TREATMENTS & CLINICAL SERVICES ─────────────────── */}
      <section id="services" style={{ padding: '100px 0', position: 'relative' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="clinic-pill-tag" style={{ marginBottom: 14 }}>
              <ToothIcon size={14} /> Comprehensive Dental Treatments
            </div>
            <h2 className="clinic-heading" style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              Clinical Excellence & <span style={{ color: '#38bdf8' }}>Specialized Care</span>
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 640, margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
              From routine preventative checkups to advanced laser smile makeovers and dental implants, we provide complete oral healthcare for the entire family.
            </p>
          </div>

          {/* Category Filter Pills */}
          {serviceCategories.length > 2 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 44 }}>
              {serviceCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '9px 22px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.88rem', textTransform: 'capitalize',
                    background: activeCategory.toLowerCase() === cat.toLowerCase()
                      ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                      : 'rgba(255,255,255,0.05)',
                    color: activeCategory.toLowerCase() === cat.toLowerCase() ? '#ffffff' : '#94a3b8',
                    boxShadow: activeCategory.toLowerCase() === cat.toLowerCase() ? '0 8px 20px rgba(14, 165, 233, 0.35)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat === 'all' ? 'All Treatments' : cat}
                </button>
              ))}
            </div>
          )}

          {/* Services Grid */}
          <div className="clinic-grid-3">
            {filteredServices.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', gridColumn: '1/-1', padding: 40 }}>
                No clinical services listed in this category.
              </p>
            ) : filteredServices.map(svc => (
              <div
                key={svc._id}
                className="clinic-glass-card"
                style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 16,
                      background: 'rgba(14,165,233,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#38bdf8'
                    }}>
                      <ToothIcon size={26} />
                    </div>
                    {svc.price && (
                      <span style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        color: '#38bdf8',
                        padding: '6px 14px',
                        borderRadius: 9999,
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}>
                        NPR {svc.price}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                    {svc.serviceName || svc.name}
                  </h3>

                  {svc.description && (
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 18 }}>
                      {svc.description}
                    </p>
                  )}

                  {svc.duration && (
                    <p style={{ fontSize: '0.82rem', color: '#2dd4bf', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <Clock size={14} /> Estimated Time: {svc.duration} Mins
                    </p>
                  )}
                </div>

                <Link
                  to={`/${slug}/signup?service=${svc._id}`}
                  className="clinic-btn-outline"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: '11px 18px', fontSize: '0.88rem' }}
                >
                  <span>Book This Treatment</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SPECIAL OFFERS SECTION ─────────────────────────── */}
      {offers.length > 0 && (
        <section id="offers" style={{ padding: '100px 0', background: 'rgba(13, 23, 42, 0.65)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="clinic-pill-tag" style={{ marginBottom: 14 }}>
                <Sparkles size={14} /> Limited-Time Promotions
              </div>
              <h2 className="clinic-heading" style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Special <span style={{ color: '#38bdf8' }}>Dental Packages</span> & Discounts
              </h2>
              <p style={{ color: '#94a3b8', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
                Claim our exclusive patient promotional rates and save on smile treatments.
              </p>
            </div>

            <div className="clinic-grid-3">
              {offers.map(offer => {
                const discountLabel = offer.discount?.type === 'percentage'
                  ? `${offer.discount.value}% OFF`
                  : offer.discount?.type === 'fixed_amount'
                  ? `NPR ${offer.discount.value} OFF`
                  : 'Special Promotion';
                const endDate = offer.validity?.endDate
                  ? new Date(offer.validity.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : null;

                return (
                  <div key={offer._id} className="clinic-glass-card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                      borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }} />

                    {offer.display?.bannerImage && (
                      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, height: 140 }}>
                        <img src={offer.display.bannerImage} alt={offer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      color: '#fff', padding: '6px 16px', borderRadius: 9999,
                      fontSize: '0.82rem', fontWeight: 800, marginBottom: 16,
                      boxShadow: '0 6px 20px rgba(14,165,233,0.4)'
                    }}>
                      🏷️ {discountLabel}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>{offer.name}</h3>

                    {offer.description && (
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>{offer.description}</p>
                    )}

                    {offer.code && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(14,165,233,0.1)',
                        border: '1px dashed rgba(56,189,248,0.4)',
                        borderRadius: 12, padding: '10px 16px', marginBottom: 14
                      }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Promo Code:</span>
                        <code style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>{offer.code}</code>
                      </div>
                    )}

                    {endDate && (
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                        <Clock size={12} /> Valid until <strong style={{ color: '#2dd4bf' }}>{endDate}</strong>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── DOCTORS & DENTAL SPECIALISTS ────────────────────── */}
      {trainers.length > 0 && (
        <section id="doctors" style={{ padding: '100px 0' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="clinic-pill-tag" style={{ marginBottom: 14 }}>
                <Users size={14} /> Medical & Dental Team
              </div>
              <h2 className="clinic-heading" style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Meet Our Board-Certified <span style={{ color: '#38bdf8' }}>Specialists</span>
              </h2>
              <p style={{ color: '#94a3b8', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
                Compassionate clinicians dedicated to patient comfort and outstanding smile transformations.
              </p>
            </div>

            <div className="clinic-grid-3">
              {trainers.map(doc => (
                <div key={doc._id} className="clinic-glass-card" style={{ padding: 28, textAlign: 'center' }}>
                  <div style={{
                    width: 124, height: 124, borderRadius: '50%',
                    margin: '0 auto 20px', overflow: 'hidden',
                    border: '3px solid rgba(56, 189, 248, 0.4)',
                    boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)'
                  }}>
                    <img
                      src={doc.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=60'}
                      alt={doc.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=60'; }}
                    />
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>{doc.name}</h3>
                  <p style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.88rem', marginBottom: 12 }}>{doc.specialization}</p>

                  {doc.experience && (
                    <p style={{ fontSize: '0.82rem', color: '#2dd4bf', fontWeight: 700, marginBottom: 10 }}>
                      ✨ {doc.experience} Clinical Experience
                    </p>
                  )}

                  {doc.bio && (
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
                      "{doc.bio}"
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── DENTAL HEALTH PLANS & PACKAGES ─────────────────── */}
      {plans.length > 0 && (
        <section id="plans" style={{ padding: '100px 0', background: 'rgba(13, 23, 42, 0.65)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="clinic-pill-tag" style={{ marginBottom: 14 }}>
                <Award size={14} /> Annual Dental Wellness
              </div>
              <h2 className="clinic-heading" style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Patient <span style={{ color: '#38bdf8' }}>Care Plans</span> & Packages
              </h2>
              <p style={{ color: '#94a3b8', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
                Cost-effective preventative dental memberships and family treatment coverage.
              </p>
            </div>

            <div className="clinic-grid-3">
              {plans.map(p => (
                <div
                  key={p._id}
                  className="clinic-glass-card"
                  style={{
                    padding: 32, display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: p.isPopular ? '2px solid #0ea5e9' : undefined
                  }}
                >
                  <div>
                    {p.isPopular && (
                      <span style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        color: '#fff', padding: '4px 14px', borderRadius: 9999,
                        fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.05em', display: 'inline-block', marginBottom: 16
                      }}>
                        Most Popular Plan
                      </span>
                    )}

                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8' }}>NPR {p.price}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>/ {p.duration}</span>
                    </div>

                    {p.description && (
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
                        {p.description}
                      </p>
                    )}

                    {p.features && p.features.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                        {p.features.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#cbd5e1' }}>
                            <CheckCircle size={15} color="#2dd4bf" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link to={`/${slug}/signup`} className="clinic-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}>
                    Subscribe to Dental Plan
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── CLINIC GALLERY & FACILITY TOUR ─────────────────── */}
      {gallery.length > 0 && (
        <section id="gallery" style={{ padding: '90px 0' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="clinic-pill-tag" style={{ marginBottom: 14 }}>
                <Sparkles size={14} /> Clinic Showcase
              </div>
              <h2 className="clinic-heading" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                Clinic Facilities & <span style={{ color: '#38bdf8' }}>Smile Transformations</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
              {gallery.map((img, i) => (
                <div
                  key={img._id}
                  onClick={() => setActiveGalleryIdx(i)}
                  style={{
                    position: 'relative', borderRadius: 20, overflow: 'hidden',
                    height: 240, cursor: 'pointer', border: '1px solid rgba(56,189,248,0.25)'
                  }}
                >
                  <img src={img.imageUrl} alt={img.caption || 'Clinic Work'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    style={{
                      position: 'absolute', inset: 0, background: 'rgba(6,11,20,0.55)',
                      opacity: 0, transition: 'opacity 0.3s', display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <ExternalLink size={24} color="#38bdf8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── INTERACTIVE DENTAL FAQ SECTION ──────────────────── */}
      <section id="faq" style={{ padding: '90px 0', background: 'rgba(13, 23, 42, 0.65)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="clinic-pill-tag" style={{ marginBottom: 14 }}>
              <Info size={14} /> Patient FAQs
            </div>
            <h2 className="clinic-heading" style={{ fontSize: '2.6rem', fontWeight: 900, color: '#fff', marginBottom: 10 }}>
              Frequently Asked <span style={{ color: '#38bdf8' }}>Questions</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Everything you need to know about our gentle dental procedures and visit prep.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className="clinic-glass-card"
                style={{ padding: '20px 24px', cursor: 'pointer' }}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {f.q}
                  </h4>
                  <div style={{ color: '#38bdf8' }}>
                    {activeFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {activeFaq === idx && (
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginTop: 14, margin: '14px 0 0' }}>
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PATIENT REVIEWS & SUBMISSION FORM ───────────────── */}
      <section id="reviews" style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="clinic-pill-tag" style={{ marginBottom: 14 }}>
              <Heart size={14} /> Verified Patient Stories
            </div>
            <h2 className="clinic-heading" style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              What Our Patients <span style={{ color: '#38bdf8' }}>Say</span>
            </h2>
          </div>

          <div className="clinic-grid-3" style={{ marginBottom: 60 }}>
            {(reviewsList.length > 0 ? reviewsList : [
              { _id: '1', customerName: 'Sanjay Shrestha', rating: 5, comment: 'Completely painless root canal treatment! Dr. Aayush and team made me feel totally relaxed.' },
              { _id: '2', customerName: 'Rashmi Adhikari', rating: 5, comment: 'Got my ceramic braces and whitening here. The 3D scan preview was accurate and results are incredible.' },
              { _id: '3', customerName: 'Binod Tamang', rating: 5, comment: 'Super clean, high-tech dental operatory. Courteous staff and punctual appointment times.' }
            ]).slice(0, 6).map(r => (
              <div key={r._id} className="clinic-glass-card" style={{ padding: 26 }}>
                <StarRating rating={r.rating} />
                <p style={{ color: '#f1f5f9', fontSize: '0.93rem', lineHeight: 1.6, margin: '16px 0' }}>
                  "{r.comment}"
                </p>
                <p style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.9rem', margin: 0 }}>
                  — {r.customerName}
                </p>
              </div>
            ))}
          </div>

          {/* Add Review Form Card */}
          <div className="clinic-glass-card" style={{ maxWidth: 620, margin: '0 auto', padding: 36 }}>
            <h3 className="clinic-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
              Share Your Patient Experience
            </h3>

            {reviewSuccess ? (
              <div style={{
                background: 'rgba(45,212,191,0.15)',
                border: '1px solid rgba(45,212,191,0.3)',
                color: '#2dd4bf',
                padding: 16,
                borderRadius: 16,
                textAlign: 'center',
                fontWeight: 700
              }}>
                ✨ Thank you! Your review has been submitted.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={reviewForm.customerName}
                  onChange={e => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 18px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(56,189,248,0.25)',
                    color: '#fff', outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 700 }}>Your Rating:</span>
                  <select
                    value={reviewForm.rating}
                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      background: '#0d172a',
                      border: '1px solid rgba(56,189,248,0.35)',
                      color: '#38bdf8', fontWeight: 800
                    }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars - Good)</option>
                  </select>
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about your dental visit..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 18px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(56,189,248,0.25)',
                    color: '#fff', outline: 'none'
                  }}
                />

                <button type="submit" disabled={reviewSubmitting} className="clinic-btn-primary" style={{ justifyContent: 'center' }}>
                  {reviewSubmitting ? 'Submitting...' : 'Submit Patient Review'}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ── FOOTER & CLINIC HOURS ──────────────────────────── */}
      <footer id="contact" style={{ background: '#030710', borderTop: '1px solid rgba(56,189,248,0.15)', paddingTop: 80, paddingBottom: 40 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, marginBottom: 60 }}>
          
          {/* Col 1: About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ToothIcon size={20} />
              </div>
              <h3 className="clinic-heading" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>{clinicName}</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>{description}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}><Facebook /></a>}
              {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}><Instagram /></a>}
              {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}><Youtube /></a>}
            </div>
          </div>

          {/* Col 2: Contact & Location */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Contact & Location</h4>
            {address && <p style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><MapPin size={16} color="#0ea5e9" /> {address}</p>}
            {phone && <p style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Phone size={16} color="#0ea5e9" /> {phone}</p>}
            {email && <p style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={16} color="#0ea5e9" /> {email}</p>}
          </div>

          {/* Col 3: Timetable */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Clinic Operating Hours</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: '#94a3b8' }}>
              {dayOrder.map(day => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', textTransform: 'capitalize' }}>
                  <span>{dayLabel[day]}</span>
                  <span style={{ color: hours[day]?.closed ? '#f87171' : '#f1f5f9' }}>
                    {hours[day]?.closed ? 'Closed' : `${hours[day]?.open || '08:00'} - ${hours[day]?.close || '19:00'}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 24px 0', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          © {new Date().getFullYear()} {clinicName}. All rights reserved. Powered by BizNepal Multi-Tenant Cloud.
        </div>
      </footer>

      {/* ── SPECIAL OFFER POPUP INTEGRATION ────────────────── */}
      {offers.length > 0 && (
        <SpecialOfferPopup
          offers={offers}
          businessName={clinicName}
          businessType="clinic"
          slug={slug}
          isOpen={showOfferPopup}
          onClose={() => setShowOfferPopup(false)}
        />
      )}
    </div>
  );
}
