// Centralized API base URL — reads from VITE_API_URL env variable.
// In development: set VITE_API_URL in frontend/.env
// In production: set VITE_API_URL in your deployment environment (e.g., Render)
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
