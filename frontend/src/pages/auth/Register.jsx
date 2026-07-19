import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Sparkles, Loader2, Dumbbell, 
  Scissors, Stethoscope, Briefcase, ChevronRight, ChevronLeft,
  Phone, MapPin, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: 'gym',
    city: 'kathmandu',
    address: '',
    panVat: '',
    subscriptionPlan: 'starter'
  });
  const [docFile, setDocFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocFile({
          name: file.name,
          mimeType: file.type,
          data: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
      if (!ownerData.name || !ownerData.email || !ownerData.phone || !ownerData.password || !ownerData.confirmPassword) {
        setError('Please fill in all owner credentials.');
        return;
      }
      if (ownerData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (ownerData.password !== ownerData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!/^98\d{8}$/.test(ownerData.phone)) {
        setError('Phone number must be a valid 10-digit Nepali number starting with 98.');
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
        ownerData.phone,
        ownerData.email,
        ownerData.password,
        businessData.businessName,
        businessData.businessType,
        businessData.city,
        businessData.address,
        businessData.panVat,
        docFile,
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
            <label htmlFor="phone">Owner Phone Number</label>
            <div className="input-wrapper">
              <Phone size={16} className="input-icon" />
              <input 
                type="tel" 
                id="phone" 
                required
                placeholder="e.g. 9841234567" 
                pattern="^98\d{8}$"
                title="Must be a valid 10-digit Nepali mobile number starting with 98"
                value={ownerData.phone}
                onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                id="confirmPassword" 
                required
                placeholder="Match your administrator password" 
                value={ownerData.confirmPassword}
                onChange={(e) => setOwnerData({ ...ownerData, confirmPassword: e.target.value })}
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

          {/* City & Address */}
          <div className="form-row-two">
            <div className="form-group flex-1 text-left">
              <label htmlFor="city">City</label>
              <select 
                id="city" 
                value={businessData.city}
                onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                className="styled-select"
              >
                <option value="kathmandu">Kathmandu</option>
                <option value="pokhara">Pokhara</option>
                <option value="lalitpur">Lalitpur</option>
                <option value="bhaktapur">Bhaktapur</option>
                <option value="biratnagar">Biratnagar</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group flex-1 text-left">
              <label htmlFor="address">Specific Address</label>
              <div className="input-wrapper">
                <MapPin size={16} className="input-icon" />
                <input 
                  type="text" 
                  id="address" 
                  required
                  placeholder="e.g. Thamel, Ward 26" 
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* PAN/VAT and Doc Upload */}
          <div className="form-row-two">
            <div className="form-group flex-1 text-left">
              <label htmlFor="panVat">PAN/VAT Number (Optional)</label>
              <div className="input-wrapper">
                <FileText size={16} className="input-icon" />
                <input 
                  type="text" 
                  id="panVat" 
                  placeholder="e.g. 123456789" 
                  value={businessData.panVat}
                  onChange={(e) => setBusinessData({ ...businessData, panVat: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-group flex-1 text-left">
              <label htmlFor="doc-upload">Registration Doc (Optional)</label>
              <div className="file-upload-zone">
                <input 
                  type="file" 
                  id="doc-upload" 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden-file-input"
                />
                <label htmlFor="doc-upload" className="file-upload-label">
                  {docFile ? (
                    <div className="selected-file-info">
                      <span className="file-name-span">{docFile.name.substring(0, 15)}{docFile.name.length > 15 ? '...' : ''}</span>
                      <span className="file-size-status">Ready</span>
                    </div>
                  ) : (
                    <>
                      <span className="upload-icon">📁 Choose File</span>
                    </>
                  )}
                </label>
              </div>
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
        
        /* Two-column layout */
        .form-row-two {
          display: flex;
          gap: 16px;
        }
        .flex-1 {
          flex: 1;
        }
        
        /* File Upload Zone */
        .file-upload-zone {
          border: 1px dashed hsla(var(--border));
          border-radius: var(--radius-md);
          padding: 8px 12px;
          text-align: center;
          background-color: hsla(var(--bg-base), 0.4);
          transition: all var(--transition-fast);
          cursor: pointer;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .file-upload-zone:hover {
          border-color: hsla(var(--primary));
          background-color: hsla(var(--primary), 0.05);
        }
        .hidden-file-input {
          display: none;
        }
        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          color: hsla(var(--text-muted));
          font-size: 0.85rem;
          width: 100%;
        }
        .selected-file-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 8px;
        }
        .file-name-span {
          color: hsla(var(--text-main));
          font-weight: 700;
          font-size: 0.8rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-size-status {
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default Register;
