"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useIntroMotion } from "@/lib/motion/intro-context";

const HARLEY_SESSION_KEY = "tom-harley-played";

/** Matches shop-wall.jpg (1024×768) — same crop as hero `object-cover`. */
const WALL_VIEWBOX = { w: 1024, h: 768 } as const;

/**
 * Diagonal black line: lower-left → through logo/title → top-right.
 * Three points keep the bike centered on the line in the hero crop.
 */
const RIDE_PATH_D = "M 168 712 L 512 408 L 968 52";

const RIDE_MS = 12000;

const BIKE_W = 24;
const BIKE_H = 20;
const BIKE_ANCHOR_X = BIKE_W * 0.48;
const BIKE_ANCHOR_Y = BIKE_H * 0.92;

const HARLEY_SRC = "/images/harley-cruise.png";

export function HarleyCruise() {
  const pathRef = useRef<SVGPathElement>(null);
  const bikeRef = useRef<SVGGElement>(null);
  const { introReady } = useIntroMotion();
  const reduceMotion = useReducedMotion();
  const [playOnce, setPlayOnce] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(HARLEY_SESSION_KEY)) return;
    setPlayOnce(true);
  }, []);

  useEffect(() => {
    if (!introReady || !playOnce || reduceMotion) return;

    let raf = 0;
    let start = performance.now();
    let finished = false;

    const tick = (now: number) => {
      if (finished) return;

      const path = pathRef.current;
      const bike = bikeRef.current;
      if (!path || !bike) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - start;
      if (elapsed >= RIDE_MS) {
        bike.setAttribute("opacity", "0");
        sessionStorage.setItem(HARLEY_SESSION_KEY, "1");
        finished = true;
        setPlayOnce(false);
        return;
      }

      const t = elapsed / RIDE_MS;
      const len = path.getTotalLength();
      const at = t * len;
      const p = path.getPointAtLength(at);
      const ahead = path.getPointAtLength(Math.min(len, at + 5));
      const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;

      bike.setAttribute(
        "transform",
        `translate(${p.x} ${p.y}) rotate(${angle}) translate(${-BIKE_ANCHOR_X} ${-BIKE_ANCHOR_Y})`
      );

      const fadeIn = Math.min(1, t / 0.06);
      const fadeOut = t > 0.94 ? (1 - t) / 0.06 : 1;
      bike.setAttribute("opacity", String(Math.min(fadeIn, fadeOut)));

      raf = requestAnimationFrame(tick);
    };

    start = performance.now();
    raf = requestAnimationFrame(tick);
    return () => {
      finished = true;
      cancelAnimationFrame(raf);
    };
  }, [introReady, playOnce, reduceMotion]);

  if (!introReady || !playOnce || reduceMotion) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      viewBox={`0 0 ${WALL_VIEWBOX.w} ${WALL_VIEWBOX.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <path ref={pathRef} d={RIDE_PATH_D} fill="none" stroke="none" />
      <g ref={bikeRef} opacity="0">
        <image
          href={HARLEY_SRC}
          width={BIKE_W}
          height={BIKE_H}
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    </svg>
  );
}
