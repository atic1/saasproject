
import React from 'react';
import { useParams } from 'react-router-dom';
import { dummyBusinesses, dummyBookings } from '../dummyData';

const BusinessDashboard = () => {
  const { businessId } = useParams();
  
  // Find the specific business data
  const business = dummyBusinesses.find(b => b.id === businessId);
  // Filter bookings for this specific business
  const recentBookings = dummyBookings.filter(b => b.businessId === businessId);

  if (!business) return <h2>Business not found!</h2>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>{business.name} Dashboard</h1>
        <p>Manage your {business.type} operations.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{business.members}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>NPR {business.revenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Bookings</h3>
          <p>{recentBookings.length}</p>
        </div>
      </div>

      <h2>Recent Bookings & Appointments</h2>
      <br />
      {recentBookings.length > 0 ? (
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
                <td><span className={`badge ${booking.status}`}>{booking.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No upcoming bookings found.</p>
      )}
    </div>
  );
};

export default BusinessDashboard;
