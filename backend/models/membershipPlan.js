const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true,
    trim: true   // e.g. "1 Month", "3 Months", "1 Year"
  },
  description: {
    type: String,
    default: ''
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

membershipPlanSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
