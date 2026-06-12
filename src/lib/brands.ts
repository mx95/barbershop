/** How to adapt each logo for the dark site background */
export type BrandLogoFilter = "mono" | "light-backdrop";

export const SHOP_BRANDS = [
  {
    id: "reuzel",
    name: "Reuzel",
    logo: "/images/brands/reuzel.svg",
    /** Black wordmark on transparent */
    logoFilter: "mono" as const,
  },
  {
    id: "lavish",
    name: "LaVish",
    logo: "/images/brands/lavish.png",
  },
  {
    id: "vkings",
    name: "Vkings",
    logo: "/images/brands/vkings.jpg",
    /** Black logo on white JPEG — show on a light badge (CSS invert breaks JPEGs) */
    logoFilter: "light-backdrop" as const,
  },
  {
    id: "muc",
    name: "MUC",
    logo: "/images/brands/muk.png",
  },
  {
    id: "keune",
    name: "KEUNE",
    logo: "/images/brands/keune.png",
    /** Dark mark on transparent/dark PNG */
    logoFilter: "mono" as const,
  },
] as const;

export function brandLogoClassName(logoFilter?: BrandLogoFilter): string {
  if (logoFilter === "mono") return "brightness-0 invert";
  return "";
}
