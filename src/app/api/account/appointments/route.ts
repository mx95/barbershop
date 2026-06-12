import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { findAppointmentsByCustomer } from "@/lib/store/appointments";

export async function GET(request: Request) {
  const customer = getCustomerFromRequest(request);
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appointments = await findAppointmentsByCustomer(customer.phone, customer.email);
    return NextResponse.json({ appointments });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
