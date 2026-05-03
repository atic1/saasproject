
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SuperadminDashboard from './pages/SuperadminDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Simple Sidebar Navigation */}
        <nav className="sidebar">
          <h2>SaaS Platform</h2>
          <ul>
            <li><Link to="/superadmin">Superadmin Panel</Link></li>
            <li><Link to="/business/b1">Gym Dashboard (FitZone)</Link></li>
            <li><Link to="/business/b2">Clinic Dashboard (Smile)</Link></li>
            <li><Link to="/business/b3">Salon Dashboard (Glow)</Link></li>
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<h1 style={{padding: '20px'}}>Select a dashboard from the sidebar</h1>} />
            <Route path="/superadmin" element={<SuperadminDashboard />} />
            <Route path="/business/:businessId" element={<BusinessDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
