-- URGENT FIX: Create categories table
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- ============================================================================
-- CREATE CATEGORIES TABLE
-- ============================================================================
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

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (ignore errors if they don't exist)
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

-- Allow authenticated users to manage categories
CREATE POLICY "Allow authenticated users to manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================
COMMENT ON TABLE categories IS 'Product categories for organizing the store';
COMMENT ON COLUMN categories.id IS 'Unique identifier';
COMMENT ON COLUMN categories.name IS 'Display name of the category';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN categories.description IS 'Optional description of the category';
COMMENT ON COLUMN categories.image IS 'Optional image URL for the category';
COMMENT ON COLUMN categories.display_order IS 'Order in which categories should be displayed (lower numbers first)';

-- ============================================================================
-- VERIFY
-- ============================================================================
-- Check if table was created successfully
SELECT 'Categories table created successfully!' AS status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;
