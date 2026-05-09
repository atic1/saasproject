import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';

const SuperadminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/superadmin')
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Superadmin Overview</h1>
        <p>Monitor your SaaS platform's real-time performance.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon icon-purple">
            <Building2 size={24} />
          </div>
          <h3>Total Businesses</h3>
          <p>{data.stats.totalBusinesses}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon icon-blue">
            <Users size={24} />
          </div>
          <h3>Total Users</h3>
          <p>{data.stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon icon-green">
            <DollarSign size={24} />
          </div>
          <h3>Monthly Revenue</h3>
          <p>NPR {data.stats.monthlyRecurringRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Registered Businesses</h2>
          <Activity size={20} color="#64748b" />
        </div>
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
            {data.businesses.map((business) => (
              <tr key={business.id}>
                <td><strong>{business.name}</strong></td>
                <td style={{textTransform: 'capitalize'}}>{business.type}</td>
                <td style={{textTransform: 'capitalize'}}>{business.plan}</td>
                <td>
                  <span className={`badge ${business.status}`}>
                    <span style={{width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor'}}></span>
                    {business.status}
                  </span>
                </td>
                <td>NPR {business.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
