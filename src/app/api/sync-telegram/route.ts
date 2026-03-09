import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetches Telegram channel usernames from CoinGecko.
 * Aggregates ALL users' selected categories - syncs coins for platform-wide monitoring.
 * Called by cron. Requires CRON_SECRET when set.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "COINGECKO_API_KEY required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: prefsRows } = await supabase
    .from("user_preferences")
    .select("selected_categories");

  const selectedCategories = new Set<string>();
  for (const row of prefsRows ?? []) {
    const cats = (row as { selected_categories?: string[] }).selected_categories;
    if (Array.isArray(cats)) cats.forEach((c) => c && selectedCategories.add(c));
  }
  const categoriesList = Array.from(selectedCategories);

  let coinsQuery = supabase
    .from("coins")
    .select("id")
    .order("market_cap_rank", { ascending: true, nullsFirst: false })
    .limit(20);

  if (categoriesList.length > 0) {
    coinsQuery = coinsQuery.in("category_id", categoriesList);
  }

  const { data: coins } = await coinsQuery;

  if (!coins?.length) {
    return NextResponse.json({
      ok: false,
      error: categoriesList.length > 0
        ? "No coins in selected categories. Run Manual Scan with those categories first."
        : "No coins. Run Manual Scan first.",
    }, { status: 400 });
  }

  let updated = 0;
  for (const c of coins) {
    try {
      const res = await fetch(
        `${COINGECKO_BASE}/coins/${c.id}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=false`,
        { headers: { "x-cg-demo-api-key": apiKey } }
      );
      if (res.status === 429) {
        return NextResponse.json({
          ok: false,
          error: "Rate limited. Try again later.",
          updated,
        });
      }
      if (!res.ok) continue;

      const data = await res.json();
      const tg = data?.links?.telegram_channel_identifier;
      if (tg && typeof tg === "string") {
        await supabase.from("coins").update({ telegram_channel: tg }).eq("id", c.id);
        updated++;
      }
    } catch {
      // skip
    }
    await sleep(3000);
  }

  return NextResponse.json({ ok: true, updated });
}
