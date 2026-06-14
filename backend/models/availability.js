const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: {
    type: String, // format: "HH:MM"
    required: true
  },
  endTime: {
    type: String, // format: "HH:MM"
    required: true
  },
  capacity: {
    type: Number,
    default: 1
  }
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // can be null for general business/room availability
    index: true
  },
  dayOfWeek: {
    type: String,
    enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    required: true
  },
  slots: [slotSchema],
  dateOverride: {
    type: Date, // If set, this availability applies to this specific date override
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true // useful to block out holidays (isAvailable=false)
  }
}, {
  timestamps: true
});

// Enforce unique availability per business per day per staff/override
availabilitySchema.index({ businessId: 1, staffId: 1, dayOfWeek: 1, dateOverride: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
