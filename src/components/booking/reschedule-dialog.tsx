"use client";

import { useEffect, useState } from "react";
import { format, addMinutes, startOfDay, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  generateTimeSlots,
  getBookingMonthRange,
  isBarberAvailableDay,
  isWithinBookingWindow,
  type BookedRange,
} from "@/lib/booking-utils";
import type { StoredAppointment } from "@/lib/store/appointments";
import { cn } from "@/lib/utils";

export function RescheduleDialog({
  appointment,
  open,
  onOpenChange,
  onRescheduled,
}: {
  appointment: StoredAppointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduled: (updated: StoredAppointment) => void;
}) {
  const { t } = useLanguage();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [today] = useState(() => startOfDay(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    if (open) {
      const start = new Date(appointment.starts_at);
      setDate(start);
      setTime(format(start, "HH:mm"));
      setCalendarMonth(startOfMonth(start));
    }
  }, [open, appointment.starts_at]);

  useEffect(() => {
    if (!date) return;

    async function fetchSlots() {
      const res = await fetch(
        `/api/appointments?date=${format(date!, "yyyy-MM-dd")}&barberId=${appointment.barber_id}`
      );
      const data = await res.json();
      const currentStart = format(new Date(appointment.starts_at), "HH:mm");
      const currentEnd = format(new Date(appointment.ends_at), "HH:mm");
      const ranges: BookedRange[] = data.bookedRanges ?? [];
      setBookedRanges(
        ranges.filter((r) => !(r.start === currentStart && r.end === currentEnd))
      );
    }
    fetchSlots();
  }, [date, appointment.barber_id, appointment.starts_at]);

  const timeSlots =
    date
      ? generateTimeSlots(date, appointment.service_duration, appointment.barber_id, bookedRanges)
      : [];

  async function handleSave() {
    if (!date || !time) return;

    setLoading(true);
    const [h, m] = time.split(":").map(Number);
    const startsAt = new Date(date);
    startsAt.setHours(h, m, 0, 0);

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          startsAt: startsAt.toISOString(),
          barberId: appointment.barber_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reschedule failed");

      toast.success(t.common.rescheduleSuccess);
      onRescheduled(data.appointment);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gold/30 bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{t.account.reschedule}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-8">
          <div className="relative z-10 w-full">
            <Label className="mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gold" /> {t.booking.selectDate}
            </Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              startMonth={getBookingMonthRange(today).startMonth}
              endMonth={getBookingMonthRange(today).endMonth}
              weekStartsOn={1}
              disabled={(d) =>
                !isWithinBookingWindow(d, today) ||
                !isBarberAvailableDay(d, appointment.barber_id)
              }
              classNames={{
                root: "w-full max-w-none",
                month: "relative w-full flex flex-col gap-3 pt-10",
                nav: "absolute inset-x-0 top-0 z-20 flex w-full items-center justify-between",
                button_previous: "relative z-20",
                button_next: "relative z-20",
                month_grid: "w-full",
              }}
              className="glass-card w-full rounded-xl border-gold/20 p-3"
            />
          </div>
          <div className="relative w-full border-t border-gold/15 pt-6">
            <Label className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" /> {t.booking.selectTime}
            </Label>
            {!date ? (
              <p className="text-sm text-muted-foreground">{t.booking.selectDateFirst}</p>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.booking.noSlots}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={time === slot ? "default" : "outline"}
                    className={cn(
                      "h-12 text-base font-semibold tabular-nums sm:h-11",
                      time === slot ? "gold-gradient border-0" : "border-gold/20 hover:bg-gold/10"
                    )}
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading || !date || !time}
          className="gold-gradient h-11 w-full border-0"
        >
          {loading ? t.common.saving : t.common.save}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
