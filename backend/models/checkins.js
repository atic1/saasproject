const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
  businessId: { 
    type: String, 
    required: true,
    index: true 
  },
  
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true 
  },
  customerName: String,
  
  // Entry details
  timestamp: { type: Date, default: Date.now },
  type: { 
    type: String, 
    enum: ['check_in', 'check_out'],
    default: 'check_in' 
  },
  
  // Method
  method: { 
    type: String, 
    enum: ['qr_scan', 'manual', 'app', 'biometric', 'rfid'],
    default: 'qr_scan' 
  },
  
  // Verification
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceId: String,
  location: {
    lat: Number,
    lng: Number
  },
  
  // Session data
  session: {
    start: Date,
    end: Date,
    duration: Number  // minutes
  },
  
  // Membership validation at entry
  membershipStatus: String,
  feeDue: { type: Boolean, default: false },
  feeDueAmount: Number,
  
  createdAt: { type: Date, default: Date.now }
});

checkinSchema.index({ businessId: 1, timestamp: -1 });
checkinSchema.index({ businessId: 1, customerId: 1, timestamp: -1 });

module.exports = mongoose.model('Checkin', checkinSchema);