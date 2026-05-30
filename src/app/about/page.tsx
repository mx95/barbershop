import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/navbar";
import { SITE, OPENING_HOURS_SUMMARY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.name} — premium barbershop in ${SITE.locationLine}. Call ${SITE.phoneDisplay}.`,
};

export default function AboutPage() {
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
          <PageHeader title="Our Story" />
        </div>
      </div>

      <div className="section-padding">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-invert mx-auto">
            <p className="text-lg leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{SITE.name}</strong> is a barbershop at{" "}
              {SITE.address}. Haircuts from €13, traditional hot towel shaves, beard trims, head
              shaves, and family packages — all delivered with old-school craft in a vintage
              atmosphere.
            </p>

            <h2 className="font-heading mt-12 text-3xl font-light text-gold">The Shop</h2>
            <p className="leading-relaxed text-muted-foreground">
              Walk in and you&apos;ll see a wall of vintage signs, license plates, and barber
              memorabilia from across Europe — the kind of place where conversation flows as easily
              as the clippers. It&apos;s relaxed, local, and built for regulars from Xylophagou and
              across the Larnaca district.
            </p>

            <h2 className="font-heading mt-12 text-3xl font-light text-gold">Find Us</h2>
            <p className="leading-relaxed text-muted-foreground">
              {SITE.address}. Phone:{" "}
              <a href={`tel:${SITE.phone}`} className="text-gold hover:underline">
                {SITE.phoneDisplay}
              </a>
              . Email:{" "}
              <a href={`mailto:${SITE.email}`} className="text-gold hover:underline">
                {SITE.email}
              </a>
              . {OPENING_HOURS_SUMMARY}. Book online or call ahead.
            </p>
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" asChild className="gold-gradient border-0">
              <Link href="/booking">Book at {SITE.name}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
