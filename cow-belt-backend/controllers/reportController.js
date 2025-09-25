// const { reportGenerator } = require('../utils/reportGenerator');

// // GET: Generate health summary report
// const generateHealthSummaryReport = async (req, res) => {
//   try {
//     const { farmId, days = 7 } = req.query;
    
//     const report = await reportGenerator.generateHealthSummaryReport(farmId, parseInt(days));
    
//     res.status(200).json({
//       success: true,
//       report: report,
//       generatedAt: new Date().toISOString()
//     });
//   } catch (err) {
//     console.error('❌ Error generating health summary report:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // GET: Generate daily report
// const generateDailyReport = async (req, res) => {
//   try {
//     const { farmId, date } = req.query;
    
//     const reportDate = date ? new Date(date) : new Date();
//     const report = await reportGenerator.generateDailyReport(farmId, reportDate);
    
//     res.status(200).json({
//       success: true,
//       report: report,
//       generatedAt: new Date().toISOString()
//     });
//   } catch (err) {
//     console.error('❌ Error generating daily report:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // GET: Generate weekly report
// const generateWeeklyReport = async (req, res) => {
//   try {
//     const { farmId, weekStart } = req.query;
    
//     const startDate = weekStart ? new Date(weekStart) : new Date();
//     const report = await reportGenerator.generateWeeklyReport(farmId, startDate);
    
//     res.status(200).json({
//       success: true,
//       report: report,
//       generatedAt: new Date().toISOString()
//     });
//   } catch (err) {
//     console.error('❌ Error generating weekly report:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // GET: Generate alert report
// const generateAlertReport = async (req, res) => {
//   try {
//     const { farmId, days = 30 } = req.query;
    
//     const report = await reportGenerator.generateAlertReport(farmId, parseInt(days));
    
//     res.status(200).json({
//       success: true,
//       report: report,
//       generatedAt: new Date().toISOString()
//     });
//   } catch (err) {
//     console.error('❌ Error generating alert report:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // GET: Export report
// const exportReport = async (req, res) => {
//   try {
//     const { type, format = 'json', farmId, days = 7 } = req.query;
    
//     let report;
    
//     switch (type) {
//       case 'health_summary':
//         report = await reportGenerator.generateHealthSummaryReport(farmId, parseInt(days));
//         break;
//       case 'daily':
//         const reportDate = req.query.date ? new Date(req.query.date) : new Date();
//         report = await reportGenerator.generateDailyReport(farmId, reportDate);
//         break;
//       case 'weekly':
//         const startDate = req.query.weekStart ? new Date(req.query.weekStart) : new Date();
//         report = await reportGenerator.generateWeeklyReport(farmId, startDate);
//         break;
//       case 'alert':
//         report = await reportGenerator.generateAlertReport(farmId, parseInt(days));
//         break;
//       default:
//         return res.status(400).json({ error: 'Invalid report type' });
//     }
    
//     const exportedData = await reportGenerator.exportReport(report, format);
    
//     // Handle different export formats
//     if (format === 'pdf' && typeof exportedData === 'object' && exportedData.type === 'html') {
//       // For PDF, send HTML content that can be converted to PDF
//       res.set({
//         'Content-Type': 'text/html',
//         'Content-Disposition': `attachment; filename="${exportedData.filename}"`
//       });
//       res.send(exportedData.content);
//     } else {
//       // Set appropriate headers for other formats
//       const headers = {
//         'Content-Type': 'application/json',
//         'Content-Disposition': `attachment; filename="cow-belt-${type}-report.${format}"`
//       };
      
//       switch (format) {
//         case 'csv':
//           headers['Content-Type'] = 'text/csv';
//           break;
//         case 'excel':
//           headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
//           break;
//         case 'json':
//           headers['Content-Type'] = 'application/json';
//           break;
//       }
      
//       res.set(headers);
//       res.send(exportedData);
//     }
//   } catch (err) {
//     console.error('❌ Error exporting report:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // GET: Get available report types
// const getAvailableReports = async (req, res) => {
//   try {
//     const reportTypes = [
//       {
//         type: 'health_summary',
//         name: 'Health Summary Report',
//         description: 'Overall health status and statistics',
//         parameters: ['farmId', 'days']
//       },
//       {
//         type: 'daily',
//         name: 'Daily Report',
//         description: 'Daily activity and health breakdown',
//         parameters: ['farmId', 'date']
//       },
//       {
//         type: 'weekly',
//         name: 'Weekly Report',
//         description: 'Weekly trends and performance metrics',
//         parameters: ['farmId', 'weekStart']
//       },
//       {
//         type: 'alert',
//         name: 'Alert Report',
//         description: 'Alert analysis and response metrics',
//         parameters: ['farmId', 'days']
//       }
//     ];
    
//     const exportFormats = [
//       { format: 'json', name: 'JSON', description: 'JavaScript Object Notation' },
//       { format: 'csv', name: 'CSV', description: 'Comma Separated Values' },
//       { format: 'excel', name: 'Excel', description: 'Microsoft Excel format' },
//       { format: 'pdf', name: 'PDF', description: 'Portable Document Format' }
//     ];
    
//     res.status(200).json({
//       reportTypes: reportTypes,
//       exportFormats: exportFormats,
//       timestamp: new Date().toISOString()
//     });
//   } catch (err) {
//     console.error('❌ Error getting available reports:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // GET: Get report statistics
// const getReportStatistics = async (req, res) => {
//   try {
//     const { days = 30 } = req.query;
    
//     // This would typically come from a report generation log
//     // For now, return mock statistics
//     const stats = {
//       totalReportsGenerated: 156,
//       reportsByType: {
//         health_summary: 45,
//         daily: 67,
//         weekly: 23,
//         alert: 21
//       },
//       reportsByFormat: {
//         json: 89,
//         csv: 34,
//         excel: 23,
//         pdf: 10
//       },
//       averageGenerationTime: '2.3 seconds',
//       mostRequestedReport: 'health_summary',
//       lastGenerated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
//     };
    
//     res.status(200).json({
//       period: `${days} days`,
//       statistics: stats,
//       timestamp: new Date().toISOString()
//     });
//   } catch (err) {
//     console.error('❌ Error getting report statistics:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// module.exports = {
//   generateHealthSummaryReport,
//   generateDailyReport,
//   generateWeeklyReport,
//   generateAlertReport,
//   exportReport,
//   getAvailableReports,
//   getReportStatistics
// };


