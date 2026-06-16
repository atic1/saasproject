require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/business');
const Service = require('./models/service');
const Availability = require('./models/availability');

const defaultServices = {
  gym: [
    {
      name: "General Gym Pass",
      description: "All-day access to gym floor and standard equipment.",
      duration: 60,
      price: 500,
      capacity: 15,
      type: "gym_class"
    },
    {
      name: "Personal Training Session",
      description: "1-on-1 fitness coaching with a certified trainer.",
      duration: 60,
      price: 1500,
      capacity: 2,
      type: "gym_class"
    }
  ],
  salon: [
    {
      name: "Standard Haircut & Styling",
      description: "Wash, customized cut, blow-dry, and styling.",
      duration: 30,
      price: 500,
      capacity: 2,
      type: "salon_service"
    },
    {
      name: "Luxury Facial & Massage",
      description: "Deep cleansing facial treatment followed by a head and neck massage.",
      duration: 60,
      price: 1200,
      capacity: 1,
      type: "salon_service"
    }
  ],
  clinic: [
    {
      name: "General Consultation",
      description: "General medical health checkup and medical advice.",
      duration: 20,
      price: 600,
      capacity: 1,
      type: "clinic_consultation"
    },
    {
      name: "Diagnostic Blood Test",
      description: "Comprehensive panel checkup including report review.",
      duration: 30,
      price: 1000,
      capacity: 1,
      type: "clinic_consultation"
    }
  ],
  general: [
    {
      name: "Standard Service Consultation",
      description: "Initial consultation session for general service booking.",
      duration: 30,
      price: 500,
      capacity: 1,
      type: "general"
    }
  ]
};

const defaultSlots = [
  { startTime: "09:00", endTime: "10:00", capacity: 1 },
  { startTime: "10:00", endTime: "11:00", capacity: 1 },
  { startTime: "11:00", endTime: "12:00", capacity: 1 },
  { startTime: "12:00", endTime: "13:00", capacity: 1 },
  { startTime: "14:00", endTime: "15:00", capacity: 1 },
  { startTime: "15:00", endTime: "16:00", capacity: 1 },
  { startTime: "16:00", endTime: "17:00", capacity: 1 }
];

const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB.");

    const businesses = await Business.find();
    console.log(`Found ${businesses.length} businesses in total.`);

    for (const biz of businesses) {
      console.log(`Checking business: ${biz.name} (${biz.slug}, type: ${biz.type})...`);

      // Check services
      const servicesCount = await Service.countDocuments({ businessId: biz._id });
      if (servicesCount === 0) {
        console.log(`  Seeding default services for ${biz.name}...`);
        const servicesToCreate = defaultServices[biz.type] || defaultServices.general;
        for (const s of servicesToCreate) {
          await Service.create({
            businessId: biz._id,
            name: s.name,
            description: s.description,
            duration: s.duration,
            price: s.price,
            capacity: s.capacity,
            type: s.type,
            isActive: true
          });
        }
        console.log(`  Seeded ${servicesToCreate.length} services.`);
      } else {
        console.log(`  Already has ${servicesCount} services.`);
      }

      // Check availability
      const availabilityCount = await Availability.countDocuments({ businessId: biz._id });
      if (availabilityCount === 0) {
        console.log(`  Seeding default availability schedule (Mon-Sat, 9AM-5PM) for ${biz.name}...`);
        for (const day of daysOfWeek) {
          await Availability.create({
            businessId: biz._id,
            staffId: null,
            dayOfWeek: day,
            slots: defaultSlots,
            isAvailable: true
          });
        }
        console.log(`  Seeded weekly availability.`);
      } else {
        console.log(`  Already has availability configuration.`);
      }
    }

    console.log("Retroactive seeding successfully completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error during retroactive seeding:", err);
    process.exit(1);
  }
}

run();
