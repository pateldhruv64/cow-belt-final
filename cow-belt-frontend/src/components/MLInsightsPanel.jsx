import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getMLPredictions,
  getMLInsights,
  getMLAnomalies,
  getMLPerformance,
} from "../services/cowService";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const Section = ({ title, children, right }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const Empty = ({ label = "No data" }) => (
  <div className="text-center text-gray-500 text-sm py-8">{label}</div>
);

export default function MLInsightsPanel({ defaultCowId, className = "" }) {
  const [daysPred, setDaysPred] = useState(30);
  const [daysInsights, setDaysInsights] = useState(7);
  const [hoursAnom, setHoursAnom] = useState(24);
  const [perfWindow, setPerfWindow] = useState(7);
  const [loading, setLoading] = useState(false);
  const [predData, setPredData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [performance, setPerformance] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pred, ins, anom, perf] = await Promise.all([
        getMLPredictions({ cowId: defaultCowId, days: daysPred }),
        getMLInsights(daysInsights),
        getMLAnomalies(hoursAnom),
        getMLPerformance(perfWindow),
      ]);
      setPredData(pred);
      setInsights(ins);
      setAnomalies(anom);
      setPerformance(perf);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {
    fetchAll();
  }, [defaultCowId, daysPred, daysInsights, hoursAnom, perfWindow]);

  const predSeries = useMemo(() => {
    if (!predData?.predictions?.length) return [];
    const item = defaultCowId
      ? predData.predictions.find((p) => p.cowId === defaultCowId)
      : predData.predictions[0];
    if (!item) return [];
    const tempPred = item.predictions?.temperature?.prediction || {};
    const motionPred = item.predictions?.motion?.prediction || {};
    const currentTemp = Number(item.currentData?.temperature ?? 0);
    const currentMotion = Number(item.currentData?.motionChange ?? 0);
    return [
      { time: "now", temperature: currentTemp, motion: currentMotion },
      {
        time: "nextHour",
        temperature: Number(tempPred.nextHour ?? currentTemp),
        motion: Number(motionPred.nextHour ?? currentMotion),
      },
      {
        time: "nextDay",
        temperature: Number(
          tempPred.nextDay ?? tempPred.nextHour ?? currentTemp
        ),
        motion: Number(
          motionPred.nextDay ?? motionPred.nextHour ?? currentMotion
        ),
      },
    ];
  }, [predData, defaultCowId]);

  const insightsFlat = useMemo(() => {
    if (!insights?.insights?.length) return [];
    return insights.insights.flatMap((i) =>
      i.insights.map((x) => ({
        cowId: i.cowId,
        priority: x.priority,
        message: x.insight || x.message || "",
        timestamp: i.timestamp,
      }))
    );
  }, [insights]);

  const anomalyRows = useMemo(() => anomalies?.anomalies || [], [anomalies]);

  const riskPie = useMemo(() => {
    const dist = performance?.metrics?.riskDistribution || {};
    return Object.entries(dist).map(([k, v]) => ({ name: k, value: v }));
  }, [performance]);

  return (
    <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 ${className}`}>
      <Section
        title="Predictive Trends"
        right={
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Days</label>
            <select
              className="text-xs border rounded px-2 py-1"
              value={daysPred}
              onChange={(e) => setDaysPred(Number(e.target.value))}
            >
              <option value={7}>7</option>
              <option value={14}>14</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
            <button
              className="text-xs px-2 py-1 border rounded"
              onClick={fetchAll}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        }
      >
        {predSeries.length === 0 ? (
          <Empty label="No predictions" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predSeries}>
                <XAxis dataKey="time" hide />
                <YAxis yAxisId="left" domain={[0, "auto"]} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, "auto"]}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  name="Temperature"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="motion"
                  stroke="#3b82f6"
                  name="Motion"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Section>

      <Section
        title="Health Insights"
        right={
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Days</label>
            <select
              className="text-xs border rounded px-2 py-1"
              value={daysInsights}
              onChange={(e) => setDaysInsights(Number(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={7}>7</option>
            </select>
          </div>
        }
      >
        {insightsFlat.length === 0 ? (
          <Empty label="No insights" />
        ) : (
          <ul className="space-y-2 max-h-64 overflow-auto">
            {insightsFlat.map((i, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 flex items-start gap-2"
              >
                <span
                  className={`mt-1 inline-block w-2 h-2 rounded-full ${
                    i.priority === "critical"
                      ? "bg-red-600"
                      : i.priority === "high"
                      ? "bg-orange-500"
                      : i.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></span>
                <span className="font-medium">{i.cowId}</span>
                <span className="text-gray-500">- {i.message}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Anomaly Detection"
        right={
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Hours</label>
            <select
              className="text-xs border rounded px-2 py-1"
              value={hoursAnom}
              onChange={(e) => setHoursAnom(Number(e.target.value))}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        }
      >
        {anomalyRows.length === 0 ? (
          <Empty label="No anomalies" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={anomalyRows.map((a) => ({
                  cowId: a.cowId,
                  count: a.anomalies?.length || 0,
                }))}
              >
                <XAxis dataKey="cowId" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Anomalies" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Section>

      <Section
        title="ML Performance"
        right={
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Days</label>
            <select
              className="text-xs border rounded px-2 py-1"
              value={perfWindow}
              onChange={(e) => setPerfWindow(Number(e.target.value))}
            >
              <option value={3}>3</option>
              <option value={7}>7</option>
              <option value={14}>14</option>
              <option value={30}>30</option>
            </select>
          </div>
        }
      >
        {!performance?.metrics ? (
          <Empty label="No metrics" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-gray-600 mb-2">Accuracy</div>
              <div className="text-3xl font-bold text-gray-800">
                {performance.metrics.accuracy}%
              </div>
              <div className="text-xs text-gray-500">
                Total predictions: {performance.metrics.totalPredictions}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-gray-600 mb-2">
                Risk Distribution
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPie}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={60}
                    >
                      {riskPie.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
