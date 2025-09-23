import React, { useEffect, useState, useRef } from "react";
import { getLastCowData } from "../services/cowService";
import CowList from "../components/CowList";
import Navbar from "../components/Navbar";
import Statistics from "../components/Statistics";
import Alerts from "../components/Alerts";
import TemperatureTrendChart from "../components/TemperatureTrendChart";
import MotionActivityChart from "../components/MotionActivityChart";
import HealthGauge from "../components/HealthGauge";
import FarmMap from "../components/FarmMap";
import { getCowDataByDateRange } from "../services/cowService";
import { downloadCsv } from "../utils/exportCsv";
import CowProfile from "./CowProfile";
import SettingsPanel from "../components/SettingsPanel";
import AlertManagement from "../components/AlertManagement";
import { connectLive } from "../utils/liveClient";
import { notify } from "../utils/notify";

const Dashboard = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState(7);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCowId, setSelectedCowId] = useState(null);
  const [autoRefreshMs, setAutoRefreshMs] = useState(5000);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef(null);
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem('cowbelt_settings');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });

  const fetchData = async () => {
    try {
      const data = await getLastCowData();
      setCows(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (isLive) {
      intervalRef.current = setInterval(fetchData, autoRefreshMs);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, autoRefreshMs]);

  // Optional WebSocket live updates (if backend provides ws://host/live)
  useEffect(() => {
    if (!isLive) return;
    const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const wsUrl = api.replace(/^http/, 'ws') + "/live";
    const client = connectLive({
      url: wsUrl,
      onMessage: (payload) => {
        if (payload && Array.isArray(payload.data)) {
          setCows((prev) => {
            const merged = [...payload.data, ...prev];
            // keep latest 100
            return merged.slice(0, 100);
          });
          setLastUpdate(new Date());
          try {
            const critical = payload.data.find((d) => (d.riskLevel === 'Critical') || (Number(d.temperature) >= (settings?.criticalTemp ?? 40.5)));
            if (critical && settings?.pushEnabled) {
              notify({
                title: `Critical Alert - ${critical.cowId || ''}`,
                body: `Temp ${critical.temperature ?? ''}°C | ${critical.disease || ''}`
              });
            }
          } catch {}
        }
      }
    });
    return () => client.close();
  }, [isLive]);

  // Calculate alert count
  const alertCount = cows.filter(cow => 
    cow.temperature > 40 || 
    cow.temperature < 37 || 
    cow.disease !== "Normal" || 
    cow.motionChange < 5
  ).length;

  // Get unique cows
  const uniqueCows = cows.reduce((acc, cow) => {
    if (!acc.find(c => c.cowId === cow.cowId)) {
      acc.push(cow);
    }
    return acc;
  }, []);

  const handleExport = async () => {
    try {
      let rows = [];
      if (useDateRange && startDate && endDate) {
        const res = await getCowDataByDateRange(startDate, endDate);
        const data = Array.isArray(res?.data) ? res.data : [];
        rows = data.map((d) => ({
          timestamp: d.timestamp || d.createdAt || "",
          cowId: d.cowId || "",
          temperature: d.temperature ?? "",
          motionChange: d.motionChange ?? "",
          disease: d.disease || "",
          healthScore: d.healthScore ?? "",
        }));
        downloadCsv(`cow-data_${startDate}_to_${endDate}.csv`, rows);
      } else {
        rows = uniqueCows.map((d) => ({
          timestamp: d.timestamp || d.createdAt || "",
          cowId: d.cowId || "",
          temperature: d.temperature ?? "",
          motionChange: d.motionChange ?? "",
          disease: d.disease || "",
          healthScore: d.healthScore ?? "",
        }));
        downloadCsv(`cow-latest_${new Date().toISOString().split('T')[0]}.csv`, rows);
      }
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const handleSaveSettings = (s) => {
    setSettings(s);
    try { localStorage.setItem('cowbelt_settings', JSON.stringify(s)); } catch {}
  };

  if (selectedCowId) {
    return <CowProfile cowId={selectedCowId} onBack={() => setSelectedCowId(null)} />;
  }

  if (loading) {
    return (
      <>
        <Navbar totalCows={0} alertCount={0} lastUpdate={null} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading cow data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        totalCows={uniqueCows.length} 
        alertCount={alertCount} 
        lastUpdate={lastUpdate} 
      />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Top controls */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Auto-refresh:</label>
            <select
              value={autoRefreshMs}
              onChange={(e) => setAutoRefreshMs(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={0}>Off</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
            <button
              onClick={() => setIsLive((v) => !v)}
              className={`px-3 py-1 rounded text-sm ${isLive ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-700 text-white"
            >
              ⬇️ Export CSV
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        <Statistics cows={uniqueCows} />
        
        {/* Alerts Section */}
        <Alerts cows={uniqueCows} />

        {/* Settings */}
        <div className="mb-6">
          <SettingsPanel initial={settings} onSave={handleSaveSettings} />
        </div>

        {/* Alert Management */}
        <div className="mb-6">
          <AlertManagement />
        </div>
        
        {/* Historical Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center">🕒 Historical Data</h3>
              <p className="text-sm text-gray-500">View trends for a recent window or a custom date range.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Mode:</label>
                <select
                  value={useDateRange ? "range" : "days"}
                  onChange={(e) => setUseDateRange(e.target.value === "range")}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="days">Last N days</option>
                  <option value="range">Date range</option>
                </select>
              </div>
              {!useDateRange ? (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Days:</label>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={1}>1</option>
                    <option value={3}>3</option>
                    <option value={7}>7</option>
                    <option value={14}>14</option>
                    <option value={30}>30</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDays(7)} className="text-xs px-2 py-1 rounded border">7d</button>
                    <button onClick={() => setDays(14)} className="text-xs px-2 py-1 rounded border">14d</button>
                    <button onClick={() => setDays(30)} className="text-xs px-2 py-1 rounded border">30d</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { const t=new Date(); const s=new Date(); s.setDate(t.getDate()-7); setStartDate(s.toISOString().split('T')[0]); setEndDate(t.toISOString().split('T')[0]); }} className="text-xs px-2 py-1 rounded border">Last 7d</button>
                    <button onClick={() => { const t=new Date(); const s=new Date(); s.setDate(t.getDate()-30); setStartDate(s.toISOString().split('T')[0]); setEndDate(t.toISOString().split('T')[0]); }} className="text-xs px-2 py-1 rounded border">Last 30d</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        {uniqueCows.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Farm Map */}
            <div className="lg:col-span-2 xl:col-span-2">
              <FarmMap cows={uniqueCows} />
            </div>
            {/* Temperature Trends Chart */}
            <div className="lg:col-span-1">
              <TemperatureTrendChart 
                cowId={uniqueCows[0]?.cowId}
                days={!useDateRange ? days : undefined}
                startDate={useDateRange ? startDate : undefined}
                endDate={useDateRange ? endDate : undefined}
              />
            </div>
            
            {/* Motion Activity Chart */}
            <div className="lg:col-span-1">
              <MotionActivityChart 
                cowId={uniqueCows[0]?.cowId}
                days={!useDateRange ? days : undefined}
                startDate={useDateRange ? startDate : undefined}
                endDate={useDateRange ? endDate : undefined}
              />
            </div>
            
            {/* Health Gauge */}
            <div className="lg:col-span-1 xl:col-span-1">
              <HealthGauge 
                cowId={uniqueCows[0]?.cowId}
                healthScore={uniqueCows[0]?.healthScore || 85}
                temperature={uniqueCows[0]?.temperature || 38.5}
                motionChange={uniqueCows[0]?.motionChange || 45}
                disease={uniqueCows[0]?.disease || 'Normal'}
              />
            </div>
          </div>
        )}
        
        {/* Cows List Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              🐄 Cow Monitoring
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Showing {uniqueCows.length} cows
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-300'} rounded-full`}></div>
                <span className="text-sm text-gray-500">{isLive ? 'Live' : 'Paused'}</span>
              </div>
            </div>
          </div>
          
          {uniqueCows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐄</div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h4>
              <p className="text-gray-500">Waiting for sensor data from cows...</p>
            </div>
          ) : (
            <CowList cows={uniqueCows} onOpen={(cow) => setSelectedCowId(cow.cowId)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
