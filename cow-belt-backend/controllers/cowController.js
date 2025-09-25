const CowData = require('../models/CowData');
const Alert = require('../models/Alert');
const { predictDisease, predictDiseaseAdvanced } = require('../utils/diseasePredictor');
const { mlAnalytics } = require('../utils/mlAnalytics');
const { notificationService } = require('../utils/notificationService');

// POST: ESP32 data receive + prediction
const addCowData = async (req, res) => {
  try {
    const { cowId, temperature, motionChange, pitch, roll, humidity, deviceId, batteryLevel } = req.body;

    // Use advanced disease prediction
    const predictionResult = predictDiseaseAdvanced(temperature, motionChange, humidity, pitch, roll);
    
    // Detect anomalies using ML
    const anomalies = mlAnalytics.detectAnomalies({
      temperature,
      motionChange,
      pitch,
      roll,
      humidity
    });
    
    // Generate health insights
    const insights = mlAnalytics.generateHealthInsights({
      temperature,
      motionChange,
      disease: predictionResult.disease
    });

    const newData = new CowData({
      cowId,
      temperature,
      motionChange,
      pitch,
      roll,
      humidity,
      disease: predictionResult.disease,
      healthScore: predictionResult.confidence * 100,
      riskLevel: predictionResult.riskLevel,
      deviceInfo: {
        deviceId: deviceId || null,
        batteryLevel: batteryLevel || null
      },
      dataQuality: {
        isValid: predictionResult.confidence > 0.5,
        confidence: predictionResult.confidence,
        anomalies: anomalies.map(a => a.type)
      }
    });

    await newData.save();
    
    // Create alerts for critical conditions
    if (predictionResult.riskLevel === 'Critical' || predictionResult.riskLevel === 'High') {
      const alertData = {
        type: 'Health',
        severity: predictionResult.riskLevel === 'Critical' ? 'Critical' : 'High',
        cowId: cowId,
        message: `Health issue detected: ${predictionResult.disease}`,
        value: predictionResult.disease
      };
      
      // Create alert in database
      // const newAlert = new Alert({
      //   type: alertData.type,
      //   severity: alertData.severity,
      //   source: { cowId: cowId },
      //   title: `Health Alert - Cow ${cowId}`,
      //   description: `Health issue detected: ${predictionResult.disease}`,
      //   message: alertData.message,
      //   data: {
      //     temperature,
      //     motionChange,
      //     healthScore: predictionResult.confidence * 100,
      //     customData: { disease: predictionResult.disease, confidence: predictionResult.confidence }
      //   }
      // });
      
      // await newAlert.save();
      
// Check for duplicate alert
const lastAlert = await Alert.findOne({
  'source.cowId': cowId,
  'data.customData.disease': predictionResult.disease
}).sort({ createdAt: -1 }); // latest alert pehle

let isDuplicate = false;

if (lastAlert) {
  isDuplicate = 
    lastAlert.severity === (predictionResult.riskLevel === 'Critical' ? 'Critical' : 'High') &&
    lastAlert.title === `Health Alert - Cow ${cowId}` &&
    lastAlert.description === `Health issue detected: ${predictionResult.disease}` &&
    lastAlert.message === alertData.message;
}

if (isDuplicate) {
  // console.log('⚠️ Duplicate alert detected. Not saving.');
} else {
  const newAlert = new Alert({
    type: alertData.type,
    severity: predictionResult.riskLevel === 'Critical' ? 'Critical' : 'High',
    source: { cowId: cowId },
    title: `Health Alert - Cow ${cowId}`,
    description: `Health issue detected: ${predictionResult.disease}`,
    message: alertData.message,
    data: {
      temperature,
      motionChange,
      healthScore: predictionResult.confidence * 100,
      customData: { disease: predictionResult.disease, confidence: predictionResult.confidence }
    }
  });

  await newAlert.save();
  // console.log('✅ Alert saved to MongoDB');
}





      // Send notification
      // await notificationService.sendNotification({
      //   ...alertData,
      //   timestamp: newData.timestamp
      // });
    }
    
    // Create alerts for anomalies
    if (anomalies.length > 0) {
      for (const anomaly of anomalies) {
        if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
          const newAlert = new Alert({
            type: anomaly.type.includes('temperature') ? 'Temperature' : 'Motion',
            severity: anomaly.severity === 'critical' ? 'Critical' : 'High',
            source: { cowId: cowId },
            title: `Anomaly Alert - Cow ${cowId}`,
            description: anomaly.message,
            message: anomaly.message,
            data: {
              temperature,
              motionChange,
              customData: { anomalyType: anomaly.type, value: anomaly.value }
            }
          });
          
          await newAlert.save();
          
          // Send notification
          // await notificationService.sendNotification({
          //   type: anomaly.type.includes('temperature') ? 'temperature' : 'activity',
          //   severity: anomaly.severity,
          //   cowId: cowId,
          //   message: anomaly.message,
          //   value: anomaly.value,
          //   timestamp: newData.timestamp
          // });
        }
      }
    }
    
    if (process.env.NODE_ENV !== "production") {
  console.log("📡 Advanced data saved:", data);
}

    res.status(200).json({ 
      message: "Data saved successfully", 
      disease: predictionResult.disease,
      confidence: predictionResult.confidence,
      riskLevel: predictionResult.riskLevel,
      anomalies: anomalies,
      insights: insights,
      algorithm: predictionResult.algorithm
    });
  } catch (err) {
    console.error("❌ Error saving cow data:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET: Last 10 records
const getLastCowData = async (req, res) => {
  try {
    const data = await CowData.find().sort({ timestamp: -1 }).limit(10);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: All cow data with pagination
const getAllCowData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const data = await CowData.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await CowData.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Data by specific cow ID
const getCowDataById = async (req, res) => {
  try {
    const { cowId } = req.params;
    const data = await CowData.find({ cowId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    if (data.length === 0) {
      return res.status(404).json({ error: "No data found for this cow" });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Statistics and analytics
const getCowStatistics = async (req, res) => {
  try {
    const totalRecords = await CowData.countDocuments();
    
    // Get unique cows
    const uniqueCows = await CowData.distinct('cowId');
    const totalCows = uniqueCows.length;

    // Health statistics
    const healthyCount = await CowData.countDocuments({ disease: "Normal" });
    const feverCount = await CowData.countDocuments({ disease: "Fever" });
    const heatCount = await CowData.countDocuments({ disease: "Heat / High Fever" });
    const stressCount = await CowData.countDocuments({ disease: "Stress / Unusual Movement" });

    // Temperature statistics
    const tempStats = await CowData.aggregate([
      {
        $group: {
          _id: null,
          avgTemp: { $avg: "$temperature" },
          minTemp: { $min: "$temperature" },
          maxTemp: { $max: "$temperature" },
          avgMotion: { $avg: "$motionChange" }
        }
      }
    ]);

    // Recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await CowData.countDocuments({
      timestamp: { $gte: last24Hours }
    });

    // Temperature distribution
    const tempDistribution = await CowData.aggregate([
      {
        $bucket: {
          groupBy: "$temperature",
          boundaries: [0, 35, 37, 40, 50],
          default: "Other",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.status(200).json({
      overview: {
        totalRecords,
        totalCows,
        recentActivity24h: recentActivity
      },
      health: {
        healthy: healthyCount,
        fever: feverCount,
        heat: heatCount,
        stress: stressCount,
        healthPercentage: totalRecords > 0 ? ((healthyCount / totalRecords) * 100).toFixed(2) : 0
      },
      temperature: {
        average: tempStats[0]?.avgTemp?.toFixed(2) || 0,
        minimum: tempStats[0]?.minTemp || 0,
        maximum: tempStats[0]?.maxTemp || 0,
        averageMotion: tempStats[0]?.avgMotion?.toFixed(2) || 0
      },
      distribution: tempDistribution,
      uniqueCows: uniqueCows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Data by date range
const getCowDataByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, cowId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const query = {
      timestamp: {
        $gte: start,
        $lte: end
      }
    };

    if (cowId) {
      query.cowId = cowId;
    }

    const data = await CowData.find(query).sort({ timestamp: -1 });
    
    res.status(200).json({
      data,
      count: data.length,
      dateRange: { startDate, endDate },
      cowId: cowId || "All"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Health alerts
const getHealthAlerts = async (req, res) => {
  try {
    const alerts = [];

    // High temperature alerts
    const highTempCows = await CowData.find({ temperature: { $gt: 40 } })
      .sort({ timestamp: -1 })
      .limit(10);

    // Low temperature alerts
    const lowTempCows = await CowData.find({ temperature: { $lt: 35 } })
      .sort({ timestamp: -1 })
      .limit(10);

    // Disease alerts
    const diseaseCows = await CowData.find({ 
      disease: { $ne: "Normal" } 
    }).sort({ timestamp: -1 }).limit(10);

    // Inactive cows (low motion)
    const inactiveCows = await CowData.find({ 
      motionChange: { $lt: 10 } 
    }).sort({ timestamp: -1 }).limit(10);

    // Format alerts
    highTempCows.forEach(cow => {
      alerts.push({
        type: "temperature",
        severity: "high",
        cowId: cow.cowId,
        message: `High temperature: ${cow.temperature}°C`,
        timestamp: cow.timestamp,
        value: cow.temperature
      });
    });

    lowTempCows.forEach(cow => {
      alerts.push({
        type: "temperature",
        severity: "medium",
        cowId: cow.cowId,
        message: `Low temperature: ${cow.temperature}°C`,
        timestamp: cow.timestamp,
        value: cow.temperature
      });
    });

    diseaseCows.forEach(cow => {
      alerts.push({
        type: "health",
        severity: cow.disease === "Heat / High Fever" ? "high" : "medium",
        cowId: cow.cowId,
        message: `Health issue: ${cow.disease}`,
        timestamp: cow.timestamp,
        value: cow.disease
      });
    });

    inactiveCows.forEach(cow => {
      alerts.push({
        type: "activity",
        severity: "low",
        cowId: cow.cowId,
        message: `Low activity: ${cow.motionChange}`,
        timestamp: cow.timestamp,
        value: cow.motionChange
      });
    });

    // Sort by severity and timestamp
    alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.status(200).json({
      alerts: alerts.slice(0, 20), // Return top 20 alerts
      summary: {
        high: alerts.filter(a => a.severity === "high").length,
        medium: alerts.filter(a => a.severity === "medium").length,
        low: alerts.filter(a => a.severity === "low").length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Delete old data (cleanup)
const deleteOldData = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await CowData.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} records older than ${days} days`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  addCowData, 
  getLastCowData, 
  getAllCowData,
  getCowDataById,
  getCowStatistics,
  getCowDataByDateRange,
  getHealthAlerts,
  deleteOldData
};