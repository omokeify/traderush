import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: signal, error } = await supabase
    .from("signals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  const { data: coin } = await supabase
    .from("coins")
    .select("id, symbol, name, image, category_name, homepage, description, telegram_channel")
    .eq("id", signal.coin_id)
    .single();

  const { data: announcement } = signal.announcement_id
    ? await supabase.from("announcements").select("*").eq("id", signal.announcement_id).single()
    : { data: null };

  return NextResponse.json({
    ...signal,
    coin: coin ?? null,
    announcement: announcement ?? null,
  });
}
