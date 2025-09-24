import React, { useEffect, useMemo, useState } from "react";
import { getAvailableReports, getReportStatistics, generateReport, exportReport } from "../services/cowService";

const downloadBlob = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch {}
};

export default function ReportGenerator({ className = "" }) {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ reportTypes: [], exportFormats: [] });
  const [stats, setStats] = useState(null);
  const [type, setType] = useState("health_summary");
  const [format, setFormat] = useState("json");
  const [params, setParams] = useState({ farmId: "", days: 7, date: "", weekStart: "" });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const fetchMeta = async () => {
    const m = await getAvailableReports();
    setMeta(m);
  };

  const fetchStats = async () => {
    const s = await getReportStatistics(30);
    setStats(s?.statistics || null);
  };

  useEffect(() => { fetchMeta(); fetchStats(); }, []);

  const fields = useMemo(() => {
    const selected = meta.reportTypes?.find(r => r.type === type);
    return selected?.parameters || [];
  }, [meta, type]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const usableParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined && v !== null));
      const res = await generateReport({ type, params: usableParams });
      if (res?.success) {
        setPreview(res.report);
      } else {
        setError('Failed to generate report: ' + (res?.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Error generating report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const usableParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined && v !== null));
      const res = await exportReport({ type, format, params: usableParams });
      
      if (format === 'pdf') {
        // Handle HTML response for PDF
        const htmlContent = res.data;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const filename = `cow-belt-${type}-report.html`;
        downloadBlob(blob, filename);
        
        // Show instruction for PDF conversion
        alert('HTML file downloaded! To convert to PDF:\n1. Open the HTML file in your browser\n2. Press Ctrl+P (Cmd+P on Mac)\n3. Select "Save as PDF" in print options');
      } else {
        const filename = `cow-belt-${type}-report.${format}`;
        downloadBlob(res.data, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Report Generator</h3>
          <p className="text-sm text-gray-500">Generate and export health, daily, weekly and alert reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerate} disabled={loading} className="px-3 py-1 text-sm rounded border">{loading ? 'Working...' : 'Generate'}</button>
          <button onClick={handleExport} disabled={loading} className="px-3 py-1 text-sm rounded bg-green-600 text-white">{loading ? 'Exporting...' : 'Export'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Report Type</label>
          <select className="border rounded px-2 py-1 text-sm" value={type} onChange={e => setType(e.target.value)}>
            {meta.reportTypes?.map((r) => (
              <option key={r.type} value={r.type}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Export Format</label>
          <select className="border rounded px-2 py-1 text-sm" value={format} onChange={e => setFormat(e.target.value)}>
            {meta.exportFormats?.map((f) => (
              <option key={f.format} value={f.format}>{f.name}</option>
            ))}
          </select>
        </div>

        {fields.includes('farmId') && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Farm ID</label>
            <input className="border rounded px-2 py-1 text-sm" value={params.farmId} onChange={e => setParams({ ...params, farmId: e.target.value })} placeholder="optional" />
          </div>
        )}
        {fields.includes('days') && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Days</label>
            <input type="number" className="border rounded px-2 py-1 text-sm" value={params.days} onChange={e => setParams({ ...params, days: Number(e.target.value) })} />
          </div>
        )}
        {fields.includes('date') && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Date</label>
            <input type="date" className="border rounded px-2 py-1 text-sm" value={params.date} onChange={e => setParams({ ...params, date: e.target.value })} />
          </div>
        )}
        {fields.includes('weekStart') && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Week Start</label>
            <input type="date" className="border rounded px-2 py-1 text-sm" value={params.weekStart} onChange={e => setParams({ ...params, weekStart: e.target.value })} />
          </div>
        )}
      </div>

      <div className="rounded-xl border p-4 bg-gray-50">
        <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
        {error ? (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
        ) : !preview ? (
          <div className="text-sm text-gray-500">No preview yet. Click Generate to see report content.</div>
        ) : (
          <pre className="text-xs overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(preview, null, 2)}</pre>
        )}
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Generation Statistics</div>
        {!stats ? (
          <div className="text-sm text-gray-500">No stats available</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Generated</div>
              <div className="font-semibold">{stats.totalReportsGenerated}</div>
            </div>
            <div>
              <div className="text-gray-500">Most Requested</div>
              <div className="font-semibold">{stats.mostRequestedReport}</div>
            </div>
            <div>
              <div className="text-gray-500">Avg Time</div>
              <div className="font-semibold">{stats.averageGenerationTime}</div>
            </div>
            <div>
              <div className="text-gray-500">Last Generated</div>
              <div className="font-semibold">{new Date(stats.lastGenerated).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


