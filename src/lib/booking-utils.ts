import {
  format,
  addMinutes,
  addMonths,
  setHours,
  setMinutes,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
  startOfMonth,
  differenceInHours,
} from "date-fns";
import { SITE, CLOSED_DAYS, BARBERS } from "./constants";

export type BookedRange = {
  start: string;
  end: string;
};

export type BarberSchedule = {
  /** 0 = Sunday … 6 = Saturday */
  days: readonly number[];
  open: number;
  close: number;
  /** Minutes between offered start times (finer = more slots per day). */
  slotMinutes: number;
};

const DEFAULT_SCHEDULE: BarberSchedule = {
  days: [1, 2, 3, 5, 6],
  open: SITE.bookingHours.open,
  close: SITE.bookingHours.close,
  slotMinutes: 5,
};

export function getBarberSchedule(barberId: string): BarberSchedule {
  const barber = BARBERS.find((b) => b.id === barberId);
  return barber?.schedule ?? DEFAULT_SCHEDULE;
}

export function isClosedDay(date: Date): boolean {
  return CLOSED_DAYS.includes(date.getDay() as (typeof CLOSED_DAYS)[number]);
}

export function isBarberAvailableDay(date: Date, barberId: string): boolean {
  if (isClosedDay(date)) return false;
  const { days } = getBarberSchedule(barberId);
  return days.includes(date.getDay());
}

export function getBookingWindowStart(today: Date = startOfDay(new Date())): Date {
  return startOfDay(today);
}

export function getBookingWindowEnd(today: Date = startOfDay(new Date())): Date {
  return startOfDay(addMonths(today, SITE.bookingAdvanceMonths));
}

export function getBookingMonthRange(today: Date = startOfDay(new Date())) {
  return {
    startMonth: startOfMonth(today),
    endMonth: startOfMonth(addMonths(today, SITE.bookingAdvanceMonths)),
  };
}

export function isWithinBookingWindow(date: Date, today: Date = startOfDay(new Date())): boolean {
  const day = startOfDay(date);
  return (
    !isBefore(day, getBookingWindowStart(today)) &&
    !isAfter(day, getBookingWindowEnd(today))
  );
}

function timeOnDate(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return setMinutes(setHours(startOfDay(date), h), m);
}

/**
 * When a service ends, the next bookable slot is usually the exact end time.
 * If the end falls in the last 10 minutes before :00 or :30, round up to that half hour.
 *
 * Examples (start 15:00):
 * - 40 min → 15:40 → resume 15:40
 * - 50 min → 15:50 → resume 16:00
 * - 25 min → 15:25 → resume 15:30
 * - 20 min → 15:20 → resume 15:20
 */
export function getSchedulingResumeTime(endsAt: Date): Date {
  const minutes = endsAt.getMinutes();

  if (minutes >= 50) {
    return addMinutes(endsAt, 60 - minutes);
  }
  if (minutes > 20 && minutes < 30) {
    return addMinutes(endsAt, 30 - minutes);
  }
  return endsAt;
}

export function rangesOverlap(
  slotStart: Date,
  slotEnd: Date,
  bookedRanges: BookedRange[],
  date: Date
): boolean {
  return bookedRanges.some((range) => {
    const rangeStart = timeOnDate(date, range.start);
    const rangeEnd = timeOnDate(date, range.end);
    return slotStart < rangeEnd && slotEnd > rangeStart;
  });
}

type TimeGap = { start: Date; end: Date };

function isHalfHourSlot(time: Date): boolean {
  return time.getMinutes() % 30 === 0;
}

function slotEndsByClose(slotStart: Date, duration: number, dayEnd: Date): boolean {
  const slotEnd = addMinutes(slotStart, duration);
  return isBefore(slotEnd, dayEnd) || isEqual(slotEnd, dayEnd);
}

function slotFitsInGap(slotStart: Date, duration: number, gap: TimeGap): boolean {
  const slotEnd = addMinutes(slotStart, duration);
  const afterGapStart = !isBefore(slotStart, gap.start);
  const beforeGapEnd = isBefore(slotEnd, gap.end) || isEqual(slotEnd, gap.end);
  return afterGapStart && beforeGapEnd;
}

