-- ============================================
-- CHECK WHAT TABLES EXIST
-- Run this first to see what you have
-- ============================================

-- List all tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if specific tables exist
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') 
    THEN '✅ products exists' 
    ELSE '❌ products missing' 
  END as products_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') 
    THEN '✅ orders exists' 
    ELSE '❌ orders missing' 
  END as orders_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'licenses') 
    THEN '✅ licenses exists' 
    ELSE '❌ licenses missing' 
  END as licenses_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') 
    THEN '✅ categories exists' 
    ELSE '❌ categories missing' 
  END as categories_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_customers') 
    THEN '✅ store_customers exists' 
    ELSE '❌ store_customers missing' 
  END as customers_status;
