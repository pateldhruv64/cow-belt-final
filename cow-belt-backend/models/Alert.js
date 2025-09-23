const mongoose = require('mongoose');

// Alert Management Schema
const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    unique: true,
    trim: true,
    maxlength: [50, 'Alert ID cannot exceed 50 characters'],
    index: true,
    default: function () {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `ALERT-${timestamp}-${random}`.toUpperCase();
    }
  },
  
  // Alert Information
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: {
      values: [
        'Temperature', 'Motion', 'Health', 'Device', 'System', 
        'Battery', 'Signal', 'Maintenance', 'Security', 'Other'
      ],
      message: 'Invalid alert type'
    }
  },
  
  severity: {
    type: String,
    required: [true, 'Alert severity is required'],
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Invalid alert severity'
    },
    default: 'Medium'
  },
  
  status: {
    type: String,
    enum: {
      values: ['Active', 'Acknowledged', 'Resolved', 'Dismissed', 'Escalated'],
      message: 'Invalid alert status'
    },
    default: 'Active'
  },
  
  // Source Information
  source: {
    cowId: {
      type: String,
      trim: true,
      maxlength: [50, 'Cow ID cannot exceed 50 characters'],
      default: null
    },
    deviceId: {
      type: String,
      trim: true,
      maxlength: [100, 'Device ID cannot exceed 100 characters'],
      default: null
    },
    farmId: {
      type: String,
      trim: true,
      maxlength: [50, 'Farm ID cannot exceed 50 characters'],
      default: null
    }
  },
  
  // Alert Details
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Alert title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    trim: true,
    maxlength: [1000, 'Alert description cannot exceed 1000 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [500, 'Alert message cannot exceed 500 characters']
  },
  
  // Alert Data
  data: {
    temperature: {
      type: Number,
      default: null
    },
    motionChange: {
      type: Number,
      default: null
    },
    batteryLevel: {
      type: Number,
      default: null
    },
    signalStrength: {
      type: Number,
      default: null
    },
    healthScore: {
      type: Number,
      default: null
    },
    customData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  
  // Thresholds
  thresholds: {
    temperature: {
      min: {
        type: Number,
        default: null
      },
      max: {
        type: Number,
        default: null
      }
    },
    motionChange: {
      min: {
        type: Number,
        default: null
      },
      max: {
        type: Number,
        default: null
      }
    },
    batteryLevel: {
      min: {
        type: Number,
        default: null
      }
    },
    signalStrength: {
      min: {
        type: Number,
        default: null
      }
    }
  },
  
  // Response & Actions
  actions: [{
    actionType: {
      type: String,
      enum: ['Notification', 'Email', 'SMS', 'System Action', 'Manual Intervention', 'Escalation'],
      required: true
    },
    performedBy: {
      type: String,
      trim: true,
      maxlength: [100, 'Performer name cannot exceed 100 characters'],
      default: 'System'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    result: {
      type: String,
      trim: true,
      maxlength: [500, 'Action result cannot exceed 500 characters'],
      default: null
    },
    success: {
      type: Boolean,
      default: true
    }
  }],
  
  // Escalation
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: {
      type: Date,
      default: null
    },
    escalatedTo: {
      type: String,
      trim: true,
      maxlength: [100, 'Escalated to cannot exceed 100 characters'],
      default: null
    },
    escalationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Escalation reason cannot exceed 500 characters'],
      default: null
    }
  },
  
  // Acknowledgment
  acknowledgment: {
    isAcknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: String,
      trim: true,
      maxlength: [100, 'Acknowledged by cannot exceed 100 characters'],
      default: null
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    acknowledgmentNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Acknowledgment note cannot exceed 500 characters'],
      default: null
    }
  },
  
  // Resolution
  resolution: {
    isResolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: String,
      trim: true,
      maxlength: [100, 'Resolved by cannot exceed 100 characters'],
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution note cannot exceed 1000 characters'],
      default: null
    },
    resolutionTime: {
      type: Number, // in minutes
      default: null
    }
  },
  
  // Notification Settings
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    smsSent: {
      type: Boolean,
      default: false
    },
    pushSent: {
      type: Boolean,
      default: false
    },
    lastNotificationSent: {
      type: Date,
      default: null
    },
    notificationCount: {
      type: Number,
      min: [0, 'Notification count cannot be negative'],
      default: 0
    }
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  priority: {
    type: Number,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10'],
    default: 5
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date,
    default: null,
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true,
  collection: 'alerts'
});

