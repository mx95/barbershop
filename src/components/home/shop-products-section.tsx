"use client";

import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { brandLogoClassName, SHOP_BRANDS } from "@/lib/brands";
import { useLanguage } from "@/lib/i18n/language-provider";

export function ShopProductsSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 text-center sm:mb-12">
          <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">{t.brands.eyebrow}</p>
          <h2 className="font-heading text-4xl font-light sm:text-5xl">{t.brands.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t.brands.subtitle}</p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
          {SHOP_BRANDS.map((brand, index) => (
            <Reveal
              key={brand.id}
              delay={index * 0.05}
              className="flex min-h-[9rem] flex-col items-center justify-center gap-4 rounded-xl border border-gold/20 bg-card/40 px-4 py-6 text-center transition-colors hover:border-gold/45 hover:bg-gold/5 sm:min-h-[10rem]"
            >
              <span className="font-heading text-xl tracking-wide text-foreground sm:text-2xl">
                {brand.name}
              </span>
              <div
                className={`relative h-12 w-full sm:h-14 ${
                  "logoFilter" in brand && brand.logoFilter === "light-backdrop"
                    ? "max-w-[5.25rem] rounded-md bg-white px-2 py-1.5 sm:max-w-[5.75rem]"
                    : "max-w-[7.5rem] sm:max-w-[8.5rem]"
                }`}
              >
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  fill
                  className={`object-contain object-center ${brandLogoClassName("logoFilter" in brand ? brand.logoFilter : undefined)}`}
                  sizes="(max-width: 640px) 120px, 136px"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10 text-center text-sm text-muted-foreground sm:mt-12">
          {t.brands.partnerNote}
        </Reveal>
      </div>
    </section>
  );
}
