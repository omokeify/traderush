"use client";

import { useEffect, useState } from "react";

export default function ConfigPage() {
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [threshold, setThreshold] = useState("");
  const [windowHours, setWindowHours] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => {
        setConfig(c);
        setThreshold(String(c.momentum_threshold ?? "5"));
        setWindowHours(String(c.monitoring_window_hours ?? "24"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          momentum_threshold: parseFloat(threshold) || 5,
          monitoring_window_hours: parseInt(windowHours, 10) || 24,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig({ ...config, momentum_threshold: parseFloat(threshold), monitoring_window_hours: parseInt(windowHours, 10) });
      }
      alert(res.ok ? "Saved" : data.error || "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-brand-orange">Config</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Scanner and engine settings (≥5% momentum threshold)
        </p>
      </header>

      <div className="glass-panel rounded-2xl p-6 max-w-2xl space-y-6">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Momentum Threshold (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="50"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum price movement to generate signal (default 5)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Monitoring Window (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={windowHours}
                onChange={(e) => setWindowHours(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                How long to validate announcements after detection (default 24)
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-brand-orange text-black font-bold rounded-lg hover:bg-brand-orange/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
