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
    index: true 
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
  role: { 
    type: String, 
    enum: ['super_admin', 'owner', 'manager', 'staff', 'trainer', 'receptionist'],
    required: true 
  },
  
  // Multi-tenancy
  businessId: { 
    type: String, 
    required: true,
    index: true 
  },
  
  // For staff: which branches they belong to (future)
  branchIds: [{ type: String }],
  
  // Permissions (granular, overrides role defaults)
  permissions: [{
    resource: String,      // 'members', 'payments', 'reports'
    actions: [String]      // ['read', 'write', 'delete']
  }],
  
  // Staff-specific
  staffDetails: {
    employeeId: String,
    designation: String,
    salary: Number,
    commissionRate: { type: Number, default: 0 },
    joinDate: Date,
    documents: [{ type: String }],  // Cloudinary URLs
    bio: String,
    specialties: [String],   // For trainers: "weight_loss", "bodybuilding"
    availability: [{
      day: String,
      start: String,
      end: String
    }]
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

userSchema.index({ businessId: 1, role: 1 });
userSchema.index({ phone: 1, businessId: 1 }, { unique: true });