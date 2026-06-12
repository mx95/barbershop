"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { StaffLoginForm } from "@/components/account/staff-login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCalendar } from "@/components/booking/add-to-calendar";
import { RescheduleDialog } from "@/components/booking/reschedule-dialog";
import { loadBookingIds, saveBookingId } from "@/lib/customer-storage";
import {
  clearCustomerSession,
  getCustomerSession,
} from "@/lib/customer-session";
import {
  consumeStaffLoginPrompt,
  getStaffSession,
} from "@/lib/staff-session";
import { canModifyBooking, getModifyDeadline } from "@/lib/booking-utils";
import { useLanguage } from "@/lib/i18n/language-provider";
import { SITE } from "@/lib/constants";
import type { CalendarEvent } from "@/lib/booking-utils";
import type { StoredAppointment } from "@/lib/store/appointments";

function sortAppointments(list: StoredAppointment[]) {
  return [...list].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );
}

function mergeAppointments(...lists: StoredAppointment[][]) {
  const byId = new Map<string, StoredAppointment>();
  for (const list of lists) {
    for (const appt of list) {
      byId.set(appt.id, appt);
    }
  }
  return sortAppointments([...byId.values()]);
}

const STAFF_UNLOCK_CLICKS = 5;
const STAFF_UNLOCK_WINDOW_MS = 2500;

export default function AccountPage() {
  const router = useRouter();
  const { t, serviceName } = useLanguage();
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<StoredAppointment | null>(null);
  const staffUnlockClicks = useRef(0);
  const staffUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadLocalAppointments = useCallback(async () => {
    const ids = loadBookingIds();
    if (ids.length === 0) return [];
    const res = await fetch(`/api/appointments?ids=${ids.join(",")}`);
    const data = await res.json();
    return (data.appointments ?? []) as StoredAppointment[];
  }, []);

  const loadLoggedInAppointments = useCallback(async (token: string) => {
    const res = await fetch("/api/account/appointments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) clearCustomerSession();
      return [];
    }
    const data = await res.json();
    const list = (data.appointments ?? []) as StoredAppointment[];
    for (const appt of list) {
      saveBookingId(appt.id);
    }
    return list;
  }, []);

  const refreshAppointments = useCallback(
    async (token: string | null) => {
      setLoading(true);
      try {
        const local = await loadLocalAppointments();
        if (token) {
          const remote = await loadLoggedInAppointments(token);
          setAppointments(mergeAppointments(remote, local));
          const name = remote[0]?.customer_name ?? local[0]?.customer_name ?? "";
          if (name) setCustomerName(name);
        } else {
          setAppointments(sortAppointments(local));
          const name = local[0]?.customer_name ?? "";
          if (name) setCustomerName(name);
        }
      } finally {
        setLoading(false);
      }
    },
    [loadLocalAppointments, loadLoggedInAppointments]
  );

  useEffect(() => {
    const staff = getStaffSession();
    if (staff) {
      router.replace("/dashboard");
      return;
    }
    if (consumeStaffLoginPrompt()) {
      setShowStaffLogin(true);
    }
    const session = getCustomerSession();
    if (session) {
      setCustomerToken(session.token);
    }
    setSessionReady(true);
    refreshAppointments(session?.token ?? null);
  }, [refreshAppointments, router]);

  function handleWelcomeUnlock() {
    staffUnlockClicks.current += 1;
    if (staffUnlockTimer.current) clearTimeout(staffUnlockTimer.current);
    if (staffUnlockClicks.current >= STAFF_UNLOCK_CLICKS) {
      staffUnlockClicks.current = 0;
      setShowStaffLogin(true);
      return;
    }
    staffUnlockTimer.current = setTimeout(() => {
      staffUnlockClicks.current = 0;
    }, STAFF_UNLOCK_WINDOW_MS);
  }

  function handleStaffLoginSuccess() {
    router.push("/dashboard");
  }

  function handleLoginSuccess(data: { token: string; name: string }) {
    setCustomerToken(data.token);
    if (data.name) setCustomerName(data.name);
    refreshAppointments(data.token);
  }

  function handleLogout() {
    clearCustomerSession();
    setCustomerToken(null);
    setCustomerName("");
    refreshAppointments(null);
    toast.success(t.account.logoutSuccess);
  }

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

  if (!sessionReady || loading) {
    return <div className="section-padding text-center">{t.account.loading}</div>;
  }

  const upcoming = appointments.filter(
    (a) => new Date(a.starts_at) > new Date() && a.status !== "cancelled"
  );

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <button
            type="button"
            onClick={handleWelcomeUnlock}
            className="flex-1 cursor-default border-0 bg-transparent p-0 text-left"
            aria-label={t.account.welcome}
          >
            <PageHeader
              title={`${t.account.welcome}${customerName ? `, ${customerName.split(" ")[0]}` : ""}`}
              subtitle={customerToken ? t.account.subtitleLoggedIn : t.account.subtitle}
              className="mb-0"
            />
          </button>
          {customerToken ? (
            <Button
              type="button"
              variant="outline"
              className="border-gold/30"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t.account.logout}
            </Button>
          ) : null}
        </div>

        {showStaffLogin ? (
          <StaffLoginForm discrete onSuccess={handleStaffLoginSuccess} />
        ) : null}

        {!customerToken ? <CustomerLoginForm onSuccess={handleLoginSuccess} /> : null}

        <p className="mb-6 text-center text-sm text-muted-foreground">{t.booking.policy}</p>

        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Calendar className="mx-auto mb-4 h-10 w-10 text-gold" />
                <p className="text-muted-foreground">
                  {customerToken ? t.account.noUpcomingLoggedIn : t.account.noUpcoming}
                </p>
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
