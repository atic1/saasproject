import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, ShieldCheck, Dumbbell, 
  Scissors, Stethoscope, Mail, Phone, Calendar 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Customers = () => {
  const { businessType, isSuperAdmin, activeBusiness } = useAuth();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    address: { street: '', city: 'kathmandu' }
  });

  // Define accent colors
  const accentClass = isSuperAdmin ? 'admin' : businessType;

  useEffect(() => {
    fetchCustomers();
  }, [activeBusiness]);

  const fetchCustomers = async () => {
    setLoading(true);
    const token = localStorage.getItem('saas_token');
    const bId = activeBusiness?.businessId;
    if (!token || token.startsWith('mock-') || !bId) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Business-Id': bId
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('saas_token');
    const bId = activeBusiness?.businessId;
    if (!token || !bId) return;

    try {
      const res = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Business-Id': bId
        },
        body: JSON.stringify(newCustomer)
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewCustomer({
          name: '',
          phone: '',
          email: '',
          gender: 'male',
          address: { street: '', city: 'kathmandu' }
        });
        fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create customer');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating customer');
    }
  };

  // --- Dynamic Customer Directory data based on businessType ---
  const getCustomersData = () => {
    if (isSuperAdmin) {
      return [
        { id: 'u1', name: 'John Carter', email: 'j.carter@fitzone.com', role: 'Trainer', business: 'FitZone Gym', phone: '9811111111' },
        { id: 'u2', name: 'Rachel Green', email: 'r.green@glow.com', role: 'Stylist', business: 'Glow Salon', phone: '9822222222' },
        { id: 'u3', name: 'Dr. Gaius Julius', email: 'gaius@smile.com', role: 'Physiotherapist', business: 'Smile Dental', phone: '9833333333' },
      ];
    }

    switch (businessType) {
      case 'gym':
        return [
          { id: 'c1', name: 'Mike Ross', email: 'mike@ross.com', package: 'Power Pro', gateStatus: 'Checked In', phone: '9811122233' },
          { id: 'c2', name: 'Harvey Specter', email: 'harvey@pearson.com', package: 'Gold Annual', gateStatus: 'Checked Out', phone: '9822233344' },
          { id: 'c3', name: 'Louis Litt', email: 'louis@litt.com', package: 'Starter Monthly', gateStatus: 'Suspended', phone: '9833344455' },
        ];
      case 'salon':
        return [
          { id: 'c1', name: 'Jane Smith', email: 'jane.s@gmail.com', preference: 'Organic Hair Oils', stylist: 'Rachel Green', phone: '9844455566' },
          { id: 'c2', name: 'Monica Geller', email: 'monica@geller.com', preference: 'Hydration Facials', stylist: 'Chloe Vane', phone: '9855566677' },
          { id: 'c3', name: 'Phoebe Buffay', email: 'phoebe@smellycat.com', preference: 'Aroma Therapy Spas', stylist: 'Chloe Vane', phone: '9866677788' },
        ];
      case 'clinic':
        return [
          { id: 'c1', name: 'John Doe', email: 'john.doe@gmail.com', medNo: 'MC-2026-90', doc: 'Dr. Marcus Vance', phone: '9877788899' },
          { id: 'c2', name: 'Arthur Pendragon', email: 'king@camelot.com', medNo: 'MC-2026-45', doc: 'Dr. Gaius', phone: '9888899900' },
          { id: 'c3', name: 'Ginevra Weasley', email: 'ginny@potter.com', medNo: 'MC-2026-12', doc: 'Dr. Pomfrey', phone: '9899900011' },
        ];
      default:
        return [];
    }
  };

  const allRecords = customers.length > 0 ? customers.map(c => ({
    id: c._id,
    name: c.name,
    email: c.email || '',
    phone: c.phone || '',
    package: c.membership?.planId?.name || c.membership?.planId || 'Basic',
    status: c.membership?.status === 'active' ? 'paid' : (c.membership?.status || 'pending'),
    gateStatus: c.membership?.status === 'active' ? 'Checked In' : 'Checked Out',
    preference: c.medicalInfo?.notes || '',
    stylist: '',
    medNo: c.qrCode?.code || 'MC-2026-N/A',
    doc: ''
  })) : getCustomersData().map(c => ({
    ...c,
    status: c.gateStatus === 'Checked In' ? 'paid' : (c.gateStatus === 'Suspended' ? 'pending' : 'active')
  }));

  const filtered = allRecords.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));

  // Render headers
  const getHeaderTitle = () => {
    if (isSuperAdmin) return { title: 'SaaS User Directory', desc: 'Manage system operators and user accounts.' };
    switch (businessType) {
      case 'gym': return { title: 'Club Athletes Directory', desc: 'Manage gym members, packages, and membership controls.' };
      case 'salon': return { title: 'Salon Customer CRM', desc: 'Track booking preferences, stylist assignments, and service history.' };
      case 'clinic': return { title: 'Patient Health Vault', desc: 'Securely view patient details, case files, and medical logs.' };
      default: return { title: 'Customer Records', desc: 'Manage registered clients.' };
    }
  };

  const headerInfo = getHeaderTitle();

  return (
    <div className="customers-page animate-fade">
      {/* Page Header */}
      <div className="page-title-row">
        <div>
          <h1>{headerInfo.title}</h1>
          <p>{headerInfo.desc}</p>
        </div>
        {!isSuperAdmin && (
          <button className={`btn btn-primary btn-${accentClass}`} onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Add Record</span>
          </button>
        )}
      </div>

      {/* Filter and search block */}
      <div className="filter-card glass">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search records by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main CRM Table */}
      <div className="card-table-wrapper glass">
        <div className="table-header">
          <h3>Customer Vault Directory</h3>
          <span className={`table-badge badge-${accentClass}`}>Density view</span>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              {isSuperAdmin ? (
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Niche branch</th>
                  <th>Phone</th>
                </tr>
              ) : businessType === 'gym' ? (
                <tr>
                  <th>Athlete Name</th>
                  <th>Email</th>
                  <th>Subscription Package</th>
                  <th>Phone Number</th>
                  <th>Gate Access Status</th>
                  <th>Status</th>
                  <th>Portal Link</th>
                </tr>
              ) : businessType === 'salon' ? (
                <tr>
                  <th>Client Customer</th>
                  <th>Email</th>
                  <th>Preferred Stylist</th>
                  <th>Phone Number</th>
                  <th>Preferred Cosmetics</th>
                  <th>Status</th>
                  <th>Portal Link</th>
                </tr>
              ) : (
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Health Card No.</th>
                  <th>Phone Number</th>
                  <th>Attending Doctor</th>
                  <th>Status</th>
                  <th>Portal Link</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="user-profile-cell">
                        <div className={`avatar-circle bg-${accentClass}`}>
                          {r.name.charAt(0)}
                        </div>
                        <strong>{r.name}</strong>
                      </div>
                    </td>
                    <td>{r.email}</td>
                    
                    {isSuperAdmin ? (
                      <>
                        <td>{r.role}</td>
                        <td>{r.business}</td>
                        <td>{r.phone}</td>
                      </>
                    ) : businessType === 'gym' ? (
                      <>
                        <td>{r.package}</td>
                        <td>{r.phone}</td>
                        <td>
                          <span className={`badge ${r.gateStatus === 'Checked In' ? 'active' : r.gateStatus === 'Checked Out' ? 'inprogress' : 'pending'}`}>
                            {r.gateStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${r.status === 'paid' ? 'active' : r.status === 'active' ? 'active' : 'pending'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <a href={`/customer/${r.id}/portal`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-500 font-semibold underline">
                            Portal 🔗
                          </a>
                        </td>
                      </>
                    ) : businessType === 'salon' ? (
                      <>
                        <td>{r.stylist}</td>
                        <td>{r.phone}</td>
                        <td>{r.preference}</td>
                        <td>
                          <span className={`badge ${r.status === 'paid' ? 'active' : r.status === 'active' ? 'active' : 'pending'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <a href={`/customer/${r.id}/portal`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-500 font-semibold underline">
                            Portal 🔗
                          </a>
                        </td>
                      </>
                    ) : (
                      <>
                        <td><code>{r.medNo}</code></td>
                        <td>{r.phone}</td>
                        <td>{r.doc}</td>
                        <td>
                          <span className={`badge ${r.status === 'paid' ? 'active' : r.status === 'active' ? 'active' : 'pending'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <a href={`/customer/${r.id}/portal`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-500 font-semibold underline">
                            Portal 🔗
                          </a>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isSuperAdmin ? 5 : 7} className="text-center" style={{ padding: '40px' }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay glass-modal">
          <div className="modal-card glass animate-scale-in">
            <div className="modal-header">
              <h3>Register New Client</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddCustomer} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone (98xxxxxxxx)</label>
                <input required type="text" pattern="^98\d{8}$" placeholder="98XXXXXXXX" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="client@example.com" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={newCustomer.gender} onChange={e => setNewCustomer({...newCustomer, gender: e.target.value})} className="select-input">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit" className={`btn btn-primary btn-${accentClass}`} style={{ marginTop: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Embedded CSS */}
      <style>{`
        .customers-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-card {
          width: 90%;
          max-width: 450px;
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 12px;
        }
        .modal-header h3 {
          font-size: 1.25rem;
          color: hsla(var(--text-main));
        }
        .close-btn {
          background: transparent;
          border: none;
          color: hsla(var(--text-muted));
          font-size: 1.5rem;
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .close-btn:hover {
          color: hsla(var(--text-main));
        }
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .modal-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }
        .modal-form label {
          font-size: 0.85rem;
          font-weight: 700;
          color: hsla(var(--text-main));
        }
        .modal-form input, .modal-form select {
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
        .modal-form input:focus, .modal-form select:focus {
          border-color: hsla(var(--primary));
          background-color: hsla(var(--bg-surface));
        }
        
        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 24px;
        }
        .page-title-row h1 { font-size: 2rem; color: hsla(var(--text-main)); }
        .page-title-row p { color: hsla(var(--text-body)); }
        
        /* Filter Card */
        .filter-card {
          border-radius: var(--radius-md);
          padding: 16px 20px;
          box-shadow: var(--shadow-sm);
        }
        .search-input-wrapper {
          position: relative;
          width: 100%;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: hsla(var(--text-muted));
        }
        .search-input-wrapper input {
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
          transition: border-color var(--transition-fast);
        }
        .search-input-wrapper input:focus {
          border-color: hsla(var(--primary));
          background-color: hsla(var(--bg-surface));
        }
        
        /* Table overrides */
        .user-profile-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .bg-gym { background-color: hsla(var(--accent-gym)); }
        .bg-salon { background-color: hsla(var(--accent-salon)); }
        .bg-clinic { background-color: hsla(var(--accent-clinic)); }
        .bg-admin { background-color: hsla(var(--primary)); }
        
        .badge-gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .badge-salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .badge-clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        .badge-admin { background-color: hsla(var(--primary), 0.1); color: hsla(var(--primary)); }
        
        .btn-gym { background-color: hsla(var(--accent-gym)); color: white; }
        .btn-gym:hover { background-color: hsla(var(--accent-gym), 0.9); }
        .btn-salon { background-color: hsla(var(--accent-salon)); color: white; }
        .btn-salon:hover { background-color: hsla(var(--accent-salon), 0.9); }
        .btn-clinic { background-color: hsla(var(--accent-clinic)); color: white; }
        .btn-clinic:hover { background-color: hsla(var(--accent-clinic), 0.9); }
        
        @media (max-width: 600px) {
          .page-title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .page-title-row button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Customers;
