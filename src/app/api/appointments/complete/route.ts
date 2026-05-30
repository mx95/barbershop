import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateLoyaltyPoints } from "@/lib/booking-utils";
import { LOYALTY_TIERS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json();
    const supabase = await createClient();

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("*, services(name, price), barbers(name), profiles!appointments_customer_id_fkey(id, total_visits, loyalty_points)")
      .eq("id", appointmentId)
      .single();

    if (error || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const service = appointment.services as { name: string; price: number };
    const barber = appointment.barbers as { name: string };
    const customer = appointment.profiles as { id: string; total_visits: number; loyalty_points: number };
    const points = calculateLoyaltyPoints(service?.price || 25);
    const newVisits = (customer.total_visits || 0) + 1;

    await supabase.from("appointments").update({ status: "completed" }).eq("id", appointmentId);

    await supabase.from("visit_history").insert({
      customer_id: customer.id,
      appointment_id: appointmentId,
      service_name: service?.name || "Service",
      barber_name: barber?.name || "Barber",
      points_earned: points,
    });

    await supabase
      .from("profiles")
      .update({
        total_visits: newVisits,
        loyalty_points: (customer.loyalty_points || 0) + points,
      })
      .eq("id", customer.id);

    for (const tier of LOYALTY_TIERS) {
      if (newVisits === tier.visits) {
        await supabase.from("loyalty_rewards").insert({
          customer_id: customer.id,
          tier: tier.name,
          reward_description: tier.reward,
        });
      }
    }

    return NextResponse.json({ success: true, pointsEarned: points });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
