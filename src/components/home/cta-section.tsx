"use client";

import Link from "next/link";
import { Calendar, CalendarPlus, Gift, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";

const perkIcons = [Calendar, Bell, Gift, CalendarPlus];

export function CtaSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <Reveal className="glass-card relative overflow-hidden rounded-2xl p-6 sm:p-12 lg:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">{t.cta.ready}</p>
              <h2 className="font-heading text-3xl font-light sm:text-4xl lg:text-5xl">
                {t.cta.chairAwaits}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {SITE.name} — {SITE.locationLine}.{" "}
                <a href={`tel:${SITE.phone}`} className="text-gold hover:underline">
                  {SITE.phoneDisplay}
                </a>
              </p>
              <Button size="lg" asChild className="gold-gradient mt-8 h-12 w-full border-0 sm:h-14 sm:w-auto sm:px-8">
                <Link href="/booking">{t.nav.bookAppointment}</Link>
              </Button>
            </div>

            <StaggerReveal className="grid grid-cols-2 gap-3 sm:gap-4" stagger={0.07}>
              {t.cta.perks.map((perk, i) => {
                const Icon = perkIcons[i] ?? Calendar;
                return (
                  <StaggerItem key={perk.title}>
                    <Card className="h-full border-gold/10 bg-white/5">
                      <CardContent className="p-3 text-center sm:p-4">
                        <Icon className="mx-auto mb-2 h-6 w-6 text-gold" />
                        <p className="text-xs font-medium sm:text-sm">{perk.title}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{perk.desc}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerReveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
