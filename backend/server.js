const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

console.log('Loaded MONGO_URL:', !!process.env.MONGO_URL);

app.use(cors());
app.use(express.json());

// ========================
// ROUTES
// ========================
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const selectBusinessRoutes = require('./routes/select-business');

// Middleware
const { enforceTenant } = require('./middleware/tenantIsolation');

// ========================
// PUBLIC ROUTES
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/auth', selectBusinessRoutes);

// ========================
// TENANT / BUSINESS ROUTES
// ========================
app.use('/api/dashboard', enforceTenant, dashboardRoutes);
app.use('/api/customers', customerRoutes);

// ========================
// CORE ROUTES
// ========================
app.use('/api/businesses', require('./routes/businessRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));

// Health check
app.get("/", (req, res) => {
  res.send("Server running...");
});

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB Error:", err);
  });