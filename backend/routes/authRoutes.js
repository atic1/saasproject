const express = require('express');
const router = express.Router();
const Business = require('../models/business');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Hardcoded demo logic as requested
        if (username === 'admin' && password === 'admin123') {
            
            // Find "FitZone Gym" to act as the demo business
            const demoBusiness = await Business.findOne({ slug: 'fitzone-gym' });
            
            if (!demoBusiness) {
                // If it wasn't found, find the first available business
                const anyBusiness = await Business.findOne({});
                if (!anyBusiness) {
                    return res.status(404).json({ success: false, message: "No businesses exist in the database. Please run seed.js first." });
                }
                return res.json({ 
                    success: true, 
                    role: 'owner', 
                    businessId: anyBusiness._id,
                    businessName: anyBusiness.name
                });
            }

            return res.json({ 
                success: true, 
                role: 'owner', 
                businessId: demoBusiness._id,
                businessName: demoBusiness.name
            });
        }

        // Incorrect credentials
        return res.status(401).json({ success: false, message: "Invalid username or password" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
