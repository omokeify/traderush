"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProfileLinks from "@/components/coins/ProfileLinks";

interface CoinInfo {
  id: string;
  symbol?: string;
  name?: string;
  image?: string;
  category_name?: string;
  homepage?: string;
  description?: string;
  telegram_channel?: string;
}

interface AnnouncementInfo {
  message_text?: string;
  keywords_matched?: string[];
  detected_at?: string;
}

interface SignalDetail {
  id: string;
  coin_id: string;
  signal_type: string;
  entry_price: number;
  price_change_percent: number;
  created_at: string;
  coin: CoinInfo | null;
  announcement: AnnouncementInfo | null;
}

interface SignalCardPopupProps {
  signalId: string;
  onClose: () => void;
}

export default function SignalCardPopup({ signalId, onClose }: SignalCardPopupProps) {
  const [data, setData] = useState<SignalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/signals/${signalId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.error ? null : d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [signalId]);

  const coin = data?.coin;
  const symbol = coin?.symbol?.toUpperCase() ?? data?.coin_id?.toUpperCase() ?? "—";
  const momentumColor =
    data?.signal_type === "strong_buy"
      ? "text-brand-orange"
      : data?.signal_type === "buy"
        ? "text-yellow-500"
        : "text-gray-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading...</p>
        ) : !data ? (
          <p className="text-gray-400 text-center py-8">Failed to load</p>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {coin?.image ? (
                  <img src={coin.image} alt="" className="w-14 h-14 rounded-xl" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-xl">
                    {symbol.slice(0, 1)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{symbol}/USDT</h3>
                  <p className="text-sm text-gray-500">{coin?.name ?? data.coin_id}</p>
                  {coin?.category_name && (
                    <span className="text-xs text-brand-orange">{coin.category_name}</span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Price</p>
                <p className="font-mono text-sm">
                  ${Number(data.entry_price).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Momentum</p>
                <p className={`font-mono text-sm font-bold ${momentumColor}`}>
                  +{data.price_change_percent}%
                </p>
              </div>
            </div>

            {coin?.description && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-3">{coin.description}</p>
            )}

            {data?.coin_id && (
              <ProfileLinks
                coinId={data.coin_id}
                fallbackHomepage={coin?.homepage}
                fallbackTelegram={coin?.telegram_channel}
                className="mb-4"
              />
            )}

            <div className="flex gap-3">
              <Link
                href={`/signals/${signalId}`}
                className="flex-1 px-4 py-2.5 bg-brand-orange text-black font-bold rounded-lg text-center hover:bg-brand-orange/90 transition-colors"
              >
                More Details
              </Link>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
