"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  XCircle,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StoredAppointment } from "@/lib/store/appointments";

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, completed: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/appointments");
        const data = await res.json();
        const all = (data.appointments ?? []) as StoredAppointment[];
        const today = format(new Date(), "yyyy-MM-dd");
        const todayAppts = all.filter(
          (a) => format(new Date(a.starts_at), "yyyy-MM-dd") === today
        );

        setAppointments(todayAppts);
        setStats({
          today: todayAppts.length,
          week: all.length,
          completed: todayAppts.filter((a) => a.status === "completed").length,
          pending: todayAppts.filter((a) => a.status === "confirmed" || a.status === "checked_in").length,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateStatus(id: string, status: StoredAppointment["status"]) {
    const res = await fetch("/api/appointments/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, status }),
    });

    if (!res.ok) {
      toast.error("Failed to update appointment");
      return;
    }

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              checked_in_at: status === "checked_in" ? new Date().toISOString() : a.checked_in_at,
            }
          : a
      )
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
  };

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Barber Dashboard"
          subtitle="Manage today's appointments."
          className="mb-10"
        />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, label: "Today", value: stats.today },
            { icon: Clock, label: "Pending", value: stats.pending },
            { icon: CheckCircle, label: "Completed", value: stats.completed },
            { icon: Users, label: "All Bookings", value: stats.week },
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
              appointments.map((appt) => (
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
                      <p className="mt-1 font-medium">{appt.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {appt.service_name} · {appt.barber_name}
                      </p>
                      {appt.customer_phone && (
                        <p className="text-xs text-muted-foreground">{appt.customer_phone}</p>
                      )}
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
              ))
            )}
          </TabsContent>

          <TabsContent value="reminders">
            <Card className="glass-card">
              <CardContent className="p-6 text-sm text-muted-foreground">
                <h3 className="font-heading mb-4 text-xl text-foreground">Reminders</h3>
                <p>Email and SMS reminders can be wired up separately when you&apos;re ready.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
