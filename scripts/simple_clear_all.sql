-- ============================================
-- SIMPLE CLEAR ALL DATA
-- Clears all data from existing tables
-- Safe - checks if tables exist first
-- ============================================

DO $$
DECLARE
  table_record RECORD;
BEGIN
  -- Get all tables in public schema
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
  LOOP
    -- Skip system tables
    IF table_record.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns') THEN
      BEGIN
        EXECUTE format('DELETE FROM %I', table_record.tablename);
        RAISE NOTICE '✅ Cleared table: %', table_record.tablename;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Could not clear %: %', table_record.tablename, SQLERRM;
      END;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ All data cleared!';
END $$;

-- Show what's left
SELECT 
  tablename as table_name,
  (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as exists
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
