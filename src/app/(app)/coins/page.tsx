"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  current_price: number | null;
  telegram_channel: string | null;
  last_updated_at: string | null;
}

interface MomentumCoin {
  coin_id: string;
  symbol: string;
  name: string;
  signal_type?: string;
  price_change_percent?: number;
  entry_price?: number;
  signal_id?: string;
  created_at: string;
  source: "signal" | "announcement";
}

export default function CoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [momentumCoins, setMomentumCoins] = useState<MomentumCoin[]>([]);
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

  useEffect(() => {
    Promise.all([
      fetch("/api/signals?limit=100").then((r) => r.json()),
      fetch("/api/announcements?limit=100").then((r) => r.json()),
    ])
      .then(([signals, announcements]) => {
        const seen = new Set<string>();
        const list: MomentumCoin[] = [];
        const sigs = Array.isArray(signals) ? signals : [];
        const anns = Array.isArray(announcements) ? announcements : [];

        for (const s of sigs) {
          if (seen.has(s.coin_id)) continue;
          seen.add(s.coin_id);
          list.push({
            coin_id: s.coin_id,
            symbol: s.coin?.symbol ?? s.coin_id.toUpperCase(),
            name: s.coin?.name ?? s.coin_id,
            signal_type: s.signal_type,
            price_change_percent: s.price_change_percent ?? 0,
            entry_price: s.entry_price ?? 0,
            signal_id: s.id,
            created_at: s.created_at,
            source: "signal",
          });
        }
        for (const a of anns) {
          if (seen.has(a.coin_id)) continue;
          seen.add(a.coin_id);
          list.push({
            coin_id: a.coin_id,
            symbol: a.coin_id.toUpperCase(),
            name: a.coin_id,
            created_at: a.detected_at ?? a.created_at ?? new Date().toISOString(),
            source: "announcement",
          });
        }
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setMomentumCoins(list);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          CoinGecko <span className="text-brand-orange">Coins</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Top coins from CoinGecko + momentum coins from monitor (signals & announcements)
        </p>
      </header>

      {momentumCoins.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
            Momentum Coins
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Coins detected by the monitor (Telegram + price validation)
          </p>
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/80 backdrop-blur border-b border-brand-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Coin</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Signal</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Momentum</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Entry</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {momentumCoins.map((m) => (
                    <tr key={`${m.coin_id}-${m.source}-${m.signal_id ?? m.created_at}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-medium">{m.name}</span>
                        <span className="ml-2 text-brand-orange font-mono text-xs uppercase">{m.symbol}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          m.source === "signal" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {m.source === "signal" ? "Signal ✓" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {m.signal_type ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            m.signal_type === "strong_buy" ? "bg-green-500/20 text-green-400" :
                            m.signal_type === "buy" ? "bg-brand-orange/20 text-brand-orange" :
                            "bg-gray-500/20 text-gray-400"
                          }`}>
                            {m.signal_type.replace("_", " ")}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 font-mono">
                        {m.price_change_percent != null ? (
                          <span className="text-green-400">+{Number(m.price_change_percent).toFixed(2)}%</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 font-mono text-gray-400">
                        {m.entry_price != null
                          ? `$${Number(m.entry_price).toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                          : "—"}
                      </td>
                      <td className="px-6 py-3">
                        {m.signal_id ? (
                          <Link href={`/signals/${m.signal_id}`} className="text-brand-orange hover:underline text-sm">
                            View →
                          </Link>
                        ) : (
                          <Link href="/announcements" className="text-amber-400 hover:underline text-sm">
                            Announcements →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-brand-border text-sm text-gray-500">
              {momentumCoins.length} coin{momentumCoins.length !== 1 ? "s" : ""} from monitor
            </div>
          </div>
        </section>
      )}

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
