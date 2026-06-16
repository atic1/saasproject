import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Sparkles, Loader2, Dumbbell, 
  Scissors, Stethoscope, Briefcase, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [ownerData, setOwnerData] = useState({ name: '', email: '', password: '' });
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: 'gym',
    subscriptionPlan: 'starter'
  });

  // Pull plan from URL query string if provided
  useEffect(() => {
    const planQuery = searchParams.get('plan');
    if (planQuery && ['starter', 'growth', 'pro'].includes(planQuery)) {
      setBusinessData(prev => ({ ...prev, subscriptionPlan: planQuery }));
    }
  }, [searchParams]);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!ownerData.name || !ownerData.email || !ownerData.password) {
        setError('Please fill in your owner details.');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!businessData.businessName) {
      setError('Please fill in your business name.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await register(
        ownerData.name,
        ownerData.email,
        ownerData.password,
        businessData.businessName,
        businessData.businessType,
        businessData.subscriptionPlan
      );
      setLoading(false);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="register-panel">
      {/* Onboarding Steps Indicators */}
      <div className="step-indicators">
        <span className={`step-dot ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</span>
        <hr className={`step-line ${step > 1 ? 'active' : ''}`} />
        <span className={`step-dot ${step === 2 ? 'active' : ''}`}>2</span>
      </div>

      <div className="register-header text-center">
        <h2>Register Your Tenant</h2>
        <p>{step === 1 ? 'Set up your administrator owner credentials.' : 'Tell us about your local business.'}</p>
      </div>

      {error && (
        <div className="alert alert-danger animate-slide-down">
          <span>{error}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Owner Full Name</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input 
                type="text" 
                id="name" 
                required
                placeholder="Alex Rivera" 
                value={ownerData.name}
                onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Work Email</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                id="email" 
                required
                placeholder="alex@fitzone.com" 
                value={ownerData.email}
                onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Administrator Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                id="password" 
                required
                minLength="8"
                placeholder="Minimum 8 characters" 
                value={ownerData.password}
                onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-auth-submit">
            <span>Continue Onboarding</span>
            <ChevronRight size={16} />
          </button>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="businessName">Legal Business Name</label>
            <div className="input-wrapper">
              <Briefcase size={16} className="input-icon" />
              <input 
                type="text" 
                id="businessName" 
                required
                placeholder="FitZone Kathmandu" 
                value={businessData.businessName}
                onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
              />
            </div>
          </div>

          {/* Business Type Selector Grid */}
          <div className="form-group">
            <label>Niche Vertical Type</label>
            <div className="type-selector-grid">
              <label className={`type-card ${businessData.businessType === 'gym' ? 'active gym' : ''}`}>
                <input 
                  type="radio" 
                  name="businessType" 
                  value="gym" 
                  checked={businessData.businessType === 'gym'}
                  onChange={() => setBusinessData({ ...businessData, businessType: 'gym' })}
                />
                <Dumbbell size={20} />
                <span>Gym / Studio</span>
              </label>

              <label className={`type-card ${businessData.businessType === 'salon' ? 'active salon' : ''}`}>
                <input 
                  type="radio" 
                  name="businessType" 
                  value="salon" 
                  checked={businessData.businessType === 'salon'}
                  onChange={() => setBusinessData({ ...businessData, businessType: 'salon' })}
                />
                <Scissors size={20} />
                <span>Salon / Spa</span>
              </label>

              <label className={`type-card ${businessData.businessType === 'clinic' ? 'active clinic' : ''}`}>
                <input 
                  type="radio" 
                  name="businessType" 
                  value="clinic" 
                  checked={businessData.businessType === 'clinic'}
                  onChange={() => setBusinessData({ ...businessData, businessType: 'clinic' })}
                />
                <Stethoscope size={20} />
                <span>Clinic Hub</span>
              </label>
            </div>
          </div>

          {/* Subscription Tier select list */}
          <div className="form-group">
            <label htmlFor="plan">Onboarding Plan Tier</label>
            <select 
              id="plan" 
              value={businessData.subscriptionPlan}
              onChange={(e) => setBusinessData({ ...businessData, subscriptionPlan: e.target.value })}
              className="styled-select"
            >
              <option value="starter">Starter Plan (NPR 2,900 / mo)</option>
              <option value="growth">Growth Plan (NPR 6,900 / mo)</option>
              <option value="pro">Pro Enterprise (NPR 14,900 / mo)</option>
            </select>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary btn-half" onClick={() => setStep(1)} disabled={loading}>
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button type="submit" className="btn btn-primary btn-half" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Provisioning...</span>
                </>
              ) : (
                <>
                  <span>Create App</span>
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="auth-switch text-center">
        <span>Already have a business?</span> <Link to="/login" className="text-primary font-bold">Sign In</Link>
      </div>

      {/* Embedded CSS */}
      <style>{`
        .register-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        /* Step indicators */
        .step-indicators {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: hsla(var(--border));
          color: hsla(var(--text-muted));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
        }
        .step-dot.active {
          background-color: hsla(var(--primary));
          color: white;
        }
        .step-dot.completed {
          background-color: #10b981;
          color: white;
        }
        .step-line {
          width: 60px;
          border: 0;
          border-top: 2px dashed hsla(var(--border));
        }
        .step-line.active {
          border-color: #10b981;
        }
        
        .register-header h2 {
          font-size: 1.6rem;
          margin-bottom: 6px;
        }
        .register-header p {
          font-size: 0.88rem;
          color: hsla(var(--text-muted));
        }
        
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .input-wrapper {
          position: relative;
          width: 100%;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: hsla(var(--text-muted));
        }
        .input-wrapper input {
          width: 100%;
          height: 42px;
          padding-left: 44px;
          padding-right: 16px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background-color: hsla(var(--bg-base), 0.4);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: hsla(var(--text-main));
          outline: none;
          transition: all var(--transition-fast);
        }
        .input-wrapper input:focus {
          border-color: hsla(var(--primary));
          box-shadow: 0 0 0 3px hsla(var(--primary), 0.1);
        }
        
        /* Category Radio Cards */
        .type-selector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .type-card {
          border: 1px solid hsla(var(--border));
          border-radius: var(--radius-md);
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .type-card input {
          display: none;
        }
        .type-card span {
          font-size: 0.72rem;
          font-weight: 700;
          color: hsla(var(--text-body));
        }
        .type-card svg {
          color: hsla(var(--text-muted));
        }
        
        /* Active Radio States based on business types */
        .type-card.active.gym {
          border-color: hsla(var(--accent-gym));
          background-color: hsla(var(--accent-gym), 0.08);
          color: hsla(var(--accent-gym));
        }
        .type-card.active.gym svg { color: hsla(var(--accent-gym)); }
        
        .type-card.active.salon {
          border-color: hsla(var(--accent-salon));
          background-color: hsla(var(--accent-salon), 0.08);
          color: hsla(var(--accent-salon));
        }
        .type-card.active.salon svg { color: hsla(var(--accent-salon)); }
        
        .type-card.active.clinic {
          border-color: hsla(var(--accent-clinic));
          background-color: hsla(var(--accent-clinic), 0.08);
          color: hsla(var(--accent-clinic));
        }
        .type-card.active.clinic svg { color: hsla(var(--accent-clinic)); }
        
        /* Select lists */
        .styled-select {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background-color: hsla(var(--bg-base), 0.4);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: hsla(var(--text-main));
          outline: none;
          cursor: pointer;
        }
        
        .form-actions-row {
          display: flex;
          gap: 12px;
        }
        .btn-half {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default Register;
