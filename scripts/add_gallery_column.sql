-- ============================================
-- ADD GALLERY COLUMN TO PRODUCTS TABLE
-- Allows storing multiple images for products
-- ============================================

-- Add gallery column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gallery TEXT[];

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'gallery';

-- Show all columns in products table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
