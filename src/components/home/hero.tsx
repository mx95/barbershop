"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <Image
        src="/images/shop-wall.jpg"
        alt="Barber's interior"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="cinematic-overlay absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <LogoMark size="hero" className="!h-32 !w-32 sm:!h-44 sm:!w-44 lg:!h-56 lg:!w-56" />
        </div>

        <h1 className="font-heading text-4xl font-light tracking-wide sm:text-6xl lg:text-8xl">
          {SITE.name}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          {SITE.description} Call us on{" "}
          <a href={`tel:${SITE.phone}`} className="text-gold underline-offset-4 hover:underline">
            {SITE.phoneDisplay}
          </a>
          .
        </p>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button size="lg" asChild className="gold-gradient h-12 border-0 text-base font-semibold sm:h-14 sm:px-8">
            <Link href="/booking">
              Book Your Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 border-gold/30 text-base hover:bg-gold/10 sm:h-14 sm:px-8"
          >
            <Link href="/services">View Services</Link>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-gold">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">Premium grooming experience</span>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:bottom-8 sm:block">
        <div className="h-12 w-6 rounded-full border-2 border-gold/40 p-1">
          <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-gold" />
        </div>
      </div>
    </section>
  );
}
