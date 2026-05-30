import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    message: "Reminders are not configured. Wire up Resend/Twilio when ready.",
    sent: 0,
  });
}
