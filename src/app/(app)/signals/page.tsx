"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SignalCard from "@/components/dashboard/SignalCard";
import SignalCardPopup from "@/components/signals/SignalCardPopup";

interface Signal {
  id: string;
  coin_id: string;
  signal_type: string;
  entry_price: number;
  price_change_percent: number;
  created_at: string;
  coin?: { image?: string; category_name?: string; name?: string; homepage?: string } | null;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [popupSignalId, setPopupSignalId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((prefs) => {
        const categories = (prefs?.selected_categories ?? []) as string[];
        setSelectedCategories(Array.isArray(categories) ? categories : []);
        const categoriesParam =
          categories.length > 0 ? `?categories=${encodeURIComponent(categories.join(","))}` : "";
        return fetch(`/api/signals${categoriesParam}`).then((r) => r.json());
      })
      .then((d) => {
        setSignals(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredSignals =
    filter === "all"
      ? signals
      : signals.filter((s) => s.signal_type === filter);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Momentum <span className="text-brand-orange">Signals</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          All signals from the momentum engine
          {selectedCategories.length > 0 && (
            <span className="ml-2 text-brand-orange">
              • Filtered by {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"}
            </span>
          )}
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center">
            <span className="w-2 h-2 bg-brand-orange rounded-full mr-2 animate-pulse" />
            Live Momentum Signals
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                filter === "all"
                  ? "bg-brand-orange/20 border-brand-orange text-brand-orange border"
                  : "bg-white/5 border border-white/10 hover:bg-brand-orange/20 hover:border-brand-orange"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("strong_buy")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                filter === "strong_buy"
                  ? "bg-brand-orange/20 border-brand-orange text-brand-orange border"
                  : "bg-white/5 border border-white/10 hover:bg-brand-orange/20 hover:border-brand-orange"
              }`}
            >
              Strong Buy
            </button>
            <button
              onClick={() => setFilter("buy")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                filter === "buy"
                  ? "bg-brand-orange/20 border-brand-orange text-brand-orange border"
                  : "bg-white/5 border border-white/10 hover:bg-brand-orange/20 hover:border-brand-orange"
              }`}
            >
              Buy
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : filteredSignals.length === 0 ? (
            <p className="text-gray-500 glass-panel p-6 rounded-xl">
              No signals yet. Signals are generated when the worker detects a Telegram announcement + ≥5% price movement. Run the worker to monitor channels.
            </p>
          ) : (
            filteredSignals.map((s) => (
              <div key={s.id}>
                <SignalCard
                  signalId={s.id}
                  coinId={s.coin_id}
                  signalType={s.signal_type}
                  entryPrice={s.entry_price}
                  priceChangePercent={s.price_change_percent}
                  coin={s.coin}
                  onClick={setPopupSignalId}
                />
                <p className="text-xs text-gray-500 mt-1 ml-14">
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {popupSignalId && (
        <SignalCardPopup
          signalId={popupSignalId}
          onClose={() => setPopupSignalId(null)}
        />
      )}
    </>
  );
}
