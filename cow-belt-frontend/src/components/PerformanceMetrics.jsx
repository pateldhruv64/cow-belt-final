import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { getMLPerformance } from "../services/cowService";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]; 

const StatCard = ({ label, value, sub }) => (
  <div className="rounded-xl border p-4 bg-white">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
    {sub ? <div className="text-xs text-gray-500">{sub}</div> : null}
  </div>
);

export default function PerformanceMetrics({ className = "" }) {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMLPerformance(days);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const riskPie = useMemo(() => {
    const dist = data?.metrics?.riskDistribution || {};
    return Object.entries(dist).map(([k, v]) => ({ name: k, value: v }));
  }, [data]);

  const diseasePie = useMemo(() => {
    const dist = data?.metrics?.diseaseDistribution || {};
    return Object.entries(dist).map(([k, v]) => ({ name: k, value: v }));
  }, [data]);

  const confidenceBars = useMemo(() => {
    const c = data?.metrics?.confidenceDistribution || {};
    return [
      { range: "High (>0.8)", count: c.high || 0 },
      { range: "Medium (0.5-0.8)", count: c.medium || 0 },
      { range: "Low (<=0.5)", count: c.low || 0 },
    ];
  }, [data]);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h3 className="text-xl font-bold text-gray-800">ML Performance</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Days</label>
          <select className="text-xs border rounded px-2 py-1" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={3}>3</option>
            <option value={7}>7</option>
            <option value={14}>14</option>
            <option value={30}>30</option>
          </select>
          <button className="text-xs px-2 py-1 rounded border" onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>

      {!data?.metrics ? (
        <div className="text-center text-gray-500 text-sm py-12">No performance data</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Accuracy" value={`${data.metrics.accuracy}%`} sub={`Window: ${days}d`} />
            <StatCard label="Predictions" value={data.metrics.totalPredictions} />
            <StatCard label="Valid Data" value={data.performance?.dataQuality?.validData ?? 0} />
            <StatCard label="Invalid Data" value={data.performance?.dataQuality?.invalidData ?? 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-2">Risk Distribution</div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskPie} dataKey="value" nameKey="name" outerRadius={80}>
                      {riskPie.map((entry, index) => (
                        <Cell key={`risk-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-2">Disease Distribution</div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={diseasePie} dataKey="value" nameKey="name" outerRadius={80}>
                      {diseasePie.map((entry, index) => (
                        <Cell key={`dis-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-2">Confidence Ranges</div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceBars}>
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


