
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BusinessRegistration from './pages/BusinessRegistration';
import SuperadminDashboard from './pages/SuperadminDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import PlansManagement from './pages/PlansManagement';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<BusinessRegistration />} />
        <Route path="/dashboard" element={<SuperadminDashboard />} />
        <Route path="/admin/:businessId" element={<BusinessDashboard />} />
        <Route path="/admin/:businessId/plans" element={<PlansManagement />} />

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-center px-4 pt-16">
      <div className="text-8xl mb-6">🏔️</div>
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">404 – Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">This page got lost in the visit again.</p>
      <a
        href="/"
        className="px-7 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5"
      >
        Go Home
      </a>
    </div>

  )
}


export default App;
