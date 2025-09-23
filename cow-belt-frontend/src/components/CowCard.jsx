import React from "react";

const CowCard = ({ cow }) => {
  const getHealthStatus = (disease) => {
    if (disease === "Normal") return { status: "Healthy", color: "green", bgColor: "bg-green-50", borderColor: "border-green-200" };
    if (disease === "Fever") return { status: "Fever", color: "red", bgColor: "bg-red-50", borderColor: "border-red-200" };
    if (disease === "Motion Sickness") return { status: "Sick", color: "orange", bgColor: "bg-orange-50", borderColor: "border-orange-200" };
    return { status: "Unknown", color: "gray", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
  };

  const getTemperatureStatus = (temp) => {
    if (temp > 40) return { status: "High", color: "text-red-600", icon: "🔥" };
    if (temp < 37) return { status: "Low", color: "text-blue-600", icon: "❄️" };
    return { status: "Normal", color: "text-green-600", icon: "✅" };
  };

  const getMotionStatus = (motion) => {
    if (motion > 50) return { status: "Active", color: "text-green-600", icon: "🏃" };
    if (motion < 10) return { status: "Inactive", color: "text-yellow-600", icon: "😴" };
    return { status: "Normal", color: "text-blue-600", icon: "🚶" };
  };

  const health = getHealthStatus(cow.disease);
  const tempStatus = getTemperatureStatus(cow.temperature);
  const motionStatus = getMotionStatus(cow.motionChange);

  return (
    <div className={`${health.bgColor} ${health.borderColor} border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mb-4 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            🐄 {cow.cowId || "Unknown Cow"}
          </h2>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            health.color === 'green' ? 'bg-green-100 text-green-800' :
            health.color === 'red' ? 'bg-red-100 text-red-800' :
            health.color === 'orange' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {health.status}
          </div>
        </div>

        {/* Health Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Health Status:</span>
            <span className={`font-bold ${health.color === 'green' ? 'text-green-600' : health.color === 'red' ? 'text-red-600' : 'text-orange-600'}`}>
              🩺 {cow.disease}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Temperature */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Temperature</span>
              <span className="text-lg">{tempStatus.icon}</span>
            </div>
            <div className={`text-lg font-bold ${tempStatus.color}`}>
              {cow.temperature}°C
            </div>
            <div className="text-xs text-gray-500">{tempStatus.status}</div>
          </div>

          {/* Motion */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Activity</span>
              <span className="text-lg">{motionStatus.icon}</span>
            </div>
            <div className={`text-lg font-bold ${motionStatus.color}`}>
              {cow.motionChange}
            </div>
            <div className="text-xs text-gray-500">{motionStatus.status}</div>
          </div>
        </div>

        {/* Sensor Data */}
        <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Sensor Data</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Pitch:</span>
              <span className="font-medium ml-1">{cow.pitch}°</span>
            </div>
            <div>
              <span className="text-gray-500">Roll:</span>
              <span className="font-medium ml-1">{cow.roll}°</span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 text-center">
          📅 {new Date(cow.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CowCard;