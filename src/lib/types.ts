export type UserRole = "customer" | "barber" | "admin";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  birthday: string | null;
  loyalty_points: number;
  total_visits: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
}

export interface Barber {
  id: string;
  profile_id: string;
  name: string;
  title: string;
  bio: string | null;
  image_url: string | null;
  active: boolean;
}

export interface Appointment {
  id: string;
  customer_id: string;
  barber_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  check_in_code: string;
  checked_in_at: string | null;
  reminder_email_sent: boolean;
  reminder_sms_sent: boolean;
  created_at: string;
  service?: Service;
  barber?: Barber;
  customer?: Profile;
}

export interface LoyaltyReward {
  id: string;
  customer_id: string;
  tier: string;
  reward_description: string;
  redeemed: boolean;
  created_at: string;
}

export interface VisitHistory {
  id: string;
  customer_id: string;
  appointment_id: string;
  visited_at: string;
  service_name: string;
  barber_name: string;
  points_earned: number;
}

export interface BookingFormData {
  serviceId: string;
  barberId: string;
  date: Date;
  time: string;
  notes?: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  media_url: string;
  permalink: string;
  timestamp: string;
}
