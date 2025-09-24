// Advanced Report Generation System for Cow Health Monitoring
class ReportGenerator {
  constructor() {
    this.reportTypes = {
      HEALTH_SUMMARY: 'health_summary',
      DAILY_REPORT: 'daily_report',
      WEEKLY_REPORT: 'weekly_report',
      MONTHLY_REPORT: 'monthly_report',
      ALERT_REPORT: 'alert_report',
      PERFORMANCE_REPORT: 'performance_report',
      CUSTOM_REPORT: 'custom_report'
    };
    
    this.exportFormats = {
      PDF: 'pdf',
      EXCEL: 'excel',
      CSV: 'csv',
      JSON: 'json'
    };
  }
  
  // Generate health summary report
  async generateHealthSummaryReport(farmId = null, days = 7) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Get cow data
      const CowData = require('../models/CowData');
      const Alert = require('../models/Alert');
      
      let cowDataQuery = { timestamp: { $gte: startDate } };
      let alertQuery = { createdAt: { $gte: startDate } };
      
      if (farmId) {
        cowDataQuery['source.farmId'] = farmId;
        alertQuery['source.farmId'] = farmId;
      }
      
      const [cowData, alerts] = await Promise.all([
        CowData.find(cowDataQuery),
        Alert.find(alertQuery)
      ]);
      
      // Calculate statistics
      const stats = this.calculateHealthStatistics(cowData);
      const alertStats = this.calculateAlertStatistics(alerts);
      
      // Generate insights
      const insights = this.generateHealthInsights(stats, alertStats);
      
      const report = {
        type: this.reportTypes.HEALTH_SUMMARY,
        period: `${days} days`,
        farmId: farmId || 'All Farms',
        generatedAt: new Date().toISOString(),
        summary: {
          totalCows: stats.totalCows,
          healthyCows: stats.healthyCows,
          sickCows: stats.sickCows,
          healthPercentage: stats.healthPercentage,
          averageHealthScore: stats.averageHealthScore
        },
        statistics: stats,
        alerts: alertStats,
        insights: insights,
        recommendations: this.generateRecommendations(stats, alertStats)
      };
      
