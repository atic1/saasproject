const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
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
  description: String,
  
  // Pricing
  pricing: {
    basePrice: { type: Number, required: true },
    currency: { type: String, default: 'NPR' },
    taxInclusive: { type: Boolean, default: false }
  },
  
  // Duration
  duration: {
    value: { type: Number, required: true },
    unit: { 
      type: String, 
      enum: ['day', 'week', 'month', 'year'],
      default: 'month'
    }
  },
  
  // Features included
  features: [{
    name: String,
    included: { type: Boolean, default: true },
    limit: Number,           // e.g., "2 PT sessions", null = unlimited
    description: String
  }],
  
  // Display
  display: {
    order: { type: Number, default: 0 },
    color: String,
    badge: String,           // "Popular", "Best Value"
    isHighlighted: { type: Boolean, default: false }
  },
  
  // Limits
  limits: {
    maxMembers: Number,      // null = unlimited
    currentMembers: { type: Number, default: 0 }
  },
  
  // Rules
  rules: {
    allowFreeze: { type: Boolean, default: true },
    freezeDays: { type: Number, default: 15 },
    allowTransfer: { type: Boolean, default: false },
    cancellationPolicy: String
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);