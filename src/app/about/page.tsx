"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/navbar";
import { SITE } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/language-provider";

export default function AboutPage() {
  const { t } = useLanguage();
  const p = t.pages.about;
  const c = t.pages.contact;

  return (
    <div>
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src="/images/shop-wall.jpg"
          alt={`${SITE.name} interior`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="cinematic-overlay absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PageHeader title={p.title} />
        </div>
      </div>

      <div className="section-padding">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-invert mx-auto">
            <p className="text-lg leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{SITE.name}</strong> {p.storyP1}
            </p>

            <h2 className="font-heading mt-12 text-3xl font-light text-gold">{p.shop}</h2>
            <p className="leading-relaxed text-muted-foreground">{p.shopP}</p>

            <h2 className="font-heading mt-12 text-3xl font-light text-gold">{p.findUs}</h2>
            <p className="leading-relaxed text-muted-foreground">
              {SITE.address}. {c.phone}:{" "}
              <a href={`tel:${SITE.phone}`} className="text-gold hover:underline">
                {SITE.phoneDisplay}
              </a>
              . {c.email}:{" "}
              <a href={`mailto:${SITE.email}`} className="text-gold hover:underline">
                {SITE.email}
              </a>
              . {p.findUsP}
            </p>
          </div>

          <div className="mt-12 text-center">
            <Button asChild className="gold-gradient border-0">
              <Link href="/booking">{t.nav.bookAppointment}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
