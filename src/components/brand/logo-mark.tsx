import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const SIZES = {
  nav: {
    wrap: "h-14 w-14",
    img: "h-[86%] w-[86%]",
    border: "border-[3px]",
    padding: "p-0.5",
  },
  hero: {
    wrap: "h-44 w-44 sm:h-56 sm:w-56 lg:h-64 lg:w-64",
    img: "h-[90%] w-[90%]",
    border: "border-4",
    padding: "p-1",
  },
  footer: {
    wrap: "h-[4.5rem] w-[4.5rem]",
    img: "h-[86%] w-[86%]",
    border: "border-[3px]",
    padding: "p-0.5",
  },
} as const;

export function LogoMark({ size = "hero", className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-black/80",
        s.wrap,
        s.border,
        s.padding,
        "border-gold shadow-[0_0_0_6px_rgba(0,0,0,0.5),0_16px_48px_rgba(0,0,0,0.75)] ring-2 ring-gold/35",
        className
      )}
    >
      <Image
        src="/images/logo.png"
        alt={SITE.name}
        width={192}
        height={192}
        className={cn(s.img, "rounded-full object-contain")}
        priority={size === "hero"}
      />
    </div>
  );
}
