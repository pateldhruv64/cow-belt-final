import React from "react";
import MLInsightsPanel from "../components/MLInsightsPanel";
import AnomalyDetection from "../components/AnomalyDetection";
import PerformanceMetrics from "../components/PerformanceMetrics";
import Navbar from "../components/Navbar";

const MLInsights = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar totalCows={0} alertCount={0} lastUpdate={null} />
      
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🤖 ML Insights & Analytics</h1>
          <p className="text-gray-600">Machine learning predictions, anomaly detection, and performance metrics</p>
        </div>

        {/* ML Insights Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Predictive Analytics</h3>
          <MLInsightsPanel defaultCowId={null} />
        </div>

        {/* Anomaly Detection Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Anomaly Detection</h3>
          <AnomalyDetection />
        </div>

        {/* Performance Metrics Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📈 ML Performance</h3>
          <PerformanceMetrics />
        </div>
      </div>
    </div>
  );
};

export default MLInsights;
