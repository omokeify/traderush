"use client";

import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  coin_id: string;
  keywords_matched: string[];
  detected_at: string;
  signal_generated: boolean;
  price_at_detection: number | null;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        setAnnouncements(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-brand-orange">Announcements</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Telegram announcements detected by the worker (pending signal validation)
        </p>
      </header>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-gray-500 glass-panel p-6 rounded-xl">
            No announcements yet. Run the worker with Telegram channels configured.
          </p>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="glass-panel p-4 rounded-xl flex justify-between items-start"
            >
              <div>
                <span className="font-semibold">{a.coin_id.toUpperCase()}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {new Date(a.detected_at).toLocaleString()}
                </span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {a.keywords_matched?.map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 bg-brand-orange/20 text-brand-orange text-xs rounded"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                {a.signal_generated ? (
                  <span className="text-green-400 text-sm">Signal ✓</span>
                ) : (
                  <span className="text-gray-500 text-sm">Pending</span>
                )}
                {a.price_at_detection != null && (
                  <p className="text-xs text-gray-500 mt-1">
                    ${Number(a.price_at_detection).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
