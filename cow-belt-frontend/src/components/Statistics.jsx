import React from "react";

const Statistics = ({ cows }) => {
  // Calculate statistics
  const totalCows = cows.length;
  const healthyCows = cows.filter(cow => cow.disease === "Normal").length;
  const sickCows = cows.filter(cow => cow.disease !== "Normal").length;
  const avgTemperature = cows.length > 0 ? (cows.reduce((sum, cow) => sum + cow.temperature, 0) / cows.length).toFixed(1) : 0;
  const avgMotion = cows.length > 0 ? (cows.reduce((sum, cow) => sum + cow.motionChange, 0) / cows.length).toFixed(1) : 0;
  
  // Health percentage
  const healthPercentage = totalCows > 0 ? ((healthyCows / totalCows) * 100).toFixed(1) : 0;

  // Temperature distribution
  const highTemp = cows.filter(cow => cow.temperature > 40).length;
  const lowTemp = cows.filter(cow => cow.temperature < 37).length;

  const stats = [
    {
      title: "Total Cows",
      value: totalCows,
      icon: "🐄",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Healthy Cows",
      value: healthyCows,
      icon: "✅",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Sick Cows",
      value: sickCows,
      icon: "🩺",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Health Rate",
      value: `${healthPercentage}%`,
      icon: "📊",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  const metrics = [
    {
      title: "Avg Temperature",
      value: `${avgTemperature}°C`,
      icon: "🌡️",
      color: "text-orange-600"
    },
    {
      title: "Avg Activity",
      value: avgMotion,
      icon: "🏃",
      color: "text-green-600"
    },
    {
      title: "High Temp",
      value: highTemp,
      icon: "🔥",
      color: "text-red-600"
    },
    {
      title: "Low Temp",
      value: lowTemp,
      icon: "❄️",
      color: "text-blue-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Main Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          📈 Farm Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-lg p-4 text-center`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          🏥 Health Metrics
        </h3>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metric.icon}</span>
                <span className="font-medium text-gray-700">{metric.title}</span>
              </div>
              <span className={`text-xl font-bold ${metric.color}`}>{metric.value}</span>
            </div>
          ))}
        </div>

        {/* Health Status Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Overall Health</span>
            <span className="text-sm font-bold text-gray-800">{healthPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                healthPercentage >= 80 ? 'bg-green-500' :
                healthPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;


