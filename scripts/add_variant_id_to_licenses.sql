-- ============================================
-- ADD VARIANT_ID COLUMN TO LICENSES TABLE
-- Allows tracking which variant each license belongs to
-- ============================================

-- Add variant_id column if it doesn't exist
ALTER TABLE licenses 
ADD COLUMN IF NOT EXISTS variant_id UUID;

-- Add foreign key constraint (optional, but recommended)
ALTER TABLE licenses
DROP CONSTRAINT IF EXISTS licenses_variant_id_fkey;

ALTER TABLE licenses
ADD CONSTRAINT licenses_variant_id_fkey 
FOREIGN KEY (variant_id) 
REFERENCES product_pricing(id) 
ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_licenses_variant_id ON licenses(variant_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'licenses'
ORDER BY ordinal_position;
