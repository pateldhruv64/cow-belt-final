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