"use client";

import ProfileLinks from "./ProfileLinks";
import Link from "next/link";

interface CoinCardPopupProps {
  coinId: string;
  symbol?: string;
  name?: string;
  currentPrice?: number | null;
  marketCapRank?: number | null;
  telegramChannel?: string | null;
  onClose: () => void;
}

export default function CoinCardPopup({
  coinId,
  symbol,
  name,
  currentPrice,
  marketCapRank,
  telegramChannel,
  onClose,
}: CoinCardPopupProps) {
  const displaySymbol = symbol?.toUpperCase() ?? coinId.toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-xl">
              {displaySymbol.slice(0, 1)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{displaySymbol}/USD</h3>
              <p className="text-sm text-gray-500">{name ?? coinId}</p>
              {marketCapRank != null && (
                <span className="text-xs text-gray-500">#{marketCapRank}</span>
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

        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase font-bold">Price</p>
          <p className="font-mono text-lg text-brand-orange">
            {currentPrice != null
              ? `$${Number(currentPrice).toLocaleString(undefined, { maximumFractionDigits: 8 })}`
              : "—"}
          </p>
        </div>

        <ProfileLinks
          coinId={coinId}
          fallbackTelegram={telegramChannel}
          className="mb-4"
        />

        <div className="flex gap-3">
          <Link
            href={`/coins`}
            className="flex-1 px-4 py-2.5 bg-brand-orange text-black font-bold rounded-lg text-center hover:bg-brand-orange/90 transition-colors"
          >
            View All Coins
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
