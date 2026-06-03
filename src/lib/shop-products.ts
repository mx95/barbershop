export type ShopBrand = "Reuzel" | "LaVish" | "Vkings" | "MUC" | "KEUNE";

export type ShopProduct = {
  id: string;
  brand: ShopBrand;
  name: string;
  description: string;
  tags: readonly [string, string];
  image: string;
};

export const SHOP_PRODUCTS: readonly ShopProduct[] = [
  {
    id: "extreme-matte",
    brand: "Reuzel",
    name: "Extreme Hold Matte Pomade",
    description: "Maximum hold with a dry, matte finish. Washes out easily.",
    tags: ["Strong hold", "Matte"],
    image: "/images/products/extreme-matte.png",
  },
  {
    id: "clay-matte",
    brand: "Reuzel",
    name: "Clay Matte Pomade",
    description: "Lightweight texture with medium, flexible hold.",
    tags: ["Medium hold", "Matte"],
    image: "/images/products/clay-matte.png",
  },
  {
    id: "fiber",
    brand: "Reuzel",
    name: "Fiber Pomade",
    description: "Adds texture and volume with firm, flexible hold.",
    tags: ["Firm hold", "Low shine"],
    image: "/images/products/fiber.png",
  },
  {
    id: "red",
    brand: "Reuzel",
    name: "Red Water Soluble Pomade",
    description: "Classic high-shine look with medium hold for every hair type.",
    tags: ["Medium hold", "High shine"],
    image: "/images/products/red.png",
  },
  {
    id: "lavish-mask",
    brand: "LaVish",
    name: "Keratin Repair Mask",
    description: "Deep conditioning treatment for strength, shine, and manageability.",
    tags: ["Treatment", "Repair"],
    image: "/images/products/lavish-mask.svg",
  },
  {
    id: "lavish-mousse",
    brand: "LaVish",
    name: "Volume Styling Mousse",
    description: "Lightweight lift and body without weighing hair down.",
    tags: ["Volume", "Styling"],
    image: "/images/products/lavish-mousse.svg",
  },
  {
    id: "vkings-clay",
    brand: "Vkings",
    name: "Matte Styling Clay",
    description: "Strong matte finish with reworkable texture for modern cuts.",
    tags: ["Strong hold", "Matte"],
    image: "/images/products/vkings-clay.svg",
  },
  {
    id: "vkings-balm",
    brand: "Vkings",
    name: "Beard & Hair Balm",
    description: "Conditions beard and hair while taming flyaways with a natural finish.",
    tags: ["Beard care", "Nourish"],
    image: "/images/products/vkings-balm.svg",
  },
  {
    id: "muc-wax",
    brand: "MUC",
    name: "Matte Styling Wax",
    description: "Flexible hold wax for textured, natural-looking styles.",
    tags: ["Medium hold", "Matte"],
    image: "/images/products/muc-wax.svg",
  },
  {
    id: "muc-spray",
    brand: "MUC",
    name: "Sea Salt Texturizing Spray",
    description: "Beach-inspired texture and grip — perfect for loose, lived-in looks.",
    tags: ["Texture", "Finish"],
    image: "/images/products/muc-spray.svg",
  },
  {
    id: "keune-shampoo",
    brand: "KEUNE",
    name: "Care Nourishing Shampoo",
    description: "Salon-grade cleanse that balances scalp and hair without stripping.",
    tags: ["Daily care", "Nourish"],
    image: "/images/products/keune-shampoo.svg",
  },
  {
    id: "keune-gel",
    brand: "KEUNE",
    name: "Ultimate Style Gel",
    description: "High-shine control with strong hold for slick backs and sharp lines.",
    tags: ["Strong hold", "Shine"],
    image: "/images/products/keune-gel.svg",
  },
  {
    id: "blue",
    brand: "Reuzel",
    name: "Blue High Shine Pomade",
    description: "Strong hold and high shine — ideal for thicker hair.",
    tags: ["Strong hold", "High shine"],
    image: "/images/products/blue.png",
  },
  {
    id: "pink",
    brand: "Reuzel",
    name: "Pink Pomade Grease",
    description: "Classic oil-based pomade with high hold for thick or curly hair.",
    tags: ["High hold", "Classic"],
    image: "/images/products/pink.png",
  },
] as const;

export const PRODUCTS_SECTION_COPY = {
  en: {
    eyebrow: "In the Shop",
    title: "Premium Styling",
    subtitle:
      "Reuzel, LaVish, Vkings, MUC, and KEUNE — professional products available when you visit The Temple Of Men.",
    availableAtShop: "Available at the barbershop",
    partnerNote: "Ask your barber which product suits your hair and style.",
    swipeHint: "Swipe sideways to browse",
    scrollPrev: "Previous product",
    scrollNext: "Next product",
  },
  el: {
    eyebrow: "Στο κατάστημα",
    title: "Premium Styling",
    subtitle:
      "Reuzel, LaVish, Vkings, MUC και KEUNE — επαγγελματικά προϊόντα διαθέσιμα στο The Temple Of Men.",
    availableAtShop: "Διαθέσιμο στο μπαρμπέρικο",
    partnerNote: "Ρωτήστε τον κουρέα σας ποιο προϊόν ταιριάζει στο μαλλί και το στυλ σας.",
    swipeHint: "Σύρετε οριζόντια για περισσότερα",
    scrollPrev: "Προηγούμενο προϊόν",
    scrollNext: "Επόμενο προϊόν",
  },
} as const;
