"use client";

import { useEffect, useState } from "react";

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState({
    selected_categories: [] as string[],
    notify_telegram: true,
    notify_email: false,
    notify_webhook: false,
    webhook_url: "",
    email: "",
    telegram_chat_id: "",
    sound_enabled: true,
    browser_notifications: true,
  });
  const [categories, setCategories] = useState<{ category_id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/preferences").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([p, c]) => {
        setPrefs((prev) => ({
          ...prev,
          selected_categories: p.selected_categories ?? [],
          notify_telegram: p.notify_telegram ?? true,
          notify_email: p.notify_email ?? false,
          notify_webhook: p.notify_webhook ?? false,
          webhook_url: p.webhook_url ?? "",
          email: p.email ?? "",
          telegram_chat_id: p.telegram_chat_id ?? "",
          sound_enabled: p.sound_enabled ?? true,
          browser_notifications: p.browser_notifications ?? true,
        }));
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      alert((await res.json()).ok ? "Saved" : "Failed");
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(id: string) {
    setPrefs((p) => ({
      ...p,
      selected_categories: p.selected_categories.includes(id)
        ? p.selected_categories.filter((c) => c !== id)
        : [...p.selected_categories, id],
    }));
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-brand-orange">Preferences</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Categories to monitor and how you receive updates
        </p>
      </header>

      <div className="glass-panel rounded-2xl p-8 max-w-2xl space-y-8">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            <section>
              <h3 className="text-lg font-bold mb-4">Categories to Monitor</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select project categories (AI, RWA, etc.). Coins and Telegram sync automatically.
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 20).map((c) => (
                  <button
                    key={c.category_id}
                    onClick={() => toggleCategory(c.category_id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      prefs.selected_categories.includes(c.category_id)
                        ? "bg-brand-orange text-black"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-4">Alerts & Sounds</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={prefs.sound_enabled}
                    onChange={(e) => setPrefs((p) => ({ ...p, sound_enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Sound alert when new signal arrives</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={prefs.browser_notifications}
                    onChange={(e) => setPrefs((p) => ({ ...p, browser_notifications: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Browser notification when new signal arrives</span>
                </label>
                {prefs.browser_notifications && (
                  <button
                    type="button"
                    onClick={async () => {
                      if ("Notification" in window) {
                        const p = await Notification.requestPermission();
                        alert(p === "granted" ? "Notifications enabled" : "Permission denied");
                      }
                    }}
                    className="text-sm text-brand-orange hover:underline"
                  >
                    Request notification permission
                  </button>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-4">How You Get Updates</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={prefs.notify_telegram}
                    onChange={(e) => setPrefs((p) => ({ ...p, notify_telegram: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Telegram (per-user)</span>
                </label>
                <input
                  type="text"
                  placeholder="Your Telegram Chat ID (e.g. 123456789)"
                  value={prefs.telegram_chat_id}
                  onChange={(e) => setPrefs((p) => ({ ...p, telegram_chat_id: e.target.value }))}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500">
                  Message your bot first, then get your chat ID from{" "}
                  <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-brand-orange hover:underline">@userinfobot</a>
                </p>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={prefs.notify_email}
                    onChange={(e) => setPrefs((p) => ({ ...p, notify_email: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={prefs.email}
                  onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
                />
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={prefs.notify_webhook}
                    onChange={(e) => setPrefs((p) => ({ ...p, notify_webhook: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Webhook (POST to your trading bot URL)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://your-bot.com/webhook"
                  value={prefs.webhook_url}
                  onChange={(e) => setPrefs((p) => ({ ...p, webhook_url: e.target.value }))}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
                />
              </div>
            </section>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-brand-orange text-black font-bold rounded-lg hover:bg-brand-orange/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
