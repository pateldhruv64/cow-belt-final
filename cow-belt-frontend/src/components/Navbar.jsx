import React, { useState } from "react";

const Navbar = ({ totalCows, alertCount, lastUpdate }) => {
  const [isLive] = useState(true);

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;