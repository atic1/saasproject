const mongoose = require('mongoose');

const businessMemberSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Business reference
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },

  // Role inside this business (tenant-scoped RBAC)
  role: {
    type: String,
    enum: [
      'owner',
      'manager',
      'trainer',
      'doctor',
      'stylist',
      'receptionist',
      'staff',
      'customer'
    ],
    required: true
  },

  // Membership status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  // Flexible permissions override (future-proof RBAC)
  permissions: [
    {
      resource: String,
      actions: [String]
    }
  ],

  // When user joined this business
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate membership per tenant
businessMemberSchema.index(
  { userId: 1, businessId: 1 },
  { unique: true }
);

module.exports = mongoose.model('BusinessMember', businessMemberSchema);