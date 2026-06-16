import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, Phone, Mail, MapPin, Globe, Loader2, ArrowRight, Check,
  AlertCircle, CheckCircle, User, LogOut, Shield, Calendar, Edit2, Info,
  Play, X, UserCheck, ShieldCheck, CreditCard, Clock, Star
} from 'lucide-react';

export default function PublicGymWebsite() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, login, logout, isAuthenticated, setAuthenticatedUser } = useAuth();

  // Page States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Purchase State
  const [purchaseLoadingId, setPurchaseLoadingId] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  // Fetch Public Site Details
  const fetchSiteData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/portal/business/${slug}/public-site`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Gym website not found');
        throw new Error('Failed to load website content');
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
    fetchSiteData();
  }, [slug]);

  // Sync profile details if logged in
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        const identifier = authForm.phone || authForm.email;
        if (!identifier) throw new Error('Please enter your phone or email');
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

  // Membership purchase workflow
  const handlePurchase = async (planId) => {
    if (!isAuthenticated) {
      setAuthMode('register');
      setAuthError('');
      setShowAuthModal(true);
      return;
    }

    setPurchaseLoadingId(planId);
    setPurchaseMessage('');
    try {
      const token = localStorage.getItem('saas_token');
      // 1. Purchase Membership (generates invoice)
      const purchaseRes = await fetch('http://localhost:5000/api/portal/membership/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId: data.business._id,
          planId
        })
      });
      const purchaseJson = await purchaseRes.json();
      if (!purchaseRes.ok) throw new Error(purchaseJson.message || 'Failed to initiate purchase');

      // 2. Initiate Payment (using mock provider)
      const payRes = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invoiceId: purchaseJson.invoice._id,
          method: 'mock'
        })
      });
      const payJson = await payRes.json();
      if (!payRes.ok) throw new Error(payJson.message || 'Failed to initiate checkout');

      // Redirect to mock callback endpoint
      if (payJson.checkout && payJson.checkout.url) {
        window.location.href = payJson.checkout.url;
      } else {
        throw new Error('Payment gateway redirection failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setPurchaseLoadingId(null);
    }
  };

  // Profile Update Handler
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    setProfileError('');
    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch('http://localhost:5000/api/portal/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update profile');

      setAuthenticatedUser(result.user, token);
      setProfileMessage('Your profile details updated successfully!');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-wrapper">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p>Connecting to {slug} website...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="error-screen">
        <div className="error-card glass">
          <AlertCircle size={48} className="text-red" />
          <h1>Website Unavailable</h1>
          <p>{error || 'The requested gym page could not be loaded.'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">Back to Homepage</button>
        </div>
      </div>
    );
  }

  const { business, plans, offers, trainers } = data;
  const primaryColor = business.branding?.primaryColor || '#3B82F6';

  // Fallbacks
  const heroImage = business.branding?.heroBanner || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80';
  const logoImage = business.branding?.logo;
  const aboutText = business.branding?.about || 'Welcome to our premium training club. We specialize in athletic conditioning, strength training, and lifestyle upgrades. Join us and shape your ideal self.';
  const phoneVal = business.contact?.phone || '9800000000';
  const emailVal = business.contact?.email || `contact@${slug}.com`;
  const addressVal = business.contact?.address || 'Street Avenue';
  const cityVal = business.contact?.city || 'Kathmandu';

  return (
    <div className="gym-landing-page">
      {/* ── WEBSITE HEADER NAVBAR ─────────────────────────────────────────── */}
      <header className="gym-navbar glass">
        <div className="nav-container">
          <div className="logo-section">
            {logoImage ? (
              <img src={logoImage} alt={business.name} className="gym-logo-img" />
            ) : (
              <div className="gym-logo-placeholder" style={{ backgroundColor: primaryColor }}>
                🏋️
              </div>
            )}
            <span className="gym-nav-name">{business.name}</span>
          </div>

          <nav className="desktop-menu">
            <a href="#about">About</a>
            {plans.length > 0 && <a href="#plans">Memberships</a>}
            {offers.length > 0 && <a href="#offers">Offers</a>}
            {trainers.length > 0 && <a href="#trainers">Trainers</a>}
            {business.branding?.gallery?.length > 0 && <a href="#gallery">Gallery</a>}
            <a href="#contact">Contact</a>
          </nav>

          <div className="auth-btn-row">
            {isAuthenticated ? (
              <div className="authenticated-user-row">
                <button onClick={() => setShowProfileModal(true)} className="btn btn-secondary user-profile-btn">
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button onClick={logout} className="btn-logout-icon" title="Log Out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthMode('login'); setAuthError(''); setShowAuthModal(true); }} className="btn btn-primary" style={{ backgroundColor: primaryColor }}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO BANNER SECTION ──────────────────────────────────────────── */}
      <section className="hero-banner" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url(${heroImage})` }}>
        <div className="hero-content">
          <div className="hero-tag" style={{ borderLeftColor: primaryColor }}>
            <Sparkles size={14} style={{ color: primaryColor }} />
            <span>Premium Athletic Club</span>
          </div>
          <h1>Unleash Your Ultimate Physical Potential</h1>
          <p>{business.branding?.tagline || 'Experience state-of-the-art facilities, certified trainers, and personalized training plans tailored exclusively for your goals.'}</p>
          <div className="hero-ctas">
            <a href="#plans" className="btn btn-primary hero-btn" style={{ backgroundColor: primaryColor }}>
              Browse Plans <ArrowRight size={16} />
            </a>
            <a href="#about" className="btn btn-secondary hero-btn">Explore Club</a>
          </div>
        </div>
      </section>

      {/* ── ABOUT THE GYM SECTION ────────────────────────────────────────── */}
      <section id="about" className="about-section container">
        <div className="about-grid">
          <div className="about-info">
            <h2 className="section-title">Who We Are</h2>
            <div className="divider" style={{ backgroundColor: primaryColor }}></div>
            <p className="about-desc">{aboutText}</p>
            <div className="about-metrics">
              <div className="metric">
                <span className="metric-num">24/7</span>
                <span className="metric-lbl">Access Mode</span>
              </div>
              <div className="metric">
                <span className="metric-num">100%</span>
                <span className="metric-lbl">Certified Staff</span>
              </div>
              <div className="metric">
                <span className="metric-num">BS</span>
                <span className="metric-lbl">Local Calendar</span>
              </div>
            </div>
          </div>
          <div className="about-visual">
            <div className="visual-card glass">
              <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80" alt="Gym Motivation" />
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFERS & PROMOTIONS SECTION ───────────────────────────────────── */}
      {offers.length > 0 && (
        <section id="offers" className="offers-section">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="section-title text-center">Exclusive Offers & Promotions</h2>
              <div className="divider mx-auto" style={{ backgroundColor: primaryColor }}></div>
              <p className="section-subtitle">Take advantage of our current limited-time packages and promo rates.</p>
            </div>

            <div className="offers-grid">
              {offers.map(offer => (
                <div key={offer._id} className="offer-card glass border-glow">
                  {offer.display?.bannerImage && (
                    <div className="offer-img-wrapper">
                      <img src={offer.display.bannerImage} alt={offer.name} />
                      <span className="offer-badge" style={{ backgroundColor: primaryColor }}>Promo Offer</span>
                    </div>
                  )}
                  <div className="offer-details">
                    <h3>{offer.name}</h3>
                    <p className="offer-desc">{offer.description}</p>
                    <div className="offer-discount-row">
                      <span className="discount-tag">
                        {offer.discount?.type === 'percentage' ? `${offer.discount.value}% OFF` : `NPR ${offer.discount?.value} OFF`}
                      </span>
                      {offer.code && (
                        <span className="code-tag">Use Code: <strong>{offer.code}</strong></span>
                      )}
                    </div>
                    <div className="offer-validity">
                      <Clock size={12} />
                      <span>Ends {new Date(offer.validity?.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MEMBERSHIP PLANS SECTION ───────────────────────────────────────── */}
      {plans.length > 0 && (
        <section id="plans" className="plans-section container">
          <div className="text-center mb-12">
            <h2 className="section-title text-center">Flexible Membership Plans</h2>
            <div className="divider mx-auto" style={{ backgroundColor: primaryColor }}></div>
            <p className="section-subtitle">Select the membership tier that fits your training routine and unlock premium facilities.</p>
          </div>

          <div className="plans-grid">
            {plans.map(plan => {
              const durationLabel = `${plan.duration?.value} ${plan.duration?.unit}(s)`;
              return (
                <div key={plan._id} className={`plan-card glass ${plan.display?.isHighlighted ? 'highlighted border-glow' : ''}`}>
                  {plan.display?.isHighlighted && (
                    <div className="plan-badge-top" style={{ backgroundColor: primaryColor }}>Popular Choice</div>
                  )}
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price-row">
                    <span className="price">NPR {plan.pricing?.basePrice}</span>
                    <span className="duration">/ {durationLabel}</span>
                  </div>
                  <div className="plan-features-list">
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.map((feat, idx) => (
                        <div key={idx} className="feat-item">
                          <Check size={14} className="feat-check" style={{ color: primaryColor }} />
                          <span>{feat.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="feat-item">
                        <Check size={14} className="feat-check" style={{ color: primaryColor }} />
                        <span>All gym floor equipment access</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handlePurchase(plan._id)}
                    disabled={purchaseLoadingId === plan._id}
                    className="btn btn-primary plan-btn"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {purchaseLoadingId === plan._id ? (
                      <Loader2 size={16} className="animate-spin mx-auto" />
                    ) : (
                      'Purchase Membership'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── TRAINERS SECTION ──────────────────────────────────────────────── */}
      {trainers.length > 0 && (
        <section id="trainers" className="trainers-section">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="section-title text-center">Our Elite Coaching Staff</h2>
              <div className="divider mx-auto" style={{ backgroundColor: primaryColor }}></div>
              <p className="section-subtitle">Train with champion bodybuilders and fitness practitioners certified globally.</p>
            </div>

            <div className="trainers-grid">
              {trainers.map(trainer => (
                <div key={trainer._id} className="trainer-card glass">
                  <div className="trainer-photo-wrapper">
                    {trainer.photo ? (
                      <img src={trainer.photo} alt={trainer.name} />
                    ) : (
                      <div className="trainer-photo-fallback">🏋️‍♂️</div>
                    )}
                  </div>
                  <div className="trainer-info">
                    <h4>{trainer.name}</h4>
                    <span className="trainer-specialty" style={{ color: primaryColor }}>{trainer.specialization}</span>
                    <p className="trainer-exp">{trainer.experience} Experience</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PHOTO GALLERY SECTION ─────────────────────────────────────────── */}
      {business.branding?.gallery && business.branding.gallery.length > 0 && (
        <section id="gallery" className="gallery-section container">
          <div className="text-center mb-12">
            <h2 className="section-title text-center">Look Inside Our Club</h2>
            <div className="divider mx-auto" style={{ backgroundColor: primaryColor }}></div>
            <p className="section-subtitle">Visual highlight of our cardio floor, weight sections, and group classrooms.</p>
          </div>

          <div className="gallery-grid">
            {business.branding.gallery.map((img, idx) => (
              <div key={idx} className="gallery-item glass">
                <img src={img} alt={`Gallery ${idx + 1}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTACT & MAP SECTION ─────────────────────────────────────────── */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-details-col">
              <h2>Contact Info & Location</h2>
              <div className="divider" style={{ backgroundColor: primaryColor }}></div>
              <p className="contact-intro">Have questions about packages or facilities? Drop by or contact us directly.</p>

              <div className="contact-list">
                <div className="contact-item">
                  <Phone size={18} style={{ color: primaryColor }} />
                  <div>
                    <h4>Call Us</h4>
                    <p>{phoneVal}</p>
                  </div>
                </div>

                <div className="contact-item">
                  <Mail size={18} style={{ color: primaryColor }} />
                  <div>
                    <h4>Email Address</h4>
                    <p>{emailVal}</p>
                  </div>
                </div>

                <div className="contact-item">
                  <MapPin size={18} style={{ color: primaryColor }} />
                  <div>
                    <h4>Detailed Location</h4>
                    <p className="capitalize">{addressVal}, {cityVal}</p>
                  </div>
                </div>
              </div>

              {/* Social Media links */}
              {business.contact?.socialLinks && (
                <div className="social-links-row">
                  {business.contact.socialLinks.facebook && (
                    <a href={business.contact.socialLinks.facebook} target="_blank" rel="noreferrer" className="social-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                  )}
                  {business.contact.socialLinks.instagram && (
                    <a href={business.contact.socialLinks.instagram} target="_blank" rel="noreferrer" className="social-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                  )}
                  {business.contact.socialLinks.tiktok && (
                    <a href={business.contact.socialLinks.tiktok} target="_blank" rel="noreferrer" className="social-btn">
                      <Play size={20} style={{ transform: 'rotate(90deg)' }} />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="contact-map-col glass">
              {business.contact?.mapLink ? (
                <iframe
                  title="Gym Google Maps location"
                  src={business.contact.mapLink}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '350px', borderRadius: '16px' }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              ) : (
                <div className="no-map-placeholder">
                  <MapPin size={40} style={{ color: primaryColor }} />
                  <p>Google Map view is not configured for this branch.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="gym-footer text-center">
        <p>© 2026 {business.name}. Built on Gym SaaS Portal. All Rights Reserved.</p>
      </footer>

      {/* ── AUTH MODAL (LOGIN/REGISTER) ──────────────────────────────────── */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content glass auth-modal-content">
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'Welcome Back 👋' : 'Create Customer Account 🏋️'}</h3>
              <button onClick={() => setShowAuthModal(false)} className="close-btn"><X size={18} /></button>
            </div>

            <div className="auth-tab-headers">
              <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} style={{ borderBottomColor: authMode === 'login' ? primaryColor : 'transparent', color: authMode === 'login' ? primaryColor : 'inherit' }}>Sign In</button>
              <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} style={{ borderBottomColor: authMode === 'register' ? primaryColor : 'transparent', color: authMode === 'register' ? primaryColor : 'inherit' }}>Sign Up</button>
            </div>

            {authError && (
              <div className="auth-error-msg">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="modal-form">
              {authMode === 'register' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" required value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="98XXXXXXXX" required value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email (Optional)</label>
                <input type="email" placeholder="you@email.com" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="At least 8 characters" required value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
              </div>

              <button type="submit" disabled={authLoading} className="btn btn-primary w-full py-3 mt-2" style={{ backgroundColor: primaryColor }}>
                {authLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOMER PROFILE & MEMBERSHIP MANAGEMENT MODAL ─────────────────── */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content glass profile-modal-content">
            <div className="modal-header">
              <h3>Customer Dashboard</h3>
              <button onClick={() => setShowProfileModal(false)} className="close-btn"><X size={18} /></button>
            </div>

            <div className="profile-tabs-content">
              {/* Profile Details Form */}
              <div className="profile-form-section">
                <h4>Personal Details</h4>
                {profileMessage && (
                  <div className="profile-success-msg">
                    <CheckCircle size={16} /> <span>{profileMessage}</span>
                  </div>
                )}
                {profileError && (
                  <div className="auth-error-msg">
                    <AlertCircle size={16} /> <span>{profileError}</span>
                  </div>
                )}
                <form onSubmit={handleProfileSave} className="modal-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number (10 digits starting 98)</label>
                    <input type="tel" required value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                  <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ backgroundColor: primaryColor }}>
                    {profileLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Update Details'}
                  </button>
                </form>
              </div>

              {/* Membership Status Details */}
              <div className="profile-membership-section">
                <h4>Active Membership</h4>
                <div className="membership-status-card glass">
                  <UserCheck size={28} style={{ color: primaryColor, marginBottom: '8px' }} />
                  <h5>System Status Register</h5>
                  <p className="membership-subtext">Verified membership package details synced with gym cloud registers.</p>
                  
                  <div className="membership-attributes">
                    <div className="attr-row">
                      <span>Status:</span>
                      <span className="badge active">Active / Synced</span>
                    </div>
                    <div className="attr-row">
                      <span>Account Class:</span>
                      <span className="capitalize" style={{ fontWeight: 'bold' }}>{user?.platformrole || 'Customer'}</span>
                    </div>
                    <div className="attr-row">
                      <span>Verification ID:</span>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{user?.id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EMBEDDED DYNAMIC AESTHETIC CSS ───────────────────────────────── */}
      <style>{`
        /* General Layout styling */
        .gym-landing-page {
          background-color: #0b0f19;
          color: #f3f4f6;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        .container {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 0;
        }

        .text-center { text-align: center; }
        .mb-12 { margin-bottom: 48px; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .w-full { width: 100%; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .mt-2 { margin-top: 8px; }
        .capitalize { text-transform: capitalize; }

        /* Typography & Visual Accents */
        .section-title {
          font-size: 2.25rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.025em;
          margin-bottom: 12px;
        }
        .section-subtitle {
          font-size: 1.05rem;
          color: #9ca3af;
          max-width: 600px;
          margin: 0 auto;
        }
        .divider {
          width: 60px;
          height: 4px;
          border-radius: 2px;
          margin-bottom: 24px;
        }

        /* Buttons styling */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 10px 22px;
          border-radius: 99px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          outline: none;
        }
        .btn-primary {
          color: #ffffff;
          box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.25);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .btn-secondary {
          background-color: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }
        .btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        /* Navbar Header styling */
        .gym-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 100;
          background: rgba(11, 15, 25, 0.75);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
        }
        .nav-container {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .gym-logo-img {
          width: 42px;
          height: 42px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .gym-logo-placeholder {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: var(--shadow-md);
        }
        .gym-nav-name {
          font-size: 1.25rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.03em;
        }
        .desktop-menu {
          display: flex;
          gap: 28px;
        }
        .desktop-menu a {
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        .desktop-menu a:hover {
          color: #ffffff;
        }
        .auth-btn-row {
          display: flex;
          align-items: center;
        }
        .authenticated-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-logout-icon {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout-icon:hover {
          background: #ef4444;
          color: #ffffff;
        }

        /* Hero section styling */
        .hero-banner {
          height: 85vh;
          min-height: 600px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          text-align: left;
          padding-top: 80px;
        }
        .hero-content {
          width: 90%;
          max-width: 750px;
          margin: 0 auto;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: rgba(255, 255, 255, 0.06);
          border-left: 3px solid;
          padding: 6px 14px;
          border-radius: 0 99px 99px 0;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .hero-content p {
          font-size: 1.15rem;
          color: #d1d5db;
          line-height: 1.6;
          margin-bottom: 36px;
        }
        .hero-ctas {
          display: flex;
          gap: 16px;
        }
        .hero-btn {
          padding: 14px 30px;
          font-size: 1rem;
        }

        /* About section styling */
        .about-section {
          padding-top: 100px;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .about-desc {
          font-size: 1.1rem;
          color: #d1d5db;
          line-height: 1.7;
          margin-bottom: 32px;
        }
        .about-metrics {
          display: flex;
          gap: 40px;
        }
        .metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .metric-num {
          font-size: 2.25rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
        }
        .metric-lbl {
          font-size: 0.8rem;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .about-visual {
          display: flex;
          justify-content: center;
        }
        .visual-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          max-width: 420px;
          box-shadow: var(--shadow-xl);
          transform: rotate(2deg);
          transition: transform 0.3s;
        }
        .visual-card:hover {
          transform: rotate(0deg) scale(1.02);
        }
        .visual-card img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Offers Section styling */
        .offers-section {
          background-color: #0e1424;
          padding: 100px 0;
        }
        .offers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 32px;
        }
        .offer-card {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          transition: transform 0.2s;
        }
        .offer-card:hover {
          transform: translateY(-6px);
        }
        .offer-img-wrapper {
          height: 160px;
          position: relative;
          overflow: hidden;
        }
        .offer-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .offer-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 99px;
          color: #ffffff;
          box-shadow: var(--shadow-md);
        }
        .offer-details {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .offer-details h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
        }
        .offer-desc {
          font-size: 0.92rem;
          color: #9ca3af;
          line-height: 1.5;
        }
        .offer-discount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .discount-tag {
          font-size: 1.1rem;
          font-weight: 900;
          color: #10b981;
        }
        .code-tag {
          font-size: 0.8rem;
          color: #d1d5db;
        }
        .code-tag strong {
          color: #ffffff;
          font-family: monospace;
          background: rgba(255,255,255,0.08);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .offer-validity {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #9ca3af;
        }

        /* Plans Section styling */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 32px;
          align-items: start;
        }
        .plan-card {
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s;
        }
        .plan-card.highlighted {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .plan-card:hover {
          transform: translateY(-4px);
        }
        .plan-badge-top {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 14px;
          border-radius: 99px;
          color: #ffffff;
        }
        .plan-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .plan-price-row {
          margin-bottom: 28px;
          display: flex;
          align-items: baseline;
        }
        .plan-price-row .price {
          font-size: 2.25rem;
          font-weight: 900;
          color: #ffffff;
        }
        .plan-price-row .duration {
          font-size: 0.95rem;
          color: #9ca3af;
          margin-left: 6px;
        }
        .plan-features-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 36px;
          flex: 1;
        }
        .feat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.92rem;
          color: #d1d5db;
        }
        .feat-check {
          flex-shrink: 0;
        }
        .plan-btn {
          width: 100%;
          padding: 12px;
          border-radius: 99px;
          font-size: 0.95rem;
        }

        /* Trainers section styling */
        .trainers-section {
          background-color: #0e1424;
          padding: 100px 0;
        }
        .trainers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 32px;
        }
        .trainer-card {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          text-align: center;
          transition: transform 0.2s;
        }
        .trainer-card:hover {
          transform: translateY(-4px);
        }
        .trainer-photo-wrapper {
          height: 250px;
          overflow: hidden;
          background-color: rgba(255,255,255,0.02);
        }
        .trainer-photo-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .trainer-card:hover .trainer-photo-wrapper img {
          transform: scale(1.05);
        }
        .trainer-photo-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #4b5563;
        }
        .trainer-info {
          padding: 20px;
        }
        .trainer-info h4 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .trainer-specialty {
          font-size: 0.85rem;
          font-weight: 700;
          display: block;
          margin-bottom: 8px;
        }
        .trainer-exp {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        /* Gallery section styling */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .gallery-item {
          height: 200px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s;
        }
        .gallery-item:hover img {
          transform: scale(1.05);
        }

        /* Contact section styling */
        .contact-section {
          padding: 100px 0;
          background-color: #0b0f19;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }
        .contact-details-col h2 {
          font-size: 2rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .contact-intro {
          font-size: 1.05rem;
          color: #9ca3af;
          margin-bottom: 36px;
        }
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 36px;
        }
        .contact-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          text-align: left;
        }
        .contact-item h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .contact-item p {
          font-size: 0.9rem;
          color: #9ca3af;
        }
        .social-links-row {
          display: flex;
          gap: 12px;
        }
        .social-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .social-btn:hover {
          background: #ffffff;
          color: #0b0f19;
          transform: translateY(-2px);
        }
        .contact-map-col {
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          min-height: 350px;
          height: 100%;
        }
        .no-map-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          color: #9ca3af;
        }

        /* Footer styling */
        .gym-footer {
          padding: 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background-color: #090d16;
          color: #4b5563;
          font-size: 0.85rem;
        }

        /* Modals and forms custom styles */
        .auth-modal-content {
          max-width: 440px !important;
        }
        .auth-tab-headers {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 12px;
        }
        .auth-tab {
          flex: 1;
          padding: 12px;
          background: none;
          border: none;
          font-weight: 700;
          font-size: 0.95rem;
          color: #9ca3af;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .auth-error-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #f87171;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          text-align: left;
        }
        .profile-modal-content {
          max-width: 780px !important;
        }
        .profile-tabs-content {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 32px;
        }
        .profile-form-section h4, 
        .profile-membership-section h4 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .profile-success-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          text-align: left;
          margin-bottom: 12px;
        }
        .membership-status-card {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 24px;
          text-align: center;
        }
        .membership-status-card h5 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .membership-subtext {
          font-size: 0.78rem;
          color: #9ca3af;
          margin-bottom: 16px;
        }
        .membership-attributes {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 16px;
        }
        .attr-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .attr-row span:first-child {
          color: #9ca3af;
        }
        .attr-row span:last-child {
          color: #ffffff;
        }

        /* Screen state templates */
        .loading-screen, .error-screen {
          min-height: 100vh;
          background-color: #0b0f19;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }
        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .spinner-wrapper p {
          color: #9ca3af;
          font-size: 0.95rem;
        }
        .error-card {
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .error-card h1 {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .error-card p {
          color: #9ca3af;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        /* Responsive Layout constraints */
        @media (max-width: 900px) {
          .about-grid, .contact-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .profile-tabs-content {
            grid-template-columns: 1fr;
          }
          .hero-content h1 {
            font-size: 2.5rem;
          }
          .desktop-menu {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
