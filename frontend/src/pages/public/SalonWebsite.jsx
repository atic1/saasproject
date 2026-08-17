import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE from '../../config/api.js';
import {
  Phone, Mail, MapPin, Clock, Star, ChevronRight,
  Sparkles, Scissors, Heart, Award, ArrowRight,
  ExternalLink, Users, Eye
} from 'lucide-react';
import SpecialOfferPopup from '../../components/offers/SpecialOfferPopup';

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

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: '3px' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={15} fill={n <= rating ? '#fbbf24' : 'none'} color={n <= rating ? '#fbbf24' : '#6b7280'} />
    ))}
  </div>
);

const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 35;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
};

export default function SalonWebsite({ data, slug }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const [reviewForm, setReviewForm] = useState({ customerName: '', rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewsList, setReviewsList] = useState(data?.reviews || []);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(null);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  useEffect(() => {
    if (data?.offers && data.offers.length > 0) {
      const timer = setTimeout(() => setShowOfferPopup(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const { business = {}, gymWebsite: gw = {}, plans = [], trainers = [], services = [], gallery = [], offers = [] } = data || {};

  const salonName   = business?.name || 'Beauty & Salon';
  const coverImg    = gw.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&auto=format&fit=crop&q=80';
  const logo        = gw.logo;
  const description = gw.description || business?.branding?.description || 'Your premier sanctuary for high-fashion hair styling, luxury spa treatments, aesthetic skincare, and executive pampering.';
  const phone       = gw.phone || business?.contact?.phone || '';
  const email       = gw.email || business?.contact?.email || '';
  const address     = gw.address || business?.contact?.address || '';
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
    } catch { /* silent */ }
    finally { setReviewSubmitting(false); }
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabel = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

  const serviceCategories = ['all', ...new Set(services.map(s => s.category || 'Beauty Services'))];
  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(s => (s.category || 'Beauty Services') === activeCategory);

  return (
    <div className="salon-theme-root">
      {/* ── STYLES ────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap');
        
        .salon-theme-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #0b0712;
          color: #f3f4f6;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .salon-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }

        .salon-glow-1 {
          position: absolute; top: -10%; left: 15%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(236,72,153,0.18) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none; filter: blur(80px);
        }
        .salon-glow-2 {
          position: absolute; top: 40%; right: -5%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(244,114,182,0.12) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none; filter: blur(90px);
        }

        .salon-glass-card {
          background: rgba(22, 14, 34, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(244, 114, 182, 0.15);
          border-radius: 24px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .salon-glass-card:hover {
          border-color: rgba(244, 114, 182, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -15px rgba(236, 72, 153, 0.25);
        }

        .salon-btn-primary {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%);
          color: #ffffff;
          font-weight: 700;
          border-radius: 9999px;
          padding: 14px 28px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px -5px rgba(236, 72, 153, 0.4);
          transition: all 0.3s ease;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        .salon-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px -5px rgba(236, 72, 153, 0.6);
        }

        .salon-btn-outline {
          background: rgba(255, 255, 255, 0.05);
          color: #f472b6;
          border: 1px solid rgba(244, 114, 182, 0.3);
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
        .salon-btn-outline:hover {
          background: rgba(244, 114, 182, 0.15);
          border-color: rgba(244, 114, 182, 0.6);
          color: #ffffff;
        }

        .salon-pill-tag {
          background: rgba(236, 72, 153, 0.12);
          border: 1px solid rgba(236, 72, 153, 0.3);
          color: #f472b6;
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

        .salon-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .salon-nav-link {
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.92rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .salon-nav-link:hover {
          color: #f472b6;
        }

        @media (max-width: 768px) {
          .salon-desktop-nav { display: none !important; }
          .salon-hero-title { font-size: 2.4rem !important; }
        }
      `}</style>

      {/* ── NAVBAR ────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(11, 7, 18, 0.92)' : 'rgba(11, 7, 18, 0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(244, 114, 182, 0.15)' : '1px solid transparent',
        transition: 'all 0.3s'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {logo ? (
              <img src={logo} alt={salonName} style={{ height: 44, width: 44, borderRadius: 14, objectFit: 'cover', border: '1px solid rgba(244,114,182,0.3)' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#ec4899,#be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(236,72,153,0.4)' }}>
                <Scissors size={22} color="#fff" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="salon-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{salonName}</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Beauty & Spa Sanctuary</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="salon-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <button className="salon-nav-link" onClick={() => scrollTo('services')}>Services</button>
            {offers.length > 0 && <button className="salon-nav-link" onClick={() => scrollTo('offers')}>Offers</button>}
            {trainers.length > 0 && <button className="salon-nav-link" onClick={() => scrollTo('stylists')}>Stylists</button>}
            {plans.length > 0 && <button className="salon-nav-link" onClick={() => scrollTo('packages')}>Packages</button>}
            {gallery.length > 0 && <button className="salon-nav-link" onClick={() => scrollTo('gallery')}>Gallery</button>}
            <button className="salon-nav-link" onClick={() => scrollTo('reviews')}>Reviews</button>
            <button className="salon-nav-link" onClick={() => scrollTo('contact')}>Contact</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAuthenticated ? (
              <Link to={`/${slug}/portal`} className="salon-btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
                Customer Portal <ChevronRight size={16} />
              </Link>
            ) : (
              <>
                <Link to={`/${slug}/login`} className="salon-nav-link" style={{ textDecoration: 'none', marginRight: 8 }}>
                  Sign In
                </Link>
                <Link to={`/${slug}/signup`} className="salon-btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
                  Book Appointment <Sparkles size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ──────────────────────────────────── */}
      <section style={{ position: 'relative', paddingTop: 160, paddingBottom: 100, minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
        <div className="salon-glow-1" />
        <div className="salon-glow-2" />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div className="salon-pill-tag" style={{ marginBottom: 20 }}>
              <Sparkles size={14} /> Luxury Beauty & Pampering Sanctuary
            </div>
            
            <h1 className="salon-serif salon-hero-title" style={{ fontSize: '3.6rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.12, marginBottom: 24 }}>
              Elegance Reimagined. <br />
              <span style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Radiance Unlocked.
              </span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#9ca3af', lineHeight: 1.7, marginBottom: 36, maxWidth: 560 }}>
              {description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
              <Link to={`/${slug}/signup`} className="salon-btn-primary">
                Book Treatment Online <ArrowRight size={18} />
              </Link>
              <button onClick={() => scrollTo('services')} className="salon-btn-outline">
                Explore Services Menu <Eye size={18} />
              </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: 36, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 28 }}>
              <div>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f472b6', margin: 0 }}>
                  <Counter target={services.length || 25} suffix="+" />
                </p>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>Beauty Services</p>
              </div>
              <div>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>
                  <Counter target={trainers.length || 8} suffix="+" />
                </p>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>Master Stylists</p>
              </div>
              <div>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', margin: 0 }}>4.9★</p>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>Client Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Banner Image Card */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 32, overflow: 'hidden', border: '2px solid rgba(244,114,182,0.25)', boxShadow: '0 30px 80px rgba(236,72,153,0.3)', aspectRatio: '4/5' }}>
              <img src={coverImg} alt={salonName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(11,7,18,0.9) 100%)' }} />
            </div>

            <div className="salon-glass-card" style={{ position: 'absolute', bottom: -20, left: -20, padding: 20, maxWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
                  <Scissors size={22} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, color: '#fff' }}>100% Satisfaction</p>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>Customized Hair & Skin Care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ──────────────────────────────── */}
      <section id="services" style={{ padding: '100px 0', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="salon-pill-tag" style={{ marginBottom: 14 }}>
              <Scissors size={14} /> Curated Treatments
            </div>
            <h2 className="salon-serif" style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Signature Beauty <span style={{ color: '#f472b6' }}>Services</span>
            </h2>
            <p style={{ color: '#9ca3af', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
              Experience state-of-the-art styling, organic skincare facials, precision cuts, and relaxing spa therapy.
            </p>
          </div>

          {serviceCategories.length > 2 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
              {serviceCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 20px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize',
                    background: activeCategory === cat ? 'linear-gradient(135deg,#ec4899,#be185d)' : 'rgba(255,255,255,0.05)',
                    color: activeCategory === cat ? '#ffffff' : '#9ca3af',
                    boxShadow: activeCategory === cat ? '0 8px 20px rgba(236,72,153,0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="salon-grid-3">
            {filteredServices.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', gridColumn: '1/-1', padding: 40 }}>No services listed in this category.</p>
            ) : filteredServices.map(svc => (
              <div key={svc._id} className="salon-glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
                      <Scissors size={24} />
                    </div>
                    {svc.price && (
                      <span style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '6px 14px', borderRadius: 9999, fontWeight: 800, fontSize: '0.9rem' }}>
                        NPR {svc.price}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                    {svc.serviceName || svc.name}
                  </h3>

                  {svc.description && (
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
                      {svc.description}
                    </p>
                  )}

                  {svc.duration && (
                    <p style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> Duration: {svc.duration} Mins
                    </p>
                  )}
                </div>

                <Link
                  to={`/${slug}/signup?service=${svc._id}`}
                  className="salon-btn-outline"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  <span>Book This Service</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIAL OFFERS SECTION ─────────────────────────── */}
      {offers.length > 0 && (
        <section id="offers" style={{ padding: '100px 0', background: 'rgba(18, 11, 28, 0.6)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="salon-pill-tag" style={{ marginBottom: 14 }}>
                <Sparkles size={14} /> Exclusive Deals
              </div>
              <h2 className="salon-serif" style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                Special <span style={{ color: '#f472b6' }}>Offers</span> & Promos
              </h2>
              <p style={{ color: '#9ca3af', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
                Grab our limited-time deals and save big on your next visit.
              </p>
            </div>

            <div className="salon-grid-3">
              {offers.map(offer => {
                const discountLabel = offer.discount?.type === 'percentage'
                  ? `${offer.discount.value}% OFF`
                  : offer.discount?.type === 'fixed_amount'
                  ? `NPR ${offer.discount.value} OFF`
                  : 'Special Deal';
                const endDate = offer.validity?.endDate
                  ? new Date(offer.validity.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : null;
                return (
                  <div key={offer._id} className="salon-glass-card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
                    {/* Glow accent */}
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    {offer.display?.bannerImage && (
                      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, height: 140 }}>
                        <img src={offer.display.bannerImage} alt={offer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    {/* Discount badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg,#ec4899,#be185d)', color: '#fff', padding: '6px 16px', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 800, marginBottom: 16, boxShadow: '0 6px 20px rgba(236,72,153,0.4)' }}>
                      🏷️ {discountLabel}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>{offer.name}</h3>

                    {offer.description && (
                      <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>{offer.description}</p>
                    )}

                    {offer.code && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(236,72,153,0.1)', border: '1px dashed rgba(236,72,153,0.4)', borderRadius: 12, padding: '10px 16px', marginBottom: 12 }}>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 600 }}>Use Code:</span>
                        <code style={{ color: '#f472b6', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>{offer.code}</code>
                      </div>
                    )}

                    {endDate && (
                      <p style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} /> Valid until <strong style={{ color: '#fbbf24' }}>{endDate}</strong>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── STYLISTS & EXPERTS SECTION ────────────────────── */}
      {trainers.length > 0 && (
        <section id="stylists" style={{ padding: '80px 0', background: 'rgba(18, 11, 28, 0.6)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="salon-pill-tag" style={{ marginBottom: 14 }}>
                <Users size={14} /> Beauty Specialists
              </div>
              <h2 className="salon-serif" style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                Meet Our Master <span style={{ color: '#f472b6' }}>Stylists</span>
              </h2>
              <p style={{ color: '#9ca3af', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
                Artisans dedicated to enhancing your natural grace and confidence.
              </p>
            </div>

            <div className="salon-grid-3">
              {trainers.map(t => (
                <div key={t._id} className="salon-glass-card" style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto 20px', overflow: 'hidden', border: '3px solid rgba(244,114,182,0.4)', boxShadow: '0 10px 30px rgba(236,72,153,0.3)' }}>
                    <img
                      src={t.photo || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&auto=format&fit=crop&q=60'}
                      alt={t.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&auto=format&fit=crop&q=60'; }}
                    />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>{t.name}</h3>
                  <p style={{ color: '#f472b6', fontWeight: 700, fontSize: '0.85rem', marginBottom: 12 }}>{t.specialization}</p>
                  
                  {t.experience && (
                    <p style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, marginBottom: 8 }}>
                      ✨ {t.experience} Experience
                    </p>
                  )}

                  {t.bio && (
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      "{t.bio}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PACKAGES & MEMBERSHIPS ────────────────────────── */}
      {plans.length > 0 && (
        <section id="packages" style={{ padding: '100px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="salon-pill-tag" style={{ marginBottom: 14 }}>
                <Award size={14} /> VIP Pampering
              </div>
              <h2 className="salon-serif" style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                Service <span style={{ color: '#f472b6' }}>Packages</span>
              </h2>
              <p style={{ color: '#9ca3af', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
                All-inclusive beauty passes and seasonal spa bundles tailored for you.
              </p>
            </div>

            <div className="salon-grid-3">
              {plans.map(p => (
                <div key={p._id} className="salon-glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: p.isPopular ? '2px solid #ec4899' : undefined }}>
                  <div>
                    {p.isPopular && (
                      <span style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)', color: '#fff', padding: '4px 14px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block', marginBottom: 16 }}>
                        Most Popular Package
                      </span>
                    )}

                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f472b6' }}>NPR {p.price}</span>
                      <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>/ {p.duration}</span>
                    </div>

                    {p.description && <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: 20 }}>{p.description}</p>}
                  </div>

                  <Link to={`/${slug}/signup`} className="salon-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}>
                    Claim Package Pass
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ───────────────────────────────────────── */}
      {gallery.length > 0 && (
        <section id="gallery" style={{ padding: '80px 0', background: 'rgba(18, 11, 28, 0.6)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="salon-serif" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
                Lookbook & <span style={{ color: '#f472b6' }}>Transformations</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {gallery.map((img, i) => (
                <div
                  key={img._id}
                  onClick={() => setActiveGalleryIdx(i)}
                  style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 240, cursor: 'pointer', border: '1px solid rgba(244,114,182,0.2)' }}
                >
                  <img src={img.imageUrl} alt={img.caption || 'Salon Work'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,7,18,0.4)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <ExternalLink size={24} color="#fff" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS SECTION ───────────────────────────────── */}
      <section id="reviews" style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="salon-pill-tag" style={{ marginBottom: 14 }}>
              <Heart size={14} /> Client Love
            </div>
            <h2 className="salon-serif" style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              What Our Clients <span style={{ color: '#f472b6' }}>Say</span>
            </h2>
          </div>

          <div className="salon-grid-3" style={{ marginBottom: 60 }}>
            {(reviewsList.length > 0 ? reviewsList : [
              { _id: '1', customerName: 'Aarya Sharma', rating: 5, comment: 'Hands down the best haircut and balayage experience in Kathmandu! Highly skilled stylists.' },
              { _id: '2', customerName: 'Sneha Shrestha', rating: 5, comment: 'The hydra-facial left my skin glowing for days. Truly relaxing ambiance and top hygiene.' },
              { _id: '3', customerName: 'Pooja Thapa', rating: 5, comment: 'Booked their bridal package. Everyone complimented my makeup and hairstyle. 10/10!' }
            ]).slice(0, 6).map(r => (
              <div key={r._id} className="salon-glass-card" style={{ padding: 24 }}>
                <StarRating rating={r.rating} />
                <p style={{ color: '#f3f4f6', fontSize: '0.92rem', lineHeight: 1.6, margin: '16px 0' }}>
                  "{r.comment}"
                </p>
                <p style={{ fontWeight: 800, color: '#f472b6', fontSize: '0.9rem', margin: 0 }}>
                  — {r.customerName}
                </p>
              </div>
            ))}
          </div>

          {/* Add Review Form */}
          <div className="salon-glass-card" style={{ maxWidth: 600, margin: '0 auto', padding: 36 }}>
            <h3 className="salon-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
              Leave a Review
            </h3>

            {reviewSuccess ? (
              <div style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: 16, borderRadius: 16, textAlign: 'center', fontWeight: 700 }}>
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
                  style={{ width: '100%', padding: '12px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244,114,182,0.2)', color: '#fff', outline: 'none' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.88rem', color: '#9ca3af', fontWeight: 700 }}>Rating:</span>
                  <select
                    value={reviewForm.rating}
                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    style={{ padding: '8px 14px', borderRadius: 10, background: '#160e22', border: '1px solid rgba(244,114,182,0.3)', color: '#fbbf24', fontWeight: 800 }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Share your experience at our salon..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  style={{ width: '100%', padding: '12px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244,114,182,0.2)', color: '#fff', outline: 'none' }}
                />

                <button type="submit" disabled={reviewSubmitting} className="salon-btn-primary" style={{ justifyContent: 'center' }}>
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER & HOURS ────────────────────────────────── */}
      <footer id="contact" style={{ background: '#07040c', borderTop: '1px solid rgba(244,114,182,0.15)', paddingTop: 80, paddingBottom: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 40, marginBottom: 60 }}>
          
          <div>
            <h3 className="salon-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>{salonName}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>{description}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" style={{ color: '#f472b6' }}><Facebook /></a>}
              {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" style={{ color: '#f472b6' }}><Instagram /></a>}
              {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" style={{ color: '#f472b6' }}><Youtube /></a>}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Contact & Location</h4>
            {address && <p style={{ color: '#9ca3af', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><MapPin size={16} color="#ec4899" /> {address}</p>}
            {phone && <p style={{ color: '#9ca3af', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><Phone size={16} color="#ec4899" /> {phone}</p>}
            {email && <p style={{ color: '#9ca3af', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={16} color="#ec4899" /> {email}</p>}
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Opening Hours</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: '#9ca3af' }}>
              {dayOrder.map(day => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', textTransform: 'capitalize' }}>
                  <span>{dayLabel[day]}</span>
                  <span>{hours[day]?.closed ? 'Closed' : `${hours[day]?.open || '09:00'} - ${hours[day]?.close || '19:00'}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.82rem', color: '#6b7280' }}>
          © {new Date().getFullYear()} {salonName}. All rights reserved. Powered by BizNepal.
        </div>
      </footer>

      {/* ── Advanced Animated Special Offer Modal & Reopen Badge ── */}
      {offers.length > 0 && (
        <SpecialOfferPopup
          offers={offers}
          businessName={salonName}
          businessType="salon"
          slug={slug}
          isOpen={showOfferPopup}
          onClose={() => setShowOfferPopup(false)}
        />
      )}
    </div>
  );
}
