"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, ChevronLeft, ChevronRight, Scissors } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SERVICES, BARBERS } from "@/lib/constants";
import { generateTimeSlots, formatPrice, formatDuration, isClosedDay } from "@/lib/booking-utils";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STEPS = ["Service", "Barber", "Date & Time", "Confirm"];

function BookingWizardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(searchParams.get("service") || "");
  const [barberId, setBarberId] = useState<(typeof BARBERS)[number]["id"]>(BARBERS[0].id);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const service = SERVICES.find((s) => s.id === serviceId);
  const barber = BARBERS.find((b) => b.id === barberId);
  const timeSlots = date && service ? generateTimeSlots(date, service.duration, bookedSlots) : [];

  useEffect(() => {
    if (!date) return;
    async function fetchSlots() {
      const supabase = createClient();
      const dayStart = format(date!, "yyyy-MM-dd") + "T00:00:00";
      const dayEnd = format(date!, "yyyy-MM-dd") + "T23:59:59";

      try {
        const { data } = await supabase
          .from("appointments")
          .select("starts_at")
          .gte("starts_at", dayStart)
          .lte("starts_at", dayEnd)
          .neq("status", "cancelled");

        if (data) {
          setBookedSlots(data.map((a) => format(new Date(a.starts_at), "HH:mm")));
        }
      } catch {
        // Supabase not configured yet
      }
    }
    fetchSlots();
  }, [date]);

  async function handleConfirm() {
    if (!service || !date || !time) return;

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to book an appointment");
      router.push(`/auth/login?redirect=/booking`);
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      toast.success("Appointment booked successfully!");
      router.push(`/account?booking=${data.appointment.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function canProceed() {
    if (step === 0) return !!serviceId;
    if (step === 1) return !!barberId;
    if (step === 2) return !!date && !!time;
    return true;
  }

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Book Appointment"
          subtitle="Select your service, choose a time, and secure your chair."
          className="mb-12"
        />

        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  i <= step ? "gold-gradient text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-xs sm:block", i <= step ? "text-gold" : "text-muted-foreground")}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn("mx-1 h-px w-8", i < step ? "bg-gold" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {step === 0 && (
              <div className="grid gap-4">
                {SERVICES.map((s) => (
                  <Card
                    key={s.id}
                    className={cn(
                      "glass-card cursor-pointer transition-all hover:border-gold/40",
                      serviceId === s.id && "border-gold ring-1 ring-gold/30"
                    )}
                    onClick={() => setServiceId(s.id)}
                  >
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-4">
                        <Scissors className="h-5 w-5 text-gold" />
                        <div>
                          <h3 className="font-heading text-lg">{s.name}</h3>
                          <p className="text-sm text-muted-foreground">{formatDuration(s.duration)}</p>
                        </div>
                      </div>
                      <span className="font-heading text-xl text-gold">{formatPrice(s.price)}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4">
                {BARBERS.map((b) => (
                  <Card
                    key={b.id}
                    className={cn(
                      "glass-card cursor-pointer transition-all hover:border-gold/40",
                      barberId === b.id && "border-gold ring-1 ring-gold/30"
                    )}
                    onClick={() => setBarberId(b.id)}
                  >
                    <CardContent className="flex items-center gap-4 p-5">
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
                      <div>
                        <h3 className="font-heading text-lg">{b.name}</h3>
                        <p className="text-sm text-gold">{b.title}</p>
                        <p className="text-sm text-muted-foreground">{b.bio}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <Label className="mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gold" /> Select Date
                  </Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || isClosedDay(d)}
                    className="glass-card rounded-xl border-gold/20 p-3"
                  />
                </div>
                <div>
                  <Label className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold" /> Select Time
                  </Label>
                  {!date ? (
                    <p className="text-sm text-muted-foreground">Please select a date first</p>
                  ) : timeSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available slots for this date</p>
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
            )}

            {step === 3 && service && barber && date && time && (
              <Card className="glass-card">
                <CardContent className="space-y-6 p-8">
                  <h3 className="font-heading text-2xl">Booking Summary</h3>
                  <div className="space-y-3">
                    {[
                      ["Service", service.name],
                      ["Barber", barber.name],
                      ["Date", format(date, "EEEE, MMMM d, yyyy")],
                      ["Time", time],
                      ["Duration", formatDuration(service.duration)],
                      ["Price", formatPrice(service.price)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between border-b border-gold/10 pb-2">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests..."
                      className="mt-1.5 border-gold/20 bg-white/5"
                    />
                  </div>
                  <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="gold-gradient h-12 w-full border-0 text-base"
                  >
                    {loading ? "Confirming..." : "Confirm Booking"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="border-gold/30"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < 3 && (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gold-gradient border-0"
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
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
