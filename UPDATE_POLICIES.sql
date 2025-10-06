-- ========================================
-- ACTUALIZAR POLÍTICAS RLS PARA AUTENTICACIÓN
-- ========================================
-- 
-- Ejecuta este script si YA ejecutaste SUPABASE_SETUP.sql
-- y ahora quieres activar la autenticación.
--
-- Si es la primera vez, ejecuta SUPABASE_SETUP.sql directamente.
-- ========================================

-- 1. ELIMINAR POLÍTICAS ANTIGUAS (que permitían todo)
-- ========================================

DROP POLICY IF EXISTS "Allow all to insert categories" ON categories;
DROP POLICY IF EXISTS "Allow all to update categories" ON categories;
DROP POLICY IF EXISTS "Allow all to delete categories" ON categories;

DROP POLICY IF EXISTS "Allow all to insert designs" ON designs;
DROP POLICY IF EXISTS "Allow all to update designs" ON designs;
DROP POLICY IF EXISTS "Allow all to delete designs" ON designs;

DROP POLICY IF EXISTS "Allow all to insert images" ON images;
DROP POLICY IF EXISTS "Allow all to update images" ON images;
DROP POLICY IF EXISTS "Allow all to delete images" ON images;

-- 2. CREAR POLÍTICAS NUEVAS (solo usuarios autenticados)
-- ========================================

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

-- ========================================
-- ✅ ¡POLÍTICAS ACTUALIZADAS!
-- ========================================
--
-- Ahora solo usuarios autenticados pueden:
-- - Crear categorías, diseños e imágenes
-- - Editar categorías, diseños e imágenes
-- - Eliminar categorías, diseños e imágenes
--
-- El público puede:
-- - Ver todas las categorías, diseños e imágenes
--
-- Próximo paso:
-- Crea un usuario administrador en:
-- Supabase Dashboard > Authentication > Users > Add User
-- ========================================
