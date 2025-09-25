import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Basic data endpoints
export const getLastCowData = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/cow/data`);
    return res.data;
  } catch (err) {
    console.error("Error fetching cow data:", err);
    return [];
  }
};

export const getAllCowData = async (page = 1, limit = 20) => {
  try {
    const res = await axios.get(`${API_URL}/api/cow/data/all?page=${page}&limit=${limit}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching all cow data:", err);
    return { data: [], pagination: {} };
  }
};

export const getCowDataById = async (cowId) => {
  try {
    const res = await axios.get(`${API_URL}/api/cow/data/cow/${cowId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching cow data by ID:", err);
    return [];
  }
};

export const getCowDataByDateRange = async (startDate, endDate, cowId = null) => {
  try {
    let url = `${API_URL}/api/cow/data/range?startDate=${startDate}&endDate=${endDate}`;
    if (cowId) {
      url += `&cowId=${cowId}`;
    }
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("Error fetching cow data by date range:", err);
    return { data: [], count: 0 };
  }
};

// Analytics endpoints
export const getCowStatistics = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/cow/data/statistics`);
    return res.data;
  } catch (err) {
    console.error("Error fetching statistics:", err);
    return {};
  }
};

export const getHealthAlerts = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/cow/data/alerts`);
    return res.data;
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return { alerts: [], summary: { high: 0, medium: 0, low: 0 } };
  }
};

// Advanced analytics endpoints
export const getTemperatureTrends = async (days = 7, cowId = null) => {
  try {
    let url = `${API_URL}/api/analytics/temperature-trends?days=${days}`;
    if (cowId) {
      url += `&cowId=${cowId}`;
    }
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("Error fetching temperature trends:", err);
    return { trends: [] };
  }
};

export const getMotionAnalysis = async (days = 7, cowId = null) => {
  try {
    let url = `${API_URL}/api/analytics/motion-analysis?days=${days}`;
    if (cowId) {
      url += `&cowId=${cowId}`;
    }
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("Error fetching motion analysis:", err);
    return { analysis: [] };
  }
};

export const getDiseaseAccuracy = async (days = 30) => {
  try {
    const res = await axios.get(`${API_URL}/api/analytics/disease-accuracy?days=${days}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching disease accuracy:", err);
    return { distribution: [], accuracyPercentage: 0 };
  }
};

export const getHourlyPatterns = async (days = 7) => {
  try {
    const res = await axios.get(`${API_URL}/api/analytics/hourly-patterns?days=${days}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching hourly patterns:", err);
    return { hourlyPatterns: [] };
  }
};

export const getHealthRiskAssessment = async (cowId = null) => {
  try {
    let url = `${API_URL}/api/analytics/health-risk`;
    if (cowId) {
      url += `?cowId=${cowId}`;
    }
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("Error fetching health risk assessment:", err);
    return { assessment: [], summary: { totalCows: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 } };
  }
};

// Maintenance endpoints
export const deleteOldData = async (days = 30) => {
  try {
    const res = await axios.delete(`${API_URL}/api/cow/data/cleanup?days=${days}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting old data:", err);
    throw err;
  }
};

// Health check
export const checkApiHealth = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/health`);
    return res.data;
  } catch (err) {
    console.error("API health check failed:", err);
    return { status: 'ERROR', message: 'API is not responding' };
  }
};

// Chart data endpoints
export const getHealthGaugeData = async (cowId = null) => {
  try {
    let url = `${API_URL}/api/ml/health-analysis`;
    if (cowId) {
      url += `?cowId=${cowId}`;
    }
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("Error fetching health gauge data:", err);
    return { healthScore: 85, riskLevel: 'Low' };
  }
};

// ML endpoints
export const getMLHealthAnalysis = async (cowId, days = 7) => {
  try {
    if (!cowId) return { error: 'Cow ID is required' };
    const res = await axios.get(`${API_URL}/api/ml/health-analysis?cowId=${encodeURIComponent(cowId)}&days=${days}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching ML health analysis:', err);
    return { analysis: { temperature: [], motion: [], health: {} }, dataPoints: 0 };
  }
};

export const getMLAnomalies = async (hours = 24) => {
  try {
    const res = await axios.get(`${API_URL}/api/ml/anomalies?hours=${hours}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching anomalies:', err);
    return { anomalies: [], totalAnomalies: 0 };
  }
};

export const getMLInsights = async (days = 1) => {
  try {
    const res = await axios.get(`${API_URL}/api/ml/insights?days=${days}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching health insights:', err);
    return { insights: [], totalInsights: 0 };
  }
};

export const getMLPredictions = async (params = {}) => {
  try {
    const { cowId, days = 30 } = params || {};
    const q = new URLSearchParams();
    if (cowId) q.set('cowId', cowId);
    q.set('days', String(days));
    const res = await axios.get(`${API_URL}/api/ml/predictions?${q.toString()}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching predictive analytics:', err);
    return { predictions: [], totalCows: 0 };
  }
};

export const getMLPerformance = async (days = 7) => {
  try {
    const res = await axios.get(`${API_URL}/api/ml/performance?days=${days}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching ML performance:', err);
    return { metrics: { totalPredictions: 0, accuracy: 0 }, performance: {} };
  }
};

// Reports
// export const getAvailableReports = async () => {
//   try {
//     const res = await axios.get(`${API_URL}/api/reports/available`);
//     return res.data;
//   } catch (err) {
//     console.error('Error fetching available reports:', err);
//     return { reportTypes: [], exportFormats: [] };
//   }
// };

// export const getReportStatistics = async (days = 30) => {
//   try {
//     const res = await axios.get(`${API_URL}/api/reports/statistics?days=${days}`);
//     return res.data;
//   } catch (err) {
//     console.error('Error fetching report statistics:', err);
//     return { statistics: null };
//   }
// };

// export const generateReport = async ({ type, params = {} }) => {
//   try {
//     const map = {
//       health_summary: 'health-summary',
//       daily: 'daily',
//       weekly: 'weekly',
//       alert: 'alerts'
//     };
//     const path = map[type];
//     const q = new URLSearchParams(params);
//     const res = await axios.get(`${API_URL}/api/reports/${path}?${q.toString()}`);
//     return res.data;
//   } catch (err) {
//     console.error('Error generating report:', err);
//     return { success: false, report: null };
//   }
// };

// export const exportReport = async ({ type, format = 'json', params = {} }) => {
//   try {
//     const q = new URLSearchParams({ type, format, ...params });
//     const res = await axios.get(`${API_URL}/api/reports/export?${q.toString()}`, { responseType: 'blob' });
//     return res;
//   } catch (err) {
//     console.error('Error exporting report:', err);
//     throw err;
//   }
// };