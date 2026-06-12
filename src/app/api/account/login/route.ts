import { NextResponse } from "next/server";
import {
  createCustomerToken,
  normalizeEmail,
  normalizePhone,
} from "@/lib/customer-auth";
import { isValidEmail } from "@/lib/calendar-sync";
import { findAppointmentsByCustomer } from "@/lib/store/appointments";

export async function POST(request: Request) {
  try {
    const { phone, email } = await request.json();
    const phoneNorm = normalizePhone(String(phone ?? ""));
    const emailNorm = normalizeEmail(String(email ?? ""));

    if (!phoneNorm || phoneNorm.length < 8) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }
    if (!emailNorm || !isValidEmail(emailNorm)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const appointments = await findAppointmentsByCustomer(phoneNorm, emailNorm);
    if (appointments.length === 0) {
      return NextResponse.json(
        { error: "No bookings found for this phone and email" },
        { status: 404 }
      );
    }

    const token = createCustomerToken(phoneNorm, emailNorm);
    const name = appointments[0]?.customer_name ?? "";

    return NextResponse.json({
      token,
      phone: phoneNorm,
      email: emailNorm,
      name,
      appointmentCount: appointments.length,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
