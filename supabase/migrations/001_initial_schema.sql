-- The Temple of Men — Supabase Schema
-- Run this in your Supabase SQL editor

CREATE TYPE user_role AS ENUM ('customer', 'barber', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer',
  birthday DATE,
  loyalty_points INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barbers
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  service_id UUID NOT NULL REFERENCES services(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'confirmed',
  notes TEXT,
  check_in_code TEXT UNIQUE NOT NULL,
  checked_in_at TIMESTAMPTZ,
  reminder_email_sent BOOLEAN DEFAULT FALSE,
  reminder_sms_sent BOOLEAN DEFAULT FALSE,
  birthday_reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit history
CREATE TABLE visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  service_name TEXT NOT NULL,
  barber_name TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0
);

-- Loyalty rewards
CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  tier TEXT NOT NULL,
  reward_description TEXT NOT NULL,
  redeemed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barber availability (weekly schedule)
CREATE TABLE barber_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_barber ON appointments(barber_id);
CREATE INDEX idx_appointments_starts_at ON appointments(starts_at);
CREATE INDEX idx_appointments_check_in ON appointments(check_in_code);
CREATE INDEX idx_visit_history_customer ON visit_history(customer_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read services" ON services FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read barbers" ON barbers FOR SELECT USING (active = TRUE);

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Customers read own appointments" ON appointments FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "Customers create appointments" ON appointments FOR INSERT
  WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers update own appointments" ON appointments FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Barbers read all appointments" ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('barber', 'admin')));
CREATE POLICY "Barbers update appointments" ON appointments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('barber', 'admin')));

CREATE POLICY "Users read own visit history" ON visit_history FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "Users read own rewards" ON loyalty_rewards FOR SELECT
  USING (auth.uid() = customer_id);

-- Seed services (matches thetempleofmen.setmore.com)
INSERT INTO services (slug, name, description, duration, price, category) VALUES
  ('haircut', 'Haircut', 'Classic barber cut — clean, sharp, and tailored to your style.', 30, 13.00, 'Hair'),
  ('haircut-beard-trimming', 'Haircut & Beard Trimming', 'Full haircut plus beard shape and line-up in one session.', 40, 16.00, 'Packages'),
  ('beard-trimming', 'Beard Trimming', 'Beard trim and line-up with precise detailing.', 20, 5.00, 'Beard'),
  ('traditional-shave-hot-towel', 'Traditional Shave & Hot Towel', 'Straight-razor shave with hot towel prep — old-school barbering.', 30, 10.00, 'Shave'),
  ('head-shave-hot-towel', 'Head Shave & Hot Towel', 'Clean head shave finished with a relaxing hot towel ritual.', 30, 13.00, 'Shave'),
  ('wax', 'Wax', 'Quick wax for nose, ears, or brows.', 5, 2.00, 'Extras'),
  ('haircut-hot-towel-shave', 'Haircut & Hot Towel Shave', 'Complete session — haircut and traditional hot towel shave.', 60, 20.00, 'Packages'),
  ('head-shave-beard-trim', 'Head Shave & Beard Trim', 'Head shave paired with a precise beard trim.', 35, 16.00, 'Packages'),
  ('head-shave-shave-hot-towel', 'Head Shave & Shave Hot Towel', 'Head shave plus full hot towel shave experience.', 60, 20.00, 'Packages'),
  ('kids-haircut', 'Kids Haircut (under 12)', 'Haircut for children under 12 — patient, friendly, and precise.', 30, 10.00, 'Hair'),
  ('father-1-son', 'Father + 1 Son', 'Haircuts for dad and one son in a single booking.', 60, 25.00, 'Family'),
  ('father-2-sons', 'Father + 2 Sons', 'Haircuts for dad and two sons — great value for the family.', 90, 35.00, 'Family');

-- Seed default barber
INSERT INTO barbers (name, title, bio, image_url) VALUES
  ('The Temple Of Men Team', 'Barbers', 'Skilled barbers delivering classic cuts, hot towel shaves, and beard work in Xylophagou.', '/images/shop-wall.jpg');
