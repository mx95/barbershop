import { NextResponse } from "next/server";
import { getAdminBarberIdFromRequest } from "@/lib/admin/auth";
import { readAppointments } from "@/lib/store/appointments";

export async function GET(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appointments = await readAppointments();
  const mine = appointments.filter(
    (a) => a.barber_id === adminId && a.status !== "cancelled"
  );

  const byKey = new Map<
    string,
    {
      key: string;
      name: string;
      phone: string;
      email: string | null;
      appointments: typeof mine;
    }
  >();

  for (const appt of mine) {
    const key = `${appt.customer_phone}::${appt.customer_name.toLowerCase()}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.appointments.push(appt);
    } else {
      byKey.set(key, {
        key,
        name: appt.customer_name,
        phone: appt.customer_phone,
        email: appt.customer_email,
        appointments: [appt],
      });
    }
  }

  const customers = [...byKey.values()]
    .map((c) => ({
      ...c,
      appointments: c.appointments.sort(
        (x, y) => new Date(y.starts_at).getTime() - new Date(x.starts_at).getTime()
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ customers });
}
