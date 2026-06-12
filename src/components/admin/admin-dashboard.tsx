"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { SwapBookingsPanel } from "@/components/admin/swap-bookings-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BARBERS } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useRouter } from "next/navigation";
import {
  clearStaffSession,
  getStaffSession,
  markStaffLoginPrompt,
} from "@/lib/staff-session";
import type { StoredAppointment } from "@/lib/store/appointments";
import type { TimeOffBlock } from "@/lib/store/time-off";
import type { GalleryImage } from "@/lib/store/gallery";

type CustomerRow = {
  key: string;
  name: string;
  phone: string;
  email: string | null;
  appointments: StoredAppointment[];
};

export function AdminDashboard() {
  const router = useRouter();
  const { t, statusLabel } = useLanguage();
  const [token, setToken] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOffBlock[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [swapA, setSwapA] = useState("");
  const [swapB, setSwapB] = useState("");
  const [swapping, setSwapping] = useState(false);
  const [offDate, setOffDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [calendarEmail, setCalendarEmail] = useState("");
  const [savingCalendarEmail, setSavingCalendarEmail] = useState(false);

  useEffect(() => {
    const session = getStaffSession();
    if (session) {
      setToken(session.token);
      setBarberId(session.barberId);
      setSessionReady(true);
      return;
    }
    markStaffLoginPrompt();
    router.replace("/account");
  }, [router]);

  const authHeaders = useCallback((): HeadersInit => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [apptRes, offRes, galRes, custRes, calRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/admin/time-off", { headers: authHeaders() }),
        fetch("/api/admin/gallery", { headers: authHeaders() }),
        fetch("/api/admin/customers", { headers: authHeaders() }),
        fetch("/api/admin/calendar-email", { headers: authHeaders() }),
      ]);
      const apptData = await apptRes.json();
      const offData = await offRes.json();
      const galData = await galRes.json();
      const custData = await custRes.json();
      const calData = await calRes.json();
      const all = (apptData.appointments ?? []) as StoredAppointment[];
      setAppointments(
        all.filter((a) => a.barber_id === barberId && a.status !== "cancelled")
      );
      setTimeOff(offData.timeOff ?? []);
      setGallery(galData.images ?? []);
      setCustomers(custData.customers ?? []);
      setCalendarEmail(calData.calendarEmail ?? "");
    } finally {
      setLoading(false);
    }
  }, [token, barberId, authHeaders]);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  function logout() {
    clearStaffSession();
    router.push("/account");
  }

  async function saveCalendarEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = calendarEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t.booking.emailRequired);
      return;
    }
    setSavingCalendarEmail(true);
    try {
      const res = await fetch("/api/admin/calendar-email", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ calendarEmail: email }),
      });
      if (!res.ok) {
        toast.error(t.admin.calendar.saveFailed);
        return;
      }
      const data = await res.json();
      setCalendarEmail(data.calendarEmail ?? email);
      toast.success(t.admin.calendar.saved);
    } finally {
      setSavingCalendarEmail(false);
    }
  }

  async function addTimeOff() {
    if (!offDate) return;
    const res = await fetch("/api/admin/time-off", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ date: offDate, allDay: true }),
    });
    if (!res.ok) {
      toast.error(t.admin.dashboard.failedUpdate);
      return;
    }
    setOffDate("");
    loadData();
    toast.success(t.admin.timeOff.saved);
  }

  async function removeTimeOff(id: string) {
    await fetch(`/api/admin/time-off?id=${id}`, { method: "DELETE", headers: authHeaders() });
    loadData();
  }

  async function swapBookings() {
    setSwapping(true);
    try {
      const res = await fetch("/api/admin/swap", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentIdA: swapA, appointmentIdB: swapB }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t.admin.swap.error);
        return;
      }
      setSwapA("");
      setSwapB("");
      loadData();
      toast.success(t.admin.swap.success);
    } finally {
      setSwapping(false);
    }
  }

  async function removeGalleryImage(id: string) {
    if (!confirm(t.admin.gallery.confirmDelete)) return;
    setDeletingImageId(id);
    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setGallery((prev) => prev.filter((img) => img.id !== id));
      toast.success(t.admin.gallery.deleted);
    } catch {
      toast.error(t.admin.gallery.deleteFailed);
    } finally {
      setDeletingImageId(null);
    }
  }

  async function uploadGallery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setUploading(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });
      if (!res.ok) throw new Error();
      (e.target as HTMLFormElement).reset();
      loadData();
      toast.success(t.admin.gallery.saved);
    } catch {
      toast.error(t.admin.gallery.upload);
    } finally {
      setUploading(false);
    }
  }

  const upcoming = useMemo(
    () =>
      [...appointments]
        .filter((a) => new Date(a.starts_at) >= new Date())
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [appointments]
  );

  const activeCustomer = customers.find((c) => c.key === selectedCustomer);

  if (!sessionReady || !token || !barberId) {
    return <div className="section-padding text-center">{t.loading}</div>;
  }

  const barberName = BARBERS.find((b) => b.id === barberId)?.name ?? "";

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <PageHeader title={t.admin.dashboard.title} subtitle={`${barberName} — ${t.admin.dashboard.subtitle}`} />
          <div className="flex gap-2">
            <Button variant="outline" asChild className="border-gold/30">
              <Link href="/">{t.nav.home}</Link>
            </Button>
            <Button variant="outline" onClick={logout}>
              {t.admin.login.logout}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="schedule">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger
              value="schedule"
              className="h-auto min-h-11 flex-none px-3 py-2.5 text-xs sm:text-sm border border-gold/20 bg-card/40 data-active:border-gold data-active:bg-gold/15"
            >
              {t.admin.tabs.schedule}
            </TabsTrigger>
            <TabsTrigger
              value="swap"
              className="h-auto min-h-11 flex-none px-3 py-2.5 text-xs sm:text-sm border border-gold/20 bg-card/40 data-active:border-gold data-active:bg-gold/15"
            >
              {t.admin.tabs.swap}
            </TabsTrigger>
            <TabsTrigger
              value="timeoff"
              className="h-auto min-h-11 flex-none px-3 py-2.5 text-xs sm:text-sm border border-gold/20 bg-card/40 data-active:border-gold data-active:bg-gold/15"
            >
              {t.admin.tabs.timeOff}
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="h-auto min-h-11 flex-none px-3 py-2.5 text-xs sm:text-sm border border-gold/20 bg-card/40 data-active:border-gold data-active:bg-gold/15"
            >
              {t.admin.tabs.customers}
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="h-auto min-h-11 flex-none px-3 py-2.5 text-xs sm:text-sm border border-gold/20 bg-card/40 data-active:border-gold data-active:bg-gold/15"
            >
              {t.admin.tabs.gallery}
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="h-auto min-h-11 flex-none px-3 py-2.5 text-xs sm:text-sm border border-gold/20 bg-card/40 data-active:border-gold data-active:bg-gold/15 col-span-2 sm:col-span-1"
            >
              {t.admin.tabs.calendar}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            {loading ? (
              <p>{t.loading}</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <Card key={appt.id} className="glass-card">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-medium">
                          {format(new Date(appt.starts_at), "EEE d MMM · HH:mm")} — {appt.customer_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appt.service_name} · {appt.customer_phone}
                        </p>
                      </div>
                      <Badge>{statusLabel(appt.status)}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="swap">
            <Card className="glass-card">
              <CardContent className="p-6">
                <SwapBookingsPanel
                  appointments={appointments}
                  swapA={swapA}
                  swapB={swapB}
                  onSwapA={setSwapA}
                  onSwapB={setSwapB}
                  onSwap={swapBookings}
                  swapping={swapping}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeoff">
            <Card className="glass-card max-w-xl">
              <CardContent className="space-y-4 p-6">
                <p className="text-sm text-muted-foreground">{t.admin.timeOff.subtitle}</p>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={offDate}
                    onChange={(e) => setOffDate(e.target.value)}
                    className="border-gold/20 bg-white/5"
                  />
                  <Button className="gold-gradient shrink-0 border-0" onClick={addTimeOff}>
                    {t.admin.timeOff.addBlock}
                  </Button>
                </div>
                <div className="space-y-2">
                  {timeOff.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between rounded-lg border border-gold/15 px-3 py-2"
                    >
                      <span>{block.date}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeTimeOff(block.id)}>
                        {t.admin.timeOff.delete}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                {customers.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelectedCustomer(c.key)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                      selectedCustomer === c.key
                        ? "border-gold bg-gold/10"
                        : "border-gold/15 hover:border-gold/35"
                    }`}
                  >
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.phone}</p>
                  </button>
                ))}
              </div>
              <Card className="glass-card">
                <CardContent className="p-5">
                  {activeCustomer ? (
                    <div className="space-y-3">
                      <h3 className="font-heading text-xl">{activeCustomer.name}</h3>
                      <p className="text-sm text-muted-foreground">{activeCustomer.phone}</p>
                      {activeCustomer.appointments.map((appt) => (
                        <div key={appt.id} className="border-b border-gold/10 pb-2">
                          <p className="font-medium">
                            {format(new Date(appt.starts_at), "EEE d MMM yyyy · HH:mm")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appt.service_name} · {statusLabel(appt.status)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.admin.customers.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="glass-card max-w-xl">
              <CardContent className="space-y-4 p-6">
                <div>
                  <h3 className="font-heading text-xl">{t.admin.calendar.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.admin.calendar.subtitle}</p>
                </div>
                <form onSubmit={saveCalendarEmail} className="space-y-4">
                  <div>
                    <Label htmlFor="calendarEmail">{t.admin.calendar.emailLabel}</Label>
                    <Input
                      id="calendarEmail"
                      type="email"
                      value={calendarEmail}
                      onChange={(e) => setCalendarEmail(e.target.value)}
                      placeholder={t.admin.calendar.emailPlaceholder}
                      required
                      className="mt-1.5 border-gold/20 bg-white/5"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t.admin.calendar.currentNote}</p>
                  <Button
                    type="submit"
                    className="gold-gradient border-0"
                    disabled={savingCalendarEmail}
                  >
                    {savingCalendarEmail ? t.loading : t.admin.calendar.save}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card className="glass-card mb-6 max-w-xl">
              <CardContent className="space-y-4 p-6">
                <form onSubmit={uploadGallery} className="space-y-3">
                  <div>
                    <Label>{t.admin.gallery.upload}</Label>
                    <Input name="file" type="file" accept="image/*" className="mt-1.5" required />
                  </div>
                  <Input name="alt" placeholder={t.admin.gallery.caption} className="border-gold/20 bg-white/5" />
                  <Button type="submit" className="gold-gradient border-0" disabled={uploading}>
                    {uploading ? t.admin.gallery.uploading : t.admin.gallery.upload}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {gallery.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.admin.gallery.noImages}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {gallery.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-gold/15"
                  >
                    <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="25vw" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                      disabled={deletingImageId === img.id}
                      onClick={() => removeGalleryImage(img.id)}
                      aria-label={t.admin.gallery.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {img.alt ? (
                      <p className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {img.alt}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
