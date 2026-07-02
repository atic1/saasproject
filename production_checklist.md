# Production Deployment Checklist

Use this checklist to verify that all configurations and security measures are correctly implemented before going live.

---

## 1. Environment & Configuration
- [ ] `.env` files are created on the host servers for both frontend and backend.
- [ ] No `.env` files containing actual passwords, secrets, or keys are committed to version control.
- [ ] `JWT_SECRET` is set to a long, cryptographically strong random string.
- [ ] Database credentials (`MONGO_URI` or `MONGO_URL`) use a dedicated user account with minimal required privileges.
- [ ] `PORT` is verified to not clash with other background processes.

---

## 2. CORS & Network Security
- [ ] `CORS_ORIGIN` is configured to only permit requests from verified production domains (avoiding wildcard `*` in production).
- [ ] API routes are protected behind HTTPS/SSL.
- [ ] Helmet middleware is loaded in Express (`app.use(helmet())` is confirmed in `server.js`).
- [ ] Rate limiting is activated to protect endpoints against brute force and DDoS attacks.
- [ ] Local server port is blocked by firewall (e.g., UFW `sudo ufw deny 5000`) and only accessible through Nginx proxy.

---

## 3. Frontend & Build Assets
- [ ] Frontend build compiled successfully using `npm run build`.
- [ ] Build outputs are placed in the `dist/` directory.
- [ ] Frontend assets (JS, CSS, images) are served with correct MIME types and aggressive caching headers in Nginx configuration.
- [ ] The client booking portal link uses dynamic `window.location.origin` in `DashboardHome.jsx`.

---

## 4. Payment Provider Callbacks
- [ ] `API_URL` is set to the public-facing API endpoint on the production server (e.g., `https://api.my-app.com`) to allow payment gateway callbacks.
- [ ] eSewa, Khalti, or other gateway credentials are substituted with live production values in the database/environment variables.
- [ ] Success and failure redirects are verified to target the correct front-end page URLs.

---

## 5. Verification Scenarios
- [ ] **Authentication**: Register a new user, log in, verify JWT cookie/header is passed and stored safely.
- [ ] **Bookings**: Create, edit, and cancel bookings to confirm database read/write queries work correctly.
- [ ] **Payments**: Execute a test payment transaction with Sandbox mode to verify signature verification and status update callbacks.
- [ ] **Tenant Isolation**: Confirm that a user from gym A cannot view plans or bookings belonging to gym B.
