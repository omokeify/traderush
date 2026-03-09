import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/** Consider worker "scouting" if heartbeat within last 2 minutes */
const SCOUTING_THRESHOLD_MS = 2 * 60 * 1000;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("worker_status")
      .select("last_heartbeat_at")
      .eq("id", "monitor")
      .single();

    if (error || !data?.last_heartbeat_at) {
      return NextResponse.json({ scouting: false });
    }

    const last = new Date(data.last_heartbeat_at).getTime();
    const now = Date.now();
    const scouting = now - last < SCOUTING_THRESHOLD_MS;

    return NextResponse.json({ scouting, last_heartbeat_at: data.last_heartbeat_at });
  } catch {
    return NextResponse.json({ scouting: false });
  }
}
