import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
    ],
  },
  async headers() {
    const fallbackCss = [
      {
        source: "/fallback.css",
        headers: [{ key: "Content-Type", value: "text/css; charset=utf-8" }],
      },
    ];

    // Long-lived cache only in production — in dev it pins stale JS after code changes.
    if (process.env.NODE_ENV !== "production") {
      return fallbackCss;
    }

    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      ...fallbackCss,
    ];
  },
};

export default nextConfig;
