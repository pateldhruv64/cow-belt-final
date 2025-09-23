import React, { useEffect, useState } from "react";
import { getCowDataById } from "../services/cowService";
import TemperatureTrendChart from "../components/TemperatureTrendChart";
import MotionActivityChart from "../components/MotionActivityChart";

const CowProfile = ({ cowId, onBack }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCowDataById(cowId);
        setRecords(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e) {
        setError("Failed to load cow data");
      } finally {
        setLoading(false);
      }
    };
    if (cowId) load();
  }, [cowId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const latest = records[0] || {};

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Cow Profile: {cowId}</h2>
        <button onClick={onBack} className="px-3 py-2 text-sm rounded border">← Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Temperature</div>
          <div className="text-2xl font-bold">{latest.temperature ?? "-"}°C</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Activity</div>
          <div className="text-2xl font-bold">{latest.motionChange ?? "-"}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Disease</div>
          <div className="text-2xl font-bold">{latest.disease || "Normal"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureTrendChart cowId={cowId} days={14} />
        <MotionActivityChart cowId={cowId} days={14} />
      </div>
    </div>
  );
};

export default CowProfile;




