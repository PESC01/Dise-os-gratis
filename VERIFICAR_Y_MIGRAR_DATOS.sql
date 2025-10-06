-- ============================================
-- SCRIPT DE VERIFICACIÓN Y MIGRACIÓN DE DATOS
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar si la tabla existe
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'design_categories';

-- 2. Verificar cuántos registros hay en design_categories
SELECT COUNT(*) as total_relations FROM design_categories;

-- 3. Ver cuántos diseños tienen category_id o subcategory_id
SELECT 
    COUNT(*) as designs_with_categories
FROM designs 
WHERE category_id IS NOT NULL OR subcategory_id IS NOT NULL;

-- 4. Migrar datos si aún no están (esto es seguro, usa ON CONFLICT)
-- Migrar category_id
INSERT INTO design_categories (design_id, category_id)
SELECT id, category_id
FROM designs
WHERE category_id IS NOT NULL
ON CONFLICT (design_id, category_id) DO NOTHING;

-- Migrar subcategory_id
INSERT INTO design_categories (design_id, category_id)
SELECT id, subcategory_id
FROM designs
WHERE subcategory_id IS NOT NULL
ON CONFLICT (design_id, category_id) DO NOTHING;

-- 5. Verificar los datos migrados
SELECT 
    d.id,
    d.title,
    d.category_id as old_category_id,
    d.subcategory_id as old_subcategory_id,
    array_agg(c.name) as new_categories
FROM designs d
LEFT JOIN design_categories dc ON d.id = dc.design_id
LEFT JOIN categories c ON dc.category_id = c.id
GROUP BY d.id, d.title, d.category_id, d.subcategory_id
ORDER BY d.created_at DESC
LIMIT 10;

-- 6. Estadísticas finales
SELECT 
    'Total diseños' as metrica,
    COUNT(*) as valor
FROM designs
UNION ALL
SELECT 
    'Diseños con categorías (old)',
    COUNT(*)
FROM designs 
WHERE category_id IS NOT NULL OR subcategory_id IS NOT NULL
UNION ALL
SELECT 
    'Relaciones en design_categories',
    COUNT(*)
FROM design_categories
UNION ALL
SELECT 
    'Diseños con múltiples categorías',
    COUNT(DISTINCT design_id)
FROM design_categories
GROUP BY design_id
HAVING COUNT(*) > 1;
