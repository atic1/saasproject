require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Business = require('./models/business');
const Service = require('./models/service');
const User = require('./models/user');
const BusinessMember = require('./models/businessMember');
const Availability = require('./models/availability');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB.");

    const business = await Business.findOne({ slug: 'abc' });
    if (!business) {
      console.error("Business 'abc' not found. Please register or verify the database.");
      process.exit(1);
    }
    console.log("Found business 'abc' with ID:", business._id);

    // 1. Clear existing Services, BusinessMembers (except owner), Availabilities for 'abc'
    await Service.deleteMany({ businessId: business._id });
    console.log("Cleared existing services for 'abc'.");

    // Remove staff members (role !== owner)
    const ownerMember = await BusinessMember.findOne({ businessId: business._id, role: 'owner' });
    const ownerUserId = ownerMember ? ownerMember.userId : null;

    // Delete BusinessMember records other than owner
    await BusinessMember.deleteMany({ businessId: business._id, role: { $ne: 'owner' } });
    console.log("Cleared non-owner business members for 'abc'.");

    await Availability.deleteMany({ businessId: business._id });
    console.log("Cleared availability for 'abc'.");

    // 2. Create Services
    const s1 = await Service.create({
      businessId: business._id,
      name: "Strength & Conditioning",
      description: "Full body workout targeting strength, hypertrophy, and core stability.",
      duration: 60,
      price: 1000,
      capacity: 5,
      type: "gym_class",
      isActive: true
    });

    const s2 = await Service.create({
      businessId: business._id,
      name: "Cardio Kickboxing",
      description: "High-intensity cardio class blending martial arts techniques with fast-paced music.",
      duration: 45,
      price: 800,
      capacity: 10,
      type: "gym_class",
      isActive: true
    });

    const s3 = await Service.create({
      businessId: business._id,
      name: "Ashtanga Yoga Flow",
      description: "Traditional Ashtanga yoga practice focused on synchronization of breath and movement.",
      duration: 60,
      price: 1200,
      capacity: 8,
      type: "gym_class",
      isActive: true
    });

    console.log("Created services:", [s1.name, s2.name, s3.name]);

    // 3. Create Staff / Trainers
    // Let's check if the trainer users already exist, if so delete them first
    const staffPhones = ["9810101010", "9820202020"];
    await User.deleteMany({ phone: { $in: staffPhones } });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const userRohan = await User.create({
      name: "Rohan Sharma",
      phone: "9810101010",
      email: "rohan@abc.com",
      password: hashedPassword,
      platformrole: "customer",
      status: "active"
    });

    const userSita = await User.create({
      name: "Sita Thapa",
      phone: "9820202020",
      email: "sita@abc.com",
      password: hashedPassword,
      platformrole: "customer",
      status: "active"
    });

    console.log("Created staff users Rohan and Sita");

    // Add them to business members
    const m1 = await BusinessMember.create({
      userId: userRohan._id,
      businessId: business._id,
      role: "trainer",
      status: "active"
    });

    const m2 = await BusinessMember.create({
      userId: userSita._id,
      businessId: business._id,
      role: "trainer",
      status: "active"
    });

    console.log("Linked staff members Rohan and Sita as trainers to 'abc'");

    // 4. Set Availability Slots for Rohan and Sita
    // We will set their schedule for mon, tue, wed, thu, fri, sat
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const slots = [
      { startTime: "07:00", endTime: "08:00", capacity: 2 },
      { startTime: "08:00", endTime: "09:00", capacity: 2 },
      { startTime: "09:00", endTime: "10:00", capacity: 2 },
      { startTime: "10:00", endTime: "11:00", capacity: 2 },
      { startTime: "14:00", endTime: "15:00", capacity: 2 },
      { startTime: "15:00", endTime: "16:00", capacity: 2 },
      { startTime: "16:00", endTime: "17:00", capacity: 2 },
      { startTime: "17:00", endTime: "18:00", capacity: 2 }
    ];

    for (const day of days) {
      // Rohan's availability
      await Availability.create({
        businessId: business._id,
        staffId: userRohan._id,
        dayOfWeek: day,
        slots,
        isAvailable: true
      });

      // Sita's availability
      await Availability.create({
        businessId: business._id,
        staffId: userSita._id,
        dayOfWeek: day,
        slots,
        isAvailable: true
      });

      // General/fallback availability for the business itself (staffId: null)
      await Availability.create({
        businessId: business._id,
        staffId: null,
        dayOfWeek: day,
        slots,
        isAvailable: true
      });
    }

    console.log("Seeded weekly availability (mon-sat) for trainers and fallback business slots.");
    console.log("Seeding complete! Customer Portal is now fully bookable.");

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
