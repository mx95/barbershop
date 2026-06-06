import { NextResponse } from "next/server";
import { format, addMinutes } from "date-fns";
import { BARBERS, SERVICES } from "@/lib/constants";
import {
  hasBookingConflict,
  isBarberAvailableDay,
  isWithinBookingWindow,
} from "@/lib/booking-utils";
import { syncAppointmentToSharedCalendar } from "@/lib/calendar-sync";
import {
  findAppointmentById,
  readAppointments,
  updateAppointmentById,
} from "@/lib/store/appointments";

function hoursUntilStart(startsAt: string): number {
  return (new Date(startsAt).getTime() - Date.now()) / (1000 * 60 * 60);
}

function canModify(startsAt: string): boolean {
  return hoursUntilStart(startsAt) >= 24;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await findAppointmentById(id);

    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (existing.status === "cancelled" || existing.status === "completed") {
      return NextResponse.json({ error: "This appointment cannot be modified" }, { status: 400 });
    }

    if (!canModify(existing.starts_at)) {
      return NextResponse.json(
        { error: "Changes are only allowed up to 24 hours before the appointment" },
        { status: 403 }
      );
    }

    if (body.action === "cancel") {
      const appointment = await updateAppointmentById(id, { status: "cancelled" });
      if (appointment) {
        syncAppointmentToSharedCalendar(appointment, "cancel").catch((err) => {
          console.error("[calendar-sync]", err);
        });
      }
      return NextResponse.json({ appointment });
    }

    if (body.action === "reschedule") {
      const { startsAt, barberId } = body;
      if (!startsAt) {
        return NextResponse.json({ error: "startsAt is required" }, { status: 400 });
      }

      const barber = BARBERS.find((b) => b.id === (barberId ?? existing.barber_id));
      if (!barber) {
        return NextResponse.json({ error: "Invalid barber" }, { status: 400 });
      }

      const service = SERVICES.find((s) => s.id === existing.service_id);
      if (!service) {
        return NextResponse.json({ error: "Invalid service" }, { status: 400 });
      }

      const start = new Date(startsAt);
      const end = addMinutes(start, service.duration);
      const dateKey = format(start, "yyyy-MM-dd");

      if (!isWithinBookingWindow(start)) {
        return NextResponse.json(
          { error: "Bookings are only available up to 3 months in advance" },
          { status: 400 }
        );
      }

      if (!isBarberAvailableDay(start, barber.id)) {
        return NextResponse.json({ error: "Barber is not available on this day" }, { status: 400 });
      }

      const appointments = await readAppointments();
      if (hasBookingConflict(barber.id, dateKey, start, end, appointments, id)) {
        return NextResponse.json({ error: "That time slot is no longer available" }, { status: 409 });
      }

      const appointment = await updateAppointmentById(id, {
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        barber_id: barber.id,
        barber_name: barber.name,
      });

      if (appointment) {
        syncAppointmentToSharedCalendar(appointment, "reschedule").catch((err) => {
          console.error("[calendar-sync]", err);
        });
      }

      return NextResponse.json({ appointment });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
