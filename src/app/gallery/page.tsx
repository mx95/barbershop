"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/navbar";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { GalleryImage } from "@/lib/store/gallery";

export default function GalleryPage() {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetch("/api/gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setImages(d.images ?? []))
      .catch(() => setImages([]));
  }, []);

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title={t.pages.gallery.title}
          subtitle={t.pages.gallery.subtitle}
          className="mb-16"
        />

        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 md:grid-cols-4 lg:auto-rows-[250px]">
          {images.map((image, i) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-xl ${image.span}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="absolute bottom-4 left-4 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                {image.alt}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
