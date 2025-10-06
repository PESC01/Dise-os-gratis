-- Datos de ejemplo para probar el sistema
-- Ejecuta esto en el SQL Editor de Supabase después de crear las tablas

-- Insertar categorías principales
INSERT INTO categories (id, name, parent_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Prendas', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Tazas', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Posters', NULL);

-- Insertar subcategorías
INSERT INTO categories (id, name, parent_id) VALUES
  ('11111111-1111-1111-1111-111111111112', 'Dibujos', '11111111-1111-1111-1111-111111111111'),
  ('11111111-1111-1111-1111-111111111113', 'Coches', '11111111-1111-1111-1111-111111111111'),
  ('11111111-1111-1111-1111-111111111114', 'Frases', '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222223', 'Dibujos', '22222222-2222-2222-2222-222222222222'),
  ('22222222-2222-2222-2222-222222222224', 'Frases', '22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333334', 'Motivacionales', '33333333-3333-3333-3333-333333333333');

-- Insertar diseños de ejemplo
INSERT INTO designs (id, title, description, category_id, subcategory_id) VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    'Camiseta Abstracta Moderna',
    'Diseño abstracto con colores vibrantes perfecto para camisetas casuales',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111112'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    'Taza con Frase Motivacional',
    'Taza blanca con texto inspirador para comenzar el día',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222224'
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    'Camiseta Coche Vintage',
    'Diseño retro de coche clásico para amantes de los vehículos',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111113'
  );

-- Insertar imágenes de ejemplo (usando placeholder images)
INSERT INTO images (design_id, url, alt_text, display_order) VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    'Diseño abstracto colorido',
    0
  ),
  (
    '44444444-4444-4444-4444-444444444441',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
    'Vista alternativa del diseño',
    1
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
    'Taza con frase motivacional',
    0
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    'Coche vintage',
    0
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    'Vista lateral del coche',
    1
  );
