const mongoose = require('mongoose');

// Enhanced CowData Schema with validation and new fields
const cowDataSchema = new mongoose.Schema({
  cowId: {
    type: String,
    required: [true, 'Cow ID is required'],
    trim: true,
    maxlength: [50, 'Cow ID cannot exceed 50 characters'],
    index: true
  },
  
  // Sensor Data
  temperature: {
    type: Number,
    required: [true, 'Temperature is required'],
    min: [20, 'Temperature too low (minimum 20°C)'],
    max: [50, 'Temperature too high (maximum 50°C)'],
    validate: {
      validator: function(v) {
        return v >= 20 && v <= 50;
      },
      message: 'Temperature must be between 20°C and 50°C'
    }
  },
  
  motionChange: {
    type: Number,
    required: [true, 'Motion change is required'],
    min: [0, 'Motion change cannot be negative'],
    max: [10000, 'Motion change too high (maximum 10000)']
  },
  
  pitch: {
    type: Number,
    required: [true, 'Pitch is required'],
    min: [-180, 'Pitch cannot be less than -180°'],
    max: [180, 'Pitch cannot be more than 180°']
  },
  
  roll: {
    type: Number,
    required: [true, 'Roll is required'],
    min: [-180, 'Roll cannot be less than -180°'],
    max: [180, 'Roll cannot be more than 180°']
  },
  
  // Additional sensor fields
  humidity: {
    type: Number,
    min: [0, 'Humidity cannot be negative'],
    max: [100, 'Humidity cannot exceed 100%'],
    default: null
  },
  
  location: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
      default: null
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
      default: null
    }
  },
  
  // Health & Prediction Data
  disease: {
    type: String,
    required: [true, 'Disease prediction is required'],
    enum: {
      values: ['Normal', 'Fever', 'Heat / High Fever', 'Low Fever / Hypothermia', 'Stress / Unusual Movement', 'Unknown'],
      message: 'Invalid disease prediction value'
    },
    default: 'Normal'
  },
  
  healthScore: {
    type: Number,
    min: [0, 'Health score cannot be negative'],
    max: [100, 'Health score cannot exceed 100'],
    default: 100
  },
  
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  
  // Device Information
  deviceInfo: {
    deviceId: {
      type: String,
      trim: true,
      maxlength: [100, 'Device ID cannot exceed 100 characters']
    },
    firmwareVersion: {
      type: String,
      trim: true,
      maxlength: [20, 'Firmware version cannot exceed 20 characters']
    },
    batteryLevel: {
      type: Number,
      min: [0, 'Battery level cannot be negative'],
      max: [100, 'Battery level cannot exceed 100%'],
      default: null
    },
    signalStrength: {
      type: Number,
      min: [-120, 'Signal strength too low'],
      max: [0, 'Signal strength cannot be positive'],
      default: null
    }
  },
  
  // Data Quality & Validation
  dataQuality: {
    isValid: {
      type: Boolean,
      default: true
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be negative'],
      max: [1, 'Confidence cannot exceed 1'],
      default: 1.0
    },
    anomalies: [{
      type: String,
      enum: ['Temperature Spike', 'Temperature Drop', 'Motion Anomaly', 'Sensor Drift', 'Communication Error', 'Data Inconsistency', 'None']
    }]
  },
  
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'cow_data'
});

// Indexes for better query performance
cowDataSchema.index({ cowId: 1, timestamp: -1 });
cowDataSchema.index({ timestamp: -1 });
cowDataSchema.index({ disease: 1 });
cowDataSchema.index({ riskLevel: 1 });
cowDataSchema.index({ 'deviceInfo.deviceId': 1 });

// Pre-save middleware to update timestamps and calculate health score
cowDataSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate health score based on temperature and motion
  if (this.temperature && this.motionChange) {
    let score = 100;
    
    // Temperature scoring (0-40 points deduction)
    if (this.temperature > 40) score -= 40;
    else if (this.temperature > 38) score -= 20;
    else if (this.temperature < 35) score -= 30;
    else if (this.temperature < 37) score -= 10;
    
    // Motion scoring (0-20 points deduction)
    if (this.motionChange < 10) score -= 20;
    else if (this.motionChange > 100) score -= 10;
    
    // Disease scoring (0-40 points deduction)
    if (this.disease !== 'Normal') {
      if (this.disease === 'Heat / High Fever') score -= 40;
      else if (this.disease === 'Fever') score -= 30;
      else if (this.disease === 'Low Fever / Hypothermia') score -= 25;
      else if (this.disease === 'Stress / Unusual Movement') score -= 20;
    }
    
    this.healthScore = Math.max(0, score);
    
    // Determine risk level
    if (this.healthScore >= 80) this.riskLevel = 'Low';
    else if (this.healthScore >= 60) this.riskLevel = 'Medium';
    else if (this.healthScore >= 40) this.riskLevel = 'High';
    else this.riskLevel = 'Critical';
  }
  
  next();
});

// Virtual for formatted timestamp
cowDataSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Virtual for temperature status
cowDataSchema.virtual('temperatureStatus').get(function() {
  if (this.temperature > 40) return 'Critical';
  if (this.temperature > 38) return 'High';
  if (this.temperature < 35) return 'Low';
  return 'Normal';
});

// Virtual for motion status
cowDataSchema.virtual('motionStatus').get(function() {
  if (this.motionChange > 100) return 'Very Active';
  if (this.motionChange > 50) return 'Active';
  if (this.motionChange < 10) return 'Inactive';
  return 'Normal';
});

// Instance methods
cowDataSchema.methods.isHealthy = function() {
  return this.disease === 'Normal' && this.healthScore >= 80;
};

cowDataSchema.methods.needsAttention = function() {
  return this.riskLevel === 'High' || this.riskLevel === 'Critical';
};

cowDataSchema.methods.getHealthSummary = function() {
  return {
    cowId: this.cowId,
    healthScore: this.healthScore,
    riskLevel: this.riskLevel,
    disease: this.disease,
    temperature: this.temperature,
    temperatureStatus: this.temperatureStatus,
    motionStatus: this.motionStatus,
    isHealthy: this.isHealthy(),
    needsAttention: this.needsAttention(),
    timestamp: this.timestamp
  };
};

// Static methods
cowDataSchema.statics.getHealthyCows = function() {
  return this.find({ disease: 'Normal', healthScore: { $gte: 80 } });
};

cowDataSchema.statics.getSickCows = function() {
  return this.find({ disease: { $ne: 'Normal' } });
};

cowDataSchema.statics.getHighRiskCows = function() {
  return this.find({ riskLevel: { $in: ['High', 'Critical'] } });
};

cowDataSchema.statics.getAverageHealthScore = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        avgHealthScore: { $avg: '$healthScore' },
        minHealthScore: { $min: '$healthScore' },
        maxHealthScore: { $max: '$healthScore' }
      }
    }
  ]);
};

module.exports = mongoose.model("CowData", cowDataSchema);