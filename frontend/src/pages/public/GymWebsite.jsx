import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Phone, Mail, MapPin, Clock,
  Star, ChevronRight, Dumbbell, Zap, Heart, Target,
  Users, Award, ArrowRight, CheckCircle,
  X, Menu, Copy, ExternalLink, Shield, Flame, TrendingUp
} from 'lucide-react';

// ── Custom SVG social brand icons ──────────────────────────
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

// ── Star Rating ──────────────────────────────────────────────
const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={16} fill={n <= rating ? '#f59e0b' : 'none'} color={n <= rating ? '#f59e0b' : '#d1d5db'} />
    ))}
  </div>
);

// ── 404 Not Found ────────────────────────────────────────────
const GymNotFound = ({ slug }) => (
  <div style={S.notFoundPage}>
    <div style={S.notFoundCard}>
      <div style={S.notFoundIcon}><Dumbbell size={56} color="#6366f1" /></div>
      <h1 style={S.notFoundTitle}>Gym Not Found</h1>
      <p style={S.notFoundSub}>No gym registered at <strong style={{ color: '#6366f1' }}>/{slug}</strong></p>
      <p style={S.notFoundMeta}>The gym may not exist or its URL may have changed.</p>
      <Link to="/" style={S.notFoundBtn}><ArrowRight size={18} /> Go to Homepage</Link>
    </div>
  </div>
);

// ── Loading ──────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={S.loadingWrap}>
    <div style={S.spinner} />
    <p style={{ color: '#9ca3af', marginTop: 16, fontWeight: 600 }}>Loading gym website…</p>
  </div>
);

