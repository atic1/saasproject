const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

console.log("Loaded MONGO_URL:", !!process.env.MONGO_URL);

app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

//
// ========================
// IMPORT ROUTES
// ========================
//
const customerRoutes = require("./routes/customerRoutes");
const businessRoutes = require("./routes/businessRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const planRoutes = require("./routes/planRoutes");
const offerRoutes = require("./routes/offerRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const billingRoutes = require("./routes/billingRoutes");
const authRoutes = require("./routes/authRoutes");
const selectBusinessRoutes = require("./routes/selectBusiness");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const portalRoutes = require("./routes/portalRoutes");
const superadminRoutes = require("./routes/superadminRoutes");
const gymWebsiteRoutes = require("./routes/gymWebsiteRoutes");

const { auditTenantRequest } = require("./middleware/auditMiddleware");

app.use(auditTenantRequest);

//
// ========================
// ROUTE MOUNTING
// ========================
//
app.use("/api/businesses", businessRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", selectBusinessRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/portal", portalRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api", gymWebsiteRoutes);
//
app.get("/", (req, res) => {
  res.send("Server running...");
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

//
// ========================
// START SERVER
// ========================
//
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB Error:", err);
  });
