const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

console.log("Loaded MONGO_URL:", !!process.env.MONGO_URL);

app.use(cors());
app.use(express.json());

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
const authRoutes = require("./routes/authRoutes");
const selectBusinessRoutes = require("./routes/selectBusiness");

const { enforceTenant } = require("./middleware/tenantIsolation");

//
// ========================
// ROUTE MOUNTING
// ========================
//
app.use("/api/businesses", businessRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", selectBusinessRoutes);
app.use("/api/customers", customerRoutes);

// Dashboard (tenant protected)
app.use("/api/dashboard", enforceTenant, dashboardRoutes);

//
// ========================
// HEALTH CHECK
// ========================
//
app.get("/", (req, res) => {
  res.send("Server running...");
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