
import React from 'react';
import { dummyBusinesses, dummyPlatformStats } from '../dummyData';

const SuperadminDashboard = () => {
  return (
    <div>
      <div className="dashboard-header">
        <h1>Superadmin Overview</h1>
        <p>Monitor your SaaS platform's performance.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Businesses</h3>
          <p>{dummyPlatformStats.totalBusinesses}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{dummyPlatformStats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Monthly Revenue</h3>
          <p>NPR {dummyPlatformStats.monthlyRecurringRevenue.toLocaleString()}</p>
        </div>
      </div>

      <h2>Registered Businesses</h2>
      <br />
      <table className="data-table">
        <thead>
          <tr>
            <th>Business Name</th>
            <th>Type</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {dummyBusinesses.map((business) => (
            <tr key={business.id}>
              <td><strong>{business.name}</strong></td>
              <td style={{textTransform: 'capitalize'}}>{business.type}</td>
              <td style={{textTransform: 'capitalize'}}>{business.plan}</td>
              <td><span className={`badge ${business.status}`}>{business.status}</span></td>
              <td>NPR {business.revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuperadminDashboard;
