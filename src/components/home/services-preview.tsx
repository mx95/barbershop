"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { SERVICES } from "@/lib/constants";
import { formatDuration } from "@/lib/booking-utils";

export function ServicesPreview() {
  const featured = SERVICES.filter((s) => s.popular).slice(0, 4);

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">Our Craft</p>
          <h2 className="font-heading text-4xl font-light sm:text-5xl">Signature Services</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Prices and services match our live menu — from €13 haircuts to full hot towel shave
            packages. Book the same services you&apos;d get at the shop.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card group h-full transition-all hover:border-gold/40 hover:bg-white/10">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <Badge variant="outline" className="border-gold/30 text-gold">
                      {service.category}
                    </Badge>
                    <PriceDisplay price={service.price} />
                  </div>
                  <h3 className="font-heading text-xl">{service.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(service.duration)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" asChild className="border-gold/30 hover:bg-gold/10">
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
