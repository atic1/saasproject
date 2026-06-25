const mongoose = require('mongoose');

const gymWebsiteSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true,
    index: true
  },

  // Basic Info (mirrors some Business fields, but editable independently)
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  description: { type: String, default: '' },
  mission: { type: String, default: '' },
  facilities: { type: String, default: '' },

  // Contact
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  mapLink: { type: String, default: '' },

  // Social Links
  socialLinks: {
    facebook:  { type: String, default: '' },
    instagram: { type: String, default: '' },
    tiktok:    { type: String, default: '' },
    youtube:   { type: String, default: '' }
  },

  // Business Hours (one entry per day)
  businessHours: {
    sunday:    { open: { type: String, default: '06:00' }, close: { type: String, default: '21:00' }, isOpen: { type: Boolean, default: false } },
    monday:    { open: { type: String, default: '06:00' }, close: { type: String, default: '21:00' }, isOpen: { type: Boolean, default: true  } },
    tuesday:   { open: { type: String, default: '06:00' }, close: { type: String, default: '21:00' }, isOpen: { type: Boolean, default: true  } },
    wednesday: { open: { type: String, default: '06:00' }, close: { type: String, default: '21:00' }, isOpen: { type: Boolean, default: true  } },
    thursday:  { open: { type: String, default: '06:00' }, close: { type: String, default: '21:00' }, isOpen: { type: Boolean, default: true  } },
    friday:    { open: { type: String, default: '06:00' }, close: { type: String, default: '21:00' }, isOpen: { type: Boolean, default: true  } },
    saturday:  { open: { type: String, default: '06:00' }, close: { type: String, default: '21:00' }, isOpen: { type: Boolean, default: true  } }
  },

  // Toggle public visibility
  isPublished: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

gymWebsiteSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('GymWebsite', gymWebsiteSchema);
