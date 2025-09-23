const mongoose = require('mongoose');

// Farm Management Schema
const farmSchema = new mongoose.Schema({
  farmId: {
    type: String,
    required: [true, 'Farm ID is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Farm ID cannot exceed 50 characters'],
    index: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: null
  },
  
  // Location Information
  location: {
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters'],
        default: null
      },
      city: {
        type: String,
        trim: true,
        maxlength: [100, 'City name cannot exceed 100 characters'],
        default: null
      },
      state: {
        type: String,
        trim: true,
        maxlength: [100, 'State name cannot exceed 100 characters'],
        default: null
      },
      country: {
        type: String,
        trim: true,
        maxlength: [100, 'Country name cannot exceed 100 characters'],
        default: null
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: [20, 'ZIP code cannot exceed 20 characters'],
        default: null
      }
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
    },
    timezone: {
      type: String,
      trim: true,
      maxlength: [50, 'Timezone cannot exceed 50 characters'],
      default: 'UTC'
    }
  },
  
  // Farm Details
  farmType: {
    type: String,
    enum: ['Dairy', 'Beef', 'Mixed', 'Organic', 'Commercial', 'Family', 'Unknown'],
    default: 'Unknown'
  },
  
  size: {
    area: {
      type: Number,
      min: [0, 'Area cannot be negative'],
      default: null
    },
    unit: {
      type: String,
      enum: ['acres', 'hectares', 'square_meters', 'square_feet'],
      default: 'acres'
    }
  },
  
  capacity: {
    maxCows: {
      type: Number,
      min: [1, 'Maximum cows must be at least 1'],
      default: null
    },
    currentCows: {
      type: Number,
      min: [0, 'Current cows cannot be negative'],
      default: 0
    }
  },
  
  // Contact Information
  contact: {
    owner: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Owner name cannot exceed 100 characters'],
        default: null
      },
      phone: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters'],
        default: null
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [100, 'Email cannot exceed 100 characters'],
        default: null
      }
    },
    manager: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Manager name cannot exceed 100 characters'],
        default: null
      },
      phone: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters'],
        default: null
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [100, 'Email cannot exceed 100 characters'],
        default: null
      }
    },
    veterinarian: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Veterinarian name cannot exceed 100 characters'],
        default: null
      },
      phone: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters'],
        default: null
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [100, 'Email cannot exceed 100 characters'],
        default: null
      }
    }
  },
  
  // Infrastructure
  infrastructure: {
    pens: [{
      penId: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Pen ID cannot exceed 50 characters']
      },
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Pen name cannot exceed 100 characters'],
        default: null
      },
      capacity: {
        type: Number,
        min: [1, 'Pen capacity must be at least 1'],
        default: 1
      },
      currentCows: {
        type: Number,
        min: [0, 'Current cows cannot be negative'],
        default: 0
      },
      description: {
        type: String,
        trim: true,
        maxlength: [200, 'Pen description cannot exceed 200 characters'],
        default: null
      }
    }],
    milkingFacilities: {
      hasMilkingParlor: {
        type: Boolean,
        default: false
      },
      milkingCapacity: {
        type: Number,
        min: [0, 'Milking capacity cannot be negative'],
        default: 0
      },
      automationLevel: {
        type: String,
        enum: ['Manual', 'Semi-Automatic', 'Fully Automatic', 'Unknown'],
        default: 'Unknown'
      }
    },
    feedStorage: {
      hasFeedStorage: {
        type: Boolean,
        default: false
      },
      capacity: {
        type: Number,
        min: [0, 'Storage capacity cannot be negative'],
        default: 0
      },
      unit: {
        type: String,
        enum: ['tons', 'kg', 'pounds', 'liters', 'gallons'],
        default: 'tons'
      }
    }
  },
  
  // Technology & Monitoring
  technology: {
    hasIoTDevices: {
      type: Boolean,
      default: false
    },
    deviceCount: {
      type: Number,
      min: [0, 'Device count cannot be negative'],
      default: 0
    },
    monitoringSystems: [{
      type: String,
      enum: ['Temperature', 'Motion', 'GPS', 'Milk Production', 'Feed Consumption', 'Health Monitoring', 'Other']
    }],
    dataCollectionFrequency: {
      type: String,
      enum: ['Real-time', 'Every 5 minutes', 'Every 15 minutes', 'Every hour', 'Daily', 'Unknown'],
      default: 'Unknown'
    }
  },
  
  // Performance Metrics
  performance: {
    averageMilkProduction: {
      type: Number,
      min: [0, 'Milk production cannot be negative'],
      default: 0
    },
    averageFeedConsumption: {
      type: Number,
      min: [0, 'Feed consumption cannot be negative'],
      default: 0
    },
    healthScore: {
      type: Number,
      min: [0, 'Health score cannot be negative'],
      max: [100, 'Health score cannot exceed 100'],
      default: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Compliance & Certifications
  compliance: {
    certifications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      issuingBody: {
        type: String,
        trim: true,
        default: null
      },
      issueDate: {
        type: Date,
        required: true
      },
      expiryDate: {
        type: Date,
        default: null
      },
      status: {
        type: String,
        enum: ['Active', 'Expired', 'Pending', 'Revoked'],
        default: 'Active'
      }
    }],
    regulations: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      complianceStatus: {
        type: String,
        enum: ['Compliant', 'Non-Compliant', 'Under Review', 'Unknown'],
        default: 'Unknown'
      },
      lastChecked: {
        type: Date,
        default: null
      }
    }]
  },
  
  // Status & Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance', 'Closed', 'Unknown'],
    default: 'Active'
  },
  
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
  collection: 'farms'
});

