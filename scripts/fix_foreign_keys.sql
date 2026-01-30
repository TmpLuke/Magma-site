-- ============================================
-- FIX FOREIGN KEY CONSTRAINTS
-- Allow deletion of categories and products
-- Only runs if tables exist
-- ============================================

DO $$
BEGIN
  -- Check if products table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    -- Drop and recreate products foreign key
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
      ALTER TABLE products 
        ADD CONSTRAINT products_category_id_fkey 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE SET NULL;
      RAISE NOTICE '✅ products -> categories constraint updated';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ products table does not exist';
  END IF;

  -- Check if orders table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_id_fkey;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
      ALTER TABLE orders 
        ADD CONSTRAINT orders_product_id_fkey 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE SET NULL;
      RAISE NOTICE '✅ orders -> products constraint updated';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ orders table does not exist';
  END IF;

  -- Check if licenses table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'licenses') THEN
    ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_product_id_fkey;
    ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_order_id_fkey;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
      ALTER TABLE licenses 
        ADD CONSTRAINT licenses_product_id_fkey 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE SET NULL;
      RAISE NOTICE '✅ licenses -> products constraint updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
      ALTER TABLE licenses 
        ADD CONSTRAINT licenses_order_id_fkey 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE SET NULL;
      RAISE NOTICE '✅ licenses -> orders constraint updated';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ licenses table does not exist';
  END IF;

  -- Check if feature_cards table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_cards') THEN
    ALTER TABLE feature_cards DROP CONSTRAINT IF EXISTS feature_cards_product_id_fkey;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
      ALTER TABLE feature_cards 
        ADD CONSTRAINT feature_cards_product_id_fkey 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE;
      RAISE NOTICE '✅ feature_cards -> products constraint updated';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ feature_cards table does not exist';
  END IF;

  RAISE NOTICE '✅ Foreign key constraints updated successfully!';
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all foreign key constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
