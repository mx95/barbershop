import { format, addMinutes, setHours, setMinutes, isBefore, isAfter, startOfDay } from "date-fns";
import { SITE, CLOSED_DAYS, BARBERS } from "./constants";

export function isClosedDay(date: Date): boolean {
  return CLOSED_DAYS.includes(date.getDay() as (typeof CLOSED_DAYS)[number]);
}

export function isBarberAvailableDay(date: Date, barberId: string): boolean {
  if (isClosedDay(date)) return false;

  const barber = BARBERS.find((b) => b.id === barberId);
  if (!barber) return true;

  return !barber.closedDays.includes(date.getDay() as (typeof barber.closedDays)[number]);
}

export function generateTimeSlots(date: Date, duration: number, bookedSlots: string[] = []) {
  const slots: string[] = [];
  const dayStart = setMinutes(setHours(startOfDay(date), SITE.bookingHours.open), 0);
  const dayEnd = setMinutes(setHours(startOfDay(date), SITE.bookingHours.close), 0);
  let current = dayStart;

  while (isBefore(addMinutes(current, duration), dayEnd) || format(addMinutes(current, duration), "HH:mm") === format(dayEnd, "HH:mm")) {
    const timeStr = format(current, "HH:mm");
    if (!bookedSlots.includes(timeStr)) {
      slots.push(timeStr);
    }
    current = addMinutes(current, 15);
  }

  const now = new Date();
  return slots.filter((slot) => {
    const [h, m] = slot.split(":").map(Number);
    const slotDate = setMinutes(setHours(date, h), m);
    return isAfter(slotDate, now);
  });
}


export function calculateLoyaltyPoints(price: number): number {
  return Math.floor(price);
}

export function getLoyaltyTier(visits: number) {
  if (visits >= 30) return "Gold";
  if (visits >= 15) return "Silver";
  if (visits >= 5) return "Bronze";
  return "Member";
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(0)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return hrs === 1 ? "1 hr" : `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  }
  return `${minutes} min`;
}

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", event.title);
  url.searchParams.set("dates", `${formatIcsDate(event.startsAt)}/${formatIcsDate(event.endsAt)}`);
  url.searchParams.set("details", event.description);
  url.searchParams.set("location", event.location);
  return url.toString();
}

export function buildIcsContent(event: CalendarEvent): string {
  const uid = `${Date.now()}@thetempleofmen.com`;
  const stamp = formatIcsDate(new Date());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Temple Of Men//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatIcsDate(event.startsAt)}`,
    `DTEND:${formatIcsDate(event.endsAt)}`,
    `SUMMARY:${event.title.replace(/\n/g, "\\n")}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export type CalendarPlatform = "ios" | "android" | "desktop";

export function detectCalendarPlatform(): CalendarPlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  return "desktop";
}

/** Opens the best calendar option for the user's device. */
export function addEventToCalendar(event: CalendarEvent) {
  const platform = detectCalendarPlatform();
  const ics = buildIcsContent(event);
  const filename = `${event.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "appointment"}.ics`;

  if (platform === "android") {
    window.open(buildGoogleCalendarUrl(event), "_blank", "noopener,noreferrer");
    return;
  }

  if (platform === "ios") {
    downloadIcsFile(ics, filename);
    return;
  }

  const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
  if (isMac) {
    downloadIcsFile(ics, filename);
    return;
  }

  window.open(buildGoogleCalendarUrl(event), "_blank", "noopener,noreferrer");
}
