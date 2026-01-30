-- ============================================
-- 🚀 PRODUCTION CLEANUP SCRIPT
-- Clear all test/placeholder data before launch
-- Run this in Supabase SQL Editor
-- ============================================

-- NOTE: This script checks if tables exist before trying to delete
-- Safe to run even if some tables don't exist yet

DO $$
BEGIN
  -- 1. Clear all orders (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    DELETE FROM orders WHERE customer_email LIKE '%example.com%' OR customer_email LIKE '%test%';
    -- DELETE FROM orders; -- Uncomment to clear ALL orders
    RAISE NOTICE '✅ Orders cleared';
  ELSE
    RAISE NOTICE '⚠️ orders table does not exist';
  END IF;

  -- 2. Clear all licenses (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'licenses') THEN
    DELETE FROM licenses WHERE customer_email LIKE '%example.com%' OR customer_email LIKE '%test%';
    -- DELETE FROM licenses; -- Uncomment to clear ALL licenses
    RAISE NOTICE '✅ Licenses cleared';
  ELSE
    RAISE NOTICE '⚠️ licenses table does not exist';
  END IF;

  -- 3. Clear all cart items (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
    DELETE FROM cart_items;
    RAISE NOTICE '✅ Cart items cleared';
  ELSE
    RAISE NOTICE '⚠️ cart_items table does not exist';
  END IF;

  -- 4. Clear all store customers (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_customers') THEN
    DELETE FROM store_customers WHERE email LIKE '%example.com%' OR email LIKE '%test%';
    -- DELETE FROM store_customers; -- Uncomment to clear ALL customers
    RAISE NOTICE '✅ Store customers cleared';
  ELSE
    RAISE NOTICE '⚠️ store_customers table does not exist';
  END IF;

  -- 5. Clear test coupons (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupons') THEN
    DELETE FROM coupons WHERE code LIKE '%TEST%' OR code LIKE '%DEMO%';
    RAISE NOTICE '✅ Test coupons cleared';
  ELSE
    RAISE NOTICE '⚠️ coupons table does not exist';
  END IF;

  -- 6. Clear team members (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
    DELETE FROM team_members WHERE email LIKE '%magma.local%';
    RAISE NOTICE '✅ Test team members cleared';
  ELSE
    RAISE NOTICE '⚠️ team_members table does not exist';
  END IF;

END $$;

-- ============================================
-- ✅ VERIFICATION QUERIES
-- Run these to confirm cleanup
-- ============================================

-- Check orders (should be 0)
SELECT COUNT(*) as order_count FROM orders;

-- Check licenses (should be 0)
SELECT COUNT(*) as license_count FROM licenses;

-- Check cart items (should be 0)
SELECT COUNT(*) as cart_count FROM cart_items;

-- Check store customers (should be 0)
SELECT COUNT(*) as customer_count FROM store_customers;

-- Check reviews
SELECT COUNT(*) as review_count FROM reviews;

-- Check products (should show your real products only)
SELECT id, name, price, status, created_at FROM products ORDER BY created_at;

-- Check coupons
SELECT code, discount_type, discount_value, is_active FROM coupons;

-- ============================================
-- 📊 FINAL PRODUCTION CHECKLIST
-- ============================================

-- [ ] All test orders cleared
-- [ ] All test licenses cleared
-- [ ] All cart items cleared
-- [ ] All test customers cleared
-- [ ] Products are real (not test/demo)
-- [ ] Reviews are real (or cleared)
-- [ ] Coupons are real (or cleared)
-- [ ] Team members are real
-- [ ] Environment variables are production values
-- [ ] MoneyMotion webhook is configured
-- [ ] Email sending is configured (Resend)
-- [ ] Admin password is secure
-- [ ] SSL/HTTPS is enabled
-- [ ] Domain is configured
