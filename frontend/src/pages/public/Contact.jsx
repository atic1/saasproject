import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="contact-page container animate-fade">
      <section className="contact-header text-center">
        <span className="section-label">Connect With Operators</span>
        <h2>Let's Start the Conversation</h2>
        <p>Questions about the multi-tenant architecture, customized custom pricing plans, or security details? Send us an inquiry message directly.</p>
      </section>

      <section className="contact-grid">
        {/* Contact Info Col */}
        <div className="contact-info-col">
          <div className="info-card glass">
            <Mail className="info-icon" />
            <div>
              <h3>Email Inquiries</h3>
              <p className="val">sales@biznepal.com</p>
              <p className="desc">Expect a detailed response within 3 hours.</p>
            </div>
          </div>

          <div className="info-card glass">
            <Phone className="info-icon" />
            <div>
              <h3>Phone Hotline</h3>
              <p className="val">+977 1 44556677</p>
              <p className="desc">Mon-Fri from 9 AM to 6 PM NPT.</p>
            </div>
          </div>

          <div className="info-card glass">
            <MapPin className="info-icon" />
            <div>
              <h3>Corporate Office</h3>
              <p className="val">Lalitpur District, Nepal</p>
              <p className="desc">Innovation Blvd, Kathmandu Area.</p>
            </div>
          </div>
        </div>

        {/* Contact Form Col */}
        <div className="contact-form-col glass">
          {submitted ? (
            <div className="success-state animate-slide-up">
              <CheckCircle2 size={48} className="success-icon" />
              <h2>Message Dispatched!</h2>
              <p>Thank you, **{formData.name}**. Your inquiry has been logged. One of our multi-tenant SaaS specialists will follow up at **{formData.email}** shortly.</p>
              <button className="btn btn-primary" onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <h3>Send a Message</h3>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  placeholder="Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  placeholder="alex@fitzone.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject Topic</label>
                <input 
                  type="text" 
                  id="subject"
                  placeholder="Gym gate check-in API details"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Inquiry Message</label>
                <textarea 
                  id="message" 
                  required 
                  rows="4"
                  placeholder="Describe your branch details, desired business module type..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-submit">
                <span>Dispatch Inquiry</span>
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Embedded CSS */}
      <style>{`
        .contact-page {
          padding-top: 60px;
          padding-bottom: 120px;
        }
        .contact-header {
          margin-bottom: 60px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .contact-header h2 {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }
        
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
          align-items: start;
        }
        
        /* Info Col */
        .contact-info-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .info-card {
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          box-shadow: var(--shadow-sm);
        }
        .info-icon {
          color: hsla(var(--primary));
          background-color: hsla(var(--primary), 0.1);
          padding: 10px;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .info-card h3 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }
        .info-card .val {
          font-size: 1.2rem;
          font-weight: 700;
          color: hsla(var(--text-main));
        }
        .info-card .desc {
          font-size: 0.85rem;
          color: hsla(var(--text-muted));
        }
        
        /* Form Col */
        .contact-form-col {
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: var(--shadow-md);
        }
        .contact-form h3 {
          font-size: 1.5rem;
          margin-bottom: 24px;
        }
        
        .form-group {
          margin-bottom: 20px;
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
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1px solid hsla(var(--border));
          background-color: hsla(var(--bg-base), 0.4);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: hsla(var(--text-main));
          outline: none;
          transition: all var(--transition-fast);
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: hsla(var(--primary));
          background-color: hsla(var(--bg-surface));
          box-shadow: 0 0 0 3px hsla(var(--primary), 0.1);
        }
        
        .btn-submit {
          width: 100%;
          padding: 12px;
        }
        
        /* Success State */
        .success-state {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 20px 0;
        }
        .success-icon {
          color: #10b981;
          animation: pulseGlow 2s infinite ease-in-out;
        }
        .success-state h2 {
          font-size: 1.8rem;
        }
        .success-state p {
          color: hsla(var(--text-body));
          font-size: 1rem;
          line-height: 1.6;
          max-width: 400px;
          margin-bottom: 12px;
        }
        .success-state strong {
          color: hsla(var(--text-main));
        }
        
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
