import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { refreshCoins } from "@/lib/coin-refresh";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Cron: Daily coin refresh + Telegram sync.
 * Call with: Authorization: Bearer CRON_SECRET
 * Aggregates all users' categories and refreshes coins + syncs Telegram.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: prefsRows } = await supabase
    .from("user_preferences")
    .select("selected_categories");

  const categories = new Set<string>();
  for (const row of prefsRows ?? []) {
    const cats = (row as { selected_categories?: string[] }).selected_categories;
    if (Array.isArray(cats)) cats.forEach((c) => c && categories.add(c));
  }

  let totalCoins = 0;
  if (categories.size > 0) {
    for (const cat of categories) {
      const result = await refreshCoins({ category: cat });
      totalCoins += result.count;
      await sleep(6000);
    }
  } else {
    const result = await refreshCoins({});
    totalCoins = result.count;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const syncRes = await fetch(`${origin}/api/sync-telegram`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cronSecret && { Authorization: `Bearer ${cronSecret}` }),
    },
  });
  const syncData = await syncRes.json();

  return NextResponse.json({
    ok: true,
    coins_refreshed: totalCoins,
    telegram_synced: syncData.updated ?? 0,
  });
}
