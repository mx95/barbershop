"use client";

import dynamic from "next/dynamic";

const ShopProductsSection = dynamic(
  () =>
    import("@/components/home/shop-products-section").then((mod) => ({
      default: mod.ShopProductsSection,
    })),
  {
    ssr: false,
    loading: () => (
      <section className="section-padding">
        <div className="mx-auto max-w-7xl py-12 text-center text-sm text-muted-foreground">
          Loading products…
        </div>
      </section>
    ),
  }
);

export function ShopProductsLoader() {
  return <ShopProductsSection />;
}
