import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, User, Lock, Sparkles, Loader2, Dumbbell, 
  Scissors, Stethoscope, Shield, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in all credentials fields.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(usernameOrEmail, password);
      // Redirect based on user role
      if (loggedUser.role === 'superadmin' || loggedUser.platformrole === 'super_admin') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError('Invalid login credentials provided.');
    } finally {
      setLoading(false);
    }
  };

  // Immediate quick-login for demo purposes
  const handleQuickLogin = async (emailAddress) => {
    setLoading(true);
    setError('');
    try {
      const loggedUser = await quickLogin(emailAddress);
      if (loggedUser) {
        if (loggedUser.role === 'superadmin' || loggedUser.platformrole === 'super_admin') {
          navigate('/superadmin/dashboard');
        } else {
          navigate('/app/dashboard');
        }
      } else {
        setError('Preset quick login failed.');
      }
    } catch (err) {
      setError('Quick login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-panel">
      <div className="login-header text-center">
        <h2>Welcome Back</h2>
        <p>Enter your tenant credentials to manage your business.</p>
      </div>

      {error && (
        <div className="alert alert-danger animate-slide-down">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="usernameOrEmail">Email or Username</label>
          <div className="input-wrapper">
            <User size={16} className="input-icon" />
            <input 
              type="text" 
              id="usernameOrEmail" 
              placeholder="Enter email or username" 
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="form-lbl-row">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" className="forgot-lbl">Forgot?</Link>
          </div>
          <div className="input-wrapper">
            <Lock size={16} className="input-icon" />
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-auth-submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying tenant session...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="auth-switch text-center">
        <span>New to our SaaS?</span> <Link to="/register" className="text-primary font-bold">Register Business</Link>
      </div>

      {/* QUICK DEMO SWITCHER */}
      <div className="quick-login-switcher">
        <hr className="divider" />
        <span className="divider-label">Demo Quick Logins</span>
        
        <div className="quick-btn-grid">
          <button className="quick-profile-btn gym" onClick={() => handleQuickLogin('gym-owner@fitzone.com')}>
            <Dumbbell size={16} />
            <div className="btn-lbl">
              <strong>Gym Tenant</strong>
              <span>FitZone Gym</span>
            </div>
          </button>

          <button className="quick-profile-btn salon" onClick={() => handleQuickLogin('salon-owner@glow.com')}>
            <Scissors size={16} />
            <div className="btn-lbl">
              <strong>Salon Tenant</strong>
              <span>Glow Salon</span>
            </div>
          </button>

          <button className="quick-profile-btn clinic" onClick={() => handleQuickLogin('clinic-owner@smile.com')}>
            <Stethoscope size={16} />
            <div className="btn-lbl">
              <strong>Clinic Tenant</strong>
              <span>Smile Dental</span>
            </div>
          </button>

          <button className="quick-profile-btn admin" onClick={() => handleQuickLogin('admin@saas.com')}>
            <Shield size={16} />
            <div className="btn-lbl">
              <strong>Super Admin</strong>
              <span>SaaS Overview</span>
            </div>
          </button>
        </div>
      </div>

      {/* Embedded CSS */}
      <style>{`
        .login-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .login-header h2 {
          font-size: 1.8rem;
          margin-bottom: 6px;
        }
        .login-header p {
          font-size: 0.9rem;
          color: hsla(var(--text-muted));
        }
        
        .alert {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
        }
        .alert-danger {
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-lbl-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .forgot-lbl {
          font-size: 0.78rem;
          color: hsla(var(--primary));
          font-weight: 700;
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
          background-color: hsla(var(--bg-surface));
          box-shadow: 0 0 0 3px hsla(var(--primary), 0.1);
        }
        
        .btn-auth-submit {
          width: 100%;
          padding: 12px;
        }
        
        .auth-switch {
          font-size: 0.88rem;
          color: hsla(var(--text-body));
        }
        .font-bold { font-weight: 700; }
        
        /* Demo switcher */
        .quick-login-switcher {
          position: relative;
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .divider {
          border: 0;
          border-top: 1px solid hsla(var(--border-frosted));
        }
        .divider-label {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          background-color: hsla(var(--bg-surface));
          padding: 0 12px;
          font-size: 0.75rem;
          font-weight: 800;
          color: hsla(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .quick-btn-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .quick-profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background-color: hsla(var(--bg-base), 0.3);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }
        .quick-profile-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        
        .quick-profile-btn.gym { color: hsla(var(--accent-gym)); border-color: hsla(var(--accent-gym), 0.2); }
        .quick-profile-btn.salon { color: hsla(var(--accent-salon)); border-color: hsla(var(--accent-salon), 0.2); }
        .quick-profile-btn.clinic { color: hsla(var(--accent-clinic)); border-color: hsla(var(--accent-clinic), 0.2); }
        .quick-profile-btn.admin { color: hsla(var(--primary)); border-color: hsla(var(--primary), 0.2); }
        
        .btn-lbl {
          display: flex;
          flex-direction: column;
        }
        .btn-lbl strong {
          font-size: 0.78rem;
          font-weight: 700;
          color: hsla(var(--text-main));
        }
        .btn-lbl span {
          font-size: 0.65rem;
          color: hsla(var(--text-muted));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 90px;
        }
      `}</style>
    </div>
  );
};

export default Login;
