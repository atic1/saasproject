import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, X, Gift, Clock, Copy, CheckCircle,
  ArrowRight, ChevronLeft, ChevronRight, Tag, Zap, Percent
} from 'lucide-react';

export default function SpecialOfferPopup({
  offers = [],
  businessName = 'Our Business',
  businessType = 'gym',
  slug = '',
  onClose,
  isOpen = true
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reopenTrigger, setReopenTrigger] = useState(false);
  const [minimized, setMinimized] = useState(!isOpen);

  useEffect(() => {
    setMinimized(!isOpen);
  }, [isOpen]);

  if (!offers || offers.length === 0) return null;

  const currentOffer = offers[currentIndex] || offers[0];

  const discountLabel = currentOffer.discount?.type === 'percentage'
    ? `${currentOffer.discount.value}% OFF`
    : currentOffer.discount?.type === 'fixed_amount'
    ? `Rs ${currentOffer.discount.value} OFF`
    : currentOffer.discount?.type === 'free_trial'
    ? 'FREE TRIAL'
    : 'SPECIAL DEAL';

  const endDate = currentOffer.validity?.endDate
    ? new Date(currentOffer.validity.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const nextOffer = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
    setCopied(false);
  };

  const prevOffer = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    setCopied(false);
  };

  const isSalon = businessType === 'salon';
  const isClinic = businessType === 'clinic';
  const primaryColor = isClinic ? '#0ea5e9' : isSalon ? '#ec4899' : '#6366f1';
  const secondaryColor = isClinic ? '#38bdf8' : isSalon ? '#f472b6' : '#8b5cf6';
  const accentGlow = isClinic ? 'rgba(14,165,233,0.35)' : isSalon ? 'rgba(236,72,153,0.35)' : 'rgba(99,102,241,0.35)';
  const bgGradient = isClinic
    ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)'
    : isSalon
    ? 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)'
    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)';

  // If dismissed by user, show a floating pulsating button in bottom-right to reopen anytime
  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9990,
          cursor: 'pointer',
          animation: 'bounceGentle 2.5s infinite ease-in-out'
        }}
      >
        <style>{`
          @keyframes bounceGentle {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-8px) scale(1.05); }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px ${accentGlow}; }
            50% { box-shadow: 0 0 35px ${isClinic ? 'rgba(14,165,233,0.7)' : isSalon ? 'rgba(236,72,153,0.7)' : 'rgba(99,102,241,0.7)'}; }
          }
        `}</style>
        <div
          style={{
            background: bgGradient,
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 800,
            fontSize: '0.88rem',
            letterSpacing: '0.02em',
            boxShadow: `0 10px 30px ${accentGlow}`,
            animation: 'pulseGlow 2s infinite',
            border: '2px solid rgba(255,255,255,0.25)'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🎁</span>
          <span>View Promo Offer ({offers.length})</span>
          <span
            style={{
              background: 'rgba(255,255,255,0.25)',
              padding: '2px 8px',
              borderRadius: 9999,
              fontSize: '0.75rem'
            }}
          >
            {discountLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(5, 3, 10, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'backdropFadeIn 0.3s ease forwards'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setMinimized(true);
          onClose?.();
        }
      }}
    >
      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalZoomIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmerBorder {
          0% { border-color: rgba(236,72,153,0.3); }
          50% { border-color: rgba(251,191,36,0.6); }
          100% { border-color: rgba(236,72,153,0.3); }
        }
        @keyframes floatTag {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes rotateGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Main Modal Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(160deg, #161026 0%, #0d0918 60%, #170d1e 100%)',
          borderRadius: '28px',
          border: `1.5px solid ${isClinic ? 'rgba(56,189,248,0.35)' : isSalon ? 'rgba(244,114,182,0.35)' : 'rgba(129,140,248,0.35)'}`,
          boxShadow: `0 25px 70px -10px ${accentGlow}, 0 0 50px rgba(0,0,0,0.8)`,
          overflow: 'hidden',
          animation: 'modalZoomIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background Ambience */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${isClinic ? 'rgba(45,212,191,0.15)' : isSalon ? 'rgba(251,191,36,0.15)' : 'rgba(56,189,248,0.15)'} 0%, transparent 70%)`,
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />

        {/* Close Button */}
        <button
          onClick={() => {
            setMinimized(true);
            onClose?.();
          }}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#d1d5db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#d1d5db';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={18} />
        </button>

        {/* Top Banner / Image Header */}
        {currentOffer.display?.bannerImage ? (
          <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
            <img
              src={currentOffer.display.bannerImage}
              alt={currentOffer.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(22,16,38,0.2) 0%, #161026 100%)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 20,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Sparkles size={13} color={isClinic ? '#38bdf8' : isSalon ? '#f472b6' : '#818cf8'} />
              <span>Special Offer</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '28px 28px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: isClinic ? 'rgba(14,165,233,0.15)' : isSalon ? 'rgba(236,72,153,0.15)' : 'rgba(99,102,241,0.15)',
                border: `1px solid ${isClinic ? 'rgba(56,189,248,0.35)' : isSalon ? 'rgba(236,72,153,0.35)' : 'rgba(99,102,241,0.35)'}`,
                padding: '6px 14px',
                borderRadius: 9999,
                color: isClinic ? '#38bdf8' : isSalon ? '#f472b6' : '#a5b4fc',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                animation: 'floatTag 2.5s infinite ease-in-out'
              }}
            >
              <Sparkles size={14} />
              <span>Exclusive Promotion</span>
            </div>

            {offers.length > 1 && (
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
                Offer {currentIndex + 1} of {offers.length}
              </span>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px 28px 28px' }}>
          {/* Big Discount Hero Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 8,
                background: isClinic
                  ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)'
                  : isSalon
                  ? 'linear-gradient(135deg, #ec4899 0%, #db2777 60%, #be185d 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #3730a3 100%)',
                color: '#ffffff',
                padding: '8px 20px',
                borderRadius: '16px',
                boxShadow: `0 8px 25px ${accentGlow}`,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Tag size={16} style={{ alignSelf: 'center' }} />
              <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                {discountLabel}
              </span>
            </div>

            {endDate && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  color: '#fbbf24',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                <Clock size={14} />
                <span>Ends {endDate}</span>
              </div>
            )}
          </div>

          {/* Offer Title & Description */}
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: 10,
              letterSpacing: '-0.02em'
            }}
          >
            {currentOffer.name}
          </h2>

          <p
            style={{
              fontSize: '0.98rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: 22
            }}
          >
            {currentOffer.description || 'Take advantage of this limited-time promotional deal today.'}
          </p>

          {/* Promo Code Box */}
          {currentOffer.code ? (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1.5px dashed ${isClinic ? 'rgba(56,189,248,0.45)' : isSalon ? 'rgba(244,114,182,0.45)' : 'rgba(129,140,248,0.45)'}`,
                borderRadius: '18px',
                padding: '14px 18px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 2
                  }}
                >
                  Promo Coupon Code
                </span>
                <code
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color: isClinic ? '#38bdf8' : isSalon ? '#f472b6' : '#a5b4fc',
                    letterSpacing: '0.08em',
                    fontFamily: 'monospace'
                  }}
                >
                  {currentOffer.code}
                </code>
              </div>

              <button
                onClick={() => handleCopy(currentOffer.code)}
                style={{
                  background: copied
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : isClinic
                    ? 'rgba(14,165,233,0.2)'
                    : isSalon
                    ? 'rgba(236,72,153,0.2)'
                    : 'rgba(99,102,241,0.2)',
                  border: `1px solid ${
                    copied
                      ? '#10b981'
                      : isClinic
                      ? 'rgba(56,189,248,0.4)'
                      : isSalon
                      ? 'rgba(236,72,153,0.4)'
                      : 'rgba(99,102,241,0.4)'
                  }`,
                  color: copied ? '#ffffff' : isClinic ? '#38bdf8' : isSalon ? '#f472b6' : '#a5b4fc',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: copied ? '0 4px 15px rgba(16,185,129,0.4)' : 'none'
                }}
              >
                {copied ? (
                  <>
                    <CheckCircle size={15} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '14px',
                padding: '10px 16px',
                marginBottom: 22,
                color: '#34d399',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Zap size={16} />
              <span>Discount is auto-applied at checkout for all eligible bookings!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              to={`/${slug}/signup?promo=${encodeURIComponent(currentOffer.code || '')}`}
              onClick={() => {
                setMinimized(true);
                onClose?.();
              }}
              style={{
                flex: 1,
                padding: '14px 24px',
                borderRadius: '16px',
                background: isClinic
                  ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)'
                  : isSalon
                  ? 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: `0 12px 30px ${accentGlow}`,
                transition: 'all 0.25s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 16px 40px ${accentGlow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 12px 30px ${accentGlow}`;
              }}
            >
              <span>Claim Offer & Get Started</span>
              <ArrowRight size={17} />
            </Link>

            <button
              onClick={() => {
                setMinimized(true);
                onClose?.();
              }}
              style={{
                padding: '14px 20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#9ca3af',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Maybe Later
            </button>
          </div>

          {/* Navigation Controls if multiple offers */}
          {offers.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <button
                onClick={prevOffer}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                <ChevronLeft size={16} /> Previous Promo
              </button>

              <div style={{ display: 'flex', gap: 6 }}>
                {offers.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setCopied(false);
                    }}
                    style={{
                      width: idx === currentIndex ? 24 : 8,
                      height: 8,
                      borderRadius: 9999,
                      background:
                        idx === currentIndex
                          ? isSalon
                            ? '#ec4899'
                            : '#6366f1'
                          : 'rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>

              <button
                onClick={nextOffer}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isSalon ? '#f472b6' : '#a5b4fc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                Next Promo <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
