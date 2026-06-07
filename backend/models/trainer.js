const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  businessId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  photo: String, // Base64 or image URL
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trainer', trainerSchema);
