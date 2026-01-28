-- Add display_order column to categories table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Check if categories table exists, if not create it
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add display_order column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Add RLS policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
  DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON categories;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Allow public read access to categories
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage categories (admin only in production)
CREATE POLICY "Allow authenticated users to manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE categories IS 'Product categories for organizing the store';
COMMENT ON COLUMN categories.name IS 'Display name of the category';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN categories.description IS 'Optional description of the category';
COMMENT ON COLUMN categories.image IS 'Optional image URL for the category';
COMMENT ON COLUMN categories.display_order IS 'Order in which categories should be displayed (lower numbers first)';
