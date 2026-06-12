"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, startOfDay, startOfMonth, isSameDay } from "date-fns";
import { ArrowLeftRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { StoredAppointment } from "@/lib/store/appointments";
import { cn } from "@/lib/utils";

type Props = {
  appointments: StoredAppointment[];
  swapA: string;
  swapB: string;
  onSwapA: (id: string) => void;
  onSwapB: (id: string) => void;
  onSwap: () => void;
  swapping?: boolean;
};

function apptOnDay(appt: StoredAppointment, day: Date) {
  return isSameDay(new Date(appt.starts_at), day);
}

export function SwapBookingsPanel({
  appointments,
  swapA,
  swapB,
  onSwapA,
  onSwapB,
  onSwap,
  swapping,
}: Props) {
  const { t } = useLanguage();
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => startOfDay(new Date()));
  const [pickSlot, setPickSlot] = useState<"a" | "b">("a");

  const upcoming = useMemo(
    () =>
      [...appointments]
        .filter((a) => new Date(a.starts_at) >= new Date() && a.status !== "cancelled")
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [appointments]
  );

  const bookedDays = useMemo(
    () => upcoming.map((a) => startOfDay(new Date(a.starts_at))),
    [upcoming]
  );

  const dayAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return upcoming.filter((a) => apptOnDay(a, selectedDate));
  }, [upcoming, selectedDate]);

  const apptA = upcoming.find((a) => a.id === swapA);
  const apptB = upcoming.find((a) => a.id === swapB);
  const preselected = useRef(false);

  useEffect(() => {
    if (upcoming.length === 0 || preselected.current) return;
    preselected.current = true;

    const first = upcoming[0];
    const firstDay = startOfDay(new Date(first.starts_at));
    setSelectedDate(firstDay);
    setCalendarMonth(startOfMonth(firstDay));

    const sameDay = upcoming.filter((a) => apptOnDay(a, firstDay));
    if (sameDay.length >= 2) {
      onSwapA(sameDay[0].id);
      onSwapB(sameDay[1].id);
    } else if (upcoming.length >= 2) {
      onSwapA(upcoming[0].id);
      onSwapB(upcoming[1].id);
    } else {
      onSwapA(sameDay[0].id);
      onSwapB("");
    }
  }, [upcoming, onSwapA, onSwapB]);

  function selectAppointment(id: string) {
    if (pickSlot === "a") {
      onSwapA(id);
      if (swapB === id) onSwapB("");
      setPickSlot("b");
    } else {
      onSwapB(id);
      if (swapA === id) onSwapA("");
      setPickSlot("a");
    }
  }

  function formatAppt(appt: StoredAppointment | undefined) {
    if (!appt) return t.admin.swap.noneSelected;
    return `${format(new Date(appt.starts_at), "EEE d MMM · HH:mm")} — ${appt.customer_name}`;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t.admin.swap.subtitle}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          className={cn(
            "glass-card cursor-pointer border-2 transition-colors",
            pickSlot === "a" ? "border-gold" : "border-gold/15"
          )}
          onClick={() => setPickSlot("a")}
        >
          <CardContent className="p-4">
            <Label className="text-gold">{t.admin.swap.selectA}</Label>
            <p className="mt-2 text-sm font-medium">{formatAppt(apptA)}</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "glass-card cursor-pointer border-2 transition-colors",
            pickSlot === "b" ? "border-gold" : "border-gold/15"
          )}
          onClick={() => setPickSlot("b")}
        >
          <CardContent className="p-4">
            <Label className="text-gold">{t.admin.swap.selectB}</Label>
            <p className="mt-2 text-sm font-medium">{formatAppt(apptB)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Label className="mb-3 block">{t.admin.swap.pickDay}</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            weekStartsOn={1}
            modifiers={{ booked: bookedDays }}
            modifiersClassNames={{ booked: "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-gold" }}
            className="glass-card mx-auto w-full rounded-xl border-gold/20 p-2"
          />
        </div>

        <div>
          <Label className="mb-3 block">
            {selectedDate
              ? format(selectedDate, "EEEE, d MMMM")
              : t.admin.swap.pickDay}
          </Label>
          {dayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.admin.swap.noAppointmentsDay}</p>
          ) : (
            <div className="space-y-2">
              {dayAppointments.map((appt) => {
                const isA = swapA === appt.id;
                const isB = swapB === appt.id;
                return (
                  <button
                    key={appt.id}
                    type="button"
                    onClick={() => selectAppointment(appt.id)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                      isA || isB
                        ? "border-gold bg-gold/10"
                        : "border-gold/15 hover:border-gold/40"
                    )}
                  >
                    <p className="font-medium">
                      {format(new Date(appt.starts_at), "HH:mm")} — {appt.customer_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{appt.service_name}</p>
                    {(isA || isB) && (
                      <p className="mt-1 text-xs text-gold">
                        {isA ? t.admin.swap.selectA : t.admin.swap.selectB}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Button
        size="lg"
        className="gold-gradient h-14 w-full border-0 text-base font-semibold sm:w-auto sm:min-w-[12rem]"
        disabled={!swapA || !swapB || swapA === swapB || swapping}
        onClick={onSwap}
      >
        <ArrowLeftRight className="mr-2 h-5 w-5" />
        {swapping ? t.admin.swap.swapping : t.admin.swap.swapButton}
      </Button>
    </div>
  );
}