// ── Animated counter ─────────────────────────────────────────
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
};

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const GymWebsite = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customerName: '', rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(null);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const heroRef = useRef(null);
  const popupTimerRef = useRef(null);

  // Scroll listener for sticky nav effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchGym = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/public/gym/${slug}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        setData(json);
        setReviewsList(json.reviews || []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [slug]);

  const offers = data?.offers || [];

  // Show offers popup after 3 s (only if there are active offers)
  useEffect(() => {
    if (offers.length > 0 && !popupDismissed) {
      popupTimerRef.current = setTimeout(() => setShowOfferPopup(true), 3000);
    }
    return () => clearTimeout(popupTimerRef.current);
  }, [offers, popupDismissed]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/public/gym/${slug}/reviews`, {
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
    } catch { /* silently fail */ }
    finally { setReviewSubmitting(false); }
  };

  if (loading) return <LoadingScreen />;
  if (notFound || !data) return <GymNotFound slug={slug} />;

  const { business, gymWebsite: gw = {}, plans = [], trainers = [], services = [], gallery = [] } = data;

  const gymName    = business?.name || 'Gym';
  const coverImg   = gw.coverImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80';
  const logo       = gw.logo;
  const description = gw.description || business?.branding?.description || 'Welcome to our world-class gym facility — where your fitness journey begins.';
  const phone      = gw.phone || business?.contact?.phone || '';
  const email      = gw.email || business?.contact?.email || '';
  const address    = gw.address || business?.contact?.address || '';
  const mapLink    = gw.mapLink || '';
  const social     = gw.socialLinks || {};
  const hours      = gw.businessHours || {};
  const mission    = gw.mission || '';
  const facilities = gw.facilities || '';

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const dismissPopup = () => {
    setShowOfferPopup(false);
    setPopupDismissed(true);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    });
  };

  const navLinks = [
    { label: 'About',      id: 'about' },
    plans.length > 0    ? { label: 'Plans',     id: 'plans'     } : null,
    trainers.length > 0 ? { label: 'Trainers',  id: 'trainers'  } : null,
    services.length > 0 ? { label: 'Services',  id: 'services'  } : null,
    gallery.length > 0  ? { label: 'Gallery',   id: 'gallery'   } : null,
    { label: 'Reviews',    id: 'testimonials' },
    { label: 'Contact',    id: 'contact' },
  ].filter(Boolean);

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabel = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
  const dayFull  = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };

  // Feature icons for services
  const serviceIcons = [Dumbbell, Zap, Heart, Shield, TrendingUp, Flame, Target, Award];
  const serviceGradients = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#ef4444,#dc2626)',
    'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    'linear-gradient(135deg,#ec4899,#be185d)',
    'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    'linear-gradient(135deg,#06b6d4,#0284c7)',
  ];

  return (
    <div style={S.root}>
      {/* ───────────────── GLOBAL KEYFRAMES ───────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.04); } }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gwPopupSlideIn {
          from { opacity: 0; transform: translateY(32px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        .gw-hero-anim { animation: fadeUp 0.9s ease both; }
        .gw-hero-anim-d1 { animation-delay: 0.1s; }
        .gw-hero-anim-d2 { animation-delay: 0.25s; }
        .gw-hero-anim-d3 { animation-delay: 0.4s; }
        .gw-hero-anim-d4 { animation-delay: 0.6s; }
        .gw-card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important; }
        .gw-plan-hover:hover { transform: scale(1.03); }
        .gw-nav-link-btn:hover { color: #fff !important; background: rgba(255,255,255,0.1) !important; }
        .gw-social-link:hover { background: rgba(99,102,241,0.3) !important; border-color: #6366f1 !important; color: #a5b4fc !important; transform: translateY(-2px); }
        .gw-join-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,0.55) !important; }
        .gw-gallery-item:hover img { transform: scale(1.07); }
        .gw-gallery-item:hover .gw-gallery-overlay { opacity: 1 !important; }
        .gw-review-btn:hover { background: linear-gradient(135deg,#6366f1,#8b5cf6) !important; color: #fff !important; }
        @media (max-width: 768px) {
          .gw-desktop-nav { display: none !important; }
          .gw-burger { display: flex !important; }
          .gw-plans-grid { grid-template-columns: 1fr !important; }
          .gw-trainers-grid { grid-template-columns: 1fr 1fr !important; }
          .gw-services-grid { grid-template-columns: 1fr 1fr !important; }
          .gw-gallery-grid { grid-template-columns: 1fr 1fr !important; }
          .gw-contact-grid { grid-template-columns: 1fr !important; }
          .gw-about-grid { grid-template-columns: 1fr !important; }
          .gw-footer-top { flex-direction: column; align-items: flex-start !important; }
        }
        @media (max-width: 480px) {
          .gw-trainers-grid { grid-template-columns: 1fr !important; }
          .gw-services-grid { grid-template-columns: 1fr !important; }
          .gw-gallery-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ───────────────── NAVBAR ───────────────── */}
      <nav style={{
        ...S.navbar,
        background: scrolled ? 'rgba(10,10,20,0.97)' : 'rgba(10,10,20,0.75)',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
        transition: 'all 0.3s'
      }}>
        <div style={S.navInner}>
          <div style={S.navBrand} onClick={() => scrollTo('hero')}>
            {logo
              ? <img src={logo} alt={gymName} style={S.navLogo} />
              : <div style={S.navLogoFallback}><Dumbbell size={20} color="#fff" /></div>
            }
            <span style={S.navBrandName}>{gymName}</span>
          </div>

          {/* Desktop Links */}
          <div className="gw-desktop-nav" style={S.navLinks}>
            {navLinks.map(l => (
              <button key={l.id} className="gw-nav-link-btn" style={S.navLink} onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
            {isAuthenticated ? (
              <Link to={`/${slug}/portal`} className="gw-join-btn" style={{ ...S.navCta, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Customer Portal <ChevronRight size={16} />
              </Link>
            ) : (
              <>
                <Link to={`/${slug}/login`} className="gw-nav-link-btn" style={{ ...S.navLink, marginRight: 8, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                  Sign In
                </Link>
                <Link to={`/${slug}/signup`} className="gw-join-btn" style={{ ...S.navCta, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Join Now <ChevronRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Burger */}
          <button className="gw-burger" style={S.burger} onClick={() => setMobileMenuOpen(p => !p)}>
            {mobileMenuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div style={S.mobileDrawer}>
            {navLinks.map(l => (
              <button key={l.id} style={S.mobileNavLink} onClick={() => scrollTo(l.id)}>{l.label}</button>
            ))}
            {isAuthenticated ? (
              <Link to={`/${slug}/portal`} style={{ ...S.mobileNavCta, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                Customer Portal
              </Link>
            ) : (
              <>
                <Link to={`/${slug}/login`} style={{ ...S.mobileNavLink, textDecoration: 'none', display: 'block', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Sign In
                </Link>
                <Link to={`/${slug}/signup`} style={{ ...S.mobileNavCta, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                  Join Now
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ───────────────── HERO ───────────────── */}
      <section id="hero" ref={heroRef} style={{ ...S.hero, backgroundImage: `url(${coverImg})` }}>
        <div style={S.heroOverlay} />
        {/* Animated gradient orbs */}
        <div style={S.heroOrb1} />
        <div style={S.heroOrb2} />

        <div style={S.heroContent}>
          {logo && (
            <div className="gw-hero-anim gw-hero-anim-d1">
              <img src={logo} alt={gymName} style={S.heroLogo} />
            </div>
          )}
          <div className="gw-hero-anim gw-hero-anim-d1" style={S.heroBadge}>
            <Zap size={13} /> Premium Fitness Experience
          </div>
          <h1 className="gw-hero-anim gw-hero-anim-d2" style={S.heroTitle}>{gymName}</h1>
          <p className="gw-hero-anim gw-hero-anim-d3" style={S.heroSub}>{description}</p>

          <div className="gw-hero-anim gw-hero-anim-d4" style={S.heroBtns}>
            <Link to={isAuthenticated ? `/${slug}/portal` : `/${slug}/signup`} className="gw-join-btn" style={{ ...S.heroBtn, textDecoration: 'none' }}>
              {isAuthenticated ? "Go to Portal" : "Start Today"} <ChevronRight size={18} />
            </Link>
            <button style={S.heroBtnOutline} onClick={() => scrollTo('contact')}>
              Get in Touch
            </button>
          </div>

          {/* Stats */}
          <div className="gw-hero-anim gw-hero-anim-d4" style={S.heroStats}>
            <div style={S.heroStat}>
              <span style={S.heroStatNum}><Counter target={trainers.length || 10} suffix="+" /></span>
              <span style={S.heroStatLabel}>Expert Trainers</span>
            </div>
            <div style={S.heroStatDivider} />
            <div style={S.heroStat}>
              <span style={S.heroStatNum}><Counter target={plans.length || 3} suffix="+" /></span>
              <span style={S.heroStatLabel}>Membership Plans</span>
            </div>
            <div style={S.heroStatDivider} />
            <div style={S.heroStat}>
              <span style={S.heroStatNum}><Counter target={services.length || 5} suffix="+" /></span>
              <span style={S.heroStatLabel}>Services</span>
            </div>
            <div style={S.heroStatDivider} />
            <div style={S.heroStat}>
              <span style={S.heroStatNum}><Counter target={500} suffix="+" /></span>
              <span style={S.heroStatLabel}>Happy Members</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={S.scrollIndicator} onClick={() => scrollTo('about')}>
          <div style={S.scrollDot} />
        </div>
      </section>

      {/* ───────────────── ABOUT ───────────────── */}
      <section id="about" style={S.section}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={S.sectionTag}><Heart size={14} /> About Us</div>
            <h2 style={S.sectionTitle}>Why Choose <span style={{ color: '#6366f1' }}>{gymName}</span>?</h2>
            <p style={{ ...S.sectionSub, margin: '0 auto' }}>{description}</p>
          </div>

          <div className="gw-about-grid" style={S.aboutGrid}>
            <div className="gw-card-hover" style={S.aboutCard}>
              <div style={{ ...S.aboutCardIcon, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                <Target size={28} color="#fff" />
              </div>
              <h3 style={S.aboutCardTitle}>Our Mission</h3>
              <p style={S.aboutCardText}>{mission || 'Empowering every individual to achieve their fitness goals through expert guidance, state-of-the-art equipment, and a supportive community.'}</p>
            </div>

            <div className="gw-card-hover" style={S.aboutCard}>
              <div style={{ ...S.aboutCardIcon, background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                <Dumbbell size={28} color="#fff" />
              </div>
              <h3 style={S.aboutCardTitle}>Facilities</h3>
              <p style={S.aboutCardText}>{facilities || 'Free weights, Olympic lifting platforms, cardio machines, functional training area, sauna, and dedicated group fitness studios.'}</p>
            </div>

            <div className="gw-card-hover" style={S.aboutCard}>
              <div style={{ ...S.aboutCardIcon, background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                <Award size={28} color="#fff" />
              </div>
              <h3 style={S.aboutCardTitle}>Excellence</h3>
              <p style={S.aboutCardText}>Certified trainers with years of experience, personalised programmes, and a results-focused approach that guarantees your transformation.</p>
            </div>

            <div className="gw-card-hover" style={S.aboutCard}>
              <div style={{ ...S.aboutCardIcon, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                <Users size={28} color="#fff" />
              </div>
              <h3 style={S.aboutCardTitle}>Community</h3>
              <p style={S.aboutCardText}>Join a thriving community of motivated individuals who push each other to be better every single day. Your tribe awaits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── MEMBERSHIP PLANS ───────────────── */}
      {plans.length > 0 && (
        <section id="plans" style={{ ...S.section, background: 'linear-gradient(175deg,#0f0c29 0%,#1e1b4b 50%,#0f0c29 100%)' }}>
          <div style={S.container}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ ...S.sectionTag, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                <CheckCircle size={14} /> Membership Plans
              </div>
              <h2 style={{ ...S.sectionTitle, color: '#fff' }}>Choose Your Plan</h2>
              <p style={{ ...S.sectionSub, color: '#9ca3af', margin: '0 auto' }}>
                Flexible plans to fit every goal and budget
              </p>
            </div>

            <div className="gw-plans-grid" style={S.plansGrid}>
              {plans.map((plan) => (
                <div key={plan._id} className="gw-plan-hover" style={{
                  ...S.planCard,
                  ...(plan.isPopular ? S.planCardPopular : {}),
                  transition: 'all 0.3s'
                }}>
                  {plan.isPopular && (
                    <div style={S.popularBadge}><Star size={12} fill="#fff" color="#fff" /> Most Popular</div>
                  )}
                  <div style={S.planDuration}>{plan.duration}</div>
                  <div style={S.planPrice}>
                    <span style={S.planCurrency}>Rs </span>
                    <span style={S.planAmount}>{plan.price.toLocaleString()}</span>
                  </div>
                  <h3 style={S.planName}>{plan.name}</h3>
                  {plan.description && <p style={S.planDesc}>{plan.description}</p>}
                  <Link
                    to={isAuthenticated ? `/${slug}/portal` : `/${slug}/signup`}
                    style={{ ...S.planBtn, ...(plan.isPopular ? S.planBtnPopular : {}), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {isAuthenticated ? "View Portal" : "Get Started"} <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────── TRAINERS ───────────────── */}
      {trainers.length > 0 && (
        <section id="trainers" style={S.section}>
          <div style={S.container}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={S.sectionTag}><Users size={14} /> Our Team</div>
              <h2 style={S.sectionTitle}>Expert <span style={{ color: '#6366f1' }}>Trainers</span></h2>
              <p style={{ ...S.sectionSub, margin: '0 auto' }}>Certified professionals committed to your fitness journey</p>
            </div>

            <div className="gw-trainers-grid" style={S.trainersGrid}>
              {trainers.map(t => (
                <div key={t._id} className="gw-card-hover" style={S.trainerCard}>
                  <div style={S.trainerImgWrap}>
                    {t.photo
                      ? <img src={t.photo} alt={t.name} style={S.trainerImg} />
                      : (
                        <div style={S.trainerImgFallback}>
                          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )
                    }
                    <div style={S.trainerImgOverlay}>
                      <span style={S.trainerSpecBadge}>{t.specialization}</span>
                    </div>
                  </div>
                  <div style={S.trainerInfo}>
                    <h3 style={S.trainerName}>{t.name}</h3>
                    {t.experience && (
                      <p style={S.trainerExp}><Clock size={13} /> {t.experience} Experience</p>
                    )}
                    {t.bio && <p style={S.trainerBio}>{t.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────── SERVICES ───────────────── */}
      {services.length > 0 && (
        <section id="services" style={{ ...S.section, background: 'linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)' }}>
          <div style={S.container}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={S.sectionTag}><Zap size={14} /> What We Offer</div>
              <h2 style={S.sectionTitle}>Our <span style={{ color: '#6366f1' }}>Services</span></h2>
              <p style={{ ...S.sectionSub, margin: '0 auto' }}>Everything you need to reach your fitness goals</p>
            </div>

            <div className="gw-services-grid" style={S.servicesGrid}>
              {services.map((s, i) => {
                const Icon = serviceIcons[i % serviceIcons.length];
                return (
                  <div key={s._id} className="gw-card-hover" style={S.serviceCard}>
                    <div style={{ ...S.serviceIcon, background: serviceGradients[i % serviceGradients.length] }}>
                      <Icon size={28} color="#fff" />
                    </div>
                    <h3 style={S.serviceTitle}>{s.serviceName}</h3>
                    {s.description && <p style={S.serviceDesc}>{s.description}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────── GALLERY ───────────────── */}
      {gallery.length > 0 && (
        <section id="gallery" style={S.section}>
          <div style={S.container}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={S.sectionTag}><Award size={14} /> Photo Gallery</div>
              <h2 style={S.sectionTitle}>Our Gym <span style={{ color: '#6366f1' }}>in Action</span></h2>
              <p style={{ ...S.sectionSub, margin: '0 auto' }}>A glimpse into our world-class facility</p>
            </div>

            <div className="gw-gallery-grid" style={S.galleryGrid}>
              {gallery.map((img, i) => (
                <div
                  key={img._id}
                  className="gw-gallery-item"
                  style={{
                    ...S.galleryItem,
                    gridColumn: (i === 0 || i === 3) ? 'span 2' : 'span 1',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveGalleryIdx(i)}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.caption || `Gallery ${i + 1}`}
                    style={{ ...S.galleryImg, transition: 'transform 0.5s ease' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60'; }}
                  />
                  <div className="gw-gallery-overlay" style={{ ...S.galleryOverlay, opacity: 0, transition: 'opacity 0.3s' }}>
                    <ExternalLink size={24} color="#fff" />
                    {img.caption && <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', marginTop: 8, textAlign: 'center' }}>{img.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lightbox */}
          {activeGalleryIdx !== null && (
            <div style={S.lightbox} onClick={() => setActiveGalleryIdx(null)}>
              <button style={S.lightboxClose} onClick={() => setActiveGalleryIdx(null)}><X size={28} /></button>
              <img
                src={gallery[activeGalleryIdx]?.imageUrl}
                alt="Gallery"
                style={S.lightboxImg}
                onClick={e => e.stopPropagation()}
              />
              <div style={S.lightboxNav}>
                <button style={S.lightboxNavBtn} onClick={e => { e.stopPropagation(); setActiveGalleryIdx(p => Math.max(0, p - 1)); }}>‹</button>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{activeGalleryIdx + 1} / {gallery.length}</span>
                <button style={S.lightboxNavBtn} onClick={e => { e.stopPropagation(); setActiveGalleryIdx(p => Math.min(gallery.length - 1, p + 1)); }}>›</button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ───────────────── TESTIMONIALS ───────────────── */}
      <section id="testimonials" style={{ ...S.section, background: 'linear-gradient(175deg,#0f0c29 0%,#1e1b4b 50%,#0f0c29 100%)' }}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ ...S.sectionTag, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Star size={14} /> Testimonials
            </div>
            <h2 style={{ ...S.sectionTitle, color: '#fff' }}>What Our Members Say</h2>
            <p style={{ ...S.sectionSub, color: '#9ca3af', margin: '0 auto' }}>Real experiences from real members</p>
          </div>

          {/* Reviews Grid */}
          {(reviewsList.length > 0 ? reviewsList : [
            { _id: '1', customerName: 'Rahul Sharma',   rating: 5, comment: 'Best gym in the area! The trainers are incredibly professional and motivating.' },
            { _id: '2', customerName: 'Priya Thapa',    rating: 5, comment: 'Joined 6 months ago and have lost 10kg. Amazing results with their personalised training!' },
            { _id: '3', customerName: 'Anil Gurung',    rating: 4, comment: 'Great equipment and friendly staff. The monthly plan is very affordable too.' },
            { _id: '4', customerName: 'Sita Adhikari',  rating: 5, comment: 'The atmosphere is fantastic and the coaches genuinely care about your progress. Highly recommend!' },
            { _id: '5', customerName: 'Bikash Rai',     rating: 5, comment: 'Clean facilities, modern equipment, and a great community. Best decision I ever made!' },
            { _id: '6', customerName: 'Sunita Lama',    rating: 4, comment: 'Very well managed gym. The group classes are super energetic and fun.' },
          ]).slice(0, 6).map(r => (
            <div key={r._id} style={{ display: 'none' }} />
          ))}

          <div style={S.reviewsGrid}>
            {(reviewsList.length > 0 ? reviewsList : [
              { _id: '1', customerName: 'Rahul Sharma',   rating: 5, comment: 'Best gym in the area! The trainers are incredibly professional and motivating.' },
              { _id: '2', customerName: 'Priya Thapa',    rating: 5, comment: 'Joined 6 months ago and have lost 10kg. Amazing results with their personalised training!' },
              { _id: '3', customerName: 'Anil Gurung',    rating: 4, comment: 'Great equipment and friendly staff. The monthly plan is very affordable too.' },
              { _id: '4', customerName: 'Sita Adhikari',  rating: 5, comment: 'The atmosphere is fantastic and the coaches genuinely care about your progress. Highly recommend!' },
              { _id: '5', customerName: 'Bikash Rai',     rating: 5, comment: 'Clean facilities, modern equipment, and a great community. Best decision I ever made!' },
              { _id: '6', customerName: 'Sunita Lama',    rating: 4, comment: 'Very well managed gym. The group classes are super energetic and fun.' },
            ]).slice(0, 6).map(r => (
              <div key={r._id} className="gw-card-hover" style={S.reviewCard}>
                <StarRating rating={r.rating} />
                <p style={S.reviewComment}>"{r.comment || 'Great gym experience!'}"</p>
                <div style={S.reviewAuthor}>
                  <div style={S.reviewAvatar}>{r.customerName.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={S.reviewName}>{r.customerName}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>Verified Member</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Review Form */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }}>
            <div style={S.reviewFormWrap}>
              <h3 style={{ color: '#fff', marginBottom: 8, fontSize: '1.4rem', fontWeight: 800 }}>Share Your Experience</h3>
              <p style={{ color: '#9ca3af', marginBottom: 24, fontSize: '0.9rem' }}>Your review helps others find their perfect gym.</p>
              {reviewSuccess ? (
                <div style={S.reviewSuccess}>
                  <CheckCircle size={24} color="#10b981" />
                  <span>Thank you! Your review has been submitted for approval.</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={S.reviewForm}>
                  <input
                    style={S.reviewInput}
                    placeholder="Your Name"
                    value={reviewForm.customerName}
                    onChange={e => setReviewForm(p => ({ ...p, customerName: e.target.value }))}
                    required
                  />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Your Rating</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                          >
                            <Star
                              size={28}
                              fill={n <= reviewForm.rating ? '#f59e0b' : 'none'}
                              color={n <= reviewForm.rating ? '#f59e0b' : '#4b5563'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea
                    style={{ ...S.reviewInput, height: 110, resize: 'vertical' }}
                    placeholder="Share your experience with us…"
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  />
                  <button type="submit" style={S.reviewSubmitBtn} disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Submitting…' : '⭐ Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── CONTACT ───────────────── */}
      <section id="contact" style={S.section}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={S.sectionTag}><MapPin size={14} /> Contact Us</div>
            <h2 style={S.sectionTitle}>Get <span style={{ color: '#6366f1' }}>In Touch</span></h2>
            <p style={{ ...S.sectionSub, margin: '0 auto' }}>Ready to start your fitness journey? Reach out today!</p>
          </div>

          <div className="gw-contact-grid" style={S.contactGrid}>
            <div style={S.contactInfo}>
              {address && (
                <div className="gw-card-hover" style={S.contactItem}>
                  <div style={{ ...S.contactItemIcon, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <MapPin size={22} color="#6366f1" />
                  </div>
                  <div>
                    <p style={S.contactItemLabel}>Address</p>
                    <p style={S.contactItemValue}>{address}</p>
                  </div>
                </div>
              )}
              {phone && (
                <div className="gw-card-hover" style={S.contactItem}>
                  <div style={{ ...S.contactItemIcon, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Phone size={22} color="#10b981" />
                  </div>
                  <div>
                    <p style={S.contactItemLabel}>Phone</p>
                    <a href={`tel:${phone}`} style={{ ...S.contactItemValue, textDecoration: 'none' }}>{phone}</a>
                  </div>
                </div>
              )}
              {email && (
                <div className="gw-card-hover" style={S.contactItem}>
                  <div style={{ ...S.contactItemIcon, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Mail size={22} color="#f59e0b" />
                  </div>
                  <div>
                    <p style={S.contactItemLabel}>Email</p>
                    <a href={`mailto:${email}`} style={{ ...S.contactItemValue, textDecoration: 'none' }}>{email}</a>
                  </div>
                </div>
              )}
              <div className="gw-card-hover" style={S.contactItem}>
                <div style={{ ...S.contactItemIcon, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Clock size={22} color="#8b5cf6" />
                </div>
                <div>
                  <p style={S.contactItemLabel}>Business Hours</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    {dayOrder.some(d => hours[d]) ? (
                      dayOrder.map(d => hours[d] && (
                        <div key={d} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                          <span style={{ fontSize: '0.88rem', color: '#374151', fontWeight: 700, minWidth: 40 }}>{dayLabel[d]}</span>
                          <span style={{ fontSize: '0.88rem', color: hours[d].isOpen ? '#059669' : '#ef4444', fontWeight: 600 }}>
                            {hours[d].isOpen ? `${hours[d].open} – ${hours[d].close}` : 'Closed'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Mon–Fri: 5:00 AM – 10:00 PM</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Join CTA card */}
              <div style={S.contactCtaCard}>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>Ready to Transform?</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Join {gymName} today and start your journey to a healthier, stronger you.
                </p>
                <Link
                  to={isAuthenticated ? `/${slug}/portal` : `/${slug}/signup`}
                  className="gw-join-btn"
                  style={{ ...S.contactCta, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {isAuthenticated ? "Go to Portal" : "Join Now"} <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {mapLink ? (
              <div style={S.mapWrap}>
                <iframe
                  title="Gym Location"
                  src={mapLink}
                  style={{ width: '100%', height: '100%', border: 0, borderRadius: 20 }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            ) : (
              <div style={{ ...S.mapWrap, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', borderRadius: 20 }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <MapPin size={56} />
                  <p style={{ marginTop: 16, fontWeight: 700, fontSize: '1rem', color: '#64748b' }}>Location</p>
                  <p style={{ marginTop: 4, fontWeight: 600, fontSize: '0.88rem' }}>{address || 'Map coming soon'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer style={S.footer}>
        <div style={S.container}>
          <div className="gw-footer-top" style={S.footerTop}>
            <div style={S.footerBrand}>
              {logo
                ? <img src={logo} alt={gymName} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
                : <div style={{ ...S.navLogoFallback, width: 48, height: 48, flexShrink: 0 }}><Dumbbell size={22} color="#fff" /></div>
              }
              <div>
                <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem', marginBottom: 2 }}>{gymName}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Your fitness, our passion.</p>
              </div>
            </div>

            {/* Footer Nav */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Navigate</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {navLinks.slice(0, 4).map(l => (
                    <button key={l.id} onClick={() => scrollTo(l.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left', padding: 0, fontFamily: 'inherit', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = '#9ca3af'}
                    >{l.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Contact</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {phone && <a href={`tel:${phone}`} style={{ color: '#9ca3af', fontSize: '0.9rem', textDecoration: 'none' }}>{phone}</a>}
                  {email && <a href={`mailto:${email}`} style={{ color: '#9ca3af', fontSize: '0.9rem', textDecoration: 'none' }}>{email}</a>}
                  {address && <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{address}</p>}
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <p style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Follow Us</p>
              <div style={S.footerSocial}>
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noreferrer" className="gw-social-link" style={S.socialLink}><Facebook size={20} /></a>
                )}
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noreferrer" className="gw-social-link" style={S.socialLink}><Instagram size={20} /></a>
                )}
                {social.youtube && (
                  <a href={social.youtube} target="_blank" rel="noreferrer" className="gw-social-link" style={S.socialLink}><Youtube size={20} /></a>
                )}
                {social.tiktok && (
                  <a href={social.tiktok} target="_blank" rel="noreferrer" className="gw-social-link" style={{ ...S.socialLink, fontWeight: 800, fontSize: '0.7rem', letterSpacing: 1 }}>TT</a>
                )}
                {!social.facebook && !social.instagram && !social.youtube && !social.tiktok && (
                  <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>Links coming soon</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Hours in Footer */}
          {dayOrder.some(d => hours[d]) && (
            <div style={S.footerHours}>
              <h4 style={S.footerHoursTitle}><Clock size={16} /> Business Hours</h4>
              <div style={S.footerHoursGrid}>
                {dayOrder.map(d => hours[d] && (
                  <div key={d} style={S.footerHourRow}>
                    <span style={{ color: '#d1d5db', fontWeight: 700, textTransform: 'capitalize', minWidth: 44, fontSize: '0.88rem' }}>{dayFull[d]}</span>
                    <span style={{ color: hours[d].isOpen ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                      {hours[d].isOpen ? `${hours[d].open} – ${hours[d].close}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={S.footerBottom}>
            <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>
              © {new Date().getFullYear()} {gymName}. All rights reserved.
            </p>
            <p style={{ color: '#374151', fontSize: '0.8rem' }}>
              Powered by <span style={{ color: '#6366f1', fontWeight: 700 }}>BizNepal SaaS</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Floating "Join Now" CTA ── */}
      <Link
        to={isAuthenticated ? `/${slug}/portal` : `/${slug}/signup`}
        className="gw-join-btn"
        style={{ ...S.floatingCta, textDecoration: 'none' }}
      >
        <Dumbbell size={18} /> {isAuthenticated ? "Go to Portal" : "Join Now"}
      </Link>

      {/* ── Offers Popup ── */}
      {showOfferPopup && offers.length > 0 && (
        <OffersPopup
          offer={offers[0]}
          gymName={gymName}
          onClose={dismissPopup}
          onViewPlans={() => { scrollTo('plans'); dismissPopup(); }}
          codeCopied={codeCopied}
          onCopyCode={copyCode}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  OFFERS POPUP COMPONENT
// ═══════════════════════════════════════════════════════════════
const OffersPopup = ({ offer, gymName, onClose, onViewPlans, codeCopied, onCopyCode }) => {
  const discountLabel = offer.discount?.type === 'percentage'
    ? `${offer.discount.value}% OFF`
    : offer.discount?.type === 'fixed_amount'
      ? `Rs ${offer.discount.value} OFF`
      : offer.discount?.type === 'free_trial'
        ? 'FREE Trial'
        : 'Special Offer';

  const endDate = offer.validity?.endDate
    ? new Date(offer.validity.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div style={SP.overlay}>
      <div style={SP.popup} className="gw-offer-popup">
        {/* Close button */}
        <button style={SP.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        {/* Glowing orb */}
        <div style={SP.orb} />

        {/* Badge */}
        <div style={SP.badge}>
          <Zap size={12} /> Limited Time Offer
        </div>

        {/* Discount highlight */}
        <div style={SP.discountRing}>
          <span style={SP.discountNum}>{discountLabel}</span>
        </div>

        {/* Title */}
        <h3 style={SP.title}>{offer.name}</h3>
        {offer.description && (
          <p style={SP.desc}>{offer.description}</p>
        )}

        {/* Promo code */}
        {offer.code && (
          <div style={SP.codeWrap}>
            <span style={SP.codeLabel}>Use Code</span>
            <div style={SP.codeRow}>
              <code style={SP.code}>{offer.code}</code>
              <button
                style={{ ...SP.copyBtn, ...(codeCopied ? SP.copyBtnDone : {}) }}
                onClick={() => onCopyCode(offer.code)}
              >
                {codeCopied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>
        )}

        {/* Validity */}
        {endDate && (
          <div style={SP.validity}>
            <Clock size={13} /> Expires {endDate}
          </div>
        )}

        {/* CTA buttons */}
        <div style={SP.ctaRow}>
          <button style={SP.ctaBtn} onClick={onViewPlans}>
            View Plans <ArrowRight size={15} />
          </button>
          <button style={SP.dismissBtn} onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════
const SP = {
  overlay: {
    position: 'fixed', bottom: 100, right: 28, zIndex: 9998,
    animation: 'gwPopupSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both'
  },
  popup: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(145deg, rgba(15,12,41,0.98) 0%, rgba(30,27,75,0.98) 100%)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(99,102,241,0.35)',
    borderRadius: 24,
    padding: '32px 28px 24px',
    width: 320,
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.08)'
  },
  orb: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14,
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#9ca3af',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', lineHeight: 1
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)',
    color: '#fbbf24', borderRadius: 99, padding: '4px 12px',
    fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: 16
  },
  discountRing: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 110, height: 110, borderRadius: '50%', margin: '0 auto 16px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))',
    border: '3px solid rgba(99,102,241,0.5)',
    boxShadow: '0 0 32px rgba(99,102,241,0.35), inset 0 0 20px rgba(99,102,241,0.1)'
  },
  discountNum: {
    color: '#fff', fontSize: '1.5rem', fontWeight: 900, textAlign: 'center', lineHeight: 1.1
  },
  title: {
    color: '#fff', fontSize: '1.1rem', fontWeight: 800,
    textAlign: 'center', marginBottom: 6, lineHeight: 1.3
  },
  desc: {
    color: '#9ca3af', fontSize: '0.82rem', lineHeight: 1.6,
    textAlign: 'center', marginBottom: 16
  },
  codeWrap: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '12px 14px', marginBottom: 12
  },
  codeLabel: {
    display: 'block', color: '#6b7280', fontSize: '0.7rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6
  },
  codeRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  code: {
    color: '#a5b4fc', fontSize: '1.05rem', fontWeight: 900,
    letterSpacing: '0.12em', fontFamily: 'monospace'
  },
  copyBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc', borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
    fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s'
  },
  copyBtnDone: {
    background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399'
  },
  validity: {
    display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center',
    color: '#6b7280', fontSize: '0.77rem', fontWeight: 600, marginBottom: 16
  },
  ctaRow: { display: 'flex', flexDirection: 'column', gap: 8 },
  ctaBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 6px 20px rgba(99,102,241,0.4)', transition: 'all 0.2s'
  },
  dismissBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.1)',
    color: '#6b7280', fontWeight: 600, fontSize: '0.82rem',
    padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s'
  }
};

