-- ============================================
-- MIGRACIÓN SIMPLE DE DATOS
-- ============================================
-- Solo ejecuta esto si ya tienes la tabla design_categories creada
-- Este script es seguro y no duplicará datos

-- Migrar datos de category_id a design_categories
INSERT INTO design_categories (design_id, category_id)
SELECT id, category_id
FROM designs
WHERE category_id IS NOT NULL
ON CONFLICT (design_id, category_id) DO NOTHING;

-- Migrar datos de subcategory_id a design_categories
INSERT INTO design_categories (design_id, category_id)
SELECT id, subcategory_id
FROM designs
WHERE subcategory_id IS NOT NULL
ON CONFLICT (design_id, category_id) DO NOTHING;

-- Ver resultados
SELECT 
    'Migración completada' as status,
    COUNT(*) as total_relaciones
FROM design_categories;
