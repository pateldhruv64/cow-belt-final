const express = require('express');
const router = express.Router();
const { 
  addCowData, 
  getLastCowData, 
  getAllCowData,
  getCowDataById,
  getCowStatistics,
  getCowDataByDateRange,
  getHealthAlerts,
  deleteOldData
} = require('../controllers/cowController');

// ESP32 sensor data endpoint (unchanged - main route)
router.post('/', addCowData);

// Basic data endpoints
router.get('/', getLastCowData);                    // GET /api/cow/data - Last 10 records
router.get('/all', getAllCowData);                  // GET /api/cow/data/all - All data with pagination

// Analytics endpoints
router.get('/statistics', getCowStatistics);        // GET /api/cow/data/statistics - Farm analytics
router.get('/alerts', getHealthAlerts);             // GET /api/cow/data/alerts - Health alerts

// Filtering endpoints
router.get('/cow/:cowId', getCowDataById);          // GET /api/cow/data/cow/:cowId - Data by cow ID
router.get('/range', getCowDataByDateRange);        // GET /api/cow/data/range - Data by date range

// Maintenance endpoints
router.delete('/cleanup', deleteOldData);           // DELETE /api/cow/data/cleanup - Delete old data

module.exports = router;