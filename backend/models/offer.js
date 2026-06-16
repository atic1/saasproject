const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  businessId: { 
    type: String, 
    required: true,
    index: true 
  },
  
  // Basic info
  name: { type: String, required: true },
  description: String,
  code: { 
    type: String, 
    uppercase: true,
    trim: true 
  },                        // null = auto-applied
  
  // Discount logic
  discount: {
    type: { 
      type: String, 
      enum: ['percentage', 'fixed_amount', 'free_trial', 'buy_x_get_y'],
      required: true 
    },
    value: { type: Number, required: true },
    maxDiscount: Number      // cap for percentage discounts
  },
  
  // What it applies to
  applicability: {
    scope: { 
      type: String, 
      enum: ['all_plans', 'specific_plans', 'specific_categories', 'first_time_only'],
      default: 'all_plans'
    },
    planIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
    category: String
  },
  
  // Validity
  validity: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'Asia/Kathmandu' }
  },
  
  // Usage limits
  limits: {
    totalRedemptions: { type: Number, default: 0 },
    maxRedemptions: Number,
    perCustomerLimit: { type: Number, default: 1 },
    minPurchaseAmount: Number
  },
  
  // Current usage
  usage: {
    redeemedCount: { type: Number, default: 0 },
    redeemedBy: [{ 
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
      redeemedAt: Date,
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }]
  },
  
  // Display
  display: {
    badgeText: String,
    badgeColor: String,
    showCountdown: { type: Boolean, default: true },
    bannerImage: String
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'active', 'expired', 'paused', 'disabled'],
    default: 'scheduled'
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);