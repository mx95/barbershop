import { NextResponse } from "next/server";
import { readTimeOff } from "@/lib/store/time-off";

export async function GET(request: Request) {
  const barberId = new URL(request.url).searchParams.get("barberId");
  if (!barberId) {
    return NextResponse.json({ error: "barberId required" }, { status: 400 });
  }
  const blocks = await readTimeOff();
  const mine = blocks.filter((b) => b.barber_id === barberId);
  return NextResponse.json({
    fullDayDates: mine.filter((b) => b.all_day).map((b) => b.date),
    partial: mine.filter((b) => !b.all_day),
  });
}
