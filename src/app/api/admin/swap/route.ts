import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { getAdminBarberIdFromRequest } from "@/lib/admin/auth";
import { hasBookingConflict } from "@/lib/booking-utils";
import { findAppointmentById, readAppointments, updateAppointmentById } from "@/lib/store/appointments";
import { SERVICES } from "@/lib/constants";
import { format } from "date-fns";

export async function POST(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { appointmentIdA, appointmentIdB } = await request.json();
    if (!appointmentIdA || !appointmentIdB) {
      return NextResponse.json({ error: "Two appointment ids required" }, { status: 400 });
    }

    const [a, b] = await Promise.all([
      findAppointmentById(appointmentIdA),
      findAppointmentById(appointmentIdB),
    ]);
    if (!a || !b) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    if (a.barber_id !== adminId && b.barber_id !== adminId) {
      return NextResponse.json({ error: "You can only swap your own bookings" }, { status: 403 });
    }

    const appointments = await readAppointments();
    const dateKeyA = format(new Date(a.starts_at), "yyyy-MM-dd");
    const dateKeyB = format(new Date(b.starts_at), "yyyy-MM-dd");

    const aNewStart = new Date(b.starts_at);
    const aNewEnd = addMinutes(aNewStart, a.service_duration);
    const bNewStart = new Date(a.starts_at);
    const bNewEnd = addMinutes(bNewStart, b.service_duration);

    if (
      hasBookingConflict(a.barber_id, dateKeyB, aNewStart, aNewEnd, appointments, a.id) ||
      hasBookingConflict(b.barber_id, dateKeyA, bNewStart, bNewEnd, appointments, b.id)
    ) {
      return NextResponse.json({ error: "Swap would create a conflict" }, { status: 409 });
    }

    const serviceA = SERVICES.find((s) => s.id === a.service_id);
    const serviceB = SERVICES.find((s) => s.id === b.service_id);

    const updatedA = await updateAppointmentById(a.id, {
      starts_at: aNewStart.toISOString(),
      ends_at: addMinutes(aNewStart, serviceA?.duration ?? a.service_duration).toISOString(),
    });
    const updatedB = await updateAppointmentById(b.id, {
      starts_at: bNewStart.toISOString(),
      ends_at: addMinutes(bNewStart, serviceB?.duration ?? b.service_duration).toISOString(),
    });

    return NextResponse.json({ appointments: [updatedA, updatedB] });
  } catch {
    return NextResponse.json({ error: "Swap failed" }, { status: 500 });
  }
}
