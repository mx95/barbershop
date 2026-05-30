"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addEventToCalendar, type CalendarEvent } from "@/lib/booking-utils";

export function AddToCalendar({ event }: { event: CalendarEvent }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full border-gold/30"
      onClick={() => addEventToCalendar(event)}
    >
      <CalendarPlus className="mr-2 h-4 w-4" />
      Add to Calendar
    </Button>
  );
}
