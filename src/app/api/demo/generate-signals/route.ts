import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Generates demo signals from top coins for testing the dashboard.
 * Creates 3-5 sample signals with simulated 5-12% price movement.
 */
export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: coins } = await supabase
    .from("coins")
    .select("id, symbol, name, current_price")
    .order("market_cap_rank", { ascending: true, nullsFirst: false })
    .limit(5);

  if (!coins?.length) {
    return NextResponse.json({
      ok: false,
      error: "No coins in database. Run Manual Scan first.",
    });
  }

  const signals = [
    { type: "strong_buy" as const, change: 10.5 },
    { type: "strong_buy" as const, change: 8.2 },
    { type: "buy" as const, change: 6.1 },
    { type: "buy" as const, change: 5.3 },
    { type: "watch" as const, change: 4.8 },
  ];

  const rows = coins.slice(0, 5).map((c, i) => {
    const s = signals[i] ?? signals[0];
    const price = Number(c.current_price) || 100;
    const entryPrice = price / (1 + s.change / 100);
    return {
      coin_id: c.id,
      signal_type: s.type,
      entry_price: entryPrice,
      price_change_percent: s.change,
      valid_signal: true,
      metadata: { demo: true, keywords: ["demo"] },
    };
  });

  const { error } = await supabase.from("signals").insert(rows);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
