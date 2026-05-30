"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div className="section-padding flex min-h-[80vh] items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl">My Bookings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No account needed — book online and view your appointments on this device.
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              When you book at {SITE.name}, your name and phone are saved locally so the next booking is faster.
            </p>
            <Button asChild className="gold-gradient w-full border-0">
              <Link href="/booking">Book an Appointment</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-gold/30">
              <Link href="/account">View My Bookings</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gold">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
