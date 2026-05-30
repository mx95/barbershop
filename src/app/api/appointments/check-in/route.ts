import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { checkInCode } = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "checked_in",
        checked_in_at: new Date().toISOString(),
      })
      .eq("check_in_code", checkInCode)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid check-in code" }, { status: 404 });
    }

    return NextResponse.json({ appointment: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
