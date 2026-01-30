-- ============================================
-- INSPECT YOUR DATABASE
-- Run this to see what you actually have
-- ============================================

-- 1. List all tables
SELECT 'TABLES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Show products table structure
SELECT 'PRODUCTS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. Show orders table structure
SELECT 'ORDERS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 4. Show licenses table structure (if exists)
SELECT 'LICENSES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'licenses'
ORDER BY ordinal_position;

-- 5. Show categories table structure (if exists)
SELECT 'CATEGORIES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- 6. Show all foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS:' as info;
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column,
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

-- 7. Count rows in each table
SELECT 'ROW COUNTS:' as info;
SELECT 
  'products' as table_name, 
  COUNT(*) as row_count 
FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'categories', COUNT(*) 
FROM categories
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories')
UNION ALL
SELECT 'licenses', COUNT(*) 
FROM licenses
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'licenses');
