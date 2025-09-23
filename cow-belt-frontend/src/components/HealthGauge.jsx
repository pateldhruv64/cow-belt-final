import React, { useState, useEffect } from "react";

const HealthGauge = ({ cowId, healthScore, temperature, motionChange, disease }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (healthScore !== undefined) {
      setIsAnimating(true);
      const targetScore = healthScore;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentScore = easeOutCubic * targetScore;
        
        setAnimatedScore(currentScore);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [healthScore]);

  // Calculate health status
  const getHealthStatus = (score) => {
    if (score >= 90) return { status: 'Excellent', color: '#10b981', bgColor: '#f0fdf4', icon: '🌟' };
    if (score >= 80) return { status: 'Good', color: '#22c55e', bgColor: '#f0fdf4', icon: '✅' };
    if (score >= 70) return { status: 'Fair', color: '#eab308', bgColor: '#fefce8', icon: '⚠️' };
    if (score >= 60) return { status: 'Poor', color: '#f97316', bgColor: '#fff7ed', icon: '🩺' };
    return { status: 'Critical', color: '#ef4444', bgColor: '#fef2f2', icon: '🚨' };
  };

  // SVG Gauge Component
  const SVGHealthGauge = ({ score, size = 200 }) => {
    const radius = (size - 40) / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const strokeWidth = 12;
    
    // Calculate circumference
    const circumference = 2 * Math.PI * radius;
    
    // Calculate stroke dash array for progress
    const progress = (score / 100) * circumference;
    const dashArray = `${progress} ${circumference}`;
    
    // Color based on score
    const healthStatus = getHealthStatus(score);
    
    return (
      <div className="relative inline-block">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            opacity="0.3"
          />
          
          {/* Progress circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={healthStatus.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={dashArray}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
            }}
          />
          
          {/* Gradient effect */}
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={healthStatus.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={healthStatus.color} stopOpacity="1" />
            </linearGradient>
          </defs>
          
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="url(#healthGradient)"
            strokeWidth={strokeWidth - 2}
            strokeLinecap="round"
            strokeDasharray={dashArray}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold" style={{ color: healthStatus.color }}>
            {Math.round(score)}
          </div>
          <div className="text-sm text-gray-600">Health Score</div>
          {isAnimating && (
            <div className="text-xs text-blue-500 animate-pulse">Updating...</div>
          )}
        </div>
      </div>
    );
  };

  // Mini gauges for individual metrics
  const MiniGauge = ({ label, value, max, color, icon, unit = '' }) => {
    const percentage = (value / max) * 100;
    const size = 80;
    const radius = (size - 16) / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const strokeWidth = 6;
    
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;
    const dashArray = `${progress} ${circumference}`;
    
    return (
      <div className="text-center">
        <div className="relative inline-block mb-2">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              opacity="0.3"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={dashArray}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold" style={{ color: color }}>
              {value.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">{unit}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="text-xs text-gray-500">{percentage.toFixed(0)}%</div>
      </div>
    );
  };

  // Temperature gauge
  const TemperatureGauge = () => {
    let color = '#10b981'; // Normal
    let max = 45;
    
    if (temperature >= 40.5) {
      color = '#ef4444'; // Critical
    } else if (temperature >= 39.5) {
      color = '#f97316'; // High
    } else if (temperature <= 36.0) {
      color = '#3b82f6'; // Low
    }
    
    return (
      <MiniGauge
        label="Temperature"
        value={temperature}
        max={max}
        color={color}
        icon="🌡️"
        unit="°C"
      />
    );
  };

  // Motion gauge
  const MotionGauge = () => {
    let color = '#10b981'; // Normal
    let max = 150;
    
    if (motionChange >= 100) {
      color = '#ef4444'; // Very Active
    } else if (motionChange >= 60) {
      color = '#f97316'; // Active
    } else if (motionChange <= 10) {
      color = '#6b7280'; // Inactive
    }
    
    return (
      <MiniGauge
        label="Activity"
        value={motionChange}
        max={max}
        color={color}
        icon="🏃"
        unit=""
      />
    );
  };

  // Disease status indicator
  const DiseaseIndicator = () => {
    const isHealthy = disease === 'Normal';
    const statusColor = isHealthy ? '#10b981' : '#ef4444';
    const statusBg = isHealthy ? '#f0fdf4' : '#fef2f2';
    
    return (
      <div 
        className="p-3 rounded-lg text-center"
        style={{ backgroundColor: statusBg }}
      >
        <div className="text-2xl mb-1">{isHealthy ? '✅' : '🩺'}</div>
        <div className="text-sm font-medium text-gray-800">Health Status</div>
        <div className="text-sm font-bold" style={{ color: statusColor }}>
          {disease}
        </div>
      </div>
    );
  };

  const healthStatus = getHealthStatus(animatedScore);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          {healthStatus.icon} Health Gauge
          {cowId && <span className="ml-2 text-sm text-gray-500">({cowId})</span>}
        </h3>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main Health Gauge */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <SVGHealthGauge score={animatedScore} size={220} />
          
          {/* Health status badge */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div 
              className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
              style={{ backgroundColor: healthStatus.color }}
            >
              {healthStatus.status}
            </div>
          </div>
        </div>
      </div>

      {/* Mini Gauges Row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <TemperatureGauge />
        <MotionGauge />
        <DiseaseIndicator />
      </div>

      {/* Health Insights */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: healthStatus.bgColor }}>
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <span className="text-lg mr-2">{healthStatus.icon}</span>
          Health Insights
        </h4>
        
        <div className="space-y-2 text-sm">
          {animatedScore >= 90 && (
            <div className="text-green-700">🌟 Excellent health! All vitals are within optimal ranges.</div>
          )}
          {animatedScore >= 80 && animatedScore < 90 && (
            <div className="text-green-700">✅ Good health condition with minor variations.</div>
          )}
          {animatedScore >= 70 && animatedScore < 80 && (
            <div className="text-yellow-700">⚠️ Fair health. Monitor closely for any changes.</div>
          )}
          {animatedScore >= 60 && animatedScore < 70 && (
            <div className="text-orange-700">🩺 Poor health detected. Immediate attention recommended.</div>
          )}
          {animatedScore < 60 && (
            <div className="text-red-700">🚨 Critical health condition! Immediate veterinary intervention required.</div>
          )}
          
          {/* Specific recommendations */}
          {temperature >= 40.5 && (
            <div className="text-red-700 mt-2">🌡️ High fever detected. Ensure proper cooling and ventilation.</div>
          )}
          {temperature <= 36.0 && (
            <div className="text-blue-700 mt-2">❄️ Low temperature. Provide warmth and monitor closely.</div>
          )}
          {motionChange <= 10 && (
            <div className="text-gray-700 mt-2">😴 Low activity level. Check for signs of illness or lethargy.</div>
          )}
          {motionChange >= 100 && (
            <div className="text-orange-700 mt-2">🏃 High activity. Monitor for signs of stress or agitation.</div>
          )}
        </div>
      </div>

      {/* Progress bar for overall health */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Health Progress</span>
          <span className="text-sm font-bold" style={{ color: healthStatus.color }}>
            {Math.round(animatedScore)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${animatedScore}%`,
              backgroundColor: healthStatus.color,
              boxShadow: `0 0 10px ${healthStatus.color}40`
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default HealthGauge;


