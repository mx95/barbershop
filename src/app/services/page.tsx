import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICES } from "@/lib/constants";
import { formatPrice, formatDuration } from "@/lib/booking-utils";

export const metadata: Metadata = {
  title: "Services",
  description: "Premium barbering services at The Temple of Men, Larnaca.",
};

const categories = [...new Set(SERVICES.map((s) => s.category))];

export default function ServicesPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Our Services"
          subtitle="Precision grooming tailored to the modern gentleman. Every service includes consultation and premium finishing."
          className="mb-16"
        />

        {categories.map((category) => (
          <div key={category} className="mb-16">
            <h2 className="mb-8 font-heading text-2xl tracking-wide text-gold">{category}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {SERVICES.filter((s) => s.category === category).map((service) => (
                <Card key={service.id} className="glass-card transition-all hover:border-gold/40">
                  <CardContent className="flex items-start justify-between gap-4 p-6">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-heading text-xl">{service.name}</h3>
                        {service.popular && (
                          <Badge className="gold-gradient border-0 text-xs">Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(service.duration)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-3xl text-gold">{formatPrice(service.price)}</p>
                      <Button size="sm" variant="outline" asChild className="mt-3 border-gold/30">
                        <Link href={`/booking?service=${service.id}`}>Book</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div className="glass-card mt-8 rounded-2xl p-8 text-center">
          <h3 className="font-heading text-2xl">Not sure which service?</h3>
          <p className="mt-2 text-muted-foreground">
            Book a consultation and our master barber will recommend the perfect treatment.
          </p>
          <Button asChild className="gold-gradient mt-6 border-0">
            <Link href="/booking">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
