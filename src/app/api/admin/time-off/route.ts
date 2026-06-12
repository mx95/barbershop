import { NextResponse } from "next/server";
import { getAdminBarberIdFromRequest } from "@/lib/admin/auth";
import { createTimeOff, deleteTimeOff, readTimeOff } from "@/lib/store/time-off";

export async function GET(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blocks = await readTimeOff();
  return NextResponse.json({ timeOff: blocks.filter((b) => b.barber_id === adminId) });
}

export async function POST(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const block = await createTimeOff({
      barber_id: adminId,
      date: body.date,
      all_day: Boolean(body.allDay ?? true),
      start: body.start ?? null,
      end: body.end ?? null,
      note: body.note?.trim() || null,
    });
    return NextResponse.json({ block });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const blocks = await readTimeOff();
  const target = blocks.find((b) => b.id === id);
  if (!target || target.barber_id !== adminId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await deleteTimeOff(id);
  return NextResponse.json({ ok: true });
}
