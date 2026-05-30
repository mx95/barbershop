"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scissors, Award, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

const features = [
  {
    icon: Scissors,
    title: "Master Craftsmanship",
    description: "Precision cuts and shaves performed with traditional techniques and modern expertise.",
  },
  {
    icon: Award,
    title: "Premium Products",
    description: "Only the finest grooming products — Reuzel pomades, premium oils, and hot towel rituals.",
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
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative min-h-[400px] lg:min-h-[600px]"
        >
          <Image
            src="/images/shop-wall.jpg"
            alt={`${SITE.name} — vintage sign wall`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background lg:bg-gradient-to-r lg:from-transparent lg:to-background" />
        </motion.div>

        <div className="flex items-center section-padding lg:pl-16">
          <div>
            <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">Our Story</p>
            <h2 className="font-heading text-4xl font-light sm:text-5xl">
              {SITE.tagline}
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {SITE.name} on Mixalaki Vraximi in Xylophagou — haircuts from €13, hot towel shaves,
              beard trims, and family packages in a shop covered with vintage signs from across
              Europe.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Our wall is covered in license plates and barber memorabilia; the service is
              straight-talking Cypriot barbering with no fuss. Book online or call{" "}
              <a href={`tel:${SITE.phone}`} className="text-gold hover:underline">
                {SITE.phoneDisplay}
              </a>
              .
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3"
                >
                  <feature.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <h3 className="text-sm font-medium">{feature.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="outline" asChild className="mt-10 border-gold/30 hover:bg-gold/10">
              <Link href="/about">Discover Our Story</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
