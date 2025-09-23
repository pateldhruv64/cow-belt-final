const express = require('express');
const router = express.Router();
const {
  getTemperatureTrends,
  getMotionAnalysis,
  getDiseaseAccuracy,
  getHourlyPatterns,
  getHealthRiskAssessment
} = require('../controllers/analyticsController');

// Analytics endpoints
router.get('/temperature-trends', getTemperatureTrends);    // GET /api/analytics/temperature-trends
router.get('/motion-analysis', getMotionAnalysis);          // GET /api/analytics/motion-analysis
router.get('/disease-accuracy', getDiseaseAccuracy);        // GET /api/analytics/disease-accuracy
router.get('/hourly-patterns', getHourlyPatterns);          // GET /api/analytics/hourly-patterns
router.get('/health-risk', getHealthRiskAssessment);        // GET /api/analytics/health-risk

module.exports = router;


