
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

console.log('Loaded MONGO_URL:', !!process.env.MONGO_URL);

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/businesses', require('./routes/businessRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

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