
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

console.log('Loaded MONGO_URL:', !!process.env.MONGO_URL);

const app = express();

app.use(cors());
app.use(express.json());

// Tenant isolation middleware: ensures each request has a valid business context
const { enforceTenant } = require('./middleware/tenantIsolation');

const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const selectBusinessRoutes = require('./routes/select-business');

// Apply tenant isolation only to dashboard routes
app.use('/api/dashboard', enforceTenant, dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', selectBusinessRoutes);
app.get("/", (req, res) => {
    res.send("Server running...");
});

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