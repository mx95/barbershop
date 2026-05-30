"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Appointment } from "@/lib/types";

export default function CheckInPage() {
  const params = useParams();
  const code = params.code as string;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("appointments")
        .select("*, services(name), barbers(name)")
        .eq("check_in_code", code)
        .single();

      if (data) setAppointment(data);

      const QRCode = (await import("qrcode")).default;
      const url = `${window.location.origin}/check-in/${code}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: "#C9A227", light: "#0a0a0a" },
      });
      setQrDataUrl(dataUrl);
      setLoading(false);
    }
    load();
  }, [code]);

  async function handleCheckIn() {
    const res = await fetch("/api/appointments/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkInCode: code }),
    });

    if (res.ok) {
      toast.success("Checked in successfully!");
      setAppointment((prev) =>
        prev ? { ...prev, status: "checked_in", checked_in_at: new Date().toISOString() } : null
      );
    } else {
      toast.error("Check-in failed");
    }
  }

  if (loading) {
    return <div className="section-padding text-center">Loading...</div>;
  }

  if (!appointment) {
    return (
      <div className="section-padding text-center">
        <p className="text-muted-foreground">Appointment not found</p>
      </div>
    );
  }

  const service = (appointment as Appointment & { services?: { name: string } }).services;
  const barber = (appointment as Appointment & { barbers?: { name: string } }).barbers;
  const isCheckedIn = appointment.status === "checked_in" || appointment.status === "completed";

  return (
    <div className="flex min-h-[70vh] items-center justify-center section-padding">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-gold/30">
          <CardContent className="p-8 text-center">
            <QrCode className="mx-auto mb-4 h-10 w-10 text-gold" />
            <h1 className="font-heading text-2xl">Appointment Check-In</h1>
            <p className="mt-1 text-sm text-gold">{code}</p>

            {qrDataUrl && (
              <div className="mx-auto my-6 w-fit rounded-xl border border-gold/20 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="Check-in QR code" className="h-48 w-48" />
              </div>
            )}

            <div className="space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span>{service?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Barber</span>
                <span>{barber?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{format(new Date(appointment.starts_at), "MMM d, yyyy · HH:mm")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="border-gold/30 text-gold">
                  {appointment.status.replace("_", " ")}
                </Badge>
              </div>
            </div>

            {!isCheckedIn && (
              <Button onClick={handleCheckIn} className="gold-gradient mt-6 w-full border-0">
                <CheckCircle className="mr-2 h-4 w-4" /> Check In Now
              </Button>
            )}

            {isCheckedIn && (
              <div className="mt-6 flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span>Checked in — enjoy your session!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
