import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Store, Loader2, Sparkles } from 'lucide-react';
import SuperadminDashboard from './pages/SuperadminDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import './App.css';

function App() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch businesses for the dynamic sidebar
    fetch('http://localhost:5000/api/dashboard/superadmin')
      .then(res => res.json())
      .then(data => {
        setBusinesses(data.businesses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load sidebar data", err);
        setLoading(false);
      });
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* Dynamic Sidebar Navigation */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <Sparkles size={28} color="#818cf8" />
            <h2>SaaS Platform</h2>
          </div>
          <ul>
            <li>
              <Link to="/superadmin">
                <LayoutDashboard size={20} />
                Superadmin Panel
              </Link>
            </li>
            
            <div style={{ marginTop: '20px', marginBottom: '10px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '16px' }}>
              Your Businesses
            </div>

            {loading ? (
              <li style={{ padding: '0 16px', color: '#94a3b8' }}>
                <Loader2 size={16} className="spinner" style={{ display: 'inline', marginRight: '8px' }} /> 
                Loading...
              </li>
            ) : businesses.map(business => (
              <li key={business.id}>
                <Link to={`/business/${business.id}`}>
                  <Store size={20} />
                  {business.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="loading-container">
                <Sparkles size={48} color="#6366f1" />
                <h1>Welcome back!</h1>
                <p>Select a dashboard from the sidebar to get started.</p>
              </div>
            } />
            <Route path="/superadmin" element={<SuperadminDashboard />} />
            <Route path="/business/:businessId" element={<BusinessDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
