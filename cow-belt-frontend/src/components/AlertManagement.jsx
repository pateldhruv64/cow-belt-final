import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AlertRow = ({ alert, onAction }) => {
  return (
    <tr className="border-b">
      <td className="px-3 py-2 text-sm">{alert.alertId}</td>
      <td className="px-3 py-2 text-sm">{alert.type}</td>
      <td className="px-3 py-2 text-sm">{alert.severity}</td>
      <td className="px-3 py-2 text-sm">{alert.status}</td>
      <td className="px-3 py-2 text-sm">{alert.source?.cowId || '-'}</td>
      <td className="px-3 py-2 text-sm">{new Date(alert.createdAt).toLocaleString()}</td>
      <td className="px-3 py-2 text-sm flex gap-2">
        <button className="text-xs px-2 py-1 rounded border" onClick={() => onAction('ack', alert)}>Acknowledge</button>
        <button className="text-xs px-2 py-1 rounded border" onClick={() => onAction('resolve', alert)}>Resolve</button>
        <button className="text-xs px-2 py-1 rounded border" onClick={() => onAction('escalate', alert)}>Escalate</button>
      </td>
    </tr>
  );
};

const AlertManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/alerts`);
      // === YAHAN PAR FIX KIYA GAYA HAI ===
      setAlerts(res.data.alerts || []);
      setError(null);
    } catch (e) {
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAction = async (type, alert) => {
    try {
      const endpoint = type === 'ack' ? 'acknowledge' : type === 'resolve' ? 'resolve' : 'escalate';
      await axios.put(`${API_URL}/api/alerts/${alert.alertId}/${endpoint}`);
      fetchAlerts();
    } catch (e) {
      console.error('Action failed', e);
    }
  };

  if (loading) return <div className="bg-white rounded-xl shadow p-6">Loading alerts...</div>;

  if (error) return <div className="bg-white rounded-xl shadow p-6 text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">🚨 Alert Management</h3>
        <button className="text-sm px-3 py-1 rounded border" onClick={fetchAlerts}>Refresh</button>
      </div>

      {/* 🛠️ SCROLLABLE TABLE AREA FIXED HERE */}
      <div className="overflow-auto max-h-[500px]">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2 text-xs uppercase">Alert ID</th>
              <th className="px-3 py-2 text-xs uppercase">Type</th>
              <th className="px-3 py-2 text-xs uppercase">Severity</th>
              <th className="px-3 py-2 text-xs uppercase">Status</th>
              <th className="px-3 py-2 text-xs uppercase">Cow</th>
              <th className="px-3 py-2 text-xs uppercase">Created</th>
              <th className="px-3 py-2 text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Ab yeh line sahi se kaam karegi */}
            {alerts.map((a) => (
              <AlertRow key={a.alertId} alert={a} onAction={handleAction} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertManagement;