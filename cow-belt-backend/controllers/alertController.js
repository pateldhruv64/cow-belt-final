const Alert = require('../models/Alert');
// const { notificationService } = require('../utils/notificationService');

// POST: Create new alert
const createAlert = async (req, res) => {
  try {
    const { 
      type, 
      severity, 
      cowId, 
      deviceId, 
      farmId, 
      title, 
      description, 
      message, 
      data 
    } = req.body;

    // Validate required fields
    if (!type || !severity || !title || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, severity, title, message' 
      });
    }

    // Create new alert
    const newAlert = new Alert({
      type,
      severity,
      source: {
        cowId: cowId || null,
        deviceId: deviceId || null,
        farmId: farmId || null
      },
      title,
      description: description || message,
      message,
      data: data || {}
    });

    await newAlert.save();

    // Send notification
    // const notificationResult = await notificationService.sendNotification({
    //   type,
    //   severity,
    //   cowId,
    //   message,
    //   value: data?.temperature || data?.motionChange || data?.value,
    //   timestamp: newAlert.timestamp
    // });

    console.log(`🚨 Alert created: ${newAlert.alertId} - ${newAlert.title}`);

    res.status(201).json({
      message: 'Alert created successfully',
      alert: newAlert,
      notification: notificationResult
    });
  } catch (err) {
    console.error('❌ Error creating alert:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET: Get all alerts with filtering
const getAlerts = async (req, res) => {
  try {
    const { 
      status, 
      severity, 
      type, 
      cowId, 
      farmId, 
      limit = 50, 
      page = 1 
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (cowId) query['source.cowId'] = cowId;
    if (farmId) query['source.farmId'] = farmId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get alerts
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      alerts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('❌ Error fetching alerts:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET: Get active alerts
const getActiveAlerts = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const alerts = await Alert.find({ status: 'Active' })
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      activeAlerts: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error fetching active alerts:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET: Get critical alerts
const getCriticalAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ 
      severity: 'Critical', 
      status: { $ne: 'Resolved' } 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      criticalAlerts: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error fetching critical alerts:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT: Acknowledge alert
const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy, acknowledgmentNote } = req.body;

    if (!acknowledgedBy) {
      return res.status(400).json({ error: 'acknowledgedBy is required' });
    }

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Acknowledge alert
    alert.acknowledge(acknowledgedBy, acknowledgmentNote);
    await alert.save();

    console.log(`✅ Alert acknowledged: ${alertId} by ${acknowledgedBy}`);

    res.status(200).json({
      message: 'Alert acknowledged successfully',
      alert: alert
    });
  } catch (err) {
    console.error('❌ Error acknowledging alert:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT: Resolve alert
const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolvedBy, resolutionNote } = req.body;

    if (!resolvedBy) {
      return res.status(400).json({ error: 'resolvedBy is required' });
    }

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Resolve alert
    alert.resolve(resolvedBy, resolutionNote);
    await alert.save();

    console.log(`✅ Alert resolved: ${alertId} by ${resolvedBy}`);

    res.status(200).json({
      message: 'Alert resolved successfully',
      alert: alert
    });
  } catch (err) {
    console.error('❌ Error resolving alert:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT: Escalate alert
const escalateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { escalatedTo, escalationReason } = req.body;

    if (!escalatedTo) {
      return res.status(400).json({ error: 'escalatedTo is required' });
    }

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Escalate alert
    alert.escalate(escalatedTo, escalationReason);
    await alert.save();

    // Send escalation notification
    await notificationService.sendNotification({
      type: 'escalation',
      severity: 'high',
      cowId: alert.source.cowId,
      message: `Alert escalated to ${escalatedTo}: ${escalationReason}`,
      value: alert.alertId,
      timestamp: new Date()
    });

    console.log(`⬆️ Alert escalated: ${alertId} to ${escalatedTo}`);

    res.status(200).json({
      message: 'Alert escalated successfully',
      alert: alert
    });
  } catch (err) {
    console.error('❌ Error escalating alert:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET: Alert statistics
const getAlertStatistics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get statistics using aggregation
    const stats = await Alert.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalAlerts: { $sum: 1 },
          activeAlerts: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          acknowledgedAlerts: {
            $sum: { $cond: [{ $eq: ['$status', 'Acknowledged'] }, 1, 0] }
          },
          resolvedAlerts: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          criticalAlerts: {
            $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] }
          },
          highPriorityAlerts: {
            $sum: { $cond: [{ $eq: ['$severity', 'High'] }, 1, 0] }
          },
          avgResolutionTime: { $avg: '$resolution.resolutionTime' }
        }
      }
    ]);

    // Get alerts by type
    const alertsByType = await Alert.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get alerts by severity
    const alertsBySeverity = await Alert.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      period: `${days} days`,
      overview: stats[0] || {
        totalAlerts: 0,
        activeAlerts: 0,
        acknowledgedAlerts: 0,
        resolvedAlerts: 0,
        criticalAlerts: 0,
        highPriorityAlerts: 0,
        avgResolutionTime: 0
      },
      byType: alertsByType,
      bySeverity: alertsBySeverity,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error fetching alert statistics:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Delete old alerts
const deleteOldAlerts = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Alert.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: 'Resolved'
    });

    console.log(`🗑️ Deleted ${result.deletedCount} old resolved alerts`);

    res.status(200).json({
      message: `Deleted ${result.deletedCount} old resolved alerts`,
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate
    });
  } catch (err) {
    console.error('❌ Error deleting old alerts:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getActiveAlerts,
  getCriticalAlerts,
  acknowledgeAlert,
  resolveAlert,
  escalateAlert,
  getAlertStatistics,
  deleteOldAlerts
};


