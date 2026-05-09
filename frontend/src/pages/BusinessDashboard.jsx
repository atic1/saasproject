import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, DollarSign, CalendarDays, ClipboardList } from 'lucide-react';

const BusinessDashboard = () => {
  const { businessId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/dashboard/business/${businessId}`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [businessId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading business details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-container">
        <h2>Failed to load business details.</h2>
      </div>
    );
  }

  if (data.message) {
    return (
      <div className="loading-container">
        <h2>{data.message}</h2>
      </div>
    );
  }

  const { business, recentBookings } = data;

  if (!business || !business.id) {
    return (
      <div className="loading-container">
        <h2>Business not found!</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>{business.name} Dashboard</h1>
        <p>Manage your {business.type} operations and appointments.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon icon-blue">
            <Users size={24} />
          </div>
          <h3>Total Customers</h3>
          <p>{business.members}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon icon-green">
            <DollarSign size={24} />
          </div>
          <h3>Total Revenue</h3>
          <p>NPR {business.revenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon icon-purple">
            <CalendarDays size={24} />
          </div>
          <h3>Upcoming Bookings</h3>
          <p>{recentBookings ? recentBookings.length : 0}</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Recent Bookings & Appointments</h2>
          <ClipboardList size={20} color="#64748b" />
        </div>
        
        {recentBookings && recentBookings.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td><strong>{booking.customer}</strong></td>
                  <td style={{textTransform: 'capitalize'}}>{booking.type}</td>
                  <td>{booking.date}</td>
                  <td>{booking.time}</td>
                  <td>
                    <span className={`badge ${booking.status}`}>
                      <span style={{width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor'}}></span>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <p>No upcoming bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
