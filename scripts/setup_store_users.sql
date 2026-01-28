-- ============================================================================
-- STORE USERS (customer accounts)
-- ============================================================================
-- Run in Supabase SQL Editor. Idempotent.

CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE store_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE store_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE store_users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE store_users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_store_users_password_reset_token ON store_users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_store_users_created_at ON store_users(created_at DESC);

COMMENT ON TABLE store_users IS 'Customer/storefront accounts. Links to orders/licenses via customer_email.';
