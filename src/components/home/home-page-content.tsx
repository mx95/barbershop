"use client";

import { Hero } from "@/components/home/hero";
import { ShopProductsLoader } from "@/components/home/shop-products-loader";
import { AboutPreview } from "@/components/home/about-preview";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { CtaSection } from "@/components/home/cta-section";
import { useIntroMotion } from "@/lib/motion/intro-context";

export function HomePageContent() {
  const { cycle } = useIntroMotion();

  return (
    <div key={cycle}>
      <Hero />
      <ShopProductsLoader />
      <AboutPreview />
      <InstagramFeed />
      <CtaSection />
    </div>
  );
}
