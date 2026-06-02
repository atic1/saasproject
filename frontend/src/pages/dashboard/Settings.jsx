import React, { useState } from 'react';
import { 
  Settings, User, Shield, Key, Sparkles, 
  Briefcase, Save, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const { user, isSuperAdmin, businessType, updateBusinessDetails } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const [businessData, setBusinessData] = useState({
    businessName: user?.businessName || '',
    subscriptionPlan: user?.subscriptionPlan || 'starter'
  });

  const [toastMessage, setToastMessage] = useState('');

  const accentClass = isSuperAdmin ? 'admin' : businessType;

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateBusinessDetails(profileData);
    showToast('Administrator profile details updated successfully!');
  };

  const handleBusinessSave = (e) => {
    e.preventDefault();
    updateBusinessDetails(businessData);
    showToast('Tenant business details updated successfully!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="settings-page animate-fade">
      {/* Title */}
      <div className="page-title-row">
        <div>
          <h1>System & Tenant Settings</h1>
          <p>Configure administrator credentials, custom domains, and visual dashboard branding.</p>
        </div>
      </div>

      {toastMessage && (
        <div className="success-toast glass animate-slide-down">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card glass">
          <div className="card-heading">
            <User size={18} className="card-accent-icon" />
            <h3>Operator Profile</h3>
          </div>
          <form onSubmit={handleProfileSave} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                required
                value={profileData.name} 
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Work Email</label>
              <input 
                type="email" 
                id="email" 
                required
                value={profileData.email} 
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="avatarUrl">Profile Avatar URL</label>
              <input 
                type="text" 
                id="avatarUrl" 
                value={profileData.avatarUrl} 
                onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
              />
            </div>
            <button type="submit" className={`btn btn-primary btn-${accentClass}`}>
              <Save size={16} />
              <span>Save Profile</span>
            </button>
          </form>
        </div>

        {/* Business details Card */}
        {!isSuperAdmin && (
          <div className="settings-card glass">
            <div className="card-heading">
              <Briefcase size={18} className="card-accent-icon" />
              <h3>Tenant Business Profile</h3>
            </div>
            <form onSubmit={handleBusinessSave} className="settings-form">
              <div className="form-group">
                <label htmlFor="businessName">Legal Tenant Name</label>
                <input 
                  type="text" 
                  id="businessName" 
                  required
                  value={businessData.businessName} 
                  onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Current Plan Tier</label>
                <input 
                  type="text" 
                  readOnly 
                  className="read-only-input"
                  value={`${businessData.subscriptionPlan.toUpperCase()} TIER`} 
                />
              </div>
              <div className="form-group">
                <label>Niche Vertical Mode</label>
                <input 
                  type="text" 
                  readOnly 
                  className="read-only-input"
                  value={`${businessType.toUpperCase()} OPERATIONS MODULE`} 
                />
              </div>
              <button type="submit" className={`btn btn-primary btn-${accentClass}`}>
                <Save size={16} />
                <span>Save Business Profile</span>
              </button>
            </form>
          </div>
        )}

        {/* Superadmin specific System settings */}
        {isSuperAdmin && (
          <div className="settings-card glass">
            <div className="card-heading">
              <Shield size={18} className="card-accent-icon" />
              <h3>System Cloud Controls</h3>
            </div>
            <div className="admin-settings-info">
              <ShieldAlert className="warning-icon" />
              <div>
                <h4>Multi-tenant Global Hooks</h4>
                <p>Verify backup clocks, clear Stripe database registers, or manage domain names.</p>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => alert('SaaS gateway hooks recalculated.')} style={{ width: '100%', marginTop: '16px' }}>
              Verify Server Health
            </button>
          </div>
        )}
      </div>

      {/* Embedded CSS */}
      <style>{`
        .settings-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .page-title-row {
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 24px;
        }
        .page-title-row h1 { font-size: 2rem; color: hsla(var(--text-main)); }
        .page-title-row p { color: hsla(var(--text-body)); }
        
        /* Success Toast */
        .success-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: var(--shadow-lg);
          background-color: rgba(16,185,129,0.1);
          border-color: rgba(16,185,129,0.3);
          color: #10b981;
          font-weight: 700;
          font-size: 0.9rem;
          z-index: 1000;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          align-items: start;
        }
        .settings-card {
          border-radius: var(--radius-lg);
          padding: 30px;
          box-shadow: var(--shadow-md);
        }
        .card-heading {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 24px;
        }
        .card-heading h3 { font-size: 1.25rem; color: hsla(var(--text-main)); }
        .card-accent-icon { color: hsla(var(--primary)); }
        
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: hsla(var(--text-main));
        }
        .form-group input {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background-color: hsla(var(--bg-base), 0.4);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: hsla(var(--text-main));
          outline: none;
          transition: all var(--transition-fast);
        }
        .form-group input:focus {
          border-color: hsla(var(--primary));
          background-color: hsla(var(--bg-surface));
        }
        .read-only-input {
          background-color: hsla(var(--text-muted), 0.05) !important;
          color: hsla(var(--text-muted)) !important;
          cursor: not-allowed;
          border-style: dashed !important;
        }
        
        .btn-gym { background-color: hsla(var(--accent-gym)); color: white; }
        .btn-gym:hover { background-color: hsla(var(--accent-gym), 0.9); }
        .btn-salon { background-color: hsla(var(--accent-salon)); color: white; }
        .btn-salon:hover { background-color: hsla(var(--accent-salon), 0.9); }
        .btn-clinic { background-color: hsla(var(--accent-clinic)); color: white; }
        .btn-clinic:hover { background-color: hsla(var(--accent-clinic), 0.9); }
        
        /* Admin specific */
        .admin-settings-info {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: var(--radius-md);
          background-color: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.15);
        }
        .warning-icon { color: hsla(var(--primary)); flex-shrink: 0; }
        .admin-settings-info h4 { font-size: 0.9rem; margin-bottom: 4px; }
        .admin-settings-info p { font-size: 0.8rem; color: hsla(var(--text-body)); line-height: 1.4; }
        
        @media (max-width: 900px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
