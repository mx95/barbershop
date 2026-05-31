"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCalendar } from "@/components/booking/add-to-calendar";
import { RescheduleDialog } from "@/components/booking/reschedule-dialog";
import { loadBookingIds, loadSavedCustomer } from "@/lib/customer-storage";
import { canModifyBooking, getModifyDeadline } from "@/lib/booking-utils";
import { useLanguage } from "@/lib/i18n/language-provider";
import { SITE } from "@/lib/constants";
import type { CalendarEvent } from "@/lib/booking-utils";
import type { StoredAppointment } from "@/lib/store/appointments";

export default function AccountPage() {
  const { t, serviceName } = useLanguage();
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<StoredAppointment | null>(null);

  useEffect(() => {
    async function load() {
      const saved = loadSavedCustomer();
      if (saved?.name) setCustomerName(saved.name);

      const ids = loadBookingIds();
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/appointments?ids=${ids.join(",")}`);
        const data = await res.json();
        if (data.appointments) {
          setAppointments(
            data.appointments.sort(
              (a: StoredAppointment, b: StoredAppointment) =>
                new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
            )
          );
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCancel(id: string) {
    if (!confirm(t.account.cancelConfirm)) return;

    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
      toast.success(t.account.cancelSuccess);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.account.cannotModify);
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return <div className="section-padding text-center">{t.account.loading}</div>;
  }

  const upcoming = appointments.filter(
    (a) => new Date(a.starts_at) > new Date() && a.status !== "cancelled"
  );

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title={`${t.account.welcome}${customerName ? `, ${customerName.split(" ")[0]}` : ""}`}
          subtitle={t.account.subtitle}
          className="mb-10"
        />

        <p className="mb-6 text-center text-sm text-muted-foreground">{t.booking.policy}</p>

        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Calendar className="mx-auto mb-4 h-10 w-10 text-gold" />
                <p className="text-muted-foreground">{t.account.noUpcoming}</p>
                <Button asChild className="gold-gradient mt-4 border-0">
                  <Link href="/booking">{t.nav.bookNow}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((appt) => {
              const startsAt = new Date(appt.starts_at);
              const endsAt = new Date(appt.ends_at);
              const modifiable = canModifyBooking(appt.starts_at);
              const calendarEvent: CalendarEvent = {
                title: `${serviceName(appt.service_id, appt.service_name)} — ${SITE.name}`,
                description: `${t.common.barber}: ${appt.barber_name}`,
                location: SITE.address,
                startsAt,
                endsAt,
              };

              return (
                <Card key={appt.id} className="glass-card">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <p className="font-heading text-lg">
                        {serviceName(appt.service_id, appt.service_name)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(startsAt, "EEEE, MMM d · HH:mm")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.account.with} {appt.barber_name}
                      </p>
                      <Badge variant="outline" className="mt-2 border-gold/30 text-gold">
                        {appt.status.replace("_", " ")}
                      </Badge>
                      {modifiable ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t.account.modifyDeadline}{" "}
                          {format(getModifyDeadline(appt.starts_at), "MMM d · HH:mm")}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-amber-400/90">{t.account.cannotModify}</p>
                      )}
                    </div>
                    <AddToCalendar event={calendarEvent} />
                    {modifiable && (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="outline"
                          className="flex-1 border-gold/30"
                          onClick={() => setRescheduleAppt(appt)}
                        >
                          {t.account.reschedule}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                          disabled={cancellingId === appt.id}
                          onClick={() => handleCancel(appt.id)}
                        >
                          {cancellingId === appt.id ? t.account.cancelling : t.account.cancel}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {rescheduleAppt && (
        <RescheduleDialog
          appointment={rescheduleAppt}
          open={!!rescheduleAppt}
          onOpenChange={(open) => !open && setRescheduleAppt(null)}
          onRescheduled={(updated) => {
            setAppointments((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          }}
        />
      )}
    </div>
  );
}
