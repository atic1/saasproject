const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Identity
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: true,
    match: /^98\d{8}$/,
    unique: true 
  },
  email: { 
    type: String, 
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8 
  },
  
  // Role & Access
  platformrole: { 
    type: String, 
    enum: ['super_admin', 'customer'],
    default: 'customer'
  },
  
  // Multi-tenancy
  businessId: { 
    type: String, 
    required: false,
    index: true 
  },
  

  // Security
  lastLogin: {
    at: Date,
    ip: String,
    device: String
  },

  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // 2FA (future)
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'],
    default: 'active' 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
