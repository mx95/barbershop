import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCheckInCode } from "@/lib/booking-utils";
import { BARBERS, SERVICES } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, barberId, startsAt, endsAt, notes } = body;

    const service = SERVICES.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    const barberMeta = BARBERS.find((b) => b.id === barberId);
    if (!barberMeta) {
      return NextResponse.json({ error: "Invalid barber" }, { status: 400 });
    }

    const checkInCode = generateCheckInCode();

    let dbServiceId = serviceId;
    let dbBarberId = barberId;

    const { data: dbService } = await supabase
      .from("services")
      .select("id")
      .eq("slug", serviceId)
      .single();

    if (dbService) dbServiceId = dbService.id;

    const { data: dbBarber } = await supabase
      .from("barbers")
      .select("id")
      .eq("name", barberMeta.name)
      .maybeSingle();

    if (dbBarber) dbBarberId = dbBarber.id;

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        customer_id: user.id,
        barber_id: dbBarberId,
        service_id: dbServiceId,
        starts_at: startsAt,
        ends_at: endsAt,
        notes: notes || null,
        check_in_code: checkInCode,
        status: "confirmed",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("*, services(name, price, duration), barbers(name)")
    .eq("customer_id", user.id)
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointments: data });
}
