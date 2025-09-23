const mongoose = require('mongoose');

// Cow Profile Schema for managing individual cow information
const cowSchema = new mongoose.Schema({
  cowId: {
    type: String,
    required: [true, 'Cow ID is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Cow ID cannot exceed 50 characters'],
    index: true
  },
  
  // Basic Information
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Cow name cannot exceed 100 characters'],
    default: null
  },
  
  breed: {
    type: String,
    trim: true,
    maxlength: [50, 'Breed name cannot exceed 50 characters'],
    default: null
  },
  
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [30, 'Age cannot exceed 30 years'],
    default: null
  },
  
  weight: {
    type: Number,
    min: [100, 'Weight too low (minimum 100 kg)'],
    max: [1000, 'Weight too high (maximum 1000 kg)'],
    default: null
  },
  
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'],
    default: 'Unknown'
  },
  
  // Health Information
  healthStatus: {
    type: String,
    enum: ['Healthy', 'Sick', 'Recovering', 'Critical', 'Unknown'],
    default: 'Healthy'
  },
  
  lastHealthCheck: {
    type: Date,
    default: null
  },
  
  vaccinationHistory: [{
    vaccineName: {
      type: String,
      required: true,
      trim: true
    },
    dateGiven: {
      type: Date,
      required: true
    },
    nextDue: {
      type: Date,
      default: null
    },
    veterinarian: {
      type: String,
      trim: true,
      default: null
    }
  }],
  
  medicalHistory: [{
    condition: {
      type: String,
      required: true,
      trim: true
    },
    diagnosisDate: {
      type: Date,
      required: true
    },
    treatment: {
      type: String,
      trim: true,
      default: null
    },
    recovered: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true,
      default: null
    }
  }],
  
  // Location & Management
  location: {
    farm: {
      type: String,
      trim: true,
      maxlength: [100, 'Farm name cannot exceed 100 characters'],
      default: null
    },
    pen: {
      type: String,
      trim: true,
      maxlength: [50, 'Pen name cannot exceed 50 characters'],
      default: null
    },
    coordinates: {
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
    }
  },
  
  // Device Information
  deviceInfo: {
    deviceId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: [100, 'Device ID cannot exceed 100 characters']
    },
    deviceType: {
      type: String,
      enum: ['ESP32', 'Arduino', 'Raspberry Pi', 'Custom', 'Unknown'],
      default: 'Unknown'
    },
    firmwareVersion: {
      type: String,
      trim: true,
      maxlength: [20, 'Firmware version cannot exceed 20 characters'],
      default: null
    },
    lastSeen: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Performance Metrics
  performance: {
    milkProduction: {
      dailyAverage: {
        type: Number,
        min: [0, 'Milk production cannot be negative'],
        default: 0
      },
      lastRecorded: {
        type: Date,
        default: null
      }
    },
    feedConsumption: {
      dailyAverage: {
        type: Number,
        min: [0, 'Feed consumption cannot be negative'],
        default: 0
      },
      lastRecorded: {
        type: Date,
        default: null
      }
    },
    activityLevel: {
      dailyAverage: {
        type: Number,
        min: [0, 'Activity level cannot be negative'],
        default: 0
      },
      lastRecorded: {
        type: Date,
        default: null
      }
    }
  },
  
  // Breeding Information
  breeding: {
    isPregnant: {
      type: Boolean,
      default: false
    },
    pregnancyDate: {
      type: Date,
      default: null
    },
    expectedDelivery: {
      type: Date,
      default: null
    },
    lastBreeding: {
      type: Date,
      default: null
    },
    breedingHistory: [{
      date: {
        type: Date,
        required: true
      },
      bullId: {
        type: String,
        trim: true,
        default: null
      },
      success: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: null
  },
  
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Sold', 'Deceased', 'Unknown'],
    default: 'Active'
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
  }
}, {
  timestamps: true,
  collection: 'cows'
});

// Indexes for better query performance
cowSchema.index({ cowId: 1 });
cowSchema.index({ 'deviceInfo.deviceId': 1 });
cowSchema.index({ healthStatus: 1 });
cowSchema.index({ status: 1 });
cowSchema.index({ 'location.farm': 1 });
cowSchema.index({ createdAt: -1 });

// Pre-save middleware
cowSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate name if not provided
  if (!this.name) {
    this.name = `Cow-${this.cowId}`;
  }
  
  next();
});

// Virtual for age in months
cowSchema.virtual('ageInMonths').get(function() {
  if (!this.age) return null;
  return Math.round(this.age * 12);
});

// Virtual for device status
cowSchema.virtual('deviceStatus').get(function() {
  if (!this.deviceInfo.deviceId) return 'No Device';
  if (!this.deviceInfo.isActive) return 'Inactive';
  
  const lastSeen = this.deviceInfo.lastSeen;
  if (!lastSeen) return 'Unknown';
  
  const hoursSinceLastSeen = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastSeen < 1) return 'Online';
  if (hoursSinceLastSeen < 24) return 'Recently Active';
  if (hoursSinceLastSeen < 72) return 'Inactive';
  return 'Offline';
});

// Instance methods
cowSchema.methods.isHealthy = function() {
  return this.healthStatus === 'Healthy';
};

cowSchema.methods.needsAttention = function() {
  return this.healthStatus === 'Sick' || this.healthStatus === 'Critical';
};

cowSchema.methods.getHealthSummary = function() {
  return {
    cowId: this.cowId,
    name: this.name,
    healthStatus: this.healthStatus,
    lastHealthCheck: this.lastHealthCheck,
    isHealthy: this.isHealthy(),
    needsAttention: this.needsAttention(),
    deviceStatus: this.deviceStatus
  };
};

cowSchema.methods.addVaccination = function(vaccineName, dateGiven, nextDue, veterinarian) {
  this.vaccinationHistory.push({
    vaccineName,
    dateGiven,
    nextDue,
    veterinarian
  });
  return this.save();
};

cowSchema.methods.addMedicalRecord = function(condition, diagnosisDate, treatment, notes) {
  this.medicalHistory.push({
    condition,
    diagnosisDate,
    treatment,
    notes
  });
  return this.save();
};

// Static methods
cowSchema.statics.getHealthyCows = function() {
  return this.find({ healthStatus: 'Healthy', status: 'Active' });
};

cowSchema.statics.getSickCows = function() {
  return this.find({ healthStatus: { $in: ['Sick', 'Critical'] } });
};

cowSchema.statics.getCowsByFarm = function(farmName) {
  return this.find({ 'location.farm': farmName, status: 'Active' });
};

cowSchema.statics.getCowsByBreed = function(breed) {
  return this.find({ breed: breed, status: 'Active' });
};

cowSchema.statics.getPregnantCows = function() {
  return this.find({ 'breeding.isPregnant': true, status: 'Active' });
};

cowSchema.statics.getCowsNeedingVaccination = function() {
  const today = new Date();
  return this.find({
    status: 'Active',
    'vaccinationHistory.nextDue': { $lte: today }
  });
};

cowSchema.statics.getDeviceStatus = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$deviceInfo.isActive',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model("Cow", cowSchema);


