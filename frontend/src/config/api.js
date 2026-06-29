// Centralized API base URL — reads from VITE_API_BASE env variable.
// In development: set VITE_API_BASE in frontend/.env
// In production: set VITE_API_BASE in your deployment environment (e.g., Render)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default API_BASE;
