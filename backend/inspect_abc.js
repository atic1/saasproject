require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Business = require('./models/business');
const Service = require('./models/service');
const BusinessMember = require('./models/businessMember');
const Availability = require('./models/availability');
const Booking = require('./models/booking');
const Customer = require('./models/customer');
const Invoice = require('./models/invoice');

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB.");

    const business = await Business.findOne({ slug: 'abc' });
    console.log("Business abc:", business);

    if (business) {
      const services = await Service.find({ businessId: business._id });
      console.log("Services for abc:", services);

      const members = await BusinessMember.find({ businessId: business._id }).populate('userId');
      console.log("BusinessMembers for abc:", members);

      const availability = await Availability.find({ businessId: business._id });
      console.log("Availability for abc:", availability);

      const bookings = await Booking.find({ businessId: business._id });
      console.log("Bookings for abc:", bookings);

      const customers = await Customer.find({ businessId: business._id });
      console.log("Customers for abc:", customers);

      const invoices = await Invoice.find({ businessId: business._id });
      console.log("Invoices for abc:", invoices);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

inspect();
