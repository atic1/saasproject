const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  businessId: { 
    type: String, 
    required: true,
    index: true 
  },
  
  // Who
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userRole: String,
  
  // What
  action: { 
    type: String, 
    enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'payment'],
    required: true 
  },
  resource: { 
    type: String, 
    enum: ['business', 'customer', 'plan', 'payment', 'booking', 'staff', 'setting', 'report'],
    required: true 
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  
  // Details
  description: String,
  oldValues: mongoose.Schema.Types.Mixed,
  newValues: mongoose.Schema.Types.Mixed,
  
  // Context
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

auditLogSchema.index({ businessId: 1, timestamp: -1 });
auditLogSchema.index({ businessId: 1, userId: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);