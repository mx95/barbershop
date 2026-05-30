"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCalendar } from "@/components/booking/add-to-calendar";
import { loadBookingIds, loadSavedCustomer } from "@/lib/customer-storage";
import { SITE } from "@/lib/constants";
import type { CalendarEvent } from "@/lib/booking-utils";
import type { StoredAppointment } from "@/lib/store/appointments";

export default function AccountPage() {
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="section-padding text-center">Loading your bookings...</div>;
  }

  const upcoming = appointments.filter(
    (a) => new Date(a.starts_at) > new Date() && a.status !== "cancelled"
  );

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title={`Welcome${customerName ? `, ${customerName.split(" ")[0]}` : ""}`}
          subtitle="Your bookings on this device. Book again anytime — we'll remember your details."
          className="mb-10"
        />

        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Calendar className="mx-auto mb-4 h-10 w-10 text-gold" />
                <p className="text-muted-foreground">No upcoming appointments on this device</p>
                <Button asChild className="gold-gradient mt-4 border-0">
                  <Link href="/booking">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((appt) => {
              const startsAt = new Date(appt.starts_at);
              const endsAt = new Date(appt.ends_at);
              const calendarEvent: CalendarEvent = {
                title: `${appt.service_name} — ${SITE.name}`,
                description: `Barber: ${appt.barber_name}`,
                location: SITE.address,
                startsAt,
                endsAt,
              };

              return (
                <Card key={appt.id} className="glass-card">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <p className="font-heading text-lg">{appt.service_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(startsAt, "EEEE, MMM d · HH:mm")}
                      </p>
                      <p className="text-sm text-muted-foreground">with {appt.barber_name}</p>
                      <Badge variant="outline" className="mt-2 border-gold/30 text-gold">
                        {appt.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <AddToCalendar event={calendarEvent} />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
