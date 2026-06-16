const Business = require('../models/business');

const registerBusiness = async (req, res) => {
    try {
        const {
            name, type, description, 
            phone, email, city, address, 
            panVat, registrationNumber, establishedYear, 
            booking, customerPortal, posBilling
        } = req.body;

        // Ensure required fields
        if (!name || !type || !phone || !city) {
            return res.status(400).json({ message: "Name, type, phone, and city are required." });
        }

        // Generate a slug from the name
        let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        if (!baseSlug) baseSlug = 'business';
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure unique slug
        while (await Business.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const newBusiness = new Business({
            slug,
            name,
            type,
            ownerId: req.user?._id || req.body.ownerId || "60d000000000000000000001", // Fallback if no user context
            branding: {
                description
            },
            contact: {
                phone,
                email,
                city,
                address
            },
            details: {
                panVat,
                registrationNumber,
                establishedYear: establishedYear ? parseInt(establishedYear) : null
            },
            features: {
                booking: !!booking,
                customerPortal: !!customerPortal,
                posBilling: !!posBilling
            }
        });

        await newBusiness.save();
        res.status(201).json({ message: "Business registered successfully", business: newBusiness });
    } catch (error) {
        console.error("Error registering business:", error);
        res.status(500).json({ message: "Failed to register business", error: error.message });
    }
};

const getCurrentBusiness = async (req, res) => {
    try {
        if (!req.activeBusiness) {
            return res.status(404).json({ message: "Business not found in active context" });
        }
        res.json(req.activeBusiness);
    } catch (error) {
        console.error("Error fetching active business:", error);
        res.status(500).json({ message: "Failed to fetch business details", error: error.message });
    }
};

const updateCurrentBusiness = async (req, res) => {
    try {
        if (!req.activeBusinessId) {
            return res.status(400).json({ message: "Business context missing" });
        }

        const allowedFields = [
            'name', 'type', 'branding', 'contact', 'details', 'timings', 'settings', 'features', 'seo'
        ];

        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        // Handle flat legacy fields sent by frontend if any
        if (req.body.businessName) {
            updates.name = req.body.businessName;
        }

        updates.updatedAt = new Date();

        const updatedBusiness = await Business.findByIdAndUpdate(
            req.activeBusinessId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedBusiness) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.json({ message: "Business details updated successfully", business: updatedBusiness });
    } catch (error) {
        console.error("Error updating active business:", error);
        res.status(500).json({ message: "Failed to update business details", error: error.message });
    }
};

module.exports = {
    registerBusiness,
    getCurrentBusiness,
    updateCurrentBusiness
};
