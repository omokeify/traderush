import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * GET /api/monitoring - Monitoring status for dashboard category card.
 * Returns: selected categories, coins being monitored, last announcement, last signal.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({}, { status: 401 });

  const supabase = getSupabase();
  try {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("selected_categories")
      .eq("user_id", user.id)
      .single();

    const selectedCategories = (prefs?.selected_categories ?? []) as string[];

    let coinsQuery = supabase
      .from("coins")
      .select("id", { count: "exact", head: true })
      .not("telegram_channel", "is", null);

    if (selectedCategories.length > 0) {
      coinsQuery = coinsQuery.in("category_id", selectedCategories);
    }

    const { count: coinsMonitored } = await coinsQuery;

    const [lastAnnouncementRes, lastSignalRes] = await Promise.all([
      supabase
        .from("announcements")
        .select("detected_at, coin_id")
        .order("detected_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("signals")
        .select("created_at, coin_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const lastAnnouncement = lastAnnouncementRes.data;
    const lastSignal = lastSignalRes.data;

    return NextResponse.json({
      selected_categories: selectedCategories,
      coins_monitored: coinsMonitored ?? 0,
      last_announcement_at: lastAnnouncement?.detected_at ?? null,
      last_announcement_coin: lastAnnouncement?.coin_id ?? null,
      last_signal_at: lastSignal?.created_at ?? null,
      last_signal_coin: lastSignal?.coin_id ?? null,
    });
  } catch {
    return NextResponse.json({
      selected_categories: [],
      coins_monitored: 0,
      last_announcement_at: null,
      last_announcement_coin: null,
      last_signal_at: null,
      last_signal_coin: null,
    });
  }
}
