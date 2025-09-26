import React, { useState, useEffect } from "react";
import {
  getMotionAnalysis,
  getCowDataByDateRange,
} from "../services/cowService";

const MotionActivityChart = ({ cowId, days = 7, startDate, endDate }) => {
  const [motionData, setMotionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMotionData = async () => {
      try {
        setLoading(true);
        let data = { analysis: [] };
        if (startDate && endDate) {
          const rangeRes = await getCowDataByDateRange(
            startDate,
            endDate,
            cowId
          );
          const items = Array.isArray(rangeRes?.data) ? rangeRes.data : [];
          const mapped = items.map((item) => {
            const dateStr =
              item?.timestamp ||
              item?.createdAt ||
              item?.date ||
              new Date().toISOString();
            const d = new Date(dateStr);
            const motionValue = Number(
              (
                item?.motionChange ??
                item?.motion ??
                40 + Math.random() * 20
              ).toFixed(1)
            );
            return {
              date: d.toISOString().split("T")[0],
              motion: motionValue,
              time: d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
          });
          data.analysis = mapped;
        } else {
          data = await getMotionAnalysis(days, cowId);
          const normalized = Array.isArray(data?.analysis)
            ? data.analysis
                .map((item) => {
                  const dateStr =
                    item?.timestamp ||
                    item?.date ||
                    item?.day ||
                    new Date().toISOString();
                  const d = new Date(dateStr);
                  const raw =
                    item?.motion ??
                    item?.motionChange ??
                    item?.value ??
                    item?.activity;
                  const motion = Number(raw);
                  return {
                    date: d.toISOString().split("T")[0],
                    motion: Number.isFinite(motion) ? motion : 0,
                    time: d.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  };
                })
                .filter((pt) => Number.isFinite(pt.motion))
            : [];
          data.analysis = normalized;
        }
        setMotionData(Array.isArray(data.analysis) ? data.analysis : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching motion analysis:", err);
        setError("Failed to load motion data");
      } finally {
        setLoading(false);
      }
    };

    fetchMotionData();
  }, [cowId, days, startDate, endDate]);

  // Generate mock data if API fails
  const generateMockData = () => {
    const mockData = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate realistic motion data
      const baseMotion = 45;
      const variation = Math.sin(i * 0.3) * 20;
      const randomVariation = (Math.random() - 0.5) * 15;
      const motion = Math.max(0, baseMotion + variation + randomVariation);

      mockData.push({
        date: date.toISOString().split("T")[0],
        motion: parseFloat(motion.toFixed(1)),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    return mockData;
  };

  const chartData =
    Array.isArray(motionData) && motionData.length > 0
      ? motionData
      : generateMockData();

  // Calculate activity levels
  const getActivityLevel = (motion) => {
    if (motion >= 100)
      return {
        level: "Very Active",
        color: "#ef4444",
        bgColor: "#fef2f2",
        icon: "🏃‍♂️",
      };
    if (motion >= 60)
      return {
        level: "Active",
        color: "#f97316",
        bgColor: "#fff7ed",
        icon: "🚶‍♂️",
      };
    if (motion >= 20)
      return {
        level: "Normal",
        color: "#10b981",
        bgColor: "#f0fdf4",
        icon: "🐄",
      };
    if (motion >= 10)
      return { level: "Low", color: "#3b82f6", bgColor: "#eff6ff", icon: "😴" };
    return {
      level: "Inactive",
      color: "#6b7280",
      bgColor: "#f9fafb",
      icon: "💤",
    };
  };

  // Simple bar chart implementation
  const SimpleBarChart = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <div className="text-sm text-gray-500">No data</div>;
    }
    const numeric = data
      .map((d) => Number(d.motion))
      .filter((v) => Number.isFinite(v));
    const maxMotion = numeric.length ? Math.max(...numeric) : 1;
    const minMotion = numeric.length ? Math.min(...numeric) : 0;
    const motionRange = maxMotion - minMotion || 1;

    const height = 250;
    const padding = 40;
    const width = Math.min(365, window.innerWidth - 40); // screen ke hisaab se adjust

    // const height = 250;
    // const padding = 40;
    // const width = Math.min(365, window.innerWidth - 40); // screen ke hisaab se adjust

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const safeLength = Math.max(1, data.length);
    const barWidth = chartWidth / safeLength - 2;

    return (
      // <div className="relative w-full max-w-sm mx-auto">
      //   <svg width={width} height={height} className="border rounded-lg bg-white">
      <div className="relative w-full max-w-sm mx-auto">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 365 ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="border rounded-lg bg-white"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * chartHeight;
            return (
              <line
                key={index}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                opacity="0.5"
              />
            );
          })}

          {/* Activity zone indicators */}
          <rect
            x={padding}
            y={padding + ((maxMotion - 100) / motionRange) * chartHeight}
            width={chartWidth}
            height={chartHeight * 0.1}
            fill="#fef2f2"
            opacity="0.2"
          />
          <rect
            x={padding}
            y={padding + ((maxMotion - 10) / motionRange) * chartHeight}
            width={chartWidth}
            height={chartHeight * 0.05}
            fill="#f9fafb"
            opacity="0.3"
          />

          {/* Bars */}
          {data.map((point, index) => {
            const x = padding + index * (barWidth + 2);
            const safeMotion = Number(point.motion);
            const denom =
              maxMotion && Number.isFinite(maxMotion) ? maxMotion : 1;
            const barHeight =
              (Number.isFinite(safeMotion) ? safeMotion / denom : 0) *
              chartHeight;
            const y = padding + chartHeight - barHeight;
            const activityLevel = getActivityLevel(
              Number.isFinite(safeMotion) ? safeMotion : 0
            );

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={activityLevel.color}
                  opacity="0.8"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  title={`${point.date}: ${point.motion} (${activityLevel.level})`}
                />

                {/* Value labels on top of bars */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-700 font-medium"
                >
                  {Number.isFinite(safeMotion) ? safeMotion.toFixed(0) : "0"}
                </text>
              </g>
            );
          })}

          {/* Y-axis labels */}
          {[maxMotion, maxMotion * 0.5, 0].map((motion, index) => {
            const y =
              padding + ((maxMotion - motion) / motionRange) * chartHeight;
            return (
              <text
                key={index}
                x={padding - 10}
                y={y + 5}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {motion.toFixed(0)}
              </text>
            );
          })}

          {/* X-axis labels */}
          {data
            .filter(
              (_, index) => index % Math.ceil((data.length || 1) / 5) === 0
            )
            .map((point, index) => (
              <text
                key={index}
                x={padding + index * (barWidth + 2) + barWidth / 2}
                y={height - padding + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {point.date.split("-").slice(1).join("/")}
              </text>
            ))}
        </svg>

        {/* Legend */}
        {/* <div className="flex justify-center mt-4 space-x-3">
          {[
            { level: 'Very Active', color: '#ef4444', range: '≥100', icon: '🏃‍♂️' },
            { level: 'Active', color: '#f97316', range: '60-100', icon: '🚶‍♂️' },
            { level: 'Normal', color: '#10b981', range: '20-60', icon: '🐄' },
            { level: 'Low', color: '#3b82f6', range: '10-20', icon: '😴' },
            { level: 'Inactive', color: '#6b7280', range: '≤10', icon: '💤' }
          ].map((item) => (
            <div key={item.level} className="flex items-center space-x-1">
              <span className="text-sm">{item.icon}</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-gray-600">{item.level}</span>
            </div>
          ))}
        </div> */}

        <div className="flex flex-wrap justify-center mt-4 gap-3">
          {[
            {
              level: "Very Active",
              color: "#ef4444",
              range: "≥100",
              icon: "🏃‍♂️",
            },
            { level: "Active", color: "#f97316", range: "60-100", icon: "🚶‍♂️" },
            { level: "Normal", color: "#10b981", range: "20-60", icon: "🐄" },
            { level: "Low", color: "#3b82f6", range: "10-20", icon: "😴" },
            { level: "Inactive", color: "#6b7280", range: "≤10", icon: "💤" },
          ].map((item) => (
            <div
              key={item.level}
              className="flex items-center space-x-1 text-xs sm:text-sm"
            >
              <span>{item.icon}</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-600">{item.level}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          🏃 Motion Activity
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          🏃 Motion Activity
        </h3>
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Showing mock data</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const avgMotion =
    chartData.reduce((sum, d) => sum + d.motion, 0) / chartData.length;
  const maxMotion = Math.max(...chartData.map((d) => d.motion));
  const minMotion = Math.min(...chartData.map((d) => d.motion));
  const latestMotion = chartData[chartData.length - 1]?.motion;

  // Calculate activity distribution
  const activityDistribution = chartData.reduce((acc, data) => {
    const level = getActivityLevel(data.motion).level;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          🏃 Motion Activity
          {cowId && (
            <span className="ml-2 text-sm text-gray-500">({cowId})</span>
          )}
        </h3>
        {!startDate && !endDate && (
          <div className="flex space-x-2">
            <div className="text-xs text-gray-500">Last {days} days</div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {latestMotion?.toFixed(1)}
          </div>
          <div className="text-sm text-green-600">Current</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {avgMotion.toFixed(1)}
          </div>
          <div className="text-sm text-blue-600">Average</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {maxMotion.toFixed(1)}
          </div>
          <div className="text-sm text-orange-600">Peak</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {minMotion.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Minimum</div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex justify-center mt-4 space-x-3 ">
        <SimpleBarChart data={chartData} />
      </div>

      {/* Activity Distribution */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Activity Distribution
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(activityDistribution).map(([level, count]) => {
            const activityLevel = getActivityLevel(
              level === "Very Active"
                ? 100
                : level === "Active"
                ? 80
                : level === "Normal"
                ? 40
                : level === "Low"
                ? 15
                : 5
            );
            const percentage = ((count / chartData.length) * 100).toFixed(1);

            return (
              <div
                key={level}
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: activityLevel.bgColor }}
              >
                <div className="text-2xl mb-1">{activityLevel.icon}</div>
                <div className="text-sm font-medium text-gray-800">{level}</div>
                <div
                  className="text-lg font-bold"
                  style={{ color: activityLevel.color }}
                >
                  {count}
                </div>
                <div className="text-xs text-gray-600">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Activity Status */}
      {latestMotion && (
        <div
          className="mt-6 p-4 rounded-lg"
          style={{
            backgroundColor: getActivityLevel(latestMotion).bgColor,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {getActivityLevel(latestMotion).icon}
              </span>
              <span className="font-medium text-gray-800">
                Current Activity:
              </span>
              <span
                className="font-bold"
                style={{ color: getActivityLevel(latestMotion).color }}
              >
                {getActivityLevel(latestMotion).level}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotionActivityChart;
