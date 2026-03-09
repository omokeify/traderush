import { NextResponse } from "next/server";
import { refreshCoins } from "@/lib/coin-refresh";

/**
 * Vercel Cron: runs daily at 00:00 UTC
 * Fetches top 1000 coins from CoinGecko and upserts to Supabase.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshCoins();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    coins_updated: result.count,
  });
}
