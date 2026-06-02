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

module.exports = {
    registerBusiness
};
