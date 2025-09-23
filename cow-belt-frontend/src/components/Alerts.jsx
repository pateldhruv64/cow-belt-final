import React from "react";

const Alerts = ({ cows }) => {
  // Generate alerts based on cow data
  const generateAlerts = (cows) => {
    const alerts = [];

    cows.forEach((cow) => {
      // High temperature alert
      if (cow.temperature > 40) {
        alerts.push({
          id: `${cow._id}-temp`,
          type: "temperature",
          severity: "high",
          cowId: cow.cowId,
          message: `High temperature detected: ${cow.temperature}°C`,
          timestamp: cow.timestamp,
          icon: "🔥",
          color: "red",
        });
      }

      // Low temperature alert
      if (cow.temperature < 37) {
        alerts.push({
          id: `${cow._id}-low-temp`,
          type: "temperature",
          severity: "medium",
          cowId: cow.cowId,
          message: `Low temperature detected: ${cow.temperature}°C`,
          timestamp: cow.timestamp,
          icon: "❄️",
          color: "blue",
        });
      }

      // Disease alerts
      if (cow.disease !== "Normal") {
        alerts.push({
          id: `${cow._id}-disease`,
          type: "health",
          severity: cow.disease === "Fever" ? "high" : "medium",
          cowId: cow.cowId,
          message: `Health issue detected: ${cow.disease}`,
          timestamp: cow.timestamp,
          icon: "🩺",
          color: cow.disease === "Fever" ? "red" : "orange",
        });
      }

      // Motion inactivity alert
      if (cow.motionChange < 5) {
        alerts.push({
          id: `${cow._id}-motion`,
          type: "activity",
          severity: "low",
          cowId: cow.cowId,
          message: `Low activity detected: ${cow.motionChange}`,
          timestamp: cow.timestamp,
          icon: "😴",
          color: "yellow",
        });
      }
    });

    // Sort by severity and timestamp
    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  };

  const alerts = generateAlerts(cows);
  const highPriorityAlerts = alerts.filter(
    (alert) => alert.severity === "high"
  );
  const mediumPriorityAlerts = alerts.filter(
    (alert) => alert.severity === "medium"
  );
  const lowPriorityAlerts = alerts.filter((alert) => alert.severity === "low");

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-orange-500 bg-orange-50";
      case "low":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const getSeverityTextColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-800";
      case "medium":
        return "text-orange-800";
      case "low":
        return "text-yellow-800";
      default:
        return "text-gray-800";
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          🔔 Alerts & Notifications
        </h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            All Good!
          </h4>
          <p className="text-gray-500">
            No alerts at the moment. All cows are healthy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        🔔 Alerts & Notifications
        <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
          {alerts.length}
        </span>
      </h3>

      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">
            {highPriorityAlerts.length}
          </div>
          <div className="text-sm text-red-600">High Priority</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {mediumPriorityAlerts.length}
          </div>
          <div className="text-sm text-orange-600">Medium Priority</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {lowPriorityAlerts.length}
          </div>
          <div className="text-sm text-yellow-600">Low Priority</div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 ${getSeverityColor(
              alert.severity
            )} p-4 rounded-r-lg`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{alert.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`font-semibold ${getSeverityTextColor(
                        alert.severity
                      )}`}
                    >
                      {alert.cowId}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.severity === "high"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "medium"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${getSeverityTextColor(
                      alert.severity
                    )}`}
                  >
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-sm">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
