import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ totalCows, alertCount, lastUpdate }) => {
  const [isLive] = useState(true);
  const { currentUser, hasRole } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/ml-insights', label: 'ML Insights', icon: '🤖' },
    { path: '/reports', label: 'Reports', icon: '📄', adminOnly: true },
    { path: '/users', label: 'Users', icon: '👤', adminOnly: true },
    { path: '/settings', label: 'Settings', icon: '⚙️', adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || hasRole('admin'));

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <h1 className="text-2xl font-bold text-white flex items-center">
              🐄 Cow Belt Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-green-200 text-sm">
                {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Navigation Links */}
            <div className="flex flex-wrap items-center gap-2">
              {filteredNavItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="text-white hover:text-green-200 px-3 py-1 rounded text-sm transition-colors"
                >
                  {item.icon} {item.label}
                </a>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalCows || 0}</div>
                <div className="text-xs text-green-200">Total Cows</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-300">{alertCount || 0}</div>
                <div className="text-xs text-green-200">Alerts</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-green-200">
                  Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-sm text-green-200">
              {currentUser?.name} ({currentUser?.role})
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;