const S = {
  root: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: '#fff',
    color: '#111827',
    overflowX: 'hidden'
  },

  // Loading & 404
  loadingWrap: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0f0c29,#1e1b4b)'
  },
  spinner: {
    width: 52, height: 52,
    border: '4px solid rgba(99,102,241,0.2)',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%', animation: 'spin 0.9s linear infinite'
  },
  notFoundPage: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', padding: 24
  },
  notFoundCard: {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24, padding: 48, textAlign: 'center', maxWidth: 440
  },
  notFoundIcon: {
    width: 96, height: 96, borderRadius: '50%',
    background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px'
  },
  notFoundTitle: { color: '#fff', fontSize: '2rem', fontWeight: 900, marginBottom: 12 },
  notFoundSub: { color: '#d1d5db', fontSize: '1rem', marginBottom: 8 },
  notFoundMeta: { color: '#6b7280', fontSize: '0.9rem', marginBottom: 32 },
  notFoundBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 28px', background: '#6366f1', color: '#fff',
    borderRadius: 12, fontWeight: 700, textDecoration: 'none'
  },

  // Navbar
  navbar: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    backdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  },
  navInner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 24px',
    height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  navBrand: {
    display: 'flex', alignItems: 'center', gap: 12,
    cursor: 'pointer'
  },
  navLogo: { width: 42, height: 42, borderRadius: 10, objectFit: 'cover' },
  navLogoFallback: {
    width: 42, height: 42, borderRadius: 10,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  navBrandName: { color: '#fff', fontWeight: 800, fontSize: '1.1rem' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: {
    background: 'none', border: 'none', color: '#9ca3af',
    fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer',
    padding: '8px 14px', borderRadius: 8,
    transition: 'all 0.2s', fontFamily: 'inherit'
  },
  navCta: {
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none', color: '#fff', fontWeight: 700,
    fontSize: '0.92rem', cursor: 'pointer',
    padding: '9px 22px', borderRadius: 10,
    transition: 'all 0.2s', fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
  },
  burger: {
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'none', padding: 4
  },
  mobileDrawer: {
    background: 'rgba(10,10,20,0.98)', padding: '16px 24px 28px',
    display: 'flex', flexDirection: 'column', gap: 4,
    borderTop: '1px solid rgba(255,255,255,0.06)'
  },
  mobileNavLink: {
    background: 'none', border: 'none', color: '#d1d5db',
    fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
    padding: '14px 0', textAlign: 'left', fontFamily: 'inherit',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  },
  mobileNavCta: {
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff', fontWeight: 700,
    fontSize: '1rem', padding: '14px 20px', borderRadius: 12, marginTop: 12,
    fontFamily: 'inherit'
  },

  // Hero
  hero: {
    position: 'relative', minHeight: '100vh',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    paddingTop: 72, overflow: 'hidden'
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(10,10,20,0.7) 0%, rgba(10,10,20,0.5) 40%, rgba(10,10,20,0.88) 100%)'
  },
  heroOrb1: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
    top: '-10%', left: '-5%', pointerEvents: 'none'
  },
  heroOrb2: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
    bottom: '10%', right: '5%', pointerEvents: 'none'
  },
  heroContent: {
    position: 'relative', zIndex: 1, textAlign: 'center',
    maxWidth: 860, padding: '0 24px'
  },
  heroLogo: {
    width: 100, height: 100, borderRadius: 24, objectFit: 'cover',
    margin: '0 auto 28px', display: 'block',
    boxShadow: '0 8px 40px rgba(99,102,241,0.5)',
    border: '3px solid rgba(255,255,255,0.15)'
  },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc', borderRadius: 99, padding: '7px 18px',
    fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', marginBottom: 24
  },
  heroTitle: {
    fontSize: 'clamp(2.8rem, 7vw, 5rem)',
    fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: 20,
    letterSpacing: '-0.03em',
    textShadow: '0 4px 32px rgba(0,0,0,0.5)'
  },
  heroSub: {
    fontSize: '1.15rem', color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.75, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px'
  },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 },
  heroBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none', color: '#fff', fontWeight: 800,
    fontSize: '1.05rem', cursor: 'pointer',
    padding: '16px 40px', borderRadius: 14,
    boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
    fontFamily: 'inherit', transition: 'all 0.3s'
  },
  heroBtnOutline: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.08)',
    border: '2px solid rgba(255,255,255,0.25)',
    backdropFilter: 'blur(10px)',
    color: '#fff', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer',
    padding: '16px 40px', borderRadius: 14,
    fontFamily: 'inherit', transition: 'all 0.3s'
  },
  heroStats: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 32, flexWrap: 'wrap',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20, padding: '24px 40px',
    maxWidth: 700, margin: '0 auto'
  },
  heroStat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroStatNum: { color: '#fff', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 },
  heroStatLabel: { color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' },
  heroStatDivider: { width: 1, height: 44, background: 'rgba(255,255,255,0.15)' },

  // Scroll indicator
  scrollIndicator: {
    position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1
  },
  scrollDot: {
    width: 26, height: 44, borderRadius: 13,
    border: '2px solid rgba(255,255,255,0.3)',
    position: 'relative',
    '&::after': {
      content: '""', position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
      width: 5, height: 5, borderRadius: '50%', background: '#fff',
      animation: 'scrollBounce 1.4s ease infinite'
    }
  },

  // Sections
  section: { padding: '100px 24px' },
  container: { maxWidth: 1200, margin: '0 auto' },
  sectionTag: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(99,102,241,0.08)', color: '#6366f1',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 99, padding: '6px 16px', fontSize: '0.8rem',
    fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', fontWeight: 900,
    color: '#0f172a', lineHeight: 1.15, marginBottom: 16
  },
  sectionSub: {
    fontSize: '1.05rem', color: '#6b7280', lineHeight: 1.75,
    maxWidth: 600, marginBottom: 0
  },

  // About
  aboutGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 28
  },
  aboutCard: {
    background: '#fff', borderRadius: 24,
    padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9', transition: 'transform 0.3s, box-shadow 0.3s'
  },
  aboutCardIcon: {
    width: 64, height: 64, borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
  },
  aboutCardTitle: { fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 },
  aboutCardText: { color: '#64748b', lineHeight: 1.75, fontSize: '0.93rem' },

  // Plans
  plansGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 28, alignItems: 'start'
  },
  planCard: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 28, padding: 40, textAlign: 'center', position: 'relative',
    backdropFilter: 'blur(10px)', transition: 'all 0.3s'
  },
  planCardPopular: {
    background: 'rgba(99,102,241,0.12)', border: '2px solid #6366f1',
    boxShadow: '0 0 48px rgba(99,102,241,0.25)'
  },
  popularBadge: {
    position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
    borderRadius: 99, padding: '6px 18px', fontSize: '0.78rem', fontWeight: 800,
    display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
  },
  planDuration: {
    background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
    borderRadius: 8, padding: '5px 14px', fontSize: '0.8rem',
    fontWeight: 700, display: 'inline-block', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.06em'
  },
  planPrice: { marginBottom: 8 },
  planCurrency: { color: '#9ca3af', fontSize: '1.2rem', fontWeight: 600, verticalAlign: 'middle' },
  planAmount: { color: '#fff', fontSize: '3.2rem', fontWeight: 900, lineHeight: 1, verticalAlign: 'middle' },
  planName: { color: '#e5e7eb', fontSize: '1.1rem', fontWeight: 800, marginBottom: 12 },
  planDesc: { color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 32 },
  planBtn: {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
    padding: '13px 28px', borderRadius: 14, fontFamily: 'inherit', transition: 'all 0.2s',
    width: '100%', justifyContent: 'center'
  },
  planBtnPopular: {
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none', boxShadow: '0 6px 20px rgba(99,102,241,0.4)'
  },

  // Trainers
  trainersGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: 28
  },
  trainerCard: {
    background: '#fff', borderRadius: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    border: '1px solid #f1f5f9', overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  trainerImgWrap: { height: 240, overflow: 'hidden', position: 'relative' },
  trainerImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' },
  trainerImgFallback: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  trainerImgOverlay: {
    position: 'absolute', bottom: 12, left: 12
  },
  trainerSpecBadge: {
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    color: '#fff', borderRadius: 8, padding: '5px 12px',
    fontSize: '0.78rem', fontWeight: 700
  },
  trainerInfo: { padding: '22px 24px' },
  trainerName: { fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 },
  trainerExp: {
    display: 'flex', alignItems: 'center', gap: 6,
    color: '#6b7280', fontSize: '0.85rem', marginBottom: 10
  },
  trainerBio: { color: '#64748b', fontSize: '0.87rem', lineHeight: 1.65 },

  // Services
  servicesGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: 24
  },
  serviceCard: {
    background: '#fff', borderRadius: 22, padding: 32, textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  serviceIcon: {
    width: 68, height: 68, borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px', boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
  },
  serviceTitle: { fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 },
  serviceDesc: { color: '#6b7280', fontSize: '0.87rem', lineHeight: 1.65 },

  // Gallery
  galleryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, gridAutoRows: '220px'
  },
  galleryItem: { position: 'relative', overflow: 'hidden', borderRadius: 18 },
  galleryImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  galleryOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(99,102,241,0.6)', backdropFilter: 'blur(2px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
  },

  // Lightbox
  lightbox: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 24
  },
  lightboxClose: {
    position: 'absolute', top: 24, right: 24,
    background: 'rgba(255,255,255,0.1)', border: 'none',
    borderRadius: 12, padding: 10, cursor: 'pointer', color: '#fff'
  },
  lightboxImg: {
    maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain',
    borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
  },
  lightboxNav: {
    display: 'flex', alignItems: 'center', gap: 24, marginTop: 20
  },
  lightboxNavBtn: {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', fontSize: '1.8rem', fontWeight: 900, width: 48, height: 48,
    borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit'
  },

  // Reviews
  reviewsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 24
  },
  reviewCard: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 22, padding: 30, backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  reviewComment: { color: '#d1d5db', fontSize: '0.93rem', lineHeight: 1.75, margin: '16px 0 20px', fontStyle: 'italic' },
  reviewAuthor: { display: 'flex', alignItems: 'center', gap: 14 },
  reviewAvatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0
  },
  reviewName: { color: '#e5e7eb', fontWeight: 700, fontSize: '0.93rem', marginBottom: 2 },
  reviewFormWrap: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 28, padding: 40, maxWidth: 560, width: '100%'
  },
  reviewForm: { display: 'flex', flexDirection: 'column', gap: 16 },
  reviewInput: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, padding: '13px 18px', color: '#fff',
    fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box'
  },
  reviewSubmitBtn: {
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none', color: '#fff', fontWeight: 700,
    fontSize: '1rem', cursor: 'pointer',
    padding: '14px 28px', borderRadius: 12, fontFamily: 'inherit',
    boxShadow: '0 6px 20px rgba(99,102,241,0.4)'
  },
  reviewSuccess: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 14, padding: '18px 22px', color: '#10b981', fontWeight: 700
  },

  // Contact
  contactGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 48, alignItems: 'start'
  },
  contactInfo: { display: 'flex', flexDirection: 'column', gap: 20 },
  contactItem: {
    display: 'flex', alignItems: 'flex-start', gap: 18,
    padding: '20px 24px', background: '#fff',
    borderRadius: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s'
  },
  contactItemIcon: {
    width: 52, height: 52, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  contactItemLabel: { color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  contactItemValue: { color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' },
  contactCtaCard: {
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    borderRadius: 20, padding: '28px 32px',
    boxShadow: '0 8px 32px rgba(99,102,241,0.35)'
  },
  contactCta: {
    background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff', fontWeight: 700, padding: '12px 28px', borderRadius: 12, fontFamily: 'inherit',
    backdropFilter: 'blur(10px)', transition: 'all 0.2s'
  },
  mapWrap: { height: 480, borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' },

  // Footer
  footer: { background: '#080815', padding: '72px 24px 36px' },
  footerTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    flexWrap: 'wrap', gap: 40, marginBottom: 56,
    paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.07)'
  },
  footerBrand: { display: 'flex', alignItems: 'center', gap: 16 },
  footerSocial: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  socialLink: {
    width: 46, height: 46, borderRadius: 13,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#9ca3af', textDecoration: 'none', transition: 'all 0.2s',
    fontSize: '0.75rem', fontWeight: 900
  },
  footerHours: { marginBottom: 48 },
  footerHoursTitle: {
    color: '#e5e7eb', fontWeight: 700, fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20
  },
  footerHoursGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px 32px'
  },
  footerHourRow: { display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' },
  footerBottom: {
    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
    paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)'
  },

  // Floating CTA
  floatingCta: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 99,
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff', fontWeight: 800, fontSize: '0.93rem',
    padding: '14px 24px', borderRadius: 50,
    boxShadow: '0 8px 32px rgba(99,102,241,0.55)',
    textDecoration: 'none', transition: 'all 0.3s',
    border: '2px solid rgba(255,255,255,0.2)'
  }
};

export default GymWebsite;