// Indexes for better query performance
farmSchema.index({ farmId: 1 });
farmSchema.index({ name: 1 });
farmSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
farmSchema.index({ farmType: 1 });
farmSchema.index({ status: 1 });
farmSchema.index({ createdAt: -1 });

// Pre-save middleware
farmSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate utilization percentage
  if (this.capacity.maxCows && this.capacity.currentCows) {
    this.capacity.utilizationPercentage = Math.round((this.capacity.currentCows / this.capacity.maxCows) * 100);
  }
  
  next();
});

// Virtual for full address
farmSchema.virtual('fullAddress').get(function() {
  const address = this.location.address;
  if (!address) return null;
  
  const parts = [address.street, address.city, address.state, address.country, address.zipCode];
  return parts.filter(part => part).join(', ');
});

// Virtual for capacity utilization
farmSchema.virtual('capacityUtilization').get(function() {
  if (!this.capacity.maxCows || this.capacity.maxCows === 0) return 0;
  return Math.round((this.capacity.currentCows / this.capacity.maxCows) * 100);
});

// Instance methods
farmSchema.methods.isActive = function() {
  return this.status === 'Active';
};

farmSchema.methods.hasCapacity = function() {
  return this.capacity.currentCows < this.capacity.maxCows;
};

farmSchema.methods.addPen = function(penId, name, capacity, description) {
  this.infrastructure.pens.push({
    penId,
    name,
    capacity,
    description
  });
  return this.save();
};

farmSchema.methods.updateCapacity = function(newCount) {
  this.capacity.currentCows = Math.max(0, newCount);
  return this.save();
};

// Static methods
farmSchema.statics.getActiveFarms = function() {
  return this.find({ status: 'Active' });
};

farmSchema.statics.getFarmsByType = function(farmType) {
  return this.find({ farmType: farmType, status: 'Active' });
};

farmSchema.statics.getFarmsNearby = function(latitude, longitude, radiusInKm = 50) {
  return this.find({
    'location.coordinates.latitude': {
      $gte: latitude - (radiusInKm / 111), // Rough conversion: 1 degree ≈ 111 km
      $lte: latitude + (radiusInKm / 111)
    },
    'location.coordinates.longitude': {
      $gte: longitude - (radiusInKm / (111 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (radiusInKm / (111 * Math.cos(latitude * Math.PI / 180)))
    },
    status: 'Active'
  });
};

farmSchema.statics.getFarmStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalFarms: { $sum: 1 },
        activeFarms: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        totalCapacity: { $sum: '$capacity.maxCows' },
        totalCurrentCows: { $sum: '$capacity.currentCows' },
        averageHealthScore: { $avg: '$performance.healthScore' }
      }
    }
  ]);
};

module.exports = mongoose.model("Farm", farmSchema);


