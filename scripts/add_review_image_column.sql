-- ============================================
-- ADD IMAGE URL COLUMN TO REVIEWS TABLE
-- Allows storing an image for reviews
-- ============================================

-- Add image_url column if it doesn't exist
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'image_url';
