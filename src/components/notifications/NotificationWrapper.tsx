"use client";

import { useEffect, useState } from "react";
import SignalNotificationProvider from "./SignalNotificationProvider";

export default function NotificationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<{
    sound_enabled?: boolean;
    browser_notifications?: boolean;
  }>({});

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((d) => setPrefs(d))
      .catch(() => {});
  }, []);

  return (
    <SignalNotificationProvider
      soundEnabled={prefs.sound_enabled ?? true}
      browserNotifications={prefs.browser_notifications ?? true}
    >
      {children}
    </SignalNotificationProvider>
  );
}
