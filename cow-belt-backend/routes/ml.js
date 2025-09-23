const express = require('express');
const router = express.Router();
const {
  getMLHealthAnalysis,
  detectAnomalies,
  getHealthInsights,
  getPredictiveAnalytics,
  getMLPerformance
} = require('../controllers/mlController');

// ML Analytics endpoints
router.get('/health-analysis', getMLHealthAnalysis);      // GET /api/ml/health-analysis
router.get('/anomalies', detectAnomalies);                // GET /api/ml/anomalies
router.get('/insights', getHealthInsights);               // GET /api/ml/insights
router.get('/predictions', getPredictiveAnalytics);       // GET /api/ml/predictions
router.get('/performance', getMLPerformance);             // GET /api/ml/performance

module.exports = router;


