import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: "Book your grooming session at The Temple of Men, Larnaca.",
};

export default function BookingPage() {
  return <BookingWizard />;
}
