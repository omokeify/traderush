"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MomentumChart from "@/components/dashboard/MomentumChart";
import SignalCard from "@/components/dashboard/SignalCard";
import SignalCardPopup from "@/components/signals/SignalCardPopup";
import CoinCardPopup from "@/components/coins/CoinCardPopup";
import MonitoringCategoryCard from "@/components/dashboard/MonitoringCategoryCard";

interface Signal {
  id: string;
  coin_id: string;
  signal_type: string;
  entry_price: number;
  price_change_percent: number;
  created_at: string;
  coin?: { image?: string; category_name?: string; name?: string } | null;
}

interface Coin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  current_price: number | null;
  telegram_channel?: string | null;
}

interface Config {
  momentum_threshold?: number;
  monitoring_window_hours?: number;
}

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [positions, setPositions] = useState<Signal[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);
  const [popupSignalId, setPopupSignalId] = useState<string | null>(null);
  const [popupCoin, setPopupCoin] = useState<Coin | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [workerScouting, setWorkerScouting] = useState<boolean | null>(null);

  function loadData() {
    fetch("/api/worker-status")
      .then((r) => r.json())
      .then((d) => setWorkerScouting(d.scouting === true))
      .catch(() => setWorkerScouting(false));

    Promise.all([
      fetch("/api/preferences").then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ])
      .then(([prefs, c]) => {
        const categories = prefs?.selected_categories ?? [];
        setSelectedCategories(Array.isArray(categories) ? categories : []);
        setConfig(typeof c === "object" ? c : {});

        const categoriesParam =
          categories.length > 0 ? `&categories=${encodeURIComponent(categories.join(","))}` : "";

        return Promise.all([
          fetch(`/api/signals?limit=50${categoriesParam}`).then((r) => r.json()),
          fetch(`/api/positions${categoriesParam ? `?${categoriesParam.slice(1)}` : ""}`).then(
            (r) => r.json()
          ),
          fetch(`/api/coins?limit=10${categoriesParam}`).then((r) => r.json()),
        ]);
      })
      .then(([s, p, co]) => {
        setSignals(Array.isArray(s) ? s : []);
        setPositions(Array.isArray(p) ? p : []);
        setCoins(Array.isArray(co) ? co : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, []);

  const featuredSignal = signals[0];
  const featuredCoin = coins[0];
  const displaySignals = signals.slice(0, 5);

  return (
    <>
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Market <span className="text-brand-orange">Pulse</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time momentum analysis for 1,000+ assets
            {selectedCategories.length > 0 && (
              <span className="ml-2 text-brand-orange">
                • Filtered by {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"}
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="glass-panel px-4 py-2 rounded-lg flex flex-col items-end border-l-4 border-l-green-500">
            <div className="flex items-center gap-3 w-full justify-end">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Monitor Status
              </span>
              <span
                className={`flex items-center gap-1.5 text-[10px] font-medium ${
                  workerScouting ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {workerScouting ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-600" />
                  )}
                </span>
                Scouting
              </span>
              <span
                className={`flex items-center gap-1.5 text-[10px] font-medium ${
                  coins.length > 0 ? "text-green-400" : "text-gray-500"
                }`}
              >
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    coins.length > 0 ? "bg-green-500" : "bg-gray-600"
                  }`}
                />
                Seen
              </span>
            </div>
            <span className="text-sm font-mono text-green-400">
              {positions.length} Positions • {signals.length} Signals • {coins.length} Coins
            </span>
          </div>
          <div className="glass-panel px-4 py-2 rounded-lg flex flex-col items-end border-l-4 border-l-brand-orange">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Auto Sync
            </span>
            <span className="text-sm font-mono text-brand-orange">
              Daily
            </span>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden h-[340px] flex flex-col">
          <div className="card-scanline-horizontal" />
          <div className="card-scanline-vertical" />
          <div className="flex justify-between items-start z-10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-brand-orange/20 border border-brand-orange/40 text-brand-orange text-xs rounded font-bold">
                  {featuredSignal ? "FEATURED SIGNAL" : "MARKET LEADER"}
                </span>
                <h2 className="text-2xl font-bold">
                  {featuredSignal
                    ? `${featuredSignal.coin_id.toUpperCase()}/USDT`
                    : featuredCoin
                    ? `${featuredCoin.symbol.toUpperCase()}/USD`
                    : "—"}
                </h2>
              </div>
              <p className="text-4xl font-mono mt-2">
                {featuredSignal ? (
                  <>
                    ${Number(featuredSignal.entry_price).toLocaleString(undefined, {
                      maximumFractionDigits: 8,
                    })}{" "}
                    <span className="text-green-400 text-lg">
                      +{featuredSignal.price_change_percent}%
                    </span>
                  </>
                ) : featuredCoin?.current_price != null ? (
                  <span>
                    ${Number(featuredCoin.current_price).toLocaleString(undefined, {
                      maximumFractionDigits: 8,
                    })}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Run Manual Scan to load coins
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex-1 relative mt-4">
            <MomentumChart />
            <div className="absolute inset-0 pointer-events-none flex justify-around opacity-20">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-brand-orange to-transparent" />
              <div className="w-px h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent" />
              <div className="w-px h-full bg-gradient-to-b from-transparent via-brand-orange to-transparent" />
              <div className="w-px h-full bg-gradient-to-b from-transparent via-brand-orange to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center">
              <span className="w-2 h-2 bg-brand-orange rounded-full mr-2 animate-pulse" />
              Live Momentum Signals
            </h3>
            <Link
              href="/signals"
              className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-md hover:bg-brand-orange/20 hover:border-brand-orange transition-all"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : displaySignals.length > 0 ? (
              <>
                {displaySignals.map((s, i) => (
                  <SignalCard
                    key={s.id}
                    signalId={s.id}
                    coinId={s.coin_id}
                    signalType={s.signal_type}
                    entryPrice={s.entry_price}
                    priceChangePercent={s.price_change_percent}
                    isHighlighted={i === 0}
                    coin={s.coin}
                    onClick={setPopupSignalId}
                  />
                ))}
                <div className="border-t border-white/5 pt-4 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {["d1", "d2", "d3", "d4", "d5"].map((d) => (
                        <span
                          key={d}
                          className={`w-1.5 h-1.5 rounded-full bg-brand-orange dot-seq ${d}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                      Active Channels: <span className="text-brand-orange">Telegram</span> + <span className="text-brand-orange">CoinGecko</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest block mt-1">
                    Data Sources
                  </span>
                </div>
              </>
            ) : coins.length > 0 ? (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm mb-2">
                  Top coins (signals appear when worker detects announcements + ≥5% move)
                </p>
                {coins.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPopupCoin(c)}
                    onKeyDown={(e) => e.key === "Enter" && setPopupCoin(c)}
                    className="glass-panel p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors border border-white/5"
                  >
                    <div>
                      <span className="font-semibold">{c.symbol.toUpperCase()}</span>
                      <span className="text-gray-500 text-sm ml-2">#{c.market_cap_rank}</span>
                    </div>
                    <span className="font-mono text-brand-orange">
                      ${c.current_price != null
                        ? Number(c.current_price).toLocaleString(undefined, { maximumFractionDigits: 6 })
                        : "—"}
                    </span>
                  </div>
                ))}
                <Link href="/coins" className="text-xs text-brand-orange hover:underline block mt-2">
                  View all coins →
                </Link>
                <div className="border-t border-white/5 pt-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {["d1", "d2", "d3", "d4", "d5"].map((d) => (
                        <span
                          key={d}
                          className={`w-1.5 h-1.5 rounded-full bg-brand-orange dot-seq ${d}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                      Active Channels: <span className="text-brand-orange">Telegram</span> + <span className="text-brand-orange">CoinGecko</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest block mt-1">
                    Data Sources
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500 glass-panel p-6 rounded-xl">
                  Run Manual Scan to load coins. Signals need the worker (Telegram + price validation).
                </p>
                <div className="border-t border-white/5 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {["d1", "d2", "d3", "d4", "d5"].map((d) => (
                        <span
                          key={d}
                          className={`w-1.5 h-1.5 rounded-full bg-brand-orange dot-seq ${d}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                      Active Channels: <span className="text-brand-orange">Telegram</span> + <span className="text-brand-orange">CoinGecko</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest block mt-1">
                    Data Sources
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="col-span-4 space-y-6">
          <MonitoringCategoryCard coinsCount={coins.length} />

          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-500 px-2">
                Coins and Telegram sync run automatically. Set categories in Preferences.
              </p>
              <button
                onClick={async () => {
                  const res = await fetch("/api/demo/generate-signals", { method: "POST" });
                  const data = await res.json();
                  if (data.ok) {
                    loadData();
                  }
                  alert(data.ok ? `Generated ${data.count} demo signals` : data.error || "Failed");
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm"
              >
                Generate Demo Signals
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border-t-2 border-t-brand-orange/40">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
              Scanner Settings
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Momentum Threshold</span>
                <span className="text-xs font-mono">
                  {config.momentum_threshold ?? "—"}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Monitor Window</span>
                <span className="text-xs font-mono">
                  {config.monitoring_window_hours ?? "—"}h
                </span>
              </div>
              <Link
                href="/config"
                className="block text-center text-xs text-brand-orange hover:underline"
              >
                Edit Config →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {popupSignalId && (
        <SignalCardPopup
          signalId={popupSignalId}
          onClose={() => setPopupSignalId(null)}
        />
      )}
      {popupCoin && (
        <CoinCardPopup
          coinId={popupCoin.id}
          symbol={popupCoin.symbol}
          name={popupCoin.name}
          currentPrice={popupCoin.current_price}
          marketCapRank={popupCoin.market_cap_rank}
          telegramChannel={popupCoin.telegram_channel}
          onClose={() => setPopupCoin(null)}
        />
      )}
    </>
  );
}
