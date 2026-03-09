import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function parseCategoriesParam(searchParams: URLSearchParams): string[] | null {
  const raw = searchParams.get("categories");
  if (!raw || raw.trim() === "") return null;
  return raw.split(",").map((c) => c.trim()).filter(Boolean);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 500);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const categories = parseCategoriesParam(searchParams);

  try {
    let query = supabase
      .from("coins")
      .select("id, symbol, name, market_cap_rank, current_price, telegram_channel, last_updated_at")
      .order("market_cap_rank", { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (categories && categories.length > 0) {
      query = query.in("category_id", categories);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
