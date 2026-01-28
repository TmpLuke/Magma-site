-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add display_order to categories if missing (e.g. table created earlier without it)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add category_id column to products table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Insert some default categories (optional - you can skip this if you want to add manually)
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('CALL OF DUTY', 'call-of-duty', 'Call of Duty game cheats and hacks', 1),
  ('APEX LEGENDS', 'apex-legends', 'Apex Legends game cheats and hacks', 2),
  ('FORTNITE', 'fortnite', 'Fortnite game cheats and hacks', 3),
  ('RUST', 'rust', 'Rust game cheats and hacks', 4),
  ('BATTLEFIELD', 'battlefield', 'Battlefield game cheats and hacks', 5),
  ('ARC RAIDERS', 'arc-raiders', 'Arc Raiders game cheats and hacks', 6),
  ('DAYZ', 'dayz', 'DayZ game cheats and hacks', 7),
  ('DELTA FORCE', 'delta-force', 'Delta Force game cheats and hacks', 8)
ON CONFLICT (slug) DO NOTHING;

-- Update existing products to link them to categories based on their "game" field
-- This will try to match products to categories by game name
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE LOWER(p.game) = LOWER(c.name)
  AND p.category_id IS NULL;

-- Enable RLS (Row Level Security) for categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories table
-- Allow public to read categories
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

-- Allow service role full access to categories (for admin operations)
CREATE POLICY "Allow service role full access to categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE categories IS 'Product categories for organizing cheats by game';
COMMENT ON COLUMN categories.name IS 'Display name of the category (e.g., "CALL OF DUTY")';
COMMENT ON COLUMN categories.slug IS 'URL-friendly slug (e.g., "call-of-duty")';
COMMENT ON COLUMN categories.description IS 'Optional description of the category';
COMMENT ON COLUMN categories.image IS 'Optional image URL for the category';
COMMENT ON COLUMN categories.display_order IS 'Order in which categories should be displayed';
