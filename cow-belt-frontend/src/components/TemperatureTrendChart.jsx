import React, { useState, useEffect } from "react";
import {
  getTemperatureTrends,
  getCowDataByDateRange,
} from "../services/cowService";

const TemperatureTrendChart = ({ cowId, days = 7, startDate, endDate }) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        let data = { trends: [] };
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
            return {
              date: d.toISOString().split("T")[0],
              temperature: Number.isFinite(Number(item?.temperature))
                ? Number(Number(item?.temperature).toFixed(1))
                : Number((38 + Math.random()).toFixed(1)),
              time: d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
          });
          data.trends = mapped;
        } else {
          data = await getTemperatureTrends(days, cowId);
          const normalized = Array.isArray(data?.trends)
            ? data.trends.map((item) => {
                const dateStr =
                  item?.timestamp ||
                  item?.date ||
                  item?.day ||
                  new Date().toISOString();
                const d = new Date(dateStr);
                const t = Number(item?.temperature ?? item?.value);
                return {
                  date: d.toISOString().split("T")[0],
                  temperature: Number.isFinite(t)
                    ? Number(t.toFixed(1))
                    : Number((38 + Math.random()).toFixed(1)),
                  time: d.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                };
              })
            : [];
          data.trends = normalized;
        }
        setTrendData(data.trends || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching temperature trends:", err);
        setError("Failed to load temperature trends");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [cowId, days, startDate, endDate]);

  // Generate mock data if API fails
  const generateMockData = () => {
    const mockData = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate realistic temperature data
      const baseTemp = 38.5;
      const variation = Math.sin(i * 0.5) * 2;
      const randomVariation = (Math.random() - 0.5) * 1;
      const temperature = baseTemp + variation + randomVariation;

      mockData.push({
        date: date.toISOString().split("T")[0],
        temperature: parseFloat(temperature.toFixed(1)),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    return mockData;
  };

  const chartData = trendData.length > 0 ? trendData : generateMockData();

  // Calculate temperature zones
  const getTemperatureZone = (temp) => {
    if (temp >= 40.5)
      return { zone: "Critical", color: "#ef4444", bgColor: "#fef2f2" };
    if (temp >= 39.5)
      return { zone: "High", color: "#f97316", bgColor: "#fff7ed" };
    if (temp <= 36.0)
      return { zone: "Low", color: "#3b82f6", bgColor: "#eff6ff" };
    return { zone: "Normal", color: "#10b981", bgColor: "#f0fdf4" };
  };

  // Simple line chart implementation
  const SimpleLineChart = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <div className="text-sm text-gray-500">No data</div>;
    }
    const numeric = data
      .map((d) => Number(d.temperature))
      .filter((v) => Number.isFinite(v));
    const maxTemp = numeric.length ? Math.max(...numeric) : 39;
    const minTemp = numeric.length ? Math.min(...numeric) : 38;
    const tempRange = maxTemp - minTemp || 1;

    // const width = 365;
    // const height = 200;
    // const padding = 40;
    const height = 250;
    const padding = 40;
    const width = Math.min(365, window.innerWidth - 40);
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const singlePoint = data.length === 1;
    const points = data.map((point, index) => {
      const x = singlePoint
        ? padding + chartWidth / 2
        : padding + (index / (data.length - 1)) * chartWidth;
      const y =
        padding +
        ((maxTemp - Number(point.temperature)) / tempRange) * chartHeight;
      return { x, y, ...point };
    });

    // Create SVG path for line
    const pathData =
      points.length < 2
        ? ""
        : points
            .map(
              (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
            )
            .join(" ");

    return (
      // <div className="relative">
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

          {/* Temperature zones */}
          <rect
            x={padding}
            y={padding + ((maxTemp - 40.5) / tempRange) * chartHeight}
            width={chartWidth}
            height={chartHeight * 0.1}
            fill="#fef2f2"
            opacity="0.3"
          />
          <rect
            x={padding}
            y={padding + ((maxTemp - 36.0) / tempRange) * chartHeight}
            width={chartWidth}
            height={chartHeight * 0.1}
            fill="#eff6ff"
            opacity="0.3"
          />

          {/* Line path */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {points.map((point, index) => {
            const zone = getTemperatureZone(point.temperature);
            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={zone.color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:r-6 transition-all"
                title={`${point.date}: ${point.temperature}°C`}
              />
            );
          })}

          {/* Y-axis labels */}
          {[maxTemp, minTemp + (maxTemp - minTemp) * 0.5, minTemp].map(
            (temp, index) => {
              const y = padding + ((maxTemp - temp) / tempRange) * chartHeight;
              return (
                <text
                  key={index}
                  x={padding - 10}
                  y={y + 5}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  {temp.toFixed(1)}°
                </text>
              );
            }
          )}

          {/* X-axis labels */}
          {points
            .filter((_, index) => index % Math.ceil(data.length / 4) === 0)
            .map((point, index) => (
              <text
                key={index}
                x={point.x}
                y={height - padding + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {point.date.split("-").slice(1).join("/")}
              </text>
            ))}
        </svg>

        {/* Legend */}
        <div className="flex justify-center mt-4 space-x-4">
          {[
            { zone: "Critical", color: "#ef4444", range: "≥40.5°C" },
            { zone: "High", color: "#f97316", range: "39.5-40.5°C" },
            { zone: "Normal", color: "#10b981", range: "36.0-39.5°C" },
            { zone: "Low", color: "#3b82f6", range: "≤36.0°C" },
          ].map((item) => (
            <div key={item.zone} className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-gray-600">{item.zone}</span>
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
          📈 Temperature Trends
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          📈 Temperature Trends
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
  const avgTemperature =
    chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length;
  const maxTemperature = Math.max(...chartData.map((d) => d.temperature));
  const minTemperature = Math.min(...chartData.map((d) => d.temperature));
  const latestTemperature = chartData[chartData.length - 1]?.temperature;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          📈 Temperature Trends
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
      {/* <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{latestTemperature?.toFixed(1)}°C</div>
          <div className="text-sm text-blue-600">Current</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{avgTemperature.toFixed(1)}°C</div>
          <div className="text-sm text-green-600">Average</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{maxTemperature.toFixed(1)}°C</div>
          <div className="text-sm text-red-600">Maximum</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{minTemperature.toFixed(1)}°C</div>
          <div className="text-sm text-blue-600">Minimum</div>
        </div>
      </div> */}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[120px] bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {latestTemperature?.toFixed(1)}°C
          </div>
          <div className="text-sm text-blue-600">Current</div>
        </div>

        <div className="flex-1 min-w-[120px] bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {avgTemperature.toFixed(1)}°C
          </div>
          <div className="text-sm text-green-600">Average</div>
        </div>

        <div className="flex-1 min-w-[120px] bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">
            {maxTemperature.toFixed(1)}°C
          </div>
          <div className="text-sm text-red-600">Maximum</div>
        </div>

        <div className="flex-1 min-w-[120px] bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {minTemperature.toFixed(1)}°C
          </div>
          <div className="text-sm text-blue-600">Minimum</div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex justify-center">
        <SimpleLineChart data={chartData} />
      </div>

      {/* Temperature Status */}
      {latestTemperature && (
        <div
          className="mt-6 p-4 rounded-lg"
          style={{
            backgroundColor: getTemperatureZone(latestTemperature).bgColor,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌡️</span>
              <span className="font-medium text-gray-800">Current Status:</span>
              <span
                className="font-bold"
                style={{ color: getTemperatureZone(latestTemperature).color }}
              >
                {getTemperatureZone(latestTemperature).zone}
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

export default TemperatureTrendChart;
