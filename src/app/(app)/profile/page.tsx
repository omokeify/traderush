"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    display_name: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.display_name != null) setProfile((p) => ({ ...p, display_name: d.display_name ?? "" }));
        if (d.avatar_url != null) setProfile((p) => ({ ...p, avatar_url: d.avatar_url ?? "" }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      alert(data.ok ? "Saved" : data.error || "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-400">Loading...</div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-brand-orange">Profile</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Your display name and avatar
        </p>
      </header>

      <div className="glass-panel rounded-2xl p-8 max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Display name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-brand-border focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
            placeholder="Your name"
            value={profile.display_name}
            onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Avatar URL</label>
          <input
            type="url"
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-brand-border focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
            placeholder="https://..."
            value={profile.avatar_url}
            onChange={(e) => setProfile((p) => ({ ...p, avatar_url: e.target.value }))}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-brand-orange text-black font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </>
  );
}
