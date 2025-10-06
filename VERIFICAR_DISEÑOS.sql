-- ============================================
-- SCRIPT DE VERIFICACIÓN Y RECUPERACIÓN
-- ============================================
-- Ejecuta esto PRIMERO para ver qué pasó

-- 1. Verificar si los diseños siguen en la base de datos
SELECT 
    'Diseños en la BD' as tabla,
    COUNT(*) as total
FROM designs;

-- 2. Verificar si las imágenes siguen ahí
SELECT 
    'Imágenes en la BD' as tabla,
    COUNT(*) as total
FROM images;

-- 3. Ver los últimos 20 diseños (si existen)
SELECT 
    id,
    title,
    description,
    category_id,
    subcategory_id,
    created_at
FROM designs
ORDER BY created_at DESC
LIMIT 20;

-- 4. Verificar las tablas que existen
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('designs', 'categories', 'images', 'design_subcategories', 'design_categories');