// Indexes for better query performance
alertSchema.index({ alertId: 1 });
alertSchema.index({ type: 1, severity: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ 'source.cowId': 1 });
alertSchema.index({ 'source.deviceId': 1 });
alertSchema.index({ 'source.farmId': 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ priority: -1 });
alertSchema.index({ expiresAt: 1 });

// Pre-save middleware
alertSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set expiration date for low priority alerts (30 days)
  if (this.severity === 'Low' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Calculate resolution time if resolved
  if (this.resolution.isResolved && this.resolution.resolvedAt && !this.resolution.resolutionTime) {
    const resolutionTime = Math.round((this.resolution.resolvedAt - this.createdAt) / (1000 * 60));
    this.resolution.resolutionTime = resolutionTime;
  }
  
  next();
});

// Virtual for alert age in minutes
alertSchema.virtual('ageInMinutes').get(function() {
  return Math.round((Date.now() - this.createdAt.getTime()) / (1000 * 60));
});

// Virtual for alert age in hours
alertSchema.virtual('ageInHours').get(function() {
  return Math.round((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60));
});

// Virtual for is urgent
alertSchema.virtual('isUrgent').get(function() {
  return this.severity === 'Critical' || 
         (this.severity === 'High' && this.ageInHours > 1) ||
         (this.severity === 'Medium' && this.ageInHours > 4);
});

// Instance methods
alertSchema.methods.acknowledge = function(acknowledgedBy, note) {
  this.acknowledgment.isAcknowledged = true;
  this.acknowledgment.acknowledgedBy = acknowledgedBy;
  this.acknowledgment.acknowledgedAt = new Date();
  this.acknowledgment.acknowledgmentNote = note;
  this.status = 'Acknowledged';
  return this.save();
};

alertSchema.methods.resolve = function(resolvedBy, note) {
  this.resolution.isResolved = true;
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedAt = new Date();
  this.resolution.resolutionNote = note;
  this.status = 'Resolved';
  
  // Calculate resolution time
  const resolutionTime = Math.round((this.resolution.resolvedAt - this.createdAt) / (1000 * 60));
  this.resolution.resolutionTime = resolutionTime;
  
  return this.save();
};

alertSchema.methods.escalate = function(escalatedTo, reason) {
  this.escalation.isEscalated = true;
  this.escalation.escalatedAt = new Date();
  this.escalation.escalatedTo = escalatedTo;
  this.escalation.escalationReason = reason;
  this.status = 'Escalated';
  return this.save();
};

alertSchema.methods.addAction = function(actionType, performedBy, result, success = true) {
  this.actions.push({
    actionType,
    performedBy,
    performedAt: new Date(),
    result,
    success
  });
  return this.save();
};

// Static methods
alertSchema.statics.getActiveAlerts = function() {
  return this.find({ status: 'Active' }).sort({ priority: -1, createdAt: -1 });
};

alertSchema.statics.getCriticalAlerts = function() {
  return this.find({ severity: 'Critical', status: { $ne: 'Resolved' } }).sort({ createdAt: -1 });
};

alertSchema.statics.getAlertsByType = function(type) {
  return this.find({ type: type }).sort({ createdAt: -1 });
};

alertSchema.statics.getAlertsByCow = function(cowId) {
  return this.find({ 'source.cowId': cowId }).sort({ createdAt: -1 });
};

alertSchema.statics.getAlertsByFarm = function(farmId) {
  return this.find({ 'source.farmId': farmId }).sort({ createdAt: -1 });
};

alertSchema.statics.getUnresolvedAlerts = function() {
  return this.find({ status: { $in: ['Active', 'Acknowledged', 'Escalated'] } }).sort({ priority: -1, createdAt: -1 });
};

alertSchema.statics.getAlertStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        activeAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        criticalAlerts: {
          $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] }
        },
        resolvedAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
        },
        averageResolutionTime: { $avg: '$resolution.resolutionTime' }
      }
    }
  ]);
};

module.exports = mongoose.model("Alert", alertSchema);


