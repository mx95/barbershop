import { format, addMinutes, setHours, setMinutes, isBefore, isAfter, startOfDay } from "date-fns";
import { SITE, CLOSED_DAYS } from "./constants";

export function isClosedDay(date: Date): boolean {
  return CLOSED_DAYS.includes(date.getDay() as (typeof CLOSED_DAYS)[number]);
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

export function generateCheckInCode(): string {
  return `TOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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
