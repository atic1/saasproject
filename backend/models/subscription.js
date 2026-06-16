const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'free_trial', 'starter', 'growth', 'pro', 'enterprise'],
    default: 'free_trial'
  },
  status: {
    type: String,
    enum: ['trial', 'active', 'past_due', 'suspended', 'cancelled'],
    default: 'trial'
  },
  limits: {
    users: Number,
    customers: Number,
    bookingsPerMonth: Number,
    notificationsPerMonth: Number
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  trialEnds: Date,
  autoRenew: { type: Boolean, default: true },
  cancelledAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

subscriptionSchema.index({ businessId: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
