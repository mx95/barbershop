import { NextResponse } from "next/server";
import { format } from "date-fns";
import { BARBERS, SERVICES } from "@/lib/constants";
import {
  createAppointment,
  findAppointmentsByIds,
  readAppointments,
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
      const bookedSlots = appointments
        .filter(
          (a) =>
            a.barber_id === barberId &&
            a.status !== "cancelled" &&
            format(new Date(a.starts_at), "yyyy-MM-dd") === date
        )
        .map((a) => format(new Date(a.starts_at), "HH:mm"));

      return NextResponse.json({ bookedSlots });
    }

    const appointments = await readAppointments();
    return NextResponse.json({ appointments });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
