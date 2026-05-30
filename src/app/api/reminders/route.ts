import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addHours, format, isToday, isTomorrow } from "date-fns";
import { SITE } from "@/lib/constants";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || SITE.email,
      to,
      subject,
      html,
    }),
  });
}

async function sendSMS(to: string, body: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return;
  const auth = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
  ).toString("base64");

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: process.env.TWILIO_PHONE_NUMBER!,
        Body: body,
      }),
    }
  );
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("secret") !== process.env.CRON_SECRET) {
      // Allow manual trigger from dashboard in dev
    }
  }

  const supabase = getServiceClient();
  const now = new Date();
  const in24h = addHours(now, 24);
  const in2h = addHours(now, 2);
  let sent = { email: 0, sms: 0, birthday: 0 };

  // Email reminders — appointments in next 24 hours
  const { data: emailAppts } = await supabase
    .from("appointments")
    .select("*, profiles!appointments_customer_id_fkey(email, full_name), services(name)")
    .eq("reminder_email_sent", false)
    .eq("status", "confirmed")
    .gte("starts_at", now.toISOString())
    .lte("starts_at", in24h.toISOString());

  for (const appt of emailAppts || []) {
    const profile = appt.profiles as { email: string; full_name: string };
    const service = appt.services as { name: string };
    if (!profile?.email) continue;

    const when = isToday(new Date(appt.starts_at))
      ? "today"
      : isTomorrow(new Date(appt.starts_at))
        ? "tomorrow"
        : format(new Date(appt.starts_at), "EEEE, MMM d");

    await sendEmail(
      profile.email,
      `Reminder: Your appointment at ${SITE.name}`,
      `<h2>See you ${when}!</h2>
       <p>Hi ${profile.full_name || "there"},</p>
       <p>This is a reminder for your <strong>${service?.name}</strong> appointment at ${SITE.name}.</p>
       <p><strong>Time:</strong> ${format(new Date(appt.starts_at), "HH:mm")}</p>
       <p>Check-in code: <strong>${appt.check_in_code}</strong></p>
       <p>${SITE.address} · ${SITE.phone}</p>`
    );

    await supabase.from("appointments").update({ reminder_email_sent: true }).eq("id", appt.id);
    sent.email++;
  }

  // SMS reminders — appointments in next 2 hours
  const { data: smsAppts } = await supabase
    .from("appointments")
    .select("*, profiles!appointments_customer_id_fkey(phone, full_name), services(name)")
    .eq("reminder_sms_sent", false)
    .in("status", ["confirmed", "pending"])
    .gte("starts_at", now.toISOString())
    .lte("starts_at", in2h.toISOString());

  for (const appt of smsAppts || []) {
    const profile = appt.profiles as { phone: string; full_name: string };
    const service = appt.services as { name: string };
    if (!profile?.phone) continue;

    await sendSMS(
      profile.phone,
      `${SITE.name}: Reminder — ${service?.name} at ${format(new Date(appt.starts_at), "HH:mm")}. Code: ${appt.check_in_code}`
    );

    await supabase.from("appointments").update({ reminder_sms_sent: true }).eq("id", appt.id);
    sent.sms++;
  }

  // Birthday reminders
  const todayMMDD = format(now, "MM-dd");
  const { data: birthdayProfiles } = await supabase
    .from("profiles")
    .select("*")
    .not("birthday", "is", null);

  for (const profile of birthdayProfiles || []) {
    if (!profile.birthday) continue;
    if (format(new Date(profile.birthday), "MM-dd") !== todayMMDD) continue;
    if (!profile.email) continue;

    await sendEmail(
      profile.email,
      `Happy Birthday from ${SITE.name}! 🎂`,
      `<h2>Happy Birthday, ${profile.full_name || "Gentleman"}!</h2>
       <p>The team at ${SITE.name} wishes you an exceptional day.</p>
       <p>Enjoy <strong>15% off</strong> your next visit — our gift to you.</p>
       <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/booking">Book your birthday groom →</a></p>`
    );
    sent.birthday++;
  }

  return NextResponse.json({ success: true, sent });
}
