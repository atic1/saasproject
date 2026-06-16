require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/business');
const Booking = require('./models/booking');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB for Seeding...");

        // Clear existing data to avoid duplicates on multiple runs
        await Business.deleteMany({});
        await Booking.deleteMany({});
        console.log("Cleared existing data.");

        // Create Businesses
        const b1 = await Business.create({
            slug: "fitzone-gym",
            name: "FitZone Gym",
            type: "gym",
            status: "active",
            subscription: { plan: "pro", status: "active" },
            contact: { phone: "9811111111", city: "kathmandu" }
        });

        const b2 = await Business.create({
            slug: "smile-dental",
            name: "Smile Dental Clinic",
            type: "clinic",
            status: "active",
            subscription: { plan: "growth", status: "active" },
            contact: { phone: "9822222222", city: "pokhara" }
        });

        const b3 = await Business.create({
            slug: "glow-beauty",
            name: "Glow Beauty Salon",
            type: "salon",
            status: "active",
            subscription: { plan: "starter", status: "active" },
            contact: { phone: "9833333333", city: "lalitpur" }
        });

        // Create Bookings
        // Note: Using new mongoose.Types.ObjectId() for customerId since we don't have customers seeded yet.
        await Booking.create([
            {
                businessId: b2._id,
                customerId: new mongoose.Types.ObjectId(),
                customerName: "John Doe",
                type: "appointment",
                date: new Date("2026-05-10"),
                startTime: "10:00",
                endTime: "11:00",
                status: "confirmed"
            },
            {
                businessId: b3._id,
                customerId: new mongoose.Types.ObjectId(),
                customerName: "Jane Smith",
                type: "service",
                date: new Date("2026-05-11"),
                startTime: "14:00",
                endTime: "15:00",
                status: "pending"
            },
            {
                businessId: b1._id,
                customerId: new mongoose.Types.ObjectId(),
                customerName: "Mike Ross",
                type: "class",
                date: new Date("2026-05-12"),
                startTime: "06:00",
                endTime: "07:00",
                status: "confirmed"
            }
        ]);

        console.log("Database seeded successfully with dummy businesses and bookings!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();