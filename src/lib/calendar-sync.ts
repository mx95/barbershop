import { SITE } from "@/lib/constants";
import { buildIcsContent, type CalendarEvent } from "@/lib/booking-utils";
import type { StoredAppointment } from "@/lib/store/appointments";
import { getBarberCalendarEmail } from "@/lib/store/barber-settings";

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Full booking details — barber calendar only. */
export function appointmentToBarberCalendarEvent(
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
    `Email: ${appointment.customer_email}`,
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

/** Customer-facing event — only their own appointment. */
export function appointmentToCustomerCalendarEvent(
  appointment: StoredAppointment,
  cancelled = false
): CalendarEvent {
  const title = cancelled
    ? `[Cancelled] ${appointment.service_name} — ${SITE.name}`
    : `${appointment.service_name} — ${SITE.name}`;

  const description = [
    `Barber: ${appointment.barber_name}`,
    `Location: ${SITE.address}`,
    `Phone: ${SITE.phoneDisplay}`,
    cancelled ? "This appointment has been cancelled." : null,
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

function buildIcs(
  appointment: StoredAppointment,
  event: CalendarEvent,
  method: "REQUEST" | "CANCEL"
): string {
  return buildIcsContent(event, {
    uid: `${appointment.id}@thetempleofmen.com`,
    method,
  });
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

function formatDateLabel(startsAt: string) {
  return new Date(startsAt).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Nicosia",
  });
}

export async function syncAppointmentToBarberCalendar(
  appointment: StoredAppointment,
  action: "create" | "reschedule" | "cancel" = "create"
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const calendarEmail = await getBarberCalendarEmail(appointment.barber_id);
  if (!calendarEmail) {
    return { ok: false, skipped: true, error: "Barber calendar email not configured" };
  }

  const method = action === "cancel" ? "CANCEL" : "REQUEST";
  const cancelled = action === "cancel";
  const event = appointmentToBarberCalendarEvent(appointment, cancelled);
  const ics = buildIcs(appointment, event, method);
  const dateLabel = formatDateLabel(appointment.starts_at);

  const subjectPrefix =
    action === "cancel" ? "Cancelled" : action === "reschedule" ? "Updated" : "New booking";
  const subject = `${subjectPrefix}: ${appointment.service_name} — ${appointment.customer_name} (${dateLabel})`;

  const html = `
    <p><strong>${SITE.name}</strong> — ${subjectPrefix} appointment on your calendar</p>
    <ul>
      <li><strong>Service:</strong> ${appointment.service_name}</li>
      <li><strong>When:</strong> ${dateLabel}</li>
      <li><strong>Customer:</strong> ${appointment.customer_name}</li>
      <li><strong>Phone:</strong> ${appointment.customer_phone}</li>
      <li><strong>Email:</strong> ${appointment.customer_email}</li>
      ${appointment.notes ? `<li><strong>Notes:</strong> ${appointment.notes}</li>` : ""}
    </ul>
    <p>Open the attached calendar file to add or update this booking on your calendar.</p>
  `;

  return sendResendEmail({
    to: calendarEmail,
    subject,
    html,
    icsContent: ics,
    icsFilename: `booking-${appointment.id}.ics`,
  });
}

export async function syncAppointmentToCustomerCalendar(
  appointment: StoredAppointment,
  action: "create" | "reschedule" | "cancel" = "create"
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const customerEmail = appointment.customer_email?.trim();
  if (!customerEmail) {
    return { ok: false, skipped: true, error: "Customer email missing" };
  }

  const method = action === "cancel" ? "CANCEL" : "REQUEST";
  const cancelled = action === "cancel";
  const event = appointmentToCustomerCalendarEvent(appointment, cancelled);
  const ics = buildIcs(appointment, event, method);
  const dateLabel = formatDateLabel(appointment.starts_at);

  const subjectPrefix =
    action === "cancel"
      ? "Appointment cancelled"
      : action === "reschedule"
        ? "Appointment updated"
        : "Your appointment";
  const subject = `${subjectPrefix} — ${SITE.name} (${dateLabel})`;

  const html = `
    <p>Hi ${appointment.customer_name},</p>
    <p>Your appointment at <strong>${SITE.name}</strong> has been ${action === "cancel" ? "cancelled" : action === "reschedule" ? "updated" : "confirmed"}.</p>
    <ul>
      <li><strong>Service:</strong> ${appointment.service_name}</li>
      <li><strong>Barber:</strong> ${appointment.barber_name}</li>
      <li><strong>When:</strong> ${dateLabel}</li>
      <li><strong>Where:</strong> ${SITE.address}</li>
    </ul>
    <p>Open the attached calendar file to add this to your phone or computer calendar.</p>
  `;

  return sendResendEmail({
    to: customerEmail,
    subject,
    html,
    icsContent: ics,
    icsFilename: `my-appointment-${appointment.id}.ics`,
  });
}

/** Sends calendar invites to the barber (all booking details) and the customer (their appointment only). */
export async function syncAppointmentCalendars(
  appointment: StoredAppointment,
  action: "create" | "reschedule" | "cancel" = "create"
): Promise<void> {
  const results = await Promise.allSettled([
    syncAppointmentToBarberCalendar(appointment, action),
    syncAppointmentToCustomerCalendar(appointment, action),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[calendar-sync]", result.reason);
      continue;
    }
    if (!result.value.ok && !result.value.skipped) {
      console.error("[calendar-sync]", result.value.error);
    }
  }
}

/** @deprecated Use syncAppointmentCalendars — kept for backwards compatibility. */
export async function syncAppointmentToSharedCalendar(
  appointment: StoredAppointment,
  action: "create" | "reschedule" | "cancel" = "create"
) {
  await syncAppointmentCalendars(appointment, action);
  return { ok: true };
}

/** @deprecated Use appointmentToBarberCalendarEvent */
export function appointmentToCalendarEvent(
  appointment: StoredAppointment,
  cancelled = false
): CalendarEvent {
  return appointmentToBarberCalendarEvent(appointment, cancelled);
}
