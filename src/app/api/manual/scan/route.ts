import { NextResponse } from "next/server";
import { refreshCoins } from "@/lib/coin-refresh";

/**
 * Triggers a manual coin refresh from CoinGecko.
 * Body: { category?: "artificial-intelligence" | "real-world-assets" | "layer-1" | ... }
 * Omit category for all coins.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let category: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    category = body?.category;
  } catch {
    // no body
  }

  const result = await refreshCoins({ category });

  if (result.error) {
    return NextResponse.json({
      ok: false,
      coins_updated: 0,
      error: result.error,
    });
  }

  return NextResponse.json({
    ok: true,
    coins_updated: result.count,
  });
}
