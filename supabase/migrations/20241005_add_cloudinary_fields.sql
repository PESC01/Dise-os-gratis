-- Migration: Add Cloudinary fields to designs table
-- Date: 2024-10-05
-- Description: Adds cover_image_url and download_link fields for Cloudinary integration

-- Add cover_image_url column to store the optimized WebP image from Cloudinary
ALTER TABLE designs
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add download_link column to store the external download URL
ALTER TABLE designs
ADD COLUMN IF NOT EXISTS download_link TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN designs.cover_image_url IS 'URL de la imagen de portada optimizada en Cloudinary (formato WebP)';
COMMENT ON COLUMN designs.download_link IS 'Enlace externo de descarga del diseño (puede ser nube externa)';
