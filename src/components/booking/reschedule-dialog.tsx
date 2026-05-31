"use client";

import { useEffect, useState } from "react";
import { format, addMinutes } from "date-fns";
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
  isBarberAvailableDay,
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
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const start = new Date(appointment.starts_at);
      setDate(start);
      setTime(format(start, "HH:mm"));
    }
  }, [open, appointment.starts_at]);

  useEffect(() => {
    if (!date) return;

    async function fetchSlots() {
      const res = await fetch(
        `/api/appointments?date=${format(date!, "yyyy-MM-dd")}&barberId=${appointment.barber_id}`
      );
      const data = await res.json();
      const currentTime = format(new Date(appointment.starts_at), "HH:mm");
      const slots: string[] = data.bookedSlots ?? [];
      setBookedSlots(slots.filter((s) => s !== currentTime));
    }
    fetchSlots();
  }, [date, appointment.barber_id, appointment.starts_at]);

  const timeSlots =
    date ? generateTimeSlots(date, appointment.service_duration, bookedSlots) : [];

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
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label className="mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gold" /> {t.booking.selectDate}
            </Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              weekStartsOn={1}
              disabled={(d) =>
                d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                !isBarberAvailableDay(d, appointment.barber_id)
              }
              className="glass-card rounded-xl border-gold/20 p-3"
            />
          </div>
          <div>
            <Label className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" /> {t.booking.selectTime}
            </Label>
            {!date ? (
              <p className="text-sm text-muted-foreground">{t.booking.selectDateFirst}</p>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.booking.noSlots}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={time === slot ? "default" : "outline"}
                    size="sm"
                    className={cn(
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
