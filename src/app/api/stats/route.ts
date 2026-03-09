import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [signalsRes, positionsRes, coinsRes, coinsWithTgRes] = await Promise.all([
      supabase.from("signals").select("id", { count: "exact", head: true }),
      supabase.from("signals").select("id", { count: "exact", head: true }).eq("valid_signal", true),
      supabase.from("coins").select("id", { count: "exact", head: true }),
      supabase.from("coins").select("id", { count: "exact", head: true }).not("telegram_channel", "is", null),
    ]);

    const signalsTodayRes = await supabase
      .from("signals")
      .select("id", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`);

    return NextResponse.json({
      signals_total: signalsRes.count ?? 0,
      signals_today: signalsTodayRes.count ?? 0,
      positions: positionsRes.count ?? 0,
      coins_total: coinsRes.count ?? 0,
      coins_with_telegram: coinsWithTgRes.count ?? 0,
    });
  } catch {
    return NextResponse.json({
      signals_total: 0,
      signals_today: 0,
      positions: 0,
      coins_total: 0,
      coins_with_telegram: 0,
    });
  }
}
