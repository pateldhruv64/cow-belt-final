import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { getMLAnomalies } from "../services/cowService";

const formatTime = (ts) => {
  try {
    return new Date(ts).toLocaleString();
  } catch { return String(ts || ""); }
};

export default function AnomalyDetection({ className = "" }) {
  const [hours, setHours] = useState(24);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMLAnomalies(hours);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const rows = useMemo(() => {
    const list = data?.anomalies || [];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((r) => r.cowId?.toLowerCase().includes(q) || (r.anomalies || []).some(a => (a.type || a.code || "").toLowerCase().includes(q)));
  }, [data, query]);

  const chartData = useMemo(() => rows.map(r => ({ cowId: r.cowId, count: r.anomalies?.length || 0 })), [rows]);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Anomaly Detection</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Hours</label>
          <select className="text-xs border rounded px-2 py-1" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by cow/anomaly"
            className="text-xs border rounded px-2 py-1"
          />
          <button onClick={fetchData} disabled={loading} className="text-xs px-2 py-1 rounded border">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-8">No anomalies</div>
      ) : (
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="cowId" hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Anomalies" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-2 py-2">Cow ID</th>
              <th className="px-2 py-2">Timestamp</th>
              <th className="px-2 py-2">Anomalies</th>
              <th className="px-2 py-2">Latest Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-2 py-2 font-medium text-gray-800">{r.cowId}</td>
                <td className="px-2 py-2 text-gray-600">{formatTime(r.timestamp)}</td>
                <td className="px-2 py-2">
                  <ul className="list-disc pl-5 text-gray-700">
                    {(r.anomalies || []).map((a, i) => (
                      <li key={i}>{a.type || a.code || 'Anomaly'}{a.message ? ` - ${a.message}` : ''}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-2 py-2 text-gray-700">
                  <div className="flex flex-col gap-0.5">
                    <span>Temp: {r.data?.temperature ?? '-'}°C</span>
                    <span>Motion: {r.data?.motionChange ?? '-'}</span>
                    <span>Disease: {r.data?.disease ?? '-'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


