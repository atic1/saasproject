const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Multi-tenancy
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
  
  // Identity
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: true,
    match: /^98\d{8}$/ 
  },
  email: String,
  dateOfBirth: Date,
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  photo: String,            // Cloudinary URL
  
  // Address
  address: {
    street: String,
    city: String,
    landmark: String
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  
  // Medical (especially for gyms/clinics)
  medicalInfo: {
    bloodGroup: { 
      type: String, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
    },
    allergies: [String],
    conditions: [String],     // "diabetes", "asthma", "back_pain"
    medications: [String],
    lastCheckup: Date,
    notes: String
  },
  
  // Membership / Relationship
  membership: {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'frozen', 'cancelled', 'pending'],
      default: 'pending'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false }
  },
  
  // For gyms: physical stats
  stats: {
    height: Number,           // cm
    weight: Number,           // kg
    bmi: Number,
    bodyFat: Number,
    measurements: [{
      date: Date,
      chest: Number,
      waist: Number,
      hips: Number,
      arms: Number,
      thighs: Number
    }]
  },
  
  // Engagement
  engagement: {
    totalVisits: { type: Number, default: 0 },
    lastVisit: Date,
    streakDays: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now },
    source: { 
      type: String, 
      enum: ['walk_in', 'referral', 'facebook', 'instagram', 'google', 'friend'],
      default: 'walk_in'
    },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
  },
  
  // Communication preferences
  preferences: {
    sms: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    language: { 
      type: String, 
      enum: ['en', 'ne'], 
      default: 'en' 
    }
  },
  
  // QR Code for check-in
  qrCode: {
    code: String,
    generatedAt: Date
  },
  
  // Notes
  internalNotes: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active' 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

customerSchema.index({ businessId: 1, phone: 1 }, { unique: true });
customerSchema.index({ businessId: 1, 'membership.status': 1 });
customerSchema.index({ businessId: 1, 'engagement.lastVisit': -1 });

module.exports = mongoose.model('Customer', customerSchema);