-- Replace single team barber with two individual barbers
UPDATE barbers SET active = FALSE WHERE name = 'The Temple Of Men Team';

INSERT INTO barbers (name, title, bio, image_url) VALUES
  ('Spyros', 'Owner', 'Classic cuts, fades, and hot towel shaves.', '/images/shop-wall.jpg'),
  ('Lambros', 'Barber', 'Beard work and traditional barbering with precision.', '/images/shop-wall.jpg');
