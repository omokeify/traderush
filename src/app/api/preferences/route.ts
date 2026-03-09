import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({}, { status: 401 });

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") return NextResponse.json({});
    return NextResponse.json(data ?? {
      selected_categories: [],
      notify_telegram: true,
      notify_email: false,
      notify_webhook: false,
      sound_enabled: true,
      browser_notifications: true,
    });
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({}, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const {
    selected_categories,
    notify_telegram,
    notify_email,
    notify_webhook,
    webhook_url,
    email,
    telegram_chat_id,
    sound_enabled,
    browser_notifications,
  } = body;

  const supabase = getSupabase();
  try {
    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        selected_categories: selected_categories ?? [],
        notify_telegram: notify_telegram ?? true,
        notify_email: notify_email ?? false,
        notify_webhook: notify_webhook ?? false,
        webhook_url: webhook_url ?? null,
        email: email ?? null,
        telegram_chat_id: telegram_chat_id ?? null,
        sound_enabled: sound_enabled ?? true,
        browser_notifications: browser_notifications ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
