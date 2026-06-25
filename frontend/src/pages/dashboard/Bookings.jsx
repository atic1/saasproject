import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';

const Bookings = () => {
  const { businessType, isSuperAdmin, activeBusiness } = useAuth();
  const { bookings, fetchBookings, changeStatus, removeBooking, loading, error } = useBookings();

  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formCustomers, setFormCustomers] = useState([]);
  const [formServices, setFormServices] = useState([]);
  const [formStaff, setFormStaff] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'appointment',
    serviceId: '',
    staffId: '',
    date: '',
    startTime: '',
    endTime: '',
    customerNotes: ''
  });

  const { addBooking } = useBookings();

  useEffect(() => {
    if (showCreateModal && activeBusiness?.businessId) {
      const token = localStorage.getItem('saas_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-Business-Id': activeBusiness.businessId
      };

      fetch('http://localhost:5000/api/customers', { headers })
        .then(res => res.json())
        .then(data => setFormCustomers(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));

      fetch(`http://localhost:5000/api/services?businessId=${activeBusiness.businessId}`, { headers })
        .then(res => res.json())
        .then(data => setFormServices(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));

      fetch('http://localhost:5000/api/businesses/current/staff', { headers })
        .then(res => res.json())
        .then(data => setFormStaff(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    }
  }, [showCreateModal, activeBusiness]);

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.date || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields.');
      return;
    }

    const selectedService = formServices.find(s => s._id === formData.serviceId);
    const selectedStaff = formStaff.find(s => s._id === formData.staffId);

    const payload = {
      customerId: formData.customerId,
      type: formData.type,
      serviceId: formData.serviceId || undefined,
      serviceName: selectedService ? selectedService.name : undefined,
      staffId: formData.staffId || undefined,
      staffName: selectedStaff ? selectedStaff.name : undefined,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      customerNotes: formData.customerNotes
    };

    const result = await addBooking(payload);
    if (result.success) {
      setShowCreateModal(false);
      setFormData({
        customerId: '',
        type: 'appointment',
        serviceId: '',
        staffId: '',
        date: '',
        startTime: '',
        endTime: '',
        customerNotes: ''
      });
    } else {
      alert(`Error creating booking: ${result.error}`);
    }
  };

  const accentClass = isSuperAdmin ? 'admin' : businessType;

  // Load bookings when business changes
  useEffect(() => {
    if (activeBusiness?.businessId) {
      fetchBookings();
    }
  }, [activeBusiness, fetchBookings]);

  // Filter logic
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    switch (filter) {
      case 'pending':
        return bookings.filter(b =>
          ['pending', 'confirmed'].includes(b.status)
        );
      case 'active':
        return bookings.filter(b =>
          ['confirmed', 'checked_in'].includes(b.status)
        );
      case 'completed':
        return bookings.filter(b =>
          ['completed'].includes(b.status)
        );
      default:
        return bookings;
    }
  }, [bookings, filter]);

  const getPageHeaders = () => {
    if (isSuperAdmin)
      return {
        title: 'System Operations Logs',
        desc: 'Monitor all booking transactions, conflicts, and audit logs.'
      };

    switch (businessType) {
      case 'gym':
        return {
          title: 'Gym Class Schedules',
          desc: 'Track workout slots, attending athletes, and trainer sheets.'
        };
      case 'salon':
        return {
          title: 'Salon Appointment Books',
          desc: 'Track stylist occupancy, beauty bookings, and SMS confirmations.'
        };
      case 'clinic':
        return {
          title: 'Clinic Doctor Rota & Appointments',
          desc: 'Coordinate clinical patient queues, doctor check-ins, and consultation status.'
        };
      default:
        return {
          title: 'Reservations Scheduler',
          desc: 'Manage branch booking books.'
        };
    }
  };

  const headers = getPageHeaders();

  const handleStatusChange = useCallback(async (bookingId, newStatus) => {
    setActionLoading(bookingId);
    const result = await changeStatus(bookingId, newStatus);
    setActionLoading(null);
    
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  }, [changeStatus]);

  const handleDelete = useCallback(async (bookingId) => {
    setActionLoading(bookingId);
    const result = await removeBooking(bookingId);
    setActionLoading(null);
    setShowDeleteConfirm(null);
    
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  }, [removeBooking]);

  const formatLabel = (b) => {
    if (isSuperAdmin) {
      return {
        col1: b.customerName,
        col2: b.serviceName || 'General Booking',
        col3: `${new Date(b.date).toLocaleDateString()} ${b.startTime}`,
        col4: b.staffName || 'Unassigned',
        status: b.status
      };
    }

    if (businessType === 'gym') {
      return {
        col1: b.customerName,
        col2: b.serviceName,
        col3: `${new Date(b.date).toLocaleDateString()} ${b.startTime}`,
        col4: b.staffName,
        status: b.status
      };
    }

    if (businessType === 'salon') {
      return {
        col1: b.customerName,
        col2: b.serviceName,
        col3: `${new Date(b.date).toLocaleDateString()} ${b.startTime}`,
        col4: b.staffName,
        status: b.status
      };
    }

    // clinic default
    return {
      col1: b.customerName,
      col2: b.serviceName,
      col3: `${new Date(b.date).toLocaleDateString()} ${b.startTime}`,
      col4: b.staffName,
      status: b.status
    };
  };

  const getStatusOptions = (currentStatus) => {
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['checked_in', 'no_show', 'cancelled'],
      checked_in: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      no_show: []
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div className="bookings-page animate-fade">

      {/* Header */}
      <div className="page-title-row">
        <div>
          <h1>{headers.title}</h1>
          <p>{headers.desc}</p>
        </div>

        <button className={`btn btn-primary btn-${accentClass}`} onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>Create Booking</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner glass">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="filter-card glass">
        <div className="filter-btns-row">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Entries
          </button>

          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>

          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>

          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card-table-wrapper glass">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading bookings...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBookings.length === 0 && (
        <div className="card-table-wrapper glass">
          <div className="empty-state">
            <p>No bookings found for "{filter}" filter</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && filteredBookings.length > 0 && (
      <div className="card-table-wrapper glass">
        <div className="table-header">
          <h3>Operational Roster Calendar</h3>
          <span className={`table-badge badge-${accentClass}`}>
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Primary</th>
                <th>Service / Module</th>
                <th>Time</th>
                <th>Staff / Operator</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((b) => {
                const row = formatLabel(b);
                const options = getStatusOptions(b.status);

                return (
                  <tr key={b._id || b.id}>
                    <td><strong>{row.col1}</strong></td>
                    <td>{row.col2}</td>
                    <td>{row.col3}</td>
                    <td>{row.col4}</td>
                    <td>
                      <span className={`badge badge-${accentClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {options.length > 0 && (
                        <select
                          className="action-select"
                          disabled={actionLoading === b._id}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleStatusChange(b._id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">Change Status...</option>
                          {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      <button
                        className="action-btn delete-btn"
                        disabled={actionLoading === b._id}
                        onClick={() => setShowDeleteConfirm(b._id)}
                        title="Delete booking"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                disabled={actionLoading === showDeleteConfirm}
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                {actionLoading === showDeleteConfirm ? 'Deleting...' : 'Delete Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Create New Booking</h3>
            <form onSubmit={handleCreateBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Select Customer *</label>
                <select 
                  className="action-select" 
                  style={{ width: '100%', padding: '10px' }}
                  required
                  value={formData.customerId}
                  onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                >
                  <option value="">-- Choose Customer --</option>
                  {formCustomers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Booking Type *</label>
                <select 
                  className="action-select" 
                  style={{ width: '100%', padding: '10px' }}
                  required
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="appointment">Appointment</option>
                  <option value="class">Class</option>
                  <option value="service">Service</option>
                  <option value="slot">Slot</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Select Service *</label>
                <select 
                  className="action-select" 
                  style={{ width: '100%', padding: '10px' }}
                  value={formData.serviceId}
                  onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                >
                  <option value="">-- Choose Service --</option>
                  {formServices.map(s => (
                    <option key={s._id} value={s._id}>{s.name} - NPR {s.price} ({s.duration} mins)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Select Staff / Operator</label>
                <select 
                  className="action-select" 
                  style={{ width: '100%', padding: '10px' }}
                  value={formData.staffId}
                  onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                >
                  <option value="">-- Choose Staff --</option>
                  {formStaff.map(st => (
                    <option key={st._id} value={st._id}>{st.name} ({st.role})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Date *</label>
                  <input 
                    type="date" 
                    className="action-select"
                    style={{ width: '100%', padding: '8px' }}
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Start *</label>
                    <input 
                      type="text" 
                      placeholder="09:00"
                      className="action-select"
                      style={{ width: '100%', padding: '8px' }}
                      required
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>End *</label>
                    <input 
                      type="text" 
                      placeholder="10:00"
                      className="action-select"
                      style={{ width: '100%', padding: '8px' }}
                      required
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Notes / Requests</label>
                <textarea 
                  className="action-select" 
                  style={{ width: '100%', padding: '10px', minHeight: '60px', fontFamily: 'inherit' }}
                  value={formData.customerNotes}
                  onChange={e => setFormData({ ...formData, customerNotes: e.target.value })}
                  placeholder="Any special customer requests..."
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '8px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary btn-${accentClass}`}
                >
                  Save Booking
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .bookings-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 24px;
        }

        .page-title-row h1 {
          font-size: 2rem;
          color: hsla(var(--text-main));
        }

        .page-title-row p {
          color: hsla(var(--text-body));
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: hsla(0, 100%, 50%, 0.1);
          border-left: 4px solid hsla(0, 100%, 50%);
          border-radius: var(--radius-md);
          color: hsla(0, 100%, 50%);
        }

        .filter-card {
          border-radius: var(--radius-md);
          padding: 12px 20px;
        }

        .filter-btns-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-tab {
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          color: hsla(var(--text-body));
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: hsla(var(--text-muted), 0.1);
          color: hsla(var(--text-main));
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: hsla(var(--text-body));
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid hsla(var(--text-muted), 0.2);
          border-top-color: hsla(var(--primary-color));
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .actions-cell {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-select {
          padding: 8px 12px;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-sm);
          background: hsl(var(--bg-surface));
          color: hsl(var(--text-main));
          cursor: pointer;
          font-size: 13px;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .action-select:focus {
          border-color: hsl(var(--primary));
        }

        .action-btn {
          padding: 6px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: hsl(var(--text-muted));
          transition: all 0.2s;
        }

        .action-btn:hover:not(:disabled) {
          color: hsl(0 100% 50%);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: hsl(var(--bg-surface));
          border: 1px solid hsl(var(--border));
          padding: 28px;
          border-radius: var(--radius-lg);
          max-width: 500px;
          box-shadow: var(--shadow-premium);
        }

        .modal-content h3 {
          margin-bottom: 12px;
          color: hsl(var(--text-main));
        }

        .modal-content p {
          margin-bottom: 24px;
          color: hsl(var(--text-body));
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-danger {
          background: hsl(0 100% 50% / 0.9);
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: hsl(0 100% 50%);
        }

        /* Business Accent Badges */
        .badge-gym, .table-badge.badge-gym {
          background-color: hsl(var(--accent-gym) / 0.15) !important;
          color: hsl(var(--accent-gym)) !important;
        }
        .badge-salon, .table-badge.badge-salon {
          background-color: hsl(var(--accent-salon) / 0.15) !important;
          color: hsl(var(--accent-salon)) !important;
        }
        .badge-clinic, .table-badge.badge-clinic {
          background-color: hsl(var(--accent-clinic) / 0.15) !important;
          color: hsl(var(--accent-clinic)) !important;
        }
        .badge-admin, .table-badge.badge-admin {
          background-color: hsl(var(--primary) / 0.15) !important;
          color: hsl(var(--primary)) !important;
        }

        /* Business Accent Buttons */
        .btn-gym {
          background-color: hsl(var(--accent-gym)) !important;
          color: #fff !important;
          box-shadow: 0 4px 12px hsl(var(--accent-gym) / 0.3) !important;
        }
        .btn-gym:hover:not(:disabled) {
          background-color: hsl(var(--accent-gym) / 0.9) !important;
          transform: translateY(-1px);
        }
        .btn-salon {
          background-color: hsl(var(--accent-salon)) !important;
          color: #fff !important;
          box-shadow: 0 4px 12px hsl(var(--accent-salon) / 0.3) !important;
          border-color: transparent !important;
        }
        .btn-salon:hover:not(:disabled) {
          background-color: hsl(var(--accent-salon) / 0.9) !important;
          transform: translateY(-1px);
        }
        .btn-clinic {
          background-color: hsl(var(--accent-clinic)) !important;
          color: #fff !important;
          box-shadow: 0 4px 12px hsl(var(--accent-clinic) / 0.3) !important;
          border-color: transparent !important;
        }
        .btn-clinic:hover:not(:disabled) {
          background-color: hsl(var(--accent-clinic) / 0.9) !important;
          transform: translateY(-1px);
        }
        .btn-admin {
          background-color: hsl(var(--primary)) !important;
          color: #fff !important;
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.3) !important;
          border-color: transparent !important;
        }
        .btn-admin:hover:not(:disabled) {
          background-color: hsl(var(--primary-hover)) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default Bookings;
