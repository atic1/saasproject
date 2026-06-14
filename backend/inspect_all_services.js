require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/service');
const Business = require('./models/business');
const BusinessMember = require('./models/businessMember');
const User = require('./models/user');
const Availability = require('./models/availability');

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected.");
    const servicesCount = await Service.countDocuments();
    console.log("Total services:", servicesCount);
    if (servicesCount > 0) {
      const services = await Service.find().populate('businessId');
      console.log("Services:", services);
    }
    const membersCount = await BusinessMember.countDocuments();
    console.log("Total business members:", membersCount);
    if (membersCount > 0) {
      const members = await BusinessMember.find().populate('userId').populate('businessId');
      console.log("Members:", members);
    }
    const availabilityCount = await Availability.countDocuments();
    console.log("Total availabilities:", availabilityCount);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
inspect();
