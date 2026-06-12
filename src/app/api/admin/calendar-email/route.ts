import { NextResponse } from "next/server";
import { getAdminBarberIdFromRequest } from "@/lib/admin/auth";
import {
  getBarberCalendarEmail,
  updateBarberCalendarEmail,
} from "@/lib/store/barber-settings";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const calendarEmail = await getBarberCalendarEmail(adminId);
  return NextResponse.json({ calendarEmail });
}

export async function PATCH(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { calendarEmail } = await request.json();
    const email = String(calendarEmail ?? "").trim();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const settings = await updateBarberCalendarEmail(adminId, email);
    return NextResponse.json({ calendarEmail: settings.calendar_email });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
