const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  businessId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true 
  },
  
  // Transaction details
  transactionId: { 
    type: String, 
    required: true,
    unique: true 
  },
  transaction_uuid: {
    type: String,
    unique: true,
    sparse: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: false,
    index: true
  },
  
  // Who paid
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  customerPhone: String,
  
  // What for
  type: { 
    type: String, 
    enum: ['membership', 'booking', 'product', 'service', 'late_fee', 'refund', 'other'],
    required: true 
  },
  referenceId: mongoose.Schema.Types.ObjectId,  // Link to plan, booking, order
  referenceType: String,
  description: String,
  
  // Amount
  amount: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'NPR' }
  },
  
  // Breakdown
  breakdown: {
    originalAmount: Number,
    offerApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    offerName: String,
    discountAmount: Number,
    taxRate: Number,
    taxAmount: Number
  },
  
  // Payment method
  method: { 
    type: String, 
    enum: ['esewa', 'khalti', 'fonepay', 'cash', 'bank_transfer', 'card', 'wallet', 'mock'],
    required: true 
  },
  gatewayResponse: mongoose.Schema.Types.Mixed,  // Raw response from gateway
  provider: {
    type: String,
    enum: ['esewa', 'khalti', 'fonepay', 'cash', 'mock'],
    default: 'mock'
  },
  signature: String,
  provider_status: String,
  callback_data: mongoose.Schema.Types.Mixed,
  verified_at: Date,
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'initiated', 'completed', 'failed', 'refunded', 'disputed'],
    default: 'pending'
  },
  
  // For subscriptions
  isRecurring: { type: Boolean, default: false },
  recurringPeriod: String,
  
  // Receipt
  receipt: {
    number: String,
    url: String,
    generatedAt: Date
  },
  
  // Audit
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // For cash
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  refundedAt: Date,
  refundReason: String
});

paymentSchema.index({ businessId: 1, status: 1 });
paymentSchema.index({ businessId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
