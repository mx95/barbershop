"use client";

import Image from "next/image";
import Link from "next/link";
import { Scissors, Award, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";

const featureIcons = [Scissors, Award, Users, Sparkles];

export function AboutPreview() {
  const { t } = useLanguage();

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
            <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">{t.home.about.eyebrow}</p>
            <h2 className="font-heading text-3xl font-light sm:text-4xl lg:text-5xl">
              {SITE.tagline}
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">{t.home.about.paragraph1}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t.home.about.paragraph2}{" "}
              <a href={`tel:${SITE.phone}`} className="text-gold hover:underline">
                {SITE.phoneDisplay}
              </a>
              .
            </p>

            <StaggerReveal className="mt-10 grid gap-6 sm:grid-cols-2" stagger={0.08}>
              {t.home.about.features.map((feature, i) => {
                const Icon = featureIcons[i] ?? Scissors;
                return (
                  <StaggerItem key={feature.title}>
                    <div className="flex gap-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                      <div>
                        <h3 className="text-sm font-medium">{feature.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerReveal>

            <Button variant="outline" asChild className="mt-10 border-gold/30 hover:bg-gold/10">
              <Link href="/about">{t.home.about.discoverCta}</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
