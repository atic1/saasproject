const mongoose = require('mongoose');

const businessMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },

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

  permissions: [
    {
      resource: String,
      actions: [String]
    }
  ],

  joinedAt: {
    type: Date,
    default: Date.now
  }
});

businessMemberSchema.index({ userId: 1, businessId: 1 }, { unique: true });

module.exports = mongoose.model('BusinessMember', businessMemberSchema);