function buildScheduleGaps(
  dayStart: Date,
  dayEnd: Date,
  bookedRanges: BookedRange[],
  date: Date
): TimeGap[] {
  const blocks = [...bookedRanges]
    .map((range) => ({
      start: timeOnDate(date, range.start),
      end: timeOnDate(date, range.end),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const gaps: TimeGap[] = [];
  let cursor = dayStart;

  for (const block of blocks) {
    if (isBefore(cursor, block.start)) {
      gaps.push({ start: cursor, end: block.start });
    }
    if (isAfter(block.end, cursor)) {
      cursor = block.end;
    }
  }

  if (isBefore(cursor, dayEnd)) {
    gaps.push({ start: cursor, end: dayEnd });
  }

  return gaps;
}

function earliestBookingStart(bookedRanges: BookedRange[], date: Date): Date | null {
  if (bookedRanges.length === 0) return null;
  return bookedRanges.reduce<Date | null>((earliest, range) => {
    const start = timeOnDate(date, range.start);
    return !earliest || isBefore(start, earliest) ? start : earliest;
  }, null);
}

export function generateTimeSlots(
  date: Date,
  duration: number,
  barberId: string,
  bookedRanges: BookedRange[] = []
) {
  const { open, close } = getBarberSchedule(barberId);
  const dayStart = setMinutes(setHours(startOfDay(date), open), 0);
  const dayEnd = setMinutes(setHours(startOfDay(date), close), 0);
  const firstBooking = earliestBookingStart(bookedRanges, date);
  const slotSet = new Set<string>();

  const tryAdd = (slotStart: Date) => {
    if (!slotEndsByClose(slotStart, duration, dayEnd)) return;
    const slotEnd = addMinutes(slotStart, duration);
    if (rangesOverlap(slotStart, slotEnd, bookedRanges, date)) return;
    slotSet.add(format(slotStart, "HH:mm"));
  };

  // Default: half-hour slots (:00 and :30) across the whole day.
  let halfHour = dayStart;
  while (
    isBefore(addMinutes(halfHour, duration), dayEnd) ||
    isEqual(addMinutes(halfHour, duration), dayEnd)
  ) {
    if (isHalfHourSlot(halfHour)) {
      tryAdd(halfHour);
    }
    halfHour = addMinutes(halfHour, 30);
  }

  // Between bookings (not before the first): offer gap-open time when this service fits
  // and it is not already a half-hour slot (e.g. 15:40 after a 40-min booking ends).
  if (bookedRanges.length > 0 && firstBooking) {
    const gaps = buildScheduleGaps(dayStart, dayEnd, bookedRanges, date);

    for (const gap of gaps) {
      const isBeforeFirstGap =
        isEqual(gap.end, firstBooking) || isBefore(gap.end, firstBooking);
      if (isBeforeFirstGap) continue;

      if (
        !isHalfHourSlot(gap.start) &&
        slotFitsInGap(gap.start, duration, gap)
      ) {
        tryAdd(gap.start);
      }
    }
  }

  const now = new Date();
  return [...slotSet]
    .filter((slot) => isAfter(timeOnDate(date, slot), now))
    .sort((a, b) => a.localeCompare(b));
}

export function hasBookingConflict(
  barberId: string,
  dateKey: string,
  startsAt: Date,
  endsAt: Date,
  appointments: readonly {
    id?: string;
    barber_id: string;
    starts_at: string;
    ends_at: string;
    status: string;
  }[],
  excludeId?: string
): boolean {
  return appointments.some((a) => {
    if (excludeId && a.id === excludeId) return false;
    if (a.barber_id !== barberId || a.status === "cancelled") return false;
    if (format(new Date(a.starts_at), "yyyy-MM-dd") !== dateKey) return false;

    const existingStart = new Date(a.starts_at);
    const blockedUntil = getSchedulingResumeTime(new Date(a.ends_at));
    return startsAt < blockedUntil && endsAt > existingStart;
  });
}

export function appointmentsToBookedRanges(
  appointments: readonly {
    starts_at: string;
    ends_at: string;
    status: string;
    barber_id: string;
  }[],
  barberId: string,
  dateKey: string
): BookedRange[] {
  return appointments
    .filter(
      (a) =>
        a.barber_id === barberId &&
        a.status !== "cancelled" &&
        format(new Date(a.starts_at), "yyyy-MM-dd") === dateKey
    )
    .map((a) => ({
      start: format(new Date(a.starts_at), "HH:mm"),
      end: format(getSchedulingResumeTime(new Date(a.ends_at)), "HH:mm"),
    }));
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

export function buildIcsContent(
  event: CalendarEvent,
  options?: { uid?: string; method?: "PUBLISH" | "REQUEST" | "CANCEL" }
): string {
  const uid = options?.uid ?? `${Date.now()}@thetempleofmen.com`;
  const method = options?.method ?? "PUBLISH";
  const stamp = formatIcsDate(new Date());

  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Temple Of Men//Booking//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatIcsDate(event.startsAt)}`,
    `DTEND:${formatIcsDate(event.endsAt)}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    `LOCATION:${escape(event.location)}`,
    method === "CANCEL" ? "STATUS:CANCELLED" : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter((line): line is string => line != null)
    .join("\r\n");
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

/** Bookings can be changed or cancelled until 24 hours before start time. */
export function canModifyBooking(startsAt: Date | string): boolean {
  const start = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  return differenceInHours(start, new Date()) >= 24;
}

export function getModifyDeadline(startsAt: Date | string): Date {
  const start = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  return addMinutes(start, -24 * 60);
}
