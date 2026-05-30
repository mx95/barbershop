import { NextResponse } from "next/server";
import { updateAppointmentById } from "@/lib/store/appointments";

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json();

    const appointment = await updateAppointmentById(appointmentId, {
      status: "completed",
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
