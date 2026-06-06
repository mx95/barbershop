import { NextResponse } from "next/server";
import { format } from "date-fns";
import { BARBERS, SERVICES } from "@/lib/constants";
import {
  appointmentsToBookedRanges,
  hasBookingConflict,
  isBarberAvailableDay,
  isWithinBookingWindow,
} from "@/lib/booking-utils";
import { syncAppointmentToSharedCalendar } from "@/lib/calendar-sync";
import {
  createAppointment,
  findAppointmentsByIds,
  readAppointments,
  searchAppointments,
} from "@/lib/store/appointments";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serviceId,
      barberId,
      startsAt,
      endsAt,
      notes,
      customerName,
      customerPhone,
      customerEmail,
    } = body;

    const name = customerName?.trim();
    const phone = customerPhone?.trim();
    const email = customerEmail?.trim() || null;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const service = SERVICES.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    const barber = BARBERS.find((b) => b.id === barberId);
    if (!barber) {
      return NextResponse.json({ error: "Invalid barber" }, { status: 400 });
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
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
    if (hasBookingConflict(barber.id, dateKey, start, end, appointments)) {
      return NextResponse.json({ error: "That time slot is no longer available" }, { status: 409 });
    }

    const appointment = await createAppointment({
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      barber_id: barber.id,
      barber_name: barber.name,
      service_id: service.id,
      service_name: service.name,
      service_duration: service.duration,
      service_price: service.price,
      starts_at: startsAt,
      ends_at: endsAt,
      notes: notes || null,
    });

    syncAppointmentToSharedCalendar(appointment, "create").catch((err) => {
      console.error("[calendar-sync]", err);
    });

    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const barberId = searchParams.get("barberId");
    const ids = searchParams.get("ids");
    const search = searchParams.get("search");

    if (search) {
      const appointments = await searchAppointments(search);
      return NextResponse.json({ appointments });
    }

    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      const appointments = await findAppointmentsByIds(idList);
      return NextResponse.json({ appointments });
    }

    if (date && barberId) {
      const barber = BARBERS.find((b) => b.id === barberId);
      if (!barber) {
        return NextResponse.json({ error: "Invalid barber" }, { status: 400 });
      }

      const appointments = await readAppointments();
      const bookedRanges = appointmentsToBookedRanges(appointments, barberId, date);

      return NextResponse.json({ bookedRanges });
    }

    const appointments = await readAppointments();
    return NextResponse.json({ appointments });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
