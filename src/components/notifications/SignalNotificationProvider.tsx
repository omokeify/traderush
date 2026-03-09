"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function playNotificationSound() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    playTone(880, 0, 0.1);
    playTone(1100, 0.12, 0.15);
  } catch {
    // Audio not supported
  }
}

export default function SignalNotificationProvider({
  children,
  soundEnabled = true,
  browserNotifications = true,
}: {
  children: React.ReactNode;
  soundEnabled?: boolean;
  browserNotifications?: boolean;
}) {
  useEffect(() => {
    if (!soundEnabled && !browserNotifications) return;

    const supabase = createClient();

    const channel = supabase
      .channel("signals-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals" },
        (payload) => {
          const signal = payload.new as { coin_id?: string; signal_type?: string };
          const title = "New Signal";
          const body = `${(signal.coin_id ?? "Coin").toUpperCase()} – ${(signal.signal_type ?? "buy").replace("_", " ")}`;

          if (soundEnabled) playNotificationSound();

          if (browserNotifications && "Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body, icon: "/favicon.ico" });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled, browserNotifications]);

  return <>{children}</>;
}
