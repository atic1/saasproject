const mongoose = require('mongoose');

const gymServiceSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true   // e.g. "Personal Training", "Weight Loss", "CrossFit"
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'Dumbbell'   // Lucide icon name for frontend rendering
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

gymServiceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('GymService', gymServiceSchema);
