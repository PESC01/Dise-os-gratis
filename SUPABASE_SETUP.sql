-- ========================================
-- SISTEMA CRUD - PRINT SHOWCASE
-- Ejecuta este código en Supabase SQL Editor
-- ========================================

-- 1. CREAR TABLAS
-- ========================================

-- Tabla de categorías (jerárquica)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de diseños
CREATE TABLE IF NOT EXISTS designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de imágenes
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CREAR ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_designs_category_id ON designs(category_id);
CREATE INDEX IF NOT EXISTS idx_designs_subcategory_id ON designs(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_images_design_id ON images(design_id);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE SEGURIDAD
-- ========================================

-- Políticas para LECTURA PÚBLICA (cualquiera puede ver)
CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to designs" ON designs
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to images" ON images
  FOR SELECT USING (true);

-- Políticas para ESCRITURA (solo usuarios autenticados)
-- IMPORTANTE: Solo administradores autenticados pueden crear/editar/eliminar

-- Categorías - Solo usuarios autenticados
CREATE POLICY "Allow authenticated users to insert categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories" ON categories
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete categories" ON categories
  FOR DELETE TO authenticated USING (true);

-- Diseños - Solo usuarios autenticados
CREATE POLICY "Allow authenticated users to insert designs" ON designs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update designs" ON designs
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete designs" ON designs
  FOR DELETE TO authenticated USING (true);

-- Imágenes - Solo usuarios autenticados
CREATE POLICY "Allow authenticated users to insert images" ON images
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update images" ON images
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete images" ON images
  FOR DELETE TO authenticated USING (true);

-- 5. TRIGGERS PARA UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ¡LISTO! Las tablas están creadas con autenticación.
-- ========================================
-- 
-- Próximos pasos:
-- 1. Crea un usuario administrador en Supabase Dashboard:
--    Authentication > Users > Add User
--    - Email: tu@email.com
--    - Password: (contraseña segura)
--    - Email Confirm: ON (marcar como confirmado)
-- 
-- 2. Luego podrás iniciar sesión en: http://localhost:5173/login
-- 
-- 3. Una vez autenticado, podrás acceder al panel de administración
--    y crear categorías y diseños.
-- 
-- IMPORTANTE: Solo usuarios autenticados pueden crear/editar/eliminar.
-- El público puede ver los diseños pero no modificarlos.
-- ========================================
