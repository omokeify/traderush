"use client";

import { useEffect, useState } from "react";
import SignalCard from "@/components/dashboard/SignalCard";
import SignalCardPopup from "@/components/signals/SignalCardPopup";

interface Position {
  id: string;
  coin_id: string;
  signal_type: string;
  entry_price: number;
  price_change_percent: number;
  created_at: string;
  coin?: { image?: string; category_name?: string; name?: string } | null;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
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
        return fetch(`/api/positions${categoriesParam}`).then((r) => r.json());
      })
      .then((d) => {
        setPositions(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Active <span className="text-brand-orange">Positions</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Valid signals currently being tracked
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
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Positions
          </h3>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : positions.length === 0 ? (
            <p className="text-gray-500 glass-panel p-6 rounded-xl">
              No active positions. Positions are valid buy signals from the momentum engine. Run the worker to generate signals.
            </p>
          ) : (
            positions.map((p) => (
              <div key={p.id}>
                <SignalCard
                  signalId={p.id}
                  coinId={p.coin_id}
                  signalType={p.signal_type}
                  entryPrice={p.entry_price}
                  priceChangePercent={p.price_change_percent}
                  coin={(p as { coin?: object }).coin}
                  onClick={setPopupSignalId}
                />
                <p className="text-xs text-gray-500 mt-1 ml-14">
                  {new Date(p.created_at).toLocaleString()}
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
