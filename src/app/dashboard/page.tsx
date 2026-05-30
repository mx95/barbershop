"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  XCircle,
  QrCode,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import type { Appointment } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, completed: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?redirect=/dashboard");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "barber" && profile?.role !== "admin") {
        router.push("/account");
        return;
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const { data } = await supabase
        .from("appointments")
        .select("*, services(name, price, duration), profiles!appointments_customer_id_fkey(full_name, phone, email)")
        .gte("starts_at", `${today}T00:00:00`)
        .order("starts_at", { ascending: true });

      if (data) {
        setAppointments(data);
        const now = new Date();
        setStats({
          today: data.length,
          week: data.length,
          completed: data.filter((a) => a.status === "completed").length,
          pending: data.filter((a) => a.status === "confirmed" || a.status === "pending").length,
        });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    const updates: Record<string, unknown> = { status };

    if (status === "checked_in") {
      updates.checked_in_at = new Date().toISOString();
    }

    const { error } = await supabase.from("appointments").update(updates).eq("id", id);
    if (error) {
      toast.error("Failed to update appointment");
      return;
    }

    if (status === "completed") {
      await fetch("/api/appointments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id }),
      });
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: status as Appointment["status"] } : a))
    );
    toast.success(`Appointment ${status.replace("_", " ")}`);
  }

  if (loading) {
    return <div className="section-padding text-center">Loading dashboard...</div>;
  }

  const statusColor: Record<string, string> = {
    confirmed: "border-blue-500/30 text-blue-400",
    checked_in: "border-gold text-gold",
    completed: "border-green-500/30 text-green-400",
    cancelled: "border-red-500/30 text-red-400",
    no_show: "border-red-500/30 text-red-400",
    pending: "border-yellow-500/30 text-yellow-400",
  };

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Barber Dashboard"
          subtitle="Manage today's appointments and client check-ins."
          className="mb-10"
        />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, label: "Today", value: stats.today },
            { icon: Clock, label: "Pending", value: stats.pending },
            { icon: CheckCircle, label: "Completed", value: stats.completed },
            { icon: Users, label: "This Week", value: stats.week },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="flex items-center gap-4 p-5">
                  <stat.icon className="h-8 w-8 text-gold" />
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-heading text-3xl">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="today">
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="today">Today&apos;s Schedule</TabsTrigger>
            <TabsTrigger value="reminders">
              <Bell className="mr-2 h-4 w-4" /> Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No appointments scheduled for today
                </CardContent>
              </Card>
            ) : (
              appointments.map((appt) => {
                const customer = (appt as Appointment & { profiles?: { full_name: string; phone: string } }).profiles;
                const service = (appt as Appointment & { services?: { name: string } }).services;
                return (
                  <Card key={appt.id} className="glass-card">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-heading text-xl">
                            {format(new Date(appt.starts_at), "HH:mm")}
                          </p>
                          <Badge variant="outline" className={statusColor[appt.status]}>
                            {appt.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="mt-1 font-medium">{customer?.full_name || "Walk-in"}</p>
                        <p className="text-sm text-muted-foreground">{service?.name}</p>
                        {customer?.phone && (
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        )}
                        <p className="mt-1 text-xs text-gold">
                          <QrCode className="mr-1 inline h-3 w-3" />
                          {appt.check_in_code}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {appt.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(appt.id, "checked_in")}
                            className="gold-gradient border-0"
                          >
                            Check In
                          </Button>
                        )}
                        {(appt.status === "confirmed" || appt.status === "checked_in") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(appt.id, "completed")}
                            className="border-green-500/30 text-green-400"
                          >
                            Complete
                          </Button>
                        )}
                        {appt.status !== "cancelled" && appt.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(appt.id, "cancelled")}
                            className="border-red-500/30 text-red-400"
                          >
                            <XCircle className="mr-1 h-3 w-3" /> Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="reminders">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-heading mb-4 text-xl">Automated Reminders</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>✉️ Email reminders sent 24 hours before appointment</p>
                  <p>📱 SMS reminders sent 2 hours before appointment</p>
                  <p>🎂 Birthday reminders sent on customer&apos;s birthday</p>
                  <p className="text-xs">
                    Reminders are processed via cron job at /api/reminders. Configure RESEND_API_KEY and TWILIO credentials in .env
                  </p>
                </div>
                <Button
                  className="gold-gradient mt-6 border-0"
                  onClick={() => fetch("/api/reminders", { method: "POST" }).then(() => toast.success("Reminders triggered"))}
                >
                  Send Pending Reminders Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
