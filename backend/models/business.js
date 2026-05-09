const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  // Identity
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    lowercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['gym', 'clinic', 'salon', 'shop', 'restaurant', 'hostel', 'tuition', 'rental', 'service']
  },
  
  // Branding
  branding: {
    logo: String,           // Cloudinary URL
    favicon: String,
    primaryColor: { 
      type: String, 
      default: '#3B82F6' 
    },
    secondaryColor: { 
      type: String, 
      default: '#1E40AF' 
    },
    coverImage: String,
    description: String,
    tagline: String
  },
  
  // Contact
  contact: {
    phone: { 
      type: String, 
      required: true,
      match: /^98\d{8}$/ 
    },
    email: String,
    address: String,
    city: { 
      type: String, 
      required: true,
      enum: ['kathmandu', 'pokhara', 'lalitpur', 'bhaktapur', 'biratnagar', 'other']
    },
    mapLink: String,        // Google Maps embed URL
    socialLinks: {
      facebook: String,
      instagram: String,
      tiktok: String
    }
  },
  
  // Business Details
  details: {
    panVat: String,
    registrationNumber: String,
    establishedYear: Number,
    staffCount: { type: Number, default: 0 },
    capacity: { type: Number, default: 50 },
    squareFeet: Number
  },
  
  // Operating Hours
  timings: {
    timezone: { 
      type: String, 
      default: 'Asia/Kathmandu' 
    },
    schedule: [{
      day: { 
        type: String, 
        enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] 
      },
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '05:00' },
      close: { type: String, default: '22:00' },
      slots: [{           // For appointment-based businesses
        start: String,
        end: String,
        maxBookings: Number
      }]
    }],
    holidays: [{           // Custom closed days
      date: Date,
      reason: String
    }]
  },
  
  // Subscription
  subscription: {
    plan: { 
      type: String, 
      enum: ['free_trial', 'starter', 'growth', 'pro', 'enterprise'],
      default: 'free_trial'
    },
    status: { 
      type: String, 
      enum: ['active', 'trial', 'expired', 'suspended', 'cancelled'],
      default: 'trial'
    },
    trialEnds: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    autoRenew: { type: Boolean, default: true },
    paymentMethod: {
      type: { type: String, enum: ['esewa', 'khalti', 'bank', 'cash'] },
      details: mongoose.Schema.Types.Mixed
    }
  },
  
  // Payment Integration (for receiving customer payments)
  paymentGateways: {
    esewa: {
      merchantId: String,
      secretKey: String,
      enabled: { type: Boolean, default: false }
    },
    khalti: {
      publicKey: String,
      secretKey: String,
      enabled: { type: Boolean, default: false }
    },
    fonepay: {
      merchantCode: String,
      enabled: { type: Boolean, default: false }
    }
  },
  
  // Feature Flags
  features: {
    booking: { type: Boolean, default: true },
    inventory: { type: Boolean, default: false },
    staffManagement: { type: Boolean, default: true },
    customerPortal: { type: Boolean, default: true },
    posBilling: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    multiBranch: { type: Boolean, default: false },
    customDomain: { type: Boolean, default: false }
  },
  
  // Custom Domain (premium)
  customDomain: {
    domain: String,         // fitnessnepal.com
    verified: { type: Boolean, default: false },
    sslStatus: { 
      type: String, 
      enum: ['pending', 'active', 'expired'],
      default: 'pending'
    }
  },
  
  // Settings
  settings: {
    language: { 
      type: String, 
      enum: ['en', 'ne'], 
      default: 'en' 
    },
    dateFormat: { 
      type: String, 
      default: 'BS'        // Bikram Sambat for Nepal
    },
    currency: { 
      type: String, 
      default: 'NPR' 
    },
    taxRate: { 
      type: Number, 
      default: 0 
    },                      // VAT percentage
    receiptPrefix: { 
      type: String, 
      default: 'INV' 
    },
    receiptNumber: { 
      type: Number, 
      default: 1000 
    },                      // Auto-increment
    smsNotifications: { 
      type: Boolean, 
      default: true 
    },
    whatsappNotifications: { 
      type: Boolean, 
      default: false 
    }
  },
  
  // SEO / Discovery
  seo: {
    title: String,
    description: String,
    keywords: [String],
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'deleted', 'pending_verification'],
    default: 'pending_verification'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: Date
});

// Indexes
businessSchema.index({ type: 1, city: 1, status: 1 });
businessSchema.index({ 'seo.rating': -1 });


module.exports = mongoose.model('Business', businessSchema);

