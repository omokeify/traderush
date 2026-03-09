"use client";

import { useEffect, useState } from "react";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  current_price: number | null;
  telegram_channel: string | null;
  last_updated_at: string | null;
}

export default function CoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coins?limit=200")
      .then((r) => r.json())
      .then((d) => {
        setCoins(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          CoinGecko <span className="text-brand-orange">Coins</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Top coins from CoinGecko (refreshed via Manual Scan)
        </p>
      </header>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : coins.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 max-w-lg">
          <p className="text-gray-500 mb-4">
            No coins in database. Run a Manual Scan to fetch the top 1,000 coins from CoinGecko.
          </p>
          <a
            href="/manual-scan"
            className="inline-block px-4 py-2 bg-brand-orange text-black font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors"
          >
            Go to Manual Scan →
          </a>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-black/80 backdrop-blur border-b border-brand-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">#</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Coin</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Symbol</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Price</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Telegram</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-gray-400">{c.market_cap_rank ?? "—"}</td>
                    <td className="px-6 py-3 font-medium">{c.name}</td>
                    <td className="px-6 py-3 text-brand-orange font-mono uppercase">{c.symbol}</td>
                    <td className="px-6 py-3 font-mono">
                      {c.current_price != null
                        ? `$${Number(c.current_price).toLocaleString(undefined, { maximumFractionDigits: 8 })}`
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {c.telegram_channel ? "✓" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-brand-border text-sm text-gray-500">
            Showing {coins.length} coins
          </div>
        </div>
      )}
    </>
  );
}
