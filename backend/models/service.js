const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // duration in minutes
    required: true
  },
  price: {
    type: Number, // base cost
    required: true
  },
  capacity: {
    type: Number, // how many bookings can overlap (e.g. for gym classes)
    default: 1
  },
  type: {
    type: String,
    enum: ['gym_class', 'salon_service', 'clinic_consultation', 'general'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

serviceSchema.index({ businessId: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
