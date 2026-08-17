// Centralized API base URL
// Reads from VITE_API_URL env variable if set for production (e.g. Render / domain).
// For local development & LAN access (accessing from another PC/phone), dynamically uses current hostname on port 5000.

const envUrl = import.meta.env.VITE_API_URL;

const getApiBase = () => {
  // If VITE_API_URL is set to a production domain (not localhost), use it
  if (envUrl && !envUrl.includes('localhost:5000') && !envUrl.includes('127.0.0.1:5000')) {
    return envUrl;
  }
  // Dynamic hostname fallback: uses PC's IP or domain accessing the frontend
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname;
    return `${protocol}//${host}:5000`;
  }
  return envUrl || 'http://localhost:5000';
};

const API_BASE = getApiBase();

export default API_BASE;

