import React, { useMemo } from "react";

// Simple SVG-based farm map (no external deps). Distributes cows deterministically.
const FarmMap = ({ cows = [], width = 600, height = 360 }) => {
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = useMemo(() => {
    const seededRandom = (seed) => {
      let h = 2166136261;
      const s = String(seed);
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      // Convert to 0..1
      return (h >>> 0) / 4294967295;
    };

    return cows.map((cow, idx) => {
      const id = cow?.cowId || idx;
      const r1 = seededRandom(id + "x");
      const r2 = seededRandom(id + "y");
      const x = padding + r1 * innerW;
      const y = padding + r2 * innerH;
      return { x, y, cow };
    });
  }, [cows]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">🗺️ Farm Map</h3>
        <div className="text-sm text-gray-500">{cows.length} cows plotted</div>
      </div>
      <div className="overflow-auto">
        <svg width={width} height={height} className="rounded-lg border border-gray-200 bg-gray-50">
          {/* grid */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`v-${i}`} x1={padding + (i * innerW) / 5} y1={padding} x2={padding + (i * innerW) / 5} y2={height - padding} stroke="#e5e7eb" />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <line key={`h-${i}`} x1={padding} y1={padding + (i * innerH) / 3} x2={width - padding} y2={padding + (i * innerH) / 3} stroke="#e5e7eb" />
          ))}

          {/* field border */}
          <rect x={padding} y={padding} width={innerW} height={innerH} fill="#f9fafb" stroke="#d1d5db" />

          {/* cows */}
          {points.map((p, i) => {
            const temp = Number(p.cow?.temperature);
            let color = '#10b981';
            if (Number.isFinite(temp) && temp >= 39.5) color = '#f97316';
            if (Number.isFinite(temp) && temp >= 40.5) color = '#ef4444';
            const isSick = p.cow?.disease && p.cow.disease !== 'Normal';
            if (isSick) color = '#ef4444';
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={8} fill={color} stroke="#ffffff" strokeWidth={2} />
                <text x={p.x + 12} y={p.y + 4} className="text-xs fill-gray-700">
                  {p.cow?.cowId || 'COW'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default FarmMap;




