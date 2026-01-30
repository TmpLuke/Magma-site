-- ============================================
-- COMPLETE DATABASE FIX
-- Ensures all tables and columns exist
-- Run this ONCE to fix everything
-- ============================================

BEGIN;

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add gallery column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery TEXT[];

-- Add variant_id to licenses
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS variant_id UUID;

-- Add category_id to products (if not exists)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID;

-- ============================================================================
-- 2. FIX COUPONS TABLE SCHEMA
-- ============================================================================

-- Check if coupons table has wrong columns and fix it
DO $$
BEGIN
  -- Check if discount_percent exists (old schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'discount_percent'
  ) THEN
    -- Rename columns to match new schema
    ALTER TABLE coupons RENAME COLUMN discount_percent TO discount_value;
    ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percent';
  END IF;
  
  -- Check if valid_until exists (old schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'valid_until'
  ) THEN
    ALTER TABLE coupons RENAME COLUMN valid_until TO expires_at;
  END IF;
END $$;

-- Ensure coupons has all required columns
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percent';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- ============================================================================
-- 3. ADD FOREIGN KEY CONSTRAINTS (WITH ON DELETE SET NULL)
-- ============================================================================

-- Products -> Categories
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Licenses -> Products
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_product_id_fkey;
ALTER TABLE licenses ADD CONSTRAINT licenses_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Licenses -> Variants
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_variant_id_fkey;
ALTER TABLE licenses ADD CONSTRAINT licenses_variant_id_fkey 
  FOREIGN KEY (variant_id) REFERENCES product_pricing(id) ON DELETE SET NULL;

-- Licenses -> Orders
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_order_id_fkey;
ALTER TABLE licenses ADD CONSTRAINT licenses_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- Orders -> Products
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Feature Cards -> Products (CASCADE delete) - only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_cards') THEN
    ALTER TABLE feature_cards DROP CONSTRAINT IF EXISTS feature_cards_product_id_fkey;
    ALTER TABLE feature_cards ADD CONSTRAINT feature_cards_product_id_fkey 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Product Pricing -> Products (CASCADE delete) - only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_pricing') THEN
    ALTER TABLE product_pricing DROP CONSTRAINT IF EXISTS product_pricing_product_id_fkey;
    ALTER TABLE product_pricing ADD CONSTRAINT product_pricing_product_id_fkey 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_licenses_variant_id ON licenses(variant_id);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_product_pricing_product_id ON product_pricing(product_id);

-- ============================================================================
-- 5. ENSURE ALL TABLES HAVE UPDATED_AT COLUMN
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show products table structure
SELECT 'PRODUCTS TABLE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Show licenses table structure
SELECT 'LICENSES TABLE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'licenses'
ORDER BY ordinal_position;

-- Show coupons table structure
SELECT 'COUPONS TABLE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'coupons'
ORDER BY ordinal_position;

-- Show all foreign keys
SELECT 'FOREIGN KEYS:' as info;
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

SELECT '✅ DATABASE STRUCTURE FIXED!' as status;
