"use client";

import Image from "next/image";
import Link from "next/link";
import { Scissors, Award, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";

const features = [
  {
    icon: Scissors,
    title: "Master Craftsmanship",
    description: "Precision cuts and shaves performed with traditional techniques and modern expertise.",
  },
  {
    icon: Award,
    title: "Premium Products",
    description:
      "Reuzel, LaVish, Vkings, MUC, KEUNE, and more — plus hot towel rituals and expert recommendations.",
  },
  {
    icon: Users,
    title: "Personal Experience",
    description: "Every visit is tailored to you. Consultation, style advice, and attention to detail.",
  },
  {
    icon: Sparkles,
    title: "Luxury Atmosphere",
    description: "Step into a sanctuary adorned with vintage memorabilia from around the world.",
  },
];

export function AboutPreview() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <Reveal className="relative min-h-[280px] sm:min-h-[400px] lg:min-h-[600px]">
          <Image
            src="/images/shop-wall.jpg"
            alt={`${SITE.name} — vintage sign wall`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background lg:bg-gradient-to-r lg:from-transparent lg:to-background" />
        </Reveal>

        <div className="flex items-center section-padding lg:pl-16">
          <Reveal>
            <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">Our Story</p>
            <h2 className="font-heading text-3xl font-light sm:text-4xl lg:text-5xl">
              {SITE.tagline}
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              {SITE.name} on Mixalaki Vraximi in Xylophagou — haircuts from €13, hot towel shaves,
              beard trims, and family packages in a shop covered with vintage signs from across
              Europe.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Our wall is covered in license plates and barber memorabilia; the service is
              straight-talking Cypriot barbering with no fuss. Book online or call{" "}
              <a href={`tel:${SITE.phone}`} className="text-gold hover:underline">
                {SITE.phoneDisplay}
              </a>
              .
            </p>

            <StaggerReveal className="mt-10 grid gap-6 sm:grid-cols-2" stagger={0.08}>
              {features.map((feature) => (
                <StaggerItem key={feature.title}>
                  <div className="flex gap-3">
                    <feature.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <div>
                      <h3 className="text-sm font-medium">{feature.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>

            <Button variant="outline" asChild className="mt-10 border-gold/30 hover:bg-gold/10">
              <Link href="/about">Discover Our Story</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
