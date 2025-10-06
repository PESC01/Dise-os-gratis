-- ============================================
-- NUEVA ESTRUCTURA: 1 Categoría + Múltiples Subcategorías
-- ============================================
-- Este script reemplaza el anterior para permitir múltiples subcategorías

-- 1. Eliminar la tabla anterior si existe
DROP TABLE IF EXISTS design_categories;

-- 2. Modificar la tabla designs para asegurarnos que category_id sea obligatorio
-- (Opcional, solo si quieres que sea requerido)
-- ALTER TABLE designs ALTER COLUMN category_id SET NOT NULL;

-- 3. Crear nueva tabla para múltiples subcategorías
CREATE TABLE IF NOT EXISTS design_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(design_id, subcategory_id)
);

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_design_subcategories_design_id ON design_subcategories(design_id);
CREATE INDEX IF NOT EXISTS idx_design_subcategories_subcategory_id ON design_subcategories(subcategory_id);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE design_subcategories ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas para acceso público de lectura
DROP POLICY IF EXISTS "Allow public read access to design_subcategories" ON design_subcategories;
CREATE POLICY "Allow public read access to design_subcategories" ON design_subcategories
  FOR SELECT USING (true);

-- 7. Crear políticas para usuarios autenticados (admins)
DROP POLICY IF EXISTS "Allow authenticated users to insert design_subcategories" ON design_subcategories;
CREATE POLICY "Allow authenticated users to insert design_subcategories" ON design_subcategories
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update design_subcategories" ON design_subcategories;
CREATE POLICY "Allow authenticated users to update design_subcategories" ON design_subcategories
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete design_subcategories" ON design_subcategories;
CREATE POLICY "Allow authenticated users to delete design_subcategories" ON design_subcategories
  FOR DELETE TO authenticated USING (true);

-- 8. Migrar datos existentes de subcategory_id a design_subcategories
-- Esto mantiene tu subcategoría actual en la nueva tabla
INSERT INTO design_subcategories (design_id, subcategory_id)
SELECT id, subcategory_id
FROM designs
WHERE subcategory_id IS NOT NULL
ON CONFLICT (design_id, subcategory_id) DO NOTHING;

-- 9. Comentario documentando la tabla
COMMENT ON TABLE design_subcategories IS 'Tabla para relación many-to-many entre diseños y subcategorías. Permite que un diseño tenga múltiples subcategorías dentro de su categoría principal (category_id).';

-- 10. Verificación: Ver diseños con sus categorías y subcategorías
SELECT 
    d.id,
    d.title,
    c.name as categoria_principal,
    d.subcategory_id as subcategoria_antigua,
    array_agg(sc.name) FILTER (WHERE sc.name IS NOT NULL) as nuevas_subcategorias
FROM designs d
LEFT JOIN categories c ON d.category_id = c.id
LEFT JOIN design_subcategories ds ON d.id = ds.design_id
LEFT JOIN categories sc ON ds.subcategory_id = sc.id
GROUP BY d.id, d.title, c.name, d.subcategory_id
ORDER BY d.created_at DESC
LIMIT 10;
