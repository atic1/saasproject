const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    required: true,
    trim: true   // e.g. "Strength & Conditioning", "Yoga", "CrossFit"
  },
  experience: {
    type: String,
    default: ''  // e.g. "5+ Years", "3 Years"
  },
  bio: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

trainerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('Trainer', trainerSchema);
