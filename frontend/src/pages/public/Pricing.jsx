import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, HelpCircle } from 'lucide-react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const plans = [
    {
      name: "Starter Plan",
      desc: "Perfect for new local salons or micro boutique fitness studios getting off the ground.",
      price: { monthly: 2900, yearly: 2320 }, // NPR per month
      features: [
        "1 Location / Branch limit",
        "Up to 2 Stylists / Trainers limit",
        "Unified Calendar & Booking Books",
        "Email Client Notifications",
        "Standard Billing & Checkout receipts",
        "BizNepal standard support"
      ],
      ctaText: "Start Starter Trial",
      planKey: "starter",
      isPopular: false
    },
    {
      name: "Growth Plan",
      desc: "Ideal for growing clinics, busy gyms, and established beauty centers seeking automation.",
      price: { monthly: 6900, yearly: 5520 },
      features: [
        "Up to 3 Locations / Branches",
        "Up to 10 Staff / Roster records",
        "SMS Appointment Reminders",
        "Package Builder & Credit Bundles",
        "Interactive Financial Reports",
        "Priority Email & Chat Support"
      ],
      ctaText: "Start Growth Trial",
      planKey: "growth",
      isPopular: true
    },
    {
      name: "Pro Enterprise",
      desc: "Engineered for high-volume multi-location franchises, medical hubs, and premium gym chains.",
      price: { monthly: 14900, yearly: 11920 },
      features: [
        "Unlimited Locations & Branches",
        "Unlimited Staff & Roster accounts",
        "HIPAA-Compliant Patient Logs",
        "Automated gate scanner API integration",
        "Custom domain branding mapping",
        "24/7 Phone & Dedicated Manager Support"
      ],
      ctaText: "Go Pro Enterprise",
      planKey: "pro",
      isPopular: false
    }
  ];

  return (
    <div className="pricing-page container animate-fade">
      {/* Pricing Header */}
      <section className="pricing-header text-center">
        <span className="section-label">Predictable Premium Pricing</span>
        <h2>Honest Plans, Scalable Foundations</h2>
        <p>Choose the plan that matches your current size. Start immediately with a 14-day free trial. Cancel or upgrade anytime.</p>
        
        {/* Toggle Switch */}
        <div className="billing-toggle-wrapper glass">
          <button 
            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Bill Monthly
          </button>
          <button 
            className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Bill Annually <span className="discount-tag">Save 20%</span>
          </button>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pricing-grid">
        {plans.map((plan, idx) => (
          <div key={idx} className={`pricing-card glass ${plan.isPopular ? 'popular-card' : ''} animate-slide-up`}>
            {plan.isPopular && (
              <span className="popular-badge">
                <Sparkles size={12} /> Most Popular
              </span>
            )}
            <div className="card-header">
              <h3>{plan.name}</h3>
              <p className="plan-desc">{plan.desc}</p>
            </div>
            
            <div className="plan-price-block">
              <span className="price-currency">NPR</span>
              <span className="price-amount">
                {billingCycle === 'monthly' ? plan.price.monthly.toLocaleString() : plan.price.yearly.toLocaleString()}
              </span>
              <span className="price-period">/mo</span>
            </div>
            {billingCycle === 'yearly' && (
              <div className="billed-yearly-alert">
                Billed NPR {(plan.price.yearly * 12).toLocaleString()} annually
              </div>
            )}

            <hr className="plan-divider" />

            <ul className="plan-features">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx}>
                  <Check size={18} className="check-icon" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              to={`/register?plan=${plan.planKey}`}
              className={`btn btn-pricing-cta ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`}
            >
              <span>{plan.ctaText}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </section>

      {/* Embedded CSS */}
      <style>{`
        .pricing-page {
          padding-top: 60px;
          padding-bottom: 120px;
        }
        
        .pricing-header {
          margin-bottom: 60px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .pricing-header h2 {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }
        
        /* Billing Toggle */
        .billing-toggle-wrapper {
          display: inline-flex;
          padding: 6px;
          border-radius: 9999px;
          margin-top: 24px;
          gap: 4px;
        }
        .toggle-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.9rem;
          padding: 8px 20px;
          border-radius: 9999px;
          color: hsla(var(--text-body));
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }
        .toggle-btn.active {
          background-color: hsla(var(--primary));
          color: white;
          box-shadow: 0 4px 10px 0 hsla(var(--primary), 0.2);
        }
        .discount-tag {
          font-size: 0.7rem;
          background-color: rgba(16,185,129,0.15);
          color: #10b981;
          padding: 2px 8px;
          border-radius: 99px;
          font-weight: 800;
        }
        .toggle-btn.active .discount-tag {
          background-color: rgba(255,255,255,0.25);
          color: white;
        }
        
        /* Pricing Cards */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          align-items: stretch;
        }
        .pricing-card {
          border-radius: var(--radius-lg);
          padding: 40px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: var(--shadow-md);
          transition: transform var(--transition-normal);
        }
        .pricing-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-premium);
        }
        .popular-card {
          border-color: hsla(var(--primary), 0.6);
          box-shadow: var(--shadow-glow);
        }
        .popular-card:hover {
          box-shadow: var(--shadow-premium), var(--shadow-glow);
        }
        
        .popular-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background-color: hsla(var(--primary));
          color: white;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 16px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 10px 0 hsla(var(--primary), 0.3);
        }
        
        .pricing-card h3 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }
        .plan-desc {
          color: hsla(var(--text-body));
          font-size: 0.9rem;
          line-height: 1.4;
          min-height: 56px;
        }
        
        .plan-price-block {
          display: flex;
          align-items: baseline;
          margin-top: 16px;
        }
        .price-currency {
          font-size: 1rem;
          font-weight: 700;
          color: hsla(var(--text-muted));
          margin-right: 4px;
        }
        .price-amount {
          font-size: 3rem;
          font-family: var(--font-heading);
          font-weight: 800;
          color: hsla(var(--text-main));
          line-height: 1;
        }
        .price-period {
          font-size: 0.95rem;
          color: hsla(var(--text-muted));
          font-weight: 600;
        }
        .billed-yearly-alert {
          font-size: 0.78rem;
          font-weight: 700;
          color: #10b981;
          margin-top: 4px;
        }
        
        .plan-divider {
          border: 0;
          border-top: 1px solid hsla(var(--border-frosted));
          margin: 24px 0;
        }
        
        .plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
          margin-bottom: 32px;
        }
        .plan-features li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.95rem;
          color: hsla(var(--text-body));
        }
        .check-icon {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .btn-pricing-cta {
          width: 100%;
          padding: 12px;
        }
        
        @media (max-width: 1024px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Pricing;
