import React from "react";
import SettingsPanel from "../components/SettingsPanel";
import AlertManagement from "../components/AlertManagement";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { hasRole } = useAuth();

  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar totalCows={0} alertCount={0} lastUpdate={null} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600">You need admin privileges to access settings.</p>
          </div>
        </div>
      </div>
    );
  }

  const [settings, setSettings] = React.useState(() => {
    try {
      const s = localStorage.getItem('cowbelt_settings');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });

  const handleSaveSettings = (s) => {
    setSettings(s);
    try { localStorage.setItem('cowbelt_settings', JSON.stringify(s)); } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar totalCows={0} alertCount={0} lastUpdate={null} />
      
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Settings & Configuration</h1>
          <p className="text-gray-600">Configure system settings, thresholds, and alert management</p>
        </div>

        {/* Settings Panel */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">System Configuration</h3>
          <SettingsPanel initial={settings} onSave={handleSaveSettings} />
        </div>

        {/* Alert Management */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Alert Management</h3>
          <AlertManagement />
        </div>
      </div>
    </div>
  );
};

export default Settings;
