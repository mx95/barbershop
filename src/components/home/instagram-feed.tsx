"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { SITE } from "@/lib/constants";
import type { InstagramPost } from "@/lib/types";

const fallbackPosts = [
  { id: "1", caption: "Fresh fade 🔥", media_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80", permalink: "#", timestamp: "" },
  { id: "2", caption: "Hot towel ritual", media_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80", permalink: "#", timestamp: "" },
  { id: "3", caption: "The Temple", media_url: "/images/shop-wall.jpg", permalink: "#", timestamp: "" },
  { id: "4", caption: "Beard sculpt", media_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80", permalink: "#", timestamp: "" },
  { id: "5", caption: "Premium grooming", media_url: "https://images.unsplash.com/photo-1585747860715-2ba5b469c776?w=400&q=80", permalink: "#", timestamp: "" },
  { id: "6", caption: "Classic cut", media_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80", permalink: "#", timestamp: "" },
];

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>(fallbackPosts);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((data) => {
        if (data.posts?.length) setPosts(data.posts);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">Social</p>
          <h2 className="font-heading text-4xl font-light sm:text-5xl">Follow the Craft</h2>
          <a
            href={`https://instagram.com/${SITE.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-gold hover:underline"
          >
            <Camera className="h-4 w-4" />
            @{SITE.instagram}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((post, i) => (
            <motion.a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={post.media_url}
                alt={post.caption}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, 16vw"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="line-clamp-2 text-xs text-white">{post.caption}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
