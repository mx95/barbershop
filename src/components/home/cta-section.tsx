"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, CalendarPlus, Gift, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

const perks = [
  { icon: Calendar, title: "Easy Online Booking", desc: "Book in seconds, 24/7" },
  { icon: Bell, title: "Smart Reminders", desc: "Email & SMS notifications" },
  { icon: Gift, title: "Loyalty Rewards", desc: "Earn points every visit" },
  { icon: CalendarPlus, title: "Add to Calendar", desc: "One tap on any device" },
];

export function CtaSection() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card relative overflow-hidden rounded-2xl p-8 sm:p-12 lg:p-16"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">Ready?</p>
              <h2 className="font-heading text-4xl font-light sm:text-5xl">
                Your Chair Awaits
              </h2>
              <p className="mt-4 text-muted-foreground">
                {SITE.name} in {SITE.locationLine} — {SITE.tagline.toLowerCase()}. Book online or
                call{" "}
                <a href={`tel:${SITE.phone}`} className="text-gold hover:underline">
                  {SITE.phoneDisplay}
                </a>
                .
              </p>
              <Button size="lg" asChild className="gold-gradient mt-8 h-14 border-0 px-8">
                <Link href="/booking">Book Your Appointment</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-gold/10 bg-white/5">
                    <CardContent className="p-4 text-center">
                      <perk.icon className="mx-auto mb-2 h-6 w-6 text-gold" />
                      <p className="text-sm font-medium">{perk.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{perk.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
