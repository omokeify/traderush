import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.from("config").select("key, value");

    if (error) {
      return NextResponse.json({});
    }
    const config = Object.fromEntries(
      (data ?? []).map((r) => [r.key, r.value])
    );
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(request: Request) {
  const body = await request.json();

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value: value as object,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("config").upsert(updates, {
    onConflict: "key",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
