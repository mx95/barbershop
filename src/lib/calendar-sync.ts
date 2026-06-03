import { SITE } from "@/lib/constants";
import { buildIcsContent, type CalendarEvent } from "@/lib/booking-utils";
import type { StoredAppointment } from "@/lib/store/appointments";

export function getBookingCalendarEmail(): string {
  return (
    process.env.BOOKING_CALENDAR_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    SITE.bookingCalendarEmail ||
    SITE.email
  );
}

export function appointmentToCalendarEvent(
  appointment: StoredAppointment,
  cancelled = false
): CalendarEvent {
  const title = cancelled
    ? `[Cancelled] ${appointment.service_name} — ${appointment.customer_name}`
    : `${appointment.service_name} — ${appointment.customer_name}`;

  const description = [
    `Barber: ${appointment.barber_name}`,
    `Customer: ${appointment.customer_name}`,
    `Phone: ${appointment.customer_phone}`,
    appointment.customer_email ? `Email: ${appointment.customer_email}` : null,
    appointment.notes ? `Notes: ${appointment.notes}` : null,
    `Booking ID: ${appointment.id}`,
    cancelled ? "Status: Cancelled" : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title,
    description,
    location: SITE.address,
    startsAt: new Date(appointment.starts_at),
    endsAt: new Date(appointment.ends_at),
  };
}

function buildIcsForAppointment(
  appointment: StoredAppointment,
  method: "REQUEST" | "CANCEL" = "REQUEST"
): string {
  const event = appointmentToCalendarEvent(appointment, method === "CANCEL");
  const base = buildIcsContent(event, {
    uid: `${appointment.id}@thetempleofmen.com`,
    method,
  });
  return base;
}

async function sendResendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  icsContent: string;
  icsFilename: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, skipped: true, error: "RESEND_API_KEY not configured" };
  }

  const from = process.env.EMAIL_FROM?.trim() || SITE.email;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      attachments: [
        {
          filename: payload.icsFilename,
          content: Buffer.from(payload.icsContent, "utf-8").toString("base64"),
          content_type: "text/calendar; charset=utf-8",
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: err || res.statusText };
  }

  return { ok: true };
}

/** Sends an ICS invite to the shop shared calendar inbox (configure BOOKING_CALENDAR_EMAIL). */
export async function syncAppointmentToSharedCalendar(
  appointment: StoredAppointment,
  action: "create" | "reschedule" | "cancel" = "create"
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const calendarEmail = getBookingCalendarEmail();
  if (!calendarEmail) {
    return { ok: false, skipped: true, error: "No calendar email configured" };
  }

  const method = action === "cancel" ? "CANCEL" : "REQUEST";
  const ics = buildIcsForAppointment(appointment, method);
  const dateLabel = new Date(appointment.starts_at).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Nicosia",
  });

  const subjectPrefix =
    action === "cancel" ? "Cancelled" : action === "reschedule" ? "Updated" : "New booking";
  const subject = `${subjectPrefix}: ${appointment.service_name} — ${appointment.customer_name} (${dateLabel})`;

  const html = `
    <p><strong>${SITE.name}</strong> — ${subjectPrefix} appointment</p>
    <ul>
      <li><strong>Service:</strong> ${appointment.service_name}</li>
      <li><strong>Barber:</strong> ${appointment.barber_name}</li>
      <li><strong>When:</strong> ${dateLabel}</li>
      <li><strong>Customer:</strong> ${appointment.customer_name}</li>
      <li><strong>Phone:</strong> ${appointment.customer_phone}</li>
      ${appointment.customer_email ? `<li><strong>Email:</strong> ${appointment.customer_email}</li>` : ""}
      ${appointment.notes ? `<li><strong>Notes:</strong> ${appointment.notes}</li>` : ""}
    </ul>
    <p>Open the attached <code>.ics</code> file to add or update this event on your shared calendar.</p>
  `;

  return sendResendEmail({
    to: calendarEmail,
    subject,
    html,
    icsContent: ics,
    icsFilename: `booking-${appointment.id}.ics`,
  });
}
