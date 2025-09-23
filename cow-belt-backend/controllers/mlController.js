const CowData = require('../models/CowData');
const { mlAnalytics } = require('../utils/mlAnalytics');

// GET: ML-based health analysis for specific cow
const getMLHealthAnalysis = async (req, res) => {
  try {
    const { cowId, days = 7 } = req.query;
    
    if (!cowId) {
      return res.status(400).json({ error: 'Cow ID is required' });
    }

    // Get historical data for the cow
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const historicalData = await CowData.find({
      cowId: cowId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    if (historicalData.length === 0) {
      return res.status(404).json({ error: 'No data found for this cow' });
    }

    // Perform ML analysis
    const temperatureAnalysis = mlAnalytics.analyzeTemperatureTrends(historicalData);
    const motionAnalysis = mlAnalytics.analyzeMotionPatterns(historicalData);
    const healthAnalysis = mlAnalytics.analyzeHealth(historicalData);

    res.status(200).json({
      cowId,
      period: `${days} days`,
      dataPoints: historicalData.length,
      analysis: {
        temperature: temperatureAnalysis,
        motion: motionAnalysis,
        health: healthAnalysis
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Anomaly detection for all cows
const detectAnomalies = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Get recent data
    const recentData = await CowData.find({
      timestamp: { $gte: startTime }
    }).sort({ timestamp: -1 });

    const anomalies = [];

    // Analyze each cow's data
    const cowGroups = recentData.reduce((acc, data) => {
      if (!acc[data.cowId]) acc[data.cowId] = [];
      acc[data.cowId].push(data);
      return acc;
    }, {});

    Object.entries(cowGroups).forEach(([cowId, cowData]) => {
      const latestData = cowData[0]; // Most recent data
      const detectedAnomalies = mlAnalytics.detectAnomalies(latestData);
      
      if (detectedAnomalies.length > 0) {
        anomalies.push({
          cowId,
          timestamp: latestData.timestamp,
          anomalies: detectedAnomalies,
          data: {
            temperature: latestData.temperature,
            motionChange: latestData.motionChange,
            disease: latestData.disease
          }
        });
      }
    });

    res.status(200).json({
      period: `${hours} hours`,
      totalAnomalies: anomalies.length,
      anomalies: anomalies,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Health insights for all cows
const getHealthInsights = async (req, res) => {
  try {
    const { days = 1 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get recent data
    const recentData = await CowData.find({
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    // Group by cow and get latest data for each
    const latestCowData = recentData.reduce((acc, data) => {
      if (!acc[data.cowId] || data.timestamp > acc[data.cowId].timestamp) {
        acc[data.cowId] = data;
      }
      return acc;
    }, {});

    const insights = [];
    
    Object.values(latestCowData).forEach(cowData => {
      const healthInsights = mlAnalytics.generateHealthInsights(cowData);
      if (healthInsights.length > 0) {
        insights.push({
          cowId: cowData.cowId,
          timestamp: cowData.timestamp,
          insights: healthInsights,
          healthScore: cowData.healthScore,
          riskLevel: cowData.riskLevel
        });
      }
    });

    // Sort by priority (critical first)
    insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aMaxPriority = Math.max(...a.insights.map(i => priorityOrder[i.priority] || 0));
      const bMaxPriority = Math.max(...b.insights.map(i => priorityOrder[i.priority] || 0));
      return bMaxPriority - aMaxPriority;
    });

    res.status(200).json({
      period: `${days} days`,
      totalInsights: insights.length,
      insights: insights,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Predictive analytics
const getPredictiveAnalytics = async (req, res) => {
  try {
    const { cowId, days = 30 } = req.query;
    
    let query = {};
    if (cowId) {
      query.cowId = cowId;
    }

    // Get historical data
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const historicalData = await CowData.find({
      ...query,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    if (historicalData.length === 0) {
      return res.status(404).json({ error: 'No historical data found' });
    }

    // Group by cow for individual predictions
    const cowGroups = historicalData.reduce((acc, data) => {
      if (!acc[data.cowId]) acc[data.cowId] = [];
      acc[data.cowId].push(data);
      return acc;
    }, {});

    const predictions = [];

    Object.entries(cowGroups).forEach(([cowId, cowData]) => {
      const latestData = cowData[cowData.length - 1];
      
      // Temperature prediction
      const tempPrediction = mlAnalytics.analyzeTemperatureTrends(cowData);
      
      // Motion prediction
      const motionPrediction = mlAnalytics.analyzeMotionPatterns(cowData);
      
      // Health prediction
      const healthPrediction = mlAnalytics.analyzeHealth(cowData);

      predictions.push({
        cowId,
        currentData: {
          temperature: latestData.temperature,
          motionChange: latestData.motionChange,
          disease: latestData.disease,
          healthScore: latestData.healthScore,
          riskLevel: latestData.riskLevel
        },
        predictions: {
          temperature: tempPrediction,
          motion: motionPrediction,
          health: healthPrediction
        },
        dataPoints: cowData.length,
        lastUpdate: latestData.timestamp
      });
    });

    res.status(200).json({
      period: `${days} days`,
      totalCows: predictions.length,
      predictions: predictions,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: ML model performance metrics
const getMLPerformance = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get data with predictions
    const recentData = await CowData.find({
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    // Calculate accuracy metrics
    const totalPredictions = recentData.length;
    const correctPredictions = recentData.filter(data => 
      data.disease === 'Normal' && data.healthScore >= 80
    ).length;

    const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    // Calculate confidence distribution
    const confidenceRanges = {
      high: recentData.filter(d => d.dataQuality.confidence > 0.8).length,
      medium: recentData.filter(d => d.dataQuality.confidence > 0.5 && d.dataQuality.confidence <= 0.8).length,
      low: recentData.filter(d => d.dataQuality.confidence <= 0.5).length
    };

    // Calculate risk level distribution
    const riskDistribution = {
      low: recentData.filter(d => d.riskLevel === 'Low').length,
      medium: recentData.filter(d => d.riskLevel === 'Medium').length,
      high: recentData.filter(d => d.riskLevel === 'High').length,
      critical: recentData.filter(d => d.riskLevel === 'Critical').length
    };

    // Calculate disease distribution
    const diseaseDistribution = recentData.reduce((acc, data) => {
      acc[data.disease] = (acc[data.disease] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      period: `${days} days`,
      metrics: {
        totalPredictions,
        accuracy: parseFloat(accuracy.toFixed(2)),
        confidenceDistribution: confidenceRanges,
        riskDistribution: riskDistribution,
        diseaseDistribution: diseaseDistribution
      },
      performance: {
        algorithm: 'Ensemble ML + Rules + Patterns',
        dataQuality: {
          validData: recentData.filter(d => d.dataQuality.isValid).length,
          invalidData: recentData.filter(d => !d.dataQuality.isValid).length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMLHealthAnalysis,
  detectAnomalies,
  getHealthInsights,
  getPredictiveAnalytics,
  getMLPerformance
};


