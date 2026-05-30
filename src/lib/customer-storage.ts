const CUSTOMER_KEY = "tom-customer";
const BOOKINGS_KEY = "tom-booking-ids";

export interface SavedCustomer {
  name: string;
  phone: string;
  email?: string;
}

export function loadSavedCustomer(): SavedCustomer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? (JSON.parse(raw) as SavedCustomer) : null;
  } catch {
    return null;
  }
}

export function saveCustomer(customer: SavedCustomer) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

export function loadBookingIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveBookingId(id: string) {
  const ids = loadBookingIds();
  if (!ids.includes(id)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify([id, ...ids]));
  }
}
