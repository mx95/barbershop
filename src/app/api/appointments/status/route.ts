import { NextResponse } from "next/server";
import { updateAppointmentById, type AppointmentStatus } from "@/lib/store/appointments";

export async function POST(request: Request) {
  try {
    const { appointmentId, status } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json({ error: "Missing appointmentId or status" }, { status: 400 });
    }

    const updates: Partial<{ status: AppointmentStatus; checked_in_at: string | null }> = {
      status,
    };

    if (status === "checked_in") {
      updates.checked_in_at = new Date().toISOString();
    }

    const appointment = await updateAppointmentById(appointmentId, updates);

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
