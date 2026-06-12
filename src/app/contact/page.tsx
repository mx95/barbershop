"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SITE, OPENING_HOURS, OPENING_HOURS_SUMMARY } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/language-provider";

export default function ContactPage() {
  const { t } = useLanguage();
  const p = t.pages.contact;
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success(p.success);
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  }

  const contactItems = [
    { icon: MapPin, label: p.location, value: SITE.address },
    { icon: Phone, label: p.phone, value: SITE.phoneDisplay, href: `tel:${SITE.phone}` },
    ...(SITE.email
      ? [{ icon: Mail, label: p.email, value: SITE.email, href: `mailto:${SITE.email}` }]
      : []),
    { icon: Clock, label: p.hours, value: OPENING_HOURS_SUMMARY },
  ];

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <PageHeader title={p.title} subtitle={p.subtitle} className="mb-16" />

        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {contactItems.map((item) => (
              <Card key={item.label} className="glass-card">
                <CardContent className="flex items-center gap-4 p-6">
                  <item.icon className="h-6 w-6 text-gold" />
                  <div>
                    <p className="text-xs tracking-wider text-gold uppercase">{item.label}</p>
                    {"href" in item && item.href ? (
                      <a href={item.href} className="mt-1 block hover:text-gold">
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1">{item.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="glass-card">
              <CardContent className="p-6">
                <p className="mb-4 text-xs tracking-wider text-gold uppercase">{p.openingHours}</p>
                <ul className="space-y-2 text-sm">
                  {OPENING_HOURS.map(({ day, hours }) => (
                    <li key={day} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{day}</span>
                      <span className={hours ? "text-foreground" : "text-muted-foreground/60"}>
                        {hours ?? p.closed}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="glass-card overflow-hidden rounded-xl">
              <iframe
                title={`${SITE.name} location`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="h-64 w-full border-0"
                loading="lazy"
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="glass-card">
              <CardContent className="p-8">
                <h2 className="font-heading mb-6 text-2xl">{p.formTitle}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">{p.name}</Label>
                      <Input id="name" name="name" required className="mt-1.5 border-gold/20 bg-white/5" />
                    </div>
                    <div>
                      <Label htmlFor="email">{p.email}</Label>
                      <Input id="email" name="email" type="email" required className="mt-1.5 border-gold/20 bg-white/5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">{p.subject}</Label>
                    <Input id="subject" name="subject" required className="mt-1.5 border-gold/20 bg-white/5" />
                  </div>
                  <div>
                    <Label htmlFor="message">{p.message}</Label>
                    <Textarea id="message" name="message" rows={5} required className="mt-1.5 border-gold/20 bg-white/5" />
                  </div>
                  <Button type="submit" disabled={loading} className="gold-gradient w-full border-0">
                    <Send className="mr-2 h-4 w-4" />
                    {loading ? p.sending : p.send}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
