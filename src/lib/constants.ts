export const SITE = {
  name: "The Temple Of Men",
  tagline: "Premium Barbershop · Xylophagou, Larnaca",
  locationLine: "Xylophagou, Larnaca",
  description:
    "Classic cuts, hot towel shaves, and beard work at The Temple Of Men — a vintage barbershop on Mixalaki Vraximi in Xylophagou, Larnaca.",
  phone: "+35724044969",
  phoneDisplay: "24 044969",
  email: "onlyclassicnoshit@hotmail.com",
  /** Default inbox for shared booking calendar (override with BOOKING_CALENDAR_EMAIL) */
  bookingCalendarEmail: "onlyclassicnoshit@hotmail.com",
  address: "Mixalaki Vraximi 37, Xylophagou, Larnaka 7520",
  mapQuery: "Mixalaki+Vraximi+37+Xylophagou+Larnaka+7520",
  instagram: "thetempleofmen_barbershop",
  instagramUrl: "https://www.instagram.com/thetempleofmen_barbershop/",
  established: 2024,
  bookingHours: { open: 9, close: 19 },
  /** How far ahead customers can book (calendar + API). */
  bookingAdvanceMonths: 3,
  setmoreUrl: "https://thetempleofmen.setmore.com",
} as const;

/** 0 = Sunday … 6 = Saturday — matches Setmore opening hours */
export const CLOSED_DAYS = [0, 4] as const;

export const OPENING_HOURS = [
  { day: "Sunday", short: "Sun", hours: null },
  { day: "Monday", short: "Mon", hours: "9:00 – 19:00" },
  { day: "Tuesday", short: "Tue", hours: "9:00 – 19:00" },
  { day: "Wednesday", short: "Wed", hours: "9:00 – 19:00" },
  { day: "Thursday", short: "Thu", hours: null },
  { day: "Friday", short: "Fri", hours: "9:00 – 19:00" },
  { day: "Saturday", short: "Sat", hours: "9:00 – 19:00" },
] as const;

export const OPENING_HOURS_SUMMARY =
  "Mon–Wed & Fri–Sat: 9:00 – 19:00 · Closed Sun & Thu";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const SERVICES = [
  {
    id: "haircut",
    name: "Haircut",
    description: "Classic barber cut — clean, sharp, and tailored to your style.",
    duration: 30,
    price: 13,
    category: "Hair",
    popular: true,
  },
  {
    id: "haircut-beard-trimming",
    name: "Haircut & Beard Trimming",
    description: "Full haircut plus beard shape and line-up in one session.",
    duration: 40,
    price: 16,
    category: "Packages",
    popular: true,
  },
  {
    id: "beard-trimming",
    name: "Beard Trimming",
    description: "Beard trim and line-up with precise detailing.",
    duration: 20,
    price: 5,
    category: "Beard",
    popular: true,
  },
  {
    id: "traditional-shave-hot-towel",
    name: "Traditional Shave & Hot Towel",
    description: "Straight-razor shave with hot towel prep — old-school barbering.",
    duration: 30,
    price: 10,
    category: "Shave",
    popular: false,
  },
  {
    id: "head-shave-hot-towel",
    name: "Head Shave & Hot Towel",
    description: "Clean head shave finished with a relaxing hot towel ritual.",
    duration: 30,
    price: 13,
    category: "Shave",
    popular: false,
  },
  {
    id: "wax",
    name: "Wax",
    description: "Quick wax for nose, ears, or brows.",
    duration: 5,
    price: 2,
    category: "Extras",
    popular: false,
  },
  {
    id: "haircut-hot-towel-shave",
    name: "Haircut & Hot Towel Shave",
    description: "Complete session — haircut and traditional hot towel shave.",
    duration: 60,
    price: 20,
    category: "Packages",
    popular: true,
  },
  {
    id: "head-shave-beard-trim",
    name: "Head Shave & Beard Trim",
    description: "Head shave paired with a precise beard trim.",
    duration: 40,
    price: 16,
    category: "Packages",
    popular: false,
  },
  {
    id: "head-shave-shave-hot-towel",
    name: "Head Shave & Shave Hot Towel",
    description: "Head shave plus full hot towel shave experience.",
    duration: 60,
    price: 20,
    category: "Packages",
    popular: false,
  },
  {
    id: "kids-haircut",
    name: "Kids Haircut (under 12)",
    description: "Haircut for children under 12 — patient, friendly, and precise.",
    duration: 30,
    price: 10,
    category: "Hair",
    popular: false,
  },
  {
    id: "father-1-son",
    name: "Father + 1 Son",
    description: "Haircuts for dad and one son in a single booking.",
    duration: 60,
    price: 25,
    category: "Family",
    popular: true,
  },
  {
    id: "father-2-sons",
    name: "Father + 2 Sons",
    description: "Haircuts for dad and two sons — great value for the family.",
    duration: 90,
    price: 35,
    category: "Family",
    popular: false,
  },
] as const;

/** Shared shop hours — each barber has their own calendar; one barber’s booking does not block the other. */
export const BARBER_SCHEDULE = {
  days: [1, 2, 3, 5, 6] as const,
  open: SITE.bookingHours.open,
  close: SITE.bookingHours.close,
  slotMinutes: 5,
} as const;

export const BARBER_SCHEDULE_LABEL = "Mon–Wed, Fri & Sat · 9:00 – 19:00";

export const BARBERS = [
  {
    id: "spyros",
    name: "Spyros",
    title: "Owner",
    bio: "Classic cuts, fades, and hot towel shaves.",
    scheduleLabel: BARBER_SCHEDULE_LABEL,
    schedule: BARBER_SCHEDULE,
    image: "/images/barbers/spyros.jpg",
    imageFocus: "50% 35%",
  },
  {
    id: "lambros",
    name: "Lambros",
    title: "Barber",
    bio: "Beard work and traditional barbering with precision.",
    scheduleLabel: BARBER_SCHEDULE_LABEL,
    schedule: BARBER_SCHEDULE,
    image: "/images/barbers/lambros.jpg",
    imageFocus: "50% 35%",
  },
] as const;

export const LOYALTY_TIERS = [
  { name: "Bronze", visits: 5, reward: "10% off next visit" },
  { name: "Silver", visits: 15, reward: "Free beard trim" },
  { name: "Gold", visits: 30, reward: "Complimentary Haircut & Hot Towel Shave" },
] as const;

export const GALLERY_IMAGES = [
  { src: "/images/shop-wall.jpg", alt: "The Temple Of Men interior — vintage sign wall", span: "col-span-2 row-span-2" },
  { src: "/images/logo.png", alt: "The Temple Of Men logo", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1585747860715-2ba5b469c776?w=800&q=80", alt: "Premium barber chair", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80", alt: "Precision fade haircut", span: "col-span-1 row-span-2" },
  { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80", alt: "Hot towel shave ritual", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80", alt: "Barber tools and products", span: "col-span-2 row-span-1" },
] as const;
