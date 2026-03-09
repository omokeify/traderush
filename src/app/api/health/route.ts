import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { error } = await supabase.from("config").select("key").limit(1).single();
    const dbOk = !error;

    return NextResponse.json({
      status: dbOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database: dbOk ? "connected" : "error",
    });
  } catch {
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
    });
  }
}
