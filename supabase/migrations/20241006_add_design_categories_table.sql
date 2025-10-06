-- Create design_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS design_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(design_id, category_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_design_categories_design_id ON design_categories(design_id);
CREATE INDEX IF NOT EXISTS idx_design_categories_category_id ON design_categories(category_id);

-- Enable Row Level Security (RLS)
ALTER TABLE design_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to design_categories" ON design_categories
  FOR SELECT USING (true);

-- Create policies for authenticated users (admins)
CREATE POLICY "Allow authenticated users to insert design_categories" ON design_categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update design_categories" ON design_categories
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete design_categories" ON design_categories
  FOR DELETE TO authenticated USING (true);

-- Migrate existing data from category_id and subcategory_id to design_categories table
-- This ensures backward compatibility and doesn't lose any existing data
INSERT INTO design_categories (design_id, category_id)
SELECT id, category_id
FROM designs
WHERE category_id IS NOT NULL
ON CONFLICT (design_id, category_id) DO NOTHING;

INSERT INTO design_categories (design_id, category_id)
SELECT id, subcategory_id
FROM designs
WHERE subcategory_id IS NOT NULL
ON CONFLICT (design_id, category_id) DO NOTHING;

-- Add comment to document the migration
COMMENT ON TABLE design_categories IS 'Junction table for many-to-many relationship between designs and categories. Replaces the single category_id and subcategory_id columns in designs table, but those columns are kept for backward compatibility during migration.';
