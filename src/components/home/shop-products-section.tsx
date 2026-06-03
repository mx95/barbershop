"use client";



import { useRef } from "react";

import { ChevronLeft, ChevronRight, Store } from "lucide-react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import { PRODUCTS_SECTION_COPY, SHOP_PRODUCTS } from "@/lib/shop-products";

import { useLanguage } from "@/lib/i18n/language-provider";

import { Reveal } from "@/components/motion/reveal";
import { useIntroMotion } from "@/lib/motion/intro-context";



export function ShopProductsSection() {
  const { locale } = useLanguage();
  const { cycle } = useIntroMotion();

  const p = PRODUCTS_SECTION_COPY[locale] ?? PRODUCTS_SECTION_COPY.en;

  const trackRef = useRef<HTMLDivElement>(null);



  function scrollByCard(direction: "prev" | "next") {

    const track = trackRef.current;

    if (!track) return;

    const card = track.querySelector<HTMLElement>("[data-carousel-card]");

    const amount = card ? card.offsetWidth + 16 : 280;

    track.scrollBy({ left: direction === "next" ? amount : -amount, behavior: "smooth" });

  }



  return (

    <section className="section-padding">

      <div className="mx-auto max-w-7xl">

        <Reveal className="mb-10 text-center sm:mb-12">

          <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">{p.eyebrow}</p>

          <h2 className="font-heading text-4xl font-light sm:text-5xl">{p.title}</h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{p.subtitle}</p>

        </Reveal>



        <div className="flex items-center gap-2 sm:gap-4">

          <Button

            type="button"

            variant="outline"

            size="icon"

            aria-label={p.scrollPrev}

            onClick={() => scrollByCard("prev")}

            className="hidden h-10 w-10 shrink-0 border-gold/30 bg-background text-gold hover:bg-gold/10 sm:flex"

          >

            <ChevronLeft className="h-5 w-5" />

          </Button>



          <div className="relative min-w-0 flex-1">

            <div

              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent sm:hidden"

              aria-hidden

            />

            <div

              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent sm:hidden"

              aria-hidden

            />



            <div

              ref={trackRef}

              role="region"

              aria-roledescription="carousel"

              aria-label={p.title}

              className="carousel-track flex snap-x snap-mandatory gap-4 overflow-x-scroll overscroll-x-contain scroll-smooth px-1 pb-3 sm:px-0 sm:pb-2"

            >

              {SHOP_PRODUCTS.map((product, index) => (

                <motion.div
                  key={`${product.id}-${cycle}`}
                  data-carousel-card

                  initial={{ opacity: 0, y: 16 }}

                  whileInView={{ opacity: 1, y: 0 }}

                  viewport={{ once: true, margin: "-20px" }}

                  transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.35) }}

                  className="shrink-0 snap-center"

                >

                  <Card className="glass-card w-[min(78vw,260px)] border-gold/20 sm:w-[280px]">

                    <CardContent className="flex h-full flex-col p-0">

                      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-[#0a0a0c]">

                        <div

                          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(212,175,55,0.07)_0%,transparent_60%)]"

                          aria-hidden

                        />

                        <p className="absolute top-3 left-3 z-10 rounded-md border border-gold/25 bg-background/80 px-2 py-0.5 text-[0.6rem] tracking-[0.2em] text-gold uppercase backdrop-blur-sm">

                          {product.brand}

                        </p>

                        <div className="relative flex h-full items-center justify-center p-5 pt-8">

                          {/* eslint-disable-next-line @next/next/no-img-element */}

                          <img

                            src={product.image}

                            alt={product.name}

                            width={220}

                            height={220}

                            draggable={false}

                            className="max-h-[88%] max-w-[88%] select-none object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]"

                            loading="lazy"

                            decoding="async"

                          />

                        </div>

                      </div>

                      <div className="flex flex-1 flex-col p-5">

                        <Badge

                          variant="outline"

                          className="mb-3 w-fit gap-1 border-gold/40 bg-gold/10 text-gold"

                        >

                          <Store className="h-3 w-3" />

                          {p.availableAtShop}

                        </Badge>

                        <h3 className="font-heading text-lg leading-snug">{product.name}</h3>

                        <p className="mt-2 flex-1 text-sm text-muted-foreground">{product.description}</p>

                        <div className="mt-3 flex flex-wrap gap-1.5">

                          {product.tags.map((tag) => (

                            <span

                              key={tag}

                              className="rounded-md border border-gold/20 px-2 py-0.5 text-[0.65rem] tracking-wide text-muted-foreground uppercase"

                            >

                              {tag}

                            </span>

                          ))}

                        </div>

                      </div>

                    </CardContent>

                  </Card>

                </motion.div>

              ))}

            </div>

          </div>



          <Button

            type="button"

            variant="outline"

            size="icon"

            aria-label={p.scrollNext}

            onClick={() => scrollByCard("next")}

            className="hidden h-10 w-10 shrink-0 border-gold/30 bg-background text-gold hover:bg-gold/10 sm:flex"

          >

            <ChevronRight className="h-5 w-5" />

          </Button>

        </div>



        <p className="mt-4 text-center text-xs tracking-wide text-muted-foreground sm:hidden">

          {p.swipeHint}

        </p>



        <Reveal delay={0.15} className="mt-10 text-center text-sm text-muted-foreground sm:mt-12">

          {p.partnerNote}

        </Reveal>

      </div>

    </section>

  );

}

