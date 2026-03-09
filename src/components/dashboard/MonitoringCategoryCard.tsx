"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MonitoringStatus {
  selected_categories: string[];
  coins_monitored: number;
  last_announcement_at: string | null;
  last_announcement_coin: string | null;
  last_signal_at: string | null;
  last_signal_coin: string | null;
}

interface Category {
  category_id: string;
  name: string;
}

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export default function MonitoringCategoryCard() {
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/monitoring").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([s, c]) => {
        setStatus(s);
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !status) return null;

  const categoryNames =
    status.selected_categories.length > 0
      ? status.selected_categories
          .map((id) => categories.find((c) => c.category_id === id)?.name ?? id.replace(/-/g, " "))
          .filter(Boolean)
      : ["All categories"];

  const isMonitoring = status.coins_monitored > 0;
  const hasActivity = status.last_announcement_at || status.last_signal_at;

  return (
    <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-orange">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Agent Monitoring
        </h3>
        <span
          className={`flex items-center gap-1.5 text-xs font-bold ${
            isMonitoring ? "text-green-400" : "text-amber-500"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isMonitoring ? "bg-green-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          {isMonitoring ? "Active" : "Setup required"}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Categories</p>
          <p className="text-sm font-medium">
            {categoryNames.join(", ")}
          </p>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Coins monitored</span>
          <span className="font-mono font-bold text-brand-orange">
            {status.coins_monitored}
          </span>
        </div>

        {hasActivity && (
          <div className="pt-2 border-t border-white/5 space-y-1">
            {status.last_announcement_at && (
              <p className="text-xs text-gray-400">
                Last announcement:{" "}
                <span className="text-white">
                  {status.last_announcement_coin?.toUpperCase()}
                </span>{" "}
                {formatTimeAgo(status.last_announcement_at)}
              </p>
            )}
            {status.last_signal_at && (
              <p className="text-xs text-gray-400">
                Last signal:{" "}
                <span className="text-brand-orange font-medium">
                  {status.last_signal_coin?.toUpperCase()}
                </span>{" "}
                {formatTimeAgo(status.last_signal_at)}
              </p>
            )}
          </div>
        )}

        {!isMonitoring && (
          <p className="text-xs text-amber-500/90">
            Set categories in Preferences, run Manual Scan with those categories, then Sync Telegram.
          </p>
        )}
      </div>

      <Link
        href="/preferences"
        className="mt-4 block text-center text-xs text-brand-orange hover:underline"
      >
        Edit Preferences →
      </Link>
    </div>
  );
}
