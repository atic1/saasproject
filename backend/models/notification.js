const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  businessId: { 
    type: String, 
    required: true,
    index: true 
  },
  
  // Recipient
  recipientType: { 
    type: String, 
    enum: ['customer', 'staff', 'owner'],
    required: true 
  },
  recipientId: mongoose.Schema.Types.ObjectId,
  recipientPhone: String,
  recipientEmail: String,
  
  // Content
  type: { 
    type: String, 
    enum: [
      'fee_reminder', 'fee_due', 'fee_overdue',
      'booking_confirmation', 'booking_reminder', 'booking_cancelled',
      'welcome', 'offer', 'birthday', 'win_back',
      'staff_notice', 'low_stock', 'system_alert'
    ],
    required: true 
  },
  title: String,
  message: String,
  template: String,        // Template ID used
  
  // Delivery
  channel: { 
    type: String, 
    enum: ['sms', 'whatsapp', 'email', 'push', 'in_app'],
    required: true 
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
    default: 'pending' 
  },
  
  // Tracking
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  errorMessage: String,
  
  // Reference
  referenceType: String,
  referenceId: mongoose.Schema.Types.ObjectId,
  
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ businessId: 1, status: 1 });
notificationSchema.index({ businessId: 1, recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);