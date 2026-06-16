import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="forgot-panel">
      <div className="forgot-header text-center">
        <KeyRound className="forgot-icon" />
        <h2>Reset Password</h2>
        <p>Input your business account email, and we will send a secure recovery link.</p>
      </div>

      {submitted ? (
        <div className="success-state animate-slide-up text-center">
          <CheckCircle2 size={40} className="success-icon" />
          <h3>Recovery Dispatched!</h3>
          <p>An encrypted password reset token has been dispatched to **{email}**. Please review your inbox.</p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label htmlFor="email">Registered Email</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                id="email" 
                required
                placeholder="operator@fitzone.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-auth-submit">
            Send Reset Link
          </button>
        </form>
      )}

      <div className="auth-switch text-center">
        <Link to="/login" className="btn-back-login">
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {/* Embedded CSS */}
      <style>{`
        .forgot-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .forgot-icon {
          color: hsla(var(--primary));
          background-color: hsla(var(--primary), 0.1);
          padding: 10px;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          margin: 0 auto 16px;
        }
        .forgot-header h2 {
          font-size: 1.6rem;
          margin-bottom: 6px;
        }
        .forgot-header p {
          font-size: 0.88rem;
          color: hsla(var(--text-muted));
          line-height: 1.4;
        }
        
        .forgot-form {
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
        
        .btn-auth-submit {
          width: 100%;
          padding: 12px;
        }
        
        .btn-back-login {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          font-weight: 700;
          color: hsla(var(--text-body));
        }
        .btn-back-login:hover {
          color: hsla(var(--primary));
        }
        
        .success-state h3 {
          font-size: 1.25rem;
          margin-bottom: 8px;
          color: hsla(var(--text-main));
        }
        .success-state p {
          font-size: 0.9rem;
          color: hsla(var(--text-body));
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .success-icon {
          color: #10b981;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