      return report;
    } catch (error) {
      console.error('❌ Error generating health summary report:', error);
      throw error;
    }
  }
  
  // Generate daily report
  async generateDailyReport(farmId = null, date = new Date()) {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const CowData = require('../models/CowData');
      const Alert = require('../models/Alert');
      
      let cowDataQuery = { 
        timestamp: { $gte: startDate, $lte: endDate } 
      };
      let alertQuery = { 
        createdAt: { $gte: startDate, $lte: endDate } 
      };
      
      if (farmId) {
        cowDataQuery['source.farmId'] = farmId;
        alertQuery['source.farmId'] = farmId;
      }
      
      const [cowData, alerts] = await Promise.all([
        CowData.find(cowDataQuery),
        Alert.find(alertQuery)
      ]);
      
      // Hourly breakdown
      const hourlyData = this.generateHourlyBreakdown(cowData);
      
      // Daily trends
      const trends = this.analyzeDailyTrends(cowData);
      
      const report = {
        type: this.reportTypes.DAILY_REPORT,
        date: date.toISOString().split('T')[0],
        farmId: farmId || 'All Farms',
        generatedAt: new Date().toISOString(),
        summary: {
          totalReadings: cowData.length,
          uniqueCows: [...new Set(cowData.map(d => d.cowId))].length,
          totalAlerts: alerts.length,
          criticalAlerts: alerts.filter(a => a.severity === 'Critical').length
        },
        hourlyBreakdown: hourlyData,
        trends: trends,
        alerts: this.formatAlertsForReport(alerts),
        topIssues: this.identifyTopIssues(cowData, alerts)
      };
      
      return report;
    } catch (error) {
      console.error('❌ Error generating daily report:', error);
      throw error;
    }
  }
  
  // Generate weekly report
  async generateWeeklyReport(farmId = null, weekStart = new Date()) {
    try {
      const startDate = new Date(weekStart);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // End of week
      endDate.setHours(23, 59, 59, 999);
      
      const CowData = require('../models/CowData');
      const Alert = require('../models/Alert');
      
      let cowDataQuery = { 
        timestamp: { $gte: startDate, $lte: endDate } 
      };
      let alertQuery = { 
        createdAt: { $gte: startDate, $lte: endDate } 
      };
      
      if (farmId) {
        cowDataQuery['source.farmId'] = farmId;
        alertQuery['source.farmId'] = farmId;
      }
      
      const [cowData, alerts] = await Promise.all([
        CowData.find(cowDataQuery),
        Alert.find(alertQuery)
      ]);
      
      // Daily breakdown
      const dailyBreakdown = this.generateDailyBreakdown(cowData, startDate, endDate);
      
      // Weekly trends
      const trends = this.analyzeWeeklyTrends(cowData);
      
      // Performance metrics
      const performance = this.calculatePerformanceMetrics(cowData);
      
      const report = {
        type: this.reportTypes.WEEKLY_REPORT,
        weekStart: startDate.toISOString().split('T')[0],
        weekEnd: endDate.toISOString().split('T')[0],
        farmId: farmId || 'All Farms',
        generatedAt: new Date().toISOString(),
        summary: {
          totalReadings: cowData.length,
          uniqueCows: [...new Set(cowData.map(d => d.cowId))].length,
          totalAlerts: alerts.length,
          averageHealthScore: performance.averageHealthScore
        },
        dailyBreakdown: dailyBreakdown,
        trends: trends,
        performance: performance,
        alerts: this.formatAlertsForReport(alerts),
        recommendations: this.generateWeeklyRecommendations(performance, trends)
      };
      
      return report;
    } catch (error) {
      console.error('❌ Error generating weekly report:', error);
      throw error;
    }
  }
  
  // Generate alert report
  async generateAlertReport(farmId = null, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const Alert = require('../models/Alert');
      
      let query = { createdAt: { $gte: startDate } };
      if (farmId) {
        query['source.farmId'] = farmId;
      }
      
      const alerts = await Alert.find(query).sort({ createdAt: -1 });
      
      // Alert analysis
      const analysis = this.analyzeAlerts(alerts);
      
      // Response time analysis
      const responseTimes = this.analyzeResponseTimes(alerts);
      
      // Top issues
      const topIssues = this.identifyTopAlertIssues(alerts);
      
      const report = {
        type: this.reportTypes.ALERT_REPORT,
        period: `${days} days`,
        farmId: farmId || 'All Farms',
        generatedAt: new Date().toISOString(),
        summary: {
          totalAlerts: alerts.length,
          activeAlerts: alerts.filter(a => a.status === 'Active').length,
          resolvedAlerts: alerts.filter(a => a.status === 'Resolved').length,
          criticalAlerts: alerts.filter(a => a.severity === 'Critical').length
        },
        analysis: analysis,
        responseTimes: responseTimes,
        topIssues: topIssues,
        alertsByType: this.groupAlertsByType(alerts),
        alertsBySeverity: this.groupAlertsBySeverity(alerts),
        recommendations: this.generateAlertRecommendations(analysis)
      };
      
      return report;
    } catch (error) {
      console.error('❌ Error generating alert report:', error);
      throw error;
    }
  }
  
  // Calculate health statistics
  calculateHealthStatistics(cowData) {
    const totalCows = [...new Set(cowData.map(d => d.cowId))].length;
    const healthyCows = cowData.filter(d => d.disease === 'Normal').length;
    const sickCows = cowData.filter(d => d.disease !== 'Normal').length;
    
    const avgHealthScore = cowData.length > 0 
      ? cowData.reduce((sum, d) => sum + (d.healthScore || 0), 0) / cowData.length 
      : 0;
    
    const healthPercentage = cowData.length > 0 
      ? ((healthyCows / cowData.length) * 100).toFixed(2) 
      : 0;
    
    // Temperature distribution
    const tempDistribution = {
      normal: cowData.filter(d => d.temperature >= 37.5 && d.temperature <= 39.5).length,
      fever: cowData.filter(d => d.temperature > 39.5 && d.temperature <= 40.5).length,
      highFever: cowData.filter(d => d.temperature > 40.5).length,
      low: cowData.filter(d => d.temperature < 37.5).length
    };
    
    // Motion distribution
    const motionDistribution = {
      low: cowData.filter(d => d.motionChange < 20).length,
      normal: cowData.filter(d => d.motionChange >= 20 && d.motionChange <= 100).length,
      high: cowData.filter(d => d.motionChange > 100).length
    };
    
    return {
      totalCows,
      healthyCows,
      sickCows,
      healthPercentage: parseFloat(healthPercentage),
      averageHealthScore: parseFloat(avgHealthScore.toFixed(2)),
      tempDistribution,
      motionDistribution,
      totalReadings: cowData.length
    };
  }
  
  // Calculate alert statistics
  calculateAlertStatistics(alerts) {
    const totalAlerts = alerts.length;
    const activeAlerts = alerts.filter(a => a.status === 'Active').length;
    const resolvedAlerts = alerts.filter(a => a.status === 'Resolved').length;
    
    const severityDistribution = {
      critical: alerts.filter(a => a.severity === 'Critical').length,
      high: alerts.filter(a => a.severity === 'High').length,
      medium: alerts.filter(a => a.severity === 'Medium').length,
      low: alerts.filter(a => a.severity === 'Low').length
    };
    
    const avgResolutionTime = resolvedAlerts > 0 
      ? alerts.filter(a => a.resolution.resolutionTime)
          .reduce((sum, a) => sum + a.resolution.resolutionTime, 0) / resolvedAlerts
      : 0;
    
    return {
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      severityDistribution,
      averageResolutionTime: parseFloat(avgResolutionTime.toFixed(2))
    };
  }
  
  // Generate health insights
  generateHealthInsights(healthStats, alertStats) {
    const insights = [];
    
    if (healthStats.healthPercentage < 80) {
      insights.push({
        type: 'warning',
        message: `Overall herd health is below 80% (${healthStats.healthPercentage}%). Immediate attention required.`,
        priority: 'high'
      });
    }
    
    if (alertStats.criticalAlerts > 0) {
      insights.push({
        type: 'critical',
        message: `${alertStats.criticalAlerts} critical alerts require immediate attention.`,
        priority: 'critical'
      });
    }
    
    if (healthStats.tempDistribution.highFever > 0) {
      insights.push({
        type: 'temperature',
        message: `${healthStats.tempDistribution.highFever} cows showing high fever symptoms.`,
        priority: 'high'
      });
    }
    
    if (alertStats.averageResolutionTime > 120) {
      insights.push({
        type: 'performance',
        message: `Average alert resolution time is ${alertStats.averageResolutionTime} minutes. Consider improving response procedures.`,
        priority: 'medium'
      });
    }
    
    return insights;
  }
  
  // Generate recommendations
  generateRecommendations(healthStats, alertStats) {
    const recommendations = [];
    
    if (healthStats.healthPercentage < 85) {
      recommendations.push({
        category: 'Health Management',
        recommendation: 'Implement daily health checks and improve monitoring frequency',
        priority: 'high'
      });
    }
    
    if (alertStats.criticalAlerts > 0) {
      recommendations.push({
        category: 'Emergency Response',
        recommendation: 'Review and update emergency response procedures',
        priority: 'critical'
      });
    }
    
    if (healthStats.tempDistribution.highFever > 0) {
      recommendations.push({
        category: 'Temperature Management',
        recommendation: 'Ensure proper ventilation and cooling systems are functioning',
        priority: 'high'
      });
    }
    
    return recommendations;
  }
  
  // Generate hourly breakdown
  generateHourlyBreakdown(cowData) {
    const hourlyData = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = {
        hour: hour,
        readings: 0,
        avgTemperature: 0,
        avgMotion: 0,
        alerts: 0
      };
    }
    
    cowData.forEach(data => {
      const hour = new Date(data.timestamp).getHours();
      if (hourlyData[hour]) {
        hourlyData[hour].readings++;
        hourlyData[hour].avgTemperature += data.temperature;
        hourlyData[hour].avgMotion += data.motionChange;
      }
    });
    
    // Calculate averages
    Object.values(hourlyData).forEach(hourData => {
      if (hourData.readings > 0) {
        hourData.avgTemperature = (hourData.avgTemperature / hourData.readings).toFixed(2);
        hourData.avgMotion = (hourData.avgMotion / hourData.readings).toFixed(2);
      }
    });
    
    return hourlyData;
  }
  
  // Analyze daily trends
  analyzeDailyTrends(cowData) {
    const trends = {
      temperatureTrend: 'stable',
      motionTrend: 'stable',
      healthTrend: 'stable'
    };
    
    if (cowData.length > 1) {
      const sortedData = cowData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
      const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
      
      const firstHalfAvgTemp = firstHalf.reduce((sum, d) => sum + d.temperature, 0) / firstHalf.length;
      const secondHalfAvgTemp = secondHalf.reduce((sum, d) => sum + d.temperature, 0) / secondHalf.length;
      
      if (secondHalfAvgTemp > firstHalfAvgTemp + 0.5) {
        trends.temperatureTrend = 'increasing';
      } else if (secondHalfAvgTemp < firstHalfAvgTemp - 0.5) {
        trends.temperatureTrend = 'decreasing';
      }
    }
    
    return trends;
  }
  
  // Format alerts for report
  formatAlertsForReport(alerts) {
    return alerts.map(alert => ({
      id: alert.alertId,
      type: alert.type,
      severity: alert.severity,
      status: alert.status,
      cowId: alert.source.cowId,
      title: alert.title,
      message: alert.message,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolution?.resolvedAt
    }));
  }
  
  // Identify top issues
  identifyTopIssues(cowData, alerts) {
    const issues = [];
    
    // Temperature issues
    const highTempCows = cowData.filter(d => d.temperature > 40).length;
    if (highTempCows > 0) {
      issues.push({
        type: 'High Temperature',
        count: highTempCows,
        severity: 'high'
      });
    }
    
    // Motion issues
    const lowMotionCows = cowData.filter(d => d.motionChange < 10).length;
    if (lowMotionCows > 0) {
      issues.push({
        type: 'Low Activity',
        count: lowMotionCows,
        severity: 'medium'
      });
    }
    
    // Disease issues
    const sickCows = cowData.filter(d => d.disease !== 'Normal').length;
    if (sickCows > 0) {
      issues.push({
        type: 'Health Issues',
        count: sickCows,
        severity: 'high'
      });
    }
    
    return issues.sort((a, b) => b.count - a.count);
  }
  
  // Export report to different formats
  async exportReport(report, format = 'json') {
    try {
      switch (format) {
        case 'json':
          return JSON.stringify(report, null, 2);
        
        case 'csv':
          return this.convertToCSV(report);
        
        case 'excel':
          return this.convertToExcel(report);
        
        case 'pdf':
          return this.convertToPDF(report);
        
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('❌ Error exporting report:', error);
      throw error;
    }
  }
  
  // Convert report to CSV format
  convertToCSV(report) {
    const lines = [];
    
    // Header
    lines.push('Report Type,Period,Farm ID,Generated At');
    lines.push(`${report.type},${report.period || report.date},${report.farmId},${report.generatedAt}`);
    lines.push('');
    
    // Summary
    if (report.summary) {
      lines.push('Summary');
      Object.entries(report.summary).forEach(([key, value]) => {
        lines.push(`${key},${value}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }
  
  // Convert report to Excel format (simplified)
  convertToExcel(report) {
    // This would integrate with a library like 'xlsx' for Excel generation
    return `Excel format not implemented yet for ${report.type}`;
  }
  
  // Convert report to PDF format
  convertToPDF(report) {
    try {
      // Simple HTML-based PDF generation
      const htmlContent = this.generateHTMLReport(report);
      
      // For now, return HTML that can be converted to PDF on frontend
      return {
        type: 'html',
        content: htmlContent,
        filename: `cow-belt-${report.type}-${new Date().toISOString().split('T')[0]}.html`
      };
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      return `Error generating PDF: ${error.message}`;
    }
  }

  // Generate HTML report for PDF conversion
  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cow Belt Report - ${report.type}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #22c55e; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background: #f9fafb; }
        .critical { color: #dc2626; font-weight: bold; }
        .high { color: #ea580c; font-weight: bold; }
        .medium { color: #d97706; }
        .low { color: #059669; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐄 Cow Belt Report</h1>
        <p><strong>Type:</strong> ${report.type.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Period:</strong> ${report.period || report.date || 'N/A'}</p>
        <p><strong>Farm:</strong> ${report.farmId}</p>
        <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>

    ${report.summary ? `
    <div class="section">
        <h2>📊 Summary</h2>
        <div class="summary">
            ${Object.entries(report.summary).map(([key, value]) => 
                `<p><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</p>`
            ).join('')}
        </div>
    </div>
    ` : ''}

    ${report.statistics ? `
    <div class="section">
        <h2>📈 Statistics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            ${Object.entries(report.statistics).map(([key, value]) => 
                `<tr><td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td><td>${typeof value === 'object' ? JSON.stringify(value) : value}</td></tr>`
            ).join('')}
        </table>
    </div>
    ` : ''}

    ${report.insights && report.insights.length > 0 ? `
    <div class="section">
        <h2>💡 Insights</h2>
        ${report.insights.map(insight => 
            `<div class="${insight.priority}">
                <p><strong>${insight.type}:</strong> ${insight.message}</p>
            </div>`
        ).join('')}
    </div>
    ` : ''}

    ${report.recommendations && report.recommendations.length > 0 ? `
    <div class="section">
        <h2>🎯 Recommendations</h2>
        ${report.recommendations.map(rec => 
            `<div class="${rec.priority}">
                <p><strong>${rec.category}:</strong> ${rec.recommendation}</p>
            </div>`
        ).join('')}
    </div>
    ` : ''}

    ${report.alerts && report.alerts.length > 0 ? `
    <div class="section">
        <h2>⚠️ Alerts</h2>
        <table>
            <tr><th>Type</th><th>Severity</th><th>Status</th><th>Cow ID</th><th>Message</th><th>Created</th></tr>
            ${report.alerts.map(alert => 
                `<tr>
                    <td>${alert.type}</td>
                    <td class="${alert.severity?.toLowerCase()}">${alert.severity}</td>
                    <td>${alert.status}</td>
                    <td>${alert.cowId}</td>
                    <td>${alert.message}</td>
                    <td>${new Date(alert.createdAt).toLocaleString()}</td>
                </tr>`
            ).join('')}
        </table>
    </div>
    ` : ''}

    <div class="section">
        <p><em>Report generated by Cow Belt Monitoring System</em></p>
        <p><em>For technical support, contact your system administrator</em></p>
    </div>
</body>
</html>`;

    return html;
  }
}

// Create singleton instance
const reportGenerator = new ReportGenerator();

// Export generator
module.exports = { 
  ReportGenerator,
  reportGenerator
};


