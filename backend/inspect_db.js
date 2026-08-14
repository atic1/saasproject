require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (e) {}
const mongoose = require('mongoose');
const User = require('./models/user');
const Business = require('./models/business');

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB.");

    const businesses = await Business.find({}, { name: 1, slug: 1 });
    console.log("Businesses in DB:", businesses);

    const users = await User.find({}, { name: 1, email: 1, phone: 1 });
    console.log("Users in DB:", users);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

inspect();
