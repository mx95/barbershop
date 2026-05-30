-- Guest booking fields and Spyros / Lambros barbers

ALTER TABLE appointments
  ALTER COLUMN customer_id DROP NOT NULL;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

UPDATE barbers SET active = FALSE
WHERE name IN ('Christos', 'Andreas', 'The Temple Of Men Team');

INSERT INTO barbers (name, title, bio, image_url) VALUES
  ('Spyros', 'Owner', 'Classic cuts, fades, and hot towel shaves.', '/images/shop-wall.jpg'),
  ('Lambros', 'Barber', 'Beard work and traditional barbering with precision.', '/images/shop-wall.jpg');
