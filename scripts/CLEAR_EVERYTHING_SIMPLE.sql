-- ============================================
-- CLEAR EVERYTHING - SIMPLE VERSION
-- Just deletes from tables that exist
-- Run this in Supabase SQL Editor
-- ============================================

-- Clear orders (always exists)
DELETE FROM orders;

-- Clear products (always exists)  
DELETE FROM products;

-- Try to clear other tables (won't error if they don't exist)
DO $$
BEGIN
  -- Try licenses
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'licenses') THEN
    DELETE FROM licenses;
    RAISE NOTICE '✅ Cleared licenses';
  END IF;
  
  -- Try categories
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    DELETE FROM categories;
    RAISE NOTICE '✅ Cleared categories';
  END IF;
  
  -- Try cart_items
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
    DELETE FROM cart_items;
    RAISE NOTICE '✅ Cleared cart_items';
  END IF;
  
  -- Try store_customers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_customers') THEN
    DELETE FROM store_customers;
    RAISE NOTICE '✅ Cleared store_customers';
  END IF;
  
  -- Try reviews
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    DELETE FROM reviews;
    RAISE NOTICE '✅ Cleared reviews';
  END IF;
  
  -- Try coupons
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupons') THEN
    DELETE FROM coupons;
    RAISE NOTICE '✅ Cleared coupons';
  END IF;
  
  -- Try feature_cards
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_cards') THEN
    DELETE FROM feature_cards;
    RAISE NOTICE '✅ Cleared feature_cards';
  END IF;
  
  -- Try team_members
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
    DELETE FROM team_members;
    RAISE NOTICE '✅ Cleared team_members';
  END IF;
  
  -- Try product_pricing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_pricing') THEN
    DELETE FROM product_pricing;
    RAISE NOTICE '✅ Cleared product_pricing';
  END IF;
  
  RAISE NOTICE '🎉 ALL DATA CLEARED!';
END $$;

-- Verify everything is empty
SELECT 'VERIFICATION - All tables should show 0 rows:' as status;

SELECT 
  'orders' as table_name, 
  COUNT(*) as row_count 
FROM orders
UNION ALL
SELECT 'products', COUNT(*) FROM products;
