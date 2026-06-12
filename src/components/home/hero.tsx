"use client";



import Link from "next/link";

import Image from "next/image";

import { motion, useReducedMotion } from "framer-motion";

import { ArrowRight, Star } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";

import { Button } from "@/components/ui/button";

import { SITE } from "@/lib/constants";

import { useLanguage } from "@/lib/i18n/language-provider";
import { Reveal } from "@/components/motion/reveal";

import { HarleyCruise } from "@/components/home/harley-cruise";

import { useIntroMotion } from "@/lib/motion/intro-context";



const EASE = [0.22, 1, 0.36, 1] as const;



export function Hero() {

  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();

  const { introReady, cycle } = useIntroMotion();



  return (

    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">

      <motion.div

        key={`hero-bg-${cycle}`}

        className="absolute inset-0"

        initial={reduceMotion || !introReady ? false : { scale: 1.08, opacity: 0.85 }}

        animate={introReady ? { scale: 1, opacity: 1 } : { scale: 1.08, opacity: 0.85 }}

        transition={{ duration: 1.6, ease: EASE }}

      >

        <Image

          src="/images/shop-wall.jpg"

          alt="Barber's interior"

          fill

          priority

          className="object-cover"

          sizes="100vw"

        />

      </motion.div>

      <HarleyCruise />
      <div className="cinematic-overlay absolute inset-0 z-[1]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">

        <Reveal inView={false} delay={0.15} y={36} className="mb-8 flex justify-center">

          <motion.div

            animate={introReady ? { scale: [1, 1.03, 1] } : undefined}

            transition={{ duration: 2.2, delay: 0.9, ease: "easeInOut" }}

          >

            <LogoMark size="hero" className="!h-32 !w-32 sm:!h-44 sm:!w-44 lg:!h-56 lg:!w-56" />

          </motion.div>

        </Reveal>



        <Reveal inView={false} delay={0.35} y={32}>

          <h1 className="font-heading text-4xl font-light tracking-wide sm:text-6xl lg:text-8xl">

            {SITE.name}

          </h1>

        </Reveal>



        <Reveal inView={false} delay={0.5} y={24}>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">

            {t.hero.descriptionBefore}{" "}

            <span className="text-foreground">{SITE.name}</span>{" "}

            {t.hero.descriptionAfter} {t.hero.callUs}{" "}

            <a href={`tel:${SITE.phone}`} className="text-gold underline-offset-4 hover:underline">

              {SITE.phoneDisplay}

            </a>

            .

          </p>

        </Reveal>



        <Reveal inView={false} delay={0.6} y={20}>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">

            {t.hero.hoursLabel}{" "}

            <span className="text-gold">{t.hero.hoursValue}</span>

          </p>

        </Reveal>



        <Reveal

          inView={false}

          delay={0.68}

          y={20}

          className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4"

        >

          <Button size="lg" asChild className="gold-gradient h-12 border-0 text-base font-semibold sm:h-14 sm:px-8">

            <Link href="/booking">

              {t.hero.bookSession}

              <ArrowRight className="ml-2 h-5 w-5" />

            </Link>

          </Button>

        </Reveal>



        <Reveal inView={false} delay={0.85} y={16} className="mt-12 flex flex-wrap items-center justify-center gap-2 text-gold">

          {[...Array(5)].map((_, i) => (

            <Star key={i} className="h-4 w-4 fill-current" />

          ))}

          <span className="ml-2 text-sm text-muted-foreground">{t.hero.rating}</span>

        </Reveal>

      </div>



      <motion.div

        key={`hero-scroll-${cycle}`}

        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:bottom-8 sm:block"

        initial={reduceMotion || !introReady ? false : { opacity: 0, y: 8 }}

        animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}

        transition={{ delay: 1.25, duration: 0.7, ease: EASE }}

      >

        <div className="h-12 w-6 rounded-full border-2 border-gold/40 p-1">

          <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-gold" />

        </div>

      </motion.div>

    </section>

  );

}

