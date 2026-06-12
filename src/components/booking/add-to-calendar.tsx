"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addEventToCalendar, type CalendarEvent } from "@/lib/booking-utils";
import { useLanguage } from "@/lib/i18n/language-provider";

export function AddToCalendar({ event }: { event: CalendarEvent }) {
  const { t } = useLanguage();
  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full border-gold/30"
      onClick={() => addEventToCalendar(event)}
    >
      <CalendarPlus className="mr-2 h-4 w-4" />
      {t.addToCalendar}
    </Button>
  );
}
