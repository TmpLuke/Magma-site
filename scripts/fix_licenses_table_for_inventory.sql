-- Fix licenses table to work as pure inventory system
-- Remove NOT NULL constraints and unnecessary columns

-- Make customer_email nullable (for stock inventory)
ALTER TABLE licenses ALTER COLUMN customer_email DROP NOT NULL;

-- Make other columns nullable if they exist
DO $$ 
BEGIN
    -- Try to alter columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'licenses' AND column_name = 'order_id') THEN
        ALTER TABLE licenses ALTER COLUMN order_id DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'licenses' AND column_name = 'status') THEN
        ALTER TABLE licenses ALTER COLUMN status DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'licenses' AND column_name = 'expires_at') THEN
        ALTER TABLE licenses ALTER COLUMN expires_at DROP NOT NULL;
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'licenses'
ORDER BY ordinal_position;
