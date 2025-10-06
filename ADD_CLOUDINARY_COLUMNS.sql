-- ============================================
-- EJECUTAR ESTO EN SUPABASE SQL EDITOR
-- ============================================
-- Este script añade las columnas necesarias para Cloudinary
-- a la tabla designs si no existen

-- Añadir columna cover_image_url
ALTER TABLE designs
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Añadir columna download_link
ALTER TABLE designs
ADD COLUMN IF NOT EXISTS download_link TEXT;

-- Verificar que las columnas se añadieron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'designs'
AND column_name IN ('cover_image_url', 'download_link');
