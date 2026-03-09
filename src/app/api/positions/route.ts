import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function parseCategoriesParam(request: Request): string[] | null {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("categories");
  if (!raw || raw.trim() === "") return null;
  return raw.split(",").map((c) => c.trim()).filter(Boolean);
}

export async function GET(request: Request) {
  const categories = parseCategoriesParam(request);

  try {
    let coinIdsFilter: string[] | null = null;
    if (categories && categories.length > 0) {
      const { data: coinsInCategory } = await supabase
        .from("coins")
        .select("id")
        .in("category_id", categories);
      coinIdsFilter = (coinsInCategory ?? []).map((c) => c.id);
      if (coinIdsFilter.length === 0) return NextResponse.json([]);
    }

    let query = supabase
      .from("signals")
      .select("*")
      .eq("valid_signal", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (coinIdsFilter && coinIdsFilter.length > 0) {
      query = query.in("coin_id", coinIdsFilter);
    }

    const { data: signals, error } = await query;

    if (error) return NextResponse.json([]);

    const coinIds = [...new Set((signals ?? []).map((s) => s.coin_id))];
    let coinMap: Record<string, object> = {};
    if (coinIds.length > 0) {
      const { data: coins } = await supabase
        .from("coins")
        .select("id, symbol, name, image, category_name, homepage")
        .in("id", coinIds);
      coinMap = Object.fromEntries((coins ?? []).map((c) => [c.id, c]));
    }

    const enriched = (signals ?? []).map((s) => ({
      ...s,
      coin: coinMap[s.coin_id] ?? null,
    }));

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json([]);
  }
}
