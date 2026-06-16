import { useState, useEffect } from 'react';
import { 
  User, Shield, Briefcase, Save, CheckCircle2, ShieldAlert, Globe, Trash2, PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const { user, isSuperAdmin, businessType, updateBusinessDetails, activeBusiness } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const [businessData, setBusinessData] = useState({
    businessName: activeBusiness?.businessName || user?.businessName || '',
    subscriptionPlan: activeBusiness?.subscription?.plan || user?.subscriptionPlan || 'starter'
  });

  const [websiteData, setWebsiteData] = useState({
    name: activeBusiness?.businessName || user?.businessName || '',
    logo: '',
    heroBanner: '',
    about: '',
    phone: '',
    email: '',
    address: '',
    city: 'kathmandu',
    mapLink: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    gallery: []
  });

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchBusinessSettings = async () => {
      const token = localStorage.getItem('saas_token');
      const bId = activeBusiness?.businessId || user?.businessId;
      if (!token || token.startsWith('mock-') || !bId) return;
      try {
        const response = await fetch('http://localhost:5000/api/businesses/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Business-Id': bId
          }
        });
        const data = await response.json();
        if (response.ok) {
          setBusinessData({
            businessName: data.name || '',
            subscriptionPlan: data.subscription?.plan || 'starter'
          });
          setWebsiteData({
            name: data.name || '',
            logo: data.branding?.logo || '',
            heroBanner: data.branding?.heroBanner || '',
            about: data.branding?.about || '',
            phone: data.contact?.phone || '',
            email: data.contact?.email || '',
            address: data.contact?.address || '',
            city: data.contact?.city || 'kathmandu',
            mapLink: data.contact?.mapLink || '',
            facebook: data.contact?.socialLinks?.facebook || '',
            instagram: data.contact?.socialLinks?.instagram || '',
            tiktok: data.contact?.socialLinks?.tiktok || '',
            gallery: data.branding?.gallery || []
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchBusinessSettings();
  }, [user, activeBusiness]);

  const accentClass = isSuperAdmin ? 'admin' : businessType;

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateBusinessDetails(profileData);
    showToast('Administrator profile details updated successfully!');
  };

  const handleBusinessSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('saas_token');
    const bId = activeBusiness?.businessId || user?.businessId;
    if (token && !token.startsWith('mock-') && bId) {
      try {
        const response = await fetch('http://localhost:5000/api/businesses/current', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Business-Id': bId
          },
          body: JSON.stringify({
            name: businessData.businessName
          })
        });
        if (response.ok) {
          const data = await response.json();
          updateBusinessDetails({
            businessName: data.business?.name || businessData.businessName
          });
          showToast('Tenant business details updated successfully!');
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to update business');
        }
      } catch (err) {
        console.error('Failed to update business:', err);
        showToast('Network error updating business settings.');
      }
    } else {
      updateBusinessDetails(businessData);
      showToast('Tenant business details updated successfully!');
    }
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setWebsiteData(prev => ({
        ...prev,
        [fieldName]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWebsiteData(prev => ({
          ...prev,
          gallery: [...prev.gallery, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (indexToRemove) => {
    setWebsiteData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleWebsiteSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('saas_token');
    const bId = activeBusiness?.businessId || user?.businessId;
    if (token && !token.startsWith('mock-') && bId) {
      try {
        const response = await fetch('http://localhost:5000/api/businesses/current', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Business-Id': bId
          },
          body: JSON.stringify({
            name: websiteData.name,
            branding: {
              logo: websiteData.logo,
              heroBanner: websiteData.heroBanner,
              about: websiteData.about,
              gallery: websiteData.gallery
            },
            contact: {
              phone: websiteData.phone,
              email: websiteData.email,
              address: websiteData.address,
              city: websiteData.city,
              mapLink: websiteData.mapLink,
              socialLinks: {
                facebook: websiteData.facebook,
                instagram: websiteData.instagram,
                tiktok: websiteData.tiktok
              }
            }
          })
        });
        if (response.ok) {
          const data = await response.json();
          updateBusinessDetails({
            businessName: data.business?.name || websiteData.name
          });
          showToast('Gym website settings updated successfully!');
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to update website settings');
        }
      } catch (err) {
        console.error('Failed to update website settings:', err);
        showToast('Network error updating website settings.');
      }
    } else {
      updateBusinessDetails({ businessName: websiteData.name });
      showToast('Gym website settings updated successfully (local sandbox mode)!');
    }
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

        {/* Gym Website Settings Card */}
        {!isSuperAdmin && businessType === 'gym' && (
          <div className="settings-card glass" style={{ gridColumn: 'span 2' }}>
            <div className="card-heading">
              <Globe size={18} className="card-accent-icon" />
              <h3>Gym Website Customizer</h3>
            </div>
            <form onSubmit={handleWebsiteSave} className="settings-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="gymName">Gym Website Name</label>
                <input 
                  type="text" 
                  id="gymName" 
                  required
                  value={websiteData.name} 
                  onChange={(e) => setWebsiteData({ ...websiteData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Gym Logo</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  {websiteData.logo ? (
                    <img src={websiteData.logo} alt="Logo Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid hsla(var(--border))' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsla(var(--border), 0.1)', borderRadius: '8px', border: '1px dashed hsla(var(--border))', fontSize: '10px', color: 'hsla(var(--text-muted))' }}>No Logo</div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'logo')} 
                    style={{ display: 'none' }} 
                    id="logo-file-input"
                  />
                  <label htmlFor="logo-file-input" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', margin: 0 }}>
                    Upload File
                  </label>
                </div>
                <input 
                  type="text" 
                  placeholder="Or paste Logo Image URL..."
                  value={websiteData.logo}
                  onChange={(e) => setWebsiteData({ ...websiteData, logo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Hero Banner Image</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  {websiteData.heroBanner ? (
                    <img src={websiteData.heroBanner} alt="Hero Preview" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid hsla(var(--border))' }} />
                  ) : (
                    <div style={{ width: '80px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsla(var(--border), 0.1)', borderRadius: '8px', border: '1px dashed hsla(var(--border))', fontSize: '10px', color: 'hsla(var(--text-muted))' }}>No Banner</div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'heroBanner')} 
                    style={{ display: 'none' }} 
                    id="hero-file-input"
                  />
                  <label htmlFor="hero-file-input" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', margin: 0 }}>
                    Upload File
                  </label>
                </div>
                <input 
                  type="text" 
                  placeholder="Or paste Hero Banner URL..."
                  value={websiteData.heroBanner}
                  onChange={(e) => setWebsiteData({ ...websiteData, heroBanner: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="aboutText">About Gym Section</label>
                <textarea 
                  id="aboutText" 
                  rows={4}
                  placeholder="Tell visitors about your gym history, training philosophy, amenities..."
                  value={websiteData.about} 
                  onChange={(e) => setWebsiteData({ ...websiteData, about: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid hsla(var(--border))', backgroundColor: 'hsla(var(--bg-base), 0.4)', color: 'hsla(var(--text-main))', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Contact Phone Number</label>
                <input 
                  type="text" 
                  id="contactPhone" 
                  placeholder="98XXXXXXXX"
                  value={websiteData.phone} 
                  onChange={(e) => setWebsiteData({ ...websiteData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">Contact Email Address</label>
                <input 
                  type="email" 
                  id="contactEmail" 
                  placeholder="contact@gym.com"
                  value={websiteData.email} 
                  onChange={(e) => setWebsiteData({ ...websiteData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactCity">City Location</label>
                <select 
                  id="contactCity" 
                  value={websiteData.city}
                  onChange={(e) => setWebsiteData({ ...websiteData, city: e.target.value })}
                  style={{ height: '42px', padding: '0 14px', borderRadius: 'var(--radius-md)', border: '1px solid hsla(var(--border))', backgroundColor: 'hsla(var(--bg-base), 0.4)', color: 'hsla(var(--text-main))', outline: 'none' }}
                >
                  <option value="kathmandu">Kathmandu</option>
                  <option value="pokhara">Pokhara</option>
                  <option value="lalitpur">Lalitpur</option>
                  <option value="bhaktapur">Bhaktapur</option>
                  <option value="biratnagar">Biratnagar</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contactAddress">Detailed Address</label>
                <input 
                  type="text" 
                  id="contactAddress" 
                  placeholder="Street Name, Area..."
                  value={websiteData.address} 
                  onChange={(e) => setWebsiteData({ ...websiteData, address: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="mapLink">Google Maps Embed URL (iframe src)</label>
                <input 
                  type="text" 
                  id="mapLink" 
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  value={websiteData.mapLink} 
                  onChange={(e) => setWebsiteData({ ...websiteData, mapLink: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fbLink">Facebook Page Link</label>
                <input 
                  type="text" 
                  id="fbLink" 
                  placeholder="https://facebook.com/..."
                  value={websiteData.facebook} 
                  onChange={(e) => setWebsiteData({ ...websiteData, facebook: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="instaLink">Instagram Page Link</label>
                <input 
                  type="text" 
                  id="instaLink" 
                  placeholder="https://instagram.com/..."
                  value={websiteData.instagram} 
                  onChange={(e) => setWebsiteData({ ...websiteData, instagram: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="tiktokLink">TikTok Page Link</label>
                <input 
                  type="text" 
                  id="tiktokLink" 
                  placeholder="https://tiktok.com/@..."
                  value={websiteData.tiktok} 
                  onChange={(e) => setWebsiteData({ ...websiteData, tiktok: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Website Gallery Images</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '8px', marginBottom: '16px' }}>
                  {websiteData.gallery && websiteData.gallery.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '8px', border: '1px solid hsla(var(--border))', overflow: 'hidden' }}>
                      <img src={img} alt="Gallery Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => removeGalleryImage(idx)} 
                        style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(239, 68, 68, 0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <div style={{ border: '2px dashed hsla(var(--border))', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', backgroundColor: 'hsla(var(--border), 0.05)', cursor: 'pointer', position: 'relative' }}>
                    <PlusCircle size={20} className="card-accent-icon" />
                    <span style={{ fontSize: '10px', marginTop: '4px', color: 'hsla(var(--text-muted))' }}>Add Image</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleGalleryUpload} 
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className={`btn btn-primary btn-${accentClass}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                  <Save size={16} />
                  <span>Save Website Settings</span>
                </button>
              </div>
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
