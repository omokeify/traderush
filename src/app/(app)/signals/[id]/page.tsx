"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  id: string;
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

export default function SignalDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<SignalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/signals/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.error ? null : d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const coin = data?.coin;
  const symbol = coin?.symbol?.toUpperCase() ?? data?.coin_id?.toUpperCase() ?? "—";
  const momentumColor =
    data?.signal_type === "strong_buy"
      ? "text-brand-orange"
      : data?.signal_type === "buy"
        ? "text-yellow-500"
        : "text-gray-400";

  return (
    <>
      <header className="mb-8 flex items-center gap-4">
        <Link
          href="/signals"
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          aria-label="Back to signals"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Signal <span className="text-brand-orange">Details</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Full token/coin profile and announcement
          </p>
        </div>
      </header>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : !data ? (
        <p className="text-gray-500 glass-panel p-6 rounded-xl">
          Signal not found.
        </p>
      ) : (
        <div className="space-y-6 max-w-2xl">
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              {coin?.image ? (
                <img src={coin.image} alt="" className="w-16 h-16 rounded-xl" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-2xl">
                  {symbol.slice(0, 1)}
                </div>
              )}
              <div>
                <h2 className="font-bold text-xl">{symbol}/USDT</h2>
                <p className="text-gray-500">{coin?.name ?? data.coin_id}</p>
                {coin?.category_name && (
                  <span className="text-sm text-brand-orange">{coin.category_name}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Entry Price</p>
                <p className="font-mono">
                  ${Number(data.entry_price).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Momentum</p>
                <p className={`font-mono font-bold ${momentumColor}`}>
                  +{data.price_change_percent}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Signal</p>
                <p className="capitalize">{data.signal_type.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Created</p>
                <p className="text-sm">{new Date(data.created_at).toLocaleString()}</p>
              </div>
            </div>

            {coin?.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">About</h3>
                <p className="text-gray-300 text-sm">{coin.description}</p>
              </div>
            )}

            {data?.coin_id && (
              <ProfileLinks
                coinId={data.coin_id}
                fallbackHomepage={coin?.homepage}
                fallbackTelegram={coin?.telegram_channel}
              />
            )}
          </div>

          {data.announcement && (
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Announcement</h3>
              {data.announcement.detected_at && (
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(data.announcement.detected_at).toLocaleString()}
                </p>
              )}
              {data.announcement.keywords_matched && data.announcement.keywords_matched.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {data.announcement.keywords_matched.map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 bg-brand-orange/20 text-brand-orange rounded text-xs"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {data.announcement.message_text ?? "—"}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
