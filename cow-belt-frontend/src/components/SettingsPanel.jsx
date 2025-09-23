import React, { useState } from "react";

const SettingsPanel = ({ initial = {}, onSave }) => {
  const [highTemp, setHighTemp] = useState(initial.highTemp ?? 39.5);
  const [criticalTemp, setCriticalTemp] = useState(initial.criticalTemp ?? 40.5);
  const [lowActivity, setLowActivity] = useState(initial.lowActivity ?? 10);
  const [pushEnabled, setPushEnabled] = useState(initial.pushEnabled ?? false);

  const handleSave = () => {
    onSave && onSave({ highTemp, criticalTemp, lowActivity, pushEnabled });
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">⚙️ Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">High Temperature (°C)</label>
          <input type="number" step="0.1" className="w-full border rounded px-2 py-1"
            value={highTemp} onChange={(e) => setHighTemp(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Critical Temperature (°C)</label>
          <input type="number" step="0.1" className="w-full border rounded px-2 py-1"
            value={criticalTemp} onChange={(e) => setCriticalTemp(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Low Activity Threshold</label>
          <input type="number" className="w-full border rounded px-2 py-1"
            value={lowActivity} onChange={(e) => setLowActivity(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input id="push" type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
          <label htmlFor="push" className="text-sm text-gray-700">Enable Push Notifications</label>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={handleSave} className="px-3 py-2 rounded bg-green-600 text-white text-sm">Save</button>
      </div>
    </div>
  );
};

export default SettingsPanel;




