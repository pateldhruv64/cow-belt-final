const express = require('express');
const router = express.Router();
const {
  createAlert,
  getAlerts,
  getActiveAlerts,
  getCriticalAlerts,
  acknowledgeAlert,
  resolveAlert,
  escalateAlert,
  getAlertStatistics,
  deleteOldAlerts
} = require('../controllers/alertController');

// Alert management endpoints
router.post('/', createAlert);                           // POST /api/alerts - Create new alert
router.get('/', getAlerts);                              // GET /api/alerts - Get all alerts with filtering
router.get('/active', getActiveAlerts);                  // GET /api/alerts/active - Get active alerts
router.get('/critical', getCriticalAlerts);              // GET /api/alerts/critical - Get critical alerts
router.get('/statistics', getAlertStatistics);           // GET /api/alerts/statistics - Get alert statistics

// Alert action endpoints
router.put('/:alertId/acknowledge', acknowledgeAlert);   // PUT /api/alerts/:alertId/acknowledge - Acknowledge alert
router.put('/:alertId/resolve', resolveAlert);           // PUT /api/alerts/:alertId/resolve - Resolve alert
router.put('/:alertId/escalate', escalateAlert);         // PUT /api/alerts/:alertId/escalate - Escalate alert

// Maintenance endpoints
router.delete('/cleanup', deleteOldAlerts);              // DELETE /api/alerts/cleanup - Delete old alerts

module.exports = router;


