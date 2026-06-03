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

  // Role inside THIS business (NOT platform role)
  role: {
    type: String,
    enum: ['owner', 'manager', 'staff', 'trainer', 'receptionist'],
    required: true
  },

  // Status inside business
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  // Permissions override (optional future expansion)
  permissions: [
    {
      resource: String,
      actions: [String]
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate membership
businessMemberSchema.index(
  { userId: 1, businessId: 1 },
  { unique: true }
);

module.exports = mongoose.model('BusinessMember', businessMemberSchema);