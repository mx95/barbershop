"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format, addMinutes, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, ChevronLeft, Scissors, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceDisplay } from "@/components/ui/price-display";
import { AddToCalendar } from "@/components/booking/add-to-calendar";
import { SERVICES, BARBERS, SITE } from "@/lib/constants";
import { generateTimeSlots, formatPrice, formatDuration, isBarberAvailableDay, type CalendarEvent } from "@/lib/booking-utils";
import { loadSavedCustomer, saveCustomer, saveBookingId, type SavedCustomer } from "@/lib/customer-storage";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

type BookingMode = "guest" | "returning";

interface CompletedBooking {
  calendarEvent: CalendarEvent;
}

function selectionCardClass(selected: boolean) {
  return cn(
    "glass-card cursor-pointer transition-all hover:border-gold/50",
    selected &&
      "border-gold bg-gold/15 ring-2 ring-gold/60 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.35)]"
  );
}

function BookingWizardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, serviceName } = useLanguage();
  const mounted = useMounted();
  const [bookingMode, setBookingMode] = useState<BookingMode | null>(null);
  const [savedCustomer, setSavedCustomer] = useState<SavedCustomer | null>(null);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(searchParams.get("service") || "");
  const [barberId, setBarberId] = useState<(typeof BARBERS)[number]["id"]>(BARBERS[0].id);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [completedBooking, setCompletedBooking] = useState<CompletedBooking | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [compactDateTime, setCompactDateTime] = useState(false);
  const [dateTimePhase, setDateTimePhase] = useState<"date" | "time">("date");
  const timeSectionRef = useRef<HTMLDivElement>(null);

  const calendarClassNames = {
    root: "w-full max-w-none",
    months: "relative w-full",
    month: "relative w-full flex flex-col gap-3 pt-10",
    month_caption: "flex h-9 w-full items-center justify-center",
    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between",
    month_grid: "w-full",
  } as const;

  const service = SERVICES.find((s) => s.id === serviceId);
  const barber = BARBERS.find((b) => b.id === barberId);
  const timeSlots = date && service ? generateTimeSlots(date, service.duration, bookedSlots) : [];
  const isLoggedIn = !!(savedCustomer?.name?.trim() && savedCustomer?.phone?.trim());

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setCompactDateTime(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (step !== 2) setDateTimePhase("date");
  }, [step]);

  useEffect(() => {
    const saved = loadSavedCustomer();
    setSavedCustomer(saved);
    if (saved?.name?.trim() && saved?.phone?.trim()) {
      setCustomerName(saved.name);
      setCustomerPhone(saved.phone);
      setCustomerEmail(saved.email ?? "");
      setBookingMode("returning");
    } else {
      setBookingMode("guest");
    }
  }, []);

  useEffect(() => {
    if (!date || !barber) return;

    async function fetchSlots() {
      try {
        const res = await fetch(
          `/api/appointments?date=${format(date!, "yyyy-MM-dd")}&barberId=${barber!.id}`
        );
        const data = await res.json();
        if (data.bookedSlots) setBookedSlots(data.bookedSlots);
      } catch {
        // ignore fetch errors
      }
    }
    fetchSlots();
  }, [date, barber]);

  useEffect(() => {
    setTime("");
    setDateTimePhase("date");
    setDate((current) => (current && !isBarberAvailableDay(current, barberId) ? undefined : current));
  }, [barberId]);

  function selectDate(selected: Date | undefined) {
    setDate(selected);
    if (!selected) return;
    if (compactDateTime) {
      setDateTimePhase("time");
      requestAnimationFrame(() => {
        timeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step, completedBooking, bookingMode]);

  function applySavedCustomer(saved: SavedCustomer) {
    setCustomerName(saved.name);
    setCustomerPhone(saved.phone);
    setCustomerEmail(saved.email ?? "");
  }

  function clearCustomerFields() {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
  }

  function goBack() {
    if (step === 2 && compactDateTime && dateTimePhase === "time") {
      setDateTimePhase("date");
      return;
    }
    if (step > 0) {
      setStep(step - 1);
      return;
    }
    if (isLoggedIn) {
      router.push("/account");
      return;
    }
    router.push("/");
  }

  const showBackButton = bookingMode !== null;

  function selectService(id: string) {
    setServiceId(id);
    setStep(1);
  }

  function selectBarber(id: (typeof BARBERS)[number]["id"]) {
    setBarberId(id);
    setStep(2);
  }

  function selectTimeSlot(slot: string) {
    setTime(slot);
    setStep(3);
  }

  function goToStep(next: number) {
    setStep(next);
  }

  async function handleConfirm() {
    if (!service || !date || !time) return;

    setLoading(true);

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error(t.booking.nameRequired);
      setLoading(false);
      return;
    }

    const [h, m] = time.split(":").map(Number);
    const startsAt = new Date(date);
    startsAt.setHours(h, m, 0, 0);
    const endsAt = addMinutes(startsAt, service.duration);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          barberId,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          notes,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      if (bookingMode === "returning") {
        saveCustomer({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || undefined,
        });
      }
      saveBookingId(data.appointment.id);

      setCompletedBooking({
        calendarEvent: {
          title: `${service.name} — ${SITE.name}`,
          description: [
            `Barber: ${barber!.name}`,
            `Customer: ${customerName.trim()}`,
            `Phone: ${customerPhone.trim()}`,
            notes ? `Notes: ${notes}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          location: SITE.address,
          startsAt,
          endsAt,
        },
      });

      toast.success(t.booking.success);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function canProceedToSummary() {
    return !!customerName.trim() && !!customerPhone.trim();
  }

  function resetWizard() {
    setCompletedBooking(null);
    setStep(0);
    setServiceId("");
    setDate(undefined);
    setTime("");
    setNotes("");
    setDateTimePhase("date");
    const saved = loadSavedCustomer();
    setSavedCustomer(saved);
    if (saved?.name?.trim() && saved?.phone?.trim()) {
      applySavedCustomer(saved);
      setBookingMode("returning");
    } else {
      setBookingMode("guest");
      clearCustomerFields();
    }
  }

  if (completedBooking && service && barber && date && time) {
    return (
      <div className="section-padding">
        <div className="mx-auto max-w-2xl">
          <Card className="glass-card border-gold/30">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                <Check className="h-8 w-8 text-gold" />
              </div>
              <div>
                <h2 className="font-heading text-3xl">{t.booking.booked}</h2>
                <p className="mt-2 text-muted-foreground">
                  {serviceName(service.id, service.name)} {t.account.with} {barber.name} ·{" "}
                  {format(date, "EEEE, MMMM d")} · {time}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {customerName} · {customerPhone}
                </p>
              </div>
              <AddToCalendar event={completedBooking.calendarEvent} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="flex-1 border-gold/30" asChild>
                  <Link href="/">{t.booking.backHome}</Link>
                </Button>
                <Button className="gold-gradient flex-1 border-0" onClick={resetWizard}>
                  {t.booking.bookAnother}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={t.booking.title}
          subtitle={t.booking.subtitle}
          className="mb-6 sm:mb-8"
        />

        <p className="mb-4 px-1 text-center text-xs text-muted-foreground sm:mb-6 sm:text-sm">
          {t.booking.policy}
        </p>

        {!mounted || bookingMode === null ? (
          <div className="py-12 text-center text-sm text-muted-foreground">...</div>
        ) : (
          <>
            {showBackButton && (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="mb-5 h-11 w-full gap-2 border-gold/40 bg-gold/10 text-base font-semibold text-gold shadow-sm hover:border-gold/60 hover:bg-gold/20 hover:text-gold sm:mb-6 sm:w-auto sm:min-w-[10rem] sm:px-5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/15">
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                </span>
                {step === 0 && isLoggedIn ? t.booking.backToAccount : t.booking.back}
              </Button>
            )}

            {isLoggedIn && step === 0 && (
              <p className="mb-4 text-center text-sm text-muted-foreground">
                {t.booking.welcomeBack}{" "}
                <span className="font-medium text-gold">{savedCustomer!.name}</span>
              </p>
            )}

            <p className="mb-4 text-center text-xs text-muted-foreground sm:mb-6 sm:text-sm">
              {t.booking.tapHint}
            </p>

            <div className="mb-6 overflow-x-auto pb-1 sm:mb-8">
              <div className="flex min-w-max items-center justify-center gap-1 px-1 sm:gap-2">
                {t.booking.steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      disabled={i >= step}
                      onClick={() => i < step && goToStep(i)}
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors sm:h-8 sm:w-8",
                        i <= step ? "gold-gradient text-[#0a0a0c]" : "bg-muted text-muted-foreground",
                        i < step && "cursor-pointer hover:brightness-110"
                      )}
                      aria-label={s}
                    >
                      {i < step ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : i + 1}
                    </button>
                    <span className={cn("hidden text-xs md:inline", i <= step ? "text-gold" : "text-muted-foreground")}>
                      {s}
                    </span>
                    {i < t.booking.steps.length - 1 && (
                      <div
                        className={cn("mx-0.5 h-px w-4 shrink-0 sm:mx-1 sm:w-8", i < step ? "bg-gold" : "bg-border")}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div key={step} className="animate-in fade-in duration-200">
              {step === 0 && (
                <div className="grid max-h-[min(45vh,22rem)] gap-2 overflow-y-auto pr-1 sm:max-h-[min(50vh,26rem)] sm:gap-3">
                  {SERVICES.map((s) => {
                    const selected = serviceId === s.id;
                    return (
                      <Card
                        key={s.id}
                        className={selectionCardClass(selected)}
                        onClick={() => selectService(s.id)}
                      >
                        <CardContent className="flex items-center justify-between gap-3 p-4 sm:gap-4 sm:p-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                                selected ? "border-gold bg-gold/20 text-gold" : "border-gold/30 text-gold"
                              )}
                            >
                              {selected ? <Check className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                            </div>
                            <div>
                              <h3 className="font-heading text-base sm:text-lg">
                                {serviceName(s.id, s.name)}
                              </h3>
                              <p className="text-sm text-muted-foreground">{formatDuration(s.duration)}</p>
                            </div>
                          </div>
                          <PriceDisplay price={s.price} className="text-xl" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {BARBERS.map((b) => {
                    const selected = barberId === b.id;
                    return (
                      <Card
                        key={b.id}
                        className={selectionCardClass(selected)}
                        onClick={() => selectBarber(b.id)}
                      >
                        <CardContent className="flex flex-col items-center gap-4 p-5 text-center sm:items-start sm:text-left">
                          <div className="flex w-full items-center justify-between">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gold/40 bg-black/40">
                              <Image
                                src={b.image}
                                alt={b.name}
                                fill
                                className="object-cover"
                                style={{ objectPosition: b.imageFocus }}
                                sizes="64px"
                              />
                            </div>
                            {selected && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-[#0a0a0c]">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-heading text-lg">{b.name}</h3>
                            <p className="text-sm text-gold">{b.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{b.bio}</p>
                            <p className="mt-2 text-xs tracking-wide text-white/70 uppercase">
                              {t.booking.available} {b.scheduleLabel}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-8 xl:grid xl:grid-cols-2 xl:gap-8">
                  {(compactDateTime ? dateTimePhase === "date" : true) && (
                    <div className="relative z-10 w-full shrink-0">
                      <Label className="mb-3 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gold" /> {t.booking.selectDate}
                      </Label>
                      {mounted && today ? (
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={selectDate}
                          weekStartsOn={1}
                          disabled={(d) => d < today || !isBarberAvailableDay(d, barberId)}
                          classNames={calendarClassNames}
                          className="glass-card mx-auto w-full max-w-full rounded-xl border-gold/20 p-2 sm:p-3"
                        />
                      ) : (
                        <div className="glass-card mx-auto flex h-64 w-full max-w-full items-center justify-center rounded-xl border-gold/20">
                          <span className="text-sm text-muted-foreground">...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {(compactDateTime ? dateTimePhase === "time" : true) && (
                    <div
                      ref={timeSectionRef}
                      className={cn(
                        "relative w-full",
                        compactDateTime ? "z-0" : "z-0 xl:border-l xl:border-gold/10 xl:pl-8"
                      )}
                    >
                      {compactDateTime && date && (
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gold/15 pb-4">
                          <p className="text-sm text-muted-foreground">
                            {t.booking.selectedDay}:{" "}
                            <span className="font-medium text-foreground">
                              {format(date, "EEEE, d MMM")}
                            </span>
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-gold hover:bg-gold/10"
                            onClick={() => setDateTimePhase("date")}
                          >
                            {t.booking.changeDate}
                          </Button>
                        </div>
                      )}
                      <Label className="mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gold" /> {t.booking.selectTime}
                      </Label>
                      {!date ? (
                        <p className="text-sm text-muted-foreground">{t.booking.selectDateFirst}</p>
                      ) : timeSlots.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t.booking.noSlots}</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={time === slot ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                time === slot ? "gold-gradient border-0" : "border-gold/20 hover:bg-gold/10"
                              )}
                              onClick={() => selectTimeSlot(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <Card className="glass-card">
                  <CardContent className="space-y-5 p-5 sm:p-8">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gold" />
                      <h3 className="font-heading text-2xl">{t.booking.yourDetails}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bookingMode === "guest" ? t.booking.bookAsGuestHint : t.booking.detailsHint}
                    </p>
                    <div>
                      <Label htmlFor="customerName">{t.booking.fullName} *</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="mt-1.5 border-gold/20 bg-white/5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">{t.booking.phone} *</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+357 99 123456"
                        required
                        className="mt-1.5 border-gold/20 bg-white/5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">{t.booking.email}</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="mt-1.5 border-gold/20 bg-white/5"
                      />
                    </div>
                    <Button
                      disabled={!canProceedToSummary()}
                      className="gold-gradient h-12 w-full border-0 text-base"
                      onClick={() => goToStep(4)}
                    >
                      {t.booking.continueToSummary}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step === 4 && service && barber && date && time && (
                <Card className="glass-card">
                  <CardContent className="space-y-6 p-5 sm:p-8">
                    <h3 className="font-heading text-2xl">{t.booking.summary}</h3>
                    <div className="space-y-3">
                      {[
                        [t.booking.customer, customerName],
                        [t.booking.phone, customerPhone],
                        ...(customerEmail ? [[t.common.email, customerEmail] as const] : []),
                        [t.common.service, serviceName(service.id, service.name)],
                        [t.common.barber, barber.name],
                        [t.common.date, format(date, "EEEE, MMMM d, yyyy")],
                        [t.common.time, time],
                        [t.booking.duration, formatDuration(service.duration)],
                        [t.booking.price, formatPrice(service.price)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between border-b border-gold/10 pb-2">
                          <span className="text-muted-foreground">{label}</span>
                          <span
                            className={cn(
                              "font-medium",
                              label === t.booking.price &&
                                "font-price text-xl font-semibold text-gold tabular-nums"
                            )}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label htmlFor="notes">{t.booking.notes}</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t.booking.notesPlaceholder}
                        className="mt-1.5 border-gold/20 bg-white/5"
                      />
                    </div>
                    <Button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="gold-gradient h-12 w-full border-0 text-base"
                    >
                      {loading ? t.booking.confirming : t.booking.confirm}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function BookingWizard() {
  return (
    <Suspense fallback={<div className="section-padding text-center">Loading...</div>}>
      <BookingWizardInner />
    </Suspense>
  );
}
