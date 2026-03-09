import { NextResponse } from "next/server";

const COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/categories/list";

/**
 * GET /api/categories - List CoinGecko categories (AI, RWA, Layer 1, etc.)
 */
export async function GET() {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = {};
  if (apiKey) headers["x-cg-demo-api-key"] = apiKey;

  try {
    const res = await fetch(COINGECKO_URL, { headers });
    if (res.status === 429) {
      return NextResponse.json(
        { error: "Rate limited. Add COINGECKO_API_KEY." },
        { status: 429 }
      );
    }
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([]);
  }
}
