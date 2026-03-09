"use client";

import { useEffect, useState } from "react";

export default function ManualScanPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ category_id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [result, setResult] = useState<{ ok: boolean; coins_updated?: number; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  async function handleScan() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/manual/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedCategory ? { category: selectedCategory } : {}),
      });
      const data = await res.json();
      setResult(data);

    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Manual <span className="text-brand-orange">Scan</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Trigger a manual refresh of coin data from CoinGecko
        </p>
      </header>

      <div className="glass-panel rounded-2xl p-8 max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Category (optional)
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
          >
            <option value="">All coins (top by market cap)</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Filter by AI, RWA, Layer 1, etc. Leave empty for all.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={loading}
          className="w-full px-6 py-4 bg-brand-orange text-black font-bold rounded-xl hover:bg-brand-glow disabled:opacity-50 transition-colors"
        >
          {loading ? "Scanning..." : "Run CoinGecko Refresh"}
        </button>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              const res = await fetch("/api/sync-telegram", { method: "POST" });
              const data = await res.json();
              alert(data.ok ? `Synced ${data.updated} Telegram channels` : data.error || "Failed");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 disabled:opacity-50 transition-colors"
        >
          Sync Telegram Channels (top 20 coins)
        </button>
        {result && (
          <div
            className={`p-4 rounded-lg text-sm font-mono ${
              result.ok ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {result.ok
              ? `Updated ${result.coins_updated} coins`
              : result.error || "Failed"}
            {!result.ok && result.error?.includes("429") && (
              <a
                href="https://www.coingecko.com/en/api/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-brand-orange hover:underline"
              >
                Get free API key →
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
