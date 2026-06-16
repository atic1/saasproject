const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  businessId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true 
  },
  
  // Who
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true 
  },
  customerName: String,      // Denormalized for quick display
  customerPhone: String,
  
  // What
  type: { 
    type: String, 
    enum: ['appointment', 'class', 'slot', 'room', 'table', 'service'],
    required: true 
  },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  serviceName: String,
  
  // Staff assigned (for clinics/salons)
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staffName: String,
  
  // When
  date: { type: Date, required: true },
  startTime: { type: String, required: true },  // "09:00"
  endTime: { type: String, required: true },    // "10:00"
  duration: Number,          // minutes, calculated
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'pending'
  },
  
  // Payment
  payment: {
    amount: Number,
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'refunded', 'waived'],
      default: 'pending'
    },
    method: String,
    transactionId: String,
    paidAt: Date
  },
  
  // For paid bookings (clinics/salons)
  advancePayment: {
    required: { type: Boolean, default: false },
    amount: Number,
    paid: { type: Boolean, default: false }
  },
  
  // Reminders sent
  reminders: [{
    channel: { type: String, enum: ['sms', 'whatsapp', 'email'] },
    sentAt: Date,
    status: String
  }],
  
  // Notes
  customerNotes: String,
  staffNotes: String,
  internalNotes: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  cancelledAt: Date,
  cancellationReason: String
});

bookingSchema.index({ businessId: 1, date: 1, startTime: 1 });
bookingSchema.index({ businessId: 1, staffId: 1, date: 1 });
bookingSchema.index({ businessId: 1, customerId: 1, status: 1 });
module.exports = mongoose.model('Booking', bookingSchema);
